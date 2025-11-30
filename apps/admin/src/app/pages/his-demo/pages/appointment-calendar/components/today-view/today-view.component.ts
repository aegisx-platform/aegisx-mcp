import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  Signal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import {
  AppointmentView,
  AppointmentStatus,
  ExaminationRoom,
  Doctor,
  TimeSlot,
  APPOINTMENT_STATUS_LABELS,
} from '../../models/appointment.models';

interface TodaySummary {
  total: number;
  limit: number;
  arrived: number;
  waiting: number;
  inProgress: number;
  completed: number;
  noShow: number;
}

interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  booked: number;
  limit: number;
  isToday: boolean;
  isSelected: boolean;
  availability: 'available' | 'filling' | 'almost-full' | 'full';
}

interface TimeSlotView {
  slot: TimeSlot;
  appointment?: AppointmentView;
  isAvailable: boolean;
  isPast: boolean;
  isCurrent: boolean;
}

@Component({
  selector: 'app-today-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="today-view">
      <!-- Header -->
      <div class="today-header">
        <div class="header-info">
          <div class="header-room">
            <mat-icon>local_hospital</mat-icon>
            <span>{{ selectedRoom()?.name || 'ทุกห้อง' }}</span>
          </div>
          <div class="header-doctor" *ngIf="selectedDoctor()">
            <mat-icon>person</mat-icon>
            <span>{{ selectedDoctor()?.name }}</span>
          </div>
        </div>

        <!-- Date Navigation -->
        <div class="date-navigation">
          <button mat-icon-button (click)="prevDay()" matTooltip="วันก่อนหน้า">
            <mat-icon>chevron_left</mat-icon>
          </button>

          <div class="date-display" (click)="datePicker.open()">
            <h2>{{ selectedDate() | date: 'EEEE' : '' : 'th' }}</h2>
            <p>{{ selectedDate() | date: 'd MMMM yyyy' : '' : 'th' }}</p>
          </div>
          <input
            [matDatepicker]="datePicker"
            [value]="selectedDate()"
            (dateChange)="onDateChange($event)"
            style="position: absolute; visibility: hidden; width: 0; height: 0;"
          />
          <mat-datepicker #datePicker></mat-datepicker>

          <button mat-icon-button (click)="nextDay()" matTooltip="วันถัดไป">
            <mat-icon>chevron_right</mat-icon>
          </button>

          <button
            mat-stroked-button
            class="today-btn"
            (click)="goToToday()"
            [disabled]="isToday()"
          >
            วันนี้
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-section">
        <mat-card appearance="outlined" class="summary-card main">
          <div class="summary-icon">
            <mat-icon>event_available</mat-icon>
          </div>
          <div class="summary-content">
            <div class="summary-value">
              {{ summary().total
              }}<span class="limit">/{{ summary().limit }}</span>
            </div>
            <div class="summary-label">นัดหมาย</div>
          </div>
          <div
            class="availability-indicator"
            [class]="getAvailabilityClass(summary())"
          >
            ว่าง {{ summary().limit - summary().total }}
          </div>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <div class="summary-value arrived">{{ summary().arrived }}</div>
          <div class="summary-label">มาถึงแล้ว</div>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <div class="summary-value waiting">{{ summary().waiting }}</div>
          <div class="summary-label">รอตรวจ</div>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <div class="summary-value in-progress">
            {{ summary().inProgress }}
          </div>
          <div class="summary-label">กำลังตรวจ</div>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <div class="summary-value completed">{{ summary().completed }}</div>
          <div class="summary-label">เสร็จแล้ว</div>
        </mat-card>
      </div>

      <!-- Main Content: Schedule + Week Overview -->
      <div class="main-content">
        <!-- Today's Schedule -->
        <mat-card appearance="outlined" class="schedule-card">
          <div class="card-header">
            <h3>
              <mat-icon>schedule</mat-icon>
              ตาราง{{ isToday() ? 'วันนี้' : '' }}
            </h3>
            <button mat-button color="primary" (click)="onQuickBook.emit()">
              <mat-icon>add</mat-icon>
              นัดด่วน
            </button>
          </div>

          <div class="schedule-list">
            @for (slotView of todaySlots(); track slotView.slot.id) {
              <div
                class="slot-item"
                [class.past]="slotView.isPast"
                [class.current]="slotView.isCurrent"
                [class.available]="slotView.isAvailable"
                [class.booked]="!slotView.isAvailable"
              >
                <div class="slot-time">
                  {{ slotView.slot.startTime }}
                </div>

                @if (slotView.appointment) {
                  <div
                    class="slot-content booked"
                    (click)="onViewAppointment.emit(slotView.appointment)"
                  >
                    <div class="patient-info">
                      <span class="patient-name">
                        {{ slotView.appointment.patient?.firstName }}
                        {{ slotView.appointment.patient?.lastName }}
                      </span>
                      <span class="patient-hn">
                        HN: {{ slotView.appointment.patient?.hn }}
                      </span>
                    </div>
                    <div class="slot-actions">
                      <mat-chip
                        [class]="'status-' + slotView.appointment.status"
                        [disabled]="true"
                      >
                        {{ getStatusLabel(slotView.appointment.status) }}
                      </mat-chip>
                      <button
                        mat-icon-button
                        [matMenuTriggerFor]="statusMenu"
                        (click)="$event.stopPropagation()"
                      >
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #statusMenu="matMenu">
                        <button
                          mat-menu-item
                          (click)="
                            onChangeStatus.emit({
                              apt: slotView.appointment,
                              status: 'checked-in',
                            })
                          "
                        >
                          <mat-icon>login</mat-icon>
                          <span>มาถึงแล้ว</span>
                        </button>
                        <button
                          mat-menu-item
                          (click)="
                            onChangeStatus.emit({
                              apt: slotView.appointment,
                              status: 'in-progress',
                            })
                          "
                        >
                          <mat-icon>play_arrow</mat-icon>
                          <span>เริ่มตรวจ</span>
                        </button>
                        <button
                          mat-menu-item
                          (click)="
                            onChangeStatus.emit({
                              apt: slotView.appointment,
                              status: 'completed',
                            })
                          "
                        >
                          <mat-icon>check_circle</mat-icon>
                          <span>เสร็จสิ้น</span>
                        </button>
                        <mat-divider></mat-divider>
                        <button
                          mat-menu-item
                          (click)="onFollowUp.emit(slotView.appointment)"
                        >
                          <mat-icon>event_repeat</mat-icon>
                          <span>นัด Follow-up</span>
                        </button>
                        <mat-divider></mat-divider>
                        <button
                          mat-menu-item
                          (click)="
                            onChangeStatus.emit({
                              apt: slotView.appointment,
                              status: 'no-show',
                            })
                          "
                        >
                          <mat-icon>person_off</mat-icon>
                          <span>ไม่มา</span>
                        </button>
                      </mat-menu>
                    </div>
                  </div>
                } @else {
                  <div
                    class="slot-content available"
                    (click)="onBookSlot.emit(slotView.slot)"
                  >
                    <span class="available-text">ว่าง</span>
                    <button mat-stroked-button color="primary" class="book-btn">
                      <mat-icon>add</mat-icon>
                      นัดหมาย
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </mat-card>

        <!-- Week Overview -->
        <div class="week-section">
          <mat-card appearance="outlined" class="week-card">
            <div class="card-header">
              <h3>
                <mat-icon>date_range</mat-icon>
                สัปดาห์นี้
              </h3>
              <button
                mat-button
                color="primary"
                (click)="onOpenCalendar.emit()"
              >
                ดูปฏิทิน
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>

            <div class="week-grid">
              @for (day of weekDays(); track day.date) {
                <div
                  class="week-day"
                  [class.today]="day.isToday"
                  [class.selected]="day.isSelected"
                  [class]="day.availability"
                  (click)="onDayClick(day.date)"
                >
                  <div class="day-name">{{ day.dayName }}</div>
                  <div class="day-number">{{ day.dayNumber }}</div>
                  <div class="day-slots">{{ day.booked }}/{{ day.limit }}</div>
                  <div class="day-indicator"></div>
                </div>
              }
            </div>
          </mat-card>

          <!-- Quick Actions -->
          <mat-card appearance="outlined" class="actions-card">
            <h3>
              <mat-icon>bolt</mat-icon>
              ทางลัด
            </h3>
            <div class="quick-actions">
              <button mat-stroked-button (click)="onFindNextSlot.emit()">
                <mat-icon>search</mat-icon>
                หา Slot ว่างถัดไป
              </button>
              <button mat-stroked-button (click)="onOpenCalendar.emit()">
                <mat-icon>calendar_month</mat-icon>
                เปิดปฏิทิน
              </button>
              <button mat-stroked-button (click)="onSearchPatient.emit()">
                <mat-icon>person_search</mat-icon>
                ค้นหาคนไข้
              </button>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .today-view {
        padding: 1.5rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      /* Header */
      .today-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
      }

      .header-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .header-room,
      .header-doctor {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--ax-text-secondary);

        mat-icon {
          font-size: 1.25rem;
          width: 1.25rem;
          height: 1.25rem;
        }
      }

      .header-room {
        font-weight: 600;
        color: var(--ax-text-primary);
      }

      /* Date Navigation */
      .date-navigation {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        position: relative;
      }

      .date-display {
        text-align: center;
        cursor: pointer;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        transition: background 0.2s;
        min-width: 180px;

        &:hover {
          background: var(--ax-surface-hover);
        }

        h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--ax-text-primary);
        }

        p {
          margin: 0.125rem 0 0;
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }
      }

      .today-btn {
        margin-left: 0.5rem;
      }

      /* Summary Section */
      .summary-section {
        display: grid;
        grid-template-columns: 2fr repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;

        @media (max-width: 1200px) {
          grid-template-columns: repeat(3, 1fr);
        }

        @media (max-width: 768px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .summary-card {
        padding: 1rem;
        text-align: center;

        &.main {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;

          @media (max-width: 1200px) {
            grid-column: span 3;
          }

          @media (max-width: 768px) {
            grid-column: span 2;
          }
        }

        .summary-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--ax-primary-subtle);
          display: flex;
          align-items: center;
          justify-content: center;

          mat-icon {
            font-size: 1.5rem;
            color: var(--ax-primary-default);
          }
        }

        .summary-content {
          flex: 1;
        }

        .summary-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--ax-text-primary);

          .limit {
            font-size: 1rem;
            font-weight: 400;
            color: var(--ax-text-secondary);
          }

          &.arrived {
            color: #0ea5e9;
          }
          &.waiting {
            color: #f59e0b;
          }
          &.in-progress {
            color: #8b5cf6;
          }
          &.completed {
            color: #10b981;
          }
        }

        .summary-label {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
          margin-top: 0.25rem;
        }

        .availability-indicator {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;

          &.available {
            background: #d1fae5;
            color: #059669;
          }
          &.filling {
            background: #fef3c7;
            color: #d97706;
          }
          &.almost-full {
            background: #fee2e2;
            color: #dc2626;
          }
          &.full {
            background: #f3f4f6;
            color: #6b7280;
          }
        }
      }

      /* Main Content */
      .main-content {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;

        @media (max-width: 1024px) {
          grid-template-columns: 1fr;
        }
      }

      /* Schedule Card */
      .schedule-card {
        padding: 1rem;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;

          mat-icon {
            color: var(--ax-primary-default);
          }
        }
      }

      .schedule-list {
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 400px);
        overflow-y: auto;
      }

      .slot-item {
        display: flex;
        align-items: stretch;
        border-bottom: 1px solid var(--ax-border-subtle);

        &:last-child {
          border-bottom: none;
        }

        &.current {
          background: var(--ax-primary-subtle);
        }

        &.past {
          opacity: 0.6;
        }
      }

      .slot-time {
        width: 60px;
        padding: 0.75rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ax-text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 2px solid var(--ax-border-subtle);

        .current & {
          color: var(--ax-primary-default);
          border-right-color: var(--ax-primary-default);
        }
      }

      .slot-content {
        flex: 1;
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: var(--ax-surface-hover);
        }

        &.available {
          .available-text {
            color: var(--ax-text-disabled);
          }

          .book-btn {
            opacity: 0;
            transition: opacity 0.2s;
          }

          &:hover .book-btn {
            opacity: 1;
          }
        }
      }

      .patient-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;

        .patient-name {
          font-weight: 500;
        }

        .patient-hn {
          font-size: 0.75rem;
          color: var(--ax-text-secondary);
        }
      }

      .slot-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* Week Section */
      .week-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .week-card {
        padding: 1rem;
      }

      .week-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.5rem;

        @media (max-width: 1024px) {
          grid-template-columns: repeat(7, 1fr);
        }
      }

      .week-day {
        padding: 0.75rem 0.5rem;
        text-align: center;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;

        &:hover {
          background: var(--ax-surface-hover);
        }

        &.today {
          .day-number {
            background: var(--ax-primary-default);
            color: white;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0.25rem auto;
          }
        }

        &.selected {
          background: var(--ax-primary-subtle);
          border: 2px solid var(--ax-primary-default);
        }

        .day-name {
          font-size: 0.75rem;
          color: var(--ax-text-secondary);
          margin-bottom: 0.25rem;
        }

        .day-number {
          font-size: 1rem;
          font-weight: 600;
        }

        .day-slots {
          font-size: 0.7rem;
          color: var(--ax-text-secondary);
          margin-top: 0.25rem;
        }

        .day-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin: 0.5rem auto 0;
        }

        &.available .day-indicator {
          background: #10b981;
        }
        &.filling .day-indicator {
          background: #f59e0b;
        }
        &.almost-full .day-indicator {
          background: #ef4444;
        }
        &.full .day-indicator {
          background: #6b7280;
        }
      }

      /* Actions Card */
      .actions-card {
        padding: 1rem;

        h3 {
          margin: 0 0 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;

          mat-icon {
            font-size: 1.25rem;
            color: var(--ax-primary-default);
          }
        }
      }

      .quick-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        button {
          justify-content: flex-start;
        }
      }

      /* Status Chips */
      .status-scheduled {
        --mdc-chip-label-text-color: #6366f1;
        background: #eef2ff !important;
      }
      .status-confirmed {
        --mdc-chip-label-text-color: #0ea5e9;
        background: #e0f2fe !important;
      }
      .status-checked-in {
        --mdc-chip-label-text-color: #f59e0b;
        background: #fef3c7 !important;
      }
      .status-in-progress {
        --mdc-chip-label-text-color: #8b5cf6;
        background: #f3e8ff !important;
      }
      .status-completed {
        --mdc-chip-label-text-color: #10b981;
        background: #d1fae5 !important;
      }
      .status-cancelled {
        --mdc-chip-label-text-color: #6b7280;
        background: #f3f4f6 !important;
      }
      .status-no-show {
        --mdc-chip-label-text-color: #ef4444;
        background: #fee2e2 !important;
      }
    `,
  ],
})
export class TodayViewComponent {
  @Input() appointments: AppointmentView[] = [];
  @Input() timeSlots: TimeSlot[] = [];
  @Input() selectedRoom!: Signal<ExaminationRoom | undefined>;
  @Input() selectedDoctor!: Signal<Doctor | undefined>;
  @Input() doctorLimit = 50; // Default limit per doctor

  @Output() onViewAppointment = new EventEmitter<AppointmentView>();
  @Output() onChangeStatus = new EventEmitter<{
    apt: AppointmentView;
    status: AppointmentStatus;
  }>();
  @Output() onBookSlot = new EventEmitter<TimeSlot>();
  @Output() onQuickBook = new EventEmitter<void>();
  @Output() onOpenCalendar = new EventEmitter<void>();
  @Output() onSelectDate = new EventEmitter<Date>();
  @Output() onFindNextSlot = new EventEmitter<void>();
  @Output() onSearchPatient = new EventEmitter<void>();
  @Output() onFollowUp = new EventEmitter<AppointmentView>();

  // Selected date (can navigate)
  selectedDate = signal(new Date());

  // Date navigation methods
  prevDay(): void {
    const current = this.selectedDate();
    const newDate = new Date(current);
    newDate.setDate(current.getDate() - 1);
    this.selectedDate.set(newDate);
  }

  nextDay(): void {
    const current = this.selectedDate();
    const newDate = new Date(current);
    newDate.setDate(current.getDate() + 1);
    this.selectedDate.set(newDate);
  }

  goToToday(): void {
    this.selectedDate.set(new Date());
  }

  isToday(): boolean {
    const selected = this.selectedDate();
    const today = new Date();
    return this.isSameDay(selected, today);
  }

  onDateChange(event: { value: Date }): void {
    if (event.value) {
      this.selectedDate.set(event.value);
    }
  }

  onDayClick(date: Date): void {
    this.selectedDate.set(date);
    this.onSelectDate.emit(date);
  }

  readonly summary = computed<TodaySummary>(() => {
    const todayApts = this.getTodayAppointments();
    return {
      total: todayApts.length,
      limit: this.doctorLimit,
      arrived: todayApts.filter((a) => a.status === 'checked-in').length,
      waiting: todayApts.filter((a) => a.status === 'checked-in').length, // Same as arrived but waiting
      inProgress: todayApts.filter((a) => a.status === 'in-progress').length,
      completed: todayApts.filter((a) => a.status === 'completed').length,
      noShow: todayApts.filter((a) => a.status === 'no-show').length,
    };
  });

  readonly todaySlots = computed<TimeSlotView[]>(() => {
    const todayApts = this.getTodayAppointments();
    const now = new Date();
    const selected = this.selectedDate();
    const isSelectedToday = this.isSameDay(selected, now);

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return this.timeSlots.map((slot) => {
      const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
      const appointment = todayApts.find((a) => a.timeSlotId === slot.id);

      // Only mark as past/current if viewing today
      const isPast =
        isSelectedToday &&
        (slotHour < currentHour ||
          (slotHour === currentHour && slotMinute < currentMinute));
      const isCurrent =
        isSelectedToday &&
        slotHour === currentHour &&
        Math.abs(slotMinute - currentMinute) < 30;

      return {
        slot,
        appointment,
        isAvailable: !appointment,
        isPast,
        isCurrent,
      };
    });
  });

  readonly weekDays = computed<WeekDay[]>(() => {
    const days: WeekDay[] = [];
    const today = new Date();
    const selected = this.selectedDate();
    const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

    // Get start of week based on selected date (Sunday)
    const startOfWeek = new Date(selected);
    startOfWeek.setDate(selected.getDate() - selected.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const dayApts = this.getAppointmentsForDate(date);
      const booked = dayApts.length;
      const limit = this.doctorLimit;
      const availablePercent = ((limit - booked) / limit) * 100;

      let availability: WeekDay['availability'] = 'available';
      if (availablePercent <= 0) availability = 'full';
      else if (availablePercent <= 25) availability = 'almost-full';
      else if (availablePercent <= 50) availability = 'filling';

      days.push({
        date,
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        booked,
        limit,
        isToday: this.isSameDay(date, today),
        isSelected: this.isSameDay(date, selected),
        availability,
      });
    }

    return days;
  });

  private getTodayAppointments(): AppointmentView[] {
    const selected = this.selectedDate();
    return this.appointments.filter(
      (apt) =>
        this.isSameDay(new Date(apt.date), selected) &&
        apt.status !== 'cancelled',
    );
  }

  private getAppointmentsForDate(date: Date): AppointmentView[] {
    return this.appointments.filter(
      (apt) =>
        this.isSameDay(new Date(apt.date), date) && apt.status !== 'cancelled',
    );
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  getStatusLabel(status: AppointmentStatus): string {
    return APPOINTMENT_STATUS_LABELS[status] || status;
  }

  getAvailabilityClass(summary: TodaySummary): string {
    const availablePercent =
      ((summary.limit - summary.total) / summary.limit) * 100;
    if (availablePercent <= 0) return 'full';
    if (availablePercent <= 25) return 'almost-full';
    if (availablePercent <= 50) return 'filling';
    return 'available';
  }
}
