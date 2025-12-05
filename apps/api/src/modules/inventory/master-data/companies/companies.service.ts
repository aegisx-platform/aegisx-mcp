import { BaseService } from '../../../../shared/services/base.service';
import { CompaniesRepository } from './companies.repository';
import {
  type Companies,
  type CreateCompanies,
  type UpdateCompanies,
  type GetCompaniesQuery,
  type ListCompaniesQuery,
  CompaniesErrorCode,
  CompaniesErrorMessages,
} from './companies.types';

/**
 * Companies Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class CompaniesService extends BaseService<
  Companies,
  CreateCompanies,
  UpdateCompanies
> {
  constructor(private companiesRepository: CompaniesRepository) {
    super(companiesRepository);
  }

  /**
   * Get companies by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetCompaniesQuery = {},
  ): Promise<Companies | null> {
    const companies = await this.getById(id);

    if (companies) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return companies;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListCompaniesQuery = {}): Promise<{
    data: Companies[];
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
   * Create new companies
   */
  async create(data: CreateCompanies): Promise<Companies> {
    const companies = await super.create(data);

    return companies;
  }

  /**
   * Update existing companies
   */
  async update(
    id: string | number,
    data: UpdateCompanies,
  ): Promise<Companies | null> {
    const companies = await super.update(id, data);

    return companies;
  }

  /**
   * Delete companies
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete companies with ID:', id);

      // Check if companies exists first
      const existing = await this.companiesRepository.findById(id);
      if (!existing) {
        console.log('Companies not found for deletion:', id);
        return false;
      }

      console.log('Found companies to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.companiesRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Companies deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting companies:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating companies
   */
  protected async validateCreate(data: CreateCompanies): Promise<void> {
    // Add custom validation logic here

    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====

    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====

    // Business rule: email must be valid email
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        const error = new Error(
          CompaniesErrorMessages[CompaniesErrorCode.INVALID_EMAIL_EMAIL],
        ) as any;
        error.statusCode = 422;
        error.code = CompaniesErrorCode.INVALID_EMAIL_EMAIL;
        throw error;
      }
    }
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateCompanies,
  ): Promise<CreateCompanies> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after companies creation
   */
  protected async afterCreate(
    companies: Companies,
    _originalData: CreateCompanies,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Companies created:',
      JSON.stringify(companies),
      '(ID: ' + companies.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: Companies,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.companiesRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          CompaniesErrorMessages[
            CompaniesErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = CompaniesErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete companies - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
