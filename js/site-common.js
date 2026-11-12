/**
 * site-common.js — shared client behaviour for every page on the site.
 *
 * Modules (each self-contained, each with optional DOM hooks):
 *   1. Theme      — persists the light/dark choice, paints the toggle icon,
 *                   and broadcasts `themechange` for scene/canvas code.
 *   2. Context menu — blocks right-click with a transient notice;
 *                     form fields are exempt so paste keeps working.
 *   3. Nav state    — highlights the nav item matching the current URL,
 *                     so hardcoded "active" classes become a no-JS
 *                     fallback instead of the source of truth.
 *
 * Contract
 *   - Storage key : 'iceman404-theme' ('light' | 'dark').
 *   - DOM hooks   : #theme-toggle button (optional), input/textarea
 *                   elements (exempt from the context-menu guard).
 *   - Events      : dispatches window CustomEvent 'themechange'
 *                   with { detail: { theme } } on every change.
 *   - Globals     : none. Integration happens through the DOM and events.
 *
 * Every hook is optional by design: pages without a toggle (404) still
 * get the guard, and nothing throws when an element is absent.
 */
(function () {
  'use strict';

  var THEME_KEY = 'iceman404-theme';
  var LIGHT = 'light';
  var DARK = 'dark';

  /* ------------------------------------------------------------------
   * 1. Theme
   * ------------------------------------------------------------------ */

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === LIGHT
      ? LIGHT
      : DARK;
  }

  function storedTheme() {
    try {
      var value = window.localStorage.getItem(THEME_KEY);
      return value === LIGHT || value === DARK ? value : null;
    } catch (err) {
      return null; // storage unavailable (private mode, blocked, etc.)
    }
  }

  function setTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) {
      try {
        window.localStorage.setItem(THEME_KEY, theme);
      } catch (err) {
        /* persistence is best-effort; the choice still applies */
      }
    }
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  /**
   * The icon always shows the theme a click will switch TO, so it must be
   * repainted after both load and every change.
   */
  function paintToggle() {
    var button = document.getElementById('theme-toggle');
    if (!button) return;

    var switchingTo = currentTheme() === LIGHT ? DARK : LIGHT;
    var icon = button.querySelector('i');
    if (icon) icon.className = 'fas fa-' + (switchingTo === LIGHT ? 'sun' : 'moon');
    button.setAttribute(
      'aria-label',
      switchingTo === LIGHT ? 'Switch to light theme' : 'Switch to dark theme'
    );
  }

  function initTheme() {
    // The pre-paint snippet in <head> already applied the stored theme;
    // re-apply here only as a fallback for readers that skipped it.
    var stored = storedTheme();
    if (stored && stored !== currentTheme()) setTheme(stored, false);

    var button = document.getElementById('theme-toggle');
    if (button) {
      button.addEventListener('click', function () {
        setTheme(currentTheme() === LIGHT ? DARK : LIGHT, true);
        paintToggle();
      });
    }
    paintToggle();
  }

  /* ------------------------------------------------------------------
   * 2. Context menu guard
   * ------------------------------------------------------------------ */

  var NOTICE_TEXT = 'This portfolio is protected';
  var noticeEl = null;
  var hideTimer = null;

  function buildNotice() {
    noticeEl = document.createElement('div');
    noticeEl.setAttribute('role', 'status');
    noticeEl.setAttribute('aria-live', 'polite');
    noticeEl.textContent = NOTICE_TEXT;
    noticeEl.style.cssText = [
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
    document.body.appendChild(noticeEl);
  }

  function showNotice() {
    if (!noticeEl) buildNotice();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      noticeEl.style.transition = 'none';
    } else {
      noticeEl.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
      noticeEl.style.transform = 'translateX(-50%) translateY(0)';
    }

    noticeEl.style.opacity = '1';
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      noticeEl.style.opacity = '0';
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        noticeEl.style.transform = 'translateX(-50%) translateY(8px)';
      }
    }, 1600);
  }

  function initContextMenu() {
    document.addEventListener('contextmenu', function (event) {
      var target = event.target;
      // Form fields keep their native menu: paste, spell-check, autofill.
      if (
        target &&
        target.closest &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }
      event.preventDefault();
      showNotice();
    });
  }

  /* ------------------------------------------------------------------
   * 3. Navigation state
   * ------------------------------------------------------------------ */

  /**
   * Matches the current path against root-absolute nav hrefs. The
   * hardcoded class="active" in the HTML stays as the no-JS fallback;
   * this module corrects or completes it at runtime.
   */
  function initNav() {
    var path = window.location.pathname
      .replace(/\/+$/, '')
      .replace(/\.html$/, '') || '/';
    if (path === '/index') path = '/';

    var links = document.querySelectorAll('.nav-links a[href]');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.getAttribute('href');

      // Only root-absolute page links participate; anchors (#projects),
      // file downloads (resume) and external URLs are never auto-active.
      if (!href || href.charAt(0) !== '/' || href.indexOf('.') !== -1) continue;

      var target = href.replace(/\/+$/, '') || '/';
      var isActive = target === path ||
        (target !== '/' && path.indexOf(target + '/') === 0);

      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  }

  /* ------------------------------------------------------------------
   * Entry point
   * ------------------------------------------------------------------ */

  function init() {
    initTheme();
    initNav();
    initContextMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
