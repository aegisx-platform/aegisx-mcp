import { Component, inject, signal, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { PdfTemplateService } from '../services/pdf-templates.service';
import { PdfTemplate } from '../types/pdf-templates.types';

@Component({
  selector: 'app-pdf-template-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    <div class="template-selector-container">
      <!-- Loading State -->
      <div *ngIf="loading()" class="loading-container">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Loading templates...</p>
      </div>

      <!-- Template Grid -->
      <div *ngIf="!loading()" class="templates-grid">
        <!-- Blank Template Card -->
        <mat-card
          class="template-card blank-template"
          (click)="selectTemplate(null)"
          [class.selected]="selectedTemplate() === null"
        >
          <mat-card-content>
            <div class="template-icon">
              <mat-icon>add_circle_outline</mat-icon>
            </div>
            <h3>Start from Blank</h3>
            <p class="template-description">
              Create a custom PDF template from scratch
            </p>
          </mat-card-content>
        </mat-card>

        <!-- Starter Template Cards -->
        <mat-card
          *ngFor="let template of templates()"
          class="template-card"
          (click)="selectTemplate(template)"
          [class.selected]="selectedTemplate()?.id === template.id"
        >
          <mat-card-content>
            <div class="template-header">
              <mat-icon class="template-icon-small">description</mat-icon>
              <mat-chip class="category-chip">{{
                template.category || 'General'
              }}</mat-chip>
            </div>
            <h3>{{ template.display_name }}</h3>
            <p class="template-description">
              {{ template.description || 'No description available' }}
            </p>
            <div class="template-meta">
              <span class="template-type">
                <mat-icon>label</mat-icon>
                {{ template.type || 'Document' }}
              </span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading() && error()" class="error-container">
        <mat-icon>error_outline</mat-icon>
        <p>{{ error() }}</p>
        <button mat-raised-button color="primary" (click)="loadTemplates()">
          Retry
        </button>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!loading() && !error() && templates().length === 0"
        class="empty-container"
      >
        <mat-icon>inbox</mat-icon>
        <p>No template starters available</p>
        <button
          mat-raised-button
          color="primary"
          (click)="selectTemplate(null)"
        >
          Start from Blank
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .template-selector-container {
        width: 100%;
        padding: 24px;
        background: #fafafa;
        min-height: 500px;
      }

      .loading-container,
      .error-container,
      .empty-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        min-height: 400px;
        color: rgba(0, 0, 0, 0.6);
      }

      .loading-container mat-icon,
      .error-container mat-icon,
      .empty-container mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
      }

      .templates-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        width: 100%;
      }

      .template-card {
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        border: 2px solid transparent;
        height: 100%;
      }

      .template-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      }

      .template-card.selected {
        border-color: #1976d2;
        background: #e3f2fd;
      }

      .template-card.selected::after {
        content: '✓';
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        background: #1976d2;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
      }

      .blank-template {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .blank-template .template-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin: 0 auto 16px;
      }

      .blank-template .template-icon mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: white;
      }

      .blank-template h3 {
        color: white;
      }

      .blank-template .template-description {
        color: rgba(255, 255, 255, 0.9);
      }

      .template-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .template-icon-small {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: rgba(0, 0, 0, 0.54);
      }

      .category-chip {
        font-size: 11px;
        min-height: 24px;
        padding: 0 8px;
      }

      .template-card h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
      }

      .template-description {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        margin: 0 0 12px 0;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .template-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        margin-top: auto;
      }

      .template-type {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .template-type mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      mat-card-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 16px !important;
      }
    `,
  ],
})
export class PdfTemplateSelectorComponent implements OnInit {
  private pdfTemplateService = inject(PdfTemplateService);

  templates = signal<PdfTemplate[]>([]);
  selectedTemplate = signal<PdfTemplate | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Output event when template is selected
  templateSelected = output<PdfTemplate | null>();

  ngOnInit() {
    this.loadTemplates();
  }

  async loadTemplates() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const starters = await this.pdfTemplateService.getTemplateStarters();
      this.templates.set(starters);
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to load template starters');
      console.error('Failed to load template starters:', err);
    } finally {
      this.loading.set(false);
    }
  }

  selectTemplate(template: PdfTemplate | null) {
    this.selectedTemplate.set(template);
    this.templateSelected.emit(template);
  }
}
