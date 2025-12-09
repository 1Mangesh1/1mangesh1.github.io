---
title: "fd - A Better 'find' Command"
date: 2025-12-02T00:00:00Z
tags: ["linux", "cli", "tools"]
category: "linux"
---

`fd` is a modern replacement for `find` that's faster and easier:

```bash
# Find files by name (no need for -name)
fd readme

# Find by extension
fd -e md

# Find and execute command
fd -e js -x prettier --write

# Ignore hidden and gitignored files by default
# (use -H and -I to include them)

# Regex search
fd '^test.*\.py$'
```

Install: `brew install fd` or `apt install fd-find`

10x faster than find, and the syntax is actually memorable!
