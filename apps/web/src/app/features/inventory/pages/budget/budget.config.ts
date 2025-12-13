import { LauncherApp } from '@aegisx/ui';

/**
 * Budget Section Configuration
 *
 * This file contains the configuration for Budget modules
 * displayed in the ax-launcher component.
 *
 * NOTE: CRUD generator will auto-register new modules here when using --section budget
 */

/**
 * Section Items
 *
 * Each item represents a CRUD module accessible from the launcher.
 * Generator will auto-add entries when using: --shell inventory --section budget
 *
 * Available colors: 'pink', 'peach', 'mint', 'blue', 'yellow', 'lavender', 'cyan', 'rose', 'neutral', 'white'
 */
export const SECTION_ITEMS: LauncherApp[] = [
  // === AUTO-GENERATED ENTRIES START ===
  {
    id: 'budget-requests',
    name: 'Budget Requests',
    description: 'Manage budget requests data',
    icon: 'description',
    route: '/inventory/budget/budget-requests',
    color: 'cyan',
    status: 'active',
    enabled: true,
  },

  // CRUD modules will be auto-registered here by the generator
  // === AUTO-GENERATED ENTRIES END ===
];
