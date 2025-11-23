import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

interface ComponentCategory {
  title: string;
  icon: string;
  description: string;
  components: ComponentLink[];
}

interface ComponentLink {
  name: string;
  route: string;
  description: string;
  badge?: string;
}

@Component({
  selector: 'app-aegisx-ui',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './aegisx-ui.component.html',
  styleUrls: ['./aegisx-ui.component.scss'],
})
export class AegisxUiComponent {
  categories: ComponentCategory[] = [
    {
      title: 'Form Inputs',
      icon: 'edit_note',
      description: 'Input components for forms and user data entry',
      components: [
        {
          name: 'Date Picker',
          route: '/aegisx-ui/date-picker',
          description: 'Advanced date picker with Thai/English locales',
          badge: 'Multilingual',
        },
      ],
    },
    {
      title: 'Content Display',
      icon: 'view_module',
      description: 'Components for displaying structured content',
      components: [
        {
          name: 'Cards',
          route: '/aegisx-ui/cards',
          description: 'Card and Stats Card components',
        },
        {
          name: 'Lists',
          route: '/aegisx-ui/lists',
          description: 'List and Timeline components',
        },
        {
          name: 'Data Display',
          route: '/aegisx-ui/data-display',
          description: 'Field Display and Description List',
        },
      ],
    },
    {
      title: 'User Elements',
      icon: 'account_circle',
      description: 'User-related UI components',
      components: [
        {
          name: 'Avatar',
          route: '/aegisx-ui/avatar',
          description: 'User avatar with multiple sizes and variants',
        },
      ],
    },
    {
      title: 'Feedback & Status',
      icon: 'notifications',
      description: 'Components for user feedback and status indication',
      components: [
        {
          name: 'Feedback',
          route: '/aegisx-ui/feedback',
          description: 'Alert and Loading Bar components',
        },
      ],
    },
    {
      title: 'Navigation',
      icon: 'explore',
      description: 'Navigation and wayfinding components',
      components: [
        {
          name: 'Breadcrumb',
          route: '/aegisx-ui/breadcrumb',
          description: 'Hierarchical navigation breadcrumbs',
        },
      ],
    },
  ];

  totalComponents = this.categories.reduce(
    (sum, cat) => sum + cat.components.length,
    0,
  );
}
