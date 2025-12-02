import {
  AxCompactLayoutComponent,
  AxDocsLayoutComponent,
  AxLayoutSwitcherComponent,
  AxNavigationItem,
  AxSplashScreenComponent,
  LayoutType,
  SplashScreenService,
  SplashScreenStage,
} from '@aegisx/ui';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { TremorThemeSwitcherComponent } from './components/tremor-theme-switcher.component';

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
    AxSplashScreenComponent,
  ],
  selector: 'ax-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly splashService = inject(SplashScreenService);

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
      !url.startsWith('/playground/pages/dashboard') &&
      !url.startsWith('/tools')
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
        {
          id: 'accessibility',
          title: 'Accessibility',
          type: 'item',
          icon: 'accessibility_new',
          link: '/docs/foundations/accessibility',
        },
        {
          id: 'theming',
          title: 'Theming',
          type: 'item',
          icon: 'palette',
          link: '/docs/foundations/theming',
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
              id: 'kbd',
              title: 'Kbd',
              type: 'item',
              icon: 'keyboard',
              link: '/docs/components/aegisx/data-display/kbd',
            },
            {
              id: 'field-display',
              title: 'Field Display',
              type: 'item',
              icon: 'text_snippet',
              link: '/docs/components/aegisx/data-display/field-display',
            },
            {
              id: 'description-list',
              title: 'Description List',
              type: 'item',
              icon: 'format_list_bulleted',
              link: '/docs/components/aegisx/data-display/description-list',
            },
            {
              id: 'stats-card',
              title: 'Stats Card',
              type: 'item',
              icon: 'bar_chart',
              link: '/docs/components/aegisx/data-display/stats-card',
            },
            {
              id: 'timeline',
              title: 'Timeline',
              type: 'item',
              icon: 'timeline',
              link: '/docs/components/aegisx/data-display/timeline',
            },
            {
              id: 'divider',
              title: 'Divider',
              type: 'item',
              icon: 'horizontal_rule',
              link: '/docs/components/aegisx/data-display/divider',
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
            {
              id: 'time-slots',
              title: 'Time Slots',
              type: 'item',
              icon: 'schedule',
              link: '/docs/components/aegisx/forms/time-slots',
            },
            {
              id: 'scheduler',
              title: 'Scheduler',
              type: 'item',
              icon: 'event',
              link: '/docs/components/aegisx/forms/scheduler',
            },
            {
              id: 'input-otp',
              title: 'Input OTP',
              type: 'item',
              icon: 'pin',
              link: '/docs/components/aegisx/forms/input-otp',
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
            {
              id: 'empty-state',
              title: 'Empty State',
              type: 'item',
              icon: 'inbox',
              link: '/docs/components/aegisx/feedback/empty-state',
            },
            {
              id: 'error-state',
              title: 'Error State',
              type: 'item',
              icon: 'error_outline',
              link: '/docs/components/aegisx/feedback/error-state',
            },
            {
              id: 'splash-screen',
              title: 'Splash Screen',
              type: 'item',
              icon: 'rocket_launch',
              link: '/docs/components/aegisx/feedback/splash-screen',
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
            {
              id: 'navigation-menu',
              title: 'Navigation Menu',
              type: 'item',
              icon: 'menu',
              link: '/docs/components/aegisx/navigation/navigation-menu',
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
            {
              id: 'compact-layout',
              title: 'Compact Layout',
              type: 'item',
              icon: 'view_quilt',
              link: '/docs/components/aegisx/layout/compact',
            },
            {
              id: 'empty-layout',
              title: 'Empty Layout',
              type: 'item',
              icon: 'crop_free',
              link: '/docs/components/aegisx/layout/empty',
            },
          ],
        },
        // Utilities
        {
          id: 'utilities',
          title: 'Utilities',
          type: 'collapsible',
          icon: 'build',
          children: [
            {
              id: 'theme-switcher',
              title: 'Theme Switcher',
              type: 'item',
              icon: 'palette',
              link: '/docs/components/aegisx/utilities/theme-switcher',
            },
            {
              id: 'layout-switcher',
              title: 'Layout Switcher',
              type: 'item',
              icon: 'view_quilt',
              link: '/docs/components/aegisx/utilities/layout-switcher',
            },
            {
              id: 'theme-builder',
              title: 'Theme Builder',
              type: 'item',
              icon: 'brush',
              link: '/docs/components/aegisx/utilities/theme-builder',
              badge: { content: 'New', type: 'info' },
            },
          ],
        },
      ],
    },

    // Integrations Section
    {
      id: 'integrations',
      title: 'Integrations',
      type: 'collapsible',
      icon: 'extension',
      children: [
        {
          id: 'integrations-overview',
          title: 'Overview',
          type: 'item',
          icon: 'dashboard',
          link: '/docs/integrations/overview',
        },
        {
          id: 'integrations-gridster',
          title: 'Gridster',
          type: 'item',
          icon: 'grid_view',
          link: '/docs/integrations/gridster',
        },
        {
          id: 'integrations-fullcalendar',
          title: 'FullCalendar',
          type: 'item',
          icon: 'calendar_month',
          link: '/docs/components/aegisx/data-display/calendar',
        },
        {
          id: 'integrations-qrcode',
          title: 'QR Code',
          type: 'item',
          icon: 'qr_code',
          link: '/docs/integrations/qrcode',
        },
        {
          id: 'integrations-signature-pad',
          title: 'Signature Pad',
          type: 'item',
          icon: 'draw',
          link: '/docs/integrations/signature-pad',
        },
        {
          id: 'integrations-ngx-charts',
          title: 'NGX Charts',
          type: 'item',
          icon: 'bar_chart',
          link: '/docs/integrations/ngx-charts',
        },
        {
          id: 'integrations-chartjs',
          title: 'Chart.js',
          type: 'item',
          icon: 'ssid_chart',
          link: '/docs/integrations/chartjs',
        },
        {
          id: 'integrations-pdf-viewer',
          title: 'PDF Viewer',
          type: 'item',
          icon: 'picture_as_pdf',
          link: '/docs/integrations/pdf-viewer',
        },
        {
          id: 'integrations-image-cropper',
          title: 'Image Cropper',
          type: 'item',
          icon: 'crop',
          link: '/docs/integrations/image-cropper',
        },
        {
          id: 'integrations-monaco-editor',
          title: 'Monaco Editor',
          type: 'item',
          icon: 'code',
          link: '/docs/integrations/monaco-editor',
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

    // Architecture Section
    {
      id: 'architecture',
      title: 'Architecture',
      type: 'collapsible',
      icon: 'account_tree',
      children: [
        {
          id: 'multi-app',
          title: 'Multi-App Architecture',
          type: 'item',
          icon: 'apps',
          link: '/docs/architecture/multi-app',
        },
        {
          id: 'shell-pattern',
          title: 'Shell Pattern & Routing',
          type: 'item',
          icon: 'route',
          link: '/docs/architecture/shell-pattern',
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

  ngOnInit(): void {
    this.initializeSplashScreen();
  }

  private async initializeSplashScreen(): Promise<void> {
    // Configure and show splash screen
    this.splashService.show({
      appName: this.title,
      tagline: 'Enterprise Angular UI Framework',
      version: this.appVersion,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minDisplayTime: 1500,
    });

    // Define loading stages
    const stages: SplashScreenStage[] = [
      {
        id: 'config',
        label: 'โหลดการตั้งค่า',
        icon: 'settings',
        status: 'pending',
      },
      { id: 'theme', label: 'เตรียมธีม', icon: 'palette', status: 'pending' },
      {
        id: 'components',
        label: 'โหลด Components',
        icon: 'widgets',
        status: 'pending',
      },
      { id: 'ui', label: 'เตรียม UI', icon: 'dashboard', status: 'pending' },
    ];

    this.splashService.setStages(stages);

    // Run initialization stages
    await this.splashService.runStages([
      { id: 'config', handler: () => this.delay(400) },
      { id: 'theme', handler: () => this.delay(300) },
      { id: 'components', handler: () => this.delay(500) },
      { id: 'ui', handler: () => this.delay(300) },
    ]);

    // Hide splash screen
    await this.splashService.hide();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
        {
          id: 'accessibility',
          title: 'Accessibility',
          link: '/docs/foundations/accessibility',
        },
        {
          id: 'theming',
          title: 'Theming',
          link: '/docs/foundations/theming',
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
              id: 'kbd',
              title: 'Kbd',
              link: '/docs/components/aegisx/data-display/kbd',
            },
            {
              id: 'field-display',
              title: 'Field Display',
              link: '/docs/components/aegisx/data-display/field-display',
            },
            {
              id: 'description-list',
              title: 'Description List',
              link: '/docs/components/aegisx/data-display/description-list',
            },
            {
              id: 'stats-card',
              title: 'Stats Card',
              link: '/docs/components/aegisx/data-display/stats-card',
            },
            {
              id: 'timeline',
              title: 'Timeline',
              link: '/docs/components/aegisx/data-display/timeline',
            },
            {
              id: 'divider',
              title: 'Divider',
              link: '/docs/components/aegisx/data-display/divider',
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
              id: 'time-slots',
              title: 'Time Slots',
              link: '/docs/components/aegisx/forms/time-slots',
            },
            {
              id: 'scheduler',
              title: 'Scheduler',
              link: '/docs/components/aegisx/forms/scheduler',
            },
            {
              id: 'file-upload',
              title: 'File Upload',
              link: '/docs/components/aegisx/forms/file-upload',
            },
            {
              id: 'popup-edit',
              title: 'Popup Edit',
              link: '/docs/components/aegisx/forms/popup-edit',
            },
            {
              id: 'knob',
              title: 'Knob',
              link: '/docs/components/aegisx/forms/knob',
            },
            {
              id: 'input-otp',
              title: 'Input OTP',
              link: '/docs/components/aegisx/forms/input-otp',
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
            {
              id: 'inner-loading',
              title: 'Inner Loading',
              link: '/docs/components/aegisx/feedback/inner-loading',
            },
            {
              id: 'empty-state',
              title: 'Empty State',
              link: '/docs/components/aegisx/feedback/empty-state',
            },
            {
              id: 'error-state',
              title: 'Error State',
              link: '/docs/components/aegisx/feedback/error-state',
            },
            {
              id: 'splash-screen',
              title: 'Splash Screen',
              link: '/docs/components/aegisx/feedback/splash-screen',
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
            {
              id: 'navigation-menu',
              title: 'Navigation Menu',
              link: '/docs/components/aegisx/navigation/navigation-menu',
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
            {
              id: 'splitter',
              title: 'Splitter',
              link: '/docs/components/aegisx/layout/splitter',
            },
            {
              id: 'compact-layout',
              title: 'Compact Layout',
              link: '/docs/components/aegisx/layout/compact',
            },
            {
              id: 'empty-layout',
              title: 'Empty Layout',
              link: '/docs/components/aegisx/layout/empty',
            },
          ],
        },
        {
          id: 'utilities',
          title: 'Utilities',
          children: [
            {
              id: 'theme-switcher',
              title: 'Theme Switcher',
              link: '/docs/components/aegisx/utilities/theme-switcher',
            },
            {
              id: 'layout-switcher',
              title: 'Layout Switcher',
              link: '/docs/components/aegisx/utilities/layout-switcher',
            },
            {
              id: 'theme-builder',
              title: 'Theme Builder',
              link: '/docs/components/aegisx/utilities/theme-builder',
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
      id: 'integrations',
      title: 'Integrations',
      children: [
        {
          id: 'integrations-overview',
          title: 'Overview',
          link: '/docs/integrations/overview',
        },
        {
          id: 'integrations-gridster',
          title: 'Gridster',
          link: '/docs/integrations/gridster',
        },
        {
          id: 'integrations-fullcalendar',
          title: 'FullCalendar',
          link: '/docs/components/aegisx/data-display/calendar',
        },
        {
          id: 'integrations-qrcode',
          title: 'QR Code',
          link: '/docs/integrations/qrcode',
        },
        {
          id: 'integrations-signature-pad',
          title: 'Signature Pad',
          link: '/docs/integrations/signature-pad',
        },
        {
          id: 'integrations-ngx-charts',
          title: 'NGX Charts',
          link: '/docs/integrations/ngx-charts',
        },
        {
          id: 'integrations-chartjs',
          title: 'Chart.js',
          link: '/docs/integrations/chartjs',
        },
        {
          id: 'integrations-pdf-viewer',
          title: 'PDF Viewer',
          link: '/docs/integrations/pdf-viewer',
        },
        {
          id: 'integrations-image-cropper',
          title: 'Image Cropper',
          link: '/docs/integrations/image-cropper',
        },
        {
          id: 'integrations-monaco-editor',
          title: 'Monaco Editor',
          link: '/docs/integrations/monaco-editor',
        },
      ],
    },
    {
      id: 'architecture',
      title: 'Architecture',
      children: [
        {
          id: 'multi-app',
          title: 'Multi-App Architecture',
          link: '/docs/architecture/multi-app',
        },
        {
          id: 'shell-pattern',
          title: 'Shell Pattern & Routing',
          link: '/docs/architecture/shell-pattern',
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
    {
      id: 'tools',
      title: 'Tools',
      children: [
        {
          id: 'theme-builder-tool',
          title: 'Theme Builder',
          link: '/tools/theme-builder',
        },
      ],
    },
  ];
}
