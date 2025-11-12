import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive';
  createdAt: Date;
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
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent {
  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'role',
    'status',
    'createdAt',
    'actions',
  ];
  dataSource: MatTableDataSource<User>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchQuery = '';
  selectedRole = '';
  selectedStatus = '';

  // Sample data
  users: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'manager',
      status: 'active',
      createdAt: new Date('2024-02-20'),
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'user',
      status: 'inactive',
      createdAt: new Date('2024-03-10'),
    },
    {
      id: 4,
      name: 'Alice Williams',
      email: 'alice.williams@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date('2024-04-05'),
    },
    {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      role: 'manager',
      status: 'active',
      createdAt: new Date('2024-05-12'),
    },
    {
      id: 6,
      name: 'Diana Prince',
      email: 'diana.prince@example.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2024-06-18'),
    },
    {
      id: 7,
      name: 'Ethan Hunt',
      email: 'ethan.hunt@example.com',
      role: 'user',
      status: 'inactive',
      createdAt: new Date('2024-07-22'),
    },
    {
      id: 8,
      name: 'Fiona Green',
      email: 'fiona.green@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date('2024-08-30'),
    },
  ];

  constructor(private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource(this.users);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilters() {
    let filteredData = this.users;

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredData = filteredData.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      );
    }

    // Role filter
    if (this.selectedRole) {
      filteredData = filteredData.filter(
        (user) => user.role === this.selectedRole,
      );
    }

    // Status filter
    if (this.selectedStatus) {
      filteredData = filteredData.filter(
        (user) => user.status === this.selectedStatus,
      );
    }

    this.dataSource.data = filteredData;
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.dataSource.data = this.users;
  }

  getRoleBadgeColor(role: string): string {
    switch (role) {
      case 'admin':
        return 'var(--aegisx-brand-default)';
      case 'manager':
        return '#f59e0b';
      case 'user':
        return '#6b7280';
      default:
        return 'var(--aegisx-text-body)';
    }
  }

  getStatusColor(status: string): string {
    return status === 'active' ? '#10b981' : '#ef4444';
  }

  onAddUser() {
    console.log('Add new user');
    // Open dialog for adding user
  }

  onEditUser(user: User) {
    console.log('Edit user:', user);
    // Open dialog for editing user
  }

  onDeleteUser(user: User) {
    console.log('Delete user:', user);
    // Show confirmation dialog and delete
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index > -1) {
      this.users.splice(index, 1);
      this.applyFilters();
    }
  }

  onViewUser(user: User) {
    console.log('View user details:', user);
    // Open dialog for viewing user details
  }

  exportData() {
    console.log('Export data');
    // Export to CSV/Excel
  }
}
