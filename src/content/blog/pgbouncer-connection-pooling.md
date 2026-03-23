---
title: "PgBouncer: Stop Drowning Your Database in Connections"
description: "How to use PgBouncer to manage PostgreSQL connections efficiently"
pubDate: 2026-03-23T00:00:00Z
tags: ["database", "postgresql", "devops", "performance"]
draft: false
---

## The problem nobody talks about until it's 3am

Your app creates a new database connection for every request. Fine. Then you're doing thousands of requests per second and PostgreSQL starts rejecting new connections—you've hit `max_connections`. Your database doesn't crash gracefully. It just stops accepting connections.

PgBouncer fixes this by sitting between your app and the database. Your app talks to PgBouncer, and PgBouncer reuses a small pool of actual database connections. Fewer connections to PostgreSQL means less memory, less context switching, fewer things that can go wrong.

## How it actually works

PgBouncer doesn't do magic. It does something simpler: it maintains a fixed pool of connections to your database and multiplexes requests from many clients across that pool.

Think of it like a restaurant greeter. The greeter (PgBouncer) talks to the customers (your app). The kitchen (PostgreSQL) only sees a handful of people ordering food, not the chaos of everyone in the lobby.

## Installation and basic setup

```bash
# macOS
brew install pgbouncer

# Ubuntu/Debian
apt-get install pgbouncer

# Docker
docker run -d pgbouncer/pgbouncer:latest
```

Create a config file at `/etc/pgbouncer/pgbouncer.ini`:

```ini
[databases]
mydb = host=localhost port=5432 dbname=mydb

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3
max_db_connections = 100
```

## Pool modes: transaction vs session (and why this matters)

**Transaction mode** is what you want. PgBouncer returns the connection to the pool after each transaction. It works with everything. Small overhead, but negligible compared to opening a real connection. Use this unless you have a weird edge case.

**Session mode** keeps the connection for the entire session. Faster. No per-transaction cost. The catch: connection state doesn't persist. `SET SESSION work_mem = '256MB'` doesn't carry into the next query because the next client might get a different connection. Prepared statements break. CLIENT ENCODING breaks. Use this if you're doing something specific and you understand the tradeoff.

**Statement mode** exists but don't bother with it.

## The settings that matter

`max_client_conn` - How many total connections PgBouncer accepts from clients. Default is 100. Raise this if you have many app instances.

`default_pool_size` - Connections PgBouncer keeps open per database. This is the sweet spot tuning parameter. Start with 25, watch your database, adjust based on actual load.

`min_pool_size` - Minimum connections kept open. Helps avoid the spike when traffic suddenly hits.

`reserve_pool_size` - Extra connections PgBouncer will open if the main pool is exhausted. Gives you breathing room before things fall apart.

`max_db_connections` - Total connections PgBouncer will open to the database. Set this lower than `max_connections` in PostgreSQL itself. For example, if PostgreSQL allows 200 connections and you have 4 PgBouncer instances, set this to 40 on each instance.

## What this looks like in practice

50 concurrent users, each hitting your API. Without PgBouncer, PostgreSQL now has 50 connections open. Memory bloat. Context switching hell. Your connection limit is getting close.

With PgBouncer (default_pool_size = 10): Your app opens 50 connections to PgBouncer, but PgBouncer only needs 10 actual connections to the database. Same throughput. PostgreSQL breathes easier.

## One gotcha to remember

If you use connection-specific features, transaction mode won't save you:

```sql
-- This will work
SET search_path = myschema;
SELECT * FROM users;

-- This will NOT work reliably in transaction mode
SET SESSION work_mem = '256MB';
SELECT expensive_query();
COMMIT;
-- Connection gets returned to pool. Next client gets different work_mem
```

Solution: Either use session mode (and accept the limitations) or handle this in your app layer, not database layer.

## Monitoring PgBouncer

Connect to the admin console on localhost:6432 (default):

```bash
psql -h localhost -p 6432 -U pgbouncer pgbouncer
```

Useful commands:

```sql
-- See current pool status
SHOW POOLS;

-- See client connections
SHOW CLIENTS;

-- See server connections
SHOW SERVERS;

-- See stats
SHOW STATS;
```

Watch `waiting_clients` in SHOW POOLS. If it's consistently > 0, your pool is undersized.

## When to add PgBouncer

- You have multiple app instances (2+)
- You're seeing "too many connections" errors
- Your database process list is crowded with idle connections
- You're deploying to Kubernetes or containers where connections are ephemeral

## When you probably don't need it

- You have a single app instance with <10 concurrent queries
- You're using a managed PostgreSQL service with built-in connection pooling (RDS, Cloud SQL)
- You only run batch jobs, not a live web service

Simple. PgBouncer sits between your app and database, opens fewer connections to PostgreSQL, and multiplexes requests across that pool. Use transaction mode. Monitor `waiting_clients`. Adjust `default_pool_size` when you see waiting clients. Not magic. Just works.


# References
- [PgBouncer Documentation](https://www.pgbouncer.org/)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)

