import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { GlobalErrorHandler } from './error-handler.service';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
  context?: Record<string, any>;
}

interface UserAction {
  type: 'click' | 'navigation' | 'form_submit' | 'custom';
  element?: string;
  url: string;
  timestamp: number;
  duration?: number;
  context?: Record<string, any>;
}

@Injectable({
  providedIn: 'root',
})
export class MonitoringService {
  private router = inject(Router);
  private errorHandler = inject(GlobalErrorHandler);

  private performanceQueue: PerformanceMetric[] = [];
  private userActionQueue: UserAction[] = [];
  private readonly maxQueueSize = 100;
  private readonly flushInterval = 30000; // 30 seconds
  private flushTimer?: number;

  private navigationStartTime = 0;
  private isInitialized = false;

  initialize(): void {
    if (this.isInitialized) return;

    this.setupPerformanceMonitoring();
    this.setupNavigationTracking();
    this.setupUserActionTracking();
    this.startPeriodicFlush();

    this.isInitialized = true;
    console.log('Monitoring service initialized');
  }

  private setupPerformanceMonitoring(): void {
    // Track Core Web Vitals when available
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackPerformanceMetric({
              name: 'lcp',
              value: entry.startTime,
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent,
              context: {
                element: (entry as any).element?.tagName,
                size: (entry as any).size,
              },
            });
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackPerformanceMetric({
              name: 'fid',
              value: (entry as any).processingStart - entry.startTime,
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent,
              context: {
                eventType: (entry as any).name,
              },
            });
          }
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }

          if (clsValue > 0) {
            this.trackPerformanceMetric({
              name: 'cls',
              value: clsValue,
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent,
            });
          }
        }).observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance monitoring setup failed:', error);
      }
    }

    // Track page load times
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigationTiming = performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceNavigationTiming;

        if (navigationTiming) {
          this.trackPerformanceMetric({
            name: 'page_load_time',
            value:
              navigationTiming.loadEventEnd - navigationTiming.fetchStart,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            context: {
              domContentLoaded:
                navigationTiming.domContentLoadedEventEnd -
                navigationTiming.fetchStart,
              firstByte:
                navigationTiming.responseStart -
                navigationTiming.fetchStart,
              domInteractive:
                navigationTiming.domInteractive -
                navigationTiming.fetchStart,
            },
          });
        }
      }, 0);
    });
  }

  private setupNavigationTracking(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const navigationTime = Date.now() - this.navigationStartTime;

        this.trackUserAction({
          type: 'navigation',
          url: event.url,
          timestamp: Date.now(),
          duration: this.navigationStartTime > 0 ? navigationTime : undefined,
          context: {
            previousUrl:
              event.urlAfterRedirects !== event.url
                ? event.urlAfterRedirects
                : undefined,
          },
        });

        // Track slow navigation
        if (navigationTime > 2000) {
          this.errorHandler.logCustomError(
            `Slow navigation detected: ${event.url}`,
            'warn',
            { navigationTime: `${navigationTime}ms`, url: event.url },
          );
        }
      });

    // Track navigation start
    this.router.events.subscribe(() => {
      this.navigationStartTime = Date.now();
    });
  }

  private setupUserActionTracking(): void {
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (this.shouldTrackClick(target)) {
        this.trackUserAction({
          type: 'click',
          element: this.getElementSelector(target),
          url: window.location.href,
          timestamp: Date.now(),
          context: {
            tagName: target.tagName,
            className: target.className,
            id: target.id,
            text: target.textContent?.slice(0, 100),
          },
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackUserAction({
        type: 'form_submit',
        element: this.getElementSelector(form),
        url: window.location.href,
        timestamp: Date.now(),
        context: {
          action: form.action,
          method: form.method,
          fields: this.getFormFieldNames(form),
        },
      });
    });
  }

  private shouldTrackClick(element: HTMLElement): boolean {
    // Track clicks on buttons, links, and elements with specific classes/attributes
    const trackableElements = ['BUTTON', 'A'];
    const trackableClasses = ['btn', 'button', 'link', 'menu-item'];
    const trackableAttributes = ['data-track', 'data-analytics'];

    return (
      trackableElements.includes(element.tagName) ||
      trackableClasses.some((cls) => element.classList.contains(cls)) ||
      trackableAttributes.some((attr) => element.hasAttribute(attr))
    );
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      return `${element.tagName.toLowerCase()}.${element.className.split(' ')[0]}`;
    }

    return element.tagName.toLowerCase();
  }

  private getFormFieldNames(form: HTMLFormElement): string[] {
    const inputs = form.querySelectorAll('input, select, textarea');
    return Array.from(inputs)
      .map(
        (input) =>
          (input as HTMLInputElement).name || (input as HTMLInputElement).id,
      )
      .filter((name) => name && !name.toLowerCase().includes('password'));
  }

  private trackPerformanceMetric(metric: PerformanceMetric): void {
    this.performanceQueue.push(metric);

    if (this.performanceQueue.length > this.maxQueueSize) {
      this.performanceQueue.shift();
    }

    // Log significant performance issues immediately
    if (
      (metric.name === 'lcp' && metric.value > 4000) ||
      (metric.name === 'fid' && metric.value > 300) ||
      (metric.name === 'cls' && metric.value > 0.25)
    ) {
      this.errorHandler.logCustomError(
        `Poor ${metric.name.toUpperCase()} score: ${metric.value}`,
        'warn',
        { metric: metric.name, value: metric.value, url: metric.url },
      );
    }
  }

  private trackUserAction(action: UserAction): void {
    this.userActionQueue.push(action);

    if (this.userActionQueue.length > this.maxQueueSize) {
      this.userActionQueue.shift();
    }
  }

  private startPeriodicFlush(): void {
    this.flushTimer = window.setInterval(() => {
      this.flushQueues();
    }, this.flushInterval);
  }

  private async flushQueues(): Promise<void> {
    try {
      if (this.performanceQueue.length > 0 || this.userActionQueue.length > 0) {
        const payload = {
          performance: [...this.performanceQueue],
          userActions: [...this.userActionQueue],
          timestamp: Date.now(),
          sessionId: this.getSessionId(),
          url: window.location.href,
        };

        await this.sendMonitoringData(payload);

        // Clear queues after successful send
        this.performanceQueue = [];
        this.userActionQueue = [];
      }
    } catch (error) {
      console.warn('Failed to flush monitoring queues:', error);
    }
  }

  private async sendMonitoringData(data: any): Promise<void> {
    try {
      const response = await fetch('/api/client-monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Monitoring': 'true',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to send monitoring data: ${response.status}`);
      }
    } catch (error) {
      console.warn('Error sending monitoring data:', error);
      throw error;
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('aegisx_session_id');
    if (!sessionId) {
      sessionId =
        'session-' +
        Math.random().toString(36).substr(2, 9) +
        '-' +
        Date.now().toString(36);
      sessionStorage.setItem('aegisx_session_id', sessionId);
    }
    return sessionId;
  }

  // Public methods for manual tracking
  trackCustomMetric(
    name: string,
    value: number,
    context?: Record<string, any>,
  ): void {
    this.trackPerformanceMetric({
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
    });
  }

  trackCustomAction(action: string, context?: Record<string, any>): void {
    this.trackUserAction({
      type: 'custom',
      element: action,
      url: window.location.href,
      timestamp: Date.now(),
      context,
    });
  }

  // Get current statistics
  getQueueStats(): { performance: number; userActions: number } {
    return {
      performance: this.performanceQueue.length,
      userActions: this.userActionQueue.length,
    };
  }

  // Manual flush
  async flush(): Promise<void> {
    await this.flushQueues();
  }

  // Cleanup
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushQueues(); // Send remaining data
  }
}
