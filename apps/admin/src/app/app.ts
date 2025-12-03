import {
  AxCompactLayoutComponent,
  AxDocsLayoutComponent,
  AxLayoutSwitcherComponent,
  LayoutType,
  SplashScreenService,
  SplashScreenStage,
  AxSplashScreenComponent,
} from '@aegisx/ui';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { TremorThemeSwitcherComponent } from './components/tremor-theme-switcher.component';
import {
  COMPACT_NAVIGATION,
  DOCS_NAVIGATION,
} from './config/navigation.config';
import { isStandaloneRoute, isDocsRoute } from './config/layout.config';

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

  // App metadata
  protected readonly title = 'AegisX Design System';
  protected readonly appName = 'AegisX Admin';
  protected readonly appVersion = 'v1.0.0';
  protected currentLayout = signal<LayoutType>('compact');

  // Navigation configuration (imported from centralized config)
  protected readonly navigation = COMPACT_NAVIGATION;
  protected readonly docsNavigation = DOCS_NAVIGATION;

  // Current URL tracking for layout decisions
  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  // Layout visibility computed from URL
  protected readonly showLayout = computed(() => {
    const url = this.currentUrl();
    return !isStandaloneRoute(url);
  });

  // Docs layout detection
  protected readonly isDocsRoute = computed(() => {
    const url = this.currentUrl();
    return isDocsRoute(url);
  });

  ngOnInit(): void {
    this.initializeSplashScreen();
  }

  onLayoutChange(layout: LayoutType): void {
    this.currentLayout.set(layout);
    console.log('Layout changed to:', layout);
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
        label: 'Loading configuration',
        icon: 'settings',
        status: 'pending',
      },
      {
        id: 'theme',
        label: 'Preparing theme',
        icon: 'palette',
        status: 'pending',
      },
      {
        id: 'components',
        label: 'Loading components',
        icon: 'widgets',
        status: 'pending',
      },
      {
        id: 'ui',
        label: 'Preparing UI',
        icon: 'dashboard',
        status: 'pending',
      },
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
}
