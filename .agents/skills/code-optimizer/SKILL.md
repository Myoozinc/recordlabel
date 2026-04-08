name: code-optimizer  
description: Apply this skill whenever the user wants to audit, refactor, clean up, or restructure an existing codebase. Triggers include any mention of code duplication, redundant logic, repeated patterns, overlapping files, copy-pasted code, messy project structure, or unclear module boundaries. Also trigger for requests like "clean up my code", "reduce duplication", "DRY up my code", "consolidate utilities", "refactor this", "organize my files", "centralize shared logic", or "improve project structure". Use this skill even when the user says "my code feels messy", "there's too much overlap between files", or "I keep copy-pasting the same things" — these are strong signals that consolidation is needed. Always prefer targeted, safe changes that preserve page functionality and design.  
\---  
\# Code Optimizer — Refactoring & Repository Structure  
\> \*\*Reference files\*\* (load only when needed — do not load all):  
\> \- \`references/duplication-patterns.md\` — utilities, constants, API calls, components, types  
\> \- \`references/repo-structure.md\` — layer rules, naming conventions, framework layouts  
\> \- \`references/style-consolidation.md\` — design tokens, CSS Modules, utility classes, Tailwind  
\> \- \`references/safe-refactor-workflow.md\` — audit steps, git practices, testing after changes  
\---  
\#\# Core philosophy  
Refactoring is not rewriting. The goal is the smallest set of changes that yields the greatest gain in maintainability — without breaking functionality or design.  
\> \*\*Read before touching. Change one thing at a time. Verify before moving on.\*\*  
\---  
\#\# Audit first  
Before editing any file, do these three steps in order.  
\#\#\# 1\. Map the structure  
Identify what each file does and which layer it belongs to:  
\`\`\`  
src/  
├── components/   → UI — rendering only, no network calls  
├── pages/        → Route-level components  
├── hooks/        → Stateful reusable logic  
├── utils/        → Pure functions, no side effects  
├── services/     → All API/network calls  
├── store/        → Global state  
├── styles/       → Global CSS, design tokens  
├── constants/    → App-wide strings, numbers, enums  
└── types/        → Shared TypeScript interfaces  
\`\`\`  
\#\#\# 2\. Find duplication signals  
\`\`\`bash  
\# Same function defined in multiple files  
grep \-r "formatDate\\|truncate\\|handleError" src/ \--include="\*.ts" \--include="\*.tsx"  
\# Hardcoded API URLs or colour values  
grep \-r "https://api\\." src/ \--include="\*.ts" \--include="\*.tsx"  
grep \-r "\#\[0-9a-fA-F\]\\{6\\}" src/ \--include="\*.css"  
\# fetch() calls inside component files  
grep \-r "fetch(\\|axios\\." src/components src/pages  
\# Same interface defined more than once  
grep \-rn "^interface \\|^type " src/ \--include="\*.ts" | sort | uniq \-d  
\`\`\`  
\#\#\# 3\. Assess risk before consolidating  
Not all duplication should be removed. Ask first:  
\- Is it accidental or intentional? Functions that look identical but serve different domains may diverge — merging them creates hidden coupling.  
\- How often does this code change? High-churn code in a central file spreads risk everywhere.  
\- What breaks if this goes wrong? Low risk: a utility function. High risk: auth, routing, payments.  
\*\*Rule of three:\*\* only centralize code used in 3+ places. Fewer is premature abstraction.  
\---  
\#\# What to centralize  
\#\#\# Constants  
Collect all hardcoded values into \`src/constants/\`. Never scatter magic strings or numbers across components.  
\`\`\`ts  
// src/constants/index.ts  
export const API\_BASE\_URL \= process.env.NEXT\_PUBLIC\_API\_URL ?? 'https://api.example.com/v1';  
export const ROUTES \= {  
  HOME: '/',  
  LOGIN: '/login',  
  DASHBOARD: '/dashboard',  
} as const;  
export const Z\_INDEX \= { MODAL: 1000, DROPDOWN: 900, TOOLTIP: 800 } as const;  
export const DEBOUNCE\_MS \= 300;  
\`\`\`  
\#\#\# Utilities — one file per domain  
\`\`\`  
utils/  
├── date.ts        → formatDate, parseISO, timeAgo  
├── string.ts      → truncate, slugify, capitalize  
├── number.ts      → formatCurrency, clamp  
└── validation.ts  → isEmail, isEmpty  
\`\`\`  
Each function must be pure (same input → same output, no side effects) and clearly named.  
\#\#\# API service layer  
Remove all \`fetch\`/\`axios\` calls from components. Components must not contain network logic.  
\`\`\`ts  
// src/services/userService.ts  
import { API\_BASE\_URL } from '@/constants';  
export async function getUser(id: string): Promise\<User\> {  
  const res \= await fetch(\`${API\_BASE\_URL}/users/${id}\`);  
  if (\!res.ok) throw new Error(\`Failed to fetch user: ${res.status}\`);  
  return res.json();  
}  
\`\`\`  
\#\#\# Shared types  
\`\`\`ts  
// src/types/index.ts  
export type UserRole \= 'viewer' | 'editor' | 'admin';  
export interface User {  
  id: string;  
  name: string;  
  email: string;  
  role: UserRole;  
  createdAt: string;  
}  
export interface ApiResponse\<T\> {  
  data: T;  
  success: boolean;  
  error?: { status: number; message: string };  
}  
// Derive variants — never redefine  
type UpdatePayload   \= Partial\<Pick\<User, 'name' | 'email'\>\>;  
type CreatePayload   \= Omit\<User, 'id' | 'createdAt'\>;  
type UserSummary     \= Pick\<User, 'id' | 'name'\>;  
\`\`\`  
\---  
\#\# Redundant components  
Merge near-identical components only when differences are cleanly expressible as props and the result is simpler than the originals.  
\`\`\`tsx  
// Before: two components identical except for icon \+ heading  
// After: one parameterized component  
interface EmptyStateProps {  
  icon: React.ReactNode;  
  heading: string;  
  description: string;  
  action?: React.ReactNode;  
}  
export function EmptyState({ icon, heading, description, action }: EmptyStateProps) {  
  return (  
    \<div className="empty-state"\>  
      {icon}\<h2\>{heading}\</h2\>\<p\>{description}\</p\>{action}  
    \</div\>  
  );  
}  
\`\`\`  
If merging requires 5+ props and 4+ conditional branches, keep them separate.  
\---  
\#\# Repository rules  
\*\*Colocation:\*\* keep a component's styles, tests, and types next to it — not in distant top-level folders.  
\`\`\`  
components/Button/  
├── Button.tsx  
├── Button.module.css  
├── Button.test.tsx  
└── index.ts  
\`\`\`  
\*\*Path aliases:\*\* eliminate fragile relative imports.  
\`\`\`ts  
// tsconfig.json  
{ "compilerOptions": { "paths": { "@/\*": \["./src/\*"\] } } }  
\`\`\`  
\*\*Barrel files (\`index.ts\`):\*\* use at layer boundaries only (\`components/\`, \`utils/\`). Never re-export from another barrel — causes circular deps and slow builds.  
\*\*Layer direction:\*\* each layer calls only downward, never upward.  
\`\`\`  
UI → Hooks → Services → Utils → Constants/Types  
\`\`\`  
\---  
\#\# Safe refactoring order  
1\. \*\*Read\*\* every file you plan to touch before editing any  
2\. \*\*Create\*\* the new shared file first (util, service, constant, type)  
3\. \*\*Migrate one callsite\*\* — verify it works before proceeding  
4\. \*\*Migrate the rest\*\* — one at a time  
5\. \*\*Delete the old code\*\* — only after all callsites are migrated  
6\. \*\*Verify\*\* — run tests, open every affected page, check the console  
Never do a big-bang refactor. Small reversible steps are safer and easier to review.  
\---  
\#\# Pre-ship checklist  
\*\*Before starting\*\*  
\- \[ \] Every file to be changed has been read first  
\- \[ \] Duplication is confirmed as accidental, not intentional  
\- \[ \] Risk level assessed (utilities \= low, auth/routing/payments \= high)  
\*\*After finishing\*\*  
\- \[ \] Tests pass  
\- \[ \] UI identical to before on all affected pages  
\- \[ \] No unused imports or dead files remain  
\- \[ \] Barrel files and aliases updated if files moved  
\- \[ \] Each commit describes what moved and why  
