import { Injectable, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);

  // Map heroicons names to Material Icons
  private iconMap: Record<string, string> = {
    'heroicons_outline:home': 'home',
    'heroicons_outline:chart-pie': 'pie_chart',
    'heroicons_outline:briefcase': 'work',
    'heroicons_outline:cube': 'widgets',
    'heroicons_outline:users': 'people',
    'heroicons_outline:shopping-bag': 'shopping_bag',
    'heroicons_outline:shopping-cart': 'shopping_cart',
    'heroicons_outline:cog-6-tooth': 'settings',
    'heroicons_outline:beaker': 'science',
    'heroicons_outline:book-open': 'menu_book',
    'heroicons_outline:check-circle': 'check_circle',
    'heroicons_outline:tag': 'label',
    'heroicons_outline:chevron-right': 'chevron_right',
    'heroicons_solid:chevron-right': 'chevron_right',
    'heroicons_outline:document-text': 'description',
    'heroicons_outline:document': 'description',
    'heroicons_outline:server': 'dns',
    'heroicons_outline:shield-check': 'security',
    'heroicons_outline:bell': 'notifications',
    'heroicons_outline:logout': 'logout',
    'heroicons_outline:user': 'person',
    'heroicons_outline:user-circle': 'account_circle',
    'heroicons_outline:search': 'search',
    'heroicons_outline:menu': 'menu',
    'heroicons_outline:x': 'close',
    'heroicons_outline:sun': 'light_mode',
    'heroicons_outline:moon': 'dark_mode',
    'heroicons_outline:squares-2x2': 'apps',
    'heroicons_outline:wifi': 'wifi',
  };

  // Fallback Unicode symbols if Material Icons don't load
  private unicodeFallback: Record<string, string> = {
    home: '🏠',
    pie_chart: '📊',
    work: '💼',
    widgets: '🔲',
    people: '👥',
    shopping_bag: '🛍️',
    shopping_cart: '🛒',
    settings: '⚙️',
    science: '🧪',
    menu_book: '📖',
    check_circle: '✅',
    label: '🏷️',
    chevron_right: '›',
    description: '📄',
    dns: '🖥️',
    security: '🛡️',
    notifications: '🔔',
    logout: '🚪',
    person: '👤',
    account_circle: '👤',
    search: '🔍',
    menu: '☰',
    close: '✕',
    light_mode: '☀️',
    dark_mode: '🌙',
    apps: '⊞',
    wifi: '📶',
  };

  constructor() {
    this.registerMaterialIcons();
  }

  private registerMaterialIcons(): void {
    // Register Material Icons font
    const materialIconsLink = document.createElement('link');
    materialIconsLink.href =
      'https://fonts.googleapis.com/icon?family=Material+Icons';
    materialIconsLink.rel = 'stylesheet';
    if (!document.querySelector('link[href*="Material+Icons"]')) {
      document.head.appendChild(materialIconsLink);
    }

    // Register Material Icons Outlined font
    const materialIconsOutlinedLink = document.createElement('link');
    materialIconsOutlinedLink.href =
      'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined';
    materialIconsOutlinedLink.rel = 'stylesheet';
    if (!document.querySelector('link[href*="Material+Icons+Outlined"]')) {
      document.head.appendChild(materialIconsOutlinedLink);
    }
  }

  getMaterialIcon(heroiconName: string): string {
    return this.iconMap[heroiconName] || this.extractIconName(heroiconName);
  }

  getFallbackIcon(heroiconName: string): string {
    const materialIcon = this.getMaterialIcon(heroiconName);
    return this.unicodeFallback[materialIcon] || '●';
  }

  private extractIconName(heroiconName: string): string {
    // Try to extract a reasonable icon name from the heroicon format
    const parts = heroiconName.split(':');
    if (parts.length > 1) {
      const name = parts[1].replace(/-/g, '_');
      return name;
    }
    return heroiconName;
  }

  isHeroicon(iconName: string): boolean {
    return iconName.includes('heroicons');
  }
}
