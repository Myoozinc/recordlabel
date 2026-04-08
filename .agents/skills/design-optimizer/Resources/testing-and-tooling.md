# Testing and tooling reference

This file covers how to test, audit, and monitor mobile web performance.
Read this when you need guidance on specific tools, testing workflows, or
setting up continuous performance monitoring.

---

## Table of contents

1. [Core Web Vitals measurement tools](#tools)
2. [Mobile usability testing](#usability)
3. [Device and network testing](#devices)
4. [Accessibility auditing](#accessibility)
5. [Continuous monitoring](#monitoring)

---

## Core Web Vitals measurement tools {#tools}

Always prioritize **field data** (real users) over **lab data** (simulated).
Lab data is useful during development. Field data reflects actual mobile user experience.

### PageSpeed Insights

URL: [pagespeed.web.dev](https://pagespeed.web.dev)

The primary tool for auditing Core Web Vitals. Shows both field data (from Chrome UX Report)
and lab data (Lighthouse). Run this on mobile mode specifically—desktop scores do not predict
mobile performance.

How to use it:

1. Enter your page URL.
2. Select **Mobile** tab (not Desktop).
3. Review the **Field Data** section first. This is what Google uses for ranking.
4. Review **Opportunities** for actionable improvements.
5. Check the **Diagnostics** section for root causes.

### Google Search Console

URL: [search.google.com/search-console](https://search.google.com/search-console)

Provides aggregate field data across all pages on your site. Use this for ongoing
ranking signal monitoring.

Navigate to: **Experience → Core Web Vitals → Mobile**

The report categorizes pages as Poor, Needs Improvement, or Good. Fix "Poor" pages first—
they have the largest impact on rankings.

### Lighthouse (Chrome DevTools)

How to access:

1. Open Chrome DevTools (`F12` or `Cmd+Opt+I`).
2. Select the **Lighthouse** tab.
3. Set Device to **Mobile**.
4. Check **Performance** and **Accessibility**.
5. Click **Analyze page load**.

Lighthouse provides lab data only. Use it during development for fast iteration.
Do not use Lighthouse scores as a proxy for real-user experience—they diverge significantly
on resource-constrained devices.

### Chrome UX Report (CrUX)

CrUX aggregates anonymized real-user performance data from Chrome users.
Query it via BigQuery for population-level analysis, or view it through PageSpeed Insights
and Search Console automatically.

---

## Mobile usability testing {#usability}

### Google's Mobile-Friendly Test

URL: [search.google.com/test/mobile-friendly](https://search.google.com/test/mobile-friendly)

Checks whether Google can index your mobile page correctly. Flags:
- Viewport not configured
- Text too small to read
- Clickable elements too close together
- Content wider than screen

Pass this test before any launch.

### Manual usability review checklist

Test each page on a real device and verify:

```
Navigation
  [ ] All navigation is reachable without pinching or horizontal scrolling
  [ ] Back navigation works correctly (browser back button)
  [ ] Active state is clearly visible on current nav item

Readability
  [ ] Text is legible without zooming
  [ ] Sufficient contrast in all lighting conditions
  [ ] Line lengths are comfortable (not full-width on tablet)

Interactions
  [ ] All tap targets are large enough to activate without mis-taps
  [ ] Forms fill correctly with correct keyboard types
  [ ] Autocomplete and autofill work on all form fields
  [ ] Error messages are visible and descriptive

Performance (perceived)
  [ ] Page content appears within 2.5 seconds on a 4G connection
  [ ] Scrolling is smooth at 60fps (no jank)
  [ ] No content shifts after initial load
```

---

## Device and network testing {#devices}

### Test on real devices

DevTools device emulation does not accurately simulate:

- CPU performance of mid-range and budget Android phones
- Network conditions on cellular (3G/4G/5G)
- Battery-related throttling
- Memory pressure from background apps
- Touch event behavior differences

Do the following before shipping:

1. Test on at least one **budget Android device** (e.g., Samsung Galaxy A-series).
   Budget devices represent a large portion of the global mobile user base.
2. Test on **iOS Safari** — its rendering engine (WebKit) differs from Chrome.
3. Test with **network throttling** — use a real 4G connection or Chrome DevTools
   throttling set to "Fast 4G" or "Slow 4G".

### DevTools mobile simulation

While imperfect, DevTools simulation is useful for fast iteration:

1. Open DevTools → Toggle Device Toolbar (`Cmd+Shift+M`).
2. Select "Responsive" and drag the viewport to test different widths.
3. Set network throttling: **Network → Slow 4G**.
4. Set CPU throttling: **Performance → CPU: 4x slowdown** to simulate mid-range phones.

### BrowserStack / LambdaTest

For cross-device testing without owning physical hardware, use cloud device farms.
These provide real remote devices accessible via browser:

- [BrowserStack](https://www.browserstack.com) — Industry standard; real devices on demand.
- [LambdaTest](https://www.lambdatest.com) — Cost-effective alternative.

---

## Accessibility auditing {#accessibility}

### Automated tools

| Tool              | How to use                                      | Coverage          |
|-------------------|-------------------------------------------------|-------------------|
| Lighthouse        | DevTools → Lighthouse → Accessibility           | ~30% of WCAG      |
| axe DevTools      | Chrome extension; free tier                     | ~57% of WCAG      |
| WAVE              | wave.webaim.org — paste URL or use extension    | Visual overlay    |

Automated tools catch roughly 30–57% of WCAG issues. Manual testing is required for
the rest—particularly for keyboard navigation, screen reader behavior, and focus management.

### Screen reader testing on mobile

| Platform | Screen reader  | How to enable                                    |
|----------|----------------|--------------------------------------------------|
| iOS      | VoiceOver      | Settings → Accessibility → VoiceOver            |
| Android  | TalkBack       | Settings → Accessibility → TalkBack             |

Test the most critical user flows (purchase, sign-up, key content) with the screen reader
enabled. Verify that:

- All interactive elements are reachable via swipe navigation.
- Element roles and labels are announced correctly.
- Dynamic content updates (toast messages, form errors) are announced.
- Modal dialogs trap focus correctly and restore focus on close.

---

## Continuous monitoring {#monitoring}

### Search Console alerts

Configure Search Console to email you when Core Web Vitals regressions occur.
Navigate to: **Settings → Email preferences → Performance alerts**.

### Real User Monitoring (RUM)

Integrate the `web-vitals` JavaScript library to collect real-user Core Web Vitals
data in your analytics platform:

```js
import { onCLS, onINP, onLCP } from 'web-vitals';

/**
 * Reports a Core Web Vital metric to your analytics endpoint.
 *
 * @param {object} metric - The web-vitals metric object.
 * @param {string} metric.name - Metric name: CLS, INP, or LCP.
 * @param {number} metric.value - The metric value.
 * @param {string} metric.rating - 'good', 'needs-improvement', or 'poor'.
 */
function reportWebVital(metric) {
  fetch('/analytics/vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      page: window.location.pathname,
    }),
    keepalive: true,  // Ensures the request completes even if the page unloads
  });
}

onCLS(reportWebVital);
onINP(reportWebVital);
onLCP(reportWebVital);
```

### Performance budget enforcement in CI

Add Lighthouse CI to your pipeline to fail builds that regress performance:

```yaml
# .lighthouserc.yml
ci:
  assert:
    assertions:
      first-contentful-paint:
        - warn
        - maxNumericValue: 2000
      largest-contentful-paint:
        - error
        - maxNumericValue: 2500
      cumulative-layout-shift:
        - error
        - maxNumericValue: 0.1
      total-blocking-time:
        - warn
        - maxNumericValue: 300
```

Run Lighthouse CI against a mobile configuration in your CI/CD workflow to catch
regressions before they reach production.
