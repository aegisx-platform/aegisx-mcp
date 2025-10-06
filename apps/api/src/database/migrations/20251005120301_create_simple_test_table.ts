import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('simple_tests', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Basic Types
    table.boolean('is_active').defaultTo(true);
    table.smallint('small_number');
    table.integer('regular_number');
    table.bigInteger('big_number');
    table.decimal('decimal_field', 10, 2);
    table.float('float_field');
    table.string('name', 255);
    table.text('description');
    table.date('date_field');
    table.datetime('datetime_field');
    table.json('json_field');
    table.uuid('uuid_field');

    // Standard fields
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('simple_tests');
}
