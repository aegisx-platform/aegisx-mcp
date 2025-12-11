import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateBudgetRequestItems,
  type UpdateBudgetRequestItems,
  type BudgetRequestItems,
  type GetBudgetRequestItemsQuery,
  type ListBudgetRequestItemsQuery,
  type BudgetRequestItemsEntity,
} from './budget-request-items.types';

export interface BudgetRequestItemsListQuery extends BaseListQuery {
  // Smart field-based filters for BudgetRequestItems
  budget_request_id?: number;
  budget_request_id_min?: number;
  budget_request_id_max?: number;
  budget_id?: number;
  budget_id_min?: number;
  budget_id_max?: number;
  requested_amount?: number;
  requested_amount_min?: number;
  requested_amount_max?: number;
  q1_qty?: number;
  q1_qty_min?: number;
  q1_qty_max?: number;
  q2_qty?: number;
  q2_qty_min?: number;
  q2_qty_max?: number;
  q3_qty?: number;
  q3_qty_min?: number;
  q3_qty_max?: number;
  q4_qty?: number;
  q4_qty_min?: number;
  q4_qty_max?: number;
  item_justification?: string;
  drug_id?: number;
  drug_id_min?: number;
  drug_id_max?: number;
  generic_id?: number;
  generic_id_min?: number;
  generic_id_max?: number;
  generic_code?: string;
  generic_name?: string;
  package_size?: string;
  unit?: string;
  line_number?: number;
  line_number_min?: number;
  line_number_max?: number;
  avg_usage?: number;
  avg_usage_min?: number;
  avg_usage_max?: number;
  estimated_usage_2569?: number;
  estimated_usage_2569_min?: number;
  estimated_usage_2569_max?: number;
  current_stock?: number;
  current_stock_min?: number;
  current_stock_max?: number;
  estimated_purchase?: number;
  estimated_purchase_min?: number;
  estimated_purchase_max?: number;
  unit_price?: number;
  unit_price_min?: number;
  unit_price_max?: number;
  requested_qty?: number;
  requested_qty_min?: number;
  requested_qty_max?: number;
  budget_type_id?: number;
  budget_type_id_min?: number;
  budget_type_id_max?: number;
  budget_category_id?: number;
  budget_category_id_min?: number;
  budget_category_id_max?: number;
}

export class BudgetRequestItemsRepository extends BaseRepository<
  BudgetRequestItems,
  CreateBudgetRequestItems,
  UpdateBudgetRequestItems
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.budget_request_items',
      [
        // Define searchable fields based on intelligent detection
        'inventory.budget_request_items.generic_name',
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
  transformToEntity(dbRow: any): BudgetRequestItems {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      budget_request_id: dbRow.budget_request_id,
      budget_id: dbRow.budget_id,
      requested_amount: dbRow.requested_amount,
      q1_qty: dbRow.q1_qty,
      q2_qty: dbRow.q2_qty,
      q3_qty: dbRow.q3_qty,
      q4_qty: dbRow.q4_qty,
      item_justification: dbRow.item_justification,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      drug_id: dbRow.drug_id,
      generic_id: dbRow.generic_id,
      generic_code: dbRow.generic_code,
      generic_name: dbRow.generic_name,
      package_size: dbRow.package_size,
      unit: dbRow.unit,
      line_number: dbRow.line_number,
      avg_usage: dbRow.avg_usage,
      estimated_usage_2569: dbRow.estimated_usage_2569,
      current_stock: dbRow.current_stock,
      estimated_purchase: dbRow.estimated_purchase,
      unit_price: dbRow.unit_price,
      requested_qty: dbRow.requested_qty,
      budget_type_id: dbRow.budget_type_id,
      budget_category_id: dbRow.budget_category_id,
      historical_usage: dbRow.historical_usage,
      // From JOIN with drug_generics
      ed_category: dbRow.ed_category,
      tmt_gpu_code: dbRow.tmt_gpu_code,
      working_code: dbRow.working_code,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateBudgetRequestItems | UpdateBudgetRequestItems,
  ): Partial<BudgetRequestItemsEntity> {
    const transformed: Partial<BudgetRequestItemsEntity> = {};

    if ('budget_request_id' in dto && dto.budget_request_id !== undefined) {
      transformed.budget_request_id = dto.budget_request_id;
    }
    if ('budget_id' in dto && dto.budget_id !== undefined) {
      transformed.budget_id = dto.budget_id;
    }
    if ('requested_amount' in dto && dto.requested_amount !== undefined) {
      transformed.requested_amount = dto.requested_amount;
    }
    if ('q1_qty' in dto && dto.q1_qty !== undefined) {
      transformed.q1_qty = dto.q1_qty;
    }
    if ('q2_qty' in dto && dto.q2_qty !== undefined) {
      transformed.q2_qty = dto.q2_qty;
    }
    if ('q3_qty' in dto && dto.q3_qty !== undefined) {
      transformed.q3_qty = dto.q3_qty;
    }
    if ('q4_qty' in dto && dto.q4_qty !== undefined) {
      transformed.q4_qty = dto.q4_qty;
    }
    if ('item_justification' in dto && dto.item_justification !== undefined) {
      transformed.item_justification = dto.item_justification;
    }
    if ('drug_id' in dto && dto.drug_id !== undefined) {
      transformed.drug_id = dto.drug_id;
    }
    if ('generic_id' in dto && dto.generic_id !== undefined) {
      transformed.generic_id = dto.generic_id;
    }
    if ('generic_code' in dto && dto.generic_code !== undefined) {
      transformed.generic_code = dto.generic_code;
    }
    if ('generic_name' in dto && dto.generic_name !== undefined) {
      transformed.generic_name = dto.generic_name;
    }
    if ('package_size' in dto && dto.package_size !== undefined) {
      transformed.package_size = dto.package_size;
    }
    if ('unit' in dto && dto.unit !== undefined) {
      transformed.unit = dto.unit;
    }
    if ('line_number' in dto && dto.line_number !== undefined) {
      transformed.line_number = dto.line_number;
    }
    if ('avg_usage' in dto && dto.avg_usage !== undefined) {
      transformed.avg_usage = dto.avg_usage;
    }
    if (
      'estimated_usage_2569' in dto &&
      dto.estimated_usage_2569 !== undefined
    ) {
      transformed.estimated_usage_2569 = dto.estimated_usage_2569;
    }
    if ('current_stock' in dto && dto.current_stock !== undefined) {
      transformed.current_stock = dto.current_stock;
    }
    if ('estimated_purchase' in dto && dto.estimated_purchase !== undefined) {
      transformed.estimated_purchase = dto.estimated_purchase;
    }
    if ('unit_price' in dto && dto.unit_price !== undefined) {
      transformed.unit_price = dto.unit_price;
    }
    if ('requested_qty' in dto && dto.requested_qty !== undefined) {
      transformed.requested_qty = dto.requested_qty;
    }
    if ('budget_type_id' in dto && dto.budget_type_id !== undefined) {
      transformed.budget_type_id = dto.budget_type_id;
    }
    if ('budget_category_id' in dto && dto.budget_category_id !== undefined) {
      transformed.budget_category_id = dto.budget_category_id;
    }
    if ('historical_usage' in dto && dto.historical_usage !== undefined) {
      transformed.historical_usage = dto.historical_usage;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.budget_request_items')
      .select(
        'inventory.budget_request_items.*',
        'inventory.drug_generics.ed_category as ed_category',
        'inventory.drug_generics.tmt_gpu_code as tmt_gpu_code',
        'inventory.drug_generics.working_code as working_code',
      )
      .leftJoin(
        'inventory.drug_generics',
        'inventory.budget_request_items.generic_id',
        'inventory.drug_generics.id',
      );
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: BudgetRequestItemsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific BudgetRequestItems filters based on intelligent field categorization
    if (filters.budget_request_id !== undefined) {
      query.where(
        'inventory.budget_request_items.budget_request_id',
        filters.budget_request_id,
      );
    }
    if (filters.budget_request_id_min !== undefined) {
      query.where(
        'inventory.budget_request_items.budget_request_id',
        '>=',
        filters.budget_request_id_min,
      );
    }
    if (filters.budget_request_id_max !== undefined) {
      query.where(
        'inventory.budget_request_items.budget_request_id',
        '<=',
        filters.budget_request_id_max,
      );
    }
    if (filters.budget_id !== undefined) {
      query.where(
        'inventory.budget_request_items.budget_id',
        filters.budget_id,
      );
    }
    if (filters.budget_id_min !== undefined) {
      query.where(
        'inventory.budget_request_items.budget_id',
        '>=',
        filters.budget_id_min,
      );
    }
    if (filters.budget_id_max !== undefined) {
      query.where(
        'inventory.budget_request_items.budget_id',
        '<=',
        filters.budget_id_max,
      );
    }
    if (filters.requested_amount !== undefined) {
      query.where(
        'inventory.budget_request_items.requested_amount',
        filters.requested_amount,
      );
    }
    if (filters.requested_amount_min !== undefined) {
      query.where(
        'inventory.budget_request_items.requested_amount',
        '>=',
        filters.requested_amount_min,
      );
    }
    if (filters.requested_amount_max !== undefined) {
      query.where(
        'inventory.budget_request_items.requested_amount',
        '<=',
        filters.requested_amount_max,
      );
    }
    if (filters.q1_qty !== undefined) {
      query.where('inventory.budget_request_items.q1_qty', filters.q1_qty);
    }
    if (filters.q1_qty_min !== undefined) {
      query.where(
        'inventory.budget_request_items.q1_qty',
        '>=',
        filters.q1_qty_min,
      );
    }
    if (filters.q1_qty_max !== undefined) {
      query.where(
        'inventory.budget_request_items.q1_qty',
        '<=',
        filters.q1_qty_max,
      );
    }
    if (filters.q2_qty !== undefined) {
      query.where('inventory.budget_request_items.q2_qty', filters.q2_qty);
    }
    if (filters.q2_qty_min !== undefined) {
      query.where(
        'inventory.budget_request_items.q2_qty',
        '>=',
        filters.q2_qty_min,
      );
    }
    if (filters.q2_qty_max !== undefined) {
      query.where(
        'inventory.budget_request_items.q2_qty',
        '<=',
        filters.q2_qty_max,
      );
    }
    if (filters.q3_qty !== undefined) {
      query.where('inventory.budget_request_items.q3_qty', filters.q3_qty);
    }
    if (filters.q3_qty_min !== undefined) {
      query.where(
        'inventory.budget_request_items.q3_qty',
        '>=',
        filters.q3_qty_min,
      );
    }
    if (filters.q3_qty_max !== undefined) {
      query.where(
        'inventory.budget_request_items.q3_qty',
        '<=',
        filters.q3_qty_max,
      );
    }
    if (filters.q4_qty !== undefined) {
      query.where('inventory.budget_request_items.q4_qty', filters.q4_qty);
    }
    if (filters.q4_qty_min !== undefined) {
      query.where(
        'inventory.budget_request_items.q4_qty',
        '>=',
        filters.q4_qty_min,
      );
    }
    if (filters.q4_qty_max !== undefined) {
      query.where(
        'inventory.budget_request_items.q4_qty',
        '<=',
        filters.q4_qty_max,
      );
    }
    if (filters.item_justification !== undefined) {
      query.where(
        'inventory.budget_request_items.item_justification',
        filters.item_justification,
      );
    }
    if (filters.drug_id !== undefined) {
      query.where('inventory.budget_request_items.drug_id', filters.drug_id);
    }
    if (filters.drug_id_min !== undefined) {
      query.where(
        'inventory.budget_request_items.drug_id',
        '>=',
        filters.drug_id_min,
      );
    }
    if (filters.drug_id_max !== undefined) {
      query.where(
        'inventory.budget_request_items.drug_id',
        '<=',
        filters.drug_id_max,
      );
    }
    if (filters.generic_id !== undefined) {
      query.where(
        'inventory.budget_request_items.generic_id',
        filters.generic_id,
      );
    }
    if (filters.generic_id_min !== undefined) {
      query.where(
        'inventory.budget_request_items.generic_id',
        '>=',
        filters.generic_id_min,
      );
    }
    if (filters.generic_id_max !== undefined) {
      query.where(
        'inventory.budget_request_items.generic_id',
        '<=',
        filters.generic_id_max,
      );
    }
    if (filters.generic_code !== undefined) {
      query.where(
        'inventory.budget_request_items.generic_code',
        filters.generic_code,
      );
    }
    if (filters.generic_name !== undefined) {
      query.where(
        'inventory.budget_request_items.generic_name',
        filters.generic_name,
      );
    }
    if (filters.package_size !== undefined) {
      query.where(
        'inventory.budget_request_items.package_size',
        filters.package_size,
      );
    }
    if (filters.unit !== undefined) {
      query.where('inventory.budget_request_items.unit', filters.unit);
    }
    if (filters.line_number !== undefined) {
      query.where(
        'inventory.budget_request_items.line_number',
        filters.line_number,
      );
    }
    if (filters.line_number_min !== undefined) {
      query.where(
        'inventory.budget_request_items.line_number',
        '>=',
        filters.line_number_min,
      );
    }
    if (filters.line_number_max !== undefined) {
      query.where(
        'inventory.budget_request_items.line_number',
        '<=',
        filters.line_number_max,
      );
    }
    if (filters.avg_usage !== undefined) {
      query.where(
        'inventory.budget_request_items.avg_usage',
        filters.avg_usage,
      );
    }
    if (filters.avg_usage_min !== undefined) {
      query.where(
        'inventory.budget_request_items.avg_usage',
        '>=',
        filters.avg_usage_min,
      );
    }
    if (filters.avg_usage_max !== undefined) {
      query.where(
        'inventory.budget_request_items.avg_usage',
        '<=',
        filters.avg_usage_max,
      );
    }
    if (filters.estimated_usage_2569 !== undefined) {
      query.where(
        'inventory.budget_request_items.estimated_usage_2569',
        filters.estimated_usage_2569,
      );
    }
    if (filters.estimated_usage_2569_min !== undefined) {
      query.where(
        'inventory.budget_request_items.estimated_usage_2569',
        '>=',
        filters.estimated_usage_2569_min,
      );
    }
    if (filters.estimated_usage_2569_max !== undefined) {
      query.where(
        'inventory.budget_request_items.estimated_usage_2569',
        '<=',
        filters.estimated_usage_2569_max,
      );
    }
    if (filters.current_stock !== undefined) {
      query.where(
        'inventory.budget_request_items.current_stock',
        filters.current_stock,
      );
    }
    if (filters.current_stock_min !== undefined) {
      query.where(
        'inventory.budget_request_items.current_stock',
        '>=',
        filters.current_stock_min,
      );
    }
    if (filters.current_stock_max !== undefined) {
      query.where(
        'inventory.budget_request_items.current_stock',
        '<=',
        filters.current_stock_max,
      );
    }
    if (filters.estimated_purchase !== undefined) {
      query.where(
        'inventory.budget_request_items.estimated_purchase',
        filters.estimated_purchase,
      );
    }
    if (filters.estimated_purchase_min !== undefined) {
      query.where(
        'inventory.budget_request_items.estimated_purchase',
        '>=',
        filters.estimated_purchase_min,
      );
    }
    if (filters.estimated_purchase_max !== undefined) {
      query.where(
        'inventory.budget_request_items.estimated_purchase',
        '<=',
        filters.estimated_purchase_max,
      );
    }
    if (filters.unit_price !== undefined) {
      query.where(
        'inventory.budget_request_items.unit_price',
        filters.unit_price,
      );
    }
    if (filters.unit_price_min !== undefined) {
      query.where(
        'inventory.budget_request_items.unit_price',
        '>=',
        filters.unit_price_min,
      );
    }
    if (filters.unit_price_max !== undefined) {
      query.where(
        'inventory.budget_request_items.unit_price',
        '<=',
        filters.unit_price_max,
      );
    }
    if (filters.requested_qty !== undefined) {
      query.where(
        'inventory.budget_request_items.requested_qty',
        filters.requested_qty,
      );
    }
    if (filters.requested_qty_min !== undefined) {
      query.where(
        'inventory.budget_request_items.requested_qty',
        '>=',
        filters.requested_qty_min,
      );
    }
    if (filters.requested_qty_max !== undefined) {
      query.where(
        'inventory.budget_request_items.requested_qty',
        '<=',
        filters.requested_qty_max,
      );
    }
    if (filters.budget_type_id !== undefined) {
      query.where(
        'inventory.budget_request_items.budget_type_id',
        filters.budget_type_id,
      );
    }
    if (filters.budget_type_id_min !== undefined) {
      query.where(
        'inventory.budget_request_items.budget_type_id',
        '>=',
        filters.budget_type_id_min,
      );
    }
    if (filters.budget_type_id_max !== undefined) {
      query.where(
        'inventory.budget_request_items.budget_type_id',
        '<=',
        filters.budget_type_id_max,
      );
    }
    if (filters.budget_category_id !== undefined) {
      query.where(
        'inventory.budget_request_items.budget_category_id',
        filters.budget_category_id,
      );
    }
    if (filters.budget_category_id_min !== undefined) {
      query.where(
        'inventory.budget_request_items.budget_category_id',
        '>=',
        filters.budget_category_id_min,
      );
    }
    if (filters.budget_category_id_max !== undefined) {
      query.where(
        'inventory.budget_request_items.budget_category_id',
        '<=',
        filters.budget_category_id_max,
      );
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
      id: 'inventory.budget_request_items.id',
      budgetRequestId: 'inventory.budget_request_items.budget_request_id',
      budgetId: 'inventory.budget_request_items.budget_id',
      requestedAmount: 'inventory.budget_request_items.requested_amount',
      q1Qty: 'inventory.budget_request_items.q1_qty',
      q2Qty: 'inventory.budget_request_items.q2_qty',
      q3Qty: 'inventory.budget_request_items.q3_qty',
      q4Qty: 'inventory.budget_request_items.q4_qty',
      itemJustification: 'inventory.budget_request_items.item_justification',
      createdAt: 'inventory.budget_request_items.created_at',
      updatedAt: 'inventory.budget_request_items.updated_at',
      drugId: 'inventory.budget_request_items.drug_id',
      genericId: 'inventory.budget_request_items.generic_id',
      genericCode: 'inventory.budget_request_items.generic_code',
      genericName: 'inventory.budget_request_items.generic_name',
      packageSize: 'inventory.budget_request_items.package_size',
      unit: 'inventory.budget_request_items.unit',
      lineNumber: 'inventory.budget_request_items.line_number',
      avgUsage: 'inventory.budget_request_items.avg_usage',
      estimatedUsage_2569:
        'inventory.budget_request_items.estimated_usage_2569',
      currentStock: 'inventory.budget_request_items.current_stock',
      estimatedPurchase: 'inventory.budget_request_items.estimated_purchase',
      unitPrice: 'inventory.budget_request_items.unit_price',
      requestedQty: 'inventory.budget_request_items.requested_qty',
      budgetTypeId: 'inventory.budget_request_items.budget_type_id',
      budgetCategoryId: 'inventory.budget_request_items.budget_category_id',
      historicalUsage: 'inventory.budget_request_items.historical_usage',
    };

    return sortFields[sortBy] || 'inventory.budget_request_items.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetBudgetRequestItemsQuery = {},
  ): Promise<BudgetRequestItems | null> {
    let query = this.getJoinQuery();
    query = query.where('budget_request_items.id', id);

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
    query: BudgetRequestItemsListQuery = {},
  ): Promise<PaginatedListResult<BudgetRequestItems>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('inventory.budget_request_items')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(
    data: CreateBudgetRequestItems[],
  ): Promise<BudgetRequestItems[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.budget_request_items')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(
    data: CreateBudgetRequestItems,
  ): Promise<BudgetRequestItems> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.budget_request_items')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
