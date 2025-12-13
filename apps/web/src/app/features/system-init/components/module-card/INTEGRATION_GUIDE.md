# Module Card Component - Integration Guide

Complete guide for integrating the Module Card Component into the System Initialization Dashboard.

## Quick Start

### 1. Import the Component

```typescript
import { ModuleCardComponent } from './components/module-card/module-card.component';
```

### 2. Add to Dashboard Template

```html
<div class="modules-grid">
  @for (module of filteredModules(); track module.module) {
    <app-module-card
      [module]="module"
      (import)="openImportWizard($event)"
      (viewDetails)="openDetailsDialog($event)"
      (rollback)="confirmRollback($event)"
    />
  }
</div>
```

### 3. Add to Dashboard Styles

```scss
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}
```

## Full Dashboard Implementation Example

### Component Class

```typescript
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';

import { ModuleCardComponent, ImportModule } from './components/module-card/module-card.component';
import { SystemInitService } from './services/system-init.service';
import { ImportProgressService } from './services/import-progress.service';

@Component({
  selector: 'app-system-init-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    ModuleCardComponent,
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1>System Initialization Dashboard</h1>
          <p>Manage data imports and system setup</p>
        </div>
        <div class="header-actions">
          <button mat-button (click)="refreshData()">
            <mat-icon>refresh</mat-icon> Refresh
          </button>
          <button mat-button (click)="viewHistory()">
            <mat-icon>history</mat-icon> Import History
          </button>
          <button mat-button (click)="openSettings()">
            <mat-icon>settings</mat-icon> Settings
          </button>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-label">Total Modules</div>
          <div class="card-value">{{ dashboard()?.overview.totalModules || 0 }}</div>
        </div>
        <div class="overview-card">
          <div class="card-label">Completed</div>
          <div class="card-value completed">{{ dashboard()?.overview.completedModules || 0 }}</div>
        </div>
        <div class="overview-card">
          <div class="card-label">In Progress</div>
          <div class="card-value in-progress">{{ dashboard()?.overview.inProgressModules || 0 }}</div>
        </div>
        <div class="overview-card">
          <div class="card-label">Pending</div>
          <div class="card-value pending">{{ dashboard()?.overview.pendingModules || 0 }}</div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <mat-form-field appearance="outline">
          <mat-label>Filter by Domain</mat-label>
          <mat-select [formControl]="selectedDomain">
            <mat-option value="">All Domains</mat-option>
            @for (domain of availableDomains(); track domain) {
              <mat-option [value]="domain">{{ domain }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Filter by Status</mat-label>
          <mat-select [formControl]="selectedStatus">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="not_started">Not Started</mat-option>
            <mat-option value="in_progress">In Progress</mat-option>
            <mat-option value="completed">Completed</mat-option>
            <mat-option value="failed">Failed</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search Modules</mat-label>
          <input
            matInput
            [formControl]="searchTerm"
            placeholder="Search by name..."
            type="text"
          />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading modules...</p>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="error-state">
          <mat-icon>error</mat-icon>
          <p>{{ error() }}</p>
          <button mat-raised-button color="primary" (click)="refreshData()">
            Retry
          </button>
        </div>
      }

      <!-- Module Cards Grid -->
      @if (!loading() && !error()) {
        @if (filteredModules().length > 0) {
          <div class="modules-section">
            <h2>Available Modules ({{ filteredModules().length }})</h2>
            <div class="modules-grid">
              @for (module of filteredModules(); track module.module) {
                <app-module-card
                  [module]="module"
                  (import)="openImportWizard($event)"
                  (viewDetails)="openDetailsDialog($event)"
                  (rollback)="confirmRollback($event)"
                />
              }
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <mat-icon>inbox</mat-icon>
            <p>No modules match your filters</p>
            <button mat-stroked-button (click)="clearFilters()">
              Clear Filters
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        background-color: #fafafa;
        min-height: 100vh;
        padding: 20px;
      }

      .dashboard-container {
        max-width: 1600px;
        margin: 0 auto;
      }

      /* Header Styles */
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.06);

        .header-content {
          h1 {
            margin: 0 0 8px;
            font-size: 28px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.87);
          }

          p {
            margin: 0;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.54);
          }
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }
      }

      /* Overview Cards */
      .overview-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 40px;

        .overview-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.06);
          text-align: center;

          .card-label {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.54);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            font-weight: 500;
          }

          .card-value {
            font-size: 32px;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.87);

            &.completed {
              color: #4caf50;
            }

            &.in-progress {
              color: #2196f3;
            }

            &.pending {
              color: #ff9800;
            }
          }
        }
      }

      /* Filters Section */
      .filters-section {
        display: flex;
        gap: 16px;
        margin-bottom: 40px;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.06);
        flex-wrap: wrap;

        mat-form-field {
          flex: 1;
          min-width: 200px;

          &.search-field {
            flex-basis: 100%;
            max-width: 400px;
          }
        }
      }

      /* Loading State */
      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;

        p {
          margin-top: 20px;
          color: rgba(0, 0, 0, 0.6);
        }
      }

      /* Error State */
      .error-state {
        background: white;
        padding: 40px;
        border-radius: 8px;
        text-align: center;
        border-left: 4px solid #f44336;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #f44336;
          margin-bottom: 16px;
        }

        p {
          margin: 16px 0;
          font-size: 16px;
          color: rgba(0, 0, 0, 0.87);
        }
      }

      /* Empty State */
      .empty-state {
        background: white;
        padding: 60px 20px;
        border-radius: 8px;
        text-align: center;

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: rgba(0, 0, 0, 0.2);
          margin-bottom: 16px;
        }

        p {
          margin: 16px 0;
          font-size: 16px;
          color: rgba(0, 0, 0, 0.6);
        }
      }

      /* Modules Section */
      .modules-section {
        h2 {
          margin: 0 0 20px;
          font-size: 20px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.87);
        }
      }

      /* Modules Grid */
      .modules-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;

        @media (max-width: 1200px) {
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
          gap: 16px;
        }
      }

      /* Responsive */
      @media (max-width: 768px) {
        :host {
          padding: 16px;
        }

        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;

          .header-actions {
            width: 100%;
          }
        }

        .filters-section {
          flex-direction: column;

          mat-form-field {
            width: 100% !important;
          }
        }
      }
    `,
  ],
})
export class SystemInitDashboardPage implements OnInit {
  private systemInitService = inject(SystemInitService);
  private importProgressService = inject(ImportProgressService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // State signals
  modules = signal<ImportModule[]>([]);
  dashboard = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filter controls
  selectedDomain = new FormControl('');
  selectedStatus = new FormControl('');
  searchTerm = new FormControl('');

  // Computed signals
  filteredModules = computed(() => {
    let result = this.modules();

    // Filter by domain
    const domain = this.selectedDomain.value;
    if (domain) {
      result = result.filter(m => m.domain === domain);
    }

    // Filter by status
    const status = this.selectedStatus.value;
    if (status) {
      result = result.filter(m => m.importStatus === status);
    }

    // Filter by search term
    const term = this.searchTerm.value?.toLowerCase() || '';
    if (term) {
      result = result.filter(m =>
        m.displayName.toLowerCase().includes(term) ||
        m.module.toLowerCase().includes(term)
      );
    }

    return result;
  });

  availableDomains = computed(() => {
    const domains = new Set(this.modules().map(m => m.domain));
    return Array.from(domains).sort();
  });

  ngOnInit() {
    this.loadDashboard();
    this.setupAutoRefresh();
    this.setupFilterDebounce();
  }

  /**
   * Load dashboard data from API
   */
  private loadDashboard() {
    this.loading.set(true);
    this.error.set(null);

    this.systemInitService.getAvailableModules().subscribe({
      next: (response) => {
        this.modules.set(response.modules);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load modules. Please try again.');
        this.loading.set(false);
        this.snackBar.open('Failed to load dashboard', 'Close', {
          duration: 5000,
        });
      },
    });
  }

  /**
   * Auto-refresh dashboard every 30 seconds
   */
  private setupAutoRefresh() {
    setInterval(() => {
      this.loadDashboard();
    }, 30000);
  }

  /**
   * Debounce search input
   */
  private setupFilterDebounce() {
    this.searchTerm.valueChanges.pipe(debounceTime(300)).subscribe();
  }

  /**
   * Refresh data manually
   */
  refreshData() {
    this.loadDashboard();
    this.snackBar.open('Refreshing dashboard...', 'Close', {
      duration: 2000,
    });
  }

  /**
   * View import history
   */
  viewHistory() {
    // TODO: Open import history timeline component
    console.log('View history');
  }

  /**
   * Open settings dialog
   */
  openSettings() {
    // TODO: Open settings dialog
    console.log('Open settings');
  }

  /**
   * Open import wizard for a module
   */
  openImportWizard(module: ImportModule) {
    // TODO: Implement import wizard dialog
    console.log('Open import wizard for:', module.displayName);
  }

  /**
   * Open details/progress/errors dialog
   */
  openDetailsDialog(module: ImportModule) {
    if (module.importStatus === 'in_progress') {
      // Track and show progress
      this.importProgressService
        .trackProgress(module.module, module.lastImport?.jobId || '')
        .subscribe();
    }
    // TODO: Open details dialog based on status
    console.log('Open details for:', module.displayName);
  }

  /**
   * Confirm and execute rollback
   */
  confirmRollback(module: ImportModule) {
    const confirmDialog = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirm Rollback',
        message: `Are you sure you want to rollback the import for ${module.displayName}?`,
        confirmText: 'Rollback',
        cancelText: 'Cancel',
      },
    });

    confirmDialog.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        // TODO: Execute rollback API call
        console.log('Executing rollback for:', module.displayName);
        this.snackBar.open('Rollback started...', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.selectedDomain.reset('');
    this.selectedStatus.reset('');
    this.searchTerm.reset('');
  }
}

// Simple confirmation dialog component
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">
        {{ data.cancelText }}
      </button>
      <button mat-raised-button color="primary" (click)="dialogRef.close(true)">
        {{ data.confirmText }}
      </button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule],
})
export class ConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      confirmText: string;
      cancelText: string;
    }
  ) {}
}
```

## Event Handling Examples

### Import Handler

```typescript
openImportWizard(module: ImportModule) {
  const dialogRef = this.dialog.open(ImportWizardDialog, {
    width: '800px',
    data: { module },
    disableClose: true
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.success) {
      this.loadDashboard(); // Refresh after successful import
      this.snackBar.open(
        `${module.displayName} imported successfully!`,
        'Close',
        { duration: 5000 }
      );
    }
  });
}
```

### View Details Handler

```typescript
openDetailsDialog(module: ImportModule) {
  let dialogComponent: any;

  switch (module.importStatus) {
    case 'in_progress':
      dialogComponent = ProgressTrackerComponent;
      break;
    case 'completed':
      dialogComponent = ImportDetailsComponent;
      break;
    case 'failed':
      dialogComponent = ErrorDetailsComponent;
      break;
  }

  if (dialogComponent) {
    this.dialog.open(dialogComponent, {
      width: '600px',
      data: { module }
    });
  }
}
```

### Rollback Handler

```typescript
confirmRollback(module: ImportModule) {
  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '400px',
    data: {
      title: 'Confirm Rollback',
      message: `Roll back ${module.displayName} import?`,
      confirmText: 'Rollback',
      cancelText: 'Cancel'
    }
  });

  dialogRef.afterClosed().subscribe(confirmed => {
    if (confirmed && module.lastImport) {
      this.systemInitService
        .rollbackImport(module.module, module.lastImport.jobId)
        .subscribe({
          next: () => {
            this.loadDashboard();
            this.snackBar.open('Rollback completed', 'Close', {
              duration: 5000
            });
          },
          error: (err) => {
            this.snackBar.open('Rollback failed: ' + err.message, 'Close', {
              duration: 5000
            });
          }
        });
    }
  });
}
```

## Grid Layout Tips

### Responsive Grid with TailwindCSS

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
  @for (module of filteredModules(); track module.module) {
    <app-module-card
      [module]="module"
      (import)="openImportWizard($event)"
      (viewDetails)="openDetailsDialog($event)"
      (rollback)="confirmRollback($event)"
    />
  }
</div>
```

### Custom Grid Sizing

```html
<div style="
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 20px;
">
  @for (module of filteredModules(); track module.module) {
    <app-module-card [module]="module" />
  }
</div>
```

## Testing Integration

```typescript
describe('Dashboard with Module Card', () => {
  it('should display all modules in grid', () => {
    const modules = MOCK_DASHBOARD_MODULES;
    fixture.componentInstance.modules.set(modules);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(
      By.directive(ModuleCardComponent)
    );
    expect(cards.length).toBe(modules.length);
  });

  it('should filter modules correctly', () => {
    const modules = MOCK_DASHBOARD_MODULES;
    fixture.componentInstance.modules.set(modules);
    fixture.componentInstance.selectedDomain.setValue('inventory');
    fixture.detectChanges();

    const filtered = fixture.componentInstance.filteredModules();
    expect(filtered.every(m => m.domain === 'inventory')).toBeTruthy();
  });

  it('should emit import event', () => {
    spyOn(component, 'openImportWizard');
    const module = NOT_STARTED_MODULE;

    component.openImportWizard(module);
    expect(component.openImportWizard).toHaveBeenCalledWith(module);
  });
});
```

## Performance Considerations

1. **Virtual Scrolling**: For large module lists (50+), implement virtual scrolling:

```html
<cdk-virtual-scroll-viewport itemSize="300" class="modules-viewport">
  <div class="modules-grid">
    @for (module of filteredModules(); track module.module) {
      <app-module-card [module]="module" />
    }
  </div>
</cdk-virtual-scroll-viewport>
```

2. **OnPush Detection**: Ensure parent component also uses OnPush
3. **TrackBy**: Always use trackBy with @for loops
4. **Lazy Loading**: Load detailed module data on demand

## Troubleshooting

### Module Card Not Showing Status
- Verify module object has `importStatus` property
- Check that status value is one of: 'not_started', 'in_progress', 'completed', 'failed'

### Buttons Not Responding
- Ensure event handlers are bound correctly
- Check that module object is properly set
- Verify Material modules are imported

### Styling Issues
- Confirm Angular Material theme is loaded globally
- Check for CSS conflicts
- Verify TailwindCSS doesn't override Material styles

---

**Last Updated**: 2025-12-13
**Status**: Complete
