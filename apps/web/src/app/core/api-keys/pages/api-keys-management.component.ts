import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BreadcrumbComponent, AegisxNavigationItem } from '@aegisx/ui';
import { ApiKeysService } from '../services/api-keys.service';
import { ApiKeyWithPreview } from '../models/api-keys.types';
import { GenerateKeyDialogComponent } from '../dialogs/generate-key-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/ui/components/confirm-dialog.component';

@Component({
  selector: 'app-api-keys-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatSnackBarModule,
    BreadcrumbComponent,
  ],
  template: `
    <div class="api-keys-management p-6 space-y-6">
      <!-- Breadcrumb -->
      <ax-breadcrumb [items]="breadcrumbItems"></ax-breadcrumb>

      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            API Keys Management
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Manage your API keys for programmatic access
          </p>
        </div>
        <button
          mat-raised-button
          color="primary"
          (click)="openGenerateDialog()"
          [disabled]="loading()"
        >
          <mat-icon class="mr-1">add</mat-icon>
          Generate New Key
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <mat-card class="shadow-sm">
          <mat-card-content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total Keys</p>
                <p class="text-2xl font-bold">{{ totalKeys() }}</p>
              </div>
              <mat-icon class="text-blue-500 text-4xl">vpn_key</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="shadow-sm">
          <mat-card-content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Active Keys</p>
                <p class="text-2xl font-bold text-green-600">
                  {{ activeKeys() }}
                </p>
              </div>
              <mat-icon class="text-green-500 text-4xl">check_circle</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="shadow-sm">
          <mat-card-content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Revoked Keys</p>
                <p class="text-2xl font-bold text-red-600">
                  {{ revokedKeys() }}
                </p>
              </div>
              <mat-icon class="text-red-500 text-4xl">cancel</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Table Card -->
      <mat-card class="shadow-md">
        <mat-card-content class="p-6">
          @if (loading()) {
            <div class="flex justify-center items-center py-12">
              <mat-spinner diameter="50"></mat-spinner>
            </div>
          } @else if (error()) {
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p class="text-red-700">{{ error() }}</p>
              <button mat-button color="warn" (click)="loadKeys()" class="mt-2">
                <mat-icon class="mr-1">refresh</mat-icon>
                Retry
              </button>
            </div>
          } @else {
            <!-- Table -->
            <div class="overflow-x-auto">
              <table mat-table [dataSource]="dataSource" matSort class="w-full">
                <!-- Name Column -->
                <ng-container matColumnDef="name">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    mat-sort-header
                    class="font-semibold"
                  >
                    Name
                  </th>
                  <td mat-cell *matCellDef="let key">
                    <div class="font-medium">{{ key.name }}</div>
                  </td>
                </ng-container>

                <!-- Preview Column -->
                <ng-container matColumnDef="preview">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold">
                    Key Preview
                  </th>
                  <td mat-cell *matCellDef="let key">
                    <code class="text-sm text-gray-600">{{ key.preview }}</code>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    mat-sort-header
                    class="font-semibold"
                  >
                    Status
                  </th>
                  <td mat-cell *matCellDef="let key">
                    @if (key.is_active) {
                      <mat-chip class="bg-green-100 text-green-800">
                        <mat-icon class="text-sm mr-1">check_circle</mat-icon>
                        Active
                      </mat-chip>
                    } @else {
                      <mat-chip class="bg-red-100 text-red-800">
                        <mat-icon class="text-sm mr-1">cancel</mat-icon>
                        Revoked
                      </mat-chip>
                    }
                  </td>
                </ng-container>

                <!-- Last Used Column -->
                <ng-container matColumnDef="last_used">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    mat-sort-header
                    class="font-semibold"
                  >
                    Last Used
                  </th>
                  <td mat-cell *matCellDef="let key">
                    @if (key.last_used_at) {
                      <span>{{ key.last_used_at | date: 'short' }}</span>
                    } @else {
                      <span class="text-gray-400">Never</span>
                    }
                  </td>
                </ng-container>

                <!-- Expires Column -->
                <ng-container matColumnDef="expires">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    mat-sort-header
                    class="font-semibold"
                  >
                    Expires
                  </th>
                  <td mat-cell *matCellDef="let key">
                    @if (key.expires_at) {
                      <span>{{ key.expires_at | date: 'short' }}</span>
                    } @else {
                      <span class="text-gray-600">Never</span>
                    }
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    class="font-semibold text-right"
                  >
                    Actions
                  </th>
                  <td mat-cell *matCellDef="let key" class="text-right">
                    <button
                      mat-icon-button
                      [matMenuTriggerFor]="menu"
                      [matTooltip]="'Actions'"
                    >
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      @if (key.is_active) {
                        <button mat-menu-item (click)="rotateKey(key)">
                          <mat-icon class="text-blue-600">autorenew</mat-icon>
                          <span>Rotate Key</span>
                        </button>
                        <button mat-menu-item (click)="revokeKey(key)">
                          <mat-icon class="text-orange-600">block</mat-icon>
                          <span>Revoke Key</span>
                        </button>
                      }
                      <button
                        mat-menu-item
                        (click)="deleteKey(key)"
                        class="text-red-600"
                      >
                        <mat-icon class="text-red-600">delete</mat-icon>
                        <span>Delete Key</span>
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                ></tr>

                <!-- No Data Row -->
                <tr class="mat-row" *matNoDataRow>
                  <td
                    class="mat-cell text-center py-8"
                    [attr.colspan]="displayedColumns.length"
                  >
                    <div class="text-gray-500">
                      <mat-icon class="text-6xl mb-2">vpn_key_off</mat-icon>
                      <p>No API keys found</p>
                      <button
                        mat-button
                        color="primary"
                        (click)="openGenerateDialog()"
                        class="mt-2"
                      >
                        <mat-icon class="mr-1">add</mat-icon>
                        Generate Your First Key
                      </button>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Paginator -->
            <mat-paginator
              [pageSizeOptions]="[5, 10, 25, 50]"
              [pageSize]="10"
              showFirstLastButtons
            ></mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .mat-mdc-table {
        background: transparent;
      }

      :host ::ng-deep .mat-mdc-row:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
    `,
  ],
})
export class ApiKeysManagementComponent implements OnInit {
  private apiKeysService = inject(ApiKeysService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  breadcrumbItems: AegisxNavigationItem[] = [
    {
      id: 'settings',
      title: 'Settings',
      link: '/settings',
      type: 'basic',
    },
    {
      id: 'api-keys',
      title: 'API Keys',
      link: '/settings/api-keys',
      type: 'basic',
    },
  ];

  displayedColumns = [
    'name',
    'preview',
    'status',
    'last_used',
    'expires',
    'actions',
  ];
  dataSource = new MatTableDataSource<ApiKeyWithPreview>([]);

  // Signals from service
  loading = this.apiKeysService.loading;
  error = this.apiKeysService.error;
  totalKeys = this.apiKeysService.totalKeys;
  activeKeys = this.apiKeysService.activeKeys;

  // Computed signal for revoked keys
  revokedKeys = signal(0);

  ngOnInit(): void {
    this.loadKeys();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadKeys(): void {
    this.apiKeysService.getMyKeys().subscribe({
      next: (result) => {
        this.dataSource.data = result.data;
        this.revokedKeys.set(result.data.filter((k) => !k.is_active).length);
      },
      error: (error) => {
        this.snackBar.open(
          error.message || 'Failed to load API keys',
          'Close',
          { duration: 5000, panelClass: ['bg-red-500'] },
        );
      },
    });
  }

  openGenerateDialog(): void {
    const dialogRef = this.dialog.open(GenerateKeyDialogComponent, {
      width: '600px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadKeys();
        this.snackBar.open('API Key generated successfully!', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  revokeKey(key: ApiKeyWithPreview): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Revoke API Key?',
        message: `Are you sure you want to revoke "${key.name}"? This action will immediately disable the key and cannot be undone.`,
        confirmText: 'Revoke',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.apiKeysService.revokeKey(key.id).subscribe({
          next: () => {
            this.loadKeys();
            this.snackBar.open('API Key revoked successfully', 'Close', {
              duration: 3000,
            });
          },
          error: (error) => {
            this.snackBar.open(
              error.message || 'Failed to revoke API key',
              'Close',
              { duration: 5000, panelClass: ['bg-red-500'] },
            );
          },
        });
      }
    });
  }

  rotateKey(key: ApiKeyWithPreview): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Rotate API Key?',
        message: `This will generate a new key for "${key.name}" and deactivate the old one. The new key will be shown only once.`,
        confirmText: 'Rotate',
        confirmColor: 'primary',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.apiKeysService.rotateKey(key.id).subscribe({
          next: (result) => {
            this.loadKeys();
            // Show new key dialog
            const newKeyDialog = this.dialog.open(GenerateKeyDialogComponent, {
              width: '600px',
              disableClose: true,
              data: { generatedKey: result, rotated: true },
            });
          },
          error: (error) => {
            this.snackBar.open(
              error.message || 'Failed to rotate API key',
              'Close',
              { duration: 5000, panelClass: ['bg-red-500'] },
            );
          },
        });
      }
    });
  }

  deleteKey(key: ApiKeyWithPreview): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete API Key?',
        message: `Are you sure you want to permanently delete "${key.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.apiKeysService.deleteKey(key.id).subscribe({
          next: () => {
            this.loadKeys();
            this.snackBar.open('API Key deleted successfully', 'Close', {
              duration: 3000,
            });
          },
          error: (error) => {
            this.snackBar.open(
              error.message || 'Failed to delete API key',
              'Close',
              { duration: 5000, panelClass: ['bg-red-500'] },
            );
          },
        });
      }
    });
  }
}
