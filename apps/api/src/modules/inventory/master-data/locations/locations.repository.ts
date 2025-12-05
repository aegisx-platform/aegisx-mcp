import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateLocations,
  type UpdateLocations,
  type Locations,
  type GetLocationsQuery,
  type ListLocationsQuery,
  type LocationsEntity,
} from './locations.types';

export interface LocationsListQuery extends BaseListQuery {
  // Smart field-based filters for Locations
  location_code?: string;
  location_name?: string;
  parent_id?: number;
  parent_id_min?: number;
  parent_id_max?: number;
  address?: string;
  responsible_person?: string;
  is_active?: boolean;
}

export class LocationsRepository extends BaseRepository<
  Locations,
  CreateLocations,
  UpdateLocations
> {
  constructor(knex: Knex) {
    super(
      knex,
      'locations',
      [
        // Define searchable fields based on intelligent detection
        'locations.location_name',
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
  transformToEntity(dbRow: any): Locations {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      location_code: dbRow.location_code,
      location_name: dbRow.location_name,
      location_type: dbRow.location_type,
      parent_id: dbRow.parent_id,
      address: dbRow.address,
      responsible_person: dbRow.responsible_person,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateLocations | UpdateLocations,
  ): Partial<LocationsEntity> {
    const transformed: Partial<LocationsEntity> = {};

    if ('location_code' in dto && dto.location_code !== undefined) {
      transformed.location_code = dto.location_code;
    }
    if ('location_name' in dto && dto.location_name !== undefined) {
      transformed.location_name = dto.location_name;
    }
    if ('location_type' in dto && dto.location_type !== undefined) {
      transformed.location_type = dto.location_type;
    }
    if ('parent_id' in dto && dto.parent_id !== undefined) {
      transformed.parent_id = dto.parent_id;
    }
    if ('address' in dto && dto.address !== undefined) {
      transformed.address = dto.address;
    }
    if ('responsible_person' in dto && dto.responsible_person !== undefined) {
      transformed.responsible_person = dto.responsible_person;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('locations').select('locations.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'locations.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: LocationsListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Locations filters based on intelligent field categorization
    if (filters.location_code !== undefined) {
      query.where('locations.location_code', filters.location_code);
    }
    if (filters.location_name !== undefined) {
      query.where('locations.location_name', filters.location_name);
    }
    if (filters.parent_id !== undefined) {
      query.where('locations.parent_id', filters.parent_id);
    }
    if (filters.parent_id_min !== undefined) {
      query.where('locations.parent_id', '>=', filters.parent_id_min);
    }
    if (filters.parent_id_max !== undefined) {
      query.where('locations.parent_id', '<=', filters.parent_id_max);
    }
    if (filters.address !== undefined) {
      query.where('locations.address', filters.address);
    }
    if (filters.responsible_person !== undefined) {
      query.where('locations.responsible_person', filters.responsible_person);
    }
    if (filters.is_active !== undefined) {
      query.where('locations.is_active', filters.is_active);
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
      id: 'locations.id',
      locationCode: 'locations.location_code',
      locationName: 'locations.location_name',
      locationType: 'locations.location_type',
      parentId: 'locations.parent_id',
      address: 'locations.address',
      responsiblePerson: 'locations.responsible_person',
      isActive: 'locations.is_active',
      createdAt: 'locations.created_at',
      updatedAt: 'locations.updated_at',
    };

    return sortFields[sortBy] || 'locations.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetLocationsQuery = {},
  ): Promise<Locations | null> {
    let query = this.getJoinQuery();
    query = query.where('locations.id', id);

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
    query: LocationsListQuery = {},
  ): Promise<PaginatedListResult<Locations>> {
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

    // Check drug_distributions references
    const drugDistributionsCount = await this.knex('drug_distributions')
      .where('from_location_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugDistributionsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_distributions',
        field: 'from_location_id',
        count: parseInt((drugDistributionsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check drug_lots references
    const drugLotsCount = await this.knex('drug_lots')
      .where('location_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugLotsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_lots',
        field: 'location_id',
        count: parseInt((drugLotsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check drug_return_items references
    const drugReturnItemsCount = await this.knex('drug_return_items')
      .where('location_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugReturnItemsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_return_items',
        field: 'location_id',
        count: parseInt((drugReturnItemsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check inventory references
    const inventoryCount = await this.knex('inventory')
      .where('location_id', id)
      .count('* as count')
      .first();

    if (parseInt((inventoryCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'inventory',
        field: 'location_id',
        count: parseInt((inventoryCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check locations references
    const locationsCount = await this.knex('locations')
      .where('parent_id', id)
      .count('* as count')
      .first();

    if (parseInt((locationsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'locations',
        field: 'parent_id',
        count: parseInt((locationsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check receipts references
    const receiptsCount = await this.knex('receipts')
      .where('location_id', id)
      .count('* as count')
      .first();

    if (parseInt((receiptsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'receipts',
        field: 'location_id',
        count: parseInt((receiptsCount?.count as string) || '0'),
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
    const stats: any = await this.knex('locations')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateLocations[]): Promise<Locations[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('locations')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateLocations): Promise<Locations> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('locations')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
