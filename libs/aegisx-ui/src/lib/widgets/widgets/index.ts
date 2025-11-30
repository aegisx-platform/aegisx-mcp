// Widget exports
export * from './kpi-widget';
export * from './chart-widget';
export * from './table-widget';
export * from './list-widget';
export * from './progress-widget';

// Built-in widget definitions
import { KPI_WIDGET_DEFINITION } from './kpi-widget';
import { CHART_WIDGET_DEFINITION } from './chart-widget';
import { TABLE_WIDGET_DEFINITION } from './table-widget';
import { LIST_WIDGET_DEFINITION } from './list-widget';
import { PROGRESS_WIDGET_DEFINITION } from './progress-widget';
import { WidgetDefinition } from '../core/widget.types';

/**
 * All built-in widget definitions
 */
export const BUILTIN_WIDGET_DEFINITIONS: WidgetDefinition[] = [
  KPI_WIDGET_DEFINITION,
  CHART_WIDGET_DEFINITION,
  TABLE_WIDGET_DEFINITION,
  LIST_WIDGET_DEFINITION,
  PROGRESS_WIDGET_DEFINITION,
];
