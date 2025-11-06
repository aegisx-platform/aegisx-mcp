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
    // Delete migration record
    await client.query('DELETE FROM knex_migrations WHERE name LIKE $1', [
      '%testProducts%',
    ]);
    console.log('✅ Deleted migration record');

    // Delete role
    await client.query('DELETE FROM roles WHERE name = $1', ['testProducts']);
    console.log('✅ Deleted testProducts role');

    // Delete permissions
    await client.query('DELETE FROM permissions WHERE resource = $1', [
      'testProducts',
    ]);
    console.log('✅ Deleted testProducts permissions');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.end();
  }
});
