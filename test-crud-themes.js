#!/usr/bin/env node

// Test script for themes CRUD generation
const {
  generateMigrationFile,
} = require('./tools/crud-generator/src/role-generator');

async function testThemes() {
  try {
    console.log('🧪 Testing themes migration generation...');
    console.log('Current working directory:', process.cwd());

    // Test migration generation
    const result = await generateMigrationFile('themes', {
      dryRun: false,
      outputDir: './apps/api/src/database/migrations',
    });

    console.log('✅ Migration created successfully!');
    console.log('📁 File:', result.migrationFile);
    console.log('📊 Permissions:', result.permissions.length);
    console.log('👥 Roles:', result.roles.length);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testThemes();
