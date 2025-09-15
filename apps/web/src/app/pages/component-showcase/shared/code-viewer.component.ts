import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-code-viewer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="code-viewer">
      <div class="code-header">
        <div class="code-title">
          <mat-icon>code</mat-icon>
          <span>{{ title || 'Code Example' }}</span>
        </div>
        <div class="code-actions">
          <button
            mat-icon-button
            matTooltip="Copy to clipboard"
            (click)="copyCode()"
          >
            <mat-icon>{{ copyIcon() }}</mat-icon>
          </button>
          <button
            *ngIf="showFullscreen"
            mat-icon-button
            matTooltip="Fullscreen view"
            (click)="toggleFullscreen()"
          >
            <mat-icon>{{
              isFullscreen() ? 'fullscreen_exit' : 'fullscreen'
            }}</mat-icon>
          </button>
        </div>
      </div>

      <div
        class="code-content"
        [class.fullscreen]="isFullscreen()"
        [attr.data-language]="language"
      >
        <pre><code [innerHTML]="highlightedCode()"></code></pre>
      </div>
    </div>
  `,
  styleUrls: ['./code-viewer.component.scss'],
})
export class CodeViewerComponent implements OnInit {
  @Input() code: string = '';
  @Input() language: string = 'typescript';
  @Input() title?: string;
  @Input() showFullscreen: boolean = true;

  // Signals
  copyIcon = signal('content_copy');
  isFullscreen = signal(false);
  highlightedCode = signal('');

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.processCode();
  }

  ngOnChanges() {
    this.processCode();
  }

  private processCode() {
    // Basic syntax highlighting (you could integrate with Prism.js here)
    let processed = this.escapeHtml(this.code);

    // Apply basic highlighting based on language
    if (this.language === 'typescript' || this.language === 'javascript') {
      processed = this.highlightTypeScript(processed);
    } else if (this.language === 'html') {
      processed = this.highlightHtml(processed);
    } else if (this.language === 'scss' || this.language === 'css') {
      processed = this.highlightCss(processed);
    }

    this.highlightedCode.set(processed);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private highlightTypeScript(code: string): string {
    // Basic TypeScript syntax highlighting
    return (
      code
        // Keywords
        .replace(
          /\b(class|interface|function|const|let|var|if|else|for|while|return|import|export|from|as|type|public|private|protected|static|readonly)\b/g,
          '<span class="keyword">$1</span>',
        )
        // Strings
        .replace(/(['"`])([^'"`]*?)\1/g, '<span class="string">$1$2$1</span>')
        // Comments
        .replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
        .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
        // Numbers
        .replace(/\b\d+\b/g, '<span class="number">$&</span>')
        // Decorators
        .replace(/@\w+/g, '<span class="decorator">$&</span>')
    );
  }

  private highlightHtml(code: string): string {
    return (
      code
        // Tags
        .replace(
          /(&lt;\/?)([\w-]+)([^&]*?)(&gt;)/g,
          '<span class="tag">$1</span><span class="tag-name">$2</span><span class="attribute">$3</span><span class="tag">$4</span>',
        )
        // Attributes
        .replace(
          /\s([\w-]+)(=)/g,
          ' <span class="attribute-name">$1</span><span class="operator">$2</span>',
        )
        // Attribute values
        .replace(/=(&quot;[^&]*?&quot;)/g, '=<span class="string">$1</span>')
    );
  }

  private highlightCss(code: string): string {
    return (
      code
        // Selectors
        .replace(/^([.#]?[\w-]+)\s*{/gm, '<span class="selector">$1</span> {')
        // Properties
        .replace(/^\s*([\w-]+):/gm, '  <span class="property">$1</span>:')
        // Values
        .replace(/:\s*([^;]+);/g, ': <span class="value">$1</span>;')
        // Comments
        .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
    );
  }

  async copyCode() {
    try {
      await navigator.clipboard.writeText(this.code);
      this.copyIcon.set('check');
      this.snackBar.open('Code copied to clipboard!', '', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });

      setTimeout(() => {
        this.copyIcon.set('content_copy');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      this.snackBar.open('Failed to copy code', '', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
  }

  toggleFullscreen() {
    this.isFullscreen.set(!this.isFullscreen());
  }
}
