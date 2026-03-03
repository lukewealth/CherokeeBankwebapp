'use client';

import { useWallets } from '@/src/hooks/use-dashboard-data';
import { motion } from 'framer-motion';
import { SkeletonGrid } from '@/src/components/animations/skeleton-loader';
import { TransitionFade, SlideIn } from '@/src/components/animations/loading-states';
import { useState } from 'react';
import {
  Wallet, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, ArrowUpDown,
  Plus, Copy, Check, ArrowRight,
} from 'lucide-react';

/* ── Animations ── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};
const fadeIn = {
  hidden: { y: 12, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
};

/* ── Currency config (no emojis) ── */
const CURRENCIES: Record<string, { abbr: string; name: string; color: string }> = {
  USD: { abbr: 'US', name: 'US Dollar', color: '#3B82F6' },
  EUR: { abbr: 'EU', name: 'Euro', color: '#8B5CF6' },
  GBP: { abbr: 'GB', name: 'British Pound', color: '#10B981' },
  CAD: { abbr: 'CA', name: 'Canadian Dollar', color: '#F59E0B' },
  NGN: { abbr: 'NG', name: 'Nigerian Naira', color: '#06B6D4' },
  BTC: { abbr: 'BT', name: 'Bitcoin', color: '#F97316' },
  ETH: { abbr: 'ET', name: 'Ethereum', color: '#6366F1' },
  CHERO: { abbr: 'CG', name: 'Digital Gold', color: '#C4A962' },
};

/* ── Format currency ── */
function fmt(v: number | string, currency: string) {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '$0.00';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

export default function WalletsPage() {
  const { data, loading } = useWallets();
  const wallets = Array.isArray(data) ? data : (data as any)?.wallets ?? [];
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (loading) {
    return (
      <TransitionFade>
        <div className="max-w-[1360px] mx-auto space-y-6">
          <div className="h-8 w-44 bg-white/[0.04] rounded-lg animate-pulse" />
          <div className="h-28 bg-white/[0.03] rounded-xl animate-pulse" />
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

  return (
    <motion.div
      className="max-w-[1360px] mx-auto space-y-8 pb-16"
      variants={stagger} initial="hidden" animate="show"
    >
      {/* ── Header ── */}
      <motion.div variants={fadeIn} className="flex items-end justify-between">
        <div>
          <p className="text-[13px] text-white/30 font-medium mb-1">Accounts</p>
          <h1 className="text-[22px] font-semibold text-white tracking-tight leading-tight">
            Wallets & Accounts
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setBalanceHidden(b => !b)}
            className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            {balanceHidden
              ? <EyeOff className="w-4 h-4 text-white/30" />
              : <Eye className="w-4 h-4 text-white/30" />}
          </button>
          <motion.button
            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/[0.08] text-white/50 text-[12px] font-medium hover:bg-white/[0.04] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Account
          </motion.button>
        </div>
      </motion.div>

      {/* ── Balance Bar ── */}
      <motion.div variants={fadeIn}>
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-3.5 h-3.5 text-white/25" strokeWidth={1.6} />
                <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                  Combined Balance
                </span>
              </div>
              <h2 className="text-[2rem] font-semibold text-white tracking-tight leading-none tabular-nums">
                {balanceHidden ? '\u2022\u2022\u2022\u2022\u2022\u2022' : `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </h2>
              <p className="text-[11px] text-white/20 mt-2">
                across {wallets.length} account{wallets.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <motion.button
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/10 text-emerald-400 text-[12px] font-medium hover:bg-emerald-500/12 transition-colors"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" strokeWidth={1.8} /> Deposit
              </motion.button>
              <motion.button
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-white/40 text-[12px] font-medium hover:bg-white/[0.04] transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} /> Withdraw
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Wallet Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {wallets?.map((wallet: any, index: number) => {
          const meta = CURRENCIES[wallet.currency] || { abbr: wallet.currency?.slice(0, 2), name: wallet.currency, color: '#6B7280' };
          const walletBal = parseFloat(wallet.balance) || 0;
          const pctOfTotal = totalBalance > 0 ? ((walletBal / totalBalance) * 100) : 0;

          return (
            <SlideIn key={wallet.id} direction="up" delay={index * 50}>
              <motion.div whileHover={{ y: -2 }} className="group">
                <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] hover:border-white/[0.08] transition-all overflow-hidden">
                  {/* Color accent */}
                  <div className="h-0.5" style={{ backgroundColor: meta.color, opacity: 0.4 }} />

                  <div className="p-5">
                    {/* Currency header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold tracking-wider"
                          style={{ backgroundColor: `${meta.color}10`, color: meta.color }}
                        >
                          {meta.abbr}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-white/80 leading-tight">{wallet.currency}</p>
                          <p className="text-[11px] text-white/25 leading-tight mt-0.5">{meta.name}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-white/15 px-1.5 py-0.5 rounded bg-white/[0.03]">
                        {pctOfTotal.toFixed(1)}%
                      </span>
                    </div>

                    {/* Balance */}
                    <div className="mb-4">
                      <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-1.5">Balance</p>
                      <p className="text-xl font-semibold text-white tracking-tight tabular-nums">
                        {balanceHidden ? '\u2022\u2022\u2022\u2022\u2022\u2022' : fmt(walletBal, wallet.currency)}
                      </p>
                      {wallet.availableBalance !== undefined && wallet.availableBalance !== wallet.balance && (
                        <p className="text-[10px] text-white/15 mt-1">
                          Available: {balanceHidden ? '\u2022\u2022\u2022\u2022' : fmt(wallet.availableBalance, wallet.currency)}
                        </p>
                      )}
                    </div>

                    {/* Wallet ID */}
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-[10px] text-white/15 font-mono truncate flex-1">
                        {wallet.bankAccountNumber || `${wallet.id?.slice(0, 18)}...`}
                      </p>
                      <button
                        onClick={() => handleCopy(wallet.bankAccountNumber || wallet.id)}
                        className="p-1 rounded hover:bg-white/[0.04] transition-colors"
                      >
                        {copiedId === (wallet.bankAccountNumber || wallet.id)
                          ? <Check className="w-3 h-3 text-emerald-400" />
                          : <Copy className="w-3 h-3 text-white/15" />}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 pt-3.5 border-t border-white/[0.04]">
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/6 hover:bg-emerald-500/10 text-emerald-400/80 text-[11px] font-medium transition-colors">
                        <ArrowDownLeft className="w-3 h-3" strokeWidth={1.8} /> Deposit
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] text-white/35 text-[11px] font-medium transition-colors">
                        <ArrowUpRight className="w-3 h-3" strokeWidth={1.8} /> Send
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] text-white/35 text-[11px] font-medium transition-colors">
                        <ArrowUpDown className="w-3 h-3" strokeWidth={1.8} /> Swap
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </SlideIn>
          );
        })}

        {/* Add New Account card */}
        <motion.button
          whileHover={{ y: -2, borderColor: 'rgba(196,169,98,0.12)' }}
          whileTap={{ scale: 0.98 }}
          className="flex flex-col items-center justify-center gap-3 min-h-[260px] rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <Plus className="w-4 h-4 text-white/20" />
          </div>
          <div className="text-center">
            <p className="text-[12px] font-medium text-white/25">Add Account</p>
            <p className="text-[10px] text-white/10 mt-0.5">Open a new currency account</p>
          </div>
        </motion.button>
      </div>

      {/* Empty State */}
      {(!wallets || wallets.length === 0) && (
        <motion.div variants={fadeIn} className="text-center py-16">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-5 h-5 text-white/10" />
          </div>
          <h3 className="text-[15px] font-semibold text-white/30 mb-1.5">No accounts yet</h3>
          <p className="text-[12px] text-white/15 max-w-sm mx-auto mb-5">
            Create your first currency account to start managing your finances.
          </p>
          <motion.button
            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C4A962]/10 border border-[#C4A962]/15 text-[#C4A962] text-[12px] font-medium hover:bg-[#C4A962]/15 transition-colors"
          >
            Create Account <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
