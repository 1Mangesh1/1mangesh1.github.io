---
title: "HealthTrack API - HIPAA-Compliant Health Data Platform"
description: "A secure REST API for managing patient health records with HIPAA compliance, audit logging, and role-based access"
image: "/images/portfolio/healthtrack.jpg"
tech: ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "OAuth2"]
github: "https://github.com/1Mangesh1/healthtrack-api"
featured: false
date: 2025-09-20T00:00:00Z
---

## Motivation

Healthcare applications face a unique set of engineering constraints. Every API endpoint that touches patient data must satisfy HIPAA's Security Rule — encryption, access controls, audit trails, and breach notification capabilities. Most healthcare startups either build these compliance layers ad-hoc (and miss critical requirements) or buy expensive enterprise platforms.

HealthTrack API is an open-source, HIPAA-compliant foundation for health data applications. It provides the security primitives, audit infrastructure, and access control patterns so developers can focus on building features rather than re-implementing compliance.

## Architecture

HealthTrack is a Python FastAPI application designed around three security layers:

**Transport Security** — All communication is encrypted via TLS 1.3. The API enforces HTTPS-only with HSTS headers. Internal service communication uses mutual TLS (mTLS) with auto-rotating certificates managed by a lightweight PKI built on step-ca.

**Data Security** — Patient health information (PHI) is encrypted at rest using AES-256-GCM with envelope encryption. Each patient record has a unique data encryption key (DEK), and DEKs are encrypted by a key encryption key (KEK) stored in a separate secrets manager. This limits the blast radius of a key compromise — a leaked DEK exposes only one patient's data, not the entire database.

**Access Security** — Role-based access control (RBAC) with four predefined roles: Admin, Provider, Nurse, and Patient. Each role has granular permissions mapped to API endpoints and data fields. A Provider can view full patient records, while a Patient can only access their own data. Field-level access control hides sensitive fields (SSN, insurance details) from roles that don't need them.

## HIPAA Compliance Measures

### Audit Logging

Every API request that accesses or modifies PHI generates an immutable audit log entry containing:
- **Who**: Authenticated user ID and role
- **What**: Action performed (read, create, update, delete) and affected resource
- **When**: Timestamp with millisecond precision
- **Where**: Client IP, user agent, and request origin
- **Outcome**: Success or failure with error details

Audit logs are stored in a separate, append-only PostgreSQL table with row-level security preventing modification. Logs are also streamed to an external SIEM-compatible endpoint for independent retention.

### Breach Detection

The API includes anomaly detection for potential unauthorized access:
- Unusual access patterns (a user accessing significantly more records than normal)
- Off-hours access attempts from unexpected IP ranges
- Repeated failed authentication attempts
- Bulk data export requests

Alerts are routed to designated security officers with configurable escalation policies.

### Data Retention

Patient records follow configurable retention policies. When a record reaches its retention limit, it enters a soft-delete phase (accessible only to Admin role for 30 days) before being permanently purged with cryptographic erasure — the record's DEK is destroyed, rendering the encrypted data unrecoverable.

## API Design

The REST API follows resource-oriented design with consistent patterns:

```
POST   /api/v1/patients              # Create patient record
GET    /api/v1/patients/:id          # Get patient by ID
PATCH  /api/v1/patients/:id          # Update patient record
DELETE /api/v1/patients/:id          # Soft-delete patient

GET    /api/v1/patients/:id/records  # Get health records
POST   /api/v1/patients/:id/records  # Add health record

GET    /api/v1/audit/logs            # Query audit logs (Admin only)
GET    /api/v1/audit/logs/:userId    # Logs for specific user
```

All responses follow a standard envelope format with pagination, and error responses include machine-readable error codes mapped to HIPAA-relevant categories.

## Key Features

- **Envelope Encryption**: Per-record encryption keys with automatic key rotation
- **RBAC with Field-Level Access**: Fine-grained permissions down to individual data fields
- **Immutable Audit Trail**: Complete access history for compliance audits and breach investigations
- **OAuth2 + MFA**: Secure authentication with mandatory multi-factor for PHI access
- **Rate Limiting**: Per-user and per-role rate limits to prevent data scraping
- **Data Export**: FHIR-compatible data export for interoperability with other health systems
- **Automated Compliance Reports**: Generate HIPAA Security Rule compliance reports on demand

## Technical Decisions

**FastAPI over Django** — FastAPI's async-first design, automatic OpenAPI documentation, and Pydantic validation made it ideal for a high-performance API with strict schema requirements. Django's ORM and admin panel weren't needed since the data layer required custom encryption handling.

**PostgreSQL with Row-Level Security** — RLS policies enforce access control at the database level as a defense-in-depth measure. Even if the application layer is compromised, the database won't return records the authenticated role shouldn't access.

**Redis for Session and Rate Limiting** — Session tokens and rate limit counters live in Redis with configurable TTLs. Redis's atomic operations ensure accurate rate limiting even under concurrent request load.
