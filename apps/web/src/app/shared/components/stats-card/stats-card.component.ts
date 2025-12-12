import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsCardComponent {
  @Input() title: string = 'Title';
  @Input() value: string | number = '0';
  @Input() icon: string = 'bar_chart';
  @Input() color: 'primary' | 'accent' | 'warn' | 'success' | 'info' =
    'primary';
  @Input() change?: number; // e.g., 5.2 for +5.2%
  @Input() changeLabel?: string; // e.g., "vs last month"
}
