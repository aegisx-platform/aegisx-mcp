/**
 * AegisX UI Components Registry
 * Complete catalog of all 68+ UI components
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
  'data-display',
  'forms',
  'feedback',
  'navigation',
  'layout',
  'auth',
  'advanced',
  'overlays',
] as const;

export type ComponentCategory = (typeof componentCategories)[number];

export const components: ComponentInfo[] = [
  // ============ DATA DISPLAY ============
  {
    name: 'Badge',
    selector: 'ax-badge',
    category: 'data-display',
    description:
      'Display status indicators, counts, or labels with customizable colors and styles.',
    inputs: [
      {
        name: 'color',
        type: "'primary' | 'accent' | 'warn' | 'success' | 'error' | 'info'",
        default: 'primary',
        description: 'Badge color theme',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: 'md',
        description: 'Badge size',
      },
      {
        name: 'variant',
        type: "'filled' | 'outlined' | 'soft'",
        default: 'filled',
        description: 'Badge style variant',
      },
      {
        name: 'rounded',
        type: 'boolean',
        default: 'false',
        description: 'Apply pill/rounded style',
      },
    ],
    outputs: [],
    usage: `<ax-badge color="success" variant="soft">Active</ax-badge>
<ax-badge color="error" rounded>5</ax-badge>`,
    bestPractices: [
      'Use semantic colors (success for active, error for issues)',
      'Keep badge text short (1-2 words or numbers)',
      'Use soft variant for less emphasis',
    ],
    relatedComponents: ['Avatar', 'Card', 'List'],
  },
  {
    name: 'Avatar',
    selector: 'ax-avatar',
    category: 'data-display',
    description:
      'Display user profile images with fallback to initials or icons.',
    inputs: [
      {
        name: 'src',
        type: 'string',
        description: 'Image source URL',
      },
      {
        name: 'alt',
        type: 'string',
        description: 'Alt text for accessibility',
      },
      {
        name: 'name',
        type: 'string',
        description: 'Name for generating initials fallback',
      },
      {
        name: 'size',
        type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
        default: 'md',
        description: 'Avatar size',
      },
      {
        name: 'shape',
        type: "'circle' | 'square'",
        default: 'circle',
        description: 'Avatar shape',
      },
    ],
    outputs: [],
    usage: `<ax-avatar [src]="user.avatar" [name]="user.name" size="lg"></ax-avatar>
<ax-avatar name="John Doe" shape="square"></ax-avatar>`,
    bestPractices: [
      'Always provide name for initials fallback',
      'Use appropriate size for context (sm in lists, lg in profiles)',
    ],
    relatedComponents: ['Badge', 'Card'],
  },
  {
    name: 'Card',
    selector: 'ax-card',
    category: 'data-display',
    description:
      'Container component for grouping related content with optional header and footer.',
    inputs: [
      {
        name: 'title',
        type: 'string',
        description: 'Card header title',
      },
      {
        name: 'subtitle',
        type: 'string',
        description: 'Card header subtitle',
      },
      {
        name: 'elevation',
        type: "'none' | 'sm' | 'md' | 'lg'",
        default: 'sm',
        description: 'Card shadow elevation',
      },
      {
        name: 'variant',
        type: "'elevated' | 'outlined' | 'flat'",
        default: 'elevated',
        description: 'Card style variant',
      },
    ],
    outputs: [],
    usage: `<ax-card title="Dashboard" subtitle="Overview">
  <p>Card content here</p>
</ax-card>`,
    bestPractices: [
      'Use consistent elevation across similar cards',
      'Group related information within cards',
    ],
    relatedComponents: ['KPI Card', 'Stats Card'],
  },
  {
    name: 'KPI Card',
    selector: 'ax-kpi-card',
    category: 'data-display',
    description:
      'Display key performance indicators with value, trend, and comparison.',
    inputs: [
      {
        name: 'title',
        type: 'string',
        description: 'KPI title/label',
        required: true,
      },
      {
        name: 'value',
        type: 'string | number',
        description: 'Current KPI value',
        required: true,
      },
      {
        name: 'trend',
        type: "'up' | 'down' | 'neutral'",
        description: 'Trend direction indicator',
      },
      {
        name: 'trendValue',
        type: 'string',
        description: 'Trend percentage or value',
      },
      {
        name: 'icon',
        type: 'string',
        description: 'Icon name from icon set',
      },
      {
        name: 'color',
        type: 'string',
        description: 'Accent color for the card',
      },
    ],
    outputs: [],
    usage: `<ax-kpi-card
  title="Total Sales"
  [value]="125000"
  trend="up"
  trendValue="+12.5%"
  icon="trending_up">
</ax-kpi-card>`,
    bestPractices: [
      'Show trend to provide context',
      'Use consistent number formatting',
      'Group related KPIs together',
    ],
    relatedComponents: ['Card', 'Stats Card', 'Sparkline'],
  },
  {
    name: 'Stats Card',
    selector: 'ax-stats-card',
    category: 'data-display',
    description: 'Compact statistics display with icon and value.',
    inputs: [
      {
        name: 'label',
        type: 'string',
        description: 'Stat label',
        required: true,
      },
      {
        name: 'value',
        type: 'string | number',
        description: 'Stat value',
        required: true,
      },
      {
        name: 'icon',
        type: 'string',
        description: 'Material icon name',
      },
      {
        name: 'color',
        type: 'string',
        description: 'Card accent color',
      },
    ],
    outputs: [],
    usage: `<ax-stats-card label="Users" [value]="1234" icon="people" color="primary"></ax-stats-card>`,
    relatedComponents: ['KPI Card', 'Card'],
  },
  {
    name: 'List',
    selector: 'ax-list',
    category: 'data-display',
    description: 'Flexible list component for displaying items with actions.',
    inputs: [
      {
        name: 'items',
        type: 'T[]',
        description: 'Array of items to display',
        required: true,
      },
      {
        name: 'selectable',
        type: 'boolean',
        default: 'false',
        description: 'Enable item selection',
      },
      {
        name: 'multiSelect',
        type: 'boolean',
        default: 'false',
        description: 'Allow multiple selection',
      },
    ],
    outputs: [
      {
        name: 'itemClick',
        type: 'EventEmitter<T>',
        description: 'Emits when item is clicked',
      },
      {
        name: 'selectionChange',
        type: 'EventEmitter<T[]>',
        description: 'Emits when selection changes',
      },
    ],
    usage: `<ax-list [items]="users" (itemClick)="onUserClick($event)">
  <ng-template #itemTemplate let-user>
    <ax-avatar [name]="user.name"></ax-avatar>
    <span>{{ user.name }}</span>
  </ng-template>
</ax-list>`,
    relatedComponents: ['Avatar', 'Badge'],
  },
  {
    name: 'Timeline',
    selector: 'ax-timeline',
    category: 'data-display',
    description:
      'Display chronological events or activities in a vertical timeline.',
    inputs: [
      {
        name: 'items',
        type: 'TimelineItem[]',
        description: 'Timeline items array',
        required: true,
      },
      {
        name: 'align',
        type: "'left' | 'right' | 'alternate'",
        default: 'left',
        description: 'Timeline alignment',
      },
    ],
    outputs: [],
    usage: `<ax-timeline [items]="activities" align="alternate"></ax-timeline>`,
    relatedComponents: ['Card', 'List'],
  },
  {
    name: 'Circular Progress',
    selector: 'ax-circular-progress',
    category: 'data-display',
    description: 'Circular progress indicator with percentage display.',
    inputs: [
      {
        name: 'value',
        type: 'number',
        description: 'Progress value (0-100)',
        required: true,
      },
      {
        name: 'size',
        type: 'number',
        default: '100',
        description: 'Circle diameter in pixels',
      },
      {
        name: 'strokeWidth',
        type: 'number',
        default: '8',
        description: 'Progress stroke width',
      },
      {
        name: 'color',
        type: 'string',
        default: 'primary',
        description: 'Progress color',
      },
      {
        name: 'showValue',
        type: 'boolean',
        default: 'true',
        description: 'Display percentage in center',
      },
    ],
    outputs: [],
    usage: `<ax-circular-progress [value]="75" color="success"></ax-circular-progress>`,
    relatedComponents: ['Segmented Progress', 'Loading Bar'],
  },
  {
    name: 'Segmented Progress',
    selector: 'ax-segmented-progress',
    category: 'data-display',
    description: 'Multi-segment progress bar for showing distribution.',
    inputs: [
      {
        name: 'segments',
        type: 'ProgressSegment[]',
        description: 'Array of segments with value and color',
        required: true,
      },
      {
        name: 'height',
        type: 'number',
        default: '8',
        description: 'Bar height in pixels',
      },
    ],
    outputs: [],
    usage: `<ax-segmented-progress [segments]="[
  { value: 60, color: 'success', label: 'Completed' },
  { value: 25, color: 'warn', label: 'In Progress' },
  { value: 15, color: 'error', label: 'Failed' }
]"></ax-segmented-progress>`,
    relatedComponents: ['Circular Progress'],
  },
  {
    name: 'Sparkline',
    selector: 'ax-sparkline',
    category: 'data-display',
    description: 'Compact inline chart for showing trends.',
    inputs: [
      {
        name: 'data',
        type: 'number[]',
        description: 'Data points array',
        required: true,
      },
      {
        name: 'type',
        type: "'line' | 'bar' | 'area'",
        default: 'line',
        description: 'Chart type',
      },
      {
        name: 'color',
        type: 'string',
        default: 'primary',
        description: 'Chart color',
      },
      {
        name: 'height',
        type: 'number',
        default: '40',
        description: 'Chart height',
      },
    ],
    outputs: [],
    usage: `<ax-sparkline [data]="[5,10,15,8,12,20]" type="area" color="success"></ax-sparkline>`,
    relatedComponents: ['KPI Card', 'Stats Card'],
  },
  {
    name: 'Description List',
    selector: 'ax-description-list',
    category: 'data-display',
    description: 'Key-value pair display for detailed information.',
    inputs: [
      {
        name: 'items',
        type: 'DescriptionItem[]',
        description: 'Array of term/description pairs',
        required: true,
      },
      {
        name: 'layout',
        type: "'horizontal' | 'vertical'",
        default: 'horizontal',
        description: 'Layout direction',
      },
      {
        name: 'columns',
        type: 'number',
        default: '1',
        description: 'Number of columns',
      },
    ],
    outputs: [],
    usage: `<ax-description-list [items]="[
  { term: 'Name', description: 'John Doe' },
  { term: 'Email', description: 'john@example.com' }
]" layout="horizontal" [columns]="2"></ax-description-list>`,
    relatedComponents: ['Card', 'Field Display'],
  },
  {
    name: 'Field Display',
    selector: 'ax-field-display',
    category: 'data-display',
    description: 'Display a single field with label and value.',
    inputs: [
      {
        name: 'label',
        type: 'string',
        description: 'Field label',
        required: true,
      },
      {
        name: 'value',
        type: 'string | number',
        description: 'Field value',
      },
      {
        name: 'type',
        type: "'text' | 'date' | 'currency' | 'boolean'",
        default: 'text',
        description: 'Value display type',
      },
    ],
    outputs: [],
    usage: `<ax-field-display label="Created" [value]="item.createdAt" type="date"></ax-field-display>`,
    relatedComponents: ['Description List'],
  },

  // ============ FORMS ============
  {
    name: 'Date Picker',
    selector: 'ax-date-picker',
    category: 'forms',
    description: 'Date selection with calendar popup and range support.',
    inputs: [
      {
        name: 'value',
        type: 'Date | null',
        description: 'Selected date value',
      },
      {
        name: 'min',
        type: 'Date',
        description: 'Minimum selectable date',
      },
      {
        name: 'max',
        type: 'Date',
        description: 'Maximum selectable date',
      },
      {
        name: 'range',
        type: 'boolean',
        default: 'false',
        description: 'Enable date range selection',
      },
      {
        name: 'format',
        type: 'string',
        default: 'dd/MM/yyyy',
        description: 'Date display format',
      },
      {
        name: 'placeholder',
        type: 'string',
        description: 'Input placeholder text',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disable the picker',
      },
    ],
    outputs: [
      {
        name: 'valueChange',
        type: 'EventEmitter<Date>',
        description: 'Emits when date changes',
      },
    ],
    usage: `<ax-date-picker
  [(value)]="selectedDate"
  [min]="minDate"
  format="yyyy-MM-dd"
  placeholder="Select date">
</ax-date-picker>`,
    bestPractices: [
      'Set appropriate min/max dates to guide users',
      'Use range mode for booking/scheduling features',
    ],
    relatedComponents: ['Time Slots', 'Scheduler'],
  },
  {
    name: 'Input OTP',
    selector: 'ax-input-otp',
    category: 'forms',
    description: 'One-time password input with auto-focus navigation.',
    inputs: [
      {
        name: 'length',
        type: 'number',
        default: '6',
        description: 'Number of OTP digits',
      },
      {
        name: 'type',
        type: "'number' | 'alphanumeric'",
        default: 'number',
        description: 'Allowed input type',
      },
      {
        name: 'masked',
        type: 'boolean',
        default: 'false',
        description: 'Mask input like password',
      },
    ],
    outputs: [
      {
        name: 'complete',
        type: 'EventEmitter<string>',
        description: 'Emits when all digits entered',
      },
    ],
    usage: `<ax-input-otp [length]="6" (complete)="verifyOtp($event)"></ax-input-otp>`,
    relatedComponents: ['Login Form'],
  },
  {
    name: 'Knob',
    selector: 'ax-knob',
    category: 'forms',
    description: 'Rotary knob control for value adjustment.',
    inputs: [
      {
        name: 'value',
        type: 'number',
        description: 'Current value',
      },
      {
        name: 'min',
        type: 'number',
        default: '0',
        description: 'Minimum value',
      },
      {
        name: 'max',
        type: 'number',
        default: '100',
        description: 'Maximum value',
      },
      {
        name: 'step',
        type: 'number',
        default: '1',
        description: 'Step increment',
      },
      {
        name: 'size',
        type: 'number',
        default: '100',
        description: 'Knob diameter',
      },
    ],
    outputs: [
      {
        name: 'valueChange',
        type: 'EventEmitter<number>',
        description: 'Emits on value change',
      },
    ],
    usage: `<ax-knob [(value)]="volume" [min]="0" [max]="100"></ax-knob>`,
    relatedComponents: ['Circular Progress'],
  },
  {
    name: 'Popup Edit',
    selector: 'ax-popup-edit',
    category: 'forms',
    description: 'Inline editing with popup form for tables and lists.',
    inputs: [
      {
        name: 'value',
        type: 'any',
        description: 'Current value to edit',
      },
      {
        name: 'type',
        type: "'text' | 'number' | 'select' | 'date'",
        default: 'text',
        description: 'Input type',
      },
      {
        name: 'options',
        type: 'any[]',
        description: 'Options for select type',
      },
    ],
    outputs: [
      {
        name: 'save',
        type: 'EventEmitter<any>',
        description: 'Emits when save clicked',
      },
      {
        name: 'cancel',
        type: 'EventEmitter<void>',
        description: 'Emits when cancel clicked',
      },
    ],
    usage: `<ax-popup-edit [value]="item.name" (save)="updateName($event)">
  {{ item.name }}
</ax-popup-edit>`,
    relatedComponents: ['List', 'Table'],
  },
  {
    name: 'Scheduler',
    selector: 'ax-scheduler',
    category: 'forms',
    description: 'Week/day scheduler for appointment booking.',
    inputs: [
      {
        name: 'events',
        type: 'SchedulerEvent[]',
        description: 'Scheduled events',
      },
      {
        name: 'view',
        type: "'day' | 'week' | 'month'",
        default: 'week',
        description: 'Calendar view mode',
      },
      {
        name: 'startHour',
        type: 'number',
        default: '8',
        description: 'Day start hour',
      },
      {
        name: 'endHour',
        type: 'number',
        default: '18',
        description: 'Day end hour',
      },
    ],
    outputs: [
      {
        name: 'eventClick',
        type: 'EventEmitter<SchedulerEvent>',
        description: 'Event clicked',
      },
      {
        name: 'slotClick',
        type: 'EventEmitter<Date>',
        description: 'Empty slot clicked',
      },
    ],
    usage: `<ax-scheduler [events]="appointments" (slotClick)="bookSlot($event)"></ax-scheduler>`,
    relatedComponents: ['Calendar', 'Time Slots'],
  },
  {
    name: 'Time Slots',
    selector: 'ax-time-slots',
    category: 'forms',
    description: 'Time slot picker for appointment scheduling.',
    inputs: [
      {
        name: 'slots',
        type: 'TimeSlot[]',
        description: 'Available time slots',
        required: true,
      },
      {
        name: 'selected',
        type: 'TimeSlot',
        description: 'Currently selected slot',
      },
      {
        name: 'columns',
        type: 'number',
        default: '4',
        description: 'Number of columns',
      },
    ],
    outputs: [
      {
        name: 'select',
        type: 'EventEmitter<TimeSlot>',
        description: 'Slot selected',
      },
    ],
    usage: `<ax-time-slots [slots]="availableSlots" (select)="selectTime($event)"></ax-time-slots>`,
    relatedComponents: ['Scheduler', 'Date Picker'],
  },

  // ============ FEEDBACK ============
  {
    name: 'Alert',
    selector: 'ax-alert',
    category: 'feedback',
    description: 'Contextual feedback messages for user actions.',
    inputs: [
      {
        name: 'type',
        type: "'success' | 'error' | 'warning' | 'info'",
        default: 'info',
        description: 'Alert type/color',
      },
      {
        name: 'title',
        type: 'string',
        description: 'Alert title',
      },
      {
        name: 'message',
        type: 'string',
        description: 'Alert message',
      },
      {
        name: 'dismissible',
        type: 'boolean',
        default: 'false',
        description: 'Show dismiss button',
      },
      {
        name: 'icon',
        type: 'string',
        description: 'Custom icon',
      },
    ],
    outputs: [
      {
        name: 'dismiss',
        type: 'EventEmitter<void>',
        description: 'Alert dismissed',
      },
    ],
    usage: `<ax-alert type="success" title="Success!" message="Your changes have been saved." dismissible></ax-alert>`,
    bestPractices: [
      'Use appropriate type for context',
      'Keep messages concise and actionable',
      'Use dismissible for non-critical alerts',
    ],
    relatedComponents: ['Toast Service'],
  },
  {
    name: 'Loading Bar',
    selector: 'ax-loading-bar',
    category: 'feedback',
    description: 'Top loading bar for page/route transitions.',
    inputs: [
      {
        name: 'loading',
        type: 'boolean',
        description: 'Show/hide loading bar',
      },
      {
        name: 'progress',
        type: 'number',
        description: 'Manual progress (0-100)',
      },
      {
        name: 'color',
        type: 'string',
        default: 'primary',
        description: 'Bar color',
      },
    ],
    outputs: [],
    usage: `<ax-loading-bar [loading]="isLoading"></ax-loading-bar>`,
    bestPractices: [
      'Place at top of layout',
      'Use with HTTP interceptors for automatic loading',
    ],
    relatedComponents: ['Inner Loading', 'Splash Screen'],
  },
  {
    name: 'Inner Loading',
    selector: 'ax-inner-loading',
    category: 'feedback',
    description: 'Loading overlay for specific containers/components.',
    inputs: [
      {
        name: 'loading',
        type: 'boolean',
        description: 'Show/hide loading',
      },
      {
        name: 'text',
        type: 'string',
        description: 'Loading text',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: 'md',
        description: 'Spinner size',
      },
    ],
    outputs: [],
    usage: `<div class="relative">
  <ax-inner-loading [loading]="isLoadingData" text="Loading...">
    <your-content></your-content>
  </ax-inner-loading>
</div>`,
    relatedComponents: ['Loading Bar', 'Skeleton'],
  },
  {
    name: 'Splash Screen',
    selector: 'ax-splash-screen',
    category: 'feedback',
    description: 'Full page loading screen for app initialization.',
    inputs: [
      {
        name: 'show',
        type: 'boolean',
        default: 'true',
        description: 'Show splash screen',
      },
      {
        name: 'logo',
        type: 'string',
        description: 'Logo image URL',
      },
      {
        name: 'message',
        type: 'string',
        description: 'Loading message',
      },
    ],
    outputs: [],
    usage: `<ax-splash-screen [show]="!appReady" logo="/assets/logo.svg"></ax-splash-screen>`,
    relatedComponents: ['Loading Bar'],
  },
  {
    name: 'Skeleton',
    selector: 'ax-skeleton',
    category: 'feedback',
    description: 'Placeholder loading animation for content.',
    inputs: [
      {
        name: 'type',
        type: "'text' | 'avatar' | 'image' | 'card' | 'table'",
        default: 'text',
        description: 'Skeleton shape type',
      },
      {
        name: 'lines',
        type: 'number',
        default: '3',
        description: 'Number of text lines',
      },
      {
        name: 'width',
        type: 'string',
        description: 'Custom width',
      },
      {
        name: 'height',
        type: 'string',
        description: 'Custom height',
      },
    ],
    outputs: [],
    usage: `@if (loading) {
  <ax-skeleton type="card"></ax-skeleton>
} @else {
  <ax-card>...</ax-card>
}`,
    bestPractices: [
      'Match skeleton shape to actual content',
      'Use for perceived performance improvement',
    ],
    relatedComponents: ['Inner Loading'],
  },

  // ============ NAVIGATION ============
  {
    name: 'Breadcrumb',
    selector: 'ax-breadcrumb',
    category: 'navigation',
    description: 'Navigation breadcrumbs showing page hierarchy.',
    inputs: [
      {
        name: 'items',
        type: 'BreadcrumbItem[]',
        description: 'Breadcrumb items',
      },
      {
        name: 'separator',
        type: 'string',
        default: '/',
        description: 'Separator character',
      },
      {
        name: 'autoGenerate',
        type: 'boolean',
        default: 'false',
        description: 'Auto-generate from router',
      },
    ],
    outputs: [],
    usage: `<ax-breadcrumb [items]="[
  { label: 'Home', link: '/' },
  { label: 'Products', link: '/products' },
  { label: 'Details' }
]"></ax-breadcrumb>`,
    relatedComponents: ['Navbar'],
  },
  {
    name: 'Command Palette',
    selector: 'ax-command-palette',
    category: 'navigation',
    description: 'Keyboard-driven command search (Cmd+K style).',
    inputs: [
      {
        name: 'commands',
        type: 'Command[]',
        description: 'Available commands',
        required: true,
      },
      {
        name: 'placeholder',
        type: 'string',
        default: 'Search commands...',
        description: 'Search placeholder',
      },
      {
        name: 'shortcut',
        type: 'string',
        default: 'k',
        description: 'Trigger key with Cmd/Ctrl',
      },
    ],
    outputs: [
      {
        name: 'execute',
        type: 'EventEmitter<Command>',
        description: 'Command executed',
      },
    ],
    usage: `<ax-command-palette [commands]="commands" (execute)="runCommand($event)"></ax-command-palette>`,
    bestPractices: [
      'Group commands by category',
      'Include keyboard shortcuts in command labels',
    ],
    relatedComponents: ['Navbar', 'Launcher'],
  },
  {
    name: 'Navbar',
    selector: 'ax-navbar',
    category: 'navigation',
    description: 'Top navigation bar with logo, menu, and actions.',
    inputs: [
      {
        name: 'logo',
        type: 'string',
        description: 'Logo image URL',
      },
      {
        name: 'title',
        type: 'string',
        description: 'App title',
      },
      {
        name: 'fixed',
        type: 'boolean',
        default: 'true',
        description: 'Fixed position at top',
      },
    ],
    outputs: [],
    usage: `<ax-navbar logo="/assets/logo.svg" title="My App">
  <ng-container axNavbarActions>
    <button mat-icon-button><mat-icon>notifications</mat-icon></button>
  </ng-container>
</ax-navbar>`,
    relatedComponents: ['Breadcrumb', 'Classic Layout'],
  },
  {
    name: 'Launcher',
    selector: 'ax-launcher',
    category: 'navigation',
    description: 'App launcher grid for quick access to modules.',
    inputs: [
      {
        name: 'apps',
        type: 'LauncherApp[]',
        description: 'Available apps/modules',
        required: true,
      },
      {
        name: 'columns',
        type: 'number',
        default: '3',
        description: 'Grid columns',
      },
    ],
    outputs: [
      {
        name: 'select',
        type: 'EventEmitter<LauncherApp>',
        description: 'App selected',
      },
    ],
    usage: `<ax-launcher [apps]="modules" (select)="navigateTo($event)"></ax-launcher>`,
    relatedComponents: ['Command Palette'],
  },

  // ============ LAYOUT ============
  {
    name: 'Classic Layout',
    selector: 'ax-classic-layout',
    category: 'layout',
    description: 'Traditional layout with sidebar navigation.',
    inputs: [
      {
        name: 'sidebarCollapsed',
        type: 'boolean',
        default: 'false',
        description: 'Collapse sidebar',
      },
      {
        name: 'sidebarPosition',
        type: "'left' | 'right'",
        default: 'left',
        description: 'Sidebar position',
      },
    ],
    outputs: [],
    usage: `<ax-classic-layout>
  <ng-container axSidebar>
    <ax-navigation></ax-navigation>
  </ng-container>
  <router-outlet></router-outlet>
</ax-classic-layout>`,
    relatedComponents: ['Compact Layout', 'Enterprise Layout'],
  },
  {
    name: 'Compact Layout',
    selector: 'ax-compact-layout',
    category: 'layout',
    description: 'Space-efficient layout with icon-only sidebar.',
    inputs: [
      {
        name: 'showLabels',
        type: 'boolean',
        default: 'false',
        description: 'Show icon labels on hover',
      },
    ],
    outputs: [],
    usage: `<ax-compact-layout>
  <router-outlet></router-outlet>
</ax-compact-layout>`,
    relatedComponents: ['Classic Layout'],
  },
  {
    name: 'Enterprise Layout',
    selector: 'ax-enterprise-layout',
    category: 'layout',
    description: 'Full-featured enterprise layout with multi-level navigation.',
    inputs: [
      {
        name: 'config',
        type: 'EnterpriseLayoutConfig',
        description: 'Layout configuration',
      },
    ],
    outputs: [],
    usage: `<ax-enterprise-layout [config]="layoutConfig">
  <router-outlet></router-outlet>
</ax-enterprise-layout>`,
    relatedComponents: ['Classic Layout'],
  },
  {
    name: 'Empty Layout',
    selector: 'ax-empty-layout',
    category: 'layout',
    description: 'Minimal layout for auth pages and standalone views.',
    inputs: [],
    outputs: [],
    usage: `<ax-empty-layout>
  <ax-login-form></ax-login-form>
</ax-empty-layout>`,
    relatedComponents: ['Login Form'],
  },

  // ============ AUTH ============
  {
    name: 'Login Form',
    selector: 'ax-login-form',
    category: 'auth',
    description: 'Complete login form with validation and social options.',
    inputs: [
      {
        name: 'showRemember',
        type: 'boolean',
        default: 'true',
        description: 'Show remember me checkbox',
      },
      {
        name: 'showForgotPassword',
        type: 'boolean',
        default: 'true',
        description: 'Show forgot password link',
      },
      {
        name: 'socialProviders',
        type: 'SocialProvider[]',
        description: 'Social login providers',
      },
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description: 'Show loading state',
      },
    ],
    outputs: [
      {
        name: 'login',
        type: 'EventEmitter<LoginCredentials>',
        description: 'Login submitted',
      },
      {
        name: 'forgotPassword',
        type: 'EventEmitter<void>',
        description: 'Forgot password clicked',
      },
      {
        name: 'socialLogin',
        type: 'EventEmitter<string>',
        description: 'Social provider clicked',
      },
    ],
    usage: `<ax-login-form
  [socialProviders]="['google', 'github']"
  (login)="handleLogin($event)"
  (socialLogin)="handleSocialLogin($event)">
</ax-login-form>`,
    relatedComponents: ['Register Form', 'Reset Password Form', 'Social Login'],
  },
  {
    name: 'Register Form',
    selector: 'ax-register-form',
    category: 'auth',
    description: 'User registration form with validation.',
    inputs: [
      {
        name: 'requireUsername',
        type: 'boolean',
        default: 'true',
        description: 'Require username field',
      },
      {
        name: 'requirePhone',
        type: 'boolean',
        default: 'false',
        description: 'Require phone field',
      },
      {
        name: 'termsUrl',
        type: 'string',
        description: 'Terms and conditions URL',
      },
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description: 'Show loading state',
      },
    ],
    outputs: [
      {
        name: 'register',
        type: 'EventEmitter<RegisterData>',
        description: 'Registration submitted',
      },
    ],
    usage: `<ax-register-form
  termsUrl="/terms"
  (register)="handleRegister($event)">
</ax-register-form>`,
    relatedComponents: ['Login Form'],
  },
  {
    name: 'Reset Password Form',
    selector: 'ax-reset-password-form',
    category: 'auth',
    description: 'Password reset request form.',
    inputs: [
      {
        name: 'mode',
        type: "'request' | 'reset'",
        default: 'request',
        description: 'Form mode',
      },
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description: 'Show loading state',
      },
    ],
    outputs: [
      {
        name: 'submit',
        type: 'EventEmitter<any>',
        description: 'Form submitted',
      },
    ],
    usage: `<ax-reset-password-form mode="request" (submit)="handleReset($event)"></ax-reset-password-form>`,
    relatedComponents: ['Login Form'],
  },
  {
    name: 'Social Login',
    selector: 'ax-social-login',
    category: 'auth',
    description: 'Social login buttons component.',
    inputs: [
      {
        name: 'providers',
        type: 'SocialProvider[]',
        description: 'Available providers',
        required: true,
      },
      {
        name: 'layout',
        type: "'horizontal' | 'vertical'",
        default: 'horizontal',
        description: 'Button layout',
      },
    ],
    outputs: [
      {
        name: 'select',
        type: 'EventEmitter<string>',
        description: 'Provider selected',
      },
    ],
    usage: `<ax-social-login [providers]="['google', 'github', 'microsoft']" (select)="loginWith($event)"></ax-social-login>`,
    relatedComponents: ['Login Form'],
  },

  // ============ ADVANCED ============
  {
    name: 'Calendar',
    selector: 'ax-calendar',
    category: 'advanced',
    description: 'Full calendar component with events and multiple views.',
    inputs: [
      {
        name: 'events',
        type: 'CalendarEvent[]',
        description: 'Calendar events',
      },
      {
        name: 'view',
        type: "'month' | 'week' | 'day'",
        default: 'month',
        description: 'Calendar view',
      },
      {
        name: 'date',
        type: 'Date',
        description: 'Current date',
      },
    ],
    outputs: [
      {
        name: 'eventClick',
        type: 'EventEmitter<CalendarEvent>',
        description: 'Event clicked',
      },
      {
        name: 'dateClick',
        type: 'EventEmitter<Date>',
        description: 'Date clicked',
      },
      {
        name: 'viewChange',
        type: 'EventEmitter<string>',
        description: 'View changed',
      },
    ],
    usage: `<ax-calendar [events]="events" [view]="currentView" (eventClick)="showEvent($event)"></ax-calendar>`,
    relatedComponents: ['Scheduler', 'Date Picker'],
  },
  {
    name: 'Gridster',
    selector: 'ax-gridster',
    category: 'advanced',
    description: 'Drag-and-drop dashboard grid layout.',
    inputs: [
      {
        name: 'items',
        type: 'GridsterItem[]',
        description: 'Grid items',
        required: true,
      },
      {
        name: 'options',
        type: 'GridsterOptions',
        description: 'Gridster configuration',
      },
      {
        name: 'editable',
        type: 'boolean',
        default: 'true',
        description: 'Allow editing/dragging',
      },
    ],
    outputs: [
      {
        name: 'itemChange',
        type: 'EventEmitter<GridsterItem[]>',
        description: 'Layout changed',
      },
    ],
    usage: `<ax-gridster [items]="dashboardWidgets" [options]="gridOptions" (itemChange)="saveLayout($event)"></ax-gridster>`,
    relatedComponents: ['Card'],
  },
  {
    name: 'File Upload',
    selector: 'ax-file-upload',
    category: 'advanced',
    description: 'File upload with drag-and-drop and preview.',
    inputs: [
      {
        name: 'accept',
        type: 'string',
        description: 'Accepted file types',
      },
      {
        name: 'multiple',
        type: 'boolean',
        default: 'false',
        description: 'Allow multiple files',
      },
      {
        name: 'maxSize',
        type: 'number',
        description: 'Max file size in bytes',
      },
      {
        name: 'maxFiles',
        type: 'number',
        default: '10',
        description: 'Max number of files',
      },
      {
        name: 'showPreview',
        type: 'boolean',
        default: 'true',
        description: 'Show file previews',
      },
    ],
    outputs: [
      {
        name: 'filesSelected',
        type: 'EventEmitter<File[]>',
        description: 'Files selected',
      },
      {
        name: 'upload',
        type: 'EventEmitter<File>',
        description: 'File uploaded',
      },
      {
        name: 'error',
        type: 'EventEmitter<string>',
        description: 'Upload error',
      },
    ],
    usage: `<ax-file-upload
  accept="image/*,.pdf"
  multiple
  [maxSize]="5242880"
  (filesSelected)="onFilesSelected($event)">
</ax-file-upload>`,
    relatedComponents: ['Avatar'],
  },
  {
    name: 'Drawer',
    selector: 'ax-drawer',
    category: 'overlays',
    description: 'Slide-out panel for secondary content.',
    inputs: [
      {
        name: 'opened',
        type: 'boolean',
        default: 'false',
        description: 'Drawer open state',
      },
      {
        name: 'position',
        type: "'left' | 'right' | 'top' | 'bottom'",
        default: 'right',
        description: 'Drawer position',
      },
      {
        name: 'mode',
        type: "'over' | 'push'",
        default: 'over',
        description: 'Overlay mode',
      },
      {
        name: 'width',
        type: 'string',
        default: '400px',
        description: 'Drawer width',
      },
      {
        name: 'hasBackdrop',
        type: 'boolean',
        default: 'true',
        description: 'Show backdrop',
      },
    ],
    outputs: [
      {
        name: 'openedChange',
        type: 'EventEmitter<boolean>',
        description: 'Open state changed',
      },
    ],
    usage: `<ax-drawer [(opened)]="drawerOpen" position="right" width="500px">
  <h2>Drawer Title</h2>
  <p>Drawer content...</p>
</ax-drawer>`,
    relatedComponents: ['Dialog Service'],
  },
  {
    name: 'Theme Builder',
    selector: 'ax-theme-builder',
    category: 'advanced',
    description: 'Visual theme customization tool.',
    inputs: [
      {
        name: 'theme',
        type: 'ThemeConfig',
        description: 'Current theme configuration',
      },
      {
        name: 'presets',
        type: 'ThemePreset[]',
        description: 'Available presets',
      },
    ],
    outputs: [
      {
        name: 'themeChange',
        type: 'EventEmitter<ThemeConfig>',
        description: 'Theme changed',
      },
      {
        name: 'save',
        type: 'EventEmitter<ThemeConfig>',
        description: 'Theme saved',
      },
    ],
    usage: `<ax-theme-builder [theme]="currentTheme" (save)="saveTheme($event)"></ax-theme-builder>`,
    relatedComponents: ['Theme Switcher'],
  },
  {
    name: 'Theme Switcher',
    selector: 'ax-theme-switcher',
    category: 'advanced',
    description: 'Quick theme/dark mode toggle.',
    inputs: [
      {
        name: 'themes',
        type: 'string[]',
        description: 'Available theme names',
      },
      {
        name: 'showDarkMode',
        type: 'boolean',
        default: 'true',
        description: 'Show dark mode toggle',
      },
    ],
    outputs: [
      {
        name: 'themeChange',
        type: 'EventEmitter<string>',
        description: 'Theme selected',
      },
    ],
    usage: `<ax-theme-switcher [themes]="['default', 'purple', 'teal']" showDarkMode></ax-theme-switcher>`,
    relatedComponents: ['Theme Builder'],
  },
  {
    name: 'Code Tabs',
    selector: 'ax-code-tabs',
    category: 'advanced',
    description: 'Tabbed code snippets with syntax highlighting.',
    inputs: [
      {
        name: 'tabs',
        type: 'CodeTab[]',
        description: 'Code tabs with language and content',
        required: true,
      },
      {
        name: 'showCopy',
        type: 'boolean',
        default: 'true',
        description: 'Show copy button',
      },
    ],
    outputs: [
      {
        name: 'copy',
        type: 'EventEmitter<string>',
        description: 'Code copied',
      },
    ],
    usage: `<ax-code-tabs [tabs]="[
  { label: 'TypeScript', language: 'typescript', code: '...' },
  { label: 'HTML', language: 'html', code: '...' }
]"></ax-code-tabs>`,
    relatedComponents: [],
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
