import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  APP_INITIALIZER,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  AegisxConfigService,
  AegisxNavigationService,
  IconService,
  provideAx,
} from '@aegisx/ui';
import { appRoutes } from './app.routes';
import { provideGlobalErrorHandler } from './core/error-handling';
import { httpErrorInterceptorProvider } from './core/http';
import { authInterceptor } from './core/auth';
import { baseUrlInterceptor } from './core/http';
import { MonitoringService } from './core/monitoring';

// Factory function to initialize monitoring service
function initializeMonitoring() {
  return () => {
    const monitoringService = inject(MonitoringService);
    monitoringService.initialize();
    return Promise.resolve();
  };
}

// Factory function to initialize icons
function initializeIcons() {
  return () => {
    const iconService = inject(IconService);
    // Icons are registered in the constructor
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(withInterceptors([baseUrlInterceptor, authInterceptor])),

    // Error handling and monitoring
    provideGlobalErrorHandler(),
    httpErrorInterceptorProvider,

    // Initialize monitoring service
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMonitoring,
      multi: true,
    },

    // Initialize icons
    {
      provide: APP_INITIALIZER,
      useFactory: initializeIcons,
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
  ],
};
