import type { Knex } from 'knex';

/**
 * Update PDF Template Starters
 *
 * Updates existing template starters to be more relevant
 * to the actual system (Inventory & Budget management)
 *
 * Updates:
 * 1. thai-invoice-starter → inventory-requisition-starter
 * 2. thai-receipt-starter → drug-dispensing-receipt-starter
 * 3. thai-quotation-starter → budget-request-form-starter
 * 4. thai-monthly-report-starter → inventory-monthly-report-starter (with charts)
 *
 * Keeps unchanged:
 * - thai-certificate-starter (useful as-is)
 * - thai-delivery-note-starter (useful for drug transfers)
 * - thai-purchase-order-starter (useful for procurement)
 * - thai-business-letter-starter (useful for official communications)
 * - thai-payment-voucher-starter (useful for financial operations)
 * - thai-tax-invoice-full-starter (useful for official invoices)
 */

export async function seed(knex: Knex): Promise<void> {
  console.log('🔄 Updating PDF template starters...');

  const now = new Date().toISOString();

  // ============================================================================
  // DELETE OLD TEMPLATES THAT WILL BE REPLACED
  // ============================================================================
  await knex('pdf_templates')
    .whereIn('name', [
      'thai-invoice-starter',
      'thai-receipt-starter',
      'thai-quotation-starter',
      'thai-monthly-report-starter',
    ])
    .andWhere('is_template_starter', true)
    .del();

  console.log('   ✅ Deleted outdated template starters');

  // ============================================================================
  // INSERT NEW RELEVANT TEMPLATE STARTERS
  // ============================================================================
  await knex('pdf_templates').insert([
    // ========================================================================
    // 1. INVENTORY REQUISITION (แทน Invoice)
    // ========================================================================
    {
      name: 'inventory-requisition-starter',
      display_name: 'ใบเบิกยา / Inventory Requisition',
      description:
        'เทมเพลตใบเบิกยาจากคลัง รองรับการบันทึกรายการยาที่เบิกและหน่วยงานที่เบิก',
      category: 'inventory',
      type: 'requisition',
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
            text: 'ใบเบิกยา',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'Inventory Requisition',
            style: 'subheader',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'เลขที่ใบเบิก / Requisition No.', style: 'label' },
                  { text: '{{requisitionNumber}}', style: 'value' },
                  {
                    text: 'วันที่ / Date:',
                    style: 'label',
                    margin: [0, 5, 0, 0],
                  },
                  { text: '{{formatDate date "DD/MM/YYYY"}}', style: 'value' },
                ],
              },
              {
                width: '50%',
                stack: [
                  {
                    text: 'หน่วยงานที่เบิก / Department',
                    style: 'label',
                    alignment: 'right',
                  },
                  {
                    text: '{{department}}',
                    style: 'value',
                    alignment: 'right',
                  },
                  {
                    text: 'ผู้เบิก / Requester:',
                    style: 'label',
                    alignment: 'right',
                    margin: [0, 5, 0, 0],
                  },
                  {
                    text: '{{requester}}',
                    style: 'value',
                    alignment: 'right',
                  },
                ],
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            text: 'รายการยาที่เบิก / Items Requested',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'ลำดับ', style: 'tableHeader', alignment: 'center' },
                  { text: 'ชื่อยา', style: 'tableHeader' },
                  { text: 'จำนวน', style: 'tableHeader', alignment: 'center' },
                  { text: 'หน่วย', style: 'tableHeader', alignment: 'center' },
                  { text: 'หมายเหตุ', style: 'tableHeader' },
                ],
                '{{#each items}}',
                [
                  { text: '{{add @index 1}}', alignment: 'center' },
                  '{{drugName}}',
                  { text: '{{quantity}}', alignment: 'center' },
                  { text: '{{unit}}', alignment: 'center' },
                  '{{notes}}',
                ],
                '{{/each}}',
              ],
            },
            margin: [0, 0, 0, 20],
          },
          {
            text: 'หมายเหตุ / Notes:',
            style: 'label',
            margin: [0, 10, 0, 5],
          },
          {
            text: '{{notes}}',
            margin: [0, 0, 0, 30],
          },
          {
            columns: [
              {
                width: '33%',
                stack: [
                  {
                    text: 'ผู้เบิก / Requester',
                    alignment: 'center',
                    style: 'label',
                  },
                  { text: '\n\n\n', fontSize: 10 },
                  {
                    text: '___________________',
                    alignment: 'center',
                  },
                  {
                    text: '({{requester}})',
                    alignment: 'center',
                    style: 'small',
                  },
                ],
              },
              {
                width: '34%',
                stack: [
                  {
                    text: 'ผู้จ่าย / Dispenser',
                    alignment: 'center',
                    style: 'label',
                  },
                  { text: '\n\n\n', fontSize: 10 },
                  {
                    text: '___________________',
                    alignment: 'center',
                  },
                  {
                    text: '({{dispenser}})',
                    alignment: 'center',
                    style: 'small',
                  },
                ],
              },
              {
                width: '33%',
                stack: [
                  {
                    text: 'ผู้อนุมัติ / Approver',
                    alignment: 'center',
                    style: 'label',
                  },
                  { text: '\n\n\n', fontSize: 10 },
                  {
                    text: '___________________',
                    alignment: 'center',
                  },
                  {
                    text: '({{approver}})',
                    alignment: 'center',
                    style: 'small',
                  },
                ],
              },
            ],
          },
        ],
        styles: {
          header: {
            fontSize: 20,
            bold: true,
            font: 'Sarabun',
            color: '#1a237e',
          },
          subheader: {
            fontSize: 12,
            font: 'Sarabun',
            color: '#424242',
          },
          sectionHeader: {
            fontSize: 13,
            bold: true,
            font: 'Sarabun',
            color: '#1565c0',
          },
          label: {
            fontSize: 10,
            bold: true,
            font: 'Sarabun',
            color: '#424242',
          },
          value: {
            fontSize: 11,
            font: 'Sarabun',
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            font: 'Sarabun',
            fillColor: '#bbdefb',
            color: '#1a237e',
          },
          small: {
            fontSize: 9,
            font: 'Sarabun',
          },
        },
        defaultStyle: {
          font: 'Sarabun',
          fontSize: 10,
        },
      },
      sample_data: {
        requisitionNumber: 'REQ-2025-001',
        date: new Date().toISOString(),
        department: 'ห้องฉุกเฉิน / Emergency Room',
        requester: 'พยาบาล สมใจ ใจดี',
        dispenser: '',
        approver: '',
        items: [
          {
            drugName: 'Paracetamol 500mg',
            quantity: '100',
            unit: 'เม็ด',
            notes: 'สำหรับผู้ป่วยไข้',
          },
          {
            drugName: 'Omeprazole 20mg',
            quantity: '50',
            unit: 'แคปซูล',
            notes: 'ผู้ป่วย GI',
          },
        ],
        notes: 'เบิกเพื่อใช้ในแผนกฉุกเฉิน เร่งด่วน',
      },
      created_at: now,
      updated_at: now,
    },

    // ========================================================================
    // 2. DRUG DISPENSING RECEIPT (แทน Receipt)
    // ========================================================================
    {
      name: 'drug-dispensing-receipt-starter',
      display_name: 'ใบจ่ายยา / Drug Dispensing Receipt',
      description: 'เทมเพลตใบจ่ายยาให้ผู้ป่วย รองรับข้อมูลผู้ป่วยและรายการยา',
      category: 'inventory',
      type: 'dispensing',
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
            text: 'ใบจ่ายยา',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'Drug Dispensing Receipt',
            style: 'subheader',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'เลขที่ใบจ่าย / Receipt No.', style: 'label' },
                  { text: '{{receiptNumber}}', style: 'value' },
                ],
              },
              {
                width: '50%',
                stack: [
                  {
                    text: 'วันที่ / Date:',
                    style: 'label',
                    alignment: 'right',
                  },
                  {
                    text: '{{formatDate date "DD/MM/YYYY HH:mm"}}',
                    style: 'value',
                    alignment: 'right',
                  },
                ],
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            text: 'ข้อมูลผู้ป่วย / Patient Information',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              widths: ['30%', '70%'],
              body: [
                [
                  { text: 'HN:', style: 'label' },
                  { text: '{{patient.hn}}', style: 'value' },
                ],
                [
                  { text: 'ชื่อ-นามสกุล / Name:', style: 'label' },
                  { text: '{{patient.name}}', style: 'value' },
                ],
                [
                  { text: 'แพทย์ผู้สั่งยา / Prescriber:', style: 'label' },
                  { text: '{{prescriber}}', style: 'value' },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },
          {
            text: 'รายการยาที่จ่าย / Dispensed Medications',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', '*'],
              body: [
                [
                  { text: 'ลำดับ', style: 'tableHeader', alignment: 'center' },
                  { text: 'ชื่อยา', style: 'tableHeader' },
                  { text: 'จำนวน', style: 'tableHeader', alignment: 'center' },
                  { text: 'หน่วย', style: 'tableHeader', alignment: 'center' },
                  { text: 'วิธีใช้', style: 'tableHeader' },
                ],
                '{{#each medications}}',
                [
                  { text: '{{add @index 1}}', alignment: 'center' },
                  '{{name}}',
                  { text: '{{quantity}}', alignment: 'center' },
                  { text: '{{unit}}', alignment: 'center' },
                  '{{instruction}}',
                ],
                '{{/each}}',
              ],
            },
            margin: [0, 0, 0, 20],
          },
          {
            text: 'คำแนะนำ / Instructions:',
            style: 'label',
            margin: [0, 10, 0, 5],
          },
          {
            text: '{{instructions}}',
            margin: [0, 0, 0, 30],
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  {
                    text: 'เภสัชกรผู้จ่ายยา / Pharmacist',
                    style: 'label',
                  },
                  { text: '\n\n', fontSize: 10 },
                  {
                    text: '___________________________',
                  },
                  {
                    text: '({{pharmacist}})',
                    style: 'small',
                  },
                ],
              },
              {
                width: '50%',
                stack: [
                  {
                    text: 'ผู้รับยา / Recipient',
                    style: 'label',
                    alignment: 'right',
                  },
                  { text: '\n\n', fontSize: 10 },
                  {
                    text: '___________________________',
                    alignment: 'right',
                  },
                  {
                    text: '({{recipient}})',
                    style: 'small',
                    alignment: 'right',
                  },
                ],
              },
            ],
          },
        ],
        styles: {
          header: {
            fontSize: 20,
            bold: true,
            font: 'Sarabun',
            color: '#1a237e',
          },
          subheader: {
            fontSize: 12,
            font: 'Sarabun',
            color: '#424242',
          },
          sectionHeader: {
            fontSize: 13,
            bold: true,
            font: 'Sarabun',
            color: '#1565c0',
          },
          label: {
            fontSize: 10,
            bold: true,
            font: 'Sarabun',
            color: '#424242',
          },
          value: {
            fontSize: 11,
            font: 'Sarabun',
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            font: 'Sarabun',
            fillColor: '#bbdefb',
            color: '#1a237e',
          },
          small: {
            fontSize: 9,
            font: 'Sarabun',
          },
        },
        defaultStyle: {
          font: 'Sarabun',
          fontSize: 10,
        },
      },
      sample_data: {
        receiptNumber: 'DIS-2025-001',
        date: new Date().toISOString(),
        patient: {
          hn: 'HN-123456',
          name: 'นายสมชาย ใจดี',
        },
        prescriber: 'นพ. สมศักดิ์ แพทย์ดี',
        medications: [
          {
            name: 'Amoxicillin 500mg',
            quantity: '21',
            unit: 'แคปซูล',
            instruction: 'รับประทาน 1 แคปซูล วันละ 3 ครั้ง หลังอาหาร',
          },
          {
            name: 'Paracetamol 500mg',
            quantity: '10',
            unit: 'เม็ด',
            instruction: 'รับประทานเมื่อมีไข้ วันละไม่เกิน 4 ครั้ง',
          },
        ],
        instructions:
          'รับประทานยาให้ครบตามแพทย์สั่ง หากมีอาการผิดปกติให้พบแพทย์',
        pharmacist: 'ภก. สมหญิง เภสัชกร',
        recipient: 'นายสมชาย ใจดี',
      },
      created_at: now,
      updated_at: now,
    },

    // ========================================================================
    // 3. BUDGET REQUEST FORM (แทน Quotation)
    // ========================================================================
    {
      name: 'budget-request-form-starter',
      display_name: 'ใบขอจัดสรรงบประมาณ / Budget Request Form',
      description:
        'เทมเพลตใบขอจัดสรรงบประมาณ รองรับการระบุรายละเอียดการใช้งบและเหตุผล',
      category: 'budget',
      type: 'request',
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
            text: 'ใบขอจัดสรรงบประมาณ',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'Budget Request Form',
            style: 'subheader',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'เลขที่คำขอ / Request No.', style: 'label' },
                  { text: '{{requestNumber}}', style: 'value' },
                  {
                    text: 'วันที่ยื่นคำขอ / Date:',
                    style: 'label',
                    margin: [0, 5, 0, 0],
                  },
                  {
                    text: '{{formatDate requestDate "DD/MM/YYYY"}}',
                    style: 'value',
                  },
                ],
              },
              {
                width: '50%',
                stack: [
                  {
                    text: 'ปีงบประมาณ / Fiscal Year',
                    style: 'label',
                    alignment: 'right',
                  },
                  {
                    text: '{{fiscalYear}}',
                    style: 'value',
                    alignment: 'right',
                  },
                  {
                    text: 'หน่วยงาน / Department:',
                    style: 'label',
                    alignment: 'right',
                    margin: [0, 5, 0, 0],
                  },
                  {
                    text: '{{department}}',
                    style: 'value',
                    alignment: 'right',
                  },
                ],
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            text: 'รายละเอียดการขอจัดสรร / Request Details',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              widths: ['30%', '70%'],
              body: [
                [
                  { text: 'ประเภทงบประมาณ:', style: 'label' },
                  { text: '{{budgetType}}', style: 'value' },
                ],
                [
                  { text: 'วัตถุประสงค์:', style: 'label' },
                  { text: '{{purpose}}', style: 'value' },
                ],
                [
                  { text: 'ผู้ขอ:', style: 'label' },
                  { text: '{{requester}}', style: 'value' },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20],
          },
          {
            text: 'รายการที่ขอจัดสรร / Requested Items',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'ลำดับ', style: 'tableHeader', alignment: 'center' },
                  { text: 'รายการ', style: 'tableHeader' },
                  {
                    text: 'จำนวน',
                    style: 'tableHeader',
                    alignment: 'center',
                  },
                  {
                    text: 'ราคา/หน่วย',
                    style: 'tableHeader',
                    alignment: 'right',
                  },
                  {
                    text: 'รวม (บาท)',
                    style: 'tableHeader',
                    alignment: 'right',
                  },
                ],
                '{{#each items}}',
                [
                  { text: '{{add @index 1}}', alignment: 'center' },
                  '{{description}}',
                  { text: '{{quantity}}', alignment: 'center' },
                  {
                    text: '{{formatCurrency unitPrice}}',
                    alignment: 'right',
                  },
                  { text: '{{formatCurrency total}}', alignment: 'right' },
                ],
                '{{/each}}',
                [
                  {
                    text: '',
                    colSpan: 4,
                    border: [false, false, false, false],
                  },
                  {},
                  {},
                  {},
                  { text: '', border: [false, false, false, false] },
                ],
                [
                  {
                    text: 'รวมเป็นเงินทั้งสิ้น / Grand Total',
                    colSpan: 4,
                    alignment: 'right',
                    style: 'totalLabel',
                  },
                  {},
                  {},
                  {},
                  {
                    text: '{{formatCurrency totalAmount}} บาท',
                    style: 'totalValue',
                    alignment: 'right',
                  },
                ],
              ],
            },
            margin: [0, 0, 0, 20],
          },
          {
            text: 'เหตุผลความจำเป็น / Justification:',
            style: 'label',
            margin: [0, 10, 0, 5],
          },
          {
            text: '{{justification}}',
            margin: [0, 0, 0, 30],
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  {
                    text: 'ผู้ขอจัดสรร / Requester',
                    style: 'label',
                  },
                  { text: '\n\n', fontSize: 10 },
                  {
                    text: '___________________________',
                  },
                  {
                    text: '({{requester}})',
                    style: 'small',
                  },
                  {
                    text: 'วันที่: ___________________',
                    style: 'small',
                    margin: [0, 5, 0, 0],
                  },
                ],
              },
              {
                width: '50%',
                stack: [
                  {
                    text: 'ผู้อนุมัติ / Approver',
                    style: 'label',
                    alignment: 'right',
                  },
                  { text: '\n\n', fontSize: 10 },
                  {
                    text: '___________________________',
                    alignment: 'right',
                  },
                  {
                    text: '({{approver}})',
                    style: 'small',
                    alignment: 'right',
                  },
                  {
                    text: 'วันที่: ___________________',
                    style: 'small',
                    alignment: 'right',
                    margin: [0, 5, 0, 0],
                  },
                ],
              },
            ],
          },
        ],
        styles: {
          header: {
            fontSize: 20,
            bold: true,
            font: 'Sarabun',
            color: '#1a237e',
          },
          subheader: {
            fontSize: 12,
            font: 'Sarabun',
            color: '#424242',
          },
          sectionHeader: {
            fontSize: 13,
            bold: true,
            font: 'Sarabun',
            color: '#1565c0',
          },
          label: {
            fontSize: 10,
            bold: true,
            font: 'Sarabun',
            color: '#424242',
          },
          value: {
            fontSize: 11,
            font: 'Sarabun',
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            font: 'Sarabun',
            fillColor: '#bbdefb',
            color: '#1a237e',
          },
          totalLabel: {
            bold: true,
            fontSize: 11,
            font: 'Sarabun',
          },
          totalValue: {
            bold: true,
            fontSize: 12,
            font: 'Sarabun',
            color: '#1a237e',
          },
          small: {
            fontSize: 9,
            font: 'Sarabun',
          },
        },
        defaultStyle: {
          font: 'Sarabun',
          fontSize: 10,
        },
      },
      sample_data: {
        requestNumber: 'BR-2025-001',
        requestDate: new Date().toISOString(),
        fiscalYear: '2568',
        department: 'ฝ่ายเภสัชกรรม',
        budgetType: 'งบดำเนินการ',
        purpose: 'จัดซื้อยาเพื่อเติมในคลัง',
        requester: 'หัวหน้าฝ่ายเภสัชกรรม',
        approver: 'ผู้อำนวยการโรงพยาบาล',
        items: [
          {
            description: 'Paracetamol 500mg',
            quantity: '10,000',
            unitPrice: 10,
            total: 100000,
          },
          {
            description: 'Amoxicillin 500mg',
            quantity: '5,000',
            unitPrice: 30,
            total: 150000,
          },
          {
            description: 'Omeprazole 20mg',
            quantity: '3,000',
            unitPrice: 30,
            total: 90000,
          },
        ],
        totalAmount: 340000,
        justification:
          'ยาในคลังมีปริมาณต่ำกว่าระดับขั้นต่ำ (Minimum Stock Level) จำเป็นต้องเติมเพื่อให้เพียงพอต่อความต้องการของผู้ป่วย โดยเฉพาะ Paracetamol และ Amoxicillin ที่มีอัตราการใช้สูง',
      },
      created_at: now,
      updated_at: now,
    },

    // ========================================================================
    // 4. INVENTORY MONTHLY REPORT WITH CHARTS
    // (เป็น Template Starter ที่มีกราฟ - เหมาะสำหรับ duplicate และแก้ไข)
    // ========================================================================
    {
      name: 'inventory-monthly-report-chart-starter',
      display_name:
        'รายงานยาประจำเดือน (มีกราฟ) / Monthly Inventory Report with Charts',
      description:
        'Template Starter สำหรับรายงานยาประจำเดือนที่มี Charts - สามารถ duplicate และปรับแต่งได้',
      category: 'inventory',
      type: 'report',
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
            text: 'รายงานยาประจำเดือน {{month}}',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'Monthly Inventory Report {{month}}',
            style: 'headerEn',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            text: 'แผนก: {{department}}',
            style: 'normal',
            margin: [0, 0, 0, 30],
          },

          // Summary Cards
          {
            text: '📊 สรุปภาพรวม',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          {
            columns: [
              {
                width: '25%',
                stack: [
                  {
                    text: 'มูลค่ารวม',
                    style: 'summaryLabel',
                    alignment: 'center',
                  },
                  {
                    text: '{{formatCurrency totalValue}} บาท',
                    style: 'summaryValue',
                    alignment: 'center',
                  },
                ],
              },
              {
                width: '25%',
                stack: [
                  {
                    text: 'รายการทั้งหมด',
                    style: 'summaryLabel',
                    alignment: 'center',
                  },
                  {
                    text: '{{totalItems}} รายการ',
                    style: 'summaryValue',
                    alignment: 'center',
                  },
                ],
              },
              {
                width: '25%',
                stack: [
                  {
                    text: 'ใกล้หมดอายุ',
                    style: 'summaryLabel',
                    alignment: 'center',
                  },
                  {
                    text: '{{nearExpiry}} รายการ',
                    style: 'summaryValue',
                    alignment: 'center',
                  },
                ],
              },
              {
                width: '25%',
                stack: [
                  {
                    text: 'ต่ำกว่า Min',
                    style: 'summaryLabel',
                    alignment: 'center',
                  },
                  {
                    text: '{{belowMin}} รายการ',
                    style: 'summaryValue',
                    alignment: 'center',
                  },
                ],
              },
            ],
            margin: [0, 0, 0, 30],
          },

          // Chart Placeholder
          '{{#if chart1}}',
          {
            text: '📍 มูลค่ายาคงคลังแยกตามคลัง',
            style: 'chartTitle',
            margin: [0, 0, 0, 10],
          },
          {
            image: '{{chart1}}',
            width: 500,
            height: 300,
            alignment: 'center',
            margin: [0, 0, 0, 30],
          },
          '{{/if}}',

          // Detail Table
          {
            text: '📋 รายละเอียด',
            style: 'sectionHeader',
            pageBreak: 'before',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'ชื่อยา', style: 'tableHeader' },
                  {
                    text: 'จำนวน',
                    style: 'tableHeader',
                    alignment: 'center',
                  },
                  {
                    text: 'หน่วย',
                    style: 'tableHeader',
                    alignment: 'center',
                  },
                  {
                    text: 'มูลค่า (บาท)',
                    style: 'tableHeader',
                    alignment: 'right',
                  },
                ],
                '{{#each items}}',
                [
                  '{{name}}',
                  { text: '{{quantity}}', alignment: 'center' },
                  { text: '{{unit}}', alignment: 'center' },
                  { text: '{{formatCurrency value}}', alignment: 'right' },
                ],
                '{{/each}}',
              ],
            },
          },
          {
            text: '\nจัดทำโดย: {{preparedBy}}',
            style: 'footer',
            margin: [0, 20, 0, 0],
          },
          {
            text: 'วันที่: {{formatDate preparedDate "DD/MM/YYYY"}}',
            style: 'footer',
          },
        ],
        styles: {
          header: {
            fontSize: 20,
            bold: true,
            font: 'Sarabun',
            color: '#1a237e',
          },
          headerEn: {
            fontSize: 12,
            font: 'Sarabun',
            color: '#757575',
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            font: 'Sarabun',
            color: '#1565c0',
          },
          chartTitle: {
            fontSize: 13,
            bold: true,
            font: 'Sarabun',
            color: '#1976d2',
          },
          summaryLabel: {
            fontSize: 10,
            font: 'Sarabun',
            color: '#666666',
          },
          summaryValue: {
            fontSize: 16,
            bold: true,
            font: 'Sarabun',
            color: '#1a237e',
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            font: 'Sarabun',
            fillColor: '#bbdefb',
          },
          normal: {
            fontSize: 11,
            font: 'Sarabun',
          },
          footer: {
            fontSize: 10,
            font: 'Sarabun',
            color: '#757575',
          },
        },
        defaultStyle: {
          font: 'Sarabun',
          fontSize: 10,
        },
      },
      sample_data: {
        month: 'มกราคม 2568',
        department: 'ฝ่ายเภสัชกรรม',
        totalValue: 1500000,
        totalItems: 245,
        nearExpiry: 15,
        belowMin: 8,
        chart1:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        items: [
          {
            name: 'Paracetamol 500mg',
            quantity: '5,000',
            unit: 'เม็ด',
            value: 50000,
          },
          {
            name: 'Amoxicillin 500mg',
            quantity: '3,000',
            unit: 'แคปซูล',
            value: 90000,
          },
        ],
        preparedBy: 'ระบบจัดการคลังยา',
        preparedDate: new Date().toISOString(),
      },
      created_at: now,
      updated_at: now,
    },
  ]);

  console.log('   ✅ Inserted new relevant template starters');
  console.log('✅ Template starters updated successfully');
  console.log(
    '\n📝 Summary: Replaced 4 generic templates with 4 domain-specific templates',
  );
  console.log('   - Inventory Requisition (ใบเบิกยา)');
  console.log('   - Drug Dispensing Receipt (ใบจ่ายยา)');
  console.log('   - Budget Request Form (ใบขอจัดสรรงบประมาณ)');
  console.log('   - Monthly Inventory Report with Charts (รายงานยาประจำเดือน)');
}
