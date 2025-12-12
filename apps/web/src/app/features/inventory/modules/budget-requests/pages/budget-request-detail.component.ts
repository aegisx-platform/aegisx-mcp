import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  HostListener,
} from '@angular/core';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { firstValueFrom } from 'rxjs';
import {
  AxDialogService,
  AxErrorStateComponent,
  AxStatsCardComponent,
  AxAlertComponent,
} from '@aegisx/ui';
import { AxTmtBadgeComponent } from '../../../../../shared/ui/components/tmt';
import { AddDrugDialogComponent } from '../components/add-drug-dialog.component';
import { BudgetRequestImportDialogComponent } from '../components/budget-request-import-dialog.component';
import {
  AdjustPriceDialogComponent,
  AdjustPriceResult,
} from '../components/adjust-price-dialog.component';

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

type EdCategory = 'ED' | 'NED' | 'CM' | 'NDMS' | null;

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
  // Drug category fields from API
  budget_type_id?: number | null;
  budget_category_id?: number | null;
  // ED Classification from drug_generics
  ed_category?: EdCategory;
  // Historical data (JSONB from backend)
  historical_usage?: Record<string, number>;
  avg_usage?: number;
  estimated_usage_2569?: number;
  current_stock?: number;
  // TMT GPU code from drug_generics JOIN
  tmt_gpu_code?: string;
  working_code?: string;
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
    MatCheckboxModule,
    AxErrorStateComponent,
    AxStatsCardComponent,
    AxAlertComponent,
    AxTmtBadgeComponent,
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
                matTooltip="กลับไปหน้ารายการคำขอ"
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

        <!-- Budget Category Stats Cards -->
        @if (items().length > 0) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ax-stats-card
              title="ในบัญชี (ED)"
              [value]="'฿' + (inListAmount() | number: '1.2-2')"
              [change]="inListCount() + ' รายการ'"
              icon="medication"
            ></ax-stats-card>
            <ax-stats-card
              title="นอกบัญชี (Non-ED)"
              [value]="'฿' + (outListAmount() | number: '1.2-2')"
              [change]="outListCount() + ' รายการ'"
              icon="medical_services"
            ></ax-stats-card>
            <ax-stats-card
              title="ยาสารเคมี"
              [value]="'฿' + (chemicalAmount() | number: '1.2-2')"
              [change]="chemicalCount() + ' รายการ'"
              icon="science"
            ></ax-stats-card>
            <ax-stats-card
              title="ยอดรวมทั้งหมด"
              [value]="'฿' + (totalAmount() | number: '1.2-2')"
              [change]="items().length + ' รายการ'"
              icon="account_balance_wallet"
            ></ax-stats-card>
          </div>
        }

        <!-- Action Loading Overlay -->
        @if (actionLoading()) {
          <mat-card class="!shadow-sm">
            <mat-card-content class="!p-8 text-center">
              <mat-spinner class="!mx-auto" [diameter]="48"></mat-spinner>
              <p
                class="text-base font-medium text-[var(--ax-text-default)] mt-4"
              >
                {{ actionMessage() || 'กำลังดำเนินการ...' }}
              </p>
              <p class="text-sm text-[var(--ax-text-secondary)] mt-1">
                กรุณารอสักครู่
              </p>
            </mat-card-content>
          </mat-card>
        }

        @if (loading()) {
          <mat-card class="!shadow-sm">
            <mat-card-content class="!p-12 text-center">
              <mat-spinner class="!mx-auto" [diameter]="40"></mat-spinner>
              <p class="text-sm text-[var(--ax-text-secondary)] mt-4">
                กำลังโหลดข้อมูล...
              </p>
            </mat-card-content>
          </mat-card>
        } @else if (error()) {
          <ax-error-state
            [statusCode]="error()!.status"
            [message]="error()!.message"
            [actions]="[
              {
                label: 'ลองใหม่',
                icon: 'refresh',
                primary: true,
                callback: retryLoad.bind(this),
              },
              {
                label: 'กลับหน้ารายการ',
                icon: 'arrow_back',
                callback: goBack.bind(this),
              },
            ]"
          ></ax-error-state>
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
                    matTooltip="นำเข้าข้อมูลจากไฟล์ Excel (SSCJ Format)"
                  >
                    <mat-icon>upload_file</mat-icon>
                    <span class="ml-1">Import Excel</span>
                  </button>
                  <button
                    mat-stroked-button
                    (click)="addDrug()"
                    [disabled]="actionLoading()"
                    matTooltip="เพิ่มรายการยาทีละรายการ"
                  >
                    <mat-icon>add</mat-icon>
                    <span class="ml-1">Add Drug</span>
                  </button>
                  <button
                    mat-stroked-button
                    (click)="showAdjustPriceDialog()"
                    [disabled]="actionLoading() || items().length === 0"
                    matTooltip="ปรับราคา/จำนวนเป็น % (ทุกรายการ หรือเฉพาะที่เลือก)"
                  >
                    <mat-icon>percent</mat-icon>
                    <span class="ml-1">ปรับ %</span>
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

                  <!-- Unsaved changes warning (visible in button bar) -->
                  @if (hasChanges()) {
                    <div
                      class="flex items-center gap-2 px-3 py-1.5 bg-[var(--ax-warning-faint)] text-[var(--ax-warning-default)] rounded-md animate-pulse"
                    >
                      <mat-icon class="!text-base !w-4 !h-4">warning</mat-icon>
                      <span class="text-sm font-medium"
                        >ยังไม่ได้บันทึก:
                        {{ modifiedItems().length }} รายการ</span
                      >
                    </div>
                  }

                  <!-- Save All: เด่นเมื่อมีการแก้ไข -->
                  @if (hasChanges()) {
                    <button
                      mat-flat-button
                      color="accent"
                      (click)="saveAll()"
                      [disabled]="actionLoading()"
                      matTooltip="บันทึกการแก้ไขทั้งหมด"
                    >
                      <mat-icon>save</mat-icon>
                      <span class="ml-1">Save All</span>
                    </button>
                  } @else {
                    <button
                      mat-stroked-button
                      [disabled]="true"
                      matTooltip="ไม่มีการแก้ไข"
                    >
                      <mat-icon>save</mat-icon>
                      <span class="ml-1">Save All</span>
                    </button>
                  }

                  <!-- Submit: เด่นเมื่อไม่มีการแก้ไข -->
                  @if (hasChanges()) {
                    <button
                      mat-stroked-button
                      [disabled]="true"
                      matTooltip="กรุณาบันทึกก่อน Submit"
                    >
                      <mat-icon>send</mat-icon>
                      <span class="ml-1">Submit</span>
                    </button>
                  } @else {
                    <button
                      mat-flat-button
                      color="primary"
                      (click)="submit()"
                      [disabled]="actionLoading() || items().length === 0"
                      matTooltip="ส่งคำขอเพื่อรออนุมัติ"
                    >
                      <mat-icon>send</mat-icon>
                      <span class="ml-1">Submit</span>
                    </button>
                  }
                }

                <!-- SUBMITTED mode buttons -->
                @if (budgetRequest()?.status === 'SUBMITTED') {
                  <button
                    mat-raised-button
                    color="primary"
                    (click)="approveDept()"
                    [disabled]="actionLoading()"
                    matTooltip="อนุมัติโดยหัวหน้างาน"
                  >
                    <mat-icon>thumb_up</mat-icon>
                    <span class="ml-1">Approve (Dept)</span>
                  </button>
                  <button
                    mat-raised-button
                    color="warn"
                    (click)="reject()"
                    [disabled]="actionLoading()"
                    matTooltip="ปฏิเสธคำขอ พร้อมระบุเหตุผล"
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
                    matTooltip="อนุมัติโดยการเงินและจัดสรรงบประมาณ"
                  >
                    <mat-icon>thumb_up</mat-icon>
                    <span class="ml-1">Approve (Finance)</span>
                  </button>
                  <button
                    mat-raised-button
                    color="warn"
                    (click)="reject()"
                    [disabled]="actionLoading()"
                    matTooltip="ปฏิเสธคำขอ พร้อมระบุเหตุผล"
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
                  matTooltip="ดาวน์โหลดไฟล์ Excel ตามรูปแบบ SSCJ"
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
                  subscriptSizing="dynamic"
                  class="!flex-1 dense-field"
                >
                  <mat-label>ค้นหารายการยา</mat-label>
                  <input
                    matInput
                    [(ngModel)]="searchTerm"
                    placeholder="รหัสยา, ชื่อยา..."
                    (keyup.enter)="applySearch()"
                  />
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                <mat-form-field
                  appearance="outline"
                  subscriptSizing="dynamic"
                  class="!w-48 dense-field"
                >
                  <mat-label>ค้นหาตาม</mat-label>
                  <mat-select [(ngModel)]="searchField">
                    <mat-option value="generic_code">รหัส GPU</mat-option>
                    <mat-option value="generic_name">ชื่อยา</mat-option>
                    <mat-option value="all">ทั้งหมด</mat-option>
                  </mat-select>
                </mat-form-field>
                <button
                  mat-flat-button
                  color="primary"
                  (click)="applySearch()"
                  matTooltip="ค้นหารายการยา (กด Enter ได้)"
                >
                  <mat-icon>search</mat-icon>
                  ค้นหา
                </button>
                @if (searchTerm) {
                  <button
                    mat-stroked-button
                    (click)="clearSearch()"
                    matTooltip="ล้างการค้นหาและแสดงทั้งหมด"
                  >
                    <mat-icon>clear</mat-icon>
                    ล้าง
                  </button>
                }
              </div>

              <!-- Data Filter Chips - Minimal Style -->
              @if (items().length > 0) {
                <div
                  class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100"
                >
                  <span class="text-sm text-gray-400 mr-1">กรอง:</span>
                  <mat-chip-listbox
                    [value]="dataFilter()"
                    (change)="dataFilter.set($event.value); pageIndex = 0"
                    class="filter-chips"
                    aria-label="เลือก filter"
                  >
                    <mat-chip-option
                      value="all"
                      [selected]="dataFilter() === 'all'"
                    >
                      ทั้งหมด ({{ items().length }})
                    </mat-chip-option>
                    <mat-chip-option
                      value="zero_price"
                      [selected]="dataFilter() === 'zero_price'"
                      [disabled]="zeroPriceCount() === 0"
                    >
                      ราคา = 0 ({{ zeroPriceCount() }})
                    </mat-chip-option>
                    <mat-chip-option
                      value="zero_qty"
                      [selected]="dataFilter() === 'zero_qty'"
                      [disabled]="zeroQtyCount() === 0"
                    >
                      จำนวน = 0 ({{ zeroQtyCount() }})
                    </mat-chip-option>
                    <mat-chip-option
                      value="zero_any"
                      [selected]="dataFilter() === 'zero_any'"
                      [disabled]="zeroAnyCount() === 0"
                    >
                      มีค่า 0 ({{ zeroAnyCount() }})
                    </mat-chip-option>
                    <mat-chip-option
                      value="has_gpu"
                      [selected]="dataFilter() === 'has_gpu'"
                      [disabled]="hasGpuCount() === 0"
                    >
                      มี GPU ({{ hasGpuCount() }})
                    </mat-chip-option>
                    <mat-chip-option
                      value="no_gpu"
                      [selected]="dataFilter() === 'no_gpu'"
                      [disabled]="noGpuCount() === 0"
                    >
                      ไม่มี GPU ({{ noGpuCount() }})
                    </mat-chip-option>
                  </mat-chip-listbox>
                  @if (dataFilter() !== 'all') {
                    <button
                      mat-icon-button
                      (click)="dataFilter.set('all')"
                      matTooltip="ล้าง filter"
                      class="!w-6 !h-6 !leading-6"
                    >
                      <mat-icon class="!text-sm">close</mat-icon>
                    </button>
                  }
                </div>
              }
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
                      matTooltip="ดึงรายการยาพร้อมคำนวณยอดใช้ย้อนหลัง ราคา และสต็อก"
                    >
                      <mat-icon>auto_fix_high</mat-icon>
                      Initialize
                    </button>
                    <button
                      mat-stroked-button
                      (click)="initializeFromMaster()"
                      [disabled]="actionLoading()"
                      matTooltip="ดึงรายการยาจาก Drug Master (ไม่คำนวณยอดใช้)"
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
                  <!-- Select Checkbox Column -->
                  <ng-container matColumnDef="select">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="!text-center !w-12"
                    >
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <mat-checkbox
                          [checked]="isAllSelected()"
                          [indeterminate]="isIndeterminate()"
                          (change)="toggleSelectAll()"
                          tabindex="-1"
                        ></mat-checkbox>
                      }
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-center">
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <mat-checkbox
                          [checked]="isSelected(item.id)"
                          (change)="toggleSelectItem(item.id)"
                          (click)="$event.stopPropagation()"
                          tabindex="-1"
                        ></mat-checkbox>
                      }
                    </td>
                  </ng-container>

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

                  <!-- GPU Code Column (Sticky) - TMT GPU code for budget planning -->
                  <ng-container matColumnDef="generic_code" sticky>
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="sticky-column sticky-code !min-w-[80px]"
                    >
                      รหัส GPU
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let item"
                      class="sticky-column sticky-code"
                      [matTooltip]="
                        item.working_code
                          ? 'รหัส รพ.: ' + item.working_code
                          : ''
                      "
                    >
                      @if (item.tmt_gpu_code) {
                        <ax-tmt-badge
                          [code]="item.tmt_gpu_code"
                          level="GPU"
                          size="sm"
                          [clickable]="true"
                          [showLevel]="false"
                        ></ax-tmt-badge>
                      }
                    </td>
                  </ng-container>

                  <!-- Generic Name Column (Sticky) -->
                  <ng-container matColumnDef="generic_name" sticky>
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="sticky-column sticky-name !min-w-[280px]"
                    >
                      ชื่อยา
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let item"
                      class="sticky-column sticky-name"
                    >
                      <div class="drug-name-cell group relative">
                        <span>{{ item.generic_name }}</span>
                        <button
                          mat-icon-button
                          class="copy-btn !absolute !right-0 !top-1/2 !-translate-y-1/2 !w-6 !h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          (click)="
                            copyDrugName(item.generic_name);
                            $event.stopPropagation()
                          "
                          matTooltip="คัดลอกชื่อยา"
                        >
                          <mat-icon class="!text-base !w-4 !h-4"
                            >content_copy</mat-icon
                          >
                        </button>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Unit Column -->
                  <ng-container matColumnDef="unit">
                    <th mat-header-cell *matHeaderCellDef>หน่วย</th>
                    <td mat-cell *matCellDef="let item">{{ item.unit }}</td>
                  </ng-container>

                  <!-- Historical Usage Year 1 Column (Editable) - Dynamic based on fiscal_year -->
                  <ng-container matColumnDef="usage_year1">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      ปี{{ historicalYears().label1 }}
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <input
                          type="number"
                          min="0"
                          [value]="
                            getHistoricalUsage(item, historicalYears().year1)
                          "
                          (change)="
                            updateHistoricalUsage(
                              item,
                              historicalYears().year1,
                              $event
                            )
                          "
                          (click)="$event.stopPropagation()"
                          class="w-16 text-right px-2 py-1 border rounded bg-blue-50 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      } @else {
                        {{
                          getHistoricalUsage(item, historicalYears().year1)
                            | number: '1.0-0'
                        }}
                      }
                    </td>
                  </ng-container>

                  <!-- Historical Usage Year 2 Column (Editable) - Dynamic based on fiscal_year -->
                  <ng-container matColumnDef="usage_year2">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      ปี{{ historicalYears().label2 }}
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <input
                          type="number"
                          min="0"
                          [value]="
                            getHistoricalUsage(item, historicalYears().year2)
                          "
                          (change)="
                            updateHistoricalUsage(
                              item,
                              historicalYears().year2,
                              $event
                            )
                          "
                          (click)="$event.stopPropagation()"
                          class="w-16 text-right px-2 py-1 border rounded bg-blue-50 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      } @else {
                        {{
                          getHistoricalUsage(item, historicalYears().year2)
                            | number: '1.0-0'
                        }}
                      }
                    </td>
                  </ng-container>

                  <!-- Historical Usage Year 3 Column (Editable) - Dynamic based on fiscal_year -->
                  <ng-container matColumnDef="usage_year3">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      ปี{{ historicalYears().label3 }}
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <input
                          type="number"
                          min="0"
                          [value]="
                            getHistoricalUsage(item, historicalYears().year3)
                          "
                          (change)="
                            updateHistoricalUsage(
                              item,
                              historicalYears().year3,
                              $event
                            )
                          "
                          (click)="$event.stopPropagation()"
                          class="w-16 text-right px-2 py-1 border rounded bg-blue-50 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      } @else {
                        {{
                          getHistoricalUsage(item, historicalYears().year3)
                            | number: '1.0-0'
                        }}
                      }
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

                  <!-- Trend Sparkline Column -->
                  <ng-container matColumnDef="trend">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="!text-center !w-20"
                    >
                      แนวโน้ม
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let item"
                      class="!text-center !px-1"
                    >
                      <div
                        class="sparkline-container"
                        [matTooltip]="getSparklineTooltip(item)"
                      >
                        <svg
                          width="60"
                          height="24"
                          viewBox="0 0 60 24"
                          class="sparkline"
                        >
                          <polyline
                            [attr.points]="getSparklinePoints(item)"
                            fill="none"
                            [attr.stroke]="getSparklineColor(item)"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <!-- Data points -->
                          @for (
                            point of getSparklineDataPoints(item);
                            track $index
                          ) {
                            <circle
                              [attr.cx]="point.x"
                              [attr.cy]="point.y"
                              r="3"
                              [attr.fill]="getSparklineColor(item)"
                            />
                          }
                        </svg>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Estimated Usage Column - Dynamic based on fiscal_year -->
                  <ng-container matColumnDef="estimated_usage">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      ประมาณ{{ historicalYears().fiscalYearLabel }}
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      {{ item.estimated_usage_2569 | number: '1.0-0' }}
                    </td>
                  </ng-container>

                  <!-- Current Stock Column (Editable) -->
                  <ng-container matColumnDef="current_stock">
                    <th mat-header-cell *matHeaderCellDef class="!text-right">
                      คงเหลือ
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-right">
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <input
                          type="number"
                          min="0"
                          [value]="item.current_stock"
                          (change)="
                            updateItemField(item, 'current_stock', $event)
                          "
                          (click)="$event.stopPropagation()"
                          class="w-20 text-right px-2 py-1 border rounded bg-green-50 border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                      } @else {
                        {{ item.current_stock | number: '1.0-0' }}
                      }
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
                          min="0"
                          [value]="item.unit_price"
                          (change)="updateItemField(item, 'unit_price', $event)"
                          (click)="$event.stopPropagation()"
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
                          min="0"
                          [value]="item.requested_qty"
                          (change)="
                            updateItemField(item, 'requested_qty', $event)
                          "
                          (click)="$event.stopPropagation()"
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
                          min="0"
                          [value]="item.q1_qty"
                          (change)="updateItemField(item, 'q1_qty', $event)"
                          (click)="$event.stopPropagation()"
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
                          min="0"
                          [value]="item.q2_qty"
                          (change)="updateItemField(item, 'q2_qty', $event)"
                          (click)="$event.stopPropagation()"
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
                          min="0"
                          [value]="item.q3_qty"
                          (change)="updateItemField(item, 'q3_qty', $event)"
                          (click)="$event.stopPropagation()"
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
                          min="0"
                          [value]="item.q4_qty"
                          (change)="updateItemField(item, 'q4_qty', $event)"
                          (click)="$event.stopPropagation()"
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
                          (click)="deleteItem(item); $event.stopPropagation()"
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
                    [class.selected-row]="isSelected(row.id)"
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

            <!-- Selection Floating Bar -->
            @if (hasSelection() && budgetRequest()?.status === 'DRAFT') {
              <div
                class="fixed bottom-4 left-6 z-50
                       bg-[var(--ax-primary-default)] text-white shadow-2xl rounded-lg
                       px-5 py-3 flex items-center gap-4"
              >
                <div class="flex items-center gap-2">
                  <mat-icon class="text-white">check_circle</mat-icon>
                  <span class="font-bold text-white text-base">
                    {{ selectedCount() | number }} รายการถูกเลือก
                  </span>
                </div>
                <div class="w-px h-6 bg-white/30"></div>
                <button
                  mat-raised-button
                  color="warn"
                  (click)="bulkDeleteSelected()"
                  [disabled]="actionLoading()"
                  matTooltip="ลบรายการที่เลือกทั้งหมด"
                >
                  <mat-icon>delete</mat-icon>
                  <span class="ml-1">ลบที่เลือก</span>
                </button>
                <button
                  mat-icon-button
                  class="!text-white hover:!bg-white/20"
                  (click)="clearSelection()"
                  matTooltip="ยกเลิกการเลือก"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }
          }

          <!-- Validation Warnings Section -->
          @if (
            items().length > 0 && (zeroPriceCount() > 0 || zeroQtyCount() > 0)
          ) {
            <mat-card
              class="!shadow-sm !border-l-4 !border-l-orange-500 !bg-orange-50"
            >
              <mat-card-content class="!p-4">
                <div class="flex items-start gap-3">
                  <mat-icon class="text-orange-500 !text-2xl">warning</mat-icon>
                  <div class="flex-1">
                    <div class="font-semibold text-orange-800 mb-2">
                      ตรวจสอบข้อมูลก่อนบันทึก
                    </div>
                    <div class="flex flex-wrap gap-4 text-sm">
                      @if (zeroPriceCount() > 0) {
                        <div
                          class="flex items-center gap-2 px-3 py-1.5 bg-orange-100 rounded-lg cursor-pointer hover:bg-orange-200 transition-colors"
                          (click)="dataFilter.set('zero_price'); pageIndex = 0"
                        >
                          <mat-icon class="!text-lg text-orange-600"
                            >attach_money</mat-icon
                          >
                          <span class="text-orange-800">
                            <span class="font-bold">{{
                              zeroPriceCount()
                            }}</span>
                            รายการ ราคา = 0
                          </span>
                        </div>
                      }
                      @if (zeroQtyCount() > 0) {
                        <div
                          class="flex items-center gap-2 px-3 py-1.5 bg-orange-100 rounded-lg cursor-pointer hover:bg-orange-200 transition-colors"
                          (click)="dataFilter.set('zero_qty'); pageIndex = 0"
                        >
                          <mat-icon class="!text-lg text-orange-600"
                            >inventory</mat-icon
                          >
                          <span class="text-orange-800">
                            <span class="font-bold">{{ zeroQtyCount() }}</span>
                            รายการ จำนวน = 0
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }

          <!-- Uncategorized items note -->
          @if (items().length > 0 && uncategorizedCount() > 0) {
            <div class="text-xs text-gray-500 flex items-center gap-1">
              <mat-icon class="!text-sm">info</mat-icon>
              มี {{ uncategorizedCount() }} รายการ (฿{{
                uncategorizedAmount() | number: '1.2-2'
              }}) ที่ยังไม่ได้จัดหมวดหมู่
            </div>
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
          padding-top: 10px !important;
          padding-bottom: 10px !important;
        }
        ::ng-deep .mat-mdc-text-field-wrapper {
          height: 40px !important;
        }
        ::ng-deep .mat-mdc-floating-label {
          top: 20px !important;
        }
        ::ng-deep input.mat-mdc-input-element {
          height: 20px !important;
          line-height: 20px !important;
        }
        ::ng-deep .mat-mdc-select-value {
          height: 20px !important;
          line-height: 20px !important;
        }
      }
      .btn-with-icon {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
      }
      /* Minimal filter chips style */
      .filter-chips {
        display: flex;
        gap: 8px;

        ::ng-deep .mat-mdc-chip-option {
          height: 28px !important;
          font-size: 13px !important;
          background: transparent !important;
          border: 1px solid #e5e7eb !important;
          color: #6b7280 !important;

          &.mat-mdc-chip-selected {
            background: #f3f4f6 !important;
            border-color: #9ca3af !important;
            color: #374151 !important;
          }

          &:not(.mat-mdc-chip-disabled):hover {
            background: #f9fafb !important;
          }

          &.mat-mdc-chip-disabled {
            opacity: 0.4 !important;
          }
        }

        ::ng-deep .mdc-evolution-chip__cell--primary {
          padding: 0 12px !important;
        }

        ::ng-deep .mat-mdc-chip-action-label {
          font-weight: 400 !important;
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
      /* Sticky columns - use :host ::ng-deep for Angular encapsulation */
      :host ::ng-deep .items-table .mat-mdc-cell.sticky-column,
      :host ::ng-deep .items-table .mat-mdc-header-cell.sticky-column {
        position: sticky !important;
        z-index: 100 !important;
      }
      :host ::ng-deep .items-table .mat-mdc-header-cell.sticky-column {
        background-color: #ffffff !important;
        z-index: 101 !important;
      }
      :host ::ng-deep .items-table .mat-mdc-cell.sticky-column {
        background-color: #ffffff !important;
      }
      :host ::ng-deep .items-table .sticky-code {
        left: 0 !important;
        min-width: 100px !important;
        max-width: 100px !important;
      }
      :host ::ng-deep .items-table .sticky-name {
        left: 100px !important;
        min-width: 280px !important;
        box-shadow: 4px 0 8px -2px rgba(0, 0, 0, 0.15) !important;
      }
      :host ::ng-deep .items-table tr.selected-row .mat-mdc-cell.sticky-column {
        background-color: #dbeafe !important;
      }
      :host ::ng-deep .items-table tr:hover .mat-mdc-cell.sticky-column {
        background-color: #f1f5f9 !important;
      }
      :host ::ng-deep .items-table tr.mat-mdc-row.selected-row {
        background-color: #dbeafe !important;
      }
      :host ::ng-deep .items-table tr.mat-mdc-row.selected-row:hover {
        background-color: #bfdbfe !important;
      }
      :host
        ::ng-deep
        .items-table
        tr.mat-mdc-row.selected-row:hover
        .mat-mdc-cell.sticky-column {
        background-color: #bfdbfe !important;
      }
      /* Sparkline mini chart */
      .sparkline-container {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 4px;
        background: #f8fafc;
        border-radius: 4px;
        cursor: help;
      }
      .sparkline-container:hover {
        background: #f1f5f9;
      }
      .sparkline {
        display: block;
      }
      /* Drug name cell with copy button */
      .drug-name-cell {
        display: flex;
        align-items: center;
        padding-right: 28px;
      }
      .drug-name-cell .copy-btn {
        color: #6b7280;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
      }
      .drug-name-cell .copy-btn:hover {
        color: #3b82f6;
        background: #eff6ff;
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
  actionMessage = signal<string>(''); // Message to show during action loading
  error = signal<{ status: number; message: string } | null>(null);

  // Selection for bulk operations
  selectedItemIds = signal<Set<number>>(new Set());

  // Search
  searchTerm = '';
  searchField = 'all';
  dataFilter = signal<
    'all' | 'zero_price' | 'zero_qty' | 'zero_any' | 'has_gpu' | 'no_gpu'
  >('all');

  // Pagination
  pageSize = 50;
  pageIndex = 0;

  // Track modified items (use signal for reactivity)
  modifiedItemIds = signal<Set<number>>(new Set());

  displayedColumns = [
    'select',
    'line_number',
    'generic_code',
    'generic_name',
    'unit',
    'usage_year1',
    'usage_year2',
    'usage_year3',
    'avg_usage',
    'trend',
    'estimated_usage',
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
    const filter = this.dataFilter();

    // Apply data filter (zero price/qty/gpu)
    if (filter === 'zero_price') {
      result = result.filter(
        (item) => !item.unit_price || item.unit_price === 0,
      );
    } else if (filter === 'zero_qty') {
      result = result.filter(
        (item) => !item.requested_qty || item.requested_qty === 0,
      );
    } else if (filter === 'zero_any') {
      result = result.filter(
        (item) =>
          !item.unit_price ||
          item.unit_price === 0 ||
          !item.requested_qty ||
          item.requested_qty === 0,
      );
    } else if (filter === 'has_gpu') {
      result = result.filter((item) => !!item.tmt_gpu_code);
    } else if (filter === 'no_gpu') {
      result = result.filter((item) => !item.tmt_gpu_code);
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter((item) => {
        if (this.searchField === 'generic_code') {
          // Search by GPU code (tmt_gpu_code) or fall back to generic_code
          return (
            item.tmt_gpu_code?.toLowerCase().includes(term) ||
            item.generic_code?.toLowerCase().includes(term) ||
            item.working_code?.toLowerCase().includes(term)
          );
        } else if (this.searchField === 'generic_name') {
          return item.generic_name?.toLowerCase().includes(term);
        } else {
          return (
            item.tmt_gpu_code?.toLowerCase().includes(term) ||
            item.generic_code?.toLowerCase().includes(term) ||
            item.working_code?.toLowerCase().includes(term) ||
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
    return Array.from(this.modifiedItemIds());
  });

  hasChanges = computed(() => {
    return this.modifiedItemIds().size > 0;
  });

  // Selection computed signals
  selectedCount = computed(() => this.selectedItemIds().size);
  hasSelection = computed(() => this.selectedItemIds().size > 0);

  // Data filter counts
  zeroPriceCount = computed(
    () =>
      this.items().filter((i) => !i.unit_price || i.unit_price === 0).length,
  );
  zeroQtyCount = computed(
    () =>
      this.items().filter(
        (item) => !item.requested_qty || item.requested_qty === 0,
      ).length,
  );
  zeroAnyCount = computed(
    () =>
      this.items().filter(
        (i) =>
          !i.unit_price ||
          i.unit_price === 0 ||
          !i.requested_qty ||
          i.requested_qty === 0,
      ).length,
  );

  // GPU filter counts
  hasGpuCount = computed(
    () => this.items().filter((i) => !!i.tmt_gpu_code).length,
  );
  noGpuCount = computed(
    () => this.items().filter((i) => !i.tmt_gpu_code).length,
  );

  // Dynamic historical usage years based on fiscal_year
  // fiscal_year - 3, fiscal_year - 2, fiscal_year - 1
  historicalYears = computed(() => {
    const fiscalYear =
      this.budgetRequest()?.fiscal_year || new Date().getFullYear() + 543;
    return {
      year1: String(fiscalYear - 3), // e.g., 2566 if fiscal_year = 2569
      year2: String(fiscalYear - 2), // e.g., 2567
      year3: String(fiscalYear - 1), // e.g., 2568
      fiscalYear: String(fiscalYear), // e.g., 2569
      // Short labels for display (last 2 digits)
      label1: String(fiscalYear - 3).slice(-2), // e.g., "66"
      label2: String(fiscalYear - 2).slice(-2), // e.g., "67"
      label3: String(fiscalYear - 1).slice(-2), // e.g., "68"
      fiscalYearLabel: String(fiscalYear).slice(-2), // e.g., "69"
    };
  });

  // Category stats computed signals (ed_category from drug_generics)
  // ED = ยาในบัญชียาหลัก, NED = ยานอกบัญชี, CM = ยาเคมี/สัญญา, NDMS = ยา NDMS
  inListAmount = computed(() => {
    return this.items()
      .filter((i) => i.ed_category === 'ED')
      .reduce((sum, item) => sum + (item.requested_amount || 0), 0);
  });
  outListAmount = computed(() => {
    return this.items()
      .filter((i) => i.ed_category === 'NED')
      .reduce((sum, item) => sum + (item.requested_amount || 0), 0);
  });
  chemicalAmount = computed(() => {
    return this.items()
      .filter((i) => i.ed_category === 'CM' || i.ed_category === 'NDMS')
      .reduce((sum, item) => sum + (item.requested_amount || 0), 0);
  });
  uncategorizedAmount = computed(() => {
    return this.items()
      .filter(
        (i) =>
          !i.ed_category ||
          !['ED', 'NED', 'CM', 'NDMS'].includes(i.ed_category),
      )
      .reduce((sum, item) => sum + (item.requested_amount || 0), 0);
  });
  // Count by category
  inListCount = computed(
    () => this.items().filter((i) => i.ed_category === 'ED').length,
  );
  outListCount = computed(
    () => this.items().filter((i) => i.ed_category === 'NED').length,
  );
  chemicalCount = computed(
    () =>
      this.items().filter(
        (i) => i.ed_category === 'CM' || i.ed_category === 'NDMS',
      ).length,
  );
  uncategorizedCount = computed(
    () =>
      this.items().filter(
        (i) =>
          !i.ed_category ||
          !['ED', 'NED', 'CM', 'NDMS'].includes(i.ed_category),
      ).length,
  );

  isAllSelected = computed(() => {
    const items = this.items();
    const selected = this.selectedItemIds();
    return items.length > 0 && items.every((item) => selected.has(item.id));
  });
  isIndeterminate = computed(() => {
    const items = this.items();
    const selected = this.selectedItemIds();
    const selectedCount = items.filter((item) => selected.has(item.id)).length;
    return selectedCount > 0 && selectedCount < items.length;
  });

  private get requestId(): string {
    return this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.loadData();
  }

  // Warn user when leaving page with unsaved changes
  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(event: BeforeUnloadEvent): boolean {
    if (this.modifiedItemIds().size > 0) {
      event.preventDefault();
      // Chrome requires returnValue to be set
      event.returnValue =
        'มีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?';
      return false;
    }
    return true;
  }

  async loadData() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(
        this.http.get<any>(
          `/inventory/budget/budget-requests/${this.requestId}`,
        ),
      );
      this.budgetRequest.set(response.data);
      await this.loadItems();
    } catch (err: any) {
      console.error('Failed to load budget request:', err);
      const status = err?.status || 500;
      const message =
        err?.error?.message || err?.message || 'ไม่สามารถโหลดข้อมูลได้';
      this.error.set({ status, message });
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
      this.modifiedItemIds.set(new Set());
      // Clear selection when items are reloaded
      this.selectedItemIds.set(new Set());
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  }

  goBack() {
    this.router.navigate(['/inventory/budget/budget-requests']);
  }

  retryLoad() {
    this.loadData();
  }

  // Selection methods
  isSelected(id: number): boolean {
    return this.selectedItemIds().has(id);
  }

  toggleSelectItem(id: number) {
    const current = new Set(this.selectedItemIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedItemIds.set(current);
  }

  toggleSelectAll() {
    const items = this.items();
    if (this.isAllSelected()) {
      // Deselect all
      this.selectedItemIds.set(new Set());
    } else {
      // Select all
      const allIds = new Set(items.map((item) => item.id));
      this.selectedItemIds.set(allIds);
    }
  }

  clearSelection() {
    this.selectedItemIds.set(new Set());
  }

  async bulkDeleteSelected() {
    const count = this.selectedCount();
    if (count === 0) return;

    this.axDialog
      .confirmDelete(`${count} รายการที่เลือก`)
      .subscribe(async (confirmed) => {
        if (!confirmed) return;

        this.actionLoading.set(true);
        this.actionMessage.set(`กำลังลบ ${count} รายการที่เลือก...`);
        try {
          const itemIds = Array.from(this.selectedItemIds());
          await firstValueFrom(
            this.http.post(
              `/inventory/budget/budget-requests/${this.requestId}/items/bulk-delete`,
              { itemIds },
            ),
          );
          this.snackBar.open(`ลบ ${count} รายการสำเร็จ`, 'ปิด', {
            duration: 3000,
          });
          this.clearSelection();
          await this.loadItems();
          await this.loadData();
        } catch (error: any) {
          this.snackBar.open(
            error?.error?.message || 'ไม่สามารถลบรายการที่เลือกได้',
            'ปิด',
            { duration: 3000 },
          );
        } finally {
          this.actionLoading.set(false);
          this.actionMessage.set('');
        }
      });
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

  /**
   * Update historical usage for a specific year and recalculate avg_usage
   * Years are dynamic based on fiscal_year of budget request
   */
  updateHistoricalUsage(item: BudgetRequestItem, year: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;

    // Update the item
    const items = this.items();
    const index = items.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      // Ensure historical_usage object exists
      const historicalUsage = { ...(items[index].historical_usage || {}) };
      historicalUsage[year] = value;

      // Calculate new average from all 3 years (dynamic based on fiscal_year)
      const years = this.historicalYears();
      const usageYear1 = historicalUsage[years.year1] || 0;
      const usageYear2 = historicalUsage[years.year2] || 0;
      const usageYear3 = historicalUsage[years.year3] || 0;
      const newAvgUsage = Math.round(
        (usageYear1 + usageYear2 + usageYear3) / 3,
      );

      // Auto-fill requested_qty from avg_usage if not set or zero
      const currentRequestedQty = items[index].requested_qty || 0;
      const newRequestedQty =
        currentRequestedQty === 0 && newAvgUsage > 0
          ? newAvgUsage
          : currentRequestedQty;

      const updatedItem = {
        ...items[index],
        historical_usage: historicalUsage,
        avg_usage: newAvgUsage,
        estimated_usage_2569: newAvgUsage, // Auto-calculate estimated usage (same as avg)
        requested_qty: newRequestedQty,
      };

      items[index] = updatedItem;
      this.items.set([...items]);

      // Mark as modified
      const currentModified = new Set(this.modifiedItemIds());
      currentModified.add(updatedItem.id);
      this.modifiedItemIds.set(currentModified);
    }
  }

  /**
   * Get SVG polyline points for sparkline chart
   * Returns string format: "x1,y1 x2,y2 x3,y3"
   * Uses dynamic years based on fiscal_year
   */
  getSparklinePoints(item: BudgetRequestItem): string {
    const years = this.historicalYears();
    const values = [
      this.getHistoricalUsage(item, years.year1),
      this.getHistoricalUsage(item, years.year2),
      this.getHistoricalUsage(item, years.year3),
    ];

    const max = Math.max(...values, 1); // Avoid division by zero
    const min = Math.min(...values);
    const range = max - min || 1;

    // SVG viewBox is 60x24, leave padding
    const width = 60;
    const height = 24;
    const padding = 4;
    const chartHeight = height - padding * 2;

    const points = values.map((val, i) => {
      const x = padding + (i * (width - padding * 2)) / 2;
      // Invert Y because SVG 0,0 is top-left
      const y = padding + chartHeight - ((val - min) / range) * chartHeight;
      return `${x},${y}`;
    });

    return points.join(' ');
  }

  /**
   * Get data points for sparkline circles
   * Uses dynamic years based on fiscal_year
   */
  getSparklineDataPoints(item: BudgetRequestItem): { x: number; y: number }[] {
    const years = this.historicalYears();
    const values = [
      this.getHistoricalUsage(item, years.year1),
      this.getHistoricalUsage(item, years.year2),
      this.getHistoricalUsage(item, years.year3),
    ];

    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const range = max - min || 1;

    const width = 60;
    const height = 24;
    const padding = 4;
    const chartHeight = height - padding * 2;

    return values.map((val, i) => ({
      x: padding + (i * (width - padding * 2)) / 2,
      y: padding + chartHeight - ((val - min) / range) * chartHeight,
    }));
  }

  /**
   * Get sparkline color based on trend direction
   * Uses dynamic years based on fiscal_year
   */
  getSparklineColor(item: BudgetRequestItem): string {
    const years = this.historicalYears();
    const usageYear1 = this.getHistoricalUsage(item, years.year1);
    const usageYear2 = this.getHistoricalUsage(item, years.year2);
    const usageYear3 = this.getHistoricalUsage(item, years.year3);

    // No data - gray
    if (usageYear1 === 0 && usageYear2 === 0 && usageYear3 === 0) {
      return '#9ca3af'; // gray-400
    }

    // Calculate overall trend (first to last)
    const firstNonZero = usageYear1 || usageYear2 || 1;
    const lastValue = usageYear3 || usageYear2 || usageYear1;
    const overallChange = (lastValue - firstNonZero) / firstNonZero;

    if (overallChange > 0.05) {
      return '#16a34a'; // green-600 (increasing)
    } else if (overallChange < -0.05) {
      return '#dc2626'; // red-600 (decreasing)
    }
    return '#6b7280'; // gray-500 (flat)
  }

  /**
   * Get tooltip text for sparkline
   * Uses dynamic years based on fiscal_year
   */
  getSparklineTooltip(item: BudgetRequestItem): string {
    const years = this.historicalYears();
    const usageYear1 = this.getHistoricalUsage(item, years.year1);
    const usageYear2 = this.getHistoricalUsage(item, years.year2);
    const usageYear3 = this.getHistoricalUsage(item, years.year3);

    return `ปี${years.label1}: ${usageYear1.toLocaleString()} | ปี${years.label2}: ${usageYear2.toLocaleString()} | ปี${years.label3}: ${usageYear3.toLocaleString()}`;
  }

  applySearch() {
    this.pageIndex = 0;
    // Trigger change detection
    this.items.set([...this.items()]);
  }

  clearSearch() {
    this.searchTerm = '';
    this.dataFilter.set('all');
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
      // Update signal with new Set containing the item id
      const currentModified = new Set(this.modifiedItemIds());
      currentModified.add(item.id);
      this.modifiedItemIds.set(currentModified);
    }
  }

  copyDrugName(drugName: string) {
    navigator.clipboard.writeText(drugName).then(() => {
      this.snackBar.open(`คัดลอก "${drugName}" แล้ว`, 'ปิด', {
        duration: 2000,
      });
    });
  }

  deleteItem(item: BudgetRequestItem) {
    this.axDialog
      .confirmDelete(item.generic_name)
      .subscribe(async (confirmed) => {
        if (!confirmed) return;

        this.actionLoading.set(true);
        this.actionMessage.set(`กำลังลบ ${item.generic_name}...`);
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
        } finally {
          this.actionLoading.set(false);
          this.actionMessage.set('');
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
        this.actionMessage.set(
          'กำลัง Initialize รายการยา...\n(ดึงข้อมูลยอดใช้ย้อนหลัง 3 ปี, ราคา, สต็อก)',
        );
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
          this.actionMessage.set('');
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
        this.actionMessage.set('กำลังดึงรายการยาจาก Drug Master...');
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
          this.actionMessage.set('');
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
        this.actionMessage.set(`กำลังลบรายการทั้งหมด ${count} รายการ...`);
        try {
          // Use bulk delete API - single request to delete all items
          const response = await firstValueFrom(
            this.http.delete<any>(
              `/inventory/budget/budget-requests/${this.requestId}/items`,
            ),
          );

          const deletedCount = response.data?.deletedCount || count;
          this.snackBar.open(`ลบรายการสำเร็จ ${deletedCount} รายการ`, 'ปิด', {
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
          this.actionMessage.set('');
        }
      });
  }

  importExcel() {
    const dialogRef = this.dialog.open(BudgetRequestImportDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        budgetRequestId: this.requestId,
        fiscalYear:
          this.budgetRequest()?.fiscal_year || new Date().getFullYear() + 543,
      },
    });

    dialogRef.afterClosed().subscribe(async (importedCount) => {
      if (importedCount && importedCount > 0) {
        this.snackBar.open(`Import สำเร็จ ${importedCount} รายการ`, 'ปิด', {
          duration: 3000,
        });
        await this.loadItems();
        await this.loadData();
      }
    });
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

  showAdjustPriceDialog() {
    const dialogRef = this.dialog.open(AdjustPriceDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: {
        items: this.items().map((item) => ({
          id: item.id,
          generic_name: item.generic_name,
          unit_price: item.unit_price,
          requested_qty: item.requested_qty,
          requested_amount: item.requested_amount,
        })),
        selectedItemIds: Array.from(this.selectedItemIds()),
        hasSelection: this.hasSelection(),
      },
    });

    dialogRef.afterClosed().subscribe((result: AdjustPriceResult | null) => {
      if (result) {
        this.applyPriceAdjustment(result);
      }
    });
  }

  private applyPriceAdjustment(result: AdjustPriceResult) {
    const { field, percentage, itemIds } = result;
    const multiplier = 1 + percentage / 100;

    const items = this.items();
    const modifiedIds = new Set(this.modifiedItemIds());
    let adjustedCount = 0;

    for (const item of items) {
      if (itemIds.includes(item.id)) {
        if (field === 'unit_price') {
          item.unit_price =
            Math.round(item.unit_price * multiplier * 100) / 100;
        } else {
          item.requested_qty = Math.round(item.requested_qty * multiplier);
          // Auto-distribute quarters
          const quarterQty = Math.floor(item.requested_qty / 4);
          const remainder = item.requested_qty % 4;
          item.q1_qty = quarterQty + (remainder > 0 ? 1 : 0);
          item.q2_qty = quarterQty + (remainder > 1 ? 1 : 0);
          item.q3_qty = quarterQty + (remainder > 2 ? 1 : 0);
          item.q4_qty = quarterQty;
        }
        // Recalculate total
        item.requested_amount = item.unit_price * item.requested_qty;
        modifiedIds.add(item.id);
        adjustedCount++;
      }
    }

    this.items.set([...items]);
    this.modifiedItemIds.set(modifiedIds);

    const fieldLabel = field === 'unit_price' ? 'ราคา/หน่วย' : 'จำนวนที่ขอ';
    const changeLabel = percentage >= 0 ? `+${percentage}%` : `${percentage}%`;
    this.snackBar.open(
      `ปรับ ${fieldLabel} ${changeLabel} สำเร็จ ${adjustedCount} รายการ`,
      'ปิด',
      { duration: 3000 },
    );
  }

  async saveAll() {
    if (this.modifiedItemIds().size === 0) return;

    this.actionLoading.set(true);

    try {
      const modifiedItems = this.items().filter((item) =>
        this.modifiedItemIds().has(item.id),
      );

      const totalItems = modifiedItems.length;

      // Prepare items for batch update
      const itemsToUpdate = modifiedItems.map((item) => ({
        id: item.id,
        unit_price: item.unit_price,
        requested_qty: item.requested_qty,
        q1_qty: item.q1_qty,
        q2_qty: item.q2_qty,
        q3_qty: item.q3_qty,
        q4_qty: item.q4_qty,
        // Include historical usage, avg_usage, estimated_usage_2569, and current_stock
        historical_usage: item.historical_usage,
        avg_usage: item.avg_usage,
        estimated_usage_2569: item.estimated_usage_2569,
        current_stock: item.current_stock,
      }));

      // Batch API limit is 100 items per request - chunk if needed
      const BATCH_SIZE = 100;
      const chunks: (typeof itemsToUpdate)[] = [];
      for (let i = 0; i < itemsToUpdate.length; i += BATCH_SIZE) {
        chunks.push(itemsToUpdate.slice(i, i + BATCH_SIZE));
      }

      let totalUpdated = 0;
      let totalFailed = 0;
      let processedItems = 0;

      // Show initial progress under loading spinner
      this.actionMessage.set(`กำลังบันทึก 0/${totalItems} รายการ...`);

      // Process each chunk sequentially
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // Update progress before processing
        this.actionMessage.set(
          `กำลังบันทึก ${processedItems}/${totalItems} รายการ... (${Math.round((processedItems / totalItems) * 100)}%)`,
        );

        const response = await firstValueFrom(
          this.http.put<any>(
            `/inventory/budget/budget-requests/${this.requestId}/items/batch`,
            { items: chunk },
          ),
        );

        if (response.success) {
          totalUpdated += response.data.updated || 0;
          totalFailed += response.data.failed || 0;
        }

        processedItems += chunk.length;

        // Update progress after processing
        this.actionMessage.set(
          `กำลังบันทึก ${processedItems}/${totalItems} รายการ... (${Math.round((processedItems / totalItems) * 100)}%)`,
        );
      }

      this.actionMessage.set('');
      this.snackBar.open(
        `บันทึกสำเร็จ ${totalUpdated} รายการ${totalFailed > 0 ? ` (ล้มเหลว ${totalFailed})` : ''}`,
        'ปิด',
        { duration: 3000 },
      );
      this.modifiedItemIds.set(new Set());
      await this.loadData();
    } catch (error: any) {
      this.actionMessage.set('');
      this.snackBar.open(error?.error?.message || 'บันทึกไม่สำเร็จ', 'ปิด', {
        duration: 3000,
      });
    } finally {
      this.actionLoading.set(false);
      this.actionMessage.set('');
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
