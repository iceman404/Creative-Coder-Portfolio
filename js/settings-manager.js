/**
 * Settings Manager - Applies theme, font, and effect settings across all pages
 * Centralized configuration system
 */

(function() {
  'use strict';

  const SettingsManager = {
    defaultSettings: {
      theme: 'ar-vr-dark',
      fontPrimary: 'Orbitron',
      fontSecondary: 'Roboto',
      fontSize: 'normal',
      colors: {
        primary: '#00b9cc',
        secondary: '#06e8ff',
        background: '#0a0f11',
        text: '#e0f4f7',
        accent: '#005c66'
      },
      mouseEffects: {
        trailLength: 20,
        particlesEnabled: true,
        magneticEnabled: true,
        rippleEnabled: true,
        trailColor: '#00b9cc'
      },
      animations: {
        enabled: true,
        speed: 'normal',
        particleCount: 800
      },
      particles: {
        enabled: true,
        count: 50,
        color: '#00b9cc'
      }
    },

    init() {
      this.loadSettings();
      this.applySettings();
    },

    loadSettings() {
      const saved = localStorage.getItem('iceman404_settings');
      if (saved) {
        try {
          this.settings = { ...this.defaultSettings, ...JSON.parse(saved) };
        } catch (e) {
          this.settings = { ...this.defaultSettings };
        }
      } else {
        this.settings = { ...this.defaultSettings };
      }
    },

    saveSettings() {
      localStorage.setItem('iceman404_settings', JSON.stringify(this.settings));
      this.applySettings();
    },

    getSettings() {
      return { ...this.settings };
    },

    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings };
      this.saveSettings();
    },

    resetSettings() {
      this.settings = { ...this.defaultSettings };
      this.saveSettings();
    },

    applySettings() {
      const root = document.documentElement;
      const settings = this.settings;

      // Apply theme
      root.setAttribute('data-theme', settings.theme);
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      document.body.classList.add(`theme-${settings.theme}`);

      // Build font styles string
      let fontStyles = '';
      if (settings.fontPrimary) {
        root.style.setProperty('--font-primary', `'${settings.fontPrimary}', sans-serif`);
        document.body.style.setProperty('--font-primary', `'${settings.fontPrimary}', sans-serif`);
        // Apply font to body directly
        document.body.style.fontFamily = `'${settings.fontPrimary}', sans-serif`;
        fontStyles = `
          body,
          nav,
          nav .nav-links a,
          nav .logo,
          .hero h1,
          h1, h2, h3 {
            font-family: '${settings.fontPrimary}', sans-serif !important;
          }
        `;
      }
      if (settings.fontSecondary) {
        root.style.setProperty('--font-secondary', `'${settings.fontSecondary}', sans-serif`);
      }

      // Apply font sizes
      const fontSizeMap = {
        small: '0.875rem',
        normal: '1rem',
        large: '1.125rem',
        xlarge: '1.25rem'
      };
      if (settings.fontSize && fontSizeMap[settings.fontSize]) {
        root.style.setProperty('--font-size-base', fontSizeMap[settings.fontSize]);
      }

      // Remove existing theme style tag if present
      const existingStyle = document.getElementById('iceman404-theme-override');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Apply colors - both CSS variables AND inject style tag to override hardcoded styles
      if (settings.colors) {
        Object.keys(settings.colors).forEach(key => {
          root.style.setProperty(`--color-${key}`, settings.colors[key]);
        });

        // Create style tag with theme overrides
        const styleTag = document.createElement('style');
        styleTag.id = 'iceman404-theme-override';
        styleTag.textContent = `
          /* Theme Override Styles */
          body {
            background-color: ${settings.colors.background} !important;
            color: ${settings.colors.text} !important;
          }
          
          nav {
            background-color: ${this.hexToRgba(settings.colors.background, 0.95)} !important;
          }
          
          nav .nav-links a {
            color: ${settings.colors.text} !important;
          }
          
          nav .nav-links a:hover {
            color: ${settings.colors.primary} !important;
          }
          
          nav .nav-links a::before {
            background: linear-gradient(90deg, ${settings.colors.primary}, ${settings.colors.secondary}) !important;
          }
          
          nav .logo,
          nav .logo-text,
          .hero h1,
          h1,
          h2 {
            background: linear-gradient(135deg, ${settings.colors.primary}, ${settings.colors.secondary}) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
          }
          
          .hero .subtitle {
            color: ${settings.colors.primary} !important;
          }
          
          .hero .tagline {
            color: ${settings.colors.text} !important;
            opacity: 0.8;
          }
          
          .hero-btn {
            border-color: ${this.hexToRgba(settings.colors.primary, 0.5)} !important;
            background: linear-gradient(135deg, ${settings.colors.accent}, ${settings.colors.primary}) !important;
            color: ${settings.colors.text} !important;
          }
          
          .hero-btn:hover {
            border-color: ${settings.colors.primary} !important;
            box-shadow: 0 0 20px ${this.hexToRgba(settings.colors.primary, 0.5)} !important;
          }
          
          nav .logo-cursor {
            background: ${settings.colors.primary} !important;
          }
          
          .background-grid {
            background-image: 
              linear-gradient(${this.hexToRgba(settings.colors.primary, 0.1)} 1px, transparent 1px),
              linear-gradient(90deg, ${this.hexToRgba(settings.colors.primary, 0.1)} 1px, transparent 1px) !important;
          }
          
          a {
            color: ${settings.colors.text} !important;
          }
          
          a:hover {
            color: ${settings.colors.primary} !important;
          }
          
          button {
            color: ${settings.colors.text} !important;
          }
          
          .section-title,
          .card-title,
          h3 {
            color: ${settings.colors.primary} !important;
          }
          
          ${fontStyles}
          
          /* Ensure CV 3D container is not affected by theme overrides */
          #cv-3d-container,
          #cv-3d-container canvas,
          #cv-3d-container * {
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
            z-index: 10 !important;
          }
          
          .cv-canvas-container,
          .cv-canvas-container * {
            position: relative !important;
          }
        `;
        document.head.appendChild(styleTag);

        // Also apply directly to body for immediate effect
        document.body.style.backgroundColor = settings.colors.background;
        document.body.style.color = settings.colors.text;
      }

      // Apply mouse effects settings
      if (settings.mouseEffects) {
        localStorage.setItem('mouseEffects', JSON.stringify(settings.mouseEffects));
      }

      // Apply animation settings
      if (settings.animations) {
        if (!settings.animations.enabled) {
          document.body.style.setProperty('animation-play-state', 'paused');
        } else {
          document.body.style.setProperty('animation-play-state', 'running');
        }
      }

      // Apply particle settings
      if (settings.particles) {
        localStorage.setItem('particleSettings', JSON.stringify(settings.particles));
      }

      // Trigger custom event for other scripts
      window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
    },

    getThemePreset(themeName) {
      const presets = {
        'ar-vr-dark': {
          theme: 'ar-vr-dark',
          colors: {
            primary: '#00b9cc',
            secondary: '#06e8ff',
            background: '#0a0f11',
            text: '#e0f4f7',
            accent: '#005c66'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'grubvox-light': {
          theme: 'grubvox-light',
          colors: {
            primary: '#2d7a87',
            secondary: '#4a9ba8',
            background: '#f5f5f5',
            text: '#1a1a1a',
            accent: '#1a4d55'
          },
          fontPrimary: 'Roboto',
          fontSecondary: 'Roboto'
        },
        'professional-white': {
          theme: 'professional-white',
          colors: {
            primary: '#2563eb',
            secondary: '#3b82f6',
            background: '#ffffff',
            text: '#111827',
            accent: '#1e40af'
          },
          fontPrimary: 'Roboto',
          fontSecondary: 'Roboto'
        },
        'dark-green': {
          theme: 'dark-green',
          colors: {
            primary: '#10b981',
            secondary: '#34d399',
            background: '#0f172a',
            text: '#e2e8f0',
            accent: '#059669'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'cyberpunk': {
          theme: 'cyberpunk',
          colors: {
            primary: '#ff0080',
            secondary: '#00ffff',
            background: '#0a0a0a',
            text: '#00ff00',
            accent: '#ff0080'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'minimal-dark': {
          theme: 'minimal-dark',
          colors: {
            primary: '#ffffff',
            secondary: '#cccccc',
            background: '#000000',
            text: '#ffffff',
            accent: '#666666'
          },
          fontPrimary: 'Roboto',
          fontSecondary: 'Roboto'
        },
        'ocean-blue': {
          theme: 'ocean-blue',
          colors: {
            primary: '#0ea5e9',
            secondary: '#38bdf8',
            background: '#0c4a6e',
            text: '#e0f2fe',
            accent: '#075985'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'sunset-orange': {
          theme: 'sunset-orange',
          colors: {
            primary: '#f97316',
            secondary: '#fb923c',
            background: '#1c1917',
            text: '#fef3c7',
            accent: '#c2410c'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'neon-purple': {
          theme: 'neon-purple',
          colors: {
            primary: '#a855f7',
            secondary: '#c084fc',
            background: '#1e1b2e',
            text: '#e9d5ff',
            accent: '#7c3aed'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'matrix-green': {
          theme: 'matrix-green',
          colors: {
            primary: '#00ff41',
            secondary: '#39ff14',
            background: '#000000',
            text: '#00ff41',
            accent: '#00cc33'
          },
          fontPrimary: 'JetBrains Mono',
          fontSecondary: 'Roboto'
        },
        'midnight-blue': {
          theme: 'midnight-blue',
          colors: {
            primary: '#6366f1',
            secondary: '#818cf8',
            background: '#0f172a',
            text: '#cbd5e1',
            accent: '#4f46e5'
          },
          fontPrimary: 'Inter',
          fontSecondary: 'Roboto'
        },
        'rose-gold': {
          theme: 'rose-gold',
          colors: {
            primary: '#f43f5e',
            secondary: '#fb7185',
            background: '#1f1f23',
            text: '#fce7f3',
            accent: '#be185d'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'aurora-northern': {
          theme: 'aurora-northern',
          colors: {
            primary: '#06b6d4',
            secondary: '#22d3ee',
            background: '#0c1222',
            text: '#e0f2fe',
            accent: '#0891b2'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'emerald-forest': {
          theme: 'emerald-forest',
          colors: {
            primary: '#22c55e',
            secondary: '#4ade80',
            background: '#0a1f0a',
            text: '#dcfce7',
            accent: '#16a34a'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'royal-purple': {
          theme: 'royal-purple',
          colors: {
            primary: '#9333ea',
            secondary: '#a855f7',
            background: '#1a0a2e',
            text: '#f3e8ff',
            accent: '#7e22ce'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'fire-red': {
          theme: 'fire-red',
          colors: {
            primary: '#ef4444',
            secondary: '#f87171',
            background: '#1a0a0a',
            text: '#fee2e2',
            accent: '#dc2626'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'ice-blue': {
          theme: 'ice-blue',
          colors: {
            primary: '#60a5fa',
            secondary: '#93c5fd',
            background: '#0a1628',
            text: '#dbeafe',
            accent: '#3b82f6'
          },
          fontPrimary: 'Inter',
          fontSecondary: 'Roboto'
        },
        'golden-hour': {
          theme: 'golden-hour',
          colors: {
            primary: '#fbbf24',
            secondary: '#fcd34d',
            background: '#1c1917',
            text: '#fef3c7',
            accent: '#d97706'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'deep-space': {
          theme: 'deep-space',
          colors: {
            primary: '#8b5cf6',
            secondary: '#a78bfa',
            background: '#0a0a0f',
            text: '#e9d5ff',
            accent: '#6d28d9'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'sakura-pink': {
          theme: 'sakura-pink',
          colors: {
            primary: '#ec4899',
            secondary: '#f472b6',
            background: '#1a0f1a',
            text: '#fce7f3',
            accent: '#be185d'
          },
          fontPrimary: 'Inter',
          fontSecondary: 'Roboto'
        },
        'volcanic-orange': {
          theme: 'volcanic-orange',
          colors: {
            primary: '#ea580c',
            secondary: '#fb923c',
            background: '#1c0a00',
            text: '#fff7ed',
            accent: '#c2410c'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'arctic-cyan': {
          theme: 'arctic-cyan',
          colors: {
            primary: '#06b6d4',
            secondary: '#22d3ee',
            background: '#0a1620',
            text: '#e0f2fe',
            accent: '#0891b2'
          },
          fontPrimary: 'Space Mono',
          fontSecondary: 'Roboto'
        },
        'lavender-dream': {
          theme: 'lavender-dream',
          colors: {
            primary: '#a78bfa',
            secondary: '#c4b5fd',
            background: '#1e1b2e',
            text: '#f3e8ff',
            accent: '#7c3aed'
          },
          fontPrimary: 'Inter',
          fontSecondary: 'Roboto'
        },
        'neon-cyan': {
          theme: 'neon-cyan',
          colors: {
            primary: '#00ffff',
            secondary: '#80ffff',
            background: '#001a1a',
            text: '#e0ffff',
            accent: '#00cccc'
          },
          fontPrimary: 'JetBrains Mono',
          fontSecondary: 'Roboto'
        },
        'crimson-dark': {
          theme: 'crimson-dark',
          colors: {
            primary: '#dc2626',
            secondary: '#ef4444',
            background: '#1a0000',
            text: '#fee2e2',
            accent: '#991b1b'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'mint-fresh': {
          theme: 'mint-fresh',
          colors: {
            primary: '#10b981',
            secondary: '#34d399',
            background: '#0a1f14',
            text: '#d1fae5',
            accent: '#059669'
          },
          fontPrimary: 'Inter',
          fontSecondary: 'Roboto'
        },
        'cosmic-purple': {
          theme: 'cosmic-purple',
          colors: {
            primary: '#8b5cf6',
            secondary: '#a78bfa',
            background: '#0f0a1a',
            text: '#ede9fe',
            accent: '#6d28d9'
          },
          fontPrimary: 'Orbitron',
          fontSecondary: 'Roboto'
        },
        'kde-breeze-dark': {
          theme: 'kde-breeze-dark',
          colors: {
            primary: '#3daee9',
            secondary: '#93cee9',
            background: '#232629',
            text: '#eff0f1',
            accent: '#2980b9'
          },
          fontPrimary: 'Roboto',
          fontSecondary: 'Roboto'
        },
        'kde-gruvbox-dark': {
          theme: 'kde-gruvbox-dark',
          colors: {
            primary: '#fe8019',
            secondary: '#fabd2f',
            background: '#282828',
            text: '#ebdbb2',
            accent: '#d65d0e'
          },
          fontPrimary: 'JetBrains Mono',
          fontSecondary: 'Roboto'
        },
        'kde-nord': {
          theme: 'kde-nord',
          colors: {
            primary: '#88c0d0',
            secondary: '#81a1c1',
            background: '#2e3440',
            text: '#eceff4',
            accent: '#5e81ac'
          },
          fontPrimary: 'Inter',
          fontSecondary: 'Roboto'
        },
        'kde-dracula': {
          theme: 'kde-dracula',
          colors: {
            primary: '#bd93f9',
            secondary: '#ff79c6',
            background: '#282a36',
            text: '#f8f8f2',
            accent: '#6272a4'
          },
          fontPrimary: 'JetBrains Mono',
          fontSecondary: 'Roboto'
        },
        'kde-sweet-dark': {
          theme: 'kde-sweet-dark',
          colors: {
            primary: '#b48ead',
            secondary: '#a3be8c',
            background: '#1e1e2e',
            text: '#cdd6f4',
            accent: '#89b4fa'
          },
          fontPrimary: 'Inter',
          fontSecondary: 'Roboto'
        },
        'kde-arc-dark': {
          theme: 'kde-arc-dark',
          colors: {
            primary: '#5294e2',
            secondary: '#38a169',
            background: '#2f343f',
            text: '#d3dae3',
            accent: '#2c5282'
          },
          fontPrimary: 'Roboto',
          fontSecondary: 'Roboto'
        },
        'kde-materia-dark': {
          theme: 'kde-materia-dark',
          colors: {
            primary: '#00bcd4',
            secondary: '#4caf50',
            background: '#263238',
            text: '#eceff1',
            accent: '#00838f'
          },
          fontPrimary: 'Roboto',
          fontSecondary: 'Roboto'
        },
        'kde-ant-dark': {
          theme: 'kde-ant-dark',
          colors: {
            primary: '#1890ff',
            secondary: '#52c41a',
            background: '#141414',
            text: '#ffffff',
            accent: '#096dd9'
          },
          fontPrimary: 'Inter',
          fontSecondary: 'Roboto'
        },
        'kde-layan-dark': {
          theme: 'kde-layan-dark',
          colors: {
            primary: '#7c3aed',
            secondary: '#a855f7',
            background: '#1a1625',
            text: '#e9d5ff',
            accent: '#6d28d9'
          },
          fontPrimary: 'Inter',
          fontSecondary: 'Roboto'
        },
        'kde-whitesur-dark': {
          theme: 'kde-whitesur-dark',
          colors: {
            primary: '#007aff',
            secondary: '#5856d6',
            background: '#1d1d1f',
            text: '#f5f5f7',
            accent: '#0051d5'
          },
          fontPrimary: 'Inter',
          fontSecondary: 'Roboto'
        },
        'kde-catppuccin-mocha': {
          theme: 'kde-catppuccin-mocha',
          colors: {
            primary: '#89b4fa',
            secondary: '#f38ba8',
            background: '#1e1e2e',
            text: '#cdd6f4',
            accent: '#74c7ec'
          },
          fontPrimary: 'Inter',
          fontSecondary: 'Roboto'
        },
        'kde-tokyo-night': {
          theme: 'kde-tokyo-night',
          colors: {
            primary: '#7aa2f7',
            secondary: '#bb9af7',
            background: '#1a1b26',
            text: '#c0caf5',
            accent: '#565f89'
          },
          fontPrimary: 'JetBrains Mono',
          fontSecondary: 'Roboto'
        },
        'kde-kanagawa': {
          theme: 'kde-kanagawa',
          colors: {
            primary: '#7e9cd8',
            secondary: '#957fb8',
            background: '#1f1f28',
            text: '#dcd7ba',
            accent: '#727169'
          },
          fontPrimary: 'Inter',
          fontSecondary: 'Roboto'
        },
        'kde-onedark': {
          theme: 'kde-onedark',
          colors: {
            primary: '#61afef',
            secondary: '#c678dd',
            background: '#282c34',
            text: '#abb2bf',
            accent: '#528bff'
          },
          fontPrimary: 'JetBrains Mono',
          fontSecondary: 'Roboto'
        },
        'kde-monokai': {
          theme: 'kde-monokai',
          colors: {
            primary: '#66d9ef',
            secondary: '#f92672',
            background: '#272822',
            text: '#f8f8f2',
            accent: '#ae81ff'
          },
          fontPrimary: 'JetBrains Mono',
          fontSecondary: 'Roboto'
        }
      };
      return presets[themeName] || presets['ar-vr-dark'];
    },

    applyThemePreset(themeName) {
      const preset = this.getThemePreset(themeName);
      this.settings = { ...this.settings, ...preset };
      this.saveSettings();
    },

    hexToRgba(hex, alpha = 1) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SettingsManager.init());
  } else {
    SettingsManager.init();
  }

  window.SettingsManager = SettingsManager;
})();
