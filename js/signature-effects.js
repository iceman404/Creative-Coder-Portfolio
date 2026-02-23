/**
 * Signature Visual Effects - Unique Portfolio Experience
 * Effects that make this portfolio impossible to replicate
 */

(function() {
  'use strict';

  const SignatureEffects = {
    init() {
      this.createFloatingCode();
      this.createMatrixRain();
      this.createGlitchEffect();
      this.createCursorTrail();
      this.createTypingSignature();
    },

    createFloatingCode() {
      // Create floating code snippets that follow mouse
      const codeSnippets = [
        'const genius = true;',
        'async function innovate() {}',
        'class SystemsExpert {}',
        'while(learning) { code(); }',
        'if(problem) { solve(); }'
      ];

      const container = document.createElement('div');
      container.id = 'floating-code';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      `;
      document.body.appendChild(container);

      let mouseX = 0, mouseY = 0;
      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      setInterval(() => {
        const snippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        const element = document.createElement('div');
        element.textContent = snippet;
        element.style.cssText = `
          position: absolute;
          left: ${mouseX + (Math.random() - 0.5) * 200}px;
          top: ${mouseY + (Math.random() - 0.5) * 200}px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: rgba(0, 185, 204, 0.6);
          pointer-events: none;
          animation: floatCode 3s ease-out forwards;
          text-shadow: 0 0 10px rgba(0, 185, 204, 0.8);
        `;
        container.appendChild(element);

        setTimeout(() => element.remove(), 3000);
      }, 4000); // Reduced frequency from 2000ms to 4000ms

      // Add animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes floatCode {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.8);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(1.2);
          }
        }
      `;
      document.head.appendChild(style);
    },

    createMatrixRain() {
      // Create subtle matrix-style rain effect
      const canvas = document.createElement('canvas');
      canvas.id = 'matrix-rain';
      canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        opacity: 0.1;
      `;
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const chars = '01アイマン404';
      const fontSize = 14;
      const columns = canvas.width / fontSize;
      const drops = Array(Math.floor(columns)).fill(1);

      function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00b9cc';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          ctx.fillText(text, x, y);

          if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }

      setInterval(draw, 100); // Reduced frequency from 50ms to 100ms (20fps instead of 20fps)

      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
    },

    createGlitchEffect() {
      // Add glitch effect to header on hover
      const header = document.querySelector('header');
      if (!header) return;

      header.addEventListener('mouseenter', () => {
        let glitchCount = 0;
        const glitchInterval = setInterval(() => {
          if (glitchCount++ > 5) {
            clearInterval(glitchInterval);
            header.style.transform = '';
            header.style.filter = '';
            return;
          }

          const offset = (Math.random() - 0.5) * 10;
          header.style.transform = `translateX(${offset}px)`;
          header.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
          
          setTimeout(() => {
            header.style.transform = '';
            header.style.filter = '';
          }, 50);
        }, 50);
      });
    },

    createCursorTrail() {
      // Create signature cursor trail (optimized)
      const trail = [];
      const trailLength = 12; // Reduced from 20
      let lastMouseUpdate = 0;
      const mouseThrottle = 16; // ~60fps max

      document.addEventListener('mousemove', (e) => {
        const now = performance.now();
        if (now - lastMouseUpdate < mouseThrottle) return;
        lastMouseUpdate = now;
        
        trail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
        if (trail.length > trailLength) trail.shift();
      });

      let rafId = null;
      let lastDraw = 0;
      const drawThrottle = 33; // ~30fps for trail

      function drawTrail() {
        const now = performance.now();
        if (now - lastDraw < drawThrottle) {
          rafId = requestAnimationFrame(drawTrail);
          return;
        }
        lastDraw = now;

        const canvas = document.getElementById('cursor-trail') || (() => {
          const c = document.createElement('canvas');
          c.id = 'cursor-trail';
          c.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
          `;
          document.body.appendChild(c);
          return c;
        })();

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        trail.forEach((point, i) => {
          const age = Date.now() - point.time;
          const alpha = 1 - (age / 500);
          const size = (trailLength - i) * 1.5; // Slightly smaller

          if (alpha > 0) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 185, 204, ${alpha * 0.4})`; // Slightly more transparent
            ctx.fill();
          }
        });

        rafId = requestAnimationFrame(drawTrail);
      }

      drawTrail();
    },

    createTypingSignature() {
      // Add signature typing effect to specific elements
      const signature = 'iceman404';
      const elements = document.querySelectorAll('.signature-typing');

      elements.forEach(el => {
        let index = 0;
        const type = () => {
          if (index < signature.length) {
            el.textContent = signature.slice(0, index + 1) + '|';
            index++;
            setTimeout(type, 100);
          } else {
            el.textContent = signature;
          }
        };
        type();
      });
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SignatureEffects.init());
  } else {
    SignatureEffects.init();
  }

  window.SignatureEffects = SignatureEffects;
})();
