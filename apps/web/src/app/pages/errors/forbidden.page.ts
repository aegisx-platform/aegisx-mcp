import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="max-w-md w-full space-y-8 text-center">
        <!-- Icon -->
        <div class="flex justify-center">
          <div class="rounded-full bg-amber-100 p-6">
            <mat-icon class="!text-7xl !w-20 !h-20 text-amber-600"
              >block</mat-icon
            >
          </div>
        </div>

        <!-- Error Code -->
        <div>
          <h1 class="text-6xl font-bold text-slate-900">403</h1>
          <h2 class="mt-2 text-3xl font-bold text-slate-900">Access Denied</h2>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <p class="text-lg text-slate-600">
            You don't have permission to access this resource.
          </p>
          <p class="text-sm text-slate-500">
            If you believe this is an error, please contact your administrator
            or check that you have the necessary permissions.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            mat-raised-button
            color="primary"
            (click)="goHome()"
            class="!rounded-lg"
          >
            <mat-icon class="mr-2">home</mat-icon>
            Go to Dashboard
          </button>
          <button mat-stroked-button (click)="goBack()" class="!rounded-lg">
            <mat-icon class="mr-2">arrow_back</mat-icon>
            Go Back
          </button>
        </div>

        <!-- Additional Help -->
        <div class="pt-6 border-t border-slate-200">
          <p class="text-sm text-slate-500">
            Need help?
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
export class ForbiddenPage {
  constructor(
    private router: Router,
    private location: Location,
  ) {}

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    this.location.back();
  }
}
