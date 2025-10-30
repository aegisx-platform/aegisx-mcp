import type { Knex } from 'knex';

export async function up(knex: any): Promise<void> {
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

    // Ownership and access
    table
      .uuid('uploaded_by')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
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

    // Security
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

    // Audit fields
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable().comment('Soft delete timestamp');

    // Indexes for performance
    table.index(['uploaded_by'], 'idx_uploaded_files_user');
    table.index(['file_category'], 'idx_uploaded_files_category');
    table.index(['file_type'], 'idx_uploaded_files_type');
    table.index(['mime_type'], 'idx_uploaded_files_mime');
    table.index(['is_public'], 'idx_uploaded_files_public');
    table.index(
      ['is_temporary', 'expires_at'],
      'idx_uploaded_files_temp_cleanup',
    );
    table.index(['processing_status'], 'idx_uploaded_files_processing');
    table.index(['file_hash'], 'idx_uploaded_files_hash');
    table.index(['storage_adapter'], 'idx_uploaded_files_adapter');
    table.index(['created_at'], 'idx_uploaded_files_created');
    table.index(['deleted_at'], 'idx_uploaded_files_deleted');

    // Composite indexes
    table.index(
      ['uploaded_by', 'file_category', 'deleted_at'],
      'idx_uploaded_files_user_category',
    );
    table.index(
      ['is_temporary', 'expires_at', 'deleted_at'],
      'idx_uploaded_files_cleanup',
    );
  });

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE uploaded_files IS 'Stores metadata and tracking information for all uploaded files'
  `);
}

export async function down(knex: any): Promise<void> {
  await knex.schema.dropTableIfExists('uploaded_files');
}
