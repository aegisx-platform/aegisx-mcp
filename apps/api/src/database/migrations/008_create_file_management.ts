import type { Knex } from 'knex';

/**
 * Consolidated Migration: File Management System
 *
 * Creates comprehensive file management infrastructure with:
 * - Multi-storage adapter support (local, MinIO, S3)
 * - Processing status tracking and virus scanning
 * - Encryption support (AES-256-GCM)
 * - HIS compliance fields for healthcare applications
 * - Anonymous upload support
 * - Public/private access control
 * - Temporary file management with expiration
 *
 * This consolidates migrations:
 * - 018_create_uploaded_files_table.ts
 * - 20251028135000_make_uploaded_by_nullable.ts
 * - 20251028140000_add_encryption_fields.ts
 * - 20251028140100_add_his_fields.ts
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('uploaded_files', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // File metadata
    table
      .string('original_name', 500)
      .notNullable()
      .comment('Original filename as uploaded');
    table
      .string('filename', 255)
      .notNullable()
      .unique()
      .comment('Stored filename (sanitized)');
    table
      .string('filepath', 1000)
      .notNullable()
      .comment('Full path to stored file');
    table
      .string('mime_type', 100)
      .notNullable()
      .comment('MIME type of the file');
    table.bigInteger('file_size').notNullable().comment('File size in bytes');
    table
      .string('file_hash', 64)
      .nullable()
      .comment('SHA-256 hash for duplicate detection');

    // Storage information
    table
      .string('storage_adapter', 50)
      .notNullable()
      .defaultTo('local')
      .comment('Storage adapter used (local, minio, s3)');
    table
      .string('storage_bucket', 100)
      .nullable()
      .comment('Bucket/container name for cloud storage');
    table
      .string('storage_key', 500)
      .nullable()
      .comment('Storage key/path for cloud storage');

    // File categorization
    table
      .string('file_category', 50)
      .notNullable()
      .defaultTo('general')
      .comment('Category: image, document, avatar, etc');
    table
      .string('file_type', 50)
      .notNullable()
      .comment('Type classification: image, pdf, video, etc');
    table
      .jsonb('metadata')
      .nullable()
      .comment('Additional metadata (dimensions, duration, etc)');

    // Ownership and access (nullable to support anonymous uploads)
    table
      .uuid('uploaded_by')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .comment('User who uploaded (NULL for anonymous/system files)');
    table
      .boolean('is_public')
      .notNullable()
      .defaultTo(false)
      .comment('Public access without auth');
    table
      .boolean('is_temporary')
      .notNullable()
      .defaultTo(false)
      .comment('Temporary file to be cleaned up');
    table
      .timestamp('expires_at')
      .nullable()
      .comment('Expiration time for temporary files');

    // Processing status
    table
      .string('processing_status', 20)
      .notNullable()
      .defaultTo('completed')
      .comment('uploaded, processing, completed, failed');
    table
      .jsonb('processing_error')
      .nullable()
      .comment('Error details if processing failed');
    table
      .jsonb('variants')
      .nullable()
      .comment('Generated variants (thumbnails, resized images, etc)');

    // Security - Virus scanning
    table
      .boolean('is_virus_scanned')
      .notNullable()
      .defaultTo(false)
      .comment('Virus scan status');
    table
      .string('virus_scan_result', 20)
      .nullable()
      .comment('clean, infected, error');
    table
      .timestamp('virus_scanned_at')
      .nullable()
      .comment('When virus scan was performed');

    // Security - Encryption (AES-256-GCM)
    table
      .boolean('encrypted')
      .notNullable()
      .defaultTo(false)
      .comment('Whether file content is encrypted (AES-256-GCM)');
    table
      .binary('encryption_iv')
      .nullable()
      .comment('Initialization vector for encryption (12 bytes for GCM mode)');
    table
      .binary('encryption_auth_tag')
      .nullable()
      .comment('Authentication tag for encryption verification (16 bytes)');
    table
      .text('encryption_metadata')
      .nullable()
      .comment('Encrypted metadata fields (base64-encoded)');

    // HIS (Hospital Information System) fields
    table
      .uuid('patient_id')
      .nullable()
      .comment('Patient ID for medical files (HIS use case)');
    table
      .uuid('department_id')
      .nullable()
      .comment('Department ID for department-level access control');
    table
      .boolean('is_phi')
      .notNullable()
      .defaultTo(false)
      .comment('Protected Health Information - requires extra security');

    // Audit fields
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable().comment('Soft delete timestamp');

    // ========================================================================
    // INDEXES
    // ========================================================================

    // Basic indexes
    table.index(['uploaded_by'], 'idx_uploaded_files_user');
    table.index(['file_category'], 'idx_uploaded_files_category');
    table.index(['file_type'], 'idx_uploaded_files_type');
    table.index(['mime_type'], 'idx_uploaded_files_mime');
    table.index(['is_public'], 'idx_uploaded_files_public');
    table.index(['processing_status'], 'idx_uploaded_files_processing');
    table.index(['file_hash'], 'idx_uploaded_files_hash');
    table.index(['storage_adapter'], 'idx_uploaded_files_adapter');
    table.index(['created_at'], 'idx_uploaded_files_created');
    table.index(['deleted_at'], 'idx_uploaded_files_deleted');

    // Encryption and security indexes
    table.index(['encrypted'], 'idx_uploaded_files_encrypted');

    // HIS indexes
    table.index(['patient_id'], 'idx_uploaded_files_patient');
    table.index(['department_id'], 'idx_uploaded_files_department');
    table.index(['is_phi'], 'idx_uploaded_files_phi');

    // Composite indexes for common queries
    table.index(
      ['uploaded_by', 'file_category', 'deleted_at'],
      'idx_uploaded_files_user_category',
    );
    table.index(
      ['is_temporary', 'expires_at', 'deleted_at'],
      'idx_uploaded_files_cleanup',
    );
    table.index(
      ['patient_id', 'file_category', 'deleted_at'],
      'idx_uploaded_files_patient_category',
    );
  });

  // Add table and column comments
  await knex.raw(`
    COMMENT ON TABLE uploaded_files IS 'Stores metadata and tracking information for all uploaded files with encryption, virus scanning, and HIS compliance';
  `);

  await knex.raw(`
    COMMENT ON COLUMN uploaded_files.encrypted IS 'Whether file content is encrypted using AES-256-GCM';
    COMMENT ON COLUMN uploaded_files.encryption_iv IS 'Initialization vector (IV) used for encryption - unique per file';
    COMMENT ON COLUMN uploaded_files.encryption_auth_tag IS 'Authentication tag for verifying data integrity';
    COMMENT ON COLUMN uploaded_files.encryption_metadata IS 'Encrypted sensitive metadata fields';
    COMMENT ON COLUMN uploaded_files.patient_id IS 'Patient identifier for medical files - enables patient-specific file access';
    COMMENT ON COLUMN uploaded_files.department_id IS 'Department identifier for department-level access control';
    COMMENT ON COLUMN uploaded_files.is_phi IS 'Protected Health Information flag - triggers additional security measures';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('uploaded_files');
}
