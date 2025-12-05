import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Approval Documents
  await knex.raw(`
    CREATE TABLE inventory.approval_documents (
      id BIGSERIAL PRIMARY KEY,
      po_id BIGINT REFERENCES inventory.purchase_orders(id) ON DELETE CASCADE NOT NULL,
      document_number VARCHAR(50) NOT NULL,
      document_type inventory.approval_doc_type NOT NULL,
      approved_by UUID REFERENCES public.users(id) NOT NULL,
      approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      file_path TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT approval_documents_document_number_key UNIQUE (document_number)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_approval_documents_po ON inventory.approval_documents(po_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_approval_documents_type ON inventory.approval_documents(document_type)`,
  );

  // Payment Documents
  await knex.raw(`
    CREATE TABLE inventory.payment_documents (
      id BIGSERIAL PRIMARY KEY,
      receipt_id BIGINT REFERENCES inventory.receipts(id) NOT NULL,
      payment_number VARCHAR(50) NOT NULL,
      payment_date DATE DEFAULT CURRENT_DATE,
      payment_amount DECIMAL(15,2) NOT NULL,
      payment_method inventory.payment_method NOT NULL,
      payment_status inventory.payment_status DEFAULT 'PENDING',
      reference_number VARCHAR(50),
      notes TEXT,
      paid_by UUID REFERENCES public.users(id) NOT NULL,
      paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT payment_documents_payment_number_key UNIQUE (payment_number),
      CONSTRAINT payment_documents_amount_check CHECK (payment_amount > 0)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_payment_documents_receipt ON inventory.payment_documents(receipt_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_payment_documents_method ON inventory.payment_documents(payment_method)`,
  );
  await knex.raw(
    `CREATE INDEX idx_payment_documents_status ON inventory.payment_documents(payment_status)`,
  );

  // Payment Attachments
  await knex.raw(`
    CREATE TABLE inventory.payment_attachments (
      id BIGSERIAL PRIMARY KEY,
      payment_id BIGINT REFERENCES inventory.payment_documents(id) ON DELETE CASCADE NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL,
      file_type VARCHAR(50),
      file_size BIGINT,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_payment_attachments_payment ON inventory.payment_attachments(payment_id)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.payment_attachments CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.payment_documents CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.approval_documents CASCADE`);
}
