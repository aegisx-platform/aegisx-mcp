# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-12-18

### Added

- **Complete Type System Coverage**: Added comprehensive TypeScript type definitions across the entire library
  - 45+ new dedicated `.types.ts` files for components, services, and widgets
  - All types now properly exported through the public API (`@aegisx/ui`)
  - Type exports organized by category: core, components, widgets, layouts, services
- **Comprehensive JSDoc Documentation**: Added detailed JSDoc comments to all exported types
  - Interface and property descriptions for better IDE IntelliSense
  - Usage examples for complex types
  - Cross-references between related types
  - Default value documentation where applicable
- **Type Testing Infrastructure**: Set up `tsd` for compile-time type validation
  - New `pnpm run test:types` command for type testing
  - Comprehensive type tests covering all major exported types
  - Validates generic constraints and type inference
- **New Type Files**:
  - Component types: drawer, alert, inner-loading, loading-bar, avatar, badge, card, divider, kbd, list, stats-card, timeline, kpi-card, sparkline, and more
  - Form types: date-picker, input-otp, knob, popup-edit, scheduler, time-slots
  - Navigation types: breadcrumb, navbar, command-palette, navigation
  - Service types: theme, toast
  - Widget types: chart, kpi, list, progress, table
  - Core types: config, layout, theme, navigation

### Changed

- **Improved Type Safety**: Eliminated all `any` types (26 instances) and replaced with proper TypeScript types
  - Generic object types now use `Record<string, unknown>` or specific interfaces
  - Timer types now use `ReturnType<typeof setInterval>` for type-safe interval handling
  - HTTP params now use proper Angular `HttpParams` types
  - Theme builder now uses string literal union types instead of `any` assertions
- **Enhanced Component Interfaces**: All `@Input` and `@Output` decorators now have explicit type annotations
  - Better autocomplete in Angular templates
  - Type-safe event emitters with proper generic parameters
  - Improved compile-time checking for component usage
- **Better Type Organization**: Migrated inline types to dedicated `.types.ts` files
  - Colocated types with their implementations
  - Clear separation between public API types and internal types
  - Consistent naming convention: `{feature}.types.ts`
- **Datetime Utility Improvements**: Enhanced type safety in datetime utilities
  - Replaced `Record<string, any>` with proper generic constraints
  - Type-safe date conversion functions
  - Better IntelliSense for utility functions

### Fixed

- **Type Assertions Removed**: Eliminated unsafe type assertions in favor of proper types
  - Theme builder component now uses typed theme keys
  - Data provider uses proper HttpParams types
  - No more `as any` workarounds
- **Type Export Completeness**: All public types are now accessible from main package export
  - Fixed missing type exports in barrel files
  - Ensured all `.types.ts` files are re-exported through module index files
  - Complete type coverage for widget system configurations and data flows

### Documentation

- **Type Documentation Standards**: Created comprehensive JSDoc documentation standards guide
  - Established consistent formatting and terminology
  - Guidelines for `@example`, `@deprecated`, and `@see` tags
  - Real examples from codebase
- **Type Migration Guide**: Added migration guide for type system improvements (see `docs/type-migration-guide.md`)
  - Import path examples
  - Generic type usage patterns
  - Before/after examples showing improved types
  - Benefits and upgrade guidance

### Notes

- **Backward Compatibility**: All improvements are 100% backward compatible
  - No breaking changes to existing APIs
  - All existing import paths continue to work
  - Type improvements enhance IntelliSense without requiring code changes
- **Zero Runtime Impact**: All type improvements are compile-time only
  - No bundle size increase
  - No performance impact
  - Pure TypeScript enhancements
- **Build Quality**: Library builds with zero TypeScript errors under strict mode
  - Enabled: `strict`, `noImplicitAny`, `strictNullChecks`
  - No implicit `any` types
  - Complete type safety validation

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
