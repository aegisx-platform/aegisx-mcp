import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  Notification,
  CreateNotificationRequest,
  UpdateNotificationRequest,
} from '../types/notification.types';
import {
  formatDateTimeForInput,
  formatDateTimeForSubmission,
} from '../../../shared/utils/datetime.utils';

export type NotificationFormMode = 'create' | 'edit';

export interface NotificationFormData {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  action_url?: string;
  read?: string;
  read_at?: string;
  archived?: string;
  archived_at?: string;
  priority?: string;
  expires_at?: string;
}

@Component({
  selector: 'app-notifications-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatOptionModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  template: `
    <form [formGroup]="notificationsForm" class="-form">
      <!-- user_id Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>User Id</mat-label>
        <input
          matInput
          type="text"
          formControlName="user_id"
          placeholder="Enter user id"
        />
        <mat-error
          *ngIf="notificationsForm.get('user_id')?.hasError('required')"
        >
          User Id is required
        </mat-error>
      </mat-form-field>

      <!-- type Field (Select) -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Type</mat-label>
        <mat-select formControlName="type">
          <mat-option value="info">Info</mat-option>
          <mat-option value="warning">Warning</mat-option>
          <mat-option value="error">Error</mat-option>
        </mat-select>
        <mat-error *ngIf="notificationsForm.get('type')?.hasError('required')">
          Type is required
        </mat-error>
      </mat-form-field>

      <!-- title Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Title</mat-label>
        <input
          matInput
          type="text"
          formControlName="title"
          placeholder="Enter title"
        />
        <mat-error *ngIf="notificationsForm.get('title')?.hasError('required')">
          Title is required
        </mat-error>
        <mat-error
          *ngIf="notificationsForm.get('title')?.hasError('maxlength')"
        >
          Title must be less than 255 characters
        </mat-error>
      </mat-form-field>

      <!-- message Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Message</mat-label>
        <textarea
          matInput
          formControlName="message"
          placeholder="Enter message"
          rows="3"
        ></textarea>
        <mat-error
          *ngIf="notificationsForm.get('message')?.hasError('required')"
        >
          Message is required
        </mat-error>
        <mat-error
          *ngIf="notificationsForm.get('message')?.hasError('maxlength')"
        >
          Message must be less than 1000 characters
        </mat-error>
      </mat-form-field>

      <!-- data Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Data (JSON)</mat-label>
        <textarea
          matInput
          formControlName="data"
          placeholder="Enter data"
          rows="3"
        ></textarea>
        <mat-hint>Enter valid JSON object (optional)</mat-hint>
        <mat-error
          *ngIf="notificationsForm.get('data')?.hasError('invalidJson')"
        >
          Invalid JSON format
        </mat-error>
      </mat-form-field>

      <!-- action_url Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Action Url</mat-label>
        <input
          matInput
          type="url"
          formControlName="action_url"
          placeholder="Enter action url"
        />
      </mat-form-field>

      <!-- read Field -->
      <div class="checkbox-field">
        <mat-checkbox formControlName="read"> Read </mat-checkbox>
      </div>

      <!-- read_at Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Read At (with timezone)</mat-label>
        <input
          matInput
          type="datetime-local"
          formControlName="read_at"
          placeholder="Enter read at"
        />
        <mat-hint>Timezone will be handled automatically</mat-hint>
      </mat-form-field>

      <!-- archived Field -->
      <div class="checkbox-field">
        <mat-checkbox formControlName="archived"> Archived </mat-checkbox>
      </div>

      <!-- archived_at Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Archived At (with timezone)</mat-label>
        <input
          matInput
          type="datetime-local"
          formControlName="archived_at"
          placeholder="Enter archived at"
        />
        <mat-hint>Timezone will be handled automatically</mat-hint>
      </mat-form-field>

      <!-- priority Field (Select) -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Priority</mat-label>
        <mat-select formControlName="priority">
          <mat-option value="low&#x27;">Low&#x27;</mat-option>
          <mat-option value="normal&#x27;">Normal&#x27;</mat-option>
          <mat-option value="high&#x27;">High&#x27;</mat-option>
          <mat-option value="urgent&#x27;">Urgent&#x27;</mat-option>
        </mat-select>
      </mat-form-field>

      <!-- expires_at Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Expires At (with timezone)</mat-label>
        <input
          matInput
          type="datetime-local"
          formControlName="expires_at"
          placeholder="Enter expires at"
        />
        <mat-hint>Timezone will be handled automatically</mat-hint>
      </mat-form-field>

      <!-- Form Actions -->
      <div class="form-actions">
        <button
          mat-button
          type="button"
          (click)="onCancel()"
          [disabled]="loading"
        >
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          type="button"
          (click)="onSubmit()"
          [disabled]="
            notificationsForm.invalid ||
            loading ||
            (mode === 'edit' && !hasChanges())
          "
        >
          <mat-spinner
            diameter="20"
            class="inline-spinner"
            *ngIf="loading"
          ></mat-spinner>
          {{ mode === 'create' ? 'Create' : 'Update' }} Notifications
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
      }

      .full-width {
        width: 100%;
      }

      .checkbox-field {
        margin: 8px 0;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.12);
      }

      .inline-spinner {
        margin-right: 8px;
      }

      @media (max-width: 768px) {
        .form-actions {
          flex-direction: column;
          gap: 8px;
        }
      }
    `,
  ],
})
export class NotificationFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() mode: NotificationFormMode = 'create';
  @Input() initialData?: Notification;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<NotificationFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;

  // Custom JSON validator
  private jsonValidator(control: AbstractControl) {
    if (!control.value) {
      return null; // Empty is valid (optional field)
    }

    try {
      JSON.parse(control.value);
      return null; // Valid JSON
    } catch (error) {
      return { invalidJson: true }; // Invalid JSON
    }
  }

  notificationsForm: FormGroup = this.fb.group({
    user_id: ['', [Validators.required]],
    type: ['', [Validators.required, Validators.maxLength(50)]],
    title: ['', [Validators.required, Validators.maxLength(255)]],
    message: ['', [Validators.required, Validators.maxLength(1000)]],
    data: ['', [this.jsonValidator.bind(this)]],
    action_url: ['', []],
    read: [false, []],
    read_at: ['', []],
    archived: [false, []],
    archived_at: ['', []],
    priority: ['', [Validators.maxLength(20)]],
    expires_at: ['', []],
  });

  ngOnInit() {
    if (this.mode === 'edit' && this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && this.initialData && this.mode === 'edit') {
      this.populateForm(this.initialData);
    }
  }

  private populateForm(notifications: Notification) {
    const formValue = {
      user_id: notifications.user_id,
      type: notifications.type,
      title: notifications.title,
      message: notifications.message,
      data: notifications.data
        ? JSON.stringify(notifications.data, null, 2)
        : '',
      action_url: notifications.action_url,
      read: notifications.read,
      read_at: formatDateTimeForInput(notifications.read_at),
      archived: notifications.archived,
      archived_at: formatDateTimeForInput(notifications.archived_at),
      priority: notifications.priority,
      expires_at: formatDateTimeForInput(notifications.expires_at),
    };

    this.notificationsForm.patchValue(formValue);
    this.originalFormValue = this.notificationsForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.notificationsForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.notificationsForm.valid) {
      const formData = {
        ...this.notificationsForm.value,
      } as NotificationFormData;

      // Parse JSON fields
      if (formData.data && typeof formData.data === 'string') {
        try {
          formData.data = JSON.parse(formData.data);
        } catch (error) {
          formData.data = {};
        }
      } else if (!formData.data) {
        formData.data = {};
      }

      // Convert datetime-local format back to ISO strings for submission
      if (formData.read_at) {
        formData.read_at = formatDateTimeForSubmission(formData.read_at);
      }
      if (formData.archived_at) {
        formData.archived_at = formatDateTimeForSubmission(
          formData.archived_at,
        );
      }
      if (formData.expires_at) {
        formData.expires_at = formatDateTimeForSubmission(formData.expires_at);
      }

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
