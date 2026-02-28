---
title: "From Monolith to Modular: Migrating a Legacy Codebase"
description: "A battle-tested strategy for incrementally modernizing legacy applications without rewriting from scratch"
pubDate: 2026-02-18T00:00:00Z
tags: ["architecture", "migration", "refactoring", "legacy-code"]
draft: true
---

"Let's just rewrite it from scratch." If you've worked on any legacy codebase long enough, you've heard (or said) these words. And almost every time, it's the wrong answer. Rewrites take longer than expected, introduce new bugs, and often fail to ship. Instead, let's talk about how to **incrementally modernize** a monolith — safely, measurably, and without stopping feature development.

## The Strangler Fig Pattern

Named after the strangler fig tree that gradually envelops its host, this pattern lets you replace a legacy system piece by piece. New functionality goes into a new system, old functionality is migrated over time, and the legacy system shrinks until it can be decommissioned.

```
┌─────────────────────────────────────────────┐
│                  Load Balancer / API Gateway │
│                                             │
│    ┌──────────┐    ┌────────────────────┐   │
│    │ New      │    │ Legacy Monolith    │   │
│    │ Modules  │    │                    │   │
│    │          │◄───┤ (shrinking over    │   │
│    │ Auth ✓   │    │  time)             │   │
│    │ Users ✓  │    │                    │   │
│    │ Orders   │    │ Payments           │   │
│    │ (in prog)│    │ Reporting          │   │
│    └──────────┘    │ Legacy Orders      │   │
│                    └────────────────────┘   │
└─────────────────────────────────────────────┘
```

The key insight: you route traffic at the edge. The API gateway decides whether a request goes to the new or legacy system, allowing gradual migration.

## Step 1: Identify Module Boundaries

Before extracting anything, you need to understand the monolith's actual structure — not what the architecture diagram says, but how the code truly behaves.

```javascript
// Typical monolith: everything coupled to everything
class OrderService {
  createOrder(userId, items) {
    // Directly queries user table
    const user = db.query("SELECT * FROM users WHERE id = ?", [userId]);

    // Directly calculates tax
    const tax = this.calculateTax(items, user.state);

    // Directly processes payment
    const payment = stripe.charge(user.paymentMethod, total);

    // Directly sends email
    emailService.send(user.email, "Order Confirmed", template);

    // Directly updates inventory
    items.forEach((item) => {
      db.query("UPDATE inventory SET stock = stock - ? WHERE id = ?", [
        item.qty,
        item.id,
      ]);
    });

    return db.query("INSERT INTO orders ...");
  }
}
```

This single method touches users, payments, email, inventory, and tax calculation. To extract the Orders module, you first need to untangle these dependencies.

**Techniques for finding boundaries:**

- Analyze database table access patterns per feature
- Map out which code paths each API endpoint touches
- Look for natural domain boundaries (users, orders, payments, inventory)
- Use static analysis tools to generate dependency graphs

## Step 2: Create Anti-Corruption Layers

An anti-corruption layer (ACL) translates between the old and new systems, preventing legacy concepts from leaking into your clean new code.

```typescript
// Anti-corruption layer: translates legacy data to new domain model
class UserACL {
  private legacyDb: LegacyDatabase;
  private newUserService: UserService;

  async getUser(id: string): Promise<User> {
    // Try new system first
    const newUser = await this.newUserService.findById(id);
    if (newUser) return newUser;

    // Fall back to legacy system
    const legacyUser = await this.legacyDb.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    // Translate legacy format to new domain model
    return this.translateUser(legacyUser);
  }

  private translateUser(legacy: LegacyUserRow): User {
    return {
      id: legacy.user_id,
      email: legacy.email_addr, // Different column name in legacy
      name: `${legacy.first_name} ${legacy.last_name}`, // Combined in new model
      address: this.parseAddress(legacy.address_blob), // JSON blob in legacy
      createdAt: new Date(legacy.created_timestamp * 1000), // Unix timestamp in legacy
    };
  }
}
```

The ACL ensures your new modules have a clean domain model, even while the messy legacy data still exists underneath.

## Step 3: Database Decomposition

This is often the hardest part. The monolith's database is typically a single schema with foreign keys everywhere. You can't just rip tables out.

### Strategy: Dual Writes → Sync → Switch

```typescript
// Phase 1: Dual write to both databases
class OrderRepository {
  async create(order: Order): Promise<void> {
    // Write to legacy DB (source of truth)
    await this.legacyDb.insertOrder(order);

    // Also write to new DB (building up data)
    try {
      await this.newDb.insertOrder(order);
    } catch (err) {
      // Log but don't fail — legacy is still source of truth
      logger.warn("Failed to write to new DB", { err, orderId: order.id });
    }
  }
}

// Phase 2: Read from new, write to both
// Phase 3: Write to new (source of truth), sync back to legacy
// Phase 4: Remove legacy writes entirely
```

Each phase should run for weeks in production with monitoring before advancing to the next. Rushing this is how you lose data.

### Alternative: Change Data Capture (CDC)

Tools like **Debezium** can stream changes from your legacy database to the new one in real-time, avoiding dual-write complexity:

```
Legacy DB → Debezium → Kafka → New Service Consumer → New DB
```

## Step 4: Feature Flags for Gradual Rollout

Feature flags are your safety net. They let you roll out the new system to a percentage of users and instantly roll back if something goes wrong.

```typescript
// Feature flag controlling which system handles orders
async function handleCreateOrder(req: Request): Promise<Response> {
  const userId = req.auth.userId;

  if (await featureFlags.isEnabled("new-order-system", { userId })) {
    // Route to new modular system
    return newOrderService.create(req.body);
  } else {
    // Route to legacy monolith
    return legacyProxy.forward("/api/orders", req);
  }
}
```

A typical rollout plan:
1. **0%** — Deploy new system, run shadow traffic for comparison
2. **1%** — Internal team only
3. **5%** — Small percentage of real users
4. **25%** → **50%** → **75%** — Gradual increase with monitoring
5. **100%** — Full cutover, legacy code scheduled for removal

## Step 5: Testing Strategies During Migration

You need multiple layers of testing when two systems coexist:

### Contract Tests

Ensure the new system returns the same responses as the legacy system:

```typescript
describe("Order API Contract", () => {
  it("should return identical responses from both systems", async () => {
    const testOrder = createTestOrder();

    const legacyResponse = await legacyApi.createOrder(testOrder);
    const newResponse = await newApi.createOrder(testOrder);

    // Compare responses, ignoring non-deterministic fields
    expect(normalize(newResponse)).toEqual(normalize(legacyResponse));
  });
});

function normalize(response: OrderResponse): Partial<OrderResponse> {
  const { id, createdAt, ...rest } = response;
  return rest; // Strip generated fields for comparison
}
```

### Shadow Traffic Testing

Run production traffic through both systems simultaneously and compare results without affecting users:

```typescript
async function shadowTest(req: Request): Promise<Response> {
  // Always return legacy response to the user
  const legacyResponse = await legacySystem.handle(req);

  // Fire-and-forget to new system for comparison
  newSystem
    .handle(req)
    .then((newResponse) => {
      if (!deepEqual(legacyResponse.body, newResponse.body)) {
        metrics.increment("shadow.mismatch");
        logger.warn("Shadow mismatch", {
          endpoint: req.path,
          legacy: legacyResponse.body,
          new: newResponse.body,
        });
      }
    })
    .catch((err) => {
      metrics.increment("shadow.error");
    });

  return legacyResponse;
}
```

## Measuring Progress

Define clear metrics so you know you're actually making progress:

- **Percentage of traffic served by new system** — your north star metric
- **Legacy code line count over time** — should trend downward
- **Deployment frequency** — should increase as modules become independent
- **Incident rate** — should not increase during migration
- **Legacy API call count** — track inter-system dependencies decreasing

Create a dashboard that the whole team can see. Nothing motivates a migration like watching the legacy percentage shrink week after week.

## Common Pitfalls

**Pitfall 1: "Just one more feature in the monolith."** Every feature added to the legacy system is debt. Establish a hard rule: all new features go in the new system, even if it requires building interfaces to the legacy system first.

**Pitfall 2: Migrating too many modules at once.** Extract one module, stabilize it in production, then move to the next. Parallel extraction sounds faster but creates too many moving parts.

**Pitfall 3: Ignoring data migration.** Code migration without data migration is incomplete. Your new system needs historical data to be useful, and migrating years of data is always harder than expected.

**Pitfall 4: No rollback plan.** Every deployment during a migration should be instantly reversible. If you can't roll back a change in under 5 minutes, you're taking too much risk.

**Pitfall 5: Losing institutional knowledge.** The monolith has years of bug fixes and edge-case handling baked in. Before removing legacy code, understand *why* it exists. That weird conditional from 2019 might be handling a real business rule.

## Timeline Expectations

A realistic timeline for a medium-sized monolith (100k-500k LOC):

- **Month 1-2**: Analysis, boundary identification, tooling setup
- **Month 3-4**: First module extracted and running in production
- **Month 5-12**: Steady extraction of remaining modules
- **Month 12-18**: Legacy system fully decommissioned

This isn't a sprint — it's a marathon. But done right, you'll end up with a system that's easier to maintain, faster to deploy, and built to last.

The most important thing? **Keep shipping features the entire time.** A migration that blocks product development for months will lose organizational support. Show that you can modernize the architecture *and* deliver business value simultaneously.
