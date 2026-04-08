\# Style consolidation reference  
This file covers how to eliminate duplicated CSS, centralise styles into tokens and  
utility classes, and prevent style overlap between files. Read this when auditing or  
refactoring stylesheets.  
\---  
\#\# Table of contents  
1\. \[Audit: finding duplicated CSS\](\#audit)  
2\. \[Design tokens\](\#tokens)  
3\. \[Shared utility classes\](\#utilities)  
4\. \[CSS Modules\](\#modules)  
5\. \[Tailwind projects\](\#tailwind)  
6\. \[Safe CSS refactoring order\](\#workflow)  
\---  
\#\# Audit: finding duplicated CSS {\#audit}  
\`\`\`bash  
\# Repeated colour values  
grep \-r "\#\[0-9a-fA-F\]\\{6\\}" src/ \--include="\*.css" | sort | uniq \-c | sort \-rn  
\# Repeated font-size declarations  
grep \-r "font-size:" src/ \--include="\*.css" | sort | uniq \-c | sort \-rn  
\# Repeated z-index values  
grep \-r "z-index:" src/ \--include="\*.css" | sort | uniq \-c | sort \-rn  
\# Repeated media query breakpoints  
grep \-r "@media" src/ \--include="\*.css" | sort | uniq \-c | sort \-rn  
\`\`\`  
A colour appearing 10+ times across multiple files is a strong candidate for a CSS custom property.  
\---  
\#\# Design tokens {\#tokens}  
Define all design decisions once. Change one line, update the entire UI.  
\`\`\`css  
/\* src/styles/tokens.css \*/  
:root {  
  /\* Colour \*/  
  \--color-primary:       \#005fcc;  
  \--color-primary-hover: \#004aab;  
  \--color-success:       \#16a34a;  
  \--color-warning:       \#d97706;  
  \--color-danger:        \#dc2626;  
  \--color-surface:       \#ffffff;  
  \--color-text:          \#111827;  
  \--color-text-muted:    \#6b7280;  
  \--color-border:        \#e5e7eb;  
  \--color-focus:         \#005fcc;  
  /\* Spacing — 4-point grid \*/  
  \--space-1: 4px;  \--space-2: 8px;   \--space-3: 12px;  
  \--space-4: 16px; \--space-6: 24px;  \--space-8: 32px;  
  \--space-10: 40px; \--space-12: 48px; \--space-16: 64px;  
  /\* Typography \*/  
  \--font-sans: system-ui, \-apple-system, sans-serif;  
  \--text-sm: 0.875rem; \--text-base: 1rem;  
  \--text-lg: 1.125rem; \--text-xl: 1.25rem; \--text-2xl: 1.5rem;  
  \--leading: 1.5;  
  \--font-medium: 500; \--font-semibold: 600; \--font-bold: 700;  
  /\* Borders \*/  
  \--radius-sm: 4px; \--radius-md: 8px; \--radius-lg: 12px; \--radius-full: 9999px;  
  \--border: 1px solid var(--color-border);  
  /\* Shadows \*/  
  \--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);  
  \--shadow-md: 0 4px 6px \-1px rgb(0 0 0 / 0.1);  
  /\* Z-index \*/  
  \--z-dropdown: 100; \--z-sticky: 200; \--z-modal: 400; \--z-toast: 500;  
  /\* Motion \*/  
  \--duration-fast: 100ms; \--duration-normal: 200ms;  
  \--ease: cubic-bezier(0.4, 0, 0.2, 1);  
}  
\`\`\`  
\---  
\#\# Shared utility classes {\#utilities}  
Extract layout patterns repeated across 3+ unrelated components.  
\`\`\`css  
/\* src/styles/utilities.css \*/  
.sr-only {  
  position: absolute; width: 1px; height: 1px;  
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap;  
}  
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }  
.line-clamp-2 {  
  display: \-webkit-box;  
  \-webkit-line-clamp: 2;  
  \-webkit-box-orient: vertical;  
  overflow: hidden;  
}  
.flex-center { display: flex; align-items: center; justify-content: center; }  
.container {  
  width: 100%; max-width: 1200px;  
  margin-inline: auto; padding-inline: var(--space-4);  
}  
:focus-visible {  
  outline: 2px solid var(--color-focus);  
  outline-offset: 2px;  
  border-radius: var(--radius-sm);  
}  
\`\`\`  
\---  
\#\# CSS Modules {\#modules}  
CSS Modules scope class names locally — no BEM, no naming collisions.  
\`\`\`css  
/\* Button.module.css \*/  
.root {  
  display: inline-flex; align-items: center;  
  padding: var(--space-2) var(--space-4);  
  font-size: var(--text-sm); font-weight: var(--font-medium);  
  border-radius: var(--radius-md); cursor: pointer;  
  transition: background-color var(--duration-fast) var(--ease);  
}  
.primary { background: var(--color-primary); color: \#fff; }  
.primary:hover { background: var(--color-primary-hover); }  
.secondary { background: transparent; border: var(--border); color: var(--color-text); }  
\`\`\`  
\`\`\`tsx  
import styles from './Button.module.css';  
import cx from 'clsx';  
export function Button({ variant \= 'primary', children, onClick }) {  
  return (  
    \<button className={cx(styles.root, styles\[variant\])} onClick={onClick}\>  
      {children}  
    \</button\>  
  );  
}  
\`\`\`  
\`.root\` in \`Button\` never collides with \`.root\` in any other component.  
\---  
\#\# Tailwind projects {\#tailwind}  
All design decisions belong in \`tailwind.config.ts\`, not in CSS files.  
\`\`\`ts  
// tailwind.config.ts  
export default {  
  content: \['./src/\*\*/\*.{ts,tsx,vue,svelte}'\],  
  theme: {  
    extend: {  
      colors: {  
        primary: { DEFAULT: '\#005fcc', hover: '\#004aab' },  
        success: '\#16a34a', warning: '\#d97706', danger: '\#dc2626',  
      },  
      borderRadius: { sm: '4px', md: '8px', lg: '12px' },  
      boxShadow: { card: '0 1px 3px 0 rgb(0 0 0 / 0.1)' },  
    },  
  },  
} satisfies Config;  
\`\`\`  
\`\`\`css  
/\* src/styles/global.css \*/  
@tailwind base;  
@tailwind components;  
@tailwind utilities;  
@layer base {  
  :focus-visible { @apply outline-2 outline-offset-2 outline-primary; }  
}  
@layer components {  
  /\* Only for patterns repeated 6+ times with 6+ utilities each \*/  
  .card { @apply rounded-lg bg-white p-6 shadow-card border border-gray-200; }  
}  
\`\`\`  
Do not write custom CSS that Tailwind utilities already cover.  
\---  
\#\# Safe CSS refactoring order {\#workflow}  
1\. \*\*Audit\*\* — run grep searches; find the most repeated values  
2\. \*\*Add tokens\*\* — create \`tokens.css\` entries for all repeated values  
3\. \*\*Replace in one file\*\* — swap hardcoded values for token references; check the UI  
4\. \*\*Migrate remaining files\*\* — one at a time; check after each  
5\. \*\*Extract utility classes\*\* — only after tokens are stable  
6\. \*\*Remove dead CSS\*\* — use PurgeCSS or your build tool to catch orphaned rules  
Never rename a CSS class without searching for all references first. There is no compiler error for a missing class — it breaks silently.

