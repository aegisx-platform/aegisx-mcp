import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'ax-empty-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="ax-empty-layout">
      <div class="ax-empty-layout-content">
        <ng-content></ng-content>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-height: 100vh;
      }

      .ax-empty-layout {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 100vh;
        padding: var(--ax-spacing-xl) var(--ax-spacing-md);
        box-sizing: border-box;
        background-color: var(--ax-background-muted);
        overflow-y: auto;
      }

      .ax-empty-layout-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 500px;
      }
    `,
  ],
})
export class EmptyLayoutComponent {}
