import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import {
  AxCardComponent,
  AxStatsCardComponent,
  AxSparklineComponent,
} from '@aegisx/ui';
import { CodePreviewComponent } from '../../../components/code-preview/code-preview.component';

@Component({
  selector: 'app-cards-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    AxCardComponent,
    AxStatsCardComponent,
    AxSparklineComponent,
    CodePreviewComponent,
  ],
  templateUrl: './cards-demo.component.html',
  styleUrls: ['./cards-demo.component.scss'],
})
export class CardsDemoComponent {
  // Sparkline data for project progress visualization
  projectProgress = [45, 52, 48, 58, 62, 68, 72, 70, 75, 73, 78, 75];

  onCardClick(cardType: string): void {
    console.log(`${cardType} card clicked`);
  }
}
