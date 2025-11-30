import { Injectable, signal, computed } from '@angular/core';
import {
  Appointment,
  AppointmentCalendarEvent,
  AppointmentFilters,
  AppointmentPurpose,
  AppointmentStatus,
  AppointmentSummary,
  AppointmentView,
  AvailableSlot,
  BlockedDate,
  CapacityInfo,
  DateValidationResult,
  DateValidationChecks,
  Doctor,
  ExaminationRoom,
  FollowUpRequest,
  Patient,
  PreparationTag,
  SlotAvailability,
  SlotConfiguration,
  TimeSlot,
  APPOINTMENT_STATUS_COLORS,
} from '../models/appointment.models';

/**
 * Hospital Appointment Demo Service
 * Mock data service สำหรับ demo ระบบนัดหมายคนไข้
 */
@Injectable()
export class AppointmentDemoService {
  // ==========================================================================
  // Master Data (Signals)
  // ==========================================================================

  private _rooms = signal<ExaminationRoom[]>(this.generateMockRooms());
  private _doctors = signal<Doctor[]>(this.generateMockDoctors());
  private _patients = signal<Patient[]>(this.generateMockPatients());
  private _timeSlots = signal<TimeSlot[]>(this.generateMockTimeSlots());
  private _purposes = signal<AppointmentPurpose[]>(this.generateMockPurposes());
  private _preparations = signal<PreparationTag[]>(
    this.generateMockPreparations(),
  );
  private _appointments = signal<Appointment[]>(
    this.generateMockAppointments(),
  );
  private _blockedDates = signal<BlockedDate[]>(
    this.generateMockBlockedDates(),
  );
  private _slotConfigs = signal<SlotConfiguration[]>(
    this.generateMockSlotConfigs(),
  );

  // Public readonly computed
  readonly rooms = computed(() => this._rooms().filter((r) => r.isActive));
  readonly doctors = computed(() => this._doctors().filter((d) => d.isActive));
  readonly patients = computed(() => this._patients());
  readonly timeSlots = computed(() => this._timeSlots());
  readonly purposes = computed(() => this._purposes());
  readonly preparations = computed(() => this._preparations());
  readonly appointments = computed(() => this._appointments());
  readonly blockedDates = computed(() => this._blockedDates());
  readonly slotConfigs = computed(() =>
    this._slotConfigs().filter((c) => c.isActive),
  );

  // Loading state
  private _loading = signal(false);
  readonly loading = computed(() => this._loading());

  // Selected date for calendar
  private _selectedDate = signal<Date>(new Date());
  readonly selectedDate = computed(() => this._selectedDate());

  // ==========================================================================
  // Computed Views
  // ==========================================================================

  /**
   * Get appointments with resolved relations
   */
  readonly appointmentViews = computed<AppointmentView[]>(() => {
    const appointments = this._appointments();
    return appointments.map((apt) => this.resolveAppointment(apt));
  });

  /**
   * Get calendar events for AxCalendar (individual appointments)
   */
  readonly calendarEvents = computed<AppointmentCalendarEvent[]>(() => {
    const views = this.appointmentViews();
    return views
      .filter((apt) => apt.status !== 'cancelled')
      .map((apt) => this.toCalendarEvent(apt));
  });

  /**
   * Get calendar summary events (1 event per day showing count)
   * สำหรับแสดง summary แทนรายละเอียดแต่ละนัด
   */
  readonly calendarSummaryEvents = computed(() => {
    const appointments = this._appointments().filter(
      (apt) => apt.status !== 'cancelled',
    );
    const rooms = this._rooms();

    // Group by date
    const byDate = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      const dateKey = new Date(apt.date).toISOString().split('T')[0];
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, []);
      }
      byDate.get(dateKey)!.push(apt);
    });

    // Create summary events
    const summaryEvents: AppointmentCalendarEvent[] = [];

    byDate.forEach((dayApts, dateKey) => {
      const date = new Date(dateKey);
      const total = dayApts.length;

      // Count by room
      const byRoom = new Map<string, number>();
      dayApts.forEach((apt) => {
        byRoom.set(apt.roomId, (byRoom.get(apt.roomId) || 0) + 1);
      });

      // Count by status
      const completed = dayApts.filter((a) => a.status === 'completed').length;
      const confirmed = dayApts.filter((a) => a.status === 'confirmed').length;
      const scheduled = dayApts.filter((a) => a.status === 'scheduled').length;

      // Calculate capacity (assume 50 per room max for demo)
      const totalCapacity = rooms.length * 50;
      const capacityPercent = Math.min(
        100,
        Math.round((total / totalCapacity) * 100),
      );

      // Determine color based on capacity
      let color: 'primary' | 'success' | 'warning' | 'danger' = 'primary';
      if (capacityPercent >= 90) {
        color = 'danger';
      } else if (capacityPercent >= 70) {
        color = 'warning';
      } else if (capacityPercent >= 50) {
        color = 'primary';
      } else {
        color = 'success';
      }

      summaryEvents.push({
        id: `summary-${dateKey}`,
        title: `${total} นัดหมาย`,
        start: date,
        allDay: true,
        color,
        extendedProps: {
          isSummary: true,
          total,
          completed,
          confirmed,
          scheduled,
          capacityPercent,
          byRoom: Object.fromEntries(byRoom),
          date: dateKey,
        },
      });
    });

    return summaryEvents;
  });

  /**
   * Get today's summary
   */
  readonly todaySummary = computed<AppointmentSummary>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.getSummaryForDate(today);
  });

  // ==========================================================================
  // Lookup Methods
  // ==========================================================================

  getRoom(id: string): ExaminationRoom | undefined {
    return this._rooms().find((r) => r.id === id);
  }

  getDoctor(id: string): Doctor | undefined {
    return this._doctors().find((d) => d.id === id);
  }

  getPatient(id: string): Patient | undefined {
    return this._patients().find((p) => p.id === id);
  }

  getTimeSlot(id: string): TimeSlot | undefined {
    return this._timeSlots().find((ts) => ts.id === id);
  }

  getPurpose(id: string): AppointmentPurpose | undefined {
    return this._purposes().find((p) => p.id === id);
  }

  getPreparation(id: string): PreparationTag | undefined {
    return this._preparations().find((p) => p.id === id);
  }

  getDoctorsByRoom(roomId: string): Doctor[] {
    return this._doctors().filter(
      (d) => d.isActive && d.roomIds.includes(roomId),
    );
  }

  // ==========================================================================
  // Patient Search
  // ==========================================================================

  searchPatients(query: string): Patient[] {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return this._patients().filter(
      (p) =>
        p.hn.toLowerCase().includes(lowerQuery) ||
        p.cid.includes(query) ||
        p.firstName.toLowerCase().includes(lowerQuery) ||
        p.lastName.toLowerCase().includes(lowerQuery) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(lowerQuery),
    );
  }

  // ==========================================================================
  // Appointment CRUD
  // ==========================================================================

  createAppointment(
    data: Omit<
      Appointment,
      'id' | 'appointmentNumber' | 'createdAt' | 'createdBy'
    >,
  ): Appointment {
    const newApt: Appointment = {
      ...data,
      id: this.generateId(),
      appointmentNumber: this.generateAppointmentNumber(data.date),
      createdAt: new Date(),
      createdBy: 'demo-user',
    };

    this._appointments.update((apts) => [...apts, newApt]);
    return newApt;
  }

  updateAppointment(
    id: string,
    data: Partial<Appointment>,
  ): Appointment | undefined {
    let updated: Appointment | undefined;

    this._appointments.update((apts) =>
      apts.map((apt) => {
        if (apt.id === id) {
          updated = {
            ...apt,
            ...data,
            updatedAt: new Date(),
            updatedBy: 'demo-user',
          };
          return updated;
        }
        return apt;
      }),
    );

    return updated;
  }

  cancelAppointment(id: string, reason: string): Appointment | undefined {
    return this.updateAppointment(id, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: 'demo-user',
      cancelReason: reason,
    });
  }

  changeStatus(id: string, status: AppointmentStatus): Appointment | undefined {
    return this.updateAppointment(id, { status });
  }

  // ==========================================================================
  // Slot Availability
  // ==========================================================================

  getSlotAvailability(
    date: Date,
    roomId: string,
    doctorId?: string,
  ): SlotAvailability[] {
    const timeSlots = this._timeSlots();
    const appointments = this._appointments();
    const blockedDates = this._blockedDates();
    const configs = this._slotConfigs().filter(
      (c) =>
        c.isActive &&
        c.roomId === roomId &&
        (!doctorId || !c.doctorId || c.doctorId === doctorId),
    );

    // Check if date is blocked
    const blocked = blockedDates.find(
      (bd) =>
        this.isSameDay(bd.date, date) &&
        (!bd.roomId || bd.roomId === roomId) &&
        (!bd.doctorId || bd.doctorId === doctorId),
    );

    return timeSlots.map((ts) => {
      // Count booked appointments for this slot
      const bookedCount = appointments.filter(
        (apt) =>
          this.isSameDay(apt.date, date) &&
          apt.timeSlotId === ts.id &&
          apt.roomId === roomId &&
          (!doctorId || apt.doctorId === doctorId) &&
          apt.status !== 'cancelled',
      ).length;

      // Get config for this slot
      const config = configs.find((c) => c.timeSlotIds.includes(ts.id));
      const totalCapacity = config?.maxAppointmentsPerSlot || 3;

      return {
        timeSlotId: ts.id,
        date,
        roomId,
        doctorId,
        totalCapacity,
        bookedCount,
        availableCount: Math.max(0, totalCapacity - bookedCount),
        isBlocked: !!blocked,
        blockedReason: blocked?.reason,
        canForceBook: blocked?.canForceBook,
      };
    });
  }

  isSlotAvailable(
    date: Date,
    timeSlotId: string,
    roomId: string,
    doctorId?: string,
  ): boolean {
    const availability = this.getSlotAvailability(date, roomId, doctorId);
    const slot = availability.find((s) => s.timeSlotId === timeSlotId);
    return slot ? slot.availableCount > 0 && !slot.isBlocked : false;
  }

  // ==========================================================================
  // Filtering & Summary
  // ==========================================================================

  filterAppointments(filters: AppointmentFilters): AppointmentView[] {
    let result = this.appointmentViews();

    if (filters.dateFrom) {
      result = result.filter((apt) => apt.date >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      result = result.filter((apt) => apt.date <= filters.dateTo!);
    }

    if (filters.roomId) {
      result = result.filter((apt) => apt.roomId === filters.roomId);
    }

    if (filters.doctorId) {
      result = result.filter((apt) => apt.doctorId === filters.doctorId);
    }

    if (filters.status && filters.status.length > 0) {
      result = result.filter((apt) => filters.status!.includes(apt.status));
    }

    if (filters.searchText) {
      const query = filters.searchText.toLowerCase();
      result = result.filter(
        (apt) =>
          apt.patient?.hn.toLowerCase().includes(query) ||
          apt.patient?.cid.includes(query) ||
          apt.patient?.firstName.toLowerCase().includes(query) ||
          apt.patient?.lastName.toLowerCase().includes(query) ||
          apt.appointmentNumber.toLowerCase().includes(query),
      );
    }

    return result;
  }

  getSummaryForDate(date: Date): AppointmentSummary {
    const appointments = this._appointments().filter((apt) =>
      this.isSameDay(apt.date, date),
    );

    const byStatus: Record<AppointmentStatus, number> = {
      scheduled: 0,
      confirmed: 0,
      'checked-in': 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0,
      'no-show': 0,
    };

    const byRoom: Record<string, number> = {};
    const byDoctor: Record<string, number> = {};

    appointments.forEach((apt) => {
      byStatus[apt.status]++;
      byRoom[apt.roomId] = (byRoom[apt.roomId] || 0) + 1;
      byDoctor[apt.doctorId] = (byDoctor[apt.doctorId] || 0) + 1;
    });

    return {
      date,
      total: appointments.length,
      byStatus,
      byRoom,
      byDoctor,
    };
  }

  // ==========================================================================
  // Blocked Dates / Holidays
  // ==========================================================================

  addBlockedDate(data: Omit<BlockedDate, 'id'>): BlockedDate {
    const newBlocked: BlockedDate = {
      ...data,
      id: this.generateId(),
    };
    this._blockedDates.update((dates) => [...dates, newBlocked]);
    return newBlocked;
  }

  removeBlockedDate(id: string): void {
    this._blockedDates.update((dates) => dates.filter((d) => d.id !== id));
  }

  isDateBlocked(
    date: Date,
    roomId?: string,
    doctorId?: string,
  ): BlockedDate | undefined {
    return this._blockedDates().find(
      (bd) =>
        this.isSameDay(bd.date, date) &&
        (!bd.roomId || !roomId || bd.roomId === roomId) &&
        (!bd.doctorId || !doctorId || bd.doctorId === doctorId),
    );
  }

  // ==========================================================================
  // Quick Follow-up Booking Methods
  // ==========================================================================

  /**
   * Find available date for follow-up booking
   * หาวันว่างสำหรับนัด follow-up โดย skip วันหยุด/เสาร์-อาทิตย์/วันลา
   */
  findAvailableDate(request: FollowUpRequest): DateValidationResult {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = this.addDays(today, request.targetDays);

    // Search forward up to 14 days from target
    for (let offset = 0; offset <= 14; offset++) {
      const checkDate = this.addDays(targetDate, offset);
      const validation = this.validateDate(checkDate, request);

      if (request.includeHolidays) {
        // If including holidays, only check capacity
        if (
          validation.checks.roomCapacity.available > 0 &&
          validation.checks.doctorCapacity.available > 0
        ) {
          return {
            ...validation,
            isValid: true,
            skippedDays: offset,
            skippedReasons: this.getSkippedReasons(
              targetDate,
              checkDate,
              request,
            ),
          };
        }
      } else {
        // Default: skip weekends, holidays, leaves
        if (
          !validation.checks.isWeekend &&
          !validation.checks.isHoliday &&
          !validation.checks.isDoctorLeave &&
          validation.checks.roomCapacity.available > 0 &&
          validation.checks.doctorCapacity.available > 0
        ) {
          return {
            ...validation,
            isValid: true,
            skippedDays: offset,
            skippedReasons: this.getSkippedReasons(
              targetDate,
              checkDate,
              request,
            ),
          };
        }
      }
    }

    // No available date found
    return {
      isValid: false,
      date: targetDate,
      skippedDays: 0,
      skippedReasons: [],
      checks: this.validateDate(targetDate, request).checks,
      warnings: [],
      errors: ['ไม่พบวันว่างใน 2 สัปดาห์ข้างหน้า'],
    };
  }

  /**
   * Validate a specific date for booking
   * ตรวจสอบวันที่ว่าสามารถจองได้หรือไม่
   */
  validateDate(date: Date, request: FollowUpRequest): DateValidationResult {
    const checks = this.getDateChecks(date, request);
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for warnings/errors
    if (checks.isWeekend) {
      warnings.push('วันเสาร์-อาทิตย์');
    }
    if (checks.isHoliday) {
      warnings.push(`วันหยุด: ${checks.holidayName}`);
    }
    if (checks.isDoctorLeave) {
      warnings.push(`แพทย์ลา: ${checks.leaveReason}`);
    }
    if (checks.roomCapacity.available <= 0) {
      errors.push('ห้องตรวจเต็ม');
    }
    if (checks.doctorCapacity.available <= 0) {
      errors.push('แพทย์นัดเต็ม');
    }
    if (checks.patientExistingAppointment) {
      const apt = checks.patientExistingAppointment;
      warnings.push(
        `คนไข้มีนัดวันที่ ${apt.date.toLocaleDateString('th-TH')} (ห่าง ${apt.daysDifference} วัน)`,
      );
    }

    const isValid =
      errors.length === 0 &&
      (!checks.isWeekend || request.includeHolidays) &&
      (!checks.isHoliday || request.includeHolidays) &&
      (!checks.isDoctorLeave || request.includeHolidays);

    return {
      isValid,
      date,
      skippedDays: 0,
      skippedReasons: [],
      checks,
      warnings,
      errors,
    };
  }

  /**
   * Get all validation checks for a date
   */
  private getDateChecks(
    date: Date,
    request: FollowUpRequest,
  ): DateValidationChecks {
    return {
      isWeekend: this.isWeekendDay(date),
      isHoliday: this.isHolidayDay(date).isHoliday,
      holidayName: this.isHolidayDay(date).name,
      isDoctorLeave: this.isDoctorOnLeaveDay(date, request.doctorId).onLeave,
      leaveReason: this.isDoctorOnLeaveDay(date, request.doctorId).reason,
      roomCapacity: this.getRoomDayCapacity(date, request.roomId),
      doctorCapacity: this.getDoctorDayCapacity(date, request.doctorId),
      patientExistingAppointment: this.getPatientNearestAppointment(
        request.patientId,
        date,
      ),
    };
  }

  /**
   * Get available time slots for a date
   */
  getAvailableTimeSlots(
    date: Date,
    roomId: string,
    doctorId: string,
  ): AvailableSlot[] {
    const timeSlots = this._timeSlots();
    const appointments = this._appointments();

    return timeSlots.map((slot) => {
      const bookedCount = appointments.filter(
        (apt) =>
          this.isSameDay(apt.date, date) &&
          apt.timeSlotId === slot.id &&
          apt.roomId === roomId &&
          apt.doctorId === doctorId &&
          apt.status !== 'cancelled',
      ).length;

      return {
        timeSlotId: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: bookedCount === 0,
      };
    });
  }

  /**
   * Check if date is a weekend
   */
  isWeekendDay(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  /**
   * Check if date is a holiday
   */
  isHolidayDay(date: Date): { isHoliday: boolean; name?: string } {
    const blocked = this._blockedDates().find(
      (bd) => this.isSameDay(bd.date, date) && bd.type === 'holiday',
    );
    return {
      isHoliday: !!blocked,
      name: blocked?.reason,
    };
  }

  /**
   * Check if doctor is on leave
   */
  isDoctorOnLeaveDay(
    date: Date,
    doctorId: string,
  ): { onLeave: boolean; reason?: string } {
    const blocked = this._blockedDates().find(
      (bd) =>
        this.isSameDay(bd.date, date) &&
        bd.type === 'doctor-leave' &&
        bd.doctorId === doctorId,
    );
    return {
      onLeave: !!blocked,
      reason: blocked?.reason,
    };
  }

  /**
   * Get room capacity for a day
   */
  getRoomDayCapacity(date: Date, roomId: string): CapacityInfo {
    const maxPerDay = 300; // Room limit per day
    const appointments = this._appointments();
    const current = appointments.filter(
      (apt) =>
        this.isSameDay(apt.date, date) &&
        apt.roomId === roomId &&
        apt.status !== 'cancelled',
    ).length;

    return {
      current,
      max: maxPerDay,
      available: Math.max(0, maxPerDay - current),
    };
  }

  /**
   * Get doctor capacity for a day
   */
  getDoctorDayCapacity(date: Date, doctorId: string): CapacityInfo {
    const maxPerDay = 50; // Doctor limit per day
    const appointments = this._appointments();
    const current = appointments.filter(
      (apt) =>
        this.isSameDay(apt.date, date) &&
        apt.doctorId === doctorId &&
        apt.status !== 'cancelled',
    ).length;

    return {
      current,
      max: maxPerDay,
      available: Math.max(0, maxPerDay - current),
    };
  }

  /**
   * Get patient's nearest existing appointment to a date
   */
  getPatientNearestAppointment(
    patientId: string,
    targetDate: Date,
  ): { date: Date; daysDifference: number } | undefined {
    const appointments = this._appointments().filter(
      (apt) => apt.patientId === patientId && apt.status !== 'cancelled',
    );

    if (appointments.length === 0) return undefined;

    let nearest: { date: Date; daysDifference: number } | undefined;
    let minDiff = Infinity;

    appointments.forEach((apt) => {
      const diff = Math.abs(
        (new Date(apt.date).getTime() - targetDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (diff < minDiff) {
        minDiff = diff;
        nearest = {
          date: new Date(apt.date),
          daysDifference: Math.round(diff),
        };
      }
    });

    return nearest;
  }

  /**
   * Get patient's all appointments
   */
  getPatientAppointments(patientId: string): AppointmentView[] {
    return this.appointmentViews().filter((apt) => apt.patientId === patientId);
  }

  /**
   * Get reasons for skipped days
   */
  private getSkippedReasons(
    targetDate: Date,
    finalDate: Date,
    request: FollowUpRequest,
  ): string[] {
    const reasons: string[] = [];
    const current = new Date(targetDate);

    while (current < finalDate) {
      if (this.isWeekendDay(current)) {
        reasons.push(
          `${current.toLocaleDateString('th-TH')}: วันหยุดสุดสัปดาห์`,
        );
      } else {
        const holiday = this.isHolidayDay(current);
        if (holiday.isHoliday) {
          reasons.push(
            `${current.toLocaleDateString('th-TH')}: ${holiday.name}`,
          );
        }
        const leave = this.isDoctorOnLeaveDay(current, request.doctorId);
        if (leave.onLeave) {
          reasons.push(
            `${current.toLocaleDateString('th-TH')}: ${leave.reason}`,
          );
        }
      }
      current.setDate(current.getDate() + 1);
    }

    return reasons;
  }

  /**
   * Add days to a date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  private resolveAppointment(apt: Appointment): AppointmentView {
    return {
      ...apt,
      room: this.getRoom(apt.roomId),
      doctor: this.getDoctor(apt.doctorId),
      patient: this.getPatient(apt.patientId),
      timeSlot: this.getTimeSlot(apt.timeSlotId),
      purpose: this.getPurpose(apt.purposeId),
      preparationTags: apt.preparations
        .map((id) => this.getPreparation(id))
        .filter((p): p is PreparationTag => !!p),
    };
  }

  private toCalendarEvent(apt: AppointmentView): AppointmentCalendarEvent {
    const timeSlot = apt.timeSlot;
    const startTime = timeSlot?.startTime || '08:00';
    const endTime = timeSlot?.endTime || '08:30';

    const start = new Date(apt.date);
    const [startHour, startMin] = startTime.split(':').map(Number);
    start.setHours(startHour, startMin, 0, 0);

    const end = new Date(apt.date);
    const [endHour, endMin] = endTime.split(':').map(Number);
    end.setHours(endHour, endMin, 0, 0);

    const patientName = apt.patient
      ? `${apt.patient.firstName} ${apt.patient.lastName}`
      : 'Unknown';
    const doctorName = apt.doctor?.name || '';

    return {
      id: apt.id,
      title: `${patientName} - ${doctorName}`,
      start,
      end,
      allDay: false,
      color: APPOINTMENT_STATUS_COLORS[apt.status],
      backgroundColor: apt.room?.color,
      extendedProps: {
        appointment: apt,
        status: apt.status,
        roomId: apt.roomId,
        doctorId: apt.doctorId,
        patientHN: apt.patient?.hn || '',
      },
    };
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  private generateId(): string {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAppointmentNumber(date: Date): string {
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');
    return `APT-${dateStr}-${seq}`;
  }

  // ==========================================================================
  // Mock Data Generators
  // ==========================================================================

  private generateMockRooms(): ExaminationRoom[] {
    return [
      {
        id: 'room-1',
        code: 'MED01',
        name: 'ห้องตรวจอายุรกรรม 1',
        description: 'ตรวจโรคทั่วไป อายุรกรรม',
        color: '#3b82f6',
        isActive: true,
      },
      {
        id: 'room-2',
        code: 'MED02',
        name: 'ห้องตรวจอายุรกรรม 2',
        description: 'ตรวจโรคทั่วไป อายุรกรรม',
        color: '#6366f1',
        isActive: true,
      },
      {
        id: 'room-3',
        code: 'SUR01',
        name: 'ห้องตรวจศัลยกรรม',
        description: 'ตรวจศัลยกรรมทั่วไป',
        color: '#10b981',
        isActive: true,
      },
      {
        id: 'room-4',
        code: 'ORT01',
        name: 'ห้องตรวจออร์โธปิดิกส์',
        description: 'ตรวจกระดูกและข้อ',
        color: '#f59e0b',
        isActive: true,
      },
      {
        id: 'room-5',
        code: 'ENT01',
        name: 'ห้องตรวจหู คอ จมูก',
        description: 'ตรวจ หู คอ จมูก',
        color: '#ec4899',
        isActive: true,
      },
      {
        id: 'room-6',
        code: 'EYE01',
        name: 'ห้องตรวจตา',
        description: 'ตรวจจักษุ',
        color: '#8b5cf6',
        isActive: true,
      },
    ];
  }

  private generateMockDoctors(): Doctor[] {
    return [
      {
        id: 'doc-1',
        code: 'DR001',
        name: 'นพ.สมชาย ใจดี',
        specialty: 'อายุรกรรม',
        roomIds: ['room-1', 'room-2'],
        isActive: true,
      },
      {
        id: 'doc-2',
        code: 'DR002',
        name: 'พญ.สมหญิง รักษาดี',
        specialty: 'อายุรกรรม',
        roomIds: ['room-1', 'room-2'],
        isActive: true,
      },
      {
        id: 'doc-3',
        code: 'DR003',
        name: 'นพ.วิชัย ศัลยแพทย์',
        specialty: 'ศัลยกรรม',
        roomIds: ['room-3'],
        isActive: true,
      },
      {
        id: 'doc-4',
        code: 'DR004',
        name: 'พญ.มณี กระดูก',
        specialty: 'ออร์โธปิดิกส์',
        roomIds: ['room-4'],
        isActive: true,
      },
      {
        id: 'doc-5',
        code: 'DR005',
        name: 'นพ.ธีระ หูดี',
        specialty: 'หู คอ จมูก',
        roomIds: ['room-5'],
        isActive: true,
      },
      {
        id: 'doc-6',
        code: 'DR006',
        name: 'พญ.แสงจันทร์ ตาสว่าง',
        specialty: 'จักษุ',
        roomIds: ['room-6'],
        isActive: true,
      },
    ];
  }

  private generateMockPatients(): Patient[] {
    const thaiNames = [
      { title: 'นาย', first: 'สมชาย', last: 'มั่นคง' },
      { title: 'นาง', first: 'สมหญิง', last: 'รักดี' },
      { title: 'นางสาว', first: 'สวยงาม', last: 'ใจดี' },
      { title: 'นาย', first: 'มานะ', last: 'พยายาม' },
      { title: 'นาง', first: 'วันดี', last: 'สุขใจ' },
      { title: 'นาย', first: 'ประเสริฐ', last: 'ศักดิ์สิทธิ์' },
      { title: 'นางสาว', first: 'ดาว', last: 'สว่าง' },
      { title: 'นาย', first: 'ธนา', last: 'ร่ำรวย' },
      { title: 'นาง', first: 'มาลี', last: 'ดอกไม้' },
      { title: 'นาย', first: 'สุรชัย', last: 'เข้มแข็ง' },
      { title: 'นางสาว', first: 'รัตนา', last: 'เพชรงาม' },
      { title: 'นาย', first: 'วีระ', last: 'กล้าหาญ' },
      { title: 'นาง', first: 'ศิริพร', last: 'เจริญรุ่ง' },
      { title: 'นาย', first: 'พิชัย', last: 'ชัยชนะ' },
      { title: 'นางสาว', first: 'กัญญา', last: 'สุดสวย' },
      { title: 'นาย', first: 'อนันต์', last: 'ไม่สิ้นสุด' },
      { title: 'นาง', first: 'บุญมี', last: 'โชคดี' },
      { title: 'นาย', first: 'เกรียงไกร', last: 'ยิ่งใหญ่' },
      { title: 'นางสาว', first: 'น้ำฝน', last: 'เย็นใจ' },
      { title: 'นาย', first: 'สมศักดิ์', last: 'ศักดิ์ศรี' },
    ];

    return thaiNames.map((name, i) => ({
      id: `patient-${i + 1}`,
      hn: `HN${(100000 + i).toString()}`,
      cid: `${(1100000000000 + i * 12345).toString()}`,
      title: name.title,
      firstName: name.first,
      lastName: name.last,
      birthDate: new Date(
        1960 + Math.floor(Math.random() * 40),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      ),
      phone: `08${Math.floor(Math.random() * 100000000)
        .toString()
        .padStart(8, '0')}`,
    }));
  }

  private generateMockTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour < 16; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const endMin = min + 30;
        const endHour = endMin >= 60 ? hour + 1 : hour;
        const endTime = `${endHour.toString().padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`;
        const label = `${startTime} - ${endTime}`;
        slots.push({
          id: `slot-${hour}-${min}`,
          startTime,
          endTime,
          label,
        });
      }
    }
    return slots;
  }

  private generateMockPurposes(): AppointmentPurpose[] {
    return [
      {
        id: 'purpose-1',
        code: 'FOLLOWUP',
        name: 'ตรวจติดตาม',
        description: 'นัดติดตามอาการหลังการรักษา',
        defaultPreparations: [],
        estimatedDuration: 15,
      },
      {
        id: 'purpose-2',
        code: 'CHECKUP',
        name: 'ตรวจสุขภาพ',
        description: 'ตรวจสุขภาพประจำปี',
        defaultPreparations: ['prep-1', 'prep-2'],
        estimatedDuration: 30,
      },
      {
        id: 'purpose-3',
        code: 'CONSULT',
        name: 'ปรึกษาแพทย์',
        description: 'ปรึกษาอาการเบื้องต้น',
        defaultPreparations: ['prep-4'],
        estimatedDuration: 20,
      },
      {
        id: 'purpose-4',
        code: 'PRE_SURGERY',
        name: 'เตรียมก่อนผ่าตัด',
        description: 'ตรวจเตรียมความพร้อมก่อนผ่าตัด',
        defaultPreparations: ['prep-1', 'prep-2', 'prep-3'],
        estimatedDuration: 45,
      },
      {
        id: 'purpose-5',
        code: 'POST_SURGERY',
        name: 'ติดตามหลังผ่าตัด',
        description: 'ตรวจแผลและติดตามหลังผ่าตัด',
        defaultPreparations: [],
        estimatedDuration: 20,
      },
      {
        id: 'purpose-6',
        code: 'LAB_RESULT',
        name: 'ฟังผลตรวจ Lab',
        description: 'ฟังผลตรวจและรับยา',
        defaultPreparations: ['prep-4'],
        estimatedDuration: 15,
      },
    ];
  }

  private generateMockPreparations(): PreparationTag[] {
    return [
      {
        id: 'prep-1',
        code: 'NPO_WATER',
        name: 'งดน้ำ 6 ชั่วโมง',
        description: 'งดดื่มน้ำอย่างน้อย 6 ชั่วโมงก่อนตรวจ',
        icon: 'water_drop',
      },
      {
        id: 'prep-2',
        code: 'NPO_FOOD',
        name: 'งดอาหาร 8 ชั่วโมง',
        description: 'งดอาหารอย่างน้อย 8 ชั่วโมงก่อนตรวจ',
        icon: 'restaurant',
      },
      {
        id: 'prep-3',
        code: 'NO_ASPIRIN',
        name: 'หยุดยาแอสไพริน 7 วัน',
        description: 'หยุดยาละลายลิ่มเลือด 7 วันก่อนทำหัตถการ',
        icon: 'medication',
      },
      {
        id: 'prep-4',
        code: 'BRING_RESULTS',
        name: 'นำผลตรวจเดิมมา',
        description: 'กรุณานำผลตรวจครั้งก่อนมาด้วย',
        icon: 'description',
      },
      {
        id: 'prep-5',
        code: 'WEAR_LOOSE',
        name: 'สวมเสื้อผ้าหลวม',
        description: 'สวมเสื้อผ้าที่สะดวกสำหรับการตรวจ',
        icon: 'checkroom',
      },
      {
        id: 'prep-6',
        code: 'BRING_XRAY',
        name: 'นำฟิล์ม X-ray มา',
        description: 'กรุณานำฟิล์ม X-ray ครั้งก่อนมาด้วย',
        icon: 'medical_information',
      },
    ];
  }

  private generateMockAppointments(): Appointment[] {
    const appointments: Appointment[] = [];
    const today = new Date();
    const statuses: AppointmentStatus[] = [
      'scheduled',
      'confirmed',
      'checked-in',
      'completed',
    ];

    // Generate appointments for past week, today, and next week
    for (let dayOffset = -7; dayOffset <= 14; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);

      // Skip weekends (basic demo)
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Random number of appointments per day (5-15)
      const numApts = 5 + Math.floor(Math.random() * 11);

      for (let i = 0; i < numApts; i++) {
        const roomIndex = Math.floor(Math.random() * 6);
        const roomId = `room-${roomIndex + 1}`;
        const availableDoctors = this.generateMockDoctors().filter((d) =>
          d.roomIds.includes(roomId),
        );
        const doctorId =
          availableDoctors[Math.floor(Math.random() * availableDoctors.length)]
            ?.id || 'doc-1';
        const patientId = `patient-${Math.floor(Math.random() * 20) + 1}`;
        const slotIndex = Math.floor(Math.random() * 16);
        const purposeIndex = Math.floor(Math.random() * 6);

        // Past dates = mostly completed, future = scheduled/confirmed
        let status: AppointmentStatus;
        if (dayOffset < 0) {
          status = Math.random() > 0.1 ? 'completed' : 'no-show';
        } else if (dayOffset === 0) {
          status = statuses[Math.floor(Math.random() * statuses.length)];
        } else {
          status = Math.random() > 0.3 ? 'scheduled' : 'confirmed';
        }

        appointments.push({
          id: `apt-${dayOffset}-${i}`,
          appointmentNumber: this.generateAppointmentNumber(date),
          roomId,
          doctorId,
          patientId,
          date: new Date(date),
          timeSlotId: `slot-${8 + Math.floor(slotIndex / 2)}-${(slotIndex % 2) * 30}`,
          purposeId: `purpose-${purposeIndex + 1}`,
          preparations: [],
          notes: '',
          contactPhone: '',
          tags: [],
          metadata: {},
          status,
          createdAt: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000),
          createdBy: 'system',
        });
      }
    }

    return appointments;
  }

  private generateMockBlockedDates(): BlockedDate[] {
    const today = new Date();
    const blockedDates: BlockedDate[] = [];

    // Add some Thai holidays for this year
    const year = today.getFullYear();
    const holidays = [
      { date: new Date(year, 0, 1), reason: 'วันขึ้นปีใหม่' },
      { date: new Date(year, 3, 6), reason: 'วันจักรี' },
      { date: new Date(year, 3, 13), reason: 'วันสงกรานต์' },
      { date: new Date(year, 3, 14), reason: 'วันสงกรานต์' },
      { date: new Date(year, 3, 15), reason: 'วันสงกรานต์' },
      { date: new Date(year, 4, 1), reason: 'วันแรงงาน' },
      { date: new Date(year, 4, 4), reason: 'วันฉัตรมงคล' },
      { date: new Date(year, 6, 28), reason: 'วันเฉลิมพระชนมพรรษา ร.10' },
      { date: new Date(year, 7, 12), reason: 'วันแม่แห่งชาติ' },
      { date: new Date(year, 9, 13), reason: 'วันคล้ายวันสวรรคต ร.9' },
      { date: new Date(year, 9, 23), reason: 'วันปิยมหาราช' },
      { date: new Date(year, 11, 5), reason: 'วันพ่อแห่งชาติ' },
      { date: new Date(year, 11, 10), reason: 'วันรัฐธรรมนูญ' },
      { date: new Date(year, 11, 31), reason: 'วันสิ้นปี' },
    ];

    holidays.forEach((h, i) => {
      blockedDates.push({
        id: `blocked-${i}`,
        date: h.date,
        type: 'holiday',
        reason: h.reason,
        canForceBook: false,
      });
    });

    // Add a doctor leave example
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    blockedDates.push({
      id: 'blocked-leave-1',
      date: nextWeek,
      type: 'doctor-leave',
      reason: 'นพ.สมชาย ใจดี ลาพักผ่อน',
      doctorId: 'doc-1',
      canForceBook: true,
    });

    return blockedDates;
  }

  private generateMockSlotConfigs(): SlotConfiguration[] {
    const rooms = this.generateMockRooms();
    const timeSlots = this.generateMockTimeSlots();

    return rooms.map((room, i) => ({
      id: `config-${i}`,
      roomId: room.id,
      dayOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
      timeSlotIds: timeSlots.map((ts) => ts.id),
      maxAppointmentsPerSlot: 3,
      maxAppointmentsPerDay: 30,
      effectiveFrom: new Date(2024, 0, 1),
      isActive: true,
    }));
  }
}
