---
title: "Building a CLI Tool in Rust from Scratch"
description: "A step-by-step guide to building a fast, reliable command-line tool using Rust and the clap crate"
pubDate: 2026-02-15T00:00:00Z
tags: ["rust", "cli", "systems-programming", "tutorial"]
draft: true
---

Building command-line tools is one of Rust's sweet spots. The language gives you C-level performance, memory safety without a garbage collector, and an incredible ecosystem of crates for CLI development. In this post, we'll build **filesearch** — a CLI tool that recursively searches directories for files matching a pattern — from an empty directory to a publishable crate.

## Why Rust for CLI Tools?

Before we write any code, here's why Rust is a fantastic choice for CLI tools:

- **Single binary distribution** — no runtime dependencies, just copy and run
- **Cross-compilation** — build for Linux, macOS, and Windows from one machine
- **Startup time** — near-instant, unlike Python or Node.js CLIs
- **Memory efficiency** — handles millions of files without breaking a sweat

## Project Setup

First, make sure you have Rust installed via [rustup](https://rustup.rs/). Then scaffold the project:

```bash
cargo new filesearch
cd filesearch
```

Add the dependencies we'll need to `Cargo.toml`:

```toml
[package]
name = "filesearch"
version = "0.1.0"
edition = "2021"
description = "A fast file search CLI tool"
license = "MIT"

[dependencies]
clap = { version = "4.5", features = ["derive"] }
walkdir = "2.5"
colored = "2.1"
regex = "1.10"
anyhow = "1.0"
```

Here's what each crate does:

- **clap** — argument parsing with derive macros
- **walkdir** — recursive directory traversal
- **colored** — terminal color output
- **regex** — pattern matching
- **anyhow** — ergonomic error handling

## Defining the CLI Interface with Clap

Clap's derive API lets us define our CLI as a struct. Create the argument structure in `src/main.rs`:

```rust
use clap::Parser;

/// A fast file search tool written in Rust
#[derive(Parser, Debug)]
#[command(name = "filesearch", version, about)]
struct Args {
    /// The pattern to search for (supports regex)
    #[arg(short, long)]
    pattern: String,

    /// The directory to search in (defaults to current directory)
    #[arg(short, long, default_value = ".")]
    directory: String,

    /// Search file contents instead of filenames
    #[arg(short, long)]
    contents: bool,

    /// Maximum depth to recurse into directories
    #[arg(long)]
    max_depth: Option<usize>,

    /// File extensions to include (e.g., rs,toml,md)
    #[arg(short, long, value_delimiter = ',')]
    extensions: Option<Vec<String>>,
}
```

With just this struct, `clap` gives us `--help`, `--version`, short flags, and type validation for free.

## Walking the Filesystem

Next, let's implement the core search logic. The `walkdir` crate makes recursive directory traversal straightforward:

```rust
use walkdir::WalkDir;
use regex::Regex;
use colored::*;
use anyhow::{Context, Result};
use std::fs;

fn search_filenames(args: &Args, re: &Regex) -> Result<Vec<String>> {
    let mut matches = Vec::new();

    let walker = WalkDir::new(&args.directory)
        .max_depth(args.max_depth.unwrap_or(usize::MAX))
        .into_iter()
        .filter_map(|e| e.ok());

    for entry in walker {
        let path = entry.path();

        // Filter by extension if specified
        if let Some(ref exts) = args.extensions {
            if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                if !exts.iter().any(|e| e == ext) {
                    continue;
                }
            } else {
                continue;
            }
        }

        let filename = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("");

        if re.is_match(filename) {
            matches.push(path.display().to_string());
        }
    }

    Ok(matches)
}
```

## Searching File Contents

When the `--contents` flag is passed, we need to read each file and search line by line:

```rust
fn search_contents(args: &Args, re: &Regex) -> Result<Vec<(String, usize, String)>> {
    let mut matches = Vec::new();

    let walker = WalkDir::new(&args.directory)
        .max_depth(args.max_depth.unwrap_or(usize::MAX))
        .into_iter()
        .filter_map(|e| e.ok());

    for entry in walker {
        let path = entry.path();

        if !path.is_file() {
            continue;
        }

        // Skip binary files by checking the first few bytes
        let content = match fs::read_to_string(path) {
            Ok(c) => c,
            Err(_) => continue, // Skip files we can't read as UTF-8
        };

        for (line_num, line) in content.lines().enumerate() {
            if re.is_match(line) {
                matches.push((
                    path.display().to_string(),
                    line_num + 1,
                    line.to_string(),
                ));
            }
        }
    }

    Ok(matches)
}
```

## Error Handling with Result and Anyhow

Rust's `Result` type forces you to handle errors explicitly. The `anyhow` crate makes this ergonomic by providing a catch-all error type and the `?` operator for propagation:

```rust
fn main() -> Result<()> {
    let args = Args::parse();

    let re = Regex::new(&args.pattern)
        .context("Invalid regex pattern")?;

    if args.contents {
        let matches = search_contents(&args, &re)?;
        if matches.is_empty() {
            println!("{}", "No matches found.".yellow());
        } else {
            println!("{} matches found:\n", matches.len().to_string().green());
            for (path, line_num, line) in &matches {
                println!(
                    "{}:{}: {}",
                    path.blue(),
                    line_num.to_string().yellow(),
                    line.trim()
                );
            }
        }
    } else {
        let matches = search_filenames(&args, &re)?;
        if matches.is_empty() {
            println!("{}", "No matches found.".yellow());
        } else {
            println!("{} matches found:\n", matches.len().to_string().green());
            for path in &matches {
                println!("  {}", path.blue());
            }
        }
    }

    Ok(())
}
```

The `.context()` method from `anyhow` adds human-readable context to errors, which is invaluable for CLI tools where users need to understand what went wrong.

## Testing It Out

Build and run the tool:

```bash
# Search for Rust files in the current project
cargo run -- --pattern "\.rs$" --directory src

# Search for TODO comments in file contents
cargo run -- --pattern "TODO|FIXME|HACK" --contents --extensions rs,toml

# Limit search depth
cargo run -- --pattern "config" --max-depth 2
```

## Publishing to crates.io

Once your tool is ready, publishing is straightforward:

```bash
# Make sure you're logged in
cargo login

# Do a dry run first
cargo publish --dry-run

# Publish for real
cargo publish
```

After publishing, anyone can install your tool with:

```bash
cargo install filesearch
```

## What's Next?

This is a solid foundation, but there's plenty of room to improve:

- **Parallelism** — use `rayon` to search files in parallel across CPU cores
- **Gitignore support** — respect `.gitignore` rules with the `ignore` crate
- **Output formats** — add JSON output for piping to other tools
- **Benchmarks** — use `criterion` to track performance regressions

Rust's CLI ecosystem is mature and battle-tested. Tools like `ripgrep`, `fd`, `bat`, and `exa` prove that Rust CLIs can outperform their C counterparts while being safer and more maintainable. Go build something fast.
