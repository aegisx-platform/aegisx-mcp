# Setup Guide: Fresh Clone with Complete Data

**Last Updated**: 2025-01-22

This guide explains how to set up a fresh clone of this repository with **complete data** including all imported records from Phase 1-8.

---

## 🔍 Understanding: Migration vs Data

### What You Get from Migration

```bash
npm run db:migrate
```

**✅ Creates:**

- 52 database tables
- 22 enums
- All columns, indexes, constraints
- Foreign key relationships

**❌ Does NOT include:**

- Master data (companies, locations, departments)
- Lookup tables data (dosage_forms, drug_units)
- TMT concepts (76,904 records)
- Drug-TMT mappings (561 drugs)
- Any imported data from MySQL

### Data Sources

| Data Type      | Source               | Records | Command                                              |
| -------------- | -------------------- | ------- | ---------------------------------------------------- |
| **Basic Seed** | `prisma/seed.ts`     | ~50     | `npm run db:seed`                                    |
| **Phase 1-4**  | MySQL Import Scripts | 3,152   | `npx tsx scripts/migrate-phase*.ts`                  |
| **Phase 5**    | Lookup Tables        | 213     | `npx tsx scripts/migrate-phase5-lookup-tables.ts`    |
| **Phase 6**    | FK Mapping           | 1,085   | `npx tsx scripts/migrate-phase6-map-string-to-fk.ts` |
| **Phase 7**    | TMT Concepts         | 76,904  | `npx tsx scripts/migrate-phase7-tmt-concepts.ts`     |
| **Phase 8**    | Drug-TMT Map         | 561     | `npx tsx scripts/migrate-phase8-map-tmt.ts`          |

---

## 🚀 Quick Start: Fresh Clone Setup

### Step 1: Clone and Install (5 min)

```bash
# Clone repository
git clone <repository-url>
cd invs-modern

# Install dependencies
npm install
```

### Step 2: Start Databases (2 min)

```bash
# Start PostgreSQL (Modern) + MySQL (Legacy)
docker-compose up -d

# Verify containers are running
docker ps | grep invs
# Expected: 4 containers
# - invs-modern-db (PostgreSQL :5434)
# - invs-mysql-original (MySQL :3307)
# - invs-modern-pgadmin (pgAdmin :8081)
# - invs-phpmyadmin (phpMyAdmin :8082)
```

### Step 3: Run Migrations (1 min)

```bash
# Apply all migrations (creates schema structure)
npm run db:migrate

# Expected output:
# ✔ Applied XX migrations
# ✔ Generated Prisma Client
```

**✅ At this point:** Database has **structure** but **NO data**

### Step 4: Seed Basic Data (1 min)

```bash
# Seed master data (companies, locations, departments, etc.)
npm run db:seed

# Expected output:
# ✅ Seeded 5 locations
# ✅ Seeded 5 departments
# ✅ Seeded 6 budget types
# ✅ Seeded 5 companies
# ✅ Seeded 5 drug generics
# ✅ Seeded 8 drugs
# ✅ Seeded 3 TMT concepts (sample)
```

**✅ At this point:** Basic master data ready (~50 records)

---

## 📦 Option A: Minimal Setup (for Development)

**Use Case**: Testing, development, learning the system

**What You Have After Seed:**

- 5 Locations
- 5 Departments
- 6 Budget Types
- 5 Companies
- 5 Generic Drugs
- 8 Trade Drugs
- 3 Sample TMT Concepts

**Total Records**: ~50

**Time Required**: 10 minutes

**Command Summary:**

```bash
docker-compose up -d
npm install
npm run db:migrate
npm run db:seed
```

**✅ Good for:**

- Learning the system
- API development
- Frontend development
- Testing features

**❌ NOT suitable for:**

- Production
- Full TMT integration testing
- Ministry reporting testing
- Real data analysis

---

## 📦 Option B: Full Data Import (for Production-Like)

**Use Case**: Testing with real data, TMT integration, ministry reports

**Prerequisites:**

- ✅ MySQL legacy database running (docker-compose includes it)
- ✅ MySQL dump imported (optional, if you have it)
- ⏱️ Time: ~15-20 minutes

### Step 5A: Import Phase 1-4 (Drug Master Data)

**Estimated Time**: 5 minutes

```bash
# Phase 1: Procurement master data (57 records)
npx tsx scripts/migrate-phase1-data.ts

# Phase 2: Drug components & UOM (821 records)
npx tsx scripts/migrate-phase2-data.ts

# Phase 3: Distribution support (4 records)
npx tsx scripts/migrate-phase3-data.ts

# Phase 4: Drug master data (3,006 records)
npx tsx scripts/migrate-phase4-drug-master.ts
```

**What You Get:**

- 1,109 Generic Drugs
- 1,169 Trade Drugs
- 821 Drug Components
- 57 Procurement Master Data

**Total**: ~3,152 records

### Step 5B: Import Phase 5-6 (Lookup Tables + FK Mapping)

**Estimated Time**: 2 minutes

```bash
# Phase 5: Import lookup tables from MySQL
npx tsx scripts/migrate-phase5-lookup-tables.ts

# Expected output:
# ✅ Imported 107 dosage forms
# ✅ Imported 88 drug units
# ✅ Created 10 adjustment reasons
# ✅ Created 8 return actions
```

```bash
# Phase 6: Map string fields to FK
npx tsx scripts/migrate-phase6-map-string-to-fk.ts

# Expected output:
# ✅ Updated 1,082 drug generics
# ✅ Updated 3 trade drugs
```

**What You Get:**

- 107 Dosage Forms
- 88 Drug Units
- 10 Adjustment Reasons
- 8 Return Actions
- 1,085 FK mappings

**Total**: +213 records + 1,085 mappings

### Step 5C: Import Phase 7 (TMT Concepts)

**Estimated Time**: 5 minutes

```bash
# Phase 7: Import TMT concepts from MySQL
npx tsx scripts/migrate-phase7-tmt-concepts.ts

# Expected output (takes ~5 min):
# ✅ Imported 2,689 VTM concepts
# ✅ Imported 7,989 GP concepts
# ✅ Imported 9,835 GPU concepts
# ✅ Imported 27,358 TP concepts
# ✅ Imported 29,027 TPU concepts
# Total: 76,898 concepts
```

**What You Get:**

- 76,904 TMT Concepts (all 5 levels)

**Total**: +76,904 records

### Step 5D: Import Phase 8 (Drug-TMT Mapping)

**Estimated Time**: 2 minutes

```bash
# Phase 8: Map drugs to TMT
npx tsx scripts/migrate-phase8-map-tmt.ts

# Expected output:
# ✅ Successfully mapped 561 drugs
# Coverage: 47.99%
```

**What You Get:**

- 561 drugs with TMT TPU mapping

**Total**: 561 drugs mapped

---

## ✅ Complete Setup Summary

### After Full Import (Option B)

```
Total Records Imported:
├─ Phase 1-4: Drug Master          3,152 records
├─ Phase 5: Lookup Tables          213 records
├─ Phase 6: FK Mappings            1,085 mappings
├─ Phase 7: TMT Concepts           76,904 records
└─ Phase 8: Drug-TMT Map           561 drugs

Grand Total: 81,353 records
```

### Database Size

```bash
# Check database size
docker exec -i invs-modern-db psql -U invs_user -d invs_modern -c "
SELECT
  pg_size_pretty(pg_database_size('invs_modern')) as db_size;
"

# Expected: ~50-80 MB (with all data)
```

---

## 🔧 Verification Commands

### Verify Schema

```bash
# Check tables created
docker exec -i invs-modern-db psql -U invs_user -d invs_modern -c "\dt"

# Expected: 52 tables
```

### Verify Data

```bash
# Check record counts
docker exec -i invs-modern-db psql -U invs_user -d invs_modern -c "
SELECT
  'Companies' as table_name, COUNT(*) FROM companies
UNION ALL SELECT 'Locations', COUNT(*) FROM locations
UNION ALL SELECT 'Departments', COUNT(*) FROM departments
UNION ALL SELECT 'Drug Generics', COUNT(*) FROM drug_generics
UNION ALL SELECT 'Drugs', COUNT(*) FROM drugs
UNION ALL SELECT 'Dosage Forms', COUNT(*) FROM dosage_forms
UNION ALL SELECT 'Drug Units', COUNT(*) FROM drug_units
UNION ALL SELECT 'TMT Concepts', COUNT(*) FROM tmt_concepts
UNION ALL SELECT 'Drugs with TMT', COUNT(*) FROM drugs WHERE tmt_tpu_id IS NOT NULL;
"
```

**Expected Output (Full Import):**

```
Companies:          5-816
Locations:          5
Departments:        5
Drug Generics:      1,109
Drugs:              1,169
Dosage Forms:       107
Drug Units:         88
TMT Concepts:       76,904
Drugs with TMT:     561
```

### Verify Prisma Client

```bash
# Test database connection
npm run dev

# Expected:
# ✅ Database connected successfully!
# 📍 Locations in database: 5
# 💊 Drugs in database: 1169
# 🏢 Companies in database: 5
```

### Open Prisma Studio

```bash
npm run db:studio

# Opens: http://localhost:5555
# Browse all tables visually
```

---

## 🔄 Alternative: Database Backup/Restore

**For Fastest Setup** (if you have a backup):

### Create Backup (One Time)

```bash
# After full import, create backup
docker exec invs-modern-db pg_dump -U invs_user invs_modern > backup-full-data.sql

# Compress it
gzip backup-full-data.sql
# Result: backup-full-data.sql.gz (~10-20 MB)
```

### Restore from Backup (Fresh Clone)

```bash
# Start database
docker-compose up -d

# Restore backup (1 minute)
gunzip -c backup-full-data.sql.gz | docker exec -i invs-modern-db psql -U invs_user -d invs_modern

# Generate Prisma Client
npm run db:generate

# Done! ✅
```

**⚡ Fastest Method**: Restore takes only ~1 minute vs 15-20 minutes for full import

---

## 📋 Troubleshooting

### Problem: Migration Fails

```bash
# Error: Database drift detected
# Solution: Reset and re-migrate
npm run db:migrate -- --force
```

### Problem: Seed Fails

```bash
# Error: Unique constraint violation
# Solution: Database has old data, reset it
npx prisma migrate reset --force
npm run db:seed
```

### Problem: Import Script Fails

```bash
# Error: MySQL connection refused
# Solution: Check MySQL container is running
docker ps | grep mysql

# Restart if needed
docker-compose restart invs-mysql-original
```

### Problem: TMT Import Takes Too Long

```bash
# Solution: This is normal, takes ~5 minutes
# 76,904 records in batches of 500

# Monitor progress in terminal
# You'll see: "Progress: 1000/76904 imported"
```

### Problem: Missing MySQL Data

```bash
# If you don't have MySQL dump, you can still:
# 1. Run seed (basic data) ✅
# 2. Skip Phase 5-8 imports (optional)

# Your system will work with seed data only
# but without full drug catalog and TMT
```

---

## 📁 What to Commit to Git

### ✅ DO Commit

- `prisma/schema.prisma` (schema definition)
- `prisma/migrations/` (all migration folders)
- `prisma/seed.ts` (seed script)
- `scripts/migrate-phase*.ts` (import scripts)
- Documentation files

### ❌ DO NOT Commit

- `.env` (contains passwords)
- `node_modules/`
- `backup-*.sql` (database dumps)
- `*.log` (log files)
- Database volumes

### 📝 .gitignore (Already Configured)

```
.env
.env.local
node_modules/
*.log
backup-*.sql
backup-*.sql.gz
phase*.log
```

---

## 🎯 Recommended Workflow

### For Development (Quick)

```bash
# 1. Clone
git clone <repo>
cd invs-modern

# 2. Setup
npm install
docker-compose up -d
npm run db:migrate
npm run db:seed

# 3. Start coding
npm run dev
```

**Time**: 10 minutes
**Data**: Basic seed data only

### For Testing/Staging (Full)

```bash
# 1. Clone
git clone <repo>
cd invs-modern

# 2. Setup
npm install
docker-compose up -d
npm run db:migrate

# 3. Import all data
npm run db:seed
npx tsx scripts/migrate-phase1-data.ts
npx tsx scripts/migrate-phase2-data.ts
npx tsx scripts/migrate-phase3-data.ts
npx tsx scripts/migrate-phase4-drug-master.ts
npx tsx scripts/migrate-phase5-lookup-tables.ts
npx tsx scripts/migrate-phase6-map-string-to-fk.ts
npx tsx scripts/migrate-phase7-tmt-concepts.ts
npx tsx scripts/migrate-phase8-map-tmt.ts

# 4. Verify
npm run dev
npm run db:studio
```

**Time**: 20 minutes
**Data**: Full production-like dataset

### For Production (Backup Restore)

```bash
# 1. Clone
git clone <repo>
cd invs-modern

# 2. Setup
npm install
docker-compose up -d

# 3. Restore from backup
gunzip -c backup-full-data.sql.gz | docker exec -i invs-modern-db psql -U invs_user -d invs_modern

# 4. Generate client
npm run db:generate

# 5. Start
npm start
```

**Time**: 5 minutes
**Data**: Full production dataset

---

## 🚦 Quick Reference

| Task               | Command                | Time   |
| ------------------ | ---------------------- | ------ |
| **Create Schema**  | `npm run db:migrate`   | 1 min  |
| **Basic Data**     | `npm run db:seed`      | 1 min  |
| **Full Import**    | Run all phase scripts  | 15 min |
| **Create Backup**  | `pg_dump > backup.sql` | 2 min  |
| **Restore Backup** | `psql < backup.sql`    | 1 min  |
| **Verify Setup**   | `npm run dev`          | 10 sec |
| **Open Studio**    | `npm run db:studio`    | 10 sec |

---

## 📚 Related Documentation

- `README.md` - Project overview
- `SYSTEM_SETUP_GUIDE.md` - Detailed system setup
- `PROJECT_STATUS.md` - Current project status
- `docs/migration/phase-*_SUMMARY.md` - Phase summaries
- `CLAUDE.md` - AI assistant guide

---

**Version**: 1.0
**Last Updated**: 2025-01-22
**Tested On**: macOS (Apple Silicon), Docker Desktop 4.x
**Database**: PostgreSQL 15-alpine + MySQL 8.0

---

**Pro Tip**: Create a backup after full import and commit `backup-full-data.sql.gz` to Git LFS for fastest team onboarding! 🚀
