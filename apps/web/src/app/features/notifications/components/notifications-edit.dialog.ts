import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { NotificationService } from '../services/notifications.service';
import {
  Notification,
  UpdateNotificationRequest,
} from '../types/notification.types';
import {
  NotificationFormComponent,
  NotificationFormData,
} from './notifications-form.component';

export interface NotificationEditDialogData {
  notifications: Notification;
}

@Component({
  selector: 'app-notifications-edit-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, NotificationFormComponent],
  template: `
    <div class="edit-dialog">
      <h2 mat-dialog-title>Edit Notifications</h2>

      <mat-dialog-content>
        <app-notifications-form
          mode="edit"
          [initialData]="data.notifications"
          [loading]="loading()"
          (formSubmit)="onFormSubmit($event)"
          (formCancel)="onCancel()"
        ></app-notifications-form>
      </mat-dialog-content>
    </div>
  `,
  styles: [
    `
      .edit-dialog {
        min-width: 500px;
        max-width: 800px;
      }

      mat-dialog-content {
        max-height: 70vh;
        overflow-y: auto;
      }

      @media (max-width: 768px) {
        .edit-dialog {
          min-width: 90vw;
        }
      }
    `,
  ],
})
export class NotificationEditDialogComponent implements OnInit {
  private notificationsService = inject(NotificationService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<NotificationEditDialogComponent>);
  public data = inject<NotificationEditDialogData>(MAT_DIALOG_DATA);

  loading = signal<boolean>(false);

  ngOnInit() {
    // No additional setup needed since shared form handles data population
  }

  async onFormSubmit(formData: NotificationFormData) {
    this.loading.set(true);

    try {
      const updateRequest = formData as UpdateNotificationRequest;
      const result = await this.notificationsService.updateNotification(
        this.data.notifications.id,
        updateRequest,
      );

      if (result) {
        this.snackBar.open('Notifications updated successfully', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(result);
      } else {
        this.snackBar.open('Failed to update Notifications', 'Close', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      this.snackBar.open(
        error.message || 'Failed to update Notifications',
        'Close',
        { duration: 5000 },
      );
    } finally {
      this.loading.set(false);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
