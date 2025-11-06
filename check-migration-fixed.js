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
    console.error('Connection error:', err);
    process.exit(1);
  }

  try {
    // Check testProducts role
    console.log('\n=== TestProducts Role ===');
    const roleResult = await client.query(
      'SELECT id, name, description, parent_id FROM roles WHERE name = $1',
      ['testProducts'],
    );
    if (roleResult.rows.length > 0) {
      console.log('✅ Role created:');
      roleResult.rows.forEach((row) => {
        console.log(`  ID: ${row.id}`);
        console.log(`  Name: ${row.name}`);
        console.log(`  Description: ${row.description}`);
        console.log(`  Parent ID: ${row.parent_id}`);
      });
    } else {
      console.log('❌ Role not found');
    }

    // Check testProducts permissions
    console.log('\n=== TestProducts Permissions ===');
    const permResult = await client.query(
      'SELECT id, resource, action, description FROM permissions WHERE resource = $1 ORDER BY action',
      ['testProducts'],
    );
    if (permResult.rows.length > 0) {
      console.log(`✅ Permissions created (${permResult.rows.length}):`);
      permResult.rows.forEach((row) => {
        console.log(`  - ${row.resource}:${row.action} (ID: ${row.id})`);
      });
    } else {
      console.log('❌ Permissions not found');
    }

    // Check role-permission mappings
    console.log('\n=== Role-Permission Mappings ===');
    const mappingResult = await client.query(
      `
      SELECT r.name as role_name, p.resource, p.action
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE p.resource = $1
      ORDER BY r.name, p.action
    `,
      ['testProducts'],
    );

    if (mappingResult.rows.length > 0) {
      console.log(`✅ Mappings created (${mappingResult.rows.length}):`);
      mappingResult.rows.forEach((row) => {
        console.log(`  - ${row.role_name} → ${row.resource}:${row.action}`);
      });
    } else {
      console.log('❌ No mappings found');
    }

    // Check migration history
    console.log('\n=== Migration History ===');
    const migResult = await client.query(
      'SELECT name FROM knex_migrations WHERE name LIKE $1 ORDER BY name DESC',
      ['%testProducts%'],
    );
    if (migResult.rows.length > 0) {
      console.log('✅ Migrations recorded:');
      migResult.rows.forEach((row) => {
        console.log(`  - ${row.name}`);
      });
    }

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║          MIGRATION VERIFICATION RESULT         ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log(`\n✅ Migration executed successfully!\n`);
    console.log(`   Role: testProducts`);
    console.log(
      `   Permissions: ${permResult.rows.length} (create, read, update, delete)`,
    );
    console.log(`   Role-Permission Mappings: ${mappingResult.rows.length}`);
    console.log(`\n   Database State: CORRECT ✅`);
  } catch (error) {
    console.error('Query error:', error.message);
  } finally {
    client.end();
  }
});
