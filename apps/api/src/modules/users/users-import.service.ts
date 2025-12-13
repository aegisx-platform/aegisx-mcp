/**
 * Users Import Service
 * Auto-Discovery Import System implementation for system users
 *
 * Features:
 * - Auto-discovery via @ImportService decorator
 * - Template generation (CSV/Excel)
 * - Session-based validation
 * - Batch import with transaction support
 * - Role assignment (comma-separated role names)
 * - Department assignment with primary department support
 * - Duplicate email detection
 * - Email format validation
 * - Password strength validation
 * - Rollback support
 *
 * Dependencies: None (core user management - can import first)
 * Priority: 1 (can import first)
 */

import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';
import {
  ImportService,
  BaseImportService,
  TemplateColumn,
  ValidationError,
} from '../../core/import';
import type { User } from '../../core/users/users.types';
import { UsersRepository } from '../../core/users/users.repository';
import { UserDepartmentsRepository } from '../../core/users/user-departments.repository';

/**
 * Users Import Service
 * Handles bulk import of users with role and department assignments
 *
 * Template columns:
 * - email (required, unique): User email address
 * - display_name (required): User's display name
 * - password (required for new users): User password (will be hashed)
 * - role_names (optional): Comma-separated role names (e.g., 'admin,pharmacist')
 * - department_codes (optional): Comma-separated department codes (e.g., 'PHARM,FINANCE')
 * - primary_department_code (optional): Primary department code (must be in department_codes list)
 * - is_active (optional): Active status (default: true)
 */
@ImportService({
  module: 'users',
  domain: 'core',
  displayName: 'Users (ผู้ใช้งาน)',
  description: 'System users with role and department assignments',
  dependencies: [], // No dependencies - core user management
  priority: 1, // Highest priority (import first)
  tags: ['core', 'required', 'users'],
  supportsRollback: true,
  version: '1.0.0',
})
export class UsersImportService extends BaseImportService<User> {
  private usersRepository: UsersRepository;
  private userDepartmentsRepository: UserDepartmentsRepository;

  /**
   * Constructor
   * @param knex - Knex database instance
   */
  constructor(protected knex: Knex) {
    super(knex);
    this.usersRepository = new UsersRepository(knex);
    this.userDepartmentsRepository = new UserDepartmentsRepository(knex);
    this.moduleName = 'users';
  }

  /**
   * Get service metadata
   * Called during discovery phase
   */
  getMetadata() {
    return {
      module: 'users',
      domain: 'core',
      displayName: 'Users (ผู้ใช้งาน)',
      description: 'System users with role and department assignments',
      dependencies: [],
      priority: 1,
      tags: ['core', 'required', 'users'],
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
        name: 'email',
        displayName: 'Email Address',
        required: true,
        type: 'string',
        maxLength: 255,
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        description: 'User email address (must be unique and valid format)',
        example: 'john.doe@hospital.com',
      },
      {
        name: 'display_name',
        displayName: 'Display Name',
        required: true,
        type: 'string',
        maxLength: 255,
        description: 'User display name (first name and last name)',
        example: 'John Doe',
      },
      {
        name: 'password',
        displayName: 'Password',
        required: true,
        type: 'string',
        minValue: 8,
        description: 'User password (minimum 8 characters, will be hashed)',
        example: 'SecurePass123!',
      },
      {
        name: 'role_names',
        displayName: 'Role Names',
        required: false,
        type: 'string',
        description: 'Comma-separated role names (e.g., "admin,pharmacist")',
        example: 'pharmacist,inventory_manager',
      },
      {
        name: 'department_codes',
        displayName: 'Department Codes',
        required: false,
        type: 'string',
        description: 'Comma-separated department codes (e.g., "PHARM,FINANCE")',
        example: 'PHARM,ICU',
      },
      {
        name: 'primary_department_code',
        displayName: 'Primary Department Code',
        required: false,
        type: 'string',
        description:
          'Primary department code (must be included in department_codes)',
        example: 'PHARM',
      },
      {
        name: 'is_active',
        displayName: 'Is Active',
        required: false,
        type: 'boolean',
        description: 'Whether this user is active (default: true)',
        example: 'true',
      },
    ];
  }

  /**
   * Validate a single row during batch validation
   * Performs business logic validation including:
   * - Duplicate email detection
   * - Email format validation
   * - Role existence validation
   * - Department existence validation
   * - Primary department validation
   * - Password strength validation
   *
   * @param row - Row data from uploaded file
   * @param rowNumber - 1-indexed row number
   * @returns Array of validation errors (empty if valid)
   */
  async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // 1. Check required fields
    if (!row.email || typeof row.email !== 'string' || !row.email.trim()) {
      errors.push({
        row: rowNumber,
        field: 'email',
        message: 'Email is required',
        severity: 'ERROR',
        code: 'REQUIRED_FIELD',
      });
    }

    if (
      !row.display_name ||
      typeof row.display_name !== 'string' ||
      !row.display_name.trim()
    ) {
      errors.push({
        row: rowNumber,
        field: 'display_name',
        message: 'Display name is required',
        severity: 'ERROR',
        code: 'REQUIRED_FIELD',
      });
    }

    if (
      !row.password ||
      typeof row.password !== 'string' ||
      !row.password.trim()
    ) {
      errors.push({
        row: rowNumber,
        field: 'password',
        message: 'Password is required',
        severity: 'ERROR',
        code: 'REQUIRED_FIELD',
      });
    }

    // 2. Validate email format
    if (row.email && typeof row.email === 'string' && row.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(row.email.trim())) {
        errors.push({
          row: rowNumber,
          field: 'email',
          message: 'Invalid email format',
          severity: 'ERROR',
          code: 'INVALID_FORMAT',
        });
      }

      // Check for duplicate email in database
      const existingUser = await this.usersRepository.findByEmail(
        row.email.trim(),
      );
      if (existingUser) {
        errors.push({
          row: rowNumber,
          field: 'email',
          message: `Email '${row.email.trim()}' already exists in database`,
          severity: 'ERROR',
          code: 'DUPLICATE_EMAIL',
        });
      }
    }

    // 3. Validate password strength
    if (row.password && typeof row.password === 'string') {
      const password = row.password.trim();
      if (password.length < 8) {
        errors.push({
          row: rowNumber,
          field: 'password',
          message: 'Password must be at least 8 characters long',
          severity: 'ERROR',
          code: 'WEAK_PASSWORD',
        });
      }

      // Optional: Check for password complexity
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);

      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        errors.push({
          row: rowNumber,
          field: 'password',
          message:
            'Password should contain uppercase, lowercase, and numbers for better security',
          severity: 'WARNING',
          code: 'WEAK_PASSWORD_COMPLEXITY',
        });
      }
    }

    // 4. Validate role_names (if provided)
    if (
      row.role_names &&
      typeof row.role_names === 'string' &&
      row.role_names.trim()
    ) {
      const roleNames = row.role_names
        .split(',')
        .map((r: string) => r.trim())
        .filter((r: string) => r);

      for (const roleName of roleNames) {
        const role = await this.knex('roles').where('name', roleName).first();

        if (!role) {
          errors.push({
            row: rowNumber,
            field: 'role_names',
            message: `Role '${roleName}' does not exist in database`,
            severity: 'ERROR',
            code: 'INVALID_ROLE',
          });
        }
      }
    }

    // 5. Validate department_codes (if provided)
    const departmentCodes: string[] = [];
    if (
      row.department_codes &&
      typeof row.department_codes === 'string' &&
      row.department_codes.trim()
    ) {
      const codes = row.department_codes
        .split(',')
        .map((d: string) => d.trim())
        .filter((d: string) => d);

      for (const code of codes) {
        const department = await this.knex('inventory.departments')
          .where('dept_code', code)
          .first();

        if (!department) {
          errors.push({
            row: rowNumber,
            field: 'department_codes',
            message: `Department code '${code}' does not exist in database`,
            severity: 'ERROR',
            code: 'INVALID_DEPARTMENT',
          });
        } else {
          departmentCodes.push(code);
        }
      }
    }

    // 6. Validate primary_department_code (if provided)
    if (
      row.primary_department_code &&
      typeof row.primary_department_code === 'string' &&
      row.primary_department_code.trim()
    ) {
      const primaryCode = row.primary_department_code.trim();

      // Check if primary department is in department_codes list
      if (
        departmentCodes.length > 0 &&
        !departmentCodes.includes(primaryCode)
      ) {
        errors.push({
          row: rowNumber,
          field: 'primary_department_code',
          message: `Primary department '${primaryCode}' must be included in department_codes list`,
          severity: 'ERROR',
          code: 'INVALID_PRIMARY_DEPARTMENT',
        });
      }

      // Check if primary department exists in database
      const primaryDept = await this.knex('inventory.departments')
        .where('dept_code', primaryCode)
        .first();

      if (!primaryDept) {
        errors.push({
          row: rowNumber,
          field: 'primary_department_code',
          message: `Primary department code '${primaryCode}' does not exist in database`,
          severity: 'ERROR',
          code: 'INVALID_DEPARTMENT',
        });
      }
    }

    // 7. Validate is_active field (if provided)
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
   * Insert batch of users into database
   * Called during import execution with transaction support
   *
   * Handles:
   * - User creation
   * - Password hashing
   * - Role assignments
   * - Department assignments with primary department
   *
   * @param batch - Array of validated user data
   * @param trx - Knex transaction instance
   * @param options - Import options
   * @returns Array of inserted users
   */
  protected async insertBatch(
    batch: any[],
    trx: Knex.Transaction,
    options: any,
  ): Promise<User[]> {
    const results: User[] = [];

    for (const row of batch) {
      try {
        // 1. Hash password
        const hashedPassword = await bcrypt.hash(row.password.trim(), 10);

        // 2. Parse is_active
        const isActiveStr = String(row.is_active || 'true')
          .toLowerCase()
          .trim();
        const isActive =
          isActiveStr === 'true' ||
          isActiveStr === 'yes' ||
          isActiveStr === '1';

        // 3. Create user record
        const [user] = await trx('users')
          .insert({
            email: row.email.trim(),
            username: row.email.trim().split('@')[0], // Use email prefix as username
            password: hashedPassword,
            first_name: row.display_name.trim().split(' ')[0] || '',
            last_name:
              row.display_name.trim().split(' ').slice(1).join(' ') || '',
            status: isActive ? 'active' : 'inactive',
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning('*');

        // 4. Assign roles (if provided)
        if (
          row.role_names &&
          typeof row.role_names === 'string' &&
          row.role_names.trim()
        ) {
          const roleNames = row.role_names
            .split(',')
            .map((r: string) => r.trim())
            .filter((r: string) => r);

          for (const roleName of roleNames) {
            const role = await trx('roles').where('name', roleName).first();

            if (role) {
              await trx('user_roles').insert({
                user_id: user.id,
                role_id: role.id,
                assigned_at: new Date(),
                is_active: true,
              });
            }
          }
        }

        // 5. Assign departments (if provided)
        if (
          row.department_codes &&
          typeof row.department_codes === 'string' &&
          row.department_codes.trim()
        ) {
          const departmentCodes = row.department_codes
            .split(',')
            .map((d: string) => d.trim())
            .filter((d: string) => d);

          const primaryDeptCode = row.primary_department_code
            ? row.primary_department_code.trim()
            : departmentCodes[0]; // Use first department as primary if not specified

          for (const deptCode of departmentCodes) {
            const department = await trx('inventory.departments')
              .where('dept_code', deptCode)
              .first();

            if (department) {
              await trx('user_departments').insert({
                user_id: user.id,
                department_id: department.id,
                hospital_id: department.hospital_id || null,
                is_primary: deptCode === primaryDeptCode,
                can_create_requests: true,
                can_edit_requests: true,
                can_submit_requests: true,
                can_approve_requests: false,
                can_view_reports: true,
                assigned_at: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
              });
            }
          }
        }

        // 6. Transform to entity and add to results
        results.push(this.transformDbToEntity(user));
      } catch (error) {
        console.error(`Failed to insert user:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Perform rollback of imported users
   * Deletes users and their related records that were inserted by this import job
   * Uses batch_id for precise identification of imported records
   *
   * @protected
   * @param batchId - Batch ID identifying records to rollback
   * @param knex - Knex instance for database access
   * @returns Number of users deleted
   */
  protected async performRollback(
    batchId: string,
    knex: Knex,
  ): Promise<number> {
    try {
      const trx = await knex.transaction();

      try {
        // Get user IDs to delete by batch_id
        const usersToDelete = await trx('users')
          .where({ import_batch_id: batchId })
          .select('id');

        const userIds = usersToDelete.map((u: any) => u.id);

        if (userIds.length > 0) {
          // Delete related records first (cascade delete)
          await trx('user_roles').whereIn('user_id', userIds).delete();
          await trx('user_departments').whereIn('user_id', userIds).delete();

          // Delete users
          const deleted = await trx('users').whereIn('id', userIds).delete();

          await trx.commit();
          return deleted;
        }

        await trx.commit();
        return 0;
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      throw new Error(
        `Rollback failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Transform database row to User entity
   * @private
   */
  private transformDbToEntity(dbRow: any): User {
    return {
      id: dbRow.id,
      email: dbRow.email,
      username: dbRow.username,
      firstName: dbRow.first_name,
      lastName: dbRow.last_name,
      status: dbRow.status,
      lastLoginAt: dbRow.last_login_at
        ? new Date(dbRow.last_login_at)
        : undefined,
      createdAt: new Date(dbRow.created_at),
      updatedAt: new Date(dbRow.updated_at),
    };
  }
}
