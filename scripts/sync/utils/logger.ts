/**
 * Logger Utility
 * Simple logging utility for sync operations with different log levels
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  level: LogLevel;
  verbose?: boolean;
}

class Logger {
  private level: LogLevel = 'info';
  private verbose: boolean = false;
  private readonly levels = { debug: 0, info: 1, warn: 2, error: 3 };

  constructor(config?: LoggerConfig) {
    if (config) {
      this.level = config.level;
      this.verbose = config.verbose ?? false;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.level];
  }

  private timestamp(): string {
    return new Date().toISOString();
  }

  log(message: string): void {
    this.info(message);
  }

  debug(message: string): void {
    if (this.shouldLog('debug')) {
      if (this.verbose) {
        console.log(`[DEBUG] ${this.timestamp()} ${message}`);
      }
    }
  }

  info(message: string): void {
    if (this.shouldLog('info')) {
      console.log(`${message}`);
    }
  }

  warn(message: string): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`);
    }
  }

  error(message: string): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`);
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }
}

export const logger = new Logger({ level: 'info', verbose: false });
