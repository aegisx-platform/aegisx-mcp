import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { AxCalendarEvent } from './ax-calendar.component';

/**
 * Dialog data for creating/editing events
 */
export interface AxCalendarEventDialogData {
  mode: 'create' | 'edit';
  event?: AxCalendarEvent;
  start?: Date;
  end?: Date;
  allDay?: boolean;
}

/**
 * Dialog result when saving an event
 */
export interface AxCalendarEventDialogResult {
  action: 'save' | 'delete' | 'cancel';
  event?: Partial<AxCalendarEvent>;
}

/**
 * Color option for event
 */
interface ColorOption {
  value: AxCalendarEvent['color'];
  label: string;
  cssClass: string;
}

/**
 * AegisX Calendar Event Dialog Component
 *
 * Material dialog for creating and editing calendar events.
 *
 * @example
 * ```typescript
 * // Open create dialog
 * const dialogRef = dialog.open(AxCalendarEventDialogComponent, {
 *   data: {
 *     mode: 'create',
 *     start: new Date(),
 *     end: new Date(),
 *     allDay: false,
 *   },
 *   width: '500px',
 * });
 *
 * // Open edit dialog
 * const dialogRef = dialog.open(AxCalendarEventDialogComponent, {
 *   data: {
 *     mode: 'edit',
 *     event: existingEvent,
 *   },
 *   width: '500px',
 * });
 *
 * dialogRef.afterClosed().subscribe((result) => {
 *   if (result?.action === 'save') {
 *     // Handle save
 *   } else if (result?.action === 'delete') {
 *     // Handle delete
 *   }
 * });
 * ```
 */
@Component({
  selector: 'ax-calendar-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatSelectModule,
    MatIconModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <div class="ax-event-dialog">
      <h2 mat-dialog-title>
        {{ data.mode === 'create' ? 'Create Event' : 'Edit Event' }}
      </h2>

      <mat-dialog-content>
        <form [formGroup]="form" class="ax-event-dialog__form">
          <!-- Title -->
          <mat-form-field appearance="outline" class="ax-event-dialog__field">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="Event title" />
            @if (
              form.get('title')?.hasError('required') &&
              form.get('title')?.touched
            ) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <!-- All Day Checkbox -->
          <div class="ax-event-dialog__checkbox">
            <mat-checkbox formControlName="allDay">All day event</mat-checkbox>
          </div>

          <!-- Date/Time Fields -->
          <div class="ax-event-dialog__row">
            <!-- Start Date -->
            <mat-form-field appearance="outline" class="ax-event-dialog__field">
              <mat-label>Start Date</mat-label>
              <input
                matInput
                [matDatepicker]="startPicker"
                formControlName="startDate"
              />
              <mat-datepicker-toggle
                matIconSuffix
                [for]="startPicker"
              ></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <!-- Start Time (if not all day) -->
            @if (!form.get('allDay')?.value) {
              <mat-form-field
                appearance="outline"
                class="ax-event-dialog__field ax-event-dialog__field--time"
              >
                <mat-label>Start Time</mat-label>
                <input matInput type="time" formControlName="startTime" />
              </mat-form-field>
            }
          </div>

          <div class="ax-event-dialog__row">
            <!-- End Date -->
            <mat-form-field appearance="outline" class="ax-event-dialog__field">
              <mat-label>End Date</mat-label>
              <input
                matInput
                [matDatepicker]="endPicker"
                formControlName="endDate"
              />
              <mat-datepicker-toggle
                matIconSuffix
                [for]="endPicker"
              ></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>

            <!-- End Time (if not all day) -->
            @if (!form.get('allDay')?.value) {
              <mat-form-field
                appearance="outline"
                class="ax-event-dialog__field ax-event-dialog__field--time"
              >
                <mat-label>End Time</mat-label>
                <input matInput type="time" formControlName="endTime" />
              </mat-form-field>
            }
          </div>

          <!-- Color -->
          <mat-form-field appearance="outline" class="ax-event-dialog__field">
            <mat-label>Color</mat-label>
            <mat-select formControlName="color">
              @for (option of colorOptions; track option.value) {
                <mat-option [value]="option.value">
                  <span class="ax-event-dialog__color-option">
                    <span
                      class="ax-event-dialog__color-dot"
                      [class]="option.cssClass"
                    ></span>
                    {{ option.label }}
                  </span>
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <!-- Description -->
          <mat-form-field
            appearance="outline"
            class="ax-event-dialog__field ax-event-dialog__field--full"
          >
            <mat-label>Description</mat-label>
            <textarea
              matInput
              formControlName="description"
              placeholder="Event description"
              rows="3"
            ></textarea>
          </mat-form-field>

          <!-- Location -->
          <mat-form-field
            appearance="outline"
            class="ax-event-dialog__field ax-event-dialog__field--full"
          >
            <mat-label>Location</mat-label>
            <input
              matInput
              formControlName="location"
              placeholder="Event location"
            />
            <mat-icon matPrefix>location_on</mat-icon>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        @if (data.mode === 'edit') {
          <button
            mat-button
            color="warn"
            (click)="onDelete()"
            class="ax-event-dialog__delete-btn"
          >
            <mat-icon>delete</mat-icon>
            Delete
          </button>
        }
        <button mat-button (click)="onCancel()">Cancel</button>
        <button
          mat-flat-button
          color="primary"
          (click)="onSave()"
          [disabled]="!form.valid"
        >
          {{ data.mode === 'create' ? 'Create' : 'Save' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .ax-event-dialog {
        min-width: 400px;
      }

      .ax-event-dialog__form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .ax-event-dialog__row {
        display: flex;
        gap: 1rem;
      }

      .ax-event-dialog__field {
        flex: 1;
      }

      .ax-event-dialog__field--time {
        max-width: 140px;
      }

      .ax-event-dialog__field--full {
        width: 100%;
      }

      .ax-event-dialog__checkbox {
        margin-bottom: 0.5rem;
      }

      .ax-event-dialog__color-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .ax-event-dialog__color-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .ax-event-dialog__color-dot--primary {
        background-color: var(--ax-primary-default, #6366f1);
      }

      .ax-event-dialog__color-dot--success {
        background-color: var(--ax-success-default, #10b981);
      }

      .ax-event-dialog__color-dot--warning {
        background-color: var(--ax-warning-default, #f59e0b);
      }

      .ax-event-dialog__color-dot--danger {
        background-color: var(--ax-danger-default, #ef4444);
      }

      .ax-event-dialog__color-dot--info {
        background-color: var(--ax-info-default, #3b82f6);
      }

      .ax-event-dialog__color-dot--secondary {
        background-color: var(--ax-text-secondary, #6b7280);
      }

      .ax-event-dialog__delete-btn {
        margin-right: auto;
      }

      mat-dialog-actions {
        padding: 1rem 1.5rem;
        gap: 0.5rem;
      }

      @media (max-width: 600px) {
        .ax-event-dialog {
          min-width: unset;
        }

        .ax-event-dialog__row {
          flex-direction: column;
          gap: 0;
        }

        .ax-event-dialog__field--time {
          max-width: unset;
        }
      }
    `,
  ],
})
export class AxCalendarEventDialogComponent implements OnInit {
  form!: FormGroup;

  colorOptions: ColorOption[] = [
    {
      value: 'primary',
      label: 'Primary',
      cssClass: 'ax-event-dialog__color-dot--primary',
    },
    {
      value: 'success',
      label: 'Success',
      cssClass: 'ax-event-dialog__color-dot--success',
    },
    {
      value: 'warning',
      label: 'Warning',
      cssClass: 'ax-event-dialog__color-dot--warning',
    },
    {
      value: 'danger',
      label: 'Danger',
      cssClass: 'ax-event-dialog__color-dot--danger',
    },
    {
      value: 'info',
      label: 'Info',
      cssClass: 'ax-event-dialog__color-dot--info',
    },
    {
      value: 'secondary',
      label: 'Secondary',
      cssClass: 'ax-event-dialog__color-dot--secondary',
    },
  ];

  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(
    MatDialogRef<AxCalendarEventDialogComponent, AxCalendarEventDialogResult>,
  );
  public readonly data = inject<AxCalendarEventDialogData>(MAT_DIALOG_DATA);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const event = this.data.event;
    const start = event?.start
      ? new Date(event.start)
      : this.data.start || new Date();
    const end = event?.end
      ? new Date(event.end)
      : this.data.end || new Date(start.getTime() + 60 * 60 * 1000); // 1 hour later

    this.form = this.fb.group({
      title: [event?.title || '', Validators.required],
      allDay: [event?.allDay ?? this.data.allDay ?? false],
      startDate: [start, Validators.required],
      startTime: [this.formatTime(start)],
      endDate: [end],
      endTime: [this.formatTime(end)],
      color: [event?.color || 'primary'],
      description: [event?.extendedProps?.['description'] || ''],
      location: [event?.extendedProps?.['location'] || ''],
    });
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private parseTime(timeStr: string, baseDate: Date): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(baseDate);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  onSave(): void {
    if (!this.form.valid) return;

    const values = this.form.value;
    const startDate = new Date(values.startDate);
    const endDate = values.endDate ? new Date(values.endDate) : null;

    let start: Date;
    let end: Date | undefined;

    if (values.allDay) {
      // For all-day events, set to start of day
      startDate.setHours(0, 0, 0, 0);
      start = startDate;
      if (endDate) {
        endDate.setHours(0, 0, 0, 0);
        end = endDate;
      }
    } else {
      // For timed events, parse the time
      start = this.parseTime(values.startTime || '00:00', startDate);
      if (endDate && values.endTime) {
        end = this.parseTime(values.endTime, endDate);
      }
    }

    const event: Partial<AxCalendarEvent> = {
      id: this.data.event?.id,
      title: values.title,
      start,
      end,
      allDay: values.allDay,
      color: values.color,
      extendedProps: {
        description: values.description,
        location: values.location,
      },
    };

    this.dialogRef.close({
      action: 'save',
      event,
    });
  }

  onDelete(): void {
    this.dialogRef.close({
      action: 'delete',
      event: this.data.event,
    });
  }

  onCancel(): void {
    this.dialogRef.close({
      action: 'cancel',
    });
  }
}
