---
title: "Git Worktrees: Multiple Branches, No Stashing"
date: 2026-02-10T00:00:00Z
tags: ["git", "workflow"]
category: "git"
draft: true
---

Ever been deep into a feature branch when an urgent bug comes in? The usual dance: `git stash`, `git checkout main`, fix, commit, `git checkout feature`, `git stash pop`… and pray your stash applies cleanly. Git worktrees eliminate this entirely.

## What Are Worktrees?

A worktree is an additional working directory linked to the same repo. Each worktree checks out a different branch, sharing the same `.git` history. No cloning, no stashing.

## Core Commands

```bash
# Create a worktree for a hotfix branch
git worktree add ../hotfix-login main
cd ../hotfix-login
# Now you're on main in a separate directory

# Create a worktree with a new branch
git worktree add ../feat-dashboard -b feat/dashboard

# List all worktrees
git worktree list
# /home/user/project          abc1234 [main]
# /home/user/hotfix-login     abc1234 [main]
# /home/user/feat-dashboard   def5678 [feat/dashboard]

# Remove a worktree when done
git worktree remove ../hotfix-login
```

## When to Use Them

- **Urgent fixes** while mid-feature — switch without stashing
- **Comparing branches** side-by-side in your editor
- **Long-running tasks** (builds, tests) on one branch while coding on another
- **Code reviews** — check out a PR without disrupting your work

## Important Rules

- Each branch can only be checked out in **one** worktree at a time
- All worktrees share the same `.git` directory (and reflog, stashes, etc.)
- Run `git worktree prune` to clean up stale entries

Worktrees changed how I handle context-switching. Instead of juggling stashes or multiple clones, each task gets its own directory — clean, isolated, and instant.
