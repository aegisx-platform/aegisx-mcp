import {
  Component,
  Input,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';

import {
  ShowcaseDataService,
  ComponentExample,
} from '../services/showcase-data.service';
// Removed unused imports: CodeViewerComponent, ComponentPreviewComponent

// Import AegisX UI Components
import {
  AegisxCardComponent,
  AegisxAlertComponent,
  BreadcrumbComponent,
  AxLoadingBarComponent,
  AxNavigationComponent,
  UserMenuComponent,
} from '@aegisx/ui';

interface AegisxSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  components: ComponentExample[];
  expanded?: boolean;
}

@Component({
  selector: 'app-aegisx-ui-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatButtonToggleModule,
    // Removed unused imports
    // AegisX UI Components
    AegisxCardComponent,
    AegisxAlertComponent,
    BreadcrumbComponent,
    AxLoadingBarComponent,
    UserMenuComponent,
  ],
  template: `
    <div class="aegisx-ui-section">
      <!-- AegisX UI Demo Header -->
      <div class="demo-header">
        <h3>
          <mat-icon>architecture</mat-icon>
          AegisX UI Components Library
        </h3>
        <p class="demo-description">
          Custom enterprise-grade Angular components that extend Material Design with additional functionality.
          These components are part of the @aegisx/ui library and provide enhanced features for business applications.
        </p>
      </div>

      <!-- Real AegisX UI Components Demo -->
      <div class="aegisx-demo-sections">
        
        <!-- AegisX Card Component Demo -->
        <section class="demo-section">
          <h2 class="section-title">
            <mat-icon>view_module</mat-icon>
            AegisX Card Component
          </h2>
          <p class="section-description">Enhanced card component with additional styling and features.</p>
          
          <div class="demo-grid">
            <div class="demo-item">
              <h4>Standard AegisX Card</h4>
              <ax-card 
                title="Sample Card" 
                subtitle="AegisX UI Component"
                appearance="outlined">
                <p>This is an AegisX card component that provides additional features beyond standard Material cards.</p>
                <div class="card-actions">
                  <button mat-raised-button color="primary">Primary Action</button>
                  <button mat-button>Secondary</button>
                </div>
              </ax-card>
            </div>

            <div class="demo-item">
              <h4>Elevated AegisX Card</h4>
              <ax-card 
                title="Elevated Card" 
                subtitle="With Shadow"
                appearance="elevated">
                <p>This card has elevated styling with enhanced shadows and spacing.</p>
                <div class="card-stats">
                  <div class="stat-item">
                    <span class="stat-number">24</span>
                    <span class="stat-label">Active Users</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">156</span>
                    <span class="stat-label">Total Sessions</span>
                  </div>
                </div>
              </ax-card>
            </div>
          </div>
        </section>

        <!-- AegisX Alert Component Demo -->
        <section class="demo-section">
          <h2 class="section-title">
            <mat-icon>announcement</mat-icon>
            AegisX Alert Component
          </h2>
          <p class="section-description">Customizable alert component with multiple variants and actions.</p>
          
          <div class="demo-grid">
            <div class="demo-item">
              <h4>Alert Variants</h4>
              <div class="alert-stack">
                <ax-alert 
                  type="success" 
                  title="Success Alert"
                  [dismissible]="true">
                  Operation completed successfully!
                </ax-alert>
                
                <ax-alert 
                  type="warning" 
                  title="Warning Alert"
                  [dismissible]="true">
                  Please review your settings before proceeding.
                </ax-alert>
                
                <ax-alert 
                  type="error" 
                  title="Error Alert"
                  [dismissible]="true">
                  An error occurred while processing your request.
                </ax-alert>
                
                <ax-alert 
                  type="info" 
                  title="Information"
                  [dismissible]="true">
                  New features are now available in your dashboard.
                </ax-alert>
              </div>
            </div>
          </div>
        </section>

        <!-- Breadcrumb Component Demo -->
        <section class="demo-section">
          <h2 class="section-title">
            <mat-icon>navigation</mat-icon>
            Breadcrumb Navigation
          </h2>
          <p class="section-description">Enhanced breadcrumb component for navigation hierarchy.</p>
          
          <div class="demo-grid">
            <div class="demo-item">
              <h4>Standard Breadcrumb</h4>
              <ax-breadcrumb [items]="breadcrumbItems"></ax-breadcrumb>
            </div>

            <div class="demo-item">
              <h4>Interactive Breadcrumb</h4>
              <ax-breadcrumb 
                [items]="complexBreadcrumbItems" 
                [showIcons]="true"
                [maxItems]="4">
              </ax-breadcrumb>
            </div>
          </div>
        </section>

        <!-- Loading Components Demo -->
        <section class="demo-section">
          <h2 class="section-title">
            <mat-icon>hourglass_empty</mat-icon>
            Loading Components
          </h2>
          <p class="section-description">Loading indicators and progress components.</p>
          
          <div class="demo-grid">
            <div class="demo-item">
              <h4>AegisX Loading Bar</h4>
              <div class="loading-demo">
                <div *ngIf="showLoadingBar()">
                  <ax-loading-bar></ax-loading-bar>
                </div>
                <div class="loading-controls">
                  <button mat-raised-button (click)="toggleLoadingBar()">
                    {{ showLoadingBar() ? 'Hide' : 'Show' }} Loading Bar
                  </button>
                  <p class="loading-note">
                    This loading bar is positioned fixed at the top of the page when active.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- User Menu Component Demo -->
        <section class="demo-section">
          <h2 class="section-title">
            <mat-icon>account_circle</mat-icon>
            User Menu Component
          </h2>
          <p class="section-description">Enterprise user menu with avatar, actions, and profile options.</p>
          
          <div class="demo-grid">
            <div class="demo-item">
              <h4>User Menu</h4>
              <div class="user-menu-demo">
                <ax-user-menu>
                  <!-- User menu will use default settings -->
                </ax-user-menu>
              </div>
            </div>
          </div>
        </section>

        <!-- Integration Examples -->
        <section class="demo-section">
          <h2 class="section-title">
            <mat-icon>integration_instructions</mat-icon>
            Integration Examples
          </h2>
          <p class="section-description">Real-world usage examples combining multiple AegisX UI components.</p>
          
          <div class="demo-grid">
            <div class="demo-item full-width">
              <h4>Dashboard Widget Example</h4>
              <ax-card 
                title="Monthly Revenue" 
                subtitle="Analytics Dashboard"
                appearance="outlined">
                
                <div class="widget-content">
                  <div class="revenue-display">
                    <span class="revenue-amount">$24,567</span>
                    <span class="revenue-change positive">+12.5%</span>
                  </div>
                  
                  <ax-alert 
                    type="success" 
                    title="Target Achieved"
                    [dismissible]="false">
                    Monthly revenue target exceeded by 8.3%
                  </ax-alert>
                </div>
                
                <div class="widget-actions">
                  <button mat-button>View Details</button>
                  <button mat-raised-button color="primary">Generate Report</button>
                </div>
              </ax-card>
            </div>
          </div>
        </section>

      </div>
    </div>`,
  styleUrls: ['./aegisx-ui-section.component.scss'],
})
export class AegisxUiSectionComponent implements OnInit {
  @Input() searchQuery: string = '';
  @Input() theme: 'light' | 'dark' = 'light';

  // Signals for interactive controls
  showLoadingBar = signal(false);

  // Demo data
  breadcrumbItems = [
    {
      id: 'home',
      title: 'Home',
      icon: 'home',
      link: '/',
      type: 'basic' as const,
    },
    {
      id: 'products',
      title: 'Products',
      link: '/products',
      type: 'basic' as const,
    },
    {
      id: 'electronics',
      title: 'Electronics',
      link: '/products/electronics',
      type: 'basic' as const,
    },
    { id: 'phones', title: 'Mobile Phones', type: 'basic' as const },
  ];

  complexBreadcrumbItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
      link: '/dashboard',
      type: 'basic' as const,
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'analytics',
      link: '/analytics',
      type: 'basic' as const,
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'assessment',
      link: '/analytics/reports',
      type: 'basic' as const,
    },
    {
      id: 'sales',
      title: 'Sales Report',
      icon: 'trending_up',
      link: '/analytics/reports/sales',
      type: 'basic' as const,
    },
    { id: 'monthly', title: 'Monthly Sales', type: 'basic' as const },
  ];

  demoUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'Administrator',
    department: 'Engineering',
  };

  ngOnInit() {
    // Initialize demo
  }

  // Interactive demo methods
  toggleLoadingBar() {
    this.showLoadingBar.set(!this.showLoadingBar());
  }
}
