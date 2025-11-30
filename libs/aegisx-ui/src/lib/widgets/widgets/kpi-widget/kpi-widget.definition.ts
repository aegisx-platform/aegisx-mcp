import { WidgetDefinition } from '../../core/widget.types';
import { KpiWidgetComponent } from './kpi-widget.component';
import { KPI_WIDGET_DEFAULTS } from './kpi-widget.types';

export const KPI_WIDGET_DEFINITION: WidgetDefinition = {
  id: 'ax-kpi-widget',
  name: 'KPI Card',
  description: 'Display a key performance indicator with value and trend',
  icon: 'insights',
  category: 'display',
  status: 'stable',
  component: KpiWidgetComponent,
  sizes: {
    minSize: { cols: 1, rows: 1 },
    maxSize: { cols: 2, rows: 2 },
    defaultSize: { cols: 1, rows: 1 },
  },
  defaultConfig: KPI_WIDGET_DEFAULTS,
  tags: ['kpi', 'metric', 'stats', 'number'],
};
