import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnDestroy,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    inject,
    HostBinding
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { FuseNavigationItem } from '../../@fuse/components/navigation/navigation.types';
import { FuseScrollbarDirective } from '../../directives/fuse-scrollbar.directive';
import { Subject, takeUntil } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { IconService } from '../../services/icon.service';
import { NavigationIconComponent } from '../../components/navigation-icon.component';

@Component({
    selector: 'ax-simple-vertical-navigation',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatIconModule,
        MatRippleModule,
        FuseScrollbarDirective,
        NavigationIconComponent
    ],
    template: `
        <div class="fuse-vertical-navigation-wrapper" [class.fuse-vertical-navigation-opened]="opened">
            <div class="fuse-vertical-navigation-header" *ngIf="showHeader">
                <ng-content select="[slot=navigationHeader]"></ng-content>
            </div>
            
            <div 
                class="fuse-vertical-navigation-content"
                fuseScrollbar
                [fuseScrollbarOptions]="{wheelPropagation: false}">
                
                <nav class="fuse-vertical-navigation-nav">
                    @for (item of navigation; track item.id) {
                        <ng-container [ngSwitch]="item.type">
                            <!-- Group -->
                            @switch (item.type) {
                                @case ('group') {
                                    <div class="fuse-vertical-navigation-group">
                                        <div class="fuse-vertical-navigation-group-title">{{ item.title }}</div>
                                        @if (item.children) {
                                            @for (child of item.children; track child.id) {
                                                <ng-container 
                                                    [ngTemplateOutlet]="navigationItem"
                                                    [ngTemplateOutletContext]="{item: child}">
                                                </ng-container>
                                            }
                                        }
                                    </div>
                                }
                                
                                @case ('divider') {
                                    <div class="fuse-vertical-navigation-divider"></div>
                                }
                                
                                @default {
                                    <ng-container 
                                        [ngTemplateOutlet]="navigationItem"
                                        [ngTemplateOutletContext]="{item: item}">
                                    </ng-container>
                                }
                            }
                        </ng-container>
                    }
                </nav>
            </div>
        </div>
        
        <!-- Navigation Item Template -->
        <ng-template #navigationItem let-item="item">
            <div class="fuse-vertical-navigation-item" [ngClass]="{'fuse-vertical-navigation-item-has-children': item.children}">
                @if (item.type === 'basic') {
                    <a
                        class="fuse-vertical-navigation-item-wrapper"
                        [routerLink]="item.link"
                        routerLinkActive="fuse-vertical-navigation-item-active"
                        matRipple>
                        @if (item.icon) {
                            <ax-navigation-icon 
                                [icon]="item.icon" 
                                [size]="24"
                                class="fuse-vertical-navigation-item-icon">
                            </ax-navigation-icon>
                        }
                        <span class="fuse-vertical-navigation-item-title">{{ item.title }}</span>
                        @if (item.badge) {
                            <span class="fuse-vertical-navigation-item-badge">
                                <span [ngClass]="item.badge.classes">{{ item.badge.title }}</span>
                            </span>
                        }
                    </a>
                }
                
                @if (item.type === 'collapsable') {
                    <div
                        class="fuse-vertical-navigation-item-wrapper"
                        (click)="toggleCollapsable(item)"
                        matRipple>
                        @if (item.icon) {
                            <ax-navigation-icon 
                                [icon]="item.icon" 
                                [size]="24"
                                class="fuse-vertical-navigation-item-icon">
                            </ax-navigation-icon>
                        }
                        <span class="fuse-vertical-navigation-item-title">{{ item.title }}</span>
                        @if (item.badge) {
                            <span class="fuse-vertical-navigation-item-badge">
                                <span [ngClass]="item.badge.classes">{{ item.badge.title }}</span>
                            </span>
                        }
                        <ax-navigation-icon 
                            [icon]="'heroicons_outline:chevron-right'"
                            [size]="20"
                            class="fuse-vertical-navigation-item-arrow"
                            [class.rotate-90]="item.id && expandedItems.has(item.id)">
                        </ax-navigation-icon>
                    </div>
                    
                    @if (item.id && expandedItems.has(item.id) && item.children) {
                        <div class="fuse-vertical-navigation-item-children">
                            @for (child of item.children; track child.id) {
                                <ng-container 
                                    [ngTemplateOutlet]="navigationItem"
                                    [ngTemplateOutletContext]="{item: child}">
                                </ng-container>
                            }
                        </div>
                    }
                }
            </div>
        </ng-template>
        
        <!-- Overlay -->
        @if (mode === 'over' && opened) {
            <div 
                class="fuse-vertical-navigation-overlay"
                (click)="close.emit()">
            </div>
        }
    `,
    styles: [`
        /* Variables */
        :host {
            --fuse-vertical-navigation-width: 280px;
            --fuse-vertical-navigation-width-compact: 64px;
        }
        
        :host {
            display: block;
            position: relative;
            flex: 0 0 auto;
            width: var(--fuse-vertical-navigation-width);
            height: 100%;
            transition: width 300ms ease-in-out;
        }

        :host.w-64 {
            width: 16rem; /* 256px */
            --fuse-vertical-navigation-width: 16rem;
        }

        :host.w-16 {
            width: 4rem; /* 64px */
            --fuse-vertical-navigation-width: 4rem;
        }
        
        .fuse-vertical-navigation-wrapper {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            z-index: 200;
            box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.1);
            background: inherit;
            transform: translateX(-100%);
            transition: transform 300ms cubic-bezier(0.25, 0.8, 0.25, 1);
            overflow: hidden;
            
            &.fuse-vertical-navigation-opened {
                transform: translateX(0);
            }
        }
        
        :host[mode='side'] .fuse-vertical-navigation-wrapper {
            transform: translateX(0);
        }
        
        .fuse-vertical-navigation-header {
            flex: 0 0 auto;
            padding: 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }
        
        .fuse-vertical-navigation-content {
            flex: 1 1 auto;
            overflow-x: hidden;
            overflow-y: auto;
            overscroll-behavior: contain;
            scrollbar-width: thin;
            
            &::-webkit-scrollbar {
                width: 4px;
                height: 4px;
            }

            &::-webkit-scrollbar-track {
                background: transparent;
            }

            &::-webkit-scrollbar-thumb {
                background-color: rgba(255, 255, 255, 0.12);
                border-radius: 2px;
            }
        }
        
        .fuse-vertical-navigation-nav {
            padding: 12px 0;
        }
        
        .fuse-vertical-navigation-group {
            margin-top: 24px;
            
            &:first-child {
                margin-top: 0;
            }
        }
        
        .fuse-vertical-navigation-group-title {
            padding: 10px 16px;
            margin: 0 12px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: .05em;
            text-transform: uppercase;
            color: rgba(59, 130, 246, 0.7);
        }
        
        .fuse-vertical-navigation-item {
            margin-bottom: 4px;
        }
        
        .fuse-vertical-navigation-item-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            padding: 10px 16px;
            margin: 0 12px;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            cursor: pointer;
            border-radius: 6px;
            transition: all 200ms cubic-bezier(0.25, 0.8, 0.25, 1);
            
            &:hover {
                background-color: rgba(255, 255, 255, 0.12);
                
                .fuse-vertical-navigation-item-icon {
                    opacity: 1;
                }
                
                .fuse-vertical-navigation-item-title {
                    opacity: 1;
                }
            }
            
            &.fuse-vertical-navigation-item-active {
                background-color: rgba(255, 255, 255, 0.12);
                
                .fuse-vertical-navigation-item-icon {
                    opacity: 1;
                }
                
                .fuse-vertical-navigation-item-title {
                    opacity: 1;
                }
            }
        }
        
        .fuse-vertical-navigation-item-icon {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            margin-right: 16px;
            opacity: 0.6;
            transition: opacity 200ms;
            flex-shrink: 0;
        }
        
        .fuse-vertical-navigation-item-title {
            flex: 1 1 auto;
            font-size: 13px;
            font-weight: 500;
            line-height: 20px;
            opacity: 0.8;
            transition: opacity 200ms;
        }
        
        .fuse-vertical-navigation-item-badge {
            margin-left: auto;
            
            span {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 600;
                height: 20px;
                min-width: 20px;
                padding: 0 7px;
                border-radius: 10px;
                white-space: nowrap;
            }
        }
        
        .fuse-vertical-navigation-item-arrow {
            margin-left: 8px;
            opacity: 0.5;
            transition: transform 300ms cubic-bezier(0.25, 0.8, 0.25, 1), opacity 200ms;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            
            &.rotate-90 {
                transform: rotate(90deg);
            }
        }
        
        .fuse-vertical-navigation-item-children {
            overflow: hidden;
            
            > *:first-child {
                margin-top: 6px;
            }
            
            > *:last-child {
                padding-bottom: 6px;
            }
            
            .fuse-vertical-navigation-item-wrapper {
                padding-left: 56px;
                
                /* 2nd level */
                .fuse-vertical-navigation-item-children {
                    .fuse-vertical-navigation-item-wrapper {
                        padding-left: 72px;
                    }
                    
                    /* 3rd level */
                    .fuse-vertical-navigation-item-children {
                        .fuse-vertical-navigation-item-wrapper {
                            padding-left: 88px;
                        }
                    }
                }
            }
        }
        
        .fuse-vertical-navigation-divider {
            margin: 24px 0;
            height: 1px;
            background: rgba(255, 255, 255, 0.12);
        }
        
        .fuse-vertical-navigation-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.6);
            z-index: 199;
        }

        /* Collapsed mode styles */
        :host.w-16 {
            .fuse-vertical-navigation-wrapper {
                width: 4rem; /* 64px */
            }
            
            .fuse-vertical-navigation-header {
                display: none !important;
                visibility: hidden;
                opacity: 0;
                height: 0;
                padding: 0;
                margin: 0;
                border: none;
            }

            .fuse-vertical-navigation-content {
                padding-top: 1rem;
            }

            .fuse-vertical-navigation-group-title {
                display: none !important;
            }
            
            .fuse-vertical-navigation-item {
                .fuse-vertical-navigation-item-wrapper {
                    padding: 0.75rem;
                    margin: 0.25rem 0.5rem;
                    justify-content: center;
                    min-height: 48px;
                    
                    ax-navigation-icon {
                        margin: 0;
                        opacity: 1;
                    }
                    
                    .fuse-vertical-navigation-item-icon {
                        margin: 0;
                        opacity: 1;
                    }
                    
                    .fuse-vertical-navigation-item-title,
                    .fuse-vertical-navigation-item-badge,
                    .fuse-vertical-navigation-item-arrow {
                        display: none !important;
                        opacity: 0;
                        width: 0;
                    }
                }
            }

            .fuse-vertical-navigation-item-children {
                display: none !important;
            }
            
            .fuse-vertical-navigation-group {
                margin-top: 0.75rem;
                
                &:first-child {
                    margin-top: 0;
                }
                
                &:not(:last-child):after {
                    content: '';
                    display: block;
                    margin: 0.5rem 0.75rem;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.12);
                }
            }
        }
        
        /* Expanded mode - ensure everything is visible */
        :host.w-64 {
            .fuse-vertical-navigation-header {
                display: flex !important;
                visibility: visible;
                opacity: 1;
                height: auto;
            }
            
            .fuse-vertical-navigation-item {
                .fuse-vertical-navigation-item-wrapper {
                    padding: 10px 16px;
                    margin: 0 12px;
                    justify-content: flex-start;
                    
                    .fuse-vertical-navigation-item-icon,
                    ax-navigation-icon {
                        margin-right: 16px;
                    }
                    
                    .fuse-vertical-navigation-item-title {
                        display: block !important;
                        opacity: 0.8;
                        width: auto;
                    }
                    
                    .fuse-vertical-navigation-item-badge,
                    .fuse-vertical-navigation-item-arrow {
                        display: inline-flex !important;
                        opacity: 1;
                        width: auto;
                    }
                }
            }
            
            .fuse-vertical-navigation-group-title {
                display: block !important;
            }
        }
    `],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleVerticalNavigationComponent implements OnInit, OnDestroy {
    @Input() navigation: FuseNavigationItem[] = [];
    @Input() mode: 'over' | 'side' = 'side';
    @Input() opened = true;
    @Input() showHeader = true;
    
    @HostBinding('attr.mode')
    get attrMode(): string {
        return this.mode;
    }
    
    @Output() close = new EventEmitter<void>();
    
    expandedItems = new Set<string>();
    isScreenSmall = false;
    
    private _unsubscribeAll = new Subject<void>();
    private _breakpointObserver = inject(BreakpointObserver);
    private _iconService = inject(IconService);
    
    ngOnInit(): void {
        // Watch for media changes
        this._breakpointObserver
            .observe(['(max-width: 960px)'])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(result => {
                this.isScreenSmall = result.matches;
                
                // Update mode based on screen size
                if (this.isScreenSmall) {
                    this.mode = 'over';
                    this.opened = false;
                } else {
                    this.mode = 'side';
                    this.opened = true;
                }
            });
    }
    
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    
    toggleCollapsable(item: FuseNavigationItem): void {
        if (item.id) {
            if (this.expandedItems.has(item.id)) {
                this.expandedItems.delete(item.id);
            } else {
                this.expandedItems.add(item.id);
            }
        }
    }
    
    getIconName(icon: string): string {
        return this._iconService.getMaterialIcon(icon);
    }
}