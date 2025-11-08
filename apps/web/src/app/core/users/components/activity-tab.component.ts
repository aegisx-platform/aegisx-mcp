import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AegisxCardComponent } from '@aegisx/ui';
import { UserService } from '../services/user.service';

export interface Activity {
  id: string;
  action: string;
  description: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PaginatedResponse {
  activities: Activity[];
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
    MatDividerModule,
    AegisxCardComponent,
  ],
  template: `
    <div class="mt-6">
      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <mat-spinner [diameter]="40"></mat-spinner>
        </div>
      } @else if (error()) {
        <ax-card [appearance]="'elevated'">
          <div class="text-center py-8">
            <mat-icon class="text-4xl text-red-500">error_outline</mat-icon>
            <p class="mt-2 text-red-600">{{ error() }}</p>
          </div>
        </ax-card>
      } @else if (activities().length === 0) {
        <ax-card [appearance]="'elevated'">
          <div class="text-center py-8 text-gray-500">
            <mat-icon class="text-4xl">history</mat-icon>
            <p class="mt-2">No activities recorded yet</p>
          </div>
        </ax-card>
      } @else {
        <ax-card [appearance]="'elevated'">
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="activities()" class="w-full">
              <!-- Action Column -->
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Action
                </th>
                <td mat-cell *matCellDef="let element" class="capitalize">
                  {{ element.action }}
                </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Description
                </th>
                <td mat-cell *matCellDef="let element">
                  {{ element.description }}
                </td>
              </ng-container>

              <!-- Severity Column -->
              <ng-container matColumnDef="severity">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Severity
                </th>
                <td mat-cell *matCellDef="let element">
                  @if (element.severity) {
                    <span
                      class="px-2 py-1 text-xs font-medium rounded-full capitalize"
                      [ngClass]="{
                        'bg-blue-100 text-blue-800':
                          element.severity === 'info',
                        'bg-yellow-100 text-yellow-800':
                          element.severity === 'warning',
                        'bg-red-100 text-red-800': element.severity === 'error',
                        'bg-purple-100 text-purple-800':
                          element.severity === 'critical',
                      }"
                    >
                      {{ element.severity }}
                    </span>
                  } @else {
                    <span class="text-gray-400">—</span>
                  }
                </td>
              </ng-container>

              <!-- Timestamp Column -->
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Date & Time
                </th>
                <td mat-cell *matCellDef="let element">
                  {{ formatDate(element.timestamp) }}
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>

          <!-- Pagination -->
          <div class="mt-4 border-t pt-4">
            <mat-paginator
              [length]="pagination().total"
              [pageSize]="pagination().limit"
              [pageSizeOptions]="[5, 10, 25, 50]"
              [pageIndex]="pagination().page - 1"
              (page)="onPageChange($event)"
              showFirstLastButtons
            >
            </mat-paginator>
          </div>
        </ax-card>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      table {
        background: transparent;
      }

      th {
        background-color: transparent;
        color: rgb(55 65 81);
        font-weight: 600;
        border-bottom: 2px solid rgb(229 231 235);
        padding: 16px;
      }

      td {
        padding: 16px;
        border-bottom: 1px solid rgb(229 231 235);
      }

      tr:hover {
        background-color: rgb(249 250 251);
      }

      :host-context(.dark) {
        th {
          color: rgb(209 213 219);
          border-bottom-color: rgb(55 65 81);
        }

        td {
          border-bottom-color: rgb(55 65 81);
        }

        tr:hover {
          background-color: rgb(31 41 55);
        }
      }
    `,
  ],
})
export class ActivityTabComponent implements OnInit {
  @Input() userId!: string;

  private userService = inject(UserService);

  activities = signal<Activity[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  displayedColumns = ['action', 'description', 'severity', 'timestamp'];

  ngOnInit() {
    this.loadActivities();
  }

  async loadActivities(page: number = 1, limit: number = 10) {
    if (!this.userId) {
      this.error.set('User ID is required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await this.userService.getUserActivities(this.userId, {
        page,
        limit,
      });

      if (response && response.data) {
        this.activities.set(response.data.activities || []);
        this.pagination.set(response.data.pagination);
      } else {
        this.activities.set([]);
      }
    } catch (err: any) {
      console.error('Failed to load activities:', err);
      this.error.set(
        err.message || 'Failed to load activities. Please try again.',
      );
      this.activities.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  onPageChange(event: PageEvent) {
    const page = event.pageIndex + 1; // Convert from 0-based to 1-based
    const limit = event.pageSize;
    this.loadActivities(page, limit);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
