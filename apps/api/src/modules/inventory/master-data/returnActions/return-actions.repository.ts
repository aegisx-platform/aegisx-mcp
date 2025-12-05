import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateReturnActions,
  type UpdateReturnActions,
  type ReturnActions,
  type GetReturnActionsQuery,
  type ListReturnActionsQuery,
  type ReturnActionsEntity,
} from './return-actions.types';

export interface ReturnActionsListQuery extends BaseListQuery {
  // Smart field-based filters for ReturnActions
  action_code?: string;
  action_name?: string;
  requires_vendor_approval?: boolean;
  description?: string;
  is_active?: boolean;
}

export class ReturnActionsRepository extends BaseRepository<
  ReturnActions,
  CreateReturnActions,
  UpdateReturnActions
> {
  constructor(knex: Knex) {
    super(
      knex,
      'return_actions',
      [
        // Define searchable fields based on intelligent detection
        'return_actions.action_name',
        'return_actions.description',
      ],
      [], // explicitUUIDFields
      {
        // Field configuration for automatic timestamp and audit field management
        hasCreatedAt: true,
        hasUpdatedAt: true,
        hasCreatedBy: false,
        hasUpdatedBy: false,
      },
    );
  }

  // Transform database row to entity
  transformToEntity(dbRow: any): ReturnActions {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      action_code: dbRow.action_code,
      action_name: dbRow.action_name,
      action_type: dbRow.action_type,
      requires_vendor_approval: dbRow.requires_vendor_approval,
      description: dbRow.description,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateReturnActions | UpdateReturnActions,
  ): Partial<ReturnActionsEntity> {
    const transformed: Partial<ReturnActionsEntity> = {};

    if ('action_code' in dto && dto.action_code !== undefined) {
      transformed.action_code = dto.action_code;
    }
    if ('action_name' in dto && dto.action_name !== undefined) {
      transformed.action_name = dto.action_name;
    }
    if ('action_type' in dto && dto.action_type !== undefined) {
      transformed.action_type = dto.action_type;
    }
    if (
      'requires_vendor_approval' in dto &&
      dto.requires_vendor_approval !== undefined
    ) {
      transformed.requires_vendor_approval = dto.requires_vendor_approval;
    }
    if ('description' in dto && dto.description !== undefined) {
      transformed.description = dto.description;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('return_actions').select('return_actions.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'return_actions.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: ReturnActionsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific ReturnActions filters based on intelligent field categorization
    if (filters.action_code !== undefined) {
      query.where('return_actions.action_code', filters.action_code);
    }
    if (filters.action_name !== undefined) {
      query.where('return_actions.action_name', filters.action_name);
    }
    if (filters.requires_vendor_approval !== undefined) {
      query.where(
        'return_actions.requires_vendor_approval',
        filters.requires_vendor_approval,
      );
    }
    if (filters.description !== undefined) {
      query.where('return_actions.description', filters.description);
    }
    if (filters.is_active !== undefined) {
      query.where('return_actions.is_active', filters.is_active);
    }
  }

  // Apply multiple sort parsing
  protected applyMultipleSort(query: any, sort?: string): void {
    if (sort) {
      if (sort.includes(',')) {
        // Multiple sort format: field1:desc,field2:asc,field3:desc
        const sortPairs = sort.split(',');
        sortPairs.forEach((pair) => {
          const [field, direction] = pair.split(':');
          const mappedField = this.getSortField(field.trim());
          const sortDirection =
            direction?.trim().toLowerCase() === 'asc' ? 'asc' : 'desc';
          query.orderBy(mappedField, sortDirection);
        });
      } else {
        // Single sort field
        const [field, direction] = sort.split(':');
        const mappedField = this.getSortField(field.trim());
        const sortDirection =
          direction?.trim().toLowerCase() === 'asc' ? 'asc' : 'desc';
        query.orderBy(mappedField, sortDirection);
      }
    } else {
      // Default sort
      query.orderBy(this.getSortField('created_at'), 'desc');
    }
  }

  // Custom sort fields mapping
  protected getSortField(sortBy: string): string {
    const sortFields: Record<string, string> = {
      id: 'return_actions.id',
      actionCode: 'return_actions.action_code',
      actionName: 'return_actions.action_name',
      actionType: 'return_actions.action_type',
      requiresVendorApproval: 'return_actions.requires_vendor_approval',
      description: 'return_actions.description',
      isActive: 'return_actions.is_active',
      createdAt: 'return_actions.created_at',
      updatedAt: 'return_actions.updated_at',
    };

    return sortFields[sortBy] || 'return_actions.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetReturnActionsQuery = {},
  ): Promise<ReturnActions | null> {
    let query = this.getJoinQuery();
    query = query.where('return_actions.id', id);

    // Handle include options
    if (options.include) {
      const includes = Array.isArray(options.include)
        ? options.include
        : [options.include];
      includes.forEach((relation) => {
        // TODO: Add join logic for relationships
        // Example: if (relation === 'category') query.leftJoin('categories', 'items.category_id', 'categories.id');
      });
    }

    const row = await query.first();
    return row ? this.transformToEntity(row) : null;
  }

  // Extended list method with specific query type
  async list(
    query: ReturnActionsListQuery = {},
  ): Promise<PaginatedListResult<ReturnActions>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  /**
   * Check if record can be deleted
   * Returns foreign key references that would prevent deletion
   */
  async canBeDeleted(id: string | number): Promise<{
    canDelete: boolean;
    blockedBy: Array<{
      table: string;
      field: string;
      count: number;
      cascade: boolean;
    }>;
  }> {
    const blockedBy: Array<{
      table: string;
      field: string;
      count: number;
      cascade: boolean;
    }> = [];

    // Check drug_return_items references
    const drugReturnItemsCount = await this.knex('drug_return_items')
      .where('action_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugReturnItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_return_items',
        field: 'action_id',
        count: parseInt((drugReturnItemsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    return {
      canDelete:
        blockedBy.length === 0 || blockedBy.every((ref) => ref.cascade),
      blockedBy,
    };
  }

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('return_actions')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateReturnActions[]): Promise<ReturnActions[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('return_actions')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateReturnActions,
  ): Promise<ReturnActions> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('return_actions')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
