import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AegisxCardComponent } from '@aegisx/ui';
import { UserService, User } from '../services/user.service';
import { UserFormDialogComponent } from '../components/user-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'ax-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    AegisxCardComponent,
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <mat-spinner [diameter]="40"></mat-spinner>
        </div>
      } @else if (error()) {
        <ax-card [appearance]="'elevated'" class="max-w-2xl mx-auto">
          <div class="text-center py-8">
            <mat-icon class="text-6xl text-red-500">error_outline</mat-icon>
            <p
              class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4"
            >
              Error loading user
            </p>
            <p class="text-gray-600 dark:text-gray-400">{{ error() }}</p>
            <button
              mat-raised-button
              color="primary"
              (click)="loadUser()"
              class="mt-4"
            >
              <mat-icon>refresh</mat-icon>
              <span>Retry</span>
            </button>
          </div>
        </ax-card>
      } @else if (user()) {
        <!-- User Header -->
        <div class="flex justify-between items-start mb-8">
          <div class="flex items-center space-x-4">
            <button mat-icon-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div
              class="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center"
            >
              <span
                class="text-2xl font-semibold text-primary-600 dark:text-primary-400"
              >
                {{ getInitials(user()!) }}
              </span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{ user()!.firstName }} {{ user()!.lastName }}
              </h1>
              <p class="text-gray-600 dark:text-gray-400">
                {{ user()!.email }}
              </p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button mat-stroked-button (click)="editUser()">
              <mat-icon>edit</mat-icon>
              <span>Edit</span>
            </button>
            <button mat-stroked-button color="warn" (click)="deleteUser()">
              <mat-icon>delete</mat-icon>
              <span>Delete</span>
            </button>
          </div>
        </div>

        <!-- User Details Tabs -->
        <mat-tab-group>
          <!-- Profile Tab -->
          <mat-tab label="Profile">
            <ax-card [appearance]="'elevated'" class="mt-6">
              <h3 class="text-lg font-semibold mb-4">User Information</h3>
              <mat-list>
                <mat-list-item>
                  <span matListItemTitle>Username</span>
                  <span matListItemMeta>{{ user()!.username }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>

                <mat-list-item>
                  <span matListItemTitle>Email</span>
                  <span matListItemMeta>{{ user()!.email }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>

                <mat-list-item>
                  <span matListItemTitle>Role</span>
                  <span matListItemMeta class="capitalize">{{
                    user()!.role
                  }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>

                <mat-list-item>
                  <span matListItemTitle>Status</span>
                  <span matListItemMeta>
                    <span
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-800': user()!.isActive,
                        'bg-red-100 text-red-800': !user()!.isActive,
                      }"
                    >
                      {{ user()!.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </span>
                </mat-list-item>
                <mat-divider></mat-divider>

                <mat-list-item>
                  <span matListItemTitle>Created At</span>
                  <span matListItemMeta>{{
                    formatDate(user()!.createdAt)
                  }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>

                <mat-list-item>
                  <span matListItemTitle>Last Updated</span>
                  <span matListItemMeta>{{
                    formatDate(user()!.updatedAt)
                  }}</span>
                </mat-list-item>

                @if (user()!.lastLoginAt) {
                  <mat-divider></mat-divider>
                  <mat-list-item>
                    <span matListItemTitle>Last Login</span>
                    <span matListItemMeta>{{
                      formatDate(user()!.lastLoginAt!)
                    }}</span>
                  </mat-list-item>
                }
              </mat-list>
            </ax-card>
          </mat-tab>

          <!-- Activity Tab -->
          <mat-tab label="Activity">
            <ax-card [appearance]="'elevated'" class="mt-6">
              <h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
              <div class="text-center py-8 text-gray-500">
                <mat-icon class="text-4xl">history</mat-icon>
                <p class="mt-2">Activity tracking coming soon</p>
              </div>
            </ax-card>
          </mat-tab>

          <!-- Permissions Tab -->
          <mat-tab label="Permissions">
            <ax-card [appearance]="'elevated'" class="mt-6">
              <h3 class="text-lg font-semibold mb-4">User Permissions</h3>
              <div class="text-center py-8 text-gray-500">
                <mat-icon class="text-4xl">security</mat-icon>
                <p class="mt-2">Permission management coming soon</p>
              </div>
            </ax-card>
          </mat-tab>

          <!-- Sessions Tab -->
          <mat-tab label="Sessions">
            <ax-card [appearance]="'elevated'" class="mt-6">
              <h3 class="text-lg font-semibold mb-4">Active Sessions</h3>
              <div class="text-center py-8 text-gray-500">
                <mat-icon class="text-4xl">devices</mat-icon>
                <p class="mt-2">Session management coming soon</p>
              </div>
            </ax-card>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      mat-list-item {
        height: 56px !important;
      }

      ::ng-deep .mat-mdc-list-item-meta {
        @apply text-gray-600 dark:text-gray-400;
      }
    `,
  ],
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  user = signal<User | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadUser();
  }

  async loadUser() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.router.navigate(['/users']);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const user = await this.userService.loadUserById(userId);
      if (user) {
        this.user.set(user);
      } else {
        this.error.set('User not found');
      }
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load user');
    } finally {
      this.loading.set(false);
    }
  }

  editUser(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', user: this.user() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUser();
      }
    });
  }

  deleteUser(): void {
    const user = this.user();
    if (!user) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed && user) {
        try {
          await this.userService.deleteUser(user.id);
          this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/users']);
        } catch (error) {
          this.snackBar.open('Failed to delete user', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  getInitials(user: User): string {
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || user.email[0].toUpperCase();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
