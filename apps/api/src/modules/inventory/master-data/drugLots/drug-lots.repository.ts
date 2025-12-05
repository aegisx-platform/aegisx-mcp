import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateDrugLots,
  type UpdateDrugLots,
  type DrugLots,
  type GetDrugLotsQuery,
  type ListDrugLotsQuery,
  type DrugLotsEntity,
} from './drug-lots.types';

export interface DrugLotsListQuery extends BaseListQuery {
  // Smart field-based filters for DrugLots
  drug_id?: number;
  drug_id_min?: number;
  drug_id_max?: number;
  location_id?: number;
  location_id_min?: number;
  location_id_max?: number;
  lot_number?: string;
  quantity_available?: number;
  quantity_available_min?: number;
  quantity_available_max?: number;
  unit_cost?: number;
  unit_cost_min?: number;
  unit_cost_max?: number;
  receipt_id?: number;
  receipt_id_min?: number;
  receipt_id_max?: number;
  is_active?: boolean;
  notes?: string;
}

export class DrugLotsRepository extends BaseRepository<
  DrugLots,
  CreateDrugLots,
  UpdateDrugLots
> {
  constructor(knex: Knex) {
    super(
      knex,
      'drug_lots',
      [
        // Define searchable fields based on intelligent detection
        'drug_lots.notes',
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
  transformToEntity(dbRow: any): DrugLots {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      drug_id: dbRow.drug_id,
      location_id: dbRow.location_id,
      lot_number: dbRow.lot_number,
      expiry_date: dbRow.expiry_date,
      quantity_available: dbRow.quantity_available,
      unit_cost: dbRow.unit_cost,
      received_date: dbRow.received_date,
      receipt_id: dbRow.receipt_id,
      is_active: dbRow.is_active,
      notes: dbRow.notes,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateDrugLots | UpdateDrugLots): Partial<DrugLotsEntity> {
    const transformed: Partial<DrugLotsEntity> = {};

    if ('drug_id' in dto && dto.drug_id !== undefined) {
      transformed.drug_id = dto.drug_id;
    }
    if ('location_id' in dto && dto.location_id !== undefined) {
      transformed.location_id = dto.location_id;
    }
    if ('lot_number' in dto && dto.lot_number !== undefined) {
      transformed.lot_number = dto.lot_number;
    }
    if ('expiry_date' in dto && dto.expiry_date !== undefined) {
      transformed.expiry_date =
        typeof dto.expiry_date === 'string'
          ? new Date(dto.expiry_date)
          : dto.expiry_date;
    }
    if ('quantity_available' in dto && dto.quantity_available !== undefined) {
      transformed.quantity_available = dto.quantity_available;
    }
    if ('unit_cost' in dto && dto.unit_cost !== undefined) {
      transformed.unit_cost = dto.unit_cost;
    }
    if ('received_date' in dto && dto.received_date !== undefined) {
      transformed.received_date =
        typeof dto.received_date === 'string'
          ? new Date(dto.received_date)
          : dto.received_date;
    }
    if ('receipt_id' in dto && dto.receipt_id !== undefined) {
      transformed.receipt_id = dto.receipt_id;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    if ('notes' in dto && dto.notes !== undefined) {
      transformed.notes = dto.notes;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('drug_lots').select('drug_lots.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'drug_lots.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: DrugLotsListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific DrugLots filters based on intelligent field categorization
    if (filters.drug_id !== undefined) {
      query.where('drug_lots.drug_id', filters.drug_id);
    }
    if (filters.drug_id_min !== undefined) {
      query.where('drug_lots.drug_id', '>=', filters.drug_id_min);
    }
    if (filters.drug_id_max !== undefined) {
      query.where('drug_lots.drug_id', '<=', filters.drug_id_max);
    }
    if (filters.location_id !== undefined) {
      query.where('drug_lots.location_id', filters.location_id);
    }
    if (filters.location_id_min !== undefined) {
      query.where('drug_lots.location_id', '>=', filters.location_id_min);
    }
    if (filters.location_id_max !== undefined) {
      query.where('drug_lots.location_id', '<=', filters.location_id_max);
    }
    if (filters.lot_number !== undefined) {
      query.where('drug_lots.lot_number', filters.lot_number);
    }
    if (filters.quantity_available !== undefined) {
      query.where('drug_lots.quantity_available', filters.quantity_available);
    }
    if (filters.quantity_available_min !== undefined) {
      query.where(
        'drug_lots.quantity_available',
        '>=',
        filters.quantity_available_min,
      );
    }
    if (filters.quantity_available_max !== undefined) {
      query.where(
        'drug_lots.quantity_available',
        '<=',
        filters.quantity_available_max,
      );
    }
    if (filters.unit_cost !== undefined) {
      query.where('drug_lots.unit_cost', filters.unit_cost);
    }
    if (filters.unit_cost_min !== undefined) {
      query.where('drug_lots.unit_cost', '>=', filters.unit_cost_min);
    }
    if (filters.unit_cost_max !== undefined) {
      query.where('drug_lots.unit_cost', '<=', filters.unit_cost_max);
    }
    if (filters.receipt_id !== undefined) {
      query.where('drug_lots.receipt_id', filters.receipt_id);
    }
    if (filters.receipt_id_min !== undefined) {
      query.where('drug_lots.receipt_id', '>=', filters.receipt_id_min);
    }
    if (filters.receipt_id_max !== undefined) {
      query.where('drug_lots.receipt_id', '<=', filters.receipt_id_max);
    }
    if (filters.is_active !== undefined) {
      query.where('drug_lots.is_active', filters.is_active);
    }
    if (filters.notes !== undefined) {
      query.where('drug_lots.notes', filters.notes);
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
      id: 'drug_lots.id',
      drugId: 'drug_lots.drug_id',
      locationId: 'drug_lots.location_id',
      lotNumber: 'drug_lots.lot_number',
      expiryDate: 'drug_lots.expiry_date',
      quantityAvailable: 'drug_lots.quantity_available',
      unitCost: 'drug_lots.unit_cost',
      receivedDate: 'drug_lots.received_date',
      receiptId: 'drug_lots.receipt_id',
      isActive: 'drug_lots.is_active',
      notes: 'drug_lots.notes',
      createdAt: 'drug_lots.created_at',
      updatedAt: 'drug_lots.updated_at',
    };

    return sortFields[sortBy] || 'drug_lots.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetDrugLotsQuery = {},
  ): Promise<DrugLots | null> {
    let query = this.getJoinQuery();
    query = query.where('drug_lots.id', id);

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
    query: DrugLotsListQuery = {},
  ): Promise<PaginatedListResult<DrugLots>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('drug_lots')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateDrugLots[]): Promise<DrugLots[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('drug_lots')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateDrugLots): Promise<DrugLots> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('drug_lots')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
