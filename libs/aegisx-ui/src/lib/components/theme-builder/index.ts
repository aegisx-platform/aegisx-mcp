/**
 * AegisX Theme Builder
 * Visual editor for customizing design tokens and color palettes
 */

// Main component
export { AxThemeBuilderComponent } from './theme-builder.component';

// Sub-components
export { AxColorPaletteEditorComponent } from './color-palette-editor.component';
export { AxImageColorExtractorComponent } from './image-color-extractor.component';
export { AxThemePreviewPanelComponent } from './preview-panel.component';

// Service
export { ThemeBuilderService } from './theme-builder.service';

// Types (use export type for isolatedModules compatibility)
export type {
  ColorChangeEvent,
  ColorPalette,
  ColorShade,
  ExportFormat,
  RadiusConfig,
  SemanticColorName,
  ShadowConfig,
  SpacingConfig,
  ThemeBuilderConfig,
  ThemeBuilderState,
  ThemePreset,
  ThemeSection,
  TypographyConfig,
} from './theme-builder.types';

// Color Extraction Utilities
export {
  colorToHex,
  extractDominantColors,
  extractImageData,
  fileToDataUrl,
  generateColorShades,
  hexToColor,
  hslToRgb,
  rgbToHsl,
} from './color-extraction.util';
export type {
  ExtractedPalette,
  HSLColor,
  RGBColor,
} from './color-extraction.util';
