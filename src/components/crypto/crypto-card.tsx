'use client';

import React from 'react';
import { cn } from '@/src/utils/helpers';

interface CryptoCardProps {
  name: string;
  symbol: string;
  icon: string;
  price: number;
  change24h: number;
  balance: number;
  value: number;
  color: string;
}

export default function CryptoCard({ name, symbol, icon, price, change24h, balance, value, color }: CryptoCardProps) {
  const isPositive = change24h >= 0;

  return (
    <div className="glass-card p-5 hover:border-[var(--brand-accent)]/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ background: `${color}15` }}
          >
            {icon}
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">{name}</p>
            <p className="text-xs text-[var(--text-muted)]">{symbol}</p>
          </div>
        </div>
        <div className={cn(
          'text-xs font-medium px-2 py-1 rounded-full',
          isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        )}>
          {isPositive ? '+' : ''}{change24h.toFixed(2)}%
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-muted)]">Price</span>
          <span className="font-medium text-[var(--text-primary)]">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-muted)]">Balance</span>
          <span className="font-medium text-[var(--text-primary)]">{balance} {symbol}</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-[var(--border-default)]">
          <span className="text-[var(--text-muted)]">Value</span>
          <span className="font-semibold text-[var(--text-primary)]">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}
