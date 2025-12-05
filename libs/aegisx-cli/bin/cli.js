#!/usr/bin/env node

/**
 * CRUD Generator CLI Tool
 * Generates complete CRUD modules for AegisX platform
 */

const { Command } = require('commander');
const path = require('path');
const chalk = require('chalk');
const {
  generateDomainModule,
  addRouteToDomain,
} = require('../lib/generators/backend-generator');
const FrontendGenerator = require('../lib/generators/frontend-generator');
const { ShellGenerator } = require('../lib/generators/shell-generator');
const { version } = require('../package.json');
const TemplateManager = require('../lib/core/template-manager');
const { promptGenerate } = require('../lib/prompts/generate-prompts');
const {
  promptTemplateType,
  promptSelectTemplate,
  promptNewTemplate,
  promptSetDefault,
  promptRemoveTemplate,
} = require('../lib/prompts/template-prompts');
const {
  validateLicense,
  storeLicense,
  removeLicense,
  displayLicenseStatus,
  validateKeyFormat,
  getLicenseInfo,
  generateTrialKey,
  checkFeature,
} = require('../lib/license/validator');

// Helper function to find project root (where package.json with nx exists)
function findProjectRoot(startDir = __dirname) {
  let currentDir = startDir;
  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    try {
      const packageJson = require(packageJsonPath);
      if (packageJson.devDependencies?.nx || packageJson.dependencies?.nx) {
        return currentDir;
      }
    } catch (e) {
      // Continue searching
    }
    currentDir = path.dirname(currentDir);
  }
  return PROJECT_ROOT; // Fallback to current working directory
}

const PROJECT_ROOT = findProjectRoot();

const program = new Command();

program
  .name('aegisx')
  .description('AegisX CLI - Professional CRUD Generator for Angular + Fastify')
  .version(version || '3.0.0');

program
  .command('generate [table-name]')
  .alias('g')
  .description('Generate CRUD module (interactive mode if no table specified)')
  .option('-e, --with-events', 'Include real-time events integration')
  .option('-d, --dry-run', 'Preview files without creating them')
  .option('-f, --force', 'Force overwrite existing files without confirmation')
  .option('-a, --app <app>', 'Target app (api, web, admin)', 'api')
  .option('-o, --output <dir>', 'Custom output directory (overrides --app)')
  .option(
    '-t, --target <type>',
    'Generation target (backend, frontend)',
    'backend',
  )
  .option('-c, --config <file>', 'Configuration file path')
  .option('--direct-db', 'Write roles directly to database (development only)')
  .option('--no-roles', 'Skip role generation entirely')
  .option('--migration-only', 'Generate migration file only (no CRUD files)')
  .option(
    '--multiple-roles',
    'Generate multiple roles (admin, editor, viewer) instead of single role',
  )
  .option(
    '--package <type>',
    'Feature package to generate (standard, enterprise, full)',
    'standard',
  )
  .option(
    '--smart-stats',
    'Enable smart statistics detection based on table fields',
    false,
  )
  .option('--no-format', 'Skip auto-formatting generated files', false)
  .option(
    '--with-import',
    'Include bulk import functionality (Excel/CSV upload)',
    false,
  )
  .option(
    '--no-register',
    'Skip auto-registration in plugin.loader.ts / app.routes.ts',
    false,
  )
  .option(
    '--include-audit-fields',
    'Include audit fields (created_at, updated_at, deleted_at, created_by, updated_by) in forms',
    false,
  )
  .option(
    '--shell <shell>',
    'Target shell for route registration (e.g., system, inventory). If specified, routes will be registered in the shell routes file instead of app.routes.ts',
  )
  .option(
    '-s, --schema <schema>',
    'PostgreSQL schema to read table from (default: public)',
    'public',
  )
  .option(
    '--domain <path>',
    'Domain path for module organization (e.g., inventory/master-data, queue/tickets)',
  )
  .action(async (tableName, options) => {
    try {
      // 🔐 License validation - required for code generation
      const license = await validateLicense();
      if (!license.valid) {
        console.log(chalk.red('\n🔐 License Required\n'));
        console.log(chalk.yellow(`   ${license.error}`));
        console.log(chalk.gray(`   ${license.message || ''}`));
        console.log(chalk.cyan('\n   Start a free trial: aegisx trial'));
        console.log(chalk.cyan('   Activate license:   aegisx activate <key>'));
        console.log(chalk.gray('\n   Purchase at: https://aegisx.dev\n'));
        process.exit(1);
      }

      // Check if 'generate' feature is available for this license tier
      const featureCheck = await checkFeature('generate');
      if (!featureCheck.allowed) {
        console.log(chalk.red('\n🔐 Feature Not Available\n'));
        console.log(chalk.yellow(`   ${featureCheck.error}`));
        console.log(chalk.gray(`   ${featureCheck.message || ''}`));
        console.log(chalk.gray('\n   Upgrade at: https://aegisx.dev\n'));
        process.exit(1);
      }

      // Interactive mode if no table name provided
      if (!tableName) {
        const templateManager = new TemplateManager({
          templatesBasePath: path.join(__dirname, '../templates'),
        });
        await templateManager.initialize();

        const interactiveOptions = await promptGenerate(templateManager);

        if (!interactiveOptions) {
          // User cancelled
          return;
        }

        // Use interactive options
        tableName = interactiveOptions.tableName;
        options = {
          ...options,
          ...interactiveOptions,
          backendTemplate: interactiveOptions.backendTemplate,
          frontendTemplate: interactiveOptions.frontendTemplate,
        };
      }

      // Validate package option
      const validPackages = ['standard', 'enterprise', 'full'];
      if (!validPackages.includes(options.package)) {
        console.error(`❌ Invalid package type: ${options.package}`);
        console.error(`   Valid options: ${validPackages.join(', ')}`);
        process.exit(1);
      }

      // Auto-detect app based on target if not explicitly set
      // For frontend target, default to 'web' app
      // For backend target, default to 'api' app
      if (options.target === 'frontend' && options.app === 'api') {
        // User didn't explicitly set app, use web for frontend
        options.app = 'web';
      }

      // Determine output directory based on app and target
      let outputDir = options.output;
      if (!outputDir) {
        const appPaths = {
          api: {
            backend: path.resolve(PROJECT_ROOT, 'apps/api/src/modules'),
            // API doesn't have frontend - redirect to web instead
            frontend: path.resolve(PROJECT_ROOT, 'apps/web/src/app/features'),
          },
          web: {
            backend: path.resolve(PROJECT_ROOT, 'apps/web/src/backend'), // if needed
            frontend: path.resolve(PROJECT_ROOT, 'apps/web/src/app/features'),
          },
          admin: {
            backend: path.resolve(PROJECT_ROOT, 'apps/admin/src/backend'), // if needed
            frontend: path.resolve(PROJECT_ROOT, 'apps/admin/src/app/features'),
          },
        };

        outputDir =
          appPaths[options.app]?.[options.target] ||
          path.resolve(PROJECT_ROOT, 'apps/api/src/modules');
      }

      console.log(`🚀 Generating CRUD module for table: ${tableName}`);
      console.log(`🗄️  Database schema: ${options.schema}`);
      console.log(`📱 Target app: ${options.app}`);
      console.log(`🎯 Target type: ${options.target}`);
      console.log(`📦 With events: ${options.withEvents ? 'Yes' : 'No'}`);
      console.log(
        `🔐 Role generation: ${options.noRoles ? 'Disabled' : options.directDb ? 'Direct DB' : 'Migration file'}`,
      );
      console.log(
        `👥 Role strategy: ${options.multipleRoles ? 'Multiple roles (admin, editor, viewer)' : 'Single role'}`,
      );
      console.log(`📦 Feature package: ${options.package.toUpperCase()}`);
      console.log(
        `📊 Smart stats: ${options.smartStats ? 'Enabled' : 'Disabled'}`,
      );
      console.log(`📁 Output directory: ${outputDir}`);
      if (options.domain) {
        console.log(`📂 Domain path: ${options.domain}`);
      }
      if (options.shell) {
        console.log(`🐚 Target shell: ${options.shell}`);
      }

      if (options.dryRun) {
        console.log('🔍 Dry run mode - no files will be created');
      }

      if (options.migrationOnly) {
        console.log('📝 Migration-only mode - only generating migration file');
      }

      if (options.directDb) {
        console.log(
          '⚠️  WARNING: Direct database mode - roles will be written directly to database',
        );
      }

      // Choose generator based on target type
      let result;

      if (options.target === 'frontend') {
        // Frontend generation using FrontendGenerator
        console.log('\n🎨 Generating Angular frontend module...');

        const toolsDir = path.join(__dirname, '..');
        const frontendGenerator = new FrontendGenerator(
          toolsDir,
          PROJECT_ROOT,
          { templateVersion: 'v2', app: options.app || 'web' },
        );

        const generatedFiles = await frontendGenerator.generateFrontendModule(
          tableName,
          {
            enhanced:
              options.package === 'enterprise' || options.package === 'full',
            full: options.package === 'full',
            dryRun: options.dryRun,
            force: options.force,
            withImport: options.withImport,
            withEvents: options.withEvents,
            includeAuditFields: options.includeAuditFields,
          },
        );

        // Format result to match backend generator structure
        // Handle both string paths and comma-separated path lists
        const filePaths = generatedFiles.flatMap((file) => {
          if (typeof file === 'string') {
            // Split comma-separated paths if present
            return file.includes(',')
              ? file.split(',').map((p) => p.trim())
              : [file.trim()];
          }
          // If it's already an object with path property, extract the path
          const filePath = file.path || file;
          return typeof filePath === 'string'
            ? [filePath.trim()]
            : [String(filePath).trim()];
        });

        result = {
          files: filePaths.map((path) => ({ path })),
          warnings: [],
        };
      } else {
        // Backend generation using domain structure
        result = await generateDomainModule(tableName, {
          withEvents: options.withEvents,
          dryRun: options.dryRun,
          force: options.force,
          outputDir: outputDir,
          configFile: options.config,
          app: options.app,
          target: options.target,
          directDb: options.directDb,
          noRoles: options.noRoles,
          migrationOnly: options.migrationOnly,
          multipleRoles: options.multipleRoles,
          package: options.package,
          smartStats: options.smartStats,
          withImport: options.withImport,
          schema: options.schema,
          domain: options.domain,
        });
      }

      if (options.dryRun) {
        console.log('\n📋 Files that would be generated:');
        result.files.forEach((file) => {
          console.log(`  ✓ ${file.path}`);
        });
      } else {
        console.log('\n✅ CRUD module generated successfully!');
        console.log('📂 Generated files:');
        result.files.forEach((file) => {
          console.log(`  ✓ ${file.path}`);
        });

        // Auto-format generated TypeScript files
        const tsFiles = result.files
          .filter((file) => file.path.endsWith('.ts'))
          .map((file) => file.path);

        if (tsFiles.length > 0 && !options.noFormat) {
          console.log('\n🎨 Formatting generated TypeScript files...');
          try {
            const { execSync } = require('child_process');

            // Format files individually to avoid command line length issues
            for (const file of tsFiles) {
              try {
                execSync(`npx prettier --write "${file}"`, {
                  cwd: PROJECT_ROOT,
                  stdio: 'pipe',
                  timeout: 10000, // 10 second timeout
                });
              } catch (error) {
                console.log(`⚠️  Could not format ${file}`);
              }
            }
            console.log('✅ Code formatting completed!');
          } catch (error) {
            console.log('⚠️  Formatting skipped - prettier not available');
            console.log(
              '💡 Run manually: npx prettier --write ' + tsFiles.join(' '),
            );
          }
        }

        // Auto-registration (if not disabled)
        if (!options.noRegister) {
          console.log('\n📝 Auto-registration...');

          if (options.target === 'backend') {
            const {
              autoRegisterBackendPlugin,
            } = require('../lib/generators/backend-generator');
            await autoRegisterBackendPlugin(tableName, PROJECT_ROOT, {
              domain: options.domain,
            });
          } else if (options.target === 'frontend') {
            // Frontend auto-registration
            const frontendGenerator = new FrontendGenerator(
              path.join(__dirname, '..'),
              PROJECT_ROOT,
              { templateVersion: 'v2', app: options.app || 'web' },
            );
            // Use shell-based registration if --shell is specified
            if (options.shell) {
              await frontendGenerator.autoRegisterShellRoute(
                tableName,
                options.shell,
              );
            } else {
              await frontendGenerator.autoRegisterRoute(tableName);
            }
          }
        }
      }

      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach((warning) => {
          console.log(`  • ${warning}`);
        });
      }
    } catch (error) {
      console.error('\n❌ Error generating CRUD module:');
      console.error(error.message);
      // Cleanup database connection
      const { knex } = require('../lib/config/knex-connection');
      await knex.destroy();
      process.exit(1);
    } finally {
      // Always cleanup database connection
      const { knex } = require('../lib/config/knex-connection');
      await knex.destroy();
    }
  });

program
  .command('domain')
  .alias('d')
  .description('Generate domain module with organized structure')
  .argument('<domain-name>', 'Domain name to generate')
  .option(
    '-r, --routes <routes>',
    'Comma-separated list of routes (e.g., "core,profiles,preferences")',
  )
  .option('-e, --with-events', 'Include real-time events integration')
  .option('-d, --dry-run', 'Preview files without creating them')
  .option('-f, --force', 'Force overwrite existing files without confirmation')
  .option('-a, --app <app>', 'Target app (api, web, admin)', 'api')
  .option('-o, --output <dir>', 'Custom output directory (overrides --app)')
  .option(
    '-t, --target <type>',
    'Generation target (backend, frontend)',
    'backend',
  )
  .option('-c, --config <file>', 'Configuration file path')
  .action(async (domainName, options) => {
    try {
      // Determine output directory based on app and target
      let outputDir = options.output;
      if (!outputDir) {
        const appPaths = {
          api: {
            backend: path.resolve(PROJECT_ROOT, 'apps/api/src/modules'),
            frontend: path.resolve(PROJECT_ROOT, 'apps/api/src/frontend'),
          },
          web: {
            backend: path.resolve(PROJECT_ROOT, 'apps/web/src/backend'),
            frontend: path.resolve(PROJECT_ROOT, 'apps/web/src/app/features'),
          },
          admin: {
            backend: path.resolve(PROJECT_ROOT, 'apps/admin/src/backend'),
            frontend: path.resolve(PROJECT_ROOT, 'apps/admin/src/app/features'),
          },
        };

        outputDir =
          appPaths[options.app]?.[options.target] ||
          path.resolve(PROJECT_ROOT, 'apps/api/src/modules');
      }

      const routes = options.routes
        ? options.routes.split(',').map((r) => r.trim())
        : ['core'];

      console.log(`🚀 Generating domain: ${domainName}`);
      console.log(`📱 Target app: ${options.app}`);
      console.log(`🎯 Target type: ${options.target}`);
      console.log(`🛣️  Routes: ${routes.join(', ')}`);
      console.log(`📦 With events: ${options.withEvents ? 'Yes' : 'No'}`);
      console.log(`📁 Output directory: ${outputDir}`);

      if (options.dryRun) {
        console.log('🔍 Dry run mode - no files will be created');
      }

      // Generate using domain structure
      const result = await generateDomainModule(domainName, {
        routes: routes,
        withEvents: options.withEvents,
        dryRun: options.dryRun,
        force: options.force,
        outputDir: outputDir,
        configFile: options.config,
        app: options.app,
        target: options.target,
      });

      if (options.dryRun) {
        console.log('\n📋 Files that would be generated:');
        result.files.forEach((file) => {
          console.log(`  ✓ ${file.path}`);
        });
      } else {
        console.log('\n✅ Domain module generated successfully!');
        console.log('📂 Generated files:');
        result.files.forEach((file) => {
          console.log(`  ✓ ${file.path}`);
        });

        // Auto-format generated TypeScript files
        const tsFiles = result.files
          .filter((file) => file.path.endsWith('.ts'))
          .map((file) => file.path);

        if (tsFiles.length > 0 && !options.noFormat) {
          console.log('\n🎨 Formatting generated TypeScript files...');
          try {
            const { execSync } = require('child_process');

            // Format files individually to avoid command line length issues
            for (const file of tsFiles) {
              try {
                execSync(`npx prettier --write "${file}"`, {
                  cwd: PROJECT_ROOT,
                  stdio: 'pipe',
                  timeout: 10000, // 10 second timeout
                });
              } catch (error) {
                console.log(`⚠️  Could not format ${file}`);
              }
            }
            console.log('✅ Code formatting completed!');
          } catch (error) {
            console.log('⚠️  Formatting skipped - prettier not available');
            console.log(
              '💡 Run manually: npx prettier --write ' + tsFiles.join(' '),
            );
          }
        }
      }

      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach((warning) => {
          console.log(`  • ${warning}`);
        });
      }
    } catch (error) {
      console.error('\n❌ Error generating domain module:');
      console.error(error.message);
      // Cleanup database connection
      const { knex } = require('../lib/config/knex-connection');
      await knex.destroy();
      process.exit(1);
    } finally {
      // Always cleanup database connection
      const { knex } = require('../lib/config/knex-connection');
      await knex.destroy();
    }
  });

program
  .command('route')
  .alias('r')
  .description('Add route to existing domain module')
  .argument(
    '<route-path>',
    'Route path in format "domain/route" (e.g., "users/sessions")',
  )
  .option('-e, --with-events', 'Include real-time events integration')
  .option('-d, --dry-run', 'Preview files without creating them')
  .option('-f, --force', 'Force overwrite existing files without confirmation')
  .option('-a, --app <app>', 'Target app (api, web, admin)', 'api')
  .option('-o, --output <dir>', 'Custom output directory (overrides --app)')
  .option(
    '-t, --target <type>',
    'Generation target (backend, frontend)',
    'backend',
  )
  .action(async (routePath, options) => {
    try {
      // Parse domain/route from path
      const pathParts = routePath.split('/');
      if (pathParts.length !== 2) {
        throw new Error(
          'Route path must be in format "domain/route" (e.g., "users/sessions")',
        );
      }

      const [domainName, routeName] = pathParts;

      // Determine output directory based on app and target
      let outputDir = options.output;
      if (!outputDir) {
        const appPaths = {
          api: {
            backend: path.resolve(PROJECT_ROOT, 'apps/api/src/modules'),
            frontend: path.resolve(PROJECT_ROOT, 'apps/api/src/frontend'),
          },
          web: {
            backend: path.resolve(PROJECT_ROOT, 'apps/web/src/backend'),
            frontend: path.resolve(PROJECT_ROOT, 'apps/web/src/app/features'),
          },
          admin: {
            backend: path.resolve(PROJECT_ROOT, 'apps/admin/src/backend'),
            frontend: path.resolve(PROJECT_ROOT, 'apps/admin/src/app/features'),
          },
        };

        outputDir =
          appPaths[options.app]?.[options.target] ||
          path.resolve(PROJECT_ROOT, 'apps/api/src/modules');
      }

      console.log(`🚀 Adding route: ${routeName} to domain: ${domainName}`);
      console.log(`📱 Target app: ${options.app}`);
      console.log(`🎯 Target type: ${options.target}`);
      console.log(`📦 With events: ${options.withEvents ? 'Yes' : 'No'}`);
      console.log(`📁 Output directory: ${outputDir}`);

      if (options.dryRun) {
        console.log('🔍 Dry run mode - no files will be created');
      }

      const result = await addRouteToDomain(domainName, routeName, {
        withEvents: options.withEvents,
        dryRun: options.dryRun,
        force: options.force,
        outputDir: outputDir,
        app: options.app,
        target: options.target,
      });

      if (options.dryRun) {
        console.log('\n📋 Files that would be generated:');
        result.files.forEach((file) => {
          console.log(`  ✓ ${file.path}`);
        });
      } else {
        console.log('\n✅ Route added successfully!');
        console.log('📂 Generated files:');
        result.files.forEach((file) => {
          console.log(`  ✓ ${file.path}`);
        });

        // Auto-format generated TypeScript files
        const tsFiles = result.files
          .filter((file) => file.path.endsWith('.ts'))
          .map((file) => file.path);

        if (tsFiles.length > 0 && !options.noFormat) {
          console.log('\n🎨 Formatting generated TypeScript files...');
          try {
            const { execSync } = require('child_process');

            // Format files individually to avoid command line length issues
            for (const file of tsFiles) {
              try {
                execSync(`npx prettier --write "${file}"`, {
                  cwd: PROJECT_ROOT,
                  stdio: 'pipe',
                  timeout: 10000, // 10 second timeout
                });
              } catch (error) {
                console.log(`⚠️  Could not format ${file}`);
              }
            }
            console.log('✅ Code formatting completed!');
          } catch (error) {
            console.log('⚠️  Formatting skipped - prettier not available');
            console.log(
              '💡 Run manually: npx prettier --write ' + tsFiles.join(' '),
            );
          }
        }
      }

      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach((warning) => {
          console.log(`  • ${warning}`);
        });
      }
    } catch (error) {
      console.error('\n❌ Error adding route:');
      console.error(error.message);
      // Cleanup database connection
      const { knex } = require('../lib/config/knex-connection');
      await knex.destroy();
      process.exit(1);
    } finally {
      // Always cleanup database connection
      const { knex } = require('../lib/config/knex-connection');
      await knex.destroy();
    }
  });

program
  .command('list-tables')
  .alias('ls')
  .description('List available database tables')
  .option(
    '-s, --schema <schema>',
    'PostgreSQL schema to list tables from (default: public)',
    'public',
  )
  .action(async (options) => {
    try {
      const { listTables } = require('../lib/utils/database');
      const tables = await listTables(options.schema);

      console.log(
        chalk.bold.cyan(
          `\n📊 Available database tables in schema "${options.schema}":\n`,
        ),
      );
      if (tables.length === 0) {
        console.log(
          chalk.yellow(`  No tables found in schema "${options.schema}"`),
        );
        console.log(chalk.gray('  Try: aegisx ls --schema public'));
        console.log(chalk.gray('       aegisx ls --schema inventory\n'));
      } else {
        tables.forEach((table) => {
          console.log(`  • ${table.name} (${table.columns} columns)`);
        });
        console.log(chalk.gray(`\n  Total: ${tables.length} tables\n`));
      }
    } catch (error) {
      console.error('❌ Error listing tables:', error.message);
      // Cleanup database connection
      const { knex } = require('../lib/config/knex-connection');
      await knex.destroy();
      process.exit(1);
    } finally {
      // Always cleanup database connection
      const { knex } = require('../lib/config/knex-connection');
      await knex.destroy();
    }
  });

program
  .command('validate')
  .description('Validate generated module')
  .argument('<module-name>', 'Module name to validate')
  .action(async (moduleName) => {
    try {
      const { validateModule } = require('../lib/utils/validator');
      const result = await validateModule(moduleName);

      if (result.valid) {
        console.log(`✅ Module '${moduleName}' is valid`);
      } else {
        console.log(`❌ Module '${moduleName}' has issues:`);
        result.errors.forEach((error) => {
          console.log(`  • ${error}`);
        });
      }
    } catch (error) {
      console.error('❌ Error validating module:', error.message);
      // Cleanup database connection
      const { knex } = require('../lib/config/knex-connection');
      await knex.destroy();
      process.exit(1);
    } finally {
      // Always cleanup database connection
      const { knex } = require('../lib/config/knex-connection');
      await knex.destroy();
    }
  });

program
  .command('packages')
  .alias('pkg')
  .description('Show available feature packages')
  .action(() => {
    console.log('📦 Available Feature Packages:\n');

    console.log('🟢 STANDARD (default)');
    console.log('   • Basic CRUD operations (Create, Read, Update, Delete)');
    console.log('   • Standard REST API endpoints');
    console.log('   • Role-based access control');
    console.log('   • TypeBox schema validation');
    console.log('   • Pagination and filtering');
    console.log('');

    console.log('🟡 ENTERPRISE');
    console.log('   • Everything in Standard, plus:');
    console.log('   • Dropdown/Options API for UI components');
    console.log('   • Bulk operations (create, update, delete)');
    console.log('   • Status management (activate, deactivate, toggle)');
    console.log('   • Statistics and analytics endpoints');
    console.log('   • Enhanced error handling');
    console.log('');

    console.log('🔴 FULL');
    console.log('   • Everything in Enterprise, plus:');
    console.log('   • Data validation before save');
    console.log('   • Field uniqueness checking');
    console.log('   • Advanced search and filtering');
    console.log('   • Export capabilities');
    console.log('   • Business rule validation');
    console.log('');

    console.log('Usage Examples:');
    console.log('  crud-generator generate users --package standard');
    console.log('  crud-generator generate products --package enterprise');
    console.log('  crud-generator generate orders --package full');
    console.log('');

    console.log('💡 Recommendation:');
    console.log('   • Use STANDARD for simple data models');
    console.log('   • Use ENTERPRISE for admin interfaces and dashboards');
    console.log('   • Use FULL for complex business domains with validation');
  });

// ═══════════════════════════════════════════════════════════════════════════
// SHELL GENERATION COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

program
  .command('shell <shell-name>')
  .alias('sh')
  .description('Generate App Shell (simple, enterprise, or multi-app)')
  .option(
    '-t, --type <type>',
    'Shell type (simple, enterprise, multi-app)',
    'enterprise',
  )
  .option('-a, --app <app>', 'Target app (web, admin)', 'web')
  .option('-n, --name <name>', 'Display name for the shell')
  .option(
    '--theme <theme>',
    'Theme preset (default, indigo, teal, rose)',
    'default',
  )
  .option('--order <number>', 'App order in launcher', '0')
  .option('--with-dashboard', 'Include dashboard page', true)
  .option('--with-settings', 'Include settings page')
  .option('--with-auth', 'Include AuthGuard and AuthService', true)
  .option('--with-theme-switcher', 'Include theme switcher component')
  .option('-f, --force', 'Force overwrite existing files without confirmation')
  .option('-d, --dry-run', 'Preview files without creating them')
  .option('--no-format', 'Skip auto-formatting generated files')
  .action(async (shellName, options) => {
    try {
      // Validate shell type
      const validTypes = ['simple', 'enterprise', 'multi-app'];
      if (!validTypes.includes(options.type)) {
        console.error(chalk.red(`❌ Invalid shell type: ${options.type}`));
        console.error(`   Valid options: ${validTypes.join(', ')}`);
        process.exit(1);
      }

      // Validate app
      const validApps = ['web', 'admin'];
      if (!validApps.includes(options.app)) {
        console.error(chalk.red(`❌ Invalid app: ${options.app}`));
        console.error(`   Valid options: ${validApps.join(', ')}`);
        process.exit(1);
      }

      console.log(chalk.bold.cyan(`\n🐚 Generating App Shell: ${shellName}\n`));

      const generator = new ShellGenerator({
        dryRun: options.dryRun,
        force: options.force,
        type: options.type,
        app: options.app,
        theme: options.theme || 'default',
        order: parseInt(options.order, 10) || 0,
        withDashboard: options.withDashboard !== false,
        withSettings: options.withSettings || false,
        withAuth: options.withAuth !== false,
        withThemeSwitcher: options.withThemeSwitcher || false,
      });

      const result = await generator.generate(shellName, options.name);

      if (!result.success) {
        if (result.reason === 'exists') {
          console.log(
            chalk.yellow('\n⚠️  Use --force to overwrite existing shell\n'),
          );
        }
        process.exit(1);
      }

      if (!options.dryRun) {
        // Auto-format generated TypeScript files
        if (result.files.length > 0 && options.format !== false) {
          console.log('\n🎨 Formatting generated TypeScript files...');
          try {
            const { execSync } = require('child_process');

            for (const file of result.files) {
              try {
                execSync(`npx prettier --write "${file}"`, {
                  cwd: PROJECT_ROOT,
                  stdio: 'pipe',
                  timeout: 10000,
                });
              } catch (error) {
                console.log(chalk.yellow(`⚠️  Could not format ${file}`));
              }
            }
            console.log(chalk.green('✅ Code formatting completed!'));
          } catch (error) {
            console.log(
              chalk.yellow('⚠️  Formatting skipped - prettier not available'),
            );
          }
        }

        console.log(chalk.green('\n✅ Shell generated successfully!\n'));
        console.log(chalk.bold.yellow('📋 Next Steps:\n'));
        console.log('1. Add to app.routes.ts:');
        console.log(chalk.gray(result.routeSnippet));
        console.log('\n2. Customize navigation in:');
        console.log(
          chalk.gray(`   ${result.outputDir}/${shellName}.config.ts\n`),
        );
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error generating shell:'));
      console.error(error.message);
      process.exit(1);
    }
  });

program
  .command('shell-types')
  .description('Show available shell types and their features')
  .action(() => {
    console.log(chalk.bold.cyan('\n🐚 Available Shell Types\n'));

    console.log(chalk.bold.green('SIMPLE'));
    console.log('   Uses AxEmptyLayoutComponent');
    console.log('   • Minimal layout without navigation');
    console.log('   • Suitable for: Auth pages, landing pages, error pages');
    console.log('   • Example: Login shell, 404 shell');
    console.log('');

    console.log(chalk.bold.yellow('ENTERPRISE (default)'));
    console.log('   Uses AxEnterpriseLayoutComponent');
    console.log('   • Full navigation sidebar');
    console.log('   • Header with actions');
    console.log('   • Footer with version');
    console.log('   • Single sub-app navigation');
    console.log('   • Suitable for: Admin panels, management systems');
    console.log('   • Example: System shell, Reports shell');
    console.log('');

    console.log(chalk.bold.red('MULTI-APP'));
    console.log('   Uses AxEnterpriseLayoutComponent with sub-app tabs');
    console.log('   • All enterprise features, plus:');
    console.log('   • Sub-app tabs in header');
    console.log('   • Dynamic navigation per sub-app');
    console.log('   • Suitable for: Complex modules with multiple sections');
    console.log(
      '   • Example: Inventory shell (warehouse, receiving, shipping)',
    );
    console.log('');

    console.log(chalk.bold.cyan('Usage Examples:\n'));
    console.log('  # Enterprise shell (default)');
    console.log('  ./bin/cli.js shell reports --force');
    console.log('');
    console.log('  # Simple shell for auth');
    console.log('  ./bin/cli.js shell auth --type simple --force');
    console.log('');
    console.log('  # Multi-app shell');
    console.log('  ./bin/cli.js shell warehouse --type multi-app --force');
    console.log('');
    console.log('  # With settings page and theme switcher');
    console.log(
      '  ./bin/cli.js shell admin --with-settings --with-theme-switcher --force',
    );
    console.log('');
    console.log('  # To admin app instead of web');
    console.log('  ./bin/cli.js shell system --app admin --force');
    console.log('');
  });

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE MANAGEMENT COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

const templates = program
  .command('templates')
  .alias('t')
  .description('Manage CRUD generator templates');

/**
 * List available templates
 */
templates
  .command('list [type]')
  .alias('ls')
  .description('List available templates (backend, frontend, or all)')
  .action(async (type) => {
    try {
      const templateManager = new TemplateManager({
        templatesBasePath: path.join(__dirname, '../templates'),
      });
      await templateManager.initialize();

      // Determine which templates to list
      let typesToList = ['backend', 'frontend'];
      if (type) {
        if (!['backend', 'frontend', 'all'].includes(type)) {
          console.error(
            chalk.red(
              `❌ Invalid type: ${type}. Must be 'backend', 'frontend', or 'all'`,
            ),
          );
          process.exit(1);
        }
        if (type !== 'all') {
          typesToList = [type];
        }
      }

      console.log(chalk.bold.cyan('\n📦 Available Templates\n'));

      for (const templateType of typesToList) {
        const templateList = await templateManager.listTemplates(templateType);
        const defaults = templateManager.getDefaults();
        const isDefault = defaults[templateType];

        console.log(
          chalk.bold.yellow(
            `${templateType.toUpperCase()} Templates (${templateList.length}):`,
          ),
        );

        if (templateList.length === 0) {
          console.log(chalk.gray('  No templates found'));
        } else {
          templateList.forEach((template) => {
            let name = `  • ${template.name}`;

            if (template.default || template.name === isDefault) {
              name = chalk.green(`${name} [DEFAULT]`);
            }

            if (template.deprecated) {
              name = chalk.gray(`${name} [DEPRECATED]`);
            }

            console.log(name);
            console.log(chalk.gray(`    ${template.description}`));
            console.log(
              chalk.gray(
                `    Version: ${template.version || 'N/A'} | Framework: ${template.framework || 'N/A'}`,
              ),
            );
            console.log('');
          });
        }
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error listing templates:'));
      console.error(error.message);
      process.exit(1);
    }
  });

/**
 * Set default template for a type
 */
templates
  .command('set-default')
  .alias('default')
  .description('Set default template for backend or frontend')
  .action(async () => {
    try {
      const templateManager = new TemplateManager({
        templatesBasePath: path.join(__dirname, '../templates'),
      });
      await templateManager.initialize();

      // Interactive mode
      const type = await promptTemplateType();

      const templateList = await templateManager.listTemplates(type);
      if (templateList.length === 0) {
        console.log(chalk.yellow(`\n⚠️  No ${type} templates available\n`));
        return;
      }

      const templateName = await promptSelectTemplate(
        templateList,
        `Select ${type} template to set as default:`,
      );

      const confirmed = await promptSetDefault(type, templateName);

      if (!confirmed) {
        console.log(chalk.yellow('\n⚠️  Cancelled by user\n'));
        return;
      }

      await templateManager.setDefaultTemplate(type, templateName);

      console.log(
        chalk.green(`\n✅ Set '${templateName}' as default ${type} template\n`),
      );
    } catch (error) {
      console.error(chalk.red('\n❌ Error setting default template:'));
      console.error(error.message);
      process.exit(1);
    }
  });

/**
 * Add custom template
 */
templates
  .command('add')
  .description('Add a custom template')
  .action(async () => {
    try {
      const templateManager = new TemplateManager({
        templatesBasePath: path.join(__dirname, '../templates'),
      });
      await templateManager.initialize();

      console.log(chalk.bold.cyan('\n📦 Add Custom Template\n'));

      const type = await promptTemplateType();
      const templateInfo = await promptNewTemplate();

      await templateManager.addCustomTemplate(
        type,
        templateInfo.name,
        templateInfo.path,
        templateInfo.description,
      );

      console.log(
        chalk.green(
          `\n✅ Added custom ${type} template '${templateInfo.name}'\n`,
        ),
      );
      console.log(chalk.gray(`Path: ${templateInfo.path}`));
      console.log(chalk.gray(`Description: ${templateInfo.description}\n`));
    } catch (error) {
      console.error(chalk.red('\n❌ Error adding custom template:'));
      console.error(error.message);
      process.exit(1);
    }
  });

/**
 * Remove custom template
 */
templates
  .command('remove')
  .alias('rm')
  .description('Remove a custom template')
  .action(async () => {
    try {
      const templateManager = new TemplateManager({
        templatesBasePath: path.join(__dirname, '../templates'),
      });
      await templateManager.initialize();

      const type = await promptTemplateType();

      const customTemplates =
        templateManager.config.customTemplates?.[type] || {};
      const customTemplateNames = Object.keys(customTemplates);

      if (customTemplateNames.length === 0) {
        console.log(
          chalk.yellow(`\n⚠️  No custom ${type} templates to remove\n`),
        );
        return;
      }

      const templateList = customTemplateNames.map((name) => ({
        name,
        description: customTemplates[name].description || 'Custom template',
      }));

      const templateName = await promptSelectTemplate(
        templateList,
        `Select ${type} template to remove:`,
      );

      const confirmed = await promptRemoveTemplate(type, templateName);

      if (!confirmed) {
        console.log(chalk.yellow('\n⚠️  Cancelled by user\n'));
        return;
      }

      await templateManager.removeCustomTemplate(type, templateName);

      console.log(
        chalk.green(`\n✅ Removed custom ${type} template '${templateName}'\n`),
      );
    } catch (error) {
      console.error(chalk.red('\n❌ Error removing custom template:'));
      console.error(error.message);
      process.exit(1);
    }
  });

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

const config = program
  .command('config')
  .alias('cfg')
  .description('Manage CRUD generator configuration');

/**
 * Initialize configuration file
 */
config
  .command('init')
  .description('Initialize .crudgen.json configuration file')
  .option('-f, --force', 'Overwrite existing configuration file')
  .action(async (options) => {
    try {
      const fs = require('fs').promises;
      const configPath = path.join(PROJECT_ROOT, '.crudgen.json');

      // Check if config already exists
      try {
        await fs.access(configPath);
        if (!options.force) {
          console.log(
            chalk.yellow(
              '\n⚠️  Configuration file already exists at .crudgen.json',
            ),
          );
          console.log(
            chalk.gray('    Use --force to overwrite the existing file\n'),
          );
          return;
        }
      } catch {
        // File doesn't exist, proceed
      }

      const defaultConfig = {
        defaultTemplates: {
          backend: 'domain',
          frontend: 'v2',
        },
        customTemplates: {
          backend: {},
          frontend: {},
        },
        defaultFeatures: {
          events: true,
          bulkOperations: true,
          export: false,
          import: false,
        },
      };

      await fs.writeFile(
        configPath,
        JSON.stringify(defaultConfig, null, 2),
        'utf8',
      );

      console.log(
        chalk.green('\n✅ Created .crudgen.json configuration file\n'),
      );
      console.log(chalk.gray('Default templates:'));
      console.log(
        chalk.gray(`  • Backend: ${defaultConfig.defaultTemplates.backend}`),
      );
      console.log(
        chalk.gray(
          `  • Frontend: ${defaultConfig.defaultTemplates.frontend}\n`,
        ),
      );
    } catch (error) {
      console.error(chalk.red('\n❌ Error initializing configuration:'));
      console.error(error.message);
      process.exit(1);
    }
  });

/**
 * Show current configuration
 */
config
  .command('show')
  .description('Show current configuration')
  .action(async () => {
    try {
      const templateManager = new TemplateManager({
        templatesBasePath: path.join(__dirname, '../templates'),
      });
      await templateManager.initialize();

      console.log(chalk.bold.cyan('\n⚙️  CRUD Generator Configuration\n'));

      const defaults = templateManager.getDefaults();

      console.log(chalk.bold.yellow('Default Templates:'));
      console.log(chalk.gray(`  • Backend:  ${defaults.backend}`));
      console.log(chalk.gray(`  • Frontend: ${defaults.frontend}\n`));

      const backendCustom =
        templateManager.config.customTemplates?.backend || {};
      const frontendCustom =
        templateManager.config.customTemplates?.frontend || {};

      if (Object.keys(backendCustom).length > 0) {
        console.log(chalk.bold.yellow('Custom Backend Templates:'));
        Object.entries(backendCustom).forEach(([name, config]) => {
          console.log(chalk.gray(`  • ${name}`));
          console.log(chalk.gray(`    Path: ${config.path}`));
          console.log(
            chalk.gray(`    Description: ${config.description || 'N/A'}`),
          );
        });
        console.log('');
      }

      if (Object.keys(frontendCustom).length > 0) {
        console.log(chalk.bold.yellow('Custom Frontend Templates:'));
        Object.entries(frontendCustom).forEach(([name, config]) => {
          console.log(chalk.gray(`  • ${name}`));
          console.log(chalk.gray(`    Path: ${config.path}`));
          console.log(
            chalk.gray(`    Description: ${config.description || 'N/A'}`),
          );
        });
        console.log('');
      }

      if (templateManager.config.defaultFeatures) {
        console.log(chalk.bold.yellow('Default Features:'));
        Object.entries(templateManager.config.defaultFeatures).forEach(
          ([feature, enabled]) => {
            const status = enabled ? chalk.green('✓') : chalk.gray('✗');
            console.log(chalk.gray(`  ${status} ${feature}`));
          },
        );
        console.log('');
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error showing configuration:'));
      console.error(error.message);
      process.exit(1);
    }
  });

// ═══════════════════════════════════════════════════════════════════════════
// LICENSE MANAGEMENT COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

program
  .command('activate <license-key>')
  .description('Activate your AegisX CLI license')
  .action(async (licenseKey) => {
    console.log(chalk.bold.cyan('\n🔐 AegisX License Activation\n'));

    const validation = validateKeyFormat(licenseKey);

    if (!validation.valid) {
      console.log(chalk.red(`❌ ${validation.error}`));
      console.log(
        chalk.gray('\nLicense key format: AEGISX-[TIER]-[SERIAL]-[CHECKSUM]'),
      );
      console.log(chalk.gray('Example: AEGISX-PRO-A7X9K2M4-5C\n'));
      process.exit(1);
    }

    const stored = storeLicense(licenseKey);

    if (!stored) {
      console.log(chalk.red('❌ Failed to save license key'));
      process.exit(1);
    }

    const info = getLicenseInfo(licenseKey);

    console.log(chalk.green('✅ License activated successfully!\n'));
    console.log(chalk.bold.yellow('License Details:'));
    console.log(chalk.gray(`  Tier: ${info.tierName}`));
    console.log(
      chalk.gray(
        `  Developers: ${info.developers === -1 ? 'Unlimited' : info.developers}`,
      ),
    );
    console.log(chalk.gray(`  Features: ${info.features.join(', ')}`));

    if (info.expiresAt) {
      console.log(chalk.gray(`  Expires: ${info.expiresAt}`));
    }

    console.log(
      chalk.bold.green('\n🚀 You can now use all AegisX CLI features!\n'),
    );
  });

program
  .command('deactivate')
  .description('Remove license from this machine')
  .action(async () => {
    console.log(chalk.bold.cyan('\n🔐 Deactivating License\n'));

    const removed = removeLicense();

    if (removed) {
      console.log(chalk.green('✅ License removed successfully\n'));
    } else {
      console.log(chalk.yellow('⚠️  No license to remove\n'));
    }
  });

program
  .command('license')
  .alias('status')
  .description('Show current license status')
  .action(async () => {
    await displayLicenseStatus();
  });

program
  .command('trial')
  .description('Start a 14-day free trial')
  .action(async () => {
    console.log(chalk.bold.cyan('\n🎉 AegisX CLI Free Trial\n'));

    const trialKey = generateTrialKey();
    const stored = storeLicense(trialKey);

    if (!stored) {
      console.log(chalk.red('❌ Failed to start trial'));
      process.exit(1);
    }

    console.log(chalk.green('✅ Trial activated successfully!\n'));
    console.log(chalk.bold.yellow('Trial Details:'));
    console.log(chalk.gray('  Duration: 14 days'));
    console.log(chalk.gray('  Features: generate, shell'));
    console.log(chalk.gray(`  Trial Key: ${trialKey}`));
    console.log(chalk.bold.cyan('\n📦 Ready to generate your first module!'));
    console.log(chalk.gray('   Try: aegisx generate products --dry-run\n'));
    console.log(chalk.gray('Purchase full version at: https://aegisx.dev\n'));
  });

program.parse();
