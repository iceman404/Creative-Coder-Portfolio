/**
 * Performance monitoring and optimization utilities
 */

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  private constructor() {
    this.initializePerformanceObserver();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        // Observe Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            renderTime?: number;
            loadTime?: number;
          };
          this.metrics.set('lcp', lastEntry.renderTime || lastEntry.loadTime || 0);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Observe First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEventTiming;
            this.metrics.set('fid', fidEntry.processingStart - fidEntry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Observe Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const layoutShiftEntry = entry as LayoutShift;
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          });
          this.metrics.set('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.metrics.set(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.metrics.set(`${name}_error`, duration);
      throw error;
    }
  }

  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.metrics.set(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.metrics.set(`${name}_error`, duration);
      throw error;
    }
  }

  getMetrics(): Record<string, number> {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationTiming) {
      return {
        dns: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
        tcp: navigationTiming.connectEnd - navigationTiming.connectStart,
        request: navigationTiming.responseStart - navigationTiming.requestStart,
        response: navigationTiming.responseEnd - navigationTiming.responseStart,
        dom: navigationTiming.domContentLoadedEventEnd - navigationTiming.responseEnd,
        load: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
        ...Object.fromEntries(this.metrics),
      };
    }
    return Object.fromEntries(this.metrics);
  }

  reportMetrics(): void {
    const metrics = this.getMetrics();
    if (import.meta.env.DEV) {
      console.table(metrics);
    }
    // In production, send to analytics service
    if (import.meta.env.PROD && 'sendBeacon' in navigator) {
      navigator.sendBeacon('/api/metrics', JSON.stringify(metrics));
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Lazy load images with intersection observer
 */
export function lazyLoadImages(): void {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(urls: string[]): void {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = url.endsWith('.css') ? 'style' : url.endsWith('.js') ? 'script' : 'fetch';
    document.head.appendChild(link);
  });
}
