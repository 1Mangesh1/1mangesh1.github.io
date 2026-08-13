---
title: "Extending Keycloak for Multi-Tenant SaaS: SPIs, Tenant Policies, and One Nasty Bug"
description: "Lessons from building a Keycloak identity layer for a multi-tenant healthcare platform: custom Java SPIs, deploy-time provisioning, account lifecycle, and a required-actions bug that silently cancelled itself."
pubDate: 2026-08-13T00:00:00Z
tags: ["keycloak", "identity", "oidc", "multi-tenancy", "java"]
draft: true
---

**TL;DR:** Keycloak out of the box gets you login pages and tokens. Making it work for a multi-tenant B2B platform meant writing custom Java SPI extensions (about 30 classes across a handful of providers), automating realm configuration so nobody ever clicks through the admin console, and enforcing account state in three layers instead of one. Also: Keycloak's required actions have replace semantics in the Admin API, and that will bite you exactly once, in production.

These are learnings from building the identity layer for a multi-tenant, HIPAA-scoped healthcare platform. I'm keeping the product details out of it. Everything here is about Keycloak itself and applies to any B2B SaaS where tenants are organizations, not individual users.

It assumes you know what OIDC is and have at least poked at Keycloak. If you haven't, [the docs](https://www.keycloak.org/documentation) are decent; come back after.

## Where stock Keycloak stops

Keycloak covers the standard flows well: OIDC auth code + PKCE, token issuance, session management, themes. For a single-tenant app you can get surprisingly far with zero custom code.

Multi-tenancy breaks that. The moment your requirements say things like:

- every access token must carry the user's tenant ID, derived from server-side state, not from anything the client sends
- each tenant gets its own password policy profile
- an account suspended by a tenant admin must stop working now, not when the token expires
- every login and admin action must land in an audit store with the tenant attached

...you're writing Service Provider Interfaces (SPIs). Keycloak's SPI system is genuinely good: almost everything internal (mappers, authenticators, password policies, event listeners, required actions) is a provider you can replace or extend with a JAR dropped into `/opt/keycloak/providers`. The catch is that it's Java, the interfaces move between majors, and the documentation for anything non-trivial is "read the Keycloak source." Which, honestly, works. The source is readable.

Here's what we ended up building, and what each piece taught me.

## A tenant-id protocol mapper backed by Organizations

Keycloak 26 shipped [Organizations](https://www.keycloak.org/docs/latest/server_admin/#_managing_organizations) as a first-class concept, which maps cleanly onto B2B tenants: users belong to an organization, organizations have attributes and identity providers.

We wanted `tenant_id` as a claim in every access token, sourced from the user's organization membership and never from a client-supplied parameter. That's a custom protocol mapper:

```java
public class TenantIdMapper extends AbstractOIDCProtocolMapper
        implements OIDCAccessTokenMapper, OIDCIDTokenMapper {

    @Override
    protected void setClaim(IDToken token, ProtocolMapperModel model,
                            UserSessionModel userSession, KeycloakSession session,
                            ClientSessionContext ctx) {
        session.getProvider(OrganizationProvider.class)
                .getByMember(userSession.getUser())
                .findFirst()
                .ifPresent(org ->
                        token.getOtherClaims().put("tenant_id", org.getId()));
    }
}
```

The API side (Django/DRF in our case) validates the token signature, reads `tenant_id`, and scopes every query with it. The claim is trustworthy because the only way to change it is to change organization membership in Keycloak. There's no request parameter to tamper with.

Resolve the tenant in exactly one place, on the server that mints tokens. Every downstream service gets the claim for free, and there's one implementation to audit instead of five.

## Tenant-aware password policies

Keycloak's password policies are realm-wide. Our tenants had different compliance requirements: one org's security team wants 16-character minimums and a breach-list check, another is fine with the baseline.

The fix was a custom `PasswordPolicyProvider` with a small pluggable rule set, where the applicable profile is resolved per-tenant (via the user's organization) at validation time. The rules themselves are boring: length, character classes, reuse history. The interesting part is the shape. One provider, a registry of rules, per-tenant profiles selecting which rules apply at which thresholds. Adding a rule for a new tenant requirement is a new class and a profile entry, not a fork of the provider.

Extend Keycloak once, with a seam for variation. The second tenant-specific request is always coming.

## Provisioning: nobody clicks the admin console

Early on, realm configuration lived in people's heads and in the admin console. That's fine until you need a second environment, and then it's a disaster: console-configured realms drift, and secrets get pasted into Slack.

We replaced it with a reconcile step in the deploy pipeline: a script that talks to the Keycloak Admin REST API, declares the clients that should exist (redirect URIs, flows, mapper assignments), creates or updates them to match, rotates client secrets, and writes the secrets into AWS Secrets Manager where the services read them. It runs in-VPC as a one-shot ECS task during CI, because the Keycloak admin endpoint is not (and should not be) reachable from the public internet or a CI runner.

After that, "configure a new environment" stopped being a checklist and became a pipeline run. Nobody has a reason to touch the console outside of break-glass debugging. Treat identity-provider config like schema migrations: declarative, reconciled in CI, secrets rotated as a side effect. The console is for reading.

## Account lifecycle needs more than one layer

Suspending a user sounds like one boolean. It isn't, because "suspended" has to hold across three systems that each have their own idea of state:

1. An append-only Postgres ledger. Every suspend, deactivate, or reactivate is a row, never an update. This is the source of truth and the audit trail: you can always answer who suspended an account, when, and whether it was ever reactivated.
2. Keycloak account disable, which stops new logins and kills existing sessions.
3. Revoking the authorization relationship that grants the user access in the graph (more on that system in [the companion post](/blog/spicedb-rebac-production-lessons)), so even a token that's still technically valid can't do anything.

The operations are idempotent and compensation is forward-only: if step 2 succeeds and step 3 fails, the retry re-applies both rather than trying to roll back the ledger. Re-running a suspend on an already-suspended account is a no-op at every layer.

A state change that spans systems needs idempotency and a durable record more than it needs distributed-transaction cleverness. An append-only ledger plus retry-until-converged got us everything a saga framework would have, with none of the machinery.

## Audit events: a custom event listener

HIPAA audit requirements meant every authentication event and every admin action needed to end up somewhere queryable, with the tenant attached. Keycloak's event system emits both user events (login, logout, reset) and admin events (user created, role changed), and the `EventListenerProvider` SPI lets you hook them.

We wrote a listener that resolves the tenant for each event and streams them to ClickHouse, which feeds the audit dashboards. For user events the tenant comes from the organization. Admin events don't carry a user session, so resolution there falls back to the resource path, per event type, and it's exactly as fiddly as that sounds. ClickHouse because audit queries are "all events for tenant X in date range Y" over an append-only stream, which is a columnar store's home game.

Resolve the tenant at write time, in the listener. Join it on at query time and your audit store needs live access to your identity store, which gives your compliance dashboard a runtime dependency on Keycloak. It shouldn't have one.

## The bug: required actions that cancel each other

The best learning came from a production defect.

Keycloak models "things a user must do before proceeding" as required actions on the user: `UPDATE_PASSWORD`, `CONFIGURE_TOTP`, and so on, plus any custom ones you register. Our credential-setup flow used custom required actions to walk new users through a multi-step setup.

The bug report: some users who went through two credential resets in sequence ended up in a broken state. The second reset appeared to work, but a step from the first silently never happened.

Root cause: parts of the flow set required actions through the Admin API's user representation, and `PUT /admin/realms/{realm}/users/{id}` replaces the `requiredActions` list wholesale. Reset A puts `[UPDATE_PASSWORD, VERIFY_EMAIL]` on the user. Reset B, built from a stale read, writes `[UPDATE_PASSWORD]`. The `VERIFY_EMAIL` from reset A is gone. Nothing errors, nothing logs; the action just never fires. Sequential resets weren't merging, they were overwriting each other.

The fix is almost embarrassing: use the additive path (`user.addRequiredAction(...)` in SPI code, or read-merge-write if you must go through the REST representation) and never write the full list from a value you read earlier. Finding it was the hard part. The symptom, a user who never got asked to verify their email, was three steps removed from the cause, a different reset flow doing a PUT.

Know which of your writes are set semantics and which are merge semantics, especially for list-valued fields. A replace-semantics write built from a stale read is a lost-update bug wearing a trench coat.

## What I'd tell you before you start

Budget for the SPI layer. If your requirements say "multi-tenant" and "compliance," you will write Java. Ours came to roughly 30 classes across mappers, policies, authenticators, required actions, and event listeners, all unit-tested, because Keycloak upgrades move interfaces under you and the tests tell you where.

The Keycloak source beats the docs for anything past the basics. Clone it, grep it.

Back-channel logout and session revocation are not optional in B2B. Tenant admins expect "remove this user" to mean now. Wire it up early; retrofitting revocation into flows that assumed token expiry was enough is miserable.

The identity layer is only half the story. Authenticating a user tells you who they are, not what they can touch. The other half, fine-grained authorization with SpiceDB, got its own post: [ReBAC in Production: SpiceDB, Django, and the Consistency Problem](/blog/spicedb-rebac-production-lessons).

Questions or war stories of your own? DM me on [X](https://x.com/Mangesh_Bide) or mail [hello@mangeshbide.tech](mailto:hello@mangeshbide.tech).
