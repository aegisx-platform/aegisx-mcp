import { Injectable } from '@angular/core';
import { Observable, EMPTY, of } from 'rxjs';
import {
  WidgetRealtimeProvider,
  RealtimeConnectionStatus,
} from '../realtime.provider';

/**
 * No-operation implementation of WidgetRealtimeProvider.
 * Used when real-time updates are not needed.
 */
@Injectable()
export class NoopRealtimeProvider implements WidgetRealtimeProvider {
  connectionStatus$ = of<RealtimeConnectionStatus>('disconnected');

  connect(): void {
    // No-op
  }

  disconnect(): void {
    // No-op
  }

  subscribe<T>(_channel: string): Observable<T> {
    return EMPTY;
  }
}
