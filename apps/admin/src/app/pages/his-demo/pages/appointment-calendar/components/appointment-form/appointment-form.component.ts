import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';

// Models
import {
  Appointment,
  AppointmentPurpose,
  AppointmentView,
  Doctor,
  ExaminationRoom,
  Patient,
  PreparationTag,
  TimeSlot,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from '../../models/appointment.models';
import { AppointmentDemoService } from '../../services/appointment-demo.service';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatDividerModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <mat-card appearance="outlined" class="appointment-form-card">
      <mat-card-header>
        <mat-card-title>
          @switch (mode) {
            @case ('create') {
              <mat-icon>add_circle</mat-icon>
              สร้างนัดหมายใหม่
            }
            @case ('edit') {
              <mat-icon>edit</mat-icon>
              แก้ไขนัดหมาย
            }
            @case ('view') {
              <mat-icon>visibility</mat-icon>
              รายละเอียดนัดหมาย
            }
          }
        </mat-card-title>
        <button mat-icon-button (click)="cancel.emit()">
          <mat-icon>close</mat-icon>
        </button>
      </mat-card-header>

      <mat-card-content>
        @if (mode === 'view' && appointment) {
          <!-- View Mode -->
          <div class="view-details">
            <div class="detail-row">
              <span class="label">เลขที่นัด:</span>
              <span class="value">{{ appointment.appointmentNumber }}</span>
            </div>

            <div class="detail-row">
              <span class="label">สถานะ:</span>
              <span
                class="status-chip"
                [class]="'status-' + appointment.status"
              >
                {{ statusLabels[appointment.status] }}
              </span>
            </div>

            <mat-divider></mat-divider>

            <div class="detail-row">
              <span class="label">ห้องตรวจ:</span>
              <span class="value">{{ appointment.room?.name }}</span>
            </div>

            <div class="detail-row">
              <span class="label">แพทย์:</span>
              <span class="value">{{ appointment.doctor?.name }}</span>
            </div>

            <div class="detail-row">
              <span class="label">คนไข้:</span>
              <span class="value">
                {{ appointment.patient?.firstName }}
                {{ appointment.patient?.lastName }}
                (HN: {{ appointment.patient?.hn }})
              </span>
            </div>

            <mat-divider></mat-divider>

            <div class="detail-row">
              <span class="label">วันที่:</span>
              <span class="value">
                {{ appointment.date | date: 'fullDate' : '' : 'th' }}
              </span>
            </div>

            <div class="detail-row">
              <span class="label">เวลา:</span>
              <span class="value">{{ appointment.timeSlot?.label }}</span>
            </div>

            <div class="detail-row">
              <span class="label">นัดมาเพื่อ:</span>
              <span class="value">{{ appointment.purpose?.name }}</span>
            </div>

            @if (
              appointment.preparationTags &&
              appointment.preparationTags.length > 0
            ) {
              <div class="detail-row">
                <span class="label">การเตรียมตัว:</span>
                <div class="prep-tags">
                  @for (prep of appointment.preparationTags; track prep.id) {
                    <span class="prep-tag">
                      <mat-icon>{{ prep.icon }}</mat-icon>
                      {{ prep.name }}
                    </span>
                  }
                </div>
              </div>
            }

            @if (appointment.notes) {
              <div class="detail-row">
                <span class="label">หมายเหตุ:</span>
                <span class="value">{{ appointment.notes }}</span>
              </div>
            }
          </div>

          <div class="form-actions">
            <button mat-button (click)="cancel.emit()">ปิด</button>
            @if (
              appointment.status !== 'cancelled' &&
              appointment.status !== 'completed'
            ) {
              <button mat-flat-button color="primary" (click)="switchToEdit()">
                <mat-icon>edit</mat-icon>
                แก้ไข
              </button>
            }
          </div>
        } @else {
          <!-- Create/Edit Mode -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Room -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>ห้องตรวจ</mat-label>
              <mat-select
                formControlName="roomId"
                (selectionChange)="onRoomChange()"
              >
                @for (room of rooms; track room.id) {
                  <mat-option [value]="room.id">
                    <span
                      class="room-color-dot"
                      [style.backgroundColor]="room.color"
                    ></span>
                    {{ room.name }}
                  </mat-option>
                }
              </mat-select>
              <mat-error>กรุณาเลือกห้องตรวจ</mat-error>
            </mat-form-field>

            <!-- Doctor -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>แพทย์</mat-label>
              <mat-select formControlName="doctorId">
                @for (doctor of availableDoctors(); track doctor.id) {
                  <mat-option [value]="doctor.id">
                    {{ doctor.name }} ({{ doctor.specialty }})
                  </mat-option>
                }
              </mat-select>
              <mat-error>กรุณาเลือกแพทย์</mat-error>
            </mat-form-field>

            <!-- Patient Search -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>คนไข้ (ค้นหาด้วย HN, CID, หรือชื่อ)</mat-label>
              <input
                matInput
                formControlName="patientSearch"
                [matAutocomplete]="patientAuto"
                (input)="onPatientSearchChange($event)"
              />
              <mat-autocomplete
                #patientAuto="matAutocomplete"
                (optionSelected)="onPatientSelect($event)"
                [displayWith]="displayPatient"
              >
                @for (patient of patientResults(); track patient.id) {
                  <mat-option [value]="patient">
                    <span class="patient-option">
                      <strong>{{ patient.hn }}</strong>
                      {{ patient.title }}{{ patient.firstName }}
                      {{ patient.lastName }}
                    </span>
                  </mat-option>
                }
              </mat-autocomplete>
              <mat-error>กรุณาเลือกคนไข้</mat-error>
            </mat-form-field>

            <!-- Date & Time -->
            <div class="row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>วันที่</mat-label>
                <input
                  matInput
                  [matDatepicker]="datePicker"
                  formControlName="date"
                />
                <mat-datepicker-toggle
                  matIconSuffix
                  [for]="datePicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #datePicker></mat-datepicker>
                <mat-error>กรุณาเลือกวันที่</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>ช่วงเวลา</mat-label>
                <mat-select formControlName="timeSlotId">
                  @for (slot of timeSlots; track slot.id) {
                    <mat-option [value]="slot.id">
                      {{ slot.label }}
                    </mat-option>
                  }
                </mat-select>
                <mat-error>กรุณาเลือกช่วงเวลา</mat-error>
              </mat-form-field>
            </div>

            <!-- Purpose -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>นัดมาเพื่อ</mat-label>
              <mat-select
                formControlName="purposeId"
                (selectionChange)="onPurposeChange($event)"
              >
                @for (purpose of purposes; track purpose.id) {
                  <mat-option [value]="purpose.id">
                    {{ purpose.name }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <!-- Preparations -->
            <div class="preparations-section">
              <label>การเตรียมตัว</label>
              <div class="prep-chips">
                @for (prep of preparations; track prep.id) {
                  <mat-chip-option
                    [selected]="selectedPreparations().includes(prep.id)"
                    (selectionChange)="togglePreparation(prep.id)"
                  >
                    <mat-icon matChipAvatar>{{ prep.icon }}</mat-icon>
                    {{ prep.name }}
                  </mat-chip-option>
                }
              </div>
            </div>

            <!-- Contact Phone -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>เบอร์โทรติดต่อ</mat-label>
              <input matInput formControlName="contactPhone" type="tel" />
              <mat-icon matPrefix>phone</mat-icon>
            </mat-form-field>

            <!-- Notes -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>หมายเหตุ</mat-label>
              <textarea matInput formControlName="notes" rows="3"></textarea>
            </mat-form-field>

            <!-- Actions -->
            <div class="form-actions">
              <button mat-button type="button" (click)="cancel.emit()">
                ยกเลิก
              </button>
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="!form.valid"
              >
                <mat-icon>save</mat-icon>
                {{ mode === 'create' ? 'สร้างนัดหมาย' : 'บันทึก' }}
              </button>
            </div>
          </form>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .appointment-form-card {
        height: 100%;
      }

      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: var(--ax-background-subtle);
        border-bottom: 1px solid var(--ax-border-default);

        mat-card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          font-size: 1.125rem;

          mat-icon {
            color: var(--ax-primary-default);
          }
        }
      }

      mat-card-content {
        padding: 1.5rem;
      }

      .full-width {
        width: 100%;
      }

      .half-width {
        width: calc(50% - 0.5rem);
      }

      .row {
        display: flex;
        gap: 1rem;
      }

      .room-color-dot {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
      }

      .patient-option {
        display: flex;
        gap: 0.5rem;

        strong {
          color: var(--ax-primary-default);
        }
      }

      .preparations-section {
        margin-bottom: 1rem;

        label {
          display: block;
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
          margin-bottom: 0.5rem;
        }

        .prep-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid var(--ax-border-default);
      }

      /* View Mode Styles */
      .view-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .detail-row {
        display: flex;
        align-items: flex-start;
        gap: 1rem;

        .label {
          min-width: 100px;
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }

        .value {
          font-size: 0.875rem;
          color: var(--ax-text-primary);
        }
      }

      .status-chip {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 500;

        &.status-scheduled {
          background: var(--ax-primary-subtle);
          color: var(--ax-primary-default);
        }
        &.status-confirmed {
          background: var(--ax-info-subtle);
          color: var(--ax-info-default);
        }
        &.status-checked-in,
        &.status-in-progress {
          background: var(--ax-warning-subtle);
          color: var(--ax-warning-default);
        }
        &.status-completed {
          background: var(--ax-success-subtle);
          color: var(--ax-success-default);
        }
        &.status-cancelled,
        &.status-no-show {
          background: var(--ax-error-subtle);
          color: var(--ax-error-default);
        }
      }

      .prep-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .prep-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        background: var(--ax-background-subtle);
        border-radius: 0.25rem;
        font-size: 0.75rem;

        mat-icon {
          font-size: 1rem;
          width: 1rem;
          height: 1rem;
        }
      }

      mat-divider {
        margin: 0.5rem 0;
      }
    `,
  ],
})
export class AppointmentFormComponent implements OnInit, OnChanges {
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() appointment?: AppointmentView;
  @Input() preSelectedDate?: Date;
  @Input() rooms: ExaminationRoom[] = [];
  @Input() doctors: Doctor[] = [];
  @Input() timeSlots: TimeSlot[] = [];
  @Input() purposes: AppointmentPurpose[] = [];
  @Input() preparations: PreparationTag[] = [];

  @Output() save = new EventEmitter<Partial<Appointment>>();
  @Output() cancel = new EventEmitter<void>();
  @Output() searchPatient = new EventEmitter<string>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AppointmentDemoService);

  form!: FormGroup;
  statusLabels = APPOINTMENT_STATUS_LABELS;

  // Signals
  patientResults = signal<Patient[]>([]);
  selectedPatient = signal<Patient | null>(null);
  selectedPreparations = signal<string[]>([]);

  availableDoctors = computed(() => {
    const roomId = this.form?.get('roomId')?.value;
    if (!roomId) return this.doctors;
    return this.doctors.filter((d) => d.roomIds.includes(roomId));
  });

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointment'] || changes['preSelectedDate']) {
      this.initForm();
    }
  }

  private initForm(): void {
    const apt = this.appointment;

    this.form = this.fb.group({
      roomId: [apt?.roomId || '', Validators.required],
      doctorId: [apt?.doctorId || '', Validators.required],
      patientId: [apt?.patientId || '', Validators.required],
      patientSearch: [apt?.patient ? this.displayPatient(apt.patient) : ''],
      date: [
        apt?.date || this.preSelectedDate || new Date(),
        Validators.required,
      ],
      timeSlotId: [apt?.timeSlotId || '', Validators.required],
      purposeId: [apt?.purposeId || ''],
      contactPhone: [apt?.contactPhone || ''],
      notes: [apt?.notes || ''],
    });

    this.selectedPreparations.set(apt?.preparations || []);
    this.selectedPatient.set(apt?.patient || null);
  }

  onRoomChange(): void {
    // Reset doctor if not available in new room
    const roomId = this.form.get('roomId')?.value;
    const doctorId = this.form.get('doctorId')?.value;
    const doctors = this.doctors.filter((d) => d.roomIds.includes(roomId));
    if (!doctors.find((d) => d.id === doctorId)) {
      this.form.patchValue({ doctorId: '' });
    }
  }

  onPatientSearchChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    if (query.length >= 2) {
      const results = this.service.searchPatients(query);
      this.patientResults.set(results);
    } else {
      this.patientResults.set([]);
    }
  }

  onPatientSelect(event: { option: { value: Patient } }): void {
    const patient = event.option.value;
    this.selectedPatient.set(patient);
    this.form.patchValue({
      patientId: patient.id,
      contactPhone: patient.phone || '',
    });
  }

  displayPatient(patient: Patient | null): string {
    if (!patient) return '';
    return `${patient.hn} - ${patient.title}${patient.firstName} ${patient.lastName}`;
  }

  onPurposeChange(event: { value: string }): void {
    const purpose = this.purposes.find((p) => p.id === event.value);
    if (purpose?.defaultPreparations) {
      this.selectedPreparations.set([...purpose.defaultPreparations]);
    }
  }

  togglePreparation(prepId: string): void {
    const current = this.selectedPreparations();
    if (current.includes(prepId)) {
      this.selectedPreparations.set(current.filter((id) => id !== prepId));
    } else {
      this.selectedPreparations.set([...current, prepId]);
    }
  }

  switchToEdit(): void {
    this.mode = 'edit';
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const data: Partial<Appointment> = {
        roomId: formValue.roomId,
        doctorId: formValue.doctorId,
        patientId: formValue.patientId,
        date: formValue.date,
        timeSlotId: formValue.timeSlotId,
        purposeId: formValue.purposeId,
        preparations: this.selectedPreparations(),
        contactPhone: formValue.contactPhone,
        notes: formValue.notes,
        tags: [],
        metadata: {},
        status: 'scheduled',
      };
      this.save.emit(data);
    }
  }
}
