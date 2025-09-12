import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  GroupedSettings,
  Setting,
  SettingChangeEvent,
} from '../settings.types';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'ax-dynamic-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  template: `
    <div class="dynamic-settings">
      @if (groupedSettings) {
        <form [formGroup]="settingsForm" class="space-y-8">
          @for (group of groupedSettings.groups; track group.name) {
            <div class="settings-group">
              @if (group.name) {
                <div class="mb-6">
                  <h3
                    class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100"
                  >
                    {{ group.name }}
                  </h3>
                  <mat-divider class="mb-6"></mat-divider>
                </div>
              }

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (setting of group.settings; track setting.id) {
                  <!-- Skip hidden settings -->
                  @if (!setting.isHidden) {
                    <div
                      class="setting-field"
                      [class.full-width]="isFullWidth(setting)"
                      [class.col-span-2]="isFullWidth(setting)"
                    >
                      <!-- String/Email/URL Input -->
                      @if (
                        setting.dataType === 'string' ||
                        setting.dataType === 'email' ||
                        setting.dataType === 'url'
                      ) {
                        <mat-form-field appearance="outline" class="w-full">
                          <mat-label>{{ setting.label }}</mat-label>
                          <input
                            matInput
                            [formControlName]="setting.id"
                            [type]="getInputType(setting)"
                            [placeholder]="setting.uiSchema?.placeholder || ''"
                            [readonly]="setting.isReadonly"
                          />
                          @if (setting.uiSchema?.suffix) {
                            <mat-icon matSuffix>{{
                              setting.uiSchema?.suffix
                            }}</mat-icon>
                          }
                          @if (setting.description) {
                            <mat-hint>{{ setting.description }}</mat-hint>
                          }
                          <mat-error *ngIf="getFieldError(setting.id)">
                            {{ getFieldError(setting.id) }}
                          </mat-error>
                        </mat-form-field>
                      }

                      <!-- Textarea -->
                      @if (
                        setting.dataType === 'string' &&
                        setting.uiSchema?.component === 'textarea'
                      ) {
                        <mat-form-field appearance="outline" class="w-full">
                          <mat-label>{{ setting.label }}</mat-label>
                          <textarea
                            matInput
                            [formControlName]="setting.id"
                            [rows]="setting.uiSchema?.rows || 3"
                            [placeholder]="setting.uiSchema?.placeholder || ''"
                            [readonly]="setting.isReadonly"
                          ></textarea>
                          @if (setting.description) {
                            <mat-hint>{{ setting.description }}</mat-hint>
                          }
                        </mat-form-field>
                      }

                      <!-- Number Input -->
                      @if (setting.dataType === 'number') {
                        <mat-form-field appearance="outline" class="w-full">
                          <mat-label>{{ setting.label }}</mat-label>
                          <input
                            matInput
                            type="number"
                            [formControlName]="setting.id"
                            [placeholder]="setting.uiSchema?.placeholder || ''"
                            [readonly]="setting.isReadonly"
                          />
                          @if (setting.uiSchema?.suffix) {
                            <mat-icon matSuffix>{{
                              setting.uiSchema?.suffix
                            }}</mat-icon>
                          }
                          @if (setting.description) {
                            <mat-hint>{{ setting.description }}</mat-hint>
                          }
                          <mat-error *ngIf="getFieldError(setting.id)">
                            {{ getFieldError(setting.id) }}
                          </mat-error>
                        </mat-form-field>
                      }

                      <!-- Select Dropdown -->
                      @if (
                        setting.uiSchema?.component === 'select' &&
                        setting.uiSchema?.options
                      ) {
                        <mat-form-field appearance="outline" class="w-full">
                          <mat-label>{{ setting.label }}</mat-label>
                          <mat-select
                            [formControlName]="setting.id"
                            [disabled]="setting.isReadonly"
                          >
                            @for (
                              option of setting.uiSchema?.options ?? [];
                              track option.value
                            ) {
                              <mat-option [value]="option.value">{{
                                option.label
                              }}</mat-option>
                            }
                          </mat-select>
                          @if (setting.uiSchema?.suffix) {
                            <mat-icon matSuffix>{{
                              setting.uiSchema?.suffix
                            }}</mat-icon>
                          }
                          @if (setting.description) {
                            <mat-hint>{{ setting.description }}</mat-hint>
                          }
                        </mat-form-field>
                      }

                      <!-- Boolean Toggle -->
                      @if (setting.dataType === 'boolean') {
                        <div class="flex items-center justify-between py-2">
                          <div class="flex-1">
                            <div class="flex items-center">
                              <p
                                class="font-medium text-gray-900 dark:text-gray-100"
                              >
                                {{ setting.label }}
                              </p>
                              @if (setting.description) {
                                <mat-icon
                                  class="ml-2 text-gray-400 cursor-help"
                                  matTooltip="{{ setting.description }}"
                                  fontIcon="help_outline"
                                ></mat-icon>
                              }
                            </div>
                            @if (setting.description) {
                              <p
                                class="text-sm text-gray-600 dark:text-gray-400 mt-1"
                              >
                                {{ setting.description }}
                              </p>
                            }
                          </div>
                          <mat-slide-toggle
                            [formControlName]="setting.id"
                            [disabled]="setting.isReadonly"
                            [color]="getToggleColor(setting)"
                          ></mat-slide-toggle>
                        </div>
                      }

                      <!-- Date Input -->
                      @if (setting.dataType === 'date') {
                        <mat-form-field appearance="outline" class="w-full">
                          <mat-label>{{ setting.label }}</mat-label>
                          <input
                            matInput
                            [matDatepicker]="picker"
                            [formControlName]="setting.id"
                            [readonly]="setting.isReadonly"
                          />
                          <mat-hint>{{ setting.description }}</mat-hint>
                          <mat-datepicker-toggle
                            matSuffix
                            [for]="picker"
                          ></mat-datepicker-toggle>
                          <mat-datepicker #picker></mat-datepicker>
                        </mat-form-field>
                      }

                      <!-- JSON/Array Display -->
                      @if (
                        setting.dataType === 'json' ||
                        setting.dataType === 'array'
                      ) {
                        <mat-form-field appearance="outline" class="w-full">
                          <mat-label>{{ setting.label }}</mat-label>
                          <textarea
                            matInput
                            [formControlName]="setting.id"
                            rows="4"
                            [placeholder]="'Enter valid JSON'"
                            [readonly]="setting.isReadonly"
                          ></textarea>
                          @if (setting.description) {
                            <mat-hint>{{ setting.description }}</mat-hint>
                          }
                          <mat-error *ngIf="getFieldError(setting.id)">
                            {{ getFieldError(setting.id) }}
                          </mat-error>
                        </mat-form-field>
                      }

                      <!-- Change indicator -->
                      @if (hasSettingChanged(setting.id)) {
                        <div class="absolute top-2 right-2">
                          <mat-icon
                            class="text-orange-500 text-sm"
                            fontIcon="edit"
                            matTooltip="This setting has been modified"
                          ></mat-icon>
                        </div>
                      }
                    </div>
                  }
                }
              </div>
            </div>
          }
        </form>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .setting-field {
        position: relative;
      }

      .full-width {
        grid-column: 1 / -1;
      }

      mat-form-field {
        margin-bottom: 4px;
      }

      .settings-group:not(:last-child) {
        margin-bottom: 2rem;
      }

      // Custom slide toggle colors
      ::ng-deep .mat-slide-toggle.mat-warn .mat-slide-toggle-thumb {
        background-color: #f44336;
      }

      ::ng-deep .mat-slide-toggle.mat-warn .mat-slide-toggle-track {
        background-color: rgba(244, 67, 54, 0.5);
      }
    `,
  ],
})
export class DynamicSettingsComponent implements OnInit, OnDestroy {
  @Input() groupedSettings!: GroupedSettings;
  @Output() settingsChange = new EventEmitter<SettingChangeEvent>();

  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private destroy$ = new Subject<void>();

  settingsForm!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
    this.subscribeToFormChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    const controls: Record<string, FormControl> = {};

    this.groupedSettings.groups.forEach((group) => {
      group.settings.forEach((setting) => {
        const validators = this.buildValidators(setting);
        const value = this.formatValueForForm(setting.value, setting.dataType);

        controls[setting.id] = new FormControl(
          {
            value,
            disabled: setting.isReadonly,
          },
          validators,
        );
      });
    });

    this.settingsForm = this.fb.group(controls);
  }

  private buildValidators(setting: Setting): any[] {
    const validators: any[] = [];

    if (setting.validationRules) {
      const rules = setting.validationRules;

      if (rules.required) {
        validators.push(Validators.required);
      }

      if (rules.minLength) {
        validators.push(Validators.minLength(rules.minLength));
      }

      if (rules.maxLength) {
        validators.push(Validators.maxLength(rules.maxLength));
      }

      if (rules.min !== undefined) {
        validators.push(Validators.min(rules.min));
      }

      if (rules.max !== undefined) {
        validators.push(Validators.max(rules.max));
      }

      if (rules.pattern) {
        validators.push(Validators.pattern(rules.pattern));
      }

      if (setting.dataType === 'email') {
        validators.push(Validators.email);
      }
    }

    // Add custom validators for JSON/Array types
    if (setting.dataType === 'json' || setting.dataType === 'array') {
      validators.push(this.jsonValidator);
    }

    return validators;
  }

  private jsonValidator(
    control: AbstractControl,
  ): { [key: string]: any } | null {
    if (!control.value) return null;

    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  private subscribeToFormChanges(): void {
    this.settingsForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((values) => {
        Object.entries(values).forEach(([settingId, value]) => {
          const setting = this.findSettingById(settingId);
          if (setting && !setting.isReadonly) {
            const formattedValue = this.formatValueForBackend(
              value,
              setting.dataType,
            );

            // Only emit if value actually changed
            if (this.hasValueChanged(setting, formattedValue)) {
              this.settingsChange.emit({
                settingId,
                key: setting.key,
                oldValue: setting.value,
                newValue: formattedValue,
                category: this.groupedSettings.category,
              });
            }
          }
        });
      });
  }

  private findSettingById(settingId: string): Setting | undefined {
    for (const group of this.groupedSettings.groups) {
      const setting = group.settings.find((s) => s.id === settingId);
      if (setting) return setting;
    }
    return undefined;
  }

  private hasValueChanged(setting: Setting, newValue: any): boolean {
    return JSON.stringify(setting.value) !== JSON.stringify(newValue);
  }

  private formatValueForForm(value: any, dataType: string): any {
    if (value === null || value === undefined) return '';

    switch (dataType) {
      case 'json':
      case 'array':
        return typeof value === 'string'
          ? value
          : JSON.stringify(value, null, 2);
      case 'date':
        return value ? new Date(value) : null;
      default:
        return value;
    }
  }

  private formatValueForBackend(value: any, dataType: string): any {
    switch (dataType) {
      case 'number':
        return value ? Number(value) : null;
      case 'boolean':
        return Boolean(value);
      case 'json':
      case 'array':
        try {
          return value ? JSON.parse(value) : null;
        } catch {
          return value;
        }
      case 'date':
        return value ? value.toISOString() : null;
      default:
        return value;
    }
  }

  getInputType(setting: Setting): string {
    switch (setting.dataType) {
      case 'email':
        return 'email';
      case 'url':
        return 'url';
      case 'number':
        return 'number';
      default:
        return 'text';
    }
  }

  isFullWidth(setting: Setting): boolean {
    return (
      setting.uiSchema?.component === 'textarea' ||
      setting.dataType === 'json' ||
      setting.dataType === 'array' ||
      Boolean(setting.uiSchema?.rows && setting.uiSchema.rows > 1)
    );
  }

  getToggleColor(setting: Setting): 'primary' | 'accent' | 'warn' {
    if (setting.key.includes('maintenance') || setting.key.includes('debug')) {
      return 'warn';
    }
    return 'primary';
  }

  getFieldError(settingId: string): string | null {
    const control = this.settingsForm.get(settingId);
    if (control && control.invalid && control.touched) {
      if (control.errors?.['required']) return 'This field is required';
      if (control.errors?.['email']) return 'Please enter a valid email';
      if (control.errors?.['minlength'])
        return `Minimum length is ${control.errors['minlength'].requiredLength}`;
      if (control.errors?.['maxlength'])
        return `Maximum length is ${control.errors['maxlength'].requiredLength}`;
      if (control.errors?.['min'])
        return `Minimum value is ${control.errors['min'].min}`;
      if (control.errors?.['max'])
        return `Maximum value is ${control.errors['max'].max}`;
      if (control.errors?.['pattern']) return 'Invalid format';
      if (control.errors?.['invalidJson']) return 'Invalid JSON format';
    }
    return null;
  }

  hasSettingChanged(settingId: string): boolean {
    return this.settingsService.hasSettingChanged(settingId);
  }
}
