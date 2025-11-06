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
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }

  try {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   Checking DB at localhost:5483               ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    // Check testProducts role
    const roleResult = await client.query(
      'SELECT id, name, description, parent_id FROM roles WHERE name = $1',
      ['testProducts'],
    );

    if (roleResult.rows.length > 0) {
      console.log('✅ TestProducts Role Found:');
      const role = roleResult.rows[0];
      console.log(`   Name: ${role.name}`);
      console.log(`   ID: ${role.id}`);
      console.log(`   Parent ID: ${role.parent_id}`);
    } else {
      console.log('❌ TestProducts role NOT found');
    }

    // Check permissions
    const permResult = await client.query(
      'SELECT id, resource, action FROM permissions WHERE resource = $1 ORDER BY action',
      ['testProducts'],
    );

    if (permResult.rows.length > 0) {
      console.log(
        `\n✅ TestProducts Permissions Found (${permResult.rows.length}):`,
      );
      permResult.rows.forEach((p) => {
        console.log(`   - ${p.resource}:${p.action}`);
      });
    } else {
      console.log('\n❌ No permissions found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.end();
  }
});
