import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from '../../../../core/auth';
import { ApiConfigService } from '../../../../core/http';
import {
  DeleteFileResponse,
  DownloadQuery,
  FILE_UPLOAD_LIMITS,
  FileListQuery,
  FileListResponse,
  FileStatistics,
  FileUpdateRequest,
  FileUploadOptions,
  FileUploadProgress,
  FileUploadResponse,
  FileValidationResult,
  ImageProcessingOptions,
  ImageProcessingResponse,
  MultipleFileUploadResponse,
  SignedUrlRequest,
  SignedUrlResponse,
  ThumbnailQuery,
  UploadedFile,
  ViewQuery,
} from './file-upload.types';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiConfig = inject(ApiConfigService);

  private readonly apiUrl = '/files';

  // Upload progress tracking
  private uploadProgressSubject = new BehaviorSubject<FileUploadProgress[]>([]);
  public uploadProgress$ = this.uploadProgressSubject.asObservable();

  // Signals for file statistics
  private _fileStats = signal<FileStatistics | null>(null);
  readonly fileStats = this._fileStats.asReadonly();

  constructor() {
    // Service initialization handled by dependency injection
  }

  /**
   * Validate files before upload
   */
  validateFiles(
    files: File[],
    config?: {
      maxFileSize?: number;
      allowedTypes?: string[];
      maxFiles?: number;
    },
  ): FileValidationResult[] {
    const maxFileSize = config?.maxFileSize || FILE_UPLOAD_LIMITS.MAX_FILE_SIZE;
    const allowedTypes = config?.allowedTypes || [
      ...FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES,
      ...FILE_UPLOAD_LIMITS.ALLOWED_DOCUMENT_TYPES,
    ];
    const maxFiles =
      config?.maxFiles || FILE_UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD;

    const results: FileValidationResult[] = [];

    // Check max files limit
    if (files.length > maxFiles) {
      files.forEach((file) => {
        results.push({
          valid: false,
          errors: [
            `Maximum ${maxFiles} files allowed. You selected ${files.length} files.`,
          ],
          file,
        });
      });
      return results;
    }

    files.forEach((file) => {
      const errors: string[] = [];

      // Check file size
      if (file.size > maxFileSize) {
        const sizeMB = Math.round(file.size / (1024 * 1024));
        const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
        errors.push(
          `File size ${sizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB`,
        );
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File type "${file.type}" is not allowed`);
      }

      // Check empty files
      if (file.size === 0) {
        errors.push('Empty files are not allowed');
      }

      results.push({
        valid: errors.length === 0,
        errors,
        file,
      });
    });

    return results;
  }

  /**
   * Generate file preview for images
   */
  generateFilePreview(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload single file
   */
  uploadFile(
    file: File,
    options: FileUploadOptions = {},
  ): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (options.category) formData.append('category', options.category);
    if (options.isPublic !== undefined)
      formData.append('isPublic', options.isPublic.toString());
    if (options.isTemporary !== undefined)
      formData.append('isTemporary', options.isTemporary.toString());
    if (options.expiresIn)
      formData.append('expiresIn', options.expiresIn.toString());
    // Always send allowDuplicates - default to true if not specified
    const allowDuplicates =
      options.allowDuplicates !== undefined ? options.allowDuplicates : true;
    formData.append('allowDuplicates', allowDuplicates.toString());
    console.log('Sending allowDuplicates:', allowDuplicates);
    if (options.metadata)
      formData.append('metadata', JSON.stringify(options.metadata));

    return this.http
      .post<FileUploadResponse>(`${this.apiUrl}/upload`, formData, {
        headers: this.getAuthHeaders(),
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            // Update progress tracking
            this.updateFileProgress(
              file,
              Math.round((100 * event.loaded) / event.total),
              'uploading',
            );
          } else if (event.type === HttpEventType.Response) {
            // Upload completed
            this.updateFileProgress(file, 100, 'completed', event.body?.data);
            return event.body as FileUploadResponse;
          }
          return {} as FileUploadResponse;
        }),
        catchError((error) => {
          this.updateFileProgress(file, 0, 'error', undefined, error.message);
          return this.handleError(error);
        }),
      );
  }

  /**
   * Upload multiple files
   */
  uploadMultipleFiles(
    files: File[],
    options: FileUploadOptions = {},
  ): Observable<MultipleFileUploadResponse> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('file', file);
    });

    if (options.category) formData.append('category', options.category);
    if (options.isPublic !== undefined)
      formData.append('isPublic', options.isPublic.toString());
    if (options.isTemporary !== undefined)
      formData.append('isTemporary', options.isTemporary.toString());
    if (options.expiresIn)
      formData.append('expiresIn', options.expiresIn.toString());
    // Always send allowDuplicates - default to true if not specified
    const allowDuplicates =
      options.allowDuplicates !== undefined ? options.allowDuplicates : true;
    formData.append('allowDuplicates', allowDuplicates.toString());
    console.log('Sending allowDuplicates:', allowDuplicates);
    if (options.metadata)
      formData.append('metadata', JSON.stringify(options.metadata));

    // Initialize progress for all files
    files.forEach((file) => {
      this.updateFileProgress(file, 0, 'uploading');
    });

    return this.http
      .post<MultipleFileUploadResponse>(
        `${this.apiUrl}/upload/multiple`,
        formData,
        {
          headers: this.getAuthHeaders(),
          reportProgress: true,
          observe: 'events',
        },
      )
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            // Update progress for all files
            files.forEach((file) => {
              this.updateFileProgress(file, progress, 'uploading');
            });
          } else if (event.type === HttpEventType.Response) {
            // Upload completed - update individual file statuses
            const response = event.body as MultipleFileUploadResponse;
            if (response?.data && response.data.uploaded) {
              // Mark successful uploads
              response.data.uploaded.forEach((uploadedFile) => {
                const file = files.find(
                  (f) => f.name === uploadedFile.originalName,
                );
                if (file) {
                  this.updateFileProgress(file, 100, 'completed', uploadedFile);
                }
              });

              // Mark failed uploads
              if (response.data.failed) {
                response.data.failed.forEach((failedFile) => {
                  const file = files.find(
                    (f) => f.name === failedFile.filename,
                  );
                  if (file) {
                    this.updateFileProgress(
                      file,
                      0,
                      'error',
                      undefined,
                      failedFile.error,
                    );
                  }
                });
              }
            }
            return response;
          }
          return {} as MultipleFileUploadResponse;
        }),
        catchError((error) => {
          // Mark all files as failed
          files.forEach((file) => {
            this.updateFileProgress(file, 0, 'error', undefined, error.message);
          });
          return this.handleError(error);
        }),
      );
  }

  /**
   * Get file list with filtering and pagination
   */
  getFiles(query: FileListQuery = {}): Observable<FileListResponse> {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http
      .get<FileListResponse>(this.apiUrl, {
        headers: this.getAuthHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get file metadata by ID
   */
  getFile(id: string): Observable<FileUploadResponse> {
    return this.http
      .get<FileUploadResponse>(`${this.apiUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Update file metadata
   */
  updateFile(
    id: string,
    updates: FileUpdateRequest,
  ): Observable<FileUploadResponse> {
    return this.http
      .patch<FileUploadResponse>(`${this.apiUrl}/${id}`, updates, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete file
   */
  deleteFile(id: string): Observable<DeleteFileResponse> {
    return this.http
      .delete<DeleteFileResponse>(`${this.apiUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Process image (resize, format conversion, etc.)
   */
  processImage(
    id: string,
    options: ImageProcessingOptions,
  ): Observable<ImageProcessingResponse> {
    return this.http
      .post<ImageProcessingResponse>(`${this.apiUrl}/${id}/process`, options, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Generate signed URLs for secure access
   */
  generateSignedUrl(
    id: string,
    request: SignedUrlRequest,
  ): Observable<SignedUrlResponse> {
    return this.http
      .post<SignedUrlResponse>(`${this.apiUrl}/${id}/signed-urls`, request, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get file download URL
   * Returns relative URL for HttpClient requests (handled by BaseUrlInterceptor)
   * Note: For direct browser access, use file.signedUrls.download from API response instead
   */
  getDownloadUrl(id: string, query: DownloadQuery = {}): string {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    const queryString = params.toString();
    return `${this.apiUrl}/${id}/download${queryString ? '?' + queryString : ''}`;
  }

  /**
   * Get user file statistics
   */
  getFileStats(): Observable<void> {
    return this.http
      .get<{ data: FileStatistics }>(`${this.apiUrl}/stats`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => {
          this._fileStats.set(response.data);
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Clear upload progress tracking
   */
  clearUploadProgress(): void {
    this.uploadProgressSubject.next([]);
  }

  /**
   * Get current upload progress
   */
  getCurrentProgress(): FileUploadProgress[] {
    return this.uploadProgressSubject.value;
  }

  /**
   * Get file view URL for inline display
   */
  getViewUrl(fileId: string, options?: ViewQuery): string {
    // Use relative URL to go through Angular proxy
    const url = `${this.apiUrl}/${fileId}/view`;

    // Add query parameters if provided
    const params = new URLSearchParams();
    if (options?.variant) {
      params.set('variant', options.variant);
    }
    if (options?.cache !== undefined) {
      params.set('cache', options.cache.toString());
    }

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Get thumbnail URL with custom sizing
   */
  getThumbnailUrl(fileId: string, options?: ThumbnailQuery): string {
    // Build the full URL using current location
    const baseUrl = this.apiConfig.getApiBaseUrl() || '/api';
    let fullUrl: string;

    if (baseUrl && baseUrl.startsWith('http')) {
      // Absolute URL
      fullUrl = `${baseUrl}${this.apiUrl}/${fileId}/thumbnail`;
    } else {
      // Relative URL - build from current location
      const protocol = window.location.protocol;
      const host = window.location.host;
      fullUrl = `${protocol}//${host}${baseUrl}${this.apiUrl}/${fileId}/thumbnail`;
    }

    const url = new URL(fullUrl);

    if (options?.size) {
      url.searchParams.set('size', options.size);
    }
    if (options?.quality !== undefined) {
      url.searchParams.set('quality', options.quality.toString());
    }
    if (options?.format) {
      url.searchParams.set('format', options.format);
    }

    return url.toString();
  }

  /**
   * View file inline (returns blob for programmatic use)
   */
  viewFile(fileId: string, options?: ViewQuery): Observable<Blob> {
    let params = new HttpParams();

    if (options?.variant) {
      params = params.set('variant', options.variant);
    }
    if (options?.cache !== undefined) {
      params = params.set('cache', options.cache.toString());
    }

    return this.http
      .get(`${this.apiUrl}/${fileId}/view`, {
        params,
        responseType: 'blob',
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get thumbnail blob for programmatic use
   */
  getThumbnail(fileId: string, options?: ThumbnailQuery): Observable<Blob> {
    let params = new HttpParams();

    if (options?.size) {
      params = params.set('size', options.size);
    }
    if (options?.quality !== undefined) {
      params = params.set('quality', options.quality.toString());
    }
    if (options?.format) {
      params = params.set('format', options.format);
    }

    return this.http
      .get(`${this.apiUrl}/${fileId}/thumbnail`, {
        params,
        responseType: 'blob',
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file type category
   */
  getFileTypeCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document'))
      return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
      return 'spreadsheet';
    if (mimeType.includes('zip') || mimeType.includes('compressed'))
      return 'archive';
    return 'file';
  }

  private updateFileProgress(
    file: File,
    progress: number,
    status: FileUploadProgress['status'],
    uploadedFile?: UploadedFile,
    error?: string,
  ): void {
    const currentProgress = this.uploadProgressSubject.value;
    const existingIndex = currentProgress.findIndex(
      (p) => p.file.name === file.name && p.file.size === file.size,
    );

    const progressItem: FileUploadProgress = {
      file,
      progress,
      status,
      uploadedFile,
      error,
    };

    if (existingIndex >= 0) {
      currentProgress[existingIndex] = progressItem;
    } else {
      currentProgress.push(progressItem);
    }

    this.uploadProgressSubject.next([...currentProgress]);
  }

  private getAuthHeaders(): { [key: string]: string } {
    return this.authService.getAuthHeaders();
  }

  private handleError(error: {
    error?: { error?: { message?: string } };
    status?: number;
    message?: string;
  }): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error?.error?.message) {
      errorMessage = error.error.error.message;
    } else if (error.status === 413) {
      errorMessage = 'File too large';
    } else if (error.status === 415) {
      errorMessage = 'File type not supported';
    } else if (error.status === 507) {
      errorMessage = 'Not enough storage space';
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('File upload error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
