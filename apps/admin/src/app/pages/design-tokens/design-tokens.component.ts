import { Component, OnInit, inject } from '@angular/core';
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
}

interface TokenCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  tokens: DesignToken[];
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
})
export class DesignTokensComponent implements OnInit {
  themeService = inject(TremorThemeService);

  searchQuery = '';
  copiedToken = '';

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
          cssVar: '--aegisx-brand-faint',
          description: 'Lightest brand color for subtle backgrounds',
          category: 'brand',
        },
        {
          name: 'Brand Muted',
          cssVar: '--aegisx-brand-muted',
          description: 'Muted brand color for hover states',
          category: 'brand',
        },
        {
          name: 'Brand Subtle',
          cssVar: '--aegisx-brand-subtle',
          description: 'Subtle brand color for active states',
          category: 'brand',
        },
        {
          name: 'Brand Default',
          cssVar: '--aegisx-brand-default',
          description: 'Primary brand color',
          category: 'brand',
        },
        {
          name: 'Brand Emphasis',
          cssVar: '--aegisx-brand-emphasis',
          description: 'Emphasized brand color for focus',
          category: 'brand',
        },
        {
          name: 'Brand Inverted',
          cssVar: '--aegisx-brand-inverted',
          description: 'Inverted brand color for dark backgrounds',
          category: 'brand',
        },

        // Success Colors
        {
          name: 'Success Faint',
          cssVar: '--aegisx-success-faint',
          description: 'Lightest success color',
          category: 'success',
        },
        {
          name: 'Success Muted',
          cssVar: '--aegisx-success-muted',
          description: 'Muted success color',
          category: 'success',
        },
        {
          name: 'Success Subtle',
          cssVar: '--aegisx-success-subtle',
          description: 'Subtle success color',
          category: 'success',
        },
        {
          name: 'Success Default',
          cssVar: '--aegisx-success-default',
          description: 'Primary success color',
          category: 'success',
        },
        {
          name: 'Success Emphasis',
          cssVar: '--aegisx-success-emphasis',
          description: 'Emphasized success color',
          category: 'success',
        },
        {
          name: 'Success Inverted',
          cssVar: '--aegisx-success-inverted',
          description: 'Inverted success color',
          category: 'success',
        },

        // Warning Colors
        {
          name: 'Warning Faint',
          cssVar: '--aegisx-warning-faint',
          description: 'Lightest warning color',
          category: 'warning',
        },
        {
          name: 'Warning Muted',
          cssVar: '--aegisx-warning-muted',
          description: 'Muted warning color',
          category: 'warning',
        },
        {
          name: 'Warning Subtle',
          cssVar: '--aegisx-warning-subtle',
          description: 'Subtle warning color',
          category: 'warning',
        },
        {
          name: 'Warning Default',
          cssVar: '--aegisx-warning-default',
          description: 'Primary warning color',
          category: 'warning',
        },
        {
          name: 'Warning Emphasis',
          cssVar: '--aegisx-warning-emphasis',
          description: 'Emphasized warning color',
          category: 'warning',
        },
        {
          name: 'Warning Inverted',
          cssVar: '--aegisx-warning-inverted',
          description: 'Inverted warning color',
          category: 'warning',
        },

        // Info Colors
        {
          name: 'Info Faint',
          cssVar: '--aegisx-info-faint',
          description: 'Lightest info color',
          category: 'info',
        },
        {
          name: 'Info Muted',
          cssVar: '--aegisx-info-muted',
          description: 'Muted info color',
          category: 'info',
        },
        {
          name: 'Info Subtle',
          cssVar: '--aegisx-info-subtle',
          description: 'Subtle info color',
          category: 'info',
        },
        {
          name: 'Info Default',
          cssVar: '--aegisx-info-default',
          description: 'Primary info color',
          category: 'info',
        },
        {
          name: 'Info Emphasis',
          cssVar: '--aegisx-info-emphasis',
          description: 'Emphasized info color',
          category: 'info',
        },
        {
          name: 'Info Inverted',
          cssVar: '--aegisx-info-inverted',
          description: 'Inverted info color',
          category: 'info',
        },

        // Background Colors
        {
          name: 'Background Muted',
          cssVar: '--aegisx-background-muted',
          description: 'Muted background',
          category: 'background',
        },
        {
          name: 'Background Subtle',
          cssVar: '--aegisx-background-subtle',
          description: 'Subtle background',
          category: 'background',
        },
        {
          name: 'Background Default',
          cssVar: '--aegisx-background-default',
          description: 'Default background',
          category: 'background',
        },
        {
          name: 'Background Emphasis',
          cssVar: '--aegisx-background-emphasis',
          description: 'Emphasized background',
          category: 'background',
        },

        // Text Colors
        {
          name: 'Text Subtle',
          cssVar: '--aegisx-text-subtle',
          description: 'Subtle text for secondary information',
          category: 'text',
        },
        {
          name: 'Text Body',
          cssVar: '--aegisx-text-body',
          description: 'Body text color',
          category: 'text',
        },
        {
          name: 'Text Emphasis',
          cssVar: '--aegisx-text-emphasis',
          description: 'Emphasized text',
          category: 'text',
        },
        {
          name: 'Text Strong',
          cssVar: '--aegisx-text-strong',
          description: 'Strong text for headings',
          category: 'text',
        },
        {
          name: 'Text Inverted',
          cssVar: '--aegisx-text-inverted',
          description: 'Inverted text for dark backgrounds',
          category: 'text',
        },

        // Border Colors
        {
          name: 'Border Muted',
          cssVar: '--aegisx-border-muted',
          description: 'Muted border color',
          category: 'border',
        },
        {
          name: 'Border Default',
          cssVar: '--aegisx-border-default',
          description: 'Default border color',
          category: 'border',
        },
        {
          name: 'Border Emphasis',
          cssVar: '--aegisx-border-emphasis',
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
          cssVar: '--aegisx-text-xs',
          description: '0.75rem (12px)',
          category: 'font-size',
        },
        {
          name: 'Text SM',
          cssVar: '--aegisx-text-sm',
          description: '0.875rem (14px)',
          category: 'font-size',
        },
        {
          name: 'Text Base',
          cssVar: '--aegisx-text-base',
          description: '1rem (16px)',
          category: 'font-size',
        },
        {
          name: 'Text LG',
          cssVar: '--aegisx-text-lg',
          description: '1.125rem (18px)',
          category: 'font-size',
        },
        {
          name: 'Text XL',
          cssVar: '--aegisx-text-xl',
          description: '1.25rem (20px)',
          category: 'font-size',
        },
        {
          name: 'Text 2XL',
          cssVar: '--aegisx-text-2xl',
          description: '1.5rem (24px)',
          category: 'font-size',
        },
        {
          name: 'Text 3XL',
          cssVar: '--aegisx-text-3xl',
          description: '1.875rem (30px)',
          category: 'font-size',
        },
        {
          name: 'Text 4XL',
          cssVar: '--aegisx-text-4xl',
          description: '2.25rem (36px)',
          category: 'font-size',
        },

        // Font Weights
        {
          name: 'Font Normal',
          cssVar: '--aegisx-font-normal',
          description: '400',
          category: 'font-weight',
        },
        {
          name: 'Font Medium',
          cssVar: '--aegisx-font-medium',
          description: '500',
          category: 'font-weight',
        },
        {
          name: 'Font Semibold',
          cssVar: '--aegisx-font-semibold',
          description: '600',
          category: 'font-weight',
        },
        {
          name: 'Font Bold',
          cssVar: '--aegisx-font-bold',
          description: '700',
          category: 'font-weight',
        },

        // Line Heights
        {
          name: 'Leading Tight',
          cssVar: '--aegisx-leading-tight',
          description: '1.25',
          category: 'line-height',
        },
        {
          name: 'Leading Normal',
          cssVar: '--aegisx-leading-normal',
          description: '1.5',
          category: 'line-height',
        },
        {
          name: 'Leading Relaxed',
          cssVar: '--aegisx-leading-relaxed',
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
          cssVar: '--aegisx-spacing-xs',
          description: '4px',
          category: 'spacing',
        },
        {
          name: 'Spacing SM',
          cssVar: '--aegisx-spacing-sm',
          description: '8px',
          category: 'spacing',
        },
        {
          name: 'Spacing MD',
          cssVar: '--aegisx-spacing-md',
          description: '16px',
          category: 'spacing',
        },
        {
          name: 'Spacing LG',
          cssVar: '--aegisx-spacing-lg',
          description: '24px',
          category: 'spacing',
        },
        {
          name: 'Spacing XL',
          cssVar: '--aegisx-spacing-xl',
          description: '32px',
          category: 'spacing',
        },
        {
          name: 'Spacing 2XL',
          cssVar: '--aegisx-spacing-2xl',
          description: '40px',
          category: 'spacing',
        },
        {
          name: 'Spacing 3XL',
          cssVar: '--aegisx-spacing-3xl',
          description: '48px',
          category: 'spacing',
        },
        {
          name: 'Spacing 4XL',
          cssVar: '--aegisx-spacing-4xl',
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
          cssVar: '--aegisx-radius-sm',
          description: '4px',
          category: 'radius',
        },
        {
          name: 'Radius MD',
          cssVar: '--aegisx-radius-md',
          description: '6px',
          category: 'radius',
        },
        {
          name: 'Radius LG',
          cssVar: '--aegisx-radius-lg',
          description: '8px',
          category: 'radius',
        },
        {
          name: 'Radius XL',
          cssVar: '--aegisx-radius-xl',
          description: '12px',
          category: 'radius',
        },
        {
          name: 'Radius 2XL',
          cssVar: '--aegisx-radius-2xl',
          description: '16px',
          category: 'radius',
        },
        {
          name: 'Radius Full',
          cssVar: '--aegisx-radius-full',
          description: '9999px',
          category: 'radius',
        },

        // Shadows
        {
          name: 'Shadow SM',
          cssVar: '--aegisx-shadow-sm',
          description: 'Small shadow',
          category: 'shadow',
        },
        {
          name: 'Shadow MD',
          cssVar: '--aegisx-shadow-md',
          description: 'Medium shadow',
          category: 'shadow',
        },
        {
          name: 'Shadow LG',
          cssVar: '--aegisx-shadow-lg',
          description: 'Large shadow',
          category: 'shadow',
        },

        // Border Widths
        {
          name: 'Border Thin',
          cssVar: '--aegisx-border-thin',
          description: '1px',
          category: 'border-width',
        },
        {
          name: 'Border Default',
          cssVar: '--aegisx-border-width-default',
          description: '2px',
          category: 'border-width',
        },
        {
          name: 'Border Thick',
          cssVar: '--aegisx-border-thick',
          description: '4px',
          category: 'border-width',
        },

        // Transitions
        {
          name: 'Transition Fast',
          cssVar: '--aegisx-transition-fast',
          description: '150ms',
          category: 'transition',
        },
        {
          name: 'Transition Base',
          cssVar: '--aegisx-transition-base',
          description: '200ms',
          category: 'transition',
        },
        {
          name: 'Transition Slow',
          cssVar: '--aegisx-transition-slow',
          description: '300ms',
          category: 'transition',
        },
        {
          name: 'Transition Slower',
          cssVar: '--aegisx-transition-slower',
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
          cssVar: '--aegisx-breakpoint-sm',
          description: '640px',
          category: 'breakpoint',
        },
        {
          name: 'Breakpoint MD',
          cssVar: '--aegisx-breakpoint-md',
          description: '768px',
          category: 'breakpoint',
        },
        {
          name: 'Breakpoint LG',
          cssVar: '--aegisx-breakpoint-lg',
          description: '1024px',
          category: 'breakpoint',
        },
        {
          name: 'Breakpoint XL',
          cssVar: '--aegisx-breakpoint-xl',
          description: '1280px',
          category: 'breakpoint',
        },

        // Container Widths
        {
          name: 'Container SM',
          cssVar: '--aegisx-container-sm',
          description: '640px',
          category: 'container',
        },
        {
          name: 'Container MD',
          cssVar: '--aegisx-container-md',
          description: '768px',
          category: 'container',
        },
        {
          name: 'Container LG',
          cssVar: '--aegisx-container-lg',
          description: '1024px',
          category: 'container',
        },
        {
          name: 'Container XL',
          cssVar: '--aegisx-container-xl',
          description: '1280px',
          category: 'container',
        },

        // Grid System
        {
          name: 'Grid Columns',
          cssVar: '--aegisx-grid-columns',
          description: '12',
          category: 'grid',
        },
        {
          name: 'Grid Gutter',
          cssVar: '--aegisx-grid-gutter',
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
          cssVar: '--aegisx-z-base',
          description: '0',
          category: 'z-index',
        },
        {
          name: 'Z-Index Dropdown',
          cssVar: '--aegisx-z-dropdown',
          description: '1000',
          category: 'z-index',
        },
        {
          name: 'Z-Index Sticky',
          cssVar: '--aegisx-z-sticky',
          description: '1020',
          category: 'z-index',
        },
        {
          name: 'Z-Index Fixed',
          cssVar: '--aegisx-z-fixed',
          description: '1030',
          category: 'z-index',
        },
        {
          name: 'Z-Index Modal Backdrop',
          cssVar: '--aegisx-z-modal-backdrop',
          description: '1040',
          category: 'z-index',
        },
        {
          name: 'Z-Index Modal',
          cssVar: '--aegisx-z-modal',
          description: '1050',
          category: 'z-index',
        },
        {
          name: 'Z-Index Toast',
          cssVar: '--aegisx-z-toast',
          description: '1500',
          category: 'z-index',
        },

        // Opacity Levels
        {
          name: 'Opacity Disabled',
          cssVar: '--aegisx-opacity-disabled',
          description: '0.38',
          category: 'opacity',
        },
        {
          name: 'Opacity Hover',
          cssVar: '--aegisx-opacity-hover',
          description: '0.04',
          category: 'opacity',
        },
        {
          name: 'Opacity Active',
          cssVar: '--aegisx-opacity-active',
          description: '0.12',
          category: 'opacity',
        },

        // Focus Ring
        {
          name: 'Focus Ring Width',
          cssVar: '--aegisx-focus-ring-width',
          description: '3px',
          category: 'focus-ring',
        },
        {
          name: 'Focus Ring Offset',
          cssVar: '--aegisx-focus-ring-offset',
          description: '2px',
          category: 'focus-ring',
        },
        {
          name: 'Focus Ring Opacity',
          cssVar: '--aegisx-focus-ring-opacity',
          description: '0.5',
          category: 'focus-ring',
        },
        {
          name: 'Focus Ring Color',
          cssVar: '--aegisx-focus-ring-color',
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
    }, 100);
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
    }, 100);
  }

  getTotalTokenCount(): number {
    return this.tokenCategories.reduce(
      (total, category) => total + category.tokens.length,
      0,
    );
  }
}
