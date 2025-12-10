import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface AdjustPriceDialogData {
  items: Array<{
    id: number;
    generic_name: string;
    unit_price: number;
    requested_qty: number;
    requested_amount: number;
  }>;
  selectedItemIds: number[];
  hasSelection: boolean;
}

export interface AdjustPriceResult {
  field: 'unit_price' | 'requested_qty';
  percentage: number;
  applyTo: 'all' | 'selected';
  itemIds: number[];
}

@Component({
  selector: 'app-adjust-price-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <!-- Dialog Header -->
    <h2 mat-dialog-title class="ax-header ax-header-info">
      <div class="ax-icon-info">
        <mat-icon>percent</mat-icon>
      </div>
      <div class="header-text">
        <div class="ax-title">ปรับราคา/จำนวนเป็น %</div>
        <div class="ax-subtitle">ปรับค่าเพิ่มหรือลดเป็นเปอร์เซ็นต์</div>
      </div>
      <button
        type="button"
        mat-icon-button
        [mat-dialog-close]="null"
        aria-label="Close dialog"
      >
        <mat-icon>close</mat-icon>
      </button>
    </h2>

    <mat-dialog-content class="!p-6">
      <form [formGroup]="form" class="space-y-5">
        <!-- Apply To Selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">ปรับข้อมูล</label>
          <mat-radio-group formControlName="applyTo" class="flex gap-4">
            <mat-radio-button value="all">
              <span class="flex items-center gap-1">
                <mat-icon class="!text-base !w-4 !h-4">select_all</mat-icon>
                ทุกรายการ ({{ data.items.length }} รายการ)
              </span>
            </mat-radio-button>
            <mat-radio-button value="selected" [disabled]="!data.hasSelection">
              <span class="flex items-center gap-1">
                <mat-icon class="!text-base !w-4 !h-4">check_box</mat-icon>
                เฉพาะที่เลือก ({{ data.selectedItemIds.length }} รายการ)
              </span>
            </mat-radio-button>
          </mat-radio-group>
        </div>

        <!-- Field Selection -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>ปรับฟิลด์</mat-label>
          <mat-select formControlName="field">
            <mat-option value="unit_price">
              <span class="flex items-center gap-2">
                <mat-icon class="!text-base">attach_money</mat-icon>
                ราคา/หน่วย (unit_price)
              </span>
            </mat-option>
            <mat-option value="requested_qty">
              <span class="flex items-center gap-2">
                <mat-icon class="!text-base">inventory</mat-icon>
                จำนวนที่ขอ (requested_qty)
              </span>
            </mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Percentage Input Section -->
        <div class="percentage-section">
          <label class="text-sm font-medium text-gray-700 block mb-3"
            >เปอร์เซ็นต์ที่ต้องการปรับ</label
          >

          <!-- Input with buttons - simple row layout -->
          <div class="percentage-controls">
            <button
              type="button"
              mat-fab
              color="warn"
              class="ctrl-btn"
              matTooltip="ลด 5%"
              (click)="adjustPercentage(-5)"
            >
              <mat-icon>remove</mat-icon>
            </button>

            <div class="value-display">
              <input
                type="number"
                formControlName="percentage"
                class="value-input"
                placeholder="0"
              />
              <span class="value-suffix">%</span>
            </div>

            <button
              type="button"
              mat-fab
              color="primary"
              class="ctrl-btn"
              matTooltip="เพิ่ม 5%"
              (click)="adjustPercentage(5)"
            >
              <mat-icon>add</mat-icon>
            </button>
          </div>

          <!-- Quick buttons -->
          <div class="quick-btns">
            <button
              type="button"
              mat-stroked-button
              (click)="setPercentage(-10)"
            >
              -10%
            </button>
            <button
              type="button"
              mat-stroked-button
              (click)="setPercentage(-5)"
            >
              -5%
            </button>
            <button type="button" mat-stroked-button (click)="setPercentage(5)">
              +5%
            </button>
            <button
              type="button"
              mat-stroked-button
              (click)="setPercentage(10)"
            >
              +10%
            </button>
          </div>

          @if (form.get('percentage')?.hasError('required')) {
            <mat-error class="text-xs text-center"
              >กรุณากรอกเปอร์เซ็นต์</mat-error
            >
          }
          @if (form.get('percentage')?.hasError('min')) {
            <mat-error class="text-xs text-center"
              >ไม่สามารถลดเกิน 100%</mat-error
            >
          }
        </div>

        <mat-divider></mat-divider>

        <!-- Preview Section -->
        <div class="p-4 rounded-lg" [ngClass]="previewClass()">
          <div class="flex items-center gap-2 mb-3">
            <mat-icon [ngClass]="previewIconClass()">{{
              previewIcon()
            }}</mat-icon>
            <span class="font-medium" [ngClass]="previewTextClass()"
              >ตัวอย่างการปรับ</span
            >
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">จำนวนรายการที่จะปรับ:</span>
              <span class="font-medium ml-2">{{ affectedItemsCount() }}</span>
            </div>
            <div>
              <span class="text-gray-500">ฟิลด์:</span>
              <span class="font-medium ml-2">{{ fieldLabel() }}</span>
            </div>
          </div>

          <div class="mt-3 p-3 bg-white rounded border">
            <div class="text-sm text-gray-600 mb-2">
              ตัวอย่าง: ถ้าค่าเดิม = 1,000
            </div>
            <div class="flex items-center gap-4">
              <div>
                <span class="text-gray-500">ค่าเดิม:</span>
                <span class="font-mono ml-2">1,000.00</span>
              </div>
              <mat-icon class="text-gray-400">arrow_forward</mat-icon>
              <div>
                <span class="text-gray-500">ค่าใหม่:</span>
                <span
                  class="font-mono font-bold ml-2"
                  [ngClass]="newValueClass()"
                >
                  {{ calculateNewValue(1000) | number: '1.2-2' }}
                </span>
                <span class="text-xs ml-1" [ngClass]="changeClass()">
                  ({{ form.get('percentage')?.value >= 0 ? '+' : ''
                  }}{{ form.get('percentage')?.value || 0 }}%)
                </span>
              </div>
            </div>
          </div>

          <!-- Current Total vs New Total -->
          <div class="mt-4 pt-3 border-t">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-xs text-gray-500 mb-1">มูลค่ารวมปัจจุบัน</div>
                <div class="text-lg font-bold text-gray-700">
                  ฿{{ currentTotal() | number: '1.2-2' }}
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-500 mb-1">
                  มูลค่ารวมหลังปรับ (ประมาณ)
                </div>
                <div class="text-lg font-bold" [ngClass]="newTotalClass()">
                  ฿{{ estimatedNewTotal() | number: '1.2-2' }}
                </div>
                <div class="text-xs" [ngClass]="changeClass()">
                  ({{ totalDiffLabel() }})
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!p-4 !pt-0">
      <button mat-button [mat-dialog-close]="null">ยกเลิก</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!form.valid || affectedItemsCount() === 0"
        (click)="onConfirm()"
      >
        <mat-icon>check</mat-icon>
        <span class="ml-1">ปรับค่า {{ affectedItemsCount() }} รายการ</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .header-text {
        flex: 1;
        min-width: 0;
      }

      /* Section container */
      .percentage-section {
        text-align: center;
      }

      /* Main controls row: [btn] [value] [btn] */
      .percentage-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      /* Control buttons */
      .ctrl-btn {
        flex-shrink: 0;
        width: 48px !important;
        height: 48px !important;
      }

      /* Value display box */
      .value-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 12px 20px;
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        min-width: 120px;
      }

      .value-display:focus-within {
        border-color: #6366f1;
        background: white;
      }

      /* Number input */
      .value-input {
        width: 60px;
        border: none;
        background: transparent;
        font-size: 32px;
        font-weight: 700;
        text-align: center;
        color: #1e293b;
        outline: none;
        -moz-appearance: textfield;
      }

      .value-input::-webkit-outer-spin-button,
      .value-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      .value-suffix {
        font-size: 24px;
        font-weight: 600;
        color: #64748b;
      }

      /* Quick select buttons */
      .quick-btns {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .quick-btns button {
        min-width: 60px !important;
        height: 32px !important;
        font-size: 13px !important;
      }
    `,
  ],
})
export class AdjustPriceDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AdjustPriceDialogComponent>);
  data = inject<AdjustPriceDialogData>(MAT_DIALOG_DATA);

  form: FormGroup;

  // Signals to track form values for reactivity
  private applyToSignal = signal<'all' | 'selected'>('all');
  private fieldSignal = signal<'unit_price' | 'requested_qty'>('unit_price');
  private percentageSignal = signal<number>(10);

  constructor() {
    const initialApplyTo = this.data.hasSelection ? 'selected' : 'all';
    this.applyToSignal.set(initialApplyTo as 'all' | 'selected');

    this.form = this.fb.group({
      applyTo: [initialApplyTo, Validators.required],
      field: ['unit_price', Validators.required],
      percentage: [10, [Validators.required, Validators.min(-99.99)]],
    });

    // Subscribe to form changes and update signals
    this.form.get('applyTo')?.valueChanges.subscribe((value) => {
      this.applyToSignal.set(value);
    });
    this.form.get('field')?.valueChanges.subscribe((value) => {
      this.fieldSignal.set(value);
    });
    this.form.get('percentage')?.valueChanges.subscribe((value) => {
      this.percentageSignal.set(value ?? 0);
    });
  }

  // Computed values using signals for reactivity
  affectedItemsCount = computed(() => {
    const applyTo = this.applyToSignal();
    if (applyTo === 'selected') {
      return this.data.selectedItemIds.length;
    }
    return this.data.items.length;
  });

  fieldLabel = computed(() => {
    const field = this.fieldSignal();
    return field === 'unit_price' ? 'ราคา/หน่วย' : 'จำนวนที่ขอ';
  });

  currentTotal = computed(() => {
    const applyTo = this.applyToSignal();
    const items =
      applyTo === 'selected'
        ? this.data.items.filter((i) =>
            this.data.selectedItemIds.includes(i.id),
          )
        : this.data.items;
    return items.reduce((sum, item) => sum + (item.requested_amount || 0), 0);
  });

  estimatedNewTotal = computed(() => {
    const percentage = this.percentageSignal();
    const field = this.fieldSignal();
    const applyTo = this.applyToSignal();

    const items =
      applyTo === 'selected'
        ? this.data.items.filter((i) =>
            this.data.selectedItemIds.includes(i.id),
          )
        : this.data.items;

    return items.reduce((sum, item) => {
      const multiplier = 1 + percentage / 100;
      if (field === 'unit_price') {
        const newPrice = item.unit_price * multiplier;
        return sum + newPrice * item.requested_qty;
      } else {
        const newQty = item.requested_qty * multiplier;
        return sum + item.unit_price * newQty;
      }
    }, 0);
  });

  totalDiffLabel = computed(() => {
    const current = this.currentTotal();
    const newTotal = this.estimatedNewTotal();
    const diff = newTotal - current;
    const diffPercent = current > 0 ? ((diff / current) * 100).toFixed(1) : '0';
    if (diff >= 0) {
      return `+${diff.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท / +${diffPercent}%`;
    }
    return `${diff.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท / ${diffPercent}%`;
  });

  calculateNewValue(originalValue: number): number {
    const percentage = this.form?.get('percentage')?.value || 0;
    return originalValue * (1 + percentage / 100);
  }

  /** เพิ่ม/ลด percentage ตาม delta (เช่น +5 หรือ -5) */
  adjustPercentage(delta: number): void {
    const current = this.form.get('percentage')?.value || 0;
    const newValue = Math.max(-99.99, current + delta);
    this.form.patchValue({ percentage: newValue });
  }

  /** ตั้งค่า percentage โดยตรง */
  setPercentage(value: number): void {
    this.form.patchValue({ percentage: value });
  }

  // Styling computed values
  previewClass = computed(() => {
    const percentage = this.form?.get('percentage')?.value || 0;
    if (percentage > 0) return 'bg-green-50 border border-green-200';
    if (percentage < 0) return 'bg-red-50 border border-red-200';
    return 'bg-gray-50 border border-gray-200';
  });

  previewIcon = computed(() => {
    const percentage = this.form?.get('percentage')?.value || 0;
    if (percentage > 0) return 'trending_up';
    if (percentage < 0) return 'trending_down';
    return 'trending_flat';
  });

  previewIconClass = computed(() => {
    const percentage = this.form?.get('percentage')?.value || 0;
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-gray-600';
  });

  previewTextClass = computed(() => {
    const percentage = this.form?.get('percentage')?.value || 0;
    if (percentage > 0) return 'text-green-700';
    if (percentage < 0) return 'text-red-700';
    return 'text-gray-700';
  });

  newValueClass = computed(() => {
    const percentage = this.form?.get('percentage')?.value || 0;
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-gray-600';
  });

  changeClass = computed(() => {
    const percentage = this.form?.get('percentage')?.value || 0;
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-gray-500';
  });

  newTotalClass = computed(() => {
    const percentage = this.form?.get('percentage')?.value || 0;
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-gray-700';
  });

  onConfirm() {
    if (!this.form.valid) return;

    const applyTo = this.form.get('applyTo')?.value;
    const itemIds =
      applyTo === 'selected'
        ? this.data.selectedItemIds
        : this.data.items.map((i) => i.id);

    const result: AdjustPriceResult = {
      field: this.form.get('field')?.value,
      percentage: this.form.get('percentage')?.value,
      applyTo,
      itemIds,
    };

    this.dialogRef.close(result);
  }
}
