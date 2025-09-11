import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {
  FuseNavigationService,
  FuseVerticalNavigationComponent,
} from '@fuse/components/navigation';
import { AvailableLangs, TranslocoService } from '@jsverse/transloco';
import { take } from 'rxjs';

@Component({
  selector: 'ax-languages',
  templateUrl: './languages.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'languages',
  imports: [MatButtonModule, MatMenuModule, NgTemplateOutlet],
})
export class LanguagesComponent implements OnInit {
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseNavigationService = inject(FuseNavigationService);
  private _translocoService = inject(TranslocoService);

  availableLangs: AvailableLangs;
  activeLang: string;
  flagCodes: Record<string, string>;

  // Empty constructor as we use inject() pattern

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Get the available languages from transloco
    this.availableLangs = this._translocoService.getAvailableLangs();

    // Subscribe to language changes
    this._translocoService.langChanges$.subscribe((activeLang) => {
      // Get the active lang
      this.activeLang = activeLang;

      // Update the navigation
      this._updateNavigation(activeLang);
    });

    // Set the country iso codes for languages for flags
    this.flagCodes = {
      en: 'us',
      tr: 'tr',
    };
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Set the active lang
   *
   * @param lang
   */
  setActiveLang(lang: string): void {
    // Set the active lang
    this._translocoService.setActiveLang(lang);
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: { id?: string }): string | number {
    return item.id || index;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Update the navigation
   *
   * @param lang
   * @private
   */
  private _updateNavigation(_lang: string): void {
    // For the demonstration purposes, we will only update the Dashboard names
    // from the navigation but you can do a full swap and change the entire
    // navigation data.
    //
    // You can import the data from a file or request it from your backend,
    // it's up to you.

    // Get the component -> navigation data -> item
    const navComponent =
      this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
        'mainNavigation',
      );

    // Return if the navigation component does not exist
    if (!navComponent) {
      return;
    }

    // Get the flat navigation data
    const navigation = navComponent.navigation;

    // Get the Project dashboard item and update its title
    const projectDashboardItem = this._fuseNavigationService.getItem(
      'dashboards.project',
      navigation,
    );
    if (projectDashboardItem) {
      this._translocoService
        .selectTranslate('Project')
        .pipe(take(1))
        .subscribe((translation) => {
          // Set the title
          projectDashboardItem.title = translation;

          // Refresh the navigation component
          navComponent.refresh();
        });
    }

    // Get the Analytics dashboard item and update its title
    const analyticsDashboardItem = this._fuseNavigationService.getItem(
      'dashboards.analytics',
      navigation,
    );
    if (analyticsDashboardItem) {
      this._translocoService
        .selectTranslate('Analytics')
        .pipe(take(1))
        .subscribe((translation) => {
          // Set the title
          analyticsDashboardItem.title = translation;

          // Refresh the navigation component
          navComponent.refresh();
        });
    }
  }
}
