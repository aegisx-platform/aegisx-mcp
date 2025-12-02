import {
  AxBreadcrumbComponent,
  AxThemeBuilderComponent,
  BreadcrumbItem,
  ThemeBuilderService,
} from '@aegisx/ui';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-theme-builder-tool',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    AxBreadcrumbComponent,
    AxThemeBuilderComponent,
  ],
  template: `
    <div class="theme-builder-tool-page">
      <!-- Header -->
      <header class="tool-header">
        <div class="header-left">
          <ax-breadcrumb
            [items]="breadcrumbItems"
            separatorIcon="chevron_right"
            size="sm"
          ></ax-breadcrumb>
        </div>
        <div class="header-right">
          <button
            mat-icon-button
            matTooltip="View Documentation"
            routerLink="/docs/components/aegisx/utilities/theme-builder"
          >
            <mat-icon>help_outline</mat-icon>
          </button>
          <button mat-stroked-button (click)="applyToSystem()">
            <mat-icon>check</mat-icon>
            Apply to System
          </button>
        </div>
      </header>

      <!-- Theme Builder Component (Full Page) -->
      <main class="theme-builder-main">
        <ax-theme-builder />
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
      }

      .theme-builder-tool-page {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--ax-background-default, #f4f4f5);
      }

      .tool-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1.5rem;
        background: white;
        border-bottom: 1px solid var(--ax-border-default, #e4e4e7);
        flex-shrink: 0;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .theme-builder-main {
        flex: 1;
        overflow: hidden;

        ax-theme-builder {
          display: block;
          height: 100%;
        }
      }
    `,
  ],
})
export class ThemeBuilderToolComponent {
  private themeService: ThemeBuilderService;

  constructor(themeService: ThemeBuilderService) {
    this.themeService = themeService;
  }

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'Tools', url: '/tools' },
    { label: 'Theme Builder' },
  ];

  applyToSystem(): void {
    this.themeService.applyToDocument();
    this.themeService.saveToStorage();
  }
}
