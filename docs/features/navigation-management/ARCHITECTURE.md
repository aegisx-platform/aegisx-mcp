# Navigation Management System - Architecture

> **Technical architecture, design decisions, and system flow documentation**

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Database Schema](#database-schema)
- [Data Flow](#data-flow)
- [Security Model](#security-model)
- [Caching Strategy](#caching-strategy)
- [Component Interactions](#component-interactions)
- [Design Decisions](#design-decisions)

## System Overview

The Navigation Management System is built on a **three-tier architecture** with strict separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Angular    │  │   Material   │  │  TailwindCSS │      │
│  │  Components  │  │      UI      │  │    Styling   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Application Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Fastify    │  │   Business   │  │    Cache     │      │
│  │  Controllers │  │    Service   │  │   (Redis)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                          Data Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Repository  │  │    Knex.js   │  │  PostgreSQL  │      │
│  │    Pattern   │  │  Query Builder│  │   Database   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Architecture Diagram

### High-Level System Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                          Frontend (Angular)                        │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────┐         ┌─────────────────────────┐      │
│  │  Navigation Menu   │         │  Navigation Management  │      │
│  │    Component       │         │      Component          │      │
│  │                    │         │                         │      │
│  │  - ax-navigation   │         │  - CRUD Operations      │      │
│  │  - User filtering  │         │  - Permission Assignment│      │
│  │  - Auto-expand     │         │  - Hierarchy Display    │      │
│  └──────────┬─────────┘         └───────────┬─────────────┘      │
│             │                               │                     │
│             ▼                               ▼                     │
│  ┌──────────────────────────────────────────────────────┐        │
│  │         NavigationService / NavigationItemsService   │        │
│  │                                                       │        │
│  │  - getUserNavigation()                               │        │
│  │  - getNavigation()                                   │        │
│  │  - CRUD operations                                   │        │
│  └──────────────────────┬───────────────────────────────┘        │
│                         │                                         │
└─────────────────────────┼─────────────────────────────────────────┘
                          │
                    HTTP/REST API
                          │
┌─────────────────────────┼─────────────────────────────────────────┐
│                         ▼            Backend (Fastify)             │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                    Route Layer                           │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │  /api/navigation                                         │    │
│  │  /api/navigation/user                                    │    │
│  │  /api/navigation-items/*                                 │    │
│  │                                                          │    │
│  │  - Request validation (TypeBox)                         │    │
│  │  - Authentication check                                 │    │
│  │  - Permission verification                              │    │
│  └────────────────────┬─────────────────────────────────────┘    │
│                       │                                           │
│                       ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              NavigationService                           │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │                                                          │    │
│  │  Public Methods:                                        │    │
│  │  ├─ getNavigation()                                     │    │
│  │  ├─ getUserNavigation(userId)                           │    │
│  │  ├─ createNavigationItem()                              │    │
│  │  ├─ updateNavigationItem()                              │    │
│  │  ├─ deleteNavigationItem()                              │    │
│  │  ├─ assignPermissionsToNavigationItem()                 │    │
│  │  └─ invalidateCache()                                   │    │
│  │                                                          │    │
│  │  Private Methods:                                       │    │
│  │  ├─ buildNavigationResponse()                           │    │
│  │  ├─ transformNavigationItem()                           │    │
│  │  ├─ getCachedData()                                     │    │
│  │  ├─ setCachedData()                                     │    │
│  │  └─ deleteCachedData()                                  │    │
│  │                                                          │    │
│  └────────────────────┬─────────────────────────────────────┘    │
│                       │                                           │
│                       ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │            NavigationRepository                          │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │                                                          │    │
│  │  - getNavigationItems(includeDisabled, flatten)         │    │
│  │  - getUserNavigationItems(userId, type)                 │    │
│  │  - getUserPermissions(userId)                           │    │
│  │  - createNavigationItem()                               │    │
│  │  - updateNavigationItem()                               │    │
│  │  - deleteNavigationItem()                               │    │
│  │  - assignPermissionsToNavigationItem()                  │    │
│  │  - buildNavigationTree()                                │    │
│  │  - filterByPermissions()                                │    │
│  │  - filterByType()                                       │    │
│  │                                                          │    │
│  └────────────────────┬─────────────────────────────────────┘    │
│                       │                                           │
│                       ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                  Cache Layer (Redis)                     │    │
│  ├──────────────────────────────────────────────────────────┤    │
│  │                                                          │    │
│  │  Keys:                                                  │    │
│  │  ├─ navigation:{type}:{includeDisabled}                │    │
│  │  └─ navigation:user:{userId}:{type}                    │    │
│  │                                                          │    │
│  │  TTL: Configurable (default 5 minutes)                 │    │
│  │  Fallback: In-memory Map (dev/testing)                 │    │
│  │                                                          │    │
│  └────────────────────┬─────────────────────────────────────┘    │
│                       │                                           │
└─────────────────────────────────────────────────────────────────┘
                        │
┌───────────────────────┼───────────────────────────────────────────┐
│                       ▼         Database (PostgreSQL)             │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────┐    ┌─────────────────────────────┐     │
│  │  navigation_items    │    │  navigation_permissions     │     │
│  ├──────────────────────┤    ├─────────────────────────────┤     │
│  │  - id (PK)          │    │  - navigation_item_id (FK)  │     │
│  │  - parent_id (FK)   │────│  - permission_id (FK)       │     │
│  │  - key (UNIQUE)     │    │  - timestamps               │     │
│  │  - title            │    └─────────────────────────────┘     │
│  │  - type             │                                         │
│  │  - icon             │    ┌─────────────────────────────┐     │
│  │  - link             │    │  permissions                │     │
│  │  - sort_order       │    ├─────────────────────────────┤     │
│  │  - show_in_*        │    │  - id (PK)                  │     │
│  │  - badge_*          │    │  - resource                 │     │
│  │  - timestamps       │    │  - action                   │     │
│  └──────────────────────┘    │  - description              │     │
│                              └─────────────────────────────┘     │
│  ┌──────────────────────────────────────────────────┐           │
│  │  user_navigation_preferences                      │           │
│  ├──────────────────────────────────────────────────┤           │
│  │  - id (PK)                                       │           │
│  │  - user_id (FK) → users.id                       │           │
│  │  - navigation_item_id (FK) → navigation_items.id │           │
│  │  - hidden                                        │           │
│  │  - custom_sort_order                             │           │
│  │  - pinned                                        │           │
│  │  - timestamps                                    │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        navigation_items                         │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id                    UUID                                 │
│ FK │ parent_id             UUID (self-referential)              │
│ UK │ key                   VARCHAR(100) UNIQUE                  │
│    │ title                 VARCHAR(200) NOT NULL                │
│    │ type                  VARCHAR(20) NOT NULL                 │
│    │ icon                  VARCHAR(100)                         │
│    │ link                  VARCHAR(500)                         │
│    │ target                VARCHAR(20) DEFAULT '_self'          │
│    │ sort_order            INTEGER DEFAULT 0                    │
│    │ disabled              BOOLEAN DEFAULT false                │
│    │ hidden                BOOLEAN DEFAULT false                │
│    │ exact_match           BOOLEAN DEFAULT false                │
│    │ badge_title           VARCHAR(50)                          │
│    │ badge_classes         VARCHAR(200)                         │
│    │ badge_variant         VARCHAR(20)                          │
│    │ show_in_default       BOOLEAN DEFAULT true                 │
│    │ show_in_compact       BOOLEAN DEFAULT false                │
│    │ show_in_horizontal    BOOLEAN DEFAULT false                │
│    │ show_in_mobile        BOOLEAN DEFAULT true                 │
│    │ meta                  JSONB                                │
│    │ created_at            TIMESTAMP DEFAULT NOW()              │
│    │ updated_at            TIMESTAMP DEFAULT NOW()              │
└─────────────────────────────────────────────────────────────────┘
                    │
                    │ 1:N (self-reference)
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                   navigation_permissions                        │
├─────────────────────────────────────────────────────────────────┤
│ FK │ navigation_item_id    UUID → navigation_items.id          │
│ FK │ permission_id         UUID → permissions.id               │
│    │ created_at            TIMESTAMP DEFAULT NOW()              │
│    │ updated_at            TIMESTAMP DEFAULT NOW()              │
│    │                                                            │
│ PK │ (navigation_item_id, permission_id)                       │
└─────────────────────────────────────────────────────────────────┘
                    │
                    │ N:1
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                          permissions                            │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id                    UUID                                 │
│ UK │ (resource, action)    UNIQUE                               │
│    │ resource              VARCHAR(100) NOT NULL                │
│    │ action                VARCHAR(100) NOT NULL                │
│    │ description           TEXT                                 │
│    │ is_active             BOOLEAN DEFAULT true                 │
│    │ created_at            TIMESTAMP DEFAULT NOW()              │
│    │ updated_at            TIMESTAMP DEFAULT NOW()              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                user_navigation_preferences                      │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id                    UUID                                 │
│ FK │ user_id               UUID → users.id                      │
│ FK │ navigation_item_id    UUID → navigation_items.id           │
│    │ hidden                BOOLEAN                              │
│    │ custom_sort_order     INTEGER                              │
│    │ pinned                BOOLEAN DEFAULT false                │
│    │ created_at            TIMESTAMP DEFAULT NOW()              │
│    │ updated_at            TIMESTAMP DEFAULT NOW()              │
│    │                                                            │
│ UK │ (user_id, navigation_item_id)                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                            users                                │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id                    UUID                                 │
│    │ username              VARCHAR(100) UNIQUE                  │
│    │ email                 VARCHAR(255) UNIQUE                  │
│    │ ...                   (other user fields)                  │
└─────────────────────────────────────────────────────────────────┘
                    │
                    │ N:M (through user_roles)
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                            roles                                │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id                    UUID                                 │
│    │ name                  VARCHAR(100) UNIQUE                  │
│    │ ...                                                        │
└─────────────────────────────────────────────────────────────────┘
                    │
                    │ N:M (through role_permissions)
                    ▼
                  (permissions table above)
```

### Key Relationships

```
navigation_items
├─ parent_id → navigation_items.id (1:N self-reference)
├─ N:M with permissions (through navigation_permissions)
└─ 1:N with user_navigation_preferences

permissions
├─ N:M with navigation_items (through navigation_permissions)
└─ N:M with roles (through role_permissions)

users
├─ N:M with roles (through user_roles)
└─ 1:N with user_navigation_preferences
```

## Data Flow

### Flow 1: User Loads Application Menu

```
┌─────────┐
│  User   │
│ Logs In │
└────┬────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  1. Frontend: NavigationService.getUserNavigation()     │
│     GET /api/navigation/user?type=default               │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  2. Backend: NavigationService.getUserNavigation()      │
│     ├─ Check cache: navigation:user:{userId}:default    │
│     └─ Cache MISS → Query database                      │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  3. NavigationRepository.getUserNavigationItems()        │
│     ├─ Get user permissions from roles                   │
│     ├─ Query navigation_items + permissions (JOIN)       │
│     ├─ Include user_navigation_preferences               │
│     └─ Filter by permissions                             │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  4. Transform & Build Tree                               │
│     ├─ buildNavigationTree()                             │
│     ├─ filterByPermissions()                             │
│     ├─ filterByType()                                    │
│     └─ transformNavigationItem()                         │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  5. Cache Result                                         │
│     SET navigation:user:{userId}:default                 │
│     TTL: 150 seconds (half of default)                   │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  6. Return to Frontend                                   │
│     {                                                    │
│       "default": [                                       │
│         {                                                │
│           "id": "dashboard",                             │
│           "title": "Dashboard",                          │
│           "type": "item",                                │
│           "icon": "dashboard",                           │
│           "link": "/dashboard"                           │
│         }                                                │
│       ]                                                  │
│     }                                                    │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  7. Frontend: Render Navigation Menu                     │
│     <ax-navigation [items]="navigation.default">         │
└──────────────────────────────────────────────────────────┘
```

### Flow 2: Admin Creates New Navigation Item

```
┌──────────┐
│  Admin   │
│ Creates  │
│ Nav Item │
└────┬─────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  1. Frontend: Fill Dialog Form                          │
│     ├─ Basic Info (key, title, icon, link)              │
│     ├─ Configuration (sort_order, visibility flags)      │
│     └─ Permissions (select from list)                    │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  2. Frontend: NavigationItemsService.create()            │
│     POST /api/navigation-items                           │
│     {                                                    │
│       "key": "my-feature",                               │
│       "title": "My Feature",                             │
│       "type": "item",                                    │
│       "icon": "star",                                    │
│       "link": "/my-feature",                             │
│       "permission_ids": ["uuid1", "uuid2"]               │
│     }                                                    │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  3. Backend: Validate Request                            │
│     ├─ TypeBox schema validation                         │
│     ├─ Check permission: navigation:create               │
│     ├─ Verify key uniqueness                             │
│     └─ Validate permission_ids exist                     │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  4. NavigationService.createNavigationItem()             │
│     ├─ Call repository.createNavigationItem()            │
│     └─ Invalidate ALL navigation cache                   │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  5. NavigationRepository.createNavigationItem()          │
│     BEGIN TRANSACTION                                    │
│     ├─ INSERT INTO navigation_items                      │
│     │  VALUES (key, title, type, icon, link, ...)        │
│     ├─ Get new item ID                                   │
│     └─ If permission_ids provided:                       │
│        ├─ INSERT INTO navigation_permissions             │
│        └─ VALUES (navigation_item_id, permission_id)     │
│     COMMIT                                               │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  6. Cache Invalidation                                   │
│     DELETE navigation:*                                  │
│     (Clears all cached navigation data)                  │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  7. Return Created Item to Frontend                      │
│     {                                                    │
│       "success": true,                                   │
│       "data": {                                          │
│         "id": "uuid",                                    │
│         "key": "my-feature",                             │
│         "title": "My Feature",                           │
│         ...                                              │
│       }                                                  │
│     }                                                    │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  8. Frontend: Refresh Table                              │
│     ├─ Close dialog                                      │
│     ├─ Call loadNavigationItems()                        │
│     └─ Show success notification                         │
└──────────────────────────────────────────────────────────┘
```

### Flow 3: User Navigation with Permission Check

```
┌─────────┐
│  User   │
│ Clicks  │
│ Menu    │
└────┬────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  1. Frontend: Router Navigation Triggered                │
│     navigateByUrl('/rbac/navigation')                    │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  2. Angular Router: Check Route Guards                   │
│     ├─ AuthGuard → Check if authenticated                │
│     └─ PermissionGuard → Check permissions               │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  3. PermissionGuard.canActivate()                        │
│     ├─ Get route.data.permissions = ['navigation:read']  │
│     ├─ Get current user permissions from AuthService     │
│     └─ Check: user has 'navigation:read' OR '*:*' ?      │
└────┬─────────────────────────────────────────────────────┘
     │
     ├─ NO ──┐
     │       ▼
     │   ┌──────────────────────────────────────────────┐
     │   │  Access Denied                                │
     │   │  ├─ Show error message                        │
     │   │  └─ Redirect to /dashboard                    │
     │   └──────────────────────────────────────────────┘
     │
     └─ YES ─┐
             ▼
┌──────────────────────────────────────────────────────────┐
│  4. Load Component                                       │
│     NavigationManagementComponent                        │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  5. Component: Load Data                                 │
│     GET /api/navigation-items                            │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  6. Backend: Verify Permission Again                     │
│     (Double-check on server side)                        │
│     ├─ Extract user from JWT token                       │
│     ├─ Query user permissions                            │
│     └─ Verify 'navigation:read' permission               │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  7. Return Navigation Items                              │
│     Filtered by permissions (if needed)                  │
└────┬─────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  8. Frontend: Display Management UI                      │
│     ├─ Table with navigation items                       │
│     ├─ CRUD action buttons                               │
│     └─ Permission badges                                 │
└──────────────────────────────────────────────────────────┘
```

## Security Model

### Two-Layer Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Layer 1: UI Layer                       │
│                     (Menu Visibility Control)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PURPOSE: Control which menu items are visible to users         │
│                                                                  │
│  IMPLEMENTATION:                                                 │
│  1. Backend filters navigation items by user permissions        │
│  2. Only returns items user has permission to see               │
│  3. Frontend renders filtered menu items                        │
│                                                                  │
│  QUERY:                                                          │
│  SELECT ni.*, permissions                                        │
│  FROM navigation_items ni                                        │
│  LEFT JOIN navigation_permissions np ON ni.id = np.nav_item_id  │
│  LEFT JOIN permissions p ON np.permission_id = p.id             │
│  WHERE                                                           │
│    (p.id IS NULL) OR                    -- No permission needed │
│    (CONCAT(p.resource, '.', p.action)   -- Or user has it      │
│     IN (user_permissions))                                       │
│                                                                  │
│  BENEFITS:                                                       │
│  ✅ Better UX (users don't see inaccessible options)            │
│  ✅ Less confusion                                               │
│  ✅ Cleaner menu                                                 │
│                                                                  │
│  SECURITY LEVEL: Soft (UI only)                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Layer 2: Route Layer                      │
│                     (Actual Access Control)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PURPOSE: Enforce actual access to routes                       │
│                                                                  │
│  IMPLEMENTATION:                                                 │
│  1. Route guard checks user permissions on navigation           │
│  2. Blocks access if user lacks required permissions            │
│  3. Works even if user bypasses UI (direct URL, bookmark)       │
│                                                                  │
│  CODE:                                                           │
│  {                                                               │
│    path: 'navigation',                                           │
│    canActivate: [AuthGuard, PermissionGuard],                   │
│    data: {                                                       │
│      permissions: ['navigation:read', '*:*']                     │
│    }                                                             │
│  }                                                               │
│                                                                  │
│  GUARD LOGIC:                                                    │
│  1. Extract required permissions from route.data                │
│  2. Get current user permissions from JWT/session               │
│  3. Check if user has ANY of required permissions               │
│  4. Allow if match, deny otherwise                              │
│                                                                  │
│  BENEFITS:                                                       │
│  ✅ True security (server-enforced)                             │
│  ✅ Prevents direct URL access                                  │
│  ✅ Protects against UI bypass                                  │
│                                                                  │
│  SECURITY LEVEL: Hard (enforced)                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

BOTH LAYERS REQUIRED FOR COMPLETE SECURITY
```

### Permission Flow Diagram

```
Request: GET /api/navigation/user
          │
          ▼
┌─────────────────────────────────────┐
│  1. Get User from JWT Token         │
│     userId = decoded.sub             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  2. Query User's Permissions        │
│                                     │
│  SELECT ARRAY_AGG(                  │
│    CONCAT(p.resource, '.', p.action)│
│  ) as permissions                   │
│  FROM users u                       │
│  JOIN user_roles ur                 │
│    ON u.id = ur.user_id             │
│  JOIN role_permissions rp           │
│    ON ur.role_id = rp.role_id       │
│  JOIN permissions p                 │
│    ON rp.permission_id = p.id       │
│  WHERE u.id = $1                    │
│                                     │
│  RESULT: ['users.read',             │
│           'navigation.read',        │
│           'roles.read']             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  3. Query Navigation Items          │
│     with Required Permissions       │
│                                     │
│  SELECT ni.*,                       │
│    ARRAY_AGG(                       │
│      CONCAT(p.resource, '.', p.action)│
│    ) FILTER (WHERE p.id IS NOT NULL)│
│      as required_permissions        │
│  FROM navigation_items ni           │
│  LEFT JOIN navigation_permissions np│
│    ON ni.id = np.navigation_item_id │
│  LEFT JOIN permissions p            │
│    ON np.permission_id = p.id       │
│  GROUP BY ni.id                     │
│                                     │
│  RESULT: [                          │
│    {                                │
│      key: 'dashboard',              │
│      required_permissions: []       │
│    },                               │
│    {                                │
│      key: 'navigation',             │
│      required_permissions:          │
│        ['navigation.read']          │
│    }                                │
│  ]                                  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  4. Filter by User Permissions      │
│                                     │
│  FOR EACH navigation_item:          │
│    IF item.required_permissions     │
│       IS EMPTY:                     │
│      → INCLUDE (public access)      │
│                                     │
│    ELSE IF user_permissions         │
│           .includes('*:*'):         │
│      → INCLUDE (admin access)       │
│                                     │
│    ELSE IF ANY(                     │
│           item.required_permissions │
│           IN user_permissions       │
│         ):                          │
│      → INCLUDE (has permission)     │
│                                     │
│    ELSE:                            │
│      → EXCLUDE (no permission)      │
│                                     │
│  RESULT: Filtered navigation items  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  5. Build Hierarchical Tree         │
│     Sort by sort_order              │
│     Return to Client                │
└─────────────────────────────────────┘
```

## Caching Strategy

### Cache Key Structure

```
Global Navigation Cache:
┌────────────────────────────────────────────────┐
│  Key Pattern:                                  │
│  navigation:{type}:{includeDisabled}           │
│                                                │
│  Examples:                                     │
│  - navigation:default:false                    │
│  - navigation:mobile:false                     │
│  - navigation:all:true                         │
│                                                │
│  TTL: 300 seconds (5 minutes)                  │
│  Used For: Public navigation                   │
└────────────────────────────────────────────────┘

User-Specific Navigation Cache:
┌────────────────────────────────────────────────┐
│  Key Pattern:                                  │
│  navigation:user:{userId}:{type}               │
│                                                │
│  Examples:                                     │
│  - navigation:user:uuid-123:default            │
│  - navigation:user:uuid-123:mobile             │
│                                                │
│  TTL: 150 seconds (2.5 minutes)                │
│  Used For: Permission-filtered navigation      │
│  Shorter TTL: More frequent permission changes │
└────────────────────────────────────────────────┘
```

### Cache Invalidation Flow

```
Navigation Item Modified
         │
         ▼
┌─────────────────────────────────────┐
│  NavigationService                  │
│  .invalidateCache(userId?)          │
└────────────┬────────────────────────┘
             │
             ├─ userId PROVIDED ─────┐
             │                       │
             │                       ▼
             │        ┌──────────────────────────────┐
             │        │  Delete User-Specific Cache  │
             │        │  DEL navigation:user:{id}:*  │
             │        └──────────────────────────────┘
             │
             └─ userId NULL ─────────┐
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │  Delete All Navigation Cache │
                      │  DEL navigation:*             │
                      └──────────────────────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │  Next Request                │
                      │  ├─ Cache MISS               │
                      │  ├─ Query database           │
                      │  └─ Rebuild cache            │
                      └──────────────────────────────┘
```

### Cache Implementation

```typescript
// Redis-backed with In-Memory Fallback
class NavigationService {
  async getCachedData(key: string) {
    if (this.app.redis) {
      // Production: Use Redis
      const cached = await this.app.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } else {
      // Development: Use in-memory Map
      return this.getInMemoryCache(key);
    }
  }

  async setCachedData(key: string, data: any, ttl: number) {
    if (this.app.redis) {
      // Production: Store in Redis
      await this.app.redis.setex(key, ttl, JSON.stringify(data));
    } else {
      // Development: Store in memory
      this.setInMemoryCache(key, data, ttl);
    }
  }

  async invalidateCache(userId?: string) {
    const patterns = userId ? [`navigation:user:${userId}:*`] : ['navigation:*'];

    for (const pattern of patterns) {
      await this.deleteCachedData(pattern);
    }
  }
}
```

## Component Interactions

### Frontend Component Communication

```
┌─────────────────────────────────────────────────────────────────┐
│                     App Shell Component                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Layout Component                             │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │         ax-navigation Component                     │ │  │
│  │  │                                                     │ │  │
│  │  │  @Input() items: NavigationItem[]                  │ │  │
│  │  │  @Output() itemClick: EventEmitter                 │ │  │
│  │  │                                                     │ │  │
│  │  │  Features:                                         │ │  │
│  │  │  ├─ Render menu items                             │ │  │
│  │  │  ├─ Auto-expand active items                      │ │  │
│  │  │  ├─ Handle collapsible groups                     │ │  │
│  │  │  └─ Material Icons support                        │ │  │
│  │  └──────────────┬──────────────────────────────────────┘ │  │
│  │                 │ receives items from                    │  │
│  │                 ▼                                          │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │         NavigationService                           │ │  │
│  │  │                                                     │ │  │
│  │  │  navigationSignal = signal<Navigation>({})         │ │  │
│  │  │                                                     │ │  │
│  │  │  Methods:                                          │ │  │
│  │  │  ├─ loadNavigation()                               │ │  │
│  │  │  └─ getUserNavigation()                            │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              Navigation Management Component                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Table Display                           │  │
│  │                                                           │  │
│  │  Signals:                                                │  │
│  │  ├─ navigationItems = signal<NavigationItem[]>([])       │  │
│  │  ├─ filters = signal<NavigationFilters>({})              │  │
│  │  ├─ filteredNavigationItems = computed(...)              │  │
│  │  └─ selection = new SelectionModel()                     │  │
│  │                                                           │  │
│  │  Actions:                                                │  │
│  │  ├─ Create → Open dialog                                 │  │
│  │  ├─ Edit → Open dialog                                   │  │
│  │  ├─ View → Open dialog (readonly)                        │  │
│  │  └─ Delete → Confirm & delete                            │  │
│  └──────────────┬────────────────────────────────────────────┘  │
│                 │ uses                                           │
│                 ▼                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │        NavigationItemsService                           │   │
│  │                                                         │   │
│  │  Methods:                                              │   │
│  │  ├─ getAll(): Observable<NavigationItem[]>             │   │
│  │  ├─ getById(id): Observable<NavigationItem>            │   │
│  │  ├─ create(data): Observable<NavigationItem>           │   │
│  │  ├─ update(id, data): Observable<NavigationItem>       │   │
│  │  ├─ delete(id): Observable<void>                       │   │
│  │  ├─ reorder(orders): Observable<void>                  │   │
│  │  └─ assignPermissions(id, ids): Observable<...>        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │       NavigationItemDialogComponent                     │   │
│  │                                                         │   │
│  │  Tabs:                                                 │   │
│  │  ├─ Basic Info (key, title, icon, link, parent)       │   │
│  │  ├─ Configuration (visibility, badges, flags)          │   │
│  │  └─ Permissions (assign permissions)                   │   │
│  │                                                         │   │
│  │  Features:                                             │   │
│  │  ├─ Form validation                                    │   │
│  │  ├─ Permission selection with search                   │   │
│  │  ├─ Icon preview                                       │   │
│  │  └─ Parent item selection                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Design Decisions

### 1. Why Two-Layer Security?

**Decision**: Implement both UI filtering AND route guards

**Rationale**:

- **UI Layer**: Better user experience, cleaner menu
- **Route Layer**: True security, prevents bypass
- **Combined**: Defense in depth

**Alternatives Considered**:

- ❌ Only UI filtering: Insecure, users can bypass via URL
- ❌ Only route guards: Poor UX, users see inaccessible menu items

### 2. Why Hierarchical Tree Structure?

**Decision**: Use self-referential `parent_id` for menu hierarchy

**Rationale**:

- Flexible depth (unlimited nesting)
- Simple to query with recursive CTE
- Standard pattern in navigation systems

**Alternatives Considered**:

- ❌ Adjacency list: Harder to query deep trees
- ❌ Nested set model: Complex updates
- ❌ Path enumeration: Long strings, harder to maintain

### 3. Why Separate Permissions Table?

**Decision**: Use `navigation_permissions` junction table

**Rationale**:

- N:M relationship support (one item → many permissions)
- Reuse existing `permissions` table
- Easy to add/remove permissions
- Supports permission inheritance

**Alternatives Considered**:

- ❌ Store permissions as JSONB: Harder to query, no referential integrity
- ❌ Embed in navigation_items: Can't reuse permissions

### 4. Why Cache User Navigation Separately?

**Decision**: Different cache keys for user-specific navigation

**Rationale**:

- User permissions change more frequently than navigation structure
- Shorter TTL for user-specific cache
- Can invalidate user cache without affecting global cache

**Alternatives Considered**:

- ❌ Single cache: Wastes memory, harder to invalidate
- ❌ No caching: Slow, excessive DB queries

### 5. Why Transform in Service Layer?

**Decision**: Convert DB entities to API format in service

**Rationale**:

- Separation of concerns (repo = DB, service = business logic)
- Hide internal DB structure from API
- Easier to change DB schema without breaking API
- Supports multiple API versions

**Alternatives Considered**:

- ❌ Return raw DB entities: Exposes internal structure
- ❌ Transform in controller: Mixes concerns

### 6. Why flatten Parameter?

**Decision**: Repository supports both tree and flat list

**Rationale**:

- Management UI needs flat list for table display
- Navigation menu needs hierarchical tree
- Single query can serve both purposes

**Alternatives Considered**:

- ❌ Separate queries: Duplicate code, harder to maintain
- ❌ Always build tree, flatten in service: Inefficient

### 7. Why Material Icons?

**Decision**: Use Material Icons instead of custom SVG

**Rationale**:

- 5000+ icons available
- Consistent with Angular Material
- Easy to use (just icon name)
- No need to maintain SVG definitions

**Alternatives Considered**:

- ❌ Custom SVG component: Limited icons (~30)
- ❌ Font Awesome: Extra dependency
- ❌ Heroicons: Requires mapping

## Performance Considerations

### Query Optimization

```sql
-- ✅ OPTIMIZED: Use LEFT JOIN with FILTER
SELECT
  ni.*,
  ARRAY_AGG(DISTINCT CONCAT(p.resource, '.', p.action))
    FILTER (WHERE p.id IS NOT NULL) as permissions
FROM navigation_items ni
LEFT JOIN navigation_permissions np ON ni.id = np.navigation_item_id
LEFT JOIN permissions p ON np.permission_id = p.id
GROUP BY ni.id
ORDER BY ni.sort_order;

-- ❌ SLOW: Separate query per item
SELECT * FROM navigation_items;
FOR EACH item:
  SELECT permissions FROM navigation_permissions WHERE ...;
```

### Indexing Strategy

```sql
-- Required indexes for performance
CREATE INDEX idx_navigation_items_parent_id
  ON navigation_items(parent_id);

CREATE INDEX idx_navigation_items_sort_order
  ON navigation_items(sort_order);

CREATE INDEX idx_navigation_permissions_nav_id
  ON navigation_permissions(navigation_item_id);

CREATE INDEX idx_navigation_permissions_perm_id
  ON navigation_permissions(permission_id);

CREATE UNIQUE INDEX idx_navigation_items_key
  ON navigation_items(key);
```

### Caching Benefits

```
Without Cache:
- Every navigation request → Database query
- ~50ms per query
- 100 users = 5000ms total

With Cache:
- First request → Database query + Cache write (~60ms)
- Next 99 requests → Cache read (~1ms each)
- Total: 60ms + 99ms = 159ms
- **31x faster**
```

---

**Version**: 1.0.0
**Last Updated**: 2025-10-29
**Document Owner**: Development Team
