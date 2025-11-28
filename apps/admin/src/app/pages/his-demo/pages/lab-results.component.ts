import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { AxBreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';

interface LabResult {
  id: string;
  testId: string;
  patientName: string;
  patientMrn: string;
  testType: string;
  orderDate: string;
  resultDate: string | null;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'ordered' | 'collected' | 'processing' | 'completed' | 'verified';
  orderedBy: string;
}

@Component({
  selector: 'ax-his-lab-results',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatTabsModule,
    MatChipsModule,
    MatPaginatorModule,
    MatDividerModule,
    AxBreadcrumbComponent,
  ],
  template: `
    <div class="lab-results-page">
      <!-- Breadcrumb -->
      <ax-breadcrumb
        [items]="breadcrumbItems"
        separatorIcon="chevron_right"
        size="sm"
      ></ax-breadcrumb>

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title">
          <h1>Lab Results</h1>
          <p>Manage laboratory tests and results</p>
        </div>
        <div class="page-actions">
          <button mat-stroked-button>
            <mat-icon>print</mat-icon>
            Print Queue
          </button>
          <button mat-flat-button color="primary">
            <mat-icon>add</mat-icon>
            Order Test
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <mat-card appearance="outlined" class="summary-card">
          <mat-card-content>
            <div class="summary-icon ordered">
              <mat-icon>science</mat-icon>
            </div>
            <div class="summary-info">
              <span class="summary-value">45</span>
              <span class="summary-label">Ordered</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <mat-card-content>
            <div class="summary-icon processing">
              <mat-icon>hourglass_empty</mat-icon>
            </div>
            <div class="summary-info">
              <span class="summary-value">32</span>
              <span class="summary-label">Processing</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <mat-card-content>
            <div class="summary-icon completed">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="summary-info">
              <span class="summary-value">156</span>
              <span class="summary-label">Completed</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card urgent">
          <mat-card-content>
            <div class="summary-icon urgent">
              <mat-icon>priority_high</mat-icon>
            </div>
            <div class="summary-info">
              <span class="summary-value">8</span>
              <span class="summary-label">Urgent Pending</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabs & Table -->
      <mat-card appearance="outlined" class="table-card">
        <mat-tab-group>
          <mat-tab label="All Tests">
            <div class="tab-content">
              <table mat-table [dataSource]="labResults" class="lab-table">
                <ng-container matColumnDef="testId">
                  <th mat-header-cell *matHeaderCellDef>Test ID</th>
                  <td mat-cell *matCellDef="let result">
                    <span class="test-id">{{ result.testId }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="patient">
                  <th mat-header-cell *matHeaderCellDef>Patient</th>
                  <td mat-cell *matCellDef="let result">
                    <div class="patient-info">
                      <span class="patient-name">{{ result.patientName }}</span>
                      <span class="patient-mrn">{{ result.patientMrn }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="testType">
                  <th mat-header-cell *matHeaderCellDef>Test Type</th>
                  <td mat-cell *matCellDef="let result">
                    <div class="test-type">
                      <mat-icon>biotech</mat-icon>
                      {{ result.testType }}
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="orderDate">
                  <th mat-header-cell *matHeaderCellDef>Order Date</th>
                  <td mat-cell *matCellDef="let result">
                    {{ result.orderDate }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="priority">
                  <th mat-header-cell *matHeaderCellDef>Priority</th>
                  <td mat-cell *matCellDef="let result">
                    <span class="priority-badge" [class]="result.priority">
                      {{ getPriorityLabel(result.priority) }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let result">
                    <span class="status-badge" [class]="result.status">
                      {{ getStatusLabel(result.status) }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let result">
                    <button mat-icon-button [matMenuTriggerFor]="rowMenu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #rowMenu="matMenu">
                      <button mat-menu-item>
                        <mat-icon>visibility</mat-icon> View Details
                      </button>
                      @if (
                        result.status === 'completed' ||
                        result.status === 'verified'
                      ) {
                        <button mat-menu-item>
                          <mat-icon>description</mat-icon> View Results
                        </button>
                        <button mat-menu-item>
                          <mat-icon>print</mat-icon> Print Report
                        </button>
                      }
                      @if (result.status === 'ordered') {
                        <button mat-menu-item>
                          <mat-icon>colorize</mat-icon> Mark Collected
                        </button>
                      }
                      @if (result.status === 'completed') {
                        <button mat-menu-item>
                          <mat-icon>verified</mat-icon> Verify Results
                        </button>
                      }
                      <button mat-menu-item>
                        <mat-icon>send</mat-icon> Send to Doctor
                      </button>
                      <mat-divider></mat-divider>
                      <button mat-menu-item class="danger">
                        <mat-icon>cancel</mat-icon> Cancel Test
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                ></tr>
              </table>

              <mat-paginator
                [length]="233"
                [pageSize]="10"
                [pageSizeOptions]="[5, 10, 25]"
                showFirstLastButtons
              ></mat-paginator>
            </div>
          </mat-tab>
          <mat-tab label="Pending (77)"></mat-tab>
          <mat-tab label="Completed (156)"></mat-tab>
          <mat-tab label="Urgent (8)"></mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .lab-results-page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .page-title h1 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--ax-text-heading);
      }

      .page-title p {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
        color: var(--ax-text-secondary);
      }

      .page-actions {
        display: flex;
        gap: 0.75rem;
      }

      .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
      }

      .summary-card mat-card-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem !important;
      }

      .summary-card.urgent {
        border-color: var(--ax-error-default);
      }

      .summary-icon {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ax-radius-lg);

        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }

        &.ordered {
          background: var(--ax-info-faint);
          color: var(--ax-info-default);
        }

        &.processing {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-default);
        }

        &.completed {
          background: var(--ax-success-faint);
          color: var(--ax-success-default);
        }

        &.urgent {
          background: var(--ax-error-faint);
          color: var(--ax-error-default);
        }
      }

      .summary-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .summary-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--ax-text-heading);
      }

      .summary-label {
        font-size: 0.75rem;
        color: var(--ax-text-secondary);
      }

      .table-card {
        overflow: hidden;
      }

      .tab-content {
        padding: 0;
      }

      .lab-table {
        width: 100%;

        th.mat-header-cell {
          font-weight: 600;
          color: var(--ax-text-heading);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 1rem;
          background: var(--ax-background-subtle);
        }

        td.mat-cell {
          padding: 1rem;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--ax-border-muted);
        }

        tr.mat-row:hover {
          background: var(--ax-background-subtle);
        }
      }

      .test-id {
        font-family: monospace;
        font-weight: 600;
        color: var(--ax-brand-default);
      }

      .patient-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .patient-name {
        font-weight: 500;
        color: var(--ax-text-primary);
      }

      .patient-mrn {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
      }

      .test-type {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: var(--ax-text-secondary);

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          color: var(--ax-text-subtle);
        }
      }

      .priority-badge {
        display: inline-flex;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: var(--ax-radius-sm);

        &.routine {
          background: var(--ax-background-muted);
          color: var(--ax-text-secondary);
        }

        &.urgent {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-700);
        }

        &.stat {
          background: var(--ax-error-faint);
          color: var(--ax-error-700);
        }
      }

      .status-badge {
        display: inline-flex;
        padding: 0.25rem 0.625rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: var(--ax-radius-full);

        &.ordered {
          background: var(--ax-background-muted);
          color: var(--ax-text-secondary);
        }

        &.collected {
          background: var(--ax-info-faint);
          color: var(--ax-info-700);
        }

        &.processing {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-700);
        }

        &.completed {
          background: var(--ax-brand-faint);
          color: var(--ax-brand-700);
        }

        &.verified {
          background: var(--ax-success-faint);
          color: var(--ax-success-700);
        }
      }

      .danger {
        color: var(--ax-error-default);
      }

      mat-paginator {
        border-top: 1px solid var(--ax-border-muted);
      }
    `,
  ],
})
export class LabResultsComponent {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'HIS', url: '/his-demo' },
    { label: 'Lab Results' },
  ];

  displayedColumns = [
    'testId',
    'patient',
    'testType',
    'orderDate',
    'priority',
    'status',
    'actions',
  ];

  labResults: LabResult[] = [
    {
      id: '1',
      testId: 'LAB-4521',
      patientName: 'John Smith',
      patientMrn: 'MRN-001234',
      testType: 'Complete Blood Count',
      orderDate: '2024-01-15',
      resultDate: '2024-01-15',
      priority: 'routine',
      status: 'completed',
      orderedBy: 'Dr. Wilson',
    },
    {
      id: '2',
      testId: 'LAB-4522',
      patientName: 'Sarah Johnson',
      patientMrn: 'MRN-001235',
      testType: 'Blood Chemistry',
      orderDate: '2024-01-15',
      resultDate: null,
      priority: 'urgent',
      status: 'processing',
      orderedBy: 'Dr. Brown',
    },
    {
      id: '3',
      testId: 'LAB-4523',
      patientName: 'Michael Brown',
      patientMrn: 'MRN-001236',
      testType: 'X-Ray Chest',
      orderDate: '2024-01-15',
      resultDate: null,
      priority: 'stat',
      status: 'ordered',
      orderedBy: 'Dr. Davis',
    },
    {
      id: '4',
      testId: 'LAB-4524',
      patientName: 'Emily Davis',
      patientMrn: 'MRN-001237',
      testType: 'Urinalysis',
      orderDate: '2024-01-14',
      resultDate: '2024-01-15',
      priority: 'routine',
      status: 'verified',
      orderedBy: 'Dr. Miller',
    },
    {
      id: '5',
      testId: 'LAB-4525',
      patientName: 'David Wilson',
      patientMrn: 'MRN-001238',
      testType: 'Lipid Profile',
      orderDate: '2024-01-14',
      resultDate: null,
      priority: 'routine',
      status: 'collected',
      orderedBy: 'Dr. Wilson',
    },
    {
      id: '6',
      testId: 'LAB-4526',
      patientName: 'Lisa Anderson',
      patientMrn: 'MRN-001239',
      testType: 'Thyroid Panel',
      orderDate: '2024-01-14',
      resultDate: null,
      priority: 'urgent',
      status: 'processing',
      orderedBy: 'Dr. Taylor',
    },
    {
      id: '7',
      testId: 'LAB-4527',
      patientName: 'Robert Taylor',
      patientMrn: 'MRN-001240',
      testType: 'ECG',
      orderDate: '2024-01-14',
      resultDate: '2024-01-14',
      priority: 'stat',
      status: 'completed',
      orderedBy: 'Dr. Wilson',
    },
    {
      id: '8',
      testId: 'LAB-4528',
      patientName: 'Jennifer Martinez',
      patientMrn: 'MRN-001241',
      testType: 'Blood Sugar',
      orderDate: '2024-01-13',
      resultDate: '2024-01-14',
      priority: 'routine',
      status: 'verified',
      orderedBy: 'Dr. Garcia',
    },
  ];

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      routine: 'Routine',
      urgent: 'Urgent',
      stat: 'STAT',
    };
    return labels[priority] || priority;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ordered: 'Ordered',
      collected: 'Collected',
      processing: 'Processing',
      completed: 'Completed',
      verified: 'Verified',
    };
    return labels[status] || status;
  }
}
