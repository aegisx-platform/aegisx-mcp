# Business Feature Components

This directory is **reserved for business-specific features only**.

## 🎯 Purpose

- Contains **HIS (Hospital Information System)** features
- Contains **Inventory Management** features
- Contains **other business-specific features**

## ✅ Current Business Features

_This directory is empty and ready for your business features._

Use the CRUD generator to create new business features.

## 🚫 DO NOT Place Core Features Here

Core platform features belong in `/apps/web/src/app/core/`:

- ❌ **users** - moved to `core/users`
- ❌ **user-profile** - moved to `core/user-profile`
- ❌ **settings** - moved to `core/settings`
- ❌ **rbac** - moved to `core/rbac`
- ❌ **pdf-templates** - moved to `core/pdf-templates`

## 📝 Adding New Business Features

Use the CRUD generator to create new features:

```bash
# Generate new business feature
pnpm run crud-gen inventory --with-events --with-import

# The generator will create files in apps/web/src/app/features/inventory/
```

## 🏗️ Structure

Each feature should follow this structure:

```
features/
└── inventory/
    ├── components/
    ├── services/
    ├── models/
    ├── inventory.routes.ts
    └── index.ts
```

## 📚 Documentation

For more information, see:
- [CRUD Generator Guide](../../../../../docs/crud-generator/README.md)
- [Feature Development Standard](../../../../../docs/development/feature-development-standard.md)
- [Angular Frontend Guide](../../../../../docs/architecture/angular-frontend-guide.md)
