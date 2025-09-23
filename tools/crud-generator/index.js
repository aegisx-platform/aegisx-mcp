#!/usr/bin/env node

/**
 * CRUD Generator CLI Tool
 * Generates complete CRUD modules for AegisX platform
 */

const { Command } = require('commander');
const path = require('path');
const { generateCrudModule } = require('./src/generator');
const { version } = require('./package.json');

const program = new Command();

program
  .name('crud-generator')
  .description('Generate complete CRUD modules for AegisX platform')
  .version(version || '1.0.0');

program
  .command('generate')
  .alias('g')
  .description('Generate CRUD module from database table')
  .argument('<table-name>', 'Database table name to generate CRUD for')
  .option('-e, --with-events', 'Include real-time events integration')
  .option('-d, --dry-run', 'Preview files without creating them')
  .option('-o, --output <dir>', 'Output directory', './apps/api/src/modules')
  .option('-c, --config <file>', 'Configuration file path')
  .action(async (tableName, options) => {
    try {
      console.log(`🚀 Generating CRUD module for table: ${tableName}`);
      console.log(`📦 With events: ${options.withEvents ? 'Yes' : 'No'}`);
      console.log(`📁 Output directory: ${options.output}`);
      
      if (options.dryRun) {
        console.log('🔍 Dry run mode - no files will be created');
      }

      const result = await generateCrudModule(tableName, {
        withEvents: options.withEvents,
        dryRun: options.dryRun,
        outputDir: options.output,
        configFile: options.config
      });

      if (options.dryRun) {
        console.log('\n📋 Files that would be generated:');
        result.files.forEach(file => {
          console.log(`  ✓ ${file.path}`);
        });
      } else {
        console.log('\n✅ CRUD module generated successfully!');
        console.log('📂 Generated files:');
        result.files.forEach(file => {
          console.log(`  ✓ ${file.path}`);
        });
      }

      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach(warning => {
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
  .command('list-tables')
  .alias('ls')
  .description('List available database tables')
  .action(async () => {
    try {
      const { listTables } = require('./src/database');
      const tables = await listTables();
      
      console.log('📊 Available database tables:');
      tables.forEach(table => {
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
        result.errors.forEach(error => {
          console.log(`  • ${error}`);
        });
      }
    } catch (error) {
      console.error('❌ Error validating module:', error.message);
      process.exit(1);
    }
  });

program.parse();