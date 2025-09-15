import {
  Component,
  Input,
  OnInit,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  icon: string;
}

@Component({
  selector: 'app-component-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ],
  template: `
    <div class="component-preview">
      <!-- Preview Controls -->
      <div class="preview-controls">
        <div class="device-controls" *ngIf="responsive">
          <mat-button-toggle-group
            [(value)]="selectedDevice"
            (change)="onDeviceChange()"
            class="device-toggle"
          >
            <mat-button-toggle
              *ngFor="let device of devices"
              [value]="device.name"
              [matTooltip]="
                device.name + ' (' + device.width + 'x' + device.height + ')'
              "
            >
              <mat-icon>{{ device.icon }}</mat-icon>
              <span class="device-label">{{ device.name }}</span>
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        <div class="action-controls">
          <button
            mat-icon-button
            matTooltip="Reset view"
            (click)="resetPreview()"
          >
            <mat-icon>refresh</mat-icon>
          </button>
          <button
            mat-icon-button
            matTooltip="Toggle fullscreen"
            (click)="toggleFullscreen()"
          >
            <mat-icon>{{
              isFullscreen() ? 'fullscreen_exit' : 'fullscreen'
            }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Loading Bar -->
      <mat-progress-bar
        *ngIf="isLoading()"
        mode="indeterminate"
        class="preview-loading"
      >
      </mat-progress-bar>

      <!-- Preview Container -->
      <div
        class="preview-container"
        [class.fullscreen]="isFullscreen()"
        [style.width]="previewWidth() + 'px'"
        [style.height]="previewHeight() + 'px'"
      >
        <!-- Device Frame (for responsive previews) -->
        <div
          *ngIf="responsive && selectedDevice() !== 'Desktop'"
          class="device-frame"
          [attr.data-device]="selectedDevice()"
        >
          <!-- Mobile/Tablet Frame -->
          <div class="device-screen">
            <div class="preview-content" #previewContent>
              <ng-content></ng-content>

              <!-- Fallback content for specific component demos -->
              <div *ngIf="!hasContent()" class="demo-placeholder">
                <ng-container [ngSwitch]="componentId">
                  <!-- Material Button Demo -->
                  <div *ngSwitchCase="'mat-button'" class="button-demo">
                    <button mat-raised-button color="primary">
                      Primary Button
                    </button>
                    <button mat-raised-button color="accent">
                      Accent Button
                    </button>
                    <button mat-stroked-button>Stroked Button</button>
                  </div>

                  <!-- Material Form Field Demo -->
                  <div *ngSwitchCase="'mat-form-field'" class="form-demo">
                    <mat-form-field appearance="outline">
                      <mat-label>Sample Input</mat-label>
                      <input matInput placeholder="Enter text here" />
                      <mat-hint>This is a hint</mat-hint>
                    </mat-form-field>
                  </div>

                  <!-- Material Card Demo -->
                  <div *ngSwitchCase="'mat-card'" class="card-demo">
                    <mat-card>
                      <mat-card-header>
                        <mat-card-title>Card Title</mat-card-title>
                        <mat-card-subtitle>Card Subtitle</mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>
                        <p>This is the card content area.</p>
                      </mat-card-content>
                      <mat-card-actions>
                        <button mat-button>ACTION 1</button>
                        <button mat-button>ACTION 2</button>
                      </mat-card-actions>
                    </mat-card>
                  </div>

                  <!-- Default placeholder -->
                  <div *ngSwitchDefault class="default-placeholder">
                    <mat-icon class="placeholder-icon">widgets</mat-icon>
                    <h3>{{ componentId | titlecase }}</h3>
                    <p>Interactive preview will appear here</p>
                  </div>
                </ng-container>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop/No Frame Preview -->
        <div
          *ngIf="!responsive || selectedDevice() === 'Desktop'"
          class="desktop-preview"
        >
          <div class="preview-content" #desktopContent>
            <ng-content></ng-content>

            <!-- Same fallback logic for desktop -->
            <div *ngIf="!hasContent()" class="demo-placeholder desktop">
              <ng-container [ngSwitch]="componentId">
                <div *ngSwitchCase="'mat-button'" class="button-demo">
                  <button mat-raised-button color="primary">
                    Primary Button
                  </button>
                  <button mat-raised-button color="accent">
                    Accent Button
                  </button>
                  <button mat-stroked-button>Stroked Button</button>
                  <button mat-flat-button>Flat Button</button>
                </div>

                <div *ngSwitchCase="'mat-form-field'" class="form-demo">
                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>First Name</mat-label>
                      <input matInput placeholder="John" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Last Name</mat-label>
                      <input matInput placeholder="Doe" />
                    </mat-form-field>
                  </div>
                </div>

                <div *ngSwitchDefault class="default-placeholder desktop">
                  <mat-icon class="placeholder-icon">widgets</mat-icon>
                  <h3>{{ componentId | titlecase }}</h3>
                  <p>Component preview for {{ componentId }}</p>
                  <small>Resize to see responsive behavior</small>
                </div>
              </ng-container>
            </div>
          </div>
        </div>

        <!-- Resize Handle -->
        <div
          *ngIf="!responsive"
          class="resize-handle"
          (mousedown)="startResize($event)"
        >
          <mat-icon>drag_indicator</mat-icon>
        </div>
      </div>

      <!-- Preview Info -->
      <div class="preview-info">
        <span class="dimensions">
          {{ previewWidth() }}px × {{ previewHeight() }}px
        </span>
        <span class="device-info" *ngIf="responsive">
          {{ selectedDevice() }}
        </span>
      </div>
    </div>
  `,
  styleUrls: ['./component-preview.component.scss'],
})
export class ComponentPreviewComponent implements OnInit, AfterViewInit {
  @Input() componentId: string = '';
  @Input() responsive: boolean = true;
  @Input() initialWidth: number = 400;
  @Input() initialHeight: number = 300;

  @ViewChild('previewContent') previewContent?: ElementRef;
  @ViewChild('desktopContent') desktopContent?: ElementRef;

  // Signals
  selectedDevice = signal('Desktop');
  isFullscreen = signal(false);
  isLoading = signal(false);
  previewWidth = signal(400);
  previewHeight = signal(300);

  // Device presets for responsive testing
  devices: DevicePreset[] = [
    { name: 'Mobile', width: 375, height: 667, icon: 'phone_android' },
    { name: 'Tablet', width: 768, height: 1024, icon: 'tablet' },
    { name: 'Desktop', width: 1200, height: 800, icon: 'desktop_windows' },
  ];

  private isResizing = false;
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;

  ngOnInit() {
    this.previewWidth.set(this.initialWidth);
    this.previewHeight.set(this.initialHeight);
  }

  ngAfterViewInit() {
    // Set up resize listeners
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  hasContent(): boolean {
    const content =
      this.previewContent?.nativeElement || this.desktopContent?.nativeElement;
    return content && content.children.length > 0;
  }

  onDeviceChange() {
    const device = this.devices.find((d) => d.name === this.selectedDevice());
    if (device) {
      this.previewWidth.set(device.width);
      this.previewHeight.set(device.height);
    }
  }

  resetPreview() {
    this.selectedDevice.set('Desktop');
    this.previewWidth.set(this.initialWidth);
    this.previewHeight.set(this.initialHeight);
    this.isFullscreen.set(false);
  }

  toggleFullscreen() {
    this.isFullscreen.set(!this.isFullscreen());
  }

  startResize(event: MouseEvent) {
    this.isResizing = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = this.previewWidth();
    this.startHeight = this.previewHeight();

    event.preventDefault();
    document.body.style.cursor = 'nw-resize';
  }

  private handleMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    const newWidth = Math.max(200, this.startWidth + deltaX);
    const newHeight = Math.max(150, this.startHeight + deltaY);

    this.previewWidth.set(newWidth);
    this.previewHeight.set(newHeight);

    // Update selected device based on dimensions
    this.updateDeviceFromDimensions(newWidth);
  }

  private handleMouseUp() {
    if (this.isResizing) {
      this.isResizing = false;
      document.body.style.cursor = '';
    }
  }

  private updateDeviceFromDimensions(width: number) {
    if (!this.responsive) return;

    if (width <= 480) {
      this.selectedDevice.set('Mobile');
    } else if (width <= 768) {
      this.selectedDevice.set('Tablet');
    } else {
      this.selectedDevice.set('Desktop');
    }
  }

  ngOnDestroy() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
}
