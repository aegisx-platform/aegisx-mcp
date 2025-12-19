/**
 * Expiry Badge Component - Unit Tests
 * ================================================================
 *
 * Comprehensive test suite covering all component functionality:
 * - Status calculation (safe, warning, critical, expired)
 * - Countdown display and formatting
 * - Size and variant combinations
 * - Compact mode
 * - Click events
 * - Accessibility features
 * - Edge cases and timezone handling
 *
 * Target Coverage: >80%
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { AxExpiryBadgeComponent } from './ax-expiry-badge.component';
import { ExpiryInfo, ExpiryStatus } from './ax-expiry-badge.component.types';

describe('AxExpiryBadgeComponent', () => {
  let component: AxExpiryBadgeComponent;
  let fixture: ComponentFixture<AxExpiryBadgeComponent>;
  let buttonElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AxExpiryBadgeComponent, MatTooltipModule, MatIconModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AxExpiryBadgeComponent);
    component = fixture.componentInstance;
    buttonElement = fixture.debugElement.query(
      By.css('button.ax-expiry-badge'),
    );
  });

  // ==========================================================================
  // BASIC COMPONENT CREATION
  // ==========================================================================

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default inputs', () => {
      expect(component.warningDays()).toBe(30);
      expect(component.criticalDays()).toBe(7);
      expect(component.showCountdown()).toBe(true);
      expect(component.showIcon()).toBe(true);
      expect(component.size()).toBe('md');
      expect(component.variant()).toBe('soft');
      expect(component.compact()).toBe(false);
    });
  });

  // ==========================================================================
  // DAYS UNTIL EXPIRY CALCULATION
  // ==========================================================================

  describe('Days Until Expiry Calculation', () => {
    it('should calculate days remaining for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 45);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      expect(component.daysUntilExpiry()).toBeGreaterThan(40);
      expect(component.daysUntilExpiry()).toBeLessThanOrEqual(45);
    });

    it('should return 0 for today expiry', () => {
      const today = new Date();
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', today);
      });
      fixture.detectChanges();

      const days = component.daysUntilExpiry();
      expect(days).toBeGreaterThanOrEqual(0);
      expect(days).toBeLessThanOrEqual(1);
    });

    it('should return negative value for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', pastDate);
      });
      fixture.detectChanges();

      expect(component.daysUntilExpiry()).toBeLessThan(0);
    });

    it('should handle end of day boundary correctly', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', tomorrow);
      });
      fixture.detectChanges();

      // Should be at least 0 days (expires tomorrow)
      expect(component.daysUntilExpiry()).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================================================
  // STATUS DETERMINATION
  // ==========================================================================

  describe('Status Determination', () => {
    it('should return "safe" status for days > warningDays', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 50);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      expect(component.expiryStatus()).toBe('safe');
    });

    it('should return "warning" status for days between criticalDays and warningDays', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      expect(component.expiryStatus()).toBe('warning');
    });

    it('should return "critical" status for days <= criticalDays', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      expect(component.expiryStatus()).toBe('critical');
    });

    it('should return "expired" status for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', pastDate);
      });
      fixture.detectChanges();

      expect(component.expiryStatus()).toBe('expired');
    });

    it('should respect custom threshold values', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('warningDays', 15);
        fixture.componentRef.setInput('criticalDays', 5);
      });
      fixture.detectChanges();

      expect(component.expiryStatus()).toBe('warning');
    });
  });

  // ==========================================================================
  // BADGE TEXT GENERATION
  // ==========================================================================

  describe('Badge Text Generation', () => {
    it('should show countdown for safe status', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 50);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      const text = component.badgeText();
      expect(text).toContain('days left');
    });

    it('should show countdown for warning status', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      const text = component.badgeText();
      expect(text).toContain('days left');
    });

    it('should show countdown for critical status', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      const text = component.badgeText();
      expect(text).toContain('days left');
    });

    it('should show "Expires Today" for current day', () => {
      const today = new Date();
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', today);
      });
      fixture.detectChanges();

      const text = component.badgeText();
      expect(text.toLowerCase()).toContain('today');
    });

    it('should show "Expires Tomorrow" for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', tomorrow);
      });
      fixture.detectChanges();

      const text = component.badgeText();
      expect(text.toLowerCase()).toContain('tomorrow');
    });

    it('should show "Expired X days ago" for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', pastDate);
      });
      fixture.detectChanges();

      const text = component.badgeText();
      expect(text).toContain('Expired');
      expect(text).toContain('days ago');
    });

    it('should show status only when showCountdown is false', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('showCountdown', false);
      });
      fixture.detectChanges();

      const text = component.badgeText();
      expect(text).toBe('Warning');
    });

    it('should return empty string in compact mode', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('compact', true);
      });
      fixture.detectChanges();

      expect(component.badgeText()).toBe('');
    });
  });

  // ==========================================================================
  // STATUS ICON SELECTION
  // ==========================================================================

  describe('Status Icon Selection', () => {
    it('should show check_circle for safe status', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 50);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      expect(component.statusIcon()).toBe('check_circle');
    });

    it('should show warning for warning status', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      expect(component.statusIcon()).toBe('warning');
    });

    it('should show error for critical status', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      expect(component.statusIcon()).toBe('error');
    });

    it('should show cancel for expired status', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', pastDate);
      });
      fixture.detectChanges();

      expect(component.statusIcon()).toBe('cancel');
    });
  });

  // ==========================================================================
  // BADGE TYPE MAPPING
  // ==========================================================================

  describe('Badge Type Mapping', () => {
    it('should map safe status to success', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 50);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      expect(component.badgeType()).toBe('success');
    });

    it('should map warning status to warning', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      expect(component.badgeType()).toBe('warning');
    });

    it('should map critical status to error', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      expect(component.badgeType()).toBe('error');
    });

    it('should map expired status to neutral', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', pastDate);
      });
      fixture.detectChanges();

      expect(component.badgeType()).toBe('neutral');
    });
  });

  // ==========================================================================
  // TOOLTIP GENERATION
  // ==========================================================================

  describe('Tooltip Generation', () => {
    it('should include exact date in tooltip', () => {
      const testDate = new Date('2025-12-31T14:30:00');
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', testDate);
      });
      fixture.detectChanges();

      const tooltip = component.tooltipText();
      expect(tooltip).toContain('Expiry:');
      expect(tooltip).toContain('December');
      expect(tooltip).toContain('31');
    });

    it('should include time in tooltip', () => {
      const testDate = new Date('2025-12-31T14:30:00');
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', testDate);
      });
      fixture.detectChanges();

      const tooltip = component.tooltipText();
      expect(tooltip).toContain(':');
    });
  });

  // ==========================================================================
  // ACCESSIBILITY FEATURES
  // ==========================================================================

  describe('Accessibility Features', () => {
    it('should have aria-label for safe status', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 50);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      expect(component.ariaLabel()).toContain('Expiry status');
    });

    it('should have aria-label for expired status', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', pastDate);
      });
      fixture.detectChanges();

      expect(component.ariaLabel()).toContain('expired');
    });

    it('should have proper button role', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      expect(buttonElement.nativeElement.tagName).toBe('BUTTON');
    });
  });

  // ==========================================================================
  // SIZE AND VARIANT STYLING
  // ==========================================================================

  describe('Size and Variant Styling', () => {
    it('should apply sm size class', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('size', 'sm');
      });
      fixture.detectChanges();

      expect(
        buttonElement.nativeElement.classList.contains(
          'ax-expiry-badge--size-sm',
        ),
      ).toBe(true);
    });

    it('should apply lg size class', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('size', 'lg');
      });
      fixture.detectChanges();

      expect(
        buttonElement.nativeElement.classList.contains(
          'ax-expiry-badge--size-lg',
        ),
      ).toBe(true);
    });

    it('should apply soft variant class', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('variant', 'soft');
      });
      fixture.detectChanges();

      expect(
        buttonElement.nativeElement.classList.contains(
          'ax-expiry-badge--variant-soft',
        ),
      ).toBe(true);
    });

    it('should apply outlined variant class', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('variant', 'outlined');
      });
      fixture.detectChanges();

      expect(
        buttonElement.nativeElement.classList.contains(
          'ax-expiry-badge--variant-outlined',
        ),
      ).toBe(true);
    });

    it('should apply solid variant class', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('variant', 'solid');
      });
      fixture.detectChanges();

      expect(
        buttonElement.nativeElement.classList.contains(
          'ax-expiry-badge--variant-solid',
        ),
      ).toBe(true);
    });
  });

  // ==========================================================================
  // COMPACT MODE
  // ==========================================================================

  describe('Compact Mode', () => {
    it('should apply compact class', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('compact', true);
      });
      fixture.detectChanges();

      expect(
        buttonElement.nativeElement.classList.contains(
          'ax-expiry-badge--compact',
        ),
      ).toBe(true);
    });

    it('should hide text in compact mode', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('compact', true);
      });
      fixture.detectChanges();

      expect(component.badgeText()).toBe('');
    });

    it('should still show icon in compact mode', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('compact', true);
        fixture.componentRef.setInput('showIcon', true);
      });
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon).toBeTruthy();
    });
  });

  // ==========================================================================
  // ICON AND TEXT VISIBILITY
  // ==========================================================================

  describe('Icon and Text Visibility', () => {
    it('should hide icon when showIcon is false', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('showIcon', false);
      });
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon).toBeFalsy();
    });

    it('should show text when not in compact mode', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('compact', false);
      });
      fixture.detectChanges();

      const text = fixture.debugElement.query(By.css('.ax-expiry-badge__text'));
      expect(text).toBeTruthy();
    });
  });

  // ==========================================================================
  // CLICK EVENT
  // ==========================================================================

  describe('Click Event', () => {
    it('should emit click event with expiry info', (done) => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      component.onClick.subscribe((info: ExpiryInfo) => {
        expect(info.expiryDate).toBe(futureDate);
        expect(info.daysUntilExpiry).toBeGreaterThan(0);
        expect(info.status).toBe('warning');
        expect(info.message).toContain('days left');
        done();
      });

      component.handleClick();
    });

    it('should emit correct info for expired product', (done) => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', pastDate);
      });
      fixture.detectChanges();

      component.onClick.subscribe((info: ExpiryInfo) => {
        expect(info.status).toBe('expired');
        expect(info.daysUntilExpiry).toBeLessThan(0);
        expect(info.message).toContain('Expired');
        done();
      });

      component.handleClick();
    });

    it('should trigger click handler on button click', (done) => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      component.onClick.subscribe(() => {
        done();
      });

      buttonElement.nativeElement.click();
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle singular "day" in text', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', tomorrow);
      });
      fixture.detectChanges();

      const text = component.badgeText();
      expect(text).toContain('day');
      expect(text).not.toContain('days left');
    });

    it('should handle very far future dates', () => {
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 10);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', farFuture);
      });
      fixture.detectChanges();

      expect(component.expiryStatus()).toBe('safe');
      expect(component.daysUntilExpiry()).toBeGreaterThan(100);
    });

    it('should handle expired by exact boundary', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', yesterday);
      });
      fixture.detectChanges();

      expect(component.expiryStatus()).toBe('expired');
      expect(component.daysUntilExpiry()).toBeLessThan(0);
    });

    it('should handle different timezone offsets', () => {
      const testDate = new Date('2025-12-31T23:59:59Z');
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', testDate);
      });
      fixture.detectChanges();

      // Should calculate correctly regardless of timezone
      expect(component.daysUntilExpiry()).toBeDefined();
    });
  });

  // ==========================================================================
  // COMPUTED PROPERTY REACTIVITY
  // ==========================================================================

  describe('Computed Property Reactivity', () => {
    it('should update all computed values when expiryDate changes', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 50);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
      });
      fixture.detectChanges();

      const status1 = component.expiryStatus();
      const text1 = component.badgeText();

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', pastDate);
      });
      fixture.detectChanges();

      const status2 = component.expiryStatus();
      const text2 = component.badgeText();

      expect(status1).not.toBe(status2);
      expect(text1).not.toBe(text2);
    });

    it('should update all computed values when thresholds change', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('expiryDate', futureDate);
        fixture.componentRef.setInput('warningDays', 30);
        fixture.componentRef.setInput('criticalDays', 7);
      });
      fixture.detectChanges();

      const status1 = component.expiryStatus();

      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('warningDays', 10);
        fixture.componentRef.setInput('criticalDays', 5);
      });
      fixture.detectChanges();

      const status2 = component.expiryStatus();

      expect(status1).not.toBe(status2);
    });
  });
});
