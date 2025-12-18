import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StatsCardTrend } from './stats-card.types';

@Component({
  selector: 'ax-stats-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss'],
})
export class AxStatsCardComponent {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() change: string = '';
  @Input() trend: StatsCardTrend = 'neutral';
  @Input() icon: string = '';

  get statsClasses(): string {
    const classes = ['ax-stats-card'];
    return classes.join(' ');
  }

  get trendClasses(): string {
    const classes = ['ax-stats-card-trend'];
    classes.push(`ax-stats-card-trend-${this.trend}`);
    return classes.join(' ');
  }
}
