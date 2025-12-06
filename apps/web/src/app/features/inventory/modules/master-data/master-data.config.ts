import { LauncherApp } from '@aegisx/ui';

/**
 * Master Data Configuration
 *
 * This file contains the configuration for master data modules
 * displayed in the ax-launcher component.
 *
 * NOTE: CRUD generator will auto-register new modules here when using --shell option.
 * Generator looks for the MASTER_DATA_ITEMS array and appends new entries.
 */

/**
 * Master Data Items
 *
 * Each item represents a CRUD module accessible from the launcher.
 * Generator will auto-add entries when using: --shell inventory
 *
 * Available colors: 'pink', 'peach', 'mint', 'blue', 'yellow', 'purple', 'teal', 'red', 'indigo', 'gray'
 */
export const MASTER_DATA_ITEMS: LauncherApp[] = [
  // === AUTO-GENERATED ENTRIES START ===
  {
    id: 'dosage-forms',
    name: 'Dosage Forms',
    description: 'Manage dosage forms data',
    icon: 'description',
    route: '/inventory/dosage-forms',
    color: 'mint',
    status: 'active',
    enabled: true,
  },

  {
    id: 'drugs',
    name: 'Drugs',
    description: 'Manage drug catalog and inventory',
    icon: 'medication',
    route: '/inventory/drugs',
    color: 'blue',
    status: 'active',
    enabled: true,
  },
  // === AUTO-GENERATED ENTRIES END ===
];
