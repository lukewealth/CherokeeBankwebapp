'use client';

import React from 'react';
import Badge from '@/src/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/src/utils/format';

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  description?: string;
  createdAt: string;
  reference: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  onRowClick?: (id: string) => void;
}

const typeIcons: Record<string, string> = {
  DEPOSIT: '↓',
  WITHDRAWAL: '↑',
  TRANSFER_IN: '←',
  TRANSFER_OUT: '→',
  CRYPTO_BUY: '₿',
  CRYPTO_SELL: '💰',
  POS_PAYMENT: '🏪',
  FEE: '📋',
};

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  COMPLETED: 'success',
  PENDING: 'warning',
  FAILED: 'danger',
  PROCESSING: 'info',
  REVERSED: 'default',
};

export default function TransactionTable({ transactions, onRowClick }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-[var(--text-muted)]">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border-default)]">
            <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Type</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Description</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Status</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Amount</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-default)]">
          {transactions.map((tx) => {
            const isCredit = ['DEPOSIT', 'TRANSFER_IN', 'CRYPTO_SELL'].includes(tx.type);
            return (
              <tr
                key={tx.id}
                onClick={() => onRowClick?.(tx.id)}
                className="hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{typeIcons[tx.type] || '•'}</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {tx.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {tx.description || tx.reference}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={statusVariant[tx.status] || 'default'} dot>
                    {tx.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`text-sm font-semibold ${isCredit ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>
                    {isCredit ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-xs text-[var(--text-muted)]">
                    {formatDateTime(tx.createdAt)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
