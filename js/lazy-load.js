/**
 * Vanilla Lazy Loading - Intersection Observer API
 * No dependencies, pure JavaScript
 */

(function() {
  'use strict';

  const LazyLoader = {
    init() {
      // Check if Intersection Observer is supported
      if (!('IntersectionObserver' in window)) {
        // Fallback: load all images immediately
        this.loadAllImages();
        return;
      }

      // Use native lazy loading for images that support it
      const images = document.querySelectorAll('img[data-src]');
      
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              img.loading = 'lazy'; // Native lazy loading
              observer.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px' // Start loading 50px before image enters viewport
      });

      images.forEach(img => imageObserver.observe(img));
    },

    loadAllImages() {
      // Fallback for browsers without Intersection Observer
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LazyLoader.init());
  } else {
    LazyLoader.init();
  }

  // Export globally
  window.LazyLoader = LazyLoader;
})();
