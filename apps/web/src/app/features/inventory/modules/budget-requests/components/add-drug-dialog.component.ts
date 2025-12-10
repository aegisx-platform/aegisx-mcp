import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface DrugGeneric {
  id: number;
  working_code: string;
  generic_name: string;
  strength_unit: string | null;
  dosage_form: string | null;
}

interface AddDrugDialogData {
  budgetRequestId: number | string;
  existingGenericIds: number[];
}

@Component({
  selector: 'app-add-drug-dialog',
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
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  template: `
    <!-- Dialog Header -->
    <h2 mat-dialog-title class="ax-header ax-header-info">
      <div class="ax-icon-info">
        <mat-icon>add_circle</mat-icon>
      </div>
      <div class="header-text">
        <div class="ax-title">เพิ่มรายการยา</div>
        <div class="ax-subtitle">เลือกยาและกรอกจำนวนที่ต้องการ</div>
      </div>
      <button
        type="button"
        mat-icon-button
        [mat-dialog-close]="false"
        aria-label="Close dialog"
      >
        <mat-icon>close</mat-icon>
      </button>
    </h2>

    <mat-dialog-content class="!p-6">
      <form [formGroup]="form" class="space-y-4">
        <!-- Drug Search -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>ค้นหายา</mat-label>
          <input
            matInput
            [matAutocomplete]="auto"
            formControlName="drugSearch"
            placeholder="พิมพ์รหัสหรือชื่อยา..."
            (input)="onSearchInput($event)"
          />
          <mat-icon matSuffix>search</mat-icon>
          <mat-autocomplete
            #auto="matAutocomplete"
            [displayWith]="displayDrug"
            (optionSelected)="onDrugSelected($event)"
          >
            @if (searchLoading()) {
              <mat-option disabled>
                <mat-spinner
                  diameter="20"
                  class="inline-block mr-2"
                ></mat-spinner>
                กำลังค้นหา...
              </mat-option>
            }
            @for (drug of filteredDrugs(); track drug.id) {
              <mat-option
                [value]="drug"
                [disabled]="isDrugAlreadyAdded(drug.id)"
              >
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <span class="font-mono text-sm text-gray-500">{{
                      drug.working_code
                    }}</span>
                    <span class="ml-2">{{ drug.generic_name }}</span>
                  </div>
                  <span class="text-sm text-gray-400">{{
                    drug.strength_unit || drug.dosage_form || '-'
                  }}</span>
                </div>
                @if (isDrugAlreadyAdded(drug.id)) {
                  <span class="text-xs text-orange-500 ml-2"
                    >(มีในรายการแล้ว)</span
                  >
                }
              </mat-option>
            }
            @if (
              !searchLoading() &&
              filteredDrugs().length === 0 &&
              searchTerm().length > 0
            ) {
              <mat-option disabled>ไม่พบรายการยา</mat-option>
            }
          </mat-autocomplete>
          @if (
            form.get('drugSearch')?.hasError('required') &&
            form.get('drugSearch')?.touched
          ) {
            <mat-error>กรุณาเลือกยา</mat-error>
          }
        </mat-form-field>

        <!-- Selected Drug Info -->
        @if (selectedDrug()) {
          <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center gap-3">
              <mat-icon class="text-blue-600">medication</mat-icon>
              <div class="flex-1">
                <div class="font-medium text-blue-900">
                  {{ selectedDrug()?.generic_name }}
                </div>
                <div class="text-sm text-blue-600">
                  รหัส: {{ selectedDrug()?.working_code }} | หน่วย:
                  {{
                    selectedDrug()?.strength_unit ||
                      selectedDrug()?.dosage_form ||
                      '-'
                  }}
                </div>
              </div>
              <button
                mat-icon-button
                (click)="clearSelection()"
                matTooltip="ล้างการเลือก"
              >
                <mat-icon>clear</mat-icon>
              </button>
            </div>
          </div>
        }

        <mat-divider></mat-divider>

        <!-- Quantity Fields -->
        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>จำนวนที่ขอ (รวม)</mat-label>
            <input
              matInput
              type="number"
              formControlName="requested_qty"
              min="1"
              (input)="autoDistributeQuarters()"
            />
            @if (form.get('requested_qty')?.hasError('required')) {
              <mat-error>กรุณากรอกจำนวน</mat-error>
            }
            @if (form.get('requested_qty')?.hasError('min')) {
              <mat-error>ต้องมากกว่า 0</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>ราคา/หน่วย</mat-label>
            <input
              matInput
              type="number"
              formControlName="unit_price"
              min="0"
              step="0.01"
            />
            <span matTextSuffix>บาท</span>
          </mat-form-field>
        </div>

        <!-- Quarter Distribution -->
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-sm font-medium text-gray-700 mb-3">
            แบ่งจำนวนรายไตรมาส
          </div>
          <div class="grid grid-cols-4 gap-3">
            <mat-form-field appearance="outline" class="dense-field">
              <mat-label>Q1</mat-label>
              <input matInput type="number" formControlName="q1_qty" min="0" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="dense-field">
              <mat-label>Q2</mat-label>
              <input matInput type="number" formControlName="q2_qty" min="0" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="dense-field">
              <mat-label>Q3</mat-label>
              <input matInput type="number" formControlName="q3_qty" min="0" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="dense-field">
              <mat-label>Q4</mat-label>
              <input matInput type="number" formControlName="q4_qty" min="0" />
            </mat-form-field>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            รวม: {{ quarterTotal() }} /
            {{ form.get('requested_qty')?.value || 0 }}
            @if (quarterTotal() !== (form.get('requested_qty')?.value || 0)) {
              <span class="text-orange-500 ml-2">(ไม่ตรงกับจำนวนรวม)</span>
            }
          </div>
        </div>

        <!-- Notes -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>หมายเหตุ</mat-label>
          <textarea
            matInput
            formControlName="notes"
            rows="2"
            placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
          ></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!p-4 !pt-0">
      <button mat-button [mat-dialog-close]="false">ยกเลิก</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!form.valid || !selectedDrug() || loading()"
        (click)="onSubmit()"
      >
        @if (loading()) {
          <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
        }
        <mat-icon>add</mat-icon>
        เพิ่มรายการ
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .header-text {
        flex: 1;
        min-width: 0;
      }
      .dense-field {
        ::ng-deep .mat-mdc-form-field-infix {
          min-height: 40px !important;
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }
      }
    `,
  ],
})
export class AddDrugDialogComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<AddDrugDialogComponent>);
  private data = inject<AddDrugDialogData>(MAT_DIALOG_DATA);

  form: FormGroup;
  loading = signal(false);
  searchLoading = signal(false);
  filteredDrugs = signal<DrugGeneric[]>([]);
  selectedDrug = signal<DrugGeneric | null>(null);
  searchTerm = signal('');

  private searchSubject = new Subject<string>();

  constructor() {
    this.form = this.fb.group({
      drugSearch: ['', Validators.required],
      requested_qty: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0],
      q1_qty: [0],
      q2_qty: [0],
      q3_qty: [0],
      q4_qty: [0],
      notes: [''],
    });
  }

  ngOnInit() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.searchDrugs(term);
      });
  }

  displayDrug(drug: DrugGeneric): string {
    return drug ? `${drug.working_code} - ${drug.generic_name}` : '';
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.searchSubject.next(input.value);
  }

  async searchDrugs(term: string) {
    if (!term || term.length < 2) {
      this.filteredDrugs.set([]);
      return;
    }

    this.searchLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<any>(
          `/inventory/master-data/drug-generics?search=${encodeURIComponent(term)}&is_active=true&limit=50`,
        ),
      );
      this.filteredDrugs.set(response.data || []);
    } catch (error) {
      console.error('Failed to search drugs:', error);
      this.filteredDrugs.set([]);
    } finally {
      this.searchLoading.set(false);
    }
  }

  isDrugAlreadyAdded(genericId: number): boolean {
    return this.data?.existingGenericIds?.includes(genericId) || false;
  }

  onDrugSelected(event: any) {
    const drug = event.option.value as DrugGeneric;
    if (this.isDrugAlreadyAdded(drug.id)) {
      this.snackBar.open('ยานี้มีในรายการแล้ว', 'ปิด', { duration: 3000 });
      this.form.get('drugSearch')?.setValue('');
      return;
    }
    this.selectedDrug.set(drug);
    this.autoDistributeQuarters();
  }

  clearSelection() {
    this.selectedDrug.set(null);
    this.form.get('drugSearch')?.setValue('');
  }

  autoDistributeQuarters() {
    const total = this.form.get('requested_qty')?.value || 0;
    const quarterQty = Math.floor(total / 4);
    const remainder = total % 4;

    this.form.patchValue({
      q1_qty: quarterQty + (remainder > 0 ? 1 : 0),
      q2_qty: quarterQty + (remainder > 1 ? 1 : 0),
      q3_qty: quarterQty + (remainder > 2 ? 1 : 0),
      q4_qty: quarterQty,
    });
  }

  quarterTotal(): number {
    return (
      (this.form.get('q1_qty')?.value || 0) +
      (this.form.get('q2_qty')?.value || 0) +
      (this.form.get('q3_qty')?.value || 0) +
      (this.form.get('q4_qty')?.value || 0)
    );
  }

  async onSubmit() {
    if (!this.form.valid || !this.selectedDrug()) return;

    this.loading.set(true);
    try {
      const payload = {
        generic_id: this.selectedDrug()!.id,
        requested_qty: this.form.get('requested_qty')?.value,
        unit_price: this.form.get('unit_price')?.value || 0,
        q1_qty: this.form.get('q1_qty')?.value || 0,
        q2_qty: this.form.get('q2_qty')?.value || 0,
        q3_qty: this.form.get('q3_qty')?.value || 0,
        q4_qty: this.form.get('q4_qty')?.value || 0,
        notes: this.form.get('notes')?.value || undefined,
      };

      const response = await firstValueFrom(
        this.http.post<any>(
          `/inventory/budget/budget-requests/${this.data.budgetRequestId}/items`,
          payload,
        ),
      );

      if (response.success) {
        this.snackBar.open('เพิ่มรายการยาสำเร็จ', 'ปิด', { duration: 3000 });
        this.dialogRef.close(response.data);
      } else {
        throw new Error(response.message || 'Failed to add drug');
      }
    } catch (error: any) {
      const message =
        error?.error?.message || error?.message || 'เพิ่มรายการยาไม่สำเร็จ';
      this.snackBar.open(message, 'ปิด', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }
}
