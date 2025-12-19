import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AxLocationPickerComponent } from '../location-picker/ax-location-picker.component';
import { AxQuantityInputComponent } from '../quantity-input/ax-quantity-input.component';
import {
  DEFAULT_WIZARD_CONFIG,
  DEFAULT_WIZARD_STEPS,
  ProductSearchResult,
  StepValidationResult,
  StockTransfer,
  TransferDraft,
  TransferItem,
  TransferLocation,
  TransferWizardConfig,
  TransferWizardState,
  WizardStep,
} from './ax-transfer-wizard.component.types';

/**
 * Inventory Transfer Wizard Component
 * ====================================
 *
 * A multi-step wizard component for creating and managing inventory transfers between locations.
 *
 * Features:
 * - Multi-step workflow: Source Selection → Destination Selection → Items Selection → Quantity Input → Review & Confirm
 * - Progress indicator showing current step
 * - Form validation at each step
 * - Save draft functionality with local storage
 * - Summary review before submission
 * - Navigation controls (next/previous/jump to step)
 * - Integration with location picker and quantity input components
 * - Real-time validation and error display
 * - Support for batch tracking (optional)
 * - Approval workflow support (optional)
 *
 * @example
 * ```html
 * <ax-transfer-wizard
 *   [sourceLocation]="sourceLocationId"
 *   [steps]="customSteps"
 *   [allowPartialTransfer]="true"
 *   [requireApproval]="false"
 *   [allowMultipleProducts]="true"
 *   (onComplete)="handleTransferComplete($event)"
 *   (onCancel)="handleTransferCancel()"
 *   (onStepChange)="handleStepChange($event)">
 * </ax-transfer-wizard>
 * ```
 */
@Component({
  selector: 'ax-transfer-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTableModule,
    MatTooltipModule,
    AxLocationPickerComponent,
    AxQuantityInputComponent,
  ],
  templateUrl: './ax-transfer-wizard.component.html',
  styleUrl: './ax-transfer-wizard.component.scss',
})
export class AxTransferWizardComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  // ============================================================
  // INPUTS
  // ============================================================

  /** Pre-selected source location ID (optional) */
  sourceLocation = input<string | undefined>(undefined);

  /** Custom wizard steps configuration (optional) */
  steps = input<WizardStep[]>(DEFAULT_WIZARD_STEPS);

  /** Configuration options */
  config = input<Partial<TransferWizardConfig>>({});

  /** Allow partial quantity transfers */
  allowPartialTransfer = input<boolean>(true);

  /** Require manager approval for transfers */
  requireApproval = input<boolean>(false);

  /** Allow selecting multiple products */
  allowMultipleProducts = input<boolean>(true);

  /** Enable draft save/load functionality */
  enableDraftSave = input<boolean>(true);

  /** Available locations for source/destination selection */
  availableLocations = input<any[]>([]);

  /** Product search function (optional - for autocomplete) */
  productSearchFn = input<
    ((term: string) => Promise<ProductSearchResult[]>) | undefined
  >(undefined);

  // ============================================================
  // OUTPUTS
  // ============================================================

  /** Emitted when transfer is submitted successfully */
  complete = output<StockTransfer>();

  /** Emitted when wizard is cancelled */
  cancel = output<void>();

  /** Emitted when step changes */
  stepChange = output<{ step: number; data: any }>();

  /** Emitted when draft is saved */
  draftSave = output<TransferDraft>();

  /** Emitted when draft is loaded */
  draftLoad = output<TransferDraft>();

  // ============================================================
  // VIEW CHILDREN
  // ============================================================

  @ViewChild('stepper') stepper?: MatStepper;

  // ============================================================
  // FORM GROUPS
  // ============================================================

  /** Main transfer form */
  transferForm: FormGroup;

  /** Source location step form */
  sourceForm: FormGroup;

  /** Destination location step form */
  destinationForm: FormGroup;

  /** Items selection step form */
  itemsForm: FormGroup;

  /** Quantities confirmation step form */
  quantitiesForm: FormGroup;

  /** Review step form */
  reviewForm: FormGroup;

  // ============================================================
  // SIGNALS - STATE MANAGEMENT
  // ============================================================

  /** Current active step (0-indexed) */
  protected readonly currentStep = signal<number>(0);

  /** Selected source location */
  protected readonly selectedSourceLocation = signal<TransferLocation | null>(
    null,
  );

  /** Selected destination location */
  protected readonly selectedDestinationLocation =
    signal<TransferLocation | null>(null);

  /** Selected transfer items */
  protected readonly selectedItems = signal<TransferItem[]>([]);

  /** Product search results for autocomplete */
  protected readonly productSearchResults = signal<ProductSearchResult[]>([]);

  /** Whether wizard is processing submission */
  protected readonly isProcessing = signal<boolean>(false);

  /** Whether wizard is complete */
  protected readonly isComplete = signal<boolean>(false);

  /** Validation errors by step */
  protected readonly stepErrors = signal<Record<number, string[]>>({});

  /** Whether a draft is saved */
  protected readonly isDraftSaved = signal<boolean>(false);

  /** Last saved timestamp */
  protected readonly lastSavedAt = signal<Date | undefined>(undefined);

  /** Search term for product autocomplete */
  protected readonly productSearchTerm = signal<string>('');

  /** Whether product search is loading */
  protected readonly isSearching = signal<boolean>(false);

  // ============================================================
  // COMPUTED SIGNALS
  // ============================================================

  /** Wizard configuration with defaults */
  protected readonly wizardConfig = computed<TransferWizardConfig>(() => ({
    ...DEFAULT_WIZARD_CONFIG,
    allowPartialTransfer: this.allowPartialTransfer(),
    requireApproval: this.requireApproval(),
    allowMultipleProducts: this.allowMultipleProducts(),
    enableDraftSave: this.enableDraftSave(),
    ...this.config(),
  }));

  /** Wizard steps */
  protected readonly wizardSteps = computed<WizardStep[]>(() => this.steps());

  /** Total number of steps */
  protected readonly totalSteps = computed<number>(
    () => this.wizardSteps().length,
  );

  /** Progress percentage */
  protected readonly progressPercentage = computed<number>(() => {
    const current = this.currentStep();
    const total = this.totalSteps();
    return total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  });

  /** Whether current step is valid */
  protected readonly isCurrentStepValid = computed<boolean>(() => {
    const step = this.currentStep();
    return this.validateStep(step).valid;
  });

  /** Whether on first step */
  protected readonly isFirstStep = computed<boolean>(
    () => this.currentStep() === 0,
  );

  /** Whether on last step */
  protected readonly isLastStep = computed<boolean>(
    () => this.currentStep() === this.totalSteps() - 1,
  );

  /** Can proceed to next step */
  protected readonly canProceed = computed<boolean>(() => {
    return this.isCurrentStepValid() && !this.isProcessing();
  });

  /** Can submit transfer */
  protected readonly canSubmit = computed<boolean>(() => {
    return (
      this.isLastStep() && this.isCurrentStepValid() && !this.isProcessing()
    );
  });

  /** Transfer summary for review step */
  protected readonly transferSummary = computed<Partial<StockTransfer>>(() => {
    const source = this.selectedSourceLocation();
    const destination = this.selectedDestinationLocation();
    const items = this.selectedItems();
    const notes = this.reviewForm.get('notes')?.value || '';

    return {
      sourceLocationId: source?.id || '',
      destinationLocationId: destination?.id || '',
      items: items,
      notes: notes,
      requiresApproval: this.wizardConfig().requireApproval,
    };
  });

  /** Items FormArray getter */
  get itemsArray(): FormArray {
    return this.itemsForm.get('items') as FormArray;
  }

  /** Quantities FormArray getter */
  get quantitiesArray(): FormArray {
    return this.quantitiesForm.get('quantities') as FormArray;
  }

  /** Table columns for items display */
  protected readonly displayedColumns = [
    'product',
    'sku',
    'available',
    'quantity',
    'actions',
  ];

  /** Review table columns */
  protected readonly reviewColumns = ['product', 'sku', 'quantity', 'unit'];

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor() {
    // Initialize forms
    this.sourceForm = this.fb.group({
      sourceLocationId: ['', Validators.required],
    });

    this.destinationForm = this.fb.group({
      destinationLocationId: ['', Validators.required],
    });

    this.itemsForm = this.fb.group({
      items: this.fb.array([]),
      productSearch: [''],
    });

    this.quantitiesForm = this.fb.group({
      quantities: this.fb.array([]),
    });

    this.reviewForm = this.fb.group({
      notes: [''],
    });

    this.transferForm = this.fb.group({
      source: this.sourceForm,
      destination: this.destinationForm,
      items: this.itemsForm,
      quantities: this.quantitiesForm,
      review: this.reviewForm,
    });

    // Auto-save draft on state changes
    effect(() => {
      const config = this.wizardConfig();
      if (config.enableDraftSave && !this.isProcessing()) {
        // Debounce auto-save to avoid excessive saves
        this.debouncedAutoSaveDraft();
      }
    });
  }

  // ============================================================
  // LIFECYCLE HOOKS
  // ============================================================

  ngOnInit(): void {
    // Pre-fill source location if provided
    if (this.sourceLocation()) {
      const sourceId = this.sourceLocation()!;
      this.sourceForm.patchValue({ sourceLocationId: sourceId });

      // Find location details from available locations
      const location = this.findLocationById(sourceId);
      if (location) {
        this.selectedSourceLocation.set({
          id: location.id,
          name: location.name,
          type: location.type,
        });
      }
    }

    // Try to load draft from local storage
    this.loadDraftFromStorage();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // ============================================================
  // STEP NAVIGATION
  // ============================================================

  /**
   * Navigate to next step
   */
  nextStep(): void {
    if (!this.canProceed()) {
      this.showValidationErrors();
      return;
    }

    const currentStep = this.currentStep();
    const nextStep = currentStep + 1;

    // Copy data from items to quantities on transition from items to quantities
    if (currentStep === 2 && nextStep === 3) {
      this.syncItemsToQuantities();
    }

    this.currentStep.set(nextStep);
    this.emitStepChange(nextStep);
    this.stepper?.next();
  }

  /**
   * Navigate to previous step
   */
  previousStep(): void {
    const prevStep = Math.max(0, this.currentStep() - 1);
    this.currentStep.set(prevStep);
    this.emitStepChange(prevStep);
    this.stepper?.previous();
  }

  /**
   * Jump to specific step
   */
  goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.totalSteps()) {
      this.currentStep.set(stepIndex);
      this.emitStepChange(stepIndex);
      if (this.stepper) {
        this.stepper.selectedIndex = stepIndex;
      }
    }
  }

  /**
   * Emit step change event
   */
  private emitStepChange(step: number): void {
    this.stepChange.emit({
      step,
      data: this.getStepData(step),
    });
  }

  /**
   * Get data for current step
   */
  private getStepData(step: number): any {
    switch (step) {
      case 0:
        return { sourceLocation: this.selectedSourceLocation() };
      case 1:
        return { destinationLocation: this.selectedDestinationLocation() };
      case 2:
        return { items: this.selectedItems() };
      case 3:
        return { quantities: this.quantitiesArray.value };
      case 4:
        return { summary: this.transferSummary() };
      default:
        return null;
    }
  }

  // ============================================================
  // STEP 1: SOURCE LOCATION SELECTION
  // ============================================================

  /**
   * Handle source location selection
   */
  onSourceLocationSelect(location: any): void {
    this.selectedSourceLocation.set({
      id: location.id,
      name: location.name,
      type: location.type,
      pathString: location.pathString,
    });
    this.sourceForm.patchValue({ sourceLocationId: location.id });
  }

  // ============================================================
  // STEP 2: DESTINATION LOCATION SELECTION
  // ============================================================

  /**
   * Handle destination location selection
   */
  onDestinationLocationSelect(location: any): void {
    // Validate not same as source
    if (location.id === this.selectedSourceLocation()?.id) {
      this.snackBar.open(
        'Destination cannot be the same as source location',
        'Close',
        {
          duration: 3000,
        },
      );
      return;
    }

    this.selectedDestinationLocation.set({
      id: location.id,
      name: location.name,
      type: location.type,
      pathString: location.pathString,
    });
    this.destinationForm.patchValue({ destinationLocationId: location.id });
  }

  // ============================================================
  // STEP 3: ITEMS SELECTION
  // ============================================================

  /**
   * Search products for autocomplete
   */
  async onProductSearch(term: string): Promise<void> {
    this.productSearchTerm.set(term);

    if (!term || term.length < 2) {
      this.productSearchResults.set([]);
      return;
    }

    const searchFn = this.productSearchFn();
    if (!searchFn) {
      // No search function provided - show message
      console.warn('No product search function provided');
      return;
    }

    this.isSearching.set(true);

    try {
      const results = await searchFn(term);
      this.productSearchResults.set(results);
    } catch (error) {
      console.error('Product search failed:', error);
      this.productSearchResults.set([]);
    } finally {
      this.isSearching.set(false);
    }
  }

  /**
   * Add product to transfer
   */
  addProduct(product: ProductSearchResult): void {
    // Check if product already added
    const existing = this.selectedItems().find(
      (item) => item.productId === product.id,
    );
    if (existing) {
      this.snackBar.open('Product already added to transfer', 'Close', {
        duration: 2000,
      });
      return;
    }

    // Check if multiple products allowed
    if (
      !this.wizardConfig().allowMultipleProducts &&
      this.selectedItems().length > 0
    ) {
      this.snackBar.open('Only one product allowed per transfer', 'Close', {
        duration: 2000,
      });
      return;
    }

    const item: TransferItem = {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: 0,
      availableQuantity: product.availableQuantity,
      unit: product.unit,
    };

    this.selectedItems.update((items) => [...items, item]);

    // Clear search
    this.itemsForm.patchValue({ productSearch: '' });
    this.productSearchResults.set([]);
  }

  /**
   * Remove product from transfer
   */
  removeProduct(index: number): void {
    this.selectedItems.update((items) => items.filter((_, i) => i !== index));
  }

  // ============================================================
  // STEP 4: QUANTITIES CONFIRMATION
  // ============================================================

  /**
   * Sync items to quantities FormArray
   */
  private syncItemsToQuantities(): void {
    // Clear existing quantities
    this.quantitiesArray.clear();

    // Add form group for each item
    this.selectedItems().forEach((item) => {
      const group = this.fb.group({
        productId: [item.productId],
        productName: [item.productName],
        sku: [item.sku],
        availableQuantity: [item.availableQuantity],
        quantity: [
          item.quantity || 0,
          [
            Validators.required,
            Validators.min(this.wizardConfig().allowPartialTransfer ? 0.01 : 1),
            Validators.max(item.availableQuantity),
          ],
        ],
        unit: [item.unit],
      });
      this.quantitiesArray.push(group);
    });
  }

  /**
   * Update item quantity
   */
  updateItemQuantity(index: number, quantity: number): void {
    const group = this.quantitiesArray.at(index);
    if (group) {
      group.patchValue({ quantity });

      // Update selected items signal
      this.selectedItems.update((items) => {
        const updated = [...items];
        if (updated[index]) {
          updated[index] = { ...updated[index], quantity };
        }
        return updated;
      });
    }
  }

  // ============================================================
  // STEP 5: REVIEW & SUBMIT
  // ============================================================

  /**
   * Submit transfer
   */
  async submitTransfer(): Promise<void> {
    if (!this.canSubmit()) {
      this.showValidationErrors();
      return;
    }

    this.isProcessing.set(true);

    try {
      // Build transfer request from quantities form
      const quantitiesData = this.quantitiesArray.value;
      const items: TransferItem[] = quantitiesData.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        availableQuantity: item.availableQuantity,
        unit: item.unit,
      }));

      const transfer: StockTransfer = {
        sourceLocationId: this.selectedSourceLocation()!.id,
        destinationLocationId: this.selectedDestinationLocation()!.id,
        items: items,
        notes: this.reviewForm.get('notes')?.value || undefined,
        requiresApproval: this.wizardConfig().requireApproval,
      };

      // Emit complete event
      this.complete.emit(transfer);

      // Mark as complete
      this.isComplete.set(true);

      // Clear draft
      this.clearDraft();

      // Show success message
      this.snackBar.open('Transfer submitted successfully!', 'Close', {
        duration: 3000,
      });
    } catch (error) {
      console.error('Transfer submission failed:', error);
      this.snackBar.open(
        'Transfer submission failed. Please try again.',
        'Close',
        {
          duration: 3000,
        },
      );
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Cancel wizard
   */
  cancelWizard(): void {
    if (
      confirm(
        'Are you sure you want to cancel this transfer? Unsaved changes will be lost.',
      )
    ) {
      this.cancel.emit();
      this.resetWizard();
    }
  }

  /**
   * Reset wizard to initial state
   */
  resetWizard(): void {
    this.currentStep.set(0);
    this.selectedSourceLocation.set(null);
    this.selectedDestinationLocation.set(null);
    this.selectedItems.set([]);
    this.transferForm.reset();
    this.isComplete.set(false);
    this.stepErrors.set({});
    if (this.stepper) {
      this.stepper.reset();
    }
  }

  // ============================================================
  // VALIDATION
  // ============================================================

  /**
   * Validate specific step
   */
  private validateStep(step: number): StepValidationResult {
    const errors: string[] = [];

    switch (step) {
      case 0: // Source selection
        if (!this.selectedSourceLocation()) {
          errors.push('Please select a source location');
        }
        break;

      case 1: // Destination selection
        if (!this.selectedDestinationLocation()) {
          errors.push('Please select a destination location');
        }
        if (
          this.selectedDestinationLocation()?.id ===
          this.selectedSourceLocation()?.id
        ) {
          errors.push('Destination must be different from source');
        }
        break;

      case 2: // Items selection
        if (this.selectedItems().length === 0) {
          errors.push('Please add at least one product');
        }
        break;

      case 3: {
        // Quantities
        const quantities = this.quantitiesArray.value;
        if (quantities.length === 0) {
          errors.push('No items to transfer');
        }
        quantities.forEach((item: any, index: number) => {
          if (!item.quantity || item.quantity <= 0) {
            errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
          }
          if (item.quantity > item.availableQuantity) {
            errors.push(
              `Item ${index + 1}: Quantity exceeds available stock (${item.availableQuantity})`,
            );
          }
        });
        break;
      }

      case 4: // Review
        // Final validation
        if (
          !this.selectedSourceLocation() ||
          !this.selectedDestinationLocation()
        ) {
          errors.push('Missing location information');
        }
        if (this.selectedItems().length === 0) {
          errors.push('No items to transfer');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Show validation errors for current step
   */
  private showValidationErrors(): void {
    const validation = this.validateStep(this.currentStep());
    if (!validation.valid) {
      const errorMessage = validation.errors.join('\n');
      this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
    }
  }

  // ============================================================
  // DRAFT SAVE/LOAD
  // ============================================================

  private autoSaveTimeout?: ReturnType<typeof setTimeout>;

  /**
   * Debounced auto-save draft
   */
  private debouncedAutoSaveDraft(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    this.autoSaveTimeout = setTimeout(() => {
      this.saveDraft();
    }, 2000); // 2 second debounce
  }

  /**
   * Save current state as draft
   */
  saveDraft(): void {
    if (!this.wizardConfig().enableDraftSave) return;

    const draft: TransferDraft = {
      id: 'transfer-draft-current',
      name: 'Transfer Draft',
      state: {
        currentStep: this.currentStep(),
        totalSteps: this.totalSteps(),
        sourceLocation: this.selectedSourceLocation(),
        destinationLocation: this.selectedDestinationLocation(),
        selectedItems: this.selectedItems(),
        notes: this.reviewForm.get('notes')?.value || '',
        isProcessing: false,
        isComplete: false,
        stepErrors: {},
        isDraftSaved: true,
      },
      transfer: this.transferSummary(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      localStorage.setItem('ax-transfer-wizard-draft', JSON.stringify(draft));
      this.isDraftSaved.set(true);
      this.lastSavedAt.set(new Date());
      this.draftSave.emit(draft);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }

  /**
   * Load draft from local storage
   */
  private loadDraftFromStorage(): void {
    if (!this.wizardConfig().enableDraftSave) return;

    try {
      const draftJson = localStorage.getItem('ax-transfer-wizard-draft');
      if (draftJson) {
        const draft: TransferDraft = JSON.parse(draftJson);
        this.loadDraft(draft);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }

  /**
   * Load draft data
   */
  loadDraft(draft: TransferDraft): void {
    if (draft.state.sourceLocation) {
      this.selectedSourceLocation.set(draft.state.sourceLocation);
      this.sourceForm.patchValue({
        sourceLocationId: draft.state.sourceLocation.id,
      });
    }

    if (draft.state.destinationLocation) {
      this.selectedDestinationLocation.set(draft.state.destinationLocation);
      this.destinationForm.patchValue({
        destinationLocationId: draft.state.destinationLocation.id,
      });
    }

    if (draft.state.selectedItems) {
      this.selectedItems.set(draft.state.selectedItems);
    }

    if (draft.state.notes) {
      this.reviewForm.patchValue({ notes: draft.state.notes });
    }

    if (draft.state.currentStep !== undefined) {
      this.currentStep.set(draft.state.currentStep);
    }

    this.isDraftSaved.set(true);
    this.lastSavedAt.set(draft.updatedAt);
    this.draftLoad.emit(draft);

    this.snackBar.open('Draft loaded successfully', 'Close', {
      duration: 2000,
    });
  }

  /**
   * Clear saved draft
   */
  clearDraft(): void {
    try {
      localStorage.removeItem('ax-transfer-wizard-draft');
      this.isDraftSaved.set(false);
      this.lastSavedAt.set(undefined);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Find location by ID from available locations
   */
  private findLocationById(id: string): any | undefined {
    return this.availableLocations().find((loc) => loc.id === id);
  }

  /**
   * Get step label
   */
  getStepLabel(index: number): string {
    const steps = this.wizardSteps();
    return steps[index]?.title || `Step ${index + 1}`;
  }

  /**
   * Get step description
   */
  getStepDescription(index: number): string | undefined {
    const steps = this.wizardSteps();
    return steps[index]?.description;
  }
}
