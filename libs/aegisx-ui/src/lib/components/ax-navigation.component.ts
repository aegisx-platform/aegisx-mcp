import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  AxNavigationItem,
  AxNavigationConfig,
} from '../types/ax-navigation.types';
import { NavigationIconComponent } from './ax-navigation-icon.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'ax-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, NavigationIconComponent],
  template: `
    <nav
      class="ax-navigation"
      [class.ax-navigation--collapsed]="state === 'collapsed'"
      [class.ax-navigation--expanded]="state === 'expanded'"
      [class.ax-navigation--side]="config.mode === 'side'"
      [class.ax-navigation--over]="config.mode === 'over'"
      [class.ax-navigation--push]="config.mode === 'push'"
      [attr.data-position]="config.position"
    >
      <!-- Navigation Header -->
      @if (showHeader) {
        <div class="ax-navigation__header">
          <ng-content select="[navigation-header]"></ng-content>
        </div>
      }

      <!-- Navigation Content -->
      <div class="ax-navigation__content">
        @for (item of items; track item.id) {
          @switch (item.type) {
            @case ('divider') {
              <div class="ax-navigation__divider"></div>
            }
            @case ('group') {
              <div class="ax-navigation__group">
                <div class="ax-navigation__group-title">
                  {{ item.title }}
                </div>
                @if (item.children) {
                  @for (child of item.children; track child.id) {
                    <ng-container
                      [ngTemplateOutlet]="navigationItem"
                      [ngTemplateOutletContext]="{ item: child, level: 0 }"
                    ></ng-container>
                  }
                }
              </div>
            }
            @default {
              <ng-container
                [ngTemplateOutlet]="navigationItem"
                [ngTemplateOutletContext]="{ item: item, level: 0 }"
              ></ng-container>
            }
          }
        }
      </div>

      <!-- Navigation Footer -->
      @if (showFooter) {
        <div class="ax-navigation__footer">
          <ng-content select="[navigation-footer]"></ng-content>
        </div>
      }
    </nav>

    <!-- Navigation Item Template -->
    <ng-template #navigationItem let-item="item" let-level="level">
      @if (!isHidden(item)) {
        <div
          class="ax-navigation__item"
          [class.ax-navigation__item--disabled]="isDisabled(item)"
          [class.ax-navigation__item--collapsible]="item.type === 'collapsible'"
          [style.padding-left.px]="
            state === 'expanded' ? 16 + level * 16 : null
          "
        >
          @if (item.type === 'collapsible') {
            <!-- Collapsible Item -->
            <button
              class="ax-navigation__item-wrapper"
              type="button"
              [attr.aria-expanded]="isExpanded(item)"
              [attr.title]="state === 'collapsed' ? item.title : null"
              (click)="toggleCollapsible(item)"
            >
              @if (item.icon) {
                <ax-navigation-icon
                  [icon]="item.icon"
                  [size]="20"
                  class="ax-navigation__item-icon"
                ></ax-navigation-icon>
              }
              @if (state === 'expanded') {
                <span class="ax-navigation__item-title" [@fadeIn]>{{
                  item.title
                }}</span>
                @if (item.badge) {
                  <span
                    class="ax-navigation__item-badge"
                    [attr.data-type]="item.badge.type || 'primary'"
                    [@fadeIn]
                  >
                    {{ item.badge.content }}
                  </span>
                }
                <ax-navigation-icon
                  icon="chevron-right"
                  [size]="16"
                  class="ax-navigation__item-arrow"
                  [class.ax-navigation__item-arrow--rotated]="isExpanded(item)"
                  [@fadeIn]
                ></ax-navigation-icon>
              }
            </button>

            <!-- Collapsible Children -->
            @if (isExpanded(item) && item.children && state === 'expanded') {
              <div class="ax-navigation__item-children" [@expandCollapse]>
                @for (child of item.children; track child.id) {
                  <ng-container
                    [ngTemplateOutlet]="navigationItem"
                    [ngTemplateOutletContext]="{
                      item: child,
                      level: level + 1,
                    }"
                  ></ng-container>
                }
              </div>
            }
          } @else {
            <!-- Regular Item -->
            <a
              class="ax-navigation__item-wrapper"
              [routerLink]="item.link"
              routerLinkActive="router-active"
              [routerLinkActiveOptions]="{ exact: item.exactMatch || false }"
              [target]="item.target"
              [attr.title]="state === 'collapsed' ? item.title : null"
              (click)="onItemClick(item)"
            >
              @if (item.icon) {
                <ax-navigation-icon
                  [icon]="item.icon"
                  [size]="20"
                  class="ax-navigation__item-icon"
                ></ax-navigation-icon>
              }
              @if (state === 'expanded') {
                <span class="ax-navigation__item-title" [@fadeIn]>{{
                  item.title
                }}</span>
                @if (item.badge) {
                  <span
                    class="ax-navigation__item-badge"
                    [attr.data-type]="item.badge.type || 'primary'"
                    [@fadeIn]
                  >
                    {{ item.badge.content }}
                  </span>
                }
                @if (item.externalLink) {
                  <ax-navigation-icon
                    icon="external-link"
                    [size]="14"
                    class="ax-navigation__item-external"
                    [@fadeIn]
                  ></ax-navigation-icon>
                }
              }
            </a>
          }
        </div>
      }
    </ng-template>

    <!-- Overlay for mobile -->
    @if (config.mode === 'over' && isOpen) {
      <div class="ax-navigation__overlay" (click)="close()" [@fade]></div>
    }
  `,
  styleUrl: './ax-navigation.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(-10px)' }),
        ),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class AxNavigationComponent implements OnInit {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Inputs
  @Input() showHeader = true;
  @Input() showFooter = false;

  @Input() set items(value: AxNavigationItem[]) {
    this._items.set(value);
  }
  get items() {
    return this._items();
  }

  @Input() set config(value: Partial<AxNavigationConfig>) {
    this._config.set({ ...this._config(), ...value });
  }
  get config() {
    return this._config();
  }

  // Outputs
  @Output() stateChange = new EventEmitter<'collapsed' | 'expanded'>();
  @Output() itemClick = new EventEmitter<AxNavigationItem>();
  @Output() groupToggle = new EventEmitter<{
    group: AxNavigationItem;
    isOpen: boolean;
  }>();

  // Signals
  private _items = signal<AxNavigationItem[]>([]);
  private _config = signal<AxNavigationConfig>({
    state: 'expanded',
    mode: 'side',
    position: 'left',
    showToggleButton: true,
    autoCollapse: true,
    breakpoint: 'lg',
  });
  private _expandedItems = signal<Set<string>>(new Set());
  private _isOpen = signal(true);

  // Getters for template
  get state() {
    return this.config.state;
  }

  get isOpen() {
    return this._isOpen();
  }

  // Host Bindings
  @HostBinding('class')
  get hostClasses(): string {
    const classes = ['ax-navigation-host'];
    classes.push(`ax-navigation-host--${this.state}`);
    classes.push(`ax-navigation-host--${this.config.position}`);
    return classes.join(' ');
  }

  ngOnInit(): void {
    // Auto-expand collapsible items with active children on route change
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.expandActiveItems();
      });

    // Initial check
    this.expandActiveItems();
  }

  // Methods
  private expandActiveItems(): void {
    const expandItemsWithActiveChild = (items: AxNavigationItem[]) => {
      items.forEach((item) => {
        if (item.type === 'collapsible' && item.children) {
          // Check if any child is active based on current route
          const hasActiveChild = this.hasActiveChild(item);
          if (hasActiveChild && item.id) {
            this._expandedItems.update((expandedItems) => {
              const newSet = new Set(expandedItems);
              newSet.add(item.id);
              return newSet;
            });
          }
          // Recursively check nested items
          expandItemsWithActiveChild(item.children);
        } else if (item.type === 'group' && item.children) {
          expandItemsWithActiveChild(item.children);
        }
      });
    };

    expandItemsWithActiveChild(this.items);
  }

  private hasActiveChild(item: AxNavigationItem): boolean {
    if (!item.children) return false;

    return item.children.some((child) => {
      if (child.link) {
        // Check if the current URL matches the child's link
        const childUrl = Array.isArray(child.link)
          ? child.link.join('/')
          : child.link;
        return this.router.isActive(childUrl, {
          paths: child.exactMatch ? 'exact' : 'subset',
          queryParams: 'subset',
          fragment: 'ignored',
          matrixParams: 'ignored',
        });
      }
      // Recursively check if nested children are active
      if (child.type === 'collapsible' && child.children) {
        return this.hasActiveChild(child);
      }
      return false;
    });
  }
  toggle(): void {
    const newState = this.state === 'collapsed' ? 'expanded' : 'collapsed';
    this._config.update((cfg) => ({ ...cfg, state: newState }));
    this.stateChange.emit(newState);
  }

  collapse(): void {
    this._config.update((cfg) => ({ ...cfg, state: 'collapsed' }));
    this.stateChange.emit('collapsed');
  }

  expand(): void {
    this._config.update((cfg) => ({ ...cfg, state: 'expanded' }));
    this.stateChange.emit('expanded');
  }

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }

  toggleCollapsible(item: AxNavigationItem): void {
    if (!item.id) return;

    this._expandedItems.update((items) => {
      const newSet = new Set(items);
      if (newSet.has(item.id)) {
        newSet.delete(item.id);
        this.groupToggle.emit({ group: item, isOpen: false });
      } else {
        newSet.add(item.id);
        this.groupToggle.emit({ group: item, isOpen: true });
      }
      return newSet;
    });
  }

  isExpanded(item: AxNavigationItem): boolean {
    return item.id ? this._expandedItems().has(item.id) : false;
  }

  isActive(item: AxNavigationItem): boolean {
    if (typeof item.active === 'function') {
      return item.active();
    }
    return item.active || false;
  }

  isHidden(item: AxNavigationItem): boolean {
    if (typeof item.hidden === 'function') {
      return item.hidden();
    }
    return item.hidden || false;
  }

  isDisabled(item: AxNavigationItem): boolean {
    if (typeof item.disabled === 'function') {
      return item.disabled();
    }
    return item.disabled || false;
  }

  onItemClick(item: AxNavigationItem): void {
    if (!this.isDisabled(item)) {
      this.itemClick.emit(item);

      // Auto collapse on mobile
      if (this.config.mode === 'over' && this.config.autoCollapse) {
        this.close();
      }
    }
  }
}
