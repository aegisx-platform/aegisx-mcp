# Ax UI Library

This is our custom UI library that extends and replaces Fuse components with our own Ax-prefixed components.

## Folder Structure

```
ax/
├── animations/     # Animation utilities (axAnimations)
├── components/     # UI components (AxButton, AxCard, etc.)
├── directives/     # Angular directives (AxScrollbar, etc.)
├── layouts/        # Layout components (AxCompactLayout, etc.)
├── services/       # Angular services (AxMediaWatcher, etc.)
├── styles/         # SCSS styles for Ax components
├── types/          # TypeScript type definitions
└── utils/          # Utility functions and helpers
```

## Naming Convention

- All components use `Ax` prefix: `AxNavigationComponent`
- All directives use `ax` prefix: `axScrollbar`
- All services use `Ax` prefix: `AxMediaWatcherService`
- CSS classes use `ax-` prefix: `.ax-navigation`

## CSS Strategy

We reuse Fuse's well-designed CSS where appropriate:
- Components can use both `.ax-*` and `.fuse-*` classes
- Fuse styles are imported in the main styles
- New Ax-specific styles go in `styles/` folder