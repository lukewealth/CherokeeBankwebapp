'use client';

import { useTransactions } from '@/src/hooks/use-dashboard-data';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonTable } from '@/src/components/animations/skeleton-loader';
import { TransitionFade } from '@/src/components/animations/loading-states';
import { useState, useEffect } from 'react';
import {
  Search, Download, ArrowUpRight, ArrowDownLeft, ArrowUpDown,
  CheckCircle2, Clock, AlertCircle, ChevronDown,
} from 'lucide-react';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.06 } },
};
const fadeUp = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 26 } },
};

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' },
  COMPLETED: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' },
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Pending' },
  PENDING: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Pending' },
  failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
  FAILED: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
};

const typeConfig: Record<string, { icon: typeof ArrowUpRight; color: string; bg: string; label: string }> = {
  send: { icon: ArrowUpRight, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Sent' },
  receive: { icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Received' },
  exchange: { icon: ArrowUpDown, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Exchanged' },
  TRANSFER: { icon: ArrowUpRight, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Transfer' },
  DEPOSIT: { icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Deposit' },
  WITHDRAW: { icon: ArrowUpRight, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Withdrawal' },
  EXCHANGE: { icon: ArrowUpDown, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Exchange' },
};

const filters = ['All', 'Transfer', 'Deposit', 'Exchange'];

/* ── Safe date formatter (client-only) ── */
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
      <p className="text-xs text-white/40">{formatted.date || '—'}</p>
      <p className="text-[10px] text-white/20">{formatted.time}</p>
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
        <div className="space-y-6 max-w-[1400px] mx-auto">
          <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
          <SkeletonTable />
        </div>
      </TransitionFade>
    );
  }

  // Parse transactions from API response
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
      className="max-w-[1400px] mx-auto space-y-6 pb-12"
      variants={stagger} initial="hidden" animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transaction History</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/8 text-white/50 text-sm font-semibold hover:bg-white/5 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </motion.button>
      </motion.div>

      {/* Filters & Search */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-white/6 bg-[#0a1628]/80 backdrop-blur-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeFilter === f
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20'
                    : 'bg-white/4 text-white/40 border border-white/5 hover:bg-white/6 hover:text-white/60'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative flex-1 w-full sm:w-auto sm:ml-auto sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input type="text" placeholder="Search transactions..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-white/4 border border-white/6 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/25 transition-colors"
            />
          </div>
        </div>
      </motion.div>

      {/* Transaction List */}
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl border border-white/6 bg-[#0a1628]/80 backdrop-blur-xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-[10px] text-white/25 uppercase tracking-wider font-semibold">
            <span className="col-span-5">Transaction</span>
            <span className="col-span-2 text-center">Status</span>
            <span className="col-span-2 text-center">Date</span>
            <span className="col-span-3 text-right">Amount</span>
          </div>

          <div className="divide-y divide-white/[0.03]">
            <AnimatePresence mode="popLayout">
              {filtered.map((tx: any, i: number) => {
                const status = statusConfig[tx.status] || statusConfig.PENDING;
                const type = typeConfig[tx.type] || typeConfig.TRANSFER;
                const StatusIcon = status.icon;
                const TypeIcon = type.icon;
                const isExpanded = expandedTx === tx.id;
                const isReceive = tx.type === 'receive' || tx.type === 'DEPOSIT';
                const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;

                return (
                  <motion.div key={tx.id} layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.02 } }}
                    exit={{ opacity: 0 }}
                    onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                    className="group cursor-pointer"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center px-4 md:px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                      <div className="col-span-5 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${type.bg} flex items-center justify-center shrink-0`}>
                          <TypeIcon className={`w-4 h-4 ${type.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white capitalize truncate">{type.label}</p>
                          <p className="text-[11px] text-white/25 truncate">{tx.description || tx.reference || '—'}</p>
                        </div>
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${status.bg} ${status.color} text-[10px] font-bold`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>

                      <div className="col-span-2 text-center" suppressHydrationWarning>
                        <ClientDate dateStr={tx.createdAt || tx.timestamp} />
                      </div>

                      <div className="col-span-3 text-right flex items-center justify-end gap-2">
                        <div>
                          <p className={`text-sm font-bold tabular-nums ${isReceive ? 'text-emerald-400' : 'text-white'}`}>
                            {isReceive ? '+' : '-'}
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.currency || 'USD' }).format(Math.abs(amount || 0))}
                          </p>
                          <p className="text-[10px] text-white/20">{tx.currency || 'USD'}</p>
                        </div>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="shrink-0">
                          <ChevronDown className="w-4 h-4 text-white/15" />
                        </motion.div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-4 pt-1">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                              <div>
                                <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-1">Transaction ID</p>
                                <p className="text-xs text-white/60 font-mono">{tx.id?.slice(0, 20)}...</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-1">Reference</p>
                                <p className="text-xs text-white/60 font-mono">{tx.reference || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-1">Fee</p>
                                <p className="text-xs text-white/60">{tx.fee ? `$${parseFloat(tx.fee).toFixed(2)}` : '$0.00'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-1">Currency</p>
                                <p className="text-xs text-white/60">{tx.currency || 'USD'}</p>
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
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-white/15" />
              </div>
              <h3 className="text-base font-bold text-white/30 mb-1">No Transactions Found</h3>
              <p className="text-xs text-white/15">
                {searchQuery ? `No results for "${searchQuery}"` : 'Your transaction history will appear here.'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
