/**
 * Standardized Logger Utility
 *
 * Provides consistent logging across the application with:
 * - Log levels (DEBUG, INFO, WARN, ERROR, SUCCESS)
 * - Color coding
 * - Component namespacing
 * - Performance timing
 * - Grouped output with indentation
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

interface LogColors {
  reset: string;
  debug: string;
  info: string;
  warn: string;
  error: string;
  success: string;
  dim: string;
}

const colors: LogColors = {
  reset: '\x1b[0m',
  debug: '\x1b[90m', // Gray
  info: '\x1b[36m', // Cyan
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  success: '\x1b[32m', // Green
  dim: '\x1b[2m', // Dim
};

export interface LoggerOptions {
  component: string;
  enableColors?: boolean;
  enableTimestamps?: boolean;
  minLevel?: LogLevel;
  indent?: number;
}

export class Logger {
  private component: string;
  private enableColors: boolean;
  private enableTimestamps: boolean;
  private minLevel: LogLevel;
  private indent: number;
  private static isDevelopment = process.env.NODE_ENV === 'development';

  // Log level hierarchy
  private static levelPriority: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
    [LogLevel.SUCCESS]: 1,
  };

  constructor(options: LoggerOptions) {
    this.component = options.component;
    this.enableColors = options.enableColors ?? true;
    this.enableTimestamps = options.enableTimestamps ?? false;
    this.minLevel =
      options.minLevel ??
      (Logger.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO);
    this.indent = options.indent ?? 0;
  }

  /**
   * Create child logger with increased indentation
   */
  child(component: string, additionalIndent = 3): Logger {
    return new Logger({
      component: `${this.component}:${component}`,
      enableColors: this.enableColors,
      enableTimestamps: this.enableTimestamps,
      minLevel: this.minLevel,
      indent: this.indent + additionalIndent,
    });
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return Logger.levelPriority[level] >= Logger.levelPriority[this.minLevel];
  }

  /**
   * Format log message with consistent structure
   */
  private format(level: LogLevel, message: string, meta?: any): string {
    const parts: string[] = [];

    // Indentation
    if (this.indent > 0) {
      parts.push(' '.repeat(this.indent));
    }

    // Level with color
    const levelColor = this.getLevelColor(level);
    const levelStr = this.enableColors
      ? `${levelColor}[${level.padEnd(7)}]${colors.reset}`
      : `[${level.padEnd(7)}]`;
    parts.push(levelStr);

    // Component
    const componentStr = this.enableColors
      ? `${colors.dim}[${this.component}]${colors.reset}`
      : `[${this.component}]`;
    parts.push(componentStr);

    // Message
    parts.push(message);

    // Metadata
    if (meta) {
      if (typeof meta === 'object' && !Array.isArray(meta)) {
        const metaStr = Object.entries(meta)
          .map(([k, v]) => `${k}=${v}`)
          .join(' ');
        parts.push(
          this.enableColors
            ? `${colors.dim}(${metaStr})${colors.reset}`
            : `(${metaStr})`,
        );
      } else {
        parts.push(
          this.enableColors
            ? `${colors.dim}(${meta})${colors.reset}`
            : `(${meta})`,
        );
      }
    }

    // Timestamp (optional)
    if (this.enableTimestamps) {
      const timestamp = new Date().toISOString();
      parts.push(
        this.enableColors
          ? `${colors.dim}[${timestamp}]${colors.reset}`
          : `[${timestamp}]`,
      );
    }

    return parts.join(' ');
  }

  /**
   * Get color for log level
   */
  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return colors.debug;
      case LogLevel.INFO:
        return colors.info;
      case LogLevel.WARN:
        return colors.warn;
      case LogLevel.ERROR:
        return colors.error;
      case LogLevel.SUCCESS:
        return colors.success;
      default:
        return colors.reset;
    }
  }

  /**
   * Log methods
   */
  debug(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.format(LogLevel.DEBUG, message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.format(LogLevel.INFO, message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.format(LogLevel.WARN, message, meta));
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formatted = this.format(LogLevel.ERROR, message);
      console.error(formatted);

      if (error) {
        if (error instanceof Error) {
          console.error(error.stack);
        } else {
          console.error(error);
        }
      }
    }
  }

  success(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.SUCCESS)) {
      console.log(this.format(LogLevel.SUCCESS, message, meta));
    }
  }

  /**
   * Timing utilities
   */
  startTimer(): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      return duration;
    };
  }

  time(message: string, fn: () => any): any;
  time(message: string, fn: () => Promise<any>): Promise<any>;
  time(message: string, fn: () => any): any {
    const timer = this.startTimer();
    const result = fn();

    if (result instanceof Promise) {
      return result.then((res) => {
        const duration = timer();
        this.info(`${message} completed`, { duration: `${duration}ms` });
        return res;
      });
    } else {
      const duration = timer();
      this.info(`${message} completed`, { duration: `${duration}ms` });
      return result;
    }
  }

  /**
   * Group logging
   */
  group(title: string, fn: () => void): void;
  group(title: string, fn: () => Promise<void>): Promise<void>;
  group(title: string, fn: () => any): any {
    this.info(`${title}...`);

    const childLogger = this.child('', 3);
    const result = fn();

    if (result instanceof Promise) {
      return result.then(() => {
        this.success(`${title} completed`);
      });
    } else {
      this.success(`${title} completed`);
      return result;
    }
  }

  /**
   * Separator lines
   */
  separator(char = '─', length = 60): void {
    console.log(char.repeat(length));
  }

  /**
   * Pretty print object
   */
  object(obj: any, title?: string): void {
    if (title) {
      this.info(title);
    }
    console.log(JSON.stringify(obj, null, 2));
  }

  /**
   * Table output
   */
  table(data: any[]): void {
    console.table(data);
  }
}

/**
 * Factory function for creating loggers
 */
export function createLogger(
  component: string,
  options?: Partial<LoggerOptions>,
): Logger {
  return new Logger({
    component,
    ...options,
  });
}

/**
 * Global logger instances for common components
 */
export const BootstrapLogger = createLogger('Bootstrap');
export const PluginLogger = createLogger('Plugin');
export const DatabaseLogger = createLogger('Database');
export const AuthLogger = createLogger('Auth');
