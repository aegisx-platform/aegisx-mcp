// Import and re-export types from schemas for convenience
import {
  type ApiKeys,
  type CreateApiKeys,
  type UpdateApiKeys,
  type ApiKeysIdParam,
  type GetApiKeysQuery,
  type ListApiKeysQuery
} from './apiKeys.schemas';

export {
  type ApiKeys,
  type CreateApiKeys,
  type UpdateApiKeys,
  type ApiKeysIdParam,
  type GetApiKeysQuery,
  type ListApiKeysQuery
};

// Additional type definitions
export interface ApiKeysRepository {
  create(data: CreateApiKeys): Promise<ApiKeys>;
  findById(id: number | string): Promise<ApiKeys | null>;
  findMany(query: ListApiKeysQuery): Promise<{
    data: ApiKeys[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
  update(id: number | string, data: UpdateApiKeys): Promise<ApiKeys | null>;
  delete(id: number | string): Promise<boolean>;
}


// Database entity type (matches database table structure exactly)
export interface ApiKeysEntity {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  scopes: Record<string, any> | null;
  last_used_at: Date | null;
  last_used_ip: string | null;
  expires_at: Date | null;
  is_active: boolean | null;
  created_at: Date;
  updated_at: Date;
}