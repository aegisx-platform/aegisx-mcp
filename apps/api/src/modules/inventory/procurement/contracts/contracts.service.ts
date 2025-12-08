import { BaseService } from '../../../../shared/services/base.service';
import { ContractsRepository } from './contracts.repository';
import {
  type Contracts,
  type CreateContracts,
  type UpdateContracts,
  type GetContractsQuery,
  type ListContractsQuery,
  ContractsErrorCode,
  ContractsErrorMessages,
} from './contracts.types';

/**
 * Contracts Service
 *
 * Following Fastify + BaseService pattern:
 * - Extends BaseService for standard CRUD operations
 * - Proper dependency injection through constructor
 * - Optional EventService integration for real-time features
 * - Business logic hooks for validation and processing
 */
export class ContractsService extends BaseService<
  Contracts,
  CreateContracts,
  UpdateContracts
> {
  constructor(private contractsRepository: ContractsRepository) {
    super(contractsRepository);
  }

  /**
   * Get contracts by ID with optional query parameters
   */
  async findById(
    id: string | number,
    options: GetContractsQuery = {},
  ): Promise<Contracts | null> {
    const contracts = await this.getById(id);

    if (contracts) {
      // Handle query options (includes, etc.)
      if (options.include) {
        // Add relationship loading logic here
      }
    }

    return contracts;
  }

  /**
   * Get paginated list with filtering and sorting
   */
  async findMany(options: ListContractsQuery = {}): Promise<{
    data: Contracts[];
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
   * Create new contracts
   */
  async create(data: CreateContracts): Promise<Contracts> {
    const contracts = await super.create(data);

    return contracts;
  }

  /**
   * Update existing contracts
   */
  async update(
    id: string | number,
    data: UpdateContracts,
  ): Promise<Contracts | null> {
    const contracts = await super.update(id, data);

    return contracts;
  }

  /**
   * Delete contracts
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      console.log('Attempting to delete contracts with ID:', id);

      // Check if contracts exists first
      const existing = await this.contractsRepository.findById(id);
      if (!existing) {
        console.log('Contracts not found for deletion:', id);
        return false;
      }

      console.log('Found contracts to delete:', existing.id);

      // Direct repository call to avoid base service complexity
      const deleted = await this.contractsRepository.delete(id);

      console.log('Delete result:', deleted);

      if (deleted) {
        console.log('Contracts deleted successfully:', { id });
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting contracts:', error);
      return false;
    }
  }

  // ===== BUSINESS LOGIC HOOKS =====
  // Override these methods in child classes for custom validation/processing

  /**
   * Validate data before creating contracts
   */
  protected async validateCreate(data: CreateContracts): Promise<void> {
    // Add custom validation logic here
    // ===== ERROR HANDLING: DUPLICATE VALIDATION =====
    // ===== ERROR HANDLING: BUSINESS RULES VALIDATION =====
  }

  /**
   * Process data before creation
   */
  protected async beforeCreate(
    data: CreateContracts,
  ): Promise<CreateContracts> {
    // Add custom business logic here
    return {
      ...data,
      // Add default values or processing
    };
  }

  /**
   * Execute logic after contracts creation
   */
  protected async afterCreate(
    contracts: Contracts,
    _originalData: CreateContracts,
  ): Promise<void> {
    // Add post-creation logic (notifications, logging, etc.)
    console.log(
      'Contracts created:',
      JSON.stringify(contracts),
      '(ID: ' + contracts.id + ')',
    );
  }

  /**
   * Validate before deletion
   */
  protected async validateDelete(
    id: string | number,
    existing: Contracts,
  ): Promise<void> {
    // Add deletion validation logic here
    // Example: Prevent deletion if entity has dependent records
    if (existing.status === 'D') {
      throw new Error('Cannot delete D ');
    }

    // ===== ERROR HANDLING: FOREIGN KEY REFERENCE VALIDATION =====

    // Check if record can be deleted (has foreign key references)
    const deleteCheck = await this.contractsRepository.canBeDeleted(id);

    if (!deleteCheck.canDelete) {
      const nonCascadeRefs = deleteCheck.blockedBy.filter(
        (ref) => !ref.cascade,
      );

      if (nonCascadeRefs.length > 0) {
        const refDetails = nonCascadeRefs
          .map((ref) => `${ref.count} ${ref.table}`)
          .join(', ');
        const error = new Error(
          ContractsErrorMessages[
            ContractsErrorCode.CANNOT_DELETE_HAS_REFERENCES
          ],
        ) as any;
        error.statusCode = 422;
        error.code = ContractsErrorCode.CANNOT_DELETE_HAS_REFERENCES;
        error.details = {
          references: deleteCheck.blockedBy,
          message: `Cannot delete contracts - has ${refDetails} references`,
        };
        throw error;
      }
    }
  }
}
