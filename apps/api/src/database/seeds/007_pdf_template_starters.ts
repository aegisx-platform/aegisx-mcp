import type { Knex } from 'knex';

/**
 * PDF Template Starters Seed
 *
 * Creates 10 Thai business PDF template starters for users to choose from
 * when creating new templates.
 */
export async function seed(knex: Knex): Promise<void> {
  // Only insert if no template starters exist yet
  const existing = await knex('pdf_templates')
    .where('is_template_starter', true)
    .first();

  if (existing) {
    console.log('✅ Template starters already exist, skipping seed');
    return;
  }

  console.log('🌱 Seeding PDF template starters...');

  const now = new Date().toISOString();

  const templateStarters = [
    // 1. Thai Invoice Template
    {
      name: 'thai-invoice-starter',
      display_name: 'ใบแจ้งหนี้ / Tax Invoice',
      description:
        'เทมเพลตใบแจ้งหนี้ภาษีไทย รองรับภาษาไทยและอังกฤษ พร้อมรายละเอียดครบถ้วน',
      category: 'invoice',
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
            text: 'ใบแจ้งหนี้ / Tax Invoice',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'ผู้ออกใบแจ้งหนี้ / Seller', style: 'subheader' },
                  { text: '{{company.name}}', style: 'normal' },
                  {
                    text: 'เลขประจำตัวผู้เสียภาษี: {{company.taxId}}',
                    style: 'small',
                  },
                ],
              },
              {
                width: '50%',
                stack: [
                  {
                    text: 'วันที่ / Date: {{invoiceDate}}',
                    alignment: 'right',
                  },
                  {
                    text: 'เลขที่ / No.: {{invoiceNumber}}',
                    alignment: 'right',
                  },
                ],
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'รายการ / Description', style: 'tableHeader' },
                  { text: 'จำนวน / Qty', style: 'tableHeader' },
                  { text: 'ราคา / Price', style: 'tableHeader' },
                  { text: 'รวม / Amount', style: 'tableHeader' },
                ],
                '{{#each items}}',
                [
                  { text: '{{description}}' },
                  { text: '{{quantity}}', alignment: 'center' },
                  { text: '{{price}}', alignment: 'right' },
                  { text: '{{total}}', alignment: 'right' },
                ],
                '{{/each}}',
              ],
            },
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, font: 'Sarabun' },
          subheader: { fontSize: 12, bold: true, font: 'Sarabun' },
          normal: { fontSize: 10, font: 'Sarabun' },
          small: { fontSize: 8, font: 'Sarabun' },
          tableHeader: {
            bold: true,
            fontSize: 10,
            font: 'Sarabun',
            fillColor: '#eeeeee',
          },
        },
        defaultStyle: {
          font: 'Sarabun',
        },
      },
      sample_data: {
        company: {
          name: 'บริษัท ตัวอย่าง จำกัด',
          taxId: '0-1234-56789-01-2',
        },
        invoiceDate: '15/01/2567',
        invoiceNumber: 'INV-2024-001',
        items: [
          {
            description: 'สินค้าตัวอย่าง A',
            quantity: 2,
            price: '1,000.00',
            total: '2,000.00',
          },
          {
            description: 'สินค้าตัวอย่าง B',
            quantity: 1,
            price: '5,000.00',
            total: '5,000.00',
          },
        ],
      },
      created_at: now,
      updated_at: now,
    },

    // 2. Thai Receipt Template
    {
      name: 'thai-receipt-starter',
      display_name: 'ใบเสร็จรับเงิน / Receipt',
      description:
        'เทมเพลตใบเสร็จรับเงินไทย เหมาะสำหรับร้านค้าและธุรกิจขนาดเล็ก',
      category: 'receipt',
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
            text: 'ใบเสร็จรับเงิน',
            style: 'header',
            alignment: 'center',
          },
          {
            text: 'Receipt',
            style: 'subheader',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              { text: 'เลขที่ / No.: {{receiptNumber}}', width: '50%' },
              {
                text: 'วันที่ / Date: {{date}}',
                width: '50%',
                alignment: 'right',
              },
            ],
            margin: [0, 0, 0, 10],
          },
          {
            text: 'ได้รับเงินจาก / Received from: {{customerName}}',
            margin: [0, 0, 0, 10],
          },
          {
            text: 'จำนวนเงิน / Amount: {{amount}} บาท',
            margin: [0, 0, 0, 10],
          },
          {
            text: 'เพื่อชำระค่า / For payment of: {{description}}',
            margin: [0, 0, 0, 20],
          },
        ],
        styles: {
          header: { fontSize: 20, bold: true, font: 'Sarabun' },
          subheader: { fontSize: 14, font: 'Sarabun' },
          normal: { fontSize: 12, font: 'Sarabun' },
        },
        defaultStyle: {
          font: 'Sarabun',
        },
      },
      sample_data: {
        receiptNumber: 'REC-2024-001',
        date: '15/01/2567',
        customerName: 'คุณสมชาย ใจดี',
        amount: '5,000.00',
        description: 'สินค้าและบริการ',
      },
      created_at: now,
      updated_at: now,
    },

    // 3. Thai Quotation Template
    {
      name: 'thai-quotation-starter',
      display_name: 'ใบเสนอราคา / Quotation',
      description:
        'เทมเพลตใบเสนอราคาสำหรับธุรกิจไทย แสดงรายละเอียดสินค้าและบริการ',
      category: 'quotation',
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
            text: 'ใบเสนอราคา / Quotation',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'เรียน / To: {{customer.name}}' },
                  { text: 'บริษัท / Company: {{customer.company}}' },
                ],
              },
              {
                width: '50%',
                stack: [
                  {
                    text: 'เลขที่ / No.: {{quotationNumber}}',
                    alignment: 'right',
                  },
                  { text: 'วันที่ / Date: {{date}}', alignment: 'right' },
                  {
                    text: 'ใช้ได้ถึง / Valid until: {{validUntil}}',
                    alignment: 'right',
                  },
                ],
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            text: 'รายการสินค้า/บริการ / Items',
            style: 'subheader',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                ['รายการ', 'จำนวน', 'ราคา/หน่วย', 'รวม'],
                '{{#each items}}',
                [
                  '{{description}}',
                  '{{quantity}}',
                  '{{unitPrice}}',
                  '{{total}}',
                ],
                '{{/each}}',
                [
                  {
                    text: 'รวมทั้งสิ้น / Grand Total',
                    colSpan: 3,
                    alignment: 'right',
                  },
                  {},
                  {},
                  '{{grandTotal}}',
                ],
              ],
            },
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, font: 'Sarabun' },
          subheader: { fontSize: 14, bold: true, font: 'Sarabun' },
          normal: { fontSize: 12, font: 'Sarabun' },
        },
        defaultStyle: {
          font: 'Sarabun',
        },
      },
      sample_data: {
        customer: {
          name: 'คุณสมชาย',
          company: 'บริษัท ลูกค้า จำกัด',
        },
        quotationNumber: 'QT-2024-001',
        date: '15/01/2567',
        validUntil: '31/01/2567',
        items: [
          {
            description: 'บริการพัฒนาเว็บไซต์',
            quantity: '1',
            unitPrice: '50,000',
            total: '50,000',
          },
        ],
        grandTotal: '50,000.00 บาท',
      },
      created_at: now,
      updated_at: now,
    },

    // 4. Thai Certificate Template
    {
      name: 'thai-certificate-starter',
      display_name: 'ใบประกาศนียบัตร / Certificate',
      description:
        'เทมเพลตใบประกาศนียบัตรภาษาไทย เหมาะสำหรับการอบรม สัมมนา และรางวัล',
      category: 'certificate',
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
        pageMargins: [60, 80, 60, 80],
        content: [
          {
            text: 'ใบประกาศนียบัตร',
            style: 'header',
            alignment: 'center',
            margin: [0, 40, 0, 10],
          },
          {
            text: 'Certificate of Achievement',
            style: 'subheader',
            alignment: 'center',
            margin: [0, 0, 0, 40],
          },
          {
            text: 'ขอมอบให้แก่ / Presented to',
            style: 'normal',
            alignment: 'center',
            margin: [0, 0, 0, 10],
          },
          {
            text: '{{recipientName}}',
            style: 'name',
            alignment: 'center',
            margin: [0, 0, 0, 30],
          },
          {
            text: 'ในการเข้าร่วม / For participation in',
            style: 'normal',
            alignment: 'center',
            margin: [0, 0, 0, 10],
          },
          {
            text: '{{eventName}}',
            style: 'event',
            alignment: 'center',
            margin: [0, 0, 0, 10],
          },
          {
            text: 'วันที่ / Date: {{date}}',
            style: 'normal',
            alignment: 'center',
            margin: [0, 0, 0, 40],
          },
        ],
        styles: {
          header: {
            fontSize: 32,
            bold: true,
            font: 'Sarabun',
            color: '#1a237e',
          },
          subheader: { fontSize: 18, font: 'Sarabun', color: '#283593' },
          name: {
            fontSize: 28,
            bold: true,
            font: 'Sarabun',
            decoration: 'underline',
          },
          event: { fontSize: 20, bold: true, font: 'Sarabun' },
          normal: { fontSize: 14, font: 'Sarabun' },
        },
        defaultStyle: {
          font: 'Sarabun',
        },
      },
      sample_data: {
        recipientName: 'นายสมชาย ใจดี',
        eventName: 'การอบรมเชิงปฏิบัติการพัฒนาทักษะดิจิทัล',
        date: '15 มกราคม 2567',
      },
      created_at: now,
      updated_at: now,
    },

    // 5. Thai Delivery Note Template
    {
      name: 'thai-delivery-note-starter',
      display_name: 'ใบส่งของ / Delivery Note',
      description:
        'เทมเพลตใบส่งของสำหรับธุรกิจไทย รองรับการบันทึกรายละเอียดการส่งสินค้า',
      category: 'delivery',
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
            text: 'ใบส่งของ / Delivery Note',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'ผู้ส่ง / From:', style: 'label' },
                  { text: '{{sender.name}}' },
                  { text: '{{sender.address}}' },
                ],
              },
              {
                width: '50%',
                stack: [
                  {
                    text: 'เลขที่ / No.: {{deliveryNumber}}',
                    alignment: 'right',
                  },
                  { text: 'วันที่ / Date: {{date}}', alignment: 'right' },
                ],
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            text: 'ผู้รับ / To:',
            style: 'label',
            margin: [0, 0, 0, 5],
          },
          {
            stack: [
              { text: '{{receiver.name}}' },
              { text: '{{receiver.address}}' },
              { text: 'โทร / Tel: {{receiver.phone}}' },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto'],
              body: [
                ['ลำดับ', 'รายการ', 'จำนวน'],
                '{{#each items}}',
                ['{{@index}}', '{{description}}', '{{quantity}}'],
                '{{/each}}',
              ],
            },
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, font: 'Sarabun' },
          label: { fontSize: 12, bold: true, font: 'Sarabun' },
          normal: { fontSize: 12, font: 'Sarabun' },
        },
        defaultStyle: {
          font: 'Sarabun',
        },
      },
      sample_data: {
        sender: {
          name: 'บริษัท ผู้ส่ง จำกัด',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
        },
        deliveryNumber: 'DN-2024-001',
        date: '15/01/2567',
        receiver: {
          name: 'บริษัท ผู้รับ จำกัด',
          address: '456 ถนนพระราม 9 กรุงเทพฯ 10320',
          phone: '02-123-4567',
        },
        items: [
          { description: 'สินค้า A', quantity: '10' },
          { description: 'สินค้า B', quantity: '5' },
        ],
      },
      created_at: now,
      updated_at: now,
    },

    // 6. Thai Purchase Order Template
    {
      name: 'thai-purchase-order-starter',
      display_name: 'ใบสั่งซื้อ / Purchase Order',
      description: 'เทมเพลตใบสั่งซื้อสินค้าและบริการสำหรับธุรกิจไทย',
      category: 'purchase-order',
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
            text: 'ใบสั่งซื้อ / Purchase Order',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'ถึง / To:', style: 'label' },
                  { text: '{{vendor.name}}' },
                  { text: '{{vendor.address}}' },
                ],
              },
              {
                width: '50%',
                stack: [
                  { text: 'เลขที่ / PO No.: {{poNumber}}', alignment: 'right' },
                  { text: 'วันที่ / Date: {{date}}', alignment: 'right' },
                  {
                    text: 'กำหนดส่ง / Delivery: {{deliveryDate}}',
                    alignment: 'right',
                  },
                ],
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: [
                ['ลำดับ', 'รายการ', 'จำนวน', 'ราคา/หน่วย', 'รวม'],
                '{{#each items}}',
                [
                  '{{@index}}',
                  '{{description}}',
                  '{{quantity}}',
                  '{{unitPrice}}',
                  '{{total}}',
                ],
                '{{/each}}',
                [
                  {
                    text: 'รวมทั้งสิ้น / Total',
                    colSpan: 4,
                    alignment: 'right',
                  },
                  {},
                  {},
                  {},
                  '{{totalAmount}}',
                ],
              ],
            },
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, font: 'Sarabun' },
          label: { fontSize: 12, bold: true, font: 'Sarabun' },
          normal: { fontSize: 12, font: 'Sarabun' },
        },
        defaultStyle: {
          font: 'Sarabun',
        },
      },
      sample_data: {
        vendor: {
          name: 'บริษัท ผู้จำหน่าย จำกัด',
          address: '789 ถนนเพชรบุรี กรุงเทพฯ 10400',
        },
        poNumber: 'PO-2024-001',
        date: '15/01/2567',
        deliveryDate: '22/01/2567',
        items: [
          {
            description: 'สินค้า X',
            quantity: '100',
            unitPrice: '50',
            total: '5,000',
          },
          {
            description: 'สินค้า Y',
            quantity: '50',
            unitPrice: '100',
            total: '5,000',
          },
        ],
        totalAmount: '10,000 บาท',
      },
      created_at: now,
      updated_at: now,
    },

    // 7. Thai Business Letter Template
    {
      name: 'thai-business-letter-starter',
      display_name: 'จดหมายธุรกิจ / Business Letter',
      description:
        'เทมเพลตจดหมายธุรกิจภาษาไทย เหมาะสำหรับการติดต่อราชการและธุรกิจ',
      category: 'letter',
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
        pageMargins: [60, 80, 60, 80],
        content: [
          {
            text: '{{company.name}}',
            style: 'companyName',
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          {
            text: '{{company.address}}',
            style: 'small',
            alignment: 'center',
            margin: [0, 0, 0, 30],
          },
          {
            text: 'ที่ {{referenceNumber}}',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'วันที่ {{date}}',
            margin: [0, 0, 0, 20],
          },
          {
            text: 'เรื่อง {{subject}}',
            margin: [0, 0, 0, 10],
          },
          {
            text: 'เรียน {{recipient}}',
            margin: [0, 0, 0, 20],
          },
          {
            text: '{{body}}',
            alignment: 'justify',
            margin: [0, 0, 0, 20],
          },
          {
            text: 'จึงเรียนมาเพื่อโปรดทราบ',
            margin: [0, 0, 0, 40],
          },
          {
            columns: [
              { width: '50%', text: '' },
              {
                width: '50%',
                stack: [
                  { text: 'ขอแสดงความนับถือ', alignment: 'center' },
                  { text: '\n\n\n' },
                  { text: '({{signatory.name}})', alignment: 'center' },
                  {
                    text: '{{signatory.position}}',
                    alignment: 'center',
                    style: 'small',
                  },
                ],
              },
            ],
          },
        ],
        styles: {
          companyName: { fontSize: 16, bold: true, font: 'Sarabun' },
          small: { fontSize: 10, font: 'Sarabun' },
          normal: { fontSize: 12, font: 'Sarabun' },
        },
        defaultStyle: {
          font: 'Sarabun',
          fontSize: 12,
        },
      },
      sample_data: {
        company: {
          name: 'บริษัท ตัวอย่าง จำกัด',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
        },
        referenceNumber: 'BL/2024/001',
        date: '15 มกราคม 2567',
        subject: 'ขอความอนุเคราะห์',
        recipient: 'ผู้อำนวยการ',
        body: 'ด้วยบริษัทฯ มีความประสงค์ขอความอนุเคราะห์ในเรื่องดังกล่าว โดยมีรายละเอียดตามเอกสารแนบท้ายนี้',
        signatory: {
          name: 'นายสมชาย ใจดี',
          position: 'ผู้จัดการทั่วไป',
        },
      },
      created_at: now,
      updated_at: now,
    },

    // 8. Thai Payment Voucher Template
    {
      name: 'thai-payment-voucher-starter',
      display_name: 'ใบสำคัญจ่าย / Payment Voucher',
      description: 'เทมเพลตใบสำคัญจ่ายสำหรับบันทึกการจ่ายเงิน',
      category: 'payment',
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
            text: 'ใบสำคัญจ่าย / Payment Voucher',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              { text: 'เลขที่ / No.: {{voucherNumber}}', width: '50%' },
              {
                text: 'วันที่ / Date: {{date}}',
                width: '50%',
                alignment: 'right',
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            text: 'จ่ายให้ / Pay to: {{payee}}',
            margin: [0, 0, 0, 10],
          },
          {
            text: 'จำนวนเงิน / Amount: {{amount}} บาท',
            margin: [0, 0, 0, 10],
          },
          {
            text: 'ตัวอักษร / Amount in words: {{amountInWords}}',
            margin: [0, 0, 0, 10],
          },
          {
            text: 'เพื่อชำระค่า / For payment of: {{description}}',
            margin: [0, 0, 0, 20],
          },
          {
            table: {
              widths: ['*', '*', '*'],
              body: [
                [
                  {
                    text: 'ผู้จ่ายเงิน\n\n\n_______________',
                    alignment: 'center',
                  },
                  {
                    text: 'ผู้อนุมัติ\n\n\n_______________',
                    alignment: 'center',
                  },
                  {
                    text: 'ผู้รับเงิน\n\n\n_______________',
                    alignment: 'center',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 40, 0, 0],
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, font: 'Sarabun' },
          normal: { fontSize: 12, font: 'Sarabun' },
        },
        defaultStyle: {
          font: 'Sarabun',
        },
      },
      sample_data: {
        voucherNumber: 'PV-2024-001',
        date: '15/01/2567',
        payee: 'บริษัท ผู้รับเงิน จำกัด',
        amount: '10,000.00',
        amountInWords: 'หนึ่งหมื่นบาทถ้วน',
        description: 'ค่าสินค้าและบริการ',
      },
      created_at: now,
      updated_at: now,
    },

    // 9. Thai Monthly Report Template
    {
      name: 'thai-monthly-report-starter',
      display_name: 'รายงานประจำเดือน / Monthly Report',
      description: 'เทมเพลตรายงานประจำเดือนสำหรับธุรกิจไทย',
      category: 'report',
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
            text: 'รายงานประจำเดือน',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'Monthly Report',
            style: 'subheader',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            text: 'เดือน / Month: {{month}}',
            style: 'normal',
            margin: [0, 0, 0, 10],
          },
          {
            text: 'แผนก / Department: {{department}}',
            style: 'normal',
            margin: [0, 0, 0, 20],
          },
          {
            text: 'สรุปผลการดำเนินงาน / Executive Summary',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          {
            text: '{{summary}}',
            margin: [0, 0, 0, 20],
          },
          {
            text: 'ตัวชี้วัดหลัก / Key Performance Indicators',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto'],
              body: [
                ['รายการ', 'เป้าหมาย', 'ผลลัพธ์'],
                '{{#each kpis}}',
                ['{{name}}', '{{target}}', '{{actual}}'],
                '{{/each}}',
              ],
            },
          },
        ],
        styles: {
          header: { fontSize: 20, bold: true, font: 'Sarabun' },
          subheader: { fontSize: 14, font: 'Sarabun' },
          sectionHeader: { fontSize: 14, bold: true, font: 'Sarabun' },
          normal: { fontSize: 12, font: 'Sarabun' },
        },
        defaultStyle: {
          font: 'Sarabun',
        },
      },
      sample_data: {
        month: 'มกราคม 2567',
        department: 'ฝ่ายขาย',
        summary:
          'ผลการดำเนินงานในเดือนนี้เป็นไปตามเป้าหมาย มียอดขายเพิ่มขึ้น 10% เมื่อเทียบกับเดือนที่แล้ว',
        kpis: [
          { name: 'ยอดขาย', target: '1,000,000', actual: '1,100,000' },
          { name: 'ลูกค้าใหม่', target: '50', actual: '55' },
        ],
      },
      created_at: now,
      updated_at: now,
    },

    // 10. Thai Tax Invoice (Full) Template
    {
      name: 'thai-tax-invoice-full-starter',
      display_name: 'ใบกำกับภาษีเต็มรูปแบบ / Full Tax Invoice',
      description: 'เทมเพลตใบกำกับภาษีเต็มรูปแบบตามมาตรฐานกรมสรรพากร',
      category: 'invoice',
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
            text: 'ใบกำกับภาษี / Tax Invoice',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'ต้นฉบับ / Original',
            style: 'subheader',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'ผู้ประกอบการ / Seller', style: 'label' },
                  { text: '{{seller.name}}', style: 'bold' },
                  { text: '{{seller.address}}' },
                  { text: 'เลขประจำตัวผู้เสียภาษี: {{seller.taxId}}' },
                  { text: 'สำนักงานใหญ่/สาขาที่: {{seller.branchId}}' },
                ],
              },
              {
                width: '50%',
                stack: [
                  {
                    text: 'เลขที่ / No.: {{invoiceNumber}}',
                    alignment: 'right',
                  },
                  {
                    text: 'วันที่ / Date: {{invoiceDate}}',
                    alignment: 'right',
                  },
                ],
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            text: 'ผู้รับสินค้า / Buyer',
            style: 'label',
            margin: [0, 0, 0, 5],
          },
          {
            stack: [
              { text: '{{buyer.name}}', style: 'bold' },
              { text: '{{buyer.address}}' },
              { text: 'เลขประจำตัวผู้เสียภาษี: {{buyer.taxId}}' },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: [
                [
                  'ลำดับ',
                  'รายการสินค้า/บริการ',
                  'จำนวน',
                  'ราคา/หน่วย',
                  'จำนวนเงิน',
                ],
                '{{#each items}}',
                [
                  '{{@index}}',
                  '{{description}}',
                  '{{quantity}}',
                  '{{unitPrice}}',
                  '{{amount}}',
                ],
                '{{/each}}',
                [{ text: '', colSpan: 4 }, {}, {}, {}, ''],
                [
                  {
                    text: 'รวมเป็นเงิน / Subtotal',
                    colSpan: 4,
                    alignment: 'right',
                  },
                  {},
                  {},
                  {},
                  '{{subtotal}}',
                ],
                [
                  {
                    text: 'ภาษีมูลค่าเพิ่ม 7% / VAT 7%',
                    colSpan: 4,
                    alignment: 'right',
                  },
                  {},
                  {},
                  {},
                  '{{vat}}',
                ],
                [
                  {
                    text: 'รวมเป็นเงินทั้งสิ้น / Grand Total',
                    colSpan: 4,
                    alignment: 'right',
                    style: 'bold',
                  },
                  {},
                  {},
                  {},
                  { text: '{{grandTotal}}', style: 'bold' },
                ],
              ],
            },
          },
          {
            text: 'จำนวนเงินรวมทั้งสิ้น (ตัวอักษร): {{grandTotalInWords}}',
            margin: [0, 10, 0, 0],
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, font: 'Sarabun' },
          subheader: { fontSize: 12, font: 'Sarabun' },
          label: {
            fontSize: 10,
            bold: true,
            font: 'Sarabun',
            color: '#666666',
          },
          bold: { bold: true, font: 'Sarabun' },
          normal: { fontSize: 10, font: 'Sarabun' },
        },
        defaultStyle: {
          font: 'Sarabun',
          fontSize: 10,
        },
      },
      sample_data: {
        seller: {
          name: 'บริษัท ผู้ขาย จำกัด',
          address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
          taxId: '0-1234-56789-01-2',
          branchId: '00000 (สำนักงานใหญ่)',
        },
        invoiceNumber: 'TI-2024-00001',
        invoiceDate: '15 มกราคม 2567',
        buyer: {
          name: 'บริษัท ผู้ซื้อ จำกัด',
          address: '456 ถนนพระราม 9 แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ 10250',
          taxId: '0-9876-54321-09-8',
        },
        items: [
          {
            description: 'บริการพัฒนาซอฟต์แวร์',
            quantity: '1',
            unitPrice: '50,000.00',
            amount: '50,000.00',
          },
          {
            description: 'บริการบำรุงรักษา 1 ปี',
            quantity: '1',
            unitPrice: '10,000.00',
            amount: '10,000.00',
          },
        ],
        subtotal: '60,000.00',
        vat: '4,200.00',
        grandTotal: '64,200.00',
        grandTotalInWords: 'หกหมื่นสี่พันสองร้อยบาทถ้วน',
      },
      created_at: now,
      updated_at: now,
    },
  ];

  // Insert all template starters
  await knex('pdf_templates').insert(templateStarters);

  console.log(
    `✅ Successfully seeded ${templateStarters.length} PDF template starters`,
  );
}
