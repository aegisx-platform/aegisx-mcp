# Domain-Based CRUD Generation Guide

> Organize your modules with domain-driven structure

---

## Overview

Domain-based generation allows you to organize CRUD modules in a hierarchical structure that mirrors your business domains. Instead of flat module organization, you can create nested structures that are more maintainable and scalable.

### Before: Flat Structure

```
modules/
├── drugs/
├── drug-generics/
├── drug-lots/
├── suppliers/
├── warehouses/
└── ... (many more)
```

### After: Domain Structure

```
modules/
├── inventory/
│   ├── index.ts                    # Domain aggregator
│   ├── master-data/
│   │   ├── index.ts                # Subdomain aggregator
│   │   ├── drugs/
│   │   ├── drug-generics/
│   │   └── suppliers/
│   └── transactions/
│       ├── index.ts
│       ├── drug-lots/
│       └── adjustments/
└── queue/
    ├── index.ts
    └── tickets/
```

---

## Quick Start

### Basic Domain Generation

```bash
# Generate module with domain path
aegisx generate drugs --domain inventory/master-data --force
```

This creates:

```
modules/inventory/
├── index.ts                        # Domain plugin aggregator
└── master-data/
    ├── index.ts                    # Subdomain plugin aggregator
    └── drugs/
        ├── controllers/
        │   └── drugs.controller.ts
        ├── repositories/
        │   └── drugs.repository.ts
        ├── routes/
        │   └── index.ts
        ├── schemas/
        │   └── drugs.schemas.ts
        ├── services/
        │   └── drugs.service.ts
        ├── types/
        │   └── drugs.types.ts
        ├── __tests__/
        │   └── drugs.test.ts
        └── index.ts
```

---

## API Routes

Domain paths automatically create nested API routes:

| Domain Path             | API Route                          |
| ----------------------- | ---------------------------------- |
| `inventory`             | `/api/inventory/drugs`             |
| `inventory/master-data` | `/api/inventory/master-data/drugs` |
| `queue/tickets`         | `/api/queue/tickets/orders`        |

---

## Domain Aggregator Plugins

### Domain Index (inventory/index.ts)

The generator automatically creates domain aggregator plugins:

```typescript
import { FastifyInstance } from 'fastify';
import masterDataPlugin from './master-data';

export default async function inventoryDomainPlugin(fastify: FastifyInstance) {
  // Register subdomains
  await fastify.register(masterDataPlugin, { prefix: '/master-data' });
}
```

### Subdomain Index (inventory/master-data/index.ts)

```typescript
import { FastifyInstance } from 'fastify';
import drugsPlugin from './drugs';

export default async function masterDataPlugin(fastify: FastifyInstance) {
  // Register modules
  await fastify.register(drugsPlugin, { prefix: '/drugs' });
}
```

---

## Multi-Level Domains

### Two-Level Domain

```bash
aegisx generate drugs --domain inventory/master-data --force
```

```
modules/inventory/master-data/drugs/
└── API: /api/inventory/master-data/drugs
```

### Single-Level Domain

```bash
aegisx generate tickets --domain queue --force
```

```
modules/queue/tickets/
└── API: /api/queue/tickets
```

### Three-Level Domain (if needed)

```bash
aegisx generate orders --domain his/outpatient/pharmacy --force
```

```
modules/his/outpatient/pharmacy/orders/
└── API: /api/his/outpatient/pharmacy/orders
```

---

## Adding Modules to Existing Domains

Once a domain exists, you can add more modules:

```bash
# First module creates domain structure
aegisx generate drugs --domain inventory/master-data --force

# Additional modules reuse existing domain
aegisx generate drug-generics --domain inventory/master-data --force
aegisx generate suppliers --domain inventory/master-data --force
```

The subdomain aggregator is automatically updated:

```typescript
// inventory/master-data/index.ts (auto-updated)
import drugsPlugin from './drugs';
import drugGenericsPlugin from './drug-generics';
import suppliersPlugin from './suppliers';

export default async function masterDataPlugin(fastify: FastifyInstance) {
  await fastify.register(drugsPlugin, { prefix: '/drugs' });
  await fastify.register(drugGenericsPlugin, { prefix: '/drug-generics' });
  await fastify.register(suppliersPlugin, { prefix: '/suppliers' });
}
```

---

## Combining with PostgreSQL Schema

You can read from a specific PostgreSQL schema while organizing in domain structure:

```bash
# Read from 'inventory' schema, organize in domain
aegisx generate drug_lots --schema inventory --domain inventory/transactions --force
```

This:

1. Reads table `drug_lots` from PostgreSQL `inventory` schema
2. Creates module in `modules/inventory/transactions/drug-lots/`
3. Routes to `/api/inventory/transactions/drug-lots`

---

## Domain Registration

### Automatic Registration

By default, domain plugins are registered in `plugin.loader.ts`:

```typescript
// plugin.loader.ts
import inventoryDomainPlugin from '../modules/inventory';

export function createFeaturePluginGroup(apiPrefix: string): PluginGroup {
  return {
    plugins: [
      {
        name: 'inventory-domain',
        plugin: inventoryDomainPlugin,
        required: true,
      },
      // ...
    ],
  };
}
```

### Skip Auto-Registration

```bash
aegisx generate drugs --domain inventory/master-data --no-register --force
```

Then manually register:

```typescript
import inventoryDomainPlugin from '../modules/inventory';

fastify.register(inventoryDomainPlugin, { prefix: '/api' });
```

---

## Import Path Calculation

The generator automatically calculates correct import paths based on domain depth:

| Domain Depth | Module Path                               | Shared Path                 |
| ------------ | ----------------------------------------- | --------------------------- |
| 1 level      | `modules/queue/tickets/`                  | `../../../../shared/`       |
| 2 levels     | `modules/inventory/master-data/drugs/`    | `../../../../../shared/`    |
| 3 levels     | `modules/his/outpatient/pharmacy/orders/` | `../../../../../../shared/` |

All imports are automatically resolved:

```typescript
// Schemas import (in drugs/routes/index.ts)
import { ... } from '../../../../../schemas/base.schemas';

// Shared imports (in drugs/repositories/)
import { BaseRepository } from '../../../../../shared/repositories/base.repository';
```

---

## Best Practices

### 1. Domain Naming

```bash
# Good: Use business domain names
--domain inventory/master-data
--domain queue/tickets
--domain his/registration

# Avoid: Technical names
--domain api/v1/resources  # Not recommended
--domain crud/entities     # Not recommended
```

### 2. Subdomain Organization

```
inventory/
├── master-data/          # Reference data (drugs, suppliers, units)
├── transactions/         # Operations (lots, adjustments, distributions)
└── reports/              # Analytics & reporting
```

### 3. Keep Domains Cohesive

Group related modules together:

```bash
# Good: Related modules in same subdomain
aegisx generate drugs --domain inventory/master-data
aegisx generate drug-generics --domain inventory/master-data
aegisx generate drug-units --domain inventory/master-data

# Avoid: Mixing unrelated modules
aegisx generate users --domain inventory/master-data  # Users don't belong here
```

### 4. Depth Recommendation

- **1 level**: Simple domains (queue, auth)
- **2 levels**: Standard domains (inventory/master-data, his/registration)
- **3+ levels**: Use sparingly for very complex systems

---

## Example: Inventory System

### Step 1: Create Master Data Domain

```bash
aegisx generate drugs --domain inventory/master-data --force
aegisx generate drug_generics --domain inventory/master-data --force
aegisx generate suppliers --domain inventory/master-data --force
aegisx generate units --domain inventory/master-data --force
```

### Step 2: Create Transactions Domain

```bash
aegisx generate drug_lots --domain inventory/transactions --force
aegisx generate adjustments --domain inventory/transactions --force
aegisx generate distributions --domain inventory/transactions --force
```

### Step 3: Create Reports Domain

```bash
aegisx generate stock_cards --domain inventory/reports --force
aegisx generate movement_history --domain inventory/reports --force
```

### Result Structure

```
modules/inventory/
├── index.ts
├── master-data/
│   ├── index.ts
│   ├── drugs/
│   ├── drug-generics/
│   ├── suppliers/
│   └── units/
├── transactions/
│   ├── index.ts
│   ├── drug-lots/
│   ├── adjustments/
│   └── distributions/
└── reports/
    ├── index.ts
    ├── stock-cards/
    └── movement-history/
```

### API Routes

```
/api/inventory/master-data/drugs
/api/inventory/master-data/drug-generics
/api/inventory/master-data/suppliers
/api/inventory/master-data/units
/api/inventory/transactions/drug-lots
/api/inventory/transactions/adjustments
/api/inventory/transactions/distributions
/api/inventory/reports/stock-cards
/api/inventory/reports/movement-history
```

---

## Troubleshooting

### Import Errors

If you see import path errors after generation:

```bash
# Regenerate with force to fix paths
aegisx generate drugs --domain inventory/master-data --force
```

### Domain Not Registered

Check `plugin.loader.ts` for domain plugin registration:

```typescript
import inventoryDomainPlugin from '../modules/inventory';

// In createFeaturePluginGroup:
{
  name: 'inventory-domain',
  plugin: inventoryDomainPlugin,
  required: true,
}
```

### Subdomain Not Showing

Ensure the subdomain aggregator (`master-data/index.ts`) imports the module:

```typescript
import drugsPlugin from './drugs';

export default async function masterDataPlugin(fastify: FastifyInstance) {
  await fastify.register(drugsPlugin, { prefix: '/drugs' });
}
```

---

## See Also

- [Quick Reference](./QUICK_REFERENCE.md) - All commands overview
- [Shell Guide](./SHELL_GUIDE.md) - Frontend shell generation
- [Events Guide](./EVENTS_GUIDE.md) - WebSocket integration
- [Import Guide](./IMPORT_GUIDE.md) - Bulk import feature

---

**Copyright (c) 2024 AegisX Team. All rights reserved.**
