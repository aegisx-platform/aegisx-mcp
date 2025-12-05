import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.departments (
      id SERIAL PRIMARY KEY,
      dept_code VARCHAR(10) NOT NULL,
      dept_name VARCHAR(100) NOT NULL,
      his_code VARCHAR(20),
      parent_id INTEGER REFERENCES inventory.departments(id),
      consumption_group inventory.dept_consumption_group,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT departments_dept_code_key UNIQUE (dept_code)
    )
  `);

  // Indexes
  await knex.raw(
    `CREATE INDEX idx_departments_parent ON inventory.departments(parent_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_departments_his_code ON inventory.departments(his_code)`,
  );
  await knex.raw(
    `CREATE INDEX idx_departments_active ON inventory.departments(is_active)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.departments CASCADE`);
}
