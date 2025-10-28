import type { Knex } from 'knex';
import {
  smartValidateUUIDs,
  UUIDValidationStrategy,
  DEFAULT_UUID_CONFIG,
  UUIDValidationConfig,
} from '../utils/uuid.utils';

export interface BaseListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string; // Multiple sort support: field1:desc,field2:asc
  fields?: string[]; // Field selection support
  [key: string]: any;
}

export interface ListResult<T> {
  data: T[];
  total: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedListResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Configuration for automatic field management in repositories
 * Allows flexible handling of timestamp and audit fields across different table structures
 */
export interface RepositoryFieldConfig {
  /** Table has created_at column (auto-managed by DB) */
  hasCreatedAt?: boolean;
  /** Table has updated_at column (auto-set on UPDATE) */
  hasUpdatedAt?: boolean;
  /** Table has created_by column (set from request context) */
  hasCreatedBy?: boolean;
  /** Table has updated_by column (set from request context) */
  hasUpdatedBy?: boolean;
  /** Custom name for created_at field (default: 'created_at') */
  createdAtField?: string;
  /** Custom name for updated_at field (default: 'updated_at') */
  updatedAtField?: string;
  /** Custom name for created_by field (default: 'created_by') */
  createdByField?: string;
  /** Custom name for updated_by field (default: 'updated_by') */
  updatedByField?: string;
}

export abstract class BaseRepository<T, CreateDto = any, UpdateDto = any> {
  protected uuidValidationConfig: UUIDValidationConfig = DEFAULT_UUID_CONFIG;
  protected fieldConfig: RepositoryFieldConfig;

  constructor(
    protected knex: Knex,
    protected tableName: string,
    protected searchFields: string[] = [],
    protected explicitUUIDFields: string[] = [],
    fieldConfig: RepositoryFieldConfig = {},
  ) {
    // Default configuration - assume modern tables have all fields
    this.fieldConfig = {
      hasCreatedAt: true,
      hasUpdatedAt: true,
      hasCreatedBy: false, // Most tables don't have this yet
      hasUpdatedBy: false, // Most tables don't have this yet
      createdAtField: 'created_at',
      updatedAtField: 'updated_at',
      createdByField: 'created_by',
      updatedByField: 'updated_by',
      ...fieldConfig,
    };
  }

  // Abstract methods to implement in child classes
  abstract transformToEntity?(dbRow: any): T;
  abstract transformToDb?(dto: CreateDto | UpdateDto): any;
  abstract getJoinQuery?(): Knex.QueryBuilder;

  // Protected method to get the base query builder
  protected query(): Knex.QueryBuilder {
    return this.knex(this.tableName);
  }

  // Common CRUD operations
  async findById(id: string | number): Promise<T | null> {
    const query = this.getJoinQuery?.() || this.query();
    const row = await query.where(`${this.tableName}.id`, id).first();

    if (!row) return null;

    return this.transformToEntity ? this.transformToEntity(row) : row;
  }

  async create(data: CreateDto, userId?: string | number): Promise<T> {
    const dbData = this.transformToDb ? this.transformToDb(data) : data;

    // Build create data with automatic fields based on configuration
    const createData: any = { ...dbData };

    // Add created_by if table has this column and userId is provided
    if (this.fieldConfig.hasCreatedBy && userId !== undefined) {
      createData[this.fieldConfig.createdByField!] = userId;
    }

    // Note: created_at is typically auto-managed by database DEFAULT CURRENT_TIMESTAMP
    // So we don't need to set it here

    const [row] = await this.query().insert(createData).returning('*');

    return this.transformToEntity ? this.transformToEntity(row) : row;
  }

  async update(
    id: string | number,
    data: UpdateDto,
    userId?: string | number,
  ): Promise<T | null> {
    const dbData = this.transformToDb ? this.transformToDb(data) : data;

    // Build update data with automatic fields based on configuration
    const updateData: any = { ...dbData };

    // Add updated_at if table has this column
    if (this.fieldConfig.hasUpdatedAt) {
      updateData[this.fieldConfig.updatedAtField!] = new Date();
    }

    // Add updated_by if table has this column and userId is provided
    if (this.fieldConfig.hasUpdatedBy && userId !== undefined) {
      updateData[this.fieldConfig.updatedByField!] = userId;
    }

    const [row] = await this.query()
      .where({ id })
      .update(updateData)
      .returning('*');

    if (!row) return null;

    return this.transformToEntity ? this.transformToEntity(row) : row;
  }

  async delete(id: string | number): Promise<boolean> {
    const deletedRows = await this.query().where({ id }).del();
    return deletedRows > 0;
  }

  async list(query: BaseListQuery = {}): Promise<PaginatedListResult<T>> {
    const { page = 1, limit = 10, search, sort, fields, ...filters } = query;

    // Base query
    const baseQuery = this.getJoinQuery?.() || this.query();

    // Handle field selection if specified
    if (fields && Array.isArray(fields) && fields.length > 0) {
      // Map field names to table columns with proper prefixing
      const validFields = fields
        .filter(
          (field) =>
            typeof field === 'string' && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field),
        )
        .map((field) => `${this.tableName}.${field}`);

      if (validFields.length > 0) {
        baseQuery.clearSelect().select(validFields);
      }
    }

    // Apply search functionality
    if (search && this.searchFields.length > 0) {
      baseQuery.where((builder) => {
        this.searchFields.forEach((field, index) => {
          if (index === 0) {
            builder.whereILike(field, `%${search}%`);
          } else {
            builder.orWhereILike(field, `%${search}%`);
          }
        });
      });
    }

    // Apply custom filters
    this.applyCustomFilters(baseQuery, filters);

    // Get total count
    const countQuery = baseQuery.clone();
    countQuery.clearSelect().count('* as total');
    const [{ total }] = await countQuery;

    // Apply sorting (check for multiple sort first)
    if (sort) {
      this.applyMultipleSort(baseQuery, sort);
    } else {
      baseQuery.orderBy(this.getSortField('created_at'), 'desc');
    }

    // Apply pagination
    const data = await baseQuery.limit(limit).offset((page - 1) * limit);

    // Transform data if transformer is available
    const transformedData = this.transformToEntity
      ? data.map((row) => this.transformToEntity!(row))
      : data;

    const totalCount = parseInt(total as string);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: transformedData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Override in child classes for custom filtering
  protected applyCustomFilters(query: Knex.QueryBuilder, filters: any): void {
    // Default implementation - override in child classes
    // Apply common filters like status, active/inactive, etc.

    // 🛡️ UUID Validation: Clean filters to prevent PostgreSQL UUID casting errors
    let validatedFilters = filters;
    try {
      validatedFilters = smartValidateUUIDs(
        filters,
        this.explicitUUIDFields,
        this.uuidValidationConfig,
      );
    } catch (error) {
      // If strict validation is enabled and UUID is invalid, re-throw the error
      if (
        this.uuidValidationConfig.strategy === UUIDValidationStrategy.STRICT
      ) {
        throw new Error(`Invalid UUID in query filters: ${error.message}`);
      }
      // Otherwise continue with original filters (graceful/warn modes)
      validatedFilters = filters;
    }

    // Function to check if parameter should be reserved (not treated as simple equality filter)
    const isReservedParam = (key: string): boolean => {
      // Core system parameters
      const coreParams = [
        'fields',
        'format',
        'include',
        'page',
        'limit',
        'sort',
        'sortBy',
        'sortOrder',
        'sort_by',
        'sort_order',
      ];
      if (coreParams.includes(key)) return true;

      // Range filtering patterns (handled by custom logic in child classes)
      if (key.endsWith('_min') || key.endsWith('_max')) return true;

      // Array filtering patterns (handled by custom logic in child classes)
      if (key.endsWith('_in') || key.endsWith('_not_in')) return true;

      // Date/DateTime exact filtering patterns (handled by custom logic in child classes)
      if (
        key.endsWith('_at') &&
        !key.includes('_min') &&
        !key.includes('_max')
      ) {
        // Check if it's a date field - let child classes handle it
        return true;
      }

      return false;
    };

    Object.keys(validatedFilters).forEach((key) => {
      if (
        validatedFilters[key] !== undefined &&
        validatedFilters[key] !== null &&
        !isReservedParam(key)
      ) {
        // Simple equality filter by default for non-reserved parameters
        query.where(`${this.tableName}.${key}`, validatedFilters[key]);
      }
    });
  }

  // Apply multiple sort parsing
  protected applyMultipleSort(query: any, sort: string): void {
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
      // Single sort field (fallback for legacy format)
      const mappedField = this.getSortField(sort);
      query.orderBy(mappedField, 'desc');
    }
  }

  // Override in child classes for custom sorting
  protected getSortField(sortBy: string): string {
    return `${this.tableName}.${sortBy}`;
  }

  // Utility methods for common operations
  async exists(id: string | number): Promise<boolean> {
    const result = await this.query().where({ id }).select('id').first();
    return !!result;
  }

  async count(filters: any = {}): Promise<number> {
    const query = this.query();

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null) {
        query.where(`${this.tableName}.${key}`, filters[key]);
      }
    });

    const [{ count }] = await query.count('* as count');
    return parseInt(count as string);
  }

  // Bulk operations
  async createMany(data: CreateDto[], userId?: string | number): Promise<T[]> {
    let dbData = this.transformToDb
      ? data.map((item) => this.transformToDb!(item))
      : data;

    // Add created_by to all records if table has this column and userId is provided
    if (this.fieldConfig.hasCreatedBy && userId !== undefined) {
      dbData = dbData.map((item: any) => ({
        ...item,
        [this.fieldConfig.createdByField!]: userId,
      }));
    }

    const rows = await this.query().insert(dbData).returning('*');

    return this.transformToEntity
      ? rows.map((row) => this.transformToEntity!(row))
      : rows;
  }

  async updateMany(
    ids: (string | number)[],
    data: UpdateDto,
    userId?: string | number,
  ): Promise<number> {
    const dbData = this.transformToDb ? this.transformToDb(data) : data;

    // Build update data with automatic fields based on configuration
    const updateData: any = { ...dbData };

    // Add updated_at if table has this column
    if (this.fieldConfig.hasUpdatedAt) {
      updateData[this.fieldConfig.updatedAtField!] = new Date();
    }

    // Add updated_by if table has this column and userId is provided
    if (this.fieldConfig.hasUpdatedBy && userId !== undefined) {
      updateData[this.fieldConfig.updatedByField!] = userId;
    }

    const updatedCount = await this.query().whereIn('id', ids).update(updateData);

    return updatedCount;
  }

  async deleteMany(ids: (string | number)[]): Promise<number> {
    const deletedCount = await this.query().whereIn('id', ids).del();
    return deletedCount;
  }

  // Transaction support
  async withTransaction<R>(
    callback: (trx: Knex.Transaction) => Promise<R>,
  ): Promise<R> {
    return await this.knex.transaction(callback);
  }

  // 🛡️ UUID Configuration Methods

  /**
   * Set UUID validation configuration for this repository
   */
  setUUIDValidationConfig(config: Partial<UUIDValidationConfig>): void {
    this.uuidValidationConfig = { ...this.uuidValidationConfig, ...config };
  }

  /**
   * Add explicit UUID fields that should be validated
   */
  addUUIDFields(fields: string[]): void {
    const combinedFields = this.explicitUUIDFields.concat(fields);
    this.explicitUUIDFields = Array.from(new Set(combinedFields));
  }

  /**
   * Set explicit UUID fields (replaces existing)
   */
  setUUIDFields(fields: string[]): void {
    this.explicitUUIDFields = fields;
  }
}
