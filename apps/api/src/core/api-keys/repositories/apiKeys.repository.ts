import { BaseRepository, BaseListQuery, PaginatedListResult } from '../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateApiKeys,
  type UpdateApiKeys,
  type ApiKeys,
  type GetApiKeysQuery,
  type ListApiKeysQuery,
  type ApiKeysEntity
} from '../types/apiKeys.types';

export interface ApiKeysListQuery extends BaseListQuery {
  // Add specific filters for ApiKeys

  user_id?: string;
  

  name?: string;
  

  key_hash?: string;
  

  key_prefix?: string;
  



  last_used_ip?: string;
  

  is_active?: boolean;
  

}

export class ApiKeysRepository extends BaseRepository<ApiKeys, CreateApiKeys, UpdateApiKeys> {

  constructor(knex: Knex) {
    super(
      knex,
      'api_keys',
      [
        // Define searchable fields
        '.user_id',
        '.name',
        '.key_hash',
        '.key_prefix',
        '.last_used_ip',
      ]
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): ApiKeys {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      user_id: dbRow.user_id,
      name: dbRow.name,
      key_hash: dbRow.key_hash,
      key_prefix: dbRow.key_prefix,
      scopes: dbRow.scopes,
      last_used_at: dbRow.last_used_at,
      last_used_ip: dbRow.last_used_ip,
      expires_at: dbRow.expires_at,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateApiKeys | UpdateApiKeys): Partial<ApiKeysEntity> {
    const transformed: Partial<ApiKeysEntity> = {};

    if ('user_id' in dto && dto.user_id !== undefined) {
      transformed.user_id = dto.user_id;
    }
    if ('name' in dto && dto.name !== undefined) {
      transformed.name = dto.name;
    }
    if ('key_hash' in dto && dto.key_hash !== undefined) {
      transformed.key_hash = dto.key_hash;
    }
    if ('key_prefix' in dto && dto.key_prefix !== undefined) {
      transformed.key_prefix = dto.key_prefix;
    }
    if ('scopes' in dto && dto.scopes !== undefined) {
      transformed.scopes = dto.scopes;
    }
    if ('last_used_at' in dto && dto.last_used_at !== undefined) {
      transformed.last_used_at = typeof dto.last_used_at === 'string' ? new Date(dto.last_used_at) : dto.last_used_at;
    }
    if ('last_used_ip' in dto && dto.last_used_ip !== undefined) {
      transformed.last_used_ip = dto.last_used_ip;
    }
    if ('expires_at' in dto && dto.expires_at !== undefined) {
      transformed.expires_at = typeof dto.expires_at === 'string' ? new Date(dto.expires_at) : dto.expires_at;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('api_keys')
      .select('api_keys.*');
      // Add joins here if needed
      // .leftJoin('other_table', 'api_keys.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: ApiKeysListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific ApiKeys filters
    if (filters.user_id !== undefined) {
      query.where('.user_id', filters.user_id);
    }
    if (filters.name !== undefined) {
      query.where('.name', filters.name);
    }
    if (filters.key_hash !== undefined) {
      query.where('.key_hash', filters.key_hash);
    }
    if (filters.key_prefix !== undefined) {
      query.where('.key_prefix', filters.key_prefix);
    }
    if (filters.scopes !== undefined) {
      query.where('.scopes', filters.scopes);
    }
    if (filters.last_used_at !== undefined) {
      query.where('.last_used_at', filters.last_used_at);
    }
    if (filters.last_used_ip !== undefined) {
      query.where('.last_used_ip', filters.last_used_ip);
    }
    if (filters.expires_at !== undefined) {
      query.where('.expires_at', filters.expires_at);
    }
    if (filters.is_active !== undefined) {
      query.where('.is_active', filters.is_active);
    }
    if (filters.updated_at !== undefined) {
      query.where('.updated_at', filters.updated_at);
    }
  }

  // Custom sort fields mapping
  protected getSortField(sortBy: string): string {
    const sortFields: Record<string, string> = {
      id: '.id',
      userId: '.user_id',
      name: '.name',
      keyHash: '.key_hash',
      keyPrefix: '.key_prefix',
      scopes: '.scopes',
      lastUsedAt: '.last_used_at',
      lastUsedIp: '.last_used_ip',
      expiresAt: '.expires_at',
      isActive: '.is_active',
      createdAt: '.created_at',
      updatedAt: '.updated_at'
    };

    return sortFields[sortBy] || 'api_keys.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetApiKeysQuery = {}
  ): Promise<ApiKeys | null> {
    let query = this.getJoinQuery();
    query = query.where('api_keys.id', id);

    // Handle include options
    if (options.include) {
      const includes = Array.isArray(options.include) ? options.include : [options.include];
      includes.forEach(relation => {
        // TODO: Add join logic for relationships
        // Example: if (relation === 'category') query.leftJoin('categories', 'items.category_id', 'categories.id');
      });
    }

    const row = await query.first();
    return row ? this.transformToEntity(row) : null;
  }

  // Extended list method with specific query type
  async list(query: ApiKeysListQuery = {}): Promise<PaginatedListResult<ApiKeys>> {
    return super.list(query);
  }

  // Additional business-specific methods
  
  async findByUserId(userId: string): Promise<ApiKeys | null> {
    const query = this.getJoinQuery();
    const row = await query.where('api_keys.user_id', userId).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByName(name: string): Promise<ApiKeys | null> {
    const query = this.getJoinQuery();
    const row = await query.where('api_keys.name', name).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByKeyHash(keyHash: string): Promise<ApiKeys | null> {
    const query = this.getJoinQuery();
    const row = await query.where('api_keys.key_hash', keyHash).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByKeyPrefix(keyPrefix: string): Promise<ApiKeys | null> {
    const query = this.getJoinQuery();
    const row = await query.where('api_keys.key_prefix', keyPrefix).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByLastUsedIp(lastUsedIp: string): Promise<ApiKeys | null> {
    const query = this.getJoinQuery();
    const row = await query.where('api_keys.last_used_ip', lastUsedIp).first();
    return row ? this.transformToEntity(row) : null;
  }


  // Statistics and aggregation methods
  async getStats(): Promise<{
    total: number;
    isActiveCount: number;
  }> {
    const stats: any = await this.knex('api_keys')
      .select([
        this.knex.raw('COUNT(*) as total'),
        this.knex.raw('COUNT(*) FILTER (WHERE is_active = true) as isActive_count')
      ])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
      isActiveCount: parseInt(stats?.isActive_count || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateApiKeys[]): Promise<ApiKeys[]> {
    const transformedData = data.map(item => this.transformToDb(item));
    const rows = await this.knex('api_keys').insert(transformedData).returning('*');
    return rows.map(row => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateApiKeys): Promise<ApiKeys> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('api_keys').insert(transformedData).returning('*');
      return this.transformToEntity(row);
    });
  }
}