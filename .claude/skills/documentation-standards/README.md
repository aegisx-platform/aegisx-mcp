# Documentation Standards Skill

เมื่อคุณสร้างเอกสารใดๆ Claude จะใช้ skill นี้เพื่อให้แน่ใจว่าไฟล์ของคุณมีชื่อและอยู่ในตำแหน่งที่ถูกต้อง

## ทำไมต้องมี Skill นี้?

### ปัญหาก่อนมี Skill

❌ ไฟล์กระจายอยู่ใน root directory

```
FRONTEND_COMPLETION.md
Backend_Implementation_Done.md
Session_Summary_2025.md
feature-SPEC.md
```

❌ ชื่อไฟล์ไม่ consistent

- `SCREAMING_SNAKE_CASE.md`
- `PascalCase.md`
- `snake_case.md`
- `kebab-case.md` (ถูกต้อง แต่ปนกับอันอื่น)

❌ ไม่รู้ว่าไฟล์ไหนควร commit

- Internal docs ถูก commit เข้า git
- Public docs หายไป

### หลังมี Skill นี้

✅ ไฟล์อยู่ในที่ที่ถูกต้อง

```
.project/
  completion-reports/
    frontend-completion.md
    backend-implementation.md
  session-logs/
    2025-01-17-feature-work.md

docs/
  guides/
    development/
      api-testing-guide.md
```

✅ ชื่อไฟล์ทั้งหมดเป็น kebab-case
✅ รู้ว่าอันไหนควร commit (docs/) อันไหนไม่ควร (.project/)

## สิ่งที่ Skill นี้ทำ

### 1. บังคับใช้มาตรฐานการตั้งชื่อ

**กฎทอง: ใช้ kebab-case เสมอ**

```bash
# ✅ ถูกต้อง
feature-implementation-guide.md
user-authentication-spec.md
api-testing-guide.md

# ❌ ผิด
FEATURE_IMPLEMENTATION.md
Feature_Implementation.md
FeatureImplementation.md
```

**ข้อยกเว้น (ใช้ UPPERCASE ได้):**

- `README.md`
- `CHANGELOG.md`
- `LICENSE`
- `CONTRIBUTING.md`
- `.claude/skills/*/SKILL.md`

### 2. จัดระเบียบโครงสร้างไดเรกทอรี

```
project/
├── docs/                          # เอกสารสาธารณะ (จะ deploy)
│   ├── guides/                   # คู่มือต่างๆ
│   ├── reference/                # เอกสารอ้างอิง
│   ├── architecture/             # สถาปัตยกรรม
│   └── features/                 # เอกสาร feature

├── .project/                      # เอกสารภายใน (ไม่ commit)
│   ├── completion-reports/       # รายงานเสร็จงาน
│   ├── meeting-notes/            # บันทึกประชุม
│   ├── session-logs/             # บันทึกการทำงาน
│   └── planning/                 # เอกสารวางแผน

└── .claude/                       # ไฟล์ Claude
    └── skills/                    # Claude skills
```

### 3. จัดการ Git อัตโนมัติ

**Commit ได้:**

- ✅ `docs/` - เอกสารสาธารณะทั้งหมด
- ✅ `.claude/skills/` - Claude skills

**ไม่ควร commit:**

- ❌ `.project/` - เอกสารภายใน (อยู่ใน .gitignore)
- ❌ ไฟล์ชั่วคราว (`*.tmp.md`, `*.draft.md`)

## การใช้งาน

### Skill ทำงานอัตโนมัติ

Claude จะใช้ skill นี้เมื่อคุณพูดว่า:

- "สร้าง documentation"
- "เขียน completion report"
- "ทำ guide"
- "สรุปงานที่ทำ"

### ตัวอย่างการใช้งาน

#### ตัวอย่าง 1: สร้าง Completion Report

```
User: "สรุปงาน frontend ที่เสร็จแล้ว"

Claude: [ใช้ documentation-standards skill]

        ✅ Created: .project/completion-reports/frontend-integration-completion.md
        ✅ Used kebab-case naming
        ✅ Placed in correct directory
        ✅ Not tracked by git (.project/ in .gitignore)
```

#### ตัวอย่าง 2: สร้าง Public Guide

```
User: "สร้างคู่มือการ test API"

Claude: [ใช้ documentation-standards skill]

        ✅ Created: docs/guides/development/api-testing-guide.md
        ✅ Updated VitePress navigation
        ✅ Used proper template
        ✅ Ready to commit
```

#### ตัวอย่าง 3: ทำความสะอาดไฟล์ใน Root

```
User: "ทำไม FRONTEND_COMPLETION.md อยู่ใน root?"

Claude: [ใช้ documentation-standards skill]

        Found misplaced file: FRONTEND_COMPLETION.md
        ✅ Moved to: .project/completion-reports/frontend-completion.md
        ✅ Renamed to kebab-case
        ✅ Root directory clean
```

## โครงสร้างเอกสาร

### เอกสารภายใน (.project/)

#### 1. Completion Reports

**ที่เก็บ**: `.project/completion-reports/`
**ชื่อไฟล์**: `[feature-name]-completion.md`
**ตัวอย่าง**:

- `user-authentication-completion.md`
- `frontend-integration-completion.md`
- `api-implementation-completion.md`

**เมื่อไหร่ใช้:**

- เสร็จสิ้น feature หรือ task
- ต้องการบันทึกสิ่งที่ทำ
- สรุปการทำงานของ session

#### 2. Session Logs

**ที่เก็บ**: `.project/session-logs/`
**ชื่อไฟล์**: `[YYYY-MM-DD]-[topic].md`
**ตัวอย่าง**:

- `2025-01-17-authentication-work.md`
- `2025-01-18-frontend-development.md`

**เมื่อไหร่ใช้:**

- บันทึกการทำงานแต่ละวัน
- ติดตามความคืบหน้า
- จดปัญหาและวิธีแก้

#### 3. Planning Documents

**ที่เก็บ**: `.project/planning/`
**ชื่อไฟล์**: `[feature-name]-plan.md`
**ตัวอย่าง**:

- `inventory-system-plan.md`
- `api-redesign-plan.md`

**เมื่อไหร่ใช้:**

- วางแผน feature ใหม่
- ออกแบบ architecture
- จัดทำ roadmap

#### 4. Meeting Notes

**ที่เก็บ**: `.project/meeting-notes/`
**ชื่อไฟล์**: `[YYYY-MM-DD]-[topic].md`
**ตัวอย่าง**:

- `2025-01-17-sprint-planning.md`
- `2025-01-18-architecture-review.md`

**เมื่อไหร่ใช้:**

- บันทึกการประชุม
- จดข้อตกลง
- ติดตาม action items

### เอกสารสาธารณะ (docs/)

#### 1. Development Guides

**ที่เก็บ**: `docs/guides/development/`
**ตัวอย่าง**:

- `api-testing-guide.md`
- `frontend-development-workflow.md`

#### 2. Infrastructure Guides

**ที่เก็บ**: `docs/guides/infrastructure/`
**ตัวอย่าง**:

- `docker-deployment-guide.md`
- `ci-cd-setup-guide.md`

#### 3. API Reference

**ที่เก็บ**: `docs/reference/api/`
**ตัวอย่าง**:

- `authentication-api.md`
- `user-management-api.md`

#### 4. Architecture Docs

**ที่เก็บ**: `docs/architecture/`
**ตัวอย่าง**:

- `frontend-patterns.md`
- `database-design.md`

#### 5. Feature Docs

**ที่เก็บ**: `docs/features/[feature-name]/`
**ตัวอย่าง**:

- `docs/features/authentication/README.md`
- `docs/features/user-management/api-contracts.md`

## Templates

### Completion Report Template

```markdown
# [Feature Name] - Completion Report

**Date**: 2025-01-17
**Type**: Backend / Frontend / Full-Stack
**Status**: ✅ Complete / ⚠️ Partial / ❌ Failed

## Summary

สรุปสั้นๆ 2-3 ประโยคว่าทำอะไรเสร็จ

## What Was Implemented

### Backend

- สิ่งที่ทำ 1
- สิ่งที่ทำ 2

### Frontend

- สิ่งที่ทำ 1
- สิ่งที่ทำ 2

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

## Testing

- [ ] Unit tests passed
- [ ] Integration tests passed
- [ ] Manual testing complete

## Next Steps

1. สิ่งที่ต้องทำต่อ
2. สิ่งที่ต้องปรับปรุง
```

### Public Guide Template

```markdown
# [Guide Title]

> คำอธิบายสั้นๆ ว่า guide นี้เกี่ยวกับอะไร

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Step-by-Step](#step-by-step)
- [Best Practices](#best-practices)

## Overview

แนะนำเรื่องที่จะพูดถึง

## Getting Started

สิ่งที่ต้องเตรียมก่อนเริ่ม

## Step-by-Step

ขั้นตอนละเอียด

## Best Practices

แนวทางที่แนะนำ

---

_Last updated: 2025-01-17_
```

## Best Practices

### 1. ตั้งชื่อไฟล์

✅ **DO:**

```
api-testing-guide.md
user-authentication-completion.md
2025-01-17-sprint-planning.md
```

❌ **DON'T:**

```
API_Testing_Guide.md
UserAuthentication.md
Sprint-Planning.md
COMPLETION.md
```

### 2. จัดเก็บไฟล์

✅ **DO:**

```
.project/completion-reports/feature-completion.md  # Internal
docs/guides/development/api-guide.md               # Public
```

❌ **DON'T:**

```
FEATURE_COMPLETION.md                    # Root directory
docs/my-random-notes.md                  # Unorganized
completion-reports/report.md             # Wrong location
```

### 3. Commit Files

✅ **DO:**

```bash
git add docs/guides/development/new-guide.md
git add docs/.vitepress/config.mts
git commit -m "docs: add new development guide"
```

❌ **DON'T:**

```bash
git add .project/                        # Internal docs
git add COMPLETION.md                     # Misplaced file
git commit -m "add docs"                 # Vague message
```

## Troubleshooting

### Q: Claude สร้างไฟล์ใน root directory

**A:** Claude ควรใช้ documentation-standards skill อัตโนมัติ แต่ถ้าไม่ได้ใช้:

```
"Claude, ใช้ documentation-standards skill ย้ายไฟล์นี้ไปที่ถูกต้อง"
```

### Q: ไฟล์ยังเป็น UPPERCASE อยู่

**A:** บอก Claude ให้แปลงเป็น kebab-case:

```
"Claude, rename ไฟล์นี้เป็น kebab-case"
```

### Q: ไม่แน่ใจว่าไฟล์ควรอยู่ที่ไหน

**A:** ถามตัวเองว่า:

- เป็นเอกสารที่จะแชร์กับทีม/สาธารณะ? → `docs/`
- เป็นบันทึกภายใน/ส่วนตัว? → `.project/`
- เป็น Claude skill? → `.claude/skills/`

### Q: ควร commit ไฟล์นี้ไหม?

**A:**

- ใน `docs/` → ✅ Commit
- ใน `.project/` → ❌ Don't commit (already in .gitignore)
- ใน `.claude/skills/` → ✅ Commit

## Benefits

### ก่อนใช้ Skill นี้

- ❌ Root directory เต็มไปด้วยไฟล์
- ❌ ชื่อไฟล์ไม่ consistent
- ❌ หาเอกสารไม่เจอ
- ❌ Commit ไฟล์ผิด
- ❌ เสียเวลาจัดระเบียบ

### หลังใช้ Skill นี้

- ✅ Root directory สะอาด
- ✅ ชื่อไฟล์เป็นมาตรฐานทั้งหมด
- ✅ หาเอกสารเจอง่าย
- ✅ Commit เฉพาะไฟล์ที่ควร commit
- ✅ ประหยัดเวลา

## Summary

### กฎสำคัญ

1. **ชื่อไฟล์**: kebab-case เสมอ (ยกเว้น README.md, LICENSE)
2. **โครงสร้าง**:
   - Public docs → `docs/`
   - Internal docs → `.project/`
   - Claude skills → `.claude/skills/`
3. **Git**:
   - Commit `docs/` และ `.claude/skills/`
   - ไม่ commit `.project/`

### Quick Reference

| ประเภทเอกสาร      | ที่เก็บ                        | Commit? |
| ----------------- | ------------------------------ | ------- |
| Completion Report | `.project/completion-reports/` | ❌      |
| Session Log       | `.project/session-logs/`       | ❌      |
| Meeting Notes     | `.project/meeting-notes/`      | ❌      |
| Planning Docs     | `.project/planning/`           | ❌      |
| Public Guides     | `docs/guides/`                 | ✅      |
| API Reference     | `docs/reference/api/`          | ✅      |
| Architecture      | `docs/architecture/`           | ✅      |
| Features          | `docs/features/`               | ✅      |

---

**เอกสารสะอาด โปรเจ็กต์สบาย! 📚✨**

_Last updated: 2025-01-17_
