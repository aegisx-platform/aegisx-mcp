import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateDrugDistributions,
  type UpdateDrugDistributions,
  type DrugDistributions,
  type GetDrugDistributionsQuery,
  type ListDrugDistributionsQuery,
  type DrugDistributionsEntity,
} from './drug-distributions.types';

export interface DrugDistributionsListQuery extends BaseListQuery {
  // Smart field-based filters for DrugDistributions
  distribution_number?: string;
  distribution_type_id?: number;
  distribution_type_id_min?: number;
  distribution_type_id_max?: number;
  from_location_id?: number;
  from_location_id_min?: number;
  from_location_id_max?: number;
  to_location_id?: number;
  to_location_id_min?: number;
  to_location_id_max?: number;
  requesting_dept_id?: number;
  requesting_dept_id_min?: number;
  requesting_dept_id_max?: number;
  requested_by?: string;
  approved_by?: string;
  dispensed_by?: string;
  total_items?: number;
  total_items_min?: number;
  total_items_max?: number;
  total_amount?: number;
  total_amount_min?: number;
  total_amount_max?: number;
  notes?: string;
}

export class DrugDistributionsRepository extends BaseRepository<
  DrugDistributions,
  CreateDrugDistributions,
  UpdateDrugDistributions
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.drug_distributions',
      [
        // Define searchable fields based on intelligent detection
        'inventory.drug_distributions.notes',
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
  transformToEntity(dbRow: any): DrugDistributions {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      distribution_number: dbRow.distribution_number,
      distribution_date: dbRow.distribution_date,
      distribution_type_id: dbRow.distribution_type_id,
      from_location_id: dbRow.from_location_id,
      to_location_id: dbRow.to_location_id,
      requesting_dept_id: dbRow.requesting_dept_id,
      requested_by: dbRow.requested_by,
      approved_by: dbRow.approved_by,
      dispensed_by: dbRow.dispensed_by,
      status: dbRow.status,
      total_items: dbRow.total_items,
      total_amount: dbRow.total_amount,
      notes: dbRow.notes,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateDrugDistributions | UpdateDrugDistributions,
  ): Partial<DrugDistributionsEntity> {
    const transformed: Partial<DrugDistributionsEntity> = {};

    if ('distribution_number' in dto && dto.distribution_number !== undefined) {
      transformed.distribution_number = dto.distribution_number;
    }
    if ('distribution_date' in dto && dto.distribution_date !== undefined) {
      transformed.distribution_date =
        typeof dto.distribution_date === 'string'
          ? new Date(dto.distribution_date)
          : dto.distribution_date;
    }
    if (
      'distribution_type_id' in dto &&
      dto.distribution_type_id !== undefined
    ) {
      transformed.distribution_type_id = dto.distribution_type_id;
    }
    if ('from_location_id' in dto && dto.from_location_id !== undefined) {
      transformed.from_location_id = dto.from_location_id;
    }
    if ('to_location_id' in dto && dto.to_location_id !== undefined) {
      transformed.to_location_id = dto.to_location_id;
    }
    if ('requesting_dept_id' in dto && dto.requesting_dept_id !== undefined) {
      transformed.requesting_dept_id = dto.requesting_dept_id;
    }
    if ('requested_by' in dto && dto.requested_by !== undefined) {
      transformed.requested_by = dto.requested_by;
    }
    if ('approved_by' in dto && dto.approved_by !== undefined) {
      transformed.approved_by = dto.approved_by;
    }
    if ('dispensed_by' in dto && dto.dispensed_by !== undefined) {
      transformed.dispensed_by = dto.dispensed_by;
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
    if ('notes' in dto && dto.notes !== undefined) {
      transformed.notes = dto.notes;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.drug_distributions').select(
      'inventory.drug_distributions.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.drug_distributions.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: DrugDistributionsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific DrugDistributions filters based on intelligent field categorization
    if (filters.distribution_number !== undefined) {
      query.where(
        'inventory.drug_distributions.distribution_number',
        filters.distribution_number,
      );
    }
    if (filters.distribution_type_id !== undefined) {
      query.where(
        'inventory.drug_distributions.distribution_type_id',
        filters.distribution_type_id,
      );
    }
    if (filters.distribution_type_id_min !== undefined) {
      query.where(
        'inventory.drug_distributions.distribution_type_id',
        '>=',
        filters.distribution_type_id_min,
      );
    }
    if (filters.distribution_type_id_max !== undefined) {
      query.where(
        'inventory.drug_distributions.distribution_type_id',
        '<=',
        filters.distribution_type_id_max,
      );
    }
    if (filters.from_location_id !== undefined) {
      query.where(
        'inventory.drug_distributions.from_location_id',
        filters.from_location_id,
      );
    }
    if (filters.from_location_id_min !== undefined) {
      query.where(
        'inventory.drug_distributions.from_location_id',
        '>=',
        filters.from_location_id_min,
      );
    }
    if (filters.from_location_id_max !== undefined) {
      query.where(
        'inventory.drug_distributions.from_location_id',
        '<=',
        filters.from_location_id_max,
      );
    }
    if (filters.to_location_id !== undefined) {
      query.where(
        'inventory.drug_distributions.to_location_id',
        filters.to_location_id,
      );
    }
    if (filters.to_location_id_min !== undefined) {
      query.where(
        'inventory.drug_distributions.to_location_id',
        '>=',
        filters.to_location_id_min,
      );
    }
    if (filters.to_location_id_max !== undefined) {
      query.where(
        'inventory.drug_distributions.to_location_id',
        '<=',
        filters.to_location_id_max,
      );
    }
    if (filters.requesting_dept_id !== undefined) {
      query.where(
        'inventory.drug_distributions.requesting_dept_id',
        filters.requesting_dept_id,
      );
    }
    if (filters.requesting_dept_id_min !== undefined) {
      query.where(
        'inventory.drug_distributions.requesting_dept_id',
        '>=',
        filters.requesting_dept_id_min,
      );
    }
    if (filters.requesting_dept_id_max !== undefined) {
      query.where(
        'inventory.drug_distributions.requesting_dept_id',
        '<=',
        filters.requesting_dept_id_max,
      );
    }
    if (filters.requested_by !== undefined) {
      query.where(
        'inventory.drug_distributions.requested_by',
        filters.requested_by,
      );
    }
    if (filters.approved_by !== undefined) {
      query.where(
        'inventory.drug_distributions.approved_by',
        filters.approved_by,
      );
    }
    if (filters.dispensed_by !== undefined) {
      query.where(
        'inventory.drug_distributions.dispensed_by',
        filters.dispensed_by,
      );
    }
    if (filters.total_items !== undefined) {
      query.where(
        'inventory.drug_distributions.total_items',
        filters.total_items,
      );
    }
    if (filters.total_items_min !== undefined) {
      query.where(
        'inventory.drug_distributions.total_items',
        '>=',
        filters.total_items_min,
      );
    }
    if (filters.total_items_max !== undefined) {
      query.where(
        'inventory.drug_distributions.total_items',
        '<=',
        filters.total_items_max,
      );
    }
    if (filters.total_amount !== undefined) {
      query.where(
        'inventory.drug_distributions.total_amount',
        filters.total_amount,
      );
    }
    if (filters.total_amount_min !== undefined) {
      query.where(
        'inventory.drug_distributions.total_amount',
        '>=',
        filters.total_amount_min,
      );
    }
    if (filters.total_amount_max !== undefined) {
      query.where(
        'inventory.drug_distributions.total_amount',
        '<=',
        filters.total_amount_max,
      );
    }
    if (filters.notes !== undefined) {
      query.where('inventory.drug_distributions.notes', filters.notes);
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
      id: 'inventory.drug_distributions.id',
      distributionNumber: 'inventory.drug_distributions.distribution_number',
      distributionDate: 'inventory.drug_distributions.distribution_date',
      distributionTypeId: 'inventory.drug_distributions.distribution_type_id',
      fromLocationId: 'inventory.drug_distributions.from_location_id',
      toLocationId: 'inventory.drug_distributions.to_location_id',
      requestingDeptId: 'inventory.drug_distributions.requesting_dept_id',
      requestedBy: 'inventory.drug_distributions.requested_by',
      approvedBy: 'inventory.drug_distributions.approved_by',
      dispensedBy: 'inventory.drug_distributions.dispensed_by',
      status: 'inventory.drug_distributions.status',
      totalItems: 'inventory.drug_distributions.total_items',
      totalAmount: 'inventory.drug_distributions.total_amount',
      notes: 'inventory.drug_distributions.notes',
      createdAt: 'inventory.drug_distributions.created_at',
      updatedAt: 'inventory.drug_distributions.updated_at',
    };

    return sortFields[sortBy] || 'inventory.drug_distributions.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetDrugDistributionsQuery = {},
  ): Promise<DrugDistributions | null> {
    let query = this.getJoinQuery();
    query = query.where('drug_distributions.id', id);

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
    query: DrugDistributionsListQuery = {},
  ): Promise<PaginatedListResult<DrugDistributions>> {
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

    // Check drug_distribution_items references
    const drugDistributionItemsCount = await this.knex(
      'drug_distribution_items',
    )
      .where('distribution_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugDistributionItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_distribution_items',
        field: 'distribution_id',
        count: parseInt((drugDistributionItemsCount?.count as string) || '0'),
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
    const stats: any = await this.knex('inventory.drug_distributions')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(
    data: CreateDrugDistributions[],
  ): Promise<DrugDistributions[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.drug_distributions')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateDrugDistributions,
  ): Promise<DrugDistributions> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.drug_distributions')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
