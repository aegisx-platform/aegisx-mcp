import { Component, Input, Output, EventEmitter, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'ax-drawer',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  template: `
    <mat-drawer-container class="ax-drawer-container">
      <mat-drawer
        #drawer
        [position]="position"
        [mode]="mode"
        [disableClose]="disableClose"
        [autoFocus]="autoFocus"
        [opened]="opened()"
        (openedChange)="onOpenedChange($event)"
        (openedStart)="openedStart.emit()"
        (closedStart)="closedStart.emit()"
        class="ax-drawer"
        [class]="drawerClass"
      >
        <!-- Header -->
        @if (showHeader) {
          <mat-toolbar class="ax-drawer-header">
            <h2 class="ax-drawer-title">{{ title }}</h2>
            <span class="ax-drawer-spacer"></span>
            @if (showCloseButton) {
              <button 
                mat-icon-button 
                (click)="close()"
                [attr.aria-label]="'Close drawer'"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-toolbar>
        }
        
        <!-- Content -->
        <div class="ax-drawer-content">
          <ng-content></ng-content>
        </div>
        
        <!-- Footer -->
        @if (showFooter) {
          <div class="ax-drawer-footer">
            <ng-content select="[drawer-footer]"></ng-content>
          </div>
        }
      </mat-drawer>
      
      <!-- Main content -->
      <mat-drawer-content class="ax-drawer-main">
        <ng-content select="[drawer-content]"></ng-content>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .ax-drawer-container {
      @apply h-full;
    }

    .ax-drawer {
      @apply flex flex-col bg-white dark:bg-gray-900;
      
      &.ax-drawer-sm {
        width: 320px;
      }
      
      &.ax-drawer-md {
        width: 480px;
      }
      
      &.ax-drawer-lg {
        width: 640px;
      }
      
      &.ax-drawer-full {
        width: 100%;
        max-width: 100%;
      }
    }

    .ax-drawer-header {
      @apply flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700;
      height: 64px;
    }

    .ax-drawer-title {
      @apply text-lg font-semibold m-0;
    }

    .ax-drawer-spacer {
      @apply flex-1;
    }

    .ax-drawer-content {
      @apply flex-1 overflow-y-auto p-4 md:p-6;
    }

    .ax-drawer-footer {
      @apply flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700;
      @apply bg-gray-50 dark:bg-gray-800;
    }

    .ax-drawer-main {
      @apply bg-gray-50 dark:bg-gray-900;
    }

    /* Mobile styles */
    @media (max-width: 767px) {
      .ax-drawer {
        &.ax-drawer-sm,
        &.ax-drawer-md,
        &.ax-drawer-lg {
          width: 100%;
          max-width: calc(100% - 56px);
        }
      }
    }
  `]
})
export class AegisxDrawerComponent {
  @ViewChild('drawer', { static: true }) drawer!: MatDrawer;
  
  @Input() title = '';
  @Input() position: 'start' | 'end' = 'end';
  @Input() mode: 'over' | 'push' | 'side' = 'over';
  @Input() size: 'sm' | 'md' | 'lg' | 'full' = 'md';
  @Input() disableClose = false;
  @Input() autoFocus = true;
  @Input() showHeader = true;
  @Input() showFooter = false;
  @Input() showCloseButton = true;
  
  @Output() openedChange = new EventEmitter<boolean>();
  @Output() openedStart = new EventEmitter<void>();
  @Output() closedStart = new EventEmitter<void>();
  
  opened = signal(false);
  
  get drawerClass(): string {
    return `ax-drawer-${this.size}`;
  }
  
  open(): void {
    this.opened.set(true);
  }
  
  close(): void {
    this.opened.set(false);
  }
  
  toggle(): void {
    this.opened.update(value => !value);
  }
  
  onOpenedChange(opened: boolean): void {
    this.opened.set(opened);
    this.openedChange.emit(opened);
  }
}