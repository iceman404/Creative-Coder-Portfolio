# John Subba (iceman404) Portfolio

<div align="center">

![Portfolio Preview](./screenshots/0.png)

**Systems & Heterogeneous Compute Engineer: GPU/CUDA · Computer Vision · Embedded Systems**

[![License](https://img.shields.io/badge/License-CC%20BY%203.0-blue.svg)](http://creativecommons.org/licenses/by/3.0/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-4285F4?logo=google&logoColor=white)](https://mediapipe.dev/)

[![Live Site](https://img.shields.io/badge/Live%20Site-www.iceman404.com-00b9cc?style=for-the-badge)](https://www.iceman404.com)

</div>

---

## Overview

A hand-built, dependency-free portfolio. No framework, no build step, no site builder:
plain HTML/CSS/JS with Three.js and MediaPipe, deployed as-is to GitHub Pages.

The centerpiece is a **live computer-vision demo** on the [bio page](https://www.iceman404.com/bio):
MediaPipe face/hand/pose tracking runs entirely in your browser and drives a 3D object you can
grab, move, and resize with your bare hands. All inference is client-side, so nothing leaves the device.

## Highlights

- **Real-time CV demo**: MediaPipe tasks-vision on GPU delegate + WebGL rendering
- **Systems projects**: CUDA/ROCm kernel work, sensor fusion, embedded builds (see the résumé for the production work; the project pages cover the hardware builds)
- **Zero build pipeline**: what's in the repo is exactly what ships
- **Static-link CI**: every internal link and asset reference is checked on push
- **Clean routing**: extensionless URLs handled natively by GitHub Pages

## Tech Stack

| Layer | Choice |
|---|---|
| Markup & styling | Semantic HTML5, per-page CSS (no framework) |
| Behavior | Vanilla ES6 JavaScript |
| 3D | Three.js r128 (CDN) |
| CV | MediaPipe Tasks Vision 0.10 (CDN, GPU delegate) |
| Hosting | GitHub Pages via GitHub Actions + custom domain |
| CI | Python-based static link/asset checker |

## Project Structure

```
├── index.html                  # Home: identity, metrics, project grid
├── bio.html                    # Bio + live in-browser CV demo
├── skills.html                 # Evidence-linked skills (no percentage bars)
├── contacts.html               # Contact form (Formspree) + socials
├── 404.html                    # Custom 404 with Three.js easter egg
├── project-html-files/         # One detail page per project
├── js/
│   ├── cv-showcase.js          # The CV demo engine (MediaPipe + hand-grab state machine)
│   ├── three-scene.js          # Homepage 3D background
│   └── ...
├── resume/John-Resume.pdf      # Résumé (linked from every page)
├── og/                         # 1200×630 social-preview images
├── .github/workflows/
│   ├── ci.yml                  # Static link & asset checker
│   └── deploy-pages.yml        # GitHub Pages deployment
└── sw.js                       # Retirement stub (purges legacy caches)
```

## Getting Started

Any static file server works:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

The camera-based CV demo requires `localhost` or HTTPS (browser security policy).

## Deployment

Pushes to `main` trigger two GitHub Actions workflows: the static-link CI check and the
GitHub Pages deployment. The custom domain (`www.iceman404.com`) is configured via `CNAME`.

## License

[Creative Commons Attribution 3.0](http://creativecommons.org/licenses/by/3.0/). See `LICENSE.txt`.

## Contact

- **Email:** johnsubba404@gmail.com
- **LinkedIn:** [john-subba-ic3man404](https://www.linkedin.com/in/john-subba-ic3man404/)
- **GitHub:** [@iceman404](https://github.com/iceman404)
