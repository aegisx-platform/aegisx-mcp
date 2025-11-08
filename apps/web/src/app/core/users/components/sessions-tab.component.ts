import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AegisxCardComponent } from '@aegisx/ui';
import { UserService } from '../services/user.service';
import { ConfirmDialogComponent } from '../../../shared/ui/components/confirm-dialog.component';

export interface UserSession {
  id: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: string;
  startedAt: string;
  lastActivityAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface PaginatedSessionsResponse {
  sessions: UserSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Component({
  selector: 'ax-sessions-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
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
            <button
              mat-raised-button
              color="primary"
              (click)="loadSessions()"
              class="mt-4"
            >
              <mat-icon>refresh</mat-icon>
              <span>Retry</span>
            </button>
          </div>
        </ax-card>
      } @else if (sessions().length === 0) {
        <ax-card [appearance]="'elevated'">
          <div class="text-center py-8 text-gray-500">
            <mat-icon class="text-4xl">devices</mat-icon>
            <p class="mt-2">No active sessions</p>
          </div>
        </ax-card>
      } @else {
        <ax-card [appearance]="'elevated'">
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="sessions()" class="w-full">
              <!-- Device Info Column -->
              <ng-container matColumnDef="deviceInfo">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Device
                </th>
                <td mat-cell *matCellDef="let element">
                  <div class="flex items-center space-x-2">
                    <mat-icon class="text-sm text-gray-500">devices</mat-icon>
                    <div>
                      <p class="text-sm font-medium">
                        {{ getDeviceName(element.userAgent) }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ element.ipAddress }}
                      </p>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Status
                </th>
                <td mat-cell *matCellDef="let element">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    [ngClass]="{
                      'bg-green-100 text-green-800': isSessionActive(element),
                      'bg-red-100 text-red-800': !isSessionActive(element),
                    }"
                  >
                    {{ isSessionActive(element) ? 'Active' : 'Expired' }}
                  </span>
                </td>
              </ng-container>

              <!-- Started At Column -->
              <ng-container matColumnDef="startedAt">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Started
                </th>
                <td mat-cell *matCellDef="let element">
                  {{ formatDate(element.startedAt) }}
                </td>
              </ng-container>

              <!-- Last Activity Column -->
              <ng-container matColumnDef="lastActivityAt">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Last Activity
                </th>
                <td mat-cell *matCellDef="let element">
                  {{ formatDate(element.lastActivityAt) }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">
                  Actions
                </th>
                <td mat-cell *matCellDef="let element">
                  <div class="flex items-center space-x-2">
                    <button
                      mat-icon-button
                      color="warn"
                      (click)="revokeSession(element)"
                      [disabled]="operationLoading()"
                      matTooltip="Revoke session"
                    >
                      <mat-icon class="text-sm">logout</mat-icon>
                    </button>
                  </div>
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
export class SessionsTabComponent implements OnInit {
  @Input() userId!: string;

  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  sessions = signal<UserSession[]>([]);
  loading = signal(false);
  operationLoading = signal(false);
  error = signal<string | null>(null);
  pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  displayedColumns = [
    'deviceInfo',
    'status',
    'startedAt',
    'lastActivityAt',
    'actions',
  ];

  ngOnInit() {
    this.loadSessions();
  }

  async loadSessions(page: number = 1, limit: number = 10) {
    if (!this.userId) {
      this.error.set('User ID is required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await this.userService.getUserActivitySessions(
        this.userId,
        page,
        limit,
      );

      if (response && response.data) {
        this.sessions.set(response.data.sessions || []);
        this.pagination.set(response.data.pagination);
      } else {
        this.sessions.set([]);
      }
    } catch (err: any) {
      console.error('Failed to load sessions:', err);
      this.error.set(
        err.message || 'Failed to load sessions. Please try again.',
      );
      this.sessions.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  onPageChange(event: PageEvent) {
    const page = event.pageIndex + 1;
    const limit = event.pageSize;
    this.loadSessions(page, limit);
  }

  revokeSession(session: UserSession): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Revoke Session',
        message: `Are you sure you want to revoke this session? This will log out the session from ${this.getDeviceName(session.userAgent)}.`,
        confirmText: 'Revoke',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        this.operationLoading.set(true);
        try {
          // Call backend to revoke session
          // This would require a new endpoint: DELETE /api/profile/activity/sessions/:sessionId
          // For now, we'll show a message since the endpoint may not be implemented yet
          this.snackBar.open(
            'Session revocation feature coming soon',
            'Close',
            {
              duration: 3000,
            },
          );

          // TODO: Uncomment when backend endpoint is ready
          // await this.userService.revokeSession(session.id);
          // this.snackBar.open('Session revoked successfully', 'Close', {
          //   duration: 3000,
          // });
          // this.loadSessions();
        } catch (error) {
          this.snackBar.open('Failed to revoke session', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        } finally {
          this.operationLoading.set(false);
        }
      }
    });
  }

  getDeviceName(userAgent: string): string {
    if (!userAgent) return 'Unknown Device';

    // Simple device detection from user agent
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';
    if (userAgent.includes('Edge')) return 'Edge Browser';
    if (userAgent.includes('Mobile')) return 'Mobile Device';
    if (userAgent.includes('Tablet')) return 'Tablet Device';

    return 'Browser';
  }

  isSessionActive(session: UserSession): boolean {
    if (!session.expiresAt) return true;
    return new Date(session.expiresAt) > new Date();
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
