import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AegisxConfigService } from '../../services/config/config.service';

// Import all layout components
import { EmptyLayoutComponent } from '../empty/empty-layout.component';
import { ClassicLayoutComponent } from '../classic/classic-layout.component';
import { CompactLayoutComponent } from '../compact/compact-layout.component';
import { EnterpriseLayoutComponent } from '../enterprise/enterprise-layout.component';

@Component({
  selector: 'ax-layout',
  standalone: true,
  imports: [
    CommonModule,
    EmptyLayoutComponent,
    ClassicLayoutComponent,
    CompactLayoutComponent,
    EnterpriseLayoutComponent,
  ],
  template: `
    <div class="ax-layout-wrapper">
      @switch (layout()) {
        @case ('empty') {
          <ax-empty-layout>
            <ng-content></ng-content>
          </ax-empty-layout>
        }
        @case ('classic') {
          <ax-classic-layout>
            <ng-content></ng-content>
          </ax-classic-layout>
        }
        @case ('compact') {
          <ax-compact-layout>
            <ng-content></ng-content>
          </ax-compact-layout>
        }
        @case ('enterprise') {
          <ax-enterprise-layout>
            <ng-content></ng-content>
          </ax-enterprise-layout>
        }
        @default {
          <ax-classic-layout>
            <ng-content></ng-content>
          </ax-classic-layout>
        }
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1 1 auto;
        width: 100%;
        height: 100%;
      }

      .ax-layout-wrapper {
        display: flex;
        flex: 1 1 auto;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class LayoutWrapperComponent {
  private _configService = inject(AegisxConfigService);

  // Get current layout type from config
  layout = computed(() => this._configService.layout()?.default || 'classic');
}
