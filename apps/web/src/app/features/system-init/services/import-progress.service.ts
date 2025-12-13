import { Injectable, NgZone } from '@angular/core';
import { Observable, of } from 'rxjs';
import { interval } from 'rxjs';
import { startWith, switchMap, takeWhile, shareReplay, finalize, catchError } from 'rxjs/operators';
import { SystemInitService } from './system-init.service';
import type { ImportStatus } from '../types/system-init.types';

@Injectable({
  providedIn: 'root'
})
export class ImportProgressService {
  private progressPollers = new Map<string, Observable<ImportStatus>>();

  constructor(
    private systemInitService: SystemInitService,
    private ngZone: NgZone
  ) {}

  /**
   * Poll import status every 2 seconds until completion
   * Handles errors gracefully and returns failed status on failure
   */
  trackProgress(moduleName: string, jobId: string): Observable<ImportStatus> {
    const key = `${moduleName}:${jobId}`;

    if (this.progressPollers.has(key)) {
      return this.progressPollers.get(key)!;
    }

    const poller$ = this.ngZone.runOutsideAngular(() =>
      interval(2000).pipe(
        startWith(0),
        switchMap(() =>
          this.ngZone.run(() =>
            this.systemInitService.getImportStatus(moduleName, jobId)
          )
        ),
        catchError(error => {
          console.error(`Status polling error for ${moduleName}:${jobId}:`, error);
          // Return a failed status instead of propagating error
          return of({
            jobId,
            status: 'failed' as const,
            error: error.error?.message || error.message || 'Failed to fetch import status',
            progress: {
              totalRows: 0,
              importedRows: 0,
              errorRows: 0,
              currentRow: 0,
              percentComplete: 0
            },
            startedAt: new Date().toISOString()
          });
        }),
        takeWhile(status =>
          status.status === 'queued' || status.status === 'running',
          true // Include final value
        ),
        shareReplay(1),
        finalize(() => this.progressPollers.delete(key))
      )
    );

    this.progressPollers.set(key, poller$);
    return poller$;
  }

  /**
   * Cancel tracking for a job
   */
  cancelTracking(moduleName: string, jobId: string): void {
    const key = `${moduleName}:${jobId}`;
    this.progressPollers.delete(key);
  }
}
