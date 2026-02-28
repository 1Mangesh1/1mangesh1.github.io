---
title: "Python's match Statement is More Than a Switch"
date: 2026-02-15T00:00:00Z
tags: ["python", "pattern-matching"]
category: "python"
draft: true
---

Python 3.10 introduced `match`/`case` and it's far more powerful than a simple switch statement. It does **structural pattern matching** — you can destructure, bind variables, and add guard clauses.

## Basic Matching

```python
def handle_command(command):
    match command.split():
        case ["quit"]:
            print("Exiting...")
        case ["hello", name]:
            print(f"Hello, {name}!")
        case ["move", x, y]:
            print(f"Moving to ({x}, {y})")
        case _:
            print("Unknown command")

handle_command("hello World")   # Hello, World!
handle_command("move 10 20")    # Moving to (10, 20)
```

## Destructuring Dictionaries and Objects

```python
def process_event(event):
    match event:
        case {"type": "click", "x": x, "y": y}:
            print(f"Click at ({x}, {y})")
        case {"type": "keypress", "key": str(k)} if len(k) == 1:
            print(f"Single key: {k}")
        case {"type": "keypress", "key": key}:
            print(f"Special key: {key}")

process_event({"type": "click", "x": 100, "y": 200})
# Click at (100, 200)
```

## Guard Clauses with `if`

```python
def classify_age(age):
    match age:
        case n if n < 0:
            return "Invalid"
        case n if n < 13:
            return "Child"
        case n if n < 20:
            return "Teenager"
        case _:
            return "Adult"
```

## OR Patterns

```python
match status:
    case 200 | 201:
        print("Success")
    case 404 | 410:
        print("Gone")
    case _:
        print(f"Status: {status}")
```

The key insight: `match` isn't comparing values — it's matching **structure**. That makes it invaluable for parsing commands, processing API responses, or handling ASTs.
