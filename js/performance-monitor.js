/**
 * Vanilla Performance Monitor - Native Web APIs
 * Uses Performance API, no dependencies
 */

(function() {
  'use strict';

  const PerformanceMonitor = {
    metrics: {},
    
    init() {
      // Measure page load performance
      window.addEventListener('load', () => {
        setTimeout(() => this.measurePageLoad(), 1000);
      });

      // Monitor Core Web Vitals if supported
      if ('PerformanceObserver' in window) {
        this.observeCoreWebVitals();
      }
    },

    measurePageLoad() {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (!navigation) return;

      this.metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        dom: navigation.domContentLoadedEventEnd - navigation.responseEnd,
        load: navigation.loadEventEnd - navigation.fetchStart,
        total: navigation.loadEventEnd - navigation.fetchStart
      };

      // Log in development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.table(this.metrics);
      }

      // Send to analytics if available (you can add your analytics here)
      this.reportMetrics();
    },

    observeCoreWebVitals() {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Performance Observer not fully supported
        console.warn('Performance Observer limited support:', e);
      }
    },

    measureFunction(name, fn) {
      const start = performance.now();
      try {
        const result = fn();
        const duration = performance.now() - start;
        this.metrics[`fn_${name}`] = duration;
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        this.metrics[`fn_${name}_error`] = duration;
        throw error;
      }
    },

    async measureAsyncFunction(name, fn) {
      const start = performance.now();
      try {
        const result = await fn();
        const duration = performance.now() - start;
        this.metrics[`async_${name}`] = duration;
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        this.metrics[`async_${name}_error`] = duration;
        throw error;
      }
    },

    reportMetrics() {
      // You can send to your analytics service here
      // Example: navigator.sendBeacon('/api/metrics', JSON.stringify(this.metrics));
    },

    getMetrics() {
      return { ...this.metrics };
    }
  };

  // Initialize
  PerformanceMonitor.init();

  // Export globally
  window.PerformanceMonitor = PerformanceMonitor;
})();
