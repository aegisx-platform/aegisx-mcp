/**
 * PDF Template with Charts - Usage Examples
 *
 * ตัวอย่างการใช้งาน Charts ใน PDF Templates แบบ Step-by-Step
 */

import * as fs from 'fs';
import * as path from 'path';
import { ChartService } from '../chart.service';
import { PDFMakeService } from '../pdfmake.service';
import { PdfTemplateService } from '../pdf-template.service';
import type { Knex } from 'knex';

// Ensure output directory exists
const outputDir = path.join(process.cwd(), 'temp', 'test-template-charts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * วิธีที่ 1: ใช้ PDFMakeService โดยตรง (แนะนำสำหรับ Reports)
 *
 * เหมาะสำหรับ:
 * - รายงานที่ generate จาก code โดยตรง
 * - ไม่ต้องการให้ user customize template
 * - ต้องการควบคุมทุก detail
 */

async function example1_DirectPDFMakeWithCharts() {
  console.log('\n📊 ตัวอย่างที่ 1: ใช้ PDFMakeService โดยตรง\n');
  console.log('='.repeat(60));

  const pdfService = new PDFMakeService();

  // ข้อมูลสำหรับตาราง
  const inventoryData = [
    {
      drug_name: 'Paracetamol 500mg',
      location: 'คลังหลัก',
      quantity: 5000,
      unit: 'เม็ด',
      value: 50000,
    },
    {
      drug_name: 'Amoxicillin 500mg',
      location: 'คลังหลัก',
      quantity: 3000,
      unit: 'แคปซูล',
      value: 90000,
    },
    {
      drug_name: 'Omeprazole 20mg',
      location: 'คลังย่อย A',
      quantity: 2000,
      unit: 'แคปซูล',
      value: 60000,
    },
    {
      drug_name: 'Metformin 500mg',
      location: 'คลังย่อย A',
      quantity: 4000,
      unit: 'เม็ด',
      value: 80000,
    },
    {
      drug_name: 'Amlodipine 5mg',
      location: 'คลังย่อย B',
      quantity: 2500,
      unit: 'เม็ด',
      value: 50000,
    },
  ];

  // คำนวณมูลค่ารวมตาม location
  const locationSummary = inventoryData.reduce(
    (acc, item) => {
      acc[item.location] = (acc[item.location] || 0) + item.value;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log('1. เตรียมข้อมูลกราฟ...');
  console.log('   - Location Summary:', locationSummary);

  try {
    // สร้าง PDF พร้อม charts
    console.log('\n2. สร้าง PDF พร้อม charts...');

    const pdfBuffer = await pdfService.generatePdf({
      title: 'รายงานยาคงคลัง - มกราคม 2568',
      subtitle: 'Stock Level Report - January 2025',
      data: inventoryData,
      fields: [
        { key: 'drug_name', label: 'ชื่อยา', width: '*' },
        { key: 'location', label: 'สถานที่', width: 'auto' },
        { key: 'quantity', label: 'จำนวน', type: 'number', width: 'auto' },
        { key: 'unit', label: 'หน่วย', width: 'auto' },
        { key: 'value', label: 'มูลค่า (บาท)', type: 'number', width: 'auto' },
      ],
      charts: [
        // Chart 1: Bar Chart - มูลค่าแยกตามคลัง
        {
          type: 'bar',
          position: 'before',
          data: {
            labels: Object.keys(locationSummary),
            datasets: [
              {
                label: 'มูลค่ายาคงคลัง (บาท)',
                data: Object.values(locationSummary),
              },
            ],
          },
          options: {
            title: 'มูลค่ายาคงคลังแยกตามคลัง',
            colorScheme: 'primary',
            displayValues: true,
            showLegend: true,
            showGrid: true,
          },
          width: 500,
          height: 300,
          alignment: 'center',
        },

        // Chart 2: Doughnut Chart - สัดส่วนมูลค่า
        {
          type: 'doughnut',
          position: 'after',
          data: {
            labels: Object.keys(locationSummary),
            datasets: [
              {
                data: Object.values(locationSummary),
              },
            ],
          },
          options: {
            title: 'สัดส่วนมูลค่ายาคงคลัง',
            colorScheme: 'mixed',
            displayValues: true,
            showLegend: true,
          },
          width: 400,
          height: 400,
          alignment: 'center',
        },
      ],
    });

    // บันทึกไฟล์
    const outputPath = path.join(outputDir, '1-direct-pdfmake-with-charts.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log('\n✅ สำเร็จ!');
    console.log(`   ไฟล์: ${outputPath}`);
    console.log(`   ขนาด: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`   จำนวน Charts: 2 (Bar, Doughnut)`);
  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาด:', error);
    throw error;
  }
}

/**
 * วิธีที่ 2: ใช้ Template System + Pre-generate Charts
 *
 * เหมาะสำหรับ:
 * - Template ที่ต้องการให้ user customize ได้
 * - รายงานที่มีรูปแบบคงที่แต่ข้อมูลเปลี่ยน
 * - ต้องการเก็บ version ของ template
 */

async function example2_TemplateSystemWithCharts(knex: Knex) {
  console.log('\n📋 ตัวอย่างที่ 2: ใช้ Template System พร้อม Charts\n');
  console.log('='.repeat(60));

  const chartService = new ChartService();
  const templateService = new PdfTemplateService(knex);

  try {
    // Step 1: สร้าง Charts ก่อน
    console.log('\n1. สร้าง Charts...');

    // Chart 1: Bar Chart - สต็อกตาม location
    console.log('   - Chart 1: Bar Chart (Stock by Location)');
    const stockByLocationBuffer = await chartService.generateChart(
      'bar',
      {
        labels: ['คลังหลัก', 'คลังย่อย A', 'คลังย่อย B'],
        datasets: [
          {
            label: 'มูลค่ายาคงคลัง (บาท)',
            data: [140000, 140000, 50000],
          },
        ],
      },
      {
        title: 'มูลค่ายาคงคลังแยกตามคลัง',
        colorScheme: 'primary',
        displayValues: true,
        showLegend: true,
        showGrid: true,
      },
    );

    // Chart 2: Line Chart - แนวโน้มการใช้ยา
    console.log('   - Chart 2: Line Chart (Usage Trend)');
    const usageTrendBuffer = await chartService.generateChart(
      'line',
      {
        labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
        datasets: [
          {
            label: 'Paracetamol',
            data: [1200, 1350, 1100, 1400, 1300, 1250],
          },
          {
            label: 'Amoxicillin',
            data: [800, 850, 900, 950, 920, 880],
          },
        ],
      },
      {
        title: 'แนวโน้มการใช้ยา',
        colorScheme: ['#3b82f6', '#10b981'],
        showLegend: true,
        showGrid: true,
      },
    );

    // Chart 3: Pie Chart - สัดส่วนประเภทยา
    console.log('   - Chart 3: Pie Chart (Drug Categories)');
    const categoriesBuffer = await chartService.generateChart(
      'pie',
      {
        labels: ['ยาปฏิชีวนะ', 'ยาลดไข้', 'ยาแก้ปวด', 'อื่นๆ'],
        datasets: [
          {
            data: [40, 30, 20, 10],
          },
        ],
      },
      {
        title: 'สัดส่วนประเภทยา',
        colorScheme: 'mixed',
        displayValues: true,
        showLegend: true,
      },
    );

    // Step 2: แปลง Charts เป็น base64
    console.log('\n2. แปลง Charts เป็น base64...');
    const chart1DataUrl = `data:image/png;base64,${stockByLocationBuffer.toString('base64')}`;
    const chart2DataUrl = `data:image/png;base64,${usageTrendBuffer.toString('base64')}`;
    const chart3DataUrl = `data:image/png;base64,${categoriesBuffer.toString('base64')}`;

    console.log(
      `   - Chart 1: ${(stockByLocationBuffer.length / 1024).toFixed(2)} KB`,
    );
    console.log(
      `   - Chart 2: ${(usageTrendBuffer.length / 1024).toFixed(2)} KB`,
    );
    console.log(
      `   - Chart 3: ${(categoriesBuffer.length / 1024).toFixed(2)} KB`,
    );

    // Step 3: Render PDF จาก template พร้อม charts
    console.log('\n3. Render PDF จาก template...');

    const pdfResponse = await templateService.renderPdf({
      templateName: 'monthly-report-chart-example',
      data: {
        month: 'มกราคม 2568',
        department: 'ฝ่ายเภสัชกรรม',
        summary: {
          totalValue: '1,500,000',
          totalItems: '245',
          needsReview: '15',
          budgetLeft: '850,000',
        },
        chart1: chart1DataUrl, // Bar Chart
        chart2: chart2DataUrl, // Line Chart
        chart3: chart3DataUrl, // Pie Chart
        items: [
          {
            name: 'Paracetamol 500mg',
            quantity: '5,000',
            unit: 'เม็ด',
            value: '50,000',
          },
          {
            name: 'Amoxicillin 500mg',
            quantity: '3,000',
            unit: 'แคปซูล',
            value: '90,000',
          },
          {
            name: 'Omeprazole 20mg',
            quantity: '2,000',
            unit: 'แคปซูล',
            value: '60,000',
          },
          {
            name: 'Metformin 500mg',
            quantity: '4,000',
            unit: 'เม็ด',
            value: '80,000',
          },
          {
            name: 'Amlodipine 5mg',
            quantity: '2,500',
            unit: 'เม็ด',
            value: '50,000',
          },
        ],
        preparedBy: 'ระบบอัตโนมัติ',
        preparedDate: new Date().toLocaleDateString('th-TH'),
      },
    });

    if (pdfResponse.success && pdfResponse.buffer) {
      // บันทึกไฟล์
      const outputPath = path.join(
        outputDir,
        '2-template-system-with-charts.pdf',
      );
      fs.writeFileSync(outputPath, pdfResponse.buffer);

      console.log('\n✅ สำเร็จ!');
      console.log(`   ไฟล์: ${outputPath}`);
      console.log(
        `   ขนาด: ${(pdfResponse.buffer.length / 1024).toFixed(2)} KB`,
      );
      console.log(`   เวลาที่ใช้: ${pdfResponse.renderTime}ms`);
      console.log(`   จำนวน Charts: 3 (Bar, Line, Pie)`);
    } else {
      console.error('\n❌ ไม่สามารถสร้าง PDF ได้:', pdfResponse.error);
    }
  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาด:', error);
    throw error;
  }
}

/**
 * วิธีที่ 3: Executive Summary พร้อม Multiple Charts
 *
 * เหมาะสำหรับ:
 * - รายงานผู้บริหารที่มีกราฟหลายแบบ
 * - Dashboard PDF
 * - สรุปข้อมูลภาพรวม
 */

async function example3_ExecutiveSummaryMultipleCharts() {
  console.log('\n📈 ตัวอย่างที่ 3: Executive Summary (Multiple Charts)\n');
  console.log('='.repeat(60));

  const pdfService = new PDFMakeService();

  // ข้อมูลตัวอย่าง
  const stockByLocation = [
    { location: 'คลังหลัก', value: 800000 },
    { location: 'คลังย่อย A', value: 450000 },
    { location: 'คลังย่อย B', value: 250000 },
  ];

  const usageTrend = [
    { month: 'ก.ค.', quantity: 1100 },
    { month: 'ส.ค.', quantity: 1250 },
    { month: 'ก.ย.', quantity: 1180 },
    { month: 'ต.ค.', quantity: 1320 },
    { month: 'พ.ย.', quantity: 1280 },
    { month: 'ธ.ค.', quantity: 1400 },
  ];

  const budgetDistribution = [
    { category: 'จัดซื้อยา', percentage: 45 },
    { category: 'จ่ายยา', percentage: 30 },
    { category: 'คืนยา', percentage: 15 },
    { category: 'ปรับปรุง', percentage: 10 },
  ];

  console.log('1. เตรียมข้อมูล 3 ประเภทกราฟ...');
  console.log(`   - Stock by Location: ${stockByLocation.length} รายการ`);
  console.log(`   - Usage Trend: ${usageTrend.length} เดือน`);
  console.log(`   - Budget Distribution: ${budgetDistribution.length} หมวด`);

  try {
    console.log('\n2. สร้าง PDF พร้อม 3 Charts...');

    const pdfBuffer = await pdfService.generatePdf({
      title: 'รายงานสรุปผู้บริหาร - Q4/2567',
      subtitle: 'Executive Summary Report - Q4/2024',
      data: [], // ไม่มีตาราง ใช้แค่ charts
      fields: [],
      charts: [
        // Chart 1: Stock by Location (Bar)
        {
          type: 'bar',
          position: 'before',
          data: {
            labels: stockByLocation.map((d) => d.location),
            datasets: [
              {
                label: 'มูลค่ายาคงคลัง (บาท)',
                data: stockByLocation.map((d) => d.value),
              },
            ],
          },
          options: {
            title: 'มูลค่ายาคงคลังแยกตามคลัง',
            subtitle: 'Stock Value by Location',
            colorScheme: 'primary',
            displayValues: true,
            showLegend: true,
          },
          width: 500,
          height: 250,
          margin: [0, 10, 0, 30],
        },

        // Chart 2: Usage Trend (Line)
        {
          type: 'line',
          position: 'before',
          data: {
            labels: usageTrend.map((d) => d.month),
            datasets: [
              {
                label: 'จำนวนการใช้ยา',
                data: usageTrend.map((d) => d.quantity),
              },
            ],
          },
          options: {
            title: 'แนวโน้มการใช้ยา (6 เดือน)',
            subtitle: 'Usage Trend (6 Months)',
            colorScheme: 'success',
            showLegend: true,
            showGrid: true,
          },
          width: 500,
          height: 250,
          margin: [0, 10, 0, 30],
        },

        // Chart 3: Budget Distribution (Pie)
        {
          type: 'pie',
          position: 'before',
          data: {
            labels: budgetDistribution.map((d) => d.category),
            datasets: [
              {
                data: budgetDistribution.map((d) => d.percentage),
              },
            ],
          },
          options: {
            title: 'การจัดสรรงบประมาณ',
            subtitle: 'Budget Distribution',
            colorScheme: 'mixed',
            displayValues: true,
            showLegend: true,
          },
          width: 400,
          height: 350,
          alignment: 'center',
        },
      ],
    });

    // บันทึกไฟล์
    const outputPath = path.join(
      outputDir,
      '3-executive-summary-multiple-charts.pdf',
    );
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log('\n✅ สำเร็จ!');
    console.log(`   ไฟล์: ${outputPath}`);
    console.log(`   ขนาด: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`   จำนวน Charts: 3 (Bar, Line, Pie)`);
    console.log(`   รูปแบบ: Executive Summary (ไม่มีตาราง)`);
  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาด:', error);
    throw error;
  }
}

/**
 * Helper Function: สร้าง Chart แบบ Reusable
 */

async function createChart(
  type: 'bar' | 'line' | 'pie' | 'doughnut',
  data: any,
  options: any,
): Promise<string> {
  const chartService = new ChartService();

  const buffer = await chartService.generateChart(type, data, options);

  return `data:image/png;base64,${buffer.toString('base64')}`;
}

/**
 * Run all examples
 */

async function runAllExamples() {
  console.log('\n🚀 PDF Template Charts - Usage Examples');
  console.log('='.repeat(60));
  console.log(`\nOutput Directory: ${outputDir}\n`);

  try {
    // Example 1: Direct PDFMake
    await example1_DirectPDFMakeWithCharts();

    // Example 2: Template System (requires database)
    // Uncomment และใส่ knex instance ถ้าต้องการทดสอบ
    // const knex = require('knex')({ ... });
    // await example2_TemplateSystemWithCharts(knex);

    // Example 3: Executive Summary
    await example3_ExecutiveSummaryMultipleCharts();

    console.log('\n' + '='.repeat(60));
    console.log('✅ ทุกตัวอย่างทำงานสำเร็จ!');
    console.log(`\n📁 ตรวจสอบไฟล์ PDF ใน: ${outputDir}\n`);
  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาด:', error);
    throw error;
  }
}

// Export functions
export {
  example1_DirectPDFMakeWithCharts,
  example2_TemplateSystemWithCharts,
  example3_ExecutiveSummaryMultipleCharts,
  createChart,
  runAllExamples,
};

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
