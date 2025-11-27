import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AxSegmentedProgressComponent, ProgressSegment } from '@aegisx/ui';

@Component({
  selector: 'app-segmented-progress-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    AxSegmentedProgressComponent,
  ],
  template: `
    <div class="docs-page">
      <!-- Page Header -->
      <div class="docs-header">
        <h1 class="docs-title">Segmented Progress Component</h1>
        <p class="docs-subtitle">
          Multi-segment progress bars with legends for displaying distribution
          metrics. Perfect for showing proportional data like ticket status,
          query performance, or resource allocation.
        </p>
      </div>

      <!-- ========================================
           Pattern 1: Ticket Status (3 segments)
           ======================================== -->
      <div class="section-header">
        <h2>Pattern 1: Ticket Status Distribution</h2>
        <p>Track ticket resolution, in-progress, and escalated states.</p>
      </div>

      <section>
        <h3
          class="text-lg font-semibold mb-4 text-green-700 dark:text-green-400"
        >
          ✨ New: ax-segmented-progress Component
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Current Tickets -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-sm text-secondary mb-2">Current Tickets</div>
              <div class="text-3xl font-semibold text-heading mb-4">247</div>

              <ax-segmented-progress
                [segments]="ticketSegments"
                size="md"
                legendPosition="bottom"
                [showPercentage]="false"
                [showValue]="false"
              >
              </ax-segmented-progress>
            </mat-card-content>
          </mat-card>

          <!-- Database Queries -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-sm text-secondary mb-2">Database Queries</div>
              <div class="text-3xl font-semibold text-heading mb-4">44,757</div>

              <ax-segmented-progress
                [segments]="querySegments"
                size="md"
                legendPosition="bottom"
                [showPercentage]="false"
                [showValue]="false"
              >
              </ax-segmented-progress>
            </mat-card-content>
          </mat-card>

          <!-- Query Latency -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-sm text-secondary mb-2">Query Latency</div>
              <div class="text-3xl font-semibold text-heading mb-4">
                1,247ms
              </div>

              <ax-segmented-progress
                [segments]="latencySegments"
                size="md"
                legendPosition="bottom"
                [showPercentage]="false"
                [showValue]="false"
              >
              </ax-segmented-progress>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- ========================================
           Pattern 2: Sales Channel Distribution (4 segments)
           ======================================== -->
      <div class="section-header">
        <h2>Pattern 2: Sales Channel Distribution</h2>
        <p>
          Multi-category distribution with 4+ segments and large progress bar.
        </p>
      </div>

      <section>
        <div class="max-w-4xl">
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-sm text-secondary mb-2">Total sales</div>
              <div class="text-4xl font-semibold text-heading mb-4">
                $292,400
              </div>
              <div class="text-sm text-secondary mb-3">
                Sales channel distribution
              </div>

              <ax-segmented-progress
                [segments]="salesSegments"
                size="lg"
                rounded="full"
                legendPosition="bottom"
                [showPercentage]="true"
                [showValue]="true"
                [gap]="4"
              >
              </ax-segmented-progress>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- ========================================
           Pattern 3: Token Usage (2 segments)
           ======================================== -->
      <div class="section-header">
        <h2>Pattern 3: Token Usage Metrics</h2>
        <p>Binary distribution showing completion vs prompt tokens.</p>
      </div>

      <section>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Average tokens per request -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-sm text-secondary mb-3">
                Average tokens per request
              </div>
              <div class="text-4xl font-semibold text-heading mb-4">341</div>

              <ax-segmented-progress
                [segments]="avgTokenSegments"
                size="md"
                rounded="sm"
                legendPosition="bottom"
                [gap]="0"
              >
              </ax-segmented-progress>
            </mat-card-content>
          </mat-card>

          <!-- Total tokens -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-sm text-secondary mb-3">Total tokens</div>
              <div class="text-4xl font-semibold text-heading mb-4">4,229</div>

              <ax-segmented-progress
                [segments]="totalTokenSegments"
                size="md"
                rounded="sm"
                legendPosition="bottom"
                [gap]="0"
              >
              </ax-segmented-progress>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- ========================================
           Pattern 4: Size Variants
           ======================================== -->
      <div class="section-header">
        <h2>Pattern 4: Size Variants</h2>
        <p>Small, medium, and large progress bars.</p>
      </div>

      <section>
        <div class="grid grid-cols-1 gap-6">
          <!-- Small -->
          <div>
            <div class="text-sm font-medium mb-2">Small (6px height)</div>
            <ax-segmented-progress
              [segments]="ticketSegments"
              size="sm"
              legendPosition="bottom"
            >
            </ax-segmented-progress>
          </div>

          <!-- Medium -->
          <div>
            <div class="text-sm font-medium mb-2">Medium (8px height)</div>
            <ax-segmented-progress
              [segments]="ticketSegments"
              size="md"
              legendPosition="bottom"
            >
            </ax-segmented-progress>
          </div>

          <!-- Large -->
          <div>
            <div class="text-sm font-medium mb-2">Large (12px height)</div>
            <ax-segmented-progress
              [segments]="ticketSegments"
              size="lg"
              legendPosition="bottom"
            >
            </ax-segmented-progress>
          </div>
        </div>
      </section>

      <!-- ========================================
           Pattern 5: Legend Positions
           ======================================== -->
      <div class="section-header">
        <h2>Pattern 5: Legend Positions</h2>
        <p>Bottom legend vs right-side legend vs no legend.</p>
      </div>

      <section>
        <div class="grid grid-cols-1 gap-6">
          <!-- Bottom Legend -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-sm font-medium mb-3">Legend: Bottom</div>
              <ax-segmented-progress
                [segments]="salesSegments"
                size="md"
                legendPosition="bottom"
              >
              </ax-segmented-progress>
            </mat-card-content>
          </mat-card>

          <!-- Right Legend -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-sm font-medium mb-3">Legend: Right</div>
              <ax-segmented-progress
                [segments]="salesSegments"
                size="md"
                legendPosition="right"
              >
              </ax-segmented-progress>
            </mat-card-content>
          </mat-card>

          <!-- No Legend -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-sm font-medium mb-3">Legend: None</div>
              <ax-segmented-progress
                [segments]="salesSegments"
                size="md"
                legendPosition="none"
              >
              </ax-segmented-progress>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- ========================================
           Benefits Summary
           ======================================== -->
      <div class="section-header">
        <h2>Component Benefits</h2>
      </div>

      <section>
        <mat-card class="kpi-card">
          <mat-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-semibold mb-3">✨ Features</h3>
                <ul class="space-y-2 text-sm">
                  <li>✅ Multi-segment support (2-10+ segments)</li>
                  <li>✅ Automatic percentage calculation</li>
                  <li>✅ Flexible legend positions (bottom, right, none)</li>
                  <li>✅ Size variants (sm, md, lg)</li>
                  <li>✅ Rounded corners (none, sm, md, lg, full)</li>
                  <li>✅ Configurable segment gaps</li>
                  <li>✅ Show/hide values and percentages</li>
                  <li>✅ Full dark mode support</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-3">🎨 Design Tokens</h3>
                <ul class="space-y-2 text-sm">
                  <li>• Uses <code>--ax-text-*</code> for text colors</li>
                  <li>• Uses <code>--ax-spacing-*</code> for gaps</li>
                  <li>• Uses <code>--ax-radius-*</code> for borders</li>
                  <li>• Uses <code>--ax-font-*</code> for typography</li>
                  <li>• Fully theme-aware and responsive</li>
                  <li>• Custom colors via segment.color</li>
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
      .kpi-card {
        background-color: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        transition: all 0.2s ease;
      }

      .kpi-card:hover {
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
export class SegmentedProgressDemoComponent {
  // Pattern 1: Ticket Status (3 segments)
  ticketSegments: ProgressSegment[] = [
    {
      label: 'Resolved',
      value: 203,
      percentage: 82,
      color: 'var(--ax-info-default)',
    },
    {
      label: 'Progress',
      value: 32,
      percentage: 13,
      color: 'var(--ax-text-secondary)',
    },
    {
      label: 'Escalated',
      value: 12,
      percentage: 5,
      color: 'var(--ax-error)',
    },
  ];

  // Database Queries
  querySegments: ProgressSegment[] = [
    {
      label: 'Optimized',
      value: 25511,
      percentage: 57,
      color: 'var(--ax-info-default)',
    },
    {
      label: 'Editing',
      value: 5371,
      percentage: 12,
      color: 'var(--ax-text-secondary)',
    },
    {
      label: 'Slow',
      value: 13875,
      percentage: 31,
      color: 'var(--ax-error)',
    },
  ];

  // Query Latency
  latencySegments: ProgressSegment[] = [
    {
      label: 'Fast',
      value: 935,
      percentage: 75,
      color: 'var(--ax-info-default)',
    },
    {
      label: 'Medium',
      value: 249,
      percentage: 20,
      color: 'var(--ax-text-secondary)',
    },
    {
      label: 'Slow',
      value: 62,
      percentage: 5,
      color: 'var(--ax-error)',
    },
  ];

  // Pattern 2: Sales Distribution (4 segments)
  salesSegments: ProgressSegment[] = [
    {
      label: 'Direct sales',
      value: 100500,
      percentage: 34.4,
      color: 'var(--ax-info-default)',
    },
    {
      label: 'Retail stores',
      value: 89500,
      percentage: 30.6,
      color: 'var(--ax-warning-default)',
    },
    {
      label: 'E-commerce',
      value: 61200,
      percentage: 20.9,
      color: 'var(--ax-cyan)',
    },
    {
      label: 'Wholesale',
      value: 41200,
      percentage: 14.1,
      color: 'var(--ax-text-secondary)',
    },
  ];

  // Pattern 3: Token Usage (2 segments)
  avgTokenSegments: ProgressSegment[] = [
    {
      label: 'Completion tokens',
      value: 136,
      percentage: 39.9,
      color: 'var(--ax-cyan)',
    },
    {
      label: 'Prompt tokens',
      value: 205,
      percentage: 60.1,
      color: 'var(--ax-purple)',
    },
  ];

  totalTokenSegments: ProgressSegment[] = [
    {
      label: 'Completion tokens',
      value: 1480,
      percentage: 35,
      color: 'var(--ax-cyan)',
    },
    {
      label: 'Prompt tokens',
      value: 2749,
      percentage: 65,
      color: 'var(--ax-purple)',
    },
  ];
}
