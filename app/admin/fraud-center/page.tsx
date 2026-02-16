'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { SkeletonCard } from '@/src/components/animations/skeleton-loader';
import { SlideIn } from '@/src/components/animations/loading-states';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

const mockCases = [
  {
    id: 'fr1',
    transactionRef: 'TXN-FL1A2B',
    amount: 48500,
    currency: 'USD',
    riskScore: 92,
    status: 'OPEN',
    fromUser: 'Anonymous IP (VPN)',
    toUser: 'Mark Wilson',
    date: '2024-02-15T08:22:00Z',
    flags: ['Unusual amount', 'New recipient', 'Late-night transaction', 'VPN detected'],
  },
  {
    id: 'fr2',
    transactionRef: 'TXN-FL3C4D',
    amount: 125000,
    currency: 'EUR',
    riskScore: 87,
    status: 'OPEN',
    fromUser: 'Sarah Chen',
    toUser: 'External Account',
    date: '2024-02-15T07:15:00Z',
    flags: ['Large withdrawal', 'First-time amount', 'Geo-anomaly'],
  },
  {
    id: 'fr3',
    transactionRef: 'TXN-FL5E6F',
    amount: 9800,
    currency: 'GBP',
    riskScore: 78,
    status: 'REVIEWED',
    fromUser: 'Omar Hassan',
    toUser: 'Multiple Recipients',
    date: '2024-02-15T06:44:00Z',
    flags: ['Rapid transactions', 'Structuring pattern'],
  },
  {
    id: 'fr4',
    transactionRef: 'TXN-FL7G8H',
    amount: 230000,
    currency: 'USD',
    riskScore: 95,
    status: 'ESCALATED',
    fromUser: 'Corporate Account',
    toUser: 'Mark Wilson',
    date: '2024-02-14T23:10:00Z',
    flags: ['Sanctioned country', 'Shell company', 'Layered transfers'],
  },
];

export default function FraudCenterPage() {
  const [selectedCase, setSelectedCase] = useState<(typeof mockCases)[0] | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredCases = mockCases.filter((c) => filterStatus === 'ALL' || c.status === filterStatus);

  const getRiskColor = (score: number) => {
    if (score >= 90) return 'from-red-500 to-red-600';
    if (score >= 75) return 'from-orange-500 to-orange-600';
    if (score >= 50) return 'from-amber-500 to-amber-600';
    return 'from-yellow-500 to-yellow-600';
  };

  const getRiskBg = (score: number) => {
    if (score >= 90) return 'bg-red-500/20';
    if (score >= 75) return 'bg-orange-500/20';
    if (score >= 50) return 'bg-amber-500/20';
    return 'bg-yellow-500/20';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-500/20 text-red-400';
      case 'REVIEWED':
        return 'bg-amber-500/20 text-amber-400';
      case 'ESCALATED':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
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
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <span className="material-icons text-red-400">warning</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Fraud & Risk Center</h1>
            <p className="text-white/60">AI-powered fraud detection and compliance review</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Open Cases', value: '3', color: 'from-red-500 to-red-600' },
          { label: 'Escalated', value: '1', color: 'from-purple-500 to-purple-600' },
          { label: 'Avg Risk Score', value: '86', color: 'from-orange-500 to-orange-600' },
          { label: 'Total Flagged', value: '4', color: 'from-blue-500 to-blue-600' },
        ].map((stat, idx) => (
          <SlideIn key={idx} direction="up" delay={idx * 50}>
            <div className={`p-4 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10 border border-white/10`}>
              <p className="text-white/60 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          </SlideIn>
        ))}
      </motion.div>

      {/* Filter */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-3">
          {['ALL', 'OPEN', 'REVIEWED', 'ESCALATED'].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterStatus === status
                  ? 'bg-brand-accent text-background-dark'
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              {status === 'ALL' ? 'All Cases' : status}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Cases List */}
      <motion.div variants={itemVariants}>
        <Card className="cherokee-card border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Fraud Cases ({filteredCases.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredCases.map((fraudCase, idx) => (
                <SlideIn key={fraudCase.id} direction="up" delay={idx * 50}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedCase(fraudCase)}
                    className="p-5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-brand-accent">{fraudCase.transactionRef}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(fraudCase.status)}`}>
                            {fraudCase.status}
                          </span>
                        </div>
                        <p className="text-white text-sm">
                          <span className="font-medium">{fraudCase.fromUser}</span> → <span className="font-medium">{fraudCase.toUser}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-block px-4 py-2 rounded-lg ${getRiskBg(fraudCase.riskScore)}`}>
                          <p className="text-xs text-white/60">Risk Score</p>
                          <p className="text-2xl font-bold text-white">{fraudCase.riskScore}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex flex-wrap gap-2">
                        {fraudCase.flags.map((flag, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded bg-white/10 text-white/70">
                            {flag}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-medium transition-colors"
                        >
                          Dismiss
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-medium transition-colors"
                        >
                          Review
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </SlideIn>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCase(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <Card className="cherokee-card border-white/5">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-white">{selectedCase.transactionRef}</CardTitle>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  onClick={() => setSelectedCase(null)}
                  className="p-1"
                >
                  <span className="material-icons text-white/60">close</span>
                </motion.button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Amount</p>
                    <p className="text-2xl font-bold text-white">
                      {selectedCase.amount.toLocaleString()} {selectedCase.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Risk Score</p>
                    <p className={`text-2xl font-bold ${selectedCase.riskScore >= 90 ? 'text-red-400' : 'text-orange-400'}`}>
                      {selectedCase.riskScore}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedCase.status)}`}>
                      {selectedCase.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-white font-bold mb-3">Red Flags</h4>
                  <div className="space-y-2">
                    {selectedCase.flags.map((flag, i) => (
                      <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                        <span className="material-icons text-red-400 text-sm">flag</span>
                        <span className="text-white text-sm">{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCase(null)}
                    className="flex-1 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors font-medium"
                  >
                    Close
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors font-medium"
                  >
                    Escalate
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
