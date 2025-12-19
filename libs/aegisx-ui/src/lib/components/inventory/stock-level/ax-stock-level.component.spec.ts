import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AxStockLevelComponent } from './ax-stock-level.component';

describe('AxStockLevelComponent', () => {
  let component: AxStockLevelComponent;
  let fixture: ComponentFixture<AxStockLevelComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AxStockLevelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AxStockLevelComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('current', 100);
    fixture.componentRef.setInput('minimum', 50);
    fixture.componentRef.setInput('maximum', 500);
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have all required inputs set', () => {
      expect(component.current()).toBe(100);
      expect(component.minimum()).toBe(50);
      expect(component.maximum()).toBe(500);
    });
  });

  describe('Percentage Calculation', () => {
    it('should calculate percentage correctly', () => {
      fixture.componentRef.setInput('current', 250);
      fixture.componentRef.setInput('maximum', 500);
      fixture.detectChanges();
      expect(component.percentage()).toBe(50);
    });

    it('should handle edge case: 0% stock', () => {
      fixture.componentRef.setInput('current', 0);
      expect(component.percentage()).toBe(0);
    });

    it('should handle edge case: 100% stock', () => {
      fixture.componentRef.setInput('current', 500);
      fixture.componentRef.setInput('maximum', 500);
      expect(component.percentage()).toBe(100);
    });

    it('should handle division by zero gracefully', () => {
      fixture.componentRef.setInput('maximum', 0);
      expect(component.percentage()).toBe(0);
      expect(isNaN(component.percentage())).toBe(false);
    });

    it('should round percentage to nearest integer', () => {
      fixture.componentRef.setInput('current', 167);
      fixture.componentRef.setInput('maximum', 500);
      fixture.detectChanges();
      expect(component.percentage()).toBe(33); // 33.4% rounded
    });
  });

  describe('Color Scheme - Traffic Light', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('colorScheme', 'traffic-light');
    });

    it('should display green (success) when stock > 75%', () => {
      fixture.componentRef.setInput('current', 400);
      fixture.componentRef.setInput('minimum', 50);
      fixture.componentRef.setInput('maximum', 500);
      fixture.detectChanges();
      expect(component.colorClass()).toBe('bg-success-500');
    });

    it('should display yellow (warning) when stock 25-75%', () => {
      fixture.componentRef.setInput('current', 250);
      fixture.componentRef.setInput('minimum', 50);
      fixture.componentRef.setInput('maximum', 500);
      fixture.detectChanges();
      expect(component.colorClass()).toBe('bg-warning-500');
    });

    it('should display red (error) when stock < 25%', () => {
      fixture.componentRef.setInput('current', 100);
      fixture.componentRef.setInput('minimum', 50);
      fixture.componentRef.setInput('maximum', 500);
      fixture.detectChanges();
      expect(component.colorClass()).toContain('error');
    });

    it('should display warning at exactly 25% boundary', () => {
      fixture.componentRef.setInput('current', 125);
      fixture.componentRef.setInput('maximum', 500);
      fixture.detectChanges();
      expect(component.colorClass()).toBe('bg-warning-500');
    });

    it('should display success at exactly 75% boundary', () => {
      fixture.componentRef.setInput('current', 375);
      fixture.componentRef.setInput('maximum', 500);
      fixture.detectChanges();
      expect(component.colorClass()).toBe('bg-success-500');
    });
  });

  describe('Color Scheme - Gradient', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('colorScheme', 'gradient');
    });

    it('should display gradient scheme', () => {
      fixture.detectChanges();
      expect(component.colorClass()).toContain('gradient');
    });

    it('should maintain gradient across all percentages', () => {
      fixture.componentRef.setInput('current', 250);
      fixture.detectChanges();
      expect(component.colorClass()).toContain('gradient');

      fixture.componentRef.setInput('current', 50);
      fixture.detectChanges();
      expect(component.colorClass()).toContain('gradient');
    });
  });

  describe('Warning State', () => {
    it('should show warning when current equals minimum', () => {
      fixture.componentRef.setInput('current', 50);
      fixture.componentRef.setInput('minimum', 50);
      expect(component.isWarning()).toBe(true);
    });

    it('should show warning when current is below minimum', () => {
      fixture.componentRef.setInput('current', 30);
      fixture.componentRef.setInput('minimum', 50);
      expect(component.isWarning()).toBe(true);
    });

    it('should not show warning when current is above minimum', () => {
      fixture.componentRef.setInput('current', 100);
      fixture.componentRef.setInput('minimum', 50);
      expect(component.isWarning()).toBe(false);
    });

    it('should emit warning click event with correct data', () => {
      let emittedValue: any = null;
      component.onWarningClick.subscribe((value) => {
        emittedValue = value;
      });

      fixture.componentRef.setInput('current', 30);
      fixture.componentRef.setInput('minimum', 50);
      fixture.detectChanges();

      component.handleWarningClick();

      expect(emittedValue).toEqual({
        level: 'low',
        current: 30,
        minimum: 50,
      });
    });
  });

  describe('Tooltip Text', () => {
    it('should generate correct tooltip text', () => {
      fixture.componentRef.setInput('current', 150);
      fixture.componentRef.setInput('minimum', 50);
      fixture.componentRef.setInput('maximum', 500);
      fixture.componentRef.setInput('unit', 'pieces');
      fixture.detectChanges();

      const tooltip = component.tooltipText();
      expect(tooltip).toContain('Current: 150 pieces');
      expect(tooltip).toContain('Minimum: 50 pieces');
      expect(tooltip).toContain('Maximum: 500 pieces');
    });

    it('should handle custom units in tooltip', () => {
      fixture.componentRef.setInput('current', 10);
      fixture.componentRef.setInput('minimum', 5);
      fixture.componentRef.setInput('maximum', 20);
      fixture.componentRef.setInput('unit', 'boxes');
      fixture.detectChanges();

      const tooltip = component.tooltipText();
      expect(tooltip).toContain('boxes');
    });
  });

  describe('Template Rendering', () => {
    it('should render label when showLabel is true', () => {
      fixture.componentRef.setInput('showLabel', true);
      fixture.detectChanges();

      const label = debugElement.query(By.css('.ax-stock-level__label'));
      expect(label).toBeTruthy();
    });

    it('should hide label when showLabel is false', () => {
      fixture.componentRef.setInput('showLabel', false);
      fixture.detectChanges();

      const label = debugElement.query(By.css('.ax-stock-level__label'));
      expect(label).toBeFalsy();
    });

    it('should render percentage when showPercentage is true', () => {
      fixture.componentRef.setInput('showLabel', true);
      fixture.componentRef.setInput('showPercentage', true);
      fixture.detectChanges();

      const percentage = debugElement.query(
        By.css('.ax-stock-level__percentage'),
      );
      expect(percentage).toBeTruthy();
      expect(percentage.nativeElement.textContent).toContain('%');
    });

    it('should hide percentage when showPercentage is false', () => {
      fixture.componentRef.setInput('showLabel', true);
      fixture.componentRef.setInput('showPercentage', false);
      fixture.detectChanges();

      const percentage = debugElement.query(
        By.css('.ax-stock-level__percentage'),
      );
      expect(percentage).toBeFalsy();
    });

    it('should apply size class correctly', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();

      const container = debugElement.query(By.css('.ax-stock-level'));
      expect(
        container.nativeElement.classList.contains('ax-stock-level--sm'),
      ).toBe(true);
    });

    it('should render progress bar with ARIA attributes', () => {
      fixture.componentRef.setInput('current', 200);
      fixture.detectChanges();

      const progress = debugElement.query(By.css('.ax-stock-level__progress'));
      expect(progress.nativeElement.getAttribute('role')).toBe('progressbar');
      expect(progress.nativeElement.getAttribute('aria-valuenow')).toBe('200');
      expect(progress.nativeElement.getAttribute('aria-valuemin')).toBe('0');
      expect(progress.nativeElement.getAttribute('aria-valuemax')).toBe('500');
    });

    it('should render warning badge when isWarning is true', () => {
      fixture.componentRef.setInput('current', 30);
      fixture.componentRef.setInput('minimum', 50);
      fixture.detectChanges();

      const badge = debugElement.query(By.css('ax-badge'));
      expect(badge).toBeTruthy();
    });

    it('should not render warning badge when isWarning is false', () => {
      fixture.componentRef.setInput('current', 200);
      fixture.componentRef.setInput('minimum', 50);
      fixture.detectChanges();

      const badge = debugElement.query(By.css('ax-badge'));
      expect(badge).toBeFalsy();
    });
  });

  describe('Progress Bar Width', () => {
    it('should set progress bar fill width to percentage', () => {
      fixture.componentRef.setInput('current', 150);
      fixture.componentRef.setInput('maximum', 500);
      fixture.detectChanges();

      const fill = debugElement.query(By.css('.ax-stock-level__progress-fill'));
      expect(fill.nativeElement.style.width).toBe('30%');
    });

    it('should update fill width when current changes', () => {
      fixture.componentRef.setInput('current', 100);
      fixture.detectChanges();
      let fill = debugElement.query(By.css('.ax-stock-level__progress-fill'));
      expect(fill.nativeElement.style.width).toBe('20%');

      fixture.componentRef.setInput('current', 250);
      fixture.detectChanges();
      fill = debugElement.query(By.css('.ax-stock-level__progress-fill'));
      expect(fill.nativeElement.style.width).toBe('50%');
    });
  });

  describe('Threshold Marker', () => {
    it('should position threshold marker at minimum percentage', () => {
      fixture.componentRef.setInput('minimum', 100);
      fixture.componentRef.setInput('maximum', 500);
      fixture.detectChanges();

      const threshold = debugElement.query(
        By.css('.ax-stock-level__threshold'),
      );
      expect(threshold.nativeElement.style.left).toBe('20%');
    });

    it('should update threshold position when minimum changes', () => {
      fixture.componentRef.setInput('minimum', 50);
      fixture.componentRef.setInput('maximum', 500);
      fixture.detectChanges();

      let threshold = debugElement.query(By.css('.ax-stock-level__threshold'));
      expect(threshold.nativeElement.style.left).toBe('10%');

      fixture.componentRef.setInput('minimum', 250);
      fixture.detectChanges();
      threshold = debugElement.query(By.css('.ax-stock-level__threshold'));
      expect(threshold.nativeElement.style.left).toBe('50%');
    });
  });

  describe('Size Variants', () => {
    ['sm', 'md', 'lg'].forEach((size) => {
      it(`should render with size variant "${size}"`, () => {
        fixture.componentRef.setInput('size', size as any);
        fixture.detectChanges();

        const container = debugElement.query(By.css('.ax-stock-level'));
        expect(
          container.nativeElement.classList.contains(`ax-stock-level--${size}`),
        ).toBe(true);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label on progress bar', () => {
      fixture.componentRef.setInput('current', 250);
      fixture.componentRef.setInput('maximum', 500);
      fixture.detectChanges();

      const progress = debugElement.query(By.css('.ax-stock-level__progress'));
      const ariaLabel = progress.nativeElement.getAttribute('aria-label');
      expect(ariaLabel).toContain('50%');
    });

    it('should have proper ARIA attributes for screen readers', () => {
      fixture.componentRef.setInput('current', 100);
      fixture.detectChanges();

      const progress = debugElement.query(By.css('.ax-stock-level__progress'));
      expect(progress.nativeElement.getAttribute('role')).toBe('progressbar');
      expect(progress.nativeElement.getAttribute('aria-valuenow')).toBe('100');
      expect(progress.nativeElement.getAttribute('aria-valuemin')).toBe('0');
    });

    it('should have tooltip text for hover info', () => {
      fixture.componentRef.setInput('current', 150);
      fixture.detectChanges();

      const progress = debugElement.query(By.css('.ax-stock-level__progress'));
      const tooltipContent = component.tooltipText();
      expect(tooltipContent).toBeTruthy();
      expect(tooltipContent).toContain('Current:');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      fixture.componentRef.setInput('current', 1000000);
      fixture.componentRef.setInput('maximum', 1000000);
      fixture.detectChanges();

      expect(component.percentage()).toBe(100);
    });

    it('should handle very small numbers', () => {
      fixture.componentRef.setInput('current', 0.1);
      fixture.componentRef.setInput('maximum', 100);
      fixture.detectChanges();

      expect(component.percentage()).toBe(0);
    });

    it('should handle current > maximum', () => {
      fixture.componentRef.setInput('current', 600);
      fixture.componentRef.setInput('maximum', 500);
      fixture.detectChanges();

      expect(component.percentage()).toBe(120);
    });

    it('should handle negative values gracefully', () => {
      fixture.componentRef.setInput('current', -50);
      fixture.componentRef.setInput('minimum', 0);
      expect(component.isWarning()).toBe(true);
    });
  });
});
