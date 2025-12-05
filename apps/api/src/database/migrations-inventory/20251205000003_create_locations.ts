import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.locations (
      id SERIAL PRIMARY KEY,
      location_code VARCHAR(10) NOT NULL,
      location_name VARCHAR(100) NOT NULL,
      location_type inventory.location_type NOT NULL,
      parent_id INTEGER REFERENCES inventory.locations(id),
      address TEXT,
      responsible_person VARCHAR(100),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT locations_location_code_key UNIQUE (location_code)
    )
  `);

  // Indexes
  await knex.raw(
    `CREATE INDEX idx_locations_parent ON inventory.locations(parent_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_locations_type ON inventory.locations(location_type)`,
  );
  await knex.raw(
    `CREATE INDEX idx_locations_active ON inventory.locations(is_active)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.locations CASCADE`);
}
