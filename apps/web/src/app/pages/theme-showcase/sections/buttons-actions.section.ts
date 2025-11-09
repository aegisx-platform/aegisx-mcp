import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-buttons-actions-section',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    MatButtonToggleModule,
  ],
  template: `
    <div class="section-container">
      <h2 class="section-title">Buttons & Actions</h2>
      <p class="section-description">Interactive buttons and action components</p>

      <!-- Button Variants -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Button Variants</mat-card-title>
          <mat-card-subtitle>Different button styles and states</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="button-grid">
            <button mat-button>Basic Button</button>
            <button mat-raised-button>Raised Button</button>
            <button mat-stroked-button>Stroked Button</button>
            <button mat-flat-button>Flat Button</button>
            <button mat-button color="primary">Primary</button>
            <button mat-raised-button color="primary">Primary Raised</button>
            <button mat-stroked-button color="accent">Accent</button>
            <button mat-raised-button color="warn">Warn</button>
            <button mat-button disabled>Disabled</button>
            <button mat-raised-button disabled>Disabled Raised</button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Icon Buttons -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Icon Buttons</mat-card-title>
          <mat-card-subtitle>Buttons with icons and FAB</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="icon-button-grid">
            <button mat-icon-button>
              <mat-icon>home</mat-icon>
            </button>
            <button mat-icon-button color="primary">
              <mat-icon>favorite</mat-icon>
            </button>
            <button mat-icon-button>
              <mat-icon>settings</mat-icon>
            </button>
            <button mat-icon-button disabled>
              <mat-icon>help</mat-icon>
            </button>
            <button mat-fab color="primary">
              <mat-icon>add</mat-icon>
            </button>
            <button mat-mini-fab color="accent">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button [matBadge]="99" matBadgeColor="warn">
              <mat-icon>notifications</mat-icon>
            </button>
            <button mat-icon-button [matBadge]="'5'" [matBadgeHidden]="false">
              <mat-icon>shopping_cart</mat-icon>
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Button with Text & Icon -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Buttons with Icons</mat-card-title>
          <mat-card-subtitle>Combined text and icon buttons</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="button-group">
            <button mat-raised-button color="primary">
              <mat-icon>cloud_download</mat-icon>
              Download
            </button>
            <button mat-stroked-button>
              <mat-icon>delete</mat-icon>
              Delete
            </button>
            <button mat-button color="primary">
              <mat-icon>arrow_forward</mat-icon>
              Next
            </button>
            <button mat-raised-button>
              <mat-icon>check_circle</mat-icon>
              Save
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Button Toggle -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Button Toggle Group</mat-card-title>
          <mat-card-subtitle>Mutually exclusive button selection</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="toggle-group">
            <mat-button-toggle-group>
              <mat-button-toggle value="left">
                <mat-icon>format_align_left</mat-icon>
              </mat-button-toggle>
              <mat-button-toggle value="center">
                <mat-icon>format_align_center</mat-icon>
              </mat-button-toggle>
              <mat-button-toggle value="right">
                <mat-icon>format_align_right</mat-icon>
              </mat-button-toggle>
            </mat-button-toggle-group>
          </div>

          <div class="toggle-group">
            <mat-button-toggle-group multiple>
              <mat-button-toggle value="bold">
                <mat-icon>format_bold</mat-icon>
              </mat-button-toggle>
              <mat-button-toggle value="italic">
                <mat-icon>format_italic</mat-icon>
              </mat-button-toggle>
              <mat-button-toggle value="underline">
                <mat-icon>format_underlined</mat-icon>
              </mat-button-toggle>
            </mat-button-toggle-group>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Chips -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Chips</mat-card-title>
          <mat-card-subtitle>Compact tags and selectable items</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="chip-section">
            <p class="chip-label">Basic Chips</p>
            <mat-chip-set>
              <mat-chip>Basic Chip</mat-chip>
              <mat-chip highlighted>Highlighted Chip</mat-chip>
              <mat-chip disabled>Disabled Chip</mat-chip>
            </mat-chip-set>
          </div>

          <div class="chip-section">
            <p class="chip-label">Removable Chips</p>
            <mat-chip-set>
              <mat-chip removable (removed)="remove($event)">
                React
              </mat-chip>
              <mat-chip removable (removed)="remove($event)">
                Angular
              </mat-chip>
              <mat-chip removable (removed)="remove($event)">
                Vue
              </mat-chip>
            </mat-chip-set>
          </div>

          <div class="chip-section">
            <p class="chip-label">Selectable Chips</p>
            <mat-chip-set>
              <mat-chip selected>Selected Chip</mat-chip>
              <mat-chip>Unselected Chip</mat-chip>
              <mat-chip selected disabled>Disabled Selected</mat-chip>
            </mat-chip-set>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Badge -->
      <mat-card class="component-card">
        <mat-card-header>
          <mat-card-title>Badge</mat-card-title>
          <mat-card-subtitle>Notification badges on elements</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="badge-grid">
            <div matBadge="4" matBadgeColor="warn">
              <span>New Messages</span>
            </div>
            <div matBadge="12" matBadgeColor="primary">
              <span>Tasks</span>
            </div>
            <div [matBadge]="99" matBadgeColor="accent">
              <span>Items</span>
            </div>
            <div matBadge="●" [matBadgeHidden]="false">
              <span>Online Status</span>
            </div>
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

      .button-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--preset-spacing-lg, 36px);
      }

      .icon-button-grid {
        display: flex;
        gap: var(--preset-spacing-lg, 36px);
        flex-wrap: wrap;
        align-items: center;
      }

      .button-group {
        display: flex;
        gap: var(--preset-spacing-lg, 36px);
        flex-wrap: wrap;
      }

      .toggle-group {
        margin-bottom: var(--preset-spacing-lg, 36px);

        &:last-child {
          margin-bottom: 0;
        }
      }

      .chip-section {
        margin-bottom: var(--preset-spacing-lg, 36px);

        &:last-child {
          margin-bottom: 0;
        }
      }

      .chip-label {
        margin: 0 0 var(--preset-spacing-md, 18px) 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--theme-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .badge-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--preset-spacing-lg, 36px);

        [matBadge] {
          padding: var(--preset-spacing-base, 24px);
          border-radius: var(--preset-border-radius, 12px);
          background-color: var(--theme-surface-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100px;
          text-align: center;
        }
      }
    `,
  ],
})
export class ButtonsActionsSection {
  remove(event: any): void {
    console.log('Chip removed:', event);
  }
}
