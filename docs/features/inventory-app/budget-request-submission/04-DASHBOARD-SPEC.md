# 04. Budget Dashboard Specification

**Version:** 1.0.0
**Date:** 2025-12-12

[← Back to Index](./README.md) | [← Previous: Validation Rules](./03-VALIDATION-RULES.md)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Dashboard Layouts](#dashboard-layouts)
3. [Overview Dashboard](#overview-dashboard)
4. [Budget Tracking Dashboard](#budget-tracking-dashboard)
5. [Request Status Dashboard](#request-status-dashboard)
6. [Components Specification](#components-specification)
7. [API Requirements](#api-requirements)

---

## Overview

Dashboard มี 3 ระดับตาม Role:

1. **Pharmacist Dashboard** - ดูคำขอของตัวเอง + แผนก
2. **Department Head Dashboard** - ดูภาพรวมแผนก + งบประมาณ
3. **Finance Manager Dashboard** - ดูภาพรวมทั้งระบบ + งบทุกแผนก

---

## Dashboard Layouts

### 1. Main Dashboard (Overview)

**Route:** `/inventory/budget-requests/dashboard`

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Budget Request Dashboard - FY 2568                      │
│  Department: Pharmacy Department                  [Filter ▼]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐│
│  │ Total       │ │ Pending     │ │ Approved    │ │ Budget ││
│  │ Requests    │ │ Approval    │ │ This Year   │ │ Usage  ││
│  │     12      │ │      3      │ │      8      │ │  65%   ││
│  │ +2 vs last  │ │ ⚠️ Action   │ │ ✅ On track │ │ 🟡 High││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘│
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 💰 Budget Allocation Status                           │  │
│  │                                                        │  │
│  │  OP001 - ยาและเวชภัณฑ์                                │  │
│  │  ████████████████░░░░ 65% (6.5M / 10M)                │  │
│  │  Available: 3.5M  |  Reserved: 500K  |  Used: 6.5M   │  │
│  │                                                        │  │
│  │  OP002 - เวชภัณฑ์มิใช่ยา                              │  │
│  │  ██████░░░░░░░░░░░░░ 30% (1.5M / 5M)                  │  │
│  │  Available: 3.5M  |  Reserved: 0  |  Used: 1.5M      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────┐ ┌──────────────────────────────┐  │
│  │ 📋 Recent Requests   │ │ ⏱️ Pending Actions           │  │
│  │                      │ │                              │  │
│  │ BR-2568-012 (Draft)  │ │ BR-2568-009 - Waiting for   │  │
│  │ BR-2568-011 (Submit) │ │ your approval (3 days)      │  │
│  │ BR-2568-010 (Approve)│ │                              │  │
│  └──────────────────────┘ │ BR-2568-007 - Waiting for   │  │
│                           │ Finance approval (5 days)    │  │
│                           └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Budget Tracking Dashboard

**Route:** `/inventory/budget-requests/dashboard/budget-tracking`

**Focus:** ติดตามการใช้งบประมาณแบบละเอียด

```
┌─────────────────────────────────────────────────────────────┐
│  💰 Budget Tracking - FY 2568                               │
│  Department: Pharmacy Department         [Export] [Print]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📊 Annual Budget Overview                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Total Allocated: 15,000,000 บาท                       │  │
│  │ Total Used:       6,500,000 บาท (43%)                 │  │
│  │ Total Reserved:     500,000 บาท (3%)                  │  │
│  │ Available:        8,000,000 บาท (54%)                 │  │
│  │                                                        │  │
│  │ [███████████████░░░░░░░░░░░░░] 43% Used               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  📅 Quarterly Breakdown                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Quarter │ Allocated │  Used   │ Reserved │ Available│    │
│  │─────────┼───────────┼─────────┼──────────┼─────────│    │
│  │ Q1 2568 │ 3,000,000 │2,500,000│   50,000 │  450,000│    │
│  │         │ ████████████████░░░░ 83%                  │    │
│  │                                                      │    │
│  │ Q2 2568 │ 3,500,000 │2,000,000│  250,000 │1,250,000│    │
│  │         │ ████████████░░░░░░░░ 57%                  │    │
│  │                                                      │    │
│  │ Q3 2568 │ 4,000,000 │1,500,000│  100,000 │2,400,000│    │
│  │         │ ████████░░░░░░░░░░░░ 38%                  │    │
│  │                                                      │    │
│  │ Q4 2568 │ 4,500,000 │  500,000│  100,000 │3,900,000│    │
│  │         │ ███░░░░░░░░░░░░░░░░░ 11%                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  📈 Spending Trend (Last 12 Months)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 3M ┤                                            ●      │  │
│  │    │                                      ●            │  │
│  │ 2M ┤                          ●     ●                  │  │
│  │    │                    ●                              │  │
│  │ 1M ┤          ●   ●                                    │  │
│  │    │    ●                                              │  │
│  │  0 └──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──              │  │
│  │     Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  🎯 Budget Type Breakdown                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ OP001 - ยาและเวชภัณฑ์              10M / 65% used     │  │
│  │ ████████████████░░░░                                  │  │
│  │                                                        │  │
│  │ OP002 - เวชภัณฑ์มิใช่ยา             5M / 30% used     │  │
│  │ ██████░░░░░░░░░░                                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Request Status Dashboard

**Route:** `/inventory/budget-requests/dashboard/requests`

**Focus:** ติดตามสถานะคำขอทั้งหมด

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Request Status Dashboard - FY 2568                      │
│  [All Departments ▼] [All Status ▼] [This Year ▼]          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Status Summary                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ DRAFT    │ │ SUBMITTED│ │ DEPT_APP │ │ FIN_APP  │       │
│  │    2     │ │    3     │ │    1     │ │    8     │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐                                                │
│  │ REJECTED │                                                │
│  │    1     │                                                │
│  └──────────┘                                                │
│                                                               │
│  Requests List                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Request #   │ Amount    │ Status      │ Created  │ Age││  │
│  │─────────────┼───────────┼─────────────┼──────────┼────││  │
│  │ BR-2568-012 │ 2,500,000 │ 🟡 SUBMITTED│ Dec 10   │ 2d ││  │
│  │             │           │ → Waiting   │          │    ││  │
│  │                         for Dept Approval              ││  │
│  │─────────────┼───────────┼─────────────┼──────────┼────││  │
│  │ BR-2568-011 │ 1,200,000 │ 🟢 DEPT_APP │ Dec 08   │ 4d ││  │
│  │             │           │ → Waiting   │          │    ││  │
│  │                         for Finance Approval           ││  │
│  │─────────────┼───────────┼─────────────┼──────────┼────││  │
│  │ BR-2568-010 │   850,000 │ ✅ FIN_APP  │ Dec 05   │ 7d ││  │
│  │             │           │ → Approved  │          │    ││  │
│  │─────────────┼───────────┼─────────────┼──────────┼────││  │
│  │ BR-2568-009 │   500,000 │ ⚪ DRAFT    │ Dec 12   │ 0d ││  │
│  │             │           │ → In Progress│         │    ││  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Approval Timeline                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ BR-2568-012: Draft → Submitted (2 days waiting)        │  │
│  │ ●────────●                                             │  │
│  │ Dec 10   Dec 10                                        │  │
│  │                                                        │  │
│  │ BR-2568-011: Draft → Submitted → Dept Approved         │  │
│  │ ●────────●──────────●                                  │  │
│  │ Dec 08   Dec 08     Dec 09 (4 days waiting)           │  │
│  │                                                        │  │
│  │ BR-2568-010: Full approval (2 days total)              │  │
│  │ ●────────●──────────●──────────●                       │  │
│  │ Dec 05   Dec 05     Dec 06     Dec 07                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Overview Dashboard

### Stats Cards

#### 1. Total Requests Card

```typescript
interface TotalRequestsCard {
  title: 'Total Requests';
  value: number; // e.g., 12
  change: {
    value: number; // e.g., +2
    period: string; // e.g., "vs last month"
    trend: 'up' | 'down' | 'neutral';
  };
  icon: 'description';
  color: 'primary';
}
```

**API:** `GET /inventory/budget/budget-requests/stats/total`

**Query Params:**

- `fiscal_year` (optional)
- `department_id` (optional, filtered by role)
- `compare_period` (optional: 'month', 'quarter', 'year')

---

#### 2. Pending Approval Card

```typescript
interface PendingApprovalCard {
  title: 'Pending Approval';
  value: number; // Count of requests awaiting my approval
  badge: 'Action Required' | 'On Track';
  urgentCount?: number; // Requests pending > 7 days
  icon: 'schedule';
  color: 'warn' | 'accent';
}
```

**API:** `GET /inventory/budget/budget-requests/stats/pending`

**Response:**

```json
{
  "total": 3,
  "submitted": 2, // Waiting for dept approval
  "dept_approved": 1, // Waiting for finance approval
  "urgent": 1, // > 7 days
  "my_action_required": true
}
```

---

#### 3. Approved This Year Card

```typescript
interface ApprovedCard {
  title: 'Approved This Year';
  value: number; // Count of FINANCE_APPROVED
  totalAmount: number; // Sum of approved amounts
  icon: 'check_circle';
  color: 'success';
}
```

**API:** `GET /inventory/budget/budget-requests/stats/approved`

---

#### 4. Budget Usage Card

```typescript
interface BudgetUsageCard {
  title: 'Budget Usage';
  percentage: number; // e.g., 65
  status: 'healthy' | 'warning' | 'critical'; // <70%, 70-90%, >90%
  allocated: number;
  used: number;
  available: number;
  icon: 'account_balance';
  color: 'success' | 'warn' | 'error';
}
```

**API:** `GET /inventory/budget/allocations/stats/usage`

---

### Budget Allocation Status Component

**Component:** `<budget-allocation-status-widget>`

```typescript
interface BudgetAllocationStatus {
  budget_type_id: number;
  budget_type_name: string;
  budget_type_code: string;
  total_allocated: number;
  total_used: number;
  total_reserved: number;
  available: number;
  usage_percentage: number;
  status: 'healthy' | 'warning' | 'critical';
}
```

**API:** `GET /inventory/budget/allocations/summary`

**Query Params:**

- `fiscal_year` (required)
- `department_id` (optional, filtered by role)

**Response:**

```json
{
  "fiscal_year": 2568,
  "department_id": 2,
  "department_name": "Pharmacy Department",
  "allocations": [
    {
      "budget_type_id": 1,
      "budget_type_code": "OP001",
      "budget_type_name": "ยาและเวชภัณฑ์",
      "total_allocated": 10000000,
      "total_used": 6500000,
      "total_reserved": 500000,
      "available": 3000000,
      "usage_percentage": 65,
      "status": "warning"
    },
    {
      "budget_type_id": 2,
      "budget_type_code": "OP002",
      "budget_type_name": "เวชภัณฑ์มิใช่ยา",
      "total_allocated": 5000000,
      "total_used": 1500000,
      "total_reserved": 0,
      "available": 3500000,
      "usage_percentage": 30,
      "status": "healthy"
    }
  ],
  "totals": {
    "allocated": 15000000,
    "used": 8000000,
    "reserved": 500000,
    "available": 6500000,
    "usage_percentage": 53.3
  }
}
```

---

### Recent Requests Component

**Component:** `<recent-requests-widget>`

**API:** `GET /inventory/budget/budget-requests/recent`

**Query Params:**

- `limit` (default: 5)
- `department_id` (optional, filtered by role)

**Response:**

```json
{
  "requests": [
    {
      "id": 12,
      "request_number": "BR-2568-012",
      "status": "DRAFT",
      "total_requested_amount": 2500000,
      "created_at": "2025-12-12T10:00:00Z",
      "created_by_name": "นายสมชาย ใจดี"
    }
    // ... more
  ]
}
```

---

### Pending Actions Component

**Component:** `<pending-actions-widget>`

**API:** `GET /inventory/budget/budget-requests/my-pending-actions`

**Logic:**

- If user is Department Head: show SUBMITTED requests from their dept
- If user is Finance Manager: show DEPT_APPROVED requests
- Show days waiting

**Response:**

```json
{
  "pending_actions": [
    {
      "id": 9,
      "request_number": "BR-2568-009",
      "status": "SUBMITTED",
      "total_requested_amount": 1200000,
      "submitted_at": "2025-12-09T14:00:00Z",
      "days_waiting": 3,
      "created_by_name": "นายสมชาย ใจดี",
      "action_required": "Department Approval"
    },
    {
      "id": 7,
      "request_number": "BR-2568-007",
      "status": "DEPT_APPROVED",
      "total_requested_amount": 850000,
      "dept_reviewed_at": "2025-12-07T16:00:00Z",
      "days_waiting": 5,
      "action_required": "Finance Approval"
    }
  ]
}
```

---

## Budget Tracking Dashboard

### Quarterly Breakdown Table

**Component:** `<quarterly-budget-breakdown>`

**API:** `GET /inventory/budget/allocations/quarterly-breakdown`

**Query Params:**

- `fiscal_year` (required)
- `department_id` (optional)
- `budget_type_id` (optional)

**Response:**

```json
{
  "fiscal_year": 2568,
  "quarters": [
    {
      "quarter": 1,
      "allocated": 3000000,
      "used": 2500000,
      "reserved": 50000,
      "available": 450000,
      "usage_percentage": 83.3,
      "status": "warning"
    },
    {
      "quarter": 2,
      "allocated": 3500000,
      "used": 2000000,
      "reserved": 250000,
      "available": 1250000,
      "usage_percentage": 57.1,
      "status": "healthy"
    }
    // Q3, Q4...
  ]
}
```

---

### Spending Trend Chart

**Component:** `<spending-trend-chart>`

**Chart Type:** Line chart (using Chart.js or ngx-charts)

**API:** `GET /inventory/budget/allocations/spending-trend`

**Query Params:**

- `fiscal_year` (required)
- `department_id` (optional)
- `months` (default: 12)

**Response:**

```json
{
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  "datasets": [
    {
      "label": "Monthly Spending",
      "data": [500000, 800000, 1200000, 1500000, 2000000, 1800000, 1500000, 1200000, 1000000, 500000, 300000, 200000]
    },
    {
      "label": "Budget Plan",
      "data": [1000000, 1000000, 1000000, 1200000, 1200000, 1200000, 1300000, 1300000, 1300000, 1500000, 1500000, 1500000]
    }
  ]
}
```

---

### Budget Type Breakdown

**Component:** `<budget-type-breakdown-chart>`

**Chart Type:** Horizontal bar chart or Pie chart

**API:** Same as allocation summary endpoint

---

## Request Status Dashboard

### Status Summary Tabs

**Component:** `<request-status-tabs>`

**Tabs:**

1. All (12)
2. Draft (2)
3. Submitted (3)
4. Dept Approved (1)
5. Finance Approved (8)
6. Rejected (1)

**API:** `GET /inventory/budget/budget-requests/status-summary`

**Response:**

```json
{
  "total": 15,
  "by_status": {
    "DRAFT": 2,
    "SUBMITTED": 3,
    "DEPT_APPROVED": 1,
    "FINANCE_APPROVED": 8,
    "REJECTED": 1
  }
}
```

---

### Requests List Table

**Component:** `<requests-status-list>`

**Features:**

- Sortable columns
- Filter by status, department, date range
- Click to view details
- Color-coded status badges

**API:** `GET /inventory/budget/budget-requests`

(Existing list endpoint with filters)

---

### Approval Timeline Visualization

**Component:** `<approval-timeline-widget>`

**Visual:** Timeline showing request progression

**API:** `GET /inventory/budget/budget-requests/:id/timeline`

**Response:**

```json
{
  "request_number": "BR-2568-012",
  "timeline": [
    {
      "status": "DRAFT",
      "timestamp": "2025-12-10T09:00:00Z",
      "user_name": "นายสมชาย ใจดี",
      "action": "Created"
    },
    {
      "status": "SUBMITTED",
      "timestamp": "2025-12-10T14:00:00Z",
      "user_name": "นายสมชาย ใจดี",
      "action": "Submitted for approval",
      "days_since_last": 0
    },
    {
      "status": "CURRENT",
      "timestamp": null,
      "action": "Waiting for Department Head approval",
      "days_since_last": 2
    }
  ]
}
```

---

## Components Specification

### 1. Stats Card Component

**Component:** `<ax-stats-card>` (reusable)

```typescript
@Component({
  selector: 'ax-stats-card',
  template: `
    <mat-card class="stats-card" [class]="'stats-card--' + color">
      <mat-card-content>
        <div class="stats-card__header">
          <mat-icon [color]="color">{{ icon }}</mat-icon>
          <h3>{{ title }}</h3>
        </div>
        <div class="stats-card__value">
          {{ value | number }}
          @if (badge) {
            <span class="badge">{{ badge }}</span>
          }
        </div>
        @if (change) {
          <div class="stats-card__change" [class.positive]="change.trend === 'up'">
            <mat-icon>{{ change.trend === 'up' ? 'trending_up' : 'trending_down' }}</mat-icon>
            {{ change.value > 0 ? '+' : '' }}{{ change.value }} {{ change.period }}
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class StatsCardComponent {
  @Input() title!: string;
  @Input() value!: number;
  @Input() icon!: string;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() badge?: string;
  @Input() change?: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'neutral';
  };
}
```

---

### 2. Budget Progress Bar Component

**Component:** `<budget-progress-bar>`

```typescript
@Component({
  selector: 'budget-progress-bar',
  template: `
    <div class="budget-progress">
      <div class="budget-progress__header">
        <span class="budget-type">{{ budgetType }}</span>
        <span class="percentage" [class]="statusClass">{{ percentage }}%</span>
      </div>
      <mat-progress-bar mode="determinate" [value]="percentage" [color]="barColor"></mat-progress-bar>
      <div class="budget-progress__details">
        <span>Available: {{ available | number: '1.0-0' }}</span>
        <span>Reserved: {{ reserved | number: '1.0-0' }}</span>
        <span>Used: {{ used | number: '1.0-0' }}</span>
      </div>
    </div>
  `,
})
export class BudgetProgressBarComponent {
  @Input() budgetType!: string;
  @Input() allocated!: number;
  @Input() used!: number;
  @Input() reserved!: number;

  get available(): number {
    return this.allocated - this.used - this.reserved;
  }

  get percentage(): number {
    return (this.used / this.allocated) * 100;
  }

  get statusClass(): string {
    if (this.percentage >= 90) return 'critical';
    if (this.percentage >= 70) return 'warning';
    return 'healthy';
  }

  get barColor(): 'primary' | 'accent' | 'warn' {
    if (this.percentage >= 90) return 'warn';
    if (this.percentage >= 70) return 'accent';
    return 'primary';
  }
}
```

---

### 3. Pending Actions Widget

**Component:** `<pending-actions-widget>`

```typescript
@Component({
  selector: 'pending-actions-widget',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-icon>schedule</mat-icon>
        <mat-card-title>Pending Actions</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        @if (loading()) {
          <mat-spinner></mat-spinner>
        } @else if (pendingActions().length === 0) {
          <div class="empty-state">
            <mat-icon>check_circle</mat-icon>
            <p>No pending actions</p>
          </div>
        } @else {
          <mat-list>
            @for (action of pendingActions(); track action.id) {
              <mat-list-item>
                <mat-icon matListItemIcon [class.urgent]="action.days_waiting > 7">
                  {{ action.days_waiting > 7 ? 'warning' : 'schedule' }}
                </mat-icon>
                <div matListItemTitle>
                  <a [routerLink]="['/inventory/budget-requests', action.id]">
                    {{ action.request_number }}
                  </a>
                </div>
                <div matListItemLine>{{ action.action_required }} ({{ action.days_waiting }} days)</div>
              </mat-list-item>
            }
          </mat-list>
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class PendingActionsWidgetComponent implements OnInit {
  private budgetRequestService = inject(BudgetRequestService);

  loading = signal(false);
  pendingActions = signal<PendingAction[]>([]);

  async ngOnInit() {
    this.loading.set(true);
    try {
      const actions = await this.budgetRequestService.getMyPendingActions();
      this.pendingActions.set(actions);
    } finally {
      this.loading.set(false);
    }
  }
}
```

---

## API Requirements

### New API Endpoints Needed

```typescript
// Dashboard Stats
GET /inventory/budget/budget-requests/stats/total
GET /inventory/budget/budget-requests/stats/pending
GET /inventory/budget/budget-requests/stats/approved
GET /inventory/budget/budget-requests/status-summary

// Budget Allocation Stats
GET /inventory/budget/allocations/stats/usage
GET /inventory/budget/allocations/summary
GET /inventory/budget/allocations/quarterly-breakdown
GET /inventory/budget/allocations/spending-trend

// My Actions
GET /inventory/budget/budget-requests/my-pending-actions
GET /inventory/budget/budget-requests/recent

// Timeline
GET /inventory/budget/budget-requests/:id/timeline
```

---

## Summary

### Dashboard Features Checklist

✅ **Overview Dashboard**

- Stats cards (Total, Pending, Approved, Budget Usage)
- Budget allocation status bars
- Recent requests list
- Pending actions widget

✅ **Budget Tracking Dashboard**

- Annual budget overview
- Quarterly breakdown table
- Spending trend chart
- Budget type breakdown

✅ **Request Status Dashboard**

- Status summary tabs
- Requests list with filters
- Approval timeline visualization

### Next Steps

1. ✅ Implement backend API endpoints for dashboard data
2. ✅ Create reusable dashboard components
3. ✅ Implement charts (Chart.js or ngx-charts)
4. ✅ Add real-time updates (WebSocket or polling)
5. ⏭️ Read [05-UI-UX-IMPROVEMENTS.md](./05-UI-UX-IMPROVEMENTS.md) for UX details

---

[← Back to Index](./README.md) | [← Previous: Validation Rules](./03-VALIDATION-RULES.md) | [Next: UI/UX Improvements →](./05-UI-UX-IMPROVEMENTS.md)
