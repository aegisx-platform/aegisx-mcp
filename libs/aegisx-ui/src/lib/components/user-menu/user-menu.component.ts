import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'ax-user-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="userMenu"
      class="ax-user-menu-trigger"
    >
      @if (user()?.avatar) {
        <img 
          [src]="user()?.avatar" 
          alt="User avatar"
          class="ax-user-avatar"
        />
      } @else {
        <mat-icon>account_circle</mat-icon>
      }
    </button>

    <mat-menu #userMenu="matMenu" class="ax-user-menu">
      <div class="ax-user-info" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()" tabindex="-1">
        <div class="ax-user-avatar-large">
          @if (user()?.avatar) {
            <img 
              [src]="user()?.avatar" 
              alt="User avatar"
            />
          } @else {
            <mat-icon>account_circle</mat-icon>
          }
        </div>
        <div class="ax-user-details">
          <div class="ax-user-name">{{ user()?.name || 'Guest' }}</div>
          <div class="ax-user-email">{{ user()?.email || '' }}</div>
        </div>
      </div>
      
      <mat-divider></mat-divider>
      
      <button mat-menu-item (click)="navigateToProfile()">
        <mat-icon>person</mat-icon>
        <span>Profile</span>
      </button>
      
      <button mat-menu-item (click)="navigateToSettings()">
        <mat-icon>settings</mat-icon>
        <span>Settings</span>
      </button>
      
      <mat-divider></mat-divider>
      
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Logout</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .ax-user-menu-trigger {
      overflow: hidden;
    }

    .ax-user-avatar {
      @apply w-8 h-8 rounded-full object-cover;
    }

    .ax-user-info {
      @apply flex items-center gap-3 px-4 py-3;
      min-width: 280px;
    }

    .ax-user-avatar-large {
      @apply w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center;
      
      img {
        @apply w-full h-full object-cover;
      }
      
      mat-icon {
        @apply text-gray-500 dark:text-gray-400;
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }

    .ax-user-details {
      @apply flex-1;
    }

    .ax-user-name {
      @apply font-medium text-gray-900 dark:text-gray-100;
    }

    .ax-user-email {
      @apply text-sm text-gray-500 dark:text-gray-400;
    }
  `]
})
export class UserMenuComponent {
  private _router = inject(Router);
  
  // TODO: Replace with actual user service
  user = signal({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null as string | null
  });
  
  navigateToProfile(): void {
    this._router.navigate(['/profile']);
  }
  
  navigateToSettings(): void {
    this._router.navigate(['/settings']);
  }
  
  logout(): void {
    // TODO: Implement logout logic
    this._router.navigate(['/auth/logout']);
  }
}