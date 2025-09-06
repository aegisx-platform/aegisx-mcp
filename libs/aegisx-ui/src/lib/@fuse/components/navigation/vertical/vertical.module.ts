import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseScrollbarDirective } from '../../../directives/scrollbar/scrollbar.directive';
import { FuseVerticalNavigationAsideItemComponent } from './components/aside/aside.component';
import { FuseVerticalNavigationBasicItemComponent } from './components/basic/basic.component';
import { FuseVerticalNavigationCollapsableItemComponent } from './components/collapsable/collapsable.component';
import { FuseVerticalNavigationDividerItemComponent } from './components/divider/divider.component';
import { FuseVerticalNavigationGroupItemComponent } from './components/group/group.component';
import { FuseVerticalNavigationSpacerItemComponent } from './components/spacer/spacer.component';
import { FuseVerticalNavigationComponent } from './vertical.component';

@NgModule({
    declarations: [
        FuseVerticalNavigationAsideItemComponent,
        FuseVerticalNavigationBasicItemComponent,
        FuseVerticalNavigationCollapsableItemComponent,
        FuseVerticalNavigationDividerItemComponent,
        FuseVerticalNavigationGroupItemComponent,
        FuseVerticalNavigationSpacerItemComponent,
        FuseVerticalNavigationComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatRippleModule,
        MatTooltipModule,
        FuseScrollbarDirective
    ],
    exports: [
        FuseVerticalNavigationComponent
    ]
})
export class FuseVerticalNavigationModule {}