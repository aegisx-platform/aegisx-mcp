import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { 
  ClassicLayoutComponent,
  AegisxNavigationService,
  AegisxConfigService,
  AegisxNavigationItem
} from '@aegisx/ui';

@Component({
  imports: [ClassicLayoutComponent, RouterModule],
  selector: 'ax-root',
  template: `
    <ax-classic-layout>
      <!-- Toolbar Title -->
      <div toolbar-title>AegisX Platform</div>
      
      <!-- Toolbar Actions -->
      <div toolbar-actions>
        <!-- Add toolbar buttons here -->
      </div>
      
      <!-- Main Content -->
      <router-outlet></router-outlet>
    </ax-classic-layout>
  `,
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'AegisX Platform';

  constructor(
    private navigationService: AegisxNavigationService,
    private configService: AegisxConfigService
  ) {}

  ngOnInit(): void {
    // Set up navigation
    const navigationItems = this.getNavigationItems();
    this.navigationService.setNavigation({
      default: navigationItems,
      compact: navigationItems,
      horizontal: navigationItems,
      mobile: navigationItems
    });
    
    // Configure theme
    this.configService.updateConfig({
      theme: 'default',
      scheme: 'auto',
      layout: 'classic'
    });
  }

  private getNavigationItems(): AegisxNavigationItem[] {
    return [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:home',
        link: '/dashboard'
      },
      {
        id: 'features',
        title: 'Features',
        type: 'group',
        children: [
          {
            id: 'components',
            title: 'Components',
            type: 'collapsable',
            icon: 'heroicons_outline:cube',
            children: [
              {
                id: 'components.buttons',
                title: 'Buttons',
                type: 'basic',
                link: '/components/buttons'
              },
              {
                id: 'components.cards',
                title: 'Cards',
                type: 'basic',
                link: '/components/cards'
              },
              {
                id: 'components.forms',
                title: 'Forms',
                type: 'basic',
                link: '/components/forms'
              },
              {
                id: 'components.tables',
                title: 'Tables',
                type: 'basic',
                link: '/components/tables'
              }
            ]
          },
          {
            id: 'layouts',
            title: 'Layouts',
            type: 'collapsable',
            icon: 'heroicons_outline:template',
            children: [
              {
                id: 'layouts.classic',
                title: 'Classic',
                type: 'basic',
                link: '/layouts/classic'
              },
              {
                id: 'layouts.compact',
                title: 'Compact',
                type: 'basic',
                link: '/layouts/compact'
              },
              {
                id: 'layouts.enterprise',
                title: 'Enterprise',
                type: 'basic',
                link: '/layouts/enterprise'
              }
            ]
          }
        ]
      },
      {
        id: 'auth',
        title: 'Authentication',
        type: 'group',
        children: [
          {
            id: 'auth.login',
            title: 'Login',
            type: 'basic',
            icon: 'heroicons_outline:lock-closed',
            link: '/auth/login'
          },
          {
            id: 'auth.register',
            title: 'Register',
            type: 'basic',
            icon: 'heroicons_outline:user-plus',
            link: '/auth/register'
          },
          {
            id: 'auth.profile',
            title: 'Profile',
            type: 'basic',
            icon: 'heroicons_outline:user-circle',
            link: '/auth/profile'
          }
        ]
      },
      {
        id: 'divider-1',
        title: '',
        type: 'divider'
      },
      {
        id: 'help',
        title: 'Help & Support',
        type: 'group',
        children: [
          {
            id: 'help.documentation',
            title: 'Documentation',
            type: 'basic',
            icon: 'heroicons_outline:book-open',
            link: '/docs',
            externalLink: true,
            target: '_blank'
          },
          {
            id: 'help.api',
            title: 'API Reference',
            type: 'basic',
            icon: 'heroicons_outline:code',
            link: 'http://localhost:3333/api-docs',
            externalLink: true,
            target: '_blank'
          }
        ]
      }
    ];
  }
}