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
    signatureGeometry: null,
    signatureMesh: null,
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
      
      // Create 3D signature text
      this.createSignatureText();
      
      // Create interactive mesh
      this.createInteractiveMesh();

      // Mouse tracking
      this.setupMouseTracking();
      
      // Animation loop
      this.animate();
      
      // Handle resize
      window.addEventListener('resize', () => this.handleResize());
      
      this.isInitialized = true;
    },

    createSignatureParticles() {
      const particleCount = 800; // Reduced from 2000 for better performance
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      const color1 = new THREE.Color(0x00b9cc);
      const color2 = new THREE.Color(0x06e8ff);
      const color3 = new THREE.Color(0x00ccdd);

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

    createSignatureText() {
      // Create unique 3D geometry pattern
      const group = new THREE.Group();
      
      // Create iceman404 signature pattern (reduced complexity)
      const geometry = new THREE.TorusKnotGeometry(50, 10, 64, 12); // Reduced segments from 100/16 to 64/12
      const material = new THREE.MeshPhongMaterial({
        color: 0x00b9cc,
        emissive: 0x001122,
        shininess: 100,
        transparent: true,
        opacity: 0.6
      });
      
      this.signatureMesh = new THREE.Mesh(geometry, material);
      this.signatureMesh.position.set(0, 0, 0);
      group.add(this.signatureMesh);

      // Add rotating rings (reduced count and complexity)
      for (let i = 0; i < 3; i++) { // Reduced from 5 to 3
        const ringGeometry = new THREE.TorusGeometry(60 + i * 20, 2, 8, 32); // Reduced segments from 50 to 32
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.5 + i * 0.1, 1, 0.5),
          transparent: true,
          opacity: 0.3
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.rotation.z = i * Math.PI / 5;
        group.add(ring);
      }

      // Add lights
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      this.scene.add(ambientLight);
      
      const pointLight = new THREE.PointLight(0x00b9cc, 1, 1000);
      pointLight.position.set(0, 0, 200);
      this.scene.add(pointLight);

      this.signatureGeometry = group;
      this.scene.add(group);
    },

    createInteractiveMesh() {
      // Create a unique interactive mesh that responds to mouse
      const geometry = new THREE.IcosahedronGeometry(100, 1);
      const material = new THREE.MeshPhongMaterial({
        color: 0x06e8ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
        emissive: 0x001133
      });
      
      this.interactiveMesh = new THREE.Mesh(geometry, material);
      this.interactiveMesh.position.set(0, 0, -200);
      this.scene.add(this.interactiveMesh);
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

      // Animate signature geometry
      if (this.signatureGeometry) {
        this.signatureGeometry.rotation.x = time * 0.2;
        this.signatureGeometry.rotation.y = time * 0.3;
        this.signatureGeometry.rotation.z = time * 0.1;
        
        // Pulse effect
        const scale = 1 + Math.sin(time * 2) * 0.1;
        this.signatureGeometry.scale.set(scale, scale, scale);
      }

      // Animate interactive mesh
      if (this.interactiveMesh) {
        this.interactiveMesh.rotation.x = time * 0.5;
        this.interactiveMesh.rotation.y = time * 0.3;
        
        // Mouse interaction
        this.interactiveMesh.position.x = this.mouse.x * 100;
        this.interactiveMesh.position.y = this.mouse.y * 100;
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
