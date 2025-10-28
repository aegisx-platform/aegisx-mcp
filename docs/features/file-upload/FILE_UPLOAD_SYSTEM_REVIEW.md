# File Upload System Review & Redesign Plan

> **📌 Document Purpose**: Complete analysis of current file upload system and comprehensive redesign plan for a production-ready core upload system

**Created**: 2025-10-28
**Status**: 🔍 Analysis Phase
**Priority**: High
**Estimated Effort**: 2-3 weeks

---

## 📊 Executive Summary

### Current State

The existing file upload system has foundational components but suffers from:

- ❌ **Deep directory nesting** (6 levels deep: `uploads/{file-id}/file/{year}/{month}/{day}/{filename}`)
- ❌ **Missing S3/MinIO adapters** (only LocalStorageAdapter implemented)
- ❌ **Inconsistent file organization** (mixed patterns: UUID folders vs. avatars folder)
- ⚠️ **Limited reusability** (specialized components like avatar-upload, logo-upload instead of generic widget)
- ⚠️ **No unified upload widget** for frontend

### Target State

A production-ready core upload system with:

- ✅ **Clean, flat structure** (max 3 levels: `uploads/{category}/{year-month}/{filename}`)
- ✅ **Multi-provider support** (Local, S3, MinIO with easy switching)
- ✅ **Single upload API** (frontend handles parallel uploads - S3/MinIO pattern)
- ✅ **Reusable widgets** (unified widget with per-file progress, retry, cancel)
- ✅ **Type-safe API** (TypeBox schemas, proper error handling)
- ✅ **Performance optimized** (parallel uploads, chunked uploads, resumable uploads)

**Key Decision**: ✅ Use **Single File API** (no dedicated multiple endpoint)

- Frontend loops and uploads files individually (3-5 concurrent)
- Same pattern as AWS S3, MinIO, Google Cloud Storage
- Better progress tracking, error handling, and retry logic
- See: [MULTIPLE_UPLOAD_ANALYSIS.md](./MULTIPLE_UPLOAD_ANALYSIS.md)

---

## 🔍 Current System Analysis

### Backend Architecture

#### ✅ Strengths

1. **Well-Designed Interface** (`IStorageAdapter`)

   ```typescript
   // Good abstraction that supports multiple providers
   interface IStorageAdapter {
     uploadFile(buffer: Buffer, key: string, metadata?: Record<string, any>): Promise<UploadResult>;
     deleteFile(key: string): Promise<void>;
     generateViewUrl(fileKey: string, options?: ViewUrlOptions): Promise<string>;
     generateDownloadUrl(fileKey: string, options?: DownloadUrlOptions): Promise<string>;
     generateThumbnailUrl(fileKey: string, options?: ThumbnailUrlOptions): Promise<string>;
     healthCheck(): Promise<boolean>;
   }
   ```

2. **Flexible Configuration** (LocalStorageAdapter)
   - JWT-based signed URLs for security
   - Configurable expiry times
   - Optional features (compression, encryption, versioning, thumbnails)
   - Audit logging support

3. **Type Safety**
   - TypeBox schemas for validation
   - Strong TypeScript types throughout
   - Proper error classes (StorageAdapterError, ConfigurationError, UploadError, AccessError)

4. **Feature-Rich Service** (FileUploadService)
   - Single and multiple file uploads
   - Image processing with Sharp
   - Duplicate detection
   - File validation (size, mime type)
   - Metadata management

#### ❌ Critical Issues

1. **Directory Structure - Too Deep (6 levels)**

   ```
   Current Structure (PROBLEM):
   uploads/
   └── {file-id}/                    # Level 1: UUID folder per file
       └── file/                      # Level 2: Hardcoded "file" folder
           └── 2025/                  # Level 3: Year
               └── 09/                # Level 4: Month
                   └── 22/            # Level 5: Day
                       └── {filename} # Level 6: Actual file

   Path: uploads/0f427330-1f24-4f7b-99c5-b1a3d71185db/file/2025/09/22/1758527082553_female__1_.png
   ```

   **Problems**:
   - 🐛 Excessive nesting makes navigation difficult
   - 🐛 Hardcoded "file" folder adds no value
   - 🐛 Date folders at 3 levels (year/month/day) is overkill
   - 🐛 UUID folder per file is unnecessary (UUID is already in filename)
   - 🐛 Breaks compatibility with flat storage systems (S3 doesn't need deep folders)

2. **Inconsistent Organization**

   ```
   uploads/
   ├── 0f427330-.../file/2025/09/22/...  # General files (6 levels)
   ├── 02cde69e-.../file/2025/09/22/...  # General files (6 levels)
   └── avatars/                          # Avatars (1 level) ❌ Inconsistent!
       └── {user-id}_{file-id}_large.png
   ```

   **Problems**:
   - 🐛 Two different organizational patterns in same system
   - 🐛 No clear categorization strategy
   - 🐛 Difficult to apply consistent policies

3. **Missing Adapters**

   ```
   ✅ Implemented: LocalStorageAdapter
   ❌ Missing: S3StorageAdapter
   ❌ Missing: MinIOStorageAdapter
   ❌ Missing: Adapter factory pattern implementation
   ```

4. **Storage Key Generation Issues**
   - No standardized naming convention
   - Timestamp prefix makes sorting difficult
   - No conflict resolution strategy
   - No cleanup mechanism for orphaned folders

### Frontend Architecture

#### ✅ Strengths

1. **Shared Component Exists** (`file-upload.component.ts`)
   - Angular Material integration
   - Reactive forms
   - Upload options (category, public, temporary)
   - Progress tracking
   - File validation

2. **Service Layer** (`file-upload.service.ts`)
   - HTTP client abstraction
   - RxJS observables for progress
   - Error handling

#### ❌ Critical Issues

1. **Specialized Components Instead of Generic Widget**

   ```
   ❌ Multiple specialized components:
   - avatar-upload.component.ts (user profiles)
   - logo-upload.component.ts (PDF templates)
   - file-upload.component.ts (general purpose)

   ✅ Should have ONE widget with configuration:
   - <app-upload mode="single" />
   - <app-upload mode="multiple" />
   - <app-upload mode="avatar" />
   ```

2. **Limited Features**
   - ❌ No drag-and-drop support
   - ❌ No chunked uploads (large files)
   - ❌ No resumable uploads
   - ❌ No image preview before upload
   - ❌ No cropping tool
   - ❌ No file type icons

3. **No S3 Direct Upload**
   - All files go through backend (bandwidth heavy)
   - Should support presigned URL uploads directly to S3

---

## 🎯 Proposed Solution: Core Upload System

### Design Goals

1. **🎯 Universal Reusability**
   - Single upload widget that works everywhere
   - Configuration-based behavior
   - Support single/multiple files
   - Works with any storage provider

2. **📦 Multi-Provider Support**
   - Local storage (development)
   - AWS S3 (production)
   - MinIO (self-hosted)
   - Easy provider switching

3. **🚀 Performance**
   - Chunked uploads for large files
   - Parallel multi-file uploads
   - Direct-to-S3 uploads (presigned URLs)
   - Resumable uploads

4. **🎨 Modern UX**
   - Drag-and-drop
   - Image preview
   - Cropping tool (for avatars)
   - Progress indicators
   - File type icons

5. **🔒 Security**
   - Virus scanning integration
   - File type validation
   - Size limits
   - Signed URLs
   - Rate limiting

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📱 Upload Widget (Angular Component)                       │
│  ├── Single File Mode                                       │
│  ├── Multiple Files Mode                                    │
│  ├── Drag & Drop                                            │
│  ├── Image Preview & Cropping                               │
│  └── Progress Tracking                                      │
│                                                              │
│  📡 Upload Service (Angular Service)                        │
│  ├── Chunked Upload                                         │
│  ├── Resumable Upload                                       │
│  ├── Direct S3 Upload (presigned URLs)                      │
│  └── Multi-file Parallel Processing                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🎯 Upload Controller (Fastify)                             │
│  ├── POST /api/upload/single                                │
│  ├── POST /api/upload/multiple                              │
│  ├── POST /api/upload/chunk                                 │
│  ├── POST /api/upload/complete                              │
│  └── GET  /api/upload/presigned-url                         │
│                                                              │
│  🔧 Core Upload Service                                     │
│  ├── File Validation                                        │
│  ├── Duplicate Detection                                    │
│  ├── Metadata Management                                    │
│  ├── Image Processing (Sharp)                               │
│  └── Virus Scanning (ClamAV integration)                    │
│                                                              │
│  🗄️ Storage Adapter Factory                                │
│  ├── LocalStorageAdapter                                    │
│  ├── S3StorageAdapter                                       │
│  ├── MinIOStorageAdapter                                    │
│  └── Automatic provider selection                           │
│                                                              │
│  🗃️ File Repository (PostgreSQL)                           │
│  └── Metadata, tracking, audit logs                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Storage Layer                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  💾 Local Filesystem                                        │
│  uploads/                                                    │
│  ├── avatars/2025-10/{filename}                             │
│  ├── documents/2025-10/{filename}                           │
│  └── images/2025-10/{filename}                              │
│                                                              │
│  ☁️ AWS S3 / MinIO                                          │
│  my-bucket/                                                  │
│  ├── avatars/2025-10/{filename}                             │
│  ├── documents/2025-10/{filename}                           │
│  └── images/2025-10/{filename}                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 New Directory Structure

### Flat, Organized Structure (Max 3 Levels)

```
uploads/
├── avatars/              # User avatars
│   ├── 2025-10/          # Year-Month
│   │   ├── {user-id}_{timestamp}_{hash}.png
│   │   └── {user-id}_{timestamp}_{hash}_thumb.png
│   └── 2025-11/
│
├── documents/            # Documents (PDF, Word, Excel, etc.)
│   ├── 2025-10/
│   │   └── {original-name}_{timestamp}_{hash}.pdf
│   └── 2025-11/
│
├── images/               # General images
│   ├── 2025-10/
│   │   ├── {filename}_{timestamp}_{hash}.jpg
│   │   └── {filename}_{timestamp}_{hash}_thumb.jpg
│   └── 2025-11/
│
├── videos/               # Video files
│   └── 2025-10/
│
├── temp/                 # Temporary files (auto-cleanup)
│   └── {session-id}_{timestamp}_{hash}.tmp
│
└── .gitkeep

Benefits:
✅ Only 3 levels deep (category/year-month/file)
✅ Easy to navigate
✅ Works with S3/MinIO (flat structure)
✅ Automatic organization by category
✅ Simple cleanup (delete old year-month folders)
✅ Filename contains all metadata (timestamp, hash, thumbnail suffix)
```

### Filename Convention

```
Pattern: {identifier}_{timestamp}_{hash}[_{variant}].{ext}

Examples:
- Avatar:     user-123_1698765432_a1b2c3d4.png
- Thumbnail:  user-123_1698765432_a1b2c3d4_thumb.png
- Document:   invoice_1698765432_e5f6g7h8.pdf
- Image:      photo_1698765432_i9j0k1l2.jpg

Components:
- identifier: Context-specific (user-id, original filename, etc.)
- timestamp:  Unix timestamp for uniqueness and sorting
- hash:       First 8 chars of file content hash (SHA256)
- variant:    Optional (thumb, small, medium, large, etc.)
- ext:        File extension
```

---

## 🏗️ Implementation Plan

### Phase 1: Backend Core (Week 1)

#### 1.1 Storage Adapter Refactoring

- [ ] Fix LocalStorageAdapter to use new flat structure
- [ ] Implement S3StorageAdapter
- [ ] Implement MinIOStorageAdapter
- [ ] Create StorageAdapterFactory with provider auto-selection
- [ ] Add configuration validation
- [ ] Add health checks for all adapters

#### 1.2 Core Upload Service

- [ ] Refactor FileUploadService to support new structure
- [ ] Implement chunked upload support
- [ ] Add resumable upload tracking
- [ ] Implement presigned URL generation (S3/MinIO)
- [ ] Add virus scanning integration (ClamAV)
- [ ] Improve duplicate detection
- [ ] Add file versioning support

#### 1.3 API Routes

**Core Upload API** (Single file only):

- [ ] POST `/api/upload` - Upload single file (main endpoint)
- [ ] POST `/api/upload/chunk/:sessionId` - Upload file chunk
- [ ] POST `/api/upload/chunk/:sessionId/complete` - Complete chunked upload
- [ ] GET `/api/upload/presigned-url` - Get presigned URL for direct S3/MinIO upload

**File Management API**:

- [ ] GET `/api/upload/:id` - Get file metadata
- [ ] GET `/api/upload/:id/url` - Get signed URL for access
- [ ] DELETE `/api/upload/:id` - Delete file
- [ ] GET `/api/upload/categories` - Get available categories
- [ ] GET `/api/upload` - List user files (with pagination)

**Note**: ❌ **No dedicated multiple upload endpoint**

- Frontend handles parallel uploads (3-5 files concurrent)
- Loop single upload API for each file
- Same pattern as AWS S3, MinIO, Google Cloud Storage

#### 1.4 Database Schema

```sql
-- Existing: uploaded_files table (keep with modifications)
ALTER TABLE uploaded_files ADD COLUMN category VARCHAR(50);
ALTER TABLE uploaded_files ADD COLUMN storage_provider VARCHAR(20);
ALTER TABLE uploaded_files ADD COLUMN chunk_status JSONB;
ALTER TABLE uploaded_files ADD COLUMN virus_scan_status VARCHAR(20);
ALTER TABLE uploaded_files ADD COLUMN version INTEGER DEFAULT 1;

-- New: file_chunks table (for resumable uploads)
CREATE TABLE file_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_session_id UUID NOT NULL,
  chunk_number INTEGER NOT NULL,
  chunk_size INTEGER NOT NULL,
  chunk_hash VARCHAR(64) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(upload_session_id, chunk_number)
);

-- New: upload_sessions table (for chunked uploads)
CREATE TABLE upload_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  filename VARCHAR(255) NOT NULL,
  total_size BIGINT NOT NULL,
  chunk_size INTEGER NOT NULL,
  total_chunks INTEGER NOT NULL,
  uploaded_chunks INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP
);
```

### Phase 2: Frontend Widget (Week 2)

#### 2.1 Core Upload Widget Component

```typescript
<app-upload
  [mode]="'single' | 'multiple'"
  [category]="'avatars' | 'documents' | 'images' | 'videos'"
  [maxFiles]="10"
  [maxFileSize]="10485760"
  [accept]="'.jpg,.png,.pdf'"
  [enableDragDrop]="true"
  [enableImagePreview]="true"
  [enableCropping]="true"
  [chunkSize]="1048576"
  [enableResumable]="true"
  (onUploadComplete)="handleUpload($event)"
  (onUploadProgress)="handleProgress($event)"
  (onUploadError)="handleError($event)"
/>
```

#### 2.2 Features

- [ ] Drag-and-drop zone
- [ ] File type icons
- [ ] Image preview
- [ ] Image cropping (angular-cropper)
- [ ] Multiple file selection
- [ ] Individual file progress bars
- [ ] Overall upload progress
- [ ] Pause/Resume uploads
- [ ] Cancel uploads
- [ ] Error handling with retry
- [ ] File validation (client-side)

#### 2.3 Upload Service

- [ ] Chunked upload implementation
- [ ] Resumable upload (save progress in localStorage)
- [ ] Direct S3 upload via presigned URLs
- [ ] Parallel multi-file uploads
- [ ] Progress tracking with RxJS
- [ ] Automatic retry on failure
- [ ] Network status detection

### Phase 3: Migration & Testing (Week 3)

#### 3.1 Data Migration

- [ ] Create migration script for existing files
- [ ] Move files from old structure to new structure
- [ ] Update database records with new paths
- [ ] Verify all files migrated successfully
- [ ] Cleanup old empty directories

#### 3.2 Testing

- [ ] Unit tests for adapters
- [ ] Integration tests for upload flow
- [ ] E2E tests for widget
- [ ] Load testing (large files, many files)
- [ ] S3/MinIO integration tests
- [ ] Browser compatibility tests
- [ ] Mobile responsiveness tests

#### 3.3 Documentation

- [ ] API documentation (OpenAPI/Swagger)
- [ ] Widget usage guide
- [ ] Storage adapter configuration guide
- [ ] Migration guide for existing features
- [ ] Troubleshooting guide

---

## 🔧 Technical Specifications

### Backend API Endpoints

#### 1. Single File Upload (Main Endpoint)

```
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: File
- category: string (avatars|documents|images|videos)
- isPublic: boolean
- isTemporary: boolean
- metadata: JSON

Response:
{
  success: true,
  data: {
    id: "uuid",
    filename: "original.pdf",
    storageKey: "documents/2025-10/invoice_1698765432_e5f6g7h8.pdf",
    url: "https://...",
    mimeType: "application/pdf",
    fileSize: 102400,
    category: "documents",
    metadata: { ... }
  }
}
```

**Note**: For multiple files, frontend loops this endpoint:

```typescript
// Frontend handles parallel uploads
const results = await Promise.allSettled(files.map((file) => uploadSingle(file)));

// Track progress per file
files.forEach((file) => {
  uploadSingle(file, {
    onProgress: (progress) => updateFileProgress(file.name, progress),
  });
});
```

#### 2. Chunked Upload (Start)

```
POST /api/upload/chunk
Content-Type: application/json

Body:
{
  filename: "large-video.mp4",
  totalSize: 104857600,
  chunkSize: 1048576,
  category: "videos"
}

Response:
{
  success: true,
  data: {
    sessionId: "uuid",
    uploadUrl: "https://.../chunk",
    expiresAt: "2025-10-29T00:00:00Z"
  }
}
```

#### 3. Chunked Upload (Upload Chunk)

```
PUT /api/upload/chunk/:sessionId/:chunkNumber
Content-Type: application/octet-stream

Body: Binary chunk data

Response:
{
  success: true,
  data: {
    chunkNumber: 1,
    totalChunks: 100,
    uploadedChunks: 1,
    progress: 1
  }
}
```

#### 4. Chunked Upload (Complete)

```
POST /api/upload/chunk/:sessionId/complete

Response:
{
  success: true,
  data: {
    id: "uuid",
    filename: "large-video.mp4",
    storageKey: "videos/2025-10/...",
    url: "https://..."
  }
}
```

#### 5. Get Presigned URL (Direct S3 Upload)

```
GET /api/upload/presigned-url?filename=photo.jpg&category=images&mimeType=image/jpeg

Response:
{
  success: true,
  data: {
    uploadUrl: "https://s3.amazonaws.com/...",
    fileId: "uuid",
    expiresAt: "2025-10-28T01:00:00Z",
    fields: {
      key: "images/2025-10/photo_1698765432_i9j0k1l2.jpg",
      policy: "...",
      signature: "..."
    }
  }
}
```

### Storage Configuration

```typescript
// config/storage.config.ts
export const storageConfig = {
  provider: process.env.STORAGE_PROVIDER || 'local', // 'local' | 's3' | 'minio'

  local: {
    uploadPath: 'uploads',
    baseUrl: process.env.API_BASE_URL,
    jwtSecret: process.env.JWT_SECRET,
  },

  s3: {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_S3_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_S3_ENDPOINT, // Optional for S3-compatible services
  },

  minio: {
    endpoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucket: process.env.MINIO_BUCKET,
  },

  limits: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 10,
    chunkSize: 1024 * 1024, // 1MB
    allowedMimeTypes: ['image/*', 'application/pdf', 'text/*'],
    allowedCategories: ['avatars', 'documents', 'images', 'videos'],
  },

  features: {
    enableVirusScanning: process.env.ENABLE_VIRUS_SCAN === 'true',
    enableThumbnails: true,
    enableVersioning: false,
    enableCompression: false,
    cleanupTempFiles: true,
    tempFileExpiryHours: 24,
  },
};
```

---

## 🎨 Frontend Widget Specifications

### Widget Modes

#### Single File Mode

```typescript
<app-upload
  mode="single"
  category="avatars"
  [accept]="'.jpg,.png'"
  [maxFileSize]="5242880"
  [enableCropping]="true"
  [aspectRatio]="1"
  (onUploadComplete)="onAvatarUploaded($event)"
/>
```

#### Multiple Files Mode

```typescript
<app-upload
  mode="multiple"
  category="documents"
  [accept]="'.pdf,.doc,.docx'"
  [maxFiles]="5"
  [maxFileSize]="10485760"
  [enableDragDrop]="true"
  (onUploadComplete)="onDocumentsUploaded($event)"
/>
```

### Widget Features

1. **Drag & Drop**
   - Drag files over zone
   - Visual feedback (highlight zone)
   - Drop to upload

2. **File Preview**
   - Image thumbnails
   - PDF first page preview
   - File type icons for other files

3. **Image Cropping** (for avatars)
   - Angular Cropper integration
   - Aspect ratio constraints
   - Zoom controls

4. **Progress Tracking**
   - Individual file progress bars
   - Overall progress
   - Upload speed
   - Estimated time remaining

5. **Error Handling**
   - Validation errors (size, type)
   - Upload errors with retry
   - Network errors
   - Clear error messages

6. **Controls**
   - Pause/Resume (for large files)
   - Cancel
   - Retry failed uploads
   - Remove file from queue

---

## 📋 Configuration Examples

### Environment Variables

```bash
# Storage Provider
STORAGE_PROVIDER=s3  # local | s3 | minio

# Local Storage
STORAGE_LOCAL_PATH=uploads
API_BASE_URL=http://localhost:3333

# AWS S3
AWS_REGION=us-east-1
AWS_S3_BUCKET=my-app-uploads
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=uploads

# Features
ENABLE_VIRUS_SCAN=false
MAX_FILE_SIZE=104857600  # 100MB
MAX_UPLOAD_FILES=10
CHUNK_SIZE=1048576  # 1MB
```

### Usage in Features

#### Avatar Upload

```typescript
// user-profile/components/avatar-upload.component.ts
@Component({
  template: ` <app-upload mode="single" category="avatars" [accept]="'.jpg,.jpeg,.png,.webp'" [maxFileSize]="5242880" [enableCropping]="true" [aspectRatio]="1" [cropperShape]="'circle'" (onUploadComplete)="onAvatarUploaded($event)" /> `,
})
export class AvatarUploadComponent {
  onAvatarUploaded(file: UploadedFile) {
    this.userService.updateAvatar(file.url);
  }
}
```

#### Document Upload

```typescript
// documents/components/document-upload.component.ts
@Component({
  template: ` <app-upload mode="multiple" category="documents" [accept]="'.pdf,.doc,.docx,.xls,.xlsx'" [maxFiles]="10" [maxFileSize]="10485760" [enableDragDrop]="true" [enableChunked]="true" (onUploadComplete)="onDocumentsUploaded($event)" /> `,
})
export class DocumentUploadComponent {
  onDocumentsUploaded(files: UploadedFile[]) {
    this.documentService.saveDocuments(files);
  }
}
```

---

## ✅ Success Criteria

### Performance

- ⚡ Single file upload < 2 seconds (1MB file)
- ⚡ Multiple files (10x 1MB) < 10 seconds
- ⚡ Chunked upload for 100MB file < 60 seconds
- ⚡ Direct S3 upload (no backend bottleneck)

### Reliability

- 🛡️ 99.9% upload success rate
- 🛡️ Automatic retry on failure (3 attempts)
- 🛡️ Resume failed uploads
- 🛡️ No data loss on network interruption

### Usability

- 🎨 Intuitive drag-and-drop interface
- 🎨 Clear progress indicators
- 🎨 Helpful error messages
- 🎨 Mobile-friendly

### Maintainability

- 📦 Single reusable widget
- 📦 Easy provider switching
- 📦 Clear documentation
- 📦 Comprehensive tests

---

## 🚀 Next Steps

1. **Review & Approval** (You)
   - Review this document
   - Approve design decisions
   - Provide feedback

2. **Phase 1 Implementation** (Week 1)
   - Backend adapters
   - Core upload service
   - API routes
   - Database schema

3. **Phase 2 Implementation** (Week 2)
   - Frontend widget
   - Upload service
   - Features (drag-drop, cropping, etc.)

4. **Phase 3 Migration & Testing** (Week 3)
   - Data migration
   - Testing
   - Documentation

---

## 📚 References

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [Angular Cropper](https://www.npmjs.com/package/angular-cropper)
- [Fastify Multipart](https://github.com/fastify/fastify-multipart)

---

**Status**: 📋 Ready for Review
**Next Action**: Wait for user approval to begin implementation
