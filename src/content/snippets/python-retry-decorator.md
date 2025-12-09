---
title: "Retry Decorator with Exponential Backoff"
description: "Automatically retry failed operations with increasing delays"
language: "python"
tags: ["decorator", "error-handling", "api"]
date: 2025-12-06T00:00:00Z
---

A decorator that retries failed functions with exponential backoff - essential for API calls and flaky operations.

```python
import time
import functools
from typing import Type, Tuple

def retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: Tuple[Type[Exception], ...] = (Exception,)
):
    """
    Retry decorator with exponential backoff.

    Args:
        max_attempts: Maximum number of retry attempts
        delay: Initial delay between retries (seconds)
        backoff: Multiplier for delay after each retry
        exceptions: Tuple of exceptions to catch and retry
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            current_delay = delay
            last_exception = None

            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        time.sleep(current_delay)
                        current_delay *= backoff

            raise last_exception
        return wrapper
    return decorator
```

## Usage

```python
import requests

@retry(max_attempts=3, delay=1, exceptions=(requests.RequestException,))
def fetch_data(url: str) -> dict:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return response.json()

# Automatically retries on network errors
data = fetch_data("https://api.example.com/data")
```
