import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable uuid extension if not exists
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema.createTable('attachments', (table: any) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Polymorphic relationship (entity_type + entity_id)
    table
      .string('entity_type', 50)
      .notNullable()
      .comment('Type of entity (receiving, patient, document, etc.)');
    table.uuid('entity_id').notNullable().comment('ID of the entity');

    // File reference
    table
      .uuid('file_id')
      .notNullable()
      .references('id')
      .inTable('uploaded_files')
      .onDelete('CASCADE')
      .comment('Reference to uploaded_files table');

    // Attachment metadata
    table
      .string('attachment_type', 50)
      .comment('Type of attachment (photo, delivery-note, etc.)');
    table
      .integer('display_order')
      .defaultTo(0)
      .comment('Order for display/sorting');

    // Additional flexible metadata (JSONB)
    table
      .jsonb('metadata')
      .defaultTo('{}')
      .comment('Additional metadata for the attachment');

    // Audit fields
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table
      .uuid('created_by')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.timestamp('updated_at').nullable();

    // Indexes
    table.index(['entity_type', 'entity_id'], 'idx_attachments_entity');
    table.index('file_id', 'idx_attachments_file');
    table.index(['entity_type', 'attachment_type'], 'idx_attachments_type');

    // Unique constraint: Same file can't be attached twice to same entity
    table.unique(['entity_type', 'entity_id', 'file_id'], {
      indexName: 'unique_entity_file',
    });
  });

  // Add comment to table
  await knex.raw(`
    COMMENT ON TABLE attachments IS 'Polymorphic file attachment system - links files to any entity type'
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('attachments');
}
