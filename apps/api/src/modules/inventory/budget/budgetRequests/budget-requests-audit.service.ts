import { Knex } from 'knex';

/**
 * Audit action types for budget request tracking
 */
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'SUBMIT'
  | 'APPROVE_DEPT'
  | 'APPROVE_FINANCE'
  | 'REJECT'
  | 'REOPEN';

/**
 * Entity types that can be audited
 */
export type AuditEntityType = 'BUDGET_REQUEST' | 'BUDGET_REQUEST_ITEM';

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  budget_request_id: number;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: number;
  field_name?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  user_id: string;
}

/**
 * Service for tracking changes to budget requests in audit log
 *
 * Features:
 * - Log all CRUD operations
 * - Track workflow state changes (SUBMIT, APPROVE, REJECT, REOPEN)
 * - Field-level change tracking for UPDATE operations
 * - Support for both BUDGET_REQUEST and BUDGET_REQUEST_ITEM entities
 */
export class BudgetRequestsAuditService {
  constructor(
    private readonly db: Knex,
    private readonly logger: any,
  ) {}

  /**
   * Log a single audit entry
   */
  async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      await this.db('inventory.budget_request_audit').insert({
        budget_request_id: entry.budget_request_id,
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        field_name: entry.field_name || null,
        old_value: entry.old_value || null,
        new_value: entry.new_value || null,
        user_id: entry.user_id,
        created_at: new Date(),
      });

      this.logger.debug(
        {
          budget_request_id: entry.budget_request_id,
          action: entry.action,
          entity_type: entry.entity_type,
          entity_id: entry.entity_id,
          user_id: entry.user_id,
        },
        'Audit log entry created',
      );
    } catch (error: any) {
      this.logger.error(
        {
          error: error.message,
          entry,
        },
        'Failed to create audit log entry',
      );
      // Don't throw - audit logging should not break the main operation
    }
  }

  /**
   * Log field-level changes for UPDATE operations
   * Compares old and new values and creates audit entries for each changed field
   */
  async logFieldChanges(
    budgetRequestId: number,
    entityType: AuditEntityType,
    entityId: number,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    userId: string,
  ): Promise<void> {
    const changedFields: string[] = [];

    // Find all changed fields
    for (const field in newValues) {
      if (Object.prototype.hasOwnProperty.call(newValues, field)) {
        const oldValue = oldValues[field];
        const newValue = newValues[field];

        // Skip if values are the same
        if (this.valuesAreEqual(oldValue, newValue)) {
          continue;
        }

        changedFields.push(field);

        // Create audit entry for this field change
        await this.logAction({
          budget_request_id: budgetRequestId,
          action: 'UPDATE',
          entity_type: entityType,
          entity_id: entityId,
          field_name: field,
          old_value: this.valueToString(oldValue),
          new_value: this.valueToString(newValue),
          user_id: userId,
        });
      }
    }

    this.logger.debug(
      {
        budget_request_id: budgetRequestId,
        entity_type: entityType,
        entity_id: entityId,
        changed_fields: changedFields,
      },
      'Field changes logged',
    );
  }

  /**
   * Log workflow state change (SUBMIT, APPROVE, REJECT, REOPEN)
   */
  async logWorkflowChange(
    budgetRequestId: number,
    action: Extract<
      AuditAction,
      'SUBMIT' | 'APPROVE_DEPT' | 'APPROVE_FINANCE' | 'REJECT' | 'REOPEN'
    >,
    oldStatus: string,
    newStatus: string,
    userId: string,
  ): Promise<void> {
    await this.logAction({
      budget_request_id: budgetRequestId,
      action,
      entity_type: 'BUDGET_REQUEST',
      entity_id: budgetRequestId,
      field_name: 'status',
      old_value: oldStatus,
      new_value: newStatus,
      user_id: userId,
    });
  }

  /**
   * Get audit trail for a budget request
   */
  async getAuditTrail(
    budgetRequestId: number,
    options?: {
      limit?: number;
      offset?: number;
      action?: AuditAction;
      userId?: string;
    },
  ): Promise<any[]> {
    let query = this.db('inventory.budget_request_audit')
      .where('budget_request_id', budgetRequestId)
      .orderBy('created_at', 'desc');

    if (options?.action) {
      query = query.where('action', options.action);
    }

    if (options?.userId) {
      query = query.where('user_id', options.userId);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query;
  }

  /**
   * Compare two values for equality
   * Handles null, undefined, dates, and objects
   */
  private valuesAreEqual(oldValue: any, newValue: any): boolean {
    // Both null or undefined
    if (oldValue == null && newValue == null) {
      return true;
    }

    // One is null/undefined, other is not
    if (oldValue == null || newValue == null) {
      return false;
    }

    // Dates
    if (oldValue instanceof Date && newValue instanceof Date) {
      return oldValue.getTime() === newValue.getTime();
    }

    // Objects - deep comparison
    if (typeof oldValue === 'object' && typeof newValue === 'object') {
      return JSON.stringify(oldValue) === JSON.stringify(newValue);
    }

    // Primitive values
    return oldValue === newValue;
  }

  /**
   * Convert value to string for storage
   */
  private valueToString(value: any): string | null {
    if (value == null) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }
}
