import { Component, input, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * CodeBlockComponent - Displays syntax-highlighted code with copy-to-clipboard functionality
 *
 * @example
 * <ax-code-block
 *   [code]="'const example = \"hello\";'"
 *   language="typescript"
 *   [showLineNumbers]="true"
 * />
 */
@Component({
  selector: 'ax-code-block',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './code-block.component.html',
  styleUrl: './code-block.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CodeBlockComponent {
  /** Code content to display */
  code = input.required<string>();

  /** Programming language for syntax highlighting */
  language = input<string>('typescript');

  /** Show line numbers */
  showLineNumbers = input<boolean>(false);

  /** Label for the code block (e.g., "TypeScript", "Component Template") */
  label = input<string | undefined>();

  /** Copy button state */
  protected copied = signal(false);

  /**
   * Copy code to clipboard
   */
  async copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }

  /**
   * Format code with syntax highlighting
   * This is a basic implementation - can be enhanced with libraries like Prism.js or highlight.js
   */
  protected getFormattedCode(): string {
    const code = this.code();
    const language = this.language();

    // Basic syntax highlighting patterns
    const patterns: Record<string, { regex: RegExp; className: string }[]> = {
      typescript: [
        { regex: /(\/\/.*$)/gm, className: 'comment' },
        { regex: /(\/\*[\s\S]*?\*\/)/g, className: 'comment' },
        {
          regex:
            /\b(const|let|var|function|class|interface|type|enum|import|export|from|return|if|else|for|while|switch|case|break|continue|async|await|new|typeof|instanceof|extends|implements|public|private|protected|static|readonly)\b/g,
          className: 'keyword',
        },
        { regex: /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g, className: 'string' },
        { regex: /\b([A-Z][a-zA-Z0-9]*)\b/g, className: 'type' },
        { regex: /\b(\d+)\b/g, className: 'number' },
        { regex: /([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, className: 'function' },
      ],
      html: [
        { regex: /(<!--[\s\S]*?-->)/g, className: 'comment' },
        { regex: /(&lt;\/?[a-z][\s\S]*?&gt;)/gi, className: 'tag' },
        { regex: /\b([a-z-]+)=/gi, className: 'attribute' },
        { regex: /(['"])((?:\\.|(?!\1)[^\\])*)\1/g, className: 'string' },
      ],
      scss: [
        { regex: /(\/\/.*$)/gm, className: 'comment' },
        { regex: /(\/\*[\s\S]*?\*\/)/g, className: 'comment' },
        { regex: /(\$[a-z-]+)/gi, className: 'variable' },
        {
          regex:
            /(@media|@import|@mixin|@include|@extend|@if|@else|@for|@each)/g,
          className: 'keyword',
        },
        { regex: /([.#][a-z-]+)/gi, className: 'selector' },
        { regex: /(['"])((?:\\.|(?!\1)[^\\])*)\1/g, className: 'string' },
        { regex: /\b(\d+(?:px|rem|em|%|vh|vw)?)\b/g, className: 'number' },
      ],
      bash: [
        { regex: /(#.*$)/gm, className: 'comment' },
        {
          regex: /\b(npm|pnpm|yarn|git|cd|ls|mkdir|rm|cp|mv|echo|cat)\b/g,
          className: 'keyword',
        },
        { regex: /(['"])((?:\\.|(?!\1)[^\\])*)\1/g, className: 'string' },
        { regex: /(--?[a-z-]+)/gi, className: 'flag' },
      ],
    };

    // Apply syntax highlighting if patterns exist for the language
    if (patterns[language]) {
      let highlighted = this.escapeHtml(code);

      patterns[language].forEach(({ regex, className }) => {
        highlighted = highlighted.replace(
          regex,
          `<span class="${className}">$&</span>`,
        );
      });

      return highlighted;
    }

    // Return escaped HTML if no patterns found
    return this.escapeHtml(code);
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Add line numbers to code
   */
  protected getCodeWithLineNumbers(): string {
    const formatted = this.getFormattedCode();
    const lines = formatted.split('\n');

    return lines
      .map(
        (line, index) => `<span class="line-number">${index + 1}</span>${line}`,
      )
      .join('\n');
  }
}
