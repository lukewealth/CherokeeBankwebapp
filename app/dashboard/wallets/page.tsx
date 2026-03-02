'use client';

import { useWallets } from '@/src/hooks/use-dashboard-data';
import { motion } from 'framer-motion';
import { SkeletonGrid } from '@/src/components/animations/skeleton-loader';
import { TransitionFade, SlideIn } from '@/src/components/animations/loading-states';
import { useState } from 'react';
import {
  Wallet, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, ArrowUpDown,
  TrendingUp, Plus, ChevronRight, Copy, Check,
} from 'lucide-react';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 26 } },
};

const currencyMeta: Record<string, { flag: string; name: string; color: string }> = {
  USD: { flag: '🇺🇸', name: 'US Dollar', color: '#3B82F6' },
  EUR: { flag: '🇪🇺', name: 'Euro', color: '#8B5CF6' },
  GBP: { flag: '🇬🇧', name: 'British Pound', color: '#10B981' },
  CAD: { flag: '🇨🇦', name: 'Canadian Dollar', color: '#F59E0B' },
  BTC: { flag: '₿', name: 'Bitcoin', color: '#F97316' },
  ETH: { flag: 'Ξ', name: 'Ethereum', color: '#6366F1' },
  CHERO: { flag: '🪙', name: 'Digital Gold', color: '#D4AF37' },
};

export default function WalletsPage() {
  const { data, loading } = useWallets();
  const wallets = Array.isArray(data) ? data : (data as any)?.wallets ?? [];
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (loading) {
    return (
      <TransitionFade>
        <div className="space-y-6">
          <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          <SkeletonGrid columns={2} count={4} />
        </div>
      </TransitionFade>
    );
  }

  const totalBalance = wallets.reduce((sum: number, w: any) => sum + (parseFloat(w.balance) || 0), 0);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fmt = (v: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(v);
    } catch {
      return `${v.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency}`;
    }
  };

  return (
    <motion.div
      className="max-w-[1400px] mx-auto space-y-6 pb-12"
      variants={stagger} initial="hidden" animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Wallets & Accounts</h1>
          <p className="text-sm text-white/40 mt-0.5">Manage all your currency accounts in one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBalanceHidden(!balanceHidden)}
            className="p-2.5 rounded-xl border border-white/8 hover:bg-white/5 transition-colors"
          >
            {balanceHidden ? <EyeOff className="w-4 h-4 text-white/40" /> : <Eye className="w-4 h-4 text-white/40" />}
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37]/5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Account
          </motion.button>
        </div>
      </motion.div>

      {/* Total Balance Banner */}
      <motion.div variants={fadeUp}>
        <div className="relative overflow-hidden rounded-2xl border border-white/6 bg-gradient-to-br from-[#0d1a30] via-[#0a1628] to-[#071020] p-6">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/4 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-white/40" />
                <span className="text-sm font-medium text-white/50">Combined Balance</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {balanceHidden ? '••••••••' : `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-white/30">across {wallets.length} account{wallets.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/15 transition-colors"
              >
                <ArrowDownLeft className="w-4 h-4" /> Deposit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white/60 text-sm font-semibold hover:bg-white/8 transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" /> Withdraw
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {wallets?.map((wallet: any, index: number) => {
          const meta = currencyMeta[wallet.currency] || { flag: '💰', name: wallet.currency, color: '#6B7280' };
          const walletBal = parseFloat(wallet.balance) || 0;
          const pctOfTotal = totalBalance > 0 ? ((walletBal / totalBalance) * 100) : 0;

          return (
            <SlideIn key={wallet.id} direction="up" delay={index * 60}>
              <motion.div whileHover={{ y: -3 }} className="group">
                <div className="rounded-2xl border border-white/6 bg-[#0a1628]/80 backdrop-blur-xl hover:border-white/10 transition-all overflow-hidden">
                  {/* Top color accent bar */}
                  <div className="h-1" style={{ backgroundColor: meta.color, opacity: 0.5 }} />

                  <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${meta.color}15` }}
                        >
                          <span>{meta.flag}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{wallet.currency}</p>
                          <p className="text-[11px] text-white/30">{meta.name}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-white/20 px-2 py-0.5 rounded-md bg-white/3">
                        {pctOfTotal.toFixed(1)}%
                      </span>
                    </div>

                    {/* Balance */}
                    <div className="mb-4">
                      <p className="text-[11px] text-white/30 uppercase tracking-wider font-medium mb-1">Balance</p>
                      <p className="text-2xl font-extrabold text-white tracking-tight">
                        {balanceHidden ? '••••••' : fmt(wallet.balance, wallet.currency)}
                      </p>
                      {wallet.available !== undefined && wallet.available !== wallet.balance && (
                        <p className="text-[11px] text-white/25 mt-0.5">
                          Available: {balanceHidden ? '••••' : fmt(wallet.available, wallet.currency)}
                        </p>
                      )}
                    </div>

                    {/* Wallet ID */}
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-[10px] text-white/20 font-mono truncate flex-1">
                        ID: {wallet.id?.slice(0, 16)}...
                      </p>
                      <button
                        onClick={() => handleCopy(wallet.id)}
                        className="p-1 rounded hover:bg-white/5 transition-colors"
                      >
                        {copiedId === wallet.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-white/20" />
                        )}
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-3 border-t border-white/5">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/8 hover:bg-emerald-500/12 text-emerald-400 text-xs font-semibold transition-colors"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" /> Deposit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/4 hover:bg-white/6 text-white/50 text-xs font-semibold transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" /> Send
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/4 hover:bg-white/6 text-white/50 text-xs font-semibold transition-colors"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" /> Swap
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </SlideIn>
          );
        })}

        {/* Add New Wallet */}
        <motion.button
          whileHover={{ y: -3, borderColor: 'rgba(212,175,55,0.2)' }}
          whileTap={{ scale: 0.98 }}
          className="flex flex-col items-center justify-center gap-3 min-h-[260px] rounded-2xl border border-dashed border-white/8 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 flex items-center justify-center">
            <Plus className="w-6 h-6 text-[#D4AF37]/40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/30">Add New Account</p>
            <p className="text-[11px] text-white/15 mt-0.5">Open a new currency account</p>
          </div>
        </motion.button>
      </div>

      {/* Empty state */}
      {(!wallets || wallets.length === 0) && (
        <motion.div variants={fadeUp} className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white/15" />
          </div>
          <h3 className="text-lg font-bold text-white/40 mb-2">No Accounts Yet</h3>
          <p className="text-sm text-white/20 max-w-sm mx-auto">
            Create your first currency account to start managing your finances.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="mt-6 px-6 py-3 rounded-xl text-sm font-bold text-[#061B3A] transition-all"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #f8e192 50%, #D4AF37 100%)' }}
          >
            Create First Account
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
