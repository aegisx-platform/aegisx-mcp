/**
 * Quick validation script for TypeScript parser utility
 */
import * as ts from 'typescript';
import {
  createSourceFile,
  findDecorator,
  getDecoratorArguments,
  getPropertyType,
  getPropertyInitializer,
  findNodesByKind,
  isExported,
  getDeclarationName,
} from '../utils/ts-parser.js';

const sampleFilePath = './scripts/sync/__tests__/fixtures/sample-component.ts';

console.log('Testing TypeScript Parser Utility\n');
console.log('='.repeat(50));

try {
  // Test createSourceFile
  console.log('\n1. Testing createSourceFile()...');
  const sourceFile = createSourceFile(sampleFilePath);
  console.log(`✓ Created source file: ${sourceFile.fileName}`);

  // Find the class declaration
  const classes = findNodesByKind<ts.ClassDeclaration>(
    sourceFile,
    ts.SyntaxKind.ClassDeclaration,
  );
  console.log(`✓ Found ${classes.length} class(es)`);

  if (classes.length > 0) {
    const classNode = classes[0];
    const className = getDeclarationName(classNode);
    console.log(`✓ Class name: ${className}`);
    console.log(`✓ Is exported: ${isExported(classNode)}`);

    // Test findDecorator on class
    console.log('\n2. Testing findDecorator() on class...');
    const componentDecorator = findDecorator(classNode, 'Component');
    if (componentDecorator) {
      console.log('✓ Found @Component decorator');

      // Test getDecoratorArguments
      console.log('\n3. Testing getDecoratorArguments()...');
      const args = getDecoratorArguments(componentDecorator);
      console.log(`✓ Decorator arguments:`, JSON.stringify(args, null, 2));
    }

    // Test property analysis
    console.log('\n4. Testing property analysis...');
    const properties = classNode.members.filter(ts.isPropertyDeclaration);
    console.log(`✓ Found ${properties.length} properties`);

    properties.forEach((prop, idx) => {
      const propName = getDeclarationName(prop);
      const propType = getPropertyType(prop);
      const propInitializer = getPropertyInitializer(prop);
      const inputDecorator = findDecorator(prop, 'Input');
      const outputDecorator = findDecorator(prop, 'Output');

      console.log(`\n   Property ${idx + 1}: ${propName}`);
      console.log(`   - Type: ${propType}`);
      if (propInitializer) {
        console.log(`   - Initializer: ${propInitializer}`);
      }
      if (inputDecorator) {
        const inputArgs = getDecoratorArguments(inputDecorator);
        console.log(`   - @Input decorator:`, inputArgs);
      }
      if (outputDecorator) {
        console.log(`   - @Output decorator found`);
      }
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log('✓ All tests passed successfully!\n');
} catch (error) {
  console.error('\n✗ Test failed:', error);
  process.exit(1);
}
