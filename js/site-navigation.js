/**
 * Site Navigation Helper - Creates site-wide navigation structure
 * Helps Google understand site hierarchy (like ls directory)
 */

(function() {
  'use strict';

  const SiteNavigation = {
    siteMap: {
      '/': {
        title: 'Home',
        children: ['/bio', '/skills', '/contacts', '/#projects']
      },
      '/bio': {
        title: 'Bio',
        parent: '/'
      },
      '/skills': {
        title: 'Skills',
        parent: '/'
      },
      '/contacts': {
        title: 'Contact',
        parent: '/'
      },
      '/#projects': {
        title: 'Projects',
        parent: '/',
        children: [
          '/project-html-files/mira',
          '/project-html-files/lora_geofencing',
          '/project-html-files/vision_guardian_commander',
          '/project-html-files/facemood_music_player',
          '/project-html-files/face_counter_system',
          '/project-html-files/fine_tuning_resnet50',
          '/project-html-files/advanced_redis_clone',
          '/project-html-files/open_hardware_drone'
        ]
      },
      '/project-html-files/mira': {
        title: 'MIRA',
        parent: '/#projects'
      },
      '/project-html-files/lora_geofencing': {
        title: 'LORA Geofencing',
        parent: '/#projects'
      },
      '/project-html-files/vision_guardian_commander': {
        title: 'VisionGuardianCommander',
        parent: '/#projects'
      },
      '/project-html-files/facemood_music_player': {
        title: 'Facemood Music Player',
        parent: '/#projects'
      },
      '/project-html-files/face_counter_system': {
        title: 'Face Counter System',
        parent: '/#projects'
      },
      '/project-html-files/fine_tuning_resnet50': {
        title: 'Fine-Tuning ResNet50',
        parent: '/#projects'
      },
      '/project-html-files/advanced_redis_clone': {
        title: 'Advanced Redis Clone',
        parent: '/#projects'
      },
      '/project-html-files/open_hardware_drone': {
        title: 'Open Hardware Drone',
        parent: '/#projects'
      }
    },

    init() {
      this.addSiteNavigationSchema();
      this.addInternalLinks();
    },

    addSiteNavigationSchema() {
      // Create SiteNavigationElement schema for Google
      const navData = {
        '@context': 'https://schema.org',
        '@type': 'SiteNavigationElement',
        name: 'Main Navigation',
        url: 'https://www.iceman404.com/',
        hasPart: this.buildNavigationStructure()
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(navData);
      document.head.appendChild(script);
    },

    buildNavigationStructure() {
      const structure = [];
      
      // Add main pages
      ['/bio', '/skills', '/contacts'].forEach(path => {
        structure.push({
          '@type': 'SiteNavigationElement',
          name: this.siteMap[path].title,
          url: `https://www.iceman404.com${path}`
        });
      });

      // Add projects section
      const projects = {
        '@type': 'SiteNavigationElement',
        name: 'Projects',
        url: 'https://www.iceman404.com/#projects',
        hasPart: this.siteMap['/#projects'].children.map(child => ({
          '@type': 'SiteNavigationElement',
          name: this.siteMap[child].title,
          url: `https://www.iceman404.com${child}`
        }))
      };
      structure.push(projects);

      return structure;
    },

    addInternalLinks() {
      // Add visible navigation links if not present
      // This helps Google crawl the site structure
      const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
      
      if (!document.querySelector('nav[aria-label="Main Navigation"]')) {
        const nav = document.createElement('nav');
        nav.setAttribute('aria-label', 'Main Navigation');
        nav.setAttribute('role', 'navigation');
        nav.style.cssText = 'display: none;'; // Hidden but crawlable
        
        const links = [
          { href: '/', text: 'Home' },
          { href: '/bio', text: 'Bio' },
          { href: '/skills', text: 'Skills' },
          { href: '/contacts', text: 'Contact' },
          { href: '/#projects', text: 'Projects' }
        ];

        links.forEach(link => {
          const a = document.createElement('a');
          a.href = link.href;
          a.textContent = link.text;
          nav.appendChild(a);
        });

        document.body.insertBefore(nav, document.body.firstChild);
      }
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SiteNavigation.init());
  } else {
    SiteNavigation.init();
  }

  window.SiteNavigation = SiteNavigation;
})();
