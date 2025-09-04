# Multi-Tenancy Architecture

## Tenant Isolation Plugin

```typescript
// apps/api/src/plugins/multi-tenant.plugin.ts
import fp from 'fastify-plugin';

interface MultiTenantOptions {
  strategy: 'database-per-tenant' | 'schema-per-tenant' | 'shared-database';
  tenantHeader: string;
  defaultTenant?: string;
}

const multiTenantPlugin: FastifyPluginAsync<MultiTenantOptions> = async (fastify, options) => {
  const tenantService = new TenantService(fastify, options);

  // Tenant resolution middleware
  fastify.addHook('onRequest', async (request, reply) => {
    const tenant = await tenantService.resolveTenant(request);
    request.tenant = tenant;

    if (!tenant) {
      return reply.badRequest('Tenant not found');
    }
  });

  fastify.decorate('tenantService', tenantService);
};

export default fp(multiTenantPlugin, {
  name: 'multi-tenant-plugin',
  dependencies: ['knex-plugin'],
});

declare module 'fastify' {
  interface FastifyRequest {
    tenant: Tenant;
  }
  interface FastifyInstance {
    tenantService: TenantService;
  }
}
```

### Tenant Service

```typescript
// apps/api/src/services/tenant.service.ts
export class TenantService {
  constructor(
    private fastify: FastifyInstance,
    private options: MultiTenantOptions,
  ) {}

  async resolveTenant(request: FastifyRequest): Promise<Tenant | null> {
    // Try different resolution strategies
    let tenantId = request.headers[this.options.tenantHeader] || this.extractFromSubdomain(request.hostname) || request.query.tenant || this.options.defaultTenant;

    if (!tenantId) return null;

    // Get tenant from cache first
    const cached = await this.fastify.redis.get(`tenant:${tenantId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Load from database
    const tenant = await this.fastify.knex('tenants').where('slug', tenantId).where('is_active', true).first();

    if (tenant) {
      // Cache for 1 hour
      await this.fastify.redis.setex(`tenant:${tenantId}`, 3600, JSON.stringify(tenant));
    }

    return tenant;
  }

  private extractFromSubdomain(hostname: string): string | null {
    const parts = hostname.split('.');
    if (parts.length > 2) {
      return parts[0]; // subdomain
    }
    return null;
  }

  getTenantDatabase(tenant: Tenant): Knex {
    if (this.options.strategy === 'database-per-tenant') {
      return knex({
        client: 'postgresql',
        connection: {
          ...this.fastify.knex.client.config.connection,
          database: `tenant_${tenant.slug}`,
        },
      });
    }

    return this.fastify.knex;
  }

  wrapWithTenantContext<T>(repository: any): T {
    return new Proxy(repository, {
      get: (target, prop) => {
        const original = target[prop];

        if (typeof original === 'function') {
          return function (...args: any[]) {
            // Inject tenant context into queries
            return original.apply(target, args);
          };
        }

        return original;
      },
    });
  }
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  isActive: boolean;
  settings: any;
  createdAt: Date;
}
```

### Tenant-Aware Repository

```typescript
// apps/api/src/repositories/tenant-aware-base.repository.ts
export abstract class TenantAwareRepository<T, CreateDto, UpdateDto> extends EventDrivenRepository<T, CreateDto, UpdateDto> {
  constructor(fastify: FastifyInstance, tableName: string, searchFields: string[] = []) {
    super(fastify, tableName, searchFields);
  }

  // Override base methods to include tenant filtering
  protected getTenantQuery(): Knex.QueryBuilder {
    const query = this.knex(this.tableName);

    // Add tenant filter based on strategy
    if (this.fastify.tenantService.options.strategy === 'shared-database') {
      query.where('tenant_id', this.getCurrentTenant().id);
    }

    return query;
  }

  protected getCurrentTenant(): Tenant {
    // Get from request context (set by middleware)
    return this.fastify.requestContext.get('tenant');
  }

  async findById(id: string): Promise<T | null> {
    const query = this.getJoinQuery?.() || this.getTenantQuery();
    const row = await query.where(`${this.tableName}.id`, id).first();
    return row ? this.transformToEntity(row) : null;
  }

  async list(query: any): Promise<any> {
    // Override base list to use tenant-aware query
    const baseQuery = this.getJoinQuery?.() || this.getTenantQuery();

    // Apply search, filters, pagination as before
    // ... rest of list implementation
  }

  async create(data: CreateDto, userId?: string): Promise<T> {
    // Automatically add tenant_id for shared database strategy
    if (this.fastify.tenantService.options.strategy === 'shared-database') {
      (data as any).tenantId = this.getCurrentTenant().id;
    }

    return super.create(data, userId);
  }
}
```

### Frontend Tenant Service

```typescript
// libs/auth/src/lib/services/tenant.service.ts
@Injectable({ providedIn: 'root' })
export class TenantService {
  private http = inject(HttpClient);

  private currentTenantSignal = signal<Tenant | null>(null);
  private tenantsSignal = signal<Tenant[]>([]);

  readonly currentTenant = this.currentTenantSignal.asReadonly();
  readonly tenants = this.tenantsSignal.asReadonly();

  // Tenant branding computed
  readonly tenantTheme = computed(() => {
    const tenant = this.currentTenant();
    return tenant?.settings?.theme || {};
  });

  async initializeTenant() {
    // Detect tenant from subdomain
    const hostname = window.location.hostname;
    const subdomain = this.extractSubdomain(hostname);

    if (subdomain) {
      await this.setCurrentTenant(subdomain);
    }
  }

  private extractSubdomain(hostname: string): string | null {
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www') {
      return parts[0];
    }
    return null;
  }

  async setCurrentTenant(tenantSlug: string) {
    const tenant = await this.http.get<Tenant>(`/api/tenants/${tenantSlug}`).toPromise();
    this.currentTenantSignal.set(tenant!);

    // Apply tenant theme
    this.applyTenantTheme(tenant!);
  }

  private applyTenantTheme(tenant: Tenant) {
    const theme = tenant.settings?.theme || {};

    if (theme.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    }

    if (theme.logo) {
      // Update logo in header
    }
  }
}
```
