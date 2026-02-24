/**
 * Path Helper - Makes navigation work both locally and on GitHub Pages
 * Handles clean URLs (without .html extension)
 * Detects 404 errors and redirects appropriately
 */

(function() {
  'use strict';

  const PathHelper = {
    validRoutes: [
      '/',
      '/bio',
      '/skills',
      '/contacts',
      '/project-html-files/mira',
      '/project-html-files/lora_geofencing',
      '/project-html-files/vision_guardian_commander',
      '/project-html-files/facemood_music_player',
      '/project-html-files/face_counter_system',
      '/project-html-files/fine_tuning_resnet50',
      '/project-html-files/advanced_redis_clone',
      '/project-html-files/open_hardware_drone',
      '/iceman404_control_panel',
      '/404'
    ],

    isLocal() {
      return window.location.protocol === 'file:';
    },

    isGitHubPages() {
      return window.location.hostname.includes('github.io') || 
             window.location.hostname === 'www.iceman404.com' ||
             window.location.hostname === 'iceman404.com';
    },

    getCurrentPath() {
      if (this.isLocal()) {
        const path = window.location.pathname;
        return path.replace(/^.*\//, '').replace(/\.html$/, '') || '/';
      } else {
        return window.location.pathname.replace(/\/$/, '') || '/';
      }
    },

    check404() {
      // Only check on server (not local file://)
      if (this.isLocal()) return;

      const currentPath = this.getCurrentPath();
      const isValidRoute = this.validRoutes.includes(currentPath) || 
                          currentPath.startsWith('/project-html-files/') ||
                          currentPath === '/index.html' ||
                          currentPath === '/404.html';

      // If accessing a .html file directly, redirect to clean URL
      if (currentPath.endsWith('.html') && currentPath !== '/404.html') {
        const cleanPath = currentPath.replace(/\.html$/, '');
        if (cleanPath === '/index') {
          window.location.replace('/');
        } else {
          window.location.replace(cleanPath);
        }
        return;
      }

      // Check if page exists (for GitHub Pages, 404.html is served automatically)
      // For client-side detection, check if we're on a known invalid path
      if (!isValidRoute && currentPath !== '/404' && !currentPath.startsWith('/#')) {
        // Check if it's a static asset request
        const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.avif', '.webp', '.pdf', '.mp3', '.mp4'];
        const isStaticAsset = staticExtensions.some(ext => currentPath.includes(ext));
        
        if (!isStaticAsset) {
          // Redirect to 404 page
          setTimeout(() => {
            if (window.location.pathname === currentPath) {
              window.location.href = '/404';
            }
          }, 100);
        }
      }
    },

    fixPaths() {
      if (this.isLocal()) {
        // Convert absolute paths to relative paths for local testing
        const links = document.querySelectorAll('a[href^="/"]');
        links.forEach(link => {
          const href = link.getAttribute('href');
          // Skip external links and anchors
          if (href.startsWith('//') || href.includes('://') || href.startsWith('/#')) {
            return;
          }
          
          // Convert /bio to bio.html, /contacts to contacts.html, etc.
          const path = href.replace(/^\//, '');
          if (path && !path.includes('.')) {
            link.href = path + '.html';
          } else if (path === '' || path === 'index') {
            link.href = 'index.html';
          }
        });

        // Fix canonical URLs
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
          canonical.href = window.location.href;
        }
      } else {
        // On server: ensure clean URLs (remove .html from links)
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
          const href = link.getAttribute('href');
          // Skip external links, anchors, and data URLs
          if (href.startsWith('//') || href.includes('://') || href.startsWith('/#') || href.startsWith('#')) {
            return;
          }
          
          // Remove .html extension from internal links
          if (href.endsWith('.html') && !href.includes('://')) {
            const cleanHref = href.replace(/\.html$/, '');
            if (cleanHref === 'index' || cleanHref === '/index') {
              link.href = '/';
            } else {
              link.href = cleanHref;
            }
          }
        });
      }
    },

    init() {
      this.fixPaths();
      this.check404();
      
      // Environment detection (no logging for production)
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PathHelper.init());
  } else {
    PathHelper.init();
  }

  window.PathHelper = PathHelper;
})();
