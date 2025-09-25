import { BaseRepository, BaseListQuery, PaginatedListResult } from '../repositories/base.repository';

export abstract class BaseService<T, CreateDto = any, UpdateDto = any> {
  constructor(protected repository: BaseRepository<T, CreateDto, UpdateDto>) {}

  /**
   * Get paginated list of entities with filtering, searching, and sorting
   */
  async getList(query: BaseListQuery = {}): Promise<PaginatedListResult<T>> {
    // Set safe defaults
    const sanitizedQuery = {
      page: Math.max(1, parseInt(String(query.page)) || 1),
      limit: Math.min(100, Math.max(1, parseInt(String(query.limit)) || 10)),
      ...query,
    };

    return this.repository.list(sanitizedQuery);
  }

  /**
   * Get entity by ID
   */
  async getById(id: string | number): Promise<T | null> {
    const entity = await this.repository.findById(id);
    
    if (!entity) {
      return null;
    }

    // Hook for post-retrieval processing
    await this.afterRetrieve(entity);
    
    return entity;
  }

  /**
   * Create new entity
   */
  async create(data: CreateDto): Promise<T> {
    // Pre-validation hook
    await this.validateCreate(data);
    
    // Business logic hook
    const processedData = await this.beforeCreate(data);
    
    const entity = await this.repository.create(processedData);
    
    // Post-creation hook
    await this.afterCreate(entity, data);
    
    return entity;
  }

  /**
   * Update existing entity
   */
  async update(id: string | number, data: UpdateDto): Promise<T | null> {
    // Check if entity exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }

    // Pre-validation hook
    await this.validateUpdate(id, data, existing);
    
    // Business logic hook
    const processedData = await this.beforeUpdate(id, data, existing);
    
    const updated = await this.repository.update(id, processedData);
    
    if (updated) {
      // Post-update hook
      await this.afterUpdate(updated, data, existing);
    }
    
    return updated;
  }

  /**
   * Delete entity
   */
  async delete(id: string | number): Promise<boolean> {
    // Check if entity exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }

    // Pre-deletion validation hook
    await this.validateDelete(id, existing);
    
    // Business logic hook
    await this.beforeDelete(id, existing);
    
    const deleted = await this.repository.delete(id);
    
    if (deleted) {
      // Post-deletion hook
      await this.afterDelete(id, existing);
    }
    
    return deleted;
  }

  /**
   * Check if entity exists
   */
  async exists(id: string | number): Promise<boolean> {
    return this.repository.exists(id);
  }

  /**
   * Get count of entities with optional filters
   */
  async count(filters: any = {}): Promise<number> {
    return this.repository.count(filters);
  }

  // ===== BULK OPERATIONS =====

  /**
   * Create multiple entities
   */
  async createMany(data: CreateDto[]): Promise<T[]> {
    // Validate all items
    for (const item of data) {
      await this.validateCreate(item);
    }
    
    // Process all items
    const processedData = await Promise.all(
      data.map(item => this.beforeCreate(item))
    );
    
    const entities = await this.repository.createMany(processedData);
    
    // Post-creation hooks
    for (let i = 0; i < entities.length; i++) {
      await this.afterCreate(entities[i], data[i]);
    }
    
    return entities;
  }

  /**
   * Update multiple entities
   */
  async updateMany(ids: (string | number)[], data: UpdateDto): Promise<number> {
    // Validate update for each entity
    for (const id of ids) {
      const existing = await this.repository.findById(id);
      if (existing) {
        await this.validateUpdate(id, data, existing);
      }
    }
    
    // Process data
    const processedData = await this.beforeBulkUpdate(ids, data);
    
    const updatedCount = await this.repository.updateMany(ids, processedData);
    
    // Post-update hook
    await this.afterBulkUpdate(ids, data, updatedCount);
    
    return updatedCount;
  }

  /**
   * Delete multiple entities
   */
  async deleteMany(ids: (string | number)[]): Promise<number> {
    // Validate deletion for each entity
    for (const id of ids) {
      const existing = await this.repository.findById(id);
      if (existing) {
        await this.validateDelete(id, existing);
      }
    }
    
    // Pre-deletion hook
    await this.beforeBulkDelete(ids);
    
    const deletedCount = await this.repository.deleteMany(ids);
    
    // Post-deletion hook
    await this.afterBulkDelete(ids, deletedCount);
    
    return deletedCount;
  }

  // ===== VALIDATION HOOKS =====
  // Override in child classes for custom validation

  /**
   * Validate data before creating entity
   */
  protected async validateCreate(data: CreateDto): Promise<void> {
    // Override in child classes
  }

  /**
   * Validate data before updating entity
   */
  protected async validateUpdate(
    id: string | number, 
    data: UpdateDto, 
    existing: T
  ): Promise<void> {
    // Override in child classes
  }

  /**
   * Validate before deleting entity
   */
  protected async validateDelete(id: string | number, existing: T): Promise<void> {
    // Override in child classes
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override in child classes for custom business logic

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateDto): Promise<CreateDto> {
    return data;
  }

  /**
   * Execute logic after entity creation
   */
  protected async afterCreate(entity: T, originalData: CreateDto): Promise<void> {
    // Override in child classes
  }

  /**
   * Process data before update
   */
  protected async beforeUpdate(
    id: string | number,
    data: UpdateDto,
    existing: T
  ): Promise<UpdateDto> {
    return data;
  }

  /**
   * Execute logic after entity update
   */
  protected async afterUpdate(
    updated: T,
    updateData: UpdateDto,
    original: T
  ): Promise<void> {
    // Override in child classes
  }

  /**
   * Execute logic before deletion
   */
  protected async beforeDelete(id: string | number, existing: T): Promise<void> {
    // Override in child classes
  }

  /**
   * Execute logic after deletion
   */
  protected async afterDelete(id: string | number, deleted: T): Promise<void> {
    // Override in child classes
  }

  /**
   * Execute logic after entity retrieval
   */
  protected async afterRetrieve(entity: T): Promise<void> {
    // Override in child classes
  }

  // ===== BULK OPERATION HOOKS =====

  /**
   * Process data before bulk update
   */
  protected async beforeBulkUpdate(
    ids: (string | number)[],
    data: UpdateDto
  ): Promise<UpdateDto> {
    return data;
  }

  /**
   * Execute logic after bulk update
   */
  protected async afterBulkUpdate(
    ids: (string | number)[],
    data: UpdateDto,
    updatedCount: number
  ): Promise<void> {
    // Override in child classes
  }

  /**
   * Execute logic before bulk delete
   */
  protected async beforeBulkDelete(ids: (string | number)[]): Promise<void> {
    // Override in child classes
  }

  /**
   * Execute logic after bulk delete
   */
  protected async afterBulkDelete(
    ids: (string | number)[],
    deletedCount: number
  ): Promise<void> {
    // Override in child classes
  }

  // ===== TRANSACTION SUPPORT =====

  /**
   * Execute operations within a transaction
   */
  async withTransaction<R>(
    callback: (service: this) => Promise<R>
  ): Promise<R> {
    return this.repository.withTransaction(async () => {
      return callback(this);
    });
  }
}