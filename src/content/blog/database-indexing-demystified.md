---
title: "Database Indexing Demystified: From B-Trees to Bloom Filters"
description: "A visual guide to database indexing strategies that every developer should understand"
pubDate: 2026-02-12T00:00:00Z
tags: ["databases", "indexing", "performance", "postgresql", "sql"]
draft: true
---

You've heard it a thousand times: "just add an index." But which kind? On which columns? And when does an index actually hurt performance? Let's demystify database indexing from the fundamentals up, with real PostgreSQL examples you can run today.

## Why Indexes Exist

Without an index, every query performs a **sequential scan** — reading every single row in the table. For 10 rows, that's fine. For 10 million rows, your users are watching a spinner.

An index is a separate data structure that maps column values to row locations, letting the database jump directly to matching rows instead of scanning everything.

```sql
-- Without an index: Sequential Scan (~200ms on 1M rows)
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;
-- Seq Scan on orders  (cost=0.00..18334.00 rows=100 width=64)
--   Filter: (customer_id = 42)
--   Rows Removed by Filter: 999900
--   Execution Time: 198.432 ms

-- Add an index
CREATE INDEX idx_orders_customer_id ON orders (customer_id);

-- With index: Index Scan (~0.5ms)
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;
-- Index Scan using idx_orders_customer_id on orders  (cost=0.42..12.44 rows=100 width=64)
--   Index Cond: (customer_id = 42)
--   Execution Time: 0.487 ms
```

That's a **400x improvement** from a single `CREATE INDEX` statement. But the magic is in understanding *how*.

## B-Tree Indexes: The Default Workhorse

PostgreSQL's default index type is the **B-tree** (balanced tree). It keeps data sorted in a tree structure where:

- The root node points to intermediate nodes
- Intermediate nodes narrow down the search range
- Leaf nodes contain pointers to actual table rows
- All leaf nodes are linked for efficient range scans

B-trees excel at:
- **Equality**: `WHERE email = 'alice@example.com'`
- **Range queries**: `WHERE created_at > '2026-01-01'`
- **Sorting**: `ORDER BY created_at DESC`
- **Prefix matching**: `WHERE name LIKE 'Ali%'` (but NOT `LIKE '%ice'`)

```sql
-- B-tree index (default)
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_orders_date ON orders (created_at DESC);
```

## Hash Indexes

For pure equality lookups, hash indexes are slightly faster than B-trees and use less space:

```sql
CREATE INDEX idx_sessions_token ON sessions USING hash (session_token);

-- Perfect for: WHERE session_token = 'abc123'
-- Useless for: WHERE session_token > 'abc' (no range support)
```

Since PostgreSQL 10, hash indexes are WAL-logged and crash-safe. Use them when you *only* do equality checks on high-cardinality columns.

## Composite (Multi-Column) Indexes

Column order matters enormously in composite indexes. The **leftmost prefix rule** determines which queries can use the index:

```sql
CREATE INDEX idx_orders_composite ON orders (customer_id, status, created_at);

-- ✅ Uses the index (matches left prefix)
SELECT * FROM orders WHERE customer_id = 42;
SELECT * FROM orders WHERE customer_id = 42 AND status = 'shipped';
SELECT * FROM orders WHERE customer_id = 42 AND status = 'shipped'
                      AND created_at > '2026-01-01';

-- ❌ Cannot use this index efficiently
SELECT * FROM orders WHERE status = 'shipped';              -- skips customer_id
SELECT * FROM orders WHERE created_at > '2026-01-01';       -- skips both
SELECT * FROM orders WHERE status = 'shipped'
                      AND created_at > '2026-01-01';        -- skips customer_id
```

Think of it like a phone book sorted by (last_name, first_name). You can look up all "Smiths" or "John Smith" quickly, but not all "Johns" across every last name.

## Partial Indexes

Why index rows you'll never query? Partial indexes only cover a subset of data:

```sql
-- Only index active users (maybe 10% of the table)
CREATE INDEX idx_users_active_email ON users (email)
  WHERE active = true;

-- Only index recent unprocessed orders
CREATE INDEX idx_orders_pending ON orders (created_at)
  WHERE status = 'pending' AND created_at > '2025-01-01';
```

Partial indexes are smaller, faster to build, and faster to maintain. Use them when your queries always include a filter condition.

## Covering Indexes (Index-Only Scans)

If an index contains all the columns a query needs, PostgreSQL can satisfy the query entirely from the index without touching the table at all:

```sql
-- The query
SELECT customer_id, status, total FROM orders WHERE customer_id = 42;

-- A covering index with INCLUDE
CREATE INDEX idx_orders_covering ON orders (customer_id)
  INCLUDE (status, total);

-- Now you get an Index Only Scan — much faster
EXPLAIN ANALYZE SELECT customer_id, status, total
  FROM orders WHERE customer_id = 42;
-- Index Only Scan using idx_orders_covering on orders
--   Execution Time: 0.089 ms
```

The `INCLUDE` columns are stored in the index leaf pages but aren't part of the search key. This gives you the speed of an index-only scan without bloating the tree structure.

## GIN Indexes: Full-Text and JSONB

**Generalized Inverted Indexes** map values to the rows containing them. Perfect for:

```sql
-- Full-text search
CREATE INDEX idx_posts_search ON posts
  USING gin(to_tsvector('english', title || ' ' || body));

SELECT * FROM posts
  WHERE to_tsvector('english', title || ' ' || body)
        @@ to_tsquery('english', 'database & indexing');

-- JSONB containment queries
CREATE INDEX idx_events_data ON events USING gin(metadata jsonb_path_ops);

SELECT * FROM events
  WHERE metadata @> '{"source": "github", "action": "push"}';

-- Array operations
CREATE INDEX idx_posts_tags ON posts USING gin(tags);

SELECT * FROM posts WHERE tags @> ARRAY['postgresql', 'performance'];
```

## GiST Indexes: Geometric and Range Data

**Generalized Search Trees** handle overlapping, containment, and nearest-neighbor queries:

```sql
-- Range types (scheduling, availability)
CREATE INDEX idx_bookings_range ON bookings USING gist(during);

SELECT * FROM bookings
  WHERE during && tsrange('2026-01-15', '2026-01-20');  -- overlaps

-- PostGIS geographic data
CREATE INDEX idx_locations_geo ON locations USING gist(coordinates);

SELECT * FROM locations
  WHERE ST_DWithin(coordinates, ST_MakePoint(-73.9857, 40.7484), 1000);
```

## Bloom Filters

Bloom filter indexes are useful when you have many columns queried in various combinations and can't predict which subsets will be searched:

```sql
CREATE EXTENSION bloom;

CREATE INDEX idx_products_bloom ON products
  USING bloom (category, brand, color, size, material)
  WITH (length=80, col1=2, col2=2, col3=2, col4=2, col5=2);

-- Works for any combination of these columns
SELECT * FROM products WHERE brand = 'Nike' AND color = 'red';
SELECT * FROM products WHERE size = 'L' AND material = 'cotton';
```

Bloom filters are lossy — they can produce false positives (which PostgreSQL rechecks), but they're much smaller than having a separate index per column combination.

## When NOT to Index

Indexes aren't free. Every index:
- **Slows writes** — every INSERT, UPDATE, DELETE must update all relevant indexes
- **Consumes storage** — indexes can be as large as the table itself
- **Requires maintenance** — bloated indexes need periodic `REINDEX`

Avoid indexing:
- **Small tables** (< 1,000 rows) — sequential scans are faster
- **Low-cardinality columns** — a boolean `active` column has only 2 values; a partial index is better
- **Frequently updated columns** — the write overhead may exceed the read benefit
- **Tables with heavy bulk inserts** — consider dropping indexes, loading data, then re-creating

## Monitoring Index Usage

Find unused indexes wasting resources:

```sql
-- Find indexes that have never been used
SELECT
  schemaname || '.' || relname AS table,
  indexrelname AS index,
  pg_size_pretty(pg_relation_size(i.indexrelid)) AS size,
  idx_scan AS times_used
FROM pg_stat_user_indexes i
JOIN pg_index USING (indexrelid)
WHERE idx_scan = 0
  AND NOT indisunique  -- Keep unique constraints
ORDER BY pg_relation_size(i.indexrelid) DESC;

-- Check index bloat
SELECT
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexname::regclass) DESC
LIMIT 20;
```

## The Indexing Decision Framework

1. **Profile first** — run `EXPLAIN ANALYZE` on slow queries before adding indexes
2. **Index the WHERE clause** — columns in `WHERE`, `JOIN ON`, and `ORDER BY` are candidates
3. **Check selectivity** — high-cardinality columns benefit most
4. **Consider covering indexes** — if you always select the same columns, include them
5. **Use partial indexes** — when queries consistently filter to a subset
6. **Monitor and prune** — remove unused indexes quarterly

Indexing is not a "set and forget" task. As data grows and query patterns change, your indexing strategy must evolve. The tools above give you the visibility and vocabulary to make informed decisions instead of guessing.
