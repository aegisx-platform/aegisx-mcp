import {
  Component,
  Input,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Import AegisX UI Components for interactive demos
import { AegisxCardComponent, AegisxAlertComponent } from '@aegisx/ui';

interface InteractiveDemo {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

@Component({
  selector: 'app-interactive-demos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSliderModule,
    MatTabsModule,
    MatStepperModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    // AegisX UI Components
    AegisxCardComponent,
    AegisxAlertComponent,
  ],
  template: ` <div class="interactive-demos-section">
    <!-- Interactive Demos Header -->
    <div class="demo-header">
      <h3>
        <mat-icon>play_circle</mat-icon>
        Interactive Demos
      </h3>
      <p class="demo-description">
        Complete working examples that demonstrate real-world usage patterns,
        complex interactions, and best practices for building enterprise
        applications.
      </p>
    </div>

    <!-- Real Interactive Demos -->
    <div class="interactive-demo-sections">
      <!-- Multi-Step Form Demo -->
      <section class="demo-section">
        <h2 class="section-title">
          <mat-icon>assignment</mat-icon>
          Multi-Step Form Workflow
        </h2>
        <p class="section-description">
          Complete user registration form with validation, progress tracking,
          and dynamic steps.
        </p>

        <div class="demo-grid">
          <div class="demo-item full-width">
            <h4>User Registration Wizard</h4>
            <ax-card
              title="Create New Account"
              subtitle="Step {{ currentStep() + 1 }} of {{ totalSteps }}"
              appearance="elevated"
            >
              <mat-stepper
                [selectedIndex]="currentStep()"
                class="registration-stepper"
              >
                <!-- Personal Information Step -->
                <mat-step label="Personal Info">
                  <div class="step-content">
                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>First Name</mat-label>
                        <input
                          matInput
                          [(ngModel)]="formData.firstName"
                          placeholder="Enter your first name"
                          required
                        />
                        <mat-icon matSuffix>person</mat-icon>
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Last Name</mat-label>
                        <input
                          matInput
                          [(ngModel)]="formData.lastName"
                          placeholder="Enter your last name"
                          required
                        />
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email Address</mat-label>
                      <input
                        matInput
                        type="email"
                        [(ngModel)]="formData.email"
                        placeholder="your.email@company.com"
                        required
                      />
                      <mat-icon matSuffix>email</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Phone Number</mat-label>
                      <input
                        matInput
                        [(ngModel)]="formData.phone"
                        placeholder="+1 (555) 123-4567"
                      />
                      <mat-icon matSuffix>phone</mat-icon>
                    </mat-form-field>
                  </div>

                  <div class="step-actions">
                    <button
                      mat-raised-button
                      color="primary"
                      (click)="nextStep()"
                      [disabled]="!isPersonalStepValid()"
                    >
                      Next <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </mat-step>

                <!-- Account Details Step -->
                <mat-step label="Account Details">
                  <div class="step-content">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Username</mat-label>
                      <input
                        matInput
                        [(ngModel)]="formData.username"
                        placeholder="Choose a unique username"
                        required
                      />
                      <mat-icon matSuffix>account_circle</mat-icon>
                      <mat-hint>Must be at least 3 characters long</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Password</mat-label>
                      <input
                        matInput
                        [type]="hidePassword ? 'password' : 'text'"
                        [(ngModel)]="formData.password"
                        placeholder="Create a secure password"
                        required
                      />
                      <button
                        mat-icon-button
                        matSuffix
                        (click)="hidePassword = !hidePassword"
                        [attr.aria-label]="'Hide password'"
                      >
                        <mat-icon>{{
                          hidePassword ? 'visibility_off' : 'visibility'
                        }}</mat-icon>
                      </button>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Role</mat-label>
                      <mat-select [(ngModel)]="formData.role" required>
                        <mat-option value="user">User</mat-option>
                        <mat-option value="admin">Administrator</mat-option>
                        <mat-option value="manager">Manager</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Department</mat-label>
                      <mat-select [(ngModel)]="formData.department">
                        <mat-option value="engineering">Engineering</mat-option>
                        <mat-option value="marketing">Marketing</mat-option>
                        <mat-option value="sales">Sales</mat-option>
                        <mat-option value="hr">Human Resources</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="step-actions">
                    <button mat-button (click)="previousStep()">
                      <mat-icon>arrow_back</mat-icon> Previous
                    </button>
                    <button
                      mat-raised-button
                      color="primary"
                      (click)="nextStep()"
                      [disabled]="!isAccountStepValid()"
                    >
                      Next <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </mat-step>

                <!-- Preferences Step -->
                <mat-step label="Preferences">
                  <div class="step-content">
                    <h4>Notification Preferences</h4>
                    <div class="checkbox-group">
                      <mat-checkbox
                        [(ngModel)]="formData.preferences.emailNotifications"
                      >
                        Email notifications for important updates
                      </mat-checkbox>
                      <mat-checkbox
                        [(ngModel)]="formData.preferences.smsNotifications"
                      >
                        SMS notifications for urgent alerts
                      </mat-checkbox>
                      <mat-checkbox
                        [(ngModel)]="formData.preferences.pushNotifications"
                      >
                        Push notifications in the app
                      </mat-checkbox>
                    </div>

                    <h4>Communication Frequency</h4>
                    <mat-radio-group
                      [(ngModel)]="formData.preferences.frequency"
                      class="radio-group"
                    >
                      <mat-radio-button value="immediate"
                        >Immediate</mat-radio-button
                      >
                      <mat-radio-button value="daily"
                        >Daily digest</mat-radio-button
                      >
                      <mat-radio-button value="weekly"
                        >Weekly summary</mat-radio-button
                      >
                      <mat-radio-button value="never">Never</mat-radio-button>
                    </mat-radio-group>

                    <mat-checkbox [(ngModel)]="formData.preferences.newsletter">
                      Subscribe to our monthly newsletter
                    </mat-checkbox>
                  </div>

                  <div class="step-actions">
                    <button mat-button (click)="previousStep()">
                      <mat-icon>arrow_back</mat-icon> Previous
                    </button>
                    <button
                      mat-raised-button
                      color="primary"
                      (click)="nextStep()"
                    >
                      Review <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </mat-step>

                <!-- Review Step -->
                <mat-step label="Review & Submit">
                  <div class="step-content">
                    <h4>Review Your Information</h4>
                    <div class="review-section">
                      <div class="review-item">
                        <strong>Personal Information:</strong>
                        <p>
                          {{ formData.firstName }} {{ formData.lastName }}<br />
                          {{ formData.email }}<br />
                          {{ formData.phone }}
                        </p>
                      </div>

                      <div class="review-item">
                        <strong>Account Details:</strong>
                        <p>
                          Username: {{ formData.username }}<br />
                          Role: {{ formData.role }}<br />
                          Department: {{ formData.department }}
                        </p>
                      </div>

                      <div class="review-item">
                        <strong>Preferences:</strong>
                        <p>
                          Email:
                          {{
                            formData.preferences.emailNotifications
                              ? 'Yes'
                              : 'No'
                          }}<br />
                          SMS:
                          {{
                            formData.preferences.smsNotifications
                              ? 'Yes'
                              : 'No'
                          }}<br />
                          Frequency: {{ formData.preferences.frequency }}
                        </p>
                      </div>
                    </div>

                    <mat-checkbox [(ngModel)]="formData.termsAccepted" required>
                      I agree to the Terms of Service and Privacy Policy
                    </mat-checkbox>
                  </div>

                  <div class="step-actions">
                    <button mat-button (click)="previousStep()">
                      <mat-icon>arrow_back</mat-icon> Previous
                    </button>
                    <button
                      mat-raised-button
                      color="accent"
                      (click)="submitForm()"
                      [disabled]="!formData.termsAccepted"
                    >
                      <mat-icon>check</mat-icon> Create Account
                    </button>
                  </div>
                </mat-step>
              </mat-stepper>

              <div class="form-progress">
                <mat-progress-bar
                  mode="determinate"
                  [value]="getProgressPercentage()"
                ></mat-progress-bar>
                <p class="progress-text">
                  {{ getProgressPercentage() }}% Complete
                </p>
              </div>
            </ax-card>
          </div>
        </div>
      </section>

      <!-- Interactive Data Table Demo -->
      <section class="demo-section">
        <h2 class="section-title">
          <mat-icon>table_view</mat-icon>
          Interactive Data Table
        </h2>
        <p class="section-description">
          Data table with sorting, filtering, pagination, and inline editing
          capabilities.
        </p>

        <div class="demo-grid">
          <div class="demo-item full-width">
            <h4>Employee Management Table</h4>
            <ax-card
              title="Employee Directory"
              subtitle="{{ sampleEmployees.length }} employees"
              appearance="outlined"
            >
              <!-- Table Filters -->
              <div class="table-filters">
                <mat-form-field appearance="outline">
                  <mat-label>Search employees</mat-label>
                  <input
                    matInput
                    [(ngModel)]="tableFilter"
                    placeholder="Name, email, or department"
                  />
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Filter by Department</mat-label>
                  <mat-select [(ngModel)]="departmentFilter">
                    <mat-option value="">All Departments</mat-option>
                    <mat-option value="Engineering">Engineering</mat-option>
                    <mat-option value="Marketing">Marketing</mat-option>
                    <mat-option value="Sales">Sales</mat-option>
                    <mat-option value="HR">Human Resources</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Data Table -->
              <div class="table-container">
                <table
                  mat-table
                  [dataSource]="getFilteredEmployees()"
                  class="employees-table"
                  matSort
                >
                  <!-- Name Column -->
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>
                      Name
                    </th>
                    <td mat-cell *matCellDef="let employee">
                      <div class="employee-info">
                        <div class="avatar">{{ employee.name.charAt(0) }}</div>
                        <div class="details">
                          <div class="name">{{ employee.name }}</div>
                          <div class="email">{{ employee.email }}</div>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Department Column -->
                  <ng-container matColumnDef="department">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>
                      Department
                    </th>
                    <td mat-cell *matCellDef="let employee">
                      <mat-chip
                        [color]="getDepartmentColor(employee.department)"
                        >{{ employee.department }}</mat-chip
                      >
                    </td>
                  </ng-container>

                  <!-- Role Column -->
                  <ng-container matColumnDef="role">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>
                      Role
                    </th>
                    <td mat-cell *matCellDef="let employee">
                      {{ employee.role }}
                    </td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let employee">
                      <mat-chip
                        [class]="'status-' + employee.status.toLowerCase()"
                        >{{ employee.status }}</mat-chip
                      >
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let employee">
                      <button mat-icon-button (click)="editEmployee(employee)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button (click)="viewEmployee(employee)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button
                        mat-icon-button
                        color="warn"
                        (click)="deleteEmployee(employee)"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr
                    mat-row
                    *matRowDef="let row; columns: displayedColumns"
                  ></tr>
                </table>
              </div>

              <!-- Table Pagination -->
              <mat-paginator
                [pageSizeOptions]="[5, 10, 20]"
                showFirstLastButtons
              ></mat-paginator>
            </ax-card>
          </div>
        </div>
      </section>

      <!-- Dynamic Dashboard Demo -->
      <section class="demo-section">
        <h2 class="section-title">
          <mat-icon>dashboard_customize</mat-icon>
          Customizable Dashboard
        </h2>
        <p class="section-description">
          Interactive dashboard with draggable widgets, real-time updates, and
          personalization.
        </p>

        <div class="demo-grid">
          <div class="demo-item full-width">
            <h4>Executive Dashboard</h4>

            <!-- Dashboard Controls -->
            <div class="dashboard-controls">
              <button
                mat-raised-button
                color="primary"
                (click)="toggleEditMode()"
              >
                <mat-icon>{{ editMode() ? 'save' : 'edit' }}</mat-icon>
                {{ editMode() ? 'Save Layout' : 'Customize' }}
              </button>

              <button mat-button (click)="refreshDashboard()">
                <mat-icon>refresh</mat-icon>
                Refresh Data
              </button>

              <mat-form-field appearance="outline">
                <mat-label>Time Range</mat-label>
                <mat-select [(ngModel)]="selectedTimeRange">
                  <mat-option value="today">Today</mat-option>
                  <mat-option value="week">This Week</mat-option>
                  <mat-option value="month">This Month</mat-option>
                  <mat-option value="quarter">This Quarter</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Dashboard Widgets Grid -->
            <div class="dashboard-grid" [class.edit-mode]="editMode()">
              <!-- Revenue Widget -->
              <ax-card
                title="Revenue"
                subtitle="{{ selectedTimeRange }}"
                appearance="elevated"
                class="dashboard-widget revenue-widget"
              >
                <div class="metric-display">
                  <div class="metric-value">
                    {{ revenueData.current | number: '1.0-0' }}
                  </div>
                  <div
                    class="metric-change"
                    [class.positive]="revenueData.change > 0"
                  >
                    <mat-icon>{{
                      revenueData.change > 0 ? 'trending_up' : 'trending_down'
                    }}</mat-icon>
                    {{ revenueData.change }}%
                  </div>
                </div>
                <div class="metric-subtitle">vs. previous period</div>
              </ax-card>

              <!-- Users Widget -->
              <ax-card
                title="Active Users"
                subtitle="Current period"
                appearance="elevated"
                class="dashboard-widget users-widget"
              >
                <div class="metric-display">
                  <div class="metric-value">
                    {{ userData.current | number: '1.0-0' }}
                  </div>
                  <div
                    class="metric-change"
                    [class.positive]="userData.change > 0"
                  >
                    <mat-icon>{{
                      userData.change > 0 ? 'trending_up' : 'trending_down'
                    }}</mat-icon>
                    {{ userData.change }}%
                  </div>
                </div>
                <div class="user-breakdown">
                  <div class="breakdown-item">
                    <span class="label">New Users:</span>
                    <span class="value">{{ userData.new }}</span>
                  </div>
                  <div class="breakdown-item">
                    <span class="label">Returning:</span>
                    <span class="value">{{ userData.returning }}</span>
                  </div>
                </div>
              </ax-card>

              <!-- Performance Widget -->
              <ax-card
                title="System Performance"
                subtitle="Real-time metrics"
                appearance="elevated"
                class="dashboard-widget performance-widget"
              >
                <div class="performance-metrics">
                  <div class="metric-row">
                    <span class="metric-label">CPU Usage</span>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="performanceData.cpu"
                    ></mat-progress-bar>
                    <span class="metric-value">{{ performanceData.cpu }}%</span>
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Memory</span>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="performanceData.memory"
                    ></mat-progress-bar>
                    <span class="metric-value"
                      >{{ performanceData.memory }}%</span
                    >
                  </div>
                  <div class="metric-row">
                    <span class="metric-label">Disk I/O</span>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="performanceData.disk"
                    ></mat-progress-bar>
                    <span class="metric-value"
                      >{{ performanceData.disk }}%</span
                    >
                  </div>
                </div>
              </ax-card>

              <!-- Recent Activity Widget -->
              <ax-card
                title="Recent Activity"
                subtitle="Last 30 minutes"
                appearance="elevated"
                class="dashboard-widget activity-widget"
              >
                <div class="activity-list">
                  <div
                    *ngFor="let activity of recentActivities"
                    class="activity-item"
                  >
                    <mat-icon [class]="'activity-icon ' + activity.type">{{
                      activity.icon
                    }}</mat-icon>
                    <div class="activity-content">
                      <div class="activity-title">{{ activity.title }}</div>
                      <div class="activity-time">{{ activity.time }}</div>
                    </div>
                  </div>
                </div>
              </ax-card>
            </div>

            <div *ngIf="editMode()" class="edit-mode-notice">
              <ax-alert type="info" title="Customize Mode Active">
                Drag widgets to rearrange them. Click "Save Layout" when
                finished.
              </ax-alert>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>`,
  styleUrls: ['./interactive-demos.component.scss'],
})
export class InteractiveDemosComponent implements OnInit {
  @Input() searchQuery: string = '';
  @Input() theme: 'light' | 'dark' = 'light';

  // Multi-step form data
  formData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    username: 'johndoe',
    password: 'SecurePass123!',
    role: 'user',
    department: 'engineering',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      frequency: 'daily',
      newsletter: true,
    },
    termsAccepted: false,
  };

  // Form state
  hidePassword = true;
  currentStep = signal(0);
  totalSteps = 4;

  // Data table demo data
  tableFilter = '';
  departmentFilter = '';
  displayedColumns = ['name', 'department', 'role', 'status', 'actions'];

  sampleEmployees = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@company.com',
      department: 'Engineering',
      role: 'Senior Developer',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@company.com',
      department: 'Marketing',
      role: 'Marketing Manager',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Carol Davis',
      email: 'carol@company.com',
      department: 'Sales',
      role: 'Sales Representative',
      status: 'Inactive',
    },
    {
      id: 4,
      name: 'David Wilson',
      email: 'david@company.com',
      department: 'Engineering',
      role: 'DevOps Engineer',
      status: 'Active',
    },
    {
      id: 5,
      name: 'Emma Brown',
      email: 'emma@company.com',
      department: 'HR',
      role: 'HR Specialist',
      status: 'Active',
    },
    {
      id: 6,
      name: 'Frank Miller',
      email: 'frank@company.com',
      department: 'Engineering',
      role: 'Frontend Developer',
      status: 'Active',
    },
    {
      id: 7,
      name: 'Grace Taylor',
      email: 'grace@company.com',
      department: 'Marketing',
      role: 'Content Creator',
      status: 'Active',
    },
    {
      id: 8,
      name: 'Henry Clark',
      email: 'henry@company.com',
      department: 'Sales',
      role: 'Account Manager',
      status: 'Inactive',
    },
  ];

  // Dashboard demo data
  editMode = signal(false);
  selectedTimeRange = 'month';

  revenueData = {
    current: 245678,
    change: 12.5,
  };

  userData = {
    current: 15432,
    change: 8.3,
    new: 2341,
    returning: 13091,
  };

  performanceData = {
    cpu: 45,
    memory: 62,
    disk: 28,
  };

  recentActivities = [
    {
      icon: 'person_add',
      title: 'New user registered',
      time: '2 min ago',
      type: 'user',
    },
    {
      icon: 'shopping_cart',
      title: 'Order completed #12345',
      time: '5 min ago',
      type: 'order',
    },
    {
      icon: 'security',
      title: 'Security scan completed',
      time: '12 min ago',
      type: 'system',
    },
    {
      icon: 'backup',
      title: 'Database backup finished',
      time: '18 min ago',
      type: 'system',
    },
    {
      icon: 'bug_report',
      title: 'Bug report submitted',
      time: '25 min ago',
      type: 'issue',
    },
  ];

  ngOnInit() {
    // Simulate real-time updates for dashboard
    setInterval(() => {
      this.updateDashboardData();
    }, 30000); // Update every 30 seconds
  }

  // Multi-step form methods
  nextStep() {
    if (this.currentStep() < this.totalSteps - 1) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  previousStep() {
    if (this.currentStep() > 0) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  getProgressPercentage(): number {
    return ((this.currentStep() + 1) / this.totalSteps) * 100;
  }

  isPersonalStepValid(): boolean {
    return !!(
      this.formData.firstName &&
      this.formData.lastName &&
      this.formData.email
    );
  }

  isAccountStepValid(): boolean {
    return !!(
      this.formData.username &&
      this.formData.password &&
      this.formData.role
    );
  }

  // Simplified demo - no reactive forms

  submitForm() {
    console.log('Form submitted:', this.formData);
    alert('Account created successfully! This is a demo.');
  }

  // Data table methods
  getFilteredEmployees() {
    let filtered = this.sampleEmployees;

    if (this.tableFilter) {
      const filter = this.tableFilter.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(filter) ||
          emp.email.toLowerCase().includes(filter) ||
          emp.department.toLowerCase().includes(filter),
      );
    }

    if (this.departmentFilter) {
      filtered = filtered.filter(
        (emp) => emp.department === this.departmentFilter,
      );
    }

    return filtered;
  }

  getDepartmentColor(department: string): 'primary' | 'accent' | 'warn' {
    switch (department) {
      case 'Engineering':
        return 'primary';
      case 'Marketing':
        return 'accent';
      case 'Sales':
        return 'warn';
      default:
        return 'primary';
    }
  }

  editEmployee(employee: any) {
    console.log('Edit employee:', employee);
    alert(`Edit ${employee.name} - This is a demo`);
  }

  viewEmployee(employee: any) {
    console.log('View employee:', employee);
    alert(`View ${employee.name} details - This is a demo`);
  }

  deleteEmployee(employee: any) {
    console.log('Delete employee:', employee);
    if (confirm(`Delete ${employee.name}? This is a demo.`)) {
      alert('Employee deleted (demo)');
    }
  }

  // Dashboard methods
  toggleEditMode() {
    this.editMode.set(!this.editMode());
  }

  refreshDashboard() {
    console.log('Refreshing dashboard data...');
    this.updateDashboardData();
    alert('Dashboard data refreshed!');
  }

  private updateDashboardData() {
    // Simulate data updates
    this.revenueData.current += Math.floor(Math.random() * 1000) - 500;
    this.userData.current += Math.floor(Math.random() * 20) - 10;
    this.performanceData.cpu = Math.floor(Math.random() * 100);
    this.performanceData.memory = Math.floor(Math.random() * 100);
    this.performanceData.disk = Math.floor(Math.random() * 100);
  }
}
