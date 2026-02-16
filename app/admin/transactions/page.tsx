'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '@/src/components/ui/input';
import Select from '@/src/components/ui/select';
import Badge from '@/src/components/ui/badge';
import { formatCurrency, formatDate } from '@/src/utils/format';

interface AdminTransaction {
  id: string;
  reference: string;
  type: string;
  fromUser: string;
  toUser: string;
  amount: number;
  fee: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'FLAGGED' | 'HELD';
  riskScore: number;
  createdAt: string;
}

const mockTransactions: AdminTransaction[] = [
  { id: '1', reference: 'TXN-MK1A2B3C', type: 'TRANSFER', fromUser: 'John Doe', toUser: 'Sarah Chen', amount: 2500, fee: 2.50, currency: 'USD', status: 'COMPLETED', riskScore: 12, createdAt: '2026-02-15T09:30:00Z' },
  { id: '2', reference: 'TXN-MK4D5E6F', type: 'DEPOSIT', fromUser: 'External', toUser: 'Emma Jones', amount: 15000, fee: 0, currency: 'EUR', status: 'COMPLETED', riskScore: 5, createdAt: '2026-02-15T09:15:00Z' },
  { id: '3', reference: 'TXN-FL1A2B', type: 'TRANSFER', fromUser: 'Unknown IP', toUser: 'Mark Wilson', amount: 48500, fee: 48.50, currency: 'USD', status: 'FLAGGED', riskScore: 92, createdAt: '2026-02-15T08:22:00Z' },
  { id: '4', reference: 'TXN-MK7G8H9I', type: 'CRYPTO_BUY', fromUser: 'Omar Hassan', toUser: 'System', amount: 5000, fee: 25, currency: 'USD', status: 'COMPLETED', riskScore: 18, createdAt: '2026-02-15T08:00:00Z' },
  { id: '5', reference: 'TXN-FL3C4D', type: 'WITHDRAWAL', fromUser: 'Sarah Chen', toUser: 'External', amount: 125000, fee: 125, currency: 'EUR', status: 'HELD', riskScore: 87, createdAt: '2026-02-15T07:15:00Z' },
  { id: '6', reference: 'TXN-MK0J1K2L', type: 'POS_PAYMENT', fromUser: 'John Doe', toUser: 'Merchant - Coffee Shop', amount: 12.50, fee: 0.13, currency: 'USD', status: 'COMPLETED', riskScore: 2, createdAt: '2026-02-15T07:00:00Z' },
  { id: '7', reference: 'TXN-MK3M4N5O', type: 'CONVERSION', fromUser: 'Emma Jones', toUser: 'Emma Jones', amount: 1000, fee: 5, currency: 'USD', status: 'COMPLETED', riskScore: 8, createdAt: '2026-02-14T22:30:00Z' },
  { id: '8', reference: 'TXN-MK6P7Q8R', type: 'TRANSFER', fromUser: 'Mark Wilson', toUser: 'John Doe', amount: 500, fee: 0.50, currency: 'GBP', status: 'FAILED', riskScore: 15, createdAt: '2026-02-14T20:00:00Z' },
];

export default function AdminTransactionsPage() {
  const [transactions] = useState<AdminTransaction[]>(mockTransactions);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = transactions.filter((tx) => {
    const matchSearch = search === '' ||
      tx.reference.toLowerCase().includes(search.toLowerCase()) ||
      tx.fromUser.toLowerCase().includes(search.toLowerCase()) ||
      tx.toUser.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === '' || tx.type === typeFilter;
    const matchStatus = statusFilter === '' || tx.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success' as const;
      case 'PENDING': return 'warning' as const;
      case 'FAILED': return 'danger' as const;
      case 'FLAGGED': return 'danger' as const;
      case 'HELD': return 'warning' as const;
      default: return 'default' as const;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-emerald-400';
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h1 className="text-3xl font-extrabold text-white">Transaction Ledger</h1>
        <p className="text-sm text-white/30 mt-1">Complete transaction history across the platform</p>
      </div>

      {/* Filters */}
      <div className="cherokee-card p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by reference, sender, or recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            options={[
              { value: '', label: 'All Types' },
              { value: 'TRANSFER', label: 'Transfer' },
              { value: 'DEPOSIT', label: 'Deposit' },
              { value: 'WITHDRAWAL', label: 'Withdrawal' },
              { value: 'CONVERSION', label: 'Conversion' },
              { value: 'POS_PAYMENT', label: 'POS Payment' },
              { value: 'CRYPTO_BUY', label: 'Crypto Buy' },
              { value: 'CRYPTO_SELL', label: 'Crypto Sell' },
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'FAILED', label: 'Failed' },
              { value: 'FLAGGED', label: 'Flagged' },
              { value: 'HELD', label: 'Held' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="cherokee-card p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-white/40 border-b border-white/5">
              <th className="pb-3 font-medium">Reference</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">From</th>
              <th className="pb-3 font-medium">To</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Fee</th>
              <th className="pb-3 font-medium">Risk</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 text-sm font-mono text-[#D4AF37]">{tx.reference}</td>
                <td className="py-4 text-xs font-medium text-white/40 uppercase">{tx.type.replace('_', ' ')}</td>
                <td className="py-4 text-sm text-white">{tx.fromUser}</td>
                <td className="py-4 text-sm text-white">{tx.toUser}</td>
                <td className="py-4 text-sm font-semibold text-white">
                  {formatCurrency(tx.amount, tx.currency)}
                </td>
                <td className="py-4 text-sm text-white/40">
                  {formatCurrency(tx.fee, tx.currency)}
                </td>
                <td className="py-4">
                  <span className={`text-sm font-bold ${getRiskColor(tx.riskScore)}`}>{tx.riskScore}</span>
                </td>
                <td className="py-4">
                  <Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge>
                </td>
                <td className="py-4 text-sm text-white/40">
                  {formatDate(tx.createdAt, 'relative')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}