# AegisX Admin Application

> Angular 19+ Admin Dashboard with AegisX UI Component Library

---

## Documentation Menu

| Document                             | Description                             |
| ------------------------------------ | --------------------------------------- |
| **[README.md](./README.md)**         | Overview & Quick Start (คุณอยู่ที่นี่)  |
| [components.md](./components.md)     | UI Components Reference (42 components) |
| [PATTERNS.md](./PATTERNS.md)         | Development Patterns (10 patterns)      |
| [development.md](./development.md)   | Development Guide                       |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Application Architecture                |

---

## Overview

AegisX Admin เป็น Documentation & Demo Application สำหรับ AegisX UI Component Library ที่พัฒนาด้วย Angular 19+ พร้อม Modern Features ต่างๆ

## Tech Stack

| Technology       | Version | Purpose             |
| ---------------- | ------- | ------------------- |
| Angular          | 19+     | Frontend Framework  |
| Angular Material | 19+     | Base Components     |
| TailwindCSS      | 3.x     | Utility-first CSS   |
| Nx               | 20+     | Monorepo Management |
| TypeScript       | 5.x     | Type Safety         |

## Quick Start

```bash
# 1. Install dependencies (from root)
pnpm install

# 2. Start development server
pnpm run dev:admin
# หรือ
nx serve admin

# 3. Open browser
open http://localhost:4200
```

## Project Structure

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── components/          # Shared components
│   │   │   ├── docs/           # Documentation components
│   │   │   ├── code-block/     # Code highlighting
│   │   │   ├── code-preview/   # Live preview
│   │   │   └── props-table/    # API documentation
│   │   ├── config/             # App configuration
│   │   │   ├── navigation.config.ts
│   │   │   └── layout.config.ts
│   │   ├── pages/              # Page components
│   │   │   ├── docs/           # Documentation pages
│   │   │   ├── playground/     # Demo & experiments
│   │   │   ├── tools/          # Admin tools
│   │   │   └── examples/       # Page examples
│   │   ├── routes/             # Route definitions
│   │   ├── types/              # TypeScript types
│   │   ├── app.routes.ts       # Main routes
│   │   └── app.config.ts       # App config
│   ├── styles.scss             # Global styles
│   └── main.ts                 # Entry point
├── docs/                       # This documentation
├── public/                     # Static assets
└── project.json               # Nx project config
```

## Route Architecture

```
/                                    → /docs/getting-started/introduction
├── /docs/getting-started/*          # Getting Started guides
├── /docs/foundations/*              # Design foundations
├── /docs/components/aegisx/*        # AegisX UI components
├── /docs/integrations/*             # Third-party integrations
├── /docs/material/*                 # Angular Material
├── /docs/patterns/*                 # Design patterns
├── /docs/architecture/*             # Architecture guides
├── /playground/*                    # Experiments & demos
├── /tools/*                         # Admin tools
├── /examples/*                      # Page examples
└── /[demo-apps]                     # Standalone demos
```

## Available Scripts

```bash
# Development
pnpm run dev:admin          # Start dev server
nx serve admin              # Alternative

# Build
nx build admin              # Production build
nx build admin:development  # Development build

# Testing
nx test admin               # Run unit tests

# Linting
nx lint admin               # ESLint check
```

## Configuration Files

| File                 | Purpose                     |
| -------------------- | --------------------------- |
| `project.json`       | Nx project configuration    |
| `tsconfig.app.json`  | TypeScript config for app   |
| `tsconfig.spec.json` | TypeScript config for tests |
| `tailwind.config.js` | TailwindCSS configuration   |
| `proxy.conf.js`      | API proxy configuration     |

## AegisX MCP Integration

ใช้ AegisX MCP Server เพื่อค้นหาข้อมูล components และ patterns:

```bash
# List all components
aegisx_components_list

# Get component details
aegisx_components_get "Badge"

# Search components
aegisx_components_search "loading"

# List patterns
aegisx_patterns_list

# Get pattern code
aegisx_patterns_get "Angular Signal-based Component"
```

## Links

- **Live Demo**: [https://aegisx-platform.github.io/aegisx-ui/](https://aegisx-platform.github.io/aegisx-ui/)
- **AegisX UI Library**: `libs/aegisx-ui/`
- **Main Documentation**: `/docs/`
