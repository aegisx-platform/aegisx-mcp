import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateHospitals,
  type UpdateHospitals,
  type Hospitals,
  type GetHospitalsQuery,
  type ListHospitalsQuery,
  type HospitalsEntity,
} from './hospitals.types';

export interface HospitalsListQuery extends BaseListQuery {
  // Smart field-based filters for Hospitals
  hospital_code?: string;
  hospital_name?: string;
  hospital_type?: string;
  province?: string;
  region?: string;
  is_active?: boolean;
}

export class HospitalsRepository extends BaseRepository<
  Hospitals,
  CreateHospitals,
  UpdateHospitals
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.hospitals',
      [
        // Define searchable fields based on intelligent detection
        'inventory.hospitals.hospital_name',
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
  transformToEntity(dbRow: any): Hospitals {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      hospital_code: dbRow.hospital_code,
      hospital_name: dbRow.hospital_name,
      hospital_type: dbRow.hospital_type,
      province: dbRow.province,
      region: dbRow.region,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateHospitals | UpdateHospitals,
  ): Partial<HospitalsEntity> {
    const transformed: Partial<HospitalsEntity> = {};

    if ('hospital_code' in dto && dto.hospital_code !== undefined) {
      transformed.hospital_code = dto.hospital_code;
    }
    if ('hospital_name' in dto && dto.hospital_name !== undefined) {
      transformed.hospital_name = dto.hospital_name;
    }
    if ('hospital_type' in dto && dto.hospital_type !== undefined) {
      transformed.hospital_type = dto.hospital_type;
    }
    if ('province' in dto && dto.province !== undefined) {
      transformed.province = dto.province;
    }
    if ('region' in dto && dto.region !== undefined) {
      transformed.region = dto.region;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.hospitals').select('inventory.hospitals.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.hospitals.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: HospitalsListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Hospitals filters based on intelligent field categorization
    if (filters.hospital_code !== undefined) {
      query.where('inventory.hospitals.hospital_code', filters.hospital_code);
    }
    if (filters.hospital_name !== undefined) {
      query.where('inventory.hospitals.hospital_name', filters.hospital_name);
    }
    if (filters.hospital_type !== undefined) {
      query.where('inventory.hospitals.hospital_type', filters.hospital_type);
    }
    if (filters.province !== undefined) {
      query.where('inventory.hospitals.province', filters.province);
    }
    if (filters.region !== undefined) {
      query.where('inventory.hospitals.region', filters.region);
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.hospitals.is_active', filters.is_active);
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
      id: 'inventory.hospitals.id',
      hospitalCode: 'inventory.hospitals.hospital_code',
      hospitalName: 'inventory.hospitals.hospital_name',
      hospitalType: 'inventory.hospitals.hospital_type',
      province: 'inventory.hospitals.province',
      region: 'inventory.hospitals.region',
      isActive: 'inventory.hospitals.is_active',
      createdAt: 'inventory.hospitals.created_at',
      updatedAt: 'inventory.hospitals.updated_at',
    };

    return sortFields[sortBy] || 'inventory.hospitals.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetHospitalsQuery = {},
  ): Promise<Hospitals | null> {
    let query = this.getJoinQuery();
    query = query.where('hospitals.id', id);

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
    query: HospitalsListQuery = {},
  ): Promise<PaginatedListResult<Hospitals>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('inventory.hospitals')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateHospitals[]): Promise<Hospitals[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.hospitals')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateHospitals): Promise<Hospitals> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.hospitals')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
