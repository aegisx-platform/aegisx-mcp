# Navigation API Module

A comprehensive navigation system for the AegisX platform that provides hierarchical navigation structure with permission-based filtering, user customization, and multiple navigation types.

## Features

- **Hierarchical Navigation**: Support for parent-child relationships in navigation items
- **Permission-Based Filtering**: Show only navigation items user has access to
- **Multiple Navigation Types**: Support for default, compact, horizontal, and mobile layouts
- **User Preferences**: Users can customize navigation visibility and ordering
- **Caching**: Redis-based caching with fallback to in-memory caching
- **RESTful API**: Endpoints matching OpenAPI specification
- **Type Safety**: Full TypeScript implementation with comprehensive types
- **Comprehensive Testing**: Unit and integration tests

## API Endpoints

### GET /api/navigation
Get complete navigation structure with optional filtering.

**Query Parameters:**
- `type` (optional): Navigation type (`default`, `compact`, `horizontal`, `mobile`)
- `includeDisabled` (optional): Include disabled navigation items (boolean)

**Authentication:** Required (JWT + `navigation.view` permission)

**Example:**
```http
GET /api/navigation?type=default&includeDisabled=false
Authorization: Bearer <jwt_token>
```

### GET /api/navigation/user
Get user-specific navigation filtered by permissions and preferences.

**Query Parameters:**
- `type` (optional): Navigation type (`default`, `compact`, `horizontal`, `mobile`)

**Authentication:** Required (JWT)

**Example:**
```http
GET /api/navigation/user?type=mobile
Authorization: Bearer <jwt_token>
```

### GET /api/navigation/health
Health check endpoint for the navigation module.

**Authentication:** Not required

## Database Schema

### navigation_items
Core navigation items table with hierarchical structure.

```sql
CREATE TABLE navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES navigation_items(id) ON DELETE CASCADE,
  key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  type ENUM('item', 'group', 'collapsible', 'divider', 'spacer') NOT NULL,
  icon VARCHAR(100),
  link VARCHAR(500),
  target ENUM('_self', '_blank', '_parent', '_top') DEFAULT '_self',
  sort_order INTEGER DEFAULT 0,
  disabled BOOLEAN DEFAULT FALSE,
  hidden BOOLEAN DEFAULT FALSE,
  exact_match BOOLEAN DEFAULT FALSE,
  badge_title VARCHAR(50),
  badge_classes VARCHAR(200),
  badge_variant ENUM('default', 'primary', 'secondary', 'success', 'warning', 'error'),
  show_in_default BOOLEAN DEFAULT TRUE,
  show_in_compact BOOLEAN DEFAULT TRUE,
  show_in_horizontal BOOLEAN DEFAULT TRUE,
  show_in_mobile BOOLEAN DEFAULT TRUE,
  meta JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### navigation_permissions
Junction table linking navigation items to required permissions.

```sql
CREATE TABLE navigation_permissions (
  navigation_item_id UUID REFERENCES navigation_items(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (navigation_item_id, permission_id)
);
```

### user_navigation_preferences
User-specific navigation customization.

```sql
CREATE TABLE user_navigation_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  navigation_item_id UUID REFERENCES navigation_items(id) ON DELETE CASCADE,
  hidden BOOLEAN,
  custom_sort_order INTEGER,
  pinned BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, navigation_item_id)
);
```

## Architecture

### Repository Layer
**`NavigationRepository`** - Database operations and queries
- Hierarchical navigation queries with CTEs
- Permission-based filtering
- User preference handling
- Efficient tree building algorithms

### Service Layer
**`NavigationService`** - Business logic and caching
- Navigation structure transformation
- Permission filtering logic
- Redis/in-memory caching
- User-specific navigation building

### Controller Layer
**`NavigationController`** - HTTP request handling
- Request validation
- Response formatting
- Error handling
- OpenAPI compliance

### Plugin Integration
**`NavigationPlugin`** - Fastify module registration
- Service dependency injection
- Route registration
- Schema validation setup
- Lifecycle management

## Navigation Types

### Default
Complete navigation structure with all available items.

### Compact
Simplified navigation suitable for sidebar or collapsed menus.

### Horizontal
Navigation optimized for horizontal top bars.

### Mobile
Mobile-optimized navigation with touch-friendly spacing.

## Permission System

Navigation items can be protected by permissions. The system supports:

- **Resource-Action Permissions**: Format `resource.action` (e.g., `users.read`)
- **Super Admin Access**: `*:*` permission grants access to all items
- **Public Items**: Items without permissions are accessible to all authenticated users
- **Hierarchical Permissions**: Child items inherit parent permissions by default

## Caching Strategy

### Cache Keys
- Global navigation: `navigation:{type}:{includeDisabled}`
- User navigation: `navigation:user:{userId}:{type}`

### Cache TTL
- Global navigation: 300 seconds (5 minutes)
- User navigation: 150 seconds (2.5 minutes)

### Cache Invalidation
- Manual invalidation via service methods
- Automatic cleanup on server shutdown
- Pattern-based invalidation for user-specific data

## Usage Examples

### Register the Module
```typescript
import navigationPlugin from './modules/navigation/navigation.plugin';

// Register with Fastify
await app.register(navigationPlugin);
```

### Use the Service
```typescript
// Get complete navigation
const navigation = await app.navigationService.getNavigation({
  type: 'default',
  includeDisabled: false
});

// Get user navigation
const userNav = await app.navigationService.getUserNavigation('user-id', {
  type: 'mobile'
});

// Get single item
const item = await app.navigationService.getNavigationItemByKey('dashboard');

// Invalidate cache
await app.navigationService.invalidateCache('user-id');
```

## Testing

### Unit Tests
- `navigation.repository.spec.ts` - Database layer tests
- `navigation.service.spec.ts` - Business logic tests

### Integration Tests
- `navigation.integration.spec.ts` - End-to-end API tests

### Run Tests
```bash
# Run all navigation tests
npm test -- --testPathPattern=navigation

# Run specific test file
npm test navigation.service.spec.ts

# Run with coverage
npm test -- --coverage --testPathPattern=navigation
```

## Configuration

### Environment Variables
```env
# Caching
NAVIGATION_CACHE_ENABLED=true
NAVIGATION_CACHE_TTL=300

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aegisx
DB_USER=postgres
DB_PASS=password

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Module Configuration
```typescript
interface NavigationModuleConfig {
  cacheEnabled?: boolean;
  cacheTTL?: number;
  verbose?: boolean;
}
```

## Error Handling

The module provides comprehensive error handling:

- **Authentication Errors**: 401 for missing/invalid tokens
- **Permission Errors**: 403 for insufficient permissions
- **Validation Errors**: 400 for invalid parameters
- **Not Found Errors**: 404 for missing resources
- **Server Errors**: 500 for unexpected failures

## Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Development

### Adding New Navigation Types
1. Update `NavigationType` enum in `navigation.types.ts`
2. Add corresponding database column in migration
3. Update filtering logic in repository and service
4. Add to OpenAPI schema validation

### Adding New Item Types
1. Update `NavigationItemType` enum
2. Update database schema and migration
3. Add transformation logic in service
4. Update validation schemas

### Performance Optimization
- Use database indexes on frequently queried columns
- Implement pagination for large navigation structures
- Use Redis clustering for high-scale deployments
- Consider CDN caching for static navigation data

## Security Considerations

- All endpoints require authentication
- Permission-based access control
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- Rate limiting on API endpoints
- Secure cache key generation

## Troubleshooting

### Common Issues

1. **Cache not working**: Check Redis connection and configuration
2. **Permissions not applied**: Verify user roles and permission assignments
3. **Hierarchy not building**: Check parent_id references and sort_order
4. **Performance issues**: Review database indexes and query optimization

### Debug Commands

```typescript
// Enable debug logging
process.env.LOG_LEVEL = 'debug';

// Check navigation structure
const items = await navigationRepository.getNavigationItems(true);

// Verify user permissions
const permissions = await navigationRepository.getUserPermissions('user-id');

// Test cache
await navigationService.invalidateCache();
```

## Contributing

1. Follow the established patterns in the codebase
2. Add tests for new features
3. Update documentation
4. Follow TypeScript strict mode
5. Use meaningful commit messages
6. Ensure all tests pass before submitting PR

## License

MIT License - see LICENSE file for details.