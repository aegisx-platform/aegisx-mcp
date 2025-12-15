# Requirements Document

## Introduction

This specification addresses critical routing issues in the inventory frontend where API calls are incorrectly targeting routes that don't exist in the backend layer-based architecture. The refactoring will correct all API routes to use the appropriate layer (Platform vs Domain), eliminating 404 errors and ensuring proper architectural separation of concerns.

**Impact:**

- 2 files requiring immediate fixes (1 service + 1 component)
- 26 services verified as correct (no changes needed)
- Elimination of 404 errors for departments endpoints
- Improved consistency with backend layer-based architecture

**Value to Users:**

- Departments CRUD functionality will work correctly
- Budget requests form will load departments dropdown successfully
- Better system reliability and performance
- Foundation for future shared platform services

## Alignment with Product Vision

This refactoring aligns with the platform's architectural principles:

- **Layer-Based Architecture**: Properly separates Platform Layer (shared services) from Domain Layer (business-specific resources)
- **Code Quality**: Follows established patterns and eliminates technical debt
- **Maintainability**: Sets foundation for shared platform services across all domains
- **Developer Experience**: Clear distinction between platform and domain resources

## Requirements

### Requirement 1: Fix Platform Layer Routes

**User Story:** As a developer, I want departments API calls to use the correct Platform Layer endpoint, so that the departments CRUD functionality works without 404 errors.

#### Acceptance Criteria

1. WHEN the departments service makes an API call THEN the system SHALL use `/v1/platform/departments` endpoint
2. WHEN the departments list page loads THEN the system SHALL return 200 OK with department data (not 404)
3. WHEN departments CRUD operations are performed THEN the system SHALL successfully create, read, update, and delete departments
4. IF a user navigates to inventory departments module THEN the system SHALL load and display departments correctly

### Requirement 2: Eliminate Direct API Calls in Components

**User Story:** As a developer, I want components to use service layer instead of direct HTTP calls, so that the application follows proper architectural patterns and maintains consistency.

#### Acceptance Criteria

1. WHEN the budget requests form component needs departments data THEN the system SHALL call the departments service (not direct HTTP)
2. IF direct HTTP calls exist in components THEN the system SHALL refactor to use service layer
3. WHEN components use services THEN the system SHALL maintain single source of truth for API endpoints
4. WHEN the budget requests form loads THEN the departments dropdown SHALL populate using the correct platform endpoint

### Requirement 3: Verify Domain Routes Remain Correct

**User Story:** As a developer, I want to verify all inventory-specific routes are correctly using Domain Layer endpoints, so that existing functionality continues to work after refactoring.

#### Acceptance Criteria

1. WHEN inventory services make API calls for domain resources THEN the system SHALL use `/inventory/{section}/{resource}` pattern
2. IF a resource is inventory-specific (drugs, budgets, contracts, etc.) THEN the system SHALL use Domain Layer routes
3. WHEN testing after refactoring THEN the system SHALL confirm all 26 domain services continue to work
4. WHEN users access inventory modules THEN the system SHALL load all CRUD operations successfully

### Requirement 4: URL Prefix Consistency

**User Story:** As a developer, I want consistent URL prefix handling across all services, so that the routing pattern is clear and maintainable.

#### Acceptance Criteria

1. WHEN services define baseUrl THEN the system SHALL use relative URLs without `/api` prefix
2. WHEN API calls are made THEN Angular proxy SHALL prepend `/api` prefix automatically
3. IF a service needs to change endpoints THEN the developer SHALL only update the baseUrl property
4. WHEN reviewing service code THEN the URL pattern SHALL be clear and consistent across all services

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: Each service handles API calls for one specific resource
- **Modular Design**: Services are isolated and reusable across components
- **Dependency Management**: Components depend on services, not direct HTTP calls
- **Clear Interfaces**: API endpoints follow layer-based routing conventions

### Performance

- No performance impact expected (only changing endpoint URLs)
- Reduced failed requests (eliminate 404 errors)
- Same number of API calls before and after refactoring

### Security

- Maintain existing authentication and authorization patterns
- No changes to security middleware or guards
- Platform Layer endpoints must respect existing RBAC rules

### Reliability

- All existing CRUD operations must continue to work after refactoring
- No data loss or corruption during transition
- Rollback plan available if issues occur
- Comprehensive testing before deployment

### Usability

- No user-facing changes expected
- Same UI/UX behavior before and after
- Improved reliability eliminates user frustration with 404 errors
- Faster page loads (no failed requests)

### Maintainability

- Clear distinction between Platform and Domain resources
- Foundation for future shared platform services
- Easier onboarding for new developers (clear architecture)
- Reduced technical debt
