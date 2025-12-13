import { Knex } from 'knex';

/**
 * Migration: Add hospital_id to departments table
 *
 * Supports multi-hospital architecture where each hospital has its own
 * departments isolated by hospital_id.
 *
 * Part of: Department Management System (Week 1: Database Layer)
 *
 * Purpose:
 * - Enable department filtering by hospital
 * - Support SaaS model with multiple hospital instances
 * - Link user-department assignments to specific hospitals
 * - Enforce data isolation at department level
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Add hospital_id column to departments table
  await knex.raw(`
    ALTER TABLE inventory.departments
    ADD COLUMN IF NOT EXISTS hospital_id INTEGER
      REFERENCES inventory.hospitals(id) ON DELETE CASCADE
  `);

  // Add comment explaining the purpose
  await knex.raw(`
    COMMENT ON COLUMN inventory.departments.hospital_id IS
    'Reference to hospital - enables multi-hospital SaaS architecture and data isolation'
  `);

  // Create index for hospital queries
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_departments_hospital
    ON inventory.departments(hospital_id)
  `);

  // Create composite index for common queries
  // (find departments in specific hospital, filter by active status)
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_departments_hospital_active
    ON inventory.departments(hospital_id, is_active)
    WHERE is_active = true
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Drop indexes
  await knex.raw(
    `DROP INDEX IF EXISTS inventory.idx_departments_hospital CASCADE`,
  );
  await knex.raw(
    `DROP INDEX IF EXISTS inventory.idx_departments_hospital_active CASCADE`,
  );

  // Remove column
  await knex.raw(`
    ALTER TABLE inventory.departments
    DROP COLUMN IF EXISTS hospital_id
  `);
}
