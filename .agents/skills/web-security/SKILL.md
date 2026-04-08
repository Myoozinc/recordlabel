---
name: web-security
description: Apply this skill whenever the user wants to audit, harden, or check the security of a web page, web application, or server. Triggers include any mention of vulnerabilities, security headers, XSS, CSRF, SQL injection, open ports, firewall rules, hacker protection, penetration testing, security scanning, content security policy, HTTPS enforcement, rate limiting, or protecting a site from attackers. Also trigger for requests like "is my site secure", "check for vulnerabilities", "protect my web app from hackers", "scan for open ports", "block bots", "add security headers", or any task that involves hardening a web application or server against unauthorized access.
---

# Web Security — Vulnerability Audit & Hardening Skill

> **Reference files** (load only when needed):
> - `references/http-headers.md` — full header configs for Nginx, Apache, Node, Caddy
> - `references/input-validation.md` — XSS, SQLi, CSRF, sanitization patterns
> - `references/port-scanning.md` — nmap commands, firewall rules, service hardening
> - `references/authentication.md` — sessions, cookies, MFA, password storage

---

## Layered defense model

No single measure stops all attacks. Apply all layers:

```
1. Network layer   → firewall, close ports, rate limiting
2. Transport layer → HTTPS/TLS only, HSTS
3. Application layer → security headers, CSP, input validation
4. Data layer      → parameterized queries, encryption at rest
5. Monitoring      → logging, alerting on anomalies
```

---

## Layer 1 — Port scanning and firewall

### Scan your own server first (see what attackers see)

```bash
# Quick scan — top 1000 TCP ports
nmap -sV your-server-ip

# Full scan — all 65535 TCP ports (thorough, slower)
nmap -p- -sV your-server-ip

# UDP scan — finds DNS, SNMP, NTP exposures
sudo nmap -sU --top-ports 100 your-server-ip

# Aggressive scan — OS detection + service versions + scripts
nmap -A -T4 your-server-ip
```

**Only three ports must be open on a typical web server:**

| Port | Protocol | Keep open? |
|------|----------|------------|
| 80   | HTTP     | Yes — redirect to 443 |
| 443  | HTTPS    | Yes — your site |
| 22   | SSH      | Only from your IP, never world |

**Dangerous ports to close if found open:**

| Port | Service | Risk |
|------|---------|------|
| 21   | FTP     | Unencrypted — replace with SFTP |
| 23   | Telnet  | Unencrypted — never expose |
| 3306 | MySQL   | DB must never be internet-facing |
| 5432 | PostgreSQL | Same — bind to localhost only |
| 3389 | RDP     | Extremely high attack surface |
| 445  | SMB     | Common ransomware vector |
| 6379 | Redis   | Unauthenticated by default |
| 27017| MongoDB | Unauthenticated by default |

### Close ports with UFW (Ubuntu/Debian)

```bash
# Start with deny all, then allow only what you need
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from YOUR_IP to any port 22  # SSH from your IP only
sudo ufw enable
sudo ufw status verbose
```

### Bind databases to localhost only

```bash
# MySQL — in /etc/mysql/mysql.conf.d/mysqld.cnf
bind-address = 127.0.0.1

# Redis — in /etc/redis/redis.conf
bind 127.0.0.1 ::1
requirepass YOUR_STRONG_PASSWORD

# PostgreSQL — in postgresql.conf
listen_addresses = 'localhost'
```

---

## Layer 2 — HTTPS and transport security

Serve everything over HTTPS. Never serve sensitive content over HTTP.

### Force HTTPS redirect (Nginx)

```nginx
server {
  listen 80;
  server_name example.com www.example.com;
  return 301 https://$host$request_uri;
}
```

### TLS hardening (Nginx)

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers ECDH+AESGCM:ECDH+AES256:!aNULL:!MD5:!DSS;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;
```

---

## Layer 3 — HTTP security headers

These headers are the fastest, highest-impact security wins.
Add them to every response your server sends.

### The mandatory 7

```nginx
# Nginx — add to server {} block

# 1. Strict-Transport-Security — forces HTTPS for 1 year
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# 2. Content-Security-Policy — blocks XSS and data injection
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;

# 3. X-Frame-Options — prevents clickjacking (use CSP frame-ancestors instead when possible)
add_header X-Frame-Options "DENY" always;

# 4. X-Content-Type-Options — prevents MIME sniffing attacks
add_header X-Content-Type-Options "nosniff" always;

# 5. Referrer-Policy — controls how much info is sent in Referer header
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# 6. Permissions-Policy — disables browser features you don't use
add_header Permissions-Policy "geolocation=(), camera=(), microphone=(), payment=()" always;

# 7. Remove server fingerprint — don't tell attackers what you're running
server_tokens off;
```

> **Do NOT add** `X-XSS-Protection`. It is deprecated and can introduce new XSS
> vulnerabilities. Modern browsers ignore it. Use CSP instead.

### Check your headers

Run this against your live site to see what's missing:

```bash
curl -I https://your-site.com
```

Or use the free online tool: **https://securityheaders.com**

---

## Layer 3b — Content Security Policy (CSP) explained

CSP is your most powerful XSS defense. It tells the browser exactly which
sources are allowed to load scripts, styles, images, and other resources.
Anything not on the list is blocked.

**Start strict, loosen only as needed:**

```
Content-Security-Policy:
  default-src 'self';          ← only load from your own domain by default
  script-src 'self';           ← no inline JS, no external scripts
  style-src 'self';            ← no inline CSS
  img-src 'self' data:;        ← images from self + data URIs (for icons)
  font-src 'self';
  object-src 'none';           ← no plugins (Flash, Java, etc.)
  frame-ancestors 'none';      ← nobody can iframe your site (clickjacking)
  base-uri 'self';             ← prevents base tag injection
  form-action 'self';          ← forms only submit to your domain
```

**If you use a CDN or third-party scripts**, add their domains explicitly:

```
script-src 'self' https://cdn.jsdelivr.net;
style-src 'self' https://fonts.googleapis.com;
```

**Test your CSP without breaking the site** — use report-only mode first:

```
Content-Security-Policy-Report-Only: default-src 'self'; ...
```

This logs violations without blocking anything. Fix violations, then switch to enforcement mode.

---

## Layer 3c — Rate limiting (blocks bots and brute force)

```nginx
# Nginx — define zones in http {} block
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=general:10m rate=100r/m;

# Apply to location blocks
location /login {
  limit_req zone=login burst=3 nodelay;
  limit_req_status 429;
}

location /api/ {
  limit_req zone=api burst=10 nodelay;
  limit_req_status 429;
}
```

---

## Layer 4 — Input validation and injection prevention

**The golden rule: never trust user input.** Validate on the server — never only on the client.

### XSS prevention

```js
// DANGEROUS — never do this
element.innerHTML = userInput;

// SAFE — use textContent for plain text
element.textContent = userInput;

// SAFE — sanitize before inserting HTML (use DOMPurify)
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### SQL injection prevention

```js
// DANGEROUS — string concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`;

// SAFE — parameterized query (works with any SQL library)
const query = 'SELECT * FROM users WHERE id = ?';
db.execute(query, [userId]);

// Node/PostgreSQL example
const { rows } = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

### CSRF prevention

```js
// Express — use the csurf middleware or implement tokens manually
// Set cookie with SameSite=Strict to block most CSRF automatically
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,    // JS cannot read this cookie
    secure: true,      // HTTPS only
    sameSite: 'strict' // Browser won't send cookie on cross-site requests
  }
}));
```

---

## Layer 5 — Monitoring and alerting

Security events to log and alert on:

- Repeated failed login attempts from the same IP (brute force)
- 4xx errors spiking (scanning/probing)
- Requests to non-existent admin paths (`/wp-admin`, `/phpmyadmin`, `/.env`)
- Unusual geographic traffic (country not in your user base)
- Any access to `/etc/passwd`, `../`, `%2e%2e` in request paths

```nginx
# Nginx — block common scanning paths immediately
location ~* (\.env|\.git|wp-admin|phpmyadmin|\.htaccess) {
  deny all;
  return 404;
}
```

---

## Pre-ship security checklist

### Network
- [ ] Port scan run (`nmap -sV your-server-ip`) — only 80, 443, 22 open
- [ ] SSH restricted to your IP only (not 0.0.0.0)
- [ ] Databases bound to localhost — not exposed to internet
- [ ] Firewall enabled with default-deny policy
- [ ] FTP/Telnet disabled

### HTTPS
- [ ] TLS 1.2/1.3 only — TLS 1.0 and 1.1 disabled
- [ ] HTTP → HTTPS redirect in place (301)
- [ ] SSL certificate valid and not expiring within 30 days
- [ ] HSTS header set with `max-age=31536000`

### Headers
- [ ] CSP header set and tested in report-only mode first
- [ ] `X-Content-Type-Options: nosniff` set
- [ ] `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'` set
- [ ] `Referrer-Policy` set
- [ ] `Permissions-Policy` set — disables unused browser features
- [ ] Server version header hidden (`server_tokens off`)
- [ ] Score A or A+ on https://securityheaders.com

### Application
- [ ] All user input validated server-side
- [ ] All SQL queries parameterized — no string concatenation
- [ ] Session cookies have `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] No sensitive data in URL query strings
- [ ] Rate limiting on login, signup, and API endpoints
- [ ] `.env` files not accessible via web server
- [ ] Error messages don't leak stack traces or version info to users

### Monitoring
- [ ] Logging enabled for all 4xx and 5xx responses
- [ ] Alerting on repeated failed logins
- [ ] Common scanning paths blocked and logged
