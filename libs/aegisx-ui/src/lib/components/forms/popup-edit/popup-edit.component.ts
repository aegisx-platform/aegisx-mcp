import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { OverlayModule } from '@angular/cdk/overlay';

export type PopupEditInputType = 'text' | 'number' | 'textarea';

/**
 * Popup Edit Component
 *
 * Inline editing component that shows an input popup when clicked.
 * Perfect for editable table cells or quick inline updates.
 *
 * @example
 * // Basic text editing
 * <ax-popup-edit
 *   [(value)]="userName"
 *   label="Name"
 *   (save)="onSave($event)">
 *   {{ userName }}
 * </ax-popup-edit>
 *
 * @example
 * // Number editing
 * <ax-popup-edit
 *   [(value)]="price"
 *   type="number"
 *   label="Price"
 *   (save)="updatePrice($event)">
 *   {{ price | currency }}
 * </ax-popup-edit>
 *
 * @example
 * // Textarea editing
 * <ax-popup-edit
 *   [(value)]="description"
 *   type="textarea"
 *   [rows]="3"
 *   (save)="updateDesc($event)">
 *   {{ description }}
 * </ax-popup-edit>
 */
@Component({
  selector: 'ax-popup-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    OverlayModule,
  ],
  template: `
    <div
      class="ax-popup-edit"
      [class.ax-popup-edit--disabled]="disabled"
      cdkOverlayOrigin
      #trigger="cdkOverlayOrigin"
      tabindex="0"
      role="button"
      (click)="open()"
      (keyup.enter)="open()"
    >
      <ng-content></ng-content>
      @if (!disabled) {
        <mat-icon class="ax-popup-edit__icon">edit</mat-icon>
      }
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="isOpen"
      [cdkConnectedOverlayHasBackdrop]="true"
      [cdkConnectedOverlayBackdropClass]="'ax-popup-edit-backdrop'"
      (backdropClick)="cancel()"
      (detach)="onDetach()"
    >
      <div class="ax-popup-edit__panel" #panel>
        <div class="ax-popup-edit__content">
          @if (type === 'textarea') {
            <mat-form-field appearance="outline" class="ax-popup-edit__field">
              @if (label) {
                <mat-label>{{ label }}</mat-label>
              }
              <textarea
                matInput
                #inputRef
                [(ngModel)]="editValue"
                [rows]="rows"
                [placeholder]="placeholder"
                (keydown.escape)="cancel()"
              ></textarea>
            </mat-form-field>
          } @else {
            <mat-form-field appearance="outline" class="ax-popup-edit__field">
              @if (label) {
                <mat-label>{{ label }}</mat-label>
              }
              <input
                matInput
                #inputRef
                [type]="type"
                [(ngModel)]="editValue"
                [placeholder]="placeholder"
                (keydown.enter)="save()"
                (keydown.escape)="cancel()"
              />
            </mat-form-field>
          }
        </div>

        @if (showButtons) {
          <div class="ax-popup-edit__actions">
            <button mat-button (click)="cancel()">
              {{ cancelLabel }}
            </button>
            <button mat-flat-button color="primary" (click)="save()">
              {{ saveLabel }}
            </button>
          </div>
        }
      </div>
    </ng-template>
  `,
  styleUrls: ['./popup-edit.component.scss'],
})
export class AxPopupEditComponent {
  @ViewChild('inputRef') inputRef!: ElementRef<
    HTMLInputElement | HTMLTextAreaElement
  >;

  /** Current value */
  @Input() value: string | number = '';

  /** Input type */
  @Input() type: PopupEditInputType = 'text';

  /** Form field label */
  @Input() label = '';

  /** Placeholder text */
  @Input() placeholder = '';

  /** Number of rows for textarea */
  @Input() rows = 3;

  /** Disable editing */
  @Input() disabled = false;

  /** Show action buttons */
  @Input() showButtons = true;

  /** Save button label */
  @Input() saveLabel = 'Save';

  /** Cancel button label */
  @Input() cancelLabel = 'Cancel';

  /** Validation function */
  @Input() validate?: (value: string | number) => boolean;

  /** Emits when value changes */
  @Output() valueChange = new EventEmitter<string | number>();

  /** Emits on save */
  @Output() saveEvent = new EventEmitter<string | number>();

  /** Emits on cancel */
  @Output() cancelEvent = new EventEmitter<void>();

  /** Emits when popup opens */
  @Output() opened = new EventEmitter<void>();

  /** Emits when popup closes */
  @Output() closed = new EventEmitter<void>();

  isOpen = false;
  editValue: string | number = '';
  private initialValue: string | number = '';

  open(): void {
    if (this.disabled) return;

    this.initialValue = this.value;
    this.editValue = this.value;
    this.isOpen = true;
    this.opened.emit();

    // Focus input after overlay opens
    setTimeout(() => {
      if (this.inputRef?.nativeElement) {
        this.inputRef.nativeElement.focus();
        this.inputRef.nativeElement.select();
      }
    }, 50);
  }

  save(): void {
    // Validate if function provided
    if (this.validate && !this.validate(this.editValue)) {
      return;
    }

    this.value = this.editValue;
    this.valueChange.emit(this.value);
    this.saveEvent.emit(this.value);
    this.close();
  }

  cancel(): void {
    this.editValue = this.initialValue;
    this.cancelEvent.emit();
    this.close();
  }

  private close(): void {
    this.isOpen = false;
    this.closed.emit();
  }

  onDetach(): void {
    this.isOpen = false;
  }
}
