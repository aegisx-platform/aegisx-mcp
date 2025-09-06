import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AxNavigationComponent } from '../../components/ax-navigation.component';
import {
  AxNavigationItem,
  AxNavigationConfig,
} from '../../types/ax-navigation.types';
import { FuseNavigationItem } from '../../types/fuse-navigation.types';
import { convertFuseToAxNavigation } from '../../utils';
import { FuseLoadingBarComponent } from '../../components/fuse-loading-bar.component';
import { FuseMediaWatcherService } from '../../services/fuse-media-watcher.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'ax-fuse-compact-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    AxNavigationComponent,
    FuseLoadingBarComponent,
  ],
  templateUrl: './fuse-compact-layout.component.html',
  styleUrls: ['./fuse-compact-layout.component.scss'],
})
export class FuseCompactLayoutComponent implements OnInit, OnDestroy {
  @Input() set navigation(value: FuseNavigationItem[]) {
    this._axNavigation.set(convertFuseToAxNavigation(value));
  }

  private _axNavigation = signal<AxNavigationItem[]>([]);
  get axNavigation() {
    return this._axNavigation();
  }
  @Input() showFooter = true;
  @Input() appName = 'AegisX Platform';
  @Input() appVersion = 'v2.0';
  @Input() isDarkMode = false;
  @Output() navigationToggled = new EventEmitter<void>();

  @ContentChild('toolbarTitle') toolbarTitle!: TemplateRef<unknown>;
  @ContentChild('toolbarActions') toolbarActions!: TemplateRef<unknown>;
  @ContentChild('navigationHeader') navigationHeader!: TemplateRef<unknown>;
  @ContentChild('footerContent') footerContent!: TemplateRef<unknown>;

  currentYear = new Date().getFullYear();
  isScreenSmall = false;
  isNavigationExpanded = signal(true);
  navigationConfig = signal<Partial<AxNavigationConfig>>({
    state: 'expanded',
    mode: 'side',
    position: 'left',
    showToggleButton: true,
    autoCollapse: true,
    breakpoint: 'lg',
  });

  private _unsubscribeAll = new Subject<void>();
  private _mediaWatcher = inject(FuseMediaWatcherService);

  ngOnInit(): void {
    this._mediaWatcher.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }: { matchingAliases: string[] }) => {
        const wasScreenSmall = this.isScreenSmall;
        this.isScreenSmall = !matchingAliases.includes('md');

        // If transitioning to small screen, collapse navigation
        if (!wasScreenSmall && this.isScreenSmall) {
          this.isNavigationExpanded.set(false);
          this.navigationConfig.update((config) => ({
            ...config,
            state: 'collapsed',
          }));
        }
        // If transitioning to large screen, expand navigation
        else if (wasScreenSmall && !this.isScreenSmall) {
          this.isNavigationExpanded.set(true);
          this.navigationConfig.update((config) => ({
            ...config,
            state: 'expanded',
          }));
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  toggleNavigation(_navigationId: string): void {
    this.navigationToggled.emit();
    const currentState = this.isNavigationExpanded();
    this.isNavigationExpanded.set(!currentState);

    // Update navigation config
    this.navigationConfig.update((config) => ({
      ...config,
      state: !currentState ? 'expanded' : 'collapsed',
    }));
  }

  onNavigationStateChange(state: 'collapsed' | 'expanded'): void {
    this.isNavigationExpanded.set(state === 'expanded');
  }

  onNavigationItemClick(item: AxNavigationItem): void {
    // Handle navigation item click if needed
    console.log('Navigation item clicked:', item);

    // Close navigation on mobile after clicking an item
    if (this.isScreenSmall && item.type === 'item' && item.link) {
      this.isNavigationExpanded.set(false);
      this.navigationConfig.update((config) => ({
        ...config,
        state: 'collapsed',
      }));
    }
  }
}
