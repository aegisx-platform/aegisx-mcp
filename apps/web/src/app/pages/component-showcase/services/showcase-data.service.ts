import { Injectable } from '@angular/core';

export interface ComponentExample {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  complexity: 'low' | 'medium' | 'high';
  source: string;
  documentation?: string;
  codeExample?: string;
  liveDemo?: boolean;
  responsive?: boolean;
  accessibility?: boolean;
}

export interface ComponentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  components: ComponentExample[];
}

@Injectable({
  providedIn: 'root',
})
export class ShowcaseDataService {
  private componentData: Map<string, ComponentCategory> = new Map();
  private isDataLoaded = false;

  async loadComponentData(): Promise<void> {
    if (this.isDataLoaded) return;

    try {
      // Initialize component categories
      await this.initializeMaterialDesignComponents();
      await this.initializeAegisxUiComponents();
      await this.initializeApplicationWidgets();
      await this.initializeInteractiveDemos();

      this.isDataLoaded = true;
    } catch (error) {
      console.error('Failed to load component data:', error);
      throw error;
    }
  }

  getComponentCounts(): Record<string, number> {
    const counts: Record<string, number> = {};

    this.componentData.forEach((category, key) => {
      counts[key] = category.components.length;
    });

    return counts;
  }

  getCategoryData(categoryId: string): ComponentCategory | undefined {
    return this.componentData.get(categoryId);
  }

  searchComponents(query: string, categoryId?: string): ComponentExample[] {
    const results: ComponentExample[] = [];
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) return results;

    const categoriesToSearch = categoryId
      ? ([this.componentData.get(categoryId)].filter(
          Boolean,
        ) as ComponentCategory[])
      : Array.from(this.componentData.values());

    for (const category of categoriesToSearch) {
      for (const component of category.components) {
        if (this.matchesSearchCriteria(component, searchTerm)) {
          results.push(component);
        }
      }
    }

    return results;
  }

  private matchesSearchCriteria(
    component: ComponentExample,
    searchTerm: string,
  ): boolean {
    return (
      component.name.toLowerCase().includes(searchTerm) ||
      component.description.toLowerCase().includes(searchTerm) ||
      component.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
      component.category.toLowerCase().includes(searchTerm)
    );
  }

  private async initializeMaterialDesignComponents(): Promise<void> {
    const materialComponents: ComponentExample[] = [
      // Form Controls
      {
        id: 'mat-form-field',
        name: 'Form Field',
        description:
          'Container for form controls with labels, hints, and error messages',
        category: 'Form Controls',
        tags: ['forms', 'input', 'validation'],
        complexity: 'medium',
        source: '@angular/material/form-field',
        liveDemo: true,
        responsive: true,
        accessibility: true,
        codeExample: `<mat-form-field appearance="outline">
  <mat-label>Email</mat-label>
  <input matInput type="email" placeholder="Enter your email">
  <mat-hint>We'll never share your email</mat-hint>
</mat-form-field>`,
      },
      {
        id: 'mat-input',
        name: 'Input',
        description: 'Text input fields with Material Design styling',
        category: 'Form Controls',
        tags: ['forms', 'text', 'input'],
        complexity: 'low',
        source: '@angular/material/input',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-select',
        name: 'Select',
        description: 'Dropdown selection component with search capabilities',
        category: 'Form Controls',
        tags: ['forms', 'dropdown', 'selection'],
        complexity: 'medium',
        source: '@angular/material/select',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-autocomplete',
        name: 'Autocomplete',
        description: 'Input field with searchable suggestions dropdown',
        category: 'Form Controls',
        tags: ['forms', 'search', 'suggestions', 'typeahead'],
        complexity: 'high',
        source: '@angular/material/autocomplete',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-checkbox',
        name: 'Checkbox',
        description:
          'Boolean selection checkbox with indeterminate state support',
        category: 'Form Controls',
        tags: ['forms', 'boolean', 'selection'],
        complexity: 'low',
        source: '@angular/material/checkbox',
        liveDemo: true,
        accessibility: true,
      },
      {
        id: 'mat-radio',
        name: 'Radio Button',
        description: 'Single selection from multiple options',
        category: 'Form Controls',
        tags: ['forms', 'selection', 'radio'],
        complexity: 'low',
        source: '@angular/material/radio',
        liveDemo: true,
        accessibility: true,
      },
      {
        id: 'mat-slider',
        name: 'Slider',
        description: 'Range selection slider with customizable appearance',
        category: 'Form Controls',
        tags: ['forms', 'range', 'slider'],
        complexity: 'medium',
        source: '@angular/material/slider',
        liveDemo: true,
        accessibility: true,
      },
      {
        id: 'mat-slide-toggle',
        name: 'Slide Toggle',
        description: 'Toggle switch for boolean values',
        category: 'Form Controls',
        tags: ['forms', 'toggle', 'boolean'],
        complexity: 'low',
        source: '@angular/material/slide-toggle',
        liveDemo: true,
        accessibility: true,
      },
      {
        id: 'mat-datepicker',
        name: 'Date Picker',
        description: 'Calendar-based date selection component',
        category: 'Form Controls',
        tags: ['forms', 'date', 'calendar'],
        complexity: 'high',
        source: '@angular/material/datepicker',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },

      // Navigation
      {
        id: 'mat-toolbar',
        name: 'Toolbar',
        description: 'Top navigation bar with actions and branding',
        category: 'Navigation',
        tags: ['navigation', 'header', 'toolbar'],
        complexity: 'low',
        source: '@angular/material/toolbar',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-sidenav',
        name: 'Sidenav',
        description: 'Side navigation drawer with multiple modes',
        category: 'Navigation',
        tags: ['navigation', 'drawer', 'sidebar'],
        complexity: 'high',
        source: '@angular/material/sidenav',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-tabs',
        name: 'Tabs',
        description: 'Tabbed content organization with lazy loading',
        category: 'Navigation',
        tags: ['navigation', 'tabs', 'organization'],
        complexity: 'medium',
        source: '@angular/material/tabs',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-menu',
        name: 'Menu',
        description: 'Context menu dropdown with nested support',
        category: 'Navigation',
        tags: ['navigation', 'menu', 'context'],
        complexity: 'medium',
        source: '@angular/material/menu',
        liveDemo: true,
        accessibility: true,
      },

      // Layout
      {
        id: 'mat-card',
        name: 'Card',
        description: 'Content container with Material Design elevation',
        category: 'Layout',
        tags: ['layout', 'container', 'card'],
        complexity: 'low',
        source: '@angular/material/card',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-expansion-panel',
        name: 'Expansion Panel',
        description: 'Collapsible content sections with accordion support',
        category: 'Layout',
        tags: ['layout', 'accordion', 'collapsible'],
        complexity: 'medium',
        source: '@angular/material/expansion',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-stepper',
        name: 'Stepper',
        description: 'Multi-step workflow with validation support',
        category: 'Layout',
        tags: ['layout', 'workflow', 'steps'],
        complexity: 'high',
        source: '@angular/material/stepper',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-list',
        name: 'List',
        description: 'Structured list display with actions and avatars',
        category: 'Layout',
        tags: ['layout', 'list', 'display'],
        complexity: 'medium',
        source: '@angular/material/list',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-grid-list',
        name: 'Grid List',
        description: 'Grid-based content layout with responsive tiles',
        category: 'Layout',
        tags: ['layout', 'grid', 'tiles'],
        complexity: 'medium',
        source: '@angular/material/grid-list',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-divider',
        name: 'Divider',
        description: 'Visual separator for content sections',
        category: 'Layout',
        tags: ['layout', 'separator', 'divider'],
        complexity: 'low',
        source: '@angular/material/divider',
        liveDemo: true,
      },

      // Buttons & Indicators
      {
        id: 'mat-button',
        name: 'Button',
        description: 'Action buttons with multiple styles and states',
        category: 'Buttons & Indicators',
        tags: ['buttons', 'actions', 'interactive'],
        complexity: 'low',
        source: '@angular/material/button',
        liveDemo: true,
        accessibility: true,
      },
      {
        id: 'mat-fab',
        name: 'Floating Action Button',
        description: 'Prominent action button for primary actions',
        category: 'Buttons & Indicators',
        tags: ['buttons', 'fab', 'primary'],
        complexity: 'medium',
        source: '@angular/material/button',
        liveDemo: true,
        accessibility: true,
      },
      {
        id: 'mat-icon-button',
        name: 'Icon Button',
        description: 'Circular button containing only an icon',
        category: 'Buttons & Indicators',
        tags: ['buttons', 'icons', 'compact'],
        complexity: 'low',
        source: '@angular/material/button',
        liveDemo: true,
        accessibility: true,
      },
      {
        id: 'mat-chip',
        name: 'Chips',
        description:
          'Compact elements representing input, attributes, or actions',
        category: 'Buttons & Indicators',
        tags: ['chips', 'tags', 'selection'],
        complexity: 'medium',
        source: '@angular/material/chips',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-badge',
        name: 'Badge',
        description: 'Small status indicator placed on other elements',
        category: 'Buttons & Indicators',
        tags: ['badge', 'indicator', 'notification'],
        complexity: 'low',
        source: '@angular/material/badge',
        liveDemo: true,
      },
      {
        id: 'mat-progress-bar',
        name: 'Progress Bar',
        description:
          'Linear progress indicator with determinate and indeterminate modes',
        category: 'Buttons & Indicators',
        tags: ['progress', 'loading', 'indicator'],
        complexity: 'low',
        source: '@angular/material/progress-bar',
        liveDemo: true,
        accessibility: true,
      },
      {
        id: 'mat-progress-spinner',
        name: 'Progress Spinner',
        description: 'Circular progress indicator for loading states',
        category: 'Buttons & Indicators',
        tags: ['progress', 'loading', 'spinner'],
        complexity: 'low',
        source: '@angular/material/progress-spinner',
        liveDemo: true,
        accessibility: true,
      },

      // Data Display
      {
        id: 'mat-table',
        name: 'Table',
        description:
          'Feature-rich data table with sorting, filtering, and pagination',
        category: 'Data Display',
        tags: ['table', 'data', 'sorting', 'filtering'],
        complexity: 'high',
        source: '@angular/material/table',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-paginator',
        name: 'Paginator',
        description: 'Navigation controls for paginated data',
        category: 'Data Display',
        tags: ['pagination', 'navigation', 'data'],
        complexity: 'medium',
        source: '@angular/material/paginator',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-sort',
        name: 'Sort Header',
        description: 'Sortable column headers for data tables',
        category: 'Data Display',
        tags: ['sorting', 'table', 'data'],
        complexity: 'medium',
        source: '@angular/material/sort',
        liveDemo: true,
        accessibility: true,
      },
      {
        id: 'mat-tree',
        name: 'Tree',
        description: 'Hierarchical data display with expand/collapse',
        category: 'Data Display',
        tags: ['tree', 'hierarchy', 'data'],
        complexity: 'high',
        source: '@angular/material/tree',
        liveDemo: true,
        accessibility: true,
      },

      // Overlays & Modals
      {
        id: 'mat-dialog',
        name: 'Dialog',
        description: 'Modal dialog boxes with customizable content',
        category: 'Overlays & Modals',
        tags: ['dialog', 'modal', 'overlay'],
        complexity: 'high',
        source: '@angular/material/dialog',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-bottom-sheet',
        name: 'Bottom Sheet',
        description: 'Mobile-style bottom panel overlay',
        category: 'Overlays & Modals',
        tags: ['bottom-sheet', 'mobile', 'overlay'],
        complexity: 'medium',
        source: '@angular/material/bottom-sheet',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'mat-snack-bar',
        name: 'Snackbar',
        description: 'Temporary notification messages',
        category: 'Overlays & Modals',
        tags: ['snackbar', 'notification', 'toast'],
        complexity: 'medium',
        source: '@angular/material/snack-bar',
        liveDemo: true,
        accessibility: true,
      },
      {
        id: 'mat-tooltip',
        name: 'Tooltip',
        description: 'Contextual help text on hover or focus',
        category: 'Overlays & Modals',
        tags: ['tooltip', 'help', 'context'],
        complexity: 'low',
        source: '@angular/material/tooltip',
        liveDemo: true,
        accessibility: true,
      },
    ];

    this.componentData.set('material', {
      id: 'material',
      name: 'Material Design Components',
      description: 'Comprehensive Angular Material component library',
      icon: 'palette',
      components: materialComponents,
    });
  }

  private async initializeAegisxUiComponents(): Promise<void> {
    const aegisxComponents: ComponentExample[] = [
      // Layout Components
      {
        id: 'aegisx-classic-layout',
        name: 'Classic Layout',
        description: 'Traditional layout with header, sidebar, and footer',
        category: 'Layout Components',
        tags: ['layout', 'classic', 'structure'],
        complexity: 'high',
        source: '@aegisx/ui/layout',
        liveDemo: true,
        responsive: true,
      },
      {
        id: 'aegisx-compact-layout',
        name: 'Compact Layout',
        description: 'Space-efficient layout optimized for dashboards',
        category: 'Layout Components',
        tags: ['layout', 'compact', 'dashboard'],
        complexity: 'high',
        source: '@aegisx/ui/layout',
        liveDemo: true,
        responsive: true,
      },
      {
        id: 'aegisx-enterprise-layout',
        name: 'Enterprise Layout',
        description: 'Complex layout for enterprise applications',
        category: 'Layout Components',
        tags: ['layout', 'enterprise', 'complex'],
        complexity: 'high',
        source: '@aegisx/ui/layout',
        liveDemo: true,
        responsive: true,
      },

      // Navigation Components
      {
        id: 'aegisx-nav-menu',
        name: 'Navigation Menu',
        description: 'Multi-level navigation menu with icons and badges',
        category: 'Navigation Components',
        tags: ['navigation', 'menu', 'multilevel'],
        complexity: 'medium',
        source: '@aegisx/ui/navigation',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'aegisx-breadcrumb',
        name: 'Breadcrumb',
        description: 'Hierarchical navigation path indicator',
        category: 'Navigation Components',
        tags: ['navigation', 'breadcrumb', 'path'],
        complexity: 'low',
        source: '@aegisx/ui/navigation',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },

      // Content Components
      {
        id: 'aegisx-card',
        name: 'Enhanced Card',
        description: 'Advanced card component with predefined styles',
        category: 'Content Components',
        tags: ['card', 'content', 'enhanced'],
        complexity: 'medium',
        source: '@aegisx/ui/card',
        liveDemo: true,
        responsive: true,
      },
      {
        id: 'aegisx-alert',
        name: 'Alert',
        description: 'Contextual alert messages with multiple types',
        category: 'Content Components',
        tags: ['alert', 'message', 'notification'],
        complexity: 'low',
        source: '@aegisx/ui/alert',
        liveDemo: true,
        accessibility: true,
      },
      {
        id: 'aegisx-drawer',
        name: 'Advanced Drawer',
        description: 'Feature-rich drawer with animations and positions',
        category: 'Content Components',
        tags: ['drawer', 'navigation', 'animation'],
        complexity: 'high',
        source: '@aegisx/ui/drawer',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },

      // Interactive Components
      {
        id: 'aegisx-loading',
        name: 'Loading Component',
        description: 'Customizable loading animations and overlays',
        category: 'Interactive Components',
        tags: ['loading', 'animation', 'overlay'],
        complexity: 'medium',
        source: '@aegisx/ui/loading',
        liveDemo: true,
      },
      {
        id: 'aegisx-user-menu',
        name: 'User Menu',
        description: 'User profile dropdown with avatar and actions',
        category: 'Interactive Components',
        tags: ['user', 'profile', 'menu'],
        complexity: 'medium',
        source: '@aegisx/ui/user',
        liveDemo: true,
        accessibility: true,
      },
      {
        id: 'aegisx-fullscreen',
        name: 'Fullscreen Toggle',
        description: 'Fullscreen mode activation component',
        category: 'Interactive Components',
        tags: ['fullscreen', 'toggle', 'viewport'],
        complexity: 'low',
        source: '@aegisx/ui/fullscreen',
        liveDemo: true,
      },
    ];

    this.componentData.set('aegisx', {
      id: 'aegisx',
      name: 'AegisX UI Components',
      description: 'Custom AegisX UI library components',
      icon: 'architecture',
      components: aegisxComponents,
    });
  }

  private async initializeApplicationWidgets(): Promise<void> {
    const widgets: ComponentExample[] = [
      // Dashboard Widgets
      {
        id: 'stats-card',
        name: 'Stats Card',
        description: 'Metric display card with trends and comparisons',
        category: 'Dashboard Widgets',
        tags: ['dashboard', 'stats', 'metrics'],
        complexity: 'low',
        source: 'apps/web/components/widgets',
        liveDemo: true,
        responsive: true,
      },
      {
        id: 'chart-widget',
        name: 'Chart Widget',
        description: 'Chart.js integration for data visualization',
        category: 'Dashboard Widgets',
        tags: ['dashboard', 'charts', 'visualization'],
        complexity: 'high',
        source: 'apps/web/components/widgets',
        liveDemo: true,
        responsive: true,
      },
      {
        id: 'progress-widget',
        name: 'Progress Widget',
        description: 'Progress tracking with multiple visualization types',
        category: 'Dashboard Widgets',
        tags: ['dashboard', 'progress', 'tracking'],
        complexity: 'medium',
        source: 'apps/web/components/widgets',
        liveDemo: true,
      },
      {
        id: 'quick-actions',
        name: 'Quick Actions',
        description: 'Grid of action buttons for common tasks',
        category: 'Dashboard Widgets',
        tags: ['dashboard', 'actions', 'shortcuts'],
        complexity: 'medium',
        source: 'apps/web/components/widgets',
        liveDemo: true,
        responsive: true,
      },
      {
        id: 'activity-timeline',
        name: 'Activity Timeline',
        description: 'Chronological display of user activities',
        category: 'Dashboard Widgets',
        tags: ['dashboard', 'timeline', 'activity'],
        complexity: 'high',
        source: 'apps/web/components/widgets',
        liveDemo: true,
        responsive: true,
      },

      // Feature Components
      {
        id: 'user-list',
        name: 'User List',
        description: 'Comprehensive user management table component',
        category: 'Feature Components',
        tags: ['users', 'management', 'table'],
        complexity: 'high',
        source: 'apps/web/features/users',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'user-detail',
        name: 'User Detail',
        description: 'Detailed user information display and editing',
        category: 'Feature Components',
        tags: ['users', 'detail', 'profile'],
        complexity: 'high',
        source: 'apps/web/features/users',
        liveDemo: true,
        responsive: true,
      },
    ];

    this.componentData.set('widgets', {
      id: 'widgets',
      name: 'Application Widgets',
      description: 'Dashboard widgets and application-specific components',
      icon: 'dashboard',
      components: widgets,
    });
  }

  private async initializeInteractiveDemos(): Promise<void> {
    const demos: ComponentExample[] = [
      {
        id: 'user-registration-demo',
        name: 'User Registration Form',
        description: 'Complete user registration workflow with validation',
        category: 'Form Workflows',
        tags: ['forms', 'registration', 'validation', 'workflow'],
        complexity: 'high',
        source: 'showcase/demos',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'data-dashboard-demo',
        name: 'Data Management Dashboard',
        description:
          'Complex dashboard with charts, tables, and real-time updates',
        category: 'Dashboard Examples',
        tags: ['dashboard', 'data', 'charts', 'realtime'],
        complexity: 'high',
        source: 'showcase/demos',
        liveDemo: true,
        responsive: true,
      },
      {
        id: 'settings-panel-demo',
        name: 'Settings Panel',
        description:
          'Comprehensive settings interface with tabs and preferences',
        category: 'UI Patterns',
        tags: ['settings', 'preferences', 'tabs'],
        complexity: 'medium',
        source: 'showcase/demos',
        liveDemo: true,
        responsive: true,
        accessibility: true,
      },
      {
        id: 'e-commerce-demo',
        name: 'E-commerce Product Catalog',
        description: 'Product listing with filters, search, and shopping cart',
        category: 'UI Patterns',
        tags: ['ecommerce', 'products', 'shopping'],
        complexity: 'high',
        source: 'showcase/demos',
        liveDemo: true,
        responsive: true,
      },
    ];

    this.componentData.set('demos', {
      id: 'demos',
      name: 'Interactive Demos',
      description: 'Real-world usage examples and complex interactions',
      icon: 'play_circle',
      components: demos,
    });
  }
}
