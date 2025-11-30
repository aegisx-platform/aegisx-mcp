import { WidgetDefinition } from '../../core/widget.types';
import { ProgressWidgetComponent } from './progress-widget.component';
import { PROGRESS_WIDGET_DEFAULTS } from './progress-widget.types';

export const PROGRESS_WIDGET_DEFINITION: WidgetDefinition = {
  id: 'ax-progress-widget',
  name: 'Progress',
  description: 'Display progress as circular, linear, or gauge',
  icon: 'donut_large',
  category: 'display',
  status: 'stable',
  component: ProgressWidgetComponent,
  sizes: {
    minSize: { cols: 1, rows: 1 },
    maxSize: { cols: 2, rows: 2 },
    defaultSize: { cols: 1, rows: 1 },
  },
  defaultConfig: PROGRESS_WIDGET_DEFAULTS,
  tags: ['progress', 'gauge', 'meter', 'percentage'],
};
