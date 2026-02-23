/**
 * Vanilla Error Handler - Systems-Level Approach
 * No dependencies, pure JavaScript
 */

(function() {
  'use strict';

  const ErrorHandler = {
    errors: [],
    maxErrors: 50,

    init() {
      // Global error handler
      window.addEventListener('error', (event) => {
        this.handleError({
          message: event.message,
          source: event.filename,
          line: event.lineno,
          column: event.colno,
          error: event.error
        });
      });

      // Unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError({
          message: event.reason?.message || 'Unhandled promise rejection',
          error: event.reason
        });
      });
    },

    handleError(errorInfo) {
      const error = {
        timestamp: new Date().toISOString(),
        ...errorInfo
      };

      // Store error (limit to prevent memory issues)
      this.errors.push(error);
      if (this.errors.length > this.maxErrors) {
        this.errors.shift();
      }

      // Log in development (check for localhost or dev flag)
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error('Error caught:', error);
      }

      // Show user-friendly notification for critical errors
      if (this.isCriticalError(error)) {
        this.showNotification('An unexpected error occurred. Please refresh the page.');
      }
    },

    isCriticalError(error) {
      // Only show critical errors (5xx type)
      return error.error?.statusCode >= 500 || !error.error;
    },

    showNotification(message) {
      // Remove existing notification
      const existing = document.querySelector('.error-notification');
      if (existing) existing.remove();

      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }, 5000);
    },

    getErrors() {
      return [...this.errors];
    }
  };

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ErrorHandler.init());
  } else {
    ErrorHandler.init();
  }

  // Export globally
  window.ErrorHandler = ErrorHandler;
})();
