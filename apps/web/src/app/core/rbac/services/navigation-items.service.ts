import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface NavigationItem {
  id: string;
  parent_id?: string;
  key: string;
  title: string;
  type: 'item' | 'group' | 'collapsible' | 'divider' | 'spacer';
  icon?: string;
  link?: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  sort_order: number;
  disabled: boolean;
  hidden: boolean;
  exact_match: boolean;
  badge_title?: string;
  badge_classes?: string;
  badge_variant?: string;
  show_in_default: boolean;
  show_in_compact: boolean;
  show_in_horizontal: boolean;
  show_in_mobile: boolean;
  meta?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

export interface CreateNavigationItemRequest {
  parent_id?: string;
  key: string;
  title: string;
  type: 'item' | 'group' | 'collapsible' | 'divider' | 'spacer';
  icon?: string;
  link?: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  sort_order?: number;
  disabled?: boolean;
  hidden?: boolean;
  exact_match?: boolean;
  badge_title?: string;
  badge_classes?: string;
  badge_variant?: string;
  show_in_default?: boolean;
  show_in_compact?: boolean;
  show_in_horizontal?: boolean;
  show_in_mobile?: boolean;
  meta?: Record<string, any>;
  permission_ids?: string[];
}

export type UpdateNavigationItemRequest = Partial<CreateNavigationItemRequest>

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NavigationItemsService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/navigation-items';

  /**
   * Get all navigation items
   */
  getAll(): Observable<NavigationItem[]> {
    return this.http
      .get<ApiResponse<NavigationItem[]>>(this.baseUrl)
      .pipe(map((response) => response.data));
  }

  /**
   * Get single navigation item by ID
   */
  getById(id: string): Observable<NavigationItem> {
    return this.http
      .get<ApiResponse<NavigationItem>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  /**
   * Create new navigation item
   */
  create(data: CreateNavigationItemRequest): Observable<NavigationItem> {
    return this.http
      .post<ApiResponse<NavigationItem>>(this.baseUrl, data)
      .pipe(map((response) => response.data));
  }

  /**
   * Update navigation item
   */
  update(
    id: string,
    data: UpdateNavigationItemRequest,
  ): Observable<NavigationItem> {
    return this.http
      .put<ApiResponse<NavigationItem>>(`${this.baseUrl}/${id}`, data)
      .pipe(map((response) => response.data));
  }

  /**
   * Delete navigation item
   */
  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
      .pipe(map(() => undefined));
  }

  /**
   * Reorder navigation items
   */
  reorder(orders: Array<{ id: string; sort_order: number }>): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.baseUrl}/reorder`, { orders })
      .pipe(map(() => undefined));
  }

  /**
   * Get permissions for navigation item
   */
  getPermissions(id: string): Observable<Permission[]> {
    return this.http
      .get<ApiResponse<Permission[]>>(`${this.baseUrl}/${id}/permissions`)
      .pipe(map((response) => response.data));
  }

  /**
   * Assign permissions to navigation item
   */
  assignPermissions(
    id: string,
    permissionIds: string[],
  ): Observable<Permission[]> {
    return this.http
      .post<
        ApiResponse<Permission[]>
      >(`${this.baseUrl}/${id}/permissions`, { permission_ids: permissionIds })
      .pipe(map((response) => response.data));
  }
}
