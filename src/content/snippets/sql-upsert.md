---
title: "SQL Upsert (Insert or Update)"
description: "Insert a row or update if it exists - PostgreSQL, MySQL, SQLite"
language: "sql"
tags: ["database", "postgresql", "mysql"]
date: 2025-12-04T00:00:00Z
---

Upsert = INSERT if new, UPDATE if exists. Here's how to do it across databases.

## PostgreSQL (ON CONFLICT)

```sql
INSERT INTO users (id, name, email, updated_at)
VALUES (1, 'John', 'john@example.com', NOW())
ON CONFLICT (id)
DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Or do nothing on conflict
INSERT INTO users (id, name, email)
VALUES (1, 'John', 'john@example.com')
ON CONFLICT (id) DO NOTHING;
```

## MySQL (ON DUPLICATE KEY)

```sql
INSERT INTO users (id, name, email, updated_at)
VALUES (1, 'John', 'john@example.com', NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  updated_at = NOW();
```

## SQLite (ON CONFLICT)

```sql
INSERT INTO users (id, name, email)
VALUES (1, 'John', 'john@example.com')
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  email = excluded.email;
```

## Key Points

- Requires a unique constraint on the conflict column(s)
- `EXCLUDED` (Postgres/SQLite) or `VALUES()` (MySQL) reference the incoming row
- Atomic operation - no race conditions
