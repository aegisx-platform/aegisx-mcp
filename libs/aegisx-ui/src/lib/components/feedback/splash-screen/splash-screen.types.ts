/**
 * Splash Screen Types
 *
 * Type definitions for the AxSplashScreen full-screen loading overlay component.
 */

/**
 * Represents a single stage in the splash screen initialization process.
 *
 * Stages are displayed sequentially during app initialization, showing
 * progress and status for each initialization step.
 *
 * @example
 * // Creating a custom stage
 * const stage: SplashScreenStage = {
 *   id: 'database',
 *   label: 'Initializing Database',
 *   icon: 'storage',
 *   status: 'pending',
 * };
 *
 * @see {@link SplashScreenConfig}
 * @see {@link AxSplashScreenComponent}
 */
export interface SplashScreenStage {
  /** Unique identifier for the stage */
  id: string;

  /** Display label shown to the user */
  label: string;

  /** Optional Material Icon name for visual indicator */
  icon?: string;

  /** Current status of the stage in the initialization process */
  status: 'pending' | 'loading' | 'completed' | 'error';

  /** Optional error message displayed when status is 'error' */
  errorMessage?: string;
}

/**
 * Configuration options for the splash screen component.
 *
 * Controls appearance, behavior, and content of the full-screen loading overlay.
 *
 * @example
 * // Complete configuration example
 * const config: SplashScreenConfig = {
 *   appName: 'My Application',
 *   version: '1.0.0',
 *   logo: '/assets/logo.png',
 *   tagline: 'Initializing...',
 *   minDisplayTime: 2000,
 *   showTips: true,
 *   animationStyle: 'fade',
 *   backgroundStyle: 'wave',
 *   waveColor: 'aegisx',
 * };
 *
 * @see {@link AxSplashScreenComponent}
 */
export interface SplashScreenConfig {
  /** Application logo URL or image path */
  logo?: string;

  /** Application name displayed to user */
  appName?: string;

  /** Application version number */
  version?: string;

  /** Tagline or description text */
  tagline?: string;

  /** Background color (hex, rgb) or CSS gradient */
  background?: string;

  /** Primary color for progress indicators and accents */
  primaryColor?: string;

  /** Minimum display time in milliseconds (prevents flash on fast loads) */
  minDisplayTime?: number;

  /** Whether to display rotating loading tips */
  showTips?: boolean;

  /** Array of tip messages to display during loading */
  tips?: string[];

  /** Whether to show initialization stage details and status */
  showStageDetails?: boolean;

  /** Transition animation style for screen appearance */
  animationStyle?: 'fade' | 'slide' | 'scale';

  /** Background visual style variant */
  backgroundStyle?: 'orbs' | 'wave' | 'minimal';

  /** Color theme for wave background animation (when backgroundStyle is 'wave') */
  waveColor?:
    | 'light'
    | 'dark'
    | 'ocean'
    | 'sunset'
    | 'forest'
    | 'aurora'
    | 'aegisx';
}

/**
 * Internal state of the splash screen component.
 *
 * Tracks visibility, progress, and error status during initialization.
 * This interface is primarily for internal component use.
 *
 * @see {@link AxSplashScreenComponent}
 */
export interface SplashScreenState {
  /** Whether the splash screen is currently visible */
  visible: boolean;

  /** Array of initialization stages being tracked */
  stages: SplashScreenStage[];

  /** Index of the currently active stage (0-based) */
  currentStageIndex: number;

  /** Overall progress as percentage (0-100) */
  overallProgress: number;

  /** Current message or status text displayed to user */
  currentMessage: string;

  /** Error message if initialization failed, null otherwise */
  error: string | null;
}

/**
 * Default splash screen configuration values.
 *
 * Used when no custom configuration is provided to the component.
 * Can be overridden by passing a custom config to SplashScreenComponent.
 */
export const DEFAULT_SPLASH_CONFIG: SplashScreenConfig = {
  appName: 'Application',
  minDisplayTime: 1000,
  showTips: false,
  showStageDetails: true,
  animationStyle: 'fade',
  tips: ['กำลังเตรียมระบบ...', 'โหลดข้อมูลพื้นฐาน...', 'เกือบเสร็จแล้ว...'],
};

/**
 * Default initialization stages for splash screen.
 *
 * Represents typical application initialization flow:
 * 1. Load configuration settings
 * 2. Verify user authentication
 * 3. Load application data
 * 4. Prepare UI components
 *
 * Can be customized or replaced with domain-specific stages.
 */
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
