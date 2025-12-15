# Drug Management System - Technical Specification

**Version:** 1.0.0
**Last Updated:** 2025-12-12
**Status:** Design Phase

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [Existing Implementation](#existing-implementation)
- [Proposed Solution](#proposed-solution)
- [Component Integration](#component-integration)
- [Implementation Plan](#implementation-plan)

---

## 🏗️ Architecture Overview

### System Context

```
┌─────────────────────────────────────────────────┐
│         Drug Management System                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Drugs (Trade Names)                            │
│    ↓                                            │
│  Drug Generics (Active Ingredients)             │
│    ↓                                            │
│  Drug Components (Compositions)                 │
│    ↓                                            │
│  TMT Concepts (Thai Medical Terminology)        │
│                                                 │
└─────────────────────────────────────────────────┘
         ↓                    ↓
    Inventory            Ministry
    Operations          Reporting
```

### Technology Stack

- **Backend:** Fastify + TypeORM (Knex migrations)
- **Frontend:** Angular 17+ (Standalone Components + Signals)
- **Database:** PostgreSQL 16 (schema: `inventory`)
- **UI Library:** Angular Material + TailwindCSS
- **Shared Components:** `@aegisx/ui` + local `shared/ui/components/tmt`

---

## 🗄️ Database Schema

### Core Tables (Existing)

#### 1. inventory.drugs (1,169 records)

```sql
CREATE TABLE inventory.drugs (
  id                  SERIAL PRIMARY KEY,
  drug_code           VARCHAR(24) NOT NULL UNIQUE,  -- 24 chars exactly
  trade_name          VARCHAR(200) NOT NULL,
  generic_id          INTEGER NOT NULL REFERENCES inventory.drug_generics(id),
  manufacturer_id     INTEGER NOT NULL REFERENCES inventory.companies(id),
  tmt_tpu_id          INTEGER REFERENCES inventory.tmt_concepts(id),
  nlem_status         inventory.nlem_status NOT NULL,
  drug_status         inventory.drug_status NOT NULL,
  product_category    inventory.product_category NOT NULL,
  status_changed_date DATE,
  unit_price          NUMERIC(10,2),
  package_size        INTEGER,
  package_unit        VARCHAR(20),
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_drugs_generic ON inventory.drugs(generic_id);
CREATE INDEX idx_drugs_manufacturer ON inventory.drugs(manufacturer_id);
CREATE INDEX idx_drugs_tmt ON inventory.drugs(tmt_tpu_id);
CREATE INDEX idx_drugs_nlem ON inventory.drugs(nlem_status);
CREATE INDEX idx_drugs_status ON inventory.drugs(drug_status);
CREATE INDEX idx_drugs_category ON inventory.drugs(product_category);
CREATE INDEX idx_drugs_trade_name ON inventory.drugs(trade_name);
```

#### 2. inventory.drug_generics

```sql
CREATE TABLE inventory.drug_generics (
  id                SERIAL PRIMARY KEY,
  working_code      VARCHAR(7) NOT NULL UNIQUE,  -- 7 chars exactly
  generic_name      VARCHAR(200) NOT NULL,
  dosage_form       VARCHAR(50),
  strength_unit     VARCHAR(20),
  dosage_form_id    INTEGER REFERENCES inventory.dosage_forms(id),
  strength_unit_id  INTEGER REFERENCES inventory.drug_units(id),
  strength_value    NUMERIC(10,2),

  -- ED Classification
  ed_category       inventory."EdCategory",
  ed_list           INTEGER,
  ed_group_id       INTEGER REFERENCES inventory.ed_groups(id),

  -- TMT Mappings (hierarchy)
  tmt_gpu_code      VARCHAR(10),
  tmt_gpu_id        BIGINT,
  tmt_vtm_code      VARCHAR(10),
  tmt_vtm_id        BIGINT,
  tmt_gp_code       VARCHAR(10),
  tmt_gp_id         BIGINT,
  tmt_gpf_code      VARCHAR(10),
  tmt_gpf_id        BIGINT,
  tmt_gpx_code      VARCHAR(10),
  tmt_gpx_id        BIGINT,
  tmt_code          VARCHAR(10),

  -- Additional Info
  therapeutic_group VARCHAR(50),
  composition       VARCHAR(100),
  standard_unit     VARCHAR(10),
  sale_unit         VARCHAR(10),
  ven_category      inventory."VenCategory",
  hosp_list         INTEGER,
  last_buy_cost     NUMERIC(12,2),
  last_vendor_code  VARCHAR(6),

  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. inventory.drug_components

```sql
CREATE TABLE inventory.drug_components (
  id              SERIAL PRIMARY KEY,
  generic_id      INTEGER NOT NULL REFERENCES inventory.drug_generics(id),
  component_name  VARCHAR(200) NOT NULL,
  strength        VARCHAR(50),
  strength_value  NUMERIC(10,4),
  strength_unit   VARCHAR(20),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example: Paracetamol + Caffeine
-- Row 1: generic_id=123, component_name='Paracetamol', strength_value=500, strength_unit='mg'
-- Row 2: generic_id=123, component_name='Caffeine', strength_value=50, strength_unit='mg'
```

#### 4. inventory.drug_pack_ratios

```sql
CREATE TABLE inventory.drug_pack_ratios (
  id            SERIAL PRIMARY KEY,
  drug_id       INTEGER NOT NULL REFERENCES inventory.drugs(id),
  company_id    INTEGER REFERENCES inventory.companies(id),
  pack_size     INTEGER NOT NULL,
  pack_unit     VARCHAR(20) NOT NULL,
  unit_per_pack NUMERIC(10,2) NOT NULL,
  pack_price    NUMERIC(10,2),
  is_default    BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example: Tylenol 500mg
-- Row 1: drug_id=201, pack_size=100, pack_unit='tablets', unit_per_pack=100, is_default=true
-- Row 2: drug_id=201, pack_size=1000, pack_unit='tablets', unit_per_pack=1000, is_default=false
```

#### 5. inventory.drug_focus_lists

```sql
CREATE TABLE inventory.drug_focus_lists (
  id          SERIAL PRIMARY KEY,
  drug_id     INTEGER REFERENCES inventory.drugs(id),
  generic_id  INTEGER REFERENCES inventory.drug_generics(id),
  list_type   inventory.focus_list_type NOT NULL,  -- 'ED', 'NLEM', 'HOSPITAL'
  priority    INTEGER,
  notes       TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Enums

```sql
CREATE TYPE inventory.nlem_status AS ENUM ('NLEM', 'NON_NLEM', 'PENDING');
CREATE TYPE inventory.drug_status AS ENUM ('ACTIVE', 'DISCONTINUED', 'RESTRICTED', 'PENDING');
CREATE TYPE inventory.product_category AS ENUM ('MEDICINE', 'SUPPLEMENT', 'MEDICAL_SUPPLY');
CREATE TYPE inventory."EdCategory" AS ENUM ('E', 'N', 'V', 'NONE');
CREATE TYPE inventory."VenCategory" AS ENUM ('V', 'E', 'N', 'NONE');
CREATE TYPE inventory.focus_list_type AS ENUM ('ED', 'NLEM', 'HOSPITAL');
```

### Relationships

```
companies (manufacturers)
    ↓ (1:N)
drugs ← (referenced by 9 tables)
    ↓ (N:1)
drug_generics ← (referenced by 8 tables)
    ↓ (1:N)
drug_components

drugs
    ↓ (1:N)
drug_pack_ratios

drugs/drug_generics
    ↓ (N:1)
tmt_concepts (76,904 records)
```

Referenced By:

- `inventory.budget_request_items`
- `inventory.drug_distribution_items`
- `inventory.drug_lots`
- `inventory.inventory`
- `inventory.tmt_mappings`
- And 4 more...

---

## ✅ Existing Implementation

### Backend API (Fastify)

#### Drugs CRUD

```
Base URL: /api/inventory/master-data/drugs

POST   /                  Create drug
GET    /:id              Get drug by ID
GET    /                 List drugs (pagination, filters, formats)
PUT    /:id              Update drug
DELETE /:id              Delete drug
```

Features:

- ✅ TypeBox schemas validation
- ✅ Authentication & authorization (RBAC)
- ✅ Flexible response formats (`?format=dropdown`, `?format=minimal`, `?fields=id,name`)
- ✅ Pagination, sorting, filtering

#### Drug Generics CRUD

```
Base URL: /api/inventory/master-data/drugGenerics

POST   /                  Create generic
GET    /:id              Get generic by ID
GET    /                 List generics (pagination, filters, formats)
PUT    /:id              Update generic
DELETE /:id              Delete generic
```

### Frontend (Angular)

#### Drugs Module

```
apps/web/src/app/features/inventory/modules/drugs/
├── components/
│   ├── drugs-list.component.ts            (✅ List with pagination)
│   ├── drugs-list-filters.component.ts    (✅ Filters)
│   ├── drugs-list-header.component.ts     (✅ Header with actions)
│   ├── drugs-form.component.ts            (⚠️ Needs improvement)
│   ├── drugs-create.dialog.ts             (✅ Create dialog)
│   ├── drugs-edit.dialog.ts               (✅ Edit dialog)
│   ├── drugs-view.dialog.ts               (✅ View dialog)
│   └── drugs-import.dialog.ts             (✅ Import from Excel/CSV)
├── services/
│   └── drugs.service.ts                   (✅ API integration)
├── types/
│   └── drugs.types.ts                     (✅ Type definitions)
└── drugs.routes.ts                        (✅ Routing)
```

#### Drug Generics Module

- Same structure as drugs module
- Completely separate from drugs UI

#### Shared TMT Components (EXISTING!)

```
apps/web/src/app/shared/ui/components/tmt/
├── ax-tmt-lookup.component.ts             (✅ Autocomplete with search)
├── ax-tmt-hierarchy.component.ts          (✅ Show hierarchy tree)
├── ax-tmt-badge.component.ts              (✅ Level badge display)
├── ax-tmt-detail-dialog.component.ts      (✅ Detail popup)
├── tmt.service.ts                         (✅ API calls)
└── tmt.types.ts                           (✅ Type definitions)
```

**TMT Lookup Features:**

- ✅ ControlValueAccessor (works with reactive forms)
- ✅ Autocomplete with debounced search
- ✅ TMT level filtering
- ✅ Loading states
- ✅ Clear selection
- ✅ Display TMT hierarchy

---

## 🎯 Proposed Solution

### Option 1: Unified Drug Management Page (RECOMMENDED)

```
┌────────────────────────────────────────────────────────────┐
│  Drug Management                            [+ Create Drug]│
├────────────────────────────────────────────────────────────┤
│  [All Drugs] [Generics] [Focus Lists] [Pack Ratios]       │
├────────────────────────────────────────────────────────────┤
│  🔍 [Search] Generic:[v] Mfg:[v] TMT:[v] Status:[v]        │
├────────────────────────┬───────────────────────────────────┤
│ Master (List)          │ Detail (Selected Item)            │
├────────────────────────┤                                   │
│ ☑ Code   | Trade Name  │ Drug Code: PARA500TAB001          │
│ ☐ PARA.. | Tylenol 500 │ Trade Name: Tylenol 500mg         │
│ ☐ AMX1.. | Amoxil 1000 │                                   │
│                        │ Generic: Paracetamol 500mg TAB    │
│         [1][2][>]      │ Manufacturer: GSK Thailand        │
│                        │                                   │
│                        │ TMT Mapping: ✅ Mapped            │
│                        │  └─ GPU: 796277                   │
│                        │                                   │
│                        │ Pack Ratios:                      │
│                        │  • 1 Box = 100 tablets (default)  │
│                        │  • 1 Carton = 1000 tablets        │
│                        │                                   │
│                        │ [Edit] [Map TMT] [Manage Packs]   │
└────────────────────────┴───────────────────────────────────┘
```

#### Tab 1: All Drugs

- Master-detail layout (MatSidenav)
- Left: Drugs table with selection
- Right: Drug details + generic info + TMT + pack ratios
- Filters: Generic (autocomplete), Manufacturer (autocomplete), TMT status, NLEM, Categories
- Actions: Create, Edit, Delete, Bulk Update, Import, Export

#### Tab 2: Generics

- Generics table with expandable rows
- Expand to show components
- Show drugs using this generic
- TMT hierarchy display
- Actions: Create, Edit, Bulk Map TMT

#### Tab 3: Focus Lists

- ED List, NLEM, Hospital formulary
- Drag-and-drop to reorder
- Quick add/remove drugs

#### Tab 4: Pack Ratios

- Drug → Pack configurations
- Set default pack
- Bulk update prices

---

## 🧩 Component Integration

### Using Existing TMT Components

#### 1. In Drug Form (Create/Edit)

```typescript
// drugs-form.component.ts
import { AxTmtLookupComponent } from '@shared/ui/components/tmt';

@Component({
  // ...
  imports: [
    // ...
    AxTmtLookupComponent,
  ],
  template: `
    <!-- TMT Mapping Field -->
    <ax-tmt-lookup formControlName="tmt_tpu_id" label="TMT Concept" placeholder="Search TMT concept..." [level]="'TPU'" [required]="false" />
  `,
})
export class DrugsFormComponent {
  drugsForm = this.fb.group({
    // ...
    tmt_tpu_id: [null],
  });
}
```

#### 2. In Drug Detail View

```typescript
import { AxTmtHierarchyComponent, AxTmtBadgeComponent } from '@shared/ui/components/tmt';

@Component({
  template: `
    <div class="tmt-section">
      <h3>TMT Mapping</h3>

      @if (drug().tmt_tpu_id) {
        <ax-tmt-badge [level]="tmtLevel()" />
        <ax-tmt-hierarchy [conceptId]="drug().tmt_tpu_id" />
      } @else {
        <p>Not mapped to TMT</p>
        <button (click)="openTmtMapping()">Map to TMT</button>
      }
    </div>
  `
})
```

### Autocomplete for Generic & Manufacturer

```typescript
// Generic Autocomplete
<mat-form-field appearance="outline">
  <mat-label>Generic</mat-label>
  <input matInput
         formControlName="generic_id"
         [matAutocomplete]="autoGeneric">
  <mat-autocomplete #autoGeneric="matAutocomplete"
                    [displayWith]="displayGeneric">
    @for (generic of filteredGenerics(); track generic.id) {
      <mat-option [value]="generic.id">
        {{ generic.working_code }} - {{ generic.generic_name }}
      </mat-option>
    }
  </mat-autocomplete>
</mat-form-field>

// Manufacturer Autocomplete
<mat-form-field appearance="outline">
  <mat-label>Manufacturer</mat-label>
  <input matInput
         formControlName="manufacturer_id"
         [matAutocomplete]="autoManufacturer">
  <mat-autocomplete #autoManufacturer="matAutocomplete"
                    [displayWith]="displayManufacturer">
    @for (company of filteredCompanies(); track company.id) {
      <mat-option [value]="company.id">
        {{ company.company_name }}
      </mat-option>
    }
  </mat-autocomplete>
</mat-form-field>
```

---

## 🚀 Implementation Plan

### Phase 1: Fix Existing Forms (Week 1)

#### 1.1 Improve Drugs Form Component

- [ ] Replace `generic_id` input with autocomplete
  - Fetch from `/api/inventory/master-data/drugGenerics?format=dropdown`
  - Display: `${working_code} - ${generic_name}`
  - Search by name or code
- [ ] Replace `manufacturer_id` input with autocomplete
  - Fetch from `/api/inventory/master-data/companies?format=dropdown`
  - Display: `${company_name}`
- [ ] Add TMT mapping field using `ax-tmt-lookup`
  - FormControl: `tmt_tpu_id`
  - Level filter: TPU (Trade Pack Unit)
  - Optional field

**Files:**

```
apps/web/src/app/features/inventory/modules/drugs/components/
├── drugs-form.component.ts      (MODIFY)
└── drugs-create.dialog.ts       (MODIFY)
└── drugs-edit.dialog.ts         (MODIFY)
```

**Estimated:** 2 days

#### 1.2 Enhance Filters

- [ ] Add Generic filter (autocomplete)
- [ ] Add Manufacturer filter (autocomplete)
- [ ] Add TMT Status filter (Mapped / Unmapped / All)
- [ ] Add Category filters (NLEM, Drug Status, Product Category)

**Files:**

```
apps/web/src/app/features/inventory/modules/drugs/components/
└── drugs-list-filters.component.ts  (MODIFY)
```

**Estimated:** 1 day

#### 1.3 Add TMT Display in List/View

- [ ] Show TMT badge in drugs list
- [ ] Show TMT hierarchy in view dialog
- [ ] Add "Map TMT" action button

**Files:**

```
apps/web/src/app/features/inventory/modules/drugs/components/
├── drugs-list.component.ts      (MODIFY)
└── drugs-view.dialog.ts         (MODIFY)
```

**Estimated:** 1 day

---

### Phase 2: Unified Management Page (Week 2)

#### 2.1 Create Main Component

- [ ] Create `drug-management.component.ts`
- [ ] Tab navigation (MatTabGroup)
- [ ] Shared header with global search
- [ ] Routing setup

**Files:**

```
apps/web/src/app/features/inventory/modules/drug-management/
├── drug-management.component.ts (NEW)
├── drug-management.routes.ts    (NEW)
└── types/
    └── drug-management.types.ts (NEW)
```

**Estimated:** 1 day

#### 2.2 Tab 1: Drugs Master-Detail

- [ ] Master table (left): Drugs list with checkbox selection
- [ ] Detail panel (right): Selected drug info
- [ ] Show generic info inline
- [ ] Show TMT hierarchy (using `ax-tmt-hierarchy`)
- [ ] Quick edit mode

**Files:**

```
apps/web/src/app/features/inventory/modules/drug-management/components/
├── drugs-master-detail.component.ts       (NEW)
├── drugs-detail-panel.component.ts        (NEW)
└── drugs-quick-edit-panel.component.ts    (NEW)
```

**Estimated:** 3 days

#### 2.3 Tab 2: Generics with Components

- [ ] Generics table with expand/collapse rows
- [ ] Expanded row shows components
- [ ] Link to drugs using this generic
- [ ] TMT hierarchy tree view

**Files:**

```
apps/web/src/app/features/inventory/modules/drug-management/components/
├── generics-expandable-table.component.ts (NEW)
└── generic-components-view.component.ts   (NEW)
```

**Estimated:** 2 days

---

### Phase 3: Advanced Features (Week 3)

#### 3.1 Pack Ratios Management

- [ ] Pack configurations table
- [ ] Add/Edit/Delete pack ratios
- [ ] Set default pack
- [ ] Calculate unit prices

**Files:**

```
apps/web/src/app/features/inventory/modules/drug-management/components/
├── pack-ratios-manager.component.ts (NEW)
└── pack-ratio-form.dialog.ts        (NEW)
```

**Estimated:** 2 days

#### 3.2 Bulk Operations

- [ ] Bulk status update
- [ ] Bulk TMT mapping
- [ ] Bulk price adjustment
- [ ] Progress tracking

**Files:**

```
apps/web/src/app/features/inventory/modules/drug-management/components/
├── bulk-operations-panel.component.ts (NEW)
└── bulk-tmt-mapping.dialog.ts         (NEW)
```

**Estimated:** 2 days

#### 3.3 Import/Export Enhancement

- [ ] Enhanced Excel import with validation
- [ ] Export with TMT data
- [ ] Template download

**Estimated:** 1 day

---

## 📝 Technical Notes

### Form Validation

```typescript
// Drug Code: Exactly 24 characters
(Validators.required, Validators.minLength(24), Validators.maxLength(24));

// Generic Working Code: Exactly 7 characters
(Validators.required, Validators.minLength(7), Validators.maxLength(7));
```

### API Integration

```typescript
// Dropdown Format
GET /api/inventory/master-data/drugGenerics?format=dropdown
Response: {
  data: [
    { id: 1, label: '0000123 - Paracetamol 500mg TAB' },
    { id: 2, label: '0000456 - Amoxicillin 500mg CAP' }
  ]
}

// TMT Mapping
GET /api/inventory/tmt/concepts?level=TPU&q=paracetamol
(Uses existing TMT API)
```

### Performance Considerations

- Use virtual scrolling for large lists (>1000 items)
- Debounce autocomplete searches (300ms)
- Lazy load TMT hierarchy
- Cache dropdown options (5 minutes)

---

## 🎨 Design System

### Colors

```scss
// TMT Level Colors (from existing tmt components)
.tmt-vtm {
  @apply bg-purple-100 text-purple-800;
}
.tmt-gp {
  @apply bg-blue-100 text-blue-800;
}
.tmt-gpu {
  @apply bg-green-100 text-green-800;
}
.tmt-tp {
  @apply bg-yellow-100 text-yellow-800;
}
.tmt-tpu {
  @apply bg-orange-100 text-orange-800;
}

// Status Colors
.nlem {
  @apply bg-green-100 text-green-800;
}
.non-nlem {
  @apply bg-gray-100 text-gray-800;
}
.active {
  @apply bg-green-500;
}
.discontinued {
  @apply bg-red-500;
}
```

### Layout

- Use Material Design spacing (8px grid)
- Master panel width: 40% (resizable)
- Detail panel width: 60%
- Tab content padding: 24px
- Card padding: 16px

---

## ✅ Acceptance Criteria

### Phase 1

- [ ] Generic/Manufacturer autocomplete works in form
- [ ] TMT lookup integrated in form
- [ ] Filters include generic/manufacturer/TMT status
- [ ] TMT badge/hierarchy displays in list/view

### Phase 2

- [ ] Unified page with 4 tabs accessible
- [ ] Master-detail layout functional
- [ ] Expandable generics table with components
- [ ] Navigation between tabs preserves filters

### Phase 3

- [ ] Pack ratios CRUD functional
- [ ] Bulk operations work for 10+ items
- [ ] Import/Export includes TMT data

---

## 🔗 References

### Existing Code

- `apps/api/src/modules/inventory/master-data/drugs` - Drug API
- `apps/web/src/app/features/inventory/modules/drugs` - Drug UI
- `apps/web/src/app/shared/ui/components/tmt` - TMT Components

### Related Documentation

- [TMT Lookup Feature](../tmt-lookup/spec.md)
- [Inventory App](../inventory-app/README.md)
- [API Calling Standard](../../../development/api-calling-standard.md)

---

**Last Updated:** 2025-12-12
**Next Review:** When implementation starts
