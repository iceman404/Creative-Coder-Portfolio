/**
 * Centralized error handling utility
 * Provides error tracking, logging, and user-friendly error messages
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ timestamp: Date; error: Error; context?: Record<string, unknown> }> = [];

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new Error(event.reason?.message || 'Unhandled promise rejection'),
        { type: 'unhandledRejection', reason: event.reason }
      );
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        type: 'globalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
  }

  handleError(error: Error | AppError, context?: Record<string, unknown>): void {
    const errorEntry = {
      timestamp: new Date(),
      error: error instanceof Error ? error : new Error(String(error)),
      context,
    };

    this.errorLog.push(errorEntry);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught:', errorEntry);
    }

    // In production, send to error tracking service (e.g., Sentry)
    if (import.meta.env.PROD) {
      this.reportToErrorTracking(errorEntry);
    }

    // Show user-friendly error message
    this.showUserError(error);
  }

  private reportToErrorTracking(errorEntry: typeof this.errorLog[0]): void {
    // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
    // Example:
    // Sentry.captureException(errorEntry.error, {
    //   extra: errorEntry.context,
    //   tags: { timestamp: errorEntry.timestamp.toISOString() },
    // });
  }

  private showUserError(error: Error | AppError): void {
    // Only show critical errors to users
    if (error instanceof AppError && error.statusCode < 500) {
      return; // Client errors don't need user notification
    }

    // Create a non-intrusive error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = 'An unexpected error occurred. Please refresh the page.';
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
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  getErrorLog(): typeof this.errorLog {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();
