import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { AxCalendarEvent, AxCalendarDateRange } from './ax-calendar.component';

/**
 * API Response format for events
 */
export interface AxCalendarEventResponse {
  id: string;
  title: string;
  start: string;
  end?: string;
  all_day?: boolean;
  color?: string;
  description?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * API Response wrapper
 */
export interface AxCalendarApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

/**
 * Create/Update event payload
 */
export interface AxCalendarEventPayload {
  title: string;
  start: string;
  end?: string;
  all_day?: boolean;
  color?: string;
  description?: string;
  location?: string;
  [key: string]: unknown;
}

/**
 * Service state
 */
interface AxCalendarState {
  events: AxCalendarEvent[];
  loading: boolean;
  error: string | null;
  currentDateRange: AxCalendarDateRange | null;
}

/**
 * AegisX Calendar Service
 *
 * Manages calendar events with API integration.
 * Uses signals for reactive state management.
 *
 * @example
 * ```typescript
 * // In your component
 * export class MyCalendarComponent {
 *   private calendarService = inject(AxCalendarService.forEndpoint('/api/events'));
 *
 *   events = this.calendarService.events;
 *   loading = this.calendarService.loading;
 *
 *   onDatesChange(range: AxCalendarDateRange) {
 *     this.calendarService.fetchEvents(range);
 *   }
 *
 *   createEvent(data: AxDateSelectEvent) {
 *     this.calendarService.createEvent({
 *       title: 'New Event',
 *       start: data.start.toISOString(),
 *       end: data.end.toISOString(),
 *       all_day: data.allDay,
 *     });
 *   }
 * }
 * ```
 */
@Injectable()
export class AxCalendarService {
  private _apiEndpoint = '';

  // State signals
  private _state = signal<AxCalendarState>({
    events: [],
    loading: false,
    error: null,
    currentDateRange: null,
  });

  // Computed selectors
  readonly events = computed(() => this._state().events);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly currentDateRange = computed(() => this._state().currentDateRange);

  private readonly http = inject(HttpClient);

  /**
   * Configure the API endpoint
   */
  setEndpoint(endpoint: string): void {
    this._apiEndpoint = endpoint;
  }

  /**
   * Factory method to create a configured service instance
   */
  static forEndpoint(
    endpoint: string,
  ): (http: HttpClient) => AxCalendarService {
    return (http: HttpClient) => {
      const service = new AxCalendarService(http);
      service.setEndpoint(endpoint);
      return service;
    };
  }

  /**
   * Fetch events for a date range
   */
  fetchEvents(dateRange: AxCalendarDateRange): Observable<AxCalendarEvent[]> {
    this.setLoading(true);
    this.setError(null);
    this.setDateRange(dateRange);

    const params = new HttpParams()
      .set('start', dateRange.start.toISOString())
      .set('end', dateRange.end.toISOString());

    return this.http
      .get<
        | AxCalendarApiResponse<AxCalendarEventResponse[]>
        | AxCalendarEventResponse[]
      >(this._apiEndpoint, { params })
      .pipe(
        map((response) => this.transformResponse(response)),
        tap((events) => this.setEvents(events)),
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setError(error.message || 'Failed to fetch events');
          this.setLoading(false);
          return of([]);
        }),
      );
  }

  /**
   * Create a new event
   */
  createEvent(
    payload: AxCalendarEventPayload,
  ): Observable<AxCalendarEvent | null> {
    this.setLoading(true);
    this.setError(null);

    return this.http
      .post<
        AxCalendarApiResponse<AxCalendarEventResponse> | AxCalendarEventResponse
      >(this._apiEndpoint, payload)
      .pipe(
        map((response) => this.transformSingleResponse(response)),
        tap((event) => {
          if (event) {
            this.addEvent(event);
          }
          this.setLoading(false);
        }),
        catchError((error) => {
          this.setError(error.message || 'Failed to create event');
          this.setLoading(false);
          return of(null);
        }),
      );
  }

  /**
   * Update an existing event
   */
  updateEvent(
    id: string,
    payload: Partial<AxCalendarEventPayload>,
  ): Observable<AxCalendarEvent | null> {
    this.setLoading(true);
    this.setError(null);

    return this.http
      .patch<
        AxCalendarApiResponse<AxCalendarEventResponse> | AxCalendarEventResponse
      >(`${this._apiEndpoint}/${id}`, payload)
      .pipe(
        map((response) => this.transformSingleResponse(response)),
        tap((event) => {
          if (event) {
            this.updateLocalEvent(event);
          }
          this.setLoading(false);
        }),
        catchError((error) => {
          this.setError(error.message || 'Failed to update event');
          this.setLoading(false);
          return of(null);
        }),
      );
  }

  /**
   * Delete an event
   */
  deleteEvent(id: string): Observable<boolean> {
    this.setLoading(true);
    this.setError(null);

    return this.http.delete(`${this._apiEndpoint}/${id}`).pipe(
      tap(() => {
        this.removeLocalEvent(id);
        this.setLoading(false);
      }),
      map(() => true),
      catchError((error) => {
        this.setError(error.message || 'Failed to delete event');
        this.setLoading(false);
        return of(false);
      }),
    );
  }

  /**
   * Move an event (update start/end times)
   * Useful for drag & drop
   */
  moveEvent(
    id: string,
    start: Date,
    end?: Date,
    allDay?: boolean,
  ): Observable<AxCalendarEvent | null> {
    const payload: Partial<AxCalendarEventPayload> = {
      start: start.toISOString(),
    };

    if (end) {
      payload.end = end.toISOString();
    }

    if (allDay !== undefined) {
      payload.all_day = allDay;
    }

    return this.updateEvent(id, payload);
  }

  /**
   * Refresh events for the current date range
   */
  refresh(): Observable<AxCalendarEvent[]> {
    const currentRange = this._state().currentDateRange;
    if (currentRange) {
      return this.fetchEvents(currentRange);
    }
    return of([]);
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this._state.update((state) => ({
      ...state,
      events: [],
    }));
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.setError(null);
  }

  // =========================================================================
  // Local State Updates
  // =========================================================================

  /**
   * Set events in state
   */
  setEvents(events: AxCalendarEvent[]): void {
    this._state.update((state) => ({
      ...state,
      events,
    }));
  }

  /**
   * Add a single event to state
   */
  addEvent(event: AxCalendarEvent): void {
    this._state.update((state) => ({
      ...state,
      events: [...state.events, event],
    }));
  }

  /**
   * Update an event in state
   */
  updateLocalEvent(event: AxCalendarEvent): void {
    this._state.update((state) => ({
      ...state,
      events: state.events.map((e) => (e.id === event.id ? event : e)),
    }));
  }

  /**
   * Remove an event from state
   */
  removeLocalEvent(id: string): void {
    this._state.update((state) => ({
      ...state,
      events: state.events.filter((e) => e.id !== id),
    }));
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  private setLoading(loading: boolean): void {
    this._state.update((state) => ({
      ...state,
      loading,
    }));
  }

  private setError(error: string | null): void {
    this._state.update((state) => ({
      ...state,
      error,
    }));
  }

  private setDateRange(dateRange: AxCalendarDateRange): void {
    this._state.update((state) => ({
      ...state,
      currentDateRange: dateRange,
    }));
  }

  /**
   * Transform API response to internal format
   */
  private transformResponse(
    response:
      | AxCalendarApiResponse<AxCalendarEventResponse[]>
      | AxCalendarEventResponse[],
  ): AxCalendarEvent[] {
    const data = Array.isArray(response) ? response : response.data;
    return data.map((item) => this.transformEventResponse(item));
  }

  /**
   * Transform single API response
   */
  private transformSingleResponse(
    response:
      | AxCalendarApiResponse<AxCalendarEventResponse>
      | AxCalendarEventResponse,
  ): AxCalendarEvent {
    // Type guard to check if it's an API response wrapper
    const isWrappedResponse = (
      r:
        | AxCalendarApiResponse<AxCalendarEventResponse>
        | AxCalendarEventResponse,
    ): r is AxCalendarApiResponse<AxCalendarEventResponse> => {
      return (
        'data' in r &&
        typeof (r as AxCalendarApiResponse<AxCalendarEventResponse>).data ===
          'object'
      );
    };

    const data: AxCalendarEventResponse = isWrappedResponse(response)
      ? response.data
      : response;
    return this.transformEventResponse(data);
  }

  /**
   * Transform API event to internal format
   */
  private transformEventResponse(
    item: AxCalendarEventResponse,
  ): AxCalendarEvent {
    return {
      id: item.id,
      title: item.title,
      start: item.start,
      end: item.end,
      allDay: item.all_day,
      color: this.mapColorToAxColor(item.color),
      extendedProps: {
        description: item.description,
        location: item.location,
        created_at: item.created_at,
        updated_at: item.updated_at,
      },
    };
  }

  /**
   * Map API color string to AxCalendarEvent color type
   */
  private mapColorToAxColor(color?: string): AxCalendarEvent['color'] {
    const colorMap: Record<string, AxCalendarEvent['color']> = {
      primary: 'primary',
      success: 'success',
      warning: 'warning',
      danger: 'danger',
      error: 'danger',
      info: 'info',
      secondary: 'secondary',
      gray: 'secondary',
      green: 'success',
      yellow: 'warning',
      red: 'danger',
      blue: 'info',
    };

    return color ? colorMap[color.toLowerCase()] || 'primary' : 'primary';
  }
}

/**
 * Provider factory for creating configured calendar service
 *
 * @example
 * ```typescript
 * // In your component providers
 * providers: [
 *   provideAxCalendarService('/api/calendar/events')
 * ]
 * ```
 */
export function provideAxCalendarService(endpoint: string) {
  return {
    provide: AxCalendarService,
    useFactory: (http: HttpClient) => {
      const service = new AxCalendarService(http);
      service.setEndpoint(endpoint);
      return service;
    },
    deps: [HttpClient],
  };
}
