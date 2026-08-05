---
title: "OCI Homelab (Infrastructure as Code)"
description: "Terraform-managed multi-node k3s cluster on Oracle Cloud's always-free tier — VCN, hardened compute, WireGuard bastion, and remote state. Reproducible from zero."
tech:
  [
    "Terraform",
    "OCI",
    "Kubernetes / k3s",
    "Cloud-init",
    "WireGuard",
    "Infrastructure as Code",
  ]
github: "https://github.com/1Mangesh1/oci-homelab-iac"
demo: ""
featured: true
date: 2026-04-11T00:00:00Z
---

**The problem.** I wanted somewhere to run side projects and learn Kubernetes for real, without a cloud bill — so the whole thing had to fit inside Oracle Cloud's always-free tier and stand back up from code if it burned down.

**What I built.** Four instances using 100% of the free compute quota: a k3s control plane and worker (2 OCPU / 12 GB ARM each) running Traefik, cert-manager, and monitoring; plus two AMD micros for a WireGuard/SSH bastion and external uptime monitoring. Networking is a `10.0.0.0/16` VCN with an internet gateway and network security groups scoped per service.

**Security by default.** Cloud-init hardens every instance on first boot — password and root SSH disabled, fail2ban and a UFW firewall enabled. k3s nodes are reached through a WireGuard VPN bastion rather than exposed directly.

**How it's structured.** I split it into `network`, `security`, and `compute` modules with remote state in OCI Object Storage — reproducible, versioned, and reviewable rather than click-ops.
