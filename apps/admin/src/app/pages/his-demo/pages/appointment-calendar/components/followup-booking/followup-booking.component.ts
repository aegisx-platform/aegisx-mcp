import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { AppointmentDemoService } from '../../services/appointment-demo.service';
import {
  Patient,
  Doctor,
  ExaminationRoom,
  TimeSlot,
  Appointment,
  DateValidationResult,
  AvailableSlot,
} from '../../models/appointment.models';

/**
 * Quick Duration Option
 * ตัวเลือกระยะเวลาสำหรับนัด follow-up
 */
interface QuickDuration {
  label: string;
  days: number;
  shortLabel: string;
}

/**
 * FollowupBookingComponent
 *
 * Embedded component สำหรับนัด follow-up ที่สามารถฝังในหน้าอื่นๆ ได้
 * - รับข้อมูลคนไข้/ห้อง/แพทย์ มาเป็น Input
 * - Auto-skip วันหยุด/เสาร์-อาทิตย์
 * - Submit แล้วอยู่หน้าเดิม พร้อมนัดคนต่อไป
 */
@Component({
  selector: 'app-followup-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatCardModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule,
  ],
  template: `
    <div class="flex flex-col gap-4 p-4">
      <!-- Header -->
      <div class="flex items-center gap-3 text-xl font-semibold mb-2">
        <mat-icon>event_repeat</mat-icon>
        <span>นัด Follow-up</span>
      </div>

      <!-- Section 1: Patient Info -->
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>ข้อมูลผู้ป่วย</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (currentPatient()) {
            <div class="flex items-center justify-between gap-4">
              <div class="flex-1">
                <div class="text-lg font-semibold mb-2">
                  {{ currentPatient()!.title
                  }}{{ currentPatient()!.firstName }}
                  {{ currentPatient()!.lastName }}
                </div>
                <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span class="flex items-center gap-1">
                    <mat-icon class="!text-base !w-4 !h-4">badge</mat-icon>
                    HN: {{ currentPatient()!.hn }}
                  </span>
                  <span class="flex items-center gap-1">
                    <mat-icon class="!text-base !w-4 !h-4">cake</mat-icon>
                    อายุ {{ calculateAge(currentPatient()!.birthDate) }} ปี
                  </span>
                  @if (currentPatient()!.phone) {
                    <span class="flex items-center gap-1">
                      <mat-icon class="!text-base !w-4 !h-4">phone</mat-icon>
                      {{ currentPatient()!.phone }}
                    </span>
                  }
                </div>
              </div>
              <button
                mat-stroked-button
                color="primary"
                (click)="onChangePatient()"
              >
                <mat-icon>swap_horiz</mat-icon>
                เปลี่ยน
              </button>
            </div>
          } @else {
            <div class="flex flex-col items-center gap-3 py-6 text-gray-500">
              <mat-icon class="!text-5xl !w-12 !h-12">person_search</mat-icon>
              <span>กรุณาเลือกผู้ป่วย</span>
              <button
                mat-flat-button
                color="primary"
                (click)="onChangePatient()"
              >
                <mat-icon>search</mat-icon>
                ค้นหาผู้ป่วย
              </button>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Section 2: Date Selection -->
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>เลือกวันนัด</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="flex flex-col gap-4">
            <div class="text-sm font-medium text-gray-600">นัดอีก:</div>
            <div class="flex flex-wrap gap-2">
              @for (option of quickDurations; track option.days) {
                <button
                  mat-stroked-button
                  [class.!bg-primary]="selectedDuration() === option.days"
                  [class.!text-white]="selectedDuration() === option.days"
                  (click)="selectDuration(option.days)"
                >
                  {{ option.label }}
                </button>
              }
            </div>

            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-sm text-gray-600">หรือเลือกวันที่:</span>
              <mat-form-field appearance="outline" class="w-52">
                <mat-label>เลือกวัน</mat-label>
                <input
                  matInput
                  [matDatepicker]="picker"
                  [value]="customDate()"
                  (dateChange)="onCustomDateChange($event.value)"
                  [min]="minDate"
                />
                <mat-datepicker-toggle
                  matIconSuffix
                  [for]="picker"
                ></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>

            <mat-checkbox
              [checked]="includeHolidays()"
              (change)="includeHolidays.set($event.checked)"
            >
              รวมวันหยุดด้วย (เฉพาะกรณีจำเป็น)
            </mat-checkbox>

            <!-- Date Result -->
            @if (dateValidation()) {
              <div
                class="flex items-center gap-3 p-4 rounded-lg"
                [class.bg-green-50]="!dateValidation()!.warnings?.length"
                [class.border-green-500]="!dateValidation()!.warnings?.length"
                [class.bg-red-50]="dateValidation()!.warnings?.length"
                [class.border-red-500]="dateValidation()!.warnings?.length"
                class="border"
              >
                <mat-icon
                  [class.text-green-600]="!dateValidation()!.warnings?.length"
                  [class.text-red-600]="dateValidation()!.warnings?.length"
                >
                  event_available
                </mat-icon>
                <div class="flex-1">
                  <div>
                    <strong>{{
                      formatThaiDate(dateValidation()!.date)
                    }}</strong>
                    @if (
                      dateValidation()!.skippedDays &&
                      dateValidation()!.skippedDays! > 0
                    ) {
                      <span class="text-sm text-gray-500 ml-2"
                        >(ข้าม
                        {{ dateValidation()!.skippedDays }} วันหยุด)</span
                      >
                    }
                  </div>
                  @if (dateValidation()!.warnings?.length) {
                    <div class="flex flex-wrap gap-1 mt-2">
                      @for (warn of dateValidation()!.warnings; track warn) {
                        <mat-chip color="warn">{{ warn }}</mat-chip>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Section 3: Appointment Details -->
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>รายละเอียดการนัด</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="flex flex-col gap-4">
            <div class="flex gap-4">
              <!-- Room Selection -->
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>ห้องตรวจ</mat-label>
                <mat-select
                  [value]="selectedRoomId()"
                  (selectionChange)="selectedRoomId.set($event.value)"
                >
                  @for (room of currentRooms(); track room.id) {
                    <mat-option [value]="room.id">
                      {{ room.name }}
                    </mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>meeting_room</mat-icon>
              </mat-form-field>

              <!-- Doctor Selection -->
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>แพทย์</mat-label>
                <mat-select
                  [value]="selectedDoctorId()"
                  (selectionChange)="selectedDoctorId.set($event.value)"
                >
                  @for (doctor of filteredDoctors(); track doctor.id) {
                    <mat-option [value]="doctor.id">
                      {{ doctor.name }}
                    </mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>medical_services</mat-icon>
              </mat-form-field>
            </div>

            <!-- Time Slots -->
            <div>
              <div
                class="flex items-center gap-2 mb-3 font-medium text-gray-600"
              >
                <mat-icon class="!text-xl !w-5 !h-5">schedule</mat-icon>
                เวลา:
              </div>
              <div class="grid grid-cols-6 gap-2">
                @for (slot of availableSlots(); track slot.timeSlotId) {
                  <button
                    mat-stroked-button
                    [class.!bg-primary]="
                      selectedTimeSlotId() === slot.timeSlotId
                    "
                    [class.!text-white]="
                      selectedTimeSlotId() === slot.timeSlotId
                    "
                    [class.opacity-40]="!slot.isAvailable"
                    [class.line-through]="!slot.isAvailable"
                    [disabled]="!slot.isAvailable"
                    (click)="selectTimeSlot(slot.timeSlotId)"
                    [matTooltip]="slot.isAvailable ? 'ว่าง' : 'ไม่ว่าง'"
                  >
                    {{ slot.startTime }}
                  </button>
                } @empty {
                  <div
                    class="col-span-6 flex items-center justify-center gap-2 py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300"
                  >
                    <mat-icon>info</mat-icon>
                    <span>เลือกวันนัดก่อนเพื่อดูช่วงเวลาว่าง</span>
                  </div>
                }
              </div>
            </div>

            <!-- Notes -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>หมายเหตุ</mat-label>
              <mat-icon matPrefix>notes</mat-icon>
              <textarea
                matInput
                rows="2"
                [value]="notes()"
                (input)="notes.set($any($event.target).value)"
                placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
              ></textarea>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t mt-2">
        <button mat-stroked-button color="warn" (click)="onCancel()">
          <mat-icon>close</mat-icon>
          ยกเลิก
        </button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="!canSubmit()"
          (click)="onSubmit()"
        >
          <mat-icon>check</mat-icon>
          บันทึกนัดหมาย
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class FollowupBookingComponent {
  private service = inject(AppointmentDemoService);

  // ==========================================================================
  // Inputs
  // ==========================================================================

  @Input() set patient(value: Patient | undefined) {
    this._patient.set(value);
  }

  @Input() set defaultRoom(value: ExaminationRoom | undefined) {
    if (value) {
      this.selectedRoomId.set(value.id);
    }
  }

  @Input() set defaultDoctor(value: Doctor | undefined) {
    if (value) {
      this.selectedDoctorId.set(value.id);
    }
  }

  @Input() set rooms(value: ExaminationRoom[]) {
    this._rooms.set(value);
  }

  @Input() set doctors(value: Doctor[]) {
    this._doctors.set(value);
  }

  @Input() set timeSlots(value: TimeSlot[]) {
    this._timeSlots.set(value);
  }

  // ==========================================================================
  // Outputs
  // ==========================================================================

  @Output() appointmentCreated = new EventEmitter<Appointment>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() changePatient = new EventEmitter<void>();

  // ==========================================================================
  // Internal State
  // ==========================================================================

  private _patient = signal<Patient | undefined>(undefined);
  private _rooms = signal<ExaminationRoom[]>([]);
  private _doctors = signal<Doctor[]>([]);
  private _timeSlots = signal<TimeSlot[]>([]);

  // Form state
  selectedDuration = signal<number | null>(null);
  customDate = signal<Date | null>(null);
  includeHolidays = signal(false);
  selectedRoomId = signal<string>('');
  selectedDoctorId = signal<string>('');
  selectedTimeSlotId = signal<string>('');
  notes = signal('');

  // Quick duration options
  readonly quickDurations: QuickDuration[] = [
    { label: '1 สัปดาห์', days: 7, shortLabel: '1w' },
    { label: '2 สัปดาห์', days: 14, shortLabel: '2w' },
    { label: '1 เดือน', days: 30, shortLabel: '1m' },
    { label: '2 เดือน', days: 60, shortLabel: '2m' },
    { label: '3 เดือน', days: 90, shortLabel: '3m' },
  ];

  readonly minDate = new Date();

  // ==========================================================================
  // Computed Values
  // ==========================================================================

  // Expose internal signals for template use
  readonly currentPatient = computed(() => this._patient());
  readonly currentRooms = computed(() => this._rooms());
  readonly currentDoctors = computed(() => this._doctors());

  // Filter doctors by selected room
  filteredDoctors = computed(() => {
    const roomId = this.selectedRoomId();
    if (!roomId) return this._doctors();
    return this._doctors().filter((d) => d.roomIds.includes(roomId));
  });

  // Calculate date validation
  dateValidation = computed<DateValidationResult | null>(() => {
    const duration = this.selectedDuration();
    const custom = this.customDate();
    const roomId = this.selectedRoomId();
    const doctorId = this.selectedDoctorId();
    const patientId = this._patient()?.id;

    if (!patientId || !roomId || !doctorId) return null;

    if (custom) {
      // User selected a specific date
      return this.service.validateDate(custom, {
        patientId,
        roomId,
        doctorId,
        targetDays: 0,
        includeHolidays: this.includeHolidays(),
      });
    }

    if (duration) {
      // User selected a quick duration
      return this.service.findAvailableDate({
        patientId,
        roomId,
        doctorId,
        targetDays: duration,
        includeHolidays: this.includeHolidays(),
      });
    }

    return null;
  });

  // Get available time slots for selected date
  availableSlots = computed<AvailableSlot[]>(() => {
    const validation = this.dateValidation();
    const roomId = this.selectedRoomId();
    const doctorId = this.selectedDoctorId();

    if (!validation?.date || !roomId || !doctorId) return [];

    return this.service.getAvailableTimeSlots(
      validation.date,
      roomId,
      doctorId,
    );
  });

  // Check if form can be submitted
  canSubmit = computed(() => {
    return !!(
      this._patient() &&
      this.dateValidation()?.isValid &&
      this.selectedRoomId() &&
      this.selectedDoctorId() &&
      this.selectedTimeSlotId()
    );
  });

  // ==========================================================================
  // Effects
  // ==========================================================================

  constructor() {
    // Reset time slot when date changes
    effect(
      () => {
        // Just reading these to trigger the effect
        this.dateValidation();
        this.selectedRoomId();
        this.selectedDoctorId();
        // Reset time slot selection
        this.selectedTimeSlotId.set('');
      },
      { allowSignalWrites: true },
    );
  }

  // ==========================================================================
  // Methods
  // ==========================================================================

  selectDuration(days: number): void {
    this.selectedDuration.set(days);
    this.customDate.set(null); // Clear custom date
  }

  onCustomDateChange(date: Date | null): void {
    this.customDate.set(date);
    this.selectedDuration.set(null); // Clear quick duration
  }

  selectTimeSlot(slotId: string): void {
    this.selectedTimeSlotId.set(slotId);
  }

  onChangePatient(): void {
    this.changePatient.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onSubmit(): void {
    const patient = this._patient();
    const validation = this.dateValidation();
    const roomId = this.selectedRoomId();
    const doctorId = this.selectedDoctorId();
    const timeSlotId = this.selectedTimeSlotId();

    if (!patient || !validation?.date || !roomId || !doctorId || !timeSlotId) {
      return;
    }

    // Create appointment
    const appointment = this.service.createAppointment({
      roomId,
      doctorId,
      patientId: patient.id,
      date: validation.date,
      timeSlotId,
      purposeId: 'purpose-1', // Follow-up purpose
      preparations: [],
      notes: this.notes(),
      contactPhone: patient.phone || '',
      tags: ['follow-up'],
      metadata: {},
      status: 'scheduled',
    });

    // Emit event
    this.appointmentCreated.emit(appointment);

    // Clear form for next patient
    this.clearForm();
  }

  clearForm(): void {
    this.selectedDuration.set(null);
    this.customDate.set(null);
    this.selectedTimeSlotId.set('');
    this.notes.set('');
    // Keep room and doctor for convenience
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  }

  formatThaiDate(date: Date): string {
    const days = [
      'อาทิตย์',
      'จันทร์',
      'อังคาร',
      'พุธ',
      'พฤหัสบดี',
      'ศุกร์',
      'เสาร์',
    ];
    const months = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ];

    const d = new Date(date);
    const dayName = days[d.getDay()];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543; // Buddhist year

    return `${dayName} ${day} ${month} ${year}`;
  }
}
