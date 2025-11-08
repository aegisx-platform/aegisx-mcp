# Knex to Drizzle ORM Migration Analysis

## Executive Summary

**Migration Difficulty:** MEDIUM (High complexity, manageable scope)

**Estimated Effort:** 80-120 hours (2-3 weeks of focused development)

**Breaking Changes:** Moderate - Repository layer and all data access patterns will change

**Recommended Timeline:** 2-3 week sprint with proper testing and validation

---

## 1. Codebase Knex Usage Analysis

### 1.1 Overall Scope

| Metric                       | Count | Details                     |
| ---------------------------- | ----- | --------------------------- |
| Total Repository Files       | 17    | Core data access layer      |
| Repository Lines of Code     | 7,891 | Implementation files        |
| Active Migrations            | 19    | Database schema definitions |
| Migration Lines of Code      | 3,653 | Schema setup logic          |
| Seed Files                   | 9     | Data seeding scripts        |
| Seed Lines of Code           | 3,787 | Test data generation        |
| Knex Query Patterns          | 1,767 | Total query builder calls   |
| Complex Patterns (raw/joins) | 302   | Advanced query patterns     |

**Total Scope:** ~15,000 lines of Knex-dependent code

### 1.2 Current Knex Version

```
knex: ^3.1.0 (latest major version)
pg: 8.16.3 (PostgreSQL driver)
Node.js: >=22.0.0
```

### 1.3 File Distribution

**Repositories (17 files):**

- Base repositories: 2 (base.repository.ts, audit base.repository.ts)
- Domain repositories: 15 (users, rbac, auth, file-upload, etc.)
- Average size: ~465 lines per file

**Key Repository Files:**

- `/shared/repositories/base.repository.ts` - 430 lines (core CRUD)
- `/core/rbac/rbac.repository.ts` - 852 lines (complex queries)
- `/core/users/users.repository.ts` - 150+ lines (joins & filters)
- `/core/audit-system/base/base.repository.ts` - 489 lines (audit queries)

---

## 2. Knex Usage Patterns Identified

### 2.1 Core Query Patterns

```
Distribution of Knex operations:
- .select() / .where() combinations: ~45%
- .join() / .leftJoin() operations: ~25%
- .insert() / .update() / .delete(): ~15%
- .transaction() operations: ~8%
- .raw() / .whereRaw() operations: ~7%
```

### 2.2 Complex Query Examples Found

**1. Subquery Joins (RBAC Repository)**

```typescript
// Left join with COUNT subquery
this.db('roles').select(selectColumns).leftJoin(this.db('user_roles').select('role_id').count('* as user_count').where('is_active', true).groupBy('role_id').as('user_role_counts'), 'roles.id', 'user_role_counts.role_id');
```

**2. Multi-Table Joins with Multiple Conditions**

```typescript
// Users with roles and permissions
this.knex('users').select('users.*', 'roles.name as role').leftJoin('user_roles', 'users.id', 'user_roles.user_id').leftJoin('roles', 'user_roles.role_id', 'roles.id').whereNull('users.deleted_at');
```

**3. Raw SQL for PostgreSQL Functions**

```typescript
await knex.raw(`
  CREATE OR REPLACE FUNCTION check_password_security() 
  RETURNS TRIGGER AS $$
  BEGIN
    -- Custom PostgreSQL logic
  END;
  $$ LANGUAGE plpgsql;
`);
```

**4. Aggregate Queries with FILTER Clause**

```typescript
this.db.raw('COUNT(*) FILTER (WHERE is_active = true) as active_roles');
```

**5. Transaction-Based Operations**

```typescript
await this.db.transaction(async (trx) => {
  const [role] = await trx('roles').insert({...}).returning('*');
  await trx('role_permissions').insert(rolePermissions);
  return role;
});
```

### 2.3 Special Features Used

| Feature                  | Usage            | Complexity           |
| ------------------------ | ---------------- | -------------------- |
| Transactions             | 36 occurrences   | Medium               |
| Raw SQL                  | 26+ uses         | Medium-High          |
| Subqueries               | 15+ patterns     | High                 |
| Window Functions         | Not found        | N/A                  |
| CTEs (Common Table Expr) | Not found        | N/A                  |
| GROUP BY + aggregates    | ~30 uses         | Medium               |
| UUID fields              | Pervasive        | Low (auto-validated) |
| JSONB columns            | ~5 uses          | Low                  |
| Soft deletes             | whereNull checks | Low                  |

---

## 3. Migration Scope Breakdown

### 3.1 Category Breakdown

| Category                     | Files | Effort   | Complexity |
| ---------------------------- | ----- | -------- | ---------- |
| **A. Base Repository Layer** | 2     | 40-50h   | High       |
| **B. Domain Repositories**   | 15    | 45-60h   | Medium     |
| **C. Migrations**            | 19    | 10-15h   | Low        |
| **D. Seeds**                 | 9     | 8-12h    | Low        |
| **E. Service Layer Queries** | 20+   | 15-25h   | Medium     |
| **F. Testing & Validation**  | -     | 20-30h   | Medium     |
| **TOTAL**                    | 65+   | 138-192h | **MEDIUM** |

### 3.2 Detailed File List

**Base Repositories (HIGHEST PRIORITY):**

- `/shared/repositories/base.repository.ts` - Generic CRUD operations
- `/core/audit-system/base/base.repository.ts` - Audit query patterns

**Domain Repositories (MEDIUM PRIORITY):**

1. `/core/rbac/rbac.repository.ts` - Complex joins, aggregates
2. `/core/users/users.repository.ts` - User queries with roles
3. `/core/auth/auth.repository.ts` - Authentication queries
4. `/core/user-profile/user-profile.repository.ts` - Profile data
5. `/core/user-profile/user-activity.repository.ts` - Activity logs
6. `/core/error-logs/error-logs.repository.ts` - Audit logs
7. `/core/audit-system/file-audit/file-audit.repository.ts` - File audits
8. `/core/audit-system/login-attempts/login-attempts.repository.ts` - Login logs
9. `/core/file-upload/file-upload.repository.ts` - File management
10. `/core/attachments/attachment.repository.ts` - Attachments
11. `/core/pdf-export/repositories/pdf-template.repository.ts` - PDF templates
12. `/core/api-keys/repositories/apiKeys.repository.ts` - API keys
13. `/core/navigation/navigation.repository.ts` - Navigation menus
14. `/core/settings/settings.repository.ts` - Settings storage
15. `/modules/testProducts/repositories/test-products.repository.ts` - Test data

**Migrations (LOW PRIORITY):**

- 19 active migration files using Knex schema builder
- Clear up/down patterns, can be converted mechanically

**Seeds (LOW PRIORITY):**

- 9 seed files with insertion logic
- Relatively simple insert patterns

---

## 4. Risk Assessment

### 4.1 High Risk Areas

| Risk                           | Impact                             | Mitigation                                           |
| ------------------------------ | ---------------------------------- | ---------------------------------------------------- |
| **RBAC Repository Complexity** | Complex joins with subqueries      | Implement & thoroughly test first, use as validation |
| **Transaction Handling**       | 36 uses across codebase            | Test transaction rollback scenarios thoroughly       |
| **Raw SQL in Migrations**      | 26+ raw SQL calls                  | Create wrapper utilities for PostgreSQL functions    |
| **UUID Validation**            | Custom UUID validator in base repo | Drizzle has native UUID support, simplifies code     |
| **Circular Dependencies**      | Repository interdependencies       | Migrate in dependency order (base → domain)          |
| **Active Database**            | Running system changes             | Use blue-green deployment or maintenance window      |

### 4.2 Low Risk Areas

| Area                     | Why                       | Effort                          |
| ------------------------ | ------------------------- | ------------------------------- |
| Window Functions         | Not currently used        | Easy to add if needed           |
| Common Table Expressions | Not currently used        | Easy to add if needed           |
| JSON/JSONB               | Only 5 uses               | Drizzle has better JSON support |
| Soft Deletes             | Simple whereNull() checks | Trivial with Drizzle            |

### 4.3 Breaking Changes Required

1. **Repository Constructor Changes**
   - FROM: `new UserRepo(knex_instance)`
   - TO: `new UserRepo(db_instance)` (Drizzle DB)

2. **Query Builder API**
   - All Knex builder methods replaced with Drizzle equivalents
   - Return signatures may change slightly
   - Type inference will be stricter (better!)

3. **Transaction Interface**
   - FROM: `async (trx) => {...}`
   - TO: `db.transaction(async (tx) => {...})`

4. **Configuration**
   - knexfile.ts can be removed
   - Migration location and runner changes
   - Seed runner changes

---

## 5. Benefits of Switching to Drizzle

### 5.1 Code Quality Improvements

| Benefit                           | Impact                                          |
| --------------------------------- | ----------------------------------------------- |
| **Full Type Safety**              | Eliminate `as any` patterns, better IDE support |
| **No SQL Injection**              | Parameterized queries by default                |
| **Better TypeScript Integration** | Types derived from schema, not runtime          |
| **Smaller Bundle**                | ~50KB vs Knex's ~200KB                          |
| **Fewer Runtime Errors**          | Compile-time validation of schema               |

### 5.2 Development Experience

```
Knex approach (current):
- Manual type mapping (domain model → DB schema → API response)
- Runtime query building
- Loose typing on query results
- Verbose transaction handling

Drizzle approach (new):
- Single source of truth: schema.ts
- Compile-time query checking
- Strict types from schema
- Elegant transaction handling
```

### 5.3 Performance Improvements

- Similar query performance (both use pg driver)
- Fewer runtime type checks
- Better query plan with Drizzle's strictness
- Smaller memory footprint

### 5.4 Maintenance Benefits

- Schema changes in one place (schema.ts)
- No separate migration files needed (can use declarative)
- Better IDE autocomplete
- Easier for new developers to understand

---

## 6. Migration Strategy

### Phase 1: Preparation (2-3 days)

1. Install Drizzle ORM and tools
2. Create schema definitions from current migrations
3. Set up test database with Drizzle schema
4. Create base Drizzle repository class
5. Establish migration utilities

### Phase 2: Base Layer Migration (5-7 days)

1. Migrate BaseRepository
2. Migrate BaseAuditRepository
3. Create comprehensive unit tests
4. Validate pagination, filtering, search

### Phase 3: Domain Repository Migration (7-10 days)

1. Migrate RBAC repository (most complex)
2. Migrate user-related repositories
3. Migrate audit/logging repositories
4. Migrate file/attachment repositories
5. Migrate specialized repositories

### Phase 4: Migrations & Seeds (2-3 days)

1. Convert Knex migrations to Drizzle
2. Convert seed files
3. Test migration/rollback flow
4. Update setup process

### Phase 5: Integration & Testing (5-7 days)

1. Update services to use new repositories
2. Run full integration test suite
3. E2E testing of critical flows
4. Performance testing

### Phase 6: Cleanup & Documentation (2-3 days)

1. Remove Knex dependencies
2. Update documentation
3. Code review and fixes
4. Merge to main

**Total: 23-33 days (3-5 weeks)**

---

## 7. Estimated Effort by Role

### Development Team

| Role               | Effort  | Tasks                                    |
| ------------------ | ------- | ---------------------------------------- |
| **Lead Developer** | 80-120h | Architecture, complex repos, integration |
| **Backend Dev 1**  | 60-80h  | Domain repositories, migrations          |
| **Backend Dev 2**  | 40-60h  | Seeds, services, testing                 |
| **QA Engineer**    | 30-40h  | Testing, validation, performance         |

**Total Team Effort: 210-300 developer hours**

---

## 8. Detailed Migration Checklist

### Pre-Migration

- [ ] Backup production database
- [ ] Create feature branch `feature/knex-to-drizzle`
- [ ] Install Drizzle: `pnpm add drizzle-orm`
- [ ] Install Drizzle Kit: `pnpm add -D drizzle-kit`
- [ ] Create `src/database/schema.ts` with table definitions
- [ ] Set up test database
- [ ] Document all current Knex patterns

### Phase 1: Base Repositories

- [ ] Create `BaseRepository` with Drizzle
- [ ] Create `BaseAuditRepository` with Drizzle
- [ ] Write comprehensive unit tests
- [ ] Validate CRUD operations
- [ ] Validate pagination
- [ ] Validate filtering and search

### Phase 2: Domain Repositories (Priority Order)

**High Priority (Complex):**

- [ ] RbacRepository (18-20h)
  - [ ] Role queries with counts
  - [ ] Permission queries
  - [ ] User-role assignments
  - [ ] Bulk operations
  - [ ] Statistics aggregations
- [ ] UsersRepository (12-15h)
  - [ ] Complex joins
  - [ ] Soft delete logic
  - [ ] Search with multiple fields
  - [ ] Role associations

**Medium Priority:**

- [ ] AuthRepository (8-10h)
- [ ] UserProfileRepository (8-10h)
- [ ] FileUploadRepository (10-12h)
- [ ] ErrorLogsRepository (8-10h)

**Lower Priority:**

- [ ] NavigationRepository (6-8h)
- [ ] SettingsRepository (6-8h)
- [ ] AttachmentRepository (6-8h)
- [ ] ApiKeysRepository (6-8h)
- [ ] PdfTemplateRepository (6-8h)
- [ ] AuditRepositories (15-20h total)
- [ ] TestProductsRepository (4-6h)

### Phase 3: Migrations & Seeds

- [ ] Convert migrations to Drizzle schema
- [ ] Test full migration suite
- [ ] Test rollback mechanism
- [ ] Convert seed files
- [ ] Test seed execution

### Phase 4: Services & Integration

- [ ] Update all services to use new repositories
- [ ] Run integration tests
- [ ] Fix any integration issues
- [ ] Test transaction handling

### Phase 5: Testing & Validation

- [ ] Unit tests for all repositories
- [ ] Integration test suite
- [ ] E2E tests for critical flows
- [ ] Performance benchmarking
- [ ] Load testing

### Post-Migration

- [ ] Remove knexfile.ts
- [ ] Remove Knex from dependencies
- [ ] Update documentation
- [ ] Update setup guides
- [ ] Code review
- [ ] Merge to develop/main

---

## 9. Code Migration Examples

### Example 1: Simple CRUD Repository

**Knex (Current):**

```typescript
export class UsersRepository extends BaseRepository<User> {
  constructor(knex: Knex) {
    super(knex, 'users', ['email', 'username']);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.query().where('email', email).first();
  }
}
```

**Drizzle (New):**

```typescript
export class UsersRepository {
  constructor(private db: DrizzleDB) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  }
}
```

### Example 2: Complex Join Query

**Knex (Current):**

```typescript
async getRoles(query: RoleQuery) {
  let baseQuery = this.db('roles')
    .select(selectColumns)
    .leftJoin(
      this.db('user_roles')
        .select('role_id')
        .count('* as user_count')
        .where('is_active', true)
        .groupBy('role_id')
        .as('user_role_counts'),
      'roles.id',
      'user_role_counts.role_id'
    );
  // ... filtering
}
```

**Drizzle (New):**

```typescript
async getRoles(query: RoleQuery) {
  return this.db
    .select({
      ...schema.roles,
      userCount: sql<number>`coalesce(count(${schema.userRoles.id}), 0)`
    })
    .from(schema.roles)
    .leftJoin(
      schema.userRoles,
      and(
        eq(schema.userRoles.roleId, schema.roles.id),
        eq(schema.userRoles.isActive, true)
      )
    )
    .groupBy(schema.roles.id)
    // ... filtering
}
```

### Example 3: Transaction Handling

**Knex (Current):**

```typescript
async createRoleWithPermissions(role: CreateRoleRequest) {
  return await this.db.transaction(async (trx) => {
    const [newRole] = await trx('roles')
      .insert(role)
      .returning('*');

    await trx('role_permissions')
      .insert(permissions);

    return newRole;
  });
}
```

**Drizzle (New):**

```typescript
async createRoleWithPermissions(role: CreateRoleRequest) {
  return await this.db.transaction(async (tx) => {
    const [newRole] = await tx
      .insert(schema.roles)
      .values(role)
      .returning();

    await tx
      .insert(schema.rolePermissions)
      .values(permissions);

    return newRole;
  });
}
```

---

## 10. Testing Strategy

### Unit Tests

```typescript
// Before: Knex-based tests
describe('RbacRepository', () => {
  let repo: RbacRepository;
  let knex: Knex;

  beforeEach(async () => {
    knex = createTestDatabase();
    repo = new RbacRepository(knex);
  });
});

// After: Drizzle-based tests
describe('RbacRepository', () => {
  let repo: RbacRepository;
  let db: DrizzleDB;

  beforeEach(async () => {
    db = createTestDatabase();
    repo = new RbacRepository(db);
  });
});
```

### Test Coverage

- Unit tests for all repository methods
- Integration tests for complex flows
- Transaction rollback scenarios
- Error handling and edge cases
- Performance benchmarks

---

## 11. Recommendations

### Priority 1: High Impact, Lower Effort

1. **Start with BaseRepository** - Sets foundation for all other repos
2. **Migrate RbacRepository** - Most complex, good validation of approach
3. **Create utility layer** - Transaction helpers, query builders

### Priority 2: Lower Effort

1. **Migrate straightforward repositories** - Auth, Users, FileUpload
2. **Convert migrations** - Mechanical conversion, low risk
3. **Update services** - Point to new repositories

### Priority 3: Testing & Validation

1. **Comprehensive testing** - Unit, integration, E2E
2. **Performance validation** - Ensure no regressions
3. **Documentation** - Update all relevant guides

### Go/No-Go Criteria

**Must Have:**

- All tests passing (100% of original test suite)
- No performance degradation (< 5% variance)
- Transaction rollback working
- Migration/seed flow working

**Nice to Have:**

- Performance improvement (10-20% expected)
- Type safety improvements
- Code reduction (20-30% expected)

---

## 12. Resource Requirements

### Tools & Infrastructure

- Drizzle ORM: v1.x (latest)
- Drizzle Kit: v0.x (schema management)
- Test database: PostgreSQL (same as production)
- Node.js: 22+ (already required)

### Development Resources

- 2-3 backend developers
- 1 QA engineer
- 1 technical lead (part-time)
- 3-5 weeks calendar time

### Risks if Not Addressed

- **Slow delivery** if only 1 person working on it
- **Testing gaps** if QA not involved early
- **Integration issues** if services not updated carefully
- **Production incidents** if validation insufficient

---

## 13. Success Metrics

After migration, validate:

1. **Functionality** - All CRUD operations work
2. **Performance** - Query response times match or improve
3. **Type Safety** - No `any` types, better IDE support
4. **Test Coverage** - 100% of original tests passing
5. **Code Quality** - Reduced lines of code, better readability
6. **Developer Experience** - Easier onboarding, better error messages

---

## Conclusion

**Verdict:** Migration is FEASIBLE and RECOMMENDED

**Difficulty Level:** MEDIUM (High complexity, manageable scope)

**Timeline:** 3-5 weeks for a focused team

**Effort:** 210-300 developer hours

**ROI:**

- Better type safety
- Smaller bundle size
- Improved developer experience
- Lower maintenance overhead
- Reduced bugs from type mismatches

**Next Steps:**

1. Discuss with team
2. Allocate resources
3. Create detailed sprint plan
4. Start with preparation phase
5. Validate with RBAC repository
6. Roll out systematically
