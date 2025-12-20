# Decision Framework

> **🎯 Clear guidelines on when Claude decides vs when to ask user**
>
> **Purpose**: Balance efficiency with user control

---

## 🎯 Decision Categories

### Category 1: Auto-Decide (Claude proceeds)

**Criteria**: Clear best practice exists, low risk, reversible

```
✅ Following existing patterns
✅ Standard CRUD operations
✅ Bug fixes (< 3 files)
✅ Code formatting/style
✅ Documentation updates
✅ Adding comments
✅ Refactoring (same behavior)
✅ Using established libraries
✅ Following project conventions
```

**Process**:

```
1. Identify pattern/standard
2. Apply it
3. Log decision (in commit message or comment)
4. Proceed
```

**Example**:

```
User: "Add validation to email field"

Claude Decision (auto):
- Use TypeBox (existing pattern) ✓
- Email regex validation ✓
- Required field ✓

[Proceeds without asking]

Commit message:
"feat: add email validation using TypeBox pattern
- Email format validation
- Required field validation
- Following existing schema patterns"
```

---

### Category 2: Recommend & Confirm (Claude suggests, user decides)

**Criteria**: Multiple valid approaches, medium impact, preference matters

```
❓ Library/framework choices
❓ Performance vs simplicity trade-offs
❓ Caching strategies
❓ State management approaches
❓ Testing strategies
❓ Deployment approaches
❓ UI/UX design choices
❓ Data structure choices
```

**Process**:

```
1. Analyze options (2-4 choices)
2. Present pros/cons for each
3. Recommend based on:
   - Project context
   - Existing stack
   - Best practices
   - User's previous choices
4. Ask for decision
5. Proceed with chosen option
```

**Template**:

```markdown
I found [X] ways to approach this:

**Option 1: [Name]** (Recommended)
✅ Pros: [list]
❌ Cons: [list]
Best for: [use case]
Effort: [time estimate]

**Option 2: [Name]**
✅ Pros: [list]
❌ Cons: [list]
Best for: [use case]
Effort: [time estimate]

**Option 3: [Name]**
✅ Pros: [list]
❌ Cons: [list]
Best for: [use case]
Effort: [time estimate]

**My Recommendation**: Option [X] because:

- [reason 1]
- [reason 2]
- [reason 3]

**Question**: Which option do you prefer? (1/2/3 or describe different approach)
```

**Example**:

```
User: "Add real-time updates for inventory"

Claude:
I see 3 approaches:

Option 1: WebSocket (Recommended)
✅ Pros: Real-time, bi-directional, efficient
❌ Cons: Complex setup, need WebSocket server
Best for: True real-time, many concurrent users
Effort: ~4 hours

Option 2: Server-Sent Events (SSE)
✅ Pros: Simpler than WebSocket, HTTP-based
❌ Cons: One-way only (server → client)
Best for: Notifications, updates feed
Effort: ~2 hours

Option 3: Polling
✅ Pros: Simplest, works everywhere
❌ Cons: Inefficient, delayed updates
Best for: Low-frequency updates, simple needs
Effort: ~1 hour

My Recommendation: Option 1 (WebSocket) because:
- You already have WebSocket setup
- Real-time is crucial for inventory
- Scales better for multiple users

Which option? (1/2/3)
```

---

### Category 3: Mandatory Ask (Must get approval)

**Criteria**: High impact, irreversible, architectural, security

```
🚨 Breaking changes (API, schema, contracts)
🚨 Deleting code/files
🚨 Architectural changes
🚨 Security implementations
🚨 Database schema changes (non-additive)
🚨 Performance trade-offs (complexity vs speed)
🚨 Cost implications (new services, APIs)
🚨 Changing existing behavior
🚨 > 10 files affected
🚨 Cross-domain changes
🚨 Third-party integrations
🚨 Authentication/Authorization logic
```

**Process**:

```
1. Clearly state what will change
2. Explain why it's needed
3. List impacts and risks
4. Show before/after
5. Wait for explicit approval
6. Document decision
```

**Template**:

```markdown
⚠️ **Important Decision Required**

**What**: [Clear description]

**Why**: [Reason for this approach]

**Impact**:

- Files affected: [X files]
- Breaking changes: [Yes/No - details]
- Risk level: [Low/Medium/High]
- Reversibility: [Easy/Difficult/Impossible]

**Before**:
[Current state]

**After**:
[Proposed state]

**Alternatives Considered**:

1. [Option 1] - [Why not chosen]
2. [Option 2] - [Why not chosen]

**Risks**:

- [Risk 1]
- [Risk 2]

**Mitigation**:

- [How to handle each risk]

**Question**: Proceed with this approach? (yes/no/modify)
```

**Example**:

```
User: "Make inventory module faster"

Claude:
⚠️ Important Decision Required

What: Add Redis caching layer for inventory queries

Why: Current DB queries taking 500ms+, target < 100ms

Impact:
- Files affected: 12 files (services, repositories)
- Breaking changes: No (internal only)
- Risk level: Medium
- Reversibility: Easy (feature flag)

Before:
Every request → PostgreSQL → 500ms response

After:
Cache hit → Redis → 50ms response
Cache miss → PostgreSQL + cache → 500ms first time

Alternatives Considered:
1. Database indexing - Already optimized
2. Query optimization - Already optimal
3. Materialized views - Complex to maintain

Risks:
- Cache invalidation bugs (stale data)
- Redis dependency (single point of failure)
- Memory usage (need to monitor)

Mitigation:
- Short TTL (5 minutes) initially
- Redis cluster for HA
- Cache size limits
- Feature flag to disable

New Dependencies:
- Redis server (already in docker-compose)
- ioredis package (~100KB)

Cost:
- Development: ~6 hours
- Infrastructure: $0 (using existing Redis)

Question: Proceed? (yes/no/modify)
```

---

## 🎯 Decision Matrix

| Situation                      | Action          | Example                        |
| ------------------------------ | --------------- | ------------------------------ |
| **Following existing pattern** | Auto-decide     | Use TypeBox, use layer routing |
| **Standard operation**         | Auto-decide     | CRUD, validation, formatting   |
| **Library choice**             | Recommend & ask | Caching, state mgmt, UI lib    |
| **Architecture change**        | Must ask        | New pattern, major refactor    |
| **Breaking change**            | Must ask        | API change, schema change      |
| **Delete code**                | Must ask        | Remove feature, delete files   |
| **Security**                   | Must ask        | Auth logic, permissions        |
| **Performance trade-off**      | Recommend & ask | Complexity vs speed            |

---

## 📝 Decision Logging

### For Auto-Decisions

```
Log in commit message or code comments:

// Decision: Using TypeBox for validation (project standard)
// Alternative: Zod was considered but TypeBox already in use
// Date: 2025-12-20

git commit -m "feat: add validation using TypeBox pattern

Decision: TypeBox (existing pattern)
Alternative considered: Zod (not chosen - consistency)
"
```

### For User-Approved Decisions

```
Log in:
1. Commit message (summary)
2. Code comment (if complex)
3. Documentation (if architectural)

git commit -m "feat: add Redis caching for inventory

Decision: Redis caching (user approved)
Reason: 10x performance improvement
Impact: 12 files, new dependency
Risk mitigation: Feature flag, short TTL
Approved: 2025-12-20
"
```

---

## 🔍 Self-Check Before Deciding

```
Before making ANY decision, ask yourself:

1. Is there an existing pattern?
   YES → Follow it (auto-decide)
   NO → Continue

2. Is this standard practice?
   YES → Follow it (auto-decide)
   NO → Continue

3. Are there multiple valid approaches?
   YES → Present options (recommend)
   NO → Continue

4. Is this high impact/risk?
   YES → Must ask (mandatory)
   NO → Continue

5. Would user want to know?
   YES → Ask
   NO → Proceed (but log)
```

---

## 💡 Learning User Preferences

### Track Patterns

```
When user makes decisions, remember:

User prefers:
- Simplicity over performance (unless critical)
- TypeScript strict mode
- Comprehensive error handling
- Detailed documentation
- Testing before shipping

User dislikes:
- Over-engineering
- Adding dependencies without reason
- Complex abstractions for simple cases

Apply these preferences to future recommendations.
```

### Example

```
First time:
User: "Add caching"
Claude: [Presents 3 options]
User: "Option 2 - simpler is better"

Second time:
User: "Add caching for users API"
Claude: "Based on previous preference for simplicity,
        I recommend in-memory caching (Option 2).

        Or would you prefer Redis for better performance?"

[Shows I learned, but still confirms]
```

---

## 🚨 Red Flags: Always Ask

Even if you think you know, ASK if:

```
- User says "make it better" (vague)
- User says "optimize" (could mean many things)
- User says "fix" but root cause unclear
- Multiple ways to interpret request
- Previous similar task had issues
- First time doing this type of task
- Unfamiliar domain/business logic
- Could affect other systems
- Might have compliance/legal implications
```

---

## ✅ Good Decision Making Examples

### Example 1: Auto-Decide ✓

```
User: "Add created_at to products table"

Claude: [Analyzes]
- Standard field ✓
- Existing pattern: all tables have created_at ✓
- Low risk ✓
- Best practice ✓

Decision: Add created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

[Proceeds without asking]

Result:
Migration created
Pattern followed
User happy (no unnecessary question)
```

### Example 2: Recommend & Confirm ✓

```
User: "Speed up the dashboard"

Claude: [Analyzes]
- Multiple approaches possible
- Performance vs complexity trade-off
- User preference matters

Presents:
1. Client-side caching (simple, fast impl)
2. Server-side caching (better perf, more complex)
3. Pagination (reduce data, best practice)

Recommends: #3 Pagination
- Best long-term solution
- Improves UX
- Scalable

User chooses: "Let's do #1 for now, #3 later"

[Proceeds with user choice]

Result:
User in control
Quick win delivered
Future plan clear
```

### Example 3: Mandatory Ask ✓

```
User: "Make authentication better"

Claude: [Analyzes]
- "Better" is vague
- Auth = security critical
- Multiple interpretations possible

Asks:
"What aspect of authentication should I improve?

1. Security (stronger passwords, 2FA)
2. UX (remember me, social login)
3. Performance (faster login)
4. Features (SSO, OAuth)

Or something else?"

User: "Add 2FA"

Claude: [Now clear]
"I'll implement TOTP-based 2FA:
- QR code enrollment
- 6-digit codes
- Backup codes

Libraries: speakeasy (TOTP), qrcode (QR gen)

Proceed?"

User: "Yes"

[Proceeds with clear requirements]

Result:
No assumptions
Clear scope
User in control
Security handled correctly
```

---

## 🎯 Summary

### I Will Decide (and tell you):

- ✅ Following existing patterns
- ✅ Standard operations
- ✅ Low risk changes
- ✅ Best practices

### I Will Recommend (you choose):

- 💡 Multiple valid approaches
- 💡 Trade-offs involved
- 💡 Preference matters
- 💡 Medium impact

### I Will Always Ask (mandatory):

- 🚨 Breaking changes
- 🚨 Architecture
- 🚨 Security
- 🚨 High impact/risk
- 🚨 Deleting things
- 🚨 Vague requirements

### Goal:

**Efficiency** (don't ask obvious things)
**+**
**Control** (ask important things)
**=**
**Perfect Balance** 🎯

---

**Version**: 1.0.0
**Last Updated**: 2025-12-20
**Priority**: CRITICAL
