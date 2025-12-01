import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { EmptyLayoutComponent } from '@aegisx/ui';

/**
 * Auth Shell Component
 *
 * Shell component for authentication routes (login, register, forgot-password, etc.)
 * Uses AxEmptyLayoutComponent for a clean, centered layout.
 */
@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, EmptyLayoutComponent],
  template: `
    <ax-empty-layout>
      <router-outlet></router-outlet>
    </ax-empty-layout>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }
    `,
  ],
})
export class AuthShellComponent {}
