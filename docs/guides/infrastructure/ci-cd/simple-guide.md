# 🚀 Simple CI/CD Guide - เริ่มต้นใช้งานง่ายๆ

## 📋 สิ่งที่ได้จาก Setup นี้

1. **Auto Test** - Push code = รัน test อัตโนมัติ
2. **Auto Version** - Merge to main = Version ใหม่อัตโนมัติ
3. **Auto Changelog** - Generate จาก commit messages
4. **Auto Docker Build** - Build & push images to ghcr.io
5. **Auto Release** - GitHub release with notes

## 🎯 ขั้นตอนการใช้งาน

### 1. ไม่ต้อง Setup อะไรเลย!

GitHub Actions พร้อมใช้งานทันที เพราะ:

- ✅ `GITHUB_TOKEN` - มีให้อัตโนมัติ
- ✅ GitHub Container Registry - ใช้ได้เลย
- ✅ Workflows - Setup ไว้แล้ว

### 2. เริ่มใช้งาน

#### Development Flow:

```bash
# 1. สร้าง feature branch
git checkout -b feature/awesome-feature

# 2. Commit ตาม format
git commit -m "feat: add awesome feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update readme"

# 3. Push
git push origin feature/awesome-feature
```

**ผลลัพธ์**: GitHub Actions จะ run tests อัตโนมัติ ✅

#### Release Flow:

```bash
# 1. Merge to develop (ถ้ามี)
git checkout develop
git merge feature/awesome-feature
git push
# → Deploy to staging (ถ้า setup)

# 2. Merge to main
git checkout main
git merge develop  # หรือ merge จาก feature
git push
```

**ผลลัพธ์**:

- ✅ Auto bump version (1.0.0 → 1.1.0)
- ✅ Auto update CHANGELOG.md
- ✅ Auto create GitHub Release
- ✅ Auto build Docker images
- ✅ Auto push to ghcr.io

## 📦 Docker Images

Images จะอยู่ที่:

```
ghcr.io/[your-username]/aegisx-starter/api:latest
ghcr.io/[your-username]/aegisx-starter/web:latest
ghcr.io/[your-username]/aegisx-starter/admin:latest
```

Pull images:

```bash
docker pull ghcr.io/[your-username]/aegisx-starter/api:latest
```

## 🔧 Deploy to Server

บน production server:

```bash
# 1. Set environment variables
export DATABASE_URL="postgresql://user:pass@localhost:5432/db"
export JWT_SECRET="your-secret-key"
export REDIS_URL="redis://localhost:6379"

# 2. Run with Docker
docker run -d \
  -e DATABASE_URL=$DATABASE_URL \
  -e JWT_SECRET=$JWT_SECRET \
  -e REDIS_URL=$REDIS_URL \
  -p 3333:3333 \
  ghcr.io/[your-username]/aegisx-starter/api:latest
```

หรือใช้ docker-compose:

```yaml
# docker-compose.yml on server
version: '3.8'
services:
  api:
    image: ghcr.io/[your-username]/aegisx-starter/api:latest
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/aegisx
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    ports:
      - '3333:3333'
```

## 📝 Commit Message Format

| Type                     | Version Change        | Example                       |
| ------------------------ | --------------------- | ----------------------------- |
| `feat`                   | Minor (1.0.0 → 1.1.0) | `feat: add payment API`       |
| `fix`                    | Patch (1.0.0 → 1.0.1) | `fix: resolve login bug`      |
| `feat!`                  | Major (1.0.0 → 2.0.0) | `feat!: change API structure` |
| `docs`, `style`, `chore` | No version change     | `docs: update readme`         |

## 🎉 That's It!

ไม่ต้อง setup อะไรเพิ่ม:

- ✅ Push = Test
- ✅ Merge to main = Release
- ✅ Docker images ready
- ✅ Just deploy!

## 💡 Optional Setup

ถ้าต้องการ features เพิ่ม:

```bash
# GitHub Secrets (optional):
SNYK_TOKEN          # Security scanning
SLACK_WEBHOOK_URL   # Notifications
```

แค่นี้ก็ใช้ CI/CD ได้แล้วครับ! 🚀
