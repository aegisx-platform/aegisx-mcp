import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { NotificationService } from '../services/notifications.service';
import { CreateNotificationRequest } from '../types/notification.types';
import { NotificationFormComponent, NotificationFormData } from './notifications-form.component';

@Component({
  selector: 'app-notifications-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    NotificationFormComponent,
  ],
  template: `
    <div class="create-dialog">
      <h2 mat-dialog-title>Create Notifications</h2>
      
      <mat-dialog-content>
        <app-notifications-form
          mode="create"
          [loading]="loading()"
          (formSubmit)="onFormSubmit($event)"
          (formCancel)="onCancel()"
        ></app-notifications-form>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .create-dialog {
      min-width: 500px;
      max-width: 800px;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .create-dialog {
        min-width: 90vw;
      }
    }
  `]
})
export class NotificationCreateDialogComponent {
  private notificationsService = inject(NotificationService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<NotificationCreateDialogComponent>);

  loading = signal<boolean>(false);

  async onFormSubmit(formData: NotificationFormData) {
    this.loading.set(true);
    
    try {
      const createRequest = formData as CreateNotificationRequest;
      const result = await this.notificationsService.createNotification(createRequest);
      
      if (result) {
        this.snackBar.open('Notifications created successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to create Notifications', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      this.snackBar.open(
        error.message || 'Failed to create Notifications', 
        'Close', 
        { duration: 5000 }
      );
    } finally {
      this.loading.set(false);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}