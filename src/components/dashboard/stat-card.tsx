'use client';

import React from 'react';
import { Card } from '@/src/components/ui/card';
import { cn } from '@/src/utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color?: string;
}

export default function StatCard({ title, value, change, changeType = 'neutral', icon, color }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--text-muted)] font-medium">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
          {change && (
            <p className={cn(
              'text-xs font-medium mt-2',
              changeType === 'positive' && 'text-emerald-500',
              changeType === 'negative' && 'text-red-500',
              changeType === 'neutral' && 'text-[var(--text-muted)]',
            )}>
              {changeType === 'positive' && '↑ '}
              {changeType === 'negative' && '↓ '}
              {change}
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: color ? `${color}15` : 'var(--brand-accent)15' }}
        >
          <span style={{ color: color || 'var(--brand-accent)' }}>{icon}</span>
        </div>
      </div>
    </Card>
  );
}
