import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerLayout, DividerType, DividerAlign } from './divider.types';

@Component({
  selector: 'ax-divider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss'],
})
export class AxDividerComponent {
  /** Layout direction: horizontal (default) or vertical */
  @Input() layout: DividerLayout = 'horizontal';

  /** Border style: solid (default), dashed, or dotted */
  @Input() type: DividerType = 'solid';

  /** Content alignment: left, center (default), right, top, bottom */
  @Input() align: DividerAlign = 'center';

  @HostBinding('class')
  get hostClasses(): string {
    return [
      'ax-divider',
      `ax-divider--${this.layout}`,
      `ax-divider--${this.type}`,
      `ax-divider--align-${this.align}`,
    ].join(' ');
  }

  @HostBinding('attr.role')
  get role(): string {
    return 'separator';
  }

  @HostBinding('attr.aria-orientation')
  get ariaOrientation(): string {
    return this.layout;
  }
}
