const { getDatabaseSchema } = require('./src/database');
const { renderTemplate } = require('./src/generator');

async function testTemplate() {
  console.log('Testing template rendering...');
  
  // Get schema
  const schema = await getDatabaseSchema('api_keys');
  console.log('Schema columns:', schema.columns.length);
  console.log('First column:', schema.columns[0]);
  
  // Create context
  const context = {
    ModuleName: 'ApiKeys',
    columns: schema.columns
  };
  
  console.log('Context columns:', context.columns.length);
  
  // Create test template
  const testTemplate = `// Test template
{{#each columns}}
{{name}}: {{{typeboxType}}}{{#unless @last}},{{/unless}}
{{/each}}`;
  
  const fs = require('fs').promises;
  await fs.writeFile('./templates/test-template.hbs', testTemplate);
  
  // Render template
  const result = await renderTemplate('test-template.hbs', context);
  console.log('Rendered result:');
  console.log(result);
}

testTemplate().catch(console.error);