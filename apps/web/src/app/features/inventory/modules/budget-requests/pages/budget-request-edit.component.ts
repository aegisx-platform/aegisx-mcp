import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridOptions,
  CellValueChangedEvent,
  GridReadyEvent,
  GridApi,
} from 'ag-grid-community';

import { BudgetRequestService } from '../services/budget-requests.service';
import { BudgetRequestItemService } from '../../budget-request-items/services/budget-request-items.service';
import { BudgetRequest } from '../types/budget-requests.types';
import { BudgetRequestItem } from '../../budget-request-items/types/budget-request-items.types';

/**
 * Budget Request Edit Page (Mode 1)
 *
 * Full-page editor for budget requests with:
 * - Budget request header information
 * - AG Grid for editing 2000-3000 budget items
 * - Batch save functionality
 * - Approval workflow buttons
 */
@Component({
  selector: 'app-budget-request-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    AgGridAngular,
  ],
  template: `
    <div class="budget-request-edit-page">
      <!-- Header -->
      <div class="page-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Edit Budget Request</h1>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading budget request...</p>
        </div>
      } @else if (budgetRequest()) {
        <!-- Budget Request Header -->
        <mat-card class="header-card">
          <mat-card-header>
            <mat-card-title>Budget Request Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <label>Request Number:</label>
                <span>{{ budgetRequest()?.request_number }}</span>
              </div>
              <div class="info-item">
                <label>Fiscal Year:</label>
                <span>{{ budgetRequest()?.fiscal_year }}</span>
              </div>
              <div class="info-item">
                <label>Status:</label>
                <span
                  class="status-badge"
                  [class]="'status-' + budgetRequest()?.status"
                >
                  {{ budgetRequest()?.status }}
                </span>
              </div>
              <div class="info-item">
                <label>Total Amount:</label>
                <span
                  >{{
                    budgetRequest()?.total_requested_amount | number: '1.2-2'
                  }}
                  THB</span
                >
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Budget Items Grid -->
        <mat-card class="items-card">
          <mat-card-header>
            <mat-card-title
              >Budget Items ({{ itemsCount() }} items)</mat-card-title
            >
            <div class="header-actions">
              @if (budgetRequest()?.status === 'DRAFT') {
                <button
                  mat-raised-button
                  color="primary"
                  (click)="saveBatchChanges()"
                >
                  <mat-icon>save</mat-icon>
                  Save All Changes
                </button>
              }
            </div>
          </mat-card-header>
          <mat-card-content>
            <!-- AG Grid for editing budget items -->
            <ag-grid-angular
              class="ag-theme-material"
              [rowData]="budgetItems()"
              [columnDefs]="columnDefs"
              [gridOptions]="gridOptions"
              [defaultColDef]="defaultColDef"
              (gridReady)="onGridReady($event)"
              (cellValueChanged)="onCellValueChanged($event)"
            ></ag-grid-angular>
          </mat-card-content>
        </mat-card>

        <!-- Action Buttons -->
        <div class="action-buttons">
          @if (budgetRequest()?.status === 'DRAFT') {
            <button mat-raised-button color="accent" (click)="submitRequest()">
              <mat-icon>send</mat-icon>
              Submit for Approval
            </button>
          }
          @if (budgetRequest()?.status === 'SUBMITTED') {
            <button
              mat-raised-button
              color="accent"
              (click)="approveDepartment()"
            >
              <mat-icon>check_circle</mat-icon>
              Department Approve
            </button>
          }
          @if (budgetRequest()?.status === 'DEPT_APPROVED') {
            <button mat-raised-button color="accent" (click)="approveFinance()">
              <mat-icon>check_circle</mat-icon>
              Finance Approve
            </button>
          }
          <button mat-button (click)="goBack()">
            <mat-icon>cancel</mat-icon>
            Cancel
          </button>
        </div>
      } @else {
        <div class="error-container">
          <mat-icon color="warn">error</mat-icon>
          <p>Budget request not found</p>
          <button mat-button (click)="goBack()">Go Back</button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .budget-request-edit-page {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;

        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 500;
        }
      }

      .loading-container,
      .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        gap: 16px;
      }

      .header-card {
        margin-bottom: 24px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        padding: 16px 0;
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        label {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.6);
          font-weight: 500;
        }

        span {
          font-size: 14px;
        }
      }

      .status-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;

        &.status-DRAFT {
          background: #e3f2fd;
          color: #1976d2;
        }

        &.status-SUBMITTED {
          background: #fff3e0;
          color: #f57c00;
        }

        &.status-DEPT_APPROVED {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        &.status-FINANCE_APPROVED {
          background: #e8f5e9;
          color: #388e3c;
        }
      }

      .items-card {
        margin-bottom: 24px;

        mat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }
      }

      ag-grid-angular {
        width: 100%;
        height: 600px;
      }

      .action-buttons {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding: 24px 0;
      }
    `,
  ],
})
export class BudgetRequestEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private budgetRequestService = inject(BudgetRequestService);
  private budgetRequestItemService = inject(BudgetRequestItemService);

  budgetRequest = signal<BudgetRequest | null>(null);
  budgetItems = signal<BudgetRequestItem[]>([]);
  loading = signal(true);
  itemsCount = signal(0);

  // AG Grid
  private gridApi?: GridApi;
  modifiedRows = signal<Map<number, Partial<BudgetRequestItem>>>(new Map());

  // Column definitions for AG Grid
  columnDefs: ColDef[] = [
    {
      headerName: 'Line',
      field: 'line_number',
      width: 80,
      pinned: 'left',
      editable: false,
    },
    {
      headerName: 'Generic Code',
      field: 'generic_code',
      width: 120,
      pinned: 'left',
      editable: false,
    },
    {
      headerName: 'Generic Name',
      field: 'generic_name',
      width: 250,
      pinned: 'left',
      editable: false,
    },
    {
      headerName: 'Package Size',
      field: 'package_size',
      width: 120,
      editable: false,
    },
    {
      headerName: 'Unit',
      field: 'unit',
      width: 80,
      editable: false,
    },
    {
      headerName: 'Avg Usage',
      field: 'avg_usage',
      width: 120,
      editable: false,
      valueFormatter: (params) =>
        params.value != null ? params.value.toLocaleString() : '',
    },
    {
      headerName: 'Est. Usage 2569',
      field: 'estimated_usage_2569',
      width: 150,
      editable: true,
      cellStyle: { backgroundColor: '#fff3cd' },
      valueFormatter: (params) =>
        params.value != null ? params.value.toLocaleString() : '',
    },
    {
      headerName: 'Current Stock',
      field: 'current_stock',
      width: 130,
      editable: false,
      valueFormatter: (params) =>
        params.value != null ? params.value.toLocaleString() : '',
    },
    {
      headerName: 'Est. Purchase',
      field: 'estimated_purchase',
      width: 150,
      editable: false,
      valueFormatter: (params) =>
        params.value != null ? params.value.toLocaleString() : '',
    },
    {
      headerName: 'Unit Price',
      field: 'unit_price',
      width: 120,
      editable: true,
      cellStyle: { backgroundColor: '#fff3cd' },
      valueFormatter: (params) =>
        params.value != null ? params.value.toFixed(2) : '',
    },
    {
      headerName: 'Requested Qty',
      field: 'requested_qty',
      width: 150,
      editable: true,
      cellStyle: { backgroundColor: '#fff3cd' },
      valueFormatter: (params) =>
        params.value != null ? params.value.toLocaleString() : '',
    },
    {
      headerName: 'Q1 Qty',
      field: 'q1_qty',
      width: 120,
      editable: true,
      cellStyle: { backgroundColor: '#fff3cd' },
      valueFormatter: (params) =>
        params.value != null ? params.value.toLocaleString() : '',
    },
    {
      headerName: 'Q2 Qty',
      field: 'q2_qty',
      width: 120,
      editable: true,
      cellStyle: { backgroundColor: '#fff3cd' },
      valueFormatter: (params) =>
        params.value != null ? params.value.toLocaleString() : '',
    },
    {
      headerName: 'Q3 Qty',
      field: 'q3_qty',
      width: 120,
      editable: true,
      cellStyle: { backgroundColor: '#fff3cd' },
      valueFormatter: (params) =>
        params.value != null ? params.value.toLocaleString() : '',
    },
    {
      headerName: 'Q4 Qty',
      field: 'q4_qty',
      width: 120,
      editable: true,
      cellStyle: { backgroundColor: '#fff3cd' },
      valueFormatter: (params) =>
        params.value != null ? params.value.toLocaleString() : '',
    },
  ];

  // Default column definition
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  // Grid options
  gridOptions: GridOptions = {
    suppressMovableColumns: true,
    enableCellTextSelection: true,
    ensureDomOrder: true,
    rowHeight: 40,
    headerHeight: 48,
    pagination: false, // Handle 2000-3000 rows without pagination
    suppressRowClickSelection: true,
    singleClickEdit: true,
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBudgetRequest(+id);
    } else {
      this.loading.set(false);
    }
  }

  async loadBudgetRequest(id: number) {
    try {
      this.loading.set(true);

      // Load budget request
      const request = await this.budgetRequestService.loadBudgetRequestById(id);
      this.budgetRequest.set(request || null);

      // Load budget items
      if (request) {
        await this.budgetRequestItemService.loadBudgetRequestItemList({
          budget_request_id: id,
          limit: 10000,
        });

        // Get items from service signals
        this.budgetItems.set(
          this.budgetRequestItemService.budgetRequestItemsList(),
        );
        this.itemsCount.set(
          this.budgetRequestItemService.totalBudgetRequestItem(),
        );
      }
    } catch (error) {
      console.error('Error loading budget request:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Grid ready event handler
   */
  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.sizeColumnsToFit();
  }

  /**
   * Track cell value changes for batch update
   */
  onCellValueChanged(event: CellValueChangedEvent) {
    const rowId = event.data.id;
    const field = event.colDef.field;
    const newValue = event.newValue;

    // Get current modified rows map
    const modified = new Map(this.modifiedRows());

    // Get or create the changes for this row
    const rowChanges: any = modified.get(rowId) || {};

    // Update the field value
    if (field) {
      rowChanges[field] = newValue;
    }

    // Add ID to row changes
    rowChanges.id = rowId;

    // Update the map
    modified.set(rowId, rowChanges);

    // Update signal
    this.modifiedRows.set(modified);

    console.log(
      `Modified ${this.modifiedRows().size} rows`,
      Array.from(this.modifiedRows().entries()),
    );
  }

  /**
   * Save batch changes to backend
   */
  async saveBatchChanges() {
    const changes = Array.from(this.modifiedRows().values());

    if (changes.length === 0) {
      console.log('No changes to save');
      return;
    }

    try {
      this.loading.set(true);

      // Backend accepts max 100 items per batch
      const batchSize = 100;
      let totalUpdated = 0;
      let totalFailed = 0;

      for (let i = 0; i < changes.length; i += batchSize) {
        const batch = changes.slice(i, i + batchSize);

        const result =
          await this.budgetRequestItemService.batchUpdateBudgetRequestItems(
            batch as any,
          );

        if (result) {
          totalUpdated += result.updated;
          totalFailed += result.failed;
        }
      }

      console.log(
        `Batch save complete: ${totalUpdated} updated, ${totalFailed} failed`,
      );

      // Clear modified rows
      this.modifiedRows.set(new Map());

      // Reload data to reflect changes
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        await this.loadBudgetRequest(+id);
      }
    } catch (error) {
      console.error('Error saving batch changes:', error);
    } finally {
      this.loading.set(false);
    }
  }

  submitRequest() {
    console.log('Submit request');
    // TODO: Implement submit
  }

  approveDepartment() {
    console.log('Department approve');
    // TODO: Implement department approval
  }

  approveFinance() {
    console.log('Finance approve');
    // TODO: Implement finance approval
  }

  goBack() {
    this.router.navigate(['/inventory/budget/budget-requests']);
  }
}
