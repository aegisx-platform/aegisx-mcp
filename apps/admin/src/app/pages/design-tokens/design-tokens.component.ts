import {
  Component,
  OnInit,
  inject,
  ViewEncapsulation,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TremorThemeService } from '../../services/tremor-theme.service';

interface DesignToken {
  name: string;
  cssVar: string;
  value?: string;
  description: string;
  category: string;
  level?: number; // For MUI-style levels (50-900)
}

interface TokenCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  tokens: DesignToken[];
}

interface ColorPaletteCategory {
  id: string;
  title: string;
  description: string;
  colors: ColorPalette[];
}

interface ColorPalette {
  name: string;
  colorName: string; // e.g., 'success', 'warning'
  levels: ColorLevel[];
}

interface ColorLevel {
  level: number; // 50, 100, 200, etc.
  cssVar: string;
  value?: string;
  description: string;
}

@Component({
  selector: 'app-design-tokens',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './design-tokens.component.html',
  styleUrls: ['./design-tokens.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DesignTokensComponent implements OnInit {
  themeService = inject(TremorThemeService);

  searchQuery = '';
  copiedToken = '';
  showBackToTop = false;
  activeSection = '';

  // Track expanded state for each palette
  private expandedPalettes = new Set<string>();

  // Track expanded state for semantic color details
  expandedSemanticColors = new Set<string>();

  // Color Palette Categories (with levels 50-900)
  colorPaletteCategories: ColorPaletteCategory[] = [
    {
      id: 'brand-colors',
      title: 'Brand Colors',
      description: 'Primary brand color palette with full scale',
      colors: [
        {
          name: 'Brand',
          colorName: 'brand',
          levels: this.generateColorLevels(
            'brand',
            'Primary brand color (Indigo)',
          ),
        },
      ],
    },
    {
      id: 'semantic-colors',
      title: 'Semantic Colors',
      description:
        'State colors with full scale (50-900) for success, warning, error, and info',
      colors: [
        {
          name: 'Success',
          colorName: 'success',
          levels: this.generateColorLevels(
            'success',
            'Green palette for success states',
          ),
        },
        {
          name: 'Warning',
          colorName: 'warning',
          levels: this.generateColorLevels(
            'warning',
            'Amber palette for warning states',
          ),
        },
        {
          name: 'Error',
          colorName: 'error',
          levels: this.generateColorLevels(
            'error',
            'Red palette for error states',
          ),
        },
        {
          name: 'Info',
          colorName: 'info',
          levels: this.generateColorLevels(
            'info',
            'Blue palette for informational states',
          ),
        },
      ],
    },
    {
      id: 'extended-colors',
      title: 'Extended Colors',
      description:
        'Additional color palettes with full scale for diverse UI needs',
      colors: [
        {
          name: 'Cyan',
          colorName: 'cyan',
          levels: this.generateColorLevels(
            'cyan',
            'Cyan palette for completion metrics',
          ),
        },
        {
          name: 'Purple',
          colorName: 'purple',
          levels: this.generateColorLevels(
            'purple',
            'Purple palette for input metrics',
          ),
        },
        {
          name: 'Indigo',
          colorName: 'indigo',
          levels: this.generateColorLevels(
            'indigo',
            'Indigo palette for accents',
          ),
        },
        {
          name: 'Pink',
          colorName: 'pink',
          levels: this.generateColorLevels(
            'pink',
            'Pink palette for accent bars',
          ),
        },
      ],
    },
  ];

  // Token Categories Data
  tokenCategories: TokenCategory[] = [
    {
      id: 'colors',
      title: 'Colors',
      icon: 'palette',
      description:
        'Semantic color tokens for consistent theming across light and dark modes',
      tokens: [
        // Brand Colors
        {
          name: 'Brand Faint',
          cssVar: '--ax-brand-faint',
          description: 'Lightest brand color for subtle backgrounds',
          category: 'brand',
        },
        {
          name: 'Brand Muted',
          cssVar: '--ax-brand-muted',
          description: 'Muted brand color for hover states',
          category: 'brand',
        },
        {
          name: 'Brand Subtle',
          cssVar: '--ax-brand-subtle',
          description: 'Subtle brand color for active states',
          category: 'brand',
        },
        {
          name: 'Brand Default',
          cssVar: '--ax-brand-default',
          description: 'Primary brand color',
          category: 'brand',
        },
        {
          name: 'Brand Emphasis',
          cssVar: '--ax-brand-emphasis',
          description: 'Emphasized brand color for focus',
          category: 'brand',
        },
        {
          name: 'Brand Inverted',
          cssVar: '--ax-brand-inverted',
          description: 'Inverted brand color for dark backgrounds',
          category: 'brand',
        },

        // Success Colors
        {
          name: 'Success Faint',
          cssVar: '--ax-success-faint',
          description: 'Lightest success color',
          category: 'success',
        },
        {
          name: 'Success Muted',
          cssVar: '--ax-success-muted',
          description: 'Muted success color',
          category: 'success',
        },
        {
          name: 'Success Subtle',
          cssVar: '--ax-success-subtle',
          description: 'Subtle success color',
          category: 'success',
        },
        {
          name: 'Success Default',
          cssVar: '--ax-success-default',
          description: 'Primary success color',
          category: 'success',
        },
        {
          name: 'Success Emphasis',
          cssVar: '--ax-success-emphasis',
          description: 'Emphasized success color',
          category: 'success',
        },
        {
          name: 'Success Inverted',
          cssVar: '--ax-success-inverted',
          description: 'Inverted success color',
          category: 'success',
        },

        // Warning Colors
        {
          name: 'Warning Faint',
          cssVar: '--ax-warning-faint',
          description: 'Lightest warning color',
          category: 'warning',
        },
        {
          name: 'Warning Muted',
          cssVar: '--ax-warning-muted',
          description: 'Muted warning color',
          category: 'warning',
        },
        {
          name: 'Warning Subtle',
          cssVar: '--ax-warning-subtle',
          description: 'Subtle warning color',
          category: 'warning',
        },
        {
          name: 'Warning Default',
          cssVar: '--ax-warning-default',
          description: 'Primary warning color',
          category: 'warning',
        },
        {
          name: 'Warning Emphasis',
          cssVar: '--ax-warning-emphasis',
          description: 'Emphasized warning color',
          category: 'warning',
        },
        {
          name: 'Warning Inverted',
          cssVar: '--ax-warning-inverted',
          description: 'Inverted warning color',
          category: 'warning',
        },

        // Info Colors
        {
          name: 'Info Faint',
          cssVar: '--ax-info-faint',
          description: 'Lightest info color',
          category: 'info',
        },
        {
          name: 'Info Muted',
          cssVar: '--ax-info-muted',
          description: 'Muted info color',
          category: 'info',
        },
        {
          name: 'Info Subtle',
          cssVar: '--ax-info-subtle',
          description: 'Subtle info color',
          category: 'info',
        },
        {
          name: 'Info Default',
          cssVar: '--ax-info-default',
          description: 'Primary info color',
          category: 'info',
        },
        {
          name: 'Info Emphasis',
          cssVar: '--ax-info-emphasis',
          description: 'Emphasized info color',
          category: 'info',
        },
        {
          name: 'Info Inverted',
          cssVar: '--ax-info-inverted',
          description: 'Inverted info color',
          category: 'info',
        },

        // Background Colors
        {
          name: 'Background Muted',
          cssVar: '--ax-background-muted',
          description: 'Muted background',
          category: 'background',
        },
        {
          name: 'Background Subtle',
          cssVar: '--ax-background-subtle',
          description: 'Subtle background',
          category: 'background',
        },
        {
          name: 'Background Default',
          cssVar: '--ax-background-default',
          description: 'Default background',
          category: 'background',
        },
        {
          name: 'Background Emphasis',
          cssVar: '--ax-background-emphasis',
          description: 'Emphasized background',
          category: 'background',
        },

        // Text Colors
        {
          name: 'Text Subtle',
          cssVar: '--ax-text-subtle',
          description: 'Subtle text for secondary information',
          category: 'text',
        },
        {
          name: 'Text Body',
          cssVar: '--ax-text-body',
          description: 'Body text color',
          category: 'text',
        },
        {
          name: 'Text Emphasis',
          cssVar: '--ax-text-emphasis',
          description: 'Emphasized text',
          category: 'text',
        },
        {
          name: 'Text Strong',
          cssVar: '--ax-text-strong',
          description: 'Strong text for headings',
          category: 'text',
        },
        {
          name: 'Text Inverted',
          cssVar: '--ax-text-inverted',
          description: 'Inverted text for dark backgrounds',
          category: 'text',
        },

        // Border Colors
        {
          name: 'Border Muted',
          cssVar: '--ax-border-muted',
          description: 'Muted border color',
          category: 'border',
        },
        {
          name: 'Border Default',
          cssVar: '--ax-border-default',
          description: 'Default border color',
          category: 'border',
        },
        {
          name: 'Border Emphasis',
          cssVar: '--ax-border-emphasis',
          description: 'Emphasized border color',
          category: 'border',
        },
      ],
    },
    {
      id: 'typography',
      title: 'Typography',
      icon: 'text_fields',
      description:
        'Font sizes, weights, and line heights for consistent typography',
      tokens: [
        // Font Sizes
        {
          name: 'Text XS',
          cssVar: '--ax-text-xs',
          description: '0.75rem (12px)',
          category: 'font-size',
        },
        {
          name: 'Text SM',
          cssVar: '--ax-text-sm',
          description: '0.875rem (14px)',
          category: 'font-size',
        },
        {
          name: 'Text Base',
          cssVar: '--ax-text-base',
          description: '1rem (16px)',
          category: 'font-size',
        },
        {
          name: 'Text LG',
          cssVar: '--ax-text-lg',
          description: '1.125rem (18px)',
          category: 'font-size',
        },
        {
          name: 'Text XL',
          cssVar: '--ax-text-xl',
          description: '1.25rem (20px)',
          category: 'font-size',
        },
        {
          name: 'Text 2XL',
          cssVar: '--ax-text-2xl',
          description: '1.5rem (24px)',
          category: 'font-size',
        },
        {
          name: 'Text 3XL',
          cssVar: '--ax-text-3xl',
          description: '1.875rem (30px)',
          category: 'font-size',
        },
        {
          name: 'Text 4XL',
          cssVar: '--ax-text-4xl',
          description: '2.25rem (36px)',
          category: 'font-size',
        },

        // Font Weights
        {
          name: 'Font Normal',
          cssVar: '--ax-font-normal',
          description: '400',
          category: 'font-weight',
        },
        {
          name: 'Font Medium',
          cssVar: '--ax-font-medium',
          description: '500',
          category: 'font-weight',
        },
        {
          name: 'Font Semibold',
          cssVar: '--ax-font-semibold',
          description: '600',
          category: 'font-weight',
        },
        {
          name: 'Font Bold',
          cssVar: '--ax-font-bold',
          description: '700',
          category: 'font-weight',
        },

        // Line Heights
        {
          name: 'Leading Tight',
          cssVar: '--ax-leading-tight',
          description: '1.25',
          category: 'line-height',
        },
        {
          name: 'Leading Normal',
          cssVar: '--ax-leading-normal',
          description: '1.5',
          category: 'line-height',
        },
        {
          name: 'Leading Relaxed',
          cssVar: '--ax-leading-relaxed',
          description: '1.75',
          category: 'line-height',
        },
      ],
    },
    {
      id: 'spacing',
      title: 'Spacing',
      icon: 'space_bar',
      description: 'Spacing scale for consistent layouts and component spacing',
      tokens: [
        {
          name: 'Spacing XS',
          cssVar: '--ax-spacing-xs',
          description: '4px',
          category: 'spacing',
        },
        {
          name: 'Spacing SM',
          cssVar: '--ax-spacing-sm',
          description: '8px',
          category: 'spacing',
        },
        {
          name: 'Spacing MD',
          cssVar: '--ax-spacing-md',
          description: '16px',
          category: 'spacing',
        },
        {
          name: 'Spacing LG',
          cssVar: '--ax-spacing-lg',
          description: '24px',
          category: 'spacing',
        },
        {
          name: 'Spacing XL',
          cssVar: '--ax-spacing-xl',
          description: '32px',
          category: 'spacing',
        },
        {
          name: 'Spacing 2XL',
          cssVar: '--ax-spacing-2xl',
          description: '40px',
          category: 'spacing',
        },
        {
          name: 'Spacing 3XL',
          cssVar: '--ax-spacing-3xl',
          description: '48px',
          category: 'spacing',
        },
        {
          name: 'Spacing 4XL',
          cssVar: '--ax-spacing-4xl',
          description: '64px',
          category: 'spacing',
        },
      ],
    },
    {
      id: 'components',
      title: 'Components',
      icon: 'widgets',
      description:
        'Component-specific tokens for borders, shadows, radius, and effects',
      tokens: [
        // Border Radius
        {
          name: 'Radius SM',
          cssVar: '--ax-radius-sm',
          description: '4px',
          category: 'radius',
        },
        {
          name: 'Radius MD',
          cssVar: '--ax-radius-md',
          description: '6px',
          category: 'radius',
        },
        {
          name: 'Radius LG',
          cssVar: '--ax-radius-lg',
          description: '8px',
          category: 'radius',
        },
        {
          name: 'Radius XL',
          cssVar: '--ax-radius-xl',
          description: '12px',
          category: 'radius',
        },
        {
          name: 'Radius 2XL',
          cssVar: '--ax-radius-2xl',
          description: '16px',
          category: 'radius',
        },
        {
          name: 'Radius Full',
          cssVar: '--ax-radius-full',
          description: '9999px',
          category: 'radius',
        },

        // Shadows
        {
          name: 'Shadow SM',
          cssVar: '--ax-shadow-sm',
          description: 'Small shadow',
          category: 'shadow',
        },
        {
          name: 'Shadow MD',
          cssVar: '--ax-shadow-md',
          description: 'Medium shadow',
          category: 'shadow',
        },
        {
          name: 'Shadow LG',
          cssVar: '--ax-shadow-lg',
          description: 'Large shadow',
          category: 'shadow',
        },

        // Border Widths
        {
          name: 'Border Thin',
          cssVar: '--ax-border-thin',
          description: '1px',
          category: 'border-width',
        },
        {
          name: 'Border Default',
          cssVar: '--ax-border-width-default',
          description: '2px',
          category: 'border-width',
        },
        {
          name: 'Border Thick',
          cssVar: '--ax-border-thick',
          description: '4px',
          category: 'border-width',
        },

        // Transitions
        {
          name: 'Transition Fast',
          cssVar: '--ax-transition-fast',
          description: '150ms',
          category: 'transition',
        },
        {
          name: 'Transition Base',
          cssVar: '--ax-transition-base',
          description: '200ms',
          category: 'transition',
        },
        {
          name: 'Transition Slow',
          cssVar: '--ax-transition-slow',
          description: '300ms',
          category: 'transition',
        },
        {
          name: 'Transition Slower',
          cssVar: '--ax-transition-slower',
          description: '400ms',
          category: 'transition',
        },
      ],
    },
    {
      id: 'layout',
      title: 'Layout',
      icon: 'view_quilt',
      description:
        'Layout tokens for responsive breakpoints, containers, and grid system',
      tokens: [
        // Breakpoints
        {
          name: 'Breakpoint SM',
          cssVar: '--ax-breakpoint-sm',
          description: '640px',
          category: 'breakpoint',
        },
        {
          name: 'Breakpoint MD',
          cssVar: '--ax-breakpoint-md',
          description: '768px',
          category: 'breakpoint',
        },
        {
          name: 'Breakpoint LG',
          cssVar: '--ax-breakpoint-lg',
          description: '1024px',
          category: 'breakpoint',
        },
        {
          name: 'Breakpoint XL',
          cssVar: '--ax-breakpoint-xl',
          description: '1280px',
          category: 'breakpoint',
        },

        // Container Widths
        {
          name: 'Container SM',
          cssVar: '--ax-container-sm',
          description: '640px',
          category: 'container',
        },
        {
          name: 'Container MD',
          cssVar: '--ax-container-md',
          description: '768px',
          category: 'container',
        },
        {
          name: 'Container LG',
          cssVar: '--ax-container-lg',
          description: '1024px',
          category: 'container',
        },
        {
          name: 'Container XL',
          cssVar: '--ax-container-xl',
          description: '1280px',
          category: 'container',
        },

        // Grid System
        {
          name: 'Grid Columns',
          cssVar: '--ax-grid-columns',
          description: '12',
          category: 'grid',
        },
        {
          name: 'Grid Gutter',
          cssVar: '--ax-grid-gutter',
          description: '24px',
          category: 'grid',
        },
      ],
    },
    {
      id: 'effects',
      title: 'Effects',
      icon: 'auto_awesome',
      description:
        'Visual effect tokens for z-index, opacity, and focus states',
      tokens: [
        // Z-Index Scale
        {
          name: 'Z-Index Base',
          cssVar: '--ax-z-base',
          description: '0',
          category: 'z-index',
        },
        {
          name: 'Z-Index Dropdown',
          cssVar: '--ax-z-dropdown',
          description: '1000',
          category: 'z-index',
        },
        {
          name: 'Z-Index Sticky',
          cssVar: '--ax-z-sticky',
          description: '1020',
          category: 'z-index',
        },
        {
          name: 'Z-Index Fixed',
          cssVar: '--ax-z-fixed',
          description: '1030',
          category: 'z-index',
        },
        {
          name: 'Z-Index Modal Backdrop',
          cssVar: '--ax-z-modal-backdrop',
          description: '1040',
          category: 'z-index',
        },
        {
          name: 'Z-Index Modal',
          cssVar: '--ax-z-modal',
          description: '1050',
          category: 'z-index',
        },
        {
          name: 'Z-Index Toast',
          cssVar: '--ax-z-toast',
          description: '1500',
          category: 'z-index',
        },

        // Opacity Levels
        {
          name: 'Opacity Disabled',
          cssVar: '--ax-opacity-disabled',
          description: '0.38',
          category: 'opacity',
        },
        {
          name: 'Opacity Hover',
          cssVar: '--ax-opacity-hover',
          description: '0.04',
          category: 'opacity',
        },
        {
          name: 'Opacity Active',
          cssVar: '--ax-opacity-active',
          description: '0.12',
          category: 'opacity',
        },

        // Focus Ring
        {
          name: 'Focus Ring Width',
          cssVar: '--ax-focus-ring-width',
          description: '3px',
          category: 'focus-ring',
        },
        {
          name: 'Focus Ring Offset',
          cssVar: '--ax-focus-ring-offset',
          description: '2px',
          category: 'focus-ring',
        },
        {
          name: 'Focus Ring Opacity',
          cssVar: '--ax-focus-ring-opacity',
          description: '0.5',
          category: 'focus-ring',
        },
        {
          name: 'Focus Ring Color',
          cssVar: '--ax-focus-ring-color',
          description: 'Brand color',
          category: 'focus-ring',
        },
      ],
    },
  ];

  ngOnInit() {
    // Compute actual CSS variable values after view init
    setTimeout(() => {
      this.computeTokenValues();
      this.computeColorPaletteValues();
    }, 100);
  }

  /**
   * Generate color levels (50-900) for a color category
   */
  generateColorLevels(colorName: string, description: string): ColorLevel[] {
    const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    return levels.map((level) => ({
      level,
      cssVar: `--ax-${colorName}-${level}`,
      description: level === 500 ? `${description} (Main)` : description,
    }));
  }

  computeTokenValues() {
    const rootStyles = getComputedStyle(document.documentElement);

    this.tokenCategories.forEach((category) => {
      category.tokens.forEach((token) => {
        const value = rootStyles.getPropertyValue(token.cssVar).trim();
        if (value) {
          token.value = value;
        }
      });
    });
  }

  computeColorPaletteValues() {
    const rootStyles = getComputedStyle(document.documentElement);

    this.colorPaletteCategories.forEach((category) => {
      category.colors.forEach((colorPalette) => {
        colorPalette.levels.forEach((level) => {
          const value = rootStyles.getPropertyValue(level.cssVar).trim();
          if (value) {
            level.value = value;
          }
        });
      });
    });
  }

  get filteredCategories(): TokenCategory[] {
    if (!this.searchQuery.trim()) {
      return this.tokenCategories;
    }

    const query = this.searchQuery.toLowerCase();
    return this.tokenCategories
      .map((category) => ({
        ...category,
        tokens: category.tokens.filter(
          (token) =>
            token.name.toLowerCase().includes(query) ||
            token.cssVar.toLowerCase().includes(query) ||
            token.description.toLowerCase().includes(query) ||
            token.category.toLowerCase().includes(query),
        ),
      }))
      .filter((category) => category.tokens.length > 0);
  }

  copyToClipboard(cssVar: string) {
    navigator.clipboard.writeText(`var(${cssVar})`).then(() => {
      this.copiedToken = cssVar;
      setTimeout(() => {
        this.copiedToken = '';
      }, 2000);
    });
  }

  getColorValue(cssVar: string): string {
    return `var(${cssVar})`;
  }

  toggleTheme() {
    // Toggle between aegisx-light and aegisx-dark
    const currentId = this.themeService.themeId();
    const newTheme =
      currentId === 'aegisx-dark' ? 'aegisx-light' : 'aegisx-dark';
    this.themeService.setTheme(newTheme);

    // Recompute values after theme change
    setTimeout(() => {
      this.computeTokenValues();
      this.computeColorPaletteValues();
    }, 100);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  getTotalTokenCount(): number {
    return this.tokenCategories.reduce(
      (total, category) => total + category.tokens.length,
      0,
    );
  }

  /**
   * Toggle expanded/collapsed state for a color palette
   */
  togglePaletteDetails(colorName: string): void {
    if (this.expandedPalettes.has(colorName)) {
      this.expandedPalettes.delete(colorName);
    } else {
      this.expandedPalettes.add(colorName);
    }
  }

  /**
   * Check if a color palette is expanded
   */
  isPaletteExpanded(colorName: string): boolean {
    return this.expandedPalettes.has(colorName);
  }

  /**
   * Get semantic name for a color level
   */
  getSemanticName(level: number): string | null {
    const semanticMap: Record<number, string> = {
      50: 'faint',
      200: 'muted',
      300: 'subtle',
      500: 'default/main',
      700: 'emphasis',
    };
    return semanticMap[level] || null;
  }

  /**
   * Toggle expanded/collapsed state for semantic color details
   */
  toggleSemanticColorDetails(colorName: string): void {
    if (this.expandedSemanticColors.has(colorName)) {
      this.expandedSemanticColors.delete(colorName);
    } else {
      this.expandedSemanticColors.add(colorName);
    }
  }

  /**
   * Check if semantic color details are expanded
   */
  isSemanticColorExpanded(colorName: string): boolean {
    return this.expandedSemanticColors.has(colorName);
  }

  /**
   * Get color levels for a semantic color from the palette data
   */
  getSemanticColorLevels(colorName: string): ColorLevel[] {
    // Search in brand-colors, semantic-colors, and extended-colors categories
    for (const category of this.colorPaletteCategories) {
      if (
        category.id === 'brand-colors' ||
        category.id === 'semantic-colors' ||
        category.id === 'extended-colors'
      ) {
        const colorPalette = category.colors.find(
          (c) => c.colorName.toLowerCase() === colorName.toLowerCase(),
        );
        if (colorPalette) {
          return colorPalette.levels;
        }
      }
    }
    return [];
  }

  /**
   * Handle window scroll events
   */
  @HostListener('window:scroll')
  onWindowScroll(): void {
    // Show/hide back to top button
    this.showBackToTop = window.scrollY > 500;

    // Track active section
    const sections = [
      'color-palettes',
      'colors',
      'typography',
      'spacing',
      'components',
      'layout',
      'effects',
    ];

    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= 300) {
          this.activeSection = sectionId;
          break;
        }
      }
    }
  }

  /**
   * Scroll to top of page
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
