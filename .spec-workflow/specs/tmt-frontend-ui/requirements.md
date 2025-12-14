# Requirements Document: TMT Frontend UI

## Introduction

The **TMT Frontend UI** provides an intuitive web interface for managing Thai Medical Terminology (TMT) integration in the INVS Modern Hospital Inventory System. This Angular-based application enables pharmacists and finance managers to:

1. **TMT Mapping Interface** - Search TMT concepts, review AI suggestions, and map hospital drugs to standardized TMT codes
2. **Compliance Dashboard** - Monitor real-time TMT mapping coverage, track progress toward 95% Ministry target, and identify priority unmapped drugs
3. **Ministry Report Generation** - Generate and export TMT mapping data in DMSIC Standards พ.ศ. 2568 format (CSV, Excel, JSON)
4. **Real-time Updates** - Receive instant notifications when new mappings are created or compliance rate changes

**Business Value:**

- **User-Friendly Mapping** - AI-assisted suggestions reduce mapping time from 5 minutes to 30 seconds per drug
- **Visual Compliance Tracking** - Real-time dashboard prevents last-minute compliance issues before Ministry audits
- **Priority-Driven Workflow** - High-usage unmapped drugs highlighted for efficient resource allocation
- **Export Automation** - One-click ministry report generation saves 2-3 hours per quarter

**Context:**

- Connects to TMT Backend API (`tmt-backend-api` spec)
- Built with Angular 18+, AegisX UI, Angular Material, TailwindCSS
- Target users: Pharmacists (mapping), Finance Managers (compliance + export), Department Heads (read-only)
- Current state: 561 drugs mapped (47.99%) → Target: ≥95% (1,111 drugs)

## Alignment with Product Vision

This UI directly supports INVS Modern system goals:

1. **Ministry Compliance** (from BRD Section 1.2)
   - Visual compliance tracker prevents falling below 95% threshold
   - Automated DRUGLIST export ensures correct TMT codes in Ministry reports
   - Quarterly export history for audit trail

2. **Data-Driven Decisions** (from BRD Section 1.2)
   - Real-time compliance rate visualization (chart + trend line)
   - Unmapped drugs prioritized by usage count (map high-impact drugs first)
   - Compliance trend analysis (last 6 months) for forecasting

3. **Operational Efficiency**
   - AI suggestions eliminate manual TMT searching (70% time reduction)
   - Batch mapping workflow for new drug batches
   - Single-page application (SPA) with instant navigation

## Requirements

### Requirement 1: TMT Concept Search and Browse Interface

**User Story:** As a **pharmacist**, I want to **search and browse TMT concepts using Thai/English keywords with fuzzy matching**, so that **I can quickly find the correct TMT standard code to map to hospital drugs**.

#### Acceptance Criteria

1. WHEN pharmacist types in search box THEN system SHALL display live search results within 500ms with partial matching (e.g., "Paracet" matches "Paracetamol")
2. WHEN pharmacist filters by TMT level (VTM/GP/GPU/TP/TPU) THEN system SHALL show only concepts at selected hierarchy level with filter badge
3. WHEN pharmacist views a TMT concept THEN system SHALL display full hierarchy tree (parent → current → children) in expandable panel
4. WHEN search returns >20 results THEN system SHALL paginate with "Load More" button or infinite scroll (configurable)
5. IF search returns 0 results THEN system SHALL show "ไม่พบข้อมูล TMT ที่ตรงกับคำค้นหา" with suggestion to broaden search
6. WHEN pharmacist clicks a TMT concept THEN system SHALL highlight the concept and show detail panel with FSN, preferred term, concept code, level, and children count

**UI Components:**

- `ax-input` for search box (with debounce 300ms)
- `ax-select` for TMT level filter (multi-select)
- `ax-table` for search results (sortable, paginated)
- `ax-badge` for TMT level tags (VTM=blue, GP=green, GPU=purple, TP=orange, TPU=red)
- `ax-drawer` or `ax-expansion-panel` for hierarchy tree

---

### Requirement 2: Drug-to-TMT Mapping Interface

**User Story:** As a **pharmacist**, I want to **create and verify drug-to-TMT mappings with visual confirmation**, so that **I can ensure correct mapping and meet pharmacist verification requirements**.

#### Acceptance Criteria

1. WHEN pharmacist opens mapping dialog for a drug THEN system SHALL display drug details (trade name, generic name, strength, dosage form) and TMT search interface
2. WHEN pharmacist selects a TMT concept THEN system SHALL show mapping preview with hierarchy path (e.g., "VTM: Paracetamol → GP: Paracetamol 500mg Tab")
3. WHEN pharmacist attempts to map drug already mapped THEN system SHALL show warning dialog: "ยานี้มี TMT mapping แล้ว คุณต้องการแก้ไขหรือไม่?" with [Cancel] [Edit Mapping] buttons
4. WHEN pharmacist saves mapping THEN system SHALL require pharmacist verification checkbox and verify user role is "Pharmacist" or "Finance Manager"
5. IF selected TMT level is VTM or TPU THEN system SHALL show warning badge: "⚠️ แนะนำใช้ระดับ GP หรือ TP สำหรับการแม็พ" (allow override)
6. WHEN mapping is saved successfully THEN system SHALL show success snackbar: "✅ บันทึก TMT mapping สำเร็จ" and close dialog
7. IF save fails THEN system SHALL show error snackbar with specific error message (e.g., "❌ ไม่พบ TMT concept ที่เลือก")

**UI Components:**

- `mat-dialog` for mapping modal (full-screen on mobile, centered on desktop)
- `ax-form` for mapping form (drug info + TMT selection)
- `mat-checkbox` for pharmacist verification
- `mat-snackbar` for success/error notifications
- `ax-badge` for warning indicators
- `ax-button` for actions (Save, Cancel)

---

### Requirement 3: AI Suggestion Review and Acceptance UI

**User Story:** As a **pharmacist**, I want to **review AI-suggested TMT matches with visual confidence indicators**, so that **I can quickly accept high-confidence suggestions or manually verify low-confidence matches**.

#### Acceptance Criteria

1. WHEN mapping dialog opens THEN system SHALL automatically fetch AI suggestions and display them in priority order (highest confidence first)
2. WHEN displaying suggestions THEN system SHALL show confidence score as percentage and visual indicator:
   - **HIGH** (≥90%): Green badge ●●●●● + "แนะนำ" label
   - **MEDIUM** (70-89%): Yellow badge ●●●○○ + "ควรตรวจสอบ" label
   - **LOW** (<70%): Red badge ●●○○○ + "ต้องตรวจสอบด้วยตนเอง" label
3. WHEN displaying suggestion THEN system SHALL show match breakdown (e.g., "✓ Name matched, ✓ Strength matched, ○ Form not matched")
4. WHEN pharmacist clicks "Use This Suggestion" THEN system SHALL auto-fill TMT concept in mapping form
5. IF no suggestions found THEN system SHALL show message: "ไม่พบคำแนะนำจากระบบ กรุณาค้นหา TMT ด้วยตนเอง" with manual search box below
6. WHEN pharmacist hovers over confidence score THEN system SHALL show tooltip explaining scoring algorithm (Name 50%, Strength 30%, Form 20%)

**UI Components:**

- `ax-card` for suggestion list (stacked, top 5 suggestions)
- `ax-badge` for confidence level indicator
- `ax-progress` or custom bar chart for confidence score visualization
- `mat-tooltip` for score explanation
- `ax-button` for "Use This Suggestion" action
- `ax-icon` for match breakdown checkmarks (✓/○)

---

### Requirement 4: Compliance Dashboard and Monitoring

**User Story:** As a **finance manager** or **pharmacist**, I want to **view real-time TMT mapping compliance rate with visual progress indicators and unmapped drug list**, so that **I can track progress toward 95% Ministry target and prioritize mapping work**.

#### Acceptance Criteria

1. WHEN user loads compliance dashboard THEN system SHALL display compliance rate as percentage, progress bar, and status badge:
   - **COMPLIANT** (≥95%): Green progress bar + "✅ ผ่านเกณฑ์ กระทรวง" badge
   - **NON_COMPLIANT** (<95%): Red progress bar + "⚠️ ต้องเพิ่ม mapping" badge with remaining count (e.g., "ต้องแม็พเพิ่มอีก 50 รายการ")
2. WHEN displaying statistics THEN system SHALL show breakdown:
   - Total active drugs (e.g., "1,169 รายการ")
   - Mapped & verified (e.g., "561 รายการ (47.99%)")
   - Unmapped (e.g., "608 รายการ (52.01%)")
   - High-priority unmapped count (>7 days, high usage)
3. WHEN displaying unmapped drugs table THEN system SHALL sort by usage count descending and show:
   - Drug code, trade name, generic name
   - Usage count (last month)
   - Days unmapped (calculated from created_at)
   - **[Map]** button per row to open mapping dialog
4. WHEN user clicks **[Map]** button THEN system SHALL open mapping dialog pre-populated with drug data
5. WHEN displaying compliance trend THEN system SHALL show line chart with last 6 months data points and target threshold line at 95%
6. IF compliance rate < 95% THEN system SHALL show alert banner at top: "⚠️ อัตราการแม็พ TMT ต่ำกว่าเกณฑ์ กระทรวง (95%) กรุณาเพิ่ม mapping"

**UI Components:**

- `ax-card` for statistics cards (4 cards: Total, Mapped, Unmapped, Compliance Rate)
- `ax-progress` for compliance progress bar
- `ax-badge` for status indicators
- `ax-chart` for compliance trend line chart (Chart.js or ngx-charts)
- `ax-table` for unmapped drugs table (sortable, searchable, paginated)
- `mat-alert` or custom alert banner for non-compliance warning
- `ax-button` for Map action per row

---

### Requirement 5: Ministry Report Generation and Export UI

**User Story:** As a **finance manager**, I want to **generate and download TMT mapping data in Ministry-compliant format with visual export progress**, so that **I can submit quarterly DMSIC reports to MOPH efficiently**.

#### Acceptance Criteria

1. WHEN user clicks "Generate Ministry Report" THEN system SHALL show export dialog with format selection (CSV, Excel, JSON) and date range picker
2. WHEN user selects export format and clicks "Export" THEN system SHALL show loading spinner with progress message: "กำลังสร้างรายงาน... (0/1169)"
3. WHEN export is generating THEN system SHALL update progress in real-time (e.g., "กำลังสร้างรายงาน... (500/1169)")
4. WHEN export completes THEN system SHALL automatically download file with filename format: `DRUGLIST_TMT_{YYYYMMDD}_{HHMMSS}.{ext}` (e.g., `DRUGLIST_TMT_20250122_143022.csv`)
5. IF compliance rate < 95% during export THEN system SHALL show warning dialog before export: "⚠️ อัตราการแม็พต่ำกว่า 95% รายงานจะมีหมายเหตุแจ้งเตือน" with [Cancel] [Continue Export] buttons
6. WHEN export succeeds THEN system SHALL show success snackbar: "✅ ดาวน์โหลดรายงาน TMT เรียบร้อย" and save export metadata (timestamp, format, compliance_rate) to history
7. WHEN user views export history THEN system SHALL show list of past exports with download links (last 10 exports)

**UI Components:**

- `mat-dialog` for export dialog
- `mat-radio-group` for format selection (CSV, Excel, JSON)
- `mat-datepicker` for date range (optional filter)
- `ax-progress` or `mat-progress-bar` for export progress
- `mat-spinner` for loading state
- `ax-button` for Export action
- `ax-table` for export history list

---

### Requirement 6: Real-time Updates and Notifications

**User Story:** As a **pharmacist** or **finance manager**, I want to **receive real-time notifications when new TMT mappings are created or compliance rate changes**, so that **I can stay updated without manually refreshing the page**.

#### Acceptance Criteria

1. WHEN user is on compliance dashboard AND another user creates a new mapping THEN system SHALL update compliance rate, statistics, and unmapped drugs list automatically without page refresh
2. WHEN compliance rate crosses 95% threshold (from below to above) THEN system SHALL show celebration toast: "🎉 ยินดีด้วย! ผ่านเกณฑ์ กระทรวงแล้ว (95%)"
3. WHEN new mapping is created by another user THEN system SHALL show snackbar notification: "ℹ️ มีการแม็พยาใหม่ 1 รายการ (โดย: [pharmacist_name])" with "View" button
4. WHEN user clicks "View" on notification THEN system SHALL scroll to updated drug in table and highlight row for 3 seconds
5. IF WebSocket connection is lost THEN system SHALL show warning banner: "⚠️ การเชื่อมต่อขาดหาย กำลังเชื่อมต่อใหม่..." and retry connection every 5 seconds
6. WHEN WebSocket reconnects THEN system SHALL hide warning banner and reload latest data

**UI Components:**

- `mat-snackbar` for real-time notifications (auto-dismiss after 5 seconds)
- Custom toast component for celebration message
- `mat-alert` banner for connection status
- WebSocket service (Angular service using RxJS)
- Signal-based state management for reactive updates

---

## Non-Functional Requirements

### Code Architecture and Modularity

**Angular 18+ Architecture with Signals:**

- **Single Responsibility Principle**: Each component handles one UI concern (e.g., `TmtSearchComponent`, `MappingDialogComponent`, `ComplianceDashboardComponent`)
- **Modular Design**:
  - **Feature Module**: `TmtModule` (lazy-loaded route)
  - **Components**: Organized by feature (search/, mapping/, compliance/, export/)
  - **Services**: API client, WebSocket, State management
  - **Signals**: Reactive state (compliance rate, unmapped drugs list, search results)
  - **Shared**: Reusable components (TMTConceptCard, ConfidenceBadge, HierarchyTree)
- **Dependency Management**:
  - Use Angular DI for services
  - AegisX UI components via imports
  - Angular Material modules selectively imported
- **Clear Interfaces**: TypeScript interfaces for API DTOs (match backend schemas)
- **File Structure**:
  ```
  apps/web/src/app/features/tmt/
  ├── components/
  │   ├── search/
  │   │   ├── tmt-search.component.ts
  │   │   ├── tmt-search.component.html
  │   │   └── tmt-search.component.scss
  │   ├── mapping/
  │   │   ├── mapping-dialog.component.ts
  │   │   ├── ai-suggestions.component.ts
  │   │   └── mapping-form.component.ts
  │   ├── compliance/
  │   │   ├── compliance-dashboard.component.ts
  │   │   ├── compliance-chart.component.ts
  │   │   └── unmapped-drugs-table.component.ts
  │   └── export/
  │       ├── export-dialog.component.ts
  │       └── export-history.component.ts
  ├── services/
  │   ├── tmt-api.service.ts         # HTTP client for TMT endpoints
  │   ├── tmt-websocket.service.ts   # WebSocket for real-time updates
  │   ├── tmt-state.service.ts       # Signal-based state management
  │   └── export.service.ts          # File download utilities
  ├── models/
  │   ├── tmt-concept.model.ts
  │   ├── tmt-mapping.model.ts
  │   └── compliance-stats.model.ts
  ├── tmt.routes.ts                  # Lazy-loaded routes
  └── tmt.module.ts                  # Feature module
  ```

### Performance

1. **Page Load Time**
   - Initial page load MUST complete within 2 seconds (including API calls)
   - Lazy load TMT module (reduce main bundle by ~200KB)
   - Use Angular defer blocks for below-the-fold content (compliance chart, export history)

2. **Search Responsiveness**
   - Search results MUST appear within 500ms of user input
   - Implement debounce (300ms) on search input
   - Use virtual scrolling (`cdk-virtual-scroll-viewport`) for >100 search results
   - Cache TMT concepts in service (1-hour TTL) to reduce API calls

3. **Real-time Updates**
   - WebSocket updates MUST reflect in UI within 1 second
   - Use Angular Signals for reactive state (auto-update components)
   - Batch WebSocket messages (max 1 update per second to avoid UI flicker)

4. **Rendering Optimization**
   - Use `OnPush` change detection strategy for all components
   - Implement `trackBy` functions for `*ngFor` loops (drug lists, search results)
   - Limit compliance trend chart to 6 data points (reduce SVG complexity)

### Security

1. **Authentication**
   - ALL routes require JWT authentication (redirect to login if missing)
   - Token stored in `HttpOnly` cookie (prevent XSS)
   - Auto-refresh token on API 401 response

2. **Authorization (RBAC)**
   - **Finance Manager**: Full access (view, map, export)
   - **Pharmacist**: Full access (view, map, export)
   - **Department Head**: Read-only (view compliance, no mapping/export)
   - **Nurse**: Read-only (view compliance, no mapping/export)
   - **Other Staff**: No access (redirect to 403 Forbidden page)
   - Use Angular route guards (`canActivate`) for role-based route protection

3. **Input Sanitization**
   - Sanitize all user inputs (search queries, form fields) to prevent XSS
   - Use Angular's built-in DomSanitizer for dynamic HTML content
   - Validate TMT concept IDs as UUIDs before API calls

4. **Data Protection**
   - Use HTTPS for all API calls (enforce in production)
   - Do not store sensitive data in localStorage (use sessionStorage or in-memory only)
   - Clear session data on logout

### Reliability

1. **Error Handling**
   - Use custom error interceptor to catch all HTTP errors
   - Show user-friendly error messages (Thai language):
     - 401: "กรุณาเข้าสู่ระบบอีกครั้ง"
     - 403: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้"
     - 404: "ไม่พบข้อมูลที่ต้องการ"
     - 500: "เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง"
   - Log all errors to console (dev mode) and error tracking service (production)

2. **Offline Handling**
   - Detect network status using `navigator.onLine`
   - Show offline banner: "⚠️ ไม่มีการเชื่อมต่ออินเทอร์เน็ต ฟีเจอร์บางอย่างอาจใช้งานไม่ได้"
   - Queue critical actions (mapping saves) for retry when online (optional)

3. **Graceful Degradation**
   - If WebSocket fails, fallback to polling (every 30 seconds)
   - If compliance chart library fails to load, show static statistics table
   - If AI suggestions API timeout, still allow manual search

### Usability

1. **Responsive Design**
   - Support mobile (320px+), tablet (768px+), desktop (1024px+)
   - Use TailwindCSS breakpoints: `sm:`, `md:`, `lg:`, `xl:`
   - Mobile: Stack cards vertically, full-screen dialogs
   - Desktop: Side-by-side layout, centered dialogs (max-width 800px)

2. **Accessibility (WCAG 2.1 Level AA)**
   - All interactive elements MUST have ARIA labels
   - Color contrast ratio ≥ 4.5:1 (text vs background)
   - Keyboard navigation support (Tab, Enter, Esc)
   - Screen reader announcements for live updates (ARIA live regions)

3. **Language**
   - Primary language: Thai (all UI labels, messages)
   - Support Thai and English in TMT concept data (display both)
   - Use Thai numerals for counts (optional: format 1,234 as "1,234")

4. **User Feedback**
   - Show loading spinners for all async operations (API calls, export)
   - Disable buttons during loading to prevent double-clicks
   - Show success/error snackbars for all user actions (save, export, delete)
   - Use animations for state transitions (e.g., progress bar, compliance rate change)

### Scalability

1. **Data Handling**
   - Support up to 100,000 TMT concepts (virtual scrolling required)
   - Support up to 50,000 drug mappings (paginate unmapped drugs table)
   - Limit compliance trend chart to 12 months max (performance)

2. **Caching Strategy**
   - Cache TMT concepts in service memory (1-hour TTL)
   - Cache compliance statistics for 5 minutes (reduce backend load)
   - Invalidate cache on new mapping creation

3. **Bundle Optimization**
   - Lazy load TMT module (only load when user navigates to /tmt route)
   - Code split AegisX UI components (tree-shaking)
   - Use Angular production build optimizations (AOT, minification)

### Maintainability

1. **Code Standards**
   - Follow Angular style guide (https://angular.io/guide/styleguide)
   - Use TypeScript strict mode (`strict: true`)
   - ESLint + Prettier for code formatting
   - Unit test coverage ≥ 70% (components, services)

2. **Testing**
   - Unit tests: Jest for services, Jasmine for components
   - Integration tests: Test component + service interactions
   - E2E tests: Playwright for critical flows (mapping workflow, export)

3. **Documentation**
   - JSDoc comments for all public methods
   - Component README for complex components (ComplianceDashboardComponent)
   - Storybook for AegisX UI component showcase (optional)

### Compatibility

1. **Browser Support**
   - Chrome 90+ (primary)
   - Firefox 88+
   - Safari 14+
   - Edge 90+
   - No IE11 support (Angular 18+ requirement)

2. **API Integration**
   - Use TMT Backend API endpoints from `tmt-backend-api` spec
   - API base URL configurable via environment variables (`environment.ts`)
   - WebSocket URL configurable (e.g., `ws://localhost:3000/tmt-events`)

3. **Framework Versions**
   - Angular 18+ (standalone components, Signals)
   - AegisX UI latest version (check for breaking changes)
   - Angular Material 18+ (compatible with Angular version)
   - TailwindCSS 3.4+
