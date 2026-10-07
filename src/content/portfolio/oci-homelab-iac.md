---
title: "OCI Homelab (Infrastructure as Code)"
description: "A Terraform-managed multi-node k3s cluster on Oracle Cloud's always-free tier, with a VCN, hardened compute, a WireGuard bastion, and remote state. It is reproducible from zero."
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
status: "wip"
---

**The problem.** I wanted somewhere to run side projects and learn Kubernetes for real, without a cloud bill. So the whole thing had to fit inside Oracle Cloud's always-free tier and stand back up from code if it burned down.

**What I built.** Four instances use 100% of the free compute quota. A k3s control plane and worker (ARM, 2 OCPU and 12 GB each) run Traefik, cert-manager, and monitoring. Two AMD micros run a bastion for WireGuard and SSH, and external uptime monitoring. Networking is a `10.0.0.0/16` VCN with an internet gateway and network security groups scoped per service.

**Security by default.** Cloud-init hardens every instance on first boot. It disables password and root SSH, and it enables fail2ban and a UFW firewall. k3s nodes are reached through a WireGuard VPN bastion rather than exposed directly.

**How it is structured.** I split it into `network`, `security`, and `compute` modules with remote state in OCI Object Storage. This setup is reproducible, versioned, and reviewable rather than click-ops.
