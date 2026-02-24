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
      this.setupRippleEffect();
    },

    setupRippleEffect() {
      const settings = this.getMouseEffectSettings();
      if (settings.rippleEnabled) {
        document.addEventListener('click', (e) => {
          this.createRipple(e.clientX, e.clientY);
        });
      }
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

    getMouseEffectSettings() {
      const saved = localStorage.getItem('mouseEffects');
      return saved ? JSON.parse(saved) : {
        trailLength: 20,
        particlesEnabled: true,
        magneticEnabled: true,
        rippleEnabled: true
      };
    },

    createCursorTrail() {
      // Enhanced cursor trail with particles and magnetic effects
      const settings = this.getMouseEffectSettings();
      const trail = [];
      const particles = [];
      const trailLength = settings.trailLength || 20;
      let lastMouseUpdate = 0;
      const mouseThrottle = 16; // ~60fps max
      let mouseX = 0, mouseY = 0;
      let lastX = 0, lastY = 0;

      // Magnetic elements
      const magneticElements = document.querySelectorAll('a, button, .magnetic');
      magneticElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
          el.style.transition = 'transform 0.3s ease-out';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transition = '';
          el.style.transform = '';
        });
      });

      document.addEventListener('mousemove', (e) => {
        const now = performance.now();
        if (now - lastMouseUpdate < mouseThrottle) return;
        lastMouseUpdate = now;
        
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Calculate velocity for dynamic effects
        const velocity = Math.sqrt(
          Math.pow(mouseX - lastX, 2) + Math.pow(mouseY - lastY, 2)
        );
        
        trail.push({ 
          x: mouseX, 
          y: mouseY, 
          time: Date.now(),
          velocity: velocity
        });
        if (trail.length > trailLength) trail.shift();

        // Create particles on fast movement
        if (velocity > 10 && settings.particlesEnabled) {
          for (let i = 0; i < Math.min(3, Math.floor(velocity / 20)); i++) {
            particles.push({
              x: mouseX + (Math.random() - 0.5) * 20,
              y: mouseY + (Math.random() - 0.5) * 20,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 1.0,
              decay: 0.02 + Math.random() * 0.03,
              size: 2 + Math.random() * 4
            });
          }
        }

        // Magnetic effect on interactive elements
        if (settings.magneticEnabled) {
          magneticElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distance = Math.sqrt(
              Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
            );
            
            if (distance < 100) {
              const force = (100 - distance) / 100;
              const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
              const moveX = Math.cos(angle) * force * 15;
              const moveY = Math.sin(angle) * force * 15;
              el.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
          });
        }

        // Ripple effect will be handled separately on click

        lastX = mouseX;
        lastY = mouseY;
      });

      let rafId = null;
      let lastDraw = 0;
      const drawThrottle = 16; // ~60fps

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

        // Clear with fade for smooth trails
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw trail with gradient
        trail.forEach((point, i) => {
          const age = Date.now() - point.time;
          const alpha = Math.max(0, 1 - (age / 800));
          const progress = i / trail.length;
          const size = (trailLength - i) * 2 + (point.velocity || 0) * 0.1;

          if (alpha > 0) {
            const gradient = ctx.createRadialGradient(
              point.x, point.y, 0,
              point.x, point.y, size
            );
            gradient.addColorStop(0, `rgba(0, 185, 204, ${alpha * 0.8})`);
            gradient.addColorStop(0.5, `rgba(6, 232, 255, ${alpha * 0.4})`);
            gradient.addColorStop(1, `rgba(0, 185, 204, 0)`);

            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Connect trail points with lines
            if (i > 0) {
              const prevPoint = trail[i - 1];
              ctx.beginPath();
              ctx.moveTo(prevPoint.x, prevPoint.y);
              ctx.lineTo(point.x, point.y);
              ctx.strokeStyle = `rgba(0, 185, 204, ${alpha * 0.3})`;
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }
        });

        // Draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= p.decay;
          p.vy += 0.1; // Gravity

          if (p.life > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 185, 204, ${p.life * 0.6})`;
            ctx.fill();
          } else {
            particles.splice(i, 1);
          }
        }

        rafId = requestAnimationFrame(drawTrail);
      }

      drawTrail();

      // Handle resize
      window.addEventListener('resize', () => {
        const canvas = document.getElementById('cursor-trail');
        if (canvas) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
      });
    },

    createRipple(x, y) {
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        border: 2px solid rgba(0, 185, 204, 0.6);
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        animation: rippleExpand 0.6s ease-out forwards;
      `;
      document.body.appendChild(ripple);

      const style = document.createElement('style');
      style.textContent = `
        @keyframes rippleExpand {
          to {
            width: 200px;
            height: 200px;
            opacity: 0;
            border-width: 1px;
          }
        }
      `;
      if (!document.getElementById('ripple-style')) {
        style.id = 'ripple-style';
        document.head.appendChild(style);
      }

      setTimeout(() => ripple.remove(), 600);
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
