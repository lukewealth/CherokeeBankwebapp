'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { TransitionFade, SlideIn } from '@/src/components/animations/loading-states';

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

export default function AdminSettingsPage() {
  const [cheroPeg, setCheroPeg] = useState('1.00');
  const [transferFee, setTransferFee] = useState('0.10');
  const [conversionFee, setConversionFee] = useState('0.50');
  const [cryptoFee, setCryptoFee] = useState('0.50');
  const [posFee, setPosFee] = useState('1.00');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [maxTransferLimit, setMaxTransferLimit] = useState('500000');
  const [maxDailyLimit, setMaxDailyLimit] = useState('1000000');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
        <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-white/60">Configure Cherokee Bank platform settings and parameters</p>
      </motion.div>

      {/* Success Alert */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2"
        >
          <span className="material-icons text-lg">check_circle</span>
          Settings saved successfully.
        </motion.div>
      )}

      {/* Cherokee Coin Settings */}
      <motion.div variants={itemVariants}>
        <Card className="cherokee-card border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="material-icons">token</span>
              Cherokee Coin Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">₵Chero / USD Peg Rate</label>
                <input
                  type="number"
                  value={cheroPeg}
                  onChange={(e) => setCheroPeg(e.target.value)}
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
              </div>
              <div className="flex items-end">
                <div className="p-4 rounded-lg bg-brand-accent/10 border border-brand-accent/20 w-full">
                  <p className="text-xs text-white/60 mb-1">Current Peg</p>
                  <p className="text-lg font-bold text-brand-accent">1 ₵CHERO = ${cheroPeg} USD</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fee Configuration */}
      <motion.div variants={itemVariants}>
        <Card className="cherokee-card border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="material-icons">percent</span>
              Fee Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Transfer Fee', value: transferFee, setter: setTransferFee, icon: 'swap_horiz' },
                { label: 'Conversion Fee', value: conversionFee, setter: setConversionFee, icon: 'currency_exchange' },
                { label: 'Crypto Fee', value: cryptoFee, setter: setCryptoFee, icon: 'currency_bitcoin' },
                { label: 'POS Fee', value: posFee, setter: setPosFee, icon: 'credit_card' },
              ].map((fee) => (
                <div key={fee.label}>
                  <label className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                    <span className="material-icons text-sm text-brand-accent">{fee.icon}</span>
                    {fee.label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={fee.value}
                      onChange={(e) => fee.setter(e.target.value)}
                      step="0.01"
                      className="w-full px-4 py-3 pr-8 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
                    />
                    <span className="absolute right-3 top-3 text-white/40">%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction Limits */}
      <motion.div variants={itemVariants}>
        <Card className="cherokee-card border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="material-icons">trending_up</span>
              Transaction Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Max Single Transfer (USD)</label>
                <input
                  type="number"
                  value={maxTransferLimit}
                  onChange={(e) => setMaxTransferLimit(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Max Daily Total (USD)</label>
                <input
                  type="number"
                  value={maxDailyLimit}
                  onChange={(e) => setMaxDailyLimit(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Controls */}
      <motion.div variants={itemVariants}>
        <Card className="cherokee-card border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="material-icons">settings</span>
              System Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              {
                label: 'Maintenance Mode',
                description: 'When enabled, users see a maintenance page. Admin access remains active.',
                value: maintenanceMode,
                setter: setMaintenanceMode,
                danger: true,
              },
              {
                label: 'Open Registration',
                description: 'Allow new users to register accounts.',
                value: registrationOpen,
                setter: setRegistrationOpen,
                danger: false,
              },
            ].map((toggle) => (
              <motion.div
                key={toggle.label}
                whileHover={{ x: 2 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-medium">{toggle.label}</p>
                  <p className="text-xs text-white/40 mt-1">{toggle.description}</p>
                </div>
                <label className="relative w-12 h-7 rounded-full bg-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={toggle.value}
                    onChange={() => toggle.setter(!toggle.value)}
                    className="sr-only peer"
                  />
                  <div className={`absolute inset-0.5 rounded-full transition-colors ${
                    toggle.value
                      ? toggle.danger
                        ? 'bg-red-500'
                        : 'bg-emerald-500'
                      : 'bg-white/20'
                  }`} />
                  <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white peer-checked:translate-x-5 transition-transform`} />
                </label>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className="w-full md:w-auto px-8 py-3 rounded-lg bg-brand-accent text-background-dark hover:bg-brand-accent/90 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-background-dark border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <span className="material-icons text-lg">save</span>
              Save Settings
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}