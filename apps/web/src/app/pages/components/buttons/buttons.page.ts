import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AegisxCardComponent, AegisxAlertComponent } from '@aegisx/ui';

@Component({
  selector: 'ax-buttons-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    AegisxCardComponent,
    AegisxAlertComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Button Components</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Examples of button variations using Angular Material.
        </p>
      </div>

      <!-- Alert -->
      <ax-alert type="info" class="mb-8">
        Angular Material provides various button styles that work seamlessly with @aegisx/ui themes.
      </ax-alert>

      <!-- Basic Buttons -->
      <section class="mb-12">
        <ax-card title="Basic Buttons" subtitle="Different button styles" appearance="outlined">
          <div class="flex flex-wrap gap-4">
            <button mat-button>Basic</button>
            <button mat-raised-button>Raised</button>
            <button mat-stroked-button>Stroked</button>
            <button mat-flat-button>Flat</button>
            <button mat-fab>
              <mat-icon>add</mat-icon>
            </button>
            <button mat-mini-fab>
              <mat-icon>add</mat-icon>
            </button>
          </div>
        </ax-card>
      </section>

      <!-- Color Variations -->
      <section class="mb-12">
        <ax-card title="Color Variations" subtitle="Theme color options" appearance="outlined">
          <div class="space-y-4">
            <!-- Primary -->
            <div>
              <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Primary</h4>
              <div class="flex flex-wrap gap-4">
                <button mat-button color="primary">Basic</button>
                <button mat-raised-button color="primary">Raised</button>
                <button mat-stroked-button color="primary">Stroked</button>
                <button mat-flat-button color="primary">Flat</button>
                <button mat-fab color="primary">
                  <mat-icon>favorite</mat-icon>
                </button>
                <button mat-mini-fab color="primary">
                  <mat-icon>favorite</mat-icon>
                </button>
              </div>
            </div>

            <!-- Accent -->
            <div>
              <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Accent</h4>
              <div class="flex flex-wrap gap-4">
                <button mat-button color="accent">Basic</button>
                <button mat-raised-button color="accent">Raised</button>
                <button mat-stroked-button color="accent">Stroked</button>
                <button mat-flat-button color="accent">Flat</button>
                <button mat-fab color="accent">
                  <mat-icon>bookmark</mat-icon>
                </button>
                <button mat-mini-fab color="accent">
                  <mat-icon>bookmark</mat-icon>
                </button>
              </div>
            </div>

            <!-- Warn -->
            <div>
              <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Warn</h4>
              <div class="flex flex-wrap gap-4">
                <button mat-button color="warn">Basic</button>
                <button mat-raised-button color="warn">Raised</button>
                <button mat-stroked-button color="warn">Stroked</button>
                <button mat-flat-button color="warn">Flat</button>
                <button mat-fab color="warn">
                  <mat-icon>delete</mat-icon>
                </button>
                <button mat-mini-fab color="warn">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </ax-card>
      </section>

      <!-- Icon Buttons -->
      <section class="mb-12">
        <ax-card title="Icon Buttons" subtitle="Buttons with icons" appearance="outlined">
          <div class="flex flex-wrap gap-4">
            <button mat-icon-button>
              <mat-icon>favorite</mat-icon>
            </button>
            <button mat-icon-button color="primary">
              <mat-icon>share</mat-icon>
            </button>
            <button mat-icon-button color="accent">
              <mat-icon>bookmark</mat-icon>
            </button>
            <button mat-icon-button color="warn">
              <mat-icon>delete</mat-icon>
            </button>
            <button mat-raised-button color="primary">
              <mat-icon>save</mat-icon>
              Save
            </button>
            <button mat-stroked-button>
              <mat-icon>cloud_upload</mat-icon>
              Upload
            </button>
          </div>
        </ax-card>
      </section>

      <!-- Button States -->
      <section class="mb-12">
        <ax-card title="Button States" subtitle="Different button states" appearance="outlined">
          <div class="space-y-4">
            <!-- Disabled -->
            <div>
              <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Disabled</h4>
              <div class="flex flex-wrap gap-4">
                <button mat-button disabled>Disabled</button>
                <button mat-raised-button disabled>Disabled</button>
                <button mat-stroked-button disabled>Disabled</button>
                <button mat-flat-button disabled>Disabled</button>
              </div>
            </div>

            <!-- Loading -->
            <div>
              <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Loading State</h4>
              <div class="flex flex-wrap gap-4">
                <button mat-raised-button color="primary" [disabled]="isLoading">
                  @if (isLoading) {
                    <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                  }
                  {{ isLoading ? 'Loading...' : 'Click to Load' }}
                </button>
                <button mat-stroked-button (click)="toggleLoading()">
                  Toggle Loading
                </button>
              </div>
            </div>
          </div>
        </ax-card>
      </section>

      <!-- Button Groups -->
      <section class="mb-12">
        <ax-card title="Button Groups" subtitle="Grouped button examples" appearance="outlined">
          <div class="space-y-4">
            <!-- Toggle Group -->
            <div>
              <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Toggle Group</h4>
              <mat-button-toggle-group>
                <mat-button-toggle value="left">
                  <mat-icon>format_align_left</mat-icon>
                </mat-button-toggle>
                <mat-button-toggle value="center">
                  <mat-icon>format_align_center</mat-icon>
                </mat-button-toggle>
                <mat-button-toggle value="right">
                  <mat-icon>format_align_right</mat-icon>
                </mat-button-toggle>
                <mat-button-toggle value="justify">
                  <mat-icon>format_align_justify</mat-icon>
                </mat-button-toggle>
              </mat-button-toggle-group>
            </div>

            <!-- Action Group -->
            <div>
              <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Action Group</h4>
              <div class="inline-flex rounded-md shadow-sm">
                <button mat-stroked-button class="rounded-r-none">Previous</button>
                <button mat-stroked-button class="rounded-none border-l-0">Current</button>
                <button mat-stroked-button class="rounded-l-none border-l-0">Next</button>
              </div>
            </div>
          </div>
        </ax-card>
      </section>

      <!-- Extended FAB -->
      <section class="mb-12">
        <ax-card title="Extended FAB" subtitle="Floating action buttons with text" appearance="outlined">
          <div class="flex flex-wrap gap-4">
            <button mat-fab extended>
              <mat-icon>add</mat-icon>
              Create New
            </button>
            <button mat-fab extended color="primary">
              <mat-icon>edit</mat-icon>
              Edit Item
            </button>
            <button mat-fab extended color="accent">
              <mat-icon>favorite</mat-icon>
              Add to Favorites
            </button>
            <button mat-fab extended color="warn">
              <mat-icon>delete</mat-icon>
              Delete Item
            </button>
          </div>
        </ax-card>
      </section>
    </div>
  `,
  styles: [`
    mat-spinner {
      display: inline-block;
      vertical-align: middle;
    }
  `]
})
export class ButtonsPage {
  isLoading = false;

  toggleLoading() {
    this.isLoading = !this.isLoading;
    if (this.isLoading) {
      setTimeout(() => {
        this.isLoading = false;
      }, 3000);
    }
  }
}