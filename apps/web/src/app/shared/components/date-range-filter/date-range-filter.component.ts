import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';

export interface DateFilterValue {
  [key: string]: string | null | undefined;
}

/**
 * Formats date for backend API based on field type
 * @param dateInput - Date object or string to format
 * @param isDateTime - If true, returns full ISO datetime. If false, returns date only (YYYY-MM-DD)
 * @returns Formatted date string or null
 */
function formatDateForAPI(
  dateInput: Date | string | null | undefined,
  isDateTime: boolean = false,
): string | null {
  if (!dateInput) return null;

  try {
    const date =
      typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (!date || isNaN(date.getTime())) return null;

    if (isDateTime) {
      // For datetime fields: return full ISO string with time
      return date.toISOString();
    } else {
      // For date fields: return YYYY-MM-DD only (no time component)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.warn('formatDateForAPI error:', error, 'input:', dateInput);
    return null;
  }
}

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="date-filter-container">
      <!-- Filter Mode Toggle -->
      <mat-button-toggle-group
        [(ngModel)]="filterMode"
        (change)="onModeChange()"
        class="filter-mode-toggle"
      >
        <mat-button-toggle value="equals">
          <mat-icon>event</mat-icon>
          Specific Date
        </mat-button-toggle>
        <mat-button-toggle value="range">
          <mat-icon>date_range</mat-icon>
          Date Range
        </mat-button-toggle>
      </mat-button-toggle-group>

      <!-- Equals Mode -->
      @if (filterMode === 'equals') {
        <div class="equals-mode">
          <mat-form-field appearance="outline" class="date-field">
            <mat-label>Select {{ label || 'Date' }}</mat-label>
            <input
              matInput
              [matDatepicker]="picker"
              [(ngModel)]="equalsDate"
              (dateChange)="onEqualsChange()"
              placeholder="Choose date"
            />
            <mat-datepicker-toggle matSuffix [for]="picker">
            </mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>
      }

      <!-- Range Mode -->
      @if (filterMode === 'range') {
        <div class="range-mode">
          <div class="range-inputs">
            <mat-form-field appearance="outline" class="date-field">
              <mat-label>From</mat-label>
              <input
                matInput
                [matDatepicker]="fromPicker"
                [(ngModel)]="fromDate"
                (dateChange)="onRangeChange()"
                placeholder="Start date"
              />
              <mat-datepicker-toggle matSuffix [for]="fromPicker">
              </mat-datepicker-toggle>
              <mat-datepicker #fromPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="date-field">
              <mat-label>To</mat-label>
              <input
                matInput
                [matDatepicker]="toPicker"
                [(ngModel)]="toDate"
                (dateChange)="onRangeChange()"
                placeholder="End date"
              />
              <mat-datepicker-toggle matSuffix [for]="toPicker">
              </mat-datepicker-toggle>
              <mat-datepicker #toPicker></mat-datepicker>
            </mat-form-field>
          </div>
        </div>
      }

      <!-- Quick Options -->
      <div class="quick-options">
        <button
          mat-stroked-button
          size="small"
          (click)="setToday()"
          class="quick-btn"
        >
          <mat-icon>today</mat-icon>
          Today
        </button>
        <button
          mat-stroked-button
          size="small"
          (click)="setYesterday()"
          class="quick-btn"
        >
          <mat-icon>remove</mat-icon>
          Yesterday
        </button>
        <button
          mat-stroked-button
          size="small"
          (click)="setThisWeek()"
          class="quick-btn"
        >
          <mat-icon>view_week</mat-icon>
          This Week
        </button>
        <button
          mat-stroked-button
          size="small"
          (click)="setThisMonth()"
          class="quick-btn"
        >
          <mat-icon>calendar_month</mat-icon>
          This Month
        </button>
        <button
          mat-stroked-button
          size="small"
          (click)="clear()"
          class="quick-btn clear-btn"
          color="warn"
        >
          <mat-icon>clear</mat-icon>
          Clear
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .date-filter-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
      }

      .filter-mode-toggle {
        align-self: flex-start;
      }

      .equals-mode,
      .range-mode {
        width: 100%;
      }

      .range-inputs {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .date-field {
        flex: 1;
        min-width: 200px;
      }

      .quick-options {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }

      .quick-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        padding: 4px 8px;
        min-width: auto;
      }

      .quick-btn mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .clear-btn {
        margin-left: auto;
      }

      @media (max-width: 768px) {
        .range-inputs {
          flex-direction: column;
        }

        .date-field {
          min-width: unset;
        }

        .quick-options {
          justify-content: center;
        }

        .clear-btn {
          margin-left: 0;
        }
      }
    `,
  ],
})
export class DateRangeFilterComponent implements OnInit {
  @Input() fieldName: string = '';
  @Input() label: string = 'Date';
  @Input() isDateTime: boolean = false;
  @Output() filterChange = new EventEmitter<DateFilterValue>();

  protected filterMode: 'equals' | 'range' = 'equals';
  protected equalsDate: Date | null = null;
  protected fromDate: Date | null = null;
  protected toDate: Date | null = null;

  ngOnInit() {
    // Ensure fieldName is set, otherwise use a default
    if (!this.fieldName) {
      console.warn('DateRangeFilterComponent: fieldName is not set');
      this.fieldName = 'date_field';
    }
  }

  onModeChange() {
    this.clear();
  }

  onEqualsChange() {
    if (!this.fieldName) return; // Prevent errors when fieldName is not set

    if (this.equalsDate) {
      // Format date based on field type (date or datetime)
      const filterValue = formatDateForAPI(this.equalsDate, this.isDateTime);

      this.filterChange.emit({
        [this.fieldName]: filterValue,
        [`${this.fieldName}_min`]: null,
        [`${this.fieldName}_max`]: null,
      });
    } else {
      this.clear();
    }
  }

  onRangeChange() {
    if (!this.fieldName) return; // Prevent errors when fieldName is not set

    if (this.fromDate || this.toDate) {
      const filter: DateFilterValue = {
        [this.fieldName]: null,
      };

      if (this.fromDate) {
        // For date fields: just use the date (formatDateForAPI will return YYYY-MM-DD)
        // For datetime fields: use the exact selected datetime
        filter[`${this.fieldName}_min`] = formatDateForAPI(
          this.fromDate,
          this.isDateTime,
        );
      } else {
        filter[`${this.fieldName}_min`] = null;
      }

      if (this.toDate) {
        // For date fields: just use the date (formatDateForAPI will return YYYY-MM-DD)
        // For datetime fields: use the exact selected datetime
        filter[`${this.fieldName}_max`] = formatDateForAPI(
          this.toDate,
          this.isDateTime,
        );
      } else {
        filter[`${this.fieldName}_max`] = null;
      }

      this.filterChange.emit(filter);
    } else {
      this.clear();
    }
  }

  setToday() {
    if (!this.fieldName) return;
    this.filterMode = 'equals';
    this.equalsDate = new Date();
    this.fromDate = null;
    this.toDate = null;
    this.onEqualsChange();
  }

  setYesterday() {
    if (!this.fieldName) return;
    this.filterMode = 'equals';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.equalsDate = yesterday;
    this.fromDate = null;
    this.toDate = null;
    this.onEqualsChange();
  }

  setThisWeek() {
    if (!this.fieldName) return;
    this.filterMode = 'range';
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(
      now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000,
    );

    this.equalsDate = null;
    this.fromDate = startOfWeek;
    this.toDate = new Date();
    this.onRangeChange();
  }

  setThisMonth() {
    if (!this.fieldName) return;
    this.filterMode = 'range';
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    this.equalsDate = null;
    this.fromDate = startOfMonth;
    this.toDate = new Date();
    this.onRangeChange();
  }

  clear() {
    this.equalsDate = null;
    this.fromDate = null;
    this.toDate = null;

    if (this.fieldName) {
      this.filterChange.emit({
        [this.fieldName]: null,
        [`${this.fieldName}_min`]: null,
        [`${this.fieldName}_max`]: null,
      });
    }
  }
}
