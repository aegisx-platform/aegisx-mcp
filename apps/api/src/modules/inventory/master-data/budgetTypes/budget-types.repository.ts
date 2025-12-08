import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateBudgetTypes,
  type UpdateBudgetTypes,
  type BudgetTypes,
  type GetBudgetTypesQuery,
  type ListBudgetTypesQuery,
  type BudgetTypesEntity,
} from './budget-types.types';

export interface BudgetTypesListQuery extends BaseListQuery {
  // Smart field-based filters for BudgetTypes
  type_code?: string;
  type_name?: string;
  description?: string;
  is_active?: boolean;
}

export class BudgetTypesRepository extends BaseRepository<
  BudgetTypes,
  CreateBudgetTypes,
  UpdateBudgetTypes
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.budget_types',
      [
        // Define searchable fields based on intelligent detection
        'inventory.budget_types.type_name',
        'inventory.budget_types.description',
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
  transformToEntity(dbRow: any): BudgetTypes {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      type_code: dbRow.type_code,
      type_name: dbRow.type_name,
      budget_class: dbRow.budget_class,
      description: dbRow.description,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateBudgetTypes | UpdateBudgetTypes,
  ): Partial<BudgetTypesEntity> {
    const transformed: Partial<BudgetTypesEntity> = {};

    if ('type_code' in dto && dto.type_code !== undefined) {
      transformed.type_code = dto.type_code;
    }
    if ('type_name' in dto && dto.type_name !== undefined) {
      transformed.type_name = dto.type_name;
    }
    if ('budget_class' in dto && dto.budget_class !== undefined) {
      transformed.budget_class = dto.budget_class;
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
    return this.knex('inventory.budget_types').select(
      'inventory.budget_types.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.budget_types.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: BudgetTypesListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific BudgetTypes filters based on intelligent field categorization
    if (filters.type_code !== undefined) {
      query.where('inventory.budget_types.type_code', filters.type_code);
    }
    if (filters.type_name !== undefined) {
      query.where('inventory.budget_types.type_name', filters.type_name);
    }
    if (filters.description !== undefined) {
      query.where('inventory.budget_types.description', filters.description);
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.budget_types.is_active', filters.is_active);
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
      id: 'inventory.budget_types.id',
      typeCode: 'inventory.budget_types.type_code',
      typeName: 'inventory.budget_types.type_name',
      budgetClass: 'inventory.budget_types.budget_class',
      description: 'inventory.budget_types.description',
      isActive: 'inventory.budget_types.is_active',
      createdAt: 'inventory.budget_types.created_at',
      updatedAt: 'inventory.budget_types.updated_at',
    };

    return sortFields[sortBy] || 'inventory.budget_types.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetBudgetTypesQuery = {},
  ): Promise<BudgetTypes | null> {
    let query = this.getJoinQuery();
    query = query.where('budget_types.id', id);

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
    query: BudgetTypesListQuery = {},
  ): Promise<PaginatedListResult<BudgetTypes>> {
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

    // Check budgets references
    const budgetsCount = await this.knex('budgets')
      .where('budget_type_id', id)
      .count('* as count')
      .first();

    if (parseInt((budgetsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'budgets',
        field: 'budget_type_id',
        count: parseInt((budgetsCount?.count as string) || '0'),
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
    const stats: any = await this.knex('inventory.budget_types')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateBudgetTypes[]): Promise<BudgetTypes[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.budget_types')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateBudgetTypes): Promise<BudgetTypes> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.budget_types')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
