# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2025-12-20

### Added

#### API Testing & Authentication Tools

New suite of 7 MCP tools for API testing and authentication workflows:

- **aegisx_auth_login** - Login to AegisX API and store access token for subsequent requests
  - Supports custom base URL (default: `http://localhost:3000`)
  - Environment variable support (`AEGISX_API_URL`)
  - Stores token and user info in memory
  - Displays token expiry information after login

- **aegisx_auth_status** - Check current authentication status
  - Shows logged-in user information
  - Displays token expiry countdown
  - Warns when token is expired
  - Shows login time and base URL

- **aegisx_auth_decode_jwt** - Decode and display JWT token information
  - Decodes header and payload
  - Shows issued time and expiry time
  - Calculates time remaining
  - Works with current token or provided token

- **aegisx_auth_logout** - Logout and clear authentication session
  - Clears stored token and user data
  - Preserves base URL configuration

- **aegisx_api_request** - Make authenticated HTTP requests to API endpoints
  - Supports GET, POST, PUT, PATCH, DELETE methods
  - Automatically includes Authorization header if logged in
  - Custom headers and query parameters support
  - Request/response tracking with timing
  - Pretty-printed JSON responses

- **aegisx_api_history** - View request/response history
  - Stores last 50 requests
  - Shows status codes and response times
  - Filter by HTTP method or status code
  - Displays request/response bodies
  - Timestamped entries

- **aegisx_api_clear_history** - Clear all request history

#### Features

- **Automatic Token Management** - Tokens are stored in memory and automatically attached to requests
- **Request/Response History** - Last 50 requests tracked with full details
- **JWT Token Decoding** - Base64url decoding with expiry validation
- **Response Time Tracking** - Measure API endpoint performance
- **Custom Headers Support** - Add custom headers to any request
- **Query Parameters Support** - Build URLs with query params
- **Configurable Base URL** - Test against different environments
- **Environment Variables** - Support for `AEGISX_API_URL` env var
- **Error Handling** - Detailed error messages with troubleshooting hints
- **Built-in Fetch** - Uses Node.js 18+ native fetch API (zero dependencies)

### Technical Implementation

- **File Created**: `src/tools/api-testing.tool.ts` (750 lines)
- **File Modified**: `src/index.ts` (+147 lines for tool registration)
- **Documentation**: Complete README.md section with examples and features
- **TypeScript**: Full type safety with strict mode compliance
- **No Dependencies**: Uses Node.js built-in `fetch` and `Buffer` APIs
- **State Management**: In-memory auth state and request history
- **Build Status**: ✅ Clean compilation with zero errors

### Changed

- Updated README.md with API Testing & Authentication Tools section
- Enhanced feature list to include API testing capabilities
- Added comprehensive examples for authentication workflow

### Technical Details

- **Lines of Code**: 915 insertions across 3 files
- **New Tools**: 7 API testing and authentication tools
- **Build Time**: TypeScript compilation successful
- **Node.js Requirement**: >=18.0.0 (for native fetch support)

### Use Cases

```bash
# Login to API
aegisx_auth_login({ email: "admin@example.com", password: "password" })

# Check auth status
aegisx_auth_status()

# Decode current JWT token
aegisx_auth_decode_jwt()

# Test protected endpoint
aegisx_api_request({ method: "GET", path: "/api/profile" })

# View request history
aegisx_api_history({ limit: 10 })

# Logout
aegisx_auth_logout()
```

## [1.4.0] - 2025-12-20

### Added

#### API Contract Discovery Tools

- **aegisx_api_list** - List all API endpoints across the codebase with optional feature filtering
- **aegisx_api_search** - Search endpoints by keyword across paths, methods, descriptions, and feature names
- **aegisx_api_get** - Retrieve complete contract details including request/response schemas, authentication, and error responses
- **aegisx_api_validate** - Validate that API implementations match documented contracts, detecting missing endpoints, undocumented routes, and method mismatches

#### Technical Implementation

- Complete markdown parser for `API_CONTRACTS.md` files with support for code blocks and formatting
- Smart search engine with full-text search across endpoint metadata
- Validation logic comparing documented endpoints with actual route implementations
- In-memory caching system for improved performance
- Type-safe implementation using TypeBox schemas throughout

#### Testing & Quality

- Comprehensive test suite with 90 test cases organized in 13 test suites
- 100% test pass rate (90/90 tests passing)
- Test fixtures covering user-profile, budget-request, and RBAC features
- Tests for file discovery, parsing, search, validation, caching, error handling, and edge cases
- Fast execution time (486ms for full suite)

### Changed

- Updated component count from 68+ to 78+ components
- Enhanced README with API Contract Tools documentation
- Added npm badges for version, downloads, and license

### Technical Details

- **Lines of Code**: ~2,984 insertions across 18 files
- **New Files**: 7 (parser, tool handler, test suite, test fixtures)
- **Modified Files**: 3 (index.ts, tsconfig.json, package.json)
- **Zero `any` Types**: Full TypeScript strict mode compliance
- **Build Time**: TypeScript compilation successful with source maps

## [1.3.0] - Previous Release

### Features

- UI Components Reference (78 components)
- CRUD Generator Commands
- Development Patterns
- Design Tokens
- Development Standards

---

## Release Links

- [1.4.0](https://github.com/aegisx-platform/aegisx-mcp/releases/tag/v1.4.0)
- [npm package](https://www.npmjs.com/package/@aegisx/mcp)
