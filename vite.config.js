/**
 * Simple Vite config for local development with HTTPS
 * HTTPS is required for camera API on mobile devices
 * This is for testing only - can be ignored when uploading to GitHub
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

// Check for existing certificates or use Vite's auto-generation
let httpsConfig = false;

try {
  const certPath = path.resolve(__dirname, 'localhost.pem');
  const keyPath = path.resolve(__dirname, 'localhost-key.pem');
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    httpsConfig = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    };
    console.log('Using existing SSL certificates');
  } else {
    // Use Vite's built-in certificate generation
    // Vite will generate certificates compatible with modern browsers
    httpsConfig = true;
    console.log('No existing certificates found. Vite will generate self-signed certs.');
    console.log('You may need to accept the security warning in your browser.');
    console.log('For localhost: Click Advanced -> Proceed to localhost (unsafe)');
  }
} catch (error) {
  console.warn('Could not set up HTTPS certificates:', error.message);
  console.warn('Camera API may not work on mobile devices without HTTPS');
  httpsConfig = true; // Fallback to auto-generated
}

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: true,
    host: true,
    https: httpsConfig,
    strictPort: false, // Allow port fallback if 3000 is taken
    hmr: {
      protocol: 'wss' // Use secure WebSocket for HTTPS
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        bio: resolve(__dirname, 'bio.html'),
        skills: resolve(__dirname, 'skills.html'),
        contacts: resolve(__dirname, 'contacts.html'),
        controlPanel: resolve(__dirname, 'iceman404_control_panel.html'),
        '404': resolve(__dirname, '404.html'),
        // Project pages
        mira: resolve(__dirname, 'project-html-files/mira.html'),
        lora_geofencing: resolve(__dirname, 'project-html-files/lora_geofencing.html'),
        vision_guardian_commander: resolve(__dirname, 'project-html-files/vision_guardian_commander.html'),
        facemood_music_player: resolve(__dirname, 'project-html-files/facemood_music_player.html'),
        face_counter_system: resolve(__dirname, 'project-html-files/face_counter_system.html'),
        fine_tuning_resnet50: resolve(__dirname, 'project-html-files/fine_tuning_resnet50.html'),
        advanced_redis_clone: resolve(__dirname, 'project-html-files/advanced_redis_clone.html'),
        open_hardware_drone: resolve(__dirname, 'project-html-files/open_hardware_drone.html'),
      },
    },
  },
  publicDir: 'public',
});
