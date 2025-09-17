import {
  Component,
  Input,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import {
  ShowcaseDataService,
  ComponentExample,
} from '../services/showcase-data.service';
import { CodeViewerComponent } from '../shared/code-viewer.component';
import { ComponentPreviewComponent } from '../shared/component-preview.component';

interface WidgetSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  components: ComponentExample[];
  expanded?: boolean;
}

@Component({
  selector: 'app-widgets-section',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressBarModule,
    CodeViewerComponent,
    ComponentPreviewComponent,
  ],
  template: `
    <div class="widgets-section">
      <!-- Section Header -->
      <div class="section-header">
        <div class="header-content">
          <mat-icon class="section-icon">dashboard</mat-icon>
          <div class="section-info">
            <h2>Application Widgets</h2>
            <p>Dashboard components and custom application widgets</p>
          </div>
        </div>
        <div class="section-stats">
          <div class="stat">
            <span class="stat-number">{{ totalComponents() }}</span>
            <span class="stat-label">Widgets</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ filteredComponents().length }}</span>
            <span class="stat-label">Matches</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="loading">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
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

              <!-- Widget Preview -->
              <div class="widget-preview" *ngIf="component.liveDemo">
                <app-component-preview
                  [componentId]="component.id"
                  [responsive]="component.responsive || false"
                >
                </app-component-preview>
              </div>

              <!-- Coming Soon Notice for widgets without preview -->
              <div *ngIf="!component.liveDemo" class="coming-soon-notice">
                <mat-icon>schedule</mat-icon>
                <span>Widget preview coming soon</span>
              </div>

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
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button (click)="showCode(component)">
                <mat-icon>code</mat-icon>
                View Code
              </button>
              <button mat-button (click)="tryWidget(component)">
                <mat-icon>play_arrow</mat-icon>
                Try Widget
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <!-- Organized Sections -->
      <div *ngIf="!searchQuery && !loading()" class="organized-sections">
        <!-- Widget Categories -->
        <mat-accordion class="sections-accordion" multi>
          <mat-expansion-panel
            *ngFor="let section of widgetSections()"
            [expanded]="section.expanded"
            class="section-panel"
          >
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>{{ section.icon }}</mat-icon>
                {{ section.title }}
                <mat-chip class="count-chip">{{
                  section.components.length
                }}</mat-chip>
              </mat-panel-title>
              <mat-panel-description>
                {{ section.description }}
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="section-content">
              <div class="component-grid">
                <mat-card
                  *ngFor="let component of section.components"
                  class="component-card"
                >
                  <mat-card-header>
                    <mat-card-title>{{ component.name }}</mat-card-title>
                    <mat-card-subtitle>
                      <mat-icon>widgets</mat-icon>
                      {{ component.source }}
                    </mat-card-subtitle>
                  </mat-card-header>

                  <mat-card-content>
                    <p>{{ component.description }}</p>

                    <!-- Widget Preview -->
                    <div class="widget-preview" *ngIf="component.liveDemo">
                      <app-component-preview
                        [componentId]="component.id"
                        [responsive]="component.responsive || false"
                      >
                      </app-component-preview>
                    </div>

                    <!-- Placeholder for widgets without preview -->
                    <div *ngIf="!component.liveDemo" class="widget-placeholder">
                      <mat-icon class="placeholder-icon">dashboard</mat-icon>
                      <p>Widget preview in development</p>
                      <small>{{ component.tags.join(', ') }}</small>
                    </div>

                    <!-- Tags -->
                    <div class="component-tags">
                      <mat-chip
                        *ngFor="let tag of component.tags"
                        class="tag-chip"
                      >
                        {{ tag }}
                      </mat-chip>
                    </div>
                  </mat-card-content>

                  <mat-card-actions>
                    <button mat-button (click)="showCode(component)">
                      <mat-icon>code</mat-icon>
                      Code
                    </button>
                    <button mat-button (click)="tryWidget(component)">
                      <mat-icon>play_arrow</mat-icon>
                      Try
                    </button>
                    <button mat-button (click)="openDocs(component)">
                      <mat-icon>help</mat-icon>
                      Docs
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>
            </div>
          </mat-expansion-panel>
        </mat-accordion>
      </div>

      <!-- No Results -->
      <div
        *ngIf="searchQuery && filteredComponents().length === 0"
        class="no-results"
      >
        <mat-icon>search_off</mat-icon>
        <h3>No widgets found</h3>
        <p>Try searching with different keywords or browse all widgets.</p>
        <button mat-raised-button color="primary" (click)="clearSearch()">
          Browse All Widgets
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .widgets-section {
        padding: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;

        .coming-soon {
          width: 100%;
          max-width: 600px;

          .info-card {
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

            .content-preview {
              text-align: center;

              .main-icon {
                font-size: 4rem;
                width: 4rem;
                height: 4rem;
                margin-bottom: 1rem;
                color: #ccc;
              }

              h3 {
                margin: 0 0 1rem;
                color: #666;
                font-size: 1.5rem;
              }

              p {
                margin: 0 0 1rem;
                color: #777;
                line-height: 1.6;
              }

              ul {
                text-align: left;
                color: #555;
                margin: 1rem 0;

                li {
                  margin-bottom: 0.5rem;
                }
              }
            }

            mat-card-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;

              button mat-icon {
                margin-right: 0.5rem;
              }
            }
          }
        }
      }

      :host-context(.dark-theme) .widgets-section {
        .coming-soon .info-card {
          background-color: #2d2d2d;
          color: #fff;

          .content-preview {
            h3 {
              color: #ccc;
            }

            p {
              color: #aaa;
            }

            ul {
              color: #bbb;
            }

            .main-icon {
              color: #666;
            }
          }
        }
      }
    `,
  ],
})
export class WidgetsSectionComponent implements OnInit {
  @Input() searchQuery: string = '';
  @Input() theme: 'light' | 'dark' = 'light';

  private showcaseDataService = inject(ShowcaseDataService);

  // Signals
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

  totalComponents = computed(() => this.components().length);

  widgetSections = computed(() => {
    const componentsByCategory = this.groupComponentsByCategory();

    const sections: WidgetSection[] = [
      {
        id: 'dashboard-widgets',
        title: 'Dashboard Widgets',
        description: 'Statistics cards, charts, and dashboard components',
        icon: 'dashboard',
        components: componentsByCategory['Dashboard Widgets'] || [],
        expanded: true,
      },
      {
        id: 'feature-components',
        title: 'Feature Components',
        description: 'Application-specific feature components',
        icon: 'extension',
        components: componentsByCategory['Feature Components'] || [],
      },
    ];

    return sections.filter((section) => section.components.length > 0);
  });

  ngOnInit() {
    this.loadWidgetComponents();
  }

  private async loadWidgetComponents() {
    this.loading.set(true);

    try {
      await this.showcaseDataService.loadComponentData();
      const widgetData = this.showcaseDataService.getCategoryData('widgets');

      if (widgetData) {
        this.components.set(widgetData.components);
      }
    } catch (error) {
      console.error('Failed to load widget components:', error);
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

  showCode(component: ComponentExample) {
    console.log('Showing code for widget:', component.name);
    // Implement code display logic
  }

  tryWidget(component: ComponentExample) {
    console.log('Trying widget:', component.name);
    // Implement widget try logic
  }

  openDocs(component: ComponentExample) {
    if (component.documentation) {
      window.open(component.documentation, '_blank');
    }
  }

  clearSearch() {
    console.log('Clear search requested');
    // Emit event to parent to clear search
  }
}
