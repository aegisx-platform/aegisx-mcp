import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateTmtMappings,
  type UpdateTmtMappings,
  type TmtMappings,
  type GetTmtMappingsQuery,
  type ListTmtMappingsQuery,
  type TmtMappingsEntity,
} from './tmt-mappings.types';

export interface TmtMappingsListQuery extends BaseListQuery {
  // Smart field-based filters for TmtMappings
  working_code?: string;
  drug_code?: string;
  generic_id?: number;
  generic_id_min?: number;
  generic_id_max?: number;
  drug_id?: number;
  drug_id_min?: number;
  drug_id_max?: number;
  tmt_concept_id?: number;
  tmt_concept_id_min?: number;
  tmt_concept_id_max?: number;
  tmt_id?: number;
  tmt_id_min?: number;
  tmt_id_max?: number;
  is_verified?: boolean;
  verified_by?: string;
}

export class TmtMappingsRepository extends BaseRepository<
  TmtMappings,
  CreateTmtMappings,
  UpdateTmtMappings
> {
  constructor(knex: Knex) {
    super(
      knex,
      'tmt_mappings',
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
  transformToEntity(dbRow: any): TmtMappings {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      working_code: dbRow.working_code,
      drug_code: dbRow.drug_code,
      generic_id: dbRow.generic_id,
      drug_id: dbRow.drug_id,
      tmt_level: dbRow.tmt_level,
      tmt_concept_id: dbRow.tmt_concept_id,
      tmt_id: dbRow.tmt_id,
      is_verified: dbRow.is_verified,
      verified_by: dbRow.verified_by,
      verified_at: dbRow.verified_at,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateTmtMappings | UpdateTmtMappings,
  ): Partial<TmtMappingsEntity> {
    const transformed: Partial<TmtMappingsEntity> = {};

    if ('working_code' in dto && dto.working_code !== undefined) {
      transformed.working_code = dto.working_code;
    }
    if ('drug_code' in dto && dto.drug_code !== undefined) {
      transformed.drug_code = dto.drug_code;
    }
    if ('generic_id' in dto && dto.generic_id !== undefined) {
      transformed.generic_id = dto.generic_id;
    }
    if ('drug_id' in dto && dto.drug_id !== undefined) {
      transformed.drug_id = dto.drug_id;
    }
    if ('tmt_level' in dto && dto.tmt_level !== undefined) {
      transformed.tmt_level = dto.tmt_level;
    }
    if ('tmt_concept_id' in dto && dto.tmt_concept_id !== undefined) {
      transformed.tmt_concept_id = dto.tmt_concept_id;
    }
    if ('tmt_id' in dto && dto.tmt_id !== undefined) {
      transformed.tmt_id = dto.tmt_id;
    }
    if ('is_verified' in dto && dto.is_verified !== undefined) {
      transformed.is_verified = dto.is_verified;
    }
    if ('verified_by' in dto && dto.verified_by !== undefined) {
      transformed.verified_by = dto.verified_by;
    }
    if ('verified_at' in dto && dto.verified_at !== undefined) {
      transformed.verified_at =
        typeof dto.verified_at === 'string'
          ? new Date(dto.verified_at)
          : dto.verified_at;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('tmt_mappings').select('tmt_mappings.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'tmt_mappings.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: TmtMappingsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific TmtMappings filters based on intelligent field categorization
    if (filters.working_code !== undefined) {
      query.where('tmt_mappings.working_code', filters.working_code);
    }
    if (filters.drug_code !== undefined) {
      query.where('tmt_mappings.drug_code', filters.drug_code);
    }
    if (filters.generic_id !== undefined) {
      query.where('tmt_mappings.generic_id', filters.generic_id);
    }
    if (filters.generic_id_min !== undefined) {
      query.where('tmt_mappings.generic_id', '>=', filters.generic_id_min);
    }
    if (filters.generic_id_max !== undefined) {
      query.where('tmt_mappings.generic_id', '<=', filters.generic_id_max);
    }
    if (filters.drug_id !== undefined) {
      query.where('tmt_mappings.drug_id', filters.drug_id);
    }
    if (filters.drug_id_min !== undefined) {
      query.where('tmt_mappings.drug_id', '>=', filters.drug_id_min);
    }
    if (filters.drug_id_max !== undefined) {
      query.where('tmt_mappings.drug_id', '<=', filters.drug_id_max);
    }
    if (filters.tmt_concept_id !== undefined) {
      query.where('tmt_mappings.tmt_concept_id', filters.tmt_concept_id);
    }
    if (filters.tmt_concept_id_min !== undefined) {
      query.where(
        'tmt_mappings.tmt_concept_id',
        '>=',
        filters.tmt_concept_id_min,
      );
    }
    if (filters.tmt_concept_id_max !== undefined) {
      query.where(
        'tmt_mappings.tmt_concept_id',
        '<=',
        filters.tmt_concept_id_max,
      );
    }
    if (filters.tmt_id !== undefined) {
      query.where('tmt_mappings.tmt_id', filters.tmt_id);
    }
    if (filters.tmt_id_min !== undefined) {
      query.where('tmt_mappings.tmt_id', '>=', filters.tmt_id_min);
    }
    if (filters.tmt_id_max !== undefined) {
      query.where('tmt_mappings.tmt_id', '<=', filters.tmt_id_max);
    }
    if (filters.is_verified !== undefined) {
      query.where('tmt_mappings.is_verified', filters.is_verified);
    }
    if (filters.verified_by !== undefined) {
      query.where('tmt_mappings.verified_by', filters.verified_by);
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
      id: 'tmt_mappings.id',
      workingCode: 'tmt_mappings.working_code',
      drugCode: 'tmt_mappings.drug_code',
      genericId: 'tmt_mappings.generic_id',
      drugId: 'tmt_mappings.drug_id',
      tmtLevel: 'tmt_mappings.tmt_level',
      tmtConceptId: 'tmt_mappings.tmt_concept_id',
      tmtId: 'tmt_mappings.tmt_id',
      isVerified: 'tmt_mappings.is_verified',
      verifiedBy: 'tmt_mappings.verified_by',
      verifiedAt: 'tmt_mappings.verified_at',
      createdAt: 'tmt_mappings.created_at',
      updatedAt: 'tmt_mappings.updated_at',
    };

    return sortFields[sortBy] || 'tmt_mappings.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetTmtMappingsQuery = {},
  ): Promise<TmtMappings | null> {
    let query = this.getJoinQuery();
    query = query.where('tmt_mappings.id', id);

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
    query: TmtMappingsListQuery = {},
  ): Promise<PaginatedListResult<TmtMappings>> {
    return super.list(query);
  }

  // Business-specific methods are merged with unique constraint detection below

  // ===== ERROR HANDLING: DUPLICATE DETECTION METHODS =====

  // ===== ERROR HANDLING: DELETE VALIDATION METHODS =====

  // Basic Statistics - count only
  async getStats(): Promise<{
    total: number;
  }> {
    const stats: any = await this.knex('tmt_mappings')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateTmtMappings[]): Promise<TmtMappings[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('tmt_mappings')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateTmtMappings): Promise<TmtMappings> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('tmt_mappings')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
