import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FuseMediaWatcherService {
    onMediaChange$: Observable<{matchingAliases: string[]}>;

    constructor(private breakpointObserver: BreakpointObserver) {
        this.onMediaChange$ = this.breakpointObserver
            .observe(['(max-width: 599px)', '(min-width: 960px)'])
            .pipe(
                map(result => ({
                    matchingAliases: result.matches ? ['md'] : []
                }))
            );
    }
}