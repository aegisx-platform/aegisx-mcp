import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AxDrawerComponent } from '@aegisx/ui';
import { BudgetRequestItemService } from '../../services/budget-request-items.service';
import { ControlType } from '../../types/budget-request-items.types';

export interface BudgetControlSettings {
  quantity_control_type: ControlType | null;
  price_control_type: ControlType | null;
  quantity_variance_percent: number | null;
  price_variance_percent: number | null;
}

@Component({
  selector: 'app-item-settings-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    AxDrawerComponent,
  ],
  templateUrl: './item-settings-modal.component.html',
  styleUrl: './item-settings-modal.component.scss',
})
export class ItemSettingsModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private budgetRequestItemService = inject(BudgetRequestItemService);
  private snackBar = inject(MatSnackBar);

  @Input() itemId!: number;
  @Input() itemName?: string;
  @Input() currentSettings: BudgetControlSettings = {
    quantity_control_type: 'NONE',
    price_control_type: 'NONE',
    quantity_variance_percent: null,
    price_variance_percent: null,
  };

  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isOpen = signal(false);
  isSaving = signal(false);

  settingsForm!: FormGroup;

  // Signals to track form values for reactivity
  quantityControlType = signal<string>('NONE');
  priceControlType = signal<string>('NONE');

  // Control type options with icons
  controlTypeOptions = [
    { value: 'NONE', label: 'None', icon: '⚪', color: 'text-gray-500' },
    {
      value: 'SOFT',
      label: 'Soft Warning',
      icon: '🟡',
      color: 'text-yellow-600',
    },
    { value: 'HARD', label: 'Hard Block', icon: '🔴', color: 'text-red-600' },
  ];

  // Computed signals for conditional rendering (now reactive!)
  showQuantityVariance = computed(() => {
    const controlType = this.quantityControlType();
    return controlType === 'SOFT' || controlType === 'HARD';
  });

  showPriceVariance = computed(() => {
    const controlType = this.priceControlType();
    return controlType === 'SOFT' || controlType === 'HARD';
  });

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      quantity_control_type: [
        this.currentSettings.quantity_control_type || 'NONE',
      ],
      price_control_type: [this.currentSettings.price_control_type || 'NONE'],
      quantity_variance_percent: [
        this.currentSettings.quantity_variance_percent,
        [Validators.min(0), Validators.max(100)],
      ],
      price_variance_percent: [
        this.currentSettings.price_variance_percent,
        [Validators.min(0), Validators.max(100)],
      ],
    });

    // Initialize signals with current form values
    this.quantityControlType.set(
      this.settingsForm.get('quantity_control_type')?.value || 'NONE',
    );
    this.priceControlType.set(
      this.settingsForm.get('price_control_type')?.value || 'NONE',
    );

    // Subscribe to control type changes to update signals and clear variance when NONE
    this.settingsForm
      .get('quantity_control_type')
      ?.valueChanges.subscribe((value) => {
        // Update signal for reactive computed
        this.quantityControlType.set(value);

        if (value === 'NONE') {
          this.settingsForm.get('quantity_variance_percent')?.setValue(null);
          this.settingsForm.get('quantity_variance_percent')?.clearValidators();
        } else {
          this.settingsForm
            .get('quantity_variance_percent')
            ?.setValidators([
              Validators.required,
              Validators.min(0),
              Validators.max(100),
            ]);
        }
        this.settingsForm
          .get('quantity_variance_percent')
          ?.updateValueAndValidity();
      });

    this.settingsForm
      .get('price_control_type')
      ?.valueChanges.subscribe((value) => {
        // Update signal for reactive computed
        this.priceControlType.set(value);

        if (value === 'NONE') {
          this.settingsForm.get('price_variance_percent')?.setValue(null);
          this.settingsForm.get('price_variance_percent')?.clearValidators();
        } else {
          this.settingsForm
            .get('price_variance_percent')
            ?.setValidators([
              Validators.required,
              Validators.min(0),
              Validators.max(100),
            ]);
        }
        this.settingsForm
          .get('price_variance_percent')
          ?.updateValueAndValidity();
      });
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  onOpenChange(open: boolean): void {
    this.isOpen.set(open);
    if (!open) {
      this.closed.emit();
    }
  }

  async onSave(): Promise<void> {
    if (this.settingsForm.invalid) {
      this.snackBar.open(
        'Please fill in all required fields correctly',
        'Close',
        {
          duration: 3000,
        },
      );
      return;
    }

    this.isSaving.set(true);

    try {
      const formValue = this.settingsForm.value;

      // Prepare update data
      const updateData = {
        quantity_control_type: formValue.quantity_control_type as ControlType,
        price_control_type: formValue.price_control_type as ControlType,
        quantity_variance_percent:
          formValue.quantity_control_type === 'NONE'
            ? null
            : formValue.quantity_variance_percent,
        price_variance_percent:
          formValue.price_control_type === 'NONE'
            ? null
            : formValue.price_variance_percent,
      };

      await this.budgetRequestItemService.updateBudgetRequestItem(
        this.itemId,
        updateData,
      );

      this.snackBar.open(
        'Budget control settings updated successfully',
        'Close',
        {
          duration: 3000,
        },
      );

      this.saved.emit();
      this.close();
    } catch (error: any) {
      this.snackBar.open(
        error?.message || 'Failed to update budget control settings',
        'Close',
        {
          duration: 5000,
        },
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  getControlTypeIcon(controlType: ControlType | null): string {
    return (
      this.controlTypeOptions.find((opt) => opt.value === controlType)?.icon ||
      '⚪'
    );
  }

  getControlTypeColor(controlType: ControlType | null): string {
    return (
      this.controlTypeOptions.find((opt) => opt.value === controlType)?.color ||
      'text-gray-500'
    );
  }
}
