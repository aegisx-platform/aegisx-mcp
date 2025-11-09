/**
 * Form Controls Section
 * Showcases all Angular Material form control components
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-form-controls-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <div class="section-container">
      <h2 class="section-title">Form Controls</h2>
      <p class="section-description">
        Essential form control components for user input with Material Design 3 styling
      </p>

      <!-- Text Input -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Text Input</mat-card-title>
          <mat-card-subtitle>Basic text field with label and hint</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Standard Input</mat-label>
              <input matInput placeholder="Enter text" [(ngModel)]="textValue" />
              <mat-hint>This is a hint text</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>With Error</mat-label>
              <input matInput [value]="''" />
              <mat-error>This field is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Disabled</mat-label>
              <input matInput disabled value="Disabled input" />
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Textarea</mat-label>
              <textarea
                matInput
                placeholder="Enter multiple lines of text"
                rows="4"
                [(ngModel)]="textareaValue"
              ></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Email</mat-label>
              <input matInput type="email" placeholder="example@email.com" />
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Password</mat-label>
              <input matInput type="password" placeholder="••••••••" />
              <mat-icon matPrefix>lock</mat-icon>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Select & Dropdown -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Select & Dropdown</mat-card-title>
          <mat-card-subtitle>Selection fields with options</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Single Select</mat-label>
              <mat-select [(ngModel)]="selectedOption">
                <mat-option value="option1">Option 1</mat-option>
                <mat-option value="option2">Option 2</mat-option>
                <mat-option value="option3">Option 3</mat-option>
                <mat-option value="option4">Option 4</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Multiple Select</mat-label>
              <mat-select multiple [(ngModel)]="selectedOptions">
                <mat-option value="1">Choice 1</mat-option>
                <mat-option value="2">Choice 2</mat-option>
                <mat-option value="3">Choice 3</mat-option>
                <mat-option value="4">Choice 4</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>With Groups</mat-label>
              <mat-select>
                <mat-optgroup label="Group A">
                  <mat-option value="a1">Option A1</mat-option>
                  <mat-option value="a2">Option A2</mat-option>
                </mat-optgroup>
                <mat-optgroup label="Group B">
                  <mat-option value="b1">Option B1</mat-option>
                  <mat-option value="b2">Option B2</mat-option>
                </mat-optgroup>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Checkbox -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Checkbox</mat-card-title>
          <mat-card-subtitle>Selection with multiple independent options</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="checkbox-grid">
            <div class="checkbox-item">
              <mat-checkbox [(ngModel)]="checkboxValue1">Unchecked</mat-checkbox>
            </div>
            <div class="checkbox-item">
              <mat-checkbox [(ngModel)]="checkboxValue2" checked>Checked</mat-checkbox>
            </div>
            <div class="checkbox-item">
              <mat-checkbox [indeterminate]="true">Indeterminate</mat-checkbox>
            </div>
            <div class="checkbox-item">
              <mat-checkbox disabled>Disabled</mat-checkbox>
            </div>
            <div class="checkbox-item">
              <mat-checkbox disabled checked>Disabled Checked</mat-checkbox>
            </div>
            <div class="checkbox-item">
              <mat-checkbox color="primary">Primary Color</mat-checkbox>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Radio Button -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Radio Button</mat-card-title>
          <mat-card-subtitle>Selection with mutually exclusive options</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="radio-group">
            <p class="radio-label">Select an option:</p>
            <mat-radio-group [(ngModel)]="selectedRadio">
              <mat-radio-button value="option1">Option 1</mat-radio-button>
              <mat-radio-button value="option2">Option 2</mat-radio-button>
              <mat-radio-button value="option3">Option 3</mat-radio-button>
              <mat-radio-button value="option4" disabled>Option 4 (Disabled)</mat-radio-button>
            </mat-radio-group>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Slider -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Slider</mat-card-title>
          <mat-card-subtitle>Range input with draggable thumb</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="slider-container">
            <div class="slider-item">
              <p>Single Value Slider: {{ sliderValue }}</p>
              <mat-slider min="0" max="100" step="1">
                <input matSliderThumb [(ngModel)]="sliderValue" />
              </mat-slider>
            </div>

            <div class="slider-item">
              <p>Disabled Slider</p>
              <mat-slider min="0" max="100" disabled>
                <input matSliderThumb value="50" />
              </mat-slider>
            </div>

            <div class="slider-item">
              <p>Range Slider: {{ sliderMin }} - {{ sliderMax }}</p>
              <mat-slider min="0" max="100" step="5">
                <input matSliderStartThumb [(ngModel)]="sliderMin" />
                <input matSliderEndThumb [(ngModel)]="sliderMax" />
              </mat-slider>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Slide Toggle -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Slide Toggle</mat-card-title>
          <mat-card-subtitle>On/Off switch control</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="toggle-grid">
            <div class="toggle-item">
              <mat-slide-toggle [(ngModel)]="toggleValue1">Default Toggle</mat-slide-toggle>
            </div>
            <div class="toggle-item">
              <mat-slide-toggle [(ngModel)]="toggleValue2" checked>Checked Toggle</mat-slide-toggle>
            </div>
            <div class="toggle-item">
              <mat-slide-toggle disabled>Disabled Toggle</mat-slide-toggle>
            </div>
            <div class="toggle-item">
              <mat-slide-toggle color="primary">Primary Color</mat-slide-toggle>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Datepicker -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Datepicker</mat-card-title>
          <mat-card-subtitle>Date selection with calendar popup</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Select Date</mat-label>
              <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDate" />
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Date Range Start</mat-label>
              <input matInput [matDatepicker]="startPicker" [(ngModel)]="dateRangeStart" />
              <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Date Range End</mat-label>
              <input matInput [matDatepicker]="endPicker" [(ngModel)]="dateRangeEnd" />
              <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Form States -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Form States</mat-card-title>
          <mat-card-subtitle>Different states of form fields</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Default State</mat-label>
              <input matInput />
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Focused State</mat-label>
              <input matInput value="Focused" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field" [class.ng-invalid]="true">
              <mat-label>Error State</mat-label>
              <input matInput />
              <mat-error>Error message</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Success State</mat-label>
              <input matInput value="Valid input" />
              <mat-hint>✓ All good</mat-hint>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .section-container {
        display: flex;
        flex-direction: column;
        gap: var(--preset-spacing-lg, 36px);
      }

      .section-title {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        color: var(--theme-text-primary);
        letter-spacing: -0.5px;
      }

      .section-description {
        margin: 8px 0 0 0;
        font-size: 14px;
        color: var(--theme-text-secondary);
      }

      .component-card {
        border-radius: var(--preset-border-radius, 12px);
        box-shadow: var(--preset-shadow, 0 10px 15px rgba(0, 0, 0, 0.1));
        transition: var(--preset-transition, all 300ms ease-in-out);
      }

      .component-card mat-card-header {
        padding: var(--preset-spacing-base, 24px) var(--preset-spacing-base, 24px)
          var(--preset-spacing-md, 18px) var(--preset-spacing-base, 24px);
        border-bottom: 1px solid var(--theme-surface-border);
      }

      .component-card mat-card-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .component-card mat-card-subtitle {
        margin-top: 4px;
        font-size: 13px;
        color: var(--theme-text-secondary);
      }

      .component-card mat-card-content {
        padding: var(--preset-spacing-base, 24px);
      }

      .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--preset-spacing-lg, 36px);
        margin-bottom: var(--preset-spacing-lg, 36px);

        &:last-child {
          margin-bottom: 0;
        }
      }

      .form-field {
        width: 100%;
      }

      .form-field ::ng-deep .mat-mdc-text-field-wrapper {
        padding-bottom: 0 !important;
      }

      .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--preset-spacing-lg, 36px);
      }

      .checkbox-item {
        display: flex;
        align-items: center;
      }

      .radio-group {
        padding: var(--preset-spacing-md, 18px) 0;
      }

      .radio-label {
        margin: 0 0 var(--preset-spacing-md, 18px) 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--theme-text-secondary);
      }

      mat-radio-group {
        display: flex;
        flex-direction: column;
        gap: var(--preset-spacing-md, 18px);
      }

      .slider-container {
        display: flex;
        flex-direction: column;
        gap: var(--preset-spacing-lg, 36px);
      }

      .slider-item {
        padding: var(--preset-spacing-md, 18px) 0;
      }

      .slider-item p {
        margin: 0 0 var(--preset-spacing-md, 18px) 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--theme-text-secondary);
      }

      .toggle-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--preset-spacing-lg, 36px);
      }

      .toggle-item {
        display: flex;
        align-items: center;
      }
    `,
  ],
})
export class FormControlsSection {
  // Text Input
  textValue = 'Sample text';
  textareaValue = 'Sample textarea content';

  // Select
  selectedOption = 'option1';
  selectedOptions: string[] = ['1', '2'];

  // Checkbox
  checkboxValue1 = false;
  checkboxValue2 = true;

  // Radio
  selectedRadio = 'option1';

  // Slider
  sliderValue = 30;
  sliderMin = 20;
  sliderMax = 80;

  // Toggle
  toggleValue1 = false;
  toggleValue2 = true;

  // Datepicker
  selectedDate = new Date();
  dateRangeStart = new Date();
  dateRangeEnd = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
}
