import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AxCircularProgressComponent } from '@aegisx/ui';

@Component({
  selector: 'app-circular-progress-demo',
  standalone: true,
  imports: [CommonModule, MatCardModule, AxCircularProgressComponent],
  template: `
    <div class="docs-page">
      <!-- Page Header -->
      <div class="docs-header">
        <h1 class="docs-title">Circular Progress Component</h1>
        <p class="docs-subtitle">
          SVG-based circular progress indicators for displaying percentage
          metrics. Perfect for Web Vitals, SLA metrics, and performance scores.
        </p>
      </div>

      <!-- Pattern 1: Web Vitals Metrics -->
      <div class="section-header">
        <h2>Pattern 1: Web Vitals Performance Metrics</h2>
        <p>Circular progress rings for Core Web Vitals monitoring.</p>
      </div>

      <section>
        <h3
          class="text-lg font-semibold mb-4 text-green-700 dark:text-green-400"
        >
          ✨ New: ax-circular-progress Component
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- FCP -->
          <mat-card class="metric-card">
            <mat-card-content class="flex flex-col items-center">
              <ax-circular-progress
                [value]="92"
                size="md"
                [autoColor]="true"
                [successThreshold]="80"
                [warningThreshold]="50"
              >
              </ax-circular-progress>
              <div class="mt-4 text-center">
                <div class="text-sm font-medium text-secondary">
                  First Contentful Paint
                </div>
                <div class="text-xs text-subtle mt-1">1.2s (Good)</div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- LCP -->
          <mat-card class="metric-card">
            <mat-card-content class="flex flex-col items-center">
              <ax-circular-progress
                [value]="88"
                size="md"
                [autoColor]="true"
                [successThreshold]="80"
                [warningThreshold]="50"
              >
              </ax-circular-progress>
              <div class="mt-4 text-center">
                <div class="text-sm font-medium text-secondary">
                  Largest Contentful Paint
                </div>
                <div class="text-xs text-subtle mt-1">2.1s (Good)</div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- CLS -->
          <mat-card class="metric-card">
            <mat-card-content class="flex flex-col items-center">
              <ax-circular-progress
                [value]="95"
                size="md"
                [autoColor]="true"
                [successThreshold]="80"
                [warningThreshold]="50"
              >
              </ax-circular-progress>
              <div class="mt-4 text-center">
                <div class="text-sm font-medium text-secondary">
                  Cumulative Layout Shift
                </div>
                <div class="text-xs text-subtle mt-1">0.05 (Good)</div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- INP -->
          <mat-card class="metric-card">
            <mat-card-content class="flex flex-col items-center">
              <ax-circular-progress
                [value]="45"
                size="md"
                [autoColor]="true"
                [successThreshold]="80"
                [warningThreshold]="50"
              >
              </ax-circular-progress>
              <div class="mt-4 text-center">
                <div class="text-sm font-medium text-secondary">
                  Interaction to Next Paint
                </div>
                <div class="text-xs text-subtle mt-1">350ms (Needs work)</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Pattern 2: SLA / Performance Scores -->
      <div class="section-header">
        <h2>Pattern 2: SLA & Performance Scores</h2>
        <p>Large circular progress for overall performance metrics.</p>
      </div>

      <section>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- API Uptime -->
          <mat-card class="metric-card">
            <mat-card-content class="flex flex-col items-center">
              <ax-circular-progress
                [value]="99.9"
                size="lg"
                color="var(--ax-success-default)"
                label="99.9%"
              >
              </ax-circular-progress>
              <div class="mt-4 text-center">
                <div class="text-lg font-semibold text-heading">API Uptime</div>
                <div class="text-sm text-secondary mt-1">Last 30 days</div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Response Time -->
          <mat-card class="metric-card">
            <mat-card-content class="flex flex-col items-center">
              <ax-circular-progress
                [value]="85"
                size="lg"
                color="var(--ax-info-default)"
                label="85%"
              >
              </ax-circular-progress>
              <div class="mt-4 text-center">
                <div class="text-lg font-semibold text-heading">
                  Response Time
                </div>
                <div class="text-sm text-secondary mt-1">&lt; 200ms target</div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Error Rate -->
          <mat-card class="metric-card">
            <mat-card-content class="flex flex-col items-center">
              <ax-circular-progress
                [value]="98.5"
                size="lg"
                color="var(--ax-success-default)"
                label="98.5%"
              >
              </ax-circular-progress>
              <div class="mt-4 text-center">
                <div class="text-lg font-semibold text-heading">
                  Success Rate
                </div>
                <div class="text-sm text-secondary mt-1">1.5% error rate</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Pattern 3: Size Variants -->
      <div class="section-header">
        <h2>Pattern 3: Size Variants</h2>
        <p>Small, medium, large, and extra-large circular progress.</p>
      </div>

      <section>
        <div class="flex items-center justify-around flex-wrap gap-8">
          <!-- Small -->
          <div class="flex flex-col items-center">
            <ax-circular-progress [value]="75" size="sm">
            </ax-circular-progress>
            <div class="text-sm text-secondary mt-2">Small (80px)</div>
          </div>

          <!-- Medium -->
          <div class="flex flex-col items-center">
            <ax-circular-progress [value]="75" size="md">
            </ax-circular-progress>
            <div class="text-sm text-secondary mt-2">Medium (120px)</div>
          </div>

          <!-- Large -->
          <div class="flex flex-col items-center">
            <ax-circular-progress [value]="75" size="lg">
            </ax-circular-progress>
            <div class="text-sm text-secondary mt-2">Large (160px)</div>
          </div>

          <!-- Extra Large -->
          <div class="flex flex-col items-center">
            <ax-circular-progress [value]="75" size="xl">
            </ax-circular-progress>
            <div class="text-sm text-secondary mt-2">XL (200px)</div>
          </div>
        </div>
      </section>

      <!-- Pattern 4: Color Variants -->
      <div class="section-header">
        <h2>Pattern 4: Custom Colors</h2>
        <p>Different color schemes for various metric types.</p>
      </div>

      <section>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div class="flex flex-col items-center">
            <ax-circular-progress
              [value]="85"
              size="md"
              color="var(--ax-info-default)"
            >
            </ax-circular-progress>
            <div class="text-sm text-secondary mt-2">Info</div>
          </div>

          <div class="flex flex-col items-center">
            <ax-circular-progress
              [value]="92"
              size="md"
              color="var(--ax-success-default)"
            >
            </ax-circular-progress>
            <div class="text-sm text-secondary mt-2">Success</div>
          </div>

          <div class="flex flex-col items-center">
            <ax-circular-progress
              [value]="68"
              size="md"
              color="var(--ax-warning-default)"
            >
            </ax-circular-progress>
            <div class="text-sm text-secondary mt-2">Warning</div>
          </div>

          <div class="flex flex-col items-center">
            <ax-circular-progress
              [value]="42"
              size="md"
              color="var(--ax-error)"
            >
            </ax-circular-progress>
            <div class="text-sm text-secondary mt-2">Error</div>
          </div>

          <div class="flex flex-col items-center">
            <ax-circular-progress
              [value]="75"
              size="md"
              color="var(--ax-purple-default)"
            >
            </ax-circular-progress>
            <div class="text-sm text-secondary mt-2">Purple</div>
          </div>
        </div>
      </section>

      <!-- Pattern 5: Auto Color (Thresholds) -->
      <div class="section-header">
        <h2>Pattern 5: Automatic Color Based on Value</h2>
        <p>Colors change automatically based on threshold values.</p>
      </div>

      <section>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="flex flex-col items-center">
            <ax-circular-progress
              [value]="95"
              size="md"
              [autoColor]="true"
              [successThreshold]="80"
              [warningThreshold]="50"
            >
            </ax-circular-progress>
            <div class="text-sm text-secondary mt-2">95% (Green: ≥80%)</div>
          </div>

          <div class="flex flex-col items-center">
            <ax-circular-progress
              [value]="65"
              size="md"
              [autoColor]="true"
              [successThreshold]="80"
              [warningThreshold]="50"
            >
            </ax-circular-progress>
            <div class="text-sm text-secondary mt-2">65% (Yellow: 50-79%)</div>
          </div>

          <div class="flex flex-col items-center">
            <ax-circular-progress
              [value]="35"
              size="md"
              [autoColor]="true"
              [successThreshold]="80"
              [warningThreshold]="50"
            >
            </ax-circular-progress>
            <div class="text-sm text-secondary mt-2">35% (Red: &lt;50%)</div>
          </div>

          <div class="flex flex-col items-center">
            <ax-circular-progress
              [value]="100"
              size="md"
              [autoColor]="true"
              [successThreshold]="80"
              [warningThreshold]="50"
            >
            </ax-circular-progress>
            <div class="text-sm text-secondary mt-2">100% (Perfect)</div>
          </div>
        </div>
      </section>

      <!-- Benefits Summary -->
      <div class="section-header">
        <h2>Component Benefits</h2>
      </div>

      <section>
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-semibold mb-3">✨ Features</h3>
                <ul class="space-y-2 text-sm">
                  <li>✅ SVG-based (crisp at any size)</li>
                  <li>✅ Multiple size variants (sm, md, lg, xl)</li>
                  <li>✅ Custom colors via design tokens</li>
                  <li>✅ Automatic color based on thresholds</li>
                  <li>✅ Configurable stroke width</li>
                  <li>✅ Optional center label</li>
                  <li>✅ Smooth animations</li>
                  <li>✅ Full dark mode support</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-3">🎨 Design Tokens</h3>
                <ul class="space-y-2 text-sm">
                  <li>• Uses <code>--ax-border-default</code> for track</li>
                  <li>
                    • Uses <code>--ax-info/success/warning/error</code> for
                    colors
                  </li>
                  <li>• Uses <code>--ax-text-*</code> for label sizes</li>
                  <li>• Uses <code>--ax-font-semibold</code> for weight</li>
                  <li>• Fully theme-aware and responsive</li>
                </ul>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </section>
    </div>
  `,
  styles: [
    `
      .metric-card {
        background-color: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        transition: all 0.2s ease;
      }

      .metric-card:hover {
        box-shadow: var(--ax-shadow-sm);
      }

      code {
        background-color: var(--ax-background-subtle);
        padding: 2px 6px;
        border-radius: var(--ax-radius-sm);
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
        color: var(--ax-text-primary);
      }
    `,
  ],
})
export class CircularProgressDemoComponent {}
