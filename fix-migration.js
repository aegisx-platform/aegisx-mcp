const pg = require('pg');
const client = new pg.Client({
  host: 'localhost',
  port: 5483,
  database: 'aegisx_db',
  user: 'postgres',
  password: 'postgres',
});

client.connect(async (err) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }

  try {
    // Delete old testProducts migration record
    const result = await client.query(
      'DELETE FROM knex_migrations WHERE name = $1',
      ['20251105065916_add_testProducts_permissions.ts'],
    );
    console.log('✅ Deleted old migration record:', result.rowCount);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.end();
  }
});
