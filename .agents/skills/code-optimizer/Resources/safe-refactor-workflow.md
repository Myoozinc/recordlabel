\# Safe refactoring workflow reference  
This file covers how to verify changes haven't broken anything, how to test after  
consolidation, and how to use git to make refactoring reversible. Read this before  
making any structural changes to a codebase.  
\---  
\#\# Table of contents  
1\. \[Smoke test: minimum viable check\](\#smoke)  
2\. \[Unit tests for extracted utilities\](\#unit)  
3\. \[Visual regression\](\#visual)  
4\. \[Integration tests for extracted services\](\#integration)  
5\. \[Git practices\](\#git)  
\---  
\#\# Smoke test: minimum viable check {\#smoke}  
When there are no automated tests, do this manually after every change:  
1\. Start the dev server  
2\. Open every page that uses code you changed  
3\. Trigger every interaction that calls the refactored code  
4\. Check the browser console — zero errors expected  
5\. Check the Network tab — API calls must hit the same endpoints as before  
Do not assume a page is fine because it loaded. Submit forms. Click buttons. Trigger edge cases.  
\---  
\#\# Unit tests for extracted utilities {\#unit}  
Every function moved to \`utils/\` or \`services/\` needs a unit test. Shared code that breaks, breaks everywhere.  
\`\`\`ts  
// src/utils/date.test.ts  
import { formatDate, timeAgo } from './date';  
describe('formatDate', () \=\> {  
  it('formats ISO to default pattern', () \=\> {  
    expect(formatDate('2025-01-05T00:00:00Z')).toBe('Jan 5, 2025');  
  });  
  it('accepts a custom pattern', () \=\> {  
    expect(formatDate('2025-01-05T00:00:00Z', 'dd/MM/yyyy')).toBe('05/01/2025');  
  });  
  it('throws on invalid input', () \=\> {  
    expect(() \=\> formatDate('not-a-date')).toThrow();  
  });  
});  
\`\`\`  
\#\#\# Run before and after, diff the output  
\`\`\`bash  
npx vitest run \> before.txt  
\# make your changes  
npx vitest run \> after.txt  
diff before.txt after.txt  
\`\`\`  
No diff \= no regressions.  
\---  
\#\# Visual regression {\#visual}  
Catches layout and style changes by comparing screenshots.  
\`\`\`ts  
// tests/visual/card.spec.ts — Playwright  
import { test, expect } from '@playwright/test';  
test('card renders correctly after style consolidation', async ({ page }) \=\> {  
  await page.goto('/storybook/card--default');  
  await expect(page).toHaveScreenshot('card-default.png');  
});  
\`\`\`  
\`\`\`bash  
\# Capture baseline before refactoring  
npx playwright test \--update-snapshots  
\# Run after — fails if anything changed visually  
npx playwright test  
\`\`\`  
\*\*Lightweight alternative:\*\* DevTools → \`Ctrl+Shift+P\` → "Capture full page screenshot". Compare before/after manually for affected pages.  
\---  
\#\# Integration tests for extracted services {\#integration}  
When moving API calls from components into a service layer, test the service with a mocked fetch.  
\`\`\`ts  
// src/services/userService.test.ts  
const mockFetch \= vi.fn();  
global.fetch \= mockFetch;  
afterEach(() \=\> mockFetch.mockReset());  
it('getUser returns a user on success', async () \=\> {  
  const user \= { id: '1', name: 'Alice' };  
  mockFetch.mockResolvedValueOnce({ ok: true, json: () \=\> Promise.resolve(user) });  
  await expect(getUser('1')).resolves.toEqual(user);  
  expect(mockFetch).toHaveBeenCalledWith(  
    expect.stringContaining('/users/1'),  
    expect.any(Object),  
  );  
});  
it('getUser throws on failure', async () \=\> {  
  mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });  
  await expect(getUser('999')).rejects.toThrow('Failed to fetch user');  
});  
\`\`\`  
\---  
\#\# Git practices {\#git}  
\#\#\# One logical change per commit  
Makes each step independently reversible.  
\`\`\`bash  
\# Good — each step is its own commit  
git commit \-m "extract formatDate to src/utils/date.ts"  
git commit \-m "migrate UserCard to shared formatDate"  
git commit \-m "migrate OrderSummary to shared formatDate"  
git commit \-m "delete local formatDate copies"  
\# Bad — cannot partially revert  
git commit \-m "refactor date formatting everywhere"  
\`\`\`  
\#\#\# Always work on a branch  
\`\`\`bash  
git checkout \-b refactor/centralise-date-utils  
\# make changes  
git push origin refactor/centralise-date-utils  
\# open a PR for review before merging  
\`\`\`  
\#\#\# Verify before every commit  
\`\`\`bash  
git diff \--staged           \# review every changed line  
git diff \--name-only HEAD   \# confirm only expected files changed  
\`\`\`  
If \`git diff\` shows files you did not intend to change, investigate before committing. Refactoring must not silently modify unrelated files.  
\#\#\# Start clean  
\`\`\`bash  
git status   \# must be clean before starting any refactor  
git stash    \# if unrelated changes exist, stash them first  
\`\`\`  
A clean working tree gives you a clear \`git diff\` that shows only the refactoring changes — nothing mixed in from unrelated work.  
