import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {
  DocHeaderComponent,
  CodeTabsComponent,
} from '../../../../components/docs';
import { CodeTab } from '../../../../types/docs.types';

/**
 * Quick Start Page - Step-by-step guide to building first page
 * Location: docs/getting-started/quick-start
 */
@Component({
  selector: 'ax-quick-start-doc',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    DocHeaderComponent,
    CodeTabsComponent,
  ],
  templateUrl: './quick-start-doc.component.html',
  styleUrl: './quick-start-doc.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class QuickStartDocComponent {
  // Example 1: Simple Page
  readonly simpleComponent = `import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatButtonModule],
  template: \`
    <div class="page-container">
      <h1>Dashboard</h1>

      <mat-card>
        <mat-card-content>
          <h2>Welcome to AegisX</h2>
          <p>Get started building your application.</p>
          <button mat-raised-button color="primary">
            Get Started
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  \`,
  styles: \`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
  \`,
})
export class DashboardComponent {}`;

  // Example 2: KPI Dashboard
  readonly kpiDashboard = `import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-dashboard',
  imports: [MatCardModule, MatIconModule],
  template: \`
    <div class="dashboard-grid">
      <mat-card class="kpi-card">
        <mat-card-content>
          <div class="kpi-header">
            <span class="kpi-label">Total Revenue</span>
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="kpi-value">$45,231</div>
          <div class="kpi-change positive">+20.1% from last month</div>
        </mat-card-content>
      </mat-card>

      <mat-card class="kpi-card">
        <mat-card-content>
          <div class="kpi-header">
            <span class="kpi-label">Active Users</span>
            <mat-icon>people</mat-icon>
          </div>
          <div class="kpi-value">2,350</div>
          <div class="kpi-change positive">+15.3% from last month</div>
        </mat-card-content>
      </mat-card>
    </div>
  \`,
  styles: \`
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .kpi-label {
      font-size: 0.875rem;
      color: var(--ax-text-secondary);
      text-transform: uppercase;
      font-weight: 600;
    }

    .kpi-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--ax-text-heading);
      margin-bottom: 0.5rem;
    }

    .kpi-change {
      font-size: 0.875rem;

      &.positive {
        color: var(--ax-success-default);
      }
    }
  \`,
})
export class KpiDashboardComponent {}`;

  // Example 3: Form Page
  readonly formPage = `import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  template: \`
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <h2>User Profile</h2>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button">Cancel</button>
              <button mat-raised-button color="primary" type="submit">
                Save
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  \`,
  styles: \`
    .form-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 1rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }
  \`,
})
export class UserFormComponent {
  userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
    }
  }
}`;

  examples = [
    {
      title: 'Simple Page',
      description: 'Create a basic dashboard page',
      icon: 'dashboard',
      code: this.simpleComponent,
    },
    {
      title: 'KPI Dashboard',
      description: 'Build a metrics dashboard',
      icon: 'analytics',
      code: this.kpiDashboard,
    },
    {
      title: 'Form Page',
      description: 'Create a user profile form',
      icon: 'article',
      code: this.formPage,
    },
  ];

  // Code tabs for standardized preview
  simpleDashboardCode: CodeTab[] = [
    {
      label: 'dashboard.component.ts',
      language: 'typescript',
      code: this.simpleComponent,
    },
  ];

  kpiDashboardCode: CodeTab[] = [
    {
      label: 'kpi-dashboard.component.ts',
      language: 'typescript',
      code: this.kpiDashboard,
    },
  ];

  formPageCode: CodeTab[] = [
    {
      label: 'user-form.component.ts',
      language: 'typescript',
      code: this.formPage,
    },
  ];

  responsiveGridCode: CodeTab[] = [
    {
      label: 'SCSS',
      language: 'scss',
      code: `.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}`,
    },
  ];
}
