// Cherokee Bank - Admin Balance Override
import { prisma } from '@/src/config/db';
import { Prisma } from '@prisma/client';
import { generateReference } from '@/src/utils/helpers';
import { AuditService } from './audit';

export class BalanceOverride {
  /**
   * Admin balance adjustment (credit or debit)
   */
  static async adjustBalance(
    adminId: string,
    walletId: string,
    amount: number,
    type: 'CREDIT' | 'DEBIT',
    reason: string,
    ipAddress: string
  ) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
        include: { user: { select: { id: true, email: true } } },
      });

      if (!wallet) throw new Error('Wallet not found');

      const decimalAmount = new Prisma.Decimal(amount);
      let newBalance: Prisma.Decimal;
      let newAvailable: Prisma.Decimal;
      let ledgerAmount: Prisma.Decimal;

      if (type === 'CREDIT') {
        newBalance = wallet.balance.add(decimalAmount);
        newAvailable = wallet.availableBalance.add(decimalAmount);
        ledgerAmount = decimalAmount;
      } else {
        if (wallet.balance.lt(decimalAmount)) {
          throw new Error('Insufficient balance for debit adjustment');
        }
        newBalance = wallet.balance.sub(decimalAmount);
        newAvailable = wallet.availableBalance.sub(decimalAmount);
        ledgerAmount = decimalAmount.neg();
      }

      // Update wallet
      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance, availableBalance: newAvailable },
      });

      // Create adjustment transaction
      const txRecord = await tx.transaction.create({
        data: {
          ...(type === 'CREDIT' ? { toWalletId: walletId } : { fromWalletId: walletId }),
          senderId: wallet.user.id,
          type: 'ADJUSTMENT',
          amount: decimalAmount,
          fee: 0,
          currency: wallet.currency,
          status: 'COMPLETED',
          reference: generateReference('ADJ'),
          description: `Admin ${type.toLowerCase()}: ${reason}`,
          metadata: { adminId, type, reason },
        },
      });

      // Ledger entry
      await tx.ledgerEntry.create({
        data: {
          transactionId: txRecord.id,
          walletId,
          amount: ledgerAmount,
          balanceAfter: newBalance,
          description: `Admin ${type.toLowerCase()} adjustment`,
        },
      });

      return { transaction: txRecord, newBalance: Number(newBalance) };
    }).then(async (result) => {
      // Audit log (outside of transaction for reliability)
      await AuditService.log(
        adminId,
        `BALANCE_${type}`,
        'WALLET',
        walletId,
        ipAddress,
        { amount, reason, newBalance: result.newBalance }
      );
      return result;
    });
  }
}
