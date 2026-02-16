'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/src/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/src/components/ui/select';
import { formatCurrency } from '@/src/utils/format';

interface AdminWallet {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  currency: string;
  balance: number;
  status: 'ACTIVE' | 'FROZEN';
  createdAt: string;
}

const mockWallets: AdminWallet[] = [
  { id: 'w1', userId: '1', userName: 'John Doe', userEmail: 'john.doe@email.com', currency: 'USD', balance: 8240.50, status: 'ACTIVE', createdAt: '2025-06-15' },
  { id: 'w2', userId: '1', userName: 'John Doe', userEmail: 'john.doe@email.com', currency: 'EUR', balance: 3200.00, status: 'ACTIVE', createdAt: '2025-06-15' },
  { id: 'w3', userId: '2', userName: 'Sarah Chen', userEmail: 'sarah.chen@email.com', currency: 'USD', balance: 87210.00, status: 'ACTIVE', createdAt: '2025-09-20' },
  { id: 'w4', userId: '2', userName: 'Sarah Chen', userEmail: 'sarah.chen@email.com', currency: 'GBP', balance: 12500.00, status: 'ACTIVE', createdAt: '2025-09-20' },
  { id: 'w5', userId: '3', userName: 'Mark Wilson', userEmail: 'mark.wilson@email.com', currency: 'USD', balance: 245000.75, status: 'FROZEN', createdAt: '2025-03-01' },
  { id: 'w6', userId: '3', userName: 'Mark Wilson', userEmail: 'mark.wilson@email.com', currency: 'CHERO', balance: 150000.00, status: 'FROZEN', createdAt: '2025-03-01' },
  { id: 'w7', userId: '6', userName: 'Emma Jones', userEmail: 'emma.jones@email.com', currency: 'USD', balance: 3200.00, status: 'ACTIVE', createdAt: '2026-01-05' },
  { id: 'w8', userId: '6', userName: 'Emma Jones', userEmail: 'emma.jones@email.com', currency: 'EUR', balance: 0, status: 'ACTIVE', createdAt: '2026-01-05' },
];

export default function AdminWalletsPage() {
  const [wallets] = useState<AdminWallet[]>(mockWallets);
  const [search, setSearch] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');

  const filtered = wallets.filter((w) => {
    const matchSearch = search === '' ||
      w.userName.toLowerCase().includes(search.toLowerCase()) ||
      w.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      w.id.toLowerCase().includes(search.toLowerCase());
    const matchCurrency = currencyFilter === '' || w.currency === currencyFilter;
    return matchSearch && matchCurrency;
  });

  const totalBalance = filtered.reduce((sum, w) => sum + w.balance, 0);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h1 className="text-3xl font-extrabold text-white">Wallet Overview</h1>
        <p className="text-sm text-white/30 mt-1">All wallets across the platform</p>
      </div>

      {/* Summary */}
      <div className="cherokee-card p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/40">Total Balance (Filtered)</p>
            <p className="text-3xl font-bold text-white">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/40">Wallets Shown</p>
            <p className="text-2xl font-bold text-white">{filtered.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="cherokee-card p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by user name, email, or wallet ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select value={currencyFilter || 'ALL'} onValueChange={(v) => setCurrencyFilter(v === 'ALL' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All Currencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Currencies</SelectItem>
              <SelectItem value="USD">🇺🇸 USD</SelectItem>
              <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
              <SelectItem value="GBP">🇬🇧 GBP</SelectItem>
              <SelectItem value="CHERO">🏛️ ₵Chero</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="cherokee-card p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-white/40 border-b border-white/5">
              <th className="pb-3 font-medium">Wallet ID</th>
              <th className="pb-3 font-medium">Owner</th>
              <th className="pb-3 font-medium">Currency</th>
              <th className="pb-3 font-medium">Balance</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((wallet) => (
              <tr key={wallet.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 text-sm font-mono text-white/40">{wallet.id}</td>
                <td className="py-4">
                  <div>
                    <div className="text-sm font-medium text-white">{wallet.userName}</div>
                    <div className="text-xs text-white/40">{wallet.userEmail}</div>
                  </div>
                </td>
                <td className="py-4 text-sm text-white">{wallet.currency}</td>
                <td className="py-4 text-sm font-semibold text-white">
                  {formatCurrency(wallet.balance, wallet.currency)}
                </td>
                <td className="py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    wallet.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-orange-400 bg-orange-500/10'
                  }`}>
                    {wallet.status}
                  </span>
                </td>
                <td className="py-4">
                  <a href={`/admin/adjust-balance?walletId=${wallet.id}&userId=${wallet.userId}`} className="text-xs text-[#D4AF37] hover:underline">
                    Adjust
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}