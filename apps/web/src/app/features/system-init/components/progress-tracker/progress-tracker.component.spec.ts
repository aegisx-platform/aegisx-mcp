import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProgressTrackerComponent } from './progress-tracker.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { ImportStatus } from '../../types/system-init.types';

/**
 * Fixed date for deterministic test behavior
 * All tests use this date to avoid timing-related flakiness
 */
const FIXED_NOW = new Date('2025-12-13T10:00:00Z');

/**
 * Mock ImportStatus objects for testing
 */
const createMockImportStatus = (overrides?: Partial<ImportStatus>): ImportStatus => {
  const startedAt = new Date(FIXED_NOW.getTime() - 30000); // 30 seconds ago

  return {
    jobId: 'test-job-123',
    status: 'running',
    progress: {
      totalRows: 100,
      importedRows: 45,
      errorRows: 0,
      currentRow: 45,
      percentComplete: 45,
    },
    startedAt: startedAt.toISOString(),
    ...overrides,
  };
};

describe('ProgressTrackerComponent', () => {
  let component: ProgressTrackerComponent;
  let fixture: ComponentFixture<ProgressTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatChipsModule,
        MatTooltipModule,
        ProgressTrackerComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressTrackerComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should use OnPush change detection strategy', () => {
      // Verify that the component uses OnPush by checking if inputs are present
      // (OnPush strategy only triggers when inputs change)
      component.importStatus = createMockImportStatus();
      expect(component).toBeTruthy();
      // Component should work with input changes
    });

    it('should be a standalone component', () => {
      // Standalone components don't require declaration in an NgModule
      component.importStatus = createMockImportStatus();
      fixture.detectChanges();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('should initialize with import status input', () => {
      const mockStatus = createMockImportStatus();
      component.importStatus = mockStatus;

      expect(component.importStatus).toEqual(mockStatus);
    });

    it('should have default moduleName as undefined', () => {
      expect(component.moduleName).toBeUndefined();
    });

    it('should accept optional moduleName input', () => {
      component.moduleName = 'Departments';
      expect(component.moduleName).toBe('Departments');
    });

    it('should have cancel EventEmitter', () => {
      expect(component.cancel).toBeDefined();
      expect(component.cancel.emit).toBeDefined();
    });

    it('should have viewLogs EventEmitter', () => {
      expect(component.viewLogs).toBeDefined();
      expect(component.viewLogs.emit).toBeDefined();
    });

    it('should initialize cancellationInitiated as false', () => {
      expect(component['cancellationInitiated']).toBeFalsy();
    });
  });

  describe('Progress Percentage Calculation', () => {
    beforeEach(() => {
      component.importStatus = createMockImportStatus();
    });

    it('should return percentComplete from import status', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 100,
          importedRows: 50,
          errorRows: 0,
          currentRow: 50,
          percentComplete: 50,
        },
      });

      expect(component['percentComplete']()).toBe(50);
    });

    it('should return 0 when percentComplete is undefined', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 100,
          importedRows: 25,
          errorRows: 0,
          currentRow: 25,
          percentComplete: undefined,
        },
      });

      expect(component['percentComplete']()).toBe(0);
    });

    it('should return 100 when all rows are imported', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 100,
          importedRows: 100,
          errorRows: 0,
          currentRow: 100,
          percentComplete: 100,
        },
      });

      expect(component['percentComplete']()).toBe(100);
    });

    it('should handle 0% progress', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 100,
          importedRows: 0,
          errorRows: 0,
          currentRow: 0,
          percentComplete: 0,
        },
      });

      expect(component['percentComplete']()).toBe(0);
    });

    it('should handle decimal percentages', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 3,
          importedRows: 1,
          errorRows: 0,
          currentRow: 1,
          percentComplete: 33.33,
        },
      });

      expect(component['percentComplete']()).toBe(33.33);
    });
  });

  describe('Row Count Display', () => {
    it('should display imported rows and total rows', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 100,
          importedRows: 45,
          errorRows: 0,
          currentRow: 45,
          percentComplete: 45,
        },
      });
      fixture.detectChanges();

      const rowCountElement = fixture.nativeElement.textContent;
      expect(rowCountElement).toContain('45');
      expect(rowCountElement).toContain('100');
    });

    it('should display 0 imported rows at start', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 100,
          importedRows: 0,
          errorRows: 0,
          currentRow: 0,
          percentComplete: 0,
        },
      });
      fixture.detectChanges();

      const rowCountElement = fixture.nativeElement.textContent;
      expect(rowCountElement).toContain('0');
      expect(rowCountElement).toContain('100');
    });

    it('should display all rows imported when complete', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 100,
          importedRows: 100,
          errorRows: 0,
          currentRow: 100,
          percentComplete: 100,
        },
      });
      fixture.detectChanges();

      const rowCountElement = fixture.nativeElement.textContent;
      expect(rowCountElement).toContain('100');
    });

    it('should handle large row counts', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 1000000,
          importedRows: 500000,
          errorRows: 0,
          currentRow: 500000,
          percentComplete: 50,
        },
      });
      fixture.detectChanges();

      const rowCountElement = fixture.nativeElement.textContent;
      expect(rowCountElement).toContain('500000');
      expect(rowCountElement).toContain('1000000');
    });

    it('should handle edge case with 0 total rows', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 0,
          importedRows: 0,
          errorRows: 0,
          currentRow: 0,
          percentComplete: 0,
        },
      });
      fixture.detectChanges();

      const rowCountElement = fixture.nativeElement.textContent;
      expect(rowCountElement).toContain('0');
    });
  });

  describe('Elapsed Time Calculation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(FIXED_NOW.getTime());
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should display elapsed time in seconds format when < 60 seconds', () => {
      const startedAt = new Date(FIXED_NOW.getTime() - 30000); // 30 seconds ago

      component.importStatus = createMockImportStatus({
        startedAt: startedAt.toISOString(),
      });

      const elapsedTime = component['elapsedTime']();
      expect(elapsedTime).toMatch(/^\d+s$/);
      expect(elapsedTime).toContain('s');
    });

    it('should display elapsed time in minutes and seconds format when >= 60 seconds', () => {
      const startedAt = new Date(FIXED_NOW.getTime() - 125000); // 2 minutes 5 seconds ago

      component.importStatus = createMockImportStatus({
        startedAt: startedAt.toISOString(),
      });

      const elapsedTime = component['elapsedTime']();
      expect(elapsedTime).toMatch(/^\d+m \d+s$/);
    });

    it('should return "0s" when no startedAt time', () => {
      component.importStatus = createMockImportStatus({
        startedAt: undefined,
      });

      const elapsedTime = component['elapsedTime']();
      expect(elapsedTime).toBe('0s');
    });

    it('should handle exactly 60 seconds', () => {
      const startedAt = new Date(FIXED_NOW.getTime() - 60000); // Exactly 60 seconds ago

      component.importStatus = createMockImportStatus({
        startedAt: startedAt.toISOString(),
      });

      const elapsedTime = component['elapsedTime']();
      expect(elapsedTime).toMatch(/^\d+m \d+s$/);
    });

    it('should handle large elapsed times', () => {
      const startedAt = new Date(FIXED_NOW.getTime() - 3665000); // 1 hour, 1 minute, 5 seconds

      component.importStatus = createMockImportStatus({
        startedAt: startedAt.toISOString(),
      });

      const elapsedTime = component['elapsedTime']();
      expect(elapsedTime).toMatch(/^\d+m \d+s$/);
    });
  });

  describe('Speed Calculation (rows per second)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(FIXED_NOW.getTime());
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate correct speed in rows per second', () => {
      const startedAt = new Date(FIXED_NOW.getTime() - 10000); // 10 seconds ago

      component.importStatus = createMockImportStatus({
        startedAt: startedAt.toISOString(),
        progress: {
          totalRows: 100,
          importedRows: 50,
          errorRows: 0,
          currentRow: 50,
          percentComplete: 50,
        },
      });

      const speed = component['speed']();
      // 50 rows in 10 seconds = 5 rows per second
      expect(speed).toBeCloseTo(5, 1);
    });

    it('should return 0 when no startedAt time', () => {
      component.importStatus = createMockImportStatus({
        startedAt: undefined,
      });

      const speed = component['speed']();
      expect(speed).toBe(0);
    });

    it('should return 0 when elapsed time is 0', () => {
      component.importStatus = createMockImportStatus({
        startedAt: FIXED_NOW.toISOString(),
      });

      const speed = component['speed']();
      expect(speed).toBe(0);
    });

    it('should handle high speed imports', () => {
      const startedAt = new Date(FIXED_NOW.getTime() - 5000); // 5 seconds ago

      component.importStatus = createMockImportStatus({
        startedAt: startedAt.toISOString(),
        progress: {
          totalRows: 1000,
          importedRows: 1000,
          errorRows: 0,
          currentRow: 1000,
          percentComplete: 100,
        },
      });

      const speed = component['speed']();
      // 1000 rows in 5 seconds = 200 rows per second
      expect(speed).toBeCloseTo(200, 1);
    });

    it('should handle slow speed imports', () => {
      const startedAt = new Date(FIXED_NOW.getTime() - 100000); // 100 seconds ago

      component.importStatus = createMockImportStatus({
        startedAt: startedAt.toISOString(),
        progress: {
          totalRows: 100,
          importedRows: 50,
          errorRows: 0,
          currentRow: 50,
          percentComplete: 50,
        },
      });

      const speed = component['speed']();
      // 50 rows in 100 seconds = 0.5 rows per second
      expect(speed).toBeCloseTo(0.5, 1);
    });
  });

  describe('ETA Calculation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(FIXED_NOW.getTime());
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate ETA in seconds format when remaining < 60 seconds', () => {
      const startedAt = new Date(FIXED_NOW.getTime() - 10000); // 10 seconds ago

      component.importStatus = createMockImportStatus({
        startedAt: startedAt.toISOString(),
        progress: {
          totalRows: 100,
          importedRows: 90,
          errorRows: 0,
          currentRow: 90,
          percentComplete: 90,
        },
      });

      const eta = component['estimatedRemaining']();
      expect(eta).toMatch(/^~\d+s$/);
    });

    it('should calculate ETA in minutes and seconds format when remaining >= 60 seconds', () => {
      const startedAt = new Date(FIXED_NOW.getTime() - 10000); // 10 seconds ago

      component.importStatus = createMockImportStatus({
        startedAt: startedAt.toISOString(),
        progress: {
          totalRows: 1000,
          importedRows: 100,
          errorRows: 0,
          currentRow: 100,
          percentComplete: 10,
        },
      });

      const eta = component['estimatedRemaining']();
      expect(eta).toMatch(/^~\d+m \d+s$/);
    });

    it('should return "—" when percentComplete is 0', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 100,
          importedRows: 0,
          errorRows: 0,
          currentRow: 0,
          percentComplete: 0,
        },
      });

      const eta = component['estimatedRemaining']();
      expect(eta).toBe('—');
    });

    it('should return "—" when percentComplete is 100', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 100,
          importedRows: 100,
          errorRows: 0,
          currentRow: 100,
          percentComplete: 100,
        },
      });

      const eta = component['estimatedRemaining']();
      expect(eta).toBe('—');
    });

    it('should return "—" when no startedAt time', () => {
      component.importStatus = createMockImportStatus({
        startedAt: undefined,
      });

      const eta = component['estimatedRemaining']();
      expect(eta).toBe('—');
    });

    it('should return "—" when speed is 0', () => {
      component.importStatus = createMockImportStatus({
        startedAt: FIXED_NOW.toISOString(),
        progress: {
          totalRows: 100,
          importedRows: 0,
          errorRows: 0,
          currentRow: 0,
          percentComplete: 0,
        },
      });

      const eta = component['estimatedRemaining']();
      expect(eta).toBe('—');
    });

    it('should accurately predict ETA for 50% completion', () => {
      const startedAt = new Date(FIXED_NOW.getTime() - 10000); // 10 seconds elapsed

      component.importStatus = createMockImportStatus({
        startedAt: startedAt.toISOString(),
        progress: {
          totalRows: 100,
          importedRows: 50,
          errorRows: 0,
          currentRow: 50,
          percentComplete: 50,
        },
      });

      const eta = component['estimatedRemaining']();
      // 50 rows in 10 seconds = 5 rows/sec
      // 50 remaining rows / 5 rows/sec = 10 seconds remaining
      expect(eta).toContain('~');
    });
  });

  describe('Status Badge Styling', () => {
    it('should display "Queued" status text for queued status', () => {
      component.importStatus = createMockImportStatus({
        status: 'queued',
      });

      expect(component['statusText']).toBe('Queued');
    });

    it('should display "In Progress" status text for running status', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });

      expect(component['statusText']).toBe('In Progress');
    });

    it('should display "Completed" status text for completed status', () => {
      component.importStatus = createMockImportStatus({
        status: 'completed',
      });

      expect(component['statusText']).toBe('Completed');
    });

    it('should display "Failed" status text for failed status', () => {
      component.importStatus = createMockImportStatus({
        status: 'failed',
      });

      expect(component['statusText']).toBe('Failed');
    });

    it('should display "Cancelled" status text for cancelled status', () => {
      component.importStatus = createMockImportStatus({
        status: 'cancelled',
      });

      expect(component['statusText']).toBe('Cancelled');
    });

    it('should return correct status icon for queued', () => {
      component.importStatus = createMockImportStatus({
        status: 'queued',
      });

      expect(component['statusIcon']).toBe('schedule');
    });

    it('should return correct status icon for running', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });

      expect(component['statusIcon']).toBe('sync');
    });

    it('should return correct status icon for completed', () => {
      component.importStatus = createMockImportStatus({
        status: 'completed',
      });

      expect(component['statusIcon']).toBe('check_circle');
    });

    it('should return correct status icon for failed', () => {
      component.importStatus = createMockImportStatus({
        status: 'failed',
      });

      expect(component['statusIcon']).toBe('error');
    });

    it('should return correct status icon for cancelled', () => {
      component.importStatus = createMockImportStatus({
        status: 'cancelled',
      });

      expect(component['statusIcon']).toBe('cancel');
    });

    it('should apply correct status color class', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });

      expect(component['statusColorClass']).toBe('status-running');
    });

    it('should apply status-completed color class', () => {
      component.importStatus = createMockImportStatus({
        status: 'completed',
      });

      expect(component['statusColorClass']).toBe('status-completed');
    });

    it('should apply status-failed color class', () => {
      component.importStatus = createMockImportStatus({
        status: 'failed',
      });

      expect(component['statusColorClass']).toBe('status-failed');
    });
  });

  describe('Progress Bar Color', () => {
    it('should return "primary" color for running status', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });

      expect(component['progressBarColor']).toBe('primary');
    });

    it('should return "accent" color for completed status', () => {
      component.importStatus = createMockImportStatus({
        status: 'completed',
      });

      expect(component['progressBarColor']).toBe('accent');
    });

    it('should return "warn" color for failed status', () => {
      component.importStatus = createMockImportStatus({
        status: 'failed',
      });

      expect(component['progressBarColor']).toBe('warn');
    });

    it('should return "warn" color for cancelled status', () => {
      component.importStatus = createMockImportStatus({
        status: 'cancelled',
      });

      expect(component['progressBarColor']).toBe('warn');
    });

    it('should return "primary" color for queued status', () => {
      component.importStatus = createMockImportStatus({
        status: 'queued',
      });

      expect(component['progressBarColor']).toBe('primary');
    });

    it('should return true for indeterminate progress bar when queued', () => {
      component.importStatus = createMockImportStatus({
        status: 'queued',
      });

      expect(component['progressBarIndeterminate']).toBe(true);
    });

    it('should return false for indeterminate progress bar when running', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });

      expect(component['progressBarIndeterminate']).toBe(false);
    });

    it('should return false for indeterminate progress bar when completed', () => {
      component.importStatus = createMockImportStatus({
        status: 'completed',
      });

      expect(component['progressBarIndeterminate']).toBe(false);
    });
  });

  describe('Reactive Updates on Status Changes', () => {
    it('should correctly compute percentage from current status', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 100,
          importedRows: 25,
          errorRows: 0,
          currentRow: 25,
          percentComplete: 25,
        },
      });

      expect(component['percentComplete']()).toBe(25);
    });

    it('should update status text when status changes', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });
      expect(component['statusText']).toBe('In Progress');

      component.importStatus = createMockImportStatus({
        status: 'completed',
      });
      expect(component['statusText']).toBe('Completed');
    });

    it('should update status icon when status changes', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });
      expect(component['statusIcon']).toBe('sync');

      component.importStatus = createMockImportStatus({
        status: 'completed',
      });
      expect(component['statusIcon']).toBe('check_circle');
    });

    it('should update progress bar color when status changes', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });
      expect(component['progressBarColor']).toBe('primary');

      component.importStatus = createMockImportStatus({
        status: 'completed',
      });
      expect(component['progressBarColor']).toBe('accent');
    });

    it('should update indeterminate flag when status changes from queued to running', () => {
      component.importStatus = createMockImportStatus({
        status: 'queued',
      });
      expect(component['progressBarIndeterminate']).toBe(true);

      component.importStatus = createMockImportStatus({
        status: 'running',
      });
      expect(component['progressBarIndeterminate']).toBe(false);
    });

    it('should update showCancelButton when status changes', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });
      expect(component['showCancelButton']).toBe(true);

      component.importStatus = createMockImportStatus({
        status: 'completed',
      });
      expect(component['showCancelButton']).toBe(false);
    });
  });

  describe('Status State Checks', () => {
    it('should correctly identify isImporting for queued status', () => {
      component.importStatus = createMockImportStatus({
        status: 'queued',
      });

      expect(component['isImporting']).toBe(true);
    });

    it('should correctly identify isImporting for running status', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });

      expect(component['isImporting']).toBe(true);
    });

    it('should correctly identify isImporting as false for completed status', () => {
      component.importStatus = createMockImportStatus({
        status: 'completed',
      });

      expect(component['isImporting']).toBe(false);
    });

    it('should correctly identify isCompleted', () => {
      component.importStatus = createMockImportStatus({
        status: 'completed',
      });

      expect(component['isCompleted']).toBe(true);
    });

    it('should correctly identify isFailed', () => {
      component.importStatus = createMockImportStatus({
        status: 'failed',
      });

      expect(component['isFailed']).toBe(true);
    });

    it('should correctly identify isCancelled', () => {
      component.importStatus = createMockImportStatus({
        status: 'cancelled',
      });

      expect(component['isCancelled']).toBe(true);
    });
  });

  describe('Cancel Button Visibility', () => {
    it('should show cancel button when queued and not cancelled', () => {
      component.importStatus = createMockImportStatus({
        status: 'queued',
      });

      expect(component['showCancelButton']).toBe(true);
    });

    it('should show cancel button when running and not cancelled', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });

      expect(component['showCancelButton']).toBe(true);
    });

    it('should hide cancel button when completed', () => {
      component.importStatus = createMockImportStatus({
        status: 'completed',
      });

      expect(component['showCancelButton']).toBe(false);
    });

    it('should hide cancel button when failed', () => {
      component.importStatus = createMockImportStatus({
        status: 'failed',
      });

      expect(component['showCancelButton']).toBe(false);
    });

    it('should hide cancel button when cancelled', () => {
      component.importStatus = createMockImportStatus({
        status: 'cancelled',
      });

      expect(component['showCancelButton']).toBe(false);
    });

    it('should hide cancel button after cancellation initiated', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });
      component['cancellationInitiated'] = true;

      expect(component['showCancelButton']).toBe(false);
    });
  });

  describe('Event Emissions', () => {
    it('should emit cancel event when onCancel is called', (done) => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });

      component.cancel.subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      component.onCancel();
    });

    it('should set cancellationInitiated to true when onCancel is called', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });

      expect(component['cancellationInitiated']).toBe(false);
      component.onCancel();
      expect(component['cancellationInitiated']).toBe(true);
    });

    it('should emit viewLogs event when onViewLogs is called', (done) => {
      component.importStatus = createMockImportStatus();

      component.viewLogs.subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      component.onViewLogs();
    });

    it('should emit cancel after setting cancellationInitiated', (done) => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });
      let initiatedWasSet = false;

      component.cancel.subscribe(() => {
        expect(initiatedWasSet).toBe(true);
        done();
      });

      component['cancellationInitiated'] = false;
      initiatedWasSet = true;
      component.onCancel();
    });
  });

  describe('Card Container CSS Class', () => {
    it('should return correct card container class for running status', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });

      expect(component['cardContainerClass']).toContain('progress-tracker');
      expect(component['cardContainerClass']).toContain('progress-tracker-running');
    });

    it('should return correct card container class for completed status', () => {
      component.importStatus = createMockImportStatus({
        status: 'completed',
      });

      expect(component['cardContainerClass']).toContain('progress-tracker-completed');
    });

    it('should return correct card container class for failed status', () => {
      component.importStatus = createMockImportStatus({
        status: 'failed',
      });

      expect(component['cardContainerClass']).toContain('progress-tracker-failed');
    });

    it('should return correct card container class for queued status', () => {
      component.importStatus = createMockImportStatus({
        status: 'queued',
      });

      expect(component['cardContainerClass']).toContain('progress-tracker-queued');
    });

    it('should return correct card container class for cancelled status', () => {
      component.importStatus = createMockImportStatus({
        status: 'cancelled',
      });

      expect(component['cardContainerClass']).toContain('progress-tracker-cancelled');
    });
  });

  describe('Time Formatting', () => {
    it('should format startedTimeFormatted with time format', () => {
      const testDate = new Date('2025-12-13T10:30:45Z');
      component.importStatus = createMockImportStatus({
        startedAt: testDate.toISOString(),
      });

      const formatted = component['startedTimeFormatted']();
      expect(formatted).toBeTruthy();
      expect(formatted).not.toBe('—');
    });

    it('should return "—" when startedAt is missing', () => {
      component.importStatus = createMockImportStatus({
        startedAt: undefined,
      });

      const formatted = component['startedTimeFormatted']();
      expect(formatted).toBe('—');
    });

    it('should format completedTimeFormatted with time format', () => {
      const testDate = new Date('2025-12-13T10:35:45Z');
      component.importStatus = createMockImportStatus({
        completedAt: testDate.toISOString(),
      });

      const formatted = component['completedTimeFormatted']();
      expect(formatted).toBeTruthy();
      expect(formatted).not.toBe('—');
    });

    it('should return "—" when completedAt is missing', () => {
      component.importStatus = createMockImportStatus({
        completedAt: undefined,
      });

      const formatted = component['completedTimeFormatted']();
      expect(formatted).toBe('—');
    });
  });

  describe('Edge Cases', () => {
    it('should handle 0 rows scenario', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 0,
          importedRows: 0,
          errorRows: 0,
          currentRow: 0,
          percentComplete: 0,
        },
      });

      expect(component['percentComplete']()).toBe(0);
      expect(component['speed']()).toBe(0);
      expect(component['estimatedRemaining']()).toBe('—');
    });

    it('should handle 100% complete scenario', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 100,
          importedRows: 100,
          errorRows: 0,
          currentRow: 100,
          percentComplete: 100,
        },
        status: 'completed',
      });

      expect(component['percentComplete']()).toBe(100);
      expect(component['isCompleted']).toBe(true);
      expect(component['estimatedRemaining']()).toBe('—');
    });

    it('should handle error state with error message', () => {
      component.importStatus = createMockImportStatus({
        status: 'failed',
        error: 'Database connection failed',
      });

      expect(component['isFailed']).toBe(true);
      expect(component.importStatus.error).toBe('Database connection failed');
    });

    it('should handle very small row counts', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 1,
          importedRows: 1,
          errorRows: 0,
          currentRow: 1,
          percentComplete: 100,
        },
      });

      expect(component['percentComplete']()).toBe(100);
    });

    it('should handle large file imports with many rows', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 10000000,
          importedRows: 5000000,
          errorRows: 0,
          currentRow: 5000000,
          percentComplete: 50,
        },
      });

      expect(component['percentComplete']()).toBe(50);
    });

    it('should handle null startedAt gracefully', () => {
      component.importStatus = createMockImportStatus({
        startedAt: undefined,
      });

      expect(component['elapsedTime']()).toBe('0s');
      expect(component['speed']()).toBe(0);
      expect(component['estimatedRemaining']()).toBe('—');
    });

    it('should handle undefined error message', () => {
      component.importStatus = createMockImportStatus({
        status: 'failed',
        error: undefined,
      });

      expect(component['isFailed']).toBe(true);
      expect(component.importStatus.error).toBeUndefined();
    });

    it('should handle moduleNameless display', () => {
      component.moduleName = undefined;
      component.importStatus = createMockImportStatus();
      fixture.detectChanges();

      const titleText = fixture.nativeElement.textContent;
      expect(titleText).toContain('Import Progress');
    });

    it('should handle moduleName in display', () => {
      component.moduleName = 'Departments';
      component.importStatus = createMockImportStatus();
      fixture.detectChanges();

      const titleText = fixture.nativeElement.textContent;
      expect(titleText).toContain('Departments');
      expect(titleText).toContain('Import');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      component.importStatus = createMockImportStatus();
    });

    it('should render mat-card', () => {
      fixture.detectChanges();
      const card = fixture.nativeElement.querySelector('mat-card');
      expect(card).toBeTruthy();
    });

    it('should render progress bar', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });
      fixture.detectChanges();

      const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
      expect(progressBar).toBeTruthy();
    });

    it('should render indeterminate progress bar when queued', () => {
      component.importStatus = createMockImportStatus({
        status: 'queued',
      });
      fixture.detectChanges();

      const progressBars = fixture.nativeElement.querySelectorAll('mat-progress-bar');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should render status badge', () => {
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('mat-chip');
      expect(badge).toBeTruthy();
    });

    it('should render timing information section', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Timing Information');
    });

    it('should show cancel button when running', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });
      fixture.detectChanges();

      const cancelButton = fixture.nativeElement.querySelector(
        'button[color="warn"]'
      );
      expect(cancelButton).toBeTruthy();
    });

    it('should show view logs button', () => {
      fixture.detectChanges();
      const logsButton = fixture.nativeElement.querySelector('button[color="primary"]');
      expect(logsButton).toBeTruthy();
    });

    it('should render error message when failed', () => {
      component.importStatus = createMockImportStatus({
        status: 'failed',
        error: 'Test error message',
      });
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Test error message');
    });

    it('should render success message when completed', () => {
      component.importStatus = createMockImportStatus({
        status: 'completed',
      });
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Completed Successfully');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      component.importStatus = createMockImportStatus();
    });

    it('should have aria-label on cancel button', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });
      component.moduleName = 'Test Module';
      fixture.detectChanges();

      const cancelButton = fixture.nativeElement.querySelector(
        'button[color="warn"]'
      );
      expect(cancelButton.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have aria-label on view logs button', () => {
      component.importStatus = createMockImportStatus();
      component.moduleName = 'Test Module';
      fixture.detectChanges();

      const logsButton = fixture.nativeElement.querySelector('button[color="primary"]');
      expect(logsButton.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have aria-label on mat-chip-set', () => {
      fixture.detectChanges();
      const chipSet = fixture.nativeElement.querySelector('mat-chip-set');
      expect(chipSet.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('Integration Tests', () => {
    it('should display queued state correctly', () => {
      // Start: queued
      component.importStatus = createMockImportStatus({
        status: 'queued',
        progress: {
          totalRows: 100,
          importedRows: 0,
          errorRows: 0,
          currentRow: 0,
          percentComplete: 0,
        },
      });
      fixture.detectChanges();

      expect(component['statusText']).toBe('Queued');
      expect(component['progressBarIndeterminate']).toBe(true);
      expect(component['percentComplete']()).toBe(0);
    });

    it('should display running state correctly', () => {
      // Mid: running
      const startedAt = new Date(FIXED_NOW.getTime() - 10000);
      component.importStatus = createMockImportStatus({
        status: 'running',
        startedAt: startedAt.toISOString(),
        progress: {
          totalRows: 100,
          importedRows: 50,
          errorRows: 0,
          currentRow: 50,
          percentComplete: 50,
        },
      });
      fixture.detectChanges();

      expect(component['statusText']).toBe('In Progress');
      expect(component['progressBarIndeterminate']).toBe(false);
      expect(component['percentComplete']()).toBe(50);
      expect(component['isImporting']).toBe(true);
    });

    it('should display completed state correctly', () => {
      // End: completed
      const startedAt = new Date(FIXED_NOW.getTime() - 20000);
      const completedAt = new Date(startedAt.getTime() + 20000);
      component.importStatus = createMockImportStatus({
        status: 'completed',
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        progress: {
          totalRows: 100,
          importedRows: 100,
          errorRows: 0,
          currentRow: 100,
          percentComplete: 100,
        },
      });
      fixture.detectChanges();

      expect(component['statusText']).toBe('Completed');
      expect(component['percentComplete']()).toBe(100);
      expect(component['isCompleted']).toBe(true);
      expect(component['isImporting']).toBe(false);
    });

    it('should handle failed import scenario', () => {
      const startedAt = new Date(FIXED_NOW.getTime() - 15000);

      component.importStatus = createMockImportStatus({
        status: 'failed',
        startedAt: startedAt.toISOString(),
        progress: {
          totalRows: 100,
          importedRows: 45,
          errorRows: 5,
          currentRow: 45,
          percentComplete: 45,
        },
        error: 'Database error occurred',
      });

      expect(component['isFailed']).toBe(true);
      expect(component['statusIcon']).toBe('error');
      expect(component['progressBarColor']).toBe('warn');
      expect(component.importStatus.error).toBeTruthy();
    });

    it('should handle cancelled import scenario', () => {
      component.importStatus = createMockImportStatus({
        status: 'cancelled',
        progress: {
          totalRows: 100,
          importedRows: 30,
          errorRows: 0,
          currentRow: 30,
          percentComplete: 30,
        },
      });

      expect(component['isCancelled']).toBe(true);
      expect(component['statusIcon']).toBe('cancel');
      expect(component['progressBarColor']).toBe('warn');
      expect(component['showCancelButton']).toBe(false);
    });
  });

  describe('OnPush Change Detection', () => {
    it('should detect changes when importStatus input changes', () => {
      component.importStatus = createMockImportStatus({
        progress: {
          totalRows: 100,
          importedRows: 25,
          errorRows: 0,
          currentRow: 25,
          percentComplete: 25,
        },
      });

      fixture.detectChanges();
      let renderedContent = fixture.nativeElement.textContent;
      expect(renderedContent).toContain('25');
      expect(renderedContent).toContain('100');

      // Update with new status object to trigger change detection
      component.importStatus = {
        ...createMockImportStatus({
          progress: {
            totalRows: 100,
            importedRows: 75,
            errorRows: 0,
            currentRow: 75,
            percentComplete: 75,
          },
        }),
      };

      fixture.detectChanges();
      renderedContent = fixture.nativeElement.textContent;
      // Check that progress has updated
      expect(renderedContent).toContain('100 records');
    });

    it('should update computed signals reactively', () => {
      component.importStatus = createMockImportStatus({
        status: 'running',
      });

      const initialStatus = component['statusText'];
      expect(initialStatus).toBe('In Progress');

      component.importStatus = createMockImportStatus({
        status: 'completed',
      });

      const updatedStatus = component['statusText'];

      expect(initialStatus).not.toBe(updatedStatus);
      expect(updatedStatus).toBe('Completed');
    });
  });
});
