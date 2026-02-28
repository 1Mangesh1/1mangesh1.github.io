---
title: "Docker BuildKit Secrets: Don't Bake Credentials into Images"
date: 2026-01-15T00:00:00Z
tags: ["docker", "security", "devops"]
category: "devops"
draft: true
---

One of the most common Docker security mistakes: putting credentials in build args or copying secret files into the image. Even if you delete them in a later layer, they're still in the image history. BuildKit secrets solve this properly.

## The Problem

```dockerfile
# DON'T DO THIS
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
RUN npm install
RUN rm .npmrc  # Still in a previous layer!
```

Anyone with the image can run `docker history` or extract layers and find your token.

## The Solution: `--mount=type=secret`

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./

# Mount the secret at build time — never written to a layer
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc \
    npm install --production

COPY . .
CMD ["node", "server.js"]
```

Build with:

```bash
# Pass the secret file at build time
docker build --secret id=npmrc,src=$HOME/.npmrc -t my-app .

# Or pass from an environment variable
echo "$NPM_TOKEN" | docker build --secret id=npm_token -t my-app .
```

## Using the Secret in the Dockerfile

```dockerfile
# Access secret as a file
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN=$(cat /run/secrets/npm_token) && \
    echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc && \
    npm install && \
    rm .npmrc
```

The file at `/run/secrets/<id>` exists only during that `RUN` instruction — it's a tmpfs mount that never touches the image filesystem.

## Verify It's Clean

```bash
docker history my-app         # No secrets visible
docker inspect my-app         # No secret build args
dive my-app                   # No .npmrc in any layer
```

BuildKit secrets are the only safe way to use credentials during Docker builds. Enable BuildKit with `export DOCKER_BUILDKIT=1` or use Docker 23.0+ where it's the default.
