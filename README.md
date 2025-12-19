# @aegisx/mcp

MCP (Model Context Protocol) server for the AegisX platform. Provides AI assistants with access to AegisX UI components, CRUD generator commands, and development patterns.

## Features

- **UI Components Reference** - Browse and search 68+ AegisX UI components with full API documentation
- **CRUD Generator Commands** - Build and execute CRUD generation commands with all options
- **Development Patterns** - Access best practices, code templates, and architecture patterns
- **Design Tokens** - Reference design tokens for colors, spacing, typography
- **Development Standards** - Access coding standards and guidelines

## Data Synchronization

The component, command, and pattern data files are **auto-generated** from source libraries:

- `src/data/components.ts` - Generated from aegisx-ui components
- `src/data/crud-commands.ts` - Generated from aegisx-cli commands
- `src/data/patterns.ts` - Validated from existing patterns

**⚠️ DO NOT EDIT MANUALLY** - Changes will be overwritten on next sync.

## Installation

### NPM (Global)

```bash
npm install -g @aegisx/mcp
```

### Claude Desktop Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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

## Available Tools

### UI Components

| Tool                       | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| `aegisx_components_list`   | List all UI components, optionally filtered by category |
| `aegisx_components_get`    | Get detailed info about a specific component            |
| `aegisx_components_search` | Search components by name or description                |

**Example:**

```
Use aegisx_components_get with name="Card" to see the Card component API.
```

### CRUD Generator

| Tool                        | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `aegisx_crud_build_command` | Build a CRUD generation command with options         |
| `aegisx_crud_packages`      | View available packages (standard, enterprise, full) |
| `aegisx_crud_files`         | See what files will be generated                     |
| `aegisx_crud_troubleshoot`  | Get help with common issues                          |
| `aegisx_crud_workflow`      | Get complete workflow for a feature                  |

**Example:**

```
Use aegisx_crud_build_command with tableName="products" and withImport=true to get the command.
```

### Development Patterns

| Tool                      | Description                        |
| ------------------------- | ---------------------------------- |
| `aegisx_patterns_list`    | List all patterns by category      |
| `aegisx_patterns_get`     | Get a specific pattern with code   |
| `aegisx_patterns_search`  | Search patterns                    |
| `aegisx_patterns_suggest` | Get pattern suggestions for a task |

**Example:**

```
Use aegisx_patterns_suggest with task="create API endpoint" to get relevant patterns.
```

## Available Resources

| Resource                         | Description                                 |
| -------------------------------- | ------------------------------------------- |
| `aegisx://design-tokens`         | Design tokens (colors, spacing, typography) |
| `aegisx://development-standards` | Coding standards and guidelines             |
| `aegisx://api-reference`         | Backend API conventions                     |
| `aegisx://project-structure`     | Monorepo structure guide                    |
| `aegisx://quick-start`           | Getting started guide                       |

## Component Categories

- **data-display** - Badge, Card, Avatar, KPI Card, Stats Card, List, Timeline, Progress
- **forms** - Date Picker, Input OTP, Knob, Popup Edit, Scheduler, Time Slots
- **feedback** - Alert, Loading Bar, Inner Loading, Splash Screen, Skeleton
- **navigation** - Breadcrumb, Command Palette, Navbar, Launcher
- **layout** - Classic Layout, Compact Layout, Enterprise Layout, Empty Layout
- **auth** - Login Form, Register Form, Reset Password Form, Social Login
- **advanced** - Calendar, Gridster, File Upload, Theme Builder, Theme Switcher
- **overlays** - Drawer

## CRUD Packages

| Package        | Features                                    |
| -------------- | ------------------------------------------- |
| **standard**   | Basic CRUD, pagination, search, soft delete |
| **enterprise** | Standard + Excel/CSV import                 |
| **full**       | Enterprise + WebSocket events               |

## Development

### Sync Data from Source

The sync tool automatically updates data files from source libraries. This runs before each build via the `prebuild` hook.

```bash
cd libs/aegisx-mcp
pnpm run sync           # Update data files
pnpm run sync:dry-run   # Preview changes without writing
pnpm run sync:verbose   # See detailed progress
```

**Note:** The sync process extracts component metadata from `libs/aegisx-ui`, command definitions from `libs/aegisx-cli`, and validates existing patterns. Manual edits to generated data files will be overwritten on next sync.

### Build

```bash
cd libs/aegisx-mcp
pnpm install
pnpm run build
```

The build process automatically runs `pnpm run sync` before compilation to ensure data files are up to date.

### Test Locally

```bash
node dist/index.js
```

### Debug

Set `DEBUG=mcp:*` environment variable for verbose logging.

## License

MIT
