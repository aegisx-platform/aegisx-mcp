import * as Handlebars from 'handlebars';
import moment from 'moment';
import {
  CompiledTemplate,
  HandlebarsHelpers,
  JsonObject,
  PdfTemplateData,
  TemplateValidationResult,
} from '../types/pdf-template.types';

type HelperOptions = Handlebars.HelperOptions;
type TemplateDelegate = Handlebars.TemplateDelegate;

/**
 * Handlebars Template Service
 *
 * Provides template compilation and rendering functionality
 * with custom helpers for PDF generation
 */
export class HandlebarsTemplateService {
  private helpers: HandlebarsHelpers;
  private compiledTemplates: Map<string, CompiledTemplate> = new Map();

  constructor() {
    this.helpers = this.createHelpers();
    this.registerHelpers();
  }

  /**
   * Create custom Handlebars helpers
   */
  private createHelpers(): HandlebarsHelpers {
    return {
      // Date formatting helper
      formatDate: (date: string | Date, format: string = 'DD/MM/YYYY') => {
        if (!date) return '';
        return moment(date).format(format);
      },

      // Currency formatting helper
      formatCurrency: (
        amount: number,
        currency: string = 'THB',
        locale: string = 'th-TH',
      ) => {
        if (typeof amount !== 'number') return '0.00';
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 2,
        }).format(amount);
      },

      // Number formatting helper
      formatNumber: (
        num: number,
        decimals: number = 0,
        locale: string = 'th-TH',
      ) => {
        if (typeof num !== 'number') return '0';
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(num);
      },

      // Percentage formatting helper
      formatPercent: (num: number, decimals: number = 2) => {
        if (typeof num !== 'number') return '0%';
        return (num * 100).toFixed(decimals) + '%';
      },

      // Text transformation helpers
      uppercase: (str: string) => (str || '').toString().toUpperCase(),
      lowercase: (str: string) => (str || '').toString().toLowerCase(),

      // Text truncation helper
      truncate: (str: string, length: number = 50, suffix: string = '...') => {
        if (!str) return '';
        const text = str.toString();
        return text.length > length ? text.substring(0, length) + suffix : text;
      },

      // Default value helper
      default: (value: unknown, defaultValue: unknown = '') => {
        return value !== null && value !== undefined && value !== ''
          ? value
          : defaultValue;
      },

      // Comparison helpers
      eq: (a: unknown, b: unknown) => a === b,
      gt: (a: unknown, b: unknown) => a > b,
      lt: (a: unknown, b: unknown) => a < b,
      gte: (a: unknown, b: unknown) => a >= b,
      lte: (a: unknown, b: unknown) => a <= b,
      ne: (a: unknown, b: unknown) => a !== b,

      // Logical helpers
      or: (...args: unknown[]) => {
        // Remove the last argument which is Handlebars options object
        const values = args.slice(0, -1);
        return values.some((val) => !!val);
      },

      and: (...args: unknown[]) => {
        // Remove the last argument which is Handlebars options object
        const values = args.slice(0, -1);
        return values.every((val) => !!val);
      },

      not: (value: unknown) => !value, // Math helpers
      add: (a: number, b: number) => (a || 0) + (b || 0),
      subtract: (a: number, b: number) => (a || 0) - (b || 0),
      multiply: (a: number, b: number) => (a || 0) * (b || 0),
      divide: (a: number, b: number) => (b !== 0 ? (a || 0) / b : 0),

      // Math functions
      round: (num: number, decimals: number = 0) => {
        const factor = Math.pow(10, decimals);
        return Math.round((num || 0) * factor) / factor;
      },

      ceil: (num: number) => Math.ceil(num || 0),
      floor: (num: number) => Math.floor(num || 0),

      // Array helpers
      length: (arr: unknown[]) => (Array.isArray(arr) ? arr.length : 0),

      join: (arr: unknown[], separator: string = ', ') => {
        return Array.isArray(arr) ? arr.join(separator) : '';
      },

      // Array access helper
      at: (arr: unknown[], index: number) => {
        return Array.isArray(arr) && arr[index] !== undefined
          ? arr[index]
          : null;
      },

      // Array filtering helper
      where: (arr: unknown[], key: string, value: unknown) => {
        if (!Array.isArray(arr)) return [];
        return arr.filter((item) => item && item[key] === value);
      },

      // Thai-specific helpers
      formatThaiCurrency: (amount: number) => {
        if (typeof amount !== 'number') return '0.00 บาท';
        const formatted = new Intl.NumberFormat('th-TH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
        return formatted + ' บาท';
      },

      // Convert number to Thai text (simplified version)
      numberToThaiText: (num: number) => {
        // This is a simplified version - in production, use a proper Thai number conversion library
        const thaiNumbers = [
          'ศูนย์',
          'หนึ่ง',
          'สอง',
          'สาม',
          'สี่',
          'ห้า',
          'หก',
          'เจ็ด',
          'แปด',
          'เก้า',
        ];
        if (num >= 0 && num <= 9) {
          return thaiNumbers[num];
        }
        return num.toString(); // Fallback for complex numbers
      },

      // Conditional helpers
      // Conditional helpers
      ifCond: function (
        v1: unknown,
        operator: string,
        v2: unknown,
        options: HelperOptions,
      ) {
        switch (operator) {
          case '==':
            return v1 == v2 ? options.fn(this) : options.inverse(this);
          case '===':
            return v1 === v2 ? options.fn(this) : options.inverse(this);
          case '!=':
            return v1 != v2 ? options.fn(this) : options.inverse(this);
          case '!==':
            return v1 !== v2 ? options.fn(this) : options.inverse(this);
          case '<':
            return v1 < v2 ? options.fn(this) : options.inverse(this);
          case '<=':
            return v1 <= v2 ? options.fn(this) : options.inverse(this);
          case '>':
            return v1 > v2 ? options.fn(this) : options.inverse(this);
          case '>=':
            return v1 >= v2 ? options.fn(this) : options.inverse(this);
          case '&&':
            return v1 && v2 ? options.fn(this) : options.inverse(this);
          case '||':
            return v1 || v2 ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      },

      // Loop helpers
      times: function (n: number, options: HelperOptions) {
        let result = '';
        for (let i = 0; i < n; i++) {
          result += options.fn({ index: i, count: i + 1 });
        }
        return result;
      },

      // Index helpers for loops
      increment: (value: number) => (value || 0) + 1,
      isFirst: (index: number) => index === 0,
      isLast: (index: number, array: unknown[]) =>
        Array.isArray(array) ? index === array.length - 1 : false,
      isEven: (index: number) => index % 2 === 0,
      isOdd: (index: number) => index % 2 !== 0,

      // Debug helper
      debug: (value: unknown) => {
        console.log('Handlebars Debug:', JSON.stringify(value, null, 2));
        return '';
      },

      // JSON helper
      json: (obj: unknown) => JSON.stringify(obj),

      // String manipulation helpers
      replace: (str: string, search: string, replace: string) => {
        if (!str) return '';
        return str.toString().replace(new RegExp(search, 'g'), replace);
      },

      // URL encoding helper
      encodeURI: (str: string) => encodeURIComponent(str || ''),

      // Base64 encoding helper
      base64: (str: string) =>
        Buffer.from(str || '', 'utf8').toString('base64'),

      // Logo helper - resolves file_id to base64 data URL
      // This will be injected with actual file data at render time by PdfTemplateService
      logo: (fileId: string, _options?: unknown) => {
        // Placeholder - actual implementation will be injected by PdfTemplateService
        // Returns a data URL format: data:image/png;base64,<base64_data>
        return `__LOGO_${fileId}__`; // Marker for replacement
      },

      // Generic asset helper (images, icons, etc.)
      // Behaves like logo helper but supports any uploaded asset
      asset: function (this: unknown, fileId: string, _options?: unknown) {
        // Handle both direct string literal and variable from context
        const resolvedFileId = typeof fileId === 'string' ? fileId : undefined;

        return `__ASSET_${resolvedFileId}__`;
      },
    };
  }

  /**
   * Register all helpers with Handlebars
   */
  private registerHelpers(): void {
    Object.entries(this.helpers).forEach(([name, helper]) => {
      Handlebars.registerHelper(name, helper);
    });

    // Register block helpers
    Handlebars.registerHelper(
      'each_with_index',
      function (context: unknown[], options: HelperOptions) {
        let result = '';
        for (let i = 0; i < context.length; i++) {
          const item = context[i];
          const data =
            typeof item === 'object' && item !== null && !Array.isArray(item)
              ? { ...(item as Record<string, unknown>) }
              : { value: item };

          // Add index metadata
          Object.assign(data, {
            '@index': i,
            '@first': i === 0,
            '@last': i === context.length - 1,
            '@even': i % 2 === 0,
            '@odd': i % 2 !== 0,
          });

          result += options.fn(data);
        }
        return result;
      },
    );

    // Group by helper
    Handlebars.registerHelper(
      'groupBy',
      function (context: unknown, key: string, options: HelperOptions) {
        if (!Array.isArray(context)) {
          return '';
        }

        const grouped = context.reduce<Record<string, unknown[]>>(
          (groups, item) => {
            if (
              typeof item === 'object' &&
              item !== null &&
              !Array.isArray(item)
            ) {
              const record = item as Record<string, unknown>;
              const groupKey = String(record[key] ?? 'Unknown');
              groups[groupKey] = groups[groupKey] || [];
              groups[groupKey].push(record);
              return groups;
            }

            const fallbackGroup = 'Unknown';
            groups[fallbackGroup] = groups[fallbackGroup] || [];
            groups[fallbackGroup].push(item);
            return groups;
          },
          {},
        );

        let result = '';
        Object.entries(grouped).forEach(([groupName, items]) => {
          result += options.fn({ groupName, items });
        });
        return result;
      },
    );
  }

  /**
   * Compile a template and cache it
   */
  compileTemplate(
    templateId: string,
    templateName: string,
    templateData: PdfTemplateData,
    version: string = '1.0.0',
  ): CompiledTemplate {
    const cacheKey = `${templateId}_${version}`;

    // Check cache first
    if (this.compiledTemplates.has(cacheKey)) {
      const cached = this.compiledTemplates.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Check if templateData is a string (Handlebars template string)
      if (typeof templateData === 'string') {
        // Compile the entire string as a Handlebars template
        const compiledTemplate = Handlebars.compile(templateData);

        const compiled: CompiledTemplate = {
          templateId,
          templateName,
          version,
          compiledContent: compiledTemplate,
          styles: {},
          pageSettings: {
            size: 'A4',
            orientation: 'portrait',
            margins: [40, 60, 40, 60],
          },
          compiledAt: new Date(),
        };

        this.compiledTemplates.set(cacheKey, compiled);
        return compiled;
      }

      // Deep clone the template data to avoid modifying original
      const templateDataCopy = JSON.parse(JSON.stringify(templateData));

      // Compile the content recursively
      const compiledContent = this.compileObject(templateDataCopy.content);

      const compiled: CompiledTemplate = {
        templateId,
        templateName,
        version,
        compiledContent,
        styles: templateDataCopy.styles,
        pageSettings: {
          size: templateDataCopy.pageSize || 'A4',
          orientation: templateDataCopy.pageOrientation || 'portrait',
          margins: templateDataCopy.pageMargins || [40, 60, 40, 60],
        },
        compiledAt: new Date(),
      };

      // Cache the compiled template
      this.compiledTemplates.set(cacheKey, compiled);

      return compiled;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown compilation error';
      throw new Error(`Template compilation failed: ${message}`);
    }
  }

  /**
   * Recursively compile Handlebars templates in objects and arrays
   */
  private compileObject(obj: unknown): unknown {
    if (typeof obj === 'string') {
      // Only compile if string contains Handlebars syntax
      if (obj.includes('{{') || obj.includes('{{{')) {
        try {
          return Handlebars.compile(obj);
        } catch (error) {
          console.warn(`Failed to compile template string: ${obj}`, error);
          return obj; // Return original string if compilation fails
        }
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.compileObject(item));
    }

    if (obj && typeof obj === 'object') {
      const record = obj as Record<string, unknown>;
      // Handle special __handlebarsBody pattern
      // This is used for table bodies where Handlebars needs to generate array items
      if (typeof record.__handlebarsBody === 'string') {
        // Replace placeholder with the handlebars body string
        const compiled: Record<string, unknown> = {};
        Object.keys(record).forEach((key) => {
          if (key === '__handlebarsBody') {
            // Skip the __handlebarsBody key in the compiled output
            return;
          }

          const value = record[key];
          // Replace placeholder with the actual handlebars body
          if (value === '__HANDLEBARS_BODY_PLACEHOLDER__') {
            compiled[key] = this.compileObject(record.__handlebarsBody);
          } else {
            compiled[key] = this.compileObject(value);
          }
        });
        return compiled;
      }

      // Normal object compilation
      const compiled: Record<string, unknown> = {};
      Object.keys(record).forEach((key) => {
        const value = record[key];
        compiled[key] = this.compileObject(value);
      });
      return compiled;
    }

    return obj;
  }

  /**
   * Render a compiled template with data
   */
  renderTemplate(compiled: CompiledTemplate, data: JsonObject): JsonObject {
    try {
      // Use data context as-is (helpers are already registered globally)
      const contextData: JsonObject = { ...data };

      // Check if compiledContent is a function (string-based template)
      if (typeof compiled.compiledContent === 'function') {
        // Render the Handlebars template to get JSON string
        const renderedString = compiled.compiledContent(contextData);

        console.log(
          '[Handlebars] Rendered string (first 500 chars):',
          renderedString.substring(0, 500),
        );

        // Parse the rendered JSON string
        let parsedJson: JsonObject;
        try {
          parsedJson = JSON.parse(renderedString) as JsonObject;
        } catch (parseError) {
          const message =
            parseError instanceof Error
              ? parseError.message
              : 'Unknown parse error';
          console.error('[Handlebars] JSON parse error:', parseError);
          console.error(
            '[Handlebars] Invalid JSON:',
            renderedString.substring(0, 1000),
          );
          throw new Error(
            `Failed to parse rendered template as JSON: ${message}`,
          );
        }

        // Return the complete document definition
        return {
          pageSize: compiled.pageSettings.size,
          pageOrientation: compiled.pageSettings.orientation,
          pageMargins: compiled.pageSettings.margins,
          ...parsedJson, // Spread the parsed JSON which should contain content, styles, etc.
          defaultStyle: (parsedJson.defaultStyle as JsonObject) || {
            fontSize: 10,
            font: 'Sarabun',
            lineHeight: 1.3,
          },
        };
      }

      // Object-based template (old method)
      const rendered = this.renderObject(
        compiled.compiledContent,
        contextData,
      ) as JsonObject;

      // Return the complete document definition
      return {
        pageSize: compiled.pageSettings.size,
        pageOrientation: compiled.pageSettings.orientation,
        pageMargins: compiled.pageSettings.margins,
        content: rendered,
        styles: (compiled.styles as JsonObject) || {},
        defaultStyle: {
          fontSize: 10,
          font: 'Sarabun', // Default to Thai font for better Thai text support
          lineHeight: 1.3,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown rendering error';
      throw new Error(`Template rendering failed: ${message}`);
    }
  }

  /**
   * Recursively render compiled objects with data
   */
  private renderObject(obj: unknown, data: JsonObject): unknown {
    if (typeof obj === 'function') {
      // This is a compiled Handlebars template
      try {
        const templateFn = obj as TemplateDelegate;
        const renderedValue = templateFn(data);

        if (typeof renderedValue === 'string') {
          try {
            return JSON.parse(renderedValue);
          } catch {
            return renderedValue;
          }
        }

        return renderedValue;
      } catch (error) {
        console.warn('Failed to render template function:', error);
        return '';
      }
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.renderObject(item, data));
    }

    if (obj && typeof obj === 'object') {
      const record = obj as Record<string, unknown>;
      const rendered: Record<string, unknown> = {};
      Object.keys(record).forEach((key) => {
        rendered[key] = this.renderObject(record[key], data);
      });
      return rendered;
    }

    return obj;
  }

  /**
   * Validate a template for syntax errors
   */
  validateTemplate(templateData: PdfTemplateData): TemplateValidationResult {
    const result: TemplateValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    try {
      // If templateData is a string (Handlebars template)
      if (typeof templateData === 'string') {
        // Skip validation for Handlebars templates
        // They will be validated at compile/render time
        result.warnings.push(
          'Template is a Handlebars string - validation skipped, will be validated at render time',
        );
        return result;
      }

      // For object templates, validate as before
      const parsedData = templateData;

      // Try to compile the template
      const testCompiled = this.compileObject(parsedData.content);

      // Try to render with empty data to catch runtime errors
      const testData: JsonObject = {};
      this.renderObject(testCompiled, testData);

      result.compiledSize = JSON.stringify(testCompiled).length;

      // Add warnings for potential issues
      const templateString = JSON.stringify(parsedData);

      if (templateString.includes('{{#each')) {
        result.warnings.push(
          'Template contains loops - ensure data arrays are not too large',
        );
      }

      if (templateString.includes('{{{')) {
        result.warnings.push(
          'Template contains triple-brace syntax - ensure data is safe',
        );
      }

      if (result.compiledSize > 1000000) {
        // 1MB
        result.warnings.push(
          'Compiled template size is large - consider optimization',
        );
      }
    } catch (error) {
      result.isValid = false;
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push(message);
    }

    return result;
  }

  /**
   * Clear template cache
   */
  clearCache(templateId?: string): void {
    if (templateId) {
      // Clear specific template from cache
      const keysToDelete = Array.from(this.compiledTemplates.keys()).filter(
        (key) => key.startsWith(templateId),
      );
      keysToDelete.forEach((key) => this.compiledTemplates.delete(key));
    } else {
      // Clear all cache
      this.compiledTemplates.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalTemplates: number;
    totalSize: number;
    templates: string[];
  } {
    const templates = Array.from(this.compiledTemplates.keys());
    const totalSize = templates.reduce((size, key) => {
      const template = this.compiledTemplates.get(key);
      return size + (template ? JSON.stringify(template).length : 0);
    }, 0);

    return {
      totalTemplates: templates.length,
      totalSize,
      templates,
    };
  }

  /**
   * Register custom helper
   */
  registerCustomHelper(name: string, helper: Handlebars.HelperDelegate): void {
    this.helpers[name] = helper;
    Handlebars.registerHelper(name, helper);
  }

  /**
   * Get all available helpers
   */
  getAvailableHelpers(): string[] {
    return Object.keys(this.helpers);
  }
}
