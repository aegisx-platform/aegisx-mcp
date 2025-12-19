#!/usr/bin/env node

/**
 * CLI file fixture for testing command extraction
 */

const program = require('commander').program;
const { generateCRUD } = require('./generators/crud-generator');
const { generateWithImport } = require('./generators/import-generator');
const { generateWithEvents } = require('./generators/events-generator');

// Main CRUD command
program
  .command('crud <table>')
  .description('Generate basic CRUD operations for a table')
  .option('-f, --force', 'Overwrite existing files without confirmation', false)
  .option(
    '--domain <domain>',
    'Domain and subdomain (e.g., inventory/master-data)',
    undefined,
  )
  .option('--schema <schema>', 'Database schema name', 'public')
  .option('-v, --verbose', 'Show detailed output', false)
  .action(async (table, options) => {
    try {
      console.log(`Generating CRUD for table: ${table}`);
      await generateCRUD(table, options);
    } catch (error) {
      console.error('Error generating CRUD:', error.message);
      process.exit(1);
    }
  });

// CRUD with import command
program
  .command('crud:import <table>')
  .description('Generate CRUD with Excel/CSV import functionality')
  .option('-f, --force', 'Overwrite existing files', false)
  .option('--domain <domain>', 'Domain path', undefined)
  .option('--schema <schema>', 'Database schema', 'public')
  .action(async (table, options) => {
    try {
      await generateWithImport(table, options);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// CRUD with events command
program
  .command('crud:events <table>')
  .description('Generate CRUD with WebSocket real-time events')
  .option('-e, --with-events', 'Include WebSocket events', true)
  .option('-f, --force', 'Overwrite existing files', false)
  .option('--domain <domain>', 'Domain path', undefined)
  .action(async (table, options) => {
    try {
      await generateWithEvents(table, options);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Full package command
program
  .command('crud:full <table>')
  .description('Generate CRUD with all features (import + events + validation)')
  .option('-f, --force', 'Overwrite existing files without confirmation', false)
  .option(
    '--domain <domain>',
    'Domain path (e.g., inventory/operations)',
    undefined,
  )
  .option('--schema <schema>', 'Schema name', 'public')
  .option('--with-import', 'Include import functionality', true)
  .option('--with-events', 'Include real-time events', true)
  .option('--with-validation', 'Include advanced validation', true)
  .action(async (table, options) => {
    console.log(`Full CRUD generation for: ${table}`);
  });

// List available tables
program
  .command('crud:list')
  .description('List available tables in the database')
  .option('--schema <schema>', 'Filter by schema', undefined)
  .action(async (options) => {
    console.log('Available tables...');
  });

program.parse(process.argv);
