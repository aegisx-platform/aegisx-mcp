const { knex } = require('./knex-connection');

/**
 * Get database schema for a specific table
 */
async function getDatabaseSchema(tableName) {
  try {
    // Check if table exists
    const tableExists = await knex.schema.hasTable(tableName);
    if (!tableExists) {
      return null;
    }

    // Get column information
    const columns = await knex.raw(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = ? 
      ORDER BY ordinal_position
    `, [tableName]);

    // Get primary key information
    const primaryKeys = await knex.raw(`
      SELECT column_name
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
      WHERE tc.table_name = ? 
        AND tc.constraint_type = 'PRIMARY KEY'
    `, [tableName]);

    // Get foreign key information
    const foreignKeys = await knex.raw(`
      SELECT 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.constraint_column_usage ccu
        ON kcu.constraint_name = ccu.constraint_name
      JOIN information_schema.table_constraints tc
        ON kcu.constraint_name = tc.constraint_name
      WHERE kcu.table_name = ? 
        AND tc.constraint_type = 'FOREIGN KEY'
    `, [tableName]);

    // Process columns
    const processedColumns = columns.rows.map(col => ({
      name: col.column_name,
      type: col.data_type,
      udtName: col.udt_name,
      isNullable: col.is_nullable === 'YES',
      defaultValue: col.column_default,
      maxLength: col.character_maximum_length,
      precision: col.numeric_precision,
      scale: col.numeric_scale,
      isPrimaryKey: primaryKeys.rows.some(pk => pk.column_name === col.column_name),
      isForeignKey: foreignKeys.rows.some(fk => fk.column_name === col.column_name),
      tsType: mapPostgresToTypeScript(col.data_type, col.udt_name),
      typeboxType: mapPostgresToTypeBox(col.data_type, col.udt_name, col.is_nullable === 'YES')
    }));

    return {
      tableName,
      columns: processedColumns,
      primaryKey: primaryKeys.rows.map(pk => pk.column_name),
      foreignKeys: foreignKeys.rows.map(fk => ({
        column: fk.column_name,
        referencedTable: fk.foreign_table_name,
        referencedColumn: fk.foreign_column_name
      }))
    };
  } catch (error) {
    throw new Error(`Failed to get schema for table ${tableName}: ${error.message}`);
  }
}

/**
 * List all tables in the database
 */
async function listTables() {
  try {
    const result = await knex.raw(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    return result.rows.map(row => ({
      name: row.table_name,
      columns: parseInt(row.column_count)
    }));
  } catch (error) {
    throw new Error(`Failed to list tables: ${error.message}`);
  }
}

/**
 * Map PostgreSQL types to TypeScript types
 */
function mapPostgresToTypeScript(dataType, udtName) {
  const typeMap = {
    'integer': 'number',
    'bigint': 'number',
    'smallint': 'number',
    'decimal': 'number',
    'numeric': 'number',
    'real': 'number',
    'double precision': 'number',
    'serial': 'number',
    'bigserial': 'number',
    'character varying': 'string',
    'varchar': 'string',
    'character': 'string',
    'char': 'string',
    'text': 'string',
    'boolean': 'boolean',
    'timestamp without time zone': 'Date',
    'timestamp with time zone': 'Date',
    'date': 'Date',
    'time': 'string',
    'json': 'Record<string, any>',
    'jsonb': 'Record<string, any>',
    'uuid': 'string',
    'bytea': 'Buffer',
    'array': 'any[]'
  };

  // Handle arrays
  if (udtName && udtName.startsWith('_')) {
    const baseType = udtName.substring(1);
    const tsBaseType = typeMap[baseType] || 'any';
    return `${tsBaseType}[]`;
  }

  return typeMap[dataType] || typeMap[udtName] || 'any';
}

/**
 * Map PostgreSQL types to TypeBox types
 */
function mapPostgresToTypeBox(dataType, udtName, isNullable) {
  const typeMap = {
    'integer': 'Type.Integer()',
    'bigint': 'Type.Number()',
    'smallint': 'Type.Integer()',
    'decimal': 'Type.Number()',
    'numeric': 'Type.Number()',
    'real': 'Type.Number()',
    'double precision': 'Type.Number()',
    'serial': 'Type.Integer()',
    'bigserial': 'Type.Number()',
    'character varying': 'Type.String()',
    'varchar': 'Type.String()',
    'character': 'Type.String()',
    'char': 'Type.String()',
    'text': 'Type.String()',
    'boolean': 'Type.Boolean()',
    'timestamp without time zone': 'Type.String({ format: "date-time" })',
    'timestamp with time zone': 'Type.String({ format: "date-time" })',
    'date': 'Type.String({ format: "date" })',
    'time': 'Type.String()',
    'json': 'Type.Record(Type.String(), Type.Any())',
    'jsonb': 'Type.Record(Type.String(), Type.Any())',
    'uuid': 'Type.String({ format: "uuid" })',
    'bytea': 'Type.String()',
    'array': 'Type.Array(Type.Any())'
  };

  let typeboxType = typeMap[dataType] || typeMap[udtName] || 'Type.Any()';

  // Handle arrays
  if (udtName && udtName.startsWith('_')) {
    const baseType = udtName.substring(1);
    const baseTypeBox = typeMap[baseType] || 'Type.Any()';
    typeboxType = `Type.Array(${baseTypeBox})`;
  }

  // Handle nullable types
  if (isNullable) {
    typeboxType = `Type.Optional(${typeboxType})`;
  }

  return typeboxType;
}

module.exports = {
  getDatabaseSchema,
  listTables,
  mapPostgresToTypeScript,
  mapPostgresToTypeBox
};