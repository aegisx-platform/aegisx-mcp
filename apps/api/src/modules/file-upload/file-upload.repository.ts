import Knex from 'knex';
import { FastifyInstance } from 'fastify';
import { UploadedFile, FileListQuery } from './file-upload.schemas';

export interface FileUploadRepositoryDependencies {
  db: any;
  logger: FastifyInstance['log'];
}

export interface CreateFileData {
  id?: string; // Optional file ID for consistent storage paths
  originalName: string;
  filename: string;
  filepath: string;
  mimeType: string;
  fileSize: number;
  fileHash?: string;
  storageAdapter: string;
  storageBucket?: string;
  storageKey?: string;
  fileCategory: string;
  fileType: string;
  metadata?: Record<string, any>;
  uploadedBy: string;
  isPublic: boolean;
  isTemporary: boolean;
  expiresAt?: Date;
  processingStatus: string;
  variants?: Record<string, any>;
}

export interface UpdateFileData {
  originalName?: string;
  isPublic?: boolean;
  isTemporary?: boolean;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  processingStatus?: string;
  processingError?: Record<string, any>;
  variants?: Record<string, any>;
  isVirusScanned?: boolean;
  virusScanResult?: string;
  virusScannedAt?: Date;
}

export interface FileFilters {
  uploadedBy?: string;
  category?: string;
  type?: string;
  isPublic?: boolean;
  isTemporary?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Repository for file upload database operations
 */
export class FileUploadRepository {
  private readonly tableName = 'uploaded_files';
  private readonly accessLogTable = 'file_access_logs';

  constructor(private deps: FileUploadRepositoryDependencies) {}

  /**
   * Create a new file record
   */
  async createFile(data: CreateFileData): Promise<UploadedFile> {
    try {
      const insertData: any = {
        original_name: data.originalName,
        filename: data.filename,
        filepath: data.filepath,
        mime_type: data.mimeType,
        file_size: data.fileSize,
        file_hash: data.fileHash,
        storage_adapter: data.storageAdapter,
        storage_bucket: data.storageBucket,
        storage_key: data.storageKey,
        file_category: data.fileCategory,
        file_type: data.fileType,
        metadata: JSON.stringify(data.metadata || {}),
        uploaded_by: data.uploadedBy,
        is_public: data.isPublic,
        is_temporary: data.isTemporary,
        expires_at: data.expiresAt,
        processing_status: data.processingStatus,
        variants: JSON.stringify(data.variants || {}),
      };

      // Add custom ID if provided
      if (data.id) {
        insertData.id = data.id;
      }

      const [file] = await this.deps
        .db(this.tableName)
        .insert(insertData)
        .returning('*');

      this.deps.logger.info(`File record created: ${file.id}`);
      return this.mapDatabaseFileToSchema(file);
    } catch (error) {
      this.deps.logger.error(error, 'Failed to create file record');
      throw error;
    }
  }

  /**
   * Find file by ID
   */
  async findById(id: string, userId?: string): Promise<UploadedFile | null> {
    try {
      const query = this.deps
        .db(this.tableName)
        .where('id', id)
        .whereNull('deleted_at');

      // If userId is provided, check ownership or public access
      // If no userId (anonymous), only allow public files
      if (userId) {
        query.where((builder) => {
          builder.where('uploaded_by', userId).orWhere('is_public', true);
        });
      } else {
        // Anonymous access - only public files
        query.where('is_public', true);
      }

      const file = await query.first();

      if (!file) {
        return null;
      }

      return this.mapDatabaseFileToSchema(file);
    } catch (error) {
      this.deps.logger.error(error, `Failed to find file: ${id}`);
      throw error;
    }
  }

  /**
   * Find file by ID without access control (for signed URLs)
   */
  async findByIdRaw(id: string): Promise<UploadedFile | null> {
    try {
      const file = await this.deps
        .db(this.tableName)
        .where('id', id)
        .whereNull('deleted_at')
        .first();

      if (!file) {
        return null;
      }

      return this.mapDatabaseFileToSchema(file);
    } catch (error) {
      this.deps.logger.error(error, `Failed to find file: ${id}`);
      throw error;
    }
  }

  /**
   * Find files with pagination and filtering
   */
  async findFiles(
    filters: FileFilters,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<UploadedFile>> {
    try {
      const query = this.deps.db(this.tableName).whereNull('deleted_at');

      // Apply filters
      if (filters.uploadedBy) {
        query.where('uploaded_by', filters.uploadedBy);
      }

      if (filters.category) {
        query.where('file_category', filters.category);
      }

      if (filters.type) {
        query.where('file_type', filters.type);
      }

      if (filters.isPublic !== undefined) {
        query.where('is_public', filters.isPublic);
      }

      if (filters.isTemporary !== undefined) {
        query.where('is_temporary', filters.isTemporary);
      }

      if (filters.search) {
        query.where('original_name', 'ilike', `%${filters.search}%`);
      }

      // Count total records
      const countQuery = query.clone();
      const [{ count: totalCount }] = await countQuery.count('id as count');
      const total = parseInt(totalCount as string, 10);

      // Apply pagination and sorting
      const offset = (pagination.page - 1) * pagination.limit;
      const files = await query
        .orderBy(pagination.sort, pagination.order)
        .limit(pagination.limit)
        .offset(offset);

      const totalPages = Math.ceil(total / pagination.limit);
      const hasNext = pagination.page < totalPages;
      const hasPrev = pagination.page > 1;

      return {
        data: files.map((file) => this.mapDatabaseFileToSchema(file)),
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    } catch (error) {
      this.deps.logger.error(error, 'Failed to find files');
      throw error;
    }
  }

  /**
   * Update file record
   */
  async updateFile(
    id: string,
    data: UpdateFileData,
    userId?: string,
  ): Promise<UploadedFile | null> {
    try {
      const query = this.deps
        .db(this.tableName)
        .where('id', id)
        .whereNull('deleted_at');

      // If userId is provided, ensure user owns the file
      if (userId) {
        query.where('uploaded_by', userId);
      }

      const updateData: any = {
        updated_at: this.deps.db.fn.now(),
      };

      if (data.originalName !== undefined) {
        updateData.original_name = data.originalName;
      }

      if (data.isPublic !== undefined) {
        updateData.is_public = data.isPublic;
      }

      if (data.isTemporary !== undefined) {
        updateData.is_temporary = data.isTemporary;
      }

      if (data.expiresAt !== undefined) {
        updateData.expires_at = data.expiresAt;
      }

      if (data.metadata !== undefined) {
        updateData.metadata = JSON.stringify(data.metadata);
      }

      if (data.processingStatus !== undefined) {
        updateData.processing_status = data.processingStatus;
      }

      if (data.processingError !== undefined) {
        updateData.processing_error = JSON.stringify(data.processingError);
      }

      if (data.variants !== undefined) {
        updateData.variants = JSON.stringify(data.variants);
      }

      if (data.isVirusScanned !== undefined) {
        updateData.is_virus_scanned = data.isVirusScanned;
      }

      if (data.virusScanResult !== undefined) {
        updateData.virus_scan_result = data.virusScanResult;
      }

      if (data.virusScannedAt !== undefined) {
        updateData.virus_scanned_at = data.virusScannedAt;
      }

      const [updatedFile] = await query.update(updateData).returning('*');

      if (!updatedFile) {
        return null;
      }

      this.deps.logger.info(`File updated: ${id}`);
      return this.mapDatabaseFileToSchema(updatedFile);
    } catch (error) {
      this.deps.logger.error(error, `Failed to update file: ${id}`);
      throw error;
    }
  }

  /**
   * Soft delete file (mark as deleted, keep in database)
   */
  async softDeleteFile(id: string, userId?: string): Promise<boolean> {
    try {
      const query = this.deps
        .db(this.tableName)
        .where('id', id)
        .whereNull('deleted_at');

      // If userId is provided, ensure user owns the file
      if (userId) {
        query.where('uploaded_by', userId);
      }

      const result = await query.update({
        deleted_at: this.deps.db.fn.now(),
        updated_at: this.deps.db.fn.now(),
      });

      const success = result > 0;
      if (success) {
        this.deps.logger.info(`File soft deleted: ${id}`);
      }

      return success;
    } catch (error) {
      this.deps.logger.error(error, `Failed to soft delete file: ${id}`);
      throw error;
    }
  }

  /**
   * Hard delete file (permanently remove from database)
   */
  async hardDeleteFile(id: string, userId?: string): Promise<boolean> {
    try {
      const query = this.deps.db(this.tableName).where('id', id);

      // If userId is provided, ensure user owns the file
      if (userId) {
        query.where('uploaded_by', userId);
      }

      const result = await query.del();
      const success = result > 0;
      if (success) {
        this.deps.logger.info(`File hard deleted: ${id}`);
      }

      return success;
    } catch (error) {
      this.deps.logger.error(error, `Failed to hard delete file: ${id}`);
      throw error;
    }
  }

  /**
   * Legacy method - defaults to soft delete for backward compatibility
   */
  async deleteFile(id: string, userId?: string): Promise<boolean> {
    return this.softDeleteFile(id, userId);
  }

  /**
   * Find files by hash (for duplicate detection)
   */
  async findByHash(hash: string, userId: string): Promise<UploadedFile[]> {
    try {
      const files = await this.deps
        .db(this.tableName)
        .where('file_hash', hash)
        .where('uploaded_by', userId)
        .whereNull('deleted_at');

      return files.map((file) => this.mapDatabaseFileToSchema(file));
    } catch (error) {
      this.deps.logger.error(error, `Failed to find files by hash: ${hash}`);
      throw error;
    }
  }

  /**
   * Get soft-deleted files older than retention days
   */
  async getSoftDeletedFilesOlderThan(
    retentionDays: number,
  ): Promise<UploadedFile[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const files = await this.deps
        .db(this.tableName)
        .select('*')
        .whereNotNull('deleted_at')
        .where('deleted_at', '<', cutoffDate)
        .limit(100); // Process in batches

      return files.map((file) => this.mapDatabaseFileToSchema(file));
    } catch (error) {
      this.deps.logger.error(
        error,
        `Failed to find soft-deleted files older than ${retentionDays} days`,
      );
      throw error;
    }
  }

  /**
   * Find expired files for cleanup
   */
  async findExpiredFiles(limit: number = 100): Promise<UploadedFile[]> {
    try {
      const files = await this.deps
        .db(this.tableName)
        .where('is_temporary', true)
        .where('expires_at', '<', new Date())
        .whereNull('deleted_at')
        .limit(limit);

      return files.map((file) => this.mapDatabaseFileToSchema(file));
    } catch (error) {
      this.deps.logger.error(error, 'Failed to find expired files');
      throw error;
    }
  }

  /**
   * Get user file statistics
   */
  async getUserFileStats(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    publicFiles: number;
    temporaryFiles: number;
    categories: Record<string, number>;
  }> {
    try {
      const stats = await this.deps
        .db(this.tableName)
        .where('uploaded_by', userId)
        .whereNull('deleted_at')
        .select([
          this.deps.db.raw('COUNT(*) as total_files'),
          this.deps.db.raw('SUM(file_size) as total_size'),
          this.deps.db.raw(
            'COUNT(CASE WHEN is_public = true THEN 1 END) as public_files',
          ),
          this.deps.db.raw(
            'COUNT(CASE WHEN is_temporary = true THEN 1 END) as temporary_files',
          ),
        ])
        .first();

      const categories = await this.deps
        .db(this.tableName)
        .where('uploaded_by', userId)
        .whereNull('deleted_at')
        .select('file_category')
        .count('* as count')
        .groupBy('file_category');

      const categoryMap = categories.reduce(
        (acc, cat) => {
          acc[cat.file_category] = parseInt(cat.count as string, 10);
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        totalFiles: parseInt((stats as any)?.total_files || '0', 10),
        totalSize: parseInt((stats as any)?.total_size || '0', 10),
        publicFiles: parseInt((stats as any)?.public_files || '0', 10),
        temporaryFiles: parseInt((stats as any)?.temporary_files || '0', 10),
        categories: categoryMap,
      };
    } catch (error) {
      this.deps.logger.error(error, `Failed to get user file stats: ${userId}`);
      throw error;
    }
  }

  /**
   * Log file access
   */
  async logFileAccess(data: {
    fileId: string;
    accessedBy?: string;
    accessType: string;
    accessMethod: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
    sessionId?: string;
    httpStatus: number;
    bytesTransferred?: number;
    responseTimeMs?: number;
    accessGranted: boolean;
    denialReason?: string;
    authMethod?: string;
    requestHeaders?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.deps.db(this.accessLogTable).insert({
        file_id: data.fileId,
        accessed_by: data.accessedBy,
        access_type: data.accessType,
        access_method: data.accessMethod,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        referer: data.referer,
        session_id: data.sessionId,
        http_status: data.httpStatus,
        bytes_transferred: data.bytesTransferred,
        response_time_ms: data.responseTimeMs,
        access_granted: data.accessGranted,
        denial_reason: data.denialReason,
        auth_method: data.authMethod,
        request_headers: data.requestHeaders
          ? JSON.stringify(data.requestHeaders)
          : null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      });

      this.deps.logger.info(`File access logged: ${data.fileId}`);
    } catch (error) {
      this.deps.logger.error(error, 'Failed to log file access');
      // Don't throw error for access logging failures
    }
  }

  /**
   * Map database record to schema format
   */
  private mapDatabaseFileToSchema(file: any, baseUrl?: string): UploadedFile {
    // Note: downloadUrl removed - use signedUrls.download instead for authenticated access

    return {
      id: file.id,
      originalName: file.original_name,
      filename: file.filename,
      filepath: file.filepath, // Add filepath for internal use
      mimeType: file.mime_type,
      fileSize: file.file_size,
      fileCategory: file.file_category,
      fileType: file.file_type,
      isPublic: file.is_public,
      isTemporary: file.is_temporary,
      expiresAt: file.expires_at ? file.expires_at.toISOString() : null,
      metadata: file.metadata || null,
      variants: file.variants || null,
      processingStatus: file.processing_status,
      uploadedBy: file.uploaded_by,
      uploadedAt: file.created_at.toISOString(),
      updatedAt: file.updated_at.toISOString(),
      signedUrls: undefined, // Optional field, will be populated by service layer if needed
    };
  }
}
