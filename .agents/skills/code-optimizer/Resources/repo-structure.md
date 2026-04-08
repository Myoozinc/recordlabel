\# Repository structure reference  
This file covers recommended file layouts, layer rules, and naming conventions.  
Read this when a project needs structural reorganisation or when aligning with  
framework conventions.  
\---  
\#\# Table of contents  
1\. \[Layer rules — applies to all frameworks\](\#layers)  
2\. \[React (Vite / CRA)\](\#react)  
3\. \[Next.js App Router\](\#nextjs)  
4\. \[Vue 3 \+ Vite\](\#vue)  
5\. \[Nuxt 3\](\#nuxt)  
6\. \[SvelteKit\](\#sveltekit)  
\---  
\#\# Layer rules — applies to all frameworks {\#layers}  
\#\#\# Direction  
Each layer calls only downward. A utility must not import from a component. A component must not import from a page.  
\`\`\`  
UI (components / pages)  
  ↓  
Hooks / Composables  
  ↓  
Services (network, API)  
  ↓  
Utils (pure functions)  
  ↓  
Constants / Types  
\`\`\`  
\#\#\# Naming conventions  
| Layer      | Files              | Exports          | Example                  |  
|------------|--------------------|------------------|--------------------------|  
| Components | PascalCase         | PascalCase       | \`UserCard.tsx\`           |  
| Hooks      | camelCase, \`use\`   | camelCase        | \`useAuth.ts\`             |  
| Services   | camelCase, noun    | camelCase        | \`userService.ts\`         |  
| Utils      | camelCase, verb    | camelCase        | \`formatDate.ts\`          |  
| Constants  | camelCase file     | UPPER\_SNAKE\_CASE | \`API\_BASE\_URL\`           |  
| Types      | camelCase file     | PascalCase       | \`User\`, \`ApiResponse\<T\>\` |  
\#\#\# Colocation  
Keep a component's styles, tests, and types next to it — not in distant top-level folders.  
\`\`\`  
components/Button/  
├── Button.tsx  
├── Button.module.css  
├── Button.test.tsx  
└── index.ts          ← clean re-export  
\`\`\`  
\#\#\# Barrel files  
Use at layer boundaries only (\`components/index.ts\`, \`utils/index.ts\`).  
Never re-export from another barrel — causes circular dependencies and slow builds.  
\`\`\`ts  
// Good: explicit named exports at layer boundary  
export { Button } from './Button';  
export { Input }  from './Input';  
// Bad: barrel re-exporting another barrel  
export \* from './components'; // ← do not do this  
\`\`\`  
\#\#\# Path aliases  
\`\`\`ts  
// tsconfig.json  
{ "compilerOptions": { "paths": { "@/\*": \["./src/\*"\] } } }  
// Usage  
import { formatDate } from '@/utils/date'; // not '../../../utils/date'  
\`\`\`  
\---  
\#\# React (Vite / CRA) {\#react}  
\`\`\`  
src/  
├── assets/        → Images, fonts, SVGs  
├── components/    → Shared UI (colocated styles \+ tests)  
├── features/      → Self-contained vertical slices  
│   └── auth/  
│       ├── components/  
│       ├── hooks/  
│       ├── services/  
│       └── index.ts   ← public API for this feature  
├── hooks/         → App-wide hooks  
├── services/      → Shared API layer  
├── store/         → Global state (Zustand, Redux, Jotai)  
├── styles/        → Global CSS, tokens  
├── types/         → Shared TypeScript types  
├── utils/         → Pure utility functions  
└── main.tsx  
\`\`\`  
Code used only within a feature lives in \`features/\<name\>/\`. Code used across two or more features moves to the shared layer.  
\---  
\#\# Next.js App Router {\#nextjs}  
\`\`\`  
src/  
├── app/           → Layouts, pages, loading.tsx, error.tsx  
│   ├── layout.tsx  
│   └── dashboard/  
│       ├── layout.tsx  
│       └── page.tsx  
├── components/    → Shared UI  
├── features/      → Feature-scoped code  
├── lib/           → Server-only: DB clients, auth, secrets  
├── services/      → Data fetching (server \+ client)  
├── store/         → Client-side global state  
├── styles/  
├── types/  
└── utils/  
\`\`\`  
\- Never import from \`app/\` inside \`components/\` — circular dependency.  
\- \`lib/\` is server-only. Never import it in a client component.  
\- Use \`loading.tsx\` and \`error.tsx\` at route level instead of wrapping every page.  
\---  
\#\# Vue 3 \+ Vite {\#vue}  
\`\`\`  
src/  
├── assets/  
├── components/     → Shared SFCs; prefix shared ones: BaseButton, BaseInput  
├── composables/    → Must start with \`use\`: useAuth, useCart  
├── features/  
├── router/index.ts  
├── services/  
├── stores/         → Pinia — one store per domain  
├── styles/  
├── types/  
├── utils/  
└── main.ts  
\`\`\`  
Pinia stores must be small and domain-specific. One store per business entity.  
\---  
\#\# Nuxt 3 {\#nuxt}  
Nuxt auto-imports \`components/\`, \`composables/\`, and \`utils/\`. Do not add manual imports for files in those directories.  
\`\`\`  
├── assets/  
├── components/     → Auto-imported  
├── composables/    → Auto-imported (useXxx only — do not shadow useFetch, useRoute)  
├── layouts/  
├── middleware/     → Thin guards only; logic belongs in composables  
├── pages/          → File-based routing  
├── server/api/     → Server routes — safe for secrets, DB access  
├── stores/         → Pinia — NOT auto-imported  
├── types/          → NOT auto-imported  
└── utils/          → Auto-imported  
\`\`\`  
Server routes in \`server/api/\` are server-only. Call them from the client via \`useFetch\`.  
\---  
\#\# SvelteKit {\#sveltekit}  
\`\`\`  
src/  
├── lib/  
│   ├── components/  
│   ├── server/     → Server-only — framework enforced, never sent to client  
│   ├── stores/  
│   ├── services/  
│   ├── types/  
│   └── utils/  
└── routes/  
    ├── \+layout.svelte  
    ├── \+page.svelte  
    └── dashboard/  
        ├── \+page.svelte  
        └── \+page.server.ts  ← server-only load function  
\`\`\`  
\`+page.server.ts\` runs server-side only. \`+page.ts\` runs on both. Use accordingly.

