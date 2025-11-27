import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AxAvatarComponent } from '@aegisx/ui';
import {
  DocHeaderComponent,
  CodeTabsComponent,
  LivePreviewComponent,
  ComponentTokensComponent,
} from '../../../../../../components/docs';
import { ComponentToken } from '../../../../../../types/docs.types';

@Component({
  selector: 'ax-avatar-doc',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    AxAvatarComponent,
    DocHeaderComponent,
    CodeTabsComponent,
    LivePreviewComponent,
    ComponentTokensComponent,
  ],
  template: `
    <div class="avatar-doc">
      <ax-doc-header
        title="Avatar"
        description="Visual representation of a user or entity with support for images, initials, and fallback states."
        [breadcrumbs]="[
          { label: 'Docs', link: '/docs' },
          {
            label: 'Components',
            link: '/docs/components/data-display/overview',
          },
          {
            label: 'Data Display',
            link: '/docs/components/data-display/overview',
          },
          { label: 'Avatar' },
        ]"
        status="stable"
        version="1.0.0"
        importStatement="import { AxAvatarComponent } from '@aegisx/ui';"
      ></ax-doc-header>

      <mat-tab-group class="avatar-doc__tabs" animationDuration="150ms">
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="avatar-doc__tab-content">
            <section class="avatar-doc__section">
              <h2>Basic Usage</h2>
              <p>
                Avatars display user profile images or initials. They
                automatically generate initials from the name when no image is
                provided or when the image fails to load.
              </p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-md)">
                <ax-avatar
                  src="https://i.pravatar.cc/150?img=1"
                  alt="John Doe"
                ></ax-avatar>
                <ax-avatar name="John Doe"></ax-avatar>
                <ax-avatar name="Alice Smith"></ax-avatar>
                <ax-avatar name="Bob"></ax-avatar>
              </ax-live-preview>

              <ax-code-tabs [tabs]="basicUsageCode"></ax-code-tabs>
            </section>

            <section class="avatar-doc__section">
              <h2>Sizes</h2>
              <p>Avatars come in five sizes to fit different contexts.</p>

              <ax-live-preview
                variant="bordered"
                gap="var(--ax-spacing-md)"
                align="end"
              >
                <ax-avatar name="XS" size="xs"></ax-avatar>
                <ax-avatar name="SM" size="sm"></ax-avatar>
                <ax-avatar name="MD" size="md"></ax-avatar>
                <ax-avatar name="LG" size="lg"></ax-avatar>
                <ax-avatar name="XL" size="xl"></ax-avatar>
              </ax-live-preview>

              <ax-code-tabs [tabs]="sizesCode"></ax-code-tabs>
            </section>

            <section class="avatar-doc__section">
              <h2>Shapes</h2>
              <p>Choose between circle (default) and square shapes.</p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-lg)">
                <div class="avatar-doc__shape-demo">
                  <ax-avatar name="Circle" shape="circle" size="lg"></ax-avatar>
                  <span>Circle (default)</span>
                </div>
                <div class="avatar-doc__shape-demo">
                  <ax-avatar name="Square" shape="square" size="lg"></ax-avatar>
                  <span>Square</span>
                </div>
              </ax-live-preview>

              <ax-code-tabs [tabs]="shapesCode"></ax-code-tabs>
            </section>

            <section class="avatar-doc__section">
              <h2>With Images</h2>
              <p>
                Display profile images with automatic fallback to initials on
                error.
              </p>

              <ax-live-preview variant="bordered" gap="var(--ax-spacing-md)">
                <ax-avatar
                  src="https://i.pravatar.cc/150?img=3"
                  alt="User 1"
                  size="lg"
                >
                </ax-avatar>
                <ax-avatar
                  src="https://i.pravatar.cc/150?img=5"
                  alt="User 2"
                  size="lg"
                >
                </ax-avatar>
                <ax-avatar
                  src="https://i.pravatar.cc/150?img=8"
                  alt="User 3"
                  size="lg"
                >
                </ax-avatar>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="avatar-doc__tab-content">
            <section class="avatar-doc__section">
              <h2>User List</h2>
              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
              >
                <div class="avatar-doc__user-item">
                  <ax-avatar name="Sarah Johnson" size="md"></ax-avatar>
                  <div class="user-info">
                    <span class="user-name">Sarah Johnson</span>
                    <span class="user-role">Product Manager</span>
                  </div>
                </div>
                <div class="avatar-doc__user-item">
                  <ax-avatar
                    src="https://i.pravatar.cc/150?img=12"
                    alt="Mike Chen"
                    size="md"
                  ></ax-avatar>
                  <div class="user-info">
                    <span class="user-name">Mike Chen</span>
                    <span class="user-role">Senior Developer</span>
                  </div>
                </div>
                <div class="avatar-doc__user-item">
                  <ax-avatar name="Emily Davis" size="md"></ax-avatar>
                  <div class="user-info">
                    <span class="user-name">Emily Davis</span>
                    <span class="user-role">UX Designer</span>
                  </div>
                </div>
              </ax-live-preview>
            </section>

            <section class="avatar-doc__section">
              <h2>Avatar Stack</h2>
              <ax-live-preview variant="bordered">
                <div class="avatar-doc__stack">
                  <ax-avatar
                    src="https://i.pravatar.cc/150?img=1"
                    size="md"
                  ></ax-avatar>
                  <ax-avatar
                    src="https://i.pravatar.cc/150?img=2"
                    size="md"
                  ></ax-avatar>
                  <ax-avatar
                    src="https://i.pravatar.cc/150?img=3"
                    size="md"
                  ></ax-avatar>
                  <ax-avatar
                    src="https://i.pravatar.cc/150?img=4"
                    size="md"
                  ></ax-avatar>
                  <ax-avatar name="+5" size="md"></ax-avatar>
                </div>
              </ax-live-preview>
            </section>

            <section class="avatar-doc__section">
              <h2>Comment Thread</h2>
              <ax-live-preview
                variant="bordered"
                direction="column"
                align="stretch"
              >
                <div class="avatar-doc__comment">
                  <ax-avatar name="Alex Wong" size="sm"></ax-avatar>
                  <div class="comment-content">
                    <div class="comment-header">
                      <strong>Alex Wong</strong>
                      <span>2 hours ago</span>
                    </div>
                    <p>
                      Great work on the new design! The color scheme looks
                      perfect.
                    </p>
                  </div>
                </div>
                <div class="avatar-doc__comment avatar-doc__comment--reply">
                  <ax-avatar name="Sarah Johnson" size="sm"></ax-avatar>
                  <div class="comment-content">
                    <div class="comment-header">
                      <strong>Sarah Johnson</strong>
                      <span>1 hour ago</span>
                    </div>
                    <p>Thanks Alex! I'll update the documentation today.</p>
                  </div>
                </div>
              </ax-live-preview>
            </section>
          </div>
        </mat-tab>

        <!-- API Tab -->
        <mat-tab label="API">
          <div class="avatar-doc__tab-content">
            <section class="avatar-doc__section">
              <h2>Properties</h2>
              <div class="avatar-doc__api-table">
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
                      <td><code>src</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Image URL for the avatar</td>
                    </tr>
                    <tr>
                      <td><code>alt</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Alt text for the image</td>
                    </tr>
                    <tr>
                      <td><code>name</code></td>
                      <td><code>string</code></td>
                      <td><code>''</code></td>
                      <td>Name to generate initials from</td>
                    </tr>
                    <tr>
                      <td><code>size</code></td>
                      <td><code>'xs' | 'sm' | 'md' | 'lg' | 'xl'</code></td>
                      <td><code>'md'</code></td>
                      <td>Avatar size</td>
                    </tr>
                    <tr>
                      <td><code>shape</code></td>
                      <td><code>'circle' | 'square'</code></td>
                      <td><code>'circle'</code></td>
                      <td>Avatar shape</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="avatar-doc__section">
              <h2>Initials Generation</h2>
              <p>
                When no image is provided or the image fails to load, the avatar
                displays initials:
              </p>
              <ul class="avatar-doc__feature-list">
                <li><strong>Two words:</strong> "John Doe" → "JD"</li>
                <li>
                  <strong>Three+ words:</strong> "John Michael Doe" → "JD"
                  (first and last)
                </li>
                <li>
                  <strong>One word:</strong> "John" → "JO" (first two
                  characters)
                </li>
              </ul>
            </section>
          </div>
        </mat-tab>

        <!-- Tokens Tab -->
        <mat-tab label="Tokens">
          <div class="avatar-doc__tab-content">
            <ax-component-tokens [tokens]="avatarTokens"></ax-component-tokens>
          </div>
        </mat-tab>

        <!-- Guidelines Tab -->
        <mat-tab label="Guidelines">
          <div class="avatar-doc__tab-content">
            <section class="avatar-doc__section">
              <h2>Do's and Don'ts</h2>

              <div class="avatar-doc__guidelines">
                <div class="avatar-doc__guideline avatar-doc__guideline--do">
                  <h4><mat-icon>check_circle</mat-icon> Do</h4>
                  <ul>
                    <li>Always provide a name for fallback initials</li>
                    <li>Use consistent sizes within the same context</li>
                    <li>Add alt text for accessibility</li>
                    <li>
                      Use circle for user profiles, square for objects/brands
                    </li>
                  </ul>
                </div>

                <div class="avatar-doc__guideline avatar-doc__guideline--dont">
                  <h4><mat-icon>cancel</mat-icon> Don't</h4>
                  <ul>
                    <li>Mix different sizes in the same list</li>
                    <li>Use avatars without any fallback content</li>
                    <li>Stretch or distort avatar images</li>
                    <li>Use low-quality images</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="avatar-doc__section">
              <h2>Accessibility</h2>
              <ul class="avatar-doc__a11y-list">
                <li>Always provide meaningful alt text for images</li>
                <li>Ensure sufficient color contrast for initials</li>
                <li>
                  Don't rely solely on avatars to convey important information
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
      .avatar-doc {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--ax-spacing-xl, 1.5rem);
      }

      .avatar-doc__tabs {
        margin-top: var(--ax-spacing-xl, 1.5rem);
      }

      .avatar-doc__tab-content {
        padding: var(--ax-spacing-xl, 1.5rem) 0;
      }

      .avatar-doc__section {
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
      }

      /* Shape demo */
      .avatar-doc__shape-demo {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);

        span {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
        }
      }

      /* User list example */
      .avatar-doc__user-item {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-md, 0.75rem);
        padding: var(--ax-spacing-sm, 0.5rem);
        border-radius: var(--ax-radius-md, 0.5rem);

        &:hover {
          background: var(--ax-background-subtle);
        }
      }

      .user-info {
        display: flex;
        flex-direction: column;
      }

      .user-name {
        font-size: var(--ax-text-sm, 0.875rem);
        font-weight: 600;
        color: var(--ax-text-heading);
      }

      .user-role {
        font-size: var(--ax-text-xs, 0.75rem);
        color: var(--ax-text-secondary);
      }

      /* Avatar stack */
      .avatar-doc__stack {
        display: flex;

        ax-avatar {
          margin-left: -8px;
          border: 2px solid var(--ax-background-default);
          border-radius: 50%;

          &:first-child {
            margin-left: 0;
          }
        }
      }

      /* Comment thread */
      .avatar-doc__comment {
        display: flex;
        gap: var(--ax-spacing-sm, 0.5rem);
        padding: var(--ax-spacing-sm, 0.5rem);
      }

      .avatar-doc__comment--reply {
        margin-left: var(--ax-spacing-xl, 1.5rem);
      }

      .comment-content {
        flex: 1;
      }

      .comment-header {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);
        margin-bottom: var(--ax-spacing-xs, 0.25rem);

        strong {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-heading);
        }

        span {
          font-size: var(--ax-text-xs, 0.75rem);
          color: var(--ax-text-secondary);
        }
      }

      .comment-content p {
        margin: 0;
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-primary);
      }

      /* API Table */
      .avatar-doc__api-table {
        overflow-x: auto;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg, 0.75rem);

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          text-align: left;
          padding: var(--ax-spacing-sm, 0.5rem) var(--ax-spacing-md, 0.75rem);
          border-bottom: 1px solid var(--ax-border-default);
        }

        th {
          background: var(--ax-background-subtle);
          font-size: var(--ax-text-xs, 0.75rem);
          font-weight: 600;
          color: var(--ax-text-secondary);
          text-transform: uppercase;
        }

        td {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-primary);
        }

        td code {
          font-family: var(--ax-font-mono);
          font-size: var(--ax-text-xs, 0.75rem);
          background: var(--ax-background-subtle);
          padding: 2px 6px;
          border-radius: var(--ax-radius-sm, 0.25rem);
        }

        tr:last-child td {
          border-bottom: none;
        }
      }

      .avatar-doc__feature-list {
        margin: var(--ax-spacing-md, 0.75rem) 0;
        padding-left: var(--ax-spacing-lg, 1rem);

        li {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
          margin-bottom: var(--ax-spacing-xs, 0.25rem);
        }
      }

      /* Guidelines */
      .avatar-doc__guidelines {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-lg, 1rem);
      }

      .avatar-doc__guideline {
        padding: var(--ax-spacing-lg, 1rem);
        border-radius: var(--ax-radius-lg, 0.75rem);

        h4 {
          display: flex;
          align-items: center;
          gap: var(--ax-spacing-xs, 0.25rem);
          font-size: var(--ax-text-base, 1rem);
          font-weight: 600;
          margin: 0 0 var(--ax-spacing-sm, 0.5rem) 0;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        ul {
          margin: 0;
          padding-left: var(--ax-spacing-lg, 1rem);

          li {
            font-size: var(--ax-text-sm, 0.875rem);
            margin-bottom: var(--ax-spacing-xs, 0.25rem);
          }
        }
      }

      .avatar-doc__guideline--do {
        background: var(--ax-success-faint);

        h4 {
          color: var(--ax-success-emphasis);
        }
        li {
          color: var(--ax-success-emphasis);
        }
      }

      .avatar-doc__guideline--dont {
        background: var(--ax-error-faint);

        h4 {
          color: var(--ax-error-emphasis);
        }
        li {
          color: var(--ax-error-emphasis);
        }
      }

      .avatar-doc__a11y-list {
        margin: 0;
        padding-left: var(--ax-spacing-lg, 1rem);

        li {
          font-size: var(--ax-text-sm, 0.875rem);
          color: var(--ax-text-secondary);
          margin-bottom: var(--ax-spacing-sm, 0.5rem);
        }
      }
    `,
  ],
})
export class AvatarDocComponent {
  basicUsageCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<!-- With image -->
<ax-avatar src="https://example.com/photo.jpg" alt="John Doe"></ax-avatar>

<!-- With name (shows initials) -->
<ax-avatar name="John Doe"></ax-avatar>

<!-- Fallback: image with name -->
<ax-avatar
  src="https://example.com/photo.jpg"
  alt="John Doe"
  name="John Doe">
</ax-avatar>`,
    },
    {
      label: 'TypeScript',
      language: 'typescript' as const,
      code: `import { Component } from '@angular/core';
import { AxAvatarComponent } from '@aegisx/ui';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [AxAvatarComponent],
  template: \`
    <ax-avatar name="John Doe"></ax-avatar>
  \`,
})
export class MyComponent {}`,
    },
  ];

  sizesCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<ax-avatar name="XS" size="xs"></ax-avatar>  <!-- 24px -->
<ax-avatar name="SM" size="sm"></ax-avatar>  <!-- 32px -->
<ax-avatar name="MD" size="md"></ax-avatar>  <!-- 40px (default) -->
<ax-avatar name="LG" size="lg"></ax-avatar>  <!-- 48px -->
<ax-avatar name="XL" size="xl"></ax-avatar>  <!-- 64px -->`,
    },
  ];

  shapesCode = [
    {
      label: 'HTML',
      language: 'html' as const,
      code: `<!-- Circle (default) -->
<ax-avatar name="Circle" shape="circle"></ax-avatar>

<!-- Square -->
<ax-avatar name="Square" shape="square"></ax-avatar>`,
    },
  ];

  avatarTokens: ComponentToken[] = [
    {
      category: 'Colors',
      cssVar: '--ax-brand-default',
      usage: 'Default background color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-brand-inverted',
      usage: 'Text/initials color',
    },
    {
      category: 'Colors',
      cssVar: '--ax-background-subtle',
      usage: 'Fallback background',
    },
    { category: 'Borders', cssVar: '--ax-radius-full', usage: 'Circle shape' },
    {
      category: 'Borders',
      cssVar: '--ax-radius-md',
      usage: 'Square shape corners',
    },
    {
      category: 'Typography',
      cssVar: '--ax-text-xs',
      usage: 'XS/SM size text',
    },
    { category: 'Typography', cssVar: '--ax-text-sm', usage: 'MD size text' },
    {
      category: 'Typography',
      cssVar: '--ax-text-lg',
      usage: 'LG/XL size text',
    },
  ];
}
