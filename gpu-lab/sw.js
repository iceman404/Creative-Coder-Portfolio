/* gpu-lab service worker — decrypts .enc assets for unlocked sessions.
 *
 * Every file under /gpu-lab/ (except this worker, the lock and the shell)
 * ships as AES-256-GCM ciphertext: [iv 12 bytes][ciphertext]. The key is
 * derived from the passphrase (PBKDF2-HMAC-SHA256, 310k iterations, fixed
 * salt — the passphrase is the secret) and posted here by app.html after
 * the user unlocks. Key lives only in worker memory; closing the tab and
 * restarting the worker re-locks everything.
 *
 * Requests for unknown files fall through to the network with ?raw=1 so
 * nothing here can loop.
 */
'use strict';

var SCOPE = '/gpu-lab/';
var SALT = new Uint8Array([0x0f, 0xea, 0x94, 0x85, 0x33, 0x81, 0x14, 0x5f, 0x90, 0x3d, 0x14, 0x11, 0x0e, 0x1d, 0xdd, 0xdd]);
var PBKDF2_ITERATIONS = 310000;
var keyPromise = null;

var TYPES = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  json: 'application/json; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
  glb: 'model/gltf-binary',
  png: 'image/png',
  jpg: 'image/jpeg',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  avif: 'image/avif',
  wasm: 'application/wasm',
  py: 'text/plain; charset=utf-8',
  c: 'text/plain; charset=utf-8',
  txt: 'text/plain; charset=utf-8'
};

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()); });

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'pass') {
    keyPromise = deriveKey(event.data.pass);
    if (event.source && event.source.postMessage) {
      keyPromise.then(function () {
        event.source.postMessage({ type: 'key-ok' });
      }).catch(function () {
        event.source.postMessage({ type: 'key-bad' });
      });
    }
  }
});

function deriveKey(passphrase) {
  var encoded = new TextEncoder().encode(passphrase);
  return crypto.subtle.importKey('raw', encoded, 'PBKDF2', false, ['deriveKey']).then(function (keyMaterial) {
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: SALT, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
  });
}

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), { status: status, headers: { 'Content-Type': 'application/json' } });
}

function typeFor(file) {
  var ext = file.split('.').pop().toLowerCase();
  return TYPES[ext] || 'application/octet-stream';
}

async function handleEnc(file, encUrl) {
  if (!keyPromise) return jsonResponse({ needsPass: true }, 503);
  var key = await keyPromise;
  var resp = await fetch(encUrl, { cache: 'no-store' });
  if (!resp.ok) {
    return new Response('Not found: ' + file, { status: resp.status === 404 ? 404 : 502, headers: { 'Content-Type': 'text/plain' } });
  }
  var buf = await resp.arrayBuffer();
  var iv = new Uint8Array(buf.slice(0, 12));
  var ciphertext = buf.slice(12);
  var plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ciphertext);
  return new Response(plain, {
    status: 200,
    headers: { 'Content-Type': typeFor(file), 'Cache-Control': 'no-store' }
  });
}

self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== 'GET') return;
  if (url.search.indexOf('raw=1') !== -1) return;
  if (!url.pathname.startsWith(SCOPE)) return;

  var file = url.pathname.slice(SCOPE.length);
  if (file === '' || file === 'index.html' || file === 'app.html' || file === 'sw.js') return;

  // Requests for shipped .enc artifacts pass through untouched; everything
  // else gets the .enc suffix appended before decryption.
  if (!file.endsWith('.enc')) {
    var query = url.search;
    var encUrl = new URL(SCOPE + file + '.enc' + query, url.origin);
    event.respondWith(handleEnc(file, encUrl).catch(function (err) {
      return jsonResponse({ needsPass: true, error: String(err) }, 401);
    }));
    return;
  }
  // .enc artifact request: serve raw with no interpretation
  event.respondWith(fetch(event.request));
});
