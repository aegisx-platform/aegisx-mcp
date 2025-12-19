import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AxQuantityInputComponent } from './ax-quantity-input.component';
import { QuantityUnitConfig } from './ax-quantity-input.component.types';

describe('AxQuantityInputComponent', () => {
  let component: AxQuantityInputComponent;
  let fixture: ComponentFixture<AxQuantityInputComponent>;

  const mockUnits: QuantityUnitConfig[] = [
    { code: 'pieces', label: 'Pieces', conversionRate: 1, decimalPlaces: 0 },
    { code: 'box', label: 'Box', conversionRate: 12, decimalPlaces: 0 },
    { code: 'carton', label: 'Carton', conversionRate: 144, decimalPlaces: 0 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AxQuantityInputComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AxQuantityInputComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('baseUnit', 'pieces');
    fixture.componentRef.setInput('availableUnits', mockUnits);

    fixture.detectChanges();
  });

  // =============================================================================
  // COMPONENT CREATION
  // =============================================================================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // =============================================================================
  // UNIT CONVERSION TESTS
  // =============================================================================

  describe('Unit Conversion', () => {
    it('should convert between units correctly', () => {
      component.value.set(144); // 144 pieces
      component['selectedUnit'].set('box');
      fixture.detectChanges();

      // 144 pieces = 12 boxes
      expect(component.displayValue()).toBe(12);
    });

    it('should convert from pieces to cartons', () => {
      component.value.set(288); // 288 pieces
      component['selectedUnit'].set('carton');
      fixture.detectChanges();

      // 288 pieces = 2 cartons
      expect(component.displayValue()).toBe(2);
    });

    it('should maintain base value when changing units', () => {
      component.value.set(144);
      component['selectedUnit'].set('pieces');
      fixture.detectChanges();

      const valueBefore = component.value();

      component.onUnitChange('box');
      fixture.detectChanges();

      // Base value should remain the same
      expect(component.value()).toBe(valueBefore);
    });

    it('should show conversion hint when unit differs from base', () => {
      component.value.set(144);
      component['selectedUnit'].set('box');
      fixture.detectChanges();

      const hint = component.conversionHint();
      expect(hint).toContain('144');
      expect(hint).toContain('pieces');
      expect(hint).toContain('12');
    });

    it('should not show conversion hint when using base unit', () => {
      component.value.set(100);
      component['selectedUnit'].set('pieces');
      fixture.detectChanges();

      expect(component.conversionHint()).toBe('');
    });
  });

  // =============================================================================
  // INCREMENT/DECREMENT TESTS
  // =============================================================================

  describe('Increment/Decrement', () => {
    it('should increment value by step', () => {
      component.value.set(10);
      fixture.componentRef.setInput('step', 1);
      fixture.detectChanges();

      component.increment();

      expect(component.value()).toBe(11);
    });

    it('should decrement value by step', () => {
      component.value.set(10);
      fixture.componentRef.setInput('step', 1);
      fixture.detectChanges();

      component.decrement();

      expect(component.value()).toBe(9);
    });

    it('should not go below minimum', () => {
      component.value.set(5);
      fixture.componentRef.setInput('min', 0);
      fixture.componentRef.setInput('step', 10);
      fixture.detectChanges();

      component.decrement();

      expect(component.value()).toBe(0);
    });

    it('should not exceed maximum', () => {
      component.value.set(95);
      fixture.componentRef.setInput('max', 100);
      fixture.componentRef.setInput('step', 10);
      fixture.detectChanges();

      component.increment();

      expect(component.value()).toBe(100);
    });

    it('should work with unit conversion on increment', () => {
      component.value.set(12); // 1 box (12 pieces)
      component['selectedUnit'].set('box');
      fixture.componentRef.setInput('step', 1);
      fixture.detectChanges();

      component.increment();

      // Should now be 2 boxes (24 pieces)
      expect(component.value()).toBe(24);
      expect(component.displayValue()).toBe(2);
    });

    it('should disable increment when at max', () => {
      component.value.set(100);
      fixture.componentRef.setInput('max', 100);
      fixture.detectChanges();

      expect(component.canIncrement()).toBe(false);
    });

    it('should disable decrement when at min', () => {
      component.value.set(0);
      fixture.componentRef.setInput('min', 0);
      fixture.detectChanges();

      expect(component.canDecrement()).toBe(false);
    });
  });

  // =============================================================================
  // VALIDATION TESTS
  // =============================================================================

  describe('Validation', () => {
    it('should validate min value', () => {
      fixture.componentRef.setInput('min', 10);
      component.value.set(5);
      fixture.detectChanges();

      expect(component.isValid()).toBe(false);
      expect(component.validationErrors().some((e) => e.type === 'min')).toBe(
        true,
      );
    });

    it('should validate max value', () => {
      fixture.componentRef.setInput('max', 100);
      component.value.set(150);
      fixture.detectChanges();

      expect(component.isValid()).toBe(false);
      expect(component.validationErrors().some((e) => e.type === 'max')).toBe(
        true,
      );
    });

    it('should validate decimal places', () => {
      fixture.componentRef.setInput('decimalPlaces', 2);
      component.value.set(10.12345);
      fixture.detectChanges();

      expect(
        component.validationErrors().some((e) => e.type === 'decimal'),
      ).toBe(true);
    });

    it('should validate integer for whole-number units', () => {
      // Pieces must be whole numbers
      component.value.set(10.5);
      fixture.detectChanges();

      expect(
        component.validationErrors().some((e) => e.type === 'integer'),
      ).toBe(true);
    });

    it('should pass validation for valid value', () => {
      fixture.componentRef.setInput('min', 0);
      fixture.componentRef.setInput('max', 100);
      fixture.componentRef.setInput('decimalPlaces', 0);
      component.value.set(50);
      fixture.detectChanges();

      expect(component.isValid()).toBe(true);
      expect(component.validationErrors().length).toBe(0);
    });
  });

  // =============================================================================
  // PRESET MULTIPLIER TESTS
  // =============================================================================

  describe('Preset Multipliers', () => {
    it('should multiply value by 10', () => {
      component.value.set(10);
      fixture.detectChanges();

      component.multiplyValue(10);

      expect(component.value()).toBe(100);
    });

    it('should multiply value by 100', () => {
      component.value.set(5);
      fixture.detectChanges();

      component.multiplyValue(100);

      expect(component.value()).toBe(500);
    });

    it('should clamp multiplied value to max', () => {
      component.value.set(50);
      fixture.componentRef.setInput('max', 200);
      fixture.detectChanges();

      component.multiplyValue(10);

      expect(component.value()).toBe(200);
    });

    it('should not multiply when disabled', () => {
      component.value.set(10);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      component.multiplyValue(10);

      expect(component.value()).toBe(10);
    });
  });

  // =============================================================================
  // FORMS INTEGRATION TESTS
  // =============================================================================

  describe('ControlValueAccessor', () => {
    it('should work with FormControl', () => {
      const control = new FormControl(10);

      component.writeValue(10);
      expect(component.value()).toBe(10);
    });

    it('should notify form of value changes', () => {
      let formValue: number | null = null;
      component.registerOnChange((val) => {
        formValue = val;
      });

      component.value.set(25);
      component.increment();

      expect(formValue).toBe(26);
    });

    it('should notify form when touched', () => {
      let touched = false;
      component.registerOnTouched(() => {
        touched = true;
      });

      component.onBlur();

      expect(touched).toBe(true);
    });

    it('should handle writeValue with null', () => {
      component.value.set(100);
      component.writeValue(null as any);

      // Should not crash and maintain previous value or reset to 0
      expect(component.value()).toBeDefined();
    });
  });

  // =============================================================================
  // INPUT CHANGE TESTS
  // =============================================================================

  describe('Manual Input', () => {
    it('should handle manual input change', () => {
      const event = {
        target: { value: '25' },
      } as any;

      component.onInputChange(event);

      expect(component.value()).toBe(25);
    });

    it('should convert manual input based on selected unit', () => {
      component['selectedUnit'].set('box');
      fixture.detectChanges();

      const event = {
        target: { value: '2' }, // 2 boxes
      } as any;

      component.onInputChange(event);

      // 2 boxes = 24 pieces
      expect(component.value()).toBe(24);
    });

    it('should handle invalid input gracefully', () => {
      const event = {
        target: { value: 'invalid' },
      } as any;

      component.onInputChange(event);

      expect(component.value()).toBe(0);
    });
  });

  // =============================================================================
  // DISABLED STATE TESTS
  // =============================================================================

  describe('Disabled State', () => {
    it('should disable increment when component is disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(component.canIncrement()).toBe(false);
    });

    it('should disable decrement when component is disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(component.canDecrement()).toBe(false);
    });
  });

  // =============================================================================
  // EDGE CASES
  // =============================================================================

  describe('Edge Cases', () => {
    it('should handle zero conversion rate gracefully', () => {
      const invalidUnits: QuantityUnitConfig[] = [
        {
          code: 'invalid',
          label: 'Invalid',
          conversionRate: 0,
          decimalPlaces: 0,
        },
      ];
      fixture.componentRef.setInput('availableUnits', invalidUnits);
      component.value.set(100);
      fixture.detectChanges();

      // Should return base value when conversion rate is 0
      expect(component.displayValue()).toBe(100);
    });

    it('should handle empty units array', () => {
      fixture.componentRef.setInput('availableUnits', []);
      fixture.detectChanges();

      expect(component.selectedUnitConfig()).toBeNull();
    });

    it('should round to correct decimal places', () => {
      fixture.componentRef.setInput('decimalPlaces', 2);
      fixture.detectChanges();

      // Use updateValue which applies rounding
      component['updateValue'](10.123456);

      const rounded = component.value();
      expect(rounded).toBe(10.12);
    });

    it('should handle large numbers', () => {
      component.value.set(999999);
      fixture.detectChanges();

      expect(component.value()).toBe(999999);
    });
  });

  // =============================================================================
  // COMPUTED SIGNALS TESTS
  // =============================================================================

  describe('Computed Signals', () => {
    it('should compute selected unit config', () => {
      component['selectedUnit'].set('box');
      fixture.detectChanges();

      const config = component.selectedUnitConfig();
      expect(config?.code).toBe('box');
      expect(config?.conversionRate).toBe(12);
    });

    it('should default to first unit if selected not found', () => {
      component['selectedUnit'].set('nonexistent');
      fixture.detectChanges();

      const config = component.selectedUnitConfig();
      expect(config?.code).toBe('pieces');
    });
  });
});
