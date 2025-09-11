import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SimpleVerticalNavigationComponent } from '@aegisx/ui';

@Component({
  standalone: true,
  selector: 'ax-test-navigation',
  imports: [CommonModule, MatIconModule, SimpleVerticalNavigationComponent],
  template: `
    <div class="flex h-screen">
      <!-- Test Navigation -->
      <ax-simple-vertical-navigation
        [navigation]="testNavigation"
        class="w-64 bg-gray-800"
      />
      
      <!-- Content -->
      <div class="flex-1 p-8 bg-gray-100">
        <h2 class="text-2xl font-bold mb-4">Navigation Icon Test</h2>
        
        <div class="bg-white p-6 rounded-lg shadow mb-6">
          <h3 class="text-lg font-semibold mb-4">Direct Material Icons Test</h3>
          <div class="flex gap-4">
            <div class="text-center">
              <mat-icon class="text-4xl">home</mat-icon>
              <p class="text-sm">home</p>
            </div>
            <div class="text-center">
              <mat-icon class="text-4xl">pie_chart</mat-icon>
              <p class="text-sm">pie_chart</p>
            </div>
            <div class="text-center">
              <mat-icon class="text-4xl">work</mat-icon>
              <p class="text-sm">work</p>
            </div>
            <div class="text-center">
              <mat-icon class="text-4xl">people</mat-icon>
              <p class="text-sm">people</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">Navigation Data</h3>
          <pre class="text-xs bg-gray-100 p-4 rounded overflow-auto">{{ testNavigation | json }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class TestNavigationComponent {
  testNavigation: any[] = [
    {
      id: 'home',
      title: 'Home',
      type: 'basic',
      icon: 'heroicons_outline:home',
      link: '/dashboard'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      type: 'basic', 
      icon: 'heroicons_outline:chart-pie',
      link: '/analytics'
    },
    {
      id: 'users',
      title: 'Users',
      type: 'collapsable',
      icon: 'heroicons_outline:users',
      children: [
        {
          id: 'users.list',
          title: 'User List',
          type: 'basic',
          link: '/users'
        },
        {
          id: 'users.roles',
          title: 'Roles',
          type: 'basic',
          link: '/users/roles'
        }
      ]
    }
  ];
}