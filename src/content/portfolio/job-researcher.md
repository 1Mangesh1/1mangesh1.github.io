---
title: "Job Researcher"
description: "LLM pipeline that scores a job posting against your resume and returns an APPLY / CONSIDER / SKIP verdict with evidence — shipping both a deterministic DAG and an agentic planner→executor→synthesizer flow over the same steps."
tech:
  [
    "FastAPI",
    "Python",
    "Gemini",
    "Agentic Workflow",
    "Embeddings",
    "RAG",
  ]
github: "https://github.com/1Mangesh1/job-researcher"
demo: "https://fieldnotes.mangeshbide.tech"
featured: true
date: 2026-05-12T00:00:00Z
---

**The problem.** Deciding whether a job is worth applying to means reading the posting, researching the company, comparing it against your resume, and being honest about the gaps. That's a repeatable pipeline, not a gut call.

**What it does.** It fetches and parses the JD, researches the company (Gemini with Google Search grounding), scans the hiring org's GitHub, scores resume-vs-JD similarity with embeddings, then synthesizes a verdict — match score, strengths, gaps, and an APPLY / CONSIDER / SKIP recommendation. It can also tailor the resume to a specific posting and return a PDF.

**Two flows, one step library.** I built `POST /analyze` as a deterministic DAG — five sequential steps, predictable and debuggable — and `POST /analyze/agent`, which hands the same steps to a planner LLM that decides tool order at runtime and returns the verdict plus its plan and a per-step trace. Same building blocks, two execution models — a concrete look at where a fixed pipeline ends and an agent earns its keep.
