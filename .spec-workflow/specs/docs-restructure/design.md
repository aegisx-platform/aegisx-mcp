# Design Document

## Overview

This design document outlines the complete restructuring of the AegisX Platform documentation system (`docs/`) to create a standardized, maintainable, and web-ready documentation structure. The restructuring will transform 476 markdown files from an inconsistent organization into a clean Information Architecture suitable for both human navigation and static site generation.

**Key Design Goals:**
1. **Discoverability** - Developers can find documentation quickly using predictable paths
2. **Maintainability** - Consistent structure reduces confusion and duplication
3. **Web-Ready** - Structure and metadata support VitePress, Docusaurus, or MkDocs
4. **Progressive Disclosure** - Overview → Guides → Reference → Deep Dives

## Steering Document Alignment

### Technical Standards (tech.md)

This restructuring follows AegisX Platform's technical standards:
- **Documentation as Code** - Version controlled, reviewed, and tested like source code
- **Markdown-First** - All documentation in GitHub-flavored Markdown with Mermaid diagrams
- **Metadata-Driven** - YAML frontmatter enables automation and web generation
- **Git Workflow** - Use `git mv` to preserve history during file moves

### Project Structure (structure.md)

The documentation structure mirrors the monorepo organization:
- `docs/reference/` maps to actual API endpoints and components
- `docs/features/` maps to feature directories in codebase
- `docs/architecture/` reflects backend/, frontend/, database/ layers
- `docs/guides/` provides cross-cutting development and infrastructure guides

## Code Reuse Analysis

### Existing Components to Leverage

- **Feature Documentation Templates** - Several features (api-keys, authentication, users) already use standardized templates with DOCUMENTATION_INDEX.md
- **Markdown Validation** - Existing linting and validation scripts can be extended
- **CI/CD Pipeline** - GitHub Actions can build and deploy web documentation
- **Mermaid Diagrams** - Already widely used; will become standard for architecture docs

### Integration Points

- **VitePress/Docusaurus** - Popular static site generators with Vue/React ecosystems
- **GitHub Pages** - Existing infrastructure for hosting documentation
- **Search Indexing** - Frontmatter metadata enables better search (Algolia, Meilisearch)
- **Link Validation** - CI/CD can validate internal links during builds

## Architecture

### New Documentation Structure

```
docs/
├── README.md                        # Master index and navigation hub
├── metadata-schema.md               # Frontmatter schema and controlled vocabulary
│
├── getting-started/                 # Quick start and onboarding
│   ├── README.md                    # Getting started hub
│   ├── installation.md              # Setup instructions
│   ├── first-steps.md               # Hello world tutorial
│   └── project-overview.md          # High-level architecture overview
│
├── guides/                          # How-to guides (task-oriented)
│   ├── README.md                    # Guides index
│   ├── development/                 # Development guides
│   │   ├── README.md
│   │   ├── feature-development-standard.md
│   │   ├── api-calling-standard.md
│   │   ├── qa-checklist.md
│   │   ├── universal-fullstack-standard.md
│   │   └── claude-detailed-rules.md
│   ├── infrastructure/              # Infrastructure and DevOps guides
│   │   ├── README.md
│   │   ├── multi-instance-setup.md
│   │   ├── git-subtree-guide.md
│   │   ├── ci-cd/
│   │   │   ├── README.md
│   │   │   ├── quick-start.md
│   │   │   ├── deployment-guide.md
│   │   │   └── dns-setup-guide.md
│   │   ├── docker/
│   │   │   ├── README.md
│   │   │   ├── monorepo-docker-guide.md
│   │   │   └── multi-instance-docker-workflow.md
│   │   └── version-management/
│   │       ├── README.md
│   │       ├── git-flow-release-guide.md
│   │       ├── automated-versioning-guide.md
│   │       └── semantic-release-recovery.md
│   ├── database/                    # Database guides
│   │   ├── README.md
│   │   ├── migration-guide.md
│   │   ├── schema-migration-guide.md
│   │   └── seed-system.md
│   └── testing/                     # Testing guides
│       ├── README.md
│       ├── testing-strategy.md
│       ├── api-testing.md
│       └── integration-tests.md
│
├── reference/                       # Technical reference (information-oriented)
│   ├── README.md                    # Reference index
│   ├── api/                         # API documentation
│   │   ├── README.md
│   │   ├── api-response-standard.md
│   │   ├── typebox-schema-standard.md
│   │   ├── bulk-operations-api-design.md
│   │   └── file-upload-guide.md
│   ├── ui/                          # UI component reference
│   │   ├── README.md
│   │   ├── aegisx-ui-standards.md
│   │   ├── theme-system-standard.md
│   │   └── components/
│   │       ├── badge.md
│   │       ├── breadcrumb.md
│   │       └── dialog-standard.md
│   ├── cli/                         # CLI tools reference
│   │   ├── README.md
│   │   ├── aegisx-cli/              # Symlink or copy from libs/aegisx-cli/docs
│   │   │   ├── README.md
│   │   │   ├── quick-reference.md
│   │   │   ├── complete-workflow.md
│   │   │   └── websocket-implementation-spec.md
│   │   └── commands/
│   │       ├── feature-commands.md
│   │       └── quick-commands.md
│   └── libraries/                   # Library standards
│       ├── README.md
│       ├── library-standards.md
│       └── fastify-plugin-standards.md
│
├── architecture/                    # Architecture documentation (understanding-oriented)
│   ├── README.md                    # Architecture hub
│   ├── overview.md                  # System architecture overview
│   ├── domain-architecture-guide.md # Domain-driven design
│   ├── quick-domain-reference.md
│   ├── backend/                     # Backend architecture
│   │   ├── README.md
│   │   ├── api-standards/
│   │   │   ├── architecture-specification.md
│   │   │   ├── migration-patterns.md
│   │   │   └── plugin-migration-guide.md
│   │   ├── fastify-plugins.md
│   │   ├── rbac-auth.md
│   │   ├── event-bus-system.md
│   │   └── websocket-realtime.md
│   ├── frontend/                    # Frontend architecture
│   │   ├── README.md
│   │   ├── angular-signals-patterns.md
│   │   ├── routing-navigation.md
│   │   ├── auth-guards.md
│   │   └── ui-design-system.md
│   ├── database/                    # Database architecture
│   │   ├── README.md
│   │   ├── migrations/
│   │   └── seeds/
│   └── apps/                        # Application-specific architecture
│       ├── admin/
│       │   ├── README.md
│       │   ├── architecture.md
│       │   ├── components.md
│       │   └── patterns.md
│       └── inventory/
│           ├── README.md
│           ├── database-architecture.md
│           └── migration-standards.md
│
├── features/                        # Feature-specific documentation
│   ├── README.md                    # Feature catalog
│   ├── {feature-name}/              # Standard feature documentation structure
│   │   ├── README.md                # Feature overview
│   │   ├── api-reference.md         # API endpoints
│   │   ├── architecture.md          # Feature architecture
│   │   ├── developer-guide.md       # Implementation guide
│   │   ├── user-guide.md            # End-user documentation
│   │   ├── troubleshooting.md       # Common issues
│   │   └── deployment-guide.md      # Deployment instructions
│   └── templates/                   # Feature documentation templates
│       └── feature-documentation-standard.md
│
├── analysis/                        # Technical analysis and research
│   ├── README.md
│   ├── migration/
│   │   ├── knex-to-drizzle-migration.md
│   │   └── files-to-migrate.md
│   └── platform/
│       ├── platform-gap-analysis.md
│       └── fuse-integration-summary.md
│
├── reports/                         # Audit and review reports
│   ├── README.md
│   ├── api-endpoint-audit-report.md
│   ├── performance-report.md
│   └── jwt-security-audit.md
│
└── archive/                         # Historical documentation
    ├── README.md                    # Archive index
    ├── 2024-Q4/                     # Quarterly archives
    │   ├── sessions-archive.md      # Consolidated session notes
    │   └── investigations/          # One-off investigations
    └── 2025-Q1/
        └── sessions-archive.md
```

### Modular Design Principles

- **Single File Responsibility**: Each document covers one specific topic (not "everything about X")
- **Component Isolation**: Features are self-contained; shared concepts go in guides/ or reference/
- **Service Layer Separation**: Guides (how-to), Reference (what is), Architecture (why/how designed)
- **Utility Modularity**: Templates are separate from actual documentation

### Documentation Flow Diagram

```mermaid
graph TD
    A[New Developer] --> B[getting-started/README.md]
    B --> C[getting-started/installation.md]
    C --> D[getting-started/first-steps.md]
    D --> E{What to do?}

    E -->|Build feature| F[guides/development/]
    E -->|Deploy app| G[guides/infrastructure/]
    E -->|Understand system| H[architecture/]
    E -->|API details| I[reference/api/]
    E -->|Specific feature| J[features/{name}/]

    F --> K[feature-development-standard.md]
    K --> L[features/templates/]
    L --> M[Implement feature]

    style A fill:#e1f5e1
    style B fill:#fff4e6
    style E fill:#ffe6e6
```

## Components and Interfaces

### Component 1: Master Index (docs/README.md)

- **Purpose:** Single entry point providing navigation to all documentation sections
- **Interfaces:**
  - Links to getting-started/, guides/, reference/, architecture/, features/
  - Quick links for common tasks (run app, create feature, deploy)
  - Documentation contribution guide
- **Dependencies:** None (top-level document)
- **Reuses:** Existing README.md structure, enhanced with clear sections

### Component 2: Metadata Schema (docs/metadata-schema.md)

- **Purpose:** Define YAML frontmatter schema and controlled vocabulary for all docs
- **Interfaces:**
  - Frontmatter field definitions (title, description, category, tags, order, etc.)
  - Controlled vocabulary for categories and tags
  - Examples for each documentation type
- **Dependencies:** None
- **Reuses:** Common web documentation metadata patterns

### Component 3: Feature Documentation Template

- **Purpose:** Standardized structure for all feature documentation
- **Interfaces:**
  - Template files: README.md, api-reference.md, architecture.md, developer-guide.md, user-guide.md, troubleshooting.md
  - DOCUMENTATION_INDEX.md (optional, for complex features)
- **Dependencies:** metadata-schema.md
- **Reuses:** Existing templates from features/api-keys/, features/authentication/

### Component 4: Section Index Files

- **Purpose:** Provide navigation and context for each documentation section
- **Interfaces:**
  - Section overview
  - List of documents with brief descriptions
  - Navigation to subsections
- **Dependencies:** None
- **Reuses:** Existing index patterns from features/

### Component 5: Migration Script

- **Purpose:** Automated file moves and frontmatter generation
- **Interfaces:**
  - Bash script: `scripts/migrate-docs.sh`
  - Input: mapping configuration (old path → new path)
  - Output: git mv commands, frontmatter injection
- **Dependencies:** `yq` (YAML processor), `git`
- **Reuses:** None (new utility)

## Data Models

### Frontmatter Schema (YAML)

```yaml
---
title: "Human-readable title"
description: "Brief description (1-2 sentences) for search and previews"
category: "getting-started | guides | reference | architecture | features"
tags: ["tag1", "tag2", "tag3"]  # From controlled vocabulary
order: 10  # Optional: for navigation ordering (lower = earlier)
---
```

### Controlled Vocabulary (Tags)

```
# Technology tags
- backend
- frontend
- database
- api
- ui

# Activity tags
- development
- deployment
- testing
- architecture
- migration

# Feature tags
- authentication
- authorization
- crud
- websocket
- file-upload

# Domain tags
- inventory
- budget
- user-management
```

### File Mapping Structure (for migration)

```json
{
  "moves": [
    {
      "from": "docs/AEGISX_UI_STANDARDS.md",
      "to": "docs/reference/ui/aegisx-ui-standards.md",
      "frontmatter": {
        "title": "AegisX UI Standards",
        "category": "reference",
        "tags": ["ui", "frontend", "standards"]
      }
    }
  ]
}
```

## Error Handling

### Error Scenarios

1. **Scenario: Broken Internal Links After Migration**
   - **Handling:** Run link validation script post-migration; generate redirect map
   - **User Impact:** Developers see 404 or redirects with deprecation notices

2. **Scenario: Duplicate Documentation**
   - **Handling:** During migration, identify duplicates; consolidate or archive
   - **User Impact:** Single source of truth reduces confusion

3. **Scenario: Missing Frontmatter**
   - **Handling:** Build script generates warnings; provides defaults
   - **User Impact:** Documentation still works but may not appear in navigation

4. **Scenario: Archive Access Needed**
   - **Handling:** Archive directory remains in repo with clear README explaining access
   - **User Impact:** Historical context preserved but clearly marked as archived

## Testing Strategy

### Unit Testing

- **Frontmatter Validation:**
  - Script validates YAML frontmatter against schema
  - Tests for required fields (title, description, category)
  - Tests for valid controlled vocabulary values

- **Link Validation:**
  - Script checks all internal links resolve correctly
  - Tests for broken external links (with warnings, not errors)

### Integration Testing

- **Web Documentation Build:**
  - Test VitePress build completes without errors
  - Test navigation tree generates correctly from structure
  - Test search index includes all documents

- **Migration Script:**
  - Test dry-run mode shows correct file moves
  - Test git history preserved after migration
  - Test frontmatter injection works correctly

### End-to-End Testing

- **Developer Workflows:**
  - New developer follows getting-started/ path successfully
  - Feature developer finds templates and creates feature docs
  - Infrastructure engineer finds deployment guides

- **Documentation Contribution:**
  - Contributor adds new document following standards
  - CI/CD validates frontmatter and links
  - Documentation appears in web build automatically

## Implementation Phases

### Phase 1: Foundation (Migration Preparation)
- Create new directory structure (empty directories)
- Create metadata-schema.md
- Create section index templates (README.md for each section)
- Create migration mapping configuration

### Phase 2: Migration (Automated File Moves)
- Run migration script (dry-run first)
- Execute git mv commands
- Inject frontmatter into moved files
- Validate all moves completed successfully

### Phase 3: Cleanup (Manual Review)
- Review and fix broken links
- Consolidate duplicate documentation
- Archive outdated session notes
- Create redirect map for legacy URLs

### Phase 4: Enhancement (Web Documentation)
- Choose static site generator (VitePress recommended)
- Create web documentation configuration
- Set up GitHub Pages deployment
- Add search functionality

### Phase 5: Validation (Testing & Launch)
- Run link validation
- Test web documentation build
- Review navigation completeness
- Document new contribution workflow
- Archive old sessions/ directory

## Rollout Plan

1. **Week 1:** Create spec (requirements, design, tasks) - **Current Phase**
2. **Week 2:** Implement migration script and validate dry-run
3. **Week 3:** Execute migration and cleanup
4. **Week 4:** Set up web documentation and launch
5. **Ongoing:** Monitor adoption and iterate based on feedback

## Success Metrics

- **Findability:** Time to find documentation reduced by 50%
- **Completeness:** 90%+ of documents have complete frontmatter
- **Link Health:** 0 broken internal links
- **Adoption:** 80%+ of new features use standard template
- **Web Build:** Documentation builds in <60 seconds
