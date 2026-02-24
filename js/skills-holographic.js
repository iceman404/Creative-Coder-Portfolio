/**
 * Holographic Skills Visualization
 * Advanced 3D interactive skill cards with particle effects
 */

(function() {
  'use strict';

  const HolographicSkills = {
    particles: [],
    skillCards: [],
    mouse: { x: 0, y: 0 },
    rafId: null,

    init() {
      this.createParticleSystem();
      this.enhanceSkillCards();
      this.setupMouseTracking();
      this.animate();
    },

    createParticleSystem() {
      const container = document.createElement('canvas');
      container.id = 'skills-particles-canvas';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        opacity: 0.6;
      `;
      document.body.appendChild(container);

      const ctx = container.getContext('2d');
      container.width = window.innerWidth;
      container.height = window.innerHeight;

      // Create particles
      for (let i = 0; i < 50; i++) {
        this.particles.push({
          x: Math.random() * container.width,
          y: Math.random() * container.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          life: Math.random(),
          decay: Math.random() * 0.02 + 0.01
        });
      }

      window.addEventListener('resize', () => {
        container.width = window.innerWidth;
        container.height = window.innerHeight;
      });
    },

    enhanceSkillCards() {
      const cards = document.querySelectorAll('.programming-language');
      
      cards.forEach((card, index) => {
        // Check if already enhanced
        if (card.querySelector('.holographic-card-wrapper')) {
          return;
        }

        // Create holographic wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'holographic-card-wrapper';
        
        // Move existing content into wrapper
        const cardContent = document.createElement('div');
        cardContent.className = 'holographic-content';
        while (card.firstChild) {
          cardContent.appendChild(card.firstChild);
        }
        
        // Create holographic layers
        const layers = this.createHolographicLayers(cardContent, index);
        wrapper.appendChild(layers.container);
        
        card.appendChild(wrapper);
        card.style.background = 'transparent';
        card.style.border = 'none';
        card.style.padding = '0';
        card.style.overflow = 'visible';

        // Store card data
        this.skillCards.push({
          element: wrapper,
          card: card,
          index: index,
          tilt: { x: 0, y: 0 },
          targetTilt: { x: 0, y: 0 }
        });

        // Add hover effects
        this.setupCardInteractions(wrapper, index);
      });
    },

    createHolographicLayers(originalContent, index) {
      const container = document.createElement('div');
      container.className = 'holographic-container';
      container.style.cssText = `
        position: relative;
        width: 100%;
        transform-style: preserve-3d;
        transition: transform 0.1s ease-out;
      `;

      // Background glow layer
      const glowLayer = document.createElement('div');
      glowLayer.className = 'holographic-glow';
      glowLayer.style.cssText = `
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        background: linear-gradient(135deg, 
          rgba(0, 185, 204, 0.1) 0%,
          rgba(6, 232, 255, 0.05) 50%,
          rgba(0, 185, 204, 0.1) 100%);
        border-radius: 20px;
        filter: blur(20px);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
      `;
      container.appendChild(glowLayer);

      // Main card layer with glassmorphism
      const mainLayer = document.createElement('div');
      mainLayer.className = 'holographic-main';
      mainLayer.style.cssText = `
        position: relative;
        background: rgba(26, 77, 84, 0.4);
        backdrop-filter: blur(20px) saturate(180%);
        border-radius: 20px;
        border: 1px solid rgba(74, 155, 168, 0.3);
        padding: 25px;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        transform: translateZ(0);
        transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        overflow: hidden;
      `;

      // Animated gradient overlay
      const gradientOverlay = document.createElement('div');
      gradientOverlay.className = 'holographic-gradient';
      gradientOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, 
          transparent,
          rgba(74, 155, 168, 0.2),
          transparent);
        transition: left 0.6s ease;
        pointer-events: none;
        z-index: 1;
      `;
      mainLayer.appendChild(gradientOverlay);

      // Content - clone to preserve structure
      const contentClone = originalContent.cloneNode(true);
      mainLayer.appendChild(contentClone);
      container.appendChild(mainLayer);

      // Holographic reflection layer
      const reflectionLayer = document.createElement('div');
      reflectionLayer.className = 'holographic-reflection';
      reflectionLayer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(180deg, 
          rgba(255, 255, 255, 0.1) 0%,
          transparent 100%);
        border-radius: 20px 20px 0 0;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 2;
      `;
      container.appendChild(reflectionLayer);

      // Particle emitter for this card
      const particleEmitter = document.createElement('div');
      particleEmitter.className = 'particle-emitter';
      particleEmitter.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        pointer-events: none;
        z-index: 3;
      `;
      container.appendChild(particleEmitter);

      return { container, glowLayer, mainLayer, reflectionLayer, gradientOverlay, particleEmitter };
    },

    setupCardInteractions(wrapper, index) {
      const cardData = this.skillCards[index];
      const container = wrapper.querySelector('.holographic-container');
      const glowLayer = wrapper.querySelector('.holographic-glow');
      const reflectionLayer = wrapper.querySelector('.holographic-reflection');
      const gradientOverlay = wrapper.querySelector('.holographic-gradient');
      const mainLayer = wrapper.querySelector('.holographic-main');
      const particleEmitter = wrapper.querySelector('.particle-emitter');

      wrapper.addEventListener('mouseenter', () => {
        glowLayer.style.opacity = '1';
        reflectionLayer.style.opacity = '1';
        mainLayer.style.transform = 'translateZ(20px) scale(1.02)';
        mainLayer.style.borderColor = 'rgba(74, 155, 168, 0.6)';
        mainLayer.style.boxShadow = `
          0 20px 60px rgba(0, 185, 204, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.2)
        `;
        
        // Animate gradient
        gradientOverlay.style.left = '100%';
        setTimeout(() => {
          gradientOverlay.style.left = '-100%';
          gradientOverlay.style.transition = 'none';
          setTimeout(() => {
            gradientOverlay.style.transition = 'left 0.6s ease';
          }, 50);
        }, 600);

        // Emit particles
        this.emitParticles(particleEmitter, 15);
      });

      wrapper.addEventListener('mouseleave', () => {
        glowLayer.style.opacity = '0';
        reflectionLayer.style.opacity = '0';
        mainLayer.style.transform = 'translateZ(0) scale(1)';
        mainLayer.style.borderColor = 'rgba(74, 155, 168, 0.3)';
        mainLayer.style.boxShadow = `
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `;
        // Reset container transform
        container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        cardData.targetTilt = { x: 0, y: 0 };
        cardData.tilt = { x: 0, y: 0 };
        
        // Reset image transform
        const img = mainLayer.querySelector('.progress-container img');
        if (img) {
          img.style.transform = 'scale(1) rotate(0deg)';
          img.style.filter = 'none';
        }
        
        // Reset code block transform
        const codeBlock = mainLayer.querySelector('.code-block');
        if (codeBlock) {
          codeBlock.style.transform = 'translateZ(0)';
        }
      });

      wrapper.addEventListener('mousemove', (e) => {
        // Disable 3D tilt on mobile devices
        if (window.innerWidth <= 879) {
          return;
        }
        
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        cardData.targetTilt = { x: rotateX, y: rotateY };
        container.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    },

    emitParticles(emitter, count) {
      const rect = emitter.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
          position: fixed;
          left: ${centerX}px;
          top: ${centerY}px;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(0, 185, 204, 0.8), transparent);
          border-radius: 50%;
          pointer-events: none;
          z-index: 10000;
          box-shadow: 0 0 10px rgba(0, 185, 204, 0.8);
        `;
        document.body.appendChild(particle);

        const angle = (Math.PI * 2 * i) / count;
        const velocity = 2 + Math.random() * 2;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        let x = centerX;
        let y = centerY;
        let opacity = 1;
        let size = 4;

        const animate = () => {
          x += vx;
          y += vy;
          opacity -= 0.02;
          size += 0.1;

          particle.style.left = x + 'px';
          particle.style.top = y + 'px';
          particle.style.opacity = opacity;
          particle.style.width = size + 'px';
          particle.style.height = size + 'px';

          if (opacity > 0) {
            requestAnimationFrame(animate);
          } else {
            particle.remove();
          }
        };
        animate();
      }
    },

    setupMouseTracking() {
      document.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });
    },

    animate() {
      this.rafId = requestAnimationFrame(() => this.animate());

      // Animate particles
      const canvas = document.getElementById('skills-particles-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= p.decay;

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          // Attract to mouse
          const dx = this.mouse.x - p.x;
          const dy = this.mouse.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 200) {
            p.vx += (dx / distance) * 0.01;
            p.vy += (dy / distance) * 0.01;
          }

          if (p.life > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 185, 204, ${p.life * 0.6})`;
            ctx.fill();
          } else {
            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
            p.life = 1;
          }
        });
      }

      // Smooth tilt interpolation
      this.skillCards.forEach(cardData => {
        cardData.tilt.x += (cardData.targetTilt.x - cardData.tilt.x) * 0.1;
        cardData.tilt.y += (cardData.targetTilt.y - cardData.tilt.y) * 0.1;
      });
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HolographicSkills.init());
  } else {
    HolographicSkills.init();
  }

  window.HolographicSkills = HolographicSkills;
})();
