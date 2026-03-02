'use client';

import React from 'react';
import { cn } from '@/src/utils/helpers';
import { formatCurrency } from '@/src/utils/format';

interface WalletCardProps {
  currency: string;
  balance: number;
  symbol: string;
  flag?: string;
  color: string;
  onClick?: () => void;
}

export default function WalletCard({ currency, balance, symbol, flag, color, onClick }: WalletCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl',
        'min-w-[280px]'
      )}
      style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)` }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white" />
        <div className="absolute -right-4 -bottom-12 w-48 h-48 rounded-full bg-white" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/80 text-sm font-medium">{currency} Wallet</span>
          {flag && <span className="text-2xl">{flag}</span>}
        </div>
        <div className="mb-1">
          <span className="text-3xl font-bold tracking-tight">
            {symbol}{formatCurrency(balance, currency).replace(/[^0-9.,]/g, '')}
          </span>
        </div>
        <p className="text-white/60 text-xs mt-2">Available Balance</p>
      </div>
    </div>
  );
}
