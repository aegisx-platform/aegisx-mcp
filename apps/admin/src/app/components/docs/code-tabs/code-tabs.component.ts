import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CodeTab, CodeLanguage } from '../../../types/docs.types';

/**
 * Code Tabs Component
 *
 * Displays code examples with syntax highlighting in tabbed format.
 * Supports HTML, TypeScript, SCSS, Bash, and JSON.
 */
@Component({
  selector: 'ax-code-tabs',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="code-tabs">
      @if (tabs.length === 1) {
        <!-- Single code block -->
        <div class="code-tabs__single">
          <div class="code-tabs__header">
            <span class="code-tabs__label">{{ tabs[0].label }}</span>
            <button
              mat-icon-button
              class="code-tabs__copy-btn"
              matTooltip="Copy code"
              (click)="copyCode(tabs[0].code)"
            >
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
          <pre
            class="code-tabs__code code-tabs__code--{{ tabs[0].language }}"
            [class.code-tabs__code--line-numbers]="showLineNumbers"
          ><code [innerHTML]="highlightCode(tabs[0].code, tabs[0].language)"></code></pre>
        </div>
      } @else {
        <!-- Tabbed code blocks -->
        <mat-tab-group class="code-tabs__group" [animationDuration]="'150ms'">
          @for (tab of tabs; track tab.label) {
            <mat-tab [label]="tab.label">
              <ng-template matTabContent>
                <div class="code-tabs__tab-content">
                  <button
                    mat-icon-button
                    class="code-tabs__copy-btn code-tabs__copy-btn--tab"
                    matTooltip="Copy code"
                    (click)="copyCode(tab.code)"
                  >
                    <mat-icon>content_copy</mat-icon>
                  </button>
                  <pre
                    class="code-tabs__code code-tabs__code--{{ tab.language }}"
                    [class.code-tabs__code--line-numbers]="showLineNumbers"
                  ><code [innerHTML]="highlightCode(tab.code, tab.language)"></code></pre>
                </div>
              </ng-template>
            </mat-tab>
          }
        </mat-tab-group>
      }
    </div>
  `,
  styles: [
    `
      .code-tabs {
        margin: var(--ax-spacing-md, 0.75rem) 0;
        border-radius: var(--ax-radius-lg, 0.75rem);
        overflow: hidden;
        border: 1px solid var(--ax-border-default);
      }

      .code-tabs__single {
        position: relative;
      }

      .code-tabs__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--ax-spacing-xs, 0.25rem) var(--ax-spacing-sm, 0.5rem);
        background-color: var(--ax-background-subtle);
        border-bottom: 1px solid var(--ax-border-default);
      }

      .code-tabs__label {
        font-size: var(--ax-text-xs, 0.75rem);
        font-weight: 600;
        color: var(--ax-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .code-tabs__copy-btn {
        width: 28px;
        height: 28px;
        line-height: 28px;
        color: var(--ax-text-secondary);

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }

        &:hover {
          color: var(--ax-text-primary);
        }
      }

      .code-tabs__copy-btn--tab {
        position: absolute;
        top: var(--ax-spacing-xs, 0.25rem);
        right: var(--ax-spacing-xs, 0.25rem);
        z-index: 1;
      }

      .code-tabs__tab-content {
        position: relative;
      }

      .code-tabs__code {
        margin: 0;
        padding: var(--ax-spacing-md, 0.75rem);
        background-color: #1e1e1e;
        overflow-x: auto;
        font-family: var(--ax-font-mono);
        font-size: var(--ax-text-sm, 0.875rem);
        line-height: 1.6;
        color: #d4d4d4;

        code {
          font-family: inherit;
        }
      }

      .code-tabs__code--line-numbers {
        counter-reset: line;

        code {
          display: block;
        }
      }

      /* Mat Tab Group Styling */
      .code-tabs__group {
        ::ng-deep {
          .mat-mdc-tab-header {
            background-color: var(--ax-background-subtle);
            border-bottom: 1px solid var(--ax-border-default);
          }

          .mat-mdc-tab {
            min-width: 80px;
            padding: 0 var(--ax-spacing-md, 0.75rem);
          }

          .mat-mdc-tab-body-wrapper {
            flex-grow: 1;
          }

          .mat-mdc-tab-body-content {
            overflow: hidden;
          }
        }
      }

      /* Syntax Highlighting */
      :host {
        .keyword {
          color: #569cd6;
        }
        .string {
          color: #ce9178;
        }
        .comment {
          color: #6a9955;
        }
        .function {
          color: #dcdcaa;
        }
        .property {
          color: #9cdcfe;
        }
        .tag {
          color: #569cd6;
        }
        .attribute {
          color: #9cdcfe;
        }
        .attribute-value {
          color: #ce9178;
        }
        .punctuation {
          color: #d4d4d4;
        }
        .number {
          color: #b5cea8;
        }
        .operator {
          color: #d4d4d4;
        }
        .class-name {
          color: #4ec9b0;
        }
        .decorator {
          color: #dcdcaa;
        }
      }
    `,
  ],
})
export class CodeTabsComponent {
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  @Input() tabs: CodeTab[] = [];
  @Input() showLineNumbers = false;

  // Convenience inputs for single-tab usage
  @Input() set html(value: string) {
    if (value) this.addTab('HTML', value, 'html');
  }
  @Input() set typescript(value: string) {
    if (value) this.addTab('TypeScript', value, 'typescript');
  }
  @Input() set scss(value: string) {
    if (value) this.addTab('SCSS', value, 'scss');
  }

  private addTab(label: string, code: string, language: CodeLanguage): void {
    // Prevent duplicates
    if (!this.tabs.find((t) => t.label === label)) {
      this.tabs = [...this.tabs, { label, code, language }];
    }
  }

  copyCode(code: string): void {
    this.clipboard.copy(code.trim());
    this.snackBar.open('Code copied to clipboard', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  highlightCode(code: string, language: CodeLanguage): string {
    const trimmedCode = code.trim();

    switch (language) {
      case 'typescript':
        return this.highlightTypeScript(trimmedCode);
      case 'html':
        return this.highlightHtml(trimmedCode);
      case 'scss':
        return this.highlightScss(trimmedCode);
      case 'bash':
        return this.highlightBash(trimmedCode);
      case 'json':
        return this.highlightJson(trimmedCode);
      default:
        return this.escapeHtml(trimmedCode);
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private highlightTypeScript(code: string): string {
    let result = this.escapeHtml(code);

    // Comments
    result = result.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
    result = result.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="comment">$1</span>',
    );

    // Strings
    result = result.replace(
      /('(?:[^'\\]|\\.)*')/g,
      '<span class="string">$1</span>',
    );
    result = result.replace(
      /("(?:[^"\\]|\\.)*")/g,
      '<span class="string">$1</span>',
    );
    result = result.replace(
      /(`(?:[^`\\]|\\.)*`)/g,
      '<span class="string">$1</span>',
    );

    // Decorators
    result = result.replace(/(@\w+)/g, '<span class="decorator">$1</span>');

    // Keywords
    const keywords = [
      'import',
      'export',
      'from',
      'const',
      'let',
      'var',
      'function',
      'class',
      'interface',
      'type',
      'extends',
      'implements',
      'return',
      'if',
      'else',
      'for',
      'while',
      'switch',
      'case',
      'break',
      'continue',
      'new',
      'this',
      'super',
      'async',
      'await',
      'try',
      'catch',
      'throw',
      'public',
      'private',
      'protected',
      'readonly',
      'static',
      'abstract',
      'true',
      'false',
      'null',
      'undefined',
      'void',
      'never',
      'any',
    ];
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    result = result.replace(keywordRegex, '<span class="keyword">$1</span>');

    // Numbers
    result = result.replace(
      /\b(\d+(?:\.\d+)?)\b/g,
      '<span class="number">$1</span>',
    );

    return result;
  }

  private highlightHtml(code: string): string {
    let result = this.escapeHtml(code);

    // Comments
    result = result.replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="comment">$1</span>',
    );

    // Tags
    result = result.replace(
      /(&lt;\/?)([\w-]+)/g,
      '$1<span class="tag">$2</span>',
    );

    // Attributes
    result = result.replace(
      /\s([\w-]+)=/g,
      ' <span class="attribute">$1</span>=',
    );

    // Attribute values
    result = result.replace(
      /="([^"]*)"/g,
      '="<span class="attribute-value">$1</span>"',
    );

    return result;
  }

  private highlightScss(code: string): string {
    let result = this.escapeHtml(code);

    // Comments
    result = result.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
    result = result.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="comment">$1</span>',
    );

    // Variables
    result = result.replace(/(\$[\w-]+)/g, '<span class="property">$1</span>');

    // Properties
    result = result.replace(
      /^(\s*)([\w-]+):/gm,
      '$1<span class="property">$2</span>:',
    );

    // Values with units
    result = result.replace(
      /:\s*(\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|deg|s|ms)?)/g,
      ': <span class="number">$1</span>',
    );

    // Strings
    result = result.replace(
      /('(?:[^'\\]|\\.)*')/g,
      '<span class="string">$1</span>',
    );
    result = result.replace(
      /("(?:[^"\\]|\\.)*")/g,
      '<span class="string">$1</span>',
    );

    return result;
  }

  private highlightBash(code: string): string {
    let result = this.escapeHtml(code);

    // Comments
    result = result.replace(/(#.*$)/gm, '<span class="comment">$1</span>');

    // Strings
    result = result.replace(
      /('(?:[^'\\]|\\.)*')/g,
      '<span class="string">$1</span>',
    );
    result = result.replace(
      /("(?:[^"\\]|\\.)*")/g,
      '<span class="string">$1</span>',
    );

    // Commands (first word of each line)
    result = result.replace(
      /^(\s*)([\w-]+)/gm,
      '$1<span class="function">$2</span>',
    );

    return result;
  }

  private highlightJson(code: string): string {
    let result = this.escapeHtml(code);

    // Keys
    result = result.replace(
      /"([\w-]+)":/g,
      '"<span class="property">$1</span>":',
    );

    // String values
    result = result.replace(
      /:\s*"([^"]*)"/g,
      ': "<span class="string">$1</span>"',
    );

    // Numbers
    result = result.replace(
      /:\s*(\d+(?:\.\d+)?)/g,
      ': <span class="number">$1</span>',
    );

    // Booleans and null
    result = result.replace(
      /:\s*(true|false|null)/g,
      ': <span class="keyword">$1</span>',
    );

    return result;
  }
}
