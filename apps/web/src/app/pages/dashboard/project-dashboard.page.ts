import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';

interface StatItem {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  trend?: 'up' | 'down';
}

@Component({
  selector: 'ax-project-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    MatTabsModule,
  ],
  template: `
    <div class="flex min-w-0 flex-auto flex-col">
      <!-- Header -->
      <div class="bg-card">
        <div class="mx-auto flex w-full max-w-screen-xl flex-col px-6 sm:px-8">
          <div class="my-8 flex min-w-0 flex-auto flex-col sm:my-12 sm:flex-row sm:items-center">
            <!-- Avatar and name -->
            <div class="flex min-w-0 flex-auto items-center">
              <div class="h-16 w-16 flex-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <mat-icon class="text-gray-600 dark:text-gray-300 icon-size-6">person</mat-icon>
              </div>
              <div class="ml-4 flex min-w-0 flex-col">
                <div class="truncate text-2xl font-semibold leading-7 tracking-tight md:text-5xl md:leading-snug">
                  Welcome back, Brian!
                </div>
                <div class="flex items-center">
                  <mat-icon class="icon-size-5 text-secondary">notifications</mat-icon>
                  <div class="text-secondary ml-1.5 truncate leading-6">
                    You have 2 new messages and 15 new tasks
                  </div>
                </div>
              </div>
            </div>
            <!-- Actions -->
            <div class="mt-6 flex items-center space-x-3 sm:ml-2 sm:mt-0">
              <button mat-flat-button color="accent" class="bg-accent">
                <mat-icon class="icon-size-5">mail</mat-icon>
                <span class="ml-2">Messages</span>
              </button>
              <button mat-flat-button color="primary">
                <mat-icon class="icon-size-5">settings</mat-icon>
                <span class="ml-2">Settings</span>
              </button>
            </div>
          </div>
          <!-- Project selector -->
          <div
            class="bg-default relative flex cursor-pointer self-start overflow-hidden rounded-t-xl border border-b-0 pb-1 pl-5 pr-4 pt-2"
            matRipple
            [matMenuTriggerFor]="projectsMenu"
          >
            <div class="flex items-center">
              <div class="overflow-hidden">
                <div class="truncate font-medium leading-6">
                  {{ selectedProject() }}
                </div>
              </div>
              <div class="flex items-center justify-center pl-2">
                <mat-icon class="icon-size-5">expand_more</mat-icon>
              </div>
            </div>
            <mat-menu #projectsMenu="matMenu" [xPosition]="'before'">
              @for (project of projects(); track project) {
                <button mat-menu-item (click)="selectProject(project)">
                  {{ project }}
                </button>
              }
            </mat-menu>
          </div>
        </div>
      </div>

      <!-- Main -->
      <div class="-mt-px flex-auto border-t pt-4 sm:pt-6">
        <div class="mx-auto w-full max-w-screen-xl">
          <!-- Tabs -->
          <mat-tab-group
            class="sm:px-2"
            mat-stretch-tabs="false"
            [animationDuration]="'0'"
          >
            <!-- Home -->
            <mat-tab label="Home">
              <ng-template matTabContent>
                <div class="grid w-full min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                  <!-- Summary Card -->
                  <div class="bg-card flex flex-auto flex-col overflow-hidden rounded-2xl p-6 shadow">
                    <div class="flex items-start justify-between">
                      <div class="truncate text-lg font-medium leading-6 tracking-tight">
                        Summary
                      </div>
                      <div class="-mr-3 -mt-2 ml-2">
                        <button mat-icon-button [matMenuTriggerFor]="summaryMenu">
                          <mat-icon class="icon-size-5">more_vert</mat-icon>
                        </button>
                        <mat-menu #summaryMenu="matMenu">
                          <button mat-menu-item>Yesterday</button>
                          <button mat-menu-item>2 days ago</button>
                          <button mat-menu-item>3 days ago</button>
                        </mat-menu>
                      </div>
                    </div>
                    <div class="mt-2 flex flex-col items-center">
                      <div class="text-7xl font-bold leading-none tracking-tight text-blue-500 sm:text-8xl">
                        21
                      </div>
                      <div class="text-lg font-medium text-blue-600 dark:text-blue-500">
                        Due Tasks
                      </div>
                      <div class="text-secondary mt-5 flex w-full items-baseline justify-center">
                        <div class="truncate text-md font-medium">
                          Completed:
                        </div>
                        <div class="ml-1.5 text-lg font-semibold">
                          13
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Overdue Card -->
                  <div class="bg-card flex flex-auto flex-col overflow-hidden rounded-2xl p-6 shadow">
                    <div class="flex items-start justify-between">
                      <div class="truncate text-lg font-medium leading-6 tracking-tight">
                        Overdue
                      </div>
                      <div class="-mr-3 -mt-2 ml-2">
                        <button mat-icon-button>
                          <mat-icon class="icon-size-5">more_vert</mat-icon>
                        </button>
                      </div>
                    </div>
                    <div class="mt-2 flex flex-col items-center">
                      <div class="text-7xl font-bold leading-none tracking-tight text-red-500 sm:text-8xl">
                        4
                      </div>
                      <div class="text-lg font-medium text-red-600 dark:text-red-500">
                        Tasks
                      </div>
                      <div class="text-secondary mt-5 flex w-full items-baseline justify-center">
                        <div class="truncate text-md font-medium">
                          Yesterday:
                        </div>
                        <div class="ml-1.5 text-lg font-semibold">
                          2
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Issues Card -->
                  <div class="bg-card flex flex-auto flex-col overflow-hidden rounded-2xl p-6 shadow">
                    <div class="flex items-start justify-between">
                      <div class="truncate text-lg font-medium leading-6 tracking-tight">
                        Issues
                      </div>
                      <div class="-mr-3 -mt-2 ml-2">
                        <button mat-icon-button>
                          <mat-icon class="icon-size-5">more_vert</mat-icon>
                        </button>
                      </div>
                    </div>
                    <div class="mt-2 flex flex-col items-center">
                      <div class="text-7xl font-bold leading-none tracking-tight text-amber-500 sm:text-8xl">
                        32
                      </div>
                      <div class="text-lg font-medium text-amber-600 dark:text-amber-500">
                        Open
                      </div>
                      <div class="text-secondary mt-5 flex w-full items-baseline justify-center">
                        <div class="truncate text-md font-medium">
                          Closed:
                        </div>
                        <div class="ml-1.5 text-lg font-semibold">
                          8
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Features Card -->
                  <div class="bg-card flex flex-auto flex-col overflow-hidden rounded-2xl p-6 shadow">
                    <div class="flex items-start justify-between">
                      <div class="truncate text-lg font-medium leading-6 tracking-tight">
                        Features
                      </div>
                      <div class="-mr-3 -mt-2 ml-2">
                        <button mat-icon-button>
                          <mat-icon class="icon-size-5">more_vert</mat-icon>
                        </button>
                      </div>
                    </div>
                    <div class="mt-2 flex flex-col items-center">
                      <div class="text-7xl font-bold leading-none tracking-tight text-green-500 sm:text-8xl">
                        42
                      </div>
                      <div class="text-lg font-medium text-green-600 dark:text-green-500">
                        Proposals
                      </div>
                      <div class="text-secondary mt-5 flex w-full items-baseline justify-center">
                        <div class="truncate text-md font-medium">
                          Implemented:
                        </div>
                        <div class="ml-1.5 text-lg font-semibold">
                          8
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Charts and content would go here -->
                <div class="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  <!-- Additional dashboard content -->
                  @for (i of [1,2,3,4,5,6]; track i) {
                    <div class="bg-card rounded-2xl p-6 shadow">
                      <h3 class="text-lg font-semibold mb-4">Chart {{ i }}</h3>
                      <div class="h-64 flex items-center justify-center text-secondary">
                        Chart placeholder
                      </div>
                    </div>
                  }
                </div>
              </ng-template>
            </mat-tab>

            <!-- Budget -->
            <mat-tab label="Budget">
              <ng-template matTabContent>
                <div class="p-6">
                  <h2 class="text-2xl font-semibold mb-4">Budget Overview</h2>
                  <div class="bg-card rounded-2xl p-6 shadow">
                    <p class="text-secondary">Budget content goes here</p>
                  </div>
                </div>
              </ng-template>
            </mat-tab>

            <!-- Team Members -->
            <mat-tab label="Team Members">
              <ng-template matTabContent>
                <div class="p-6">
                  <h2 class="text-2xl font-semibold mb-4">Team Members</h2>
                  <div class="bg-card rounded-2xl p-6 shadow">
                    <p class="text-secondary">Team members content goes here</p>
                  </div>
                </div>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex: 1 1 auto;
      width: 100%;
    }
  `]
})
export class ProjectDashboardPage {
  selectedProject = signal('ACME Corp. Backend App');
  
  projects = signal([
    'ACME Corp. Backend App',
    'ACME Corp. Frontend App',
    'Creapond',
    'Withinpixels'
  ]);

  selectProject(project: string): void {
    this.selectedProject.set(project);
  }
}