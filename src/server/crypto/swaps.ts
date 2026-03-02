// Cherokee Bank - Crypto Buy/Sell (Swaps)
import { prisma } from '@/src/config/db';
import { Prisma } from '@prisma/client';
import { CryptoProvider } from './provider';
import { cryptoProviders } from '@/src/config/crypto-providers';
import { generateReference } from '@/src/utils/helpers';

export class CryptoSwapService {
  /**
   * Buy crypto with fiat
   */
  static async buyCrypto(
    userId: string,
    cryptoCurrency: 'BTC' | 'ETH' | 'USDT',
    fiatWalletId: string,
    amountUSD: number
  ) {
    return prisma.$transaction(async (tx) => {
      // Get fiat wallet
      const fiatWallet = await tx.wallet.findFirst({
        where: { id: fiatWalletId, userId, status: 'ACTIVE' },
      });
      if (!fiatWallet) throw new Error('Fiat wallet not found');

      // Get crypto wallet
      const cryptoWallet = await tx.cryptoWallet.findFirst({
        where: { userId, currency: cryptoCurrency },
      });
      if (!cryptoWallet) throw new Error('Crypto wallet not found. Create one first.');

      // Get current crypto price
      const price = await CryptoProvider.getPrice(cryptoCurrency);
      if (!price) throw new Error('Unable to fetch crypto price');

      // Calculate fee and crypto amount
      const fee = amountUSD * (cryptoProviders.fees.buyFeePercent / 100);
      const netAmountUSD = amountUSD - fee;
      const cryptoAmount = netAmountUSD / price.priceUSD;

      // Check minimum buy amount
      const minBuy = cryptoProviders.fees.minBuy[cryptoCurrency];
      if (cryptoAmount < minBuy) {
        throw new Error(`Minimum buy amount is ${minBuy} ${cryptoCurrency}`);
      }

      // Check fiat balance (need to convert from wallet currency to USD if needed)
      const fiatAmountNeeded = new Prisma.Decimal(amountUSD);
      if (fiatWallet.availableBalance.lt(fiatAmountNeeded)) {
        throw new Error('Insufficient fiat balance');
      }

      // Debit fiat wallet
      await tx.wallet.update({
        where: { id: fiatWalletId },
        data: {
          balance: fiatWallet.balance.sub(fiatAmountNeeded),
          availableBalance: fiatWallet.availableBalance.sub(fiatAmountNeeded),
        },
      });

      // Credit crypto wallet
      const cryptoDecimal = new Prisma.Decimal(cryptoAmount);
      await tx.cryptoWallet.update({
        where: { id: cryptoWallet.id },
        data: {
          balance: cryptoWallet.balance.add(cryptoDecimal),
        },
      });

      // Create transaction record
      const txRecord = await tx.transaction.create({
        data: {
          fromWalletId: fiatWalletId,
          senderId: userId,
          type: 'CRYPTO_BUY',
          amount: fiatAmountNeeded,
          fee: new Prisma.Decimal(fee),
          currency: fiatWallet.currency,
          status: 'COMPLETED',
          reference: generateReference('CBY'),
          description: `Bought ${cryptoAmount.toFixed(8)} ${cryptoCurrency}`,
          metadata: {
            cryptoCurrency,
            cryptoAmount: cryptoAmount,
            priceUSD: price.priceUSD,
            feePercent: cryptoProviders.fees.buyFeePercent,
          },
        },
      });

      return {
        transaction: txRecord,
        cryptoAmount,
        priceUSD: price.priceUSD,
        fee,
      };
    });
  }

  /**
   * Sell crypto for fiat
   */
  static async sellCrypto(
    userId: string,
    cryptoCurrency: 'BTC' | 'ETH' | 'USDT',
    fiatWalletId: string,
    cryptoAmount: number
  ) {
    return prisma.$transaction(async (tx) => {
      const cryptoWallet = await tx.cryptoWallet.findFirst({
        where: { userId, currency: cryptoCurrency },
      });
      if (!cryptoWallet) throw new Error('Crypto wallet not found');

      const cryptoDecimal = new Prisma.Decimal(cryptoAmount);
      if (cryptoWallet.balance.lt(cryptoDecimal)) {
        throw new Error('Insufficient crypto balance');
      }

      const fiatWallet = await tx.wallet.findFirst({
        where: { id: fiatWalletId, userId, status: 'ACTIVE' },
      });
      if (!fiatWallet) throw new Error('Fiat wallet not found');

      const price = await CryptoProvider.getPrice(cryptoCurrency);
      if (!price) throw new Error('Unable to fetch crypto price');

      const grossUSD = cryptoAmount * price.priceUSD;
      const fee = grossUSD * (cryptoProviders.fees.sellFeePercent / 100);
      const netUSD = grossUSD - fee;

      // Debit crypto wallet
      await tx.cryptoWallet.update({
        where: { id: cryptoWallet.id },
        data: { balance: cryptoWallet.balance.sub(cryptoDecimal) },
      });

      // Credit fiat wallet
      const fiatDecimal = new Prisma.Decimal(netUSD);
      await tx.wallet.update({
        where: { id: fiatWalletId },
        data: {
          balance: fiatWallet.balance.add(fiatDecimal),
          availableBalance: fiatWallet.availableBalance.add(fiatDecimal),
        },
      });

      const txRecord = await tx.transaction.create({
        data: {
          toWalletId: fiatWalletId,
          senderId: userId,
          type: 'CRYPTO_SELL',
          amount: fiatDecimal,
          fee: new Prisma.Decimal(fee),
          currency: fiatWallet.currency,
          status: 'COMPLETED',
          reference: generateReference('CSL'),
          description: `Sold ${cryptoAmount} ${cryptoCurrency}`,
          metadata: {
            cryptoCurrency,
            cryptoAmount,
            priceUSD: price.priceUSD,
            feePercent: cryptoProviders.fees.sellFeePercent,
          },
        },
      });

      return {
        transaction: txRecord,
        fiatAmount: netUSD,
        priceUSD: price.priceUSD,
        fee,
      };
    });
  }
}
