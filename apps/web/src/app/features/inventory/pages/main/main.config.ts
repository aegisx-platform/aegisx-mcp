import { LauncherApp } from '@aegisx/ui';

/**
 * Inventory Module Configuration
 *
 * This file contains the configuration for modules
 * displayed in the ax-launcher component on the main page.
 *
 * NOTE: CRUD generator will auto-register new modules here when using --shell option.
 * Generator looks for the MODULE_ITEMS array and appends new entries.
 */

/**
 * Module Items
 *
 * Each item represents a CRUD module accessible from the launcher.
 * Generator will auto-add entries when using: --shell inventory
 *
 * Available colors: 'pink', 'peach', 'mint', 'blue', 'yellow', 'lavender', 'cyan', 'rose', 'neutral', 'white'
 */
export const MODULE_ITEMS: LauncherApp[] = [
  // === AUTO-GENERATED ENTRIES START ===
  {
    id: 'master-data',
    name: 'Master Data',
    description: 'Master data modules',
    icon: 'database',
    route: '/inventory/master-data',
    color: 'mint',
    status: 'active',
    enabled: true,
    featured: true,
  },
  {
    id: 'budget',
    name: 'Budget',
    description: 'Budget modules',
    icon: 'attach_money',
    route: '/inventory/budget',
    color: 'blue',
    status: 'active',
    enabled: true,
  },
  // CRUD modules will be auto-registered here by the generator
  // === AUTO-GENERATED ENTRIES END ===
];
