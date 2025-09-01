# @aegisx/ui

A comprehensive Angular UI library for the AegisX platform, featuring layouts, components, services, and directives built with Angular Material and TailwindCSS.

## Installation

```bash
npm install @aegisx/ui
# or
yarn add @aegisx/ui
```

## Setup

### 1. Import the Module

```typescript
import { AegisxUIModule } from '@aegisx/ui';

@NgModule({
  imports: [
    // ... other imports
    AegisxUIModule.forRoot({
      theme: 'default',
      scheme: 'auto',
      layout: 'classic'
    })
  ]
})
export class AppModule { }
```

### 2. For Standalone Components

```typescript
import { AegisxConfigService, ClassicLayoutComponent } from '@aegisx/ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ClassicLayoutComponent],
  template: `
    <ax-classic-layout>
      <!-- Your content here -->
    </ax-classic-layout>
  `
})
export class AppComponent { }
```

## Features

### 📐 Layouts

- **Empty Layout** - Minimal layout with no navigation
- **Classic Layout** - Traditional admin layout with sidenav
- **Compact Layout** - Collapsible icon-based navigation
- **Enterprise Layout** - Horizontal navigation for complex applications

### 🛠️ Services

- **ConfigService** - Application configuration and theming
- **NavigationService** - Navigation state management
- **LoadingService** - Global loading state
- **MediaWatcherService** - Responsive breakpoint detection

### 🎨 Components

- **Navigation** - Flexible navigation component
- **LoadingBar** - Global loading indicator
- **UserMenu** - User profile dropdown
- **Card** - Material Design card component
- **Alert** - Notification alerts
- **Drawer** - Side panel component

### 🎯 Directives

- **axScrollbar** - Custom scrollbar styling
- **axScrollReset** - Auto-scroll reset on navigation

## Usage Examples

### Using Layouts

```typescript
// Classic Layout
<ax-classic-layout>
  <div toolbar-title>Dashboard</div>
  <div toolbar-actions>
    <button mat-icon-button>
      <mat-icon>settings</mat-icon>
    </button>
  </div>
  
  <!-- Page content -->
  <div class="p-6">
    <h1>Welcome to AegisX</h1>
  </div>
</ax-classic-layout>
```

### Using Services

```typescript
import { AegisxConfigService, AegisxNavigationService } from '@aegisx/ui';

export class AppComponent {
  constructor(
    private config: AegisxConfigService,
    private navigation: AegisxNavigationService
  ) {
    // Set configuration
    this.config.update({ scheme: 'dark' });
    
    // Set navigation
    this.navigation.setNavigation('default', [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'dashboard',
        link: '/dashboard'
      }
    ]);
  }
}
```

### Using Components

```typescript
// Card Component
<ax-card 
  title="Statistics" 
  subtitle="Monthly overview"
  icon="bar_chart"
  appearance="elevated"
>
  <p>Your content here</p>
  <div card-actions>
    <button mat-button>View Details</button>
  </div>
</ax-card>

// Alert Component
<ax-alert 
  type="success" 
  title="Success!"
  [dismissible]="true"
>
  Your operation completed successfully.
</ax-alert>

// Drawer Component
<ax-drawer #drawer title="Settings" size="md">
  <h3>Application Settings</h3>
  <!-- Settings content -->
  <div drawer-footer>
    <button mat-button (click)="drawer.close()">Cancel</button>
    <button mat-raised-button color="primary">Save</button>
  </div>
</ax-drawer>
```

### Using Directives

```typescript
// Custom Scrollbar
<div axScrollbar="thin" class="overflow-auto h-64">
  <!-- Scrollable content -->
</div>

// Scroll Reset
<main axScrollReset>
  <router-outlet></router-outlet>
</main>
```

## Theming

The library uses TailwindCSS for styling and supports dark mode out of the box:

```typescript
// Toggle dark mode
this.config.update({ scheme: 'dark' });

// Change theme
this.config.update({ theme: 'purple' });

// Change layout
this.config.setLayout('compact');
```

## Development

### Running unit tests

Run `nx test aegisx-ui` to execute the unit tests.

### Building the library

Run `nx build aegisx-ui` to build the library.

## Requirements

- Angular 19+
- Angular Material 19+
- TailwindCSS 3.x
- @angular/cdk 19+

## License

MIT
