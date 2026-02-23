/**
 * Vanilla Theme Manager - Pure JavaScript
 * Uses CSS custom properties and localStorage
 */

(function() {
  'use strict';

  const ThemeManager = {
    currentTheme: 'light',
    listeners: [],

    init() {
      // Check for saved preference or system preference
      const saved = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      this.currentTheme = saved || (systemPrefersDark ? 'dark' : 'light');
      this.applyTheme(this.currentTheme);

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.setTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    },

    getTheme() {
      return this.currentTheme;
    },

    setTheme(theme, save = true) {
      if (save) {
        localStorage.setItem('theme', theme);
      }
      this.currentTheme = theme;
      this.applyTheme(theme);
      this.notifyListeners(theme);
    },

    toggleTheme() {
      this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
    },

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.classList.toggle('dark-theme', theme === 'dark');

      // Update particles container if exists
      const particlesContainer = document.getElementById('particles-js');
      if (particlesContainer) {
        particlesContainer.style.backgroundColor = theme === 'dark' ? '#000000' : '#c0c0c0';
      }
    },

    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    },

    notifyListeners(theme) {
      this.listeners.forEach(listener => listener(theme));
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
  } else {
    ThemeManager.init();
  }

  // Export globally
  window.ThemeManager = ThemeManager;
})();
