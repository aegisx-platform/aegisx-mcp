import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AxBreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';
import { CodePreviewComponent } from '../../../components/code-preview/code-preview.component';

@Component({
  selector: 'app-breadcrumb-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    AxBreadcrumbComponent,
    CodePreviewComponent,
  ],
  templateUrl: './breadcrumb-demo.component.html',
  styleUrls: ['./breadcrumb-demo.component.scss'],
})
export class BreadcrumbDemoComponent {
  // Basic breadcrumb
  basicBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Components', url: '/components' },
    { label: 'Breadcrumb' },
  ];

  // With icons
  iconBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'Products', url: '/products', icon: 'inventory_2' },
    { label: 'Electronics', url: '/products/electronics', icon: 'devices' },
    { label: 'Smartphones' },
  ];

  // Dashboard navigation
  dashboardBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard', icon: 'dashboard' },
    { label: 'Analytics', url: '/dashboard/analytics', icon: 'analytics' },
    {
      label: 'Reports',
      url: '/dashboard/analytics/reports',
      icon: 'assessment',
    },
    { label: 'Q4 2024 Summary' },
  ];

  // User management path
  userManagementBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin', url: '/admin', icon: 'admin_panel_settings' },
    { label: 'Users', url: '/admin/users', icon: 'people' },
    { label: 'Edit User' },
  ];

  // E-commerce path
  ecommerceBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Store', url: '/store', icon: 'store' },
    { label: 'Catalog', url: '/store/catalog', icon: 'category' },
    { label: 'Women', url: '/store/catalog/women', icon: 'person' },
    {
      label: 'Dresses',
      url: '/store/catalog/women/dresses',
      icon: 'checkroom',
    },
    { label: 'Summer Collection 2024' },
  ];

  // Settings path
  settingsBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Settings', url: '/settings', icon: 'settings' },
    { label: 'Account', url: '/settings/account', icon: 'account_circle' },
    { label: 'Security', url: '/settings/account/security', icon: 'security' },
    { label: 'Two-Factor Authentication' },
  ];

  // Project management
  projectBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Projects', url: '/projects', icon: 'folder' },
    { label: 'Frontend Redesign', url: '/projects/123', icon: 'brush' },
    { label: 'Tasks', url: '/projects/123/tasks', icon: 'task' },
    { label: 'TASK-456: Update Header Component' },
  ];

  onBreadcrumbClick(item: BreadcrumbItem): void {
    console.log('Breadcrumb clicked:', item.label, item.url);
  }

  // Code Examples
  basicBreadcrumbCode = `<!-- Basic Breadcrumb -->
<ax-breadcrumb
  [items]="breadcrumbs"
  (itemClick)="onBreadcrumbClick($event)"
></ax-breadcrumb>

<!-- Component TypeScript -->
breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', url: '/' },
  { label: 'Components', url: '/components' },
  { label: 'Breadcrumb' }
];`;

  iconBreadcrumbCode = `<!-- Breadcrumb with Icons -->
<ax-breadcrumb
  [items]="breadcrumbs"
  (itemClick)="onBreadcrumbClick($event)"
></ax-breadcrumb>

<!-- Component TypeScript -->
breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', url: '/', icon: 'home' },
  { label: 'Products', url: '/products', icon: 'inventory_2' },
  { label: 'Electronics', url: '/products/electronics', icon: 'devices' },
  { label: 'Smartphones' }
];`;

  customSeparatorCode = `<!-- Custom Separator -->
<ax-breadcrumb
  [items]="breadcrumbs"
  separator="›"
  (itemClick)="onBreadcrumbClick($event)"
></ax-breadcrumb>

<!-- Available Separators -->
separator="/"  <!-- Default -->
separator="›"  <!-- Arrow -->
separator=">"  <!-- Chevron -->
separator="•"  <!-- Dot -->`;

  dashboardExampleCode = `<!-- Dashboard Application -->
<ax-breadcrumb
  [items]="dashboardBreadcrumbs"
  (itemClick)="onBreadcrumbClick($event)"
></ax-breadcrumb>

<!-- Component TypeScript -->
dashboardBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Dashboard', url: '/dashboard', icon: 'dashboard' },
  { label: 'Analytics', url: '/dashboard/analytics', icon: 'analytics' },
  { label: 'Reports', url: '/dashboard/analytics/reports', icon: 'assessment' },
  { label: 'Q4 2024 Summary' }
];`;

  ecommerceExampleCode = `<!-- E-Commerce Navigation -->
<ax-breadcrumb
  [items]="ecommerceBreadcrumbs"
  (itemClick)="onBreadcrumbClick($event)"
></ax-breadcrumb>

<!-- Component TypeScript -->
ecommerceBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Store', url: '/store', icon: 'store' },
  { label: 'Catalog', url: '/store/catalog', icon: 'category' },
  { label: 'Women', url: '/store/catalog/women', icon: 'person' },
  { label: 'Dresses', url: '/store/catalog/women/dresses', icon: 'checkroom' },
  { label: 'Summer Collection 2024' }
];`;

  settingsExampleCode = `<!-- Settings Panel -->
<ax-breadcrumb
  [items]="settingsBreadcrumbs"
  (itemClick)="onBreadcrumbClick($event)"
></ax-breadcrumb>

<!-- Component TypeScript -->
settingsBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Settings', url: '/settings', icon: 'settings' },
  { label: 'Account', url: '/settings/account', icon: 'account_circle' },
  { label: 'Security', url: '/settings/account/security', icon: 'security' },
  { label: 'Two-Factor Authentication' }
];`;
}
