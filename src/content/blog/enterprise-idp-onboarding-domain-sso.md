---
title: "Onboarding an enterprise tenant's IdP: domain-based SSO end to end"
description: "TODO(mangesh): one-sentence description for search results and the RSS feed"
pubDate: 2026-10-01T00:00:00Z
tags: ["auth", "keycloak", "multi-tenancy"]
draft: true
---

## Why tenants needed their own IdP

TODO(mangesh): the customer requirement that started this, and how many tenants needed it.

## The flow, end to end

TODO(mangesh): sequence diagram from email entry to domain lookup, IdP redirect, Keycloak broker and app session.

## Mapping a domain to a tenant's IdP

TODO(mangesh): where the domain-to-IdP mapping lives (Keycloak Organizations domains or your own table) and why.

## Onboarding a new enterprise IdP

TODO(mangesh): the onboarding checklist: metadata exchange, OIDC or SAML, claim mapping, test tenant.

## Verifying domain ownership

TODO(mangesh): how domain ownership is verified before users get routed, if it is.

## Edge cases

TODO(mangesh): shared consumer domains, users in more than one tenant, IdP outages, existing password users.

## What I'd do differently

TODO(mangesh): the decision you would reverse, and the incident or number that taught you.
