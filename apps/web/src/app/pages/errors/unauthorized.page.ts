import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="max-w-md w-full space-y-8 text-center">
        <!-- Icon -->
        <div class="flex justify-center">
          <div class="rounded-full bg-violet-100 p-6">
            <mat-icon class="!text-7xl !w-20 !h-20 text-violet-600"
              >lock</mat-icon
            >
          </div>
        </div>

        <!-- Error Code -->
        <div>
          <h1 class="text-6xl font-bold text-slate-900">401</h1>
          <h2 class="mt-2 text-3xl font-bold text-slate-900">
            Authentication Required
          </h2>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <p class="text-lg text-slate-600">
            You need to be authenticated to access this resource.
          </p>
          <p class="text-sm text-slate-500">
            Your session may have expired. Please log in again to continue.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            mat-raised-button
            color="primary"
            (click)="goToLogin()"
            class="!rounded-lg"
          >
            <mat-icon class="mr-2">login</mat-icon>
            Go to Login
          </button>
          <button mat-stroked-button (click)="goHome()" class="!rounded-lg">
            <mat-icon class="mr-2">home</mat-icon>
            Go to Dashboard
          </button>
        </div>

        <!-- Additional Help -->
        <div class="pt-6 border-t border-slate-200">
          <p class="text-sm text-slate-500">
            Having trouble logging in?
            <a
              routerLink="/forgot-password"
              class="text-blue-600 hover:text-blue-700 font-medium ml-1"
            >
              Reset Password
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class UnauthorizedPage {
  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
