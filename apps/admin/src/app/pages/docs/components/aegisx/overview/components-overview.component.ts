import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-components-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="components-intro">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-bg">
          <div class="gradient-orb orb-1"></div>
          <div class="gradient-orb orb-2"></div>
          <div class="grid-pattern"></div>
        </div>

        <div class="hero-content">
          <div class="hero-badge">
            <mat-icon>widgets</mat-icon>
            <span>AegisX UI Components</span>
          </div>

          <h1 class="hero-title">
            <span class="gradient-text">Production-Ready</span>
            <br />
            Angular Components
          </h1>

          <p class="hero-description">
            A comprehensive collection of 19+ beautifully crafted components
            built with Angular 18+, Material Design 3, and modern best
            practices. Every component is accessible, customizable, and ready
            for enterprise use.
          </p>

          <div class="hero-actions">
            <a
              mat-flat-button
              color="primary"
              routerLink="/docs/components/aegisx/data-display/card"
              class="primary-btn"
            >
              <mat-icon>play_arrow</mat-icon>
              Explore Components
            </a>
            <a
              mat-stroked-button
              routerLink="/docs/getting-started/installation"
              class="secondary-btn"
            >
              <mat-icon>download</mat-icon>
              Installation Guide
            </a>
          </div>
        </div>

        <!-- Component Preview Grid -->
        <div class="preview-grid">
          @for (preview of componentPreviews; track preview.name) {
            <div class="preview-card" [style.--delay]="preview.delay">
              <div class="preview-icon" [style.background]="preview.gradient">
                <mat-icon>{{ preview.icon }}</mat-icon>
              </div>
              <span class="preview-name">{{ preview.name }}</span>
            </div>
          }
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats">
        @for (stat of stats; track stat.label) {
          <div class="stat-item">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        }
      </section>

      <!-- Categories Section -->
      <section class="categories">
        <div class="section-header">
          <h2>Component Categories</h2>
          <p>Organized by functionality for easy discovery</p>
        </div>

        <div class="category-grid">
          @for (category of categories; track category.title) {
            <a [routerLink]="category.link" class="category-card">
              <div class="category-icon" [style.background]="category.gradient">
                <mat-icon>{{ category.icon }}</mat-icon>
              </div>
              <div class="category-content">
                <h3>{{ category.title }}</h3>
                <p>{{ category.description }}</p>
                <div class="category-components">
                  @for (comp of category.components; track comp) {
                    <span class="component-tag">{{ comp }}</span>
                  }
                </div>
              </div>
              <div class="category-count">{{ category.count }}</div>
            </a>
          }
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <div class="section-header">
          <h2>Built for Developers</h2>
          <p>Every component follows modern Angular best practices</p>
        </div>

        <div class="features-grid">
          @for (feature of features; track feature.title) {
            <div class="feature-card">
              <div class="feature-icon" [style.color]="feature.color">
                <mat-icon>{{ feature.icon }}</mat-icon>
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          }
        </div>
      </section>

      <!-- Integrations Teaser Section -->
      <section class="integrations-teaser">
        <div class="teaser-content">
          <div class="teaser-text">
            <mat-icon class="teaser-icon">extension</mat-icon>
            <div>
              <h2>Powered by Industry-Leading Libraries</h2>
              <p>
                AegisX UI integrates with ngx-toastr, FullCalendar,
                Highlight.js, and more. All with custom wrappers that follow our
                design system.
              </p>
            </div>
          </div>
          <a
            mat-flat-button
            color="primary"
            routerLink="/docs/integrations/overview"
            class="teaser-btn"
          >
            <mat-icon>arrow_forward</mat-icon>
            View All Integrations
          </a>
        </div>
        <div class="teaser-badges">
          @for (lib of externalLibraries; track lib.name) {
            <div class="teaser-badge" [style.--badge-color]="lib.color">
              <mat-icon>{{ lib.icon }}</mat-icon>
              <span>{{ lib.name }}</span>
            </div>
          }
        </div>
      </section>

      <!-- Code Example Section -->
      <section class="code-example">
        <div class="section-header">
          <h2>Simple to Use</h2>
          <p>Import, configure, and use in minutes</p>
        </div>

        <div class="code-demo">
          <div class="code-window">
            <div class="window-header">
              <div class="window-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="window-title">app.component.ts</span>
            </div>
            <pre class="code-content"><code>{{ codeExample }}</code></pre>
          </div>

          <div class="demo-result">
            <div class="result-label">Result</div>
            <div class="result-preview">
              <div class="demo-card">
                <div class="demo-badge success">Active</div>
                <h4>Dashboard Card</h4>
                <p>A beautifully styled card component</p>
                <button class="demo-button">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Links Section -->
      <section class="quick-links">
        <div class="section-header">
          <h2>Popular Components</h2>
          <p>Most commonly used components to get you started</p>
        </div>

        <div class="links-grid">
          @for (link of popularComponents; track link.title) {
            <a [routerLink]="link.link" class="link-card">
              <mat-icon [style.color]="link.color">{{ link.icon }}</mat-icon>
              <div class="link-content">
                <h4>{{ link.title }}</h4>
                <p>{{ link.description }}</p>
              </div>
              <mat-icon class="arrow">arrow_forward</mat-icon>
            </a>
          }
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta">
        <div class="cta-content">
          <h2>Ready to Build?</h2>
          <p>
            Start exploring our component library and build beautiful interfaces
            in no time.
          </p>
          <div class="cta-actions">
            <a
              mat-flat-button
              color="primary"
              routerLink="/docs/components/aegisx/data-display/card"
            >
              <mat-icon>widgets</mat-icon>
              Browse All Components
            </a>
            <a mat-stroked-button routerLink="/docs/foundations/overview">
              <mat-icon>palette</mat-icon>
              Design Foundations
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .components-intro {
        min-height: 100vh;
      }

      /* Hero Section */
      .hero {
        position: relative;
        padding: 4rem 2rem;
        min-height: 80vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .hero-bg {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }

      .gradient-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.4;
      }

      .orb-1 {
        width: 600px;
        height: 600px;
        background: linear-gradient(135deg, var(--ax-brand-default), #818cf8);
        top: -200px;
        right: -100px;
        animation: float 8s ease-in-out infinite;
      }

      .orb-2 {
        width: 400px;
        height: 400px;
        background: linear-gradient(135deg, #34d399, #06b6d4);
        bottom: -100px;
        left: -100px;
        animation: float 10s ease-in-out infinite reverse;
      }

      .grid-pattern {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(var(--ax-border-subtle) 1px, transparent 1px),
          linear-gradient(90deg, var(--ax-border-subtle) 1px, transparent 1px);
        background-size: 40px 40px;
        opacity: 0.5;
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0) scale(1);
        }
        50% {
          transform: translateY(-30px) scale(1.05);
        }
      }

      .hero-content {
        position: relative;
        z-index: 1;
        text-align: center;
        max-width: 800px;
      }

      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--ax-brand-faint);
        border: 1px solid var(--ax-brand-border);
        border-radius: 100px;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ax-brand-default);
        margin-bottom: 1.5rem;
      }

      .hero-badge mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .hero-title {
        font-size: clamp(2.5rem, 6vw, 4rem);
        font-weight: 700;
        line-height: 1.1;
        margin: 0 0 1.5rem;
        color: var(--ax-text-heading);
      }

      .gradient-text {
        background: linear-gradient(
          135deg,
          var(--ax-brand-default),
          #818cf8,
          #34d399
        );
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .hero-description {
        font-size: 1.125rem;
        line-height: 1.7;
        color: var(--ax-text-secondary);
        margin: 0 0 2rem;
        max-width: 600px;
        margin-inline: auto;
      }

      .hero-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .hero-actions a {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .primary-btn {
        padding: 0 1.5rem;
        height: 48px;
        font-size: 1rem;
      }

      .secondary-btn {
        height: 48px;
        padding: 0 1.5rem;
      }

      /* Preview Grid */
      .preview-grid {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
        margin-top: 4rem;
        max-width: 800px;
      }

      .preview-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.25rem;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: 12px;
        box-shadow: var(--ax-shadow-sm);
        animation: fadeInUp 0.5s ease-out backwards;
        animation-delay: calc(var(--delay) * 0.1s);
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .preview-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .preview-icon mat-icon {
        color: white;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .preview-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ax-text-default);
      }

      /* Stats Section */
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 2rem;
        padding: 3rem 2rem;
        background: var(--ax-background-subtle);
        border-top: 1px solid var(--ax-border-default);
        border-bottom: 1px solid var(--ax-border-default);
      }

      .stat-item {
        text-align: center;
      }

      .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--ax-brand-default);
        line-height: 1;
      }

      .stat-label {
        font-size: 0.875rem;
        color: var(--ax-text-secondary);
        margin-top: 0.5rem;
      }

      /* Section Header */
      .section-header {
        text-align: center;
        margin-bottom: 3rem;
      }

      .section-header h2 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--ax-text-heading);
        margin: 0 0 0.5rem;
      }

      .section-header p {
        font-size: 1.125rem;
        color: var(--ax-text-secondary);
        margin: 0;
      }

      /* Categories Section */
      .categories {
        padding: 4rem 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1.5rem;
      }

      .category-card {
        display: flex;
        align-items: flex-start;
        gap: 1.25rem;
        padding: 1.5rem;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: 16px;
        text-decoration: none;
        transition: all 0.2s ease;
        position: relative;
      }

      .category-card:hover {
        border-color: var(--ax-brand-default);
        box-shadow: var(--ax-shadow-md);
        transform: translateY(-2px);
      }

      .category-icon {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .category-icon mat-icon {
        color: white;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .category-content {
        flex: 1;
        min-width: 0;
      }

      .category-content h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 0 0 0.5rem;
      }

      .category-content p {
        font-size: 0.875rem;
        color: var(--ax-text-secondary);
        margin: 0 0 1rem;
        line-height: 1.5;
      }

      .category-components {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .component-tag {
        font-size: 0.75rem;
        padding: 0.25rem 0.625rem;
        background: var(--ax-background-subtle);
        border-radius: 6px;
        color: var(--ax-text-secondary);
      }

      .category-count {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.75rem;
        background: var(--ax-brand-faint);
        color: var(--ax-brand-default);
        border-radius: 100px;
      }

      /* Features Section */
      .features {
        padding: 4rem 2rem;
        background: var(--ax-background-subtle);
        border-top: 1px solid var(--ax-border-default);
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .feature-card {
        padding: 1.5rem;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: 12px;
      }

      .feature-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .feature-icon mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .feature-card h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 0 0 0.5rem;
      }

      .feature-card p {
        font-size: 0.875rem;
        color: var(--ax-text-secondary);
        margin: 0;
        line-height: 1.6;
      }

      /* Code Example Section */
      .code-example {
        padding: 4rem 2rem;
        max-width: 1000px;
        margin: 0 auto;
      }

      .code-demo {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        align-items: center;
      }

      @media (max-width: 768px) {
        .code-demo {
          grid-template-columns: 1fr;
        }
      }

      .code-window {
        background: #1e1e2e;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: var(--ax-shadow-lg);
      }

      .window-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
        background: #181825;
        border-bottom: 1px solid #313244;
      }

      .window-dots {
        display: flex;
        gap: 0.5rem;
      }

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .dot.red {
        background: #f38ba8;
      }
      .dot.yellow {
        background: #f9e2af;
      }
      .dot.green {
        background: #a6e3a1;
      }

      .window-title {
        font-size: 0.75rem;
        color: #6c7086;
      }

      .code-content {
        padding: 1.25rem;
        margin: 0;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
        line-height: 1.6;
        color: #cdd6f4;
        overflow-x: auto;
      }

      .demo-result {
        padding: 1.5rem;
        background: var(--ax-background-subtle);
        border: 1px solid var(--ax-border-default);
        border-radius: 12px;
      }

      .result-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--ax-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 1rem;
      }

      .result-preview {
        display: flex;
        justify-content: center;
      }

      .demo-card {
        padding: 1.25rem;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: 12px;
        text-align: center;
        width: 100%;
        max-width: 250px;
      }

      .demo-badge {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 500;
        padding: 0.25rem 0.75rem;
        border-radius: 100px;
        margin-bottom: 0.75rem;
      }

      .demo-badge.success {
        background: var(--ax-success-faint);
        color: var(--ax-success-default);
      }

      .demo-card h4 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 0 0 0.5rem;
      }

      .demo-card p {
        font-size: 0.875rem;
        color: var(--ax-text-secondary);
        margin: 0 0 1rem;
      }

      .demo-button {
        width: 100%;
        padding: 0.625rem 1rem;
        background: var(--ax-brand-default);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
      }

      /* Quick Links Section */
      .quick-links {
        padding: 4rem 2rem;
        background: var(--ax-background-subtle);
        border-top: 1px solid var(--ax-border-default);
      }

      .links-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .link-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.25rem;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: 12px;
        text-decoration: none;
        transition: all 0.2s ease;
      }

      .link-card:hover {
        border-color: var(--ax-brand-default);
        box-shadow: var(--ax-shadow-sm);
      }

      .link-card > mat-icon:first-child {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .link-content {
        flex: 1;
      }

      .link-content h4 {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 0 0 0.25rem;
      }

      .link-content p {
        font-size: 0.8125rem;
        color: var(--ax-text-secondary);
        margin: 0;
      }

      .link-card .arrow {
        color: var(--ax-text-subtle);
        font-size: 18px;
        width: 18px;
        height: 18px;
        transition: transform 0.2s ease;
      }

      .link-card:hover .arrow {
        transform: translateX(4px);
        color: var(--ax-brand-default);
      }

      /* CTA Section */
      .cta {
        padding: 4rem 2rem;
        text-align: center;
        border-top: 1px solid var(--ax-border-default);
      }

      .cta-content {
        max-width: 600px;
        margin: 0 auto;
      }

      .cta h2 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--ax-text-heading);
        margin: 0 0 1rem;
      }

      .cta p {
        font-size: 1.125rem;
        color: var(--ax-text-secondary);
        margin: 0 0 2rem;
      }

      .cta-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .cta-actions a {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* Integrations Teaser Section */
      .integrations-teaser {
        margin: 3rem 2rem;
        padding: 2rem;
        background: linear-gradient(
          135deg,
          var(--ax-brand-faint),
          var(--ax-background-subtle)
        );
        border: 1px solid var(--ax-border-default);
        border-radius: 20px;
        max-width: 1200px;
        margin-inline: auto;
      }

      .teaser-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
      }

      .teaser-text {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        flex: 1;
        min-width: 280px;
      }

      .teaser-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--ax-brand-default);
        flex-shrink: 0;
      }

      .teaser-text h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 0 0 0.5rem;
      }

      .teaser-text p {
        font-size: 0.9375rem;
        color: var(--ax-text-secondary);
        margin: 0;
        line-height: 1.5;
      }

      .teaser-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        flex-shrink: 0;
      }

      .teaser-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .teaser-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: 100px;
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--ax-text-default);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: var(--badge-color, var(--ax-brand-default));
        }
      }
    `,
  ],
})
export class ComponentsOverviewComponent {
  componentPreviews = [
    {
      name: 'Card',
      icon: 'credit_card',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      delay: 0,
    },
    {
      name: 'Badge',
      icon: 'label',
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      delay: 1,
    },
    {
      name: 'Alert',
      icon: 'notifications',
      gradient: 'linear-gradient(135deg, #10b981, #34d399)',
      delay: 2,
    },
    {
      name: 'DatePicker',
      icon: 'calendar_today',
      gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      delay: 3,
    },
    {
      name: 'Toast',
      icon: 'announcement',
      gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
      delay: 4,
    },
    {
      name: 'Drawer',
      icon: 'menu_open',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      delay: 5,
    },
  ];

  stats = [
    { value: '19+', label: 'Components' },
    { value: '5', label: 'Categories' },
    { value: '100%', label: 'TypeScript' },
    { value: 'WCAG', label: 'Accessible' },
  ];

  categories = [
    {
      title: 'Data Display',
      icon: 'table_chart',
      description:
        'Components for presenting data, metrics, and content beautifully.',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      link: '/docs/components/aegisx/data-display/overview',
      count: '9 components',
      components: ['Card', 'KPI Card', 'Badge', 'Avatar', 'List', 'Sparkline'],
    },
    {
      title: 'Forms',
      icon: 'edit_note',
      description: 'Input components for collecting user data with validation.',
      gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      link: '/docs/components/aegisx/forms/date-picker',
      count: '2 components',
      components: ['Date Picker', 'File Upload'],
    },
    {
      title: 'Feedback',
      icon: 'feedback',
      description: 'Components for user notifications and system feedback.',
      gradient: 'linear-gradient(135deg, #10b981, #34d399)',
      link: '/docs/components/aegisx/feedback/alert',
      count: '5 components',
      components: ['Alert', 'Toast', 'Dialogs', 'Loading Bar', 'Skeleton'],
    },
    {
      title: 'Navigation',
      icon: 'menu',
      description: 'Components for guiding users through your application.',
      gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
      link: '/docs/components/aegisx/navigation/breadcrumb',
      count: '2 components',
      components: ['Breadcrumb', 'Stepper'],
    },
    {
      title: 'Layout',
      icon: 'view_quilt',
      description: 'Structural components for organizing page content.',
      gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
      link: '/docs/components/aegisx/layout/drawer',
      count: '1 component',
      components: ['Drawer / Sheet'],
    },
  ];

  externalLibraries = [
    { name: 'ngx-toastr', icon: 'layers', color: '#f97316' },
    { name: 'Angular Material', icon: 'widgets', color: '#6366f1' },
    { name: 'FullCalendar', icon: 'calendar_month', color: '#3b82f6' },
    { name: 'Highlight.js', icon: 'code', color: '#10b981' },
    { name: 'Gridster', icon: 'grid_view', color: '#8b5cf6' },
    { name: 'Signature Pad', icon: 'draw', color: '#ec4899' },
  ];

  features = [
    {
      icon: 'code',
      title: 'Standalone Components',
      description:
        'Built with Angular 18+ standalone architecture for tree-shaking and faster builds.',
      color: 'var(--ax-brand-default)',
    },
    {
      icon: 'palette',
      title: 'Design Tokens',
      description:
        'Fully customizable through CSS custom properties and design tokens.',
      color: '#8b5cf6',
    },
    {
      icon: 'accessibility',
      title: 'Accessible',
      description:
        'WCAG 2.1 AA compliant with proper ARIA labels and keyboard navigation.',
      color: '#10b981',
    },
    {
      icon: 'bolt',
      title: 'Signal-Ready',
      description:
        'Built with Angular Signals for reactive and performant state management.',
      color: '#f59e0b',
    },
    {
      icon: 'dark_mode',
      title: 'Theme Support',
      description:
        'Automatic light and dark mode support with seamless transitions.',
      color: '#6366f1',
    },
    {
      icon: 'verified',
      title: 'Type-Safe',
      description:
        '100% TypeScript with full type definitions for better developer experience.',
      color: '#3b82f6',
    },
  ];

  codeExample = `import { AxCardComponent, AxBadgeComponent } from '@aegisx/ui';

@Component({
  standalone: true,
  imports: [AxCardComponent, AxBadgeComponent],
  template: \`
    <ax-card>
      <ax-badge variant="success">Active</ax-badge>
      <h3>Dashboard Card</h3>
      <p>A beautifully styled card component</p>
      <button mat-flat-button color="primary">
        View Details
      </button>
    </ax-card>
  \`
})
export class MyComponent {}`;

  popularComponents = [
    {
      title: 'Card',
      description: 'Flexible container for content',
      icon: 'credit_card',
      color: '#6366f1',
      link: '/docs/components/aegisx/data-display/card',
    },
    {
      title: 'Alert',
      description: 'Display important messages',
      icon: 'notifications',
      color: '#10b981',
      link: '/docs/components/aegisx/feedback/alert',
    },
    {
      title: 'Date Picker',
      description: 'Select dates and ranges',
      icon: 'calendar_today',
      color: '#3b82f6',
      link: '/docs/components/aegisx/forms/date-picker',
    },
    {
      title: 'Toast',
      description: 'Non-blocking notifications',
      icon: 'announcement',
      color: '#ec4899',
      link: '/docs/components/aegisx/feedback/toast',
    },
    {
      title: 'KPI Card',
      description: 'Display key metrics',
      icon: 'analytics',
      color: '#f59e0b',
      link: '/docs/components/aegisx/data-display/kpi-card',
    },
    {
      title: 'Drawer',
      description: 'Slide-out panels',
      icon: 'menu_open',
      color: '#8b5cf6',
      link: '/docs/components/aegisx/layout/drawer',
    },
  ];
}
