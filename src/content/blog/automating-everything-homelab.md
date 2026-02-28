---
title: "Automating Everything: My Home Lab Setup"
description: "How I built a home lab that automates deployments, monitoring, backups, and more"
pubDate: 2026-01-25T00:00:00Z
tags: ["homelab", "automation", "self-hosting", "devops", "docker"]
draft: true
---

There's a certain joy in running your own infrastructure. No cloud bills, no vendor lock-in, and complete control over your data. Over the past year, I've built a home lab that automates deployments, monitoring, backups, and DNS — and I want to share everything I learned.

## Hardware Choices

After researching endlessly, I settled on a pragmatic setup:

- **Compute**: Intel NUC 13 Pro (i7-1360P, 64GB RAM, 1TB NVMe) — small, quiet, and powerful enough for dozens of containers
- **Storage**: Synology DS923+ NAS with 4×8TB drives in SHR (Synology Hybrid RAID) for redundancy
- **Network**: Ubiquiti UniFi Dream Machine SE for VLANs and firewall rules
- **UPS**: APC Back-UPS 1500VA to survive power blips

Total cost was around $2,000 — roughly what you'd spend on 18 months of equivalent cloud resources.

## Proxmox as the Foundation

I installed **Proxmox VE** on the NUC as my hypervisor. It gives me the flexibility to run both VMs and LXC containers. My layout:

- **docker-host** (VM, 32GB RAM): Runs all Docker workloads
- **pihole** (LXC, 512MB RAM): DNS ad-blocking
- **ansible-controller** (LXC, 1GB RAM): Runs Ansible playbooks via cron

Proxmox also handles automated VM backups to the NAS via its built-in backup scheduler.

## The Docker Compose Stack

Everything runs as Docker containers orchestrated by Docker Compose. Here's a simplified version of my primary stack:

```yaml
version: "3.9"

services:
  traefik:
    image: traefik:v3.0
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=me@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-certs:/letsencrypt
    restart: unless-stopped

  portainer:
    image: portainer/portainer-ce:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer-data:/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer.rule=Host(`portainer.home.lab`)"
      - "traefik.http.routers.portainer.tls.certresolver=letsencrypt"
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(`grafana.home.lab`)"
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    restart: unless-stopped

  uptime-kuma:
    image: louislam/uptime-kuma:latest
    volumes:
      - uptime-data:/app/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.uptime.rule=Host(`status.home.lab`)"
    restart: unless-stopped

volumes:
  traefik-certs:
  portainer-data:
  grafana-data:
  prometheus-data:
  uptime-data:
```

### How Traefik Ties It Together

Traefik is the magic glue. It automatically discovers Docker containers, provisions Let's Encrypt TLS certificates, and routes traffic based on hostnames. Adding a new service is as simple as adding the right labels. No nginx config files to manage.

## Monitoring with Grafana + Prometheus

Prometheus scrapes metrics from every service, and Grafana visualizes them. My dashboard includes:

- **Node Exporter**: CPU, memory, disk, and network metrics from the host
- **cAdvisor**: Per-container resource usage
- **Uptime Kuma**: Service availability and response times
- **Custom metrics**: Application-specific data pushed via Pushgateway

I set up Grafana alerting to send notifications to a private Discord channel when anything goes sideways — disk usage over 85%, a container restarting, or a service going down.

## Automated Backups with Restic

Backups are non-negotiable. I use **restic** with a cron job that runs nightly:

```bash
#!/bin/bash
# /opt/scripts/backup.sh

export RESTIC_REPOSITORY="sftp:nas:/volume1/backups/homelab"
export RESTIC_PASSWORD_FILE="/root/.restic-password"

# Backup Docker volumes
restic backup /var/lib/docker/volumes/ \
  --tag docker-volumes \
  --exclude="*.tmp" \
  --exclude="*.log"

# Backup compose files and configs
restic backup /opt/homelab/ \
  --tag configs

# Prune old snapshots: keep 7 daily, 4 weekly, 6 monthly
restic forget \
  --keep-daily 7 \
  --keep-weekly 4 \
  --keep-monthly 6 \
  --prune

# Verify backup integrity
restic check
```

The script backs up to the Synology NAS over SFTP. I also have a secondary restic repository on Backblaze B2 for off-site redundancy, because a backup that lives next to your server isn't really a backup.

## DNS with Pi-hole

Pi-hole handles DNS for the entire network, providing ad-blocking and local DNS resolution. I have custom DNS entries for all my services:

```
192.168.1.100  portainer.home.lab
192.168.1.100  grafana.home.lab
192.168.1.100  status.home.lab
```

Combined with Traefik's routing, I can access any service by name with valid TLS. The experience feels like using cloud services, but everything runs in my closet.

## Ansible for Provisioning

When I need to rebuild or add machines, Ansible handles the heavy lifting. Here's a snippet from my provisioning playbook:

```yaml
---
# playbooks/setup-docker-host.yml
- name: Configure Docker Host
  hosts: docker_hosts
  become: true

  tasks:
    - name: Update and upgrade packages
      apt:
        update_cache: yes
        upgrade: dist

    - name: Install prerequisite packages
      apt:
        name:
          - apt-transport-https
          - ca-certificates
          - curl
          - gnupg
          - lsb-release
          - restic
          - htop
          - tmux
        state: present

    - name: Add Docker GPG key
      ansible.builtin.apt_key:
        url: https://download.docker.com/linux/ubuntu/gpg
        state: present

    - name: Add Docker repository
      ansible.builtin.apt_repository:
        repo: "deb https://download.docker.com/linux/ubuntu {{ ansible_distribution_release }} stable"
        state: present

    - name: Install Docker Engine
      apt:
        name:
          - docker-ce
          - docker-ce-cli
          - containerd.io
          - docker-compose-plugin
        state: present

    - name: Add user to docker group
      user:
        name: "{{ ansible_user }}"
        groups: docker
        append: yes

    - name: Copy Docker Compose stack
      copy:
        src: ../compose/
        dest: /opt/homelab/
        owner: root
        group: root
        mode: "0644"

    - name: Start services
      community.docker.docker_compose_v2:
        project_src: /opt/homelab
        state: present
```

I can go from a fresh Proxmox VM to a fully running stack in under 10 minutes with a single `ansible-playbook` command.

## Lessons Learned

**Start small.** I began with just Pi-hole and Portainer. Each week I added one more service. Trying to build everything at once leads to frustration and misconfigurations.

**Document obsessively.** I keep a private wiki (BookStack, also self-hosted) documenting every configuration choice. Future-me always thanks past-me.

**Automate the boring stuff first.** Backups and monitoring should be automated before you add fun services. It's not glamorous, but it saves you when things break at 2 AM.

**UPS is essential.** My first power outage corrupted a database. The UPS paid for itself on day one.

**VLAN your IoT devices.** Smart home devices have no business talking to your server. Network segmentation via VLANs keeps things secure.

**Test your backups.** A backup you've never restored is just a hope. I do monthly restore drills to a temporary VM.

## What's Next

I'm currently exploring:

- **Kubernetes (k3s)** for container orchestration — overkill for now, but great for learning
- **Tailscale** for secure remote access without exposing ports
- **Home Assistant** for smart home automation integrated with my monitoring stack

The home lab is never "done" — and that's exactly the point. It's a playground for learning infrastructure skills that directly translate to professional work. Every outage, every failed upgrade, every debugging session makes you a better engineer.

If you're considering building a home lab, my advice is simple: buy a cheap mini PC, install Proxmox, and start with one container. You'll be amazed how quickly it grows from there.
