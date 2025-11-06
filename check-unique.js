const pg = require('pg');
const client = new pg.Client({
  host: 'localhost',
  port: 5432,
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
    const result = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'test_products'
      AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
      ORDER BY tc.constraint_type, kcu.column_name;
    `);

    console.log('Unique Constraints for test_products:');
    console.log('='.repeat(50));
    result.rows.forEach((row) => {
      console.log(`  ${row.constraint_type}: ${row.column_name}`);
    });

    if (result.rows.length === 0) {
      console.log('  (No unique constraints found)');
    }
  } catch (error) {
    console.error('Query error:', error.message);
  } finally {
    client.end();
  }
});
