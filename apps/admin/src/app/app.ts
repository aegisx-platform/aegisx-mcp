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

  protected title = 'Theme Testing App';
  protected appName = 'AegisX Theme Testing';
  protected appVersion = 'v1.0';
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

  // Navigation items for theme testing app
  navigation: AxNavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      icon: 'dashboard',
      link: '/dashboard',
    },
    {
      id: 'components',
      title: 'Material Components',
      type: 'item',
      icon: 'widgets',
      link: '/components',
    },
    {
      id: 'design-tokens',
      title: 'Design Tokens',
      type: 'item',
      icon: 'color_lens',
      link: '/design-tokens',
    },
    {
      id: 'aegisx-components',
      title: 'AegisX Components',
      type: 'item',
      icon: 'extension',
      link: '/aegisx-components',
    },
    {
      id: 'layouts',
      title: 'Layouts',
      type: 'collapsible',
      icon: 'view_quilt',
      children: [
        {
          id: 'layout-compact',
          title: 'Compact Layout',
          type: 'item',
          link: '/layouts/compact',
        },
        {
          id: 'layout-enterprise',
          title: 'Enterprise Layout',
          type: 'item',
          link: '/layouts/enterprise',
        },
        {
          id: 'layout-empty',
          title: 'Empty Layout',
          type: 'item',
          link: '/layouts/empty',
        },
      ],
    },
    {
      id: 'themes',
      title: 'Themes',
      type: 'collapsible',
      icon: 'palette',
      children: [
        {
          id: 'theme-material',
          title: 'Material Design 3',
          type: 'item',
          link: '/themes/material',
        },
        {
          id: 'theme-tremor',
          title: 'Tremor',
          type: 'item',
          link: '/themes/tremor',
        },
        {
          id: 'theme-custom',
          title: 'Custom Themes',
          type: 'item',
          link: '/themes/custom',
        },
      ],
    },
    {
      id: 'users',
      title: 'User Management',
      type: 'item',
      icon: 'people',
      link: '/users',
    },
  ];

  onLayoutChange(layout: LayoutType): void {
    this.currentLayout.set(layout);
    console.log('Layout changed to:', layout);
    // TODO: Implement actual layout switching logic
    // This will be implemented when we create Enterprise and Empty layout components
  }
}
