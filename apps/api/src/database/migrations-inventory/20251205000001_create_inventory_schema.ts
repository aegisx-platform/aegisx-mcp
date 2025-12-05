import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create inventory schema if not exists
  await knex.raw(`CREATE SCHEMA IF NOT EXISTS inventory`);

  // Set search_path to include inventory schema
  await knex.raw(`SET search_path TO inventory, public`);

  // Grant privileges
  await knex.raw(`GRANT ALL ON SCHEMA inventory TO postgres`);
  await knex.raw(`GRANT USAGE ON SCHEMA inventory TO postgres`);
}

export async function down(knex: Knex): Promise<void> {
  // Note: Be careful - this will drop the entire schema and all its objects
  // Only use in development
  await knex.raw(`DROP SCHEMA IF EXISTS inventory CASCADE`);
}
