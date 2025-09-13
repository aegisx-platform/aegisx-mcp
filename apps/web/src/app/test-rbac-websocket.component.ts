import { Component, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { WebSocketService } from './shared/services/websocket.service';
import { RbacRoleStateManager, Role } from './features/rbac/services/rbac-state.manager';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-test-rbac-websocket',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatIconModule,
    MatDividerModule,
    MatListModule
  ],
  template: `
    <div class="container" style="padding: 20px; max-width: 1200px;">
      <h1>🔌 RBAC WebSocket Integration Test</h1>
      
      <!-- Connection Status -->
      <mat-card style="margin-bottom: 20px;">
        <mat-card-header>
          <mat-card-title>
            <mat-icon [color]="isConnected() ? 'primary' : 'warn'">
              {{ isConnected() ? 'wifi' : 'wifi_off' }}
            </mat-icon>
            WebSocket Status
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p><strong>Status:</strong> 
            <span [style.color]="isConnected() ? 'green' : 'red'">
              {{ connectionStatus().status }}
            </span>
          </p>
          <p><strong>Connected at:</strong> {{ connectionStatus().timestamp | date:'medium' }}</p>
          
          <div style="margin-top: 15px;">
            <button mat-raised-button color="primary" (click)="connect()" [disabled]="isConnected()">
              Connect
            </button>
            <button mat-raised-button color="warn" (click)="disconnect()" [disabled]="!isConnected()" style="margin-left: 10px;">
              Disconnect
            </button>
            <button mat-raised-button (click)="subscribeToRBAC()" [disabled]="!isConnected()" style="margin-left: 10px;">
              Subscribe to RBAC
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <div style="display: flex; gap: 20px;">
        <!-- RBAC State -->
        <mat-card style="flex: 1;">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>security</mat-icon>
              RBAC State Manager
              <mat-icon matBadge="{{ roles().length }}" matBadgeColor="primary">badge</mat-icon>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="loading()" style="text-align: center; padding: 20px;">
              <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
              <p>Loading roles...</p>
            </div>

            <div *ngIf="error()" style="color: red; padding: 10px; background-color: #ffebee; border-radius: 4px; margin-bottom: 10px;">
              <mat-icon>error</mat-icon>
              {{ error() }}
            </div>

            <div style="margin-bottom: 15px;">
              <button mat-raised-button color="primary" (click)="testCreateRole()">
                <mat-icon>add</mat-icon>
                Create Test Role
              </button>
              <button mat-raised-button (click)="clearRoles()" style="margin-left: 10px;">
                <mat-icon>clear</mat-icon>
                Clear State
              </button>
            </div>

            <mat-divider></mat-divider>

            <div *ngIf="roles().length > 0" style="margin-top: 15px;">
              <h4>Roles ({{ roles().length }})</h4>
              <mat-list>
                <mat-list-item *ngFor="let role of roles()">
                  <mat-icon matListItemIcon>
                    {{ role.isActive ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                  <div matListItemTitle>{{ role.name }}</div>
                  <div matListItemLine>{{ role.description }}</div>
                  <div matListItemLine style="font-size: 12px; color: gray;">
                    ID: {{ role.id }} | Category: {{ role.category }} | Users: {{ role.userCount }}
                  </div>
                  <div matListItemMeta *ngIf="role.isLoading" style="color: orange;">
                    <mat-progress-spinner mode="indeterminate" diameter="20"></mat-progress-spinner>
                  </div>
                  <div matListItemMeta *ngIf="role.isLocked" style="color: red;">
                    <mat-icon>lock</mat-icon>
                  </div>
                </mat-list-item>
              </mat-list>
            </div>

            <div *ngIf="roles().length === 0 && !loading()" style="text-align: center; padding: 40px; color: gray;">
              <mat-icon style="font-size: 48px; opacity: 0.5;">folder_open</mat-icon>
              <p>No roles in state. Create one or trigger events from API.</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Event Log -->
        <mat-card style="flex: 1;">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>history</mat-icon>
              Event Log
              <mat-icon matBadge="{{ eventLog.length }}" matBadgeColor="accent">badge</mat-icon>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div style="margin-bottom: 15px;">
              <button mat-raised-button (click)="clearEventLog()">
                <mat-icon>clear</mat-icon>
                Clear Log
              </button>
            </div>

            <mat-divider></mat-divider>

            <div style="height: 400px; overflow-y: auto; margin-top: 15px; font-family: monospace; font-size: 12px;">
              <div *ngFor="let event of eventLog; let i = index" 
                   style="padding: 8px; margin-bottom: 4px; border-left: 3px solid; border-radius: 3px;"
                   [style.border-left-color]="getEventColor(event.type)"
                   [style.background-color]="getEventBgColor(event.type)">
                <div style="font-weight: bold; color: #333;">
                  [{{ event.timestamp | date:'HH:mm:ss.SSS' }}] {{ event.type }}
                </div>
                <div style="color: #666; margin-top: 4px;">
                  {{ event.message }}
                </div>
                <div *ngIf="event.data" style="color: #444; margin-top: 4px; font-size: 11px;">
                  {{ event.data | json }}
                </div>
              </div>
              
              <div *ngIf="eventLog.length === 0" style="text-align: center; padding: 40px; color: gray;">
                <mat-icon style="font-size: 48px; opacity: 0.5;">event_note</mat-icon>
                <p>No events logged yet. Connect and create roles to see real-time updates.</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class TestRbacWebsocketComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private websocketService = inject(WebSocketService);
  private rbacStateManager = inject(RbacRoleStateManager);

  // State signals
  connectionStatus = this.websocketService.getConnectionStatus;
  roles = this.rbacStateManager.items;
  loading = this.rbacStateManager.loading;
  error = this.rbacStateManager.error;

  eventLog: Array<{
    timestamp: Date;
    type: string;
    message: string;
    data?: any;
  }> = [];

  ngOnInit() {
    this.logEvent('INIT', 'Component initialized');
    
    // Subscribe to WebSocket connection status changes
    this.websocketService.getConnectionStatusObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.logEvent('CONNECTION', `Status changed to: ${status.status}`);
      });

    // Subscribe to RBAC state changes using effects
    effect(() => {
      const roles = this.rbacStateManager.items();
      this.logEvent('STATE', `Roles updated: ${roles.length} total`);
    });

    effect(() => {
      const error = this.rbacStateManager.error();
      if (error) {
        this.logEvent('ERROR', `State error: ${error}`, { error });
      }
    });

    // Auto-connect on init
    if (!this.isConnected()) {
      this.connect();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isConnected(): boolean {
    return this.connectionStatus().status === 'connected';
  }

  connect() {
    this.logEvent('ACTION', 'Connecting to WebSocket...');
    this.websocketService.connect();
  }

  disconnect() {
    this.logEvent('ACTION', 'Disconnecting from WebSocket...');
    this.websocketService.disconnect();
  }

  subscribeToRBAC() {
    this.logEvent('ACTION', 'Subscribing to RBAC features...');
    this.websocketService.subscribe({
      features: ['rbac']
    });
  }

  async testCreateRole() {
    const roleName = `Test Role ${Date.now()}`;
    this.logEvent('ACTION', `Creating role via API: ${roleName}`);

    try {
      const response = await fetch('http://localhost:3380/test/rbac/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: roleName,
          description: 'Role created from Angular test component',
          category: 'Frontend Test'
        })
      });

      const result = await response.json();
      if (result.success) {
        this.logEvent('API_SUCCESS', `Role created successfully`, result.data);
      } else {
        this.logEvent('API_ERROR', `Failed to create role`, result.error);
      }
    } catch (error) {
      this.logEvent('API_ERROR', `Network error creating role`, { error: error.message });
    }
  }

  clearRoles() {
    this.logEvent('ACTION', 'Clearing RBAC state...');
    this.rbacStateManager.clearItems();
  }

  clearEventLog() {
    this.eventLog = [];
    this.logEvent('ACTION', 'Event log cleared');
  }

  private logEvent(type: string, message: string, data?: any) {
    this.eventLog.unshift({
      timestamp: new Date(),
      type,
      message,
      data
    });

    // Keep only last 100 events
    if (this.eventLog.length > 100) {
      this.eventLog = this.eventLog.slice(0, 100);
    }
  }

  getEventColor(type: string): string {
    switch (type) {
      case 'ERROR': return '#f44336';
      case 'API_ERROR': return '#f44336';
      case 'CONNECTION': return '#2196f3';
      case 'STATE': return '#4caf50';
      case 'API_SUCCESS': return '#4caf50';
      case 'ACTION': return '#ff9800';
      default: return '#666';
    }
  }

  getEventBgColor(type: string): string {
    switch (type) {
      case 'ERROR': return '#ffebee';
      case 'API_ERROR': return '#ffebee';
      case 'CONNECTION': return '#e3f2fd';
      case 'STATE': return '#e8f5e8';
      case 'API_SUCCESS': return '#e8f5e8';
      case 'ACTION': return '#fff3e0';
      default: return '#f5f5f5';
    }
  }
}