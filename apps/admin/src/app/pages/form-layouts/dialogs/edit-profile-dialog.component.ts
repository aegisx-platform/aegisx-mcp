import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="dialog-container">
      <div mat-dialog-title class="dialog-title">
        <mat-icon class="dialog-icon">edit</mat-icon>
        Edit Profile
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="form-compact">
          <form class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>First Name</mat-label>
                <input
                  matInput
                  [(ngModel)]="firstName"
                  name="firstName"
                  placeholder="John"
                />
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Last Name</mat-label>
                <input
                  matInput
                  [(ngModel)]="lastName"
                  name="lastName"
                  placeholder="Doe"
                />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input
                matInput
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="john@example.com"
              />
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Phone</mat-label>
              <mat-icon matPrefix>phone</mat-icon>
              <input
                matInput
                type="tel"
                [(ngModel)]="phone"
                name="phone"
                placeholder="+1 (555) 000-0000"
              />
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Bio</mat-label>
              <textarea
                matInput
                rows="3"
                [(ngModel)]="bio"
                name="bio"
                placeholder="Tell us about yourself"
              ></textarea>
            </mat-form-field>
          </form>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button matButton="outlined" (click)="onCancel()">Cancel</button>
        <button matButton="filled" color="primary" (click)="onSave()">
          Save Changes
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
        overflow: visible;
      }

      :host ::ng-deep mat-dialog-content {
        padding-top: 2rem !important;
      }

      .dialog-container {
        min-width: 500px;
      }

      .dialog-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--aegisx-text-strong);
        padding: 1.5rem 1.5rem 1rem 1.5rem;
        margin: 0;
        border-bottom: 1px solid var(--aegisx-border-default);
      }

      .dialog-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: var(--aegisx-brand-default);
      }

      .dialog-content {
        padding: 2rem 1.5rem 1.5rem 1.5rem;
        margin: 0;
      }

      .dialog-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--aegisx-border-default);
        margin: 0;
      }
    `,
  ],
})
export class EditProfileDialogComponent {
  firstName = 'John';
  lastName = 'Doe';
  email = 'john.doe@example.com';
  phone = '+1 (555) 123-4567';
  bio = 'Product designer focused on creating user-centered experiences.';

  constructor(private dialogRef: MatDialogRef<EditProfileDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      bio: this.bio,
    });
  }
}
