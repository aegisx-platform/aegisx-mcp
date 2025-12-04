import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'ax-maintenance',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="maintenance-page">
      <div class="maintenance-page__container">
        <!-- Illustration -->
        <div class="maintenance-page__illustration">
          <div class="maintenance-page__tools">
            <mat-icon class="maintenance-page__wrench">build</mat-icon>
            <mat-icon class="maintenance-page__gear">settings</mat-icon>
          </div>
          <div class="maintenance-page__server">
            <div class="maintenance-page__server-rack">
              <div class="maintenance-page__server-light"></div>
              <div class="maintenance-page__server-light"></div>
              <div class="maintenance-page__server-light"></div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="maintenance-page__content">
          <span class="maintenance-page__badge">Scheduled Maintenance</span>
          <h1 class="maintenance-page__title">We'll Be Back Soon</h1>
          <p class="maintenance-page__description">
            We're currently performing scheduled maintenance to improve your
            experience. This won't take long - we appreciate your patience!
          </p>

          <!-- Progress -->
          <div class="maintenance-page__progress">
            <div class="maintenance-page__progress-header">
              <span>Estimated progress</span>
              <span>{{ progress() }}%</span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="progress()"
            ></mat-progress-bar>
          </div>

          <!-- Countdown -->
          <div class="maintenance-page__countdown">
            <div class="maintenance-page__time-block">
              <span class="maintenance-page__time-value">{{
                countdown().hours
              }}</span>
              <span class="maintenance-page__time-label">Hours</span>
            </div>
            <span class="maintenance-page__time-sep">:</span>
            <div class="maintenance-page__time-block">
              <span class="maintenance-page__time-value">{{
                countdown().minutes
              }}</span>
              <span class="maintenance-page__time-label">Minutes</span>
            </div>
            <span class="maintenance-page__time-sep">:</span>
            <div class="maintenance-page__time-block">
              <span class="maintenance-page__time-value">{{
                countdown().seconds
              }}</span>
              <span class="maintenance-page__time-label">Seconds</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="maintenance-page__actions">
            <button mat-flat-button color="primary" (click)="refresh()">
              <mat-icon>refresh</mat-icon>
              Check Status
            </button>
            <button mat-stroked-button (click)="subscribe()">
              <mat-icon>notifications</mat-icon>
              Notify Me When Ready
            </button>
          </div>

          <!-- Status Updates -->
          <div class="maintenance-page__updates">
            <h3>
              <mat-icon>update</mat-icon>
              Status Updates
            </h3>
            <ul>
              @for (update of statusUpdates; track update.time) {
                <li>
                  <span class="maintenance-page__update-time">{{
                    update.time
                  }}</span>
                  <span class="maintenance-page__update-text">{{
                    update.text
                  }}</span>
                </li>
              }
            </ul>
          </div>

          <!-- Social Links -->
          <div class="maintenance-page__social">
            <span>Follow us for updates:</span>
            <div class="maintenance-page__social-links">
              <a
                href="https://twitter.com"
                target="_blank"
                aria-label="Twitter"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Background -->
      <div class="maintenance-page__bg">
        <div class="maintenance-page__wave maintenance-page__wave--1"></div>
        <div class="maintenance-page__wave maintenance-page__wave--2"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .maintenance-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ax-background-default);
        position: relative;
        overflow: hidden;
        padding: 2rem;
      }

      .maintenance-page__container {
        text-align: center;
        max-width: 560px;
        position: relative;
        z-index: 1;
      }

      /* Illustration */
      .maintenance-page__illustration {
        position: relative;
        height: 160px;
        margin-bottom: 2rem;
      }

      .maintenance-page__tools {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
      }

      .maintenance-page__wrench {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--ax-brand-default);
        animation: wrench 2s ease-in-out infinite;
        position: absolute;
        left: -40px;
        top: 10px;
      }

      .maintenance-page__gear {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: var(--ax-text-secondary);
        animation: rotate 4s linear infinite;
        position: absolute;
        left: 10px;
        top: 0;
      }

      @keyframes wrench {
        0%,
        100% {
          transform: rotate(-15deg);
        }
        50% {
          transform: rotate(15deg);
        }
      }

      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .maintenance-page__server {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
      }

      .maintenance-page__server-rack {
        width: 100px;
        height: 80px;
        background: var(--ax-background-muted);
        border: 2px solid var(--ax-border-default);
        border-radius: var(--ax-radius-md);
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
        padding: 12px;
      }

      .maintenance-page__server-light {
        width: 100%;
        height: 12px;
        background: var(--ax-background-subtle);
        border-radius: 4px;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--ax-success-default);
          animation: blink 1s ease-in-out infinite;
        }

        &:nth-child(2)::before {
          animation-delay: 0.3s;
        }

        &:nth-child(3)::before {
          animation-delay: 0.6s;
        }
      }

      @keyframes blink {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.3;
        }
      }

      /* Content */
      .maintenance-page__content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
      }

      .maintenance-page__badge {
        display: inline-flex;
        padding: 0.25rem 0.75rem;
        background: var(--ax-warning-subtle, #fef3c7);
        color: var(--ax-warning-emphasis, #92400e);
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 9999px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      :host-context(.dark) .maintenance-page__badge {
        background: oklch(from var(--ax-warning-default) 25% 0.08 h);
        color: var(--ax-warning-default);
      }

      .maintenance-page__title {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--ax-text-heading);
        margin: 0;
      }

      .maintenance-page__description {
        font-size: 1rem;
        color: var(--ax-text-secondary);
        margin: 0;
        line-height: 1.6;
        max-width: 420px;
      }

      /* Progress */
      .maintenance-page__progress {
        width: 100%;
        max-width: 320px;
        margin: 0.5rem 0;

        mat-progress-bar {
          height: 8px;
          border-radius: 4px;
        }
      }

      .maintenance-page__progress-header {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--ax-text-secondary);
        margin-bottom: 0.5rem;
      }

      /* Countdown */
      .maintenance-page__countdown {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0.5rem 0;
      }

      .maintenance-page__time-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 60px;
      }

      .maintenance-page__time-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--ax-text-heading);
        font-variant-numeric: tabular-nums;
      }

      .maintenance-page__time-label {
        font-size: 0.625rem;
        color: var(--ax-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .maintenance-page__time-sep {
        font-size: 2rem;
        font-weight: 700;
        color: var(--ax-text-secondary);
        margin-bottom: 1rem;
      }

      /* Actions */
      .maintenance-page__actions {
        display: flex;
        gap: 1rem;
        margin-top: 0.5rem;
        flex-wrap: wrap;
        justify-content: center;

        button {
          mat-icon {
            margin-right: 0.5rem;
          }
        }
      }

      /* Updates */
      .maintenance-page__updates {
        margin-top: 2rem;
        padding: 1rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        width: 100%;
        text-align: left;

        h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ax-text-heading);
          margin: 0 0 0.75rem 0;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: var(--ax-brand-default);
          }
        }

        ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        li {
          display: flex;
          gap: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--ax-border-default);
          font-size: 0.8125rem;

          &:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
        }
      }

      .maintenance-page__update-time {
        color: var(--ax-text-secondary);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }

      .maintenance-page__update-text {
        color: var(--ax-text-primary);
      }

      /* Social */
      .maintenance-page__social {
        margin-top: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;

        span {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }
      }

      .maintenance-page__social-links {
        display: flex;
        gap: 0.75rem;

        a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--ax-background-muted);
          color: var(--ax-text-secondary);
          transition: all 0.2s;

          svg {
            width: 18px;
            height: 18px;
          }

          &:hover {
            background: var(--ax-brand-default);
            color: white;
          }
        }
      }

      /* Background */
      .maintenance-page__bg {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
      }

      .maintenance-page__wave {
        position: absolute;
        width: 200%;
        height: 200px;
        bottom: 0;
        left: -50%;
        background: var(--ax-brand-default);
        opacity: 0.03;
      }

      .maintenance-page__wave--1 {
        border-radius: 100% 100% 0 0;
        animation: wave 8s ease-in-out infinite;
      }

      .maintenance-page__wave--2 {
        border-radius: 100% 100% 0 0;
        animation: wave 10s ease-in-out infinite reverse;
        opacity: 0.02;
      }

      @keyframes wave {
        0%,
        100% {
          transform: translateX(-25%) translateY(0);
        }
        50% {
          transform: translateX(-25%) translateY(-20px);
        }
      }

      /* Responsive */
      @media (max-width: 640px) {
        .maintenance-page__title {
          font-size: 1.75rem;
        }

        .maintenance-page__countdown {
          gap: 0.25rem;
        }

        .maintenance-page__time-value {
          font-size: 1.5rem;
        }

        .maintenance-page__time-block {
          min-width: 48px;
        }

        .maintenance-page__actions {
          flex-direction: column;
          width: 100%;

          button {
            width: 100%;
          }
        }
      }
    `,
  ],
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  progress = signal(65);
  countdown = signal({ hours: '02', minutes: '34', seconds: '56' });

  statusUpdates = [
    { time: '10:45 AM', text: 'Database migration in progress' },
    { time: '10:30 AM', text: 'Backup completed successfully' },
    { time: '10:00 AM', text: 'Maintenance started' },
  ];

  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    // Simulate countdown
    let totalSeconds = 2 * 3600 + 34 * 60 + 56; // 2h 34m 56s

    this.intervalId = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds--;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        this.countdown.set({
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0'),
        });

        // Update progress
        const initialSeconds = 2 * 3600 + 34 * 60 + 56;
        const progressValue = Math.round(
          ((initialSeconds - totalSeconds) / initialSeconds) * 100,
        );
        this.progress.set(Math.min(progressValue + 65, 99)); // Start at 65%, max 99%
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  refresh(): void {
    window.location.reload();
  }

  subscribe(): void {
    // In real app, show a modal or redirect to subscription page
    alert('You will be notified when maintenance is complete!');
  }
}
