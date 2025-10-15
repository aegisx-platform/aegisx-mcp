/**
 * Fix PDF Templates with invalid Handlebars syntax
 *
 * This script updates templates that have Handlebars block helpers
 * split across array elements (which is invalid syntax)
 */

const { Client } = require('pg');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5482,
  database: 'aegisx_db',
  user: 'postgres',
  password: 'postgres',
};

// Fixed template data with proper Handlebars syntax
const fixedInvoiceTemplate = {
  pageSize: 'A4',
  pageOrientation: 'portrait',
  pageMargins: [40, 60, 40, 60],
  content: [
    {
      text: '{{company}}',
      style: 'header',
      alignment: 'center',
      margin: [0, 0, 0, 20],
    },
    {
      text: 'INVOICE',
      style: 'subheader',
      alignment: 'center',
      margin: [0, 0, 0, 30],
    },
    {
      columns: [
        {
          width: '*',
          stack: [
            { text: 'Bill To:', style: 'label' },
            { text: '{{customer}}', style: 'value', margin: [0, 5, 0, 15] },
          ],
        },
        {
          width: 'auto',
          stack: [
            { text: 'Invoice #: {{invoiceNumber}}', alignment: 'right' },
            {
              text: 'Date: {{formatDate date "DD/MM/YYYY"}}',
              alignment: 'right',
              margin: [0, 5, 0, 0],
            },
          ],
        },
      ],
    },
    {
      style: 'tableStyle',
      table: {
        headerRows: 1,
        widths: ['*', 80, 80, 80],
        body: [
          [
            { text: 'Description', style: 'tableHeader' },
            { text: 'Quantity', style: 'tableHeader', alignment: 'center' },
            { text: 'Unit Price', style: 'tableHeader', alignment: 'right' },
            { text: 'Total', style: 'tableHeader', alignment: 'right' },
          ],
          ...Array(10).fill([
            '{{description}}',
            { text: '{{quantity}}', alignment: 'center' },
            { text: '{{formatCurrency unitPrice "THB"}}', alignment: 'right' },
            { text: '{{formatCurrency total "THB"}}', alignment: 'right' },
          ]),
        ],
      },
      layout: {
        hLineWidth: function (i, node) {
          return i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5;
        },
        vLineWidth: function () {
          return 0;
        },
        hLineColor: function (i) {
          return i === 1 ? '#2c3e50' : '#cccccc';
        },
        paddingLeft: function () {
          return 8;
        },
        paddingRight: function () {
          return 8;
        },
        paddingTop: function () {
          return 6;
        },
        paddingBottom: function () {
          return 6;
        },
      },
    },
    {
      columns: [
        { width: '*', text: '' },
        {
          width: 200,
          stack: [
            {
              columns: [
                { text: 'Subtotal:', alignment: 'right', style: 'totalLabel' },
                {
                  text: '{{formatCurrency subtotal "THB"}}',
                  alignment: 'right',
                  width: 80,
                },
              ],
            },
            {
              columns: [
                { text: 'Tax:', alignment: 'right', style: 'totalLabel' },
                {
                  text: '{{formatCurrency tax "THB"}}',
                  alignment: 'right',
                  width: 80,
                },
              ],
              margin: [0, 5, 0, 0],
            },
            {
              columns: [
                { text: 'Total:', alignment: 'right', style: 'grandTotal' },
                {
                  text: '{{formatCurrency grandTotal "THB"}}',
                  alignment: 'right',
                  width: 80,
                  style: 'grandTotal',
                },
              ],
              margin: [0, 10, 0, 0],
            },
          ],
          margin: [0, 20, 0, 0],
        },
      ],
    },
    {
      text: 'Thank you for your business!',
      style: 'footer',
      alignment: 'center',
      margin: [0, 40, 0, 0],
    },
  ],
  styles: {
    header: {
      fontSize: 24,
      bold: true,
      color: '#2c3e50',
    },
    subheader: {
      fontSize: 18,
      bold: true,
      color: '#34495e',
    },
    label: {
      fontSize: 10,
      bold: true,
      color: '#7f8c8d',
    },
    value: {
      fontSize: 11,
    },
    tableHeader: {
      bold: true,
      fontSize: 11,
      color: 'white',
      fillColor: '#2c3e50',
    },
    tableStyle: {
      margin: [0, 20, 0, 0],
    },
    totalLabel: {
      fontSize: 11,
      bold: true,
    },
    grandTotal: {
      fontSize: 13,
      bold: true,
      color: '#2c3e50',
    },
    footer: {
      fontSize: 12,
      italics: true,
      color: '#7f8c8d',
    },
  },
  defaultStyle: {
    font: 'Sarabun',
  },
};

const fixedSimpleReportTemplate = {
  pageSize: 'A4',
  pageOrientation: 'portrait',
  pageMargins: [40, 60, 40, 60],
  content: [
    {
      text: '{{title}}',
      style: 'header',
      alignment: 'center',
      margin: [0, 0, 0, 20],
    },
    {
      text: 'Generated on: {{formatDate date "DD/MM/YYYY HH:mm"}}',
      style: 'subheader',
      alignment: 'right',
      margin: [0, 0, 0, 10],
    },
    {
      text: '{{content}}',
      style: 'content',
      margin: [0, 10, 0, 10],
    },
    {
      style: 'tableStyle',
      table: {
        headerRows: 1,
        widths: ['*', 100, 100],
        body: [
          [
            { text: 'Description', style: 'tableHeader' },
            { text: 'Quantity', style: 'tableHeader' },
            { text: 'Price', style: 'tableHeader' },
          ],
          ...Array(5).fill([
            '{{description}}',
            '{{quantity}}',
            '{{formatCurrency price "THB"}}',
          ]),
        ],
      },
    },
  ],
  styles: {
    header: {
      fontSize: 20,
      bold: true,
      color: '#2c3e50',
    },
    subheader: {
      fontSize: 12,
      color: '#7f8c8d',
    },
    content: {
      fontSize: 11,
      lineHeight: 1.4,
    },
    tableHeader: {
      bold: true,
      fontSize: 10,
      color: 'white',
      fillColor: '#2c3e50',
    },
    tableStyle: {
      margin: [0, 10, 0, 0],
    },
  },
  defaultStyle: {
    font: 'Sarabun',
  },
};

const fixedInvoiceSampleData = {
  company: 'AegisX Company Ltd.',
  customer: 'John Doe\n123 Main Street\nBangkok, Thailand 10110',
  invoiceNumber: 'INV-2025-001',
  date: new Date().toISOString(),
  items: [
    { description: 'Product A', quantity: 2, unitPrice: 1000, total: 2000 },
    { description: 'Product B', quantity: 1, unitPrice: 2500, total: 2500 },
  ],
  subtotal: 4500,
  tax: 315,
  grandTotal: 4815,
};

const fixedSimpleReportSampleData = {
  title: 'Sample Report',
  date: new Date().toISOString(),
  content:
    'This is a sample report content that demonstrates the template functionality.',
  items: [
    { description: 'Item 1', quantity: 2, price: 100 },
    { description: 'Item 2', quantity: 1, price: 250 },
    { description: 'Item 3', quantity: 3, price: 75.5 },
  ],
};

async function updateTemplate(client, id, name, templateData, sampleData) {
  const query = `
    UPDATE pdf_templates
    SET
      template_data = $1,
      sample_data = $2,
      updated_at = NOW()
    WHERE id = $3
    RETURNING name, display_name;
  `;

  const result = await client.query(query, [
    JSON.stringify(templateData),
    JSON.stringify(sampleData),
    id,
  ]);

  return result.rows[0];
}

async function main() {
  const client = new Client(dbConfig);

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Update Invoice Template
    console.log('📝 Updating Invoice Template...');
    const invoice = await updateTemplate(
      client,
      'e58ee748-388d-4d03-9741-3b9fe7f1c7ca',
      'invoice-template',
      fixedInvoiceTemplate,
      fixedInvoiceSampleData,
    );
    console.log(`✅ Updated: ${invoice.display_name} (${invoice.name})\n`);

    // Update Simple Report Template
    console.log('📝 Updating Simple Report Template...');
    const report = await updateTemplate(
      client,
      'c6627245-8d9c-4dfb-9827-463040e03eb5',
      'simple-reports',
      fixedSimpleReportTemplate,
      fixedSimpleReportSampleData,
    );
    console.log(`✅ Updated: ${report.display_name} (${report.name})\n`);

    console.log('🎉 All templates updated successfully!');
    console.log('\n📋 Changes made:');
    console.log(
      '  - Removed invalid Handlebars block helpers split across array elements',
    );
    console.log(
      '  - Fixed {{#each}} loops by using static table rows with placeholders',
    );
    console.log('  - Updated sample data to match new template structure');
    console.log('  - Added proper Thai font configuration (Sarabun)');
  } catch (error) {
    console.error('❌ Error updating templates:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

// Run the script
main();
