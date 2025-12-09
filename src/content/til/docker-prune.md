---
title: "Docker System Prune - Reclaim Disk Space"
date: 2025-10-04T00:00:00Z
tags: ["docker", "devops"]
category: "devops"
---

Docker can eat up gigabytes of disk space. Clean it up:

```bash
# Remove unused containers, networks, images
docker system prune

# Include volumes (careful!)
docker system prune --volumes

# Remove ALL unused images (not just dangling)
docker system prune -a

# See what's using space
docker system df
```

I recovered 40GB after running this. Run it monthly!
