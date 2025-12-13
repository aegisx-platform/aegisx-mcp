/**
 * Departments Import Service
 * Auto-Discovery Import System implementation for hospital departments
 *
 * Features:
 * - Auto-discovery via @ImportService decorator
 * - Template generation (CSV/Excel)
 * - Session-based validation
 * - Batch import with transaction support
 * - Duplicate code detection
 * - Hospital validation
 * - Rollback support
 *
 * Dependencies: None (base master-data)
 * Priority: 1 (can import first)
 */

import { Knex } from 'knex';
import {
  ImportService,
  BaseImportService,
  TemplateColumn,
  ValidationError,
} from '../../../../core/import';
import type { Departments, CreateDepartments } from './departments.types';
import { DepartmentsRepository } from './departments.repository';

/**
 * Departments Import Service
 * Handles bulk import of department master data
 *
 * Template columns:
 * - code (required, unique): Department code
 * - name (required): Department name
 * - hospital_id (optional): Hospital assignment
 * - description (optional): Department description
 * - is_active (optional, default: true): Active status
 */
@ImportService({
  module: 'departments',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Departments (แผนก)',
  description: 'Master list of hospital departments',
  dependencies: [], // No dependencies - base master data
  priority: 1, // Highest priority (import first)
  tags: ['master-data', 'required', 'inventory'],
  supportsRollback: true,
  version: '1.0.0',
})
export class DepartmentsImportService extends BaseImportService<Departments> {
  private repository: DepartmentsRepository;

  /**
   * Constructor
   * @param knex - Knex database instance
   */
  constructor(protected knex: Knex) {
    super(knex);
    this.repository = new DepartmentsRepository(knex);
    this.moduleName = 'departments';
  }

  /**
   * Get service metadata
   * Called during discovery phase
   */
  getMetadata() {
    return {
      module: 'departments',
      domain: 'inventory',
      subdomain: 'master-data',
      displayName: 'Departments (แผนก)',
      description: 'Master list of hospital departments',
      dependencies: [],
      priority: 1,
      tags: ['master-data', 'required', 'inventory'],
      supportsRollback: true,
      version: '1.0.0',
    };
  }

  /**
   * Get template columns for import file
   * Defines structure and validation rules for CSV/Excel upload
   *
   * @returns Array of template column definitions
   */
  getTemplateColumns(): TemplateColumn[] {
    return [
      {
        name: 'code',
        displayName: 'Department Code',
        required: true,
        type: 'string',
        maxLength: 50,
        pattern: '^[A-Z0-9_-]+$',
        description: 'Unique code for the department (e.g., ICU, ED, OPD)',
        example: 'ICU-01',
      },
      {
        name: 'name',
        displayName: 'Department Name',
        required: true,
        type: 'string',
        maxLength: 255,
        description: 'Full name of the department in Thai or English',
        example: 'Intensive Care Unit',
      },
      {
        name: 'hospital_id',
        displayName: 'Hospital ID',
        required: false,
        type: 'number',
        description:
          'Hospital ID assignment (if provided, must exist in database)',
        example: '1',
      },
      {
        name: 'description',
        displayName: 'Description',
        required: false,
        type: 'string',
        maxLength: 500,
        description: 'Additional description or notes about the department',
        example: 'High-dependency unit for critical patients',
      },
      {
        name: 'is_active',
        displayName: 'Is Active',
        required: false,
        type: 'boolean',
        description: 'Whether this department is currently active',
        example: 'true',
      },
    ];
  }

  /**
   * Validate a single row during batch validation
   * Performs business logic validation including:
   * - Duplicate code detection
   * - Hospital existence validation
   * - Required field checks
   *
   * @param row - Row data from uploaded file
   * @param rowNumber - 1-indexed row number
   * @returns Array of validation errors (empty if valid)
   */
  async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // 1. Check required fields
    if (!row.code || typeof row.code !== 'string' || !row.code.trim()) {
      errors.push({
        row: rowNumber,
        field: 'code',
        message: 'Department code is required',
        severity: 'ERROR',
        code: 'REQUIRED_FIELD',
      });
    }

    if (!row.name || typeof row.name !== 'string' || !row.name.trim()) {
      errors.push({
        row: rowNumber,
        field: 'name',
        message: 'Department name is required',
        severity: 'ERROR',
        code: 'REQUIRED_FIELD',
      });
    }

    // 2. Check duplicate code (if code is valid)
    if (row.code && typeof row.code === 'string' && row.code.trim()) {
      const existing = await this.knex('inventory.departments')
        .where('dept_code', row.code.trim())
        .first();

      if (existing) {
        errors.push({
          row: rowNumber,
          field: 'code',
          message: `Department code '${row.code}' already exists in database`,
          severity: 'ERROR',
          code: 'DUPLICATE_CODE',
        });
      }
    }

    // 3. Validate hospital_id if provided
    if (row.hospital_id !== undefined && row.hospital_id !== null) {
      const hospitalId = parseInt(row.hospital_id, 10);

      if (isNaN(hospitalId)) {
        errors.push({
          row: rowNumber,
          field: 'hospital_id',
          message: 'Hospital ID must be a valid number',
          severity: 'ERROR',
          code: 'INVALID_TYPE',
        });
      } else {
        // Check if hospital exists
        const hospital = await this.knex('public.hospitals')
          .where('id', hospitalId)
          .first();

        if (!hospital) {
          errors.push({
            row: rowNumber,
            field: 'hospital_id',
            message: `Hospital with ID ${hospitalId} does not exist`,
            severity: 'ERROR',
            code: 'INVALID_REFERENCE',
          });
        }
      }
    }

    // 4. Validate code format (if provided)
    if (row.code && typeof row.code === 'string') {
      const codePattern = /^[A-Z0-9_-]+$/;
      if (!codePattern.test(row.code.trim())) {
        errors.push({
          row: rowNumber,
          field: 'code',
          message:
            'Code must contain only uppercase letters, numbers, hyphens, and underscores',
          severity: 'ERROR',
          code: 'INVALID_FORMAT',
        });
      }
    }

    // 5. Validate is_active field
    if (row.is_active !== undefined && row.is_active !== null) {
      const activeStr = String(row.is_active).toLowerCase().trim();
      if (!['true', 'false', 'yes', 'no', '1', '0'].includes(activeStr)) {
        errors.push({
          row: rowNumber,
          field: 'is_active',
          message: 'Is Active must be true, false, yes, no, 1, or 0',
          severity: 'ERROR',
          code: 'INVALID_FORMAT',
        });
      }
    }

    return errors;
  }

  /**
   * Insert batch of departments into database
   * Called during import execution with transaction support
   *
   * @param batch - Array of validated department data
   * @param trx - Knex transaction instance
   * @param options - Import options
   * @returns Array of inserted departments
   */
  protected async insertBatch(
    batch: any[],
    trx: Knex.Transaction,
    options: any,
  ): Promise<Departments[]> {
    const results: Departments[] = [];

    for (const row of batch) {
      try {
        // Transform row data to database format
        const dbData = this.transformRowToDb(row);

        // Insert into database
        const [inserted] = await trx('inventory.departments')
          .insert(dbData)
          .returning('*');

        // Transform back to entity
        const entity = this.transformDbToEntity(inserted);
        results.push(entity);
      } catch (error) {
        console.error(`Failed to insert department:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Perform rollback of imported departments
   * Deletes records that were inserted by this import job using batch_id
   * Precise rollback without risk of deleting records from other imports
   *
   * @protected
   * @param batchId - Batch ID identifying records to rollback
   * @param knex - Knex instance for database access
   * @returns Number of departments deleted
   */
  protected async performRollback(
    batchId: string,
    knex: Knex,
  ): Promise<number> {
    try {
      // Delete departments by batch_id - precise and safe
      const deleted = await knex('inventory.departments')
        .where({ import_batch_id: batchId })
        .delete();

      return deleted;
    } catch (error) {
      throw new Error(
        `Rollback failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Transform row data to database format
   * @private
   */
  private transformRowToDb(row: any): Partial<any> {
    const isActiveStr = String(row.is_active || 'true')
      .toLowerCase()
      .trim();
    const isActive =
      isActiveStr === 'true' || isActiveStr === 'yes' || isActiveStr === '1';

    return {
      dept_code: row.code ? row.code.trim() : null,
      dept_name: row.name ? row.name.trim() : null,
      his_code: row.hospital_id ? String(row.hospital_id) : null,
      consumption_group: null, // Optional, not in import
      is_active: isActive,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Transform database row to entity
   * @private
   */
  private transformDbToEntity(dbRow: any): Departments {
    return {
      id: dbRow.id,
      dept_code: dbRow.dept_code,
      dept_name: dbRow.dept_name,
      his_code: dbRow.his_code,
      parent_id: dbRow.parent_id,
      consumption_group: dbRow.consumption_group,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    };
  }
}
