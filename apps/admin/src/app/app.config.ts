import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  APP_INITIALIZER,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import {
  AegisxConfigService,
  AegisxNavigationService,
  IconService,
  provideAx,
} from '@aegisx/ui';
import { appRoutes } from './app.routes';
import { TremorThemeService } from './services/tremor-theme.service';

// Factory function to initialize icons
function initializeIcons() {
  return () => {
    const iconService = inject(IconService);
    // Icons are registered in the constructor
    return Promise.resolve();
  };
}

// Factory function to initialize Tremor theme
function initializeTremorTheme() {
  return () => {
    const themeService = inject(TremorThemeService);
    // Theme is initialized in the constructor
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(),

    // Initialize icons
    {
      provide: APP_INITIALIZER,
      useFactory: initializeIcons,
      multi: true,
    },

    // Initialize Tremor theme
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTremorTheme,
      multi: true,
    },

    // Ax providers
    ...provideAx({
      ax: {
        layout: 'classic',
        scheme: 'light',
        screens: {
          sm: '600px',
          md: '960px',
          lg: '1280px',
          xl: '1440px',
        },
        theme: 'default',
        themes: [
          {
            id: 'default',
            name: 'Default',
          },
        ],
      },
    }),

    AegisxConfigService,
    AegisxNavigationService,
    IconService,
    TremorThemeService,
  ],
};
