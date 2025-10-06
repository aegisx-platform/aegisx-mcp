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
  ComprehensiveTest,
  CreateComprehensiveTestRequest,
  UpdateComprehensiveTestRequest,
} from '../types/comprehensive-tests.types';
import {
  formatDateTimeForInput,
  formatDateTimeForSubmission,
} from '../../../shared/utils/datetime.utils';
import {
  formatDateForInput,
  formatDateForSubmission,
} from '../../../shared/utils/datetime.utils';

export type ComprehensiveTestFormMode = 'create' | 'edit';

export interface ComprehensiveTestFormData {
  title: string;
  description?: string;
  slug?: string;
  short_code?: string;
  price?: string;
  quantity?: string;
  weight?: string;
  rating?: string;
  is_active?: string;
  is_featured?: string;
  is_available?: string;
  published_at?: string;
  expires_at?: string;
  start_time?: string;
  metadata?: Record<string, any>;
  tags?: string;
  ip_address?: string;
  website_url?: string;
  email_address?: string;
  status?: string;
  priority?: string;
  content?: string;
  notes?: string;
}

@Component({
  selector: 'app-comprehensive-tests-form',
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
    <form [formGroup]="comprehensiveTestsForm" class="-form">
      <!-- title Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Title</mat-label>
        <input
          matInput
          type="text"
          formControlName="title"
          placeholder="Enter title"
        />
        <mat-error
          *ngIf="comprehensiveTestsForm.get('title')?.hasError('required')"
        >
          Title is required
        </mat-error>
        <mat-error
          *ngIf="comprehensiveTestsForm.get('title')?.hasError('maxlength')"
        >
          Title must be less than 255 characters
        </mat-error>
      </mat-form-field>

      <!-- description Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Description</mat-label>
        <textarea
          matInput
          formControlName="description"
          placeholder="Enter description"
          rows="3"
        ></textarea>
        <mat-error
          *ngIf="
            comprehensiveTestsForm.get('description')?.hasError('maxlength')
          "
        >
          Description must be less than 1000 characters
        </mat-error>
      </mat-form-field>

      <!-- slug Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Slug</mat-label>
        <input
          matInput
          type="text"
          formControlName="slug"
          placeholder="Enter slug"
        />
      </mat-form-field>

      <!-- short_code Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Short Code</mat-label>
        <input
          matInput
          type="text"
          formControlName="short_code"
          placeholder="Enter short code"
        />
      </mat-form-field>

      <!-- price Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Price</mat-label>
        <input
          matInput
          type="number"
          formControlName="price"
          placeholder="Enter price"
          step="0.01"
        />
      </mat-form-field>

      <!-- quantity Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Quantity</mat-label>
        <input
          matInput
          type="number"
          formControlName="quantity"
          placeholder="Enter quantity"
        />
      </mat-form-field>

      <!-- weight Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Weight</mat-label>
        <input
          matInput
          type="number"
          formControlName="weight"
          placeholder="Enter weight"
        />
      </mat-form-field>

      <!-- rating Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Rating</mat-label>
        <input
          matInput
          type="number"
          formControlName="rating"
          placeholder="Enter rating"
        />
      </mat-form-field>

      <!-- is_active Field -->
      <div class="checkbox-field">
        <mat-checkbox formControlName="is_active"> Is Active </mat-checkbox>
      </div>

      <!-- is_featured Field -->
      <div class="checkbox-field">
        <mat-checkbox formControlName="is_featured"> Is Featured </mat-checkbox>
      </div>

      <!-- is_available Field -->
      <div class="checkbox-field">
        <mat-checkbox formControlName="is_available">
          Is Available
        </mat-checkbox>
      </div>

      <!-- published_at Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Published At</mat-label>
        <input
          matInput
          type="datetime-local"
          formControlName="published_at"
          placeholder="Enter published at"
        />
      </mat-form-field>

      <!-- expires_at Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Expires At</mat-label>
        <input
          matInput
          [matDatepicker]="expires_atPicker"
          formControlName="expires_at"
          placeholder="Enter expires at"
        />
        <mat-datepicker-toggle
          matSuffix
          [for]="expires_atPicker"
        ></mat-datepicker-toggle>
        <mat-datepicker #expires_atPicker></mat-datepicker>
      </mat-form-field>

      <!-- start_time Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Start Time</mat-label>
        <input
          matInput
          type="time"
          formControlName="start_time"
          placeholder="Enter start time"
        />
      </mat-form-field>

      <!-- metadata Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Metadata (JSON)</mat-label>
        <textarea
          matInput
          formControlName="metadata"
          placeholder="Enter metadata"
          rows="3"
        ></textarea>
        <mat-hint>Enter valid JSON object (optional)</mat-hint>
        <mat-error
          *ngIf="
            comprehensiveTestsForm.get('metadata')?.hasError('invalidJson')
          "
        >
          Invalid JSON format
        </mat-error>
      </mat-form-field>

      <!-- tags Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Tags</mat-label>
        <input
          matInput
          type="text"
          formControlName="tags"
          placeholder="Enter tags"
        />
      </mat-form-field>

      <!-- ip_address Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Ip Address</mat-label>
        <input
          matInput
          type="text"
          formControlName="ip_address"
          placeholder="Enter ip address"
        />
      </mat-form-field>

      <!-- website_url Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Website Url</mat-label>
        <input
          matInput
          type="url"
          formControlName="website_url"
          placeholder="Enter website url"
        />
      </mat-form-field>

      <!-- email_address Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Email Address</mat-label>
        <input
          matInput
          type="email"
          formControlName="email_address"
          placeholder="Enter email address"
        />
      </mat-form-field>

      <!-- status Field (Select) -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Status</mat-label>
        <mat-select formControlName="status">
          <mat-option value="draft">Draft</mat-option>
          <mat-option value="published">Published</mat-option>
          <mat-option value="archived">Archived</mat-option>
          <mat-option value="deleted">Deleted</mat-option>
        </mat-select>
      </mat-form-field>

      <!-- priority Field (Select) -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Priority</mat-label>
        <mat-select formControlName="priority">
          <mat-option value="low">Low</mat-option>
          <mat-option value="medium">Medium</mat-option>
          <mat-option value="high">High</mat-option>
          <mat-option value="urgent">Urgent</mat-option>
        </mat-select>
      </mat-form-field>

      <!-- content Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Content</mat-label>
        <textarea
          matInput
          formControlName="content"
          placeholder="Enter content"
          rows="3"
        ></textarea>
      </mat-form-field>

      <!-- notes Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Notes</mat-label>
        <textarea
          matInput
          formControlName="notes"
          placeholder="Enter notes"
          rows="3"
        ></textarea>
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
            comprehensiveTestsForm.invalid ||
            loading ||
            (mode === 'edit' && !hasChanges())
          "
        >
          <mat-spinner
            diameter="20"
            class="inline-spinner"
            *ngIf="loading"
          ></mat-spinner>
          {{ mode === 'create' ? 'Create' : 'Update' }} Comprehensive Tests
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
export class ComprehensiveTestFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() mode: ComprehensiveTestFormMode = 'create';
  @Input() initialData?: ComprehensiveTest;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<ComprehensiveTestFormData>();
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

  comprehensiveTestsForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(1000)]],
    slug: ['', []],
    short_code: ['', []],
    price: ['', []],
    quantity: ['', []],
    weight: ['', []],
    rating: ['', []],
    is_active: [false, []],
    is_featured: [false, []],
    is_available: [false, []],
    published_at: ['', []],
    expires_at: ['', []],
    start_time: ['', []],
    metadata: ['', [this.jsonValidator.bind(this)]],
    tags: ['', []],
    ip_address: ['', []],
    website_url: ['', []],
    email_address: ['', []],
    status: ['', [Validators.maxLength(20)]],
    priority: ['', [Validators.maxLength(20)]],
    content: ['', []],
    notes: ['', []],
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

  private populateForm(comprehensiveTests: ComprehensiveTest) {
    const formValue = {
      title: comprehensiveTests.title,
      description: comprehensiveTests.description,
      slug: comprehensiveTests.slug,
      short_code: comprehensiveTests.short_code,
      price: comprehensiveTests.price,
      quantity: comprehensiveTests.quantity,
      weight: comprehensiveTests.weight,
      rating: comprehensiveTests.rating,
      is_active: comprehensiveTests.is_active,
      is_featured: comprehensiveTests.is_featured,
      is_available: comprehensiveTests.is_available,
      published_at: formatDateTimeForInput(comprehensiveTests.published_at),
      expires_at: comprehensiveTests.expires_at
        ? new Date(comprehensiveTests.expires_at)
        : null,
      start_time: comprehensiveTests.start_time,
      metadata: comprehensiveTests.metadata
        ? JSON.stringify(comprehensiveTests.metadata, null, 2)
        : '',
      tags: comprehensiveTests.tags,
      ip_address: comprehensiveTests.ip_address,
      website_url: comprehensiveTests.website_url,
      email_address: comprehensiveTests.email_address,
      status: comprehensiveTests.status,
      priority: comprehensiveTests.priority,
      content: comprehensiveTests.content,
      notes: comprehensiveTests.notes,
    };

    this.comprehensiveTestsForm.patchValue(formValue);
    this.originalFormValue = this.comprehensiveTestsForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.comprehensiveTestsForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.comprehensiveTestsForm.valid) {
      const formData = {
        ...this.comprehensiveTestsForm.value,
      } as ComprehensiveTestFormData;

      // Parse JSON fields
      if (formData.metadata && typeof formData.metadata === 'string') {
        try {
          formData.metadata = JSON.parse(formData.metadata);
        } catch (error) {
          formData.metadata = {};
        }
      } else if (!formData.metadata) {
        formData.metadata = {};
      }

      // Convert datetime-local format back to ISO strings for submission
      if (formData.published_at) {
        formData.published_at = formatDateTimeForSubmission(
          formData.published_at,
        );
      }

      // Convert date fields to date-only format for submission
      if (formData.expires_at) {
        formData.expires_at = formatDateForSubmission(formData.expires_at);
      }

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
