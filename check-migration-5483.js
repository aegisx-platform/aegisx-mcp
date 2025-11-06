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
    const result = await client.query(
      'SELECT batch, name FROM knex_migrations WHERE name LIKE $1 ORDER BY id DESC',
      ['%testProducts%'],
    );

    console.log('TestProducts migrations in database:');
    if (result.rows.length > 0) {
      result.rows.forEach((row) => {
        console.log(`  Batch ${row.batch}: ${row.name}`);
      });
    } else {
      console.log('  (None found)');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.end();
  }
});
