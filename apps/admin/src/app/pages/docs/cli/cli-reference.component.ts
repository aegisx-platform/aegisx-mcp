import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  DocHeaderComponent,
  LivePreviewComponent,
} from '../../../components/docs';

interface CliOption {
  name: string;
  alias: string;
  default: string;
  description: string;
}

interface DomainRoute {
  domain: string;
  api: string;
}

interface ShellType {
  type: string;
  icon: string;
  description: string;
  component: string;
}

interface LicenseTier {
  name: string;
  price: string;
  features: string[];
}

@Component({
  selector: 'ax-cli-reference',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTabsModule,
    MatExpansionModule,
    DocHeaderComponent,
    LivePreviewComponent,
  ],
  template: `
    <div class="cli-reference">
      <ax-doc-header
        title="AegisX CLI Reference"
        icon="terminal"
        description="Complete command-line reference for AegisX CRUD Generator - Premium CLI tool for generating full-stack CRUD modules"
        [breadcrumbs]="[
          { label: 'Docs', link: '/docs' },
          { label: 'CLI Reference' },
        ]"
        status="stable"
        version="2.1.0"
      ></ax-doc-header>

      <!-- Quick Install -->
      <section class="section">
        <h2>Installation</h2>
        <div class="install-cards">
          <div class="install-card">
            <div class="install-header">
              <mat-icon>download</mat-icon>
              <span>Global Install</span>
            </div>
            <div class="code-block">
              <pre><code>npm install -g &#64;aegisx/cli</code></pre>
            </div>
          </div>
          <div class="install-card">
            <div class="install-header">
              <mat-icon>play_arrow</mat-icon>
              <span>Quick Start</span>
            </div>
            <div class="code-block">
              <pre><code>aegisx trial
aegisx generate products --force</code></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- Generate Command -->
      <section class="section">
        <h2>
          <mat-icon>terminal</mat-icon>
          aegisx generate
        </h2>
        <p>
          Generate CRUD modules for backend or frontend from database tables
        </p>

        <h3>Syntax</h3>
        <div class="code-block syntax">
          <pre><code>aegisx generate &lt;table-name&gt; [options]</code></pre>
        </div>

        <h3>Options</h3>
        <div class="options-table">
          <div class="option-row header">
            <div class="col-option">Option</div>
            <div class="col-alias">Alias</div>
            <div class="col-default">Default</div>
            <div class="col-desc">Description</div>
          </div>
          @for (opt of generateOptions; track opt.name) {
            <div class="option-row">
              <div class="col-option">
                <code>{{ opt.name }}</code>
              </div>
              <div class="col-alias">
                <code>{{ opt.alias || '-' }}</code>
              </div>
              <div class="col-default">
                <code>{{ opt.default }}</code>
              </div>
              <div class="col-desc">{{ opt.description }}</div>
            </div>
          }
        </div>

        <h3>Examples</h3>
        <div class="code-block">
          <pre><code>{{ generateExamples }}</code></pre>
        </div>
      </section>

      <!-- Domain-Based Generation -->
      <section class="section">
        <h2>
          <mat-icon>folder_special</mat-icon>
          Domain-Based Generation
        </h2>
        <p>
          Organize modules in domain structure for better project organization
        </p>

        <h3>Syntax</h3>
        <div class="code-block syntax">
          <pre><code>aegisx generate &lt;table-name&gt; --domain &lt;path&gt; [options]</code></pre>
        </div>

        <div class="domain-comparison">
          <div class="comparison-item">
            <h4>Before: Flat Structure</h4>
            <div class="code-block">
              <pre><code>{{ domainBefore }}</code></pre>
            </div>
          </div>
          <div class="comparison-item">
            <h4>After: Domain Structure</h4>
            <div class="code-block">
              <pre><code>{{ domainAfter }}</code></pre>
            </div>
          </div>
        </div>

        <h3>Domain Examples</h3>
        <div class="code-block">
          <pre><code>{{ domainExamples }}</code></pre>
        </div>

        <h3>API Routes Mapping</h3>
        <div class="options-table">
          <div class="option-row header">
            <div class="col-domain">Domain Path</div>
            <div class="col-route">API Route</div>
          </div>
          @for (route of domainRoutes; track route.domain) {
            <div class="option-row">
              <div class="col-domain">
                <code>{{ route.domain }}</code>
              </div>
              <div class="col-route">
                <code>{{ route.api }}</code>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Shell Command -->
      <section class="section">
        <h2>
          <mat-icon>web</mat-icon>
          aegisx shell
        </h2>
        <p>Generate Angular app shell with layout and navigation</p>

        <h3>Syntax</h3>
        <div class="code-block syntax">
          <pre><code>aegisx shell &lt;name&gt; [options]</code></pre>
        </div>

        <h3>Options</h3>
        <div class="options-table">
          <div class="option-row header">
            <div class="col-option">Option</div>
            <div class="col-alias">Alias</div>
            <div class="col-default">Default</div>
            <div class="col-desc">Description</div>
          </div>
          @for (opt of shellOptions; track opt.name) {
            <div class="option-row">
              <div class="col-option">
                <code>{{ opt.name }}</code>
              </div>
              <div class="col-alias">
                <code>{{ opt.alias || '-' }}</code>
              </div>
              <div class="col-default">
                <code>{{ opt.default }}</code>
              </div>
              <div class="col-desc">{{ opt.description }}</div>
            </div>
          }
        </div>

        <h3>Shell Types</h3>
        <div class="shell-types">
          @for (shell of shellTypes; track shell.type) {
            <div class="shell-card">
              <div class="shell-header">
                <mat-icon>{{ shell.icon }}</mat-icon>
                <span>{{ shell.type }}</span>
              </div>
              <p>{{ shell.description }}</p>
              <code>{{ shell.component }}</code>
            </div>
          }
        </div>

        <h3>Examples</h3>
        <div class="code-block">
          <pre><code>{{ shellExamples }}</code></pre>
        </div>
      </section>

      <!-- Database Commands -->
      <section class="section">
        <h2>
          <mat-icon>storage</mat-icon>
          Database Commands
        </h2>

        <div class="command-group">
          <h3>aegisx list-tables</h3>
          <p>List available database tables from PostgreSQL</p>
          <div class="code-block">
            <pre><code>{{ listTablesExamples }}</code></pre>
          </div>
        </div>

        <div class="command-group">
          <h3>aegisx validate</h3>
          <p>Validate generated module structure and files</p>
          <div class="code-block">
            <pre><code>{{ validateExamples }}</code></pre>
          </div>
        </div>

        <div class="command-group">
          <h3>Schema Options</h3>
          <p>Read from specific PostgreSQL schema (not just public)</p>
          <div class="code-block">
            <pre><code>{{ schemaExamples }}</code></pre>
          </div>
        </div>
      </section>

      <!-- License Commands -->
      <section class="section">
        <h2>
          <mat-icon>key</mat-icon>
          License Commands
        </h2>

        <div class="code-block">
          <pre><code>{{ licenseCommands }}</code></pre>
        </div>

        <h3>License Key Format</h3>
        <div class="code-block syntax">
          <pre><code>AEGISX-[TIER]-[SERIAL]-[CHECKSUM]</code></pre>
        </div>

        <h3>License Tiers</h3>
        <div class="license-grid">
          @for (tier of licenseTiers; track tier.name) {
            <div class="license-card">
              <div class="license-header">
                <span class="tier-name">{{ tier.name }}</span>
                <span class="tier-price">{{ tier.price }}</span>
              </div>
              <ul class="tier-features">
                @for (feature of tier.features; track feature) {
                  <li>
                    <mat-icon>check</mat-icon>
                    {{ feature }}
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </section>

      <!-- pnpm Scripts -->
      <section class="section">
        <h2>
          <mat-icon>content_copy</mat-icon>
          pnpm Scripts (Monorepo)
        </h2>
        <p>Shortcut scripts for common operations in monorepo projects</p>

        <div class="code-block">
          <pre><code>{{ pnpmScripts }}</code></pre>
        </div>

        <div class="warning-box">
          <mat-icon>warning</mat-icon>
          <span
            ><strong>Important:</strong> Always use <code>--</code> separator
            before table name when using pnpm scripts!</span
          >
        </div>

        <h3>Feature Packages</h3>
        <div class="packages-grid">
          @for (pkg of packages; track pkg.name) {
            <div class="package-card">
              <div class="package-header">
                <mat-icon>{{ pkg.icon }}</mat-icon>
                <span>{{ pkg.name }}</span>
              </div>
              <p>{{ pkg.description }}</p>
              <div class="package-features">
                @for (feature of pkg.features; track feature) {
                  <span class="feature-tag">{{ feature }}</span>
                }
              </div>
              <div class="code-block compact">
                <pre><code>{{ pkg.command }}</code></pre>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Generated Files -->
      <section class="section">
        <h2>
          <mat-icon>folder</mat-icon>
          Generated Files
        </h2>

        <mat-tab-group animationDuration="200ms">
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>storage</mat-icon>
              <span>Backend</span>
            </ng-template>
            <div class="tab-content">
              <div class="files-table">
                <div class="file-row header">
                  <div class="col-file">File</div>
                  <div class="col-desc">Description</div>
                </div>
                @for (file of backendFiles; track file.name) {
                  <div class="file-row">
                    <div class="col-file">
                      <mat-icon>{{ file.icon }}</mat-icon>
                      <code>{{ file.name }}</code>
                    </div>
                    <div class="col-desc">{{ file.description }}</div>
                  </div>
                }
              </div>
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>web</mat-icon>
              <span>Frontend</span>
            </ng-template>
            <div class="tab-content">
              <div class="files-table">
                <div class="file-row header">
                  <div class="col-file">File</div>
                  <div class="col-desc">Description</div>
                </div>
                @for (file of frontendFiles; track file.name) {
                  <div class="file-row">
                    <div class="col-file">
                      <mat-icon>{{ file.icon }}</mat-icon>
                      <code>{{ file.name }}</code>
                    </div>
                    <div class="col-desc">{{ file.description }}</div>
                  </div>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </section>

      <!-- Complete Workflow -->
      <section class="section">
        <h2>
          <mat-icon>account_tree</mat-icon>
          Complete Workflow
        </h2>
        <p>Step-by-step guide to generate a complete CRUD feature</p>

        <div class="workflow-steps">
          <div class="workflow-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Create Database Migration</h4>
              <div class="code-block compact">
                <pre><code>npx knex migrate:make create_products_table</code></pre>
              </div>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Run Migration</h4>
              <div class="code-block compact">
                <pre><code>pnpm run db:migrate</code></pre>
              </div>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Generate Backend</h4>
              <div class="code-block compact">
                <pre><code>pnpm run crud -- products --force</code></pre>
              </div>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>Generate Frontend</h4>
              <div class="code-block compact">
                <pre><code>aegisx generate products --target frontend --force</code></pre>
              </div>
            </div>
          </div>

          <div class="workflow-step">
            <div class="step-number">5</div>
            <div class="step-content">
              <h4>Test & Verify</h4>
              <div class="code-block compact">
                <pre><code>pnpm run build && pnpm run dev:api</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Links -->
      <section class="section">
        <h2>Related Documentation</h2>
        <div class="quick-links">
          <a routerLink="/tools/crud-generator" class="quick-link">
            <mat-icon>construction</mat-icon>
            <span>CRUD Generator Tool</span>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </a>
          <a routerLink="/docs/getting-started/introduction" class="quick-link">
            <mat-icon>home</mat-icon>
            <span>Getting Started</span>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .cli-reference {
        max-width: 1000px;
        margin: 0 auto;
        padding: 2rem;
      }

      .section {
        margin-bottom: 3rem;

        h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: var(--ax-text-2xl);
          font-weight: var(--ax-font-weight-semibold);
          color: var(--ax-text-heading);
          margin-bottom: 0.75rem;

          mat-icon {
            color: var(--ax-primary-default);
          }
        }

        h3 {
          font-size: var(--ax-text-lg);
          font-weight: var(--ax-font-weight-semibold);
          color: var(--ax-text-heading);
          margin: 2rem 0 1rem;
        }

        h4 {
          font-size: var(--ax-text-base);
          font-weight: var(--ax-font-weight-medium);
          color: var(--ax-text-heading);
          margin: 0 0 0.5rem;
        }

        > p {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          line-height: var(--ax-leading-normal);
        }
      }

      .install-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .install-card {
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg);
        padding: 1.5rem;

        .install-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-weight: var(--ax-font-weight-semibold);
          color: var(--ax-text-heading);

          mat-icon {
            color: var(--ax-primary-default);
          }
        }
      }

      .code-block {
        background: #1e1e2e;
        border-radius: var(--ax-radius-md);
        padding: 1rem 1.25rem;
        overflow-x: auto;

        &.syntax {
          background: var(--ax-background-subtle);
          border: 1px solid var(--ax-border-muted);
        }

        &.compact {
          padding: 0.75rem 1rem;
        }

        pre {
          margin: 0;

          code {
            font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
            font-size: var(--ax-text-sm);
            color: #cdd6f4;
            white-space: pre-wrap;
            line-height: 1.6;
          }
        }
      }

      .syntax pre code {
        color: var(--ax-text-heading);
      }

      .options-table {
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg);
        overflow: hidden;
        margin-bottom: 1.5rem;

        .option-row {
          display: grid;
          grid-template-columns: 180px 80px 100px 1fr;
          gap: 1rem;
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid var(--ax-border-muted);
          align-items: center;

          &:last-child {
            border-bottom: none;
          }

          &.header {
            background: var(--ax-background-subtle);
            font-size: var(--ax-text-xs);
            font-weight: var(--ax-font-weight-semibold);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--ax-text-muted);
          }

          &:not(.header):hover {
            background: var(--ax-background-subtle);
          }

          code {
            font-family: var(--ax-font-mono);
            font-size: var(--ax-text-xs);
            color: var(--ax-text-heading);
          }

          .col-desc {
            font-size: var(--ax-text-sm);
            color: var(--ax-text-secondary);
          }
        }
      }

      .domain-comparison {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 2rem;

        .comparison-item h4 {
          margin-bottom: 0.75rem;
        }
      }

      .shell-types {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .shell-card {
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg);
        padding: 1.25rem;

        .shell-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;

          mat-icon {
            color: var(--ax-primary-default);
          }

          span {
            font-weight: var(--ax-font-weight-semibold);
            color: var(--ax-text-heading);
          }
        }

        p {
          font-size: var(--ax-text-sm);
          color: var(--ax-text-secondary);
          margin: 0 0 0.75rem;
        }

        > code {
          font-family: var(--ax-font-mono);
          font-size: var(--ax-text-xs);
          color: var(--ax-primary-default);
          background: var(--ax-primary-faint);
          padding: 0.25rem 0.5rem;
          border-radius: var(--ax-radius-sm);
        }
      }

      .command-group {
        margin-bottom: 2rem;

        h3 {
          margin-top: 0;
        }

        > p {
          color: var(--ax-text-secondary);
          font-size: var(--ax-text-sm);
          margin-bottom: 1rem;
        }
      }

      .license-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      .license-card {
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg);
        padding: 1.25rem;

        .license-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;

          .tier-name {
            font-weight: var(--ax-font-weight-semibold);
            color: var(--ax-text-heading);
          }

          .tier-price {
            font-size: var(--ax-text-sm);
            color: var(--ax-primary-default);
            font-weight: var(--ax-font-weight-medium);
          }
        }

        .tier-features {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0;
            font-size: var(--ax-text-sm);
            color: var(--ax-text-secondary);

            mat-icon {
              font-size: 16px;
              width: 16px;
              height: 16px;
              color: var(--ax-success-default);
            }
          }
        }
      }

      .packages-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
      }

      .package-card {
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg);
        padding: 1.5rem;

        .package-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;

          mat-icon {
            color: var(--ax-primary-default);
          }

          span {
            font-weight: var(--ax-font-weight-semibold);
            color: var(--ax-text-heading);
          }
        }

        > p {
          font-size: var(--ax-text-sm);
          color: var(--ax-text-secondary);
          margin: 0 0 1rem;
        }

        .package-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;

          .feature-tag {
            font-size: var(--ax-text-xs);
            padding: 0.25rem 0.5rem;
            background: var(--ax-primary-faint);
            color: var(--ax-primary-default);
            border-radius: var(--ax-radius-sm);
          }
        }
      }

      .warning-box {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: var(--ax-warning-faint);
        border: 1px solid var(--ax-warning-muted);
        border-radius: var(--ax-radius-md);
        margin: 1.5rem 0;

        mat-icon {
          color: var(--ax-warning-default);
          flex-shrink: 0;
        }

        span {
          font-size: var(--ax-text-sm);
          color: var(--ax-text-heading);

          code {
            font-family: var(--ax-font-mono);
            font-size: var(--ax-text-xs);
            color: var(--ax-warning-default);
            background: var(--ax-warning-faint);
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
          }
        }
      }

      .tab-content {
        padding: 1.5rem 0;
      }

      .files-table {
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg);
        overflow: hidden;

        .file-row {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 1rem;
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid var(--ax-border-muted);
          align-items: center;

          &:last-child {
            border-bottom: none;
          }

          &.header {
            background: var(--ax-background-subtle);
            font-size: var(--ax-text-xs);
            font-weight: var(--ax-font-weight-semibold);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--ax-text-muted);
          }

          &:not(.header):hover {
            background: var(--ax-background-subtle);
          }

          .col-file {
            display: flex;
            align-items: center;
            gap: 0.75rem;

            mat-icon {
              color: var(--ax-primary-default);
              font-size: 20px;
              width: 20px;
              height: 20px;
            }

            code {
              font-family: var(--ax-font-mono);
              font-size: var(--ax-text-xs);
              color: var(--ax-text-heading);
            }
          }

          .col-desc {
            font-size: var(--ax-text-sm);
            color: var(--ax-text-secondary);
          }
        }
      }

      .workflow-steps {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .workflow-step {
        display: flex;
        gap: 1.25rem;
        align-items: flex-start;

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: var(--ax-text-base);
          font-weight: var(--ax-font-weight-bold);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
          padding-bottom: 1rem;
          border-left: 2px solid var(--ax-border-muted);
          padding-left: 1.25rem;
          margin-left: -1.5rem;
        }

        &:last-child .step-content {
          border-left: none;
        }
      }

      .quick-links {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1rem;
      }

      .quick-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
        text-decoration: none;
        color: var(--ax-text-heading);
        font-weight: var(--ax-font-weight-medium);
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--ax-primary-default);
          background: var(--ax-primary-faint);
          transform: translateX(4px);

          .arrow {
            opacity: 1;
            transform: translateX(4px);
          }
        }

        mat-icon:first-child {
          color: var(--ax-primary-default);
        }

        span {
          flex: 1;
        }

        .arrow {
          opacity: 0;
          transition: all 0.2s ease;
          color: var(--ax-primary-default);
        }
      }

      @media (max-width: 768px) {
        .options-table .option-row {
          grid-template-columns: 1fr;
          gap: 0.5rem;

          &.header {
            display: none;
          }
        }

        .domain-comparison {
          grid-template-columns: 1fr;
        }

        .files-table .file-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CliReferenceComponent {
  generateOptions: CliOption[] = [
    {
      name: '--target',
      alias: '-t',
      default: 'backend',
      description: 'Generation target (backend or frontend)',
    },
    {
      name: '--force',
      alias: '-f',
      default: 'false',
      description: 'Overwrite existing files without prompt',
    },
    {
      name: '--dry-run',
      alias: '-d',
      default: 'false',
      description: 'Preview files without creating',
    },
    {
      name: '--package',
      alias: '',
      default: 'standard',
      description: 'Package: standard, enterprise, full',
    },
    {
      name: '--with-events',
      alias: '-e',
      default: 'false',
      description: 'Include WebSocket real-time events',
    },
    {
      name: '--with-import',
      alias: '',
      default: 'false',
      description: 'Include bulk import (Excel/CSV)',
    },
    {
      name: '--domain',
      alias: '',
      default: '',
      description: 'Domain path for module organization',
    },
    {
      name: '--schema',
      alias: '',
      default: 'public',
      description: 'PostgreSQL schema to read from',
    },
    {
      name: '--app',
      alias: '-a',
      default: 'api',
      description: 'Target app: api, web, admin',
    },
    {
      name: '--flat',
      alias: '',
      default: 'false',
      description: 'Use flat structure (no domain nesting)',
    },
    {
      name: '--no-register',
      alias: '',
      default: 'false',
      description: 'Skip auto-registration in index.ts',
    },
  ];

  generateExamples = `# Basic CRUD generation
aegisx generate products --force

# Frontend generation
aegisx generate products --target frontend --force

# With import functionality (Excel/CSV)
aegisx generate products --with-import --force

# With WebSocket events (real-time updates)
aegisx generate products --with-events --force

# Full package (all features)
aegisx generate products --with-import --with-events --force

# Domain-based organization
aegisx generate drugs --domain inventory/master-data --force

# Read from specific PostgreSQL schema
aegisx generate products --schema inventory --force

# Dry run (preview files only)
aegisx generate products --dry-run`;

  domainBefore = `modules/
├── products/
├── categories/
├── brands/
├── suppliers/
└── warehouses/`;

  domainAfter = `modules/
└── inventory/
    └── master-data/
        ├── products/
        ├── categories/
        ├── brands/
        ├── suppliers/
        └── warehouses/`;

  domainExamples = `# Single domain level
aegisx generate users --domain admin --force
# Result: modules/admin/users/
# Route: /api/admin/users

# Two level domain
aegisx generate drugs --domain inventory/master-data --force
# Result: modules/inventory/master-data/drugs/
# Route: /api/inventory/master-data/drugs

# Three level domain
aegisx generate audit-logs --domain system/security/logs --force
# Result: modules/system/security/logs/audit-logs/
# Route: /api/system/security/logs/audit-logs`;

  domainRoutes: DomainRoute[] = [
    { domain: 'admin', api: '/api/admin/{table}' },
    {
      domain: 'inventory/master-data',
      api: '/api/inventory/master-data/{table}',
    },
    { domain: 'system/security', api: '/api/system/security/{table}' },
    { domain: 'hr/employees', api: '/api/hr/employees/{table}' },
  ];

  shellOptions: CliOption[] = [
    {
      name: '--type',
      alias: '-t',
      default: 'enterprise',
      description: 'Shell type: enterprise, simple, multi-app',
    },
    {
      name: '--app',
      alias: '-a',
      default: 'admin',
      description: 'Target Angular app',
    },
    {
      name: '--force',
      alias: '-f',
      default: 'false',
      description: 'Overwrite existing files',
    },
    {
      name: '--dry-run',
      alias: '-d',
      default: 'false',
      description: 'Preview files without creating',
    },
  ];

  shellTypes: ShellType[] = [
    {
      type: 'enterprise',
      icon: 'business',
      description: 'Full-featured shell with sidebar, header, and breadcrumbs',
      component: 'EnterpriseShellComponent',
    },
    {
      type: 'simple',
      icon: 'web',
      description: 'Minimal shell with header only',
      component: 'SimpleShellComponent',
    },
    {
      type: 'multi-app',
      icon: 'apps',
      description: 'App switcher for multiple applications',
      component: 'MultiAppShellComponent',
    },
  ];

  shellExamples = `# Enterprise shell (default)
aegisx shell my-app --force

# Simple shell
aegisx shell my-app --type simple --force

# Multi-app shell
aegisx shell my-app --type multi-app --force

# Specify target app
aegisx shell my-app --app web --force`;

  listTablesExamples = `# List all tables in public schema
aegisx list-tables

# List tables in specific schema
aegisx list-tables --schema inventory

# Using pnpm script
pnpm run crud:list`;

  validateExamples = `# Validate generated module
aegisx validate products

# Validate with verbose output
aegisx validate products --verbose

# Using pnpm script
pnpm run crud:validate -- products`;

  schemaExamples = `# Generate from inventory schema
aegisx generate drugs --schema inventory --force

# List tables in inventory schema
aegisx list-tables --schema inventory

# Combined with domain
aegisx generate drugs --schema inventory --domain master-data --force`;

  licenseCommands = `# Start 14-day trial
aegisx trial

# Activate with license key
aegisx activate AEGISX-PRO-XXXXXXXX-XX

# Check license status
aegisx license

# Deactivate current license
aegisx deactivate`;

  licenseTiers: LicenseTier[] = [
    {
      name: 'Trial',
      price: 'Free',
      features: ['14 days', '1 developer', 'Limited features'],
    },
    {
      name: 'Professional',
      price: '$49',
      features: ['1 developer', 'All features', '1 year updates'],
    },
    {
      name: 'Team',
      price: '$199/year',
      features: ['Up to 10 developers', 'Priority support', 'All features'],
    },
    {
      name: 'Enterprise',
      price: 'Contact',
      features: ['Unlimited developers', 'On-premise', 'SLA support'],
    },
  ];

  packages = [
    {
      name: 'Standard',
      icon: 'inventory_2',
      description: 'Basic CRUD operations with essential features',
      features: ['CRUD', 'TypeBox', 'Pagination', 'Search'],
      command: 'pnpm run crud -- TABLE_NAME --force',
    },
    {
      name: 'Enterprise',
      icon: 'cloud_upload',
      description: 'Standard + Excel/CSV import functionality',
      features: ['Standard +', 'Excel Import', 'CSV Import', 'Validation'],
      command: 'pnpm run crud:import -- TABLE_NAME --force',
    },
    {
      name: 'Full',
      icon: 'bolt',
      description: 'Enterprise + WebSocket real-time events',
      features: ['Enterprise +', 'WebSocket', 'Real-time', 'Events'],
      command: 'pnpm run crud:full -- TABLE_NAME --force',
    },
  ];

  pnpmScripts = `# Basic CRUD (standard package)
pnpm run crud -- TABLE_NAME --force

# With import functionality (Excel/CSV)
pnpm run crud:import -- TABLE_NAME --force

# With WebSocket events (real-time updates)
pnpm run crud:events -- TABLE_NAME --force

# Full package (all features)
pnpm run crud:full -- TABLE_NAME --force

# List available tables
pnpm run crud:list

# Validate generated module
pnpm run crud:validate -- MODULE_NAME`;

  backendFiles = [
    {
      name: 'index.ts',
      icon: 'code',
      description: 'Module entry point with route registration',
    },
    {
      name: '*.routes.ts',
      icon: 'api',
      description: 'REST API route definitions with Fastify schemas',
    },
    {
      name: '*.service.ts',
      icon: 'settings',
      description: 'Business logic and service layer',
    },
    {
      name: '*.repository.ts',
      icon: 'storage',
      description: 'Database operations with Knex query builder',
    },
    {
      name: '*.schemas.ts',
      icon: 'schema',
      description: 'TypeBox schemas for request/response validation',
    },
    {
      name: '*.types.ts',
      icon: 'code',
      description: 'TypeScript type definitions',
    },
    {
      name: '*.import.service.ts',
      icon: 'cloud_upload',
      description: 'Excel/CSV import service (with --with-import)',
    },
    {
      name: '*.events.ts',
      icon: 'bolt',
      description: 'WebSocket event handlers (with --with-events)',
    },
  ];

  frontendFiles = [
    {
      name: '*-list.component.ts',
      icon: 'list',
      description: 'Data table with pagination, sorting, and actions',
    },
    {
      name: '*-form.component.ts',
      icon: 'edit',
      description: 'Create/Edit form with validation',
    },
    {
      name: '*-detail.component.ts',
      icon: 'info',
      description: 'Detail view component',
    },
    {
      name: '*.service.ts',
      icon: 'http',
      description: 'HTTP service for API calls',
    },
    { name: '*.model.ts', icon: 'code', description: 'TypeScript interfaces' },
    {
      name: '*.routes.ts',
      icon: 'route',
      description: 'Angular route definitions',
    },
    {
      name: '*-import-dialog.component.ts',
      icon: 'cloud_upload',
      description: 'Import dialog (with --with-import)',
    },
  ];
}
