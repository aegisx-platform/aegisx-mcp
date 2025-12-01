import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  MonacoEditorModule,
  NGX_MONACO_EDITOR_CONFIG,
  NgxMonacoEditorConfig,
} from 'ngx-monaco-editor-v2';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../components/docs';
import { CodeTab, ComponentToken } from '../../../../types/docs.types';

const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: '/assets/monaco-editor/min/vs',
  defaultOptions: { scrollBeyondLastLine: false },
};

@Component({
  selector: 'ax-monaco-editor-doc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MonacoEditorModule,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  providers: [{ provide: NGX_MONACO_EDITOR_CONFIG, useValue: monacoConfig }],
  template: `
    <div class="monaco-editor-doc">
      <ax-doc-header
        title="Monaco Editor"
        icon="code"
        description="VS Code's powerful code editor in your Angular application. Syntax highlighting, IntelliSense, and more for 40+ languages."
        [breadcrumbs]="[
          { label: 'Integrations', link: '/docs/integrations/overview' },
          { label: 'Monaco Editor' },
        ]"
        status="stable"
        version="2.x"
        importStatement="import { MonacoEditorModule } from 'ngx-monaco-editor-v2';"
      ></ax-doc-header>

      <!-- Library Reference -->
      <div class="library-reference">
        <mat-icon>info</mat-icon>
        <span>
          This integration uses
          <a
            href="https://github.com/nicegood8787/ngx-monaco-editor-v2"
            target="_blank"
            rel="noopener"
          >
            ngx-monaco-editor-v2
          </a>
          library (MIT License)
        </span>
      </div>

      <mat-tab-group class="monaco-editor-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="monaco-editor-doc__tab-content">
            <section class="monaco-editor-doc__section">
              <h2>Code Editor</h2>
              <p>
                Full-featured code editor with syntax highlighting,
                IntelliSense, and theme support.
              </p>

              <ax-live-preview variant="bordered" minHeight="400px">
                <div class="editor-container">
                  <ngx-monaco-editor
                    [options]="editorOptions()"
                    [(ngModel)]="code"
                    class="editor"
                  >
                  </ngx-monaco-editor>
                </div>
              </ax-live-preview>

              <div class="demo-controls">
                <mat-form-field appearance="outline">
                  <mat-label>Language</mat-label>
                  <mat-select
                    [value]="language()"
                    (selectionChange)="changeLanguage($event.value)"
                  >
                    <mat-option value="typescript">TypeScript</mat-option>
                    <mat-option value="javascript">JavaScript</mat-option>
                    <mat-option value="html">HTML</mat-option>
                    <mat-option value="css">CSS</mat-option>
                    <mat-option value="json">JSON</mat-option>
                    <mat-option value="python">Python</mat-option>
                    <mat-option value="sql">SQL</mat-option>
                    <mat-option value="markdown">Markdown</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Theme</mat-label>
                  <mat-select
                    [value]="theme()"
                    (selectionChange)="changeTheme($event.value)"
                  >
                    <mat-option value="vs">Light (VS)</mat-option>
                    <mat-option value="vs-dark">Dark (VS Dark)</mat-option>
                    <mat-option value="hc-black">High Contrast</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-slide-toggle
                  [checked]="minimap()"
                  (change)="minimap.set($event.checked)"
                >
                  Show Minimap
                </mat-slide-toggle>

                <mat-slide-toggle
                  [checked]="lineNumbers()"
                  (change)="lineNumbers.set($event.checked)"
                >
                  Line Numbers
                </mat-slide-toggle>
              </div>

              <ax-code-tabs [tabs]="basicCode"></ax-code-tabs>
            </section>

            <section class="monaco-editor-doc__section">
              <h2>Key Features</h2>
              <p>Monaco Editor provides VS Code's editing experience.</p>

              <div class="features-grid">
                <div class="feature-card">
                  <mat-icon>palette</mat-icon>
                  <h4>Syntax Highlighting</h4>
                  <p>40+ built-in language support</p>
                </div>
                <div class="feature-card">
                  <mat-icon>lightbulb</mat-icon>
                  <h4>IntelliSense</h4>
                  <p>Auto-completion and suggestions</p>
                </div>
                <div class="feature-card">
                  <mat-icon>search</mat-icon>
                  <h4>Find & Replace</h4>
                  <p>Regex support, multi-cursor</p>
                </div>
                <div class="feature-card">
                  <mat-icon>format_indent_increase</mat-icon>
                  <h4>Code Formatting</h4>
                  <p>Auto-indent and formatting</p>
                </div>
                <div class="feature-card">
                  <mat-icon>unfold_less</mat-icon>
                  <h4>Code Folding</h4>
                  <p>Collapse/expand code sections</p>
                </div>
                <div class="feature-card">
                  <mat-icon>settings</mat-icon>
                  <h4>Highly Configurable</h4>
                  <p>100+ customization options</p>
                </div>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="monaco-editor-doc__tab-content">
            <section class="monaco-editor-doc__section">
              <h2>Diff Editor</h2>
              <p>Compare two versions of code side by side.</p>

              <ax-live-preview variant="bordered" minHeight="350px">
                <div class="editor-container">
                  <ngx-monaco-diff-editor
                    [options]="diffOptions"
                    [originalModel]="originalModel"
                    [modifiedModel]="modifiedModel"
                    class="editor"
                  >
                  </ngx-monaco-diff-editor>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="diffCode"></ax-code-tabs>
            </section>

            <section class="monaco-editor-doc__section">
              <h2>Read-Only Mode</h2>
              <p>Display code without allowing edits.</p>

              <ax-code-tabs [tabs]="readOnlyCode"></ax-code-tabs>
            </section>

            <section class="monaco-editor-doc__section">
              <h2>Custom Language</h2>
              <p>Register custom languages with syntax rules.</p>

              <ax-code-tabs [tabs]="customLanguageCode"></ax-code-tabs>
            </section>

            <section class="monaco-editor-doc__section">
              <h2>Editor Events</h2>
              <p>React to editor changes and user interactions.</p>

              <ax-code-tabs [tabs]="eventsCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="monaco-editor-doc__tab-content">
            <section class="monaco-editor-doc__section">
              <h2>Editor Options</h2>
              <p>Common configuration options for Monaco Editor.</p>

              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Option</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>language</code></td>
                      <td>string</td>
                      <td>'plaintext'</td>
                      <td>Programming language for syntax</td>
                    </tr>
                    <tr>
                      <td><code>theme</code></td>
                      <td>string</td>
                      <td>'vs'</td>
                      <td>Editor theme (vs, vs-dark, hc-black)</td>
                    </tr>
                    <tr>
                      <td><code>readOnly</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Make editor read-only</td>
                    </tr>
                    <tr>
                      <td><code>minimap</code></td>
                      <td>object</td>
                      <td>&#123; enabled: true &#125;</td>
                      <td>Minimap settings</td>
                    </tr>
                    <tr>
                      <td><code>lineNumbers</code></td>
                      <td>string</td>
                      <td>'on'</td>
                      <td>'on', 'off', 'relative', 'interval'</td>
                    </tr>
                    <tr>
                      <td><code>wordWrap</code></td>
                      <td>string</td>
                      <td>'off'</td>
                      <td>'on', 'off', 'wordWrapColumn', 'bounded'</td>
                    </tr>
                    <tr>
                      <td><code>fontSize</code></td>
                      <td>number</td>
                      <td>14</td>
                      <td>Font size in pixels</td>
                    </tr>
                    <tr>
                      <td><code>tabSize</code></td>
                      <td>number</td>
                      <td>4</td>
                      <td>Tab size in spaces</td>
                    </tr>
                    <tr>
                      <td><code>automaticLayout</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Auto-resize to container</td>
                    </tr>
                    <tr>
                      <td><code>scrollBeyondLastLine</code></td>
                      <td>boolean</td>
                      <td>true</td>
                      <td>Allow scrolling past content</td>
                    </tr>
                    <tr>
                      <td><code>formatOnPaste</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Auto-format on paste</td>
                    </tr>
                    <tr>
                      <td><code>formatOnType</code></td>
                      <td>boolean</td>
                      <td>false</td>
                      <td>Auto-format while typing</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="monaco-editor-doc__section">
              <h2>Component Inputs</h2>
              <p>Angular-specific inputs for the editor component.</p>

              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Input</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>options</code></td>
                      <td>IEditorOptions</td>
                      <td>Monaco editor options object</td>
                    </tr>
                    <tr>
                      <td><code>ngModel</code></td>
                      <td>string</td>
                      <td>Editor content (two-way binding)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="monaco-editor-doc__section">
              <h2>Component Outputs</h2>
              <p>Events emitted by the editor.</p>

              <div class="api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Output</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>onInit</code></td>
                      <td>IStandaloneCodeEditor</td>
                      <td>Editor instance ready</td>
                    </tr>
                    <tr>
                      <td><code>ngModelChange</code></td>
                      <td>string</td>
                      <td>Content changed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="monaco-editor-doc__section">
              <h2>Supported Languages</h2>
              <p>Built-in language support (partial list).</p>

              <div class="languages-grid">
                <span class="lang-chip">TypeScript</span>
                <span class="lang-chip">JavaScript</span>
                <span class="lang-chip">HTML</span>
                <span class="lang-chip">CSS/SCSS/LESS</span>
                <span class="lang-chip">JSON</span>
                <span class="lang-chip">Python</span>
                <span class="lang-chip">Java</span>
                <span class="lang-chip">C/C++</span>
                <span class="lang-chip">C#</span>
                <span class="lang-chip">Go</span>
                <span class="lang-chip">Rust</span>
                <span class="lang-chip">SQL</span>
                <span class="lang-chip">PHP</span>
                <span class="lang-chip">Ruby</span>
                <span class="lang-chip">Swift</span>
                <span class="lang-chip">Kotlin</span>
                <span class="lang-chip">YAML</span>
                <span class="lang-chip">Markdown</span>
                <span class="lang-chip">Shell/Bash</span>
                <span class="lang-chip">XML</span>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="monaco-editor-doc__tab-content">
            <ax-component-tokens [tokens]="designTokens"></ax-component-tokens>

            <section class="monaco-editor-doc__section">
              <h2>Custom Theme</h2>
              <p>Create custom editor themes.</p>

              <ax-code-tabs [tabs]="themeCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="monaco-editor-doc__tab-content">
            <section class="monaco-editor-doc__section">
              <h2>Installation</h2>
              <p>Setup requirements for ngx-monaco-editor-v2.</p>

              <ax-code-tabs [tabs]="installationCode"></ax-code-tabs>
            </section>

            <section class="monaco-editor-doc__section">
              <h2>Best Practices</h2>

              <div class="guidelines-grid">
                <div class="guideline guideline--do">
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Use automaticLayout for responsive editors</li>
                    <li>Set appropriate height for the container</li>
                    <li>Use readOnly for display-only scenarios</li>
                    <li>Dispose editors on component destroy</li>
                    <li>Load monaco from CDN for smaller bundles</li>
                  </ul>
                </div>

                <div class="guideline guideline--dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Create too many editor instances</li>
                    <li>Use without fixed height container</li>
                    <li>Forget to handle initial content loading</li>
                    <li>Ignore performance on mobile devices</li>
                    <li>Use full Monaco for simple highlighting</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="monaco-editor-doc__section">
              <h2>Common Use Cases</h2>

              <div class="use-cases">
                <div class="use-case">
                  <mat-icon>edit_note</mat-icon>
                  <div>
                    <strong>Code Playgrounds</strong>
                    <p>Interactive code examples with live preview</p>
                  </div>
                </div>
                <div class="use-case">
                  <mat-icon>settings</mat-icon>
                  <div>
                    <strong>Configuration Editors</strong>
                    <p>Edit JSON, YAML, or custom config files</p>
                  </div>
                </div>
                <div class="use-case">
                  <mat-icon>compare</mat-icon>
                  <div>
                    <strong>Code Review</strong>
                    <p>Diff editor for comparing versions</p>
                  </div>
                </div>
                <div class="use-case">
                  <mat-icon>article</mat-icon>
                  <div>
                    <strong>Documentation</strong>
                    <p>Display code snippets with syntax highlighting</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="monaco-editor-doc__section">
              <h2>Performance Tips</h2>

              <div class="tips-list">
                <div class="tip">
                  <mat-icon>cloud</mat-icon>
                  <div>
                    <strong>Use CDN Loading</strong>
                    <p>
                      Load Monaco from CDN instead of bundling to reduce bundle
                      size.
                    </p>
                  </div>
                </div>
                <div class="tip">
                  <mat-icon>memory</mat-icon>
                  <div>
                    <strong>Dispose When Done</strong>
                    <p>
                      Call editor.dispose() when removing editors to free
                      memory.
                    </p>
                  </div>
                </div>
                <div class="tip">
                  <mat-icon>view_module</mat-icon>
                  <div>
                    <strong>Lazy Load</strong>
                    <p>Load Monaco editor module only when needed.</p>
                  </div>
                </div>
                <div class="tip">
                  <mat-icon>tune</mat-icon>
                  <div>
                    <strong>Disable Unused Features</strong>
                    <p>
                      Turn off minimap, folding, or suggestions if not needed.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .monaco-editor-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .library-reference {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: var(--ax-info-faint);
        border: 1px solid var(--ax-border-default);
        border-radius: 12px;
        margin-bottom: 1.5rem;
        font-size: 0.875rem;

        mat-icon {
          color: var(--ax-info-default);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        a {
          color: var(--ax-brand-default);
          font-weight: 500;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .monaco-editor-doc__tabs {
        margin-top: 1rem;
      }

      .monaco-editor-doc__tab-content {
        padding: 1.5rem 0;
      }

      .monaco-editor-doc__section {
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
        }
      }

      .editor-container {
        width: 100%;
        height: 350px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--ax-border-default);
      }

      .editor {
        height: 100%;
      }

      .demo-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
        margin: 1rem 0;

        mat-form-field {
          min-width: 150px;
        }
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;

        @media (max-width: 768px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 480px) {
          grid-template-columns: 1fr;
        }
      }

      .feature-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 1.5rem 1rem;
        background: var(--ax-background-subtle);
        border-radius: 12px;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: var(--ax-brand-default);
          margin-bottom: 0.75rem;
        }

        h4 {
          margin: 0 0 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--ax-text-secondary);
        }
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

      .languages-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .lang-chip {
        display: inline-block;
        padding: 0.375rem 0.75rem;
        background: var(--ax-background-subtle);
        border: 1px solid var(--ax-border-default);
        border-radius: 16px;
        font-size: 0.8125rem;
        color: var(--ax-text-default);
      }

      .guidelines-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .guideline {
        padding: 1rem;
        border-radius: 12px;

        h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.75rem;
          font-weight: 600;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        ul {
          margin: 0;
          padding-left: 1.25rem;

          li {
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }
        }
      }

      .guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }

        li {
          color: var(--ax-success-emphasis);
        }
      }

      .guideline--dont {
        background: var(--ax-error-faint);

        h4 {
          color: var(--ax-error-emphasis);
        }

        li {
          color: var(--ax-error-emphasis);
        }
      }

      .use-cases {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .use-case {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        background: var(--ax-background-subtle);
        border-radius: 8px;

        mat-icon {
          color: var(--ax-brand-default);
        }

        strong {
          display: block;
          color: var(--ax-text-heading);
          margin-bottom: 0.25rem;
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }
      }

      .tips-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .tip {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        background: var(--ax-background-subtle);
        border-radius: 8px;

        mat-icon {
          color: var(--ax-brand-default);
        }

        strong {
          display: block;
          color: var(--ax-text-heading);
          margin-bottom: 0.25rem;
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }
      }
    `,
  ],
})
export class MonacoEditorDocComponent {
  // State signals
  language = signal('typescript');
  theme = signal('vs-dark');
  minimap = signal(true);
  lineNumbers = signal(true);

  // Sample code
  code = `// TypeScript Example
interface User {
  id: string;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const user: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com'
};

console.log(greetUser(user));
`;

  // Computed editor options
  editorOptions = signal({
    theme: 'vs-dark',
    language: 'typescript',
    minimap: { enabled: true },
    lineNumbers: 'on' as const,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
  });

  // Diff editor config
  diffOptions = {
    theme: 'vs-dark',
    language: 'typescript',
    readOnly: true,
    automaticLayout: true,
  };

  originalModel = {
    code: `function hello() {\n  console.log("Hello");\n}`,
    language: 'typescript',
  };

  modifiedModel = {
    code: `function hello(name: string) {\n  console.log(\`Hello, \${name}!\`);\n}`,
    language: 'typescript',
  };

  // Design tokens
  designTokens: ComponentToken[] = [
    {
      category: 'Theme',
      cssVar: '--vscode-editor-background',
      usage: 'Editor background color',
    },
    {
      category: 'Theme',
      cssVar: '--vscode-editor-foreground',
      usage: 'Editor text color',
    },
    {
      category: 'Theme',
      cssVar: '--vscode-editor-lineHighlightBackground',
      usage: 'Current line highlight',
    },
    {
      category: 'Typography',
      cssVar: '--ax-font-mono',
      usage: 'Editor font family',
    },
    {
      category: 'Layout',
      cssVar: '--ax-radius-lg',
      usage: 'Container border radius',
    },
  ];

  changeLanguage(lang: string) {
    this.language.set(lang);
    this.editorOptions.update((opts) => ({
      ...opts,
      language: lang,
    }));

    // Update sample code based on language
    switch (lang) {
      case 'javascript':
        this.code = `// JavaScript Example
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

const greet = (user) => \`Hello, \${user.name}!\`;

users.forEach(user => console.log(greet(user)));
`;
        break;
      case 'html':
        this.code = `<!-- HTML Example -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Welcome to my website.</p>
</body>
</html>
`;
        break;
      case 'css':
        this.code = `/* CSS Example */
.container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #f5f5f5;
}

.button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
}

.button:hover {
  background: #2563eb;
}
`;
        break;
      case 'json':
        this.code = `{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "angular": "^17.0.0",
    "rxjs": "^7.8.0"
  },
  "scripts": {
    "start": "ng serve",
    "build": "ng build"
  }
}
`;
        break;
      case 'python':
        this.code = `# Python Example
class User:
    def __init__(self, name: str, email: str):
        self.name = name
        self.email = email

    def greet(self) -> str:
        return f"Hello, {self.name}!"

user = User("John", "john@example.com")
print(user.greet())
`;
        break;
      case 'sql':
        this.code = `-- SQL Example
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.active = true
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC;
`;
        break;
      case 'markdown':
        this.code = `# Markdown Example

## Features

- Syntax highlighting
- Code blocks
- **Bold** and *italic* text

\`\`\`typescript
const greeting = "Hello, World!";
\`\`\`

> This is a blockquote

[Learn more](https://example.com)
`;
        break;
      default:
        this.code = `// ${lang} code example`;
    }
  }

  changeTheme(newTheme: string) {
    this.theme.set(newTheme);
    this.editorOptions.update((opts) => ({
      ...opts,
      theme: newTheme,
    }));
  }

  // Code examples
  readonly basicCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ngx-monaco-editor
  [options]="editorOptions"
  [(ngModel)]="code"
  style="height: 400px"
>
</ngx-monaco-editor>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

@Component({
  imports: [MonacoEditorModule, FormsModule],
  ...
})
export class MyComponent {
  editorOptions = {
    theme: 'vs-dark',
    language: 'typescript',
    minimap: { enabled: true },
    automaticLayout: true
  };

  code = \`// Your code here
function hello() {
  console.log("Hello!");
}\`;
}`,
    },
  ];

  readonly diffCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ngx-monaco-diff-editor
  [options]="diffOptions"
  [originalModel]="originalModel"
  [modifiedModel]="modifiedModel"
  style="height: 400px"
>
</ngx-monaco-diff-editor>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `export class MyComponent {
  diffOptions = {
    theme: 'vs-dark',
    language: 'typescript',
    readOnly: true,
    automaticLayout: true
  };

  originalModel = {
    code: 'function hello() { console.log("Hello"); }',
    language: 'typescript'
  };

  modifiedModel = {
    code: 'function hello(name: string) { console.log(\`Hello, \${name}!\`); }',
    language: 'typescript'
  };
}`,
    },
  ];

  readonly readOnlyCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<!-- Read-only code display -->
<ngx-monaco-editor
  [options]="readOnlyOptions"
  [(ngModel)]="displayCode"
>
</ngx-monaco-editor>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `readOnlyOptions = {
  theme: 'vs-dark',
  language: 'typescript',
  readOnly: true,
  minimap: { enabled: false },
  lineNumbers: 'off',
  folding: false,
  scrollBeyondLastLine: false,
  renderLineHighlight: 'none',
  contextmenu: false // Disable right-click menu
};`,
    },
  ];

  readonly customLanguageCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `// Register custom language on init
onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
  // Register custom language
  monaco.languages.register({ id: 'myLang' });

  // Set tokenization rules
  monaco.languages.setMonarchTokensProvider('myLang', {
    tokenizer: {
      root: [
        [/\\[error.*/, 'custom-error'],
        [/\\[warning.*/, 'custom-warning'],
        [/\\[info.*/, 'custom-info'],
        [/\\[[a-zA-Z 0-9:]+\\]/, 'custom-date'],
      ]
    }
  });

  // Define theme colors for custom tokens
  monaco.editor.defineTheme('myTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
      { token: 'custom-warning', foreground: 'ffa500' },
      { token: 'custom-info', foreground: '00ff00' },
      { token: 'custom-date', foreground: '808080' }
    ],
    colors: {}
  });
}`,
    },
  ];

  readonly eventsCode: CodeTab[] = [
    {
      label: 'HTML',
      language: 'html',
      code: `<ngx-monaco-editor
  [options]="editorOptions"
  [(ngModel)]="code"
  (onInit)="onEditorInit($event)"
  (ngModelChange)="onCodeChange($event)"
>
</ngx-monaco-editor>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `import { editor } from 'monaco-editor';

export class MyComponent {
  private editorInstance?: editor.IStandaloneCodeEditor;

  onEditorInit(editor: editor.IStandaloneCodeEditor) {
    this.editorInstance = editor;

    // Listen to cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      console.log('Cursor:', e.position);
    });

    // Listen to selection changes
    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getModel()?.getValueInRange(e.selection);
      console.log('Selected:', selection);
    });

    // Add custom keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      this.saveCode();
    });
  }

  onCodeChange(newCode: string) {
    console.log('Code changed, length:', newCode.length);
    // Auto-save, validation, etc.
  }

  saveCode() {
    console.log('Saving code...');
  }

  // Programmatic access
  formatDocument() {
    this.editorInstance?.getAction('editor.action.formatDocument')?.run();
  }

  getValue(): string {
    return this.editorInstance?.getValue() || '';
  }

  setValue(code: string) {
    this.editorInstance?.setValue(code);
  }
}`,
    },
  ];

  readonly themeCode: CodeTab[] = [
    {
      label: 'TypeScript',
      language: 'typescript',
      code: `// Define custom theme
monaco.editor.defineTheme('myCustomTheme', {
  base: 'vs-dark', // Base theme: 'vs', 'vs-dark', 'hc-black'
  inherit: true,   // Inherit base theme rules
  rules: [
    { token: 'comment', foreground: '6a9955' },
    { token: 'keyword', foreground: 'c586c0' },
    { token: 'string', foreground: 'ce9178' },
    { token: 'number', foreground: 'b5cea8' },
    { token: 'type', foreground: '4ec9b0' },
    { token: 'function', foreground: 'dcdcaa' },
    { token: 'variable', foreground: '9cdcfe' },
  ],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#d4d4d4',
    'editor.lineHighlightBackground': '#2d2d2d',
    'editor.selectionBackground': '#264f78',
    'editorCursor.foreground': '#ffffff',
    'editorLineNumber.foreground': '#858585',
    'editorLineNumber.activeForeground': '#ffffff',
  }
});

// Use custom theme
this.editorOptions = {
  theme: 'myCustomTheme',
  language: 'typescript'
};`,
    },
  ];

  readonly installationCode: CodeTab[] = [
    {
      label: 'Install',
      language: 'bash',
      code: `# Install the package
npm install ngx-monaco-editor-v2 monaco-editor

# Or with pnpm
pnpm add ngx-monaco-editor-v2 monaco-editor`,
    },
    {
      label: 'app.config.ts',
      language: 'typescript',
      code: `import { ApplicationConfig } from '@angular/core';
import { provideMonacoEditor } from 'ngx-monaco-editor-v2';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMonacoEditor({
      // Optional: Configure base URL for Monaco files
      baseUrl: 'assets/monaco',
      // Optional: Set default options for all editors
      defaultOptions: {
        theme: 'vs-dark',
        scrollBeyondLastLine: false
      }
    })
  ]
};`,
    },
    {
      label: 'angular.json',
      language: 'json',
      code: `{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              {
                "glob": "**/*",
                "input": "node_modules/monaco-editor",
                "output": "/assets/monaco"
              }
            ]
          }
        }
      }
    }
  }
}`,
    },
    {
      label: 'Component',
      language: 'typescript',
      code: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [FormsModule, MonacoEditorModule],
  template: \`
    <ngx-monaco-editor
      [options]="editorOptions"
      [(ngModel)]="code"
      style="height: 400px"
    >
    </ngx-monaco-editor>
  \`
})
export class CodeEditorComponent {
  editorOptions = {
    theme: 'vs-dark',
    language: 'typescript'
  };
  code = '';
}`,
    },
  ];
}
