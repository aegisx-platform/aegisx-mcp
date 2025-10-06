import type { Knex } from 'knex';

/**
 * Migration: Recreate articles table with proper FK
 * Purpose: Drop and recreate articles table with FK constraint
 */

export async function up(knex: Knex): Promise<void> {
  console.log('🔄 Recreating articles table with FK...');

  // Drop articles table if exists
  await knex.schema.dropTableIfExists('articles');
  console.log('✅ Dropped existing articles table');

  // Create articles table with FK
  await knex.schema.createTable('articles', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Basic article fields
    table.string('title', 255).notNullable().comment('Article title');
    table.text('content').nullable().comment('Article content');

    // Foreign key to users table (for testing FK dropdown)
    table.uuid('author_id').notNullable().comment('Article author');
    table
      .foreign('author_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Publishing fields
    table.boolean('published').defaultTo(false).comment('Is article published');
    table
      .timestamp('published_at')
      .nullable()
      .comment('When article was published');

    // Metrics
    table.integer('view_count').defaultTo(0).comment('Number of views');

    // Audit fields
    table.timestamps(true, true);

    // Indexes for performance
    table.index('author_id');
    table.index('published');
    table.index('created_at');
    table.index(['published', 'created_at']); // For published articles listing
  });

  console.log('✅ Articles table created with FK constraint');

  // Insert sample data
  const validUser = await knex('users').first('id');
  if (validUser) {
    await knex('articles').insert([
      {
        title: 'Sample Article 1',
        content: 'This is a sample article for testing FK dropdown.',
        author_id: validUser.id,
        published: true,
        published_at: new Date(),
        view_count: 10,
      },
      {
        title: 'Draft Article',
        content: 'This is a draft article.',
        author_id: validUser.id,
        published: false,
        view_count: 0,
      },
    ]);
    console.log('✅ Sample articles inserted');
  }

  console.log('✅ Articles table setup complete with FK to users');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🗑️ Dropping articles table...');

  await knex.schema.dropTableIfExists('articles');

  console.log('✅ Articles table dropped successfully');
}
