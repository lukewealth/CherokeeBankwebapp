'use client';

import { useUserProfile, useUpdateProfile, useSecuritySettings, useUpdateSecuritySettings } from '@/src/hooks/use-dashboard-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui';
import { motion } from 'framer-motion';
import { SkeletonCard } from '@/src/components/animations/skeleton-loader';
import { TransitionFade } from '@/src/components/animations/loading-states';
import { useState } from 'react';
import { LoadingSpinner } from '@/src/components/animations/loading-states';
import { useRouter } from 'next/navigation';

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

export default function SettingsPage() {
  const router = useRouter();
  const { data: profileData, loading: profileLoading } = useUserProfile();
  const { data: security, loading: securityLoading } = useSecuritySettings();
  const { mutate: updateProfile, loading: updatingProfile } = useUpdateProfile();
  const { mutate: updateSecurity, loading: updatingSecurity } = useUpdateSecuritySettings();

  const profile = (profileData as any)?.user ?? profileData;

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'privacy'>('profile');
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });


  if (profileLoading || securityLoading) {
    return (
      <TransitionFade>
        <div className="space-y-4">
          <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
          <SkeletonCard />
          <SkeletonCard />
        </div>
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
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/60">Manage your account and preferences</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 border-b border-white/10">
        {[
          { id: 'profile', icon: 'person', label: 'Profile' },
          { id: 'security', icon: 'security', label: 'Security' },
          { id: 'privacy', icon: 'privacy_tip', label: 'Privacy' },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ y: -2 }}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-brand-accent text-brand-accent'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <span className="material-icons text-lg">{tab.icon}</span>
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        variants={containerVariants}
      >
        {activeTab === 'profile' && (
          <>
            {/* Profile Card */}
            <motion.div variants={itemVariants}>
              <Card className="cherokee-card border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-end gap-6">
                    <div className="w-20 h-20 rounded-lg bg-brand-accent/20 flex items-center justify-center shrink-0">
                      <span className="material-icons text-4xl text-brand-accent">account_circle</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 rounded-lg bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent transition-colors text-sm font-medium"
                    >
                      Change Avatar
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">First Name</label>
                      <input
                        type="text"
                        defaultValue={profile?.firstName}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Last Name</label>
                      <input
                        type="text"
                        defaultValue={profile?.lastName}
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
                        placeholder="Last name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={profile?.email}
                        disabled
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 placeholder:text-white/40 focus:outline-none cursor-not-allowed"
                      />
                      <p className="text-xs text-white/40 mt-1">Email address cannot be changed</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={updatingProfile}
                    className="w-full py-3 rounded-lg bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {updatingProfile && <LoadingSpinner size="sm" />}
                    Save Changes
                  </motion.button>
                </CardContent>
              </Card>
            </motion.div>

            {/* KYC Status */}
            <motion.div variants={itemVariants}>
              <Card className="cherokee-card border-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Verification Status</span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      Pending
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/60 text-sm">Complete your identity verification to unlock all features</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-lg bg-brand-accent text-background-dark font-medium hover:bg-brand-accent/90 transition-colors"
                  >
                    Start Verification
                  </motion.button>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {activeTab === 'security' && (
          <>
            {/* 2FA */}
            <motion.div variants={itemVariants}>
              <Card className="cherokee-card border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <span className="material-icons text-amber-400">security</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Authenticator App</p>
                        <p className="text-xs text-white/40">Not enabled</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent transition-colors text-sm font-medium"
                    >
                      Enable
                    </motion.button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <Card className="cherokee-card border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-lg bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent transition-colors font-medium"
                  >
                    Update Password
                  </motion.button>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {activeTab === 'privacy' && (
          <motion.div variants={itemVariants}>
            <Card className="cherokee-card border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Privacy & Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    { icon: 'analytics', label: 'Analytics', desc: 'Allow us to collect usage analytics' },
                    { icon: 'notifications', label: 'Notifications', desc: 'Receive email and push notifications' },
                    { icon: 'visibility', label: 'Profile Visibility', desc: 'Make your profile public' },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      whileHover={{ x: 2 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-icons text-brand-accent">{item.icon}</span>
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-xs text-white/40">{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative w-10 h-6 rounded-full bg-white/10 cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="absolute inset-0.5 rounded-full bg-brand-accent/20 peer-checked:bg-brand-accent transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white peer-checked:translate-x-4 transition-transform" />
                      </label>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
