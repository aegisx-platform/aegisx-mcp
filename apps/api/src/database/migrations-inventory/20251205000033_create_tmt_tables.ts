import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // TMT Concepts (Thai Medical Terminology)
  await knex.raw(`
    CREATE TABLE inventory.tmt_concepts (
      id BIGSERIAL PRIMARY KEY,
      tmt_id BIGINT NOT NULL,
      concept_code VARCHAR(50),
      level inventory.tmt_level NOT NULL,
      fsn TEXT,
      preferred_term TEXT,
      strength VARCHAR(100),
      dosage_form VARCHAR(100),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT tmt_concepts_tmt_id_key UNIQUE (tmt_id)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_tmt_concepts_level ON inventory.tmt_concepts(level)`,
  );
  await knex.raw(
    `CREATE INDEX idx_tmt_concepts_code ON inventory.tmt_concepts(concept_code)`,
  );
  await knex.raw(
    `CREATE INDEX idx_tmt_concepts_active ON inventory.tmt_concepts(is_active)`,
  );

  // TMT Relationships (parent-child hierarchy)
  await knex.raw(`
    CREATE TABLE inventory.tmt_relationships (
      id BIGSERIAL PRIMARY KEY,
      parent_id BIGINT REFERENCES inventory.tmt_concepts(id) NOT NULL,
      child_id BIGINT REFERENCES inventory.tmt_concepts(id) NOT NULL,
      relationship_type inventory.tmt_relation_type NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT tmt_relationships_parent_child_key UNIQUE (parent_id, child_id, relationship_type)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_tmt_relationships_parent ON inventory.tmt_relationships(parent_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_tmt_relationships_child ON inventory.tmt_relationships(child_id)`,
  );

  // TMT Attributes
  await knex.raw(`
    CREATE TABLE inventory.tmt_attributes (
      id BIGSERIAL PRIMARY KEY,
      concept_id BIGINT REFERENCES inventory.tmt_concepts(id) NOT NULL,
      attribute_type VARCHAR(100) NOT NULL,
      attribute_value TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_tmt_attributes_concept ON inventory.tmt_attributes(concept_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_tmt_attributes_type ON inventory.tmt_attributes(attribute_type)`,
  );

  // TMT Mappings (hospital drugs to TMT)
  await knex.raw(`
    CREATE TABLE inventory.tmt_mappings (
      id BIGSERIAL PRIMARY KEY,
      working_code VARCHAR(50),
      drug_code VARCHAR(50),
      generic_id INTEGER REFERENCES inventory.drug_generics(id),
      drug_id INTEGER REFERENCES inventory.drugs(id),
      tmt_level inventory.tmt_level,
      tmt_concept_id BIGINT REFERENCES inventory.tmt_concepts(id),
      tmt_id BIGINT,
      is_verified BOOLEAN DEFAULT false,
      verified_by UUID REFERENCES public.users(id),
      verified_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_tmt_mappings_working_code ON inventory.tmt_mappings(working_code)`,
  );
  await knex.raw(
    `CREATE INDEX idx_tmt_mappings_drug_code ON inventory.tmt_mappings(drug_code)`,
  );
  await knex.raw(
    `CREATE INDEX idx_tmt_mappings_generic ON inventory.tmt_mappings(generic_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_tmt_mappings_drug ON inventory.tmt_mappings(drug_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_tmt_mappings_concept ON inventory.tmt_mappings(tmt_concept_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_tmt_mappings_verified ON inventory.tmt_mappings(is_verified)`,
  );

  // TMT Manufacturers
  await knex.raw(`
    CREATE TABLE inventory.tmt_manufacturers (
      id SERIAL PRIMARY KEY,
      manufacturer_code VARCHAR(50) NOT NULL,
      manufacturer_name VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT tmt_manufacturers_code_key UNIQUE (manufacturer_code)
    )
  `);

  // TMT Dosage Forms
  await knex.raw(`
    CREATE TABLE inventory.tmt_dosage_forms (
      id SERIAL PRIMARY KEY,
      form_code VARCHAR(50) NOT NULL,
      form_name VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT tmt_dosage_forms_code_key UNIQUE (form_code)
    )
  `);

  // TMT Units
  await knex.raw(`
    CREATE TABLE inventory.tmt_units (
      id SERIAL PRIMARY KEY,
      unit_code VARCHAR(50) NOT NULL,
      unit_name VARCHAR(100) NOT NULL,
      conversion_factor DECIMAL(15,6),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT tmt_units_code_key UNIQUE (unit_code)
    )
  `);

  // Add FK from drugs to tmt_concepts (after tmt_concepts exists)
  await knex.raw(`
    ALTER TABLE inventory.drugs
    ADD CONSTRAINT drugs_tmt_tpu_id_fkey
    FOREIGN KEY (tmt_tpu_id) REFERENCES inventory.tmt_concepts(id)
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Remove FK from drugs first
  await knex.raw(
    `ALTER TABLE inventory.drugs DROP CONSTRAINT IF EXISTS drugs_tmt_tpu_id_fkey`,
  );

  await knex.raw(`DROP TABLE IF EXISTS inventory.tmt_units CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.tmt_dosage_forms CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.tmt_manufacturers CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.tmt_mappings CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.tmt_attributes CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.tmt_relationships CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.tmt_concepts CASCADE`);
}
