# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-02

### Added

- Initial release of @aegisx/ui
- Layout components: Classic, Compact, Enterprise, Empty
- Core services: Config, Navigation, Loading, MediaWatcher
- UI components: Card, Alert, Drawer, Navigation, Breadcrumb, Loading Bar, User Menu
- Provider function `provideAegisxUI()` for Angular 17+ standalone apps
- NgModule support for legacy applications
- Tree-shakable feature modules
- Complete TypeScript types
- TailwindCSS integration
- Angular Material theming support
- Design token system with CSS variables

### Components

- `ax-card` - Enhanced Material Design cards
- `ax-alert` - Notification alerts with variants
- `ax-drawer` - Configurable side panels
- `ax-navigation` - Flexible navigation trees
- `ax-breadcrumb` - Dynamic breadcrumb navigation
- `ax-loading-bar` - Global progress indicators
- `ax-user-menu` - User profile dropdowns
- `ax-knob` - Circular input control
- `ax-popup-edit` - Inline editing
- `ax-splitter` - Resizable panels
- `ax-timeline` - Timeline display
- `ax-stats-card` - Statistics display cards
- `ax-inner-loading` - Component-level loading

### Layouts

- `ax-classic-layout` - Traditional admin layout with sidebar
- `ax-compact-layout` - Collapsible icon-based navigation
- `ax-enterprise-layout` - Horizontal navigation bar
- `ax-empty-layout` - Minimal layout without navigation

### Services

- `AegisxConfigService` - Theme and layout configuration
- `AegisxNavigationService` - Navigation state management
- `AegisxLoadingService` - Loading state management
- `AegisxMediaWatcherService` - Responsive breakpoints
- `AxThemeService` - Theme switching
- `LoadingBarService` - Loading bar control

### Requirements

- Angular 17 - 20
- Angular Material 17 - 20
- TailwindCSS 3.x
