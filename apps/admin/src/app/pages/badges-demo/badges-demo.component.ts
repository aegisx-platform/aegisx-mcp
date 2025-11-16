import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CodePreviewComponent } from '../../components/code-preview/code-preview.component';

interface BadgeExample {
  label: string;
  icon?: string;
  variant: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  removable?: boolean;
}

@Component({
  selector: 'app-badges-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    CodePreviewComponent,
  ],
  templateUrl: './badges-demo.component.html',
  styleUrl: './badges-demo.component.scss',
})
export class BadgesDemoComponent {
  // Status Badges
  statusBadges = [
    { label: 'Active', variant: 'success' as const },
    { label: 'Pending', variant: 'warning' as const },
    { label: 'Error', variant: 'error' as const },
    { label: 'Info', variant: 'info' as const },
    { label: 'Disabled', variant: 'neutral' as const },
  ];

  // Badges with Icons
  iconBadges = [
    { label: '+9.3%', icon: 'trending_up', variant: 'success' as const },
    { label: '-1.9%', icon: 'trending_down', variant: 'error' as const },
    { label: '+5.1%', icon: 'arrow_upward', variant: 'success' as const },
    { label: '0.6%', icon: 'arrow_forward', variant: 'neutral' as const },
  ];

  // Removable Badges (Tags)
  removableTags: BadgeExample[] = [
    { label: 'TypeScript', variant: 'info', removable: true },
    { label: 'Angular', variant: 'error', removable: true },
    { label: 'Material', variant: 'success', removable: true },
    { label: 'TailwindCSS', variant: 'info', removable: true },
  ];

  // Badge Dot Variants
  dotBadges = [
    { label: 'Online', variant: 'success' as const },
    { label: 'Away', variant: 'warning' as const },
    { label: 'Busy', variant: 'error' as const },
    { label: 'Offline', variant: 'neutral' as const },
  ];

  // Counter Badges
  counterBadges = [
    { label: 'Messages', count: 12, variant: 'info' as const },
    { label: 'Notifications', count: 5, variant: 'error' as const },
    { label: 'Updates', count: 99, variant: 'warning' as const },
  ];

  /**
   * Remove tag from removable tags array
   */
  removeTag(badge: BadgeExample): void {
    const index = this.removableTags.indexOf(badge);
    if (index >= 0) {
      this.removableTags.splice(index, 1);
    }
  }

  /**
   * Scroll to a specific section
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Code Examples
  basicBadgeCode = `<!-- Basic Badge - Outlined Style -->
<span class="badge badge-outlined badge-success">Active</span>
<span class="badge badge-outlined badge-warning">Pending</span>
<span class="badge badge-outlined badge-error">Error</span>
<span class="badge badge-outlined badge-info">Info</span>
<span class="badge badge-outlined badge-neutral">Disabled</span>`;

  softBadgeCode = `<!-- Soft/Filled Style -->
<span class="badge badge-soft badge-success">Active</span>
<span class="badge badge-soft badge-warning">Pending</span>
<span class="badge badge-soft badge-error">Error</span>
<span class="badge badge-soft badge-info">Info</span>
<span class="badge badge-soft badge-neutral">Disabled</span>`;

  outlinedBadgeCode = `<!-- Outlined Strong Border -->
<span class="badge badge-outlined-strong badge-success">Active</span>
<span class="badge badge-outlined-strong badge-warning">Pending</span>
<span class="badge badge-outlined-strong badge-error">Error</span>
<span class="badge badge-outlined-strong badge-info">Info</span>
<span class="badge badge-outlined-strong badge-neutral">Disabled</span>`;

  iconBadgeCode = `<!-- Badge with Icon -->
<span class="badge badge-soft badge-icon badge-success">
  <mat-icon>trending_up</mat-icon>
  <span>+9.3%</span>
</span>
<span class="badge badge-soft badge-icon badge-error">
  <mat-icon>trending_down</mat-icon>
  <span>-1.9%</span>
</span>
<span class="badge badge-soft badge-icon badge-success">
  <mat-icon>arrow_upward</mat-icon>
  <span>+5.1%</span>
</span>
<span class="badge badge-soft badge-icon badge-neutral">
  <mat-icon>arrow_forward</mat-icon>
  <span>0.6%</span>
</span>`;

  dotBadgeCode = `<!-- Badge with Dot -->
<span class="badge badge-dot badge-soft badge-success">
  <span class="dot"></span>
  <span>Online</span>
</span>
<span class="badge badge-dot badge-soft badge-warning">
  <span class="dot"></span>
  <span>Away</span>
</span>
<span class="badge badge-dot badge-soft badge-error">
  <span class="dot"></span>
  <span>Busy</span>
</span>
<span class="badge badge-dot badge-soft badge-neutral">
  <span class="dot"></span>
  <span>Offline</span>
</span>`;

  removableBadgeCode = `<!-- Removable Badge -->
<span class="badge badge-removable badge-soft badge-info">
  <span>TypeScript</span>
  <button class="badge-remove" type="button">
    <mat-icon>close</mat-icon>
  </button>
</span>
<span class="badge badge-removable badge-soft badge-error">
  <span>Angular</span>
  <button class="badge-remove" type="button">
    <mat-icon>close</mat-icon>
  </button>
</span>`;

  counterBadgeCode = `<!-- Counter Badge -->
<span class="badge badge-counter badge-outlined badge-info">
  <span>Messages</span>
  <span class="badge-count">12</span>
</span>
<span class="badge badge-counter badge-outlined badge-error">
  <span>Notifications</span>
  <span class="badge-count">5</span>
</span>
<span class="badge badge-counter badge-outlined badge-warning">
  <span>Updates</span>
  <span class="badge-count">99</span>
</span>`;

  sizeBadgeCode = `<!-- Badge Sizes - Simple -->
<div class="flex gap-3">
  <span class="badge badge-soft badge-info badge-sm">Small</span>
  <span class="badge badge-soft badge-info badge-md">Medium</span>
  <span class="badge badge-soft badge-info badge-lg">Large</span>
</div>

<!-- Badge Sizes - With Icons -->
<div class="flex gap-3 mt-6">
  <span class="badge badge-outlined badge-success badge-sm">
    <mat-icon>check</mat-icon>
    <span>Small</span>
  </span>
  <span class="badge badge-outlined badge-success badge-md">
    <mat-icon>check</mat-icon>
    <span>Medium</span>
  </span>
  <span class="badge badge-outlined badge-success badge-lg">
    <mat-icon>check</mat-icon>
    <span>Large</span>
  </span>
</div>`;
}
