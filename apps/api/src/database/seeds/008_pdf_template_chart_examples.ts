import type { Knex } from 'knex';

/**
 * PDF Template Chart Examples Seed
 *
 * Creates example templates that demonstrate chart integration
 */
export async function seed(knex: Knex): Promise<void> {
  // Check if chart examples already exist
  const existing = await knex('pdf_templates')
    .where('name', 'like', '%-chart-example')
    .first();

  if (existing) {
    console.log('✅ Chart example templates already exist, skipping seed');
    return;
  }

  console.log('🌱 Seeding PDF template chart examples...');

  const now = new Date().toISOString();

  const chartExamples = [
    // 1. Monthly Report with Charts
    {
      name: 'monthly-report-chart-example',
      display_name: 'รายงานประจำเดือน (มีกราฟ) / Monthly Report with Charts',
      description:
        'ตัวอย่างรายงานประจำเดือนที่มีกราฟแสดงข้อมูล - แสดงวิธีใช้ charts ใน PDF template',
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
          // Header
          {
            text: 'รายงานประจำเดือน {{month}}',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'Monthly Report {{month}}',
            style: 'subheader',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            text: 'แผนก / Department: {{department}}',
            margin: [0, 0, 0, 30],
          },

          // Summary Cards
          {
            text: 'สรุปข้อมูล / Summary',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: 'มูลค่ารวม',
                        style: 'cardLabel',
                        alignment: 'center',
                      },
                      {
                        text: 'Total Value',
                        style: 'cardLabelEn',
                        alignment: 'center',
                      },
                      {
                        text: '{{summary.totalValue}} บาท',
                        style: 'cardValue',
                        alignment: 'center',
                      },
                    ],
                    fillColor: '#e3f2fd',
                  },
                  {
                    stack: [
                      {
                        text: 'รายการทั้งหมด',
                        style: 'cardLabel',
                        alignment: 'center',
                      },
                      {
                        text: 'Total Items',
                        style: 'cardLabelEn',
                        alignment: 'center',
                      },
                      {
                        text: '{{summary.totalItems}} รายการ',
                        style: 'cardValue',
                        alignment: 'center',
                      },
                    ],
                    fillColor: '#e8f5e9',
                  },
                  {
                    stack: [
                      {
                        text: 'ต้องตรวจสอบ',
                        style: 'cardLabel',
                        alignment: 'center',
                      },
                      {
                        text: 'Needs Review',
                        style: 'cardLabelEn',
                        alignment: 'center',
                      },
                      {
                        text: '{{summary.needsReview}} รายการ',
                        style: 'cardValue',
                        alignment: 'center',
                      },
                    ],
                    fillColor: '#fff3e0',
                  },
                  {
                    stack: [
                      {
                        text: 'งบประมาณคงเหลือ',
                        style: 'cardLabel',
                        alignment: 'center',
                      },
                      {
                        text: 'Budget Left',
                        style: 'cardLabelEn',
                        alignment: 'center',
                      },
                      {
                        text: '{{summary.budgetLeft}} บาท',
                        style: 'cardValue',
                        alignment: 'center',
                      },
                    ],
                    fillColor: '#f3e5f5',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 30],
          },

          // Chart Section 1: Bar Chart
          {
            text: 'การกระจายตามหมวดหมู่ / Distribution by Category',
            style: 'chartTitle',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'แสดงมูลค่าแยกตามหมวดหมู่ในรูปแบบแท่งกราฟ',
            style: 'chartDescription',
            margin: [0, 0, 0, 10],
          },
          {
            text: '⚠️ หมายเหตุ: กราฟนี้จะถูกแทนที่ด้วยข้อมูลจริงเมื่อ render PDF',
            style: 'note',
            margin: [0, 0, 0, 5],
          },
          {
            text: '📊 การใช้งาน: ส่ง base64 image ผ่าน {{chart1}} ใน renderData',
            style: 'note',
            margin: [0, 0, 0, 10],
          },
          {
            image: '{{chart1}}',
            width: 500,
            height: 300,
            alignment: 'center',
            margin: [0, 0, 0, 30],
          },

          // Chart Section 2: Line Chart
          {
            text: 'แนวโน้มรายเดือน / Monthly Trend',
            style: 'chartTitle',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'แสดงแนวโน้มการเปลี่ยนแปลงในรูปแบบเส้นกราฟ',
            style: 'chartDescription',
            margin: [0, 0, 0, 10],
          },
          {
            image: '{{chart2}}',
            width: 500,
            height: 300,
            alignment: 'center',
            margin: [0, 0, 0, 30],
          },

          // Detail Table
          {
            text: 'รายละเอียด / Details',
            style: 'sectionHeader',
            pageBreak: 'before',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: [
                [
                  {
                    text: 'ลำดับ',
                    style: 'tableHeader',
                    alignment: 'center',
                  },
                  { text: 'รายการ', style: 'tableHeader' },
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
                  { text: '{{@index}}', alignment: 'center' },
                  '{{name}}',
                  { text: '{{quantity}}', alignment: 'center' },
                  { text: '{{unit}}', alignment: 'center' },
                  { text: '{{value}}', alignment: 'right' },
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
                  {
                    text: '',
                    border: [false, false, false, false],
                  },
                ],
                [
                  {
                    text: 'รวมทั้งสิ้น / Grand Total',
                    colSpan: 4,
                    alignment: 'right',
                    style: 'totalLabel',
                  },
                  {},
                  {},
                  {},
                  {
                    text: '{{summary.totalValue}} บาท',
                    style: 'totalValue',
                    alignment: 'right',
                  },
                ],
              ],
            },
            margin: [0, 0, 0, 20],
          },

          // Chart Section 3: Pie Chart
          {
            text: 'สัดส่วนการใช้งบประมาณ / Budget Distribution',
            style: 'chartTitle',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'แสดงสัดส่วนการใช้งบประมาณในรูปแบบวงกลม',
            style: 'chartDescription',
            margin: [0, 0, 0, 10],
          },
          {
            image: '{{chart3}}',
            width: 400,
            height: 400,
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },

          // Footer
          {
            text: '\n\nจัดทำโดย / Prepared by: {{preparedBy}}',
            margin: [0, 20, 0, 0],
          },
          {
            text: 'วันที่ / Date: {{preparedDate}}',
            margin: [0, 5, 0, 0],
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
            fontSize: 14,
            font: 'Sarabun',
            color: '#424242',
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            font: 'Sarabun',
            color: '#1a237e',
            background: '#e3f2fd',
          },
          chartTitle: {
            fontSize: 13,
            bold: true,
            font: 'Sarabun',
            color: '#1565c0',
          },
          chartDescription: {
            fontSize: 10,
            font: 'Sarabun',
            color: '#666666',
            italics: true,
          },
          note: {
            fontSize: 9,
            font: 'Sarabun',
            color: '#f57c00',
            italics: true,
          },
          cardLabel: {
            fontSize: 10,
            bold: true,
            font: 'Sarabun',
            color: '#424242',
          },
          cardLabelEn: {
            fontSize: 8,
            font: 'Sarabun',
            color: '#757575',
          },
          cardValue: {
            fontSize: 16,
            bold: true,
            font: 'Sarabun',
            color: '#1a237e',
            margin: [0, 5, 0, 0],
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            font: 'Sarabun',
            fillColor: '#e3f2fd',
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
        },
        defaultStyle: {
          font: 'Sarabun',
          fontSize: 10,
        },
      },
      sample_data: {
        month: 'มกราคม 2568',
        department: 'ฝ่ายเภสัชกรรม / Pharmacy Department',
        summary: {
          totalValue: '1,500,000',
          totalItems: '245',
          needsReview: '15',
          budgetLeft: '850,000',
        },
        chart1:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Placeholder
        chart2:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Placeholder
        chart3:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Placeholder
        items: [
          {
            name: 'Paracetamol 500mg',
            quantity: '1,200',
            unit: 'เม็ด',
            value: '12,000',
          },
          {
            name: 'Amoxicillin 500mg',
            quantity: '800',
            unit: 'แคปซูล',
            value: '24,000',
          },
          {
            name: 'Omeprazole 20mg',
            quantity: '500',
            unit: 'แคปซูล',
            value: '15,000',
          },
          {
            name: 'Metformin 500mg',
            quantity: '1,500',
            unit: 'เม็ด',
            value: '22,500',
          },
          {
            name: 'Amlodipine 5mg',
            quantity: '900',
            unit: 'เม็ด',
            value: '18,000',
          },
        ],
        preparedBy: 'ระบบอัตโนมัติ / Automated System',
        preparedDate: '15 มกราคม 2568',
      },
      created_at: now,
      updated_at: now,
    },

    // 2. Inventory Report with Charts
    {
      name: 'inventory-report-chart-example',
      display_name: 'รายงานยาคงคลัง (มีกราฟ) / Inventory Report with Charts',
      description:
        'ตัวอย่างรายงานยาคงคลังที่แสดงกราฟและตาราง - เหมาะสำหรับรายงานสต็อก',
      category: 'inventory',
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
            text: 'รายงานยาคงคลัง',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'Inventory Stock Report',
            style: 'subheader',
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'ประจำเดือน {{month}}',
            style: 'subheader',
            alignment: 'center',
            margin: [0, 0, 0, 30],
          },

          // Summary Section
          {
            text: '📊 สรุปภาพรวม / Overview',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          {
            columns: [
              {
                width: '33%',
                stack: [
                  { text: 'มูลค่ายาคงคลังทั้งหมด', style: 'summaryLabel' },
                  { text: '{{totalValue}} บาท', style: 'summaryValue' },
                ],
              },
              {
                width: '33%',
                stack: [
                  { text: 'จำนวนรายการยา', style: 'summaryLabel' },
                  {
                    text: '{{totalItems}} รายการ',
                    style: 'summaryValue',
                  },
                ],
              },
              {
                width: '34%',
                stack: [
                  { text: 'ยาใกล้หมดอายุ (30 วัน)', style: 'summaryLabel' },
                  {
                    text: '{{nearExpiry}} รายการ',
                    style: 'summaryValueWarning',
                  },
                ],
              },
            ],
            margin: [0, 0, 0, 30],
          },

          // Chart 1: Stock Value by Location
          {
            text: '📍 มูลค่ายาคงคลังแยกตามคลัง',
            style: 'chartTitle',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'Stock Value by Location',
            style: 'chartTitleEn',
            margin: [0, 0, 0, 10],
          },
          {
            image: '{{stockByLocationChart}}',
            width: 500,
            height: 300,
            alignment: 'center',
            margin: [0, 0, 0, 30],
          },

          // Chart 2: Top 10 Drugs by Value
          {
            text: '💊 10 รายการยาที่มีมูลค่าสูงสุด',
            style: 'chartTitle',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'Top 10 Drugs by Value',
            style: 'chartTitleEn',
            margin: [0, 0, 0, 10],
          },
          {
            image: '{{top10DrugsChart}}',
            width: 500,
            height: 350,
            alignment: 'center',
            margin: [0, 0, 0, 30],
          },

          // Detail Table
          {
            text: '📋 รายละเอียดยาคงคลัง / Stock Details',
            style: 'sectionHeader',
            pageBreak: 'before',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'ชื่อยา', style: 'tableHeader' },
                  {
                    text: 'คลัง',
                    style: 'tableHeader',
                    alignment: 'center',
                  },
                  {
                    text: 'จำนวน',
                    style: 'tableHeader',
                    alignment: 'right',
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
                '{{#each stockItems}}',
                [
                  '{{drugName}}',
                  { text: '{{location}}', alignment: 'center' },
                  { text: '{{quantity}}', alignment: 'right' },
                  { text: '{{unit}}', alignment: 'center' },
                  { text: '{{value}}', alignment: 'right' },
                ],
                '{{/each}}',
              ],
            },
          },

          // Chart 3: Near Expiry Distribution
          {
            text: '⚠️ การกระจายยาใกล้หมดอายุ',
            style: 'chartTitle',
            margin: [0, 30, 0, 5],
          },
          {
            text: 'Near Expiry Distribution',
            style: 'chartTitleEn',
            margin: [0, 0, 0, 10],
          },
          {
            image: '{{nearExpiryChart}}',
            width: 400,
            height: 400,
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },

          // Footer
          {
            text: '\nจัดทำโดย: {{preparedBy}}',
            margin: [0, 20, 0, 0],
          },
          {
            text: 'วันที่จัดทำ: {{preparedDate}}',
          },
        ],
        styles: {
          header: {
            fontSize: 22,
            bold: true,
            font: 'Sarabun',
            color: '#1a237e',
          },
          subheader: {
            fontSize: 14,
            font: 'Sarabun',
            color: '#424242',
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            font: 'Sarabun',
            color: '#1976d2',
            background: '#e3f2fd',
            margin: [0, 10, 0, 10],
          },
          chartTitle: {
            fontSize: 13,
            bold: true,
            font: 'Sarabun',
            color: '#1565c0',
          },
          chartTitleEn: {
            fontSize: 11,
            font: 'Sarabun',
            color: '#757575',
          },
          summaryLabel: {
            fontSize: 10,
            font: 'Sarabun',
            color: '#666666',
          },
          summaryValue: {
            fontSize: 18,
            bold: true,
            font: 'Sarabun',
            color: '#1a237e',
            margin: [0, 5, 0, 0],
          },
          summaryValueWarning: {
            fontSize: 18,
            bold: true,
            font: 'Sarabun',
            color: '#d32f2f',
            margin: [0, 5, 0, 0],
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            font: 'Sarabun',
            fillColor: '#bbdefb',
          },
        },
        defaultStyle: {
          font: 'Sarabun',
          fontSize: 10,
        },
      },
      sample_data: {
        month: 'มกราคม 2568',
        totalValue: '1,650,000',
        totalItems: '156',
        nearExpiry: '12',
        stockByLocationChart:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        top10DrugsChart:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        nearExpiryChart:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        stockItems: [
          {
            drugName: 'Paracetamol 500mg',
            location: 'คลังหลัก',
            quantity: '5,000',
            unit: 'เม็ด',
            value: '50,000',
          },
          {
            drugName: 'Amoxicillin 500mg',
            location: 'คลังหลัก',
            quantity: '3,000',
            unit: 'แคปซูล',
            value: '90,000',
          },
          {
            drugName: 'Omeprazole 20mg',
            location: 'คลังย่อย A',
            quantity: '2,000',
            unit: 'แคปซูล',
            value: '60,000',
          },
        ],
        preparedBy: 'ระบบจัดการคลังยา',
        preparedDate: '15 มกราคม 2568 10:30 น.',
      },
      created_at: now,
      updated_at: now,
    },
  ];

  // Insert chart example templates
  await knex('pdf_templates').insert(chartExamples);

  console.log(
    `✅ Successfully seeded ${chartExamples.length} PDF template chart examples`,
  );
}
