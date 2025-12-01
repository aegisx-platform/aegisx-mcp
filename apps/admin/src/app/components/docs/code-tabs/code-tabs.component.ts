import {
  Component,
  Input,
  inject,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CodeTab, CodeLanguage } from '../../../types/docs.types';

// Import Prism core and languages
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

/**
 * Code Tabs Component
 *
 * Displays code examples with syntax highlighting in tabbed format.
 * Uses Prism.js for syntax highlighting.
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
            <div class="code-tabs__dots">
              <span class="dot dot--red"></span>
              <span class="dot dot--yellow"></span>
              <span class="dot dot--green"></span>
            </div>
            <span class="code-tabs__filename">{{ tabs[0].label }}</span>
            <button
              mat-icon-button
              class="code-tabs__copy-btn"
              matTooltip="Copy code"
              (click)="copyCode(tabs[0].code)"
            >
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
          <pre class="code-tabs__code"><code
            #codeBlock
            class="language-{{ getPrismLanguage(tabs[0].language) }}"
          >{{ tabs[0].code.trim() }}</code></pre>
        </div>
      } @else {
        <!-- Tabbed code blocks -->
        <div class="code-tabs__tabbed">
          <div class="code-tabs__tab-header">
            <div class="code-tabs__dots">
              <span class="dot dot--red"></span>
              <span class="dot dot--yellow"></span>
              <span class="dot dot--green"></span>
            </div>
            <div class="code-tabs__tab-buttons">
              @for (tab of tabs; track tab.label; let i = $index) {
                <button
                  class="code-tabs__tab-btn"
                  [class.active]="activeTabIndex === i"
                  (click)="selectTab(i)"
                >
                  {{ tab.label }}
                </button>
              }
            </div>
            <button
              mat-icon-button
              class="code-tabs__copy-btn"
              matTooltip="Copy code"
              (click)="copyCode(tabs[activeTabIndex].code)"
            >
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
          @for (tab of tabs; track getTabTrackId(tab, i); let i = $index) {
            @if (activeTabIndex === i) {
              <pre class="code-tabs__code"><code
                #codeBlock
                class="language-{{ getPrismLanguage(tab.language) }}"
              >{{ tab.code.trim() }}</code></pre>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .code-tabs {
        margin: 1rem 0;
        border-radius: 16px;
        overflow: hidden;
        background: #1e1e2e;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      .code-tabs__single,
      .code-tabs__tabbed {
        position: relative;
      }
      .code-tabs__header,
      .code-tabs__tab-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: #181825;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .code-tabs__dots {
        display: flex;
        gap: 8px;
      }
      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      .dot--red {
        background: #ff5f56;
      }
      .dot--yellow {
        background: #ffbd2e;
      }
      .dot--green {
        background: #27c93f;
      }
      .code-tabs__filename {
        flex: 1;
        color: #6c7086;
        font-size: 13px;
        font-family: 'SF Mono', 'Fira Code', monospace;
      }
      .code-tabs__tab-buttons {
        display: flex;
        gap: 4px;
        flex: 1;
      }
      .code-tabs__tab-btn {
        padding: 6px 16px;
        border: none;
        background: transparent;
        color: #6c7086;
        font-size: 13px;
        font-family: 'SF Mono', 'Fira Code', monospace;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.15s ease;
      }
      .code-tabs__tab-btn:hover {
        color: #cdd6f4;
        background: rgba(255, 255, 255, 0.05);
      }
      .code-tabs__tab-btn.active {
        color: #cdd6f4;
        background: rgba(255, 255, 255, 0.1);
      }
      .code-tabs__copy-btn {
        width: 32px !important;
        height: 32px !important;
        line-height: 32px;
        color: #6c7086 !important;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
      }
      .code-tabs__copy-btn mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
      .code-tabs__copy-btn:hover {
        color: #cdd6f4 !important;
        background: rgba(255, 255, 255, 0.1);
      }
      .code-tabs__code {
        margin: 0;
        padding: 20px;
        background: #1e1e2e;
        overflow-x: auto;
        font-family:
          'SF Mono', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
        font-size: 14px;
        line-height: 1.7;
        color: #cdd6f4;
        tab-size: 2;
      }
      .code-tabs__code code {
        font-family: inherit;
        background: transparent;
        padding: 0;
      }

      /* Catppuccin Mocha Syntax Theme */
      :host ::ng-deep .code-tabs__code {
        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata {
          color: #6c7086;
          font-style: italic;
        }
        .token.punctuation {
          color: #bac2de;
        }
        .token.namespace {
          opacity: 0.8;
        }
        .token.property,
        .token.tag,
        .token.constant,
        .token.symbol,
        .token.deleted {
          color: #89b4fa;
        }
        .token.boolean,
        .token.number {
          color: #fab387;
        }
        .token.selector,
        .token.attr-name,
        .token.string,
        .token.char,
        .token.builtin,
        .token.inserted {
          color: #a6e3a1;
        }
        .token.operator,
        .token.entity,
        .token.url {
          color: #94e2d5;
        }
        .language-css .token.string,
        .style .token.string {
          color: #a6e3a1;
        }
        .token.atrule,
        .token.attr-value,
        .token.keyword {
          color: #cba6f7;
        }
        .token.function {
          color: #89b4fa;
        }
        .token.class-name {
          color: #89dceb;
        }
        .token.regex,
        .token.important,
        .token.variable {
          color: #f38ba8;
        }
        .token.important,
        .token.bold {
          font-weight: bold;
        }
        .token.italic {
          font-style: italic;
        }
        .token.builtin {
          color: #f9e2af;
        }
        .token.tag .token.tag {
          color: #f38ba8;
        }
        .token.tag .token.attr-name {
          color: #89b4fa;
        }
        .token.tag .token.attr-value {
          color: #a6e3a1;
        }
        .token.selector {
          color: #cba6f7;
        }
        .token.decorator {
          color: #f9e2af;
        }
        .token.string {
          color: #a6e3a1;
        }
      }
    `,
  ],
})
export class CodeTabsComponent implements AfterViewInit, OnChanges {
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChildren('codeBlock') codeBlocks!: QueryList<ElementRef>;

  @Input() tabs: CodeTab[] = [];
  @Input() showLineNumbers = false;

  activeTabIndex = 0;

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

  ngAfterViewInit(): void {
    // Initial highlighting
    this.highlightAllCode();

    // Subscribe to codeBlocks changes for dynamically added code blocks
    this.codeBlocks.changes.subscribe(() => {
      setTimeout(() => this.highlightAllCode(), 0);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tabs']) {
      // Reset highlighted status when tabs change
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => this.forceHighlightAllCode(), 0);
    }
  }

  selectTab(index: number): void {
    this.activeTabIndex = index;
    // Highlight code when tab changes (for lazy-loaded content)
    setTimeout(() => this.highlightAllCode(), 0);
  }

  private highlightAllCode(): void {
    if (this.codeBlocks && this.codeBlocks.length > 0) {
      this.codeBlocks.forEach((codeBlock) => {
        const element = codeBlock.nativeElement;
        if (element && !element.classList.contains('prism-highlighted')) {
          Prism.highlightElement(element);
          element.classList.add('prism-highlighted');
        }
      });
    }
  }

  private forceHighlightAllCode(): void {
    if (this.codeBlocks && this.codeBlocks.length > 0) {
      this.codeBlocks.forEach((codeBlock) => {
        const element = codeBlock.nativeElement;
        if (element) {
          // Remove prism-highlighted class to force re-highlight
          element.classList.remove('prism-highlighted');
          Prism.highlightElement(element);
          element.classList.add('prism-highlighted');
        }
      });
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

  getPrismLanguage(language: CodeLanguage): string {
    const languageMap: Record<CodeLanguage, string> = {
      html: 'markup',
      typescript: 'typescript',
      scss: 'scss',
      bash: 'bash',
      json: 'json',
    };
    return languageMap[language] || 'plaintext';
  }

  getTabTrackId(tab: CodeTab, index: number): string {
    // Include code hash in track id to force re-render when code changes
    return `${tab.label}-${index}-${this.hashCode(tab.code)}`;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
}
