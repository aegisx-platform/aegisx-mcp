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
  roleId: string;
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
