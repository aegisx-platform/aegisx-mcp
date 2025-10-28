import {
  Directive,
  inject,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
} from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Structural directive to show/hide elements based on user permissions
 *
 * Usage:
 * ```html
 * <button *hasPermission="'users:create'">Create User</button>
 * <div *hasPermission="'admin:dashboard:read'">Admin Dashboard</div>
 * ```
 *
 * Features:
 * - Checks if current user has specified permission
 * - Automatically hides element if permission is not granted
 * - Reactive: updates when user permissions change (via Angular signals)
 * - Supports permission wildcards (*:*, resource:*, *:action)
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  private permission = '';
  private hasView = false;

  @Input()
  set hasPermission(permission: string) {
    this.permission = permission;
    this.updateView();
  }

  constructor() {
    // React to authentication state changes using effect
    effect(() => {
      // Track authentication state - this makes the effect reactive
      this.authService.isAuthenticated();
      // Track currentUser changes - this triggers on permission changes
      this.authService.currentUser();
      // Update view when authentication state or user changes
      this.updateView();
    });
  }

  private updateView(): void {
    const hasPermission = this.checkPermission();

    if (hasPermission && !this.hasView) {
      // User has permission and view is not shown -> show it
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      // User doesn't have permission and view is shown -> hide it
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkPermission(): boolean {
    if (!this.permission) {
      // No permission specified -> show by default
      return true;
    }

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      return false;
    }

    // Use AuthService's hasPermission signal
    return this.authService.hasPermission()(this.permission);
  }
}
