import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { AegisxCardComponent, AegisxAlertComponent } from '@aegisx/ui';

@Component({
  selector: 'ax-forms-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule,
    AegisxCardComponent,
    AegisxAlertComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Form Components</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Examples of form controls and input fields using Angular Material.
        </p>
      </div>

      <!-- Alert -->
      <ax-alert type="info" class="mb-8">
        Angular Material forms integrate with Angular's reactive forms for powerful form handling.
      </ax-alert>

      <!-- Basic Form Controls -->
      <section class="mb-12">
        <ax-card title="Basic Form Controls" subtitle="Common input types" appearance="outlined">
          <form [formGroup]="basicForm" class="space-y-4">
            <!-- Text Input -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter your name">
              <mat-icon matPrefix>person</mat-icon>
              @if (basicForm.get('name')?.hasError('required')) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <!-- Email Input -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="user@example.com">
              <mat-icon matPrefix>email</mat-icon>
              @if (basicForm.get('email')?.hasError('required')) {
                <mat-error>Email is required</mat-error>
              }
              @if (basicForm.get('email')?.hasError('email')) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <!-- Password Input -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (basicForm.get('password')?.hasError('required')) {
                <mat-error>Password is required</mat-error>
              }
              @if (basicForm.get('password')?.hasError('minlength')) {
                <mat-error>Password must be at least 8 characters</mat-error>
              }
            </mat-form-field>

            <!-- Textarea -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4" placeholder="Tell us about yourself"></textarea>
              <mat-hint align="end">{{ basicForm.get('description')?.value?.length || 0 }}/200</mat-hint>
            </mat-form-field>
          </form>
        </ax-card>
      </section>

      <!-- Selection Controls -->
      <section class="mb-12">
        <ax-card title="Selection Controls" subtitle="Dropdowns, checkboxes, and radios" appearance="outlined">
          <form [formGroup]="selectionForm" class="space-y-4">
            <!-- Select -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Country</mat-label>
              <mat-select formControlName="country">
                <mat-option value="us">United States</mat-option>
                <mat-option value="uk">United Kingdom</mat-option>
                <mat-option value="ca">Canada</mat-option>
                <mat-option value="au">Australia</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Multiple Select -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Skills</mat-label>
              <mat-select formControlName="skills" multiple>
                <mat-option value="angular">Angular</mat-option>
                <mat-option value="react">React</mat-option>
                <mat-option value="vue">Vue</mat-option>
                <mat-option value="node">Node.js</mat-option>
                <mat-option value="python">Python</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Radio Group -->
            <div>
              <label class="block text-sm font-medium mb-2">Gender</label>
              <mat-radio-group formControlName="gender" class="flex gap-4">
                <mat-radio-button value="male">Male</mat-radio-button>
                <mat-radio-button value="female">Female</mat-radio-button>
                <mat-radio-button value="other">Other</mat-radio-button>
              </mat-radio-group>
            </div>

            <!-- Checkboxes -->
            <div>
              <label class="block text-sm font-medium mb-2">Preferences</label>
              <div class="space-y-2">
                <mat-checkbox formControlName="newsletter">Subscribe to newsletter</mat-checkbox>
                <mat-checkbox formControlName="notifications">Enable notifications</mat-checkbox>
                <mat-checkbox formControlName="marketing">Receive marketing emails</mat-checkbox>
              </div>
            </div>
          </form>
        </ax-card>
      </section>

      <!-- Advanced Controls -->
      <section class="mb-12">
        <ax-card title="Advanced Controls" subtitle="Date pickers, sliders, and toggles" appearance="outlined">
          <form [formGroup]="advancedForm" class="space-y-4">
            <!-- Date Picker -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Birth Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="birthDate">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <!-- Slide Toggle -->
            <div class="space-y-2">
              <mat-slide-toggle formControlName="darkMode">Enable dark mode</mat-slide-toggle>
              <mat-slide-toggle formControlName="autoSave" color="primary">Auto-save enabled</mat-slide-toggle>
              <mat-slide-toggle formControlName="publicProfile" color="accent">Make profile public</mat-slide-toggle>
            </div>

            <!-- Slider -->
            <div>
              <label class="block text-sm font-medium mb-2">
                Experience Level: {{ advancedForm.get('experience')?.value }}
              </label>
              <mat-slider min="0" max="10" step="1" showTickMarks discrete class="w-full">
                <input matSliderThumb formControlName="experience">
              </mat-slider>
            </div>

            <!-- Autocomplete -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Programming Language</mat-label>
              <input matInput formControlName="language" [matAutocomplete]="auto">
              <mat-autocomplete #auto="matAutocomplete">
                @for (option of filteredOptions; track option) {
                  <mat-option [value]="option">{{ option }}</mat-option>
                }
              </mat-autocomplete>
            </mat-form-field>

            <!-- Chips Input -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Tags</mat-label>
              <mat-chip-grid #chipGrid>
                @for (tag of tags; track tag) {
                  <mat-chip-row (removed)="removeTag(tag)">
                    {{ tag }}
                    <mat-icon matChipRemove>cancel</mat-icon>
                  </mat-chip-row>
                }
                <input placeholder="Add tag..."
                       [matChipInputFor]="chipGrid"
                       (matChipInputTokenEnd)="addTag($event)">
              </mat-chip-grid>
            </mat-form-field>
          </form>
        </ax-card>
      </section>

      <!-- Form Layouts -->
      <section class="mb-12">
        <ax-card title="Form Layout Example" subtitle="Complete form with validation" appearance="elevated">
          <form [formGroup]="completeForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Phone Number</mat-label>
              <input matInput type="tel" formControlName="phone">
              <mat-icon matPrefix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Address</mat-label>
              <textarea matInput formControlName="address" rows="3"></textarea>
            </mat-form-field>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>City</mat-label>
                <input matInput formControlName="city">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>State</mat-label>
                <mat-select formControlName="state">
                  <mat-option value="ny">New York</mat-option>
                  <mat-option value="ca">California</mat-option>
                  <mat-option value="tx">Texas</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>ZIP Code</mat-label>
                <input matInput formControlName="zip">
              </mat-form-field>
            </div>

            <div class="flex items-center space-x-2">
              <mat-checkbox formControlName="terms">I agree to the terms and conditions</mat-checkbox>
            </div>

            <div card-actions class="flex justify-end space-x-2">
              <button mat-button type="button" (click)="completeForm.reset()">Reset</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!completeForm.valid">
                Submit
              </button>
            </div>
          </form>

          @if (formSubmitted) {
            <ax-alert type="success" class="mt-4">
              Form submitted successfully!
            </ax-alert>
          }
        </ax-card>
      </section>
    </div>
  `,
  styles: []
})
export class FormsPage {
  hidePassword = true;
  formSubmitted = false;
  tags: string[] = ['Angular', 'TypeScript'];
  filteredOptions: string[] = [];
  
  private languages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 
    'C#', 'Ruby', 'Go', 'Rust', 'Swift'
  ];

  basicForm: FormGroup;
  selectionForm: FormGroup;
  advancedForm: FormGroup;
  completeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.basicForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      description: ['', Validators.maxLength(200)]
    });

    this.selectionForm = this.fb.group({
      country: [''],
      skills: [[]],
      gender: [''],
      newsletter: [false],
      notifications: [true],
      marketing: [false]
    });

    this.advancedForm = this.fb.group({
      birthDate: [''],
      darkMode: [false],
      autoSave: [true],
      publicProfile: [false],
      experience: [5],
      language: ['']
    });

    this.completeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      city: [''],
      state: [''],
      zip: [''],
      terms: [false, Validators.requiredTrue]
    });

    // Setup autocomplete
    this.advancedForm.get('language')?.valueChanges.subscribe(value => {
      this.filteredOptions = this._filter(value || '');
    });
    this.filteredOptions = this.languages;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.languages.filter(option => option.toLowerCase().includes(filterValue));
  }

  addTag(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.push(value);
    }
    event.chipInput?.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.completeForm.valid) {
      this.formSubmitted = true;
      setTimeout(() => {
        this.formSubmitted = false;
      }, 3000);
    }
  }
}