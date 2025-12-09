---
title: "Python Walrus Operator :="
date: 2025-10-06T00:00:00Z
tags: ["python", "python3.8"]
category: "python"
---

The walrus operator (`:=`) assigns values inside expressions:

```python
# Before: Check and use a value
match = pattern.search(text)
if match:
    print(match.group())

# After: Assign and check in one line
if match := pattern.search(text):
    print(match.group())

# Great for while loops
while chunk := file.read(1024):
    process(chunk)

# In list comprehensions
results = [y for x in data if (y := expensive_func(x)) > 10]
```

Named after the walrus emoji `:=` which looks like eyes and tusks!
