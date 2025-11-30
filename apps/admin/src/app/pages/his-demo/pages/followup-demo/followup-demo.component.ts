import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { FollowupBookingComponent } from '../appointment-calendar/components/followup-booking';
import { AppointmentDemoService } from '../appointment-calendar/services/appointment-demo.service';
import {
  Patient,
  Appointment,
} from '../appointment-calendar/models/appointment.models';

/**
 * FollowupDemoComponent
 *
 * หน้า Demo สำหรับทดสอบ Followup Booking Component
 * - ฝัง <app-followup-booking> component
 * - มี mock patient ให้เลือก
 * - แสดง list นัดหมายที่สร้างแล้ว
 */
@Component({
  selector: 'app-followup-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule,
    FollowupBookingComponent,
  ],
  providers: [AppointmentDemoService],
  template: `
    <div class="followup-demo-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title">
          <mat-icon>event_repeat</mat-icon>
          <h1>Follow-up Booking Demo</h1>
        </div>
        <p class="page-description">
          ทดสอบ Component สำหรับนัด Follow-up ที่สามารถฝังในหน้าอื่นๆ ได้
        </p>
      </div>

      <div class="demo-layout">
        <!-- Left: Booking Component -->
        <div class="booking-section">
          <app-followup-booking
            [patient]="selectedPatient()"
            [defaultRoom]="service.rooms()[0]"
            [defaultDoctor]="service.doctors()[0]"
            [rooms]="service.rooms()"
            [doctors]="service.doctors()"
            [timeSlots]="service.timeSlots()"
            (appointmentCreated)="onAppointmentCreated($event)"
            (cancelled)="onCancelled()"
            (changePatient)="openPatientSearch()"
          />
        </div>

        <!-- Right: Created Appointments List -->
        <div class="appointments-section">
          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>list</mat-icon>
                นัดหมายที่สร้างใหม่ ({{ createdAppointments().length }})
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (createdAppointments().length === 0) {
                <div class="empty-state">
                  <mat-icon>event_busy</mat-icon>
                  <p>ยังไม่มีนัดหมายที่สร้าง</p>
                  <span>เลือกผู้ป่วยและนัดหมายจากด้านซ้าย</span>
                </div>
              } @else {
                <div class="appointment-list">
                  @for (apt of createdAppointments(); track apt.id) {
                    <div class="appointment-item">
                      <div class="apt-header">
                        <span class="apt-number">{{
                          apt.appointmentNumber
                        }}</span>
                        <mat-chip color="primary">{{ apt.status }}</mat-chip>
                      </div>
                      <div class="apt-details">
                        <div class="apt-row">
                          <mat-icon>person</mat-icon>
                          <span>{{ getPatientName(apt.patientId) }}</span>
                        </div>
                        <div class="apt-row">
                          <mat-icon>event</mat-icon>
                          <span>{{ formatDate(apt.date) }}</span>
                        </div>
                        <div class="apt-row">
                          <mat-icon>schedule</mat-icon>
                          <span>{{ getTimeSlotLabel(apt.timeSlotId) }}</span>
                        </div>
                        <div class="apt-row">
                          <mat-icon>meeting_room</mat-icon>
                          <span>{{ getRoomName(apt.roomId) }}</span>
                        </div>
                        <div class="apt-row">
                          <mat-icon>medical_services</mat-icon>
                          <span>{{ getDoctorName(apt.doctorId) }}</span>
                        </div>
                        @if (apt.notes) {
                          <div class="apt-row notes">
                            <mat-icon>notes</mat-icon>
                            <span>{{ apt.notes }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- Quick Select Patient -->
          <mat-card appearance="outlined" class="quick-select-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>person_search</mat-icon>
                เลือกผู้ป่วยด่วน
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="patient-chips">
                @for (patient of mockPatients(); track patient.id) {
                  <button
                    mat-stroked-button
                    [class.selected]="selectedPatient()?.id === patient.id"
                    (click)="selectPatient(patient)"
                  >
                    <mat-icon>person</mat-icon>
                    {{ patient.firstName }} {{ patient.lastName }}
                    <span class="hn">({{ patient.hn }})</span>
                  </button>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .followup-demo-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        .page-title {
          display: flex;
          align-items: center;
          gap: 12px;

          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
            color: var(--mat-sys-primary);
          }

          h1 {
            margin: 0;
            font-size: 1.75rem;
            font-weight: 600;
          }
        }

        .page-description {
          margin: 8px 0 0;
          color: var(--mat-sys-outline);
        }
      }

      .demo-layout {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 24px;

        @media (max-width: 1024px) {
          grid-template-columns: 1fr;
        }
      }

      .booking-section {
        background: var(--mat-sys-surface-container-lowest);
        border-radius: 16px;
        padding: 8px;
      }

      .appointments-section {
        display: flex;
        flex-direction: column;
        gap: 16px;

        mat-card-header {
          mat-card-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 1rem;
          }
        }
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 32px;
        text-align: center;
        color: var(--mat-sys-outline);

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          opacity: 0.5;
        }

        p {
          margin: 0;
          font-weight: 500;
        }

        span {
          font-size: 0.875rem;
        }
      }

      .appointment-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .appointment-item {
        padding: 12px;
        background: var(--mat-sys-surface-container);
        border-radius: 8px;

        .apt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .apt-number {
            font-weight: 600;
            font-size: 0.875rem;
            color: var(--mat-sys-primary);
          }
        }

        .apt-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .apt-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: var(--mat-sys-outline);
          }

          &.notes {
            font-style: italic;
            color: var(--mat-sys-outline);
          }
        }
      }

      .quick-select-card {
        .patient-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          button {
            font-size: 0.875rem;

            mat-icon {
              font-size: 18px;
              width: 18px;
              height: 18px;
            }

            .hn {
              font-size: 0.75rem;
              opacity: 0.7;
            }

            &.selected {
              background: var(--mat-sys-primary-container);
              color: var(--mat-sys-on-primary-container);
            }
          }
        }
      }
    `,
  ],
})
export class FollowupDemoComponent {
  service = inject(AppointmentDemoService);
  private snackBar = inject(MatSnackBar);

  // Selected patient
  selectedPatient = signal<Patient | undefined>(undefined);

  // List of created appointments
  createdAppointments = signal<Appointment[]>([]);

  // Mock patients for quick selection
  mockPatients = computed(() => this.service.patients().slice(0, 5));

  // =========================================================================
  // Methods
  // =========================================================================

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
  }

  openPatientSearch(): void {
    // For demo: use the quick select buttons on the right
    // In real app: would open a patient search dialog/modal
    this.snackBar.open('กรุณาเลือกผู้ป่วยจากรายการด้านขวา', 'ปิด', {
      duration: 3000,
    });
  }

  onAppointmentCreated(appointment: Appointment): void {
    this.createdAppointments.update((apts) => [appointment, ...apts]);
    this.snackBar.open('บันทึกนัดหมายสำเร็จ!', 'ปิด', {
      duration: 3000,
      panelClass: 'success-snackbar',
    });
  }

  onCancelled(): void {
    this.selectedPatient.set(undefined);
    this.snackBar.open('ยกเลิกการนัดหมาย', 'ปิด', {
      duration: 2000,
    });
  }

  // =========================================================================
  // Helper Methods
  // =========================================================================

  getPatientName(patientId: string): string {
    const patient = this.service.getPatient(patientId);
    return patient
      ? `${patient.title}${patient.firstName} ${patient.lastName}`
      : 'Unknown';
  }

  getTimeSlotLabel(timeSlotId: string): string {
    const slot = this.service.getTimeSlot(timeSlotId);
    return slot ? slot.label : 'Unknown';
  }

  getRoomName(roomId: string): string {
    const room = this.service.getRoom(roomId);
    return room ? room.name : 'Unknown';
  }

  getDoctorName(doctorId: string): string {
    const doctor = this.service.getDoctor(doctorId);
    return doctor ? doctor.name : 'Unknown';
  }

  formatDate(date: Date): string {
    const days = [
      'อาทิตย์',
      'จันทร์',
      'อังคาร',
      'พุธ',
      'พฤหัสบดี',
      'ศุกร์',
      'เสาร์',
    ];
    const d = new Date(date);
    return `${days[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
  }
}
