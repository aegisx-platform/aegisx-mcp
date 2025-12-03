import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  MatDialogModule,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { A11yModule } from '@angular/cdk/a11y';
import { AxCommandPaletteService } from './command-palette.service';
import { CommandItem } from './command-palette.types';

@Component({
  selector: 'ax-command-palette-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatDialogModule,
    MatIconModule,
    MatRippleModule,
    A11yModule,
  ],
  template: `
    <div
      class="ax-command-palette"
      cdkTrapFocus
      [cdkTrapFocusAutoCapture]="true"
    >
      <!-- Search Input -->
      <div class="ax-command-palette__header">
        <mat-icon class="ax-command-palette__search-icon">search</mat-icon>
        <input
          #searchInput
          type="text"
          class="ax-command-palette__input"
          [placeholder]="commandService.config().placeholder"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
          (keydown)="onKeyDown($event)"
          autocomplete="off"
          spellcheck="false"
        />
        <kbd class="ax-command-palette__shortcut">ESC</kbd>
      </div>

      <!-- Results -->
      <div
        class="ax-command-palette__content"
        [style.maxHeight]="commandService.config().maxHeight"
      >
        @if (commandService.filteredResults().length === 0 && searchQuery) {
          <div class="ax-command-palette__empty">
            <mat-icon>search_off</mat-icon>
            <span>{{ commandService.config().emptyMessage }}</span>
          </div>
        } @else {
          @for (group of commandService.groupedResults(); track group.id) {
            <div class="ax-command-palette__group">
              <div class="ax-command-palette__group-label">
                {{ group.label }}
              </div>
              @for (
                command of group.commands;
                track command.id;
                let i = $index
              ) {
                <button
                  class="ax-command-palette__item"
                  [class.ax-command-palette__item--selected]="
                    isSelected(command)
                  "
                  [class.ax-command-palette__item--disabled]="command.disabled"
                  [disabled]="command.disabled"
                  matRipple
                  (click)="executeCommand(command)"
                  (mouseenter)="onMouseEnter(command)"
                >
                  @if (command.icon) {
                    <mat-icon class="ax-command-palette__item-icon">{{
                      command.icon
                    }}</mat-icon>
                  }
                  <div class="ax-command-palette__item-content">
                    <span class="ax-command-palette__item-label">{{
                      command.label
                    }}</span>
                    @if (command.description) {
                      <span class="ax-command-palette__item-description">{{
                        command.description
                      }}</span>
                    }
                  </div>
                  @if (
                    command.shortcut && commandService.config().showShortcuts
                  ) {
                    <kbd class="ax-command-palette__item-shortcut">{{
                      command.shortcut
                    }}</kbd>
                  }
                </button>
              }
            </div>
          }
        }
      </div>

      <!-- Footer -->
      <div class="ax-command-palette__footer">
        <div class="ax-command-palette__hint">
          <kbd>↑↓</kbd> to navigate <kbd>↵</kbd> to select <kbd>esc</kbd> to
          close
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .ax-command-palette {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 640px;
        background: var(--ax-background-default);
        border-radius: var(--ax-radius-lg, 12px);
        box-shadow: var(--ax-shadow-xl);
        overflow: hidden;
      }

      .ax-command-palette__header {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);
        padding: var(--ax-spacing-md, 0.75rem) var(--ax-spacing-lg, 1rem);
        border-bottom: 1px solid var(--ax-border);
      }

      .ax-command-palette__search-icon {
        color: var(--ax-text-secondary);
        flex-shrink: 0;
      }

      .ax-command-palette__input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: var(--ax-text-base, 1rem);
        color: var(--ax-text-primary);
        outline: none;
      }

      .ax-command-palette__input::placeholder {
        color: var(--ax-text-tertiary);
      }

      .ax-command-palette__shortcut {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 24px;
        padding: 0 var(--ax-spacing-xs, 0.25rem);
        background: var(--ax-background-subtle);
        border: 1px solid var(--ax-border);
        border-radius: var(--ax-radius-sm, 4px);
        font-size: var(--ax-text-xs, 0.75rem);
        font-family: inherit;
        color: var(--ax-text-secondary);
      }

      .ax-command-palette__content {
        overflow-y: auto;
        padding: var(--ax-spacing-sm, 0.5rem) 0;
      }

      .ax-command-palette__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--ax-spacing-sm, 0.5rem);
        padding: var(--ax-spacing-xl, 2rem);
        color: var(--ax-text-tertiary);

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
        }
      }

      .ax-command-palette__group:not(:last-child) {
        margin-bottom: var(--ax-spacing-sm, 0.5rem);
      }

      .ax-command-palette__group-label {
        padding: var(--ax-spacing-xs, 0.25rem) var(--ax-spacing-lg, 1rem);
        font-size: var(--ax-text-xs, 0.75rem);
        font-weight: 600;
        color: var(--ax-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .ax-command-palette__item {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);
        width: 100%;
        padding: var(--ax-spacing-sm, 0.5rem) var(--ax-spacing-lg, 1rem);
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
        transition: background-color var(--ax-duration-fast, 150ms);
      }

      .ax-command-palette__item:hover,
      .ax-command-palette__item--selected {
        background: var(--ax-background-subtle);
      }

      .ax-command-palette__item--disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .ax-command-palette__item-icon {
        flex-shrink: 0;
        color: var(--ax-text-secondary);
      }

      .ax-command-palette__item-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .ax-command-palette__item-label {
        font-size: var(--ax-text-sm, 0.875rem);
        font-weight: 500;
        color: var(--ax-text-primary);
      }

      .ax-command-palette__item-description {
        font-size: var(--ax-text-xs, 0.75rem);
        color: var(--ax-text-tertiary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ax-command-palette__item-shortcut {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 var(--ax-spacing-xs, 0.25rem);
        background: var(--ax-background-subtle);
        border: 1px solid var(--ax-border);
        border-radius: var(--ax-radius-xs, 2px);
        font-size: 10px;
        font-family: inherit;
        color: var(--ax-text-tertiary);
        flex-shrink: 0;
      }

      .ax-command-palette__footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: var(--ax-spacing-sm, 0.5rem) var(--ax-spacing-lg, 1rem);
        border-top: 1px solid var(--ax-border);
        background: var(--ax-background-subtle);
      }

      .ax-command-palette__hint {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);
        font-size: var(--ax-text-xs, 0.75rem);
        color: var(--ax-text-tertiary);

        kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          background: var(--ax-background-default);
          border: 1px solid var(--ax-border);
          border-radius: var(--ax-radius-xs, 2px);
          font-size: 10px;
          font-family: inherit;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AxCommandPaletteDialogComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  commandService = inject(AxCommandPaletteService);
  private dialogRef = inject(MatDialogRef<AxCommandPaletteDialogComponent>);

  searchQuery = '';
  private selectedCommand: CommandItem | null = null;

  ngOnInit(): void {
    this.focusInput();
  }

  private focusInput(): void {
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    });
  }

  onSearchChange(query: string): void {
    this.commandService.setSearchQuery(query);
    this.updateSelectedCommand();
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.commandService.selectNext();
        this.updateSelectedCommand();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.commandService.selectPrevious();
        this.updateSelectedCommand();
        break;
      case 'Enter':
        event.preventDefault();
        this.commandService.executeSelected();
        this.dialogRef.close();
        break;
      case 'Escape':
        event.preventDefault();
        this.dialogRef.close();
        break;
    }
  }

  executeCommand(command: CommandItem): void {
    this.commandService.executeCommand(command);
    this.dialogRef.close();
  }

  onMouseEnter(command: CommandItem): void {
    this.selectedCommand = command;
    const results = this.commandService.filteredResults();
    const index = results.findIndex((r) => r.item.id === command.id);
    if (index >= 0) {
      this.commandService.selectIndex(index);
    }
  }

  isSelected(command: CommandItem): boolean {
    const results = this.commandService.filteredResults();
    const selectedIndex = this.commandService.selectedIndex();
    return results[selectedIndex]?.item.id === command.id;
  }

  private updateSelectedCommand(): void {
    const results = this.commandService.filteredResults();
    const selectedIndex = this.commandService.selectedIndex();
    this.selectedCommand = results[selectedIndex]?.item || null;
  }
}

@Component({
  selector: 'ax-command-palette',
  standalone: true,
  imports: [CommonModule],
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AxCommandPaletteComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private dialog = inject(MatDialog);
  private commandService = inject(AxCommandPaletteService);
  private dialogRef: MatDialogRef<AxCommandPaletteDialogComponent> | null =
    null;

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const config = this.commandService.config();
    const hotkey = config.hotkey || 'k';
    const useMetaKey = config.useMetaKey !== false;

    const isHotkey = event.key.toLowerCase() === hotkey;
    const hasModifier = useMetaKey
      ? event.metaKey || event.ctrlKey
      : event.ctrlKey;

    if (isHotkey && hasModifier) {
      event.preventDefault();
      this.toggle();
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
  }

  ngOnDestroy(): void {
    this.close();
  }

  open(): void {
    if (this.dialogRef) {
      return;
    }

    this.commandService.open();
    this.dialogRef = this.dialog.open(AxCommandPaletteDialogComponent, {
      width: '640px',
      maxWidth: '90vw',
      panelClass: 'ax-command-palette-panel',
      backdropClass: 'ax-command-palette-backdrop',
      hasBackdrop: true,
      autoFocus: false,
    });

    this.dialogRef.afterClosed().subscribe(() => {
      this.commandService.close();
      this.dialogRef = null;
    });
  }

  close(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  toggle(): void {
    if (this.dialogRef) {
      this.close();
    } else {
      this.open();
    }
  }
}
