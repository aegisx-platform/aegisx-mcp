# Core Platform Features

This directory contains **core platform functionality** that powers all business features.

## 🎯 Purpose

Core features provide **reusable UI components and services** that are used across all business features.

## ✅ Core Platform Features

### Authentication & User Management
- **auth** - Authentication guards and services
- **users** - User management interfaces
- **user-profile** - User profiles and activity

### System Features
- **error-handling** - Error interceptors and handlers
- **http** - HTTP interceptors and utilities
- **monitoring** - Application monitoring
- **navigation** - Dynamic navigation system

### Platform Services
- **rbac** - Role-Based Access Control UI
- **settings** - Application settings UI
- **pdf-templates** - PDF template management UI

## 📝 Feature Characteristics

Core features are:
- ✅ **Reusable** - Used by multiple business features
- ✅ **Generic** - Not specific to any business domain
- ✅ **Stable** - Rarely changed, well-tested
- ✅ **Essential** - Required for application operation

## 🚫 Not for Business UI

Business-specific features belong in `/apps/web/src/app/features/`:
- ❌ HIS (Hospital Information System) UI
- ❌ Inventory management UI
- ❌ Domain-specific features

## 🏗️ Adding Core Features

Only add features here if they are:
1. Needed by **multiple business features**
2. **Generic enough** to be reused
3. Part of **platform infrastructure**

If unsure, start in `/features/` and move to `/core/` when proven reusable.

## 📚 Documentation

For more information, see:
- [Architecture Overview](../../../../../docs/architecture/architecture-overview.md)
- [Angular Frontend Guide](../../../../../docs/architecture/angular-frontend-guide.md)
- [UI/UX Guidelines](../../../../../docs/architecture/ui-ux-guidelines.md)
