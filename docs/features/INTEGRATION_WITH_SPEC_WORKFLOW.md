# Integration: Spec Workflow ↔️ Feature Tracking

> **🎯 How spec-workflow and feature tracking work together**
>
> **Last Updated**: 2025-12-20

---

## 📊 Two Systems, Different Purposes

### Spec Workflow (`.spec-workflow/`)

**Purpose**: Planning & Execution (BEFORE & DURING)
**Location**: `.spec-workflow/specs/[spec-name]/`
**Tools**: MCP spec-workflow server

```
📋 Planning Phase:
├── requirements.md    ← What we want to build
├── design.md          ← How we'll build it
└── tasks.md           ← Step-by-step tasks

🚧 Execution Phase:
└── Implementation Logs/
    ├── task-1-1.md    ← Detailed logs per task
    ├── task-1-2.md
    └── ...
```

### Feature Tracking (`docs/features/`)

**Purpose**: Historical Record (AFTER)
**Location**: `docs/features/`
**Tools**: Manual tracking with templates

```
📚 Registry:
└── FEATURES.md        ← All features ever done

📝 Completion Reports:
└── [feature-name]/
    └── COMPLETION.md  ← Summary of completed feature
```

---

## 🔄 Workflow: Spec → Feature

### Simple Workflow (No Spec)

For simple features (basic CRUD, small enhancements):

```
User Request
    ↓
Implement Feature
    ↓
Create COMPLETION.md + Update FEATURES.md
    ↓
Done
```

### Complex Workflow (With Spec)

For complex features (multi-phase, needs planning):

```
User Request
    ↓
📋 Phase 1: Spec Workflow (PLANNING)
    │
    ├── Create spec with MCP: spec-workflow-create
    ├── Write requirements.md
    ├── Write design.md
    ├── Write tasks.md
    └── Get approval
    ↓
🟢 Add to FEATURES.md (Active section)
    ↓
🚧 Phase 2: Spec Workflow (EXECUTION)
    │
    ├── Execute tasks one by one
    ├── Log each task in Implementation Logs/
    ├── Update tasks.md status
    └── Complete all tasks
    ↓
✅ Phase 3: Feature Tracking (COMPLETION)
    │
    ├── Create docs/features/[feature-name]/COMPLETION.md
    ├── Link to spec in COMPLETION.md
    ├── Update FEATURES.md (move to Completed)
    └── Archive spec if needed
    ↓
Done
```

---

## 📝 COMPLETION.md Links to Spec

When feature was built with spec-workflow, link to it:

```markdown
# [Feature Name] - Completion Report

**Completed**: 2025-12-20
**Commit**: abc123de
**Spec**: `.spec-workflow/specs/feature-name/` ← Link to spec!

---

## 📊 Summary

[Brief 2-3 sentence summary]

For detailed planning and design decisions, see:

- [Requirements](./.spec-workflow/specs/feature-name/requirements.md)
- [Design](./.spec-workflow/specs/feature-name/design.md)
- [Implementation Logs](./.spec-workflow/specs/feature-name/Implementation Logs/)

---

## 🎯 What Was Implemented

[Summarize from Implementation Logs...]
```

---

## 🎯 When to Use What

### Use ONLY Feature Tracking (No Spec)

✅ **Simple features**:

- Basic CRUD modules
- Small UI enhancements
- Bug fixes (if > 3 files)
- Configuration changes
- Documentation updates

**Process**:

1. Implement directly
2. Create COMPLETION.md
3. Update FEATURES.md

### Use Spec Workflow + Feature Tracking

✅ **Complex features**:

- Multi-phase features
- Need stakeholder approval
- Architectural decisions
- High-risk changes
- Multiple developers
- > 5 days of work

**Process**:

1. Create spec (requirements, design, tasks)
2. Get approval
3. Add to FEATURES.md Active
4. Execute tasks + log in Implementation Logs
5. Create COMPLETION.md (link to spec)
6. Update FEATURES.md Completed

---

## 📊 Comparison Table

| Aspect             | Spec Workflow                 | Feature Tracking        |
| ------------------ | ----------------------------- | ----------------------- |
| **When**           | Before & During               | After                   |
| **Purpose**        | Plan & Execute                | Record & Reference      |
| **Detail Level**   | Very detailed                 | Summary only            |
| **Files**          | 3+ (req, design, tasks, logs) | 1 (COMPLETION.md)       |
| **Time to Create** | 2-8 hours                     | 15-30 minutes           |
| **Audience**       | Team, stakeholders            | Future developers, AI   |
| **Searchable**     | Implementation Logs           | COMPLETION.md           |
| **Git Tracked**    | Yes (in .spec-workflow/)      | Yes (in docs/features/) |
| **MCP Tools**      | Yes (spec-workflow)           | No (manual)             |

---

## 🔍 Example: Complex Feature

Let's say we're building "Budget Variance Analytics Dashboard"

### Step 1: Create Spec (spec-workflow)

```bash
# Use MCP tool
spec-workflow-create "budget-variance-analytics"

# Creates:
.spec-workflow/specs/budget-variance-analytics/
├── requirements.md   ← What we need
├── design.md         ← Architecture, API design, UI mockups
└── tasks.md          ← 10 tasks, organized in phases
```

### Step 2: Add to Feature Registry

```bash
# Edit docs/features/FEATURES.md
## 🟢 Active (In Progress)

| Feature | Started | Status | Files | Notes |
|---------|---------|--------|-------|-------|
| Budget Variance Analytics | 2025-12-20 | Planning | TBD | Spec ready, awaiting approval |
```

### Step 3: Execute & Log (spec-workflow)

```bash
# Work on tasks
# Log each task completion in Implementation Logs/

.spec-workflow/specs/budget-variance-analytics/
└── Implementation Logs/
    ├── task-1-1-database-schema.md
    ├── task-1-2-api-endpoints.md
    ├── task-2-1-chart-components.md
    └── ...
```

### Step 4: Create Completion Report

```bash
# Create docs/features/budget-variance-analytics/COMPLETION.md
```

```markdown
# Budget Variance Analytics Dashboard - Completion Report

**Completed**: 2025-12-25
**Commit**: def456gh
**Spec**: `.spec-workflow/specs/budget-variance-analytics/`
**Category**: Budget Management / Analytics

---

## 📊 Summary

Implemented comprehensive budget variance analytics dashboard with real-time
charts, drill-down capabilities, and export functionality. Dashboard includes
variance tracking by department, category, and time period.

**Full planning and design documentation**:

- [Requirements](./.spec-workflow/specs/budget-variance-analytics/requirements.md)
- [Design Document](./.spec-workflow/specs/budget-variance-analytics/design.md)
- [Implementation Logs](./.spec-workflow/specs/budget-variance-analytics/Implementation Logs/)

---

## 🎯 What Was Implemented

### Backend (from spec tasks 1.x)

- ✅ API Endpoint: `GET /api/budgets/variance-analytics`
- ✅ Repository: VarianceAnalyticsRepository with 5 complex queries
- ✅ Service: VarianceAnalyticsService with caching

### Frontend (from spec tasks 2.x)

- ✅ Component: VarianceAnalyticsDashboard (standalone)
- ✅ Charts: 4 chart types (line, bar, pie, scatter)
- ✅ Filters: Department, date range, category

### Database (from spec tasks 1.1)

- ✅ View: budget_variance_summary
- ✅ Indexes: 3 composite indexes for performance

---

## 📁 Files Changed

Created: 12 files
Modified: 8 files

(See Implementation Logs for detailed file list per task)

---

## 🧪 Testing

- ✅ All 10 tasks tested and verified
- ✅ Integration test passed
- ✅ Performance test: < 500ms query time

(See task-3-1-integration-test.md in Implementation Logs)

---

## 📚 Documentation

- ✅ Spec workflow complete: requirements, design, tasks, logs
- ✅ API contracts updated
- ✅ This COMPLETION.md
- ✅ FEATURES.md updated

---

## 🔗 Related

### Spec Reference

- Spec: `.spec-workflow/specs/budget-variance-analytics/`
- Total tasks: 10 (all completed)
- Implementation period: 2025-12-20 to 2025-12-25

### Dependencies

- Depends on: Budget module, Chart library
- Enables: Executive dashboards, Variance alerts

---

## 📝 Notes

For complete implementation details, architecture decisions, and per-task
logs, refer to the spec workflow directory:

`.spec-workflow/specs/budget-variance-analytics/`

This COMPLETION.md provides a high-level summary. The spec contains:

- Detailed requirements and user stories
- Architecture diagrams and API design
- Per-task implementation logs with code examples
- Test results and performance metrics
```

### Step 5: Update Feature Registry

```bash
# Move from Active to Completed in FEATURES.md

## ✅ Completed (Last 30 Days)

| Feature | Completed | Commit | Files | Summary |
|---------|-----------|--------|-------|---------|
| Budget Variance Analytics | 2025-12-25 | def456gh | 20 | Dashboard with charts and export |
```

---

## 🎯 Benefits of This Integration

### 1. Best of Both Worlds

✅ **Spec Workflow**:

- Detailed planning for complex features
- Per-task execution logs
- Stakeholder approval process

✅ **Feature Tracking**:

- Quick historical reference
- Single registry of all features
- Easy search and discovery

### 2. No Duplication

❌ **WRONG**: Copy everything from spec to COMPLETION.md

✅ **CORRECT**: COMPLETION.md summarizes and links to spec

### 3. Future-Proof

When looking for a feature 6 months later:

1. Check `FEATURES.md` → Find it in Completed section
2. Open `COMPLETION.md` → Get summary
3. Need details? → Follow link to `.spec-workflow/specs/[name]/`

---

## 📋 Checklist: Spec Workflow Feature

When completing a feature that used spec-workflow:

```markdown
✅ Spec Workflow:

- [ ] All tasks in tasks.md marked as completed
- [ ] Implementation Logs created for each task
- [ ] COMPLETION_REPORT.md in spec (optional)

✅ Feature Tracking:

- [ ] Create docs/features/[name]/COMPLETION.md
- [ ] Link to spec in COMPLETION.md
- [ ] Summarize (don't duplicate) from Implementation Logs
- [ ] Update FEATURES.md (Active → Completed)
- [ ] Commit both files

✅ Optional:

- [ ] Archive spec if no longer needed
- [ ] Update related documentation
```

---

## 🔧 Tools & Commands

### Create New Spec (Complex Feature)

```bash
# Use MCP tool
mcp spec-workflow-create "feature-name"

# Manually add to FEATURES.md Active section
```

### Simple Feature (No Spec)

```bash
# Just implement and document after
# 1. Implement
# 2. Create COMPLETION.md
# 3. Update FEATURES.md
```

### Archive Old Spec

```bash
# Move completed specs older than 90 days
mv .spec-workflow/specs/old-feature \
   .spec-workflow/archive/2024-Q4/
```

---

## 📊 Real Examples

### With Spec (Complex)

```
✅ Budget Variance Analytics
   - Spec: .spec-workflow/specs/budget-variance-analytics/
   - Completion: docs/features/budget-variance-analytics/COMPLETION.md
   - 10 tasks, 5 days work

✅ RBAC Permission Consolidation
   - Spec: .spec-workflow/specs/rbac-permission-consolidation/
   - Completion: docs/features/rbac-consolidation/COMPLETION.md
   - 8 tasks, 3 days work
```

### Without Spec (Simple)

```
✅ Budget Control Settings UI
   - No spec (simple UI feature)
   - Completion: docs/features/budget-control-settings/COMPLETION.md
   - 1 day work

✅ Item Settings Modal
   - No spec (straightforward CRUD modal)
   - Completion: docs/features/item-settings-modal/COMPLETION.md
   - 2 hours work
```

---

## ❓ FAQ

### Q: ทุก feature ต้องมี spec ไหม?

A: **ไม่ต้อง!** Spec สำหรับ features ซับซ้อนเท่านั้น (> 5 days, multi-phase)

### Q: ถ้ามี spec แล้ว ต้องเขียน COMPLETION.md อีกไหม?

A: **ใช่!** COMPLETION.md คือ summary สั้นๆ + link ไป spec

### Q: COMPLETION.md กับ spec COMPLETION_REPORT.md ต่างกันยังไง?

A:

- `docs/features/[name]/COMPLETION.md` = Feature tracking (registry)
- `.spec-workflow/specs/[name]/COMPLETION_REPORT.md` = Spec summary (optional)

### Q: Feature เล็กๆ ควรทำ spec ไหม?

A: **ไม่ควร** - Spec overhead สูง, ใช้เวลา 2-8 ชม.
Feature เล็ก → implement ตรงๆ → สร้าง COMPLETION.md (15-30 นาที)

### Q: ถ้าเริ่มจาก spec แล้วลืมสร้าง COMPLETION.md?

A: Backfill ได้ - อ่าน Implementation Logs แล้วสรุปใน COMPLETION.md

---

## ✅ Decision Tree

```
User requests feature
    ↓
Is it complex? (> 5 days, multi-phase, needs approval)
    ↓
   Yes → Use Spec Workflow
    │     1. Create spec (req, design, tasks)
    │     2. Add to FEATURES.md Active
    │     3. Execute + log
    │     4. Create COMPLETION.md (link to spec)
    │     5. Update FEATURES.md Completed
    ↓
   No → Simple Implementation
         1. Implement directly
         2. Create COMPLETION.md
         3. Update FEATURES.md
```

---

## 🎯 Summary

|              | Spec Workflow                 | Feature Tracking        |
| ------------ | ----------------------------- | ----------------------- |
| **Use for**  | Planning & Execution          | Historical Record       |
| **When**     | Complex features              | All features > 3 files  |
| **Time**     | 2-8 hours                     | 15-30 minutes           |
| **Detail**   | Very detailed                 | Summary only            |
| **Together** | Use both for complex features | Always use for features |

**Golden Rule**:

- Complex feature? → Spec Workflow + Feature Tracking
- Simple feature? → Feature Tracking only

---

**Version**: 1.0.0
**Last Updated**: 2025-12-20
