import {
  Component,
  Input,
  signal,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, fromEvent, takeUntil, throttleTime, filter } from 'rxjs';

/**
 * Table of Contents item interface
 */
export interface TocItem {
  id: string;
  text: string;
  level: number; // 2 for h2, 3 for h3
}

/**
 * Documentation Table of Contents Component
 *
 * Auto-generates TOC from headings with scroll spy functionality.
 * Features:
 * - Auto-detect h2, h3 headings
 * - Scroll spy with active highlighting
 * - Smooth scroll to section
 * - Minimal, elegant styling
 */
@Component({
  selector: 'ax-docs-toc',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (items().length > 0) {
      <nav class="docs-toc" aria-label="Table of contents">
        <h4 class="docs-toc__title">On this page</h4>
        <ul class="docs-toc__list">
          @for (item of items(); track item.id) {
            <li
              class="docs-toc__item"
              [class.docs-toc__item--h3]="item.level === 3"
            >
              <a
                class="docs-toc__link"
                [class.docs-toc__link--active]="activeId() === item.id"
                [href]="'#' + item.id"
                (click)="scrollToSection($event, item.id)"
              >
                {{ item.text }}
              </a>
            </li>
          }
        </ul>
      </nav>
    }
  `,
  styles: [
    `
      .docs-toc {
        position: sticky;
        top: calc(var(--docs-header-height, 64px) + var(--ax-spacing-lg, 1rem));
        max-height: calc(
          100vh - var(--docs-header-height, 64px) - var(--ax-spacing-xl, 2rem)
        );
        overflow-y: auto;
        padding: var(--ax-spacing-md, 0.75rem);

        /* Custom scrollbar */
        &::-webkit-scrollbar {
          width: 3px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--ax-border-default);
          border-radius: 2px;
        }
      }

      .docs-toc__title {
        font-size: var(--ax-text-xs, 0.75rem);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--ax-text-primary);
        margin: 0 0 var(--ax-spacing-sm, 0.5rem) 0;
        padding: 0;
      }

      .docs-toc__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .docs-toc__item {
        margin: 0;
        padding: 0;
      }

      .docs-toc__item--h3 {
        padding-left: var(--ax-spacing-md, 0.75rem);
      }

      .docs-toc__link {
        display: block;
        padding: var(--ax-spacing-xs, 0.25rem) var(--ax-spacing-sm, 0.5rem);
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-secondary);
        text-decoration: none;
        border-left: 2px solid transparent;
        transition: all 150ms ease;
        line-height: 1.4;

        &:hover {
          color: var(--ax-text-primary);
        }
      }

      .docs-toc__link--active {
        color: var(--ax-primary-default);
        border-left-color: var(--ax-primary-default);
        background-color: color-mix(
          in srgb,
          var(--ax-primary-default) 8%,
          transparent
        );
      }
    `,
  ],
})
export class AxDocsTocComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * Content container selector to scan for headings
   * Default: '.docs-content' or can be passed a specific selector
   */
  @Input() contentSelector = '.docs-content';

  /**
   * Manual TOC items (if not auto-generating)
   */
  @Input() set manualItems(value: TocItem[]) {
    if (value && value.length > 0) {
      this.items.set(value);
      this._useManualItems = true;
    }
  }

  /**
   * Offset from top when scrolling to section (accounts for sticky header)
   */
  @Input() scrollOffset = 80;

  private _document = inject(DOCUMENT);
  private _ngZone = inject(NgZone);
  private _router = inject(Router);
  private _destroy$ = new Subject<void>();
  private _useManualItems = false;

  items = signal<TocItem[]>([]);
  activeId = signal<string>('');

  ngOnInit(): void {
    // Setup scroll spy
    this._ngZone.runOutsideAngular(() => {
      fromEvent(window, 'scroll')
        .pipe(throttleTime(100), takeUntil(this._destroy$))
        .subscribe(() => {
          this._ngZone.run(() => {
            this.updateActiveSection();
          });
        });
    });

    // Regenerate TOC when route changes
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        if (!this._useManualItems) {
          // Clear existing items
          this.items.set([]);
          // Regenerate after content loads
          setTimeout(() => {
            this.generateTocFromHeadings();
          }, 200);
        }
      });
  }

  ngAfterViewInit(): void {
    // Auto-generate TOC if not using manual items
    if (!this._useManualItems) {
      // Delay to ensure content is rendered
      setTimeout(() => {
        this.generateTocFromHeadings();
      }, 200);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Generate TOC items from h2 and h3 headings in content
   */
  private generateTocFromHeadings(): void {
    const contentEl = this._document.querySelector(this.contentSelector);
    if (!contentEl) {
      return;
    }

    const headings = contentEl.querySelectorAll('h2, h3');
    const tocItems: TocItem[] = [];

    headings.forEach((heading) => {
      const text = heading.textContent?.trim() || '';
      let id = heading.id;

      // Generate ID if not present
      if (!id) {
        id = this.generateId(text);
        heading.id = id;
      }

      tocItems.push({
        id,
        text,
        level: heading.tagName === 'H2' ? 2 : 3,
      });
    });

    this.items.set(tocItems);

    // Set initial active section
    if (tocItems.length > 0) {
      this.updateActiveSection();
    }
  }

  /**
   * Generate a URL-friendly ID from text
   */
  private generateId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Update the active section based on scroll position
   */
  private updateActiveSection(): void {
    const items = this.items();
    if (items.length === 0) return;

    const scrollPosition = window.scrollY + this.scrollOffset + 10;

    // Find the current active section
    let activeItem = items[0];

    for (const item of items) {
      const element = this._document.getElementById(item.id);
      if (element) {
        const offsetTop = element.offsetTop;
        if (scrollPosition >= offsetTop) {
          activeItem = item;
        }
      }
    }

    this.activeId.set(activeItem.id);
  }

  /**
   * Scroll to a section smoothly
   */
  scrollToSection(event: Event, id: string): void {
    event.preventDefault();

    const element = this._document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - this.scrollOffset;

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });

      // Update URL hash without scrolling
      history.pushState(null, '', `#${id}`);

      // Update active immediately
      this.activeId.set(id);
    }
  }
}
