import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { RealtimeUserListComponent } from '../../shared/components/realtime-user-list.component';
import { WebSocketService } from '../../shared/services/websocket.service';
import { UserRealtimeStateService } from '../../shared/services/user-realtime-state.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-realtime-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    RealtimeUserListComponent
  ],
  template: `
    <div class="realtime-demo-container p-6 max-w-6xl mx-auto">
      <mat-card class="mb-6">
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2">
            <mat-icon>flash_on</mat-icon>
            Real-time Event System Demo
          </mat-card-title>
          <mat-card-subtitle>
            Test the real-time features including WebSocket connections, optimistic updates, and conflict resolution
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Connection Status -->
          <div class="connection-status mb-4 p-4 rounded-lg border">
            <h3 class="text-lg font-medium mb-2">Connection Status</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="status-item">
                <span class="font-medium">WebSocket:</span>
                <span [class]="websocketService.isConnected() ? 'text-green-600' : 'text-red-600'">
                  {{ websocketService.isConnected() ? '🟢 Connected' : '🔴 Disconnected' }}
                </span>
              </div>
              <div class="status-item">
                <span class="font-medium">Event Bus:</span>
                <span class="text-blue-600">🟢 Active</span>
              </div>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="quick-actions mb-4">
            <h3 class="text-lg font-medium mb-2">Quick Actions</h3>
            <div class="flex gap-2 flex-wrap">
              <button mat-raised-button color="primary" (click)="connectWebSocket()" 
                      [disabled]="websocketService.isConnected()">
                <mat-icon>wifi</mat-icon>
                Connect WebSocket
              </button>
              
              <button mat-stroked-button (click)="disconnectWebSocket()" 
                      [disabled]="!websocketService.isConnected()">
                <mat-icon>wifi_off</mat-icon>
                Disconnect
              </button>
              
              <button mat-stroked-button (click)="testEventBus()">
                <mat-icon>send</mat-icon>
                Test Event Bus
              </button>
              
              <button mat-stroked-button (click)="simulateServerEvent()">
                <mat-icon>cloud_sync</mat-icon>
                Simulate Server Event
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Demo Tabs -->
      <mat-tab-group>
        <mat-tab label="User Management">
          <div class="tab-content p-4">
            <app-realtime-user-list></app-realtime-user-list>
          </div>
        </mat-tab>
        
        <mat-tab label="Event Monitor">
          <div class="tab-content p-4">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Real-time Event Monitor</mat-card-title>
                <mat-card-subtitle>Watch events in real-time</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="event-log max-h-96 overflow-y-auto p-4 bg-gray-50 rounded">
                  <div *ngFor="let event of eventLog; trackBy: trackByIndex" 
                       class="event-item p-2 mb-2 bg-white rounded border text-sm">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <span class="font-mono text-blue-600">{{ event.timestamp | date:'HH:mm:ss.SSS' }}</span>
                        <span class="mx-2 font-medium">{{ event.feature }}.{{ event.entity }}.{{ event.action }}</span>
                      </div>
                      <span class="px-2 py-1 rounded text-xs" 
                            [class]="'bg-' + getPriorityColor(event.priority) + '-100 text-' + getPriorityColor(event.priority) + '-800'">
                        {{ event.priority }}
                      </span>
                    </div>
                    <div class="mt-1 text-gray-600">
                      {{ event.data | json }}
                    </div>
                  </div>
                  
                  <div *ngIf="eventLog.length === 0" class="text-center text-gray-500 py-8">
                    <mat-icon class="text-4xl mb-2">event_note</mat-icon>
                    <p>No events received yet. Connect to WebSocket and perform some actions.</p>
                  </div>
                </div>
                
                <div class="actions mt-4 flex gap-2">
                  <button mat-stroked-button (click)="clearEventLog()">
                    <mat-icon>clear</mat-icon>
                    Clear Log
                  </button>
                  
                  <button mat-stroked-button (click)="exportEventLog()">
                    <mat-icon>download</mat-icon>
                    Export Log
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
        
        <mat-tab label="Performance">
          <div class="tab-content p-4">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Performance Metrics</mat-card-title>
                <mat-card-subtitle>Monitor real-time performance</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="metrics-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="metric-card p-4 bg-blue-50 rounded">
                    <h4 class="font-medium text-blue-800">Events/sec</h4>
                    <p class="text-2xl font-bold text-blue-600">{{ eventsPerSecond }}</p>
                  </div>
                  
                  <div class="metric-card p-4 bg-green-50 rounded">
                    <h4 class="font-medium text-green-800">Avg Latency</h4>
                    <p class="text-2xl font-bold text-green-600">{{ averageLatency }}ms</p>
                  </div>
                  
                  <div class="metric-card p-4 bg-purple-50 rounded">
                    <h4 class="font-medium text-purple-800">Total Events</h4>
                    <p class="text-2xl font-bold text-purple-600">{{ totalEvents }}</p>
                  </div>
                </div>
                
                <div class="mt-4">
                  <button mat-stroked-button (click)="resetMetrics()">
                    <mat-icon>refresh</mat-icon>
                    Reset Metrics
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .realtime-demo-container {
      min-height: 100vh;
    }
    
    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f9fafb;
      border-radius: 0.375rem;
    }
    
    .event-item {
      transition: all 0.2s ease;
    }
    
    .event-item:hover {
      transform: translateX(2px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .tab-content {
      min-height: 500px;
    }
    
    .metric-card {
      transition: transform 0.2s ease;
    }
    
    .metric-card:hover {
      transform: translateY(-2px);
    }
  `]
})
export class RealtimeDemoComponent implements OnInit {
  public websocketService = inject(WebSocketService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  
  // Event monitoring
  public eventLog: any[] = [];
  public eventsPerSecond = 0;
  public averageLatency = 0;
  public totalEvents = 0;
  
  private eventTimestamps: number[] = [];
  private startTime = Date.now();
  
  ngOnInit(): void {
    this.setupEventMonitoring();
  }
  
  private setupEventMonitoring(): void {
    // Monitor all WebSocket messages
    this.websocketService.subscribeToFeature('users').subscribe(message => {
      this.logEvent(message);
    });
    
    this.websocketService.subscribeToFeature('rbac').subscribe(message => {
      this.logEvent(message);
    });
    
    this.websocketService.subscribeToFeature('products').subscribe(message => {
      this.logEvent(message);
    });
  }
  
  private logEvent(event: any): void {
    const now = Date.now();
    this.eventTimestamps.push(now);
    
    // Keep only last 100 events for display
    if (this.eventLog.length >= 100) {
      this.eventLog.shift();
    }
    
    this.eventLog.push({
      ...event,
      timestamp: new Date(now),
      latency: event.meta?.latency || 0
    });
    
    this.updateMetrics();
  }
  
  private updateMetrics(): void {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    // Calculate events per second
    this.eventsPerSecond = this.eventTimestamps.filter(t => t > oneSecondAgo).length;
    
    // Calculate average latency
    const recentEvents = this.eventLog.slice(-10);
    if (recentEvents.length > 0) {
      const totalLatency = recentEvents.reduce((sum, event) => sum + (event.latency || 0), 0);
      this.averageLatency = Math.round(totalLatency / recentEvents.length);
    }
    
    this.totalEvents = this.eventLog.length;
    
    // Clean old timestamps
    this.eventTimestamps = this.eventTimestamps.filter(t => t > now - 60000); // Keep last minute
  }
  
  public async connectWebSocket(): Promise<void> {
    try {
      const currentUser = this.authService.currentUser();
      if (currentUser && this.authService.accessToken()) {
        this.websocketService.connect(this.authService.accessToken()!);
        
        // Subscribe to users feature for testing
        setTimeout(() => {
          this.websocketService.subscribe({
            features: ['users', 'rbac', 'products']
          });
        }, 1000);
        
        this.snackBar.open('WebSocket connecting...', 'OK', { duration: 2000 });
      } else {
        this.snackBar.open('Please login first', 'OK', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open('Failed to connect WebSocket', 'OK', { duration: 3000 });
    }
  }
  
  public disconnectWebSocket(): void {
    this.websocketService.disconnect();
    this.snackBar.open('WebSocket disconnected', 'OK', { duration: 2000 });
  }
  
  public testEventBus(): void {
    // Send a test event
    this.websocketService.send('test_event', {
      feature: 'demo',
      entity: 'test',
      action: 'ping',
      data: {
        message: 'Test event from demo',
        timestamp: new Date().toISOString()
      }
    });
    
    this.snackBar.open('Test event sent', 'OK', { duration: 2000 });
  }
  
  public simulateServerEvent(): void {
    // Simulate receiving a server event
    const mockEvent = {
      feature: 'demo',
      entity: 'simulation',
      action: 'created',
      data: {
        id: Math.random().toString(36).substr(2, 9),
        message: 'Simulated server event',
        value: Math.round(Math.random() * 100)
      },
      meta: {
        timestamp: new Date().toISOString(),
        userId: 'demo-user',
        sessionId: 'demo-session',
        featureVersion: 'v1',
        priority: ['low', 'normal', 'high', 'critical'][Math.floor(Math.random() * 4)] as any
      }
    };
    
    this.logEvent(mockEvent);
    this.snackBar.open('Server event simulated', 'OK', { duration: 2000 });
  }
  
  public clearEventLog(): void {
    this.eventLog = [];
    this.resetMetrics();
    this.snackBar.open('Event log cleared', 'OK', { duration: 2000 });
  }
  
  public exportEventLog(): void {
    const dataStr = JSON.stringify(this.eventLog, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `realtime-events-${new Date().toISOString()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    this.snackBar.open('Event log exported', 'OK', { duration: 2000 });
  }
  
  public resetMetrics(): void {
    this.eventsPerSecond = 0;
    this.averageLatency = 0;
    this.totalEvents = 0;
    this.eventTimestamps = [];
    this.startTime = Date.now();
  }
  
  public getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'normal': return 'blue';
      case 'low': return 'gray';
      default: return 'blue';
    }
  }
  
  public trackByIndex(index: number): number {
    return index;
  }
}