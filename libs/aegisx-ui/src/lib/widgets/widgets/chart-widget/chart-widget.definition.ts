import { WidgetDefinition } from '../../core/widget.types';
import { ChartWidgetComponent } from './chart-widget.component';
import { CHART_WIDGET_DEFAULTS } from './chart-widget.types';

export const CHART_WIDGET_DEFINITION: WidgetDefinition = {
  id: 'ax-chart-widget',
  name: 'Chart',
  description: 'Display data as line, bar, or donut chart',
  icon: 'bar_chart',
  category: 'chart',
  status: 'stable',
  component: ChartWidgetComponent,
  sizes: {
    minSize: { cols: 2, rows: 1 },
    maxSize: { cols: 4, rows: 3 },
    defaultSize: { cols: 2, rows: 2 },
  },
  defaultConfig: CHART_WIDGET_DEFAULTS,
  tags: ['chart', 'graph', 'line', 'bar', 'donut', 'visualization'],
};
