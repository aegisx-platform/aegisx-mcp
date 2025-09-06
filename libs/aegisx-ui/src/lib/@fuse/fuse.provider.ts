import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
    EnvironmentProviders,
    Provider,
    importProvidersFrom,
    inject,
    provideAppInitializer,
    provideEnvironmentInitializer,
} from '@angular/core';
import { MATERIAL_SANITY_CHECKS } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import {
    FUSE_MOCK_API_DEFAULT_DELAY,
    mockApiInterceptor,
} from './lib/mock-api';
import { FuseConfig } from './services/config';
import { FUSE_CONFIG } from './services/config/config.constants';
import { FuseConfirmationService } from './services/confirmation';
import {
    FuseLoadingService,
    fuseLoadingInterceptor,
} from './services/loading';
import { FuseMediaWatcherService } from './services/media-watcher';
import { FusePlatformService } from './services/platform';
import { FuseSplashScreenService } from './services/splash-screen';
import { FuseUtilsService } from './services/utils';

export type FuseProviderConfig = {
    mockApi?: {
        delay?: number;
        service?: any;
    };
    fuse?: FuseConfig;
};

/**
 * Fuse provider
 */
export const provideFuse = (
    config: FuseProviderConfig
): Array<Provider | EnvironmentProviders> => {
    // Base providers
    const providers: Array<Provider | EnvironmentProviders> = [
        {
            // Disable 'theme' sanity check
            provide: MATERIAL_SANITY_CHECKS,
            useValue: {
                doctype: true,
                theme: false,
                version: true,
            },
        },
        {
            // Use the 'fill' appearance on Angular Material form fields by default
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'fill',
            },
        },
        {
            provide: FUSE_MOCK_API_DEFAULT_DELAY,
            useValue: config?.mockApi?.delay ?? 0,
        },
        {
            provide: FUSE_CONFIG,
            useValue: config?.fuse ?? {},
        },

        importProvidersFrom(MatDialogModule),
        provideEnvironmentInitializer(() => inject(FuseConfirmationService)),

        provideHttpClient(withInterceptors([fuseLoadingInterceptor])),
        provideEnvironmentInitializer(() => inject(FuseLoadingService)),

        provideEnvironmentInitializer(() => inject(FuseMediaWatcherService)),
        provideEnvironmentInitializer(() => inject(FusePlatformService)),
        provideEnvironmentInitializer(() => inject(FuseSplashScreenService)),
        provideEnvironmentInitializer(() => inject(FuseUtilsService)),
    ];

    // Mock Api services
    if (config?.mockApi?.service) {
        providers.push(
            provideHttpClient(withInterceptors([mockApiInterceptor])),
            provideAppInitializer(() => {
                const mockApiService = inject(config.mockApi!.service);
            })
        );
    }

    // Return the providers
    return providers;
};
