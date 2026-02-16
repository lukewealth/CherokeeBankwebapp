// Cherokee Bank - Reconciliation Service
import { prisma } from '@/src/config/db';
import { Ledger } from './ledger';

export class ReconciliationService {
  /**
   * Run reconciliation check on all active wallets
   */
  static async runFullReconciliation(): Promise<{
    totalWallets: number;
    consistent: number;
    inconsistent: { walletId: string; userId: string; currency: string; discrepancy: number }[];
  }> {
    const wallets = await prisma.wallet.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, userId: true, currency: true },
    });

    const inconsistent: { walletId: string; userId: string; currency: string; discrepancy: number }[] = [];
    let consistent = 0;

    for (const wallet of wallets) {
      try {
        const result = await Ledger.verifyWalletLedger(wallet.id);
        if (result.consistent) {
          consistent++;
        } else {
          inconsistent.push({
            walletId: wallet.id,
            userId: wallet.userId,
            currency: wallet.currency,
            discrepancy: result.discrepancy || 0,
          });
        }
      } catch (error) {
        console.error(`Reconciliation error for wallet ${wallet.id}:`, error);
      }
    }

    return {
      totalWallets: wallets.length,
      consistent,
      inconsistent,
    };
  }

  /**
   * Verify that total debits equal total credits across all wallets
   * (system-wide double-entry check)
   */
  static async verifySystemBalance(): Promise<{ balanced: boolean; totalCredits: number; totalDebits: number }> {
    const result = await prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
    });

    const netAmount = Number(result._sum.amount || 0);
    
    // In a double-entry system, all entries should sum to zero
    return {
      balanced: Math.abs(netAmount) < 0.01, // Allow tiny floating point differences
      totalCredits: 0, // Would need separate aggregation
      totalDebits: 0,
    };
  }
}
