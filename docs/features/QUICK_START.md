# Feature Tracking - Quick Start Guide

> **🚀 เริ่มใช้งาน Feature Tracking ใน 5 นาที**

---

## 🎯 สำหรับงานง่ายๆ (ไม่ใช้ spec)

### Workflow 3 ขั้นตอน

```bash
# 1. ทำ feature ให้เสร็จ + commit code
git add [files]
git commit -m "feat: implement my-feature"

# 2. สั่ง Claude document feature
User: /feature-done [feature-name]

# 3. Done! ✅
```

---

## 📋 ตัวอย่างจริง

### Scenario: เพิ่ง implement "Stock Alert Settings"

```bash
# Step 1: Code เสร็จแล้ว
git add apps/api/src/layers/domains/inventory/alerts/settings.route.ts
git add apps/web/src/app/features/inventory/alerts/settings-modal.component.ts
git commit -m "feat(inventory): add stock alert settings modal"

# Step 2: สร้าง documentation
User: /feature-done stock-alert-settings

# Claude จะถาม:
Claude: What category is this feature?
        1. Inventory
        2. Budget Management
        3. Authentication
        4. System

User: 1

Claude: Great! What was implemented? (2-3 sentences)

User: Stock alert settings modal with min/max thresholds.
      Includes email notification configuration and alert history.

Claude: ✅ Created COMPLETION.md
        ✅ Updated FEATURES.md
        ✅ Committed (abc123de)

        Done!

# Step 3: ตรวจสอบ
cat docs/features/FEATURES.md
# → เห็น Stock Alert Settings ใน Completed section

cat docs/features/stock-alert-settings/COMPLETION.md
# → เห็นเอกสารครบถ้วน
```

---

## 📝 Manual Workflow (ถ้าไม่ใช้ /feature-done)

### 5 ขั้นตอน

```bash
# 1. Copy template
cp docs/features/COMPLETION_TEMPLATE.md \
   docs/features/stock-alert-settings/COMPLETION.md

# 2. Get commit hash
git log -1 --oneline
# → abc123de feat(inventory): add stock alert settings

# 3. Edit COMPLETION.md
# ใส่:
# - ชื่อ feature: Stock Alert Settings
# - Commit: abc123de
# - Summary: Modal with min/max thresholds
# - Files changed: [list them]
# - Testing: Manual test passed, build OK

# 4. Update FEATURES.md
# เพิ่มใน "✅ Completed" section:
| Stock Alert Settings | 2025-12-20 | abc123de | 5 | Modal with thresholds |

# 5. Commit
git add docs/features/stock-alert-settings/COMPLETION.md
git add docs/features/FEATURES.md
git commit -m "docs(features): complete stock-alert-settings"
```

---

## 🎯 คำสั่งที่ใช้บ่อย

### ดู Features ทั้งหมด

```bash
cat docs/features/FEATURES.md
```

### ดูรายละเอียด Feature

```bash
cat docs/features/[feature-name]/COMPLETION.md
```

### ค้นหา Feature

```bash
# หา features ทั้งหมดที่ complete ในเดือนนี้
grep "2025-12" docs/features/FEATURES.md

# หา API endpoint
grep -r "GET /api/inventory" docs/features/

# หา component
grep -r "SettingsModal" docs/features/
```

---

## ✅ Checklist ก่อนใช้ /feature-done

- [ ] Code committed แล้ว (git status clean)
- [ ] Build ผ่าน (pnpm run build)
- [ ] Test แล้ว (manual/automated)
- [ ] รู้ว่าแก้ไขไฟล์อะไรบ้าง
- [ ] Feature เสร็จแล้ว 100%

---

## ❓ FAQ

### Q: Feature ยังไม่เสร็จ ทำ document ได้ไหม?

A: **ไม่ได้!** ต้องเสร็จ 100% ก่อน
ถ้ายังไม่เสร็จ → ใส่ใน "🟢 Active" section ของ FEATURES.md

### Q: Feature มีหลาย commits ทำยังไง?

A: ใช้ commit hash ของ commit สุดท้าย

```bash
git log -1 --oneline  # Get last commit
```

### Q: ถ้าลืม document ทำยังไง?

A: Document ทีหลังได้ (backfill)

```bash
# ดู commit history
git log --oneline --since="7 days ago"

# เลือก feature ที่ลืม
/feature-done [feature-name]
```

### Q: Bug fix ต้อง document ไหม?

A: ดูที่ขนาด:

- < 3 files → ไม่ต้อง (แค่ commit message ดีๆ)
- > 3 files → ควร document

### Q: /feature-done vs Manual ต่างกันยังไง?

A:

- `/feature-done` → Claude ทำให้ (interactive, ง่าย)
- Manual → ทำเอง (full control, เร็ว ถ้าชำนาญ)

---

## 🔗 เอกสารเพิ่มเติม

- [Feature Tracking System](./FEATURE_TRACKING_SYSTEM.md) - System ทั้งหมด
- [COMPLETION Template](./COMPLETION_TEMPLATE.md) - Template เปล่า
- [Integration with Spec Workflow](./INTEGRATION_WITH_SPEC_WORKFLOW.md) - ใช้ร่วมกับ spec
- [Feature Registry](./FEATURES.md) - Features ทั้งหมด

---

## 💡 Pro Tips

### 1. Document ทันทีหลังเสร็จ

```
✅ GOOD: Feature เสร็จ → document ทันที
❌ BAD: รอสะสม 5 features → document ครั้งเดียว (ลืมรายละเอียด)
```

### 2. Summary สั้นกระชับ

```
✅ GOOD: "Modal with min/max thresholds and email config"
❌ BAD: "Implemented a comprehensive stock alert settings
         modal that allows users to configure..."
```

### 3. Link ไป Spec ถ้ามี

```markdown
**Spec**: `.spec-workflow/specs/stock-alerts/`

For detailed design, see [design.md](./.spec-workflow/specs/stock-alerts/design.md)
```

---

## 🎯 Next Steps

1. ✅ ลองใช้ `/feature-done` กับ feature ถัดไป
2. ✅ เช็ค `FEATURES.md` บ่อยๆ (รู้ว่าทำอะไรไปบ้าง)
3. ✅ Update ทุกครั้งที่ทำ feature เสร็จ
4. ✅ Review COMPLETION.md ของ features เก่า (เพื่อเรียนรู้)

---

**มีปัญหา?** → Ask Claude: "How do I use feature tracking?"
**ต้องการตัวอย่าง?** → `cat docs/features/budget-control-settings/COMPLETION.md`

---

**Version**: 1.0.0
**Last Updated**: 2025-12-20
