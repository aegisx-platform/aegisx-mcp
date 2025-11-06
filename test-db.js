const pg = require('pg');
const client = new pg.Client({
  host: 'localhost',
  port: 5432,
  database: 'aegisx_db',
  user: 'postgres',
  password: 'postgres',
});

client.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
  client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;",
    (err, res) => {
      if (err) console.error('Query error:', err);
      else
        console.log(
          'Tables:\n' + res.rows.map((r) => '  - ' + r.table_name).join('\n'),
        );
      client.end();
    },
  );
});
