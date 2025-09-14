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

import {
  ShowcaseDataService,
  ComponentExample,
} from '../services/showcase-data.service';
import { CodeViewerComponent } from '../shared/code-viewer.component';
import { ComponentPreviewComponent } from '../shared/component-preview.component';

interface AegisxSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  components: ComponentExample[];
  expanded?: boolean;
}

@Component({
  selector: 'app-aegisx-ui-section',
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
    CodeViewerComponent,
    ComponentPreviewComponent,
  ],
  template: `
    <div class="aegisx-ui-section">
      <div class="section-header">
        <div class="header-content">
          <mat-icon class="section-icon">architecture</mat-icon>
          <div class="section-info">
            <h2>AegisX UI Components</h2>
            <p>Custom component library built for enterprise applications</p>
          </div>
        </div>
        <div class="section-stats">
          <div class="stat">
            <span class="stat-number">{{ totalComponents() }}</span>
            <span class="stat-label">Components</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ filteredComponents().length }}</span>
            <span class="stat-label">Matches</span>
          </div>
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

              <!-- Installation Note -->
              <div class="installation-note">
                <mat-icon>info</mat-icon>
                <span
                  >Custom AegisX UI component - part of enterprise library</span
                >
              </div>

              <!-- Tags -->
              <div class="component-tags">
                <mat-chip *ngFor="let tag of component.tags" class="tag-chip">
                  {{ tag }}
                </mat-chip>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button (click)="showCode(component)">
                <mat-icon>code</mat-icon>
                View Code
              </button>
              <button mat-button (click)="tryComponent(component)">
                <mat-icon>play_arrow</mat-icon>
                Try Component
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <!-- Organized Sections -->
      <div *ngIf="!searchQuery" class="organized-sections">
        <!-- Getting Started Section -->
        <div class="getting-started-section">
          <mat-card class="getting-started-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>rocket_launch</mat-icon>
                Getting Started with AegisX UI
              </mat-card-title>
            </mat-card-header>

            <mat-card-content>
              <p>
                AegisX UI is a custom component library designed for enterprise
                applications. It extends Angular Material with additional
                components and enhanced styling.
              </p>

              <div class="code-sections">
                <div class="code-section">
                  <h4>Installation</h4>
                  <app-code-viewer
                    language="bash"
                    [code]="installationCode"
                    title="Install AegisX UI"
                  >
                  </app-code-viewer>
                </div>

                <div class="code-section">
                  <h4>Basic Usage</h4>
                  <app-code-viewer
                    language="typescript"
                    [code]="usageCode"
                    title="Basic Usage Example"
                  >
                  </app-code-viewer>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Component Categories -->
        <mat-accordion class="sections-accordion" multi>
          <mat-expansion-panel
            *ngFor="let section of aegisxSections()"
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
                      <mat-icon>code</mat-icon>
                      {{ component.source }}
                    </mat-card-subtitle>
                  </mat-card-header>

                  <mat-card-content>
                    <p>{{ component.description }}</p>

                    <!-- Component Preview -->
                    <div class="component-preview" *ngIf="component.liveDemo">
                      <app-component-preview
                        [componentId]="component.id"
                        [responsive]="component.responsive || false"
                      >
                      </app-component-preview>
                    </div>

                    <!-- Coming Soon Notice -->
                    <div *ngIf="!component.liveDemo" class="coming-soon">
                      <mat-icon>schedule</mat-icon>
                      <span>Component preview coming soon</span>
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
                    <button mat-button (click)="tryComponent(component)">
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
        <h3>No AegisX UI components found</h3>
        <p>Try searching with different keywords or browse all components.</p>
        <button mat-raised-button color="primary" (click)="clearSearch()">
          Browse All Components
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./aegisx-ui-section.component.scss'],
})
export class AegisxUiSectionComponent implements OnInit {
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

  aegisxSections = computed(() => {
    const componentsByCategory = this.groupComponentsByCategory();

    const sections: AegisxSection[] = [
      {
        id: 'layout-components',
        title: 'Layout Components',
        description: 'Structural components for organizing application layouts',
        icon: 'view_quilt',
        components: componentsByCategory['Layout Components'] || [],
        expanded: true,
      },
      {
        id: 'navigation-components',
        title: 'Navigation Components',
        description: 'Enhanced navigation and menu components',
        icon: 'navigation',
        components: componentsByCategory['Navigation Components'] || [],
      },
      {
        id: 'content-components',
        title: 'Content Components',
        description: 'Cards, alerts, and content display components',
        icon: 'article',
        components: componentsByCategory['Content Components'] || [],
      },
      {
        id: 'interactive-components',
        title: 'Interactive Components',
        description: 'User interaction and feedback components',
        icon: 'touch_app',
        components: componentsByCategory['Interactive Components'] || [],
      },
    ];

    return sections.filter((section) => section.components.length > 0);
  });

  // Code examples for getting started
  installationCode = `npm install @aegisx/ui

# or with yarn
yarn add @aegisx/ui`;

  usageCode = `import { AegisxUiModule } from '@aegisx/ui';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \\\`
    <aegisx-classic-layout>
      <aegisx-nav-menu [items]="menuItems"></aegisx-nav-menu>
      <router-outlet></router-outlet>
    </aegisx-classic-layout>
  \\\`,
  imports: [AegisxUiModule]
})
export class AppComponent {
  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Users', icon: 'people', route: '/users' }
  ];
}`;

  ngOnInit() {
    this.loadAegisxComponents();
  }

  private async loadAegisxComponents() {
    this.loading.set(true);

    try {
      await this.showcaseDataService.loadComponentData();
      const aegisxData = this.showcaseDataService.getCategoryData('aegisx');

      if (aegisxData) {
        this.components.set(aegisxData.components);
      }
    } catch (error) {
      console.error('Failed to load AegisX UI components:', error);
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
  showCode(component: ComponentExample) {
    // Show code example in dialog or expand section
    console.log('Showing code for:', component.name);
  }

  tryComponent(component: ComponentExample) {
    // Open interactive playground or demo
    console.log('Trying component:', component.name);
  }

  openInStackBlitz(component: ComponentExample) {
    // Open component example in StackBlitz
    console.log('Opening in StackBlitz:', component.name);
  }

  clearSearch() {
    // Emit event to parent to clear search
    console.log('Clear search requested');
  }
}
