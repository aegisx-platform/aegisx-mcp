import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateBank,
  type UpdateBank,
  type Bank,
  type GetBankQuery,
  type ListBankQuery,
  type BankEntity,
} from './bank.types';

export interface BankListQuery extends BaseListQuery {
  // Smart field-based filters for Bank
  bank_code?: string;
  bank_name?: string;
  swift_code?: string;
  is_active?: boolean;
}

export class BankRepository extends BaseRepository<
  Bank,
  CreateBank,
  UpdateBank
> {
  constructor(knex: Knex) {
    super(
      knex,
      'inventory.bank',
      [
        // Define searchable fields based on intelligent detection
        'inventory.bank.bank_name',
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
  transformToEntity(dbRow: any): Bank {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      bank_code: dbRow.bank_code,
      bank_name: dbRow.bank_name,
      swift_code: dbRow.swift_code,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(dto: CreateBank | UpdateBank): Partial<BankEntity> {
    const transformed: Partial<BankEntity> = {};

    if ('bank_code' in dto && dto.bank_code !== undefined) {
      transformed.bank_code = dto.bank_code;
    }
    if ('bank_name' in dto && dto.bank_name !== undefined) {
      transformed.bank_name = dto.bank_name;
    }
    if ('swift_code' in dto && dto.swift_code !== undefined) {
      transformed.swift_code = dto.swift_code;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('inventory.bank').select('inventory.bank.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'inventory.bank.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: BankListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Bank filters based on intelligent field categorization
    if (filters.bank_code !== undefined) {
      query.where('inventory.bank.bank_code', filters.bank_code);
    }
    if (filters.bank_name !== undefined) {
      query.where('inventory.bank.bank_name', filters.bank_name);
    }
    if (filters.swift_code !== undefined) {
      query.where('inventory.bank.swift_code', filters.swift_code);
    }
    if (filters.is_active !== undefined) {
      query.where('inventory.bank.is_active', filters.is_active);
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
      id: 'inventory.bank.id',
      bankCode: 'inventory.bank.bank_code',
      bankName: 'inventory.bank.bank_name',
      swiftCode: 'inventory.bank.swift_code',
      isActive: 'inventory.bank.is_active',
      createdAt: 'inventory.bank.created_at',
      updatedAt: 'inventory.bank.updated_at',
    };

    return sortFields[sortBy] || 'inventory.bank.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetBankQuery = {},
  ): Promise<Bank | null> {
    let query = this.getJoinQuery();
    query = query.where('bank.id', id);

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
  async list(query: BankListQuery = {}): Promise<PaginatedListResult<Bank>> {
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

    // Check companies references
    const companiesCount = await this.knex('companies')
      .where('bank_id', id)
      .count('* as count')
      .first();

    if (parseInt((companiesCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'companies',
        field: 'bank_id',
        count: parseInt((companiesCount?.count as string) || '0'),
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
    const stats: any = await this.knex('inventory.bank')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateBank[]): Promise<Bank[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('inventory.bank')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateBank): Promise<Bank> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('inventory.bank')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
