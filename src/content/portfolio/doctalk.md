---
title: "DocTalk — RAG Document Q&A API"
description: "Upload a PDF, ask questions in natural language, get answers grounded in the source with citations. A FastAPI RAG pipeline over pgvector with JWT auth, self-hosted on Oracle Cloud."
tech:
  [
    "FastAPI",
    "Python",
    "RAG",
    "PostgreSQL / pgvector",
    "Cloudflare AI",
    "JWT",
    "Docker",
  ]
github: "https://github.com/1Mangesh1/doctalk"
demo: ""
featured: true
date: 2026-03-28T00:00:00Z
---

**The problem.** Ask an LLM to answer from a document it "read" and it hallucinates. I wanted answers grounded in the actual text, with a citation back to where each one came from.

**The pipeline I built.** On upload, DocTalk extracts the PDF text, chunks it (~500 tokens), embeds each chunk, and stores the vectors in Postgres with pgvector. On a question, it embeds the query, runs a similarity search for the top-5 chunks, and feeds only those to the LLM — retrieval-augmented generation, so answers are grounded and citable rather than recalled from memory.

**Stack.** FastAPI (async) for the API, Cloudflare Workers AI for embeddings and generation, PyMuPDF for extraction, JWT for auth. Containerized with Docker, provisioned with Terraform, deployed via GitHub Actions onto Oracle Cloud's free ARM tier. The public instance is currently down — it ran on free-tier hardware I have since repurposed, so the repo is the honest artifact.

**Where it breaks.** Retrieval is a single similarity pass with no reranking, so a question whose answer is spread across many chunks can pull the wrong five — grounding narrows hallucination, it doesn't remove it. Chunking is fixed-size rather than structure-aware, which cuts tables and code blocks mid-thought. Extraction reads the PDF text layer, so scanned or image-only documents come back empty until I add OCR. The citations tell you which chunk an answer came from, which makes these failures visible instead of silent — that was the point of returning them.
