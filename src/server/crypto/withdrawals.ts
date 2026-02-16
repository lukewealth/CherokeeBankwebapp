// Cherokee Bank - Crypto Withdrawals
import { prisma } from '@/src/config/db';
import { Prisma } from '@prisma/client';
import { cryptoProviders } from '@/src/config/crypto-providers';
import { generateReference } from '@/src/utils/helpers';

export class CryptoWithdrawalService {
  /**
   * Initiate a crypto withdrawal to an external address
   */
  static async initiateWithdrawal(
    userId: string,
    currency: 'BTC' | 'ETH' | 'USDT',
    amount: number,
    toAddress: string
  ) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.cryptoWallet.findFirst({
        where: { userId, currency, status: 'ACTIVE' },
      });
      if (!wallet) throw new Error('Crypto wallet not found');

      const fee = cryptoProviders.fees.withdrawalFee[currency];
      const totalAmount = amount + fee;
      const totalDecimal = new Prisma.Decimal(totalAmount);

      if (wallet.balance.lt(totalDecimal)) {
        throw new Error(`Insufficient balance. Need ${totalAmount} ${currency} (including ${fee} ${currency} network fee)`);
      }

      // Debit the wallet
      await tx.cryptoWallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance.sub(totalDecimal) },
      });

      // Create withdrawal transaction (PENDING until blockchain confirmation)
      const txRecord = await tx.transaction.create({
        data: {
          senderId: userId,
          type: 'WITHDRAWAL',
          amount: new Prisma.Decimal(amount),
          fee: new Prisma.Decimal(fee),
          currency,
          status: 'PENDING',
          reference: generateReference('CWD'),
          description: `Crypto withdrawal to ${toAddress.substring(0, 10)}...`,
          metadata: {
            toAddress,
            networkFee: fee,
            currency,
          },
        },
      });

      return {
        transaction: txRecord,
        amount,
        fee,
        toAddress,
        estimatedTime: currency === 'BTC' ? '10-60 minutes' : '2-5 minutes',
      };
    });
  }
}
