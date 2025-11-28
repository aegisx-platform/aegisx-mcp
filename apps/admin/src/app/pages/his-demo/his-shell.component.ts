import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AxEnterpriseLayoutComponent, EnterpriseNavItem } from '@aegisx/ui';

@Component({
  selector: 'ax-his-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    AxEnterpriseLayoutComponent,
  ],
  template: `
    <ax-enterprise-layout
      [appName]="'Hospital Information System'"
      [navigation]="navigation"
      [showFooter]="true"
      [headerTheme]="'dark'"
      [contentBackground]="'gray'"
      (logoutClicked)="onLogout()"
    >
      <!-- Header Actions -->
      <ng-template #headerActions>
        <button mat-icon-button matTooltip="Emergency">
          <mat-icon>emergency</mat-icon>
        </button>
        <button mat-icon-button matTooltip="Notifications">
          <mat-icon>notifications</mat-icon>
        </button>
        <button mat-icon-button matTooltip="Settings">
          <mat-icon>settings</mat-icon>
        </button>
      </ng-template>

      <!-- Router Outlet for Child Pages -->
      <router-outlet></router-outlet>

      <!-- Footer Content -->
      <ng-template #footerContent>
        <span>Hospital Information System - AegisX Platform</span>
        <span class="footer-version">v1.0.0</span>
      </ng-template>
    </ax-enterprise-layout>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }

      .footer-version {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
      }
    `,
  ],
})
export class HisShellComponent {
  navigation: EnterpriseNavItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      link: '/his-demo',
      icon: 'dashboard',
      exactMatch: true,
    },
    {
      id: 'patients',
      title: 'Patients',
      link: '/his-demo/patients',
      icon: 'groups',
    },
    {
      id: 'appointments',
      title: 'Appointments',
      link: '/his-demo/appointments',
      icon: 'event',
    },
    {
      id: 'lab-results',
      title: 'Lab Results',
      link: '/his-demo/lab-results',
      icon: 'biotech',
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy',
      link: '/his-demo/pharmacy',
      icon: 'local_pharmacy',
    },
    {
      id: 'reports',
      title: 'Reports',
      link: '/his-demo/reports',
      icon: 'assessment',
    },
  ];

  onLogout(): void {
    console.log('Logout clicked');
  }
}
