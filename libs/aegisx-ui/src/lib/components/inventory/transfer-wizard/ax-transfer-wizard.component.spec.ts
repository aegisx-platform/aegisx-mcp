import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { AxTransferWizardComponent } from './ax-transfer-wizard.component';
import {
  ProductSearchResult,
  StockTransfer,
  TransferDraft,
  TransferItem,
  TransferLocation,
} from './ax-transfer-wizard.component.types';

describe('AxTransferWizardComponent', () => {
  let component: AxTransferWizardComponent;
  let fixture: ComponentFixture<AxTransferWizardComponent>;

  // Mock data
  const mockLocations = [
    {
      id: 'loc-1',
      name: 'Warehouse A',
      type: 'warehouse',
      pathString: 'Warehouse A',
    },
    {
      id: 'loc-2',
      name: 'Warehouse B',
      type: 'warehouse',
      pathString: 'Warehouse B',
    },
  ];

  const mockProduct: ProductSearchResult = {
    id: 'prod-1',
    name: 'Product A',
    sku: 'SKU-001',
    availableQuantity: 100,
    unit: 'pieces',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AxTransferWizardComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatStepperModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AxTransferWizardComponent);
    component = fixture.componentInstance;

    // Set up default inputs
    fixture.componentRef.setInput('availableLocations', mockLocations);

    fixture.detectChanges();
  });

  // ============================================================
  // BASIC TESTS
  // ============================================================

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default state', () => {
      expect(component.currentStep()).toBe(0);
      expect(component.isProcessing()).toBe(false);
      expect(component.isComplete()).toBe(false);
      expect(component.selectedItems()).toEqual([]);
    });

    it('should initialize forms correctly', () => {
      expect(component.sourceForm).toBeDefined();
      expect(component.destinationForm).toBeDefined();
      expect(component.itemsForm).toBeDefined();
      expect(component.quantitiesForm).toBeDefined();
      expect(component.reviewForm).toBeDefined();
    });

    it('should calculate total steps from wizard steps', () => {
      expect(component.totalSteps()).toBe(5);
    });

    it('should calculate progress percentage correctly', () => {
      component.currentStep.set(0);
      expect(component.progressPercentage()).toBe(20); // Step 1 of 5

      component.currentStep.set(2);
      expect(component.progressPercentage()).toBe(60); // Step 3 of 5

      component.currentStep.set(4);
      expect(component.progressPercentage()).toBe(100); // Step 5 of 5
    });
  });

  // ============================================================
  // NAVIGATION TESTS
  // ============================================================

  describe('Step Navigation', () => {
    it('should advance to next step', () => {
      // Set source location to make step 1 valid
      const location: TransferLocation = {
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      };
      component.selectedSourceLocation.set(location);

      component.nextStep();
      expect(component.currentStep()).toBe(1);
    });

    it('should go back to previous step', () => {
      component.currentStep.set(2);
      component.previousStep();
      expect(component.currentStep()).toBe(1);
    });

    it('should not go below step 0', () => {
      component.currentStep.set(0);
      component.previousStep();
      expect(component.currentStep()).toBe(0);
    });

    it('should identify first step correctly', () => {
      component.currentStep.set(0);
      expect(component.isFirstStep()).toBe(true);

      component.currentStep.set(1);
      expect(component.isFirstStep()).toBe(false);
    });

    it('should identify last step correctly', () => {
      component.currentStep.set(4);
      expect(component.isLastStep()).toBe(true);

      component.currentStep.set(3);
      expect(component.isLastStep()).toBe(false);
    });

    it('should jump to specific step', () => {
      component.goToStep(3);
      expect(component.currentStep()).toBe(3);
    });

    it('should not jump to invalid step index', () => {
      component.goToStep(10);
      expect(component.currentStep()).not.toBe(10);

      component.goToStep(-1);
      expect(component.currentStep()).not.toBe(-1);
    });

    it('should emit step change event on navigation', () => {
      const spy = jest.spyOn(component.onStepChange, 'emit');

      component.selectedSourceLocation.set({
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      });

      component.nextStep();

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          step: 1,
          data: expect.any(Object),
        }),
      );
    });
  });

  // ============================================================
  // LOCATION SELECTION TESTS
  // ============================================================

  describe('Source Location Selection', () => {
    it('should select source location', () => {
      const location = {
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
        pathString: 'Warehouse A',
      };

      component.onSourceLocationSelect(location);

      expect(component.selectedSourceLocation()?.id).toBe('loc-1');
      expect(component.sourceForm.get('sourceLocationId')?.value).toBe('loc-1');
    });

    it('should pre-fill source location if provided', () => {
      const newComponent = TestBed.createComponent(
        AxTransferWizardComponent,
      ).componentInstance;
      newComponent.availableLocations = jest
        .fn()
        .mockReturnValue(mockLocations);

      // Use setInput to set the input property
      TestBed.createComponent(AxTransferWizardComponent).componentRef.setInput(
        'sourceLocation',
        'loc-1',
      );
      TestBed.createComponent(AxTransferWizardComponent).componentRef.setInput(
        'availableLocations',
        mockLocations,
      );

      const comp = TestBed.createComponent(
        AxTransferWizardComponent,
      ).componentInstance;
      fixture.componentRef.setInput('sourceLocation', 'loc-1');
      fixture.componentRef.setInput('availableLocations', mockLocations);

      comp.ngOnInit();

      // Source location should be pre-filled
      expect(comp.sourceForm.get('sourceLocationId')?.value).toBe('loc-1');
    });
  });

  describe('Destination Location Selection', () => {
    beforeEach(() => {
      // Set source location first
      component.selectedSourceLocation.set({
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      });
    });

    it('should select destination location', () => {
      const location = {
        id: 'loc-2',
        name: 'Warehouse B',
        type: 'warehouse',
        pathString: 'Warehouse B',
      };

      component.onDestinationLocationSelect(location);

      expect(component.selectedDestinationLocation()?.id).toBe('loc-2');
      expect(
        component.destinationForm.get('destinationLocationId')?.value,
      ).toBe('loc-2');
    });

    it('should prevent selecting same location as source', () => {
      const sameLocation = {
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      };

      component.onDestinationLocationSelect(sameLocation);

      // Should not be selected
      expect(component.selectedDestinationLocation()).toBeNull();
    });
  });

  // ============================================================
  // PRODUCT SELECTION TESTS
  // ============================================================

  describe('Product Selection', () => {
    it('should add product to transfer', () => {
      component.addProduct(mockProduct);

      const items = component.selectedItems();
      expect(items.length).toBe(1);
      expect(items[0].productId).toBe('prod-1');
      expect(items[0].productName).toBe('Product A');
      expect(items[0].availableQuantity).toBe(100);
    });

    it('should prevent adding duplicate product', () => {
      component.addProduct(mockProduct);
      component.addProduct(mockProduct); // Try to add again

      expect(component.selectedItems().length).toBe(1);
    });

    it('should prevent adding multiple products when not allowed', () => {
      fixture.componentRef.setInput('allowMultipleProducts', false);
      fixture.detectChanges();

      const product2: ProductSearchResult = {
        ...mockProduct,
        id: 'prod-2',
        name: 'Product B',
      };

      component.addProduct(mockProduct);
      component.addProduct(product2);

      expect(component.selectedItems().length).toBe(1);
    });

    it('should remove product from transfer', () => {
      component.addProduct(mockProduct);
      expect(component.selectedItems().length).toBe(1);

      component.removeProduct(0);
      expect(component.selectedItems().length).toBe(0);
    });

    it('should handle product search', async () => {
      const mockSearchFn = jest.fn().mockResolvedValue([mockProduct]);
      fixture.componentRef.setInput('productSearchFn', mockSearchFn);

      await component.onProductSearch('Product');

      expect(mockSearchFn).toHaveBeenCalledWith('Product');
      expect(component.productSearchResults().length).toBe(1);
    });

    it('should not search with less than 2 characters', async () => {
      const mockSearchFn = jest.fn();
      fixture.componentRef.setInput('productSearchFn', mockSearchFn);

      await component.onProductSearch('A');

      expect(mockSearchFn).not.toHaveBeenCalled();
      expect(component.productSearchResults().length).toBe(0);
    });
  });

  // ============================================================
  // QUANTITY INPUT TESTS
  // ============================================================

  describe('Quantity Management', () => {
    beforeEach(() => {
      component.addProduct(mockProduct);
      component.currentStep.set(2); // Items selection step
      component.nextStep(); // Move to quantities step - this syncs items
    });

    it('should sync items to quantities form', () => {
      expect(component.quantitiesArray.length).toBe(1);
      expect(component.quantitiesArray.at(0).get('productId')?.value).toBe(
        'prod-1',
      );
    });

    it('should update item quantity', () => {
      component.updateItemQuantity(0, 50);

      expect(component.quantitiesArray.at(0).get('quantity')?.value).toBe(50);
      expect(component.selectedItems()[0].quantity).toBe(50);
    });

    it('should validate quantity does not exceed available stock', () => {
      component.updateItemQuantity(0, 150); // Exceeds 100 available

      const control = component.quantitiesArray.at(0).get('quantity');
      expect(control?.errors?.['max']).toBeTruthy();
    });

    it('should validate quantity is greater than 0', () => {
      component.updateItemQuantity(0, -5);

      const control = component.quantitiesArray.at(0).get('quantity');
      expect(control?.errors?.['min']).toBeTruthy();
    });
  });

  // ============================================================
  // VALIDATION TESTS
  // ============================================================

  describe('Step Validation', () => {
    it('should validate step 0 requires source location', () => {
      component.currentStep.set(0);
      expect(component.isCurrentStepValid()).toBe(false);

      component.selectedSourceLocation.set({
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      });
      expect(component.isCurrentStepValid()).toBe(true);
    });

    it('should validate step 1 requires destination location', () => {
      component.selectedSourceLocation.set({
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      });

      component.currentStep.set(1);
      expect(component.isCurrentStepValid()).toBe(false);

      component.selectedDestinationLocation.set({
        id: 'loc-2',
        name: 'Warehouse B',
        type: 'warehouse',
      });
      expect(component.isCurrentStepValid()).toBe(true);
    });

    it('should validate step 2 requires at least one product', () => {
      component.currentStep.set(2);
      expect(component.isCurrentStepValid()).toBe(false);

      component.addProduct(mockProduct);
      expect(component.isCurrentStepValid()).toBe(true);
    });

    it('should validate destination is different from source', () => {
      component.selectedSourceLocation.set({
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      });
      component.selectedDestinationLocation.set({
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      });

      component.currentStep.set(1);
      expect(component.isCurrentStepValid()).toBe(false);
    });
  });

  // ============================================================
  // SUBMISSION TESTS
  // ============================================================

  describe('Transfer Submission', () => {
    beforeEach(() => {
      // Set up complete transfer
      component.selectedSourceLocation.set({
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      });
      component.selectedDestinationLocation.set({
        id: 'loc-2',
        name: 'Warehouse B',
        type: 'warehouse',
      });
      component.addProduct(mockProduct);
      component.currentStep.set(3);
      component.updateItemQuantity(0, 50);
      component.currentStep.set(4); // Review step
    });

    it('should submit transfer with correct data', async () => {
      const spy = jest.spyOn(component.onComplete, 'emit');

      await component.submitTransfer();

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceLocationId: 'loc-1',
          destinationLocationId: 'loc-2',
          items: expect.arrayContaining([
            expect.objectContaining({
              productId: 'prod-1',
              quantity: 50,
            }),
          ]),
        }),
      );
    });

    it('should mark wizard as complete after successful submission', async () => {
      await component.submitTransfer();
      expect(component.isComplete()).toBe(true);
    });

    it('should clear draft after successful submission', async () => {
      component.isDraftSaved.set(true);
      await component.submitTransfer();
      expect(component.isDraftSaved()).toBe(false);
    });

    it('should not submit if validation fails', async () => {
      component.selectedItems.set([]); // Make invalid

      const spy = jest.spyOn(component.onComplete, 'emit');
      await component.submitTransfer();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // DRAFT SAVE/LOAD TESTS
  // ============================================================

  describe('Draft Functionality', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should save draft to localStorage', () => {
      component.selectedSourceLocation.set({
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      });

      component.saveDraft();

      const saved = localStorage.getItem('ax-transfer-wizard-draft');
      expect(saved).toBeTruthy();

      const draft = JSON.parse(saved!);
      expect(draft.state.sourceLocation.id).toBe('loc-1');
    });

    it('should load draft from localStorage', () => {
      const draft: TransferDraft = {
        id: 'test-draft',
        name: 'Test Draft',
        state: {
          currentStep: 2,
          totalSteps: 5,
          sourceLocation: {
            id: 'loc-1',
            name: 'Warehouse A',
            type: 'warehouse',
          },
          destinationLocation: {
            id: 'loc-2',
            name: 'Warehouse B',
            type: 'warehouse',
          },
          selectedItems: [
            {
              productId: 'prod-1',
              productName: 'Product A',
              quantity: 50,
              availableQuantity: 100,
              unit: 'pieces',
            },
          ],
          notes: 'Test notes',
          isProcessing: false,
          isComplete: false,
          stepErrors: {},
          isDraftSaved: true,
        },
        transfer: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      component.loadDraft(draft);

      expect(component.selectedSourceLocation()?.id).toBe('loc-1');
      expect(component.selectedDestinationLocation()?.id).toBe('loc-2');
      expect(component.selectedItems().length).toBe(1);
      expect(component.currentStep()).toBe(2);
    });

    it('should clear draft from localStorage', () => {
      component.saveDraft();
      expect(localStorage.getItem('ax-transfer-wizard-draft')).toBeTruthy();

      component.clearDraft();
      expect(localStorage.getItem('ax-transfer-wizard-draft')).toBeNull();
      expect(component.isDraftSaved()).toBe(false);
    });
  });

  // ============================================================
  // UTILITY METHOD TESTS
  // ============================================================

  describe('Utility Methods', () => {
    it('should get step label', () => {
      expect(component.getStepLabel(0)).toBe('Select Source');
      expect(component.getStepLabel(1)).toBe('Select Destination');
      expect(component.getStepLabel(4)).toBe('Review & Submit');
    });

    it('should get step description', () => {
      expect(component.getStepDescription(0)).toBe(
        'Choose the source location for the transfer',
      );
    });

    it('should reset wizard to initial state', () => {
      component.selectedSourceLocation.set({
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      });
      component.currentStep.set(3);

      component.resetWizard();

      expect(component.currentStep()).toBe(0);
      expect(component.selectedSourceLocation()).toBeNull();
      expect(component.selectedDestinationLocation()).toBeNull();
      expect(component.selectedItems()).toEqual([]);
      expect(component.isComplete()).toBe(false);
    });
  });

  // ============================================================
  // CONFIGURATION TESTS
  // ============================================================

  describe('Configuration Options', () => {
    it('should respect allowPartialTransfer setting', () => {
      fixture.componentRef.setInput('allowPartialTransfer', false);
      fixture.detectChanges();

      expect(component.wizardConfig().allowPartialTransfer).toBe(false);
    });

    it('should respect requireApproval setting', () => {
      fixture.componentRef.setInput('requireApproval', true);
      fixture.detectChanges();

      expect(component.wizardConfig().requireApproval).toBe(true);
    });

    it('should include requiresApproval in transfer when enabled', async () => {
      fixture.componentRef.setInput('requireApproval', true);

      // Setup complete transfer
      component.selectedSourceLocation.set({
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      });
      component.selectedDestinationLocation.set({
        id: 'loc-2',
        name: 'Warehouse B',
        type: 'warehouse',
      });
      component.addProduct(mockProduct);
      component.currentStep.set(3);
      component.updateItemQuantity(0, 50);
      component.currentStep.set(4);

      const spy = jest.spyOn(component.onComplete, 'emit');
      await component.submitTransfer();

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          requiresApproval: true,
        }),
      );
    });
  });

  // ============================================================
  // COMPUTED SIGNALS TESTS
  // ============================================================

  describe('Computed Signals', () => {
    it('should compute canProceed correctly', () => {
      // Invalid step
      component.currentStep.set(0);
      expect(component.canProceed()).toBe(false);

      // Valid step
      component.selectedSourceLocation.set({
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      });
      expect(component.canProceed()).toBe(true);

      // Processing
      component.isProcessing.set(true);
      expect(component.canProceed()).toBe(false);
    });

    it('should compute canSubmit correctly', () => {
      // Not on last step
      component.currentStep.set(3);
      expect(component.canSubmit()).toBe(false);

      // On last step but invalid
      component.currentStep.set(4);
      expect(component.canSubmit()).toBe(false);

      // Valid last step
      component.selectedSourceLocation.set({
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      });
      component.selectedDestinationLocation.set({
        id: 'loc-2',
        name: 'Warehouse B',
        type: 'warehouse',
      });
      component.addProduct(mockProduct);
      expect(component.canSubmit()).toBe(true);
    });

    it('should compute transfer summary', () => {
      component.selectedSourceLocation.set({
        id: 'loc-1',
        name: 'Warehouse A',
        type: 'warehouse',
      });
      component.selectedDestinationLocation.set({
        id: 'loc-2',
        name: 'Warehouse B',
        type: 'warehouse',
      });
      component.addProduct(mockProduct);
      component.reviewForm.patchValue({ notes: 'Test notes' });

      const summary = component.transferSummary();

      expect(summary.sourceLocationId).toBe('loc-1');
      expect(summary.destinationLocationId).toBe('loc-2');
      expect(summary.items?.length).toBe(1);
      expect(summary.notes).toBe('Test notes');
    });
  });
});
