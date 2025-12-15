# 🚀 Quick Start Guide - CI/CD & Docker

## 📋 สิ่งที่ต้องเตรียมก่อน

1. **GitHub Account** พร้อม repository
2. **Docker** ติดตั้งในเครื่อง
3. **GitHub Personal Access Token** (สำหรับ push images)

## 🔧 Step 1: Setup GitHub Secrets

### 1.1 สร้าง GitHub Personal Access Token

1. ไปที่ GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. คลิก "Generate new token"
3. เลือก scopes:
   - `write:packages` (สำหรับ push Docker images)
   - `read:packages`
   - `delete:packages` (optional)
4. Copy token ที่ได้

### 1.2 เพิ่ม Secrets ใน Repository (ถ้าต้องการ)

**สำหรับ CI/CD Pipeline:**

```bash
# Optional Secrets:
SNYK_TOKEN           # สำหรับ security scanning (ถ้าใช้ Snyk)
SLACK_WEBHOOK_URL    # สำหรับ notifications (ถ้าใช้ Slack)

# Production Deployment Secrets (ถ้า deploy จาก GitHub Actions):
STAGING_HOST         # Staging server host
STAGING_SSH_KEY      # SSH key for staging
PRODUCTION_HOST      # Production server host
PRODUCTION_SSH_KEY   # SSH key for production
```

**Note:**

- `GITHUB_TOKEN` - ไม่ต้อง setup, GitHub Actions มีให้อัตโนมัติ
- `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL` - เป็น environment variables ที่ set ตอน deploy บน server จริง ไม่ใช่ GitHub secrets

### 1.3 รัน Setup Script

```bash
# หรือใช้ script อัตโนมัติ
./scripts/setup-secrets.sh
```

## 🏃 Step 2: Local Development

### 2.1 Development ปกติ

```bash
# Start databases
pnpm run docker:up  # Auto-detects instance configuration

# Development (ไม่ใช้ Docker)
nx serve api    # Backend on http://localhost:3333
nx serve web    # Frontend on http://localhost:4200
nx serve admin  # Admin on http://localhost:4201
```

### 2.2 Development with Docker

```bash
# Build และรันทั้งหมดใน Docker (production compose file)
docker-compose -f docker-compose.prod.yml up --build

# Development services
pnpm run docker:up
```

## 🔨 Step 3: Build & Test Locally

### 3.1 Build แต่ละ App

```bash
# Build production
nx build api --prod
nx build web --prod
nx build admin --prod

# หรือ build ทั้งหมด
nx run-many --target=build --all --prod
```

### 3.2 Build Docker Images

```bash
# Build Docker image สำหรับ API
docker build -f apps/api/Dockerfile -t aegisx-api:local .

# Build Docker image สำหรับ Web
docker build -f apps/web/Dockerfile -t aegisx-web:local .

# Build Docker image สำหรับ Admin
docker build -f apps/admin/Dockerfile -t aegisx-admin:local .
```

### 3.3 Test Docker Images Locally

```bash
# Run API
docker run -p 3333:3333 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/aegisx_db" \
  -e JWT_SECRET="your-secret-key" \
  aegisx-api:local

# Run Web
docker run -p 4200:80 aegisx-web:local

# Run Admin
docker run -p 4201:80 aegisx-admin:local
```

## 📤 Step 4: Push to GitHub (Trigger CI/CD)

### 4.1 Development Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub (triggers CI)
git push origin feature/my-feature
```

**อะไรจะเกิดขึ้น:**

1. GitHub Actions จะรัน CI pipeline
2. Lint code ✓
3. Run tests ✓
4. Security scan ✓
5. Build apps ✓
6. ❌ ยังไม่ deploy (รอ merge to main)

### 4.2 Deploy to Staging

```bash
# Merge to develop branch
git checkout develop
git merge feature/my-feature
git push origin develop
```

**อะไรจะเกิดขึ้น:**

1. CI pipeline รันเหมือนเดิม
2. Build Docker images
3. Push to ghcr.io with tag `staging`
4. Auto deploy to staging environment
5. Run E2E tests on staging

### 4.3 Deploy to Production

```bash
# Create release
npm run release  # Interactive release script

# หรือ manual
git checkout main
git merge develop
git tag v1.2.3
git push origin main --tags
```

**อะไรจะเกิดขึ้น:**

1. CI/CD pipeline รันทั้งหมด
2. Build production images
3. Tag with version `v1.2.3`
4. Create GitHub release
5. Deploy to production (ต้อง manual approve)
6. Run smoke tests
7. Send notifications

## 🐳 Step 5: Manual Docker Commands

### 5.1 Build & Push Images Manually

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Build and push specific app
./scripts/build-push.sh api v1.2.3
./scripts/build-push.sh web v1.2.3
./scripts/build-push.sh admin v1.2.3
```

### 5.2 Deploy Manually

```bash
# Deploy to staging
./scripts/deploy.sh staging --build --migrate

# Deploy specific app only
./scripts/deploy-app.sh production api --version=v1.2.3

# Deploy with scaling
./scripts/deploy-app.sh production api --version=v1.2.3 --scale=3
```

## 📊 Step 6: Monitor & Manage

### 6.1 Check Status

```bash
# Local Docker
docker ps
docker logs aegisx-api-1

# Production (SSH to server)
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs api
```

### 6.2 Rollback

```bash
# Rollback specific app
./scripts/deploy-app.sh production api --rollback

# Or manually
docker-compose -f docker-compose.prod.yml up -d api
```

## 🎯 Summary - ขั้นตอนหลัก

### Development → Production Flow:

1. **Local Development**

   ```bash
   nx serve api  # Develop locally
   ```

2. **Test & Build**

   ```bash
   nx test api
   nx build api --prod
   ```

3. **Push to GitHub**

   ```bash
   git push origin feature/xxx  # Triggers CI
   ```

4. **Merge to develop**

   ```bash
   # Auto deploy to staging
   ```

5. **Release to production**
   ```bash
   npm run release  # Create version
   # Manual approve in GitHub Actions
   ```

## 🆘 Troubleshooting

### Docker build fails

```bash
# Clear Docker cache
docker system prune -a

# Build with no cache
docker build --no-cache -f apps/api/Dockerfile .
```

### CI/CD fails

```bash
# Check GitHub Actions logs
# Go to Actions tab in GitHub

# Run locally
act  # Use act tool to run GitHub Actions locally
```

### Permission denied

```bash
# Make scripts executable
chmod +x scripts/*.sh
```

## 📝 Environment Variables

### Development (.env)

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aegisx_db
JWT_SECRET=dev-secret-key-change-in-production
REDIS_URL=redis://localhost:6379
```

### Production (.env.production)

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db.example.com:5432/aegisx_prod
JWT_SECRET=<strong-random-secret>
REDIS_URL=redis://redis.example.com:6379
API_URL=https://api.aegisx.com
```

## 🎉 That's it!

ตอนนี้คุณพร้อมใช้งาน CI/CD pipeline แล้ว:

- ✅ Push code → Auto test
- ✅ Merge to develop → Auto deploy staging
- ✅ Create release → Deploy production
- ✅ Docker images in ghcr.io
- ✅ Rollback capability
