# Search & Analytics

## Full-Text Search with PostgreSQL

### Search Plugin Setup

```typescript
// apps/api/src/plugins/search.plugin.ts
import fp from 'fastify-plugin';

const searchPlugin: FastifyPluginAsync = async (fastify) => {
  const searchService = new SearchService(fastify);
  fastify.decorate('searchService', searchService);
};

export default fp(searchPlugin, {
  name: 'search-plugin',
  dependencies: ['knex-plugin'],
});

declare module 'fastify' {
  interface FastifyInstance {
    searchService: SearchService;
  }
}
```

### PostgreSQL Full-Text Search

```typescript
// apps/api/src/services/search.service.ts
export class SearchService {
  constructor(private fastify: FastifyInstance) {}

  async searchUsers(query: string, filters: any = {}): Promise<any> {
    const searchQuery = this.fastify
      .knex('users')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .select(
        'users.*',
        'roles.name as role_name',
        this.fastify.knex.raw(
          `
          ts_rank(
            to_tsvector('english', 
              coalesce(users.first_name, '') || ' ' ||
              coalesce(users.last_name, '') || ' ' ||
              coalesce(users.email, '') || ' ' ||
              coalesce(users.username, '')
            ),
            plainto_tsquery('english', ?)
          ) as rank
        `,
          [query],
        ),
      )
      .whereRaw(
        `
        to_tsvector('english', 
          coalesce(users.first_name, '') || ' ' ||
          coalesce(users.last_name, '') || ' ' ||
          coalesce(users.email, '') || ' ' ||
          coalesce(users.username, '')
        ) @@ plainto_tsquery('english', ?)
      `,
        [query],
      )
      .orderBy('rank', 'desc');

    // Apply additional filters
    if (filters.role) {
      searchQuery.where('roles.name', filters.role);
    }

    if (filters.status) {
      searchQuery.where('users.is_active', filters.status === 'active');
    }

    const results = await searchQuery;
    return results;
  }

  async searchGlobal(query: string, types: string[] = []): Promise<GlobalSearchResult> {
    const results: GlobalSearchResult = {
      users: [],
      orders: [],
      products: [],
      total: 0,
    };

    // Search users
    if (!types.length || types.includes('users')) {
      results.users = await this.searchUsers(query);
    }

    // Search orders
    if (!types.length || types.includes('orders')) {
      results.orders = await this.searchOrders(query);
    }

    // Search products
    if (!types.length || types.includes('products')) {
      results.products = await this.searchProducts(query);
    }

    results.total = results.users.length + results.orders.length + results.products.length;

    return results;
  }
}

interface GlobalSearchResult {
  users: any[];
  orders: any[];
  products: any[];
  total: number;
}
```

## Analytics Dashboard

### Analytics Service

```typescript
// apps/api/src/services/analytics.service.ts
export class AnalyticsService {
  constructor(private fastify: FastifyInstance) {}

  async getUserAnalytics(timeframe: string = '30d'): Promise<UserAnalytics> {
    const dateFilter = this.getDateFilter(timeframe);

    // User registrations over time
    const registrations = await this.fastify.knex('users').select(this.fastify.knex.raw('DATE(created_at) as date'), this.fastify.knex.raw('COUNT(*) as count')).where('created_at', '>=', dateFilter).groupBy('date').orderBy('date');

    // User activity
    const activeUsers = await this.fastify.knex('sessions').select(this.fastify.knex.raw('DATE(created_at) as date'), this.fastify.knex.raw('COUNT(DISTINCT user_id) as count')).where('created_at', '>=', dateFilter).groupBy('date').orderBy('date');

    // Role distribution
    const roleDistribution = await this.fastify.knex('users').leftJoin('roles', 'users.role_id', 'roles.id').select('roles.name as role', this.fastify.knex.raw('COUNT(*) as count')).groupBy('roles.name').orderBy('count', 'desc');

    return {
      registrations,
      activeUsers,
      roleDistribution,
      timeframe,
    };
  }

  async getSystemAnalytics(): Promise<SystemAnalytics> {
    // API usage stats
    const apiStats = await this.fastify.knex('api_requests').select('endpoint', 'method', this.fastify.knex.raw('COUNT(*) as requests'), this.fastify.knex.raw('AVG(response_time) as avg_response_time'), this.fastify.knex.raw('MAX(response_time) as max_response_time')).where('created_at', '>=', this.getDateFilter('24h')).groupBy('endpoint', 'method').orderBy('requests', 'desc');

    // Error rates
    const errorRates = await this.fastify.knex('api_requests').select(this.fastify.knex.raw("DATE_TRUNC('hour', created_at) as hour"), this.fastify.knex.raw('COUNT(*) as total_requests'), this.fastify.knex.raw('COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_requests')).where('created_at', '>=', this.getDateFilter('24h')).groupBy('hour').orderBy('hour');

    return {
      apiStats,
      errorRates,
    };
  }

  private getDateFilter(timeframe: string): Date {
    const now = new Date();

    switch (timeframe) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }
}
```

### Frontend Analytics Dashboard

```typescript
// features/analytics/components/analytics-dashboard.component.ts
@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- User Registrations Chart -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>User Registrations</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <canvas #registrationChart></canvas>
        </mat-card-content>
      </mat-card>

      <!-- API Usage Stats -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>API Usage</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <canvas #apiChart></canvas>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class AnalyticsDashboardComponent implements OnInit {
  analyticsService = inject(AnalyticsService);

  @ViewChild('registrationChart') registrationChart!: ElementRef;
  @ViewChild('apiChart') apiChart!: ElementRef;

  ngOnInit() {
    this.loadAnalytics();
  }

  async loadAnalytics() {
    const userAnalytics = await this.analyticsService.getUserAnalytics();
    const systemAnalytics = await this.analyticsService.getSystemAnalytics();

    this.renderRegistrationChart(userAnalytics.registrations);
    this.renderApiChart(systemAnalytics.apiStats);
  }
}
```
