import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add missing columns to user_roles table if they don't exist
  const hasIdColumn = await knex.schema.hasColumn('user_roles', 'id');
  const hasIsActiveColumn = await knex.schema.hasColumn(
    'user_roles',
    'is_active',
  );
  const hasAssignedAtColumn = await knex.schema.hasColumn(
    'user_roles',
    'assigned_at',
  );
  const hasAssignedByColumn = await knex.schema.hasColumn(
    'user_roles',
    'assigned_by',
  );
  const hasExpiresAtColumn = await knex.schema.hasColumn(
    'user_roles',
    'expires_at',
  );

  if (
    !hasIdColumn ||
    !hasIsActiveColumn ||
    !hasAssignedAtColumn ||
    !hasAssignedByColumn ||
    !hasExpiresAtColumn
  ) {
    // First, drop the existing primary key constraint if it exists
    try {
      await knex.schema.alterTable('user_roles', (table) => {
        table.dropPrimary();
      });
    } catch (error) {
      // Constraint might not exist, continue
    }

    // Add missing columns
    await knex.schema.alterTable('user_roles', (table) => {
      if (!hasIdColumn) {
        table.uuid('id').defaultTo(knex.raw('gen_random_uuid()'));
      }
      if (!hasIsActiveColumn) {
        table.boolean('is_active').defaultTo(true);
      }
      if (!hasAssignedAtColumn) {
        table.timestamp('assigned_at').defaultTo(knex.fn.now());
      }
      if (!hasAssignedByColumn) {
        table.uuid('assigned_by').nullable();
      }
      if (!hasExpiresAtColumn) {
        table.timestamp('expires_at').nullable();
      }
    });

    // Add new primary key on id column
    if (!hasIdColumn) {
      await knex.schema.alterTable('user_roles', (table) => {
        table.primary(['id']);
      });
    }

    // Add unique constraint on user_id, role_id combination if it doesn't exist
    try {
      await knex.schema.alterTable('user_roles', (table) => {
        table.unique(['user_id', 'role_id'], 'unique_active_user_role');
      });
    } catch (error) {
      // Constraint might already exist, continue
    }

    // Add foreign key for assigned_by if column was added
    if (!hasAssignedByColumn) {
      try {
        await knex.schema.alterTable('user_roles', (table) => {
          table
            .foreign('assigned_by')
            .references('id')
            .inTable('users')
            .onDelete('SET NULL');
        });
      } catch (error) {
        // Foreign key might already exist or users table might not exist yet
        console.warn(
          'Could not add assigned_by foreign key:',
          (error as Error).message,
        );
      }
    }

    // Add indexes for better performance
    try {
      await knex.schema.alterTable('user_roles', (table) => {
        if (!hasIsActiveColumn) table.index('is_active');
        if (!hasAssignedAtColumn) table.index('assigned_at');
        if (!hasExpiresAtColumn) table.index('expires_at');
        table.index(['user_id', 'is_active'], 'idx_user_roles_user_active');
      });
    } catch (error) {
      // Indexes might already exist
      console.warn('Could not add some indexes:', (error as Error).message);
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remove the columns we added (be careful with this in production)
  await knex.schema.alterTable('user_roles', (table) => {
    table.dropColumn('expires_at');
    table.dropColumn('assigned_by');
    table.dropColumn('assigned_at');
    table.dropColumn('is_active');
    // Note: We don't drop the id column as it would require recreating the table
    // and potentially losing data
  });
}
