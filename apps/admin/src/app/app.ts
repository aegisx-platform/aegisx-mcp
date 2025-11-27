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
  AxDocsLayoutComponent,
  DocsNavItem,
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
    AxDocsLayoutComponent,
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

  // Check if current route is in docs section (for docs layout)
  protected readonly isDocsRoute = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/docs');
  });

  // Navigation items - Storybook-style documentation structure
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
          link: '/docs/getting-started/introduction',
        },
        {
          id: 'installation',
          title: 'Installation',
          type: 'item',
          icon: 'download',
          link: '/docs/getting-started/installation',
        },
        {
          id: 'quick-start',
          title: 'Quick Start',
          type: 'item',
          icon: 'speed',
          link: '/docs/getting-started/quick-start',
        },
      ],
    },

    // Foundations Section
    {
      id: 'foundations',
      title: 'Foundations',
      type: 'collapsible',
      icon: 'architecture',
      children: [
        {
          id: 'foundations-overview',
          title: 'Overview',
          type: 'item',
          icon: 'dashboard',
          link: '/docs/foundations/overview',
        },
        {
          id: 'design-tokens',
          title: 'Design Tokens',
          type: 'item',
          icon: 'palette',
          link: '/docs/foundations/design-tokens',
        },
        {
          id: 'colors',
          title: 'Colors',
          type: 'item',
          icon: 'color_lens',
          link: '/docs/foundations/colors',
        },
        {
          id: 'typography',
          title: 'Typography',
          type: 'item',
          icon: 'text_fields',
          link: '/docs/foundations/typography',
        },
        {
          id: 'spacing',
          title: 'Spacing',
          type: 'item',
          icon: 'straighten',
          link: '/docs/foundations/spacing',
        },
        {
          id: 'shadows',
          title: 'Shadows',
          type: 'item',
          icon: 'layers',
          link: '/docs/foundations/shadows',
        },
        {
          id: 'motion',
          title: 'Motion',
          type: 'item',
          icon: 'animation',
          link: '/docs/foundations/motion',
        },
      ],
    },

    // Components Section with subcategories
    {
      id: 'components',
      title: 'Components',
      type: 'collapsible',
      icon: 'widgets',
      children: [
        // Data Display
        {
          id: 'data-display',
          title: 'Data Display',
          type: 'collapsible',
          icon: 'table_chart',
          children: [
            {
              id: 'data-display-overview',
              title: 'Overview',
              type: 'item',
              icon: 'dashboard',
              link: '/docs/components/data-display/overview',
            },
            {
              id: 'card',
              title: 'Card',
              type: 'item',
              icon: 'credit_card',
              link: '/docs/components/data-display/card',
            },
            {
              id: 'kpi-card',
              title: 'KPI Card',
              type: 'item',
              icon: 'analytics',
              link: '/docs/components/data-display/kpi-card',
            },
            {
              id: 'badge',
              title: 'Badge',
              type: 'item',
              icon: 'label',
              link: '/docs/components/data-display/badge',
            },
            {
              id: 'avatar',
              title: 'Avatar',
              type: 'item',
              icon: 'account_circle',
              link: '/docs/components/data-display/avatar',
            },
            {
              id: 'list',
              title: 'List',
              type: 'item',
              icon: 'list',
              link: '/docs/components/data-display/list',
            },
            {
              id: 'sparkline',
              title: 'Sparkline',
              type: 'item',
              icon: 'show_chart',
              link: '/docs/components/data-display/sparkline',
            },
            {
              id: 'circular-progress',
              title: 'Circular Progress',
              type: 'item',
              icon: 'donut_large',
              link: '/docs/components/data-display/circular-progress',
            },
            {
              id: 'segmented-progress',
              title: 'Segmented Progress',
              type: 'item',
              icon: 'data_usage',
              link: '/docs/components/data-display/segmented-progress',
            },
          ],
        },
        // Forms
        {
          id: 'forms',
          title: 'Forms',
          type: 'collapsible',
          icon: 'edit_note',
          children: [
            {
              id: 'date-picker',
              title: 'Date Picker',
              type: 'item',
              icon: 'calendar_today',
              link: '/docs/components/aegisx/forms/date-picker',
            },
            {
              id: 'file-upload',
              title: 'File Upload',
              type: 'item',
              icon: 'cloud_upload',
              link: '/docs/components/aegisx/forms/file-upload',
            },
          ],
        },
        // Feedback
        {
          id: 'feedback',
          title: 'Feedback',
          type: 'collapsible',
          icon: 'feedback',
          children: [
            {
              id: 'alert',
              title: 'Alert',
              type: 'item',
              icon: 'notifications',
              link: '/docs/components/aegisx/feedback/alert',
            },
            {
              id: 'loading-bar',
              title: 'Loading Bar',
              type: 'item',
              icon: 'hourglass_empty',
              link: '/docs/components/aegisx/feedback/loading-bar',
            },
            {
              id: 'dialogs',
              title: 'Dialogs',
              type: 'item',
              icon: 'open_in_new',
              link: '/docs/components/aegisx/feedback/dialogs',
            },
            {
              id: 'toast',
              title: 'Toast',
              type: 'item',
              icon: 'announcement',
              link: '/docs/components/aegisx/feedback/toast',
            },
            {
              id: 'skeleton',
              title: 'Skeleton',
              type: 'item',
              icon: 'view_stream',
              link: '/docs/components/aegisx/feedback/skeleton',
            },
          ],
        },
        // Navigation
        {
          id: 'navigation',
          title: 'Navigation',
          type: 'collapsible',
          icon: 'menu',
          children: [
            {
              id: 'breadcrumb',
              title: 'Breadcrumb',
              type: 'item',
              icon: 'arrow_forward',
              link: '/docs/components/aegisx/navigation/breadcrumb',
            },
            {
              id: 'stepper',
              title: 'Stepper',
              type: 'item',
              icon: 'linear_scale',
              link: '/docs/components/aegisx/navigation/stepper',
            },
          ],
        },
        // Layout
        {
          id: 'layout',
          title: 'Layout',
          type: 'collapsible',
          icon: 'view_quilt',
          children: [
            {
              id: 'drawer',
              title: 'Drawer / Sheet',
              type: 'item',
              icon: 'menu_open',
              link: '/docs/components/aegisx/layout/drawer',
            },
          ],
        },
      ],
    },

    // Patterns Section
    {
      id: 'patterns',
      title: 'Patterns',
      type: 'collapsible',
      icon: 'pattern',
      children: [
        {
          id: 'form-sizes',
          title: 'Form Sizes',
          type: 'item',
          icon: 'height',
          link: '/docs/patterns/form-sizes',
        },
        {
          id: 'form-layouts',
          title: 'Form Layouts',
          type: 'item',
          icon: 'view_module',
          link: '/docs/patterns/form-layouts',
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
          link: '/docs/examples/dashboard',
        },
        {
          id: 'user-management',
          title: 'User Management',
          type: 'item',
          icon: 'people',
          link: '/docs/examples/user-management',
        },
        {
          id: 'components-demo',
          title: 'Material Components',
          type: 'item',
          icon: 'view_module',
          link: '/docs/examples/components',
        },
        {
          id: 'card-examples',
          title: 'Card Examples',
          type: 'item',
          icon: 'credit_card',
          link: '/docs/examples/card-examples',
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

  // Documentation navigation for Shadcn/ui-style sidebar
  docsNavigation: DocsNavItem[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      defaultOpen: true,
      children: [
        {
          id: 'introduction',
          title: 'Introduction',
          link: '/docs/getting-started/introduction',
        },
        {
          id: 'installation',
          title: 'Installation',
          link: '/docs/getting-started/installation',
        },
        {
          id: 'quick-start',
          title: 'Quick Start',
          link: '/docs/getting-started/quick-start',
        },
      ],
    },
    {
      id: 'foundations',
      title: 'Foundations',
      children: [
        {
          id: 'foundations-overview',
          title: 'Overview',
          link: '/docs/foundations/overview',
        },
        {
          id: 'design-tokens',
          title: 'Design Tokens',
          link: '/docs/foundations/design-tokens',
        },
        {
          id: 'colors',
          title: 'Colors',
          link: '/docs/foundations/colors',
        },
        {
          id: 'typography',
          title: 'Typography',
          link: '/docs/foundations/typography',
        },
        {
          id: 'spacing',
          title: 'Spacing',
          link: '/docs/foundations/spacing',
        },
        {
          id: 'shadows',
          title: 'Shadows',
          link: '/docs/foundations/shadows',
        },
        {
          id: 'motion',
          title: 'Motion',
          link: '/docs/foundations/motion',
        },
      ],
    },
    {
      id: 'components',
      title: 'Components',
      children: [
        {
          id: 'data-display',
          title: 'Data Display',
          children: [
            {
              id: 'card',
              title: 'Card',
              link: '/docs/components/data-display/card',
            },
            {
              id: 'kpi-card',
              title: 'KPI Card',
              link: '/docs/components/data-display/kpi-card',
            },
            {
              id: 'badge',
              title: 'Badge',
              link: '/docs/components/data-display/badge',
            },
            {
              id: 'avatar',
              title: 'Avatar',
              link: '/docs/components/data-display/avatar',
            },
            {
              id: 'list',
              title: 'List',
              link: '/docs/components/data-display/list',
            },
            {
              id: 'sparkline',
              title: 'Sparkline',
              link: '/docs/components/data-display/sparkline',
            },
          ],
        },
        {
          id: 'forms',
          title: 'Forms',
          children: [
            {
              id: 'date-picker',
              title: 'Date Picker',
              link: '/docs/components/aegisx/forms/date-picker',
            },
            {
              id: 'file-upload',
              title: 'File Upload',
              link: '/docs/components/aegisx/forms/file-upload',
            },
            {
              id: 'form-sizes',
              title: 'Form Sizes',
              link: '/docs/patterns/form-sizes',
            },
            {
              id: 'form-layouts',
              title: 'Form Layouts',
              link: '/docs/patterns/form-layouts',
            },
          ],
        },
        {
          id: 'feedback',
          title: 'Feedback',
          children: [
            {
              id: 'alert',
              title: 'Alert',
              link: '/docs/components/aegisx/feedback/alert',
            },
            {
              id: 'loading-bar',
              title: 'Loading Bar',
              link: '/docs/components/aegisx/feedback/loading-bar',
            },
            {
              id: 'dialogs',
              title: 'Dialogs',
              link: '/docs/components/aegisx/feedback/dialogs',
            },
            {
              id: 'toast',
              title: 'Toast',
              link: '/docs/components/aegisx/feedback/toast',
            },
            {
              id: 'skeleton',
              title: 'Skeleton',
              link: '/docs/components/aegisx/feedback/skeleton',
            },
          ],
        },
        {
          id: 'navigation',
          title: 'Navigation',
          children: [
            {
              id: 'breadcrumb',
              title: 'Breadcrumb',
              link: '/docs/components/aegisx/navigation/breadcrumb',
            },
            {
              id: 'stepper',
              title: 'Stepper',
              link: '/docs/components/aegisx/navigation/stepper',
            },
          ],
        },
        {
          id: 'layout',
          title: 'Layout',
          children: [
            {
              id: 'drawer',
              title: 'Drawer / Sheet',
              link: '/docs/components/aegisx/layout/drawer',
            },
          ],
        },
      ],
    },
    {
      id: 'examples',
      title: 'Examples',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          link: '/docs/examples/dashboard',
        },
        {
          id: 'user-management',
          title: 'User Management',
          link: '/docs/examples/user-management',
        },
        {
          id: 'components-demo',
          title: 'Material Components',
          link: '/docs/examples/components',
        },
        {
          id: 'card-examples',
          title: 'Card Examples',
          link: '/docs/examples/card-examples',
        },
      ],
    },
  ];
}
