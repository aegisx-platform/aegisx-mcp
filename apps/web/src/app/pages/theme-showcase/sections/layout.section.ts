import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-layout-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatExpansionModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="section-container">
      <h2 class="section-title">Layout</h2>
      <p class="section-description">Cards, lists, expansion panels, and stepper components</p>

      <!-- Cards -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Cards</mat-card-title>
          <mat-card-subtitle>Content containers with headers and actions</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="card-grid">
            <mat-card class="demo-card">
              <mat-card-header>
                <mat-card-title>Card Title</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>This is a simple card with title and content.</p>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button>Share</button>
                <button mat-button>Explore</button>
              </mat-card-actions>
            </mat-card>

            <mat-card class="demo-card">
              <mat-card-header>
                <mat-card-title>Complex Card</mat-card-title>
                <mat-card-subtitle>With avatar and actions</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>A more complex card with additional features.</p>
              </mat-card-content>
              <mat-card-actions align="end">
                <button mat-icon-button>
                  <mat-icon>favorite</mat-icon>
                </button>
                <button mat-icon-button>
                  <mat-icon>share</mat-icon>
                </button>
                <button mat-icon-button>
                  <mat-icon>more_vert</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- List -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>List</mat-card-title>
          <mat-card-subtitle>Single and multi-line lists</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <mat-icon matListItemIcon>folder</mat-icon>
              <div matListItemTitle>Folder</div>
              <div matListItemLine>Jan 9, 2014</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon>document</mat-icon>
              <div matListItemTitle>Document</div>
              <div matListItemLine>Jan 17, 2014</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon>picture_in_picture</mat-icon>
              <div matListItemTitle>Image</div>
              <div matListItemLine>Jan 28, 2014</div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <!-- Expansion Panel -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Expansion Panel</mat-card-title>
          <mat-card-subtitle>Collapsible sections</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-accordion>
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>build</mat-icon>
                  Section 1
                </mat-panel-title>
              </mat-expansion-panel-header>
              <p>This is the content for section 1</p>
            </mat-expansion-panel>

            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>settings</mat-icon>
                  Section 2
                </mat-panel-title>
              </mat-expansion-panel-header>
              <p>This is the content for section 2</p>
            </mat-expansion-panel>

            <mat-expansion-panel disabled>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>lock</mat-icon>
                  Section 3 (Disabled)
                </mat-panel-title>
              </mat-expansion-panel-header>
            </mat-expansion-panel>
          </mat-accordion>
        </mat-card-content>
      </mat-card>

      <!-- Divider -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Divider</mat-card-title>
          <mat-card-subtitle>Visual separators</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div>
            <p>Item 1</p>
            <mat-divider></mat-divider>
            <p>Item 2</p>
            <mat-divider></mat-divider>
            <p>Item 3</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .section-container {
        display: flex;
        flex-direction: column;
        gap: var(--preset-spacing-lg, 36px);
      }

      .section-title {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        color: var(--theme-text-primary);
        letter-spacing: -0.5px;
      }

      .section-description {
        margin: 8px 0 0 0;
        font-size: 14px;
        color: var(--theme-text-secondary);
      }

      .component-card {
        border-radius: var(--preset-border-radius, 12px);
        box-shadow: var(--preset-shadow, 0 10px 15px rgba(0, 0, 0, 0.1));
        transition: var(--preset-transition, all 300ms ease-in-out);
      }

      .component-card mat-card-header {
        padding: var(--preset-spacing-base, 24px) var(--preset-spacing-base, 24px)
          var(--preset-spacing-md, 18px) var(--preset-spacing-base, 24px);
        border-bottom: 1px solid var(--theme-surface-border);
      }

      .component-card mat-card-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .component-card mat-card-subtitle {
        margin-top: 4px;
        font-size: 13px;
        color: var(--theme-text-secondary);
      }

      .component-card mat-card-content {
        padding: var(--preset-spacing-base, 24px);
      }

      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--preset-spacing-lg, 36px);
      }

      .demo-card {
        border-radius: var(--preset-border-radius, 12px);
        box-shadow: var(--preset-shadow, 0 10px 15px rgba(0, 0, 0, 0.1));
      }

      mat-list {
        width: 100%;
      }

      mat-expansion-panel {
        margin-bottom: var(--preset-spacing-md, 18px);
      }

      p {
        margin: var(--preset-spacing-md, 18px) 0;
        font-size: 14px;
        color: var(--theme-text-primary);

        &:last-child {
          margin-bottom: 0;
        }
      }
    `,
  ],
})
export class LayoutSection {}
