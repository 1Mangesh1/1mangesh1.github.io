---
title: "ReBAC in Production: SpiceDB, Django, and the Consistency Problem"
description: "What I learned shipping relationship-based access control on SpiceDB for a multi-tenant healthcare platform: schema design, Django integration, the transactional outbox, and rolling it out in shadow mode."
pubDate: 2026-08-13T00:00:00Z
tags: ["spicedb", "authorization", "rebac", "django", "multi-tenancy"]
draft: true
---

**TL;DR:** Role checks stop scaling the moment your access rules depend on relationships: "reviewers see the cases assigned to their board," not "reviewers see cases." We moved a multi-tenant healthcare platform to relationship-based access control (ReBAC) on [SpiceDB](https://authzed.com/spicedb): 16 object types, 45 permissions, wired into Django. The modeling was the fun part. The real work was keeping the authorization graph consistent with the database (transactional outbox, ZedToken caching, a reconcile job) and rolling it out behind a shadow-mode flag so we could watch it disagree with the old code before letting it enforce anything.

This is the companion to [my Keycloak post](/blog/keycloak-custom-spi-multi-tenant-lessons). That one covers who you are; this one covers what you can touch. It assumes you know Django/DRF and have heard of Google's [Zanzibar paper](https://research.google/pubs/pub48190/). No employer specifics here, just the learnings.

## Why roles weren't enough

The platform's access rules read like this: an organization runs programs, programs have review boards, boards get patients and cases assigned, cases carry clinical documents. A reviewer sees a document if they sit on the board the case is assigned to. An org admin sees everything in their org. A program coordinator sees their program, not their neighbor's.

Try encoding that in `if user.role == "reviewer"` and you end up re-deriving the object graph in every view, badly, forever. The permission isn't a property of the user. It's a path through the graph from the user to the object. That's the model Zanzibar formalized and SpiceDB implements: store relationships (`case:123 assigned_board board:7`), define permissions as graph traversals, and answer every access question with a single `Check(user, permission, object)` call.

## Modeling: the schema is the easy 20%

The deployed schema ended up at 16 object types and 45 permissions. A flavor of it (simplified, not our actual schema):

```zed
definition user {}

definition organization {
    relation admin: user
    relation member: user
    permission administer = admin
}

definition program {
    relation org: organization
    relation coordinator: user
    permission manage = coordinator + org->administer
}

definition review_board {
    relation program: program
    relation reviewer: user
    permission view_cases = reviewer + program->manage
}

definition clinical_document {
    relation case_board: review_board
    permission view = case_board->view_cases
}
```

The arrow (`org->administer`) is what makes ReBAC compose: `clinical_document` doesn't know what an org admin is, it delegates upward. Adding "org admins can see all documents" touched zero document-level code.

The learning that mattered most: write the truth table before the schema. We built a spreadsheet-shaped spec, every (role, object type, verb) cell filled with allow or deny, reviewed it with the people who owned the product rules, and then validated the schema against it offline with SpiceDB's [assertions and validation tooling](https://authzed.com/docs/spicedb/modeling/validation-testing-debugging) before anything ran in an environment. The truth table was the executable spec; the schema was an implementation of it. Every later "wait, should coordinators see X?" argument got settled by pointing at a cell.

## Django integration: one seam, not fifty call sites

The failure mode with an external authorizer is `client.check(...)` calls sprinkled through every view, each slightly different. We forced everything through one seam.

A DRF permission class resolves the verb for the endpoint and calls `CheckPermission`. Protected endpoints declare it; nothing else changes.

List endpoints need more than a yes or no. A `Check` answers "can they see this one," but a list view needs "which ones can they see." That's SpiceDB's `LookupResources`: fetch the accessible IDs, filter the queryset. Watch it at scale, since huge result sets eventually want pagination-aware strategies, but it carried us much further than I expected.

Every verb the application uses, all 45 of them, lives in one registry module. Views reference registry entries, never string literals. The registry earns its keep in CI: a test loads the deployed schema, extracts the defined permissions, and diffs them against the registry. If application code references a verb the schema doesn't define, or someone edits the schema without updating the app, the build fails. Drift between what the app asks and what the graph can answer produces quiet false-denies in production; making it a build failure was the single highest-leverage test in the whole project.

## The hard part: two databases, one truth

Here's the thing nobody tells you up front: adopting SpiceDB means you now run two stateful systems that must agree. Postgres holds your domain rows; SpiceDB holds the relationships derived from them. Every write that changes access ("assign case to board") has to land in both, and there is no cross-system transaction. This is where most of the engineering went.

### Transactional outbox + drain worker

Writing to SpiceDB inline with the Django transaction is wrong twice: if SpiceDB is slow, your request is slow; if the Django transaction rolls back after the SpiceDB write, the graph now grants access to a row that doesn't exist.

The standard fix is the [transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html), and it fit cleanly:

```python
class RelationshipOutbox(models.Model):
    operation = models.CharField(choices=[("TOUCH", "TOUCH"), ("DELETE", "DELETE")])
    resource = models.CharField(max_length=255)   # "review_board:7#reviewer"
    subject = models.CharField(max_length=255)    # "user:42"
    status = models.CharField(default="PENDING")
    attempts = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
```

The relationship write is a row inserted in the same Postgres transaction as the domain change, so it commits or rolls back with it. An async drain worker claims pending rows (`SELECT ... FOR UPDATE SKIP LOCKED`), applies them to SpiceDB via `WriteRelationships`, marks them done, and retries failures with backoff.

Two refinements proved essential. First, poison-pill quarantine. A row SpiceDB permanently rejects (malformed reference, an object type removed in a schema change) must not block the queue retrying forever. After N failed attempts it moves to a quarantined status and alerts a human, and the drain moves on. Without this, one bad row eventually stalls every authorization update behind it.

Second, ordering. The outbox is ordered per resource, not globally. A `DELETE` racing ahead of the `TOUCH` it was meant to undo re-grants access. `TOUCH` semantics (idempotent upsert) absorb most of the risk, but ordering within a resource still matters for grant/revoke pairs.

### ZedTokens: read-after-write without lying

The outbox makes graph updates eventually consistent, which is fine until a user assigns a reviewer and their next request, 200ms later, checks a graph that hasn't drained yet. The answer is ZedTokens, SpiceDB's consistency cursors. Every write returns one; a check can demand `at_least_as_fresh` as a given token.

We cache the latest ZedToken per (user, resource) after writes, and subsequent checks that touch those resources pass it. The user who made the change sees it immediately; everyone else gets the much faster, eventually-consistent answer. That's the right trade, because your own write is the only one whose staleness you can actually perceive.

"New Enemy," the Zanzibar paper's name for stale-permission-check bugs, is not a theoretical concern. Decide your consistency level per call site, deliberately, and default to minimizing latency everywhere the fresh answer isn't user-perceivable.

### Watch and reconcile: trust, but verify

Two more pieces closed the loop. A Watch API consumer tails SpiceDB's relationship change stream, which handles cache invalidation and change-driven side effects without polling. And a reconcile job periodically walks the domain database, computes the relationships that should exist, diffs against the graph, and repairs. Drift shouldn't happen. The reconcile job is how you know it isn't, and the repair path for when a quarantined outbox row or an operational mistake proves that "shouldn't" was doing a lot of work.

The pattern generalizes: outbox for the fast path, reconcile for the guarantee. Build only the fast path and you have a system that's consistent until the first incident, with no way to measure when it stopped.

## Rollout: shadow mode or nothing

You do not cut authorization over in one deploy. A false-allow is a data leak; a false-deny locks a clinician out of a chart. Both are unacceptable, and no test suite fully de-risks a rules rewrite.

So the new path shipped dark. Behind a flag, every request evaluated both the incumbent authorization code and the SpiceDB check. The incumbent's answer was enforced; SpiceDB's answer was logged, and disagreements were triaged.

The disagreement log was the payoff. Every mismatch was one of three things: a bug in the new model (fix the schema), a bug in the old code (several long-standing over-grants surfaced this way), or an intentional tightening (document it). Only when disagreements hit zero and stayed there did enforcement flip, gradually, with the flag as an instant rollback. It ran in production on AWS ECS from the first shadow deploy, so the numbers reflected real traffic, not a staging approximation.

Shadow mode converts "we believe the new model is right" into "we watched it agree with reality for weeks, and here's the log." For authorization, that's the only standard of evidence worth accepting.

## Defense in depth: the graph is not your only wall

Last learning, maybe the most important. SpiceDB guards the API surface, but the API surface is not every path to the data. Admin consoles, background jobs, and raw SQL in a maintenance script never pass through a DRF permission class.

So tenancy is enforced twice, independently. The SpiceDB graph answers fine-grained questions at the API layer. A tenant-scoped column on the tables themselves, applied at the query level, guards every path, including the ones the graph never sees.

The two layers don't share an implementation or a failure mode. A schema bug in the graph can't leak rows across tenants, because the column scope still holds; a scoping bug in a query can't grant object-level access, because the graph check still runs. Either bug alone is an incident; it takes both at once to leak data across tenants. That multiplication of failure probabilities is the point. In a healthcare context this isn't belt-and-suspenders paranoia, it's the design.

## Would I do it again?

Yes, for this shape of problem. The honest ledger: it costs an extra stateful service to operate, the outbox and reconcile machinery (a few weeks of careful work, not a weekend), a real learning curve for every engineer who now has to think in graph traversals, and consistency decisions that used to be free becoming explicit choices.

What it bought: authorization rules in one reviewed, validated schema instead of scattered view code. New access rules as schema changes instead of application rewrites. List filtering and permission checks answered by the same model, so they can't disagree. And an audit-friendly answer to "why can this user see this document," because the graph path is the explanation.

If your rules are genuinely flat, three roles and no delegation, you don't need this. Postgres and a `role` column are fine, and simpler is better. But the moment your product people start drawing arrows between boxes to explain who sees what, they're describing a relationship graph. At that point you can either model it honestly or re-implement it accidentally, one view at a time.

Questions, or running Zanzibar-style authz yourself? DM me on [X](https://x.com/Mangesh_Bide) or mail [hello@mangeshbide.tech](mailto:hello@mangeshbide.tech).
