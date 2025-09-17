import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';

// Routing
import { RbacManagementRoutingModule } from './rbac-management-routing.module';

// Services
import { RbacService } from './services/rbac.service';

// Components
import { RbacDashboardComponent } from './components/rbac-dashboard/rbac-dashboard.component';
import { RoleManagementComponent } from './components/role-management/role-management.component';
import { PermissionManagementComponent } from './components/permission-management/permission-management.component';
import { UserRoleAssignmentComponent } from './components/user-role-assignment/user-role-assignment.component';

// Dialog Components
import { RoleDialogComponent } from './components/role-dialog/role-dialog.component';
import { PermissionDialogComponent } from './components/permission-dialog/permission-dialog.component';
import { UserRoleAssignDialogComponent } from './components/user-role-assign-dialog/user-role-assign-dialog.component';
import { BulkAssignDialogComponent } from './components/bulk-assign-dialog/bulk-assign-dialog.component';

// State Managers (already provided in root)
import {
  RbacRoleStateManager,
  RbacPermissionStateManager,
  RbacUserRoleStateManager,
} from '../../features/rbac/services/rbac-state.manager';

@NgModule({
  declarations: [
    // Note: All components are standalone, so they don't need to be declared here
    // This module mainly serves as a feature module boundary and provider container
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RbacManagementRoutingModule,

    // Angular Material Modules
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatListModule,
    MatDividerModule,
    MatExpansionModule,
    MatBadgeModule,
    MatTabsModule,

    // Standalone Components
    RbacDashboardComponent,
    RoleManagementComponent,
    PermissionManagementComponent,
    UserRoleAssignmentComponent,
    RoleDialogComponent,
    PermissionDialogComponent,
    UserRoleAssignDialogComponent,
    BulkAssignDialogComponent,
  ],
  providers: [
    // Services are already provided in root, but we can provide feature-specific configurations
    RbacService,

    // State managers are already provided in root
    // RbacRoleStateManager,
    // RbacPermissionStateManager,
    // RbacUserRoleStateManager
  ],
})
export class RbacManagementModule {
  constructor() {
    console.log('RbacManagementModule loaded');
  }
}
