/**
 * PDF Charts Feature - Manual Test Examples
 *
 * This file contains examples of how to generate PDFs with charts
 * Run this file to test chart generation manually
 */

import * as fs from 'fs';
import * as path from 'path';
import { PDFMakeService } from '../pdfmake.service';
import { PdfExportOptions } from '../pdfmake.service';

// Ensure output directory exists
const outputDir = path.join(process.cwd(), 'temp', 'test-charts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Example 1: Simple Bar Chart - Stock Levels
 */
async function example1_StockLevelBarChart() {
  console.log('📊 Example 1: Stock Level Bar Chart');

  const pdfService = new PDFMakeService();

  const options: PdfExportOptions = {
    title: 'รายงานยาคงคลัง - มกราคม 2568',
    subtitle: 'Stock Level Report - January 2025',
    data: [
      { location: 'คลังหลัก', quantity: 1200, value: 80000 },
      { location: 'คลังย่อย A', quantity: 800, value: 50000 },
      { location: 'คลังย่อย B', quantity: 500, value: 30000 },
    ],
    fields: [
      { key: 'location', label: 'สถานที่', width: '*' },
      { key: 'quantity', label: 'จำนวน', type: 'number', width: 'auto' },
      { key: 'value', label: 'มูลค่า (บาท)', type: 'number', width: 'auto' },
    ],
    charts: [
      {
        type: 'bar',
        position: 'before',
        data: {
          labels: ['คลังหลัก', 'คลังย่อย A', 'คลังย่อย B'],
          datasets: [
            {
              label: 'มูลค่ายาคงคลัง (บาท)',
              data: [80000, 50000, 30000],
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
    ],
  };

  const pdfBuffer = await pdfService.generatePdf(options);
  const outputPath = path.join(outputDir, '1-stock-level-bar-chart.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log(`✅ Generated: ${outputPath}`);
  console.log(`   File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB\n`);
}

/**
 * Example 2: Line Chart - Usage Trend
 */
async function example2_UsageTrendLineChart() {
  console.log('📈 Example 2: Usage Trend Line Chart');

  const pdfService = new PDFMakeService();

  const options: PdfExportOptions = {
    title: 'แนวโน้มการใช้ยา - 6 เดือน',
    subtitle: 'Drug Usage Trend - 6 Months',
    data: [
      { month: 'ม.ค.', paracetamol: 1200, amoxicillin: 800 },
      { month: 'ก.พ.', paracetamol: 1350, amoxicillin: 850 },
      { month: 'มี.ค.', paracetamol: 1100, amoxicillin: 900 },
      { month: 'เม.ย.', paracetamol: 1400, amoxicillin: 950 },
      { month: 'พ.ค.', paracetamol: 1300, amoxicillin: 920 },
      { month: 'มิ.ย.', paracetamol: 1250, amoxicillin: 880 },
    ],
    fields: [
      { key: 'month', label: 'เดือน', width: '*' },
      {
        key: 'paracetamol',
        label: 'Paracetamol',
        type: 'number',
        width: 'auto',
      },
      {
        key: 'amoxicillin',
        label: 'Amoxicillin',
        type: 'number',
        width: 'auto',
      },
    ],
    charts: [
      {
        type: 'line',
        position: 'before',
        data: {
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
        options: {
          title: 'แนวโน้มการใช้ยา',
          colorScheme: ['#3b82f6', '#10b981'],
          showLegend: true,
          showGrid: true,
        },
        width: 600,
        height: 350,
      },
    ],
  };

  const pdfBuffer = await pdfService.generatePdf(options);
  const outputPath = path.join(outputDir, '2-usage-trend-line-chart.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log(`✅ Generated: ${outputPath}`);
  console.log(`   File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB\n`);
}

/**
 * Example 3: Pie Chart - Budget Distribution
 */
async function example3_BudgetPieChart() {
  console.log('🥧 Example 3: Budget Distribution Pie Chart');

  const pdfService = new PDFMakeService();

  const options: PdfExportOptions = {
    title: 'การจัดสรรงบประมาณ Q1',
    subtitle: 'Budget Distribution Q1',
    data: [
      { category: 'จัดซื้อ', amount: 400000, percentage: 40 },
      { category: 'จ่ายยา', amount: 300000, percentage: 30 },
      { category: 'คืนยา', amount: 200000, percentage: 20 },
      { category: 'ปรับปรุง', amount: 100000, percentage: 10 },
    ],
    fields: [
      { key: 'category', label: 'ประเภท', width: '*' },
      {
        key: 'amount',
        label: 'จำนวนเงิน (บาท)',
        type: 'number',
        width: 'auto',
      },
      {
        key: 'percentage',
        label: 'เปอร์เซ็นต์',
        type: 'number',
        width: 'auto',
      },
    ],
    charts: [
      {
        type: 'pie',
        position: 'before',
        data: {
          labels: ['จัดซื้อ', 'จ่ายยา', 'คืนยา', 'ปรับปรุง'],
          datasets: [
            {
              data: [40, 30, 20, 10],
            },
          ],
        },
        options: {
          title: 'สัดส่วนการใช้งบประมาณ',
          colorScheme: 'mixed',
          displayValues: true,
          showLegend: true,
        },
        width: 400,
        height: 400,
        alignment: 'center',
      },
    ],
  };

  const pdfBuffer = await pdfService.generatePdf(options);
  const outputPath = path.join(outputDir, '3-budget-pie-chart.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log(`✅ Generated: ${outputPath}`);
  console.log(`   File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB\n`);
}

/**
 * Example 4: Multiple Charts - Executive Summary
 */
async function example4_ExecutiveSummary() {
  console.log('📊 Example 4: Executive Summary (Multiple Charts)');

  const pdfService = new PDFMakeService();

  const options: PdfExportOptions = {
    title: 'รายงานสรุปผู้บริหาร - มกราคม 2568',
    subtitle: 'Executive Summary - January 2025',
    data: [
      { metric: 'มูลค่ายาคงคลัง', value: 160000, status: 'ปกติ' },
      { metric: 'ยาใกล้หมดอายุ', value: 15, status: 'เฝ้าระวัง' },
      { metric: 'งบประมาณคงเหลือ', value: 850000, status: 'ปกติ' },
    ],
    fields: [
      { key: 'metric', label: 'ตัวชี้วัด', width: '*' },
      { key: 'value', label: 'ค่า', type: 'number', width: 'auto' },
      { key: 'status', label: 'สถานะ', width: 'auto' },
    ],
    charts: [
      {
        type: 'bar',
        position: 'before',
        data: {
          labels: ['คลังหลัก', 'คลังย่อย A', 'คลังย่อย B'],
          datasets: [
            {
              label: 'มูลค่ายาคงคลัง (บาท)',
              data: [80000, 50000, 30000],
            },
          ],
        },
        options: {
          title: 'มูลค่ายาคงคลังแยกตามคลัง',
          colorScheme: 'primary',
          displayValues: true,
        },
        width: 500,
        height: 250,
      },
      {
        type: 'line',
        position: 'before',
        data: {
          labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
          datasets: [
            {
              label: 'การใช้ยา',
              data: [1200, 1350, 1100, 1400, 1300, 1250],
            },
          ],
        },
        options: {
          title: 'แนวโน้มการใช้ยา',
          colorScheme: 'success',
          showLegend: true,
        },
        width: 500,
        height: 250,
      },
      {
        type: 'pie',
        position: 'after',
        data: {
          labels: ['จัดซื้อ', 'จ่ายยา', 'คืนยา', 'ปรับปรุง'],
          datasets: [
            {
              data: [40, 30, 20, 10],
            },
          ],
        },
        options: {
          title: 'การใช้งบประมาณ',
          colorScheme: 'mixed',
          displayValues: true,
        },
        width: 400,
        height: 300,
      },
    ],
    orientation: 'portrait',
  };

  const pdfBuffer = await pdfService.generatePdf(options);
  const outputPath = path.join(
    outputDir,
    '4-executive-summary-multiple-charts.pdf',
  );
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log(`✅ Generated: ${outputPath}`);
  console.log(`   File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB\n`);
}

/**
 * Example 5: Doughnut Chart
 */
async function example5_DoughnutChart() {
  console.log('🍩 Example 5: Doughnut Chart');

  const pdfService = new PDFMakeService();

  const options: PdfExportOptions = {
    title: 'สัดส่วนประเภทยา',
    subtitle: 'Drug Category Distribution',
    data: [
      { category: 'ยาปฏิชีวนะ', count: 45 },
      { category: 'ยาลดไข้', count: 30 },
      { category: 'ยาแก้ปวด', count: 15 },
      { category: 'วิตามิน', count: 10 },
    ],
    fields: [
      { key: 'category', label: 'ประเภท', width: '*' },
      { key: 'count', label: 'จำนวนรายการ', type: 'number', width: 'auto' },
    ],
    charts: [
      {
        type: 'doughnut',
        position: 'before',
        data: {
          labels: ['ยาปฏิชีวนะ', 'ยาลดไข้', 'ยาแก้ปวด', 'วิตามิน'],
          datasets: [
            {
              data: [45, 30, 15, 10],
            },
          ],
        },
        options: {
          title: 'สัดส่วนประเภทยา',
          colorScheme: 'purple',
          displayValues: true,
          showLegend: true,
        },
        width: 400,
        height: 400,
      },
    ],
  };

  const pdfBuffer = await pdfService.generatePdf(options);
  const outputPath = path.join(outputDir, '5-doughnut-chart.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log(`✅ Generated: ${outputPath}`);
  console.log(`   File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB\n`);
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('🚀 PDF Charts Feature - Manual Test Examples\n');
  console.log(`Output Directory: ${outputDir}\n`);
  console.log('='.repeat(60));
  console.log('\n');

  try {
    await example1_StockLevelBarChart();
    await example2_UsageTrendLineChart();
    await example3_BudgetPieChart();
    await example4_ExecutiveSummary();
    await example5_DoughnutChart();

    console.log('='.repeat(60));
    console.log('\n✅ All examples completed successfully!');
    console.log(`\n📁 Check PDFs in: ${outputDir}\n`);
  } catch (error) {
    console.error('❌ Error generating PDFs:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  example1_StockLevelBarChart,
  example2_UsageTrendLineChart,
  example3_BudgetPieChart,
  example4_ExecutiveSummary,
  example5_DoughnutChart,
  runAllExamples,
};
