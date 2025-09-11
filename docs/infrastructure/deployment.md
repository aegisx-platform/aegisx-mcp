# Deployment & Infrastructure

## Docker Configuration

### Development Environment (docker-compose.yml)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: app_postgres
    restart: unless-stopped
    ports:
      - '5432:5432'
    environment:
      POSTGRES_DB: ${DB_NAME:-myapp}
      POSTGRES_USER: ${DB_USER:-admin}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
      POSTGRES_INITDB_ARGS: '--encoding=UTF8 --locale=en_US.UTF-8'
      TZ: Asia/Bangkok
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d # Initial SQL scripts
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER:-admin} -d ${DB_NAME:-myapp}']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app_network

  # pgAdmin (Optional - for database management)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: app_pgadmin
    restart: unless-stopped
    ports:
      - '5050:80'
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL:-admin@example.com}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-admin}
      PGADMIN_CONFIG_SERVER_MODE: 'False'
      PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED: 'False'
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app_network

  # Redis (Optional - for session/cache)
  redis:
    image: redis:7-alpine
    container_name: app_redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app_network

  # API Backend (for docker development)
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
      target: development
    container_name: app_api
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://${DB_USER:-admin}:${DB_PASSWORD:-password}@postgres:5432/${DB_NAME:-myapp}
      REDIS_URL: redis://redis:6379
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET:-your-access-secret}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:-your-refresh-secret}
    volumes:
      - ./apps/api:/app/apps/api
      - ./libs:/app/libs
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app_network

  # Web Application
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: development
    container_name: app_web
    restart: unless-stopped
    ports:
      - '4200:4200'
    environment:
      NODE_ENV: development
    volumes:
      - ./apps/web:/app/apps/web
      - ./libs:/app/libs
      - /app/node_modules
    networks:
      - app_network

  # Admin Application
  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
      target: development
    container_name: app_admin
    restart: unless-stopped
    ports:
      - '4201:4201'
    environment:
      NODE_ENV: development
    volumes:
      - ./apps/admin:/app/apps/admin
      - ./libs:/app/libs
      - /app/node_modules
    networks:
      - app_network

  # Nginx Proxy Manager
  nginx-proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    container_name: app_nginx
    restart: unless-stopped
    ports:
      - '80:80' # HTTP
      - '443:443' # HTTPS
      - '81:81' # Admin Panel
    environment:
      DB_SQLITE_FILE: '/data/database.sqlite'
      DISABLE_IPV6: 'true'
    volumes:
      - npm_data:/data
      - npm_letsencrypt:/etc/letsencrypt
      - ./nginx/custom:/data/nginx/custom
    depends_on:
      - api
      - web
      - admin
    networks:
      - app_network

volumes:
  postgres_data:
    driver: local
  pgadmin_data:
    driver: local
  redis_data:
    driver: local
  npm_data:
    driver: local
  npm_letsencrypt:
    driver: local

networks:
  app_network:
    driver: bridge
```

### Production Environment (docker-compose.prod.yml)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app_network

  api:
    image: ghcr.io/${GITHUB_USER}/api:${VERSION:-latest}
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
    depends_on:
      - postgres
    networks:
      - app_network

  web:
    image: ghcr.io/${GITHUB_USER}/web:${VERSION:-latest}
    restart: always
    networks:
      - app_network

  admin:
    image: ghcr.io/${GITHUB_USER}/admin:${VERSION:-latest}
    restart: always
    networks:
      - app_network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api
      - web
      - admin
    networks:
      - app_network

volumes:
  postgres_data:

networks:
  app_network:
    driver: bridge
```

### Docker Development Commands

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres redis
docker-compose up -d postgres pgadmin

# View logs
docker-compose logs -f api
docker-compose logs -f postgres

# Execute commands in container
docker-compose exec postgres psql -U admin -d myapp
docker-compose exec api yarn knex migrate:latest
docker-compose exec api yarn knex seed:run

# Stop all services
docker-compose down

# Stop and remove volumes (clean reset)
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

### Database Connection Configuration

```typescript
// apps/api/src/database/connection.ts
import knex from 'knex';

export const db = knex({
  client: 'postgresql',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'myapp',
    timezone: 'Asia/Bangkok',
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '10'),
  },
  migrations: {
    directory: './database/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './database/seeds',
  },
});
```

### Route Mapping

```
/ → Web Portal (port 4200)
/api/ → Backend API (port 3000)
/admin/ → Admin Portal (port 4201)
```

## Security Requirements

### Authentication

- JWT access tokens (15min expiry)
- Refresh tokens (7 days expiry)
- Password hashing with bcrypt (10 rounds)
- Session management with token rotation

### Authorization (RBAC)

- Role hierarchy: Super Admin → Admin → Manager → User → Guest
- Resource-based permissions
- Action-based permissions (CRUD)
- Frontend route guards
- Backend middleware protection

### API Security

- Rate limiting (100 requests/minute global)
- Input validation on all endpoints
- SQL injection prevention via Knex parameterized queries
- XSS protection headers
- CORS whitelist configuration
- Helmet.js for security headers

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# API
API_PORT=3000
API_HOST=0.0.0.0
API_PREFIX=/api

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_MAX=100
RATE_LIMIT_TIMEWINDOW=60000

# Frontend URLs
WEB_URL=http://localhost:4200
ADMIN_URL=http://localhost:4201

# Environment
NODE_ENV=development
LOG_LEVEL=debug

# Nginx Proxy Manager
NPM_EMAIL=admin@example.com
NPM_PASSWORD=changeme
```

## GitHub Actions Workflows

### CI Pipeline (ci.yml)

- Triggers: PR, push to main/develop
- Jobs: Lint → Test → Build → E2E

### Release Pipeline (release.yml)

- Triggers: Push to main
- Jobs: Version → Changelog → Tag → Build Docker → Push

### Deploy Pipeline (deploy.yml)

- Triggers: After release
- Jobs: Deploy to staging → Manual approval → Deploy to production

## Performance Requirements

### API

- Response time < 200ms (p95)
- Concurrent users: 1000+
- Database connection pooling

### Frontend

- Initial load < 3 seconds
- Time to interactive < 5 seconds
- Lighthouse score > 85

### Build & CI

- CI pipeline < 10 minutes
- Docker build < 5 minutes
- Local dev startup < 30 seconds

## Monitoring & Logging

### Required

- Error tracking (Sentry)
- Health check endpoints
- Request/response logging
- Audit trail for admin actions

### Logging Format

```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "info",
  "service": "api",
  "message": "User login",
  "userId": "uuid",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0"
}
```

## Key Success Criteria

### Must Have (MVP)

- [x] User registration/login with JWT
- [x] Role-Based Access Control (RBAC)
- [x] User CRUD operations
- [x] Admin panel
- [x] API documentation (Swagger)
- [x] Docker deployment ready
- [x] Health check endpoints
- [x] Error tracking
- [x] Rate limiting
- [x] Database migrations

### Should Have

- [ ] Password reset flow
- [ ] Email notifications
- [ ] Advanced audit logging
- [ ] User search with filters
- [ ] Bulk operations
- [ ] Data export

### Nice to Have

- [ ] Two-factor authentication
- [ ] Social login (OAuth)
- [ ] Real-time notifications
- [ ] Analytics dashboard
- [ ] Multiple language support

## Important Notes

### Project Bootstrap Checklist

Before starting features, ensure:

1. ✅ Test routes working (1 API, 1 Frontend)
2. ✅ Docker builds successfully
3. ✅ GitHub Actions pipeline working
4. ✅ Docker images pushed to registry
5. ✅ Semantic Release configured
6. ✅ First version tagged (v0.1.0)

### Always Remember

1. **TypeScript configs are separate** - Angular and Fastify use different settings
2. **API-first development** - Update OpenAPI spec before implementation
3. **Conventional commits** - Use `yarn commit` for interactive commits
4. **Test before commit** - Run `nx affected:test` before pushing
5. **Update documentation** - Keep README and API docs current
6. **Use Nx commands** - Leverage `nx affected` for efficiency
7. **Docker for dependencies** - Use Docker Compose for PostgreSQL and Nginx
8. **Environment variables** - Never commit secrets, use .env files
9. **Feature Module Pattern** - Keep related code together in modules
10. **Layer Separation** - Controller → Service → Repository pattern
11. **Angular Material + TailwindCSS** - Use Material for components, Tailwind for utilities
12. **Smart vs Presentational** - Separate container and UI components
13. **Use Signals** - Primary state management in Angular 19
14. **Standalone Components** - Default approach, no NgModules
15. **Track Progress** - Always maintain feature status card
16. **Session Management** - Update status before/after each session
17. **Checkpoint Often** - Save progress at logical breakpoints
18. **Visual Testing** - Use Playwright MCP for UI verification
19. **Test Everything** - Unit, Integration, E2E, Visual, A11y

### Common Issues & Solutions

1. **TypeScript errors between projects**: Check tsconfig inheritance
2. **Build failures**: Clear Nx cache with `nx reset`
3. **Database connection issues**: Check Docker containers are running
4. **CORS errors**: Verify Nginx proxy configuration
5. **JWT expired**: Implement token refresh logic
6. **Route not found**: Check Angular base href for admin portal
