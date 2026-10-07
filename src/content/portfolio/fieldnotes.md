---
title: "Fieldnotes"
description: "An LLM pipeline that scores a job posting against your resume and returns an APPLY, CONSIDER, or SKIP verdict with evidence. It ships both a deterministic DAG and an agentic flow (planner, then executor, then synthesizer) over the same steps."
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
status: "live"
---

**The problem.** Deciding whether a job is worth applying to means reading the posting and researching the company. It also means comparing the posting against your resume and being honest about the gaps. That is a repeatable pipeline, not a gut call. Fieldnotes was previously called Job Researcher.

**What it does.** It fetches and parses the JD, researches the company (Gemini with Google Search grounding), and scans the hiring org's GitHub. It scores resume-vs-JD similarity with embeddings, then synthesizes a verdict: match score, strengths, gaps, and an APPLY, CONSIDER, or SKIP recommendation. It can also tailor the resume to a specific posting and return a PDF.

**Two flows, one step library.** I built `POST /analyze` as a deterministic DAG: five sequential steps, predictable and debuggable. I also built `POST /analyze/agent`, which hands the same steps to a planner LLM that decides tool order at runtime. It returns the verdict plus its plan and a per-step trace. The flows share the same building blocks but use two execution models. This is a concrete look at where a fixed pipeline ends and an agent earns its keep.
