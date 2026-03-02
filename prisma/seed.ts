// Cherokee Bank - Seed Script: Create test user
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'lukeokgaha@gmail.com';
  const password = 'Grace&Love';
  const passwordHash = await bcrypt.hash(password, 12);

  // Upsert user (create or update if exists)
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      status: 'ACTIVE',
      failedLoginCount: 0,
      lockedUntil: null,
    },
    create: {
      email,
      passwordHash,
      firstName: 'Luke',
      lastName: 'Okagha',
      role: 'ADMIN',
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
      twoFactorEnabled: false,
    },
  });

  console.log(`✅ User created/updated: ${user.email} (ID: ${user.id})`);

  // Create default wallets if they don't exist
  const existingWallets = await prisma.wallet.findMany({
    where: { userId: user.id },
  });

  if (existingWallets.length === 0) {
    const currencies = ['USD', 'EUR', 'GBP', 'CHERO'] as const;
    const balances: Record<string, number> = {
      USD: 25000.00,
      EUR: 18500.00,
      GBP: 12000.00,
      CHERO: 50000.00,
    };

    for (const currency of currencies) {
      await prisma.wallet.create({
        data: {
          userId: user.id,
          currency,
          balance: balances[currency],
          availableBalance: balances[currency],
          isDefault: currency === 'USD',
          status: 'ACTIVE',
        },
      });
    }
    console.log('✅ Default wallets created (USD, EUR, GBP, CHERO)');
  } else {
    console.log(`ℹ️  Wallets already exist (${existingWallets.length} found)`);
  }

  console.log('\n🔑 Login credentials:');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role:     ADMIN`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
