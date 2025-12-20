# Feature Registry

> **🎯 Single source of truth สำหรับติดตาม features ทั้งหมด**
>
> **Last Updated**: 2025-12-20 13:15
> **System**: [Feature Tracking System](./FEATURE_TRACKING_SYSTEM.md)

---

## 🟢 Active (In Progress)

| Feature          | Started | Status | Files | Notes |
| ---------------- | ------- | ------ | ----- | ----- |
| _None currently_ | -       | -      | -     | -     |

---

## ✅ Completed (Last 30 Days)

| Feature                             | Completed  | Commit   | Files | Summary                                      |
| ----------------------------------- | ---------- | -------- | ----- | -------------------------------------------- |
| Documentation Cleanup               | 2025-12-20 | b72a6f6c | 7     | Removed duplicates, archived old docs        |
| Architecture Docs Update            | 2025-12-20 | 24dc1b3a | 16    | Updated to layer-based plugin pattern        |
| Budget Control Fields               | 2025-12-19 | ae8ad9aa | 8     | Added variance % to budget items             |
| PDF Hospital Inventory Templates    | 2025-12-19 | 4f1fc6ce | 12    | Added new templates, removed unused starters |
| Item Settings Modal Reactive Fields | 2025-12-19 | 1789d19e | 8     | Made variance fields reactive                |
| Modal Retry Mechanism               | 2025-12-19 | 512471e2 | 5     | Improved modal reliability with retries      |
| Budget Control Settings UI          | 2025-12-18 | bf6c5172 | 5     | Added settings panel to detail page          |
| Item Settings Modal Integration     | 2025-12-17 | bea26531 | 6     | Integrated modal into budget items list      |
| AegisX MCP API Contract Tools       | 2025-12-16 | 96ea49a4 | 8     | Added validation and discovery tools         |
| AegisX CLI Import Docs              | 2025-12-16 | f4a0955a | 4     | Enhanced import documentation                |

---

## 📋 Planned (Backlog)

| Feature                   | Priority | Complexity | Dependencies     | Notes                        |
| ------------------------- | -------- | ---------- | ---------------- | ---------------------------- |
| Stock Alerts System       | High     | Medium     | Inventory module | Need real-time notifications |
| Budget Variance Analytics | Medium   | High       | Budget module    | Requires reporting engine    |
| Import History Tracking   | Medium   | Low        | Import feature   | Add audit trail              |
| Multi-language Support    | Low      | High       | All modules      | i18n infrastructure needed   |

---

## 📚 Feature Categories

### Inventory Module

- ✅ Item Settings Modal (Completed: 2025-12-19)
- ✅ Budget Control Settings (Completed: 2025-12-18)
- 📋 Stock Alerts (Planned)

### Budget Management

- ✅ Budget Control Fields (Completed: 2025-12-19)
- ✅ Variance % Calculations (Completed: 2025-12-19)
- 📋 Variance Analytics (Planned)

### PDF Templates

- ✅ Hospital Inventory Templates (Completed: 2025-12-19)

### Developer Tools

- ✅ Architecture Documentation (Completed: 2025-12-20)
- ✅ AegisX MCP Tools (Completed: 2025-12-16)
- ✅ AegisX CLI Docs (Completed: 2025-12-16)

### Documentation

- ✅ Cleanup & Archiving (Completed: 2025-12-20)
- ✅ Layer-based Architecture (Completed: 2025-12-20)

---

## 📊 Statistics (Last 30 Days)

- **Total Features Completed**: 10
- **Total Files Changed**: ~90
- **Active Features**: 0
- **Planned Features**: 4
- **Average Completion Time**: 1-2 days per feature

---

## 🔄 Update Instructions for Claude

### When Starting a Feature

```markdown
1. Read this file (FEATURES.md)
2. Add feature to "🟢 Active" section:
   - Feature name
   - Started date (YYYY-MM-DD)
   - Status (e.g., "10%", "Planning", "Backend done")
   - Estimated files count
   - Brief notes
3. Commit this file:
   git add docs/features/FEATURES.md
   git commit -m "docs(features): start tracking [feature-name]"
```

### When Completing a Feature

```markdown
1. Create COMPLETION.md in feature directory
2. Move feature from "Active" to "Completed":
   - Add completion date
   - Add commit hash (git log -1 --oneline)
   - Add actual files changed count
   - Add summary (1 sentence)
3. Update statistics
4. Commit both files:
   git add docs/features/FEATURES.md docs/features/[name]/COMPLETION.md
   git commit -m "docs(features): complete [feature-name]"
```

### When Adding to Backlog

```markdown
1. Add to "📋 Planned" section
2. Specify priority (High/Medium/Low)
3. Estimate complexity (High/Medium/Low)
4. Note dependencies
5. Commit this file
```

---

## 🗂️ Archive Policy

Features older than 90 days are moved to:

- `docs/archive/YYYY-QX/features/`

**Last Archive**: Not yet performed
**Next Archive**: 2025-03-20 (90 days from now)

---

## 📝 Notes

- **Minimum feature tracking**: Changes affecting > 3 files or > 1 hour work
- **Bug fixes**: Only track if significant (> 5 files or architectural changes)
- **Documentation updates**: Track if major rewrites (> 10 files)
- **Dependencies**: Always note what feature depends on or blocks

---

## 🔗 Related Documentation

- [Feature Tracking System](./FEATURE_TRACKING_SYSTEM.md) - Complete system design
- [Feature Templates](./templates/) - Documentation templates
- [Completion Report Template](./COMPLETION_TEMPLATE.md) - Template for COMPLETION.md

---

## 📞 Maintenance

**Owner**: Claude Code (AI Assistant)
**Review Frequency**: After each feature completion
**Cleanup**: Monthly (move to archive)
**Format**: Markdown table (for readability)

---

## ✅ Validation Checklist

Before committing updates to this file:

- [ ] All active features have start dates
- [ ] All completed features have commit hashes
- [ ] Statistics are updated
- [ ] No duplicate entries
- [ ] Proper date format (YYYY-MM-DD)
- [ ] Proper commit hash format (8 chars)
