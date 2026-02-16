'use client';

import React from 'react';

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' } = {}) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`${sizes[size]} border-white border-t-brand-accent rounded-full animate-spin ${className}`} />
  );
}

export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-brand-accent rounded-full animate-bounce"
          style={{
            animationDelay: `${i * 150}ms`,
            animationDuration: '1.5s',
          }}
        />
      ))}
    </div>
  );
}

export function LoadingOverlay({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background-dark/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-50 animate-in fade-in">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background-dark to-background-dark/95">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-white/60 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}

export function TransitionFade({ children, duration = 200 }: { children: React.ReactNode; duration?: number }) {
  return (
    <div
      className="animate-in fade-in"
      style={{
        animationDuration: `${duration}ms`,
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  );
}

export function SlideIn({ children, direction = 'up', delay = 0 }: { children: React.ReactNode; direction?: 'up' | 'down' | 'left' | 'right'; delay?: number }) {
  const directions = {
    up: 'slide-in-from-bottom-4',
    down: 'slide-in-from-top-4',
    left: 'slide-in-from-right-4',
    right: 'slide-in-from-left-4',
  };

  return (
    <div
      className={`animate-in ${directions[direction]} fade-in`}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        animationDuration: '400ms',
      }}
    >
      {children}
    </div>
  );
}

export function ScaleIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="animate-in zoom-in fade-in"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        animationDuration: '300ms',
      }}
    >
      {children}
    </div>
  );
}

export function PulseCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-pulse">
      {children}
    </div>
  );
}
