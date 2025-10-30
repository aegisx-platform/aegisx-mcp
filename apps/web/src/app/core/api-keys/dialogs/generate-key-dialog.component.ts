import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ApiKeysService } from '../services/api-keys.service';
import { GeneratedApiKey } from '../models/api-keys.types';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-generate-key-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  template: `
    <div class="generate-key-dialog">
      <!-- Form Mode -->
      @if (!generatedKey()) {
        <h2 mat-dialog-title class="text-2xl font-bold">Generate API Key</h2>
        <mat-dialog-content class="!max-h-[70vh]">
          <p class="text-gray-600 mb-4">
            Create a new API key for programmatic access to your account.
          </p>

          <form [formGroup]="form" class="space-y-4">
            <!-- Name (Required) -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>API Key Name</mat-label>
              <input
                matInput
                formControlName="name"
                placeholder="e.g., Production Server Key"
                required
              />
              <mat-icon matPrefix>label</mat-icon>
              <mat-hint>A descriptive name for this API key</mat-hint>
              @if (form.get('name')?.hasError('required')) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <!-- Description (Optional) -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Description (Optional)</mat-label>
              <textarea
                matInput
                formControlName="description"
                placeholder="What will this key be used for?"
                rows="3"
              ></textarea>
              <mat-icon matPrefix>description</mat-icon>
            </mat-form-field>

            <!-- Expiry Days (Optional) -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Expires In (Days)</mat-label>
              <input
                matInput
                type="number"
                formControlName="expiryDays"
                placeholder="Leave empty for no expiration"
                min="1"
                max="3650"
              />
              <mat-icon matPrefix>schedule</mat-icon>
              <mat-hint
                >Key will expire after this many days (max 10 years)</mat-hint
              >
              @if (form.get('expiryDays')?.hasError('min')) {
                <mat-error>Minimum 1 day</mat-error>
              }
              @if (form.get('expiryDays')?.hasError('max')) {
                <mat-error>Maximum 3650 days (10 years)</mat-error>
              }
            </mat-form-field>
          </form>

          <!-- Security Warning -->
          <div
            class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 rounded"
          >
            <div class="flex items-start">
              <mat-icon class="text-yellow-600 mr-2">warning</mat-icon>
              <div>
                <h4 class="text-sm font-semibold text-yellow-800 mb-1">
                  Important Security Notice
                </h4>
                <p class="text-sm text-yellow-700">
                  The full API key will be displayed <strong>only once</strong>
                  after generation. Make sure to copy and store it securely. You
                  won't be able to see it again!
                </p>
              </div>
            </div>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="gap-2 p-4">
          <button
            mat-button
            (click)="cancel()"
            [disabled]="generating()"
            type="button"
          >
            Cancel
          </button>
          <button
            mat-raised-button
            color="primary"
            (click)="generateKey()"
            [disabled]="!form.valid || generating()"
            type="button"
          >
            @if (generating()) {
              <mat-spinner
                diameter="20"
                class="inline-block mr-2"
              ></mat-spinner>
              <span>Generating...</span>
            } @else {
              <mat-icon class="mr-1">vpn_key</mat-icon>
              <span>Generate API Key</span>
            }
          </button>
        </mat-dialog-actions>
      }

      <!-- Success Mode (One-Time Display) -->
      @if (generatedKey()) {
        <h2 mat-dialog-title class="text-2xl font-bold text-green-600">
          <mat-icon class="align-middle mr-2">check_circle</mat-icon>
          API Key Generated Successfully!
        </h2>
        <mat-dialog-content class="!max-h-[70vh]">
          <!-- Critical Warning -->
          <div
            class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded animate-pulse"
          >
            <div class="flex items-start">
              <mat-icon class="text-red-600 mr-2">error</mat-icon>
              <div>
                <h4 class="text-sm font-bold text-red-800 mb-2">
                  ⚠️ COPY YOUR API KEY NOW
                </h4>
                <p class="text-sm text-red-700 font-semibold">
                  This is the <strong>ONLY TIME</strong> you will see the full
                  API key. Copy it now and store it in a secure location. Once
                  you close this dialog, you will NOT be able to retrieve it
                  again!
                </p>
              </div>
            </div>
          </div>

          <!-- API Key Display -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Your API Key:
            </label>
            <div
              class="relative bg-gray-50 border-2 border-green-500 rounded-lg p-4 font-mono text-sm break-all"
            >
              <code class="text-green-700 font-bold select-all pr-12 block">{{
                generatedKey()?.fullKey
              }}</code>
              <button
                mat-icon-button
                class="absolute top-2 right-2"
                (click)="copyToClipboard(generatedKey()!.fullKey)"
                matTooltip="Copy to clipboard"
              >
                <mat-icon>{{
                  keyCopied() ? 'check' : 'content_copy'
                }}</mat-icon>
              </button>
            </div>
          </div>

          <mat-divider class="my-4"></mat-divider>

          <!-- Key Information -->
          <div class="space-y-3">
            <div>
              <span class="font-semibold">Name:</span>
              {{ generatedKey()?.apiKey?.name }}
            </div>
            <div>
              <span class="font-semibold">Preview:</span>
              <code class="text-gray-600">{{ generatedKey()?.preview }}</code>
            </div>
            <div>
              <span class="font-semibold">Status:</span>
              <span class="text-green-600 font-semibold">Active</span>
            </div>
            @if (generatedKey()?.apiKey?.expires_at) {
              <div>
                <span class="font-semibold">Expires:</span>
                {{ generatedKey()?.apiKey?.expires_at | date: 'medium' }}
              </div>
            } @else {
              <div>
                <span class="font-semibold">Expires:</span>
                <span class="text-gray-600">Never</span>
              </div>
            }
          </div>

          <!-- Instructions -->
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6 rounded">
            <div class="flex items-start">
              <mat-icon class="text-blue-600 mr-2">info</mat-icon>
              <div>
                <h4 class="text-sm font-semibold text-blue-800 mb-1">
                  Next Steps:
                </h4>
                <ul
                  class="text-sm text-blue-700 list-disc list-inside space-y-1"
                >
                  <li>Copy the API key above to a secure password manager</li>
                  <li>Never commit this key to version control (Git, etc.)</li>
                  <li>
                    Use environment variables to store it in your application
                  </li>
                  <li>
                    If compromised, revoke it immediately from the API Keys
                    management page
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="gap-2 p-4">
          <button
            mat-button
            (click)="copyToClipboard(generatedKey()!.fullKey)"
            type="button"
          >
            <mat-icon class="mr-1">{{
              keyCopied() ? 'check' : 'content_copy'
            }}</mat-icon>
            {{ keyCopied() ? 'Copied!' : 'Copy Key Again' }}
          </button>
          <button
            mat-raised-button
            color="primary"
            (click)="close()"
            type="button"
          >
            <mat-icon class="mr-1">check</mat-icon>
            Done - I've Saved My Key
          </button>
        </mat-dialog-actions>
      }
    </div>
  `,
  styles: [
    `
      ::ng-deep .generate-key-dialog {
        min-width: 500px;
        max-width: 600px;
      }

      @media (max-width: 640px) {
        ::ng-deep .generate-key-dialog {
          min-width: 90vw;
        }
      }
    `,
  ],
})
export class GenerateKeyDialogComponent {
  private fb = inject(FormBuilder);
  private apiKeysService = inject(ApiKeysService);
  private snackBar = inject(MatSnackBar);
  private clipboard = inject(Clipboard);
  private dialogRef = inject(MatDialogRef<GenerateKeyDialogComponent>);

  form: FormGroup;
  generating = signal(false);
  generatedKey = signal<GeneratedApiKey | null>(null);
  keyCopied = signal(false);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      expiryDays: [null, [Validators.min(1), Validators.max(3650)]],
    });
  }

  generateKey(): void {
    if (!this.form.valid || this.generating()) return;

    this.generating.set(true);

    const formValue = this.form.value;
    const request = {
      name: formValue.name,
      description: formValue.description || undefined,
      expiryDays: formValue.expiryDays || undefined,
    };

    this.apiKeysService.generateKey(request).subscribe({
      next: (result) => {
        this.generatedKey.set(result);
        this.generating.set(false);
        this.snackBar.open(
          'API Key generated successfully! Copy it now.',
          'Close',
          {
            duration: 5000,
            panelClass: ['bg-green-500'],
          },
        );
      },
      error: (error) => {
        this.generating.set(false);
        this.snackBar.open(
          error.message || 'Failed to generate API key',
          'Close',
          {
            duration: 5000,
            panelClass: ['bg-red-500'],
          },
        );
      },
    });
  }

  copyToClipboard(text: string): void {
    const success = this.clipboard.copy(text);
    if (success) {
      this.keyCopied.set(true);
      this.snackBar.open('API Key copied to clipboard!', 'Close', {
        duration: 3000,
      });
      setTimeout(() => this.keyCopied.set(false), 3000);
    } else {
      this.snackBar.open('Failed to copy to clipboard', 'Close', {
        duration: 3000,
        panelClass: ['bg-red-500'],
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  close(): void {
    this.dialogRef.close(this.generatedKey());
  }
}
