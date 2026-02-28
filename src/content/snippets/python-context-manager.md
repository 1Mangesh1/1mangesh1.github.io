---
title: "Python Context Manager with __enter__ and __exit__"
description: "Create custom context managers for resource management in Python"
language: "python"
tags: ["patterns", "resource-management"]
date: 2026-02-10T00:00:00Z
draft: true
---

## Class-Based Context Manager

Implement `__enter__` and `__exit__` for full control:

```python
import time


class Timer:
    """Context manager that measures elapsed time."""

    def __init__(self, label: str = "Block"):
        self.label = label
        self.elapsed: float = 0.0

    def __enter__(self):
        self.start = time.perf_counter()
        return self  # returned object is bound to the `as` variable

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.perf_counter() - self.start
        print(f"{self.label} took {self.elapsed:.4f}s")
        return False  # re-raise any exceptions (True would suppress them)


# Usage
with Timer("Data processing") as t:
    data = [x**2 for x in range(1_000_000)]

print(f"Captured elapsed time: {t.elapsed:.4f}s")
```

## Decorator-Based with `@contextmanager`

For simpler cases, the generator pattern is more concise:

```python
from contextlib import contextmanager


@contextmanager
def temporary_env(key: str, value: str):
    """Temporarily set an environment variable, then restore."""
    import os

    original = os.environ.get(key)
    os.environ[key] = value
    try:
        yield value  # everything above is __enter__, below is __exit__
    finally:
        if original is None:
            del os.environ[key]
        else:
            os.environ[key] = original


# Usage
with temporary_env("API_URL", "https://staging.example.com") as url:
    print(f"Using {url}")
# original value is restored here
```

## Practical Example: Database Transaction

```python
from contextlib import contextmanager
import sqlite3


@contextmanager
def transaction(db_path: str):
    """
    Auto-commit on success, rollback on failure.
    The connection is always closed on exit.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
    except Exception:
        conn.rollback()
        raise  # re-raise after rollback
    finally:
        conn.close()


# Usage
with transaction("app.db") as cur:
    cur.execute("INSERT INTO users (name, email) VALUES (?, ?)", ("Ada", "ada@example.com"))
    cur.execute("INSERT INTO audit_log (action) VALUES (?)", ("user_created",))
# Both inserts commit together; if either fails, both roll back.
```

## Nested and Stacked Context Managers

Python 3 lets you stack multiple managers cleanly with `ExitStack`:

```python
from contextlib import ExitStack


def process_multiple_files(paths: list[str]) -> list[str]:
    """Open an arbitrary number of files and read them all."""
    with ExitStack() as stack:
        files = [stack.enter_context(open(p)) for p in paths]
        return [f.read() for f in files]
    # All files are closed when the block exits, even on error
```

**Key takeaways:**

- Class-based: best when you need to store state across enter/exit.
- `@contextmanager`: best for simple acquire/release patterns.
- Always use `try/finally` in generators to guarantee cleanup.
- Return `False` from `__exit__` to propagate exceptions (the safe default).
- Use `ExitStack` when the number of resources is dynamic.
