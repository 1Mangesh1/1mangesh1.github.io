---
title: "Mira"
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
status: "live"
post: "building-mira-voice-agent"
---

**The problem.** When a voice agent can actually *do* things (book, retrieve, modify, cancel an appointment mid-conversation), the LLM's tool calls must reach real services. They must also come back fast enough to keep the conversation natural.

**What I built.** The browser holds the call. Tavus CVI runs voice and a talking-head replica. When the model emits a `tool_call`, Tavus broadcasts it as a Daily app-message. The Next.js frontend dispatches it to a FastAPI backend that I wrote. The backend runs one of seven booking tools against Supabase Postgres and replies via `conversation.respond`. At the end of the call, the service writes a Gemini summary of the transcript.

**The decision that mattered.** I split tool execution across the frontend (dispatch) and backend (business logic). I did this to keep the round-trip inside the same Daily session instead of bolting on a separate signaling path. So the agent stays responsive while still talking to a real database.

**Shipped, with the rough edge stated.** The live frontend runs against the deployed backend. Tavus's free tier caps conversation-minutes, so a recorded walkthrough covers the full happy path when a live session is rate-limited.
