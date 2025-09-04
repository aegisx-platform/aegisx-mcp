# Library Creation Standards

## 🚨 IMPORTANT: วิธีการสร้าง Library ที่ถูกต้อง

### ❌ วิธีที่ผิด (อย่าทำแบบนี้)

```bash
# ผิด - จะสร้าง library ที่ libs/src
nx g @nx/angular:library --name=aegisx-ui

# ผลลัพธ์ที่ผิด:
libs/
├── src/           # ❌ ผิด - ไม่มีชื่อ library folder
├── project.json
└── package.json
```

### ✅ วิธีที่ถูกต้อง (ทำแบบนี้)

```bash
# ถูกต้อง - ระบุ directory ให้ชัดเจน
nx g @nx/angular:library --name=ui \
  --directory=libs/aegisx-ui \
  --importPath=@aegisx/ui \
  --prefix=ax \
  --publishable \
  --standalone \
  --style=scss

# ผลลัพธ์ที่ถูกต้อง:
libs/
└── aegisx-ui/     # ✅ ถูกต้อง - มี library folder
    ├── src/
    ├── project.json
    └── package.json
```

## 📝 ขั้นตอนการสร้าง Library แบบ Step-by-Step

### Step 1: วางแผนก่อนสร้าง

```bash
# ตัดสินใจ:
# - ชื่อ library: aegisx-ui
# - import path: @aegisx/ui
# - prefix: ax
# - type: UI components library
```

### Step 2: สร้าง Library ด้วยคำสั่งที่ถูกต้อง

```bash
# Format: nx g @nx/angular:library --name=[ชื่อ] --directory=libs/[ชื่อ-folder]

nx g @nx/angular:library --name=ui \
  --directory=libs/aegisx-ui \
  --importPath=@aegisx/ui \
  --prefix=ax \
  --publishable \
  --standalone \
  --style=scss \
  --tags=type:ui,scope:shared
```

### Step 3: ตรวจสอบโครงสร้างที่ได้

```bash
# ใช้คำสั่ง tree หรือ ls
ls -la libs/aegisx-ui/

# ต้องได้โครงสร้างแบบนี้:
libs/
└── aegisx-ui/
    ├── src/
    │   ├── lib/
    │   ├── index.ts
    │   └── test-setup.ts
    ├── project.json      # ✅ ตรวจสอบ sourceRoot
    ├── tsconfig.json
    ├── package.json      # ✅ ตรวจสอบ name
    └── README.md
```

### Step 4: ตรวจสอบ Configuration Files

#### 4.1 Check project.json

```json
{
  "name": "aegisx-ui", // ✅ ชื่อต้องตรง
  "sourceRoot": "libs/aegisx-ui/src", // ✅ path ต้องถูก
  "targets": {
    "build": {
      "options": {
        "project": "libs/aegisx-ui/ng-package.json", // ✅
        "tsConfig": "libs/aegisx-ui/tsconfig.lib.json" // ✅
      }
    }
  }
}
```

#### 4.2 Check tsconfig.base.json

```json
{
  "compilerOptions": {
    "paths": {
      "@aegisx/ui": ["libs/aegisx-ui/src/index.ts"] // ✅
    }
  }
}
```

### Step 5: เพิ่ม Dependencies ที่จำเป็น

```bash
# แก้ไข libs/aegisx-ui/package.json
{
  "name": "@aegisx/ui",
  "peerDependencies": {
    "@angular/common": "^20.0.0",
    "@angular/core": "^20.0.0",
    "@angular/material": "^20.0.0",  // ถ้าใช้
    "@angular/cdk": "^20.0.0",       // ถ้าใช้
    "tailwindcss": "^3.0.0"          // ถ้าใช้
  }
}
```

### Step 6: Setup Configuration Files (ถ้าใช้ Tailwind)

```bash
# สร้าง tailwind.config.js
touch libs/aegisx-ui/tailwind.config.js

# สร้าง postcss.config.js
touch libs/aegisx-ui/postcss.config.js
```

### Step 7: ทดสอบ Build

```bash
# Build library
nx build aegisx-ui

# ถ้า build สำเร็จจะได้:
✔ Built @aegisx/ui
```

## 📚 Library Structure Guidelines

### 1. Library Naming Convention

```
libs/
├── aegisx-[library-name]/     # Shared UI/utility libraries
├── data-access-[domain]/       # API client libraries
├── feature-[feature-name]/     # Feature libraries
└── util-[utility-name]/        # Utility libraries
```

### 2. Library Types & Naming

| Type              | Prefix         | Example                                   | Purpose                         |
| ----------------- | -------------- | ----------------------------------------- | ------------------------------- |
| **UI Components** | `aegisx-`      | `aegisx-ui`, `aegisx-charts`              | Shared UI components            |
| **Data Access**   | `data-access-` | `data-access-user`, `data-access-product` | API services & state management |
| **Features**      | `feature-`     | `feature-auth`, `feature-dashboard`       | Complete feature modules        |
| **Utilities**     | `util-`        | `util-validators`, `util-formatters`      | Shared utilities                |
| **Core**          | `core-`        | `core-auth`, `core-config`                | Core functionality              |

### 3. Creating Libraries - Correct Commands

#### UI Component Library

```bash
# Create UI library with correct structure
nx g @nx/angular:library ui \
  --directory=libs/aegisx-ui \
  --prefix=ax \
  --publishable \
  --importPath=@aegisx/ui \
  --standalone \
  --style=scss

# Result structure:
libs/
└── aegisx-ui/
    ├── src/
    │   ├── lib/
    │   ├── index.ts
    │   └── test-setup.ts
    ├── project.json
    ├── README.md
    └── tsconfig.json
```

#### Data Access Library

```bash
# Create data access library
nx g @nx/angular:library user \
  --directory=libs/data-access-user \
  --prefix=lib \
  --publishable \
  --importPath=@aegisx/data-access-user \
  --skipModule \
  --standalone

# Result structure:
libs/
└── data-access-user/
    ├── src/
    │   ├── lib/
    │   │   ├── services/
    │   │   ├── models/
    │   │   └── store/
    │   └── index.ts
    └── project.json
```

#### Feature Library

```bash
# Create feature library
nx g @nx/angular:library auth \
  --directory=libs/feature-auth \
  --prefix=feat \
  --publishable \
  --importPath=@aegisx/feature-auth \
  --routing \
  --lazy \
  --standalone

# Result structure:
libs/
└── feature-auth/
    ├── src/
    │   ├── lib/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── guards/
    │   │   └── feature-auth.routes.ts
    │   └── index.ts
    └── project.json
```

#### Utility Library

```bash
# Create utility library
nx g @nx/angular:library validators \
  --directory=libs/util-validators \
  --publishable \
  --importPath=@aegisx/util-validators \
  --skipModule \
  --unitTestRunner=jest

# Result structure:
libs/
└── util-validators/
    ├── src/
    │   ├── lib/
    │   │   ├── validators/
    │   │   └── index.ts
    │   └── index.ts
    └── project.json
```

### 4. Library Configuration Standards

#### package.json (for publishable libraries)

```json
{
  "name": "@aegisx/[library-name]",
  "version": "0.0.1",
  "peerDependencies": {
    "@angular/common": "^19.0.0",
    "@angular/core": "^19.0.0"
  }
}
```

#### project.json

```json
{
  "name": "[library-full-name]",
  "sourceRoot": "libs/[library-full-name]/src",
  "prefix": "[prefix]",
  "tags": ["type:[ui|data-access|feature|util]", "scope:shared"],
  "implicitDependencies": []
}
```

### 5. Import Path Configuration

Update `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@aegisx/ui": ["libs/aegisx-ui/src/index.ts"],
      "@aegisx/data-access-user": ["libs/data-access-user/src/index.ts"],
      "@aegisx/feature-auth": ["libs/feature-auth/src/index.ts"],
      "@aegisx/util-validators": ["libs/util-validators/src/index.ts"]
    }
  }
}
```

### 6. Library Development Workflow

1. **Plan Library Purpose**
   - Define clear boundaries
   - Identify dependencies
   - Determine publishability

2. **Create with Correct Structure**

   ```bash
   nx g @nx/angular:library [name] \
     --directory=libs/[full-library-name] \
     --importPath=@aegisx/[import-name]
   ```

3. **Implement Features**
   - Follow single responsibility
   - Export through index.ts
   - Document public API

4. **Test Library**

   ```bash
   nx test [library-name]
   nx lint [library-name]
   ```

5. **Build Library**
   ```bash
   nx build [library-name]
   ```

### 7. Common Mistakes to Avoid

❌ **Wrong**:

```bash
nx g @nx/angular:library --name=aegisx-ui
# Creates: libs/src (incorrect structure)
```

✅ **Correct**:

```bash
nx g @nx/angular:library ui --directory=libs/aegisx-ui
# Creates: libs/aegisx-ui/src (correct structure)
```

❌ **Wrong**: Mixing feature code in UI libraries
✅ **Correct**: Keep UI libraries presentation-only

❌ **Wrong**: Circular dependencies between libraries
✅ **Correct**: Use dependency constraints

### 8. Library Dependencies Rules

```
┌─────────────────┐
│   Applications  │ ← Can import from any library
└────────┬────────┘
         │
┌────────▼────────┐
│    Features     │ ← Can import from data-access, ui, util
└────────┬────────┘
         │
┌────────▼────────┐
│  Data Access    │ ← Can import from util only
└────────┬────────┘
         │
┌────────▼────────┐
│   UI / Util     │ ← Cannot import from other libraries
└─────────────────┘
```

### 9. Library Tags & Constraints

Add to `.eslintrc.json`:

```json
{
  "@nx/enforce-module-boundaries": {
    "depConstraints": [
      {
        "sourceTag": "type:app",
        "onlyDependOnLibsWithTags": ["*"]
      },
      {
        "sourceTag": "type:feature",
        "onlyDependOnLibsWithTags": ["type:data-access", "type:ui", "type:util"]
      },
      {
        "sourceTag": "type:data-access",
        "onlyDependOnLibsWithTags": ["type:util"]
      },
      {
        "sourceTag": "type:ui",
        "onlyDependOnLibsWithTags": ["type:util"]
      }
    ]
  }
}
```

### 10. Example: Creating a New Charts Library

```bash
# Step 1: Create library with correct structure
nx g @nx/angular:library charts \
  --directory=libs/aegisx-charts \
  --prefix=ax \
  --publishable \
  --importPath=@aegisx/charts \
  --standalone \
  --style=scss \
  --tags=type:ui,scope:shared

# Step 2: Add dependencies
cd libs/aegisx-charts
npm install chart.js ng2-charts

# Step 3: Implement components
nx g component bar-chart --project=aegisx-charts --path=libs/aegisx-charts/src/lib/components
nx g component line-chart --project=aegisx-charts --path=libs/aegisx-charts/src/lib/components

# Step 4: Test
nx test aegisx-charts
nx lint aegisx-charts

# Step 5: Build
nx build aegisx-charts
```

### 11. Publishing Libraries

For publishable libraries:

```bash
# Build library
nx build [library-name]

# Test build output
cd dist/libs/[library-full-name]
npm pack

# Publish to npm (if needed)
npm publish --access public
```

### 12. Migrating Incorrectly Created Libraries

If a library was created with wrong structure (like `libs/src`):

```bash
# Step 1: Create new library with correct structure
nx g @nx/angular:library ui --directory=libs/aegisx-ui-new

# Step 2: Move source files
mv libs/src/lib/* libs/aegisx-ui-new/src/lib/

# Step 3: Update imports in project.json
# Update all paths from libs/src to libs/aegisx-ui-new/src

# Step 4: Update tsconfig.base.json paths

# Step 5: Remove old library
rm -rf libs/src

# Step 6: Rename to final name
mv libs/aegisx-ui-new libs/aegisx-ui

# Step 7: Update all imports in apps
# Find and replace old import paths
```

---

**Remember**: Always use `--directory` flag to create proper library structure!
