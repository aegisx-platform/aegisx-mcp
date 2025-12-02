/**
 * Splash Screen Types
 */

export interface SplashScreenStage {
  id: string;
  label: string;
  icon?: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  errorMessage?: string;
}

export interface SplashScreenConfig {
  /** Application logo URL */
  logo?: string;
  /** Application name */
  appName?: string;
  /** Application version */
  version?: string;
  /** Tagline or description */
  tagline?: string;
  /** Background color or gradient */
  background?: string;
  /** Primary color for progress indicators */
  primaryColor?: string;
  /** Minimum display time in ms (prevents flash) */
  minDisplayTime?: number;
  /** Show loading tips */
  showTips?: boolean;
  /** Custom tips array */
  tips?: string[];
  /** Show stage details */
  showStageDetails?: boolean;
  /** Animation style */
  animationStyle?: 'fade' | 'slide' | 'scale';
  /** Background style variant */
  backgroundStyle?: 'orbs' | 'wave' | 'minimal';
  /** Wave color theme (for wave background) */
  waveColor?:
    | 'light'
    | 'dark'
    | 'ocean'
    | 'sunset'
    | 'forest'
    | 'aurora'
    | 'aegisx';
}

export interface SplashScreenState {
  visible: boolean;
  stages: SplashScreenStage[];
  currentStageIndex: number;
  overallProgress: number;
  currentMessage: string;
  error: string | null;
}

export const DEFAULT_SPLASH_CONFIG: SplashScreenConfig = {
  appName: 'Application',
  minDisplayTime: 1000,
  showTips: false,
  showStageDetails: true,
  animationStyle: 'fade',
  tips: ['กำลังเตรียมระบบ...', 'โหลดข้อมูลพื้นฐาน...', 'เกือบเสร็จแล้ว...'],
};

export const DEFAULT_STAGES: SplashScreenStage[] = [
  {
    id: 'config',
    label: 'โหลดการตั้งค่า',
    icon: 'settings',
    status: 'pending',
  },
  {
    id: 'auth',
    label: 'ตรวจสอบสิทธิ์',
    icon: 'verified_user',
    status: 'pending',
  },
  {
    id: 'data',
    label: 'โหลดข้อมูล',
    icon: 'cloud_download',
    status: 'pending',
  },
  { id: 'ui', label: 'เตรียม UI', icon: 'dashboard', status: 'pending' },
];
