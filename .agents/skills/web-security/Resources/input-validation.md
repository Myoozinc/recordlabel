# Input validation and injection prevention — deep reference

Load this file when you need full implementation patterns for XSS, SQL injection,
CSRF protection, or input validation across different frameworks.

---

## Table of contents

1. [XSS prevention](#xss)
2. [SQL injection prevention](#sqli)
3. [CSRF protection](#csrf)
4. [File upload security](#uploads)
5. [Dependency scanning](#deps)

---

## XSS prevention {#xss}

Cross-Site Scripting allows attackers to inject and execute malicious JavaScript
in your users' browsers. It's in the OWASP Top 10.

### The root cause

XSS happens when user-controlled data is inserted into a page without being
properly escaped or sanitized.

### Framework auto-escaping (your first line of defense)

Modern frameworks escape output by default. Use them correctly:

```jsx
// React — safe by default
function Comment({ text }) {
  return <p>{text}</p>; // Escaped automatically
}

// React — DANGEROUS, bypasses escaping
function Comment({ html }) {
  return <p dangerouslySetInnerHTML={{ __html: html }} />; // Only with sanitized input
}
```

```html
<!-- Vue — safe by default -->
<p>{{ userInput }}</p>

<!-- Vue — DANGEROUS -->
<p v-html="userInput"></p>  <!-- Only with sanitized input -->
```

### DOM manipulation (Vanilla JS)

```js
// DANGEROUS
element.innerHTML = userInput;
document.write(userInput);
eval(userInput);

// SAFE — plain text
element.textContent = userInput;

// SAFE — HTML (requires sanitization first)
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href'],
});
```

### Output encoding by context

Different contexts require different escaping:

```js
// HTML context — use textContent or framework escaping
// JS context — JSON.stringify() for dynamic data
const safeJs = `const data = ${JSON.stringify(userValue)};`;

// URL context — encodeURIComponent()
const safeUrl = `https://example.com/search?q=${encodeURIComponent(query)}`;

// CSS context — avoid user input in CSS entirely
```

---

## SQL injection prevention {#sqli}

SQL injection lets attackers manipulate your database queries.
Always use parameterized queries — never concatenate user input into SQL strings.

### Node.js — various drivers

```js
// MySQL2
const [rows] = await connection.execute(
  'SELECT * FROM users WHERE email = ? AND active = ?',
  [email, true]
);

// PostgreSQL (pg)
const { rows } = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// Prisma ORM — safe by default
const user = await prisma.user.findUnique({
  where: { email: userEmail },
});
```

### Python

```python
# SQLite3
cursor.execute(
    "SELECT * FROM users WHERE email = ?",
    (email,)
)

# psycopg2 (PostgreSQL)
cursor.execute(
    "SELECT * FROM users WHERE id = %s",
    (user_id,)
)

# SQLAlchemy ORM — safe by default
user = session.query(User).filter(User.email == email).first()
```

### PHP

```php
// PDO — parameterized
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
$stmt->execute(['email' => $email]);

// MySQLi
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
```

---

## CSRF protection {#csrf}

Cross-Site Request Forgery tricks an authenticated user's browser into
making unauthorized requests to your server.

### Primary defense: SameSite cookies

The simplest and most effective modern CSRF defense. Set on all session cookies:

```
Set-Cookie: session=abc123; SameSite=Strict; Secure; HttpOnly
```

`SameSite=Strict` — browser never sends cookie on cross-origin requests.
`SameSite=Lax` — allows top-level navigation but blocks cross-origin forms/XHR.

### Secondary defense: CSRF tokens

Required if you support older browsers or need defense-in-depth:

```js
// Express — using the csurf package
import csurf from 'csurf';

const csrfProtection = csurf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  // Pass token to the template
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/submit', csrfProtection, (req, res) => {
  // csurf validates automatically — throws if token missing/invalid
  res.send('Form submitted');
});
```

```html
<!-- Include token in all forms -->
<form method="POST" action="/submit">
  <input type="hidden" name="_csrf" value="{{ csrfToken }}">
  <!-- other fields -->
</form>
```

### AJAX requests

```js
// Include CSRF token in all state-changing AJAX requests
const token = document.querySelector('meta[name="csrf-token"]').content;

fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token,
  },
  body: JSON.stringify(data),
});
```

---

## File upload security {#uploads}

File uploads are a frequent attack vector for malware uploads and path traversal.

```js
// Express + Multer — safe file upload configuration
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const upload = multer({
  storage: multer.diskStorage({
    destination: '/var/uploads/',    // Outside web root
    filename: (req, file, cb) => {
      // Never use original filename — rename to UUID
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,      // 5 MB max
    files: 1,                        // One file at a time
  },
  fileFilter: (req, file, cb) => {
    // Whitelist allowed MIME types
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
});
```

**Key rules:**
- Store uploads outside the web root — files in `/var/uploads/` can't be executed via URL
- Never trust the original filename — rename to UUID
- Validate MIME type server-side (not just file extension)
- Serve uploaded files through your app, not directly via static file server

---

## Dependency scanning {#deps}

Third-party packages are a major attack vector (supply chain attacks).
Scan your dependencies regularly.

```bash
# Node.js — built into npm
npm audit
npm audit fix        # Auto-fix where possible
npm audit fix --force # Force-fix (may break things — test first)

# Python
pip install safety
safety check

# GitHub — enable Dependabot in repository settings
# It automatically opens PRs for vulnerable dependencies
```

Set a policy: fix `high` and `critical` vulnerabilities within 48 hours.
Fix `medium` within 2 weeks. Review `low` monthly.
