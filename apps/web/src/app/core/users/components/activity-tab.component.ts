import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AegisxCardComponent } from '@aegisx/ui';

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  severity?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ActivityResponse {
  activities: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Component({
  selector: 'ax-activity-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    AegisxCardComponent,
  ],
  template: `
    <ax-card [appearance]="'elevated'" class="mt-6">
      <h3 class="text-lg font-semibold mb-4">Activity Log</h3>

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <mat-spinner [diameter]="40"></mat-spinner>
        </div>
      } @else if (activities().length === 0) {
        <div class="text-center py-8">
          <mat-icon class="text-6xl text-gray-400">history</mat-icon>
          <p class="text-gray-600 dark:text-gray-400 mt-4">
            No activities found
          </p>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="activities()" class="w-full">
            <!-- Action Column -->
            <ng-container matColumnDef="action">
              <th mat-header-cell>Action</th>
              <td mat-cell *matCellDef="let element">
                <span class="font-medium">{{
                  element.action | titlecase
                }}</span>
              </td>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="description">
              <th mat-header-cell>Description</th>
              <td mat-cell *matCellDef="let element">
                {{ element.description }}
              </td>
            </ng-container>

            <!-- Severity Column -->
            <ng-container matColumnDef="severity">
              <th mat-header-cell>Level</th>
              <td mat-cell *matCellDef="let element">
                @if (element.severity) {
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-green-100 text-green-800':
                        element.severity === 'info',
                      'bg-yellow-100 text-yellow-800':
                        element.severity === 'warning',
                      'bg-red-100 text-red-800': element.severity === 'error',
                    }"
                  >
                    {{ element.severity | titlecase }}
                  </span>
                } @else {
                  <span class="text-gray-400">-</span>
                }
              </td>
            </ng-container>

            <!-- Timestamp Column -->
            <ng-container matColumnDef="timestamp">
              <th mat-header-cell>Timestamp</th>
              <td mat-cell *matCellDef="let element">
                {{ element.timestamp | date: 'short' }}
              </td>
            </ng-container>

            <tr
              mat-header-row
              *matHeaderRowDef="[
                'action',
                'description',
                'severity',
                'timestamp',
              ]"
            ></tr>
            <tr
              mat-row
              *matRowDef="
                let row;
                columns: ['action', 'description', 'severity', 'timestamp']
              "
            ></tr>
          </table>
        </div>

        <!-- Paginator -->
        <mat-paginator
          [length]="pagination().total"
          [pageSize]="pagination().limit"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPageChange($event)"
          class="mt-4"
        ></mat-paginator>
      }
    </ax-card>
  `,
  styles: [
    `
      table {
        width: 100%;
      }

      th {
        font-weight: 600;
        color: #666;
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
      }

      td {
        padding: 0.75rem;
        border-bottom: 1px solid #e5e7eb;
      }

      tr:last-child td {
        border-bottom: none;
      }

      ::ng-deep .mat-mdc-paginator {
        background: transparent;
      }
    `,
  ],
})
export class ActivityTabComponent implements OnInit {
  @Input() userId!: string;

  private http = inject(HttpClient);

  activities = signal<ActivityLog[]>([]);
  loading = signal(false);
  pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  ngOnInit() {
    this.loadActivities();
  }

  private loadActivities(page: number = 1, limit: number = 10) {
    this.loading.set(true);

    // Use HttpClient to fetch user activities from the API
    this.http
      .get<any>(`/api/profile/activity`, {
        params: { page: page.toString(), limit: limit.toString() },
      })
      .toPromise()
      .then(
        (response: any) => {
          if (response && response.data) {
            if (response.data.activities) {
              this.activities.set(response.data.activities);
            }
            if (response.data.pagination) {
              this.pagination.set(response.data.pagination);
            }
          }
          this.loading.set(false);
        },
        () => {
          this.activities.set([]);
          this.loading.set(false);
        },
      );
  }

  onPageChange(event: PageEvent) {
    this.loadActivities(event.pageIndex + 1, event.pageSize);
  }
}
