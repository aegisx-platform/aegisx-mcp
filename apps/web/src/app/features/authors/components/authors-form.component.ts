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
  Author,
  CreateAuthorRequest,
  UpdateAuthorRequest,
} from '../types/authors.types';
import {
  formatDateForInput,
  formatDateForSubmission,
} from '../../../shared/utils/datetime.utils';

export type AuthorFormMode = 'create' | 'edit';

export interface AuthorFormData {
  name: string;
  email: string;
  bio?: string;
  birth_date?: string;
  country?: string;
  active?: string;
}

@Component({
  selector: 'app-authors-form',
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
    <form [formGroup]="authorsForm" class="-form">
      <!-- name Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Name</mat-label>
        <input
          matInput
          type="text"
          formControlName="name"
          placeholder="Enter name"
        />
        <mat-error *ngIf="authorsForm.get('name')?.hasError('required')">
          Name is required
        </mat-error>
        <mat-error *ngIf="authorsForm.get('name')?.hasError('maxlength')">
          Name must be less than 255 characters
        </mat-error>
      </mat-form-field>

      <!-- email Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Email</mat-label>
        <input
          matInput
          type="email"
          formControlName="email"
          placeholder="Enter email address"
        />
        <mat-error *ngIf="authorsForm.get('email')?.hasError('required')">
          Email is required
        </mat-error>
        <mat-error *ngIf="authorsForm.get('email')?.hasError('maxlength')">
          Email must be less than 255 characters
        </mat-error>
      </mat-form-field>

      <!-- bio Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Bio</mat-label>
        <textarea
          matInput
          formControlName="bio"
          placeholder="Enter bio"
          rows="3"
        ></textarea>
      </mat-form-field>

      <!-- birth_date Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Birth Date</mat-label>
        <input
          matInput
          [matDatepicker]="birth_datePicker"
          formControlName="birth_date"
          placeholder="Enter birth date"
        />
        <mat-datepicker-toggle
          matSuffix
          [for]="birth_datePicker"
        ></mat-datepicker-toggle>
        <mat-datepicker #birth_datePicker></mat-datepicker>
      </mat-form-field>

      <!-- country Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Country</mat-label>
        <input
          matInput
          type="text"
          formControlName="country"
          placeholder="Enter country"
        />
      </mat-form-field>

      <!-- active Field -->
      <div class="checkbox-field">
        <mat-checkbox formControlName="active"> Active </mat-checkbox>
      </div>

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
            authorsForm.invalid || loading || (mode === 'edit' && !hasChanges())
          "
        >
          <mat-spinner
            diameter="20"
            class="inline-spinner"
            *ngIf="loading"
          ></mat-spinner>
          {{ mode === 'create' ? 'Create' : 'Update' }} Authors
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
export class AuthorFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() mode: AuthorFormMode = 'create';
  @Input() initialData?: Author;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<AuthorFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;

  authorsForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.maxLength(255)]],
    bio: ['', []],
    birth_date: ['', []],
    country: ['', []],
    active: [false, []],
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

  private populateForm(authors: Author) {
    const formValue = {
      name: authors.name,
      email: authors.email,
      bio: authors.bio,
      birth_date: authors.birth_date ? new Date(authors.birth_date) : null,
      country: authors.country,
      active: authors.active,
    };

    this.authorsForm.patchValue(formValue);
    this.originalFormValue = this.authorsForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.authorsForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.authorsForm.valid) {
      const formData = { ...this.authorsForm.value } as AuthorFormData;

      // Convert date fields to date-only format for submission
      if (formData.birth_date) {
        formData.birth_date = formatDateForSubmission(formData.birth_date);
      }

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
