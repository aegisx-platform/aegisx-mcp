import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.companies (
      id SERIAL PRIMARY KEY,
      company_code VARCHAR(10) NOT NULL,
      company_name VARCHAR(200) NOT NULL,
      tax_id VARCHAR(20),
      bank_id INTEGER REFERENCES inventory.bank(id),
      bank_account_number VARCHAR(50),
      bank_account_name VARCHAR(100),
      is_vendor BOOLEAN DEFAULT true,
      is_manufacturer BOOLEAN DEFAULT false,
      contact_person VARCHAR(100),
      phone VARCHAR(20),
      email VARCHAR(100),
      address TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT companies_company_code_key UNIQUE (company_code),
      CONSTRAINT companies_tax_id_key UNIQUE (tax_id)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_companies_bank ON inventory.companies(bank_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_companies_vendor ON inventory.companies(is_vendor)`,
  );
  await knex.raw(
    `CREATE INDEX idx_companies_manufacturer ON inventory.companies(is_manufacturer)`,
  );
  await knex.raw(
    `CREATE INDEX idx_companies_active ON inventory.companies(is_active)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.companies CASCADE`);
}
