/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// TODO: Fix TypeScript errors in widget system
import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  Type,
} from '@angular/core';
import {
  WIDGET_DATA_PROVIDER,
  WIDGET_STORAGE_PROVIDER,
  WIDGET_REALTIME_PROVIDER,
  WIDGET_REGISTRY,
} from './core/widget.tokens';
import { WidgetRegistry } from './core/widget-registry';
import { WidgetDefinition } from './core/widget.types';
import { WidgetDataProvider } from './providers/data.provider';
import { WidgetStorageProvider } from './providers/storage.provider';
import { WidgetRealtimeProvider } from './providers/realtime.provider';
import { LocalStorageProvider } from './providers/defaults/local-storage.provider';
import { NoopRealtimeProvider } from './providers/defaults/noop-realtime.provider';
import { BUILTIN_WIDGET_DEFINITIONS } from './widgets';

/**
 * Configuration for widget framework
 */
export interface WidgetFrameworkConfig {
  /**
   * Data provider implementation (required).
   * Handles fetching data from API.
   */
  dataProvider: Type<WidgetDataProvider>;

  /**
   * Storage provider implementation (optional).
   * Defaults to LocalStorageProvider.
   */
  storageProvider?: Type<WidgetStorageProvider>;

  /**
   * Realtime provider implementation (optional).
   * Defaults to NoopRealtimeProvider.
   */
  realtimeProvider?: Type<WidgetRealtimeProvider>;

  /**
   * Custom widgets to register (optional).
   * Built-in widgets are always included.
   */
  widgets?: WidgetDefinition[];
}

/**
 * Built-in widgets that are always available.
 */
export const BUILTIN_WIDGETS: WidgetDefinition[] = BUILTIN_WIDGET_DEFINITIONS;

/**
 * Provide widget framework with configuration.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * import { provideWidgetFramework } from '@AegisX/aegisx-ui/widgets';
 * import { MyDataProvider } from './providers/data.provider';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideWidgetFramework({
 *       dataProvider: MyDataProvider,
 *       widgets: [MyCustomWidget],
 *     })
 *   ]
 * };
 * ```
 */
export function provideWidgetFramework(
  config: WidgetFrameworkConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Data provider (required)
    { provide: WIDGET_DATA_PROVIDER, useClass: config.dataProvider },

    // Storage provider (optional, defaults to localStorage)
    {
      provide: WIDGET_STORAGE_PROVIDER,
      useClass: config.storageProvider ?? LocalStorageProvider,
    },

    // Realtime provider (optional, defaults to noop)
    {
      provide: WIDGET_REALTIME_PROVIDER,
      useClass: config.realtimeProvider ?? NoopRealtimeProvider,
    },

    // Widget registry
    {
      provide: WIDGET_REGISTRY,
      useFactory: () => {
        const registry = new WidgetRegistry();

        // Register built-in widgets
        BUILTIN_WIDGETS.forEach((w) => registry.register(w));

        // Register custom widgets
        config.widgets?.forEach((w) => registry.register(w));

        return registry;
      },
    },
  ]);
}

/**
 * Provide widget framework with mock data for demos/testing.
 *
 * @example
 * ```typescript
 * // For demos or testing
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideWidgetFrameworkMock()
 *   ]
 * };
 * ```
 */
export function provideWidgetFrameworkMock(): EnvironmentProviders {
  // Import dynamically to allow tree-shaking
  const {
    MockDataProvider,
  } = require('./providers/defaults/mock-data.provider');

  return makeEnvironmentProviders([
    { provide: WIDGET_DATA_PROVIDER, useClass: MockDataProvider },
    { provide: WIDGET_STORAGE_PROVIDER, useClass: LocalStorageProvider },
    { provide: WIDGET_REALTIME_PROVIDER, useClass: NoopRealtimeProvider },
    {
      provide: WIDGET_REGISTRY,
      useFactory: () => {
        const registry = new WidgetRegistry();
        BUILTIN_WIDGETS.forEach((w) => registry.register(w));
        return registry;
      },
    },
  ]);
}
