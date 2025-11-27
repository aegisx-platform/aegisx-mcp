import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { DocHeaderComponent } from '../../../../components/docs';

/**
 * Introduction Page - Overview of AegisX Design System
 * Location: docs/getting-started/introduction
 */
@Component({
  selector: 'ax-introduction-doc',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    DocHeaderComponent,
  ],
  templateUrl: './introduction-doc.component.html',
  styleUrl: './introduction-doc.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class IntroductionDocComponent {
  features = [
    {
      icon: 'palette',
      title: 'Design Tokens',
      description:
        'Consistent design variables for colors, spacing, typography, and more',
      link: '/design-tokens',
    },
    {
      icon: 'widgets',
      title: 'Material Components',
      description:
        'Angular Material components following Material Design 3 guidelines',
      link: '/components',
    },
    {
      icon: 'extension',
      title: 'AegisX Components',
      description:
        'Custom Tremor-inspired components for data visualization and dashboards',
      link: '/card-examples',
    },
    {
      icon: 'article',
      title: 'Form Patterns',
      description:
        'Comprehensive form layouts and patterns for various use cases',
      link: '/form-sizes',
    },
  ];

  quickLinks = [
    {
      title: 'Installation',
      description: 'Get started with AegisX Design System',
      link: '/installation',
      icon: 'download',
    },
    {
      title: 'Quick Start',
      description: 'Build your first page in minutes',
      link: '/quick-start',
      icon: 'speed',
    },
    {
      title: 'Typography',
      description: 'Typography system and text styles',
      link: '/typography',
      icon: 'text_fields',
    },
  ];
}
