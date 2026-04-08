# Performance optimization reference

This file covers deep-dive implementation for Core Web Vitals optimization.
Read this when you need specific guidance on LCP, INP, CLS, lazy loading,
caching strategies, or CDN configuration for mobile web performance.

---

## Table of contents

1. [LCP optimization — loading performance](#lcp)
2. [INP optimization — interactivity](#inp)
3. [CLS optimization — layout stability](#cls)
4. [Image delivery pipeline](#images)
5. [JavaScript performance](#javascript)
6. [Caching and CDN strategy](#caching)
7. [Progressive Web App (PWA) patterns](#pwa)

---

## LCP optimization — loading performance {#lcp}

Largest Contentful Paint measures how quickly the main content element becomes visible.
Target: ≤ 2.5 seconds on mobile field data.

### Identify your LCP element

Open Chrome DevTools > Performance > record a page load. The LCP candidate is labeled in
the Timings section. Common LCP elements on mobile:

- Hero `<img>` or `<picture>` element
- Large `<h1>` text block
- Background image rendered via CSS `background-image`

> **Note**: CSS `background-image` cannot be preloaded with `<link rel="preload">`.
> Convert critical background images to `<img>` elements for preloading capability.

### Preload the LCP resource

```html
<!-- In <head>, before any stylesheets -->
<link
  rel="preload"
  as="image"
  href="hero-mobile.webp"
  imagesrcset="hero-mobile.webp 600w, hero-tablet.webp 1024w"
  imagesizes="100vw"
>
```

### Server response time (TTFB)

Time to First Byte must be ≤ 800ms for a good LCP. Slow TTFB is the most common
cause of poor LCP on mobile cellular connections.

Improve TTFB by:

- Using edge caching (Cloudflare, Fastly, AWS CloudFront)
- Enabling HTTP/2 or HTTP/3 on your server
- Deferring database queries that are not needed for the initial render
- Using server-side rendering (SSR) or static site generation (SSG) instead of
  client-side rendering for content pages

### Critical rendering path

Eliminate render-blocking resources. The browser must download and parse CSS before
painting. Inline critical CSS and defer the rest:

```html
<head>
  <!-- Inline only the CSS needed for above-the-fold content -->
  <style>
    /* Critical CSS — fold styles only */
    body { margin: 0; font-family: system-ui, sans-serif; }
    .hero { width: 100%; aspect-ratio: 16/9; }
  </style>

  <!-- Non-critical CSS loaded asynchronously -->
  <link
    rel="stylesheet"
    href="styles.css"
    media="print"
    onload="this.media='all'"
  >
</head>
```

---

## INP optimization — interactivity {#inp}

Interaction to Next Paint replaces First Input Delay as of March 2024.
INP measures the worst-case delay between user input and the next visual update.
Target: ≤ 200ms on mobile.

### Diagnose long tasks

Open Chrome DevTools > Performance > record interactions. Any task on the main thread
exceeding 50ms appears as a "Long Task" and contributes to poor INP.

### Break up long tasks

```js
/**
 * Processes a large array in chunks to avoid blocking the main thread.
 * Each chunk yields control back to the browser between iterations.
 *
 * @param {Array} items - The items to process.
 * @param {Function} processFn - Called for each item.
 * @param {number} chunkSize - Items to process per frame (default: 50).
 * @returns {Promise<void>}
 */
async function processInChunks(items, processFn, chunkSize = 50) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    chunk.forEach(processFn);

    // Yield to the browser between chunks
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

### Defer non-critical JavaScript

```html
<!-- Defer: downloads in parallel, executes after HTML is parsed -->
<script src="analytics.js" defer></script>

<!-- Async: downloads in parallel, executes immediately when ready -->
<!-- Use for fully independent scripts with no DOM dependencies -->
<script src="chat-widget.js" async></script>
```

### Third-party script audit

Third-party scripts (analytics, ads, chat widgets) are the most common cause of poor INP
on mobile. For each third-party script, evaluate:

1. Is it required for the initial interaction?
2. Can it be loaded after the `load` event fires?
3. Can it be loaded only on pages where it is used?

Use the [Chrome Coverage tool](chrome://inspect) to identify unused JavaScript.

---

## CLS optimization — layout stability {#cls}

Cumulative Layout Shift measures unexpected visual movement during load.
Target: ≤ 0.1.

### Reserve space for all media

```html
<!-- Always set width and height. The browser uses these to compute aspect-ratio -->
<img src="product.webp" width="400" height="300" alt="...">

<!-- For responsive containers, use aspect-ratio in CSS -->
<div class="video-container">
  <iframe src="..." title="Video title" loading="lazy"></iframe>
</div>
```

```css
.video-container {
  position: relative;
  aspect-ratio: 16 / 9;
  width: 100%;
}

.video-container iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
```

### Ads and dynamic content

Ad slots that load asynchronously are among the largest contributors to CLS.
Reserve explicit height for ad containers even before the ad loads:

```css
.ad-slot {
  min-height: 250px; /* Reserve standard ad height */
  background: #f5f5f5; /* Visual placeholder */
}
```

### Font swap CLS

Web fonts loading late cause text reflow if the fallback and loaded font have different metrics.
Use `font-display: swap` and define `size-adjust`, `ascent-override`, and `descent-override`
to match fallback metrics:

```css
@font-face {
  font-family: 'Inter';
  src: url('inter.woff2') format('woff2');
  font-display: swap;
  /* Match system-ui metrics to minimize layout shift on swap */
  size-adjust: 100%;
  ascent-override: 90%;
  descent-override: 20%;
}
```

---

## Image delivery pipeline {#images}

### Format selection

```
WebP     → Default for photos and illustrations. 25–35% smaller than JPEG.
AVIF     → Best compression. Use where browser support allows (check caniuse.com).
SVG      → Icons, logos, illustrations with flat colors. Infinitely scalable.
WebM     → Animated content. Use instead of GIF for file size savings of 80%+.
```

### Responsive images with srcset

```html
<picture>
  <!-- AVIF for supporting browsers -->
  <source
    type="image/avif"
    srcset="hero-400.avif 400w, hero-800.avif 800w, hero-1200.avif 1200w"
    sizes="(max-width: 600px) 100vw, (max-width: 1024px) 75vw, 800px"
  >
  <!-- WebP for most browsers -->
  <source
    type="image/webp"
    srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
    sizes="(max-width: 600px) 100vw, (max-width: 1024px) 75vw, 800px"
  >
  <!-- JPEG fallback -->
  <img
    src="hero-800.jpg"
    alt="Descriptive alt text"
    width="800"
    height="450"
    loading="eager"
    fetchpriority="high"
  >
</picture>
```

### Lazy loading strategy

```
loading="eager"   → Hero / above-the-fold images. Load immediately.
loading="lazy"    → All other images. Browser defers until near the viewport.
```

Do not lazy-load the first 1–3 images visible on initial load. Lazy loading LCP images
will delay LCP and worsen your score.

---

## JavaScript performance {#javascript}

### Bundle splitting

Large JavaScript bundles block the main thread on low-power mobile CPUs.
Split bundles by route so that each page loads only the code it needs:

```js
// Dynamic import — loads only when needed
const loadModal = async () => {
  const { Modal } = await import('./components/Modal.js');
  return new Modal();
};

button.addEventListener('click', async () => {
  const modal = await loadModal();
  modal.open();
});
```

### Performance budget

Set hard limits on JavaScript payload size per page. Recommended starting budgets for
mobile:

| Asset type         | Budget       |
|--------------------|--------------|
| Total JS (parsed)  | ≤ 300 KB     |
| Total CSS          | ≤ 50 KB      |
| Total page weight  | ≤ 1.5 MB     |
| Hero image         | ≤ 150 KB     |

Enforce budgets automatically in your build pipeline. Fail builds that exceed limits.

---

## Caching and CDN strategy {#caching}

### Cache-Control headers

```
Cache-Control: public, max-age=31536000, immutable
  → Static assets with hashed filenames (images, fonts, JS bundles).
    Browsers cache for 1 year and never revalidate.

Cache-Control: no-cache
  → HTML pages. Browsers revalidate on every navigation but serve
    cached copy if unchanged (ETag or Last-Modified match).

Cache-Control: no-store
  → Sensitive API responses containing personal data.
```

### Service Worker for offline resilience

A Service Worker can cache critical assets locally, making the page load instantly
on repeat visits—even on poor mobile connections.

```js
// service-worker.js
const CACHE_NAME = 'v1';
const PRECACHE_ASSETS = ['/', '/styles.css', '/app.js', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
```

---

## Progressive Web App (PWA) patterns {#pwa}

PWAs enable app-like mobile experiences with offline support, home screen installation,
and push notifications. Implement the Web App Manifest for installability:

```json
{
  "name": "App Name",
  "short_name": "App",
  "description": "One-sentence description of the app.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#005fcc",
  "icons": [
    { "src": "/icons/icon-192.webp", "sizes": "192x192", "type": "image/webp" },
    { "src": "/icons/icon-512.webp", "sizes": "512x512", "type": "image/webp" }
  ]
}
```

Link the manifest in `<head>`:

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#005fcc">
```
