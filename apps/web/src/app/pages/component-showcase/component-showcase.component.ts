import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';

import { MaterialSectionComponent } from './sections/material-section.component';
import { AegisxUiSectionComponent } from './sections/aegisx-ui-section.component';
import { WidgetsSectionComponent } from './sections/widgets-section.component';
import { InteractiveDemosComponent } from './sections/interactive-demos.component';
import { ShowcaseDataService } from './services/showcase-data.service';

interface ShowcaseTab {
  id: string;
  label: string;
  icon: string;
  description: string;
  component: any;
  badgeCount?: number;
}

@Component({
  selector: 'app-component-showcase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MaterialSectionComponent,
    AegisxUiSectionComponent,
    WidgetsSectionComponent,
    InteractiveDemosComponent,
  ],
  template: `
    <div class="component-showcase-wrapper">
      <div class="component-showcase-container">
        <div class="component-showcase">
          <!-- Controls Bar (แทน Header) -->
          <div class="showcase-controls">
            <!-- Search -->
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search components</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input
                matInput
                placeholder="Search components..."
                [(ngModel)]="searchQuery"
                (input)="onSearch($event)"
              />
              <button
                *ngIf="searchQuery()"
                matSuffix
                mat-icon-button
                (click)="clearSearch()"
              >
                <mat-icon>clear</mat-icon>
              </button>
            </mat-form-field>

            <!-- Filter -->
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filter</mat-label>
              <mat-select
                [(value)]="selectedFilter"
                (selectionChange)="onFilterChange($event)"
              >
                <mat-option value="all">All Components</mat-option>
                <mat-option value="material">Material Design</mat-option>
                <mat-option value="aegisx">AegisX UI</mat-option>
                <mat-option value="widgets">Widgets</mat-option>
                <mat-option value="demos">Interactive</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="spacer"></div>

            <!-- Theme Toggle -->
            <mat-slide-toggle
              [(ngModel)]="isDarkTheme"
              (change)="toggleTheme()"
              class="theme-toggle"
            >
              <mat-icon>{{
                isDarkTheme() ? 'dark_mode' : 'light_mode'
              }}</mat-icon>
            </mat-slide-toggle>
          </div>

          <!-- Progress Bar for Loading -->
          <mat-progress-bar
            *ngIf="isLoading()"
            mode="indeterminate"
            class="loading-bar"
          >
          </mat-progress-bar>

          <!-- Main Content -->
          <div class="showcase-content">
            <!-- Tab Content -->
            <mat-tab-group
              [(selectedIndex)]="selectedTabIndexNumber"
              class="showcase-tabs"
              animationDuration="300ms"
              (selectedTabChange)="onTabChange($event)"
            >
              <mat-tab
                *ngFor="let tab of filteredTabs(); trackBy: trackByTabId"
                [label]="tab.label"
              >
                <ng-template matTabLabel>
                  <mat-icon class="tab-icon">{{ tab.icon }}</mat-icon>
                  {{ tab.label }}
                  <mat-chip *ngIf="tab.badgeCount" class="tab-badge">
                    {{ tab.badgeCount }}
                  </mat-chip>
                </ng-template>

                <div class="tab-content">
                  <!-- Tab Header -->
                  <div class="tab-header">
                    <h2>{{ tab.label }}</h2>
                    <p>{{ tab.description }}</p>
                  </div>

                  <!-- Dynamic Component Content -->
                  <div class="component-section" [ngSwitch]="tab.id">
                    <app-material-section
                      *ngSwitchCase="'material'"
                      [searchQuery]="searchQuery()"
                      [theme]="isDarkTheme() ? 'dark' : 'light'"
                    >
                    </app-material-section>

                    <app-aegisx-ui-section
                      *ngSwitchCase="'aegisx'"
                      [searchQuery]="searchQuery()"
                      [theme]="isDarkTheme() ? 'dark' : 'light'"
                    >
                    </app-aegisx-ui-section>

                    <app-widgets-section
                      *ngSwitchCase="'widgets'"
                      [searchQuery]="searchQuery()"
                      [theme]="isDarkTheme() ? 'dark' : 'light'"
                    >
                    </app-widgets-section>

                    <app-interactive-demos
                      *ngSwitchCase="'demos'"
                      [searchQuery]="searchQuery()"
                      [theme]="isDarkTheme() ? 'dark' : 'light'"
                    >
                    </app-interactive-demos>

                    <!-- Fallback -->
                    <div *ngSwitchDefault class="coming-soon">
                      <mat-icon>construction</mat-icon>
                      <h3>Coming Soon</h3>
                      <p>This section is under development.</p>
                    </div>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>

          <!-- Footer -->
          <div class="showcase-footer">
            <p>
              AegisX Component Showcase -
              <span class="component-count"
                >{{ totalComponentCount() }} components</span
              >
              | <span class="version">v{{ version }}</span> |
              <a href="https://material.angular.io" target="_blank"
                >Angular Material</a
              >
              |
              <a href="#" (click)="showAbout()">About</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./component-showcase.component.scss'],
})
export class ComponentShowcaseComponent implements OnInit {
  private showcaseDataService = inject(ShowcaseDataService);

  // Signals for reactive state
  isDarkTheme = signal(false);
  searchQuery = signal('');
  selectedFilter = signal('all');
  selectedTabIndex = signal('material');
  isLoading = signal(false);
  isMobile = signal(false);

  // Version info
  version = '1.0.0';

  // Tab configuration
  tabs: ShowcaseTab[] = [
    {
      id: 'material',
      label: 'Material Design',
      icon: 'palette',
      description: 'Comprehensive Angular Material component examples',
      component: MaterialSectionComponent,
      badgeCount: 45,
    },
    {
      id: 'aegisx',
      label: 'AegisX UI',
      icon: 'architecture',
      description: 'Custom AegisX UI library components',
      component: AegisxUiSectionComponent,
      badgeCount: 15,
    },
    {
      id: 'widgets',
      label: 'Application Widgets',
      icon: 'dashboard',
      description: 'Dashboard widgets and application-specific components',
      component: WidgetsSectionComponent,
      badgeCount: 12,
    },
    {
      id: 'demos',
      label: 'Interactive Demos',
      icon: 'play_circle',
      description: 'Real-world usage examples and complex interactions',
      component: InteractiveDemosComponent,
      badgeCount: 8,
    },
  ];

  // Computed properties
  filteredTabs = signal(this.tabs);
  selectedTabIndexNumber = 0;

  ngOnInit() {
    this.initializeTheme();
    this.checkMobileView();
    this.loadComponentData();

    // Listen for window resize
    window.addEventListener('resize', () => this.checkMobileView());
  }

  private initializeTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('showcase-theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme.set(true);
      document.body.classList.add('dark-theme');
    }
  }

  private checkMobileView() {
    this.isMobile.set(window.innerWidth < 768);
  }

  private async loadComponentData() {
    this.isLoading.set(true);
    try {
      // Load component metadata
      await this.showcaseDataService.loadComponentData();
      // Update badge counts
      this.updateBadgeCounts();
    } catch (error) {
      console.error('Failed to load component data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private updateBadgeCounts() {
    const counts = this.showcaseDataService.getComponentCounts();
    this.tabs = this.tabs.map((tab) => ({
      ...tab,
      badgeCount: counts[tab.id] || tab.badgeCount,
    }));
    this.filteredTabs.set(this.tabs);
  }

  // Event handlers
  toggleTheme() {
    const isDark = this.isDarkTheme();
    localStorage.setItem('showcase-theme', isDark ? 'dark' : 'light');

    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this.filterTabs();
  }

  clearSearch() {
    this.searchQuery.set('');
    this.filterTabs();
  }

  onFilterChange(event: any) {
    this.selectedFilter.set(event.value);
    this.filterTabs();
  }

  private filterTabs() {
    let filtered = this.tabs;

    // Filter by category
    const filter = this.selectedFilter();
    if (filter !== 'all') {
      filtered = filtered.filter((tab) => tab.id === filter);
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (tab) =>
          tab.label.toLowerCase().includes(query) ||
          tab.description.toLowerCase().includes(query),
      );
    }

    this.filteredTabs.set(filtered);
  }

  selectTab(tabId: string) {
    this.selectedTabIndex.set(tabId);
    this.selectedTabIndexNumber = this.filteredTabs().findIndex(
      (tab) => tab.id === tabId,
    );
  }

  onTabChange(event: any) {
    const tab = this.filteredTabs()[event.index];
    if (tab) {
      this.selectedTabIndex.set(tab.id);
    }
  }

  trackByTabId(index: number, tab: ShowcaseTab): string {
    return tab.id;
  }

  totalComponentCount(): number {
    return this.tabs.reduce((sum, tab) => sum + (tab.badgeCount || 0), 0);
  }

  showAbout() {
    // Could open a dialog with about information
    alert(
      'AegisX Component Showcase v' +
        this.version +
        '\n\nA comprehensive demonstration of all available UI components.',
    );
  }
}
