# /feature-done - Auto-Generate Feature Documentation

> **🤖 Fully automatic - Claude reads code and generates everything!**
>
> **No questions asked. No manual input needed.**

---

## 📋 Usage

```bash
User: /feature-done [feature-name]
```

**Examples**:

```bash
User: /feature-done budget-control-settings
User: /feature-done stock-alerts
User: /feature-done item-settings-modal
```

**That's it!** Claude will automatically:

1. 🔍 Read last commits
2. 📖 Analyze changed files
3. 🧠 Read actual code
4. ✍️ Generate COMPLETION.md
5. 📊 Update FEATURES.md
6. 💾 Commit

**Zero questions. Zero manual input.**

---

## 🤖 What Claude Auto-Detects

### From Git (Automatic)

```
✅ Commit hash (last commit)
✅ Commit messages (context)
✅ Files created/modified/deleted
✅ Lines added/removed
✅ Commit date & author
```

### From Code (Reads & Analyzes)

```
✅ API endpoints (reads *.route.ts)
✅ Components (reads *.component.ts)
✅ Services (reads *.service.ts)
✅ Database changes (reads migrations)
✅ Signals usage
✅ AegisX UI components
✅ TypeBox schemas
```

### From File Paths (Intelligence)

```
✅ Category detection:
   /inventory/budget/ → Budget Management
   /inventory/ → Inventory
   /core/auth/ → Authentication
   /layers/platform/ → System
```

### From Build (Testing)

```
✅ Runs: pnpm run build
✅ Reports: PASS/FAIL
```

---

## ⚡ Example Run

```
User: /feature-done budget-settings

Claude:
  🔍 Analyzing commits...
     → bf6c5172 "feat(inventory): add budget control settings"

  📁 Reading files...
     → Created: 2 files
     → Modified: 3 files

  🧠 Reading code...
     → Component: BudgetControlSettingsPanel
     → Uses: ax-card, ax-form-field, ax-button
     → Signals: settingsSignal, loadingSignal

  📊 Detecting category...
     → Path: .../inventory/budget/...
     → Category: Budget Management ✓

  📝 Generating summary from commits + code...
     → "Budget control settings panel with variance thresholds"

  🧪 Testing build...
     → pnpm run build: PASSED ✓

  ✍️ Creating COMPLETION.md... ✓
  📊 Updating FEATURES.md... ✓
  💾 Committing... ✓

  ✅ Done! (30 seconds)

  **Budget Control Settings**
  - Category: Budget Management
  - Files: 5 (2 created, 3 modified)
  - Commit: bf6c5172
  - Build: PASSED

  Docs: docs/features/budget-control-settings/COMPLETION.md
```

---

## 📝 Generated Documentation

Claude generates **complete COMPLETION.md** automatically:

- ✅ Summary (from commits + code analysis)
- ✅ Backend details (reads route/service files)
- ✅ Frontend details (reads components)
- ✅ Database changes (reads migrations)
- ✅ Files changed (from git)
- ✅ Testing status (runs build)
- ✅ All metadata (commit, date, category)

**No manual filling required!**

---

## 💡 What User Needs to Do

### Before /feature-done

```bash
# 1. Implement feature
# 2. Test it works
# 3. Commit code
git add [files]
git commit -m "feat: my feature"

# 4. Build must pass
pnpm run build  # MUST be successful

# Done! Ready for documentation
```

### Run Command

```bash
User: /feature-done my-feature
```

### After (Optional)

```bash
# Review generated docs (optional)
cat docs/features/my-feature/COMPLETION.md

# Edit if needed (rare)
vim docs/features/my-feature/COMPLETION.md
git commit --amend
```

---

## ✅ Advantages

| Old (Manual)        | New (Automatic)   |
| ------------------- | ----------------- |
| User fills template | Claude reads code |
| 10+ questions       | 0 questions       |
| 15-30 minutes       | 30 seconds        |
| Error-prone         | Accurate          |
| Boring              | Effortless        |

---

## 🎯 Pro Tips

### 1. Write Good Commit Messages

```bash
# ✅ GOOD: Claude generates better summary
git commit -m "feat(inventory): add stock alert settings with email config"

# ❌ OK but less context
git commit -m "add settings"
```

### 2. Ensure Build Passes

```bash
# Before /feature-done
pnpm run build
# MUST show success
```

### 3. Clean Git State

```bash
# Check status
git status
# Should show: "nothing to commit, working tree clean"
```

---

## 🚀 Advanced

### Dry Run (Preview)

```bash
User: /feature-done my-feature --dry-run

# Claude shows preview, asks for confirmation
```

### Force Category

```bash
User: /feature-done my-feature --category "Custom Category"
```

---

## ❓ FAQ

### Q: ถ้า Claude detect ผิด?

A: แก้ COMPLETION.md ได้เลย (น้อยมาก ที่ผิด)

### Q: ต้องเตรียมอะไรบ้าง?

A: แค่ commit code + build ผ่าน

### Q: เวลานานไหม?

A: 30-60 วินาที

### Q: ถ้ามีหลาย commits?

A: Claude analyze ทั้งหมด ใช้ commit ล่าสุด

---

**Version**: 2.0.0 (Fully Automatic)
**Zero Manual Input Required**
