import { InjectionToken } from '@angular/core';
import { WidgetDataProvider } from '../providers/data.provider';
import { WidgetStorageProvider } from '../providers/storage.provider';
import { WidgetRealtimeProvider } from '../providers/realtime.provider';
import { WidgetRegistry } from './widget-registry';

/**
 * Injection token for widget data provider.
 * Applications must provide an implementation.
 *
 * @example
 * ```typescript
 * providers: [
 *   { provide: WIDGET_DATA_PROVIDER, useClass: MyApiDataProvider }
 * ]
 * ```
 */
export const WIDGET_DATA_PROVIDER = new InjectionToken<WidgetDataProvider>(
  'WIDGET_DATA_PROVIDER',
);

/**
 * Injection token for dashboard storage provider.
 * Optional - defaults to LocalStorageProvider if not provided.
 */
export const WIDGET_STORAGE_PROVIDER =
  new InjectionToken<WidgetStorageProvider>('WIDGET_STORAGE_PROVIDER');

/**
 * Injection token for realtime data provider.
 * Optional - defaults to NoopRealtimeProvider if not provided.
 */
export const WIDGET_REALTIME_PROVIDER =
  new InjectionToken<WidgetRealtimeProvider>('WIDGET_REALTIME_PROVIDER');

/**
 * Injection token for widget registry.
 * Contains all registered widget definitions.
 */
export const WIDGET_REGISTRY = new InjectionToken<WidgetRegistry>(
  'WIDGET_REGISTRY',
);
