import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AxDialogService } from '@aegisx/ui';
import { AddDrugDialogComponent } from '../components/add-drug-dialog.component';

interface BudgetRequest {
  id: number;
  request_number: string;
  fiscal_year: number;
  department_id: number | null;
  status: string;
  total_requested_amount: number;
  justification?: string;
  created_at: string;
  updated_at: string;
}

interface BudgetRequestItem {
  id: number;
  line_number: number;
  generic_id?: number;
  generic_code: string;
  generic_name: string;
  unit: string;
  unit_price: number;
  requested_qty: number;
  requested_amount: number;
  q1_qty: number;
  q2_qty: number;
  q3_qty: number;
  q4_qty: number;
  // Historical data (JSONB from backend)
  historical_usage?: Record<string, number>;
  avg_usage?: number;
  estimated_usage_2569?: number;
  current_stock?: number;
}

@Component({
  selector: 'app-budget-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatDialogModule,
  ],
  template: `
    <div class="min-h-screen bg-[var(--ax-background-subtle)] p-6">
      <div class="max-w-full mx-auto space-y-4">
        <!-- Header Card -->
        <mat-card class="!shadow-sm">
          <mat-card-content class="!p-4">
            <div class="flex items-center gap-4">
              <button
                mat-icon-button
                (click)="goBack()"
                class="!bg-[var(--ax-background-subtle)]"
              >
                <mat-icon>arrow_back</mat-icon>
              </button>
              <div class="flex-1">
                <h1 class="text-xl font-bold text-[var(--ax-text-default)] m-0">
                  แผนงบประมาณจัดซื้อยา ปี
                  {{ budgetRequest()?.fiscal_year || '...' }}
                </h1>
                <div class="flex items-center gap-2 mt-2">
                  <span
                    class="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--ax-info-faint)] text-[var(--ax-info-default)] rounded-md text-sm font-medium"
                  >
                    <mat-icon class="!text-base !w-4 !h-4">receipt</mat-icon>
                    {{ budgetRequest()?.request_number || 'Loading...' }}
                  </span>
                  <span [class]="getStatusClass(budgetRequest()?.status)">
                    {{ getStatusText(budgetRequest()?.status) }}
                  </span>
                </div>
              </div>
              <!-- Right side: Item count and Total Amount (large) -->
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <span class="text-sm text-[var(--ax-text-secondary)] block"
                    >จำนวนรายการ</span
                  >
                  <span class="text-lg font-bold text-[var(--ax-text-default)]">
                    {{ items().length | number }}
                  </span>
                </div>
                <div class="w-px h-10 bg-[var(--ax-border-default)]"></div>
                <div class="text-right">
                  <span class="text-sm text-[var(--ax-text-secondary)] block"
                    >มูลค่ารวม</span
                  >
                  <span
                    class="text-2xl font-bold text-[var(--ax-success-default)]"
                  >
                    ฿{{ totalAmount() | number: '1.2-2' }}
                  </span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        @if (loading()) {
          <mat-card class="!shadow-sm">
            <mat-card-content class="!p-12 text-center">
              <mat-spinner class="!mx-auto" [diameter]="40"></mat-spinner>
              <p class="text-sm text-[var(--ax-text-secondary)] mt-4">
                กำลังโหลดข้อมูล...
              </p>
            </mat-card-content>
          </mat-card>
        } @else if (budgetRequest()) {
          <!-- Action Bar -->
          <mat-card class="!shadow-sm">
            <mat-card-content class="!p-4">
              <div class="flex items-center gap-3 flex-wrap">
                <!-- DRAFT mode buttons -->
                @if (budgetRequest()?.status === 'DRAFT') {
                  <button
                    mat-raised-button
                    color="primary"
                    (click)="initialize()"
                    [disabled]="actionLoading()"
                    matTooltip="ดึงรายการยาพร้อมคำนวณยอดใช้ย้อนหลัง ราคา และสต็อก"
                  >
                    <mat-icon>auto_fix_high</mat-icon>
                    <span class="ml-1">Initialize</span>
                  </button>
                  <button
                    mat-stroked-button
                    (click)="initializeFromMaster()"
                    [disabled]="actionLoading()"
                    matTooltip="ดึงรายการยาจาก Drug Master (ไม่คำนวณยอดใช้)"
                  >
                    <mat-icon>playlist_add</mat-icon>
                    <span class="ml-1">From Master</span>
                  </button>
                  <button
                    mat-stroked-button
                    (click)="importExcel()"
                    [disabled]="actionLoading()"
                  >
                    <mat-icon>upload_file</mat-icon>
                    <span class="ml-1">Import Excel</span>
                  </button>
                  <button
                    mat-stroked-button
                    (click)="addDrug()"
                    [disabled]="actionLoading()"
                  >
                    <mat-icon>add</mat-icon>
                    <span class="ml-1">Add Drug</span>
                  </button>
                  <button
                    mat-stroked-button
                    color="warn"
                    (click)="resetAll()"
                    [disabled]="actionLoading() || items().length === 0"
                    matTooltip="ลบรายการยาทั้งหมด"
                  >
                    <mat-icon>delete_sweep</mat-icon>
                    <span class="ml-1">Reset</span>
                  </button>
                  <div class="flex-1"></div>
                  <button
                    mat-stroked-button
                    (click)="saveAll()"
                    [disabled]="actionLoading() || !hasChanges()"
                  >
                    <mat-icon>save</mat-icon>
                    <span class="ml-1">Save All</span>
                  </button>
                  <button
                    mat-raised-button
                    color="accent"
                    (click)="submit()"
                    [disabled]="actionLoading() || items().length === 0"
                  >
                    <mat-icon>send</mat-icon>
                    <span class="ml-1">Submit</span>
                  </button>
                }

                <!-- SUBMITTED mode buttons -->
                @if (budgetRequest()?.status === 'SUBMITTED') {
                  <button
                    mat-raised-button
                    color="primary"
                    (click)="approveDept()"
                    [disabled]="actionLoading()"
                  >
                    <mat-icon>thumb_up</mat-icon>
                    <span class="ml-1">Approve (Dept)</span>
                  </button>
                  <button
                    mat-raised-button
                    color="warn"
                    (click)="reject()"
                    [disabled]="actionLoading()"
                  >
                    <mat-icon>thumb_down</mat-icon>
                    <span class="ml-1">Reject</span>
                  </button>
                  <div class="flex-1"></div>
                }

                <!-- DEPT_APPROVED mode buttons -->
                @if (budgetRequest()?.status === 'DEPT_APPROVED') {
                  <button
                    mat-raised-button
                    color="primary"
                    (click)="approveFinance()"
                    [disabled]="actionLoading()"
                  >
                    <mat-icon>thumb_up</mat-icon>
                    <span class="ml-1">Approve (Finance)</span>
                  </button>
                  <button
                    mat-raised-button
                    color="warn"
                    (click)="reject()"
                    [disabled]="actionLoading()"
                  >
                    <mat-icon>thumb_down</mat-icon>
                    <span class="ml-1">Reject</span>
                  </button>
                  <div class="flex-1"></div>
                }

                <!-- Always show Export -->
                <button
                  mat-stroked-button
                  (click)="exportSSCJ()"
                  [disabled]="actionLoading()"
                >
                  <mat-icon>download</mat-icon>
                  <span class="ml-1">Export SSCJ</span>
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Search Bar -->
          <mat-card class="!shadow-sm">
            <mat-card-content class="!p-4">
              <div class="flex items-center gap-4">
                <mat-form-field
                  appearance="outline"
                  class="!flex-1 dense-field"
                >
                  <mat-label>ค้นหารายการยา</mat-label>
                  <input
                    matInput
                    [(ngModel)]="searchTerm"
                    placeholder="รหัสยา, ชื่อยา..."
                  />
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                <mat-form-field appearance="outline" class="!w-48 dense-field">
                  <mat-label>ค้นหาตาม</mat-label>
                  <mat-select [(ngModel)]="searchField">
                    <mat-option value="generic_code">รหัสยา</mat-option>
                    <mat-option value="generic_name">ชื่อยา</mat-option>
                    <mat-option value="all">ทั้งหมด</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-flat-button color="primary" (click)="applySearch()">
                  <mat-icon>search</mat-icon>
                  ค้นหา
                </button>
                @if (searchTerm) {
                  <button mat-stroked-button (click)="clearSearch()">
                    <mat-icon>clear</mat-icon>
                    ล้าง
                  </button>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Items Table -->
          @if (items().length === 0) {
            <mat-card class="!shadow-sm">
              <mat-card-content class="!p-12 text-center">
                <mat-icon
                  class="!text-6xl !w-16 !h-16 text-[var(--ax-text-disabled)]"
                  >inventory_2</mat-icon
                >
                <h3
                  class="text-lg font-medium text-[var(--ax-text-default)] mt-4 mb-2"
                >
                  ยังไม่มีรายการยา
                </h3>
                <p class="text-sm text-[var(--ax-text-secondary)] mb-4">
                  คลิก "Initialize" เพื่อดึงรายการยาพร้อมคำนวณยอดใช้<br />
                  หรือ "From Master" เพื่อดึงรายการยาเปล่าๆ
                </p>
                @if (budgetRequest()?.status === 'DRAFT') {
                  <div class="flex gap-3 justify-center">
                    <button
                      mat-raised-button
                      color="primary"
                      (click)="initialize()"
                      [disabled]="actionLoading()"
                    >
                      <mat-icon>auto_fix_high</mat-icon>
                      Initialize
                    </button>
                    <button
                      mat-stroked-button
                      (click)="initializeFromMaster()"
                      [disabled]="actionLoading()"
                    >
                      <mat-icon>playlist_add</mat-icon>
                      From Master
                    </button>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          } @else {
            <mat-card class="!shadow-sm overflow-hidden">
              <!-- Table Container -->
              <div class="overflow-x-auto">
                <table
                  mat-table
                  [dataSource]="filteredItems()"
                  class="w-full items-table"
                >
                  <!-- Line Number Column -->
                  <ng-container matColumnDef="line_number">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="!text-center !w-12"
                    >
                      #
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-center">
                      {{ item.line_number }}
                    </td>
                  </ng-container>

                  <!-- Generic Code Column -->
                  <ng-container matColumnDef="generic_code">
                    <th mat-header-cell *matHeaderCellDef>รหัสยา</th>
                    <td mat-cell *matCellDef="let item">
                      <span class="font-mono text-sm">{{
                        item.generic_code
                      }}</span>
                    </td>
                  </ng-container>

                  <!-- Generic Name Column -->
                  <ng-container matColumnDef="generic_name">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="!min-w-[200px]"
                    >
                      ชื่อยา
                    </th>
                    <td mat-cell *matCellDef="let item">
                      {{ item.generic_name }}
                    </td>
                  </ng-container>

                  <!-- Unit Column -->
                  <ng-container matColumnDef="unit">
                    <th mat-header-cell *matHeaderCellDef>หน่วย</th>
                    <td mat-cell *matCellDef="let item">{{ item.unit }}</td>
                  </ng-container>

                  <!-- Historical Usage 2566 Column -->
                  <ng-container matColumnDef="usage_2566">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      ปี66
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      {{ getHistoricalUsage(item, '2566') | number: '1.0-0' }}
                    </td>
                  </ng-container>

                  <!-- Historical Usage 2567 Column -->
                  <ng-container matColumnDef="usage_2567">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      ปี67
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      {{ getHistoricalUsage(item, '2567') | number: '1.0-0' }}
                    </td>
                  </ng-container>

                  <!-- Historical Usage 2568 Column -->
                  <ng-container matColumnDef="usage_2568">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      ปี68
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      {{ getHistoricalUsage(item, '2568') | number: '1.0-0' }}
                    </td>
                  </ng-container>

                  <!-- Average Usage Column -->
                  <ng-container matColumnDef="avg_usage">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      เฉลี่ย
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let item"
                      class="!text-right font-medium"
                    >
                      {{ item.avg_usage | number: '1.0-0' }}
                    </td>
                  </ng-container>

                  <!-- Estimated Usage 2569 Column -->
                  <ng-container matColumnDef="estimated_usage_2569">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      ประมาณ69
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      {{ item.estimated_usage_2569 | number: '1.0-0' }}
                    </td>
                  </ng-container>

                  <!-- Current Stock Column -->
                  <ng-container matColumnDef="current_stock">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      คงเหลือ
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      {{ item.current_stock | number: '1.0-0' }}
                    </td>
                  </ng-container>

                  <!-- Unit Price Column (Editable) -->
                  <ng-container matColumnDef="unit_price">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      ราคา/หน่วย
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <input
                          type="number"
                          [value]="item.unit_price"
                          (change)="updateItemField(item, 'unit_price', $event)"
                          class="w-24 text-right px-2 py-1 border rounded bg-yellow-50 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      } @else {
                        {{ item.unit_price | number: '1.2-2' }}
                      }
                    </td>
                  </ng-container>

                  <!-- Requested Qty Column (Editable) -->
                  <ng-container matColumnDef="requested_qty">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      จำนวนที่ขอ
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <input
                          type="number"
                          [value]="item.requested_qty"
                          (change)="
                            updateItemField(item, 'requested_qty', $event)
                          "
                          class="w-20 text-right px-2 py-1 border rounded bg-yellow-50 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      } @else {
                        {{ item.requested_qty | number }}
                      }
                    </td>
                  </ng-container>

                  <!-- Q1 Column (Editable) -->
                  <ng-container matColumnDef="q1_qty">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      Q1
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <input
                          type="number"
                          [value]="item.q1_qty"
                          (change)="updateItemField(item, 'q1_qty', $event)"
                          class="w-16 text-right px-2 py-1 border rounded bg-yellow-50 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      } @else {
                        {{ item.q1_qty | number }}
                      }
                    </td>
                  </ng-container>

                  <!-- Q2 Column (Editable) -->
                  <ng-container matColumnDef="q2_qty">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      Q2
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <input
                          type="number"
                          [value]="item.q2_qty"
                          (change)="updateItemField(item, 'q2_qty', $event)"
                          class="w-16 text-right px-2 py-1 border rounded bg-yellow-50 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      } @else {
                        {{ item.q2_qty | number }}
                      }
                    </td>
                  </ng-container>

                  <!-- Q3 Column (Editable) -->
                  <ng-container matColumnDef="q3_qty">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      Q3
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <input
                          type="number"
                          [value]="item.q3_qty"
                          (change)="updateItemField(item, 'q3_qty', $event)"
                          class="w-16 text-right px-2 py-1 border rounded bg-yellow-50 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      } @else {
                        {{ item.q3_qty | number }}
                      }
                    </td>
                  </ng-container>

                  <!-- Q4 Column (Editable) -->
                  <ng-container matColumnDef="q4_qty">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      Q4
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <input
                          type="number"
                          [value]="item.q4_qty"
                          (change)="updateItemField(item, 'q4_qty', $event)"
                          class="w-16 text-right px-2 py-1 border rounded bg-yellow-50 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      } @else {
                        {{ item.q4_qty | number }}
                      }
                    </td>
                  </ng-container>

                  <!-- Requested Amount Column -->
                  <ng-container matColumnDef="requested_amount">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      มูลค่า
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let item"
                      class="!text-right font-medium"
                    >
                      {{ item.requested_amount | number: '1.2-2' }}
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="!text-center !w-16"
                    >
                      Actions
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-center">
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <button
                          mat-icon-button
                          color="warn"
                          (click)="deleteItem(item)"
                          matTooltip="ลบรายการ"
                        >
                          <mat-icon>delete</mat-icon>
                        </button>
                      }
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr
                    mat-row
                    *matRowDef="let row; columns: displayedColumns"
                    class="hover:bg-[var(--ax-background-subtle)]"
                  ></tr>
                </table>
              </div>

              <!-- Paginator -->
              <mat-paginator
                [length]="items().length"
                [pageSize]="pageSize"
                [pageSizeOptions]="[25, 50, 100, 250]"
                [pageIndex]="pageIndex"
                (page)="onPageChange($event)"
                showFirstLastButtons
                class="border-t border-[var(--ax-border-default)]"
              >
              </mat-paginator>
            </mat-card>
          }

          <!-- Summary Footer -->
          @if (items().length > 0) {
            <mat-card class="!shadow-sm">
              <mat-card-content class="!p-4">
                <div class="flex items-center justify-between flex-wrap gap-4">
                  <div class="flex items-center gap-6">
                    <div class="flex items-center gap-2">
                      <mat-icon class="text-[var(--ax-text-secondary)]"
                        >inventory_2</mat-icon
                      >
                      <span class="text-sm text-[var(--ax-text-secondary)]"
                        >รายการทั้งหมด:</span
                      >
                      <span class="font-bold text-[var(--ax-text-default)]">{{
                        items().length | number
                      }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <mat-icon class="text-[var(--ax-text-secondary)]"
                        >payments</mat-icon
                      >
                      <span class="text-sm text-[var(--ax-text-secondary)]"
                        >รวมมูลค่า:</span
                      >
                      <span class="font-bold text-[var(--ax-success-default)]"
                        >{{ totalAmount() | number: '1.2-2' }} บาท</span
                      >
                    </div>
                  </div>
                  @if (modifiedItems().length > 0) {
                    <div
                      class="flex items-center gap-2 px-3 py-1.5 bg-[var(--ax-warning-faint)] text-[var(--ax-warning-default)] rounded-md"
                    >
                      <mat-icon class="!text-base !w-4 !h-4">warning</mat-icon>
                      <span class="text-sm font-medium"
                        >Unsaved changes: {{ modifiedItems().length }} items
                        modified</span
                      >
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .dense-field {
        ::ng-deep .mat-mdc-form-field-infix {
          min-height: 40px !important;
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }
        ::ng-deep .mat-mdc-text-field-wrapper {
          height: 40px !important;
        }
      }
      .items-table {
        th.mat-mdc-header-cell {
          background: var(--ax-background-subtle);
          font-weight: 600;
          font-size: 13px;
          padding: 12px 16px;
        }
        td.mat-mdc-cell {
          padding: 8px 16px;
          font-size: 13px;
        }
      }
    `,
  ],
})
export class BudgetRequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private axDialog = inject(AxDialogService);

  budgetRequest = signal<BudgetRequest | null>(null);
  items = signal<BudgetRequestItem[]>([]);
  loading = signal(true);
  actionLoading = signal(false);

  // Search
  searchTerm = '';
  searchField = 'all';

  // Pagination
  pageSize = 50;
  pageIndex = 0;

  // Track modified items
  private modifiedItemIds = new Set<number>();

  displayedColumns = [
    'line_number',
    'generic_code',
    'generic_name',
    'unit',
    'usage_2566',
    'usage_2567',
    'usage_2568',
    'avg_usage',
    'estimated_usage_2569',
    'current_stock',
    'unit_price',
    'requested_qty',
    'q1_qty',
    'q2_qty',
    'q3_qty',
    'q4_qty',
    'requested_amount',
    'actions',
  ];

  // Computed signals
  filteredItems = computed(() => {
    let result = this.items();

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter((item) => {
        if (this.searchField === 'generic_code') {
          return item.generic_code?.toLowerCase().includes(term);
        } else if (this.searchField === 'generic_name') {
          return item.generic_name?.toLowerCase().includes(term);
        } else {
          return (
            item.generic_code?.toLowerCase().includes(term) ||
            item.generic_name?.toLowerCase().includes(term)
          );
        }
      });
    }

    // Apply pagination
    const start = this.pageIndex * this.pageSize;
    return result.slice(start, start + this.pageSize);
  });

  totalAmount = computed(() => {
    return this.items().reduce(
      (sum, item) => sum + (item.requested_amount || 0),
      0,
    );
  });

  modifiedItems = computed(() => {
    return Array.from(this.modifiedItemIds);
  });

  hasChanges = computed(() => {
    return this.modifiedItemIds.size > 0;
  });

  private get requestId(): string {
    return this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<any>(
          `/inventory/budget/budget-requests/${this.requestId}`,
        ),
      );
      this.budgetRequest.set(response.data);
      await this.loadItems();
    } catch (error) {
      console.error('Failed to load budget request:', error);
      this.snackBar.open('ไม่สามารถโหลดข้อมูลได้', 'ปิด', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  async loadItems() {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(
          `/inventory/budget/budget-request-items?budget_request_id=${this.requestId}&limit=5000`,
        ),
      );
      this.items.set(response.data || []);
      this.modifiedItemIds.clear();
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  }

  goBack() {
    this.router.navigate(['/inventory/budget/budget-requests']);
  }

  getStatusClass(status: string | undefined): string {
    const baseClass =
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium';
    switch (status) {
      case 'DRAFT':
        return `${baseClass} bg-gray-100 text-gray-700`;
      case 'SUBMITTED':
        return `${baseClass} bg-orange-100 text-orange-700`;
      case 'DEPT_APPROVED':
        return `${baseClass} bg-blue-100 text-blue-700`;
      case 'FINANCE_APPROVED':
        return `${baseClass} bg-green-100 text-green-700`;
      case 'REJECTED':
        return `${baseClass} bg-red-100 text-red-700`;
      default:
        return `${baseClass} bg-gray-100 text-gray-700`;
    }
  }

  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'DRAFT':
        return 'Draft';
      case 'SUBMITTED':
        return 'Submitted';
      case 'DEPT_APPROVED':
        return 'Dept Approved';
      case 'FINANCE_APPROVED':
        return 'Finance Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status || 'Unknown';
    }
  }

  getHistoricalUsage(item: BudgetRequestItem, year: string): number {
    if (item.historical_usage && typeof item.historical_usage === 'object') {
      return item.historical_usage[year] || 0;
    }
    return 0;
  }

  applySearch() {
    this.pageIndex = 0;
    // Trigger change detection
    this.items.set([...this.items()]);
  }

  clearSearch() {
    this.searchTerm = '';
    this.pageIndex = 0;
    this.items.set([...this.items()]);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  updateItemField(item: BudgetRequestItem, field: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;

    // Update the item
    const items = this.items();
    const index = items.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      const updatedItem = { ...items[index], [field]: value };

      // Recalculate requested_amount if needed
      if (['unit_price', 'requested_qty'].includes(field)) {
        updatedItem.requested_amount =
          updatedItem.unit_price * updatedItem.requested_qty;
      }

      // Auto-distribute to quarters if requested_qty changed
      if (field === 'requested_qty') {
        const quarterQty = Math.floor(value / 4);
        const remainder = value % 4;
        updatedItem.q1_qty = quarterQty + (remainder > 0 ? 1 : 0);
        updatedItem.q2_qty = quarterQty + (remainder > 1 ? 1 : 0);
        updatedItem.q3_qty = quarterQty + (remainder > 2 ? 1 : 0);
        updatedItem.q4_qty = quarterQty;
      }

      items[index] = updatedItem;
      this.items.set([...items]);
      this.modifiedItemIds.add(item.id);
    }
  }

  deleteItem(item: BudgetRequestItem) {
    this.axDialog
      .confirmDelete(item.generic_name)
      .subscribe(async (confirmed) => {
        if (!confirmed) return;

        try {
          await firstValueFrom(
            this.http.delete(
              `/inventory/budget/budget-request-items/${item.id}`,
            ),
          );
          this.snackBar.open('ลบรายการสำเร็จ', 'ปิด', { duration: 3000 });
          await this.loadItems();
          await this.loadData();
        } catch (error: any) {
          this.snackBar.open(error?.error?.message || 'ไม่สามารถลบได้', 'ปิด', {
            duration: 3000,
          });
        }
      });
  }

  initialize() {
    this.axDialog
      .confirm({
        title: 'Initialize รายการยา',
        message:
          'จะดึงรายการยาทั้งหมดพร้อมคำนวณยอดใช้ย้อนหลัง 3 ปี, ราคา และสต็อกปัจจุบัน\n\nหากมีข้อมูลอยู่แล้ว จะถูกเขียนทับ',
        confirmText: 'Initialize',
        cancelText: 'ยกเลิก',
        isDangerous: false,
      })
      .subscribe(async (confirmed) => {
        if (!confirmed) return;

        this.actionLoading.set(true);
        try {
          const response = await firstValueFrom(
            this.http.post<any>(
              `/inventory/budget/budget-requests/${this.requestId}/initialize`,
              {},
            ),
          );
          this.snackBar.open(
            `Initialize สำเร็จ ${response.data?.itemsCreated || 0} รายการ`,
            'ปิด',
            { duration: 3000 },
          );
          await this.loadItems();
          await this.loadData();
        } catch (error: any) {
          this.snackBar.open(
            error?.error?.message || 'Initialize ไม่สำเร็จ',
            'ปิด',
            { duration: 3000 },
          );
        } finally {
          this.actionLoading.set(false);
        }
      });
  }

  initializeFromMaster() {
    this.axDialog
      .confirm({
        title: 'ดึงรายการยาจาก Drug Master',
        message:
          'จะดึงรายการยาทั้งหมด (ไม่คำนวณยอดใช้ย้อนหลัง) ค่าทุกอย่างจะเป็น 0\n\nหากมีข้อมูลอยู่แล้ว จะถูกเขียนทับ',
        confirmText: 'ดึงรายการ',
        cancelText: 'ยกเลิก',
        isDangerous: false,
      })
      .subscribe(async (confirmed) => {
        if (!confirmed) return;

        this.actionLoading.set(true);
        try {
          const response = await firstValueFrom(
            this.http.post<any>(
              `/inventory/budget/budget-requests/${this.requestId}/initialize-from-master`,
              {},
            ),
          );
          this.snackBar.open(
            `ดึงรายการยาสำเร็จ ${response.data?.itemsCreated || 0} รายการ`,
            'ปิด',
            { duration: 3000 },
          );
          await this.loadItems();
          await this.loadData();
        } catch (error: any) {
          this.snackBar.open(
            error?.error?.message || 'ดึงรายการยาไม่สำเร็จ',
            'ปิด',
            { duration: 3000 },
          );
        } finally {
          this.actionLoading.set(false);
        }
      });
  }

  resetAll() {
    const count = this.items().length;
    this.axDialog
      .confirm({
        title: 'ลบรายการทั้งหมด',
        message: `คุณต้องการลบรายการยาทั้งหมด ${count} รายการ หรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้`,
        confirmText: 'ลบทั้งหมด',
        cancelText: 'ยกเลิก',
        isDangerous: true,
      })
      .subscribe(async (confirmed) => {
        if (!confirmed) return;

        this.actionLoading.set(true);
        try {
          // Delete all items for this budget request
          const itemIds = this.items().map((item) => item.id);

          // Use batch delete if available, otherwise delete one by one
          for (const id of itemIds) {
            await firstValueFrom(
              this.http.delete(`/inventory/budget/budget-request-items/${id}`),
            );
          }

          this.snackBar.open(`ลบรายการสำเร็จ ${count} รายการ`, 'ปิด', {
            duration: 3000,
          });
          await this.loadItems();
          await this.loadData();
        } catch (error: any) {
          this.snackBar.open(
            error?.error?.message || 'ลบรายการไม่สำเร็จ',
            'ปิด',
            { duration: 3000 },
          );
        } finally {
          this.actionLoading.set(false);
        }
      });
  }

  async importExcel() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      this.actionLoading.set(true);
      try {
        const response = await firstValueFrom(
          this.http.post<any>(
            `/inventory/budget/budget-requests/${this.requestId}/import`,
            formData,
          ),
        );
        this.snackBar.open(
          `Import สำเร็จ ${response.data?.imported || 0} รายการ`,
          'ปิด',
          { duration: 3000 },
        );
        await this.loadItems();
        await this.loadData();
      } catch (error: any) {
        this.snackBar.open(error?.error?.message || 'Import ไม่สำเร็จ', 'ปิด', {
          duration: 3000,
        });
      } finally {
        this.actionLoading.set(false);
      }
    };
    input.click();
  }

  addDrug() {
    // Get existing generic IDs to prevent duplicates
    const existingGenericIds = this.items()
      .map((item) => item.generic_id)
      .filter((id): id is number => id !== undefined && id !== null);

    const dialogRef = this.dialog.open(AddDrugDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: {
        budgetRequestId: this.requestId,
        existingGenericIds,
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.loadItems();
        await this.loadData();
      }
    });
  }

  async saveAll() {
    if (this.modifiedItemIds.size === 0) return;

    this.actionLoading.set(true);
    try {
      const modifiedItems = this.items().filter((item) =>
        this.modifiedItemIds.has(item.id),
      );

      // Update each modified item
      for (const item of modifiedItems) {
        await firstValueFrom(
          this.http.patch(`/inventory/budget/budget-request-items/${item.id}`, {
            unit_price: item.unit_price,
            requested_qty: item.requested_qty,
            q1_qty: item.q1_qty,
            q2_qty: item.q2_qty,
            q3_qty: item.q3_qty,
            q4_qty: item.q4_qty,
          }),
        );
      }

      this.snackBar.open(`บันทึกสำเร็จ ${modifiedItems.length} รายการ`, 'ปิด', {
        duration: 3000,
      });
      this.modifiedItemIds.clear();
      await this.loadData();
    } catch (error: any) {
      this.snackBar.open(error?.error?.message || 'บันทึกไม่สำเร็จ', 'ปิด', {
        duration: 3000,
      });
    } finally {
      this.actionLoading.set(false);
    }
  }

  submit() {
    this.axDialog
      .confirm({
        title: 'Submit คำของบประมาณ',
        message: 'ต้องการ Submit คำขอเพื่อขออนุมัติหรือไม่?',
        confirmText: 'Submit',
        cancelText: 'ยกเลิก',
        isDangerous: false,
      })
      .subscribe(async (confirmed) => {
        if (!confirmed) return;

        this.actionLoading.set(true);
        try {
          await firstValueFrom(
            this.http.post<any>(
              `/inventory/budget/budget-requests/${this.requestId}/submit`,
              {},
            ),
          );
          this.snackBar.open('Submit สำเร็จ', 'ปิด', { duration: 3000 });
          await this.loadData();
        } catch (error: any) {
          this.snackBar.open(
            error?.error?.message || 'Submit ไม่สำเร็จ',
            'ปิด',
            {
              duration: 3000,
            },
          );
        } finally {
          this.actionLoading.set(false);
        }
      });
  }

  approveDept() {
    this.axDialog
      .confirm({
        title: 'อนุมัติ (หัวหน้างาน)',
        message: 'ต้องการอนุมัติคำของบประมาณนี้หรือไม่?',
        confirmText: 'อนุมัติ',
        cancelText: 'ยกเลิก',
        isDangerous: false,
      })
      .subscribe(async (confirmed) => {
        if (!confirmed) return;

        this.actionLoading.set(true);
        try {
          await firstValueFrom(
            this.http.post<any>(
              `/inventory/budget/budget-requests/${this.requestId}/approve-dept`,
              {},
            ),
          );
          this.snackBar.open('อนุมัติสำเร็จ', 'ปิด', { duration: 3000 });
          await this.loadData();
        } catch (error: any) {
          this.snackBar.open(
            error?.error?.message || 'อนุมัติไม่สำเร็จ',
            'ปิด',
            {
              duration: 3000,
            },
          );
        } finally {
          this.actionLoading.set(false);
        }
      });
  }

  approveFinance() {
    this.axDialog
      .confirm({
        title: 'อนุมัติ (การเงิน)',
        message:
          'ต้องการอนุมัติคำของบประมาณนี้หรือไม่?\n\nระบบจะจัดสรรงบประมาณให้อัตโนมัติ',
        confirmText: 'อนุมัติ',
        cancelText: 'ยกเลิก',
        isDangerous: false,
      })
      .subscribe(async (confirmed) => {
        if (!confirmed) return;

        this.actionLoading.set(true);
        try {
          await firstValueFrom(
            this.http.post<any>(
              `/inventory/budget/budget-requests/${this.requestId}/approve-finance`,
              {},
            ),
          );
          this.snackBar.open('อนุมัติและจัดสรรงบประมาณสำเร็จ', 'ปิด', {
            duration: 3000,
          });
          await this.loadData();
        } catch (error: any) {
          this.snackBar.open(
            error?.error?.message || 'อนุมัติไม่สำเร็จ',
            'ปิด',
            {
              duration: 3000,
            },
          );
        } finally {
          this.actionLoading.set(false);
        }
      });
  }

  async reject() {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
    if (!reason) return;

    this.actionLoading.set(true);
    try {
      await firstValueFrom(
        this.http.post<any>(
          `/inventory/budget/budget-requests/${this.requestId}/reject`,
          { reason },
        ),
      );
      this.snackBar.open('ปฏิเสธสำเร็จ', 'ปิด', { duration: 3000 });
      await this.loadData();
    } catch (error: any) {
      this.snackBar.open(error?.error?.message || 'ปฏิเสธไม่สำเร็จ', 'ปิด', {
        duration: 3000,
      });
    } finally {
      this.actionLoading.set(false);
    }
  }

  async exportSSCJ() {
    this.actionLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get(
          `/inventory/budget/budget-requests/${this.requestId}/export-sscj`,
          {
            responseType: 'blob',
          },
        ),
      );

      const url = window.URL.createObjectURL(response);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-request-${this.budgetRequest()?.request_number}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      this.snackBar.open('Export สำเร็จ', 'ปิด', { duration: 3000 });
    } catch (error: any) {
      this.snackBar.open(error?.error?.message || 'Export ไม่สำเร็จ', 'ปิด', {
        duration: 3000,
      });
    } finally {
      this.actionLoading.set(false);
    }
  }
}
