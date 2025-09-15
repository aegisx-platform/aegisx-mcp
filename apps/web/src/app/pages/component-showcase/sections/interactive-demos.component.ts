import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-interactive-demos',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="interactive-demos-section">
      <div class="coming-soon">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>play_circle</mat-icon>
            <mat-card-title>Interactive Demos</mat-card-title>
            <mat-card-subtitle
              >Real-world usage examples and complex
              interactions</mat-card-subtitle
            >
          </mat-card-header>

          <mat-card-content>
            <div class="content-preview">
              <mat-icon class="main-icon">construction</mat-icon>
              <h3>Coming Soon</h3>
              <p>
                This section will feature comprehensive interactive demos
                including:
              </p>
              <ul>
                <li>Complete user registration workflow with validation</li>
                <li>Data management dashboard with real-time updates</li>
                <li>Settings panel with tabbed interface</li>
                <li>E-commerce product catalog with filters</li>
                <li>Chat interface with messaging</li>
                <li>File upload center with progress tracking</li>
                <li>Form wizard with multi-step validation</li>
                <li>Responsive design demonstrations</li>
              </ul>
              <p>
                Interactive playground with {{ theme }} theme and responsive
                previews.
              </p>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-raised-button color="primary" disabled>
              <mat-icon>play_arrow</mat-icon>
              Try Demos
            </button>
            <button mat-button disabled>
              <mat-icon>code</mat-icon>
              View Source
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .interactive-demos-section {
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

      :host-context(.dark-theme) .interactive-demos-section {
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
export class InteractiveDemosComponent {
  @Input() searchQuery: string = '';
  @Input() theme: 'light' | 'dark' = 'light';
}
