import { BaseRepository, BaseListQuery, PaginatedListResult } from '../../shared/repositories/base.repository';
import { Knex } from 'knex';
import {
  type CreateSystemSettings,
  type UpdateSystemSettings,
  type SystemSettings,
  type GetSystemSettingsQuery,
  type ListSystemSettingsQuery,
  type SystemSettingsEntity
} from './systemSettings.types';

export interface SystemSettingsListQuery extends BaseListQuery {
  // Add specific filters for SystemSettings

  category?: string;
  

  key?: string;
  

  value?: string;
  

  data_type?: string;
  

  description?: string;
  
  is_public?: boolean;
  
  requires_restart?: boolean;
  

}

export class SystemSettingsRepository extends BaseRepository<SystemSettings, CreateSystemSettings, UpdateSystemSettings> {

  constructor(knex: Knex) {
    super(
      knex,
      'system_settings',
      [
        // Define searchable fields
        '.category',
        '.key',
        '.value',
        '.data_type',
        '.description',
      ]
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): SystemSettings {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      category: dbRow.category,
      key: dbRow.key,
      value: dbRow.value,
      data_type: dbRow.data_type,
      description: dbRow.description,
      is_public: dbRow.is_public,
      requires_restart: dbRow.requires_restart,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateSystemSettings | UpdateSystemSettings): Partial<SystemSettingsEntity> {
    const transformed: Partial<SystemSettingsEntity> = {};

    if ('category' in dto && dto.category !== undefined) {
      transformed.category = dto.category;
    }
    if ('key' in dto && dto.key !== undefined) {
      transformed.key = dto.key;
    }
    if ('value' in dto && dto.value !== undefined) {
      transformed.value = dto.value;
    }
    if ('data_type' in dto && dto.data_type !== undefined) {
      transformed.data_type = dto.data_type;
    }
    if ('description' in dto && dto.description !== undefined) {
      transformed.description = dto.description;
    }
    if ('is_public' in dto && dto.is_public !== undefined) {
      transformed.is_public = dto.is_public;
    }
    if ('requires_restart' in dto && dto.requires_restart !== undefined) {
      transformed.requires_restart = dto.requires_restart;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('system_settings')
      .select('system_settings.*');
      // Add joins here if needed
      // .leftJoin('other_table', 'system_settings.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: SystemSettingsListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific SystemSettings filters
    if (filters.category !== undefined) {
      query.where('.category', filters.category);
    }
    if (filters.key !== undefined) {
      query.where('.key', filters.key);
    }
    if (filters.value !== undefined) {
      query.where('.value', filters.value);
    }
    if (filters.data_type !== undefined) {
      query.where('.data_type', filters.data_type);
    }
    if (filters.description !== undefined) {
      query.where('.description', filters.description);
    }
    if (filters.is_public !== undefined) {
      query.where('.is_public', filters.is_public);
    }
    if (filters.requires_restart !== undefined) {
      query.where('.requires_restart', filters.requires_restart);
    }
    if (filters.updated_at !== undefined) {
      query.where('.updated_at', filters.updated_at);
    }
  }

  // Custom sort fields mapping
  protected getSortField(sortBy: string): string {
    const sortFields: Record<string, string> = {
      id: '.id',
      category: '.category',
      key: '.key',
      value: '.value',
      dataType: '.data_type',
      description: '.description',
      isPublic: '.is_public',
      requiresRestart: '.requires_restart',
      createdAt: '.created_at',
      updatedAt: '.updated_at'
    };

    return sortFields[sortBy] || 'system_settings.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetSystemSettingsQuery = {}
  ): Promise<SystemSettings | null> {
    let query = this.getJoinQuery();
    query = query.where('system_settings.id', id);

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
  async list(query: SystemSettingsListQuery = {}): Promise<PaginatedListResult<SystemSettings>> {
    return super.list(query);
  }

  // Additional business-specific methods
  
  async findByCategory(category: string): Promise<SystemSettings | null> {
    const query = this.getJoinQuery();
    const row = await query.where('system_settings.category', category).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByKey(key: string): Promise<SystemSettings | null> {
    const query = this.getJoinQuery();
    const row = await query.where('system_settings.key', key).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByValue(value: string): Promise<SystemSettings | null> {
    const query = this.getJoinQuery();
    const row = await query.where('system_settings.value', value).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByDataType(dataType: string): Promise<SystemSettings | null> {
    const query = this.getJoinQuery();
    const row = await query.where('system_settings.data_type', dataType).first();
    return row ? this.transformToEntity(row) : null;
  }

  async findByDescription(description: string): Promise<SystemSettings | null> {
    const query = this.getJoinQuery();
    const row = await query.where('system_settings.description', description).first();
    return row ? this.transformToEntity(row) : null;
  }


  // Statistics and aggregation methods
  async getStats(): Promise<{
    total: number;
    isPublicCount: number;
    requiresRestartCount: number;
  }> {
    const stats: any = await this.knex('system_settings')
      .select([
        this.knex.raw('COUNT(*) as total'),
        this.knex.raw('COUNT(*) FILTER (WHERE is_public = true) as isPublic_count'),
        this.knex.raw('COUNT(*) FILTER (WHERE requires_restart = true) as requiresRestart_count')
      ])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
      isPublicCount: parseInt(stats?.isPublic_count || '0'),
      requiresRestartCount: parseInt(stats?.requiresRestart_count || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateSystemSettings[]): Promise<SystemSettings[]> {
    const transformedData = data.map(item => this.transformToDb(item));
    const rows = await this.knex('system_settings').insert(transformedData).returning('*');
    return rows.map(row => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateSystemSettings): Promise<SystemSettings> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('system_settings').insert(transformedData).returning('*');
      return this.transformToEntity(row);
    });
  }
}