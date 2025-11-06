/**
 * TestCategories Import Service
 * Module-specific configuration for bulk import functionality
 * Extends BaseImportService with TestCategories-specific configuration
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
  type TestCategories,
  type CreateTestCategories,
  TestCategoriesErrorCode,
  TestCategoriesErrorMessages,
} from '../types/test-categories.types';
import { TestCategoriesRepository } from '../repositories/test-categories.repository';

/**
 * TestCategories Import Service Configuration
 */
export class TestCategoriesImportService extends BaseImportService<TestCategories> {
  constructor(
    knex: Knex,
    private testCategoriesRepository: TestCategoriesRepository,
    eventService?: any, // EventService for WebSocket progress updates
  ) {
    super(
      knex,
      TestCategoriesImportService.createConfig(testCategoriesRepository),
      'testCategories',
      eventService, // Pass eventService to BaseImportService for progress events
    );
  }

  /**
   * Create module-specific import configuration
   */
  private static createConfig(
    testCategoriesRepository: TestCategoriesRepository,
  ): ImportModuleConfig<TestCategories> {
    // Define field configurations
    const fields: ImportFieldConfig[] = [
      {
        name: 'code',
        label: 'Code',
        required: false,
        type: 'string',
        maxLength: 50,
        description: 'Code value (max 50 characters)',
        defaultExample: 'ABC123',

        validators: [
          TestCategoriesImportService.validateCodeUniqueness(
            testCategoriesRepository,
          ),
        ],

        errorMessages: {
          unique:
            TestCategoriesErrorMessages[TestCategoriesErrorCode.DUPLICATE_CODE],
        },
      },
      {
        name: 'name',
        label: 'Name',
        required: false,
        type: 'string',
        maxLength: 255,
        description: 'Name value (max 255 characters)',
        defaultExample: 'Example Name',
        validators: [
          TestCategoriesImportService.validateNameUniqueness(
            testCategoriesRepository,
          ),
        ],
        errorMessages: {
          unique:
            TestCategoriesErrorMessages[TestCategoriesErrorCode.DUPLICATE_NAME],
        },
      },
      {
        name: 'slug',
        label: 'Slug',
        required: false,
        type: 'string',
        maxLength: 255,
        description: 'Slug value (max 255 characters)',
        defaultExample: 'Sample value',
      },
      {
        name: 'description',
        label: 'Description',
        required: false,
        type: 'string',

        description: 'Description value',
        defaultExample: 'Sample description text',
      },
      {
        name: 'is_active',
        label: 'Is Active',
        required: false,
        type: 'boolean',

        description: 'Is Active value',
        defaultExample: 'true',

        transformer: TestCategoriesImportService.transformIsActive,
      },
      {
        name: 'is_featured',
        label: 'Is Featured',
        required: false,
        type: 'boolean',

        description: 'Is Featured value',
        defaultExample: 'true',

        transformer: TestCategoriesImportService.transformIsFeatured,
      },
      {
        name: 'display_order',
        label: 'Display Order',
        required: false,
        type: 'number',

        description: 'Display Order value',
        defaultExample: '1',
      },
      {
        name: 'item_count',
        label: 'Item Count',
        required: false,
        type: 'number',

        description: 'Item Count value',
        defaultExample: '10',
      },
      {
        name: 'discount_rate',
        label: 'Discount Rate',
        required: false,
        type: 'number',

        description: 'Discount Rate value',
        defaultExample: '10',
      },
      {
        name: 'metadata',
        label: 'Metadata',
        required: false,
        type: 'string',

        description: 'Metadata value (JSON string)',
        defaultExample: '{"key":"value"}',
        transformer: TestCategoriesImportService.transformMetadata,
      },
      {
        name: 'settings',
        label: 'Settings',
        required: false,
        type: 'string',

        description: 'Settings value (JSON string)',
        defaultExample: '{"key":"value"}',
        transformer: TestCategoriesImportService.transformSettings,
      },
      {
        name: 'status',
        label: 'Status',
        required: false,
        type: 'string',

        description: 'Status value',
        defaultExample: 'Sample value',
      },
    ];

    return {
      moduleName: 'testCategories',
      displayName: 'TestCategories',
      fields,
      maxRows: 10000,
      allowWarnings: true,
      sessionExpirationMinutes: 30,
      batchSize: 100,
      rowTransformer: TestCategoriesImportService.transformRow,
    };
  }

  /**
   * Create code uniqueness validator
   */
  private static validateCodeUniqueness(
    repository: TestCategoriesRepository,
  ): (
    value: any,
    row: any,
    index: number,
  ) => Promise<ImportValidationError | null> {
    return async (value: any, _row: any, _index: number) => {
      if (!value) return null;

      try {
        const existing = await repository.findByCode(value);
        if (existing) {
          return {
            field: 'code',
            message:
              TestCategoriesErrorMessages[
                TestCategoriesErrorCode.DUPLICATE_CODE
              ],
            code: TestCategoriesErrorCode.DUPLICATE_CODE,
            severity: ImportValidationSeverity.ERROR,
            value,
          };
        }
      } catch (error) {
        console.error('Code uniqueness check failed:', error);
        return {
          field: 'code',
          message: 'Failed to check code uniqueness',
          code: TestCategoriesErrorCode.VALIDATION_ERROR,
          severity: ImportValidationSeverity.ERROR,
          value,
        };
      }

      return null;
    };
  }

  /**
   * Create name uniqueness validator
   */
  private static validateNameUniqueness(
    repository: TestCategoriesRepository,
  ): (
    value: any,
    row: any,
    index: number,
  ) => Promise<ImportValidationError | null> {
    return async (value: any, _row: any, _index: number) => {
      if (!value) return null;

      try {
        const existing = await repository.findByName(value);
        if (existing) {
          return {
            field: 'name',
            message:
              TestCategoriesErrorMessages[
                TestCategoriesErrorCode.DUPLICATE_NAME
              ],
            code: TestCategoriesErrorCode.DUPLICATE_NAME,
            severity: ImportValidationSeverity.ERROR,
            value,
          };
        }
      } catch (error) {
        console.error('Name uniqueness check failed:', error);
        return {
          field: 'name',
          message: 'Failed to check name uniqueness',
          code: TestCategoriesErrorCode.VALIDATION_ERROR,
          severity: ImportValidationSeverity.ERROR,
          value,
        };
      }

      return null;
    };
  }

  /**
   * Transform is_active field values
   */
  private static transformIsActive(value: any, _row: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (lower === 'true' || lower === 'yes' || lower === '1') return true;
      if (lower === 'false' || lower === 'no' || lower === '0') return false;
    }
    if (typeof value === 'number') return value !== 0;
    return false;
  }

  /**
   * Transform is_featured field values
   */
  private static transformIsFeatured(value: any, _row: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (lower === 'true' || lower === 'yes' || lower === '1') return true;
      if (lower === 'false' || lower === 'no' || lower === '0') return false;
    }
    if (typeof value === 'number') return value !== 0;
    return false;
  }

  /**
   * Transform metadata field values (JSON string to object)
   */
  private static transformMetadata(value: any, _row: any): any {
    if (!value) return undefined;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        // If not valid JSON, treat as empty object
        return undefined;
      }
    }
    return undefined;
  }

  /**
   * Transform settings field values (JSON string to object)
   */
  private static transformSettings(value: any, _row: any): any {
    if (!value) return undefined;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        // If not valid JSON, treat as empty object
        return undefined;
      }
    }
    return undefined;
  }

  /**
   * Transform row data to TestCategories entity format
   */
  private static transformRow(row: any): Partial<TestCategories> {
    return {
      code: row.code,
      name: row.name,
      slug: row.slug,
      description: row.description,
      is_active: TestCategoriesImportService.transformIsActive(
        row.is_active,
        row,
      ),
      is_featured: TestCategoriesImportService.transformIsFeatured(
        row.is_featured,
        row,
      ),
      display_order: row.display_order
        ? parseInt(row.display_order, 10)
        : undefined,
      item_count: row.item_count ? parseInt(row.item_count, 10) : undefined,
      discount_rate: row.discount_rate
        ? parseFloat(row.discount_rate)
        : undefined,
      metadata: TestCategoriesImportService.transformMetadata(
        row.metadata,
        row,
      ),
      settings: TestCategoriesImportService.transformSettings(
        row.settings,
        row,
      ),
      status: row.status,
    };
  }

  /**
   * Insert batch of testCategories into database
   * Required implementation from BaseImportService
   */
  protected async insertBatch(
    batch: Partial<TestCategories>[],
  ): Promise<TestCategories[]> {
    const results: TestCategories[] = [];

    for (const data of batch) {
      try {
        const created = await this.testCategoriesRepository.create(
          data as CreateTestCategories,
        );
        results.push(created);
      } catch (error) {
        console.error('Failed to insert testCategories:', error);
        throw error;
      }
    }

    return results;
  }
}
