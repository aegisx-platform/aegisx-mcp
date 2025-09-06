import { Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
    selector: 'fuse-loading-bar',
    standalone: true,
    imports: [MatProgressBarModule],
    template: `
        <mat-progress-bar
            [mode]="'indeterminate'"
            [value]="0"
            class="fixed top-0 left-0 right-0 z-50">
        </mat-progress-bar>
    `
})
export class FuseLoadingBarComponent {}