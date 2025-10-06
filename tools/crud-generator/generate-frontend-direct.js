#!/usr/bin/env node

const path = require('path');
const FrontendGenerator = require('./src/frontend-generator');

async function generateFrontendDirect() {
  try {
    const toolsDir = __dirname;
    const projectRoot = path.resolve(toolsDir, '..', '..');

    // Get module name from command line argument or default to articles
    const moduleName = process.argv[2] || 'articles';

    console.log(`🚀 Starting direct frontend generation for ${moduleName}`);
    console.log('📁 Tools directory:', toolsDir);
    console.log('📁 Project root:', projectRoot);

    const generator = new FrontendGenerator(toolsDir, projectRoot);

    // Generate frontend with fallback (no database required)
    const options = {
      app: 'web',
      target: 'frontend',
      force: true,
      outputDir: path.resolve(projectRoot, 'apps/web/src/app/features'),
      enhanced: true,
      full: false,
    };

    console.log('📊 Generation options:', options);

    const generatedFiles = await generator.generateFrontendModule(
      moduleName,
      options,
    );

    console.log('\n✅ Frontend generation completed successfully!');
    console.log('📂 Generated files:');
    generatedFiles.forEach((file) => {
      console.log(`  ✓ ${file}`);
    });
  } catch (error) {
    console.error('\n❌ Error in direct frontend generation:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the generation
generateFrontendDirect();
