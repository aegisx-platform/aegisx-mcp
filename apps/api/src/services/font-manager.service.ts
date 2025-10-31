import * as fs from 'fs';
import * as path from 'path';
import {
  getFontConfiguration,
  isThaiFont,
  getThaiFont,
  THAI_FONT_FALLBACK,
  FontConfiguration,
} from '../config/fonts.config';

/**
 * Font Manager Service
 *
 * Manages font loading and registration for PDFMake
 * Handles Thai font support and font fallbacks
 */
export class FontManagerService {
  private fontConfiguration: FontConfiguration;
  private loadedFonts: Set<string> = new Set();
  private fontFiles: Map<string, Buffer> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.fontConfiguration = getFontConfiguration();
  }

  /**
   * Initialize fonts and load font files
   */
  async initialize(): Promise<void> {
    // Prevent duplicate initialization
    if (this.initialized) {
      return;
    }

    try {
      await this.loadFontFiles();
      this.initialized = true;
      console.log('✅ Font Manager initialized');
    } catch (error) {
      console.warn('Font Manager initialization warning:', error.message);
      // Continue with default fonts if custom fonts fail to load
      this.initialized = true;
    }
  }

  /**
   * Load font files from disk
   */
  private async loadFontFiles(): Promise<void> {
    // Try both development and production paths
    const devFontDir = path.join(
      process.cwd(),
      'apps',
      'api',
      'src',
      'assets',
      'fonts',
    );
    const prodFontDir = path.join(
      process.cwd(),
      'dist',
      'apps',
      'api',
      'src',
      'assets',
      'fonts',
    );
    const fontDir = fs.existsSync(devFontDir) ? devFontDir : prodFontDir;

    // Check if fonts directory exists
    if (!fs.existsSync(fontDir)) {
      console.warn(`Fonts directory not found: ${fontDir}`);
      console.log(
        'Creating fonts directory and downloading default Thai fonts...',
      );
      await this.createFontsDirectory();
      return;
    }

    // Track loaded fonts for summary
    const loadedVariants: string[] = [];

    // Load available font files
    for (const [fontFamily, fontDescriptor] of Object.entries(
      this.fontConfiguration,
    )) {
      if (
        fontFamily === 'Helvetica' ||
        fontFamily === 'Times' ||
        fontFamily === 'Courier'
      ) {
        // Skip built-in fonts
        continue;
      }

      try {
        const variantsLoaded = await this.loadFontFamily(
          fontFamily,
          fontDescriptor,
        );
        if (variantsLoaded > 0) {
          this.loadedFonts.add(fontFamily);
          loadedVariants.push(`${fontFamily} (${variantsLoaded} variants)`);
        }
      } catch (error) {
        console.warn(
          `Failed to load font family ${fontFamily}:`,
          error.message,
        );
      }
    }

    // Show summary instead of individual files
    if (loadedVariants.length > 0) {
      console.log(`✅ Fonts loaded: ${loadedVariants.join(', ')}`);
    }
  }

  /**
   * Load a specific font family
   */
  private async loadFontFamily(
    fontFamily: string,
    fontDescriptor: any,
  ): Promise<number> {
    const variants = ['normal', 'bold', 'italics', 'bolditalics'];
    let loadedCount = 0;

    // Get the correct fonts directory
    const devFontDir = path.join(
      process.cwd(),
      'apps',
      'api',
      'src',
      'assets',
      'fonts',
    );
    const prodFontDir = path.join(
      process.cwd(),
      'dist',
      'apps',
      'api',
      'src',
      'assets',
      'fonts',
    );
    const fontDir = fs.existsSync(devFontDir) ? devFontDir : prodFontDir;

    for (const variant of variants) {
      const fontPath = fontDescriptor[variant];
      if (fontPath && !fontPath.startsWith('/') && !fontPath.includes('://')) {
        // It's a relative path, resolve it relative to the fonts directory
        const fullPath = path.join(fontDir, fontPath);

        if (fs.existsSync(fullPath)) {
          const fontBuffer = fs.readFileSync(fullPath);
          const fontKey = `${fontFamily}-${variant}`;
          this.fontFiles.set(fontKey, fontBuffer);
          loadedCount++;
          // Compact log showing only filename and size
          const fileName = path.basename(fullPath);
          console.log(
            `   ✓ ${fileName} (${Math.round(fontBuffer.length / 1024)}KB)`,
          );
        } else {
          console.warn(`   ✗ Font variant not found: ${fontFamily}-${variant}`);
        }
      }
    }

    return loadedCount;
  }

  /**
   * Create fonts directory and provide download instructions
   */
  private async createFontsDirectory(): Promise<void> {
    const fontDir = path.join(
      process.cwd(),
      'apps',
      'api',
      'src',
      'assets',
      'fonts',
    );

    try {
      fs.mkdirSync(fontDir, { recursive: true });

      // Create a README file with download instructions
      const readmeContent = `# Thai Fonts for PDF Generation

To enable Thai font support in PDF generation, please download and place the following font files in this directory:

## THSarabun Font (Recommended)
- THSarabun.ttf
- THSarabun-Bold.ttf
- THSarabun-Italic.ttf
- THSarabun-BoldItalic.ttf

Download from: https://github.com/cadsondemak/thsarabun

## Sarabun Font (Alternative)
- Sarabun-Regular.ttf
- Sarabun-Bold.ttf
- Sarabun-Italic.ttf
- Sarabun-BoldItalic.ttf

Download from: https://fonts.google.com/specimen/Sarabun

## Installation Steps:
1. Download the font files from the links above
2. Place them in this directory (${fontDir})
3. Restart the application
4. Thai text will be properly rendered in PDFs

## Current Status:
- Directory created: ✅
- Thai fonts available: ❌ (Please download fonts)
- Fallback to system fonts: ✅
`;

      fs.writeFileSync(path.join(fontDir, 'README.md'), readmeContent);

      console.log('📁 Fonts directory created:', fontDir);
      console.log(
        '📖 Font installation instructions saved to:',
        path.join(fontDir, 'README.md'),
      );
    } catch (error) {
      console.error('Failed to create fonts directory:', error);
    }
  }

  /**
   * Get font configuration for PDFMake
   */
  getFontsForPDFMake(): any {
    const fonts: any = {};

    // Add built-in fonts
    fonts.Helvetica = {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique',
    };

    fonts.Times = {
      normal: 'Times-Roman',
      bold: 'Times-Bold',
      italics: 'Times-Italic',
      bolditalics: 'Times-BoldItalic',
    };

    fonts.Courier = {
      normal: 'Courier',
      bold: 'Courier-Bold',
      italics: 'Courier-Oblique',
      bolditalics: 'Courier-BoldOblique',
    };

    // Add loaded custom fonts
    for (const fontFamily of this.loadedFonts) {
      const fontDescriptor = this.fontConfiguration[fontFamily];
      if (fontDescriptor) {
        fonts[fontFamily] = {};

        const variants = ['normal', 'bold', 'italics', 'bolditalics'];
        for (const variant of variants) {
          const fontKey = `${fontFamily}-${variant}`;
          const fontBuffer = this.fontFiles.get(fontKey);

          if (fontBuffer) {
            fonts[fontFamily][variant] = fontBuffer;
          } else {
            // Fallback to normal variant or built-in font
            fonts[fontFamily][variant] =
              fonts[fontFamily]['normal'] || 'Helvetica';
          }
        }
      }
    }

    return fonts;
  }

  /**
   * Get the best font for given content
   */
  getBestFont(content: string, preferredFont?: string): string {
    // Check if content contains Thai characters
    const hasThaiChars = /[\u0E00-\u0E7F]/.test(content);

    if (hasThaiChars) {
      // Use Thai font for Thai content
      if (
        preferredFont &&
        isThaiFont(preferredFont) &&
        this.loadedFonts.has(preferredFont)
      ) {
        return preferredFont;
      }

      // Try to find available Thai font
      for (const thaiFont of THAI_FONT_FALLBACK) {
        if (this.loadedFonts.has(thaiFont)) {
          return thaiFont;
        }
      }

      // Fallback to system font that supports Thai
      return 'Helvetica'; // Most systems have Thai support in Helvetica
    }

    // For non-Thai content, use preferred font or default
    if (
      preferredFont &&
      (this.loadedFonts.has(preferredFont) ||
        ['Helvetica', 'Times', 'Courier'].includes(preferredFont))
    ) {
      return preferredFont;
    }

    return 'Helvetica';
  }

  /**
   * Get available fonts list
   */
  getAvailableFonts(): string[] {
    const fonts = ['Helvetica', 'Times', 'Courier'];
    fonts.push(...Array.from(this.loadedFonts));
    return fonts;
  }

  /**
   * Check if a specific font is available
   */
  isFontAvailable(fontFamily: string): boolean {
    return (
      this.loadedFonts.has(fontFamily) ||
      ['Helvetica', 'Times', 'Courier'].includes(fontFamily)
    );
  }

  /**
   * Get font status for debugging
   */
  getFontStatus(): {
    configured: string[];
    loaded: string[];
    failed: string[];
    thaiFontsAvailable: boolean;
  } {
    const configured = Object.keys(this.fontConfiguration);
    const loaded = Array.from(this.loadedFonts);
    const failed = configured.filter(
      (font) =>
        !this.loadedFonts.has(font) &&
        !['Helvetica', 'Times', 'Courier'].includes(font),
    );
    const thaiFontsAvailable = THAI_FONT_FALLBACK.some((font) =>
      this.loadedFonts.has(font),
    );

    return {
      configured,
      loaded,
      failed,
      thaiFontsAvailable,
    };
  }

  /**
   * Apply font optimization for Thai text
   */
  optimizeTextForFont(text: string, fontFamily: string): string {
    if (!text) return text;

    // If using Thai font, ensure proper text handling
    if (isThaiFont(fontFamily)) {
      // Normalize Thai text (handle combining characters, etc.)
      return text.normalize('NFC');
    }

    return text;
  }

  /**
   * Get recommended line height for font
   */
  getLineHeight(fontFamily: string): number {
    if (isThaiFont(fontFamily)) {
      return 1.3; // Thai text needs more line height
    }
    return 1.2; // Standard line height
  }

  /**
   * Get font size recommendations
   */
  getFontSizeRecommendation(
    contentType: 'title' | 'body' | 'small',
    fontFamily: string,
  ): number {
    const baseSizes = {
      title: 22,
      body: 10,
      small: 8,
    };

    const size = baseSizes[contentType];

    // Thai fonts might need slight size adjustment
    if (isThaiFont(fontFamily)) {
      return Math.round(size * 1.05); // Slightly larger for better readability
    }

    return size;
  }
}
