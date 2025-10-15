import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Service for PDF template form validation
 */
@Injectable({
  providedIn: 'root',
})
export class PdfTemplateValidationService {
  /**
   * Validator for JSON format
   */
  jsonValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      try {
        JSON.parse(control.value);
        return null;
      } catch (error) {
        return {
          invalidJson: {
            message:
              error instanceof Error ? error.message : 'Invalid JSON format',
          },
        };
      }
    };
  }

  /**
   * Validator for template data (JSON or Handlebars)
   */
  templateDataValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.trim();

      // Check if it's JSON with Handlebars
      if (value.includes('{{') && value.includes('}}')) {
        // For Handlebars templates, just check basic structure
        try {
          // Try to validate JSON structure ignoring Handlebars syntax
          const cleaned = value.replace(/\{\{[^}]+\}\}/g, '""');
          JSON.parse(cleaned);
          return null;
        } catch {
          return {
            invalidTemplate: {
              message:
                'Invalid template format. Check your JSON structure and Handlebars syntax.',
            },
          };
        }
      }

      // Otherwise validate as pure JSON
      try {
        JSON.parse(value);
        return null;
      } catch (error) {
        return {
          invalidJson: {
            message:
              error instanceof Error ? error.message : 'Invalid JSON format',
          },
        };
      }
    };
  }

  /**
   * Validator for sample data (must be valid JSON)
   */
  sampleDataValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      try {
        const parsed = JSON.parse(control.value);
        if (typeof parsed !== 'object' || parsed === null) {
          return {
            invalidSampleData: {
              message: 'Sample data must be a JSON object',
            },
          };
        }
        return null;
      } catch (error) {
        return {
          invalidJson: {
            message:
              error instanceof Error ? error.message : 'Invalid JSON format',
          },
        };
      }
    };
  }

  /**
   * Validator for page size
   */
  pageSizeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const validSizes = ['A4', 'A3', 'A5', 'LETTER', 'LEGAL'];
      if (!validSizes.includes(control.value)) {
        return {
          invalidPageSize: {
            message: `Page size must be one of: ${validSizes.join(', ')}`,
          },
        };
      }

      return null;
    };
  }

  /**
   * Validator for page orientation
   */
  pageOrientationValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const validOrientations = ['portrait', 'landscape'];
      if (!validOrientations.includes(control.value)) {
        return {
          invalidPageOrientation: {
            message: `Orientation must be either 'portrait' or 'landscape'`,
          },
        };
      }

      return null;
    };
  }

  /**
   * Check if template uses Handlebars syntax
   */
  hasHandlebarsSyntax(template: string): boolean {
    return template.includes('{{') && template.includes('}}');
  }

  /**
   * Extract variables from Handlebars template
   */
  extractHandlebarsVariables(template: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      const variable = match[1].trim();
      // Skip control structures and helpers
      if (
        !variable.startsWith('#') &&
        !variable.startsWith('/') &&
        !variable.startsWith('@')
      ) {
        variables.push(variable);
      }
    }

    return [...new Set(variables)];
  }

  /**
   * Validate that sample data covers all template variables
   */
  validateSampleDataCoverage(
    template: string,
    sampleDataJson: string,
  ): { valid: boolean; missingVariables: string[] } {
    if (!this.hasHandlebarsSyntax(template)) {
      return { valid: true, missingVariables: [] };
    }

    try {
      const variables = this.extractHandlebarsVariables(template);
      const sampleData = JSON.parse(sampleDataJson);
      const missingVariables: string[] = [];

      for (const variable of variables) {
        // Check if variable exists in sample data
        const parts = variable.split('.');
        let current = sampleData;
        let found = true;

        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            found = false;
            break;
          }
        }

        if (!found) {
          missingVariables.push(variable);
        }
      }

      return {
        valid: missingVariables.length === 0,
        missingVariables,
      };
    } catch {
      return { valid: false, missingVariables: [] };
    }
  }

  /**
   * Format validation error message
   */
  formatValidationError(error: ValidationErrors): string {
    if (error['invalidJson']) {
      return `JSON Error: ${error['invalidJson'].message}`;
    }
    if (error['invalidTemplate']) {
      return `Template Error: ${error['invalidTemplate'].message}`;
    }
    if (error['invalidSampleData']) {
      return `Sample Data Error: ${error['invalidSampleData'].message}`;
    }
    if (error['invalidPageSize']) {
      return `Page Size Error: ${error['invalidPageSize'].message}`;
    }
    if (error['invalidPageOrientation']) {
      return `Orientation Error: ${error['invalidPageOrientation'].message}`;
    }
    return 'Validation error occurred';
  }
}
