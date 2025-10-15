import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create pdf_templates table
  await knex.schema.createTable('pdf_templates', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Template identification
    table.string('name', 100).notNullable().unique();
    table.string('display_name', 200).notNullable();
    table.text('description').nullable();

    // Template categorization
    table.string('category', 50).defaultTo('general');
    table.string('type', 50).defaultTo('document'); // document, report, invoice, etc.

    // Template content
    table.json('template_data').notNullable(); // PDFMake + Handlebars template
    table.json('sample_data').nullable(); // Example data for preview
    table.json('schema').nullable(); // JSON schema for validation

    // Template configuration
    table.string('page_size', 10).defaultTo('A4');
    table.string('orientation', 10).defaultTo('portrait');
    table.json('styles').nullable(); // Custom PDFMake styles
    table.json('fonts').nullable(); // Font configuration

    // Template metadata
    table.string('version', 20).defaultTo('1.0.0');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_default').defaultTo(false);
    table.integer('usage_count').defaultTo(0);

    // File attachments (for logos, images, etc.)
    table.json('assets').nullable(); // Array of asset references

    // Permissions and access control
    table.json('permissions').nullable(); // Role-based access
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index(['name']);
    table.index(['category', 'type']);
    table.index(['is_active']);
    table.index(['created_by']);
  });

  // Create pdf_template_versions table for version history
  await knex.schema.createTable('pdf_template_versions', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Reference to main template
    table.uuid('template_id').notNullable();
    table.foreign('template_id').references('id').inTable('pdf_templates').onDelete('CASCADE');

    // Version info
    table.string('version', 20).notNullable();
    table.text('changelog').nullable();

    // Template content snapshot
    table.json('template_data').notNullable();
    table.json('sample_data').nullable();
    table.json('schema').nullable();
    table.json('styles').nullable();
    table.json('fonts').nullable();

    // Metadata
    table.uuid('created_by').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index(['template_id', 'version']);
    table.index(['created_at']);
  });

  // Create pdf_renders table for tracking renders
  await knex.schema.createTable('pdf_renders', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Template reference
    table.uuid('template_id').notNullable();
    table.foreign('template_id').references('id').inTable('pdf_templates');
    table.string('template_version', 20).nullable();

    // Render metadata
    table.string('render_type', 20).defaultTo('normal'); // normal, preview, test
    table.json('render_data').nullable(); // Input data used for rendering
    table.integer('page_count').nullable();
    table.integer('file_size').nullable(); // in bytes

    // Performance metrics
    table.integer('render_time_ms').nullable();
    table.timestamp('rendered_at').defaultTo(knex.fn.now());

    // User tracking
    table.uuid('rendered_by').nullable();
    table.string('ip_address', 45).nullable();
    table.string('user_agent', 500).nullable();

    // File storage reference (if stored)
    table.string('file_path').nullable();
    table.string('file_url').nullable();
    table.timestamp('expires_at').nullable();

    // Status
    table.string('status', 20).defaultTo('completed'); // pending, completed, failed
    table.text('error_message').nullable();

    // Indexes
    table.index(['template_id']);
    table.index(['rendered_by']);
    table.index(['rendered_at']);
    table.index(['status']);
  });

  // Insert default templates
  await knex('pdf_templates').insert([
    {
      name: 'simple-report',
      display_name: 'Simple Report Template',
      description: 'A basic report template with header, content, and footer',
      category: 'report',
      type: 'document',
      template_data: {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [40, 60, 40, 60],
        content: [
          {
            text: '{{title}}',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          {
            text: 'Generated on: {{formatDate date "DD/MM/YYYY HH:mm"}}',
            style: 'subheader',
            alignment: 'right',
            margin: [0, 0, 0, 10]
          },
          {
            text: '{{content}}',
            style: 'content',
            margin: [0, 10, 0, 10]
          },
          '{{#if items}}',
          {
            style: 'tableStyle',
            table: {
              headerRows: 1,
              widths: ['*', 100, 100],
              body: [
                [
                  { text: 'Description', style: 'tableHeader' },
                  { text: 'Quantity', style: 'tableHeader' },
                  { text: 'Price', style: 'tableHeader' }
                ],
                '{{#each items}}',
                [
                  '{{description}}',
                  '{{quantity}}',
                  '{{formatCurrency price}}'
                ],
                '{{/each}}'
              ]
            }
          },
          '{{/if}}'
        ],
        styles: {
          header: {
            fontSize: 20,
            bold: true,
            color: '#2c3e50'
          },
          subheader: {
            fontSize: 12,
            color: '#7f8c8d'
          },
          content: {
            fontSize: 11,
            lineHeight: 1.4
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            color: 'white',
            fillColor: '#2c3e50'
          },
          tableStyle: {
            margin: [0, 10, 0, 0]
          }
        }
      },
      sample_data: {
        title: 'Sample Report',
        date: new Date().toISOString(),
        content: 'This is a sample report content that demonstrates the template functionality.',
        items: [
          { description: 'Item 1', quantity: 2, price: 100.00 },
          { description: 'Item 2', quantity: 1, price: 250.00 },
          { description: 'Item 3', quantity: 3, price: 75.50 }
        ]
      },
      schema: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          content: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                quantity: { type: 'number' },
                price: { type: 'number' }
              }
            }
          }
        }
      },
      is_default: true
    },
    {
      name: 'invoice-template',
      display_name: 'Invoice Template',
      description: 'Professional invoice template with company details and itemized billing',
      category: 'financial',
      type: 'invoice',
      template_data: {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [40, 60, 40, 60],
        content: [
          {
            columns: [
              {
                text: '{{company.name}}',
                style: 'companyName'
              },
              {
                text: 'INVOICE',
                style: 'invoiceTitle',
                alignment: 'right'
              }
            ],
            margin: [0, 0, 0, 20]
          },
          {
            text: 'Invoice #: {{invoiceNumber}}',
            style: 'invoiceNumber',
            margin: [0, 0, 0, 10]
          },
          {
            text: 'Date: {{formatDate invoiceDate "DD/MM/YYYY"}}',
            style: 'invoiceDate',
            margin: [0, 0, 0, 20]
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'Bill To:', style: 'sectionHeader' },
                  '{{customer.name}}',
                  '{{customer.address}}',
                  '{{customer.email}}'
                ]
              },
              {
                width: '50%',
                stack: [
                  { text: 'Ship To:', style: 'sectionHeader' },
                  '{{shipping.name}}',
                  '{{shipping.address}}'
                ]
              }
            ],
            margin: [0, 0, 0, 30]
          },
          {
            style: 'itemsTable',
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Description', style: 'tableHeader' },
                  { text: 'Qty', style: 'tableHeader' },
                  { text: 'Price', style: 'tableHeader' },
                  { text: 'Total', style: 'tableHeader' }
                ],
                '{{#each items}}',
                [
                  '{{description}}',
                  '{{quantity}}',
                  '{{formatCurrency unitPrice}}',
                  '{{formatCurrency total}}'
                ],
                '{{/each}}',
                [
                  { text: '', colSpan: 3, border: [false, false, false, false] },
                  {},
                  {},
                  { text: 'Subtotal: {{formatCurrency subtotal}}', style: 'totalRow' }
                ],
                [
                  { text: '', colSpan: 3, border: [false, false, false, false] },
                  {},
                  {},
                  { text: 'Tax: {{formatCurrency tax}}', style: 'totalRow' }
                ],
                [
                  { text: '', colSpan: 3, border: [false, false, false, false] },
                  {},
                  {},
                  { text: 'Total: {{formatCurrency total}}', style: 'finalTotal' }
                ]
              ]
            }
          }
        ],
        styles: {
          companyName: {
            fontSize: 20,
            bold: true,
            color: '#2c3e50'
          },
          invoiceTitle: {
            fontSize: 24,
            bold: true,
            color: '#e74c3c'
          },
          sectionHeader: {
            fontSize: 12,
            bold: true,
            margin: [0, 0, 0, 5]
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            color: 'white',
            fillColor: '#34495e'
          },
          totalRow: {
            bold: true,
            alignment: 'right'
          },
          finalTotal: {
            bold: true,
            fontSize: 12,
            alignment: 'right',
            color: '#e74c3c'
          }
        }
      },
      sample_data: {
        company: {
          name: 'ACME Corporation',
          address: '123 Business St, Bangkok 10110',
          email: 'info@acme.com'
        },
        invoiceNumber: 'INV-2024-001',
        invoiceDate: new Date().toISOString(),
        customer: {
          name: 'John Doe',
          address: '456 Customer Ave, Bangkok 10220',
          email: 'john@example.com'
        },
        shipping: {
          name: 'John Doe',
          address: '456 Customer Ave, Bangkok 10220'
        },
        items: [
          { description: 'Product A', quantity: 2, unitPrice: 1000, total: 2000 },
          { description: 'Product B', quantity: 1, unitPrice: 1500, total: 1500 }
        ],
        subtotal: 3500,
        tax: 245,
        total: 3745
      },
      schema: {
        type: 'object',
        required: ['company', 'invoiceNumber', 'customer', 'items'],
        properties: {
          company: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: { type: 'string' },
              email: { type: 'string', format: 'email' }
            }
          },
          invoiceNumber: { type: 'string' },
          invoiceDate: { type: 'string', format: 'date-time' },
          customer: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: { type: 'string' },
              email: { type: 'string', format: 'email' }
            }
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                quantity: { type: 'number' },
                unitPrice: { type: 'number' },
                total: { type: 'number' }
              }
            }
          }
        }
      }
    }
  ]);

  console.log('✅ PDF Templates tables created successfully');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('pdf_renders');
  await knex.schema.dropTableIfExists('pdf_template_versions');
  await knex.schema.dropTableIfExists('pdf_templates');
  console.log('✅ PDF Templates tables dropped successfully');
}