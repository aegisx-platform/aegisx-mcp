# Feature Development Standard

> **🚨 MANDATORY STANDARD** - This standard MUST be followed for every feature development to ensure quality, maintainability, and prevent conflicts in multi-feature environments.

## 📋 **Feature Development Lifecycle**

### Phase 1: Planning & Documentation (MANDATORY)

### Phase 2: Backend Implementation

### Phase 3: Frontend Implementation

### Phase 4: Integration & Testing

### Phase 5: Documentation & Deployment

---

## 🎯 **Phase 1: Planning & Documentation (MANDATORY)**

### 📁 **Create Feature Structure**

Before writing any code, create feature documentation:

```bash
# Create feature directory structure
docs/features/[feature-name]/
├── FEATURE.md          # Feature overview and requirements
├── TASKS.md           # Detailed task breakdown
├── PROGRESS.md        # Progress tracking
└── API_CONTRACTS.md   # API specifications (if backend changes)
```

### 📄 **FEATURE.md Template**

```markdown
# [Feature Name]

**Status**: 🟡 In Progress / ✅ Completed / 🔴 Blocked / ⏸️ Paused  
**Priority**: High / Medium / Low  
**Branch**: feature/[feature-name]  
**Started**: YYYY-MM-DD  
**Target**: YYYY-MM-DD

## 📋 Requirements

**User Story**: As a [user type], I want to [action] so that [benefit]

### Functional Requirements

- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Non-Functional Requirements

- [ ] Performance: [specific criteria]
- [ ] Security: [specific requirements]
- [ ] Accessibility: [WCAG compliance level]

## 🎯 Success Criteria

### Backend

- [ ] All API endpoints working
- [ ] Database changes applied
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing

### Frontend

- [ ] All components implemented
- [ ] UI/UX matches design
- [ ] Responsive design working
- [ ] Component tests passing

### Integration

- [ ] Frontend-backend integration working
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] E2E tests passing

## 🚨 Conflict Prevention

### Database Changes

- [ ] Tables/columns reserved: [list]
- [ ] Migration order planned
- [ ] No conflicts with other features

### API Changes

- [ ] Endpoints reserved: [list]
- [ ] Schemas documented
- [ ] Backward compatibility maintained

### Frontend Changes

- [ ] Routes reserved: [list]
- [ ] Components planned
- [ ] Shared utilities documented

## 📊 Dependencies

### Depends On

- [ ] Feature: [name] - [reason]
- [ ] Library: [name] - [version]

### Blocks

- [ ] Feature: [name] - [reason]

## 🎨 Design Decisions

### Architecture

- **Pattern**: [REST/GraphQL/etc.]
- **Database**: [approach/changes]
- **Frontend**: [state management approach]

### Technology Choices

- **Backend**: [specific libraries/frameworks]
- **Frontend**: [specific libraries/components]
- **Testing**: [testing strategy]
```

### 📋 **TASKS.md Template**

```markdown
# [Feature Name] - Task Breakdown

## 🔧 Backend Tasks

### Phase 1: Database & Models

- [ ] Create/modify database migrations
  - [ ] Tables: [list]
  - [ ] Indexes: [list]
  - [ ] Constraints: [list]
- [ ] Create/update TypeBox schemas
  - [ ] Request schemas
  - [ ] Response schemas
  - [ ] Validation rules

### Phase 2: API Layer

- [ ] Repository layer
  - [ ] CRUD operations
  - [ ] Query methods
  - [ ] Transaction handling
- [ ] Service layer
  - [ ] Business logic
  - [ ] Validation
  - [ ] Error handling
- [ ] Controller layer
  - [ ] Route handlers
  - [ ] Request validation
  - [ ] Response formatting

### Phase 3: API Documentation

- [ ] OpenAPI/Swagger specs
- [ ] Route registration
- [ ] Schema registration
- [ ] Test endpoints

## 🎨 Frontend Tasks

### Phase 1: Core Components

- [ ] List component
  - [ ] Data display
  - [ ] Pagination
  - [ ] Filtering/Search
- [ ] Form component
  - [ ] Create mode
  - [ ] Edit mode
  - [ ] Validation
- [ ] Detail component
  - [ ] View mode
  - [ ] Actions

### Phase 2: State Management

- [ ] Service implementation
  - [ ] Signal-based state
  - [ ] HTTP integration
  - [ ] Error handling
- [ ] Type definitions
  - [ ] Interface matching backend
  - [ ] Request/Response types

### Phase 3: Routing & Navigation

- [ ] Route configuration
- [ ] Navigation updates
- [ ] Permission guards
- [ ] Breadcrumbs

### Phase 4: UI/UX Polish

- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Success feedback
- [ ] Responsive design
- [ ] Accessibility (ARIA labels, keyboard navigation)

## 🧪 Testing Tasks

### Backend Testing

- [ ] Unit tests
  - [ ] Repository layer (>90% coverage)
  - [ ] Service layer (>90% coverage)
  - [ ] Controller layer (>90% coverage)
- [ ] Integration tests
  - [ ] API endpoints
  - [ ] Database operations
  - [ ] Error scenarios

### Frontend Testing

- [ ] Component tests
  - [ ] Render tests
  - [ ] Interaction tests
  - [ ] Edge cases
- [ ] Service tests
  - [ ] HTTP mocking
  - [ ] State management
  - [ ] Error handling

### E2E Testing

- [ ] Happy path scenarios
- [ ] Error scenarios
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Performance testing

## 📝 Documentation Tasks

- [ ] API documentation updates
- [ ] Component documentation
- [ ] User guide updates
- [ ] Developer documentation
- [ ] CHANGELOG.md updates
```

### 📊 **PROGRESS.md Template**

```markdown
# [Feature Name] - Progress Tracking

**Last Updated**: YYYY-MM-DD HH:MM  
**Overall Progress**: X% (X/Y tasks completed)  
**Current Branch**: feature/[feature-name]

## 📊 Progress Overview
```

Backend : ████████░░ 80% (8/10 tasks)
Frontend : ██████░░░░ 60% (6/10 tasks)  
Testing : ████░░░░░░ 40% (2/5 tasks)
Docs : ██░░░░░░░░ 20% (1/5 tasks)
Overall : ██████░░░░ 60% (17/30 tasks)

```

## ✅ Completed Tasks

### Backend
- [x] Database migrations created
- [x] TypeBox schemas implemented
- [x] Repository layer completed
- [x] Service layer completed
- [x] API endpoints implemented

### Frontend
- [x] Core components created
- [x] Service implementation
- [x] Routing configured

### Testing
- [x] Unit tests (backend)

### Documentation
- [x] API documentation

## 🔄 In Progress

### Current Task: Frontend Form Validation
- **File**: `apps/web/src/app/features/[feature]/[feature]-form.component.ts`
- **Progress**: 70% complete
- **Next Step**: Implement custom validators
- **Blocker**: None
- **ETA**: Today EOD

## ⏳ Next Up (Priority Order)

1. **Complete form validation** (Frontend)
   - Custom validators for business rules
   - Error message handling

2. **Implement detail component** (Frontend)
   - View mode
   - Action buttons

3. **Add loading states** (Frontend)
   - Skeleton screens
   - Progress indicators

## 🚫 Blocked Tasks

_None currently_

## 📝 Session Log

### 2025-09-12 15:30 - Session 1
- **Started**: Feature planning and documentation
- **Completed**:
  - Database schema design
  - API endpoint planning
  - Component structure planning
- **Next Session**: Start backend implementation
- **Decisions Made**:
  - Use existing user_sessions table structure
  - Implement optimistic updates in frontend
- **Files Created**:
  - `FEATURE.md`
  - `TASKS.md`
  - `PROGRESS.md`

### 2025-09-12 18:45 - Session 2
- **Continued**: Backend implementation
- **Completed**:
  - Database migrations
  - Repository layer
  - Service layer (partial)
- **Current**: Working on controller implementation
- **Issues**: None
- **Next Session**: Complete controller and start frontend
- **Files Modified**:
  - `apps/api/src/database/migrations/[timestamp]_create_[feature].ts`
  - `apps/api/src/modules/[feature]/[feature].repository.ts`
  - `apps/api/src/modules/[feature]/[feature].service.ts`

## 🎯 Milestones

- [x] **Milestone 1**: Planning Complete (2025-09-12)
- [x] **Milestone 2**: Backend API Complete (2025-09-13)
- [ ] **Milestone 3**: Frontend Components Complete (2025-09-14)
- [ ] **Milestone 4**: Integration Complete (2025-09-15)
- [ ] **Milestone 5**: Testing Complete (2025-09-16)
- [ ] **Milestone 6**: Ready for PR (2025-09-17)

## 🔄 PR Readiness Checklist

### Code Quality
- [ ] All tests passing
- [ ] Code coverage >90%
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Build successful

### Documentation
- [ ] API documentation updated
- [ ] Component documentation complete
- [ ] CHANGELOG.md updated
- [ ] README updates (if needed)

### Integration
- [ ] No merge conflicts with develop
- [ ] Database migrations tested
- [ ] API backward compatibility verified
- [ ] Frontend integration tested

### Review Preparation
- [ ] Self-review completed
- [ ] Test scenarios documented
- [ ] Breaking changes documented
- [ ] Reviewer assigned
```

---

## 🔄 **Phase 2-5: Implementation Phases**

### 🚨 **MANDATORY Rules During Implementation**

1. **Progress Updates**: Update `PROGRESS.md` after completing each task
2. **Session Logging**: Add session entry every time you pause work
3. **Blocker Tracking**: Immediately document any blockers encountered
4. **Decision Recording**: Document all significant technical decisions
5. **File Tracking**: Maintain list of files created/modified

### 📊 **Daily Progress Updates**

```bash
# Update progress percentage after each completed task
# Log current work status when pausing
# Note any decisions or blockers encountered
```

### ✅ **Definition of Done**

A feature is considered complete when:

- [ ] All tasks in `TASKS.md` are checked
- [ ] All success criteria in `FEATURE.md` are met
- [ ] Progress shows 100% completion
- [ ] PR readiness checklist is complete
- [ ] Documentation is updated
- [ ] All tests are passing

---

## 🎯 **Benefits of This Standard**

### For Development

- **Clear scope**: Every feature has defined requirements
- **Progress tracking**: Always know current status
- **Conflict prevention**: Reserved resources prevent merge issues
- **Session recovery**: Easy to resume after interruptions

### For Collaboration

- **Consistent structure**: All features follow same format
- **Clear ownership**: Who's working on what
- **Dependency tracking**: What blocks or depends on what
- **Review readiness**: Clear criteria for PR approval

### For Maintenance

- **Historical record**: Why decisions were made
- **Progress history**: How long features actually take
- **Issue tracking**: What problems occurred
- **Knowledge transfer**: Easy for others to understand

---

## 🚨 **Claude Integration**

When Claude is working on features, it MUST:

1. **Always check** if feature documentation exists before coding
2. **Create documentation first** if starting a new feature
3. **Update progress** after completing each task
4. **Log session notes** when pausing work
5. **Follow the task order** defined in TASKS.md
6. **Check for conflicts** before making changes
7. **Validate completion** against Definition of Done

This standard ensures consistent, trackable, and maintainable feature development across all projects.
