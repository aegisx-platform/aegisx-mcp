import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxNavigationComponent, AxNavigationItem, AxNavigationConfig } from '@aegisx/ui';

@Component({
  selector: 'ax-navigation-demo',
  standalone: true,
  imports: [CommonModule, AxNavigationComponent],
  template: `
    <div class="demo-container">
      <!-- Navigation -->
      <ax-navigation
        [items]="navigationItems"
        [config]="navConfig"
        [showHeader]="true"
        [showFooter]="true"
        (stateChange)="onNavigationStateChange($event)"
        (itemClick)="onNavigationItemClick($event)"
      >
        <!-- Header Content -->
        <div navigation-header class="nav-header">
          <h1 class="nav-title">AegisX</h1>
          <span class="nav-version">v1.0.0</span>
        </div>
        
        <!-- Footer Content -->
        <div navigation-footer class="nav-footer">
          <div class="user-info">
            <div class="user-avatar">JD</div>
            <div class="user-details">
              <div class="user-name">John Doe</div>
              <div class="user-role">Administrator</div>
            </div>
          </div>
        </div>
      </ax-navigation>
      
      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <header class="content-header">
          <button class="toggle-btn" (click)="toggleNavigation()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <h2>AegisX Navigation Demo</h2>
        </header>
        
        <!-- Content -->
        <div class="content">
          <div class="info-card">
            <h3>Navigation Features</h3>
            <ul>
              <li>Collapsible/Expandable states</li>
              <li>Smooth animations</li>
              <li>Group support with dividers</li>
              <li>Icon support with NavigationIconComponent</li>
              <li>Badge support with multiple types</li>
              <li>Active state tracking</li>
              <li>Disabled state support</li>
              <li>External link support</li>
            </ul>
          </div>
          
          <div class="info-card">
            <h3>Current Configuration</h3>
            <pre>{{ navConfig | json }}</pre>
          </div>
          
          <div class="info-card">
            <h3>Last Clicked Item</h3>
            <pre>{{ lastClickedItem | json }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      display: flex;
      height: 100vh;
      background: #f5f5f9;
    }
    
    .nav-header {
      text-align: center;
    }
    
    .nav-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }
    
    .nav-version {
      font-size: 0.75rem;
      opacity: 0.7;
    }
    
    .nav-footer {
      padding: 0.5rem;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .user-details {
      flex: 1;
      min-width: 0;
    }
    
    .user-name {
      font-weight: 600;
      font-size: 0.875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .user-role {
      font-size: 0.75rem;
      opacity: 0.7;
    }
    
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    
    .content-header {
      background: white;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .toggle-btn {
      background: none;
      border: none;
      padding: 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .toggle-btn:hover {
      background: #f3f4f6;
    }
    
    .content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }
    
    .info-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .info-card h3 {
      margin: 0 0 1rem;
      font-size: 1.25rem;
    }
    
    .info-card ul {
      margin: 0;
      padding-left: 1.5rem;
    }
    
    .info-card li {
      margin-bottom: 0.5rem;
    }
    
    .info-card pre {
      background: #f3f4f6;
      padding: 1rem;
      border-radius: 0.375rem;
      overflow-x: auto;
      font-size: 0.875rem;
      margin: 0;
    }
  `]
})
export class NavigationDemoComponent {
  navigationItems: AxNavigationItem[] = [
    {
      id: 'dashboards',
      title: 'Dashboards',
      type: 'group',
      children: [
        {
          id: 'dashboard.analytics',
          title: 'Analytics Dashboard',
          type: 'item',
          icon: 'chart-pie',
          link: '/demo/analytics',
          badge: {
            content: 'NEW',
            type: 'accent'
          }
        },
        {
          id: 'dashboard.project',
          title: 'Project Dashboard',
          type: 'item',
          icon: 'briefcase',
          link: '/demo/project'
        }
      ]
    },
    {
      id: 'divider-1',
      title: '',
      type: 'divider'
    },
    {
      id: 'apps',
      title: 'Applications',
      type: 'group',
      children: [
        {
          id: 'apps.users',
          title: 'User Management',
          type: 'collapsible',
          icon: 'users',
          children: [
            {
              id: 'apps.users.list',
              title: 'User List',
              type: 'item',
              link: '/apps/users'
            },
            {
              id: 'apps.users.roles',
              title: 'Roles & Permissions',
              type: 'item',
              link: '/apps/users/roles',
              badge: {
                content: '3',
                type: 'warn'
              }
            },
            {
              id: 'apps.users.invite',
              title: 'Invite Users',
              type: 'item',
              link: '/apps/users/invite',
              disabled: true
            }
          ]
        },
        {
          id: 'apps.products',
          title: 'Products',
          type: 'item',
          icon: 'shopping-bag',
          link: '/apps/products',
          badge: {
            content: '156',
            type: 'primary'
          }
        },
        {
          id: 'apps.orders',
          title: 'Orders',
          type: 'item',
          icon: 'shopping-cart',
          link: '/apps/orders',
          badge: {
            content: '12',
            type: 'success'
          }
        }
      ]
    },
    {
      id: 'divider-2',
      title: '',
      type: 'divider'
    },
    {
      id: 'pages',
      title: 'Pages',
      type: 'group',
      children: [
        {
          id: 'pages.settings',
          title: 'Settings',
          type: 'collapsible',
          icon: 'cog-6-tooth',
          children: [
            {
              id: 'pages.settings.account',
              title: 'Account Settings',
              type: 'item',
              link: '/pages/settings/account'
            },
            {
              id: 'pages.settings.security',
              title: 'Security',
              type: 'item',
              link: '/pages/settings/security'
            }
          ]
        },
        {
          id: 'pages.help',
          title: 'Help Center',
          type: 'item',
          icon: 'book-open',
          link: 'https://help.aegisx.com',
          externalLink: true,
          target: '_blank'
        }
      ]
    }
  ];
  
  navConfig: Partial<AxNavigationConfig> = {
    state: 'expanded',
    mode: 'side',
    position: 'left',
    showToggleButton: true,
    autoCollapse: true,
    breakpoint: 'lg'
  };
  
  lastClickedItem: AxNavigationItem | null = null;
  
  toggleNavigation(): void {
    this.navConfig = {
      ...this.navConfig,
      state: this.navConfig.state === 'collapsed' ? 'expanded' : 'collapsed'
    };
  }
  
  onNavigationStateChange(state: 'collapsed' | 'expanded'): void {
    console.log('Navigation state changed:', state);
  }
  
  onNavigationItemClick(item: AxNavigationItem): void {
    console.log('Navigation item clicked:', item);
    this.lastClickedItem = item;
  }
}