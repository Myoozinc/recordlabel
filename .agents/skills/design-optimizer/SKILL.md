---
name: antigravity
description: >
  Apply this skill whenever the user wants to build, audit, refactor, or design a web page or
  web application for mobile devices. Triggers include any mention of mobile optimization,
  responsive design, mobile UX, touch-friendly interfaces, Core Web Vitals, mobile-first
  design, viewport configuration, thumb-zone navigation, or improving mobile user experience.
  Also trigger for requests like "make my site mobile-friendly", "improve mobile performance",
  "fix layout on phones", "optimize for small screens", or any task that involves building
  UI components where mobile behavior matters. Use this skill even when the user mentions
  "responsive layout", "breakpoints", "mobile users", or asks about Google rankings and
  page speed—these are strong signals that mobile optimization guidance is needed.
---

# Antigravity — Mobile Web Optimization Skill

A skill for building and auditing web pages with exceptional mobile UX, following Google's
developer documentation standards, Core Web Vitals requirements, and proven responsive
design best practices.

> **Quick reference**: For detailed implementation examples, read the reference files listed
> at the end of this document. Choose only the file(s) relevant to your task.

---

## Core Philosophy

Mobile optimization is no longer optional. Over 60% of global web traffic now originates from
mobile devices, and Google's mobile-first indexing means the mobile version of a page determines
search rankings—even if the desktop version is flawless. The guiding principle for every decision:

> **Design for the smallest screen first. Enhance progressively for larger ones.**

---

## Google Developer Documentation Standards

Follow the [Google Developer Documentation Style Guide](https://developers.google.com/style)
when writing any documentation, inline comments, or code annotations for this skill.

### Writing style rules (mandatory)

- **Voice**: Second person (`you`), active voice. Write imperatives for instructions.
  - ✅ `Add the viewport meta tag to your HTML head.`
  - ❌ `The viewport meta tag should be added by the developer.`
- **Auxiliary verbs**: Use `must` for required actions, `can` for optional ones.
  Avoid `should`—it creates ambiguity about whether something is required or merely suggested.
- **Tone**: Conversational but professional. Avoid jargon without definition.
- **Headings**: Use sentence case (`Mobile layout patterns`, not `Mobile Layout Patterns`).
- **Numbered lists**: Use for sequential steps. Use bulleted lists for non-ordered items.
- **Code samples**: Wrap in fenced blocks with the language identifier.
  Wrap lines at 80 characters or fewer. Use 2-space indentation.
- **Prescriptive language**: Best practice documents must be prescriptive—tell the reader
  exactly what to do and what outcome to expect. See the
  [Prescriptive documentation guide](https://developers.google.com/style/prescriptive-documentation).

### Documentation structure

Every component, page, or feature must include:

1. **Summary line** — One sentence describing what the element does.
2. **Parameters or props** — Listed with name, type, and description.
3. **Usage example** — The simplest case first; advanced cases after.
4. **Accessibility notes** — ARIA roles, keyboard behavior, screen-reader labels.
5. **Mobile behavior notes** — Touch targets, viewport assumptions, breakpoints used.

---

## Responsive Layout: Mobile-First Implementation

### Viewport configuration

Always include this exact meta tag in `<head>`. It is required—without it, the browser
renders the page at desktop width and scales it down.

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### Breakpoint system

Use a minimum of three breakpoints. Five is recommended for maximum device flexibility,
covering both portrait and landscape orientations on mobile and tablet.

| Breakpoint   | Width     | Use for                        |
|--------------|-----------|--------------------------------|
| `xs`         | < 480px   | Small phones (portrait)        |
| `sm`         | 480–767px | Large phones / landscape       |
| `md`         | 768–1023px| Tablets (portrait)             |
| `lg`         | 1024–1279px| Tablets (landscape) / laptops |
| `xl`         | ≥ 1280px  | Desktops                       |

Define breakpoints in CSS using `min-width` (mobile-first approach):

```css
/* Mobile base styles — no media query needed */
.container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    flex-direction: row;
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Grid and spacing

Use a **4-point grid system** for all spacing and alignment decisions.
All padding, margin, and gap values must be multiples of 4px (e.g., 4, 8, 12, 16, 24, 32).

Use CSS Flexbox or Grid for layout. Do not use fixed pixel widths for containers.

```css
/* Fluid grid — adapts to any screen width */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem; /* 16px */
}
```

### Multi-column to single-column transition

Desktop layouts with multiple columns must collapse to a single column on mobile.
Never let text columns become narrower than 280px—it breaks readability.

---

## Touch Interaction Design

### Touch target sizing

Interactive elements (buttons, links, form fields, icons) must meet minimum touch target sizes
so users can tap them accurately without mis-taps.

| Authority     | Minimum size  |
|---------------|---------------|
| Google        | 48 × 48 px    |
| Apple HIG     | 44 × 44 px    |
| WCAG 2.5.8    | 24 × 24 px (AA), 44 × 44 px (AAA) |

**Use Google's 48 × 48 px as the standard.** Ensure at least 8px of spacing between
adjacent touch targets to prevent accidental taps.

```css
.btn {
  min-height: 48px;
  min-width: 48px;
  padding: 12px 24px;
  /* Spacing between sibling buttons */
  margin-block-end: 8px;
}
```

### Thumb-zone navigation

Position the most frequently used interactive elements within the lower two-thirds of the
screen — the comfortable reach zone for one-handed thumb use.

- Place primary CTAs (e.g., "Add to cart", "Submit") near the bottom of the viewport.
- Place navigation items at the bottom of the screen (bottom tab bar), not top-only headers.
- Avoid placing critical actions in the top corners, which require awkward stretching.

### Visual feedback

Every interactive element must provide immediate visual feedback on tap. Users need
confirmation that their input was registered.

```css
.btn:active {
  transform: scale(0.97);
  opacity: 0.85;
  transition: transform 80ms ease, opacity 80ms ease;
}
```

Supplement visual feedback with haptic feedback (via the Vibration API) for native-feeling
interactions where appropriate:

```js
/**
 * Triggers a short haptic pulse on tap.
 * @param {number} duration - Duration in milliseconds (default: 10).
 */
function hapticTap(duration = 10) {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
}
```

### Hover-dependent interactions

Do not rely on hover-only states to reveal content or trigger actions. Touch devices have
no hover event. Provide alternative, always-visible affordances for all interactive elements.

---

## Typography for Mobile

### Font sizing

- Body text: minimum **16px**. Text smaller than 16px forces users to zoom, which Google
  flags as a mobile usability issue.
- Line height: **1.4–1.6** for body text. Tighter leading reduces readability on small screens.
- Line length: **45–75 characters** per line. On mobile, a single column naturally enforces this.

Use `clamp()` for fluid typography that scales between viewports without breakpoints:

```css
/* Scales from 16px (mobile) to 20px (desktop) */
body {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  line-height: 1.5;
}

h1 {
  font-size: clamp(1.75rem, 5vw, 3rem);
}
```

### Font loading

Prefer system fonts or self-hosted fonts to avoid render-blocking from third-party requests.
If using Google Fonts, add `display=swap` to prevent invisible text during load:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
```

---

## Core Web Vitals (Google's Performance Requirements)

Google uses Core Web Vitals as ranking signals in mobile-first indexing. All three metrics
must pass on mobile. Target the "Good" threshold for each.

| Metric | Full name                  | Good      | Needs work  | Poor     |
|--------|----------------------------|-----------|-------------|----------|
| LCP    | Largest Contentful Paint   | ≤ 2.5s    | 2.5–4.0s    | > 4.0s   |
| INP    | Interaction to Next Paint  | ≤ 200ms   | 200–500ms   | > 500ms  |
| CLS    | Cumulative Layout Shift    | ≤ 0.1     | 0.1–0.25    | > 0.25   |

> Source: [Google Search Central — Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)

### LCP — Optimize loading performance

LCP measures how quickly the largest above-the-fold element (hero image, heading, etc.) appears.

Do the following to improve LCP:

1. **Preload the hero image** — Add `<link rel="preload">` in `<head>`:
   ```html
   <link rel="preload" as="image" href="hero.webp">
   ```
2. **Use modern image formats** — Serve WebP or AVIF instead of PNG/JPEG. They are
   significantly smaller at equivalent quality.
3. **Set explicit dimensions** — Always set `width` and `height` on `<img>` elements to
   prevent layout shifts and allow the browser to reserve space.
4. **Avoid render-blocking resources** — Defer non-critical JavaScript. Inline critical CSS.
5. **Use a CDN** — Reduce latency by serving assets from edge locations near the user.

```html
<!-- Good: Explicit dimensions, modern format, lazy loading for off-screen images -->
<img
  src="product.webp"
  width="800"
  height="600"
  alt="Product description"
  loading="lazy"
  decoding="async"
>

<!-- Hero image: eager loading, no lazy, preloaded above -->
<img
  src="hero.webp"
  width="1200"
  height="628"
  alt="Hero description"
  loading="eager"
  fetchpriority="high"
>
```

### INP — Optimize interactivity

INP measures the delay between a user's tap/click and the page's visual response.
A poor INP makes the page feel frozen or broken.

Do the following to keep INP below 200ms:

- **Break long JavaScript tasks** into smaller chunks using `setTimeout` or `scheduler.yield()`.
- **Defer non-essential scripts** — Add `defer` or `async` to script tags.
- **Reduce third-party scripts** — Each third-party script adds execution time and blocks the
  main thread.
- **Make touch targets responsive immediately** — Avoid waiting for JavaScript to attach
  event listeners before elements become interactive.

```js
/**
 * Schedules a non-urgent callback after the main thread is free.
 * Use for analytics, logging, or deferred setup tasks.
 *
 * @param {Function} callback - The function to run when idle.
 */
function scheduleIdle(callback) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 200);
  }
}
```

### CLS — Eliminate layout shift

CLS measures unexpected visual shifts as the page loads. A button that jumps when an ad
loads above it is a CLS problem—and a terrible mobile experience.

Do the following to keep CLS below 0.1:

- **Reserve space for images, videos, and ads** using explicit `width`/`height` or
  `aspect-ratio` in CSS.
- **Avoid inserting dynamic content above existing content** — Append below the fold or
  use reserved containers.
- **Set `font-display: swap`** for web fonts to prevent invisible-text layout shifts.

```css
/* Reserve aspect ratio space before image loads */
.media-container {
  aspect-ratio: 16 / 9;
  width: 100%;
  overflow: hidden;
}
```

### Measurement tools

Use these tools to measure and monitor Core Web Vitals. Prioritize field data (real users)
over lab data (simulated).

| Tool                    | Data type        | Use for                              |
|-------------------------|------------------|--------------------------------------|
| PageSpeed Insights      | Field + lab      | Quick audits, actionable suggestions |
| Google Search Console   | Field (real)     | Ongoing monitoring, ranking signals  |
| Lighthouse (DevTools)   | Lab only         | Development-time profiling           |
| Chrome UX Report (CrUX) | Field (real)     | Population-level performance data    |

Run audits on actual budget Android devices over throttled connections—not just DevTools
emulation. Emulators do not reflect real-world CPU and network constraints.

---

## Navigation Patterns

### Mobile navigation

Use a **bottom navigation bar** (tab bar) for apps with 3–5 primary destinations.
Bottom navigation places controls within thumb reach and mirrors native app conventions.

For content sites, use a **hamburger menu** that opens a full-width drawer.
Do not hide primary CTAs inside the hamburger menu—keep them always visible.

```html
<!-- Bottom nav: thumb-reachable, labeled icons -->
<nav aria-label="Primary navigation">
  <a href="/home" aria-current="page">
    <svg aria-hidden="true">...</svg>
    <span>Home</span>
  </a>
  <a href="/search">
    <svg aria-hidden="true">...</svg>
    <span>Search</span>
  </a>
  <a href="/account">
    <svg aria-hidden="true">...</svg>
    <span>Account</span>
  </a>
</nav>
```

### Use familiar icons

Use universally recognized icons (envelope for messages, magnifying glass for search,
house for home). Do not invent novel metaphors for common actions—familiarity reduces
cognitive load on mobile where screen space is limited.

---

## Forms on Mobile

Forms are among the highest-friction areas of mobile UX. Do the following to minimize
abandonment:

1. **Match keyboard to input type** — Set the correct `inputmode` or `type` attribute so
   the mobile keyboard shows the right keys:
   ```html
   <input type="email" inputmode="email" autocomplete="email">
   <input type="tel" inputmode="tel" autocomplete="tel">
   <input type="number" inputmode="numeric">
   ```

2. **Enable autocomplete** — Use standard `autocomplete` attribute values so browsers and
   password managers can pre-fill fields:
   ```html
   <input type="text" autocomplete="given-name">
   <input type="text" autocomplete="street-address">
   ```

3. **Label every field** — Always pair `<label>` with `<input>` using `for`/`id`.
   Do not use placeholder text as a substitute for labels—placeholders disappear on focus.

4. **Minimize required fields** — Every extra field is a reason to abandon.
   Ask only for what you must have.

5. **Place the submit button within thumb reach** — Position it at the bottom of the form,
   not the top.

---

## Accessibility on Mobile (WCAG 2.1 AA Baseline)

Accessibility and mobile UX are deeply aligned. Do the following to meet WCAG 2.1 AA:

- **Color contrast**: Maintain a minimum 4.5:1 ratio for body text; 3:1 for large (18px+) text.
- **Keyboard and switch navigation**: Ensure all interactions are operable without touch.
  Test with a Bluetooth keyboard connected to a mobile device.
- **ARIA labels**: Add `aria-label` or `aria-labelledby` to icon-only buttons and interactive
  regions that lack visible text.
- **Semantic HTML**: Use `<nav>`, `<main>`, `<header>`, `<footer>`, `<button>`, and `<a>`
  correctly. Do not use `<div>` for clickable elements.
- **Focus indicators**: Do not remove `:focus` outlines. Style them to be visible and brand-consistent.

```css
/* Visible, styled focus indicator */
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
  border-radius: 4px;
}
```

Use [axe DevTools](https://www.deque.com/axe/) or Chrome Lighthouse to audit accessibility
compliance before shipping.

---

## Image and Asset Optimization

| Asset type     | Recommended format       | Notes                                    |
|----------------|--------------------------|------------------------------------------|
| Photos         | WebP (with JPEG fallback)| 25–35% smaller than JPEG at same quality |
| High-fidelity  | AVIF                     | Best compression; check browser support  |
| Icons / logos  | SVG                      | Resolution-independent; scales perfectly |
| Animations     | CSS / Lottie             | Avoid GIF; use WebM video for complex    |

Use `srcset` and `sizes` to serve appropriately sized images per device:

```html
<img
  src="product-800.webp"
  srcset="product-400.webp 400w, product-800.webp 800w, product-1200.webp 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 400px"
  alt="Product name and key detail"
  width="800"
  height="600"
  loading="lazy"
>
```

---

## Performance Checklist

Run through this checklist before shipping any mobile-facing page:

### Layout and structure
- [ ] Viewport meta tag present with `width=device-width, initial-scale=1`
- [ ] Mobile layout uses single column; no horizontal scrolling
- [ ] Content does not rely on hover states
- [ ] No fixed-width elements wider than the viewport

### Touch and interaction
- [ ] All touch targets are ≥ 48 × 48 px with ≥ 8px spacing between them
- [ ] Primary actions are within thumb reach (lower 60% of screen)
- [ ] Tap interactions provide immediate visual feedback

### Typography
- [ ] Body text is ≥ 16px; no zooming required to read
- [ ] Line height is 1.4–1.6 for body text
- [ ] Font files are preloaded or use `font-display: swap`

### Core Web Vitals
- [ ] LCP ≤ 2.5 seconds (measured in PageSpeed Insights field data)
- [ ] INP ≤ 200 milliseconds
- [ ] CLS ≤ 0.1 (all images and embeds have explicit dimensions)
- [ ] Tested on a real device over a throttled connection

### Images and assets
- [ ] Hero image uses `fetchpriority="high"` and is preloaded
- [ ] All images use WebP or AVIF with appropriate fallbacks
- [ ] `srcset` and `sizes` are set for responsive image loading
- [ ] Off-screen images use `loading="lazy"`

### Accessibility
- [ ] Color contrast meets 4.5:1 for body text
- [ ] All interactive elements have visible focus indicators
- [ ] All form fields have associated `<label>` elements
- [ ] Semantic HTML is used for all structural elements
- [ ] ARIA labels present on icon-only controls

---

## Reference Files

Read these files when you need deeper implementation detail on a specific area.
Do not load all of them — pick only the one(s) relevant to your current task.

| File                                        | Read when you need...                              |
|---------------------------------------------|----------------------------------------------------|
| `references/layout-patterns.md`            | CSS grid, flexbox, container queries, breakpoints  |
| `references/performance-optimization.md`   | LCP/INP/CLS deep dives, lazy loading, CDN setup    |
| `references/forms-and-input.md`            | Input types, autocomplete, multi-step forms        |
| `references/navigation-patterns.md`        | Bottom nav, drawers, breadcrumbs, back navigation  |
| `references/accessibility.md`              | WCAG criteria, ARIA patterns, screen reader testing|
| `references/testing-and-tooling.md`        | PageSpeed Insights, Lighthouse, real-device testing|
