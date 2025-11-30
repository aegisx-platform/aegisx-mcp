import {
  Component,
  signal,
  computed,
  OnInit,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';

// AegisX Calendar
import {
  AxCalendarComponent,
  AxDateSelectEvent,
  AxEventClickEvent,
  AxCalendarDateRange,
} from '@aegisx/ui';

// Models & Service
import {
  Appointment,
  AppointmentView,
  AppointmentCalendarEvent,
  AppointmentSummary,
  ExaminationRoom,
  Doctor,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  AppointmentStatus,
  SummaryEventProps,
} from './models/appointment.models';
import { AppointmentDemoService } from './services/appointment-demo.service';

// Sub-components
import { AppointmentFormComponent } from './components/appointment-form/appointment-form.component';
import { AppointmentListComponent } from './components/appointment-list/appointment-list.component';
import { TodayViewComponent } from './components/today-view/today-view.component';
import { Router } from '@angular/router';

/**
 * Hospital Appointment Calendar Demo Page
 * หน้าระบบนัดหมายคนไข้ในโรงพยาบาล
 */
@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Material
    MatCardModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDialogModule,
    // AegisX
    AxCalendarComponent,
    // Sub-components
    AppointmentFormComponent,
    AppointmentListComponent,
    TodayViewComponent,
  ],
  providers: [AppointmentDemoService],
  template: `
    <div class="appointment-calendar-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-title">
          <mat-icon>calendar_month</mat-icon>
          <h1>ระบบนัดหมายคนไข้</h1>
        </div>
        <div class="header-actions">
          <button
            mat-flat-button
            color="primary"
            (click)="openNewAppointment()"
          >
            <mat-icon>add</mat-icon>
            นัดหมายใหม่
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <mat-tab-group
        [(selectedIndex)]="selectedTabIndex"
        class="appointment-tabs"
      >
        <!-- Tab 1: Today View (Main) -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>today</mat-icon>
            <span>วันนี้</span>
          </ng-template>

          <app-today-view
            [appointments]="service.appointmentViews()"
            [timeSlots]="service.timeSlots()"
            [selectedRoom]="selectedRoomSignal"
            [selectedDoctor]="selectedDoctorSignal"
            [doctorLimit]="50"
            (onViewAppointment)="onViewAppointment($event)"
            (onChangeStatus)="onChangeStatus($event)"
            (onBookSlot)="onBookSlot($event)"
            (onQuickBook)="openNewAppointment()"
            (onOpenCalendar)="selectedTabIndex = 1"
            (onSelectDate)="onSelectDateFromWeek($event)"
            (onFindNextSlot)="onFindNextSlot()"
            (onSearchPatient)="onSearchPatientDialog()"
            (onFollowUp)="onFollowUp($event)"
          ></app-today-view>
        </mat-tab>

        <!-- Tab 2: Calendar View -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>calendar_month</mat-icon>
            <span>ปฏิทิน</span>
          </ng-template>

          <div class="tab-content calendar-tab">
            <!-- Summary Cards -->
            <div class="summary-cards">
              <mat-card appearance="outlined" class="summary-card">
                <div class="summary-title">นัดหมายวันนี้</div>
                <div class="summary-value">{{ todaySummary().total }}</div>
              </mat-card>
              <mat-card appearance="outlined" class="summary-card">
                <div class="summary-title">ยืนยันแล้ว</div>
                <div class="summary-value">
                  {{ todaySummary().byStatus['confirmed'] || 0 }}
                </div>
              </mat-card>
              <mat-card appearance="outlined" class="summary-card">
                <div class="summary-title">มาถึงแล้ว</div>
                <div class="summary-value">
                  {{ todaySummary().byStatus['checked-in'] || 0 }}
                </div>
              </mat-card>
              <mat-card appearance="outlined" class="summary-card">
                <div class="summary-title">เสร็จสิ้น</div>
                <div class="summary-value">
                  {{ todaySummary().byStatus['completed'] || 0 }}
                </div>
              </mat-card>
            </div>

            <!-- Split Screen Layout -->
            <div class="split-layout">
              <!-- Left Panel: Calendar -->
              <div class="left-panel">
                <!-- Filters -->
                <mat-card appearance="outlined" class="filters-card">
                  <div class="filters-row">
                    <mat-form-field appearance="outline" class="filter-field">
                      <mat-label>ห้องตรวจ</mat-label>
                      <mat-select
                        [(value)]="selectedRoomId"
                        (selectionChange)="onFilterChange()"
                      >
                        <mat-option value="">ทุกห้อง</mat-option>
                        @for (room of rooms(); track room.id) {
                          <mat-option [value]="room.id">
                            <span
                              class="room-color-dot"
                              [style.backgroundColor]="room.color"
                            ></span>
                            {{ room.name }}
                          </mat-option>
                        }
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="filter-field">
                      <mat-label>แพทย์</mat-label>
                      <mat-select
                        [(value)]="selectedDoctorId"
                        (selectionChange)="onFilterChange()"
                      >
                        <mat-option value="">ทุกแพทย์</mat-option>
                        @for (doctor of filteredDoctors(); track doctor.id) {
                          <mat-option [value]="doctor.id">
                            {{ doctor.name }}
                          </mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </div>
                </mat-card>

                <!-- Calendar -->
                <mat-card appearance="outlined" class="calendar-card">
                  <ax-calendar
                    #calendar
                    [events]="calendarEvents()"
                    [initialView]="'dayGridMonth'"
                    [editable]="false"
                    [selectable]="true"
                    [locale]="'th'"
                    [firstDay]="0"
                    [headerToolbar]="calendarToolbar"
                    (eventClick)="onEventClick($event)"
                    (dateSelect)="onDateSelect($event)"
                    (datesChange)="onDatesChange($event)"
                  ></ax-calendar>
                </mat-card>
              </div>

              <!-- Right Panel: Day Detail / Form -->
              <div class="right-panel">
                @if (showForm()) {
                  <app-appointment-form
                    [mode]="formMode()"
                    [appointment]="selectedAppointment()"
                    [preSelectedDate]="preSelectedDate()"
                    [rooms]="rooms()"
                    [doctors]="filteredDoctors()"
                    [timeSlots]="service.timeSlots()"
                    [purposes]="service.purposes()"
                    [preparations]="service.preparations()"
                    (save)="onSaveAppointment($event)"
                    (cancel)="onCancelForm()"
                    (searchPatient)="onSearchPatient($event)"
                  ></app-appointment-form>
                } @else if (showDayDetail()) {
                  <!-- Day Detail Panel -->
                  <mat-card appearance="outlined" class="day-detail-panel">
                    <div class="day-detail-header">
                      <div class="day-detail-title">
                        <mat-icon>calendar_today</mat-icon>
                        <h3>
                          {{
                            selectedDayDate()
                              | date: 'EEEE d MMMM yyyy' : '' : 'th'
                          }}
                        </h3>
                      </div>
                      <button mat-icon-button (click)="onCloseDayDetail()">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>

                    @if (selectedDaySummary(); as summary) {
                      <!-- Summary Stats -->
                      <div class="day-summary-stats">
                        <div class="stat-item total">
                          <span class="stat-value">{{ summary.total }}</span>
                          <span class="stat-label">นัดหมายทั้งหมด</span>
                        </div>
                        <div class="stat-item confirmed">
                          <span class="stat-value">{{
                            summary.confirmed
                          }}</span>
                          <span class="stat-label">ยืนยันแล้ว</span>
                        </div>
                        <div class="stat-item scheduled">
                          <span class="stat-value">{{
                            summary.scheduled
                          }}</span>
                          <span class="stat-label">รอยืนยัน</span>
                        </div>
                        <div class="stat-item completed">
                          <span class="stat-value">{{
                            summary.completed
                          }}</span>
                          <span class="stat-label">เสร็จสิ้น</span>
                        </div>
                      </div>

                      <!-- Capacity Bar -->
                      <div class="capacity-section">
                        <div class="capacity-label">
                          <span>อัตราการใช้งาน</span>
                          <span class="capacity-percent"
                            >{{ summary.capacityPercent }}%</span
                          >
                        </div>
                        <div class="capacity-bar">
                          <div
                            class="capacity-fill"
                            [style.width.%]="summary.capacityPercent"
                            [class.low]="summary.capacityPercent < 50"
                            [class.medium]="
                              summary.capacityPercent >= 50 &&
                              summary.capacityPercent < 70
                            "
                            [class.high]="
                              summary.capacityPercent >= 70 &&
                              summary.capacityPercent < 90
                            "
                            [class.critical]="summary.capacityPercent >= 90"
                          ></div>
                        </div>
                      </div>

                      <!-- Room Breakdown -->
                      <div class="room-breakdown">
                        <h4>จำนวนตามห้องตรวจ</h4>
                        <div class="room-list">
                          @for (
                            room of filteredRoomsForDetail();
                            track room.id
                          ) {
                            <div class="room-item">
                              <span
                                class="room-dot"
                                [style.backgroundColor]="room.color"
                              ></span>
                              <span class="room-name">{{ room.name }}</span>
                              <span class="room-count">{{
                                summary.byRoom[room.id] || 0
                              }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    }

                    <!-- Appointment List -->
                    <div class="day-appointments">
                      <div class="appointments-header">
                        <h4>
                          รายการนัดหมาย ({{ selectedDayAppointments().length }})
                        </h4>
                        <button
                          mat-mini-fab
                          color="primary"
                          (click)="onCreateAppointmentFromDay()"
                          matTooltip="เพิ่มนัดหมาย"
                        >
                          <mat-icon>add</mat-icon>
                        </button>
                      </div>

                      @if (selectedDayAppointments().length > 0) {
                        <div class="appointments-list">
                          @for (
                            apt of selectedDayAppointments().slice(0, 3);
                            track apt.id
                          ) {
                            <div
                              class="appointment-item"
                              (click)="onViewAppointmentFromDay(apt)"
                            >
                              <div class="apt-time">
                                {{ apt.timeSlot?.startTime || '-' }}
                              </div>
                              <div class="apt-info">
                                <div class="apt-patient">
                                  {{ apt.patient?.firstName }}
                                  {{ apt.patient?.lastName }}
                                </div>
                                <div class="apt-meta">
                                  <span
                                    class="room-dot small"
                                    [style.backgroundColor]="apt.room?.color"
                                  ></span>
                                  {{ apt.room?.name }}
                                </div>
                              </div>
                              <mat-chip-set>
                                <mat-chip
                                  [class]="'status-' + apt.status"
                                  [disabled]="true"
                                >
                                  {{ getStatusLabel(apt.status) }}
                                </mat-chip>
                              </mat-chip-set>
                            </div>
                          }
                        </div>

                        @if (selectedDayAppointments().length > 3) {
                          <button
                            mat-button
                            color="primary"
                            class="view-all-btn"
                            (click)="onViewAllAppointments()"
                          >
                            ดูทั้งหมด ({{ selectedDayAppointments().length }})
                            <mat-icon>arrow_forward</mat-icon>
                          </button>
                        }
                      } @else {
                        <div class="no-appointments">
                          <mat-icon>event_available</mat-icon>
                          <p>ไม่มีนัดหมายในวันนี้</p>
                        </div>
                      }
                    </div>
                  </mat-card>
                } @else {
                  <mat-card appearance="outlined" class="empty-panel">
                    <mat-icon>event_note</mat-icon>
                    <p>คลิกที่วันในปฏิทินเพื่อดูรายการนัดหมาย</p>
                    <p>หรือคลิกปุ่ม "นัดหมายใหม่" เพื่อสร้างนัดหมาย</p>
                  </mat-card>
                }
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Tab 3: Appointment List -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>list_alt</mat-icon>
            <span>รายการนัด</span>
          </ng-template>

          <div class="tab-content list-tab">
            <app-appointment-list
              [appointments]="service.appointmentViews()"
              [rooms]="rooms()"
              [doctors]="service.doctors()"
              (viewAppointment)="onViewAppointment($event)"
              (editAppointment)="onEditAppointment($event)"
              (cancelAppointment)="onCancelAppointment($event)"
              (changeStatus)="onChangeStatus($event)"
            ></app-appointment-list>
          </div>
        </mat-tab>

        <!-- Tab 3: Slot Configuration (placeholder) -->
        <mat-tab disabled>
          <ng-template mat-tab-label>
            <mat-icon>settings</mat-icon>
            <span>ตั้งค่าช่วงเวลา</span>
          </ng-template>
        </mat-tab>

        <!-- Tab 4: Holiday Management (placeholder) -->
        <mat-tab disabled>
          <ng-template mat-tab-label>
            <mat-icon>event_busy</mat-icon>
            <span>วันหยุด/วันลา</span>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .appointment-calendar-page {
        padding: 1.5rem;
        max-width: 1600px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .header-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        mat-icon {
          font-size: 2rem;
          width: 2rem;
          height: 2rem;
          color: var(--ax-primary-default);
        }

        h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ax-text-primary);
        }
      }

      .appointment-tabs {
        ::ng-deep .mat-mdc-tab {
          min-width: 160px;
        }

        ::ng-deep .mat-mdc-tab .mdc-tab__content {
          gap: 0.5rem;
        }
      }

      .tab-content {
        min-height: calc(100vh - 250px);
      }

      /* Split Layout */
      .split-layout {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 1.5rem;
        padding: 1.5rem;

        @media (max-width: 1200px) {
          grid-template-columns: 1fr;
        }
      }

      .left-panel {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .right-panel {
        position: sticky;
        top: 1rem;
        align-self: start;

        @media (max-width: 1200px) {
          position: static;
        }
      }

      /* Filters */
      .filters-card {
        padding: 1rem;
      }

      .filters-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .filter-field {
        min-width: 200px;
        flex: 1;
      }

      .room-color-dot {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
      }

      /* Calendar Card */
      .calendar-card {
        padding: 1rem;

        ::ng-deep .fc {
          font-family: inherit;
        }

        ::ng-deep .fc-event {
          cursor: pointer;
        }
      }

      /* Summary Cards */
      .summary-cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        padding: 1.5rem 1.5rem 0;

        @media (max-width: 900px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .summary-card {
        padding: 1rem;
        text-align: center;

        .summary-title {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
          margin-bottom: 0.5rem;
        }

        .summary-value {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--ax-text-primary);
        }
      }

      /* Empty Panel */
      .empty-panel {
        padding: 3rem 1.5rem;
        text-align: center;
        color: var(--ax-text-secondary);

        mat-icon {
          font-size: 4rem;
          width: 4rem;
          height: 4rem;
          margin-bottom: 1rem;
          color: var(--ax-text-disabled);
        }

        p {
          margin: 0.5rem 0;
        }
      }

      /* List Tab */
      .list-tab {
        padding: 1.5rem;
      }

      /* Day Detail Panel */
      .day-detail-panel {
        padding: 1rem;
        max-height: calc(100vh - 200px);
        overflow-y: auto;
      }

      .day-detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--ax-border-subtle);
      }

      .day-detail-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        mat-icon {
          color: var(--ax-primary-default);
        }

        h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }
      }

      /* Day Summary Stats */
      .day-summary-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .stat-item {
        text-align: center;
        padding: 0.5rem;
        border-radius: 8px;
        background: var(--ax-surface-raised);

        .stat-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--ax-text-primary);
        }

        .stat-label {
          font-size: 0.7rem;
          color: var(--ax-text-secondary);
        }

        &.total .stat-value {
          color: var(--ax-primary-default);
        }
        &.confirmed .stat-value {
          color: #10b981;
        }
        &.scheduled .stat-value {
          color: #6366f1;
        }
        &.completed .stat-value {
          color: #3b82f6;
        }
      }

      /* Capacity Bar */
      .capacity-section {
        margin-bottom: 1rem;
      }

      .capacity-label {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;

        .capacity-percent {
          font-weight: 600;
        }
      }

      .capacity-bar {
        height: 8px;
        background: var(--ax-surface-raised);
        border-radius: 4px;
        overflow: hidden;
      }

      .capacity-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;

        &.low {
          background: #10b981;
        }
        &.medium {
          background: #3b82f6;
        }
        &.high {
          background: #f59e0b;
        }
        &.critical {
          background: #ef4444;
        }
      }

      /* Room Breakdown */
      .room-breakdown {
        margin-bottom: 1rem;

        h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          font-weight: 600;
        }
      }

      .room-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .room-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0;
        font-size: 0.875rem;

        .room-name {
          flex: 1;
          color: var(--ax-text-secondary);
        }

        .room-count {
          font-weight: 600;
          min-width: 24px;
          text-align: right;
        }
      }

      .room-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;

        &.small {
          width: 8px;
          height: 8px;
        }
      }

      /* Day Appointments */
      .day-appointments {
        border-top: 1px solid var(--ax-border-subtle);
        padding-top: 1rem;
      }

      .appointments-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;

        h4 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
        }
      }

      .appointments-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 300px;
        overflow-y: auto;
      }

      .appointment-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 8px;
        background: var(--ax-surface-raised);
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover {
          background: var(--ax-surface-hover);
        }
      }

      .apt-time {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--ax-text-secondary);
        min-width: 80px;
      }

      .apt-info {
        flex: 1;
        min-width: 0;

        .apt-patient {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .apt-meta {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--ax-text-secondary);
          margin-top: 0.125rem;
        }
      }

      .no-appointments {
        text-align: center;
        padding: 2rem 1rem;
        color: var(--ax-text-secondary);

        mat-icon {
          font-size: 2.5rem;
          width: 2.5rem;
          height: 2.5rem;
          color: var(--ax-text-disabled);
          margin-bottom: 0.5rem;
        }

        p {
          margin: 0;
          font-size: 0.875rem;
        }
      }

      .view-all-btn {
        width: 100%;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
      }

      /* Status Chips */
      .status-scheduled {
        --mdc-chip-label-text-color: #6366f1;
      }
      .status-confirmed {
        --mdc-chip-label-text-color: #10b981;
      }
      .status-checked-in {
        --mdc-chip-label-text-color: #0ea5e9;
      }
      .status-in-progress {
        --mdc-chip-label-text-color: #f59e0b;
      }
      .status-completed {
        --mdc-chip-label-text-color: #3b82f6;
      }
      .status-cancelled {
        --mdc-chip-label-text-color: #6b7280;
      }
      .status-no-show {
        --mdc-chip-label-text-color: #ef4444;
      }
    `,
  ],
})
export class AppointmentCalendarComponent implements OnInit {
  readonly service = inject(AppointmentDemoService);
  private readonly router = inject(Router);

  @ViewChild('calendar') calendarRef!: AxCalendarComponent;

  // UI State
  selectedTabIndex = 0;
  selectedRoomId = '';
  selectedDoctorId = '';

  // Form State
  showForm = signal(false);
  formMode = signal<'create' | 'edit' | 'view'>('create');
  selectedAppointment = signal<AppointmentView | undefined>(undefined);
  preSelectedDate = signal<Date | undefined>(undefined);

  // Day Detail State (for summary view)
  showDayDetail = signal(false);
  selectedDayDate = signal<string | null>(null);

  // Signals for Today View
  readonly selectedRoomSignal = computed(() => {
    if (!this.selectedRoomId) return undefined;
    return this.rooms().find((r) => r.id === this.selectedRoomId);
  });

  readonly selectedDoctorSignal = computed(() => {
    if (!this.selectedDoctorId) return undefined;
    return this.service.doctors().find((d) => d.id === this.selectedDoctorId);
  });

  // Calendar Toolbar
  calendarToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  };

  // Computed
  readonly rooms = computed(() => this.service.rooms());
  readonly todaySummary = computed(() => this.service.todaySummary());

  readonly filteredDoctors = computed(() => {
    const doctors = this.service.doctors();
    if (!this.selectedRoomId) return doctors;
    return doctors.filter((d) => d.roomIds.includes(this.selectedRoomId));
  });

  /**
   * Calendar events using summary view (1 event per day with count)
   */
  readonly calendarEvents = computed(() => {
    const summaryEvents = this.service.calendarSummaryEvents();

    // Transform to AxCalendarEvent format (cast extendedProps for compatibility)
    return summaryEvents.map((e) => ({
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end,
      allDay: e.allDay,
      color: e.color,
      backgroundColor: e.backgroundColor,
      extendedProps: e.extendedProps as unknown as Record<string, unknown>,
    }));
  });

  /**
   * Get appointments for the selected day (filtered by room/doctor)
   */
  readonly selectedDayAppointments = computed(() => {
    const dateKey = this.selectedDayDate();
    if (!dateKey) return [];

    let appointments = this.service.appointmentViews().filter((apt) => {
      const aptDate = new Date(apt.date).toISOString().split('T')[0];
      return aptDate === dateKey && apt.status !== 'cancelled';
    });

    // Filter by room
    if (this.selectedRoomId) {
      appointments = appointments.filter(
        (apt) => apt.roomId === this.selectedRoomId,
      );
    }

    // Filter by doctor
    if (this.selectedDoctorId) {
      appointments = appointments.filter(
        (apt) => apt.doctorId === this.selectedDoctorId,
      );
    }

    // Sort by time slot
    return appointments.sort((a, b) => {
      const timeA = a.timeSlot?.startTime || '00:00';
      const timeB = b.timeSlot?.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });
  });

  /**
   * Get summary for the selected day (filtered by room/doctor)
   */
  readonly selectedDaySummary = computed<SummaryEventProps | null>(() => {
    const dateKey = this.selectedDayDate();
    if (!dateKey) return null;

    // Get filtered appointments for this day
    const appointments = this.selectedDayAppointments();
    if (appointments.length === 0) {
      // Return empty summary if no appointments after filtering
      return {
        isSummary: true,
        total: 0,
        completed: 0,
        confirmed: 0,
        scheduled: 0,
        capacityPercent: 0,
        byRoom: {},
        date: dateKey,
      };
    }

    // Calculate summary from filtered appointments
    const total = appointments.length;
    const completed = appointments.filter(
      (a) => a.status === 'completed',
    ).length;
    const confirmed = appointments.filter(
      (a) => a.status === 'confirmed',
    ).length;
    const scheduled = appointments.filter(
      (a) => a.status === 'scheduled',
    ).length;

    // Count by room
    const byRoom: Record<string, number> = {};
    appointments.forEach((apt) => {
      byRoom[apt.roomId] = (byRoom[apt.roomId] || 0) + 1;
    });

    // Calculate capacity based on selected room or all rooms
    const rooms = this.selectedRoomId
      ? this.rooms().filter((r) => r.id === this.selectedRoomId)
      : this.rooms();
    const totalCapacity = rooms.length * 50; // 50 per room
    const capacityPercent =
      totalCapacity > 0
        ? Math.min(100, Math.round((total / totalCapacity) * 100))
        : 0;

    return {
      isSummary: true,
      total,
      completed,
      confirmed,
      scheduled,
      capacityPercent,
      byRoom,
      date: dateKey,
    };
  });

  /**
   * Get rooms to display in day detail (filtered if room is selected)
   */
  readonly filteredRoomsForDetail = computed(() => {
    if (this.selectedRoomId) {
      return this.rooms().filter((r) => r.id === this.selectedRoomId);
    }
    return this.rooms();
  });

  ngOnInit(): void {
    // Initialize
  }

  // ===========================================================================
  // Calendar Events
  // ===========================================================================

  onEventClick(event: AxEventClickEvent): void {
    const eventId = event.event.id;

    // Check if it's a summary event (shows day details)
    if (eventId.startsWith('summary-')) {
      const dateKey = eventId.replace('summary-', '');
      this.selectedDayDate.set(dateKey);
      this.showDayDetail.set(true);
      this.showForm.set(false);
      return;
    }

    // Otherwise it's an individual appointment
    const appointment = this.service
      .appointmentViews()
      .find((a) => a.id === eventId);
    if (appointment) {
      this.selectedAppointment.set(appointment);
      this.formMode.set('view');
      this.showForm.set(true);
      this.showDayDetail.set(false);
    }
  }

  onDateSelect(event: AxDateSelectEvent): void {
    // Show day details when clicking on a day
    const dateKey = event.start.toISOString().split('T')[0];
    this.selectedDayDate.set(dateKey);
    this.showDayDetail.set(true);
    this.showForm.set(false);
  }

  onCloseDayDetail(): void {
    this.showDayDetail.set(false);
    this.selectedDayDate.set(null);
  }

  onCreateAppointmentFromDay(): void {
    const dateKey = this.selectedDayDate();
    if (dateKey) {
      this.preSelectedDate.set(new Date(dateKey));
      this.selectedAppointment.set(undefined);
      this.formMode.set('create');
      this.showForm.set(true);
      this.showDayDetail.set(false);
    }
  }

  onViewAppointmentFromDay(apt: AppointmentView): void {
    this.selectedAppointment.set(apt);
    this.formMode.set('view');
    this.showForm.set(true);
    this.showDayDetail.set(false);
  }

  onViewAllAppointments(): void {
    // Switch to list tab to show all appointments
    this.selectedTabIndex = 2; // Now list is tab 2
    this.showDayDetail.set(false);
  }

  // ===========================================================================
  // Today View Actions
  // ===========================================================================

  onBookSlot(slot: { id: string; startTime: string; endTime: string }): void {
    // Open form to book this specific slot
    this.preSelectedDate.set(new Date());
    this.selectedAppointment.set(undefined);
    this.formMode.set('create');
    this.showForm.set(true);
    this.selectedTabIndex = 1; // Go to calendar tab to show form
  }

  onSelectDateFromWeek(date: Date): void {
    // Navigate to calendar and select this date
    this.selectedTabIndex = 1;
    this.selectedDayDate.set(date.toISOString().split('T')[0]);
    this.showDayDetail.set(true);
    this.showForm.set(false);
  }

  onFindNextSlot(): void {
    // Find next available slot
    const today = new Date();
    const slots = this.service.timeSlots();
    const appointments = this.service.appointmentViews();

    // Simple logic: find first available slot in next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + dayOffset);

      for (const slot of slots) {
        const isBooked = appointments.some((apt) => {
          const aptDate = new Date(apt.date);
          return (
            this.isSameDay(aptDate, checkDate) &&
            apt.timeSlotId === slot.id &&
            apt.status !== 'cancelled' &&
            (!this.selectedRoomId || apt.roomId === this.selectedRoomId) &&
            (!this.selectedDoctorId || apt.doctorId === this.selectedDoctorId)
          );
        });

        if (!isBooked) {
          // Found available slot - navigate to it
          this.selectedTabIndex = 1;
          this.selectedDayDate.set(checkDate.toISOString().split('T')[0]);
          this.showDayDetail.set(true);
          this.showForm.set(false);
          return;
        }
      }
    }

    // No slot found in next 7 days
    console.log('No available slot found in next 7 days');
  }

  onSearchPatientDialog(): void {
    // TODO: Open patient search dialog
    console.log('Open patient search dialog');
  }

  /**
   * Navigate to Follow-up Booking Page
   * นำทางไปหน้านัด follow-up แบบ embedded component
   */
  onFollowUp(apt: AppointmentView): void {
    // Navigate to followup-demo page
    // In real app, would pass patient info via state or route params
    this.router.navigate(['/his-demo/followup-demo']);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  onDatesChange(range: AxCalendarDateRange): void {
    // Could fetch data for the new date range if using API
    console.log('Calendar date range changed:', range);
  }

  onFilterChange(): void {
    // Reset doctor if room changed and doctor not in new room
    if (this.selectedRoomId && this.selectedDoctorId) {
      const doctor = this.service.getDoctor(this.selectedDoctorId);
      if (doctor && !doctor.roomIds.includes(this.selectedRoomId)) {
        this.selectedDoctorId = '';
      }
    }
  }

  // ===========================================================================
  // Form Actions
  // ===========================================================================

  openNewAppointment(): void {
    this.preSelectedDate.set(new Date());
    this.selectedAppointment.set(undefined);
    this.formMode.set('create');
    this.showForm.set(true);
  }

  onCancelForm(): void {
    this.showForm.set(false);
    this.selectedAppointment.set(undefined);
    this.preSelectedDate.set(undefined);
  }

  onSaveAppointment(data: Partial<Appointment>): void {
    if (this.formMode() === 'create') {
      this.service.createAppointment(
        data as Omit<
          Appointment,
          'id' | 'appointmentNumber' | 'createdAt' | 'createdBy'
        >,
      );
    } else if (this.formMode() === 'edit' && this.selectedAppointment()) {
      this.service.updateAppointment(this.selectedAppointment()!.id, data);
    }
    this.onCancelForm();
  }

  onSearchPatient(query: string): void {
    // Search patients in service
    const results = this.service.searchPatients(query);
    console.log('Patient search results:', results);
  }

  // ===========================================================================
  // List Actions
  // ===========================================================================

  onViewAppointment(apt: AppointmentView): void {
    this.selectedAppointment.set(apt);
    this.formMode.set('view');
    this.showForm.set(true);
    this.selectedTabIndex = 0; // Switch to calendar tab
  }

  onEditAppointment(apt: AppointmentView): void {
    this.selectedAppointment.set(apt);
    this.formMode.set('edit');
    this.showForm.set(true);
    this.selectedTabIndex = 0; // Switch to calendar tab
  }

  onCancelAppointment(apt: AppointmentView): void {
    // Could show confirmation dialog
    this.service.cancelAppointment(apt.id, 'ยกเลิกโดยผู้ใช้');
  }

  onChangeStatus(event: {
    apt: AppointmentView;
    status: AppointmentStatus;
  }): void {
    this.service.changeStatus(event.apt.id, event.status);
  }

  getStatusLabel(status: AppointmentStatus): string {
    return APPOINTMENT_STATUS_LABELS[status] || status;
  }
}
