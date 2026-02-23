/**
 * Main application entry point
 * Initializes error handling, performance monitoring, and theme management
 */

import { errorHandler } from './utils/errorHandler';
import { performanceMonitor, lazyLoadImages } from './utils/performance';
import { themeManager } from './utils/theme';
import '../styles/base.css';
import '../styles/components.css';

// Initialize error handling
errorHandler.handleError(new Error('Application initialized'));

// Initialize performance monitoring
performanceMonitor.reportMetrics();

// Initialize lazy loading for images
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', lazyLoadImages);
} else {
  lazyLoadImages();
}

// Initialize theme management
const themeToggleButton = document.getElementById('theme-toggle');
if (themeToggleButton) {
  themeToggleButton.addEventListener('click', () => {
    themeManager.toggleTheme();
  });
}

// Report performance metrics on page load
window.addEventListener('load', () => {
  setTimeout(() => {
    performanceMonitor.reportMetrics();
  }, 2000);
});

// Export for use in other modules
export { errorHandler, performanceMonitor, themeManager };
