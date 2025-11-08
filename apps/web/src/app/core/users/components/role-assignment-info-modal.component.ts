import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

// Types imported from the user service
interface UserRole {
  id: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
  assignedBy?: string;
  expiresAt?: string;
  isActive: boolean;
}

interface RoleAssignmentInfoData {
  userName: string;
  userEmail: string;
  roles: UserRole[];
}

@Component({
  selector: 'ax-role-assignment-info-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  template: `
    <div class="modal-container">
      <!-- Header -->
      <h2 mat-dialog-title class="modal-header">
        <mat-icon class="header-icon">assignment</mat-icon>
        Role Assignment Details
      </h2>

      <!-- User Info -->
      <mat-dialog-content class="modal-content">
        <div class="user-section">
          <h3 class="section-title">User Information</h3>
          <div class="user-info-grid">
            <div class="info-item">
              <label>Name</label>
              <p class="info-value">{{ data.userName }}</p>
            </div>
            <div class="info-item">
              <label>Email</label>
              <p class="info-value text-blue-600 dark:text-blue-400">
                {{ data.userEmail }}
              </p>
            </div>
            <div class="info-item">
              <label>Total Roles</label>
              <p class="info-value font-semibold">{{ data.roles.length }}</p>
            </div>
          </div>
        </div>

        <!-- Roles Assignment List -->
        <div class="roles-section">
          <h3 class="section-title">Assigned Roles</h3>

          @if (data.roles && data.roles.length > 0) {
            <div class="roles-list">
              @for (role of data.roles; track role.id) {
                <div
                  class="role-card"
                  [ngClass]="{ 'role-inactive': !role.isActive }"
                >
                  <!-- Role Name and Status -->
                  <div class="role-header">
                    <div class="flex items-center gap-2">
                      <h4 class="role-name">{{ role.roleName | titlecase }}</h4>
                      <span
                        *ngIf="!role.isActive"
                        class="status-badge status-inactive"
                      >
                        Inactive
                      </span>
                      <span
                        *ngIf="role.isActive"
                        class="status-badge status-active"
                      >
                        Active
                      </span>
                    </div>
                    <div class="role-id-copy">
                      <code class="role-id" [title]="role.roleId">
                        {{ role.roleId | slice: 0 : 8 }}...
                      </code>
                      <button
                        mat-icon-button
                        [matTooltip]="'Copy role ID'"
                        (click)="copyToClipboard(role.roleId)"
                        class="copy-btn"
                      >
                        <mat-icon>content_copy</mat-icon>
                      </button>
                    </div>
                  </div>

                  <!-- Assignment Details -->
                  <div class="role-details">
                    <!-- Assigned At -->
                    <div class="detail-row">
                      <div class="detail-label">
                        <mat-icon class="detail-icon">schedule</mat-icon>
                        Assigned At
                      </div>
                      <div class="detail-value">
                        {{ formatDate(role.assignedAt) }}
                      </div>
                    </div>

                    <!-- Assigned By -->
                    @if (role.assignedBy) {
                      <div class="detail-row">
                        <div class="detail-label">
                          <mat-icon class="detail-icon">person</mat-icon>
                          Assigned By
                        </div>
                        <div class="detail-value">
                          {{ role.assignedBy }}
                        </div>
                      </div>
                    }

                    <!-- Expires At -->
                    @if (role.expiresAt) {
                      <div class="detail-row">
                        <div class="detail-label">
                          <mat-icon class="detail-icon">access_time</mat-icon>
                          Expires At
                        </div>
                        <div class="detail-value">
                          {{ formatDate(role.expiresAt) }}
                          @if (isExpired(role.expiresAt)) {
                            <span class="expiry-warning">
                              <mat-icon>warning</mat-icon>
                              Expired
                            </span>
                          } @else if (isExpiringSoon(role.expiresAt)) {
                            <span class="expiry-notice">
                              <mat-icon>info</mat-icon>
                              Expiring Soon
                            </span>
                          }
                        </div>
                      </div>
                    } @else {
                      <div class="detail-row">
                        <div class="detail-label">
                          <mat-icon class="detail-icon">access_time</mat-icon>
                          Expires At
                        </div>
                        <div
                          class="detail-value text-gray-500 dark:text-gray-400"
                        >
                          No expiration
                        </div>
                      </div>
                    }

                    <!-- Assignment ID -->
                    <div class="detail-row">
                      <div class="detail-label">
                        <mat-icon class="detail-icon">fingerprint</mat-icon>
                        Assignment ID
                      </div>
                      <div class="detail-value">
                        <code class="assignment-id" [title]="role.id">
                          {{ role.id | slice: 0 : 8 }}...
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <mat-icon>person_off</mat-icon>
              <p>No roles assigned to this user</p>
            </div>
          }
        </div>
      </mat-dialog-content>

      <!-- Footer -->
      <mat-dialog-actions align="end" class="modal-footer">
        <button mat-button (click)="onClose()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .modal-container {
        display: flex;
        flex-direction: column;
        min-width: 600px;
        max-width: 800px;
      }

      .modal-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        margin: 0;
        background: linear-gradient(135deg, #f3f4f6 0%, #f9fafb 100%);
      }

      .header-icon {
        color: #3b82f6;
        font-size: 1.5rem;
      }

      .modal-content {
        max-height: 70vh;
        overflow-y: auto;
        padding: 1.5rem;
      }

      .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
      }

      /* User Section */
      .user-section {
        margin-bottom: 2rem;
      }

      .section-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 1rem 0;
      }

      .user-info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
      }

      .info-item {
        padding: 0.75rem;
        background: #f3f4f6;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
      }

      .info-item label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.5rem;
      }

      .info-value {
        margin: 0;
        font-size: 0.875rem;
        color: #111;
        word-break: break-word;
      }

      /* Roles Section */
      .roles-section {
        margin-bottom: 1rem;
      }

      .roles-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .role-card {
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        background: #ffffff;
        transition: all 0.2s ease;
      }

      .role-card:hover {
        border-color: #3b82f6;
        box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
      }

      .role-card.role-inactive {
        opacity: 0.7;
        background: #f9fafb;
      }

      .role-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .role-name {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #111;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .status-active {
        background: #d1fae5;
        color: #065f46;
      }

      .status-inactive {
        background: #fee2e2;
        color: #991b1b;
      }

      .role-id-copy {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .role-id,
      .assignment-id {
        padding: 0.25rem 0.5rem;
        background: #f3f4f6;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-family: monospace;
        color: #666;
      }

      .copy-btn {
        width: 32px;
        height: 32px;
        color: #666;
      }

      .copy-btn:hover {
        color: #3b82f6;
        background: #eff6ff;
      }

      /* Role Details */
      .role-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }

      .detail-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 140px;
        font-size: 0.875rem;
        font-weight: 500;
        color: #666;
      }

      .detail-icon {
        font-size: 1.125rem;
        width: 1.125rem;
        height: 1.125rem;
        color: #9ca3af;
      }

      .detail-value {
        flex: 1;
        font-size: 0.875rem;
        color: #111;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .expiry-warning {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        background: #fee2e2;
        color: #991b1b;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .expiry-warning mat-icon {
        width: 1rem;
        height: 1rem;
        font-size: 1rem;
      }

      .expiry-notice {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        background: #fef3c7;
        color: #92400e;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .expiry-notice mat-icon {
        width: 1rem;
        height: 1rem;
        font-size: 1rem;
      }

      /* Empty State */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        color: #9ca3af;
        text-align: center;
      }

      .empty-state mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        margin-bottom: 1rem;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .modal-container {
          min-width: 90vw;
          max-width: 90vw;
        }

        .role-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .detail-row {
          flex-direction: column;
        }

        .user-info-grid {
          grid-template-columns: 1fr;
        }
      }

      /* Dark Mode */
      :host-context(.dark-mode) .modal-header {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        border-bottom-color: #374151;
      }

      :host-context(.dark-mode) .modal-footer {
        background: #111827;
        border-top-color: #374151;
      }

      :host-context(.dark-mode) .info-item {
        background: #1f2937;
        border-color: #374151;
      }

      :host-context(.dark-mode) .role-card {
        background: #1f2937;
        border-color: #374151;
        color: #e5e7eb;
      }

      :host-context(.dark-mode) .role-name {
        color: #e5e7eb;
      }

      :host-context(.dark-mode) .detail-value {
        color: #e5e7eb;
      }

      :host-context(.dark-mode) .role-id,
      :host-context(.dark-mode) .assignment-id {
        background: #111827;
        color: #9ca3af;
      }
    `,
  ],
})
export class RoleAssignmentInfoModalComponent {
  private dialogRef = inject(MatDialogRef<RoleAssignmentInfoModalComponent>);
  data = inject<RoleAssignmentInfoData>(MAT_DIALOG_DATA);

  /**
   * Formats date string to readable format
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Check if role assignment has expired
   */
  isExpired(expiresAt: string | undefined): boolean {
    if (!expiresAt) return false;
    try {
      return new Date(expiresAt) < new Date();
    } catch {
      return false;
    }
  }

  /**
   * Check if role assignment will expire within 7 days
   */
  isExpiringSoon(expiresAt: string | undefined): boolean {
    if (!expiresAt) return false;
    try {
      const expiryDate = new Date(expiresAt);
      const now = new Date();
      const daysUntilExpiry =
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
    } catch {
      return false;
    }
  }

  /**
   * Copy text to clipboard
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a snackbar notification here
      console.log('Copied to clipboard:', text);
    });
  }

  /**
   * Close the modal
   */
  onClose(): void {
    this.dialogRef.close();
  }
}
