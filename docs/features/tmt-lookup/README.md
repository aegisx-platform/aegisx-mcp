# TMT Lookup Components

> Reusable components สำหรับค้นหาและแสดงรายละเอียด TMT (Thai Medicines Terminology)

## Overview

TMT Lookup Components เป็นชุด Angular components ที่ออกแบบมาเพื่อให้สามารถค้นหา แสดงผล และเลือก TMT codes ได้ง่ายทั่วทั้ง Application

## Documents

| Document                       | Description                                  |
| ------------------------------ | -------------------------------------------- |
| [SPEC.md](./spec.md)           | Technical specification และ component design |
| [API.md](./API.md)             | Backend API endpoints specification          |
| [UI-MOCKUP.md](./UI-MOCKUP.md) | UI mockups และ visual design                 |

## Quick Start

```typescript
// Import components
import {
  AxTmtBadgeComponent,
  AxTmtLookupComponent,
  AxTmtHierarchyComponent,
  AxTmtDetailDialogComponent
} from '@app/shared';

// Usage in template
<ax-tmt-badge [code]="'767348'" level="GPU"></ax-tmt-badge>
```

## Components

| Component                  | Selector               | Description                              |
| -------------------------- | ---------------------- | ---------------------------------------- |
| AxTmtBadgeComponent        | `ax-tmt-badge`         | แสดง TMT code แบบ badge คลิกดูรายละเอียด |
| AxTmtLookupComponent       | `ax-tmt-lookup`        | Input สำหรับค้นหาและเลือก TMT            |
| AxTmtHierarchyComponent    | `ax-tmt-hierarchy`     | แสดง hierarchy tree                      |
| AxTmtDetailDialogComponent | `ax-tmt-detail-dialog` | Dialog แสดงรายละเอียดครบถ้วน             |

## TMT Levels

| Level | Thai           | Description                | Color  |
| ----- | -------------- | -------------------------- | ------ |
| VTM   | สารออกฤทธิ์    | Virtual Therapeutic Moiety | Purple |
| GP    | ยาสามัญ        | Generic Product            | Blue   |
| GPU   | ยาสามัญ+หน่วย  | Generic Product Unit       | Green  |
| TP    | ยาการค้า       | Trade Product              | Amber  |
| TPU   | ยาการค้า+หน่วย | Trade Product Unit         | Red    |

## Data Source

- **tmt_concepts**: 76,904 records
- **tmt_relationships**: Parent-child hierarchy
- **tmt_units**: 85 unit types
