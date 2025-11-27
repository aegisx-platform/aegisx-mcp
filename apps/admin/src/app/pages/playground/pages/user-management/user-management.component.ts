import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive';
  createdAt: Date;
  lastLogin?: Date;
  department?: string;
}

export interface FilterPreset {
  name: string;
  icon: string;
  filters: {
    role?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  managers: number;
  users: number;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBadgeModule,
    MatDividerModule,
    MatButtonToggleModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent {
  displayedColumns: string[] = [
    'select',
    'user',
    'role',
    'status',
    'department',
    'lastLogin',
    'actions',
  ];

  dataSource: MatTableDataSource<User>;
  selection = new SelectionModel<User>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filter signals
  searchQuery = signal('');
  selectedRole = signal('');
  selectedStatus = signal('');
  selectedDepartment = signal('');
  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);
  showAdvancedFilters = signal(false);

  // Bulk action signals
  bulkActionInProgress = signal(false);
  bulkActionProgress = signal(0);

  // Filter presets
  filterPresets: FilterPreset[] = [
    {
      name: 'Active Admins',
      icon: 'admin_panel_settings',
      filters: { role: 'admin', status: 'active' },
    },
    {
      name: 'Inactive Users',
      icon: 'person_off',
      filters: { status: 'inactive' },
    },
    {
      name: 'New This Month',
      icon: 'new_releases',
      filters: { dateFrom: this.getFirstDayOfMonth(), dateTo: new Date() },
    },
    {
      name: 'All Managers',
      icon: 'supervisor_account',
      filters: { role: 'manager' },
    },
  ];

  // Sample data with more fields
  users: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active',
      department: 'Engineering',
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date('2025-11-10'),
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'manager',
      status: 'active',
      department: 'Sales',
      createdAt: new Date('2024-02-20'),
      lastLogin: new Date('2025-11-11'),
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'user',
      status: 'inactive',
      department: 'Marketing',
      createdAt: new Date('2024-03-10'),
      lastLogin: new Date('2025-10-15'),
    },
    {
      id: 4,
      name: 'Alice Williams',
      email: 'alice.williams@example.com',
      role: 'user',
      status: 'active',
      department: 'Engineering',
      createdAt: new Date('2024-04-05'),
      lastLogin: new Date('2025-11-12'),
    },
    {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      role: 'manager',
      status: 'active',
      department: 'HR',
      createdAt: new Date('2024-05-12'),
      lastLogin: new Date('2025-11-09'),
    },
    {
      id: 6,
      name: 'Diana Prince',
      email: 'diana.prince@example.com',
      role: 'admin',
      status: 'active',
      department: 'Engineering',
      createdAt: new Date('2024-06-18'),
      lastLogin: new Date('2025-11-12'),
    },
    {
      id: 7,
      name: 'Ethan Hunt',
      email: 'ethan.hunt@example.com',
      role: 'user',
      status: 'inactive',
      department: 'Operations',
      createdAt: new Date('2024-07-22'),
      lastLogin: new Date('2025-09-05'),
    },
    {
      id: 8,
      name: 'Fiona Green',
      email: 'fiona.green@example.com',
      role: 'user',
      status: 'active',
      department: 'Sales',
      createdAt: new Date('2024-08-30'),
      lastLogin: new Date('2025-11-11'),
    },
    {
      id: 9,
      name: 'George Miller',
      email: 'george.miller@example.com',
      role: 'manager',
      status: 'active',
      department: 'Finance',
      createdAt: new Date('2024-09-15'),
      lastLogin: new Date('2025-11-10'),
    },
    {
      id: 10,
      name: 'Hannah Lee',
      email: 'hannah.lee@example.com',
      role: 'user',
      status: 'active',
      department: 'Marketing',
      createdAt: new Date('2024-10-20'),
      lastLogin: new Date('2025-11-12'),
    },
  ];

  constructor(private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource(this.users);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Statistics calculation
  get stats(): UserStats {
    return {
      total: this.users.length,
      active: this.users.filter((u) => u.status === 'active').length,
      inactive: this.users.filter((u) => u.status === 'inactive').length,
      admins: this.users.filter((u) => u.role === 'admin').length,
      managers: this.users.filter((u) => u.role === 'manager').length,
      users: this.users.filter((u) => u.role === 'user').length,
    };
  }

  // Selection methods
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  // Filter methods
  applyFilters() {
    let filteredData = this.users;

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filteredData = filteredData.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.department?.toLowerCase().includes(query),
      );
    }

    if (this.selectedRole()) {
      filteredData = filteredData.filter(
        (user) => user.role === this.selectedRole(),
      );
    }

    if (this.selectedStatus()) {
      filteredData = filteredData.filter(
        (user) => user.status === this.selectedStatus(),
      );
    }

    if (this.selectedDepartment()) {
      filteredData = filteredData.filter(
        (user) => user.department === this.selectedDepartment(),
      );
    }

    if (this.dateFrom()) {
      filteredData = filteredData.filter(
        (user) => user.createdAt >= this.dateFrom()!,
      );
    }

    if (this.dateTo()) {
      filteredData = filteredData.filter(
        (user) => user.createdAt <= this.dateTo()!,
      );
    }

    this.dataSource.data = filteredData;
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedRole.set('');
    this.selectedStatus.set('');
    this.selectedDepartment.set('');
    this.dateFrom.set(null);
    this.dateTo.set(null);
    this.dataSource.data = this.users;
  }

  applyFilterPreset(preset: FilterPreset) {
    this.selectedRole.set(preset.filters.role || '');
    this.selectedStatus.set(preset.filters.status || '');
    this.dateFrom.set(preset.filters.dateFrom || null);
    this.dateTo.set(preset.filters.dateTo || null);
    this.applyFilters();
  }

  applyQuickFilter(value: string) {
    const preset = this.filterPresets.find((p) => p.name === value);
    if (preset) {
      this.applyFilterPreset(preset);
    }
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters.set(!this.showAdvancedFilters());
  }

  // Export methods (UI only - no implementation)
  exportExcel() {
    console.log('Export to Excel - UI only');
  }

  exportCSV() {
    console.log('Export to CSV - UI only');
  }

  exportPDF() {
    console.log('Export to PDF - UI only');
  }

  // Import method (UI only)
  importData() {
    console.log('Import data - UI only');
  }

  // Bulk action methods (UI only)
  async bulkDelete() {
    console.log(
      'Bulk delete selected users - UI only',
      this.selection.selected,
    );
    await this.simulateBulkAction();
  }

  async bulkChangeRole(role: string) {
    console.log('Bulk change role - UI only', role, this.selection.selected);
    await this.simulateBulkAction();
  }

  async bulkChangeStatus(status: string) {
    console.log(
      'Bulk change status - UI only',
      status,
      this.selection.selected,
    );
    await this.simulateBulkAction();
  }

  private async simulateBulkAction() {
    this.bulkActionInProgress.set(true);
    this.bulkActionProgress.set(0);

    for (let i = 0; i <= 100; i += 10) {
      this.bulkActionProgress.set(i);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.bulkActionInProgress.set(false);
    this.selection.clear();
  }

  // Style helper methods
  getRoleBadgeColor(role: string): string {
    switch (role) {
      case 'admin':
        return 'var(--ax-brand-default)';
      case 'manager':
        return '#f59e0b';
      case 'user':
        return '#6b7280';
      default:
        return 'var(--ax-text-body)';
    }
  }

  getStatusColor(status: string): string {
    return status === 'active' ? '#10b981' : '#ef4444';
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'admin':
        return 'admin_panel_settings';
      case 'manager':
        return 'supervisor_account';
      case 'user':
        return 'person';
      default:
        return 'person';
    }
  }

  // CRUD methods (UI only)
  onAddUser() {
    console.log('Add new user - UI only');
  }

  onEditUser(user: User) {
    console.log('Edit user - UI only', user);
  }

  onDeleteUser(user: User) {
    console.log('Delete user - UI only', user);
  }

  onViewUser(user: User) {
    console.log('View user details - UI only', user);
  }

  // Utility methods
  private getFirstDayOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  get departments(): string[] {
    return [
      ...new Set(this.users.map((u) => u.department).filter(Boolean)),
    ] as string[];
  }
}
