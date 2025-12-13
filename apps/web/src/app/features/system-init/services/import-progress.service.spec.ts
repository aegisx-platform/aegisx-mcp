import { TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ImportProgressService } from './import-progress.service';
import { SystemInitService } from './system-init.service';
import type { ImportStatus } from '../types/system-init.types';

// Jest matchers
declare const jest: any;

/**
 * Unit tests for ImportProgressService
 *
 * Tests cover:
 * - Observable return from trackProgress
 * - Caching mechanism with Map keyed by "moduleName:jobId"
 * - Polling interval timing (2000ms)
 * - Error handling with graceful fallback
 * - NgZone integration (runOutsideAngular for optimization)
 * - Cache cleanup via cancelTracking
 * - shareReplay behavior (multicast to multiple subscribers)
 * - takeWhile completion behavior
 */
describe('ImportProgressService', () => {
  let service: ImportProgressService;
  let systemInitService: SystemInitService;
  let ngZone: NgZone;

  // Mock data
  const mockImportStatus: ImportStatus = {
    jobId: 'job-123',
    status: 'queued' as const,
    progress: {
      totalRows: 100,
      importedRows: 0,
      errorRows: 0,
      currentRow: 0,
      percentComplete: 0
    },
    startedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockRunningStatus: ImportStatus = {
    jobId: 'job-123',
    status: 'running' as const,
    progress: {
      totalRows: 100,
      importedRows: 50,
      errorRows: 0,
      currentRow: 50,
      percentComplete: 50
    },
    startedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockCompletedStatus: ImportStatus = {
    jobId: 'job-123',
    status: 'completed' as const,
    progress: {
      totalRows: 100,
      importedRows: 100,
      errorRows: 0,
      currentRow: 100,
      percentComplete: 100
    },
    startedAt: '2024-01-01T00:00:00.000Z',
    completedAt: '2024-01-01T00:01:00.000Z'
  };

  const mockFailedStatus: ImportStatus = {
    jobId: 'job-123',
    status: 'failed' as const,
    progress: {
      totalRows: 100,
      importedRows: 50,
      errorRows: 10,
      currentRow: 60,
      percentComplete: 50
    },
    startedAt: '2024-01-01T00:00:00.000Z',
    error: 'Import failed due to invalid data'
  };

  beforeEach(() => {
    const mockSystemInitService = {
      getImportStatus: (moduleName: string, jobId: string) => of(mockImportStatus)
    };

    TestBed.configureTestingModule({
      providers: [
        ImportProgressService,
        { provide: SystemInitService, useValue: mockSystemInitService }
      ]
    });

    service = TestBed.inject(ImportProgressService);
    systemInitService = TestBed.inject(SystemInitService);
    ngZone = TestBed.inject(NgZone);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty progressPollers Map', () => {
      const progressPollers = (service as any).progressPollers;
      expect(progressPollers).toBeDefined();
      expect(progressPollers instanceof Map).toBe(true);
      expect(progressPollers.size).toBe(0);
    });
  });

  describe('trackProgress - Basic Functionality', () => {
    it('should return an Observable', (done) => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      const result$ = service.trackProgress('inventory', 'job-123');

      expect(result$).toBeDefined();
      expect(result$.subscribe).toBeDefined();

      result$.subscribe({
        next: (status) => {
          expect(status).toBeDefined();
          expect(status.jobId).toBe('job-123');
          done();
        }
      });
    });
  });

  describe('trackProgress - Caching Mechanism', () => {
    it('should cache poller with key "moduleName:jobId"', (done) => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      const observable1$ = service.trackProgress('inventory', 'job-123');
      const progressPollers = (service as any).progressPollers;

      expect(progressPollers.has('inventory:job-123')).toBe(true);

      observable1$.subscribe({
        next: () => {
          done();
        }
      });
    });

    it('should return same Observable instance if already tracking', (done) => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      const observable1$ = service.trackProgress('inventory', 'job-123');
      const observable2$ = service.trackProgress('inventory', 'job-123');

      expect(observable1$).toBe(observable2$);
      done();
    });

    it('should cache multiple pollers with different keys', (done) => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      service.trackProgress('inventory', 'job-1');
      service.trackProgress('inventory', 'job-2');
      service.trackProgress('hr', 'job-1');

      const progressPollers = (service as any).progressPollers;

      expect(progressPollers.size).toBe(3);
      expect(progressPollers.has('inventory:job-1')).toBe(true);
      expect(progressPollers.has('inventory:job-2')).toBe(true);
      expect(progressPollers.has('hr:job-1')).toBe(true);

      done();
    });

    it('should use module name and job ID for cache key', (done) => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      const observable1$ = service.trackProgress('drugs', 'abc-xyz-789');
      const progressPollers = (service as any).progressPollers;

      expect(progressPollers.has('drugs:abc-xyz-789')).toBe(true);

      observable1$.subscribe({
        next: () => {
          done();
        }
      });
    });
  });

  describe('trackProgress - Error Handling', () => {
    it('should not throw error on getImportStatus failure', (done) => {
      const error = new Error('Network error');
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(throwError(() => error));

      let errorThrown = false;
      let completionStatus: ImportStatus | undefined;

      service.trackProgress('inventory', 'job-123').subscribe({
        next: (status) => {
          completionStatus = status;
        },
        error: () => {
          errorThrown = true;
        },
        complete: () => {
          expect(errorThrown).toBe(false);
          expect(completionStatus).toBeDefined();
          done();
        }
      });
    });

    it('should return failed status object on error', (done) => {
      const error = new Error('Fetch error');
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(throwError(() => error));

      let receivedFailedStatus: ImportStatus | undefined;

      service.trackProgress('inventory', 'job-123').subscribe({
        next: (status) => {
          if (status.status === 'failed') {
            receivedFailedStatus = status;
          }
        },
        complete: () => {
          expect(receivedFailedStatus).toBeDefined();
          expect(receivedFailedStatus?.status).toBe('failed');
          expect(receivedFailedStatus?.jobId).toBe('job-123');
          expect(receivedFailedStatus?.error).toBeDefined();
          done();
        }
      });
    });

    it('should include error message from response in failed status', (done) => {
      const error = { error: { message: 'Invalid import file' } };
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(throwError(() => error));

      let receivedError: string | undefined;

      service.trackProgress('inventory', 'job-123').subscribe({
        next: (status) => {
          if (status.status === 'failed') {
            receivedError = status.error;
          }
        },
        complete: () => {
          expect(receivedError).toBe('Invalid import file');
          done();
        }
      });
    });

    it('should use error.message as fallback if response error unavailable', (done) => {
      const error = new Error('Generic error message');
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(throwError(() => error));

      let receivedError: string | undefined;

      service.trackProgress('inventory', 'job-123').subscribe({
        next: (status) => {
          if (status.status === 'failed') {
            receivedError = status.error;
          }
        },
        complete: () => {
          expect(receivedError).toBe('Generic error message');
          done();
        }
      });
    });

    it('should use default error message if both error sources unavailable', (done) => {
      const error = {}; // No message property
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(throwError(() => error));

      let receivedError: string | undefined;

      service.trackProgress('inventory', 'job-123').subscribe({
        next: (status) => {
          if (status.status === 'failed') {
            receivedError = status.error;
          }
        },
        complete: () => {
          expect(receivedError).toBe('Failed to fetch import status');
          done();
        }
      });
    });

    it('should set correct progress data in failed status', (done) => {
      const error = new Error('Network error');
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(throwError(() => error));

      let receivedStatus: ImportStatus | undefined;

      service.trackProgress('inventory', 'job-123').subscribe({
        next: (status) => {
          if (status.status === 'failed') {
            receivedStatus = status;
          }
        },
        complete: () => {
          expect(receivedStatus?.progress.totalRows).toBe(0);
          expect(receivedStatus?.progress.importedRows).toBe(0);
          expect(receivedStatus?.progress.errorRows).toBe(0);
          expect(receivedStatus?.progress.currentRow).toBe(0);
          expect(receivedStatus?.progress.percentComplete).toBe(0);
          done();
        }
      });
    });
  });

  describe('trackProgress - NgZone Integration', () => {
    it('should call ngZone.runOutsideAngular', (done) => {
      const ngZoneOutsideSpy = jest.spyOn(ngZone, 'runOutsideAngular');
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      service.trackProgress('inventory', 'job-123');

      expect(ngZoneOutsideSpy).toHaveBeenCalled();
      done();
    });

    it('should run polling outside Angular zone for performance', (done) => {
      const ngZoneOutsideSpy = jest.spyOn(ngZone, 'runOutsideAngular');
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      service.trackProgress('inventory', 'job-123').subscribe({
        next: () => {
          expect(ngZoneOutsideSpy).toHaveBeenCalled();
          done();
        }
      });
    });

    it('should run status check back in Angular zone', (done) => {
      const ngZoneRunSpy = jest.spyOn(ngZone, 'run');
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      service.trackProgress('inventory', 'job-123').subscribe({
        next: () => {
          expect(ngZoneRunSpy).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('trackProgress - shareReplay Behavior', () => {
    it('should share values among multiple subscribers', () => {
      const values1: ImportStatus[] = [];
      const values2: ImportStatus[] = [];

      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockRunningStatus));

      const poller$ = service.trackProgress('inventory', 'job-123');

      poller$.subscribe({
        next: (status) => {
          values1.push(status);
        }
      });

      poller$.subscribe({
        next: (status) => {
          values2.push(status);
        }
      });

      // Both subscribers should have received at least one emission
      expect(values1.length).toBeGreaterThan(0);
      expect(values2.length).toBeGreaterThan(0);
    });

    it('should replay last value to new subscribers', () => {
      const values1: ImportStatus[] = [];
      const values2: ImportStatus[] = [];

      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockRunningStatus));

      const poller$ = service.trackProgress('inventory', 'job-123');

      poller$.subscribe({
        next: (status) => {
          values1.push(status);
        }
      });

      // Subscribe again after first subscription
      poller$.subscribe({
        next: (status) => {
          values2.push(status);
        }
      });

      // Second subscriber should replay the cached value
      expect(values2.length).toBeGreaterThan(0);
      expect(values2[0].jobId).toBe('job-123');
    });
  });

  describe('trackProgress - takeWhile Completion', () => {
    it('should emit completed status when polling reaches completion', (done) => {
      const statusSequence = [mockImportStatus, mockRunningStatus, mockCompletedStatus];
      let callCount = 0;

      jest.spyOn(systemInitService, 'getImportStatus').mockImplementation(() => {
        const status = statusSequence[Math.min(callCount, statusSequence.length - 1)];
        callCount++;
        return of(status);
      });

      const receivedStatuses: ImportStatus[] = [];

      service.trackProgress('inventory', 'job-123').subscribe({
        next: (status) => {
          receivedStatuses.push(status);
        },
        complete: () => {
          const hasCompleted = receivedStatuses.some(s => s.status === 'completed');
          expect(hasCompleted).toBe(true);
          done();
        }
      });
    });

    it('should handle failed status from server', (done) => {
      const statusSequence = [
        mockImportStatus,
        mockRunningStatus,
        mockFailedStatus
      ];
      let callCount = 0;

      jest.spyOn(systemInitService, 'getImportStatus').mockImplementation(() => {
        const status = statusSequence[Math.min(callCount, statusSequence.length - 1)];
        callCount++;
        return of(status);
      });

      let finalStatus: ImportStatus | undefined;

      service.trackProgress('inventory', 'job-123').subscribe({
        next: (status) => {
          finalStatus = status;
        },
        complete: () => {
          expect(finalStatus?.status).toBe('failed');
          expect(finalStatus?.error).toBeDefined();
          done();
        }
      });
    });
  });

  describe('cancelTracking Method', () => {
    it('should remove poller from cache', (done) => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      service.trackProgress('inventory', 'job-123');
      const progressPollers = (service as any).progressPollers;

      expect(progressPollers.has('inventory:job-123')).toBe(true);

      service.cancelTracking('inventory', 'job-123');

      expect(progressPollers.has('inventory:job-123')).toBe(false);
      done();
    });

    it('should use correct cache key for removal', (done) => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      service.trackProgress('inventory', 'job-1');
      service.trackProgress('inventory', 'job-2');

      service.cancelTracking('inventory', 'job-1');

      const progressPollers = (service as any).progressPollers;

      expect(progressPollers.has('inventory:job-1')).toBe(false);
      expect(progressPollers.has('inventory:job-2')).toBe(true);
      done();
    });

    it('should allow retracking after cancellation', (done) => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      const obs1 = service.trackProgress('inventory', 'job-123');
      service.cancelTracking('inventory', 'job-123');
      const obs2 = service.trackProgress('inventory', 'job-123');

      expect(obs1).not.toBe(obs2);
      done();
    });

    it('should handle cancellation for non-existent tracker', (done) => {
      expect(() => {
        service.cancelTracking('inventory', 'job-nonexistent');
      }).not.toThrow();
      done();
    });

    it('should remove correct tracker with same jobId different module', (done) => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      service.trackProgress('inventory', 'job-123');
      service.trackProgress('hr', 'job-123');

      service.cancelTracking('inventory', 'job-123');

      const progressPollers = (service as any).progressPollers;

      expect(progressPollers.has('inventory:job-123')).toBe(false);
      expect(progressPollers.has('hr:job-123')).toBe(true);
      done();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle multiple parallel tracking sessions', () => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockRunningStatus));

      const tracker1$ = service.trackProgress('inventory', 'job-1');
      const tracker2$ = service.trackProgress('inventory', 'job-2');
      const tracker3$ = service.trackProgress('hr', 'job-3');

      const progressPollers = (service as any).progressPollers;
      expect(progressPollers.size).toBe(3);

      // Verify we can subscribe to all trackers
      tracker1$.subscribe();
      tracker2$.subscribe();
      tracker3$.subscribe();
    });

    it('should handle rapid subscribe/unsubscribe', () => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockRunningStatus));

      const poller$ = service.trackProgress('inventory', 'job-123');
      let count = 0;

      const sub1 = poller$.subscribe(() => count++);
      sub1.unsubscribe();

      const sub2 = poller$.subscribe(() => count++);
      sub2.unsubscribe();

      const sub3 = poller$.subscribe({
        next: () => count++
      });

      // Verify subscriptions work even after unsubscribe
      expect(count).toBeGreaterThan(0);
      sub3.unsubscribe();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty module name', (done) => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      const poller$ = service.trackProgress('', 'job-123');
      const progressPollers = (service as any).progressPollers;

      expect(progressPollers.has(':job-123')).toBe(true);

      poller$.subscribe({
        next: () => {
          done();
        }
      });
    });

    it('should handle very rapid consecutive trackProgress calls', (done) => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      const progressPollers = (service as any).progressPollers;

      service.trackProgress('inventory', 'job-123');
      service.trackProgress('inventory', 'job-123');
      service.trackProgress('inventory', 'job-123');

      expect(progressPollers.size).toBe(1);

      done();
    });
  });

  describe('Memory Management', () => {
    it('should not accumulate pollers without cleanup', (done) => {
      jest.spyOn(systemInitService, 'getImportStatus').mockReturnValue(of(mockImportStatus));

      const progressPollers = (service as any).progressPollers;

      for (let i = 0; i < 10; i++) {
        service.trackProgress('inventory', `job-${i}`);
        service.cancelTracking('inventory', `job-${i}`);
      }

      expect(progressPollers.size).toBe(0);

      done();
    });
  });
});
