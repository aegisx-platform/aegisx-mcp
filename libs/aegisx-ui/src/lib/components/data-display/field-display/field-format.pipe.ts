import { Pipe, PipeTransform } from '@angular/core';
import { FieldType, FieldFormatOptions } from './field-display.types';

/**
 * Pipe for formatting field values based on their type
 *
 * @example
 * ```html
 * <!-- Date formatting -->
 * <span>{{ user.birthDate | axFieldFormat:'date' }}</span>
 *
 * <!-- Currency formatting -->
 * <span>{{ product.price | axFieldFormat:'currency':{ currency: 'THB' } }}</span>
 *
 * <!-- Number formatting -->
 * <span>{{ stats.value | axFieldFormat:'number':{ decimals: 2 } }}</span>
 * ```
 */
@Pipe({
  name: 'axFieldFormat',
  standalone: true,
})
export class AxFieldFormatPipe implements PipeTransform {
  transform(
    value: unknown,
    type: FieldType = 'text',
    options?: FieldFormatOptions,
  ): string {
    // Handle null, undefined, or empty values
    if (value === null || value === undefined || value === '') {
      return '';
    }

    // Apply formatting based on type
    switch (type) {
      case 'text':
        return this.formatText(value);

      case 'date':
        return this.formatDate(value, options);

      case 'datetime':
        return this.formatDateTime(value, options);

      case 'time':
        return this.formatTime(value, options);

      case 'currency':
        return this.formatCurrency(value, options);

      case 'number':
        return this.formatNumber(value, options);

      case 'percentage':
        return this.formatPercentage(value, options);

      case 'email':
        return this.formatText(value); // HTML template will handle link

      case 'phone':
        return this.formatPhone(value);

      case 'url':
        return this.formatText(value); // HTML template will handle link

      case 'boolean':
        return this.formatBoolean(value, options);

      default:
        return this.formatText(value);
    }
  }

  private formatText(value: unknown): string {
    return String(value);
  }

  private formatDate(value: unknown, options?: FieldFormatOptions): string {
    const date = this.parseDate(value);
    if (!date) return this.formatText(value);

    const locale = options?.locale || 'th-TH';
    const dateFormat = options?.dateFormat || 'medium';

    let formatOptions: Intl.DateTimeFormatOptions;

    switch (dateFormat) {
      case 'short':
        formatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        break;
      case 'medium':
        formatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
        break;
      case 'long':
        formatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        break;
      case 'full':
        formatOptions = {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        };
        break;
      default:
        formatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    }

    return new Intl.DateTimeFormat(locale, formatOptions).format(date);
  }

  private formatDateTime(value: unknown, options?: FieldFormatOptions): string {
    const date = this.parseDate(value);
    if (!date) return this.formatText(value);

    const timeFormat = options?.timeFormat || '24h';

    const dateStr = this.formatDate(value, options);
    const timeStr = this.formatTime(date, { ...options, timeFormat });

    return `${dateStr}, ${timeStr}`;
  }

  private formatTime(value: unknown, options?: FieldFormatOptions): string {
    const date = this.parseDate(value);
    if (!date) return this.formatText(value);

    const locale = options?.locale || 'th-TH';
    const timeFormat = options?.timeFormat || '24h';

    const formatOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    };

    return new Intl.DateTimeFormat(locale, formatOptions).format(date);
  }

  private formatCurrency(value: unknown, options?: FieldFormatOptions): string {
    const number = this.parseNumber(value);
    if (number === null) return this.formatText(value);

    const locale = options?.locale || 'th-TH';
    const currency = options?.currency || 'THB';
    const decimals = options?.decimals ?? 2;

    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);

    return this.applyPrefixSuffix(formatted, options);
  }

  private formatNumber(value: unknown, options?: FieldFormatOptions): string {
    const number = this.parseNumber(value);
    if (number === null) return this.formatText(value);

    const locale = options?.locale || 'th-TH';
    const decimals = options?.decimals ?? 2;

    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);

    return this.applyPrefixSuffix(formatted, options);
  }

  private formatPercentage(
    value: unknown,
    options?: FieldFormatOptions,
  ): string {
    const number = this.parseNumber(value);
    if (number === null) return this.formatText(value);

    const locale = options?.locale || 'th-TH';
    const decimals = options?.decimals ?? 1;

    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);

    return `${formatted}%`;
  }

  private formatPhone(value: unknown): string {
    const phone = String(value).replace(/\D/g, ''); // Remove non-digits

    // Thai phone number format: 099-999-9999
    if (phone.length === 10) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    }

    // International format: +66-99-999-9999
    if (phone.length > 10) {
      return `+${phone.slice(0, 2)}-${phone.slice(2, 4)}-${phone.slice(4, 7)}-${phone.slice(7)}`;
    }

    return String(value);
  }

  private formatBoolean(value: unknown, options?: FieldFormatOptions): string {
    const boolValue = Boolean(value);
    const format = options?.booleanFormat || 'yes-no';

    switch (format) {
      case 'yes-no':
        return boolValue ? 'Yes' : 'No';
      case 'true-false':
        return boolValue ? 'True' : 'False';
      case 'on-off':
        return boolValue ? 'On' : 'Off';
      default:
        return boolValue ? 'Yes' : 'No';
    }
  }

  private parseDate(value: unknown): Date | null {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  private parseNumber(value: unknown): number | null {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const number = parseFloat(value);
      return isNaN(number) ? null : number;
    }

    return null;
  }

  private applyPrefixSuffix(
    value: string,
    options?: FieldFormatOptions,
  ): string {
    let result = value;

    if (options?.prefix) {
      result = `${options.prefix}${result}`;
    }

    if (options?.suffix) {
      result = `${result}${options.suffix}`;
    }

    return result;
  }
}
