/**
 * AR Mode 3D Cube Component for Skills Page
 * Cubes rest in 3D pose, descriptions project into 3D space on hover
 */

(function() {
  'use strict';

  const Skills3DCube = {
    cubes: [],
    rafId: null,

    init() {
      if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded, falling back to regular cards');
        return;
      }

      this.createCubes();
      this.animate();
      this.setupResize();
    },

    createCubes() {
      const skillCards = document.querySelectorAll('.programming-language');
      
      skillCards.forEach((card, index) => {
        // Store original content
        const originalContent = card.innerHTML;
        const codeBlock = card.querySelector('.code-block');
        const progressContainer = card.querySelector('.progress-container');
        
        // Extract text content for 3D projection
        const skillText = codeBlock ? codeBlock.textContent.trim() : '';
        const skillTitle = progressContainer ? progressContainer.querySelector('img')?.alt || '' : '';
        
        // Create container
        const container = document.createElement('div');
        container.className = 'cube-container-ar';
        container.style.cssText = `
          width: 100%;
          min-height: 300px;
          position: relative;
          margin-bottom: 20px;
          perspective: 1200px;
          perspective-origin: center center;
        `;

        const canvas = document.createElement('canvas');
        canvas.className = 'cube-canvas-ar';
        canvas.style.cssText = `
          width: 100%;
          height: 100%;
          display: block;
          position: absolute;
          top: 0;
          left: 0;
        `;
        container.appendChild(canvas);

        // Create info overlay (hidden initially, shows on hover)
        const infoOverlay = document.createElement('div');
        infoOverlay.className = 'cube-info-overlay';
        infoOverlay.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          pointer-events: none;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.4s ease;
        `;
        infoOverlay.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            ${progressContainer ? progressContainer.outerHTML : ''}
            <div style="margin-top: 15px; font-size: 0.9rem; color: #e0f4f7; line-height: 1.6;">
              ${codeBlock ? codeBlock.innerHTML : ''}
            </div>
          </div>
        `;
        container.appendChild(infoOverlay);

        // Replace card content
        card.innerHTML = '';
        card.appendChild(container);
        card.style.overflow = 'visible';
        card.style.background = 'transparent';
        card.style.border = 'none';
        card.style.padding = '0';

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          50,
          container.offsetWidth / 300,
          0.1,
          1000
        );
        const renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          alpha: true,
          antialias: true
        });
        renderer.setSize(container.offsetWidth, 300);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Get colors from settings
        const settings = window.SettingsManager?.getSettings();
        const primaryColor = settings?.colors?.primary || '#00b9cc';
        const secondaryColor = settings?.colors?.secondary || '#06e8ff';
        
        // Convert hex to RGB
        const hexToRgb = (hex) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
          } : { r: 0, g: 0.725, b: 0.8 };
        };
        
        const primaryRGB = hexToRgb(primaryColor);
        const secondaryRGB = hexToRgb(secondaryColor);

        // Create cube geometry (slightly larger for AR effect)
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        
        // Create materials with AR-style transparency
        const materials = [
          new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(primaryRGB.r, primaryRGB.g, primaryRGB.b),
            transparent: true, 
            opacity: 0.3,
            emissive: new THREE.Color(primaryRGB.r * 0.3, primaryRGB.g * 0.3, primaryRGB.b * 0.3),
            shininess: 100
          }),
          new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(secondaryRGB.r, secondaryRGB.g, secondaryRGB.b),
            transparent: true, 
            opacity: 0.3,
            emissive: new THREE.Color(secondaryRGB.r * 0.3, secondaryRGB.g * 0.3, secondaryRGB.b * 0.3),
            shininess: 100
          }),
          new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(primaryRGB.r, primaryRGB.g, primaryRGB.b),
            transparent: true, 
            opacity: 0.25,
            emissive: new THREE.Color(primaryRGB.r * 0.2, primaryRGB.g * 0.2, primaryRGB.b * 0.2),
            shininess: 100
          }),
          new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(secondaryRGB.r, secondaryRGB.g, secondaryRGB.b),
            transparent: true, 
            opacity: 0.25,
            emissive: new THREE.Color(secondaryRGB.r * 0.2, secondaryRGB.g * 0.2, secondaryRGB.b * 0.2),
            shininess: 100
          }),
          new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(primaryRGB.r, primaryRGB.g, primaryRGB.b),
            transparent: true, 
            opacity: 0.3,
            emissive: new THREE.Color(primaryRGB.r * 0.3, primaryRGB.g * 0.3, primaryRGB.b * 0.3),
            shininess: 100
          }),
          new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(secondaryRGB.r, secondaryRGB.g, secondaryRGB.b),
            transparent: true, 
            opacity: 0.3,
            emissive: new THREE.Color(secondaryRGB.r * 0.3, secondaryRGB.g * 0.3, secondaryRGB.b * 0.3),
            shininess: 100
          })
        ];

        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);

        // Add wireframe edges for AR look
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ 
            color: new THREE.Color(primaryRGB.r, primaryRGB.g, primaryRGB.b),
            transparent: true, 
            opacity: 0.8,
            linewidth: 2
          })
        );
        cube.add(line);

        // Create text sprites for 3D projection (will appear on hover)
        const textGroup = new THREE.Group();
        scene.add(textGroup);

        // Create text planes for description
        const createTextPlane = (text, yOffset) => {
          const canvas2d = document.createElement('canvas');
          const ctx2d = canvas2d.getContext('2d');
          canvas2d.width = 512;
          canvas2d.height = 128;
          
          ctx2d.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx2d.fillRect(0, 0, canvas2d.width, canvas2d.height);
          
          ctx2d.font = 'bold 20px Roboto, sans-serif';
          ctx2d.fillStyle = `rgb(${Math.floor(primaryRGB.r * 255)}, ${Math.floor(primaryRGB.g * 255)}, ${Math.floor(primaryRGB.b * 255)})`;
          ctx2d.textAlign = 'center';
          ctx2d.textBaseline = 'middle';
          
          const lines = text.split('\n').slice(0, 4); // Max 4 lines
          lines.forEach((line, i) => {
            ctx2d.fillText(line.trim(), canvas2d.width / 2, (i + 1) * (canvas2d.height / (lines.length + 1)));
          });
          
          const texture = new THREE.CanvasTexture(canvas2d);
          texture.needsUpdate = true;
          
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
          });
          
          const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 0.8),
            material
          );
          plane.position.y = yOffset;
          plane.position.z = 0;
          plane.userData = { targetOpacity: 0 };
          
          return plane;
        };

        // Create text planes
        const textLines = skillText.split('\n').filter(l => l.trim());
        const textPlanes = [];
        textLines.slice(0, 3).forEach((line, i) => {
          const plane = createTextPlane(line.trim(), -1 + i * 0.4);
          textGroup.add(plane);
          textPlanes.push(plane);
        });

        // Position camera for AR view
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);

        // Add lighting for AR effect
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        
        const directionalLight1 = new THREE.DirectionalLight(
          new THREE.Color(primaryRGB.r, primaryRGB.g, primaryRGB.b),
          0.8
        );
        directionalLight1.position.set(5, 5, 5);
        scene.add(directionalLight1);
        
        const directionalLight2 = new THREE.DirectionalLight(
          new THREE.Color(secondaryRGB.r, secondaryRGB.g, secondaryRGB.b),
          0.6
        );
        directionalLight2.position.set(-5, -5, -5);
        scene.add(directionalLight2);

        // Store cube data
        const cubeData = {
          cube: cube,
          textGroup: textGroup,
          textPlanes: textPlanes,
          scene: scene,
          camera: camera,
          renderer: renderer,
          container: container,
          infoOverlay: infoOverlay,
          isHovered: false,
          baseRotation: {
            x: (Math.random() - 0.5) * 0.3,
            y: (Math.random() - 0.5) * 0.3,
            z: (Math.random() - 0.5) * 0.2
          },
          targetRotation: { x: 0, y: 0, z: 0 },
          targetPosition: { x: 0, y: 0, z: 0 },
          currentPosition: { x: 0, y: 0, z: 0 },
          currentRotation: { x: 0, y: 0, z: 0 }
        };
        
        this.cubes.push(cubeData);

        // Hover interaction - AR projection effect
        container.addEventListener('mouseenter', () => {
          cubeData.isHovered = true;
          
          // Project cube forward
          cubeData.targetPosition.z = -1.5;
          cubeData.targetRotation.x = 0.3;
          cubeData.targetRotation.y = 0.3;
          
          // Show text planes with animation
          textPlanes.forEach((plane, i) => {
            setTimeout(() => {
              plane.userData.targetOpacity = 0.9;
              plane.position.z = -0.5 - i * 0.2;
            }, i * 50);
          });
          
          // Show info overlay
          infoOverlay.style.opacity = '1';
          
          // Increase cube opacity
          materials.forEach(mat => {
            mat.opacity = 0.7;
            mat.emissiveIntensity = 0.5;
          });
        });

        container.addEventListener('mouseleave', () => {
          cubeData.isHovered = false;
          
          // Return cube to rest position
          cubeData.targetPosition.z = 0;
          cubeData.targetRotation.x = cubeData.baseRotation.x;
          cubeData.targetRotation.y = cubeData.baseRotation.y;
          
          // Hide text planes
          textPlanes.forEach(plane => {
            plane.userData.targetOpacity = 0;
            plane.position.z = 0;
          });
          
          // Hide info overlay
          infoOverlay.style.opacity = '0';
          
          // Reduce cube opacity
          materials.forEach(mat => {
            mat.opacity = 0.3;
            mat.emissiveIntensity = 0.3;
          });
        });

        // Mouse move for interactive rotation
        container.addEventListener('mousemove', (e) => {
          if (!cubeData.isHovered) return;
          
          const rect = container.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          
          cubeData.targetRotation.y = x * 0.5;
          cubeData.targetRotation.x = y * 0.5;
        });
      });
    },

    animate() {
      this.rafId = requestAnimationFrame(() => this.animate());

      this.cubes.forEach(cubeData => {
        const { cube, textPlanes, scene, camera, renderer, baseRotation, targetRotation, targetPosition, currentRotation, currentPosition } = cubeData;
        
        // Smooth interpolation for rotation
        const lerpFactor = 0.1;
        currentRotation.x += (targetRotation.x - currentRotation.x) * lerpFactor;
        currentRotation.y += (targetRotation.y - currentRotation.y) * lerpFactor;
        currentRotation.z += (targetRotation.z - currentRotation.z) * lerpFactor;
        
        // Smooth interpolation for position
        currentPosition.x += (targetPosition.x - currentPosition.x) * lerpFactor;
        currentPosition.y += (targetPosition.y - currentPosition.y) * lerpFactor;
        currentPosition.z += (targetPosition.z - currentPosition.z) * lerpFactor;
        
        // Apply rotation
        cube.rotation.x = baseRotation.x + currentRotation.x;
        cube.rotation.y = baseRotation.y + currentRotation.y;
        cube.rotation.z = baseRotation.z + currentRotation.z;
        
        // Apply position
        cube.position.x = currentPosition.x;
        cube.position.y = currentPosition.y;
        cube.position.z = currentPosition.z;
        
        // Animate text planes opacity
        textPlanes.forEach(plane => {
          const currentOpacity = plane.material.opacity;
          const targetOpacity = plane.userData.targetOpacity;
          plane.material.opacity += (targetOpacity - currentOpacity) * 0.1;
        });
        
        // Subtle idle animation when not hovered
        if (!cubeData.isHovered) {
          const time = Date.now() * 0.001;
          cube.rotation.x += Math.sin(time * 0.5) * 0.001;
          cube.rotation.y += Math.cos(time * 0.5) * 0.001;
          cube.position.y = Math.sin(time + baseRotation.x) * 0.05;
        }

        renderer.render(scene, camera);
      });
    },

    setupResize() {
      window.addEventListener('resize', () => {
        this.cubes.forEach(cubeData => {
          const { container, camera, renderer } = cubeData;
          camera.aspect = container.offsetWidth / 300;
          camera.updateProjectionMatrix();
          renderer.setSize(container.offsetWidth, 300);
        });
      });
    },

    updateColors() {
      const settings = window.SettingsManager?.getSettings();
      const primaryColor = settings?.colors?.primary || '#00b9cc';
      const secondaryColor = settings?.colors?.secondary || '#06e8ff';
      
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0.725, b: 0.8 };
      };
      
      const primaryRGB = hexToRgb(primaryColor);
      const secondaryRGB = hexToRgb(secondaryColor);

      this.cubes.forEach(cubeData => {
        cubeData.cube.material.forEach((mat, index) => {
          const color = index % 2 === 0 ? primaryRGB : secondaryRGB;
          mat.color.setRGB(color.r, color.g, color.b);
          mat.emissive.setRGB(color.r * 0.3, color.g * 0.3, color.b * 0.3);
        });
        cubeData.cube.children[0].material.color.setRGB(primaryRGB.r, primaryRGB.g, primaryRGB.b);
      });
    }
  };

  // Listen for settings changes
  window.addEventListener('settingsChanged', () => {
    Skills3DCube.updateColors();
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof THREE !== 'undefined') {
        Skills3DCube.init();
      } else {
        const checkThree = setInterval(() => {
          if (typeof THREE !== 'undefined') {
            clearInterval(checkThree);
            Skills3DCube.init();
          }
        }, 100);
      }
    });
  } else {
    if (typeof THREE !== 'undefined') {
      Skills3DCube.init();
    }
  }

  window.Skills3DCube = Skills3DCube;
})();
