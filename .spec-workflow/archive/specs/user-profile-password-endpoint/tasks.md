# Tasks Document

## Summary

- [x] 1. Add TypeBox schemas for password change
- [x] 2. Implement password change service logic
- [x] 3. Add password change route and controller
- [x] 4. Update API contract documentation

---

## Task Details

### Task 1: Add TypeBox schemas for password change

- [x] 1. Add TypeBox schemas for password change
  - **Files to modify:**
    - `apps/api/src/layers/platform/user-profile/schemas/profile.schemas.ts` (add schemas)
  - **Description:** Create TypeBox schemas for password change request/response and add error schemas to existing user profile endpoints
  - **Changes:**
    1. Add `ChangePasswordSchema` with fields: currentPassword, newPassword, confirmPassword
    2. Add `ChangePasswordResponseSchema` using ApiSuccessResponseSchema wrapper
    3. Export Static types: `ChangePassword` and `ChangePasswordResponse`
    4. Add to `profileSchemas` export object
  - **Purpose:** Establish type-safe validation for password change endpoint following project TypeBox standards
  - _Leverage: Existing profile schemas pattern in same file, ApiSuccessResponseSchema from base.schemas.ts_
  - _Requirements: REQ-1 (Password Change Endpoint), REQ-3 (Error Response Schemas)_
  - _Prompt: Implement the task for spec user-profile-password-endpoint, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: TypeScript Backend Developer specializing in TypeBox schema validation and API type safety | Task: Create comprehensive TypeBox schemas for password change functionality following REQ-1, extending existing profile schema patterns from apps/api/src/layers/platform/user-profile/schemas/profile.schemas.ts and leveraging ApiSuccessResponseSchema from apps/api/src/schemas/base.schemas.ts for response wrapping | Context: The user profile API currently has ProfileSchema, UpdateProfileSchema, PreferencesSchema patterns that use Type.Object with field validators (minLength, maxLength, format). Your password change schema should follow the same pattern with ChangePasswordSchema containing three string fields (currentPassword, newPassword, confirmPassword) where passwords have minLength of 8 and maxLength of 128. The response schema should wrap a simple message + changedAt timestamp object using ApiSuccessResponseSchema helper. | Restrictions: Do not modify existing schemas, maintain backward compatibility with current profile.schemas.ts exports, follow existing naming conventions (Schema suffix, PascalCase), do not add password complexity validation in schema (keep it simple - only length), ensure all schemas export Static types for TypeScript usage | Success: ChangePasswordSchema validates request body with proper field constraints, ChangePasswordResponseSchema wraps success response correctly, Static types exported for TypeScript safety, schemas added to profileSchemas export object, no breaking changes to existing schemas | Instructions: After completing implementation, mark this task as in-progress in tasks.md by changing [ ] to [-], then log implementation using log-implementation tool with detailed artifacts (schemas created with their validation rules and locations), then mark task as complete [x] in tasks.md_

---

### Task 2: Implement password change service logic

- [x] 2. Implement password change service logic
  - **Files to modify:**
    - `apps/api/src/layers/platform/user-profile/services/profile.service.ts` (add method)
  - **Files to check:**
    - User repository/database access patterns
    - Existing bcrypt usage in authentication
  - **Description:** Add password change method to ProfileService with bcrypt hashing and validation
  - **Changes:**
    1. Add `changePassword(userId, currentPassword, newPassword, confirmPassword)` method
    2. Implement password match validation (newPassword === confirmPassword)
    3. Fetch user from database by userId
    4. Use bcrypt.compare to verify currentPassword against stored hash
    5. Hash newPassword with bcrypt (salt rounds = 12)
    6. Update user password in database
    7. Return ChangePasswordResponse with success message
    8. Handle all error scenarios: user not found, incorrect current password, passwords mismatch
  - **Purpose:** Provide secure business logic for password changes with proper validation and hashing
  - _Leverage: Existing ProfileService methods for patterns, bcrypt from authentication system, UserRepository for database access_
  - _Requirements: REQ-1 (Password Change Endpoint Implementation)_
  - _Prompt: Implement the task for spec user-profile-password-endpoint, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: Backend Security Engineer with expertise in password security, bcrypt hashing, and business logic implementation | Task: Implement secure password change logic in ProfileService following REQ-1 security requirements, integrating with existing user repository patterns and bcrypt authentication utilities | Context: The ProfileService likely already has methods like getProfile(), updateProfile(), updatePreferences() that interact with a user repository. You need to add a changePassword() async method that: (1) validates newPassword === confirmPassword, (2) fetches user by userId using existing repository pattern, (3) uses bcrypt.compare(currentPassword, user.password_hash) to verify current password, (4) uses bcrypt.hash(newPassword, 12) to generate new hash, (5) calls repository.updatePassword(userId, newHash), (6) returns success response with message and timestamp. | Restrictions: Must verify current password before allowing change (security critical), must use bcrypt with salt rounds >= 12, do not log passwords in any form, throw appropriate errors for each failure scenario (ValidationError for incorrect password, UnprocessableEntityError for password mismatch, NotFoundError if user missing), do not invalidate sessions (out of scope), follow existing service method patterns in same file | Success: changePassword method validates passwords correctly, bcrypt hashing works with salt rounds = 12, current password verification prevents unauthorized changes, new password successfully updated in database, proper error handling for all scenarios (wrong password = 400, mismatch = 422, auth = 401), method returns ChangePasswordResponse format, no passwords exposed in logs or errors | Instructions: After completing implementation, mark this task as in-progress in tasks.md by changing [ ] to [-], then log implementation using log-implementation tool with detailed artifacts (functions created with signatures and validation logic, database operations performed, error handling patterns used), then mark task as complete [x] in tasks.md_

---

### Task 3: Add password change route and controller

- [x] 3. Add password change route and controller
  - **Files to modify:**
    - `apps/api/src/layers/platform/user-profile/routes/profile.routes.ts` (add route)
    - `apps/api/src/layers/platform/user-profile/controllers/profile.controller.ts` (add method)
  - **Description:** Register POST /password endpoint with authentication, schemas, and controller method
  - **Changes:**
    1. Add `changePassword()` method to ProfileController that extracts userId from req.user.id (JWT), extracts body fields, calls profileService.changePassword(), returns formatted response
    2. Add POST `/password` route to profile.routes.ts after PUT `/profile` route (around line 92)
    3. Configure route with: preValidation: [fastify.authenticate], body schema: ChangePasswordSchema, response schemas: 200 (ChangePasswordResponseSchema), 400 (ValidationErrorResponseSchema), 401 (UnauthorizedResponseSchema), 422 (UnprocessableEntityResponseSchema), 500 (ServerErrorResponseSchema)
    4. Add Swagger/OpenAPI metadata: tags: ['User Profile'], summary: 'Change current user password', security: [{ bearerAuth: [] }]
    5. Wire controller method to route handler
  - **Purpose:** Expose password change functionality through authenticated REST API endpoint
  - _Leverage: Existing profile routes pattern (GET /, PUT /, POST /avatar), existing controller methods for request/response handling, fastify.authenticate middleware_
  - _Requirements: REQ-1 (Password Change Endpoint), REQ-3 (Error Response Schemas)_
  - _Prompt: Implement the task for spec user-profile-password-endpoint, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: Full-stack API Developer specializing in Fastify routing, TypeBox validation, and REST API design | Task: Add password change endpoint to user profile routes following REQ-1 specifications and REQ-3 error standards, integrating controller method with route registration using existing Fastify patterns | Context: The profile.routes.ts file uses registerProfileRoutes() function that registers multiple routes like fastify.get('/', ...), fastify.put('/', ...), fastify.post('/avatar', ...). Each route has: (1) preValidation: [fastify.authenticate] for JWT auth, (2) schema object with body/querystring/params/response definitions, (3) handler function calling controllers. The ProfileController likely has methods like getProfile(req, reply), updateProfile(req, reply) that extract user ID from req.user.id (populated by JWT middleware), call service methods, and return formatted responses using reply.code(200).send(result). You need to follow this exact pattern for password change. | Restrictions: Must use preValidation: [fastify.authenticate] for JWT authentication (security critical), must define all error response schemas (400, 401, 422, 500) not just 200 success, do not skip schema validation, follow existing route order (add after PUT /profile around line 92), maintain consistent error handling with other endpoints, ensure controller extracts userId from JWT not request body, use proper HTTP status codes (200 for success, not 201) | Success: POST /password route registered with correct path, JWT authentication required via preValidation hook, ChangePasswordSchema validates request body, all error response schemas defined (400/401/422/500), ProfileController.changePassword() extracts userId from req.user.id correctly, controller calls profileService.changePassword() with proper parameters, response formatted according to ChangePasswordResponseSchema, Swagger tags and security properly configured, endpoint testable via curl/Postman with valid JWT | Instructions: After completing implementation, mark this task as in-progress in tasks.md by changing [ ] to [-], then log implementation using log-implementation tool with detailed artifacts (apiEndpoints created with method/path/schemas/location, controller functions added with signatures, authentication integration points), then mark task as complete [x] in tasks.md_

---

### Task 4: Update API contract documentation

- [x] 4. Update API contract documentation
  - **Files to modify:**
    - `docs/features/user-profile/api-contracts.md` (add sections)
  - **Description:** Document password change endpoint and add missing endpoints to API contract
  - **Changes:**
    1. Add section "3. Change Password" after "2. Update User Profile" with: HTTP method (POST), path (/api/profile/password), authentication (Required), request body schema (JSON with currentPassword, newPassword, confirmPassword), response schema (200 success with message + changedAt), error responses (400 for invalid current password, 401 for auth failure, 422 for validation errors), curl example with JWT token
    2. Add section "8. Get User Activity Logs" documenting existing GET /api/profile/activity endpoint
    3. Add section "9. Delete User Account" documenting existing DELETE /api/profile endpoint
    4. Update all existing endpoint sections (GET /profile, PUT /profile, POST /avatar, DELETE /avatar, GET /preferences, PUT /preferences) to include complete error response documentation (400, 401, 422, 500) with example error JSON
    5. Update error responses section with specific error codes for password change: VALIDATION_ERROR (400), UNAUTHORIZED (401), PASSWORDS_DO_NOT_MATCH (422)
  - **Purpose:** Complete API contract documentation ensuring all endpoints are documented with full error schemas
  - _Leverage: Existing api-contracts.md structure and format, error response examples from other endpoints_
  - _Requirements: REQ-2 (API Contract Documentation Completion), REQ-3 (Error Response Schemas)_
  - _Prompt: Implement the task for spec user-profile-password-endpoint, first run spec-workflow-guide to get the workflow guide then implement the task: | Role: Technical Documentation Specialist with expertise in API documentation, OpenAPI specifications, and developer experience | Task: Complete user profile API contract documentation following REQ-2 by adding password change endpoint and documenting existing undocumented endpoints, ensuring REQ-3 error schema standards are met across all endpoints | Context: The api-contracts.md file currently documents 7 endpoints with partial error coverage. The structure follows: section number, HTTP method + path, Authentication requirements, Request/Response schemas with JSON examples, curl examples. You need to add 3 new endpoint sections (password change, activity logs, account deletion) and update all 7 existing sections to include comprehensive error response documentation. The password change endpoint should be inserted as section "3. Change Password" after "2. Update User Profile" to maintain logical grouping. | Restrictions: Must follow existing documentation format exactly (markdown headers, code blocks, JSON examples), must include working curl examples with Bearer token placeholder, do not change endpoint numbering for existing docs (add password as #3, renumbering subsequent items is OK), ensure all JSON examples are valid and properly formatted, must document ALL status codes (200, 400, 401, 422, 500) not just success, maintain consistent terminology (e.g., "Authentication: Required" not "Auth: Yes") | Success: Password change endpoint fully documented with request/response schemas and curl example, GET /api/profile/activity documented with pagination parameters, DELETE /api/profile documented with deletion confirmation format, all 10 endpoints have complete error response documentation (400/401/422/500), error codes specified for each scenario (e.g., PASSWORDS_DO_NOT_MATCH for 422), JSON examples are valid and formatted, curl examples include proper headers and Bearer token placeholders, documentation follows existing style and structure, API contract validator would show 100% coverage | Instructions: After completing implementation, mark this task as in-progress in tasks.md by changing [ ] to [-], then log implementation using log-implementation tool with detailed artifacts (documentation sections added with endpoint details, error schemas documented, examples provided), then mark task as complete [x] in tasks.md_

---

## Implementation Notes

### Prerequisites

- Existing authentication system (JWT + bcrypt) ✅
- User database with password_hash column ✅
- TypeBox schemas infrastructure ✅
- FastifyInstance with authentication strategies ✅

### Task Dependencies

1. Task 1 (Schemas) → Independent, can start immediately
2. Task 2 (Service) → Depends on Task 1 (needs ChangePassword type)
3. Task 3 (Routes) → Depends on Task 1 and Task 2 (needs schemas and service method)
4. Task 4 (Docs) → Can start anytime, should complete after Task 3 for accuracy

### Testing Checklist (After Implementation)

**Manual Tests:**

- Manual test: POST /api/profile/password with valid JWT returns 200
- Manual test: POST /api/profile/password without JWT returns 401
- Manual test: POST /api/profile/password with wrong current password returns 400
- Manual test: POST /api/profile/password with password mismatch returns 422
- Manual test: POST /api/profile/password with weak password (<8 chars) returns 400

**Validation Tests:**

- Run API contract validator skill: Should show 100% coverage
- Verify password actually changed: Login with new password succeeds
- Verify old password no longer works: Login with old password fails

### Estimated Effort

- Task 1: 1 hour (schema definitions)
- Task 2: 2 hours (service logic + error handling)
- Task 3: 1.5 hours (routes + controller)
- Task 4: 1.5 hours (comprehensive documentation)
- **Total: 6 hours**

### File Summary

**Files to Create:**

- None (all modifications to existing files)

**Files to Modify:**

- `apps/api/src/layers/platform/user-profile/schemas/profile.schemas.ts` (Task 1)
- `apps/api/src/layers/platform/user-profile/services/profile.service.ts` (Task 2)
- `apps/api/src/layers/platform/user-profile/controllers/profile.controller.ts` (Task 3)
- `apps/api/src/layers/platform/user-profile/routes/profile.routes.ts` (Task 3)
- `docs/features/user-profile/api-contracts.md` (Task 4)

**Critical Files to Backup Before Starting:**

- `profile.routes.ts` (route changes)
- `profile.service.ts` (service changes)
- `profile.schemas.ts` (schema changes)

### Success Criteria

- ✅ All 4 tasks completed and marked [x]
- ✅ API endpoint POST /api/profile/password works correctly
- ✅ All error scenarios return correct status codes and messages
- ✅ Password successfully hashed with bcrypt and updated in database
- ✅ API contract documentation complete (10/10 endpoints documented)
- ✅ API contract validator shows 100% coverage
- ✅ Manual testing confirms correct behavior
- ✅ No security vulnerabilities introduced
- ✅ Build passes without errors (`pnpm run build`)
