import {
  Component,
  Input,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';

// Import the existing material demo component
import { MaterialDemoComponent } from '../../material-demo/material-demo.component';
import {
  ShowcaseDataService,
  ComponentExample,
} from '../services/showcase-data.service';
import { CodeViewerComponent } from '../shared/code-viewer.component';
import { ComponentPreviewComponent } from '../shared/component-preview.component';

interface MaterialSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  components: ComponentExample[];
  expanded?: boolean;
}

@Component({
  selector: 'app-material-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatButtonToggleModule,
    MaterialDemoComponent,
    CodeViewerComponent,
    ComponentPreviewComponent,
  ],
  template: `
    <div class="material-section">
      <!-- Section Toggle -->
      <div class="section-toggle">
        <mat-button-toggle-group [(value)]="viewMode" class="view-toggle">
          <mat-button-toggle value="enhanced">
            <mat-icon>view_module</mat-icon>
            Enhanced View
          </mat-button-toggle>
          <mat-button-toggle value="original">
            <mat-icon>view_list</mat-icon>
            Original Demo
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <!-- Enhanced View -->
      <div *ngIf="viewMode() === 'enhanced'" class="enhanced-view">
        <!-- Embedded Material Demo (Full showcase) -->
        <div class="embedded-demo">
          <div class="demo-header">
            <h3>
              <mat-icon>palette</mat-icon>
              Complete Material Design Components Demo
            </h3>
            <p class="demo-description">
              This section displays all Angular Material components with various
              sizes, styles, and configurations. The demo includes form utility
              classes (.form-xs, .form-compact, .form-standard, .form-lg) and
              comprehensive examples of every Material component.
            </p>
          </div>

          <!-- Embedded Material Demo Component -->
          <div class="material-demo-embedded">
            <app-material-demo></app-material-demo>
          </div>
        </div>

        <!-- Search Results (if searching) -->
        <div
          *ngIf="searchQuery && filteredComponents().length > 0"
          class="search-results"
        >
          <h3 class="search-title">
            <mat-icon>search</mat-icon>
            Search Results for "{{ searchQuery }}" ({{
              filteredComponents().length
            }})
          </h3>

          <div class="component-grid">
            <mat-card
              *ngFor="let component of filteredComponents()"
              class="component-card"
            >
              <mat-card-header>
                <mat-card-title>{{ component.name }}</mat-card-title>
                <mat-card-subtitle>{{ component.source }}</mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <p>{{ component.description }}</p>

                <!-- Tags -->
                <div class="component-tags">
                  <mat-chip *ngFor="let tag of component.tags" class="tag-chip">
                    {{ tag }}
                  </mat-chip>
                </div>

                <!-- Complexity & Features -->
                <div class="component-features">
                  <mat-chip
                    [color]="getComplexityColor(component.complexity)"
                    class="complexity-chip"
                  >
                    {{ component.complexity }} complexity
                  </mat-chip>

                  <mat-chip *ngIf="component.responsive" class="feature-chip">
                    <mat-icon>phone_android</mat-icon>
                    Responsive
                  </mat-chip>

                  <mat-chip
                    *ngIf="component.accessibility"
                    class="feature-chip"
                  >
                    <mat-icon>accessibility</mat-icon>
                    A11y
                  </mat-chip>

                  <mat-chip *ngIf="component.liveDemo" class="feature-chip">
                    <mat-icon>play_circle</mat-icon>
                    Live Demo
                  </mat-chip>
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button (click)="scrollToComponent(component.id)">
                  <mat-icon>visibility</mat-icon>
                  View Demo
                </button>
                <button
                  mat-button
                  *ngIf="component.codeExample"
                  (click)="showCode(component)"
                >
                  <mat-icon>code</mat-icon>
                  View Code
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>

        <!-- No Results -->
        <div
          *ngIf="searchQuery && filteredComponents().length === 0"
          class="no-results"
        >
          <mat-icon>search_off</mat-icon>
          <h3>No components found</h3>
          <p>Try searching with different keywords or browse all components.</p>
          <button mat-raised-button color="primary" (click)="clearSearch()">
            Browse All Components
          </button>
        </div>
      </div>

      <!-- Original Material Demo -->
      <div *ngIf="viewMode() === 'original'" class="original-view">
        <div class="original-demo-wrapper">
          <app-material-demo></app-material-demo>
        </div>
      </div>

      <!-- Code Dialog will be handled by parent component -->
    </div>
  `,
  styleUrls: ['./material-section.component.scss'],
})
export class MaterialSectionComponent implements OnInit {
  @Input() searchQuery: string = '';
  @Input() theme: 'light' | 'dark' = 'light';

  private showcaseDataService = inject(ShowcaseDataService);

  // Signals
  viewMode = signal<'enhanced' | 'original'>('enhanced');
  components = signal<ComponentExample[]>([]);
  loading = signal(false);

  // Computed properties
  filteredComponents = computed(() => {
    if (!this.searchQuery) return [];

    return this.components().filter(
      (component) =>
        component.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        component.description
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        component.tags.some((tag) =>
          tag.toLowerCase().includes(this.searchQuery.toLowerCase()),
        ),
    );
  });

  materialSections = computed(() => {
    const componentsByCategory = this.groupComponentsByCategory();

    const sections: MaterialSection[] = [
      {
        id: 'form-controls',
        title: 'Form Controls',
        description: 'Input fields, selectors, and form-related components',
        icon: 'edit',
        components: componentsByCategory['Form Controls'] || [],
        expanded: true,
      },
      {
        id: 'navigation',
        title: 'Navigation',
        description: 'Navigation bars, menus, and routing components',
        icon: 'navigation',
        components: componentsByCategory['Navigation'] || [],
      },
      {
        id: 'layout',
        title: 'Layout',
        description: 'Cards, lists, and structural components',
        icon: 'view_quilt',
        components: componentsByCategory['Layout'] || [],
      },
      {
        id: 'buttons-indicators',
        title: 'Buttons & Indicators',
        description: 'Action buttons, progress bars, and status indicators',
        icon: 'touch_app',
        components: componentsByCategory['Buttons & Indicators'] || [],
      },
      {
        id: 'data-display',
        title: 'Data Display',
        description: 'Tables, trees, and data presentation components',
        icon: 'table_view',
        components: componentsByCategory['Data Display'] || [],
      },
      {
        id: 'overlays-modals',
        title: 'Overlays & Modals',
        description: 'Dialogs, tooltips, and overlay components',
        icon: 'layers',
        components: componentsByCategory['Overlays & Modals'] || [],
      },
    ];

    return sections.filter((section) => section.components.length > 0);
  });

  ngOnInit() {
    this.loadMaterialComponents();
  }

  private async loadMaterialComponents() {
    this.loading.set(true);

    try {
      await this.showcaseDataService.loadComponentData();
      const materialData = this.showcaseDataService.getCategoryData('material');

      if (materialData) {
        this.components.set(materialData.components);
      }
    } catch (error) {
      console.error('Failed to load Material components:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private groupComponentsByCategory(): Record<string, ComponentExample[]> {
    const grouped: Record<string, ComponentExample[]> = {};

    for (const component of this.components()) {
      if (!grouped[component.category]) {
        grouped[component.category] = [];
      }
      grouped[component.category].push(component);
    }

    return grouped;
  }

  // Event handlers
  getComplexityColor(
    complexity: 'low' | 'medium' | 'high',
  ): 'primary' | 'accent' | 'warn' {
    switch (complexity) {
      case 'low':
        return 'primary';
      case 'medium':
        return 'accent';
      case 'high':
        return 'warn';
    }
  }

  scrollToComponent(componentId: string) {
    const element = document.getElementById('card-' + componentId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      element.classList.add('highlight');
      setTimeout(() => element.classList.remove('highlight'), 2000);
    }
  }

  showInOriginalDemo(componentId: string) {
    // Switch to original demo and scroll to component
    this.viewMode.set('original');

    // Give the view a moment to render, then scroll
    setTimeout(() => {
      const element = document.querySelector(
        `[data-component-id="${componentId}"]`,
      );
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  }

  showCode(component: ComponentExample) {
    // This could emit an event to show a code dialog
    // For now, we'll log the code
    if (component.codeExample) {
      console.log('Code for', component.name + ':', component.codeExample);

      // You could implement a MatDialog here to show the code
      // this.dialog.open(CodeDialogComponent, { data: component });
    }
  }

  openDocumentation(url: string) {
    window.open(url, '_blank');
  }

  clearSearch() {
    // Reset search by emitting empty string to parent
    // Since this is @Input, we need to communicate with parent
    // For now, we'll just reset internal state
    this.searchQuery = '';
  }
}
