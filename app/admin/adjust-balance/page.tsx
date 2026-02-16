'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { TransitionFade, SlideIn, LoadingSpinner } from '@/src/components/animations/loading-states';

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

const adjustmentHistory = [
  { id: 1, user: 'John Doe', wallet: 'USD', type: 'CREDIT', amount: 5000, reason: 'Promotional bonus', date: '2024-02-14', by: 'Admin' },
  { id: 2, user: 'Mark Wilson', wallet: 'USD', type: 'DEBIT', amount: 10000, reason: 'Fraud hold', date: '2024-02-13', by: 'Admin' },
  { id: 3, user: 'Sarah Chen', wallet: 'EUR', type: 'CREDIT', amount: 2500, reason: 'Refund', date: '2024-02-12', by: 'Admin' },
];

export default function AdminAdjustBalancePage() {
  const [userId, setUserId] = useState('');
  const [wallet, setWallet] = useState('USD');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!userId || !amount || !reason) {
      setError('All fields are required');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setUserId('');
      setAmount('');
      setReason('');

      setTimeout(() => setSuccess(false), 4000);
    }, 1500);
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
        <h1 className="text-3xl font-bold text-white mb-2">Adjust Balance</h1>
        <p className="text-white/60">Credit or debit user wallet balances with full audit trail</p>
      </motion.div>

      {/* Form Card */}
      <motion.div variants={itemVariants}>
        <Card className="cherokee-card border-white/5">
          <CardHeader>
            <CardTitle className="text-white">New Adjustment</CardTitle>
          </CardHeader>
          <CardContent>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2"
              >
                <span className="material-icons text-lg">check_circle</span>
                Balance adjustment applied successfully.
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm flex items-center gap-2"
              >
                <span className="material-icons text-lg">error</span>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">User ID / Email</label>
                <input
                  type="text"
                  placeholder="Enter user ID or email"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Wallet</label>
                <select
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-accent/50 transition-colors"
                >
                  {['USD', 'EUR', 'GBP', 'CHERO'].map((curr) => (
                    <option key={curr} className="bg-background-dark">{curr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Adjustment Type</label>
                <div className="flex gap-4">
                  {[
                    { value: 'CREDIT', icon: 'add', label: 'Credit (Add)' },
                    { value: 'DEBIT', icon: 'remove', label: 'Debit (Remove)' },
                  ].map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setType(opt.value as 'CREDIT' | 'DEBIT')}
                      className={`flex-1 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        type === opt.value
                          ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                      }`}
                    >
                      <span className="material-icons text-lg">{opt.icon}</span>
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Reason (Required)</label>
                <textarea
                  placeholder="Provide detailed reason for this adjustment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                type="submit"
                className="w-full py-3 rounded-lg bg-brand-accent text-background-dark hover:bg-brand-accent/90 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isSubmitting && <LoadingSpinner size="sm" />}
                {isSubmitting ? 'Processing...' : `Apply ${type === 'CREDIT' ? 'Credit' : 'Debit'}`}
              </motion.button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* History Table */}
      <motion.div variants={itemVariants}>
        <Card className="cherokee-card border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Recent Adjustments</span>
              <span className="text-xs font-normal text-white/40">{adjustmentHistory.length} records</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {adjustmentHistory.map((adj, idx) => (
                <SlideIn key={adj.id} direction="up" delay={idx * 50}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-bold text-sm">{adj.user}</p>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            adj.type === 'CREDIT'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {adj.type}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 line-clamp-1">{adj.reason}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${adj.type === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {adj.type === 'CREDIT' ? '+' : '-'}${adj.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">{adj.date}</p>
                      </div>
                    </div>
                  </motion.div>
                </SlideIn>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}