const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');
const { getDatabaseSchema, getEnhancedSchema } = require('../utils/database');
const { generateRolesAndPermissions } = require('./role-generator');
const TemplateManager = require('../core/template-manager');
const TemplateRenderer = require('../core/template-renderer');
const { analyzeImportFields } = require('../utils/import-field-analyzer');

// Initialize template manager (will use defaults if config doesn't exist)
let templateManager = null;
let templateRenderer = null;

async function initializeTemplateSystem() {
  if (!templateManager) {
    templateManager = new TemplateManager({
      templatesBasePath: path.join(__dirname, '../../templates'),
    });
    await templateManager.initialize();
    templateRenderer = new TemplateRenderer(templateManager);
  }
  return { templateManager, templateRenderer };
}

/**
 * Calculate correct output directory relative to monorepo root
 * Handles cases when CLI is run from libs/ directory vs monorepo root
 */
function getMonorepoPath(relativePath) {
  const cwd = process.cwd();

  // Check if running from within CLI library folders
  const isInLibsCli =
    cwd.includes('/libs/aegisx-cli') || cwd.endsWith('libs/aegisx-cli');
  const isInLibsCrudGenerator =
    cwd.includes('/libs/aegisx-crud-generator') ||
    cwd.endsWith('libs/aegisx-crud-generator');
  const isInToolsCrudGenerator = cwd.endsWith('tools/crud-generator');

  // Calculate correct base path
  let basePath;
  if (isInLibsCli || isInLibsCrudGenerator) {
    // Running from libs/*, need to go up 2 levels to monorepo root
    basePath = path.resolve(cwd, '../..');
  } else if (isInToolsCrudGenerator) {
    // Old tools location (legacy), go up 2 levels
    basePath = path.resolve(cwd, '../..');
  } else {
    // Running from monorepo root
    basePath = cwd;
  }

  return path.resolve(basePath, relativePath);
}

// Register Handlebars helpers
Handlebars.registerHelper('titleCase', function (str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    )
    .replace(/_/g, ' ');
});

Handlebars.registerHelper('getExportFieldType', function (dataType) {
  const typeMap = {
    'character varying': 'string',
    varchar: 'string',
    text: 'string',
    char: 'string',
    integer: 'number',
    bigint: 'number',
    smallint: 'number',
    decimal: 'number',
    numeric: 'number',
    real: 'number',
    'double precision': 'number',
    boolean: 'boolean',
    date: 'date',
    timestamp: 'date',
    'timestamp with time zone': 'date',
    timestamptz: 'date',
    json: 'json',
    jsonb: 'json',
    uuid: 'string',
  };
  const mappedType = typeMap[dataType] || 'string';

  // Ensure return value matches the ExportField type union
  const validTypes = ['string', 'number', 'date', 'boolean', 'json'];
  return validTypes.includes(mappedType) ? mappedType : 'string';
});

Handlebars.registerHelper('hasColumn', function (columns, columnName) {
  if (!Array.isArray(columns)) return false;
  return columns.some((col) => col.name === columnName);
});

/**
 * Main generator function for CRUD modules
 */
async function generateCrudModule(tableName, options = {}) {
  const {
    withEvents = false,
    dryRun = false,
    force = false,
    outputDir = getMonorepoPath('apps/api/src/modules'),
    configFile = null,
    schema: dbSchema = 'public',
  } = options;

  // Initialize template system
  await initializeTemplateSystem();

  console.log(`🔍 Analyzing table: ${tableName} (schema: ${dbSchema})`);

  // Get enhanced database schema for the table (includes constraint detection)
  const schema = await getEnhancedSchema(tableName, dbSchema);

  if (!schema) {
    throw new Error(`Table '${tableName}' not found in database`);
  }

  console.log(
    `📋 Found ${schema.columns.length} columns in table ${tableName}`,
  );

  // Generate context for templates
  // Find the best field for dropdown labels
  const findDefaultLabelField = (columns) => {
    // First preference: string type, non-primary key fields
    const stringField = columns.find(
      (col) =>
        col.jsType === 'string' &&
        !col.isPrimaryKey &&
        ['name', 'title', 'label', 'description'].includes(col.name),
    );
    if (stringField) return stringField.name;

    // Second preference: any string field (non-primary key)
    const anyStringField = columns.find(
      (col) => col.jsType === 'string' && !col.isPrimaryKey,
    );
    if (anyStringField) return anyStringField.name;

    // Fallback: column 2 if exists, otherwise column 1
    if (columns.length > 1) return columns[1].name;
    return columns[0]?.name || 'id';
  };

  const context = {
    tableName,
    dbSchema, // PostgreSQL schema name (e.g., 'public', 'inventory')
    moduleName: toCamelCase(tableName),
    ModuleName: toPascalCase(tableName),
    moduleNameKebab: toKebabCase(tableName),
    schema,
    withEvents: withEvents || options.withImport || false, // Auto-enable events when using import
    withImport: options.withImport || false,
    timestamp: new Date().toISOString(),
    columns: schema.columns,
    primaryKey: schema.primaryKey,
    foreignKeys: schema.foreignKeys,
    defaultLabelField: findDefaultLabelField(schema.columns),
    // Enhanced CRUD package configuration
    package: options.package || 'standard',
    smartStats: options.smartStats || false,
    hasStatusField: schema.columns.some(
      (col) =>
        col.name === 'is_active' ||
        col.name === 'enabled' ||
        col.name === 'is_published' ||
        col.name === 'is_verified',
    ),
    statusColumns: schema.columns.filter(
      (col) =>
        col.name === 'is_active' ||
        col.name === 'enabled' ||
        col.name === 'is_published' ||
        col.name === 'is_verified',
    ),
    hasDateField: schema.columns.some(
      (col) =>
        col.name === 'created_at' ||
        col.name === 'updated_at' ||
        col.name === 'published_at' ||
        col.name === 'deleted_at',
    ),
    dateColumns: schema.columns.filter(
      (col) =>
        col.name === 'created_at' ||
        col.name === 'updated_at' ||
        col.name === 'published_at' ||
        col.name === 'deleted_at',
    ),
    // ===== ERROR HANDLING CONSTRAINT DATA =====
    uniqueConstraints: schema.uniqueConstraints || {
      singleField: [],
      composite: [],
    },
    foreignKeyReferences: schema.foreignKeyReferences || [],
    businessRules: schema.businessRules || [],
    errorCodes: schema.errorCodes || {},
    // Convenience flags for templates
    hasUniqueConstraints:
      (schema.uniqueConstraints?.singleField?.length || 0) > 0 ||
      (schema.uniqueConstraints?.composite?.length || 0) > 0,
    hasForeignKeyReferences: (schema.foreignKeyReferences?.length || 0) > 0,
    hasBusinessRules: (schema.businessRules?.length || 0) > 0,
  };

  console.log(`📦 Package context: ${context.package}`);
  console.log(`📊 Smart stats: ${context.smartStats}`);
  console.log(`📊 Has status field: ${context.hasStatusField}`);
  console.log(`📊 Has date field: ${context.hasDateField}`);
  console.log(
    `🔍 Full context debug:`,
    JSON.stringify(
      {
        package: context.package,
        smartStats: context.smartStats,
        hasStatusField: context.hasStatusField,
        hasDateField: context.hasDateField,
        packageEqualEnterprise: context.package === 'enterprise',
        packageEqualFull: context.package === 'full',
      },
      null,
      2,
    ),
  );

  // Add import configuration if requested
  if (options.withImport) {
    console.log('📥 Generating import field configurations...');
    const importConfig = analyzeImportFields(
      schema,
      tableName,
      context.moduleName,
      context.ModuleName,
    );
    // Spread import config properties directly into context for template access
    Object.assign(context, importConfig);
    console.log(
      `📥 Analyzed ${importConfig.importFields.length} fields for import`,
    );
    console.log(
      `🔍 Unique fields: ${importConfig.uniqueFields.length}, Custom validators: ${importConfig.customValidators.length}`,
    );
  }

  // Define templates to generate
  const templates = [
    {
      template: 'repository.hbs',
      output: `${context.moduleName}/${context.moduleName}.repository.ts`,
    },
    {
      template: 'service.hbs',
      output: `${context.moduleName}/${context.moduleName}.service.ts`,
    },
    {
      template: 'controller.hbs',
      output: `${context.moduleName}/${context.moduleName}.controller.ts`,
    },
    {
      template: 'routes.hbs',
      output: `${context.moduleName}/${context.moduleName}.routes.ts`,
    },
    {
      template: 'schemas.hbs',
      output: `${context.moduleName}/${context.moduleName}.schemas.ts`,
    },
    {
      template: 'types.hbs',
      output: `${context.moduleName}/${context.moduleName}.types.ts`,
    },
    {
      template: 'plugin.hbs',
      output: `${context.moduleName}/${context.moduleName}.plugin.ts`,
    },
    { template: 'index.hbs', output: `${context.moduleName}/index.ts` },
  ];

  // Add test template
  templates.push({
    template: 'test.hbs',
    output: `${context.moduleName}/__tests__/${context.moduleName}.test.ts`,
  });

  // Add import templates if requested - FLAT structure
  if (options.withImport) {
    console.log('📥 Adding import service and routes templates...');
    templates.push(
      {
        template: 'backend/import-service.hbs',
        output: `${context.moduleName}/${context.moduleNameKebab}-import.service.ts`,
      },
      {
        template: 'backend/import-routes.hbs',
        output: `${context.moduleName}/${context.moduleNameKebab}-import.route.ts`,
      },
    );
  }

  // Check for existing files before generation
  const existingFiles = [];
  for (const templateConfig of templates) {
    const outputPath = path.join(outputDir, templateConfig.output);
    try {
      await fs.access(outputPath);
      existingFiles.push(outputPath);
    } catch {
      // File doesn't exist, continue
    }
  }

  // If files exist and not in dryRun mode, ask for confirmation (unless force is used)
  if (existingFiles.length > 0 && !dryRun && !force) {
    console.log('\n⚠️  Warning: The following files already exist:');
    existingFiles.forEach((file) => console.log(`  - ${file}`));
    console.log('\nThis will overwrite existing files. Continue? (y/N)');
    console.log('💡 Tip: Use --force to skip this confirmation');

    // Wait for user input
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
      rl.question('', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Generation cancelled by user');
      return {
        success: false,
        files: [],
        warnings: ['Generation cancelled - files already exist'],
        context,
      };
    }

    console.log('📝 Proceeding with file generation...\n');
  } else if (existingFiles.length > 0 && force) {
    console.log(
      `⚡ Force mode: Overwriting ${existingFiles.length} existing files...\n`,
    );
  }

  const files = [];
  const warnings = [];

  // Generate shared templates for enhanced/full packages
  if (
    (context.package === 'enterprise' || context.package === 'full') &&
    !options.migrationOnly
  ) {
    try {
      console.log('📦 Generating shared export templates...');
      const srcDir = path.resolve(outputDir, '..');
      console.log(`🎯 Target directory for shared templates: ${srcDir}`);
      const sharedFiles = await generateSharedTemplates(
        srcDir,
        context,
        dryRun,
      );
      files.push(...sharedFiles);
    } catch (error) {
      console.error(
        '⚠️  Warning: Failed to generate shared templates:',
        error.message,
      );
      warnings.push(`Failed to generate shared templates: ${error.message}`);
    }
  }

  // Check if migration-only mode
  if (!options.migrationOnly) {
    // Generate each file
    for (const templateConfig of templates) {
      try {
        const content = await renderTemplate(templateConfig.template, context);
        const outputPath = path.join(outputDir, templateConfig.output);

        if (!dryRun) {
          await ensureDirectoryExists(path.dirname(outputPath));

          // Check if file exists and show status
          let status = '✓ Generated:';
          try {
            await fs.access(outputPath);
            status = '📝 Updated:';
          } catch {
            // New file
          }

          await fs.writeFile(outputPath, content, 'utf8');
          console.log(`${status} ${outputPath}`);
        }

        files.push({
          path: outputPath,
          template: templateConfig.template,
          size: content.length,
        });
      } catch (error) {
        console.error(`❌ Failed to generate ${templateConfig.output}:`, error);
        warnings.push(
          `Failed to generate ${templateConfig.output}: ${error.message}`,
        );
      }
    }
  } else {
    console.log('📝 Migration-only mode - skipping CRUD file generation');
  }

  // Generate roles and permissions
  let rolesData = null;
  const {
    directDb = false,
    noRoles = false,
    migrationOnly = false,
    multipleRoles = false,
  } = options;

  if (!noRoles) {
    try {
      console.log(
        `🔐 Generating roles and permissions for module: ${context.moduleName}`,
      );

      // Auto-detect domain from dbSchema for correct migrations folder
      // If dbSchema is not 'public', use it as the domain root
      const autoDetectedDomain = dbSchema !== 'public' ? dbSchema : null;

      const roleOptions = {
        dryRun,
        force,
        useMigration: !directDb,
        directDb,
        multipleRoles,
        domain: autoDetectedDomain, // Pass domain for permission naming and migrations folder
        // Don't pass outputDir - let role-generator detect correct path automatically
      };

      rolesData = await generateRolesAndPermissions(
        context.moduleName,
        roleOptions,
      );

      if (!dryRun) {
        if (directDb) {
          console.log(
            `✅ Created ${rolesData.permissions.length} permissions and ${rolesData.roles.length} roles in database`,
          );
        } else {
          console.log(`✅ Created migration file: ${rolesData.migrationFile}`);
          console.log(
            `📝 Migration will create ${rolesData.permissions.length} permissions and ${rolesData.roles.length} roles`,
          );
        }
      } else {
        if (directDb) {
          console.log(
            `📋 Would create ${rolesData.permissions.length} permissions and ${rolesData.roles.length} roles in database`,
          );
          if (rolesData.sql && rolesData.sql.length > 0) {
            console.log('\n📝 SQL that would be executed:');
            rolesData.sql.forEach((sql) => console.log(`  ${sql}`));
          }
        } else {
          console.log(
            `📋 Would create migration file: ${rolesData.migrationFile}`,
          );
          console.log(
            `📝 Migration would create ${rolesData.permissions.length} permissions and ${rolesData.roles.length} roles`,
          );
        }
      }
    } catch (error) {
      console.error(
        `⚠️  Warning: Failed to generate roles and permissions:`,
        error.message,
      );
      warnings.push(
        `Failed to generate roles and permissions: ${error.message}`,
      );
    }
  } else {
    console.log(`⏭️  Skipping role generation (--no-roles specified)`);
  }

  return {
    success: true,
    files,
    warnings,
    context,
    roles: rolesData,
  };
}

/**
 * Render Handlebars template with context
 * Supports both legacy path-based and new TemplateManager-based rendering
 */
async function renderTemplate(templateName, context) {
  // Try to use new template manager if initialized
  if (templateManager && templateRenderer) {
    try {
      // Determine template version from context or default to 'standard'
      const templateVersion = context.templateVersion || 'standard';
      console.log(
        `🎨 TemplateManager rendering: template=${templateName}, version=${templateVersion}, hasBusinessRules=${context.hasBusinessRules}`,
      );

      // For domain templates, pass templateName without prefix
      // TemplateManager will resolve the full path based on templateVersion
      return await templateRenderer.renderBackend(templateName, {
        ...context,
        templateVersion,
      });
    } catch (error) {
      console.warn(
        `⚠️  Template manager failed, falling back to legacy path: ${error.message}`,
      );
      // Fall through to legacy rendering
    }
  }

  // Legacy path-based rendering (backward compatibility)
  // For backward compat, if templateName has path separators, use as-is
  // Otherwise, use templateVersion from context to determine template folder
  const templateVersion = context.templateVersion || 'standard';
  console.log(
    `📁 Legacy rendering: template=${templateName}, version=${templateVersion}`,
  );
  let fullTemplatePath;
  if (templateName.includes('/')) {
    fullTemplatePath = path.join(__dirname, '../../templates', templateName);
  } else {
    fullTemplatePath = path.join(
      __dirname,
      `../../templates/backend/${templateVersion}`,
      templateName,
    );
  }
  console.log(`📁 Full template path: ${fullTemplatePath}`);

  const templateContent = await fs.readFile(fullTemplatePath, 'utf8');
  const template = Handlebars.compile(templateContent);
  return template(context);
}

/**
 * Generate shared service templates (export service, schemas)
 */
async function generateSharedTemplates(outputDir, context, dryRun = false) {
  const sharedTemplates = [
    {
      template: 'shared/export.service.hbs',
      output: 'services/export.service.ts',
    },
    {
      template: 'shared/export.schemas.hbs',
      output: 'schemas/export.schemas.ts',
    },
  ];

  const files = [];

  for (const templateConfig of sharedTemplates) {
    try {
      const content = await renderTemplate(templateConfig.template, context);
      const outputPath = path.join(outputDir, templateConfig.output);

      if (!dryRun) {
        await ensureDirectoryExists(path.dirname(outputPath));

        let status = '✓ Generated:';
        try {
          await fs.access(outputPath);
          status = '📝 Updated:';
        } catch {
          // New file
        }

        await fs.writeFile(outputPath, content, 'utf8');
        console.log(`${status} ${outputPath}`);
      }

      files.push({
        path: outputPath,
        template: templateConfig.template,
        size: content.length,
      });
    } catch (error) {
      console.error(`❌ Failed to generate ${templateConfig.output}:`, error);
    }
  }

  return files;
}

/**
 * Ensure directory exists, create if not
 */
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Convert string to camelCase
 * Handles both snake_case and kebab-case
 */
function toCamelCase(str) {
  if (typeof str !== 'string') {
    return String(str || '');
  }
  return str
    .replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^[A-Z]/, (letter) => letter.toLowerCase());
}

/**
 * Convert string to PascalCase
 * Handles both snake_case and kebab-case
 */
function toPascalCase(str) {
  if (typeof str !== 'string') {
    return String(str || '');
  }
  return str
    .replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

/**
 * Convert string to kebab-case
 */
function toKebabCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .replace(/--+/g, '-'); // Replace multiple dashes with single dash
}

/**
 * Field categorization helper functions for intelligent parameter generation
 */

/**
 * Determine if a field is suitable for search (LIKE/ILIKE operations)
 */
function isSearchableField(column) {
  const { name, dataType, tsType } = column;

  // Only string fields are searchable
  if (tsType !== 'string') return false;

  // Exclude very short fields that are likely codes/keys
  if (
    name.length <= 3 &&
    ['id', 'key', 'tag'].some((keyword) => name.includes(keyword))
  ) {
    return false;
  }

  // Exclude binary/encrypted/hash fields
  const excludePatterns = ['hash', 'token', 'secret', 'encrypted', 'binary'];
  if (excludePatterns.some((pattern) => name.toLowerCase().includes(pattern))) {
    return false;
  }

  // Include fields that are likely to contain searchable text
  const searchablePatterns = [
    'name',
    'title',
    'description',
    'content',
    'text',
    'comment',
    'note',
  ];
  return searchablePatterns.some((pattern) =>
    name.toLowerCase().includes(pattern),
  );
}

/**
 * Determine if a field is suitable for exact match filtering
 */
function isExactMatchField(column) {
  const { name, dataType, tsType, type } = column;

  // Boolean fields are always exact match
  if (tsType === 'boolean') return true;

  // String fields - include all EXCEPT large text fields
  if (tsType === 'string') {
    // Exclude large text fields (bio, description, content, notes, etc.)
    const excludePatterns = [
      'description',
      'bio',
      'content',
      'notes',
      'comment',
      'message',
      'body',
      'text',
    ];

    // Exclude if field name contains any exclude pattern
    const shouldExclude = excludePatterns.some((pattern) =>
      name.toLowerCase().includes(pattern),
    );

    // Exclude if database type is text or longtext
    const isLargeTextField =
      type === 'text' ||
      type === 'longtext' ||
      type === 'mediumtext' ||
      dataType === 'text';

    // Include all other string fields (name, email, country, title, etc.)
    return !shouldExclude && !isLargeTextField;
  }

  // Integer fields that are likely foreign keys or enums
  if (tsType === 'number' && dataType === 'integer') {
    const fkPatterns = ['_id', 'id', 'type', 'status'];
    return fkPatterns.some((pattern) => name.toLowerCase().includes(pattern));
  }

  return false;
}

/**
 * Determine if a field is suitable for range filtering (min/max)
 */
function isRangeField(column) {
  const { name, dataType, tsType } = column;

  // Numeric fields (except small integers that are likely enum/foreign keys)
  if (tsType === 'number') {
    const rangePatterns = [
      'amount',
      'price',
      'cost',
      'count',
      'quantity',
      'size',
      'weight',
      'score',
      'rating',
    ];
    return (
      rangePatterns.some((pattern) => name.toLowerCase().includes(pattern)) ||
      dataType === 'decimal' ||
      dataType === 'float' ||
      dataType === 'double'
    );
  }

  // Date fields are suitable for range filtering
  if (
    tsType === 'Date' ||
    (dataType && (dataType.includes('timestamp') || dataType.includes('date')))
  ) {
    return true;
  }

  return false;
}

/**
 * Determine if a field is a date/datetime field
 */
function isDateField(column) {
  const { dataType, tsType } = column;

  return (
    tsType === 'Date' ||
    (dataType &&
      (dataType.includes('timestamp') ||
        dataType.includes('date') ||
        dataType.includes('datetime')))
  );
}

/**
 * Determine if a date field is datetime (has time component)
 */
function isDateTime(column) {
  const { dataType } = column;

  return (
    dataType &&
    (dataType.includes('timestamp') || dataType.includes('datetime'))
  );
}

/**
 * Determine if a field should be included in dropdown/list endpoints
 */
function isDisplayField(column) {
  const { name, dataType, tsType } = column;

  // Primary key is always included
  if (column.isPrimaryKey) return true;

  // Display name patterns
  const displayPatterns = ['name', 'title', 'label', 'display'];
  return displayPatterns.some((pattern) =>
    name.toLowerCase().includes(pattern),
  );
}

/**
 * 🛡️ Security: Determine if a field contains sensitive data
 */
function isSensitiveField(column) {
  const { name } = column;
  const sensitivePatterns = [
    'password',
    'pass',
    'pwd',
    'secret',
    'api_key',
    'token',
    'private_key',
    'hash',
    'salt',
    'social_security',
    'ssn',
    'tax_id',
    'credit_card',
    'bank_account',
    'internal_notes',
    'admin_notes',
    'deleted_at',
    'deleted_by',
  ];

  const lowerName = name.toLowerCase();
  return sensitivePatterns.some(
    (pattern) =>
      lowerName.includes(pattern) ||
      lowerName.endsWith('_hash') ||
      lowerName.endsWith('_secret') ||
      lowerName.startsWith('private_'),
  );
}

/**
 * Get appropriate TypeBox schema constraints for a field based on its purpose
 */
function getFieldConstraints(column) {
  const { name, dataType, tsType } = column;

  if (tsType === 'string') {
    // Search fields can be shorter
    if (isSearchableField(column)) {
      return '{ minLength: 1, maxLength: 100 }';
    }

    // Exact match fields are typically shorter
    if (isExactMatchField(column)) {
      return '{ minLength: 1, maxLength: 50 }';
    }

    // Default string constraints
    return '{ minLength: 1, maxLength: 255 }';
  }

  if (tsType === 'number') {
    // Range fields might allow negative numbers
    if (isRangeField(column)) {
      return '{}'; // No minimum constraint for range fields
    }

    // Exact match fields are usually positive
    return '{ minimum: 0 }';
  }

  return '';
}

/**
 * Check if table has any foreign key relationships (for include parameters)
 */
function hasForeignKeys(schema) {
  return schema.foreignKeys && schema.foreignKeys.length > 0;
}

/**
 * Check if a column is in unique constraints (to prevent duplicate method generation)
 * Handles both column objects and column names as strings
 */
function isInUniqueConstraints(uniqueConstraints, column) {
  if (!uniqueConstraints || !column) return false;

  // Extract column name - handle both objects and strings
  const columnName = typeof column === 'object' ? column.name : column;

  // Check if column is in single field unique constraints
  const singleFieldConstraints = uniqueConstraints.singleField || [];
  if (singleFieldConstraints.includes(columnName)) {
    return true;
  }

  return false;
}

/**
 * Find a column by name in columns array
 */
function findColumnByName(columns, columnName) {
  if (!columns || !columnName) return false;
  return columns.some((col) => col.name === columnName);
}

/**
 * Check if a column exists and is a string type (to avoid duplicate method generation)
 */
function isStringColumn(columns, columnName) {
  if (!columns || !columnName) return false;
  const column = columns.find((col) => col.name === columnName);
  return column && column.tsType === 'string';
}

// Register Handlebars helpers
Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  if (!options || typeof options.fn !== 'function') {
    return arg1 == arg2;
  }
  return arg1 == arg2
    ? options.fn(this)
    : options.inverse
      ? options.inverse(this)
      : '';
});

Handlebars.registerHelper('eq', function (arg1, arg2, options) {
  if (!options || typeof options.fn !== 'function') {
    return arg1 == arg2;
  }
  return arg1 == arg2
    ? options.fn(this)
    : options.inverse
      ? options.inverse(this)
      : '';
});

Handlebars.registerHelper('or', function (...args) {
  // Remove the options hash (last argument) if present
  const options = args[args.length - 1];
  const hasOptionsHash =
    options && typeof options === 'object' && options.hash !== undefined;
  const values = hasOptionsHash ? args.slice(0, -1) : args;

  // Check if any value is truthy
  const result = values.some((v) => Boolean(v));

  // If used as block helper
  if (hasOptionsHash && typeof options.fn === 'function') {
    return result
      ? options.fn(this)
      : options.inverse
        ? options.inverse(this)
        : '';
  }

  // If used as subexpression
  return result;
});

Handlebars.registerHelper('unless', function (conditional, options) {
  if (!options || typeof options.fn !== 'function') {
    return !conditional;
  }
  return !conditional
    ? options.fn(this)
    : options.inverse
      ? options.inverse(this)
      : '';
});

Handlebars.registerHelper('toCamelCase', function (str) {
  return toCamelCase(str);
});

Handlebars.registerHelper('toPascalCase', function (str) {
  return toPascalCase(str);
});

Handlebars.registerHelper('uppercase', function (str) {
  if (!str || typeof str !== 'string') {
    console.warn('⚠️ uppercase helper received invalid input:', str);
    return '';
  }
  return str.toUpperCase();
});

Handlebars.registerHelper('toKebabCase', function (str) {
  return toKebabCase(str);
});

// Helper to prevent HTML escaping for TypeScript types
Handlebars.registerHelper('raw', function (text) {
  return new Handlebars.SafeString(text);
});

// Register field categorization helpers
Handlebars.registerHelper('isSearchableField', function (column) {
  return isSearchableField(column);
});

Handlebars.registerHelper('isExactMatchField', function (column) {
  return isExactMatchField(column);
});

Handlebars.registerHelper('isRangeField', function (column) {
  return isRangeField(column);
});

Handlebars.registerHelper('isDateField', function (column) {
  return isDateField(column);
});

Handlebars.registerHelper('isDateTime', function (column) {
  return isDateTime(column);
});

Handlebars.registerHelper('isDisplayField', function (column) {
  return isDisplayField(column);
});

Handlebars.registerHelper('getFieldConstraints', function (column) {
  return new Handlebars.SafeString(getFieldConstraints(column));
});

Handlebars.registerHelper('hasForeignKeys', function (schema) {
  return hasForeignKeys(schema);
});

// 🛡️ Security helper: Check if field contains sensitive data
Handlebars.registerHelper('isSensitiveField', function (column) {
  return isSensitiveField(column);
});

// Check if column is in unique constraints
Handlebars.registerHelper(
  'isInUniqueConstraints',
  function (uniqueConstraints, column) {
    return isInUniqueConstraints(uniqueConstraints, column);
  },
);

// Find a column by name in columns array
Handlebars.registerHelper('findColumnByName', function (columns, columnName) {
  return findColumnByName(columns, columnName);
});

// Check if a column exists and is a string type
Handlebars.registerHelper('isStringColumn', function (columns, columnName) {
  return isStringColumn(columns, columnName);
});

// Schema-driven filtering helpers
Handlebars.registerHelper('hasEqualsFilter', function (column) {
  return (
    column.filteringStrategy &&
    column.filteringStrategy.filters.includes('equals')
  );
});

Handlebars.registerHelper('hasRangeFilter', function (column) {
  return (
    column.filteringStrategy &&
    column.filteringStrategy.filters.includes('range')
  );
});

Handlebars.registerHelper('hasInArrayFilter', function (column) {
  return (
    column.filteringStrategy &&
    column.filteringStrategy.filters.includes('in_array')
  );
});

Handlebars.registerHelper('hasContainsFilter', function (column) {
  return (
    column.filteringStrategy &&
    column.filteringStrategy.filters.includes('contains')
  );
});

Handlebars.registerHelper('getFilterFormat', function (column) {
  return (column.filteringStrategy && column.filteringStrategy.format) || '';
});

Handlebars.registerHelper('getFilterCategory', function (column) {
  return (
    (column.filteringStrategy && column.filteringStrategy.category) || 'unknown'
  );
});

// ===== CONSTRAINT VALUE HELPERS =====

/**
 * Check if a field has constraint values available
 */
Handlebars.registerHelper('hasConstraints', function (fieldName, context) {
  const { columns } = context.data.root;
  const column = columns.find((col) => col.name === fieldName);
  if (!column) return false;

  return (
    (column.constraintValues && column.constraintValues.length > 0) ||
    (column.enumInfo &&
      column.enumInfo.values &&
      column.enumInfo.values.length > 0)
  );
});

/**
 * Get constraint value by index
 */
Handlebars.registerHelper(
  'getConstraintValue',
  function (fieldName, index, context) {
    const { columns } = context.data.root;
    const column = columns.find((col) => col.name === fieldName);
    if (!column) return null;

    // Priority: enum > constraint > null
    if (column.enumInfo && column.enumInfo.values) {
      const values = column.enumInfo.values;
      return values[index] || values[0] || null;
    }

    if (column.constraintValues && column.constraintValues.length > 0) {
      const values = column.constraintValues;
      return values[index] || values[0] || null;
    }

    return null;
  },
);

/**
 * Get safe default value for a field
 */
Handlebars.registerHelper(
  'getSafeDefault',
  function (fieldName, fieldType, context) {
    const { columns } = context.data.root;
    const column = columns.find((col) => col.name === fieldName);
    if (!column) return null;

    // Use constraint metadata if available
    if (column.constraintMetadata && column.constraintMetadata.defaultValue) {
      return column.constraintMetadata.defaultValue;
    }

    // Fallback to first constraint value
    const constraintValue = Handlebars.helpers.getConstraintValue(
      fieldName,
      0,
      context,
    );
    if (constraintValue) return constraintValue;

    // Boolean type - safe to use default
    if (fieldType === 'boolean' || column.jsType === 'boolean') {
      return 'true';
    }

    // No safe default
    return null;
  },
);

/**
 * Check if a value is safe for a field (within constraints)
 */
Handlebars.registerHelper('isValueSafe', function (fieldName, value, context) {
  const { columns } = context.data.root;
  const column = columns.find((col) => col.name === fieldName);
  if (!column) return false;

  // Boolean values are always safe
  if (column.jsType === 'boolean' && ['true', 'false'].includes(value)) {
    return true;
  }

  // Check constraint values
  const validValues = column.constraintValues || column.enumInfo?.values || [];
  return validValues.includes(value);
});

/**
 * Get all constraint values for a field
 */
Handlebars.registerHelper('getConstraintValues', function (fieldName, context) {
  const { columns } = context.data.root;
  const column = columns.find((col) => col.name === fieldName);
  if (!column) return [];

  return column.constraintValues || column.enumInfo?.values || [];
});

/**
 * Get constraint confidence level
 */
Handlebars.registerHelper(
  'getConstraintConfidence',
  function (fieldName, context) {
    const { columns } = context.data.root;
    const column = columns.find((col) => col.name === fieldName);
    if (!column || !column.constraintMetadata) return 0;

    return column.constraintMetadata.confidence || 0;
  },
);

// ===== VALIDATION AND SAFETY FUNCTIONS =====

/**
 * Validate constraint usage before generation
 */
function validateConstraintUsage(schema) {
  const warnings = [];
  const errors = [];

  schema.columns.forEach((column) => {
    // Check constraint availability
    if (
      column.fieldType === 'enum-select' &&
      !column.constraintValues &&
      !column.enumInfo
    ) {
      warnings.push(
        `Field ${column.name} appears to be enum but no constraints detected`,
      );
    }

    // Check boolean consistency
    if (column.jsType === 'boolean' && column.constraintValues) {
      warnings.push(
        `Field ${column.name} is boolean but has constraint values - using boolean logic`,
      );
    }

    // Check constraint confidence
    if (
      column.constraintMetadata &&
      column.constraintMetadata.confidence < 50
    ) {
      warnings.push(
        `Field ${column.name} has low constraint confidence (${column.constraintMetadata.confidence}%)`,
      );
    }
  });

  return { warnings, errors };
}

/**
 * Generate constraint usage report
 */
function generateConstraintReport(schema) {
  const report = {
    constraintFields: [],
    fallbackFields: [],
    unsafeFields: [],
  };

  schema.columns.forEach((column) => {
    if (column.constraintValues || column.enumInfo) {
      report.constraintFields.push({
        name: column.name,
        type: column.constraintMetadata?.type || 'unknown',
        values: column.constraintValues || column.enumInfo?.values || [],
        confidence: column.constraintMetadata?.confidence || 0,
        source: column.constraintMetadata?.source || 'unknown',
      });
    } else if (column.jsType === 'boolean') {
      report.fallbackFields.push({
        name: column.name,
        reason: 'Boolean type - safe fallback',
      });
    } else if (
      column.fieldType.includes('enum') ||
      column.fieldType.includes('select')
    ) {
      report.unsafeFields.push({
        name: column.name,
        reason: 'No constraints detected - manual review required',
      });
    }
  });

  return report;
}

/**
 * Generate with constraint validation
 */
async function generateWithConstraintChecks(templateFunction, context) {
  // Pre-generation validation
  const validation = validateConstraintUsage(context);
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Constraint warnings:', validation.warnings);
  }
  if (validation.errors.length > 0) {
    throw new Error(
      `Constraint validation errors: ${validation.errors.join(', ')}`,
    );
  }

  // Generate with validation
  const result = await templateFunction(context);

  // Post-generation report
  const report = generateConstraintReport(context);
  if (report.constraintFields.length > 0) {
    console.log(
      `✅ Using database constraints for ${report.constraintFields.length} fields:`,
      report.constraintFields
        .map((f) => `${f.name} (${f.confidence}%)`)
        .join(', '),
    );
  }
  if (report.fallbackFields.length > 0) {
    console.log(
      `🔄 Safe fallbacks for ${report.fallbackFields.length} fields:`,
      report.fallbackFields.map((f) => f.name).join(', '),
    );
  }
  if (report.unsafeFields.length > 0) {
    console.warn(
      `⚠️ Manual review needed for ${report.unsafeFields.length} fields:`,
      report.unsafeFields.map((f) => f.name).join(', '),
    );
  }

  return result;
}

/**
 * Generate domain module with organized structure
 */
async function generateDomainModule(domainName, options = {}) {
  const {
    routes = ['core'],
    withEvents = false,
    dryRun = false,
    force = false,
    outputDir = getMonorepoPath('apps/api/src/modules'),
    configFile = null,
    directDb = false,
    noRoles = false,
    migrationOnly = false,
    multipleRoles = false,
    schema: dbSchema = 'public',
    domain = null, // Domain path for nested structure (e.g., 'inventory/master-data')
  } = options;

  // Calculate the full output path including domain
  const domainPath = domain ? domain : '';
  const fullOutputDir = domain ? path.join(outputDir, domain) : outputDir;

  // Initialize template system
  await initializeTemplateSystem();

  console.log(`🔍 Analyzing table: ${domainName} (schema: ${dbSchema})`);

  // Get enhanced database schema for the table (includes constraint detection)
  const schema = await getEnhancedSchema(domainName, dbSchema);

  if (!schema) {
    throw new Error(`Table '${domainName}' not found in database`);
  }

  console.log(
    `📋 Found ${schema.columns.length} columns in table ${domainName}`,
  );

  // Find the best field for dropdown labels
  const findDefaultLabelField = (columns) => {
    // First preference: string type, non-primary key fields
    const stringField = columns.find(
      (col) =>
        col.jsType === 'string' &&
        !col.isPrimaryKey &&
        ['name', 'title', 'label', 'description'].includes(col.name),
    );
    if (stringField) return stringField.name;

    // Second preference: any string field (non-primary key)
    const anyStringField = columns.find(
      (col) => col.jsType === 'string' && !col.isPrimaryKey,
    );
    if (anyStringField) return anyStringField.name;

    // Fallback: column 2 if exists, otherwise column 1
    if (columns.length > 1) return columns[1].name;
    return columns[0]?.name || 'id';
  };

  // Generate context for templates (same as flat generator + domain routes)
  const context = {
    tableName: domainName,
    dbSchema, // PostgreSQL schema name (e.g., 'public', 'inventory')
    domainName,
    moduleName: toCamelCase(domainName),
    ModuleName: toPascalCase(domainName),
    moduleNameKebab: toKebabCase(domainName),
    schema,
    withEvents: withEvents || options.withImport || false, // Auto-enable events when using import
    withImport: options.withImport || false,
    timestamp: new Date().toISOString(),
    columns: schema.columns,
    primaryKey: schema.primaryKey,
    foreignKeys: schema.foreignKeys,
    defaultLabelField: findDefaultLabelField(schema.columns),
    // Enhanced CRUD package configuration
    package: options.package || 'standard',
    smartStats: options.smartStats || false,
    hasStatusField: schema.columns.some(
      (col) =>
        col.name === 'is_active' ||
        col.name === 'enabled' ||
        col.name === 'is_published' ||
        col.name === 'is_verified',
    ),
    statusColumns: schema.columns.filter(
      (col) =>
        col.name === 'is_active' ||
        col.name === 'enabled' ||
        col.name === 'is_published' ||
        col.name === 'is_verified',
    ),
    hasDateField: schema.columns.some(
      (col) =>
        col.name === 'created_at' ||
        col.name === 'updated_at' ||
        col.name === 'published_at' ||
        col.name === 'deleted_at',
    ),
    dateColumns: schema.columns.filter(
      (col) =>
        col.name === 'created_at' ||
        col.name === 'updated_at' ||
        col.name === 'published_at' ||
        col.name === 'deleted_at',
    ),
    // ===== ERROR HANDLING CONSTRAINT DATA =====
    uniqueConstraints: schema.uniqueConstraints || {
      singleField: [],
      composite: [],
    },
    foreignKeyReferences: schema.foreignKeyReferences || [],
    businessRules: schema.businessRules || [],
    errorCodes: schema.errorCodes || {},
    // Convenience flags for templates
    hasUniqueConstraints:
      (schema.uniqueConstraints?.singleField?.length || 0) > 0 ||
      (schema.uniqueConstraints?.composite?.length || 0) > 0,
    hasForeignKeyReferences: (schema.foreignKeyReferences?.length || 0) > 0,
    hasBusinessRules: (schema.businessRules?.length || 0) > 0,
    routes: [
      {
        name: 'core',
        camelName: toCamelCase(domainName),
        pascalName: toPascalCase(domainName),
        fileName: 'index',
      },
    ],
    // Domain-specific template version
    templateVersion: 'domain',
    // Domain path configuration for nested module structure
    domain: domain || null,
    domainPath: domainPath || '',
    // Route prefix based on domain (e.g., /api/inventory/master-data/drugs)
    routePrefix: domain ? `/${domain.replace(/\//g, '/')}` : '',
    // Full route path including domain
    fullRoutePath: domain
      ? `/${domain}/${toKebabCase(domainName)}`
      : `/${toKebabCase(domainName)}`,
    // Calculate relative path to shared folder based on domain depth
    // With FLAT structure: modules/inventory/master-data/drugs/drugs.service.ts -> needs ../../../../shared
    // Path: drugs.service.ts -> drugs -> master-data -> inventory -> modules -> src
    // domain depth (inventory/master-data) = 2, plus module folder + modules folder = 4 levels up
    sharedPath: domain
      ? '../'.repeat(domain.split('/').length + 2) + 'shared'
      : '../../../shared',
    // Calculate relative path to schemas folder (at same level as modules, not in shared)
    // With FLAT structure: modules/inventory/master-data/drugs/drugs.schemas.ts -> needs ../../../../schemas
    // domain depth (inventory/master-data) = 2, plus module folder + modules folder = 4 levels up
    schemasPath: domain
      ? '../'.repeat(domain.split('/').length + 2) + 'schemas'
      : '../../../schemas',
    // Calculate relative path to services folder (at same level as modules, not in shared)
    // Same calculation as schemasPath
    servicesPath: domain
      ? '../'.repeat(domain.split('/').length + 2) + 'services'
      : '../../../services',
    // Calculate relative path to modules root (for routes to reach schemas/)
    // With FLAT structure: modules/inventory/master-data/drugs/drugs.route.ts -> needs ../../../../
    modulesRootPath: domain
      ? '../'.repeat(domain.split('/').length + 2)
      : '../../../',
    // Swagger/OpenAPI tag for better grouping in Swagger UI
    // Format: "Inventory / Master Data / ModuleName" for domain modules
    // Format: "ModuleName" for flat modules
    swaggerTag: domain
      ? domain
          .split('/')
          .map((part) => toPascalCase(part).replace(/([a-z])([A-Z])/g, '$1 $2'))
          .join(' / ') +
        ' / ' +
        toPascalCase(domainName).replace(/([a-z])([A-Z])/g, '$1 $2')
      : toPascalCase(domainName).replace(/([a-z])([A-Z])/g, '$1 $2'),
  };

  console.log(`📦 Domain Package context: ${context.package}`);
  console.log(`📊 Domain Smart stats: ${context.smartStats}`);
  console.log(`📊 Domain Has status field: ${context.hasStatusField}`);
  console.log(`📊 Domain Has date field: ${context.hasDateField}`);
  console.log(
    `🔍 Full context debug:`,
    JSON.stringify(
      {
        package: context.package,
        smartStats: context.smartStats,
        hasStatusField: context.hasStatusField,
        hasDateField: context.hasDateField,
        packageEqualEnterprise: context.package === 'enterprise',
        packageEqualFull: context.package === 'full',
      },
      null,
      2,
    ),
  );

  // Add import configuration if requested
  if (options.withImport) {
    console.log('📥 Generating import field configurations...');
    const importConfig = analyzeImportFields(
      schema,
      domainName,
      context.moduleName,
      context.ModuleName,
    );
    // Spread import config properties directly into context for template access
    Object.assign(context, importConfig);
    console.log(
      `📥 Analyzed ${importConfig.importFields.length} fields for import`,
    );
    console.log(
      `🔍 Unique fields: ${importConfig.uniqueFields.length}, Custom validators: ${importConfig.customValidators.length}`,
    );
  }

  // Define templates to generate for domain structure
  const templates = [
    // Main domain plugin
    { template: 'index.hbs', output: `${context.moduleName}/index.ts` },
  ];

  // Add route files - FLAT structure (no subfolders)
  context.routes.forEach((route) => {
    templates.push(
      {
        template: 'route.hbs',
        output: `${context.moduleName}/${toKebabCase(route.camelName)}.route.ts`,
      },
      {
        template: 'service.hbs',
        output: `${context.moduleName}/${toKebabCase(route.camelName)}.service.ts`,
      },
      {
        template: 'controller.hbs',
        output: `${context.moduleName}/${toKebabCase(route.camelName)}.controller.ts`,
      },
      {
        template: 'repository.hbs',
        output: `${context.moduleName}/${toKebabCase(route.camelName)}.repository.ts`,
      },
      {
        template: 'schemas.hbs',
        output: `${context.moduleName}/${toKebabCase(route.camelName)}.schemas.ts`,
      },
      {
        template: 'types.hbs',
        output: `${context.moduleName}/${toKebabCase(route.camelName)}.types.ts`,
      },
    );
  });

  // Add test template
  templates.push({
    template: 'test.hbs',
    output: `${context.moduleName}/__tests__/${toKebabCase(context.moduleName)}.test.ts`,
  });

  // Add import templates if requested - FLAT structure
  if (options.withImport) {
    console.log('📥 Adding import service and routes templates...');
    templates.push(
      {
        template: 'backend/import-service.hbs',
        output: `${context.moduleName}/${context.moduleNameKebab}-import.service.ts`,
      },
      {
        template: 'backend/import-routes.hbs',
        output: `${context.moduleName}/${context.moduleNameKebab}-import.route.ts`,
      },
    );
  }

  // Log domain path if specified
  if (domain) {
    console.log(`📂 Domain path: ${domain}`);
    console.log(`📂 Full output directory: ${fullOutputDir}`);
  }

  // Check for existing files before generation
  const existingFiles = [];
  for (const templateConfig of templates) {
    const outputPath = path.join(fullOutputDir, templateConfig.output);
    try {
      await fs.access(outputPath);
      existingFiles.push(outputPath);
    } catch {
      // File doesn't exist, continue
    }
  }

  // Handle existing files confirmation
  if (existingFiles.length > 0 && !dryRun && !force) {
    console.log('\n⚠️  Warning: The following files already exist:');
    existingFiles.forEach((file) => console.log(`  - ${file}`));
    console.log('\nThis will overwrite existing files. Continue? (y/N)');
    console.log('💡 Tip: Use --force to skip this confirmation');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
      rl.question('', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Generation cancelled by user');
      return {
        success: false,
        files: [],
        warnings: ['Generation cancelled - files already exist'],
        context,
      };
    }

    console.log('📝 Proceeding with file generation...\n');
  } else if (existingFiles.length > 0 && force) {
    console.log(
      `⚡ Force mode: Overwriting ${existingFiles.length} existing files...\n`,
    );
  }

  const files = [];
  const warnings = [];

  // Enterprise/Full packages use shared export service from src/services/
  // No need to generate duplicate templates - they already exist at shared location
  // The templates now import from {{servicesPath}}/export.service which resolves correctly
  if (context.package === 'enterprise' || context.package === 'full') {
    console.log(
      '📦 Enterprise/Full package detected - using shared export service',
    );
    console.log(`   Import path: ${context.servicesPath}/export.service`);
  }

  // Generate each file
  for (const templateConfig of templates) {
    try {
      const routeContext = context.routes.find(
        (r) =>
          templateConfig.output.includes(r.fileName) ||
          templateConfig.output.includes(r.camelName),
      );

      const renderContext = {
        ...context,
        currentRoute: {
          ...(routeContext || context.routes[0]),
          // Pass error handling data to route context
          uniqueConstraints: context.uniqueConstraints,
          foreignKeyReferences: context.foreignKeyReferences,
          businessRules: context.businessRules,
          errorCodes: context.errorCodes,
          hasUniqueConstraints: context.hasUniqueConstraints,
          hasForeignKeyReferences: context.hasForeignKeyReferences,
          hasBusinessRules: context.hasBusinessRules,
        },
      };

      const content = await renderTemplate(
        templateConfig.template,
        renderContext,
      );
      const outputPath = path.join(fullOutputDir, templateConfig.output);

      if (!dryRun) {
        await ensureDirectoryExists(path.dirname(outputPath));

        let status = '✓ Generated:';
        try {
          await fs.access(outputPath);
          status = '📝 Updated:';
        } catch {
          // New file
        }

        await fs.writeFile(outputPath, content, 'utf8');
        console.log(`${status} ${outputPath}`);
      }

      files.push({
        path: outputPath,
        template: templateConfig.template,
        size: content.length,
      });
    } catch (error) {
      console.error(`❌ Failed to generate ${templateConfig.output}:`, error);
      warnings.push(
        `Failed to generate ${templateConfig.output}: ${error.message}`,
      );
    }
  }

  // Generate roles and permissions for domain module
  let rolesData = null;
  if (!noRoles) {
    try {
      console.log(
        `🔐 Generating roles and permissions for module: ${context.moduleName}`,
      );

      const roleOptions = {
        dryRun,
        force,
        useMigration: !directDb,
        directDb,
        multipleRoles,
        domain, // Pass domain for permission naming (e.g., 'inventory/master-data')
        // Don't pass outputDir - let role-generator detect correct path automatically
      };

      rolesData = await generateRolesAndPermissions(
        context.moduleName,
        roleOptions,
      );

      // Show domain-based permission format if domain is specified
      const permissionFormat = domain
        ? `${domain.split('/')[0]}:${context.moduleName}:action`
        : `${context.moduleName}.action`;

      if (!dryRun) {
        if (directDb) {
          console.log(
            `✅ Created ${rolesData.permissions.length} permissions and ${rolesData.roles.length} roles in database`,
          );
        } else {
          console.log(`✅ Created migration file: ${rolesData.migrationFile}`);
          console.log(
            `📝 Migration will create ${rolesData.permissions.length} permissions and ${rolesData.roles.length} roles`,
          );
          if (domain) {
            console.log(`📝 Permission format: ${permissionFormat}`);
          }
        }
      } else {
        if (directDb) {
          console.log(
            `📋 Would create ${rolesData.permissions.length} permissions and ${rolesData.roles.length} roles in database`,
          );
          if (rolesData.sql && rolesData.sql.length > 0) {
            console.log('\n📝 SQL that would be executed:');
            rolesData.sql.forEach((sql) => console.log(`  ${sql}`));
          }
        } else {
          console.log(
            `📋 Would create migration file: ${rolesData.migrationFile}`,
          );
          console.log(
            `📝 Migration would create ${rolesData.permissions.length} permissions and ${rolesData.roles.length} roles`,
          );
          if (domain) {
            console.log(`📝 Permission format: ${permissionFormat}`);
          }
        }
      }
    } catch (error) {
      console.error(
        `⚠️  Warning: Failed to generate roles and permissions:`,
        error.message,
      );
      warnings.push(
        `Failed to generate roles and permissions: ${error.message}`,
      );
    }
  } else {
    console.log(`⏭️  Skipping role generation (--no-roles specified)`);
  }

  // Generate domain index files if using domain structure
  if (domain && !dryRun) {
    try {
      console.log(`📂 Generating domain index files for: ${domain}`);
      await generateDomainIndex(domain, domainName, outputDir);
    } catch (error) {
      console.error(
        `⚠️  Warning: Failed to generate domain index files:`,
        error.message,
      );
      warnings.push(`Failed to generate domain index files: ${error.message}`);
    }
  }

  return {
    success: true,
    files,
    warnings,
    context,
    roles: rolesData,
  };
}

/**
 * Add route to existing domain module
 */
async function addRouteToDomain(domainName, routeName, options = {}) {
  const {
    withEvents = false,
    dryRun = false,
    force = false,
    outputDir = getMonorepoPath('apps/api/src/modules'),
  } = options;

  console.log(`🔍 Adding route: ${routeName} to domain: ${domainName}`);

  const domainPath = path.join(outputDir, toCamelCase(domainName));

  // Check if domain exists
  try {
    await fs.access(domainPath);
  } catch {
    throw new Error(
      `Domain '${domainName}' not found in ${outputDir}. Create domain first using 'domain' command.`,
    );
  }

  // Generate context for the new route
  const context = {
    domainName,
    moduleName: toCamelCase(domainName),
    ModuleName: toPascalCase(domainName),
    moduleNameKebab: toKebabCase(domainName),
    currentRoute: {
      name: routeName,
      camelName: toCamelCase(routeName),
      pascalName: toPascalCase(routeName),
      fileName: routeName,
    },
    withEvents,
    timestamp: new Date().toISOString(),
  };

  // Define templates for the new route
  const templates = [
    {
      template: 'route.hbs',
      output: `${context.moduleName}/routes/${routeName}.ts`,
    },
    {
      template: 'service.hbs',
      output: `${context.moduleName}/services/${context.currentRoute.camelName}.service.ts`,
    },
    {
      template: 'controller.hbs',
      output: `${context.moduleName}/controllers/${context.currentRoute.camelName}.controller.ts`,
    },
    {
      template: 'repository.hbs',
      output: `${context.moduleName}/repositories/${context.currentRoute.camelName}.repository.ts`,
    },
    {
      template: 'schemas.hbs',
      output: `${context.moduleName}/schemas/${context.currentRoute.camelName}.schemas.ts`,
    },
    {
      template: 'types.hbs',
      output: `${context.moduleName}/types/${context.currentRoute.camelName}.types.ts`,
    },
  ];

  // Add domain template version to context
  context.templateVersion = 'domain';

  const files = [];
  const warnings = [];

  // Generate each file
  for (const templateConfig of templates) {
    try {
      const content = await renderTemplate(templateConfig.template, context);
      const outputPath = path.join(outputDir, templateConfig.output);

      if (!dryRun) {
        await ensureDirectoryExists(path.dirname(outputPath));

        let status = '✓ Generated:';
        try {
          await fs.access(outputPath);
          status = '📝 Updated:';
        } catch {
          // New file
        }

        console.log(`📝 Writing file: ${outputPath}`);
        console.log(`📄 Content length: ${content.length} chars`);
        await fs.writeFile(outputPath, content, 'utf8');
        console.log(`${status} ${outputPath}`);
      }

      files.push({
        path: outputPath,
        template: templateConfig.template,
        size: content.length,
      });
    } catch (error) {
      console.error(`❌ Failed to generate ${templateConfig.output}:`, error);
      warnings.push(
        `Failed to generate ${templateConfig.output}: ${error.message}`,
      );
    }
  }

  return {
    success: true,
    files,
    warnings,
    context,
  };
}

/**
 * Auto-register backend plugin in plugin.loader.ts
 * @param {string} moduleName - Module name (table name)
 * @param {string} projectRoot - Project root directory
 * @param {Object} options - Optional settings
 * @param {string} options.domain - Domain path (e.g., 'inventory/master-data')
 */
async function autoRegisterBackendPlugin(
  moduleName,
  projectRoot,
  options = {},
) {
  const { domain = null } = options;
  const pluginLoaderPath = path.join(
    projectRoot,
    'apps/api/src/bootstrap/plugin.loader.ts',
  );

  try {
    // Check if file exists
    const fileStats = await fs.stat(pluginLoaderPath).catch(() => null);
    if (!fileStats) {
      console.warn(
        '⚠️ plugin.loader.ts not found - skipping auto-registration',
      );
      return false;
    }

    let content = await fs.readFile(pluginLoaderPath, 'utf8');

    // When using domain structure, register only the domain root plugin
    // e.g., for 'inventory/master-data/drugs', register 'inventory' domain plugin
    // The domain index.ts will handle loading sub-domains and modules
    if (domain) {
      const domainParts = domain.split('/');
      const domainRoot = domainParts[0]; // e.g., 'inventory'
      const domainRootCamel = toCamelCase(domainRoot);
      const domainRootKebab = toKebabCase(domainRoot);

      // Check if domain root is already registered
      if (content.includes(`${domainRootCamel}DomainPlugin`)) {
        console.log(
          `✅ Domain '${domainRoot}' already registered in plugin.loader.ts`,
        );
        console.log(
          `   (Module '${moduleName}' will be loaded via domain index.ts)`,
        );
        return true;
      }

      // Find last import in business features section
      const businessFeatureImportMarker = '// Business feature modules';
      const markerIndex = content.indexOf(businessFeatureImportMarker);

      if (markerIndex === -1) {
        console.error(
          '❌ Cannot find business feature modules section in plugin.loader.ts',
        );
        console.log(
          `💡 Please register manually: import ${domainRootCamel}DomainPlugin from '../modules/${domainRootKebab}'`,
        );
        return false;
      }

      // Import path for domain root
      const importPath = `../modules/${domainRootKebab}`;

      // Add domain import after last business feature import
      const importStatement = `import ${domainRootCamel}DomainPlugin from '${importPath}';\n`;
      let insertPos = content.indexOf('\n', markerIndex);
      while (
        insertPos > 0 &&
        content[insertPos + 1] === 'i' &&
        content.substring(insertPos + 1, insertPos + 7) === 'import'
      ) {
        insertPos = content.indexOf('\n', insertPos + 1);
      }
      insertPos += 1;

      content =
        content.slice(0, insertPos) +
        importStatement +
        content.slice(insertPos);

      // Add to createFeaturePluginGroup
      const featureGroupMarker = "name: 'business-features',";
      const featureGroupIndex = content.indexOf(featureGroupMarker);
      if (featureGroupIndex === -1) {
        console.error(
          '❌ Cannot find business-features group in plugin.loader.ts',
        );
        return false;
      }

      // Find the plugins array
      const pluginsArrayStart = content.indexOf(
        'plugins: [',
        featureGroupIndex,
      );
      const insertPosition = content.indexOf('[', pluginsArrayStart) + 1;

      // Add domain plugin entry with comment
      const pluginEntry = `\n      // ${domainRoot.charAt(0).toUpperCase() + domainRoot.slice(1)} Domain - aggregates all ${domainRoot} modules\n      {\n        name: '${domainRootCamel}-domain',\n        plugin: ${domainRootCamel}DomainPlugin,\n        required: true,\n      },`;

      content =
        content.slice(0, insertPosition) +
        pluginEntry +
        content.slice(insertPosition);

      // Write back
      await fs.writeFile(pluginLoaderPath, content);

      console.log(
        `✅ Auto-registered ${domainRoot} domain plugin in plugin.loader.ts:`,
      );
      console.log(
        `   - Import: import ${domainRootCamel}DomainPlugin from '${importPath}'`,
      );
      console.log(
        `   - Plugin: { name: '${domainRootCamel}-domain', plugin: ${domainRootCamel}DomainPlugin }`,
      );
      console.log(
        `   - Module '${moduleName}' will be loaded via domain index.ts`,
      );

      return true;
    }

    // For non-domain modules, use the old registration logic
    const kebabName = toKebabCase(moduleName);
    const camelName = toCamelCase(moduleName);

    // Check if already registered
    if (content.includes(`${camelName}Plugin`)) {
      console.log(`⚠️ ${moduleName} already registered in plugin.loader.ts`);
      return false;
    }

    // Find last import in business features section
    const businessFeatureImportMarker = '// Business feature modules';
    const markerIndex = content.indexOf(businessFeatureImportMarker);

    if (markerIndex === -1) {
      console.error(
        '❌ Cannot find business feature modules section in plugin.loader.ts',
      );
      console.log(
        `💡 Please register manually: import ${camelName}Plugin from '../modules/${kebabName}'`,
      );
      return false;
    }

    // Import path for flat module
    const importPath = `../modules/${camelName}`;

    // Add import after last business feature import
    const importStatement = `import ${camelName}Plugin from '${importPath}';\n`;
    let insertPos = content.indexOf('\n', markerIndex);
    while (
      insertPos > 0 &&
      content[insertPos + 1] === 'i' &&
      content.substring(insertPos + 1, insertPos + 7) === 'import'
    ) {
      insertPos = content.indexOf('\n', insertPos + 1);
    }
    insertPos += 1;

    content =
      content.slice(0, insertPos) + importStatement + content.slice(insertPos);

    // Add to createFeaturePluginGroup
    const featureGroupMarker = "name: 'business-features',";
    const featureGroupIndex = content.indexOf(featureGroupMarker);
    if (featureGroupIndex === -1) {
      console.error(
        '❌ Cannot find business-features group in plugin.loader.ts',
      );
      return false;
    }

    // Find the plugins array
    const pluginsArrayStart = content.indexOf('plugins: [', featureGroupIndex);
    const insertPosition = content.indexOf('[', pluginsArrayStart) + 1;

    // Use camelName for plugin name to match how they're registered
    const pluginEntry = `\n      {\n        name: '${camelName}',\n        plugin: ${camelName}Plugin,\n        required: true,\n      },`;

    content =
      content.slice(0, insertPosition) +
      pluginEntry +
      content.slice(insertPosition);

    // Write back
    await fs.writeFile(pluginLoaderPath, content);

    console.log(`✅ Auto-registered ${moduleName} plugin in plugin.loader.ts:`);
    console.log(`   - Import: import ${camelName}Plugin from '${importPath}'`);
    console.log(
      `   - Plugin: { name: '${camelName}', plugin: ${camelName}Plugin }`,
    );

    return true;
  } catch (error) {
    console.error('❌ Failed to auto-register plugin:', error.message);
    console.log('💡 Please register manually in plugin.loader.ts');
    return false;
  }
}

/**
 * Generate or update domain index file
 * Creates/updates index.ts for each level of the domain path
 *
 * @param {string} domainPath - Domain path (e.g., 'inventory/master-data')
 * @param {string} moduleName - Module name being added
 * @param {string} outputDir - Base modules directory
 */
async function generateDomainIndex(domainPath, moduleName, outputDir) {
  if (!domainPath) return;

  const domainParts = domainPath.split('/');
  const camelModuleName = toCamelCase(moduleName);
  const kebabModuleName = toKebabCase(moduleName);

  // Generate index for each level of the domain path
  for (let i = 0; i < domainParts.length; i++) {
    const currentPath = domainParts.slice(0, i + 1).join('/');
    const indexPath = path.join(outputDir, currentPath, 'index.ts');
    const domainName = domainParts[i];
    const domainCamelName = toCamelCase(domainName);

    // Check if index already exists
    let existingContent = '';
    const modules = [];

    try {
      existingContent = await fs.readFile(indexPath, 'utf8');
      // Parse existing modules from imports
      const importRegex = /import\s+(\w+)Plugin\s+from\s+['"](\.\/[^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(existingContent)) !== null) {
        modules.push({
          camelName: match[1],
          path: match[2].replace('./', ''),
          kebabName: toKebabCase(match[1]),
        });
      }
    } catch {
      // File doesn't exist, start fresh
    }

    // Determine what to add based on level
    if (i === domainParts.length - 1) {
      // Leaf level - add the actual module
      const modulePath = camelModuleName;
      if (!modules.some((m) => m.camelName === camelModuleName)) {
        modules.push({
          camelName: camelModuleName,
          path: modulePath,
          kebabName: kebabModuleName,
        });
      }
    } else {
      // Intermediate level - add sub-domain
      const subDomain = domainParts[i + 1];
      const subDomainCamel = toCamelCase(subDomain);
      const subDomainKebab = toKebabCase(subDomain);
      if (!modules.some((m) => m.camelName === subDomainCamel)) {
        modules.push({
          camelName: subDomainCamel,
          path: subDomainKebab,
          kebabName: subDomainKebab,
        });
      }
    }

    // Generate the domain index content
    const routePrefix = currentPath.replace(/\//g, '/');
    const context = {
      domainName: domainName.charAt(0).toUpperCase() + domainName.slice(1),
      domainCamelName,
      routePrefix,
      modules,
      moduleCount: modules.length,
    };

    const content = await renderTemplate('domain-index.hbs', {
      ...context,
      templateVersion: 'domain',
    });

    await ensureDirectoryExists(path.dirname(indexPath));
    await fs.writeFile(indexPath, content, 'utf8');
    console.log(`📦 Updated domain index: ${indexPath}`);
  }
}

module.exports = {
  generateCrudModule,
  generateDomainModule,
  addRouteToDomain,
  generateSharedTemplates,
  renderTemplate,
  toCamelCase,
  toPascalCase,
  toKebabCase,
  autoRegisterBackendPlugin,
  generateDomainIndex,
};
