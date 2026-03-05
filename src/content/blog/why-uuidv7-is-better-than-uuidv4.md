---
title: "Stop Using UUIDv4 as Primary Keys"
description: "Using UUIDv4 as a primary key fragments your B-Tree indexes and destroys insert performance. Here is why you need to switch to UUIDv7 immediately."
pubDate: 2024-03-01T12:00:00Z
tags: ["database", "postgresql", "performance"]
draft: false
---

Here's the reality: if you're using UUIDv4 as primary keys in a relational database, you are actively sabotaging your write performance.

I've watched teams build beautiful, scalable applications, only to hit a brick wall when their PostgreSQL database reaches a few million rows. The culprit? Completely random identifiers.

B-Tree indexes are the backbone of relational databases. They work best when you insert data sequentially.

When you use UUIDv4, every new identifier is completely random. This means the database can't just append the new record to the end of the index. Instead, it has to find the exact middle of the tree to squeeze the new key in.

This causes page splits. Page splits mean the database has to allocate new pages on disk, move data around, and update pointers. As your table grows, your index becomes heavily fragmented. Disk I/O spikes. Memory gets thrashing because the working set of the index no longer fits in RAM. Your inserts slow down to a crawl.

It's a mathematical certainty. You trade sequential writes for completely random I/O.

Stop using UUIDv4 for database primary keys. The fix is UUIDv7.

UUIDv7 is a time-ordered UUID. The first 48 bits represent a Unix timestamp, and the rest are random. This gives you the best of both worlds:

- It is sortable by creation time.
- It is globally unique.
- It plays incredibly well with B-Tree indexes.

Because the IDs are time-sequential, new records are appended to the right side of the index tree. Page splits drop to near zero. Your index stays compact, cache hits go up, and your insert latency stays flat even as the table scales to billions of rows.

If you're using PostgreSQL, you don't even need application-level changes to start using them. You can generate UUIDv7 directly in the database.

With Postgres 17, `uuid_generate_v7()` is built-in. For older versions, you can implement a simple function.

Here is a lean implementation using `pgcrypto` for PostgreSQL 14+:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION generate_uuid_v7()
RETURNS uuid
AS $$
DECLARE
  unix_ts_ms bytea;
  uuid_bytes bytea;
BEGIN
  unix_ts_ms := substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3);
  uuid_bytes := gen_random_bytes(10);

  -- Combine timestamp, version (7), and random bytes
  uuid_bytes := unix_ts_ms || uuid_bytes;
  uuid_bytes := set_byte(uuid_bytes, 6, (b'01110000'::bit(8) | (get_byte(uuid_bytes, 6)::bit(8) & b'00001111'::bit(8)))::integer);
  uuid_bytes := set_byte(uuid_bytes, 8, (b'10000000'::bit(8) | (get_byte(uuid_bytes, 8)::bit(8) & b'00111111'::bit(8)))::integer);

  RETURN encode(uuid_bytes, 'hex')::uuid;
END
$$ LANGUAGE plpgsql VOLATILE;

-- Usage
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT generate_uuid_v7(),
  email text NOT NULL
);
```

For Node.js backends, the `uuid` npm package supports v7 natively. Just swap the import.

```typescript
import { v7 as uuidv7 } from 'uuid';

const newId = uuidv7();
console.log(newId); // e.g., 018e9b6a-8b17-76b4-9a4f-50b284e3a35f
```

Don't let bad defaults dictate your architecture. Randomness is great for cryptographic tokens, but it's terrible for database locality. Switch to UUIDv7 today, and your database will thank you.