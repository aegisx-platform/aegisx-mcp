// All Services
export * from './config/config.service';
export * from './navigation/navigation.service';
export * from './media-watcher/media-watcher.service';
export * from './icon.service';
export * from './ax-media-watcher.service';
export * from './ax-dialog.service';

// Export aliases for backward compatibility
export { AegisxConfigService as AxConfigService } from './config/config.service';
export { AegisxNavigationService as AxNavigationService } from './navigation/navigation.service';

// AegisX Theme Service
export * from './theme/ax-theme.service';
export * from './theme/ax-theme.types';
// Note: M3ThemeService and StylePresetService backed up for future use (.backup.ts)

// AegisX Toast Service
export * from './toast';
