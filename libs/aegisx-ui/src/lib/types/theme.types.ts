export interface AegisxTheme {
  id: string;
  name: string;
  primary: AegisxThemePalette;
  accent: AegisxThemePalette;
  warn: AegisxThemePalette;
  isDark?: boolean;
}

export interface AegisxThemePalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  DEFAULT: string;
  contrast?: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    DEFAULT: string;
  };
}