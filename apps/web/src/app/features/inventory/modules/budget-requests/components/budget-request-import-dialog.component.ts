import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';

interface ImportDialogData {
  budgetRequestId: number | string;
  fiscalYear: number;
}

interface ParsedRow {
  rowNumber: number;
  generic_code: string;
  generic_name: string;
  unit: string;
  unit_price: number | null;
  requested_qty: number | null;
  requested_amount: number | null;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{ row: number; field: string; message: string }>;
}

@Component({
  selector: 'app-budget-request-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTableModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    DecimalPipe,
  ],
  template: `
    <!-- Dialog Header -->
    <h2 mat-dialog-title class="ax-header ax-header-info">
      <div class="ax-icon-info">
        <mat-icon>upload_file</mat-icon>
      </div>
      <div class="header-text">
        <div class="ax-title">Import รายการยา</div>
        <div class="ax-subtitle">นำเข้าข้อมูลจากไฟล์ Excel หรือ CSV</div>
      </div>
      <button
        type="button"
        mat-icon-button
        [mat-dialog-close]="importedCount()"
        aria-label="Close dialog"
      >
        <mat-icon>close</mat-icon>
      </button>
    </h2>

    <mat-dialog-content class="!p-0 !overflow-y-auto" style="max-height: 70vh;">
      <mat-stepper
        #stepper
        [linear]="true"
        [selectedIndex]="currentStep()"
        (selectionChange)="onStepChange($event)"
        class="import-stepper"
      >
        <!-- Step 1: Upload -->
        <mat-step [completed]="step1Completed()" [editable]="!importing()">
          <ng-template matStepLabel>อัปโหลดไฟล์</ng-template>
          <div class="step-content p-6">
            <!-- Drop Zone -->
            <div
              class="drop-zone"
              [class.dragover]="isDragOver()"
              [class.has-file]="selectedFile()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()"
            >
              <input
                #fileInput
                type="file"
                accept=".xlsx,.xls,.csv"
                (change)="onFileSelected($event)"
                hidden
              />
              @if (!selectedFile()) {
                <mat-icon class="upload-icon">cloud_upload</mat-icon>
                <div class="drop-text">
                  <span class="font-medium">คลิกเพื่อเลือกไฟล์</span>
                  <span class="text-gray-500">หรือลากไฟล์มาวางที่นี่</span>
                </div>
                <div class="file-types">
                  รองรับไฟล์ Excel (.xlsx, .xls) และ CSV
                </div>
              } @else {
                <mat-icon class="file-icon text-green-600">
                  description
                </mat-icon>
                <div class="file-info">
                  <span class="font-medium">{{ selectedFile()?.name }}</span>
                  <span class="text-gray-500">
                    {{ formatFileSize(selectedFile()?.size || 0) }}
                  </span>
                </div>
                <button
                  mat-icon-button
                  color="warn"
                  (click)="clearFile($event)"
                  matTooltip="ลบไฟล์"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </div>

            <!-- Download Templates -->
            <div class="templates-section mt-6">
              <div class="text-sm text-gray-600 mb-2">ต้องการ Template?</div>
              <div class="flex gap-2">
                <button
                  mat-stroked-button
                  (click)="downloadTemplate('xlsx')"
                  matTooltip="ดาวน์โหลดไฟล์ตัวอย่าง Excel"
                >
                  <mat-icon>download</mat-icon>
                  <span class="ml-1">Excel Template</span>
                </button>
                <button
                  mat-stroked-button
                  (click)="downloadTemplate('csv')"
                  matTooltip="ดาวน์โหลดไฟล์ตัวอย่าง CSV"
                >
                  <mat-icon>download</mat-icon>
                  <span class="ml-1">CSV Template</span>
                </button>
              </div>
            </div>

            @if (parseError()) {
              <div
                class="error-message mt-4 p-3 bg-red-50 text-red-700 rounded-lg"
              >
                <mat-icon class="align-middle mr-2">error</mat-icon>
                {{ parseError() }}
              </div>
            }
          </div>
        </mat-step>

        <!-- Step 2: Review -->
        <mat-step [completed]="step2Completed()" [editable]="!importing()">
          <ng-template matStepLabel>ตรวจสอบข้อมูล</ng-template>
          <div class="step-content">
            <!-- Summary -->
            <div
              class="review-summary p-4 bg-gray-50 border-b flex items-center gap-6"
            >
              <div class="stat">
                <span class="stat-value text-2xl font-bold">
                  {{ parsedRows().length | number }}
                </span>
                <span class="stat-label text-gray-600">รายการทั้งหมด</span>
              </div>
              <div class="stat text-green-600">
                <span class="stat-value text-2xl font-bold">
                  {{ validRowsCount() | number }}
                </span>
                <span class="stat-label">ถูกต้อง</span>
              </div>
              @if (invalidRowsCount() > 0) {
                <div class="stat text-red-600">
                  <span class="stat-value text-2xl font-bold">
                    {{ invalidRowsCount() | number }}
                  </span>
                  <span class="stat-label">มีข้อผิดพลาด</span>
                </div>
              }
              <div class="flex-1"></div>
              <mat-checkbox
                [(ngModel)]="showOnlyErrors"
                (change)="filterRows()"
              >
                แสดงเฉพาะรายการที่มีปัญหา
              </mat-checkbox>
            </div>

            <!-- Preview Table -->
            <div
              class="preview-table-container"
              style="max-height: 350px; overflow: auto;"
            >
              <table mat-table [dataSource]="displayedRows()" class="w-full">
                <!-- Row Number -->
                <ng-container matColumnDef="rowNumber">
                  <th mat-header-cell *matHeaderCellDef class="!w-16">#</th>
                  <td mat-cell *matCellDef="let row">{{ row.rowNumber }}</td>
                </ng-container>

                <!-- Status -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef class="!w-16">สถานะ</th>
                  <td mat-cell *matCellDef="let row">
                    @if (row.isValid) {
                      <mat-icon class="text-green-600">check_circle</mat-icon>
                    } @else {
                      <mat-icon
                        class="text-red-600"
                        [matTooltip]="row.errors.join(', ')"
                      >
                        error
                      </mat-icon>
                    }
                  </td>
                </ng-container>

                <!-- Generic Code -->
                <ng-container matColumnDef="generic_code">
                  <th mat-header-cell *matHeaderCellDef>รหัสยา</th>
                  <td mat-cell *matCellDef="let row">{{ row.generic_code }}</td>
                </ng-container>

                <!-- Generic Name -->
                <ng-container matColumnDef="generic_name">
                  <th mat-header-cell *matHeaderCellDef>ชื่อยา</th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                    class="max-w-[200px] truncate"
                    [matTooltip]="row.generic_name"
                  >
                    {{ row.generic_name }}
                  </td>
                </ng-container>

                <!-- Unit -->
                <ng-container matColumnDef="unit">
                  <th mat-header-cell *matHeaderCellDef class="!w-20">หน่วย</th>
                  <td mat-cell *matCellDef="let row">{{ row.unit }}</td>
                </ng-container>

                <!-- Unit Price -->
                <ng-container matColumnDef="unit_price">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    class="!text-right !w-28"
                  >
                    ราคา/หน่วย
                  </th>
                  <td mat-cell *matCellDef="let row" class="!text-right">
                    {{ row.unit_price | number: '1.2-2' }}
                  </td>
                </ng-container>

                <!-- Qty -->
                <ng-container matColumnDef="requested_qty">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    class="!text-right !w-24"
                  >
                    จำนวน
                  </th>
                  <td mat-cell *matCellDef="let row" class="!text-right">
                    {{ row.requested_qty | number }}
                  </td>
                </ng-container>

                <!-- Amount -->
                <ng-container matColumnDef="requested_amount">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    class="!text-right !w-32"
                  >
                    มูลค่า
                  </th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                    class="!text-right font-medium"
                  >
                    {{ row.requested_amount | number: '1.2-2' }}
                  </td>
                </ng-container>

                <!-- Errors -->
                <ng-container matColumnDef="errors">
                  <th mat-header-cell *matHeaderCellDef>ข้อผิดพลาด</th>
                  <td
                    mat-cell
                    *matCellDef="let row"
                    class="text-red-600 text-sm"
                  >
                    {{ row.errors.join(', ') }}
                  </td>
                </ng-container>

                <tr
                  mat-header-row
                  *matHeaderRowDef="displayedColumns; sticky: true"
                ></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                  [class.bg-red-50]="!row.isValid"
                ></tr>
              </table>
            </div>
          </div>
        </mat-step>

        <!-- Step 3: Options -->
        <mat-step [completed]="step3Completed()" [editable]="!importing()">
          <ng-template matStepLabel>ตัวเลือก</ng-template>
          <div class="step-content p-6">
            <div class="options-section">
              <h3 class="text-lg font-medium mb-4">โหมดการ Import</h3>
              <mat-radio-group
                [(ngModel)]="importMode"
                class="flex flex-col gap-3"
              >
                <mat-radio-button value="append">
                  <div class="option-content">
                    <div class="font-medium">เพิ่มต่อท้าย (Append)</div>
                    <div class="text-sm text-gray-500">
                      เพิ่มรายการใหม่โดยไม่กระทบรายการเดิม
                    </div>
                  </div>
                </mat-radio-button>
                <mat-radio-button value="replace">
                  <div class="option-content">
                    <div class="font-medium">แทนที่ทั้งหมด (Replace)</div>
                    <div class="text-sm text-gray-500">
                      ลบรายการเดิมทั้งหมดแล้วใส่รายการใหม่
                    </div>
                  </div>
                </mat-radio-button>
                <mat-radio-button value="update">
                  <div class="option-content">
                    <div class="font-medium">อัปเดต (Update)</div>
                    <div class="text-sm text-gray-500">
                      อัปเดตรายการที่มีอยู่ เพิ่มรายการใหม่
                    </div>
                  </div>
                </mat-radio-button>
              </mat-radio-group>
            </div>

            <div class="options-section mt-6">
              <h3 class="text-lg font-medium mb-4">ตัวเลือกเพิ่มเติม</h3>
              <mat-checkbox [(ngModel)]="skipErrors">
                ข้ามรายการที่มีข้อผิดพลาด (Import เฉพาะรายการที่ถูกต้อง)
              </mat-checkbox>
            </div>

            <!-- Preview Summary -->
            <div class="mt-6 p-4 bg-blue-50 rounded-lg">
              <div class="font-medium text-blue-800 mb-2">สรุปการ Import</div>
              <ul class="text-sm text-blue-700 space-y-1">
                <li>
                  รายการที่จะ Import:
                  <strong>{{
                    skipErrors ? validRowsCount() : parsedRows().length
                  }}</strong>
                  รายการ
                </li>
                <li>
                  โหมด: <strong>{{ getModeName(importMode) }}</strong>
                </li>
                @if (invalidRowsCount() > 0 && skipErrors) {
                  <li class="text-orange-600">
                    จะข้าม {{ invalidRowsCount() }} รายการที่มีข้อผิดพลาด
                  </li>
                }
              </ul>
            </div>
          </div>
        </mat-step>

        <!-- Step 4: Import -->
        <mat-step>
          <ng-template matStepLabel>นำเข้าข้อมูล</ng-template>
          <div class="step-content p-6">
            @if (importing()) {
              <div class="import-progress text-center py-8">
                <mat-spinner diameter="60" class="mx-auto"></mat-spinner>
                <div class="mt-4 text-lg font-medium">กำลังนำเข้าข้อมูล...</div>
                <div class="text-gray-500">
                  {{ importProgress() }}% ({{ importedCount() }}/{{
                    totalToImport()
                  }})
                </div>
                <mat-progress-bar
                  mode="determinate"
                  [value]="importProgress()"
                  class="mt-4"
                ></mat-progress-bar>
              </div>
            } @else if (importResult()) {
              <div class="import-result text-center py-8">
                @if ((importResult()?.imported || 0) > 0) {
                  <!-- Success: imported some items -->
                  <mat-icon class="text-green-600 !text-6xl !w-16 !h-16">
                    check_circle
                  </mat-icon>
                  <div class="mt-4 text-xl font-medium text-green-800">
                    Import สำเร็จ!
                  </div>
                } @else if (
                  (importResult()?.skipped || 0) > 0 &&
                  !importResult()?.errors?.length
                ) {
                  <!-- All skipped (duplicates) - not an error -->
                  <mat-icon class="text-blue-600 !text-6xl !w-16 !h-16">
                    info
                  </mat-icon>
                  <div class="mt-4 text-xl font-medium text-blue-800">
                    ข้ามรายการซ้ำทั้งหมด
                  </div>
                  <div class="text-sm text-blue-600 mt-2">
                    รายการทั้งหมดมีอยู่แล้วในระบบ
                  </div>
                } @else if (importResult()?.errors?.length) {
                  <!-- Has errors -->
                  <mat-icon class="text-orange-600 !text-6xl !w-16 !h-16">
                    warning
                  </mat-icon>
                  <div class="mt-4 text-xl font-medium text-orange-800">
                    Import เสร็จสิ้น (มีข้อผิดพลาด)
                  </div>
                } @else {
                  <!-- Nothing imported, nothing skipped, no errors (empty file?) -->
                  <mat-icon class="text-gray-600 !text-6xl !w-16 !h-16">
                    help_outline
                  </mat-icon>
                  <div class="mt-4 text-xl font-medium text-gray-800">
                    ไม่มีรายการที่จะ Import
                  </div>
                }

                <div class="result-stats flex justify-center gap-8 mt-6">
                  <div class="stat text-center">
                    <div class="text-3xl font-bold text-green-600">
                      {{ importResult()?.imported | number }}
                    </div>
                    <div class="text-gray-600">นำเข้าสำเร็จ</div>
                  </div>
                  @if ((importResult()?.skipped || 0) > 0) {
                    <div class="stat text-center">
                      <div class="text-3xl font-bold text-orange-600">
                        {{ importResult()?.skipped | number }}
                      </div>
                      <div class="text-gray-600">ข้าม (ซ้ำ)</div>
                    </div>
                  }
                  @if (importResult()?.errors?.length) {
                    <div class="stat text-center">
                      <div class="text-3xl font-bold text-red-600">
                        {{ importResult()?.errors?.length | number }}
                      </div>
                      <div class="text-gray-600">ผิดพลาด</div>
                    </div>
                  }
                </div>

                @if (importResult()?.errors?.length) {
                  <div
                    class="errors-section mt-6 p-4 bg-red-50 rounded-lg text-left"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <div class="text-sm font-medium text-red-800">
                        รายการที่มีข้อผิดพลาด ({{
                          importResult()?.errors?.length
                        }}
                        รายการ)
                      </div>
                      <button
                        mat-stroked-button
                        color="warn"
                        (click)="downloadErrorReport()"
                        matTooltip="ดาวน์โหลดรายการที่มีปัญหาเป็น Excel"
                      >
                        <mat-icon>download</mat-icon>
                        <span class="ml-1">Export รายการผิดพลาด</span>
                      </button>
                    </div>
                    <div
                      class="errors-list max-h-32 overflow-auto border rounded bg-white"
                    >
                      <table class="w-full text-sm">
                        <thead class="bg-red-100 sticky top-0">
                          <tr>
                            <th class="px-3 py-2 text-left w-16">แถว</th>
                            <th class="px-3 py-2 text-left">
                              รายละเอียดข้อผิดพลาด
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (
                            err of importResult()?.errors || [];
                            track err.row
                          ) {
                            <tr class="border-t">
                              <td class="px-3 py-2 text-red-600 font-medium">
                                {{ err.row }}
                              </td>
                              <td class="px-3 py-2 text-red-700">
                                {{ err.message }}
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                }

                @if (
                  (importResult()?.skipped || 0) > 0 &&
                  !importResult()?.errors?.length
                ) {
                  <div class="mt-6 p-4 bg-orange-50 rounded-lg text-center">
                    <div class="text-orange-800">
                      <mat-icon class="align-middle mr-1">info</mat-icon>
                      รายการที่ข้ามเนื่องจากมีรหัสยาซ้ำกับรายการที่มีอยู่แล้ว
                    </div>
                    <div class="text-sm text-orange-600 mt-1">
                      (ใช้โหมด "อัปเดต" หากต้องการแทนที่รายการที่มีอยู่)
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-8 text-gray-500">
                กดปุ่ม "เริ่ม Import" เพื่อนำเข้าข้อมูล
              </div>
            }
          </div>
        </mat-step>
      </mat-stepper>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!px-6 !py-4 border-t">
      @if (currentStep() < 3) {
        <button mat-button (click)="onCancel()" matTooltip="ยกเลิกการ Import">
          ยกเลิก
        </button>
        @if (currentStep() > 0) {
          <button
            mat-button
            (click)="previousStep()"
            matTooltip="กลับไปขั้นตอนก่อนหน้า"
          >
            <mat-icon>arrow_back</mat-icon>
            <span class="ml-1">ย้อนกลับ</span>
          </button>
        }
        <button
          mat-flat-button
          color="primary"
          (click)="nextStep()"
          [disabled]="!canProceed()"
          matTooltip="ไปขั้นตอนถัดไป"
        >
          <span>ถัดไป</span>
          <mat-icon>arrow_forward</mat-icon>
        </button>
      } @else {
        @if (!importing() && !importResult()) {
          <button
            mat-button
            (click)="previousStep()"
            matTooltip="กลับไปแก้ไขตัวเลือก"
          >
            <mat-icon>arrow_back</mat-icon>
            <span class="ml-1">ย้อนกลับ</span>
          </button>
          <button
            mat-flat-button
            color="primary"
            (click)="startImport()"
            matTooltip="เริ่มนำเข้าข้อมูลจากไฟล์"
          >
            <mat-icon>upload</mat-icon>
            <span class="ml-1">เริ่ม Import</span>
          </button>
        } @else if (importResult()) {
          <button
            mat-flat-button
            color="primary"
            [mat-dialog-close]="importedCount()"
            matTooltip="ปิดหน้าต่างและกลับไปหน้ารายละเอียด"
          >
            <mat-icon>check</mat-icon>
            <span class="ml-1">เสร็จสิ้น</span>
          </button>
        }
      }
    </mat-dialog-actions>
  `,
  styles: [
    `
      .import-stepper {
        height: 100%;
      }

      .step-content {
        min-height: 400px;
      }

      .drop-zone {
        border: 2px dashed #ccc;
        border-radius: 12px;
        padding: 48px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .drop-zone:hover {
        border-color: #64b5f6;
        background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
      }

      .drop-zone.dragover {
        border-color: #1976d2;
        background: linear-gradient(135deg, #bbdefb 0%, #e1bee7 100%);
        border-width: 3px;
        transform: scale(1.01);
      }

      .drop-zone.has-file {
        border-style: solid;
        border-color: #4caf50;
        background: #e8f5e9;
        flex-direction: row;
        padding: 16px 24px;
      }

      .upload-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #90a4ae;
        transition: color 0.2s ease;
      }

      .drop-zone:hover .upload-icon,
      .drop-zone.dragover .upload-icon {
        color: #1976d2;
      }

      .file-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }

      .drop-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .file-types {
        font-size: 12px;
        color: #9e9e9e;
      }

      .file-info {
        flex: 1;
        text-align: left;
        display: flex;
        flex-direction: column;
      }

      .stat {
        display: flex;
        flex-direction: column;
      }

      .option-content {
        margin-left: 8px;
      }

      ::ng-deep .import-stepper .mat-horizontal-stepper-header-container {
        background: #f5f5f5;
        padding: 8px 16px;
      }

      ::ng-deep .preview-table-container .mat-mdc-table {
        width: 100%;
      }

      ::ng-deep .preview-table-container th.mat-mdc-header-cell {
        background: #f5f5f5;
        font-weight: 600;
      }
    `,
  ],
})
export class BudgetRequestImportDialogComponent {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<BudgetRequestImportDialogComponent>);
  data = inject<ImportDialogData>(MAT_DIALOG_DATA);

  // State
  currentStep = signal(0);
  selectedFile = signal<File | null>(null);
  isDragOver = signal(false);
  parseError = signal<string | null>(null);
  parsedRows = signal<ParsedRow[]>([]);
  displayedRows = signal<ParsedRow[]>([]);

  importing = signal(false);
  importProgress = signal(0);
  importedCount = signal(0);
  totalToImport = signal(0);
  importResult = signal<ImportResult | null>(null);

  // Options
  importMode: 'append' | 'replace' | 'update' = 'append';
  skipErrors = true;
  showOnlyErrors = false;

  // Table columns
  displayedColumns = [
    'rowNumber',
    'status',
    'generic_code',
    'generic_name',
    'unit',
    'unit_price',
    'requested_qty',
    'requested_amount',
    'errors',
  ];

  // Computed
  step1Completed = computed(
    () => !!this.selectedFile() && this.parsedRows().length > 0,
  );
  step2Completed = computed(() => this.step1Completed());
  step3Completed = computed(() => this.step2Completed());

  validRowsCount = computed(
    () => this.parsedRows().filter((r) => r.isValid).length,
  );
  invalidRowsCount = computed(
    () => this.parsedRows().filter((r) => !r.isValid).length,
  );

  canProceed = computed(() => {
    switch (this.currentStep()) {
      case 0:
        return this.step1Completed();
      case 1:
        return this.step2Completed() && this.validRowsCount() > 0;
      case 2:
        return this.step3Completed();
      default:
        return false;
    }
  });

  // Drag & Drop handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.processFile(input.files[0]);
    }
  }

  clearFile(event: Event) {
    event.stopPropagation();
    this.selectedFile.set(null);
    this.parsedRows.set([]);
    this.displayedRows.set([]);
    this.parseError.set(null);
  }

  async processFile(file: File) {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (
      !validTypes.includes(file.type) &&
      !['xlsx', 'xls', 'csv'].includes(ext || '')
    ) {
      this.parseError.set('รองรับเฉพาะไฟล์ Excel (.xlsx, .xls) และ CSV');
      return;
    }

    this.selectedFile.set(file);
    this.parseError.set(null);

    try {
      const data = await this.readFile(file);
      const rows = this.parseData(data);
      this.parsedRows.set(rows);
      this.filterRows();
    } catch (error: any) {
      this.parseError.set(error.message || 'ไม่สามารถอ่านไฟล์ได้');
      this.parsedRows.set([]);
    }
  }

  private readFile(file: File): Promise<any[][]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData as any[][]);
        } catch (err) {
          reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
        }
      };
      reader.onerror = () => reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
      reader.readAsArrayBuffer(file);
    });
  }

  private parseData(data: any[][]): ParsedRow[] {
    if (data.length < 2) {
      throw new Error('ไฟล์ว่างหรือไม่มีข้อมูล');
    }

    // Skip header row
    const rows: ParsedRow[] = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.every((cell) => !cell)) continue; // Skip empty rows

      const errors: string[] = [];
      const warnings: string[] = [];

      // Parse fields
      const generic_code = String(row[0] || '').trim();
      const generic_name = String(row[1] || '').trim();
      const unit = String(row[2] || '').trim();
      const unit_price = this.parseNumber(row[3]);
      const requested_qty = this.parseNumber(row[4]);

      // Validate
      if (!generic_code) errors.push('ไม่มีรหัสยา');
      if (!generic_name) errors.push('ไม่มีชื่อยา');
      if (unit_price === null || unit_price < 0) errors.push('ราคาไม่ถูกต้อง');
      if (requested_qty === null || requested_qty <= 0)
        errors.push('จำนวนไม่ถูกต้อง');

      const requested_amount =
        unit_price !== null && requested_qty !== null
          ? unit_price * requested_qty
          : null;

      rows.push({
        rowNumber: i + 1,
        generic_code,
        generic_name,
        unit,
        unit_price,
        requested_qty,
        requested_amount,
        errors,
        warnings,
        isValid: errors.length === 0,
      });
    }

    return rows;
  }

  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  filterRows() {
    if (this.showOnlyErrors) {
      this.displayedRows.set(this.parsedRows().filter((r) => !r.isValid));
    } else {
      this.displayedRows.set(this.parsedRows());
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getModeName(mode: string): string {
    switch (mode) {
      case 'append':
        return 'เพิ่มต่อท้าย';
      case 'replace':
        return 'แทนที่ทั้งหมด';
      case 'update':
        return 'อัปเดต';
      default:
        return mode;
    }
  }

  downloadTemplate(format: 'xlsx' | 'csv') {
    const headers = ['รหัสยา', 'ชื่อยา', 'หน่วย', 'ราคาต่อหน่วย', 'จำนวน'];
    const sampleData = [
      ['7400001', 'PARACETAMOL 500MG TABLET', 'TAB', 0.5, 1000],
      ['7400002', 'AMOXICILLIN 500MG CAPSULE', 'CAP', 2.0, 500],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    const fileName = `budget_request_import_template_${this.data.fiscalYear}.${format}`;
    XLSX.writeFile(wb, fileName);
  }

  downloadErrorReport() {
    const errors = this.importResult()?.errors || [];
    if (errors.length === 0) return;

    // Get original data for failed rows
    const headers = [
      'แถว',
      'รหัสยา',
      'ชื่อยา',
      'หน่วย',
      'ราคาต่อหน่วย',
      'จำนวน',
      'ข้อผิดพลาด',
    ];
    const errorData = errors.map((err) => {
      const originalRow = this.parsedRows().find(
        (r) => r.rowNumber === err.row,
      );
      return [
        err.row,
        originalRow?.generic_code || '',
        originalRow?.generic_name || '',
        originalRow?.unit || '',
        originalRow?.unit_price || '',
        originalRow?.requested_qty || '',
        err.message,
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...errorData]);

    // Set column widths
    ws['!cols'] = [
      { wch: 6 }, // แถว
      { wch: 12 }, // รหัสยา
      { wch: 40 }, // ชื่อยา
      { wch: 8 }, // หน่วย
      { wch: 12 }, // ราคา
      { wch: 10 }, // จำนวน
      { wch: 40 }, // ข้อผิดพลาด
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Import Errors');

    const fileName = `import_errors_${this.data.fiscalYear}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  // Navigation
  onStepChange(event: any) {
    this.currentStep.set(event.selectedIndex);
  }

  nextStep() {
    if (this.canProceed()) {
      this.currentStep.update((v) => v + 1);
    }
  }

  previousStep() {
    this.currentStep.update((v) => Math.max(0, v - 1));
  }

  onCancel() {
    this.dialogRef.close(0);
  }

  // Import
  async startImport() {
    this.importing.set(true);
    this.importProgress.set(0);
    this.importedCount.set(0);

    const rowsToImport = this.skipErrors
      ? this.parsedRows().filter((r) => r.isValid)
      : this.parsedRows();

    this.totalToImport.set(rowsToImport.length);

    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile()!);
      formData.append('mode', this.importMode);
      formData.append('skipErrors', String(this.skipErrors));

      const response = await firstValueFrom(
        this.http.post<{ success: boolean; data: ImportResult }>(
          `/inventory/budget/budget-requests/${this.data.budgetRequestId}/import`,
          formData,
        ),
      );

      this.importResult.set(response.data);
      this.importedCount.set(response.data.imported);
      this.importProgress.set(100);
    } catch (error: any) {
      this.importResult.set({
        success: false,
        imported: 0,
        skipped: rowsToImport.length,
        errors: [
          {
            row: 0,
            field: '',
            message: error?.error?.message || 'Import ไม่สำเร็จ',
          },
        ],
      });
    } finally {
      this.importing.set(false);
    }
  }
}
