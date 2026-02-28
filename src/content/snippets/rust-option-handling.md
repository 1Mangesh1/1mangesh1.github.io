---
title: "Rust Option and Result Handling Patterns"
description: "Clean patterns for handling Option and Result types in Rust without unwrap()"
language: "rust"
tags: ["error-handling", "patterns"]
date: 2026-01-15T00:00:00Z
draft: true
---

## Why Avoid `unwrap()`?

`unwrap()` panics on `None`/`Err` — fine for prototyping, but in production code prefer these patterns that handle every case explicitly.

## Pattern 1: `map` and `and_then` (Chaining)

Transform the inner value without leaving the `Option`/`Result` wrapper:

```rust
// map: transform the success value
let name: Option<String> = Some("  Alice  ".to_string());
let trimmed: Option<&str> = name.as_deref().map(str::trim);
// Some("Alice")

// and_then (flatMap): chain operations that themselves return Option
fn parse_port(s: &str) -> Option<u16> {
    s.strip_prefix(":")
        .and_then(|port_str| port_str.parse::<u16>().ok())
}

assert_eq!(parse_port(":8080"), Some(8080));
assert_eq!(parse_port("nope"),  None);
```

## Pattern 2: `unwrap_or`, `unwrap_or_else`, `unwrap_or_default`

Provide a fallback value:

```rust
let config_port: Option<u16> = None;

// Static default
let port = config_port.unwrap_or(3000);

// Computed default (lazy — only runs if None)
let port = config_port.unwrap_or_else(|| {
    eprintln!("No port configured, falling back to default");
    3000
});

// Default trait value (0 for numbers, "" for String, etc.)
let port: u16 = config_port.unwrap_or_default();
```

## Pattern 3: The `?` Operator (Early Return)

Propagate `None`/`Err` up to the caller — the most idiomatic Rust pattern:

```rust
use std::fs;
use std::num::ParseIntError;

#[derive(Debug)]
struct Config {
    host: String,
    port: u16,
}

fn load_config(path: &str) -> Result<Config, Box<dyn std::error::Error>> {
    let contents = fs::read_to_string(path)?;   // returns Err early if file fails

    let mut host = String::new();
    let mut port: u16 = 3000;

    for line in contents.lines() {
        let (key, value) = line.split_once('=')
            .ok_or("Invalid config line")?;      // converts None → Err

        match key.trim() {
            "host" => host = value.trim().to_string(),
            "port" => port = value.trim().parse()?, // ParseIntError → Box<dyn Error>
            _ => {}
        }
    }

    Ok(Config { host, port })
}
```

## Pattern 4: `if let` and `let else`

When you only care about one variant:

```rust
// if let — handle the Some/Ok case
fn greet(name: Option<&str>) {
    if let Some(n) = name {
        println!("Hello, {n}!");
    } else {
        println!("Hello, stranger!");
    }
}

// let-else (Rust 1.65+) — early return on the "bad" case
fn process_user(id: Option<u64>) -> String {
    let Some(id) = id else {
        return "No user ID provided".to_string();
    };
    format!("Processing user {id}")
}
```

## Pattern 5: `match` for Full Control

When you need to handle every case with different logic:

```rust
fn describe_status(code: Result<u16, String>) -> String {
    match code {
        Ok(200) => "OK".to_string(),
        Ok(404) => "Not Found".to_string(),
        Ok(c) if (500..600).contains(&c) => format!("Server Error ({c})"),
        Ok(c) => format!("HTTP {c}"),
        Err(e) => format!("Request failed: {e}"),
    }
}
```

## Pattern 6: Combinators for Complex Pipelines

Chain multiple fallible operations cleanly:

```rust
use std::collections::HashMap;

fn get_user_email(
    users: &HashMap<u64, User>,
    user_id: Option<u64>,
) -> Option<String> {
    user_id
        .and_then(|id| users.get(&id))        // Option<&User>
        .filter(|user| user.is_active)          // keep only active users
        .and_then(|user| user.email.clone())    // Option<String>
}

struct User {
    is_active: bool,
    email: Option<String>,
}
```

## Converting Between Option and Result

```rust
// Option → Result: attach an error message
let value: Option<i32> = None;
let result: Result<i32, &str> = value.ok_or("value was missing");

// Result → Option: discard the error
let parsed: Result<i32, _> = "42".parse();
let maybe: Option<i32> = parsed.ok();

// Transpose: Option<Result<T, E>> ↔ Result<Option<T>, E>
let x: Option<Result<i32, &str>> = Some(Ok(42));
let y: Result<Option<i32>, &str> = x.transpose(); // Ok(Some(42))
```

**Rules of thumb:**

- Use `?` as your default — it's the most readable.
- Use `map`/`and_then` for transformation chains.
- Use `unwrap_or_else` for fallbacks with side effects.
- Use `match` when different variants need different logic.
- Save `unwrap()` / `expect()` for cases where `None`/`Err` is truly impossible.
