import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateAdjustmentReasons,
  type UpdateAdjustmentReasons,
  type AdjustmentReasons,
  type GetAdjustmentReasonsQuery,
  type ListAdjustmentReasonsQuery,
  type AdjustmentReasonsEntity,
} from './adjustment-reasons.types';

export interface AdjustmentReasonsListQuery extends BaseListQuery {
  // Smart field-based filters for AdjustmentReasons
  reason_code?: string;
  reason_name?: string;
  requires_approval?: boolean;
  description?: string;
  is_active?: boolean;
}

export class AdjustmentReasonsRepository extends BaseRepository<
  AdjustmentReasons,
  CreateAdjustmentReasons,
  UpdateAdjustmentReasons
> {
  constructor(knex: Knex) {
    super(
      knex,
      'adjustment_reasons',
      [
        // Define searchable fields based on intelligent detection
        'adjustment_reasons.reason_name',
        'adjustment_reasons.description',
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
  transformToEntity(dbRow: any): AdjustmentReasons {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      reason_code: dbRow.reason_code,
      reason_name: dbRow.reason_name,
      adjustment_type: dbRow.adjustment_type,
      requires_approval: dbRow.requires_approval,
      description: dbRow.description,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateAdjustmentReasons | UpdateAdjustmentReasons,
  ): Partial<AdjustmentReasonsEntity> {
    const transformed: Partial<AdjustmentReasonsEntity> = {};

    if ('reason_code' in dto && dto.reason_code !== undefined) {
      transformed.reason_code = dto.reason_code;
    }
    if ('reason_name' in dto && dto.reason_name !== undefined) {
      transformed.reason_name = dto.reason_name;
    }
    if ('adjustment_type' in dto && dto.adjustment_type !== undefined) {
      transformed.adjustment_type = dto.adjustment_type;
    }
    if ('requires_approval' in dto && dto.requires_approval !== undefined) {
      transformed.requires_approval = dto.requires_approval;
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
    return this.knex('adjustment_reasons').select('adjustment_reasons.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'adjustment_reasons.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: AdjustmentReasonsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific AdjustmentReasons filters based on intelligent field categorization
    if (filters.reason_code !== undefined) {
      query.where('adjustment_reasons.reason_code', filters.reason_code);
    }
    if (filters.reason_name !== undefined) {
      query.where('adjustment_reasons.reason_name', filters.reason_name);
    }
    if (filters.requires_approval !== undefined) {
      query.where(
        'adjustment_reasons.requires_approval',
        filters.requires_approval,
      );
    }
    if (filters.description !== undefined) {
      query.where('adjustment_reasons.description', filters.description);
    }
    if (filters.is_active !== undefined) {
      query.where('adjustment_reasons.is_active', filters.is_active);
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
      id: 'adjustment_reasons.id',
      reasonCode: 'adjustment_reasons.reason_code',
      reasonName: 'adjustment_reasons.reason_name',
      adjustmentType: 'adjustment_reasons.adjustment_type',
      requiresApproval: 'adjustment_reasons.requires_approval',
      description: 'adjustment_reasons.description',
      isActive: 'adjustment_reasons.is_active',
      createdAt: 'adjustment_reasons.created_at',
      updatedAt: 'adjustment_reasons.updated_at',
    };

    return sortFields[sortBy] || 'adjustment_reasons.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetAdjustmentReasonsQuery = {},
  ): Promise<AdjustmentReasons | null> {
    let query = this.getJoinQuery();
    query = query.where('adjustment_reasons.id', id);

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
    query: AdjustmentReasonsListQuery = {},
  ): Promise<PaginatedListResult<AdjustmentReasons>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('adjustment_reasons')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(
    data: CreateAdjustmentReasons[],
  ): Promise<AdjustmentReasons[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('adjustment_reasons')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateAdjustmentReasons,
  ): Promise<AdjustmentReasons> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('adjustment_reasons')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
