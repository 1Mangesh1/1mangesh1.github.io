---
title: "Real-Time Voice Agent"
description: "Browser-based voice agent (Tavus CVI) backed by a FastAPI service that runs seven tool-calling booking functions, persists transcripts, and writes an LLM call summary."
tech:
  [
    "FastAPI",
    "Python",
    "Tavus CVI",
    "Supabase / Postgres",
    "Gemini",
    "Next.js",
    "Tool Calling",
  ]
github: "https://github.com/1Mangesh1/voice-agent-demo-backend"
demo: "https://voice-agent-demo-frontend.vercel.app"
featured: true
date: 2026-05-12T00:00:00Z
---

**The problem.** A voice agent that can actually *do* things — book, retrieve, modify, cancel an appointment mid-conversation — needs the LLM's tool calls to reach real services and come back fast enough to keep the conversation natural.

**What I built.** The browser holds the call; Tavus CVI runs voice and a talking-head replica. When the model emits a `tool_call`, Tavus broadcasts it as a Daily app-message; the Next.js frontend dispatches it to a FastAPI backend I wrote, which runs one of seven booking tools against Supabase Postgres and replies via `conversation.respond`. At the end of the call, the service writes a Gemini summary of the transcript.

**The decision that mattered.** I split tool execution across the frontend (dispatch) and backend (business logic) to keep the round-trip inside the same Daily session instead of bolting on a separate signaling path — so the agent stays responsive while still talking to a real database.

**Shipped, with the rough edge stated.** The live frontend runs against the deployed backend. Tavus's free tier caps conversation-minutes, so a recorded walkthrough covers the full happy path when a live session is rate-limited.
