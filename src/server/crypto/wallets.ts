// Cherokee Bank - Crypto Wallet Management
import { prisma } from '@/src/config/db';
import crypto from 'crypto';

export class CryptoWalletService {
  /**
   * Create a crypto wallet for a user
   */
  static async createWallet(userId: string, currency: 'BTC' | 'ETH' | 'USDT') {
    const existing = await prisma.cryptoWallet.findUnique({
      where: { userId_currency: { userId, currency } },
    });
    if (existing) throw new Error(`${currency} wallet already exists`);

    // Generate a pseudo-address (in production, use HD wallet derivation)
    const address = this.generateAddress(currency);

    return prisma.cryptoWallet.create({
      data: {
        userId,
        currency,
        balance: 0,
        address,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Create default crypto wallets for a user
   */
  static async createDefaultWallets(userId: string) {
    const currencies: Array<'BTC' | 'ETH' | 'USDT'> = ['BTC', 'ETH', 'USDT'];
    
    return Promise.all(
      currencies.map((currency) =>
        prisma.cryptoWallet.create({
          data: {
            userId,
            currency,
            balance: 0,
            address: this.generateAddress(currency),
            status: 'ACTIVE',
          },
        })
      )
    );
  }

  /**
   * Get all crypto wallets for a user
   */
  static async getWallets(userId: string) {
    return prisma.cryptoWallet.findMany({
      where: { userId },
      orderBy: { currency: 'asc' },
    });
  }

  /**
   * Get wallet by currency
   */
  static async getWalletByCurrency(userId: string, currency: string) {
    return prisma.cryptoWallet.findFirst({
      where: { userId, currency: currency as never },
    });
  }

  /**
   * Generate a pseudo-address for a cryptocurrency
   */
  private static generateAddress(currency: string): string {
    const random = crypto.randomBytes(20).toString('hex');
    switch (currency) {
      case 'BTC':
        return `bc1q${random.substring(0, 38)}`;
      case 'ETH':
      case 'USDT':
        return `0x${random.substring(0, 40)}`;
      default:
        return `0x${random.substring(0, 40)}`;
    }
  }
}
