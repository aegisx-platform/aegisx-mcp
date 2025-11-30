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
    // Don't show layout for standalone routes (pages with their own Enterprise Layout)
    return (
      !url.startsWith('/login') &&
      !url.startsWith('/enterprise-demo') &&
      !url.startsWith('/inventory-demo') &&
      !url.startsWith('/his-demo') &&
      !url.startsWith('/app-launcher-demo') &&
      !url.startsWith('/widget-demo') &&
      !url.startsWith('/gridster-demo') &&
      !url.startsWith('/gridster-poc') &&
      !url.startsWith('/playground/pages/dashboard')
    );
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
        // Introduction
        {
          id: 'components-overview',
          title: 'Overview',
          type: 'item',
          icon: 'home',
          link: '/docs/components/aegisx/overview',
        },
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
              link: '/docs/components/aegisx/data-display/overview',
            },
            {
              id: 'card',
              title: 'Card',
              type: 'item',
              icon: 'credit_card',
              link: '/docs/components/aegisx/data-display/card',
            },
            {
              id: 'kpi-card',
              title: 'KPI Card',
              type: 'item',
              icon: 'analytics',
              link: '/docs/components/aegisx/data-display/kpi-card',
            },
            {
              id: 'badge',
              title: 'Badge',
              type: 'item',
              icon: 'label',
              link: '/docs/components/aegisx/data-display/badge',
            },
            {
              id: 'avatar',
              title: 'Avatar',
              type: 'item',
              icon: 'account_circle',
              link: '/docs/components/aegisx/data-display/avatar',
            },
            {
              id: 'list',
              title: 'List',
              type: 'item',
              icon: 'list',
              link: '/docs/components/aegisx/data-display/list',
            },
            {
              id: 'calendar',
              title: 'Calendar',
              type: 'item',
              icon: 'calendar_month',
              link: '/docs/components/aegisx/data-display/calendar',
            },
            {
              id: 'sparkline',
              title: 'Sparkline',
              type: 'item',
              icon: 'show_chart',
              link: '/docs/components/aegisx/charts/sparkline',
            },
            {
              id: 'circular-progress',
              title: 'Circular Progress',
              type: 'item',
              icon: 'donut_large',
              link: '/docs/components/aegisx/charts/circular-progress',
            },
            {
              id: 'segmented-progress',
              title: 'Segmented Progress',
              type: 'item',
              icon: 'data_usage',
              link: '/docs/components/aegisx/charts/segmented-progress',
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
            {
              id: 'launcher',
              title: 'Launcher',
              type: 'item',
              icon: 'apps',
              link: '/docs/components/aegisx/navigation/launcher',
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
            {
              id: 'enterprise-layout',
              title: 'Enterprise Layout',
              type: 'item',
              icon: 'web',
              link: '/docs/components/aegisx/layout/enterprise',
            },
          ],
        },
      ],
    },

    // Material Components Section
    {
      id: 'material',
      title: 'Material',
      type: 'collapsible',
      icon: 'palette',
      children: [
        {
          id: 'material-overview',
          title: 'Overview',
          type: 'item',
          icon: 'dashboard',
          link: '/docs/material/overview',
        },
        {
          id: 'material-button',
          title: 'Button',
          type: 'item',
          icon: 'smart_button',
          link: '/docs/material/button',
        },
        {
          id: 'material-card',
          title: 'Card',
          type: 'item',
          icon: 'credit_card',
          link: '/docs/material/card',
        },
        {
          id: 'material-table',
          title: 'Table',
          type: 'item',
          icon: 'table_chart',
          link: '/docs/material/table',
        },
        {
          id: 'material-form-field',
          title: 'Form Field',
          type: 'item',
          icon: 'input',
          link: '/docs/material/form-field',
        },
        {
          id: 'material-chips',
          title: 'Chips',
          type: 'item',
          icon: 'label',
          link: '/docs/material/chips',
        },
        {
          id: 'material-dialog',
          title: 'Dialog',
          type: 'item',
          icon: 'open_in_new',
          link: '/docs/material/dialog',
        },
        {
          id: 'material-menu',
          title: 'Menu',
          type: 'item',
          icon: 'menu',
          link: '/docs/material/menu',
        },
        {
          id: 'material-tabs',
          title: 'Tabs',
          type: 'item',
          icon: 'tab',
          link: '/docs/material/tabs',
        },
        {
          id: 'material-icon',
          title: 'Icon',
          type: 'item',
          icon: 'emoji_symbols',
          link: '/docs/material/icon',
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

    // Demo Apps Section
    {
      id: 'demo-apps',
      title: 'Demo Apps',
      type: 'collapsible',
      icon: 'play_circle',
      children: [
        {
          id: 'app-launcher-demo',
          title: 'App Launcher',
          type: 'item',
          icon: 'apps',
          link: '/app-launcher-demo',
        },
        {
          id: 'gridster-demo',
          title: 'Gridster Demo',
          type: 'item',
          icon: 'grid_view',
          link: '/gridster-demo',
        },
        {
          id: 'enterprise-demo',
          title: 'Enterprise Dashboard',
          type: 'item',
          icon: 'business',
          link: '/enterprise-demo',
        },
        {
          id: 'inventory-demo',
          title: 'Inventory System',
          type: 'item',
          icon: 'inventory_2',
          link: '/inventory-demo',
        },
        {
          id: 'his-demo',
          title: 'HIS (Hospital)',
          type: 'item',
          icon: 'local_hospital',
          link: '/his-demo',
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
  docsNavigation: AxNavigationItem[] = [
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
          id: 'components-overview',
          title: 'Overview',
          link: '/docs/components/aegisx/overview',
        },
        {
          id: 'data-display',
          title: 'Data Display',
          children: [
            {
              id: 'card',
              title: 'Card',
              link: '/docs/components/aegisx/data-display/card',
            },
            {
              id: 'kpi-card',
              title: 'KPI Card',
              link: '/docs/components/aegisx/data-display/kpi-card',
            },
            {
              id: 'badge',
              title: 'Badge',
              link: '/docs/components/aegisx/data-display/badge',
            },
            {
              id: 'avatar',
              title: 'Avatar',
              link: '/docs/components/aegisx/data-display/avatar',
            },
            {
              id: 'list',
              title: 'List',
              link: '/docs/components/aegisx/data-display/list',
            },
            {
              id: 'calendar',
              title: 'Calendar',
              link: '/docs/components/aegisx/data-display/calendar',
            },
            {
              id: 'sparkline',
              title: 'Sparkline',
              link: '/docs/components/aegisx/charts/sparkline',
            },
            {
              id: 'circular-progress',
              title: 'Circular Progress',
              link: '/docs/components/aegisx/charts/circular-progress',
            },
            {
              id: 'segmented-progress',
              title: 'Segmented Progress',
              link: '/docs/components/aegisx/charts/segmented-progress',
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
            {
              id: 'launcher',
              title: 'Launcher',
              link: '/docs/components/aegisx/navigation/launcher',
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
            {
              id: 'enterprise-layout',
              title: 'Enterprise Layout',
              link: '/docs/components/aegisx/layout/enterprise',
            },
          ],
        },
        {
          id: 'dashboard',
          title: 'Dashboard',
          children: [
            {
              id: 'widget-framework',
              title: 'Widget Framework',
              link: '/docs/components/aegisx/dashboard/widget-framework',
            },
          ],
        },
      ],
    },
    {
      id: 'material',
      title: 'Material',
      children: [
        {
          id: 'material-overview',
          title: 'Overview',
          link: '/docs/material/overview',
        },
        {
          id: 'actions',
          title: 'Actions',
          children: [
            {
              id: 'material-button',
              title: 'Button',
              link: '/docs/material/button',
            },
            {
              id: 'material-fab',
              title: 'FAB',
              link: '/docs/material/fab',
            },
            {
              id: 'material-button-toggle',
              title: 'Button Toggle',
              link: '/docs/material/button-toggle',
            },
          ],
        },
        {
          id: 'data-display',
          title: 'Data Display',
          children: [
            {
              id: 'material-card',
              title: 'Card',
              link: '/docs/material/card',
            },
            {
              id: 'material-table',
              title: 'Table',
              link: '/docs/material/table',
            },
            {
              id: 'material-list',
              title: 'List',
              link: '/docs/material/list',
            },
            {
              id: 'material-chips',
              title: 'Chips',
              link: '/docs/material/chips',
            },
            {
              id: 'material-icon',
              title: 'Icon',
              link: '/docs/material/icon',
            },
          ],
        },
        {
          id: 'forms',
          title: 'Form Controls',
          children: [
            {
              id: 'material-form-field',
              title: 'Form Field',
              link: '/docs/material/form-field',
            },
            {
              id: 'material-select',
              title: 'Select',
              link: '/docs/material/select',
            },
            {
              id: 'material-datepicker',
              title: 'Datepicker',
              link: '/docs/material/datepicker',
            },
          ],
        },
        {
          id: 'navigation',
          title: 'Navigation',
          children: [
            {
              id: 'material-menu',
              title: 'Menu',
              link: '/docs/material/menu',
            },
            {
              id: 'material-tabs',
              title: 'Tabs',
              link: '/docs/material/tabs',
            },
          ],
        },
        {
          id: 'feedback',
          title: 'Feedback',
          children: [
            {
              id: 'material-dialog',
              title: 'Dialog',
              link: '/docs/material/dialog',
            },
            {
              id: 'material-snackbar',
              title: 'Snackbar',
              link: '/docs/material/snackbar',
            },
            {
              id: 'material-progress-bar',
              title: 'Progress Bar',
              link: '/docs/material/progress-bar',
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
          title: 'Material Playground',
          link: '/docs/examples/components',
        },
        {
          id: 'card-examples',
          title: 'Card Examples',
          link: '/docs/examples/card-examples',
        },
      ],
    },
    {
      id: 'demo-apps',
      title: 'Demo Apps',
      children: [
        {
          id: 'app-launcher-demo',
          title: 'App Launcher',
          link: '/app-launcher-demo',
        },
        {
          id: 'gridster-demo',
          title: 'Gridster Demo',
          link: '/gridster-demo',
        },
        {
          id: 'enterprise-demo',
          title: 'Enterprise Dashboard',
          link: '/enterprise-demo',
        },
        {
          id: 'inventory-demo',
          title: 'Inventory System',
          link: '/inventory-demo',
        },
        {
          id: 'his-demo',
          title: 'HIS (Hospital)',
          link: '/his-demo',
        },
      ],
    },
  ];
}
