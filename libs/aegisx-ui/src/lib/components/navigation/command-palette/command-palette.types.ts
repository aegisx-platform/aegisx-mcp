/**
 * Command Palette Types
 *
 * Type definitions for the command palette component.
 */

/**
 * Command item that can be executed from the palette.
 *
 * Represents an actionable item in the command palette that users can search for and execute.
 * Commands can navigate to routes, trigger callbacks, or open external URLs.
 *
 * @example
 * ```typescript
 * const navigateCommand: CommandItem = {
 *   id: 'nav-dashboard',
 *   label: 'Go to Dashboard',
 *   description: 'Navigate to the main dashboard',
 *   icon: 'dashboard',
 *   shortcut: '⌘D',
 *   category: 'Navigation',
 *   routerLink: '/dashboard'
 * };
 *
 * const actionCommand: CommandItem = {
 *   id: 'create-user',
 *   label: 'Create New User',
 *   icon: 'person_add',
 *   category: 'Actions',
 *   action: () => openCreateUserDialog()
 * };
 * ```
 */
export interface CommandItem {
  /** Unique identifier for the command */
  id: string;

  /** Display label for the command */
  label: string;

  /** Optional description */
  description?: string;

  /** Material icon name */
  icon?: string;

  /** Keyboard shortcut hint (e.g., "⌘N", "Ctrl+S") */
  shortcut?: string;

  /** Category/group for organizing commands */
  category?: string;

  /** Keywords for search matching */
  keywords?: string[];

  /** Whether the command is disabled */
  disabled?: boolean;

  /** Action to execute - can be a route or callback */
  action?: string | (() => void);

  /** Router link for navigation commands */
  routerLink?: string | string[];

  /** External URL */
  href?: string;

  /** Nested commands (for submenus) */
  children?: CommandItem[];

  /** Custom data */
  data?: unknown;
}

/**
 * Command group for organizing commands
 */
export interface CommandGroup {
  /** Group identifier */
  id: string;

  /** Group label */
  label: string;

  /** Commands in this group */
  commands: CommandItem[];

  /** Priority for ordering (higher = first) */
  priority?: number;
}

/**
 * Command palette configuration options.
 *
 * Configures the behavior and appearance of the command palette.
 *
 * @example
 * ```typescript
 * const config: CommandPaletteConfig = {
 *   placeholder: 'Search commands...',
 *   emptyMessage: 'No commands found',
 *   maxRecentCommands: 5,
 *   showRecent: true,
 *   showShortcuts: true,
 *   hotkey: 'k',
 *   useMetaKey: true,
 *   searchDebounce: 150,
 *   maxHeight: '400px'
 * };
 * ```
 */
export interface CommandPaletteConfig {
  /** Placeholder text in search input */
  placeholder?: string;

  /** Empty state message when no results */
  emptyMessage?: string;

  /** Maximum number of recent commands to show */
  maxRecentCommands?: number;

  /** Whether to show recent commands section */
  showRecent?: boolean;

  /** Whether to show keyboard shortcuts */
  showShortcuts?: boolean;

  /** Custom hotkey (default: 'k') */
  hotkey?: string;

  /** Whether to use Cmd on Mac and Ctrl on Windows */
  useMetaKey?: boolean;

  /** Debounce time for search in ms */
  searchDebounce?: number;

  /** Maximum height of the results list */
  maxHeight?: string;

  /** Animation duration in ms */
  animationDuration?: number;
}

/**
 * Search result with highlighted matches
 */
export interface CommandSearchResult {
  item: CommandItem;
  score: number;
  matches?: {
    field: string;
    indices: [number, number][];
  }[];
}

/**
 * Command palette state
 */
export interface CommandPaletteState {
  isOpen: boolean;
  searchQuery: string;
  selectedIndex: number;
  results: CommandSearchResult[];
  recentCommands: CommandItem[];
  isLoading: boolean;
}

/**
 * Event emitted when a command is executed
 */
export interface CommandExecutedEvent {
  command: CommandItem;
  timestamp: Date;
}
