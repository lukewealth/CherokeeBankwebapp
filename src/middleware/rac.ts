// Cherokee Bank - Role Access Control (RAC) Middleware

export enum Permission {
  // User permissions
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  MANAGE_WALLETS = 'MANAGE_WALLETS',
  MAKE_TRANSFERS = 'MAKE_TRANSFERS',
  VIEW_TRANSACTIONS = 'VIEW_TRANSACTIONS',
  MANAGE_CRYPTO = 'MANAGE_CRYPTO',
  USE_AI_ASSISTANT = 'USE_AI_ASSISTANT',
  MANAGE_PROFILE = 'MANAGE_PROFILE',
  SUBMIT_KYC = 'SUBMIT_KYC',
  
  // Merchant permissions
  MANAGE_MERCHANT = 'MANAGE_MERCHANT',
  PROCESS_POS = 'PROCESS_POS',
  FILE_DISPUTE = 'FILE_DISPUTE',
  
  // Admin permissions
  VIEW_ALL_USERS = 'VIEW_ALL_USERS',
  MANAGE_USERS = 'MANAGE_USERS',
  FREEZE_ACCOUNTS = 'FREEZE_ACCOUNTS',
  ADJUST_BALANCES = 'ADJUST_BALANCES',
  REVIEW_KYC = 'REVIEW_KYC',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  MANAGE_FRAUD = 'MANAGE_FRAUD',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  
  // Super admin permissions
  MANAGE_ADMINS = 'MANAGE_ADMINS',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  MANAGE_ROLES = 'MANAGE_ROLES',
}

// Role-permission mapping
const rolePermissions: Record<string, Permission[]> = {
  USER: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_WALLETS,
    Permission.MAKE_TRANSFERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.MANAGE_CRYPTO,
    Permission.USE_AI_ASSISTANT,
    Permission.MANAGE_PROFILE,
    Permission.SUBMIT_KYC,
    Permission.MANAGE_MERCHANT,
    Permission.PROCESS_POS,
    Permission.FILE_DISPUTE,
  ],
  ADMIN: [
    // All USER permissions
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_WALLETS,
    Permission.MAKE_TRANSFERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.MANAGE_CRYPTO,
    Permission.USE_AI_ASSISTANT,
    Permission.MANAGE_PROFILE,
    Permission.SUBMIT_KYC,
    Permission.MANAGE_MERCHANT,
    Permission.PROCESS_POS,
    Permission.FILE_DISPUTE,
    // Admin-specific
    Permission.VIEW_ALL_USERS,
    Permission.MANAGE_USERS,
    Permission.FREEZE_ACCOUNTS,
    Permission.ADJUST_BALANCES,
    Permission.REVIEW_KYC,
    Permission.VIEW_AUDIT_LOGS,
    Permission.MANAGE_FRAUD,
    Permission.VIEW_ANALYTICS,
  ],
  SUPERADMIN: [
    // All permissions
    ...Object.values(Permission),
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Check if a role has ALL specified permissions
 */
export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: string): Permission[] {
  return rolePermissions[role] || [];
}
