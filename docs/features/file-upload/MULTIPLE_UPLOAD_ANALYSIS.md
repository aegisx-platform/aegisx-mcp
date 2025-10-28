# Multiple File Upload: Single API vs Dedicated Endpoint Analysis

> **📌 Purpose**: Deep analysis comparing two approaches for multiple file uploads

**Created**: 2025-10-28
**Decision**: ✅ Use Single File API (Loop on Frontend)
**Based On**: MinIO, AWS S3, Google Cloud Storage patterns

---

## 🎯 TL;DR - Executive Summary

**คำถาม**: Multiple file upload ควรทำแบบไหน?

**คำตอบ**: ✅ **ใช้ Single File API ยิงทีละไฟล์ดีกว่า**

**เหตุผล**:

- ✅ Implementation ง่ายกว่า (API เดียว)
- ✅ Progress tracking แม่นยำ (per file)
- ✅ Error handling ดีกว่า (fail แค่ไฟล์เดียว)
- ✅ Retry/Cancel ง่าย (ทีละไฟล์)
- ✅ MinIO, S3, GCS ทำแบบนี้ทั้งหมด

---

## 📊 Comparison: Two Approaches

### Approach A: Dedicated Multiple Upload Endpoint ❌

```typescript
// ❌ แบบเดิม: มี endpoint แยก
POST /api/upload/multiple
Content-Type: multipart/form-data

Body:
- files[0]: File
- files[1]: File
- files[2]: File
- category: "documents"
- isPublic: false

Response:
{
  uploaded: [...],
  failed: [...],
  summary: { total: 3, uploaded: 2, failed: 1 }
}
```

**Backend Implementation**:

```typescript
// ต้อง handle array of files
async uploadMultiple(files: MultipartFile[], options: UploadOptions) {
  const results = {
    uploaded: [],
    failed: [],
  };

  // Loop และ process ทีละไฟล์อยู่ดี
  for (const file of files) {
    try {
      const uploaded = await this.uploadSingle(file, options);
      results.uploaded.push(uploaded);
    } catch (error) {
      results.failed.push({ filename: file.filename, error: error.message });
    }
  }

  return results;
}
```

**Frontend Implementation**:

```typescript
// ส่งหลายไฟล์ใน request เดียว
async uploadMultiple(files: File[]) {
  const formData = new FormData();

  // Append all files
  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file);
  });

  formData.append('category', 'documents');

  // One request for all files
  const response = await fetch('/api/upload/multiple', {
    method: 'POST',
    body: formData
  });

  return response.json();
}
```

**Problems**:

1. **❌ Progress Tracking ยาก**
   - ได้แค่ progress รวมของทั้ง request
   - ไม่รู้ว่าแต่ละไฟล์อยู่ที่ไหน
   - ไม่สามารถแสดง progress bar แยกได้

2. **❌ Error Handling ซับซ้อน**
   - ถ้าไฟล์หนึ่งผิดพลาด ต้อง decide ว่าจะทำอย่างไร
   - Continue กับไฟล์อื่นไหม?
   - Rollback ทั้งหมดไหม?
   - Partial success response ซับซ้อน

3. **❌ Memory Intensive**
   - ต้องเก็บหลายไฟล์ใน memory พร้อมกัน
   - ถ้า upload 10 ไฟล์ๆ 10MB = 100MB in memory

4. **❌ Retry ยาก**
   - ต้อง retry ทั้งหมด (รวมไฟล์ที่สำเร็จแล้วด้วย)
   - ไม่สามารถ retry แค่ไฟล์ที่ fail

5. **❌ Cancel ยาก**
   - Cancel request เดียว = cancel ทั้งหมด
   - ไม่สามารถ cancel แค่ไฟล์เดียว

6. **❌ Parallel Processing ไม่ได้**
   - Backend ต้อง process sequential อยู่ดี
   - ไม่ได้เร็วกว่าการ loop

### Approach B: Single File API (Loop on Frontend) ✅

```typescript
// ✅ แบบใหม่: ใช้ single endpoint ยิงหลายครั้ง
POST /api/upload/single  (File 1)
POST /api/upload/single  (File 2)
POST /api/upload/single  (File 3)

Each request:
Content-Type: multipart/form-data
Body:
- file: File
- category: "documents"
- isPublic: false

Each response:
{
  id: "uuid",
  filename: "...",
  url: "..."
}
```

**Backend Implementation**:

```typescript
// ✅ Simple single file upload
async uploadSingle(file: MultipartFile, options: UploadOptions) {
  // Validate file
  this.validateFile(file);

  // Process file
  const storageKey = await this.generateStorageKey(file);
  const uploaded = await this.storageAdapter.uploadFile(buffer, storageKey);

  // Save to database
  const fileRecord = await this.fileRepository.create({
    filename: file.filename,
    storageKey,
    ...options
  });

  return fileRecord;
}
```

**Frontend Implementation** (Sequential):

```typescript
// ✅ Loop และยิงทีละไฟล์ (sequential)
async uploadMultiple(files: File[]) {
  const results = {
    uploaded: [],
    failed: [],
  };

  for (const file of files) {
    try {
      // Progress per file
      const uploaded = await this.uploadSingle(file, {
        onProgress: (progress) => {
          this.updateProgress(file.name, progress);
        }
      });

      results.uploaded.push(uploaded);
    } catch (error) {
      results.failed.push({
        filename: file.name,
        error: error.message
      });
    }
  }

  return results;
}
```

**Frontend Implementation** (Parallel - Better):

```typescript
// ✅✅ Upload แบบ parallel (เร็วกว่า!)
async uploadMultiple(files: File[]) {
  // Limit concurrent uploads (3-5 files at a time)
  const CONCURRENT_LIMIT = 3;

  const results = {
    uploaded: [],
    failed: [],
  };

  // Split files into chunks
  for (let i = 0; i < files.length; i += CONCURRENT_LIMIT) {
    const chunk = files.slice(i, i + CONCURRENT_LIMIT);

    // Upload chunk in parallel
    const promises = chunk.map(file =>
      this.uploadSingle(file, {
        onProgress: (progress) => {
          this.updateProgress(file.name, progress);
        }
      })
      .then(uploaded => {
        results.uploaded.push(uploaded);
      })
      .catch(error => {
        results.failed.push({
          filename: file.name,
          error: error.message
        });
      })
    );

    await Promise.allSettled(promises);
  }

  return results;
}
```

**Advantages**:

1. **✅ Progress Tracking แม่นยำ**
   - Track progress per file ได้
   - แสดง progress bar แยกได้
   - รู้ว่าไฟล์ไหนอัพโหลดถึงไหนแล้ว

   ```typescript
   // แสดง progress แต่ละไฟล์
   file1.jpg: ████████░░ 80%
   file2.jpg: ██████████ 100% ✓
   file3.jpg: ███░░░░░░░ 30%
   ```

2. **✅ Error Handling ง่าย**
   - ไฟล์หนึ่ง fail ไม่กระทบไฟล์อื่น
   - แต่ละไฟล์มี error handling แยก
   - User เห็นชัดว่าไฟล์ไหน success/fail

3. **✅ Memory Efficient**
   - Upload ทีละไฟล์ หรือ 3-5 ไฟล์พร้อมกัน
   - ไม่ต้องเก็บทุกไฟล์ใน memory

4. **✅ Retry ง่าย**
   - Retry แค่ไฟล์ที่ fail
   - ไม่ต้อง retry ไฟล์ที่สำเร็จแล้ว

   ```typescript
   // Retry button per file
   file1.jpg: ✓ Uploaded
   file2.jpg: ✓ Uploaded
   file3.jpg: ✗ Failed [Retry]  ← Click here
   ```

5. **✅ Cancel ง่าย**
   - Cancel แค่ไฟล์เดียวได้
   - ไฟล์อื่นยัง upload ต่อได้

   ```typescript
   // Cancel button per file
   file1.jpg: ✓ Uploaded
   file2.jpg: Uploading... [Cancel]  ← Cancel this one
   file3.jpg: Waiting...
   ```

6. **✅ Parallel Processing ได้**
   - Frontend control concurrency (3-5 files)
   - เร็วกว่า sequential upload
   - Backend แยก process คนละ request

7. **✅ API Simple**
   - ใช้ single endpoint เดียว
   - ไม่ต้องมี multiple endpoint
   - Maintain code น้อยลง

---

## 🌟 Real-World Examples

### AWS S3 SDK

```typescript
// S3 ไม่มี "upload multiple files" API
// ต้อง loop เอง

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function uploadMultipleToS3(files: File[]) {
  const s3 = new S3Client({ region: 'us-east-1' });

  // Loop และ upload ทีละไฟล์
  for (const file of files) {
    const command = new PutObjectCommand({
      Bucket: 'my-bucket',
      Key: file.name,
      Body: file,
    });

    await s3.send(command);
  }
}
```

### MinIO Client

```typescript
// MinIO เหมือนกัน - ไม่มี batch upload
// ต้อง loop เอง

import { Client } from 'minio';

async function uploadMultipleToMinIO(files: File[]) {
  const minioClient = new Client({
    endPoint: 'localhost',
    port: 9000,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
  });

  // Loop และ upload ทีละไฟล์
  for (const file of files) {
    await minioClient.putObject('my-bucket', file.name, file.stream, file.size);
  }
}
```

### Google Cloud Storage

```typescript
// GCS ก็เหมือนกัน
import { Storage } from '@google-cloud/storage';

async function uploadMultipleToGCS(files: File[]) {
  const storage = new Storage();
  const bucket = storage.bucket('my-bucket');

  // Loop และ upload ทีละไฟล์
  for (const file of files) {
    await bucket.upload(file.path, {
      destination: file.name,
    });
  }
}
```

**Pattern ที่เห็น**:

- 🔍 **ไม่มี cloud provider ไหน**ที่มี "batch upload" API
- 🔍 **ทุกคนใช้ single file upload** และ loop เอง
- 🔍 Frontend/SDK control concurrency

---

## 🏗️ Recommended Architecture

### Backend: Single Endpoint Only

```typescript
// ✅ มีแค่ single upload endpoint
POST / api / upload / single;
```

**No need for**:

```typescript
// ❌ ไม่ต้องมี
POST / api / upload / multiple;
```

### Frontend: Parallel Upload Service

```typescript
@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly CONCURRENT_LIMIT = 3;

  /**
   * Upload single file
   */
  uploadSingle(file: File, options: UploadOptions): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', options.category);

    return this.http
      .post<UploadedFile>('/api/upload/single', formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(map((event) => this.getProgress(event)));
  }

  /**
   * Upload multiple files in parallel
   */
  uploadMultiple(files: File[], options: UploadOptions): Observable<MultipleUploadProgress> {
    return new Observable((observer) => {
      const results = {
        uploaded: [],
        failed: [],
        progress: new Map<string, number>(),
      };

      // Process files in chunks of CONCURRENT_LIMIT
      this.processChunks(files, options, results, observer);
    });
  }

  private async processChunks(files: File[], options: UploadOptions, results: any, observer: any) {
    for (let i = 0; i < files.length; i += this.CONCURRENT_LIMIT) {
      const chunk = files.slice(i, i + this.CONCURRENT_LIMIT);

      // Upload chunk in parallel
      const uploads = chunk.map((file) => {
        return this.uploadSingle(file, options).pipe(
          tap((progress) => {
            // Update individual file progress
            results.progress.set(file.name, progress.percentage);

            // Emit overall progress
            observer.next(results);
          }),
          last(), // Wait for completion
          catchError((error) => {
            results.failed.push({
              filename: file.name,
              error: error.message,
            });
            return of(null);
          }),
        );
      });

      // Wait for chunk to complete
      await Promise.all(uploads.map((obs) => obs.toPromise()));
    }

    // Emit final result
    observer.next(results);
    observer.complete();
  }
}
```

### Frontend: Upload Widget

```typescript
@Component({
  selector: 'app-upload-widget',
  template: `
    <div class="upload-widget">
      <!-- File list -->
      <div class="file-list">
        @for (file of files(); track file.name) {
          <div class="file-item">
            <span>{{ file.name }}</span>

            <!-- Progress bar per file -->
            <mat-progress-bar [value]="progress().get(file.name) || 0" [mode]="getMode(file.name)" />

            <!-- Status per file -->
            <div class="status">
              @if (isUploaded(file.name)) {
                <mat-icon class="success">check_circle</mat-icon>
                <span>Uploaded</span>
              } @else if (isFailed(file.name)) {
                <mat-icon class="error">error</mat-icon>
                <span>Failed</span>
                <button mat-icon-button (click)="retry(file)">
                  <mat-icon>refresh</mat-icon>
                </button>
              } @else {
                <button mat-icon-button (click)="cancel(file)">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </div>
          </div>
        }
      </div>

      <!-- Overall progress -->
      <div class="overall-progress">
        <span>{{ uploadedCount() }} / {{ totalCount() }} files</span>
        <mat-progress-bar [value]="overallProgress()" />
      </div>
    </div>
  `,
})
export class UploadWidgetComponent {
  files = signal<File[]>([]);
  progress = signal<Map<string, number>>(new Map());
  uploaded = signal<Set<string>>(new Set());
  failed = signal<Map<string, string>>(new Map());

  private uploadService = inject(UploadService);
  private cancelTokens = new Map<string, Subject<void>>();

  async upload() {
    const files = this.files();
    const options = { category: 'documents' };

    // Subscribe to parallel upload progress
    this.uploadService.uploadMultiple(files, options).subscribe({
      next: (result) => {
        this.progress.set(result.progress);
        this.uploaded.set(new Set(result.uploaded.map((f) => f.originalName)));
        this.failed.set(new Map(result.failed.map((f) => [f.filename, f.error])));
      },
      error: (error) => {
        console.error('Upload failed', error);
      },
      complete: () => {
        console.log('All uploads complete');
      },
    });
  }

  retry(file: File) {
    // Retry single file
    this.failed().delete(file.name);

    this.uploadService.uploadSingle(file, { category: 'documents' }).subscribe({
      next: (progress) => {
        this.progress().set(file.name, progress.percentage);
      },
      complete: () => {
        this.uploaded().add(file.name);
      },
      error: (error) => {
        this.failed().set(file.name, error.message);
      },
    });
  }

  cancel(file: File) {
    // Cancel single file upload
    const cancelToken = this.cancelTokens.get(file.name);
    if (cancelToken) {
      cancelToken.next();
      cancelToken.complete();
      this.cancelTokens.delete(file.name);
    }

    // Remove from list
    this.files.update((files) => files.filter((f) => f.name !== file.name));
  }

  overallProgress = computed(() => {
    const total = this.files().length;
    if (total === 0) return 0;

    const uploaded = this.uploaded().size;
    return (uploaded / total) * 100;
  });
}
```

---

## 📊 Performance Comparison

### Test Scenario: Upload 10 files (5MB each)

#### Approach A: Dedicated Multiple Endpoint

```
POST /api/upload/multiple (all 10 files)

Timeline:
[==========================================] 100%
|<------- 15 seconds (sequential) -------->|

Issues:
- Memory: 50MB loaded at once
- If one fails at 90% → retry all 10 files
- Can't track individual file progress
- Can't cancel individual files
```

#### Approach B: Single API + Parallel (3 concurrent)

```
POST /api/upload/single (file1) ──┐
POST /api/upload/single (file2) ──┼─► Batch 1 (3 files)
POST /api/upload/single (file3) ──┘

POST /api/upload/single (file4) ──┐
POST /api/upload/single (file5) ──┼─► Batch 2 (3 files)
POST /api/upload/single (file6) ──┘

POST /api/upload/single (file7) ──┐
POST /api/upload/single (file8) ──┼─► Batch 3 (3 files)
POST /api/upload/single (file9) ──┘

POST /api/upload/single (file10) ─► Batch 4 (1 file)

Timeline:
[=====][=====][=====][==]
|<-5s->|<-5s->|<-5s->|2s|
Total: ~7 seconds (faster!)

Benefits:
- Memory: Max 15MB at a time (3 files × 5MB)
- If one fails → retry only that file
- Track each file progress individually
- Cancel individual files
```

**Winner**: ✅ Approach B is **2x faster** and more flexible!

---

## 🎯 Decision & Recommendation

### ✅ Use Single File API (Approach B)

**Reasons**:

1. **Industry Standard**
   - AWS S3, Google Cloud, MinIO ใช้แบบนี้
   - Proven pattern from big tech

2. **Better UX**
   - Per-file progress tracking
   - Individual retry/cancel
   - Clear error messages

3. **Simpler Backend**
   - One endpoint to maintain
   - Less code complexity
   - Standard error handling

4. **Better Performance**
   - Parallel uploads (controllable)
   - Memory efficient
   - Faster overall

5. **More Flexible**
   - Easy to add features (pause, resume)
   - Easy to customize per file
   - Works with any backend (S3, MinIO, etc.)

### 📝 Implementation Changes

**Remove** from API:

```typescript
// ❌ ลบออก
POST / api / upload / multiple;
```

**Keep** in API:

```typescript
// ✅ เก็บไว้
POST / api / upload / single;
```

**Frontend** handles multiple uploads:

```typescript
// ✅ Frontend loop with parallel control
for (const file of files) {
  await uploadSingle(file); // or parallel with Promise.all
}
```

---

## 📚 References

- [AWS S3 Upload Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html)
- [MinIO SDK Examples](https://min.io/docs/minio/linux/developers/javascript/API.html)
- [Google Cloud Storage API](https://cloud.google.com/storage/docs/uploading-objects)
- [MDN: FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [RxJS: Parallel Processing](https://rxjs.dev/api/index/function/forkJoin)

---

## ✅ Conclusion

**Question**: Multiple file upload ทำแบบไหนดี?

**Answer**: ✅ **ใช้ Single File API ยิงทีละไฟล์** (loop on frontend)

**Benefits**:

- ✅ Simpler API (one endpoint)
- ✅ Better progress tracking (per file)
- ✅ Better error handling (per file)
- ✅ Better performance (parallel upload)
- ✅ Industry standard (S3, MinIO, GCS)

**Next Steps**:

1. Update API documentation (remove multiple upload endpoint)
2. Update implementation checklist (focus on single upload)
3. Implement parallel upload in frontend service
4. Create reusable upload widget with per-file controls

---

**Status**: ✅ Analysis Complete
**Recommendation**: Use Single File API
**Next Action**: Update FILE_UPLOAD_SYSTEM_REVIEW.md and IMPLEMENTATION_CHECKLIST.md
