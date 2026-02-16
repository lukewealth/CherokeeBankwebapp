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

export default function MerchantPage() {
  const [showSetup, setShowSetup] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [creating, setCreating] = useState(false);
  const [isMerchant, setIsMerchant] = useState(false);

  const merchantData = {
    businessName: 'Your Business',
    posId: 'POS-2024-001-ABC',
    status: 'ACTIVE',
    revenue: 15420.50,
    transactions: 234,
    disputes: 2,
  };

  if (!isMerchant) {
    return (
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-white mb-2">Merchant Portal</h1>
          <p className="text-white/60">Accept payments from Cherokee Bank users</p>
        </motion.div>

        {/* Setup Card */}
        <motion.div variants={itemVariants}>
          <Card className="cherokee-card border-white/5 bg-gradient-to-br from-white/5 to-brand-accent/10">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 rounded-2xl bg-brand-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-5xl text-brand-accent">storefront</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">Become a Merchant</h2>
                  <p className="text-white/60 mb-4">
                    Accept payments from Cherokee Bank users directly. Set up your account in minutes.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Instant Settlement', 'Low Fees', '24/7 Support'].map((feature) => (
                      <span key={feature} className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                        <span className="material-icons text-sm">check</span>
                        {feature}
                      </span>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSetup(true)}
                    className="px-6 py-3 rounded-lg bg-brand-accent text-background-dark hover:bg-brand-accent/90 transition-colors font-medium flex items-center gap-2"
                  >
                    <span className="material-icons text-sm">add</span>
                    Create Merchant Account
                  </motion.button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-bold text-white mb-4">Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: 'trending_up', title: 'Increase Sales', desc: 'Accept more payment methods' },
              { icon: 'security', title: 'Secure', desc: 'Bank-grade security' },
              { icon: 'auto_awesome', title: 'Easy Setup', desc: 'No coding required' },
            ].map((benefit, idx) => (
              <SlideIn key={idx} direction="up" delay={idx * 75}>
                <Card className="cherokee-card border-white/5">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-brand-accent/20 flex items-center justify-center mb-4">
                      <span className="material-icons text-brand-accent">{benefit.icon}</span>
                    </div>
                    <h4 className="text-white font-bold mb-1">{benefit.title}</h4>
                    <p className="text-sm text-white/60">{benefit.desc}</p>
                  </CardContent>
                </Card>
              </SlideIn>
            ))}
          </div>
        </motion.div>
      </motion.div>
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
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">{merchantData.businessName}</h1>
            <p className="text-white/60">Merchant Portal</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Active
          </span>
        </div>
      </motion.div>

      {/* POS ID Card */}
      <motion.div variants={itemVariants}>
        <Card className="cherokee-card border-brand-accent/30 bg-gradient-to-br from-brand-accent/10 to-transparent">
          <CardContent className="p-6">
            <p className="text-white/60 text-sm mb-2">POS ID</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-mono font-bold text-brand-accent">{merchantData.posId}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="material-icons text-white/60">content_copy</span>
              </motion.button>
            </div>
            <p className="text-xs text-white/40 mt-3">Share this ID with customers for secure payments</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-bold text-white mb-4">Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue', value: '$' + merchantData.revenue.toLocaleString('en-US', { maximumFractionDigits: 2 }), icon: 'payments', color: 'from-emerald-500 to-green-500' },
            { label: 'Transactions', value: merchantData.transactions.toString(), icon: 'receipt_long', color: 'from-blue-500 to-cyan-500' },
            { label: 'Active Disputes', value: merchantData.disputes.toString(), icon: 'warning', color: 'from-amber-500 to-orange-500' },
          ].map((metric, idx) => (
            <SlideIn key={idx} direction="up" delay={idx * 75}>
              <motion.div whileHover={{ y: -4 }} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity blur`} />
                <Card className="cherokee-card border-white/5 relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="material-icons text-white/60">{metric.icon}</span>
                      <span className="text-xs text-white/40">This month</span>
                    </div>
                    <p className="text-white/60 text-sm mb-1">{metric.label}</p>
                    <p className="text-3xl font-bold text-white">{metric.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </SlideIn>
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <Card className="cherokee-card border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((_, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 4 }}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-accent/20 flex items-center justify-center">
                      <span className="material-icons text-brand-accent text-sm">payments</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Customer Transaction</p>
                      <p className="text-xs text-white/40">Today at 2:30 PM</p>
                    </div>
                  </div>
                  <p className="text-white font-bold">+$125.00</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: 'settings', label: 'Manage Settings', action: 'Configure merchant settings' },
            { icon: 'history', label: 'View Analytics', action: 'See detailed reports' },
            { icon: 'support_agent', label: 'Get Support', action: 'Contact our team' },
            { icon: 'api', label: 'API Key', action: 'Manage API credentials' },
          ].map((action, idx) => (
            <motion.button
              key={idx}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-accent/20 flex items-center justify-center group-hover:bg-brand-accent/30 transition-colors">
                  <span className="material-icons text-brand-accent text-sm">{action.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-white/40">{action.action}</p>
                </div>
                <span className="material-icons text-white/40 group-hover:text-white/60 transition-colors">arrow_forward</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
