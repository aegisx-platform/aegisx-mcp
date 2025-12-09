import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridOptions,
  GridReadyEvent,
  CellEditingStoppedEvent,
  ValueGetterParams,
  ValueSetterParams,
} from 'ag-grid-community';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BudgetRequestItem } from '../types/budget-request-items.types';
import { BudgetRequestItemService } from '../services/budget-request-items.service';

@Component({
  selector: 'app-budget-request-items-page',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './budget-request-items-page.component.html',
  styleUrls: ['./budget-request-items-page.component.scss'],
})
export class BudgetRequestItemsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private budgetRequestItemService = inject(BudgetRequestItemService);

  budgetRequestId = signal<number | null>(null);
  loading = signal(false);
  rowData = signal<BudgetRequestItem[]>([]);
  totalAmount = signal(0);

  // AG Grid configuration
  gridOptions: GridOptions = {
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
    },
    singleClickEdit: true,
    stopEditingWhenCellsLoseFocus: true,
    onCellEditingStopped: (event: CellEditingStoppedEvent) =>
      this.onCellEditingStopped(event),
  };

  columnDefs: ColDef[] = [
    {
      field: 'line_number',
      headerName: '#',
      width: 60,
      editable: false,
      cellStyle: { backgroundColor: '#F5F5F5', fontStyle: 'italic' },
    },
    {
      field: 'generic_code',
      headerName: 'รหัสยา',
      width: 100,
      editable: false,
    },
    {
      field: 'generic_name',
      headerName: 'ชื่อยา',
      width: 250,
      editable: false,
    },
    {
      field: 'unit',
      headerName: 'หน่วย',
      width: 80,
      editable: false,
    },
    {
      field: 'usage_year_2566',
      headerName: 'ปี 66',
      width: 90,
      editable: false,
      type: 'numericColumn',
      valueGetter: (params: ValueGetterParams) =>
        this.getHistoricalUsage(params, '2566'),
      cellStyle: { textAlign: 'right' },
    },
    {
      field: 'usage_year_2567',
      headerName: 'ปี 67',
      width: 90,
      editable: false,
      type: 'numericColumn',
      valueGetter: (params: ValueGetterParams) =>
        this.getHistoricalUsage(params, '2567'),
      cellStyle: { textAlign: 'right' },
    },
    {
      field: 'usage_year_2568',
      headerName: 'ปี 68',
      width: 90,
      editable: false,
      type: 'numericColumn',
      valueGetter: (params: ValueGetterParams) =>
        this.getHistoricalUsage(params, '2568'),
      cellStyle: { textAlign: 'right' },
    },
    {
      field: 'avg_usage',
      headerName: 'เฉลี่ย',
      width: 90,
      editable: false,
      type: 'numericColumn',
      valueGetter: (params: ValueGetterParams) =>
        this.calculateAvgUsage(params),
      cellStyle: {
        backgroundColor: '#F5F5F5',
        fontStyle: 'italic',
        textAlign: 'right',
      },
    },
    {
      field: 'estimated_usage_2569',
      headerName: 'ประมาณการ',
      width: 110,
      editable: true,
      type: 'numericColumn',
      cellStyle: { backgroundColor: '#FFFACD', textAlign: 'right' },
    },
    {
      field: 'current_stock',
      headerName: 'คงคลัง',
      width: 90,
      editable: false,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
    },
    {
      field: 'estimated_purchase',
      headerName: 'ประมาณซื้อ',
      width: 110,
      editable: false,
      type: 'numericColumn',
      valueGetter: (params: ValueGetterParams) =>
        this.calculateEstimatedPurchase(params),
      cellStyle: {
        backgroundColor: '#F5F5F5',
        fontStyle: 'italic',
        textAlign: 'right',
      },
    },
    {
      field: 'unit_price',
      headerName: 'ราคา/หน่วย',
      width: 100,
      editable: true,
      type: 'numericColumn',
      cellStyle: { backgroundColor: '#FFFACD', textAlign: 'right' },
      valueFormatter: (params) =>
        params.value ? params.value.toLocaleString('th-TH') : '0',
    },
    {
      field: 'requested_qty',
      headerName: 'จำนวนที่ขอ',
      width: 110,
      editable: true,
      type: 'numericColumn',
      cellStyle: (params) => {
        const baseStyle = { backgroundColor: '#FFFACD', textAlign: 'right' };
        // Add error styling if quarterly total doesn't match
        if (!this.validateQuarterlyTotal(params.data)) {
          return { ...baseStyle, border: '2px solid #f44336' };
        }
        return baseStyle;
      },
    },
    {
      field: 'q1_qty',
      headerName: 'Q1',
      width: 80,
      editable: true,
      type: 'numericColumn',
      cellStyle: { backgroundColor: '#FFFACD', textAlign: 'right' },
    },
    {
      field: 'q2_qty',
      headerName: 'Q2',
      width: 80,
      editable: true,
      type: 'numericColumn',
      cellStyle: { backgroundColor: '#FFFACD', textAlign: 'right' },
    },
    {
      field: 'q3_qty',
      headerName: 'Q3',
      width: 80,
      editable: true,
      type: 'numericColumn',
      cellStyle: { backgroundColor: '#FFFACD', textAlign: 'right' },
    },
    {
      field: 'q4_qty',
      headerName: 'Q4',
      width: 80,
      editable: true,
      type: 'numericColumn',
      cellStyle: { backgroundColor: '#FFFACD', textAlign: 'right' },
    },
    {
      field: 'requested_amount_calc',
      headerName: 'มูลค่า',
      width: 120,
      editable: false,
      type: 'numericColumn',
      valueGetter: (params: ValueGetterParams) =>
        this.calculateRequestedAmount(params),
      cellStyle: {
        backgroundColor: '#F5F5F5',
        fontStyle: 'italic',
        textAlign: 'right',
      },
      valueFormatter: (params) =>
        params.value ? params.value.toLocaleString('th-TH') : '0',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      editable: false,
      cellRenderer: () => {
        return `<button class="action-btn" title="Delete">
          <mat-icon>delete</mat-icon>
        </button>`;
      },
    },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.budgetRequestId.set(parseInt(id, 10));
      this.loadBudgetRequestItems();
    }
  }

  async loadBudgetRequestItems() {
    const id = this.budgetRequestId();
    if (!id) return;

    this.loading.set(true);
    try {
      await this.budgetRequestItemService.loadBudgetRequestItemList({
        budget_request_id: id,
        limit: 1000,
      });

      // Get data from service signals
      const items = this.budgetRequestItemService.budgetRequestItemsList();
      this.rowData.set(items);
      this.calculateTotalAmount();
    } catch (error: any) {
      console.error('Failed to load budget request items:', error);
    } finally {
      this.loading.set(false);
    }
  }

  onGridReady(params: GridReadyEvent) {
    console.log('Grid is ready', params);
  }

  onCellEditingStopped(event: CellEditingStoppedEvent) {
    // Update the row data after editing
    const updatedItem = event.data as BudgetRequestItem;

    // Recalculate calculated fields
    event.api.refreshCells({
      force: true,
      columns: ['avg_usage', 'estimated_purchase', 'requested_amount_calc'],
    });

    this.calculateTotalAmount();

    // TODO: Call API to save the updated item
    console.log('Cell editing stopped', updatedItem);
  }

  // Value getters and calculators
  getHistoricalUsage(params: ValueGetterParams, year: string): number {
    const data = params.data as BudgetRequestItem;
    if (!data?.historical_usage) return 0;
    return data.historical_usage[year] || 0;
  }

  calculateAvgUsage(params: ValueGetterParams): number {
    const data = params.data as BudgetRequestItem;
    if (!data?.historical_usage) return 0;

    const usage2566 = data.historical_usage['2566'] || 0;
    const usage2567 = data.historical_usage['2567'] || 0;
    const usage2568 = data.historical_usage['2568'] || 0;

    return Math.round((usage2566 + usage2567 + usage2568) / 3);
  }

  calculateEstimatedPurchase(params: ValueGetterParams): number {
    const data = params.data as BudgetRequestItem;
    const estimatedUsage = data.estimated_usage_2569 || 0;
    const currentStock = data.current_stock || 0;
    return Math.max(0, estimatedUsage - currentStock);
  }

  calculateRequestedAmount(params: ValueGetterParams): number {
    const data = params.data as BudgetRequestItem;
    const requestedQty = data.requested_qty || 0;
    const unitPrice = data.unit_price || 0;
    return requestedQty * unitPrice;
  }

  validateQuarterlyTotal(data: BudgetRequestItem): boolean {
    const q1 = data.q1_qty || 0;
    const q2 = data.q2_qty || 0;
    const q3 = data.q3_qty || 0;
    const q4 = data.q4_qty || 0;
    const requestedQty = data.requested_qty || 0;

    return q1 + q2 + q3 + q4 === requestedQty;
  }

  calculateTotalAmount() {
    const items = this.rowData();
    const total = items.reduce((sum, item) => {
      const qty = item.requested_qty || 0;
      const price = item.unit_price || 0;
      return sum + qty * price;
    }, 0);
    this.totalAmount.set(total);
  }

  // Action handlers
  onInitialize() {
    console.log('Initialize budget request items');
    // TODO: Implement initialize functionality
  }

  onAddDrug() {
    console.log('Add drug modal');
    // TODO: Open add drug modal
  }

  onSave() {
    console.log('Save changes');
    // TODO: Implement save functionality
  }

  onSubmit() {
    console.log('Submit for approval');
    // TODO: Implement submit functionality
  }

  onExport() {
    console.log('Export to SSCJ format');
    // TODO: Implement export functionality
  }

  goBack() {
    this.router.navigate(['/inventory/budget/requests']);
  }
}
