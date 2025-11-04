import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('test_products');
  if (!tableExists) {
    await knex.schema.createTable('test_products', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('code').notNullable().unique();
      table.string('name').notNullable().unique();
      table.string('slug').notNullable();
      table.text('description').nullable();
      table.boolean('is_active').nullable().defaultTo(true);
      table.boolean('is_featured').nullable().defaultTo(false);
      table.integer('display_order').nullable();
      table.integer('item_count').nullable();
      table.decimal('discount_rate', 5, 2).nullable();
      table.jsonb('metadata').nullable();
      table.jsonb('settings').nullable();
      table.string('status').nullable();
      table.uuid('created_by').nullable();
      table.uuid('updated_by').nullable();
      table.timestamp('deleted_at').nullable();
      table.timestamps(true, true);
    });

    console.log('✅ [DEV] Created test_products table');
  }
}

export async function down(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('test_products');
  if (tableExists) {
    await knex.schema.dropTable('test_products');
    console.log('✅ [DEV] Dropped test_products table');
  }
}
