/**
 * SEO Helper - Vanilla JavaScript
 * Ensures consistent SEO metadata and breadcrumbs across all pages
 */

(function() {
  'use strict';

  const SEOHelper = {
    siteConfig: {
      name: 'John Subba | iceman404',
      url: 'https://www.iceman404.com',
      description: 'Portfolio of John Subba (iceman404) - Systems Expert, AI Engineer, and Embedded Systems Developer',
      author: 'John Subba | iceman404',
      image: 'https://www.iceman404.com/images/profile/main-profile.avif',
      twitter: '@ic3man404',
      locale: 'en_US'
    },

    pages: {
      '/': {
        title: 'Portfolio | John Subba | iceman404',
        description: 'Portfolio of John Subba | iceman404 | Systems Expert, AI Engineer, and Embedded Systems Developer',
        breadcrumbs: [
          { name: 'Home', url: 'https://www.iceman404.com/' }
        ]
      },
      '/bio': {
        title: 'Bio | John Subba | iceman404',
        description: 'Bio page of John Subba (iceman404) - Learn about my journey, interests, and background in technology and AI.',
        breadcrumbs: [
          { name: 'Home', url: 'https://www.iceman404.com/' },
          { name: 'Bio', url: 'https://www.iceman404.com/bio' }
        ]
      },
      '/skills': {
        title: 'Skills | John Subba | iceman404',
        description: 'Technical skills and expertise of John Subba (iceman404) - Programming languages, AI/ML, Cloud, and Systems Engineering.',
        breadcrumbs: [
          { name: 'Home', url: 'https://www.iceman404.com/' },
          { name: 'Skills', url: 'https://www.iceman404.com/skills' }
        ]
      },
      '/contacts': {
        title: 'Contact | John Subba | iceman404',
        description: 'Contact page for John Subba (iceman404) - Get in touch for collaborations, queries, or just to say Hi.',
        breadcrumbs: [
          { name: 'Home', url: 'https://www.iceman404.com/' },
          { name: 'Contact', url: 'https://www.iceman404.com/contacts' }
        ]
      },
      '/project-html-files/mira': {
        title: 'MIRA - DTMF Appliance Automation | John Subba | iceman404',
        description: 'MIRA - DTMF Appliance Automation System by John Subba (iceman404). Embedded C & 8052 Assembly-based project for home automation.',
        breadcrumbs: [
          { name: 'Home', url: 'https://www.iceman404.com/' },
          { name: 'Projects', url: 'https://www.iceman404.com/#projects' },
          { name: 'MIRA', url: 'https://www.iceman404.com/project-html-files/mira' }
        ]
      },
      '/project-html-files/lora_geofencing': {
        title: 'LORA Geofencing | John Subba | iceman404',
        description: 'LORA Geofencing project by John Subba (iceman404) - ESP32 & LORA based geofencing system.',
        breadcrumbs: [
          { name: 'Home', url: 'https://www.iceman404.com/' },
          { name: 'Projects', url: 'https://www.iceman404.com/#projects' },
          { name: 'LORA Geofencing', url: 'https://www.iceman404.com/project-html-files/lora_geofencing' }
        ]
      },
      '/project-html-files/vision_guardian_commander': {
        title: 'VisionGuardianCommander | John Subba | iceman404',
        description: 'VisionGuardianCommander - Java & OpenCV project by John Subba (iceman404) for computer vision applications.',
        breadcrumbs: [
          { name: 'Home', url: 'https://www.iceman404.com/' },
          { name: 'Projects', url: 'https://www.iceman404.com/#projects' },
          { name: 'VisionGuardianCommander', url: 'https://www.iceman404.com/project-html-files/vision_guardian_commander' }
        ]
      },
      '/project-html-files/facemood_music_player': {
        title: 'Facemood Music Player | John Subba | iceman404',
        description: 'Facemood Music Player - Raspberry Pi project by John Subba (iceman404) using facial recognition for music control.',
        breadcrumbs: [
          { name: 'Home', url: 'https://www.iceman404.com/' },
          { name: 'Projects', url: 'https://www.iceman404.com/#projects' },
          { name: 'Facemood Music Player', url: 'https://www.iceman404.com/project-html-files/facemood_music_player' }
        ]
      },
      '/project-html-files/face_counter_system': {
        title: 'Face Counter System | John Subba | iceman404',
        description: 'Face Counter System - Edge ML with ESP32 Server project by John Subba (iceman404) for real-time face counting.',
        breadcrumbs: [
          { name: 'Home', url: 'https://www.iceman404.com/' },
          { name: 'Projects', url: 'https://www.iceman404.com/#projects' },
          { name: 'Face Counter System', url: 'https://www.iceman404.com/project-html-files/face_counter_system' }
        ]
      },
      '/project-html-files/fine_tuning_resnet50': {
        title: 'Fine-Tuning ResNet50 | John Subba | iceman404',
        description: 'Fine-Tuning ResNet50 - Computer Vision project by John Subba (iceman404) using transfer learning.',
        breadcrumbs: [
          { name: 'Home', url: 'https://www.iceman404.com/' },
          { name: 'Projects', url: 'https://www.iceman404.com/#projects' },
          { name: 'Fine-Tuning ResNet50', url: 'https://www.iceman404.com/project-html-files/fine_tuning_resnet50' }
        ]
      },
      '/project-html-files/advanced_redis_clone': {
        title: 'Advanced Redis Clone | John Subba | iceman404',
        description: 'Advanced Redis Clone - Systems programming project by John Subba (iceman404) implementing a Redis-like in-memory database.',
        breadcrumbs: [
          { name: 'Home', url: 'https://www.iceman404.com/' },
          { name: 'Projects', url: 'https://www.iceman404.com/#projects' },
          { name: 'Advanced Redis Clone', url: 'https://www.iceman404.com/project-html-files/advanced_redis_clone' }
        ]
      },
      '/project-html-files/open_hardware_drone': {
        title: 'Open Hardware Drone | John Subba | iceman404',
        description: 'Open Hardware Drone - ESP32 based drone project by John Subba (iceman404) for open-source UAV development.',
        breadcrumbs: [
          { name: 'Home', url: 'https://www.iceman404.com/' },
          { name: 'Projects', url: 'https://www.iceman404.com/#projects' },
          { name: 'Open Hardware Drone', url: 'https://www.iceman404.com/project-html-files/open_hardware_drone' }
        ]
      }
    },

    init() {
      const currentPath = this.getCurrentPath();
      const pageConfig = this.pages[currentPath] || this.pages['/'];
      
      this.updateMetaTags(pageConfig, currentPath);
      this.addBreadcrumbs(pageConfig);
      this.addStructuredData(pageConfig, currentPath);
      this.addPersonSchema();
    },

    getCurrentPath() {
      const path = window.location.pathname;
      // Remove trailing slash except for root
      return path === '/' ? '/' : path.replace(/\/$/, '');
    },

    updateMetaTags(pageConfig, path) {
      // Update title if not already set
      if (!document.querySelector('title')) {
        const title = document.createElement('title');
        title.textContent = pageConfig.title;
        document.head.appendChild(title);
      }

      // Ensure canonical URL
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = this.siteConfig.url + path;

      // Update or add Open Graph tags
      this.setMetaTag('property', 'og:title', pageConfig.title);
      this.setMetaTag('property', 'og:description', pageConfig.description);
      this.setMetaTag('property', 'og:url', this.siteConfig.url + path);
      this.setMetaTag('property', 'og:type', 'website');
      this.setMetaTag('property', 'og:image', this.siteConfig.image);
      this.setMetaTag('property', 'og:site_name', this.siteConfig.name);
      this.setMetaTag('property', 'og:locale', this.siteConfig.locale);

      // Update or add Twitter Card tags
      this.setMetaTag('name', 'twitter:card', 'summary_large_image');
      this.setMetaTag('name', 'twitter:title', pageConfig.title);
      this.setMetaTag('name', 'twitter:description', pageConfig.description);
      this.setMetaTag('name', 'twitter:image', this.siteConfig.image);
      this.setMetaTag('name', 'twitter:creator', this.siteConfig.twitter);

      // Update description meta tag
      this.setMetaTag('name', 'description', pageConfig.description);
      this.setMetaTag('name', 'author', this.siteConfig.author);
    },

    setMetaTag(attr, name, content) {
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    },

    addBreadcrumbs(pageConfig) {
      // Remove existing breadcrumb structured data
      const existing = document.querySelector('script[type="application/ld+json"]');
      if (existing && existing.textContent.includes('BreadcrumbList')) {
        return; // Already exists
      }

      const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: pageConfig.breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url
        }))
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(breadcrumbData);
      document.head.appendChild(script);
    },

    addStructuredData(pageConfig, path) {
      // Add WebPage schema
      const webpageData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        url: this.siteConfig.url + path,
        name: pageConfig.title,
        description: pageConfig.description,
        inLanguage: 'en-US',
        isPartOf: {
          '@type': 'WebSite',
          name: this.siteConfig.name,
          url: this.siteConfig.url
        },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: pageConfig.breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url
          }))
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(webpageData);
      document.head.appendChild(script);
    },

    addPersonSchema() {
      // Add Person schema (only on homepage)
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        const personData = {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'John Subba',
          alternateName: 'iceman404',
          url: this.siteConfig.url,
          jobTitle: 'Systems Expert & AI Engineer',
          description: 'Systems Expert, AI Engineer, and Embedded Systems Developer specializing in C/C++, Python, Machine Learning, and Systems Programming.',
          sameAs: [
            'https://github.com/iceman404',
            'https://www.linkedin.com/in/john-subba-ic3man404/',
            'https://x.com/ic3man404'
          ],
          knowsAbout: [
            'Systems Programming',
            'Machine Learning',
            'Deep Learning',
            'Computer Vision',
            'Embedded Systems',
            'C Programming',
            'C++ Programming',
            'Python Programming',
            'Cloud Computing',
            'Kubernetes',
            'Docker'
          ]
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(personData);
        document.head.appendChild(script);
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SEOHelper.init());
  } else {
    SEOHelper.init();
  }

  // Export globally
  window.SEOHelper = SEOHelper;
})();
