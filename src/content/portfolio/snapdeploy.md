---
title: "SnapDeploy - One-Click Deployment Platform"
description: "A self-hosted deployment platform that lets you ship Docker containers to any cloud with a single click"
image: "/images/portfolio/snapdeploy.jpg"
tech: ["Go", "Docker", "gRPC", "React", "PostgreSQL", "Terraform"]
github: "https://github.com/1Mangesh1/snapdeploy"
featured: true
date: 2025-11-15T00:00:00Z
---

## Motivation

Deploying containerized applications shouldn't require a PhD in DevOps. Most teams either over-invest in complex Kubernetes setups they don't need, or under-invest and end up SSH-ing into servers to pull images manually. SnapDeploy fills the gap — a self-hosted platform that gives you Heroku-like simplicity with full control over your infrastructure.

Push your code, define your services in a simple YAML file, and click deploy. SnapDeploy handles the rest — building images, provisioning infrastructure, rolling out updates, and managing rollbacks.

## Architecture

The platform is composed of four services communicating over gRPC:

**API Gateway** — A Go service exposing a REST API for the React frontend and a gRPC interface for internal service communication. Handles authentication (GitHub OAuth + API keys), request validation, and rate limiting.

**Build Service** — Receives build requests, clones repositories, and builds Docker images using the Docker SDK for Go. Supports multi-stage builds, build caching via registry-based layer caching, and buildpack detection for projects without a Dockerfile. Built images are pushed to the user's configured registry (Docker Hub, ECR, GCR, or SnapDeploy's built-in registry).

**Deploy Service** — The core orchestrator. Takes a deploy manifest and provisions infrastructure using Terraform's Go SDK. Supports AWS ECS, Google Cloud Run, DigitalOcean App Platform, and bare-metal Docker hosts. Implements blue-green deployments with automatic health checking and rollback on failure.

**Metrics Collector** — A lightweight agent deployed alongside each application that reports resource usage, request counts, error rates, and response times back to the platform via gRPC streaming.

## Deploy Pipeline

1. **Trigger**: Git push webhook or manual click in the UI
2. **Build**: Clone repo → detect runtime → build Docker image → push to registry
3. **Plan**: Generate Terraform plan for target infrastructure
4. **Provision**: Apply Terraform changes (create/update load balancers, services, networking)
5. **Deploy**: Pull image on target, start new containers, run health checks
6. **Verify**: Monitor error rates for 5 minutes; auto-rollback if threshold exceeded
7. **Promote**: Shift traffic from old to new; drain and terminate old containers

## Key Features

- **Multi-Cloud**: Deploy to AWS, GCP, DigitalOcean, or your own servers from one interface
- **Zero-Config Deploys**: Automatic runtime detection for Node.js, Python, Go, and Rust projects
- **Preview Environments**: Every PR gets an ephemeral environment with a unique URL
- **Rollback in Seconds**: One-click rollback to any previous deployment with full state restoration
- **Deploy Logs**: Real-time streaming build and deploy logs in the UI
- **Team Management**: Organization-level access controls with deploy permissions per environment

## Technical Highlights

**gRPC for Internal Communication** — Chose gRPC over REST for service-to-service calls for type safety via protobuf schemas, efficient binary serialization, and native streaming support for build/deploy log forwarding.

**Terraform as the Provisioning Engine** — Rather than writing custom cloud provider integrations, SnapDeploy generates Terraform configurations dynamically and applies them via the Terraform Go SDK. This leverages Terraform's mature provider ecosystem and state management while keeping SnapDeploy cloud-agnostic.

**PostgreSQL for State** — All deployment state, build artifacts metadata, and audit logs live in PostgreSQL. The deploy history table uses a temporal design pattern, making it trivial to query the exact state of any environment at any point in time.
