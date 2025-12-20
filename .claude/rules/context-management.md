# Context Management Rules

> **🎯 CRITICAL: Prevent Claude from losing focus and reading unnecessary files**
>
> **Priority**: HIGHEST - Read this BEFORE starting any task

---

## 🚨 MANDATORY Reading Order

### Phase 1: Understanding (Target: < 5 min, < 10% tokens)

```
1. Read user's task description COMPLETELY
   - Understand WHAT they want
   - Understand WHY (if given)
   - Note any specific requirements

2. Read relevant .claude/rules/[domain].md ONLY
   - If inventory task → read inventory-domain.md
   - If budget task → read budget-domain.md
   - If API task → read api-endpoints.md
   - DON'T read all rules "just in case"

3. Check recent commits (last 2-3 only)
   - git log --oneline -3
   - Understand recent context

4. STOP - Checkpoint
   - Summarize understanding to yourself
   - If unsure → ASK USER immediately
   - If clear → Proceed to Phase 2
```

**NEVER**:

- ❌ Read entire codebase to "understand context"
- ❌ Explore "related" features
- ❌ Read documentation already in rules
- ❌ Check "maybe relevant" files

---

### Phase 2: Planning (Target: < 10 min, < 20% tokens)

```
1. Break task into subtasks (if > 3 steps)
   - Use TodoWrite IMMEDIATELY
   - List 3-10 specific subtasks
   - Each subtask = one concrete action

2. Identify files to change (estimate only)
   - Don't read yet!
   - Just list what you expect to modify
   - Max 10 files for simple tasks
   - Max 20 files for complex tasks

3. Check dependencies
   - What exists already?
   - What needs to be created?

4. STOP - Get User Approval
   - Show the plan
   - Ask: "Does this match your expectation?"
   - Wait for confirmation

5. Proceed ONLY if approved
```

**NEVER**:

- ❌ Start coding without plan
- ❌ Skip TodoWrite for multi-step tasks
- ❌ Assume you know what user wants
- ❌ Start reading files before planning

---

### Phase 3: Execution (Target: < 60% tokens total)

```
1. Work on ONE subtask at a time
   - Mark it in_progress in TodoWrite
   - Read ONLY files needed for THIS subtask
   - Complete it
   - Mark completed IMMEDIATELY

2. Read files strategically
   - Use grep/glob FIRST to find what you need
   - Read only relevant sections
   - Don't read "to understand better"

3. Make changes incrementally
   - Change one thing at a time
   - Test immediately
   - Move to next

4. Report progress (MANDATORY)
   - After every 3 subtasks
   - Or every 30 minutes
   - Show: completed, current, next

5. Token awareness
   - Check usage after each subtask
   - Alert yourself at 40%
   - STOP at 60% and summarize
```

**NEVER**:

- ❌ Read 10 files to find one piece of info
- ❌ Work silently for > 30 minutes
- ❌ Complete 5 subtasks without reporting
- ❌ Exceed 60% tokens without user knowledge

---

### Phase 4: Validation (Target: < 10% tokens)

```
1. Test changes
   - Run: pnpm run build (MANDATORY)
   - Check for errors
   - Fix if needed

2. Review what changed
   - git diff
   - Verify completeness

3. Create documentation (if needed)
   - /feature-done for features
   - Update FEATURES.md

4. Report completion
   - Summary of what was done
   - Files changed
   - Testing status
   - Next steps (if any)
```

---

## 📊 Token Budget Management

### Targets by Task Type

| Task Type            | Target Tokens | Max Tokens |
| -------------------- | ------------- | ---------- |
| Simple (< 3 files)   | 20-30%        | 40%        |
| Medium (3-10 files)  | 30-50%        | 60%        |
| Complex (> 10 files) | 50-70%        | 80%        |

### Checkpoints

```
At 40% tokens:
- Alert yourself: "Approaching half budget"
- Review if on track
- Proceed cautiously

At 50% tokens:
- MANDATORY checkpoint
- Summarize progress
- Ask user if should continue or pause

At 60% tokens:
- STOP and report
- "Token budget at 60% - should I continue or summarize?"
- Wait for user decision

At 70% tokens:
- STOP immediately
- Summarize what's done
- Save state
- Ask user to continue in new session
```

**NEVER exceed 80% without explicit user permission**

---

## 🎯 Focus Scope Definition

### Before Reading ANY File, Ask:

```
1. Is this file directly related to current subtask?
   YES → Proceed
   NO  → SKIP

2. Will reading this help complete current step?
   YES → Proceed
   NO  → SKIP

3. Is this exploratory/nice-to-know?
   YES → SKIP (maybe later if needed)
   NO  → Proceed

4. Am I reading because:
   - I need specific info? → Proceed
   - I'm curious? → SKIP
   - "Might be useful"? → SKIP
```

### Reading Limits

```
Simple Tasks (< 30 min):
- Max 5 files
- If need more → Ask why

Medium Tasks (30 min - 2 hours):
- Max 10 files
- If need more → Explain to user

Complex Tasks (> 2 hours):
- Max 20 files
- Beyond this → Break into phases
```

---

## 🚫 Anti-Patterns: NEVER Do These

### 1. ❌ Reading Everything

```
Bad:
- "Let me understand the codebase first"
- "I'll read related features for context"
- "Let me explore how this works"

Good:
- "I need the UserService for this task"
- "I'll grep for the exact function name"
- "Reading only the file mentioned in task"
```

### 2. ❌ Premature Exploration

```
Bad:
- Read 10 files before planning
- Explore architecture before task breakdown
- "Research" phase without clear goal

Good:
- Plan first, read later
- Read only what's needed for current subtask
- Targeted research with specific question
```

### 3. ❌ Silent Progress

```
Bad:
- Work for 1 hour without update
- Complete entire task then show result
- Use 50% tokens without user knowing

Good:
- Report every 30 minutes
- Show plan before starting
- Alert at token checkpoints
```

### 4. ❌ Scope Creep

```
Bad:
- "I noticed this could be improved too"
- "While I'm here, let me fix..."
- Add features not requested

Good:
- Do ONLY what was asked
- Note improvements separately
- Ask before expanding scope
```

---

## ✅ Decision Matrix: Read or Skip?

| Situation                     | Decision                  |
| ----------------------------- | ------------------------- |
| File mentioned in task        | ✅ READ                   |
| File I will modify            | ✅ READ                   |
| Direct import/dependency      | ✅ READ (section only)    |
| Related feature               | ❌ SKIP (unless needed)   |
| "Might be helpful"            | ❌ SKIP                   |
| Documentation in rules        | ❌ SKIP (already have it) |
| Historical context            | ❌ SKIP (unless required) |
| "Interesting" code            | ❌ SKIP                   |
| Entire service for one method | ❌ SKIP (grep first)      |

---

## 🔧 Tools for Focus

### Use These FIRST

```bash
# Find specific content (don't read entire files)
grep -r "functionName" apps/api/src/

# Find files by pattern
glob "**/*service.ts"

# Check what changed recently
git diff HEAD~1 --name-only

# Find specific class/function
grep -n "class UserService" apps/api/src/**/*.ts
```

### Read These SECOND

```bash
# Only after grep/glob shows you where to look
Read [specific-file] [specific-line-range]
```

---

## 📝 Self-Monitoring Checklist

Before starting task:

- [ ] Have I read the task description FULLY?
- [ ] Do I understand what's being asked?
- [ ] If unclear, have I ASKED?
- [ ] Have I identified relevant rules to read?
- [ ] Have I planned the approach?

During execution (every 3 subtasks):

- [ ] Am I still on the original task?
- [ ] Have I read < 10 files so far?
- [ ] Is my token usage reasonable?
- [ ] Have I reported progress?
- [ ] Am I solving what user asked?

Before showing result:

- [ ] Did I complete what was asked?
- [ ] Did I test the changes?
- [ ] Is documentation updated?
- [ ] Have I stayed within scope?

---

## 🎯 Success Metrics

### Good Session Looks Like:

```
Task: Add stock alert feature
- Read: 6 files
- Tokens: 35%
- Time: 1 hour
- Checkpoints: 3
- User satisfied: ✓
```

### Bad Session Looks Like:

```
Task: Add stock alert feature
- Read: 30 files
- Tokens: 75%
- Time: 3 hours
- Checkpoints: 0
- User: "This isn't what I asked for"
```

---

## 🚨 Red Flags: Stop Immediately If:

1. Token usage > 60% and task not complete
2. Read > 15 files for simple task
3. Working > 30 min without reporting
4. Unsure what user wants
5. Exploring "interesting" code
6. Adding unrequested features
7. Lost sight of original goal

**When red flag appears**: STOP, summarize, ask user

---

**Version**: 1.0.0
**Priority**: CRITICAL
**Compliance**: MANDATORY for all tasks
