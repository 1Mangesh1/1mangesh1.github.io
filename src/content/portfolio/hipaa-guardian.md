---
title: "HIPAA Guardian"
description: "PHI/PII detection engine that scans code, logs, and API responses for the 18 HIPAA Safe Harbor identifiers — built to catch leaks in developer artifacts before they ship."
tech:
  [
    "Python",
    "HIPAA / PHI",
    "Static Analysis",
    "CI/CD",
    "AI Agent Skill",
  ]
github: "https://github.com/1Mangesh1/hipaa-guardian"
demo: ""
featured: true
date: 2026-06-23T00:00:00Z
---

**The problem I kept hitting.** In healthcare software, PHI rarely leaks through the front door. It leaks through developer artifacts — a seed script with real patient rows, a debug log that prints an SSN, a test fixture copied from production, an endpoint that returns a full `Patient` resource with no auth check. None of it shows up in a compliance checklist.

**What I built.** A detection engine that scans source, data files, logs, and API responses for all 18 HIPAA Safe Harbor identifiers, scores each finding's confidence (0–100%), maps it to the relevant HIPAA rule, and writes an audit report a reviewer can act on. I kept it plain Python with no runtime dependencies, so it drops into a pre-commit hook or a CI job as easily as it runs on demand — and I ship it as a skill for Claude and other AI coding agents, so "scan this for PHI" is a single instruction.

**Getting precision right.** SSNs in federally never-issued ranges, documentation phone numbers (`555-01xx`), `example.com` emails, and private/loopback IPs are excluded by default to keep the false-positive rate low on real codebases.

**Honest scope.** This is detection and triage, not certification — it catches the obvious and semi-obvious fast, and distinguishes a likely SSN from a phone number that merely looks like one. A clean scan means "nothing obvious found," not "safe to ship."
