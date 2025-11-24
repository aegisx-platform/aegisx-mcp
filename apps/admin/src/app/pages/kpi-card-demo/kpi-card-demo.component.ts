import { AxKpiCardComponent } from '@aegisx/ui';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-kpi-card-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    AxKpiCardComponent,
  ],
  template: `
    <div class="docs-page">
      <!-- Page Header -->
      <div class="docs-header">
        <div class="docs-breadcrumb">
          <a routerLink="/card-examples" mat-flat-button color="primary">
            <mat-icon>arrow_back</mat-icon>
            Card Examples
          </a>
          <mat-icon>chevron_right</mat-icon>
          <span>AX KPI Card Demo</span>
        </div>

        <h1 class="docs-title">AX KPI Card Component Demo</h1>
        <p class="docs-subtitle">
          Comparison between manual Tailwind cards and the new
          <code>ax-kpi-card</code> component
        </p>
      </div>

      <!-- ========================================
           Pattern 1: Simple Variant
           ======================================== -->
      <div class="section-header">
        <h2>Pattern 1: Simple (Label + Value + Change)</h2>
        <p>Clean, minimal cards with value and percentage change inline.</p>
      </div>

      <section>
        <h3 class="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
          ❌ Before: Manual Tailwind (17 lines)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <!-- Manual Tailwind Version -->
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-lg font-normal text-secondary mb-3">
                Unique visitors
              </div>
              <div class="flex items-baseline gap-3">
                <div class="text-3xl font-semibold text-heading">10,450</div>
                <div class="text-sm font-medium text-error">-12.5%</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-lg font-normal text-secondary mb-3">
                Bounce rate
              </div>
              <div class="flex items-baseline gap-3">
                <div class="text-3xl font-semibold text-heading">56.1%</div>
                <div class="text-sm font-medium text-success">+1.8%</div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="text-lg font-normal text-secondary mb-3">
                Visit duration
              </div>
              <div class="flex items-baseline gap-3">
                <div class="text-3xl font-semibold text-heading">5.2min</div>
                <div class="text-sm font-medium text-success">+19.7%</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <h3
          class="text-lg font-semibold mb-4 text-green-700 dark:text-green-400"
        >
          ✅ After: ax-kpi-card (1 line each)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Component Version -->
          <ax-kpi-card
            label="Unique visitors"
            [value]="10450"
            [change]="-12.5"
            changeType="down"
            [hoverable]="true"
          ></ax-kpi-card>

          <ax-kpi-card
            label="Bounce rate"
            value="56.1%"
            [change]="1.8"
            [hoverable]="true"
          ></ax-kpi-card>

          <ax-kpi-card
            label="Visit duration"
            value="5.2min"
            [change]="19.7"
            [hoverable]="true"
          ></ax-kpi-card>
        </div>
      </section>

      <!-- ========================================
           Pattern 2: Badge Variant
           ======================================== -->
      <div class="section-header">
        <h2>Pattern 2: Badge (Label with Badge + Value)</h2>
        <p>Badge indicator for quick visual status identification.</p>
      </div>

      <section>
        <h3 class="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
          ❌ Before: Manual Tailwind
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex items-center justify-between mb-3">
                <div class="text-md font-normal text-secondary">
                  Daily active users
                </div>
                <div
                  class="text-sm font-medium text-success-emphasis bg-success-faint px-2 py-1 rounded"
                >
                  +12.1%
                </div>
              </div>
              <div class="text-3xl font-semibold text-heading">3,450</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex items-center justify-between mb-3">
                <div class="text-md font-normal text-secondary">
                  Weekly sessions
                </div>
                <div
                  class="text-sm font-medium text-error bg-error-faint px-2 py-1 rounded"
                >
                  -9.8%
                </div>
              </div>
              <div class="text-3xl font-semibold text-heading">1,342</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex items-center justify-between mb-3">
                <div class="text-md font-normal text-secondary">Duration</div>
                <div
                  class="text-sm font-medium text-success-emphasis bg-success-faint px-2 py-1 rounded"
                >
                  +7.7%
                </div>
              </div>
              <div class="text-3xl font-semibold text-heading">5.2min</div>
            </mat-card-content>
          </mat-card>
        </div>

        <h3
          class="text-lg font-semibold mb-4 text-green-700 dark:text-green-400"
        >
          ✅ After: ax-kpi-card
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ax-kpi-card
            variant="badge"
            label="Daily active users"
            [value]="3450"
            badge="+12.1%"
            badgeType="success"
            [hoverable]="true"
          ></ax-kpi-card>

          <ax-kpi-card
            variant="badge"
            label="Weekly sessions"
            [value]="1342"
            badge="-9.8%"
            badgeType="error"
            [hoverable]="true"
          ></ax-kpi-card>

          <ax-kpi-card
            variant="badge"
            label="Duration"
            value="5.2min"
            badge="+7.7%"
            badgeType="success"
            [hoverable]="true"
          ></ax-kpi-card>
        </div>
      </section>

      <!-- ========================================
           Pattern 3: Compact Variant
           ======================================== -->
      <div class="section-header">
        <h2>Pattern 3: Compact (Minimal Spacing)</h2>
        <p>Space-efficient layout for dashboards with many metrics.</p>
      </div>

      <section>
        <h3 class="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
          ❌ Before: Manual Tailwind
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex items-start justify-between space-x-2">
                <span class="truncate text-sm text-secondary"
                  >Recurring revenue</span
                >
                <span class="text-sm font-medium text-success">+6.1%</span>
              </div>
              <div class="mt-1 text-3xl font-semibold text-heading">$34.1K</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex items-start justify-between space-x-2">
                <span class="truncate text-sm text-secondary">Total users</span>
                <span class="text-sm font-medium text-success">+19.2%</span>
              </div>
              <div class="mt-1 text-3xl font-semibold text-heading">500.1K</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="kpi-card">
            <mat-card-content>
              <div class="flex items-start justify-between space-x-2">
                <span class="truncate text-sm text-secondary">User growth</span>
                <span class="text-sm font-medium text-error">-1.2%</span>
              </div>
              <div class="mt-1 text-3xl font-semibold text-heading">11.3%</div>
            </mat-card-content>
          </mat-card>
        </div>

        <h3
          class="text-lg font-semibold mb-4 text-green-700 dark:text-green-400"
        >
          ✅ After: ax-kpi-card
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ax-kpi-card
            variant="compact"
            label="Recurring revenue"
            value="$34.1K"
            [change]="6.1"
            [hoverable]="true"
          ></ax-kpi-card>

          <ax-kpi-card
            variant="compact"
            label="Total users"
            value="500.1K"
            [change]="19.2"
            [hoverable]="true"
          ></ax-kpi-card>

          <ax-kpi-card
            variant="compact"
            label="User growth"
            value="11.3%"
            [change]="-1.2"
            changeType="down"
            [hoverable]="true"
          ></ax-kpi-card>
        </div>
      </section>

      <!-- ========================================
           Pattern 4: Color Accent
           ======================================== -->
      <div class="section-header">
        <h2>Pattern 4: Color Accent Bar</h2>
        <p>Visual category identification with color-coded accent bars.</p>
      </div>

      <section>
        <h3
          class="text-lg font-semibold mb-4 text-green-700 dark:text-green-400"
        >
          ✨ New: ax-kpi-card with Accent
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ax-kpi-card
            variant="accent"
            label="Monthly active users"
            [value]="996"
            [change]="1.3"
            accentColor="info"
            accentPosition="left"
            [hoverable]="true"
          ></ax-kpi-card>

          <ax-kpi-card
            variant="accent"
            label="Revenue growth"
            value="$125K"
            [change]="23.5"
            accentColor="success"
            accentPosition="left"
            [hoverable]="true"
          ></ax-kpi-card>

          <ax-kpi-card
            variant="accent"
            label="Error rate"
            value="0.03%"
            [change]="-45.2"
            changeType="up"
            accentColor="error"
            accentPosition="left"
            [hoverable]="true"
          ></ax-kpi-card>
        </div>
      </section>

      <!-- ========================================
           Pattern 5: With Custom Content
           ======================================== -->
      <div class="section-header">
        <h2>Pattern 5: With Progress Bar</h2>
        <p>Content projection for charts, progress bars, and custom visuals.</p>
      </div>

      <section>
        <h3
          class="text-lg font-semibold mb-4 text-green-700 dark:text-green-400"
        >
          ✨ New: Content Projection
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ax-kpi-card label="Requests" [value]="996" [hoverable]="true">
            <mat-progress-bar
              mode="determinate"
              [value]="9.96"
              class="mb-2"
            ></mat-progress-bar>
            <div class="flex justify-between text-sm">
              <span class="font-medium text-info">9.96%</span>
              <span class="text-secondary">996 of 10,000</span>
            </div>
          </ax-kpi-card>

          <ax-kpi-card label="Credits" value="$672" [hoverable]="true">
            <mat-progress-bar
              mode="determinate"
              [value]="67.2"
              class="mb-2"
            ></mat-progress-bar>
            <div class="flex justify-between text-sm">
              <span class="font-medium text-info">67.2%</span>
              <span class="text-secondary">$672 of $1,000</span>
            </div>
          </ax-kpi-card>

          <ax-kpi-card label="Storage" value="1.85GB" [hoverable]="true">
            <mat-progress-bar
              mode="determinate"
              [value]="18.5"
              class="mb-2"
            ></mat-progress-bar>
            <div class="flex justify-between text-sm">
              <span class="font-medium text-info">18.5%</span>
              <span class="text-secondary">1.85 of 10GB</span>
            </div>
          </ax-kpi-card>
        </div>
      </section>

      <!-- ========================================
           Pattern 6: With Footer Action
           ======================================== -->
      <div class="section-header">
        <h2>Pattern 6: With Footer Actions</h2>
        <p>Action links and buttons in card footer.</p>
      </div>

      <section>
        <h3
          class="text-lg font-semibold mb-4 text-green-700 dark:text-green-400"
        >
          ✨ New: Footer Slot
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ax-kpi-card
            label="Monthly recurring revenue"
            value="$34.1K"
            [change]="6.1"
            [hoverable]="true"
          >
            <div footer class="flex justify-end">
              <a
                href="#"
                class="text-sm font-medium text-info hover:text-info no-underline"
              >
                View more →
              </a>
            </div>
          </ax-kpi-card>

          <ax-kpi-card
            label="Users"
            value="500.1K"
            [change]="19.2"
            [hoverable]="true"
          >
            <div footer class="flex justify-end">
              <a
                href="#"
                class="text-sm font-medium text-info hover:text-info no-underline"
              >
                View more →
              </a>
            </div>
          </ax-kpi-card>

          <ax-kpi-card
            label="User growth"
            value="11.3%"
            [change]="-1.2"
            changeType="down"
            [hoverable]="true"
          >
            <div footer class="flex justify-end">
              <a
                href="#"
                class="text-sm font-medium text-info hover:text-info no-underline"
              >
                View more →
              </a>
            </div>
          </ax-kpi-card>
        </div>
      </section>

      <!-- ========================================
           Pattern 7: Visual Indicator Bars
           ======================================== -->
      <div class="section-header">
        <h2>Pattern 7: Visual Indicator Bars</h2>
        <p>
          Overview metrics with visual bar indicators showing ratios and
          progress.
        </p>
      </div>

      <section>
        <h3
          class="text-lg font-semibold mb-4 text-green-700 dark:text-green-400"
        >
          ✨ New: Visual Indicator Variant
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Lead-to-Quote Ratio (2 out of 3 bars filled - Warning) -->
          <ax-kpi-card
            variant="visual-indicator"
            label="Lead-to-Quote Ratio"
            value="59.8%"
            supplementary="450/752"
            [barsFilled]="2"
            [barsTotal]="3"
            barColor="warning"
          ></ax-kpi-card>

          <!-- Project Load (1 out of 3 bars filled - Error) -->
          <ax-kpi-card
            variant="visual-indicator"
            label="Project Load"
            value="30.2%"
            supplementary="25/83"
            [barsFilled]="1"
            [barsTotal]="3"
            barColor="error"
          ></ax-kpi-card>

          <!-- Success Rate (3 out of 3 bars filled - Success) -->
          <ax-kpi-card
            variant="visual-indicator"
            label="Success Rate"
            value="94.7%"
            supplementary="161/170"
            [barsFilled]="3"
            [barsTotal]="3"
            barColor="success"
          ></ax-kpi-card>
        </div>
      </section>

      <!-- Summary -->
      <div class="section-header mt-12">
        <h2>📊 Benefits Summary</h2>
      </div>

      <section>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <mat-card>
            <mat-card-content class="p-6">
              <h3 class="text-lg font-semibold mb-4 text-error">
                ❌ Manual Tailwind Approach
              </h3>
              <ul class="space-y-2 text-sm">
                <li>• 15-20 lines of HTML per card</li>
                <li>• Inconsistent styling across pages</li>
                <li>• Hard to maintain color tokens</li>
                <li>• Manual dark mode handling</li>
                <li>• Repeated class combinations</li>
                <li>• No TypeScript type safety</li>
              </ul>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content class="p-6">
              <h3 class="text-lg font-semibold mb-4 text-success">
                ✅ ax-kpi-card Component
              </h3>
              <ul class="space-y-2 text-sm">
                <li>✨ 1 line of HTML per card</li>
                <li>✨ Consistent design system</li>
                <li>✨ Automatic design tokens</li>
                <li>✨ Built-in dark mode</li>
                <li>✨ Reusable variants</li>
                <li>✨ Full TypeScript types</li>
              </ul>
            </mat-card-content>
          </mat-card>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .docs-page {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
      }

      .docs-header {
        margin-bottom: 3rem;
      }

      .docs-breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        color: var(--ax-text-secondary);
      }

      .docs-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        color: var(--ax-text-primary);
      }

      .docs-subtitle {
        font-size: 1.125rem;
        color: var(--ax-text-secondary);
        margin: 0;
      }

      .section-header {
        margin: 3rem 0 1.5rem 0;

        h2 {
          font-size: 1.875rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: var(--ax-text-primary);
        }

        p {
          font-size: 1rem;
          color: var(--ax-text-secondary);
          margin: 0;
        }
      }

      section {
        margin-bottom: 3rem;
      }

      code {
        background-color: var(--ax-background-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-family: 'Courier New', monospace;
        font-size: 0.875em;
      }
    `,
  ],
})
export class KpiCardDemoComponent {}
