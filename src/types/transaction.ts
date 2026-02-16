// Cherokee Bank - Transaction Types

export type TransactionType =
  | 'TRANSFER'
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'CONVERSION'
  | 'POS_PAYMENT'
  | 'CRYPTO_BUY'
  | 'CRYPTO_SELL';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'FLAGGED' | 'HELD';

export interface Transaction {
  id: string;
  fromWalletId?: string;
  toWalletId?: string;
  type: TransactionType;
  amount: number;
  fee: number;
  currency: string;
  status: TransactionStatus;
  reference: string;
  blockchainTxHash?: string;
  riskScore?: number;
  description?: string;
  recipientName?: string;
  senderName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDetail extends Transaction {
  fromWallet?: {
    id: string;
    currency: string;
    user: { id: string; firstName: string; lastName: string; email: string };
  };
  toWallet?: {
    id: string;
    currency: string;
    user: { id: string; firstName: string; lastName: string; email: string };
  };
}

export interface CreateTransferInput {
  fromWalletId: string;
  toWalletId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface TransactionFilter {
  userId?: string;
  walletId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
