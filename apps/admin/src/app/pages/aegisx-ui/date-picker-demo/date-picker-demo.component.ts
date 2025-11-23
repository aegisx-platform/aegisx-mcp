import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AxDatePickerComponent, dateValidators } from '@aegisx/ui';

@Component({
  selector: 'app-date-picker-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    AxDatePickerComponent,
  ],
  templateUrl: './date-picker-demo.component.html',
  styleUrls: ['./date-picker-demo.component.scss'],
})
export class DatePickerDemoComponent {
  // Basic date pickers
  dateValue = new Date();
  dateValueThai = new Date();
  dateValueThaiGregorian = new Date();
  dateValueThaiShort = new Date();
  dateValueRestricted = new Date();
  dateValueSundayStart = new Date();
  dateValueMondayStart = new Date();
  dateValueCustomFormat1 = new Date();
  dateValueCustomFormat2 = new Date();
  dateValueCustomFormat3 = new Date();
  dateValueCustomFormat4 = new Date();
  dateValueCustomFormat5 = new Date();
  dateValueCustomFormat6 = new Date();
  dateValueWithActions = new Date();
  dateValueWithActionsRestricted: Date | null = null;
  today = new Date();
  maxDate = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  // User profile for component states demo
  userProfile = {
    joinDate: new Date('2024-01-15'),
  };

  // Template-driven Form Examples (ngModel)
  dateTemplateRequired: Date | null = null;
  dateTemplateMinMax: Date | null = null;
  minDate2024 = new Date(2024, 0, 1); // Jan 1, 2024
  maxDate2024 = new Date(2024, 11, 31); // Dec 31, 2024

  // Reactive Forms Examples (FormControl)
  dateReactiveBasic = new FormControl<Date | null>(null);
  dateReactiveRequired = new FormControl<Date | null>(null, [
    dateValidators.required(),
  ]);
  dateReactiveRange = new FormControl<Date | null>(null, [
    dateValidators.minDate(new Date(2024, 0, 1)),
    dateValidators.maxDate(new Date(2024, 11, 31)),
  ]);
  dateReactiveFuture = new FormControl<Date | null>(null, [
    dateValidators.required(),
    dateValidators.futureDate(),
  ]);
  dateReactiveWeekday = new FormControl<Date | null>(null, [
    dateValidators.noWeekend(),
  ]);

  // Reactive Form Group Example
  appointmentForm = new FormGroup({
    appointmentDate: new FormControl<Date | null>(null, [
      dateValidators.required(),
      dateValidators.futureDate(),
      dateValidators.noWeekend(),
    ]),
    birthDate: new FormControl<Date | null>(null, [
      dateValidators.required(),
      dateValidators.pastDate(),
    ]),
  });
}
