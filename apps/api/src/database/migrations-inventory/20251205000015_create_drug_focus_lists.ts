import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.drug_focus_lists (
      id SERIAL PRIMARY KEY,
      list_code VARCHAR(20) NOT NULL,
      list_name VARCHAR(100) NOT NULL,
      description TEXT,
      generic_id INTEGER REFERENCES inventory.drug_generics(id),
      drug_id INTEGER REFERENCES inventory.drugs(id),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT drug_focus_lists_list_code_key UNIQUE (list_code)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_drug_focus_lists_generic ON inventory.drug_focus_lists(generic_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_focus_lists_drug ON inventory.drug_focus_lists(drug_id)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.drug_focus_lists CASCADE`);
}
