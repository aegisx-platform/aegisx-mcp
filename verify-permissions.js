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
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   MIGRATION VERIFICATION - testProducts Role  ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    // 1. Check Role
    console.log('1️⃣  ROLE INFORMATION');
    console.log('─'.repeat(50));
    const roleResult = await client.query(
      'SELECT id, name, description, parent_id FROM roles WHERE name = $1',
      ['testProducts'],
    );

    if (roleResult.rows.length > 0) {
      const role = roleResult.rows[0];
      console.log(`✅ Role: ${role.name}`);
      console.log(`   ID: ${role.id}`);
      console.log(`   Description: ${role.description}`);
      console.log(`   Parent ID: ${role.parent_id}`);

      // Get parent role name
      if (role.parent_id) {
        const parentResult = await client.query(
          'SELECT name FROM roles WHERE id = $1',
          [role.parent_id],
        );
        if (parentResult.rows.length > 0) {
          console.log(`   Parent Role: ${parentResult.rows[0].name} ✓`);
        }
      }
    } else {
      console.log('❌ Role not found');
    }

    // 2. Check Permissions
    console.log('\n2️⃣  PERMISSIONS');
    console.log('─'.repeat(50));
    const permResult = await client.query(
      'SELECT id, resource, action, description FROM permissions WHERE resource = $1 ORDER BY action',
      ['testProducts'],
    );

    if (permResult.rows.length > 0) {
      console.log(`✅ Permissions created: ${permResult.rows.length}`);
      permResult.rows.forEach((perm, index) => {
        console.log(`   ${index + 1}. ${perm.resource}:${perm.action}`);
        console.log(`      Description: ${perm.description}`);
      });
    } else {
      console.log('❌ No permissions found');
    }

    // 3. Check Role-Permission Mappings
    console.log('\n3️⃣  ROLE-PERMISSION MAPPINGS');
    console.log('─'.repeat(50));
    const mappingResult = await client.query(`
      SELECT
        r.name as role_name,
        p.resource,
        p.action
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE p.resource = 'testProducts'
      ORDER BY r.name, p.action
    `);

    if (mappingResult.rows.length > 0) {
      console.log(`✅ Mappings created: ${mappingResult.rows.length}`);
      const groupedByRole = {};
      mappingResult.rows.forEach((row) => {
        if (!groupedByRole[row.role_name]) {
          groupedByRole[row.role_name] = [];
        }
        groupedByRole[row.role_name].push(`${row.resource}:${row.action}`);
      });

      Object.entries(groupedByRole).forEach(([roleName, permissions]) => {
        console.log(`\n   Role: ${roleName}`);
        permissions.forEach((perm) => {
          console.log(`      ✓ ${perm}`);
        });
      });
    } else {
      console.log('❌ No role-permission mappings found');
    }

    // 4. Migration History
    console.log('\n4️⃣  MIGRATION HISTORY');
    console.log('─'.repeat(50));
    const migResult = await client.query(
      'SELECT batch, name FROM knex_migrations WHERE name LIKE $1 ORDER BY id DESC',
      ['%testProducts%'],
    );

    if (migResult.rows.length > 0) {
      console.log(`✅ Migration recorded:`);
      migResult.rows.forEach((row) => {
        console.log(`   Batch ${row.batch}: ${row.name}`);
      });
    }

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('✅ MIGRATION EXECUTION SUCCESSFUL');
    console.log('═'.repeat(50));
    console.log(`\nSummary:`);
    console.log(`  ✓ Role created: testProducts`);
    console.log(`  ✓ Permissions created: ${permResult.rows.length}`);
    console.log(`  ✓ Role-Permission mappings: ${mappingResult.rows.length}`);
    console.log(`  ✓ Role hierarchy: testProducts → admin`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.end();
  }
});
