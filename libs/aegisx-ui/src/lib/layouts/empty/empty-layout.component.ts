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
  styles: [`
    :host {
      display: flex;
      flex: 1 1 auto;
      width: 100%;
      height: 100%;
    }

    .ax-empty-layout {
      display: flex;
      flex: 1 1 auto;
      width: 100%;
      height: 100%;
      min-height: 100vh;
      background-color: rgb(var(--ax-bg-default) / 1);
    }

    .ax-empty-layout-content {
      display: flex;
      flex: 1 1 auto;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    /* Dark mode */
    :host-context(.dark) .ax-empty-layout {
      background-color: rgb(var(--ax-bg-default) / 1);
    }
  `]
})
export class EmptyLayoutComponent {}