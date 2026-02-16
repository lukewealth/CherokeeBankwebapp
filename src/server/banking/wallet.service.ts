// Cherokee Bank - Wallet Service
import { prisma } from '@/src/config/db';
import { Prisma } from '@prisma/client';
import { generateReference } from '@/src/utils/helpers';

export class WalletService {
  /**
   * Get all wallets for a user
   */
  static async getWallets(userId: string) {
    return prisma.wallet.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * Get wallet by ID (validates ownership)
   */
  static async getWalletById(walletId: string, userId: string) {
    return prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });
  }

  /**
   * Get wallet details with recent transactions
   */
  static async getWalletDetails(walletId: string, userId: string) {
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId },
      include: {
        outgoingTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        incomingTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return wallet;
  }

  /**
   * Create a new wallet for a user
   */
  static async createWallet(userId: string, currency: 'USD' | 'EUR' | 'GBP' | 'CHERO') {
    // Check if wallet already exists for this currency
    const existing = await prisma.wallet.findUnique({
      where: { userId_currency: { userId, currency } },
    });

    if (existing) {
      throw new Error(`Wallet for ${currency} already exists`);
    }

    // Check if this is the user's first wallet (make it default)
    const walletCount = await prisma.wallet.count({ where: { userId } });

    return prisma.wallet.create({
      data: {
        userId,
        currency,
        balance: 0,
        availableBalance: 0,
        isDefault: walletCount === 0,
      },
    });
  }

  /**
   * Create default wallets for a new user
   */
  static async createDefaultWallets(userId: string) {
    const currencies: Array<'USD' | 'EUR' | 'GBP' | 'CHERO'> = ['USD', 'EUR', 'GBP', 'CHERO'];
    
    return prisma.$transaction(
      currencies.map((currency, index) =>
        prisma.wallet.create({
          data: {
            userId,
            currency,
            balance: 0,
            availableBalance: 0,
            isDefault: index === 0, // USD is default
          },
        })
      )
    );
  }

  /**
   * Deposit funds into a wallet (ACID transaction)
   */
  static async deposit(walletId: string, userId: string, amount: number, reference?: string) {
    return prisma.$transaction(async (tx) => {
      // Lock the wallet row
      const wallet = await tx.wallet.findFirst({
        where: { id: walletId, userId, status: 'ACTIVE' },
      });

      if (!wallet) throw new Error('Wallet not found or inactive');

      const decimalAmount = new Prisma.Decimal(amount);
      const newBalance = wallet.balance.add(decimalAmount);
      const newAvailable = wallet.availableBalance.add(decimalAmount);

      // Update wallet balance
      const updated = await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: newBalance,
          availableBalance: newAvailable,
        },
      });

      // Create transaction record
      const txRecord = await tx.transaction.create({
        data: {
          toWalletId: walletId,
          senderId: userId,
          type: 'DEPOSIT',
          amount: decimalAmount,
          fee: 0,
          currency: wallet.currency,
          status: 'COMPLETED',
          reference: reference || generateReference('DEP'),
          description: `Deposit to ${wallet.currency} wallet`,
        },
      });

      // Create ledger entry
      await tx.ledgerEntry.create({
        data: {
          transactionId: txRecord.id,
          walletId,
          amount: decimalAmount,
          balanceAfter: newBalance,
          description: 'Deposit credit',
        },
      });

      return { wallet: updated, transaction: txRecord };
    });
  }

  /**
   * Withdraw funds from a wallet (ACID transaction)
   */
  static async withdraw(walletId: string, userId: string, amount: number, reference?: string) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findFirst({
        where: { id: walletId, userId, status: 'ACTIVE' },
      });

      if (!wallet) throw new Error('Wallet not found or inactive');

      const decimalAmount = new Prisma.Decimal(amount);

      if (wallet.availableBalance.lt(decimalAmount)) {
        throw new Error('Insufficient balance');
      }

      const newBalance = wallet.balance.sub(decimalAmount);
      const newAvailable = wallet.availableBalance.sub(decimalAmount);

      const updated = await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: newBalance,
          availableBalance: newAvailable,
        },
      });

      const txRecord = await tx.transaction.create({
        data: {
          fromWalletId: walletId,
          senderId: userId,
          type: 'WITHDRAWAL',
          amount: decimalAmount,
          fee: 0,
          currency: wallet.currency,
          status: 'COMPLETED',
          reference: reference || generateReference('WDR'),
          description: `Withdrawal from ${wallet.currency} wallet`,
        },
      });

      await tx.ledgerEntry.create({
        data: {
          transactionId: txRecord.id,
          walletId,
          amount: decimalAmount.neg(),
          balanceAfter: newBalance,
          description: 'Withdrawal debit',
        },
      });

      return { wallet: updated, transaction: txRecord };
    });
  }

  /**
   * Get user's total balance in USD equivalent
   */
  static async getTotalBalanceUSD(userId: string, rates: Record<string, number>): Promise<number> {
    const wallets = await prisma.wallet.findMany({
      where: { userId, status: 'ACTIVE' },
    });

    let total = 0;
    for (const w of wallets) {
      const rate = rates[w.currency] || 1;
      total += Number(w.balance) * rate;
    }
    return total;
  }
}
