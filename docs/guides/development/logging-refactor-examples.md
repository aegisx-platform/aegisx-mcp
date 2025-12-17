# Logging Refactor Examples

> Real-world examples of refactoring existing logs to follow the new standard

## Table of Contents

1. [Bootstrap Logs](#1-bootstrap-logs)
2. [Email Service](#2-email-service)
3. [Font Manager](#3-font-manager)
4. [Import Discovery](#4-import-discovery)
5. [Plugin Loader](#5-plugin-loader)

---

## 1. Bootstrap Logs

### Before (apps/api/src/bootstrap/index.ts)

```typescript
console.log('🔧 Loading environment configuration...');
dotenv.config();
console.log('   ✅ Environment loaded & validated');

console.log('⚙️ Loading application configurations...');
const appConfig = loadAppConfig();
console.log('   ✅ Configurations loaded & validated (1ms)');
console.log('   📋 Configuration Summary:');
console.log('      server: 0.0.0.0:3383');

console.log('🏗️ Creating Fastify server...');
const serverInfo = await createServer({ config: appConfig });
console.log('   ✅ Fastify server created (5ms)');

console.log('🚀 Starting HTTP server...');
await startServer(serverInfo, appConfig);
console.log('   ✅ HTTP server started (11464ms)');
```

### After

```typescript
import { createLogger } from '../shared/utils/logger.util';

export async function bootstrap(): Promise<BootstrapResult> {
  const logger = createLogger('Bootstrap');
  const startTime = Date.now();

  logger.info('Bootstrap starting');

  // Environment
  const envLogger = logger.child('Environment');
  envLogger.info('Loading configuration');

  dotenv.config();
  dotenv.config({ path: '.env.local', override: true });
  validateEnvironmentOrThrow();

  envLogger.success('Environment loaded & validated', {
    duration: `${Date.now() - startTime}ms`,
  });

  // Configuration
  const configLogger = logger.child('Config');
  configLogger.info('Loading application configurations');

  const configStartTime = Date.now();
  const appConfig = loadAppConfig();
  const securityConfig = loadSecurityConfig();
  const databaseConfig = loadDatabaseConfig();

  configLogger.success('Configurations loaded', {
    duration: `${Date.now() - configStartTime}ms`,
  });

  if (appConfig.server.isDevelopment) {
    configLogger.info('Configuration summary', {
      server: `${appConfig.server.host}:${appConfig.server.port}`,
      environment: appConfig.server.environment,
      apiPrefix: appConfig.api.prefix,
      cors: Array.isArray(securityConfig.cors.origin) ? `${securityConfig.cors.origin.length} origins` : 'configured',
    });
  }

  // Server Creation
  const serverLogger = logger.child('Server');
  serverLogger.info('Creating Fastify instance');

  const serverStartTime = Date.now();
  const serverInfo = await createServer({
    config: appConfig,
    enableLogger: false,
  });

  serverLogger.success('Fastify server created', {
    duration: `${Date.now() - serverStartTime}ms`,
  });

  // Plugin Loading
  const pluginLogger = logger.child('Plugins');
  pluginLogger.info('Loading application plugins');

  const pluginStartTime = Date.now();
  await loadAllPlugins(serverInfo.instance, appConfig, securityConfig, databaseConfig);

  pluginLogger.success('All plugins loaded', {
    duration: `${Date.now() - pluginStartTime}ms`,
  });

  // Server Start
  serverLogger.info('Starting HTTP server');

  const startServerTime = Date.now();
  await startServer(serverInfo, appConfig);

  serverLogger.success('HTTP server started', {
    duration: `${Date.now() - startServerTime}ms`,
  });

  // Summary
  const totalDuration = Date.now() - startTime;
  logger.success('Bootstrap completed', {
    totalDuration: `${totalDuration}ms`,
    server: `http://${appConfig.server.host}:${appConfig.server.port}`,
    environment: appConfig.server.environment,
  });

  return { server: serverInfo, config: { app: appConfig, security: securityConfig, database: databaseConfig }, startupMetrics: { totalTime: totalDuration, configLoadTime, serverCreateTime, pluginLoadTime, serverStartTime } };
}
```

### Output Comparison

**Before:**

```
🔧 Loading environment configuration...
   ✅ Environment loaded & validated
⚙️ Loading application configurations...
   ✅ Configurations loaded & validated (1ms)
   📋 Configuration Summary:
      server: 0.0.0.0:3383
🏗️ Creating Fastify server...
   ✅ Fastify server created (5ms)
🚀 Starting HTTP server...
   ✅ HTTP server started (11464ms)
```

**After:**

```
[INFO   ] [Bootstrap] Bootstrap starting
   [INFO   ] [Bootstrap:Environment] Loading configuration
   [SUCCESS] [Bootstrap:Environment] Environment loaded & validated (duration=5ms)
   [INFO   ] [Bootstrap:Config] Loading application configurations
   [SUCCESS] [Bootstrap:Config] Configurations loaded (duration=10ms)
   [INFO   ] [Bootstrap:Config] Configuration summary (server=0.0.0.0:3383 environment=development apiPrefix=/api cors=2 origins)
   [INFO   ] [Bootstrap:Server] Creating Fastify instance
   [SUCCESS] [Bootstrap:Server] Fastify server created (duration=5ms)
   [INFO   ] [Bootstrap:Plugins] Loading application plugins
   [SUCCESS] [Bootstrap:Plugins] All plugins loaded (duration=540ms)
   [INFO   ] [Bootstrap:Server] Starting HTTP server
   [SUCCESS] [Bootstrap:Server] HTTP server started (duration=11464ms)
[SUCCESS] [Bootstrap] Bootstrap completed (totalDuration=12038ms server=http://0.0.0.0:3383 environment=development)
```

---

## 2. Email Service

### Before (apps/api/src/shared/services/email.service.ts)

```typescript
export class EmailService {
  constructor(private readonly fastify: FastifyInstance) {
    console.log('[EMAIL_SERVICE] Environment check:', {
      SMTP_USER: process.env.SMTP_USER ? '✅ SET' : '❌ MISSING',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '✅ SET' : '❌ MISSING',
      SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
      SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
    });

    if (this.shouldUseSMTP()) {
      console.log('[EMAIL_SERVICE] SMTP credentials found, initializing...');
      this.fastify.log.info('SMTP credentials found, initializing email service...');
      this.initializeTransporter();
    } else {
      console.log('[EMAIL_SERVICE] No SMTP credentials, using console logging');
      this.fastify.log.warn('SMTP credentials not found, emails will be logged to console only');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    console.log('[EMAIL_SERVICE] sendEmail called:', {
      to: options.to,
      subject: options.subject,
      hasTransporter: !!this.transporter,
    });

    try {
      console.log('[EMAIL_SERVICE] Attempting to send email via SMTP...');
      const info = await this.transporter.sendMail({...});

      console.log('[EMAIL_SERVICE] Email sent successfully!', {
        messageId: info.messageId,
        to,
      });
      return true;
    } catch (error) {
      console.error('[EMAIL_SERVICE] Failed to send email:', error);
      return false;
    }
  }
}
```

### After

```typescript
import { createLogger } from '../utils/logger.util';

export class EmailService {
  private logger = createLogger('EmailService');
  private static instance: EmailService | null = null;
  private initialized = false;

  constructor(private readonly fastify: FastifyInstance) {
    // Singleton pattern to prevent duplicate initialization logs
    if (EmailService.instance) {
      return EmailService.instance;
    }

    this.logger.info('Initializing email service');

    if (this.shouldUseSMTP()) {
      this.logger.info('SMTP credentials found', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? 'configured' : 'missing',
      });
      this.initializeTransporter();
    } else {
      this.logger.warn('SMTP credentials not configured, using console fallback');
    }

    this.initialized = true;
    EmailService.instance = this;
  }

  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      this.logger.success('SMTP transport initialized', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
      });
    } catch (error) {
      this.logger.error('Failed to initialize SMTP transport', error);
      this.transporter = null;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    this.logger.debug('Sending email', {
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
    });

    // Development mode without SMTP
    if (this.isDevelopment && !this.transporter) {
      this.logger.info('Development mode: email logged to console');
      this.logEmailToConsole(options);
      return true;
    }

    if (!this.transporter) {
      this.logger.warn('Email transport not configured, skipping send', {
        to: options.to,
        subject: options.subject,
      });
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: options.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.success('Email sent', {
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        messageId: info.messageId,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to send email', error);
      return false;
    }
  }
}
```

### Output Comparison

**Before:**

```
[EMAIL_SERVICE] Environment check: { SMTP_USER: '❌ MISSING', ... }
[EMAIL_SERVICE] No SMTP credentials, using console logging
[EMAIL_SERVICE] Environment check: { SMTP_USER: '❌ MISSING', ... }  ← DUPLICATE
[EMAIL_SERVICE] No SMTP credentials, using console logging          ← DUPLICATE
[EMAIL_SERVICE] Environment check: { SMTP_USER: '❌ MISSING', ... }  ← DUPLICATE
[EMAIL_SERVICE] No SMTP credentials, using console logging          ← DUPLICATE
```

**After:**

```
[INFO   ] [EmailService] Initializing email service
[WARN   ] [EmailService] SMTP credentials not configured, using console fallback
```

---

## 3. Font Manager

### Before (apps/api/src/services/font-manager.service.ts)

```typescript
export class FontManagerService {
  async initialize(): Promise<void> {
    try {
      await this.loadFontFiles();
      this.initialized = true;
      console.log('✅ Font Manager initialized');
    } catch (error) {
      console.warn('Font Manager initialization warning:', error.message);
      this.initialized = true;
    }
  }

  private async loadFontFiles(): Promise<void> {
    const loadedVariants: string[] = [];

    for (const [fontFamily, fontDescriptor] of Object.entries(this.fontConfiguration)) {
      const variantsLoaded = await this.loadFontFamily(fontFamily, fontDescriptor);
      if (variantsLoaded > 0) {
        this.loadedFonts.add(fontFamily);
        loadedVariants.push(`${fontFamily} (${variantsLoaded} variants)`);
      }
    }

    if (loadedVariants.length > 0) {
      console.log(`✅ Fonts loaded: ${loadedVariants.join(', ')}`);
    }
  }
}
```

### After

```typescript
import { createLogger } from '../shared/utils/logger.util';

export class FontManagerService {
  private logger = createLogger('FontManager');
  private static instance: FontManagerService | null = null;
  private initialized = false;

  constructor() {
    // Singleton pattern to prevent duplicate initialization
    if (FontManagerService.instance) {
      return FontManagerService.instance;
    }

    this.fontConfiguration = getFontConfiguration();
    FontManagerService.instance = this;
  }

  async initialize(): Promise<void> {
    // Prevent duplicate initialization
    if (this.initialized) {
      this.logger.debug('Already initialized, skipping');
      return;
    }

    this.logger.info('Initializing font manager');

    try {
      await this.loadFontFiles();
      this.initialized = true;

      this.logger.success('Font manager initialized', {
        fonts: this.loadedFonts.size,
        thaiFonts: THAI_FONT_FALLBACK.some((f) => this.loadedFonts.has(f)),
      });
    } catch (error) {
      this.logger.warn('Font loading failed, using defaults', error);
      this.initialized = true; // Continue with defaults
    }
  }

  private async loadFontFiles(): Promise<void> {
    const fontDir = this.getFontDirectory();

    if (!fs.existsSync(fontDir)) {
      this.logger.warn('Fonts directory not found', { path: fontDir });
      this.logger.info('Creating fonts directory with instructions');
      await this.createFontsDirectory();
      return;
    }

    this.logger.debug('Scanning font directory', { path: fontDir });

    const loadResults: { family: string; variants: number }[] = [];

    for (const [fontFamily, fontDescriptor] of Object.entries(this.fontConfiguration)) {
      // Skip built-in fonts
      if (['Helvetica', 'Times', 'Courier'].includes(fontFamily)) {
        continue;
      }

      try {
        const variantsLoaded = await this.loadFontFamily(fontFamily, fontDescriptor);
        if (variantsLoaded > 0) {
          this.loadedFonts.add(fontFamily);
          loadResults.push({ family: fontFamily, variants: variantsLoaded });
          this.logger.debug('Font family loaded', {
            family: fontFamily,
            variants: variantsLoaded,
          });
        }
      } catch (error) {
        this.logger.warn('Failed to load font family', {
          family: fontFamily,
          error: error.message,
        });
      }
    }

    // Show summary
    if (loadResults.length > 0) {
      const summary = loadResults.map((r) => `${r.family} (${r.variants})`).join(', ');

      this.logger.info('Font files loaded', {
        count: loadResults.length,
        details: summary,
      });
    } else {
      this.logger.warn('No custom fonts loaded, using built-in fonts');
    }
  }
}
```

### Output Comparison

**Before:**

```
✅ Fonts loaded: Sarabun (4 variants)
✅ Font Manager initialized
✅ Fonts loaded: Sarabun (4 variants)  ← DUPLICATE
✅ Font Manager initialized             ← DUPLICATE
✅ Fonts loaded: Sarabun (4 variants)  ← DUPLICATE
✅ Font Manager initialized             ← DUPLICATE
```

**After:**

```
[INFO   ] [FontManager] Initializing font manager
   [DEBUG  ] [FontManager] Scanning font directory (path=/apps/api/src/assets/fonts)
   [INFO   ] [FontManager] Font files loaded (count=1 details=Sarabun (4))
[SUCCESS] [FontManager] Font manager initialized (fonts=1 thaiFonts=true)
```

---

## 4. Import Discovery

### Before (apps/api/src/layers/platform/import/discovery/import-discovery.service.ts)

```typescript
export class ImportDiscoveryService {
  async discoverServices(): Promise<DiscoveryResult> {
    const startTime = Date.now();
    this.logger.log('[ImportDiscovery] Starting service discovery...');

    const filePaths = this.scanForImportServices();
    this.logger.log(`[ImportDiscovery] Found ${filePaths.length} import service files`);

    await this.dynamicImportServices(filePaths);

    const registeredServices = getRegisteredImportServices();
    this.logger.log(`[ImportDiscovery] Registered ${registeredServices.length} services`);

    this.buildRegistry(registeredServices);

    this.buildDependencyGraph();
    this.validateDependencies();
    const importOrder = this.topologicalSort();

    await this.persistRegistry();

    const duration = Date.now() - startTime;
    this.logger.log(`[ImportDiscovery] Discovery completed in ${duration}ms`);

    if (duration > 100) {
      this.logger.warn(`[ImportDiscovery] PERFORMANCE: Discovery took ${duration}ms (target: <100ms)`);
    }

    return {...};
  }

  private buildRegistry(registeredMetadata: ImportServiceMetadata[]): void {
    for (const metadata of registeredMetadata) {
      // ... instantiate service
      this.logger.log(`[ImportDiscovery] Registered: ${metadata.module} (${metadata.displayName})`);
    }
  }
}
```

### After

```typescript
import { createLogger } from '../../shared/utils/logger.util';

export class ImportDiscoveryService {
  private logger = createLogger('ImportDiscovery');

  async discoverServices(): Promise<DiscoveryResult> {
    const timer = this.logger.startTimer();

    this.logger.info('Starting service discovery');

    // Step 1: Scan
    const scanLogger = this.logger.child('Scan');
    scanLogger.info('Scanning for import service files');

    const filePaths = this.scanForImportServices();
    scanLogger.success('Import service files found', { count: filePaths.length });

    // Step 2: Import
    const importLogger = this.logger.child('Import');
    importLogger.info('Dynamically importing services');
    await this.dynamicImportServices(filePaths);

    const registeredServices = getRegisteredImportServices();
    importLogger.success('Services imported', { count: registeredServices.length });

    // Step 3: Registry
    const regLogger = this.logger.child('Registry');
    regLogger.info('Building service registry');
    this.buildRegistry(registeredServices);
    regLogger.success('Registry built', { services: this.registry.size });

    // Step 4: Dependencies
    const depLogger = this.logger.child('Dependencies');
    depLogger.info('Building dependency graph');
    this.buildDependencyGraph();
    this.validateDependencies();

    if (this.validationErrors.length > 0) {
      depLogger.warn('Validation errors detected', {
        count: this.validationErrors.length,
      });
    }

    if (this.circularDependencies.length > 0) {
      depLogger.warn('Circular dependencies detected', {
        count: this.circularDependencies.length,
      });
    }

    const importOrder = this.topologicalSort();
    depLogger.success('Dependency graph built', { services: importOrder.length });

    // Step 5: Persist
    const persistLogger = this.logger.child('Persist');
    persistLogger.info('Persisting registry to database');
    await this.persistRegistry();
    persistLogger.success('Registry persisted');

    // Summary
    const duration = timer();
    this.logger.success('Service discovery completed', {
      duration: `${duration}ms`,
      services: this.registry.size,
    });

    // Performance warning
    if (duration > 100) {
      this.logger.warn('Discovery performance below target', {
        actual: `${duration}ms`,
        target: '<100ms',
      });
    }

    return {...};
  }

  private buildRegistry(registeredMetadata: ImportServiceMetadata[]): void {
    for (const metadata of registeredMetadata) {
      try {
        const ServiceClass = metadata.target;
        const instance = new ServiceClass(this.db, this.fastify);

        this.registry.set(metadata.module, {
          metadata,
          instance,
          filePath: metadata.filePath || '',
        });

        this.logger.debug('Service registered', {
          module: metadata.module,
          displayName: metadata.displayName,
        });
      } catch (error) {
        this.logger.error('Failed to instantiate service', {
          module: metadata.module,
          error: error.message,
        });

        this.validationErrors.push(`Failed to instantiate ${metadata.module}: ${error}`);
      }
    }
  }
}
```

### Output Comparison

**Before:**

```
[ImportDiscovery] Starting service discovery...
[ImportDiscovery] Found 2 import service files
[ImportDiscovery] Registered 1 services
[ImportDiscovery] Registered: departments (Departments (แผนก))
[ImportDiscovery] Persisted 1 services to database
[ImportDiscovery] Discovery completed in 63ms
```

**After:**

```
[INFO   ] [ImportDiscovery] Starting service discovery
   [INFO   ] [ImportDiscovery:Scan] Scanning for import service files
   [SUCCESS] [ImportDiscovery:Scan] Import service files found (count=2)
   [INFO   ] [ImportDiscovery:Import] Dynamically importing services
   [SUCCESS] [ImportDiscovery:Import] Services imported (count=1)
   [INFO   ] [ImportDiscovery:Registry] Building service registry
   [DEBUG  ] [ImportDiscovery:Registry] Service registered (module=departments displayName=Departments (แผนก))
   [SUCCESS] [ImportDiscovery:Registry] Registry built (services=1)
   [INFO   ] [ImportDiscovery:Dependencies] Building dependency graph
   [SUCCESS] [ImportDiscovery:Dependencies] Dependency graph built (services=1)
   [INFO   ] [ImportDiscovery:Persist] Persisting registry to database
   [SUCCESS] [ImportDiscovery:Persist] Registry persisted
[SUCCESS] [ImportDiscovery] Service discovery completed (duration=63ms services=1)
```

---

## 5. Plugin Loader

### Before (apps/api/src/bootstrap/plugin.loader.ts)

```typescript
export async function loadPluginGroup(fastify: FastifyInstance, group: PluginGroup, options?: { prefix?: string }, quiet = false): Promise<void> {
  if (!quiet) {
    console.log(`   📦 Loading ${group.name} (${group.plugins.length} plugins)...`);
  }

  const startTime = Date.now();
  // ... load plugins ...

  const totalDuration = Date.now() - startTime;
  const successCount = results.filter((r) => r.success).length;

  if (!quiet) {
    const status = successCount === results.length ? '✅' : '⚠️';
    console.log(`      ${status} ${group.name} completed - ${successCount}/${results.length} plugins (${totalDuration}ms)`);
  }
}

export async function loadAllPlugins(fastify: FastifyInstance, appConfig: AppConfig, securityConfig: SecurityConfig, databaseConfig: DatabaseConfig, quiet = false): Promise<void> {
  const startTime = Date.now();

  const pluginGroups = createPluginGroups(appConfig, securityConfig, databaseConfig);

  for (const group of pluginGroups) {
    await loadPluginGroup(fastify, group, undefined, quiet);
  }

  if (!quiet) {
    console.log(`   ✅ Plugin loading completed - ${totalPlugins} plugins loaded successfully (${totalDuration}ms)`);
  }
}
```

### After

```typescript
import { createLogger } from '../shared/utils/logger.util';

const logger = createLogger('PluginLoader');

export async function loadPluginGroup(fastify: FastifyInstance, group: PluginGroup, options?: { prefix?: string }): Promise<void> {
  const groupLogger = logger.child(group.name);
  groupLogger.info('Loading plugin group', {
    plugins: group.plugins.length,
    prefix: options?.prefix || 'none',
  });

  const timer = groupLogger.startTimer();
  const results: { name: string; success: boolean; duration: number; error?: string }[] = [];

  // Load plugins...
  for (const pluginReg of group.plugins) {
    const pluginStart = Date.now();

    try {
      await fastify.register(pluginReg.plugin, pluginReg.options);

      const duration = Date.now() - pluginStart;
      results.push({ name: pluginReg.name, success: true, duration });

      groupLogger.debug('Plugin loaded', {
        name: pluginReg.name,
        duration: `${duration}ms`,
      });
    } catch (error) {
      const duration = Date.now() - pluginStart;
      const errorMsg = error instanceof Error ? error.message : String(error);

      results.push({
        name: pluginReg.name,
        success: false,
        duration,
        error: errorMsg,
      });

      if (pluginReg.required) {
        groupLogger.error('Required plugin failed', {
          name: pluginReg.name,
          duration: `${duration}ms`,
          error: errorMsg,
        });
        throw new Error(`Required plugin ${pluginReg.name} failed to load: ${errorMsg}`);
      } else {
        groupLogger.warn('Optional plugin failed', {
          name: pluginReg.name,
          duration: `${duration}ms`,
          error: errorMsg,
        });
      }
    }
  }

  const duration = timer();
  const successCount = results.filter((r) => r.success).length;

  groupLogger.success('Plugin group loaded', {
    loaded: successCount,
    total: results.length,
    duration: `${duration}ms`,
  });
}

export async function loadAllPlugins(fastify: FastifyInstance, appConfig: AppConfig, securityConfig: SecurityConfig, databaseConfig: DatabaseConfig): Promise<void> {
  logger.info('Loading all plugins');

  const timer = logger.startTimer();

  const pluginGroups = createPluginGroups(appConfig, securityConfig, databaseConfig);

  for (const group of pluginGroups) {
    await loadPluginGroup(fastify, group);
  }

  // Feature flags
  const { enableNewRoutes, enableOldRoutes } = appConfig.features;

  if (enableNewRoutes) {
    logger.info('Layer-based routes enabled');

    const coreLayerGroup = createCoreLayerGroup();
    const platformLayerGroup = createPlatformLayerGroup();
    const domainsLayerGroup = createDomainsLayerGroup();

    await loadPluginGroup(fastify, coreLayerGroup);
    await loadPluginGroup(fastify, platformLayerGroup);
    await loadPluginGroup(fastify, domainsLayerGroup);
  }

  if (enableOldRoutes) {
    logger.info('Legacy routes enabled');

    const coreGroup = createCorePluginGroup(appConfig.api.prefix);
    const featureGroup = createFeaturePluginGroup(appConfig.api.prefix);

    const allApiPlugins: PluginGroup = {
      name: 'api-modules',
      description: 'All API modules (core + features)',
      plugins: [...coreGroup.plugins, ...featureGroup.plugins],
    };

    await loadPluginGroup(fastify, allApiPlugins);
  }

  const duration = timer();
  const totalPlugins = pluginGroups.reduce((sum, g) => sum + g.plugins.length, 0);

  logger.success('All plugins loaded', {
    total: totalPlugins,
    duration: `${duration}ms`,
  });
}
```

### Output Comparison

**Before:**

```
🔌 Loading application plugins...
   📦 Loading infrastructure (5 plugins)...
      ✅ infrastructure completed - 5/5 plugins (5ms)
   📦 Loading database (2 plugins)...
      ✅ database completed - 2/2 plugins (86ms)
   📦 Loading monitoring (2 plugins)...
      ✅ monitoring completed - 2/2 plugins (4ms)
   ✅ Plugin loading completed - 42 plugins loaded successfully (544ms)
```

**After:**

```
[INFO   ] [PluginLoader] Loading all plugins
   [INFO   ] [PluginLoader:infrastructure] Loading plugin group (plugins=5 prefix=none)
   [SUCCESS] [PluginLoader:infrastructure] Plugin group loaded (loaded=5 total=5 duration=5ms)
   [INFO   ] [PluginLoader:database] Loading plugin group (plugins=2 prefix=none)
   [SUCCESS] [PluginLoader:database] Plugin group loaded (loaded=2 total=2 duration=86ms)
   [INFO   ] [PluginLoader:monitoring] Loading plugin group (plugins=2 prefix=none)
   [SUCCESS] [PluginLoader:monitoring] Plugin group loaded (loaded=2 total=2 duration=4ms)
[SUCCESS] [PluginLoader] All plugins loaded (total=42 duration=544ms)
```

---

## Summary

### Key Improvements

1. **Consistent Format** - All logs use `[LEVEL] [Component] Message (metadata)`
2. **No Duplicates** - Singleton pattern prevents duplicate initialization logs
3. **Proper Hierarchy** - Child loggers show clear relationships
4. **Structured Metadata** - Key-value pairs instead of formatted strings
5. **Debug vs Info** - Individual operations use DEBUG, summaries use INFO/SUCCESS
6. **Error Context** - Errors include relevant context and stack traces
7. **Performance Tracking** - Consistent duration reporting

### Migration Steps

1. Import logger utility
2. Create logger instance for component
3. Replace console.log/warn/error with logger methods
4. Add metadata to messages
5. Use child loggers for nested operations
6. Add singleton pattern to prevent duplicates
7. Test output format

### Next Steps

Apply these patterns to:

- [ ] Bootstrap process (apps/api/src/bootstrap/index.ts)
- [ ] Plugin loader (apps/api/src/bootstrap/plugin.loader.ts)
- [ ] Email service (apps/api/src/shared/services/email.service.ts)
- [ ] Font manager (apps/api/src/services/font-manager.service.ts)
- [ ] Import discovery (apps/api/src/layers/platform/import/discovery/import-discovery.service.ts)
- [ ] All other services with console.log statements
