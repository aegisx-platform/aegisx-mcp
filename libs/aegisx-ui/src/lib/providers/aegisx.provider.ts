import { Provider } from '@angular/core';
import { AegisxConfig } from '../types/config.types';
import {
  AEGISX_CONFIG,
  AegisxConfigService,
} from '../services/config/config.service';
import { AegisxNavigationService } from '../services/navigation/navigation.service';
import { AegisxMediaWatcherService } from '../services/media-watcher/media-watcher.service';
import { AegisxLoadingService } from '../services/loading/loading.service';

/**
 * Provides AegisX UI library configuration and services
 * for standalone Angular applications
 */
export function provideAegisxUI(config?: Partial<AegisxConfig>): Provider[] {
  return [
    {
      provide: AEGISX_CONFIG,
      useValue: config || {},
    },
    AegisxConfigService,
    AegisxNavigationService,
    AegisxMediaWatcherService,
    AegisxLoadingService,
  ];
}

/**
 * Provides only AegisX configuration service
 * for apps that want minimal setup
 */
export function provideAegisxConfig(config: Partial<AegisxConfig>): Provider[] {
  return [
    {
      provide: AEGISX_CONFIG,
      useValue: config,
    },
    AegisxConfigService,
  ];
}

/**
 * Provides AegisX layout-related services
 * for apps using only layout components
 */
export function provideAegisxLayouts(
  config?: Partial<AegisxConfig>,
): Provider[] {
  return [
    {
      provide: AEGISX_CONFIG,
      useValue: config || {},
    },
    AegisxConfigService,
    AegisxNavigationService,
    AegisxMediaWatcherService,
  ];
}

/**
 * Provides AegisX component-related services
 * for apps using only individual components
 */
export function provideAegisxComponents(
  config?: Partial<AegisxConfig>,
): Provider[] {
  return [
    {
      provide: AEGISX_CONFIG,
      useValue: config || {},
    },
    AegisxConfigService,
    AegisxLoadingService,
  ];
}
