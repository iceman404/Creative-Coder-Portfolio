# WebGPU Labs: Engineering Blueprint

Version 1.0 · 2026-11-14 · John Subba (iceman404)
Status: blueprint approved for phased implementation. Details land per milestone.

## 1. Mission

A public laboratory of research-grade GPU algorithm demos, running on WebGPU compute,
inside iceman404.com. Every lab follows one contract:

1. **Base implementation is open.** A readable reference kernel anyone can study.
2. **Optimized implementation is sealed.** The tuned variant ships inside the encrypted
   vault; visitors see the measured delta, not the source.
3. **Numbers on screen.** GPU timestamp latency, throughput vs theoretical peak, and a
   correctness ledger against a CPU or fp32 reference, for every run.
4. **WebGPU only.** The labs require WebGPU; no WebGL fallback path is offered for new
   work. An enablement guide covers browsers that ship it off by default.

The passphrase-protected GPU Lab (`/gpu-lab/`, Metal Forge course) remains the learning
environment. This blueprint covers the public WebGPU Labs section (`/webgpu-labs/`).

## 2. Shared platform (all labs depend on this)

### 2.1 Capability inspector
- Already live on `/webgpu-labs/`: adapter availability, vendor/architecture,
  `maxComputeWorkgroupSizeX`, `maxStorageBufferBindingSize`, `shader-f16`,
  `timestamp-query`.
- Upgrade: when WebGPU is unavailable, render a per-browser enablement guide
  (Chrome, Edge, Brave, Opera, Firefox, Safari) with the exact flags and settings.
  A website cannot flip browser flags; the guide walks the visitor through it.

### 2.2 Model registry and shard loader (Inference Forge, shared with future labs)
- Registry: a versioned JSON manifest listing every supported model. Fields:
  `repo` (HuggingFace id), `revision`, `params`, `quant` (fp16 / Q4 packed),
  `sizeBytes`, `shards` (path, sha256, bytes), `tokenizer`, `minTier`.
- Sources: HuggingFace resolve endpoints serve CORS headers, so the browser fetches
  shards directly from HF. No proxy, no database.
- Loader: stream each shard with progress UI; verify SHA-256 per shard; store the
  decrypted (public) shard in the browser Cache API under the `iceman404-models`
  cache name. Interrupted downloads resume via IndexedDB byte-offset tracking plus
  HTTP Range requests; fall back to a full re-fetch.
- Cache policy: cached shards are reused when the registry hash matches; eviction is
  manual (a lab UI control) plus the browser's own quota handling.
- Model weights are public open-source artifacts and are stored as plaintext cache
  entries. Only the sealed kernel sources and private page content are encrypted.

### 2.3 Device tier detection
- Inputs: adapter info (vendor/architecture), `maxStorageBufferBindingSize`,
  `maxBufferSize`, `shader-f16`, `timestamp-query`, `navigator.deviceMemory` hint.
- Tiers:
  - **S** discrete GPU, 8 GB+ VRAM class: 8B Q4 recommended
  - **A** discrete 4-8 GB or strong iGPU: 4B Q4 recommended
  - **B** integrated, shared memory: 1.7B Q4 or 0.6B
  - **C** WebGPU unavailable or sub-minimum: 0.6B only, or read-only mode
- The tier gates the model registry: models above the tier render locked with the
  reason shown.

### 2.4 Correctness ledger
- Shared module: runs the same input through the kernel and a CPU (or fp32 GPU)
  reference, reports max-abs-error, mean-abs-error, and a pass threshold per op.
- Every lab milestone must extend the ledger before shipping a performance claim.

### 2.5 GPU timing
- Primary: `timestamp-query` feature (renders + compute passes), reported honestly as
  "GPU time" only when the feature exists.
- Fallback: `performance.now()` wall clock around the dispatch, labeled "wall time".

### 2.6 Kernel ladder framework
- A shared harness that runs the same operation at escalating optimization tiers and
  renders the delta: naive → coalesced → workgroup-tiled → quantized (where applicable).
- Each tier is a separate WGSL entry point so the correctness ledger can compare them.

## 3. Lab 1: Inference Forge

Goal: a quantized transformer inference engine hand-written in WGSL compute, streaming
tokens in the browser, with per-kernel instrumentation.

### 3.1 Model registry (planned, all Apache-2.0 or equivalent)
| Model | Params | Q4 est. | Shards (≤80 MB) | Tier |
|---|---|---|---|---|
| GPT-2 124M (fp16) | 0.12B | 0.25 GB | 4 | M1 only |
| Qwen3-0.6B | 0.6B | 0.4 GB | 6 | B |
| Qwen3-1.7B | 1.7B | 1.1 GB | 14 | B |
| Qwen3-4B | 4.0B | 2.5 GB | 32 | A |
| Qwen3-8B | 8.0B | 5.0 GB | 63 | S |

Notes: sizes are weight-only estimates; embeddings and head included. Shards are
packed custom containers (not GGUF): header, per-tensor offsets, quant block layout.
Tokenizer: the model's own BPM/BPE tokenizer data ships in the registry manifest.

### 3.2 Kernel ladder (the base-vs-sealed story)
- Tier 0 (open): naive GEMM, one output element per invocation, global reads.
- Tier 1 (open): coalesced reads, workgroup tiling with `var<workgroup>` staging.
- Tier 2 (sealed): packed 4-bit weights, dequantize-on-load, dual-buffer pipelining.
- Every tier: correctness ledger vs an fp32 CPU reference, GFLOP/s and GB/s reported
  against the adapter's theoretical peak.

### 3.3 Engine phases
- **M1 fp16 forward pass**: GPT-2 class, greedy decode, correctness ledger. Exit gate:
  identical logits to a reference implementation within tolerance.
- **M2 attention + KV cache**: causal attention with a persistent KV buffer, RoPE,
  RMSNorm; prefill (batched prompt) vs decode (single token) as separate dispatch plans.
- **M3 quantization**: 4-bit packed weights, per-block scales, dequantize-on-load GEMM.
- **M4 streaming UI**: tokenizer integration, token streaming, per-kernel latency
  dashboard, model registry picker gated by device tier.

### 3.4 Performance positioning (honest)
- v1 targets "within striking distance" of llama.cpp, not parity: expect a gap, publish
  it. The differentiators: one URL on every GPU vendor, hand-written readable kernels,
  and full instrumentation.
- Memory-bound decode math goes in the lab UI: bytes-per-token vs adapter bandwidth,
  so visitors see why tok/s is what it is.

## 4. Lab 2: Vision Arena

Goal: CV kernels racing side by side, fed by webcam or a rendered 3D scene.

- Sources: webcam via `importExternalTexture` (zero-copy video frame sampling); 3D
  scene rendered to an offscreen texture bound as the compute input.
- Kernel ladder: luminance → gaussian blur (naive vs workgroup-tiled) → Sobel →
  multi-pass Canny chain (blur, gradient, non-max suppression, hysteresis) → Harris
  corners → research-grade optical flow pass.
- Race UI: split view, per-pass GPU timestamp latency, pixel-identical correctness
  badge, resolution selector.
- Camera permission flow reuses the bio demo's battle-tested getUserMedia handling.

## 5. Lab 3: Algorithm Gallery

Goal: interactive solver visualizations from the research literature.

- **Flow Field**: multi-scale variational optical flow (TV-L1): coarse-to-fine warping,
  proximal iterations; base = Horn-Schunck (open).
- **Material World**: material point method simulation: particle-to-grid and
  grid-to-particle transfers with workgroup-shared neighbor data.
- **Light Forge**: ReSTIR-style path tracer: reservoir resampling, progressive
  accumulation, spatial/temporal reuse.
- **Splat Scene**: 3D Gaussian Splatting renderer: splat projection, GPU radix sort by
  tile key, tile-binned alpha blending. Pretrained scenes load from the vault.

Each entry: base implementation open, optimized variant sealed, measured delta on screen.

## 6. Lab 4: AR/VR Lab

Goal: WebXR research with GPU-computed vision passes.

- Phase 1: WebXR `immersive-ar` session research in the Meta Quest browser; the vision
  stack computes on device, the immersive layer renders.
- Phase 2: passthrough computer-vision overlay (WebGPU compute + WebGL render path;
  the WebGPU-WebXR binding is still experimental and the hybrid is the honest state
  of the art).
- Phase 3: hand-tracking fusion with the bio demo pipeline.
- Standing honesty note: consumer AR glasses expose no browser capture API. This lab
  documents that limitation instead of faking an integration.

## 7. WebGPU enablement guide (planned inspector upgrade)

The inspector detects three states: `available`, `adapter missing`, `webgpu missing`.
When not available, it renders per-browser enablement steps:

- **Chrome / Edge 113+**: enabled by default. If missing, update the browser; check
  `chrome://settings/system` hardware acceleration is on; legacy flag
  `chrome://flags/#enable-unsafe-webgpu`.
- **Brave / Opera**: same Chromium flow via `brave://flags` / `opera://flags`.
- **Firefox 141+**: Windows shipping WebGPU by default; older or other platforms via
  `about:config` with `dom.webgpu.enabled`.
- **Safari 26+**: enabled by default on macOS and iOS.
- **Linux**: Chromium-family builds need the Vulkan backend available; verify with
  `vulkaninfo`.

The page never claims to enable WebGPU remotely; it guides the visitor to the switch.

## 8. Security and IP model

- Optimized kernel sources and private page content: AES-256-GCM ciphertext in the
  repo, decrypted at runtime for unlocked sessions. Access control, not DRM; stated
  plainly on the site.
- Open-source model weights: stored as plaintext cache entries (they are public on
  HuggingFace); the registry hashes provide integrity.
- No secrets in the repo. No database. No server-side auth.

## 9. Build order

1. Inference Forge M1 (fp16 forward pass + correctness ledger) — the moat kernel.
2. Inference Forge M2 (attention + KV cache) — first generated tokens.
3. Vision Arena M1 (luminance/gaussian race) — gallery scaffolding proves out.
4. Inference Forge M3 (quantized kernels) — the flagship delta.
5. Model registry + shard loader + device tiers — Qwen unlocks.
6. Gallery entries in order: Flow Field, Material World, Light Forge, Splat Scene.
7. AR/VR Lab research passes.
8. Image generation, then video generation: gated on hardware, per the plan.
