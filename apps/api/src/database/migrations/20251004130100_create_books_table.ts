import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('books', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.uuid('author_id').notNullable();
    table.string('isbn', 20).unique().nullable();
    table.integer('pages').nullable();
    table.date('published_date').nullable();
    table.decimal('price', 10, 2).nullable();
    table.string('genre', 100).nullable();
    table.boolean('available').defaultTo(true);
    table.timestamps(true, true);

    // Foreign key constraint
    table
      .foreign('author_id')
      .references('id')
      .inTable('authors')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('books');
}
