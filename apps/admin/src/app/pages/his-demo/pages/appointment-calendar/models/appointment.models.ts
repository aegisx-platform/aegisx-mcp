/**
 * Hospital Appointment System - Data Models
 * ระบบนัดหมายคนไข้ในโรงพยาบาล
 */

// =============================================================================
// Core Entities
// =============================================================================

/**
 * ห้องตรวจ - Examination Room
 */
export interface ExaminationRoom {
  id: string;
  code: string;
  name: string;
  description?: string;
  color: string; // สำหรับแสดงบน calendar
  isActive: boolean;
}

/**
 * แพทย์ - Doctor
 */
export interface Doctor {
  id: string;
  code: string;
  name: string;
  specialty: string;
  roomIds: string[]; // ห้องที่แพทย์ประจำ
  imageUrl?: string;
  isActive: boolean;
}

/**
 * คนไข้ - Patient
 */
export interface Patient {
  id: string;
  hn: string; // Hospital Number
  cid: string; // Citizen ID (เลขบัตรประชาชน)
  title: string; // คำนำหน้า (นาย, นาง, นางสาว)
  firstName: string;
  lastName: string;
  birthDate: Date;
  phone?: string;
  email?: string;
  address?: string;
}

/**
 * ช่วงเวลา - Time Slot
 */
export interface TimeSlot {
  id: string;
  startTime: string; // "08:00"
  endTime: string; // "08:30"
  label: string; // "08:00 - 08:30"
}

/**
 * วัตถุประสงค์การนัด - Appointment Purpose
 */
export interface AppointmentPurpose {
  id: string;
  code: string;
  name: string;
  description?: string;
  defaultPreparations: string[]; // รหัสการเตรียมตัวเริ่มต้น
  estimatedDuration?: number; // ระยะเวลาโดยประมาณ (นาที)
}

/**
 * การเตรียมตัว - Preparation Tag
 */
export interface PreparationTag {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
}

// =============================================================================
// Appointment Entity
// =============================================================================

/**
 * สถานะการนัดหมาย - Appointment Status
 */
export type AppointmentStatus =
  | 'scheduled' // นัดหมายแล้ว
  | 'confirmed' // ยืนยันแล้ว
  | 'checked-in' // มาถึงแล้ว
  | 'in-progress' // กำลังตรวจ
  | 'completed' // เสร็จสิ้น
  | 'cancelled' // ยกเลิก
  | 'no-show'; // ไม่มา

/**
 * การนัดหมาย - Appointment
 */
export interface Appointment {
  id: string;
  appointmentNumber: string; // เลขที่นัด APT-YYYYMMDD-XXXX

  // ความสัมพันธ์
  roomId: string;
  doctorId: string;
  patientId: string;

  // เวลา
  date: Date;
  timeSlotId: string;

  // รายละเอียด
  purposeId: string;
  preparations: string[]; // รหัส preparation tags
  notes?: string;
  contactPhone?: string;

  // Metadata/Tags
  tags: string[];
  metadata: Record<string, unknown>;

  // สถานะ
  status: AppointmentStatus;

  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancelReason?: string;
}

// =============================================================================
// Configuration Entities
// =============================================================================

/**
 * ตั้งค่าช่วงเวลา - Slot Configuration
 */
export interface SlotConfiguration {
  id: string;
  roomId: string;
  doctorId?: string; // ถ้าไม่ระบุ = ทุกแพทย์ในห้อง

  // วัน/เวลาที่เปิดให้จอง
  dayOfWeek: number[]; // 0-6 (Sun-Sat)
  timeSlotIds: string[];

  // จำกัดจำนวน
  maxAppointmentsPerSlot: number;
  maxAppointmentsPerDay: number;
  maxAppointmentsPerDoctor?: number;

  // ช่วงวันที่มีผล
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
}

/**
 * ประเภทวันที่ถูกบล็อก - Blocked Date Type
 */
export type BlockedDateType =
  | 'holiday' // วันหยุดราชการ
  | 'doctor-leave' // แพทย์ลา
  | 'room-closed' // ห้องปิดปรับปรุง
  | 'special'; // อื่นๆ

/**
 * วันหยุด/วันลา - Blocked Date
 */
export interface BlockedDate {
  id: string;
  date: Date;
  type: BlockedDateType;
  reason: string;
  roomId?: string; // ถ้าไม่ระบุ = ทุกห้อง
  doctorId?: string; // ถ้าไม่ระบุ = ทุกแพทย์
  canForceBook: boolean; // อนุญาตให้จองทับได้หรือไม่
}

// =============================================================================
// View Models / DTOs
// =============================================================================

/**
 * Appointment with resolved relations
 */
export interface AppointmentView extends Appointment {
  room?: ExaminationRoom;
  doctor?: Doctor;
  patient?: Patient;
  timeSlot?: TimeSlot;
  purpose?: AppointmentPurpose;
  preparationTags?: PreparationTag[];
}

/**
 * Calendar Event Extended Props - Individual Appointment
 */
export interface AppointmentEventProps {
  isSummary?: false;
  appointment: AppointmentView;
  status: AppointmentStatus;
  roomId: string;
  doctorId: string;
  patientHN: string;
}

/**
 * Calendar Event Extended Props - Summary (count per day)
 */
export interface SummaryEventProps {
  isSummary: true;
  total: number;
  completed: number;
  confirmed: number;
  scheduled: number;
  capacityPercent: number;
  byRoom: Record<string, number>;
  date: string;
}

/**
 * Calendar Event (for AxCalendar)
 */
export interface AppointmentCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  backgroundColor?: string;
  extendedProps: AppointmentEventProps | SummaryEventProps;
}

/**
 * Slot Availability Info
 */
export interface SlotAvailability {
  timeSlotId: string;
  date: Date;
  roomId: string;
  doctorId?: string;
  totalCapacity: number;
  bookedCount: number;
  availableCount: number;
  isBlocked: boolean;
  blockedReason?: string;
  canForceBook?: boolean;
}

/**
 * Filter Options for Appointment List
 */
export interface AppointmentFilters {
  dateFrom?: Date;
  dateTo?: Date;
  roomId?: string;
  doctorId?: string;
  status?: AppointmentStatus[];
  searchText?: string; // ค้นหาจาก HN, CID, ชื่อ
}

/**
 * Summary Statistics
 */
export interface AppointmentSummary {
  date: Date;
  total: number;
  byStatus: Record<AppointmentStatus, number>;
  byRoom: Record<string, number>;
  byDoctor: Record<string, number>;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Status Labels (Thai)
 */
export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'นัดหมายแล้ว',
  confirmed: 'ยืนยันแล้ว',
  'checked-in': 'มาถึงแล้ว',
  'in-progress': 'กำลังตรวจ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
  'no-show': 'ไม่มา',
};

/**
 * Status Colors (for badges/chips)
 */
export const APPOINTMENT_STATUS_COLORS: Record<
  AppointmentStatus,
  'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
> = {
  scheduled: 'primary',
  confirmed: 'info',
  'checked-in': 'warning',
  'in-progress': 'warning',
  completed: 'success',
  cancelled: 'danger',
  'no-show': 'secondary',
};

/**
 * Blocked Date Type Labels
 */
export const BLOCKED_DATE_TYPE_LABELS: Record<BlockedDateType, string> = {
  holiday: 'วันหยุดราชการ',
  'doctor-leave': 'แพทย์ลา',
  'room-closed': 'ห้องปิดปรับปรุง',
  special: 'อื่นๆ',
};

// =============================================================================
// Quick Follow-up Booking
// =============================================================================

/**
 * Follow-up Request - ข้อมูลสำหรับค้นหาวันว่าง
 */
export interface FollowUpRequest {
  patientId: string;
  doctorId: string;
  roomId: string;
  targetDays: number;
  includeHolidays: boolean; // รวมวันหยุดด้วยหรือไม่
}

/**
 * Capacity Info - ข้อมูล capacity ของห้อง/แพทย์
 */
export interface CapacityInfo {
  current: number;
  max: number;
  available: number;
}

/**
 * Date Validation Checks - ผลการเช็คแต่ละรายการ
 */
export interface DateValidationChecks {
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isDoctorLeave: boolean;
  leaveReason?: string;
  roomCapacity: CapacityInfo;
  doctorCapacity: CapacityInfo;
  patientExistingAppointment?: {
    date: Date;
    daysDifference: number;
  };
}

/**
 * Date Validation Result - ผลการตรวจสอบวันที่
 */
export interface DateValidationResult {
  isValid: boolean;
  date: Date;
  skippedDays: number; // จำนวนวันที่ข้ามไป
  skippedReasons: string[]; // เหตุผลที่ข้าม
  checks: DateValidationChecks;
  warnings: string[];
  errors: string[];
}

/**
 * Available Slot - ช่วงเวลาที่ว่าง
 */
export interface AvailableSlot {
  timeSlotId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

/**
 * Follow-up Option - ตัวเลือก Quick Button
 */
export interface FollowUpOption {
  label: string;
  days: number;
  icon?: string;
}

/**
 * Quick Follow-up Options (Quick Buttons)
 */
export const FOLLOW_UP_OPTIONS: FollowUpOption[] = [
  { label: '1 สัปดาห์', days: 7, icon: 'event' },
  { label: '2 สัปดาห์', days: 14, icon: 'event' },
  { label: '1 เดือน', days: 30, icon: 'calendar_month' },
  { label: '2 เดือน', days: 60, icon: 'calendar_month' },
  { label: '3 เดือน', days: 90, icon: 'calendar_month' },
];

/**
 * Follow-up Dialog Data - ข้อมูลที่ส่งเข้า dialog
 */
export interface FollowUpDialogData {
  patient: Patient;
  doctor: Doctor;
  room: ExaminationRoom;
  defaultPurposeId?: string;
}

/**
 * Follow-up Dialog Result - ผลลัพธ์จาก dialog
 */
export interface FollowUpDialogResult {
  date: Date;
  timeSlotId: string;
  purposeId: string;
  notes?: string;
}
