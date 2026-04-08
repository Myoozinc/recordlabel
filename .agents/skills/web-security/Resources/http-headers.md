# HTTP security headers — full reference

Load this file when you need complete header configurations for a specific
web server or framework, or when you need to debug a header that isn't working.

---

## Table of contents

1. [Nginx](#nginx)
2. [Apache](#apache)
3. [Node.js / Express](#node)
4. [Caddy](#caddy)
5. [Verifying headers](#verify)
6. [CSP builder reference](#csp)

---

## Nginx {#nginx}

Add to the `server {}` block that handles HTTPS traffic.

```nginx
server {
  listen 443 ssl http2;
  server_name example.com;

  # TLS
  ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
  ssl_protocols       TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers off;

  # Hide server version
  server_tokens off;

  # Security headers
  add_header Strict-Transport-Security
    "max-age=31536000; includeSubDomains; preload" always;

  add_header Content-Security-Policy
    "default-src 'self'; script-src 'self'; style-src 'self';
     img-src 'self' data:; font-src 'self'; object-src 'none';
     frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;

  add_header X-Frame-Options          "DENY"                            always;
  add_header X-Content-Type-Options   "nosniff"                         always;
  add_header Referrer-Policy          "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy       "geolocation=(), camera=(),
     microphone=(), payment=(), usb=(), interest-cohort=()" always;

  # Rate limiting — define zones in http {} block first:
  # limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
  location /login {
    limit_req zone=login burst=3 nodelay;
    limit_req_status 429;
  }

  # Block common scanning targets
  location ~* (\.env|\.git|\.svn|wp-admin|phpmyadmin|\.htaccess|\.htpasswd) {
    deny all;
    return 404;
  }

  # Prevent directory listing
  autoindex off;
}
```

---

## Apache {#apache}

Add to `.htaccess` or `<VirtualHost>` block.

```apache
# Hide version
ServerTokens Prod
ServerSignature Off

# Security headers
Header always set Strict-Transport-Security \
  "max-age=31536000; includeSubDomains"
Header always set Content-Security-Policy \
  "default-src 'self'; script-src 'self'; object-src 'none'; \
   frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy \
  "geolocation=(), camera=(), microphone=()"

# Remove server info headers
Header unset Server
Header unset X-Powered-By

# Block scanning paths
<FilesMatch "(\.env|\.git|\.htaccess|wp-login\.php)">
  Require all denied
</FilesMatch>

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Node.js / Express {#node}

Use the `helmet` package — it sets all critical security headers with one call.

```bash
npm install helmet
```

```js
import express from 'express';
import helmet from 'helmet';

const app = express();

// Helmet sets: HSTS, X-Content-Type-Options, X-Frame-Options,
// Referrer-Policy, Permissions-Policy, and more automatically.
app.use(helmet());

// Customize CSP (helmet's default is strict but may need adjustment):
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  })
);

// Remove X-Powered-By (helmet does this, but explicit is clear)
app.disable('x-powered-by');
```

### Session cookie security

```js
import session from 'express-session';

app.use(session({
  secret: process.env.SESSION_SECRET, // Long random string, from env var
  name: 'sid',                        // Don't use default 'connect.sid'
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,     // Cookie not accessible from JS
    secure: true,       // HTTPS only
    sameSite: 'strict', // Blocks CSRF cross-site requests
    maxAge: 3_600_000,  // 1 hour
  },
}));
```

---

## Caddy {#caddy}

Caddy handles HTTPS automatically via Let's Encrypt. Add headers in `Caddyfile`:

```caddy
example.com {
  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Content-Security-Policy "default-src 'self'; object-src 'none'; frame-ancestors 'none';"
    X-Frame-Options "DENY"
    X-Content-Type-Options "nosniff"
    Referrer-Policy "strict-origin-when-cross-origin"
    Permissions-Policy "geolocation=(), camera=(), microphone=()"
    -Server                 # Remove server header
    -X-Powered-By           # Remove framework header
  }

  # Block scanning paths
  respond /.env 404
  respond /.git/* 404
  respond /wp-admin 404
}
```

---

## Verifying headers {#verify}

### Command line

```bash
# Check all response headers
curl -I https://your-site.com

# Check a specific header
curl -sI https://your-site.com | grep -i "content-security-policy"

# Follow redirects and show final headers
curl -IL https://your-site.com
```

### Online tools

| Tool | What it checks |
|------|----------------|
| https://securityheaders.com | All security headers — gives A–F grade |
| https://observatory.mozilla.org | Mozilla's security scanner |
| https://www.ssllabs.com/ssltest | TLS/SSL certificate and configuration |
| https://csp-evaluator.withgoogle.com | Google's CSP policy analyzer |

Aim for **A or A+** on securityheaders.com before going live.

---

## CSP directive reference {#csp}

| Directive       | Controls                             | Safe default        |
|----------------|--------------------------------------|---------------------|
| `default-src`  | Fallback for all resource types      | `'self'`            |
| `script-src`   | JavaScript sources                   | `'self'`            |
| `style-src`    | CSS sources                          | `'self'`            |
| `img-src`      | Image sources                        | `'self' data:`      |
| `font-src`     | Web font sources                     | `'self'`            |
| `connect-src`  | fetch/XHR/WebSocket destinations     | `'self'`            |
| `object-src`   | Plugin sources (Flash, etc.)         | `'none'`            |
| `frame-src`    | `<iframe>` sources                   | `'none'`            |
| `frame-ancestors` | Who can embed your page           | `'none'`            |
| `base-uri`     | Allowed `<base href>` values         | `'self'`            |
| `form-action`  | Where forms can submit               | `'self'`            |
| `upgrade-insecure-requests` | Force HTTP→HTTPS for subresources | Add if mixed content issues |

### Common CSP additions for third-party services

```
# Google Fonts
style-src 'self' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;

# Google Analytics 4
script-src 'self' https://www.googletagmanager.com;
connect-src 'self' https://www.google-analytics.com;

# Stripe
script-src 'self' https://js.stripe.com;
frame-src https://js.stripe.com;
connect-src 'self' https://api.stripe.com;
```
