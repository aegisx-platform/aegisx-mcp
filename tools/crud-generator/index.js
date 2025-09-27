#!/usr/bin/env node

/**
 * CRUD Generator CLI Tool
 * Generates complete CRUD modules for AegisX platform
 */

const { Command } = require('commander');
const path = require('path');
const {
  generateCrudModule,
  generateDomainModule,
  addRouteToDomain,
} = require('./src/generator');
const { version } = require('./package.json');

const program = new Command();

program
  .name('crud-generator')
  .description('Generate complete CRUD modules for AegisX platform')
  .version(version || '1.0.0');

program
  .command('generate')
  .alias('g')
  .description(
    'Generate CRUD module from database table (defaults to domain structure)',
  )
  .argument('<table-name>', 'Database table name to generate CRUD for')
  .option('-e, --with-events', 'Include real-time events integration')
  .option('-d, --dry-run', 'Preview files without creating them')
  .option('-f, --force', 'Force overwrite existing files without confirmation')
  .option('--flat', 'Use flat structure instead of domain structure')
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
  .action(async (tableName, options) => {
    try {
      // Determine output directory based on app and target
      let outputDir = options.output;
      if (!outputDir) {
        const appPaths = {
          api: {
            backend: './apps/api/src/modules',
            frontend: './apps/api/src/frontend', // if needed
          },
          web: {
            backend: './apps/web/src/backend', // if needed
            frontend: './apps/web/src/app/features',
          },
          admin: {
            backend: './apps/admin/src/backend', // if needed
            frontend: './apps/admin/src/app/features',
          },
        };

        outputDir =
          appPaths[options.app]?.[options.target] || './apps/api/src/modules';
      }

      const useFlat = options.flat === true;
      const structureType = useFlat ? 'flat' : 'domain';

      console.log(`🚀 Generating CRUD module for table: ${tableName}`);
      console.log(`📱 Target app: ${options.app}`);
      console.log(`🎯 Target type: ${options.target}`);
      console.log(`🏗️  Structure: ${structureType}`);
      console.log(`📦 With events: ${options.withEvents ? 'Yes' : 'No'}`);
      console.log(
        `🔐 Role generation: ${options.noRoles ? 'Disabled' : options.directDb ? 'Direct DB' : 'Migration file'}`,
      );
      console.log(
        `👥 Role strategy: ${options.multipleRoles ? 'Multiple roles (admin, editor, viewer)' : 'Single role'}`,
      );
      console.log(`📁 Output directory: ${outputDir}`);

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

      // Choose generator based on structure type
      const result = useFlat
        ? await generateCrudModule(tableName, {
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
          })
        : await generateDomainModule(tableName, {
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
          });

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
      process.exit(1);
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
  .option('--flat', 'Use flat structure instead of domain structure')
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
            backend: './apps/api/src/modules',
            frontend: './apps/api/src/frontend',
          },
          web: {
            backend: './apps/web/src/backend',
            frontend: './apps/web/src/app/features',
          },
          admin: {
            backend: './apps/admin/src/backend',
            frontend: './apps/admin/src/app/features',
          },
        };

        outputDir =
          appPaths[options.app]?.[options.target] || './apps/api/src/modules';
      }

      const useFlat = options.flat === true;
      const structureType = useFlat ? 'flat' : 'domain';
      const routes = options.routes
        ? options.routes.split(',').map((r) => r.trim())
        : ['core'];

      console.log(`🚀 Generating domain: ${domainName}`);
      console.log(`📱 Target app: ${options.app}`);
      console.log(`🎯 Target type: ${options.target}`);
      console.log(`🏗️  Structure: ${structureType}`);
      console.log(`🛣️  Routes: ${routes.join(', ')}`);
      console.log(`📦 With events: ${options.withEvents ? 'Yes' : 'No'}`);
      console.log(`📁 Output directory: ${outputDir}`);

      if (options.dryRun) {
        console.log('🔍 Dry run mode - no files will be created');
      }

      // Choose generator based on structure type
      const result = useFlat
        ? await generateCrudModule(domainName, {
            withEvents: options.withEvents,
            dryRun: options.dryRun,
            force: options.force,
            outputDir: outputDir,
            configFile: options.config,
            app: options.app,
            target: options.target,
          })
        : await generateDomainModule(domainName, {
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
      process.exit(1);
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
            backend: './apps/api/src/modules',
            frontend: './apps/api/src/frontend',
          },
          web: {
            backend: './apps/web/src/backend',
            frontend: './apps/web/src/app/features',
          },
          admin: {
            backend: './apps/admin/src/backend',
            frontend: './apps/admin/src/app/features',
          },
        };

        outputDir =
          appPaths[options.app]?.[options.target] || './apps/api/src/modules';
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
      process.exit(1);
    }
  });

program
  .command('list-tables')
  .alias('ls')
  .description('List available database tables')
  .action(async () => {
    try {
      const { listTables } = require('./src/database');
      const tables = await listTables();

      console.log('📊 Available database tables:');
      tables.forEach((table) => {
        console.log(`  • ${table.name} (${table.columns} columns)`);
      });
    } catch (error) {
      console.error('❌ Error listing tables:', error.message);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate generated module')
  .argument('<module-name>', 'Module name to validate')
  .action(async (moduleName) => {
    try {
      const { validateModule } = require('./src/validator');
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
      process.exit(1);
    }
  });

program.parse();
