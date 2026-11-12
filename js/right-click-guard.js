/**
 * Right-click guard.
 *
 * Blocks the browser context menu on page content and shows a small,
 * non-blocking notice. Form fields are exempt so paste and spell-check
 * keep working in the contact form.
 *
 * Deliberately does NOT disable DevTools or blur the page: those tricks
 * never stopped anyone, and they broke zoom, docked panels and small
 * windows for real visitors.
 */
(function () {
  'use strict';

  var NOTICE_TEXT = 'This portfolio is protected';
  var notice = null;
  var hideTimer = null;

  function showNotice() {
    if (!notice) {
      notice = document.createElement('div');
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');
      notice.textContent = NOTICE_TEXT;
      notice.style.cssText = [
        'position: fixed',
        'left: 50%',
        'bottom: 28px',
        'transform: translateX(-50%) translateY(8px)',
        'background: rgba(10, 15, 17, 0.92)',
        'color: #e0f4f7',
        'border: 1px solid rgba(74, 155, 168, 0.5)',
        'border-radius: 999px',
        'padding: 10px 20px',
        'font: 600 13px/1 Inter, sans-serif',
        'letter-spacing: 0.3px',
        'box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35)',
        'z-index: 10001',
        'opacity: 0',
        'pointer-events: none',
        'transition: opacity 0.22s ease, transform 0.22s ease'
      ].join(';');
      document.body.appendChild(notice);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      notice.style.opacity = '1';
    } else {
      notice.style.opacity = '1';
      notice.style.transform = 'translateX(-50%) translateY(0)';
    }

    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      notice.style.opacity = '0';
      notice.style.transform = 'translateX(-50%) translateY(8px)';
    }, 1600);
  }

  document.addEventListener('contextmenu', function (event) {
    var target = event.target;
    // Let form fields behave normally (paste menu, spell-check, etc.)
    if (target && target.closest &&
        target.closest('input, textarea, select, [contenteditable="true"]')) {
      return;
    }
    event.preventDefault();
    showNotice();
  });
})();
