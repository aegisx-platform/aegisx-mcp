const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');
const { getDatabaseSchema } = require('./database');

/**
 * Main generator function for CRUD modules
 */
async function generateCrudModule(tableName, options = {}) {
  const {
    withEvents = false,
    dryRun = false,
    outputDir = './apps/api/src/modules',
    configFile = null
  } = options;

  console.log(`🔍 Analyzing table: ${tableName}`);
  
  // Get database schema for the table
  const schema = await getDatabaseSchema(tableName);
  
  if (!schema) {
    throw new Error(`Table '${tableName}' not found in database`);
  }

  console.log(`📋 Found ${schema.columns.length} columns in table ${tableName}`);
  
  // Generate context for templates
  const context = {
    tableName,
    moduleName: toCamelCase(tableName),
    ModuleName: toPascalCase(tableName),
    schema,
    withEvents,
    timestamp: new Date().toISOString(),
    columns: schema.columns,
    primaryKey: schema.primaryKey,
    foreignKeys: schema.foreignKeys
  };

  // Define templates to generate
  const templates = [
    { template: 'controller.hbs', output: `${context.moduleName}/${context.moduleName}.controller.ts` },
    { template: 'service.hbs', output: `${context.moduleName}/${context.moduleName}.service.ts` },
    { template: 'routes.hbs', output: `${context.moduleName}/${context.moduleName}.routes.ts` },
    { template: 'schemas.hbs', output: `${context.moduleName}/${context.moduleName}.schemas.ts` },
    { template: 'types.hbs', output: `${context.moduleName}/${context.moduleName}.types.ts` },
    { template: 'plugin.hbs', output: `${context.moduleName}/${context.moduleName}.plugin.ts` }
  ];

  // Add test template
  templates.push({
    template: 'test.hbs',
    output: `${context.moduleName}/__tests__/${context.moduleName}.test.ts`
  });

  const files = [];
  const warnings = [];

  // Generate each file
  for (const templateConfig of templates) {
    try {
      const content = await renderTemplate(templateConfig.template, context);
      const outputPath = path.join(outputDir, templateConfig.output);
      
      if (!dryRun) {
        await ensureDirectoryExists(path.dirname(outputPath));
        await fs.writeFile(outputPath, content, 'utf8');
        console.log(`✓ Generated: ${outputPath}`);
      }
      
      files.push({
        path: outputPath,
        template: templateConfig.template,
        size: content.length
      });
    } catch (error) {
      warnings.push(`Failed to generate ${templateConfig.output}: ${error.message}`);
    }
  }

  return {
    success: true,
    files,
    warnings,
    context
  };
}

/**
 * Render Handlebars template with context
 */
async function renderTemplate(templateName, context) {
  const templatePath = path.join(__dirname, '../templates', templateName);
  const templateContent = await fs.readFile(templatePath, 'utf8');
  const template = Handlebars.compile(templateContent);
  return template(context);
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
 */
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
            .replace(/^[A-Z]/, letter => letter.toLowerCase());
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
            .replace(/^[a-z]/, letter => letter.toUpperCase());
}

// Register Handlebars helpers
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('eq', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : (options.inverse ? options.inverse(this) : '');
});

Handlebars.registerHelper('or', function(arg1, arg2, options) {
  return (arg1 || arg2) ? options.fn(this) : (options.inverse ? options.inverse(this) : '');
});

Handlebars.registerHelper('camelCase', function(str) {
  return toCamelCase(str);
});

Handlebars.registerHelper('pascalCase', function(str) {
  return toPascalCase(str);
});

Handlebars.registerHelper('uppercase', function(str) {
  return str.toUpperCase();
});

module.exports = {
  generateCrudModule,
  renderTemplate,
  toCamelCase,
  toPascalCase
};