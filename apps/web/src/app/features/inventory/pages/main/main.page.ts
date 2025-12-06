import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AxLauncherComponent,
  LauncherApp,
  LauncherAppClickEvent,
} from '@aegisx/ui';
import { MODULE_ITEMS } from './main.config';

/**
 * Inventory Main Page
 *
 * Main landing page displaying all available modules.
 * Uses ax-launcher component for card-based navigation.
 *
 * Modules are configured in main.config.ts and can be
 * auto-registered by CRUD generator when using --shell option.
 */
@Component({
  selector: 'app-inventory-main',
  standalone: true,
  imports: [CommonModule, AxLauncherComponent],
  template: `
    <div class="main-container">
      <!-- Launcher Grid -->
      <ax-launcher
        [apps]="moduleItems"
        title="Inventory"
        subtitle="Select a module to manage"
        (appClick)="onModuleSelect($event)"
      />
    </div>
  `,
  styles: [
    `
      .main-container {
        padding: var(--ax-spacing-lg, 24px);
        max-width: 1400px;
        margin: 0 auto;
      }
    `,
  ],
})
export class MainPage {
  private readonly router = inject(Router);

  readonly moduleItems: LauncherApp[] = MODULE_ITEMS;

  /**
   * Handle module selection from launcher
   */
  onModuleSelect(event: LauncherAppClickEvent): void {
    const app = event.app;
    if (app.route) {
      if (event.newTab) {
        window.open(app.route, '_blank');
      } else {
        this.router.navigate([app.route]);
      }
    } else if (app.externalUrl) {
      window.open(app.externalUrl, '_blank');
    }
  }
}
