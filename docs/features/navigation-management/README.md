# Navigation Management System

> **Dynamic, Permission-Based Menu System with Hierarchical Structure**

## Overview

The Navigation Management System is a comprehensive solution for managing application menus and navigation with built-in permission-based access control. It provides a two-layer security model that controls both menu visibility and actual route access.

## Key Features

- ✅ **Permission-Based Access Control** - Menu items filtered by user permissions
- ✅ **Hierarchical Structure** - Support for nested menu items (parent-child relationships)
- ✅ **Multiple Navigation Types** - Support for items, groups, collapsible menus, dividers, and spacers
- ✅ **Multi-Layout Support** - Configure visibility across different layouts (default, compact, horizontal, mobile)
- ✅ **Real-Time Updates** - Changes reflect immediately with cache invalidation
- ✅ **Badge Support** - Display notifications and status badges on menu items
- ✅ **Icon Integration** - Material Icons support for visual menu enhancement
- ✅ **Drag & Drop Ordering** - Easy reordering via sort_order field
- ✅ **Flexible Routing** - Support for internal routes and external links

## Quick Start

### For End Users

**Accessing Navigation Management:**

1. Login to the application
2. Navigate to **RBAC** → **Navigations**
3. Requires permission: `navigation:read` or `*:*` (admin)

**Basic Operations:**

```
Create New Menu Item → Click "+ Create Navigation Item"
Edit Menu Item      → Click edit icon (pencil)
View Details        → Click view icon (eye)
Delete Item         → Click delete icon (trash) - Must not have children
```

### For Developers

**Query User Navigation:**

```typescript
// Get navigation filtered by user permissions
const navigation = await navigationService.getUserNavigation(userId, { type: 'default' });
```

**Create Navigation Item Programmatically:**

```typescript
const newItem = await navigationService.createNavigationItem({
  key: 'my-feature',
  title: 'My Feature',
  type: 'item',
  icon: 'dashboard',
  link: '/my-feature',
  sort_order: 100,
  show_in_default: true,
  permission_ids: [permissionId],
});
```

## Documentation Structure

This feature includes comprehensive documentation:

- **[📖 User Guide](./USER_GUIDE.md)** - Complete end-user manual
- **[🔧 Developer Guide](./DEVELOPER_GUIDE.md)** - Technical implementation guide
- **[📡 API Reference](./API_REFERENCE.md)** - Complete API documentation
- **[🏗️ Architecture](./ARCHITECTURE.md)** - System design and data flow
- **[🚨 Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[📚 Documentation Index](./DOCUMENTATION_INDEX.md)** - Complete navigation guide

## System Requirements

### Backend

- Node.js 18+
- PostgreSQL 15+
- Fastify 4+

### Frontend

- Angular 19+
- Angular Material
- TypeScript 5+

## Security Model

The Navigation System implements a **two-layer security model**:

### Layer 1: Menu Visibility (UI)

Controls which menu items users can see based on their permissions.

### Layer 2: Route Access (Backend)

Validates actual access to routes when users navigate, even if they bypass the UI.

**Both layers must pass for successful access.**

## Database Schema Overview

```
navigation_items
├── Basic Info (id, key, title, type, icon, link)
├── Hierarchy (parent_id, sort_order)
├── Visibility (disabled, hidden, exact_match)
├── Layout Flags (show_in_default, show_in_compact, show_in_horizontal, show_in_mobile)
├── Badge (badge_title, badge_classes, badge_variant)
└── Metadata (meta, created_at, updated_at)

navigation_permissions
├── navigation_item_id → navigation_items.id
├── permission_id → permissions.id
└── timestamps

user_navigation_preferences
├── user_id → users.id
├── navigation_item_id → navigation_items.id
├── hidden, custom_sort_order, pinned
└── timestamps
```

## API Endpoints

| Method | Endpoint                                | Description           | Permission          |
| ------ | --------------------------------------- | --------------------- | ------------------- |
| GET    | `/api/navigation`                       | Get public navigation | None                |
| GET    | `/api/navigation/user`                  | Get user navigation   | Authenticated       |
| GET    | `/api/navigation-items`                 | List all items        | `navigation:read`   |
| POST   | `/api/navigation-items`                 | Create new item       | `navigation:create` |
| PUT    | `/api/navigation-items/:id`             | Update item           | `navigation:update` |
| DELETE | `/api/navigation-items/:id`             | Delete item           | `navigation:delete` |
| POST   | `/api/navigation-items/reorder`         | Reorder items         | `navigation:update` |
| GET    | `/api/navigation-items/:id/permissions` | Get item permissions  | `navigation:read`   |
| POST   | `/api/navigation-items/:id/permissions` | Assign permissions    | `navigation:update` |

## Technology Stack

### Backend

- **Framework**: Fastify 4.x
- **ORM**: Knex.js
- **Database**: PostgreSQL 15+
- **Validation**: TypeBox
- **Caching**: Redis (optional)

### Frontend

- **Framework**: Angular 19+ (Signals)
- **UI Library**: Angular Material + TailwindCSS
- **State Management**: Angular Signals
- **HTTP Client**: Angular HttpClient

## Performance Features

- **Server-Side Caching**: Redis-backed caching with configurable TTL
- **In-Memory Fallback**: Automatic fallback when Redis unavailable
- **Smart Cache Invalidation**: Automatic cache clearing on mutations
- **Optimized Queries**: Efficient PostgreSQL queries with JOINs
- **Lazy Loading**: Frontend components loaded on-demand

## Quick Examples

### Example 1: Create Dashboard Link

```typescript
await navigationService.createNavigationItem({
  key: 'dashboard',
  title: 'Dashboard',
  type: 'item',
  icon: 'dashboard',
  link: '/dashboard',
  sort_order: 10,
  show_in_default: true,
  show_in_mobile: true,
  permission_ids: [], // Public access
});
```

### Example 2: Create RBAC Section with Children

```typescript
// 1. Create parent group
const rbacGroup = await navigationService.createNavigationItem({
  key: 'rbac-management',
  title: 'RBAC',
  type: 'collapsible',
  icon: 'shield',
  sort_order: 20,
  show_in_default: true,
  permission_ids: [rbacReadPermission],
});

// 2. Create child items
await navigationService.createNavigationItem({
  parent_id: rbacGroup.id,
  key: 'rbac-roles',
  title: 'Roles',
  type: 'item',
  icon: 'people',
  link: '/rbac/roles',
  sort_order: 1,
  show_in_default: true,
  permission_ids: [rolesReadPermission],
});
```

### Example 3: Add Badge to Menu Item

```typescript
await navigationService.updateNavigationItem(itemId, {
  badge_title: 'New',
  badge_variant: 'primary',
  badge_classes: 'bg-blue-500 text-white',
});
```

## Next Steps

1. **For End Users**: Read the [User Guide](./USER_GUIDE.md) for detailed instructions
2. **For Developers**: Check the [Developer Guide](./DEVELOPER_GUIDE.md) for implementation details
3. **For System Administrators**: Review the [Architecture](./ARCHITECTURE.md) for system design
4. **Having Issues?**: Consult the [Troubleshooting Guide](./TROUBLESHOOTING.md)

## Contributing

When modifying the navigation system:

1. Update both frontend and backend simultaneously
2. Test with different permission scenarios
3. Verify cache invalidation works correctly
4. Update documentation if adding new features
5. Add integration tests for new functionality

## Support

For questions or issues:

- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review [API Reference](./API_REFERENCE.md)
- Contact system administrator

---

**Version**: 1.0.0
**Last Updated**: 2025-10-29
**Maintainer**: Development Team
