import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import {
  CalendarOptions,
  EventClickArg,
  DateSelectArg,
  EventDropArg,
  DatesSetArg,
  EventInput,
} from '@fullcalendar/core';
import { EventResizeDoneArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

/**
 * Calendar Event Interface
 */
export interface AxCalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: Record<string, unknown>;
  editable?: boolean;
  resourceId?: string;
}

/**
 * Date Range for fetching events
 */
export interface AxCalendarDateRange {
  start: Date;
  end: Date;
}

/**
 * Event click event payload
 */
export interface AxEventClickEvent {
  event: AxCalendarEvent;
  jsEvent: MouseEvent;
  el: HTMLElement;
}

/**
 * Date select event payload (for creating new events)
 */
export interface AxDateSelectEvent {
  start: Date;
  end: Date;
  allDay: boolean;
}

/**
 * Event change event payload (drag/resize)
 */
export interface AxEventChangeEvent {
  event: AxCalendarEvent;
  oldEvent?: AxCalendarEvent;
  revert: () => void;
}

/**
 * Calendar View Types
 */
export type AxCalendarView =
  | 'dayGridMonth'
  | 'timeGridWeek'
  | 'timeGridDay'
  | 'listWeek'
  | 'listMonth';

/**
 * AegisX Calendar Component
 *
 * A wrapper around FullCalendar that integrates with AegisX design system.
 *
 * Features:
 * - Month, Week, Day, and List views
 * - Drag and drop events
 * - Event resize
 * - Date selection for creating events
 * - Dark mode support
 * - Responsive design
 *
 * @example
 * ```html
 * <ax-calendar
 *   [events]="events"
 *   [initialView]="'dayGridMonth'"
 *   [editable]="true"
 *   [selectable]="true"
 *   (eventClick)="onEventClick($event)"
 *   (dateSelect)="onDateSelect($event)"
 *   (eventChange)="onEventChange($event)"
 *   (datesChange)="onDatesChange($event)">
 * </ax-calendar>
 * ```
 */
@Component({
  selector: 'ax-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  template: `
    <div class="ax-calendar" [class.ax-calendar--loading]="_loading()">
      @if (_isBrowser()) {
        <full-calendar #calendar [options]="calendarOptions()"></full-calendar>
      }

      @if (_loading()) {
        <div class="ax-calendar__loading-overlay">
          <div class="ax-calendar__spinner"></div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .ax-calendar {
        position: relative;
        min-height: 500px;
        width: 100%;
      }

      .ax-calendar--loading {
        pointer-events: none;
      }

      .ax-calendar__loading-overlay {
        position: absolute;
        inset: 0;
        background-color: rgba(255, 255, 255, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        border-radius: 0.5rem;
      }

      .dark .ax-calendar__loading-overlay {
        background-color: rgba(17, 24, 39, 0.7);
      }

      .ax-calendar__spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--ax-border-default, #e5e7eb);
        border-top-color: var(--ax-primary-default, #6366f1);
        border-radius: 50%;
        animation: ax-calendar-spin 0.8s linear infinite;
      }

      @keyframes ax-calendar-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class AxCalendarComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  /** Calendar reference for programmatic access */
  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;

  // =========================================================================
  // Inputs
  // =========================================================================

  /** Events to display on the calendar */
  @Input() set events(value: AxCalendarEvent[]) {
    this._events.set(value);
  }

  /** Initial view when calendar loads */
  @Input() initialView: AxCalendarView = 'dayGridMonth';

  /** Initial date to display */
  @Input() initialDate?: Date | string;

  /** Allow dragging and resizing events */
  @Input() editable = false;

  /** Allow selecting dates to create events */
  @Input() selectable = false;

  /** Show week numbers */
  @Input() weekNumbers = false;

  /** First day of week (0=Sunday, 1=Monday) */
  @Input() firstDay = 0;

  /** Locale for date formatting */
  @Input() locale = 'en';

  /** Height of the calendar ('auto', number in pixels, or parent element) */
  @Input() height: 'auto' | number | string = 'auto';

  /** Show loading overlay */
  @Input() set isLoading(value: boolean) {
    this._loading.set(value);
  }

  /** Custom header toolbar configuration */
  @Input() headerToolbar: CalendarOptions['headerToolbar'] = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  };

  /** Enable/disable specific views */
  @Input() enabledViews: AxCalendarView[] = [
    'dayGridMonth',
    'timeGridWeek',
    'timeGridDay',
    'listWeek',
  ];

  /** Business hours configuration */
  @Input() businessHours?: CalendarOptions['businessHours'];

  /** Slot duration for time grid views */
  @Input() slotDuration = '00:30:00';

  /** Slot minimum time */
  @Input() slotMinTime = '00:00:00';

  /** Slot maximum time */
  @Input() slotMaxTime = '24:00:00';

  /** Allow all-day events */
  @Input() allDaySlot = true;

  /** Now indicator in time views */
  @Input() nowIndicator = true;

  // =========================================================================
  // Outputs
  // =========================================================================

  /** Emitted when an event is clicked */
  @Output() eventClick = new EventEmitter<AxEventClickEvent>();

  /** Emitted when a date range is selected */
  @Output() dateSelect = new EventEmitter<AxDateSelectEvent>();

  /** Emitted when an event is dragged or resized */
  @Output() eventChange = new EventEmitter<AxEventChangeEvent>();

  /** Emitted when the visible date range changes */
  @Output() datesChange = new EventEmitter<AxCalendarDateRange>();

  /** Emitted when a date is clicked */
  @Output() dateClick = new EventEmitter<{ date: Date; allDay: boolean }>();

  // =========================================================================
  // Internal State
  // =========================================================================

  private _events = signal<AxCalendarEvent[]>([]);
  protected _loading = signal(false);

  /** Check if running in browser - use signal for proper change detection */
  protected _isBrowser = signal(false);

  /** Computed calendar options */
  calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: this.initialView,
    initialDate: this.initialDate,
    headerToolbar: this.headerToolbar,
    events: this.transformEvents(this._events()),
    editable: this.editable,
    selectable: this.selectable,
    selectMirror: true,
    dayMaxEvents: true,
    weekNumbers: this.weekNumbers,
    firstDay: this.firstDay,
    locale: this.locale,
    height: this.height,
    businessHours: this.businessHours,
    slotDuration: this.slotDuration,
    slotMinTime: this.slotMinTime,
    slotMaxTime: this.slotMaxTime,
    allDaySlot: this.allDaySlot,
    nowIndicator: this.nowIndicator,
    eventClick: this.handleEventClick.bind(this),
    select: this.handleDateSelect.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    datesSet: this.handleDatesSet.bind(this),
    dateClick: this.handleDateClick.bind(this),
    eventClassNames: this.getEventClassNames.bind(this),
  }));

  ngOnInit(): void {
    // Set browser flag - this runs after the component is created in browser context
    this._isBrowser.set(isPlatformBrowser(this.platformId));
  }

  // ngOnDestroy not needed - no manual subscriptions

  // =========================================================================
  // Public API
  // =========================================================================

  /**
   * Navigate to a specific date
   */
  gotoDate(date: Date | string): void {
    this.calendarComponent?.getApi()?.gotoDate(date);
  }

  /**
   * Navigate to today
   */
  today(): void {
    this.calendarComponent?.getApi()?.today();
  }

  /**
   * Navigate to previous period
   */
  prev(): void {
    this.calendarComponent?.getApi()?.prev();
  }

  /**
   * Navigate to next period
   */
  next(): void {
    this.calendarComponent?.getApi()?.next();
  }

  /**
   * Change the current view
   */
  changeView(view: AxCalendarView): void {
    this.calendarComponent?.getApi()?.changeView(view);
  }

  /**
   * Get the current view type
   */
  getView(): AxCalendarView | undefined {
    return this.calendarComponent?.getApi()?.view?.type as AxCalendarView;
  }

  /**
   * Get the current date range
   */
  getDateRange(): AxCalendarDateRange | undefined {
    const view = this.calendarComponent?.getApi()?.view;
    if (view) {
      return {
        start: view.activeStart,
        end: view.activeEnd,
      };
    }
    return undefined;
  }

  /**
   * Refetch events (useful after external data changes)
   */
  refetchEvents(): void {
    this.calendarComponent?.getApi()?.refetchEvents();
  }

  /**
   * Add a single event programmatically
   */
  addEvent(event: AxCalendarEvent): void {
    const transformed = this.transformEvents([event]);
    if (transformed.length > 0) {
      this.calendarComponent?.getApi()?.addEvent(transformed[0]);
    }
  }

  /**
   * Remove an event by ID
   */
  removeEvent(eventId: string): void {
    this.calendarComponent?.getApi()?.getEventById(eventId)?.remove();
  }

  /**
   * Update an existing event
   */
  updateEvent(event: AxCalendarEvent): void {
    const existingEvent = this.calendarComponent
      ?.getApi()
      ?.getEventById(event.id);
    if (existingEvent) {
      existingEvent.setProp('title', event.title);
      existingEvent.setStart(event.start);
      if (event.end) {
        existingEvent.setEnd(event.end);
      }
      if (event.allDay !== undefined) {
        existingEvent.setAllDay(event.allDay);
      }
      if (event.extendedProps) {
        existingEvent.setExtendedProp('data', event.extendedProps);
      }
    }
  }

  // =========================================================================
  // Event Handlers
  // =========================================================================

  private handleEventClick(arg: EventClickArg): void {
    const event = this.convertToAxEvent(arg.event);
    this.eventClick.emit({
      event,
      jsEvent: arg.jsEvent,
      el: arg.el,
    });
  }

  private handleDateSelect(arg: DateSelectArg): void {
    this.dateSelect.emit({
      start: arg.start,
      end: arg.end,
      allDay: arg.allDay,
    });
    // Unselect after emitting
    this.calendarComponent?.getApi()?.unselect();
  }

  private handleEventDrop(arg: EventDropArg): void {
    const event = this.convertToAxEvent(arg.event);
    const oldEvent = arg.oldEvent
      ? this.convertToAxEvent(arg.oldEvent)
      : undefined;
    this.eventChange.emit({
      event,
      oldEvent,
      revert: arg.revert,
    });
  }

  private handleEventResize(arg: EventResizeDoneArg): void {
    const event = this.convertToAxEvent(arg.event);
    const oldEvent = arg.oldEvent
      ? this.convertToAxEvent(arg.oldEvent)
      : undefined;
    this.eventChange.emit({
      event,
      oldEvent,
      revert: arg.revert,
    });
  }

  private handleDatesSet(arg: DatesSetArg): void {
    this.datesChange.emit({
      start: arg.start,
      end: arg.end,
    });
  }

  private handleDateClick(arg: { date: Date; allDay: boolean }): void {
    this.dateClick.emit({
      date: arg.date,
      allDay: arg.allDay,
    });
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Transform AX events to FullCalendar format
   */
  private transformEvents(events: AxCalendarEvent[]): EventInput[] {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      textColor: event.textColor,
      editable: event.editable,
      extendedProps: {
        color: event.color,
        ...event.extendedProps,
      },
    }));
  }

  /**
   * Convert FullCalendar event back to AX format
   */
  private convertToAxEvent(fcEvent: EventClickArg['event']): AxCalendarEvent {
    return {
      id: fcEvent.id,
      title: fcEvent.title,
      start: fcEvent.start || new Date(),
      end: fcEvent.end || undefined,
      allDay: fcEvent.allDay,
      color: fcEvent.extendedProps?.['color'],
      backgroundColor: fcEvent.backgroundColor,
      borderColor: fcEvent.borderColor,
      textColor: fcEvent.textColor,
      extendedProps: fcEvent.extendedProps,
      editable: fcEvent.startEditable,
    };
  }

  /**
   * Get CSS class names for events based on color
   */
  private getEventClassNames(arg: {
    event: { extendedProps?: Record<string, unknown> };
  }): string[] {
    const classes: string[] = [];
    const color = arg.event.extendedProps?.['color'] as string | undefined;

    if (color) {
      classes.push(`fc-event-${color}`);
    }

    return classes;
  }
}
