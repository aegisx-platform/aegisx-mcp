# Feature Tracking Rules for Claude

> **🎯 MANDATORY rules for tracking all feature development**
>
> **System**: [Feature Tracking System](../../docs/features/FEATURE_TRACKING_SYSTEM.md)

---

## 🚨 CRITICAL: Always Follow These Rules

### Rule 1: Read FEATURES.md FIRST

```markdown
BEFORE starting ANY feature work:

1. Read docs/features/FEATURES.md
2. Check if feature is already in Active/Completed
3. Check for dependencies or blockers
```

**Why**: Prevents duplicate work and ensures awareness of existing features

---

### Rule 2: Track Features > 3 Files or > 1 Hour

```markdown
IF feature involves:

- More than 3 files changed, OR
- More than 1 hour of work, OR
- New API endpoints, OR
- Database schema changes, OR
- New UI components

THEN:

- MUST update docs/features/FEATURES.md
- MUST create COMPLETION.md when done
```

**Don't track**: Tiny bug fixes (1-2 files), typo corrections, comment updates

---

### Rule 3: Update FEATURES.md Twice Per Feature

#### When Starting

```markdown
1. Add to "🟢 Active" section in docs/features/FEATURES.md
2. Include: name, start date, status, estimated files, notes
3. Commit: git commit -m "docs(features): start tracking [name]"
```

#### When Completing

```markdown
1. Create docs/features/[feature-name]/COMPLETION.md
2. Move from "Active" to "Completed" in FEATURES.md
3. Add: completion date, commit hash, file count, summary
4. Update statistics section
5. Commit both files together
```

---

## 📋 Step-by-Step Workflow

### Starting a New Feature

```bash
# 1. Read registry
Read docs/features/FEATURES.md

# 2. Check for conflicts
grep -i "feature-name" docs/features/FEATURES.md

# 3. Update registry (add to Active section)
Edit docs/features/FEATURES.md

# 4. Commit registry update
git add docs/features/FEATURES.md
git commit -m "docs(features): start tracking [feature-name]"

# 5. NOW implement the feature
[... do the work ...]
```

### Completing a Feature

```bash
# 1. Create completion report
cp docs/features/COMPLETION_TEMPLATE.md docs/features/[name]/COMPLETION.md
# Fill in all sections

# 2. Update registry (move to Completed)
Edit docs/features/FEATURES.md
- Move from Active to Completed
- Add commit hash: git log -1 --oneline | cut -d' ' -f1
- Add file count
- Add 1-sentence summary

# 3. Commit both files
git add docs/features/FEATURES.md docs/features/[name]/COMPLETION.md
git commit -m "docs(features): complete [feature-name]"

# 4. Summarize to user
Show summary from COMPLETION.md to user
```

---

## ✅ What to Include in COMPLETION.md

### MANDATORY Sections (must fill)

1. **📊 Summary** (2-3 sentences)
2. **🎯 What Was Implemented** (backend/frontend/database details)
3. **📁 Files Changed** (created/modified/deleted lists)
4. **🧪 Testing** (manual, API, build status)
5. **🔗 Related** (dependencies, impacts, related commits)

### OPTIONAL Sections (if applicable)

- 📚 Documentation (if docs were updated)
- 🚀 Deployment Notes (if deployment steps needed)
- ⚠️ Breaking Changes (if any)
- 🐛 Known Issues (if any)
- 📝 Notes for Developers (if important patterns/decisions)

---

## 🎯 Examples: When to Track

### ✅ MUST Track

- ✅ New CRUD module generated
- ✅ New API endpoint created
- ✅ New UI component/page created
- ✅ Database migration with schema changes
- ✅ Authentication/Authorization changes
- ✅ Major refactoring (> 5 files)
- ✅ Integration with external service
- ✅ Performance optimization (if significant)

### ❌ DON'T Track

- ❌ Typo fixes (1 file)
- ❌ Comment updates
- ❌ Formatting changes
- ❌ Small bug fixes (< 3 files, < 30 minutes)
- ❌ Documentation-only updates (unless major rewrite)

---

## 🔄 Quick Reference: Claude's Mental Checklist

### Before Starting Work

```
□ Did I read docs/features/FEATURES.md?
□ Is this feature already being worked on?
□ Are there dependencies I need to check?
□ Is this significant enough to track (>3 files or >1 hour)?
□ If yes, did I add to Active section in FEATURES.md?
□ Did I commit the registry update?
```

### After Completing Work

```
□ Did I create COMPLETION.md from template?
□ Did I fill all mandatory sections?
□ Did I update FEATURES.md (move to Completed)?
□ Did I add commit hash and file count?
□ Did I update statistics?
□ Did I commit both files together?
□ Did I show summary to user?
```

---

## 🚨 Common Mistakes to Avoid

### ❌ WRONG: Forgetting to track

```
User: "Add budget control settings"
Claude: [implements feature]
Claude: [commits code]
Claude: "Done!"
❌ Forgot to update FEATURES.md
❌ No COMPLETION.md created
```

### ✅ CORRECT: Proper tracking

```
User: "Add budget control settings"
Claude: [reads FEATURES.md first]
Claude: [adds to Active section]
Claude: [commits FEATURES.md update]
Claude: [implements feature]
Claude: [creates COMPLETION.md]
Claude: [updates FEATURES.md to Completed]
Claude: [commits both files]
Claude: "Done! Summary: [shows COMPLETION.md summary]"
```

---

## 📊 Feature Categories

When adding to FEATURES.md, categorize under:

- **Inventory Module**
- **Budget Management**
- **PDF Templates**
- **Developer Tools**
- **Documentation**
- **Authentication/Authorization**
- **System/Infrastructure**
- **User Management**
- **Reports/Analytics**

---

## 🔗 File Locations

```
docs/features/FEATURES.md                    ← Registry (single source of truth)
docs/features/FEATURE_TRACKING_SYSTEM.md     ← System design
docs/features/COMPLETION_TEMPLATE.md         ← Template for completion reports
docs/features/[feature-name]/COMPLETION.md   ← Individual feature reports
.claude/rules/feature-tracking.md            ← This file (rules for Claude)
```

---

## 🎯 Success Metrics

A well-tracked feature has:

- ✅ Entry in FEATURES.md (Active → Completed)
- ✅ COMPLETION.md with all mandatory sections
- ✅ Commit hash recorded
- ✅ File count accurate
- ✅ Summary clear and concise
- ✅ Testing status documented
- ✅ Related commits listed

---

## 📝 Template Shortcuts

### Quick COMPLETION.md Creation

```bash
# Create from template
cp docs/features/COMPLETION_TEMPLATE.md docs/features/[name]/COMPLETION.md

# Edit with current commit hash
git log -1 --oneline | cut -d' ' -f1

# Count files changed
git diff HEAD~1 --stat | tail -1
```

### Quick FEATURES.md Update

```bash
# Get current date
date +%Y-%m-%d

# Get commit hash
git log -1 --oneline | cut -d' ' -f1

# Count files in last commit
git show --stat | grep "files changed" | awk '{print $1}'
```

---

## 🔮 Future Automation (Planned)

- [ ] Git hook to remind about FEATURES.md update
- [ ] CLI command: `pnpm run feature:start [name]`
- [ ] CLI command: `pnpm run feature:done [name]`
- [ ] Claude Skill: `/feature-start`, `/feature-done`, `/feature-list`
- [ ] Auto-generate COMPLETION.md from git commits

---

## ✅ Validation Before Commit

```bash
# Check FEATURES.md format
- [ ] All active features have start dates
- [ ] All completed features have commit hashes
- [ ] No duplicate feature names
- [ ] Statistics section updated
- [ ] Proper date format (YYYY-MM-DD)

# Check COMPLETION.md
- [ ] All mandatory sections filled
- [ ] File lists accurate
- [ ] Commit hash correct (8 chars)
- [ ] Testing status documented
- [ ] Summary is clear (2-3 sentences)
```

---

## 📞 Questions?

- **What is this?** → Read [FEATURE_TRACKING_SYSTEM.md](../../docs/features/FEATURE_TRACKING_SYSTEM.md)
- **How to use?** → Follow the workflows above
- **When to track?** → Features > 3 files or > 1 hour
- **What if I forget?** → Backfill from git log
- **Is this mandatory?** → YES for features, NO for tiny fixes

---

## 🎯 Remember

> **The goal is NOT perfect documentation.**
> **The goal is to NEVER FORGET what features were implemented.**
>
> FEATURES.md + COMPLETION.md = 2 files = 15-30 minutes
> This prevents hours of "what did we do?" later.

---

**Rules Version**: 1.0.0
**Last Updated**: 2025-12-20
**Compliance**: MANDATORY for all features
