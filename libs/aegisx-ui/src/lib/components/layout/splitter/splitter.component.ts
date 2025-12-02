import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type SplitterOrientation = 'horizontal' | 'vertical';
export type SplitterUnit = 'percent' | 'pixel';
export type SplitterStateStorage = 'local' | 'session';

/**
 * Splitter Component
 *
 * A resizable split container that allows users to adjust panel sizes
 * by dragging a separator bar. Supports both horizontal and vertical orientations.
 *
 * @example
 * // Basic horizontal split (side by side)
 * <ax-splitter orientation="horizontal" [size]="30">
 *   <div before>Left Panel</div>
 *   <div after>Right Panel</div>
 * </ax-splitter>
 *
 * @example
 * // Vertical split (top/bottom)
 * <ax-splitter orientation="vertical" [size]="50">
 *   <div before>Top Panel</div>
 *   <div after>Bottom Panel</div>
 * </ax-splitter>
 *
 * @example
 * // With min/max constraints
 * <ax-splitter [size]="40" [min]="20" [max]="80">
 *   <div before>Sidebar</div>
 *   <div after>Content</div>
 * </ax-splitter>
 *
 * @example
 * // With state persistence (remembers size across page refreshes)
 * <ax-splitter stateKey="my-splitter" stateStorage="local">
 *   <div before>Sidebar</div>
 *   <div after>Content</div>
 * </ax-splitter>
 */
@Component({
  selector: 'ax-splitter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #container
      class="ax-splitter"
      [class.ax-splitter--horizontal]="orientation === 'horizontal'"
      [class.ax-splitter--vertical]="orientation === 'vertical'"
      [class.ax-splitter--dragging]="isDragging"
      [class.ax-splitter--disabled]="disabled"
    >
      <!-- Before Panel -->
      <div
        class="ax-splitter__panel ax-splitter__panel--before"
        [style]="beforePanelStyle"
      >
        <ng-content select="[before]"></ng-content>
      </div>

      <!-- Separator -->
      <div
        #separator
        class="ax-splitter__separator"
        [class.ax-splitter__separator--active]="isDragging"
        (mousedown)="onDragStart($event)"
        (touchstart)="onTouchStart($event)"
      >
        <div class="ax-splitter__separator-handle">
          <div class="ax-splitter__separator-icon"></div>
        </div>
      </div>

      <!-- After Panel -->
      <div
        class="ax-splitter__panel ax-splitter__panel--after"
        [style]="afterPanelStyle"
      >
        <ng-content select="[after]"></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./splitter.component.scss'],
})
export class AxSplitterComponent implements OnInit, OnDestroy {
  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;
  @ViewChild('separator') separatorRef!: ElementRef<HTMLElement>;

  /** Orientation: horizontal (left/right) or vertical (top/bottom) */
  @Input() orientation: SplitterOrientation = 'horizontal';

  /** Unit type for size values */
  @Input() unit: SplitterUnit = 'percent';

  /** Initial size of the "before" panel (percentage or pixels) */
  @Input() size = 50;

  /** Minimum size of the "before" panel */
  @Input() min = 0;

  /** Maximum size of the "before" panel */
  @Input() max = 100;

  /** Separator thickness in pixels */
  @Input() separatorSize = 8;

  /** Disable resizing */
  @Input() disabled = false;

  /** Key to store splitter state. When provided, enables state persistence. */
  @Input() stateKey: string | null = null;

  /** Storage type for state persistence: 'local' (localStorage) or 'session' (sessionStorage) */
  @Input() stateStorage: SplitterStateStorage = 'local';

  /** Emit when size changes during drag */
  @Output() sizeChange = new EventEmitter<number>();

  /** Emit when drag starts */
  @Output() dragStart = new EventEmitter<void>();

  /** Emit when drag ends */
  @Output() dragEnd = new EventEmitter<number>();

  isDragging = false;
  private startPos = 0;
  private startSize = 0;
  private containerSize = 0;
  private initialSize = 50;

  ngOnInit(): void {
    this.initialSize = this.size;
    this.restoreState();
  }

  ngOnDestroy(): void {
    this.removeListeners();
  }

  get beforePanelStyle(): { [key: string]: string } {
    const dimension = this.orientation === 'horizontal' ? 'width' : 'height';
    const value = this.unit === 'percent' ? `${this.size}%` : `${this.size}px`;
    return {
      [dimension]: `calc(${value} - ${this.separatorSize / 2}px)`,
      'flex-shrink': '0',
    };
  }

  get afterPanelStyle(): { [key: string]: string } {
    return {
      flex: '1',
      'min-width': '0',
      'min-height': '0',
    };
  }

  onDragStart(event: MouseEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    this.startDrag(
      this.orientation === 'horizontal' ? event.clientX : event.clientY,
    );
    this.addListeners();
  }

  onTouchStart(event: TouchEvent): void {
    if (this.disabled) return;
    const touch = event.touches[0];
    this.startDrag(
      this.orientation === 'horizontal' ? touch.clientX : touch.clientY,
    );
    this.addTouchListeners();
  }

  private startDrag(position: number): void {
    this.isDragging = true;
    this.startPos = position;
    this.startSize = this.size;
    this.containerSize = this.getContainerSize();
    this.dragStart.emit();
  }

  private getContainerSize(): number {
    if (!this.containerRef) return 0;
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    return this.orientation === 'horizontal' ? rect.width : rect.height;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.handleDrag(
      this.orientation === 'horizontal' ? event.clientX : event.clientY,
    );
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (!this.isDragging) return;
    this.endDrag();
  }

  private onTouchMove = (event: TouchEvent): void => {
    if (!this.isDragging) return;
    const touch = event.touches[0];
    this.handleDrag(
      this.orientation === 'horizontal' ? touch.clientX : touch.clientY,
    );
  };

  private onTouchEnd = (): void => {
    if (!this.isDragging) return;
    this.endDrag();
    this.removeTouchListeners();
  };

  private handleDrag(currentPos: number): void {
    const delta = currentPos - this.startPos;
    let newSize: number;

    if (this.unit === 'percent') {
      const deltaPercent = (delta / this.containerSize) * 100;
      newSize = this.startSize + deltaPercent;
    } else {
      newSize = this.startSize + delta;
    }

    // Apply constraints
    newSize = Math.max(this.min, Math.min(this.max, newSize));

    if (newSize !== this.size) {
      this.size = newSize;
      this.sizeChange.emit(this.size);
    }
  }

  private endDrag(): void {
    this.isDragging = false;
    this.dragEnd.emit(this.size);
    this.saveState();
    this.removeListeners();
  }

  private addListeners(): void {
    // Listeners are handled by @HostListener
  }

  private removeListeners(): void {
    // Cleanup handled by Angular
  }

  private addTouchListeners(): void {
    document.addEventListener('touchmove', this.onTouchMove, {
      passive: false,
    });
    document.addEventListener('touchend', this.onTouchEnd);
  }

  private removeTouchListeners(): void {
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
  }

  /** Programmatically set the size */
  setSize(size: number): void {
    this.size = Math.max(this.min, Math.min(this.max, size));
    this.sizeChange.emit(this.size);
  }

  /** Reset to initial size */
  reset(initialSize?: number): void {
    this.setSize(initialSize ?? this.initialSize);
  }

  /** Clear saved state and reset to initial size */
  clearState(): void {
    if (this.stateKey) {
      this.getStorage()?.removeItem(this.stateKey);
    }
    this.reset();
  }

  /** Save current size to storage */
  private saveState(): void {
    if (!this.stateKey) return;

    try {
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(this.stateKey, JSON.stringify({ size: this.size }));
      }
    } catch {
      // Storage not available or quota exceeded - fail silently
    }
  }

  /** Restore size from storage */
  private restoreState(): void {
    if (!this.stateKey) return;

    try {
      const storage = this.getStorage();
      if (storage) {
        const saved = storage.getItem(this.stateKey);
        if (saved) {
          const state = JSON.parse(saved);
          if (typeof state.size === 'number') {
            this.size = Math.max(this.min, Math.min(this.max, state.size));
          }
        }
      }
    } catch {
      // Storage not available or invalid data - use default size
    }
  }

  /** Get storage based on stateStorage setting */
  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;
    return this.stateStorage === 'session' ? sessionStorage : localStorage;
  }
}
