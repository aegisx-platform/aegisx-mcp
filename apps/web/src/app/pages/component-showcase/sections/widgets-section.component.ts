import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-widgets-section',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="widgets-section">
      <div class="coming-soon">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>dashboard</mat-icon>
            <mat-card-title>Application Widgets</mat-card-title>
            <mat-card-subtitle
              >Dashboard components and custom widgets</mat-card-subtitle
            >
          </mat-card-header>

          <mat-card-content>
            <div class="content-preview">
              <mat-icon class="main-icon">construction</mat-icon>
              <h3>Coming Soon</h3>
              <p>
                This section will showcase application-specific widgets
                including:
              </p>
              <ul>
                <li>Dashboard stats cards</li>
                <li>Chart widgets with Chart.js integration</li>
                <li>Progress tracking widgets</li>
                <li>Quick actions components</li>
                <li>Activity timeline components</li>
                <li>User profile widgets</li>
                <li>Settings components</li>
              </ul>
              <p>Currently under development with {{ theme }} theme support.</p>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-raised-button color="primary" disabled>
              <mat-icon>visibility</mat-icon>
              View Widgets
            </button>
            <button mat-button disabled>
              <mat-icon>code</mat-icon>
              View Code
            </button>
          </mat-card-actions>
        </mat-card>
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
export class WidgetsSectionComponent {
  @Input() searchQuery: string = '';
  @Input() theme: 'light' | 'dark' = 'light';
}
