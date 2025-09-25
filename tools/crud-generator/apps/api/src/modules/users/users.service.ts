import { BaseService } from '../../shared/services/base.service';
import { UsersRepository } from './users.repository';
import {
  type Users,
  type CreateUsers,
  type UpdateUsers,
  type GetUsersQuery,
  type ListUsersQuery
} from './users.types';

/**
 * Users Service
 * 
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class UsersService extends BaseService<Users, CreateUsers, UpdateUsers> {

  constructor(
    private usersRepository: UsersRepository,
    
  ) {
    super(usersRepository);
    
  }

  /**
   * Get users by ID with optional query parameters
   */
  async findById(id: string | number, options: GetUsersQuery = {}): Promise<Users | null> {
    const users = await this.getById(id);
    
    if (users) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
      
    }

    return users;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListUsersQuery = {}): Promise<{
    data: Users[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const result = await this.getList(options);
    
    
    return result;
  }

  /**
   * Create new users
   */
  async create(data: CreateUsers): Promise<Users> {
    const users = await super.create(data);
    
    
    return users;
  }

  /**
   * Update existing users
   */
  async update(id: string | number, data: UpdateUsers): Promise<Users | null> {
    const users = await super.update(id, data);
    
    
    return users;
  }

  /**
   * Delete users
   */
  async delete(id: string | number): Promise<boolean> {
    // Get entity before deletion for event emission
    const users = await this.getById(id);
    
    const deleted = await super.delete(id);
    
    
    return deleted;
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating users
   */
  protected async validateCreate(data: CreateUsers): Promise<void> {
    // Add custom validation logic here
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(data: CreateUsers): Promise<CreateUsers> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after users creation
   */
  protected async afterCreate(users: Users, _originalData: CreateUsers): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log('Users created:', JSON.stringify(users), '(ID: ' + users.id + ')');
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(_id: string | number, existing: Users): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    if (existing.status === 'active') {
      throw new Error('Cannot delete active ');
    }
  }
}