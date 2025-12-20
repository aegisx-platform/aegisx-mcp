import type { Knex } from 'knex';

/**
 * PDF Template Hospital Inventory Starters Seed
 *
 * Creates 6 Thai hospital inventory PDF template starters
 */
export async function seed(knex: Knex): Promise<void> {
  // Only insert if no hospital inventory template starters exist yet
  const existing = await knex('pdf_templates')
    .where('name', 'like', 'hospital-%')
    .where('is_template_starter', true)
    .first();

  if (existing) {
    console.log(
      '✅ Hospital inventory template starters already exist, skipping seed',
    );
    return;
  }

  console.log('🏥 Seeding hospital inventory PDF template starters...');

  const now = new Date().toISOString();

  const templateStarters = [
    // 1. Drug Requisition Template
    {
      name: 'hospital-drug-requisition-starter',
      display_name: 'ใบเบิกยา / Drug Requisition',
      description:
        'เทมเพลตใบเบิกยาสำหรับโรงพยาบาล รองรับการเบิกยาจากคลังยาไปยังแผนกต่างๆ',
      category: 'hospital-inventory',
      type: 'handlebars',
      page_size: 'A4',
      orientation: 'portrait',
      version: '1.0.0',
      is_active: true,
      is_default: false,
      is_template_starter: true,
      usage_count: 0,
      template_data: {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [40, 60, 40, 60],
        content: [
          {
            text: 'ใบเบิกยา / Drug Requisition',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                width: '60%',
                stack: [
                  { text: 'แผนกผู้เบิก:', style: 'label' },
                  { text: '{{department.name}}', style: 'bold' },
                ],
              },
              {
                width: '40%',
                stack: [
                  {
                    text: 'เลขที่: {{distributionNumber}}',
                    alignment: 'right',
                  },
                  { text: 'วันที่: {{distributionDate}}', alignment: 'right' },
                ],
              },
            ],
            margin: [0, 0, 0, 15],
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto'],
              body: [
                ['ลำดับ', 'ชื่อยา', 'จำนวน', 'หน่วย'],
                '{{#each items}}',
                [
                  '{{add @index 1}}',
                  '{{drugName}}',
                  '{{quantity}}',
                  '{{unit}}',
                ],
                '{{/each}}',
              ],
            },
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, font: 'Sarabun' },
          label: { fontSize: 10, bold: true, font: 'Sarabun' },
          bold: { bold: true, fontSize: 12, font: 'Sarabun' },
        },
        defaultStyle: {
          font: 'Sarabun',
          fontSize: 11,
        },
      } as any,
      sample_data: {
        distributionNumber: 'DIST-2025-01-001',
        distributionDate: '20 มกราคม 2568',
        department: { name: 'แผนกอายุรกรรม' },
        items: [
          { drugName: 'Paracetamol 500mg', quantity: '100', unit: 'Tabs' },
          { drugName: 'Amoxicillin 500mg', quantity: '50', unit: 'Caps' },
        ],
      } as any,
      created_at: now,
      updated_at: now,
    },

    // 2. Drug Dispensing Form
    {
      name: 'hospital-drug-dispensing-starter',
      display_name: 'ใบจ่ายยา / Drug Dispensing Form',
      description: 'เทมเพลตใบจ่ายยาสำหรับโรงพยาบาล',
      category: 'hospital-inventory',
      type: 'handlebars',
      page_size: 'A4',
      orientation: 'portrait',
      version: '1.0.0',
      is_active: true,
      is_default: false,
      is_template_starter: true,
      usage_count: 0,
      template_data: {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [40, 60, 40, 60],
        content: [
          {
            text: 'ใบจ่ายยา / Drug Dispensing Form',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              { text: 'จ่ายให้: {{department.name}}', width: '50%' },
              {
                text: 'เลขที่: {{distributionNumber}}',
                width: '50%',
                alignment: 'right',
              },
            ],
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: [
                ['ลำดับ', 'ชื่อยา', 'Lot No.', 'จำนวน', 'ราคา'],
                '{{#each items}}',
                [
                  '{{add @index 1}}',
                  '{{drugName}}',
                  '{{lotNumber}}',
                  '{{quantity}}',
                  '{{unitCost}}',
                ],
                '{{/each}}',
              ],
            },
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, font: 'Sarabun' },
        },
        defaultStyle: { font: 'Sarabun' },
      } as any,
      sample_data: {
        distributionNumber: 'DIST-2025-01-001',
        department: { name: 'แผนกอายุรกรรม' },
        items: [
          {
            drugName: 'Paracetamol 500mg',
            lotNumber: 'LOT2024-001',
            quantity: '100',
            unitCost: '0.50',
          },
        ],
      } as any,
      created_at: now,
      updated_at: now,
    },

    // 3. Drug Return Form
    {
      name: 'hospital-drug-return-starter',
      display_name: 'ใบคืนยา / Drug Return Form',
      description: 'เทมเพลตใบคืนยาสำหรับโรงพยาบาล',
      category: 'hospital-inventory',
      type: 'handlebars',
      page_size: 'A4',
      orientation: 'portrait',
      version: '1.0.0',
      is_active: true,
      is_default: false,
      is_template_starter: true,
      usage_count: 0,
      template_data: {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [40, 60, 40, 60],
        content: [
          {
            text: 'ใบคืนยา / Drug Return Form',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              { text: 'แผนกคืน: {{department.name}}', width: '60%' },
              {
                text: 'เลขที่: {{returnNumber}}',
                width: '40%',
                alignment: 'right',
              },
            ],
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: [
                ['ลำดับ', 'ชื่อยา', 'Lot No.', 'ของดี', 'ของเสีย'],
                '{{#each items}}',
                [
                  '{{add @index 1}}',
                  '{{drugName}}',
                  '{{lotNumber}}',
                  '{{goodQuantity}}',
                  '{{damagedQuantity}}',
                ],
                '{{/each}}',
              ],
            },
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, font: 'Sarabun' },
        },
        defaultStyle: { font: 'Sarabun' },
      } as any,
      sample_data: {
        returnNumber: 'RET-2025-01-001',
        department: { name: 'แผนกศัลยกรรม' },
        items: [
          {
            drugName: 'Ceftriaxone 1g',
            lotNumber: 'LOT2024-090',
            goodQuantity: '5',
            damagedQuantity: '0',
          },
        ],
      } as any,
      created_at: now,
      updated_at: now,
    },

    // 4. Drug Stock Report
    {
      name: 'hospital-drug-stock-report-starter',
      display_name: 'รายงานสต็อกยา / Drug Stock Report',
      description: 'เทมเพลตรายงานสต็อกยาคงเหลือในคลัง',
      category: 'hospital-inventory',
      type: 'handlebars',
      page_size: 'A4',
      orientation: 'landscape',
      version: '1.0.0',
      is_active: true,
      is_default: false,
      is_template_starter: true,
      usage_count: 0,
      template_data: {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [30, 50, 30, 50],
        content: [
          {
            text: 'รายงานสต็อกยา / Drug Stock Report',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: [
                ['ลำดับ', 'ชื่อยา', 'หน่วย', 'คงเหลือ', 'มูลค่า'],
                '{{#each items}}',
                [
                  '{{add @index 1}}',
                  '{{drugName}}',
                  '{{unit}}',
                  '{{quantityOnHand}}',
                  '{{totalValue}}',
                ],
                '{{/each}}',
              ],
            },
          },
        ],
        styles: {
          header: { fontSize: 16, bold: true, font: 'Sarabun' },
        },
        defaultStyle: { font: 'Sarabun' },
      } as any,
      sample_data: {
        items: [
          {
            drugName: 'Paracetamol 500mg',
            unit: 'Tabs',
            quantityOnHand: '5,000',
            totalValue: '2,500.00',
          },
        ],
      } as any,
      created_at: now,
      updated_at: now,
    },

    // 5. Drug Receiving Form
    {
      name: 'hospital-drug-receiving-starter',
      display_name: 'ใบตรวจรับยา / Drug Receiving Form',
      description: 'เทมเพลตใบตรวจรับยาเข้าคลัง',
      category: 'hospital-inventory',
      type: 'handlebars',
      page_size: 'A4',
      orientation: 'portrait',
      version: '1.0.0',
      is_active: true,
      is_default: false,
      is_template_starter: true,
      usage_count: 0,
      template_data: {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [40, 60, 40, 60],
        content: [
          {
            text: 'ใบตรวจรับยา / Drug Receiving Form',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              { text: 'ผู้จำหน่าย: {{supplier.name}}', width: '60%' },
              {
                text: 'เลขที่: {{receiptNumber}}',
                width: '40%',
                alignment: 'right',
              },
            ],
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: [
                ['ลำดับ', 'ชื่อยา', 'Lot No.', 'จำนวน', 'ราคา'],
                '{{#each items}}',
                [
                  '{{add @index 1}}',
                  '{{drugName}}',
                  '{{lotNumber}}',
                  '{{receivedQuantity}}',
                  '{{unitPrice}}',
                ],
                '{{/each}}',
              ],
            },
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, font: 'Sarabun' },
        },
        defaultStyle: { font: 'Sarabun' },
      } as any,
      sample_data: {
        receiptNumber: 'REC-2025-01-001',
        supplier: { name: 'บริษัท ยาไทย จำกัด' },
        items: [
          {
            drugName: 'Paracetamol 500mg',
            lotNumber: 'LOT2024-156',
            receivedQuantity: '1000',
            unitPrice: '0.25',
          },
        ],
      } as any,
      created_at: now,
      updated_at: now,
    },

    // 6. Expiring Drugs Report
    {
      name: 'hospital-expiring-drugs-report-starter',
      display_name: 'รายงานยาใกล้หมดอายุ / Expiring Drugs Report',
      description: 'เทมเพลตรายงานยาที่ใกล้หมดอายุ',
      category: 'hospital-inventory',
      type: 'handlebars',
      page_size: 'A4',
      orientation: 'landscape',
      version: '1.0.0',
      is_active: true,
      is_default: false,
      is_template_starter: true,
      usage_count: 0,
      template_data: {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [30, 50, 30, 50],
        content: [
          {
            text: 'รายงานยาใกล้หมดอายุ / Expiring Drugs Report',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: [
                ['ลำดับ', 'ชื่อยา', 'Lot No.', 'วันหมดอายุ', 'เหลือเวลา'],
                '{{#each items}}',
                [
                  '{{add @index 1}}',
                  '{{drugName}}',
                  '{{lotNumber}}',
                  '{{expiryDate}}',
                  '{{daysRemaining}} วัน',
                ],
                '{{/each}}',
              ],
            },
          },
        ],
        styles: {
          header: { fontSize: 16, bold: true, font: 'Sarabun' },
        },
        defaultStyle: { font: 'Sarabun' },
      } as any,
      sample_data: {
        items: [
          {
            drugName: 'Ceftriaxone 1g',
            lotNumber: 'LOT2024-045',
            expiryDate: '31/03/2568',
            daysRemaining: '70',
          },
        ],
      } as any,
      created_at: now,
      updated_at: now,
    },
  ];

  // Insert all hospital inventory template starters
  await knex('pdf_templates').insert(templateStarters);

  console.log(
    `✅ Successfully seeded ${templateStarters.length} hospital inventory PDF template starters`,
  );
}
