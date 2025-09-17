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

interface DemoSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  components: ComponentExample[];
  expanded?: boolean;
}

@Component({
  selector: 'app-interactive-demos',
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
    <div class="interactive-demos-section">
      <!-- Section Header -->
      <div class="section-header">
        <div class="header-content">
          <mat-icon class="section-icon">play_circle</mat-icon>
          <div class="section-info">
            <h2>Interactive Demos</h2>
            <p>Real-world usage examples and complex interactions</p>
          </div>
        </div>
        <div class="section-stats">
          <div class="stat">
            <span class="stat-number">{{ totalComponents() }}</span>
            <span class="stat-label">Demos</span>
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
            class="demo-card"
          >
            <mat-card-header>
              <mat-card-title>{{ component.name }}</mat-card-title>
              <mat-card-subtitle>{{ component.source }}</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <p>{{ component.description }}</p>

              <!-- Demo Preview -->
              <div class="demo-preview" *ngIf="component.liveDemo">
                <app-component-preview
                  [componentId]="component.id"
                  [responsive]="component.responsive || false"
                >
                </app-component-preview>
              </div>

              <!-- Coming Soon Notice for demos without preview -->
              <div *ngIf="!component.liveDemo" class="coming-soon-notice">
                <mat-icon>schedule</mat-icon>
                <span>Demo preview coming soon</span>
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

                <mat-chip *ngIf="component.accessibility" class="feature-chip">
                  <mat-icon>accessibility</mat-icon>
                  A11y
                </mat-chip>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button (click)="showCode(component)">
                <mat-icon>code</mat-icon>
                View Code
              </button>
              <button
                mat-raised-button
                color="primary"
                (click)="tryDemo(component)"
              >
                <mat-icon>play_arrow</mat-icon>
                Try Demo
              </button>
              <button mat-button (click)="openInStackBlitz(component)">
                <mat-icon>open_in_new</mat-icon>
                StackBlitz
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <!-- Organized Sections -->
      <div *ngIf="!searchQuery && !loading()" class="organized-sections">
        <!-- Demo Categories -->
        <mat-accordion class="sections-accordion" multi>
          <mat-expansion-panel
            *ngFor="let section of demoSections()"
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
                  class="demo-card"
                >
                  <mat-card-header>
                    <mat-card-title>{{ component.name }}</mat-card-title>
                    <mat-card-subtitle>
                      <mat-icon>code</mat-icon>
                      {{ component.source }}
                    </mat-card-subtitle>
                  </mat-card-header>

                  <mat-card-content>
                    <p>{{ component.description }}</p>

                    <!-- Demo Preview -->
                    <div class="demo-preview" *ngIf="component.liveDemo">
                      <app-component-preview
                        [componentId]="component.id"
                        [responsive]="component.responsive || false"
                      >
                      </app-component-preview>
                    </div>

                    <!-- Placeholder for demos without preview -->
                    <div *ngIf="!component.liveDemo" class="demo-placeholder">
                      <mat-icon class="placeholder-icon"
                        >play_circle_outline</mat-icon
                      >
                      <h4>Interactive Demo</h4>
                      <p>Full demo experience in development</p>
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
                    <button
                      mat-raised-button
                      color="primary"
                      (click)="tryDemo(component)"
                    >
                      <mat-icon>play_arrow</mat-icon>
                      Try
                    </button>
                    <button mat-button (click)="openInStackBlitz(component)">
                      <mat-icon>open_in_new</mat-icon>
                      StackBlitz
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
        <h3>No demos found</h3>
        <p>Try searching with different keywords or browse all demos.</p>
        <button mat-raised-button color="primary" (click)="clearSearch()">
          Browse All Demos
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./interactive-demos.component.scss'],
})
export class InteractiveDemosComponent implements OnInit {
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

  demoSections = computed(() => {
    const componentsByCategory = this.groupComponentsByCategory();

    const sections: DemoSection[] = [
      {
        id: 'form-workflows',
        title: 'Form Workflows',
        description: 'Complete form examples with validation and user flows',
        icon: 'assignment',
        components: componentsByCategory['Form Workflows'] || [],
        expanded: true,
      },
      {
        id: 'dashboard-examples',
        title: 'Dashboard Examples',
        description: 'Full dashboard implementations with real data',
        icon: 'analytics',
        components: componentsByCategory['Dashboard Examples'] || [],
      },
      {
        id: 'ui-patterns',
        title: 'UI Patterns',
        description: 'Common UI patterns and complex interactions',
        icon: 'pattern',
        components: componentsByCategory['UI Patterns'] || [],
      },
    ];

    return sections.filter((section) => section.components.length > 0);
  });

  ngOnInit() {
    this.loadInteractiveDemos();
  }

  private async loadInteractiveDemos() {
    this.loading.set(true);

    try {
      await this.showcaseDataService.loadComponentData();
      const demoData = this.showcaseDataService.getCategoryData('demos');

      if (demoData) {
        this.components.set(demoData.components);
      }
    } catch (error) {
      console.error('Failed to load interactive demos:', error);
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
    console.log('Showing code for demo:', component.name);
  }

  tryDemo(component: ComponentExample) {
    console.log('Trying demo:', component.name);
  }

  openInStackBlitz(component: ComponentExample) {
    console.log('Opening demo in StackBlitz:', component.name);
  }

  clearSearch() {
    console.log('Clear search requested');
  }
}
