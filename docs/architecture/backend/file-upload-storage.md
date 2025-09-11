# File Upload & Storage

## File Upload Plugin

```typescript
// apps/api/src/plugins/file-upload.plugin.ts
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import multer from 'fastify-multer';
import path from 'path';
import fs from 'fs/promises';

const fileUploadPlugin: FastifyPluginAsync = async (fastify) => {
  // Multipart support
  await fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
      files: 10,
    },
  });

  // File service
  const fileService = new FileService(fastify);
  fastify.decorate('fileService', fileService);

  // File upload routes
  fastify.route({
    method: 'POST',
    url: '/api/files/upload',
    schema: {
      description: 'Upload files',
      consumes: ['multipart/form-data'],
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const files = await request.saveRequestFiles();
      const uploadedFiles = await fileService.processUploads(files, request.user?.id);

      return reply.success(uploadedFiles, 'Files uploaded successfully');
    },
  });
};

export default fp(fileUploadPlugin, {
  name: 'file-upload-plugin',
  dependencies: ['redis-plugin', 'knex-plugin'],
});

declare module 'fastify' {
  interface FastifyInstance {
    fileService: FileService;
  }
}
```

### File Processing Service

```typescript
// apps/api/src/services/file.service.ts
export class FileService {
  constructor(private fastify: FastifyInstance) {}

  async processUploads(files: any[], userId?: string): Promise<UploadedFile[]> {
    const results: UploadedFile[] = [];

    for (const file of files) {
      try {
        // Validate file
        await this.validateFile(file);

        // Generate unique filename
        const filename = await this.generateFilename(file);

        // Save file
        const filepath = await this.saveFile(file, filename);

        // Create database record
        const fileRecord = await this.createFileRecord({
          originalName: file.filename,
          filename,
          filepath,
          mimetype: file.mimetype,
          size: file.file.bytesRead,
          userId,
        });

        results.push(fileRecord);
      } catch (error) {
        this.fastify.log.error('File upload failed:', error);
        throw error;
      }
    }

    return results;
  }

  private async validateFile(file: any): Promise<void> {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('File type not allowed');
    }

    if (file.file.bytesRead > maxSize) {
      throw new Error('File too large');
    }
  }

  private async generateFilename(file: any): Promise<string> {
    const ext = path.extname(file.filename);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);

    return `${timestamp}-${random}${ext}`;
  }

  private async saveFile(file: any, filename: string): Promise<string> {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filepath = path.join(uploadDir, filename);

    // Ensure directory exists
    await fs.mkdir(path.dirname(filepath), { recursive: true });

    // Save file
    const buffer = await file.file.toBuffer();
    await fs.writeFile(filepath, buffer);

    return filepath;
  }

  async getFileUrl(fileId: string): Promise<string | null> {
    const file = await this.fastify.knex('files').where('id', fileId).first();

    if (!file) return null;

    return `${process.env.BASE_URL}/uploads/${file.filename}`;
  }
}
```

## Cloud Storage Integration

### S3 Storage Service

```typescript
// apps/api/src/services/s3-storage.service.ts
import AWS from 'aws-sdk';

export class S3StorageService {
  private s3: AWS.S3;

  constructor(private fastify: FastifyInstance) {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async uploadFile(file: any, key: string): Promise<string> {
    const buffer = await file.file.toBuffer();

    const uploadParams = {
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const result = await this.s3.upload(uploadParams).promise();
    return result.Location;
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
      })
      .promise();
  }

  generatePresignedUrl(key: string, expiresIn: number = 3600): string {
    return this.s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Expires: expiresIn,
    });
  }
}
```

## Frontend File Upload

### Angular File Upload Component

```typescript
// libs/ui-kit/src/lib/components/file-upload/file-upload.component.ts
@Component({
  selector: 'ui-file-upload',
  standalone: true,
  template: `
    <div class="upload-zone" [class.dragover]="isDragOver()" (dragover)="onDragOver($event)" (dragleave)="onDragLeave()" (drop)="onDrop($event)" (click)="fileInput.click()">
      @if (!selectedFiles().length) {
        <div class="text-center p-8">
          <mat-icon class="text-6xl text-gray-400 mb-4">cloud_upload</mat-icon>
          <p class="text-lg mb-2">Drop files here or click to select</p>
          <p class="text-sm text-gray-500">Max file size: 10MB</p>
        </div>
      } @else {
        <div class="space-y-2">
          @for (file of selectedFiles(); track file.name) {
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span class="text-sm">{{ file.name }}</span>
              <button mat-icon-button (click)="removeFile(file)">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }
        </div>
      }

      <input #fileInput type="file" hidden [multiple]="multiple()" [accept]="accept()" (change)="onFileSelect($event)" />
    </div>

    @if (selectedFiles().length) {
      <div class="mt-4 flex justify-end gap-2">
        <button mat-button (click)="clearFiles()">Clear</button>
        <button mat-raised-button color="primary" [disabled]="uploading()" (click)="uploadFiles()">
          @if (uploading()) {
            <mat-spinner diameter="20" class="mr-2"></mat-spinner>
          }
          Upload
        </button>
      </div>
    }
  `,
})
export class FileUploadComponent {
  multiple = input(false);
  accept = input('*/*');
  maxSize = input(10 * 1024 * 1024); // 10MB

  private selectedFilesSignal = signal<File[]>([]);
  private uploadingSignal = signal(false);
  private isDragOverSignal = signal(false);

  readonly selectedFiles = this.selectedFilesSignal.asReadonly();
  readonly uploading = this.uploadingSignal.asReadonly();
  readonly isDragOver = this.isDragOverSignal.asReadonly();

  filesUploaded = output<UploadedFile[]>();

  private http = inject(HttpClient);

  onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.addFiles(files);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOverSignal.set(false);

    const files = Array.from(event.dataTransfer?.files || []) as File[];
    this.addFiles(files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOverSignal.set(true);
  }

  onDragLeave() {
    this.isDragOverSignal.set(false);
  }

  private addFiles(files: File[]) {
    const validFiles = files.filter((file) => this.validateFile(file));

    if (this.multiple()) {
      this.selectedFilesSignal.update((current) => [...current, ...validFiles]);
    } else {
      this.selectedFilesSignal.set(validFiles.slice(0, 1));
    }
  }

  private validateFile(file: File): boolean {
    if (file.size > this.maxSize()) {
      alert(`File ${file.name} is too large`);
      return false;
    }
    return true;
  }

  removeFile(file: File) {
    this.selectedFilesSignal.update((files) => files.filter((f) => f !== file));
  }

  clearFiles() {
    this.selectedFilesSignal.set([]);
  }

  async uploadFiles() {
    const files = this.selectedFiles();
    if (!files.length) return;

    this.uploadingSignal.set(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await this.http.post<any>('/api/files/upload', formData).toPromise();

      this.filesUploaded.emit(response!.data);
      this.clearFiles();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      this.uploadingSignal.set(false);
    }
  }
}
```
