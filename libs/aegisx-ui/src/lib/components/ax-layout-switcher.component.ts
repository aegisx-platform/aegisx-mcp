import { Component, OnInit, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

export type LayoutType = 'compact' | 'enterprise' | 'empty';

export interface LayoutOption {
  value: LayoutType;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'ax-layout-switcher',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="layoutMenu"
      [matTooltip]="'Switch Layout: ' + currentLayoutLabel()"
    >
      <mat-icon>{{ currentLayoutIcon() }}</mat-icon>
    </button>

    <mat-menu #layoutMenu="matMenu">
      @for (layout of layoutOptions; track layout.value) {
        <button
          mat-menu-item
          (click)="selectLayout(layout.value)"
          [class.active]="currentLayout() === layout.value"
        >
          <mat-icon>{{ layout.icon }}</mat-icon>
          <span class="ml-2">
            <div class="font-medium">{{ layout.label }}</div>
            <div class="text-xs text-gray-500">{{ layout.description }}</div>
          </span>
        </button>
      }
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
      }

      .active {
        background-color: rgba(0, 0, 0, 0.04);
      }

      :host-context(.dark) .active {
        background-color: rgba(255, 255, 255, 0.08);
      }

      ::ng-deep .mat-mdc-menu-content {
        padding: 8px 0;
      }

      ::ng-deep .mat-mdc-menu-item {
        min-height: 64px;
        line-height: 1.5;
      }
    `,
  ],
})
export class AxLayoutSwitcherComponent implements OnInit {
  currentLayout = signal<LayoutType>('compact');
  layoutChange = output<LayoutType>();

  private readonly LAYOUT_KEY = 'layout-type';

  layoutOptions: LayoutOption[] = [
    {
      value: 'compact',
      label: 'Compact Layout',
      icon: 'view_quilt',
      description: 'Collapsible sidebar with compact navigation',
    },
    {
      value: 'enterprise',
      label: 'Enterprise Layout',
      icon: 'dashboard_customize',
      description: 'Full-featured layout with multiple panels',
    },
    {
      value: 'empty',
      label: 'Empty Layout',
      icon: 'crop_free',
      description: 'Minimal layout with no chrome',
    },
  ];

  ngOnInit(): void {
    console.log('[AxLayoutSwitcher] Component initialized');
    // Load saved layout preference
    const savedLayout = localStorage.getItem(this.LAYOUT_KEY) as LayoutType;
    if (savedLayout && this.isValidLayout(savedLayout)) {
      this.currentLayout.set(savedLayout);
      console.log('[AxLayoutSwitcher] Loaded saved layout:', savedLayout);
    } else {
      console.log('[AxLayoutSwitcher] Using default layout: compact');
    }
  }

  selectLayout(layout: LayoutType): void {
    console.log('[AxLayoutSwitcher] Selecting layout:', layout);
    this.currentLayout.set(layout);
    localStorage.setItem(this.LAYOUT_KEY, layout);
    this.layoutChange.emit(layout);
    console.log('[AxLayoutSwitcher] Layout changed to:', layout);
  }

  currentLayoutLabel(): string {
    const layout = this.layoutOptions.find(
      (l) => l.value === this.currentLayout(),
    );
    return layout?.label || 'Compact Layout';
  }

  currentLayoutIcon(): string {
    const layout = this.layoutOptions.find(
      (l) => l.value === this.currentLayout(),
    );
    return layout?.icon || 'view_quilt';
  }

  private isValidLayout(value: string): value is LayoutType {
    return ['compact', 'enterprise', 'empty'].includes(value);
  }
}
