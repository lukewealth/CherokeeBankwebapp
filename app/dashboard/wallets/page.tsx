'use client';

import { useWallets } from '@/src/hooks/use-dashboard-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui';
import { motion } from 'framer-motion';
import { SkeletonCard, SkeletonGrid } from '@/src/components/animations/skeleton-loader';
import { TransitionFade, SlideIn } from '@/src/components/animations/loading-states';
import { useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

export default function WalletsPage() {
  const { data, loading } = useWallets();
  const wallets = Array.isArray(data) ? data : (data as any)?.wallets ?? [];
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);

  if (loading) {
    return (
      <TransitionFade>
        <div className="space-y-4">
          <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
          <SkeletonGrid columns={1} count={3} />
        </div>
      </TransitionFade>
    );
  }

  const currencyIcons: Record<string, string> = {
    USD: 'attach_money',
    EUR: 'euro_symbol',
    GBP: 'currency_pound',
    BTC: 'currency_bitcoin',
    ETH: 'token',
    CHERO: 'star',
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white mb-2">Wallets</h1>
        <p className="text-white/60">Manage all your currency accounts</p>
      </motion.div>

      {/* Wallets Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {wallets?.map((wallet: any, index: number) => (
          <SlideIn key={wallet.id} direction="up" delay={index * 75}>
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => setExpandedWallet(expandedWallet === wallet.id ? null : wallet.id)}
              className="cursor-pointer"
            >
              <Card className="cherokee-card border-white/5 hover:border-brand-accent/30 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-brand-accent/20 flex items-center justify-center">
                        <span className="material-icons text-brand-accent">
                          {currencyIcons[wallet.currency] || 'account_balance_wallet'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm font-medium">{wallet.currency}</p>
                        <p className="text-xs text-white/40">Wallet Account</p>
                      </div>
                    </div>
                    <motion.span
                      animate={{ rotate: expandedWallet === wallet.id ? 180 : 0 }}
                      className="material-icons text-white/40 text-lg"
                    >
                      expand_more
                    </motion.span>
                  </div>

                  <div className="mb-4">
                    <p className="text-white/60 text-xs mb-1">Balance</p>
                    <p className="text-2xl font-bold text-white">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: wallet.currency }).format(wallet.balance)}
                    </p>
                  </div>

                  {/* Expanded Details */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: expandedWallet === wallet.id ? 'auto' : 0,
                      opacity: expandedWallet === wallet.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-white/10 pt-4 space-y-3"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Available</span>
                      <span className="text-white font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: wallet.currency }).format(wallet.available)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Reserved</span>
                      <span className="text-white font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: wallet.currency }).format(wallet.reserved)}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-2 rounded-lg bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent transition-colors text-sm font-medium"
                      >
                        Deposit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors text-sm font-medium"
                      >
                        Withdraw
                      </motion.button>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </SlideIn>
        ))}
      </motion.div>

      {/* Add Wallet Button */}
      <motion.div variants={itemVariants}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-lg bg-white/5 border-2 border-dashed border-white/20 hover:border-brand-accent/50 hover:bg-white/10 transition-all text-white font-medium"
        >
          <span className="material-icons inline-block mr-2 align-text-bottom">add</span>
          Add New Wallet
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
