# Logging Standard

> Standardized logging guidelines for consistent, readable, and maintainable application logs

## Overview

This document defines the logging standard for the AegisX Platform. All code MUST follow these guidelines to ensure consistent log output across the application.

---

## Quick Reference

### Good vs Bad Examples

#### ❌ BAD - Inconsistent Format

```typescript
console.log('[EMAIL_SERVICE] Environment check:', {...});
console.log('✅ Font Manager initialized');
this.logger.log('[ImportDiscovery] Starting service discovery...');
console.log(`      ✅ infrastructure completed - 5/5 plugins (5ms)`);
```

#### ✅ GOOD - Standardized Format

```typescript
logger.info('Environment configuration loaded', { smtp: 'configured' });
logger.success('Font manager initialized', { fonts: 4 });
logger.info('Service discovery starting');
logger.success('Infrastructure plugins loaded', { count: 5, duration: '5ms' });
```

---

## Log Levels

Use appropriate log levels based on message importance:

| Level     | When to Use                                           | Console Method     |
| --------- | ----------------------------------------------------- | ------------------ |
| `DEBUG`   | Development details, verbose output                   | `logger.debug()`   |
| `INFO`    | Normal operations, informational messages             | `logger.info()`    |
| `WARN`    | Warnings, fallback behaviors, missing optional config | `logger.warn()`    |
| `ERROR`   | Errors, failures, exceptions                          | `logger.error()`   |
| `SUCCESS` | Successful completions, milestones                    | `logger.success()` |

### Examples

```typescript
// DEBUG - Verbose development info
logger.debug('Scanning directory', { path: '/apps/api/src' });

// INFO - Normal operations
logger.info('Loading configuration files');
logger.info('Environment variables loaded', { count: 27 });

// WARN - Non-critical issues
logger.warn('SMTP credentials not configured, using console fallback');
logger.warn('Redis connection failed, using in-memory cache');

// ERROR - Failures
logger.error('Failed to load plugin', error);
logger.error('Database connection timeout');

// SUCCESS - Completions
logger.success('Bootstrap completed', { duration: '12038ms' });
logger.success('All plugins loaded', { count: 42 });
```

---

## Log Format

### Standard Format

```
[LEVEL  ] [Component] Message (metadata)
```

### Components

1. **Level** - 7 characters, left-aligned (e.g., `INFO   `, `WARN   `)
2. **Component** - Service/module name (e.g., `Bootstrap`, `EmailService`)
3. **Message** - Clear, concise description
4. **Metadata** - Optional key-value pairs in parentheses

### Examples

```
[INFO   ] [Bootstrap] Starting application...
[INFO   ] [Environment] Loaded & validated (duration=5ms)
[WARN   ] [EmailService] No SMTP credentials, using console logging
[SUCCESS] [Plugin] Infrastructure plugins loaded (count=5 duration=10ms)
[ERROR  ] [Database] Connection failed (host=localhost port=5432)
```

---

## Using the Logger

### 1. Create Logger Instance

```typescript
import { createLogger } from '../shared/utils/logger.util';

// Component-level logger
const logger = createLogger('EmailService');

// Or use predefined loggers
import { BootstrapLogger, PluginLogger } from '../shared/utils/logger.util';
```

### 2. Basic Logging

```typescript
// Simple message
logger.info('Service initialized');

// With metadata
logger.info('Configuration loaded', { count: 10, source: '.env' });

// Error with stack trace
logger.error('Failed to connect', error);
```

### 3. Child Loggers (Indentation)

```typescript
const logger = createLogger('Bootstrap');
logger.info('Starting application');

// Create child logger with indentation
const envLogger = logger.child('Environment');
envLogger.info('Loading .env files');
envLogger.success('Environment validated');

// Output:
// [INFO   ] [Bootstrap] Starting application
//    [INFO   ] [Bootstrap:Environment] Loading .env files
//    [SUCCESS] [Bootstrap:Environment] Environment validated
```

### 4. Timing Operations

```typescript
// Method 1: Manual timing
const timer = logger.startTimer();
await doSomething();
const duration = timer();
logger.info('Operation completed', { duration: `${duration}ms` });

// Method 2: Automatic timing
await logger.time('Loading plugins', async () => {
  await loadAllPlugins();
});
// Output: [INFO] [Component] Loading plugins completed (duration=100ms)
```

### 5. Grouping Logs

```typescript
logger.info('Bootstrap process starting');

const pluginLogger = logger.child('Plugins');
pluginLogger.info('Loading infrastructure plugins');
pluginLogger.success('Infrastructure plugins loaded', { count: 5 });

logger.success('Bootstrap completed');

// Output:
// [INFO   ] [Bootstrap] Bootstrap process starting
//    [INFO   ] [Bootstrap:Plugins] Loading infrastructure plugins
//    [SUCCESS] [Bootstrap:Plugins] Infrastructure plugins loaded (count=5)
// [SUCCESS] [Bootstrap] Bootstrap completed
```

---

## Specific Component Guidelines

### Bootstrap Process

```typescript
import { BootstrapLogger as logger } from '../shared/utils/logger.util';

// Main phases
logger.info('Bootstrap starting');

const envLogger = logger.child('Environment');
envLogger.info('Loading environment variables');
envLogger.success('Environment validated', { duration: '5ms' });

const configLogger = logger.child('Config');
configLogger.info('Loading configurations');
configLogger.success('Configurations loaded', { duration: '10ms' });

logger.success('Bootstrap completed', { totalDuration: '12038ms' });
```

**Output:**

```
[INFO   ] [Bootstrap] Bootstrap starting
   [INFO   ] [Bootstrap:Environment] Loading environment variables
   [SUCCESS] [Bootstrap:Environment] Environment validated (duration=5ms)
   [INFO   ] [Bootstrap:Config] Loading configurations
   [SUCCESS] [Bootstrap:Config] Configurations loaded (duration=10ms)
[SUCCESS] [Bootstrap] Bootstrap completed (totalDuration=12038ms)
```

### Plugin Loading

```typescript
import { PluginLogger as logger } from '../shared/utils/logger.util';

logger.info('Loading plugin group', { name: 'infrastructure', count: 5 });

const timer = logger.startTimer();
await loadPlugins();
const duration = timer();

logger.success('Plugin group loaded', {
  name: 'infrastructure',
  count: 5,
  duration: `${duration}ms`,
});
```

### Service Initialization

```typescript
class EmailService {
  private logger = createLogger('EmailService');

  constructor() {
    this.logger.info('Initializing service');

    if (!this.hasSmtpConfig()) {
      this.logger.warn('No SMTP credentials, using console fallback');
    } else {
      this.logger.success('SMTP configured', { host: process.env.SMTP_HOST });
    }
  }

  async sendEmail(options: EmailOptions) {
    this.logger.debug('Sending email', { to: options.to, subject: options.subject });

    try {
      await this.transporter.sendMail(options);
      this.logger.success('Email sent', { to: options.to });
    } catch (error) {
      this.logger.error('Failed to send email', error);
    }
  }
}
```

---

## Common Patterns

### 1. Service Discovery Pattern

```typescript
const logger = createLogger('ImportDiscovery');

logger.info('Starting service discovery');

const scanLogger = logger.child('Scan');
scanLogger.info('Scanning directories');
const files = await scanForServices();
scanLogger.success('Found service files', { count: files.length });

const regLogger = logger.child('Registry');
regLogger.info('Registering services');
await registerServices(files);
regLogger.success('Services registered', { count: services.length });

logger.success('Discovery completed', { duration: '63ms' });
```

**Output:**

```
[INFO   ] [ImportDiscovery] Starting service discovery
   [INFO   ] [ImportDiscovery:Scan] Scanning directories
   [SUCCESS] [ImportDiscovery:Scan] Found service files (count=10)
   [INFO   ] [ImportDiscovery:Registry] Registering services
   [SUCCESS] [ImportDiscovery:Registry] Services registered (count=10)
[SUCCESS] [ImportDiscovery] Discovery completed (duration=63ms)
```

### 2. Font Loading Pattern

```typescript
class FontManagerService {
  private logger = createLogger('FontManager');
  private initialized = false;

  async initialize() {
    if (this.initialized) {
      this.logger.debug('Already initialized, skipping');
      return;
    }

    this.logger.info('Initializing font manager');

    try {
      await this.loadFonts();
      this.initialized = true;
      this.logger.success('Font manager initialized', { fonts: this.loadedFonts.size });
    } catch (error) {
      this.logger.warn('Font loading failed, using defaults', error);
      this.initialized = true; // Continue with defaults
    }
  }

  private async loadFonts() {
    this.logger.debug('Scanning font directory');

    const fonts = await this.scanFontFiles();
    this.logger.info('Loading font files', { count: fonts.length });

    for (const font of fonts) {
      try {
        await this.loadFont(font);
        this.logger.debug('Font loaded', { name: font.name });
      } catch (error) {
        this.logger.warn('Failed to load font', { name: font.name });
      }
    }
  }
}
```

---

## Performance Logging

### Log Only Summaries in Production

```typescript
// ❌ BAD - Too verbose
for (const plugin of plugins) {
  logger.info(`Loading plugin: ${plugin.name}`);
  await loadPlugin(plugin);
  logger.success(`Plugin loaded: ${plugin.name}`);
}

// ✅ GOOD - Summary only
logger.info('Loading plugins', { count: plugins.length });

const results = await Promise.all(plugins.map((p) => loadPlugin(p)));

const loaded = results.filter((r) => r.success).length;
logger.success('Plugins loaded', {
  total: plugins.length,
  loaded,
  failed: plugins.length - loaded,
});
```

### Use DEBUG Level for Verbose Output

```typescript
logger.info('Processing batch', { size: items.length });

for (const item of items) {
  // Only visible in development with DEBUG level
  logger.debug('Processing item', { id: item.id });
  await process(item);
}

logger.success('Batch processed', { size: items.length });
```

---

## Anti-Patterns (DON'T DO THIS)

### ❌ 1. Inconsistent Formats

```typescript
// Different formats in same component
console.log('[SERVICE] Message');
console.log('✅ Complete');
this.logger.log('[Component] Info');
console.log('   ✓ Done');
```

### ❌ 2. Duplicate Logs

```typescript
// Constructor called multiple times = duplicate logs
constructor() {
  console.log('[SERVICE] Initializing'); // Shows 3 times!
}
```

**Fix:** Use singleton pattern or check initialization state:

```typescript
private static initialized = false;

constructor() {
  if (MyService.initialized) return;

  logger.info('Initializing service');
  MyService.initialized = true;
}
```

### ❌ 3. Missing Context

```typescript
logger.info('Loading'); // Loading what?
logger.success('Done'); // What completed?
```

**Fix:** Always provide context:

```typescript
logger.info('Loading configuration files');
logger.success('Configuration loading completed');
```

### ❌ 4. Mixing Languages

```typescript
logger.info('Starting process');
logger.warn('ไม่พบ SMTP credentials'); // ❌ Mixed Thai/English
```

**Fix:** Use English for all logs:

```typescript
logger.info('Starting process');
logger.warn('SMTP credentials not found');
```

### ❌ 5. Using Raw console.log

```typescript
console.log('Starting...'); // ❌ No level, no component
console.error('Failed'); // ❌ No context, no error details
```

**Fix:** Always use logger:

```typescript
logger.info('Bootstrap starting');
logger.error('Bootstrap failed', error);
```

---

## Migration Checklist

When updating existing code to use the new logging standard:

- [ ] Replace `console.log` with `logger.info()`
- [ ] Replace `console.warn` with `logger.warn()`
- [ ] Replace `console.error` with `logger.error()`
- [ ] Add component name to logger creation
- [ ] Add metadata to log messages where applicable
- [ ] Remove duplicate logs (check singleton pattern)
- [ ] Use child loggers for nested operations
- [ ] Add timing for performance-critical operations
- [ ] Replace manual timestamps with logger timestamps
- [ ] Remove emoji from log messages (logger handles formatting)
- [ ] Ensure all messages are in English
- [ ] Group related logs under a single parent logger

---

## Configuration

### Environment Variables

```bash
# .env or .env.local
LOG_LEVEL=info           # debug | info | warn | error
LOG_ENABLE_COLORS=true   # true | false
LOG_TIMESTAMPS=false     # true | false (usually false in development)
```

### Usage in Code

```typescript
import { LogLevel, createLogger } from '../shared/utils/logger.util';

const logger = createLogger('MyService', {
  minLevel: process.env.LOG_LEVEL === 'debug' ? LogLevel.DEBUG : LogLevel.INFO,
  enableColors: process.env.LOG_ENABLE_COLORS !== 'false',
  enableTimestamps: process.env.LOG_TIMESTAMPS === 'true',
});
```

---

## Testing

When writing tests, you can suppress logs or capture them:

```typescript
// Suppress logs in tests
const logger = createLogger('TestComponent', {
  minLevel: LogLevel.ERROR, // Only show errors in tests
});

// Or use a mock logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  success: jest.fn(),
  debug: jest.fn(),
};
```

---

## Summary

### Key Principles

1. **Consistency** - Use the same format everywhere
2. **Clarity** - Messages should be clear and actionable
3. **Context** - Include relevant metadata
4. **Hierarchy** - Use child loggers for nested operations
5. **Performance** - Log summaries, not every iteration
6. **Appropriate Levels** - Use correct log levels

### Quick Start

```typescript
// 1. Import logger
import { createLogger } from '../shared/utils/logger.util';

// 2. Create instance
const logger = createLogger('MyComponent');

// 3. Use it
logger.info('Operation starting');
logger.success('Operation completed', { duration: '100ms' });
logger.error('Operation failed', error);
```

---

**For questions or issues, refer to the Logger utility source:**
`apps/api/src/shared/utils/logger.util.ts`
