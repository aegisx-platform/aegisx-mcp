---
name: documentation-standards
description: Enforce standardized documentation practices including file naming, directory structure, and content organization. Use when creating ANY documentation files (completion reports, guides, specs, etc.)
allowed-tools: Read, Write, Edit, Glob, Bash
---

# Documentation Standards Skill

**Purpose**: Ensure all documentation follows project standards for naming, structure, and organization.

## When Claude Should Use This Skill

**ALWAYS use this skill when:**

- Creating ANY documentation file
- Creating completion reports
- Creating guides or tutorials
- Creating specification documents
- Creating meeting notes or session summaries
- Moving or organizing documentation files

**Keywords that trigger this skill:**

- "create documentation", "write docs", "create guide"
- "completion report", "summary document"
- "move docs", "organize documentation"

## Critical Rules

### 1. File Naming Convention

**MANDATORY: Use kebab-case for ALL file names**

```bash
# ✅ CORRECT
feature-implementation-guide.md
user-authentication-spec.md
frontend-integration-completion.md
api-design-patterns.md

# ❌ WRONG - NEVER use these formats
FEATURE_IMPLEMENTATION_GUIDE.md    # SCREAMING_SNAKE_CASE
FeatureImplementationGuide.md      # PascalCase
feature_implementation_guide.md    # snake_case
Feature-Implementation-Guide.md    # Title-Kebab-Case
```

**Rules:**

- All lowercase
- Words separated by hyphens (-)
- No underscores (\_)
- No uppercase letters
- Extension: Always `.md` for documentation

### 2. Directory Structure

```
project-root/
├── docs/                           # Public documentation (VitePress)
│   ├── guides/
│   │   ├── development/           # Development guides
│   │   ├── infrastructure/        # Infrastructure guides
│   │   └── database/              # Database guides
│   ├── reference/
│   │   ├── api/                   # API reference docs
│   │   ├── cli/                   # CLI reference docs
│   │   └── ui/                    # UI reference docs
│   ├── architecture/              # Architecture documentation
│   └── features/                  # Feature documentation
│
├── .claude/                       # Claude-specific files
│   └── skills/                    # Claude skills
│       └── [skill-name]/
│           ├── SKILL.md           # Skill instructions (UPPERCASE ok here)
│           ├── README.md          # User guide (UPPERCASE ok here)
│           └── scripts/           # Helper scripts
│
├── .project/                      # Internal project files (NOT in docs/)
│   ├── completion-reports/       # Task completion reports
│   │   └── [feature]-completion.md
│   ├── meeting-notes/            # Meeting notes and summaries
│   │   └── [date]-[topic].md
│   ├── session-logs/             # Development session logs
│   │   └── [date]-[session].md
│   └── planning/                 # Planning documents
│       └── [feature]-plan.md
│
└── .spec-workflow/               # Spec workflow files (managed by MCP)
    └── specs/
        └── [spec-name]/
```

**Directory Usage:**

| Type of Document       | Location                       | Example                                            |
| ---------------------- | ------------------------------ | -------------------------------------------------- |
| **Public Guides**      | `docs/guides/`                 | `docs/guides/development/testing-guide.md`         |
| **API Reference**      | `docs/reference/api/`          | `docs/reference/api/authentication-api.md`         |
| **Architecture**       | `docs/architecture/`           | `docs/architecture/frontend-patterns.md`           |
| **Features**           | `docs/features/`               | `docs/features/user-auth/README.md`                |
| **Completion Reports** | `.project/completion-reports/` | `.project/completion-reports/auth-feature.md`      |
| **Meeting Notes**      | `.project/meeting-notes/`      | `.project/meeting-notes/2025-01-17-planning.md`    |
| **Session Logs**       | `.project/session-logs/`       | `.project/session-logs/2025-01-17-backend-work.md` |
| **Planning Docs**      | `.project/planning/`           | `.project/planning/inventory-system-plan.md`       |

### 3. Special Cases (Exceptions)

**Files that CAN use UPPERCASE:**

- `README.md` - Standard convention
- `CHANGELOG.md` - Standard convention
- `LICENSE` - Standard convention
- `CONTRIBUTING.md` - Standard convention
- `.claude/skills/*/SKILL.md` - Skill definition files
- `.claude/skills/*/REFERENCE.md` - Quick reference files
- `.claude/skills/*/INDEX.md` - Index files

**All other files MUST use kebab-case**

### 4. File Organization Workflow

#### When Creating Completion Reports

```bash
# ❌ WRONG - Don't create in root
FEATURE_COMPLETION.md
Frontend_Implementation_Done.md

# ✅ CORRECT - Create in .project/completion-reports/
.project/completion-reports/feature-implementation.md
.project/completion-reports/frontend-integration.md
```

**Steps:**

1. Create directory: `.project/completion-reports/` (if not exists)
2. Create file with kebab-case: `[feature-name]-completion.md`
3. Write content following template (see below)
4. Never commit to git (add to .gitignore)

#### When Creating Public Documentation

```bash
# Public docs that WILL be deployed
docs/guides/development/feature-development-workflow.md
docs/reference/api/rest-api-standards.md
docs/architecture/database-design-patterns.md
```

**Steps:**

1. Determine category: guides, reference, architecture, features
2. Create file with kebab-case name
3. Update VitePress navigation in `docs/.vitepress/config.mts`
4. Write content following documentation standards
5. Commit to git

#### When Creating Session Logs

```bash
# Internal logs for tracking work
.project/session-logs/2025-01-17-authentication-implementation.md
.project/session-logs/2025-01-18-frontend-development.md
```

**Format:** `[YYYY-MM-DD]-[topic-in-kebab-case].md`

### 5. Content Templates

#### Completion Report Template

```markdown
# [Feature Name] - Completion Report

**Date**: YYYY-MM-DD
**Type**: [Backend/Frontend/Full-Stack/Infrastructure]
**Status**: ✅ Complete / ⚠️ Partial / ❌ Failed

## Summary

Brief 2-3 sentence summary of what was completed.

## What Was Implemented

### Backend

- Item 1
- Item 2

### Frontend

- Item 1
- Item 2

### Infrastructure

- Item 1
- Item 2

## Files Modified
```

apps/api/src/...
apps/admin/src/...

```

## Files Created

```

new-file-1.ts
new-file-2.ts

```

## Technical Details

### Architecture Decisions
- Decision 1 and rationale
- Decision 2 and rationale

### Key Patterns Used
- Pattern 1
- Pattern 2

## Testing

- [ ] Unit tests passed
- [ ] Integration tests passed
- [ ] Manual testing complete

## Next Steps

1. Step 1
2. Step 2

## Notes

Additional notes or observations.
```

#### Public Guide Template

```markdown
# [Guide Title]

> Brief description of what this guide covers

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Step-by-Step Guide](#step-by-step-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Introduction to the topic.

## Getting Started

Prerequisites and initial setup.

## Step-by-Step Guide

Detailed instructions.

## Best Practices

Recommended approaches.

## Troubleshooting

Common issues and solutions.

---

_Last updated: YYYY-MM-DD_
```

#### Session Log Template

```markdown
# Session: [Topic] - [Date]

**Date**: YYYY-MM-DD
**Duration**: X hours
**Participants**: [Names or "Solo"]

## Objectives

- [ ] Objective 1
- [ ] Objective 2

## Work Completed

### Task 1: [Name]

- What was done
- Files affected
- Results

### Task 2: [Name]

- What was done
- Files affected
- Results

## Decisions Made

1. **Decision**: [Description]
   - **Rationale**: Why this decision was made
   - **Impact**: What this affects

## Issues Encountered

### Issue 1: [Description]

- **Problem**: What went wrong
- **Solution**: How it was fixed
- **Prevention**: How to avoid in future

## Next Session

- [ ] Task 1
- [ ] Task 2

## Notes

Additional observations or reminders.
```

### 6. Git Ignore Rules

**Add to `.gitignore`:**

```gitignore
# Internal project documentation (not for public docs)
.project/

# Temporary documentation
*.tmp.md
*.draft.md
*-wip.md
```

**Files to commit:**

- All files in `docs/` (public documentation)
- All files in `.claude/skills/` (Claude skills)
- NOT files in `.project/` (internal use only)

### 7. Automatic Enforcement

#### Pre-Creation Checklist

Before creating ANY documentation file, check:

```
✓ Is the file name in kebab-case?
✓ Is it in the correct directory?
✓ Does it follow the appropriate template?
✓ Is it added to .gitignore if internal?
✓ Is it added to VitePress nav if public?
```

#### Post-Creation Validation

After creating a file, verify:

```bash
# Check file name format
echo "filename.md" | grep -E '^[a-z0-9-]+\.md$'
# Should match - all lowercase, hyphens, .md extension

# Check location
pwd
# Should be in docs/ or .project/ not root

# Check if indexed (for public docs)
grep -r "filename" docs/.vitepress/config.mts
# Should find entry if in docs/
```

## Implementation Patterns

### Pattern 1: Creating Completion Report

```typescript
// When task is completed
const reportData = {
  feature: 'user-authentication',
  type: 'completion',
  date: '2025-01-17',
};

// ✅ CORRECT
const filename = `${reportData.feature}-${reportData.type}.md`;
const filepath = `.project/completion-reports/${filename}`;
// Result: .project/completion-reports/user-authentication-completion.md

// ❌ WRONG
const filename = `${reportData.feature.toUpperCase()}_COMPLETION.md`;
const filepath = filename;
// Result: USER_AUTHENTICATION_COMPLETION.md (in root!)
```

### Pattern 2: Creating Public Guide

```typescript
// When creating public documentation
const guideData = {
  category: 'development',
  topic: 'api-testing',
  type: 'guide',
};

// ✅ CORRECT
const filename = `${guideData.topic}-${guideData.type}.md`;
const filepath = `docs/guides/${guideData.category}/${filename}`;
// Result: docs/guides/development/api-testing-guide.md

// Then update VitePress config
const navEntry = {
  text: 'API Testing Guide',
  link: `/guides/${guideData.category}/${guideData.topic}-${guideData.type}`,
};
```

### Pattern 3: Organizing Existing Files

```bash
# When you find misplaced files in root
# Step 1: Identify file type
if [[ $filename =~ COMPLETION|SUMMARY ]]; then
  type="completion-report"
  dest=".project/completion-reports"
elif [[ $filename =~ SESSION|LOG ]]; then
  type="session-log"
  dest=".project/session-logs"
elif [[ $filename =~ PLAN|DESIGN ]]; then
  type="planning"
  dest=".project/planning"
else
  type="public-doc"
  dest="docs/guides/development"
fi

# Step 2: Convert to kebab-case
new_name=$(echo "$filename" | tr '[:upper:]' '[:lower:]' | tr '_' '-')

# Step 3: Move
mkdir -p "$dest"
mv "$filename" "$dest/$new_name"
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Creating Files in Root

```bash
# WRONG
COMPLETION.md
feature-done.md
session-summary.md

# CORRECT
.project/completion-reports/feature-completion.md
.project/session-logs/2025-01-17-feature-work.md
```

### ❌ Mistake 2: Using Wrong Case

```bash
# WRONG
Feature_Implementation.md
FEATURE-IMPLEMENTATION.md
Feature-Implementation.md

# CORRECT
feature-implementation.md
```

### ❌ Mistake 3: Not Organizing by Type

```bash
# WRONG - all mixed together
.project/
  frontend-done.md
  meeting-notes.md
  completion.md
  planning.md

# CORRECT - organized by type
.project/
  completion-reports/
    frontend-completion.md
  meeting-notes/
    2025-01-17-planning.md
  planning/
    feature-plan.md
```

### ❌ Mistake 4: Committing Internal Docs

```bash
# WRONG - committing internal files
git add .project/completion-reports/
git commit -m "Add completion report"

# CORRECT - internal docs in .gitignore
# Only commit public docs in docs/
git add docs/guides/development/new-guide.md
git commit -m "docs: add new development guide"
```

## Quality Checks

### Before Creating File

```bash
# 1. Check if directory exists
[ -d "docs/guides/development" ] || mkdir -p "docs/guides/development"

# 2. Validate file name
filename="new-guide.md"
if [[ ! $filename =~ ^[a-z0-9-]+\.md$ ]]; then
  echo "ERROR: Invalid filename format"
  exit 1
fi

# 3. Check for duplicates
if [ -f "docs/guides/development/$filename" ]; then
  echo "WARNING: File already exists"
fi
```

### After Creating File

```bash
# 1. Verify location
filepath=".project/completion-reports/feature-completion.md"
if [[ $filepath == *.md ]] && [[ ! $filepath =~ ^(docs|\.claude|\.project) ]]; then
  echo "ERROR: File in wrong location (root or invalid directory)"
fi

# 2. Verify case
basename=$(basename "$filepath")
if [[ $basename =~ [A-Z_] ]]; then
  echo "ERROR: Filename contains uppercase or underscores"
fi

# 3. Check git status
if [[ $filepath =~ ^\.project ]] && git ls-files "$filepath" >/dev/null 2>&1; then
  echo "WARNING: Internal file is tracked by git"
fi
```

## Integration with Other Skills

### With aegisx-development-workflow

When completing a feature:

1. aegisx-development-workflow guides the implementation
2. documentation-standards handles the completion report
3. Store completion report in `.project/completion-reports/`

### With crud-generator-guide

When generating CRUD:

1. crud-generator creates the feature
2. documentation-standards creates feature docs in `docs/features/[feature]/`
3. Follow template for feature documentation

### With frontend-integration-guide

When building UI:

1. frontend-integration-guide provides patterns
2. documentation-standards organizes component docs
3. Create guides in `docs/guides/development/`

## Examples

### Example 1: Feature Completion

```bash
# User completes user authentication feature
# Claude uses documentation-standards skill

# Create completion report
filepath=".project/completion-reports/user-authentication-completion.md"
mkdir -p "$(dirname "$filepath")"
cat > "$filepath" <<'EOF'
# User Authentication - Completion Report

**Date**: 2025-01-17
**Type**: Full-Stack
**Status**: ✅ Complete

## Summary
Implemented complete user authentication system with JWT tokens,
session management, and role-based access control.

[... rest of content ...]
EOF

# Verify
echo "✅ Created: $filepath"
echo "✅ Filename format: kebab-case"
echo "✅ Location: .project/completion-reports/"
echo "✅ Not tracked by git: .project/ in .gitignore"
```

### Example 2: Public Guide

```bash
# User wants to document API testing
# Claude uses documentation-standards skill

# Create guide
filepath="docs/guides/development/api-testing-guide.md"
cat > "$filepath" <<'EOF'
# API Testing Guide

> Learn how to test APIs effectively using our testing framework

[... content ...]
EOF

# Update VitePress navigation
# Edit docs/.vitepress/config.mts
# Add entry under /guides/development/

# Commit
git add "$filepath" docs/.vitepress/config.mts
git commit -m "docs: add API testing guide"
```

### Example 3: Cleaning Up Root

```bash
# User finds: FRONTEND_COMPLETION.md in root
# Claude uses documentation-standards skill

# Identify and move
source_file="FRONTEND_COMPLETION.md"
new_name=$(echo "$source_file" | tr '[:upper:]' '[:lower:]' | tr '_' '-')
dest=".project/completion-reports/$new_name"

mkdir -p "$(dirname "$dest")"
mv "$source_file" "$dest"

echo "✅ Moved: $source_file → $dest"
echo "✅ Root directory clean"
```

## Summary

### Golden Rules

1. **Kebab-case** for all files (except README.md, LICENSE, etc.)
2. **Organize by type** using proper directories
3. **Internal docs** in `.project/`, **public docs** in `docs/`
4. **Follow templates** for consistency
5. **Update navigation** for public docs
6. **Never commit** internal files

### Quick Reference

| Task              | Correct Path                               | Incorrect Path    |
| ----------------- | ------------------------------------------ | ----------------- |
| Completion report | `.project/completion-reports/feature.md`   | `FEATURE_DONE.md` |
| Session log       | `.project/session-logs/2025-01-17-work.md` | `Session_Log.md`  |
| Public guide      | `docs/guides/development/guide-name.md`    | `Guide_Name.md`   |
| Feature docs      | `docs/features/feature-name/README.md`     | `docs/FEATURE.md` |

---

**Remember**: When in doubt, ask:

1. Is the name kebab-case?
2. Is it in the right directory?
3. Should it be committed?

If unsure about any of these, STOP and ask the user.
