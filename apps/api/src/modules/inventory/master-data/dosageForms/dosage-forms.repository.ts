import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateDosageForms,
  type UpdateDosageForms,
  type DosageForms,
  type GetDosageFormsQuery,
  type ListDosageFormsQuery,
  type DosageFormsEntity,
} from './dosage-forms.types';

export interface DosageFormsListQuery extends BaseListQuery {
  // Smart field-based filters for DosageForms
  form_code?: string;
  form_name?: string;
  form_name_en?: string;
  description?: string;
  is_active?: boolean;
}

export class DosageFormsRepository extends BaseRepository<
  DosageForms,
  CreateDosageForms,
  UpdateDosageForms
> {
  constructor(knex: Knex) {
    super(
      knex,
      'dosage_forms',
      [
        // Define searchable fields based on intelligent detection
        'dosage_forms.form_name',
        'dosage_forms.form_name_en',
        'dosage_forms.description',
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
  transformToEntity(dbRow: any): DosageForms {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      form_code: dbRow.form_code,
      form_name: dbRow.form_name,
      form_name_en: dbRow.form_name_en,
      description: dbRow.description,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateDosageForms | UpdateDosageForms,
  ): Partial<DosageFormsEntity> {
    const transformed: Partial<DosageFormsEntity> = {};

    if ('form_code' in dto && dto.form_code !== undefined) {
      transformed.form_code = dto.form_code;
    }
    if ('form_name' in dto && dto.form_name !== undefined) {
      transformed.form_name = dto.form_name;
    }
    if ('form_name_en' in dto && dto.form_name_en !== undefined) {
      transformed.form_name_en = dto.form_name_en;
    }
    if ('description' in dto && dto.description !== undefined) {
      transformed.description = dto.description;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('dosage_forms').select('dosage_forms.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'dosage_forms.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(
    query: any,
    filters: DosageFormsListQuery,
  ): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific DosageForms filters based on intelligent field categorization
    if (filters.form_code !== undefined) {
      query.where('dosage_forms.form_code', filters.form_code);
    }
    if (filters.form_name !== undefined) {
      query.where('dosage_forms.form_name', filters.form_name);
    }
    if (filters.form_name_en !== undefined) {
      query.where('dosage_forms.form_name_en', filters.form_name_en);
    }
    if (filters.description !== undefined) {
      query.where('dosage_forms.description', filters.description);
    }
    if (filters.is_active !== undefined) {
      query.where('dosage_forms.is_active', filters.is_active);
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
      id: 'dosage_forms.id',
      formCode: 'dosage_forms.form_code',
      formName: 'dosage_forms.form_name',
      formNameEn: 'dosage_forms.form_name_en',
      description: 'dosage_forms.description',
      isActive: 'dosage_forms.is_active',
      createdAt: 'dosage_forms.created_at',
      updatedAt: 'dosage_forms.updated_at',
    };

    return sortFields[sortBy] || 'dosage_forms.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetDosageFormsQuery = {},
  ): Promise<DosageForms | null> {
    let query = this.getJoinQuery();
    query = query.where('dosage_forms.id', id);

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
    query: DosageFormsListQuery = {},
  ): Promise<PaginatedListResult<DosageForms>> {
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

    // Check drug_generics references
    const drugGenericsCount = await this.knex('drug_generics')
      .where('dosage_form_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugGenericsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_generics',
        field: 'dosage_form_id',
        count: parseInt((drugGenericsCount?.count as string) || '0'),
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
    const stats: any = await this.knex('dosage_forms')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateDosageForms[]): Promise<DosageForms[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('dosage_forms')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateDosageForms): Promise<DosageForms> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('dosage_forms')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
