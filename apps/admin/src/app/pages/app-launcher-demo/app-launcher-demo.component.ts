import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AxEnterpriseLayoutComponent,
  AxNavigationItem,
  AxBreadcrumbComponent,
  BreadcrumbItem,
  AxLauncherComponent,
  LauncherApp,
  LauncherCategory,
  LauncherUserContext,
  LauncherConfig,
  LauncherAppClickEvent,
  LauncherMenuActionEvent,
} from '@aegisx/ui';

@Component({
  selector: 'ax-app-launcher-demo',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    AxEnterpriseLayoutComponent,
    AxBreadcrumbComponent,
    AxLauncherComponent,
  ],
  template: `
    <ax-enterprise-layout
      [appName]="'App Launcher'"
      [navigation]="navigation"
      [showFooter]="true"
      [headerTheme]="'dark'"
      [contentBackground]="'gray'"
      (logoutClicked)="onLogout()"
    >
      <!-- Header Actions -->
      <ng-template #headerActions>
        <button mat-icon-button matTooltip="Notifications">
          <mat-icon>notifications</mat-icon>
        </button>
        <button mat-icon-button matTooltip="Settings">
          <mat-icon>settings</mat-icon>
        </button>
      </ng-template>

      <!-- Main Content -->
      <div class="launcher-content">
        <!-- Breadcrumb -->
        <ax-breadcrumb
          [items]="breadcrumbItems"
          separatorIcon="chevron_right"
          size="sm"
        ></ax-breadcrumb>

        <!-- App Launcher Component -->
        <ax-launcher
          [apps]="apps()"
          [categories]="categories"
          [userContext]="userContext()"
          [config]="launcherConfig"
          title="Active Applications"
          subtitle="Click on an app to launch it"
          (appClick)="onAppClick($event)"
          (menuAction)="onMenuAction($event)"
        />

        <!-- Demo Controls -->
        <div class="demo-controls">
          <h3>Demo Controls</h3>
          <div class="control-row">
            <span>Current User Role:</span>
            <select (change)="onRoleChange($event)">
              <option value="admin">Admin (sees all apps)</option>
              <option value="manager">Manager (sees business apps)</option>
              <option value="developer">Developer (sees dev tools)</option>
              <option value="user">User (limited access)</option>
            </select>
          </div>
          <p class="demo-hint">
            Change the role to see how RBAC filters apps based on permissions.
          </p>
        </div>

        <!-- Info Box -->
        <div class="info-card">
          <mat-icon class="info-icon">info</mat-icon>
          <div class="info-text">
            <strong>ax-launcher Component Features</strong>
            <ul>
              <li>
                <strong>Pin to Top:</strong> Hover over any card and click the
                pin icon to pin it to the top of Featured tab
              </li>
              <li>
                <strong>Favorites:</strong> Click the star icon to add apps to
                favorites (stored in localStorage)
              </li>
              <li>
                <strong>RBAC Support:</strong> Apps are filtered based on user
                roles and permissions
              </li>
              <li>
                <strong>Categories:</strong> Apps are grouped by category with
                tab navigation
              </li>
              <li>
                <strong>Status Management:</strong> Apps can be active, beta,
                new, maintenance, coming soon, or disabled
              </li>
              <li>
                <strong>Search:</strong> Real-time search across app names,
                descriptions, and tags
              </li>
              <li>
                <strong>Responsive:</strong> Grid adjusts based on screen size
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer Content -->
      <ng-template #footerContent>
        <span>App Launcher Demo - AegisX Design System</span>
        <a mat-button routerLink="/docs/components/aegisx/layout/enterprise">
          View Documentation
        </a>
      </ng-template>
    </ax-enterprise-layout>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }

    .launcher-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Demo Controls */
    .demo-controls {
      padding: 1.25rem;
      background: var(--ax-background-default, #fff);
      border: 1px solid var(--ax-border-default, #e5e7eb);
      border-radius: var(--ax-radius-lg, 12px);

      h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 0 0 1rem;
      }

      .control-row {
        display: flex;
        align-items: center;
        gap: 1rem;

        span {
          font-size: 0.9375rem;
          color: var(--ax-text-secondary);
        }

        select {
          padding: 0.5rem 1rem;
          border: 1px solid var(--ax-border-default);
          border-radius: var(--ax-radius-md);
          font-size: 0.9375rem;
          background: var(--ax-background-default);
          color: var(--ax-text-default);
          cursor: pointer;

          &:focus {
            outline: 2px solid var(--ax-brand-default);
            outline-offset: 2px;
          }
        }
      }

      .demo-hint {
        margin: 0.75rem 0 0;
        font-size: 0.8125rem;
        color: var(--ax-text-muted);
      }
    }

    /* Info Card */
    .info-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--ax-info-faint);
      border: 1px solid var(--ax-info-200);
      border-radius: var(--ax-radius-lg);
    }

    .info-icon {
      color: var(--ax-info-default);
      font-size: 24px;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .info-text {
      strong {
        color: var(--ax-info-700);
        font-size: 1rem;
      }

      ul {
        margin: 0.75rem 0 0;
        padding-left: 1.25rem;

        li {
          font-size: 0.9375rem;
          color: var(--ax-info-700);
          line-height: 1.6;
          margin-bottom: 0.25rem;

          strong {
            font-size: 0.9375rem;
          }
        }
      }
    }
  `,
})
export class AppLauncherDemoComponent {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'Demos', url: '/enterprise-demo' },
    { label: 'App Launcher' },
  ];

  navigation: AxNavigationItem[] = [
    { id: 'apps', title: 'All Apps', link: '/app-launcher-demo', icon: 'apps' },
    {
      id: 'recent',
      title: 'Recent',
      link: '/app-launcher-demo',
      icon: 'history',
    },
    {
      id: 'favorites',
      title: 'Favorites',
      link: '/app-launcher-demo',
      icon: 'star',
    },
    {
      id: 'categories',
      title: 'Categories',
      icon: 'category',
      children: [
        { id: 'his', title: 'HIS', link: '/app-launcher-demo' },
        { id: 'inventory', title: 'Inventory', link: '/app-launcher-demo' },
        { id: 'finance', title: 'Finance', link: '/app-launcher-demo' },
        { id: 'hr', title: 'HR & Admin', link: '/app-launcher-demo' },
        { id: 'erp', title: 'ERP', link: '/app-launcher-demo' },
        { id: 'reports', title: 'Reports', link: '/app-launcher-demo' },
      ],
    },
  ];

  // Categories - Hospital ERP System
  categories: LauncherCategory[] = [
    { id: 'his', name: 'HIS', icon: 'local_hospital', order: 1 },
    { id: 'inventory', name: 'Inventory', icon: 'inventory_2', order: 2 },
    { id: 'finance', name: 'Finance', icon: 'account_balance', order: 3 },
    { id: 'hr', name: 'HR & Admin', icon: 'people', order: 4 },
    { id: 'erp', name: 'ERP', icon: 'hub', order: 5 },
    { id: 'reports', name: 'Reports', icon: 'assessment', order: 6 },
  ];

  // Launcher config
  launcherConfig: Partial<LauncherConfig> = {
    showSearch: true,
    showCategoryTabs: true,
    showViewToggle: false,
    enableFavorites: true,
    enableRecent: true,
    cardMinWidth: 240,
    cardGap: 20,
  };

  // User context (for RBAC demo)
  userContext = signal<LauncherUserContext>({
    roles: ['admin'],
    permissions: ['apps:view', 'apps:manage'],
    isAdmin: true,
  });

  // Apps - Hospital ERP System
  apps = signal<LauncherApp[]>([
    // ============================================
    // HIS - Hospital Information System
    // ============================================
    {
      id: 'opd',
      name: 'OPD - ผู้ป่วยนอก',
      description: 'ระบบลงทะเบียน นัดหมาย และบริการผู้ป่วยนอก',
      icon: 'person',
      route: '/his-demo',
      color: 'pink',
      categoryId: 'his',
      status: 'active',
      enabled: true,
      notificationCount: 24,
      featured: true,
      size: 'xl',
      usageCount: 350,
      permission: { viewRoles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    },
    {
      id: 'ipd',
      name: 'IPD - ผู้ป่วยใน',
      description: 'ระบบบริหารจัดการผู้ป่วยใน Ward และห้องพัก',
      icon: 'hotel',
      route: '/his-demo',
      color: 'rose',
      categoryId: 'his',
      status: 'active',
      enabled: true,
      notificationCount: 8,
      featured: true,
      size: 'lg',
      usageCount: 220,
      permission: { viewRoles: ['admin', 'doctor', 'nurse'] },
    },
    {
      id: 'emr',
      name: 'EMR - เวชระเบียน',
      description: 'ระบบเวชระเบียนอิเล็กทรอนิกส์และประวัติผู้ป่วย',
      icon: 'folder_shared',
      route: '/his-demo',
      color: 'lavender',
      categoryId: 'his',
      status: 'active',
      enabled: true,
      featured: true,
      size: 'lg',
      usageCount: 280,
      permission: { viewRoles: ['admin', 'doctor', 'nurse'] },
    },
    {
      id: 'pharmacy',
      name: 'Pharmacy - เภสัชกรรม',
      description: 'ระบบจ่ายยา ตรวจสอบยา และคลังยา',
      icon: 'medication',
      route: '/his-demo',
      color: 'mint',
      categoryId: 'his',
      status: 'active',
      enabled: true,
      notificationCount: 15,
      featured: true,
      size: 'md',
      usageCount: 180,
      permission: { viewRoles: ['admin', 'pharmacist', 'doctor'] },
    },
    {
      id: 'lab',
      name: 'Lab - ห้องปฏิบัติการ',
      description: 'ระบบส่งตรวจและรายงานผลแล็บ',
      icon: 'biotech',
      route: '/his-demo',
      color: 'cyan',
      categoryId: 'his',
      status: 'active',
      enabled: true,
      notificationCount: 12,
      permission: { viewRoles: ['admin', 'lab_tech', 'doctor', 'nurse'] },
    },
    {
      id: 'radiology',
      name: 'Radiology - รังสีวิทยา',
      description: 'ระบบ X-Ray, CT, MRI และการอ่านผล',
      icon: 'radiology',
      route: '/his-demo',
      color: 'blue',
      categoryId: 'his',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'radiologist', 'doctor'] },
    },
    {
      id: 'or',
      name: 'OR - ห้องผ่าตัด',
      description: 'ระบบจองห้องผ่าตัดและบันทึกการผ่าตัด',
      icon: 'medical_services',
      route: '/his-demo',
      color: 'peach',
      categoryId: 'his',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'doctor', 'nurse'] },
    },
    {
      id: 'er',
      name: 'ER - ห้องฉุกเฉิน',
      description: 'ระบบคัดกรองและบริการผู้ป่วยฉุกเฉิน',
      icon: 'emergency',
      route: '/his-demo',
      color: 'yellow',
      categoryId: 'his',
      status: 'active',
      enabled: true,
      notificationCount: 3,
      permission: { viewRoles: ['admin', 'doctor', 'nurse'] },
    },
    {
      id: 'appointment',
      name: 'Appointment - นัดหมาย',
      description: 'ระบบนัดหมายแพทย์และจัดตารางคลินิก',
      icon: 'event',
      route: '/his-demo',
      color: 'white',
      categoryId: 'his',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    },
    {
      id: 'nursing',
      name: 'Nursing - การพยาบาล',
      description: 'ระบบบันทึกทางการพยาบาลและ Vital Signs',
      icon: 'healing',
      route: '/his-demo',
      color: 'pink',
      categoryId: 'his',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'nurse'] },
    },

    // ============================================
    // Inventory & Supply Chain
    // ============================================
    {
      id: 'inv-main',
      name: 'Inventory - คลังพัสดุ',
      description: 'ระบบจัดการคลังพัสดุและวัสดุสิ้นเปลือง',
      icon: 'inventory_2',
      route: '/inventory-demo',
      color: 'mint',
      categoryId: 'inventory',
      status: 'active',
      enabled: true,
      notificationCount: 5,
      featured: true,
      size: 'lg',
      usageCount: 150,
      permission: { viewRoles: ['admin', 'inventory_staff', 'manager'] },
    },
    {
      id: 'drug-store',
      name: 'Drug Store - คลังยา',
      description: 'ระบบบริหารคลังยาและเวชภัณฑ์',
      icon: 'vaccines',
      route: '/inventory-demo',
      color: 'rose',
      categoryId: 'inventory',
      status: 'active',
      enabled: true,
      notificationCount: 8,
      featured: true,
      size: 'md',
      usageCount: 120,
      permission: { viewRoles: ['admin', 'pharmacist', 'inventory_staff'] },
    },
    {
      id: 'medical-supply',
      name: 'Medical Supply - เวชภัณฑ์',
      description: 'ระบบจัดการเวชภัณฑ์และอุปกรณ์การแพทย์',
      icon: 'medical_information',
      route: '/inventory-demo',
      color: 'lavender',
      categoryId: 'inventory',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'inventory_staff', 'nurse'] },
    },
    {
      id: 'purchase-order',
      name: 'PO - ใบสั่งซื้อ',
      description: 'ระบบจัดทำและติดตามใบสั่งซื้อ',
      icon: 'shopping_cart',
      route: '/inventory-demo',
      color: 'blue',
      categoryId: 'inventory',
      status: 'active',
      enabled: true,
      notificationCount: 3,
      permission: { viewRoles: ['admin', 'purchasing', 'manager'] },
    },
    {
      id: 'goods-receive',
      name: 'GR - รับสินค้า',
      description: 'ระบบรับสินค้าและตรวจสอบคุณภาพ',
      icon: 'local_shipping',
      route: '/inventory-demo',
      color: 'peach',
      categoryId: 'inventory',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'inventory_staff', 'purchasing'] },
    },
    {
      id: 'asset-mgmt',
      name: 'Asset - ทรัพย์สิน',
      description: 'ระบบจัดการครุภัณฑ์และทรัพย์สินถาวร',
      icon: 'category',
      route: '/inventory-demo',
      color: 'cyan',
      categoryId: 'inventory',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'asset_staff', 'manager'] },
    },

    // ============================================
    // Finance & Accounting
    // ============================================
    {
      id: 'billing',
      name: 'Billing - การเงินผู้ป่วย',
      description: 'ระบบคิดเงิน ชำระเงิน และออกใบเสร็จ',
      icon: 'point_of_sale',
      route: '/enterprise-demo',
      color: 'mint',
      categoryId: 'finance',
      status: 'active',
      enabled: true,
      notificationCount: 18,
      featured: true,
      size: 'xl',
      usageCount: 300,
      permission: { viewRoles: ['admin', 'cashier', 'finance'] },
    },
    {
      id: 'claim',
      name: 'Claim - เบิกจ่าย',
      description: 'ระบบเบิกจ่ายประกันสังคม/สิทธิ์รักษา',
      icon: 'request_quote',
      route: '/enterprise-demo',
      color: 'blue',
      categoryId: 'finance',
      status: 'active',
      enabled: true,
      notificationCount: 45,
      featured: true,
      size: 'lg',
      usageCount: 180,
      permission: { viewRoles: ['admin', 'claim_staff', 'finance'] },
    },
    {
      id: 'gl',
      name: 'GL - บัญชีแยกประเภท',
      description: 'ระบบบัญชีแยกประเภททั่วไป',
      icon: 'account_balance',
      route: '/enterprise-demo',
      color: 'lavender',
      categoryId: 'finance',
      status: 'active',
      enabled: true,
      featured: true,
      size: 'md',
      usageCount: 90,
      permission: { viewRoles: ['admin', 'accountant', 'finance'] },
    },
    {
      id: 'ap',
      name: 'AP - เจ้าหนี้',
      description: 'ระบบบัญชีเจ้าหนี้และการจ่ายชำระ',
      icon: 'payments',
      route: '/enterprise-demo',
      color: 'peach',
      categoryId: 'finance',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'accountant', 'finance'] },
    },
    {
      id: 'ar',
      name: 'AR - ลูกหนี้',
      description: 'ระบบบัญชีลูกหนี้และติดตามหนี้',
      icon: 'receipt_long',
      route: '/enterprise-demo',
      color: 'rose',
      categoryId: 'finance',
      status: 'active',
      enabled: true,
      notificationCount: 7,
      permission: { viewRoles: ['admin', 'accountant', 'finance'] },
    },
    {
      id: 'budget',
      name: 'Budget - งบประมาณ',
      description: 'ระบบจัดทำและควบคุมงบประมาณ',
      icon: 'savings',
      route: '/enterprise-demo',
      color: 'yellow',
      categoryId: 'finance',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'accountant', 'manager'] },
    },
    {
      id: 'cost-center',
      name: 'Cost Center - ศูนย์ต้นทุน',
      description: 'ระบบจัดการศูนย์ต้นทุนและการปันส่วน',
      icon: 'pie_chart',
      route: '/enterprise-demo',
      color: 'cyan',
      categoryId: 'finance',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'accountant', 'manager'] },
    },
    {
      id: 'tax',
      name: 'Tax - ภาษี',
      description: 'ระบบจัดการภาษีและรายงานภาษี',
      icon: 'receipt',
      route: '/enterprise-demo',
      color: 'white',
      categoryId: 'finance',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'accountant'] },
    },

    // ============================================
    // HR & Admin
    // ============================================
    {
      id: 'employee',
      name: 'Employee - พนักงาน',
      description: 'ระบบข้อมูลพนักงานและประวัติการทำงาน',
      icon: 'badge',
      route: '/playground/pages/user-management',
      color: 'blue',
      categoryId: 'hr',
      status: 'active',
      enabled: true,
      featured: true,
      size: 'lg',
      usageCount: 100,
      permission: { viewRoles: ['admin', 'hr'] },
    },
    {
      id: 'payroll',
      name: 'Payroll - เงินเดือน',
      description: 'ระบบคำนวณและจ่ายเงินเดือน',
      icon: 'paid',
      route: '/playground/pages/user-management',
      color: 'mint',
      categoryId: 'hr',
      status: 'active',
      enabled: true,
      featured: true,
      size: 'md',
      usageCount: 80,
      permission: { viewRoles: ['admin', 'hr', 'finance'] },
    },
    {
      id: 'attendance',
      name: 'Attendance - ลงเวลา',
      description: 'ระบบลงเวลาทำงานและสแกนนิ้ว',
      icon: 'schedule',
      route: '/playground/pages/user-management',
      color: 'peach',
      categoryId: 'hr',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'hr'] },
    },
    {
      id: 'leave',
      name: 'Leave - ลางาน',
      description: 'ระบบขออนุมัติลาและบริหารวันลา',
      icon: 'event_busy',
      route: '/playground/pages/user-management',
      color: 'lavender',
      categoryId: 'hr',
      status: 'active',
      enabled: true,
      notificationCount: 4,
      permission: { viewRoles: ['admin', 'hr', 'manager'] },
    },
    {
      id: 'training',
      name: 'Training - อบรม',
      description: 'ระบบจัดการฝึกอบรมและพัฒนาบุคลากร',
      icon: 'school',
      route: '/playground/pages/user-management',
      color: 'cyan',
      categoryId: 'hr',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'hr'] },
    },
    {
      id: 'performance',
      name: 'Performance - ประเมินผล',
      description: 'ระบบประเมินผลการปฏิบัติงาน KPI',
      icon: 'trending_up',
      route: '/playground/pages/user-management',
      color: 'yellow',
      categoryId: 'hr',
      status: 'beta',
      enabled: true,
      permission: { viewRoles: ['admin', 'hr', 'manager'] },
    },
    {
      id: 'shift',
      name: 'Shift - ตารางเวร',
      description: 'ระบบจัดตารางเวรและกะการทำงาน',
      icon: 'calendar_month',
      route: '/playground/pages/user-management',
      color: 'rose',
      categoryId: 'hr',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'hr', 'manager', 'nurse'] },
    },

    // ============================================
    // ERP & Management
    // ============================================
    {
      id: 'dashboard',
      name: 'Dashboard - ภาพรวม',
      description: 'แดชบอร์ดผู้บริหารและ KPI องค์กร',
      icon: 'dashboard',
      route: '/enterprise-demo',
      color: 'blue',
      categoryId: 'erp',
      status: 'active',
      enabled: true,
      featured: true,
      size: 'xl',
      usageCount: 200,
      permission: { viewRoles: ['admin', 'manager', 'director'] },
    },
    {
      id: 'workflow',
      name: 'Workflow - อนุมัติงาน',
      description: 'ระบบ Workflow อนุมัติเอกสารและคำขอต่างๆ',
      icon: 'account_tree',
      route: '/enterprise-demo',
      color: 'lavender',
      categoryId: 'erp',
      status: 'active',
      enabled: true,
      notificationCount: 12,
      featured: true,
      size: 'md',
      usageCount: 150,
      permission: { viewRoles: ['admin', 'manager'] },
    },
    {
      id: 'document',
      name: 'Document - เอกสาร',
      description: 'ระบบจัดการเอกสารและหนังสือเวียน',
      icon: 'description',
      route: '/enterprise-demo',
      color: 'white',
      categoryId: 'erp',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'secretary', 'manager'] },
    },
    {
      id: 'project',
      name: 'Project - โครงการ',
      description: 'ระบบบริหารโครงการและติดตามความคืบหน้า',
      icon: 'folder_special',
      route: '/enterprise-demo',
      color: 'cyan',
      categoryId: 'erp',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'manager'] },
    },
    {
      id: 'contract',
      name: 'Contract - สัญญา',
      description: 'ระบบจัดการสัญญาและ Vendor',
      icon: 'handshake',
      route: '/enterprise-demo',
      color: 'peach',
      categoryId: 'erp',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'purchasing', 'legal'] },
    },
    {
      id: 'settings',
      name: 'Settings - ตั้งค่าระบบ',
      description: 'การตั้งค่าระบบและ Master Data',
      icon: 'settings',
      route: '/enterprise-demo',
      color: 'neutral',
      categoryId: 'erp',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin'] },
    },
    {
      id: 'user-mgmt',
      name: 'User - จัดการผู้ใช้',
      description: 'ระบบจัดการผู้ใช้และสิทธิ์การเข้าถึง',
      icon: 'manage_accounts',
      route: '/playground/pages/user-management',
      color: 'mint',
      categoryId: 'erp',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin'] },
    },
    {
      id: 'audit-log',
      name: 'Audit Log - บันทึกการใช้งาน',
      description: 'ระบบตรวจสอบและ Log การใช้งาน',
      icon: 'history',
      route: '/enterprise-demo',
      color: 'yellow',
      categoryId: 'erp',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin'] },
    },

    // ============================================
    // Reports & Analytics
    // ============================================
    {
      id: 'report-his',
      name: 'HIS Reports - รายงานบริการ',
      description: 'รายงานสถิติผู้ป่วยและบริการทางการแพทย์',
      icon: 'summarize',
      route: '/enterprise-demo',
      color: 'pink',
      categoryId: 'reports',
      status: 'active',
      enabled: true,
      featured: true,
      size: 'lg',
      usageCount: 120,
      permission: { viewRoles: ['admin', 'manager', 'doctor'] },
    },
    {
      id: 'report-finance',
      name: 'Finance Reports - รายงานการเงิน',
      description: 'รายงานการเงินและงบการเงิน',
      icon: 'analytics',
      route: '/enterprise-demo',
      color: 'blue',
      categoryId: 'reports',
      status: 'active',
      enabled: true,
      featured: true,
      size: 'md',
      usageCount: 100,
      permission: { viewRoles: ['admin', 'accountant', 'manager'] },
    },
    {
      id: 'report-inv',
      name: 'Inventory Reports - รายงานพัสดุ',
      description: 'รายงานสถานะคลังและการเคลื่อนไหว',
      icon: 'inventory',
      route: '/enterprise-demo',
      color: 'mint',
      categoryId: 'reports',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'inventory_staff', 'manager'] },
    },
    {
      id: 'report-hr',
      name: 'HR Reports - รายงานบุคลากร',
      description: 'รายงานด้านบุคลากรและสถิติ HR',
      icon: 'groups',
      route: '/enterprise-demo',
      color: 'lavender',
      categoryId: 'reports',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'hr', 'manager'] },
    },
    {
      id: 'report-bi',
      name: 'BI Dashboard - วิเคราะห์ข้อมูล',
      description: 'Business Intelligence และ Data Analytics',
      icon: 'insights',
      route: '/enterprise-demo',
      color: 'cyan',
      categoryId: 'reports',
      status: 'beta',
      enabled: true,
      permission: { viewRoles: ['admin', 'manager', 'director'] },
    },
    {
      id: 'report-quality',
      name: 'Quality - คุณภาพ',
      description: 'รายงานตัวชี้วัดคุณภาพ HA/JCI',
      icon: 'verified',
      route: '/enterprise-demo',
      color: 'yellow',
      categoryId: 'reports',
      status: 'active',
      enabled: true,
      permission: { viewRoles: ['admin', 'quality', 'manager'] },
    },
  ]);

  constructor(private router: Router) {}

  onAppClick(event: LauncherAppClickEvent): void {
    const { app, newTab } = event;

    if (app.externalUrl) {
      window.open(app.externalUrl, '_blank');
    } else if (app.route) {
      if (newTab) {
        window.open(app.route, '_blank');
      } else {
        this.router.navigate([app.route]);
      }
    }
  }

  onMenuAction(event: LauncherMenuActionEvent): void {
    const { app, action } = event;
    console.log('Menu action:', action.id, 'for app:', app.name);
  }

  onRoleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const role = select.value;

    // Update user context based on role
    switch (role) {
      case 'admin':
        this.userContext.set({
          roles: ['admin'],
          permissions: ['apps:view', 'apps:manage'],
          isAdmin: true,
        });
        break;
      case 'manager':
        this.userContext.set({
          roles: ['manager'],
          permissions: ['apps:view'],
          isAdmin: false,
        });
        break;
      case 'developer':
        this.userContext.set({
          roles: ['developer'],
          permissions: ['apps:view'],
          isAdmin: false,
        });
        break;
      case 'user':
        this.userContext.set({
          roles: ['user'],
          permissions: [],
          isAdmin: false,
        });
        break;
    }
  }

  onLogout(): void {
    console.log('Logout clicked');
  }
}
