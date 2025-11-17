import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

// Forms
import { AxDatePickerComponent, dateValidators, DateRange } from '@aegisx/ui';

// Data Display
import { AxCardComponent } from '@aegisx/ui';
import { AxAvatarComponent } from '@aegisx/ui';
import { AxListComponent, ListItem } from '@aegisx/ui';
import { AxStatsCardComponent } from '@aegisx/ui';
import { AxTimelineComponent, TimelineItem } from '@aegisx/ui';
import { AxFieldDisplayComponent } from '@aegisx/ui';
import { AxDescriptionListComponent } from '@aegisx/ui';

// Feedback
import { AxAlertComponent } from '@aegisx/ui';
import { AxLoadingBarComponent, LoadingBarService } from '@aegisx/ui';

// Navigation
import { AxBreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-aegisx-ui-showcase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    // Forms
    AxDatePickerComponent,
    // Data Display
    AxCardComponent,
    AxAvatarComponent,
    AxListComponent,
    AxStatsCardComponent,
    AxTimelineComponent,
    AxFieldDisplayComponent,
    AxDescriptionListComponent,
    // Feedback
    AxAlertComponent,
    AxLoadingBarComponent,
    // Navigation
    AxBreadcrumbComponent,
    MatIcon,
  ],
  templateUrl: './aegisx-ui-showcase.component.html',
  styleUrls: ['./aegisx-ui-showcase.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AegisxUiShowcaseComponent {
  constructor(private loadingBarService: LoadingBarService) {}

  // Alert demo states
  showAutoHideAlert = false;
  showAutoHideSuccess = false;
  showAutoHideWarning = false;

  // Form states
  checkboxValue = false;
  radioValue = 'option1';
  radioOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ];
  inputValue = '';
  selectValue = '';
  selectOptions = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' },
  ];
  toggleValue = false;
  textareaValue = '';
  dateValue = new Date();
  dateValueThai = new Date();
  dateValueThaiGregorian = new Date();
  dateValueThaiShort = new Date();
  dateValueEnShort = new Date();
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

  // ===========================================
  // Angular Forms Integration Examples
  // ===========================================

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

  // ===========================================
  // Date Range Examples (NEW)
  // ===========================================

  // Basic range
  dateRangeBasic = new FormControl<DateRange | null>(null);

  // Required range
  dateRangeRequired = new FormControl<DateRange | null>(null, [
    dateValidators.required(),
  ]);

  // Range with min/max dates (e.g., hotel booking)
  dateRangeHotel = new FormControl<DateRange | null>(null);
  hotelMinDate = new Date(); // Today
  hotelMaxDate = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

  // Travel dates with constraints
  travelDates = new FormControl<DateRange | null>(null, [
    dateValidators.required(),
  ]);
  travelMinDate = new Date();
  travelMaxDate = new Date(new Date().getTime() + 180 * 24 * 60 * 60 * 1000); // 6 months

  // Data Display
  listItems: ListItem[] = [
    { title: 'Item 1', description: 'Description 1', icon: '📄' },
    { title: 'Item 2', description: 'Description 2', icon: '📁' },
    { title: 'Item 3', description: 'Description 3', icon: '📊' },
  ];

  timelineItems: TimelineItem[] = [
    {
      title: 'Event 1',
      description: 'First event',
      timestamp: '2024-01-01',
      color: 'var(--ax-primary)',
    },
    {
      title: 'Event 2',
      description: 'Second event',
      timestamp: '2024-01-02',
      color: 'var(--ax-success)',
    },
    {
      title: 'Event 3',
      description: 'Third event',
      timestamp: '2024-01-03',
      color: 'var(--ax-info)',
    },
  ];

  // Display Components (NEW)
  userProfile = {
    fullName: 'Sathit Seethaphon',
    email: 'sathit@example.com',
    phone: '0991234567',
    website: 'https://example.com',
    role: 'Administrator',
    department: 'Engineering',
    joinDate: new Date('2024-01-15'),
    salary: 85000,
    performanceScore: 92.5,
    isActive: true,
  };

  // Validation demo data
  validationDemo = {
    username: 'sathit_dev',
    email: 'sathit@example.com',
  };

  orderData = {
    id: 'ORD-2024-001',
    customer: 'John Doe',
    email: 'john@example.com',
    phone: '0881234567',
    orderDate: new Date('2024-11-01'),
    deliveryDate: new Date('2024-11-10'),
    status: 'Delivered',
    subtotal: 1250.0,
    tax: 87.5,
    shipping: 50.0,
    total: 1387.5,
    itemCount: 3,
  };

  // Feedback
  showDialog = false;
  showDialogSmall = false;
  showDialogLarge = false;
  showDialogFull = false;
  showDrawer = false;
  showDrawerLeft = false;
  showDrawerTop = false;
  showDrawerBottom = false;
  progressValue = 45;

  // Navigation
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Components', url: '/components' },
    { label: 'Showcase' },
  ];

  // ==========================================
  // Loading Bar Demo Methods
  // ==========================================

  /**
   * Demo 1: Simple indeterminate loading
   */
  demoSimpleLoading(): void {
    this.loadingBarService.show('primary');
    setTimeout(() => this.loadingBarService.hide(), 3000);
  }

  /**
   * Demo 2: Success loading
   */
  demoSuccessLoading(): void {
    this.loadingBarService.showSuccess('Operation successful!');
    setTimeout(() => this.loadingBarService.hide(), 2000);
  }

  /**
   * Demo 3: Error loading
   */
  demoErrorLoading(): void {
    this.loadingBarService.showError('Something went wrong!');
    setTimeout(() => this.loadingBarService.hide(), 2000);
  }

  /**
   * Demo 4: Warning loading
   */
  demoWarningLoading(): void {
    this.loadingBarService.showWarning('Please wait...');
    setTimeout(() => this.loadingBarService.hide(), 2000);
  }

  /**
   * Demo 5: Progress loading (simulated upload)
   */
  demoProgressLoading(): void {
    this.loadingBarService.showProgress(0, 'primary', 'Uploading file...');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      this.loadingBarService.setProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        this.loadingBarService.complete(500);
      }
    }, 300);
  }

  /**
   * Demo 6: Multi-step process
   */
  demoMultiStepProcess(): void {
    this.loadingBarService.showProgress(0, 'primary', 'Step 1: Validating...');

    setTimeout(() => {
      this.loadingBarService.setProgress(33, 'Step 2: Processing...');
    }, 1000);

    setTimeout(() => {
      this.loadingBarService.setProgress(66, 'Step 3: Finalizing...');
    }, 2000);

    setTimeout(() => {
      this.loadingBarService.setProgress(100, 'Completed!');
      this.loadingBarService.complete(500);
    }, 3000);
  }

  /**
   * Demo 7: Simulated API call with error handling
   */
  async demoApiCall(): Promise<void> {
    this.loadingBarService.show('primary', 'Fetching data...');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.loadingBarService.showSuccess('Data loaded successfully!');
      setTimeout(() => this.loadingBarService.hide(), 1500);
    } catch (_error) {
      this.loadingBarService.showError('Failed to load data');
      setTimeout(() => this.loadingBarService.hide(), 2000);
    }
  }

  /**
   * Demo 8: Auto-progress simulation
   */
  demoAutoProgress(): void {
    this.loadingBarService.showProgress(0, 'success');
    this.loadingBarService.simulateProgress(3000, 90);

    setTimeout(() => {
      this.loadingBarService.complete();
    }, 3500);
  }

  /**
   * Alert auto-hide demos
   */
  showInfoAlert(): void {
    this.showAutoHideAlert = true;
  }

  showSuccessAlert(): void {
    this.showAutoHideSuccess = true;
  }

  showWarningAlert(): void {
    this.showAutoHideWarning = true;
  }

  onAlertClose(alertType: string): void {
    if (alertType === 'info') {
      this.showAutoHideAlert = false;
    } else if (alertType === 'success') {
      this.showAutoHideSuccess = false;
    } else if (alertType === 'warning') {
      this.showAutoHideWarning = false;
    }
  }
}
