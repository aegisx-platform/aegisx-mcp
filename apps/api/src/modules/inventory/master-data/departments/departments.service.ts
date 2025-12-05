import { BaseService } from '../../../../shared/services/base.service';
import { DepartmentsRepository } from './departments.repository';
import {
  type Departments,
  type CreateDepartments,
  type UpdateDepartments,
  type GetDepartmentsQuery,
  type ListDepartmentsQuery,
  DepartmentsErrorCode,
  DepartmentsErrorMessages,
} from './departments.types';

/**
 * Departments Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class DepartmentsService extends BaseService<
  Departments,
  CreateDepartments,
  UpdateDepartments
> {
  constructor(private departmentsRepository: DepartmentsRepository) {
    super(departmentsRepository);
  }

  /**
   * Get departments by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetDepartmentsQuery = {},
  ): Promise<Departments | null> {
    const departments = await this.getById(id);

    if (departments) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return departments;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListDepartmentsQuery = {}): Promise<{
    data: Departments[];
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
   * Create new departments
   */
  async create(data: CreateDepartments): Promise<Departments> {
    const departments = await super.create(data);

    return departments;
  }

  /**
   * Update existing departments
   */
  async update(
    id: string | number,
    data: UpdateDepartments,
  ): Promise<Departments | null> {
    const departments = await super.update(id, data);

    return departments;
  }

  /**
   * Delete departments
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete departments with ID:', id);

      // Check if departments exists first
      const existing = await this.departmentsRepository.findById(id);
      if (!existing) {
        console.log('Departments not found for deletion:', id);
        return false;
      }

      console.log('Found departments to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.departmentsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Departments deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting departments:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating departments
   */
  protected async validateCreate(data: CreateDepartments): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateDepartments,
  ): Promise<CreateDepartments> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after departments creation
   */
  protected async afterCreate(
    departments: Departments,
    _originalData: CreateDepartments,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Departments created:',
      JSON.stringify(departments),
      '(ID: ' + departments.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: Departments,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.departmentsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          DepartmentsErrorMessages[
            DepartmentsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = DepartmentsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete departments - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
