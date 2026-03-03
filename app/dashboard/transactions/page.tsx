'use client';

import { useTransactions } from '@/src/hooks/use-dashboard-data';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonTable } from '@/src/components/animations/skeleton-loader';
import { TransitionFade } from '@/src/components/animations/loading-states';
import { useState, useEffect } from 'react';
import {
  Search, Download, ArrowUpRight, ArrowDownLeft, ArrowUpDown,
  CheckCircle2, Clock, AlertCircle, ChevronDown, Activity,
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

/* ── Config maps ── */
const STATUS: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/8', label: 'Completed' },
  COMPLETED: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/8', label: 'Completed' },
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/8', label: 'Pending' },
  PENDING: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/8', label: 'Pending' },
  failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/8', label: 'Failed' },
  FAILED: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/8', label: 'Failed' },
};

const TX_TYPE: Record<string, { icon: typeof ArrowUpRight; color: string; bg: string; label: string }> = {
  send: { icon: ArrowUpRight, color: 'text-blue-400', bg: 'bg-blue-500/8', label: 'Sent' },
  receive: { icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/8', label: 'Received' },
  exchange: { icon: ArrowUpDown, color: 'text-violet-400', bg: 'bg-violet-500/8', label: 'Exchanged' },
  TRANSFER: { icon: ArrowUpRight, color: 'text-blue-400', bg: 'bg-blue-500/8', label: 'Transfer' },
  DEPOSIT: { icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/8', label: 'Deposit' },
  WITHDRAW: { icon: ArrowUpRight, color: 'text-orange-400', bg: 'bg-orange-500/8', label: 'Withdrawal' },
  EXCHANGE: { icon: ArrowUpDown, color: 'text-violet-400', bg: 'bg-violet-500/8', label: 'Exchange' },
};

const FILTERS = ['All', 'Transfer', 'Deposit', 'Exchange'];

/* ── Client-safe date formatter ── */
function ClientDate({ dateStr }: { dateStr: string | undefined }) {
  const [formatted, setFormatted] = useState<{ date: string; time: string }>({ date: '', time: '' });
  useEffect(() => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    setFormatted({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });
  }, [dateStr]);
  return (
    <>
      <p className="text-[11px] text-white/30">{formatted.date || '\u2014'}</p>
      <p className="text-[10px] text-white/15">{formatted.time}</p>
    </>
  );
}

export default function TransactionsPage() {
  const { data: txData, loading } = useTransactions(50);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  if (loading) {
    return (
      <TransitionFade>
        <div className="max-w-[1360px] mx-auto space-y-6">
          <div className="h-8 w-48 bg-white/[0.04] rounded-lg animate-pulse" />
          <div className="h-10 bg-white/[0.03] rounded-lg animate-pulse" />
          <SkeletonTable />
        </div>
      </TransitionFade>
    );
  }

  const transactions = Array.isArray(txData) ? txData : (txData as any)?.transactions || [];

  const filtered = transactions.filter((tx: any) => {
    if (activeFilter !== 'All') {
      const filterType = activeFilter.toUpperCase();
      if (tx.type?.toUpperCase() !== filterType) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchDesc = (tx.description || '').toLowerCase().includes(q);
      const matchType = (tx.type || '').toLowerCase().includes(q);
      const matchRef = (tx.reference || '').toLowerCase().includes(q);
      if (!matchDesc && !matchType && !matchRef) return false;
    }
    return true;
  });

  return (
    <motion.div
      className="max-w-[1360px] mx-auto space-y-6 pb-16"
      variants={stagger} initial="hidden" animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeIn} className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight leading-tight">
            Transaction History
          </h1>
          <p className="text-[12px] text-white/25 mt-1">
            {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <motion.button
          whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-white/35 text-[12px] font-medium hover:bg-white/[0.04] transition-colors"
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.8} /> Export CSV
        </motion.button>
      </motion.div>

      {/* Filters & Search */}
      <motion.div variants={fadeIn}>
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${activeFilter === f
                      ? 'bg-[#C4A962]/10 text-[#C4A962] border border-[#C4A962]/15'
                      : 'bg-white/[0.03] text-white/30 border border-white/[0.04] hover:bg-white/[0.05] hover:text-white/45'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative flex-1 w-full sm:w-auto sm:ml-auto sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15" />
              <input type="text" placeholder="Search transactions..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-9 pr-4 rounded-lg bg-white/[0.03] border border-white/[0.04] text-[12px] text-white/60 placeholder:text-white/15 focus:outline-none focus:border-white/10 transition-colors"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transaction List */}
      <motion.div variants={fadeIn}>
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.04] text-[10px] text-white/20 uppercase tracking-wider font-medium">
            <span className="col-span-5">Transaction</span>
            <span className="col-span-2 text-center">Status</span>
            <span className="col-span-2 text-center">Date</span>
            <span className="col-span-3 text-right">Amount</span>
          </div>

          <div className="divide-y divide-white/[0.03]">
            <AnimatePresence mode="popLayout">
              {filtered.map((tx: any, i: number) => {
                const status = STATUS[tx.status] || STATUS.PENDING;
                const type = TX_TYPE[tx.type] || TX_TYPE.TRANSFER;
                const StatusIcon = status.icon;
                const TypeIcon = type.icon;
                const isExpanded = expandedTx === tx.id;
                const isCredit = tx.type === 'receive' || tx.type === 'DEPOSIT';
                const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;

                return (
                  <motion.div key={tx.id} layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.02 } }}
                    exit={{ opacity: 0 }}
                    onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                    className="group cursor-pointer"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center px-4 md:px-5 py-3 hover:bg-white/[0.015] transition-colors">
                      <div className="col-span-5 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${type.bg} flex items-center justify-center shrink-0`}>
                          <TypeIcon className={`w-3.5 h-3.5 ${type.color}`} strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-white/80 capitalize truncate">{type.label}</p>
                          <p className="text-[10px] text-white/20 truncate">{tx.description || tx.reference || '\u2014'}</p>
                        </div>
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${status.bg} ${status.color} text-[10px] font-medium`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {status.label}
                        </span>
                      </div>

                      <div className="col-span-2 text-center" suppressHydrationWarning>
                        <ClientDate dateStr={tx.createdAt || tx.timestamp} />
                      </div>

                      <div className="col-span-3 text-right flex items-center justify-end gap-2">
                        <div>
                          <p className={`text-[13px] font-semibold tabular-nums ${isCredit ? 'text-emerald-400' : 'text-white/70'}`}>
                            {isCredit ? '+' : '\u2212'}
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.currency || 'USD' }).format(Math.abs(amount || 0))}
                          </p>
                          <p className="text-[10px] text-white/15">{tx.currency || 'USD'}</p>
                        </div>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="shrink-0">
                          <ChevronDown className="w-3.5 h-3.5 text-white/10" />
                        </motion.div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 pt-1">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                              <div>
                                <p className="text-[10px] text-white/20 uppercase tracking-wider font-medium mb-1">Transaction ID</p>
                                <p className="text-[11px] text-white/40 font-mono">{tx.id?.slice(0, 20)}...</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-white/20 uppercase tracking-wider font-medium mb-1">Reference</p>
                                <p className="text-[11px] text-white/40 font-mono">{tx.reference || '\u2014'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-white/20 uppercase tracking-wider font-medium mb-1">Fee</p>
                                <p className="text-[11px] text-white/40">{tx.fee ? `$${parseFloat(tx.fee).toFixed(2)}` : '$0.00'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-white/20 uppercase tracking-wider font-medium mb-1">Currency</p>
                                <p className="text-[11px] text-white/40">{tx.currency || 'USD'}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Activity className="w-8 h-8 text-white/[0.06] mb-3" />
              <h3 className="text-[14px] font-semibold text-white/20 mb-1">No Transactions Found</h3>
              <p className="text-[11px] text-white/10">
                {searchQuery ? `No results for "${searchQuery}"` : 'Your transaction history will appear here.'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
