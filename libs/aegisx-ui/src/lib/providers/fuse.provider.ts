import { Provider } from '@angular/core';

export interface FuseProviderConfig {
    fuse?: any;
}

export function provideFuse(config: FuseProviderConfig): Provider[] {
    return [];
}