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
  Book,
  CreateBookRequest,
  UpdateBookRequest,
} from '../types/books.types';
// CRUD-GENERATOR-TAG: Foreign Key Service Import
import { AuthorService } from '../../authors/services/authors.service';
import {
  formatDateForInput,
  formatDateForSubmission,
} from '../../../shared/utils/datetime.utils';

export type BookFormMode = 'create' | 'edit';

export interface BookFormData {
  title: string;
  description?: string;
  author_id: string;
  isbn?: string;
  pages?: string;
  published_date?: string;
  price?: string;
  genre?: string;
  available?: string;
}

@Component({
  selector: 'app-books-form',
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
    <form [formGroup]="booksForm" class="books-form">
      <!-- title Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Title</mat-label>
        <input
          matInput
          type="text"
          formControlName="title"
          placeholder="Enter title"
        />
        <mat-error *ngIf="booksForm.get('title')?.hasError('required')">
          Title is required
        </mat-error>
        <mat-error *ngIf="booksForm.get('title')?.hasError('maxlength')">
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
        <mat-error *ngIf="booksForm.get('description')?.hasError('maxlength')">
          Description must be less than 1000 characters
        </mat-error>
      </mat-form-field>

      <!-- author_id Field (Foreign Key Dropdown) -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Author Id</mat-label>
        <mat-select
          formControlName="author_id"
          [disabled]="loadingAuthorsService()"
        >
          <mat-option *ngIf="loadingAuthorsService()" disabled>
            <mat-spinner diameter="16"></mat-spinner>
            Loading authors...
          </mat-option>
          <mat-option
            *ngFor="let item of authorsServiceOptions()"
            [value]="item.value"
          >
            {{ item.label }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="booksForm.get('author_id')?.hasError('required')">
          Author Id is required
        </mat-error>
        <mat-hint
          *ngIf="
            !loadingAuthorsService() && authorsServiceOptions().length === 0
          "
        >
          No authors available
        </mat-hint>
      </mat-form-field>

      <!-- isbn Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Isbn</mat-label>
        <input
          matInput
          type="text"
          formControlName="isbn"
          placeholder="Enter isbn"
        />
      </mat-form-field>

      <!-- pages Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Pages</mat-label>
        <input
          matInput
          type="number"
          formControlName="pages"
          placeholder="Enter pages"
        />
      </mat-form-field>

      <!-- published_date Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Published Date</mat-label>
        <input
          matInput
          [matDatepicker]="published_datePicker"
          formControlName="published_date"
          placeholder="Enter published date"
        />
        <mat-datepicker-toggle
          matSuffix
          [for]="published_datePicker"
        ></mat-datepicker-toggle>
        <mat-datepicker #published_datePicker></mat-datepicker>
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

      <!-- genre Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Genre</mat-label>
        <input
          matInput
          type="text"
          formControlName="genre"
          placeholder="Enter genre"
        />
      </mat-form-field>

      <!-- available Field -->
      <div class="checkbox-field">
        <mat-checkbox formControlName="available"> Available </mat-checkbox>
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
            booksForm.invalid || loading || (mode === 'edit' && !hasChanges())
          "
        >
          <mat-spinner
            diameter="20"
            class="inline-spinner"
            *ngIf="loading"
          ></mat-spinner>
          {{ mode === 'create' ? 'Create' : 'Update' }} Book
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      /* Tremor-inspired Form - Minimal Changes */
      .books-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
      }

      .full-width {
        width: 100%;
      }

      /* Tremor Border Colors - Darker (from Tremor Blocks) */
      ::ng-deep .books-form {
        .mdc-text-field--outlined:not(.mdc-text-field--disabled) {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: #d1d5db;
            border-width: 1px;
          }

          &:hover .mdc-notched-outline {
            .mdc-notched-outline__leading,
            .mdc-notched-outline__notch,
            .mdc-notched-outline__trailing {
              border-color: #9ca3af;
            }
          }

          &.mdc-text-field--focused .mdc-notched-outline {
            .mdc-notched-outline__leading,
            .mdc-notched-outline__notch,
            .mdc-notched-outline__trailing {
              border-color: #3b82f6;
              border-width: 2px;
            }
          }
        }

        /* Error Messages - Tremor red */
        .mat-mdc-form-field-error {
          color: #ef4444;
        }

        /* Datepicker Toggle */
        .mat-datepicker-toggle {
          color: #6b7280;

          &:hover {
            color: #3b82f6;
          }
        }
      }

      /* Checkbox Field */
      .checkbox-field {
        margin: 8px 0;
      }

      /* Form Actions */
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
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
export class BookFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  // CRUD-GENERATOR-TAG: Foreign Key Service Injection
  private authorsService = inject(AuthorService);

  @Input() mode: BookFormMode = 'create';
  @Input() initialData?: Book;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<BookFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;
  // CRUD-GENERATOR-TAG: Foreign Key Options State
  authorsServiceOptions = signal<any[]>([]);
  loadingAuthorsService = signal<boolean>(false);

  booksForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(1000)]],
    author_id: ['', [Validators.required]],
    isbn: ['', []],
    pages: ['', []],
    published_date: ['', []],
    price: ['', []],
    genre: ['', []],
    available: [false, []],
  });

  ngOnInit() {
    // CRUD-GENERATOR-TAG: Load Foreign Key Options
    this.loadAuthors();
    if (this.mode === 'edit' && this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  // CRUD-GENERATOR-TAG: Foreign Key Data Loading Method
  private async loadAuthors() {
    this.loadingAuthorsService.set(true);
    try {
      const response = await this.authorsService.getDropdownOptions();
      this.authorsServiceOptions.set(response || []);
    } catch (error) {
      console.error('Failed to load authorsService:', error);
      this.authorsServiceOptions.set([]);
    } finally {
      this.loadingAuthorsService.set(false);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && this.initialData && this.mode === 'edit') {
      this.populateForm(this.initialData);
    }
  }

  private populateForm(books: Book) {
    const formValue = {
      title: books.title,
      description: books.description,
      author_id: books.author_id,
      isbn: books.isbn,
      pages: books.pages,
      published_date: books.published_date
        ? new Date(books.published_date)
        : null,
      price: books.price,
      genre: books.genre,
      available: books.available,
    };

    this.booksForm.patchValue(formValue);
    this.originalFormValue = this.booksForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.booksForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.booksForm.valid) {
      const formData = { ...this.booksForm.value } as BookFormData;

      // Convert date fields to date-only format for submission
      if (formData.published_date) {
        formData.published_date = formatDateForSubmission(
          formData.published_date,
        );
      }

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
