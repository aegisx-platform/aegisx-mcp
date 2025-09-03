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
import { AegisxConfigService, AegisxNavigationService } from '@aegisx/ui';
import { appRoutes } from './app.routes';
import { provideGlobalErrorHandler } from './core/error-handler.service';
import { httpErrorInterceptorProvider } from './core/http-error.interceptor';
import { MonitoringService } from './core/monitoring.service';

// Factory function to initialize monitoring service
function initializeMonitoring() {
  return () => {
    const monitoringService = inject(MonitoringService);
    monitoringService.initialize();
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(withInterceptors([])),

    // Error handling and monitoring
    provideGlobalErrorHandler(),
    httpErrorInterceptorProvider,

    // Initialize monitoring service
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMonitoring,
      multi: true,
    },

    AegisxConfigService,
    AegisxNavigationService,
  ],
};
