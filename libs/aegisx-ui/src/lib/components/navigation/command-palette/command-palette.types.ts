/**
 * Command Palette Types
 *
 * Type definitions for the command palette component.
 */

/**
 * Command item that can be executed from the palette
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
 * Command palette configuration
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
