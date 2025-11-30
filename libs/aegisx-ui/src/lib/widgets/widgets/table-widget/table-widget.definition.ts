import { WidgetDefinition } from '../../core/widget.types';
import { TableWidgetComponent } from './table-widget.component';
import { TABLE_WIDGET_DEFAULTS } from './table-widget.types';

export const TABLE_WIDGET_DEFINITION: WidgetDefinition = {
  id: 'ax-table-widget',
  name: 'Data Table',
  description: 'Display tabular data with sorting and pagination',
  icon: 'table_chart',
  category: 'data',
  status: 'stable',
  component: TableWidgetComponent,
  sizes: {
    minSize: { cols: 2, rows: 2 },
    maxSize: { cols: 4, rows: 4 },
    defaultSize: { cols: 3, rows: 2 },
  },
  defaultConfig: TABLE_WIDGET_DEFAULTS,
  tags: ['table', 'data', 'grid', 'list'],
};
