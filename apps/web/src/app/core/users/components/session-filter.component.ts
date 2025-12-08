import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { AxCardComponent } from '@aegisx/ui';
import { SessionFilters } from '../../user-profile/components/activity-log/sessions.types';

@Component({
  selector: 'ax-session-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    AxCardComponent,
  ],
  template: `
    <ax-card [appearance]="'elevated'" class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Filter Sessions</h3>
        <button mat-icon-button (click)="toggleExpanded()">
          <mat-icon>{{
            isExpanded() ? 'expand_less' : 'expand_more'
          }}</mat-icon>
        </button>
      </div>

      @if (isExpanded()) {
        <div class="space-y-4">
          <!-- Status Filter -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <mat-form-field class="w-full">
              <mat-label>Session Status</mat-label>
              <mat-select [(ngModel)]="statusFilter">
                <mat-option value="">All Sessions</mat-option>
                <mat-option value="active">Active Only</mat-option>
                <mat-option value="inactive">Inactive Only</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Device Type Filter -->
            <mat-form-field class="w-full">
              <mat-label>Device Type</mat-label>
              <mat-select [(ngModel)]="deviceTypeFilter">
                <mat-option value="">All Devices</mat-option>
                <mat-option value="mobile">Mobile</mat-option>
                <mat-option value="desktop">Desktop</mat-option>
                <mat-option value="tablet">Tablet</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Date From -->
            <mat-form-field class="w-full">
              <mat-label>Date From</mat-label>
              <input matInput type="date" [(ngModel)]="dateFromFilter" />
              <mat-icon matSuffix>calendar_today</mat-icon>
            </mat-form-field>

            <!-- Date To -->
            <mat-form-field class="w-full">
              <mat-label>Date To</mat-label>
              <input matInput type="date" [(ngModel)]="dateToFilter" />
              <mat-icon matSuffix>calendar_today</mat-icon>
            </mat-form-field>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-2 pt-4">
            <button
              mat-stroked-button
              (click)="onClearFilters()"
              class="flex items-center gap-2"
            >
              <mat-icon>clear</mat-icon>
              <span>Clear Filters</span>
            </button>
            <button
              mat-raised-button
              color="primary"
              (click)="onApplyFilters()"
              class="flex items-center gap-2"
            >
              <mat-icon>search</mat-icon>
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      }
    </ax-card>
  `,
  styles: [
    `
      mat-form-field {
        width: 100%;
      }

      ::ng-deep .mat-mdc-form-field {
        width: 100%;
      }
    `,
  ],
})
export class SessionFilterComponent {
  @Output() filtersChange = new EventEmitter<SessionFilters>();

  isExpanded = signal(false);

  statusFilter = '';
  deviceTypeFilter = '';
  dateFromFilter = '';
  dateToFilter = '';

  toggleExpanded() {
    this.isExpanded.update((value) => !value);
  }

  onApplyFilters() {
    const filters: SessionFilters = {
      page: 1,
      limit: 10,
    };

    if (this.statusFilter) {
      filters.status = this.statusFilter as 'active' | 'inactive';
    }

    if (this.deviceTypeFilter) {
      filters.deviceType = this.deviceTypeFilter as
        | 'mobile'
        | 'desktop'
        | 'tablet';
    }

    if (this.dateFromFilter) {
      filters.dateFrom = new Date(this.dateFromFilter)
        .toISOString()
        .split('T')[0];
    }

    if (this.dateToFilter) {
      filters.dateTo = new Date(this.dateToFilter).toISOString().split('T')[0];
    }

    this.filtersChange.emit(filters);
  }

  onClearFilters() {
    this.statusFilter = '';
    this.deviceTypeFilter = '';
    this.dateFromFilter = '';
    this.dateToFilter = '';

    const filters: SessionFilters = {
      page: 1,
      limit: 10,
    };

    this.filtersChange.emit(filters);
  }
}
