import { Component, Input, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export type KbdVariant = 'default' | 'outline' | 'ghost';
export type KbdSize = 'sm' | 'md' | 'lg';

/**
 * Kbd Component
 *
 * Displays keyboard shortcuts and key combinations with platform-aware styling.
 * Automatically converts Ctrl to Cmd on macOS.
 *
 * @example
 * // Single key
 * <ax-kbd>K</ax-kbd>
 *
 * @example
 * // Key combination using keys array
 * <ax-kbd [keys]="['Ctrl', 'S']"></ax-kbd>
 *
 * @example
 * // Key combination using shortcut string
 * <ax-kbd shortcut="Ctrl+K"></ax-kbd>
 *
 * @example
 * // Platform-aware (Ctrl becomes Cmd on macOS)
 * <ax-kbd shortcut="Ctrl+Shift+P" [platformAware]="true"></ax-kbd>
 *
 * @example
 * // Different variants
 * <ax-kbd variant="outline" shortcut="Esc"></ax-kbd>
 * <ax-kbd variant="ghost" shortcut="Enter"></ax-kbd>
 */
@Component({
  selector: 'ax-kbd',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="kbd-wrapper" [class]="wrapperClasses">
      @for (key of displayKeys; track $index; let last = $last) {
        <kbd [class]="kbdClasses">{{ key }}</kbd>
        @if (!last) {
          <span class="kbd-separator">+</span>
        }
      }
      @if (displayKeys.length === 0) {
        <kbd [class]="kbdClasses"><ng-content></ng-content></kbd>
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .kbd-wrapper {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }

      kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--ax-font-mono, ui-monospace, monospace);
        font-weight: 500;
        white-space: nowrap;
        border-radius: var(--ax-radius-sm, 4px);
        transition: all 0.15s ease;
      }

      .kbd-separator {
        color: var(--ax-text-muted);
        font-size: 0.75em;
        font-weight: 400;
      }

      /* Sizes */
      .kbd-sm kbd {
        font-size: 0.6875rem;
        padding: 0.125rem 0.375rem;
        min-width: 1.25rem;
        height: 1.25rem;
      }

      .kbd-md kbd {
        font-size: 0.75rem;
        padding: 0.1875rem 0.5rem;
        min-width: 1.5rem;
        height: 1.5rem;
      }

      .kbd-lg kbd {
        font-size: 0.875rem;
        padding: 0.25rem 0.625rem;
        min-width: 1.75rem;
        height: 1.75rem;
      }

      /* Default variant - elevated button look */
      .kbd-default kbd {
        background: linear-gradient(
          180deg,
          var(--ax-background-default, #fff) 0%,
          var(--ax-background-subtle, #f8f9fa) 100%
        );
        border: 1px solid var(--ax-border-default, #e2e8f0);
        box-shadow:
          0 1px 2px rgba(0, 0, 0, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.8),
          0 2px 0 var(--ax-border-default, #e2e8f0);
        color: var(--ax-text-default, #1a202c);
      }

      /* Outline variant */
      .kbd-outline kbd {
        background: transparent;
        border: 1px solid var(--ax-border-default, #e2e8f0);
        color: var(--ax-text-secondary, #64748b);
      }

      /* Ghost variant */
      .kbd-ghost kbd {
        background: var(--ax-background-subtle, #f1f5f9);
        border: none;
        color: var(--ax-text-secondary, #64748b);
      }

      /* Dark mode adjustments */
      :host-context(.dark) {
        .kbd-default kbd {
          background: linear-gradient(
            180deg,
            var(--ax-background-elevated, #2d3748) 0%,
            var(--ax-background-default, #1a202c) 100%
          );
          border-color: var(--ax-border-default, #4a5568);
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 2px 0 var(--ax-border-strong, #2d3748);
          color: var(--ax-text-default, #f7fafc);
        }

        .kbd-outline kbd {
          border-color: var(--ax-border-default, #4a5568);
          color: var(--ax-text-secondary, #a0aec0);
        }

        .kbd-ghost kbd {
          background: var(--ax-background-subtle, #2d3748);
          color: var(--ax-text-secondary, #a0aec0);
        }
      }
    `,
  ],
})
export class AxKbdComponent {
  private platformId = inject(PLATFORM_ID);

  /** Variant style */
  @Input() variant: KbdVariant = 'default';

  /** Size of the kbd element */
  @Input() size: KbdSize = 'md';

  /** Array of keys to display */
  @Input() keys: string[] = [];

  /** Shortcut string (e.g., 'Ctrl+S', 'Cmd+Shift+P') */
  @Input() shortcut = '';

  /** Whether to convert Ctrl to Cmd on macOS */
  @Input() platformAware = true;

  /** Key mapping for display */
  private readonly keyMap: Record<string, string> = {
    ctrl: 'Ctrl',
    control: 'Ctrl',
    cmd: '⌘',
    command: '⌘',
    meta: '⌘',
    alt: 'Alt',
    option: '⌥',
    shift: '⇧',
    enter: '↵',
    return: '↵',
    tab: '⇥',
    backspace: '⌫',
    delete: '⌦',
    escape: 'Esc',
    esc: 'Esc',
    space: '␣',
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
    pageup: 'PgUp',
    pagedown: 'PgDn',
    home: 'Home',
    end: 'End',
  };

  /** macOS-specific key mapping */
  private readonly macKeyMap: Record<string, string> = {
    ctrl: '⌃',
    control: '⌃',
    alt: '⌥',
    option: '⌥',
  };

  /** Check if running on macOS */
  private get isMac(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return navigator.platform.toLowerCase().includes('mac');
    }
    return false;
  }

  /** Get the keys to display */
  get displayKeys(): string[] {
    let keysToProcess: string[] = [];

    if (this.shortcut) {
      keysToProcess = this.shortcut.split('+').map((k) => k.trim());
    } else if (this.keys.length > 0) {
      keysToProcess = [...this.keys];
    }

    if (keysToProcess.length === 0) {
      return [];
    }

    return keysToProcess.map((key) => this.formatKey(key));
  }

  /** Format a key for display */
  private formatKey(key: string): string {
    const lowerKey = key.toLowerCase();

    // Platform-aware conversion
    if (this.platformAware && this.isMac) {
      // Convert Ctrl to Cmd on macOS
      if (lowerKey === 'ctrl' || lowerKey === 'control') {
        return '⌘';
      }
      // Use macOS-specific symbols
      if (this.macKeyMap[lowerKey]) {
        return this.macKeyMap[lowerKey];
      }
    }

    // Use general key mapping
    if (this.keyMap[lowerKey]) {
      return this.keyMap[lowerKey];
    }

    // Return key as-is, capitalized for single letters
    if (key.length === 1) {
      return key.toUpperCase();
    }

    return key;
  }

  /** Get wrapper CSS classes */
  get wrapperClasses(): string {
    return `kbd-${this.size} kbd-${this.variant}`;
  }

  /** Get kbd element CSS classes */
  get kbdClasses(): string {
    return 'kbd';
  }
}
