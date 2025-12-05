import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.hospitals (
      id SERIAL PRIMARY KEY,
      hospital_code VARCHAR(10) NOT NULL,
      hospital_name VARCHAR(200) NOT NULL,
      hospital_type VARCHAR(50),
      province VARCHAR(100),
      region VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT hospitals_hospital_code_key UNIQUE (hospital_code)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_hospitals_type ON inventory.hospitals(hospital_type)`,
  );
  await knex.raw(
    `CREATE INDEX idx_hospitals_province ON inventory.hospitals(province)`,
  );
  await knex.raw(
    `CREATE INDEX idx_hospitals_region ON inventory.hospitals(region)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.hospitals CASCADE`);
}
