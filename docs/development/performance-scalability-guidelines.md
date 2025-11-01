# Performance & Scalability Guidelines

> **Enterprise-grade performance and scalability best practices**

**Version:** 1.0.0
**Last Updated:** 2025-11-01
**Target Audience:** Backend/Frontend Developers, Database Engineers, DevOps

---

## 📋 Table of Contents

- [Overview](#overview)
- [Database Performance](#database-performance)
- [Caching Strategies](#caching-strategies)
- [Bulk Operations](#bulk-operations)
- [Pagination & Filtering](#pagination--filtering)
- [API Performance](#api-performance)
- [Frontend Performance](#frontend-performance)
- [Monitoring & Profiling](#monitoring--profiling)
- [Performance Checklist](#performance-checklist)

---

## Overview

This guide provides performance and scalability best practices for building enterprise applications. All recommendations are based on proven patterns used in high-traffic production systems.

### Performance Principles

1. **Measure First** - Profile before optimizing
2. **Optimize Bottlenecks** - Focus on the slowest parts
3. **Think at Scale** - Design for 10x current load
4. **Cache Wisely** - Cache expensive operations, not everything
5. **Fail Gracefully** - Performance degradation > complete failure

---

## Database Performance

### Query Optimization Checklist

**Before writing ANY database query:**

- [ ] Select only needed columns (avoid `SELECT *`)
- [ ] Add WHERE conditions before joins
- [ ] Use proper indexes on filtered/joined columns
- [ ] Limit results for list queries
- [ ] Use COUNT properly (avoid fetching all rows)
- [ ] Check for N+1 queries
- [ ] Use transactions for multiple related queries

### Index Strategy

#### Always Index These Columns

```typescript
// Migration example
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary(); // ✅ Primary key (automatic index)
    table.uuid('user_id').notNullable(); // Foreign key
    table.string('sku', 50).notNullable(); // Frequently searched
    table.string('name', 255).notNullable(); // Frequently searched
    table.enum('status', ['active', 'inactive', 'archived']); // Filtered
    table.timestamp('created_at').defaultTo(knex.fn.now()); // Date range queries
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // ✅ Add indexes
    table.index('user_id'); // Foreign key
    table.index('sku'); // Unique search
    table.index('status'); // Filter
    table.index('created_at'); // Date range
    table.index(['status', 'created_at']); // Composite for common query
  });
}
```

#### Index Guidelines

**DO index:**

- Primary keys (automatic)
- Foreign keys (`user_id`, `product_id`, etc.)
- Frequently searched columns (`email`, `username`, `sku`)
- Status/enum columns used in WHERE clauses
- Date columns for range queries
- Composite indexes for common multi-column queries

**DON'T over-index:**

- Rarely queried columns
- High-cardinality text fields (descriptions, comments)
- Boolean columns (too few distinct values)
- Columns with many NULL values

### N+1 Query Prevention

**Problem: N+1 Queries**

```typescript
// ❌ BAD: This creates N+1 queries (1 + N where N = number of users)
async function getUsersWithPosts() {
  const users = await knex('users').select('*');

  for (const user of users) {
    // This runs N times!
    const posts = await knex('posts').where({ user_id: user.id });
    user.posts = posts;
  }

  return users;
}
```

**Solution 1: Join with Aggregation**

```typescript
// ✅ GOOD: Single query with join
async function getUsersWithPosts() {
  const users = await knex('users').leftJoin('posts', 'users.id', 'posts.user_id').select('users.*', knex.raw("COALESCE(json_agg(posts.* ORDER BY posts.created_at DESC) FILTER (WHERE posts.id IS NOT NULL), '[]') as posts")).groupBy('users.id');

  return users;
}
```

**Solution 2: Separate Queries with Map**

```typescript
// ✅ GOOD: Two queries instead of N+1
async function getUsersWithPosts() {
  const users = await knex('users').select('*');
  const userIds = users.map((u) => u.id);

  // Single query for all posts
  const posts = await knex('posts').whereIn('user_id', userIds).orderBy('created_at', 'desc');

  // Map posts to users
  const postsMap = posts.reduce((acc, post) => {
    if (!acc[post.user_id]) acc[post.user_id] = [];
    acc[post.user_id].push(post);
    return acc;
  }, {});

  users.forEach((user) => {
    user.posts = postsMap[user.id] || [];
  });

  return users;
}
```

### Query Analysis Tools

**Use EXPLAIN ANALYZE to understand query performance:**

```typescript
// Analyze query performance
async function analyzeQuery() {
  const result = await knex.raw(`
    EXPLAIN ANALYZE
    SELECT u.*, COUNT(p.id) as post_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    WHERE u.status = 'active'
    GROUP BY u.id
    LIMIT 20
  `);

  console.log(result.rows);

  // Look for:
  // - Seq Scan (bad) vs Index Scan (good)
  // - Execution time
  // - Rows scanned vs rows returned
}
```

**Slow Query Logging:**

```typescript
// Log slow queries (>100ms)
knex.on('query', (query) => {
  const start = Date.now();

  query.response.then(() => {
    const duration = Date.now() - start;

    if (duration > 100) {
      console.warn(`Slow query (${duration}ms):`, query.sql);
    }
  });
});
```

### Connection Pooling

**Configure connection pool for optimal performance:**

```typescript
// knexfile.ts
export default {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    // Destroy connections after 1 hour idle
    idleTimeoutMillis: 3600000,
    // Acquire connection timeout
    acquireTimeoutMillis: 30000,
  },
};
```

**Pool Size Guidelines:**

- **Development:** min: 2, max: 10
- **Production (single instance):** min: 5, max: 20
- **Production (multiple instances):** Calculate: `(max_connections / num_instances) - buffer`
- **High traffic:** Consider read replicas

---

## Caching Strategies

### When to Cache

**CACHE these:**

- ✅ Expensive database queries (complex joins, aggregations)
- ✅ External API calls
- ✅ Computed/calculated values
- ✅ Static/rarely changing data (settings, configs)
- ✅ Session data
- ✅ Rate limiting counters

**DON'T cache these:**

- ❌ Real-time data (stock prices, live updates)
- ❌ User-specific sensitive data (unless encrypted)
- ❌ Data that changes frequently (< 5 seconds)
- ❌ Large objects (> 1MB each)

### Redis Caching Patterns

#### 1. Cache-Aside Pattern (Most Common)

```typescript
// Service method with cache-aside
async function getProductById(id: string): Promise<Product> {
  const cacheKey = `product:${id}`;

  // 1. Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Cache miss - fetch from database
  const product = await knex('products').where({ id }).first();

  if (!product) {
    throw new Error('Product not found');
  }

  // 3. Store in cache (TTL: 1 hour)
  await redis.setex(cacheKey, 3600, JSON.stringify(product));

  return product;
}
```

#### 2. Write-Through Pattern

```typescript
// Update database AND cache simultaneously
async function updateProduct(id: string, updates: UpdateProduct): Promise<Product> {
  // 1. Update database
  const product = await knex('products').where({ id }).update(updates).returning('*').first();

  // 2. Update cache immediately
  const cacheKey = `product:${id}`;
  await redis.setex(cacheKey, 3600, JSON.stringify(product));

  return product;
}
```

#### 3. Cache Invalidation

```typescript
// Invalidate cache after delete
async function deleteProduct(id: string): Promise<void> {
  // 1. Delete from database
  await knex('products').where({ id }).delete();

  // 2. Remove from cache
  await redis.del(`product:${id}`);

  // 3. Also invalidate list caches that might include this product
  await redis.del('products:active');
  await redis.del('products:all');
}
```

#### 4. Cache Multiple Items

```typescript
// Batch cache operations
async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const cacheKeys = ids.map((id) => `product:${id}`);

  // 1. Try to get all from cache
  const cached = await redis.mget(...cacheKeys);

  const results: Product[] = [];
  const missingIds: string[] = [];

  // 2. Identify cache misses
  cached.forEach((item, index) => {
    if (item) {
      results.push(JSON.parse(item));
    } else {
      missingIds.push(ids[index]);
    }
  });

  // 3. Fetch missing items from database
  if (missingIds.length > 0) {
    const products = await knex('products').whereIn('id', missingIds);

    // 4. Store in cache
    const pipeline = redis.pipeline();
    products.forEach((product) => {
      pipeline.setex(`product:${product.id}`, 3600, JSON.stringify(product));
    });
    await pipeline.exec();

    results.push(...products);
  }

  return results;
}
```

### TTL (Time-to-Live) Guidelines

```typescript
const TTL = {
  // Very static data
  SETTINGS: 24 * 3600, // 24 hours
  CONFIGURATIONS: 12 * 3600, // 12 hours

  // Moderately static
  PRODUCT_CATALOG: 3600, // 1 hour
  USER_PROFILE: 1800, // 30 minutes

  // Dynamic but cacheable
  SEARCH_RESULTS: 300, // 5 minutes
  LIST_VIEWS: 60, // 1 minute

  // Rate limiting
  RATE_LIMIT: 60, // 1 minute

  // Session
  SESSION: 7200, // 2 hours
} as const;

// Usage
await redis.setex(`product:${id}`, TTL.PRODUCT_CATALOG, data);
```

### Cache Key Naming Convention

```typescript
// Pattern: {resource}:{id}:{optional-context}

// Single resource
`user:${userId}``product:${productId}`
// Resource list
`products:active``users:by-role:${roleId}`
// Computed values
`stats:daily:${date}``report:monthly:${month}`
// User-specific
`cart:${userId}``wishlist:${userId}`
// Rate limiting
`ratelimit:${userId}:${endpoint}``ratelimit:ip:${ipAddress}`;
```

---

## Bulk Operations

### Batch Insert

**Efficient bulk insert:**

```typescript
async function bulkCreateProducts(products: CreateProduct[]): Promise<void> {
  const BATCH_SIZE = 1000;

  // Process in batches
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    await knex('products')
      .insert(batch)
      .onConflict('sku') // Handle duplicates
      .merge(); // Or .ignore()

    // Optional: Progress tracking
    const progress = Math.min(i + BATCH_SIZE, products.length);
    console.log(`Processed ${progress}/${products.length} products`);
  }
}
```

### Batch Update

```typescript
async function bulkUpdatePrices(updates: { id: string; price: number }[]): Promise<void> {
  // Use transaction for atomic updates
  await knex.transaction(async (trx) => {
    // Build single UPDATE query with CASE
    const query = trx('products')
      .update({
        price: knex.raw(`
          CASE
            ${updates.map((u) => `WHEN id = '${u.id}' THEN ${u.price}`).join(' ')}
          END
        `),
        updated_at: knex.fn.now(),
      })
      .whereIn(
        'id',
        updates.map((u) => u.id),
      );

    await query;
  });
}
```

### Transaction Management

```typescript
async function processOrder(orderId: string): Promise<void> {
  await knex.transaction(async (trx) => {
    // 1. Lock order
    const order = await trx('orders')
      .where({ id: orderId })
      .forUpdate() // Pessimistic lock
      .first();

    if (!order) throw new Error('Order not found');

    // 2. Update inventory
    await trx('products').where({ id: order.product_id }).decrement('stock', order.quantity);

    // 3. Create payment record
    await trx('payments').insert({
      order_id: orderId,
      amount: order.total,
      status: 'pending',
    });

    // 4. Update order status
    await trx('orders').where({ id: orderId }).update({ status: 'processing' });

    // Transaction commits automatically if no errors
  });
}
```

---

## Pagination & Filtering

### Cursor-Based Pagination (Recommended)

**Best for:**

- Large datasets
- Real-time data
- Infinite scroll UIs

```typescript
// API endpoint
async function listProducts(cursor?: string, limit: number = 20): Promise<{ data: Product[]; nextCursor?: string }> {
  let query = knex('products')
    .where({ status: 'active' })
    .orderBy('created_at', 'desc')
    .orderBy('id', 'desc') // Tie-breaker for same timestamp
    .limit(limit + 1); // Fetch one extra to determine if more exists

  // Apply cursor if provided
  if (cursor) {
    const [timestamp, id] = Buffer.from(cursor, 'base64').toString('utf-8').split('|');

    query = query.where(function () {
      this.where('created_at', '<', timestamp).orWhere(function () {
        this.where('created_at', '=', timestamp).where('id', '<', id);
      });
    });
  }

  const results = await query;

  // Check if more results exist
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  // Generate next cursor
  let nextCursor: string | undefined;
  if (hasMore && data.length > 0) {
    const last = data[data.length - 1];
    nextCursor = Buffer.from(`${last.created_at}|${last.id}`).toString('base64');
  }

  return { data, nextCursor };
}
```

### Offset-Based Pagination

**Use only for:**

- Small datasets (< 10,000 rows)
- Fixed page numbers required
- Admin interfaces

```typescript
async function listProductsPaginated(page: number = 1, limit: number = 20): Promise<{ data: Product[]; total: number; pages: number }> {
  const offset = (page - 1) * limit;

  // Run count and fetch in parallel
  const [data, countResult] = await Promise.all([knex('products').where({ status: 'active' }).orderBy('created_at', 'desc').limit(limit).offset(offset), knex('products').where({ status: 'active' }).count('* as count').first()]);

  const total = parseInt((countResult?.count as string) || '0');
  const pages = Math.ceil(total / limit);

  return { data, total, pages };
}
```

### Search & Filter Optimization

```typescript
async function searchProducts(filters: { search?: string; category?: string; minPrice?: number; maxPrice?: number; status?: string[] }): Promise<Product[]> {
  let query = knex('products');

  // Full-text search (if column indexed with GIN/GIST)
  if (filters.search) {
    query = query.whereRaw(`to_tsvector('english', name || ' ' || description) @@ plainto_tsquery('english', ?)`, [filters.search]);
  }

  // Exact match filters (indexed columns)
  if (filters.category) {
    query = query.where({ category: filters.category });
  }

  if (filters.status && filters.status.length > 0) {
    query = query.whereIn('status', filters.status);
  }

  // Range filters
  if (filters.minPrice !== undefined) {
    query = query.where('price', '>=', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.where('price', '<=', filters.maxPrice);
  }

  return query.orderBy('created_at', 'desc').limit(100);
}
```

---

## API Performance

### Response Compression

```typescript
// Register compression plugin in Fastify
import compress from '@fastify/compress';

await fastify.register(compress, {
  global: true,
  threshold: 1024, // Compress responses > 1KB
  encodings: ['gzip', 'deflate'],
});
```

### Rate Limiting

```typescript
// Rate limiting with Redis
import rateLimit from '@fastify/rate-limit';

await fastify.register(rateLimit, {
  global: true,
  max: 100, // 100 requests
  timeWindow: '1 minute',
  redis: fastify.redis,
  keyGenerator: (request) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return request.user?.id || request.ip;
  },
});
```

### Response Payload Optimization

```typescript
// Select only needed fields
async function getUsersAPI(request: FastifyRequest, reply: FastifyReply) {
  const users = await knex('users')
    .select(
      'id',
      'username',
      'email',
      'full_name',
      'avatar_url',
      // ❌ Don't select: password_hash, password_salt, etc.
    )
    .where({ status: 'active' })
    .limit(50);

  return reply.success(users);
}
```

### Timeout Configuration

```typescript
// Set appropriate timeouts
const server = fastify({
  connectionTimeout: 30000, // 30 seconds
  keepAliveTimeout: 5000, // 5 seconds
  requestTimeout: 10000, // 10 seconds for API requests
});
```

---

## Frontend Performance

### Lazy Loading (Angular)

```typescript
// Lazy load feature modules
const routes: Routes = [
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.module').then((m) => m.ProductsModule),
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.module').then((m) => m.OrdersModule),
  },
];
```

### Virtual Scrolling for Long Lists

```typescript
// Use CDK Virtual Scroll for large lists
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let item of items" class="item">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [
    `
      .viewport {
        height: 500px;
        overflow: auto;
      }
      .item {
        height: 50px;
      }
    `,
  ],
})
export class ProductListComponent {
  items = signal<Product[]>([]);
}
```

### Debouncing & Throttling

```typescript
// Debounce search input
export class SearchComponent {
  searchControl = new FormControl('');
  private searchSubject = new Subject<string>();

  constructor() {
    // Debounce: Wait 300ms after user stops typing
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => this.performSearch(term));

    this.searchControl.valueChanges.subscribe((value) => {
      this.searchSubject.next(value || '');
    });
  }

  performSearch(term: string) {
    // API call here
  }
}
```

---

## Monitoring & Profiling

### Performance Metrics to Track

**Backend Metrics:**

- Request duration (p50, p95, p99)
- Database query time
- Cache hit/miss ratio
- Error rate (4xx, 5xx)
- Request throughput (req/sec)

**Database Metrics:**

- Query execution time
- Connection pool usage
- Index hit ratio
- Table bloat
- Long-running queries

**Cache Metrics:**

- Hit rate
- Memory usage
- Eviction rate
- Key expiration

### Slow Query Detection

```typescript
// Log queries slower than threshold
const SLOW_QUERY_THRESHOLD = 100; // ms

knex.on('query', ({ sql, bindings }) => {
  const start = Date.now();

  knex.on('query-response', () => {
    const duration = Date.now() - start;

    if (duration > SLOW_QUERY_THRESHOLD) {
      logger.warn({
        message: 'Slow query detected',
        duration,
        sql,
        bindings,
      });
    }
  });
});
```

---

## Performance Checklist

### Before Deployment

**Database:**

- [ ] All foreign keys have indexes
- [ ] Common query patterns have appropriate indexes
- [ ] No N+1 queries in critical paths
- [ ] Connection pool configured appropriately
- [ ] Query timeout configured

**Caching:**

- [ ] Expensive operations are cached
- [ ] Cache TTL configured appropriately
- [ ] Cache invalidation strategy in place
- [ ] Cache hit rate monitored

**API:**

- [ ] Response compression enabled
- [ ] Rate limiting configured
- [ ] Timeouts configured
- [ ] Large responses paginated

**Frontend:**

- [ ] Lazy loading for routes
- [ ] Virtual scrolling for long lists
- [ ] Debouncing for search/filter
- [ ] Bundle size optimized

**Monitoring:**

- [ ] Slow query logging enabled
- [ ] Performance metrics tracked
- [ ] Error monitoring configured
- [ ] Alert thresholds set

---

**Related Standards:**

- [Security Best Practices](./security-best-practices.md)
- [Audit & Compliance Framework](./audit-compliance-framework.md)
- [Universal Full-Stack Standard](./universal-fullstack-standard.md)

**Last Updated:** 2025-11-01 | **Version:** 1.0.0
