import {
  BaseRepository,
  BaseListQuery,
  PaginatedListResult,
} from '../../../../shared/repositories/base.repository';
import type { Knex } from 'knex';
import {
  type CreateCompanies,
  type UpdateCompanies,
  type Companies,
  type GetCompaniesQuery,
  type ListCompaniesQuery,
  type CompaniesEntity,
} from './companies.types';

export interface CompaniesListQuery extends BaseListQuery {
  // Smart field-based filters for Companies
  company_code?: string;
  company_name?: string;
  tax_id?: string;
  bank_id?: number;
  bank_id_min?: number;
  bank_id_max?: number;
  bank_account_number?: string;
  bank_account_name?: string;
  is_vendor?: boolean;
  is_manufacturer?: boolean;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
}

export class CompaniesRepository extends BaseRepository<
  Companies,
  CreateCompanies,
  UpdateCompanies
> {
  constructor(knex: Knex) {
    super(
      knex,
      'companies',
      [
        // Define searchable fields based on intelligent detection
        'companies.company_name',
        'companies.bank_account_name',
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
  transformToEntity(dbRow: any): Companies {
    if (!dbRow) throw new Error('Cannot transform null database row');

    return {
      id: dbRow.id,
      company_code: dbRow.company_code,
      company_name: dbRow.company_name,
      tax_id: dbRow.tax_id,
      bank_id: dbRow.bank_id,
      bank_account_number: dbRow.bank_account_number,
      bank_account_name: dbRow.bank_account_name,
      is_vendor: dbRow.is_vendor,
      is_manufacturer: dbRow.is_manufacturer,
      contact_person: dbRow.contact_person,
      phone: dbRow.phone,
      email: dbRow.email,
      address: dbRow.address,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }

  // Transform DTO to database format
  transformToDb(
    dto: CreateCompanies | UpdateCompanies,
  ): Partial<CompaniesEntity> {
    const transformed: Partial<CompaniesEntity> = {};

    if ('company_code' in dto && dto.company_code !== undefined) {
      transformed.company_code = dto.company_code;
    }
    if ('company_name' in dto && dto.company_name !== undefined) {
      transformed.company_name = dto.company_name;
    }
    if ('tax_id' in dto && dto.tax_id !== undefined) {
      transformed.tax_id = dto.tax_id;
    }
    if ('bank_id' in dto && dto.bank_id !== undefined) {
      transformed.bank_id = dto.bank_id;
    }
    if ('bank_account_number' in dto && dto.bank_account_number !== undefined) {
      transformed.bank_account_number = dto.bank_account_number;
    }
    if ('bank_account_name' in dto && dto.bank_account_name !== undefined) {
      transformed.bank_account_name = dto.bank_account_name;
    }
    if ('is_vendor' in dto && dto.is_vendor !== undefined) {
      transformed.is_vendor = dto.is_vendor;
    }
    if ('is_manufacturer' in dto && dto.is_manufacturer !== undefined) {
      transformed.is_manufacturer = dto.is_manufacturer;
    }
    if ('contact_person' in dto && dto.contact_person !== undefined) {
      transformed.contact_person = dto.contact_person;
    }
    if ('phone' in dto && dto.phone !== undefined) {
      transformed.phone = dto.phone;
    }
    if ('email' in dto && dto.email !== undefined) {
      transformed.email = dto.email;
    }
    if ('address' in dto && dto.address !== undefined) {
      transformed.address = dto.address;
    }
    if ('is_active' in dto && dto.is_active !== undefined) {
      transformed.is_active = dto.is_active;
    }
    // updated_at is handled automatically by database

    return transformed;
  }

  // Custom query with joins if needed
  getJoinQuery() {
    return this.knex('companies').select('companies.*');
    // Add joins here if needed
    // .leftJoin('other_table', 'companies.foreign_key', 'other_table.id')
  }

  // Apply custom filters
  protected applyCustomFilters(query: any, filters: CompaniesListQuery): void {
    // Apply base filters first
    super.applyCustomFilters(query, filters);

    // Apply specific Companies filters based on intelligent field categorization
    if (filters.company_code !== undefined) {
      query.where('companies.company_code', filters.company_code);
    }
    if (filters.company_name !== undefined) {
      query.where('companies.company_name', filters.company_name);
    }
    if (filters.tax_id !== undefined) {
      query.where('companies.tax_id', filters.tax_id);
    }
    if (filters.bank_id !== undefined) {
      query.where('companies.bank_id', filters.bank_id);
    }
    if (filters.bank_id_min !== undefined) {
      query.where('companies.bank_id', '>=', filters.bank_id_min);
    }
    if (filters.bank_id_max !== undefined) {
      query.where('companies.bank_id', '<=', filters.bank_id_max);
    }
    if (filters.bank_account_number !== undefined) {
      query.where('companies.bank_account_number', filters.bank_account_number);
    }
    if (filters.bank_account_name !== undefined) {
      query.where('companies.bank_account_name', filters.bank_account_name);
    }
    if (filters.is_vendor !== undefined) {
      query.where('companies.is_vendor', filters.is_vendor);
    }
    if (filters.is_manufacturer !== undefined) {
      query.where('companies.is_manufacturer', filters.is_manufacturer);
    }
    if (filters.contact_person !== undefined) {
      query.where('companies.contact_person', filters.contact_person);
    }
    if (filters.phone !== undefined) {
      query.where('companies.phone', filters.phone);
    }
    if (filters.email !== undefined) {
      query.where('companies.email', filters.email);
    }
    if (filters.address !== undefined) {
      query.where('companies.address', filters.address);
    }
    if (filters.is_active !== undefined) {
      query.where('companies.is_active', filters.is_active);
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
      id: 'companies.id',
      companyCode: 'companies.company_code',
      companyName: 'companies.company_name',
      taxId: 'companies.tax_id',
      bankId: 'companies.bank_id',
      bankAccountNumber: 'companies.bank_account_number',
      bankAccountName: 'companies.bank_account_name',
      isVendor: 'companies.is_vendor',
      isManufacturer: 'companies.is_manufacturer',
      contactPerson: 'companies.contact_person',
      phone: 'companies.phone',
      email: 'companies.email',
      address: 'companies.address',
      isActive: 'companies.is_active',
      createdAt: 'companies.created_at',
      updatedAt: 'companies.updated_at',
    };

    return sortFields[sortBy] || 'companies.id';
  }

  // Extended find method with options
  async findById(
    id: number | string,
    options: GetCompaniesQuery = {},
  ): Promise<Companies | null> {
    let query = this.getJoinQuery();
    query = query.where('companies.id', id);

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
    query: CompaniesListQuery = {},
  ): Promise<PaginatedListResult<Companies>> {
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

    // Check contracts references
    const contractsCount = await this.knex('contracts')
      .where('vendor_id', id)
      .count('* as count')
      .first();

    if (parseInt((contractsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'contracts',
        field: 'vendor_id',
        count: parseInt((contractsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check drug_pack_ratios references
    const drugPackRatiosCount = await this.knex('drug_pack_ratios')
      .where('company_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugPackRatiosCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drug_pack_ratios',
        field: 'company_id',
        count: parseInt((drugPackRatiosCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check drugs references
    const drugsCount = await this.knex('drugs')
      .where('manufacturer_id', id)
      .count('* as count')
      .first();

    if (parseInt((drugsCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'drugs',
        field: 'manufacturer_id',
        count: parseInt((drugsCount?.count as string) || '0'),
        cascade: false,
      });
    }

    // Check purchase_orders references
    const purchaseOrdersCount = await this.knex('purchase_orders')
      .where('vendor_id', id)
      .count('* as count')
      .first();

    if (parseInt((purchaseOrdersCount?.count as string) || '0') > 0) {
      blockedBy.push({
        table: 'purchase_orders',
        field: 'vendor_id',
        count: parseInt((purchaseOrdersCount?.count as string) || '0'),
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
    const stats: any = await this.knex('companies')
      .select([this.knex.raw('COUNT(*) as total')])
      .first();

    return {
      total: parseInt(stats?.total || '0'),
    };
  }

  // Bulk operations with better type safety
  async createMany(data: CreateCompanies[]): Promise<Companies[]> {
    const transformedData = data.map((item) => this.transformToDb(item));
    const rows = await this.knex('companies')
      .insert(transformedData)
      .returning('*');
    return rows.map((row) => this.transformToEntity(row));
  }

  // Transaction support for complex operations
  async createWithTransaction(data: CreateCompanies): Promise<Companies> {
    return this.withTransaction(async (trx) => {
      const transformedData = this.transformToDb(data);
      const [row] = await trx('companies')
        .insert(transformedData)
        .returning('*');
      return this.transformToEntity(row);
    });
  }
}
