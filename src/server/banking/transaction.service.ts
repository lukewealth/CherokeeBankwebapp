// Cherokee Bank - Transaction Service
import { prisma } from '@/src/config/db';
import { Prisma } from '@prisma/client';
import { generateReference } from '@/src/utils/helpers';
import type { TransactionFilter } from '@/src/types/transaction';

export class TransactionService {
  /**
   * Execute a P2P transfer between wallets (ACID, double-entry)
   */
  static async createTransfer(
    fromWalletId: string,
    toWalletId: string,
    senderId: string,
    amount: number,
    description?: string,
    riskScore?: number
  ) {
    return prisma.$transaction(async (tx) => {
      // Get source wallet
      const fromWallet = await tx.wallet.findFirst({
        where: { id: fromWalletId, userId: senderId, status: 'ACTIVE' },
      });
      if (!fromWallet) throw new Error('Source wallet not found or inactive');

      // Get destination wallet
      const toWallet = await tx.wallet.findUnique({
        where: { id: toWalletId },
      });
      if (!toWallet) throw new Error('Destination wallet not found');
      if (toWallet.status !== 'ACTIVE') throw new Error('Destination wallet is not active');

      // Same currency check
      if (fromWallet.currency !== toWallet.currency) {
        throw new Error('Currency mismatch. Use conversion endpoint for different currencies.');
      }

      const decimalAmount = new Prisma.Decimal(amount);
      const fee = new Prisma.Decimal(0); // P2P transfers are free

      // Balance check
      if (fromWallet.availableBalance.lt(decimalAmount.add(fee))) {
        throw new Error('Insufficient balance');
      }

      // Determine transaction status based on risk score
      const status = riskScore && riskScore > 70 ? 'FLAGGED' : 'COMPLETED';

      // Debit source wallet
      const fromNewBalance = fromWallet.balance.sub(decimalAmount).sub(fee);
      const fromNewAvailable = fromWallet.availableBalance.sub(decimalAmount).sub(fee);
      await tx.wallet.update({
        where: { id: fromWalletId },
        data: { balance: fromNewBalance, availableBalance: fromNewAvailable },
      });

      // Credit destination wallet (only if not flagged)
      let toNewBalance = toWallet.balance;
      let toNewAvailable = toWallet.availableBalance;
      if (status === 'COMPLETED') {
        toNewBalance = toWallet.balance.add(decimalAmount);
        toNewAvailable = toWallet.availableBalance.add(decimalAmount);
        await tx.wallet.update({
          where: { id: toWalletId },
          data: { balance: toNewBalance, availableBalance: toNewAvailable },
        });
      }

      // Create transaction record
      const txRecord = await tx.transaction.create({
        data: {
          fromWalletId,
          toWalletId,
          senderId,
          type: 'TRANSFER',
          amount: decimalAmount,
          fee,
          currency: fromWallet.currency,
          status: status as never,
          reference: generateReference('TXN'),
          description: description || `Transfer to wallet`,
          riskScore,
        },
      });

      // Ledger entries (double-entry bookkeeping)
      await tx.ledgerEntry.createMany({
        data: [
          {
            transactionId: txRecord.id,
            walletId: fromWalletId,
            amount: decimalAmount.neg(),
            balanceAfter: fromNewBalance,
            description: 'Transfer debit',
          },
          ...(status === 'COMPLETED'
            ? [
                {
                  transactionId: txRecord.id,
                  walletId: toWalletId,
                  amount: decimalAmount,
                  balanceAfter: toNewBalance,
                  description: 'Transfer credit',
                },
              ]
            : []),
        ],
      });

      return txRecord;
    });
  }

  /**
   * List transactions with filters and pagination
   */
  static async listTransactions(userId: string, filters: TransactionFilter) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Get user's wallet IDs
    const walletIds = await prisma.wallet.findMany({
      where: { userId },
      select: { id: true },
    }).then((w) => w.map((w) => w.id));

    const where: Prisma.TransactionWhereInput = {
      OR: [
        { fromWalletId: { in: walletIds } },
        { toWalletId: { in: walletIds } },
        { senderId: userId },
      ],
      ...(filters.type && { type: filters.type as never }),
      ...(filters.status && { status: filters.status as never }),
      ...(filters.currency && { currency: filters.currency }),
      ...(filters.dateFrom && { createdAt: { gte: new Date(filters.dateFrom as unknown as string) } }),
      ...(filters.dateTo && { createdAt: { lte: new Date(filters.dateTo as unknown as string) } }),
      ...(filters.minAmount && { amount: { gte: filters.minAmount } }),
      ...(filters.maxAmount && { amount: { lte: filters.maxAmount } }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          fromWallet: { select: { id: true, currency: true, user: { select: { firstName: true, lastName: true } } } },
          toWallet: { select: { id: true, currency: true, user: { select: { firstName: true, lastName: true } } } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single transaction with full details
   */
  static async getTransaction(transactionId: string, userId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        fromWallet: {
          select: {
            id: true,
            currency: true,
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        toWallet: {
          select: {
            id: true,
            currency: true,
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        fraudReport: true,
        ledgerEntries: true,
      },
    });

    if (!transaction) return null;

    // Verify user has access to this transaction
    const userWalletIds = await prisma.wallet.findMany({
      where: { userId },
      select: { id: true },
    }).then((w) => w.map((w) => w.id));

    const hasAccess =
      transaction.senderId === userId ||
      (transaction.fromWalletId && userWalletIds.includes(transaction.fromWalletId)) ||
      (transaction.toWalletId && userWalletIds.includes(transaction.toWalletId));

    if (!hasAccess) return null;

    return transaction;
  }

  /**
   * Get recent transactions for dashboard
   */
  static async getRecentTransactions(userId: string, limit: number = 5) {
    const walletIds = await prisma.wallet.findMany({
      where: { userId },
      select: { id: true },
    }).then((w) => w.map((w) => w.id));

    return prisma.transaction.findMany({
      where: {
        OR: [
          { fromWalletId: { in: walletIds } },
          { toWalletId: { in: walletIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        fromWallet: { select: { currency: true, user: { select: { firstName: true, lastName: true } } } },
        toWallet: { select: { currency: true, user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }
}
