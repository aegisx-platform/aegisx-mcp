import {
  Component,
  Input,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule } from '@angular/forms';

// Import AegisX UI Components for widgets
import { AegisxCardComponent } from '@aegisx/ui';

interface WidgetExample {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tags: string[];
}

@Component({
  selector: 'app-widgets-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatTabsModule,
    MatDividerModule,
    MatListModule,
    MatGridListModule,
    // AegisX UI Components
    AegisxCardComponent,
  ],
  template: `
    <div class="widgets-section">
      <!-- Application Widgets Demo Header -->
      <div class="demo-header">
        <h3>
          <mat-icon>dashboard</mat-icon>
          Application Widgets
        </h3>
        <p class="demo-description">
          Pre-built application widgets and dashboard components that provide common business functionality.
          These widgets combine multiple components to create complete feature blocks.
        </p>
      </div>

      <!-- Real Application Widgets Demo -->
      <div class="widgets-demo-sections">
        
        <!-- Dashboard Widgets Section -->
        <section class="demo-section">
          <h2 class="section-title">
            <mat-icon>analytics</mat-icon>
            Dashboard Widgets
          </h2>
          <p class="section-description">Statistics cards, KPI displays, and analytics widgets for dashboards.</p>
          
          <div class="demo-grid">
            <!-- Stats Card Widget -->
            <div class="demo-item">
              <h4>Statistics Card Widget</h4>
              <ax-card 
                title="Revenue Overview" 
                subtitle="Monthly Performance"
                appearance="elevated">
                <div class="stats-widget">
                  <div class="stats-row">
                    <div class="stat-item">
                      <mat-icon class="stat-icon success">trending_up</mat-icon>
                      <div class="stat-content">
                        <span class="stat-value">$45,678</span>
                        <span class="stat-label">Total Revenue</span>
                        <span class="stat-change positive">+12.5%</span>
                      </div>
                    </div>
                  </div>
                  <div class="stats-row">
                    <div class="stat-grid">
                      <div class="stat-mini">
                        <span class="mini-value">1,234</span>
                        <span class="mini-label">Orders</span>
                      </div>
                      <div class="stat-mini">
                        <span class="mini-value">89%</span>
                        <span class="mini-label">Conversion</span>
                      </div>
                      <div class="stat-mini">
                        <span class="mini-value">456</span>
                        <span class="mini-label">New Users</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ax-card>
            </div>

            <!-- KPI Widget -->
            <div class="demo-item">
              <h4>KPI Display Widget</h4>
              <ax-card 
                title="Key Performance Indicators" 
                subtitle="Current Quarter"
                appearance="outlined">
                <div class="kpi-widget">
                  <div class="kpi-list">
                    <div class="kpi-item">
                      <div class="kpi-header">
                        <span class="kpi-name">Customer Satisfaction</span>
                        <mat-chip color="primary">Target: 90%</mat-chip>
                      </div>
                      <div class="kpi-value-row">
                        <span class="kpi-value">94.2%</span>
                        <mat-icon class="trend-icon positive">arrow_upward</mat-icon>
                      </div>
                      <mat-progress-bar mode="determinate" [value]="94.2" class="kpi-progress"></mat-progress-bar>
                    </div>

                    <div class="kpi-item">
                      <div class="kpi-header">
                        <span class="kpi-name">Response Time</span>
                        <mat-chip color="accent">Target: &lt;2h</mat-chip>
                      </div>
                      <div class="kpi-value-row">
                        <span class="kpi-value">1.4h</span>
                        <mat-icon class="trend-icon positive">arrow_downward</mat-icon>
                      </div>
                      <mat-progress-bar mode="determinate" [value]="85" class="kpi-progress success"></mat-progress-bar>
                    </div>

                    <div class="kpi-item">
                      <div class="kpi-header">
                        <span class="kpi-name">System Uptime</span>
                        <mat-chip color="primary">Target: 99.9%</mat-chip>
                      </div>
                      <div class="kpi-value-row">
                        <span class="kpi-value">99.95%</span>
                        <mat-icon class="trend-icon positive">check_circle</mat-icon>
                      </div>
                      <mat-progress-bar mode="determinate" [value]="99.95" class="kpi-progress"></mat-progress-bar>
                    </div>
                  </div>
                </div>
              </ax-card>
            </div>
          </div>
        </section>

        <!-- Activity Widgets Section -->
        <section class="demo-section">
          <h2 class="section-title">
            <mat-icon>timeline</mat-icon>
            Activity & Timeline Widgets
          </h2>
          <p class="section-description">Recent activity feeds, timeline components, and notification widgets.</p>
          
          <div class="demo-grid">
            <!-- Activity Feed Widget -->
            <div class="demo-item">
              <h4>Activity Feed Widget</h4>
              <ax-card 
                title="Recent Activity" 
                subtitle="Last 24 hours"
                appearance="default">
                <div class="activity-widget">
                  <mat-list class="activity-list">
                    <mat-list-item class="activity-item">
                      <mat-icon matListItemIcon class="activity-icon user">person_add</mat-icon>
                      <div matListItemTitle>New user registered</div>
                      <div matListItemLine>john.doe@company.com joined the platform</div>
                      <span class="activity-time">2 minutes ago</span>
                    </mat-list-item>
                    
                    <mat-divider></mat-divider>
                    
                    <mat-list-item class="activity-item">
                      <mat-icon matListItemIcon class="activity-icon order">shopping_cart</mat-icon>
                      <div matListItemTitle>Order completed</div>
                      <div matListItemLine>Order #12345 - $234.56</div>
                      <span class="activity-time">15 minutes ago</span>
                    </mat-list-item>
                    
                    <mat-divider></mat-divider>
                    
                    <mat-list-item class="activity-item">
                      <mat-icon matListItemIcon class="activity-icon system">security</mat-icon>
                      <div matListItemTitle>Security update</div>
                      <div matListItemLine>System security policies updated</div>
                      <span class="activity-time">1 hour ago</span>
                    </mat-list-item>
                    
                    <mat-divider></mat-divider>
                    
                    <mat-list-item class="activity-item">
                      <mat-icon matListItemIcon class="activity-icon report">assessment</mat-icon>
                      <div matListItemTitle>Report generated</div>
                      <div matListItemLine>Monthly sales report ready</div>
                      <span class="activity-time">3 hours ago</span>
                    </mat-list-item>
                  </mat-list>
                  
                  <div class="activity-actions">
                    <button mat-button>View All Activity</button>
                    <button mat-button color="primary">Configure Alerts</button>
                  </div>
                </div>
              </ax-card>
            </div>

            <!-- Quick Actions Widget -->
            <div class="demo-item">
              <h4>Quick Actions Widget</h4>
              <ax-card 
                title="Quick Actions" 
                subtitle="Common Tasks"
                appearance="outlined">
                <div class="quick-actions-widget">
                  <div class="actions-grid">
                    <button mat-stroked-button class="action-button">
                      <mat-icon>person_add</mat-icon>
                      <span>Add User</span>
                    </button>
                    
                    <button mat-stroked-button class="action-button">
                      <mat-icon>inventory</mat-icon>
                      <span>New Product</span>
                    </button>
                    
                    <button mat-stroked-button class="action-button">
                      <mat-icon>assessment</mat-icon>
                      <span>Generate Report</span>
                    </button>
                    
                    <button mat-stroked-button class="action-button">
                      <mat-icon>settings</mat-icon>
                      <span>System Config</span>
                    </button>
                    
                    <button mat-stroked-button class="action-button">
                      <mat-icon>backup</mat-icon>
                      <span>Data Backup</span>
                    </button>
                    
                    <button mat-stroked-button class="action-button">
                      <mat-icon>support</mat-icon>
                      <span>Support Ticket</span>
                    </button>
                  </div>
                </div>
              </ax-card>
            </div>
          </div>
        </section>

        <!-- Status Widgets Section -->
        <section class="demo-section">
          <h2 class="section-title">
            <mat-icon>monitor_heart</mat-icon>
            Status & Monitoring Widgets
          </h2>
          <p class="section-description">System status, health monitoring, and real-time data widgets.</p>
          
          <div class="demo-grid">
            <!-- System Status Widget -->
            <div class="demo-item full-width">
              <h4>System Status Dashboard</h4>
              <ax-card 
                title="System Health Monitor" 
                subtitle="Real-time Status"
                appearance="elevated">
                <div class="status-widget">
                  <div class="status-overview">
                    <div class="status-summary">
                      <div class="status-badge operational">
                        <mat-icon>check_circle</mat-icon>
                        <span>All Systems Operational</span>
                      </div>
                      <div class="last-updated">Last updated: {{ currentTime }}</div>
                    </div>
                  </div>
                  
                  <div class="services-status">
                    <div class="service-item">
                      <div class="service-info">
                        <mat-icon class="service-icon">cloud</mat-icon>
                        <span class="service-name">API Gateway</span>
                      </div>
                      <div class="service-status operational">
                        <span class="status-dot"></span>
                        <span>Operational</span>
                      </div>
                      <div class="service-metrics">
                        <span>99.99% uptime</span>
                      </div>
                    </div>
                    
                    <div class="service-item">
                      <div class="service-info">
                        <mat-icon class="service-icon">storage</mat-icon>
                        <span class="service-name">Database</span>
                      </div>
                      <div class="service-status operational">
                        <span class="status-dot"></span>
                        <span>Operational</span>
                      </div>
                      <div class="service-metrics">
                        <span>2.3ms avg response</span>
                      </div>
                    </div>
                    
                    <div class="service-item">
                      <div class="service-info">
                        <mat-icon class="service-icon">security</mat-icon>
                        <span class="service-name">Authentication</span>
                      </div>
                      <div class="service-status operational">
                        <span class="status-dot"></span>
                        <span>Operational</span>
                      </div>
                      <div class="service-metrics">
                        <span>1,234 active sessions</span>
                      </div>
                    </div>
                    
                    <div class="service-item">
                      <div class="service-info">
                        <mat-icon class="service-icon">notification_important</mat-icon>
                        <span class="service-name">Notifications</span>
                      </div>
                      <div class="service-status warning">
                        <span class="status-dot"></span>
                        <span>Degraded</span>
                      </div>
                      <div class="service-metrics">
                        <span>Slight delays in delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ax-card>
            </div>
          </div>
        </section>

      </div>
    </div>`,
  styleUrls: ['./widgets-section.component.scss'],
})
export class WidgetsSectionComponent implements OnInit {
  @Input() searchQuery: string = '';
  @Input() theme: 'light' | 'dark' = 'light';

  // Current time for status widget
  currentTime = new Date().toLocaleTimeString();

  ngOnInit() {
    // Update time every minute for status widget
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString();
    }, 60000);
  }
}
