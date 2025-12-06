import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AxKpiCardComponent } from '@aegisx/ui';

@Component({
  selector: 'app-drugs-list-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, AxKpiCardComponent],
  template: `
    <!-- Header with Stats Summary -->
    <div class="flex items-start justify-between mt-4">
      <div class="flex-1">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-semibold text-[var(--ax-text-default)]">
            Drugs
          </h1>
        </div>
        <p class="text-sm text-[var(--ax-text-secondary)]">
          Manage your drug collection
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          mat-flat-button
          color="primary"
          (click)="createClicked.emit()"
          [disabled]="loading || hasError"
        >
          <mat-icon>add</mat-icon>
          Add drug
        </button>
      </div>
    </div>

    <!-- Permission Error -->
    @if (permissionError) {
      <div
        class="bg-[var(--ax-error-faint)] border border-[var(--ax-error-border)] rounded-lg p-2 mb-6"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex items-center justify-center w-18 h-18 bg-[var(--ax-error-surface)] rounded-full flex-shrink-0"
          >
            <mat-icon class="text-[var(--ax-error-default)] !text-4xl !w-7 !h-7"
              >lock</mat-icon
            >
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-medium text-[var(--ax-error-emphasis)]">
              Access Denied
            </h3>
            <p class="text-sm text-[var(--ax-error-default)]">
              You don't have permission to access or modify drugs.
            </p>
          </div>
          <button
            (click)="clearPermissionError.emit()"
            class="text-[var(--ax-error-default)] hover:text-[var(--ax-error-hover)]"
          >
            <mat-icon class="!text-xl !w-5 !h-5">close</mat-icon>
          </button>
        </div>
      </div>
    }

    <!-- Stats Cards using AxKpiCardComponent (hide when any error exists) -->
    @if (!hasError) {
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 mb-4"
      >
        <ax-kpi-card
          [flat]="true"
          label="Total Drugs"
          [value]="stats.total"
          variant="simple"
        ></ax-kpi-card>

        <ax-kpi-card
          [flat]="true"
          label="Available"
          [value]="stats.available"
          variant="badge"
          [badge]="getPercentage(stats.available) + '%'"
          badgeType="success"
        ></ax-kpi-card>

        <ax-kpi-card
          [flat]="true"
          label="Unavailable"
          [value]="stats.unavailable"
          variant="badge"
          [badge]="getPercentage(stats.unavailable) + '%'"
          badgeType="error"
        ></ax-kpi-card>

        <ax-kpi-card
          [flat]="true"
          label="This Week"
          [value]="stats.recentWeek"
          variant="simple"
        ></ax-kpi-card>
      </div>
    }
  `,
  styles: [],
})
export class DrugsListHeaderComponent {
  @Input({ required: true }) stats!: {
    total: number;
    available: number;
    unavailable: number;
    recentWeek: number;
  };
  @Input() loading = false;
  @Input() permissionError = false;
  @Input() hasError = false; // General error state (from service)

  @Output() createClicked = new EventEmitter<void>();
  @Output() clearPermissionError = new EventEmitter<void>();

  getPercentage(count: number): number {
    return this.stats.total > 0
      ? Math.round((count / this.stats.total) * 100)
      : 0;
  }
}
