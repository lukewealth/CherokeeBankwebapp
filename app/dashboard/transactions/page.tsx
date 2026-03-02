'use client';

import { useTransactions } from '@/src/hooks/use-dashboard-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui';
import { motion } from 'framer-motion';
import { SkeletonTable } from '@/src/components/animations/skeleton-loader';
import { TransitionFade } from '@/src/components/animations/loading-states';
import { useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
};

const statusColors = {
  completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: 'check_circle' },
  pending: { bg: 'bg-amber-500/15', text: 'text-amber-400', icon: 'schedule' },
  failed: { bg: 'bg-red-500/15', text: 'text-red-400', icon: 'cancel' },
};

export default function TransactionsPage() {
  const { data: transactions, loading } = useTransactions(20);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  if (loading) {
    return (
      <TransitionFade>
        <div className="space-y-4">
          <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
          <SkeletonTable />
        </div>
      </TransitionFade>
    );
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      send: 'send',
      receive: 'call_received',
      exchange: 'currency_exchange',
      stake: 'trending_up',
    };
    return icons[type] || 'swap_horiz';
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
        <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
        <p className="text-white/60">View and manage all your transaction history</p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        {['All', 'Sent', 'Received', 'Exchange', 'Staking'].map((filter) => (
          <motion.button
            key={filter}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-accent/30 text-white text-sm font-medium transition-all"
          >
            {filter}
          </motion.button>
        ))}
      </motion.div>

      {/* Transactions List */}
      <motion.div className="space-y-3" variants={containerVariants}>
        {transactions?.map((tx, index) => {
          const status = statusColors[tx.status as keyof typeof statusColors] || statusColors.pending;
          return (
            <motion.div key={tx.id} variants={itemVariants}>
              <motion.div
                whileHover={{ x: 2, backgroundColor: 'rgba(255,255,255,0.03)' }}
                onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full ${status.bg} flex items-center justify-center flex-shrink-0`}>
                      <span className={`material-icons text-lg ${status.text}`}>
                        {getTypeIcon(tx.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium capitalize">{tx.type}</p>
                      <p className="text-xs text-white/40 truncate">{tx.description}</p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className={`text-white font-bold ${tx.type === 'receive' ? 'text-emerald-400' : ''}`}>
                        {tx.type === 'receive' ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.currency }).format(tx.amount)}
                      </p>
                      <p className={`text-xs ${status.text}`}>{tx.status}</p>
                    </div>
                    <motion.span
                      animate={{ rotate: expandedTx === tx.id ? 180 : 0 }}
                      className="material-icons text-white/40"
                    >
                      expand_more
                    </motion.span>
                  </div>
                </div>

                {/* Expanded Details */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: expandedTx === tx.id ? 'auto' : 0,
                    opacity: expandedTx === tx.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-white/40 mb-1">Transaction ID</p>
                        <p className="text-sm text-white/80 font-mono">{tx.id.slice(0, 20)}...</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Date</p>
                        <p className="text-sm text-white/80">{new Date(tx.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {tx.type !== 'exchange' && (
                      <div>
                        <p className="text-xs text-white/40 mb-1">Recipient</p>
                        <p className="text-sm text-white/80 font-mono">{tx.recipient}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

