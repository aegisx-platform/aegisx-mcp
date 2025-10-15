/**
 * Font Configuration for PDFMake
 * 
 * Configures Thai fonts (Sarabun) and other fonts for PDF generation
 */

export interface FontDescriptor {
  normal: string;
  bold: string;
  italics: string;
  bolditalics: string;
}

export interface FontConfiguration {
  [fontFamily: string]: FontDescriptor;
}

/**
 * Thai Font Configuration using Sarabun
 * 
 * Sarabun is a popular Thai font from Google Fonts that works well in PDFs
 * Downloaded from: https://fonts.google.com/specimen/Sarabun
 */
export const THAI_FONTS: FontConfiguration = {
  Sarabun: {
    normal: 'Sarabun/Sarabun-Regular.ttf',
    bold: 'Sarabun/Sarabun-Bold.ttf',
    italics: 'Sarabun/Sarabun-Italic.ttf',
    bolditalics: 'Sarabun/Sarabun-BoldItalic.ttf'
  }
};

/**
 * Default font configuration including standard fonts
 */
export const DEFAULT_FONTS: FontConfiguration = {
  // Standard fonts (built-in)
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic'
  },
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique'
  },
  
  // Thai fonts
  ...THAI_FONTS
};

/**
 * Font file mappings for different environments
 */
export const FONT_PATHS = {
  development: {
    Sarabun: {
      normal: 'Sarabun/Sarabun-Regular.ttf',
      bold: 'Sarabun/Sarabun-Bold.ttf',
      italics: 'Sarabun/Sarabun-Italic.ttf',
      bolditalics: 'Sarabun/Sarabun-BoldItalic.ttf'
    }
  },
  production: {
    Sarabun: {
      normal: '/app/assets/fonts/Sarabun-Regular.ttf',
      bold: '/app/assets/fonts/Sarabun-Bold.ttf',
      italics: '/app/assets/fonts/Sarabun-Italic.ttf',
      bolditalics: '/app/assets/fonts/Sarabun-BoldItalic.ttf'
    }
  }
};

/**
 * Get font configuration based on environment
 */
export function getFontConfiguration(): FontConfiguration {
  const env = process.env.NODE_ENV || 'development';
  const fontPaths = FONT_PATHS[env] || FONT_PATHS.development;
  
  return {
    ...DEFAULT_FONTS,
    ...fontPaths
  };
}

/**
 * Check if a font supports Thai characters
 */
export function isThaiFont(fontFamily: string): boolean {
  const thaiFonts = ['Sarabun', 'Tahoma', 'Arial Unicode MS'];
  return thaiFonts.includes(fontFamily);
}

/**
 * Get appropriate font for Thai content
 */
export function getThaiFont(): string {
  return 'Sarabun';
}

/**
 * Font fallback chain for Thai content
 */
export const THAI_FONT_FALLBACK = ['Sarabun', 'Tahoma', 'Arial', 'Helvetica'];

/**
 * Default font sizes for different content types
 */
export const FONT_SIZES = {
  title: 22,
  subtitle: 16,
  heading1: 18,
  heading2: 16,
  heading3: 14,
  body: 10,
  small: 8,
  caption: 7
};

/**
 * Line heights for different fonts
 */
export const LINE_HEIGHTS = {
  normal: 1.2,
  tight: 1.1,
  loose: 1.4,
  thai: 1.3 // Thai text needs slightly more line height
};