# 📋 Budget Request Submission Flow - Complete Specification

**Version:** 1.0.0
**Date:** 2025-12-12
**Status:** 🟡 Draft - Pending Approval

---

## 📖 Overview

เอกสารชุดนี้ระบุรายละเอียดครบถ้วนเกี่ยวกับ **Budget Request Submission Workflow** รวมถึง:

- การออกแบบ Permission และ Role-based Access Control
- กฎการ Validate ก่อน Submit
- Budget Dashboard สำหรับติดตามงบประมาณ
- การปรับปรุง UI/UX
- การเชื่อมโยงกับระบบงบประมาณอื่นๆ

---

## 🗂️ เอกสารทั้งหมด

### Core Specifications

| ลำดับ | ไฟล์                                                   | หัวข้อ                                                | สถานะ       |
| ----- | ------------------------------------------------------ | ----------------------------------------------------- | ----------- |
| 01    | [01-WORKFLOW-ANALYSIS.md](./01-WORKFLOW-ANALYSIS.md)   | การวิเคราะห์ Workflow ปัจจุบัน และ Status Transitions | 🟢 Complete |
| 02    | [02-PERMISSION-MATRIX.md](./02-PERMISSION-MATRIX.md)   | Permission Matrix และ Role-based Access Control       | ⚪ Pending  |
| 03    | [03-VALIDATION-RULES.md](./03-VALIDATION-RULES.md)     | Pre-submission Validation Rules และ Checklist         | ⚪ Pending  |
| 04    | [04-DASHBOARD-SPEC.md](./04-DASHBOARD-SPEC.md)         | Budget Dashboard Design (Overview, KPIs, Metrics)     | ⚪ Pending  |
| 05    | [05-UI-UX-IMPROVEMENTS.md](./05-UI-UX-IMPROVEMENTS.md) | UI/UX Improvements สำหรับ Submission Flow             | ⚪ Pending  |
| 06    | [06-INTEGRATION-SPEC.md](./06-INTEGRATION-SPEC.md)     | Integration กับ Budget Plans และ Allocations          | ⚪ Pending  |

### Supporting Documents

| ไฟล์                                               | หัวข้อ                                        |
| -------------------------------------------------- | --------------------------------------------- |
| [API-ENDPOINTS.md](./API-ENDPOINTS.md)             | รายการ API Endpoints ทั้งหมด (New + Existing) |
| [DATABASE-CHANGES.md](./DATABASE-CHANGES.md)       | การเปลี่ยนแปลง Database Schema (ถ้ามี)        |
| [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) | แผนการพัฒนาแบบ Step-by-Step                   |

---

## 🎯 ภาพรวม Business Requirements

### ปัญหาที่ต้องแก้ไข

1. **ไม่มีการควบคุมสิทธิ์ที่ชัดเจน** - ใครก็สามารถ submit/approve ได้
2. **ไม่มีการ validate ก่อน submit** - อาจ submit ข้อมูลไม่ครบหรือผิดพลาด
3. **ไม่มี dashboard ติดตามงบ** - ไม่รู้ว่างบเท่าไหร่ ใช้ไปเท่าไหร่ คงเหลือเท่าไหร่
4. **UX ไม่ชัดเจน** - User ไม่รู้ว่าต้องทำอะไรต่อ หรือขาดอะไร
5. **ไม่เชื่อมกับ Budget Plans** - ไม่รู้ว่ายาที่ขออยู่ในแผนหรือไม่

### เป้าหมาย

✅ มีระบบ Permission ที่ชัดเจน ตาม Role และ Department
✅ มี Pre-submission Checklist ที่บังคับให้ครบก่อน submit
✅ มี Dashboard แสดงงบประมาณแบบ Real-time
✅ UX ที่ชัดเจน มี Progress indicator, Validation feedback
✅ เชื่อมโยงกับ Budget Plans และ Allocations อัตโนมัติ

---

## 📊 Current System Status

### Database Tables

**Main Table:**

- `inventory.budget_requests` - หัวข้อคำขอ
- `inventory.budget_request_items` - รายการยาในคำขอ
- `inventory.budget_request_comments` - ความคิดเห็น/หมายเหตุ
- `inventory.budget_request_audit` - Audit trail

**Related Tables:**

- `inventory.budget_plans` - แผนงบประมาณประจำปี
- `inventory.budget_plan_items` - รายการยาในแผน
- `inventory.budget_allocations` - งบที่จัดสรรให้แต่ละแผนก
- `inventory.departments` - ข้อมูลแผนก
- `public.users` - ข้อมูลผู้ใช้
- `public.roles` - บทบาท/สิทธิ์

### Current Status Flow

```
DRAFT → SUBMITTED → DEPT_APPROVED → FINANCE_APPROVED
   ↓         ↓            ↓
        REJECTED (สามารถเกิดได้จากทุก stage)
```

### Existing API Endpoints

- `GET /inventory/budget/budget-requests` - List all requests
- `GET /inventory/budget/budget-requests/:id` - Get single request
- `POST /inventory/budget/budget-requests` - Create new request
- `PUT /inventory/budget/budget-requests/:id` - Update request
- `DELETE /inventory/budget/budget-requests/:id` - Delete request
- `POST /inventory/budget/budget-requests/:id/submit` - Submit for approval
- `POST /inventory/budget/budget-requests/:id/approve-dept` - Department approval
- `POST /inventory/budget/budget-requests/:id/approve-finance` - Finance approval

---

## 🚀 Quick Navigation

### สำหรับ Product Owner / Business Analyst

1. อ่าน [01-WORKFLOW-ANALYSIS.md](./01-WORKFLOW-ANALYSIS.md) - เข้าใจ flow ปัจจุบัน
2. อ่าน [02-PERMISSION-MATRIX.md](./02-PERMISSION-MATRIX.md) - ทำความเข้าใจสิทธิ์
3. อ่าน [04-DASHBOARD-SPEC.md](./04-DASHBOARD-SPEC.md) - ดู Dashboard design

### สำหรับ UX/UI Designer

1. อ่าน [05-UI-UX-IMPROVEMENTS.md](./05-UI-UX-IMPROVEMENTS.md) - UX improvements
2. อ่าน [03-VALIDATION-RULES.md](./03-VALIDATION-RULES.md) - Validation messages

### สำหรับ Backend Developer

1. อ่าน [02-PERMISSION-MATRIX.md](./02-PERMISSION-MATRIX.md) - Permission logic
2. อ่าน [03-VALIDATION-RULES.md](./03-VALIDATION-RULES.md) - Validation rules
3. อ่าน [06-INTEGRATION-SPEC.md](./06-INTEGRATION-SPEC.md) - Integration points
4. อ่าน [API-ENDPOINTS.md](./API-ENDPOINTS.md) - API contracts
5. อ่าน [DATABASE-CHANGES.md](./DATABASE-CHANGES.md) - Schema changes

### สำหรับ Frontend Developer

1. อ่าน [05-UI-UX-IMPROVEMENTS.md](./05-UI-UX-IMPROVEMENTS.md) - UI components
2. อ่าน [04-DASHBOARD-SPEC.md](./04-DASHBOARD-SPEC.md) - Dashboard components
3. อ่าน [API-ENDPOINTS.md](./API-ENDPOINTS.md) - API contracts

### สำหรับ Project Manager

1. อ่าน [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) - Timeline และ tasks

---

## 📝 Change Log

| Version | Date       | Changes               | Author        |
| ------- | ---------- | --------------------- | ------------- |
| 1.0.0   | 2025-12-12 | Initial specification | Claude + User |

---

## 🔗 Related Documentation

- [Budget Management Workflows](../05-workflows/02-budget-WORKFLOWS.md)
- [Budget Schema](../04-api-guides/02-budget-SCHEMA.md)
- [Budget API Guide](../04-api-guides/02-budget-API.md)
- [System Architecture](../../../SYSTEM_ARCHITECTURE.md)

---

**Next Steps:**

1. Review และ approve specification ทั้งหมด
2. Prioritize features ที่ต้องพัฒนาก่อน
3. Assign tasks to development team
4. Start implementation according to plan
