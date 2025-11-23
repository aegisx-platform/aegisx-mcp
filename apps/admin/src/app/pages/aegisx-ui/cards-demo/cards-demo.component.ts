import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AxCardComponent, AxStatsCardComponent } from '@aegisx/ui';

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
  ],
  templateUrl: './cards-demo.component.html',
  styleUrls: ['./cards-demo.component.scss'],
})
export class CardsDemoComponent {}
