---
title: "Git Stash With a Message"
date: 2025-12-08T00:00:00Z
tags: ["git", "productivity"]
category: "git"
---

You can name your stashes to remember what they contain:

```bash
# Stash with a message
git stash push -m "WIP: login feature"

# List stashes with messages
git stash list
# stash@{0}: On main: WIP: login feature

# Apply specific stash
git stash apply stash@{0}
```

Also useful: `git stash --include-untracked` to stash new files too!
