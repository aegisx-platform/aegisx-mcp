# Business Feature Modules

This directory is **reserved for business-specific features only**.

## 🎯 Purpose

- Contains **HIS (Hospital Information System)** modules
- Contains **Inventory Management** modules
- Contains **other business-specific features**

## ✅ Current Business Features

_This directory is empty and ready for your business features._

Use the CRUD generator to create new business modules.

## 🚫 DO NOT Place Core Features Here

Core platform features belong in `/apps/api/src/core/`:

- ❌ **users** - moved to `core/users`
- ❌ **authentication** - in `core/auth`
- ❌ **RBAC** - in `core/rbac`
- ❌ **settings** - in `core/settings`
- ❌ **file-upload** - in `core/file-upload`
- ❌ **pdf-export** - in `core/pdf-export`

## 📝 Adding New Business Features

Use the CRUD generator to create new modules:

```bash
# Generate new business feature
pnpm run crud-gen inventory --with-events --with-import

# The generator will create files in apps/api/src/modules/inventory/
```

## 🏗️ Structure

Each module should follow this structure:

```
modules/
└── inventory/
    ├── controllers/
    ├── routes/
    ├── services/
    ├── repositories/
    ├── schemas/
    ├── types/
    └── index.ts
```

## 📚 Documentation

For more information, see:
- [CRUD Generator Guide](../../../../docs/crud-generator/README.md)
- [Feature Development Standard](../../../../docs/development/feature-development-standard.md)
