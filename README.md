# ICEMAN404 Portfolio

<div align="center">

![Portfolio Preview](./screenshots/0.png)

**World-Class AR/VR & Computer Vision Engineer Portfolio**

[![License](https://img.shields.io/badge/License-CC%20BY%203.0-blue.svg)](http://creativecommons.org/licenses/by/3.0/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-4285F4?logo=google&logoColor=white)](https://mediapipe.dev/)

[![Live Site](https://img.shields.io/badge/Live%20Site-www.iceman404.com-00b9cc?style=for-the-badge)](https://www.iceman404.com)
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/iceman404)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/john-subba-ic3man404/)

</div>

---

## Overview

A cutting-edge portfolio website showcasing advanced AR/VR and Computer Vision capabilities through real-time interactive demonstrations. Built with modern web technologies, this portfolio demonstrates world-class technical expertise in computer vision, 3D graphics, and systems-level engineering.

### Key Highlights

- **Real-Time Computer Vision**: MediaPipe-powered face, hand, and pose tracking
- **6DOF Hand Tracking**: Advanced 3D model manipulation with physics-accurate scaling
- **Interactive 3D Graphics**: Three.js-powered scenes with GLTF model loading
- **Comprehensive Control Panel**: 30+ professional themes with real-time customization
- **Performance Optimized**: Core Web Vitals monitoring, lazy loading, and optimized rendering
- **Cross-Platform**: Works seamlessly on desktop, mobile, tablets, and Chromebooks
- **SEO Optimized**: Complete meta tags, structured data, and sitemap implementation

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Key Features](#key-features)
- [Browser Support](#browser-support)
- [Performance](#performance)
- [License](#license)
- [Contact](#contact)

---

## Features

### AR/VR Computer Vision Showcase

**Real-Time Hand Tracking & Gesture Recognition**
- 6DOF hand tracking (position and orientation)
- Two-hand scaling with surface touch detection
- Single-hand depth-based scaling
- Physics-accurate model manipulation
- Interactive drawing mode with finger tracking

**Face & Pose Detection**
- Real-time face mesh generation
- Face expression detection (smiling, laughing, blowing)
- Eye gaze tracking
- Full body pose estimation
- Volumetric rendering effects

**3D Model Integration**
- GLTF model loading and rendering
- Multiple preset models (tesseract, duck, helmet, flamingo, cube)
- Custom model URL support
- Dynamic scaling and rotation controls
- Interactive model manipulation

### Control Panel

**Theme Customization**
- 30+ professional themes (KDE themes, custom themes)
- Real-time preview of all changes
- Persistent settings via localStorage
- Export/import configuration as JSON
- Dynamic CSS custom properties

**3D Model Customization**
- Model selection (tesseract or GLTF models)
- Scale adjustment (0.1x to 3x)
- Rotation speed control
- Cube color customization (outer, inner, edge, emissive)
- Custom model URL loading

### Core Website Features

**Responsive Design**
- Mobile-first approach
- Touch gesture support
- Cross-platform compatibility
- Adaptive layouts for all screen sizes

**Performance & Optimization**
- Core Web Vitals monitoring
- Lazy image loading
- Optimized particle effects with limits
- Service Worker for offline support
- Performance monitoring dashboard

**SEO & Accessibility**
- Complete meta tags and Open Graph
- Structured data (Schema.org)
- Semantic HTML with ARIA labels
- Sitemap and robots.txt
- Clean URLs (no .html extensions)

---

## Technology Stack

### Core Technologies

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

### Libraries & Frameworks

[![Three.js](https://img.shields.io/badge/Three.js-r128-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Vision-4285F4?logo=google&logoColor=white)](https://mediapipe.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Particle.js](https://img.shields.io/badge/Particle.js-2.0-000000?logo=javascript&logoColor=white)](https://github.com/VincentGarreau/particles.js)

### Development Tools

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-9+-CB3837?logo=npm&logoColor=white)](https://www.npmjs.com/)
[![ESLint](https://img.shields.io/badge/ESLint-8.54-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3.1-F7B93E?logo=prettier&logoColor=white)](https://prettier.io/)

---

## Project Structure

```
Creative-Coder-Portfolio/
│
├── index.html                    # Main homepage
├── bio.html                      # Bio page with AR/VR CV showcase
├── skills.html                   # Skills page with holographic visualization
├── contacts.html                 # Contact page with form
├── iceman404_control_panel.html  # Comprehensive control panel
├── 404.html                      # Custom 404 error page
│
├── js/
│   ├── cv-showcase.js            # AR/VR CV showcase core logic
│   ├── settings-manager.js       # Settings persistence system
│   ├── theme-manager.js          # Theme switching logic
│   ├── seo-helper.js             # SEO utilities
│   ├── performance-monitor.js    # Performance tracking
│   ├── error-handler.js           # Error handling system
│   ├── protection.js              # Content protection
│   ├── lazy-load.js               # Lazy loading utilities
│   ├── three-scene.js             # Three.js signature effects
│   ├── signature-effects.js        # Signature visual effects
│   ├── skills-holographic.js      # Skills page 3D effects
│   ├── skills-3d-cube.js          # 3D cube visualization
│   ├── site-navigation.js         # Navigation structure
│   ├── path-helper.js             # Path resolution utilities
│   └── particles-limiter.js       # Particle performance limits
│
├── css/
│   ├── style.css                 # Main stylesheet
│   └── signature-styles.css       # Signature effect styles
│
├── images/
│   ├── profile/                  # Profile images
│   ├── background/               # Background images
│   └── favicon/                  # Favicon files
│
├── project-html-files/            # Individual project detail pages
│   ├── mira.html
│   ├── lora_geofencing.html
│   ├── vision_guardian_commander.html
│   ├── facemood_music_player.html
│   ├── face_counter_system.html
│   ├── fine_tuning_resnet50.html
│   ├── advanced_redis_clone.html
│   └── open_hardware_drone.html
│
├── project-screenshots-files/    # Project screenshots
├── assets/icon-images/            # Technology icons
├── resume/                       # Resume PDF files
│
├── vite.config.js                # Vite development configuration
├── vite.config.ts                # TypeScript Vite config
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Node.js dependencies
├── generate-certs.sh             # SSL certificate generation
├── start-dev.sh                  # Development server script
│
├── robots.txt                    # SEO robots file
├── sitemap.xml                   # SEO sitemap
├── site.webmanifest              # PWA manifest
├── CNAME                         # Custom domain configuration
└── _redirects                    # Netlify redirects
```

---

## Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- Modern web browser with WebGL support
- HTTPS-enabled server (for camera API access on mobile devices)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iceman404/Creative-Coder-Portfolio.git
   cd Creative-Coder-Portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate SSL certificates (for local development):**
   ```bash
   chmod +x generate-certs.sh
   ./generate-certs.sh
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   ./start-dev.sh
   ```

5. **Access the site:**
   - Local: `https://localhost:3000`
   - Network: `https://YOUR_IP:3000`

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

---

## Development

### Development Server

The project uses Vite for fast development with HMR (Hot Module Replacement). The development server runs on HTTPS by default to enable camera API access on mobile devices.

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

### SSL Certificates

For local development with camera access, SSL certificates are required. The `generate-certs.sh` script creates self-signed certificates for localhost.

**Generate certificates:**
```bash
./generate-certs.sh
```

Certificates will be created as:
- `localhost.pem` (certificate)
- `localhost-key.pem` (private key)

These files are gitignored and should not be committed.

### Code Quality

**Linting:**
```bash
npm run lint
```

**Type checking:**
```bash
npm run type-check
```

**Formatting:**
```bash
npm run format
```

---

## Key Features

### AR/VR Computer Vision Showcase

The bio page (`bio.html`) features a real-time computer vision showcase powered by MediaPipe:

- **Hand Tracking**: 6DOF hand tracking with position and orientation
- **Gesture Recognition**: Two-hand scaling, single-hand depth scaling
- **Face Detection**: Real-time face mesh and expression detection
- **Pose Estimation**: Full body pose tracking
- **3D Model Interaction**: Physics-accurate model manipulation
- **Interactive Drawing**: Finger-based drawing mode

### Control Panel

Access the control panel at `iceman404_control_panel.html` to customize:

- **Themes**: 30+ professional themes with real-time preview
- **3D Models**: Select and customize 3D models
- **Cube Colors**: Customize tesseract colors (outer, inner, edge, emissive)
- **Model Settings**: Scale, rotation speed, and custom URLs
- **Settings Persistence**: All settings saved to localStorage

### Performance Monitoring

Built-in performance monitoring tracks:

- **Core Web Vitals**: LCP, FID, CLS
- **Page Load Metrics**: DNS, TCP, request, response times
- **Resource Timing**: Asset loading performance
- **Error Tracking**: Comprehensive error logging

---

## Browser Support

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome | 90+ | Fully Supported |
| Firefox | 88+ | Fully Supported |
| Safari | 14+ | Fully Supported |
| Edge | 90+ | Fully Supported |
| Opera | 76+ | Fully Supported |

**Mobile Support:**
- iOS Safari 14+
- Chrome Android 90+
- Samsung Internet 14+

**Features Requiring HTTPS:**
- Camera API (MediaPipe)
- Service Worker (PWA)
- WebGL (Three.js)

---

## Performance

### Optimization Strategies

- **Lazy Loading**: Images load on demand
- **Code Splitting**: Modular JavaScript architecture
- **Asset Optimization**: AVIF image format with fallbacks
- **Particle Limits**: Throttled particle generation
- **Render Optimization**: Throttled animations, hidden page detection
- **CDN Usage**: External libraries loaded from CDN
- **Service Worker**: Caching strategy for offline support

### Performance Metrics

- **Page Load Time**: < 3 seconds
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Time to Interactive**: < 3.5 seconds

---

## License

This project is licensed under the Creative Commons Attribution 3.0 License.

See the [LICENSE.txt](./LICENSE.txt) file for details.

---

## Contact

**John Subba (iceman404)**

GPU-Accelerated Computer Vision Engineer | AR/VR Specialist

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white&style=for-the-badge)](https://github.com/iceman404)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?logo=linkedin&logoColor=white&style=for-the-badge)](https://www.linkedin.com/in/john-subba-ic3man404/)
[![Email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white&style=for-the-badge)](mailto:johnsubba404@gmail.com)
[![Website](https://img.shields.io/badge/Website-www.iceman404.com-00b9cc?style=for-the-badge)](https://www.iceman404.com)

</div>

---

## Acknowledgments

- **MediaPipe**: Google's MediaPipe Vision API for computer vision capabilities
- **Three.js**: 3D graphics library for WebGL rendering
- **Vite**: Next-generation frontend build tool
- **Particle.js**: Particle animation library
- **Font Awesome**: Icon library

---

<div align="center">

**Built with modern web technologies | Optimized for performance | Designed for excellence**

[![GitHub Stars](https://img.shields.io/github/stars/iceman404/Creative-Coder-Portfolio?style=social)](https://github.com/iceman404/Creative-Coder-Portfolio)
[![GitHub Forks](https://img.shields.io/github/forks/iceman404/Creative-Coder-Portfolio?style=social)](https://github.com/iceman404/Creative-Coder-Portfolio)

</div>
