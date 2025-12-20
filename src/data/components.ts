/**
 * AUTO-GENERATED FILE
 * Generated at: 2025-12-20T02:53:09.858Z
 * Generator: components-generator@1.0.0
 * Source files:
 *   - libs/aegisx-ui/src/lib/components/
 * DO NOT EDIT MANUALLY - Changes will be overwritten on next sync
 */

/* eslint-disable no-useless-escape */
 
 

/**
 * AegisX UI Components Registry
 * Complete catalog of all 78+ UI components
 */

export interface ComponentInput {
  name: string;
  type: string;
  default?: string;
  description: string;
  required?: boolean;
}

export interface ComponentOutput {
  name: string;
  type: string;
  description: string;
}

export interface ComponentInfo {
  name: string;
  selector: string;
  category: string;
  description: string;
  inputs: ComponentInput[];
  outputs: ComponentOutput[];
  usage: string;
  bestPractices?: string[];
  relatedComponents?: string[];
}

export const componentCategories = [
  'auth',
  'data-display',
  'advanced',
  'overlays',
  'feedback',
  'forms',
  'layout',
  'navigation',
] as const;

export type ComponentCategory = (typeof componentCategories)[number];

export const components: ComponentInfo[] = [
  // ============ AUTH ============
  {
    name: 'Auth Layout',
    selector: 'ax-auth-layout',
    category: 'auth',
    description: 'Auth Layout component',
    inputs: [
      {
        name: 'brandName',
        type: 'string',
        default: "'AegisX'",
        description: '',
      },
      {
        name: 'brandIcon',
        type: 'string',
        default: "'shield'",
        description: '',
      },
      {
        name: 'tagline',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'features',
        type: 'string[]',
        default: '[]',
        description: '',
      },
      {
        name: 'brandingBackground',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'showFooterLinks',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'footerLinks',
        type: 'Array<{ label: string; url: string }>',
        default:
          "[\n    { label: 'Terms', url: '#' },\n    { label: 'Privacy', url: '#' },\n    { label: 'Help', url: '#' },\n  ]",
        description: '',
      },
    ],
    outputs: [],
    usage: `\`\`\`html
<ax-auth-layout
  brandName="AegisX"
  brandIcon="shield"
  tagline="Enterprise admin platform"
  [features]="['Feature 1', 'Feature 2']"
>
  <ax-login-form />
</ax-auth-layout>
\`\`\``,
  },
  {
    name: 'Confirm Email',
    selector: 'ax-confirm-email',
    category: 'auth',
    description: 'Confirm Email component',
    inputs: [
      {
        name: 'status',
        type: 'ConfirmEmailStatus',
        default: "'pending'",
        description: '',
      },
      {
        name: 'email',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'resendLoading',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'continue',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'resendEmail',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'tryAgain',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'backToLogin',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<ax-confirm-email
  [status]="'success'"
  (continue)="navigateToDashboard()"
  (resendEmail)="onResendVerification()"
/>
\`\`\``,
  },
  {
    name: 'Forgot Password Form',
    selector: 'ax-forgot-password-form',
    category: 'auth',
    description: 'Forgot Password Form component',
    inputs: [
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'success',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'formSubmit',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'backToLogin',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'resendEmail',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<ax-forgot-password-form
  [loading]="isLoading"
  [success]="emailSent"
  (formSubmit)="onRequestReset(\$event)"
  (backToLogin)="navigateToLogin()"
/>
\`\`\``,
  },
  {
    name: 'Login Form',
    selector: 'ax-login-form',
    category: 'auth',
    description: 'Login Form component',
    inputs: [
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'formSubmit',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'forgotPassword',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'socialLogin',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'signupClick',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<ax-login-form
  [config]="{ title: 'Welcome back' }"
  [loading]="isLoading"
  (formSubmit)="onLogin(\$event)"
  (forgotPassword)="onForgotPassword()"
  (socialLogin)="onSocialLogin(\$event)"
  (signupClick)="onSignup()"
/>
\`\`\``,
  },
  {
    name: 'Register Form',
    selector: 'ax-register-form',
    category: 'auth',
    description: 'Register Form component',
    inputs: [
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'formSubmit',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'socialLogin',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'loginClick',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'termsClick',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'privacyClick',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<ax-register-form
  [config]="{ title: 'Create an account' }"
  [loading]="isLoading"
  (formSubmit)="onRegister(\$event)"
  (socialLogin)="onSocialSignup(\$event)"
  (loginClick)="onLogin()"
  (termsClick)="openTerms()"
/>
\`\`\``,
  },
  {
    name: 'Reset Password Form',
    selector: 'ax-reset-password-form',
    category: 'auth',
    description: 'Reset Password Form component',
    inputs: [
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'success',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'formSubmit',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'backToLogin',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<ax-reset-password-form
  [loading]="isLoading"
  [success]="passwordReset"
  (formSubmit)="onResetPassword(\$event)"
  (backToLogin)="navigateToLogin()"
/>
\`\`\``,
  },
  {
    name: 'Social Login',
    selector: 'ax-social-login',
    category: 'auth',
    description: 'Social Login component',
    inputs: [
      {
        name: 'loading',
        type: 'string | null',
        default: 'null',
        description: '',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'providerClick',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<ax-social-login
  [providers]="['google', 'github', 'microsoft']"
  [loading]="'google'"
  (providerClick)="onSocialLogin(\$event)"
/>
\`\`\``,
  },
  // ============ DATA DISPLAY ============
  {
    name: 'Layout Switcher',
    selector: 'ax-layout-switcher',
    category: 'data-display',
    description: 'Layout Switcher component',
    inputs: [],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Loading Bar',
    selector: 'ax-loading-bar',
    category: 'data-display',
    description: 'Loading Bar component',
    inputs: [
      {
        name: 'visible',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'mode',
        type: 'LoadingBarMode',
        default: "'indeterminate'",
        description: '',
      },
      {
        name: 'progress',
        type: 'number',
        default: '0',
        description: '',
      },
      {
        name: 'color',
        type: 'LoadingBarColor',
        default: "'primary'",
        description: '',
      },
      {
        name: 'position',
        type: 'LoadingBarPosition',
        default: "'top'",
        description: '',
      },
      {
        name: 'height',
        type: 'number',
        default: '4',
        description: '',
      },
      {
        name: 'glow',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'speed',
        type: 'number',
        default: '1',
        description: '',
      },
    ],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Navigation',
    selector: 'ax-navigation',
    category: 'data-display',
    description: 'Navigation component',
    inputs: [
      {
        name: 'showHeader',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'showFooter',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'stateChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'itemClick',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'groupToggle',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: ``,
  },
  {
    name: 'Card',
    selector: 'ax-card',
    category: 'data-display',
    description: 'Card component',
    inputs: [
      {
        name: 'title',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'subtitle',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'icon',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'appearance',
        type: "'default' | 'flat' | 'outlined' | 'elevated'",
        default: "'default'",
        description: '',
      },
      {
        name: 'actionsAlign',
        type: "'start' | 'end'",
        default: "'end'",
        description: '',
      },
      {
        name: 'hasFooter',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Code Tabs',
    selector: 'ax-code-tabs',
    category: 'data-display',
    description: 'Code Tabs component',
    inputs: [
      {
        name: 'tabs',
        type: 'CodeTab[]',
        default: '[]',
        description: '',
      },
      {
        name: 'showLineNumbers',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Avatar',
    selector: 'ax-avatar',
    category: 'data-display',
    description: 'Avatar component',
    inputs: [
      {
        name: 'src',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'alt',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'name',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'size',
        type: 'AvatarSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'shape',
        type: 'AvatarShape',
        default: "'circle'",
        description: '',
      },
    ],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Badge',
    selector: 'ax-badge',
    category: 'data-display',
    description: 'Badge component',
    inputs: [
      {
        name: 'variant',
        type: 'BadgeVariant',
        default: "'soft'",
        description: '',
      },
      {
        name: 'type',
        type: 'BadgeType',
        default: "'neutral'",
        description: '',
      },
      {
        name: 'size',
        type: 'BadgeSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'rounded',
        type: 'BadgeRounded',
        default: "'sm'",
        description: '',
      },
      {
        name: 'icon',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'dot',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'square',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'removable',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'counter',
        type: 'number',
        description: '',
        required: true,
      },
    ],
    outputs: [
      {
        name: 'remove',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `<ax-badge type="success">Active</ax-badge>

<ax-badge variant="soft" type="success" icon="trending_up">+9.3%</ax-badge>

<ax-badge variant="soft" type="success" [dot]="true">Online</ax-badge>

<ax-badge variant="soft" type="info" [removable]="true" (remove)="onRemove()">
  TypeScript
</ax-badge>

<ax-badge variant="outlined" type="error" [counter]="5">Notifications</ax-badge>`,
  },
  {
    name: 'Card',
    selector: 'ax-card',
    category: 'data-display',
    description: 'Card component',
    inputs: [
      {
        name: 'variant',
        type: 'CardVariant',
        default: "'default'",
        description: '',
      },
      {
        name: 'size',
        type: 'CardSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'color',
        type: 'CardColor',
        default: "'default'",
        description: '',
      },
      {
        name: 'colorIntensity',
        type: 'CardColorIntensity',
        default: "'filled'",
        description: '',
      },
      {
        name: 'borderWidth',
        type: 'CardBorderWidth | string',
        default: "'1'",
        description: '',
      },
      {
        name: 'hoverable',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'clickable',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'flat',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'title',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'subtitle',
        type: 'string',
        default: "''",
        description: '',
      },
    ],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Circular Progress',
    selector: 'ax-circular-progress',
    category: 'data-display',
    description: 'Circular Progress component',
    inputs: [
      {
        name: 'value',
        type: 'number',
        default: '0',
        description: '',
      },
      {
        name: 'variant',
        type: 'CircularProgressVariant',
        default: "'ring'",
        description: '',
      },
      {
        name: 'size',
        type: 'CircularProgressSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'color',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'showLabel',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'label',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'trackColor',
        type: 'string',
        default: "'var(--ax-border-default)'",
        description: '',
      },
      {
        name: 'strokeWidth',
        type: 'number',
        description: '',
        required: true,
      },
      {
        name: 'autoColor',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'successThreshold',
        type: 'number',
        default: '80',
        description: '',
      },
      {
        name: 'warningThreshold',
        type: 'number',
        default: '50',
        description: '',
      },
    ],
    outputs: [],
    usage: `\`\`\`html
<ax-circular-progress
  [value]="75"
  variant="ring"
  size="md"
  color="info">
</ax-circular-progress>
\`\`\``,
  },
  {
    name: 'Description List',
    selector: 'ax-description-list',
    category: 'data-display',
    description: 'Description List component',
    inputs: [
      {
        name: 'layout',
        type: 'DescriptionListLayout',
        default: "'horizontal'",
        description: '',
      },
      {
        name: 'columns',
        type: 'DescriptionListColumns',
        default: '2',
        description: '',
      },
      {
        name: 'size',
        type: 'DescriptionListSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'divider',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'gap',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: '',
      },
    ],
    outputs: [],
    usage: `\`\`\`html
<!-- Basic horizontal layout -->
<ax-description-list>
  <ax-field-display label="Name" [value]="user.name"></ax-field-display>
  <ax-field-display label="Email" [value]="user.email"></ax-field-display>
</ax-description-list>

<!-- Grid layout with 2 columns -->
<ax-description-list layout="grid" [columns]="2">
  <ax-field-display label="First Name" [value]="user.firstName"></ax-field-display>
  <ax-field-display label="Last Name" [value]="user.lastName"></ax-field-display>
  <ax-field-display label="Email" [value]="user.email"></ax-field-display>
  <ax-field-display label="Phone" [value]="user.phone"></ax-field-display>
</ax-description-list>

<!-- With dividers -->
<ax-description-list [divider]="true">
  <ax-field-display label="Order ID" [value]="order.id"></ax-field-display>
  <ax-field-display label="Status" [value]="order.status"></ax-field-display>
</ax-description-list>
\`\`\``,
  },
  {
    name: 'Divider',
    selector: 'ax-divider',
    category: 'data-display',
    description: 'Divider component',
    inputs: [
      {
        name: 'layout',
        type: 'DividerLayout',
        default: "'horizontal'",
        description: '',
      },
      {
        name: 'type',
        type: 'DividerType',
        default: "'solid'",
        description: '',
      },
      {
        name: 'align',
        type: 'DividerAlign',
        default: "'center'",
        description: '',
      },
    ],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Field Display',
    selector: 'ax-field-display',
    category: 'data-display',
    description: 'Field Display component',
    inputs: [
      {
        name: 'label',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'value',
        type: 'unknown',
        default: 'null',
        description: '',
      },
      {
        name: 'type',
        type: 'FieldType',
        default: "'text'",
        description: '',
      },
      {
        name: 'size',
        type: 'FieldDisplaySize',
        default: "'md'",
        description: '',
      },
      {
        name: 'orientation',
        type: 'FieldDisplayOrientation',
        default: "'horizontal'",
        description: '',
      },
      {
        name: 'labelWidth',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'emptyText',
        type: 'string',
        default: "'—'",
        description: '',
      },
      {
        name: 'emptyDisplay',
        type: 'EmptyStateDisplay',
        default: "'dash'",
        description: '',
      },
      {
        name: 'emptyClass',
        type: 'string',
        default: "'ax-field-empty'",
        description: '',
      },
      {
        name: 'formatOptions',
        type: 'FieldFormatOptions',
        description: '',
        required: true,
      },
      {
        name: 'clickable',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'labelClass',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'valueClass',
        type: 'string',
        default: "''",
        description: '',
      },
    ],
    outputs: [],
    usage: `\`\`\`html
<!-- Basic usage -->
<ax-field-display label="Name" [value]="user.name"></ax-field-display>

<!-- With type formatting -->
<ax-field-display
  label="Birth Date"
  [value]="user.birthDate"
  type="date">
</ax-field-display>

<!-- With format options -->
<ax-field-display
  label="Salary"
  [value]="employee.salary"
  type="currency"
  [formatOptions]="{ currency: 'THB', decimals: 2 }">
</ax-field-display>

<!-- Vertical orientation -->
<ax-field-display
  label="Description"
  [value]="product.description"
  orientation="vertical">
</ax-field-display>
\`\`\``,
  },
  {
    name: 'Kbd',
    selector: 'ax-kbd',
    category: 'data-display',
    description: 'Kbd component',
    inputs: [
      {
        name: 'variant',
        type: 'KbdVariant',
        default: "'default'",
        description: '',
      },
      {
        name: 'size',
        type: 'KbdSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'keys',
        type: 'string[]',
        default: '[]',
        description: '',
      },
      {
        name: 'shortcut',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'platformAware',
        type: 'boolean',
        default: 'true',
        description: '',
      },
    ],
    outputs: [],
    usage: `<ax-kbd>K</ax-kbd>

<ax-kbd [keys]="['Ctrl', 'S']"></ax-kbd>

<ax-kbd shortcut="Ctrl+K"></ax-kbd>

<ax-kbd shortcut="Ctrl+Shift+P" [platformAware]="true"></ax-kbd>

<ax-kbd variant="outline" shortcut="Esc"></ax-kbd>
<ax-kbd variant="ghost" shortcut="Enter"></ax-kbd>`,
  },
  {
    name: 'Kpi Card',
    selector: 'ax-kpi-card',
    category: 'data-display',
    description: 'Kpi Card component',
    inputs: [
      {
        name: 'variant',
        type: 'KpiCardVariant',
        default: "'simple'",
        description: '',
      },
      {
        name: 'size',
        type: 'KpiCardSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'label',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'value',
        type: 'string | number',
        default: "''",
        description: '',
      },
      {
        name: 'subtitle',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'change',
        type: 'number',
        description: '',
        required: true,
      },
      {
        name: 'changeType',
        type: 'KpiCardTrend',
        description: '',
        required: true,
      },
      {
        name: 'changeLabel',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'badge',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'badgeType',
        type: 'KpiCardBadgeType',
        default: "'neutral'",
        description: '',
      },
      {
        name: 'accentColor',
        type: 'KpiCardAccentColor',
        description: '',
        required: true,
      },
      {
        name: 'accentPosition',
        type: 'KpiCardAccentPosition',
        default: "'left'",
        description: '',
      },
      {
        name: 'compact',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'hoverable',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'clickable',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'flat',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'barsFilled',
        type: 'number',
        default: '0',
        description: '',
      },
      {
        name: 'barsTotal',
        type: 'number',
        default: '3',
        description: '',
      },
      {
        name: 'barColor',
        type: 'KpiCardAccentColor',
        default: "'info'",
        description: '',
      },
      {
        name: 'supplementary',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'progress',
        type: 'number',
        default: '0',
        description: '',
      },
      {
        name: 'progressColor',
        type: 'KpiCardAccentColor',
        default: "'info'",
        description: '',
      },
      {
        name: 'progressLabel',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'segments',
        type: '{ value: number; color: string; label?: string }[]',
        default: '[]',
        description: '',
      },
      {
        name: 'actionText',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'actionHref',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'showDivider',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [],
    usage: `<ax-kpi-card
  label="Unique visitors"
  [value]="10450"
  [change]="-12.5"
  changeType="negative">
</ax-kpi-card>

<ax-kpi-card
  variant="badge"
  label="Daily active users"
  [value]="3450"
  badge="+12.1%"
  badgeType="success">
</ax-kpi-card>

<ax-kpi-card
  variant="accent"
  label="Monthly active users"
  [value]="996"
  accentColor="info"
  accentPosition="left">
</ax-kpi-card>`,
  },
  {
    name: 'List',
    selector: 'ax-list',
    category: 'data-display',
    description: 'List component',
    inputs: [
      {
        name: 'items',
        type: 'ListItem[]',
        default: '[]',
        description: '',
      },
      {
        name: 'size',
        type: 'ListSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'bordered',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'hoverable',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'divided',
        type: 'boolean',
        default: 'true',
        description: '',
      },
    ],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Segmented Progress',
    selector: 'ax-segmented-progress',
    category: 'data-display',
    description: 'Segmented Progress component',
    inputs: [
      {
        name: 'segments',
        type: 'ProgressSegment[]',
        default: '[]',
        description: '',
      },
      {
        name: 'size',
        type: 'SegmentedProgressSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'legendPosition',
        type: 'LegendPosition',
        default: "'bottom'",
        description: '',
      },
      {
        name: 'showPercentage',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'showValue',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'gap',
        type: 'number',
        default: '2',
        description: '',
      },
      {
        name: 'rounded',
        type: "'none' | 'sm' | 'md' | 'lg' | 'full'",
        default: "'sm'",
        description: '',
      },
    ],
    outputs: [],
    usage: `\`\`\`html
<ax-segmented-progress
  [segments]="ticketSegments"
  legendPosition="bottom"
  size="md">
</ax-segmented-progress>
\`\`\``,
  },
  {
    name: 'Sparkline',
    selector: 'ax-sparkline',
    category: 'data-display',
    description: 'Sparkline component',
    inputs: [
      {
        name: 'data',
        type: 'number[]',
        default: '[]',
        description: '',
      },
      {
        name: 'variant',
        type: 'SparklineVariant',
        default: "'line'",
        description: '',
      },
      {
        name: 'size',
        type: 'SparklineSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'color',
        type: 'string',
        default: "'var(--ax-info-default)'",
        description: '',
      },
      {
        name: 'strokeWidth',
        type: 'number',
        default: '2',
        description: '',
      },
      {
        name: 'showDots',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'dotRadius',
        type: 'number',
        default: '3',
        description: '',
      },
      {
        name: 'fillOpacity',
        type: 'number',
        default: '0.2',
        description: '',
      },
      {
        name: 'smooth',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'customWidth',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'showValue',
        type: 'boolean',
        default: 'true',
        description: '',
      },
    ],
    outputs: [],
    usage: `\`\`\`html
<ax-sparkline
  [data]="[10, 20, 15, 25, 30]"
  variant="area"
  color="var(--ax-info-default)">
</ax-sparkline>
\`\`\``,
  },
  {
    name: 'Stats Card',
    selector: 'ax-stats-card',
    category: 'data-display',
    description: 'Stats Card component',
    inputs: [
      {
        name: 'title',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'value',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'change',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'trend',
        type: 'StatsCardTrend',
        default: "'neutral'",
        description: '',
      },
      {
        name: 'icon',
        type: 'string',
        default: "''",
        description: '',
      },
    ],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Timeline',
    selector: 'ax-timeline',
    category: 'data-display',
    description: 'Timeline component',
    inputs: [
      {
        name: 'items',
        type: 'TimelineItem[]',
        default: '[]',
        description: '',
      },
      {
        name: 'layout',
        type: 'TimelineLayout',
        default: "'vertical'",
        description: '',
      },
      {
        name: 'align',
        type: 'TimelineAlign',
        default: "'left'",
        description: '',
      },
      {
        name: 'markerSize',
        type: 'TimelineMarkerSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'connectorStyle',
        type: 'TimelineConnectorStyle',
        default: "'solid'",
        description: '',
      },
      {
        name: 'dense',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Qr Code',
    selector: 'ax-qrcode',
    category: 'data-display',
    description: 'Qr Code component',
    inputs: [
      {
        name: 'data',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'vCard',
        type: 'VCardData | null',
        default: 'null',
        description: '',
      },
      {
        name: 'wifi',
        type: 'WiFiData | null',
        default: 'null',
        description: '',
      },
      {
        name: 'email',
        type: 'EmailData | null',
        default: 'null',
        description: '',
      },
      {
        name: 'sms',
        type: 'SMSData | null',
        default: 'null',
        description: '',
      },
      {
        name: 'phone',
        type: 'string | null',
        default: 'null',
        description: '',
      },
      {
        name: 'url',
        type: 'string | null',
        default: 'null',
        description: '',
      },
      {
        name: 'size',
        type: 'number',
        default: '200',
        description: '',
      },
      {
        name: 'sizePreset',
        type: 'QRCodeSizePreset',
        default: "'medium'",
        description: '',
      },
      {
        name: 'errorCorrectionLevel',
        type: 'QRCodeErrorCorrectionLevel',
        default: "'M'",
        description: '',
      },
      {
        name: 'elementType',
        type: 'QRCodeElementType',
        default: "'canvas'",
        description: '',
      },
      {
        name: 'margin',
        type: 'number',
        default: '4',
        description: '',
      },
      {
        name: 'colorDark',
        type: 'string',
        default: "'#000000'",
        description: '',
      },
      {
        name: 'colorLight',
        type: 'string',
        default: "'#ffffff'",
        description: '',
      },
      {
        name: 'imageSrc',
        type: 'string | undefined',
        description: '',
      },
      {
        name: 'imageHeight',
        type: 'number | undefined',
        description: '',
      },
      {
        name: 'imageWidth',
        type: 'number | undefined',
        description: '',
      },
      {
        name: 'showDownload',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'showCopy',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'downloadFileName',
        type: 'string',
        default: "'qrcode'",
        description: '',
      },
    ],
    outputs: [
      {
        name: 'downloaded',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'copied',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<!-- Basic usage -->
<ax-qrcode [data]="'https://aegisx.io'" />

<!-- With download button -->
<ax-qrcode
  [data]="'https://aegisx.io'"
  [showDownload]="true"
  downloadFileName="my-qrcode"
/>

<!-- vCard preset -->
<ax-qrcode
  [vCard]="{ firstName: 'John', lastName: 'Doe', email: 'john@example.com' }"
/>

<!-- WiFi preset -->
<ax-qrcode
  [wifi]="{ ssid: 'MyNetwork', password: 'secret123', security: 'WPA' }"
/>

<!-- Custom styling -->
<ax-qrcode
  [data]="'Hello World'"
  colorDark="#1976d2"
  colorLight="#ffffff"
  sizePreset="large"
/>
\`\`\``,
    relatedComponents: ['://github.com/cordobo/angularx-qrcode'],
  },
  {
    name: 'Signature Pad',
    selector: 'ax-signature-pad',
    category: 'data-display',
    description: 'Signature Pad component',
    inputs: [
      {
        name: 'enableDraw',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'enableUpload',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'enableUndo',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'enableRedo',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'enableClear',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'enableSave',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'width',
        type: 'number',
        default: '400',
        description: '',
      },
      {
        name: 'height',
        type: 'number',
        default: '200',
        description: '',
      },
      {
        name: 'penColor',
        type: 'string',
        default: "'#000000'",
        description: '',
      },
      {
        name: 'penWidth',
        type: 'number',
        default: '2.5',
        description: '',
      },
      {
        name: 'backgroundColor',
        type: 'string',
        default: "'#ffffff'",
        description: '',
      },
      {
        name: 'acceptUpload',
        type: 'string',
        default: "'image/png,image/jpeg'",
        description: '',
      },
      {
        name: 'maxUploadSize',
        type: 'number',
        default: '2 * 1024 * 1024',
        description: '',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'signatureChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'cleared',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'saved',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<!-- Basic usage - both draw and upload -->
<ax-signature-pad
  (signatureChange)="onSignatureChange(\$event)"
/>

<!-- Draw only -->
<ax-signature-pad
  [enableDraw]="true"
  [enableUpload]="false"
/>

<!-- Upload only -->
<ax-signature-pad
  [enableDraw]="false"
  [enableUpload]="true"
/>

<!-- With form control -->
<ax-signature-pad formControlName="signature" />
\`\`\``,
  },
  {
    name: 'Barcode Scanner',
    selector: 'ax-barcode-scanner',
    category: 'data-display',
    description: 'Barcode Scanner component',
    inputs: [],
    outputs: [],
    usage: `\`\`\`html
<ax-barcode-scanner
  [mode]="'auto'"
  [formats]="['qr', 'ean13', 'code128']"
  [continuousScan]="false"
  [beepSound]="true"
  [showHistory]="true"
  (onScan)="handleScan(\$event)"
  (onError)="handleError(\$event)">
</ax-barcode-scanner>
\`\`\``,
  },
  {
    name: 'Batch Selector',
    selector: 'ax-batch-selector',
    category: 'data-display',
    description: 'Batch Selector component',
    inputs: [],
    outputs: [],
    usage: `\`\`\`html
<ax-batch-selector
  [productId]="'PROD-001'"
  [(strategy)]="selectedStrategy"
  [allowMultiple]="true"
  [requestedQuantity]="150"
  (onSelect)="handleBatchSelection(\$event)"
/>
\`\`\``,
  },
  {
    name: 'Expiry Badge',
    selector: 'ax-expiry-badge',
    category: 'data-display',
    description: 'Expiry Badge component',
    inputs: [],
    outputs: [],
    usage: `\`\`\`html
<!-- Basic usage -->
<ax-expiry-badge
  [expiryDate]="product.expiryDate"
  (onClick)="onExpiryClick(\$event)">
</ax-expiry-badge>

<!-- With custom thresholds -->
<ax-expiry-badge
  [expiryDate]="product.expiryDate"
  [warningDays]="14"
  [criticalDays]="3"
  [size]="'lg'"
  [variant]="'solid'">
</ax-expiry-badge>

<!-- Compact mode for tables -->
<ax-expiry-badge
  [expiryDate]="item.expiryDate"
  [compact]="true"
  [size]="'sm'">
</ax-expiry-badge>
\`\`\``,
  },
  {
    name: 'Location Picker',
    selector: 'ax-location-picker',
    category: 'data-display',
    description: 'Location Picker component',
    inputs: [],
    outputs: [],
    usage: `\`\`\`html
<ax-location-picker
  [locations]="warehouseTree"
  [currentLocation]="selectedLocationId"
  [showCapacity]="true"
  [allowedTypes]="[LocationType.Shelf, LocationType.Bin]"
  (onLocationSelect)="handleLocationSelect(\$event)"
/>
\`\`\``,
  },
  {
    name: 'Quantity Input',
    selector: 'ax-quantity-input',
    category: 'data-display',
    description: 'Quantity Input component',
    inputs: [],
    outputs: [],
    usage: `\`\`\`html
<ax-quantity-input
  [(value)]="quantity"
  [baseUnit]="'pieces'"
  [availableUnits]="unitConfigs"
  [min]="0"
  [max]="1000"
  [showStepper]="true"
  [showPresets]="true"
  (valueChange)="onQuantityChange(\$event)"
  (unitChange)="onUnitChange(\$event)">
</ax-quantity-input>
\`\`\``,
  },
  {
    name: 'Stock Alert Panel',
    selector: 'ax-stock-alert-panel',
    category: 'data-display',
    description: 'Stock Alert Panel component',
    inputs: [],
    outputs: [],
    usage: `\`\`\`html
<ax-stock-alert-panel
  [alerts]="myAlerts"
  [groupBy]="'priority'"
  [maxDisplay]="10"
  [enableRealtime]="true"
  [enableSounds]="true"
  (onAlertClick)="handleAlertClick(\$event)"
  (onAlertAction)="handleAction(\$event)"
  (onAlertDismiss)="handleDismiss(\$event)">
</ax-stock-alert-panel>
\`\`\``,
  },
  {
    name: 'Stock Level',
    selector: 'ax-stock-level',
    category: 'data-display',
    description: 'Stock Level component',
    inputs: [],
    outputs: [],
    usage: `<ax-stock-level
  [current]="150"
  [minimum]="50"
  [maximum]="500"
  [unit]="'pieces'"
  [size]="'md'"
  [showLabel]="true"
  [showPercentage]="true"
  (onWarningClick)="handleWarning(\$event)"
/>`,
  },
  {
    name: 'Stock Movement Timeline',
    selector: 'ax-stock-movement-timeline',
    category: 'data-display',
    description: 'Stock Movement Timeline component',
    inputs: [],
    outputs: [],
    usage: `\`\`\`html
<ax-stock-movement-timeline
  [productId]="'PROD-001'"
  [(groupBy)]="grouping"
  [showBalance]="true"
  [enableRealtime]="true"
  (onMovementClick)="handleMovementClick(\$event)"
  (onExport)="handleExport(\$event)"
/>
\`\`\``,
  },
  {
    name: 'Transfer Wizard',
    selector: 'ax-transfer-wizard',
    category: 'data-display',
    description: 'Transfer Wizard component',
    inputs: [],
    outputs: [],
    usage: `\`\`\`html
<ax-transfer-wizard
  [sourceLocation]="sourceLocationId"
  [steps]="customSteps"
  [allowPartialTransfer]="true"
  [requireApproval]="false"
  [allowMultipleProducts]="true"
  (onComplete)="handleTransferComplete(\$event)"
  (onCancel)="handleTransferCancel()"
  (onStepChange)="handleStepChange(\$event)">
</ax-transfer-wizard>
\`\`\``,
  },
  {
    name: 'Variant Selector',
    selector: 'ax-variant-selector',
    category: 'data-display',
    description: 'Variant Selector component',
    inputs: [],
    outputs: [],
    usage: `\`\`\`html
<ax-variant-selector
  [productId]="'PROD-001'"
  [variants]="productVariants"
  [(layout)]="selectedLayout"
  [allowMultiple]="true"
  [showStock]="true"
  [showPrice]="true"
  (onVariantSelect)="handleSelection(\$event)"
/>
\`\`\``,
  },
  {
    name: 'Launcher Card',
    selector: 'ax-launcher-card',
    category: 'data-display',
    description: 'Launcher Card component',
    inputs: [],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Launcher',
    selector: 'ax-launcher',
    category: 'data-display',
    description: 'Launcher component',
    inputs: [],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Loading Button',
    selector: 'ax-loading-button',
    category: 'data-display',
    description: 'Loading Button component',
    inputs: [
      {
        name: 'variant',
        type: 'ButtonVariant',
        default: "'raised'",
        description: '',
      },
      {
        name: 'color',
        type: 'ButtonColor',
        default: "'primary'",
        description: '',
      },
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'loadingText',
        type: 'string',
        default: "'Loading...'",
        description: '',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'disableWhenLoading',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'type',
        type: "'button' | 'submit' | 'reset'",
        default: "'button'",
        description: '',
      },
      {
        name: 'icon',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'iconPosition',
        type: "'start' | 'end'",
        default: "'end'",
        description: '',
      },
      {
        name: 'fullWidth',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'buttonClick',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<!-- Basic usage -->
<ax-loading-button
  [loading]="isLoading"
  loadingText="Signing in..."
  (buttonClick)="onSubmit()"
>
  Sign In
</ax-loading-button>

<!-- With icon -->
<ax-loading-button
  [loading]="isLoading"
  loadingText="Sending..."
  icon="send"
  iconPosition="end"
>
  Send Email
</ax-loading-button>

<!-- Stroked variant -->
<ax-loading-button
  variant="stroked"
  [loading]="isLoading"
  loadingText="Resending..."
>
  Resend Email
</ax-loading-button>
\`\`\``,
  },
  {
    name: 'Skeleton Card',
    selector: 'ax-skeleton-card',
    category: 'data-display',
    description: 'Skeleton Card component',
    inputs: [
      {
        name: 'showImage',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'showActions',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'horizontal',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'animation',
        type: 'SkeletonAnimation',
        default: "'pulse'",
        description: '',
      },
    ],
    outputs: [],
    usage: `\`\`\`html
<ax-skeleton-card></ax-skeleton-card>
<ax-skeleton-card [showImage]="true" [showActions]="true"></ax-skeleton-card>
\`\`\``,
  },
  {
    name: 'Skeleton',
    selector: 'ax-skeleton',
    category: 'data-display',
    description: 'Skeleton component',
    inputs: [
      {
        name: 'variant',
        type: 'SkeletonVariant',
        default: "'text'",
        description: '',
      },
      {
        name: 'animation',
        type: 'SkeletonAnimation',
        default: "'pulse'",
        description: '',
      },
      {
        name: 'width',
        type: 'string',
        default: "'100%'",
        description: '',
      },
      {
        name: 'height',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'lines',
        type: 'number',
        default: '1',
        description: '',
      },
      {
        name: 'lastLineWidth',
        type: 'string',
        default: "'60%'",
        description: '',
      },
    ],
    outputs: [],
    usage: `\`\`\`html
<!-- Text skeleton -->
<ax-skeleton variant="text" width="200px"></ax-skeleton>

<!-- Avatar skeleton -->
<ax-skeleton variant="circular" width="48px" height="48px"></ax-skeleton>

<!-- Card skeleton -->
<ax-skeleton variant="rounded" width="100%" height="200px"></ax-skeleton>

<!-- Multiple lines -->
<ax-skeleton variant="text" [lines]="3"></ax-skeleton>
\`\`\``,
  },
  {
    name: 'Color Palette Editor',
    selector: 'ax-color-palette-editor',
    category: 'data-display',
    description: 'Color Palette Editor component',
    inputs: [
      {
        name: 'colorName',
        type: 'SemanticColorName',
        default: "'brand'",
        description: '',
      },
      {
        name: 'palette',
        type: 'ColorPalette',
        default:
          "{\n    50: '#eef2ff',\n    100: '#e0e7ff',\n    200: '#c7d2fe',\n    300: '#a5b4fc',\n    400: '#818cf8',\n    500: '#6366f1',\n    600: '#4f46e5',\n    700: '#4338ca',\n    800: '#3730a3',\n    900: '#312e81',\n  }",
        description: '',
      },
    ],
    outputs: [
      {
        name: 'colorChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'paletteChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'generatePalette',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: ``,
  },
  {
    name: 'Image Color Extractor',
    selector: 'ax-image-color-extractor',
    category: 'data-display',
    description: 'Image Color Extractor component',
    inputs: [],
    outputs: [
      {
        name: 'colorsExtracted',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'paletteApplied',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'dominantColorApplied',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<ax-image-color-extractor
  (colorsExtracted)="onColorsExtracted(\$event)"
  (paletteApplied)="onPaletteApplied(\$event)"
/>
\`\`\``,
  },
  {
    name: 'M3 Color Preview',
    selector: 'ax-m3-color-preview',
    category: 'data-display',
    description: 'M3 Color Preview component',
    inputs: [],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Theme Preview Panel',
    selector: 'ax-theme-preview-panel',
    category: 'data-display',
    description: 'Theme Preview Panel component',
    inputs: [
      {
        name: 'previewMode',
        type: "'light' | 'dark'",
        default: "'light'",
        description: '',
      },
    ],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Theme Builder',
    selector: 'ax-theme-builder',
    category: 'data-display',
    description: 'Theme Builder component',
    inputs: [],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Theme Switcher',
    selector: 'ax-theme-switcher',
    category: 'data-display',
    description: 'Theme Switcher component',
    inputs: [],
    outputs: [],
    usage: ``,
  },
  // ============ ADVANCED ============
  {
    name: 'Calendar Event Dialog',
    selector: 'ax-calendar-event-dialog',
    category: 'advanced',
    description: 'Calendar Event Dialog component',
    inputs: [],
    outputs: [],
    usage: `\`\`\`typescript
const dialogRef = dialog.open(AxCalendarEventDialogComponent, {
  data: {
    mode: 'create',
    start: new Date(),
    end: new Date(),
    allDay: false,
  },
  width: '500px',
});

const dialogRef = dialog.open(AxCalendarEventDialogComponent, {
  data: {
    mode: 'edit',
    event: existingEvent,
  },
  width: '500px',
});

dialogRef.afterClosed().subscribe((result) => {
  if (result?.action === 'save') {
  } else if (result?.action === 'delete') {
  }
});
\`\`\``,
  },
  {
    name: 'Calendar',
    selector: 'ax-calendar',
    category: 'advanced',
    description: 'Calendar component',
    inputs: [
      {
        name: 'initialView',
        type: 'AxCalendarView',
        default: "'dayGridMonth'",
        description: '',
      },
      {
        name: 'initialDate',
        type: 'Date | string',
        description: '',
        required: true,
      },
      {
        name: 'editable',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'selectable',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'weekNumbers',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'firstDay',
        type: 'number',
        default: '0',
        description: '',
      },
      {
        name: 'locale',
        type: 'string',
        default: "'en'",
        description: '',
      },
      {
        name: 'height',
        type: "'auto' | number | string",
        default: "'auto'",
        description: '',
      },
      {
        name: 'headerToolbar',
        type: "CalendarOptions['headerToolbar']",
        default:
          "{\n    left: 'prev,next today',\n    center: 'title',\n    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',\n  }",
        description: '',
      },
      {
        name: 'enabledViews',
        type: 'AxCalendarView[]',
        default:
          "[\n    'dayGridMonth',\n    'timeGridWeek',\n    'timeGridDay',\n    'listWeek',\n  ]",
        description: '',
      },
      {
        name: 'businessHours',
        type: "CalendarOptions['businessHours']",
        description: '',
        required: true,
      },
      {
        name: 'slotDuration',
        type: 'string',
        default: "'00:30:00'",
        description: '',
      },
      {
        name: 'slotMinTime',
        type: 'string',
        default: "'00:00:00'",
        description: '',
      },
      {
        name: 'slotMaxTime',
        type: 'string',
        default: "'24:00:00'",
        description: '',
      },
      {
        name: 'allDaySlot',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'nowIndicator',
        type: 'boolean',
        default: 'true',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'eventClick',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'dateSelect',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'eventChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'datesChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'dateClick',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<ax-calendar
  [events]="events"
  [initialView]="'dayGridMonth'"
  [editable]="true"
  [selectable]="true"
  (eventClick)="onEventClick(\$event)"
  (dateSelect)="onDateSelect(\$event)"
  (eventChange)="onEventChange(\$event)"
  (datesChange)="onDatesChange(\$event)">
</ax-calendar>
\`\`\``,
  },
  // ============ OVERLAYS ============
  {
    name: 'Confirm Dialog',
    selector: 'ax-confirm-dialog',
    category: 'overlays',
    description: 'Confirm Dialog component',
    inputs: [],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Drawer',
    selector: 'ax-drawer',
    category: 'overlays',
    description: 'Drawer component',
    inputs: [
      {
        name: 'position',
        type: 'DrawerPosition',
        default: "'right'",
        description: '',
      },
      {
        name: 'size',
        type: 'DrawerSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'title',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'subtitle',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'icon',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'showHeader',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'showCloseButton',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'hasBackdrop',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'closeOnBackdropClick',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'closeOnEscape',
        type: 'boolean',
        default: 'true',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'openChange',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<!-- Basic usage -->
<ax-drawer [(open)]="isOpen" title="Settings">
  <p>Drawer content here</p>
</ax-drawer>

<!-- With footer template -->
<ax-drawer [(open)]="isOpen" title="Edit Item">
  <ng-template #footer>
    <button mat-flat-button color="primary">Save</button>
  </ng-template>
  <form>...</form>
</ax-drawer>

<!-- Bottom sheet on mobile -->
<ax-drawer [(open)]="isOpen" position="bottom" size="sm">
  <p>Sheet content</p>
</ax-drawer>
\`\`\``,
  },
  // ============ FEEDBACK ============
  {
    name: 'Empty State',
    selector: 'ax-empty-state',
    category: 'feedback',
    description: 'Empty State component',
    inputs: [
      {
        name: 'icon',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'title',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'message',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'compact',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'actions',
        type: 'EmptyStateAction[]',
        default: '[]',
        description: '',
      },
    ],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Error State',
    selector: 'ax-error-state',
    category: 'feedback',
    description: 'Error State component',
    inputs: [
      {
        name: 'icon',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'title',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'message',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'errorDetails',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'compact',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'type',
        type: "'error' | 'warning' | 'info'",
        default: "'error'",
        description: '',
      },
      {
        name: 'showDetails',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'actions',
        type: 'ErrorStateAction[]',
        default: '[]',
        description: '',
      },
      {
        name: 'statusCode',
        type: 'number | null',
        description: '',
        required: true,
      },
    ],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Alert',
    selector: 'ax-alert',
    category: 'feedback',
    description: 'Alert component',
    inputs: [
      {
        name: 'variant',
        type: 'AlertVariant',
        default: "'default'",
        description: '',
      },
      {
        name: 'title',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'closeable',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'duration',
        type: 'number',
        description: '',
        required: true,
      },
    ],
    outputs: [
      {
        name: 'closed',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: ``,
  },
  {
    name: 'Inner Loading',
    selector: 'ax-inner-loading',
    category: 'feedback',
    description: 'Inner Loading component',
    inputs: [
      {
        name: 'showing',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'size',
        type: 'InnerLoadingSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'color',
        type: 'InnerLoadingColor',
        default: "'primary'",
        description: '',
      },
      {
        name: 'label',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'dark',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'backgroundColor',
        type: 'string',
        default: "''",
        description: '',
      },
    ],
    outputs: [],
    usage: `<div class="relative">
  <ax-inner-loading [showing]="isLoading"></ax-inner-loading>
  <p>Content here</p>
</div>

<ax-card class="relative">
  <ax-inner-loading [showing]="loading" label="Loading data..."></ax-inner-loading>
  <p>Card content</p>
</ax-card>

<ax-inner-loading [showing]="true" size="lg"></ax-inner-loading>`,
  },
  {
    name: 'Loading Bar',
    selector: 'ax-loading-bar',
    category: 'feedback',
    description: 'Loading Bar component',
    inputs: [
      {
        name: 'variant',
        type: 'LoadingBarVariant',
        default: "'primary'",
        description: '',
      },
      {
        name: 'height',
        type: 'number',
        default: '3',
        description: '',
      },
    ],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Splash Screen',
    selector: 'ax-splash-screen',
    category: 'feedback',
    description: 'Splash Screen component',
    inputs: [],
    outputs: [],
    usage: `\`\`\`html
<!-- In app.component.html - Uses service -->
<ax-splash-screen />

<!-- Standalone with inputs -->
<ax-splash-screen
  [logo]="'/assets/logo.svg'"
  [appName]="'My App'"
  [visible]="isLoading"
  [stages]="loadingStages"
  [currentMessage]="'Loading...'"
/>
\`\`\``,
  },
  // ============ FORMS ============
  {
    name: 'File Upload',
    selector: 'ax-file-upload',
    category: 'forms',
    description: 'File Upload component',
    inputs: [
      {
        name: 'accept',
        type: 'string',
        default: "'*'",
        description: '',
      },
      {
        name: 'multiple',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'maxFiles',
        type: 'number',
        default: '10',
        description: '',
      },
      {
        name: 'maxSize',
        type: 'number',
        default: '10 * 1024 * 1024',
        description: '',
      },
      {
        name: 'dragText',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'hint',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'label',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'filesChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'fileRemoved',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<!-- Basic usage -->
<ax-file-upload
  (filesChange)="onFilesSelected(\$event)"
  accept="image/*"
></ax-file-upload>

<!-- Multiple files with size limit -->
<ax-file-upload
  [multiple]="true"
  [maxFiles]="5"
  [maxSize]="5242880"
  accept=".pdf,.doc,.docx"
  (filesChange)="onFilesSelected(\$event)"
></ax-file-upload>

<!-- With form control -->
<ax-file-upload formControlName="attachments"></ax-file-upload>
\`\`\``,
  },
  {
    name: 'Date Picker',
    selector: 'ax-date-picker',
    category: 'forms',
    description: 'Date Picker component',
    inputs: [
      {
        name: 'label',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: "'Select date'",
        description: '',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'readonly',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'required',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'size',
        type: 'DatePickerSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'minDate',
        type: 'Date',
        description: '',
        required: true,
      },
      {
        name: 'maxDate',
        type: 'Date',
        description: '',
        required: true,
      },
      {
        name: 'helperText',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'errorMessage',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'locale',
        type: 'DatePickerLocale',
        default: "'en'",
        description: '',
      },
      {
        name: 'calendar',
        type: 'DatePickerCalendar',
        default: "'gregorian'",
        description: '',
      },
      {
        name: 'monthFormat',
        type: 'DatePickerMonthFormat',
        default: "'full'",
        description: '',
      },
      {
        name: 'firstDayOfWeek',
        type: '0 | 1 | 2 | 3 | 4 | 5 | 6',
        default: '0',
        description: '',
      },
      {
        name: 'dateFormat',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'showActionButtons',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'displayMode',
        type: 'DatePickerDisplayMode',
        default: "'input'",
        description: '',
      },
      {
        name: 'mode',
        type: 'DatePickerMode',
        default: "'single'",
        description: '',
      },
    ],
    outputs: [
      {
        name: 'dateChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'rangeChange',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: ``,
  },
  {
    name: 'Input Otp',
    selector: 'ax-input-otp',
    category: 'forms',
    description: 'Input Otp component',
    inputs: [
      {
        name: 'length',
        type: 'OtpLength',
        default: '6',
        description: '',
      },
      {
        name: 'pattern',
        type: 'OtpPattern',
        default: "'digits'",
        description: '',
      },
      {
        name: 'size',
        type: 'OtpSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'separatorAfter',
        type: 'number',
        description: '',
        required: true,
      },
      {
        name: 'separatorChar',
        type: 'string',
        default: "'-'",
        description: '',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'readonly',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'error',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'autoFocus',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'autoSubmit',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'ariaLabel',
        type: 'string',
        default: "'One-time password input'",
        description: '',
      },
    ],
    outputs: [
      {
        name: 'valueChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'completed',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `<ax-input-otp [(value)]="otpValue" [length]="6" />

<ax-input-otp
  [(value)]="code"
  [length]="6"
  [separatorAfter]="3"
  pattern="alphanumeric"
  (completed)="onOtpComplete(\$event)"
/>

<ax-input-otp formControlName="otp" [length]="4" />`,
  },
  {
    name: 'Knob',
    selector: 'ax-knob',
    category: 'forms',
    description: 'Knob component',
    inputs: [
      {
        name: 'value',
        type: 'number',
        default: '0',
        description: '',
      },
      {
        name: 'min',
        type: 'number',
        default: '0',
        description: '',
      },
      {
        name: 'max',
        type: 'number',
        default: '100',
        description: '',
      },
      {
        name: 'step',
        type: 'number',
        default: '1',
        description: '',
      },
      {
        name: 'size',
        type: 'KnobSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'color',
        type: 'KnobColor',
        default: "'primary'",
        description: '',
      },
      {
        name: 'showValue',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'valueSuffix',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'readonly',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'startAngle',
        type: 'any',
        default: '-135',
        description: '',
      },
      {
        name: 'arcAngle',
        type: 'number',
        default: '270',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'valueChange',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `<ax-knob [(value)]="volume" [min]="0" [max]="100"></ax-knob>

<ax-knob
  [(value)]="progress"
  [min]="0"
  [max]="100"
  color="success"
  [showValue]="true">
</ax-knob>

<ax-knob formControlName="brightness" [min]="0" [max]="255"></ax-knob>`,
  },
  {
    name: 'Popup Edit',
    selector: 'ax-popup-edit',
    category: 'forms',
    description: 'Popup Edit component',
    inputs: [
      {
        name: 'value',
        type: 'string | number',
        default: "''",
        description: '',
      },
      {
        name: 'type',
        type: 'PopupEditInputType',
        default: "'text'",
        description: '',
      },
      {
        name: 'label',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'rows',
        type: 'number',
        default: '3',
        description: '',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'showButtons',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'saveLabel',
        type: 'string',
        default: "'Save'",
        description: '',
      },
      {
        name: 'cancelLabel',
        type: 'string',
        default: "'Cancel'",
        description: '',
      },
      {
        name: 'validate',
        type: '(value: string | number) => boolean',
        description: '',
        required: true,
      },
    ],
    outputs: [
      {
        name: 'valueChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'saveEvent',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'cancelEvent',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'opened',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'closed',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `<ax-popup-edit
  [(value)]="userName"
  label="Name"
  (save)="onSave(\$event)">
  {{ userName }}
</ax-popup-edit>

<ax-popup-edit
  [(value)]="price"
  type="number"
  label="Price"
  (save)="updatePrice(\$event)">
  {{ price | currency }}
</ax-popup-edit>

<ax-popup-edit
  [(value)]="description"
  type="textarea"
  [rows]="3"
  (save)="updateDesc(\$event)">
  {{ description }}
</ax-popup-edit>`,
  },
  {
    name: 'Scheduler',
    selector: 'ax-scheduler',
    category: 'forms',
    description: 'Scheduler component',
    inputs: [
      {
        name: 'label',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'dateLabel',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'timeLabel',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'layout',
        type: 'SchedulerLayout',
        default: "'horizontal'",
        description: '',
      },
      {
        name: 'size',
        type: 'SchedulerSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'timeFormat',
        type: 'TimeSlotFormat',
        default: "'12h'",
        description: '',
      },
      {
        name: 'locale',
        type: 'TimeSlotLocale',
        default: "'en'",
        description: '',
      },
      {
        name: 'columns',
        type: 'number',
        default: '4',
        description: '',
      },
      {
        name: 'timeSlotsLayout',
        type: 'TimeSlotLayout',
        default: "'grid'",
        description: '',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'required',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'helperText',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'errorMessage',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'minDate',
        type: 'Date',
        description: '',
        required: true,
      },
      {
        name: 'maxDate',
        type: 'Date',
        description: '',
        required: true,
      },
      {
        name: 'timeConfig',
        type: 'TimeSlotConfig',
        description: '',
        required: true,
      },
      {
        name: 'timeSlots',
        type: 'TimeSlot[]',
        default: '[]',
        description: '',
      },
      {
        name: 'availability',
        type: 'SchedulerAvailability',
        description: '',
        required: true,
      },
      {
        name: 'autoSelectFirstTime',
        type: 'boolean',
        default: 'false',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'dateChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'timeChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'valueChange',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: ``,
  },
  {
    name: 'Time Slots',
    selector: 'ax-time-slots',
    category: 'forms',
    description: 'Time Slots component',
    inputs: [
      {
        name: 'label',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'size',
        type: 'TimeSlotSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'layout',
        type: 'TimeSlotLayout',
        default: "'grid'",
        description: '',
      },
      {
        name: 'mode',
        type: 'TimeSlotMode',
        default: "'single'",
        description: '',
      },
      {
        name: 'timeFormat',
        type: 'TimeSlotFormat',
        default: "'12h'",
        description: '',
      },
      {
        name: 'locale',
        type: 'TimeSlotLocale',
        default: "'en'",
        description: '',
      },
      {
        name: 'columns',
        type: 'number',
        default: '4',
        description: '',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'required',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'helperText',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'errorMessage',
        type: 'string',
        default: "''",
        description: '',
      },
      {
        name: 'slots',
        type: 'TimeSlot[]',
        default: '[]',
        description: '',
      },
      {
        name: 'config',
        type: 'TimeSlotConfig',
        description: '',
        required: true,
      },
    ],
    outputs: [
      {
        name: 'slotSelect',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'valueChange',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: ``,
  },
  // ============ LAYOUT ============
  {
    name: 'Gridster',
    selector: 'ax-gridster',
    category: 'layout',
    description: 'Gridster component',
    inputs: [
      {
        name: 'items',
        type: 'T[]',
        default: '[]',
        description: '',
      },
      {
        name: 'preset',
        type: 'AxGridsterPreset',
        default: "'dashboard'",
        description: '',
      },
      {
        name: 'trackByFn',
        type: '(item: T) => string | number',
        default: '(item) => item.id',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'editModeChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'itemChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'layoutChange',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `\`\`\`html
<!-- Basic usage with custom template -->
<ax-gridster
  [items]="dashboardItems"
  [editMode]="isEditing"
  (layoutChange)="onLayoutChange(\$event)"
>
  <ng-template #itemTemplate let-item let-editMode="editMode">
    <my-custom-card [data]="item" [isEditing]="editMode"></my-custom-card>
  </ng-template>
</ax-gridster>

<!-- With preset configuration -->
<ax-gridster
  [items]="widgetItems"
  preset="widget"
  [editMode]="isEditing"
>
  <ng-template #itemTemplate let-item>
    <app-widget [config]="item"></app-widget>
  </ng-template>
</ax-gridster>

<!-- With custom settings -->
<ax-gridster
  [items]="launcherItems"
  [settings]="customSettings"
  [editMode]="isEditing"
>
  <ng-template #itemTemplate let-item>
    <ax-launcher-card [app]="item"></ax-launcher-card>
  </ng-template>
</ax-gridster>
\`\`\``,
  },
  {
    name: 'Splitter',
    selector: 'ax-splitter',
    category: 'layout',
    description: 'Splitter component',
    inputs: [
      {
        name: 'orientation',
        type: 'SplitterOrientation',
        default: "'horizontal'",
        description: '',
      },
      {
        name: 'unit',
        type: 'SplitterUnit',
        default: "'percent'",
        description: '',
      },
      {
        name: 'size',
        type: 'number',
        default: '50',
        description: '',
      },
      {
        name: 'min',
        type: 'number',
        default: '0',
        description: '',
      },
      {
        name: 'max',
        type: 'number',
        default: '100',
        description: '',
      },
      {
        name: 'separatorSize',
        type: 'number',
        default: '8',
        description: '',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'stateKey',
        type: 'string | null',
        default: 'null',
        description: '',
      },
      {
        name: 'stateStorage',
        type: 'SplitterStateStorage',
        default: "'local'",
        description: '',
      },
    ],
    outputs: [
      {
        name: 'sizeChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'dragStart',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'dragEnd',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `<ax-splitter orientation="horizontal" [size]="30">
  <div before>Left Panel</div>
  <div after>Right Panel</div>
</ax-splitter>

<ax-splitter orientation="vertical" [size]="50">
  <div before>Top Panel</div>
  <div after>Bottom Panel</div>
</ax-splitter>

<ax-splitter [size]="40" [min]="20" [max]="80">
  <div before>Sidebar</div>
  <div after>Content</div>
</ax-splitter>

<ax-splitter stateKey="my-splitter" stateStorage="local">
  <div before>Sidebar</div>
  <div after>Content</div>
</ax-splitter>`,
  },
  // ============ NAVIGATION ============
  {
    name: 'Breadcrumb',
    selector: 'ax-breadcrumb',
    category: 'navigation',
    description: 'Breadcrumb component',
    inputs: [
      {
        name: 'items',
        type: 'BreadcrumbItem[]',
        default: '[]',
        description: '',
      },
      {
        name: 'separator',
        type: 'string',
        default: "'/'",
        description: '',
      },
      {
        name: 'separatorIcon',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'size',
        type: 'BreadcrumbSize',
        default: "'md'",
        description: '',
      },
    ],
    outputs: [
      {
        name: 'itemClick',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: ``,
  },
  {
    name: 'Command Palette Dialog',
    selector: 'ax-command-palette-dialog',
    category: 'navigation',
    description: 'Command Palette Dialog component',
    inputs: [],
    outputs: [],
    usage: ``,
  },
  {
    name: 'Navbar Actions',
    selector: 'ax-navbar-actions',
    category: 'navigation',
    description: 'Navbar Actions component',
    inputs: [],
    outputs: [],
    usage: `<ax-navbar-actions>
  <ax-navbar-icon-button icon="search" (click)="openSearch()"></ax-navbar-icon-button>
  <ax-navbar-icon-button icon="notifications" [badge]="3"></ax-navbar-icon-button>
  <ax-navbar-icon-button icon="apps"></ax-navbar-icon-button>
</ax-navbar-actions>`,
  },
  {
    name: 'Navbar Brand',
    selector: 'ax-navbar-brand',
    category: 'navigation',
    description: 'Navbar Brand component',
    inputs: [
      {
        name: 'logo',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'icon',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'svgIcon',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'logoIcon',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'logoAlt',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'logoHeight',
        type: 'string',
        default: "'32px'",
        description: '',
      },
      {
        name: 'name',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'showLogo',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'showName',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'routerLink',
        type: 'string | string[]',
        description: '',
        required: true,
      },
      {
        name: 'href',
        type: 'string',
        description: '',
        required: true,
      },
    ],
    outputs: [
      {
        name: 'brandClick',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `<ax-navbar-brand logo="assets/logo.svg" name="AegisX"></ax-navbar-brand>

<ax-navbar-brand icon="business" name="Enterprise"></ax-navbar-brand>

<ax-navbar-brand svgIcon="custom-logo" name="Custom Brand"></ax-navbar-brand>

<ax-navbar-brand name="AegisX" [showLogo]="false"></ax-navbar-brand>

<ax-navbar-brand>
  <ng-template axBrandTemplate>
    <custom-logo></custom-logo>
  </ng-template>
</ax-navbar-brand>`,
  },
  {
    name: 'Navbar Icon Button',
    selector: 'ax-navbar-icon-button',
    category: 'navigation',
    description: 'Navbar Icon Button component',
    inputs: [
      {
        name: 'icon',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'badge',
        type: 'number | string',
        description: '',
        required: true,
      },
      {
        name: 'badgeColor',
        type: "'primary' | 'accent' | 'warn'",
        default: "'warn'",
        description: '',
      },
      {
        name: 'tooltip',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'tooltipPosition',
        type: "'above' | 'below' | 'left' | 'right'",
        default: "'below'",
        description: '',
      },
      {
        name: 'size',
        type: 'IconButtonSize',
        default: "'md'",
        description: '',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'ariaLabel',
        type: 'string',
        description: '',
        required: true,
      },
    ],
    outputs: [
      {
        name: 'buttonClick',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `<ax-navbar-icon-button icon="search" (click)="openSearch()"></ax-navbar-icon-button>

<ax-navbar-icon-button icon="notifications" [badge]="3" tooltip="Notifications"></ax-navbar-icon-button>

<ax-navbar-icon-button icon="settings" size="lg"></ax-navbar-icon-button>`,
  },
  {
    name: 'Nav Item',
    selector: 'ax-nav-item',
    category: 'navigation',
    description: 'Nav Item component',
    inputs: [
      {
        name: 'label',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'icon',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'svgIcon',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'badge',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'routerLink',
        type: 'string | string[]',
        description: '',
        required: true,
      },
      {
        name: 'href',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'target',
        type: 'string',
        description: '',
        required: true,
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'isActive',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'routerLinkActiveClass',
        type: 'string',
        default: "'ax-nav-item__link--active'",
        description: '',
      },
      {
        name: 'routerLinkActiveOptions',
        type: '{ exact: boolean }',
        default: '{ exact: false }',
        description: '',
      },
      {
        name: 'menu',
        type: 'NavbarMenuItem[]',
        description: '',
        required: true,
      },
    ],
    outputs: [
      {
        name: 'itemClick',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `<ax-nav-item label="Home" routerLink="/"></ax-nav-item>

<ax-nav-item label="Products" [menu]="[
  { label: 'Software', routerLink: '/products/software' },
  { label: 'Hardware', routerLink: '/products/hardware' }
]"></ax-nav-item>

<ax-nav-item label="Settings" icon="settings" routerLink="/settings"></ax-nav-item>`,
  },
  {
    name: 'Navbar Nav',
    selector: 'ax-navbar-nav',
    category: 'navigation',
    description: 'Navbar Nav component',
    inputs: [
      {
        name: 'ariaLabel',
        type: 'string',
        default: "'Main navigation'",
        description: '',
      },
    ],
    outputs: [],
    usage: `<ax-navbar-nav>
  <ax-nav-item label="Home" routerLink="/"></ax-nav-item>
  <ax-nav-item label="Products" [menu]="productsMenu"></ax-nav-item>
  <ax-nav-item label="About" routerLink="/about"></ax-nav-item>
</ax-navbar-nav>`,
  },
  {
    name: 'Navbar User',
    selector: 'ax-navbar-user',
    category: 'navigation',
    description: 'Navbar User component',
    inputs: [
      {
        name: 'user',
        type: 'NavbarUser',
        description: '',
        required: true,
      },
      {
        name: 'menuItems',
        type: 'NavbarUserMenuItem[]',
        default: '[]',
        description: '',
      },
      {
        name: 'showInfo',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'showChevron',
        type: 'boolean',
        default: 'true',
        description: '',
      },
      {
        name: 'showMenuHeader',
        type: 'boolean',
        default: 'true',
        description: '',
      },
    ],
    outputs: [
      {
        name: 'menuAction',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'menuItemClick',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `<ax-navbar-user
  [user]="{ name: 'John Doe', email: 'john@example.com', avatar: 'path/to/avatar.jpg' }"
  [menuItems]="[
    { label: 'Profile', icon: 'person', action: 'profile' },
    { label: 'Settings', icon: 'settings', action: 'settings' },
    { divider: true },
    { label: 'Logout', icon: 'logout', action: 'logout', danger: true }
  ]"
  (menuAction)="handleMenuAction(\$event)"
></ax-navbar-user>`,
  },
  {
    name: 'Navbar',
    selector: 'ax-navbar',
    category: 'navigation',
    description: 'Navbar component',
    inputs: [
      {
        name: 'variant',
        type: 'NavbarVariant',
        default: "'default'",
        description: '',
      },
      {
        name: 'position',
        type: 'NavbarPosition',
        default: "'static'",
        description: '',
      },
      {
        name: 'height',
        type: 'NavbarHeight',
        default: "'md'",
        description: '',
      },
      {
        name: 'theme',
        type: 'NavbarTheme',
        default: "'auto'",
        description: '',
      },
      {
        name: 'shadow',
        type: "'none' | 'sm' | 'md'",
        default: "'none'",
        description: '',
      },
      {
        name: 'blur',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'mobileBreakpoint',
        type: 'number',
        default: '1024',
        description: '',
      },
      {
        name: 'hideOnScroll',
        type: 'boolean',
        default: 'false',
        description: '',
      },
      {
        name: 'hideScrollThreshold',
        type: 'number',
        default: '100',
        description: '',
      },
      {
        name: 'ariaLabel',
        type: 'string',
        default: "'Main navigation'",
        description: '',
      },
      {
        name: 'color',
        type: 'NavbarColor',
        default: "'default'",
        description: '',
      },
      {
        name: 'navAlign',
        type: 'NavbarNavAlign',
        default: "'center'",
        description: '',
      },
    ],
    outputs: [
      {
        name: 'mobileMenuChange',
        type: 'EventEmitter',
        description: '',
      },
      {
        name: 'visibilityChange',
        type: 'EventEmitter',
        description: '',
      },
    ],
    usage: `<ax-navbar>
  <ng-container axNavbarStart>
    <ax-navbar-brand logo="assets/logo.svg" name="AegisX"></ax-navbar-brand>
  </ng-container>

  <ng-container axNavbarCenter>
    <ax-navbar-nav>
      <ax-nav-item label="Home" routerLink="/"></ax-nav-item>
      <ax-nav-item label="Products" [menu]="productsMenu"></ax-nav-item>
    </ax-navbar-nav>
  </ng-container>

  <ng-container axNavbarEnd>
    <ax-navbar-actions>
      <ax-navbar-icon-button icon="search" (click)="openSearch()"></ax-navbar-icon-button>
      <ax-navbar-icon-button icon="notifications" [badge]="3"></ax-navbar-icon-button>
    </ax-navbar-actions>
    <ax-navbar-user [user]="currentUser"></ax-navbar-user>
  </ng-container>
</ax-navbar>

<ax-navbar position="sticky" [hideOnScroll]="true" [shadow]="'sm'">
  ...
</ax-navbar>`,
  },
  {
    name: 'Navigation',
    selector: 'ax-navigation',
    category: 'navigation',
    description: 'Navigation component',
    inputs: [
      {
        name: 'navigation',
        type: 'AxNavigationItem[]',
        default: '[]',
        description: '',
      },
      {
        name: 'layout',
        type: 'NavigationLayout',
        default: "'vertical'",
        description: '',
      },
      {
        name: 'appearance',
        type: 'NavigationAppearance',
        default: "'default'",
        description: '',
      },
    ],
    outputs: [],
    usage: ``,
  },
];

/**
 * Get all components
 */

export function getAllComponents(): ComponentInfo[] {
  return components;
}

/**
 * Get components by category
 */

export function getComponentsByCategory(
  category: ComponentCategory,
): ComponentInfo[] {
  return components.filter((c) => c.category === category);
}

/**
 * Get component by name
 */

export function getComponentByName(name: string): ComponentInfo | undefined {
  return components.find(
    (c) => c.name.toLowerCase() === name.toLowerCase() || c.selector === name,
  );
}

/**
 * Search components
 */

export function searchComponents(query: string): ComponentInfo[] {
  const q = query.toLowerCase();
  return components.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.selector.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.includes(q),
  );
}
