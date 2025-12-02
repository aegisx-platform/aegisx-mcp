import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { AxThemeBuilderComponent, ThemeBuilderService } from '@aegisx/ui';
import { CodeTabsComponent } from '../../../../../../components/docs/code-tabs/code-tabs.component';
import { CodeTab } from '../../../../../../types/docs.types';

@Component({
  selector: 'app-theme-builder-doc',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    AxThemeBuilderComponent,
    CodeTabsComponent,
  ],
  template: `
    <div class="doc-page">
      <!-- Header -->
      <header class="doc-header">
        <h1>Theme Builder</h1>
        <p class="doc-description">
          Visual editor for customizing design tokens and color palettes. Create
          and export custom themes in SCSS, CSS, JSON, or Tailwind format.
        </p>
        <div class="doc-badges">
          <span class="badge new">New</span>
          <span class="badge">Visual Editor</span>
          <span class="badge">Export Ready</span>
        </div>

        <a
          mat-flat-button
          color="primary"
          routerLink="/tools/theme-builder"
          class="fullscreen-btn"
        >
          <mat-icon>open_in_new</mat-icon>
          Open Full Screen Tool
        </a>
      </header>

      <!-- Quick Features -->
      <section class="feature-grid">
        <div class="feature-card">
          <mat-icon>palette</mat-icon>
          <h3>Color Palettes</h3>
          <p>
            Create complete color palettes with 10 shades from a single base
            color
          </p>
        </div>
        <div class="feature-card">
          <mat-icon>text_fields</mat-icon>
          <h3>Typography</h3>
          <p>Configure font families, sizes, weights, and line heights</p>
        </div>
        <div class="feature-card">
          <mat-icon>space_bar</mat-icon>
          <h3>Spacing & Radius</h3>
          <p>Define consistent spacing scale and border radius values</p>
        </div>
        <div class="feature-card">
          <mat-icon>download</mat-icon>
          <h3>Export</h3>
          <p>Export as SCSS, CSS, JSON, or Tailwind configuration</p>
        </div>
      </section>

      <!-- Live Demo -->
      <section class="doc-section">
        <h2>Live Demo</h2>
        <p>Try the Theme Builder below. Changes are saved automatically.</p>

        <div class="theme-builder-container">
          <ax-theme-builder />
        </div>
      </section>

      <!-- Usage -->
      <section class="doc-section">
        <h2>Usage</h2>

        <mat-tab-group>
          <mat-tab label="Basic">
            <ax-code-tabs [tabs]="basicUsageTabs" />
          </mat-tab>

          <mat-tab label="With Service">
            <ax-code-tabs [tabs]="serviceUsageTabs" />
          </mat-tab>

          <mat-tab label="Programmatic">
            <ax-code-tabs [tabs]="programmaticUsageTabs" />
          </mat-tab>
        </mat-tab-group>
      </section>

      <!-- API Reference -->
      <section class="doc-section">
        <h2>API Reference</h2>

        <h3>ThemeBuilderService</h3>
        <div class="api-table">
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>currentTheme()</code></td>
                <td>Signal containing current theme configuration</td>
              </tr>
              <tr>
                <td><code>updateColor(name, shade, value)</code></td>
                <td>Update a specific color shade</td>
              </tr>
              <tr>
                <td><code>updateColorPalette(name, palette)</code></td>
                <td>Update entire color palette</td>
              </tr>
              <tr>
                <td><code>generateColorPalette(baseColor)</code></td>
                <td>Generate palette from base color</td>
              </tr>
              <tr>
                <td><code>applyPreset(presetId)</code></td>
                <td>Apply a theme preset (aegisx, verus, rose, emerald)</td>
              </tr>
              <tr>
                <td><code>exportTheme(format)</code></td>
                <td>Export theme as SCSS, CSS, JSON, or Tailwind</td>
              </tr>
              <tr>
                <td><code>applyToDocument()</code></td>
                <td>Apply current theme to document CSS variables</td>
              </tr>
              <tr>
                <td><code>saveToStorage()</code></td>
                <td>Save current theme to localStorage</td>
              </tr>
              <tr>
                <td><code>resetToDefault()</code></td>
                <td>Reset to default AegisX theme</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>ThemeBuilderConfig Interface</h3>
        <ax-code-tabs [tabs]="configInterfaceTabs" />

        <h3>Available Presets</h3>
        <div class="preset-grid">
          <button
            mat-stroked-button
            class="preset-btn aegisx"
            (click)="applyPreset('aegisx')"
          >
            <span class="preset-color" style="background: #6366f1"></span>
            AegisX (Indigo)
          </button>
          <button
            mat-stroked-button
            class="preset-btn verus"
            (click)="applyPreset('verus')"
          >
            <span class="preset-color" style="background: #14b8a6"></span>
            Verus (Teal)
          </button>
          <button
            mat-stroked-button
            class="preset-btn rose"
            (click)="applyPreset('rose')"
          >
            <span class="preset-color" style="background: #f43f5e"></span>
            Rose (Pink)
          </button>
          <button
            mat-stroked-button
            class="preset-btn emerald"
            (click)="applyPreset('emerald')"
          >
            <span class="preset-color" style="background: #10b981"></span>
            Emerald (Green)
          </button>
        </div>
      </section>

      <!-- Export Formats -->
      <section class="doc-section">
        <h2>Export Formats</h2>

        <mat-tab-group>
          <mat-tab label="SCSS">
            <ax-code-tabs [tabs]="scssExportTabs" />
          </mat-tab>
          <mat-tab label="CSS">
            <ax-code-tabs [tabs]="cssExportTabs" />
          </mat-tab>
          <mat-tab label="JSON">
            <ax-code-tabs [tabs]="jsonExportTabs" />
          </mat-tab>
          <mat-tab label="Tailwind">
            <ax-code-tabs [tabs]="tailwindExportTabs" />
          </mat-tab>
        </mat-tab-group>
      </section>
    </div>
  `,
  styles: [
    `
      .doc-page {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
      }

      .doc-header {
        margin-bottom: 2rem;

        h1 {
          margin: 0 0 0.5rem;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--ax-text-heading, #0a0a0a);
        }

        .doc-description {
          margin: 0 0 1rem;
          font-size: 1.125rem;
          color: var(--ax-text-secondary, #71717a);
          max-width: 600px;
        }
      }

      .doc-badges {
        display: flex;
        gap: 0.5rem;

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          background: var(--ax-background-subtle, #f4f4f5);
          color: var(--ax-text-secondary, #71717a);

          &.new {
            background: var(--ax-success-100, #dcfce7);
            color: var(--ax-success-700, #15803d);
          }
        }
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 3rem;
      }

      .feature-card {
        padding: 1.5rem;
        background: var(--ax-background-subtle, #f4f4f5);
        border-radius: var(--ax-radius-lg, 0.5rem);
        border: 1px solid var(--ax-border-default, #e4e4e7);

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: var(--ax-brand-500, #6366f1);
          margin-bottom: 0.75rem;
        }

        h3 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ax-text-heading, #0a0a0a);
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ax-text-secondary, #71717a);
        }
      }

      .doc-section {
        margin-bottom: 3rem;

        h2 {
          margin: 0 0 1rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ax-text-heading, #0a0a0a);
          border-bottom: 1px solid var(--ax-border-default, #e4e4e7);
          padding-bottom: 0.5rem;
        }

        h3 {
          margin: 1.5rem 0 0.75rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--ax-text-heading, #0a0a0a);
        }
      }

      .theme-builder-container {
        border: 1px solid var(--ax-border-default, #e4e4e7);
        border-radius: var(--ax-radius-lg, 0.5rem);
        overflow: hidden;
        height: 700px;
      }

      .api-table {
        overflow-x: auto;

        table {
          width: 100%;
          border-collapse: collapse;

          th,
          td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid var(--ax-border-default, #e4e4e7);
          }

          th {
            font-weight: 600;
            background: var(--ax-background-subtle, #f4f4f5);
            color: var(--ax-text-heading, #0a0a0a);
          }

          td {
            color: var(--ax-text-primary, #3f3f46);

            code {
              background: var(--ax-background-subtle, #f4f4f5);
              padding: 0.125rem 0.375rem;
              border-radius: var(--ax-radius-sm, 0.25rem);
              font-family: monospace;
              font-size: 0.875rem;
            }
          }
        }
      }

      .preset-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .preset-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .preset-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }
      }
    `,
  ],
})
export class ThemeBuilderDocComponent {
  constructor(private themeService: ThemeBuilderService) {}

  applyPreset(presetId: string): void {
    this.themeService.applyPreset(presetId);
    this.themeService.applyToDocument();
  }

  basicUsageTabs: CodeTab[] = [
    {
      label: 'Template',
      language: 'html',
      code: `<!-- Simply add the component to your template -->
<ax-theme-builder />`,
    },
    {
      label: 'Module',
      language: 'typescript',
      code: `import { Component } from '@angular/core';
import { AxThemeBuilderComponent } from '@aegisx/ui';

@Component({
  selector: 'app-theme-page',
  standalone: true,
  imports: [AxThemeBuilderComponent],
  template: \`<ax-theme-builder />\`
})
export class ThemePageComponent {}`,
    },
  ];

  serviceUsageTabs: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { Component, inject } from '@angular/core';
import { ThemeBuilderService } from '@aegisx/ui';

@Component({
  selector: 'app-custom-theme',
  template: \`
    <button (click)="exportAsCSS()">Export CSS</button>
    <button (click)="applyTheme()">Apply Theme</button>
  \`
})
export class CustomThemeComponent {
  private themeService = inject(ThemeBuilderService);

  exportAsCSS(): void {
    const css = this.themeService.exportTheme('css');
    console.log(css);
    // Copy to clipboard
    navigator.clipboard.writeText(css);
  }

  applyTheme(): void {
    this.themeService.applyToDocument();
  }
}`,
    },
  ];

  programmaticUsageTabs: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { ThemeBuilderService } from '@aegisx/ui';

// Inject the service
constructor(private themeService: ThemeBuilderService) {}

// Update a single color
this.themeService.updateColor('brand', 500, '#8b5cf6');

// Generate and apply a full palette from base color
const palette = this.themeService.generateColorPalette('#8b5cf6');
this.themeService.updateColorPalette('brand', palette);

// Apply a preset
this.themeService.applyPreset('verus');

// Export theme
const scss = this.themeService.exportTheme('scss');
const css = this.themeService.exportTheme('css');
const json = this.themeService.exportTheme('json');
const tailwind = this.themeService.exportTheme('tailwind');

// Apply to document
this.themeService.applyToDocument();

// Save to localStorage
this.themeService.saveToStorage();

// Reset to default
this.themeService.resetToDefault();`,
    },
  ];

  configInterfaceTabs: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `interface ThemeBuilderConfig {
  name: string;
  mode: 'light' | 'dark';
  colors: {
    brand: ColorPalette;
    success: ColorPalette;
    warning: ColorPalette;
    error: ColorPalette;
    info: ColorPalette;
    // ... more semantic colors
  };
  background: {
    muted: string;
    subtle: string;
    default: string;
    emphasis: string;
  };
  text: {
    disabled: string;
    subtle: string;
    secondary: string;
    primary: string;
    heading: string;
    inverted: string;
  };
  border: {
    muted: string;
    default: string;
    emphasis: string;
  };
  typography: TypographyConfig;
  spacing: SpacingConfig;
  radius: RadiusConfig;
  shadows: ShadowConfig;
}

interface ColorPalette {
  50: string;   // Lightest
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;  // Main color
  600: string;
  700: string;
  800: string;
  900: string;  // Darkest
}`,
    },
  ];

  scssExportTabs: CodeTab[] = [
    {
      label: 'SCSS Output',
      language: 'scss',
      code: `// AegisX Theme: Custom Theme
// Generated by Theme Builder

// Color Palettes
$ax-brand-50: #eef2ff;
$ax-brand-100: #e0e7ff;
$ax-brand-200: #c7d2fe;
$ax-brand-300: #a5b4fc;
$ax-brand-400: #818cf8;
$ax-brand-500: #6366f1;
$ax-brand-600: #4f46e5;
$ax-brand-700: #4338ca;
$ax-brand-800: #3730a3;
$ax-brand-900: #312e81;

// Background
$ax-background-muted: #fafafa;
$ax-background-subtle: #f4f4f5;
$ax-background-default: #ffffff;
$ax-background-emphasis: #3f3f46;

// ... more variables`,
    },
  ];

  cssExportTabs: CodeTab[] = [
    {
      label: 'CSS Output',
      language: 'scss',
      code: `/* AegisX Theme: Custom Theme */
/* Generated by Theme Builder */

:root {
  --ax-brand-50: #eef2ff;
  --ax-brand-100: #e0e7ff;
  --ax-brand-200: #c7d2fe;
  --ax-brand-500: #6366f1;
  --ax-brand-700: #4338ca;
  --ax-brand-900: #312e81;

  --ax-background-muted: #fafafa;
  --ax-background-subtle: #f4f4f5;
  --ax-background-default: #ffffff;

  --ax-text-heading: #0a0a0a;
  --ax-text-primary: #3f3f46;
  --ax-text-secondary: #71717a;

  --ax-radius-sm: 0.25rem;
  --ax-radius-md: 0.375rem;
  --ax-radius-lg: 0.5rem;
}`,
    },
  ];

  jsonExportTabs: CodeTab[] = [
    {
      label: 'JSON Output',
      language: 'json',
      code: `{
  "name": "Custom Theme",
  "mode": "light",
  "colors": {
    "brand": {
      "50": "#eef2ff",
      "100": "#e0e7ff",
      "500": "#6366f1",
      "700": "#4338ca",
      "900": "#312e81"
    },
    "success": { ... },
    "warning": { ... },
    "error": { ... }
  },
  "background": {
    "muted": "#fafafa",
    "subtle": "#f4f4f5",
    "default": "#ffffff"
  },
  "typography": {
    "fontFamily": "Inter, sans-serif",
    "fontSize": { ... }
  }
}`,
    },
  ];

  tailwindExportTabs: CodeTab[] = [
    {
      label: 'Tailwind Config',
      language: 'typescript',
      code: `// Tailwind Config Extension
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81"
        },
        success: { ... },
        warning: { ... },
        error: { ... }
      }
    }
  }
}`,
    },
  ];
}
