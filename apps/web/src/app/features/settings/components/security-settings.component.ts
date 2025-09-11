import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'ax-security-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  template: `
    <form [formGroup]="securityForm">
      <!-- Password Policy -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Password Policy
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Minimum Password Length</mat-label>
            <input
              matInput
              formControlName="minPasswordLength"
              type="number"
              min="6"
              max="32"
            />
            <mat-icon matSuffix>lock</mat-icon>
            <mat-hint>Minimum characters required (6-32)</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Password Expiry (days)</mat-label>
            <input
              matInput
              formControlName="passwordExpiry"
              type="number"
              min="0"
              max="365"
            />
            <mat-icon matSuffix>event</mat-icon>
            <mat-hint>0 = Never expire</mat-hint>
          </mat-form-field>
        </div>

        <div class="space-y-4 mt-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Require Uppercase Letters
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Password must contain at least one uppercase letter
              </p>
            </div>
            <mat-slide-toggle
              formControlName="requireUppercase"
              color="primary"
            ></mat-slide-toggle>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Require Numbers
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Password must contain at least one number
              </p>
            </div>
            <mat-slide-toggle
              formControlName="requireNumbers"
              color="primary"
            ></mat-slide-toggle>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Require Special Characters
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Password must contain at least one special character
              </p>
            </div>
            <mat-slide-toggle
              formControlName="requireSpecialChars"
              color="primary"
            ></mat-slide-toggle>
          </div>
        </div>
      </div>

      <mat-divider class="mb-8"></mat-divider>

      <!-- Authentication Settings -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Authentication Settings
        </h3>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Two-Factor Authentication
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Require 2FA for all users
              </p>
            </div>
            <mat-slide-toggle
              formControlName="require2FA"
              color="primary"
            ></mat-slide-toggle>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Session Timeout (minutes)</mat-label>
            <input
              matInput
              formControlName="sessionTimeout"
              type="number"
              min="5"
              max="1440"
            />
            <mat-icon matSuffix>timer</mat-icon>
            <mat-hint
              >Automatic logout after inactivity (5-1440 minutes)</mat-hint
            >
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Max Login Attempts</mat-label>
            <input
              matInput
              formControlName="maxLoginAttempts"
              type="number"
              min="3"
              max="10"
            />
            <mat-icon matSuffix>block</mat-icon>
            <mat-hint>Lock account after failed attempts</mat-hint>
          </mat-form-field>
        </div>
      </div>

      <mat-divider class="mb-8"></mat-divider>

      <!-- IP Whitelist -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          IP Whitelist
        </h3>

        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="font-medium text-gray-900 dark:text-gray-100">
              Enable IP Whitelist
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Only allow access from specified IP addresses
            </p>
          </div>
          <mat-slide-toggle
            formControlName="enableIPWhitelist"
            color="primary"
          ></mat-slide-toggle>
        </div>

        @if (securityForm.get('enableIPWhitelist')?.value) {
          <div class="space-y-2">
            <div class="flex space-x-2">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Add IP Address</mat-label>
                <input
                  matInput
                  [(ngModel)]="newIP"
                  [ngModelOptions]="{ standalone: true }"
                  placeholder="192.168.1.1"
                  (keyup.enter)="addIP()"
                />
                <mat-icon matSuffix>computer</mat-icon>
              </mat-form-field>
              <button
                mat-raised-button
                color="primary"
                (click)="addIP()"
                class="mt-2"
              >
                <mat-icon>add</mat-icon>
                Add
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              @for (ip of whitelistedIPs(); track ip) {
                <mat-chip [removable]="true" (removed)="removeIP(ip)">
                  {{ ip }}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }
            </div>
          </div>
        }
      </div>

      <mat-divider class="mb-8"></mat-divider>

      <!-- Security Headers -->
      <div>
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Security Headers
        </h3>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Enable HSTS
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                HTTP Strict Transport Security
              </p>
            </div>
            <mat-slide-toggle
              formControlName="enableHSTS"
              color="primary"
            ></mat-slide-toggle>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                Enable CSP
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Content Security Policy
              </p>
            </div>
            <mat-slide-toggle
              formControlName="enableCSP"
              color="primary"
            ></mat-slide-toggle>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">
                X-Frame-Options
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Prevent clickjacking attacks
              </p>
            </div>
            <mat-select formControlName="xFrameOptions" class="ml-4">
              <mat-option value="DENY">DENY</mat-option>
              <mat-option value="SAMEORIGIN">SAMEORIGIN</mat-option>
              <mat-option value="ALLOW">ALLOW</mat-option>
            </mat-select>
          </div>
        </div>
      </div>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      mat-form-field {
        margin-bottom: 4px;
      }

      mat-chip {
        margin: 2px;
      }
    `,
  ],
})
export class SecuritySettingsComponent {
  @Output() settingsChange = new EventEmitter<any>();

  private fb = inject(FormBuilder);

  newIP = '';
  whitelistedIPs = signal<string[]>(['192.168.1.1', '10.0.0.1']);

  securityForm = this.fb.group({
    minPasswordLength: [
      8,
      [Validators.required, Validators.min(6), Validators.max(32)],
    ],
    passwordExpiry: [
      90,
      [Validators.required, Validators.min(0), Validators.max(365)],
    ],
    requireUppercase: [true],
    requireNumbers: [true],
    requireSpecialChars: [true],
    require2FA: [false],
    sessionTimeout: [
      30,
      [Validators.required, Validators.min(5), Validators.max(1440)],
    ],
    maxLoginAttempts: [
      5,
      [Validators.required, Validators.min(3), Validators.max(10)],
    ],
    enableIPWhitelist: [false],
    enableHSTS: [true],
    enableCSP: [true],
    xFrameOptions: ['SAMEORIGIN'],
  });

  constructor() {
    this.securityForm.valueChanges.subscribe((values) => {
      this.settingsChange.emit({
        security: {
          ...values,
          whitelistedIPs: this.whitelistedIPs(),
        },
      });
    });
  }

  addIP(): void {
    if (this.newIP && this.isValidIP(this.newIP)) {
      this.whitelistedIPs.update((ips) => [...ips, this.newIP]);
      this.newIP = '';
      this.emitChanges();
    }
  }

  removeIP(ip: string): void {
    this.whitelistedIPs.update((ips) => ips.filter((i) => i !== ip));
    this.emitChanges();
  }

  private isValidIP(ip: string): boolean {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;

    const parts = ip.split('.');
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  private emitChanges(): void {
    this.settingsChange.emit({
      security: {
        ...this.securityForm.value,
        whitelistedIPs: this.whitelistedIPs(),
      },
    });
  }
}
