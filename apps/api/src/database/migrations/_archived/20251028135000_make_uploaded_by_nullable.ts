import type { Knex } from 'knex';

/**
 * Migration: Make uploaded_by field nullable to support anonymous uploads
 *
 * Purpose: Allow file uploads without authentication (system-wide files)
 * - uploaded_by = NULL: Anonymous upload (system file)
 * - uploaded_by = UUID: User-bound file
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('uploaded_files', (table: any) => {
    table.uuid('uploaded_by').nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  // Note: Cannot revert to NOT NULL if there are NULL values
  // This migration is one-way only
  await knex.schema.alterTable('uploaded_files', (table: any) => {
    table.uuid('uploaded_by').notNullable().alter();
  });
}
