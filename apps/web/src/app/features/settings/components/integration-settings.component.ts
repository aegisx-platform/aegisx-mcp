import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AegisxCardComponent } from '@aegisx/ui';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  configured: boolean;
  category: 'auth' | 'storage' | 'communication' | 'analytics' | 'payment';
}

@Component({
  selector: 'ax-integration-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    AegisxCardComponent,
  ],
  template: `
    <!-- API Keys Section -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        API Keys
      </h3>

      <ax-card [appearance]="'outlined'" class="mb-4">
        <div class="flex justify-between items-center mb-4">
          <div>
            <p class="font-medium text-gray-900 dark:text-gray-100">
              API Access
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Manage API keys for external integrations
            </p>
          </div>
          <button mat-raised-button color="primary" (click)="generateAPIKey()">
            <mat-icon>add</mat-icon>
            Generate New Key
          </button>
        </div>

        <div class="space-y-3">
          @for (key of apiKeys(); track key.id) {
            <div
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="flex-1">
                <p class="font-mono text-sm">{{ key.key }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  Created: {{ key.created }}
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  mat-icon-button
                  matTooltip="Copy API Key"
                  (click)="copyAPIKey(key)"
                >
                  <mat-icon>content_copy</mat-icon>
                </button>
                <button
                  mat-icon-button
                  matTooltip="Revoke Key"
                  color="warn"
                  (click)="revokeAPIKey(key)"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      </ax-card>
    </div>

    <mat-divider class="mb-8"></mat-divider>

    <!-- OAuth Providers -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Authentication Providers
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (
          provider of getIntegrationsByCategory('auth');
          track provider.id
        ) {
          <ax-card [appearance]="'outlined'" class="relative">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <div
                  class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                >
                  <mat-icon class="text-2xl">{{ provider.icon }}</mat-icon>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    {{ provider.name }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ provider.description }}
                  </p>
                </div>
              </div>
              <mat-slide-toggle
                [(ngModel)]="provider.enabled"
                (change)="toggleIntegration(provider)"
                color="primary"
              ></mat-slide-toggle>
            </div>
            @if (provider.enabled) {
              <div class="mt-4">
                @if (provider.configured) {
                  <div class="flex items-center text-green-600">
                    <mat-icon class="text-lg mr-1">check_circle</mat-icon>
                    <span class="text-sm">Configured</span>
                  </div>
                } @else {
                  <button
                    mat-stroked-button
                    (click)="configureIntegration(provider)"
                  >
                    <mat-icon>settings</mat-icon>
                    Configure
                  </button>
                }
              </div>
            }
          </ax-card>
        }
      </div>
    </div>

    <mat-divider class="mb-8"></mat-divider>

    <!-- Cloud Storage -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Cloud Storage
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (
          provider of getIntegrationsByCategory('storage');
          track provider.id
        ) {
          <ax-card [appearance]="'outlined'" class="relative">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <div
                  class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                >
                  <mat-icon class="text-2xl">{{ provider.icon }}</mat-icon>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    {{ provider.name }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ provider.description }}
                  </p>
                </div>
              </div>
              <mat-slide-toggle
                [(ngModel)]="provider.enabled"
                (change)="toggleIntegration(provider)"
                color="primary"
              ></mat-slide-toggle>
            </div>
          </ax-card>
        }
      </div>
    </div>

    <mat-divider class="mb-8"></mat-divider>

    <!-- Webhooks -->
    <div>
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Webhooks
      </h3>

      <ax-card [appearance]="'outlined'">
        <div class="flex justify-between items-center mb-4">
          <div>
            <p class="font-medium text-gray-900 dark:text-gray-100">
              Webhook Endpoints
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Configure webhooks to receive real-time updates
            </p>
          </div>
          <button mat-raised-button color="primary" (click)="addWebhook()">
            <mat-icon>add</mat-icon>
            Add Webhook
          </button>
        </div>

        @if (webhooks().length === 0) {
          <div class="text-center py-8 text-gray-500">
            <mat-icon class="text-4xl">webhook</mat-icon>
            <p class="mt-2">No webhooks configured</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (webhook of webhooks(); track webhook.id) {
              <div
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div class="flex-1">
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    {{ webhook.url }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    Events: {{ webhook.events.join(', ') }}
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    mat-icon-button
                    matTooltip="Test Webhook"
                    (click)="testWebhook(webhook)"
                  >
                    <mat-icon>send</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    matTooltip="Edit"
                    (click)="editWebhook(webhook)"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    matTooltip="Delete"
                    color="warn"
                    (click)="deleteWebhook(webhook)"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </ax-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class IntegrationSettingsComponent {
  @Output() settingsChange = new EventEmitter<any>();

  apiKeys = signal([
    { id: '1', key: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc', created: '2024-01-15' },
    { id: '2', key: 'sk_test_7hF42KlMnBVcxR9wT2efp8ab', created: '2024-02-01' },
  ]);

  webhooks = signal([
    {
      id: '1',
      url: 'https://example.com/webhook',
      events: ['user.created', 'user.updated'],
    },
  ]);

  integrations: Integration[] = [
    // Auth providers
    {
      id: 'google-oauth',
      name: 'Google OAuth',
      description: 'Sign in with Google',
      icon: 'login',
      enabled: true,
      configured: true,
      category: 'auth',
    },
    {
      id: 'github-oauth',
      name: 'GitHub OAuth',
      description: 'Sign in with GitHub',
      icon: 'code',
      enabled: false,
      configured: false,
      category: 'auth',
    },
    {
      id: 'saml',
      name: 'SAML 2.0',
      description: 'Enterprise SSO',
      icon: 'business',
      enabled: false,
      configured: false,
      category: 'auth',
    },
    // Storage providers
    {
      id: 'aws-s3',
      name: 'AWS S3',
      description: 'Amazon S3 storage',
      icon: 'cloud',
      enabled: true,
      configured: true,
      category: 'storage',
    },
    {
      id: 'google-cloud',
      name: 'Google Cloud Storage',
      description: 'GCS bucket storage',
      icon: 'cloud_queue',
      enabled: false,
      configured: false,
      category: 'storage',
    },
  ];

  getIntegrationsByCategory(category: string): Integration[] {
    return this.integrations.filter((i) => i.category === category);
  }

  generateAPIKey(): void {
    const newKey = {
      id: Date.now().toString(),
      key: `sk_test_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
    };
    this.apiKeys.update((keys) => [...keys, newKey]);
    this.emitChanges();
  }

  copyAPIKey(key: any): void {
    navigator.clipboard.writeText(key.key);
    // Show success message
  }

  revokeAPIKey(key: any): void {
    this.apiKeys.update((keys) => keys.filter((k) => k.id !== key.id));
    this.emitChanges();
  }

  toggleIntegration(integration: Integration): void {
    this.emitChanges();
  }

  configureIntegration(integration: Integration): void {
    console.log('Configure integration:', integration);
    // Open configuration dialog
  }

  addWebhook(): void {
    console.log('Add webhook');
    // Open webhook dialog
  }

  testWebhook(webhook: any): void {
    console.log('Test webhook:', webhook);
  }

  editWebhook(webhook: any): void {
    console.log('Edit webhook:', webhook);
  }

  deleteWebhook(webhook: any): void {
    this.webhooks.update((hooks) => hooks.filter((h) => h.id !== webhook.id));
    this.emitChanges();
  }

  private emitChanges(): void {
    this.settingsChange.emit({
      integrations: {
        apiKeys: this.apiKeys(),
        webhooks: this.webhooks(),
        providers: this.integrations,
      },
    });
  }
}
