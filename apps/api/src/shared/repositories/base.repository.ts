import { Knex } from 'knex';

export interface BaseListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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

export abstract class BaseRepository<T, CreateDto = any, UpdateDto = any> {
  constructor(
    protected knex: Knex,
    protected tableName: string,
    protected searchFields: string[] = [],
  ) {}

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

  async create(data: CreateDto): Promise<T> {
    const dbData = this.transformToDb ? this.transformToDb(data) : data;
    const [row] = await this.query().insert(dbData).returning('*');
    
    return this.transformToEntity ? this.transformToEntity(row) : row;
  }

  async update(id: string | number, data: UpdateDto): Promise<T | null> {
    const dbData = this.transformToDb ? this.transformToDb(data) : data;
    const [row] = await this.query()
      .where({ id })
      .update({ 
        ...dbData, 
        updated_at: new Date() 
      })
      .returning('*');
    
    if (!row) return null;
    
    return this.transformToEntity ? this.transformToEntity(row) : row;
  }

  async delete(id: string | number): Promise<boolean> {
    const deletedRows = await this.query().where({ id }).del();
    return deletedRows > 0;
  }

  async list(query: BaseListQuery = {}): Promise<PaginatedListResult<T>> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      sortBy = 'created_at', 
      sortOrder = 'desc', 
      ...filters 
    } = query;

    // Base query
    const baseQuery = this.getJoinQuery?.() || this.query();

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

    // Apply sorting and pagination
    const data = await baseQuery
      .orderBy(this.getSortField(sortBy), sortOrder)
      .limit(limit)
      .offset((page - 1) * limit);

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
        hasPrev: page > 1
      }
    };
  }

  // Override in child classes for custom filtering
  protected applyCustomFilters(query: Knex.QueryBuilder, filters: any): void {
    // Default implementation - override in child classes
    // Apply common filters like status, active/inactive, etc.
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        // Simple equality filter by default
        query.where(`${this.tableName}.${key}`, filters[key]);
      }
    });
  }

  // Override in child classes for custom sorting
  protected getSortField(sortBy: string): string {
    return `${this.tableName}.${sortBy}`;
  }

  // Utility methods for common operations
  async exists(id: string | number): Promise<boolean> {
    const result = await this.query()
      .where({ id })
      .select('id')
      .first();
    return !!result;
  }

  async count(filters: any = {}): Promise<number> {
    const query = this.query();
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        query.where(`${this.tableName}.${key}`, filters[key]);
      }
    });
    
    const [{ count }] = await query.count('* as count');
    return parseInt(count as string);
  }

  // Bulk operations
  async createMany(data: CreateDto[]): Promise<T[]> {
    const dbData = this.transformToDb 
      ? data.map(item => this.transformToDb!(item))
      : data;
    
    const rows = await this.query().insert(dbData).returning('*');
    
    return this.transformToEntity 
      ? rows.map(row => this.transformToEntity!(row))
      : rows;
  }

  async updateMany(ids: (string | number)[], data: UpdateDto): Promise<number> {
    const dbData = this.transformToDb ? this.transformToDb(data) : data;
    
    const updatedCount = await this.query()
      .whereIn('id', ids)
      .update({ 
        ...dbData, 
        updated_at: new Date() 
      });
    
    return updatedCount;
  }

  async deleteMany(ids: (string | number)[]): Promise<number> {
    const deletedCount = await this.query().whereIn('id', ids).del();
    return deletedCount;
  }

  // Transaction support
  async withTransaction<R>(
    callback: (trx: Knex.Transaction) => Promise<R>
  ): Promise<R> {
    return await this.knex.transaction(callback);
  }
}