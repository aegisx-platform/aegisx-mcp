import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyLayoutComponent } from '@aegisx/ui';

/**
 * Auth Shell Component
 *
 * Shell component for authentication routes (login, register, forgot-password, etc.)
 * Uses AxEmptyLayoutComponent for a clean, centered layout.
 *
 * Note: EmptyLayoutComponent already includes <router-outlet>,
 * so we don't need to add it here.
 */
@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, EmptyLayoutComponent],
  template: `<ax-empty-layout></ax-empty-layout>`,
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
