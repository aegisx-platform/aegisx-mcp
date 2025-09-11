# Performance & Optimization

## Database Performance

### Query Optimization

```typescript
// Efficient pagination with cursor-based pagination
async function getCursorPaginatedUsers(cursor?: string, limit: number = 20) {
  const query = knex('users')
    .select('*')
    .where('is_active', true)
    .orderBy('created_at', 'desc')
    .limit(limit + 1); // +1 to check if there's next page

  if (cursor) {
    query.where('created_at', '<', cursor);
  }

  const users = await query;
  const hasNextPage = users.length > limit;

  if (hasNextPage) users.pop();

  return {
    data: users,
    hasNextPage,
    nextCursor: hasNextPage ? users[users.length - 1].created_at : null,
  };
}
```

### Connection Pooling

```typescript
// Optimized Knex configuration
const dbConfig = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 5,
    max: 20,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  },
  acquireConnectionTimeout: 60000,
};
```

### Query Caching

```typescript
// Redis caching for expensive queries
async function getCachedUsers(cacheKey: string) {
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const users = await userRepository.list({ limit: 100 });
  await redis.setex(cacheKey, 300, JSON.stringify(users)); // 5 min cache

  return users;
}
```

## API Performance

### Response Compression

```typescript
// Enable compression
await app.register(import('@fastify/compress'), {
  encodings: ['gzip', 'deflate'],
  threshold: 1024,
});
```

### Rate Limiting

```typescript
// Tiered rate limiting
await app.register(import('@fastify/rate-limit'), {
  max: async (request) => {
    const user = request.user as any;
    if (user?.role === 'admin') return 1000;
    if (user?.role === 'premium') return 500;
    return 100;
  },
  timeWindow: '1 minute',
});
```

### Response Caching

```typescript
// HTTP caching headers
fastify.addHook('onSend', async (request, reply, payload) => {
  if (request.method === 'GET' && !request.user) {
    reply.header('Cache-Control', 'public, max-age=300'); // 5 minutes
  }
  return payload;
});
```

## Frontend Performance

### Angular Optimization

```typescript
// OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class OptimizedComponent {
  // Use signals for reactive data
  data = signal<any[]>([]);

  // Computed values
  filteredData = computed(() => this.data().filter((item) => item.active));
}
```

### Lazy Loading

```typescript
// Lazy load feature modules
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./features/users/user.routes').then((m) => m.userRoutes),
  },
];
```

### Virtual Scrolling

```html
<!-- For large lists -->
<cdk-virtual-scroll-viewport itemSize="50" class="h-96">
  <div *cdkVirtualFor="let user of users()">{{ user.name }}</div>
</cdk-virtual-scroll-viewport>
```

## Monitoring Performance

### Key Metrics to Track

```typescript
// Performance monitoring
const metrics = {
  responseTime: {
    p50: 50, // Target: <100ms
    p95: 200, // Target: <500ms
    p99: 500, // Target: <1000ms
  },
  errorRate: 1, // Target: <5%
  throughput: 1000, // requests/sec
  uptime: 99.9, // Target: >99.5%
};
```

### Database Performance Monitoring

```sql
-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Connection pool monitoring
SELECT count(*), state
FROM pg_stat_activity
GROUP BY state;
```

## Performance Best Practices

### Backend

1. **Database**: Use indexes, connection pooling, query optimization
2. **Caching**: Redis for session/query caching
3. **Compression**: Enable gzip compression
4. **Rate Limiting**: Protect against abuse
5. **Async**: Non-blocking operations

### Frontend

1. **Lazy Loading**: Code splitting by feature
2. **OnPush**: Optimize change detection
3. **Signals**: Reactive data management
4. **Virtual Scrolling**: Large lists
5. **Image Optimization**: WebP, lazy loading

### Infrastructure

1. **CDN**: Static asset delivery
2. **Load Balancing**: Horizontal scaling
3. **Database Replicas**: Read replicas
4. **Monitoring**: APM tools
5. **Caching**: Multiple cache layers
