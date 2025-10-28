import { Injectable } from '@angular/core';

/**
 * Service for generating sample data from Handlebars templates
 *
 * This service extracts variables from Handlebars templates and generates
 * realistic sample data based on variable name patterns.
 */
@Injectable({
  providedIn: 'root',
})
export class PdfSampleDataGeneratorService {
  // List of known Handlebars helpers that take arguments
  private readonly knownHelpers = [
    'add',
    'subtract',
    'multiply',
    'divide',
    'formatDate',
    'formatCurrency',
    'formatNumber',
    'formatPercent',
    'uppercase',
    'lowercase',
    'truncate',
    'eq',
    'gt',
    'lt',
    'gte',
    'lte',
    'ne',
    'or',
    'and',
    'not',
    'logo',
    'default',
    'json',
  ];

  /**
   * Generate sample data from a Handlebars template
   *
   * @param templateData The Handlebars template string
   * @returns Sample data object with generated values
   */
  generateFromTemplate(templateData: string): Record<string, unknown> | null {
    if (!templateData) {
      console.warn('[Sample Data Generator] No template data provided');
      return null;
    }

    try {
      // Extract all Handlebars variables from template
      const handlebarsRegex = /\{\{([^}]+)\}\}/g;
      const matches = templateData.matchAll(handlebarsRegex);

      const variables = new Set<string>();
      const nestedObjects = new Map<string, Set<string>>();
      const helperCalls = new Map<string, string[]>();

      // Parse template and categorize variables
      for (const match of matches) {
        const content = match[1].trim();

        // Skip control structures
        if (
          content.startsWith('/') ||
          content.startsWith('else') ||
          content.startsWith('!') ||
          content.startsWith('^')
        ) {
          continue;
        }

        // Handle #each, #if, #unless
        if (content.startsWith('#')) {
          this.handleBlockHelper(content, variables, nestedObjects);
          continue;
        }

        // Check if it's a helper call
        const parts = content.split(/\s+/);
        if (parts.length >= 2 && this.knownHelpers.includes(parts[0])) {
          this.handleHelperCall(parts, helperCalls, variables, nestedObjects);
          continue;
        }

        // Handle nested properties
        if (content.includes('.')) {
          this.handleNestedProperty(content, templateData, nestedObjects);
        } else {
          // Simple variable
          variables.add(content);
        }
      }

      // Build sample data structure
      const sampleData = this.buildSampleData(variables, nestedObjects);

      console.log('[Sample Data Generator] Generated sample data:', sampleData);
      console.log('[Sample Data Generator] Variables:', Array.from(variables));
      console.log(
        '[Sample Data Generator] Nested objects:',
        Array.from(nestedObjects.entries()),
      );
      console.log(
        '[Sample Data Generator] Helper calls:',
        Array.from(helperCalls.entries()),
      );

      return sampleData;
    } catch (error) {
      console.error(
        '[Sample Data Generator] Failed to generate sample data:',
        error,
      );
      return null;
    }
  }

  /**
   * Handle block helpers like #each, #if, #unless
   */
  private handleBlockHelper(
    content: string,
    variables: Set<string>,
    nestedObjects: Map<string, Set<string>>,
  ): void {
    const helperMatch = content.match(/^#(\w+)\s+(.+)/);
    if (!helperMatch) return;

    const helperName = helperMatch[1]; // each, if, unless
    const variable = helperMatch[2].trim();

    if (helperName === 'each') {
      // Mark as array
      if (!nestedObjects.has(variable)) {
        nestedObjects.set(variable, new Set());
      }
    } else {
      // Conditional - add as boolean variable
      variables.add(variable);
    }
  }

  /**
   * Handle helper calls like {{logo logo_file_id}} or {{add @index 1}}
   */
  private handleHelperCall(
    parts: string[],
    helperCalls: Map<string, string[]>,
    variables: Set<string>,
    nestedObjects: Map<string, Set<string>>,
  ): void {
    const helperName = parts[0];
    const args = parts.slice(1).filter(
      (arg: string) =>
        !arg.startsWith('@') && // Skip @index, @first, etc.
        !arg.match(/^[\d.]+$/), // Skip numeric literals
    );

    if (!helperCalls.has(helperName)) {
      helperCalls.set(helperName, []);
    }

    for (const arg of args) {
      helperCalls.get(helperName)?.push(arg);

      // Add the argument as a variable
      if (arg.includes('.')) {
        const [obj, prop] = arg.split('.');
        if (!nestedObjects.has(obj)) {
          nestedObjects.set(obj, new Set());
        }
        nestedObjects.get(obj)?.add(prop);
      } else {
        variables.add(arg);
      }
    }
  }

  /**
   * Handle nested properties like this.description or row.col1
   */
  private handleNestedProperty(
    content: string,
    templateData: string,
    nestedObjects: Map<string, Set<string>>,
  ): void {
    const parts = content.split('.');
    let rootObject = parts[0];

    // Handle "this.property" in #each loops
    if (rootObject === 'this') {
      const eachMatch = templateData.match(/\{\{#each\s+(\w+)\}\}/);
      if (eachMatch) {
        rootObject = eachMatch[1];
      } else {
        return;
      }
    }

    const property = parts.slice(1).join('.');

    if (!nestedObjects.has(rootObject)) {
      nestedObjects.set(rootObject, new Set());
    }
    nestedObjects.get(rootObject)?.add(property);
  }

  /**
   * Build sample data structure from extracted variables
   */
  private buildSampleData(
    variables: Set<string>,
    nestedObjects: Map<string, Set<string>>,
  ): Record<string, unknown> {
    const sampleData: Record<string, unknown> = {};

    // Add simple variables
    for (const variable of variables) {
      // Skip if this variable is also a nested object
      if (nestedObjects.has(variable)) {
        continue;
      }

      // Skip built-in helpers and special variables
      if (variable.startsWith('@') || this.knownHelpers.includes(variable)) {
        continue;
      }

      // Skip logo_file_id (injected automatically by template)
      if (variable === 'logo_file_id') {
        continue;
      }

      sampleData[variable] = this.generateSampleValue(variable);
    }

    // Add nested objects (arrays with properties)
    for (const [objectName, properties] of nestedObjects.entries()) {
      const objectData: Record<string, unknown> = {};

      for (const property of properties) {
        objectData[property] = this.generateSampleValue(property);
      }

      // Always create array for objects found in nestedObjects
      if (Object.keys(objectData).length > 0) {
        sampleData[objectName] = [
          { ...objectData },
          { ...objectData },
          { ...objectData }, // 3 sample items
        ];
      }
    }

    return sampleData;
  }

  /**
   * Generate sample value based on variable name heuristics
   *
   * Note: logo_file_id is NOT generated here - it's injected automatically by the template system
   */
  generateSampleValue(variableName: string): string {
    const lower = variableName.toLowerCase();

    // Note: We don't generate logo_file_id here - it's handled by the template itself
    // The template's logo_file_id is automatically injected during preview/render

    // File ID patterns (for other file uploads, not logo)
    if (
      lower.includes('file') &&
      lower.includes('id') &&
      !lower.includes('logo')
    ) {
      return 'sample-file-uuid-5678';
    }

    if (lower.includes('logo')) {
      // Fallback base64 image for other logo fields
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }

    // Date patterns
    if (lower.includes('date') || lower === 'd' || lower === 'dt') {
      return '2024-01-15';
    }

    // Number patterns
    if (
      lower.includes('number') ||
      lower.includes('no') ||
      lower.includes('id') ||
      lower.includes('qty') ||
      lower.includes('quantity') ||
      lower.includes('amount') ||
      lower.includes('price') ||
      lower.includes('total') ||
      lower.includes('subtotal') ||
      lower.includes('tax')
    ) {
      if (
        lower.includes('amount') ||
        lower.includes('price') ||
        lower.includes('total') ||
        lower.includes('tax')
      ) {
        return '1,000.00';
      }
      if (lower.includes('id')) {
        return 'uuid-' + Math.random().toString(36).substring(7);
      }
      return '001';
    }

    // Email pattern
    if (lower.includes('email')) {
      return 'example@email.com';
    }

    // Phone pattern
    if (
      lower.includes('phone') ||
      lower.includes('tel') ||
      lower.includes('mobile')
    ) {
      return '02-123-4567';
    }

    // Name patterns
    if (lower.includes('name')) {
      if (lower.includes('company') || lower.includes('business')) {
        return 'บริษัท ตัวอย่าง จำกัด';
      }
      return 'ชื่อตัวอย่าง';
    }

    // Address pattern
    if (lower.includes('address')) {
      return '123 ถนนตัวอย่าง กรุงเทพฯ 10110';
    }

    // Title pattern
    if (lower.includes('title') || lower.includes('header')) {
      return 'หัวข้อเอกสาร';
    }

    // Description/Content pattern
    if (
      lower.includes('description') ||
      lower.includes('content') ||
      lower.includes('detail') ||
      lower.includes('note') ||
      lower.includes('remark')
    ) {
      return 'ข้อความตัวอย่าง';
    }

    // Reference pattern
    if (lower.includes('ref') || lower.includes('reference')) {
      return 'REF-001';
    }

    // Column/Row/Item patterns (for tables)
    if (lower.includes('col') || lower.includes('item')) {
      return 'รายการ';
    }

    // Default
    return `ค่าตัวอย่าง ${variableName}`;
  }
}
