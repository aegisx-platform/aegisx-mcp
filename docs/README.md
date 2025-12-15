---
title: 'AegisX Platform Documentation'
description: 'Comprehensive documentation for enterprise-ready full-stack application'
category: getting-started
tags: [documentation, index, navigation]
---

# AegisX Platform Documentation

> **Enterprise-ready full-stack application** with Angular 19+, Fastify 4+, PostgreSQL, and Nx monorepo.

[![Documentation Status](https://img.shields.io/badge/docs-active-brightgreen)](https://github.com/aegisx-platform/aegisx-starter-1)
[![License](https://img.shields.io/badge/license-MIT-blue)](../LICENSE)
[![Node Version](https://img.shields.io/badge/node-22%2B-success)](https://nodejs.org)
[![Package Manager](https://img.shields.io/badge/package%20manager-pnpm-yellow)](https://pnpm.io)

**Last Updated:** 2025-12-15 | **Documentation Version:** 2.0 (Restructured)

---

## 📖 Documentation Structure

This documentation follows the **Diátaxis Framework** with a 5-layer information architecture for optimal discoverability and usability.

### Quick Navigation by Purpose

| Purpose                     | Section                                 | What You'll Find                         |
| --------------------------- | --------------------------------------- | ---------------------------------------- |
| 🚀 **I want to start**      | [Getting Started](#-getting-started)    | Installation, setup, first steps         |
| 🛠️ **I want to build**      | [Guides](#%EF%B8%8F-guides)             | How-to guides, workflows, best practices |
| 📚 **I need reference**     | [Reference](#-reference)                | API docs, CLI commands, standards        |
| 🏗️ **I want to understand** | [Architecture](#%EF%B8%8F-architecture) | System design, patterns, concepts        |
| 🎯 **I want examples**      | [Features](#-features)                  | Feature specifications and examples      |

---

## 🚀 Getting Started

**New to the project?** Start here for bootstrap instructions and essential workflows.

- **[Getting Started Guide](./getting-started/getting-started.md)** - Git workflow, rules, and first steps
- **[Project Setup](./getting-started/project-setup.md)** - Complete bootstrap guide with validation steps

**Essential Reading:**

- [CLAUDE.md](../CLAUDE.md) - Development guidelines and critical rules
- [PROJECT_STATUS.md](../PROJECT_STATUS.md) - Current progress and session recovery
- [Root README.md](../README.md) - Project overview and tech stack

---

## 🛠️ Guides

**Practical how-to guides** for development workflows and infrastructure management.

### Development Guides

- **[Feature Development Standard](./guides/development/feature-development-standard.md)** - Complete feature lifecycle
- **[API Calling Standard](./guides/development/api-calling-standard.md)** - Correct URL patterns and conventions
- **[QA Checklist](./guides/development/qa-checklist.md)** - Quality assurance steps
- **[Universal Full-Stack Standard](./guides/development/universal-fullstack-standard.md)** - Database-first workflow
- **[Claude Detailed Rules](./guides/development/claude-detailed-rules.md)** - Verbose development examples

### Infrastructure Guides

- **[Multi-Instance Setup](./guides/infrastructure/multi-instance-setup.md)** - Parallel development environments
- **[Git Subtree Guide](./guides/infrastructure/git-subtree-guide.md)** - Shared library management
- **[Git Flow & Release](./guides/infrastructure/version-management/git-flow-release-guide.md)** - Branch strategy and releases
- **[CI/CD Quick Start](./guides/infrastructure/ci-cd/quick-start.md)** - GitHub Actions setup
- **[CI/CD Best Practices](./guides/infrastructure/ci-cd/best-practices.md)** - Advanced CI/CD patterns

---

## 📚 Reference

**Technical reference documentation** for APIs, CLIs, and coding standards.

### API Reference

- **[API Response Standard](./reference/api/api-response-standard.md)** - Unified response format
- **[TypeBox Schema Standard](./reference/api/typebox-schema-standard.md)** - Schema validation patterns
- **[Bulk Operations API Design](./reference/api/bulk-operations-api-design.md)** - Batch operations
- **[File Upload Guide](./reference/api/file-upload-guide.md)** - File handling patterns

### CLI Reference

- **[AegisX CLI Overview](./reference/cli/aegisx-cli/README.md)** - CRUD generator and CLI tools
- **[Complete Workflow](./reference/cli/aegisx-cli/complete-workflow.md)** - End-to-end CRUD generation
- **[Git Workflow](./reference/cli/aegisx-cli/git-workflow.md)** - CLI version control
- **[Testing Guide](./reference/cli/aegisx-cli/testing-guide.md)** - CLI testing
- **[WebSocket Implementation](./reference/cli/aegisx-cli/websocket-implementation-spec.md)** - Real-time features

### UI Reference

- **[AegisX UI Standards](./reference/ui/aegisx-ui-standards.md)** - UI library conventions
- **[Theme System Standard](./reference/ui/theme-system-standard.md)** - Theming documentation
- **[Token Reference](./reference/ui/token-reference.md)** - Design token reference

---

## 🏗️ Architecture

**System design patterns** and architectural guidelines for understanding the platform.

### Concepts

- **[Module Isolation](./architecture/concepts/module-isolation.md)** - Module independence patterns
- **[Module Development](./architecture/concepts/module-development.md)** - Module lifecycle

### Patterns

- **[Microservices Adoption Path](./architecture/patterns/microservices-adoption-path.md)** - Monolith to microservices
- **[Dynamic Architecture](./architecture/patterns/dynamic-architecture.md)** - Adaptive system design

### Domains

- **[Domain Architecture Guide](./architecture/domains/domain-architecture-guide.md)** - Domain-driven design
- **[Quick Domain Reference](./architecture/domains/quick-domain-reference.md)** - Domain cheat sheet

---

## 🎯 Features

**Feature specifications and API contracts** for implemented functionality.

Browse feature documentation by domain:

- [Platform Features](./features/) - Core platform features
- [Domain-Specific Features](./features/) - Business domain features

Each feature includes:

- Requirements specification
- Design documentation
- API contracts
- Implementation tasks
- Testing guidelines

---

## 📊 Analysis & Reports

**Technical analysis documents** and research findings.

### Platform Analysis

- **[Fuse Integration Summary](./analysis/platform/fuse-integration-summary.md)** - UI framework evaluation
- **[UI Components Implementation](./analysis/platform/ui-components-implementation-summary.md)** - Component library analysis

### Migration Analysis

- **[Knex to Drizzle Migration](./analysis/migration/knex-to-drizzle-migration.md)** - ORM migration feasibility

### Reports

- **[UI Test Report](./reports/ui-test-report.md)** - Frontend testing results

---

## 📦 Archive

**Historical documentation** and quarterly session archives.

- [2024-Q4 Archive](./archive/2024-Q4/) - October-December 2024
- [2025-Q1 Archive](./archive/2025-Q1/) - January-March 2025

---

## 🎯 Quick Links by Task

### 🚀 Starting a New Feature

1. Read [Feature Development Standard](./guides/development/feature-development-standard.md)
2. Follow [API-First Workflow](./guides/development/universal-fullstack-standard.md)
3. Use [CRUD Generator](./reference/cli/aegisx-cli/README.md) for boilerplate

### 🧪 Testing

1. Check [QA Checklist](./guides/development/qa-checklist.md)
2. Review [Testing Strategy](./testing/testing-strategy.md)
3. Run manual tests with [Test Commands](./testing/manual-test-commands.md)

### 🚀 Deploying

1. Review [Git Flow & Release](./guides/infrastructure/version-management/git-flow-release-guide.md)
2. Follow [CI/CD Quick Start](./guides/infrastructure/ci-cd/quick-start.md)
3. Use [Deployment Guide](./infrastructure/deployment.md)

### 🔧 Troubleshooting

1. Check [PROJECT_STATUS.md](../PROJECT_STATUS.md) for recent changes
2. Review [Claude Detailed Rules](./guides/development/claude-detailed-rules.md)
3. Search [Archive](./archive/) for historical context

---

## 🛠️ Technology Stack

| Layer               | Technology                     | Version |
| ------------------- | ------------------------------ | ------- |
| **Frontend**        | Angular + Signals              | 19+     |
| **UI Library**      | Angular Material + TailwindCSS | Latest  |
| **Backend**         | Fastify + TypeBox              | 4+      |
| **Database**        | PostgreSQL + Knex.js           | 15+     |
| **Testing**         | Jest + Playwright              | Latest  |
| **Monorepo**        | Nx Workspace                   | Latest  |
| **Package Manager** | pnpm                           | 9+      |
| **Runtime**         | Node.js                        | 22+     |

---

## 📝 Contributing to Documentation

### Adding New Documentation

1. **Choose the right location:**
   - 📖 **Getting Started** - New user onboarding
   - 🛠️ **Guides** - How-to and tutorials
   - 📚 **Reference** - API docs and standards
   - 🏗️ **Architecture** - System design
   - 🎯 **Features** - Feature specs

2. **Use frontmatter metadata:**

   ```yaml
   ---
   title: 'Document Title'
   description: 'Brief 1-2 sentence description'
   category: 'getting-started | guides | reference | architecture | features'
   tags: [tag1, tag2, tag3]
   ---
   ```

3. **Follow naming conventions:**
   - Use `lowercase-with-dashes.md`
   - Be descriptive: `feature-development-standard.md` not `dev.md`

4. **Update this index:**
   - Add your document to the relevant section above
   - Keep links alphabetically ordered within each section

### Documentation Standards

- **Reference [Metadata Schema](./metadata-schema.md)** for controlled vocabulary
- **Use relative links** for internal documentation
- **Include examples** for complex concepts
- **Keep it concise** - prefer multiple focused docs over one large doc
- **Update [REDIRECT_MAP.md](./REDIRECT_MAP.md)** when moving files

### Testing Documentation Changes

1. Run link validation:

   ```bash
   ./scripts/validate-links.sh
   ```

2. Check for broken links in the report:

   ```bash
   cat .spec-workflow/specs/docs-restructure/link-validation-*.md
   ```

3. Verify frontmatter format matches [metadata-schema.md](./metadata-schema.md)

---

## 🔗 Important Documents

| Document                                  | Purpose                                   |
| ----------------------------------------- | ----------------------------------------- |
| [CLAUDE.md](../CLAUDE.md)                 | Development guidelines and critical rules |
| [PROJECT_STATUS.md](../PROJECT_STATUS.md) | Current progress and session recovery     |
| [Metadata Schema](./metadata-schema.md)   | Documentation standards and frontmatter   |
| [Redirect Map](./REDIRECT_MAP.md)         | URL redirects for moved documentation     |

---

## 📞 Support & Resources

- **GitHub Repository:** [aegisx-platform/aegisx-starter-1](https://github.com/aegisx-platform/aegisx-starter-1)
- **Issues:** [Report documentation issues](https://github.com/aegisx-platform/aegisx-starter-1/issues)
- **Specifications:** [.spec-workflow/specs/](../.spec-workflow/specs/)

---

## 📊 Documentation Statistics

- **Total Pages:** 489+ markdown documents
- **Last Restructure:** 2025-12-15 (Phase 4 Complete)
- **Spec:** [docs-restructure](../.spec-workflow/specs/docs-restructure/)
- **Health Status:** ✅ All links validated

---

> 💡 **Tip:** Use the search function in your static site generator or file explorer to find specific topics. All documents include descriptive frontmatter for better discoverability.

**Documentation Version:** 2.0
**Specification:** docs-restructure (Phase 4.4)
**Last Updated:** 2025-12-15
