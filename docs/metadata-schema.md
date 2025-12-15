---
title: Documentation Metadata Schema
description: YAML frontmatter schema and controlled vocabulary for AegisX Platform documentation
category: reference
tags: [documentation, metadata, standards]
order: 1
---

# Documentation Metadata Schema

This document defines the YAML frontmatter schema and controlled vocabulary for all AegisX Platform documentation. Following these standards ensures consistency and enables automatic web documentation generation with VitePress, Docusaurus, or MkDocs.

## Frontmatter Schema

All markdown files in `docs/` should include YAML frontmatter at the beginning of the file:

```yaml
---
title: 'Human-readable title'
description: 'Brief description (1-2 sentences) for search and previews'
category: 'getting-started | guides | reference | architecture | features'
tags: ['tag1', 'tag2', 'tag3']
order: 10
---
```

### Required Fields

| Field         | Type   | Description                                                | Example                                            |
| ------------- | ------ | ---------------------------------------------------------- | -------------------------------------------------- |
| `title`       | string | Human-readable page title                                  | `"API Response Standard"`                          |
| `description` | string | Brief 1-2 sentence description for SEO and search          | `"Standard response format for all API endpoints"` |
| `category`    | string | Primary documentation category (see controlled vocabulary) | `"reference"`                                      |

### Optional Fields

| Field         | Type   | Description                                                   | Example                           |
| ------------- | ------ | ------------------------------------------------------------- | --------------------------------- |
| `tags`        | array  | Keywords for search and filtering (see controlled vocabulary) | `["api", "backend", "standards"]` |
| `order`       | number | Navigation order within section (lower = earlier)             | `10`                              |
| `author`      | string | Document author (optional)                                    | `"Platform Team"`                 |
| `lastUpdated` | string | Last update date (ISO 8601 format)                            | `"2025-12-14"`                    |
| `status`      | string | Document status: `draft`, `review`, `published`, `archived`   | `"published"`                     |
| `relatedDocs` | array  | Links to related documentation                                | `["api-calling-standard.md"]`     |

## Controlled Vocabulary

### Categories (Primary Classification)

Use **exactly one** of these categories for the `category` field:

| Category          | Description                                 | Example Docs                                              |
| ----------------- | ------------------------------------------- | --------------------------------------------------------- |
| `getting-started` | Onboarding and quick start guides           | Installation, First Steps, Project Overview               |
| `guides`          | Task-oriented how-to documentation          | Feature Development, CI/CD Setup, Database Migration      |
| `reference`       | Information-oriented technical reference    | API Documentation, Component Reference, CLI Commands      |
| `architecture`    | Understanding-oriented design documentation | System Architecture, Design Patterns, Technical Decisions |
| `features`        | Feature-specific documentation              | Feature README, API Reference, Developer Guide            |
| `analysis`        | Technical analysis and research             | Migration Analysis, Platform Gap Analysis                 |
| `reports`         | Audit and review reports                    | Performance Reports, Security Audits                      |

### Tags (Secondary Classification)

Tags provide additional categorization for search and filtering. Use tags from the controlled vocabulary below:

#### Technology Tags

```yaml
tags: [backend, frontend, database, api, ui, cli, websocket]
```

- `backend` - Backend/server-side technology
- `frontend` - Frontend/client-side technology
- `database` - Database-related content
- `api` - API design and implementation
- `ui` - User interface components
- `cli` - Command-line tools
- `websocket` - Real-time WebSocket functionality

#### Activity Tags

```yaml
tags: [development, deployment, testing, architecture, migration, security, performance]
```

- `development` - Development workflows and practices
- `deployment` - Deployment and infrastructure
- `testing` - Testing strategies and guides
- `architecture` - Architectural design and patterns
- `migration` - Migration guides and strategies
- `security` - Security best practices
- `performance` - Performance optimization

#### Feature/Domain Tags

```yaml
tags: [authentication, authorization, crud, rbac, file-upload, pdf-export, notifications]
```

- `authentication` - User authentication
- `authorization` - User authorization and permissions
- `crud` - CRUD operations and generators
- `rbac` - Role-based access control
- `file-upload` - File upload functionality
- `pdf-export` - PDF generation and export
- `notifications` - Notification system

#### Tool/Framework Tags

```yaml
tags: [fastify, angular, typescript, docker, postgresql, redis]
```

- `fastify` - Fastify framework
- `angular` - Angular framework
- `typescript` - TypeScript language
- `docker` - Docker containerization
- `postgresql` - PostgreSQL database
- `redis` - Redis caching

## Examples by Documentation Type

### Example 1: Getting Started Document

```yaml
---
title: Installation Guide
description: Step-by-step instructions for installing and setting up the AegisX Platform
category: getting-started
tags: [development, installation]
order: 1
---
# Installation Guide

[Content here...]
```

### Example 2: Development Guide

```yaml
---
title: Feature Development Standard
description: Standard workflow for developing new features in the AegisX Platform monorepo
category: guides
tags: [development, standards, workflow]
order: 10
---
# Feature Development Standard

[Content here...]
```

### Example 3: API Reference

```yaml
---
title: API Response Standard
description: Standard response format and error handling for all AegisX Platform API endpoints
category: reference
tags: [api, backend, standards]
order: 5
---
# API Response Standard

[Content here...]
```

### Example 4: Architecture Document

```yaml
---
title: Backend Architecture Overview
description: Comprehensive overview of the AegisX Platform backend architecture and design patterns
category: architecture
tags: [backend, architecture, fastify, design-patterns]
order: 1
relatedDocs:
  - fastify-plugins.md
  - api-standards/architecture-specification.md
---
# Backend Architecture Overview

[Content here...]
```

### Example 5: Feature Documentation

```yaml
---
title: Authentication System
description: User authentication system with JWT tokens and session management
category: features
tags: [authentication, security, backend, jwt]
order: 1
status: published
lastUpdated: '2025-12-14'
relatedDocs:
  - api-reference.md
  - deployment-guide.md
---
# Authentication System

[Content here...]
```

### Example 6: Analysis Document

```yaml
---
title: Platform Gap Analysis
description: Analysis of missing features and capabilities compared to enterprise requirements
category: analysis
tags: [architecture, analysis, planning]
status: review
lastUpdated: '2025-12-14'
---
# Platform Gap Analysis

[Content here...]
```

### Example 7: Report Document

```yaml
---
title: API Endpoint Audit Report
description: Comprehensive audit of all API endpoints for security, performance, and standards compliance
category: reports
tags: [api, security, performance, audit]
status: published
lastUpdated: '2025-12-14'
---
# API Endpoint Audit Report

[Content here...]
```

## Static Site Generator Compatibility

This metadata schema is compatible with:

### VitePress (Recommended)

VitePress automatically uses frontmatter for:

- Page title (`title`)
- Meta description (`description`)
- Sidebar navigation (via `order` and directory structure)
- Search indexing (all fields)

### Docusaurus

Docusaurus supports all fields with minimal configuration:

- Uses `title` for page title
- Uses `description` for meta tags
- Supports custom frontmatter fields (`category`, `tags`, `order`)

### MkDocs

MkDocs with Material theme supports:

- `title` as page title
- `description` for SEO
- `tags` for page tagging
- Custom navigation via `order`

## Validation

Documentation builds should validate:

1. **Required fields present** - `title`, `description`, `category`
2. **Category is valid** - Must be one of the controlled vocabulary values
3. **Tags are valid** - All tags should be from controlled vocabulary (warnings for custom tags)
4. **YAML syntax** - Valid YAML formatting
5. **Frontmatter completeness** - Target: 90%+ of documents have complete frontmatter

## Contributing

When creating new documentation:

1. **Copy template** - Use appropriate template from `docs/features/templates/`
2. **Fill frontmatter** - Complete all required fields
3. **Choose category** - Select the most appropriate primary category
4. **Add tags** - Choose 2-5 relevant tags from controlled vocabulary
5. **Set order** - If navigation order matters, assign an `order` value
6. **Validate** - Ensure YAML syntax is correct before committing

## Extending the Vocabulary

To add new tags to the controlled vocabulary:

1. Propose the new tag in a documentation PR
2. Ensure it's distinct from existing tags
3. Update this schema document
4. Update relevant CI/CD validation scripts

Avoid creating too many tags - prefer reusing existing tags for better discoverability.
