'use client';

import React from 'react';
import { Card } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all duration-200 group"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: `${action.color}15` }}
            >
              <span style={{ color: action.color }}>{action.icon}</span>
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
