import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AegisxCardComponent } from '@aegisx/ui';

export interface ActivityItem {
  id: string | number;
  title: string;
  description?: string;
  time: string;
  icon: string;
  color: 'primary' | 'accent' | 'warn' | 'success' | 'info';
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

@Component({
  selector: 'ax-activity-timeline',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    AegisxCardComponent,
  ],
  template: `
    <ax-card
      [title]="title"
      [subtitle]="subtitle"
      [icon]="'history'"
      [appearance]="'elevated'"
      class="h-full"
    >
      <div card-header-actions>
        <button mat-icon-button [matMenuTriggerFor]="menu">
          <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="refreshActivities()">
            <mat-icon>refresh</mat-icon>
            <span>Refresh</span>
          </button>
          <button mat-menu-item (click)="filterActivities('all')">
            <mat-icon>filter_list</mat-icon>
            <span>All Activities</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="filterActivities('critical')">
            <mat-icon class="text-red-600">error</mat-icon>
            <span>Critical Only</span>
          </button>
          <button mat-menu-item (click)="filterActivities('user')">
            <mat-icon class="text-blue-600">person</mat-icon>
            <span>User Activities</span>
          </button>
        </mat-menu>
      </div>

      <div class="activity-timeline">
        @if (loading()) {
          <div class="text-center py-8">
            <mat-icon class="text-4xl text-gray-400 animate-pulse"
              >hourglass_empty</mat-icon
            >
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Loading activities...
            </p>
          </div>
        } @else if (activities.length === 0) {
          <div class="text-center py-8">
            <mat-icon class="text-4xl text-gray-400">inbox</mat-icon>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              No activities to show
            </p>
          </div>
        } @else {
          <div class="space-y-4">
            @for (activity of displayedActivities(); track activity.id) {
              <div class="flex space-x-3">
                <div class="flex-shrink-0">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center"
                    [ngClass]="getActivityColorClass(activity.color)"
                  >
                    <mat-icon class="text-white text-lg">{{
                      activity.icon
                    }}</mat-icon>
                  </div>
                </div>
                <div class="flex-1 space-y-1">
                  <div class="flex items-center justify-between">
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      {{ activity.title }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ activity.time }}
                    </p>
                  </div>
                  @if (activity.description) {
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ activity.description }}
                    </p>
                  }
                  @if (activity.user) {
                    <div class="flex items-center space-x-2 mt-2">
                      @if (activity.user.avatar) {
                        <img
                          [src]="activity.user.avatar"
                          [alt]="activity.user.name"
                          class="w-6 h-6 rounded-full"
                        />
                      } @else {
                        <div
                          class="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center"
                        >
                          <span class="text-xs text-white">{{
                            getInitials(activity.user.name)
                          }}</span>
                        </div>
                      }
                      <span class="text-xs text-gray-600 dark:text-gray-400">
                        {{ activity.user.name }}
                      </span>
                    </div>
                  }
                </div>
              </div>
              @if (!$last) {
                <div
                  class="ml-5 border-l-2 border-gray-200 dark:border-gray-700 h-4"
                ></div>
              }
            }
          </div>
        }
      </div>

      @if (hasMore && !loading()) {
        <div class="mt-4 text-center">
          <button
            mat-button
            color="primary"
            (click)="loadMore()"
            class="w-full"
          >
            Load More
            <mat-icon class="ml-1">expand_more</mat-icon>
          </button>
        </div>
      }
    </ax-card>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .activity-timeline {
        max-height: 400px;
        overflow-y: auto;
        padding-right: 8px;
      }

      .activity-timeline::-webkit-scrollbar {
        width: 4px;
      }

      .activity-timeline::-webkit-scrollbar-track {
        @apply bg-gray-200 dark:bg-gray-700 rounded;
      }

      .activity-timeline::-webkit-scrollbar-thumb {
        @apply bg-gray-400 dark:bg-gray-600 rounded;
      }

      .bg-activity-primary {
        @apply bg-blue-500;
      }
      .bg-activity-accent {
        @apply bg-pink-500;
      }
      .bg-activity-warn {
        @apply bg-orange-500;
      }
      .bg-activity-success {
        @apply bg-green-500;
      }
      .bg-activity-info {
        @apply bg-cyan-500;
      }
    `,
  ],
})
export class ActivityTimelineComponent {
  @Input() title = 'Recent Activities';
  @Input() subtitle = 'Latest system events';
  @Input() activities: ActivityItem[] = [];
  @Input() itemsPerPage = 5;

  loading = signal(false);
  currentFilter = signal<'all' | 'critical' | 'user'>('all');
  displayCount = signal(5);

  get hasMore(): boolean {
    return this.displayCount() < this.filteredActivities().length;
  }

  displayedActivities = signal<ActivityItem[]>([]);

  ngOnInit() {
    this.updateDisplayedActivities();
  }

  ngOnChanges() {
    this.updateDisplayedActivities();
  }

  private updateDisplayedActivities(): void {
    const filtered = this.filteredActivities();
    const count = this.displayCount();
    this.displayedActivities.set(filtered.slice(0, count));
  }

  private filteredActivities(): ActivityItem[] {
    const filter = this.currentFilter();
    if (filter === 'all') return this.activities;

    if (filter === 'critical') {
      return this.activities.filter(
        (a) => a.color === 'warn' || a.icon === 'error',
      );
    }

    if (filter === 'user') {
      return this.activities.filter((a) => a.user !== undefined);
    }

    return this.activities;
  }

  getActivityColorClass(color: string): string {
    return `bg-activity-${color}`;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  refreshActivities(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 1000);
  }

  filterActivities(filter: 'all' | 'critical' | 'user'): void {
    this.currentFilter.set(filter);
    this.displayCount.set(this.itemsPerPage);
    this.updateDisplayedActivities();
  }

  loadMore(): void {
    this.displayCount.update((count) => count + this.itemsPerPage);
    this.updateDisplayedActivities();
  }
}
