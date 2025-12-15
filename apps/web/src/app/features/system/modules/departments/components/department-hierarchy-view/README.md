# Department Hierarchy View Component

## Overview

The `DepartmentHierarchyViewComponent` displays the department hierarchy as an expandable/collapsible tree structure using Angular Material Tree.

## Requirements Coverage

- **REQ-4 AC 5**: Display hierarchy levels with indentation (24px per level)
- **REQ-4 AC 6**: Call GET /v1/platform/departments/hierarchy
- **REQ-4 AC 7**: Display tree structure with expand/collapse controls

## Features

- ✅ Nested tree structure with parent-child relationships
- ✅ Expand/collapse individual nodes
- ✅ Expand all / Collapse all buttons
- ✅ Department count badges showing total descendants
- ✅ Visual indication of inactive departments (gray color + strikethrough)
- ✅ Click to select department (emits event)
- ✅ Highlights selected department
- ✅ Handles orphaned nodes gracefully (missing parents)
- ✅ Responsive design
- ✅ Loading, error, and empty states
- ✅ Automatic sorting by dept_code

## Usage

### Basic Usage

```typescript
import { DepartmentHierarchyViewComponent } from './components';

@Component({
  template: `
    <app-department-hierarchy-view
      (selectedDepartment)="onDepartmentSelected($event)"
    />
  `
})
export class DepartmentsPageComponent {
  onDepartmentSelected(department: Department): void {
    console.log('Selected:', department);
  }
}
```

### Component API

#### Inputs

None - the component loads data automatically on initialization.

#### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `selectedDepartment` | `EventEmitter<Department>` | Emits when a department node is clicked |

#### Public Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `loadHierarchy()` | - | `Promise<void>` | Reload hierarchy data from API |
| `expandAll()` | - | `void` | Expand all tree nodes |
| `collapseAll()` | - | `void` | Collapse all tree nodes |
| `selectNode(node)` | `DepartmentHierarchyNode` | `void` | Select a specific node |

## Tree Structure

The component transforms flat department data into a hierarchical tree:

```typescript
// API Response (flat)
[
  { id: 1, dept_code: "ROOT", parent_id: null },
  { id: 2, dept_code: "CHILD1", parent_id: 1 },
  { id: 3, dept_code: "CHILD2", parent_id: 1 },
  { id: 4, dept_code: "GRANDCHILD", parent_id: 2 }
]

// Tree Structure (nested)
[
  {
    id: 1,
    dept_code: "ROOT",
    children: [
      {
        id: 2,
        dept_code: "CHILD1",
        children: [
          { id: 4, dept_code: "GRANDCHILD", children: [] }
        ]
      },
      { id: 3, dept_code: "CHILD2", children: [] }
    ]
  }
]
```

## Tree Building Algorithm

The `buildTree()` method uses a three-pass algorithm:

### Pass 1: Create Node Map
- Create all tree nodes from flat department list
- Store in Map for O(1) lookups

### Pass 2: Build Hierarchy
- Iterate through departments
- Link children to parents
- Calculate depth levels
- Handle orphaned nodes (missing parents) by adding them as roots

### Pass 3: Sort Children
- Sort nodes by dept_code at each level
- Ensures consistent display order

### Handling Edge Cases

1. **Orphaned Nodes** (parent_id points to non-existent department)
   - Treated as root nodes
   - Warning logged to console

2. **Circular References** (should not occur with validation)
   - Algorithm naturally handles by using parent_id only once

3. **Empty Data**
   - Shows empty state UI with helpful message

## Visual Features

### Department Count Badge
- Shows total number of descendants
- Blue badge with white text
- Only shown for nodes with children

### Inactive Department Styling
- Gray color with reduced opacity (0.6)
- Strikethrough text decoration
- Warning icon (visibility_off)

### Selected Node Highlighting
- Blue background (#e3f2fd)
- Blue left border (3px)
- Darker blue on hover (#bbdefb)

### Expand/Collapse Icons
- chevron_right: Collapsed node
- expand_more: Expanded node
- Animated transitions

## Performance Considerations

- **Efficient Lookups**: Uses Map for O(1) node lookups during tree building
- **OnPush Change Detection**: Component uses signals for reactive updates
- **Virtual Scrolling**: Not implemented (suitable for <1000 departments)
- **Lazy Loading**: Tree nodes are loaded all at once (suitable for typical department counts)

For very large hierarchies (>1000 departments), consider:
- Implementing virtual scrolling with `cdk-virtual-scroll-viewport`
- Lazy loading child nodes on expand
- Pagination or filtering options

## Styling

### Tree Indentation
- 24px per level (default)
- Reduces to 16px on mobile screens (<768px)

### Custom Styling

Override component styles in parent component:

```scss
::ng-deep app-department-hierarchy-view {
  .tree-children {
    padding-left: 32px; // Custom indentation
  }

  .node-content.node-selected {
    background-color: #ffeb3b; // Custom selection color
  }
}
```

## Accessibility

- Proper ARIA labels on toggle buttons
- Keyboard navigation support (provided by Material Tree)
- Screen reader friendly
- Color contrast compliant

## Error Handling

The component handles errors gracefully:

1. **API Errors**: Shows error message with retry button
2. **Network Failures**: User-friendly error display
3. **Invalid Data**: Orphaned nodes handled as roots

## Testing

### Unit Testing Example

```typescript
describe('DepartmentHierarchyViewComponent', () => {
  it('should build tree from flat department list', () => {
    const departments: Department[] = [
      { id: 1, dept_code: 'ROOT', parent_id: null },
      { id: 2, dept_code: 'CHILD', parent_id: 1 },
    ];

    const tree = component.buildTree(departments);

    expect(tree.length).toBe(1);
    expect(tree[0].children.length).toBe(1);
  });

  it('should handle orphaned nodes', () => {
    const departments: Department[] = [
      { id: 1, dept_code: 'ORPHAN', parent_id: 999 }, // Parent doesn't exist
    ];

    const tree = component.buildTree(departments);

    expect(tree.length).toBe(1); // Treated as root
  });
});
```

## Integration Example

Complete integration with parent component:

```typescript
import { Component, signal } from '@angular/core';
import { DepartmentHierarchyViewComponent } from './components';
import type { Department } from './types/departments-ui.types';

@Component({
  selector: 'app-departments-page',
  standalone: true,
  imports: [DepartmentHierarchyViewComponent],
  template: `
    <div class="departments-page">
      <aside class="hierarchy-sidebar">
        <app-department-hierarchy-view
          (selectedDepartment)="onDepartmentSelected($event)"
        />
      </aside>

      <main class="department-details">
        @if (selectedDept()) {
          <h2>{{ selectedDept()!.dept_name }}</h2>
          <p>Code: {{ selectedDept()!.dept_code }}</p>
          <!-- More details here -->
        } @else {
          <p>Select a department to view details</p>
        }
      </main>
    </div>
  `,
  styles: [`
    .departments-page {
      display: flex;
      gap: 16px;
      height: 100%;
    }

    .hierarchy-sidebar {
      width: 350px;
      flex-shrink: 0;
    }

    .department-details {
      flex: 1;
      padding: 20px;
    }
  `]
})
export class DepartmentsPageComponent {
  selectedDept = signal<Department | null>(null);

  onDepartmentSelected(dept: Department): void {
    this.selectedDept.set(dept);
  }
}
```

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- IE11: ❌ Not supported (uses modern Angular features)

## Dependencies

- `@angular/material` - Material Tree components
- `@angular/cdk` - Tree control utilities
- `@angular/common` - Common Angular directives

## File Structure

```
department-hierarchy-view/
├── department-hierarchy-view.component.ts    # Component logic
├── department-hierarchy-view.component.html  # Template
├── department-hierarchy-view.component.scss  # Styles
└── README.md                                 # This file
```

## Future Enhancements

Potential improvements for future iterations:

1. **Search/Filter**: Search departments within tree
2. **Drag & Drop**: Reorder departments via drag & drop
3. **Context Menu**: Right-click menu for quick actions
4. **Virtual Scrolling**: For very large hierarchies
5. **Lazy Loading**: Load children on-demand
6. **Export**: Export tree structure to CSV/Excel
7. **Multi-Select**: Select multiple departments
8. **Custom Icons**: Different icons per department type
