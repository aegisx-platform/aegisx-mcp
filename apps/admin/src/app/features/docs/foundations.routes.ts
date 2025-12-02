import { Route } from '@angular/router';

export const FOUNDATIONS_ROUTES: Route[] = [
  {
    path: 'overview',
    loadComponent: () =>
      import(
        '../../pages/docs/foundations/overview/foundations-overview.component'
      ).then((m) => m.FoundationsOverviewComponent),
    data: {
      title: 'Foundations Overview',
      description: 'Design foundations and principles',
    },
  },
  {
    path: 'design-tokens',
    loadComponent: () =>
      import(
        '../../pages/docs/foundations/design-tokens/design-tokens.component'
      ).then((m) => m.DesignTokensComponent),
    data: {
      title: 'Design Tokens',
      description: 'Color, typography, spacing tokens',
    },
  },
  {
    path: 'colors',
    loadComponent: () =>
      import('../../pages/docs/foundations/colors/colors.component').then(
        (m) => m.ColorsComponent,
      ),
    data: {
      title: 'Colors',
      description: 'Color palette and color system',
    },
  },
  {
    path: 'typography',
    loadComponent: () =>
      import(
        '../../pages/docs/foundations/typography/typography-showcase.component'
      ).then((m) => m.TypographyShowcaseComponent),
    data: {
      title: 'Typography',
      description: 'Typography styles and guidelines',
    },
  },
  {
    path: 'spacing',
    loadComponent: () =>
      import('../../pages/docs/foundations/spacing/spacing.component').then(
        (m) => m.SpacingComponent,
      ),
    data: {
      title: 'Spacing',
      description: 'Spacing and layout guidelines',
    },
  },
  {
    path: 'shadows',
    loadComponent: () =>
      import('../../pages/docs/foundations/shadows/shadows.component').then(
        (m) => m.ShadowsComponent,
      ),
    data: {
      title: 'Shadows',
      description: 'Shadow and depth effects',
    },
  },
  {
    path: 'motion',
    loadComponent: () =>
      import('../../pages/docs/foundations/motion/motion.component').then(
        (m) => m.MotionComponent,
      ),
    data: {
      title: 'Motion',
      description: 'Animation and motion guidelines',
    },
  },
  {
    path: 'accessibility',
    loadComponent: () =>
      import(
        '../../pages/docs/foundations/accessibility/accessibility.component'
      ).then((m) => m.AccessibilityComponent),
    data: {
      title: 'Accessibility',
      description: 'Accessibility standards and guidelines',
    },
  },
  {
    path: 'theming',
    loadComponent: () =>
      import('../../pages/docs/foundations/theming/theming.component').then(
        (m) => m.ThemingComponent,
      ),
    data: {
      title: 'Theming',
      description: 'Theme configuration and customization guide',
    },
  },
];
