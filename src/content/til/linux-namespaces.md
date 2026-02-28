---
title: "Linux Namespaces: How Containers Actually Work"
date: 2026-02-05T00:00:00Z
tags: ["linux", "containers", "docker"]
category: "linux"
draft: true
---

Docker, Podman, LXC — they all rely on the same Linux kernel feature: **namespaces**. Namespaces partition kernel resources so that one set of processes sees one set of resources, while another set sees a different set. It's not virtualization — it's isolation.

## The Key Namespaces

| Namespace | Isolates | Flag |
|-----------|----------|------|
| **PID** | Process IDs | `CLONE_NEWPID` |
| **NET** | Network stack (interfaces, routes, ports) | `CLONE_NEWNET` |
| **MNT** | Mount points (filesystem view) | `CLONE_NEWNS` |
| **UTS** | Hostname | `CLONE_NEWUTS` |
| **IPC** | Inter-process communication | `CLONE_NEWIPC` |
| **USER** | User/group IDs | `CLONE_NEWUSER` |
| **CGROUP** | Cgroup root directory | `CLONE_NEWCGROUP` |

## See It in Action with `unshare`

You can create namespaces without Docker using `unshare`:

```bash
# Create a new PID and mount namespace
sudo unshare --pid --mount --fork /bin/bash

# Inside the new namespace:
mount -t proc proc /proc
ps aux
# You'll only see processes in THIS namespace
# PID 1 is your bash shell — not systemd
```

## Inspect a Container's Namespaces

```bash
# Find the container's PID
docker inspect --format '{{.State.Pid}}' my-container
# e.g., 12345

# List its namespaces
ls -la /proc/12345/ns/
# lrwxrwxrwx  cgroup -> cgroup:[4026532456]
# lrwxrwxrwx  mnt -> mnt:[4026532457]
# lrwxrwxrwx  pid -> pid:[4026532458]
# ...
```

Containers aren't magic — they're just processes with their own view of the system. Understanding namespaces demystifies everything from `docker run` to Kubernetes pod isolation.
