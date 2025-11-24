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
  // Basic list items
  basicListItems: ListItem[] = [
    {
      title: 'Dashboard Overview',
      description: 'View key metrics and analytics',
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
    },
    { title: 'Settings', description: 'Configure application settings' },
  ];

  // List with icons
  iconListItems: ListItem[] = [
    { title: 'Documents', description: '24 files', icon: '📄' },
    { title: 'Images', description: '156 photos', icon: '🖼️' },
    { title: 'Videos', description: '8 videos', icon: '🎥' },
    { title: 'Music', description: '42 tracks', icon: '🎵' },
  ];

  // List with meta information
  metaListItems: ListItem[] = [
    { title: 'Project Alpha', description: 'Frontend redesign', meta: '85%' },
    { title: 'Project Beta', description: 'API integration', meta: '60%' },
    { title: 'Project Gamma', description: 'Database migration', meta: '100%' },
    { title: 'Project Delta', description: 'Mobile app', meta: '45%' },
  ];

  // List with disabled items
  disabledListItems: ListItem[] = [
    { title: 'Active Feature', description: 'Currently available', icon: '✅' },
    {
      title: 'Disabled Feature',
      description: 'Coming soon',
      icon: '⏸️',
      disabled: true,
    },
    {
      title: 'Active Feature 2',
      description: 'Currently available',
      icon: '✅',
    },
    {
      title: 'Disabled Feature 2',
      description: 'Under maintenance',
      icon: '🔧',
      disabled: true,
    },
  ];

  // Timeline - Project milestones
  projectTimelineItems: TimelineItem[] = [
    {
      title: 'Project Kickoff',
      description: 'Initial planning and team formation',
      timestamp: 'January 15, 2024',
      icon: '🚀',
      color: 'var(--ax-primary)',
    },
    {
      title: 'Design Phase Complete',
      description: 'UI/UX designs approved by stakeholders',
      timestamp: 'February 10, 2024',
      icon: '🎨',
      color: 'var(--ax-success)',
    },
    {
      title: 'Development Sprint 1',
      description: 'Core features implemented and tested',
      timestamp: 'March 5, 2024',
      icon: '💻',
      color: 'var(--ax-info)',
    },
    {
      title: 'Beta Release',
      description: 'Released to select users for feedback',
      timestamp: 'April 1, 2024',
      icon: '🔬',
      color: 'var(--ax-warning)',
    },
  ];

  // Timeline - System events
  systemTimelineItems: TimelineItem[] = [
    {
      title: 'System Update',
      description: 'Deployed version 2.1.0 to production',
      timestamp: '2 hours ago',
      color: 'var(--ax-success)',
    },
    {
      title: 'Database Backup',
      description: 'Automated backup completed successfully',
      timestamp: '5 hours ago',
      color: 'var(--ax-info)',
    },
    {
      title: 'Security Scan',
      description: 'No vulnerabilities detected',
      timestamp: '1 day ago',
      color: 'var(--ax-primary)',
    },
  ];

  // Timeline - User activities
  activityTimelineItems: TimelineItem[] = [
    {
      title: 'Sarah Johnson joined the team',
      description: 'New developer added to Engineering team',
      timestamp: 'Just now',
      icon: '👤',
      color: 'var(--ax-primary)',
    },
    {
      title: 'Document uploaded',
      description: 'Q1_Financial_Report.pdf added to shared drive',
      timestamp: '15 minutes ago',
      icon: '📄',
      color: 'var(--ax-info)',
    },
    {
      title: 'Meeting scheduled',
      description: 'Team standup scheduled for tomorrow 9:00 AM',
      timestamp: '1 hour ago',
      icon: '📅',
      color: 'var(--ax-success)',
    },
    {
      title: 'Task completed',
      description: 'Fixed authentication bug in user login flow',
      timestamp: '3 hours ago',
      icon: '✅',
      color: 'var(--ax-success)',
    },
  ];

  onListItemClick(item: ListItem): void {
    if (!item.disabled) {
      console.log('List item clicked:', item.title);
    }
  }
}
