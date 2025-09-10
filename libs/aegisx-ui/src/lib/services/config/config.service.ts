import {
  Injectable,
  InjectionToken,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AegisxConfig, DEFAULT_CONFIG } from '../../types/config.types';
import { merge, cloneDeep } from 'lodash-es';

// Injection token for initial config
export const AEGISX_CONFIG = new InjectionToken<AegisxConfig>('AEGISX_CONFIG');

@Injectable({ providedIn: 'root' })
export class AegisxConfigService {
  // Private writable signal for config
  private _config = signal<AegisxConfig>(DEFAULT_CONFIG);

  // Public readonly signals
  readonly config = this._config.asReadonly();

  // Computed signals for common config values
  readonly theme = computed(() => this.config().theme);
  readonly scheme = computed(() => this.config().scheme);
  readonly layout = computed(() => this.config().layout);
  readonly language = computed(() => this.config().language);
  readonly isDarkMode = computed(() => this.scheme() === 'dark');
  readonly isLightMode = computed(() => this.scheme() === 'light');
  readonly navigationSize = computed(() => this.config().navigation.size);
  readonly navigationPosition = computed(
    () => this.config().navigation.position,
  );

  constructor() {
    // Try to get initial config from injection token
    try {
      const initialConfig = inject(AEGISX_CONFIG, { optional: true });
      if (initialConfig) {
        this._config.set(merge({}, DEFAULT_CONFIG, initialConfig));
      }
    } catch (_e) {
      // Ignore injection errors in constructor
    }

    // Load config from localStorage
    this._loadFromStorage();

    // Auto-save config changes to localStorage
    // Note: In a real app, you might want to debounce this
    this._autoSaveToStorage();
  }

  /**
   * Set the entire config
   */
  setConfig(config: Partial<AegisxConfig>): void {
    const newConfig = merge({}, this._config(), config);
    this._config.set(newConfig);
  }

  /**
   * Update specific config properties
   */
  updateConfig(updates: Partial<AegisxConfig>): void {
    this._config.update((config) => merge({}, config, updates));
  }

  /**
   * Set theme
   */
  setTheme(theme: string): void {
    this.updateConfig({ theme });
  }

  /**
   * Set scheme (light/dark/auto)
   */
  setScheme(scheme: 'light' | 'dark' | 'auto'): void {
    this.updateConfig({ scheme });
  }

  /**
   * Toggle between light and dark scheme
   */
  toggleScheme(): void {
    const currentScheme = this.scheme();
    const newScheme = currentScheme === 'light' ? 'dark' : 'light';
    this.setScheme(newScheme);
  }

  /**
   * Set layout
   */
  setLayout(layout: string): void {
    this.updateConfig({ layout: layout as any });
  }

  /**
   * Set language
   */
  setLanguage(language: string): void {
    this.updateConfig({ language });
  }

  /**
   * Reset to default config
   */
  reset(): void {
    this._config.set(cloneDeep(DEFAULT_CONFIG));
    this._removeFromStorage();
  }

  /**
   * Load config from localStorage
   */
  private _loadFromStorage(): void {
    try {
      const storedConfig = localStorage.getItem('aegisx-config');
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        this._config.set(merge({}, DEFAULT_CONFIG, config));
      }
    } catch (e) {
      console.error('Error loading config from localStorage:', e);
    }
  }

  /**
   * Save config to localStorage
   */
  private _saveToStorage(config: AegisxConfig): void {
    try {
      localStorage.setItem('aegisx-config', JSON.stringify(config));
    } catch (e) {
      console.error('Error saving config to localStorage:', e);
    }
  }

  /**
   * Remove config from localStorage
   */
  private _removeFromStorage(): void {
    try {
      localStorage.removeItem('aegisx-config');
    } catch (e) {
      console.error('Error removing config from localStorage:', e);
    }
  }

  /**
   * Auto-save config changes to localStorage
   */
  private _autoSaveToStorage(): void {
    // Create an effect that saves config changes
    // Note: This is a simplified version. In production, you might want to debounce
    // Since we can't use effect() in services yet, we'll save on each update
    // This will be improved when Angular provides better patterns for this
  }
}
