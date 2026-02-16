'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/src/components/layout';
import { useAuth } from '@/src/hooks/use-auth';
import Card, { CardTitle } from '@/src/components/ui/card';
import Badge from '@/src/components/ui/badge';
import Button from '@/src/components/ui/button';
import { formatCurrency, formatDate } from '@/src/utils/format';
import { PageLoader } from '@/src/components/ui/spinner';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  COMPLETED: 'success',
  PENDING: 'warning',
  FAILED: 'danger',
  PROCESSING: 'info',
  REVERSED: 'default',
};

export default function TransactionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/transactions/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setTx(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;

  if (!tx) {
    return (
      <div>
        <Header title="Transaction" user={user} />
        <div className="p-6 text-center">
          <p className="text-[var(--text-muted)]">Transaction not found.</p>
          <Button variant="outline" onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const isCredit = ['DEPOSIT', 'TRANSFER_IN', 'CRYPTO_SELL'].includes(tx.type);

  return (
    <div>
      <Header title="Transaction Details" user={user} />

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Amount Display */}
        <Card glass className="text-center">
          <p className={`text-4xl font-bold ${isCredit ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>
            {isCredit ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), tx.currency)}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant={statusVariant[tx.status] || 'default'} dot>{tx.status}</Badge>
            <span className="text-sm text-[var(--text-muted)]">{tx.type.replace(/_/g, ' ')}</span>
          </div>
        </Card>

        {/* Details */}
        <Card glass>
          <CardTitle>Details</CardTitle>
          <div className="space-y-3 mt-4">
            {[
              { label: 'Reference', value: tx.reference },
              { label: 'Type', value: tx.type.replace(/_/g, ' ') },
              { label: 'Currency', value: tx.currency },
              { label: 'Description', value: tx.description || '—' },
              { label: 'Fee', value: tx.fee ? formatCurrency(tx.fee, tx.currency) : '$0.00' },
              { label: 'Date', value: formatDate(tx.createdAt) },
              { label: 'Updated', value: formatDate(tx.updatedAt) },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-2 border-b border-[var(--border-default)] last:border-none">
                <span className="text-sm text-[var(--text-muted)]">{row.label}</span>
                <span className="text-sm font-medium text-[var(--text-primary)] text-right max-w-[60%] break-all">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Button variant="ghost" onClick={() => router.back()} className="w-full">
          ← Back to Transactions
        </Button>
      </div>
    </div>
  );
}
