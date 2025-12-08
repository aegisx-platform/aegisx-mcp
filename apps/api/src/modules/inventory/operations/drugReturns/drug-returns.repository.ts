import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateDrugReturns,
  type UpdateDrugReturns,
  type DrugReturns,
  type GetDrugReturnsQuery,
  type ListDrugReturnsQuery,
  type DrugReturnsEntity,
} from './drug-returns.types';

export interface DrugReturnsListQuery extends BaseListQuery {
  // Smart field-based filters for DrugReturns
  return_number?: string;
  department_id?: number;
  department_id_min?: number;
  department_id_max?: number;
  return_reason_id?: number;
  return_reason_id_min?: number;
  return_reason_id_max?: number;
  return_reason?: string;
  action_taken?: string;
  total_items?: number;
  total_items_min?: number;
  total_items_max?: number;
  total_amount?: number;
  total_amount_min?: number;
  total_amount_max?: number;
  received_by?: string;
  verified_by?: string;
  notes?: string;
}

export class DrugReturnsRepository extends BaseRepository<
  DrugReturns,
  CreateDrugReturns,
  UpdateDrugReturns
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.drug_returns',
      [
        // Define searchable fields based on intelligent detection
        'inventory.drug_returns.notes',
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
  transformToEntity(dbRow: any): DrugReturns {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      return_number: dbRow.return_number,
      department_id: dbRow.department_id,
      return_date: dbRow.return_date,
      return_reason_id: dbRow.return_reason_id,
      return_reason: dbRow.return_reason,
      action_taken: dbRow.action_taken,
      status: dbRow.status,
      total_items: dbRow.total_items,
      total_amount: dbRow.total_amount,
      received_by: dbRow.received_by,
      verified_by: dbRow.verified_by,
      notes: dbRow.notes,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateDrugReturns | UpdateDrugReturns,
  ): Partial<DrugReturnsEntity> {
    const transformed: Partial<DrugReturnsEntity> = {};

    if ('return_number' in dto && dto.return_number !== undefined) {
      transformed.return_number = dto.return_number;
    }
    if ('department_id' in dto && dto.department_id !== undefined) {
      transformed.department_id = dto.department_id;
    }
    if ('return_date' in dto && dto.return_date !== undefined) {
      transformed.return_date =
        typeof dto.return_date === 'string'
          ? new Date(dto.return_date)
          : dto.return_date;
    }
    if ('return_reason_id' in dto && dto.return_reason_id !== undefined) {
      transformed.return_reason_id = dto.return_reason_id;
    }
    if ('return_reason' in dto && dto.return_reason !== undefined) {
      transformed.return_reason = dto.return_reason;
    }
    if ('action_taken' in dto && dto.action_taken !== undefined) {
      transformed.action_taken = dto.action_taken;
    }
    if ('status' in dto && dto.status !== undefined) {
      transformed.status = dto.status;
    }
    if ('total_items' in dto && dto.total_items !== undefined) {
      transformed.total_items = dto.total_items;
    }
    if ('total_amount' in dto && dto.total_amount !== undefined) {
      transformed.total_amount = dto.total_amount;
    }
    if ('received_by' in dto && dto.received_by !== undefined) {
      transformed.received_by = dto.received_by;
    }
    if ('verified_by' in dto && dto.verified_by !== undefined) {
      transformed.verified_by = dto.verified_by;
    }
    if ('notes' in dto && dto.notes !== undefined) {
      transformed.notes = dto.notes;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.drug_returns').select(
      'inventory.drug_returns.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.drug_returns.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: DrugReturnsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific DrugReturns filters based on intelligent field categorization
    if (filters.return_number !== undefined) {
      query.where(
        'inventory.drug_returns.return_number',
        filters.return_number,
      );
    }
    if (filters.department_id !== undefined) {
      query.where(
        'inventory.drug_returns.department_id',
        filters.department_id,
      );
    }
    if (filters.department_id_min !== undefined) {
      query.where(
        'inventory.drug_returns.department_id',
        '>=',
        filters.department_id_min,
      );
    }
    if (filters.department_id_max !== undefined) {
      query.where(
        'inventory.drug_returns.department_id',
        '<=',
        filters.department_id_max,
      );
    }
    if (filters.return_reason_id !== undefined) {
      query.where(
        'inventory.drug_returns.return_reason_id',
        filters.return_reason_id,
      );
    }
    if (filters.return_reason_id_min !== undefined) {
      query.where(
        'inventory.drug_returns.return_reason_id',
        '>=',
        filters.return_reason_id_min,
      );
    }
    if (filters.return_reason_id_max !== undefined) {
      query.where(
        'inventory.drug_returns.return_reason_id',
        '<=',
        filters.return_reason_id_max,
      );
    }
    if (filters.return_reason !== undefined) {
      query.where(
        'inventory.drug_returns.return_reason',
        filters.return_reason,
      );
    }
    if (filters.action_taken !== undefined) {
      query.where('inventory.drug_returns.action_taken', filters.action_taken);
    }
    if (filters.total_items !== undefined) {
      query.where('inventory.drug_returns.total_items', filters.total_items);
    }
    if (filters.total_items_min !== undefined) {
      query.where(
        'inventory.drug_returns.total_items',
        '>=',
        filters.total_items_min,
      );
    }
    if (filters.total_items_max !== undefined) {
      query.where(
        'inventory.drug_returns.total_items',
        '<=',
        filters.total_items_max,
      );
    }
    if (filters.total_amount !== undefined) {
      query.where('inventory.drug_returns.total_amount', filters.total_amount);
    }
    if (filters.total_amount_min !== undefined) {
      query.where(
        'inventory.drug_returns.total_amount',
        '>=',
        filters.total_amount_min,
      );
    }
    if (filters.total_amount_max !== undefined) {
      query.where(
        'inventory.drug_returns.total_amount',
        '<=',
        filters.total_amount_max,
      );
    }
    if (filters.received_by !== undefined) {
      query.where('inventory.drug_returns.received_by', filters.received_by);
    }
    if (filters.verified_by !== undefined) {
      query.where('inventory.drug_returns.verified_by', filters.verified_by);
    }
    if (filters.notes !== undefined) {
      query.where('inventory.drug_returns.notes', filters.notes);
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
      id: 'inventory.drug_returns.id',
      returnNumber: 'inventory.drug_returns.return_number',
      departmentId: 'inventory.drug_returns.department_id',
      returnDate: 'inventory.drug_returns.return_date',
      returnReasonId: 'inventory.drug_returns.return_reason_id',
      returnReason: 'inventory.drug_returns.return_reason',
      actionTaken: 'inventory.drug_returns.action_taken',
      status: 'inventory.drug_returns.status',
      totalItems: 'inventory.drug_returns.total_items',
      totalAmount: 'inventory.drug_returns.total_amount',
      receivedBy: 'inventory.drug_returns.received_by',
      verifiedBy: 'inventory.drug_returns.verified_by',
      notes: 'inventory.drug_returns.notes',
      createdAt: 'inventory.drug_returns.created_at',
      updatedAt: 'inventory.drug_returns.updated_at',
    };

    return sortFields[sortBy] || 'inventory.drug_returns.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetDrugReturnsQuery = {},
  ): Promise<DrugReturns | null> {
    let query = this.getJoinQuery();
    query = query.where('drug_returns.id', id);

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
    query: DrugReturnsListQuery = {},
  ): Promise<PaginatedListResult<DrugReturns>> {
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
      .where('return_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugReturnItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_return_items',
        field: 'return_id',
        count: parseInt((drugReturnItemsCount?.count as string) || '0'),
        cascade: true,
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
    const stats: any = await this.knex('inventory.drug_returns')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateDrugReturns[]): Promise<DrugReturns[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.drug_returns')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateDrugReturns): Promise<DrugReturns> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.drug_returns')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
