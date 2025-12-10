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
import { AxDialogService, AxErrorStateComponent } from '@aegisx/ui';
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
    MatCheckboxModule,
    AxErrorStateComponent,
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
                    <mat-option value="generic_code">รหัสยา</mat-option>
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
                        ></mat-checkbox>
                      }
                    </th>
                    <td mat-cell *matCellDef="let item" class="!text-center">
                      @if (budgetRequest()?.status === 'DRAFT') {
                        <mat-checkbox
                          [checked]="isSelected(item.id)"
                          (change)="toggleSelectItem(item.id)"
                          (click)="$event.stopPropagation()"
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

                  <!-- Generic Code Column (Sticky) -->
                  <ng-container matColumnDef="generic_code" sticky>
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="sticky-column sticky-code !min-w-[80px]"
                    >
                      รหัสยา
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let item"
                      class="sticky-column sticky-code"
                    >
                      <span class="font-mono text-sm">{{
                        item.generic_code
                      }}</span>
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
                    class="hover:bg-[var(--ax-background-subtle)] cursor-pointer"
                    (click)="toggleSelectItem(row.id)"
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
    return Array.from(this.modifiedItemIds());
  });

  hasChanges = computed(() => {
    return this.modifiedItemIds().size > 0;
  });

  // Selection computed signals
  selectedCount = computed(() => this.selectedItemIds().size);
  hasSelection = computed(() => this.selectedItemIds().size > 0);
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
      // Update signal with new Set containing the item id
      const currentModified = new Set(this.modifiedItemIds());
      currentModified.add(item.id);
      this.modifiedItemIds.set(currentModified);
    }
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
