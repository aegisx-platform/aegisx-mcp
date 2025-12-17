# Claude Skills Team Collaboration Guide

> **คู่มือการทำงานร่วมกันกับ Claude Skills สำหรับทีมพัฒนา**
>
> เอกสารนี้จะแนะนำวิธีการทำงานเป็นทีมกับระบบ Claude Skills, การเลือกใช้ model ที่เหมาะสม, และแนวทางปฏิบัติเพื่อประหยัด token

## Table of Contents

1. [Skills System Overview](#skills-system-overview)
2. [Team Collaboration Workflow](#team-collaboration-workflow)
3. [Using Claude Skills Effectively](#using-claude-skills-effectively)
4. [Model Selection Guide](#model-selection-guide)
5. [Command Reference](#command-reference)
6. [Token Optimization Strategies](#token-optimization-strategies)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Skills System Overview

### Available Skills

ระบบ Claude Skills ประกอบด้วย 4 skills หลักที่ทำงานร่วมกันอย่างมีระบบ:

#### 1. **aegisx-development-workflow** (Master Orchestrator)

- **Role**: ควบคุมและประสานงาน workflow ทั้งหมด
- **Purpose**: นำทางการพัฒนา feature ตั้งแต่ต้นจนจบ
- **When to use**: เมื่อเริ่มพัฒนา feature ใหม่หรือต้องการ guidance ทั้งกระบวนการ
- **Size**: 2,047 lines, 3 files
- **Recommended Model**: Opus (ความซับซ้อนสูง, ต้องการการตัดสินใจเชิงกลยุทธ์)

#### 2. **crud-generator-guide**

- **Role**: คู่มือการใช้งาน aegisx-cli CRUD generator
- **Purpose**: สอนการ generate CRUD modules (backend + frontend)
- **When to use**: สร้าง CRUD สำหรับ table ใหม่, เพิ่ม features (import/events)
- **Size**: 1,663 lines, 3 files
- **Recommended Model**: Sonnet (ความซับซ้อนปานกลาง, task ที่ชัดเจน)

#### 3. **backend-customization-guide**

- **Role**: แนะนำการ customize backend ที่ generated
- **Purpose**: เพิ่ม business logic, complex validation, relationships
- **When to use**: หลัง generate CRUD, ต้องการ customize logic
- **Size**: 2,613 lines, 3 files
- **Recommended Model**: Sonnet (technical implementation, well-defined patterns)

#### 4. **frontend-integration-guide**

- **Role**: แนะนำการพัฒนา frontend Angular
- **Purpose**: Service patterns, Signal-based state, Material UI integration
- **When to use**: พัฒนา Angular components, integrate กับ backend
- **Size**: 4,493 lines, 18 files (รวม templates)
- **Recommended Model**: Haiku (repetitive patterns, template-based work)

### Total Coverage

- **10,816 lines** of comprehensive documentation
- **18 files** including templates and examples
- **Complete workflow** from database to UI

---

## Team Collaboration Workflow

### Recommended Team Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Team Collaboration Model                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Backend Developer        Frontend Developer    QA Tester    │
│  ├─ Use: crud-generator   ├─ Use: frontend-    ├─ Use: all  │
│  ├─ Use: backend-custom   │   integration       │   skills   │
│  └─ Model: Sonnet        └─ Model: Haiku      └─ Model:    │
│                                                   Sonnet     │
│                                                               │
│               Tech Lead / Architect                           │
│               ├─ Use: aegisx-development-workflow            │
│               └─ Model: Opus                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Parallel Development Process

#### Phase 1: Planning (Tech Lead)

```bash
# Tech Lead uses Opus with master workflow
"Claude (Opus), I need to plan a new inventory management feature"
```

**Output**: Complete plan with table structure, API design, UI mockups

#### Phase 2: Database Setup (Backend Developer)

```bash
# Create migration
pnpm run db:create -- create_inventory_items_table

# Edit migration file manually
# Then migrate
pnpm run db:migrate
```

#### Phase 3: Backend Generation (Backend Developer)

```bash
# Use Sonnet with crud-generator-guide
"Claude (Sonnet), generate full CRUD for inventory_items table with import and events features"

# Claude will execute:
pnpm run crud:full -- inventory_items --force
```

**Wait for**: Backend CRUD complete (routes, schemas, controllers)

#### Phase 4: Backend Customization (Backend Developer)

```bash
# Use Sonnet with backend-customization-guide
"Claude (Sonnet), add business logic to inventory_items:
- Validate stock quantity cannot be negative
- Auto-calculate total_value = quantity * unit_price
- Add foreign key relationship to warehouses table"
```

**Wait for**: Business logic implemented and tested

#### Phase 5: API Testing (Backend Developer or QA)

```bash
# Use Sonnet for testing
"Claude (Sonnet), test all inventory_items API endpoints"

# Claude will use curl commands to verify all endpoints work
```

**Wait for**: All API tests pass

#### Phase 6: Frontend Integration (Frontend Developer)

```bash
# Use Haiku with frontend-integration-guide
"Claude (Haiku), create Angular service and components for inventory_items"

# Claude will generate:
# - inventory-items.service.ts (Signal-based)
# - inventory-items-list.component.ts
# - inventory-items-dialog.component.ts
```

**Wait for**: Frontend components complete

#### Phase 7: Final QA (QA Tester)

```bash
# Use Sonnet for comprehensive testing
"Claude (Sonnet), run complete QA checklist for inventory_items feature"
```

### Concurrent Development Scenarios

#### Scenario 1: Multiple Features (Parallel)

```
Developer A (Sonnet):  "Generate CRUD for products table"
Developer B (Sonnet):  "Generate CRUD for categories table"
Developer C (Haiku):   "Create products list component"
Developer D (Haiku):   "Create categories list component"
```

**No conflicts** - Different tables, different components

#### Scenario 2: Same Feature (Sequential)

```
Step 1 (Backend):  "Generate backend for orders table"        [Sonnet]
  ↓ Wait for completion
Step 2 (Customize): "Add order status workflow"               [Sonnet]
  ↓ Wait for completion
Step 3 (Frontend):  "Create order management UI"              [Haiku]
```

**Must wait** - Frontend depends on backend API

#### Scenario 3: Review & Quality (Parallel)

```
Reviewer 1 (Sonnet):  "Review backend code for products"
Reviewer 2 (Sonnet):  "Review frontend code for products"
QA (Sonnet):          "Test products API endpoints"
```

**All parallel** - Independent review tasks

---

## Using Claude Skills Effectively

### Invoking Skills

Claude skills activate **automatically** when you use specific keywords in your requests.

#### Auto-Activation Keywords

| Skill                           | Trigger Keywords (English)                              | Trigger Keywords (Thai)                |
| ------------------------------- | ------------------------------------------------------- | -------------------------------------- |
| **aegisx-development-workflow** | "plan feature", "design system", "architecture"         | "วางแผน feature", "ออกแบบระบบ"         |
| **crud-generator-guide**        | "generate CRUD", "create CRUD", "crud for table"        | "สร้าง CRUD", "generate CRUD"          |
| **backend-customization-guide** | "customize backend", "add validation", "business logic" | "ปรับแต่ง backend", "เพิ่ม validation" |
| **frontend-integration-guide**  | "create component", "Angular service", "frontend for"   | "สร้าง component", "ทำ frontend"       |

### Example Conversations

#### Example 1: Complete Feature Development

```
User: "I need to create a complete products management feature"

Claude (Opus): I'll use the aegisx-development-workflow skill to guide you through
               the complete process.

[Claude provides]:
1. Database design recommendation
2. CRUD generation plan
3. Backend customization checklist
4. Frontend implementation plan
5. Testing strategy
```

#### Example 2: CRUD Generation Only

```
User: "Generate CRUD for employees table with Excel import"

Claude (Sonnet): I'll use the crud-generator-guide skill.

[Claude executes]:
pnpm run crud:import -- employees --force

[Claude confirms]:
✓ Generated backend CRUD
✓ Generated frontend CRUD
✓ Added Excel/CSV import feature
✓ Updated navigation
```

#### Example 3: Backend Customization

```
User: "Add validation to products: price must be > 0 and stock >= 0"

Claude (Sonnet): I'll use the backend-customization-guide skill.

[Claude implements]:
1. Updates ProductsCreateSchema with validation
2. Adds custom validation in service layer
3. Tests the validation rules
```

#### Example 4: Frontend Development

```
User: "Create Angular service and list component for departments"

Claude (Haiku): I'll use the frontend-integration-guide skill.

[Claude generates]:
1. departments.service.ts (Signal-based state)
2. departments-list.component.ts
3. departments-list.component.html
4. departments-dialog.component.ts (CRUD dialog)
```

---

## Model Selection Guide

### Understanding Claude Models

| Model      | Speed  | Cost   | Best For                              | Token Limit |
| ---------- | ------ | ------ | ------------------------------------- | ----------- |
| **Opus**   | Slow   | High   | Strategic planning, complex decisions | 200K        |
| **Sonnet** | Medium | Medium | Technical implementation, coding      | 200K        |
| **Haiku**  | Fast   | Low    | Templates, repetitive tasks           | 200K        |

### Decision Tree

```
                    What are you doing?
                           |
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    Planning/         Implementing        Creating UI
    Architecture         Code             Components
        │                  │                  │
        ↓                  ↓                  ↓
      OPUS              SONNET             HAIKU
```

### Detailed Selection Criteria

#### Use **OPUS** when:

- ✅ Planning entire feature from scratch
- ✅ Making architectural decisions
- ✅ Designing database schemas (complex relationships)
- ✅ Resolving ambiguous requirements
- ✅ Coordinating multiple developers
- ✅ Strategic code reviews

**Example prompts:**

```
"Plan a complete e-commerce checkout system"
"Design the database architecture for multi-tenant SaaS"
"Help me decide between microservices vs monolith"
```

#### Use **SONNET** when:

- ✅ Generating CRUD modules
- ✅ Implementing backend business logic
- ✅ Writing complex validation rules
- ✅ Creating API endpoints
- ✅ Customizing generated code
- ✅ Testing APIs
- ✅ Code reviews (technical)

**Example prompts:**

```
"Generate CRUD for users table with import"
"Add validation: email must be unique, age > 18"
"Test all products API endpoints"
"Review this controller for security issues"
```

#### Use **HAIKU** when:

- ✅ Creating Angular components from templates
- ✅ Generating boilerplate code
- ✅ Implementing repetitive patterns
- ✅ Creating simple services
- ✅ Writing HTML templates
- ✅ Quick documentation updates

**Example prompts:**

```
"Create list component for products"
"Generate service for departments with CRUD methods"
"Create form dialog for user registration"
"Update README with new API endpoints"
```

### Cost-Benefit Analysis

#### Scenario: Create Products Management Feature

##### Approach 1: All Opus (Expensive)

```
Planning:        Opus    $$$   ✓ Thorough but overkill
Generation:      Opus    $$$   ✗ Waste - Sonnet does this well
Customization:   Opus    $$$   ✗ Waste - Sonnet does this well
Frontend:        Opus    $$$   ✗ Waste - Haiku does this well
────────────────────────────────
Total Cost:      $$$$$$$ (6x)
```

##### Approach 2: Optimal Mix (Recommended)

```
Planning:        Opus    $$$   ✓ Complex decisions
Generation:      Sonnet  $$    ✓ Perfect fit
Customization:   Sonnet  $$    ✓ Perfect fit
Frontend:        Haiku   $     ✓ Templates work great
────────────────────────────────
Total Cost:      $$$$$$  (Saves ~50%)
```

##### Approach 3: All Haiku (Risky)

```
Planning:        Haiku   $     ✗ May miss edge cases
Generation:      Haiku   $     ✗ May generate incorrectly
Customization:   Haiku   $     ✗ May miss complex logic
Frontend:        Haiku   $     ✓ Good for templates
────────────────────────────────
Total Cost:      $$      (Cheap but quality issues)
```

**Recommendation**: Use Approach 2 (Optimal Mix)

---

## Command Reference

### By Role

#### Tech Lead / Architect

```bash
# Use Opus for strategic planning
"Claude (Opus), plan the complete workflow for inventory management system"

# Use Opus for complex design decisions
"Claude (Opus), help me design the multi-tenant database schema"

# Use Sonnet for code reviews
"Claude (Sonnet), review the entire inventory module for best practices"
```

#### Backend Developer

```bash
# Use Sonnet for CRUD generation
"Claude (Sonnet), generate full CRUD for products table with events"

# Use Sonnet for customization
"Claude (Sonnet), add validation: product price must be between 0 and 1000000"

# Use Sonnet for complex logic
"Claude (Sonnet), implement order status workflow: pending → confirmed → shipped → delivered"

# Use Sonnet for API testing
"Claude (Sonnet), test all products API endpoints including validation rules"
```

#### Frontend Developer

```bash
# Use Haiku for component generation
"Claude (Haiku), create Angular service and list component for products"

# Use Haiku for dialog components
"Claude (Haiku), create CRUD dialog for products with all fields"

# Use Haiku for templates
"Claude (Haiku), create dropdown component for categories"

# Use Sonnet for complex components (with business logic)
"Claude (Sonnet), create dashboard component with charts and real-time updates"
```

#### QA Tester

```bash
# Use Sonnet for comprehensive testing
"Claude (Sonnet), run complete QA checklist for products feature"

# Use Sonnet for API testing
"Claude (Sonnet), test all validation rules for products API"

# Use Sonnet for integration testing
"Claude (Sonnet), test the complete CRUD flow for products from create to delete"
```

### By Task Type

#### Database & Migrations

```bash
# Planning schema (Opus)
"Claude (Opus), design database schema for hospital patient management"

# Creating migration (Sonnet)
"Claude (Sonnet), create migration for patients table with all medical fields"

# Running migrations (Sonnet)
"Claude (Sonnet), run all pending migrations and show status"
```

#### CRUD Generation

```bash
# Basic CRUD (Sonnet)
"Claude (Sonnet), generate basic CRUD for departments table"
pnpm run crud -- departments --force

# CRUD with Import (Sonnet)
"Claude (Sonnet), generate CRUD with Excel import for employees"
pnpm run crud:import -- employees --force

# CRUD with Events (Sonnet)
"Claude (Sonnet), generate CRUD with WebSocket events for notifications"
pnpm run crud:events -- notifications --force

# Full-featured CRUD (Sonnet)
"Claude (Sonnet), generate CRUD with all features for inventory_items"
pnpm run crud:full -- inventory_items --force
```

#### Backend Customization

```bash
# Validation rules (Sonnet)
"Claude (Sonnet), add validation: email unique, age 18-100, phone format +66-XXX-XXXX"

# Business logic (Sonnet)
"Claude (Sonnet), add logic: calculate total_price = quantity * unit_price on create/update"

# Relationships (Sonnet)
"Claude (Sonnet), add foreign key: orders.customer_id → customers.id with cascade delete"

# Custom endpoints (Sonnet)
"Claude (Sonnet), add endpoint GET /products/bestsellers to return top 10 products by sales"
```

#### Frontend Development

```bash
# Service creation (Haiku)
"Claude (Haiku), create Signal-based service for products with CRUD methods"

# List component (Haiku)
"Claude (Haiku), create list component with filters, pagination, and actions"

# Dialog component (Haiku)
"Claude (Haiku), create CRUD dialog for products with all form fields"

# Complex UI (Sonnet)
"Claude (Sonnet), create dashboard with charts, statistics, and real-time updates"
```

#### Testing & QA

```bash
# API testing (Sonnet)
"Claude (Sonnet), test all products API endpoints and verify responses"

# Validation testing (Sonnet)
"Claude (Sonnet), test all validation rules: required fields, formats, constraints"

# Integration testing (Sonnet)
"Claude (Sonnet), test complete CRUD flow: create → read → update → delete"

# Performance testing (Opus)
"Claude (Opus), analyze performance bottlenecks and recommend optimizations"
```

---

## Token Optimization Strategies

### Understanding Token Usage

```
Typical Token Usage by Model:
┌─────────────────────────────────────────────────────┐
│ Model  │ Avg per Request │ For Full Feature │ Cost │
├────────┼─────────────────┼──────────────────┼──────┤
│ Opus   │ 10,000-50,000   │ 100,000+         │ $$$$ │
│ Sonnet │ 5,000-20,000    │ 50,000+          │ $$   │
│ Haiku  │ 1,000-5,000     │ 10,000+          │ $    │
└─────────────────────────────────────────────────────┘
```

### Optimization Techniques

#### 1. Break Down Large Tasks

❌ **Bad (Wastes Tokens)**:

```
"Claude (Opus), create complete inventory system with backend, frontend,
tests, documentation, deployment scripts, and monitoring"
```

✅ **Good (Optimized)**:

```
# Step 1: Planning only
"Claude (Opus), plan the inventory system architecture and table structure"

# Step 2: Backend (switch to Sonnet)
"Claude (Sonnet), generate CRUD for inventory_items based on the plan"

# Step 3: Frontend (switch to Haiku)
"Claude (Haiku), create Angular components for inventory_items"

# Step 4: Testing (back to Sonnet)
"Claude (Sonnet), test all inventory_items endpoints"
```

**Token Savings**: ~60% (from 150K to 60K tokens)

#### 2. Be Specific and Concise

❌ **Bad (Verbose)**:

```
"Hey Claude, so I was thinking maybe we could perhaps possibly create
some kind of CRUD module for the products table, and I'm not sure but
maybe add some validation or something like that, and also maybe some
frontend stuff if that makes sense, what do you think?"
```

✅ **Good (Concise)**:

```
"Claude (Sonnet), generate CRUD for products table with validation:
price > 0, stock >= 0"
```

**Token Savings**: ~50% fewer input tokens

#### 3. Use Appropriate Model for Task

❌ **Bad (Overkill)**:

```
# Using Opus for simple template generation
"Claude (Opus), create a basic list component for products"
```

✅ **Good (Right Tool)**:

```
# Using Haiku for template work
"Claude (Haiku), create a basic list component for products"
```

**Token Savings**: ~80% cost reduction (Haiku is much cheaper)

#### 4. Reuse Generated Code

❌ **Bad (Regenerating)**:

```
Day 1: "Claude, generate products service"
Day 2: "Claude, generate categories service"  # Regenerates similar pattern
Day 3: "Claude, generate suppliers service"   # Regenerates similar pattern
```

✅ **Good (Reuse Template)**:

```
Day 1: "Claude, generate products service"
Day 2: Copy products.service.ts → categories.service.ts, find/replace
Day 3: Copy products.service.ts → suppliers.service.ts, find/replace
```

**Token Savings**: ~90% (only generate once, copy the rest)

#### 5. Batch Similar Tasks

❌ **Bad (Multiple Requests)**:

```
"Claude, create products service"
[Wait for response]
"Claude, create categories service"
[Wait for response]
"Claude, create suppliers service"
```

✅ **Good (Single Batch)**:

```
"Claude (Haiku), create Signal-based services for: products, categories, suppliers
Use the same pattern for all three"
```

**Token Savings**: ~40% (shared context, single response)

#### 6. Use Skills System Efficiently

The skills system **automatically loads relevant documentation** into context:

```
# When you say this:
"Claude, generate CRUD for products"

# Claude automatically loads:
- crud-generator-guide (1,663 lines)
- aegisx-cli documentation
- Project standards

# This is efficient because:
✓ Documentation is pre-organized
✓ No need to explain standards
✓ Consistent quality output
```

**vs Manual approach** (inefficient):

```
"Claude, here's how to use the CRUD generator... [paste 1000 lines]
...and here are the standards... [paste 500 lines]
...now generate CRUD for products"
```

#### 7. Cache Common Context

For repeated similar tasks:

```
# First request (establishes context)
"Claude (Sonnet), I'm working on inventory system. Generate CRUD for inventory_items"

# Subsequent requests (reuse context)
"Now generate CRUD for warehouses"  # Same domain, similar patterns
"Now generate CRUD for stock_movements"
```

**Token Savings**: ~30% (shared domain knowledge)

### Cost Comparison: Real Example

#### Task: Create Complete Products Management

##### Unoptimized Approach:

```
1. "Claude (Opus), create complete products management"
   → 150,000 tokens × $15/1M = $2.25

Total: $2.25
```

##### Optimized Approach:

```
1. "Claude (Opus), plan products management architecture"
   → 20,000 tokens × $15/1M = $0.30

2. "Claude (Sonnet), generate CRUD for products"
   → 15,000 tokens × $3/1M = $0.045

3. "Claude (Sonnet), add validation rules"
   → 10,000 tokens × $3/1M = $0.03

4. "Claude (Haiku), create Angular components"
   → 8,000 tokens × $0.25/1M = $0.002

Total: $0.377 (saves $1.87, 83% savings!)
```

---

## Best Practices

### For Teams

#### 1. Establish Clear Communication

```bash
# Good: Clear task ownership
@Backend-Dev: "I'll generate products CRUD with Sonnet"
@Frontend-Dev: "I'll wait for API, then create UI with Haiku"

# Bad: Unclear ownership
"Someone should do the products thing"
```

#### 2. Use Git Branching

```bash
# Each developer works on separate branch
git checkout -b feature/products-backend
git checkout -b feature/products-frontend
git checkout -b feature/categories-backend
```

#### 3. Document Decisions

```bash
# When using Opus for planning, save the output
"Claude (Opus), plan inventory system" > docs/planning/inventory-plan.md

# Share with team
git add docs/planning/inventory-plan.md
git commit -m "docs: add inventory system planning from Claude"
```

#### 4. Review Generated Code

```bash
# After Sonnet generates code, review with team
"Claude (Sonnet), review the generated products CRUD for security issues"
```

### For Individuals

#### 1. Start with Planning

```bash
# Always start with architecture (Opus)
"Claude (Opus), plan the feature before I implement it"
```

#### 2. Test Incrementally

```bash
# Don't generate everything then test
# Test after each phase:

"Claude (Sonnet), generate products backend"
→ Test backend APIs

"Claude (Haiku), generate products frontend"
→ Test UI integration

"Claude (Sonnet), add validation"
→ Test validation rules
```

#### 3. Keep Context Focused

```bash
# Start new conversation for new feature
# Don't mix multiple features in one conversation

Good:
- Conversation 1: Products management
- Conversation 2: Categories management

Bad:
- Conversation 1: Products + Categories + Suppliers + Everything
```

#### 4. Save Useful Outputs

```bash
# Save generated templates for reuse
.claude/templates/
├── service.template.ts
├── list.component.template.ts
└── dialog.component.template.ts

# Copy and adapt instead of regenerating
```

---

## Troubleshooting

### Common Issues

#### Issue 1: "Claude used wrong skill"

**Problem**: Asked for CRUD, but Claude used frontend-integration-guide

**Solution**: Be more explicit

```bash
❌ Bad: "Do the products thing"
✅ Good: "Claude, generate CRUD backend for products table"
```

#### Issue 2: "Claude used expensive model for simple task"

**Problem**: Opus used for template generation

**Solution**: Specify model explicitly

```bash
❌ Bad: "Claude, create list component"
✅ Good: "Claude (Haiku), create list component"
```

#### Issue 3: "Generated code doesn't match existing patterns"

**Problem**: Claude didn't follow project standards

**Solution**: Invoke the right skill

```bash
❌ Bad: "Create a service for products"
✅ Good: "Claude, use frontend-integration-guide to create Signal-based service for products"
```

#### Issue 4: "Too many tokens used"

**Problem**: Single request doing too much

**Solution**: Break into phases

```bash
❌ Bad: "Claude, create entire inventory system"
✅ Good:
  1. "Claude (Opus), plan inventory system"
  2. "Claude (Sonnet), generate inventory_items CRUD"
  3. "Claude (Haiku), create inventory UI"
```

#### Issue 5: "Multiple developers conflicting"

**Problem**: Two devs modifying same files

**Solution**: Coordinate tasks

```bash
# Use different tables/features
Dev A: products backend
Dev B: categories backend

# Or different layers
Dev A: products backend
Dev B: products frontend (wait for A)
```

---

## Quick Reference Card

### By Task Type

| Task                    | Recommended Model | Example Command                               |
| ----------------------- | ----------------- | --------------------------------------------- |
| **Planning**            | Opus              | "Claude (Opus), plan inventory system"        |
| **CRUD Generation**     | Sonnet            | "Claude (Sonnet), generate CRUD for products" |
| **Backend Logic**       | Sonnet            | "Claude (Sonnet), add validation rules"       |
| **Frontend Components** | Haiku             | "Claude (Haiku), create list component"       |
| **API Testing**         | Sonnet            | "Claude (Sonnet), test products API"          |
| **Code Review**         | Sonnet            | "Claude (Sonnet), review for security"        |
| **Documentation**       | Haiku             | "Claude (Haiku), update README"               |

### By Developer Role

| Role             | Primary Model | Secondary Model | Skills Used                           |
| ---------------- | ------------- | --------------- | ------------------------------------- |
| **Tech Lead**    | Opus          | Sonnet          | aegisx-development-workflow           |
| **Backend Dev**  | Sonnet        | -               | crud-generator, backend-customization |
| **Frontend Dev** | Haiku         | Sonnet          | frontend-integration                  |
| **QA Tester**    | Sonnet        | -               | All skills                            |

### Token Optimization Checklist

- ✅ Use Opus only for planning and complex decisions
- ✅ Use Sonnet for backend implementation and testing
- ✅ Use Haiku for frontend templates and components
- ✅ Break large tasks into smaller phases
- ✅ Be specific and concise in requests
- ✅ Reuse generated code templates
- ✅ Batch similar tasks together
- ✅ Let skills system auto-load documentation
- ✅ Start new conversations for new features

---

## Workflow Summary

### Complete Feature Development Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  AegisX Development Workflow                     │
│                    (with Claude Skills)                          │
└─────────────────────────────────────────────────────────────────┘

1. PLANNING (Opus)
   ├─ "Claude (Opus), plan [feature] system"
   ├─ Output: Architecture, table design, API design
   └─ Time: 5-10 minutes
        ↓
2. DATABASE (Sonnet)
   ├─ Create migration manually or with Claude
   ├─ Run: pnpm run db:migrate
   └─ Time: 2-5 minutes
        ↓
3. BACKEND GENERATION (Sonnet)
   ├─ "Claude (Sonnet), generate CRUD for [table]"
   ├─ Or: pnpm run crud:full -- [table] --force
   └─ Time: 1-3 minutes
        ↓
4. BACKEND CUSTOMIZATION (Sonnet)
   ├─ "Claude (Sonnet), add [business logic]"
   ├─ Output: Validation, relationships, custom endpoints
   └─ Time: 5-15 minutes
        ↓
5. API TESTING (Sonnet)
   ├─ "Claude (Sonnet), test [table] API endpoints"
   ├─ Output: curl commands, test results
   └─ Time: 3-5 minutes
        ↓
6. FRONTEND GENERATION (Haiku)
   ├─ "Claude (Haiku), create components for [table]"
   ├─ Output: Service, list, dialog components
   └─ Time: 2-5 minutes
        ↓
7. QA & TESTING (Sonnet)
   ├─ "Claude (Sonnet), run QA checklist for [feature]"
   ├─ Output: Test results, issues found
   └─ Time: 5-10 minutes
        ↓
8. DOCUMENTATION (Haiku)
   ├─ "Claude (Haiku), update documentation"
   └─ Time: 2-3 minutes

Total Time: 25-53 minutes per complete feature
```

### Parallel Team Workflow

```
                     START
                       ↓
              ┌────────┴────────┐
              │  Tech Lead      │
              │  (Opus)         │
              │  Plans Feature  │
              └────────┬────────┘
                       ↓
         ┌─────────────┼─────────────┐
         │                           │
    ┌────┴──────┐            ┌───────┴──────┐
    │ Backend   │            │ Frontend     │
    │ Developer │            │ Developer    │
    │ (Sonnet)  │            │ (Haiku)      │
    └────┬──────┘            └───────┬──────┘
         │                           │
         │ Generate CRUD             │ Wait for API
         │ Customize Logic           │ ↓
         │ Test APIs                 │ Create Components
         │                           │ Integrate with API
         ↓                           ↓
    ┌────┴────────────────────────────┴────┐
    │         QA Tester (Sonnet)           │
    │    Test Everything, Report Issues     │
    └──────────────┬───────────────────────┘
                   ↓
                  DONE
```

---

## Summary

### Key Takeaways

1. **Use the right model for the right task**
   - Opus: Planning & architecture
   - Sonnet: Backend implementation
   - Haiku: Frontend templates

2. **Let skills guide you automatically**
   - Skills activate based on keywords
   - No need to manually load documentation

3. **Work in phases, not all at once**
   - Plan → Generate → Customize → Test
   - Saves tokens, improves quality

4. **Coordinate with your team**
   - Clear task ownership
   - Use git branches
   - Document decisions

5. **Optimize token usage**
   - Break down tasks
   - Be specific
   - Reuse templates
   - Batch similar tasks

### Need Help?

```bash
# For workflow guidance
"Claude (Opus), I need help planning my development workflow"

# For CRUD generation
"Claude (Sonnet), show me how to generate CRUD with all features"

# For frontend patterns
"Claude (Haiku), show me the Signal-based service pattern"

# For testing
"Claude (Sonnet), how do I test my API endpoints?"
```

---

**Happy coding with Claude Skills! 🚀**

_Last updated: 2025-01-17_
_Version: 1.0.0_
