import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModuleCardComponent } from './module-card.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  NOT_STARTED_MODULE,
  IN_PROGRESS_MODULE,
  COMPLETED_MODULE,
  FAILED_MODULE,
} from './module-card.examples';

describe('ModuleCardComponent', () => {
  let component: ModuleCardComponent;
  let fixture: ComponentFixture<ModuleCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatTooltipModule,
        ModuleCardComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModuleCardComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should use OnPush change detection', () => {
      const metadata = fixture.componentInstance.constructor['ɵcmp'];
      expect(metadata.changeDetection).toBe(1); // ChangeDetectionStrategy.OnPush = 1
    });

    it('should be a standalone component', () => {
      const metadata = fixture.componentInstance.constructor['ɵcmp'];
      expect(metadata.standalone).toBe(true);
    });
  });

  describe('Display Name and Path', () => {
    it('should display module name', () => {
      component.module = NOT_STARTED_MODULE;
      fixture.detectChanges();

      const nameElement = fixture.nativeElement.querySelector('.module-name');
      expect(nameElement.textContent).toContain('Drug Generics');
    });

    it('should display domain path with subdomain', () => {
      component.module = NOT_STARTED_MODULE;
      fixture.detectChanges();

      const pathElement = fixture.nativeElement.querySelector('.header-path');
      expect(pathElement.textContent).toContain('inventory/master-data');
    });

    it('should display domain path without subdomain', () => {
      component.module = {
        ...NOT_STARTED_MODULE,
        subdomain: undefined,
      };
      fixture.detectChanges();

      expect(component.displayPath).toBe('inventory');
    });

    it('should compute correct displayPath with subdomain', () => {
      component.module = NOT_STARTED_MODULE;
      expect(component.displayPath).toBe('inventory/master-data');
    });
  });

  describe('Not Started State', () => {
    beforeEach(() => {
      component.module = NOT_STARTED_MODULE;
      fixture.detectChanges();
    });

    it('should display status as "Not Started"', () => {
      expect(component.statusLabel).toBe('Not Started');
    });

    it('should use pause_circle icon', () => {
      expect(component.statusIcon).toBe('pause_circle');
    });

    it('should apply correct badge class', () => {
      expect(component.statusBadgeClass).toContain('badge-not_started');
    });

    it('should apply correct card class', () => {
      expect(component.cardContainerClass).toContain('module-card-not_started');
    });

    it('should show "Start Import" button', () => {
      expect(component.primaryActionText).toBe('Start Import');
      expect(component.primaryActionIcon).toBe('cloud_download');
    });

    it('should display priority and dependencies', () => {
      fixture.detectChanges();
      const infoSection = fixture.nativeElement.querySelector('.info-section');
      expect(infoSection.textContent).toContain('Priority');
      expect(infoSection.textContent).toContain('Dependencies');
    });

    it('should show record count as 0', () => {
      expect(component.recordCountText).toBe('0 records');
    });

    it('should not show progress bar', () => {
      const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
      expect(progressBar).toBeNull();
    });

    it('should not show rollback button', () => {
      expect(component.showRollback).toBeFalsy();
    });

    it('should emit import event when primary action clicked', (done) => {
      component.import.subscribe((module) => {
        expect(module).toEqual(NOT_STARTED_MODULE);
        done();
      });

      component.onPrimaryAction();
    });
  });

  describe('In Progress State', () => {
    beforeEach(() => {
      component.module = IN_PROGRESS_MODULE;
      fixture.detectChanges();
    });

    it('should display status as "In Progress"', () => {
      expect(component.statusLabel).toBe('In Progress');
    });

    it('should use sync icon', () => {
      expect(component.statusIcon).toBe('sync');
    });

    it('should apply correct badge class', () => {
      expect(component.statusBadgeClass).toContain('badge-in_progress');
    });

    it('should show "View Progress" button', () => {
      expect(component.primaryActionText).toBe('View Progress');
      expect(component.primaryActionIcon).toBe('visibility');
    });

    it('should display progress percentage', () => {
      expect(component.recordCountText).toContain('45 / 100 records (45%)');
    });

    it('should show progress bar', () => {
      const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
      expect(progressBar).toBeTruthy();
    });

    it('should calculate correct progress percentage', () => {
      expect(component.progressPercentage).toBe(45);
    });

    it('should not show rollback button', () => {
      expect(component.showRollback).toBeFalsy();
    });

    it('should emit viewDetails event when primary action clicked', (done) => {
      component.viewDetails.subscribe((module) => {
        expect(module).toEqual(IN_PROGRESS_MODULE);
        done();
      });

      component.onPrimaryAction();
    });

    it('should check isViewProgress correctly', () => {
      expect(component.isViewProgress).toBeTruthy();
    });
  });

  describe('Completed State', () => {
    beforeEach(() => {
      component.module = COMPLETED_MODULE;
      fixture.detectChanges();
    });

    it('should display status as "Completed"', () => {
      expect(component.statusLabel).toBe('Completed');
    });

    it('should use check_circle icon', () => {
      expect(component.statusIcon).toBe('check_circle');
    });

    it('should apply correct badge class', () => {
      expect(component.statusBadgeClass).toContain('badge-completed');
    });

    it('should show "View Details" button', () => {
      expect(component.primaryActionText).toBe('View Details');
      expect(component.primaryActionIcon).toBe('info');
    });

    it('should display correct record count', () => {
      expect(component.recordCountText).toBe('50 records');
    });

    it('should display last import date and user', () => {
      const infoSection = fixture.nativeElement.querySelector('.info-section');
      expect(infoSection.textContent).toContain('Imported');
      expect(infoSection.textContent).toContain('admin@example.com');
    });

    it('should show rollback button', () => {
      expect(component.showRollback).toBeTruthy();
    });

    it('should not show retry button', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.retry-btn');
      expect(buttons.length).toBe(0);
    });

    it('should emit viewDetails event when primary action clicked', (done) => {
      component.viewDetails.subscribe((module) => {
        expect(module).toEqual(COMPLETED_MODULE);
        done();
      });

      component.onPrimaryAction();
    });

    it('should emit rollback event when rollback clicked', (done) => {
      component.rollback.subscribe((module) => {
        expect(module).toEqual(COMPLETED_MODULE);
        done();
      });

      component.onRollback();
    });

    it('should check isViewDetails correctly', () => {
      expect(component.isViewDetails).toBeTruthy();
    });

    it('should format last import date correctly', () => {
      const dateString = component.lastImportDate;
      expect(dateString).toBeTruthy();
      expect(dateString).toMatch(/\d{2}\/\d{2}\/\d{4}/); // Date format check
    });
  });

  describe('Failed State', () => {
    beforeEach(() => {
      component.module = FAILED_MODULE;
      fixture.detectChanges();
    });

    it('should display status as "Failed"', () => {
      expect(component.statusLabel).toBe('Failed');
    });

    it('should use error icon', () => {
      expect(component.statusIcon).toBe('error');
    });

    it('should apply correct badge class', () => {
      expect(component.statusBadgeClass).toContain('badge-failed');
    });

    it('should show "View Errors" button', () => {
      expect(component.primaryActionText).toBe('View Errors');
      expect(component.primaryActionIcon).toBe('warning');
    });

    it('should display error message', () => {
      const infoSection = fixture.nativeElement.querySelector('.info-section');
      expect(infoSection.textContent).toContain('Error');
      expect(infoSection.textContent).toContain('Duplicate codes');
    });

    it('should show retry button', () => {
      const retryBtn = fixture.nativeElement.querySelector('.retry-btn');
      expect(retryBtn).toBeTruthy();
    });

    it('should not show rollback button', () => {
      expect(component.showRollback).toBeFalsy();
    });

    it('should emit viewDetails event when View Errors clicked', (done) => {
      component.viewDetails.subscribe((module) => {
        expect(module).toEqual(FAILED_MODULE);
        done();
      });

      component.onPrimaryAction();
    });

    it('should emit import event when Retry clicked', (done) => {
      component.import.subscribe((module) => {
        expect(module).toEqual(FAILED_MODULE);
        done();
      });

      component.onImport();
    });

    it('should check isViewErrors correctly', () => {
      expect(component.isViewErrors).toBeTruthy();
    });
  });

  describe('Event Emissions', () => {
    beforeEach(() => {
      component.module = NOT_STARTED_MODULE;
    });

    it('should emit import event', (done) => {
      component.import.subscribe((module) => {
        expect(module).toEqual(NOT_STARTED_MODULE);
        done();
      });

      component.onImport();
    });

    it('should emit viewDetails event', (done) => {
      component.viewDetails.subscribe((module) => {
        expect(module).toEqual(NOT_STARTED_MODULE);
        done();
      });

      component.onViewDetails();
    });

    it('should emit rollback event', (done) => {
      component.module = COMPLETED_MODULE;
      component.rollback.subscribe((module) => {
        expect(module).toEqual(COMPLETED_MODULE);
        done();
      });

      component.onRollback();
    });
  });

  describe('Computed Properties', () => {
    it('should compute correct statusIcon for each state', () => {
      component.module = { ...NOT_STARTED_MODULE };
      expect(component.statusIcon).toBe('pause_circle');

      component.module = { ...IN_PROGRESS_MODULE };
      expect(component.statusIcon).toBe('sync');

      component.module = { ...COMPLETED_MODULE };
      expect(component.statusIcon).toBe('check_circle');

      component.module = { ...FAILED_MODULE };
      expect(component.statusIcon).toBe('error');
    });

    it('should compute correct statusLabel for each state', () => {
      component.module = { ...NOT_STARTED_MODULE };
      expect(component.statusLabel).toBe('Not Started');

      component.module = { ...IN_PROGRESS_MODULE };
      expect(component.statusLabel).toBe('In Progress');

      component.module = { ...COMPLETED_MODULE };
      expect(component.statusLabel).toBe('Completed');

      component.module = { ...FAILED_MODULE };
      expect(component.statusLabel).toBe('Failed');
    });

    it('should compute correct primaryActionText for each state', () => {
      component.module = { ...NOT_STARTED_MODULE };
      expect(component.primaryActionText).toBe('Start Import');

      component.module = { ...IN_PROGRESS_MODULE };
      expect(component.primaryActionText).toBe('View Progress');

      component.module = { ...COMPLETED_MODULE };
      expect(component.primaryActionText).toBe('View Details');

      component.module = { ...FAILED_MODULE };
      expect(component.primaryActionText).toBe('View Errors');
    });

    it('should compute state flags correctly', () => {
      component.module = { ...NOT_STARTED_MODULE };
      expect(component.isStartImport).toBeTruthy();
      expect(component.isViewProgress).toBeFalsy();
      expect(component.isViewDetails).toBeFalsy();
      expect(component.isViewErrors).toBeFalsy();

      component.module = { ...IN_PROGRESS_MODULE };
      expect(component.isStartImport).toBeFalsy();
      expect(component.isViewProgress).toBeTruthy();
      expect(component.isViewDetails).toBeFalsy();
      expect(component.isViewErrors).toBeFalsy();

      component.module = { ...COMPLETED_MODULE };
      expect(component.isStartImport).toBeFalsy();
      expect(component.isViewProgress).toBeFalsy();
      expect(component.isViewDetails).toBeTruthy();
      expect(component.isViewErrors).toBeFalsy();

      component.module = { ...FAILED_MODULE };
      expect(component.isStartImport).toBeFalsy();
      expect(component.isViewProgress).toBeFalsy();
      expect(component.isViewDetails).toBeFalsy();
      expect(component.isViewErrors).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      component.module = NOT_STARTED_MODULE;
      fixture.detectChanges();
    });

    it('should have aria-label on primary action button', () => {
      const button = fixture.nativeElement.querySelector('.primary-action-btn');
      expect(button.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have aria-label on rollback button', () => {
      component.module = COMPLETED_MODULE;
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.rollback-btn');
      expect(button.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have aria-label on retry button', () => {
      component.module = FAILED_MODULE;
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.retry-btn');
      expect(button.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing lastImport gracefully', () => {
      component.module = {
        ...NOT_STARTED_MODULE,
        lastImport: undefined,
      };

      expect(component.lastImportDate).toBe('');
    });

    it('should handle missing progress data', () => {
      component.module = {
        ...IN_PROGRESS_MODULE,
        progress: undefined,
      };

      expect(component.progressPercentage).toBe(0);
    });

    it('should handle missing error message', () => {
      component.module = {
        ...FAILED_MODULE,
        error: undefined,
      };

      expect(component.statusLabel).toBe('Failed');
    });

    it('should handle empty dependencies array', () => {
      component.module = {
        ...NOT_STARTED_MODULE,
        dependencies: [],
      };
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('None');
    });

    it('should handle module with no subdomain', () => {
      component.module = {
        ...NOT_STARTED_MODULE,
        subdomain: undefined,
      };

      expect(component.displayPath).toBe('inventory');
    });
  });

  describe('Template Rendering', () => {
    it('should render mat-card element', () => {
      component.module = NOT_STARTED_MODULE;
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('mat-card');
      expect(card).toBeTruthy();
    });

    it('should render mat-card-header', () => {
      component.module = NOT_STARTED_MODULE;
      fixture.detectChanges();

      const header = fixture.nativeElement.querySelector('mat-card-header');
      expect(header).toBeTruthy();
    });

    it('should render mat-card-content', () => {
      component.module = NOT_STARTED_MODULE;
      fixture.detectChanges();

      const content = fixture.nativeElement.querySelector('mat-card-content');
      expect(content).toBeTruthy();
    });

    it('should render mat-card-actions', () => {
      component.module = NOT_STARTED_MODULE;
      fixture.detectChanges();

      const actions = fixture.nativeElement.querySelector('mat-card-actions');
      expect(actions).toBeTruthy();
    });

    it('should render module icon', () => {
      component.module = NOT_STARTED_MODULE;
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.module-icon');
      expect(icon).toBeTruthy();
      expect(icon.textContent).toBe('inventory_2');
    });

    it('should render status badge', () => {
      component.module = NOT_STARTED_MODULE;
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.badge');
      expect(badge).toBeTruthy();
    });
  });

  describe('Responsive Behavior', () => {
    it('should have responsive classes applied', () => {
      component.module = NOT_STARTED_MODULE;
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('mat-card');
      expect(container.classList.contains('module-card-container')).toBeTruthy();
    });
  });
});
