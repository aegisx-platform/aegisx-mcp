# File Upload System Implementation Checklist

> **📋 Purpose**: Step-by-step implementation checklist for the new core upload system

**Created**: 2025-10-28
**Estimated Duration**: 3 weeks
**Complexity**: High
**Dependencies**: Sharp, AWS SDK, MinIO Client

---

## 🎯 Overview

This checklist breaks down the implementation into manageable tasks across 3 phases:

- **Phase 1**: Backend Core (Week 1)
- **Phase 2**: Frontend Widget (Week 2)
- **Phase 3**: Migration & Testing (Week 3)

---

## Phase 1: Backend Core (Week 1)

### 1.1 Storage Adapters

#### LocalStorageAdapter Refactoring

- [ ] **Update directory structure logic**
  - [ ] Remove deep nesting (6 levels → 3 levels)
  - [ ] Implement category-based organization
  - [ ] Add year-month folders only
  - [ ] Update file naming convention
  - [ ] Test file path generation

- [ ] **Update storage key generation**
  - [ ] Pattern: `{category}/{year-month}/{identifier}_{timestamp}_{hash}.{ext}`
  - [ ] Add hash generation (SHA256, first 8 chars)
  - [ ] Add timestamp in Unix format
  - [ ] Support variant suffixes (thumb, small, medium, large)

- [ ] **Add cleanup utilities**
  - [ ] Implement temp file cleanup
  - [ ] Add orphaned file detection
  - [ ] Create cleanup cron job

#### S3StorageAdapter Implementation

- [ ] **Setup AWS SDK**

  ```bash
  pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
  ```

- [ ] **Implement IStorageAdapter interface**
  - [ ] `uploadFile()` - Upload to S3
  - [ ] `deleteFile()` - Delete from S3
  - [ ] `generateViewUrl()` - Presigned GET URL
  - [ ] `generateDownloadUrl()` - Presigned GET URL with disposition
  - [ ] `generateThumbnailUrl()` - Thumbnail presigned URL
  - [ ] `generateMultipleUrls()` - Batch URL generation
  - [ ] `healthCheck()` - Check S3 connectivity
  - [ ] `validateConfiguration()` - Validate S3 config
  - [ ] `getStorageType()` - Return 'S3'
  - [ ] `getProviderInfo()` - Return S3 metadata

- [ ] **Configuration**
  - [ ] Read from environment variables
  - [ ] Support custom endpoints (LocalStack, S3-compatible)
  - [ ] Add region configuration
  - [ ] Add bucket configuration
  - [ ] Add ACL configuration

- [ ] **Error handling**
  - [ ] Catch S3 errors
  - [ ] Map to StorageAdapterError
  - [ ] Add retry logic
  - [ ] Log errors

#### MinIOStorageAdapter Implementation

- [ ] **Setup MinIO Client**

  ```bash
  pnpm add minio
  ```

- [ ] **Implement IStorageAdapter interface**
  - [ ] Same methods as S3Adapter
  - [ ] Use MinIO SDK instead of AWS SDK

- [ ] **Configuration**
  - [ ] Read from environment variables
  - [ ] Support endpoint configuration
  - [ ] Support SSL/non-SSL
  - [ ] Add bucket auto-creation

#### StorageAdapterFactory

- [ ] **Create factory pattern**

  ```typescript
  class StorageAdapterFactory {
    static create(config: StorageConfiguration): IStorageAdapter;
    static getSupportedTypes(): StorageType[];
  }
  ```

- [ ] **Provider auto-selection**
  - [ ] Read from `STORAGE_PROVIDER` env var
  - [ ] Validate configuration
  - [ ] Return appropriate adapter
  - [ ] Throw error if invalid provider

- [ ] **Add provider registry**
  - [ ] Register LocalStorageAdapter
  - [ ] Register S3StorageAdapter
  - [ ] Register MinIOStorageAdapter
  - [ ] Allow custom adapter registration

### 1.2 Core Upload Service

#### Refactor FileUploadService

- [ ] **Update service to use new structure**
  - [ ] Remove old directory logic
  - [ ] Use StorageAdapterFactory
  - [ ] Update file naming
  - [ ] Update metadata tracking

- [ ] **Chunked upload support**
  - [ ] Create upload session
  - [ ] Handle chunk uploads
  - [ ] Track chunk progress
  - [ ] Reassemble chunks on completion
  - [ ] Validate file integrity (checksum)
  - [ ] Cleanup failed uploads

- [ ] **Resumable upload tracking**
  - [ ] Store upload session in database
  - [ ] Track uploaded chunks
  - [ ] Allow resume from any chunk
  - [ ] Expire old sessions (24 hours)

- [ ] **Presigned URL generation**
  - [ ] Generate S3 presigned PUT URL
  - [ ] Generate MinIO presigned PUT URL
  - [ ] Include required headers
  - [ ] Set expiration (15 minutes)
  - [ ] Return file ID for metadata update

- [ ] **Virus scanning integration**
  - [ ] Add ClamAV client
  - [ ] Scan before storage
  - [ ] Quarantine infected files
  - [ ] Update file status
  - [ ] Notify admin

- [ ] **Improved duplicate detection**
  - [ ] Hash-based detection (SHA256)
  - [ ] Perceptual hash for images (pHash)
  - [ ] Configurable similarity threshold
  - [ ] Return duplicates with similarity score

- [ ] **File versioning support**
  - [ ] Track file versions
  - [ ] Store version metadata
  - [ ] Cleanup old versions
  - [ ] Max versions configuration

### 1.3 API Routes

#### Create upload.routes.ts

- [ ] **POST `/api/upload/single`**
  - [ ] Schema: FileUploadRequestSchema
  - [ ] Handler: uploadSingleFile
  - [ ] Response: UploadedFileSchema
  - [ ] Error handling

- [ ] **POST `/api/upload/multiple`**
  - [ ] Schema: MultipleFileUploadRequestSchema
  - [ ] Handler: uploadMultipleFiles
  - [ ] Response: MultipleUploadResultSchema
  - [ ] Parallel processing
  - [ ] Error handling

- [ ] **POST `/api/upload/chunk`**
  - [ ] Schema: ChunkUploadInitSchema
  - [ ] Handler: initChunkUpload
  - [ ] Create upload session
  - [ ] Response: session ID and upload URL

- [ ] **PUT `/api/upload/chunk/:sessionId/:chunkNumber`**
  - [ ] Handler: uploadChunk
  - [ ] Validate chunk number
  - [ ] Save chunk
  - [ ] Update progress
  - [ ] Response: progress

- [ ] **POST `/api/upload/chunk/:sessionId/complete`**
  - [ ] Handler: completeChunkUpload
  - [ ] Validate all chunks uploaded
  - [ ] Reassemble file
  - [ ] Generate storage key
  - [ ] Upload to storage
  - [ ] Cleanup chunks
  - [ ] Response: UploadedFile

- [ ] **GET `/api/upload/presigned-url`**
  - [ ] Query params: filename, category, mimeType
  - [ ] Generate presigned URL
  - [ ] Create pending file record
  - [ ] Response: presigned URL and file ID

- [ ] **GET `/api/upload/:id`**
  - [ ] Get file metadata
  - [ ] Check permissions
  - [ ] Response: file metadata

- [ ] **GET `/api/upload/:id/url`**
  - [ ] Generate signed access URL
  - [ ] Check permissions
  - [ ] Response: signed URL

- [ ] **DELETE `/api/upload/:id`**
  - [ ] Delete from storage
  - [ ] Delete from database
  - [ ] Check permissions
  - [ ] Response: success

- [ ] **GET `/api/upload/categories`**
  - [ ] Return available categories
  - [ ] Response: string array

#### OpenAPI Documentation

- [ ] **Document all endpoints**
  - [ ] Request schemas
  - [ ] Response schemas
  - [ ] Error responses
  - [ ] Examples

### 1.4 Database Schema

#### Update uploaded_files table

- [ ] **Add new columns**

  ```sql
  ALTER TABLE uploaded_files
  ADD COLUMN category VARCHAR(50),
  ADD COLUMN storage_provider VARCHAR(20),
  ADD COLUMN chunk_status JSONB,
  ADD COLUMN virus_scan_status VARCHAR(20),
  ADD COLUMN virus_scan_at TIMESTAMP,
  ADD COLUMN version INTEGER DEFAULT 1,
  ADD COLUMN parent_version_id UUID REFERENCES uploaded_files(id);
  ```

- [ ] **Add indexes**
  ```sql
  CREATE INDEX idx_uploaded_files_category ON uploaded_files(category);
  CREATE INDEX idx_uploaded_files_user_category ON uploaded_files(uploaded_by, category);
  CREATE INDEX idx_uploaded_files_storage_provider ON uploaded_files(storage_provider);
  ```

#### Create file_chunks table

- [ ] **Create table**

  ```sql
  CREATE TABLE file_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_session_id UUID NOT NULL REFERENCES upload_sessions(id) ON DELETE CASCADE,
    chunk_number INTEGER NOT NULL,
    chunk_size INTEGER NOT NULL,
    chunk_hash VARCHAR(64) NOT NULL,
    storage_path TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(upload_session_id, chunk_number)
  );
  ```

- [ ] **Add indexes**
  ```sql
  CREATE INDEX idx_file_chunks_session ON file_chunks(upload_session_id);
  CREATE INDEX idx_file_chunks_session_number ON file_chunks(upload_session_id, chunk_number);
  ```

#### Create upload_sessions table

- [ ] **Create table**

  ```sql
  CREATE TABLE upload_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    filename VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    total_size BIGINT NOT NULL,
    chunk_size INTEGER NOT NULL,
    total_chunks INTEGER NOT NULL,
    uploaded_chunks INTEGER DEFAULT 0,
    file_hash VARCHAR(64),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    file_id UUID REFERENCES uploaded_files(id)
  );
  ```

- [ ] **Add indexes**
  ```sql
  CREATE INDEX idx_upload_sessions_user ON upload_sessions(user_id);
  CREATE INDEX idx_upload_sessions_status ON upload_sessions(status);
  CREATE INDEX idx_upload_sessions_expires ON upload_sessions(expires_at);
  ```

#### Create Knex migrations

- [ ] **Migration: add_file_upload_improvements**
  - [ ] Up: Add columns to uploaded_files
  - [ ] Down: Remove columns

- [ ] **Migration: create_upload_sessions**
  - [ ] Up: Create upload_sessions table
  - [ ] Down: Drop table

- [ ] **Migration: create_file_chunks**
  - [ ] Up: Create file_chunks table
  - [ ] Down: Drop table

### 1.5 Configuration

#### Environment Variables

- [ ] **Add to .env.example**

  ```bash
  # Storage Provider
  STORAGE_PROVIDER=local # local | s3 | minio

  # Local Storage
  STORAGE_LOCAL_PATH=uploads

  # AWS S3
  AWS_REGION=us-east-1
  AWS_S3_BUCKET=
  AWS_ACCESS_KEY_ID=
  AWS_SECRET_ACCESS_KEY=
  AWS_S3_ENDPOINT= # Optional

  # MinIO
  MINIO_ENDPOINT=
  MINIO_PORT=9000
  MINIO_USE_SSL=false
  MINIO_ACCESS_KEY=
  MINIO_SECRET_KEY=
  MINIO_BUCKET=

  # Upload Limits
  MAX_FILE_SIZE=104857600 # 100MB
  MAX_UPLOAD_FILES=10
  CHUNK_SIZE=1048576 # 1MB

  # Features
  ENABLE_VIRUS_SCAN=false
  ENABLE_FILE_VERSIONING=false
  CLEANUP_TEMP_FILES=true
  TEMP_FILE_EXPIRY_HOURS=24
  ```

#### Create config/storage.config.ts

- [ ] **Export configuration object**
- [ ] **Validate required fields**
- [ ] **Provide defaults**

---

## Phase 2: Frontend Widget (Week 2)

### 2.1 Core Upload Widget Component

#### Create widget structure

```
apps/web/src/app/shared/components/upload-widget/
├── upload-widget.component.ts
├── upload-widget.component.html
├── upload-widget.component.scss
├── upload-widget.types.ts
├── upload-widget.service.ts
└── index.ts
```

#### Component Implementation

- [ ] **Create component class**

  ```typescript
  @Component({
    selector: 'app-upload-widget',
    standalone: true,
    // ...
  })
  export class UploadWidgetComponent {}
  ```

- [ ] **Add inputs**
  - [ ] `@Input() mode: 'single' | 'multiple'`
  - [ ] `@Input() category: string`
  - [ ] `@Input() maxFiles: number`
  - [ ] `@Input() maxFileSize: number`
  - [ ] `@Input() accept: string`
  - [ ] `@Input() enableDragDrop: boolean`
  - [ ] `@Input() enableImagePreview: boolean`
  - [ ] `@Input() enableCropping: boolean`
  - [ ] `@Input() cropperAspectRatio: number`
  - [ ] `@Input() cropperShape: 'square' | 'circle'`
  - [ ] `@Input() chunkSize: number`
  - [ ] `@Input() enableResumable: boolean`
  - [ ] `@Input() directToS3: boolean`

- [ ] **Add outputs**
  - [ ] `@Output() onUploadStart: EventEmitter<File[]>`
  - [ ] `@Output() onUploadProgress: EventEmitter<ProgressEvent>`
  - [ ] `@Output() onUploadComplete: EventEmitter<UploadedFile[]>`
  - [ ] `@Output() onUploadError: EventEmitter<ErrorEvent>`
  - [ ] `@Output() onFileValidationError: EventEmitter<ValidationError>`

- [ ] **Add signals for state**
  - [ ] `files = signal<File[]>([])`
  - [ ] `previews = signal<FilePreview[]>([])`
  - [ ] `progress = signal<Map<string, number>>(new Map())`
  - [ ] `uploading = signal<boolean>(false)`
  - [ ] `errors = signal<Map<string, string>>(new Map())`

### 2.2 Features

#### Drag & Drop

- [ ] **Implement drag zone**
  - [ ] Add drag event listeners
  - [ ] Highlight zone on drag over
  - [ ] Handle drop event
  - [ ] Validate files on drop

- [ ] **Visual feedback**
  - [ ] Show drop zone border
  - [ ] Change background color
  - [ ] Show "Drop files here" message

#### File Preview

- [ ] **Image preview**
  - [ ] Read file as Data URL
  - [ ] Display thumbnail
  - [ ] Show filename
  - [ ] Show file size

- [ ] **PDF preview**
  - [ ] Use PDF.js to render first page
  - [ ] Show thumbnail
  - [ ] Add PDF icon

- [ ] **File type icons**
  - [ ] Add Material Icons
  - [ ] Map mime types to icons
  - [ ] Show for non-image files

#### Image Cropping

- [ ] **Install angular-cropper**

  ```bash
  pnpm add angular-cropper cropperjs
  ```

- [ ] **Create cropper dialog**
  - [ ] Open dialog on image selection
  - [ ] Show image in cropper
  - [ ] Add zoom controls
  - [ ] Add rotate controls
  - [ ] Add aspect ratio selector
  - [ ] Apply crop on confirm

- [ ] **Support crop shapes**
  - [ ] Square crop
  - [ ] Circle crop
  - [ ] Free aspect ratio

#### Progress Tracking

- [ ] **Individual file progress**
  - [ ] Track progress per file
  - [ ] Show progress bar
  - [ ] Show percentage
  - [ ] Show upload speed
  - [ ] Show ETA

- [ ] **Overall progress**
  - [ ] Calculate total progress
  - [ ] Show overall progress bar
  - [ ] Show total uploaded/total size

#### Error Handling

- [ ] **Validation errors**
  - [ ] File size too large
  - [ ] File type not allowed
  - [ ] Too many files
  - [ ] Show error message
  - [ ] Prevent upload

- [ ] **Upload errors**
  - [ ] Network error
  - [ ] Server error
  - [ ] Show error message
  - [ ] Allow retry

- [ ] **Visual error states**
  - [ ] Red border on error
  - [ ] Error icon
  - [ ] Error message below file

#### Controls

- [ ] **Pause/Resume**
  - [ ] Pause upload
  - [ ] Resume from last chunk
  - [ ] Update button state

- [ ] **Cancel**
  - [ ] Cancel upload
  - [ ] Abort XHR request
  - [ ] Remove from queue

- [ ] **Retry**
  - [ ] Retry failed upload
  - [ ] Show retry button
  - [ ] Track retry count

- [ ] **Remove**
  - [ ] Remove file from queue
  - [ ] Remove preview
  - [ ] Update state

### 2.3 Upload Service

#### Create upload.service.ts

```typescript
@Injectable({ providedIn: 'root' })
export class UploadService {
  private httpClient = inject(HttpClient);

  uploadSingle(file: File, options: UploadOptions): Observable<UploadProgress>;
  uploadMultiple(files: File[], options: UploadOptions): Observable<UploadProgress>;
  uploadChunked(file: File, options: ChunkedUploadOptions): Observable<UploadProgress>;
  uploadDirectToS3(file: File, presignedUrl: string): Observable<UploadProgress>;
  getPresignedUrl(filename: string, category: string, mimeType: string): Observable<PresignedUrlResponse>;
  pauseUpload(uploadId: string): void;
  resumeUpload(uploadId: string): void;
  cancelUpload(uploadId: string): void;
}
```

#### Implement chunked upload

- [ ] **Split file into chunks**
  - [ ] Use Blob.slice()
  - [ ] Calculate chunk count
  - [ ] Generate chunk hashes

- [ ] **Upload chunks sequentially**
  - [ ] Upload chunk 1
  - [ ] Update progress
  - [ ] Upload chunk 2
  - [ ] Continue until complete

- [ ] **Handle errors**
  - [ ] Retry failed chunk
  - [ ] Resume from failed chunk
  - [ ] Max retry count

#### Implement resumable upload

- [ ] **Save progress to localStorage**
  - [ ] Upload session ID
  - [ ] Uploaded chunks array
  - [ ] File metadata

- [ ] **Resume from saved state**
  - [ ] Load from localStorage
  - [ ] Find last uploaded chunk
  - [ ] Continue from next chunk

- [ ] **Clean up localStorage**
  - [ ] Remove on successful upload
  - [ ] Remove on cancel
  - [ ] Expire old entries

#### Implement direct S3 upload

- [ ] **Get presigned URL**
  - [ ] Call `/api/upload/presigned-url`
  - [ ] Extract upload URL and fields

- [ ] **Upload to S3**
  - [ ] Use presigned URL
  - [ ] Include required fields
  - [ ] Track progress

- [ ] **Notify backend**
  - [ ] Call `/api/upload/:id/complete`
  - [ ] Update file metadata

#### Implement parallel multi-file uploads

- [ ] **Upload files in parallel**
  - [ ] Use `forkJoin` or `combineLatest`
  - [ ] Max concurrent uploads (3-5)
  - [ ] Queue remaining files

- [ ] **Track individual progress**
  - [ ] Map file to progress
  - [ ] Update UI per file

- [ ] **Calculate overall progress**
  - [ ] Sum all progress
  - [ ] Divide by file count

#### Network status detection

- [ ] **Listen to online/offline events**

  ```typescript
  window.addEventListener('online', () => this.onOnline());
  window.addEventListener('offline', () => this.onOffline());
  ```

- [ ] **Pause uploads on offline**
  - [ ] Pause all active uploads
  - [ ] Show offline message

- [ ] **Resume uploads on online**
  - [ ] Resume paused uploads
  - [ ] Retry failed requests

---

## Phase 3: Migration & Testing (Week 3)

### 3.1 Data Migration

#### Create migration script

- [ ] **Create `scripts/migrate-files.ts`**

- [ ] **Scan old structure**

  ```typescript
  function scanOldFiles(uploadDir: string): OldFileInfo[] {
    // Find all files in uploads/**/*
    // Extract metadata from path
    // Return array of file info
  }
  ```

- [ ] **Generate new paths**

  ```typescript
  function generateNewPath(oldFile: OldFileInfo): string {
    // Determine category from old path
    // Generate new path: {category}/{year-month}/{filename}
    // Return new path
  }
  ```

- [ ] **Move files**

  ```typescript
  async function moveFile(oldPath: string, newPath: string): Promise<void> {
    // Create target directory
    // Copy file
    // Verify copy
    // Delete original
  }
  ```

- [ ] **Update database**
  ```typescript
  async function updateFileRecord(fileId: string, newPath: string): Promise<void> {
    // Update storage_key
    // Update storage_path
    // Add migration timestamp
  }
  ```

#### Run migration

- [ ] **Dry run mode**
  - [ ] Show what would be migrated
  - [ ] Show new paths
  - [ ] Don't actually move files

- [ ] **Execute migration**
  - [ ] Backup database first
  - [ ] Move files
  - [ ] Update database
  - [ ] Log progress

- [ ] **Verify migration**
  - [ ] Check all files moved
  - [ ] Check database updated
  - [ ] Check file accessibility

- [ ] **Cleanup**
  - [ ] Delete empty old directories
  - [ ] Remove old folder structure

### 3.2 Testing

#### Unit Tests

**Storage Adapters**

- [ ] **LocalStorageAdapter**
  - [ ] Test file upload
  - [ ] Test file deletion
  - [ ] Test URL generation
  - [ ] Test directory creation
  - [ ] Test error handling

- [ ] **S3StorageAdapter**
  - [ ] Mock S3 client
  - [ ] Test file upload
  - [ ] Test file deletion
  - [ ] Test presigned URL generation
  - [ ] Test error handling

- [ ] **MinIOStorageAdapter**
  - [ ] Mock MinIO client
  - [ ] Test file upload
  - [ ] Test file deletion
  - [ ] Test presigned URL generation
  - [ ] Test error handling

**Core Upload Service**

- [ ] **File validation**
  - [ ] Test file size validation
  - [ ] Test mime type validation
  - [ ] Test file count validation

- [ ] **Chunked upload**
  - [ ] Test chunk splitting
  - [ ] Test chunk upload
  - [ ] Test chunk reassembly
  - [ ] Test integrity verification

- [ ] **Duplicate detection**
  - [ ] Test hash generation
  - [ ] Test duplicate finding
  - [ ] Test similarity scoring

#### Integration Tests

**API Endpoints**

- [ ] **POST /api/upload/single**
  - [ ] Test successful upload
  - [ ] Test validation errors
  - [ ] Test server errors

- [ ] **POST /api/upload/multiple**
  - [ ] Test successful upload
  - [ ] Test partial success
  - [ ] Test all failed

- [ ] **Chunked upload flow**
  - [ ] Test init session
  - [ ] Test upload chunks
  - [ ] Test complete upload
  - [ ] Test resume upload

- [ ] **Presigned URL flow**
  - [ ] Test get presigned URL
  - [ ] Test upload to S3
  - [ ] Test metadata update

#### E2E Tests

**Frontend Widget**

- [ ] **Single file upload**
  - [ ] Select file
  - [ ] Upload file
  - [ ] Verify success

- [ ] **Multiple files upload**
  - [ ] Select multiple files
  - [ ] Upload all files
  - [ ] Verify all uploaded

- [ ] **Drag & drop**
  - [ ] Drag file to zone
  - [ ] Drop file
  - [ ] Verify upload

- [ ] **Image cropping**
  - [ ] Select image
  - [ ] Open cropper
  - [ ] Crop image
  - [ ] Upload cropped

- [ ] **Error handling**
  - [ ] Upload invalid file
  - [ ] Verify error message
  - [ ] Retry upload

- [ ] **Pause/Resume**
  - [ ] Start upload
  - [ ] Pause upload
  - [ ] Resume upload
  - [ ] Verify completed

#### Load Testing

- [ ] **Large file upload (100MB)**
  - [ ] Test chunked upload
  - [ ] Measure time
  - [ ] Check memory usage

- [ ] **Many files upload (100 files)**
  - [ ] Test parallel upload
  - [ ] Measure time
  - [ ] Check server load

- [ ] **Concurrent users (10 users)**
  - [ ] Simulate 10 concurrent uploads
  - [ ] Measure throughput
  - [ ] Check errors

#### Browser Compatibility

- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest)
- [ ] **Edge** (latest)
- [ ] **Mobile Safari** (iOS)
- [ ] **Mobile Chrome** (Android)

#### S3/MinIO Integration Tests

- [ ] **S3 Integration**
  - [ ] Test upload to S3
  - [ ] Test download from S3
  - [ ] Test delete from S3
  - [ ] Test presigned URLs

- [ ] **MinIO Integration**
  - [ ] Test upload to MinIO
  - [ ] Test download from MinIO
  - [ ] Test delete from MinIO
  - [ ] Test presigned URLs

### 3.3 Documentation

#### API Documentation

- [ ] **OpenAPI/Swagger**
  - [ ] Document all endpoints
  - [ ] Add request examples
  - [ ] Add response examples
  - [ ] Add error codes

#### Widget Usage Guide

- [ ] **Create `docs/features/file-upload/WIDGET_GUIDE.md`**
  - [ ] Installation instructions
  - [ ] Basic usage examples
  - [ ] Advanced configuration
  - [ ] Styling guide
  - [ ] Event handling

#### Storage Adapter Configuration Guide

- [ ] **Create `docs/features/file-upload/STORAGE_CONFIG.md`**
  - [ ] Local storage setup
  - [ ] S3 configuration
  - [ ] MinIO configuration
  - [ ] Switching providers
  - [ ] Troubleshooting

#### Migration Guide

- [ ] **Create `docs/features/file-upload/MIGRATION_GUIDE.md`**
  - [ ] Why migrate
  - [ ] Before migration (backup)
  - [ ] Running migration
  - [ ] After migration (verify)
  - [ ] Rollback procedure

#### Troubleshooting Guide

- [ ] **Create `docs/features/file-upload/TROUBLESHOOTING.md`**
  - [ ] Common issues
  - [ ] Error codes and solutions
  - [ ] Performance issues
  - [ ] S3/MinIO connectivity issues

---

## ✅ Definition of Done

### Backend

- [ ] All storage adapters implemented and tested
- [ ] All API endpoints implemented and documented
- [ ] Database schema updated with migrations
- [ ] Configuration working for all providers
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Load tests passing

### Frontend

- [ ] Widget component fully functional
- [ ] All features working (drag-drop, cropping, progress, etc.)
- [ ] Upload service implemented
- [ ] E2E tests passing
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness verified

### Migration

- [ ] Migration script created and tested
- [ ] Data migration successful
- [ ] Old files verified in new locations
- [ ] Database updated correctly
- [ ] Old structure cleaned up

### Documentation

- [ ] API documentation complete
- [ ] Widget usage guide complete
- [ ] Configuration guide complete
- [ ] Migration guide complete
- [ ] Troubleshooting guide complete

---

## 🚀 Ready to Start?

1. **Review this checklist** with the team
2. **Set up project board** (GitHub Projects / Jira)
3. **Assign tasks** to developers
4. **Start with Phase 1** (Backend Core)

---

**Status**: 📋 Ready for Implementation
**Next Action**: Begin Phase 1.1 - Storage Adapters
