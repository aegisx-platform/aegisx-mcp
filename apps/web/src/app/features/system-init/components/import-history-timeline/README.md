# Import History Timeline Component

A comprehensive Angular component for displaying import operation history with real-time status tracking, filtering, and action capabilities.

## Features

- **Timeline Visualization**: Chronological display of import operations with visual indicators
- **Status Colors**: Color-coded status badges (Completed: Green, In Progress: Blue, Failed: Red)
- **Smart Filters**: Filter by module, status, and date range
- **Action Buttons**: View details, rollback (completed), retry (failed)
- **Relative Time Display**: Shows both relative ("2 hours ago") and absolute timestamps
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA attributes
- **Performance**: OnPush change detection, trackBy optimization
- **Empty States**: Clear messaging for no data and no search results

## Component API

### Inputs

```typescript
@Input() history: ImportHistoryItem[] = [];
@Input() maxItems: number = 10;
```

- `history`: Array of import history items to display
- `maxItems`: Maximum items to display before showing "Load More" button

### Outputs

```typescript
@Output() viewDetails = new EventEmitter<ImportHistoryItem>();
@Output() rollback = new EventEmitter<ImportHistoryItem>();
@Output() retry = new EventEmitter<ImportHistoryItem>();
@Output() loadMore = new EventEmitter<void>();
```

- `viewDetails`: Emitted when user clicks "View Details"
- `rollback`: Emitted when user clicks "Rollback" (completed imports only)
- `retry`: Emitted when user clicks "Retry" (failed/cancelled imports only)
- `loadMore`: Emitted when user clicks "Load More"

## Usage Example

### TypeScript

```typescript
import { ImportHistoryTimelineComponent } from './import-history-timeline.component';
import { ImportHistoryItem } from '../../types/system-init.types';

@Component({
  selector: 'app-system-init-dashboard',
  standalone: true,
  imports: [ImportHistoryTimelineComponent],
})
export class SystemInitDashboardComponent {
  importHistory = signal<ImportHistoryItem[]>([]);
  maxHistoryItems = 10;

  constructor(private systemInitService: SystemInitService) {}

  ngOnInit() {
    this.loadImportHistory();
  }

  private loadImportHistory() {
    this.systemInitService.getDashboard().subscribe(dashboard => {
      this.importHistory.set(dashboard.recentImports);
    });
  }

  onViewDetails(item: ImportHistoryItem) {
    // Handle view details
    console.log('View details for:', item);
  }

  onRollback(item: ImportHistoryItem) {
    // Handle rollback
    this.systemInitService.rollbackImport(item.module, item.jobId).subscribe(
      () => {
        this.loadImportHistory(); // Refresh list
      }
    );
  }

  onRetry(item: ImportHistoryItem) {
    // Handle retry
    console.log('Retry import:', item);
  }

  onLoadMore() {
    // Handle load more
    this.maxHistoryItems += 10;
  }
}
```

### Template

```html
<app-import-history-timeline
  [history]="importHistory()"
  [maxItems]="maxHistoryItems"
  (viewDetails)="onViewDetails($event)"
  (rollback)="onRollback($event)"
  (retry)="onRetry($event)"
  (loadMore)="onLoadMore()"
></app-import-history-timeline>
```

## Data Structure

The component expects `ImportHistoryItem` objects with the following structure:

```typescript
interface ImportHistoryItem {
  jobId: string;                    // Unique job identifier
  module: string;                   // Module name (e.g., 'departments')
  status: ImportJobStatus;          // 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  recordsImported: number;          // Number of records imported
  completedAt: string;              // ISO date string
  importedBy: {
    id: string;                     // User ID
    name: string;                   // User name
  };
  error?: string;                   // Error message (for failed imports)
}
```

## Styling

The component uses:
- **Angular Material** components (mat-button, mat-select, mat-chip, etc.)
- **AegisX UI** card component (ax-card)
- **TailwindCSS** utility classes (through Angular Material theming)
- **SCSS** for custom timeline styling

### CSS Classes

- `.import-history-timeline`: Root container
- `.timeline-header`: Title and subtitle section
- `.filters-card`: Filter controls container
- `.timeline-items`: Timeline items container
- `.timeline-item`: Individual import history item
- `.status-completed`: Green status indicator
- `.status-in-progress`: Blue status indicator (pulsing animation)
- `.status-failed`: Red status indicator

## Responsive Behavior

| Breakpoint | Behavior |
|-----------|----------|
| Desktop (>1024px) | 2-column filter layout, full action buttons |
| Tablet (768-1024px) | Wrapped filters, compact display |
| Mobile (<768px) | Single-column filters, stacked action buttons |

## Accessibility Features

- **ARIA Labels**: All interactive elements have descriptive labels
- **Keyboard Navigation**: Full keyboard support (Tab, Enter, Space)
- **Screen Reader Support**: Semantic HTML and proper ARIA attributes
- **Focus Management**: Clear focus indicators for keyboard navigation
- **Color Contrast**: WCAG AA compliant color combinations
- **Reduced Motion**: Respects `prefers-reduced-motion` media query
- **High Contrast**: Enhanced borders and text weight in high contrast mode

## Performance Optimizations

1. **OnPush Change Detection**: Component only updates when inputs change
2. **TrackBy Function**: Optimized ngFor with trackBy for efficient rendering
3. **Computed Signals**: Efficient reactive filtering and filtering
4. **Lazy Rendering**: Load More functionality prevents rendering too many items
5. **Memoization**: Date formatting calculations are cached via signals

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Dependencies

- @angular/core
- @angular/common
- @angular/forms
- @angular/material
- @aegisx/ui
- rxjs

## Testing

Example unit test structure:

```typescript
describe('ImportHistoryTimelineComponent', () => {
  let component: ImportHistoryTimelineComponent;
  let fixture: ComponentFixture<ImportHistoryTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportHistoryTimelineComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportHistoryTimelineComponent);
    component = fixture.componentInstance;
  });

  it('should filter history by module', () => {
    component.history = mockImportHistory;
    component.selectedModuleFilter.set('departments');

    expect(component.filteredHistory().every(item => item.module === 'departments')).toBe(true);
  });

  it('should emit viewDetails when button clicked', (done) => {
    const item = mockImportHistory[0];
    component.viewDetails.subscribe(emitted => {
      expect(emitted).toEqual(item);
      done();
    });

    component.onViewDetails(item);
  });

  it('should show rollback button only for completed imports', () => {
    const completedItem = { ...mockItem, status: 'completed' };
    expect(component.canRollback(completedItem)).toBe(true);

    const failedItem = { ...mockItem, status: 'failed' };
    expect(component.canRollback(failedItem)).toBe(false);
  });
});
```

## Future Enhancements

- [ ] Export history as CSV/Excel
- [ ] WebSocket real-time updates
- [ ] Advanced date range picker
- [ ] Batch actions (multi-select rollback)
- [ ] Detailed error reports with file downloads
- [ ] Import statistics dashboard
- [ ] Dark mode support (automatic detection)
- [ ] Pagination instead of load more
- [ ] Search within history items
- [ ] Audit trail integration

## Related Components

- `SystemInitDashboardComponent`: Main dashboard page
- `ImportWizardDialog`: Import operation wizard
- `ProgressTrackerComponent`: Real-time import progress display
- `ValidationResultsComponent`: Validation error/warning display

## License

Part of AegisX Platform - Enterprise Edition
