# Multi-User Concurrency Standards

> **Complete guide for handling concurrent data access in enterprise applications**

**Last Updated:** 2025-11-01

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Optimistic Locking](#optimistic-locking)
3. [Pessimistic Locking](#pessimistic-locking)
4. [Transaction Isolation](#transaction-isolation)
5. [Deadlock Prevention](#deadlock-prevention)
6. [Race Condition Prevention](#race-condition-prevention)
7. [Distributed Locking](#distributed-locking)
8. [Concurrency Patterns](#concurrency-patterns)
9. [Testing Concurrency](#testing-concurrency)
10. [Concurrency Checklist](#concurrency-checklist)

---

## Overview

### Why Concurrency Control Matters

**Real-World Scenario:**

```
User A: Opens inventory item (qty: 100)
User B: Opens same item (qty: 100)
User A: Sells 50 units → Saves (qty: 50)
User B: Sells 30 units → Saves (qty: 70)
Result: Lost update! Should be 20, not 70
```

**Critical Use Cases:**

- ✅ **Inventory Management** - Prevent overselling
- ✅ **Financial Transactions** - Prevent double-spending
- ✅ **Appointment Booking** - Prevent double-booking
- ✅ **Document Editing** - Prevent conflicting changes
- ✅ **Counter Updates** - Prevent race conditions

### Concurrency Strategies

| Strategy                | Use Case                        | Performance | Complexity  | Data Integrity   |
| ----------------------- | ------------------------------- | ----------- | ----------- | ---------------- |
| **Optimistic Locking**  | Read-heavy, rare conflicts      | ⚡⚡⚡ High | ⭐ Low      | ✅ Good          |
| **Pessimistic Locking** | Write-heavy, frequent conflicts | ⚡ Low      | ⭐⭐⭐ High | ✅✅✅ Excellent |
| **Distributed Locking** | Multiple servers                | ⚡⚡ Medium | ⭐⭐ Medium | ✅✅ Very Good   |

---

## Optimistic Locking

### Strategy Overview

**Concept:** Assume conflicts are rare, detect and handle when they occur

**Mechanism:** Add `version` column, increment on every update

**Pros:**

- ✅ High performance (no locks)
- ✅ Simple implementation
- ✅ Works well for read-heavy workloads

**Cons:**

- ❌ User must retry on conflict
- ❌ Not suitable for high-conflict scenarios

### Database Schema

```sql
-- Add version column to tables requiring concurrency control
ALTER TABLE products ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE orders ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE inventory ADD COLUMN version INTEGER NOT NULL DEFAULT 1;

-- Create index for better performance
CREATE INDEX idx_products_version ON products(id, version);
```

### Backend Implementation

#### 1. Repository Pattern with Version Check

```typescript
// libs/shared/repositories/base.repository.ts
export class BaseRepository<T> {
  /**
   * Update with optimistic locking
   * Throws ConflictError if version mismatch
   */
  async updateWithVersion(id: string, updates: Partial<T>, expectedVersion: number): Promise<T> {
    const trx = await this.knex.transaction();

    try {
      // Check current version
      const current = await trx(this.tableName).where({ id }).first();

      if (!current) {
        throw new NotFoundError(`${this.tableName} not found`);
      }

      if (current.version !== expectedVersion) {
        throw new ConflictError(`Data has been modified by another user. Please refresh and try again.`, {
          currentVersion: current.version,
          expectedVersion,
        });
      }

      // Update with version increment
      const [updated] = await trx(this.tableName)
        .where({ id, version: expectedVersion })
        .update({
          ...updates,
          version: expectedVersion + 1,
          updated_at: new Date(),
        })
        .returning('*');

      await trx.commit();
      return updated;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
```

#### 2. Service Layer

```typescript
// apps/api/src/modules/inventory/inventory.service.ts
export class InventoryService {
  async updateStock(id: string, quantity: number, version: number, userId: string): Promise<Inventory> {
    try {
      return await this.repository.updateWithVersion(id, { quantity }, version);
    } catch (error) {
      if (error instanceof ConflictError) {
        // Log conflict for monitoring
        this.logger.warn('Optimistic lock conflict', {
          resource: 'inventory',
          id,
          expectedVersion: version,
          actualVersion: error.details.currentVersion,
        });
      }
      throw error;
    }
  }
}
```

#### 3. Controller with Error Handling

```typescript
// apps/api/src/modules/inventory/inventory.controller.ts
export class InventoryController {
  async updateStock(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateStockRequest;
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { quantity, version } = request.body;

    try {
      const updated = await this.inventoryService.updateStock(id, quantity, version, request.user.id);

      return reply.code(200).send({
        success: true,
        data: updated,
      });
    } catch (error) {
      if (error instanceof ConflictError) {
        return reply.code(409).send({
          success: false,
          error: 'CONFLICT',
          message: error.message,
          details: error.details,
        });
      }
      throw error;
    }
  }
}
```

### Frontend Implementation

#### 1. Angular Service with Retry

```typescript
// apps/web/src/app/features/inventory/inventory.service.ts
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly MAX_RETRIES = 3;

  async updateStock(id: string, quantity: number, version: number): Promise<Inventory> {
    let retries = 0;

    while (retries < this.MAX_RETRIES) {
      try {
        const response = await this.http.patch<ApiResponse<Inventory>>(`/api/inventory/${id}`, { quantity, version }).toPromise();

        return response.data;
      } catch (error: any) {
        if (error.status === 409) {
          retries++;

          if (retries >= this.MAX_RETRIES) {
            throw new Error('Unable to save changes after multiple attempts. ' + 'Please refresh the page and try again.');
          }

          // Fetch latest version and retry
          const latest = await this.getById(id);
          version = latest.version;

          // Wait before retry (exponential backoff)
          await this.delay(100 * Math.pow(2, retries));
        } else {
          throw error;
        }
      }
    }

    throw new Error('Max retries exceeded');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

#### 2. Component with User Feedback

```typescript
// apps/web/src/app/features/inventory/edit-dialog.component.ts
@Component({
  selector: 'app-inventory-edit-dialog',
  template: `
    <h2 mat-dialog-title>Edit Inventory</h2>

    @if (conflictDetected()) {
      <mat-error class="conflict-warning"> ⚠️ This item was modified by another user. The form has been updated with the latest data. </mat-error>
    }

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <input matInput formControlName="quantity" type="number" />
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit">Save</button>
    </form>
  `,
})
export class InventoryEditDialogComponent {
  form = this.fb.group({
    quantity: [0, Validators.required],
  });

  conflictDetected = signal(false);
  private currentVersion: number;

  async onSubmit() {
    try {
      const quantity = this.form.value.quantity!;

      await this.inventoryService.updateStock(this.data.id, quantity, this.currentVersion);

      this.dialogRef.close({ success: true });
    } catch (error: any) {
      if (error.message.includes('multiple attempts')) {
        // Show conflict warning
        this.conflictDetected.set(true);

        // Reload latest data
        const latest = await this.inventoryService.getById(this.data.id);
        this.form.patchValue({ quantity: latest.quantity });
        this.currentVersion = latest.version;
      } else {
        this.snackBar.open('Failed to save changes', 'Close');
      }
    }
  }
}
```

### Schema Definition

```typescript
// apps/api/src/modules/inventory/inventory.schemas.ts
export const UpdateStockRequestSchema = Type.Object({
  quantity: Type.Integer({ minimum: 0 }),
  version: Type.Integer({ minimum: 1 }), // Required for optimistic locking
});

export type UpdateStockRequest = Static<typeof UpdateStockRequestSchema>;
```

---

## Pessimistic Locking

### Strategy Overview

**Concept:** Lock rows to prevent concurrent modifications

**Mechanism:** Use `SELECT ... FOR UPDATE` to acquire row-level locks

**Pros:**

- ✅ Guaranteed consistency
- ✅ No retry logic needed
- ✅ Suitable for high-conflict scenarios

**Cons:**

- ❌ Lower performance (lock contention)
- ❌ Potential deadlocks
- ❌ Must manage lock duration

### Backend Implementation

#### 1. Row-Level Locking

```typescript
// apps/api/src/modules/orders/orders.service.ts
export class OrdersService {
  /**
   * Process order with pessimistic locking
   * Prevents overselling by locking inventory rows
   */
  async processOrder(items: OrderItem[], userId: string): Promise<Order> {
    const trx = await this.knex.transaction();

    try {
      // Lock inventory rows (blocks other transactions)
      const inventoryIds = items.map((item) => item.productId);
      const inventory = await trx('inventory')
        .whereIn('product_id', inventoryIds)
        .forUpdate() // 🔒 Pessimistic lock
        .select();

      // Check stock availability
      for (const item of items) {
        const stock = inventory.find((inv) => inv.product_id === item.productId);

        if (!stock || stock.quantity < item.quantity) {
          throw new BadRequestError(`Insufficient stock for product ${item.productId}`);
        }
      }

      // Create order
      const [order] = await trx('orders')
        .insert({
          user_id: userId,
          total: this.calculateTotal(items),
          status: 'pending',
        })
        .returning('*');

      // Update inventory (locked rows)
      for (const item of items) {
        await trx('inventory').where({ product_id: item.productId }).decrement('quantity', item.quantity);
      }

      await trx.commit();
      return order;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
```

#### 2. Lock Timeout Configuration

```typescript
// apps/api/src/config/database.config.ts
export const databaseConfig = {
  client: 'postgresql',
  connection: {
    // ...
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 5000, // Wait max 5s for connection
  },
  // PostgreSQL lock timeout
  postProcessResponse: (result: any) => {
    // Set lock timeout for all queries
    return result;
  },
};

// Set session lock timeout
async function setLockTimeout(knex: Knex) {
  await knex.raw('SET lock_timeout = 5000'); // 5 seconds
}
```

### Lock Wait Timeout Handling

```typescript
// apps/api/src/modules/orders/orders.controller.ts
export class OrdersController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const order = await this.ordersService.processOrder(request.body.items, request.user.id);

      return reply.code(201).send({ success: true, data: order });
    } catch (error: any) {
      // Handle lock timeout
      if (error.message.includes('lock timeout') || error.message.includes('deadlock detected')) {
        return reply.code(503).send({
          success: false,
          error: 'SERVICE_UNAVAILABLE',
          message: 'System is busy. Please try again.',
        });
      }
      throw error;
    }
  }
}
```

---

## Transaction Isolation

### Isolation Levels

| Level                | Dirty Read | Non-Repeatable Read | Phantom Read | Use Case              |
| -------------------- | ---------- | ------------------- | ------------ | --------------------- |
| **READ UNCOMMITTED** | ❌ Yes     | ❌ Yes              | ❌ Yes       | Never use             |
| **READ COMMITTED**   | ✅ No      | ❌ Yes              | ❌ Yes       | Default (most cases)  |
| **REPEATABLE READ**  | ✅ No      | ✅ No               | ❌ Yes       | Reports, analytics    |
| **SERIALIZABLE**     | ✅ No      | ✅ No               | ✅ No        | Critical transactions |

### PostgreSQL Default: READ COMMITTED

```typescript
// Default isolation level - suitable for most cases
const trx = await knex.transaction();
// Isolation: READ COMMITTED (PostgreSQL default)
```

### REPEATABLE READ for Reports

```typescript
/**
 * Generate consistent report snapshot
 * Prevents changes during report generation
 */
async generateSalesReport(startDate: Date, endDate: Date) {
  const trx = await this.knex.transaction({
    isolationLevel: 'repeatable read',
  });

  try {
    const sales = await trx('sales')
      .whereBetween('created_at', [startDate, endDate])
      .sum('amount');

    const orders = await trx('orders')
      .whereBetween('created_at', [startDate, endDate])
      .count();

    // Both queries see consistent snapshot
    await trx.commit();

    return { sales, orders };
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
```

### SERIALIZABLE for Critical Operations

```typescript
/**
 * Transfer funds between accounts
 * Requires highest isolation level
 */
async transferFunds(
  fromAccountId: string,
  toAccountId: string,
  amount: number
) {
  const trx = await this.knex.transaction({
    isolationLevel: 'serializable',
  });

  try {
    // Deduct from source account
    const [fromAccount] = await trx('accounts')
      .where({ id: fromAccountId })
      .decrement('balance', amount)
      .returning('*');

    if (fromAccount.balance < 0) {
      throw new BadRequestError('Insufficient funds');
    }

    // Add to destination account
    await trx('accounts')
      .where({ id: toAccountId })
      .increment('balance', amount);

    await trx.commit();
  } catch (error) {
    await trx.rollback();

    // Handle serialization errors
    if (error.code === '40001') { // Serialization failure
      throw new ConflictError(
        'Transaction conflict. Please retry.'
      );
    }
    throw error;
  }
}
```

---

## Deadlock Prevention

### What is a Deadlock?

```
Transaction A: Locks Row 1 → Waits for Row 2
Transaction B: Locks Row 2 → Waits for Row 1
Result: Both wait forever (deadlock)
```

### Prevention Strategies

#### 1. Consistent Lock Ordering

```typescript
// ❌ BAD: Random lock order → Deadlock risk
async transferBetweenAccounts(account1: string, account2: string) {
  const trx = await this.knex.transaction();

  await trx('accounts').where({ id: account1 }).forUpdate();
  await trx('accounts').where({ id: account2 }).forUpdate(); // Deadlock!
}

// ✅ GOOD: Sorted lock order → No deadlock
async transferBetweenAccounts(account1: string, account2: string) {
  const trx = await this.knex.transaction();

  // Always lock in sorted order
  const [id1, id2] = [account1, account2].sort();

  await trx('accounts').where({ id: id1 }).forUpdate();
  await trx('accounts').where({ id: id2 }).forUpdate(); // Safe
}
```

#### 2. Lock All Resources Upfront

```typescript
// ✅ GOOD: Lock all rows at once
async processMultipleOrders(orderIds: string[]) {
  const trx = await this.knex.transaction();

  try {
    // Lock all orders in single query
    const orders = await trx('orders')
      .whereIn('id', orderIds)
      .orderBy('id') // Consistent order
      .forUpdate();

    // Process all orders
    for (const order of orders) {
      await this.processOrder(order, trx);
    }

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
```

#### 3. Keep Transactions Short

```typescript
// ❌ BAD: Long transaction with external API call
async processPayment(orderId: string) {
  const trx = await this.knex.transaction();

  const order = await trx('orders').where({ id: orderId }).forUpdate();

  // External API call inside transaction (BAD!)
  await this.paymentGateway.charge(order.amount); // Slow!

  await trx('orders').where({ id: orderId }).update({ status: 'paid' });
  await trx.commit();
}

// ✅ GOOD: Minimize transaction duration
async processPayment(orderId: string) {
  // External call OUTSIDE transaction
  const paymentResult = await this.paymentGateway.charge(orderId);

  // Short transaction to update status
  const trx = await this.knex.transaction();
  await trx('orders')
    .where({ id: orderId })
    .update({
      status: 'paid',
      payment_id: paymentResult.id
    });
  await trx.commit();
}
```

### Deadlock Detection and Retry

```typescript
// apps/api/src/utils/retry-on-deadlock.ts
export async function retryOnDeadlock<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      // PostgreSQL deadlock error code
      if (error.code === '40P01' && attempt < maxRetries) {
        // Wait with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
await retryOnDeadlock(async () => {
  return await this.transferFunds(fromId, toId, amount);
});
```

---

## Race Condition Prevention

### Common Race Conditions

#### 1. Counter Increment

```typescript
// ❌ BAD: Read-modify-write race condition
async incrementViews(articleId: string) {
  const article = await this.knex('articles')
    .where({ id: articleId })
    .first();

  // Another request might increment between read and write
  await this.knex('articles')
    .where({ id: articleId })
    .update({ views: article.views + 1 });
}

// ✅ GOOD: Atomic increment
async incrementViews(articleId: string) {
  await this.knex('articles')
    .where({ id: articleId })
    .increment('views', 1); // Atomic operation
}
```

#### 2. Insert If Not Exists

```typescript
// ❌ BAD: Check-then-insert race condition
async createUniqueRecord(username: string) {
  const exists = await this.knex('users')
    .where({ username })
    .first();

  if (!exists) {
    // Another request might insert between check and insert
    await this.knex('users').insert({ username });
  }
}

// ✅ GOOD: Use database constraint + handle conflict
async createUniqueRecord(username: string) {
  try {
    await this.knex('users').insert({ username });
  } catch (error: any) {
    // Unique constraint violation
    if (error.code === '23505') {
      throw new ConflictError('Username already exists');
    }
    throw error;
  }
}

// Database migration
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);
```

#### 3. Idempotent Operations

```typescript
// ✅ Use unique constraint for idempotency
export const CreatePaymentSchema = Type.Object({
  orderId: Type.String({ format: 'uuid' }),
  amount: Type.Number(),
  idempotencyKey: Type.String({ format: 'uuid' }), // Client-generated
});

async processPayment(data: CreatePaymentRequest) {
  try {
    return await this.knex('payments').insert({
      id: data.idempotencyKey, // Use idempotency key as ID
      order_id: data.orderId,
      amount: data.amount,
    }).returning('*');
  } catch (error: any) {
    if (error.code === '23505') {
      // Payment already processed, return existing
      return await this.knex('payments')
        .where({ id: data.idempotencyKey })
        .first();
    }
    throw error;
  }
}
```

---

## Distributed Locking

### When to Use Redis Locks

**Use Cases:**

- ✅ **Scheduled jobs** - Prevent duplicate execution across multiple servers
- ✅ **Rate limiting** - Enforce limits across multiple instances
- ✅ **Cache warm-up** - Only one server rebuilds cache
- ✅ **Resource allocation** - Distribute work across servers

### Implementation with Redlock

```typescript
// apps/api/src/services/redis-lock.service.ts
import Redlock from 'redlock';

@Injectable()
export class RedisLockService {
  private redlock: Redlock;

  constructor(private redis: Redis) {
    this.redlock = new Redlock([redis], {
      retryCount: 10,
      retryDelay: 200, // ms
      retryJitter: 200, // ms
    });
  }

  /**
   * Acquire distributed lock
   * @param resource Unique lock identifier
   * @param ttl Lock duration in milliseconds
   */
  async acquireLock(resource: string, ttl: number = 10000): Promise<Redlock.Lock> {
    try {
      return await this.redlock.acquire([`locks:${resource}`], ttl);
    } catch (error) {
      throw new ConflictError(`Unable to acquire lock for ${resource}`);
    }
  }

  /**
   * Execute function with lock
   */
  async withLock<T>(resource: string, fn: () => Promise<T>, ttl: number = 10000): Promise<T> {
    const lock = await this.acquireLock(resource, ttl);

    try {
      return await fn();
    } finally {
      await lock.release();
    }
  }
}
```

### Example: Prevent Duplicate Job Execution

```typescript
// apps/api/src/jobs/daily-report.job.ts
export class DailyReportJob {
  async execute() {
    // Only one server should run this job
    await this.redisLock.withLock(
      'daily-report-job',
      async () => {
        await this.generateReport();
      },
      60000, // 60 second lock
    );
  }

  private async generateReport() {
    // Generate report logic
  }
}
```

### Example: Rate Limiting Across Servers

```typescript
// apps/api/src/middleware/rate-limit.middleware.ts
export class RateLimitMiddleware {
  async checkRateLimit(userId: string): Promise<boolean> {
    const key = `rate-limit:${userId}`;

    return await this.redisLock.withLock(
      `rate-limit-check:${userId}`,
      async () => {
        const current = await this.redis.incr(key);

        if (current === 1) {
          await this.redis.expire(key, 60); // 1 minute window
        }

        return current <= 100; // 100 requests per minute
      },
      100, // Short lock
    );
  }
}
```

---

## Concurrency Patterns

### 1. Bulk Update with Version Check

```typescript
async bulkUpdateWithVersion(
  updates: Array<{ id: string; data: any; version: number }>
): Promise<BulkUpdateResult> {
  const results = {
    success: [] as string[],
    conflicts: [] as string[],
    errors: [] as string[],
  };

  for (const update of updates) {
    try {
      await this.repository.updateWithVersion(
        update.id,
        update.data,
        update.version
      );
      results.success.push(update.id);
    } catch (error) {
      if (error instanceof ConflictError) {
        results.conflicts.push(update.id);
      } else {
        results.errors.push(update.id);
      }
    }
  }

  return results;
}
```

### 2. Compare-and-Swap (CAS)

```typescript
/**
 * Update only if current value matches expected
 */
async compareAndSwap(
  id: string,
  field: string,
  expectedValue: any,
  newValue: any
): Promise<boolean> {
  const [updated] = await this.knex(this.tableName)
    .where({ id, [field]: expectedValue })
    .update({ [field]: newValue })
    .returning('*');

  return !!updated; // Returns false if no match
}

// Usage: Update status only if currently 'pending'
const success = await repository.compareAndSwap(
  orderId,
  'status',
  'pending',
  'processing'
);
```

### 3. Event Sourcing Pattern

```typescript
// Store all changes as immutable events
export class EventStore {
  async appendEvent(event: DomainEvent) {
    await this.knex('events').insert({
      aggregate_id: event.aggregateId,
      event_type: event.type,
      event_data: event.data,
      version: event.version,
      timestamp: new Date(),
    });
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return await this.knex('events').where({ aggregate_id: aggregateId }).orderBy('version', 'asc');
  }

  async getCurrentState(aggregateId: string): Promise<any> {
    const events = await this.getEvents(aggregateId);
    return this.replayEvents(events);
  }
}
```

---

## Testing Concurrency

### Unit Tests for Optimistic Locking

```typescript
// apps/api/src/modules/inventory/inventory.service.spec.ts
describe('InventoryService - Concurrency', () => {
  it('should prevent concurrent updates with version mismatch', async () => {
    const item = await repository.create({ quantity: 100, version: 1 });

    // Both requests have version 1
    const update1 = repository.updateWithVersion(item.id, { quantity: 90 }, 1);
    const update2 = repository.updateWithVersion(item.id, { quantity: 80 }, 1);

    await expect(Promise.all([update1, update2])).rejects.toThrow(ConflictError);

    // One should succeed, one should fail
    const final = await repository.findById(item.id);
    expect([90, 80]).toContain(final.quantity);
    expect(final.version).toBe(2);
  });

  it('should retry on conflict', async () => {
    const item = await repository.create({ quantity: 100, version: 1 });

    // Simulate concurrent modification
    setTimeout(async () => {
      await repository.updateWithVersion(item.id, { quantity: 95 }, 1);
    }, 50);

    // Service should retry with new version
    const result = await service.updateStockWithRetry(item.id, 90, 1);
    expect(result.quantity).toBe(90);
    expect(result.version).toBe(3); // Incremented twice
  });
});
```

### Integration Tests for Pessimistic Locking

```typescript
describe('OrdersService - Pessimistic Locking', () => {
  it('should prevent overselling with concurrent orders', async () => {
    // Setup: Product with 10 units
    const product = await productRepo.create({
      name: 'Test',
      stock: 10,
    });

    // Two concurrent orders for 8 units each
    const order1Promise = orderService.create({
      items: [{ productId: product.id, quantity: 8 }],
    });

    const order2Promise = orderService.create({
      items: [{ productId: product.id, quantity: 8 }],
    });

    // One should succeed, one should fail
    const results = await Promise.allSettled([order1Promise, order2Promise]);

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    expect(succeeded).toBe(1);
    expect(failed).toBe(1);

    // Final stock should be 2 (10 - 8)
    const finalProduct = await productRepo.findById(product.id);
    expect(finalProduct.stock).toBe(2);
  });
});
```

### Load Testing with Artillery

```yaml
# concurrency-test.yml
config:
  target: 'http://localhost:3333'
  phases:
    - duration: 60
      arrivalRate: 50 # 50 concurrent users

scenarios:
  - name: 'Concurrent inventory updates'
    flow:
      - get:
          url: '/api/inventory/{{ productId }}'
          capture:
            - json: '$.version'
              as: 'version'
      - patch:
          url: '/api/inventory/{{ productId }}'
          json:
            quantity: 50
            version: '{{ version }}'
```

---

## Concurrency Checklist

### ✅ Planning Phase

- [ ] Identify high-contention resources (inventory, accounts, counters)
- [ ] Choose appropriate locking strategy (optimistic vs pessimistic)
- [ ] Design version tracking for optimistic locking
- [ ] Plan transaction boundaries
- [ ] Document expected concurrency behavior

### ✅ Database Schema

- [ ] Add `version` column for optimistic locking
- [ ] Add unique constraints to prevent duplicates
- [ ] Create proper indexes on lock columns
- [ ] Set appropriate transaction isolation levels
- [ ] Configure lock timeout settings

### ✅ Backend Implementation

- [ ] Implement version checking in repositories
- [ ] Use database transactions for atomic operations
- [ ] Lock resources in consistent order (prevent deadlocks)
- [ ] Keep transactions short (minimize lock duration)
- [ ] Handle ConflictError and retry logic
- [ ] Add deadlock detection and retry
- [ ] Implement distributed locking for multi-server scenarios
- [ ] Use atomic operations (increment, compare-and-swap)

### ✅ Frontend Implementation

- [ ] Include version in update requests
- [ ] Handle 409 Conflict responses
- [ ] Implement automatic retry with exponential backoff
- [ ] Show user-friendly conflict messages
- [ ] Refresh data on conflict
- [ ] Prevent double-submit (disable button during save)

### ✅ Testing

- [ ] Unit tests for version mismatch scenarios
- [ ] Integration tests for concurrent operations
- [ ] Load tests with concurrent users
- [ ] Deadlock scenario tests
- [ ] Race condition tests
- [ ] Distributed lock tests (multi-server)

### ✅ Monitoring

- [ ] Log optimistic lock conflicts
- [ ] Track deadlock occurrences
- [ ] Monitor transaction durations
- [ ] Alert on high conflict rates
- [ ] Dashboard for concurrency metrics

### ✅ Documentation

- [ ] Document locking strategy in API contracts
- [ ] Explain conflict handling to frontend team
- [ ] Document retry logic and limits
- [ ] Add concurrency examples in developer guide

---

## Best Practices Summary

### DO ✅

- **Use optimistic locking by default** - Best performance for most cases
- **Add version column** - Track changes and detect conflicts
- **Lock in sorted order** - Prevent deadlocks
- **Keep transactions short** - Minimize lock contention
- **Use atomic operations** - Increment, compare-and-swap
- **Handle conflicts gracefully** - Retry with exponential backoff
- **Test concurrency** - Simulate concurrent operations
- **Monitor conflicts** - Track and alert on high conflict rates

### DON'T ❌

- **Don't use optimistic locking for high-conflict scenarios** - Use pessimistic instead
- **Don't hold locks during external API calls** - Keep transactions fast
- **Don't ignore version mismatches** - Always handle conflicts
- **Don't use READ UNCOMMITTED** - Leads to dirty reads
- **Don't lock randomly** - Use consistent order to prevent deadlocks
- **Don't skip retry logic** - Conflicts will happen, handle them
- **Don't forget distributed locks** - Multi-server needs Redis locks

---

## Related Standards

- **[Performance & Scalability Guidelines](./performance-scalability-guidelines.md)** - Transaction optimization
- **[Security Best Practices](./security-best-practices.md)** - Transaction security
- **[Audit & Compliance Framework](./audit-compliance-framework.md)** - Audit concurrent operations

---

**Last Updated:** 2025-11-01
**Version:** 1.0.0
