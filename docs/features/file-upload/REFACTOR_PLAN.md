# File Upload System Refactor - Execution Plan

> **🚀 Ready to Execute** - Step-by-step refactor plan with detailed tasks

**Created**: 2025-10-28
**Status**: 🟢 Starting Phase 1
**Estimated Duration**: 3 weeks
**Current Phase**: Phase 1 - Backend Core

---

## 📋 Quick Summary

**Goal**: Refactor file upload system from deep nested structure to flat, production-ready core system

**Key Changes**:

1. ✅ **Directory Structure**: 6 levels → 3 levels
2. ✅ **API Pattern**: Remove multiple endpoint, use single API + frontend parallel
3. ✅ **Storage Providers**: Add S3 and MinIO adapters
4. ✅ **Frontend Widget**: Unified component with per-file controls

**Based On**: AWS S3, MinIO, Google Cloud Storage patterns

---

## 🎯 Phase 1: Backend Core (Week 1)

### Day 1-2: Storage Adapters Refactoring

#### Task 1.1: Update LocalStorageAdapter ✅ PRIORITY

**Goal**: Change from 6-level to 3-level directory structure

**Current**:

```
uploads/{file-id}/file/{year}/{month}/{day}/{filename}
```

**New**:

```
uploads/{category}/{year-month}/{filename}
```

**Files to Modify**:

- `apps/api/src/shared/adapters/local-storage.adapter.ts`

**Changes**:

1. Update `generateStorageKey()` method

   ```typescript
   // Old
   generateStorageKey(fileId, filename, uploadedBy) {
     return `${fileId}/file/${year}/${month}/${day}/${timestamp}_${filename}`;
   }

   // New
   generateStorageKey(category, filename, hash) {
     const yearMonth = format(new Date(), 'yyyy-MM');
     const timestamp = Date.now();
     return `${category}/${yearMonth}/${filename}_${timestamp}_${hash}.${ext}`;
   }
   ```

2. Update `uploadFile()` method
   - Accept category parameter
   - Generate hash from file content (SHA256, first 8 chars)
   - Create directory structure: `uploads/{category}/{year-month}/`

3. Update `deleteFile()` method
   - Parse new storage key format

4. Add utility methods:

   ```typescript
   private generateFileHash(buffer: Buffer): string {
     const hash = crypto.createHash('sha256');
     hash.update(buffer);
     return hash.digest('hex').substring(0, 8);
   }

   private getYearMonth(): string {
     return format(new Date(), 'yyyy-MM');
   }
   ```

**Testing**:

```bash
# Unit test
npm test -- local-storage.adapter.spec.ts

# Manual test
curl -X POST http://localhost:3333/api/upload \
  -F "file=@test.jpg" \
  -F "category=images"

# Verify file location
ls -la uploads/images/2025-10/
```

---

#### Task 1.2: Implement S3StorageAdapter 🔥 NEW

**Goal**: Create S3 storage adapter following IStorageAdapter interface

**Install Dependencies**:

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Create File**: `apps/api/src/shared/adapters/s3-storage.adapter.ts`

**Implementation**:

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageAdapter, StorageType, FileMetadata, UploadResult } from '../interfaces/storage-adapter.interface';

export interface S3StorageConfig {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string; // For S3-compatible services
}

export class S3StorageAdapter implements IStorageAdapter {
  private client: S3Client;
  private config: S3StorageConfig;

  constructor(config: S3StorageConfig) {
    this.config = config;
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint,
    });
  }

  async uploadFile(buffer: Buffer, key: string, metadata?: Record<string, any>): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      Body: buffer,
      Metadata: metadata,
    });

    await this.client.send(command);

    return {
      storageKey: key,
      url: `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`,
      metadata,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async generateViewUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: fileKey,
    });

    return await getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  async generateDownloadUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: fileKey,
      ResponseContentDisposition: 'attachment',
    });

    return await getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  async generateThumbnailUrl(fileKey: string): Promise<string> {
    // For thumbnails, append _thumb suffix
    const thumbKey = fileKey.replace(/(\.[^.]+)$/, '_thumb$1');
    return this.generateViewUrl(thumbKey);
  }

  async generateMultipleUrls(fileMetadata: FileMetadata): Promise<SignedUrlResult> {
    const [viewUrl, downloadUrl, thumbnailUrl] = await Promise.all([this.generateViewUrl(fileMetadata.storageKey), this.generateDownloadUrl(fileMetadata.storageKey), this.generateThumbnailUrl(fileMetadata.storageKey)]);

    return {
      urls: { view: viewUrl, download: downloadUrl, thumbnail: thumbnailUrl },
      expiresAt: new Date(Date.now() + 3600 * 1000),
      metadata: {
        storageType: StorageType.AWS_S3,
        region: this.config.region,
        bucket: this.config.bucket,
      },
    };
  }

  getStorageType(): StorageType {
    return StorageType.AWS_S3;
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      await this.client.send(new ListBucketsCommand({}));
      return true;
    } catch (error) {
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    return this.validateConfiguration();
  }

  getProviderInfo() {
    return {
      type: StorageType.AWS_S3,
      region: this.config.region,
      endpoint: this.config.endpoint,
    };
  }
}
```

**Testing**:

```typescript
// apps/api/src/shared/adapters/__tests__/s3-storage.adapter.spec.ts
describe('S3StorageAdapter', () => {
  it('should upload file to S3', async () => {
    const adapter = new S3StorageAdapter({
      region: 'us-east-1',
      bucket: 'test-bucket',
      accessKeyId: 'test',
      secretAccessKey: 'test',
    });

    const buffer = Buffer.from('test content');
    const result = await adapter.uploadFile(buffer, 'images/2025-10/test.jpg');

    expect(result.storageKey).toBe('images/2025-10/test.jpg');
    expect(result.url).toContain('s3.amazonaws.com');
  });
});
```

---

#### Task 1.3: Implement MinIOStorageAdapter 🔥 NEW

**Goal**: Create MinIO storage adapter (S3-compatible)

**Install Dependencies**:

```bash
pnpm add minio
```

**Create File**: `apps/api/src/shared/adapters/minio-storage.adapter.ts`

**Implementation**: Similar to S3Adapter but using MinIO client

```typescript
import * as Minio from 'minio';
import { IStorageAdapter, StorageType, UploadResult } from '../interfaces/storage-adapter.interface';

export interface MinIOStorageConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export class MinIOStorageAdapter implements IStorageAdapter {
  private client: Minio.Client;
  private config: MinIOStorageConfig;

  constructor(config: MinIOStorageConfig) {
    this.config = config;
    this.client = new Minio.Client({
      endPoint: config.endpoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
  }

  async uploadFile(buffer: Buffer, key: string, metadata?: Record<string, any>): Promise<UploadResult> {
    await this.client.putObject(this.config.bucket, key, buffer, buffer.length, metadata);

    return {
      storageKey: key,
      url: await this.client.presignedGetObject(this.config.bucket, key),
      metadata,
    };
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.removeObject(this.config.bucket, key);
  }

  async generateViewUrl(fileKey: string): Promise<string> {
    return await this.client.presignedGetObject(this.config.bucket, fileKey, 3600);
  }

  // ... implement other methods similar to S3Adapter

  getStorageType(): StorageType {
    return StorageType.MINIO;
  }
}
```

---

#### Task 1.4: Create StorageAdapterFactory 🏭 NEW

**Goal**: Factory pattern for creating appropriate storage adapter

**Create File**: `apps/api/src/shared/factories/storage-adapter.factory.ts`

**Implementation**:

```typescript
import { IStorageAdapter, StorageType } from '../interfaces/storage-adapter.interface';
import { LocalStorageAdapter } from '../adapters/local-storage.adapter';
import { S3StorageAdapter } from '../adapters/s3-storage.adapter';
import { MinIOStorageAdapter } from '../adapters/minio-storage.adapter';

export class StorageAdapterFactory {
  /**
   * Create storage adapter based on configuration
   */
  static create(config: any): IStorageAdapter {
    const provider = process.env.STORAGE_PROVIDER || 'local';

    switch (provider) {
      case 'local':
        return new LocalStorageAdapter({
          jwtSecret: process.env.JWT_SECRET!,
          baseUrl: process.env.API_BASE_URL!,
          defaultExpirySeconds: 3600,
          maxExpirySeconds: 86400,
          uploadPath: process.env.STORAGE_LOCAL_PATH || 'uploads',
        });

      case 's3':
        return new S3StorageAdapter({
          region: process.env.AWS_REGION!,
          bucket: process.env.AWS_S3_BUCKET!,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          endpoint: process.env.AWS_S3_ENDPOINT,
        });

      case 'minio':
        return new MinIOStorageAdapter({
          endpoint: process.env.MINIO_ENDPOINT!,
          port: parseInt(process.env.MINIO_PORT || '9000'),
          useSSL: process.env.MINIO_USE_SSL === 'true',
          accessKey: process.env.MINIO_ACCESS_KEY!,
          secretKey: process.env.MINIO_SECRET_KEY!,
          bucket: process.env.MINIO_BUCKET!,
        });

      default:
        throw new Error(`Unsupported storage provider: ${provider}`);
    }
  }

  /**
   * Get list of supported storage types
   */
  static getSupportedTypes(): StorageType[] {
    return [StorageType.LOCAL, StorageType.AWS_S3, StorageType.MINIO];
  }
}
```

**Update Plugin**: `apps/api/src/modules/file-upload/file-upload.plugin.ts`

```typescript
import { StorageAdapterFactory } from '../../shared/factories/storage-adapter.factory';

// Replace manual adapter creation with factory
const storageAdapter = StorageAdapterFactory.create(config);
```

---

### Day 3: API Routes Cleanup

#### Task 1.5: Remove Multiple Upload Endpoint ❌

**Goal**: Keep only single upload API, remove multiple

**Files to Modify**:

- `apps/api/src/modules/file-upload/file-upload.routes.ts`
- `apps/api/src/modules/file-upload/file-upload.controller.ts`
- `apps/api/src/modules/file-upload/file-upload.service.ts`

**Changes**:

1. **Routes** - Remove multiple upload route:

   ```typescript
   // ❌ Remove this
   fastify.post('/upload/multiple', {
     schema: multipleUploadSchema,
     handler: controller.uploadMultiple.bind(controller),
   });

   // ✅ Keep this (rename if needed)
   fastify.post('/upload', {
     schema: singleUploadSchema,
     handler: controller.uploadSingle.bind(controller),
   });
   ```

2. **Controller** - Remove uploadMultiple method:

   ```typescript
   // ❌ Remove this method
   async uploadMultiple(request, reply) { ... }

   // ✅ Keep and update this
   async uploadSingle(request, reply) {
     // Update to use new storage key format
   }
   ```

3. **Service** - Remove uploadMultiple method:

   ```typescript
   // ❌ Remove this method
   async uploadMultiple(files: MultipartFile[]) { ... }

   // ✅ Keep this
   async uploadSingle(file: MultipartFile, options: UploadOptions) {
     // Update to use category-based storage key
     const category = options.category || 'general';
     const hash = this.generateFileHash(buffer);
     const storageKey = this.storageAdapter.generateStorageKey(
       category,
       file.filename,
       hash
     );
     // ...
   }
   ```

4. **Schemas** - Remove multiple upload schemas:

   ```typescript
   // ❌ Remove
   export const MultipleUploadRequestSchema = ...
   export const MultipleUploadResponseSchema = ...

   // ✅ Keep and update
   export const SingleUploadRequestSchema = Type.Object({
     file: Type.Any(),
     category: Type.Optional(Type.String()),
     isPublic: Type.Optional(Type.Boolean()),
     isTemporary: Type.Optional(Type.Boolean()),
     metadata: Type.Optional(Type.Any()),
   });
   ```

**Testing**:

```bash
# ❌ Should return 404
curl -X POST http://localhost:3333/api/upload/multiple

# ✅ Should work
curl -X POST http://localhost:3333/api/upload \
  -F "file=@test.jpg" \
  -F "category=images"
```

---

### Day 4-5: Database Schema Updates

#### Task 1.6: Update Database Schema 🗄️

**Goal**: Add new columns to support new features

**Create Migration**: `apps/api/src/database/migrations/YYYYMMDDHHMMSS_refactor_file_upload_system.ts`

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Add new columns to uploaded_files
  await knex.schema.alterTable('uploaded_files', (table) => {
    table.string('category', 50).nullable().comment('File category (avatars, documents, images, videos)');
    table.string('storage_provider', 20).defaultTo('local').comment('Storage provider (local, s3, minio)');
    table.jsonb('chunk_status').nullable().comment('Chunked upload status');
    table.string('virus_scan_status', 20).nullable().comment('Virus scan status');
    table.timestamp('virus_scan_at').nullable().comment('Virus scan timestamp');
    table.integer('version').defaultTo(1).comment('File version');
    table.uuid('parent_version_id').nullable().references('id').inTable('uploaded_files').comment('Parent version ID');
    table.string('file_hash', 64).nullable().comment('SHA256 hash of file content');

    // Add indexes
    table.index('category');
    table.index(['uploaded_by', 'category']);
    table.index('storage_provider');
    table.index('file_hash');
  });

  // 2. Create upload_sessions table (for chunked uploads)
  await knex.schema.createTable('upload_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.string('filename', 255).notNullable();
    table.string('category', 50).notNullable();
    table.string('mime_type', 100).notNullable();
    table.bigInteger('total_size').notNullable();
    table.integer('chunk_size').notNullable();
    table.integer('total_chunks').notNullable();
    table.integer('uploaded_chunks').defaultTo(0);
    table.string('file_hash', 64).nullable();
    table.string('status', 20).defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at').notNullable();
    table.timestamp('completed_at').nullable();
    table.uuid('file_id').nullable().references('id').inTable('uploaded_files');

    // Indexes
    table.index('user_id');
    table.index('status');
    table.index('expires_at');
  });

  // 3. Create file_chunks table
  await knex.schema.createTable('file_chunks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('upload_session_id').notNullable().references('id').inTable('upload_sessions').onDelete('CASCADE');
    table.integer('chunk_number').notNullable();
    table.integer('chunk_size').notNullable();
    table.string('chunk_hash', 64).notNullable();
    table.text('storage_path').notNullable();
    table.timestamp('uploaded_at').defaultTo(knex.fn.now());

    // Unique constraint
    table.unique(['upload_session_id', 'chunk_number']);

    // Indexes
    table.index('upload_session_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop new tables
  await knex.schema.dropTableIfExists('file_chunks');
  await knex.schema.dropTableIfExists('upload_sessions');

  // Remove new columns
  await knex.schema.alterTable('uploaded_files', (table) => {
    table.dropColumn('category');
    table.dropColumn('storage_provider');
    table.dropColumn('chunk_status');
    table.dropColumn('virus_scan_status');
    table.dropColumn('virus_scan_at');
    table.dropColumn('version');
    table.dropColumn('parent_version_id');
    table.dropColumn('file_hash');
  });
}
```

**Run Migration**:

```bash
npm run db:migrate
```

---

## 🎨 Phase 2: Frontend Widget (Week 2)

### Day 6-8: Upload Widget Component

#### Task 2.1: Create Unified Upload Widget 🎨

**Goal**: Single reusable component for all upload scenarios

**Create Files**:

```
apps/web/src/app/shared/components/upload-widget/
├── upload-widget.component.ts
├── upload-widget.component.html
├── upload-widget.component.scss
├── upload-widget.types.ts
└── index.ts
```

**Component API**:

```typescript
<app-upload-widget
  [mode]="'single' | 'multiple'"
  [category]="'avatars' | 'documents' | 'images' | 'videos'"
  [maxFiles]="10"
  [maxFileSize]="10485760"
  [accept]="'.jpg,.png,.pdf'"
  [enableDragDrop]="true"
  [enableImagePreview]="true"
  [enableCropping]="true"
  [concurrent]="3"
  (onUploadStart)="handleStart($event)"
  (onUploadProgress)="handleProgress($event)"
  (onUploadComplete)="handleComplete($event)"
  (onUploadError)="handleError($event)"
/>
```

---

### Day 9-10: Parallel Upload Service

#### Task 2.2: Implement Parallel Upload Service 🚀

**Goal**: Upload multiple files with concurrency control

**Create File**: `apps/web/src/app/shared/services/upload.service.ts`

**Implementation**:

```typescript
@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly CONCURRENT_LIMIT = 3;
  private httpClient = inject(HttpClient);

  /**
   * Upload single file with progress tracking
   */
  uploadSingle(file: File, options: UploadOptions): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', options.category);
    if (options.isPublic) formData.append('isPublic', 'true');
    if (options.isTemporary) formData.append('isTemporary', 'true');

    return this.httpClient
      .post<UploadedFile>('/api/upload', formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event) => this.mapProgress(event)),
        shareReplay(1),
      );
  }

  /**
   * Upload multiple files in parallel with concurrency control
   */
  uploadMultiple(files: File[], options: UploadOptions): Observable<MultipleUploadProgress> {
    return new Observable((observer) => {
      this.processInParallel(files, options, observer);
    });
  }

  private async processInParallel(files: File[], options: UploadOptions, observer: any) {
    const results = {
      uploaded: [],
      failed: [],
      progress: new Map<string, number>(),
    };

    // Process files in chunks
    for (let i = 0; i < files.length; i += this.CONCURRENT_LIMIT) {
      const chunk = files.slice(i, i + this.CONCURRENT_LIMIT);

      const uploads = chunk.map((file) => {
        return this.uploadSingle(file, options).pipe(
          tap((progress) => {
            results.progress.set(file.name, progress.percentage);
            observer.next({ ...results });
          }),
          last(),
          catchError((error) => {
            results.failed.push({ filename: file.name, error: error.message });
            return of(null);
          }),
        );
      });

      await Promise.all(uploads.map((obs) => firstValueFrom(obs)));
    }

    observer.next(results);
    observer.complete();
  }
}
```

---

## 🔄 Phase 3: Migration & Testing (Week 3)

### Day 11-13: Data Migration

#### Task 3.1: Create Migration Script 📦

**Goal**: Move files from old structure to new

**Create File**: `scripts/migrate-file-uploads.ts`

**Implementation**:

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';
import { createHash } from 'crypto';

interface OldFileInfo {
  path: string;
  fileId: string;
  filename: string;
  uploadedAt: Date;
}

/**
 * Scan old directory structure
 */
function scanOldFiles(uploadDir: string): OldFileInfo[] {
  const files: OldFileInfo[] = [];

  // Scan uploads/*/{file-id}/file/{year}/{month}/{day}/{filename}
  const entries = fs.readdirSync(uploadDir);

  for (const entry of entries) {
    if (entry === 'avatars' || entry === '.gitkeep') continue;

    const fileIdPath = path.join(uploadDir, entry);
    if (!fs.statSync(fileIdPath).isDirectory()) continue;

    const filePath = path.join(fileIdPath, 'file');
    if (!fs.existsSync(filePath)) continue;

    // Find all files recursively
    const found = findFiles(filePath);
    files.push(
      ...found.map((f) => ({
        path: f,
        fileId: entry,
        filename: path.basename(f),
        uploadedAt: fs.statSync(f).mtime,
      })),
    );
  }

  return files;
}

/**
 * Generate new path for file
 */
function generateNewPath(oldFile: OldFileInfo, category: string): string {
  const yearMonth = format(oldFile.uploadedAt, 'yyyy-MM');
  const hash = generateFileHash(oldFile.path);
  const ext = path.extname(oldFile.filename);
  const basename = path.basename(oldFile.filename, ext);

  return `uploads/${category}/${yearMonth}/${basename}_${oldFile.uploadedAt.getTime()}_${hash}${ext}`;
}

/**
 * Move file to new location
 */
async function moveFile(oldPath: string, newPath: string): Promise<void> {
  // Create target directory
  const dir = path.dirname(newPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Copy file
  fs.copyFileSync(oldPath, newPath);

  // Verify
  const oldSize = fs.statSync(oldPath).size;
  const newSize = fs.statSync(newPath).size;
  if (oldSize !== newSize) {
    throw new Error('File size mismatch after copy');
  }

  // Delete original
  fs.unlinkSync(oldPath);
}

/**
 * Main migration function
 */
async function migrate(dryRun: boolean = false) {
  console.log('🔄 Starting file migration...\n');

  const files = scanOldFiles('uploads');
  console.log(`📁 Found ${files.length} files to migrate\n`);

  for (const file of files) {
    // Determine category from database or default
    const category = (await determineCategoryFromDB(file.fileId)) || 'general';
    const newPath = generateNewPath(file, category);

    console.log(`Moving: ${file.path}`);
    console.log(`    To: ${newPath}`);

    if (!dryRun) {
      await moveFile(file.path, newPath);
      await updateDatabaseRecord(file.fileId, newPath);
    }
  }

  if (!dryRun) {
    console.log('\n✅ Migration complete!');
    console.log('🗑️  Cleaning up empty directories...');
    cleanupEmptyDirs('uploads');
  } else {
    console.log('\n✅ Dry run complete (no files moved)');
  }
}

// Run migration
migrate(process.argv.includes('--dry-run'));
```

**Usage**:

```bash
# Dry run (preview only)
npx ts-node scripts/migrate-file-uploads.ts --dry-run

# Execute migration
npx ts-node scripts/migrate-file-uploads.ts
```

---

#### Task 3.2: Test and Verify ✅

**Goal**: Ensure migration was successful

**Verification Script**: `scripts/verify-migration.ts`

```typescript
async function verify() {
  console.log('🔍 Verifying migration...\n');

  // 1. Check all files moved
  const oldFiles = scanOldFiles('uploads');
  if (oldFiles.length > 0) {
    console.error(`❌ Found ${oldFiles.length} unmigrated files`);
    return false;
  }

  // 2. Check new structure
  const categories = ['avatars', 'documents', 'images', 'videos'];
  for (const category of categories) {
    const dir = `uploads/${category}`;
    if (fs.existsSync(dir)) {
      const files = countFilesRecursive(dir);
      console.log(`✅ ${category}: ${files} files`);
    }
  }

  // 3. Check database records
  const dbRecords = await knex('uploaded_files').count();
  const diskFiles = countAllFiles('uploads');

  console.log(`\n📊 Summary:`);
  console.log(`   Database records: ${dbRecords}`);
  console.log(`   Files on disk: ${diskFiles}`);

  if (dbRecords === diskFiles) {
    console.log('✅ All files accounted for');
    return true;
  } else {
    console.error('❌ Mismatch between database and disk');
    return false;
  }
}

verify();
```

---

## 📋 Testing Checklist

### Unit Tests

- [ ] LocalStorageAdapter (new structure)
- [ ] S3StorageAdapter
- [ ] MinIOStorageAdapter
- [ ] StorageAdapterFactory
- [ ] FileUploadService (updated)

### Integration Tests

- [ ] Single file upload (all providers)
- [ ] Chunked upload
- [ ] Direct S3 upload (presigned URL)
- [ ] File deletion
- [ ] URL generation

### E2E Tests

- [ ] Upload single file via widget
- [ ] Upload multiple files via widget
- [ ] Drag and drop
- [ ] Progress tracking
- [ ] Retry failed upload
- [ ] Cancel upload

---

## ✅ Definition of Done

**Phase 1 Complete When**:

- [ ] LocalStorageAdapter uses 3-level structure
- [ ] S3 and MinIO adapters implemented
- [ ] StorageAdapterFactory working
- [ ] Multiple upload endpoint removed
- [ ] Database migrations applied
- [ ] All unit tests passing

**Phase 2 Complete When**:

- [ ] Upload widget component created
- [ ] Parallel upload service implemented
- [ ] Per-file progress tracking working
- [ ] Retry/Cancel functionality working
- [ ] E2E tests passing

**Phase 3 Complete When**:

- [ ] Migration script tested
- [ ] All files migrated successfully
- [ ] Old structure cleaned up
- [ ] Verification passing
- [ ] Documentation updated

---

## 🚀 Ready to Start!

**Current Status**: 📝 Plan Complete
**Next Action**: Begin Phase 1, Task 1.1 - Refactor LocalStorageAdapter

**Let's Go!** 💪
