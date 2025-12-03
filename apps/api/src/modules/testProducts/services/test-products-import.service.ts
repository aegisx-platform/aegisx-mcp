/**
 * TestProducts Import Service
 * Module-specific configuration for bulk import functionality
 * Extends BaseImportService with TestProducts-specific configuration
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
  type TestProducts,
  type CreateTestProducts,
  TestProductsErrorCode,
  TestProductsErrorMessages,
} from '../types/test-products.types';
import { TestProductsRepository } from '../repositories/test-products.repository';

/**
 * TestProducts Import Service Configuration
 */
export class TestProductsImportService extends BaseImportService<TestProducts> {
  constructor(
    knex: Knex,
    private testProductsRepository: TestProductsRepository,
    eventService?: any, // EventService for WebSocket progress updates
  ) {
    super(
      knex,
      TestProductsImportService.createConfig(testProductsRepository),
      'testProducts',
      eventService, // Pass eventService to BaseImportService for progress events
    );
  }

  /**
   * Create module-specific import configuration
   */
  private static createConfig(
    testProductsRepository: TestProductsRepository,
  ): ImportModuleConfig<TestProducts> {
    // Define field configurations
    const fields: ImportFieldConfig[] = [
      {
        name: 'code',
        label: 'Code',
        required: false,
        type: 'string',
        maxLength: 255,
        description: 'Code value (max 255 characters)',
        defaultExample: 'ABC123',

        validators: [
          TestProductsImportService.validateCodeUniqueness(
            testProductsRepository,
          ),
        ],

        errorMessages: {
          unique:
            TestProductsErrorMessages[TestProductsErrorCode.DUPLICATE_CODE],
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
          TestProductsImportService.validateNameUniqueness(
            testProductsRepository,
          ),
        ],

        errorMessages: {
          unique:
            TestProductsErrorMessages[TestProductsErrorCode.DUPLICATE_NAME],
        },
      },
      {
        name: 'slug',
        label: 'Slug',
        required: false,
        type: 'string',
        maxLength: 255,
        description: 'Slug value (max 255 characters)',

        transformer: TestProductsImportService.generateSlug,
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

        transformer: TestProductsImportService.transformIsActive,
      },
      {
        name: 'is_featured',
        label: 'Is Featured',
        required: false,
        type: 'boolean',

        description: 'Is Featured value',
        defaultExample: 'true',

        transformer: TestProductsImportService.transformIsFeatured,
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

        description: 'Metadata value',
        defaultExample: 'Sample value',

        transformer: TestProductsImportService.transformMetadata,
      },
      {
        name: 'settings',
        label: 'Settings',
        required: false,
        type: 'string',

        description: 'Settings value',
        defaultExample: 'Sample value',

        transformer: TestProductsImportService.transformSettings,
      },
      {
        name: 'status',
        label: 'Status',
        required: false,
        type: 'string',
        maxLength: 255,
        description: 'Status value (max 255 characters)',
        defaultExample: 'Sample value',
      },
    ];

    return {
      moduleName: 'testProducts',
      displayName: 'TestProducts',
      fields,
      maxRows: 10000,
      allowWarnings: true,
      sessionExpirationMinutes: 30,
      batchSize: 100,
      rowTransformer: TestProductsImportService.transformRow,
    };
  }

  /**
   * Create code uniqueness validator
   */
  private static validateCodeUniqueness(
    repository: TestProductsRepository,
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
              TestProductsErrorMessages[TestProductsErrorCode.DUPLICATE_CODE],
            code: TestProductsErrorCode.DUPLICATE_CODE,
            severity: ImportValidationSeverity.ERROR,
            value,
          };
        }
      } catch (error) {
        console.error('Code uniqueness check failed:', error);
      }

      return null;
    };
  }

  /**
   * Create name uniqueness validator
   */
  private static validateNameUniqueness(
    repository: TestProductsRepository,
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
              TestProductsErrorMessages[TestProductsErrorCode.DUPLICATE_NAME],
            code: TestProductsErrorCode.DUPLICATE_NAME,
            severity: ImportValidationSeverity.ERROR,
            value,
          };
        }
      } catch (error) {
        console.error('Name uniqueness check failed:', error);
      }

      return null;
    };
  }

  /**
   * Transform slug field values
   */
  private static generateSlug(value: any, _row: any): string {
    // If slug is provided, use it
    if (value && typeof value === 'string' && value.trim()) {
      return value
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    // Auto-generate from name field in the row
    const name = _row?.name || _row?.title || '';
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
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
   * Transform metadata field values
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
   * Transform settings field values
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
   * Transform row data to TestProducts entity format
   */
  private static transformRow(row: any): Partial<TestProducts> {
    return {
      code: row.code,
      name: row.name,
      slug: TestProductsImportService.generateSlug(row.slug, row),
      description: row.description,
      is_active: TestProductsImportService.transformIsActive(
        row.is_active,
        row,
      ),
      is_featured: TestProductsImportService.transformIsFeatured(
        row.is_featured,
        row,
      ),
      display_order: row.display_order,
      item_count: row.item_count,
      discount_rate: row.discount_rate,
      metadata: TestProductsImportService.transformMetadata(row.metadata, row),
      settings: TestProductsImportService.transformSettings(row.settings, row),
      status: row.status,
    };
  }

  /**
   * Insert batch of testProducts into database
   * Required implementation from BaseImportService
   */
  protected async insertBatch(
    batch: Partial<TestProducts>[],
  ): Promise<TestProducts[]> {
    const results: TestProducts[] = [];

    for (const data of batch) {
      try {
        const created = await this.testProductsRepository.create(
          data as CreateTestProducts,
        );
        results.push(created);
      } catch (error) {
        console.error('Failed to insert testProducts:', error);
        throw error;
      }
    }

    return results;
  }
}
