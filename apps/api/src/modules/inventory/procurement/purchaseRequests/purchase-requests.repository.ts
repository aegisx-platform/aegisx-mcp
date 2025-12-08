import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreatePurchaseRequests,
  type UpdatePurchaseRequests,
  type PurchaseRequests,
  type GetPurchaseRequestsQuery,
  type ListPurchaseRequestsQuery,
  type PurchaseRequestsEntity,
} from './purchase-requests.types';

export interface PurchaseRequestsListQuery extends BaseListQuery {
  // Smart field-based filters for PurchaseRequests
  pr_number?: string;
  department_id?: number;
  department_id_min?: number;
  department_id_max?: number;
  budget_id?: number;
  budget_id_min?: number;
  budget_id_max?: number;
  fiscal_year?: number;
  fiscal_year_min?: number;
  fiscal_year_max?: number;
  requested_by?: string;
  total_amount?: number;
  total_amount_min?: number;
  total_amount_max?: number;
  purpose?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  is_active?: boolean;
}

export class PurchaseRequestsRepository extends BaseRepository<
  PurchaseRequests,
  CreatePurchaseRequests,
  UpdatePurchaseRequests
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.purchase_requests',
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
  transformToEntity(dbRow: any): PurchaseRequests {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      pr_number: dbRow.pr_number,
      department_id: dbRow.department_id,
      budget_id: dbRow.budget_id,
      fiscal_year: dbRow.fiscal_year,
      request_date: dbRow.request_date,
      required_date: dbRow.required_date,
      requested_by: dbRow.requested_by,
      total_amount: dbRow.total_amount,
      status: dbRow.status,
      priority: dbRow.priority,
      purpose: dbRow.purpose,
      approved_by: dbRow.approved_by,
      approved_at: dbRow.approved_at,
      rejected_by: dbRow.rejected_by,
      rejected_at: dbRow.rejected_at,
      rejection_reason: dbRow.rejection_reason,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreatePurchaseRequests | UpdatePurchaseRequests,
  ): Partial<PurchaseRequestsEntity> {
    const transformed: Partial<PurchaseRequestsEntity> = {};

    if ('pr_number' in dto && dto.pr_number !== undefined) {
      transformed.pr_number = dto.pr_number;
    }
    if ('department_id' in dto && dto.department_id !== undefined) {
      transformed.department_id = dto.department_id;
    }
    if ('budget_id' in dto && dto.budget_id !== undefined) {
      transformed.budget_id = dto.budget_id;
    }
    if ('fiscal_year' in dto && dto.fiscal_year !== undefined) {
      transformed.fiscal_year = dto.fiscal_year;
    }
    if ('request_date' in dto && dto.request_date !== undefined) {
      transformed.request_date =
        typeof dto.request_date === 'string'
          ? new Date(dto.request_date)
          : dto.request_date;
    }
    if ('required_date' in dto && dto.required_date !== undefined) {
      transformed.required_date =
        typeof dto.required_date === 'string'
          ? new Date(dto.required_date)
          : dto.required_date;
    }
    if ('requested_by' in dto && dto.requested_by !== undefined) {
      transformed.requested_by = dto.requested_by;
    }
    if ('total_amount' in dto && dto.total_amount !== undefined) {
      transformed.total_amount = dto.total_amount;
    }
    if ('status' in dto && dto.status !== undefined) {
      transformed.status = dto.status;
    }
    if ('priority' in dto && dto.priority !== undefined) {
      transformed.priority = dto.priority;
    }
    if ('purpose' in dto && dto.purpose !== undefined) {
      transformed.purpose = dto.purpose;
    }
    if ('approved_by' in dto && dto.approved_by !== undefined) {
      transformed.approved_by = dto.approved_by;
    }
    if ('approved_at' in dto && dto.approved_at !== undefined) {
      transformed.approved_at =
        typeof dto.approved_at === 'string'
          ? new Date(dto.approved_at)
          : dto.approved_at;
    }
    if ('rejected_by' in dto && dto.rejected_by !== undefined) {
      transformed.rejected_by = dto.rejected_by;
    }
    if ('rejected_at' in dto && dto.rejected_at !== undefined) {
      transformed.rejected_at =
        typeof dto.rejected_at === 'string'
          ? new Date(dto.rejected_at)
          : dto.rejected_at;
    }
    if ('rejection_reason' in dto && dto.rejection_reason !== undefined) {
      transformed.rejection_reason = dto.rejection_reason;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.purchase_requests').select(
      'inventory.purchase_requests.*',
    );
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.purchase_requests.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: PurchaseRequestsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific PurchaseRequests filters based on intelligent field categorization
    if (filters.pr_number !== undefined) {
      query.where('inventory.purchase_requests.pr_number', filters.pr_number);
    }
    if (filters.department_id !== undefined) {
      query.where(
        'inventory.purchase_requests.department_id',
        filters.department_id,
      );
    }
    if (filters.department_id_min !== undefined) {
      query.where(
        'inventory.purchase_requests.department_id',
        '>=',
        filters.department_id_min,
      );
    }
    if (filters.department_id_max !== undefined) {
      query.where(
        'inventory.purchase_requests.department_id',
        '<=',
        filters.department_id_max,
      );
    }
    if (filters.budget_id !== undefined) {
      query.where('inventory.purchase_requests.budget_id', filters.budget_id);
    }
    if (filters.budget_id_min !== undefined) {
      query.where(
        'inventory.purchase_requests.budget_id',
        '>=',
        filters.budget_id_min,
      );
    }
    if (filters.budget_id_max !== undefined) {
      query.where(
        'inventory.purchase_requests.budget_id',
        '<=',
        filters.budget_id_max,
      );
    }
    if (filters.fiscal_year !== undefined) {
      query.where(
        'inventory.purchase_requests.fiscal_year',
        filters.fiscal_year,
      );
    }
    if (filters.fiscal_year_min !== undefined) {
      query.where(
        'inventory.purchase_requests.fiscal_year',
        '>=',
        filters.fiscal_year_min,
      );
    }
    if (filters.fiscal_year_max !== undefined) {
      query.where(
        'inventory.purchase_requests.fiscal_year',
        '<=',
        filters.fiscal_year_max,
      );
    }
    if (filters.requested_by !== undefined) {
      query.where(
        'inventory.purchase_requests.requested_by',
        filters.requested_by,
      );
    }
    if (filters.total_amount !== undefined) {
      query.where(
        'inventory.purchase_requests.total_amount',
        filters.total_amount,
      );
    }
    if (filters.total_amount_min !== undefined) {
      query.where(
        'inventory.purchase_requests.total_amount',
        '>=',
        filters.total_amount_min,
      );
    }
    if (filters.total_amount_max !== undefined) {
      query.where(
        'inventory.purchase_requests.total_amount',
        '<=',
        filters.total_amount_max,
      );
    }
    if (filters.purpose !== undefined) {
      query.where('inventory.purchase_requests.purpose', filters.purpose);
    }
    if (filters.approved_by !== undefined) {
      query.where(
        'inventory.purchase_requests.approved_by',
        filters.approved_by,
      );
    }
    if (filters.rejected_by !== undefined) {
      query.where(
        'inventory.purchase_requests.rejected_by',
        filters.rejected_by,
      );
    }
    if (filters.rejection_reason !== undefined) {
      query.where(
        'inventory.purchase_requests.rejection_reason',
        filters.rejection_reason,
      );
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.purchase_requests.is_active', filters.is_active);
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
      id: 'inventory.purchase_requests.id',
      prNumber: 'inventory.purchase_requests.pr_number',
      departmentId: 'inventory.purchase_requests.department_id',
      budgetId: 'inventory.purchase_requests.budget_id',
      fiscalYear: 'inventory.purchase_requests.fiscal_year',
      requestDate: 'inventory.purchase_requests.request_date',
      requiredDate: 'inventory.purchase_requests.required_date',
      requestedBy: 'inventory.purchase_requests.requested_by',
      totalAmount: 'inventory.purchase_requests.total_amount',
      status: 'inventory.purchase_requests.status',
      priority: 'inventory.purchase_requests.priority',
      purpose: 'inventory.purchase_requests.purpose',
      approvedBy: 'inventory.purchase_requests.approved_by',
      approvedAt: 'inventory.purchase_requests.approved_at',
      rejectedBy: 'inventory.purchase_requests.rejected_by',
      rejectedAt: 'inventory.purchase_requests.rejected_at',
      rejectionReason: 'inventory.purchase_requests.rejection_reason',
      isActive: 'inventory.purchase_requests.is_active',
      createdAt: 'inventory.purchase_requests.created_at',
      updatedAt: 'inventory.purchase_requests.updated_at',
    };

    return sortFields[sortBy] || 'inventory.purchase_requests.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetPurchaseRequestsQuery = {},
  ): Promise<PurchaseRequests | null> {
    let query = this.getJoinQuery();
    query = query.where('purchase_requests.id', id);

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
    query: PurchaseRequestsListQuery = {},
  ): Promise<PaginatedListResult<PurchaseRequests>> {
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

    // Check purchase_orders references
    const purchaseOrdersCount = await this.knex('purchase_orders')
      .where('pr_id', id)
      .count('* as count')
      .first();

    if (parseInt((purchaseOrdersCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'purchase_orders',
        field: 'pr_id',
        count: parseInt((purchaseOrdersCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check purchase_request_items references
    const purchaseRequestItemsCount = await this.knex('purchase_request_items')
      .where('pr_id', id)
      .count('* as count')
      .first();

    if (parseInt((purchaseRequestItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'purchase_request_items',
        field: 'pr_id',
        count: parseInt((purchaseRequestItemsCount?.count as string) || '0'),
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
    const stats: any = await this.knex('inventory.purchase_requests')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(
    data: CreatePurchaseRequests[],
  ): Promise<PurchaseRequests[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.purchase_requests')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreatePurchaseRequests,
  ): Promise<PurchaseRequests> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.purchase_requests')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
