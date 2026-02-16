'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/src/components/ui/button';
import Input from '@/src/components/ui/input';
import Select from '@/src/components/ui/select';

const docTypes = [
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVERS_LICENSE', label: "Driver's License" },
  { value: 'NATIONAL_ID', label: 'National ID Card' },
  { value: 'UTILITY_BILL', label: 'Utility Bill (Proof of Address)' },
];

export default function KycUploadPage() {
  const router = useRouter();
  const [docType, setDocType] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !docType) return;

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('docType', docType);
      formData.append('docNumber', docNumber);
      formData.append('file', file);

      const res = await fetch('/api/user/kyc', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Upload failed');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-card p-8 animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--brand-accent)]/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[var(--brand-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Document Submitted</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Your document is under review. You&apos;ll be notified once it&apos;s verified.
        </p>
        <Button onClick={() => router.push('/')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-2">KYC Verification</h2>
      <p className="text-sm text-[var(--text-muted)] text-center mb-6">
        Upload a valid identity document to verify your account
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Document Type"
          options={docTypes}
          placeholder="Select document type"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          required
        />
        <Input
          label="Document Number"
          value={docNumber}
          onChange={(e) => setDocNumber(e.target.value)}
          placeholder="e.g. AB1234567"
          required
        />
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Upload Document
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-[var(--text-muted)] file:mr-4 file:px-4 file:py-2 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[var(--brand-accent)]/10 file:text-[var(--brand-accent)] hover:file:bg-[var(--brand-accent)]/20"
            required
          />
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Submit Document
        </Button>
      </form>
    </div>
  );
}
