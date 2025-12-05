import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateDrugGenerics,
  type UpdateDrugGenerics,
  type DrugGenerics,
  type GetDrugGenericsQuery,
  type ListDrugGenericsQuery,
  type DrugGenericsEntity,
} from './drug-generics.types';

export interface DrugGenericsListQuery extends BaseListQuery {
  // Smart field-based filters for DrugGenerics
  working_code?: string;
  generic_name?: string;
  dosage_form?: string;
  strength_unit?: string;
  dosage_form_id?: number;
  dosage_form_id_min?: number;
  dosage_form_id_max?: number;
  strength_unit_id?: number;
  strength_unit_id_min?: number;
  strength_unit_id_max?: number;
  strength_value?: number;
  strength_value_min?: number;
  strength_value_max?: number;
  is_active?: boolean;
}

export class DrugGenericsRepository extends BaseRepository<
  DrugGenerics,
  CreateDrugGenerics,
  UpdateDrugGenerics
> {
  constructor(knex: Knex) {
    super(
      knex,
      'drug_generics',
      [
        // Define searchable fields based on intelligent detection
        'drug_generics.generic_name',
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
  transformToEntity(dbRow: any): DrugGenerics {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      working_code: dbRow.working_code,
      generic_name: dbRow.generic_name,
      dosage_form: dbRow.dosage_form,
      strength_unit: dbRow.strength_unit,
      dosage_form_id: dbRow.dosage_form_id,
      strength_unit_id: dbRow.strength_unit_id,
      strength_value: dbRow.strength_value,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateDrugGenerics | UpdateDrugGenerics,
  ): Partial<DrugGenericsEntity> {
    const transformed: Partial<DrugGenericsEntity> = {};

    if ('working_code' in dto && dto.working_code !== undefined) {
      transformed.working_code = dto.working_code;
    }
    if ('generic_name' in dto && dto.generic_name !== undefined) {
      transformed.generic_name = dto.generic_name;
    }
    if ('dosage_form' in dto && dto.dosage_form !== undefined) {
      transformed.dosage_form = dto.dosage_form;
    }
    if ('strength_unit' in dto && dto.strength_unit !== undefined) {
      transformed.strength_unit = dto.strength_unit;
    }
    if ('dosage_form_id' in dto && dto.dosage_form_id !== undefined) {
      transformed.dosage_form_id = dto.dosage_form_id;
    }
    if ('strength_unit_id' in dto && dto.strength_unit_id !== undefined) {
      transformed.strength_unit_id = dto.strength_unit_id;
    }
    if ('strength_value' in dto && dto.strength_value !== undefined) {
      transformed.strength_value = dto.strength_value;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('drug_generics').select('drug_generics.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'drug_generics.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: DrugGenericsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific DrugGenerics filters based on intelligent field categorization
    if (filters.working_code !== undefined) {
      query.where('drug_generics.working_code', filters.working_code);
    }
    if (filters.generic_name !== undefined) {
      query.where('drug_generics.generic_name', filters.generic_name);
    }
    if (filters.dosage_form !== undefined) {
      query.where('drug_generics.dosage_form', filters.dosage_form);
    }
    if (filters.strength_unit !== undefined) {
      query.where('drug_generics.strength_unit', filters.strength_unit);
    }
    if (filters.dosage_form_id !== undefined) {
      query.where('drug_generics.dosage_form_id', filters.dosage_form_id);
    }
    if (filters.dosage_form_id_min !== undefined) {
      query.where(
        'drug_generics.dosage_form_id',
        '>=',
        filters.dosage_form_id_min,
      );
    }
    if (filters.dosage_form_id_max !== undefined) {
      query.where(
        'drug_generics.dosage_form_id',
        '<=',
        filters.dosage_form_id_max,
      );
    }
    if (filters.strength_unit_id !== undefined) {
      query.where('drug_generics.strength_unit_id', filters.strength_unit_id);
    }
    if (filters.strength_unit_id_min !== undefined) {
      query.where(
        'drug_generics.strength_unit_id',
        '>=',
        filters.strength_unit_id_min,
      );
    }
    if (filters.strength_unit_id_max !== undefined) {
      query.where(
        'drug_generics.strength_unit_id',
        '<=',
        filters.strength_unit_id_max,
      );
    }
    if (filters.strength_value !== undefined) {
      query.where('drug_generics.strength_value', filters.strength_value);
    }
    if (filters.strength_value_min !== undefined) {
      query.where(
        'drug_generics.strength_value',
        '>=',
        filters.strength_value_min,
      );
    }
    if (filters.strength_value_max !== undefined) {
      query.where(
        'drug_generics.strength_value',
        '<=',
        filters.strength_value_max,
      );
    }
    if (filters.is_active !== undefined) {
      query.where('drug_generics.is_active', filters.is_active);
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
      id: 'drug_generics.id',
      workingCode: 'drug_generics.working_code',
      genericName: 'drug_generics.generic_name',
      dosageForm: 'drug_generics.dosage_form',
      strengthUnit: 'drug_generics.strength_unit',
      dosageFormId: 'drug_generics.dosage_form_id',
      strengthUnitId: 'drug_generics.strength_unit_id',
      strengthValue: 'drug_generics.strength_value',
      isActive: 'drug_generics.is_active',
      createdAt: 'drug_generics.created_at',
      updatedAt: 'drug_generics.updated_at',
    };

    return sortFields[sortBy] || 'drug_generics.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetDrugGenericsQuery = {},
  ): Promise<DrugGenerics | null> {
    let query = this.getJoinQuery();
    query = query.where('drug_generics.id', id);

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
    query: DrugGenericsListQuery = {},
  ): Promise<PaginatedListResult<DrugGenerics>> {
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

    // Check budget_plan_items references
    const budgetPlanItemsCount = await this.knex('budget_plan_items')
      .where('generic_id', id)
      .count('* as count')
      .first();

    if (parseInt((budgetPlanItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'budget_plan_items',
        field: 'generic_id',
        count: parseInt((budgetPlanItemsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check contract_items references
    const contractItemsCount = await this.knex('contract_items')
      .where('generic_id', id)
      .count('* as count')
      .first();

    if (parseInt((contractItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'contract_items',
        field: 'generic_id',
        count: parseInt((contractItemsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check drug_components references
    const drugComponentsCount = await this.knex('drug_components')
      .where('generic_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugComponentsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_components',
        field: 'generic_id',
        count: parseInt((drugComponentsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check drug_focus_lists references
    const drugFocusListsCount = await this.knex('drug_focus_lists')
      .where('generic_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugFocusListsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_focus_lists',
        field: 'generic_id',
        count: parseInt((drugFocusListsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check drugs references
    const drugsCount = await this.knex('drugs')
      .where('generic_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drugs',
        field: 'generic_id',
        count: parseInt((drugsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check hospital_pharmaceutical_products references
    const hospitalPharmaceuticalProductsCount = await this.knex(
      'hospital_pharmaceutical_products',
    )
      .where('generic_id', id)
      .count('* as count')
      .first();

    if (
      parseInt((hospitalPharmaceuticalProductsCount?.count as string) || '0') >
      0
    ) {
      blockedBy.push({
        table: 'hospital_pharmaceutical_products',
        field: 'generic_id',
        count: parseInt(
          (hospitalPharmaceuticalProductsCount?.count as string) || '0',
        ),
        cascade: false,
      });
    }

    // Check purchase_order_items references
    const purchaseOrderItemsCount = await this.knex('purchase_order_items')
      .where('generic_id', id)
      .count('* as count')
      .first();

    if (parseInt((purchaseOrderItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'purchase_order_items',
        field: 'generic_id',
        count: parseInt((purchaseOrderItemsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check purchase_request_items references
    const purchaseRequestItemsCount = await this.knex('purchase_request_items')
      .where('generic_id', id)
      .count('* as count')
      .first();

    if (parseInt((purchaseRequestItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'purchase_request_items',
        field: 'generic_id',
        count: parseInt((purchaseRequestItemsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check receipt_items references
    const receiptItemsCount = await this.knex('receipt_items')
      .where('generic_id', id)
      .count('* as count')
      .first();

    if (parseInt((receiptItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'receipt_items',
        field: 'generic_id',
        count: parseInt((receiptItemsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check tmt_mappings references
    const tmtMappingsCount = await this.knex('tmt_mappings')
      .where('generic_id', id)
      .count('* as count')
      .first();

    if (parseInt((tmtMappingsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'tmt_mappings',
        field: 'generic_id',
        count: parseInt((tmtMappingsCount?.count as string) || '0'),
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
    const stats: any = await this.knex('drug_generics')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateDrugGenerics[]): Promise<DrugGenerics[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('drug_generics')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateDrugGenerics): Promise<DrugGenerics> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('drug_generics')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
