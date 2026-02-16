'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
  circle?: boolean;
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`cherokee-card p-6 animate-pulse ${className}`}>
      <div className="space-y-4">
        <div className="h-4 bg-white/5 rounded w-1/3" />
        <div className="h-8 bg-white/5 rounded w-2/3" />
        <div className="h-4 bg-white/5 rounded w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number } & SkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-white/5 rounded animate-pulse" style={{
          width: i === lines - 1 ? '80%' : '100%',
          animationDelay: `${i * 50}ms`,
        }} />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' } & SkeletonProps) {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };
  return (
    <div className={`${sizes[size]} bg-white/5 rounded-full animate-pulse ${className}`} />
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="flex-1 h-10 bg-white/5 rounded" style={{ animationDelay: `${i * 50}ms` }} />
          <div className="w-24 h-10 bg-white/5 rounded" style={{ animationDelay: `${i * 50}ms` }} />
          <div className="w-20 h-10 bg-white/5 rounded" style={{ animationDelay: `${i * 50}ms` }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ columns = 3, count = 6, className = '' }: { columns?: number; count?: number } & SkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className="" style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties} />
      ))}
    </div>
  );
}
