/**
 * vault-rain.js — GPU Lab lock-screen background.
 *
 * The same look as the skills-page rain (glowing streaks with a bright
 * droplet tip), rendered with a WebGPU instanced pipeline when the
 * browser exposes one, and a 2D canvas implementation otherwise.
 * Theme-aware via the `--rain-rgb` token: white drops on dark, blue on
 * light, recolored live on `themechange`.
 *
 * Behaviour contract:
 *   - Disabled entirely under prefers-reduced-motion.
 *   - Pauses while the tab is hidden (no hidden rAF work).
 *   - Fades out and shuts down on the `vault-unlocked` event, which the
 *     vault script dispatches after a successful passphrase.
 *   - Any WebGPU failure (no adapter, no context, device error) degrades
 *     to the 2D fallback exactly once.
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var DROP_COUNT = 22;    // matches the skills-page density (20 concurrent)
  var mode = null;        // 'webgpu' | 'canvas2d'
  var container = null;
  var rafId = null;
  var running = false;

  /* ---------- shared helpers ---------- */

  function rainRgb() {
    var raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--rain-rgb')
      .trim()
      .split(',')
      .map(function (x) { return parseFloat(x); });
    if (raw.length !== 3 || raw.some(isNaN)) return [0.62, 0.76, 0.79];
    return raw;
  }

  function mount() {
    container = document.createElement('div');
    container.id = 'vault-rain';
    container.setAttribute('aria-hidden', 'true');
    container.style.cssText =
      'position:fixed;inset:0;z-index:0;pointer-events:none;transition:opacity 1s ease;';
    document.body.appendChild(container);
    return container;
  }

  function fadeOutAndStop() {
    if (!container) return;
    container.style.opacity = '0';
    window.setTimeout(function () {
      running = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      if (container && container.parentNode) container.parentNode.removeChild(container);
    }, 1100);
  }

  window.addEventListener('vault-unlocked', fadeOutAndStop);

  /* ---------- WebGPU path ---------- */

  var WGSL = [
    'struct Uniforms {',
    '  time : f32,',
    '  width : f32,',
    '  height : f32,',
    '  dropCount : f32,',
    '  color : vec4<f32>,',
    '};',
    '',
    '@group(0) @binding(0) var<uniform> u : Uniforms;',
    '',
    'struct VertexOutput {',
    '  @builtin(position) pos : vec4<f32>,',
    '  @location(0) uv : vec2<f32>,',
    '  @location(1) fade : f32,',
    '};',
    '',
    '@vertex',
    'fn vs_main(@builtin(vertex_index) vi : u32, @builtin(instance_index) ii : u32) -> VertexOutput {',
    '  let cx = select(0.0, 1.0, vi == 1u || vi == 5u);',
    '  let cy = select(0.0, 1.0, vi == 2u || vi == 3u);',
    '  let seed = f32(ii) * 0.61803398875;',
    '',
    '  let r1 = fract(sin(seed * 12.9898) * 43758.5453);',
    '  let r2 = fract(sin(seed * 78.233) * 43758.5453);',
    '  let r3 = fract(sin(seed * 39.3468) * 43758.5453);',
    '  let r4 = fract(sin(seed * 95.1345) * 43758.5453);',
    '',
    '  let dropW = 9.0;',
    '  let dropH = 25.0 + r2 * 20.0;',
    '  let speed = 110.0 + r3 * 160.0;',
    '  let x = r1 * u.width;',
    '  let travelled = fract(r2 + u.time * speed / max(u.height, 1.0)) * (u.height + 60.0) - 30.0;',
    '',
    '  let px = x + cx * dropW;',
    '  let py = travelled + cy * dropH;',
    '  let fadeEdges = clamp(min(max(py, 0.0) / 70.0, max(u.height - py, 0.0) / 80.0), 0.0, 1.0);',
    '',
    '  var vo : VertexOutput;',
    '  vo.pos = vec4<f32>(px / u.width * 2.0 - 1.0, 1.0 - py / u.height * 2.0, 0.0, 1.0);',
    '  vo.uv = vec2<f32>(cx, cy);',
    '  vo.fade = fadeEdges;',
    '  return vo;',
    '}',
    '',
    '@fragment',
    'fn fs_main(vin : VertexOutput) -> @location(0) vec4<f32> {',
    '  let dx = abs(vin.uv.x - 0.5) * 9.0;',
    '  let core = exp(-dx * dx / 1.1);',
    '  let halo = exp(-dx * dx / 6.5);',
    '  let body = mix(0.10, 0.92, vin.uv.y);',
    '  let tip = smoothstep(0.75, 1.0, vin.uv.y);',
    '  let alpha = u.color.a * vin.fade * clamp(core * body + halo * 0.38 * body + tip * 0.55, 0.0, 1.0);',
    '  return vec4<f32>(u.color.rgb * alpha, alpha);',
    '}'
  ].join('\n');

  function startWebGPU() {
    if (!navigator.gpu) return Promise.reject(new Error('webgpu unavailable'));

    return navigator.gpu.requestAdapter().then(function (adapter) {
      if (!adapter) throw new Error('no adapter');
      return adapter.requestDevice();
    }).then(function (device) {
      var canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
      container.appendChild(canvas);

      var context = canvas.getContext('webgpu');
      if (!context) throw new Error('no webgpu context');

      var format = navigator.gpu.getPreferredCanvasFormat();
      context.configure({ device: device, format: format, alphaMode: 'premultiplied' });

      var uniformBuffer = device.createBuffer({
        size: 8 * 4, // time, width, height, dropCount, r, g, b, a
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      });

      var module = device.createShaderModule({ code: WGSL });
      var pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: { module: module, entryPoint: 'vs_main' },
        fragment: {
          module: module,
          entryPoint: 'fs_main',
          targets: [{
            format: format,
            blend: {
              color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
              alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' }
            }
          }]
        },
        primitive: { topology: 'triangle-list' }
      });

      var bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
      });

      var uniforms = new Float32Array(8);
      var startTime = performance.now();

      function sizeCanvas() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.floor(container.clientWidth * dpr));
        canvas.height = Math.max(1, Math.floor(container.clientHeight * dpr));
      }
      sizeCanvas();
      window.addEventListener('resize', sizeCanvas);

      function frame() {
        if (!running) return;
        rafId = window.requestAnimationFrame(frame);
        if (document.hidden) return;

        var rgb = rainRgb();
        uniforms[0] = (performance.now() - startTime) / 1000;
        uniforms[1] = container.clientWidth;
        uniforms[2] = container.clientHeight;
        uniforms[3] = DROP_COUNT;
        uniforms[4] = rgb[0] / 255;
        uniforms[5] = rgb[1] / 255;
        uniforms[6] = rgb[2] / 255;
        uniforms[7] = 0.9;
        device.queue.writeBuffer(uniformBuffer, 0, uniforms);

        try {
          var encoder = device.createCommandEncoder();
          var pass = encoder.beginRenderPass({
            colorAttachments: [{
              view: context.getCurrentTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: 'clear',
              storeOp: 'store'
            }]
          });
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, bindGroup);
          pass.draw(6, DROP_COUNT);
          pass.end();
          device.queue.submit([encoder.finish()]);
        } catch (err) {
          running = false;
          container.innerHTML = '';
          startCanvas2D(); // degrade once, permanently
        }
      }

      running = true;
      mode = 'webgpu';
      container.setAttribute('data-engine', 'webgpu');
      frame();
    });
  }

  /* ---------- 2D canvas fallback ---------- */

  function startCanvas2D() {
    if (mode) return;
    mode = 'canvas2d';
    container.setAttribute('data-engine', 'canvas2d');

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    container.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var drops = [];
    var MAX_DROPS = 20;
    var rgb = rainRgb();
    var last = performance.now();

    function sizeCanvas() {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    window.addEventListener('themechange', function () { rgb = rainRgb(); });

    function spawn() {
      drops.push({
        x: 4 + Math.random() * (canvas.width - 8),
        y: -40,
        v: 110 + Math.random() * 160,
        l: 25 + Math.random() * 20
      });
    }

    function frame(now) {
      if (!running) return;
      rafId = window.requestAnimationFrame(frame);
      if (document.hidden) return;

      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      while (drops.length < MAX_DROPS) spawn();

      ctx.lineCap = 'round';
      ctx.lineWidth = 3;

      for (var i = drops.length - 1; i >= 0; i--) {
        var d = drops[i];
        d.y += d.v * dt;
        if (d.y - d.l > canvas.height) { drops.splice(i, 1); continue; }

        var grad = ctx.createLinearGradient(d.x, d.y - d.l, d.x, d.y);
        grad.addColorStop(0, 'rgba(' + rgb.join(',') + ',0.08)');
        grad.addColorStop(0.7, 'rgba(' + rgb.join(',') + ',0.7)');
        grad.addColorStop(1, 'rgba(' + rgb.join(',') + ',0.9)');
        ctx.strokeStyle = grad;
        ctx.shadowColor = 'rgba(' + rgb.join(',') + ',0.45)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y - d.l);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(' + rgb.join(',') + ',0.6)';
        ctx.beginPath();
        ctx.arc(d.x, d.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    running = true;
    window.requestAnimationFrame(frame);
  }

  /* ---------- entry ---------- */

  function start() {
    mount();
    startWebGPU().catch(function () { startCanvas2D(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
