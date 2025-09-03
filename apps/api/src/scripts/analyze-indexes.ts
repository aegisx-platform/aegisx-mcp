import knex from 'knex';
import knexConfig from '../../../../knexfile';
import { config } from 'dotenv';

config();

const db = knex(knexConfig.development);

async function analyzeIndexes() {
  console.log('\n🔍 Analyzing Database Indexes\n');
  
  try {
    // Get all indexes
    const indexes = await db.raw(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `);
    
    console.log('📊 Current Indexes:');
    console.log('==================\n');
    
    let currentTable = '';
    indexes.rows.forEach((index: any) => {
      if (currentTable !== index.tablename) {
        currentTable = index.tablename;
        console.log(`\n🗂️  Table: ${currentTable}`);
        console.log('-'.repeat(50));
      }
      console.log(`  📌 ${index.indexname} (${index.index_size})`);
      console.log(`     ${index.indexdef}`);
    });
    
    // Analyze table sizes
    const tableSizes = await db.raw(`
      SELECT 
        tablename,
        pg_size_pretty(pg_total_relation_size(tablename::regclass)) as total_size,
        pg_size_pretty(pg_relation_size(tablename::regclass)) as table_size,
        pg_size_pretty(pg_indexes_size(tablename::regclass)) as indexes_size,
        (pg_relation_size(tablename::regclass) * 100.0 / 
         NULLIF(pg_total_relation_size(tablename::regclass), 0))::numeric(5,2) as table_percent
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(tablename::regclass) DESC;
    `);
    
    console.log('\n\n📈 Table Size Analysis:');
    console.log('=====================\n');
    console.log('Table Name                      | Total Size | Table Size | Index Size | Table %');
    console.log('-'.repeat(82));
    
    tableSizes.rows.forEach((table: any) => {
      console.log(
        `${table.tablename.padEnd(30)} | ${table.total_size.padStart(10)} | ` +
        `${table.table_size.padStart(10)} | ${table.indexes_size.padStart(10)} | ` +
        `${table.table_percent}%`
      );
    });
    
    // Check for missing indexes
    console.log('\n\n🔍 Potential Missing Indexes:');
    console.log('============================\n');
    
    // Check foreign keys without indexes
    const fkWithoutIndexes = await db.raw(`
      SELECT DISTINCT
        tc.table_name,
        kcu.column_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND NOT EXISTS (
          SELECT 1
          FROM pg_index i
          JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
          JOIN pg_class c ON c.oid = i.indrelid
          WHERE c.relname = tc.table_name
            AND a.attname = kcu.column_name
        )
      ORDER BY tc.table_name, kcu.column_name;
    `);
    
    if (fkWithoutIndexes.rows.length > 0) {
      console.log('⚠️  Foreign keys without indexes (may cause slow JOINs):');
      fkWithoutIndexes.rows.forEach((fk: any) => {
        console.log(`   - ${fk.table_name}.${fk.column_name} (${fk.constraint_name})`);
      });
    } else {
      console.log('✅ All foreign keys have indexes');
    }
    
    // Check for duplicate indexes
    const duplicateIndexes = await db.raw(`
      WITH index_info AS (
        SELECT 
          schemaname,
          tablename,
          indexname,
          array_agg(attname ORDER BY attnum) as columns
        FROM pg_indexes
        JOIN pg_index ON indexrelid::regclass::text = schemaname||'.'||indexname
        JOIN pg_attribute ON attrelid = indrelid AND attnum = ANY(indkey)
        WHERE schemaname = 'public'
        GROUP BY schemaname, tablename, indexname
      )
      SELECT 
        i1.tablename,
        i1.indexname as index1,
        i2.indexname as index2,
        i1.columns
      FROM index_info i1
      JOIN index_info i2 ON i1.tablename = i2.tablename 
        AND i1.columns = i2.columns
        AND i1.indexname < i2.indexname;
    `);
    
    if (duplicateIndexes.rows.length > 0) {
      console.log('\n⚠️  Potential duplicate indexes:');
      duplicateIndexes.rows.forEach((dup: any) => {
        console.log(`   - ${dup.tablename}: ${dup.index1} and ${dup.index2}`);
      });
    } else {
      console.log('\n✅ No duplicate indexes found');
    }
    
  } catch (error) {
    console.error('Error analyzing indexes:', error);
  } finally {
    await db.destroy();
  }
}

analyzeIndexes().catch(console.error);
