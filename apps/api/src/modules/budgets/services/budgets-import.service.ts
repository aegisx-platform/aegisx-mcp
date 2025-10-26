/**
 * Budgets Import Service
 * Module-specific configuration for bulk import functionality
 * Extends BaseImportService with Budgets-specific configuration
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
  type Budgets,
  type CreateBudgets,
  BudgetsErrorCode,
  BudgetsErrorMessages,
} from '../types/budgets.types';
import { BudgetsRepository } from '../repositories/budgets.repository';

/**
 * Budgets Import Service Configuration
 */
export class BudgetsImportService extends BaseImportService<Budgets> {
  constructor(
    knex: Knex,
    private budgetsRepository: BudgetsRepository,
  ) {
    super(knex, BudgetsImportService.createConfig(budgetsRepository));
  }

  /**
   * Create module-specific import configuration
   */
  private static createConfig(
    budgetsRepository: BudgetsRepository,
  ): ImportModuleConfig<Budgets> {
    // Define field configurations
    const fields: ImportFieldConfig[] = [
      {
        name: 'budget_code',
        label: 'Budget Code',
        required: false,
        type: 'string',
        maxLength: 10,
        description: 'Budget Code value (max 10 characters)',
        defaultExample: 'ABC123',

        validators: [
          BudgetsImportService.validateBudgetCodeUniqueness(budgetsRepository),
        ],

        errorMessages: {
          unique: BudgetsErrorMessages[BudgetsErrorCode.DUPLICATE_BUDGET_CODE],
        },
      },
      {
        name: 'budget_type',
        label: 'Budget Type',
        required: false,
        type: 'string',
        maxLength: 10,
        description: 'Budget Type value (max 10 characters)',
        defaultExample: 'Sample value',
      },
      {
        name: 'budget_category',
        label: 'Budget Category',
        required: false,
        type: 'string',
        maxLength: 10,
        description: 'Budget Category value (max 10 characters)',
        defaultExample: 'Sample value',
      },
      {
        name: 'budget_description',
        label: 'Budget Description',
        required: false,
        type: 'string',

        description: 'Budget Description value',
        defaultExample: 'Sample description text',
      },
      {
        name: 'is_active',
        label: 'Is Active',
        required: false,
        type: 'boolean',

        description: 'Is Active value',
        defaultExample: 'true',

        transformer: BudgetsImportService.transformIsActive,
      },
    ];

    return {
      moduleName: 'budgets',
      displayName: 'Budgets',
      fields,
      maxRows: 10000,
      allowWarnings: true,
      sessionExpirationMinutes: 30,
      batchSize: 100,
      rowTransformer: BudgetsImportService.transformRow,
    };
  }

  /**
   * Create budget_code uniqueness validator
   */
  private static validateBudgetCodeUniqueness(
    repository: BudgetsRepository,
  ): (
    value: any,
    row: any,
    index: number,
  ) => Promise<ImportValidationError | null> {
    return async (value: any, _row: any, _index: number) => {
      if (!value) return null;

      try {
        const existing = await repository.findByBudgetCode(value);
        if (existing) {
          return {
            field: 'budget_code',
            message:
              BudgetsErrorMessages[BudgetsErrorCode.DUPLICATE_BUDGET_CODE],
            code: BudgetsErrorCode.DUPLICATE_BUDGET_CODE,
            severity: ImportValidationSeverity.ERROR,
            value,
          };
        }
      } catch (error) {
        console.error('BudgetCode uniqueness check failed:', error);
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
   * Transform row data to Budgets entity format
   */
  private static transformRow(row: any): Partial<Budgets> {
    return {
      budget_code: row.budget_code,
      budget_type: row.budget_type,
      budget_category: row.budget_category,
      budget_description: row.budget_description,
      is_active: BudgetsImportService.transformIsActive(row.is_active, row),
    };
  }

  /**
   * Insert batch of budgets into database
   * Required implementation from BaseImportService
   */
  protected async insertBatch(batch: Partial<Budgets>[]): Promise<Budgets[]> {
    const results: Budgets[] = [];

    for (const data of batch) {
      try {
        const created = await this.budgetsRepository.create(
          data as CreateBudgets,
        );
        results.push(created);
      } catch (error) {
        console.error('Failed to insert budgets:', error);
        throw error;
      }
    }

    return results;
  }
}
