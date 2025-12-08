# Inventory App Documentation Structure (Recommended)

## Proposed Clean Structure

```
docs/features/inventory-app/
│
├── README.md                          # 📌 Start here - Overview & navigation
│
├── planning/                          # 📋 Design & Planning Phase
│   ├── business/
│   │   ├── BRD.md                    # Business Requirements
│   │   ├── TRD.md                    # Technical Requirements
│   │   ├── workflows.md              # Business workflows
│   │   └── use-cases.md              # Use case scenarios
│   │
│   ├── architecture/
│   │   ├── system-architecture.md    # System overview
│   │   ├── database-design.md        # Database ERD & schema
│   │   ├── data-flow.md              # Data flow diagrams
│   │   └── ui-ux-design.md           # UI/UX mockups
│   │
│   └── project-plan.md               # Initial project plan
│
├── implementation/                    # 🔧 Implementation Specs
│   ├── database/
│   │   ├── schema/
│   │   │   ├── schema.prisma         # Prisma schema
│   │   │   ├── functions.sql         # PostgreSQL functions
│   │   │   └── views.sql             # Database views
│   │   │
│   │   ├── migrations/               # Migration tracking
│   │   └── seed-data.md              # Seed data specs
│   │
│   ├── api/
│   │   ├── master-data/
│   │   │   ├── API.md               # API endpoints
│   │   │   ├── SCHEMA.md            # TypeBox schemas
│   │   │   └── workflows.md         # State transitions
│   │   │
│   │   ├── procurement/
│   │   ├── inventory/
│   │   ├── distribution/
│   │   ├── returns/
│   │   ├── tmt/
│   │   └── hpp/
│   │
│   ├── frontend/
│   │   ├── master-data/
│   │   │   ├── UI.md                # Component specs
│   │   │   └── features.md          # Feature list
│   │   │
│   │   └── [other modules]/
│   │
│   └── specs/                         # 📝 Task specs for AI agents
│       ├── backend-remaining.md       # e.g., HAIKU_SPEC
│       ├── frontend-phase-1.md
│       └── integration-tests.md
│
├── progress/                          # 📊 Development Progress
│   ├── PROJECT_PROGRESS.md           # Main progress tracker
│   ├── FEATURE_STATUS.md             # Feature completion matrix
│   ├── sessions/                     # Session logs
│   │   ├── 2024-12-05-setup.md
│   │   ├── 2024-12-07-backend.md
│   │   └── 2024-12-08-schema-fix.md
│   │
│   ├── phases/
│   │   ├── PHASE_0_SETUP.md
│   │   ├── PHASE_1_DATABASE.md
│   │   ├── PHASE_2_DATA_MIGRATION.md
│   │   ├── PHASE_3_BACKEND.md
│   │   └── PHASE_4_FRONTEND.md
│   │
│   └── checklists/
│       ├── database-checklist.md
│       ├── api-checklist.md
│       └── frontend-checklist.md
│
├── handoff/                           # 🤝 Session Recovery
│   ├── CLAUDE.md                     # Claude-specific context
│   ├── HANDOFF.md                    # Handoff checklist
│   └── SYSTEM_ALIGNMENT.md           # System state alignment
│
└── reference/                         # 📚 Reference Documentation
    ├── setup-guide.md                # Setup from fresh clone
    ├── test-plan.md                  # Testing strategy
    ├── budget-system.md              # Deep dive: Budget system
    └── quick-index.md                # Quick navigation

```

## Migration Plan

### Step 1: Create New Structure

```bash
# Create new folders
mkdir -p docs/features/inventory-app/planning/{business,architecture}
mkdir -p docs/features/inventory-app/implementation/{database/schema,api,frontend,specs}
mkdir -p docs/features/inventory-app/progress/{sessions,phases,checklists}
mkdir -p docs/features/inventory-app/handoff
mkdir -p docs/features/inventory-app/reference
```

### Step 2: Move Files

#### Business & Architecture

```bash
# Business requirements
mv 03-business/BRD.md planning/business/
mv 03-business/TRD.md planning/business/
mv 03-business/END_TO_END_WORKFLOWS.md planning/business/workflows.md
mv 08-additional-docs/USE_CASE_DOCUMENT.md planning/business/use-cases.md

# Architecture
mv 08-additional-docs/SYSTEM_ARCHITECTURE.md planning/architecture/system-architecture.md
mv 03-business/DATABASE_DESIGN.md planning/architecture/database-design.md
mv 08-additional-docs/DATA_FLOW_DIAGRAM.md planning/architecture/data-flow.md
mv 08-additional-docs/UI_UX_DESIGN.md planning/architecture/ui-ux-design.md
mv 08-additional-docs/PROJECT_PLAN.md planning/project-plan.md
```

#### Implementation

```bash
# Database
mv 02-schema/* implementation/database/schema/

# API - Consolidate 04-api-guides and 07-api-readme
mv 04-api-guides/01-master-data-* implementation/api/master-data/
mv 04-api-guides/02-budget-* implementation/api/budget/
mv 04-api-guides/03-procurement-* implementation/api/procurement/
mv 04-api-guides/04-inventory-* implementation/api/inventory/
mv 04-api-guides/05-distribution-* implementation/api/distribution/
mv 04-api-guides/06-return-* implementation/api/returns/
mv 04-api-guides/07-tmt-* implementation/api/tmt/
mv 04-api-guides/08-hpp-* implementation/api/hpp/

# Frontend
mv 06-mock-ui/* implementation/frontend/

# AI Specs
mv HAIKU_SPEC.md implementation/specs/backend-remaining.md
```

#### Progress

```bash
# Main progress
mv 09-development-plan/PROJECT_PROGRESS.md progress/
mv 09-development-plan/FEATURE_STATUS.md progress/
mv 09-development-plan/phases/* progress/phases/
mv 09-development-plan/checklists/* progress/checklists/
```

#### Handoff

```bash
mv 01-project/CLAUDE.md handoff/
mv 01-project/HANDOFF.md handoff/
mv 01-project/SYSTEM_ALIGNMENT.md handoff/
mv 01-project/PROJECT_STATUS.md handoff/
```

#### Reference

```bash
mv 08-additional-docs/SETUP_FRESH_CLONE.md reference/setup-guide.md
mv 08-additional-docs/TEST_PLAN.md reference/test-plan.md
mv 08-additional-docs/BUDGET_SYSTEM_EXPLAINED.md reference/budget-system.md
mv 09-development-plan/QUICK_INDEX.md reference/quick-index.md
```

### Step 3: Remove Empty Folders

```bash
rmdir 01-project 02-schema 03-business 04-api-guides 05-workflows 06-mock-ui 07-api-readme 08-additional-docs
rmdir 09-development-plan/{phases,checklists,progress}
rmdir 09-development-plan
```

### Step 4: Create Navigation

Create `README.md` in root with clear navigation:

```markdown
# Inventory App Documentation

## 📂 Quick Navigation

### 1. Planning & Design

- [Business Requirements](planning/business/BRD.md)
- [System Architecture](planning/architecture/system-architecture.md)
- [Database Design](planning/architecture/database-design.md)

### 2. Implementation Specs

- [API Documentation](implementation/api/)
- [Frontend Specs](implementation/frontend/)
- [AI Task Specs](implementation/specs/) ← **For AI agents**

### 3. Progress Tracking

- [Current Progress](progress/PROJECT_PROGRESS.md) ← **Check here first**
- [Phase Status](progress/phases/)
- [Checklists](progress/checklists/)

### 4. Session Recovery

- [Claude Context](handoff/CLAUDE.md)
- [Handoff Checklist](handoff/HANDOFF.md)

### 5. Reference

- [Setup Guide](reference/setup-guide.md)
- [Test Plan](reference/test-plan.md)
```

## Benefits

✅ **Clear separation**: Planning vs Implementation vs Progress
✅ **Easy to find**: Logical grouping by purpose
✅ **AI-friendly**: Specs folder for agent tasks
✅ **Maintainable**: Remove numbered prefixes
✅ **Scalable**: Easy to add new modules

## Current Issues Fixed

❌ **Before**: HAIKU_SPEC.md lost in root
✅ **After**: `implementation/specs/backend-remaining.md`

❌ **Before**: API docs in 2 places
✅ **After**: One `implementation/api/` folder

❌ **Before**: 01-09 numbered chaos
✅ **After**: planning, implementation, progress, handoff, reference

## Execution

Ready to migrate? I can execute this in one go or step-by-step.
