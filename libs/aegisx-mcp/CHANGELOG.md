# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
