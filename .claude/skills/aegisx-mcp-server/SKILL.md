---
name: aegisx-mcp-server
description: Complete guide for the @aegisx/mcp NPM package. MCP (Model Context Protocol) server providing AI assistants with access to AegisX UI components, CRUD generator, development patterns, and API contract discovery. Use when working with MCP integration, component documentation lookup, or API contract validation.
allowed-tools: Read, Grep, Glob, Write, Bash, WebFetch
---

# AegisX MCP Server (@aegisx/mcp)

MCP (Model Context Protocol) server for the AegisX platform. Provides AI assistants with access to AegisX UI components, CRUD generator commands, development patterns, and API contract discovery.

## When Claude Should Use This Skill

- User asks about "@aegisx/mcp" NPM package
- User wants to set up MCP server for Claude Desktop
- User needs to understand available MCP tools
- User asks about component documentation lookup
- User wants to validate API contracts
- User mentions "Model Context Protocol" or "MCP integration"
- User needs CRUD generator command builder
- User asks about development patterns access

## Package Information

### NPM Package

```bash
# Package name
@aegisx/mcp

# Installation (global)
npm install -g @aegisx/mcp

# Installation (local)
pnpm add -D @aegisx/mcp

# Usage
npx -y @aegisx/mcp
# or
aegisx-mcp
```

### Repository

- **Monorepo**: `libs/aegisx-mcp/` in aegisx-starter-1
- **Standalone**: https://github.com/aegisx-platform/aegisx-mcp
- **NPM**: https://www.npmjs.com/package/@aegisx/mcp

### Current Version

- **v1.4.0** - Latest release with API Contract Discovery tools

## Features

### 1. UI Components Reference

Browse and search 78+ AegisX UI components with full API documentation including:

- Component inputs and outputs
- Usage examples
- Best practices
- Accessibility features

### 2. CRUD Generator Commands

Build and execute CRUD generation commands with:

- Package selection (standard, enterprise, full)
- Option configuration (import, events, validation)
- File preview
- Workflow guidance
- Troubleshooting

### 3. Development Patterns

Access best practices, code templates, and architecture patterns:

- Backend patterns (Fastify routes, TypeBox schemas)
- Frontend patterns (Angular components, signals)
- Database patterns (migrations, queries)
- Testing patterns (unit tests, integration tests)

### 4. API Contract Discovery (v1.4.0)

List, search, and validate API contracts across your codebase:

- Parse API_CONTRACTS.md files
- Search endpoints by keyword
- Validate implementations
- Detect missing/undocumented routes

### 5. Design Tokens & Standards

Access design system resources:

- Color palettes
- Spacing scales
- Typography system
- Coding standards
- Project structure guides

## Installation & Configuration

### Step 1: Install Package

```bash
# Global installation (recommended)
npm install -g @aegisx/mcp

# Or local installation
pnpm add -D @aegisx/mcp
```

### Step 2: Configure Claude Desktop

Add to your Claude Desktop config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "aegisx": {
      "command": "npx",
      "args": ["-y", "@aegisx/mcp"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "aegisx": {
      "command": "aegisx-mcp"
    }
  }
}
```

### Step 3: Restart Claude Desktop

After configuration, restart Claude Desktop to load the MCP server.

## Available Tools

### UI Components Tools

#### `aegisx_components_list`

List all UI components, optionally filtered by category.

**Categories:**

- `data-display` - Badge, Card, Avatar, KPI Card, Stats Card, List, Timeline, Progress
- `forms` - Date Picker, Input OTP, Knob, Popup Edit, Scheduler, Time Slots
- `feedback` - Alert, Loading Bar, Inner Loading, Splash Screen, Skeleton
- `navigation` - Breadcrumb, Command Palette, Navbar, Launcher
- `layout` - Classic Layout, Compact Layout, Enterprise Layout, Empty Layout
- `auth` - Login Form, Register Form, Reset Password Form, Social Login
- `advanced` - Calendar, Gridster, File Upload, Theme Builder, Theme Switcher
- `overlays` - Drawer

**Example:**

```typescript
// List all components
mcp__aegisx__aegisx_components_list();

// List form components only
mcp__aegisx__aegisx_components_list({ category: 'forms' });
```

#### `aegisx_components_get`

Get detailed information about a specific component.

**Example:**

```typescript
// Get Badge component details
mcp__aegisx__aegisx_components_get({ name: 'Badge' });

// Using selector
mcp__aegisx__aegisx_components_get({ name: 'ax-badge' });
```

#### `aegisx_components_search`

Search components by name, description, or functionality.

**Example:**

```typescript
// Search for loading components
mcp__aegisx__aegisx_components_search({ query: 'loading' });

// Search for form-related components
mcp__aegisx__aegisx_components_search({ query: 'form' });
```

### CRUD Generator Tools

#### `aegisx_crud_build_command`

Build a CRUD generation command with specified options.

**Parameters:**

- `tableName` (required) - Database table name in snake_case
- `package` - Package tier: `standard`, `enterprise`, `full`
- `target` - Generation target: `backend`, `frontend` (default: backend)
- `withImport` - Include Excel/CSV import functionality
- `withEvents` - Include WebSocket events for real-time updates
- `dryRun` - Preview files without creating them
- `force` - Overwrite existing files without prompt

**Example:**

```typescript
// Standard CRUD
mcp__aegisx__aegisx_crud_build_command({ tableName: 'products' });

// Enterprise package with import
mcp__aegisx__aegisx_crud_build_command({
  tableName: 'products',
  package: 'enterprise',
  withImport: true,
  force: true,
});

// Full package with all features
mcp__aegisx__aegisx_crud_build_command({
  tableName: 'products',
  package: 'full',
  force: true,
});
```

#### `aegisx_crud_packages`

View available packages and their features.

**Example:**

```typescript
// List all packages
mcp__aegisx__aegisx_crud_packages();

// Get specific package details
mcp__aegisx__aegisx_crud_packages({ packageName: 'enterprise' });
```

#### `aegisx_crud_files`

Show what files will be generated for a CRUD module.

**Example:**

```typescript
// Show backend files
mcp__aegisx__aegisx_crud_files({
  tableName: 'products',
  target: 'backend',
});

// Show all files
mcp__aegisx__aegisx_crud_files({
  tableName: 'products',
  target: 'both',
});
```

#### `aegisx_crud_troubleshoot`

Get troubleshooting help for common CRUD generator issues.

**Example:**

```typescript
mcp__aegisx__aegisx_crud_troubleshoot({
  problem: 'Table not found error',
});
```

#### `aegisx_crud_workflow`

Get the recommended workflow for generating a complete CRUD feature.

**Example:**

```typescript
mcp__aegisx__aegisx_crud_workflow({
  tableName: 'products',
  withImport: true,
  withEvents: false,
});
```

### Development Patterns Tools

#### `aegisx_patterns_list`

List available development patterns and code templates.

**Categories:**

- `backend` - Fastify routes, services, controllers
- `frontend` - Angular components, services, forms
- `database` - Migrations, queries, schemas
- `testing` - Unit tests, integration tests, E2E tests

**Example:**

```typescript
// List all patterns
mcp__aegisx__aegisx_patterns_list();

// List backend patterns only
mcp__aegisx__aegisx_patterns_list({ category: 'backend' });
```

#### `aegisx_patterns_get`

Get a specific development pattern with complete code example and best practices.

**Example:**

```typescript
mcp__aegisx__aegisx_patterns_get({
  name: 'TypeBox Schema Definition',
});

mcp__aegisx__aegisx_patterns_get({
  name: 'Angular Signal-based Component',
});
```

#### `aegisx_patterns_search`

Search development patterns by keyword.

**Example:**

```typescript
// Search for auth patterns
mcp__aegisx__aegisx_patterns_search({ query: 'auth' });

// Search for validation patterns
mcp__aegisx__aegisx_patterns_search({ query: 'validation' });
```

#### `aegisx_patterns_suggest`

Get pattern suggestions for a specific use case or task.

**Example:**

```typescript
mcp__aegisx__aegisx_patterns_suggest({
  task: 'create API endpoint',
});

mcp__aegisx__aegisx_patterns_suggest({
  task: 'build form component',
});
```

### API Contract Tools (v1.4.0)

#### `aegisx_api_list`

List all API endpoints across the codebase with optional feature filtering.

**Example:**

```typescript
// List all endpoints
mcp__aegisx__aegisx_api_list();

// List endpoints for specific feature
mcp__aegisx__aegisx_api_list({ feature: 'user-profile' });
```

#### `aegisx_api_search`

Search endpoints by keyword across paths, methods, descriptions, and feature names.

**Example:**

```typescript
// Search for budget-related APIs
mcp__aegisx__aegisx_api_search({ query: 'budget' });

// Search for user APIs
mcp__aegisx__aegisx_api_search({ query: 'user' });
```

#### `aegisx_api_get`

Retrieve complete contract details including request/response schemas, authentication, and error responses.

**Example:**

```typescript
// Get contract for specific endpoint
mcp__aegisx__aegisx_api_get({
  path: '/api/profile',
  method: 'GET',
});
```

#### `aegisx_api_validate`

Validate that API implementations match documented contracts.

**Example:**

```typescript
// Validate a specific feature
mcp__aegisx__aegisx_api_validate({ feature: 'user-profile' });

// Validate all features
mcp__aegisx__aegisx_api_validate();
```

## Available Resources

Resources are accessed using the MCP resource URI scheme:

### `aegisx://design-tokens`

Design tokens (colors, spacing, typography)

**Content:**

- Color palettes (primary, accent, neutral, semantic)
- Spacing scale (0.25rem to 12rem)
- Typography system (font sizes, weights, families)
- Border radius values
- Shadow definitions

### `aegisx://development-standards`

Coding standards and guidelines

**Content:**

- TypeScript best practices
- Angular coding standards
- Fastify backend conventions
- Database naming conventions
- Testing standards

### `aegisx://api-reference`

Backend API conventions

**Content:**

- RESTful API design patterns
- TypeBox schema usage
- Error handling standards
- Authentication patterns
- Response format specifications

### `aegisx://project-structure`

Monorepo structure guide

**Content:**

- Directory organization
- App structure (api, web, admin)
- Library structure (shared, aegisx-ui, aegisx-cli)
- Configuration files
- Build and deployment structure

### `aegisx://quick-start`

Getting started guide

**Content:**

- Installation steps
- Environment setup
- Database configuration
- Running development servers
- Common commands

## Data Synchronization

The MCP server auto-generates data files from source libraries:

### Sync Process

```bash
cd libs/aegisx-mcp
pnpm run sync           # Update data files
pnpm run sync:dry-run   # Preview changes without writing
pnpm run sync:verbose   # See detailed progress
```

### What Gets Synced

- `src/data/components.ts` - Generated from aegisx-ui components
- `src/data/crud-commands.ts` - Generated from aegisx-cli commands
- `src/data/patterns.ts` - Validated from existing patterns
- `src/data/api-contracts-parser.ts` - API contract parser logic

**⚠️ DO NOT EDIT MANUALLY** - Changes will be overwritten on next sync.

## Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/aegisx-platform/aegisx-mcp.git
cd aegisx-mcp

# Install dependencies
npm install

# Build (automatically runs sync first)
npm run build

# Test locally
node dist/index.js

# Run tests
npm test
```

### Testing

```bash
# Run test suite
npm test

# Test with coverage
npm run test:coverage
```

**Test Coverage:**

- 90 test cases across 13 test suites
- 100% test pass rate
- Fast execution (~486ms)

## Troubleshooting

### Common Issues

1. **"MCP server not found"**

   ```bash
   # Ensure package is installed
   npm install -g @aegisx/mcp

   # Verify installation
   which aegisx-mcp
   # or
   aegisx-mcp --version
   ```

2. **"Connection refused"**

   ```json
   // Check Claude Desktop config
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

   // Ensure correct command
   {
     "mcpServers": {
       "aegisx": {
         "command": "npx",
         "args": ["-y", "@aegisx/mcp"]
       }
     }
   }
   ```

3. **"Tools not appearing"**
   - Restart Claude Desktop completely
   - Check MCP server logs in Claude Desktop developer tools
   - Verify package is up to date: `npm update -g @aegisx/mcp`

4. **"Data out of sync"**

   ```bash
   # In monorepo, rebuild MCP package
   cd libs/aegisx-mcp
   pnpm run sync
   pnpm run build

   # Republish if needed
   npm publish
   ```

## Best Practices

### DO:

- ✅ Use MCP tools to discover components before implementing
- ✅ Validate API contracts before frontend development
- ✅ Search patterns before writing custom code
- ✅ Use CRUD workflow tool for consistent generation
- ✅ Keep MCP package updated for latest component data
- ✅ Use design tokens resource for consistent styling

### DON'T:

- ❌ Manually edit generated data files in aegisx-mcp
- ❌ Skip API contract validation step
- ❌ Reinvent patterns that already exist in the library
- ❌ Ignore component best practices from documentation

## Version Management

### Semantic Versioning

- **Major** (x.0.0): Breaking changes to MCP protocol or tool signatures
- **Minor** (0.x.0): New tools or resources, backward compatible
- **Patch** (0.0.x): Bug fixes, data updates

### Upgrading

```bash
# Check current version
aegisx-mcp --version

# Update to latest
npm update -g @aegisx/mcp

# Update to specific version
npm install -g @aegisx/mcp@1.4.0
```

## Use Cases

### Use Case 1: Component Discovery

```typescript
// User: "I need a loading indicator"
// Claude uses:
mcp__aegisx__aegisx_components_search({ query: 'loading' });

// Result: ax-loading-bar, ax-inner-loading, ax-skeleton
// Claude suggests appropriate component based on use case
```

### Use Case 2: API-First Development

```typescript
// User: "Build a user profile feature"
// Claude uses:
mcp__aegisx__aegisx_api_list({ feature: 'user-profile' });
mcp__aegisx__aegisx_api_get({ path: '/api/profile', method: 'GET' });

// Claude understands contract before implementing
```

### Use Case 3: CRUD Generation

```typescript
// User: "Generate CRUD for products with import"
// Claude uses:
mcp__aegisx__aegisx_crud_build_command({
  tableName: 'products',
  withImport: true,
  force: true,
});

// Returns exact command to execute
```

### Use Case 4: Pattern Reuse

```typescript
// User: "How do I create an Angular component with signals?"
// Claude uses:
mcp__aegisx__aegisx_patterns_get({
  name: 'Angular Signal-based Component',
});

// Returns complete code template with best practices
```

### Use Case 5: Contract Validation

```typescript
// User: "Check if my API implementation matches the spec"
// Claude uses:
mcp__aegisx__aegisx_api_validate({ feature: 'budget-request' });

// Detects missing endpoints, undocumented routes, method mismatches
```

## Resources

- **Documentation**: [README.md](https://github.com/aegisx-platform/aegisx-mcp#readme)
- **MCP Protocol**: [Model Context Protocol Specification](https://modelcontextprotocol.io)
- **Issues**: https://github.com/aegisx-platform/aegisx-mcp/issues
- **Changelog**: [CHANGELOG.md](https://github.com/aegisx-platform/aegisx-mcp/blob/main/CHANGELOG.md)
- **NPM Package**: https://www.npmjs.com/package/@aegisx/mcp

## Related Skills

- `aegisx-ui-library` - UI component implementation guide
- `aegisx-cli-library` - CRUD generator library guide
- `angular-frontend-expert` - Angular development expertise
- `fastify-backend-architect` - Backend architecture patterns
- `api-designer` - API design and contracts
