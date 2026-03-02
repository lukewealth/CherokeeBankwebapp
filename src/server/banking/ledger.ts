// Cherokee Bank - Double-Entry Ledger
import { prisma } from '@/src/config/db';
import { Prisma } from '@prisma/client';

export class Ledger {
  /**
   * Create a ledger entry within a Prisma transaction
   */
  static async createEntry(
    tx: Prisma.TransactionClient,
    transactionId: string,
    walletId: string,
    amount: Prisma.Decimal,
    balanceAfter: Prisma.Decimal,
    description?: string
  ) {
    return tx.ledgerEntry.create({
      data: {
        transactionId,
        walletId,
        amount,
        balanceAfter,
        description,
      },
    });
  }

  /**
   * Get ledger entries for a wallet
   */
  static async getWalletLedger(walletId: string, limit: number = 50, offset: number = 0) {
    return prisma.ledgerEntry.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        transaction: {
          select: { type: true, reference: true, status: true, description: true },
        },
      },
    });
  }

  /**
   * Verify ledger consistency for a wallet
   * Returns true if all entries are consistent
   */
  static async verifyWalletLedger(walletId: string): Promise<{ consistent: boolean; discrepancy?: number }> {
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw new Error('Wallet not found');

    const entries = await prisma.ledgerEntry.findMany({
      where: { walletId },
      orderBy: { createdAt: 'asc' },
    });

    if (entries.length === 0) {
      const isZero = wallet.balance.eq(new Prisma.Decimal(0));
      return { consistent: isZero, discrepancy: isZero ? undefined : Number(wallet.balance) };
    }

    // Sum all ledger entries
    let runningBalance = new Prisma.Decimal(0);
    for (const entry of entries) {
      runningBalance = runningBalance.add(entry.amount);
    }

    const currentBalance = wallet.balance;
    const consistent = runningBalance.eq(currentBalance);

    return {
      consistent,
      discrepancy: consistent ? undefined : Number(currentBalance.sub(runningBalance)),
    };
  }
}
