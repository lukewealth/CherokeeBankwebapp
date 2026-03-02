import { User, KYCDocument } from './user';
import { Wallet } from './wallet';
import { Transaction } from './transaction';

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  totalTransactionsToday: number;
  flaggedTransactions: number;
  pendingKYC: number;
  totalRevenue: number;
  userGrowth: GrowthDataPoint[];
  transactionVolume: GrowthDataPoint[];
  revenueByDay: GrowthDataPoint[];
}

export interface GrowthDataPoint {
  date: string;
  value: number;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

export interface FraudReport {
  id: string;
  transactionId: string;
  transaction?: Transaction;
  riskScore: number;
  flags: string[];
  status: 'OPEN' | 'REVIEWED' | 'DISMISSED' | 'ESCALATED';
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceAdjustment {
  userId: string;
  walletId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  reason: string;
}

export interface AdminUserView extends User {
  wallets: Wallet[];
  kycDocuments: KYCDocument[];
  transactionCount: number;
  totalBalance: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface KYCReviewAction {
  documentId: string;
  action: 'APPROVE' | 'REJECT';
  notes?: string;
}
