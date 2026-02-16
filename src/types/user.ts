// Cherokee Bank - User Types

export type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN';
export type UserStatus = 'ACTIVE' | 'FROZEN' | 'SUSPENDED';
export type KYCStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  kycStatus: KYCStatus;
  twoFactorEnabled: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface UserProfile extends User {
  wallets: import('./wallet').Wallet[];
  cryptoWallets: import('./wallet').CryptoWallet[];
  kycDocuments: KYCDocument[];
}

export interface KYCDocument {
  id: string;
  userId: string;
  type: 'ID' | 'PASSPORT' | 'UTILITY_BILL' | 'SELFIE';
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: Partial<UserAddress>;
  avatarUrl?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  type: 'LOGIN' | 'PASSWORD_CHANGE' | '2FA_TOGGLE' | 'ACCOUNT_FROZEN' | 'ACCOUNT_UNFROZEN';
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}
