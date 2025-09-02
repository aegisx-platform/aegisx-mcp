import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AegisxCardComponent, AegisxAlertComponent } from '@aegisx/ui';

@Component({
  selector: 'ax-cards-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    AegisxCardComponent,
    AegisxAlertComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Card Components</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Examples of card component variations from @aegisx/ui library.
        </p>
      </div>

      <!-- Alert -->
      <ax-alert type="info" class="mb-8">
        Cards are versatile components that can contain various types of content including text, images, and actions.
      </ax-alert>

      <!-- Card Appearances -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">Card Appearances</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- Basic Card -->
          <ax-card>
            <h3 class="text-lg font-semibold mb-2">Basic Card</h3>
            <p class="text-gray-600 dark:text-gray-400">
              This is a basic card with default appearance. It provides a clean container for your content.
            </p>
          </ax-card>

          <!-- Outlined Card -->
          <ax-card appearance="outlined">
            <h3 class="text-lg font-semibold mb-2">Outlined Card</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Outlined cards have a border instead of elevation, perfect for secondary content.
            </p>
          </ax-card>

          <!-- Elevated Card -->
          <ax-card appearance="elevated">
            <h3 class="text-lg font-semibold mb-2">Elevated Card</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Elevated cards have a stronger shadow for emphasis and visual hierarchy.
            </p>
          </ax-card>
        </div>
      </section>

      <!-- Cards with Headers -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">Cards with Headers</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Card with Title -->
          <ax-card 
            title="Card with Title"
            appearance="outlined"
          >
            <p class="text-gray-600 dark:text-gray-400">
              This card has a title in the header section. The title helps organize content and improves scannability.
            </p>
          </ax-card>

          <!-- Card with Title and Subtitle -->
          <ax-card 
            title="Card with Subtitle"
            subtitle="Supporting text for additional context"
            appearance="outlined"
          >
            <p class="text-gray-600 dark:text-gray-400">
              Both title and subtitle can be used together to provide more context about the card's content.
            </p>
          </ax-card>

          <!-- Card with Icon -->
          <ax-card 
            title="Card with Icon"
            subtitle="Icons add visual interest"
            icon="star"
            appearance="outlined"
          >
            <p class="text-gray-600 dark:text-gray-400">
              Icons in the header help users quickly identify the card's purpose or category.
            </p>
          </ax-card>

          <!-- Card with All Header Elements -->
          <ax-card 
            title="Complete Header"
            subtitle="All header elements combined"
            icon="dashboard"
            appearance="elevated"
          >
            <p class="text-gray-600 dark:text-gray-400">
              This card demonstrates all header elements working together: icon, title, and subtitle.
            </p>
          </ax-card>
        </div>
      </section>

      <!-- Cards with Actions -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">Cards with Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Card with Actions -->
          <ax-card 
            title="Action Card"
            subtitle="Interactive elements"
            icon="touch_app"
            appearance="outlined"
          >
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Cards can include action buttons for user interactions. Place them in the card-actions slot.
            </p>
            <div card-actions>
              <button mat-button>CANCEL</button>
              <button mat-button color="primary">SAVE</button>
            </div>
          </ax-card>

          <!-- Card with Icon Actions -->
          <ax-card 
            title="Social Card"
            subtitle="With icon actions"
            appearance="elevated"
          >
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Icon buttons work great for compact actions like social interactions or quick actions.
            </p>
            <div card-actions>
              <button mat-icon-button>
                <mat-icon>favorite_border</mat-icon>
              </button>
              <button mat-icon-button>
                <mat-icon>share</mat-icon>
              </button>
              <button mat-icon-button>
                <mat-icon>more_vert</mat-icon>
              </button>
            </div>
          </ax-card>
        </div>
      </section>

      <!-- Complex Cards -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">Complex Card Examples</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Stats Card -->
          <ax-card 
            title="Performance Metrics"
            subtitle="Last 30 days"
            icon="analytics"
            appearance="elevated"
          >
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                <p class="text-2xl font-bold text-primary">98.5%</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
              </div>
              <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                <p class="text-2xl font-bold text-green-600">245ms</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Avg Response</p>
              </div>
            </div>
            <div card-actions>
              <button mat-button color="primary">VIEW DETAILS</button>
            </div>
          </ax-card>

          <!-- Feature Card -->
          <ax-card appearance="outlined" class="overflow-hidden">
            <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-2"></div>
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2">Premium Features</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                Unlock advanced capabilities with our premium plan.
              </p>
              <ul class="space-y-2 mb-4">
                <li class="flex items-center">
                  <mat-icon class="text-green-500 mr-2">check_circle</mat-icon>
                  <span>Advanced Analytics</span>
                </li>
                <li class="flex items-center">
                  <mat-icon class="text-green-500 mr-2">check_circle</mat-icon>
                  <span>Priority Support</span>
                </li>
                <li class="flex items-center">
                  <mat-icon class="text-green-500 mr-2">check_circle</mat-icon>
                  <span>Custom Integrations</span>
                </li>
              </ul>
              <div card-actions>
                <button mat-raised-button color="primary" class="w-full">
                  UPGRADE NOW
                </button>
              </div>
            </div>
          </ax-card>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .text-primary {
      color: #1976d2;
    }
  `]
})
export class CardsPage {}