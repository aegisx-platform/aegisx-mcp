import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
  HostBinding,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NavbarVariant,
  NavbarPosition,
  NavbarHeight,
  NavbarTheme,
  NavbarColor,
  NavbarNavAlign,
} from './navbar.types';

/**
 * AX Navbar Component
 *
 * Enterprise-grade navigation bar with flexible zones, responsive behavior,
 * and extensive customization options. Inspired by PrimeBlocks patterns.
 *
 * @example
 * // Basic usage
 * <ax-navbar>
 *   <ng-container axNavbarStart>
 *     <ax-navbar-brand logo="assets/logo.svg" name="AegisX"></ax-navbar-brand>
 *   </ng-container>
 *
 *   <ng-container axNavbarCenter>
 *     <ax-navbar-nav>
 *       <ax-nav-item label="Home" routerLink="/"></ax-nav-item>
 *       <ax-nav-item label="Products" [menu]="productsMenu"></ax-nav-item>
 *     </ax-navbar-nav>
 *   </ng-container>
 *
 *   <ng-container axNavbarEnd>
 *     <ax-navbar-actions>
 *       <ax-navbar-icon-button icon="search" (click)="openSearch()"></ax-navbar-icon-button>
 *       <ax-navbar-icon-button icon="notifications" [badge]="3"></ax-navbar-icon-button>
 *     </ax-navbar-actions>
 *     <ax-navbar-user [user]="currentUser"></ax-navbar-user>
 *   </ng-container>
 * </ax-navbar>
 *
 * @example
 * // With hide on scroll
 * <ax-navbar position="sticky" [hideOnScroll]="true" [shadow]="'sm'">
 *   ...
 * </ax-navbar>
 */
@Component({
  selector: 'ax-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav
      class="ax-navbar"
      [class.ax-navbar--transparent]="variant === 'transparent'"
      [class.ax-navbar--solid]="variant === 'solid'"
      [class.ax-navbar--bordered]="variant === 'bordered'"
      [class.ax-navbar--fixed]="position === 'fixed'"
      [class.ax-navbar--sticky]="position === 'sticky'"
      [class.ax-navbar--sm]="height === 'sm'"
      [class.ax-navbar--lg]="height === 'lg'"
      [class.ax-navbar--dark]="theme === 'dark'"
      [class.ax-navbar--blur]="blur"
      [class.ax-navbar--shadow-sm]="shadow === 'sm'"
      [class.ax-navbar--shadow-md]="shadow === 'md'"
      [class.ax-navbar--hidden]="isHidden"
      [class.ax-navbar--mobile-open]="isMobileMenuOpen"
      [class.ax-navbar--color-primary]="color === 'primary'"
      [class.ax-navbar--color-charcoal]="color === 'charcoal'"
      [class.ax-navbar--color-slate]="color === 'slate'"
      [class.ax-navbar--color-slate-dark]="color === 'slate-dark'"
      [class.ax-navbar--color-ocean]="color === 'ocean'"
      [class.ax-navbar--color-ocean-dark]="color === 'ocean-dark'"
      [class.ax-navbar--color-royal]="color === 'royal'"
      [class.ax-navbar--color-royal-dark]="color === 'royal-dark'"
      [class.ax-navbar--color-forest]="color === 'forest'"
      [class.ax-navbar--color-amber]="color === 'amber'"
      role="navigation"
      [attr.aria-label]="ariaLabel"
    >
      <div class="ax-navbar__container">
        <!-- Start Zone -->
        <div class="ax-navbar__start">
          <ng-content select="[axNavbarStart]"></ng-content>
        </div>

        <!-- Center Zone (Desktop) -->
        <div
          class="ax-navbar__center"
          [class.ax-navbar__center--start]="navAlign === 'start'"
          [class.ax-navbar__center--end]="navAlign === 'end'"
        >
          <ng-content select="[axNavbarCenter]"></ng-content>
        </div>

        <!-- End Zone -->
        <div class="ax-navbar__end">
          <ng-content select="[axNavbarEnd]"></ng-content>

          <!-- Mobile Menu Toggle -->
          <button
            *ngIf="showMobileToggle"
            class="ax-navbar__mobile-toggle"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="isMobileMenuOpen"
            aria-label="Toggle navigation menu"
          >
            <span
              class="ax-navbar__hamburger"
              [class.ax-navbar__hamburger--open]="isMobileMenuOpen"
            >
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div
        class="ax-navbar__mobile-menu"
        [class.ax-navbar__mobile-menu--open]="isMobileMenuOpen"
        *ngIf="showMobileToggle"
      >
        <div class="ax-navbar__mobile-menu-content">
          <ng-content select="[axNavbarMobile]"></ng-content>
          <!-- Fallback to center content if no mobile content provided -->
          <ng-container *ngIf="!hasMobileContent">
            <ng-content select="[axNavbarCenter]"></ng-content>
          </ng-container>
        </div>
      </div>
    </nav>

    <!-- Overlay for mobile menu -->
    <div
      class="ax-navbar__overlay"
      [class.ax-navbar__overlay--visible]="isMobileMenuOpen"
      (click)="closeMobileMenu()"
      (keydown.escape)="closeMobileMenu()"
      tabindex="-1"
      role="button"
      aria-label="Close mobile menu"
      *ngIf="showMobileToggle"
    ></div>
  `,
  styleUrls: ['./navbar.component.scss'],
})
export class AxNavbarComponent implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);

  /** Visual variant of the navbar */
  @Input() variant: NavbarVariant = 'default';

  /** Position behavior */
  @Input() position: NavbarPosition = 'static';

  /** Height preset */
  @Input() height: NavbarHeight = 'md';

  /** Theme mode */
  @Input() theme: NavbarTheme = 'auto';

  /** Shadow intensity */
  @Input() shadow: 'none' | 'sm' | 'md' = 'none';

  /** Enable backdrop blur effect */
  @Input() blur = false;

  /** Breakpoint for mobile menu (in pixels) */
  @Input() mobileBreakpoint = 1024;

  /** Hide navbar on scroll down, show on scroll up */
  @Input() hideOnScroll = false;

  /** Threshold for hide on scroll (pixels) */
  @Input() hideScrollThreshold = 100;

  /** ARIA label for accessibility */
  @Input() ariaLabel = 'Main navigation';

  /** Color preset (like Clarity Design) */
  @Input() color: NavbarColor = 'default';

  /** Navigation alignment in center zone */
  @Input() navAlign: NavbarNavAlign = 'center';

  /** Emit when mobile menu state changes */
  @Output() mobileMenuChange = new EventEmitter<boolean>();

  /** Emit when navbar visibility changes (hide on scroll) */
  @Output() visibilityChange = new EventEmitter<boolean>();

  @ContentChild('mobileContent') mobileContent?: TemplateRef<unknown>;

  isMobileMenuOpen = false;
  isHidden = false;
  showMobileToggle = false;
  hasMobileContent = false;

  private lastScrollY = 0;
  private ticking = false;
  private resizeObserver?: ResizeObserver;

  @HostBinding('class.ax-navbar-host') hostClass = true;

  ngOnInit(): void {
    this.checkBreakpoint();
    this.setupResizeObserver();

    if (this.hideOnScroll) {
      this.lastScrollY = window.scrollY;
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.hideOnScroll || !this.ticking) {
      window.requestAnimationFrame(() => {
        this.handleScroll();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkBreakpoint();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.mobileMenuChange.emit(this.isMobileMenuOpen);

    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      this.mobileMenuChange.emit(false);
      document.body.style.overflow = '';
    }
  }

  private handleScroll(): void {
    const currentScrollY = window.scrollY;

    // Only hide after threshold
    if (currentScrollY < this.hideScrollThreshold) {
      if (this.isHidden) {
        this.isHidden = false;
        this.visibilityChange.emit(true);
      }
      this.lastScrollY = currentScrollY;
      return;
    }

    // Scrolling down - hide
    if (currentScrollY > this.lastScrollY && !this.isHidden) {
      this.isHidden = true;
      this.visibilityChange.emit(false);
    }
    // Scrolling up - show
    else if (currentScrollY < this.lastScrollY && this.isHidden) {
      this.isHidden = false;
      this.visibilityChange.emit(true);
    }

    this.lastScrollY = currentScrollY;
  }

  private checkBreakpoint(): void {
    this.showMobileToggle = window.innerWidth < this.mobileBreakpoint;

    // Close mobile menu if we resize above breakpoint
    if (!this.showMobileToggle && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkBreakpoint();
      });
      this.resizeObserver.observe(document.body);
    }
  }
}
