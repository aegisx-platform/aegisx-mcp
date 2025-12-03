import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface SocialProvider {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

export interface SocialLoginConfig {
  dividerText?: string;
  layout?: 'horizontal' | 'vertical';
  showDivider?: boolean;
  buttonStyle?: 'icon-only' | 'icon-text' | 'text-only';
}

/**
 * AegisX Social Login Component
 *
 * A reusable social login button group supporting multiple providers.
 *
 * @example
 * ```html
 * <ax-social-login
 *   [providers]="['google', 'github', 'microsoft']"
 *   [loading]="'google'"
 *   (providerClick)="onSocialLogin($event)"
 * />
 * ```
 */
@Component({
  selector: 'ax-social-login',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    @if (config.showDivider) {
      <div class="divider-container">
        <mat-divider></mat-divider>
        <span class="divider-text">{{ config.dividerText }}</span>
        <mat-divider></mat-divider>
      </div>
    }

    <div
      class="social-login-container"
      [ngClass]="{
        'layout-horizontal': config.layout === 'horizontal',
        'layout-vertical': config.layout === 'vertical',
      }"
    >
      @for (provider of resolvedProviders; track provider.id) {
        <button
          mat-stroked-button
          type="button"
          class="social-button"
          [ngClass]="'provider-' + provider.id"
          [disabled]="loading === provider.id || disabled"
          (click)="onProviderClick(provider.id)"
        >
          @if (loading === provider.id) {
            <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
          } @else if (config.buttonStyle !== 'text-only') {
            <mat-icon [svgIcon]="provider.icon" class="provider-icon">
              {{ getDefaultIcon(provider.id) }}
            </mat-icon>
          }
          @if (config.buttonStyle !== 'icon-only') {
            <span class="provider-name">{{ provider.name }}</span>
          }
        </button>
      }
    </div>
  `,
  styles: [
    `
      .divider-container {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;

        mat-divider {
          flex: 1;
        }
      }

      .divider-text {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
        white-space: nowrap;
      }

      .social-login-container {
        display: flex;
        gap: 0.75rem;

        &.layout-horizontal {
          flex-direction: row;

          .social-button {
            flex: 1;
          }
        }

        &.layout-vertical {
          flex-direction: column;

          .social-button {
            width: 100%;
          }
        }
      }

      .social-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        height: 44px;
        font-weight: 500;
        transition: all 0.2s ease;
        min-width: 0;

        &:hover:not(:disabled) {
          background-color: var(--ax-background-muted) !important;
          border-color: var(--ax-brand-default) !important;
        }

        &:disabled {
          opacity: 0.7;
        }
      }

      .provider-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .provider-name {
        font-size: 0.875rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .button-spinner {
        ::ng-deep circle {
          stroke: var(--ax-brand-default) !important;
        }
      }

      // Provider-specific styles
      .provider-google {
        &:hover:not(:disabled) {
          border-color: #4285f4 !important;
        }
      }

      .provider-github {
        &:hover:not(:disabled) {
          border-color: #333 !important;
        }
      }

      .provider-microsoft {
        &:hover:not(:disabled) {
          border-color: #00a4ef !important;
        }
      }

      .provider-apple {
        &:hover:not(:disabled) {
          border-color: #000 !important;
        }
      }

      .provider-facebook {
        &:hover:not(:disabled) {
          border-color: #1877f2 !important;
        }
      }

      .provider-twitter {
        &:hover:not(:disabled) {
          border-color: #1da1f2 !important;
        }
      }

      .provider-linkedin {
        &:hover:not(:disabled) {
          border-color: #0a66c2 !important;
        }
      }
    `,
  ],
})
export class AxSocialLoginComponent {
  /** List of provider IDs or full provider objects */
  @Input() set providers(value: (string | SocialProvider)[]) {
    this.resolvedProviders = value.map((p) =>
      typeof p === 'string' ? this.getDefaultProvider(p) : p,
    );
  }

  /** Currently loading provider ID */
  @Input() loading: string | null = null;

  /** Disable all buttons */
  @Input() disabled = false;

  /** Component configuration */
  @Input() set config(value: Partial<SocialLoginConfig>) {
    this._config = { ...this.defaultConfig, ...value };
  }
  get config(): SocialLoginConfig {
    return this._config;
  }

  /** Emits provider ID when clicked */
  @Output() providerClick = new EventEmitter<string>();

  resolvedProviders: SocialProvider[] = [];

  private defaultConfig: SocialLoginConfig = {
    dividerText: 'or continue with',
    layout: 'horizontal',
    showDivider: true,
    buttonStyle: 'icon-text',
  };

  private _config: SocialLoginConfig = this.defaultConfig;

  private defaultProviders: Record<string, SocialProvider> = {
    google: { id: 'google', name: 'Google', icon: 'google' },
    github: { id: 'github', name: 'GitHub', icon: 'github' },
    microsoft: { id: 'microsoft', name: 'Microsoft', icon: 'microsoft' },
    apple: { id: 'apple', name: 'Apple', icon: 'apple' },
    facebook: { id: 'facebook', name: 'Facebook', icon: 'facebook' },
    twitter: { id: 'twitter', name: 'X', icon: 'twitter' },
    linkedin: { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin' },
  };

  constructor() {
    // Default providers
    this.resolvedProviders = [
      this.defaultProviders['google'],
      this.defaultProviders['github'],
    ];
  }

  getDefaultProvider(id: string): SocialProvider {
    return (
      this.defaultProviders[id] || {
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        icon: id,
      }
    );
  }

  getDefaultIcon(providerId: string): string {
    const iconMap: Record<string, string> = {
      google: 'g_mobiledata',
      github: 'code',
      microsoft: 'window',
      apple: 'apple',
      facebook: 'facebook',
      twitter: 'alternate_email',
      linkedin: 'work',
    };
    return iconMap[providerId] || 'login';
  }

  onProviderClick(providerId: string): void {
    this.providerClick.emit(providerId);
  }
}
