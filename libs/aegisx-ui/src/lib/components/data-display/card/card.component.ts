import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'outlined' | 'elevated';
export type CardSize = 'sm' | 'md' | 'lg';
export type CardColor =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';
export type CardColorIntensity = 'filled' | 'subtle';
export type CardBorderWidth = '1' | '2' | '3' | '4';

@Component({
  selector: 'ax-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class AxCardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() size: CardSize = 'md';
  @Input() color: CardColor = 'default';
  @Input() colorIntensity: CardColorIntensity = 'filled';
  @Input() borderWidth: CardBorderWidth | string = '1'; // Support both predefined and custom values
  @Input() hoverable = false;
  @Input() clickable = false;
  @Input() loading = false;
  @Input() title = '';
  @Input() subtitle = '';

  get cardClasses(): string {
    const classes = ['ax-card'];
    classes.push(`ax-card-${this.variant}`);
    classes.push(`ax-card-${this.size}`);
    if (this.color !== 'default') {
      classes.push(`ax-card-${this.color}`);
      classes.push(`ax-card-${this.colorIntensity}`);
    }
    if (this.borderWidth && this.borderWidth !== '1') {
      classes.push(`ax-card-border-${this.borderWidth}`);
    }
    if (this.hoverable) classes.push('ax-card-hoverable');
    if (this.clickable) classes.push('ax-card-clickable');
    if (this.loading) classes.push('ax-card-loading');
    return classes.join(' ');
  }

  get cardStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};

    // Support custom border width (e.g., "2.5px", "0.5rem")
    if (this.borderWidth && !['1', '2', '3', '4'].includes(this.borderWidth)) {
      styles['border-width'] = this.borderWidth;
    }

    return styles;
  }
}
