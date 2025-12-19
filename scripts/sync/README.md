# AegisX MCP Sync Tool

## Overview

The AegisX MCP Sync Tool automatically extracts metadata from source libraries and generates TypeScript data files for the MCP server. This tool ensures that component, command, and pattern metadata stays synchronized with the source of truth in `aegisx-ui`, `aegisx-cli`, and the patterns repository.

### What It Does

The sync tool performs three main operations:

1. **Extracts Metadata** - Scans source files (Angular components, CLI commands, development patterns) and extracts structured metadata
2. **Transforms Data** - Converts extracted metadata into standardized TypeScript interfaces
3. **Generates Files** - Writes formatted, validated TypeScript files to the data directory

### Generated Files

The tool maintains three core data files:

- **`libs/aegisx-mcp/src/data/components.ts`** - Component metadata from `aegisx-ui`
- **`libs/aegisx-mcp/src/data/crud-commands.ts`** - Command metadata from `aegisx-cli`
- **`libs/aegisx-mcp/src/data/patterns.ts`** - Development patterns (manual + auto-generated)

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Sync Script Entry Point                  │
│                      (sync.ts)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │Component │   │ Command │   │ Pattern │
   │Extractor │   │Extractor│   │Extractor│
   └────┬────┘   └────┬────┘   └────┬────┘
        │              │              │
        ▼              ▼              ▼
   Component      Command          Pattern
   Metadata       Metadata         Metadata
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │Components│  │ Commands│   │ Patterns│
   │Generator │  │Generator │   │Generator│
   └────┬────┘   └────┬────┘   └────┬────┘
        │              │              │
        ▼              ▼              ▼
  components.ts crud-commands.ts patterns.ts
```

### Component Overview

#### Phase 1: Extractors

Extractors scan source files and pull out metadata.

**Component Extractor** (`extractors/component-extractor.ts`)

- Scans `libs/aegisx-ui/src/lib/components/`
- Extracts @Component decorator metadata (selector, name, standalone)
- Extracts @Input decorators with types and defaults
- Extracts @Output decorators with event types
- Parses JSDoc comments for descriptions and usage examples
- Determines category from directory structure

**Command Extractor** (`extractors/command-extractor.ts`)

- Reads `libs/aegisx-cli/docs/QUICK_REFERENCE.md` for package information
- Scans `libs/aegisx-cli/lib/generators/` for command definitions
- Extracts command names, descriptions, and options
- Parses option types (boolean, string, number) and defaults
- Extracts usage examples and notes

**Pattern Extractor** (`extractors/pattern-extractor.ts`)

- Reads existing `libs/aegisx-mcp/src/data/patterns.ts`
- Validates pattern structure and completeness
- Supports future auto-discovery from template files

#### Phase 2: Generators

Generators transform extracted metadata into valid TypeScript files.

**Components Generator** (`generators/components-generator.ts`)

- Converts ExtractedComponent[] to ComponentInfo format
- Generates valid TypeScript with imports and interfaces
- Applies code formatting with consistent indentation
- Adds file header with generation timestamp

**Commands Generator** (`generators/commands-generator.ts`)

- Transforms ExtractedCommand[] and ExtractedPackage[] to target format
- Generates TypeScript interfaces and data arrays
- Formats output with proper structure
- Includes package information for CRUD features

**Patterns Generator** (`generators/patterns-generator.ts`)

- Converts ExtractedPattern[] to CodePattern format
- Properly escapes code snippets in template literals
- Preserves code formatting in examples
- Maintains pattern categories and metadata

#### Phase 3: Utilities

Shared utilities provide core functionality.

| Utility               | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| **ts-parser.ts**      | TypeScript AST parsing via compiler API            |
| **jsdoc-parser.ts**   | JSDoc comment extraction and parsing               |
| **file-scanner.ts**   | Recursive directory scanning with pattern matching |
| **code-formatter.ts** | TypeScript code formatting and header generation   |
| **file-writer.ts**    | Safe file writing with TypeScript validation       |
| **logger.ts**         | Consistent logging across all modules              |

---

## Usage

### Quick Start

```bash
# Run sync before building
pnpm run sync

# Preview changes without writing files
pnpm run sync:dry-run

# Show detailed progress information
pnpm run sync:verbose

# View help information
pnpm run sync --help
```

### CLI Options

| Option      | Alias | Purpose                                      |
| ----------- | ----- | -------------------------------------------- |
| `--dry-run` | `-d`  | Preview changes without writing files        |
| `--verbose` | `-v`  | Show detailed progress and debug information |
| `--help`    | `-h`  | Display help message                         |

### Combined Options

```bash
# Preview with detailed output
pnpm run sync:dry-run --verbose

# Verbose mode only
pnpm run sync --verbose
```

### Package.json Integration

The sync tool is integrated into the build process:

```json
{
  "scripts": {
    "sync": "tsx scripts/sync/sync.ts",
    "sync:dry-run": "tsx scripts/sync/sync.ts --dry-run",
    "sync:verbose": "tsx scripts/sync/sync.ts --verbose",
    "prebuild": "pnpm run sync",
    "build": "tsc"
  }
}
```

This ensures:

- Every build starts with fresh, synced data
- CI/CD pipelines automatically sync before deployment
- Local development stays synchronized with source libraries

---

## How It Works

### Step-by-Step Process

#### 1. Extract Components

```bash
# Scans libs/aegisx-ui/src/lib/components/
# Extracts metadata for each component:
# - Selector: ax-badge
# - Inputs: variants, size, content
# - Outputs: clicked
# - Description from @Component and JSDoc
```

The component extractor:

- Finds all `.component.ts` files recursively
- Parses TypeScript using the compiler API
- Extracts @Component decorator metadata
- Maps directory structure to categories
- Parses @Input/@Output decorators
- Extracts JSDoc comments for descriptions

#### 2. Extract Commands

```bash
# Reads libs/aegisx-cli/docs/QUICK_REFERENCE.md
# Parses package information (standard, enterprise, full)
# Scans libs/aegisx-cli/lib/generators/ for command files
# Extracts command definitions and options
```

The command extractor:

- Reads markdown documentation for package info
- Scans JavaScript/TypeScript generator files
- Parses commander.js command definitions
- Extracts options with types and defaults
- Combines data from multiple sources

#### 3. Extract Patterns

```bash
# Reads existing libs/aegisx-mcp/src/data/patterns.ts
# Validates pattern structure
# Prepares for code generation
```

The pattern extractor:

- Reads current patterns file as baseline
- Validates required fields are present
- Prepares data for regeneration
- Future: supports auto-discovery from templates

#### 4. Generate TypeScript Files

```typescript
// Generated output structure
/**
 * Component metadata from aegisx-ui
 * Auto-generated by aegisx-mcp sync tool
 * Generated: 2025-12-19T14:52:00.000Z
 */

export interface ComponentInfo {
  name: string;
  selector: string;
  category: string;
  description: string;
  inputs: Input[];
  outputs: Output[];
  usage: string;
  bestPractices: string[];
}

export const components: ComponentInfo[] = [
  // Generated component data
];
```

The generators:

- Transform extracted data to interfaces
- Generate valid TypeScript code
- Apply consistent formatting
- Add generation metadata
- Write to output files

#### 5. Validate and Write

```bash
# Validates TypeScript compilation
# Checks for syntax errors
# Writes files atomically
# Reports statistics
```

Validation steps:

- Compiles generated TypeScript with `tsc`
- Checks all interfaces are valid
- Validates no `any` types are used
- Ensures files are syntactically correct
- Reports errors with file paths

### Data Flow Example

```
Component File: ax-badge.component.ts
    ↓
TypeScript Parser extracts @Component decorator
    ↓
JSDoc Parser extracts description and examples
    ↓
ComponentInfo interface populated
    ↓
Code Formatter formats TypeScript
    ↓
File Writer validates and writes components.ts
    ↓
Build system compiles components.ts successfully
```

---

## Common Workflows

### Daily Development

After modifying a component or command:

```bash
# Sync data automatically before build
pnpm run build

# Or sync separately first
pnpm run sync
pnpm run build
```

### Testing Changes

Before committing changes:

```bash
# Preview what will change
pnpm run sync:dry-run

# View verbose output
pnpm run sync:verbose

# If satisfied, run actual sync
pnpm run sync
```

### Debugging Issues

When troubleshooting extraction problems:

```bash
# See detailed progress and all extracted files
pnpm run sync:verbose

# Try dry-run to see what would be generated
pnpm run sync:dry-run

# Check source files are accessible
ls libs/aegisx-ui/src/lib/components/
ls libs/aegisx-cli/lib/
```

### CI/CD Integration

In continuous integration pipelines:

```bash
# Sync is automatic via prebuild hook
pnpm run build

# Or explicitly:
pnpm run sync
pnpm run build

# Verify MCP server works with generated data
node dist/index.js
```

---

## Troubleshooting

### Common Errors and Solutions

#### Error: "Cannot find module 'tsx'"

**Cause:** TypeScript runner not installed in devDependencies

**Solution:**

```bash
cd libs/aegisx-mcp
pnpm install

# Or install tsx specifically
pnpm add -D tsx
```

#### Error: "ENOENT: no such file or directory"

**Cause:** Source files not found (missing aegisx-ui or aegisx-cli)

**Solution:**

```bash
# Check source files exist
ls libs/aegisx-ui/src/lib/components/
ls libs/aegisx-cli/lib/

# Verify project structure
pnpm ls aegisx-ui
pnpm ls aegisx-cli
```

**Prevention:** Ensure all dependencies are installed with `pnpm install`

#### Error: "TypeScript compilation failed"

**Cause:** Generated file has syntax errors or interface mismatches

**Solution:**

```bash
# Preview with verbose output
pnpm run sync:verbose

# Check generated file for errors
cat libs/aegisx-mcp/src/data/components.ts | head -30

# Check source files for malformed syntax
pnpm run sync:verbose 2>&1 | grep "Error"
```

**Prevention:** Keep source components well-formed with proper decorators

#### Error: "Permission denied writing to output file"

**Cause:** File permissions issue or file is locked

**Solution:**

```bash
# Check file permissions
ls -la libs/aegisx-mcp/src/data/components.ts

# Fix permissions
chmod 644 libs/aegisx-mcp/src/data/components.ts

# Or remove and regenerate
rm libs/aegisx-mcp/src/data/components.ts
pnpm run sync
```

#### Warning: "Component missing @Component decorator"

**Cause:** File doesn't have proper Angular @Component decorator

**Solution:**

```bash
# Identify problematic file from verbose output
pnpm run sync:verbose 2>&1 | grep "missing"

# Check the component file
cat libs/aegisx-ui/src/lib/components/path/to/component.ts

# Fix by adding proper decorator:
@Component({
  selector: 'ax-component-name',
  standalone: true,
  imports: [],
  templateUrl: './component-name.component.html',
  styleUrls: ['./component-name.component.scss'],
})
```

#### Warning: "Command file could not be parsed"

**Cause:** JavaScript generator file has invalid syntax or unexpected structure

**Solution:**

```bash
# Check which file caused the issue
pnpm run sync:verbose

# Inspect the generator file
cat libs/aegisx-cli/lib/generators/problem-generator.js

# Verify commander.js structure
grep -n "new Command" libs/aegisx-cli/lib/generators/*.js
```

#### Error: "Generated files have more than current files"

**Cause:** Usually not an error - new components/commands were added

**Solution:**

```bash
# Review what was generated
pnpm run sync:dry-run --verbose

# Check git diff
git diff libs/aegisx-mcp/src/data/

# If expected, commit changes
git add libs/aegisx-mcp/src/data/
git commit -m "chore: sync metadata from aegisx-ui and aegisx-cli"
```

### Diagnosis Guide

If sync fails, follow this checklist:

1. **Check Dependencies**

   ```bash
   cd libs/aegisx-mcp
   pnpm install
   ```

2. **Verify Source Files**

   ```bash
   ls libs/aegisx-ui/src/lib/components/*.component.ts
   ls libs/aegisx-cli/lib/generators/*.js
   ```

3. **Run with Verbose Output**

   ```bash
   pnpm run sync:verbose
   ```

4. **Check TypeScript Compilation**

   ```bash
   pnpm run sync
   pnpm run build
   ```

5. **Review Generated Files**

   ```bash
   head -50 libs/aegisx-mcp/src/data/components.ts
   ```

6. **Check for Specific Errors**
   ```bash
   # Look for error messages in recent component/command files
   git diff HEAD~1 libs/aegisx-ui/src/lib/components/
   git diff HEAD~1 libs/aegisx-cli/lib/
   ```

---

## Extending the Sync Tool

### Adding a New Extractor

To add extraction for a new metadata type:

1. **Create Extractor File**

   ```typescript
   // scripts/sync/extractors/my-extractor.ts

   export interface ExtractedMyData {
     name: string;
     description: string;
     // Your fields
   }

   export async function extractMyData(sourceDir: string): Promise<ExtractedMyData[]> {
     // Implementation
     const results: ExtractedMyData[] = [];

     // Scan files using file-scanner
     const files = scanDirectory(sourceDir, /\.my-file\.ts$/);

     // Parse using ts-parser and jsdoc-parser
     for (const file of files) {
       const sourceFile = createSourceFile(file);
       // Extract metadata
     }

     return results;
   }
   ```

2. **Update Sync Script**

   ```typescript
   // scripts/sync/sync.ts

   import { extractMyData } from './extractors/my-extractor.js';

   // In main function:
   const [components, commands, patterns, myData] = await Promise.all([
     extractComponents(componentsDir),
     extractCommands(cliDir),
     extractPatterns(patternsFile),
     extractMyData(mySourceDir), // Add this
   ]);
   ```

3. **Generate Data**
   ```typescript
   // Call generator with extracted data
   await generateMyDataFile(myData, outputPath, options);
   ```

### Adding a New Generator

To add generation of a new data file:

1. **Create Generator File**

   ```typescript
   // scripts/sync/generators/my-generator.ts

   import { ExtractedMyData } from '../extractors/my-extractor.js';

   export async function generateMyDataFile(data: ExtractedMyData[], outputPath: string, options: GeneratorOptions): Promise<GenerationResult> {
     // Transform to target interface
     const myDataInfo = data.map((item) => ({
       name: item.name,
       description: item.description,
     }));

     // Generate TypeScript code
     let code = `export const myData = [\n`;

     for (const item of myDataInfo) {
       code += `  { name: '${item.name}', description: '${item.description}' },\n`;
     }

     code += `];\n`;

     // Format and write
     const formatted = formatTypeScript(code);
     const withHeader = addFileHeader(formatted, {
       generatedAt: new Date(),
       description: 'My custom data',
     });

     if (!options.dryRun) {
       await writeFile(outputPath, withHeader, {
         validateTypeScript: true,
       });
     }

     return {
       filePath: outputPath,
       itemCount: data.length,
       success: true,
     };
   }
   ```

2. **Update Sync Script**

   ```typescript
   // scripts/sync/sync.ts
   import { generateMyDataFile } from './generators/my-generator.js';

   // Call with extracted data
   const myDataResult = await generateMyDataFile(extractedMyData, dataOutputPath, options);
   stats.filesGenerated.push(myDataResult.filePath);
   ```

### Modifying Extraction Logic

To change how data is extracted:

1. **Update Extractor**

   ```typescript
   // scripts/sync/extractors/component-extractor.ts

   // Example: Add new property extraction
   export interface ExtractedComponent {
     name: string;
     selector: string;
     category: string;
     description: string;
     inputs: ExtractedInput[];
     outputs: ExtractedOutput[];
     usage: string;
     bestPractices: string[];
     relatedComponents: string[];
     newField: string; // Add your new field
   }

   // Update extraction logic
   function extractComponent(file: string): ExtractedComponent {
     // Existing extraction

     // Add new field extraction
     const newField = extractNewField(sourceFile);

     return {
       // Existing fields
       newField,
     };
   }
   ```

2. **Update Interfaces**

   ```typescript
   // Update both ExtractedComponent and ComponentInfo to match
   ```

3. **Test Changes**
   ```bash
   pnpm run sync:dry-run --verbose
   npm run test -- extractors/component-extractor.test.ts
   ```

### Adding Utilities

Common utilities are in `scripts/sync/utils/`:

- **ts-parser.ts** - TypeScript compiler API wrappers
- **jsdoc-parser.ts** - JSDoc extraction functions
- **file-scanner.ts** - File system operations
- **code-formatter.ts** - Code generation formatting
- **file-writer.ts** - Safe file I/O
- **logger.ts** - Console logging

To add a utility function:

```typescript
// scripts/sync/utils/my-utility.ts

export function myUtilityFunction(input: string): string {
  // Implementation
  return result;
}

// Export for use in extractors/generators
```

---

## Testing

### Running Tests

```bash
# Run all tests
cd libs/aegisx-mcp
pnpm test

# Run specific test suite
pnpm test -- component-extractor.test.ts

# Run with coverage
pnpm test -- --coverage

# Watch mode
pnpm test -- --watch
```

### Test Organization

```
scripts/sync/__tests__/
├── utils/
│   ├── ts-parser.test.ts
│   ├── jsdoc-parser.test.ts
│   ├── file-scanner.test.ts
│   ├── code-formatter.test.ts
│   └── file-writer.test.ts
├── extractors/
│   ├── component-extractor.test.ts
│   ├── command-extractor.test.ts
│   └── pattern-extractor.test.ts
├── generators/
│   ├── components-generator.test.ts
│   ├── commands-generator.test.ts
│   └── patterns-generator.test.ts
├── integration/
│   └── sync-workflow.test.ts
└── fixtures/
    ├── components/
    │   ├── basic-component.ts
    │   └── complex-component.ts
    └── patterns.ts
```

### Writing Tests

Example test for a new extractor:

```typescript
import { describe, it, expect } from 'vitest';
import { extractMyData } from '../extractors/my-extractor';

describe('MyExtractor', () => {
  it('should extract data from valid files', async () => {
    const result = await extractMyData('./fixtures/my-data');
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('name');
  });

  it('should handle missing files gracefully', async () => {
    const result = await extractMyData('./nonexistent');
    expect(result).toEqual([]);
  });

  it('should skip invalid entries', async () => {
    const result = await extractMyData('./fixtures/mixed');
    // Valid entries only
    expect(result.every((r) => r.name)).toBe(true);
  });
});
```

---

## Data File Format

### components.ts Structure

```typescript
export interface ComponentInfo {
  name: string;
  selector: string;
  category: string;
  description: string;
  inputs: Input[];
  outputs: Output[];
  usage: string;
  bestPractices: string[];
}

export const components: ComponentInfo[] = [
  {
    name: 'Badge',
    selector: 'ax-badge',
    category: 'data-display',
    description: 'Display status badges...',
    inputs: [{ name: 'variant', type: 'string', description: '...' }],
    outputs: [{ name: 'click', type: 'EventEmitter<Event>' }],
    usage: 'Template usage examples...',
    bestPractices: ['Use for status...'],
  },
];
```

### crud-commands.ts Structure

```typescript
export interface CommandInfo {
  name: string;
  description: string;
  usage: string;
  options: CommandOption[];
  examples: string[];
}

export interface PackageInfo {
  name: string;
  description: string;
  features: string[];
  command: string;
}

export const commands: CommandInfo[] = [
  {
    name: 'crud',
    description: 'Generate CRUD module...',
    usage: 'pnpm run crud -- TABLE_NAME',
    options: [
      {
        name: '--force',
        description: 'Overwrite existing...',
        type: 'boolean',
      },
    ],
    examples: ['pnpm run crud -- products --force'],
  },
];

export const packages: PackageInfo[] = [
  {
    name: 'standard',
    description: 'Basic CRUD functionality',
    features: ['Create', 'Read', 'Update', 'Delete'],
    command: 'pnpm run crud -- TABLE --force',
  },
];
```

### patterns.ts Structure

```typescript
export interface CodePattern {
  name: string;
  category: 'backend' | 'frontend' | 'database' | 'testing';
  code: string;
  language: string;
  description?: string;
  notes?: string[];
}

export const patterns: CodePattern[] = [
  {
    name: 'TypeBox Schema Definition',
    category: 'backend',
    code: `const MySchema = Type.Object({
      id: Type.String({ format: 'uuid' }),
      name: Type.String(),
    });`,
    language: 'typescript',
    description: '...',
    notes: ['Using Type.Object for validation...'],
  },
];
```

---

## Performance

The sync tool is designed to be fast:

- **Component Extraction:** ~1-2 seconds for 40+ components
- **Command Extraction:** ~0.5-1 second for 10+ commands
- **Generation:** ~0.2-0.5 seconds for all files
- **Total Sync Time:** 2-4 seconds typical

### Optimization Tips

1. **Avoid Large Components**
   - Keep component files focused
   - Extract complex logic to services

2. **Cache Results (Future)**
   - Watch mode would cache parsed components
   - Only re-extract modified files

3. **Parallel Extraction**
   - Sync tool runs extractors in parallel
   - Uses `Promise.all()` for multi-core efficiency

---

## Notes

### Important Reminders

- Generated files should **not be manually edited**
- Run sync before each build to ensure freshness
- Use `--dry-run` to preview changes before applying
- Check git diff after running sync in CI/CD

### File Watchlist

After running sync, check these files:

```bash
git diff libs/aegisx-mcp/src/data/components.ts
git diff libs/aegisx-mcp/src/data/crud-commands.ts
git diff libs/aegisx-mcp/src/data/patterns.ts
```

### Future Enhancements

Planned improvements:

- **Watch Mode:** Auto-sync on file changes during development
- **Incremental Sync:** Only re-extract modified files
- **HTML Reports:** Generate sync result reports
- **Configuration File:** Customizable extraction rules
- **Pattern Auto-Discovery:** Extract patterns from templates

---

## Support

For issues or questions:

1. Check this README's **Troubleshooting** section
2. Review sync verbose output: `pnpm run sync:verbose`
3. Check generated file syntax: View output in data directory
4. Consult design document: `.spec-workflow/specs/aegisx-mcp-sync-automation/design.md`
