import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateBudgets,
  type UpdateBudgets,
  type Budgets,
  type GetBudgetsQuery,
  type ListBudgetsQuery,
  type BudgetsEntity,
} from './budgets.types';

export interface BudgetsListQuery extends BaseListQuery {
  // Smart field-based filters for Budgets
  budget_type_id?: number;
  budget_type_id_min?: number;
  budget_type_id_max?: number;
  budget_category_id?: number;
  budget_category_id_min?: number;
  budget_category_id_max?: number;
  description?: string;
  is_active?: boolean;
}

export class BudgetsRepository extends BaseRepository<
  Budgets,
  CreateBudgets,
  UpdateBudgets
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.budgets',
      [
        // Define searchable fields based on intelligent detection
        'inventory.budgets.description',
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
  transformToEntity(dbRow: any): Budgets {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      budget_type_id: dbRow.budget_type_id,
      budget_category_id: dbRow.budget_category_id,
      description: dbRow.description,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateBudgets | UpdateBudgets): Partial<BudgetsEntity> {
    const transformed: Partial<BudgetsEntity> = {};

    if ('budget_type_id' in dto && dto.budget_type_id !== undefined) {
      transformed.budget_type_id = dto.budget_type_id;
    }
    if ('budget_category_id' in dto && dto.budget_category_id !== undefined) {
      transformed.budget_category_id = dto.budget_category_id;
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
    return this.knex('inventory.budgets').select('inventory.budgets.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.budgets.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: BudgetsListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Budgets filters based on intelligent field categorization
    if (filters.budget_type_id !== undefined) {
      query.where('inventory.budgets.budget_type_id', filters.budget_type_id);
    }
    if (filters.budget_type_id_min !== undefined) {
      query.where(
        'inventory.budgets.budget_type_id',
        '>=',
        filters.budget_type_id_min,
      );
    }
    if (filters.budget_type_id_max !== undefined) {
      query.where(
        'inventory.budgets.budget_type_id',
        '<=',
        filters.budget_type_id_max,
      );
    }
    if (filters.budget_category_id !== undefined) {
      query.where(
        'inventory.budgets.budget_category_id',
        filters.budget_category_id,
      );
    }
    if (filters.budget_category_id_min !== undefined) {
      query.where(
        'inventory.budgets.budget_category_id',
        '>=',
        filters.budget_category_id_min,
      );
    }
    if (filters.budget_category_id_max !== undefined) {
      query.where(
        'inventory.budgets.budget_category_id',
        '<=',
        filters.budget_category_id_max,
      );
    }
    if (filters.description !== undefined) {
      query.where('inventory.budgets.description', filters.description);
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.budgets.is_active', filters.is_active);
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
      id: 'inventory.budgets.id',
      budgetTypeId: 'inventory.budgets.budget_type_id',
      budgetCategoryId: 'inventory.budgets.budget_category_id',
      description: 'inventory.budgets.description',
      isActive: 'inventory.budgets.is_active',
      createdAt: 'inventory.budgets.created_at',
      updatedAt: 'inventory.budgets.updated_at',
    };

    return sortFields[sortBy] || 'inventory.budgets.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetBudgetsQuery = {},
  ): Promise<Budgets | null> {
    let query = this.getJoinQuery();
    query = query.where('budgets.id', id);

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
    query: BudgetsListQuery = {},
  ): Promise<PaginatedListResult<Budgets>> {
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

    // Check budget_allocations references
    const budgetAllocationsCount = await this.knex('budget_allocations')
      .where('budget_id', id)
      .count('* as count')
      .first();

    if (parseInt((budgetAllocationsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'budget_allocations',
        field: 'budget_id',
        count: parseInt((budgetAllocationsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check purchase_requests references
    const purchaseRequestsCount = await this.knex('purchase_requests')
      .where('budget_id', id)
      .count('* as count')
      .first();

    if (parseInt((purchaseRequestsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'purchase_requests',
        field: 'budget_id',
        count: parseInt((purchaseRequestsCount?.count as string) || '0'),
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
    const stats: any = await this.knex('inventory.budgets')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateBudgets[]): Promise<Budgets[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.budgets')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateBudgets): Promise<Budgets> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.budgets')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
