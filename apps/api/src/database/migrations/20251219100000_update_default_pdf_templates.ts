import type { Knex } from 'knex';

/**
 * Migration: Update Default PDF Templates
 *
 * Replaces the default templates with Thai-language templates
 * tailored for the actual system (Inventory & Budget management)
 *
 * Changes:
 * 1. Replace 'simple-report' with 'inventory-stock-report'
 * 2. Replace 'invoice-template' with 'budget-allocation-report'
 * 3. Add Thai language support (Sarabun font)
 * 4. Add chart placeholders for visual analytics
 * 5. Use realistic sample data from actual domains
 */

export async function up(knex: Knex): Promise<void> {
  console.log('🔄 Updating default PDF templates...');

  // ============================================================================
  // 1. DELETE OLD DEFAULT TEMPLATES
  // ============================================================================
  await knex('pdf_templates')
    .whereIn('name', ['simple-report', 'invoice-template'])
    .del();

  console.log('   ✅ Deleted old default templates');

  // ============================================================================
  // 2. INSERT NEW INVENTORY & BUDGET TEMPLATES
  // ============================================================================
  const now = new Date().toISOString();

  await knex('pdf_templates').insert([
    // ========================================================================
    // TEMPLATE 1: INVENTORY STOCK REPORT
    // ========================================================================
    {
      name: 'inventory-stock-report',
      display_name: 'รายงานยาคงคลัง / Inventory Stock Report',
      description:
        'รายงานยาคงคลังพร้อมกราฟแสดงมูลค่าและสถานะ - Inventory stock report with charts showing value and status',
      category: 'inventory',
      type: 'report',
      page_size: 'A4',
      orientation: 'portrait',
      version: '1.0.0',
      is_active: true,
      is_default: true,
      is_template_starter: false,
      usage_count: 0,
      template_data: JSON.stringify({
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [40, 60, 40, 60],
        content: [
          // Header
          {
            text: 'รายงานยาคงคลัง',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'Inventory Stock Report',
            style: 'headerEn',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                width: '50%',
                text: 'ประจำเดือน: {{month}}',
                style: 'normal',
              },
              {
                width: '50%',
                text: 'แผนก: {{department}}',
                style: 'normal',
                alignment: 'right',
              },
            ],
            margin: [0, 0, 0, 30],
          },

          // Summary Cards
          {
            text: '📊 สรุปภาพรวม / Summary',
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
                        style: 'summaryLabel',
                        alignment: 'center',
                      },
                      {
                        text: '{{formatCurrency totalValue}} บาท',
                        style: 'summaryValue',
                        alignment: 'center',
                      },
                    ],
                    fillColor: '#e3f2fd',
                  },
                  {
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
                    fillColor: '#e8f5e9',
                  },
                  {
                    stack: [
                      {
                        text: 'ยาใกล้หมดอายุ',
                        style: 'summaryLabel',
                        alignment: 'center',
                      },
                      {
                        text: '{{nearExpiry}} รายการ',
                        style: 'summaryValueWarning',
                        alignment: 'center',
                      },
                    ],
                    fillColor: '#fff3e0',
                  },
                  {
                    stack: [
                      {
                        text: 'ยาต่ำกว่า Min',
                        style: 'summaryLabel',
                        alignment: 'center',
                      },
                      {
                        text: '{{belowMin}} รายการ',
                        style: 'summaryValueDanger',
                        alignment: 'center',
                      },
                    ],
                    fillColor: '#ffebee',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 30],
          },

          // Chart Placeholder 1: Stock Value by Location
          '{{#if stockByLocationChart}}',
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
          '{{/if}}',

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
              widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
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
                    text: 'ราคา/หน่วย',
                    style: 'tableHeader',
                    alignment: 'right',
                  },
                  {
                    text: 'มูลค่า (บาท)',
                    style: 'tableHeader',
                    alignment: 'right',
                  },
                ],
                '{{#each items}}',
                [
                  '{{drugName}}',
                  { text: '{{location}}', alignment: 'center' },
                  { text: '{{formatNumber quantity}}', alignment: 'right' },
                  { text: '{{unit}}', alignment: 'center' },
                  {
                    text: '{{formatCurrency unitPrice}}',
                    alignment: 'right',
                  },
                  { text: '{{formatCurrency totalValue}}', alignment: 'right' },
                ],
                '{{/each}}',
                [
                  {
                    text: '',
                    colSpan: 5,
                    border: [false, false, false, false],
                  },
                  {},
                  {},
                  {},
                  {},
                  { text: '', border: [false, false, false, false] },
                ],
                [
                  {
                    text: 'รวมทั้งสิ้น / Grand Total',
                    colSpan: 5,
                    alignment: 'right',
                    style: 'totalLabel',
                  },
                  {},
                  {},
                  {},
                  {},
                  {
                    text: '{{formatCurrency totalValue}} บาท',
                    style: 'totalValue',
                    alignment: 'right',
                  },
                ],
              ],
            },
          },

          // Chart Placeholder 2: Near Expiry Distribution
          '{{#if nearExpiryChart}}',
          {
            text: '\n⚠️ การกระจายยาใกล้หมดอายุ',
            style: 'chartTitle',
            margin: [0, 20, 0, 5],
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
          '{{/if}}',

          // Footer
          {
            text: '\nจัดทำโดย: {{preparedBy}}',
            style: 'footer',
            margin: [0, 20, 0, 0],
          },
          {
            text: 'วันที่จัดทำ: {{formatDate preparedDate "DD/MM/YYYY HH:mm"}}',
            style: 'footer',
          },
        ],
        styles: {
          header: {
            fontSize: 22,
            bold: true,
            font: 'Sarabun',
            color: '#1a237e',
          },
          headerEn: {
            fontSize: 14,
            font: 'Sarabun',
            color: '#424242',
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            font: 'Sarabun',
            color: '#1976d2',
            fillColor: '#e3f2fd',
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
            color: '#424242',
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
            color: '#f57c00',
            margin: [0, 5, 0, 0],
          },
          summaryValueDanger: {
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
      }),
      sample_data: {
        month: 'มกราคม 2568',
        department: 'ฝ่ายเภสัชกรรม',
        totalValue: 1650000,
        totalItems: 156,
        nearExpiry: 12,
        belowMin: 8,
        stockByLocationChart:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        nearExpiryChart:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        items: [
          {
            drugName: 'Paracetamol 500mg',
            location: 'คลังหลัก',
            quantity: 5000,
            unit: 'เม็ด',
            unitPrice: 10,
            totalValue: 50000,
          },
          {
            drugName: 'Amoxicillin 500mg',
            location: 'คลังหลัก',
            quantity: 3000,
            unit: 'แคปซูล',
            unitPrice: 30,
            totalValue: 90000,
          },
          {
            drugName: 'Omeprazole 20mg',
            location: 'คลังย่อย A',
            quantity: 2000,
            unit: 'แคปซูล',
            unitPrice: 30,
            totalValue: 60000,
          },
          {
            drugName: 'Metformin 500mg',
            location: 'คลังย่อย A',
            quantity: 4000,
            unit: 'เม็ด',
            unitPrice: 20,
            totalValue: 80000,
          },
          {
            drugName: 'Amlodipine 5mg',
            location: 'คลังย่อย B',
            quantity: 2500,
            unit: 'เม็ด',
            unitPrice: 20,
            totalValue: 50000,
          },
        ],
        preparedBy: 'ระบบจัดการคลังยา',
        preparedDate: new Date().toISOString(),
      },
      schema: {
        type: 'object',
        required: ['month', 'department', 'items'],
        properties: {
          month: { type: 'string', description: 'ชื่อเดือน' },
          department: { type: 'string', description: 'ชื่อแผนก' },
          totalValue: { type: 'number', description: 'มูลค่ารวม' },
          totalItems: { type: 'number', description: 'จำนวนรายการ' },
          nearExpiry: { type: 'number', description: 'ยาใกล้หมดอายุ' },
          belowMin: { type: 'number', description: 'ยาต่ำกว่า Min' },
          stockByLocationChart: {
            type: 'string',
            description: 'Base64 chart image',
          },
          nearExpiryChart: {
            type: 'string',
            description: 'Base64 chart image',
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                drugName: { type: 'string' },
                location: { type: 'string' },
                quantity: { type: 'number' },
                unit: { type: 'string' },
                unitPrice: { type: 'number' },
                totalValue: { type: 'number' },
              },
            },
          },
          preparedBy: { type: 'string' },
          preparedDate: { type: 'string', format: 'date-time' },
        },
      },
      created_at: now,
      updated_at: now,
    },

    // ========================================================================
    // TEMPLATE 2: BUDGET ALLOCATION REPORT
    // ========================================================================
    {
      name: 'budget-allocation-report',
      display_name: 'รายงานจัดสรรงบประมาณ / Budget Allocation Report',
      description:
        'รายงานการจัดสรรและการใช้งบประมาณพร้อมกราฟแสดงสัดส่วน - Budget allocation and usage report with distribution charts',
      category: 'budget',
      type: 'report',
      page_size: 'A4',
      orientation: 'portrait',
      version: '1.0.0',
      is_active: true,
      is_default: true,
      is_template_starter: false,
      usage_count: 0,
      template_data: JSON.stringify({
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [40, 60, 40, 60],
        content: [
          // Header
          {
            text: 'รายงานจัดสรรงบประมาณ',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'Budget Allocation Report',
            style: 'headerEn',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'ปีงบประมาณ: {{fiscalYear}}', style: 'normal' },
                  { text: 'แผนก: {{department}}', style: 'normal' },
                ],
              },
              {
                width: '50%',
                stack: [
                  {
                    text: 'ประเภท: {{budgetType}}',
                    style: 'normal',
                    alignment: 'right',
                  },
                  {
                    text: 'สถานะ: {{status}}',
                    style: 'normal',
                    alignment: 'right',
                  },
                ],
              },
            ],
            margin: [0, 0, 0, 30],
          },

          // Summary Section
          {
            text: '💰 สรุปงบประมาณ / Budget Summary',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              widths: ['33%', '34%', '33%'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: 'งบประมาณที่ได้รับ',
                        style: 'summaryLabel',
                        alignment: 'center',
                      },
                      {
                        text: '{{formatCurrency totalAllocated}} บาท',
                        style: 'summaryValue',
                        alignment: 'center',
                      },
                    ],
                    fillColor: '#e3f2fd',
                  },
                  {
                    stack: [
                      {
                        text: 'งบประมาณที่ใช้ไป',
                        style: 'summaryLabel',
                        alignment: 'center',
                      },
                      {
                        text: '{{formatCurrency totalSpent}} บาท',
                        style: 'summaryValueWarning',
                        alignment: 'center',
                      },
                    ],
                    fillColor: '#fff3e0',
                  },
                  {
                    stack: [
                      {
                        text: 'งบประมาณคงเหลือ',
                        style: 'summaryLabel',
                        alignment: 'center',
                      },
                      {
                        text: '{{formatCurrency remaining}} บาท',
                        style: 'summaryValueSuccess',
                        alignment: 'center',
                      },
                    ],
                    fillColor: '#e8f5e9',
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: 'เปอร์เซ็นต์การใช้งบประมาณ',
                        style: 'summaryLabel',
                        alignment: 'center',
                      },
                      {
                        text: '{{usagePercentage}}%',
                        style: 'summaryValueLarge',
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

          // Chart 1: Budget Distribution
          '{{#if budgetDistributionChart}}',
          {
            text: '📊 สัดส่วนการจัดสรรงบประมาณ',
            style: 'chartTitle',
            margin: [0, 0, 0, 5],
          },
          {
            text: 'Budget Distribution by Category',
            style: 'chartTitleEn',
            margin: [0, 0, 0, 10],
          },
          {
            image: '{{budgetDistributionChart}}',
            width: 400,
            height: 400,
            alignment: 'center',
            margin: [0, 0, 0, 30],
          },
          '{{/if}}',

          // Detail Table
          {
            text: '📋 รายละเอียดการจัดสรรงบประมาณ / Allocation Details',
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
                  { text: 'หมวดหมู่', style: 'tableHeader' },
                  {
                    text: 'งบที่ได้รับ',
                    style: 'tableHeader',
                    alignment: 'right',
                  },
                  {
                    text: 'งบที่ใช้',
                    style: 'tableHeader',
                    alignment: 'right',
                  },
                  {
                    text: 'คงเหลือ',
                    style: 'tableHeader',
                    alignment: 'right',
                  },
                  {
                    text: '% การใช้',
                    style: 'tableHeader',
                    alignment: 'right',
                  },
                ],
                '{{#each allocations}}',
                [
                  '{{category}}',
                  {
                    text: '{{formatCurrency allocated}}',
                    alignment: 'right',
                  },
                  { text: '{{formatCurrency spent}}', alignment: 'right' },
                  {
                    text: '{{formatCurrency remaining}}',
                    alignment: 'right',
                  },
                  {
                    text: '{{formatPercent usagePercent}}%',
                    alignment: 'right',
                  },
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
                    text: 'รวมทั้งสิ้น / Grand Total',
                    colSpan: 1,
                    style: 'totalLabel',
                  },
                  {
                    text: '{{formatCurrency totalAllocated}}',
                    style: 'totalValue',
                    alignment: 'right',
                  },
                  {
                    text: '{{formatCurrency totalSpent}}',
                    style: 'totalValue',
                    alignment: 'right',
                  },
                  {
                    text: '{{formatCurrency remaining}}',
                    style: 'totalValue',
                    alignment: 'right',
                  },
                  {
                    text: '{{formatPercent usagePercentage}}%',
                    style: 'totalValue',
                    alignment: 'right',
                  },
                ],
              ],
            },
          },

          // Chart 2: Usage Trend
          '{{#if usageTrendChart}}',
          {
            text: '\n📈 แนวโน้มการใช้งบประมาณ',
            style: 'chartTitle',
            margin: [0, 20, 0, 5],
          },
          {
            text: 'Budget Usage Trend',
            style: 'chartTitleEn',
            margin: [0, 0, 0, 10],
          },
          {
            image: '{{usageTrendChart}}',
            width: 500,
            height: 300,
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          '{{/if}}',

          // Notes Section
          '{{#if notes}}',
          {
            text: '\n📝 หมายเหตุ / Notes',
            style: 'sectionHeader',
            margin: [0, 20, 0, 10],
          },
          {
            text: '{{notes}}',
            style: 'normal',
            margin: [0, 0, 0, 20],
          },
          '{{/if}}',

          // Footer
          {
            text: '\nจัดทำโดย: {{preparedBy}}',
            style: 'footer',
          },
          {
            text: 'วันที่จัดทำ: {{formatDate preparedDate "DD/MM/YYYY HH:mm"}}',
            style: 'footer',
          },
          {
            text: 'อนุมัติโดย: {{approvedBy}}',
            style: 'footer',
            margin: [0, 5, 0, 0],
          },
        ],
        styles: {
          header: {
            fontSize: 22,
            bold: true,
            font: 'Sarabun',
            color: '#1a237e',
          },
          headerEn: {
            fontSize: 14,
            font: 'Sarabun',
            color: '#424242',
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            font: 'Sarabun',
            color: '#1976d2',
            fillColor: '#e3f2fd',
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
            color: '#424242',
          },
          summaryValue: {
            fontSize: 18,
            bold: true,
            font: 'Sarabun',
            color: '#1a237e',
            margin: [0, 5, 0, 0],
          },
          summaryValueSuccess: {
            fontSize: 18,
            bold: true,
            font: 'Sarabun',
            color: '#2e7d32',
            margin: [0, 5, 0, 0],
          },
          summaryValueWarning: {
            fontSize: 18,
            bold: true,
            font: 'Sarabun',
            color: '#f57c00',
            margin: [0, 5, 0, 0],
          },
          summaryValueLarge: {
            fontSize: 24,
            bold: true,
            font: 'Sarabun',
            color: '#7b1fa2',
            margin: [0, 5, 0, 0],
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
            fontSize: 11,
            font: 'Sarabun',
            color: '#1a237e',
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
      }),
      sample_data: {
        fiscalYear: '2568',
        department: 'ฝ่ายเภสัชกรรม',
        budgetType: 'งบดำเนินการ',
        status: 'อนุมัติแล้ว',
        totalAllocated: 5000000,
        totalSpent: 3200000,
        remaining: 1800000,
        usagePercentage: 64,
        budgetDistributionChart:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        usageTrendChart:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        allocations: [
          {
            category: 'จัดซื้อยา',
            allocated: 2500000,
            spent: 1800000,
            remaining: 700000,
            usagePercent: 72,
          },
          {
            category: 'จ่ายยา',
            allocated: 1500000,
            spent: 900000,
            remaining: 600000,
            usagePercent: 60,
          },
          {
            category: 'คืนยา',
            allocated: 500000,
            spent: 300000,
            remaining: 200000,
            usagePercent: 60,
          },
          {
            category: 'ปรับปรุงคลัง',
            allocated: 500000,
            spent: 200000,
            remaining: 300000,
            usagePercent: 40,
          },
        ],
        notes:
          'งบประมาณการจัดซื้อยาใช้ไปแล้ว 72% ควรติดตามและวางแผนการใช้งบประมาณในไตรมาสถัดไป',
        preparedBy: 'ระบบจัดการงบประมาณ',
        preparedDate: new Date().toISOString(),
        approvedBy: 'หัวหน้าฝ่ายเภสัชกรรม',
      },
      schema: {
        type: 'object',
        required: ['fiscalYear', 'department', 'allocations'],
        properties: {
          fiscalYear: { type: 'string', description: 'ปีงบประมาณ' },
          department: { type: 'string', description: 'ชื่อแผนก' },
          budgetType: { type: 'string', description: 'ประเภทงบประมาณ' },
          status: { type: 'string', description: 'สถานะ' },
          totalAllocated: { type: 'number', description: 'งบประมาณที่ได้รับ' },
          totalSpent: { type: 'number', description: 'งบประมาณที่ใช้ไป' },
          remaining: { type: 'number', description: 'งบประมาณคงเหลือ' },
          usagePercentage: {
            type: 'number',
            description: 'เปอร์เซ็นต์การใช้',
          },
          budgetDistributionChart: {
            type: 'string',
            description: 'Base64 chart image',
          },
          usageTrendChart: {
            type: 'string',
            description: 'Base64 chart image',
          },
          allocations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                allocated: { type: 'number' },
                spent: { type: 'number' },
                remaining: { type: 'number' },
                usagePercent: { type: 'number' },
              },
            },
          },
          notes: { type: 'string', description: 'หมายเหตุ' },
          preparedBy: { type: 'string' },
          preparedDate: { type: 'string', format: 'date-time' },
          approvedBy: { type: 'string' },
        },
      },
      created_at: now,
      updated_at: now,
    },
  ]);

  console.log('   ✅ Inserted new Inventory & Budget templates');
  console.log('✅ PDF templates updated successfully');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Reverting PDF templates to original...');

  // Delete new templates
  await knex('pdf_templates')
    .whereIn('name', ['inventory-stock-report', 'budget-allocation-report'])
    .del();

  // Note: We don't restore the old templates as this is a destructive migration
  // If you need to restore, run the original migration 012

  console.log('✅ Templates reverted');
}
