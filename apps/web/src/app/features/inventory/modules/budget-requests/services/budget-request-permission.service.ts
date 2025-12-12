import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import { BudgetRequest } from '../types/budget-requests.types';

@Injectable({
  providedIn: 'root',
})
export class BudgetRequestPermissionService {
  private authService = inject(AuthService);
  private currentUser = this.authService.currentUser;
  private hasPermission = this.authService.hasPermission;

  // Computed signals for reactive permission checking
  canCreate = computed(() => this.hasPermission()('budgetRequests:create'));

  /**
   * Determines if the current user can view a specific budget request.
   * Logic: User can view if they have 'view_all', or if they have 'view_dept' (department check is waived for now),
   * or if it's their own request.
   */
  canView = computed(() => (request: BudgetRequest | null): boolean => {
    if (!request) return false;
    const user = this.currentUser();
    if (!user) return false;

    if (this.hasPermission()('budgetRequests:view_all')) {
      return true;
    }
    // Simplified logic: Since department isn't available on user, 'view_dept' behaves like 'view_own' for now.
    // This is a known limitation.
    if (this.hasPermission()('budgetRequests:view_dept')) {
      // TODO: Add department check when user object contains department_id
      return true; // For now, allow viewing if they have the permission at all.
    }
    return request.created_by === user.id;
  });

  /**
   * Determines if the current user can edit a specific budget request.
   * Logic: User can edit if the request is in 'DRAFT' status AND
   * they have 'edit_dept' permission (department check waived) OR they are the creator.
   */
  canEdit = computed(() => (request: BudgetRequest | null): boolean => {
    if (request?.status !== 'DRAFT') return false;
    const user = this.currentUser();
    if (!user) return false;

    if (this.hasPermission()('budgetRequests:edit_dept')) {
      // TODO: Add department check when user object contains department_id
      return true; // Simplified: allowing edit if user has the permission.
    }
    return (
      request.created_by === user.id &&
      this.hasPermission()('budgetRequests:update')
    );
  });

  /**
   * Determines if the current user can submit a specific budget request.
   */
  canSubmit = computed(() => (request: BudgetRequest | null): boolean => {
    return (
      request?.status === 'DRAFT' &&
      this.hasPermission()('budgetRequests:submit')
    );
  });

  /**
   * Determines if the user can perform department-level approval.
   * Logic: Status must be 'SUBMITTED' AND user must have 'approve_dept' permission AND user is not the creator.
   */
  canApproveDept = computed(() => (request: BudgetRequest | null): boolean => {
    if (request?.status !== 'SUBMITTED') return false;
    const user = this.currentUser();
    if (!user) return false;

    // Prevents self-approval
    return (
      this.hasPermission()('budgetRequests:approve_dept') &&
      request.created_by !== user.id
    );
  });

  /**
   * Determines if the user can perform finance-level approval.
   */
  canApproveFinance = computed(
    () =>
      (request: BudgetRequest | null): boolean => {
        return (
          request?.status === 'DEPT_APPROVED' &&
          this.hasPermission()('budgetRequests:approve_finance')
        );
      },
  );

  /**
   * Determines if the user can reopen a rejected request.
   * Logic: Status must be 'REJECTED' AND user must be the creator.
   */
  canReopen = computed(() => (request: BudgetRequest | null): boolean => {
    if (request?.status !== 'REJECTED') return false;
    const user = this.currentUser();
    if (!user) return false;

    return (
      request.created_by === user.id &&
      this.hasPermission()('budgetRequests:reopen')
    );
  });
}
