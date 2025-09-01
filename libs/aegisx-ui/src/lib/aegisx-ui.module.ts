import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AegisxConfig } from './types/config.types';
import { AEGISX_CONFIG, AegisxConfigService } from './services/config/config.service';

@NgModule({
  imports: [CommonModule],
  exports: []
})
export class AegisxUIModule {
  /**
   * Module with providers
   */
  static forRoot(config?: Partial<AegisxConfig>): ModuleWithProviders<AegisxUIModule> {
    return {
      ngModule: AegisxUIModule,
      providers: [
        {
          provide: AEGISX_CONFIG,
          useValue: config || {}
        },
        AegisxConfigService
      ]
    };
  }
}