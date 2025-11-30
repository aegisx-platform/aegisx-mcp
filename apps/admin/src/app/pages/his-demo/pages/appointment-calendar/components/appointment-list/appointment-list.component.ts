import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Models
import {
  AppointmentView,
  AppointmentStatus,
  ExaminationRoom,
  Doctor,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from '../../models/appointment.models';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <mat-card appearance="outlined" class="appointment-list-card">
      <!-- Filters -->
      <div class="filters-section">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>ค้นหา (HN, CID, ชื่อ)</mat-label>
          <input
            matInput
            [(ngModel)]="searchText"
            (input)="applyFilters()"
            placeholder="พิมพ์เพื่อค้นหา..."
          />
          <mat-icon matPrefix>search</mat-icon>
          @if (searchText) {
            <button mat-icon-button matSuffix (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field date-field">
          <mat-label>จากวันที่</mat-label>
          <input
            matInput
            [matDatepicker]="fromPicker"
            [(ngModel)]="dateFrom"
            (dateChange)="applyFilters()"
          />
          <mat-datepicker-toggle
            matIconSuffix
            [for]="fromPicker"
          ></mat-datepicker-toggle>
          <mat-datepicker #fromPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field date-field">
          <mat-label>ถึงวันที่</mat-label>
          <input
            matInput
            [matDatepicker]="toPicker"
            [(ngModel)]="dateTo"
            (dateChange)="applyFilters()"
          />
          <mat-datepicker-toggle
            matIconSuffix
            [for]="toPicker"
          ></mat-datepicker-toggle>
          <mat-datepicker #toPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>ห้องตรวจ</mat-label>
          <mat-select
            [(value)]="selectedRoomId"
            (selectionChange)="applyFilters()"
          >
            <mat-option value="">ทุกห้อง</mat-option>
            @for (room of rooms; track room.id) {
              <mat-option [value]="room.id">{{ room.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>สถานะ</mat-label>
          <mat-select
            [(value)]="selectedStatuses"
            multiple
            (selectionChange)="applyFilters()"
          >
            @for (status of allStatuses; track status) {
              <mat-option [value]="status">
                {{ statusLabels[status] }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <button mat-stroked-button (click)="clearFilters()">
          <mat-icon>filter_alt_off</mat-icon>
          ล้างตัวกรอง
        </button>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table
          mat-table
          [dataSource]="dataSource"
          matSort
          class="appointment-table"
        >
          <!-- Appointment Number -->
          <ng-container matColumnDef="appointmentNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>เลขที่นัด</th>
            <td mat-cell *matCellDef="let apt">{{ apt.appointmentNumber }}</td>
          </ng-container>

          <!-- Date -->
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>วันที่</th>
            <td mat-cell *matCellDef="let apt">
              {{ apt.date | date: 'dd/MM/yyyy' }}
            </td>
          </ng-container>

          <!-- Time -->
          <ng-container matColumnDef="time">
            <th mat-header-cell *matHeaderCellDef>เวลา</th>
            <td mat-cell *matCellDef="let apt">
              {{ apt.timeSlot?.label || '-' }}
            </td>
          </ng-container>

          <!-- Patient -->
          <ng-container matColumnDef="patient">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>คนไข้</th>
            <td mat-cell *matCellDef="let apt">
              <div class="patient-cell">
                <span class="patient-hn">{{ apt.patient?.hn }}</span>
                <span class="patient-name">
                  {{ apt.patient?.firstName }} {{ apt.patient?.lastName }}
                </span>
              </div>
            </td>
          </ng-container>

          <!-- Room -->
          <ng-container matColumnDef="room">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ห้องตรวจ</th>
            <td mat-cell *matCellDef="let apt">
              <span
                class="room-badge"
                [style.backgroundColor]="apt.room?.color + '20'"
                [style.color]="apt.room?.color"
              >
                {{ apt.room?.name || '-' }}
              </span>
            </td>
          </ng-container>

          <!-- Doctor -->
          <ng-container matColumnDef="doctor">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>แพทย์</th>
            <td mat-cell *matCellDef="let apt">
              {{ apt.doctor?.name || '-' }}
            </td>
          </ng-container>

          <!-- Purpose -->
          <ng-container matColumnDef="purpose">
            <th mat-header-cell *matHeaderCellDef>นัดมาเพื่อ</th>
            <td mat-cell *matCellDef="let apt">
              {{ apt.purpose?.name || '-' }}
            </td>
          </ng-container>

          <!-- Status -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>สถานะ</th>
            <td mat-cell *matCellDef="let apt">
              <span class="status-chip" [class]="'status-' + apt.status">
                {{ getStatusLabel(apt.status) }}
              </span>
            </td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>จัดการ</th>
            <td mat-cell *matCellDef="let apt">
              <button
                mat-icon-button
                matTooltip="ดูรายละเอียด"
                (click)="viewAppointment.emit(apt)"
              >
                <mat-icon>visibility</mat-icon>
              </button>

              @if (apt.status !== 'cancelled' && apt.status !== 'completed') {
                <button
                  mat-icon-button
                  matTooltip="แก้ไข"
                  (click)="editAppointment.emit(apt)"
                >
                  <mat-icon>edit</mat-icon>
                </button>

                <button mat-icon-button [matMenuTriggerFor]="statusMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>

                <mat-menu #statusMenu="matMenu">
                  <button
                    mat-menu-item
                    (click)="onChangeStatus(apt, 'confirmed')"
                  >
                    <mat-icon>check_circle</mat-icon>
                    ยืนยันนัด
                  </button>
                  <button
                    mat-menu-item
                    (click)="onChangeStatus(apt, 'checked-in')"
                  >
                    <mat-icon>login</mat-icon>
                    ลงทะเบียนมาถึง
                  </button>
                  <button
                    mat-menu-item
                    (click)="onChangeStatus(apt, 'in-progress')"
                  >
                    <mat-icon>play_arrow</mat-icon>
                    เริ่มตรวจ
                  </button>
                  <button
                    mat-menu-item
                    (click)="onChangeStatus(apt, 'completed')"
                  >
                    <mat-icon>done_all</mat-icon>
                    เสร็จสิ้น
                  </button>
                  <mat-divider></mat-divider>
                  <button
                    mat-menu-item
                    class="cancel-item"
                    (click)="cancelAppointment.emit(apt)"
                  >
                    <mat-icon>cancel</mat-icon>
                    ยกเลิกนัด
                  </button>
                </mat-menu>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

          <!-- No Data Row -->
          <tr class="mat-row" *matNoDataRow>
            <td
              class="mat-cell no-data"
              [attr.colspan]="displayedColumns.length"
            >
              <mat-icon>inbox</mat-icon>
              <span>ไม่พบข้อมูลนัดหมาย</span>
            </td>
          </tr>
        </table>
      </div>

      <mat-paginator
        [pageSizeOptions]="[10, 25, 50, 100]"
        [pageSize]="25"
        showFirstLastButtons
      ></mat-paginator>
    </mat-card>
  `,
  styles: [
    `
      .appointment-list-card {
        padding: 0;
      }

      .filters-section {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 1rem;
        background: var(--ax-background-subtle);
        border-bottom: 1px solid var(--ax-border-default);
      }

      .filter-field {
        min-width: 200px;

        &.date-field {
          min-width: 150px;
        }
      }

      .table-container {
        overflow-x: auto;
      }

      .appointment-table {
        width: 100%;

        th.mat-header-cell {
          background: var(--ax-background-subtle);
          font-weight: 600;
          color: var(--ax-text-secondary);
        }

        td.mat-cell {
          padding: 0.75rem 1rem;
        }
      }

      .patient-cell {
        display: flex;
        flex-direction: column;

        .patient-hn {
          font-weight: 600;
          color: var(--ax-primary-default);
          font-size: 0.75rem;
        }

        .patient-name {
          font-size: 0.875rem;
        }
      }

      .room-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
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

      .no-data {
        text-align: center;
        padding: 3rem !important;
        color: var(--ax-text-secondary);

        mat-icon {
          font-size: 3rem;
          width: 3rem;
          height: 3rem;
          margin-bottom: 0.5rem;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
      }

      .cancel-item {
        color: var(--ax-error-default);
      }

      mat-paginator {
        border-top: 1px solid var(--ax-border-default);
      }
    `,
  ],
})
export class AppointmentListComponent implements OnInit {
  @Input() appointments: AppointmentView[] = [];
  @Input() rooms: ExaminationRoom[] = [];
  @Input() doctors: Doctor[] = [];

  @Output() viewAppointment = new EventEmitter<AppointmentView>();
  @Output() editAppointment = new EventEmitter<AppointmentView>();
  @Output() cancelAppointment = new EventEmitter<AppointmentView>();
  @Output() changeStatus = new EventEmitter<{
    apt: AppointmentView;
    status: AppointmentStatus;
  }>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<AppointmentView>([]);

  displayedColumns = [
    'appointmentNumber',
    'date',
    'time',
    'patient',
    'room',
    'doctor',
    'purpose',
    'status',
    'actions',
  ];

  allStatuses: AppointmentStatus[] = [
    'scheduled',
    'confirmed',
    'checked-in',
    'in-progress',
    'completed',
    'cancelled',
    'no-show',
  ];

  statusLabels = APPOINTMENT_STATUS_LABELS;

  // Filter state
  searchText = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  selectedRoomId = '';
  selectedStatuses: AppointmentStatus[] = [];

  ngOnInit(): void {
    this.dataSource.data = this.appointments;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter predicate
    this.dataSource.filterPredicate = (
      data: AppointmentView,
      filter: string,
    ) => {
      const searchLower = filter.toLowerCase();
      return (
        data.appointmentNumber.toLowerCase().includes(searchLower) ||
        data.patient?.hn.toLowerCase().includes(searchLower) ||
        data.patient?.cid.includes(filter) ||
        data.patient?.firstName.toLowerCase().includes(searchLower) ||
        data.patient?.lastName.toLowerCase().includes(searchLower) ||
        false
      );
    };
  }

  getStatusLabel(status: AppointmentStatus): string {
    return this.statusLabels[status] || status;
  }

  ngOnChanges(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.appointments];

    // Text search
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.appointmentNumber.toLowerCase().includes(search) ||
          apt.patient?.hn.toLowerCase().includes(search) ||
          apt.patient?.cid.includes(this.searchText) ||
          apt.patient?.firstName.toLowerCase().includes(search) ||
          apt.patient?.lastName.toLowerCase().includes(search),
      );
    }

    // Date range
    if (this.dateFrom) {
      const from = new Date(this.dateFrom);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter((apt) => new Date(apt.date) >= from);
    }

    if (this.dateTo) {
      const to = new Date(this.dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((apt) => new Date(apt.date) <= to);
    }

    // Room filter
    if (this.selectedRoomId) {
      filtered = filtered.filter((apt) => apt.roomId === this.selectedRoomId);
    }

    // Status filter
    if (this.selectedStatuses.length > 0) {
      filtered = filtered.filter((apt) =>
        this.selectedStatuses.includes(apt.status),
      );
    }

    this.dataSource.data = filtered;
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.dateFrom = null;
    this.dateTo = null;
    this.selectedRoomId = '';
    this.selectedStatuses = [];
    this.applyFilters();
  }

  onChangeStatus(apt: AppointmentView, status: AppointmentStatus): void {
    this.changeStatus.emit({ apt, status });
  }
}
