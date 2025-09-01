import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AegisxNavigation, AegisxNavigationItem } from '../../types/navigation.types';
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class AegisxNavigationService {
  // Private writable signals
  private _navigation = signal<AegisxNavigation>({
    default: [],
    compact: [],
    horizontal: [],
    mobile: []
  });
  private _currentNavigationItem = signal<AegisxNavigationItem | null>(null);
  
  // Public readonly signals
  readonly navigation = this._navigation.asReadonly();
  readonly currentNavigationItem = this._currentNavigationItem.asReadonly();
  
  // Computed signals
  readonly defaultNavigation = computed(() => this.navigation().default);
  readonly compactNavigation = computed(() => this.navigation().compact);
  readonly horizontalNavigation = computed(() => this.navigation().horizontal || []);
  readonly mobileNavigation = computed(() => this.navigation().mobile || []);
  
  // Computed flat navigation for searching
  readonly flatNavigation = computed(() => {
    const navigation = this.navigation();
    return this._flattenNavigation(navigation.default);
  });
  
  // Computed breadcrumbs
  readonly breadcrumbs = computed(() => {
    const currentItem = this.currentNavigationItem();
    if (!currentItem) {
      return [];
    }
    return this._generateBreadcrumbs(currentItem);
  });
  
  private _httpClient = inject(HttpClient);
  
  /**
   * Get navigation data from the server
   */
  get(): Observable<AegisxNavigation> {
    return this._httpClient.get<AegisxNavigation>('/api/navigation').pipe(
      tap((navigation: AegisxNavigation) => this.setNavigation(navigation))
    );
  }
  
  /**
   * Set the navigation
   */
  setNavigation(navigation: AegisxNavigation): void {
    this._navigation.set(cloneDeep(navigation));
  }
  
  /**
   * Update navigation item
   */
  updateNavigationItem(id: string, item: Partial<AegisxNavigationItem>): void {
    this._navigation.update(navigation => {
      const updatedNavigation = cloneDeep(navigation);
      
      // Update in all navigation types
      ['default', 'compact', 'horizontal', 'mobile'].forEach(type => {
        const navItems = updatedNavigation[type as keyof AegisxNavigation];
        if (navItems) {
          this._updateItemInNavigation(navItems as AegisxNavigationItem[], id, item);
        }
      });
      
      return updatedNavigation;
    });
  }
  
  /**
   * Set current navigation item
   */
  setCurrentNavigationItem(item: AegisxNavigationItem | null): void {
    this._currentNavigationItem.set(item);
  }
  
  /**
   * Get navigation item by id
   */
  getNavigationItem(id: string): AegisxNavigationItem | null {
    const flatNavigation = this.flatNavigation();
    return flatNavigation.find(item => item.id === id) || null;
  }
  
  /**
   * Get navigation item by link
   */
  getNavigationItemByLink(link: string): AegisxNavigationItem | null {
    const flatNavigation = this.flatNavigation();
    return flatNavigation.find(item => item.link === link) || null;
  }
  
  /**
   * Toggle navigation item
   */
  toggleNavigationItem(id: string): void {
    const item = this.getNavigationItem(id);
    if (item && item.type === 'collapsable') {
      this.updateNavigationItem(id, { 
        expanded: !(item as any).expanded 
      });
    }
  }
  
  /**
   * Helper: Update item in navigation array
   */
  private _updateItemInNavigation(
    items: AegisxNavigationItem[], 
    id: string, 
    updates: Partial<AegisxNavigationItem>
  ): boolean {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.id === id) {
        items[i] = { ...item, ...updates };
        return true;
      }
      
      if (item.children && item.children.length > 0) {
        const found = this._updateItemInNavigation(item.children, id, updates);
        if (found) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Helper: Flatten navigation
   */
  private _flattenNavigation(items: AegisxNavigationItem[]): AegisxNavigationItem[] {
    const flat: AegisxNavigationItem[] = [];
    
    const addToFlat = (item: AegisxNavigationItem) => {
      flat.push(item);
      
      if (item.children && item.children.length > 0) {
        item.children.forEach(child => addToFlat(child));
      }
    };
    
    items.forEach(item => addToFlat(item));
    
    return flat;
  }
  
  /**
   * Helper: Generate breadcrumbs
   */
  private _generateBreadcrumbs(item: AegisxNavigationItem): AegisxNavigationItem[] {
    const breadcrumbs: AegisxNavigationItem[] = [];
    const flatNavigation = this.flatNavigation();
    
    // Find the path to the item
    const findPath = (
      items: AegisxNavigationItem[], 
      targetId: string, 
      path: AegisxNavigationItem[] = []
    ): AegisxNavigationItem[] | null => {
      for (const navItem of items) {
        const currentPath = [...path, navItem];
        
        if (navItem.id === targetId) {
          return currentPath;
        }
        
        if (navItem.children && navItem.children.length > 0) {
          const foundPath = findPath(navItem.children, targetId, currentPath);
          if (foundPath) {
            return foundPath;
          }
        }
      }
      
      return null;
    };
    
    const navigation = this.navigation();
    const path = findPath(navigation.default, item.id);
    
    return path || [];
  }
}