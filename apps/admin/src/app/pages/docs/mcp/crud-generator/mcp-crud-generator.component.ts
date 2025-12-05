import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import {
  DocHeaderComponent,
  LivePreviewComponent,
} from '../../../../components/docs';

interface CrudPackage {
  id: string;
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  command: string;
  icon: string;
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
    MatChipsModule,
    MatTabsModule,
    MatExpansionModule,
    MatStepperModule,
    DocHeaderComponent,
    LivePreviewComponent,
  ],
  template: `
    <div class="mcp-crud-generator">
      <ax-doc-header
        title="MCP CRUD Generator"
        icon="code"
        description="สร้าง CRUD modules สำหรับ backend และ frontend อัตโนมัติผ่าน MCP tools"
        [breadcrumbs]="[
          { label: 'MCP', link: '/docs/mcp' },
          { label: 'CRUD Generator' },
        ]"
        status="stable"
        version="2.1.0"
      ></ax-doc-header>

      <!-- Available Tools -->
      <section class="section">
        <h2>Available MCP Tools</h2>

        <div class="category">
          <div class="category-header">
            <mat-icon>terminal</mat-icon>
            <h3>CRUD Generator Tools</h3>
          </div>
          <p class="category-desc">
            ใช้ tools เหล่านี้เพื่อสร้าง CRUD modules อัตโนมัติ
          </p>

          <div class="tools-grid">
            <mat-card appearance="outlined" class="tool-card">
              <div class="card-header-row">
                <div class="card-header-text">
                  <span class="card-title">aegisx_crud_packages</span>
                  <span class="card-subtitle">View available packages</span>
                </div>
                <div class="card-icon card-icon--packages">
                  <mat-icon>inventory_2</mat-icon>
                </div>
              </div>
              <mat-card-content>
                <p>ดูข้อมูล packages ที่มี: standard, enterprise, full</p>
                <div class="card-meta">
                  <mat-chip-set>
                    <mat-chip>packageName (optional)</mat-chip>
                  </mat-chip-set>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-flat-button color="primary">
                  <mat-icon>play_arrow</mat-icon>
                  Try it
                </button>
              </mat-card-actions>
            </mat-card>

            <mat-card appearance="outlined" class="tool-card">
              <div class="card-header-row">
                <div class="card-header-text">
                  <span class="card-title">aegisx_crud_build_command</span>
                  <span class="card-subtitle">Build generator command</span>
                </div>
                <div class="card-icon card-icon--build">
                  <mat-icon>terminal</mat-icon>
                </div>
              </div>
              <mat-card-content>
                <p>สร้าง CRUD generator command พร้อม options</p>
                <div class="card-meta">
                  <mat-chip-set>
                    <mat-chip [highlighted]="true"
                      >tableName (required)</mat-chip
                    >
                    <mat-chip>package (optional)</mat-chip>
                    <mat-chip>target (optional)</mat-chip>
                  </mat-chip-set>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-flat-button color="primary">
                  <mat-icon>play_arrow</mat-icon>
                  Try it
                </button>
              </mat-card-actions>
            </mat-card>

            <mat-card appearance="outlined" class="tool-card">
              <div class="card-header-row">
                <div class="card-header-text">
                  <span class="card-title">aegisx_crud_workflow</span>
                  <span class="card-subtitle">Get complete workflow</span>
                </div>
                <div class="card-icon card-icon--workflow">
                  <mat-icon>account_tree</mat-icon>
                </div>
              </div>
              <mat-card-content>
                <p>ดู recommended workflow สำหรับ feature ครบวงจร</p>
                <div class="card-meta">
                  <mat-chip-set>
                    <mat-chip [highlighted]="true"
                      >tableName (required)</mat-chip
                    >
                    <mat-chip>withImport (optional)</mat-chip>
                    <mat-chip>withEvents (optional)</mat-chip>
                  </mat-chip-set>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-flat-button color="primary">
                  <mat-icon>play_arrow</mat-icon>
                  Try it
                </button>
              </mat-card-actions>
            </mat-card>

            <mat-card appearance="outlined" class="tool-card">
              <div class="card-header-row">
                <div class="card-header-text">
                  <span class="card-title">aegisx_crud_files</span>
                  <span class="card-subtitle">Preview generated files</span>
                </div>
                <div class="card-icon card-icon--files">
                  <mat-icon>folder</mat-icon>
                </div>
              </div>
              <mat-card-content>
                <p>ดู files ที่จะถูก generate สำหรับ CRUD module</p>
                <div class="card-meta">
                  <mat-chip-set>
                    <mat-chip>tableName (optional)</mat-chip>
                    <mat-chip>target (optional)</mat-chip>
                  </mat-chip-set>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-flat-button color="primary">
                  <mat-icon>play_arrow</mat-icon>
                  Try it
                </button>
              </mat-card-actions>
            </mat-card>

            <mat-card appearance="outlined" class="tool-card">
              <div class="card-header-row">
                <div class="card-header-text">
                  <span class="card-title">aegisx_crud_troubleshoot</span>
                  <span class="card-subtitle">Get troubleshooting help</span>
                </div>
                <div class="card-icon card-icon--troubleshoot">
                  <mat-icon>help</mat-icon>
                </div>
              </div>
              <mat-card-content>
                <p>แก้ไขปัญหาที่พบบ่อยใน CRUD generator</p>
                <div class="card-meta">
                  <mat-chip-set>
                    <mat-chip [highlighted]="true">problem (required)</mat-chip>
                  </mat-chip-set>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-flat-button color="primary">
                  <mat-icon>play_arrow</mat-icon>
                  Try it
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>
      </section>

      <!-- Packages -->
      <section class="section">
        <h2>CRUD Packages</h2>
        <p>เลือก package ที่เหมาะกับ requirements ของ feature</p>

        <div class="tools-grid">
          @for (pkg of packages; track pkg.id) {
            <mat-card appearance="outlined" class="tool-card">
              <div class="card-header-row">
                <div class="card-header-text">
                  <span class="card-title">{{ pkg.name }}</span>
                  <span class="card-subtitle">{{ pkg.id }} package</span>
                </div>
                <div class="card-icon" [class]="'card-icon--' + pkg.id">
                  <mat-icon>{{ pkg.icon }}</mat-icon>
                </div>
              </div>
              <mat-card-content>
                <p>{{ pkg.description }}</p>

                <h5>Features:</h5>
                <ul class="features-list">
                  @for (feature of pkg.features; track feature) {
                    <li>
                      <mat-icon>check_circle</mat-icon>
                      {{ feature }}
                    </li>
                  }
                </ul>

                <h5>Use Cases:</h5>
                <ul class="use-cases-list">
                  @for (useCase of pkg.useCases; track useCase) {
                    <li>{{ useCase }}</li>
                  }
                </ul>

                <div class="command-box">
                  <code>{{ pkg.command }}</code>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-flat-button color="primary">
                  <mat-icon>play_arrow</mat-icon>
                  Use Package
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      </section>

      <!-- Workflow -->
      <section class="section">
        <h2>Complete Workflow</h2>
        <p>ขั้นตอนการสร้าง CRUD feature ครบวงจร</p>

        <mat-stepper orientation="vertical" #stepper>
          <mat-step>
            <ng-template matStepLabel>Create Database Migration</ng-template>
            <div class="step-content">
              <p>สร้าง migration สำหรับ database table</p>
              <ax-live-preview variant="bordered" direction="column">
                <div class="code-block">
                  <pre><code>{{ migrationCode }}</code></pre>
                </div>
              </ax-live-preview>
              <button mat-button matStepperNext>Next</button>
            </div>
          </mat-step>

          <mat-step>
            <ng-template matStepLabel>Run Migration</ng-template>
            <div class="step-content">
              <p>Apply migration เพื่อสร้าง table</p>
              <ax-live-preview variant="bordered" direction="column">
                <div class="code-block">
                  <pre><code>pnpm run db:migrate</code></pre>
                </div>
              </ax-live-preview>
              <button mat-button matStepperPrevious>Back</button>
              <button mat-button matStepperNext>Next</button>
            </div>
          </mat-step>

          <mat-step>
            <ng-template matStepLabel>Generate Backend</ng-template>
            <div class="step-content">
              <p>ใช้ CRUD generator สร้าง backend module</p>
              <ax-live-preview variant="bordered" direction="column">
                <div class="code-block">
                  <pre><code>{{ backendCode }}</code></pre>
                </div>
              </ax-live-preview>
              <button mat-button matStepperPrevious>Back</button>
              <button mat-button matStepperNext>Next</button>
            </div>
          </mat-step>

          <mat-step>
            <ng-template matStepLabel>Generate Frontend</ng-template>
            <div class="step-content">
              <p>ใช้ CRUD generator สร้าง Angular components</p>
              <ax-live-preview variant="bordered" direction="column">
                <div class="code-block">
                  <pre><code>{{ frontendCode }}</code></pre>
                </div>
              </ax-live-preview>
              <button mat-button matStepperPrevious>Back</button>
              <button mat-button matStepperNext>Next</button>
            </div>
          </mat-step>

          <mat-step>
            <ng-template matStepLabel>Test & Verify</ng-template>
            <div class="step-content">
              <p>ทดสอบว่า feature ทำงานถูกต้อง</p>
              <ax-live-preview variant="bordered" direction="column">
                <div class="code-block">
                  <pre><code>{{ testCode }}</code></pre>
                </div>
              </ax-live-preview>
              <button mat-button matStepperPrevious>Back</button>
              <button mat-button (click)="stepper.reset()">Reset</button>
            </div>
          </mat-step>
        </mat-stepper>
      </section>

      <!-- Usage Examples -->
      <section class="section">
        <h2>Usage Examples</h2>

        <mat-expansion-panel class="example-panel" [expanded]="true">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>terminal</mat-icon>
              Build CRUD Command
            </mat-panel-title>
          </mat-expansion-panel-header>
          <div class="example-content">
            <ax-live-preview variant="bordered" direction="column">
              <div class="code-section">
                <div class="code-header">Command</div>
                <pre><code>{{ buildCommandExample }}</code></pre>
              </div>
              <div class="result-section">
                <div class="result-header">Result</div>
                <pre
                  class="result-text"
                ><code>{{ buildCommandResult }}</code></pre>
              </div>
            </ax-live-preview>
          </div>
        </mat-expansion-panel>

        <mat-expansion-panel class="example-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>account_tree</mat-icon>
              Get Complete Workflow
            </mat-panel-title>
          </mat-expansion-panel-header>
          <div class="example-content">
            <ax-live-preview variant="bordered" direction="column">
              <div class="code-section">
                <div class="code-header">Command</div>
                <pre><code>{{ workflowExample }}</code></pre>
              </div>
              <div class="result-section">
                <div class="result-header">Result (Abbreviated)</div>
                <pre class="result-text"><code>{{ workflowResult }}</code></pre>
              </div>
            </ax-live-preview>
          </div>
        </mat-expansion-panel>

        <mat-expansion-panel class="example-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>folder</mat-icon>
              Preview Generated Files
            </mat-panel-title>
          </mat-expansion-panel-header>
          <div class="example-content">
            <ax-live-preview variant="bordered" direction="column">
              <div class="code-section">
                <div class="code-header">Command</div>
                <pre><code>{{ filesExample }}</code></pre>
              </div>
              <div class="result-section">
                <div class="result-header">Result</div>
                <pre class="result-text"><code>{{ filesResult }}</code></pre>
              </div>
            </ax-live-preview>
          </div>
        </mat-expansion-panel>

        <mat-expansion-panel class="example-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>help</mat-icon>
              Troubleshooting
            </mat-panel-title>
          </mat-expansion-panel-header>
          <div class="example-content">
            <ax-live-preview variant="bordered" direction="column">
              <div class="code-section">
                <div class="code-header">Command</div>
                <pre><code>{{ troubleshootExample }}</code></pre>
              </div>
              <div class="result-section">
                <div class="result-header">Result</div>
                <pre
                  class="result-text"
                ><code>{{ troubleshootResult }}</code></pre>
              </div>
            </ax-live-preview>
          </div>
        </mat-expansion-panel>
      </section>

      <!-- Generated Files -->
      <section class="section">
        <h2>Generated Files Overview</h2>

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

      <!-- Best Practices -->
      <section class="section">
        <h2>Best Practices</h2>
        <ax-live-preview variant="bordered" direction="column">
          <div class="benefits-grid">
            <div class="benefit-card">
              <mat-icon>database</mat-icon>
              <h4>Migration First</h4>
              <p>
                สร้าง database migration และ run ก่อนเสมอ เพื่อให้ generator
                อ่าน schema ได้
              </p>
            </div>
            <div class="benefit-card">
              <mat-icon>description</mat-icon>
              <h4>Use --dry-run</h4>
              <p>
                ใช้ <code>--dry-run</code> flag เพื่อ preview files ก่อน
                generate จริง
              </p>
            </div>
            <div class="benefit-card">
              <mat-icon>refresh</mat-icon>
              <h4>Backend → Frontend</h4>
              <p>
                Generate backend ก่อน แล้วค่อย generate frontend ที่จะใช้ types
                จาก backend
              </p>
            </div>
            <div class="benefit-card">
              <mat-icon>edit</mat-icon>
              <h4>Customize After Generate</h4>
              <p>
                Generated code เป็น starting point ปรับแต่งเพิ่มเติมตาม business
                logic
              </p>
            </div>
          </div>
        </ax-live-preview>
      </section>

      <!-- CLI Reference -->
      <section class="section">
        <h2>CLI Command Reference</h2>
        <p>Complete reference for all AegisX CLI commands</p>

        <mat-tab-group animationDuration="200ms" class="cli-tabs">
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>terminal</mat-icon>
              <span>generate</span>
            </ng-template>
            <div class="tab-content">
              <div class="command-section">
                <h4>aegisx generate [table-name] [options]</h4>
                <p>Generate CRUD modules for backend or frontend</p>

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

                <h5>Examples</h5>
                <div class="code-block">
                  <pre><code>{{ generateExamples }}</code></pre>
                </div>
              </div>
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>folder_special</mat-icon>
              <span>domain</span>
            </ng-template>
            <div class="tab-content">
              <div class="command-section">
                <h4>aegisx generate --domain [path]</h4>
                <p>Generate modules with domain-based organization</p>

                <div class="domain-structure">
                  <h5>Before: Flat Structure</h5>
                  <div class="code-block">
                    <pre><code>{{ domainBefore }}</code></pre>
                  </div>

                  <h5>After: Domain Structure</h5>
                  <div class="code-block">
                    <pre><code>{{ domainAfter }}</code></pre>
                  </div>
                </div>

                <h5>Domain Examples</h5>
                <div class="code-block">
                  <pre><code>{{ domainExamples }}</code></pre>
                </div>

                <h5>API Routes</h5>
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
              </div>
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>web</mat-icon>
              <span>shell</span>
            </ng-template>
            <div class="tab-content">
              <div class="command-section">
                <h4>aegisx shell [name] [options]</h4>
                <p>Generate Angular app shell (layout with navigation)</p>

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

                <h5>Shell Types</h5>
                <div class="shell-types">
                  @for (shell of shellTypes; track shell.type) {
                    <mat-card appearance="outlined" class="shell-card">
                      <div class="shell-header">
                        <mat-icon>{{ shell.icon }}</mat-icon>
                        <span>{{ shell.type }}</span>
                      </div>
                      <p>{{ shell.description }}</p>
                      <code>{{ shell.component }}</code>
                    </mat-card>
                  }
                </div>

                <h5>Examples</h5>
                <div class="code-block">
                  <pre><code>{{ shellExamples }}</code></pre>
                </div>
              </div>
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>list</mat-icon>
              <span>database</span>
            </ng-template>
            <div class="tab-content">
              <div class="command-section">
                <h4>Database Commands</h4>

                <div class="command-group">
                  <h5>aegisx list-tables [options]</h5>
                  <p>List available database tables</p>
                  <div class="code-block">
                    <pre><code>{{ listTablesExamples }}</code></pre>
                  </div>
                </div>

                <div class="command-group">
                  <h5>aegisx validate [module-name]</h5>
                  <p>Validate generated module structure</p>
                  <div class="code-block">
                    <pre><code>{{ validateExamples }}</code></pre>
                  </div>
                </div>

                <div class="command-group">
                  <h5>Schema Options</h5>
                  <p>Read from specific PostgreSQL schema</p>
                  <div class="code-block">
                    <pre><code>{{ schemaExamples }}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>key</mat-icon>
              <span>license</span>
            </ng-template>
            <div class="tab-content">
              <div class="command-section">
                <h4>License Commands</h4>

                <div class="license-commands">
                  <div class="code-block">
                    <pre><code>{{ licenseCommands }}</code></pre>
                  </div>
                </div>

                <h5>License Key Format</h5>
                <div class="code-block">
                  <pre><code>AEGISX-[TIER]-[SERIAL]-[CHECKSUM]</code></pre>
                </div>

                <div class="options-table">
                  <div class="option-row header">
                    <div class="col-tier">Tier</div>
                    <div class="col-example">Example</div>
                  </div>
                  @for (tier of licenseTiers; track tier.name) {
                    <div class="option-row">
                      <div class="col-tier">{{ tier.name }}</div>
                      <div class="col-example">
                        <code>{{ tier.example }}</code>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>content_copy</mat-icon>
              <span>pnpm scripts</span>
            </ng-template>
            <div class="tab-content">
              <div class="command-section">
                <h4>pnpm Scripts (Monorepo)</h4>
                <p>Shortcut scripts for common operations</p>

                <div class="code-block">
                  <pre><code>{{ pnpmScripts }}</code></pre>
                </div>

                <div class="warning-box">
                  <mat-icon>warning</mat-icon>
                  <span
                    ><strong>Important:</strong> Always use
                    <code>--</code> separator before table name!</span
                  >
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </section>

      <!-- Quick Links -->
      <section class="section">
        <h2>Quick Links</h2>
        <div class="quick-links">
          <a routerLink="/docs/mcp" class="quick-link">
            <mat-icon>home</mat-icon>
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
          <a routerLink="/tools/crud-generator" class="quick-link">
            <mat-icon>terminal</mat-icon>
            <span>CRUD Generator Tool</span>
            <mat-icon class="arrow">arrow_forward</mat-icon>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .mcp-crud-generator {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .section {
        margin-bottom: 3rem;

        h2 {
          font-size: var(--ax-text-2xl);
          font-weight: var(--ax-font-weight-semibold);
          color: var(--ax-text-heading);
          margin-bottom: 0.75rem;
        }

        > p {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          line-height: var(--ax-leading-normal);
          max-width: 800px;
        }
      }

      .category {
        margin-bottom: 2.5rem;
        padding: 1.5rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-xl);

        .category-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;

          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
            color: var(--ax-primary-default);
          }

          h3 {
            margin: 0;
            font-size: var(--ax-text-xl);
            font-weight: var(--ax-font-weight-semibold);
            color: var(--ax-text-heading);
          }
        }

        .category-desc {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
          font-size: var(--ax-text-sm);
        }
      }

      .tools-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
      }

      .tool-card {
        cursor: pointer;
        transition: all 0.2s ease;
        background: var(--ax-background-default);

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--ax-shadow-lg);
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          gap: 16px;
        }

        .card-header-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-title {
          font-size: var(--ax-text-lg);
          font-weight: var(--ax-font-weight-medium);
          color: var(--ax-text-heading);
        }

        .card-subtitle {
          font-size: var(--ax-text-sm);
          color: var(--ax-text-secondary);
        }

        .card-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--ax-radius-lg);
          background: var(--ax-primary-faint);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
            color: var(--ax-primary-default);
          }

          &--packages,
          &--standard {
            background: linear-gradient(
              135deg,
              rgba(99, 102, 241, 0.15),
              rgba(139, 92, 246, 0.15)
            );
            mat-icon {
              color: #6366f1;
            }
          }
          &--build,
          &--enterprise {
            background: linear-gradient(
              135deg,
              rgba(16, 185, 129, 0.15),
              rgba(5, 150, 105, 0.15)
            );
            mat-icon {
              color: #10b981;
            }
          }
          &--workflow,
          &--full {
            background: linear-gradient(
              135deg,
              rgba(245, 158, 11, 0.15),
              rgba(217, 119, 6, 0.15)
            );
            mat-icon {
              color: #f59e0b;
            }
          }
          &--files {
            background: linear-gradient(
              135deg,
              rgba(6, 182, 212, 0.15),
              rgba(8, 145, 178, 0.15)
            );
            mat-icon {
              color: #06b6d4;
            }
          }
          &--troubleshoot {
            background: linear-gradient(
              135deg,
              rgba(236, 72, 153, 0.15),
              rgba(219, 39, 119, 0.15)
            );
            mat-icon {
              color: #ec4899;
            }
          }
        }

        mat-card-content {
          padding-top: 1rem;

          > p {
            color: var(--ax-text-secondary);
            font-size: var(--ax-text-sm);
            line-height: var(--ax-leading-normal);
            margin-bottom: 1rem;
          }

          h5 {
            margin: 1rem 0 0.5rem;
            font-size: var(--ax-text-xs);
            font-weight: var(--ax-font-weight-semibold);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--ax-text-muted);
          }

          .features-list {
            list-style: none;
            padding: 0;
            margin: 0 0 1rem;

            li {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.25rem 0;
              font-size: var(--ax-text-xs);
              color: var(--ax-text-secondary);

              mat-icon {
                font-size: 16px;
                width: 16px;
                height: 16px;
                color: var(--ax-success-default);
              }
            }
          }

          .use-cases-list {
            list-style-type: disc;
            padding-left: 1.25rem;
            margin: 0 0 1rem;

            li {
              padding: 0.25rem 0;
              font-size: var(--ax-text-xs);
              color: var(--ax-text-secondary);
            }
          }

          .command-box {
            background: var(--ax-background-subtle);
            border: 1px solid var(--ax-border-muted);
            padding: 0.75rem 1rem;
            border-radius: var(--ax-radius-md);

            code {
              font-family: var(--ax-font-mono);
              font-size: var(--ax-text-xs);
              color: var(--ax-text-heading);
            }
          }
        }

        .card-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
        }

        mat-card-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
        }
      }

      .step-content {
        padding: 1rem 0;

        p {
          color: var(--ax-text-secondary);
          margin-bottom: 1rem;
        }

        button {
          margin-right: 0.5rem;
        }
      }

      .code-block {
        background: var(--ax-background-subtle);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-md);
        padding: 1rem;
        margin-bottom: 1rem;
        overflow-x: auto;

        pre {
          margin: 0;

          code {
            font-family: var(--ax-font-mono);
            font-size: var(--ax-text-xs);
            color: var(--ax-text-heading);
            white-space: pre-wrap;
          }
        }
      }

      .example-panel {
        margin-bottom: 1rem;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg) !important;

        mat-panel-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: var(--ax-font-weight-medium);

          mat-icon {
            color: var(--ax-primary-default);
          }
        }

        .example-content {
          padding: 0.5rem 0;
        }
      }

      .code-section,
      .result-section {
        margin-bottom: 1rem;

        .code-header,
        .result-header {
          font-size: var(--ax-text-xs);
          font-weight: var(--ax-font-weight-semibold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--ax-text-muted);
          margin-bottom: 0.5rem;
        }

        pre {
          background: var(--ax-background-subtle);
          border: 1px solid var(--ax-border-muted);
          border-radius: var(--ax-radius-md);
          padding: 1rem;
          margin: 0;
          overflow-x: auto;

          code {
            font-family: var(--ax-font-mono);
            font-size: var(--ax-text-xs);
            color: var(--ax-text-heading);
            white-space: pre-wrap;
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
          grid-template-columns: 1fr 2fr;
          gap: 1rem;
          padding: 1rem 1.5rem;
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

      .benefits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
      }

      .benefit-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.5rem;
        background: var(--ax-background-default);
        border-radius: var(--ax-radius-lg);
        border: 1px solid var(--ax-border-muted);

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: var(--ax-primary-default);
        }

        h4 {
          margin: 0;
          font-size: var(--ax-text-base);
          font-weight: var(--ax-font-weight-semibold);
          color: var(--ax-text-heading);
        }

        p {
          margin: 0;
          font-size: var(--ax-text-sm);
          color: var(--ax-text-secondary);
          line-height: 1.5;

          code {
            font-family: var(--ax-font-mono);
            font-size: var(--ax-text-xs);
            color: var(--ax-success-default);
            background: var(--ax-success-faint);
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
          }
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

      /* CLI Reference Styles */
      .cli-tabs {
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg);
        overflow: hidden;
      }

      .options-table {
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-muted);
        border-radius: var(--ax-radius-lg);
        overflow: hidden;
        margin-bottom: 1.5rem;

        .option-row {
          display: grid;
          grid-template-columns: 140px 80px 100px 1fr;
          gap: 1rem;
          padding: 0.75rem 1rem;
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

          .col-option code,
          .col-alias code,
          .col-default code {
            font-family: var(--ax-font-mono);
            font-size: var(--ax-text-xs);
            color: var(--ax-text-heading);
          }

          .col-desc {
            font-size: var(--ax-text-sm);
            color: var(--ax-text-secondary);
          }

          .col-domain,
          .col-route,
          .col-tier,
          .col-example {
            code {
              font-family: var(--ax-font-mono);
              font-size: var(--ax-text-xs);
              color: var(--ax-text-heading);
            }
          }
        }
      }

      .command-section {
        h4 {
          font-size: var(--ax-text-lg);
          font-weight: var(--ax-font-weight-semibold);
          color: var(--ax-text-heading);
          margin-bottom: 0.5rem;
        }

        > p {
          color: var(--ax-text-secondary);
          margin-bottom: 1.5rem;
        }

        h5 {
          font-size: var(--ax-text-sm);
          font-weight: var(--ax-font-weight-semibold);
          color: var(--ax-text-heading);
          margin: 1.5rem 0 0.75rem;
        }
      }

      .domain-structure {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1.5rem;

        h5 {
          font-size: var(--ax-text-sm);
          font-weight: var(--ax-font-weight-semibold);
          color: var(--ax-text-heading);
          margin-bottom: 0.75rem;
        }

        .code-block {
          margin-bottom: 0;
        }
      }

      .shell-types {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .shell-card {
        padding: 1rem;
        background: var(--ax-background-default);

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
          margin-bottom: 0.5rem;
        }

        code {
          font-family: var(--ax-font-mono);
          font-size: var(--ax-text-xs);
          color: var(--ax-primary-default);
        }
      }

      .command-group {
        margin-bottom: 2rem;

        h5 {
          font-size: var(--ax-text-base);
          font-weight: var(--ax-font-weight-semibold);
          color: var(--ax-text-heading);
          margin-bottom: 0.5rem;
        }

        > p {
          color: var(--ax-text-secondary);
          font-size: var(--ax-text-sm);
          margin-bottom: 1rem;
        }
      }

      .license-commands {
        margin-bottom: 1.5rem;
      }

      .warning-box {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: var(--ax-warning-faint);
        border: 1px solid var(--ax-warning-muted);
        border-radius: var(--ax-radius-md);
        margin-top: 1.5rem;

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

      @media (max-width: 768px) {
        .options-table .option-row {
          grid-template-columns: 1fr;
          gap: 0.5rem;

          &.header {
            display: none;
          }

          .col-option::before {
            content: 'Option: ';
            color: var(--ax-text-muted);
          }

          .col-alias::before {
            content: 'Alias: ';
            color: var(--ax-text-muted);
          }

          .col-default::before {
            content: 'Default: ';
            color: var(--ax-text-muted);
          }

          .col-desc::before {
            content: 'Description: ';
            color: var(--ax-text-muted);
          }
        }

        .domain-structure {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class McpCrudGeneratorComponent {
  packages: CrudPackage[] = [
    {
      id: 'standard',
      name: 'Standard',
      description: 'Basic CRUD operations with essential features',
      features: [
        'Full CRUD operations',
        'TypeBox schema validation',
        'Pagination and filtering',
        'Search functionality',
        'Soft delete support',
        'TypeScript types generation',
      ],
      useCases: ['Simple data management', 'Admin panels', 'Quick prototypes'],
      command: 'pnpm run crud -- TABLE_NAME --force',
      icon: 'inventory_2',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Standard + Excel/CSV import functionality',
      features: [
        'All standard features',
        'Excel file import (XLSX)',
        'CSV file import',
        'Bulk data operations',
        'Import validation',
        'Error reporting for imports',
      ],
      useCases: [
        'Data migration tools',
        'Bulk data management',
        'Admin import features',
      ],
      command: 'pnpm run crud:import -- TABLE_NAME --force',
      icon: 'cloud_upload',
    },
    {
      id: 'full',
      name: 'Full',
      description: 'Enterprise + WebSocket events for real-time updates',
      features: [
        'All enterprise features',
        'WebSocket event emission',
        'Real-time CRUD notifications',
        'Event-driven architecture',
        'Pub/sub integration ready',
      ],
      useCases: [
        'Real-time dashboards',
        'Collaborative apps',
        'Live data feeds',
      ],
      command: 'pnpm run crud:full -- TABLE_NAME --force',
      icon: 'bolt',
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

  // Example codes
  migrationCode = `# Create migration file
npx knex migrate:make create_products_table

# Edit migration file with your schema
# Then run migration
pnpm run db:migrate`;

  backendCode = `# Standard package
pnpm run crud -- products --force

# With import functionality
pnpm run crud:import -- products --force

# Full package (import + events)
pnpm run crud:full -- products --force`;

  frontendCode = `# Generate frontend components
npx @aegisx/cli generate products --target frontend --force

# With import dialog
npx @aegisx/cli generate products --target frontend --with-import --force`;

  testCode = `# Build project
pnpm run build

# Start API server
pnpm run dev:api

# Test endpoints
curl http://localhost:3333/api/products`;

  // MCP Examples
  buildCommandExample = `aegisx_crud_build_command tableName="products" package="enterprise"`;

  buildCommandResult = `# CRUD Generator Command

**Table:** products
**Package:** enterprise

## Command
\`\`\`bash
pnpm run crud:import -- products --force
\`\`\`

## What this command generates:
- routes: REST API routes with validation
- service: Business logic layer
- repository: Database operations
- schemas: TypeBox validation schemas
- types: TypeScript type definitions
- import: Excel/CSV import service

## After generating, remember to:
1. Test the API endpoints
2. Generate frontend: \`npx @aegisx/cli generate products --target frontend --force\``;

  workflowExample = `aegisx_crud_workflow tableName="products" withImport=true`;

  workflowResult = `# Complete CRUD Workflow for: products

## Step 1: Create Database Migration
\`\`\`bash
npx knex migrate:make create_products_table
\`\`\`

## Step 2: Run Migration
\`\`\`bash
pnpm run db:migrate
\`\`\`

## Step 3: Generate Backend (with Import)
\`\`\`bash
pnpm run crud:import -- products --force
\`\`\`

## Step 4: Generate Frontend
\`\`\`bash
npx @aegisx/cli generate products --target frontend --with-import --force
\`\`\`

## Step 5: Verify
\`\`\`bash
pnpm run build
pnpm run dev:api
\`\`\``;

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
- products-detail.component.ts - Detail view
- products.service.ts - HTTP service
- products.model.ts - Type interfaces
- products.routes.ts - Angular routes`;

  troubleshootExample = `aegisx_crud_troubleshoot problem="table not found error"`;

  troubleshootResult = `# Troubleshooting: table not found error

## Common Causes:

### 1. Migration not run
The database table doesn't exist yet.

**Solution:**
\`\`\`bash
pnpm run db:migrate
\`\`\`

### 2. Wrong table name
Table name is case-sensitive and should match exactly.

**Solution:**
Check table name in database:
\`\`\`sql
\\dt products
\`\`\`

### 3. Database connection issue
Connection to PostgreSQL might be down.

**Solution:**
Verify connection in .env.local:
\`\`\`bash
cat .env.local | grep DATABASE
\`\`\`

## Prevention:
Always run \`pnpm run crud:list\` to see available tables before generating.`;

  // CLI Reference Data
  generateOptions = [
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
      description: 'Include WebSocket events',
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
      description: 'Domain path for organization',
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
      description: 'Use flat structure (no domain)',
    },
    {
      name: '--no-register',
      alias: '',
      default: 'false',
      description: 'Skip auto-registration',
    },
    {
      name: '--include-audit-fields',
      alias: '',
      default: 'false',
      description: 'Include audit fields in forms',
    },
  ];

  generateExamples = `# Basic CRUD generation
aegisx generate products --force

# Frontend generation
aegisx generate products --target frontend --force

# With import functionality
aegisx generate products --with-import --force

# With WebSocket events
aegisx generate products --with-events --force

# Full package (all features)
aegisx generate products --with-import --with-events --force

# Domain-based organization
aegisx generate drugs --domain inventory/master-data --force

# Read from specific PostgreSQL schema
aegisx generate products --schema inventory --force

# Dry run (preview only)
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

  domainRoutes = [
    { domain: 'admin', api: '/api/admin/{table}' },
    {
      domain: 'inventory/master-data',
      api: '/api/inventory/master-data/{table}',
    },
    { domain: 'system/security', api: '/api/system/security/{table}' },
    { domain: 'hr/employees', api: '/api/hr/employees/{table}' },
  ];

  shellOptions = [
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

  shellTypes = [
    {
      type: 'enterprise',
      icon: 'business',
      description: 'Full-featured shell with sidebar, header, breadcrumbs',
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

  licenseTiers = [
    { name: 'Trial', example: 'AEGISX-TRIAL-XXXXXXXX-XX' },
    { name: 'Professional', example: 'AEGISX-PRO-XXXXXXXX-XX' },
    { name: 'Team', example: 'AEGISX-TEAM-XXXXXXXX-XX' },
    { name: 'Enterprise', example: 'AEGISX-ENT-XXXXXXXX-XX' },
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
}
