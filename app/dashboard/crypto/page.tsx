'use client';

import { useCryptoWallets, useExchangeRate } from '@/src/hooks/use-dashboard-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui';
import { motion } from 'framer-motion';
import { SkeletonCard, SkeletonGrid } from '@/src/components/animations/skeleton-loader';
import { TransitionFade, SlideIn, LoadingSpinner } from '@/src/components/animations/loading-states';
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

const cryptoIcons: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  USDT: 'U',
  BNB: 'B',
  CHERO: 'C',
};

const cryptoColors: Record<string, string> = {
  BTC: 'from-orange-500 to-yellow-500',
  ETH: 'from-purple-500 to-blue-500',
  USDT: 'from-green-500 to-emerald-500',
  BNB: 'from-yellow-500 to-orange-500',
  CHERO: 'from-brand-accent to-brand-accent',
};

export default function CryptoPage() {
  const { data: wallets, loading: walletsLoading } = useCryptoWallets();
  const { data: rates, loading: ratesLoading } = useExchangeRate();
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);


  if (walletsLoading || ratesLoading) {
    return (
      <TransitionFade>
        <SkeletonGrid columns={2} />
      </TransitionFade>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white mb-2">Crypto Wallets</h1>
        <p className="text-white/60">Manage your cryptocurrency holdings and trade</p>
      </motion.div>

      {/* Market Overview */}
      <motion.div variants={itemVariants}>
        <Card className="cherokee-card border-white/5 bg-gradient-to-br from-white/5 via-white/5 to-brand-accent/10">
          <CardHeader>
            <CardTitle className="text-white">Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {rates?.slice(0, 4).map((rate: any, idx: number) => (
                <motion.div
                  key={rate.symbol}
                  whileHover={{ y: -4 }}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-brand-accent uppercase">{rate.symbol}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      rate.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {rate.change >= 0 ? '+' : ''}{rate.change}%
                    </span>
                  </div>
                  <p className="text-white font-bold">${rate.price?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-white/40 mt-1">24h vol: ${rate.volume?.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Crypto Wallets Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-bold text-white mb-4">Your Holdings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets?.map((wallet: any, idx: number) => (
            <SlideIn key={wallet.id} direction="up" delay={idx * 75}>
              <motion.div
                whileHover={{ y: -4 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${cryptoColors[wallet.symbol] || 'from-brand-accent to-brand-accent'} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity blur`} />
                <Card className="cherokee-card border-white/5 relative">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${cryptoColors[wallet.symbol] || 'from-brand-accent to-brand-accent'} flex items-center justify-center text-white font-bold text-lg`}>
                          {cryptoIcons[wallet.symbol] || wallet.symbol[0]}
                        </div>
                        <div>
                          <p className="text-white font-bold">{wallet.symbol}</p>
                          <p className="text-xs text-white/40">{wallet.name}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <span className="material-icons text-white/60">more_vert</span>
                      </motion.button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-white/60 mb-1">Balance</p>
                        <p className="text-2xl font-bold text-white">{wallet.balance?.toFixed(4)} {wallet.symbol}</p>
                        <p className="text-xs text-white/40">${(wallet.balance * wallet.price)?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCrypto(wallet.symbol)}
                        className="flex-1 py-2 rounded-lg bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <span className="material-icons text-sm">sync_alt</span>
                        Exchange
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <span className="material-icons text-sm">send</span>
                        Send
                      </motion.button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </SlideIn>
          ))}
        </div>
      </motion.div>

      {/* Exchange Modal */}
      {selectedCrypto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelectedCrypto(null)}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="cherokee-card border-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Exchange {selectedCrypto}</span>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    onClick={() => setSelectedCrypto(null)}
                    className="p-1"
                  >
                    <span className="material-icons text-white/60">close</span>
                  </motion.button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">From</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
                  />
                </div>

                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full bg-brand-accent/20 hover:bg-brand-accent/30 transition-colors"
                  >
                    <span className="material-icons text-brand-accent">swap_vert</span>
                  </motion.button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">To</label>
                  <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-accent/50 transition-colors">
                    {['BTC', 'ETH', 'USDT', 'BNB', 'CHERO'].map((c) => (
                      <option key={c} className="bg-background-dark">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">To Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    disabled
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/60 placeholder:text-white/40 focus:outline-none cursor-not-allowed"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={exchangeLoading}
                  className="w-full py-3 rounded-lg bg-brand-accent text-background-dark hover:bg-brand-accent/90 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {exchangeLoading && <LoadingSpinner size="sm" />}
                  {exchangeLoading ? 'Processing...' : 'Exchange Now'}
                </motion.button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
