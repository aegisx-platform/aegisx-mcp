# [1.1.0](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.12...v1.1.0) (2025-09-15)


### Bug Fixes

* resolve component showcase compilation errors and restore SCSS files ([22a2859](https://github.com/aegisx-platform/aegisx-starter/commit/22a2859fed998fe7b158bc2c2996d721584ce2ba))


### Features

* implement comprehensive component showcase with Material Design and AegisX UI components ([dfc5784](https://github.com/aegisx-platform/aegisx-starter/commit/dfc5784cd873f3fad418820be130b0c4977286fa))
* initialize component-showcase feature planning ([22baf00](https://github.com/aegisx-platform/aegisx-starter/commit/22baf001db7fa9aeb1aa132d7792ea75a82dc085))
* merge component-showcase feature ([ed969b3](https://github.com/aegisx-platform/aegisx-starter/commit/ed969b3d834056ab17ec98b6e078fafd2b2e6cbc))
* **protection:** add comprehensive semantic-release protection system ([b5d8cb0](https://github.com/aegisx-platform/aegisx-starter/commit/b5d8cb037aa02ef1f49a22fd4c40a19bfada2f38))

## [1.0.12](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.11...v1.0.12) (2025-09-15)


### Bug Fixes

* clean up v2.x.x releases and restore clean v1.0.11 state ([c852c58](https://github.com/aegisx-platform/aegisx-starter/commit/c852c5814b639549468ae432c6d9332767129d33))

# Changelog

## [1.0.11](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.10...v1.0.11) (2025-09-15)

### Features

- Complete user activity tracking and profile management system
- Multi-instance development environment with automatic port assignment
- Enhanced authentication with systematic token management
- Avatar upload and display functionality
- Settings management with backend-frontend integration

### Bug Fixes

- Resolve authentication and navigation optimization issues
- Fix multipart form data validation for avatar uploads
- Improve API endpoint integration and error handling

## [Unreleased]

### Features

- **auth**: Enhanced authentication system with systematic token management
  - Systematic token refresh with proactive refresh strategy
  - Enhanced auth interceptor with proper 401 handling and retry logic
  - Improved route guards with proper async state waiting
  - Added loading states using Angular Signals for better UX

- **multi-instance**: Add comprehensive multi-instance development setup
  - Folder-based automatic port assignment and container naming
  - Auto-generated .env.local and docker-compose.override.yml files
  - Port registry system with conflict detection
  - Instance management commands (list, stop, cleanup)
  - Complete isolation between development instances
  - Hash-based consistent port calculation
  - One-command setup workflow with `pnpm setup`

### Developer Experience

- **setup**: Add setup-env.sh script for automatic environment configuration
- **management**: Add port-manager.sh for instance lifecycle management
- **documentation**: Add comprehensive multi-instance development guide
- **git**: Auto-exclude generated files (.env.local, docker-compose.override.yml)
- **workflow**: Update package.json scripts for streamlined setup process

### Documentation

- **guides**: Add multi-instance setup guide with troubleshooting
- **reference**: Add quick command reference for multi-instance workflow
- **examples**: Add port assignment examples and usage patterns

## [1.0.10](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.9...v1.0.10) (2025-09-12)

### Bug Fixes

- force complete Docker cache clear to resolve nginx validation issues ([34cf95e](https://github.com/aegisx-platform/aegisx-starter/commit/34cf95e9d000d51b33a4af0723f986326c673a00))

## [1.0.9](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.8...v1.0.9) (2025-09-12)

### Bug Fixes

- remove github workflow ([5bc00a4](https://github.com/aegisx-platform/aegisx-starter/commit/5bc00a47ab3d6ecc43598c7570f78f621d310df7))

## [1.0.8](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.7...v1.0.8) (2025-09-12)

### Bug Fixes

- remove must-revalidate from ssl setup script nginx config template ([d39f422](https://github.com/aegisx-platform/aegisx-starter/commit/d39f4220cbc3bfa1b702334ecb86e98f9aef9fca))

## [1.0.7](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.6...v1.0.7) (2025-09-12)

### Bug Fixes

- force nginx config refresh with content changes ([c20891c](https://github.com/aegisx-platform/aegisx-starter/commit/c20891c45f0083b7f40b96b94ffbdd3e99f480d0))

## [1.0.6](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.5...v1.0.6) (2025-09-12)

### Bug Fixes

- remove must-revalidate from Cache-Control headers in nginx configs ([54d94f4](https://github.com/aegisx-platform/aegisx-starter/commit/54d94f4ff081bfc64e03fbd0b113edfad9fbd6a2))

## [1.0.5](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.4...v1.0.5) (2025-09-12)

### Bug Fixes

- **dockerfile:** add space ([1067e61](https://github.com/aegisx-platform/aegisx-starter/commit/1067e611f5d713245e11125566227821c4a2d419))

## [1.0.4](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.3...v1.0.4) (2025-09-12)

### Bug Fixes

- force nginx config refresh for Docker builds ([041d383](https://github.com/aegisx-platform/aegisx-starter/commit/041d3838184c9d40998f737b0fce7250b1430073))

## [1.0.3](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.2...v1.0.3) (2025-09-12)

### Bug Fixes

- force Docker image pulls and ensure clean nginx configs ([7056b6d](https://github.com/aegisx-platform/aegisx-starter/commit/7056b6d553598209d9344f18c1aea7ad33607bad))

## [1.0.2](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.1...v1.0.2) (2025-09-12)

### Bug Fixes

- add no-cache flag to all Docker builds to force fresh nginx configs ([ab6bf56](https://github.com/aegisx-platform/aegisx-starter/commit/ab6bf56246cd32d757f481045cf9a22a928a1200))
- resolve nginx configuration errors and update to pnpm ([7717b13](https://github.com/aegisx-platform/aegisx-starter/commit/7717b139c7770bc91101914c5542a5ea50b1a50f))

## [1.0.1](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.0...v1.0.1) (2025-09-12)

### Bug Fixes

- remove invalid must-revalidate from nginx gzip_proxied directive ([afc433b](https://github.com/aegisx-platform/aegisx-starter/commit/afc433b796e450d02a3498a495d220851615f4fd))

# 1.0.0 (2025-09-12)

### Bug Fixes

- add /api prefix to user management routes ([d2bca32](https://github.com/aegisx-platform/aegisx-starter/commit/d2bca32d4051945c468dfb923624330382c0e09d))
- add reflect-metadata import for tsyringe dependency injection ([9e4a899](https://github.com/aegisx-platform/aegisx-starter/commit/9e4a8996a6f411682c4b3b2fe8da60fa265dbdba))
- remove tsyringe dependency injection from users module ([d975e6d](https://github.com/aegisx-platform/aegisx-starter/commit/d975e6d0639af0fdf93d3cf8c3c78d7cd619888f))
- resolve CORS, monitoring endpoints, and user creation issues ([6b82c68](https://github.com/aegisx-platform/aegisx-starter/commit/6b82c6873468254f838affb4bfcdee2ae7752249))
- standardize API response schemas and fix user management ([1126a8c](https://github.com/aegisx-platform/aegisx-starter/commit/1126a8c3a2ecfa6b8192fd9adb06d5b0336b8a4f))
