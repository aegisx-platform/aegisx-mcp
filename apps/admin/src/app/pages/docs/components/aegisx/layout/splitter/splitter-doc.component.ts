import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AxSplitterComponent, AxCardComponent } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-splitter-doc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    AxSplitterComponent,
    AxCardComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="splitter-doc">
      <ax-doc-header
        title="Splitter"
        icon="view_column"
        description="Resizable split container that allows users to adjust panel sizes by dragging a separator. Supports horizontal and vertical orientations with customizable constraints."
        [breadcrumbs]="[
          { label: 'Layout', link: '/docs/components/aegisx/layout/drawer' },
          { label: 'Splitter' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxSplitterComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="splitter-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="splitter-doc__tab-content">
            <!-- Basic Usage -->
            <section class="splitter-doc__section">
              <h2>Basic Usage</h2>
              <p>
                The Splitter divides a container into two resizable panels.
                Place content using <code>[before]</code> and
                <code>[after]</code> attribute selectors. Drag the separator to
                resize.
              </p>

              <ax-live-preview variant="bordered">
                <div class="splitter-doc__demo-container">
                  <ax-splitter [size]="40">
                    <div
                      before
                      class="splitter-doc__panel splitter-doc__panel--primary"
                    >
                      <h4>Left Panel</h4>
                      <p>Drag the separator to resize</p>
                    </div>
                    <div
                      after
                      class="splitter-doc__panel splitter-doc__panel--secondary"
                    >
                      <h4>Right Panel</h4>
                      <p>Content adjusts automatically</p>
                    </div>
                  </ax-splitter>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <!-- Orientations -->
            <section class="splitter-doc__section">
              <h2>Orientations</h2>
              <p>
                Use <code>horizontal</code> for side-by-side panels or
                <code>vertical</code>
                for top/bottom stacked panels.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="column"
                gap="var(--ax-spacing-lg)"
              >
                <div class="splitter-doc__demo-container">
                  <h5 class="splitter-doc__demo-label">Horizontal (default)</h5>
                  <ax-splitter orientation="horizontal" [size]="35">
                    <div
                      before
                      class="splitter-doc__panel splitter-doc__panel--primary"
                    >
                      <span>Left</span>
                    </div>
                    <div
                      after
                      class="splitter-doc__panel splitter-doc__panel--secondary"
                    >
                      <span>Right</span>
                    </div>
                  </ax-splitter>
                </div>

                <div
                  class="splitter-doc__demo-container splitter-doc__demo-container--tall"
                >
                  <h5 class="splitter-doc__demo-label">Vertical</h5>
                  <ax-splitter orientation="vertical" [size]="40">
                    <div
                      before
                      class="splitter-doc__panel splitter-doc__panel--primary"
                    >
                      <span>Top</span>
                    </div>
                    <div
                      after
                      class="splitter-doc__panel splitter-doc__panel--secondary"
                    >
                      <span>Bottom</span>
                    </div>
                  </ax-splitter>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="orientationsCode"></ax-code-tabs>
            </section>

            <!-- Min/Max Constraints -->
            <section class="splitter-doc__section">
              <h2>Min/Max Constraints</h2>
              <p>
                Set <code>min</code> and <code>max</code> to limit how far the
                separator can be dragged. Values are in percentage by default.
              </p>

              <ax-live-preview variant="bordered">
                <div class="splitter-doc__demo-container">
                  <ax-splitter [size]="50" [min]="20" [max]="80">
                    <div
                      before
                      class="splitter-doc__panel splitter-doc__panel--primary"
                    >
                      <h4>Constrained Panel</h4>
                      <p>min: 20%, max: 80%</p>
                    </div>
                    <div
                      after
                      class="splitter-doc__panel splitter-doc__panel--secondary"
                    >
                      <h4>Right Panel</h4>
                      <p>Try dragging beyond limits</p>
                    </div>
                  </ax-splitter>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="constraintsCode"></ax-code-tabs>
            </section>

            <!-- Custom Separator Size -->
            <section class="splitter-doc__section">
              <h2>Separator Size</h2>
              <p>
                Adjust the separator thickness with
                <code>separatorSize</code> (in pixels). Larger separators are
                easier to grab on touch devices.
              </p>

              <ax-live-preview
                variant="bordered"
                direction="row"
                gap="var(--ax-spacing-lg)"
              >
                <div
                  class="splitter-doc__demo-container splitter-doc__demo-container--small"
                >
                  <h5 class="splitter-doc__demo-label">4px</h5>
                  <ax-splitter [size]="50" [separatorSize]="4">
                    <div
                      before
                      class="splitter-doc__panel splitter-doc__panel--primary"
                    >
                      A
                    </div>
                    <div
                      after
                      class="splitter-doc__panel splitter-doc__panel--secondary"
                    >
                      B
                    </div>
                  </ax-splitter>
                </div>

                <div
                  class="splitter-doc__demo-container splitter-doc__demo-container--small"
                >
                  <h5 class="splitter-doc__demo-label">8px (default)</h5>
                  <ax-splitter [size]="50" [separatorSize]="8">
                    <div
                      before
                      class="splitter-doc__panel splitter-doc__panel--primary"
                    >
                      A
                    </div>
                    <div
                      after
                      class="splitter-doc__panel splitter-doc__panel--secondary"
                    >
                      B
                    </div>
                  </ax-splitter>
                </div>

                <div
                  class="splitter-doc__demo-container splitter-doc__demo-container--small"
                >
                  <h5 class="splitter-doc__demo-label">12px</h5>
                  <ax-splitter [size]="50" [separatorSize]="12">
                    <div
                      before
                      class="splitter-doc__panel splitter-doc__panel--primary"
                    >
                      A
                    </div>
                    <div
                      after
                      class="splitter-doc__panel splitter-doc__panel--secondary"
                    >
                      B
                    </div>
                  </ax-splitter>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="separatorSizeCode"></ax-code-tabs>
            </section>

            <!-- Pixel Unit Mode -->
            <section class="splitter-doc__section">
              <h2>Pixel Unit Mode</h2>
              <p>
                Use <code>unit="pixel"</code> for fixed-width sidebars that
                don't scale proportionally.
              </p>

              <ax-live-preview variant="bordered">
                <div class="splitter-doc__demo-container">
                  <ax-splitter
                    unit="pixel"
                    [size]="250"
                    [min]="150"
                    [max]="400"
                  >
                    <div
                      before
                      class="splitter-doc__panel splitter-doc__panel--primary"
                    >
                      <h4>Fixed Sidebar</h4>
                      <p>250px (150-400px range)</p>
                    </div>
                    <div
                      after
                      class="splitter-doc__panel splitter-doc__panel--secondary"
                    >
                      <h4>Flexible Content</h4>
                      <p>Takes remaining space</p>
                    </div>
                  </ax-splitter>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="pixelModeCode"></ax-code-tabs>
            </section>

            <!-- Disabled State -->
            <section class="splitter-doc__section">
              <h2>Disabled State</h2>
              <p>
                Disable resizing with <code>[disabled]="true"</code>. The
                separator becomes non-interactive.
              </p>

              <ax-live-preview variant="bordered">
                <div class="splitter-doc__demo-container">
                  <ax-splitter [size]="40" [disabled]="true">
                    <div
                      before
                      class="splitter-doc__panel splitter-doc__panel--muted"
                    >
                      <h4>Locked Panel</h4>
                      <p>Cannot resize</p>
                    </div>
                    <div
                      after
                      class="splitter-doc__panel splitter-doc__panel--muted"
                    >
                      <h4>Locked Panel</h4>
                      <p>Separator is disabled</p>
                    </div>
                  </ax-splitter>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="disabledCode"></ax-code-tabs>
            </section>

            <!-- Events -->
            <section class="splitter-doc__section">
              <h2>Events</h2>
              <p>
                Listen to <code>sizeChange</code>, <code>dragStart</code>, and
                <code>dragEnd</code> events for custom behavior.
              </p>

              <ax-live-preview variant="bordered">
                <div class="splitter-doc__demo-container">
                  <ax-splitter
                    [(size)]="interactiveSize"
                    (sizeChange)="onSizeChange($event)"
                    (dragStart)="onDragStart()"
                    (dragEnd)="onDragEnd($event)"
                  >
                    <div
                      before
                      class="splitter-doc__panel splitter-doc__panel--primary"
                    >
                      <h4>Size: {{ interactiveSize | number: '1.1-1' }}%</h4>
                      <p>Status: {{ dragStatus }}</p>
                    </div>
                    <div
                      after
                      class="splitter-doc__panel splitter-doc__panel--secondary"
                    >
                      <p>Drag to see events fire</p>
                    </div>
                  </ax-splitter>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="eventsCode"></ax-code-tabs>
            </section>

            <!-- State Persistence -->
            <section class="splitter-doc__section">
              <h2>State Persistence</h2>
              <p>
                Use <code>stateKey</code> and <code>stateStorage</code> to
                automatically remember the user's preferred panel size across
                page refreshes. This creates a user-friendly experience where
                layout preferences are preserved.
              </p>

              <ax-live-preview variant="bordered">
                <div class="splitter-doc__demo-container">
                  <ax-splitter
                    stateKey="docs-demo-splitter"
                    stateStorage="local"
                    [size]="30"
                    [min]="20"
                    [max]="60"
                  >
                    <div
                      before
                      class="splitter-doc__panel splitter-doc__panel--primary"
                    >
                      <h4>Persistent Sidebar</h4>
                      <p>Resize me and refresh the page!</p>
                    </div>
                    <div
                      after
                      class="splitter-doc__panel splitter-doc__panel--secondary"
                    >
                      <h4>Content Area</h4>
                      <p>Your size preference is saved</p>
                    </div>
                  </ax-splitter>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="statePersistenceCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="splitter-doc__tab-content">
            <!-- File Explorer Layout -->
            <section class="splitter-doc__section">
              <h2>File Explorer Layout</h2>
              <p>
                Classic sidebar + content layout like file explorers or IDEs.
              </p>

              <ax-live-preview variant="bordered">
                <div
                  class="splitter-doc__demo-container splitter-doc__demo-container--tall"
                >
                  <ax-splitter
                    unit="pixel"
                    [size]="220"
                    [min]="180"
                    [max]="350"
                  >
                    <div before class="splitter-doc__sidebar">
                      <div class="splitter-doc__sidebar-header">
                        <mat-icon>folder</mat-icon>
                        <span>Explorer</span>
                      </div>
                      <div class="splitter-doc__tree-item">
                        <mat-icon>folder_open</mat-icon> src
                      </div>
                      <div
                        class="splitter-doc__tree-item splitter-doc__tree-item--nested"
                      >
                        <mat-icon>folder</mat-icon> components
                      </div>
                      <div
                        class="splitter-doc__tree-item splitter-doc__tree-item--nested"
                      >
                        <mat-icon>folder</mat-icon> services
                      </div>
                      <div
                        class="splitter-doc__tree-item splitter-doc__tree-item--nested"
                      >
                        <mat-icon>description</mat-icon> app.ts
                      </div>
                      <div class="splitter-doc__tree-item">
                        <mat-icon>description</mat-icon> package.json
                      </div>
                    </div>
                    <div after class="splitter-doc__editor">
                      <div class="splitter-doc__editor-tabs">
                        <span
                          class="splitter-doc__editor-tab splitter-doc__editor-tab--active"
                        >
                          app.ts
                        </span>
                        <span class="splitter-doc__editor-tab"
                          >styles.scss</span
                        >
                      </div>
                      <div class="splitter-doc__editor-content">
                        <pre><code>import &#123; Component &#125; from '&#64;angular/core';

&#64;Component(&#123;
  selector: 'app-root',
  template: '&lt;router-outlet&gt;&lt;/router-outlet&gt;'
&#125;)
export class AppComponent &#123;&#125;</code></pre>
                      </div>
                    </div>
                  </ax-splitter>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="fileExplorerCode"></ax-code-tabs>
            </section>

            <!-- Email Client Layout -->
            <section class="splitter-doc__section">
              <h2>Email Client Layout</h2>
              <p>Three-column layout with nested splitters.</p>

              <ax-live-preview variant="bordered">
                <div
                  class="splitter-doc__demo-container splitter-doc__demo-container--tall"
                >
                  <ax-splitter
                    unit="pixel"
                    [size]="180"
                    [min]="120"
                    [max]="250"
                  >
                    <div before class="splitter-doc__mail-folders">
                      <div
                        class="splitter-doc__folder splitter-doc__folder--active"
                      >
                        <mat-icon>inbox</mat-icon> Inbox
                        <span class="splitter-doc__badge">12</span>
                      </div>
                      <div class="splitter-doc__folder">
                        <mat-icon>send</mat-icon> Sent
                      </div>
                      <div class="splitter-doc__folder">
                        <mat-icon>drafts</mat-icon> Drafts
                        <span class="splitter-doc__badge">3</span>
                      </div>
                      <div class="splitter-doc__folder">
                        <mat-icon>delete</mat-icon> Trash
                      </div>
                    </div>
                    <div after>
                      <ax-splitter [size]="45" [min]="30" [max]="70">
                        <div before class="splitter-doc__mail-list">
                          <div
                            class="splitter-doc__mail-item splitter-doc__mail-item--active"
                          >
                            <strong>Project Update</strong>
                            <span>Latest sprint review...</span>
                          </div>
                          <div class="splitter-doc__mail-item">
                            <strong>Weekly Report</strong>
                            <span>Summary of activities...</span>
                          </div>
                          <div class="splitter-doc__mail-item">
                            <strong>Meeting Invite</strong>
                            <span>You're invited to...</span>
                          </div>
                        </div>
                        <div after class="splitter-doc__mail-preview">
                          <h4>Project Update</h4>
                          <p class="splitter-doc__mail-meta">
                            From: team&#64;company.com
                          </p>
                          <p>
                            Here's the latest update on our project progress.
                            We've completed the following items...
                          </p>
                        </div>
                      </ax-splitter>
                    </div>
                  </ax-splitter>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="emailLayoutCode"></ax-code-tabs>
            </section>

            <!-- Dashboard with Properties Panel -->
            <section class="splitter-doc__section">
              <h2>Dashboard with Properties Panel</h2>
              <p>
                Right-side properties panel that can be resized or collapsed.
              </p>

              <ax-live-preview variant="bordered">
                <div
                  class="splitter-doc__demo-container splitter-doc__demo-container--tall"
                >
                  <ax-splitter [size]="70" [min]="50" [max]="85">
                    <div before class="splitter-doc__canvas">
                      <div class="splitter-doc__canvas-item">
                        <mat-icon>dashboard</mat-icon>
                        <span>Selected Widget</span>
                      </div>
                    </div>
                    <div after class="splitter-doc__properties">
                      <div class="splitter-doc__properties-header">
                        <mat-icon>tune</mat-icon>
                        Properties
                      </div>
                      <div class="splitter-doc__property">
                        <label>Width</label>
                        <input type="text" value="200px" />
                      </div>
                      <div class="splitter-doc__property">
                        <label>Height</label>
                        <input type="text" value="150px" />
                      </div>
                      <div class="splitter-doc__property">
                        <label>Background</label>
                        <input type="text" value="#f5f5f5" />
                      </div>
                    </div>
                  </ax-splitter>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="dashboardCode"></ax-code-tabs>
            </section>

            <!-- Vertical Split: Console -->
            <section class="splitter-doc__section">
              <h2>Code Editor with Console</h2>
              <p>Vertical split for editor above and console below.</p>

              <ax-live-preview variant="bordered">
                <div
                  class="splitter-doc__demo-container splitter-doc__demo-container--tall"
                >
                  <ax-splitter
                    orientation="vertical"
                    [size]="65"
                    [min]="30"
                    [max]="85"
                  >
                    <div before class="splitter-doc__code-area">
                      <div class="splitter-doc__code-header">
                        <mat-icon>code</mat-icon> Editor
                      </div>
                      <pre><code>function greet(name) &#123;
  console.log('Hello, ' + name);
&#125;

greet('World');</code></pre>
                    </div>
                    <div after class="splitter-doc__console">
                      <div class="splitter-doc__console-header">
                        <mat-icon>terminal</mat-icon> Console
                      </div>
                      <div class="splitter-doc__console-output">
                        <span class="splitter-doc__console-line"
                          >&gt; Hello, World</span
                        >
                      </div>
                    </div>
                  </ax-splitter>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="consoleCode"></ax-code-tabs>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="splitter-doc__tab-content">
            <section class="splitter-doc__section">
              <h2>Properties</h2>
              <div class="splitter-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>orientation</code></td>
                      <td><code>'horizontal' | 'vertical'</code></td>
                      <td><code>'horizontal'</code></td>
                      <td>
                        Split direction: horizontal (left/right) or vertical
                        (top/bottom)
                      </td>
                    </tr>
                    <tr>
                      <td><code>size</code></td>
                      <td><code>number</code></td>
                      <td><code>50</code></td>
                      <td>
                        Size of the "before" panel in percentage or pixels
                      </td>
                    </tr>
                    <tr>
                      <td><code>min</code></td>
                      <td><code>number</code></td>
                      <td><code>0</code></td>
                      <td>Minimum size constraint</td>
                    </tr>
                    <tr>
                      <td><code>max</code></td>
                      <td><code>number</code></td>
                      <td><code>100</code></td>
                      <td>Maximum size constraint</td>
                    </tr>
                    <tr>
                      <td><code>unit</code></td>
                      <td><code>'percent' | 'pixel'</code></td>
                      <td><code>'percent'</code></td>
                      <td>Unit type for size, min, and max values</td>
                    </tr>
                    <tr>
                      <td><code>separatorSize</code></td>
                      <td><code>number</code></td>
                      <td><code>8</code></td>
                      <td>Separator thickness in pixels</td>
                    </tr>
                    <tr>
                      <td><code>disabled</code></td>
                      <td><code>boolean</code></td>
                      <td><code>false</code></td>
                      <td>Disable resizing</td>
                    </tr>
                    <tr>
                      <td><code>stateKey</code></td>
                      <td><code>string | null</code></td>
                      <td><code>null</code></td>
                      <td>
                        Key to store splitter state. When provided, enables
                        automatic state persistence.
                      </td>
                    </tr>
                    <tr>
                      <td><code>stateStorage</code></td>
                      <td><code>'local' | 'session'</code></td>
                      <td><code>'local'</code></td>
                      <td>
                        Storage type: localStorage (persists) or sessionStorage
                        (clears on close)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="splitter-doc__section">
              <h2>Events</h2>
              <div class="splitter-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>sizeChange</code></td>
                      <td><code>EventEmitter&lt;number&gt;</code></td>
                      <td>
                        Emits continuously while dragging with the current size
                      </td>
                    </tr>
                    <tr>
                      <td><code>dragStart</code></td>
                      <td><code>EventEmitter&lt;void&gt;</code></td>
                      <td>Emits when user starts dragging the separator</td>
                    </tr>
                    <tr>
                      <td><code>dragEnd</code></td>
                      <td><code>EventEmitter&lt;number&gt;</code></td>
                      <td>
                        Emits when user stops dragging with the final size
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="splitter-doc__section">
              <h2>Content Projection</h2>
              <div class="splitter-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Selector</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>[before]</code></td>
                      <td>Content for the first panel (left or top)</td>
                    </tr>
                    <tr>
                      <td><code>[after]</code></td>
                      <td>Content for the second panel (right or bottom)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="splitter-doc__section">
              <h2>Methods</h2>
              <div class="splitter-doc__api-table">
                <table>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Parameters</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>setSize(size)</code></td>
                      <td><code>size: number</code></td>
                      <td>Programmatically set the panel size</td>
                    </tr>
                    <tr>
                      <td><code>reset(initialSize?)</code></td>
                      <td><code>initialSize?: number</code></td>
                      <td>Reset to initial size</td>
                    </tr>
                    <tr>
                      <td><code>clearState()</code></td>
                      <td>none</td>
                      <td>
                        Clear saved state from storage and reset to initial size
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="splitter-doc__tab-content">
            <ax-component-tokens
              [tokens]="splitterTokens"
            ></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="splitter-doc__tab-content">
            <section class="splitter-doc__section">
              <h2>Do's and Don'ts</h2>
              <div class="splitter-doc__guidelines">
                <div
                  class="splitter-doc__guideline splitter-doc__guideline--do"
                >
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>
                      Set reasonable min/max constraints to prevent unusable
                      layouts
                    </li>
                    <li>Use pixel units for fixed-width sidebars</li>
                    <li>Consider touch devices when setting separator size</li>
                    <li>Persist user's preferred size to localStorage</li>
                    <li>
                      Use vertical splits for stacked panels like editor/console
                    </li>
                  </ul>
                </div>

                <div
                  class="splitter-doc__guideline splitter-doc__guideline--dont"
                >
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Allow panels to be resized to zero width/height</li>
                    <li>Nest more than 2 levels of splitters</li>
                    <li>
                      Use splitters for simple layouts without resize need
                    </li>
                    <li>Ignore mobile/touch user experience</li>
                    <li>
                      Make separator too thin (&lt;4px) or too thick (&gt;16px)
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="splitter-doc__section">
              <h2>Accessibility</h2>
              <ul class="splitter-doc__a11y-list">
                <li>
                  <mat-icon>mouse</mat-icon>
                  <strong>Mouse:</strong> Click and drag separator to resize
                </li>
                <li>
                  <mat-icon>touch_app</mat-icon>
                  <strong>Touch:</strong> Touch and drag supported for mobile
                  devices
                </li>
                <li>
                  <mat-icon>visibility</mat-icon>
                  <strong>Visual:</strong> Separator has hover and dragging
                  state indicators
                </li>
              </ul>
            </section>

            <section class="splitter-doc__section">
              <h2>Use Cases</h2>
              <ul class="splitter-doc__use-cases">
                <li>
                  <mat-icon>folder</mat-icon>
                  <strong>File explorer:</strong> Resizable tree view next to
                  content area
                </li>
                <li>
                  <mat-icon>email</mat-icon>
                  <strong>Email client:</strong> Folders, list, and preview
                  panels
                </li>
                <li>
                  <mat-icon>code</mat-icon>
                  <strong>Code editor:</strong> Editor above, console/output
                  below
                </li>
                <li>
                  <mat-icon>tune</mat-icon>
                  <strong>Properties panel:</strong> Canvas with collapsible
                  side panel
                </li>
              </ul>
            </section>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .splitter-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--ax-spacing-xl, 1.5rem);
      }

      .splitter-doc__tabs {
        margin-top: var(--ax-spacing-xl, 1.5rem);
      }

      .splitter-doc__tab-content {
        padding: var(--ax-spacing-xl, 1.5rem) 0;
      }

      .splitter-doc__section {
        margin-bottom: var(--ax-spacing-3xl, 3rem);

        h2 {
          font-size: var(--ax-text-xl, 1.25rem);
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: 0 0 var(--ax-spacing-sm, 0.5rem) 0;
        }

        > p {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
          margin: 0 0 var(--ax-spacing-lg, 1rem) 0;
          max-width: 700px;
        }

        code {
          background: var(--ax-background-subtle);
          padding: 2px 6px;
          border-radius: var(--ax-radius-sm);
          font-size: var(--ax-text-xs);
        }
      }

      .splitter-doc__demo-container {
        width: 100%;
        height: 200px;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
        overflow: hidden;

        &--tall {
          height: 320px;
        }

        &--small {
          width: 200px;
          height: 120px;
        }
      }

      .splitter-doc__demo-label {
        font-size: var(--ax-text-xs);
        font-weight: 600;
        color: var(--ax-text-secondary);
        margin: 0 0 var(--ax-spacing-xs) 0;
        text-transform: uppercase;
      }

      .splitter-doc__panel {
        height: 100%;
        padding: var(--ax-spacing-md);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        h4 {
          margin: 0 0 var(--ax-spacing-xs) 0;
          font-size: var(--ax-text-sm);
          font-weight: 600;
        }

        p,
        span {
          margin: 0;
          font-size: var(--ax-text-xs);
          color: var(--ax-text-secondary);
        }

        &--primary {
          background: var(--ax-primary-faint, #f0f9ff);
        }

        &--secondary {
          background: var(--ax-background-subtle);
        }

        &--muted {
          background: var(--ax-background-muted);
          opacity: 0.7;
        }
      }

      /* File Explorer Example */
      .splitter-doc__sidebar {
        height: 100%;
        background: var(--ax-background-subtle);
        padding: var(--ax-spacing-sm);
      }

      .splitter-doc__sidebar-header {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-xs);
        padding: var(--ax-spacing-sm);
        font-weight: 600;
        font-size: var(--ax-text-sm);
        color: var(--ax-text-heading);
        border-bottom: 1px solid var(--ax-border-default);
        margin-bottom: var(--ax-spacing-sm);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .splitter-doc__tree-item {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-xs);
        padding: var(--ax-spacing-xs) var(--ax-spacing-sm);
        font-size: var(--ax-text-xs);
        color: var(--ax-text-secondary);
        border-radius: var(--ax-radius-sm);
        cursor: pointer;

        &:hover {
          background: var(--ax-background-muted);
        }

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          color: var(--ax-text-subtle);
        }

        &--nested {
          padding-left: var(--ax-spacing-lg);
        }
      }

      .splitter-doc__editor {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--ax-background-default);
      }

      .splitter-doc__editor-tabs {
        display: flex;
        background: var(--ax-background-subtle);
        border-bottom: 1px solid var(--ax-border-default);
      }

      .splitter-doc__editor-tab {
        padding: var(--ax-spacing-xs) var(--ax-spacing-md);
        font-size: var(--ax-text-xs);
        color: var(--ax-text-secondary);
        border-right: 1px solid var(--ax-border-default);

        &--active {
          background: var(--ax-background-default);
          color: var(--ax-text-heading);
          font-weight: 500;
        }
      }

      .splitter-doc__editor-content {
        flex: 1;
        padding: var(--ax-spacing-sm);
        overflow: auto;

        pre {
          margin: 0;
          font-size: var(--ax-text-xs);
          line-height: 1.5;
        }
      }

      /* Email Layout Example */
      .splitter-doc__mail-folders {
        height: 100%;
        background: var(--ax-background-subtle);
        padding: var(--ax-spacing-sm);
      }

      .splitter-doc__folder {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-xs);
        padding: var(--ax-spacing-xs) var(--ax-spacing-sm);
        font-size: var(--ax-text-xs);
        color: var(--ax-text-secondary);
        border-radius: var(--ax-radius-sm);
        cursor: pointer;

        &:hover {
          background: var(--ax-background-muted);
        }

        &--active {
          background: var(--ax-primary-faint);
          color: var(--ax-primary);
          font-weight: 500;
        }

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .splitter-doc__badge {
        margin-left: auto;
        background: var(--ax-primary);
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: var(--ax-radius-full);
      }

      .splitter-doc__mail-list {
        height: 100%;
        background: var(--ax-background-default);
        border-right: 1px solid var(--ax-border-default);
        overflow: auto;
      }

      .splitter-doc__mail-item {
        padding: var(--ax-spacing-sm);
        border-bottom: 1px solid var(--ax-border-default);
        cursor: pointer;

        &:hover {
          background: var(--ax-background-subtle);
        }

        &--active {
          background: var(--ax-primary-faint);
        }

        strong {
          display: block;
          font-size: var(--ax-text-xs);
          font-weight: 600;
          color: var(--ax-text-heading);
          margin-bottom: 2px;
        }

        span {
          font-size: var(--ax-text-xs);
          color: var(--ax-text-secondary);
        }
      }

      .splitter-doc__mail-preview {
        height: 100%;
        padding: var(--ax-spacing-md);
        overflow: auto;

        h4 {
          margin: 0 0 var(--ax-spacing-xs) 0;
          font-size: var(--ax-text-sm);
          font-weight: 600;
        }
      }

      .splitter-doc__mail-meta {
        font-size: var(--ax-text-xs);
        color: var(--ax-text-secondary);
        margin: 0 0 var(--ax-spacing-sm) 0;
      }

      /* Dashboard Example */
      .splitter-doc__canvas {
        height: 100%;
        background: var(--ax-background-subtle);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .splitter-doc__canvas-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--ax-spacing-xs);
        padding: var(--ax-spacing-lg);
        border: 2px dashed var(--ax-primary);
        border-radius: var(--ax-radius-lg);
        background: var(--ax-background-default);

        mat-icon {
          color: var(--ax-primary);
        }

        span {
          font-size: var(--ax-text-xs);
          color: var(--ax-text-secondary);
        }
      }

      .splitter-doc__properties {
        height: 100%;
        background: var(--ax-background-default);
        padding: var(--ax-spacing-sm);
      }

      .splitter-doc__properties-header {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-xs);
        padding: var(--ax-spacing-sm);
        font-weight: 600;
        font-size: var(--ax-text-sm);
        border-bottom: 1px solid var(--ax-border-default);
        margin-bottom: var(--ax-spacing-sm);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: var(--ax-text-subtle);
        }
      }

      .splitter-doc__property {
        margin-bottom: var(--ax-spacing-sm);

        label {
          display: block;
          font-size: var(--ax-text-xs);
          color: var(--ax-text-secondary);
          margin-bottom: 4px;
        }

        input {
          width: 100%;
          padding: var(--ax-spacing-xs) var(--ax-spacing-sm);
          border: 1px solid var(--ax-border-default);
          border-radius: var(--ax-radius-sm);
          font-size: var(--ax-text-xs);
        }
      }

      /* Console Example */
      .splitter-doc__code-area {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #1e1e1e;
      }

      .splitter-doc__code-header {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-xs);
        padding: var(--ax-spacing-xs) var(--ax-spacing-sm);
        background: #2d2d2d;
        color: #fff;
        font-size: var(--ax-text-xs);

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .splitter-doc__code-area pre {
        flex: 1;
        margin: 0;
        padding: var(--ax-spacing-sm);
        color: #d4d4d4;
        font-size: var(--ax-text-xs);
        line-height: 1.6;
        overflow: auto;
      }

      .splitter-doc__console {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #1a1a1a;
      }

      .splitter-doc__console-header {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-xs);
        padding: var(--ax-spacing-xs) var(--ax-spacing-sm);
        background: #252525;
        color: #fff;
        font-size: var(--ax-text-xs);

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .splitter-doc__console-output {
        flex: 1;
        padding: var(--ax-spacing-sm);
        overflow: auto;
      }

      .splitter-doc__console-line {
        display: block;
        color: #4ec9b0;
        font-family: monospace;
        font-size: var(--ax-text-xs);
      }

      /* API Table */
      .splitter-doc__api-table {
        overflow-x: auto;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          text-align: left;
          padding: var(--ax-spacing-sm) var(--ax-spacing-md);
          border-bottom: 1px solid var(--ax-border-default);
          font-size: var(--ax-text-sm);
        }

        th {
          background: var(--ax-background-subtle);
          font-weight: 600;
          font-size: var(--ax-text-xs);
          text-transform: uppercase;
          color: var(--ax-text-secondary);
        }

        tr:last-child td {
          border-bottom: none;
        }

        code {
          background: var(--ax-background-subtle);
          padding: 2px 6px;
          border-radius: var(--ax-radius-sm);
          font-size: var(--ax-text-xs);
        }
      }

      /* Guidelines */
      .splitter-doc__guidelines {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg);
      }

      .splitter-doc__guideline {
        padding: var(--ax-spacing-lg);
        border-radius: var(--ax-radius-lg);

        &--do {
          background: var(--ax-success-faint);
        }

        &--dont {
          background: var(--ax-error-faint);
        }

        h4 {
          display: flex;
          align-items: center;
          gap: var(--ax-spacing-xs);
          margin: 0 0 var(--ax-spacing-md) 0;
          font-size: var(--ax-text-base);
          font-weight: 600;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        ul {
          margin: 0;
          padding-left: var(--ax-spacing-lg);

          li {
            font-size: var(--ax-text-sm);
            margin-bottom: var(--ax-spacing-xs);
          }
        }
      }

      .splitter-doc__a11y-list,
      .splitter-doc__use-cases {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          display: flex;
          align-items: flex-start;
          gap: var(--ax-spacing-sm);
          padding: var(--ax-spacing-md);
          background: var(--ax-background-subtle);
          border-radius: var(--ax-radius-md);
          margin-bottom: var(--ax-spacing-sm);
          font-size: var(--ax-text-sm);

          mat-icon {
            color: var(--ax-primary);
            flex-shrink: 0;
          }
        }
      }
    `,
  ],
})
export class SplitterDocComponent {
  interactiveSize = 40;
  dragStatus = 'Idle';

  onSizeChange(size: number) {
    // Called continuously during drag
  }

  onDragStart() {
    this.dragStatus = 'Dragging...';
  }

  onDragEnd(size: number) {
    this.dragStatus = `Ended at ${size.toFixed(1)}%`;
  }

  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-splitter [size]="40">
  <div before>
    <h4>Left Panel</h4>
    <p>Drag the separator to resize</p>
  </div>
  <div after>
    <h4>Right Panel</h4>
    <p>Content adjusts automatically</p>
  </div>
</ax-splitter>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component } from '@angular/core';
import { AxSplitterComponent } from '@aegisx/ui';

@Component({
  selector: 'app-split-layout',
  standalone: true,
  imports: [AxSplitterComponent],
  template: \`
    <ax-splitter [size]="40">
      <div before>Left Panel</div>
      <div after>Right Panel</div>
    </ax-splitter>
  \`,
})
export class SplitLayoutComponent {}`,
    },
  ];

  orientationsCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<!-- Horizontal (side by side) - DEFAULT -->
<ax-splitter orientation="horizontal" [size]="35">
  <div before>Left</div>
  <div after>Right</div>
</ax-splitter>

<!-- Vertical (stacked top/bottom) -->
<ax-splitter orientation="vertical" [size]="40">
  <div before>Top</div>
  <div after>Bottom</div>
</ax-splitter>`,
    },
  ];

  constraintsCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<!-- Panel can only be resized between 20% and 80% -->
<ax-splitter [size]="50" [min]="20" [max]="80">
  <div before>Constrained Panel (min: 20%, max: 80%)</div>
  <div after>Right Panel</div>
</ax-splitter>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `@Component({
  template: \`
    <ax-splitter
      [size]="sidebarWidth"
      [min]="minWidth"
      [max]="maxWidth"
      (sizeChange)="onSizeChange($event)"
    >
      <nav before>Sidebar</nav>
      <main after>Content</main>
    </ax-splitter>
  \`,
})
export class LayoutComponent {
  sidebarWidth = 30;
  minWidth = 15;
  maxWidth = 50;

  onSizeChange(newSize: number) {
    this.sidebarWidth = newSize;
    // Optionally save to localStorage
    localStorage.setItem('sidebarWidth', String(newSize));
  }
}`,
    },
  ];

  separatorSizeCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<!-- Thin separator (4px) -->
<ax-splitter [separatorSize]="4">
  <div before>A</div>
  <div after>B</div>
</ax-splitter>

<!-- Default separator (8px) -->
<ax-splitter [separatorSize]="8">
  <div before>A</div>
  <div after>B</div>
</ax-splitter>

<!-- Thick separator for touch (12px) -->
<ax-splitter [separatorSize]="12">
  <div before>A</div>
  <div after>B</div>
</ax-splitter>`,
    },
  ];

  pixelModeCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<!-- Fixed 250px sidebar (resizable between 150-400px) -->
<ax-splitter unit="pixel" [size]="250" [min]="150" [max]="400">
  <aside before class="sidebar">
    <h4>Fixed Sidebar</h4>
    <p>250px (150-400px range)</p>
  </aside>
  <main after class="content">
    <h4>Flexible Content</h4>
    <p>Takes remaining space</p>
  </main>
</ax-splitter>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `@Component({
  template: \`
    <ax-splitter
      unit="pixel"
      [size]="sidebarWidth"
      [min]="150"
      [max]="400"
      (dragEnd)="saveSidebarWidth($event)"
    >
      <aside before>Sidebar</aside>
      <main after>Content</main>
    </ax-splitter>
  \`,
})
export class LayoutComponent {
  sidebarWidth = 250;

  constructor() {
    // Restore saved width
    const saved = localStorage.getItem('sidebarWidth');
    if (saved) this.sidebarWidth = Number(saved);
  }

  saveSidebarWidth(width: number) {
    this.sidebarWidth = width;
    localStorage.setItem('sidebarWidth', String(width));
  }
}`,
    },
  ];

  disabledCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<!-- Disable resizing -->
<ax-splitter [size]="40" [disabled]="true">
  <div before>Locked Panel</div>
  <div after>Cannot resize</div>
</ax-splitter>

<!-- Conditionally disable -->
<ax-splitter [size]="40" [disabled]="isLocked">
  <div before>Panel</div>
  <div after>Panel</div>
</ax-splitter>`,
    },
  ];

  eventsCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-splitter
  [(size)]="panelSize"
  (sizeChange)="onSizeChange($event)"
  (dragStart)="onDragStart()"
  (dragEnd)="onDragEnd($event)"
>
  <div before>
    <h4>Size: {{ panelSize | number: '1.1-1' }}%</h4>
    <p>Status: {{ status }}</p>
  </div>
  <div after>Content</div>
</ax-splitter>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `@Component({
  template: \`...\`,
})
export class MyComponent {
  panelSize = 40;
  status = 'Idle';

  onSizeChange(size: number) {
    // Called continuously during drag
    console.log('Current size:', size);
  }

  onDragStart() {
    this.status = 'Dragging...';
    // Pause expensive operations during drag
  }

  onDragEnd(finalSize: number) {
    this.status = \`Ended at \${finalSize.toFixed(1)}%\`;
    // Save to localStorage or API
    localStorage.setItem('panelSize', String(finalSize));
  }
}`,
    },
  ];

  fileExplorerCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-splitter unit="pixel" [size]="220" [min]="180" [max]="350">
  <nav before class="sidebar">
    <div class="sidebar-header">
      <mat-icon>folder</mat-icon>
      <span>Explorer</span>
    </div>
    <div class="tree-item">
      <mat-icon>folder_open</mat-icon> src
    </div>
    <div class="tree-item nested">
      <mat-icon>folder</mat-icon> components
    </div>
    <div class="tree-item nested">
      <mat-icon>description</mat-icon> app.ts
    </div>
  </nav>
  <main after class="editor">
    <div class="editor-tabs">
      <span class="tab active">app.ts</span>
    </div>
    <div class="editor-content">
      <pre><code>// Your code here</code></pre>
    </div>
  </main>
</ax-splitter>`,
    },
  ];

  emailLayoutCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<!-- Three-column email layout with nested splitters -->
<ax-splitter unit="pixel" [size]="180" [min]="120" [max]="250">
  <nav before class="mail-folders">
    <div class="folder active">
      <mat-icon>inbox</mat-icon> Inbox
      <span class="badge">12</span>
    </div>
    <div class="folder">
      <mat-icon>send</mat-icon> Sent
    </div>
  </nav>
  <div after>
    <!-- Nested splitter for list/preview -->
    <ax-splitter [size]="45" [min]="30" [max]="70">
      <div before class="mail-list">
        <div class="mail-item active">
          <strong>Project Update</strong>
          <span>Latest sprint review...</span>
        </div>
      </div>
      <div after class="mail-preview">
        <h4>Project Update</h4>
        <p>Email content here...</p>
      </div>
    </ax-splitter>
  </div>
</ax-splitter>`,
    },
  ];

  dashboardCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-splitter [size]="70" [min]="50" [max]="85">
  <div before class="canvas">
    <!-- Main content/canvas area -->
    <div class="selected-widget">
      <mat-icon>dashboard</mat-icon>
      <span>Selected Widget</span>
    </div>
  </div>
  <aside after class="properties-panel">
    <div class="panel-header">
      <mat-icon>tune</mat-icon>
      Properties
    </div>
    <div class="property">
      <label>Width</label>
      <input type="text" [(ngModel)]="width" />
    </div>
    <div class="property">
      <label>Height</label>
      <input type="text" [(ngModel)]="height" />
    </div>
  </aside>
</ax-splitter>`,
    },
  ];

  statePersistenceCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<!-- Automatic state persistence with localStorage -->
<ax-splitter
  stateKey="my-app-sidebar"
  stateStorage="local"
  [size]="30"
  [min]="20"
  [max]="60"
>
  <div before>Sidebar - resize me!</div>
  <div after>Content</div>
</ax-splitter>

<!-- Session-only persistence (clears when browser closes) -->
<ax-splitter stateKey="temp-splitter" stateStorage="session">
  <div before>Temp Panel</div>
  <div after>Content</div>
</ax-splitter>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component, ViewChild } from '@angular/core';
import { AxSplitterComponent } from '@aegisx/ui';

@Component({
  template: \`
    <ax-splitter
      #splitter
      stateKey="file-explorer-sidebar"
      stateStorage="local"
      [size]="25"
    >
      <nav before>File Tree</nav>
      <main after>Editor</main>
    </ax-splitter>
    <button (click)="resetLayout()">Reset Layout</button>
  \`,
})
export class FileExplorerComponent {
  @ViewChild('splitter') splitter!: AxSplitterComponent;

  resetLayout() {
    // Clears saved state and resets to initial size
    this.splitter.clearState();
  }
}`,
    },
  ];

  consoleCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-splitter orientation="vertical" [size]="65" [min]="30" [max]="85">
  <div before class="code-editor">
    <div class="editor-header">
      <mat-icon>code</mat-icon> Editor
    </div>
    <pre><code>function greet(name) {
  console.log('Hello, ' + name);
}
greet('World');</code></pre>
  </div>
  <div after class="console">
    <div class="console-header">
      <mat-icon>terminal</mat-icon> Console
    </div>
    <div class="console-output">
      <span>&gt; Hello, World</span>
    </div>
  </div>
</ax-splitter>`,
    },
  ];

  splitterTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-background-default',
      usage: 'Panel background color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-background-subtle',
      usage: 'Separator background',
    },
    {
      category: 'Colors',
      cssVar: '--ax-background-muted',
      usage: 'Separator hover state',
    },
    {
      category: 'Colors',
      cssVar: '--ax-primary',
      usage: 'Separator active/dragging state',
    },
    {
      category: 'Colors',
      cssVar: '--ax-border-default',
      usage: 'Separator handle dots',
    },
    {
      category: 'Borders',
      cssVar: '--ax-radius-sm',
      usage: 'Separator handle border radius',
    },
    {
      category: 'Transitions',
      cssVar: '--ax-transition-fast',
      usage: 'Hover state transitions',
    },
  ];
}
