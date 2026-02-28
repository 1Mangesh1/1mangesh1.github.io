---
title: "Git Internals: Understanding the Object Model"
description: "Demystifying git by exploring blobs, trees, commits, and refs — the building blocks under the hood"
pubDate: 2026-02-14T00:00:00Z
tags: ["git", "internals", "version-control", "devtools"]
draft: true
---

Most developers use git daily but treat it as a black box. Once you understand the object model underneath, git stops being magical and starts being *logical*. Every command maps to simple operations on a content-addressable filesystem.

Let's crack open the `.git` directory and see how it actually works.

## The .git Directory

When you run `git init`, git creates a `.git` directory with this structure:

```bash
.git/
├── HEAD            # Points to current branch
├── config          # Repo-level configuration
├── objects/        # All content (blobs, trees, commits, tags)
│   ├── info/
│   └── pack/       # Packed objects for efficiency
├── refs/           # Branch and tag pointers
│   ├── heads/      # Local branches
│   └── tags/       # Tag references
├── index           # Staging area
└── hooks/          # Git hook scripts
```

Everything in git is stored as an **object** in the `objects/` directory or as a **reference** in `refs/`.

## The Four Object Types

Git has exactly four types of objects. That's it — the entire data model.

### 1. Blob (Binary Large Object)

A blob stores the **contents** of a file — nothing else. No filename, no permissions, no metadata. Just raw content.

```bash
# Create a blob manually
echo "Hello, Git!" | git hash-object -w --stdin
# Output: 0de77f1c94e2613185c19e4789f1e9e4e54d4445

# Inspect it
git cat-file -t 0de77f1   # blob
git cat-file -p 0de77f1   # Hello, Git!
```

The SHA-1 hash is computed from the content itself. Two files with identical content share the same blob — automatic deduplication.

```bash
# See how git computes the hash
echo -n "blob 12\0Hello, Git!\n" | sha1sum
# Same hash as above
```

### 2. Tree

A tree represents a **directory**. It maps filenames to blobs (files) and other trees (subdirectories).

```bash
# View the tree of the current commit
git cat-file -p HEAD^{tree}

# Output:
# 100644 blob a1b2c3d4...  README.md
# 100644 blob e5f6g7h8...  package.json
# 040000 tree i9j0k1l2...  src
```

Each entry has:
- **Mode**: `100644` (normal file), `100755` (executable), `040000` (directory), `120000` (symlink)
- **Type**: blob or tree
- **SHA-1**: hash of the object
- **Name**: filename

Trees are recursive. The `src` entry points to another tree object, which contains its own blobs and trees.

### 3. Commit

A commit object contains:
- A pointer to a **tree** (the project snapshot)
- Pointers to **parent commits** (zero for initial, one for normal, two+ for merges)
- Author and committer with timestamps
- The commit message

```bash
git cat-file -p HEAD

# Output:
# tree 8a3b5c7d9e...
# parent f1e2d3c4b5...
# author Mangesh Bide <mangesh@example.com> 1706900000 +0530
# committer Mangesh Bide <mangesh@example.com> 1706900000 +0530
#
# Add user authentication module
```

A commit doesn't store diffs — it stores a **complete snapshot** via the tree reference. Git computes diffs on the fly by comparing trees.

### 4. Tag (Annotated)

An annotated tag is an object that points to a commit with additional metadata.

```bash
git tag -a v1.0.0 -m "First stable release"
git cat-file -p v1.0.0

# Output:
# object a1b2c3d4...
# type commit
# tag v1.0.0
# tagger Mangesh Bide <mangesh@example.com> 1706900000 +0530
#
# First stable release
```

Lightweight tags (without `-a`) are just refs — no object created.

## SHA-1 Hashing: Content-Addressable Storage

Every object is identified by the SHA-1 hash of its content. This means:

1. **Same content = same hash** — automatic deduplication across commits
2. **Any change = different hash** — integrity verification is built in
3. **The hash includes the type and size** — you can't confuse a blob with a tree

```bash
# The actual format git hashes:
# <type> <size>\0<content>

# Verify for yourself:
echo -n "blob 12\0Hello, Git!\n" | sha1sum
```

This is why git is a **content-addressable filesystem** — you address objects by their content, not their location.

## Branches Are Just Pointers

This is the "aha" moment for most people. A branch is a **40-character file containing a commit hash**.

```bash
cat .git/refs/heads/main
# a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2

cat .git/HEAD
# ref: refs/heads/main
```

That's it. `HEAD` points to a branch, and the branch points to a commit. When you make a new commit, git updates the branch file to point to the new commit. This is why branching in git is instant — it's writing 40 bytes to a file.

```bash
# Create a branch manually (don't do this normally)
echo "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2" > .git/refs/heads/my-branch

# This is literally what `git branch my-branch` does
```

## How Merge Works Internally

A merge creates a new commit with **two parent pointers**.

```bash
# Before merge:
# main:    A --- B --- C
# feature:       \--- D --- E

git checkout main
git merge feature

# After merge:
# main:    A --- B --- C --- F (merge commit)
# feature:       \--- D --- E /
```

Git finds the **merge base** (commit B), then performs a three-way merge between B, C, and E. The resulting merge commit F has two parents: C and E.

```bash
git cat-file -p HEAD  # After merge
# tree ...
# parent <hash-of-C>
# parent <hash-of-E>
# ...
# Merge branch 'feature'
```

## How Rebase Works Internally

Rebase **replays commits** onto a new base. It creates entirely new commit objects.

```bash
# Before rebase:
# main:    A --- B --- C
# feature:       \--- D --- E

git checkout feature
git rebase main

# After rebase:
# main:    A --- B --- C
# feature:               \--- D' --- E'
```

D' and E' are **new commits** with new hashes — they have different parents than D and E, so they're different objects. The original D and E still exist (until garbage collected) but nothing references them.

This is why you should never rebase shared branches — it rewrites history.

## Packfiles: Storage Optimization

Storing full snapshots for every commit sounds wasteful. Git optimizes with **packfiles**.

```bash
# Trigger packing manually
git gc

# See pack files
ls .git/objects/pack/
# pack-a1b2c3d4.idx   # Index for quick lookup
# pack-a1b2c3d4.pack  # Compressed objects with deltas
```

Packfiles store objects as **deltas** — only the differences between similar objects. Git finds similar objects (usually different versions of the same file) and stores the newest version in full, with reverse deltas for older versions.

```bash
# Inspect a pack file
git verify-pack -v .git/objects/pack/pack-*.idx | head -20
```

## Building a Mini-Git in Bash

Let's implement the core operations to solidify understanding:

```bash
#!/bin/bash
# mini-git: demonstrate git's object model

# Hash and store a blob
mini_hash_object() {
  local content="$1"
  local size=${#content}
  local header="blob ${size}\0"
  local hash=$(printf "${header}${content}" | sha1sum | cut -d' ' -f1)
  local dir=".git/objects/${hash:0:2}"
  local file="${dir}/${hash:2}"
  
  mkdir -p "$dir"
  printf "${header}${content}" | zlib-flate -compress > "$file"
  echo "$hash"
}

# Read an object
mini_cat_file() {
  local hash="$1"
  local dir=".git/objects/${hash:0:2}"
  local file="${dir}/${hash:2}"
  
  zlib-flate -uncompress < "$file"
}

# Show what a commit points to
mini_log() {
  local hash=$(cat .git/refs/heads/main)
  while [ -n "$hash" ]; do
    echo "commit $hash"
    git cat-file -p "$hash" | grep -E "^(author|$)" | head -2
    echo "---"
    hash=$(git cat-file -p "$hash" | grep "^parent" | head -1 | cut -d' ' -f2)
  done
}
```

## Exploring Your Own Repo

Try these commands on any repo to see the object model in action:

```bash
# Count objects by type
git cat-file --batch-all-objects --batch-check | awk '{print $2}' | sort | uniq -c

# See the tree for any commit
git cat-file -p <commit-hash>^{tree}

# Trace the full object graph of a file
git log --follow --diff-filter=A -- path/to/file.ts

# Find the blob for a specific file in a specific commit
git ls-tree HEAD -- src/index.ts

# See all refs
git for-each-ref --format='%(refname) -> %(objectname:short)'

# Visualize the commit graph
git log --oneline --graph --all --decorate
```

## Key Takeaways

1. **Git has four objects**: blob (content), tree (directory), commit (snapshot + metadata), tag (named reference to a commit)
2. **Everything is content-addressed**: SHA-1 hash of the content is the identifier
3. **Branches are pointers**: just files containing a commit hash
4. **Commits store snapshots, not diffs**: diffs are computed on demand
5. **Packfiles optimize storage**: deltas compress similar objects

Once you see git as a content-addressable filesystem with a thin VCS layer on top, every command makes sense. `git checkout` is "update my working directory to match this tree." `git commit` is "create a new snapshot and move the branch pointer." `git merge` is "create a commit with two parents."

The magic is gone — and that's a good thing.
