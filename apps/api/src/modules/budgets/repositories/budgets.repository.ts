import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateBudgets,
  type UpdateBudgets,
  type Budgets,
  type GetBudgetsQuery,
  type ListBudgetsQuery,
  type BudgetsEntity,
} from '../types/budgets.types';

export interface BudgetsListQuery extends BaseListQuery {
  // Smart field-based filters for Budgets
  budget_code?: string;
  budget_type?: string;
  budget_category?: string;
  budget_description?: string;
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
      'budgets',
      [
        // Define searchable fields based on intelligent detection
        'budgets.budget_description',
      ],
      [], // explicitUUIDFields
      {
        // Field configuration for automatic timestamp and audit field management
        hasCreatedAt: true,
        hasUpdatedAt: false,
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
      budget_code: dbRow.budget_code,
      budget_type: dbRow.budget_type,
      budget_category: dbRow.budget_category,
      budget_description: dbRow.budget_description,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateBudgets | UpdateBudgets): Partial<BudgetsEntity> {
    const transformed: Partial<BudgetsEntity> = {};

    if ('budget_code' in dto && dto.budget_code !== undefined) {
      transformed.budget_code = dto.budget_code;
    }
    if ('budget_type' in dto && dto.budget_type !== undefined) {
      transformed.budget_type = dto.budget_type;
    }
    if ('budget_category' in dto && dto.budget_category !== undefined) {
      transformed.budget_category = dto.budget_category;
    }
    if ('budget_description' in dto && dto.budget_description !== undefined) {
      transformed.budget_description = dto.budget_description;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('budgets').select('budgets.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'budgets.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: BudgetsListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Budgets filters based on intelligent field categorization
    if (filters.budget_code !== undefined) {
      query.where('budgets.budget_code', filters.budget_code);
    }
    if (filters.budget_type !== undefined) {
      query.where('budgets.budget_type', filters.budget_type);
    }
    if (filters.budget_category !== undefined) {
      query.where('budgets.budget_category', filters.budget_category);
    }
    if (filters.budget_description !== undefined) {
      query.where('budgets.budget_description', filters.budget_description);
    }
    if (filters.is_active !== undefined) {
      query.where('budgets.is_active', filters.is_active);
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
      id: 'budgets.id',
      budgetCode: 'budgets.budget_code',
      budgetType: 'budgets.budget_type',
      budgetCategory: 'budgets.budget_category',
      budgetDescription: 'budgets.budget_description',
      isActive: 'budgets.is_active',
      createdAt: 'budgets.created_at',
    };

    return sortFields[sortBy] || 'budgets.id';
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

  // Business-specific methods for unique/important fields

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  /**
   * Find by unique field: budget_code
   * Used for duplicate detection before insert/update
   */
  async findByBudgetCode(budgetCode: string | number): Promise<Budgets | null> {
    const query = this.getJoinQuery();
    const row = await query.where('budgets.budget_code', budgetCode).first();
    return row ? this.transformToEntity(row) : null;
  }

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('budgets')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateBudgets[]): Promise<Budgets[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('budgets')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateBudgets): Promise<Budgets> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('budgets').insert(transformedData).returning('*');
      return this.transformToEntity(row);
    });
  }
}
