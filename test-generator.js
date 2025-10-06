const path = require('path');

// Change to tools/crud-generator directory
process.chdir(path.join(__dirname, 'tools/crud-generator'));

// Import and run the generator
const { generateCrudModule } = require('./src/generator');
const { generateFrontend } = require('./src/frontend-generator');

async function main() {
  console.log('🚀 Starting CRUD generation for simple_tests');

  try {
    // Generate backend
    console.log('📡 Generating backend...');
    await generateCrudModule('simple_tests');

    // Generate frontend
    console.log('🎨 Generating frontend...');
    await generateFrontend('simple_tests');

    console.log('✅ Generation completed successfully!');
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    console.error(error.stack);
  }
}

main();
