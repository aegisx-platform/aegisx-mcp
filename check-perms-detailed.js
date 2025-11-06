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
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   Checking Detailed Permission Status          ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    // Check all testProducts permissions
    const permResult = await client.query(
      `SELECT id, resource, action, description, created_at, updated_at 
       FROM permissions 
       WHERE resource = $1 
       ORDER BY action`,
      ['testProducts'],
    );

    console.log('✅ Permissions in database:');
    if (permResult.rows.length > 0) {
      permResult.rows.forEach((p) => {
        console.log(`   ${p.action}: ${p.id} (created: ${p.created_at})`);
      });
    } else {
      console.log('   (NONE FOUND!)');
    }

    // Check role-permission links
    const linkResult = await client.query(
      `SELECT rp.role_id, r.name as role_name, rp.permission_id, p.action, p.resource
       FROM role_permissions rp
       JOIN roles r ON rp.role_id = r.id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE p.resource = $1
       ORDER BY r.name, p.action`,
      ['testProducts'],
    );

    console.log('\n✅ Role-Permission Links:');
    if (linkResult.rows.length > 0) {
      linkResult.rows.forEach((link) => {
        console.log(
          `   Role: ${link.role_name} -> ${link.resource}:${link.action}`,
        );
      });
    } else {
      console.log('   (NONE FOUND!)');
    }

    // Check testProducts role
    const roleResult = await client.query(
      `SELECT id, name, description, parent_id, created_at 
       FROM roles 
       WHERE name = $1`,
      ['testProducts'],
    );

    console.log('\n✅ TestProducts Role:');
    if (roleResult.rows.length > 0) {
      roleResult.rows.forEach((r) => {
        console.log(`   ${r.name}: ${r.id} (parent: ${r.parent_id})`);
      });
    } else {
      console.log('   (NOT FOUND!)');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.end();
  }
});
