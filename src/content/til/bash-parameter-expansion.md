---
title: "Bash Parameter Expansion Tricks"
date: 2026-01-25T00:00:00Z
tags: ["bash", "shell"]
category: "linux"
draft: true
---

Bash parameter expansion is wildly powerful and eliminates the need for `sed`, `awk`, or `cut` in many cases. Here's a quick reference of the expansions I use most.

## Default Values

```bash
# Use default if unset or empty
echo "${NAME:-anonymous}"    # "anonymous" if $NAME is unset/empty

# Assign default if unset or empty
echo "${NAME:=anonymous}"    # Sets $NAME to "anonymous" too

# Use alternate value if SET
echo "${NAME:+found}"        # "found" if $NAME is set, empty otherwise

# Error if unset
echo "${NAME:?'NAME is required'}"  # Exits with error if unset
```

## String Manipulation

```bash
FILE="archive.tar.gz"

# Remove shortest match from start
echo "${FILE#*.}"      # tar.gz

# Remove longest match from start
echo "${FILE##*.}"     # gz  (gets the extension)

# Remove shortest match from end
echo "${FILE%.*}"      # archive.tar

# Remove longest match from end
echo "${FILE%%.*}"     # archive  (gets the base name)
```

## Search and Replace

```bash
TEXT="hello world, hello bash"

# Replace first occurrence
echo "${TEXT/hello/hi}"      # "hi world, hello bash"

# Replace all occurrences
echo "${TEXT//hello/hi}"     # "hi world, hi bash"

# Replace at start
echo "${TEXT/#hello/hi}"     # "hi world, hello bash"

# Replace at end
echo "${TEXT/%bash/zsh}"     # "hello world, hello zsh"
```

## Case Conversion

```bash
VAR="Hello World"

echo "${VAR^^}"    # HELLO WORLD  (uppercase)
echo "${VAR,,}"    # hello world  (lowercase)
echo "${VAR^}"     # Hello World  (capitalize first)
```

## Length

```bash
echo "${#VAR}"     # 11  (string length)
```

These work in bash 4+ without spawning subprocesses — making scripts faster and more readable than piping through external tools.
