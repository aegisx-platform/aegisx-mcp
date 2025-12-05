# TODO: Pessimistic Locking Implementation

**Status**: Planned for future implementation
**Priority**: Medium
**Category**: Concurrent Editing Protection

## 📋 Overview

Implement pessimistic locking mechanism for CRUD generator to prevent concurrent editing conflicts in scenarios where multiple users may edit the same record simultaneously (e.g., Patient Management System with 30+ concurrent users).

## 🎯 Use Cases

### High Priority (Should Use Pessimistic Lock)

- 📋 Medical Records being dictated
- 💊 Prescriptions pending approval
- 🏥 Admission/Discharge status changes
- 💰 Billing/Payment records
- 📄 Legal documents under review
- ✍️ Forms requiring signatures

### Low Priority (Optimistic Lock Sufficient)

- 👤 Patient demographics (name, address)
- 📞 Contact information
- 🔖 Tags/Labels
- 📝 Notes/Comments
- 📊 Statistics/Analytics data

## 🏗️ Current State

### ✅ Already Implemented

1. **Optimistic Locking** via `updated_at` field in BaseRepository
2. **WebSocket Events** for real-time notifications
3. **EventService Lock Methods** (foundation exists):
   - `emitLockAcquired(data)`
   - `emitLockReleased(data)`
   - `emitConflictDetected(data)`

### ⏳ Needs Implementation

#### Backend Components

1. **Lock Management Service**

```typescript
// apps/api/src/shared/services/lock.service.ts
class LockService {
  // Acquire lock for specific record
  async acquireLock(resource: string, resourceId: string, userId: string, options?: LockOptions): Promise<Lock>;

  // Release lock
  async releaseLock(lockId: string, userId: string): Promise<void>;

  // Check if locked
  async isLocked(resource: string, resourceId: string): Promise<boolean>;

  // Force unlock (admin only)
  async forceUnlock(lockId: string, adminUserId: string): Promise<void>;

  // Auto-expire locks after timeout
  async cleanupExpiredLocks(): Promise<void>;
}
```

2. **Database Schema**

```sql
-- apps/api/src/database/migrations/YYYYMMDDHHMMSS_create_locks_table.ts
CREATE TABLE entity_locks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_type VARCHAR(50) NOT NULL,      -- e.g., 'patients', 'budgets'
  resource_id VARCHAR(50) NOT NULL,        -- e.g., '123', 'abc-uuid'
  locked_by UUID NOT NULL,                 -- user_id
  locked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,           -- auto-unlock after timeout
  lock_type VARCHAR(20) DEFAULT 'editing', -- 'editing', 'deleting', 'approving'
  metadata JSONB,                          -- extra info
  UNIQUE(resource_type, resource_id),      -- only one lock per resource
  FOREIGN KEY (locked_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_locks_expires ON entity_locks(expires_at);
CREATE INDEX idx_locks_resource ON entity_locks(resource_type, resource_id);
```

3. **Controller Middleware**

```typescript
// Inject into CRUD controller template
async update(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params;

  // Check if locked by another user
  const lock = await this.lockService.checkLock('budgets', id);
  if (lock && lock.lockedBy !== request.user.id) {
    return reply.code(423).error('RESOURCE_LOCKED', 'Resource is locked by another user', {
      lockedBy: lock.lockedBy,
      lockedAt: lock.lockedAt,
      expiresAt: lock.expiresAt
    });
  }

  // Proceed with update...
}
```

#### Frontend Components

1. **Lock Service**

```typescript
// apps/web/src/app/shared/business/services/lock.service.ts
@Injectable({ providedIn: 'root' })
export class LockService {
  acquireLock(resource: string, resourceId: string): Observable<Lock>;
  releaseLock(lockId: string): Observable<void>;
  checkLock(resource: string, resourceId: string): Observable<Lock | null>;

  // Auto-release on component destroy
  autoRelease(resource: string, resourceId: string): Observable<void>;
}
```

2. **Edit Dialog Enhancement**

```typescript
// Template enhancement for generated edit dialogs
export class BudgetsEditDialog implements OnInit, OnDestroy {
  private lockId: string | null = null;

  async ngOnInit() {
    // Acquire lock when opening edit dialog
    try {
      const lock = await this.lockService.acquireLock('budgets', this.data.id);
      this.lockId = lock.id;
    } catch (error) {
      if (error.code === 'RESOURCE_LOCKED') {
        this.showLockedWarning(error.data);
        this.dialogRef.close();
      }
    }

    // Listen for lock conflicts
    this.setupLockMonitoring();
  }

  ngOnDestroy() {
    // Auto-release lock
    if (this.lockId) {
      this.lockService.releaseLock(this.lockId);
    }
  }

  private setupLockMonitoring() {
    this.wsService.subscribeToEvent('budgets', 'budget', 'lock_acquired').subscribe((event) => {
      if (event.data.id === this.data.id && event.data.userId !== this.currentUser.id) {
        this.showConflictWarning(event.data);
      }
    });
  }
}
```

3. **Lock Status Indicator Component**

```typescript
// apps/web/src/app/shared/ui/components/lock-indicator.component.ts
@Component({
  selector: 'app-lock-indicator',
  template: `
    <mat-chip-set *ngIf="lock">
      <mat-chip color="warn" selected>
        <mat-icon>lock</mat-icon>
        Locked by {{ lock.lockedBy }}
        <button mat-icon-button *ngIf="canForceUnlock" (click)="forceUnlock()">
          <mat-icon>lock_open</mat-icon>
        </button>
      </mat-chip>
    </mat-chip-set>
  `,
})
export class LockIndicatorComponent {
  @Input() lock: Lock | null = null;
  @Input() canForceUnlock = false;
  @Output() unlocked = new EventEmitter<void>();
}
```

## 🚀 Implementation Plan

### Phase 1: Backend Foundation

- [ ] Create `entity_locks` table migration
- [ ] Implement `LockService` with Redis backing (optional)
- [ ] Add lock check middleware to BaseRepository
- [ ] Add WebSocket events for lock acquisition/release
- [ ] Add lock cleanup cron job (auto-expire)

### Phase 2: Backend Integration

- [ ] Add `--with-locking` flag to CRUD generator CLI
- [ ] Modify controller template to include lock checks
- [ ] Add lock acquisition/release to controller methods
- [ ] Emit WebSocket events for lock operations
- [ ] Add tests for lock scenarios

### Phase 3: Frontend Foundation

- [ ] Create `LockService` for frontend
- [ ] Create `LockIndicatorComponent`
- [ ] Create `LockedResourceDialog` warning
- [ ] Implement WebSocket lock event subscriptions

### Phase 4: Frontend Integration

- [ ] Modify edit dialog template to acquire/release locks
- [ ] Add lock status indicator to edit forms
- [ ] Add force unlock button (admin only)
- [ ] Add conflict resolution UI
- [ ] Handle navigation away (auto-release)

### Phase 5: Testing & Documentation

- [ ] Unit tests for LockService
- [ ] Integration tests for concurrent editing scenarios
- [ ] E2E tests with Playwright
- [ ] Documentation for developers
- [ ] User guide for lock behavior

## 📊 Configuration Options

```json
// .crudgen.json
{
  "defaultFeatures": {
    "events": true,
    "locking": false, // ← New flag
    "lockTimeout": 1800, // 30 minutes default
    "allowForceLock": true // Admin can force unlock
  }
}
```

## 🎨 User Experience

### Lock Acquisition Flow

```
User clicks "Edit" button
  ↓
Frontend: Acquire lock via API
  ↓
Success → Open edit dialog
  ↓
Backend: Broadcast lock_acquired event
  ↓
Other users viewing same record → Show "Locked" indicator
```

### Lock Conflict Flow

```
User A: Opens edit dialog (lock acquired)
  ↓
User B: Tries to open edit dialog
  ↓
Backend: Returns 423 Locked
  ↓
Frontend: Show dialog:
  ┌────────────────────────────────────┐
  │ ⚠️ Record is Locked                │
  │                                    │
  │ This record is being edited by:    │
  │ Dr. John Smith                     │
  │ Since: 2:30 PM                     │
  │                                    │
  │ [Wait]  [Force Unlock (Admin)]     │
  └────────────────────────────────────┘
```

### Auto-Release Scenarios

1. User saves changes → Release lock
2. User cancels dialog → Release lock
3. User navigates away → Release lock (onDestroy)
4. Browser crashes → Lock auto-expires after timeout
5. Admin forces unlock → Release lock + notify original user

## 🔧 Technical Considerations

### Lock Storage Options

**Option 1: PostgreSQL (Simple)**

```typescript
// Pros: No additional infrastructure
// Cons: Not suitable for high-frequency locks
await db.query(`
  INSERT INTO entity_locks (resource_type, resource_id, locked_by, expires_at)
  VALUES ($1, $2, $3, NOW() + INTERVAL '30 minutes')
  ON CONFLICT (resource_type, resource_id) DO NOTHING
`);
```

**Option 2: Redis (Recommended for Production)**

```typescript
// Pros: Fast, built-in TTL, distributed locking
// Cons: Requires Redis infrastructure
await redis.set(
  `lock:budgets:${id}`,
  userId,
  'EX',
  1800, // 30 minutes
  'NX', // Only set if not exists
);
```

### Lock Timeout Strategy

- Default: 30 minutes (configurable)
- Heartbeat: Extend lock every 5 minutes if user still active
- Auto-cleanup: Cron job runs every 1 minute to remove expired locks

### Race Condition Prevention

```sql
-- Use PostgreSQL SELECT FOR UPDATE
BEGIN;
SELECT * FROM entity_locks
WHERE resource_type = 'budgets' AND resource_id = '123'
FOR UPDATE NOWAIT;

-- If locked → raises error immediately
-- If not locked → acquire lock atomically
COMMIT;
```

## 📚 Related Files

### Existing Infrastructure

- `apps/api/src/shared/websocket/event.service.ts` - Lock event methods exist
- `apps/api/src/shared/websocket/websocket.gateway.ts` - Lock event broadcasts
- `apps/api/src/shared/repositories/base.repository.ts` - Optimistic locking

### Files to Create

- `apps/api/src/shared/services/lock.service.ts`
- `apps/api/src/shared/middleware/lock.middleware.ts`
- `apps/api/src/database/migrations/*_create_locks_table.ts`
- `apps/web/src/app/shared/business/services/lock.service.ts`
- `apps/web/src/app/shared/ui/components/lock-indicator.component.ts`
- `apps/web/src/app/shared/ui/dialogs/locked-resource.dialog.ts`

### Templates to Modify

- `libs/aegisx-cli/templates/backend/domain/controller.hbs`
- `libs/aegisx-cli/templates/backend/domain/index.hbs`
- `libs/aegisx-cli/templates/frontend/v2/edit-dialog-v2.hbs`
- `libs/aegisx-cli/templates/frontend/v2/list-component-v2.hbs`

## 💡 Alternative: Hybrid Approach

For most use cases, a **hybrid approach** may be sufficient:

1. **Default**: Optimistic Locking + WebSocket Notifications
2. **Critical Operations**: Pessimistic Locking (via flag)

```typescript
// Example: Only lock during critical operations
async approvePrescription(id: string) {
  // Acquire lock for this critical operation
  const lock = await this.lockService.acquireLock('prescriptions', id);

  try {
    await this.prescriptionService.approve(id);
  } finally {
    await this.lockService.releaseLock(lock.id);
  }
}
```

## 🔗 References

- [PostgreSQL Advisory Locks](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Redis Distributed Locks](https://redis.io/docs/manual/patterns/distributed-locks/)
- [Optimistic vs Pessimistic Locking](https://stackoverflow.com/questions/129329/optimistic-vs-pessimistic-locking)

## 📝 Notes

- Current Phase 2 implementation (WebSocket Events) already provides foundation
- Lock events infrastructure exists but not integrated with CRUD operations
- Consider implementing on-demand rather than by default
- May add `--with-locking` flag to generator when needed

---

**Created**: 2025-01-27
**Last Updated**: 2025-01-27
**Status**: Planning Phase
