---
title: "Zero-Trust Architecture for Side Projects"
description: "Apply enterprise security principles to your personal projects without the enterprise complexity"
pubDate: 2026-01-15T00:00:00Z
tags: ["security", "zero-trust", "devops", "self-hosting"]
draft: true
---

"Never trust, always verify" isn't just corporate jargon — it's the most sensible security model for self-hosted side projects too. The difference is you don't need a six-figure budget and a dedicated security team. Here's how to apply zero-trust principles with tools that are free, open-source, or have generous free tiers.

## Zero-Trust in 60 Seconds

Traditional security operates like a castle: hard exterior (firewall), soft interior (everything inside the network is trusted). Zero-trust flips this — **no implicit trust based on network location**. Every request, every connection, every user must prove they're authorized.

The core principles:
1. **Verify explicitly** — authenticate and authorize every access request
2. **Least privilege** — give the minimum access needed, nothing more
3. **Assume breach** — design as if attackers are already inside your network

## Step 1: Eliminate Public Exposure with Cloudflare Tunnel

The cheapest security fix is removing attack surface entirely. Instead of opening ports on your home server, use Cloudflare Tunnel to create outbound-only connections.

```yaml
# ~/.cloudflared/config.yml
tunnel: my-side-project
credentials-file: /home/user/.cloudflared/creds.json

ingress:
  - hostname: dashboard.myproject.dev
    service: http://localhost:3000
    originRequest:
      noTLSVerify: false
  - hostname: api.myproject.dev
    service: http://localhost:8080
  - service: http_status:404 # Catch-all
```

```bash
# Install and authenticate
brew install cloudflared
cloudflared tunnel login
cloudflared tunnel create my-side-project

# Run the tunnel
cloudflared tunnel run my-side-project
```

Now your services are accessible via Cloudflare's edge — no open ports, automatic TLS, DDoS protection included. Your server's IP never gets exposed.

## Step 2: Private Networking with Tailscale

For services that should never be publicly accessible (databases, admin panels, monitoring), use Tailscale to create a WireGuard-based mesh VPN.

```bash
# Install on all your devices
curl -fsSL https://tailscale.com/install.sh | sh

# Start with SSH enabled
sudo tailscale up --ssh

# Access your services via Tailscale IPs
ssh user@100.64.x.x  # MagicDNS: ssh user@my-server
```

Tailscale ACLs let you define who can access what:

```json
// tailscale ACL policy
{
  "acls": [
    {
      "action": "accept",
      "src": ["tag:admin"],
      "dst": ["tag:servers:*"]
    },
    {
      "action": "accept",
      "src": ["tag:monitoring"],
      "dst": ["tag:servers:9090"]  // Prometheus only
    }
  ],
  "tagOwners": {
    "tag:admin": ["mangesh@github"],
    "tag:servers": ["mangesh@github"],
    "tag:monitoring": ["mangesh@github"]
  }
}
```

## Step 3: Authentication Gateway with OAuth2 Proxy

Protect any web app with a single authentication layer, even apps that have no auth of their own:

```yaml
# docker-compose.yml
services:
  oauth2-proxy:
    image: quay.io/oauth2-proxy/oauth2-proxy:latest
    environment:
      OAUTH2_PROXY_PROVIDER: github
      OAUTH2_PROXY_CLIENT_ID: ${GITHUB_CLIENT_ID}
      OAUTH2_PROXY_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET}
      OAUTH2_PROXY_COOKIE_SECRET: ${COOKIE_SECRET}
      OAUTH2_PROXY_EMAIL_DOMAINS: "*"
      OAUTH2_PROXY_GITHUB_USER: "1mangesh1"  # Only allow yourself
      OAUTH2_PROXY_UPSTREAMS: "http://grafana:3000"
      OAUTH2_PROXY_COOKIE_SECURE: "true"
      OAUTH2_PROXY_COOKIE_HTTPONLY: "true"
      OAUTH2_PROXY_SET_XAUTHREQUEST: "true"
    ports:
      - "4180:4180"

  grafana:
    image: grafana/grafana:latest
    # No ports exposed — only accessible through oauth2-proxy
    environment:
      GF_AUTH_PROXY_ENABLED: "true"
      GF_AUTH_PROXY_HEADER_NAME: "X-Forwarded-Email"
```

Every request hits the OAuth2 proxy first. No valid GitHub session? Redirected to login. This works for **any** HTTP service — Grafana, Prometheus, internal dashboards, admin panels.

## Step 4: Secrets Management with SOPS

Stop putting secrets in `.env` files committed to Git (even private repos). Use Mozilla SOPS with age encryption:

```bash
# Install
brew install sops age

# Generate an age key
age-keygen -o ~/.config/sops/age/keys.txt

# Create .sops.yaml in your project root
cat > .sops.yaml << 'EOF'
creation_rules:
  - path_regex: \.enc\.yaml$
    age: >-
      age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p
EOF

# Encrypt a secrets file
sops --encrypt secrets.yaml > secrets.enc.yaml

# Edit encrypted file (decrypts in-memory, re-encrypts on save)
sops secrets.enc.yaml

# Use in scripts
DB_PASSWORD=$(sops --decrypt --extract '["database"]["password"]' secrets.enc.yaml)
```

The encrypted file is safe to commit:

```yaml
# secrets.enc.yaml — safe to commit!
database:
  password: ENC[AES256_GCM,data:abc123...,type:str]
  host: ENC[AES256_GCM,data:def456...,type:str]
api_keys:
  stripe: ENC[AES256_GCM,data:ghi789...,type:str]
sops:
  age:
    - recipient: age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p
```

## Step 5: Network Segmentation with Docker

Isolate services so a compromise in one container can't easily reach others:

```yaml
# docker-compose.yml
services:
  app:
    image: my-app:latest
    networks:
      - frontend
      - backend  # Can talk to DB

  nginx:
    image: nginx:alpine
    networks:
      - frontend  # Can only reach app, not DB

  postgres:
    image: postgres:16
    networks:
      - backend  # Only app can reach this
    # NO ports section — not exposed to host at all

  redis:
    image: redis:alpine
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No external access at all
```

The `internal: true` flag means the backend network has no gateway — containers on it literally cannot reach the internet. This limits blast radius if any single service is compromised.

## Step 6: Security Headers

Apply sensible HTTP security headers to every response. If you're using Cloudflare, add these as Transform Rules, or configure them in your reverse proxy:

```nginx
# nginx.conf
server {
    # ... existing config ...

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "0" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;
}
```

## The Checklist

Here's a quick-reference zero-trust checklist for your next side project:

- [ ] **No open inbound ports** — use tunnels (Cloudflare, Tailscale)
- [ ] **Authentication on every service** — OAuth2 Proxy or equivalent
- [ ] **Encrypted secrets** — SOPS, Sealed Secrets, or Vault
- [ ] **Network segmentation** — Docker networks with `internal: true`
- [ ] **Security headers** — CSP, HSTS, X-Frame-Options
- [ ] **Least privilege** — each service has minimum required permissions
- [ ] **Automatic updates** — Watchtower or Renovate for container images
- [ ] **Audit logging** — know who accessed what and when
- [ ] **2FA everywhere** — GitHub, Cloudflare, server SSH (use keys, not passwords)

## It's Easier Than You Think

The enterprise flavor of zero-trust involves service meshes, SPIFFE identities, and dedicated IAM teams. The side-project version? Cloudflare Tunnel + Tailscale + OAuth2 Proxy + Docker network segmentation. You can set all of this up in an afternoon, and your self-hosted services will be more secure than 90% of production apps out there.

Security isn't about being impenetrable — it's about making the cost of attack higher than the value of what you're protecting. For side projects, these tools make that cost very high indeed, for very little effort.
