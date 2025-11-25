import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  AxCompactLayoutComponent,
  AxNavigationItem,
  AxLayoutSwitcherComponent,
  LayoutType,
} from '@aegisx/ui';
import { TremorThemeSwitcherComponent } from './components/tremor-theme-switcher.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    AxCompactLayoutComponent,
    TremorThemeSwitcherComponent,
    AxLayoutSwitcherComponent,
  ],
  selector: 'ax-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);

  protected title = 'AegisX Design System';
  protected appName = 'AegisX Admin';
  protected appVersion = 'v1.0.0';
  protected currentLayout = signal<LayoutType>('compact');

  // Check if current route should show layout
  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly showLayout = computed(() => {
    const url = this.currentUrl();
    // Don't show layout for standalone routes
    return !url.startsWith('/login');
  });

  // Navigation items - Tremor-style hierarchical structure
  navigation: AxNavigationItem[] = [
    // Getting Started Section
    {
      id: 'getting-started',
      title: 'Getting Started',
      type: 'collapsible',
      icon: 'rocket_launch',
      children: [
        {
          id: 'introduction',
          title: 'Introduction',
          type: 'item',
          icon: 'home',
          link: '/introduction',
        },
        {
          id: 'installation',
          title: 'Installation',
          type: 'item',
          icon: 'download',
          link: '/installation',
        },
        {
          id: 'quick-start',
          title: 'Quick Start',
          type: 'item',
          icon: 'speed',
          link: '/quick-start',
        },
      ],
    },

    // Foundation Section
    {
      id: 'foundation',
      title: 'Foundation',
      type: 'collapsible',
      icon: 'architecture',
      children: [
        {
          id: 'design-tokens',
          title: 'Design Tokens',
          type: 'item',
          icon: 'color_lens',
          link: '/design-tokens',
        },
        {
          id: 'typography',
          title: 'Typography',
          type: 'item',
          icon: 'text_fields',
          link: '/typography',
        },
      ],
    },

    // Material Components Section
    {
      id: 'material-components',
      title: 'Material Components',
      type: 'collapsible',
      icon: 'widgets',
      children: [
        {
          id: 'components',
          title: 'Components Demo',
          type: 'item',
          icon: 'view_module',
          link: '/components',
        },
      ],
    },

    // AegisX Components Section (Tremor-inspired)
    {
      id: 'aegisx-components',
      title: 'AegisX Components',
      type: 'collapsible',
      icon: 'extension',
      children: [
        {
          id: 'aegisx-ui-overview',
          title: 'AegisX UI Overview',
          type: 'item',
          icon: 'dashboard',
          link: '/aegisx-ui',
        },
        {
          id: 'aegisx-ui-date-picker',
          title: 'Date Picker',
          type: 'item',
          icon: 'calendar_today',
          link: '/aegisx-ui/date-picker',
        },
        {
          id: 'aegisx-ui-cards',
          title: 'Cards',
          type: 'item',
          icon: 'credit_card',
          link: '/aegisx-ui/cards',
        },
        {
          id: 'aegisx-ui-lists',
          title: 'Lists',
          type: 'item',
          icon: 'list',
          link: '/aegisx-ui/lists',
        },
        {
          id: 'aegisx-ui-data-display',
          title: 'Data Display',
          type: 'item',
          icon: 'table_chart',
          link: '/aegisx-ui/data-display',
        },
        {
          id: 'aegisx-ui-avatar',
          title: 'Avatar',
          type: 'item',
          icon: 'account_circle',
          link: '/aegisx-ui/avatar',
        },
        {
          id: 'aegisx-ui-alerts',
          title: 'Alerts',
          type: 'item',
          icon: 'notifications',
          link: '/aegisx-ui/alerts',
        },
        {
          id: 'aegisx-ui-loading-bar',
          title: 'Loading Bar',
          type: 'item',
          icon: 'hourglass_empty',
          link: '/aegisx-ui/loading-bar',
        },
        {
          id: 'aegisx-ui-breadcrumb',
          title: 'Breadcrumb',
          type: 'item',
          icon: 'arrow_forward',
          link: '/aegisx-ui/breadcrumb',
        },
        {
          id: 'card-examples',
          title: 'KPI Cards',
          type: 'item',
          icon: 'analytics',
          link: '/card-examples',
        },
        {
          id: 'kpi-card-demo',
          title: 'KPI Card Component',
          type: 'item',
          icon: 'view_agenda',
          link: '/kpi-card-demo',
        },
        {
          id: 'segmented-progress-demo',
          title: 'Segmented Progress',
          type: 'item',
          icon: 'data_usage',
          link: '/segmented-progress-demo',
        },
        {
          id: 'circular-progress-demo',
          title: 'Circular Progress',
          type: 'item',
          icon: 'donut_large',
          link: '/circular-progress-demo',
        },
        {
          id: 'sparkline-demo',
          title: 'Sparkline Charts',
          type: 'item',
          icon: 'show_chart',
          link: '/sparkline-demo',
        },
        {
          id: 'spark-charts',
          title: 'Spark Charts (Old)',
          type: 'item',
          icon: 'show_chart',
          link: '/spark-charts',
        },
        {
          id: 'badges',
          title: 'Badges',
          type: 'item',
          icon: 'label',
          link: '/badges',
        },
      ],
    },

    // Form Patterns Section
    {
      id: 'form-patterns',
      title: 'Form Patterns',
      type: 'collapsible',
      icon: 'article',
      children: [
        {
          id: 'form-sizes',
          title: 'Form Sizes',
          type: 'item',
          icon: 'height',
          link: '/form-sizes',
        },
        {
          id: 'form-layouts',
          title: 'Form Layouts',
          type: 'item',
          icon: 'view_module',
          link: '/form-layouts',
        },
      ],
    },

    // Examples Section
    {
      id: 'examples',
      title: 'Examples',
      type: 'collapsible',
      icon: 'apps',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'dashboard',
          link: '/dashboard',
        },
        {
          id: 'users',
          title: 'User Management',
          type: 'item',
          icon: 'people',
          link: '/users',
        },
      ],
    },
  ];

  onLayoutChange(layout: LayoutType): void {
    this.currentLayout.set(layout);
    console.log('Layout changed to:', layout);
    // TODO: Implement actual layout switching logic
    // This will be implemented when we create Enterprise and Empty layout components
  }
}
