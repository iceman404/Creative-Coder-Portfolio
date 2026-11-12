/**
 * Three.js Signature Scene - Unique 3D Portfolio Experience
 * This creates a signature visual experience that's impossible to replicate
 */

(function() {
  'use strict';

  const ThreeScene = {
    scene: null,
    camera: null,
    renderer: null,
    particles: null,
    mouse: { x: 0, y: 0 },
    isInitialized: false,

    init() {
      if (this.isInitialized) return;
      
      const container = document.getElementById('particles-js');
      if (!container) {
        return;
      }

      // Create scene
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x000000, 0.001);

      // Create camera
      const width = container.clientWidth;
      const height = container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      this.camera.position.z = 1000;

      // Create renderer (optimized settings)
      this.renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: false, // Disable antialiasing for better performance
        powerPreference: "high-performance"
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Reduced from 2
      this.renderer.setClearColor(0x000000, 0);
      
      // Insert before existing content
      container.insertBefore(this.renderer.domElement, container.firstChild);
      this.renderer.domElement.style.position = 'absolute';
      this.renderer.domElement.style.top = '0';
      this.renderer.domElement.style.left = '0';
      this.renderer.domElement.style.zIndex = '1';
      this.renderer.domElement.style.pointerEvents = 'none';

      // Create signature particle system
      this.createSignatureParticles();

      // Mouse tracking
      this.setupMouseTracking();
      
      // Animation loop
      this.animate();
      
      // Handle resize
      window.addEventListener('resize', () => this.handleResize());
      
      this.isInitialized = true;

      this.applyTheme();
      window.addEventListener('themechange', () => this.applyTheme());
    },

  getParticlePalette() {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    return light ? [0x0e7285, 0x128397, 0x0a5f6e] : [0x00b9cc, 0x06e8ff, 0x00ccdd];
  },

  applyTheme() {
    if (!this.isInitialized) return;
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    if (this.scene && this.scene.fog) this.scene.fog.color.set(light ? 0xf5f8f9 : 0x000000);
    if (this.particles && this.particles.material) {
      this.particles.material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      this.particles.material.needsUpdate = true;
      const attr = this.particles.geometry.getAttribute('color');
      if (attr) {
        const palette = this.getParticlePalette();
        const c = [new THREE.Color(palette[0]), new THREE.Color(palette[1]), new THREE.Color(palette[2])];
        for (let i = 0; i < attr.count; i++) {
          const pick = c[i % 3];
          attr.setXYZ(i, pick.r, pick.g, pick.b);
        }
        attr.needsUpdate = true;
      }
    }
  },

    createSignatureParticles() {
      const particleCount = 800; // Reduced from 2000 for better performance
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      const palette = this.getParticlePalette();
      const color1 = new THREE.Color(palette[0]);
      const color2 = new THREE.Color(palette[1]);
      const color3 = new THREE.Color(palette[2]);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Create a unique spiral distribution
        const radius = Math.random() * 2000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        // Color variation
        const colorChoice = Math.random();
        let color;
        if (colorChoice < 0.33) color = color1;
        else if (colorChoice < 0.66) color = color2;
        else color = color3;

        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        sizes[i] = Math.random() * 3 + 1;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          mouse: { value: new THREE.Vector2() }
        },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          uniform float time;
          uniform vec2 mouse;
          
          void main() {
            // Use Three.js built-in color attribute (already defined when vertexColors: true)
            vColor = color;
            vec3 pos = position;
            
            // Create unique wave motion
            float wave = sin(time * 0.5 + pos.x * 0.01) * cos(time * 0.3 + pos.y * 0.01);
            pos.z += wave * 50.0;
            
            // Mouse interaction
            vec2 mouseEffect = (mouse - vec2(pos.x, pos.y) * 0.001) * 100.0;
            pos.xy += mouseEffect;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          
          void main() {
            float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
            float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
            gl_FragColor = vec4(vColor, alpha * 0.8);
          }
        `,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending
      });

      this.particles = new THREE.Points(geometry, material);
      this.scene.add(this.particles);
    },

    setupMouseTracking() {
      let rafId = null;
      let lastUpdate = 0;
      const throttleDelay = 16; // ~60fps max
      
      document.addEventListener('mousemove', (e) => {
        const now = performance.now();
        if (now - lastUpdate < throttleDelay) {
          if (!rafId) {
            rafId = requestAnimationFrame(() => {
              this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
              this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
              
              if (this.particles) {
                this.particles.material.uniforms.mouse.value.set(
                  this.mouse.x * 500,
                  this.mouse.y * 500
                );
              }
              lastUpdate = performance.now();
              rafId = null;
            });
          }
          return;
        }
        
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        if (this.particles) {
          this.particles.material.uniforms.mouse.value.set(
            this.mouse.x * 500,
            this.mouse.y * 500
          );
        }
        lastUpdate = now;
      });
    },

    animate() {
      requestAnimationFrame(() => this.animate());

      if (!this.scene || !this.camera || !this.renderer) return;

      // Use performance.now() for smoother animation
      const time = performance.now() * 0.001;
      
      // Throttle rendering if page is not visible
      if (document.hidden) {
        return;
      }

      // Animate particles (optimized - use rotation instead of recalculating positions)
      if (this.particles) {
        this.particles.rotation.y = time * 0.1;
        this.particles.material.uniforms.time.value = time;
        // Removed expensive position recalculation - rotation handles movement
      }

      // Camera movement (reduced sensitivity for smoother performance)
      this.camera.position.x += (this.mouse.x * 30 - this.camera.position.x) * 0.03; // Reduced from 50 and 0.05
      this.camera.position.y += (-this.mouse.y * 30 - this.camera.position.y) * 0.03;

      this.renderer.render(this.scene, this.camera);
    },

    handleResize() {
      const container = document.getElementById('particles-js');
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  };

  // Wait for Three.js to load
  function initThreeScene() {
    if (typeof THREE !== 'undefined') {
      // Small delay to ensure DOM is ready
      setTimeout(() => ThreeScene.init(), 100);
    } else {
      // Retry if Three.js not loaded yet
      setTimeout(initThreeScene, 100);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeScene);
  } else {
    initThreeScene();
  }

  window.ThreeScene = ThreeScene;
})();
