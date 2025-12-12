import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BudgetRequest } from '../types/budget-requests.types';

export interface ValidationMessage {
  field?: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  info: string[];
}

@Injectable({
  providedIn: 'root',
})
export class BudgetRequestValidationService {
  private http = inject(HttpClient);
  private readonly API_URL = '/inventory/budget/budget-requests';

  /**
   * Performs a comprehensive validation by combining client-side checks
   * with a server-side validation call.
   *
   * @param id The ID of the budget request to validate.
   * @param request The full BudgetRequest object for client-side checks.
   * @returns An Observable of the aggregated ValidationResult.
   */
  validateForSubmit(
    id: number,
    request: BudgetRequest,
  ): Observable<ValidationResult> {
    // Perform client-side validation first
    const clientResult = this.validateClientSide(request);

    // Call server-side validation
    return this.http
      .post<ValidationResult>(`${this.API_URL}/${id}/validate`, {})
      .pipe(
        map((serverResult) => {
          // Merge client-side and server-side validation results
          return {
            valid: clientResult.valid && serverResult.valid,
            errors: [...clientResult.errors, ...serverResult.errors],
            warnings: [...clientResult.warnings, ...serverResult.warnings],
            info: [...clientResult.info, ...serverResult.info],
          };
        }),
        catchError((error) => {
          // In case of a server error, return the client-side result
          // with an added error message about the server failure.
          const serverError: ValidationMessage = {
            field: 'general',
            code: 'SERVER_VALIDATION_FAILED',
            message: `Server-side validation failed: ${
              error.error?.message || error.message
            }`,
          };
          return of({
            valid: false,
            errors: [...clientResult.errors, serverError],
            warnings: clientResult.warnings,
            info: clientResult.info,
          });
        }),
      );
  }

  /**
   * Performs quick client-side validations.
   * This provides immediate feedback to the user before hitting the server.
   *
   * @param request The budget request object.
   * @returns A partial ValidationResult from client-side checks.
   */
  private validateClientSide(request: BudgetRequest): ValidationResult {
    const errors: ValidationMessage[] = [];
    const warnings: ValidationMessage[] = [];
    const info: string[] = [];

    // Rule: Justification must be at least 20 characters
    if (!request.justification || request.justification.length < 20) {
      errors.push({
        field: 'justification',
        code: 'JUSTIFICATION_TOO_SHORT',
        message: 'Justification must be at least 20 characters.',
      });
    }

    // Rule: At least one item is required
    if (!request.items || request.items.length === 0) {
      errors.push({
        field: 'items',
        code: 'NO_ITEMS',
        message: 'At least one budget request item is required.',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  }
}
