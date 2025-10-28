# Core Platform Modules

This directory contains **core platform functionality** that powers all business features.

## 🎯 Purpose

Core modules provide **reusable infrastructure and platform services** that are used across all business features.

## ✅ Core Platform Modules

### Authentication & Authorization
- **auth** - Authentication system (login, register, JWT)
- **users** - User management and profiles
- **rbac** - Role-Based Access Control

### System Services
- **system** - System configuration and defaults
- **monitoring** - Health checks and metrics
- **errors** - Error handling and logging

### Platform Features
- **api-keys** - API key generation and validation
- **file-upload** - File upload and storage
- **navigation** - Dynamic navigation menus
- **pdf-export** - PDF generation and export
- **pdf-templates** - PDF template management
- **settings** - Application settings
- **system-settings** - System-wide settings
- **user-profile** - User activity and preferences

## 📝 Module Characteristics

Core modules are:
- ✅ **Reusable** - Used by multiple business features
- ✅ **Generic** - Not specific to any business domain
- ✅ **Stable** - Rarely changed, well-tested
- ✅ **Essential** - Required for platform operation

## 🚫 Not for Business Logic

Business-specific features belong in `/apps/api/src/modules/`:
- ❌ HIS (Hospital Information System) modules
- ❌ Inventory management
- ❌ Domain-specific features

## 🏗️ Adding Core Modules

Only add modules here if they are:
1. Needed by **multiple business features**
2. **Generic enough** to be reused
3. Part of **platform infrastructure**

If unsure, start in `/modules/` and move to `/core/` when proven reusable.

## 📚 Documentation

For more information, see:
- [Architecture Overview](../../../../docs/architecture/architecture-overview.md)
- [Backend Development Guide](../../../../docs/architecture/fastify-backend-guide.md)
