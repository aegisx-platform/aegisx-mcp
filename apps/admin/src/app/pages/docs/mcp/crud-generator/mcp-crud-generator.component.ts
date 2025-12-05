import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  DocHeaderComponent,
  LivePreviewComponent,
} from '../../../../components/docs';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface Plan {
  name: string;
  price: string;
  period: string | null;
  features: string[];
  cta: string;
  recommended: boolean;
}

interface FAQ {
  question: string;
  answer: string;
}

@Component({
  selector: 'ax-mcp-crud-generator',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatExpansionModule,
    DocHeaderComponent,
    LivePreviewComponent,
  ],
  template: `
    <div class="crud-generator-tool">
      <ax-doc-header
        title="AegisX CRUD Generator"
        icon="terminal"
        description="Premium CLI tool for generating full-stack CRUD modules with Angular + Fastify. Automatically creates backend APIs, frontend components, and database migrations."
        [breadcrumbs]="[
          { label: 'Tools', link: '/tools' },
          { label: 'CRUD Generator' },
        ]"
        status="stable"
        version="2.1.0"
      ></ax-doc-header>

      <!-- Hero Section -->
      <section class="section hero-section">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge pro">
              <mat-icon>workspace_premium</mat-icon>
              PRO Feature
            </span>
          </div>
          <h2>Generate Full-Stack CRUD in Seconds</h2>
          <p>
            Transform your PostgreSQL tables into production-ready Angular +
            Fastify modules with a single command. No boilerplate, no errors,
            just working code.
          </p>
          <div class="hero-actions">
            <a
              mat-flat-button
              color="primary"
              href="https://aegisx.dev/pricing"
              target="_blank"
            >
              <mat-icon>shopping_cart</mat-icon>
              Get License
            </a>
            <a mat-stroked-button routerLink="/docs/cli/reference">
              <mat-icon>menu_book</mat-icon>
              CLI Reference
            </a>
          </div>
        </div>
        <div class="hero-visual">
          <mat-icon class="hero-icon">terminal</mat-icon>
        </div>
      </section>

      <!-- Features Grid -->
      <section class="section">
        <h2>Features</h2>
        <div class="features-grid">
          @for (feature of features; track feature.title) {
            <div class="feature-card">
              <mat-icon [class]="'feature-icon ' + feature.color">{{
                feature.icon
              }}</mat-icon>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          }
        </div>
      </section>

      <!-- Quick Start -->
      <section class="section">
        <h2>Quick Start</h2>
        <mat-tab-group animationDuration="200ms">
          <mat-tab label="Installation">
            <div class="tab-content">
              <div class="code-block">
                <pre><code>{{ installCode }}</code></pre>
              </div>
            </div>
          </mat-tab>
          <mat-tab label="Backend Generation">
            <div class="tab-content">
              <div class="code-block">
                <pre><code>{{ backendCode }}</code></pre>
              </div>
            </div>
          </mat-tab>
          <mat-tab label="Frontend Generation">
            <div class="tab-content">
              <div class="code-block">
                <pre><code>{{ frontendCode }}</code></pre>
              </div>
            </div>
          </mat-tab>
          <mat-tab label="Domain Structure">
            <div class="tab-content">
              <div class="code-block">
                <pre><code>{{ domainCode }}</code></pre>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </section>

      <!-- MCP Tools Section -->
      <section class="section">
        <h2>MCP Tools Integration</h2>
        <p class="section-desc">
          ใช้ MCP tools เพื่อสร้าง CRUD modules ผ่าน Claude AI
        </p>
        <mat-tab-group animationDuration="200ms">
          <mat-tab label="Build Command">
            <div class="tab-content">
              <div class="code-block">
                <pre><code>{{ buildCommandExample }}</code></pre>
              </div>
              <h4>Result:</h4>
              <div class="code-block result">
                <pre><code>{{ buildCommandResult }}</code></pre>
              </div>
            </div>
          </mat-tab>
          <mat-tab label="Workflow">
            <div class="tab-content">
              <div class="code-block">
                <pre><code>{{ workflowExample }}</code></pre>
              </div>
              <h4>Result:</h4>
              <div class="code-block result">
                <pre><code>{{ workflowResult }}</code></pre>
              </div>
            </div>
          </mat-tab>
          <mat-tab label="Preview Files">
            <div class="tab-content">
              <div class="code-block">
                <pre><code>{{ filesExample }}</code></pre>
              </div>
              <h4>Result:</h4>
              <div class="code-block result">
                <pre><code>{{ filesResult }}</code></pre>
              </div>
            </div>
          </mat-tab>
          <mat-tab label="Troubleshoot">
            <div class="tab-content">
              <div class="code-block">
                <pre><code>{{ troubleshootExample }}</code></pre>
              </div>
              <h4>Result:</h4>
              <div class="code-block result">
                <pre><code>{{ troubleshootResult }}</code></pre>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </section>

      <!-- Generated Files -->
      <section class="section">
        <h2>Generated Files</h2>
        <mat-tab-group animationDuration="200ms">
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>storage</mat-icon>
              <span>Backend</span>
            </ng-template>
            <div class="tab-content">
              <div class="files-list">
                @for (file of backendFiles; track file.name) {
                  <div class="file-item">
                    <mat-icon>{{ file.icon }}</mat-icon>
                    <code>{{ file.name }}</code>
                    <span>{{ file.description }}</span>
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
              <div class="files-list">
                @for (file of frontendFiles; track file.name) {
                  <div class="file-item">
                    <mat-icon>{{ file.icon }}</mat-icon>
                    <code>{{ file.name }}</code>
                    <span>{{ file.description }}</span>
                  </div>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </section>

      <!-- Pricing Section -->
      <section class="section">
        <h2>Pricing</h2>
        <div class="pricing-grid">
          @for (plan of plans; track plan.name) {
            <div
              [class]="
                'pricing-card ' + (plan.recommended ? 'recommended' : '')
              "
            >
              @if (plan.recommended) {
                <div class="recommended-badge">Most Popular</div>
              }
              <div class="pricing-header">
                <h3>{{ plan.name }}</h3>
                <div class="price">
                  <span class="amount">{{ plan.price }}</span>
                  @if (plan.period) {
                    <span class="period">/ {{ plan.period }}</span>
                  }
                </div>
              </div>
              <ul class="features-list">
                @for (feature of plan.features; track feature) {
                  <li>
                    <mat-icon>check_circle</mat-icon>
                    {{ feature }}
                  </li>
                }
              </ul>
              <a
                mat-flat-button
                [color]="plan.recommended ? 'primary' : 'accent'"
                href="https://aegisx.dev/pricing"
                target="_blank"
                class="cta-button"
              >
                {{ plan.cta }}
              </a>
            </div>
          }
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="section">
        <h2>Frequently Asked Questions</h2>
        <mat-accordion>
          @for (faq of faqs; track faq.question) {
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>{{ faq.question }}</mat-panel-title>
              </mat-expansion-panel-header>
              <p>{{ faq.answer }}</p>
            </mat-expansion-panel>
          }
        </mat-accordion>
      </section>

      <!-- Quick Links -->
      <section class="section">
        <h2>Related Documentation</h2>
        <div class="quick-links">
          <a routerLink="/docs/cli/reference" class="quick-link">
            <mat-icon>terminal</mat-icon>
            <span>CLI Reference</span>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </a>
          <a routerLink="/docs/mcp" class="quick-link">
            <mat-icon>smart_toy</mat-icon>
            <span>MCP Overview</span>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </a>
          <a routerLink="/docs/mcp/components" class="quick-link">
            <mat-icon>widgets</mat-icon>
            <span>MCP Components</span>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </a>
          <a routerLink="/docs/mcp/patterns" class="quick-link">
            <mat-icon>pattern</mat-icon>
            <span>MCP Patterns</span>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .crud-generator-tool {
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
          margin-bottom: 1.5rem;
        }

        .section-desc {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
        }

        h4 {
          font-size: var(--ax-text-sm);
          font-weight: var(--ax-font-weight-semibold);
          color: var(--ax-text-heading);
          margin: 1rem 0 0.5rem;
        }
      }

      /* Hero Section */
      .hero-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 3rem;
        padding: 3rem;
        background: linear-gradient(
          135deg,
          var(--ax-primary-faint, #eff6ff) 0%,
          var(--ax-primary-muted, #dbeafe) 100%
        );
        border-radius: var(--ax-radius-xl);
        margin-bottom: 3rem;
      }

      .hero-content {
        flex: 1;

        h2 {
          font-size: var(--ax-text-3xl);
          margin: 0 0 1rem;
        }

        > p {
          font-size: var(--ax-text-lg);
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          line-height: var(--ax-leading-relaxed);
        }
      }

      .hero-badge {
        margin-bottom: 1rem;

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: var(--ax-text-sm);
          font-weight: var(--ax-font-weight-semibold);
          padding: 0.375rem 0.75rem;
          border-radius: var(--ax-radius-full);

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }

          &.pro {
            background: var(--ax-warning-faint);
            color: var(--ax-warning-default);
          }
        }
      }

      .hero-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .hero-visual {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 180px;
        height: 180px;
        background: var(--ax-primary-default);
        border-radius: var(--ax-radius-xl);
        flex-shrink: 0;
      }

      .hero-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: white;
      }

      /* Features Grid */
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .feature-card {
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg);
        padding: 1.5rem;

        .feature-icon {
          font-size: 2.5rem;
          width: 2.5rem;
          height: 2.5rem;
          margin-bottom: 1rem;

          &.blue {
            color: #3b82f6;
          }
          &.green {
            color: #22c55e;
          }
          &.purple {
            color: #a855f7;
          }
          &.orange {
            color: #f97316;
          }
          &.cyan {
            color: #06b6d4;
          }
          &.pink {
            color: #ec4899;
          }
        }

        h3 {
          margin: 0 0 0.5rem;
          font-size: var(--ax-text-lg);
          font-weight: var(--ax-font-weight-semibold);
          color: var(--ax-text-heading);
        }

        p {
          margin: 0;
          font-size: var(--ax-text-sm);
          color: var(--ax-text-secondary);
          line-height: var(--ax-leading-normal);
        }
      }

      /* Code Block */
      .code-block {
        background: #1e1e2e;
        border-radius: var(--ax-radius-md);
        padding: 1.25rem 1.5rem;
        overflow-x: auto;

        &.result {
          background: #11111b;
          border: 1px solid #313244;
        }

        pre {
          margin: 0;

          code {
            font-family: var(--ax-font-mono, 'JetBrains Mono', monospace);
            font-size: var(--ax-text-sm);
            color: #cdd6f4;
            white-space: pre-wrap;
            line-height: 1.6;
          }
        }
      }

      .tab-content {
        padding: 1.5rem 0;
      }

      /* Files List */
      .files-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .file-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-md);

        mat-icon {
          color: var(--ax-primary-default);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        code {
          font-family: var(--ax-font-mono, 'JetBrains Mono', monospace);
          font-size: var(--ax-text-sm);
          color: var(--ax-text-heading);
          min-width: 180px;
        }

        span {
          font-size: var(--ax-text-sm);
          color: var(--ax-text-secondary);
        }
      }

      /* Pricing Grid */
      .pricing-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.5rem;
      }

      .pricing-card {
        position: relative;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg);
        padding: 1.5rem;
        text-align: center;

        &.recommended {
          border: 2px solid var(--ax-primary-default);
        }

        .recommended-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--ax-primary-default);
          color: white;
          padding: 0.25rem 1rem;
          border-radius: var(--ax-radius-full);
          font-size: var(--ax-text-xs);
          font-weight: var(--ax-font-weight-semibold);
        }

        .pricing-header {
          margin-bottom: 1.5rem;

          h3 {
            font-size: var(--ax-text-xl);
            font-weight: var(--ax-font-weight-semibold);
            color: var(--ax-text-heading);
            margin: 0 0 0.5rem;
          }

          .price {
            .amount {
              font-size: var(--ax-text-3xl);
              font-weight: var(--ax-font-weight-bold);
              color: var(--ax-text-heading);
            }

            .period {
              font-size: var(--ax-text-sm);
              color: var(--ax-text-secondary);
            }
          }
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem;
          text-align: left;

          li {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
            font-size: var(--ax-text-sm);
            color: var(--ax-text-secondary);

            mat-icon {
              color: var(--ax-success-default);
              font-size: 1.25rem;
              width: 1.25rem;
              height: 1.25rem;
            }
          }
        }

        .cta-button {
          width: 100%;
        }
      }

      /* FAQ Section */
      mat-expansion-panel {
        margin-bottom: 0.5rem;

        mat-panel-title {
          font-weight: var(--ax-font-weight-medium);
        }

        p {
          color: var(--ax-text-secondary);
          line-height: var(--ax-leading-normal);
          margin: 0;
        }
      }

      /* Quick Links */
      .quick-links {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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
        .hero-section {
          flex-direction: column;
          text-align: center;
        }

        .hero-actions {
          justify-content: center;
        }

        .hero-visual {
          width: 140px;
          height: 140px;
        }

        .hero-icon {
          font-size: 60px;
          width: 60px;
          height: 60px;
        }

        .file-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;

          code {
            min-width: auto;
          }
        }
      }
    `,
  ],
})
export class McpCrudGeneratorComponent {
  features: Feature[] = [
    {
      icon: 'auto_awesome',
      title: 'Full-Stack Generation',
      description:
        'Generate complete backend APIs and frontend components from your database schema.',
      color: 'blue',
    },
    {
      icon: 'folder_special',
      title: 'Domain Organization',
      description:
        'Organize modules with domain-driven structure for better maintainability.',
      color: 'purple',
    },
    {
      icon: 'bolt',
      title: 'WebSocket Events',
      description:
        'Add real-time updates with --with-events flag for live data synchronization.',
      color: 'orange',
    },
    {
      icon: 'upload_file',
      title: 'Bulk Import',
      description:
        'Excel/CSV import functionality with validation and error handling.',
      color: 'green',
    },
    {
      icon: 'verified',
      title: 'TypeBox Schemas',
      description: 'Type-safe validation with auto-generated TypeScript types.',
      color: 'cyan',
    },
    {
      icon: 'security',
      title: 'RBAC Integration',
      description:
        'Automatic role-based access control with permission migrations.',
      color: 'pink',
    },
  ];

  plans: Plan[] = [
    {
      name: 'Trial',
      price: 'Free',
      period: null,
      features: [
        '14-day trial period',
        'All generation features',
        'Single developer',
        'Community support',
      ],
      cta: 'Start Trial',
      recommended: false,
    },
    {
      name: 'Professional',
      price: '$49',
      period: 'one-time',
      features: [
        'Lifetime license',
        'All generation features',
        '1 year of updates',
        'Email support',
        'Priority bug fixes',
      ],
      cta: 'Buy Now',
      recommended: true,
    },
    {
      name: 'Team',
      price: '$199',
      period: 'year',
      features: [
        'Up to 10 developers',
        'All generation features',
        'Continuous updates',
        'Priority support',
        'Team license management',
      ],
      cta: 'Get Team License',
      recommended: false,
    },
    {
      name: 'Enterprise',
      price: 'Contact',
      period: null,
      features: [
        'Unlimited developers',
        'On-premise deployment',
        'Custom templates',
        'SLA support',
        'Dedicated account manager',
      ],
      cta: 'Contact Sales',
      recommended: false,
    },
  ];

  faqs: FAQ[] = [
    {
      question: 'What database does CRUD Generator support?',
      answer:
        'Currently, CRUD Generator supports PostgreSQL with full schema introspection. It reads your database schema to generate type-safe TypeScript code.',
    },
    {
      question: 'Can I customize the generated code?',
      answer:
        'Yes! You can use custom templates or modify the generated code. The generator supports Handlebars templates for full customization.',
    },
    {
      question: 'Does it work with existing projects?',
      answer:
        'Absolutely. CRUD Generator is designed to integrate seamlessly with existing Angular + Fastify projects. It follows your project structure and conventions.',
    },
    {
      question: 'What is included in the license?',
      answer:
        'Each license includes access to all CLI commands, template updates for the license period, and support based on your tier.',
    },
    {
      question: 'How do I use MCP tools with Claude?',
      answer:
        'Simply ask Claude to generate CRUD modules using the aegisx_crud_* tools. Claude will use the MCP server to build commands and show you the workflow.',
    },
  ];

  backendFiles = [
    {
      name: 'index.ts',
      icon: 'code',
      description: 'Module entry point with route registration',
    },
    {
      name: '*.routes.ts',
      icon: 'api',
      description: 'REST API route definitions with schemas',
    },
    {
      name: '*.service.ts',
      icon: 'settings',
      description: 'Business logic and service layer',
    },
    {
      name: '*.repository.ts',
      icon: 'storage',
      description: 'Database operations with Knex',
    },
    {
      name: '*.schemas.ts',
      icon: 'schema',
      description: 'TypeBox schemas for validation',
    },
    {
      name: '*.types.ts',
      icon: 'code',
      description: 'TypeScript type definitions',
    },
  ];

  frontendFiles = [
    {
      name: '*-list.component.ts',
      icon: 'list',
      description: 'Data table with pagination and actions',
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
  ];

  installCode = `# Install globally
npm install -g @aegisx/cli

# Start 14-day trial
aegisx trial

# Or activate license
aegisx activate AEGISX-PRO-XXXXXXXX-XX`;

  backendCode = `# Basic CRUD module
aegisx generate products --force

# With domain organization
aegisx generate drugs --domain inventory/master-data --force

# With WebSocket events
aegisx generate orders --with-events --force

# With Excel/CSV import
aegisx generate budgets --with-import --force`;

  frontendCode = `# Generate frontend components
aegisx generate products --target frontend --force

# With import dialog
aegisx generate budgets --target frontend --with-import --force

# With real-time events
aegisx generate orders --target frontend --with-events --force`;

  domainCode = `# Create domain-organized modules
aegisx generate drugs --domain inventory/master-data --force

# Result structure:
# modules/inventory/
#   index.ts                 (Domain aggregator)
#   master-data/
#     index.ts               (Subdomain aggregator)
#     drugs/                 (CRUD module)
#       controllers/
#       repositories/
#       services/
#       routes/

# API: /api/inventory/master-data/drugs`;

  // MCP Examples
  buildCommandExample = `aegisx_crud_build_command tableName="products" package="enterprise"`;

  buildCommandResult = `# CRUD Generator Command

**Table:** products
**Package:** enterprise

## Command
pnpm run crud:import -- products --force

## What this command generates:
- routes: REST API routes with validation
- service: Business logic layer
- repository: Database operations
- schemas: TypeBox validation schemas
- types: TypeScript type definitions
- import: Excel/CSV import service`;

  workflowExample = `aegisx_crud_workflow tableName="products" withImport=true`;

  workflowResult = `# Complete CRUD Workflow for: products

## Step 1: Create Database Migration
npx knex migrate:make create_products_table

## Step 2: Run Migration
pnpm run db:migrate

## Step 3: Generate Backend (with Import)
pnpm run crud:import -- products --force

## Step 4: Generate Frontend
npx @aegisx/cli generate products --target frontend --with-import --force

## Step 5: Verify
pnpm run build && pnpm run dev:api`;

  filesExample = `aegisx_crud_files tableName="products" target="both"`;

  filesResult = `# Generated Files for: products

## Backend Files (apps/api/src/modules/products/)
- index.ts - Module entry point
- products.routes.ts - API routes
- products.service.ts - Business logic
- products.repository.ts - Database layer
- products.schemas.ts - Validation schemas
- products.types.ts - TypeScript types

## Frontend Files (apps/admin/src/app/pages/products/)
- products-list.component.ts - Data table
- products-form.component.ts - Create/Edit form
- products.service.ts - HTTP service
- products.routes.ts - Angular routes`;

  troubleshootExample = `aegisx_crud_troubleshoot problem="table not found"`;

  troubleshootResult = `# Troubleshooting: table not found

## Common Causes:

### 1. Migration not run
pnpm run db:migrate

### 2. Wrong table name
Check: SELECT table_name FROM information_schema.tables

### 3. Database connection
Verify .env.local DATABASE_URL

## Prevention:
Always run pnpm run crud:list before generating`;
}
