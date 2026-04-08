# Port scanning and firewall — deep reference

Load this file when you need full nmap command reference, UFW/iptables rules,
or specific service hardening steps for individual ports.

---

## Table of contents

1. [Nmap command reference](#nmap)
2. [Reading nmap output](#output)
3. [Dangerous ports and services](#dangerous)
4. [UFW firewall rules](#ufw)
5. [iptables (advanced)](#iptables)
6. [Service-specific hardening](#services)
7. [Online scanning tools](#online)

---

## Nmap command reference {#nmap}

```bash
# Basic scan — top 1000 TCP ports, service detection
nmap -sV your-server-ip

# Full TCP scan — all 65535 ports
nmap -p- -sV your-server-ip

# Fast scan — top 100 ports only
nmap -F your-server-ip

# UDP top 100 (finds DNS, SNMP, NTP issues)
sudo nmap -sU --top-ports 100 your-server-ip

# Aggressive — OS detection + versions + NSE scripts
nmap -A -T4 your-server-ip

# Check specific ports only
nmap -p 22,80,443,3306,5432 your-server-ip

# Vulnerability scripts (NSE)
nmap --script vuln your-server-ip

# Save output for later comparison
nmap -sV -oN scan-$(date +%Y%m%d).txt your-server-ip

# Compare two scans to find new open ports
ndiff scan-before.txt scan-after.txt
```

**Scan your own server only. Never scan servers you don't own.**

---

## Reading nmap output {#output}

```
PORT     STATE    SERVICE   VERSION
22/tcp   open     ssh       OpenSSH 8.9
80/tcp   open     http      nginx 1.24
443/tcp  open     https     nginx 1.24
3306/tcp filtered mysql
8080/tcp closed   http-alt
```

| State        | Meaning                                          | Action needed? |
|--------------|--------------------------------------------------|----------------|
| `open`       | A service is actively listening                  | Verify it's intentional |
| `closed`     | No service, but port responds to probes          | Consider filtering with firewall |
| `filtered`   | Firewall is blocking — Nmap can't determine state| Usually OK |
| `open\|filtered` | Can't tell if open or filtered              | Investigate |

**Anything open that shouldn't be: close it immediately.**

---

## Dangerous ports and services {#dangerous}

Close or block all of these unless you have a specific reason to expose them:

| Port(s)     | Service      | Risk                                          | Fix |
|-------------|--------------|-----------------------------------------------|-----|
| 21          | FTP          | Unencrypted, credential sniffing              | Disable; use SFTP (port 22) |
| 23          | Telnet       | Fully unencrypted — never use                 | Disable completely |
| 25          | SMTP         | Open relay spam, if misconfigured             | Restrict to localhost or authenticated relay |
| 110         | POP3         | Unencrypted email                             | Use POP3S (995) |
| 143         | IMAP         | Unencrypted email                             | Use IMAPS (993) |
| 161/UDP     | SNMP         | Leaks system info; default "public" community | Disable or restrict to management IPs |
| 445         | SMB          | EternalBlue, ransomware vector                | Never internet-facing |
| 3306        | MySQL        | DB access — should never be internet-facing   | Bind to 127.0.0.1 |
| 3389        | RDP          | Brute-forced constantly                       | VPN-only; never internet-facing |
| 5432        | PostgreSQL   | DB access                                     | Bind to 127.0.0.1 |
| 6379        | Redis        | No auth by default, arbitrary code execution  | Bind to 127.0.0.1 + requirepass |
| 8080/8443   | Alt HTTP/S   | Often dev servers accidentally left running   | Disable in production |
| 9200        | Elasticsearch| No auth by default                            | Bind to localhost + add auth |
| 27017       | MongoDB      | No auth by default in older versions          | Bind to localhost + enable auth |

---

## UFW firewall rules {#ufw}

UFW (Uncomplicated Firewall) is the recommended firewall manager for Ubuntu/Debian.

```bash
# Check current status
sudo ufw status verbose

# Reset to defaults (careful — will close all connections)
sudo ufw reset

# Default policy: deny everything in, allow everything out
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow web traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH only from your specific IP address
# Replace 1.2.3.4 with your actual IP
sudo ufw allow from 1.2.3.4 to any port 22

# Block a specific IP that's attacking you
sudo ufw deny from 192.168.1.100

# Enable (only after you've allowed SSH — or you'll lock yourself out)
sudo ufw enable

# View rules with numbers (for deleting)
sudo ufw status numbered

# Delete a rule by number
sudo ufw delete 3
```

### Rate limiting SSH with UFW

```bash
# Limit SSH connection attempts (blocks brute force)
sudo ufw limit ssh
```

---

## iptables (advanced) {#iptables}

For servers where UFW is unavailable. These rules apply immediately but don't persist on reboot.

```bash
# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT

# Allow HTTP and HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow SSH from specific IP only
iptables -A INPUT -p tcp --dport 22 -s 1.2.3.4 -j ACCEPT

# Rate limit SSH (5 connections per minute per IP)
iptables -A INPUT -p tcp --dport 22 -m limit --limit 5/min -j ACCEPT

# Drop everything else
iptables -A INPUT -j DROP

# Save rules (Debian/Ubuntu)
apt install iptables-persistent
netfilter-persistent save
```

---

## Service-specific hardening {#services}

### SSH

```bash
# /etc/ssh/sshd_config — changes that reduce SSH attack surface

PermitRootLogin no           # Never allow root login via SSH
PasswordAuthentication no    # Keys only — disable password auth
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
MaxAuthTries 3               # Lock out after 3 failed attempts
LoginGraceTime 20            # 20 seconds to authenticate
AllowUsers your-username     # Whitelist specific users only
Protocol 2                   # SSHv1 is broken
Port 22                      # Optionally change to non-standard port

# Restart SSH after changes
sudo systemctl restart sshd
```

### Nginx — hide server info

```nginx
server_tokens off;

# Also remove X-Powered-By if set by upstream
proxy_hide_header X-Powered-By;
more_clear_headers 'X-Powered-By';
```

### MySQL

```bash
# Run the built-in hardening script
sudo mysql_secure_installation

# In /etc/mysql/mysql.conf.d/mysqld.cnf
bind-address = 127.0.0.1  # Only local connections
local-infile = 0           # Disable local file reads
```

### Redis

```bash
# /etc/redis/redis.conf
bind 127.0.0.1 ::1          # Localhost only
requirepass YOUR_STRONG_PASSWORD
rename-command FLUSHALL ""  # Disable dangerous commands
rename-command FLUSHDB ""
rename-command CONFIG ""
```

---

## Online scanning tools (test your own server) {#online}

| Tool | URL | What it scans |
|------|-----|---------------|
| Shodan | https://www.shodan.io | What attackers can see about your IP |
| Pentest-Tools Port Scanner | https://pentest-tools.com/network-vulnerability-scanning/port-scanner-online-nmap | Online nmap |
| SSL Labs | https://www.ssllabs.com/ssltest | TLS configuration |
| Mozilla Observatory | https://observatory.mozilla.org | Full security audit |
| SecurityHeaders | https://securityheaders.com | HTTP header grades |
| URLScan | https://urlscan.io | Page resource and redirect scanning |

Search your own IP or domain on Shodan to see exactly what attackers see from the outside.
