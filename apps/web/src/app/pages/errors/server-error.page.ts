import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="max-w-md w-full space-y-8 text-center">
        <!-- Icon -->
        <div class="flex justify-center">
          <div class="rounded-full bg-red-100 p-6">
            <mat-icon class="!text-7xl !w-20 !h-20 text-red-600"
              >error</mat-icon
            >
          </div>
        </div>

        <!-- Error Code -->
        <div>
          <h1 class="text-6xl font-bold text-slate-900">500</h1>
          <h2 class="mt-2 text-3xl font-bold text-slate-900">Server Error</h2>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <p class="text-lg text-slate-600">
            Something went wrong on our end. We're working to fix it!
          </p>
          <p class="text-sm text-slate-500">
            Our team has been notified. Please try again in a few moments or
            contact support if the problem persists.
          </p>
        </div>

        <!-- Error Info (Optional) -->
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-800">
            <mat-icon class="text-sm align-middle mr-1">warning</mat-icon>
            The server encountered an unexpected error
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            mat-raised-button
            color="primary"
            (click)="refreshPage()"
            class="!rounded-lg"
          >
            <mat-icon class="mr-2">refresh</mat-icon>
            Try Again
          </button>
          <button mat-stroked-button (click)="goHome()" class="!rounded-lg">
            <mat-icon class="mr-2">home</mat-icon>
            Go to Dashboard
          </button>
        </div>

        <!-- Additional Help -->
        <div class="pt-6 border-t border-slate-200">
          <p class="text-sm text-slate-500">
            Still having issues?
            <a
              routerLink="/support"
              class="text-blue-600 hover:text-blue-700 font-medium ml-1"
            >
              Contact Support
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
export class ServerErrorPage {
  constructor(
    private router: Router,
    private location: Location,
  ) {}

  refreshPage(): void {
    window.location.reload();
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
