/**
 * Particles Click Limiter
 * Prevents browser crashes from excessive particle clicks
 */

(function() {
  'use strict';

  // Click throttling for particles
  let lastClickTime = 0;
  let clickCount = 0;
  const CLICK_COOLDOWN = 200; // Minimum 200ms between clicks
  const MAX_CLICKS_PER_SECOND = 3; // Max 3 clicks per second
  const MAX_PARTICLES = 500; // Maximum particles allowed

  // Override particles.js click handler if it exists
  document.addEventListener('DOMContentLoaded', () => {
    const particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) return;

    // Find canvas element
    const canvas = particlesContainer.querySelector('canvas');
    if (!canvas) return;

    // Wrap click handler
    const originalClickHandler = canvas.onclick;
    
    canvas.addEventListener('click', (e) => {
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime;
      
      // Throttle clicks
      if (timeSinceLastClick < CLICK_COOLDOWN) {
        return;
      }

      // Reset counter if more than 1 second passed
      if (timeSinceLastClick > 1000) {
        clickCount = 0;
      }

      // Limit clicks per second
      if (clickCount >= MAX_CLICKS_PER_SECOND) {
        return;
      }

      // Check particle count (if accessible)
      if (window.pJSDom && window.pJSDom[0]) {
        const pJS = window.pJSDom[0].pJS;
        if (pJS && pJS.particles && pJS.particles.array) {
          const currentParticleCount = pJS.particles.array.length;
          if (currentParticleCount >= MAX_PARTICLES) {
            return; // Don't add more particles if limit reached
          }
        }
      }

      // Allow click
      clickCount++;
      lastClickTime = now;

      // Call original handler if it exists
      if (originalClickHandler) {
        originalClickHandler.call(canvas, e);
      }
    }, true); // Use capture phase to intercept early
  });
})();
