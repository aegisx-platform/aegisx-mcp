import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { FileUploadDemoComponent } from '../../shared/ui/components/file-upload/file-upload-demo.component';

@Component({
  selector: 'app-file-upload-demo-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    FileUploadDemoComponent,
  ],
  template: `
    <div class="demo-page">
      <div class="page-header mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          File Upload Demo
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Test different file upload configurations and features
        </p>
      </div>

      <mat-card class="demo-container">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>science</mat-icon>
            Interactive File Upload Demo
          </mat-card-title>
          <mat-card-subtitle>
            Experiment with different settings and test file upload
            functionality
          </mat-card-subtitle>
        </mat-card-header>

        <mat-divider></mat-divider>

        <mat-card-content>
          <app-file-upload-demo></app-file-upload-demo>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .demo-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .page-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .demo-container {
        margin-bottom: 2rem;
      }

      .demo-container mat-card-header {
        padding: 1.5rem;
      }

      .demo-container mat-card-content {
        padding: 2rem;
      }

      /* Dark theme adjustments */
      :host-context(.dark) .page-header h1 {
        color: #fff;
      }

      :host-context(.dark) .page-header p {
        color: #ccc;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .demo-page {
          padding: 1rem;
        }

        .demo-container mat-card-content {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class FileUploadDemoPage {}
