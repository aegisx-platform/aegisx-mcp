import type { Knex } from 'knex';

/**
 * Add HIS (Hospital Information System) fields to uploaded_files table
 *
 * Adds columns for healthcare-specific features:
 * - patient_id: Link files to specific patients
 * - department_id: Link files to departments
 * - is_phi: Flag for Protected Health Information
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('uploaded_files', (table) => {
    // HIS-specific fields
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

    // Indexes for HIS queries
    table.index(['patient_id'], 'idx_uploaded_files_patient');
    table.index(['department_id'], 'idx_uploaded_files_department');
    table.index(['is_phi'], 'idx_uploaded_files_phi');

    // Composite index for patient files
    table.index(
      ['patient_id', 'file_category', 'deleted_at'],
      'idx_uploaded_files_patient_category',
    );
  });

  // Add column comments
  await knex.raw(`
    COMMENT ON COLUMN uploaded_files.patient_id IS 'Patient identifier for medical files - enables patient-specific file access';
    COMMENT ON COLUMN uploaded_files.department_id IS 'Department identifier for department-level access control';
    COMMENT ON COLUMN uploaded_files.is_phi IS 'Protected Health Information flag - triggers additional security measures';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('uploaded_files', (table) => {
    table.dropIndex(
      ['patient_id', 'file_category', 'deleted_at'],
      'idx_uploaded_files_patient_category',
    );
    table.dropIndex(['is_phi'], 'idx_uploaded_files_phi');
    table.dropIndex(['department_id'], 'idx_uploaded_files_department');
    table.dropIndex(['patient_id'], 'idx_uploaded_files_patient');

    table.dropColumn('patient_id');
    table.dropColumn('department_id');
    table.dropColumn('is_phi');
  });
}
