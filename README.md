# MYOOZ InC Website

Modern, modular website for MYOOZ InC independent label with glassmorphism design.

## File Structure

```
myoozinc-website/
│
├── index.html          # Homepage
├── artistas.html       # Artists page
├── ggbbeats.html       # GGB Beats services page
├── tienda.html         # Store/Shop page
│
├── styles.css          # Shared CSS styles (all pages use this)
├── navigation.js       # Shared navigation JavaScript
│
└── logo.png         
```

## How to Add Your Logo

**Option 1: Replace the placeholder**
1. Save your logo as `logo.png` in the same folder as the HTML files
2. That's it! All pages will automatically use it

**Option 2: Use a different filename**
If your logo has a different name (e.g., `myooz-logo.svg`):
1. Open `styles.css`
2. Find the `.logo-img` section (around line 56)
3. The HTML already references it correctly in all 4 pages

**Currently in all HTML files:**
```html
<img src="logo.png" alt="MYOOZ InC Logo" class="logo-img">
```

**To change the filename globally:**
Just rename your logo file to `logo.png`, or do a find-and-replace in all 4 HTML files:
- Find: `logo.png`
- Replace with: `your-logo-filename.png`

## Benefits of This Modular Structure

### ✅ Easy Maintenance
- **One CSS file** (`styles.css`) controls the look of ALL pages
- Change colors, fonts, spacing in ONE place
- No need to edit 4 different files

### ✅ One-Time Logo Update
- Logo is referenced in the nav, which is in each HTML file
- Change it once in `styles.css` or do a quick find-replace across all files
- Still much better than having all CSS inline

### ✅ Consistent Design
- All pages automatically match
- Shared animations, buttons, cards, etc.

## Customization Guide

### Change Colors
Edit the CSS variables in `styles.css` (lines 1-10):
```css
:root {
    --bg-black: #050505;           /* Background color */
    --accent-purple: #26014b;      /* Primary accent */
    --accent-blue: #00DBDE;        /* Secondary accent */
    /* ... etc */
}
```

### Change Fonts
Replace the Google Fonts link in each HTML file's `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;600;700;800&display=swap" rel="stylesheet">
```

Then update in `styles.css`:
```css
body {
    font-family: 'YourFont', sans-serif;
}
```

### Add Social Links
Edit the footer section in each HTML file, or update the social links in the navigation.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Uses backdrop-filter for glass effect (may need fallback for older browsers)

## Deployment

Simply upload all files to your web server:
- All 4 HTML files
- styles.css
- navigation.js
- logo.png

No build process needed!
