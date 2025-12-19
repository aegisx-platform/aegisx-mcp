# Requirements Document - Item-Level Budget Control

## Introduction

This feature implements per-item budget control with three levels (NONE/SOFT/HARD) for both quantity and price validation during Purchase Request (PR) creation. The system allows granular budget control per drug/item with configurable variance tolerances, enabling hospitals to enforce different budget policies based on drug importance, cost, and regulatory requirements.

The feature addresses the need for flexible budget enforcement where critical/expensive drugs require strict control (HARD), general medicines allow warnings with justification (SOFT), and low-risk items like vitamins can be purchased without budget checks (NONE).

## Alignment with Product Vision

This feature supports:

- **Granular Control**: Fine-grained budget management at the item level rather than blanket policies
- **Risk-Based Approach**: Different control levels for different drug categories (controlled substances, expensive drugs, general medicines, supplements)
- **Operational Flexibility**: Allows warnings with justifications for SOFT control, balancing control with operational needs
- **Compliance**: Ensures critical/expensive items stay within budget while maintaining audit trails
- **User Experience**: Clear visual feedback (red/yellow/green) and real-time validation during PR creation

## Requirements

### Requirement 1: Configure Item-Level Budget Control

**User Story:** As a Finance Manager, I want to configure budget control settings for each drug item (quantity control type, price control type, variance tolerances), so that I can enforce different budget policies based on drug importance and cost.

#### Acceptance Criteria

1. WHEN viewing a budget request item THEN the system SHALL display controls for quantity_control_type with options: NONE, SOFT, HARD
2. WHEN viewing a budget request item THEN the system SHALL display controls for price_control_type with options: NONE, SOFT, HARD
3. WHEN selecting SOFT or HARD control THEN the system SHALL allow setting variance tolerance percentage (0-100%)
4. IF quantity_control_type is HARD with 10% tolerance THEN the system SHALL allow ±10% variance from planned quantity
5. IF price_control_type is SOFT with 15% tolerance THEN the system SHALL warn (not block) if price exceeds ±15% variance
6. WHEN saving control settings THEN the system SHALL store: quantity_control_type, price_control_type, quantity_variance_percent, price_variance_percent
7. WHEN displaying control settings THEN the system SHALL use visual indicators: 🔴 Red (HARD), 🟡 Yellow (SOFT), ⚪ Gray (NONE)

### Requirement 2: Validate PR Against Budget Control

**User Story:** As a Procurement Officer, I want the system to validate my Purchase Request items against configured budget controls, so that I know which items exceed budget limits before submission.

#### Acceptance Criteria

1. WHEN creating a PR with items THEN the system SHALL call check_item_budget_control() for each item
2. WHEN an item has NONE control THEN the system SHALL skip validation and return status 'OK'
3. WHEN an item is within tolerance THEN the system SHALL return status 'OK'
4. WHEN an item exceeds tolerance with SOFT control THEN the system SHALL return status 'WARNING'
5. WHEN an item exceeds tolerance with HARD control THEN the system SHALL return status 'BLOCKED'
6. IF any item has status 'BLOCKED' THEN the system SHALL prevent PR submission with error BUDGET_CONTROL_BLOCKED
7. IF any item has status 'WARNING' and no reason provided THEN the system SHALL prevent submission with error BUDGET_EXCEED_REASON_REQUIRED
8. WHEN validation completes THEN the system SHALL return details: quantity status, price status, planned qty, purchased qty, remaining qty, requested qty, diff percentage

### Requirement 3: Display Budget Validation Results in UI

**User Story:** As a Procurement Officer, I want to see clear visual feedback about budget validation results (errors, warnings, passed), so that I can understand which items need attention and what actions to take.

#### Acceptance Criteria

1. WHEN PR validation returns HARD blocks THEN the system SHALL display a red expandable alert box at the top of the form
2. WHEN PR validation returns SOFT warnings THEN the system SHALL display a yellow expandable alert box
3. WHEN displaying errors/warnings THEN the system SHALL show per-item breakdown: drug name, planned qty/amount, purchased qty/amount, remaining qty/amount, requested qty/amount, exceeded amount/percentage
4. IF SOFT warnings exist THEN the system SHALL display a textarea requiring the user to enter justification
5. WHEN HARD errors exist THEN the system SHALL disable the submit button with a lock icon (🔒)
6. WHEN all items pass validation THEN the system SHALL show green status badges (✅ Passed)
7. WHEN items have SOFT warnings with reason provided THEN the system SHALL enable submit button
8. WHEN expanding alert boxes THEN the system SHALL use accordion UI with expand/collapse icons (▼/▲)

### Requirement 4: Provide Real-Time Impact Preview

**User Story:** As a Finance Manager, I want to see real-time examples of how my control settings will affect PR creation, so that I can understand the impact before saving the configuration.

#### Acceptance Criteria

1. WHEN changing control type or variance percentage THEN the system SHALL display a "ผลกระทบจากการตั้งค่า" (Impact Preview) section
2. WHEN previewing impact THEN the system SHALL show example scenarios: ✅ Allowed, ❌ Blocked, ⚠️ Warning
3. WHEN showing examples THEN the system SHALL calculate based on current quarter's remaining budget
4. IF quantity control is HARD ±10% and remaining is 2,500 units THEN preview SHALL show: ✅ 2,500 units allowed, ❌ 3,000 units blocked (+20%)
5. IF price control is SOFT ±15% and planned price is 2.50 baht THEN preview SHALL show: ⚠️ 2.60 baht warning (+4%), ❌ 3.00 baht blocked (+20%)
6. WHEN control settings change THEN the preview SHALL update immediately without page reload

### Requirement 5: Budget Dashboard with Item Status

**User Story:** As a Finance Manager, I want to view a dashboard showing budget status for all items with visual indicators, so that I can quickly identify items that need attention or are approaching budget limits.

#### Acceptance Criteria

1. WHEN viewing budget dashboard THEN the system SHALL display summary cards: Total Budget, Used Budget, Remaining Budget
2. WHEN displaying summary THEN the system SHALL show breakdown by control type: HARD count, SOFT count, NONE count
3. WHEN listing items THEN the system SHALL show status badges: 🔴 Exceeded, 🟡 Warning (near limit), ✅ Normal
4. WHEN displaying item rows THEN the system SHALL show dual progress bars: one for budget amount, one for quantity
5. IF item usage is less than 80% THEN progress bar SHALL be green
6. IF item usage is 80-99% THEN progress bar SHALL be yellow
7. IF item usage is 100% or more THEN progress bar SHALL be red
8. WHEN filtering items THEN the system SHALL allow filter by: control type (HARD/SOFT/NONE), status (normal/warning/exceeded)
9. WHEN clicking an item THEN the system SHALL show related PRs that consumed the budget

### Requirement 6: Recommended Control Settings

**User Story:** As a Finance Manager, I want to see recommended control settings based on drug category, so that I can quickly configure appropriate controls without manual analysis.

#### Acceptance Criteria

1. WHEN opening item settings modal THEN the system SHALL display a recommendations table showing suggested settings by drug type
2. IF drug is "ยาควบคุมพิเศษ" (controlled substance) THEN system SHALL recommend: Quantity HARD ±0%, Price HARD ±0%
3. IF drug price > 100 baht/unit THEN system SHALL recommend: Quantity HARD ±5%, Price SOFT ±10%
4. IF drug is essential medicine (Essential Drug List) THEN system SHALL recommend: Quantity SOFT ±10%, Price SOFT ±15%
5. IF drug is vitamin/supplement THEN system SHALL recommend: Quantity NONE, Price NONE
6. WHEN clicking "ใช้การตั้งค่าแนะนำ" button THEN system SHALL auto-fill controls based on drug category
7. WHEN displaying recommendations THEN system SHALL show reasoning: "เคร่งครัด" (strict), "ควบคุมต้นทุน" (cost control), "ยืดหยุ่นได้" (flexible), "ไม่จำเป็น" (not needed)

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: Separate database functions for budget checking, separate UI components for validation display
- **Modular Design**: Budget control logic in PostgreSQL function, validation in service layer, UI components reusable
- **Dependency Management**: PR validation depends on budget request item configuration but is loosely coupled
- **Clear Interfaces**: check_item_budget_control() function with well-defined input/output contract

### Performance

- **Validation Speed**: PR validation should complete within 500ms for 50 items (10ms per item)
- **Database Queries**: Use batch processing for multiple items (Promise.all) to avoid sequential bottleneck
- **UI Responsiveness**: Real-time preview should update within 100ms of user input change
- **Progress Bar Rendering**: Dashboard should render 1,000+ items with virtual scrolling

### Security

- **Permission-Based Access**: Control configuration requires `budgetRequests:update` permission
- **Audit Trail**: Log all control setting changes with user ID and timestamp
- **Input Validation**: Variance percentage must be 0-100, control type must be NONE/SOFT/HARD
- **SQL Injection Prevention**: Use parameterized queries in check_item_budget_control() function

### Reliability

- **Graceful Degradation**: If budget check fails, system should warn but not block PR creation entirely
- **Data Integrity**: Variance percentages stored as integers (0-100), control types validated by CHECK constraint
- **Error Handling**: Clear error messages distinguishing HARD blocks vs SOFT warnings vs validation failures
- **Backward Compatibility**: Items without control settings default to SOFT with 10% quantity, 15% price tolerance

### Usability

- **Visual Clarity**: Use color coding (red/yellow/green) and icons (🔴🟡⚪) for quick understanding
- **Progressive Disclosure**: Use expandable accordion for error/warning details to avoid cluttering the UI
- **Contextual Help**: Show examples and tooltips explaining NONE/SOFT/HARD differences
- **Inline Validation**: Show real-time feedback in item settings modal before saving
- **Responsive Design**: Dashboard and modals work on desktop and tablet screens

## Business Rules

1. **Default Control Levels**: New items default to SOFT control with ±10% quantity tolerance and ±15% price tolerance
2. **Dual Independent Control**: Quantity control and price control are independent; an item can be HARD for quantity but SOFT for price
3. **Quarterly Budget Basis**: Validation checks against current quarter's remaining budget (planned - purchased)
4. **Reason Required for SOFT**: If SOFT warning triggers, user must provide justification before PR submission
5. **HARD Control Blocks**: If HARD control triggers, PR cannot be submitted until quantities/prices are adjusted or budget is amended
6. **Zero Tolerance Option**: Variance percentage of 0% means no deviation allowed (strict enforcement)
7. **Validation Timing**: Budget control validation occurs during PR creation, not during budget request approval

## Out of Scope

- Budget amendment/transfer workflow (separate feature)
- Automatic budget reallocation based on usage patterns
- Multi-currency price control (THB only for now)
- Machine learning for automatic control type recommendations
- Budget forecasting/burn rate predictions
- Integration with vendor contract prices (manual price entry for now)
