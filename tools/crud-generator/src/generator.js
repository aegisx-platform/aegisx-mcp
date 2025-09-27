const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');
const { getDatabaseSchema } = require('./database');
const { generateRolesAndPermissions } = require('./role-generator');

/**
 * Main generator function for CRUD modules
 */
async function generateCrudModule(tableName, options = {}) {
  const {
    withEvents = false,
    dryRun = false,
    force = false,
    outputDir = './apps/api/src/modules',
    configFile = null,
  } = options;

  console.log(`🔍 Analyzing table: ${tableName}`);

  // Get database schema for the table
  const schema = await getDatabaseSchema(tableName);

  if (!schema) {
    throw new Error(`Table '${tableName}' not found in database`);
  }

  console.log(
    `📋 Found ${schema.columns.length} columns in table ${tableName}`,
  );

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
    foreignKeys: schema.foreignKeys,
  };

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

      const roleOptions = {
        dryRun,
        useMigration: !directDb,
        directDb,
        multipleRoles,
        outputDir: path.resolve(
          process.cwd(),
          'apps/api/src/database/migrations',
        ),
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
  return str
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^[A-Z]/, (letter) => letter.toLowerCase());
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str) {
  return str
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^[a-z]/, (letter) => letter.toUpperCase());
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

Handlebars.registerHelper('or', function (arg1, arg2, options) {
  if (!options || typeof options.fn !== 'function') {
    return arg1 || arg2;
  }
  return arg1 || arg2
    ? options.fn(this)
    : options.inverse
      ? options.inverse(this)
      : '';
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

Handlebars.registerHelper('camelCase', function (str) {
  return toCamelCase(str);
});

Handlebars.registerHelper('pascalCase', function (str) {
  return toPascalCase(str);
});

Handlebars.registerHelper('uppercase', function (str) {
  return str.toUpperCase();
});

// Helper to prevent HTML escaping for TypeScript types
Handlebars.registerHelper('raw', function (text) {
  return new Handlebars.SafeString(text);
});

/**
 * Generate domain module with organized structure
 */
async function generateDomainModule(domainName, options = {}) {
  const {
    routes = ['core'],
    withEvents = false,
    dryRun = false,
    force = false,
    outputDir = './apps/api/src/modules',
    configFile = null,
    directDb = false,
    noRoles = false,
    migrationOnly = false,
    multipleRoles = false,
  } = options;

  console.log(`🔍 Analyzing table: ${domainName}`);

  // Get database schema for the table (same as flat generator)
  const schema = await getDatabaseSchema(domainName);

  if (!schema) {
    throw new Error(`Table '${domainName}' not found in database`);
  }

  console.log(
    `📋 Found ${schema.columns.length} columns in table ${domainName}`,
  );

  // Generate context for templates (same as flat generator + domain routes)
  const context = {
    tableName: domainName,
    domainName,
    moduleName: toCamelCase(domainName),
    ModuleName: toPascalCase(domainName),
    schema,
    withEvents,
    timestamp: new Date().toISOString(),
    columns: schema.columns,
    primaryKey: schema.primaryKey,
    foreignKeys: schema.foreignKeys,
    routes: [
      {
        name: 'core',
        camelName: toCamelCase(domainName),
        pascalName: toPascalCase(domainName),
        fileName: 'index',
      },
    ],
  };

  // Define templates to generate for domain structure
  const templates = [
    // Main domain plugin
    { template: 'domain/index.hbs', output: `${context.moduleName}/index.ts` },
  ];

  // Add route files
  context.routes.forEach((route) => {
    templates.push(
      {
        template: 'domain/route.hbs',
        output: `${context.moduleName}/routes/${route.fileName}.ts`,
      },
      {
        template: 'domain/service.hbs',
        output: `${context.moduleName}/services/${route.camelName}.service.ts`,
      },
      {
        template: 'domain/controller.hbs',
        output: `${context.moduleName}/controllers/${route.camelName}.controller.ts`,
      },
      {
        template: 'domain/repository.hbs',
        output: `${context.moduleName}/repositories/${route.camelName}.repository.ts`,
      },
      {
        template: 'domain/schemas.hbs',
        output: `${context.moduleName}/schemas/${route.camelName}.schemas.ts`,
      },
      {
        template: 'domain/types.hbs',
        output: `${context.moduleName}/types/${route.camelName}.types.ts`,
      },
    );
  });

  // Add test template
  templates.push({
    template: 'domain/test.hbs',
    output: `${context.moduleName}/__tests__/${context.moduleName}.test.ts`,
  });

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
        currentRoute: routeContext || context.routes[0],
      };

      const content = await renderTemplate(
        templateConfig.template,
        renderContext,
      );
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

  // Generate roles and permissions for domain module
  let rolesData = null;
  if (!noRoles) {
    try {
      console.log(
        `🔐 Generating roles and permissions for module: ${context.moduleName}`,
      );

      const roleOptions = {
        dryRun,
        useMigration: !directDb,
        directDb,
        multipleRoles,
        outputDir: path.resolve(
          process.cwd(),
          'apps/api/src/database/migrations',
        ),
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
 * Add route to existing domain module
 */
async function addRouteToDomain(domainName, routeName, options = {}) {
  const {
    withEvents = false,
    dryRun = false,
    force = false,
    outputDir = './apps/api/src/modules',
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
      template: 'domain/route.hbs',
      output: `${context.moduleName}/routes/${routeName}.ts`,
    },
    {
      template: 'domain/service.hbs',
      output: `${context.moduleName}/services/${context.currentRoute.camelName}.service.ts`,
    },
    {
      template: 'domain/controller.hbs',
      output: `${context.moduleName}/controllers/${context.currentRoute.camelName}.controller.ts`,
    },
    {
      template: 'domain/repository.hbs',
      output: `${context.moduleName}/repositories/${context.currentRoute.camelName}.repository.ts`,
    },
    {
      template: 'domain/schemas.hbs',
      output: `${context.moduleName}/schemas/${context.currentRoute.camelName}.schemas.ts`,
    },
    {
      template: 'domain/types.hbs',
      output: `${context.moduleName}/types/${context.currentRoute.camelName}.types.ts`,
    },
  ];

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

module.exports = {
  generateCrudModule,
  generateDomainModule,
  addRouteToDomain,
  renderTemplate,
  toCamelCase,
  toPascalCase,
};
