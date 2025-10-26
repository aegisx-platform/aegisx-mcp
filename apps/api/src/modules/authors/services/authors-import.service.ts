/**
 * Authors Import Service
 * Module-specific configuration for bulk import functionality
 * Extends BaseImportService with Authors-specific configuration
 */

import { Knex } from 'knex';
import { BaseImportService } from '../../../shared/services/base-import.service';
import {
  ImportModuleConfig,
  ImportFieldConfig,
  ImportValidationError,
  ImportValidationSeverity,
} from '../../../shared/services/import-config.interface';
import {
  type Authors,
  type CreateAuthors,
  AuthorsErrorCode,
  AuthorsErrorMessages,
} from '../types/authors.types';
import { AuthorsRepository } from '../repositories/authors.repository';

/**
 * Authors Import Service Configuration
 */
export class AuthorsImportService extends BaseImportService<Authors> {
  constructor(
    knex: Knex,
    private authorsRepository: AuthorsRepository,
  ) {
    super(
      knex,
      AuthorsImportService.createConfig(authorsRepository),
      'authors',
    );
  }

  /**
   * Create module-specific import configuration
   */
  private static createConfig(
    authorsRepository: AuthorsRepository,
  ): ImportModuleConfig<Authors> {
    // Define field configurations
    const fields: ImportFieldConfig[] = [
      {
        name: 'name',
        label: 'Full name',
        required: true,
        type: 'string',
        maxLength: 255,
        description: 'Full name (required)',
        defaultExample: 'John Doe',
        errorMessages: {
          required: 'Name is required',
        },
      },
      {
        name: 'email',
        label: 'Email address',
        required: true,
        type: 'email',
        unique: true,
        maxLength: 255,
        description: 'Email address (required, must be unique)',
        exampleGenerator: () => {
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 1000);
          return `author${timestamp}${random}@example.com`;
        },
        validators: [
          AuthorsImportService.createEmailUniqueValidator(authorsRepository),
        ],
        errorMessages: {
          required: 'Email is required',
          invalid: AuthorsErrorMessages[AuthorsErrorCode.INVALID_EMAIL_EMAIL],
          unique: AuthorsErrorMessages[AuthorsErrorCode.DUPLICATE_EMAIL],
        },
      },
      {
        name: 'bio',
        label: 'Biography',
        required: false,
        type: 'string',
        description: 'Biography (optional)',
        defaultExample: 'Award-winning author of fiction novels',
      },
      {
        name: 'birth_date',
        label: 'Birth date',
        required: false,
        type: 'date',
        description: 'Birth date (optional, format: YYYY-MM-DD)',
        defaultExample: '1980-05-15',
        validators: [AuthorsImportService.createBirthDateValidator()],
        errorMessages: {
          invalid:
            AuthorsErrorMessages[AuthorsErrorCode.INVALID_DATE_BIRTH_DATE],
        },
      },
      {
        name: 'country',
        label: 'Country',
        required: false,
        type: 'string',
        maxLength: 100,
        description: 'Country (optional)',
        defaultExample: 'USA',
      },
      {
        name: 'active',
        label: 'Active status',
        required: false,
        type: 'boolean',
        description: 'Active status (optional, true/false)',
        defaultExample: 'true',
        transformer: AuthorsImportService.booleanTransformer,
      },
    ];

    return {
      moduleName: 'authors',
      displayName: 'Authors',
      fields,
      maxRows: 10000,
      allowWarnings: true,
      sessionExpirationMinutes: 30,
      batchSize: 100,
      rowTransformer: AuthorsImportService.transformRow,
    };
  }

  /**
   * Create email uniqueness validator
   */
  private static createEmailUniqueValidator(
    repository: AuthorsRepository,
  ): (
    value: any,
    row: any,
    index: number,
  ) => Promise<ImportValidationError | null> {
    return async (
      value: any,
      row: any,
      index: number,
    ): Promise<ImportValidationError | null> => {
      if (!value) return null;

      try {
        const existing = await repository.findByEmail(value);
        if (existing) {
          return {
            field: 'email',
            message: AuthorsErrorMessages[AuthorsErrorCode.DUPLICATE_EMAIL],
            code: AuthorsErrorCode.DUPLICATE_EMAIL,
            severity: ImportValidationSeverity.ERROR,
            value,
          };
        }
      } catch (error) {
        console.error('Email uniqueness check failed:', error);
      }

      return null;
    };
  }

  /**
   * Create birth date validator (must not be in the future)
   */
  private static createBirthDateValidator(): (
    value: any,
    row: any,
    index: number,
  ) => ImportValidationError | null {
    return (
      value: any,
      row: any,
      index: number,
    ): ImportValidationError | null => {
      if (!value) return null;

      const date = new Date(value);
      if (date > new Date()) {
        return {
          field: 'birth_date',
          message:
            AuthorsErrorMessages[AuthorsErrorCode.INVALID_DATE_BIRTH_DATE],
          code: AuthorsErrorCode.INVALID_DATE_BIRTH_DATE,
          severity: ImportValidationSeverity.ERROR,
          value,
        };
      }

      return null;
    };
  }

  /**
   * Transform boolean field values
   */
  private static booleanTransformer(value: any, row: any): boolean | undefined {
    if (value === null || value === undefined || value === '') return undefined;

    const str = String(value).toLowerCase().trim();
    if (['true', '1', 'yes', 'y'].includes(str)) return true;
    if (['false', '0', 'no', 'n'].includes(str)) return false;

    return true; // Default to true for invalid values
  }

  /**
   * Transform row data to Authors entity format
   */
  private static transformRow(row: any): Partial<Authors> {
    return {
      name: row.name ? String(row.name).trim() : undefined,
      email: row.email ? String(row.email).trim().toLowerCase() : undefined,
      bio: row.bio ? String(row.bio).trim() : undefined,
      birth_date: row.birth_date ? String(row.birth_date).trim() : undefined,
      country: row.country ? String(row.country).trim() : undefined,
      active: row.active !== undefined ? row.active : true,
    };
  }

  /**
   * Insert batch of authors into database
   * Required implementation from BaseImportService
   */
  protected async insertBatch(batch: Partial<Authors>[]): Promise<Authors[]> {
    const results: Authors[] = [];

    for (const data of batch) {
      try {
        const created = await this.authorsRepository.create(
          data as CreateAuthors,
        );
        results.push(created);
      } catch (error) {
        console.error('Failed to insert author:', error);
        throw error;
      }
    }

    return results;
  }
}
