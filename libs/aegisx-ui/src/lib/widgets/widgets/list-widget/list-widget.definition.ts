import { WidgetDefinition } from '../../core/widget.types';
import { ListWidgetComponent } from './list-widget.component';
import { LIST_WIDGET_DEFAULTS } from './list-widget.types';

export const LIST_WIDGET_DEFINITION: WidgetDefinition = {
  id: 'ax-list-widget',
  name: 'List',
  description: 'Display a list of items with icons and status',
  icon: 'list',
  category: 'data',
  status: 'stable',
  component: ListWidgetComponent,
  sizes: {
    minSize: { cols: 1, rows: 2 },
    maxSize: { cols: 2, rows: 4 },
    defaultSize: { cols: 1, rows: 2 },
  },
  defaultConfig: LIST_WIDGET_DEFAULTS,
  tags: ['list', 'items', 'activity', 'feed'],
};
