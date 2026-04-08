# Layout patterns reference

This file covers CSS layout techniques for responsive mobile-first design.
Read this when you need guidance on grid systems, flexbox patterns, container queries,
or common component layouts.

---

## Table of contents

1. [Mobile-first CSS fundamentals](#fundamentals)
2. [Flexbox patterns](#flexbox)
3. [CSS Grid patterns](#grid)
4. [Container queries](#container-queries)
5. [Common mobile component layouts](#components)

---

## Mobile-first CSS fundamentals {#fundamentals}

Write base styles for mobile with no media query.
Use `min-width` queries to add complexity for larger screens.

```css
/* Reset — prevents browser inconsistencies */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Base: mobile */
.section {
  padding: 1rem;        /* 16px */
  max-width: 100%;
}

/* Tablet: 768px+ */
@media (min-width: 48rem) {
  .section {
    padding: 2rem;      /* 32px */
  }
}

/* Desktop: 1280px+ */
@media (min-width: 80rem) {
  .section {
    padding: 3rem;      /* 48px */
    max-width: 1200px;
    margin-inline: auto;
  }
}
```

### Fluid spacing with clamp()

`clamp(min, preferred, max)` lets values scale fluidly between breakpoints
without requiring media queries:

```css
.section {
  padding: clamp(1rem, 4vw, 3rem);   /* 16px → scales → 48px */
  gap: clamp(0.75rem, 2vw, 1.5rem);  /* 12px → scales → 24px */
}
```

---

## Flexbox patterns {#flexbox}

### Stack (mobile) → Row (desktop)

The most common responsive pattern. Content stacks vertically on mobile and
sits side-by-side on desktop.

```css
.card-group {
  display: flex;
  flex-direction: column;   /* Stack on mobile */
  gap: 1rem;
}

@media (min-width: 48rem) {
  .card-group {
    flex-direction: row;    /* Row on tablet+ */
    flex-wrap: wrap;
  }
}
```

### Sticky footer layout

Keeps the footer pinned to the bottom of the viewport when content is short.

```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;   /* dvh = dynamic viewport height; accounts for mobile URL bar */
}

main {
  flex: 1;              /* Grows to fill available space */
}
```

### Space-between navigation

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
}
```

---

## CSS Grid patterns {#grid}

### Auto-fit card grid

Cards automatically fill the available width. No media queries needed.

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: 1rem;
}
```

- On mobile (< 280px available): single column.
- On tablet: 2 columns.
- On desktop: 3–4 columns.

### Named area layout

```css
.page-layout {
  display: grid;
  grid-template-areas:
    "header"
    "main"
    "sidebar"
    "footer";
  grid-template-rows: auto 1fr auto auto;
  min-height: 100dvh;
}

@media (min-width: 48rem) {
  .page-layout {
    grid-template-areas:
      "header  header"
      "main    sidebar"
      "footer  footer";
    grid-template-columns: 1fr 300px;
    grid-template-rows: auto 1fr auto;
  }
}

header  { grid-area: header; }
main    { grid-area: main; }
aside   { grid-area: sidebar; }
footer  { grid-area: footer; }
```

---

## Container queries {#container-queries}

Container queries let a component respond to the size of its parent container,
not the viewport. This enables truly reusable components that adapt wherever they appear.

```css
/* 1. Establish a containment context on the parent */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* 2. Style the child based on the container's width */
.card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

/* When the container is 400px or wider, go horizontal */
@container card (min-width: 400px) {
  .card {
    flex-direction: row;
    align-items: center;
  }

  .card__image {
    width: 40%;
    flex-shrink: 0;
  }
}
```

Container queries are supported in all modern browsers as of 2023.
Prefer them over media queries for component-level responsiveness.

---

## Common mobile component layouts {#components}

### Full-bleed hero

```css
.hero {
  width: 100%;
  min-height: 60svh;   /* svh = small viewport height; excludes mobile UI chrome */
  display: grid;
  place-items: center;
  padding: clamp(1.5rem, 5vw, 4rem);
  position: relative;
  overflow: hidden;
}

.hero__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__content {
  position: relative;  /* Sits above the image */
  z-index: 1;
  text-align: center;
  max-width: 60ch;
}
```

### Sticky CTA button (mobile)

A button that stays visible as the user scrolls — useful for e-commerce add-to-cart:

```css
.sticky-cta {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: white;
  box-shadow: 0 -2px 12px rgb(0 0 0 / 0.08);
  z-index: 100;
}

/* Hide sticky CTA when the main CTA is visible */
@supports selector(:has(~)) {
  .primary-cta:is(:visible) ~ .sticky-cta {
    display: none;
  }
}
```

### Bottom sheet (modal drawer from bottom)

```css
.bottom-sheet {
  position: fixed;
  inset: auto 0 0;
  background: white;
  border-radius: 16px 16px 0 0;
  padding: 1.5rem;
  max-height: 90dvh;
  overflow-y: auto;
  transform: translateY(100%);
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 200;
}

.bottom-sheet[aria-hidden="false"] {
  transform: translateY(0);
}
```
