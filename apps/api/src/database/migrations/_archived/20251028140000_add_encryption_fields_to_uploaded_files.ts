import type { Knex } from 'knex';

/**
 * Add encryption support fields to uploaded_files table
 *
 * Adds columns for AES-256-GCM encryption:
 * - encrypted: Boolean flag indicating if file is encrypted
 * - encryption_iv: Initialization vector (12 bytes for GCM)
 * - encryption_auth_tag: Authentication tag (16 bytes for GCM)
 * - encryption_metadata: Encrypted metadata fields
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('uploaded_files', (table) => {
    // Encryption fields
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

    // Index for querying encrypted files
    table.index(['encrypted'], 'idx_uploaded_files_encrypted');
  });

  // Add column comments
  await knex.raw(`
    COMMENT ON COLUMN uploaded_files.encrypted IS 'Whether file content is encrypted using AES-256-GCM';
    COMMENT ON COLUMN uploaded_files.encryption_iv IS 'Initialization vector (IV) used for encryption - unique per file';
    COMMENT ON COLUMN uploaded_files.encryption_auth_tag IS 'Authentication tag for verifying data integrity';
    COMMENT ON COLUMN uploaded_files.encryption_metadata IS 'Encrypted sensitive metadata fields';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('uploaded_files', (table) => {
    table.dropIndex(['encrypted'], 'idx_uploaded_files_encrypted');
    table.dropColumn('encrypted');
    table.dropColumn('encryption_iv');
    table.dropColumn('encryption_auth_tag');
    table.dropColumn('encryption_metadata');
  });
}
