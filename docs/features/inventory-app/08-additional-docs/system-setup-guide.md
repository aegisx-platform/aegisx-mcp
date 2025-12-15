# INVS Modern - System Setup Guide

## คู่มือติดตั้งและใช้งานระบบ

---

## 🎯 **System Overview**

INVS Modern เป็นระบบบริหารคลังยาโรงพยาบาลที่ออกแบบใหม่ด้วย **Prisma + PostgreSQL**

### สถาปัตยกรรมระบบ

```
┌──────────────────────────────────────────────────────────────┐
│                     INVS Modern System                        │
└──────────────────────────────────────────────────────────────┘

  ┌────────────────────────┐        ┌────────────────────────┐
  │  MySQL (invs_banpong)  │        │ PostgreSQL (invs_modern│
  │  Port: 3307            │        │ Port: 5434             │
  │  ─────────────────     │        │  ────────────────────  │
  │  133 tables (Legacy)   │        │  52 tables (Modern) ⭐ │
  │  Full historical data  │        │  3,152 records 🔓     │
  │  Reference only ⚠️     │───────▶│  Production use ✅    │
  │  phpMyAdmin :8082      │        │  pgAdmin :8081         │
  └────────────────────────┘        └────────────────────────┘
           📖 Read                            📝 Write
     For comparison                    For development
```

---

## ⚡ **Quick Start**

### 1. Prerequisites

```bash
# Required
- Docker Desktop >= 20.10
- Node.js >= 18
- npm >= 9

# Check versions
docker --version
node --version
npm --version
```

### 2. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd invs-modern

# Install dependencies
npm install
```

### 3. Start Databases

```bash
# Start both PostgreSQL and MySQL
docker-compose up -d

# Check status
docker ps
```

**Expected containers:**

```
✅ invs-modern-db      (PostgreSQL :5434)
✅ invs-mysql-original (MySQL :3307)
✅ invs-modern-pgadmin (pgAdmin :8081)
✅ invs-phpmyadmin     (phpMyAdmin :8082)
```

### 4. Setup PostgreSQL (Prisma)

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed master data
npm run db:seed

# Apply database functions and views
docker exec -i invs-modern-db psql -U invs_user -d invs_modern < prisma/functions.sql
docker exec -i invs-modern-db psql -U invs_user -d invs_modern < prisma/views.sql
```

### 5. Import MySQL Legacy (Optional)

```bash
# Place SQL file at: scripts/INVS_MySQL_Database_20231119.sql

# Run import
./scripts/import-mysql-legacy.sh

# Wait 10-15 minutes for import to complete
```

### 6. Verify Setup

```bash
# Run application
npm run dev

# Open Prisma Studio
npm run db:studio
# Navigate to: http://localhost:5555
```

---

## 🗄️ **Database Details**

### PostgreSQL (Production) - Port 5434

**Purpose**: Production database managed by Prisma

| Component     | Details                         |
| ------------- | ------------------------------- |
| **Container** | `invs-modern-db`                |
| **Port**      | 5434                            |
| **Database**  | invs_modern                     |
| **User**      | invs_user                       |
| **Password**  | invs123                         |
| **Tables**    | 44 (Prisma managed) ⭐          |
| **Access**    | pgAdmin (http://localhost:8081) |

**Key Features:**

- ✅ Prisma ORM managed
- ✅ Type-safe queries
- ✅ Automatic migrations
- ✅ 44 optimized tables (+8 from Phase 1-3) ⭐
- ✅ Budget management with drug-level planning
- ✅ TMT integration
- ✅ Ministry compliance (100%)
- ✅ Drug master data (3,152 records) 🔓

**Tables Overview:**

- 10 Master Data tables (+4 from Phase 1)
- 4 Budget tables (+2 planning tables)
- 6 Procurement tables
- 3 Inventory tables
- 4 Distribution tables (+2 from Phase 3)
- 2 Drug Information tables (Phase 2)
- 4 TMT tables (+1 from Phase 2)
- 11 others

### MySQL (Reference) - Port 3307

**Purpose**: Legacy database for reference and comparison

| Component     | Details                            |
| ------------- | ---------------------------------- |
| **Container** | `invs-mysql-original`              |
| **Port**      | 3307                               |
| **Database**  | invs_banpong                       |
| **User**      | invs_user                          |
| **Password**  | invs123                            |
| **Tables**    | 133 (Legacy structure)             |
| **Access**    | phpMyAdmin (http://localhost:8082) |

**Key Features:**

- ⚠️ Read-only reference
- ⚠️ Legacy structure (133 tables)
- ⚠️ Historical data
- ⚠️ For comparison only

**Important:** Do NOT use MySQL for development. Use PostgreSQL (Prisma) only.

---

## 🛠️ **Development Workflow**

### Day-to-Day Development

```bash
# 1. Start databases (once)
docker-compose up -d

# 2. Run development server
npm run dev

# 3. Make schema changes
# Edit: prisma/schema.prisma

# 4. Apply changes
npm run db:generate
npm run db:push

# 5. Create migration (for production)
npm run db:migrate
```

### Database Operations

```bash
# View database in browser
npm run db:studio

# Connect via psql
docker exec -it invs-modern-db psql -U invs_user -d invs_modern

# Run SQL scripts
docker exec -i invs-modern-db psql -U invs_user -d invs_modern < script.sql

# Backup database
docker exec invs-modern-db pg_dump -U invs_user invs_modern > backup.sql
```

### Schema Changes

```typescript
// 1. Edit prisma/schema.prisma
model NewTable {
  id   BigInt @id @default(autoincrement())
  name String
}

// 2. Generate client
npm run db:generate

// 3. Push to database
npm run db:push

// 4. Verify in Prisma Studio
npm run db:studio
```

---

## 📊 **Key Differences: MySQL vs PostgreSQL**

### Table Structure Comparison

| Purpose             | MySQL (Legacy)        | PostgreSQL (Prisma)                               | Change              |
| ------------------- | --------------------- | ------------------------------------------------- | ------------------- |
| **Drug Generics**   | `drug_gn`             | `drug_generics`                                   | ✅ Simplified       |
| **Trade Drugs**     | `drug_vn`             | `drugs`                                           | ✅ Better relations |
| **Companies**       | `company`             | `companies`                                       | ✅ Cleaned up       |
| **Inventory**       | `inv_md`, `inv_md_c`  | `inventory`                                       | ✅ Merged           |
| **Lot Tracking**    | `card` (275K records) | `drug_lots`                                       | ✅ Optimized        |
| **Purchase Orders** | `ms_po`, `ms_po_c`    | `purchase_orders`, `purchase_order_items`         | ✅ Clearer          |
| **Budget**          | ❌ None               | `budget_allocations`, `budget_reservations`       | ✨ New!             |
| **Distribution**    | `sm_po`, `sm_po_c`    | `drug_distributions`, `drug_distribution_items`   | ✅ Simplified       |
| **TMT**             | ❌ None               | `tmt_concepts`, `tmt_mappings`, `his_drug_master` | ✨ New!             |

### Why PostgreSQL + Prisma?

**Advantages:**

1. ✅ **Type Safety** - Automatic TypeScript types
2. ✅ **Modern ORM** - Prisma provides excellent DX
3. ✅ **Migrations** - Version-controlled schema changes
4. ✅ **Performance** - Better query optimization
5. ✅ **Features** - Advanced PostgreSQL features (JSONB, Arrays, etc.)
6. ✅ **Cleaner** - 52 tables vs 133 tables (61% reduction)
7. ✅ **Maintainable** - Clear relationships and structure

---

## 🔧 **Scripts & Tools**

### Active Scripts (Use These)

```bash
# TMT Management
node scripts/tmt/import-tmt-data.js
ts-node scripts/tmt/seed-tmt-references.ts

# Integration
ts-node scripts/integration/his-integration.ts
node scripts/integration/validate-migration.js

# MySQL Import
./scripts/import-mysql-legacy.sh
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres
docker-compose up -d mysql-original

# View logs
docker logs invs-modern-db -f
docker logs invs-mysql-original -f

# Stop all services
docker-compose stop

# Remove all (including data!)
docker-compose down -v
```

### Database Commands

```bash
# PostgreSQL
docker exec -it invs-modern-db psql -U invs_user -d invs_modern

# MySQL
docker exec -it invs-mysql-original mysql -u invs_user -pinvs123 invs_banpong

# Prisma Studio
npm run db:studio
```

---

## 📖 **Documentation**

### Essential Reading

1. **[QUICK_START_GUIDE.md](./docs/flows/quick-start-guide.md)** - Quick setup guide
2. **[DATA_FLOW_COMPLETE_GUIDE.md](./docs/flows/data-flow-complete-guide.md)** - Complete system flows
3. **[MYSQL_IMPORT_GUIDE.md](./docs/mysql-import-guide.md)** - MySQL import instructions
4. **[SCRIPT_CLEANUP_GUIDE.md](./docs/script-cleanup-guide.md)** - Scripts organization

### Flow Documentation

1. **[FLOW_01_Master_Data_Setup.md](./docs/flows/flow-01_Master_Data_Setup.md)** - Master data
2. **[FLOW_02_Budget_Management.md](./docs/flows/flow-02_Budget_Management.md)** - Budget system
3. **[FLOW_03_Procurement_Part1_PR.md](./docs/flows/flow-03_Procurement_Part1_PR.md)** - Purchase requests
4. **[FLOW_08_Frontend_Purchase_Request.md](./docs/flows/flow-08_Frontend_Purchase_Request.md)** - Frontend guide

### Technical Documentation

- **[prisma/schema.prisma](./prisma/schema.prisma)** - Database schema
- **[prisma/functions.sql](./prisma/functions.sql)** - Database functions (10)
- **[prisma/views.sql](./prisma/views.sql)** - Database views (11)
- **[docs/business-rules.md](./docs/business-rules.md)** - Business rules

---

## ⚠️ **Important Guidelines**

### DO ✅

1. **Use PostgreSQL (Prisma) for all development**

   ```typescript
   import { PrismaClient } from '@prisma/client';
   const prisma = new PrismaClient();
   ```

2. **Use MySQL for reference only**

   ```sql
   -- Compare structures
   -- Check legacy data
   -- Verify nothing is missing
   ```

3. **Version control schema changes**

   ```bash
   npm run db:migrate  # Create migration
   git add prisma/migrations/
   ```

4. **Use Prisma Studio for data viewing**
   ```bash
   npm run db:studio
   ```

### DON'T ❌

1. **DON'T modify MySQL data**
   - It's for reference only
   - All changes go to PostgreSQL

2. **DON'T convert MySQL → PostgreSQL**
   - Prisma creates clean schema
   - No need for conversion scripts

3. **DON'T use raw SQL (unless necessary)**
   - Use Prisma client for type safety
   - Raw SQL only for complex queries

4. **DON'T commit large SQL files**
   - They're gitignored
   - Download separately if needed

---

## 🔍 **Troubleshooting**

### Container Issues

```bash
# Container won't start
docker-compose down
docker-compose up -d

# Check logs
docker logs invs-modern-db
docker logs invs-mysql-original

# Remove and recreate
docker-compose down -v
docker-compose up -d
```

### Prisma Issues

```bash
# Schema sync issues
npm run db:generate
npm run db:push

# Migration issues
npx prisma migrate reset  # ⚠️ Deletes data!
npx prisma migrate dev

# Clear Prisma cache
rm -rf node_modules/.prisma
npm run db:generate
```

### Port Conflicts

```bash
# Check ports in use
lsof -i :5434  # PostgreSQL
lsof -i :3307  # MySQL
lsof -i :8081  # pgAdmin
lsof -i :8082  # phpMyAdmin

# Change ports in docker-compose.yml if needed
```

---

## 📊 **System Health Check**

### Verify Everything Works

```bash
#!/bin/bash
echo "🔍 INVS Modern - Health Check"
echo "=============================="

# 1. Check containers
echo ""
echo "[1/5] Checking containers..."
docker ps --format "table {{.Names}}\t{{.Status}}" | grep invs

# 2. Check PostgreSQL
echo ""
echo "[2/5] Checking PostgreSQL..."
docker exec invs-modern-db psql -U invs_user -d invs_modern -c "SELECT COUNT(*) as tables FROM information_schema.tables WHERE table_schema='public';"

# 3. Check MySQL (if imported)
echo ""
echo "[3/5] Checking MySQL..."
docker exec invs-mysql-original mysql -u invs_user -pinvs123 invs_banpong -e "SELECT COUNT(*) as tables FROM information_schema.tables WHERE table_schema='invs_banpong';" || echo "MySQL not imported yet"

# 4. Check Prisma
echo ""
echo "[4/5] Checking Prisma..."
npx prisma validate

# 5. Check application
echo ""
echo "[5/5] Checking application..."
npm run dev &
APP_PID=$!
sleep 5
kill $APP_PID 2>/dev/null

echo ""
echo "✅ Health check complete!"
```

---

## 🚀 **Next Steps**

After setup:

1. ✅ **Explore Data**
   - pgAdmin: http://localhost:8081
   - Prisma Studio: http://localhost:5555

2. ✅ **Import MySQL** (optional)
   - Place SQL file in `scripts/`
   - Run `./scripts/import-mysql-legacy.sh`

3. ✅ **Start Development**
   - Read flow documentation
   - Use Prisma for queries
   - Build features!

4. ✅ **Compare Structures**
   - MySQL (legacy) vs PostgreSQL (modern)
   - Ensure no data loss
   - Verify business logic

---

## 📞 **Support**

### Need Help?

- **Documentation**: Check `docs/` folder
- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs

### Access URLs

- **PostgreSQL**: localhost:5434
- **MySQL**: localhost:3307
- **pgAdmin**: http://localhost:8081
- **phpMyAdmin**: http://localhost:8082
- **Prisma Studio**: http://localhost:5555 (run `npm run db:studio`)

---

**Status**: Production Ready ✅ (Schema Complete + Drug Master Imported 🔓)
**Version**: 2.4.0
**Last Updated**: 2025-01-22

_Maintained with ❤️ by the INVS Modern Team_
