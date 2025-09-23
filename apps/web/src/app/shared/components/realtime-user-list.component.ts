import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserRealtimeStateService, User } from '../services/user-realtime-state.service';
import { WebSocketService } from '../services/websocket.service';

@Component({
  selector: 'app-realtime-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  template: `
    <mat-card class="realtime-user-list">
      <mat-card-header>
        <mat-card-title class="flex items-center gap-2">
          <mat-icon>people</mat-icon>
          Real-time User Management
          
          <!-- Connection Status -->
          <mat-chip-set>
            <mat-chip [class.selected]="userStateService.isConnected()">
              <mat-icon>{{userStateService.isConnected() ? 'wifi' : 'wifi_off'}}</mat-icon>
              {{userStateService.isConnected() ? 'Connected' : 'Disconnected'}}
            </mat-chip>
            
            <!-- Sync Status -->
            <mat-chip [class]="'status-' + getSyncStatusColor()">
              <mat-icon>{{getSyncStatusIcon()}}</mat-icon>
              {{userStateService.syncStatus() | titlecase}}
            </mat-chip>
          </mat-chip-set>
        </mat-card-title>
        
        <mat-card-subtitle>
          Total: {{userStateService.localState().length}} users
          <span *ngIf="userStateService.hasConflicts()" class="text-red-500 ml-2">
            ({{userStateService.conflicts().size}} conflicts)
          </span>
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <!-- Controls -->
        <div class="controls-row mb-4 flex gap-2 flex-wrap">
          <mat-form-field appearance="outline" class="flex-1 min-w-[200px]">
            <mat-label>Search users...</mat-label>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          
          <button mat-raised-button color="primary" (click)="syncData()" [disabled]="userStateService.isLoading()">
            <mat-icon>sync</mat-icon>
            Sync
          </button>
          
          <button mat-stroked-button (click)="addTestUser()" [disabled]="userStateService.isLoading()">
            <mat-icon>add</mat-icon>
            Add Test User (Optimistic)
          </button>
          
          <button mat-stroked-button color="accent" (click)="addTestUserServerOnly()" [disabled]="userStateService.isLoading()">
            <mat-icon>cloud_upload</mat-icon>
            Add Test User (Server-only)
          </button>
          
          <button *ngIf="userStateService.hasPendingOperations()" 
                  mat-stroked-button color="warn" (click)="forcePush()" 
                  [disabled]="userStateService.isLoading()">
            <mat-icon [matBadge]="userStateService.pendingOperations().length" matBadgeColor="warn">upload</mat-icon>
            Push Changes
          </button>
          
          <button *ngIf="userStateService.hasConflicts()" 
                  mat-stroked-button color="warn" (click)="resolveAllConflicts()" 
                  [disabled]="userStateService.isLoading()">
            <mat-icon [matBadge]="userStateService.conflicts().size" matBadgeColor="warn">warning</mat-icon>
            Resolve Conflicts
          </button>
        </div>
        
        <!-- Loading Indicator -->
        <div *ngIf="userStateService.isLoading()" class="loading-container text-center py-4">
          <mat-progress-spinner diameter="40" mode="indeterminate"></mat-progress-spinner>
          <p class="mt-2 text-gray-600">Syncing with server...</p>
        </div>
        
        <!-- User List -->
        <div class="user-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let user of displayedUsers(); trackBy: trackByUserId" 
               class="user-card bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
            
            <!-- User Header -->
            <div class="user-header flex items-center justify-between mb-2">
              <div class="user-info flex items-center gap-2">
                <div class="avatar w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                  {{getUserInitials(user)}}
                </div>
                <div>
                  <h4 class="font-medium">{{user.firstName}} {{user.lastName}}</h4>
                  <p class="text-sm text-gray-500">{{user.username}}</p>
                </div>
              </div>
              
              <!-- Status Indicators -->
              <div class="status-indicators flex gap-1">
                <mat-chip *ngIf="!user.isActive" class="status-warn">Inactive</mat-chip>
                <mat-chip *ngIf="hasConflict(user.id)" class="status-warn">
                  <mat-icon>warning</mat-icon>
                  Conflict
                </mat-chip>
                <mat-chip *ngIf="hasPendingOperation(user.id)" class="status-accent">
                  <mat-icon>schedule</mat-icon>
                  Pending
                </mat-chip>
              </div>
            </div>
            
            <!-- User Details -->
            <div class="user-details text-sm text-gray-600 mb-3">
              <p><strong>Email:</strong> {{user.email}}</p>
              <p><strong>Role:</strong> {{user.role}}</p>
              <p *ngIf="user.lastLoginAt"><strong>Last Login:</strong> {{user.lastLoginAt | date:'short'}}</p>
            </div>
            
            <!-- Actions -->
            <div class="user-actions flex gap-2">
              <button mat-icon-button color="primary" 
                      [matTooltip]="user.isActive ? 'Deactivate' : 'Activate'"
                      (click)="toggleUserStatus(user)"
                      [disabled]="userStateService.isLoading()">
                <mat-icon>{{user.isActive ? 'person_off' : 'person'}}</mat-icon>
              </button>
              
              <button mat-icon-button color="accent" 
                      matTooltip="Edit User"
                      (click)="editUser(user)"
                      [disabled]="userStateService.isLoading()">
                <mat-icon>edit</mat-icon>
              </button>
              
              <button mat-icon-button color="warn" 
                      matTooltip="Delete User"
                      (click)="deleteUser(user)"
                      [disabled]="userStateService.isLoading()">
                <mat-icon>delete</mat-icon>
              </button>
              
              <button *ngIf="hasConflict(user.id)" 
                      mat-icon-button color="warn" 
                      matTooltip="Resolve Conflict"
                      (click)="showConflictDetails(user.id)">
                <mat-icon>warning</mat-icon>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="displayedUsers().length === 0 && !userStateService.isLoading()" 
             class="empty-state text-center py-8">
          <mat-icon class="text-6xl text-gray-400 mb-2">people_outline</mat-icon>
          <h3 class="text-lg font-medium text-gray-600 mb-2">No users found</h3>
          <p class="text-gray-500">{{searchQuery ? 'Try adjusting your search criteria' : 'Add some users to get started'}}</p>
        </div>
      </mat-card-content>
      
      <mat-card-actions>
        <!-- Status Info -->
        <div class="status-info text-sm text-gray-600">
          <p *ngIf="userStateService.lastSync()">
            Last sync: {{userStateService.lastSync() | date:'medium'}}
          </p>
          <p *ngIf="userStateService.hasPendingOperations()">
            {{userStateService.pendingOperations().length}} pending operations
          </p>
          <p *ngIf="userStateService.hasConflicts()">
            {{userStateService.conflicts().size}} conflicts need resolution
          </p>
        </div>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .realtime-user-list {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .controls-row {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 1rem;
    }
    
    .user-card {
      transition: all 0.2s ease;
    }
    
    .user-card:hover {
      transform: translateY(-2px);
    }
    
    .status-indicators .mat-mdc-chip {
      height: 24px;
      font-size: 11px;
    }
    
    .loading-container {
      border: 1px dashed #d1d5db;
      border-radius: 8px;
    }
    
    .empty-state {
      border: 1px dashed #d1d5db;
      border-radius: 8px;
    }
    
    .status-warn {
      background-color: #fef2f2;
      color: #dc2626;
    }
    
    .status-accent {
      background-color: #ede9fe;
      color: #7c3aed;
    }
    
    .status-primary {
      background-color: #eff6ff;
      color: #2563eb;
    }
    
    .selected {
      background-color: #3b82f6;
      color: white;
    }
  `]
})
export class RealtimeUserListComponent implements OnInit {
  public userStateService = inject(UserRealtimeStateService);
  private websocketService = inject(WebSocketService);
  private snackBar = inject(MatSnackBar);
  
  public searchQuery = '';
  
  // Computed properties
  public displayedUsers = computed(() => {
    const users = this.userStateService.localState();
    if (!this.searchQuery.trim()) {
      return users;
    }
    return this.userStateService.searchUsers(this.searchQuery);
  });
  
  constructor() {
    // Monitor state changes and show notifications
    effect(() => {
      const syncStatus = this.userStateService.syncStatus();
      if (syncStatus === 'conflict') {
        this.snackBar.open(
          'Conflicts detected! Please resolve them.',
          'Resolve',
          { duration: 5000, panelClass: 'warn' }
        );
      }
    });
    
    effect(() => {
      const pendingCount = this.userStateService.pendingOperations().length;
      if (pendingCount > 0) {
        this.snackBar.open(
          `${pendingCount} operations pending sync`,
          'Push',
          { duration: 3000, panelClass: 'accent' }
        );
      }
    });
  }
  
  ngOnInit(): void {
    // Initial data load
    this.syncData();
  }
  
  // Event handlers
  public onSearchChange(): void {
    // Search is handled reactively by computed property
  }
  
  public async syncData(): Promise<void> {
    try {
      await this.userStateService.syncWithServer();
      this.snackBar.open('Data synced successfully', 'OK', { duration: 2000 });
    } catch (error) {
      console.error('Sync failed:', error);
      this.snackBar.open('Sync failed. Please try again.', 'OK', { duration: 3000 });
    }
  }
  
  public async addTestUser(): Promise<void> {
    const timestamp = Date.now();
    const testUser = {
      email: `test${timestamp}@example.com`,
      username: `testuser${timestamp}`,
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      role: 'user'
    };
    
    try {
      console.log('🚀 Creating user with OPTIMISTIC updates');
      await this.userStateService.createUser(testUser);
      this.snackBar.open('✅ Test user created (Optimistic)', 'OK', { duration: 2000 });
    } catch (error: any) {
      console.error('Failed to create test user:', error);
      const errorMessage = error?.message || 'Failed to create user';
      this.snackBar.open(`❌ ${errorMessage}`, 'OK', { duration: 5000 });
    }
  }

  public async addTestUserServerOnly(): Promise<void> {
    const timestamp = Date.now();
    const testUser = {
      email: `server${timestamp}@example.com`,
      username: `serveruser${timestamp}`,
      firstName: 'Server',
      lastName: 'User',
      password: 'password123',
      role: 'user'
    };
    
    try {
      console.log('🔄 Creating user with SERVER-ONLY mode');
      await this.userStateService.createUser(testUser, { skipOptimistic: true });
      this.snackBar.open('✅ Test user created (Server-only)', 'OK', { duration: 2000 });
    } catch (error: any) {
      console.error('Failed to create test user:', error);
      const errorMessage = error?.message || 'Failed to create user';
      this.snackBar.open(`❌ ${errorMessage}`, 'OK', { duration: 5000 });
    }
  }
  
  public async toggleUserStatus(user: User): Promise<void> {
    try {
      if (user.isActive) {
        await this.userStateService.deactivateUser(user.id);
        this.snackBar.open('✅ User deactivated', 'OK', { duration: 2000 });
      } else {
        await this.userStateService.activateUser(user.id);
        this.snackBar.open('✅ User activated', 'OK', { duration: 2000 });
      }
    } catch (error: any) {
      console.error('Failed to toggle user status:', error);
      const errorMessage = error?.message || 'Failed to update user';
      this.snackBar.open(`❌ ${errorMessage}`, 'OK', { duration: 5000 });
    }
  }
  
  public editUser(user: User): void {
    // TODO: Open edit dialog
    console.log('Edit user:', user);
    this.snackBar.open('Edit functionality coming soon', 'OK', { duration: 2000 });
  }
  
  public async deleteUser(user: User): Promise<void> {
    if (!confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      return;
    }
    
    try {
      await this.userStateService.deleteUser(user.id);
      this.snackBar.open('✅ User deleted successfully', 'OK', { duration: 2000 });
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      const errorMessage = error?.message || 'Failed to delete user';
      this.snackBar.open(`❌ ${errorMessage}`, 'OK', { duration: 5000 });
    }
  }
  
  public async forcePush(): Promise<void> {
    try {
      await this.userStateService.forcePushToServer();
      this.snackBar.open('Changes pushed to server', 'OK', { duration: 2000 });
    } catch (error) {
      console.error('Failed to push changes:', error);
      this.snackBar.open('Failed to push changes', 'OK', { duration: 3000 });
    }
  }
  
  public resolveAllConflicts(): void {
    const conflicts = this.userStateService.conflicts();
    conflicts.forEach((conflict, entityId) => {
      // Auto-resolve by accepting server version
      this.userStateService.resolveConflict(entityId, 'accept_server');
    });
    
    this.snackBar.open(
      `Resolved ${conflicts.size} conflicts (accepted server versions)`,
      'OK',
      { duration: 3000 }
    );
  }
  
  public showConflictDetails(userId: string): void {
    const conflict = this.userStateService.conflicts().get(userId);
    if (conflict) {
      console.log('Conflict details:', conflict);
      // TODO: Open conflict resolution dialog
      this.snackBar.open('Conflict resolution dialog coming soon', 'OK', { duration: 2000 });
    }
  }
  
  // Helper methods
  public trackByUserId(index: number, user: User): string {
    return user.id;
  }
  
  public getUserInitials(user: User): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  
  public hasConflict(userId: string): boolean {
    return this.userStateService.conflicts().has(userId);
  }
  
  public hasPendingOperation(userId: string): boolean {
    return this.userStateService.pendingOperations().some(op => op.entityId === userId);
  }
  
  public getSyncStatusColor(): string {
    const status = this.userStateService.syncStatus();
    switch (status) {
      case 'syncing': return 'primary';
      case 'conflict': return 'warn';
      case 'pending': return 'accent';
      case 'dirty': return 'accent';
      case 'clean': return 'primary';
      default: return 'primary';
    }
  }
  
  public getSyncStatusIcon(): string {
    const status = this.userStateService.syncStatus();
    switch (status) {
      case 'syncing': return 'sync';
      case 'conflict': return 'warning';
      case 'pending': return 'schedule';
      case 'dirty': return 'edit';
      case 'clean': return 'check_circle';
      default: return 'help';
    }
  }
}