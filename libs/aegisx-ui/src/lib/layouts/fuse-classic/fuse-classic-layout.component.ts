import { Component, OnDestroy, OnInit, ViewEncapsulation, inject, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { SimpleVerticalNavigationComponent } from './simple-vertical-navigation.component';
import { FuseMediaWatcherService } from '../../services/fuse-media-watcher.service';
import { FuseLoadingBarComponent } from '../../components/fuse-loading-bar.component';
import { FuseNavigationItem } from '../../@fuse/components/navigation/navigation.types';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'ax-fuse-classic-layout',
    templateUrl: './fuse-classic-layout.component.html',
    styleUrls: ['./fuse-classic-layout.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        FuseLoadingBarComponent,
        SimpleVerticalNavigationComponent,
        MatButtonModule,
        MatIconModule,
        RouterOutlet,
    ],
})
export class FuseClassicLayoutComponent implements OnInit, OnDestroy {
    @Input() navigation: FuseNavigationItem[] = [];
    @Input() showFooter = true;
    @Input() appName = 'AegisX Platform';
    @Input() appVersion = 'v2.0';
    @Input() isDarkMode = false;
    @Output() navigationToggled = new EventEmitter<void>();
    
    @ContentChild('toolbarTitle') toolbarTitle!: TemplateRef<any>;
    @ContentChild('toolbarActions') toolbarActions!: TemplateRef<any>;
    @ContentChild('navigationHeader') navigationHeader!: TemplateRef<any>;
    @ContentChild('footerContent') footerContent!: TemplateRef<any>;

    isScreenSmall: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
    private _fuseMediaWatcherService = inject(FuseMediaWatcherService);

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Simple toggle for now
        this.navigationToggled.emit();
    }
}