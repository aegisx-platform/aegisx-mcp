import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateContracts,
  type UpdateContracts,
  type Contracts,
  type GetContractsQuery,
  type ListContractsQuery,
  type ContractsEntity,
} from './contracts.types';

export interface ContractsListQuery extends BaseListQuery {
  // Smart field-based filters for Contracts
  contract_number?: string;
  vendor_id?: number;
  vendor_id_min?: number;
  vendor_id_max?: number;
  total_value?: number;
  total_value_min?: number;
  total_value_max?: number;
  remaining_value?: number;
  remaining_value_min?: number;
  remaining_value_max?: number;
  fiscal_year?: string;
  egp_number?: string;
  project_number?: string;
  is_active?: boolean;
}

export class ContractsRepository extends BaseRepository<
  Contracts,
  CreateContracts,
  UpdateContracts
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.contracts',
      [
        // Define searchable fields based on intelligent detection
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
  transformToEntity(dbRow: any): Contracts {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      contract_number: dbRow.contract_number,
      contract_type: dbRow.contract_type,
      vendor_id: dbRow.vendor_id,
      start_date: dbRow.start_date,
      end_date: dbRow.end_date,
      total_value: dbRow.total_value,
      remaining_value: dbRow.remaining_value,
      fiscal_year: dbRow.fiscal_year,
      status: dbRow.status,
      egp_number: dbRow.egp_number,
      project_number: dbRow.project_number,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateContracts | UpdateContracts,
  ): Partial<ContractsEntity> {
    const transformed: Partial<ContractsEntity> = {};

    if ('contract_number' in dto && dto.contract_number !== undefined) {
      transformed.contract_number = dto.contract_number;
    }
    if ('contract_type' in dto && dto.contract_type !== undefined) {
      transformed.contract_type = dto.contract_type;
    }
    if ('vendor_id' in dto && dto.vendor_id !== undefined) {
      transformed.vendor_id = dto.vendor_id;
    }
    if ('start_date' in dto && dto.start_date !== undefined) {
      transformed.start_date =
        typeof dto.start_date === 'string'
          ? new Date(dto.start_date)
          : dto.start_date;
    }
    if ('end_date' in dto && dto.end_date !== undefined) {
      transformed.end_date =
        typeof dto.end_date === 'string'
          ? new Date(dto.end_date)
          : dto.end_date;
    }
    if ('total_value' in dto && dto.total_value !== undefined) {
      transformed.total_value = dto.total_value;
    }
    if ('remaining_value' in dto && dto.remaining_value !== undefined) {
      transformed.remaining_value = dto.remaining_value;
    }
    if ('fiscal_year' in dto && dto.fiscal_year !== undefined) {
      transformed.fiscal_year = dto.fiscal_year;
    }
    if ('status' in dto && dto.status !== undefined) {
      transformed.status = dto.status;
    }
    if ('egp_number' in dto && dto.egp_number !== undefined) {
      transformed.egp_number = dto.egp_number;
    }
    if ('project_number' in dto && dto.project_number !== undefined) {
      transformed.project_number = dto.project_number;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.contracts').select('inventory.contracts.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.contracts.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: ContractsListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Contracts filters based on intelligent field categorization
    if (filters.contract_number !== undefined) {
      query.where(
        'inventory.contracts.contract_number',
        filters.contract_number,
      );
    }
    if (filters.vendor_id !== undefined) {
      query.where('inventory.contracts.vendor_id', filters.vendor_id);
    }
    if (filters.vendor_id_min !== undefined) {
      query.where('inventory.contracts.vendor_id', '>=', filters.vendor_id_min);
    }
    if (filters.vendor_id_max !== undefined) {
      query.where('inventory.contracts.vendor_id', '<=', filters.vendor_id_max);
    }
    if (filters.total_value !== undefined) {
      query.where('inventory.contracts.total_value', filters.total_value);
    }
    if (filters.total_value_min !== undefined) {
      query.where(
        'inventory.contracts.total_value',
        '>=',
        filters.total_value_min,
      );
    }
    if (filters.total_value_max !== undefined) {
      query.where(
        'inventory.contracts.total_value',
        '<=',
        filters.total_value_max,
      );
    }
    if (filters.remaining_value !== undefined) {
      query.where(
        'inventory.contracts.remaining_value',
        filters.remaining_value,
      );
    }
    if (filters.remaining_value_min !== undefined) {
      query.where(
        'inventory.contracts.remaining_value',
        '>=',
        filters.remaining_value_min,
      );
    }
    if (filters.remaining_value_max !== undefined) {
      query.where(
        'inventory.contracts.remaining_value',
        '<=',
        filters.remaining_value_max,
      );
    }
    if (filters.fiscal_year !== undefined) {
      query.where('inventory.contracts.fiscal_year', filters.fiscal_year);
    }
    if (filters.egp_number !== undefined) {
      query.where('inventory.contracts.egp_number', filters.egp_number);
    }
    if (filters.project_number !== undefined) {
      query.where('inventory.contracts.project_number', filters.project_number);
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.contracts.is_active', filters.is_active);
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
      id: 'inventory.contracts.id',
      contractNumber: 'inventory.contracts.contract_number',
      contractType: 'inventory.contracts.contract_type',
      vendorId: 'inventory.contracts.vendor_id',
      startDate: 'inventory.contracts.start_date',
      endDate: 'inventory.contracts.end_date',
      totalValue: 'inventory.contracts.total_value',
      remainingValue: 'inventory.contracts.remaining_value',
      fiscalYear: 'inventory.contracts.fiscal_year',
      status: 'inventory.contracts.status',
      egpNumber: 'inventory.contracts.egp_number',
      projectNumber: 'inventory.contracts.project_number',
      isActive: 'inventory.contracts.is_active',
      createdAt: 'inventory.contracts.created_at',
      updatedAt: 'inventory.contracts.updated_at',
    };

    return sortFields[sortBy] || 'inventory.contracts.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetContractsQuery = {},
  ): Promise<Contracts | null> {
    let query = this.getJoinQuery();
    query = query.where('contracts.id', id);

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
    query: ContractsListQuery = {},
  ): Promise<PaginatedListResult<Contracts>> {
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

    // Check contract_items references
    const contractItemsCount = await this.knex('contract_items')
      .where('contract_id', id)
      .count('* as count')
      .first();

    if (parseInt((contractItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'contract_items',
        field: 'contract_id',
        count: parseInt((contractItemsCount?.count as string) || '0'),
        cascade: true,
      });
    }

    // Check purchase_orders references
    const purchaseOrdersCount = await this.knex('purchase_orders')
      .where('contract_id', id)
      .count('* as count')
      .first();

    if (parseInt((purchaseOrdersCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'purchase_orders',
        field: 'contract_id',
        count: parseInt((purchaseOrdersCount?.count as string) || '0'),
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
    const stats: any = await this.knex('inventory.contracts')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateContracts[]): Promise<Contracts[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.contracts')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateContracts): Promise<Contracts> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.contracts')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
