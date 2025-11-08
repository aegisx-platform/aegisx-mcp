import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Check if 'id' column already exists
  const hasIdColumn = await knex.schema.hasColumn('user_roles', 'id');

  if (!hasIdColumn) {
    await knex.schema.alterTable('user_roles', (table) => {
      // Drop the old composite primary key
      table.dropPrimary();

      // Add new id column as primary key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      // Re-add unique constraint on (user_id, role_id)
      table.unique(['user_id', 'role_id']);
    });

    console.log('✅ Added id column to user_roles table');
  } else {
    console.log('⏭️  id column already exists in user_roles table');
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasIdColumn = await knex.schema.hasColumn('user_roles', 'id');

  if (hasIdColumn) {
    await knex.schema.alterTable('user_roles', (table) => {
      // Drop the unique constraint
      table.dropUnique(['user_id', 'role_id']);

      // Drop the id column
      table.dropColumn('id');

      // Restore composite primary key
      table.primary(['user_id', 'role_id']);
    });

    console.log('✅ Removed id column from user_roles table');
  }
}
