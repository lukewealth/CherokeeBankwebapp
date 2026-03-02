'use client';

import { motion } from 'framer-motion';
import { SlideIn } from '@/src/components/animations/loading-states';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui';
import { useState } from 'react';

const adminStats = [
  { label: 'Total Users', value: '2,543', icon: 'people', color: '#3B82F6', trend: '+12%' },
  { label: 'Total Deposits', value: '$4.2M', icon: 'account_balance', color: '#10B981', trend: '+8%' },
  { label: 'Transactions Today', value: '1,203', icon: 'receipt_long', color: '#D4AF37', trend: '+15%' },
  { label: 'Flagged Transactions', value: '23', icon: 'warning', color: '#EF4444', trend: '-5%' },
];

const recentActivities = [
  { type: 'user_signup', description: 'New user registration', count: 45, icon: 'person_add' },
  { type: 'high_transaction', description: 'High-value transaction', count: 8, icon: 'trending_up' },
  { type: 'kyc_pending', description: 'KYC documents pending', count: 12, icon: 'verified_user' },
  { type: 'security_alert', description: 'Security alerts', count: 3, icon: 'security' },
];

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

export default function AdminDashboardPage() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-white/60">System overview and management tools</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {adminStats.map((stat, index) => (
          <SlideIn key={stat.label} direction="up" delay={index * 75}>
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => setSelectedMetric(selectedMetric === stat.label ? null : stat.label)}
              className={`group cursor-pointer ${selectedMetric === stat.label ? 'ring-2 ring-brand-accent' : ''}`}
            >
              <Card className="cherokee-card border-white/5 hover:border-brand-accent/30 transition-all h-full">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white/60 text-xs font-medium mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="material-icons text-2xl group-hover:scale-110 transition-transform group-hover:text-brand-accent" style={{ color: stat.color }}>
                        {stat.icon}
                      </span>
                      <span className="text-xs text-emerald-400 font-medium">{stat.trend}</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </SlideIn>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {/* Activities */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="cherokee-card border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((activity, i) => (
                <motion.div
                  key={activity.type}
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-accent/20 flex items-center justify-center">
                      <span className="material-icons text-sm text-brand-accent">{activity.icon}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{activity.description}</p>
                      <p className="text-xs text-white/40">Last 24 hours</p>
                    </div>
                  </div>
                  <p className="text-white font-bold">{activity.count}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="cherokee-card border-white/5 h-full">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: 'manage_accounts', label: 'Manage Users', href: '/admin/users' },
                { icon: 'account_balance_wallet', label: 'Adjust Balances', href: '/admin/adjust-balance' },
                { icon: 'security', label: 'Fraud Center', href: '/admin/fraud-center' },
                { icon: 'settings', label: 'System Settings', href: '/admin/settings' },
              ].map((action, i) => (
                <motion.a
                  key={action.label}
                  href={action.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-accent/30 transition-all flex items-center gap-3 group"
                >
                  <span className="material-icons text-brand-accent group-hover:scale-125 transition-transform">{action.icon}</span>
                  <span className="text-white font-medium text-sm">{action.label}</span>
                  <span className="material-icons text-xs text-white/40 group-hover:translate-x-1 transition-transform ml-auto">arrow_forward</span>
                </motion.a>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}