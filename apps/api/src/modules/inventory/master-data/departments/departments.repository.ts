import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateDepartments,
  type UpdateDepartments,
  type Departments,
  type GetDepartmentsQuery,
  type ListDepartmentsQuery,
  type DepartmentsEntity,
} from './departments.types';

export interface DepartmentsListQuery extends BaseListQuery {
  // Smart field-based filters for Departments
  dept_code?: string;
  dept_name?: string;
  his_code?: string;
  parent_id?: number;
  parent_id_min?: number;
  parent_id_max?: number;
  is_active?: boolean;
}

export class DepartmentsRepository extends BaseRepository<
  Departments,
  CreateDepartments,
  UpdateDepartments
> {
  constructor(knex: Knex) {
    super(
      knex,
      'departments',
      [
        // Define searchable fields based on intelligent detection
        'departments.dept_name',
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
  transformToEntity(dbRow: any): Departments {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      dept_code: dbRow.dept_code,
      dept_name: dbRow.dept_name,
      his_code: dbRow.his_code,
      parent_id: dbRow.parent_id,
      consumption_group: dbRow.consumption_group,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateDepartments | UpdateDepartments,
  ): Partial<DepartmentsEntity> {
    const transformed: Partial<DepartmentsEntity> = {};

    if ('dept_code' in dto && dto.dept_code !== undefined) {
      transformed.dept_code = dto.dept_code;
    }
    if ('dept_name' in dto && dto.dept_name !== undefined) {
      transformed.dept_name = dto.dept_name;
    }
    if ('his_code' in dto && dto.his_code !== undefined) {
      transformed.his_code = dto.his_code;
    }
    if ('parent_id' in dto && dto.parent_id !== undefined) {
      transformed.parent_id = dto.parent_id;
    }
    if ('consumption_group' in dto && dto.consumption_group !== undefined) {
      transformed.consumption_group = dto.consumption_group;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('departments').select('departments.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'departments.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: DepartmentsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Departments filters based on intelligent field categorization
    if (filters.dept_code !== undefined) {
      query.where('departments.dept_code', filters.dept_code);
    }
    if (filters.dept_name !== undefined) {
      query.where('departments.dept_name', filters.dept_name);
    }
    if (filters.his_code !== undefined) {
      query.where('departments.his_code', filters.his_code);
    }
    if (filters.parent_id !== undefined) {
      query.where('departments.parent_id', filters.parent_id);
    }
    if (filters.parent_id_min !== undefined) {
      query.where('departments.parent_id', '>=', filters.parent_id_min);
    }
    if (filters.parent_id_max !== undefined) {
      query.where('departments.parent_id', '<=', filters.parent_id_max);
    }
    if (filters.is_active !== undefined) {
      query.where('departments.is_active', filters.is_active);
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
      id: 'departments.id',
      deptCode: 'departments.dept_code',
      deptName: 'departments.dept_name',
      hisCode: 'departments.his_code',
      parentId: 'departments.parent_id',
      consumptionGroup: 'departments.consumption_group',
      isActive: 'departments.is_active',
      createdAt: 'departments.created_at',
      updatedAt: 'departments.updated_at',
    };

    return sortFields[sortBy] || 'departments.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetDepartmentsQuery = {},
  ): Promise<Departments | null> {
    let query = this.getJoinQuery();
    query = query.where('departments.id', id);

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
    query: DepartmentsListQuery = {},
  ): Promise<PaginatedListResult<Departments>> {
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
      .where('department_id', id)
      .count('* as count')
      .first();

    if (parseInt((budgetAllocationsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'budget_allocations',
        field: 'department_id',
        count: parseInt((budgetAllocationsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check budget_plans references
    const budgetPlansCount = await this.knex('budget_plans')
      .where('department_id', id)
      .count('* as count')
      .first();

    if (parseInt((budgetPlansCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'budget_plans',
        field: 'department_id',
        count: parseInt((budgetPlansCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check departments references
    const departmentsCount = await this.knex('departments')
      .where('parent_id', id)
      .count('* as count')
      .first();

    if (parseInt((departmentsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'departments',
        field: 'parent_id',
        count: parseInt((departmentsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check drug_distributions references
    const drugDistributionsCount = await this.knex('drug_distributions')
      .where('requesting_dept_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugDistributionsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_distributions',
        field: 'requesting_dept_id',
        count: parseInt((drugDistributionsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check drug_returns references
    const drugReturnsCount = await this.knex('drug_returns')
      .where('department_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugReturnsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_returns',
        field: 'department_id',
        count: parseInt((drugReturnsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check purchase_requests references
    const purchaseRequestsCount = await this.knex('purchase_requests')
      .where('department_id', id)
      .count('* as count')
      .first();

    if (parseInt((purchaseRequestsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'purchase_requests',
        field: 'department_id',
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
    const stats: any = await this.knex('departments')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateDepartments[]): Promise<Departments[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('departments')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateDepartments): Promise<Departments> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('departments')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
