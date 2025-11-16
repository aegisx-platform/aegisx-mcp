import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  signal,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-typescript';
import { html as html_beautify } from 'js-beautify';

type ViewMode = 'preview' | 'code';

@Component({
  selector: 'app-code-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="code-preview-container">
      <!-- Header Controls -->
      <div class="preview-header">
        <!-- View Mode Tabs -->
        <div class="view-tabs">
          <button
            class="tab-button"
            [class.active]="viewMode() === 'preview'"
            (click)="viewMode.set('preview')"
          >
            <mat-icon>visibility</mat-icon>
            <span>Preview</span>
          </button>
          <button
            class="tab-button"
            [class.active]="viewMode() === 'code'"
            (click)="viewMode.set('code')"
          >
            <mat-icon>code</mat-icon>
            <span>Code</span>
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            mat-icon-button
            class="action-btn"
            (click)="copyCode()"
            title="Copy code"
          >
            <mat-icon>content_copy</mat-icon>
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="preview-content">
        <!-- Preview Mode -->
        @if (viewMode() === 'preview') {
          <div #previewArea class="preview-area">
            <ng-content></ng-content>
          </div>
        }

        <!-- Code Mode -->
        @if (viewMode() === 'code') {
          <div class="code-area">
            <pre
              class="language-markup"
            ><code #codeElement class="language-markup" [innerHTML]="highlightedCode"></code></pre>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .code-preview-container {
        border: 1px solid var(--aegisx-border-default);
        border-radius: var(--aegisx-radius-md);
        overflow: hidden;
        background: var(--aegisx-bg-surface);
        transition: all 0.2s ease;
      }

      .preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        background: var(--aegisx-bg-page);
        border-bottom: 1px solid var(--aegisx-border-default);
      }

      .view-tabs {
        display: flex;
        gap: 0.25rem;
      }

      .tab-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        background: transparent;
        border-radius: var(--aegisx-radius-sm);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--aegisx-text-secondary);
        cursor: pointer;
        transition: all 0.15s ease;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        &:hover {
          background: var(--aegisx-bg-surface);
          color: var(--aegisx-text-primary);
        }

        &.active {
          background: var(--aegisx-bg-surface);
          color: var(--aegisx-brand-default);

          mat-icon {
            color: var(--aegisx-brand-default);
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 0.25rem;
      }

      .action-btn {
        color: var(--aegisx-text-secondary);
        transition: all 0.15s ease;

        &:hover {
          background: var(--aegisx-bg-surface);
          color: var(--aegisx-text-primary);
        }

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .preview-content {
        position: relative;
      }

      .preview-area {
        padding: 2rem;
        min-height: 20px;
      }

      .code-area {
        background: #1e1e1e;
        overflow-x: auto;

        pre {
          margin: 0;
          padding: 1.5rem;
          background: #1e1e1e;
          overflow-x: auto;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.6;
          tab-size: 2;

          code {
            font-family: inherit;
            font-size: inherit;
            line-height: inherit;
            color: #d4d4d4;
            white-space: pre;
            display: block;
          }
        }
      }

      // Prism.js Syntax Highlighting - VS Code Dark+ Theme
      :host ::ng-deep {
        // Comments
        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata {
          color: #6a9955;
          font-style: italic;
        }

        // Punctuation
        .token.punctuation {
          color: #d4d4d4;
        }

        // Property, tag, boolean, number, constant, symbol, deleted
        .token.property,
        .token.tag,
        .token.boolean,
        .token.number,
        .token.constant,
        .token.symbol,
        .token.deleted {
          color: #569cd6;
        }

        // Selector, attr-name, string, char, builtin, inserted
        .token.selector,
        .token.attr-name,
        .token.string,
        .token.char,
        .token.builtin,
        .token.inserted {
          color: #ce9178;
        }

        // Operator, entity, url, language-css string, style string
        .token.operator,
        .token.entity,
        .token.url,
        .language-css .token.string,
        .style .token.string {
          color: #d4d4d4;
        }

        // Atrule, attr-value, keyword
        .token.atrule,
        .token.attr-value,
        .token.keyword {
          color: #c586c0;
        }

        // Function, class-name
        .token.function,
        .token.class-name {
          color: #dcdcaa;
        }

        // Regex, important, variable
        .token.regex,
        .token.important,
        .token.variable {
          color: #d16969;
        }

        // Important
        .token.important,
        .token.bold {
          font-weight: bold;
        }

        .token.italic {
          font-style: italic;
        }

        // Line numbers
        .line-numbers .line-numbers-rows {
          border-right: 1px solid #2d2d2d;
          background: #1e1e1e;
        }

        .line-numbers-rows > span:before {
          color: #858585;
        }
      }
    `,
  ],
})
export class CodePreviewComponent implements AfterViewInit {
  @Input() code = '';
  @Input() language = 'markup'; // markup for HTML, typescript, css, javascript
  @Input() extractCode = false; // Auto-extract HTML from ng-content
  @ViewChild('codeElement') codeElement?: ElementRef;
  @ViewChild('previewArea') previewArea?: ElementRef;

  viewMode = signal<ViewMode>('preview');
  private extractedCode = '';

  constructor(private snackBar: MatSnackBar) {}

  ngAfterViewInit(): void {
    // Extract HTML from preview area if extractCode is enabled
    if (this.extractCode && this.previewArea?.nativeElement) {
      this.extractedCode = this.formatHTML(
        this.previewArea.nativeElement.innerHTML,
      );
    }
    this.highlightCode();
  }

  get highlightedCode(): string {
    // Use extracted code if available, otherwise use provided code
    const codeToHighlight =
      this.extractCode && this.extractedCode ? this.extractedCode : this.code;

    if (!codeToHighlight) return '';

    try {
      // Use Prism.js for syntax highlighting
      const grammar =
        Prism.languages[this.language] || Prism.languages['markup'];
      return Prism.highlight(codeToHighlight, grammar, this.language);
    } catch (error) {
      console.error('Prism highlighting error:', error);
      // Fallback to escaped HTML
      return codeToHighlight.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }

  private highlightCode(): void {
    if (this.codeElement?.nativeElement) {
      Prism.highlightElement(this.codeElement.nativeElement);
    }
  }

  async copyCode(): Promise<void> {
    // Use extracted code if available, otherwise use provided code
    const codeToCopy =
      this.extractCode && this.extractedCode ? this.extractedCode : this.code;

    try {
      await navigator.clipboard.writeText(codeToCopy);
      this.snackBar.open('Code copied to clipboard!', 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      });
    } catch (_err) {
      this.snackBar.open('Failed to copy code', 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      });
    }
  }

  /**
   * Format HTML with proper indentation using js-beautify
   * Removes Angular internal markers and formats nicely
   */
  private formatHTML(html: string): string {
    // Remove Angular internal attributes (_ngcontent-*, _nghost-*, ng-reflect-*)
    const cleaned = html
      .replace(/\s*_ngcontent-[a-z0-9-]+="[^"]*"/gi, '')
      .replace(/\s*_nghost-[a-z0-9-]+="[^"]*"/gi, '')
      .replace(/\s*ng-reflect-[a-z0-9-]+="[^"]*"/gi, '')
      .replace(/<!--bindings=\{[^}]*\}-->/g, '')
      .replace(/<!--container-->/g, '')
      .replace(/<!--ng-container-->/g, '');

    // Use js-beautify for proper HTML formatting
    return html_beautify(cleaned, {
      indent_size: 2,
      indent_char: ' ',
      max_preserve_newlines: 1,
      preserve_newlines: true,
      wrap_line_length: 0,
      wrap_attributes: 'auto',
      end_with_newline: false,
      indent_inner_html: true,
      unformatted: [],
      content_unformatted: ['pre', 'textarea'],
    });
  }
}
