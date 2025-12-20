# Task Structure & Progress Management

> **🎯 MANDATORY: Structure all tasks properly with checkpoints and validation**
>
> **Purpose**: Ensure visibility, prevent scope creep, enable recovery

---

## 🔄 Universal Task Workflow

```
User Request
    ↓
[UNDERSTAND] → Ask if unclear
    ↓
[PLAN] → TodoWrite if > 3 steps
    ↓
[APPROVE] → Get user confirmation
    ↓
[EXECUTE] → Work with checkpoints
    ↓
[VALIDATE] → Test & review
    ↓
[REPORT] → Summary & next steps
```

**NEVER skip any phase!**

---

## Phase 1: UNDERSTAND (MANDATORY)

### What to Do

```
1. Read task description completely
2. Identify:
   - What user wants (the goal)
   - Why they want it (if given)
   - Any specific requirements
   - Success criteria

3. Check if unclear:
   - Ambiguous requirements
   - Multiple valid approaches
   - Missing information
   - Assumptions needed

4. If unclear → ASK immediately
   - Don't proceed with assumptions
   - Use AskUserQuestion tool
   - Get clarification

5. If clear → Confirm understanding
   - "I understand you want [X] to achieve [Y]"
   - Proceed to PLAN phase
```

### Examples

```
✅ GOOD:
User: "Add stock alerts"
Claude: "I need clarification:
        - Alerts for what conditions? (min/max stock)
        - Who gets notified? (users/admins)
        - Notification method? (email/in-app)"

❌ BAD:
User: "Add stock alerts"
Claude: [Assumes email alerts, starts coding]
```

---

## Phase 2: PLAN (MANDATORY for > 3 steps)

### When to Use TodoWrite

```
MANDATORY if task requires:
- > 3 steps
- > 30 minutes estimated
- Multiple files
- Multiple domains (backend + frontend)
- Database changes
- Multiple phases
```

### How to Plan

```
1. Break down into subtasks (3-10 items)
   - Each subtask = one concrete action
   - Each subtask = 10-30 minutes
   - Each subtask = testable outcome

2. Order by dependency
   - Database first
   - Backend second
   - Frontend third
   - Testing last

3. Use TodoWrite
   - Clear, actionable titles
   - Both content and activeForm
   - All start as "pending"

4. Show to user
   - "Here's my plan: [list subtasks]"
   - "Does this match your expectation?"
   - Wait for approval

5. Proceed only if approved
```

### Template

```markdown
User: "Add stock alert settings"

Claude: "I'll break this down:

Using TodoWrite:

1. Create database migration for alert_settings table
2. Create TypeBox schema for AlertSettings
3. Create API endpoint POST /api/alerts/settings
4. Create backend service & repository
5. Create frontend SettingsModal component
6. Create frontend service integration
7. Test API endpoints
8. Test UI functionality
9. Update documentation

Estimated time: ~2 hours
Does this plan look good?"

[Wait for user approval before proceeding]
```

---

## Phase 3: APPROVE (MANDATORY)

### Get User Confirmation

```
ALWAYS show plan and get approval for:
- Multi-step tasks (> 3 steps)
- Complex changes (> 10 files)
- Architectural decisions
- Breaking changes
- New patterns

Format:
"Here's my plan:
[show TodoWrite items or list]

Estimated:
- Time: X hours
- Files: Y files
- Impact: [scope description]

Proceed? (yes/no)"
```

### Don't Assume

```
❌ BAD:
Claude: [Creates 10-step plan internally]
        [Starts working without showing plan]
        [User sees result 2 hours later]
        User: "This isn't what I wanted"

✅ GOOD:
Claude: [Creates plan]
        [Shows to user via TodoWrite]
        [Gets confirmation]
        [Executes approved plan]
        User: "Perfect, that's exactly it"
```

---

## Phase 4: EXECUTE (with Checkpoints)

### Execution Rules

```
1. Work on ONE subtask at a time
   - Mark as "in_progress" in TodoWrite
   - Read only files needed for THIS task
   - Complete it fully
   - Test it works
   - Mark as "completed" IMMEDIATELY

2. Don't batch completions
   ❌ BAD: Complete 5 tasks, mark all done together
   ✅ GOOD: Complete task 1, mark done, task 2, mark done, ...

3. Report progress regularly
   - After every 3 subtasks
   - Or every 30 minutes
   - Or at natural breakpoints

4. Handle blockers immediately
   - If stuck → Mark current task as blocked
   - Don't silently struggle
   - Report issue to user
   - Get help or pivot
```

### Progress Report Format

```
After every 3 subtasks:

"Progress Update:
✅ Completed: [subtasks 1, 2, 3]
🚧 Current: Working on [subtask 4]
📊 Overall: [4/10 complete - 40%]
⏱️ Time: ~30 minutes elapsed
🎯 Next: [subtasks 5, 6]

On track to complete in ~1 hour more."
```

---

## Phase 5: VALIDATE (MANDATORY)

### Before Showing Results

```
1. Run build
   - pnpm run build
   - MUST pass
   - Fix errors if any

2. Test functionality
   - Manual test (try it works)
   - API test (curl if backend)
   - Build test (compilation)

3. Review changes
   - git diff
   - Check all files modified
   - Verify nothing unintended

4. Check completeness
   - All subtasks done?
   - Original goal achieved?
   - Edge cases considered?

5. Update documentation
   - If feature → /feature-done
   - If spec → log implementation
   - If complex → add notes
```

### Quality Gate

```
Don't show results until:
- [ ] Build passes
- [ ] Functionality tested
- [ ] All subtasks completed
- [ ] Documentation updated
- [ ] No known issues

If blocked:
- Report blocker
- Show what's completed
- Explain what's missing
- Ask for help
```

---

## Phase 6: REPORT (MANDATORY)

### Completion Report Format

```
"✅ Task Completed!

Summary:
- [Brief description of what was done]

Changes:
- Created: [X files]
- Modified: [Y files]
- Deleted: [Z files]

Testing:
- Build: PASSED
- Manual test: [result]
- [Other tests]

Documentation:
- [What was updated]

Commit: [hash]

Next steps: [if any]"
```

---

## 🎯 Task Size Guidelines

### Tiny Task (< 5 min)

```
Example: Fix typo, small bug fix

Workflow:
1. Understand → Fix → Test → Report
2. No TodoWrite needed
3. Minimal planning
```

### Small Task (5-30 min)

```
Example: Add validation, update component

Workflow:
1. Understand → Quick plan (mental or list) → Execute → Validate → Report
2. TodoWrite optional (but recommended for > 3 steps)
3. Report completion
```

### Medium Task (30 min - 2 hours)

```
Example: Add feature, CRUD module

Workflow:
1. Understand → Plan (TodoWrite MANDATORY) → Approve → Execute (with checkpoints) → Validate → Report
2. Progress reports every 30 min
3. Full validation
```

### Large Task (> 2 hours)

```
Example: Major feature, refactoring

Workflow:
1. Understand → Plan phases → Approve → Execute phase by phase → Validate each → Report
2. Break into phases (each phase < 2 hours)
3. Get approval for each phase
4. Checkpoint between phases
```

---

## 🚨 Red Flags: Task Going Wrong

### Warning Signs

```
1. Working > 30 min without progress report
   → STOP, report progress

2. Completed > 5 subtasks without marking
   → STOP, update TodoWrite

3. Task expanding beyond original scope
   → STOP, get new approval

4. Stuck on subtask > 15 minutes
   → STOP, report blocker

5. Token usage > 50% and not halfway done
   → STOP, checkpoint

6. Lost track of what user originally asked
   → STOP, re-read task, refocus

7. Building "better" solution than requested
   → STOP, do what was asked
```

### Recovery Actions

```
When red flag appears:
1. STOP current work
2. Summarize state
3. Report to user
4. Get direction
5. Resume or pivot
```

---

## 📊 Checkpoint Frequency

### By Task Duration

| Duration        | Checkpoints                |
| --------------- | -------------------------- |
| < 30 min        | Start + End                |
| 30 min - 1 hour | Start + Mid + End          |
| 1-2 hours       | Start + Every 30 min + End |
| > 2 hours       | Start + Every phase + End  |

### By Subtask Count

| Subtasks | Checkpoints                  |
| -------- | ---------------------------- |
| 1-3      | End only                     |
| 4-6      | Mid + End                    |
| 7-9      | Every 3 tasks                |
| 10+      | Every 3 tasks + phase breaks |

### By Complexity

| Complexity | Checkpoints                          |
| ---------- | ------------------------------------ |
| Simple     | Minimal                              |
| Medium     | Every 30 min                         |
| Complex    | Every 20 min + validation gates      |
| Critical   | Every 10 min + continuous validation |

---

## ✅ Examples

### Example 1: Simple Task

```
User: "Fix the typo in README"

Claude:
1. [UNDERSTAND] Read task - clear and simple
2. [PLAN] Mental: Find typo, fix, commit
3. [EXECUTE] Fix typo
4. [VALIDATE] Re-read, check spelling
5. [REPORT] "Fixed typo in README line 42: 'teh' → 'the'"

Time: 2 minutes
TodoWrite: No (too simple)
```

### Example 2: Medium Task

```
User: "Add stock alert settings modal"

Claude:
1. [UNDERSTAND] "Stock alert settings - need modal for configuration"

2. [PLAN] Using TodoWrite:
   ✅ Create AlertSettings schema
   ✅ Create API endpoint
   ✅ Create modal component
   ✅ Integrate with detail page
   ✅ Test functionality

3. [APPROVE] "Plan above - proceed? (yes)"
   User: "yes"

4. [EXECUTE]
   - Complete task 1 → Report
   - Complete task 2 → Report
   - Complete task 3 → Report (checkpoint!)
   - Complete task 4 → Report
   - Complete task 5 → Report

5. [VALIDATE]
   - Build: PASSED
   - Manual test: Works
   - Documentation: Created

6. [REPORT] Full summary with files changed

Time: 1.5 hours
Checkpoints: 2 (after task 3, at end)
```

### Example 3: Large Task

```
User: "Implement complete inventory management system"

Claude:
1. [UNDERSTAND] "Large task - need to break into phases"

2. [PLAN] "This is a multi-day task. Let me break into phases:

   Phase 1: Database & Backend (Day 1)
   Phase 2: Frontend Components (Day 2)
   Phase 3: Integration & Testing (Day 3)

   Should I proceed with Phase 1 first?"

3. [APPROVE] Get phase-by-phase approval

4. [EXECUTE] Phase 1 only
   [Complete Phase 1]

5. [VALIDATE] Phase 1

6. [REPORT] Phase 1 completion
   "Phase 1 done. Ready for Phase 2?"

[Repeat 4-6 for each phase]
```

---

## 🔧 Tools & Commands

### TodoWrite Usage

```typescript
// Start of task (> 3 steps)
TodoWrite([
  { content: 'Task 1', status: 'pending', activeForm: 'Doing task 1' },
  { content: 'Task 2', status: 'pending', activeForm: 'Doing task 2' },
  // ...
]);

// Mark first task in progress
TodoWrite([
  { content: 'Task 1', status: 'in_progress', activeForm: 'Doing task 1' },
  { content: 'Task 2', status: 'pending', activeForm: 'Doing task 2' },
]);

// Complete and move to next
TodoWrite([
  { content: 'Task 1', status: 'completed', activeForm: 'Doing task 1' },
  { content: 'Task 2', status: 'in_progress', activeForm: 'Doing task 2' },
]);
```

---

## 📝 Self-Check Before Starting

```
- [ ] Have I fully understood the task?
- [ ] If unsure, have I asked for clarification?
- [ ] Is this a multi-step task (> 3 steps)?
- [ ] If yes, have I created TodoWrite plan?
- [ ] Have I shown the plan to user?
- [ ] Has user approved the plan?
- [ ] Do I know my checkpoint frequency?
- [ ] Am I ready to report progress regularly?
```

---

**Version**: 1.0.0
**Compliance**: MANDATORY
**Priority**: CRITICAL
