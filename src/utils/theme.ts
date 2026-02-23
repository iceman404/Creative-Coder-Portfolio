/**
 * Theme management utility
 */

export type ThemeMode = 'light' | 'dark';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeMode = 'light';
  private listeners: Set<(theme: ThemeMode) => void> = new Set();

  private constructor() {
    this.initializeTheme();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private initializeTheme(): void {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    this.applyTheme(this.currentTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  }

  getTheme(): ThemeMode {
    return this.currentTheme;
  }

  setTheme(theme: ThemeMode, save: boolean = true): void {
    if (save) {
      localStorage.setItem('theme', theme);
    }
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.notifyListeners(theme);
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  private applyTheme(theme: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark-theme', theme === 'dark');

    // Update particles container background
    const particlesContainer = document.getElementById('particles-js');
    if (particlesContainer) {
      particlesContainer.style.backgroundColor = theme === 'dark' ? '#000000' : '#c0c0c0';
    }
  }

  subscribe(listener: (theme: ThemeMode) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(theme: ThemeMode): void {
    this.listeners.forEach((listener) => listener(theme));
  }
}

export const themeManager = ThemeManager.getInstance();
