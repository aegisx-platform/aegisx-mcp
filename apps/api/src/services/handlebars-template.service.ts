import * as Handlebars from 'handlebars';
import moment from 'moment';
import { 
  HandlebarsHelpers, 
  CompiledTemplate, 
  PdfTemplateData,
  TemplateValidationResult 
} from '../types/pdf-template.types';

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
      formatCurrency: (amount: number, currency: string = 'THB', locale: string = 'th-TH') => {
        if (typeof amount !== 'number') return '0.00';
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 2
        }).format(amount);
      },

      // Number formatting helper
      formatNumber: (num: number, decimals: number = 0, locale: string = 'th-TH') => {
        if (typeof num !== 'number') return '0';
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
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
      default: (value: any, defaultValue: any = '') => {
        return value !== null && value !== undefined && value !== '' ? value : defaultValue;
      },

      // Comparison helpers
      eq: (a: any, b: any) => a === b,
      gt: (a: any, b: any) => a > b,
      lt: (a: any, b: any) => a < b,
      gte: (a: any, b: any) => a >= b,
      lte: (a: any, b: any) => a <= b,
      ne: (a: any, b: any) => a !== b,

      // Logical helpers
      or: (...args: any[]) => {
        // Remove the last argument which is Handlebars options object
        const values = args.slice(0, -1);
        return values.some(val => !!val);
      },
      
      and: (...args: any[]) => {
        // Remove the last argument which is Handlebars options object
        const values = args.slice(0, -1);
        return values.every(val => !!val);
      },

      not: (value: any) => !value,

      // Math helpers
      add: (a: number, b: number) => (a || 0) + (b || 0),
      subtract: (a: number, b: number) => (a || 0) - (b || 0),
      multiply: (a: number, b: number) => (a || 0) * (b || 0),
      divide: (a: number, b: number) => b !== 0 ? (a || 0) / b : 0,
      
      // Math functions
      round: (num: number, decimals: number = 0) => {
        const factor = Math.pow(10, decimals);
        return Math.round((num || 0) * factor) / factor;
      },
      
      ceil: (num: number) => Math.ceil(num || 0),
      floor: (num: number) => Math.floor(num || 0),
      
      // Array helpers
      length: (arr: any[]) => Array.isArray(arr) ? arr.length : 0,
      
      join: (arr: any[], separator: string = ', ') => {
        return Array.isArray(arr) ? arr.join(separator) : '';
      },

      // Array access helper
      at: (arr: any[], index: number) => {
        return Array.isArray(arr) && arr[index] !== undefined ? arr[index] : null;
      },

      // Array filtering helper
      where: (arr: any[], key: string, value: any) => {
        if (!Array.isArray(arr)) return [];
        return arr.filter(item => item && item[key] === value);
      },

      // Thai-specific helpers
      formatThaiCurrency: (amount: number) => {
        if (typeof amount !== 'number') return '0.00 บาท';
        const formatted = new Intl.NumberFormat('th-TH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(amount);
        return formatted + ' บาท';
      },

      // Convert number to Thai text (simplified version)
      numberToThaiText: (num: number) => {
        // This is a simplified version - in production, use a proper Thai number conversion library
        const thaiNumbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
        if (num >= 0 && num <= 9) {
          return thaiNumbers[num];
        }
        return num.toString(); // Fallback for complex numbers
      },

      // Conditional helpers
      ifCond: function(v1: any, operator: string, v2: any, options: any) {
        switch (operator) {
          case '==': return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===': return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '!=': return (v1 != v2) ? options.fn(this) : options.inverse(this);
          case '!==': return (v1 !== v2) ? options.fn(this) : options.inverse(this);
          case '<': return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=': return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>': return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=': return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&': return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||': return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default: return options.inverse(this);
        }
      },

      // Loop helpers
      times: function(n: number, options: any) {
        let result = '';
        for (let i = 0; i < n; i++) {
          result += options.fn({ index: i, count: i + 1 });
        }
        return result;
      },

      // Index helpers for loops
      increment: (value: number) => (value || 0) + 1,
      isFirst: (index: number) => index === 0,
      isLast: (index: number, array: any[]) => index === (array.length - 1),
      isEven: (index: number) => index % 2 === 0,
      isOdd: (index: number) => index % 2 !== 0,

      // Debug helper
      debug: (value: any) => {
        console.log('Handlebars Debug:', JSON.stringify(value, null, 2));
        return '';
      },

      // JSON helper
      json: (obj: any) => JSON.stringify(obj),
      
      // String manipulation helpers
      replace: (str: string, search: string, replace: string) => {
        if (!str) return '';
        return str.toString().replace(new RegExp(search, 'g'), replace);
      },

      // URL encoding helper
      encodeURI: (str: string) => encodeURIComponent(str || ''),
      
      // Base64 encoding helper
      base64: (str: string) => Buffer.from(str || '', 'utf8').toString('base64'),
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
    Handlebars.registerHelper('each_with_index', function(context: any[], options: any) {
      let result = '';
      for (let i = 0; i < context.length; i++) {
        const data = {
          ...context[i],
          '@index': i,
          '@first': i === 0,
          '@last': i === context.length - 1,
          '@even': i % 2 === 0,
          '@odd': i % 2 !== 0
        };
        result += options.fn(data);
      }
      return result;
    });

    // Group by helper
    Handlebars.registerHelper('groupBy', function(context: any[], key: string, options: any) {
      if (!Array.isArray(context)) return '';
      
      const grouped = context.reduce((groups, item) => {
        const group = item[key] || 'Unknown';
        if (!groups[group]) groups[group] = [];
        groups[group].push(item);
        return groups;
      }, {});

      let result = '';
      Object.entries(grouped).forEach(([groupName, items]) => {
        result += options.fn({ groupName, items });
      });
      return result;
    });
  }

  /**
   * Compile a template and cache it
   */
  compileTemplate(templateId: string, templateName: string, templateData: PdfTemplateData, version: string = '1.0.0'): CompiledTemplate {
    const cacheKey = `${templateId}_${version}`;
    
    // Check cache first
    if (this.compiledTemplates.has(cacheKey)) {
      return this.compiledTemplates.get(cacheKey)!;
    }

    try {
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
          margins: templateDataCopy.pageMargins || [40, 60, 40, 60]
        },
        compiledAt: new Date()
      };

      // Cache the compiled template
      this.compiledTemplates.set(cacheKey, compiled);
      
      return compiled;
    } catch (error) {
      throw new Error(`Template compilation failed: ${error.message}`);
    }
  }

  /**
   * Recursively compile Handlebars templates in objects and arrays
   */
  private compileObject(obj: any): any {
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
      return obj.map(item => this.compileObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const compiled = {};
      Object.keys(obj).forEach(key => {
        compiled[key] = this.compileObject(obj[key]);
      });
      return compiled;
    }
    
    return obj;
  }

  /**
   * Render a compiled template with data
   */
  renderTemplate(compiled: CompiledTemplate, data: Record<string, any>): any {
    try {
      // Add helper functions to data context
      const contextData = {
        ...data,
        helpers: this.helpers
      };

      // Render the compiled content
      const rendered = this.renderObject(compiled.compiledContent, contextData);

      // Return the complete document definition
      return {
        pageSize: compiled.pageSettings.size,
        pageOrientation: compiled.pageSettings.orientation,
        pageMargins: compiled.pageSettings.margins,
        content: rendered,
        styles: compiled.styles || {},
        defaultStyle: {
          fontSize: 10,
          font: 'THSarabun', // Default to Thai font for better Thai text support
          lineHeight: 1.3
        }
      };
    } catch (error) {
      throw new Error(`Template rendering failed: ${error.message}`);
    }
  }

  /**
   * Recursively render compiled objects with data
   */
  private renderObject(obj: any, data: Record<string, any>): any {
    if (typeof obj === 'function') {
      // This is a compiled Handlebars template
      try {
        const result = obj(data);
        // Try to parse as JSON in case it's a JSON string
        try {
          return JSON.parse(result);
        } catch {
          return result;
        }
      } catch (error) {
        console.warn('Failed to render template function:', error);
        return '';
      }
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.renderObject(item, data));
    }
    
    if (obj && typeof obj === 'object') {
      const rendered = {};
      Object.keys(obj).forEach(key => {
        rendered[key] = this.renderObject(obj[key], data);
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
      warnings: []
    };

    try {
      // Try to compile the template
      const testCompiled = this.compileObject(templateData.content);
      
      // Try to render with empty data to catch runtime errors
      const testData = {};
      this.renderObject(testCompiled, testData);
      
      result.compiledSize = JSON.stringify(testCompiled).length;
      
      // Add warnings for potential issues
      const templateString = JSON.stringify(templateData);
      
      if (templateString.includes('{{#each')) {
        result.warnings.push('Template contains loops - ensure data arrays are not too large');
      }
      
      if (templateString.includes('{{{')) {
        result.warnings.push('Template contains triple-brace syntax - ensure data is safe');
      }
      
      if (result.compiledSize > 1000000) { // 1MB
        result.warnings.push('Compiled template size is large - consider optimization');
      }
      
    } catch (error) {
      result.isValid = false;
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Clear template cache
   */
  clearCache(templateId?: string): void {
    if (templateId) {
      // Clear specific template from cache
      const keysToDelete = Array.from(this.compiledTemplates.keys())
        .filter(key => key.startsWith(templateId));
      keysToDelete.forEach(key => this.compiledTemplates.delete(key));
    } else {
      // Clear all cache
      this.compiledTemplates.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { totalTemplates: number; totalSize: number; templates: string[] } {
    const templates = Array.from(this.compiledTemplates.keys());
    const totalSize = templates.reduce((size, key) => {
      const template = this.compiledTemplates.get(key);
      return size + (template ? JSON.stringify(template).length : 0);
    }, 0);

    return {
      totalTemplates: templates.length,
      totalSize,
      templates
    };
  }

  /**
   * Register custom helper
   */
  registerCustomHelper(name: string, helper: any): void {
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