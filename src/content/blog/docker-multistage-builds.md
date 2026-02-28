---
title: "Docker Multi-Stage Builds: Slim Images, Fast Deploys"
description: "Master Docker multi-stage builds to create production images that are 10x smaller"
pubDate: 2026-01-28T00:00:00Z
tags: ["docker", "devops", "containers", "ci-cd"]
draft: true
---

Your Docker image is probably too big. That Node.js app sitting in a 1.2GB image? It could be 150MB. That Go binary in a 900MB image? Try 12MB. The secret weapon is **multi-stage builds** — a Docker feature that lets you use multiple `FROM` statements to separate build dependencies from runtime dependencies. The result: smaller images, faster pulls, smaller attack surface, and cheaper storage.

## The Problem with Single-Stage Builds

Here's a typical single-stage Dockerfile for a Node.js application:

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

This works, but the final image includes:
- The full Node.js runtime and npm
- All `devDependencies` (TypeScript, ESLint, testing frameworks)
- Source files, test files, documentation
- Build tools and caches

Result: **~1.1GB image** for an app whose production runtime needs are maybe 100MB.

## Enter Multi-Stage Builds

Multi-stage builds let you use one stage to build and another to run. Only the artifacts you explicitly copy make it to the final image:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy only what we need
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]
```

Result: **~170MB image** — an 85% reduction. The builder stage is discarded entirely. Only the compiled output and production dependencies survive.

## Example: Go Binary (The Ultimate Slim Image)

Go compiles to a single static binary, making it perfect for minimal Docker images:

```dockerfile
# Stage 1: Build
FROM golang:1.22-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/server

# Stage 2: Scratch image (literally empty)
FROM scratch
COPY --from=builder /app/server /server
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

EXPOSE 8080
ENTRYPOINT ["/server"]
```

Result: **~12MB image**. The `scratch` base image is completely empty — no shell, no package manager, no OS utilities. Just your binary and TLS certificates.

Size comparison for a typical Go API:

| Approach           | Image Size | Layers |
|--------------------|-----------|--------|
| `golang:1.22`      | 890MB     | 8      |
| `golang:1.22-alpine` | 260MB  | 6      |
| Multi-stage + alpine | 28MB    | 4      |
| Multi-stage + scratch | 12MB   | 3      |

## Example: Python Application

Python doesn't compile to a binary, but we can still benefit from multi-stage builds by separating dependency compilation from runtime:

```dockerfile
# Stage 1: Build dependencies
FROM python:3.12-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Production
FROM python:3.12-slim AS production
WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY src/ ./src/
COPY config/ ./config/

# Create non-root user
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

The builder stage has `gcc` and development headers for compiling C extensions (like `psycopg2`). The production stage only has the compiled wheels — no compiler, no header files.

## Build Cache Optimization

Layer ordering matters for cache efficiency. Docker caches each layer, and a change invalidates all subsequent layers. Optimize for this:

```dockerfile
# ✅ Good: Dependencies change less often than source code
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ❌ Bad: Every source code change re-installs all dependencies
COPY . .
RUN npm ci
RUN npm run build
```

For monorepos or complex builds, you can use multiple cache-optimized stages:

```dockerfile
# Stage 1: Install dependencies (cached unless package.json changes)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Stage 2: Build (cached unless source changes)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

This three-stage approach means dependency installation is cached separately from the build step. Change a source file? Only stages 2 and 3 re-run.

## Security Scanning

Smaller images have a smaller attack surface. But you should still scan:

```bash
# Scan with Docker Scout
docker scout cves my-app:latest

# Scan with Trivy
trivy image my-app:latest

# Scan with Grype  
grype my-app:latest
```

Multi-stage builds help security in three ways:

1. **Fewer packages** = fewer potential vulnerabilities
2. **No build tools** in production = no compiler for attackers to exploit
3. **Non-root user** = reduced blast radius if compromised

## CI/CD Integration

Here's a GitHub Actions workflow that builds, scans, and pushes a multi-stage image:

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Security Scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ghcr.io/${{ github.repository }}:${{ github.sha }}
          severity: CRITICAL,HIGH
          exit-code: 1
```

The `cache-from` and `cache-to` directives use GitHub Actions' built-in cache, so subsequent builds only rebuild changed layers.

## Quick Reference: Base Image Sizes

| Base Image              | Size     | Use Case                    |
|------------------------|----------|-----------------------------|
| `ubuntu:22.04`         | 77MB     | Need full OS utilities      |
| `debian:bookworm-slim` | 74MB     | Debian without extras       |
| `alpine:3.19`          | 7MB      | Minimal Linux               |
| `distroless/static`    | 2MB      | Static binaries (Go, Rust)  |
| `scratch`              | 0MB      | Absolutely nothing          |

## The Takeaway

Multi-stage builds are not optional for production Docker images. They're the difference between a 1GB image that takes 45 seconds to pull and a 50MB image that deploys in 3 seconds. The pattern is always the same: build in a fat image, run in a slim one. Your CI pipeline, your cloud bill, and your security team will thank you.
