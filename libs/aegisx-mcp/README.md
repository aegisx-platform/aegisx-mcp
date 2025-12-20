# @aegisx/mcp

[![npm version](https://badge.fury.io/js/@aegisx%2Fmcp.svg)](https://www.npmjs.com/package/@aegisx/mcp)
[![Downloads](https://img.shields.io/npm/dm/@aegisx/mcp.svg)](https://www.npmjs.com/package/@aegisx/mcp)
[![License](https://img.shields.io/npm/l/@aegisx/mcp.svg)](https://github.com/aegisx-platform/aegisx-mcp/blob/main/LICENSE)

MCP (Model Context Protocol) server for the AegisX platform. Provides AI assistants with access to AegisX UI components, CRUD generator commands, development patterns, and API contract discovery.

## Features

- **UI Components Reference** - Browse and search 78+ AegisX UI components with full API documentation
- **CRUD Generator Commands** - Build and execute CRUD generation commands with all options
- **Development Patterns** - Access best practices, code templates, and architecture patterns
- **API Contract Discovery** - List, search, and validate API contracts across your codebase
- **API Testing & Authentication** - Login, test protected endpoints, decode JWT tokens, and track request history
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

### API Contract Tools

| Tool                  | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `aegisx_api_list`     | List all API endpoints, optionally filtered by feature |
| `aegisx_api_search`   | Search endpoints by keyword across paths and methods   |
| `aegisx_api_get`      | Get detailed contract for a specific endpoint          |
| `aegisx_api_validate` | Validate implementation matches documented contracts   |

**Examples:**

```
# List all endpoints
Use aegisx_api_list to see all documented APIs.

# Search for budget-related APIs
Use aegisx_api_search with query="budget" to find budget endpoints.

# Get contract details
Use aegisx_api_get with path="/api/profile" to see the full contract.

# Validate a feature
Use aegisx_api_validate with feature="user-profile" to check for mismatches.
```

### API Testing & Authentication Tools

| Tool                       | Description                                                   |
| -------------------------- | ------------------------------------------------------------- |
| `aegisx_auth_login`        | Login to API and store access token (default: localhost:3000) |
| `aegisx_auth_status`       | Check authentication status and token info                    |
| `aegisx_auth_decode_jwt`   | Decode JWT token to view header, payload, and expiry details  |
| `aegisx_auth_logout`       | Logout and clear authentication session                       |
| `aegisx_api_request`       | Make authenticated HTTP requests (GET/POST/PUT/PATCH/DELETE)  |
| `aegisx_api_history`       | View request/response history with filtering                  |
| `aegisx_api_clear_history` | Clear request history                                         |

**Examples:**

```
# Login to API
Use aegisx_auth_login with email and password to authenticate and store token.

# Check authentication status
Use aegisx_auth_status to see current user info and token expiry.

# Decode JWT token
Use aegisx_auth_decode_jwt to inspect token claims and expiration.

# Test protected endpoint
Use aegisx_api_request with method="GET" and path="/api/profile" to call authenticated endpoints.

# View request history
Use aegisx_api_history to see recent API calls with status codes and response times.
```

**Features:**

- ✅ Automatic token management and storage
- ✅ Request/response history (last 50 requests)
- ✅ JWT token decoding and validation
- ✅ Support for custom headers and query parameters
- ✅ Configurable base URL (default: http://localhost:3000)
- ✅ Environment variable support (AEGISX_API_URL)

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
