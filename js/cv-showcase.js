// World-Class AR/VR/CV Showcase
// Demonstrating cutting-edge computer vision capabilities

class CVShowcase {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.faceLandmarker = null;
    this.handLandmarker = null;
    this.poseLandmarker = null;
    this.isRunning = false;
    this.currentMode = 'face-mesh';
    this.effects = {
      faceMesh: true,
      handTracking: true,
      poseEstimation: true,
      eyeTracking: true,
      volumetric: true,
      neuralStyle: false,
      objectDetection: false
    };
    this.faceMeshData = null;
    this.handData = null;
    this.poseData = null;
    this.eyeGaze = { x: 0, y: 0 };
    this.particles = [];
    this.scene3D = null;
    this.camera3D = null;
    this.renderer3D = null;
    this.shaderTime = 0;
    this.cubeParticles = [];
    this.drawingMode = false;
    this.drawingPath = [];
    this.lastDrawingPoint = null;
    this.lastTapTime = 0;
    this.tapCount = 0;
    this.faceExpression = 'neutral';
    this.reactionParticles = [];
    this.model3D = null;
    this.model3DGroup = null;
    this.isHoldingModel = false;
    this.modelScale = 1.0;
    this.modelRotation = { x: 0, y: 0, z: 0 };
    this.modelPosition = { x: 0, y: 0, z: 0 };
    this.handDepth = 0; // Estimated depth from camera
    this.lastHandPosition = null;
    this.smoothPosition = { x: 0, y: 0, z: 0 };
    this.smoothRotation = { x: 0, y: 0, z: 0 };
    this.handOrientation = { pitch: 0, yaw: 0, roll: 0 };
    this.cubePosition = { x: 0, y: 0, z: -2 }; // Initial cube position in 3D space
    this.grabOffset = null; // Offset when grabbing cube
    this.isTouchingCube = false;
    this.hand3DPosition = { x: 0, y: 0, z: 0 }; // Hand position in 3D space
    this.lastHand3DPosition = null;
    this.baseHandSize = null; // Reference hand size for depth estimation
    this.debugFrameCount = 0; // Debug counter
    this.debugGestureCount = 0; // Debug counter for gesture detection
    this.initialHandDistance = null; // For two-hand scaling
    this.initialScale = 1.0; // For two-hand scaling
    
    // Three.js Raycaster for proper screen-to-world conversion
    this.raycaster = null; // Will be initialized after Three.js loads
    this.mouseVector = null;
  }

  async init() {
    // Suppress MediaPipe console warnings/info
    this.suppressMediaPipeLogs();
    
    // Hide loading indicator
    const loadingEl = document.getElementById('cv-loading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
    
    // Setup canvas
    this.canvas = document.getElementById('cv-canvas');
    if (!this.canvas) {
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    // Set canvas size based on container, with fallback
    const container = this.canvas.parentElement;
    const containerWidth = container ? container.clientWidth : 1280;
    const containerHeight = container ? Math.floor(containerWidth * 9 / 16) : 720;
    
    this.canvas.width = Math.max(640, Math.min(containerWidth, 1280));
    this.canvas.height = Math.max(360, Math.min(containerHeight, 720));
    
    // Initialize MediaPipe
    await this.initMediaPipe();
    
    // Initialize 3D scene
    this.init3DScene();
    
    // Don't auto-start - user will click start button
  }

  async startCamera() {
    if (this.isRunning) {
      return;
    }
    
    // Setup video (requests camera access)
    await this.setupVideo();
    
    // Start rendering
    this.start();
  }

  suppressMediaPipeLogs() {
    // Suppress MediaPipe WASM internal logs
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;
    
    console.log = (...args) => {
      const message = args.join(' ');
      // Only suppress MediaPipe internal logs
      if (!message.includes('vision_wasm_internal') && 
          !message.includes('W0000') && 
          !message.includes('I0000') &&
          !message.includes('gl_context') &&
          !message.includes('Graph successfully') &&
          !message.includes('TensorFlow Lite')) {
        originalConsoleLog.apply(console, args);
      }
    };
    
    console.warn = (...args) => {
      const message = args.join(' ');
      // Only suppress MediaPipe warnings
      if (!message.includes('vision_wasm_internal') && 
          !message.includes('W0000') &&
          !message.includes('Face blendshape') &&
          !message.includes('OpenGL error checking')) {
        originalConsoleWarn.apply(console, args);
      }
    };
    
    console.info = (...args) => {
      const message = args.join(' ');
      // Only suppress MediaPipe info
      if (!message.includes('vision_wasm_internal') && 
          !message.includes('I0000') &&
          !message.includes('gl_context') &&
          !message.includes('WebGL context')) {
        originalConsoleInfo.apply(console, args);
      }
    };
  }

  async initMediaPipe() {
    try {
      // Wait for MediaPipe to be available (loaded from CDN)
      if (typeof window.MediaPipeVision === 'undefined') {
        await new Promise((resolve) => {
          const checkMediaPipe = setInterval(() => {
            if (typeof window.MediaPipeVision !== 'undefined') {
              clearInterval(checkMediaPipe);
              resolve();
            }
          }, 100);
          
          window.addEventListener('mediapipe-loaded', () => {
            clearInterval(checkMediaPipe);
            resolve();
          }, { once: true });
          
          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkMediaPipe);
            resolve();
          }, 10000);
        });
      }

      if (typeof window.MediaPipeVision === 'undefined') {
        throw new Error('MediaPipe failed to load from CDN. Check internet connection.');
      }

      const { FaceLandmarker, FilesetResolver } = window.MediaPipeVision;
      
      // Load WASM files from CDN (works on GitHub Pages)
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );
      // Initialize Face Landmarker (model loaded from Google CDN)
      this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: 'VIDEO',
        numFaces: 1
      });

      // Try to initialize Hand Landmarker (loaded from Google CDN)
      try {
        const { HandLandmarker } = window.MediaPipeVision;
        if (HandLandmarker) {
          this.handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 2
          });
        }
      } catch (e) {
        this.effects.handTracking = false;
      }

      // Try to initialize Pose Landmarker (loaded from Google CDN)
      // Note: Pose landmarker model path may vary, trying alternative
      try {
        const { PoseLandmarker } = window.MediaPipeVision;
        if (PoseLandmarker) {
          // Try the correct model path
          this.poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            outputSegmentationMasks: false
          });
        }
      } catch (e) {
        this.effects.poseEstimation = false;
      }

    } catch (error) {
      this.showError('Failed to load MediaPipe. Please check your internet connection.');
    }
  }

  showError(message) {
    const canvas = document.getElementById('cv-canvas');
    if (canvas && this.ctx) {
      this.ctx.fillStyle = '#0a0f11';
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.ctx.fillStyle = '#ff6b6b';
      this.ctx.font = 'bold 24px Roboto';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Error', canvas.width / 2, canvas.height / 2 - 20);
      this.ctx.fillStyle = '#b0d4d9';
      this.ctx.font = '16px Roboto';
      this.ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 10);
    }
  }

  init3DScene() {
    if (typeof THREE === 'undefined') return;
    
    // Create 3D scene for volumetric effects
    this.scene3D = new THREE.Scene();
    
    const container = document.getElementById('cv-3d-container');
    if (!container) {
      console.warn('[CV] 3D container not found');
      return;
    }
    
    // Get container dimensions
    const width = container.clientWidth || 1280;
    const height = container.clientHeight || 720;
    
    this.camera3D = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.renderer3D = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer3D.setSize(width, height);
    this.renderer3D.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer3D.setClearColor(0x000000, 0); // Transparent background
    
    container.appendChild(this.renderer3D.domElement);
    this.renderer3D.domElement.style.position = 'absolute';
    this.renderer3D.domElement.style.top = '0';
    this.renderer3D.domElement.style.left = '0';
    this.renderer3D.domElement.style.width = '100%';
    this.renderer3D.domElement.style.height = '100%';
    
    this.camera3D.position.z = 5;
    this.camera3D.lookAt(0, 0, 0);
    
    // Initialize Raycaster for screen-to-world conversion
    this.raycaster = new THREE.Raycaster();
    this.mouseVector = new THREE.Vector2();
    
    // Removed volumetric particles for cleaner look
    
    // Create interactive 3D model
    this.createInteractive3DModel();
    
    // 3D scene initialized
  }

  createInteractive3DModel() {
    // Create a beautiful 4D tesseract (hypercube) that responds to hand gestures
    this.model3DGroup = new THREE.Group();
    
    // Create tesseract (4D hypercube projected to 3D)
    this.model3D = this.createTesseract();
    
    this.model3DGroup.add(this.model3D);
    
    // Create particle system inside the tesseract
    this.createCubeParticles();
    // Set initial position
    this.model3DGroup.position.set(
      this.cubePosition.x,
      this.cubePosition.y,
      this.cubePosition.z
    );
    // Initialize smooth position to match initial position
    this.smoothPosition.x = this.cubePosition.x;
    this.smoothPosition.y = this.cubePosition.y;
    this.smoothPosition.z = this.cubePosition.z;
    this.scene3D.add(this.model3DGroup);
    
    // Add enhanced lighting for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene3D.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x6366f1, 1.5, 100);
    pointLight1.position.set(5, 5, 5);
    this.scene3D.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x8b5cf6, 1.2, 100);
    pointLight2.position.set(-5, 5, -5);
    this.scene3D.add(pointLight2);
    
    const directionalLight = new THREE.DirectionalLight(0xa78bfa, 0.8);
    directionalLight.position.set(0, 5, 0);
    this.scene3D.add(directionalLight);
    
    // Interactive 3D tesseract created
  }

  createTesseract() {
    // Create a tesseract (4D hypercube) - outer and inner cubes connected by edges
    const group = new THREE.Group();
    const size = 0.6; // Half size for inner cube
    const outerSize = 1.5; // Larger outer cube for better visibility
    
    const primaryColor = 0x6366f1;
    const secondaryColor = 0x8b5cf6;
    const accentColor = 0xa78bfa;
    
    // Create outer cube (more visible and opaque)
    const outerGeometry = new THREE.BoxGeometry(outerSize, outerSize, outerSize);
    const outerMaterial = new THREE.MeshPhongMaterial({
      color: primaryColor,
      emissive: secondaryColor,
      emissiveIntensity: 0.6,
      specular: accentColor,
      shininess: 100,
      transparent: false,
      opacity: 1.0
    });
    const outerCube = new THREE.Mesh(outerGeometry, outerMaterial);
    group.add(outerCube);
    
    // Create inner cube (more visible and opaque)
    const innerGeometry = new THREE.BoxGeometry(size, size, size);
    const innerMaterial = new THREE.MeshPhongMaterial({
      color: secondaryColor,
      emissive: accentColor,
      emissiveIntensity: 0.5,
      specular: primaryColor,
      shininess: 100,
      transparent: false,
      opacity: 1.0
    });
    const innerCube = new THREE.Mesh(innerGeometry, innerMaterial);
    group.add(innerCube);
    
    // Create connecting edges (8 edges connecting outer to inner cube vertices)
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: accentColor,
      linewidth: 4,
      transparent: true,
      opacity: 1.0
    });
    
    // Define vertices of outer and inner cubes
    const outerVertices = [
      [-outerSize/2, -outerSize/2, -outerSize/2], [outerSize/2, -outerSize/2, -outerSize/2],
      [outerSize/2, outerSize/2, -outerSize/2], [-outerSize/2, outerSize/2, -outerSize/2],
      [-outerSize/2, -outerSize/2, outerSize/2], [outerSize/2, -outerSize/2, outerSize/2],
      [outerSize/2, outerSize/2, outerSize/2], [-outerSize/2, outerSize/2, outerSize/2]
    ];
    
    const innerVertices = [
      [-size/2, -size/2, -size/2], [size/2, -size/2, -size/2],
      [size/2, size/2, -size/2], [-size/2, size/2, -size/2],
      [-size/2, -size/2, size/2], [size/2, -size/2, size/2],
      [size/2, size/2, size/2], [-size/2, size/2, size/2]
    ];
    
    // Connect corresponding vertices (8 edges)
    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...outerVertices[i]),
        new THREE.Vector3(...innerVertices[i])
      ]);
      const line = new THREE.Line(geometry, edgeMaterial);
      group.add(line);
    }
    
    // Add wireframe to outer cube for definition
    const outerWireframe = new THREE.WireframeGeometry(outerGeometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: accentColor,
      linewidth: 3,
      transparent: true,
      opacity: 1.0
    });
    const outerWireframeMesh = new THREE.LineSegments(outerWireframe, wireframeMaterial);
    group.add(outerWireframeMesh);
    
    // Add wireframe to inner cube
    const innerWireframe = new THREE.WireframeGeometry(innerGeometry);
    const innerWireframeMesh = new THREE.LineSegments(innerWireframe, wireframeMaterial);
    group.add(innerWireframeMesh);
    
    // Add enhanced glow effect
    const glowGeometry = new THREE.BoxGeometry(outerSize * 1.15, outerSize * 1.15, outerSize * 1.15);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);
    
    return group;
  }

  createCubeParticles() {
    // Create beautiful particle system inside the cube
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];
    
    const colorPalette = [
      new THREE.Color(0x6366f1), // Indigo
      new THREE.Color(0x8b5cf6), // Purple
      new THREE.Color(0xa78bfa), // Light purple
      new THREE.Color(0xc4b5fd), // Lighter purple
    ];
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Random position inside cube (0.4 unit radius)
      const radius = Math.random() * 0.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Random color from palette
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Random velocity
      velocities.push({
        vx: (Math.random() - 0.5) * 0.01,
        vy: (Math.random() - 0.5) * 0.01,
        vz: (Math.random() - 0.5) * 0.01
      });
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    this.cubeParticleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.cubeParticleVelocities = velocities;
    this.model3DGroup.add(this.cubeParticleSystem);
  }

  updateCubeParticles() {
    if (!this.cubeParticleSystem || !this.cubeParticleVelocities) return;
    
    const positions = this.cubeParticleSystem.geometry.attributes.position.array;
    const particleCount = positions.length / 3;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const vel = this.cubeParticleVelocities[i];
      
      // Update position
      positions[i3] += vel.vx;
      positions[i3 + 1] += vel.vy;
      positions[i3 + 2] += vel.vz;
      
      // Bounce off cube walls (0.4 unit radius)
      const radius = Math.sqrt(
        positions[i3] ** 2 + 
        positions[i3 + 1] ** 2 + 
        positions[i3 + 2] ** 2
      );
      
      if (radius > 0.4) {
        // Bounce back
        const scale = 0.4 / radius;
        positions[i3] *= scale;
        positions[i3 + 1] *= scale;
        positions[i3 + 2] *= scale;
        
        // Reverse velocity component
        const normalX = positions[i3] / 0.4;
        const normalY = positions[i3 + 1] / 0.4;
        const normalZ = positions[i3 + 2] / 0.4;
        
        const dot = vel.vx * normalX + vel.vy * normalY + vel.vz * normalZ;
        vel.vx -= 2 * dot * normalX;
        vel.vy -= 2 * dot * normalY;
        vel.vz -= 2 * dot * normalZ;
      }
    }
    
    this.cubeParticleSystem.geometry.attributes.position.needsUpdate = true;
  }

  project3DToScreen(x3D, y3D, z3D) {
    // Project 3D world coordinates to 2D screen coordinates
    const vector = new THREE.Vector3(x3D, y3D, z3D);
    vector.project(this.camera3D);
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    const x = (vector.x * 0.5 + 0.5) * width;
    const y = (vector.y * -0.5 + 0.5) * height; // Flip Y
    
    return { x, y };
  }

  screenTo3D(screenX, screenY, depthZ) {
    // Convert 2D screen coordinates to 3D world coordinates
    // Using Three.js Raycaster for proper unprojection (accounts for camera projection matrix)
    
    // Ensure raycaster is initialized
    if (!this.raycaster || !this.mouseVector || !this.camera3D) {
      // Raycaster not initialized, using fallback calculation
      // Fallback: simple projection (less accurate but works)
      const width = this.canvas.width;
      const height = this.canvas.height;
      const fov = 75 * Math.PI / 180;
      const aspect = width / height;
      const distance = Math.abs(this.camera3D ? this.camera3D.position.z - depthZ : 5 - depthZ);
      const frustumHeight = 2 * Math.tan(fov / 2) * distance;
      const frustumWidth = frustumHeight * aspect;
      const ndcX = (screenX / width) * 2 - 1;
      const ndcY = 1 - (screenY / height) * 2;
      return {
        x: ndcX * frustumWidth * 0.5,
        y: ndcY * frustumHeight * 0.5,
        z: depthZ
      };
    }
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Normalize screen coordinates to NDC (-1 to 1)
    // Three.js uses: x: [-1, 1] left to right, y: [1, -1] bottom to top
    this.mouseVector.x = (screenX / width) * 2 - 1;
    this.mouseVector.y = -(screenY / height) * 2 + 1; // Flip Y (Three.js convention)
    
    // Cast ray from camera through screen point
    this.raycaster.setFromCamera(this.mouseVector, this.camera3D);
    
    // Create a plane at the target depth (perpendicular to Z-axis)
    const planeNormal = new THREE.Vector3(0, 0, 1);
    const planeConstant = -depthZ; // Plane at z = depthZ
    const plane = new THREE.Plane(planeNormal, planeConstant);
    
    // Find intersection point
    const intersectionPoint = new THREE.Vector3();
    const hasIntersection = this.raycaster.ray.intersectPlane(plane, intersectionPoint);
    
    if (!hasIntersection) {
      // Fallback if no intersection
      // Ray-plane intersection failed, using fallback
      return { x: 0, y: 0, z: depthZ };
    }
    
    return { 
      x: intersectionPoint.x, 
      y: intersectionPoint.y, 
      z: intersectionPoint.z 
    };
  }

  estimateHandDepth(hand) {
    // Estimate hand depth using hand size (larger = closer, smaller = farther)
    // Use distance between wrist and middle finger tip as reference
    
    const wrist = hand[0];
    const middleTip = hand[12];
    const indexTip = hand[8];
    const thumbTip = hand[4];
    
    // Calculate hand span (wrist to finger tips) in pixels
    const wristToMiddle = Math.sqrt(
      Math.pow((wrist.x - middleTip.x) * this.canvas.width, 2) +
      Math.pow((wrist.y - middleTip.y) * this.canvas.height, 2)
    );
    
    const wristToIndex = Math.sqrt(
      Math.pow((wrist.x - indexTip.x) * this.canvas.width, 2) +
      Math.pow((wrist.y - indexTip.y) * this.canvas.height, 2)
    );
    
    const wristToThumb = Math.sqrt(
      Math.pow((wrist.x - thumbTip.x) * this.canvas.width, 2) +
      Math.pow((wrist.y - thumbTip.y) * this.canvas.height, 2)
    );
    
    // Average hand span
    const handSpan = (wristToMiddle + wristToIndex + wristToThumb) / 3;
    
    // Store base hand size on first detection
    if (!this.baseHandSize) {
      this.baseHandSize = handSpan;
      // Base hand size calculated
    }
    
    // Normalize depth: closer hand = larger span = more negative Z
    // Typical hand span at arm's length: ~150-200px
    // Map to Z range relative to camera (camera at z=5)
    // Base depth: -2 (arm's length), range: -4 (close) to 0 (far)
    const depthRange = 2; // Range of 2 units
    const depthOffset = ((handSpan - this.baseHandSize) / this.baseHandSize) * depthRange;
    const normalizedDepth = -2 - depthOffset;
    
    // Clamp depth to reasonable range
    const clampedDepth = Math.max(-4, Math.min(0, normalizedDepth));
    
    return clampedDepth;
  }

  calculateHandCentroid3D(hand) {
    // Calculate hand centroid in 3D space using multiple finger tips
    const thumbTip = hand[4];
    const indexTip = hand[8];
    const middleTip = hand[12];
    const ringTip = hand[16];
    const pinkyTip = hand[20];
    
    // Calculate centroid in screen space (normalized 0-1)
    const centroidNormX = ((1 - thumbTip.x) + (1 - indexTip.x) + (1 - middleTip.x) + 
                           (1 - ringTip.x) + (1 - pinkyTip.x)) / 5;
    const centroidNormY = (thumbTip.y + indexTip.y + middleTip.y + 
                           ringTip.y + pinkyTip.y) / 5;
    
    // Convert to screen pixels
    const centroidScreenX = centroidNormX * this.canvas.width;
    const centroidScreenY = centroidNormY * this.canvas.height;
    
    // Estimate depth
    const depthZ = this.estimateHandDepth(hand);
    
    // Convert to 3D world coordinates using proper projection
    const centroid3D = this.screenTo3D(centroidScreenX, centroidScreenY, depthZ);
    
    return centroid3D;
  }

  checkFingerTouchingCube(hand) {
    // Check if 2+ finger tips are touching the cube's projected bounds
    const fingerTips = [
      hand[4],  // Thumb
      hand[8],  // Index
      hand[12], // Middle
      hand[16], // Ring
      hand[20]  // Pinky
    ];
    
    // Get cube's 3D position
    const cubePos = this.model3DGroup.position;
    
    // Project cube center to screen
    const cubeScreenPos = this.project3DToScreen(cubePos.x, cubePos.y, cubePos.z);
    
    // Calculate cube size in screen space (approximate)
    // Cube is 1 unit, need to account for perspective
    const distance = Math.abs(cubePos.z - this.camera3D.position.z);
    const fov = this.camera3D.fov * Math.PI / 180;
    const cubeScreenSize = (1 / distance) * this.canvas.height * Math.tan(fov / 2) * 2;
    
    // Touch threshold for grabbing (2+ fingers must be within this distance)
    const touchThreshold = cubeScreenSize * 0.8; // Slightly larger than cube
    // Release threshold (fingers must be far from cube to unlock)
    const releaseThreshold = cubeScreenSize * 1.5;
    
    // Count how many fingers are touching
    let fingersTouchingCount = 0;
    let fingersFarCount = 0;
    
    for (let i = 0; i < fingerTips.length; i++) {
      const tip = fingerTips[i];
      const tipX = (1 - tip.x) * this.canvas.width; // Flip X
      const tipY = tip.y * this.canvas.height;
      
      const dist = Math.sqrt(
        Math.pow(tipX - cubeScreenPos.x, 2) + 
        Math.pow(tipY - cubeScreenPos.y, 2)
      );
      
      // Check if this finger is touching
      if (dist < touchThreshold) {
        fingersTouchingCount++;
      }
      
      // Check if this finger is far (for unlock)
      if (dist >= releaseThreshold) {
        fingersFarCount++;
      }
    }
    
    // If holding, unlock if 3+ fingers are far (more lenient)
    if (this.isHoldingModel) {
      const shouldUnlock = fingersFarCount >= 3; // 3+ fingers far = unlock
      return { touching: fingersTouchingCount >= 2, shouldUnlock, fingersTouchingCount };
    }
    
    // Not holding: need 2+ fingers touching to grab
    return { touching: fingersTouchingCount >= 2, shouldUnlock: false, fingersTouchingCount };
  }

  createVolumetricParticles() {
    const particleCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;
      
      const color = new THREE.Color().setHSL(0.5 + Math.random() * 0.1, 0.7, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    this.particleSystem = new THREE.Points(geometry, material);
    this.scene3D.add(this.particleSystem);
  }

  async setupVideo() {
    try {
      this.video = document.createElement('video');
      this.video.style.display = 'none';
      document.body.appendChild(this.video);
      
      // Get optimal video resolution based on canvas size
      const idealWidth = Math.max(640, Math.min(this.canvas.width, 1280));
      const idealHeight = Math.max(360, Math.min(this.canvas.height, 720));
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: idealWidth },
          height: { ideal: idealHeight },
          facingMode: 'user'
        } 
      });
      
      this.video.srcObject = stream;
      this.video.play();
      
      // Video stream initialized
    } catch (error) {
      console.error('[CV] Video access denied:', error);
      this.showFallback();
    }
  }

  showFallback() {
    const canvas = document.getElementById('cv-canvas');
    if (canvas && this.ctx) {
      this.ctx.fillStyle = '#0a0f11';
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.ctx.fillStyle = '#4a9ba8';
      this.ctx.font = 'bold 28px Roboto';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Camera Access Required', canvas.width / 2, canvas.height / 2 - 20);
      this.ctx.font = '18px Roboto';
      this.ctx.fillStyle = '#b0d4d9';
      this.ctx.fillText('Please allow camera access to see the CV showcase', canvas.width / 2, canvas.height / 2 + 20);
      this.ctx.fillText('This demo uses real-time face mesh, hand tracking, and pose estimation', canvas.width / 2, canvas.height / 2 + 50);
    }
  }

  async detect() {
    if (!this.video || this.video.readyState < 2) return;
    
    const timestamp = Date.now();
    
    // Face detection
    if (this.faceLandmarker && this.effects.faceMesh) {
      try {
        const faceResults = this.faceLandmarker.detectForVideo(this.video, timestamp);
        if (faceResults && faceResults.landmarks && faceResults.landmarks.length > 0) {
          this.faceMeshData = faceResults.landmarks[0];
          this.drawFaceMesh();
          this.updateEyeGaze();
        } else {
          // No face detected
          this.faceMeshData = null;
        }
      } catch (error) {
        console.error('[CV] Face detection error:', error);
        this.faceMeshData = null;
      }
    }
    
    // Hand detection (no visual lines - magic effect)
    if (this.handLandmarker && this.effects.handTracking) {
      const handResults = this.handLandmarker.detectForVideo(this.video, timestamp);
      if (handResults.landmarks && handResults.landmarks.length > 0) {
        this.handData = handResults.landmarks;
        // Removed drawHands() for magic effect
        this.detectGestures();
        this.detectTwoHandScaling(); // Check for two-hand scaling
      } else {
        this.handData = [];
      }
    }
    
    // Pose detection (no visual lines - magic effect)
    if (this.poseLandmarker && this.effects.poseEstimation) {
      const poseResults = this.poseLandmarker.detectForVideo(this.video, timestamp);
      if (poseResults.landmarks && poseResults.landmarks.length > 0) {
        this.poseData = poseResults.landmarks[0];
        // Removed drawPose() for magic effect
      }
    }
  }

  drawFaceMesh() {
    if (!this.faceMeshData || !Array.isArray(this.faceMeshData)) {
      return;
    }
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Detect face expressions
    this.detectFaceExpressions();
    
    this.ctx.strokeStyle = '#4a9ba8';
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.8;
    
    // Draw face mesh
    const landmarks = this.faceMeshData;
    
    if (!landmarks || landmarks.length === 0) {
      return;
    }
    
    // Face mesh connections (MediaPipe face has 468 points)
    // Draw key facial features with connections
    const faceConnections = [
      // Face outline
      [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389],
      [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397],
      [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152],
      [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172],
      [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162],
      [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10],
      // Left eyebrow
      [107, 55], [55, 65], [65, 52], [52, 53], [53, 46],
      // Right eyebrow
      [336, 296], [296, 334], [334, 293], [293, 300], [300, 276],
      // Left eye
      [33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154],
      [154, 155], [155, 133], [133, 173], [173, 157], [157, 158], [158, 159],
      [159, 160], [160, 161], [161, 246], [246, 33],
      // Right eye
      [362, 382], [382, 381], [381, 380], [380, 374], [374, 373], [373, 390],
      [390, 249], [249, 263], [263, 466], [466, 388], [388, 387], [387, 386],
      [386, 385], [385, 384], [384, 398], [398, 362],
      // Nose
      [1, 2], [2, 97], [97, 98], [98, 327], [327, 326], [326, 2],
      // Mouth
      [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314],
      [314, 405], [405, 320], [320, 307], [307, 375], [375, 321], [321, 308],
      [308, 324], [324, 318], [318, 61]
    ];
    
    // Draw connections
    faceConnections.forEach(([start, end]) => {
      if (landmarks[start] && landmarks[end]) {
        const startX = (1 - landmarks[start].x) * width;
        const startY = landmarks[start].y * height;
        const endX = (1 - landmarks[end].x) * width;
        const endY = landmarks[end].y * height;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
      }
    });
    
    // Draw key points (flip X coordinate)
    this.ctx.fillStyle = '#2d7a87';
    const keyPoints = [33, 133, 362, 263, 19, 291, 1, 10, 152]; // Eyes, nose, mouth, face points
    keyPoints.forEach(idx => {
      if (landmarks[idx]) {
        const x = (1 - landmarks[idx].x) * width; // Flip X
        const y = landmarks[idx].y * height;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
    
    // Show expression reaction
    this.showExpressionReaction();
    
    this.ctx.globalAlpha = 1.0;
  }

  detectFaceExpressions() {
    if (!this.faceMeshData || !this.faceLandmarker) return;
    
    // Get blendshapes from face detection results
    // We need to get this from the detection results, not just landmarks
    // For now, detect based on landmark positions
    
    const landmarks = this.faceMeshData;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Detect mouth opening (blowing/laughing)
    const upperLip = landmarks[13];
    const lowerLip = landmarks[14];
    const mouthOpen = Math.abs(upperLip.y - lowerLip.y) * height > 20;
    
    // Detect smile (laughing)
    const leftMouth = landmarks[61];
    const rightMouth = landmarks[291];
    const mouthWidth = Math.abs(leftMouth.x - rightMouth.x) * width;
    const mouthHeight = Math.abs(upperLip.y - lowerLip.y) * height;
    const isSmiling = mouthWidth > 40 && mouthHeight > 15;
    
    // Detect blowing (mouth open, lips pursed)
    const isBlowing = mouthOpen && mouthWidth < 30;
    
    if (isBlowing) {
      this.faceExpression = 'blowing';
      this.createBlowingReaction();
    } else if (isSmiling && mouthOpen) {
      this.faceExpression = 'laughing';
      this.createLaughingReaction();
    } else if (isSmiling) {
      this.faceExpression = 'smiling';
      this.createSmilingReaction();
    } else {
      this.faceExpression = 'neutral';
    }
  }

  createBlowingReaction() {
    // Create wind particles
    const landmarks = this.faceMeshData;
    if (!landmarks[14]) return; // Lower lip
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    const mouthX = (1 - landmarks[14].x) * width;
    const mouthY = landmarks[14].y * height;
    
    for (let i = 0; i < 5; i++) {
      this.reactionParticles.push({
        x: mouthX,
        y: mouthY,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 2,
        life: 1.0,
        decay: 0.05,
        color: '#4a9ba8',
        size: Math.random() * 3 + 2
      });
    }
  }

  createLaughingReaction() {
    // Create happy particles
    const landmarks = this.faceMeshData;
    if (!landmarks[13]) return; // Upper lip
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    const mouthX = (1 - landmarks[13].x) * width;
    const mouthY = landmarks[13].y * height;
    
    for (let i = 0; i < 10; i++) {
      this.reactionParticles.push({
        x: mouthX + (Math.random() - 0.5) * 40,
        y: mouthY,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 4 - 1,
        life: 1.0,
        decay: 0.03,
        color: '#ffd700',
        size: Math.random() * 4 + 3
      });
    }
  }

  createSmilingReaction() {
    // Subtle glow effect
    const landmarks = this.faceMeshData;
    if (!landmarks[13]) return;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    const mouthX = (1 - landmarks[13].x) * width;
    const mouthY = landmarks[13].y * height;
    
    // Draw glow around mouth
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#4a9ba8';
    this.ctx.fillStyle = 'rgba(74, 155, 168, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(mouthX, mouthY, 30, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  showExpressionReaction() {
    // Show text indicator
    if (this.faceExpression !== 'neutral') {
      const landmarks = this.faceMeshData;
      const width = this.canvas.width;
      const height = this.canvas.height;
      const foreheadY = landmarks[10] ? landmarks[10].y * height - 40 : 50;
      const centerX = width / 2;
      
      this.ctx.fillStyle = '#4a9ba8';
      this.ctx.font = 'bold 24px Roboto';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        this.faceExpression.toUpperCase(),
        centerX,
        foreheadY
      );
    }
  }

  updateReactionParticles() {
    this.reactionParticles = this.reactionParticles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      
      if (particle.life > 0) {
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = particle.life;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
        return true;
      }
      return false;
    });
  }

  drawHands() {
    if (!this.handData) return;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    this.handData.forEach((hand, handIdx) => {
      this.ctx.strokeStyle = handIdx === 0 ? '#4a9ba8' : '#2d7a87';
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = 0.7;
      
      // Draw hand connections (flip X coordinate for mirror effect)
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
      ];
      
      connections.forEach(([start, end]) => {
        if (hand[start] && hand[end]) {
          this.ctx.beginPath();
          this.ctx.moveTo((1 - hand[start].x) * width, hand[start].y * height); // Flip X
          this.ctx.lineTo((1 - hand[end].x) * width, hand[end].y * height); // Flip X
          this.ctx.stroke();
        }
      });
      
      // Draw key points (flip X coordinate)
      this.ctx.fillStyle = handIdx === 0 ? '#4a9ba8' : '#2d7a87';
      hand.forEach((point, idx) => {
        if (idx % 4 === 0) { // Draw every 4th point for performance
          this.ctx.beginPath();
          this.ctx.arc((1 - point.x) * width, point.y * height, 4, 0, Math.PI * 2); // Flip X
          this.ctx.fill();
        }
      });
      
      // Highlight index finger tip when drawing
      if (this.drawingMode && handIdx === 0) {
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc((1 - hand[8].x) * width, hand[8].y * height, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw "DRAWING" indicator
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 20px Roboto';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DRAWING', width / 2, 50);
      }
      
      // Show cube position indicator
      if (this.model3DGroup && handIdx === 0) {
        const cubePos = this.model3DGroup.position;
        const cubeScreenPos = this.project3DToScreen(cubePos.x, cubePos.y, cubePos.z);
        
        // Draw cube position indicator
        this.ctx.strokeStyle = this.isTouchingCube ? '#00ff00' : '#4a9ba8';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.6;
        this.ctx.beginPath();
        this.ctx.arc(cubeScreenPos.x, cubeScreenPos.y, 20, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Draw cube bounds outline
        const distance = Math.abs(cubePos.z - this.camera3D.position.z);
        const fov = this.camera3D.fov * Math.PI / 180;
        const cubeScreenSize = (1 / distance) * this.canvas.height * Math.tan(fov / 2) * 2;
        
        this.ctx.strokeStyle = this.isTouchingCube ? '#00ff00' : '#4a9ba8';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
          cubeScreenPos.x - cubeScreenSize / 2,
          cubeScreenPos.y - cubeScreenSize / 2,
          cubeScreenSize,
          cubeScreenSize
        );
      }
      
      // Show 3D model interaction status
      if (this.isHoldingModel && handIdx === 0) {
        const thumbTip = hand[4];
        const indexTip = hand[8];
        const middleTip = hand[12];
        const thumbX = (1 - thumbTip.x) * width;
        const thumbY = thumbTip.y * height;
        const indexX = (1 - indexTip.x) * width;
        const indexY = indexTip.y * height;
        
        // Draw connection line between thumb and index
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 3;
        this.ctx.globalAlpha = 0.8;
        this.ctx.beginPath();
        this.ctx.moveTo(thumbX, thumbY);
        this.ctx.lineTo(indexX, indexY);
        this.ctx.stroke();
        
        // Draw hand centroid (grab point) in 3D space
        const handCentroid3D = this.calculateHandCentroid3D(hand);
        const centroidScreenPos = this.project3DToScreen(
          handCentroid3D.x,
          handCentroid3D.y,
          handCentroid3D.z
        );
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.arc(centroidScreenPos.x, centroidScreenPos.y, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw line from hand centroid to cube
        const cubePos = this.model3DGroup.position;
        const cubeScreenPos = this.project3DToScreen(cubePos.x, cubePos.y, cubePos.z);
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 3;
        this.ctx.globalAlpha = 0.7;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(centroidScreenPos.x, centroidScreenPos.y);
        this.ctx.lineTo(cubeScreenPos.x, cubeScreenPos.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.globalAlpha = 1.0;
        
        // Display 3D coordinates
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px Roboto';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(
          `Hand: (${handCentroid3D.x.toFixed(2)}, ${handCentroid3D.y.toFixed(2)}, ${handCentroid3D.z.toFixed(2)})`,
          20,
          150
        );
        this.ctx.fillText(
          `Cube: (${cubePos.x.toFixed(2)}, ${cubePos.y.toFixed(2)}, ${cubePos.z.toFixed(2)})`,
          20,
          170
        );
        
        // Draw depth indicator (distance from camera)
        const wrist = hand[0];
        const wristX = (1 - wrist.x) * width;
        const wristY = wrist.y * height;
        const depthIndicator = Math.abs(this.handDepth).toFixed(2);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 18px Roboto';
        this.ctx.textAlign = 'center';
        this.ctx.globalAlpha = 1.0;
        this.ctx.fillText('LOCKED TO HAND (6DOF)', width / 2, 80);
        this.ctx.fillText(`Scale: ${this.modelScale.toFixed(2)}x | Depth: ${depthIndicator}`, width / 2, 105);
        
        // Display rotation angles
        const pitchDeg = THREE.MathUtils.radToDeg(this.smoothRotation.x).toFixed(1);
        const yawDeg = THREE.MathUtils.radToDeg(this.smoothRotation.y).toFixed(1);
        const rollDeg = THREE.MathUtils.radToDeg(this.smoothRotation.z).toFixed(1);
        this.ctx.font = '14px Roboto';
        this.ctx.fillText(`Pitch: ${pitchDeg}° | Yaw: ${yawDeg}° | Roll: ${rollDeg}°`, width / 2, 130);
        this.ctx.font = '12px Roboto';
        this.ctx.fillText('Move fingers far from cube to unlock', width / 2, 150);
        
        // Draw depth visualization circle
        const depthRadius = Math.max(10, Math.min(30, Math.abs(this.handDepth) * 10));
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(wristX, wristY, depthRadius, 0, Math.PI * 2);
        this.ctx.stroke();
      } else if (this.isTouchingCube && handIdx === 0) {
        // Show "Touch to grab" hint
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = 'bold 16px Roboto';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('TOUCHING CUBE - Pinch to grab', width / 2, 80);
      }
      
      this.ctx.globalAlpha = 1.0;
    });
  }

  drawPose() {
    if (!this.poseData) return;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    this.ctx.strokeStyle = '#4a9ba8';
    this.ctx.lineWidth = 3;
    this.ctx.globalAlpha = 0.7;
    
    // Pose connections (flip X coordinate for mirror effect)
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
      [11, 23], [12, 24], [23, 24], // Torso
      [23, 25], [25, 27], [24, 26], [26, 28] // Legs
    ];
    
    connections.forEach(([start, end]) => {
      if (this.poseData[start] && this.poseData[end]) {
        this.ctx.beginPath();
        this.ctx.moveTo((1 - this.poseData[start].x) * width, this.poseData[start].y * height); // Flip X
        this.ctx.lineTo((1 - this.poseData[end].x) * width, this.poseData[end].y * height); // Flip X
        this.ctx.stroke();
      }
    });
    
    // Draw key points (flip X coordinate)
    this.ctx.fillStyle = '#4a9ba8';
    const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24]; // Shoulders, elbows, wrists, hips
    keyPoints.forEach(idx => {
      if (this.poseData[idx]) {
        this.ctx.beginPath();
        this.ctx.arc((1 - this.poseData[idx].x) * width, this.poseData[idx].y * height, 6, 0, Math.PI * 2); // Flip X
        this.ctx.fill();
      }
    });
    
    // Calculate and display pose info
    this.displayPoseInfo();
    
    this.ctx.globalAlpha = 1.0;
  }

  displayPoseInfo() {
    // Pose estimation tracks full body skeleton
    // Shows: body position, arm angles, leg positions, etc.
    if (this.poseData && this.poseData[11] && this.poseData[12]) {
      const leftShoulder = this.poseData[11];
      const rightShoulder = this.poseData[12];
      const shoulderDistance = Math.abs(leftShoulder.x - rightShoulder.x) * this.canvas.width;
      
      // Detect pose type
      let poseType = 'Standing';
      if (this.poseData[25] && this.poseData[27]) {
        const leftKnee = this.poseData[25];
        const leftAnkle = this.poseData[27];
        const legBent = Math.abs(leftKnee.y - leftAnkle.y) * this.canvas.height < 100;
        if (legBent) poseType = 'Sitting/Bent';
      }
      
      // Display pose info
      this.ctx.fillStyle = '#4a9ba8';
      this.ctx.font = 'bold 18px Roboto';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`Pose: ${poseType}`, 20, this.canvas.height - 60);
      this.ctx.fillText(`Shoulder Width: ${shoulderDistance.toFixed(0)}px`, 20, this.canvas.height - 40);
      this.ctx.fillText('33 Key Points Tracked', 20, this.canvas.height - 20);
    }
  }

  updateEyeGaze() {
    if (!this.faceMeshData) return;
    
    // Calculate eye gaze from eye landmarks
    const leftEye = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    const rightEye = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
    
    const leftEyeCenter = this.calculateCenter(this.faceMeshData, leftEye);
    const rightEyeCenter = this.calculateCenter(this.faceMeshData, rightEye);
    
    this.eyeGaze = {
      x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
      y: (leftEyeCenter.y + rightEyeCenter.y) / 2
    };
    
    // Draw gaze indicator
    this.ctx.fillStyle = '#ff6b6b';
    this.ctx.beginPath();
    this.ctx.arc(this.eyeGaze.x * this.canvas.width, this.eyeGaze.y * this.canvas.height, 8, 0, Math.PI * 2);
    this.ctx.fill();
  }

  calculateCenter(landmarks, indices) {
    let sumX = 0, sumY = 0;
    indices.forEach(idx => {
      if (landmarks[idx]) {
        sumX += landmarks[idx].x;
        sumY += landmarks[idx].y;
      }
    });
    return { x: sumX / indices.length, y: sumY / indices.length };
  }

  calculateHandOrientation(hand, width, height) {
    // Calculate 6DOF rotation from hand landmarks
    // Uses palm plane and finger directions to determine orientation
    
    // Palm landmarks (base of fingers)
    const wrist = hand[0];
    const indexBase = hand[5];
    const middleBase = hand[9];
    const ringBase = hand[13];
    const pinkyBase = hand[17];
    
    // Finger tips
    const indexTip = hand[8];
    const middleTip = hand[12];
    
    // Calculate palm center
    const palmCenter = {
      x: (wrist.x + indexBase.x + middleBase.x + ringBase.x + pinkyBase.x) / 5,
      y: (wrist.y + indexBase.y + middleBase.y + ringBase.y + pinkyBase.y) / 5,
      z: (wrist.z || 0) + (indexBase.z || 0) + (middleBase.z || 0) + (ringBase.z || 0) + (pinkyBase.z || 0) / 5
    };
    
    // Vector from wrist to middle finger base (palm forward direction)
    const palmForward = {
      x: middleBase.x - wrist.x,
      y: middleBase.y - wrist.y,
      z: (middleBase.z || 0) - (wrist.z || 0)
    };
    
    // Vector from wrist to index base (palm right direction)
    const palmRight = {
      x: indexBase.x - wrist.x,
      y: indexBase.y - wrist.y,
      z: (indexBase.z || 0) - (wrist.z || 0)
    };
    
    // Normalize vectors
    const normalize = (v) => {
      const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      if (len === 0) return { x: 0, y: 0, z: 0 };
      return { x: v.x / len, y: v.y / len, z: v.z / len };
    };
    
    const forward = normalize(palmForward);
    const right = normalize(palmRight);
    
    // Calculate palm normal (up direction)
    const cross = (a, b) => ({
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    });
    
    const palmUp = normalize(cross(forward, right));
    
    // Convert to Euler angles (pitch, yaw, roll)
    // Pitch: rotation around X-axis (nodding up/down)
    const pitch = Math.asin(-forward.y);
    
    // Yaw: rotation around Y-axis (turning left/right)
    const yaw = Math.atan2(forward.x, forward.z);
    
    // Roll: rotation around Z-axis (tilting left/right)
    const roll = Math.atan2(right.y, right.x);
    
    // Convert to degrees and apply scaling
    const pitchDeg = pitch * (180 / Math.PI);
    const yawDeg = yaw * (180 / Math.PI);
    const rollDeg = roll * (180 / Math.PI);
    
    // Map to reasonable rotation ranges
    return {
      pitch: THREE.MathUtils.degToRad(Math.max(-90, Math.min(90, pitchDeg))),
      yaw: THREE.MathUtils.degToRad(yawDeg),
      roll: THREE.MathUtils.degToRad(Math.max(-45, Math.min(45, rollDeg)))
    };
  }

  detectGestures() {
    if (!this.handData || this.handData.length === 0) {
      this.isHoldingModel = false;
      return;
    }
    
    const hand = this.handData[0];
    if (!hand || hand.length < 21) return;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Index finger tip position (for drawing)
    const indexTip = hand[8];
    const indexTipX = (1 - indexTip.x) * width; // Flip X coordinate
    const indexTipY = indexTip.y * height;
    
    // Thumb tip position
    const thumbTip = hand[4];
    const thumbTipX = (1 - thumbTip.x) * width;
    const thumbTipY = thumbTip.y * height;
    
    // Palm center (wrist)
    const wrist = hand[0];
    const wristX = (1 - wrist.x) * width;
    const wristY = wrist.y * height;
    
    // Check if index finger is extended (drawing mode)
    const indexExtended = hand[8].y < hand[6].y;
    const otherFingersDown = 
      hand[12].y > hand[10].y && // Middle down
      hand[16].y > hand[14].y && // Ring down
      hand[20].y > hand[18].y; // Pinky down
    
    // Pinch detection (thumb and index close together)
    // Calculate distance in normalized coordinates (0-1), then convert to pixels
    const thumbIndexDistanceNormalized = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + 
      Math.pow(thumbTip.y - indexTip.y, 2)
    );
    // Convert to pixels for threshold comparison
    const thumbIndexDistancePixels = thumbIndexDistanceNormalized * Math.max(width, height);
    
    // Pinch detection threshold - use a fixed reasonable threshold
    // The adaptive approach was too sensitive to hand pose variations
    // A fixed threshold of 150px works well for most hand sizes and distances
    const pinchThreshold = 150; // Fixed threshold in pixels
    
    const isPinching = thumbIndexDistancePixels < pinchThreshold;
    
    // Open hand (all fingers extended)
    const allFingersExtended = 
      hand[8].y < hand[6].y && // Index
      hand[12].y < hand[10].y && // Middle
      hand[16].y < hand[14].y && // Ring
      hand[20].y < hand[18].y; // Pinky
    
    // Fist (all fingers closed)
    const fist = 
      hand[8].y > hand[6].y && // Index down
      hand[12].y > hand[10].y && // Middle down
      hand[16].y > hand[14].y && // Ring down
      hand[20].y > hand[18].y; // Pinky down
    
    // 3D Model Interaction with 6DOF - Only when touching cube edges
    if (this.model3DGroup) {
      // Check if fingers are touching the cube
      const touchResult = this.checkFingerTouchingCube(hand);
      this.isTouchingCube = touchResult.touching;
      
      // Calculate hand position in normalized coordinates
      const normalizedX = (wristX / width) * 2 - 1; // -1 to 1
      const normalizedY = 1 - (wristY / height) * 2; // -1 to 1 (flip Y)
      
      // Estimate depth (Z) based on hand size/distance
      const middleFingerTip = hand[12];
      const wristToMiddleDistance = Math.sqrt(
        Math.pow((wrist.x - middleFingerTip.x) * width, 2) + 
        Math.pow((wrist.y - middleFingerTip.y) * height, 2)
      );
      
      // Normalize depth: closer hand = smaller distance = more negative Z
      const normalizedDepth = Math.max(-3, Math.min(1, (wristToMiddleDistance - 100) / 50));
      this.handDepth = normalizedDepth;
      
      // Debug logs removed for production
      
      // Check unlock condition first
      if (this.isHoldingModel && touchResult.shouldUnlock) {
        // Unlock if: 3+ fingers moved away from cube
        this.isHoldingModel = false;
        this.grabOffset = null;
        this.lastHandPosition = null;
        this.lastHand3DPosition = null;
        this.baseHandSize = null;
        this.isTouchingCube = false;
        // Cube unlocked
      }
      // Grab: 2+ fingers must be touching the cube surface
      else if (this.isTouchingCube && touchResult.fingersTouchingCount >= 2 && !this.isHoldingModel) {
        // INITIAL GRAB: Lock cube to hand
        this.isHoldingModel = true;
        
        // Calculate hand centroid in 3D space using proper projection
        const handCentroid3D = this.calculateHandCentroid3D(hand);
        this.hand3DPosition = handCentroid3D;
        
        // On first grab, calculate offset between hand and cube
        const currentCubePos = this.model3DGroup.position;
        this.grabOffset = {
          x: currentCubePos.x - handCentroid3D.x,
          y: currentCubePos.y - handCentroid3D.y,
          z: currentCubePos.z - handCentroid3D.z
        };
        this.lastHand3DPosition = { ...handCentroid3D };
        // Grab initialized
      }
      
      // CONTINUOUS UPDATE: When holding, always update position based on hand movement
      // DEBUG: Log state every frame when holding
      if (this.isHoldingModel) {
        if (!this.grabOffset) {
          console.error('[CV] ERROR: isHoldingModel=true but grabOffset is null!');
        }
      }
      
      if (this.isHoldingModel && this.grabOffset) {
        // Calculate hand centroid in 3D space using proper projection
        const handCentroid3D = this.calculateHandCentroid3D(hand);
        this.hand3DPosition = handCentroid3D;
        
        // Calculate target cube position: hand 3D position + grab offset
        // This locks the cube to follow the hand
        const targetCubeX = handCentroid3D.x + this.grabOffset.x;
        const targetCubeY = handCentroid3D.y + this.grabOffset.y;
        const targetCubeZ = handCentroid3D.z + this.grabOffset.z;
        
        // Debug logging (every 10th frame to avoid spam)
        if (this.debugFrameCount % 10 === 0) {
          console.log(`[CV] HOLDING UPDATE - Frame ${this.debugFrameCount}:`);
          console.log(`  isHoldingModel: ${this.isHoldingModel}, grabOffset exists: ${!!this.grabOffset}`);
          console.log(`  Hand 3D: (${handCentroid3D.x.toFixed(2)}, ${handCentroid3D.y.toFixed(2)}, ${handCentroid3D.z.toFixed(2)})`);
          console.log(`  Target Cube: (${targetCubeX.toFixed(2)}, ${targetCubeY.toFixed(2)}, ${targetCubeZ.toFixed(2)})`);
          console.log(`  Current Smooth: (${this.smoothPosition.x.toFixed(2)}, ${this.smoothPosition.y.toFixed(2)}, ${this.smoothPosition.z.toFixed(2)})`);
          console.log(`  Model Position BEFORE: (${this.model3DGroup.position.x.toFixed(2)}, ${this.model3DGroup.position.y.toFixed(2)}, ${this.model3DGroup.position.z.toFixed(2)})`);
        }
        this.debugFrameCount++;
        
        // When locked, use high smoothing factor for smooth following
        // But make it responsive enough to feel locked
        const smoothingFactor = 0.9; // Higher = more responsive, feels more locked
        this.smoothPosition.x += (targetCubeX - this.smoothPosition.x) * smoothingFactor;
        this.smoothPosition.y += (targetCubeY - this.smoothPosition.y) * smoothingFactor;
        this.smoothPosition.z += (targetCubeZ - this.smoothPosition.z) * smoothingFactor;
        
        // === 3DOF ROTATION (Orientation: Pitch, Yaw, Roll) ===
        // Calculate rotation from hand orientation
        const handOrientation = this.calculateHandOrientation(hand, width, height);
        
        // Calculate rotation delta from hand movement
        if (this.lastHand3DPosition) {
          const deltaX = handCentroid3D.x - this.lastHand3DPosition.x;
          const deltaY = handCentroid3D.y - this.lastHand3DPosition.y;
          const deltaZ = handCentroid3D.z - this.lastHand3DPosition.z;
          
          // Add rotation based on hand movement (like twisting a real object)
          const movementRotationY = deltaX * 2; // Yaw from horizontal movement
          const movementRotationX = -deltaY * 2; // Pitch from vertical movement
          
          // Combine hand orientation with movement rotation
          const targetRotationX = handOrientation.pitch + movementRotationX * 0.1;
          const targetRotationY = handOrientation.yaw + movementRotationY * 0.1;
          const targetRotationZ = handOrientation.roll;
          
          // Smooth rotation interpolation
          const rotationSmoothing = 0.3;
          this.smoothRotation.x += (targetRotationX - this.smoothRotation.x) * rotationSmoothing;
          this.smoothRotation.y += (targetRotationY - this.smoothRotation.y) * rotationSmoothing;
          this.smoothRotation.z += (targetRotationZ - this.smoothRotation.z) * rotationSmoothing;
        } else {
          // First frame - use hand orientation directly
          const rotationSmoothing = 0.3;
          this.smoothRotation.x += (handOrientation.pitch - this.smoothRotation.x) * rotationSmoothing;
          this.smoothRotation.y += (handOrientation.yaw - this.smoothRotation.y) * rotationSmoothing;
          this.smoothRotation.z += (handOrientation.roll - this.smoothRotation.z) * rotationSmoothing;
        }
        
        // Apply 6DOF transform to model - LOCKED TO HAND
        // CRITICAL: Directly set position values - FORCE UPDATE
        this.model3DGroup.position.set(
          this.smoothPosition.x,
          this.smoothPosition.y,
          this.smoothPosition.z
        );
        
        this.model3DGroup.rotation.set(
          this.smoothRotation.x,  // Pitch (rotation around X-axis)
          this.smoothRotation.y,  // Yaw (rotation around Y-axis)
          this.smoothRotation.z   // Roll (rotation around Z-axis)
        );
        
        // Debug: Log position after setting (every 10th frame)
        if ((this.debugFrameCount - 1) % 10 === 0) {
          console.log(`  Model Position AFTER: (${this.model3DGroup.position.x.toFixed(2)}, ${this.model3DGroup.position.y.toFixed(2)}, ${this.model3DGroup.position.z.toFixed(2)})`);
          console.log(`  Position Changed: ${Math.abs(this.model3DGroup.position.x - this.smoothPosition.x) > 0.01 || Math.abs(this.model3DGroup.position.y - this.smoothPosition.y) > 0.01 || Math.abs(this.model3DGroup.position.z - this.smoothPosition.z) > 0.01}`);
        }
        
        // Update cube position for next frame
        this.cubePosition = {
          x: this.smoothPosition.x,
          y: this.smoothPosition.y,
          z: this.smoothPosition.z
        };
        
        // Store hand position for next frame
        this.lastHand3DPosition = { ...handCentroid3D };
        this.lastHandPosition = { x: normalizedX, y: normalizedY };
        
      } else if (this.isHoldingModel && !this.grabOffset) {
        // Holding but no grabOffset - this shouldn't happen, but log it
        console.warn('[CV] isHoldingModel is true but grabOffset is null!');
      }
      
      // Two-hand scaling is handled in detectTwoHandScaling()
      // Single-hand pinch no longer controls scale
      
      if (!this.isHoldingModel && !this.isTouchingCube) {
        // Not touching or not pinching - ensure released
        if (this.isHoldingModel) {
          this.isHoldingModel = false;
          this.grabOffset = null;
          this.lastHandPosition = null;
          this.lastHand3DPosition = null;
          this.baseHandSize = null;
          this.debugFrameCount = 0; // Reset debug counter
        }
      }
      
      // Rotate model continuously when not being held
      if (!this.isHoldingModel) {
        this.model3DGroup.rotation.y += 0.01;
        // Keep cube at its current position (don't reset)
        // Only update if cubePosition has been set (not initial state)
        // Don't reset if position was already moved
        if (this.cubePosition && (this.cubePosition.x !== 0 || this.cubePosition.y !== 0 || this.cubePosition.z !== -2)) {
          this.model3DGroup.position.set(
            this.cubePosition.x,
            this.cubePosition.y,
            this.cubePosition.z
          );
        }
      }
    }
    
    // Drawing mode (index finger ONLY - no other fingers)
    const onlyIndexExtended = indexExtended && 
      hand[12].y > hand[10].y && // Middle down
      hand[16].y > hand[14].y && // Ring down
      hand[20].y > hand[18].y && // Pinky down
      hand[4].y > hand[3].y; // Thumb down
    
    if (onlyIndexExtended && !isPinching) {
      this.drawingMode = true;
      
      if (this.lastDrawingPoint) {
        const distance = Math.sqrt(
          Math.pow(indexTipX - this.lastDrawingPoint.x, 2) + 
          Math.pow(indexTipY - this.lastDrawingPoint.y, 2)
        );
        
        if (distance > 5) {
          const now = Date.now();
          this.drawingPath.push({ x: indexTipX, y: indexTipY, timestamp: now });
          this.lastDrawingPoint = { x: indexTipX, y: indexTipY };
          
          if (this.drawingPath.length > 1000) {
            this.drawingPath.shift();
          }
        }
      } else {
        const now = Date.now();
        this.drawingPath.push({ x: indexTipX, y: indexTipY, timestamp: now });
        this.lastDrawingPoint = { x: indexTipX, y: indexTipY };
      }
    } else {
      this.drawingMode = false;
      this.lastDrawingPoint = null;
    }
    
    // Removed thumbs-up and peace sign gestures - confetti only on tap
    
    // Clear drawing gesture (closed fist)
    if (fist && this.drawingPath.length > 0) {
      setTimeout(() => {
        if (this.drawingPath.length > 0) {
          this.drawingPath = [];
          console.log('[CV] Drawing cleared');
        }
      }, 1000);
    }
  }

  detectTwoHandScaling() {
    // Two-hand scaling: use distance between two hands to control cube scale
    if (!this.handData || this.handData.length < 2 || !this.model3DGroup) {
      // Not enough hands - reset scaling state and gradually return to normal size
      if (this.initialHandDistance !== null) {
        this.initialHandDistance = null;
        this.initialScale = 1.0;
      }
      if (this.modelScale < 1.0) {
        this.modelScale = Math.min(1.0, this.modelScale + 0.01);
        this.model3DGroup.scale.set(this.modelScale, this.modelScale, this.modelScale);
      }
      return;
    }
    
    // Get both hands
    const hand1 = this.handData[0];
    const hand2 = this.handData[1];
    
    if (!hand1 || !hand2 || hand1.length < 21 || hand2.length < 21) return;
    
    // Calculate centroids of both hands (using finger tips)
    const hand1Centroid = {
      x: ((1 - hand1[4].x) + (1 - hand1[8].x) + (1 - hand1[12].x) + (1 - hand1[16].x) + (1 - hand1[20].x)) / 5,
      y: (hand1[4].y + hand1[8].y + hand1[12].y + hand1[16].y + hand1[20].y) / 5
    };
    
    const hand2Centroid = {
      x: ((1 - hand2[4].x) + (1 - hand2[8].x) + (1 - hand2[12].x) + (1 - hand2[16].x) + (1 - hand2[20].x)) / 5,
      y: (hand2[4].y + hand2[8].y + hand2[12].y + hand2[16].y + hand2[20].y) / 5
    };
    
    // Calculate distance between hands in screen space (pixels)
    const handDistance = Math.sqrt(
      Math.pow((hand1Centroid.x - hand2Centroid.x) * this.canvas.width, 2) +
      Math.pow((hand1Centroid.y - hand2Centroid.y) * this.canvas.height, 2)
    );
    
    // Store initial distance on first detection
    if (this.initialHandDistance === null) {
      this.initialHandDistance = handDistance;
      this.initialScale = this.modelScale;
      console.log(`[CV] Two-hand scaling initialized: distance=${handDistance.toFixed(1)}px, scale=${this.modelScale.toFixed(2)}`);
    }
    
    // Calculate scale based on hand distance
    // Closer hands = smaller scale, farther hands = larger scale
    // Max scale: half of screen height in 3D units
    const distance = Math.abs(this.cubePosition.z - this.camera3D.position.z);
    const fov = this.camera3D.fov * Math.PI / 180;
    const screenHeight3D = 2 * Math.tan(fov / 2) * distance;
    const maxScale = screenHeight3D * 0.5; // Half screen height
    
    const scaleFactor = handDistance / this.initialHandDistance;
    const targetScale = Math.max(0.3, Math.min(maxScale, this.initialScale * scaleFactor));
    
    // Smooth interpolation
    this.modelScale += (targetScale - this.modelScale) * 0.1;
    this.model3DGroup.scale.set(this.modelScale, this.modelScale, this.modelScale);
  }

  onGesture(gesture) {
    // Gesture handling removed - confetti only on tap
  }

  createParticleBurst() {
    // Create beautiful confetti burst effect with professional colors
    const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];
    
    for (let i = 0; i < 80; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 2, // Slight upward bias
        life: 1.0,
        decay: 0.015,
        color: color,
        size: Math.random() * 4 + 2
      });
    }
  }

  render() {
    if (!this.isRunning) return;
    
    // Clear canvas
    this.ctx.fillStyle = '#0a0f11';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw video frame (mirrored correctly)
    if (this.video && this.video.readyState >= 2) {
      this.ctx.save();
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(this.video, -this.canvas.width, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
    
    // Draw saved drawing paths
    this.drawSavedPaths();
    
    // Run detection (this updates cube position if holding)
    this.detect();
    
    // Update particles
    this.updateParticles();
    
    // Update reaction particles
    this.updateReactionParticles();
    
    // Render 3D scene (cube position is updated in detectGestures)
    if (this.renderer3D && this.scene3D && this.camera3D) {
      // Update cube particles
      this.updateCubeParticles();
      
      // Rotate tesseract for better visibility
      if (this.model3D) {
        this.model3D.rotation.x += 0.005;
        this.model3D.rotation.y += 0.01;
      }
      
      // Update camera aspect ratio if container size changed
      const container = document.getElementById('cv-3d-container');
      if (container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width > 0 && height > 0 && this.camera3D.aspect !== width / height) {
          this.camera3D.aspect = width / height;
          this.camera3D.updateProjectionMatrix();
          this.renderer3D.setSize(width, height);
        }
      }
      
      this.renderer3D.render(this.scene3D, this.camera3D);
    }
    
    requestAnimationFrame(() => this.render());
  }

  drawSavedPaths() {
    if (this.drawingPath.length < 2) return;
    
    const now = Date.now();
    const fadeDuration = 5000; // 5 seconds
    
    // Professional gradient colors
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, '#6366f1'); // Indigo
    gradient.addColorStop(0.5, '#8b5cf6'); // Purple
    gradient.addColorStop(1, '#a78bfa'); // Light purple
    
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Filter paths that are older than 5 seconds
    const validPaths = this.drawingPath.filter(point => {
      if (!point.timestamp) return true; // Legacy points without timestamp
      return (now - point.timestamp) < fadeDuration;
    });
    
    // Remove expired paths
    if (validPaths.length < this.drawingPath.length) {
      this.drawingPath = validPaths;
    }
    
    if (validPaths.length < 2) return;
    
    // Calculate fade alpha based on age
    const oldestTimestamp = validPaths[0].timestamp || now;
    const age = now - oldestTimestamp;
    const fadeAlpha = Math.max(0, 1 - (age / fadeDuration));
    
    this.ctx.globalAlpha = fadeAlpha * 0.9;
    
    this.ctx.beginPath();
    this.ctx.moveTo(validPaths[0].x, validPaths[0].y);
    
    for (let i = 1; i < validPaths.length; i++) {
      this.ctx.lineTo(validPaths[i].x, validPaths[i].y);
    }
    
    this.ctx.stroke();
    this.ctx.globalAlpha = 1.0;
  }

  updateParticles() {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // Gravity effect
      particle.life -= particle.decay;
      
      if (particle.life > 0) {
        // Use particle color if available, otherwise fallback
        if (particle.color) {
          const alpha = particle.life;
          // Convert hex to rgba
          const hex = particle.color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else {
          this.ctx.fillStyle = `rgba(99, 102, 241, ${particle.life})`; // Indigo fallback
        }
        const size = particle.size || 3;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        this.ctx.fill();
        return true;
      }
      return false;
    });
  }

  start() {
    this.isRunning = true;
    this.render();
    console.log('[CV] Showcase started');
  }


  stop() {
    this.isRunning = false;
    if (this.video && this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(track => track.stop());
      this.video.srcObject = null;
    }
    if (this.video) {
      this.video.pause();
    }
    
    // Clear canvas
    if (this.ctx && this.canvas) {
      this.ctx.fillStyle = '#0a0f11';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Showcase stopped
  }
}

// Initialize on load
window.CVShowcase = CVShowcase;
