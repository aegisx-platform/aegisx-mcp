// Import and re-export types from schemas for convenience
import {
  type Users,
  type CreateUsers,
  type UpdateUsers,
  type UsersIdParam,
  type GetUsersQuery,
  type ListUsersQuery
} from './users.schemas';

export {
  type Users,
  type CreateUsers,
  type UpdateUsers,
  type UsersIdParam,
  type GetUsersQuery,
  type ListUsersQuery
};

// Additional type definitions
export interface UsersRepository {
  create(data: CreateUsers): Promise<Users>;
  findById(id: number | string): Promise<Users | null>;
  findMany(query: ListUsersQuery): Promise<{
    data: Users[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateUsers): Promise<Users | null>;
  delete(id: number | string): Promise<boolean>;
}


// Database entity type (matches database table structure exactly)
export interface UsersEntity {
  id: string;
  email: string;
  username: string;
  password: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
  avatar_url: string | null;
  name: string | null;
  status: string | null;
  email_verified: boolean | null;
  email_verified_at: Date | null;
  two_factor_enabled: boolean | null;
  two_factor_secret: string | null;
  two_factor_backup_codes: Record<string, any> | null;
  deleted_at: Date | null;
  bio: string | null;
  timezone: string | null;
  language: string | null;
  date_of_birth: Date | null;
  phone: string | null;
  deletion_reason: string | null;
  recovery_deadline: Date | null;
  deleted_by_ip: string | null;
  deleted_by_user_agent: string | null;
}