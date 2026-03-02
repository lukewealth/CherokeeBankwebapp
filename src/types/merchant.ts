// Cherokee Bank - Merchant Types

export enum MerchantStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  posId: string;
  settlementWalletId: string;
  status: MerchantStatus;
  totalRevenue: number;
  transactionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface POSTransaction {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  customerWalletId: string;
  status: string;
  reference: string;
  createdAt: Date;
}

export interface Dispute {
  id: string;
  transactionId: string;
  merchantId: string;
  customerId: string;
  reason: string;
  status: DisputeStatus;
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface CreateMerchantInput {
  businessName: string;
  businessType: string;
  settlementWalletId: string;
}

export interface CreateDisputeInput {
  transactionId: string;
  reason: string;
}
