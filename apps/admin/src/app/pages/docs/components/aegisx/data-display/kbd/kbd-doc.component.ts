import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AxKbdComponent } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { CodeTab, ComponentToken } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-kbd-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    AxKbdComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="kbd-doc">
      <ax-doc-header
        title="Kbd"
        icon="keyboard"
        description="Display keyboard shortcuts and key combinations with platform-aware styling. Automatically converts Ctrl to Cmd on macOS."
        [breadcrumbs]="[
          {
            label: 'Data Display',
            link: '/docs/components/aegisx/data-display/overview',
          },
          { label: 'Kbd' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxKbdComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="kbd-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="kbd-doc__tab-content">
            <section class="kbd-doc__section">
              <h2>Basic Usage</h2>
              <p>
                Display single keys or key combinations for documentation,
                tooltips, and UI elements.
              </p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-md)">
                <ax-kbd>K</ax-kbd>
                <ax-kbd>Enter</ax-kbd>
                <ax-kbd>Esc</ax-kbd>
                <ax-kbd>Tab</ax-kbd>
                <ax-kbd>Space</ax-kbd>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="kbd-doc__section">
              <h2>Key Combinations</h2>
              <p>
                Use the <code>shortcut</code> input for common key combinations,
                or <code>keys</code> array for more control.
              </p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-lg)">
                <div class="shortcut-row">
                  <span class="shortcut-label">Save:</span>
                  <ax-kbd shortcut="Ctrl+S"></ax-kbd>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-label">Search:</span>
                  <ax-kbd shortcut="Ctrl+K"></ax-kbd>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-label">Command Palette:</span>
                  <ax-kbd shortcut="Ctrl+Shift+P"></ax-kbd>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-label">Undo:</span>
                  <ax-kbd shortcut="Ctrl+Z"></ax-kbd>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="combinationsCode"></ax-code-tabs>
            </section>

            <section class="kbd-doc__section">
              <h2>Sizes</h2>
              <p>Three size options to fit different contexts.</p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-lg)">
                <div class="size-row">
                  <span class="size-label">Small:</span>
                  <ax-kbd size="sm" shortcut="Ctrl+S"></ax-kbd>
                </div>
                <div class="size-row">
                  <span class="size-label">Medium (default):</span>
                  <ax-kbd size="md" shortcut="Ctrl+S"></ax-kbd>
                </div>
                <div class="size-row">
                  <span class="size-label">Large:</span>
                  <ax-kbd size="lg" shortcut="Ctrl+S"></ax-kbd>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="sizesCode"></ax-code-tabs>
            </section>

            <section class="kbd-doc__section">
              <h2>Variants</h2>
              <p>
                Choose from three visual styles to match your design context.
              </p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-lg)">
                <div class="variant-row">
                  <span class="variant-label">Default (elevated):</span>
                  <ax-kbd variant="default" shortcut="Ctrl+K"></ax-kbd>
                </div>
                <div class="variant-row">
                  <span class="variant-label">Outline:</span>
                  <ax-kbd variant="outline" shortcut="Ctrl+K"></ax-kbd>
                </div>
                <div class="variant-row">
                  <span class="variant-label">Ghost:</span>
                  <ax-kbd variant="ghost" shortcut="Ctrl+K"></ax-kbd>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="variantsCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="kbd-doc__tab-content">
            <section class="kbd-doc__section">
              <h2>Common Shortcuts</h2>
              <p>Frequently used keyboard shortcuts for reference.</p>

              <ax-live-preview variant="bordered">
                <div class="shortcuts-grid">
                  <div class="shortcut-item">
                    <ax-kbd shortcut="Ctrl+C"></ax-kbd>
                    <span>Copy</span>
                  </div>
                  <div class="shortcut-item">
                    <ax-kbd shortcut="Ctrl+V"></ax-kbd>
                    <span>Paste</span>
                  </div>
                  <div class="shortcut-item">
                    <ax-kbd shortcut="Ctrl+X"></ax-kbd>
                    <span>Cut</span>
                  </div>
                  <div class="shortcut-item">
                    <ax-kbd shortcut="Ctrl+Z"></ax-kbd>
                    <span>Undo</span>
                  </div>
                  <div class="shortcut-item">
                    <ax-kbd shortcut="Ctrl+Shift+Z"></ax-kbd>
                    <span>Redo</span>
                  </div>
                  <div class="shortcut-item">
                    <ax-kbd shortcut="Ctrl+A"></ax-kbd>
                    <span>Select All</span>
                  </div>
                  <div class="shortcut-item">
                    <ax-kbd shortcut="Ctrl+F"></ax-kbd>
                    <span>Find</span>
                  </div>
                  <div class="shortcut-item">
                    <ax-kbd shortcut="Ctrl+H"></ax-kbd>
                    <span>Replace</span>
                  </div>
                </div>
              </ax-live-preview>
            </section>

            <section class="kbd-doc__section">
              <h2>Navigation Keys</h2>
              <p>Arrow keys and navigation shortcuts.</p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-md)">
                <ax-kbd>Up</ax-kbd>
                <ax-kbd>Down</ax-kbd>
                <ax-kbd>Left</ax-kbd>
                <ax-kbd>Right</ax-kbd>
                <ax-kbd>Home</ax-kbd>
                <ax-kbd>End</ax-kbd>
                <ax-kbd>PageUp</ax-kbd>
                <ax-kbd>PageDown</ax-kbd>
              </ax-live-preview>
            </section>

            <section class="kbd-doc__section">
              <h2>Modifier Keys</h2>
              <p>Platform-aware modifier key display.</p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-md)">
                <ax-kbd>Ctrl</ax-kbd>
                <ax-kbd>Alt</ax-kbd>
                <ax-kbd>Shift</ax-kbd>
                <ax-kbd>Cmd</ax-kbd>
                <ax-kbd>Tab</ax-kbd>
                <ax-kbd>Enter</ax-kbd>
                <ax-kbd>Backspace</ax-kbd>
                <ax-kbd>Delete</ax-kbd>
              </ax-live-preview>
            </section>

            <section class="kbd-doc__section">
              <h2>In Documentation Context</h2>
              <p>Example of keyboard shortcuts in a documentation tooltip.</p>

              <ax-live-preview variant="bordered">
                <div class="tooltip-example">
                  <div class="tooltip-content">
                    <span class="tooltip-action">Open Command Palette</span>
                    <ax-kbd
                      variant="ghost"
                      size="sm"
                      shortcut="Ctrl+Shift+P"
                    ></ax-kbd>
                  </div>
                  <div class="tooltip-content">
                    <span class="tooltip-action">Quick Search</span>
                    <ax-kbd
                      variant="ghost"
                      size="sm"
                      shortcut="Ctrl+K"
                    ></ax-kbd>
                  </div>
                  <div class="tooltip-content">
                    <span class="tooltip-action">Toggle Sidebar</span>
                    <ax-kbd
                      variant="ghost"
                      size="sm"
                      shortcut="Ctrl+B"
                    ></ax-kbd>
                  </div>
                </div>
              </ax-live-preview>
            </section>

            <section class="kbd-doc__section">
              <h2>Using Keys Array</h2>
              <p>
                For dynamic or complex key combinations, use the
                <code>keys</code> array input.
              </p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-lg)">
                <ax-kbd [keys]="['Ctrl', 'Alt', 'Delete']"></ax-kbd>
                <ax-kbd [keys]="['Shift', 'F5']"></ax-kbd>
                <ax-kbd [keys]="['Alt', 'Tab']"></ax-kbd>
              </ax-live-preview>

              <ax-code-tabs [tabs]="keysArrayCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="kbd-doc__tab-content">
            <section class="kbd-doc__section">
              <h2>Inputs</h2>

              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Input</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>variant</code></td>
                      <td>'default' | 'outline' | 'ghost'</td>
                      <td>'default'</td>
                      <td>Visual style of the kbd element</td>
                    </tr>
                    <tr>
                      <td><code>size</code></td>
                      <td>'sm' | 'md' | 'lg'</td>
                      <td>'md'</td>
                      <td>Size of the kbd element</td>
                    </tr>
                    <tr>
                      <td><code>keys</code></td>
                      <td>string[]</td>
                      <td>[]</td>
                      <td>Array of keys to display</td>
                    </tr>
                    <tr>
                      <td><code>shortcut</code></td>
                      <td>string</td>
                      <td>''</td>
                      <td>Shortcut string (e.g., 'Ctrl+S')</td>
                    </tr>
                    <tr>
                      <td><code>platformAware</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Convert Ctrl to Cmd on macOS</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="kbd-doc__section">
              <h2>Key Mappings</h2>
              <p>
                The component automatically converts common key names to
                symbols.
              </p>

              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Input</th>
                      <th>Display</th>
                      <th>macOS Display</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Ctrl / Control</td>
                      <td>Ctrl</td>
                      <td>⌘ (when platformAware)</td>
                    </tr>
                    <tr>
                      <td>Cmd / Command</td>
                      <td>⌘</td>
                      <td>⌘</td>
                    </tr>
                    <tr>
                      <td>Alt / Option</td>
                      <td>Alt</td>
                      <td>⌥</td>
                    </tr>
                    <tr>
                      <td>Shift</td>
                      <td>⇧</td>
                      <td>⇧</td>
                    </tr>
                    <tr>
                      <td>Enter / Return</td>
                      <td>↵</td>
                      <td>↵</td>
                    </tr>
                    <tr>
                      <td>Tab</td>
                      <td>⇥</td>
                      <td>⇥</td>
                    </tr>
                    <tr>
                      <td>Backspace</td>
                      <td>⌫</td>
                      <td>⌫</td>
                    </tr>
                    <tr>
                      <td>Delete</td>
                      <td>⌦</td>
                      <td>⌦</td>
                    </tr>
                    <tr>
                      <td>Escape / Esc</td>
                      <td>Esc</td>
                      <td>Esc</td>
                    </tr>
                    <tr>
                      <td>Up/Down/Left/Right</td>
                      <td>↑ ↓ ← →</td>
                      <td>↑ ↓ ← →</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="kbd-doc__tab-content">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .kbd-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .kbd-doc__tabs {
        margin-top: 1rem;
      }

      .kbd-doc__tab-content {
        padding: 1.5rem 0;
      }

      .kbd-doc__section {
        margin-bottom: 3rem;

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin-bottom: 0.75rem;
        }

        > p {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;

          code {
            background: var(--ax-background-subtle);
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
            font-size: 0.875rem;
          }
        }
      }

      .shortcut-row,
      .size-row,
      .variant-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem 0;
      }

      .shortcut-label,
      .size-label,
      .variant-label {
        min-width: 160px;
        font-size: 0.875rem;
        color: var(--ax-text-secondary);
      }

      .shortcuts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
      }

      .shortcut-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        background: var(--ax-background-subtle);
        border-radius: 8px;

        span {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }
      }

      .tooltip-example {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        background: var(--ax-background-elevated);
        border-radius: 8px;
        border: 1px solid var(--ax-border-default);
      }

      .tooltip-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        border-radius: 4px;

        &:hover {
          background: var(--ax-background-subtle);
        }
      }

      .tooltip-action {
        font-size: 0.875rem;
        color: var(--ax-text-default);
      }

      .api-table {
        overflow-x: auto;
        border: 1px solid var(--ax-border-default);
        border-radius: 12px;

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;

          th,
          td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid var(--ax-border-default);
          }

          th {
            font-weight: 600;
            color: var(--ax-text-heading);
            background: var(--ax-background-subtle);
          }

          code {
            background: var(--ax-background-subtle);
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
            font-size: 0.8125rem;
          }

          tr:last-child td {
            border-bottom: none;
          }
        }
      }
    `,
  ],
})
export class KbdDocComponent {
  // Code examples
  readonly basicUsageCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Single key -->
<ax-kbd>K</ax-kbd>
<ax-kbd>Enter</ax-kbd>
<ax-kbd>Esc</ax-kbd>
<ax-kbd>Tab</ax-kbd>
<ax-kbd>Space</ax-kbd>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { AxKbdComponent } from '@aegisx/ui';

@Component({
  imports: [AxKbdComponent],
  ...
})`,
    },
  ];

  readonly combinationsCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Using shortcut string -->
<ax-kbd shortcut="Ctrl+S"></ax-kbd>
<ax-kbd shortcut="Ctrl+K"></ax-kbd>
<ax-kbd shortcut="Ctrl+Shift+P"></ax-kbd>

<!-- Platform-aware: Ctrl becomes Cmd on macOS -->
<ax-kbd shortcut="Ctrl+Z" [platformAware]="true"></ax-kbd>`,
    },
  ];

  readonly sizesCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ax-kbd size="sm" shortcut="Ctrl+S"></ax-kbd>
<ax-kbd size="md" shortcut="Ctrl+S"></ax-kbd>
<ax-kbd size="lg" shortcut="Ctrl+S"></ax-kbd>`,
    },
  ];

  readonly variantsCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Default - elevated button look -->
<ax-kbd variant="default" shortcut="Ctrl+K"></ax-kbd>

<!-- Outline - bordered style -->
<ax-kbd variant="outline" shortcut="Ctrl+K"></ax-kbd>

<!-- Ghost - subtle background -->
<ax-kbd variant="ghost" shortcut="Ctrl+K"></ax-kbd>`,
    },
  ];

  readonly keysArrayCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Using keys array for dynamic combinations -->
<ax-kbd [keys]="['Ctrl', 'Alt', 'Delete']"></ax-kbd>
<ax-kbd [keys]="['Shift', 'F5']"></ax-kbd>
<ax-kbd [keys]="myKeys"></ax-kbd>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `export class MyComponent {
  myKeys = ['Ctrl', 'Shift', 'N'];

  // Dynamic key building
  buildShortcut(action: string): string[] {
    const modifiers = ['Ctrl'];
    if (action === 'save') return [...modifiers, 'S'];
    if (action === 'copy') return [...modifiers, 'C'];
    return modifiers;
  }
}`,
    },
  ];

  // Design tokens
  readonly designTokens: ComponentToken[] = [
    {
      category: 'Typography',
      cssVar: '--ax-font-mono',
      usage: 'Monospace font for key display',
    },
    {
      category: 'Spacing',
      cssVar: '--ax-radius-sm',
      usage: 'Border radius for kbd elements',
    },
    {
      category: 'Colors',
      cssVar: '--ax-background-default',
      usage: 'Background color (default variant)',
    },
    {
      category: 'Colors',
      cssVar: '--ax-background-subtle',
      usage: 'Background color (ghost variant)',
    },
    {
      category: 'Colors',
      cssVar: '--ax-border-default',
      usage: 'Border color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-default',
      usage: 'Key text color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-text-muted',
      usage: 'Separator (+) color',
    },
  ];
}
