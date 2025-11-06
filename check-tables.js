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
    console.error('Error:', err.message);
    process.exit(1);
  }

  try {
    const result = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE '%test%' ORDER BY tablename",
    );

    console.log('Test tables in database:');
    if (result.rows.length === 0) {
      console.log('  ❌ NONE FOUND!');
    } else {
      result.rows.forEach((row) => {
        console.log(`  ✓ ${row.tablename}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.end();
  }
});
