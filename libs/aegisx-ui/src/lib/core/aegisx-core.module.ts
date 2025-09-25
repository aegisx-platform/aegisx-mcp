import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AegisxConfig } from '../types/config.types';
import {
  AEGISX_CONFIG,
  AegisxConfigService,
} from '../services/config/config.service';
import { AegisxNavigationService } from '../services/navigation/navigation.service';
import { AegisxMediaWatcherService } from '../services/media-watcher/media-watcher.service';
import { AegisxLoadingService } from '../services/loading/loading.service';

/**
 * Core module providing essential AegisX services
 * Required for all AegisX UI functionality
 */
@NgModule({
  imports: [CommonModule],
  providers: [
    AegisxConfigService,
    AegisxNavigationService,
    AegisxMediaWatcherService,
    AegisxLoadingService,
  ],
})
export class AegisxCoreModule {
  /**
   * Call this method in your app module to configure AegisX
   */
  static forRoot(
    config?: Partial<AegisxConfig>,
  ): ModuleWithProviders<AegisxCoreModule> {
    return {
      ngModule: AegisxCoreModule,
      providers: [
        {
          provide: AEGISX_CONFIG,
          useValue: config || {},
        },
      ],
    };
  }
}
