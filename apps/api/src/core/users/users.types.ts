export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deleted_at?: Date | null;
  deletion_reason?: string | null;
  recovery_deadline?: Date | null;
  avatar?: string | null;
  bio?: string | null;
  isEmailVerified?: boolean;
}

export interface UserWithRole extends User {
  role: string;
  roleId: string;
}

export interface UserCreateData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleId?: string; // Optional - can be provided directly
  role?: string; // Optional - role name to be converted to roleId
  isActive?: boolean;
}

export interface UserUpdateData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UserListOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BulkOperationResult {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    userId: string;
    success: boolean;
    error?: {
      code: string;
      message: string;
    };
  }>;
  summary: {
    message: string;
    hasFailures: boolean;
  };
}
