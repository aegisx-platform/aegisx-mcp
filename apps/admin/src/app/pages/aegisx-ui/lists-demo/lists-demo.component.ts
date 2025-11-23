import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import {
  AxListComponent,
  ListItem,
  AxTimelineComponent,
  TimelineItem,
} from '@aegisx/ui';

@Component({
  selector: 'app-lists-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    AxListComponent,
    AxTimelineComponent,
  ],
  templateUrl: './lists-demo.component.html',
  styleUrls: ['./lists-demo.component.scss'],
})
export class ListsDemoComponent {
  listItems: ListItem[] = [
    { title: 'Item 1', description: 'Description 1', icon: '📄' },
    { title: 'Item 2', description: 'Description 2', icon: '📁' },
    { title: 'Item 3', description: 'Description 3', icon: '📊' },
  ];

  timelineItems: TimelineItem[] = [
    {
      title: 'Event 1',
      description: 'First event',
      timestamp: '2024-01-01',
      color: 'var(--ax-primary)',
    },
    {
      title: 'Event 2',
      description: 'Second event',
      timestamp: '2024-01-02',
      color: 'var(--ax-success)',
    },
    {
      title: 'Event 3',
      description: 'Third event',
      timestamp: '2024-01-03',
      color: 'var(--ax-info)',
    },
  ];
}
