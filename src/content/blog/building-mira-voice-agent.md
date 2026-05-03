---
title: "Building Mira: a voice front-desk in 48 hours"
description: "A weekend rabbit hole. Switching mid-build from LiveKit + Deepgram + Cartesia to Tavus CVI, the seven booking tools, and the bugs that taught me the system."
pubDate: 2026-05-03T00:00:00Z
tags: ["voice-ai", "tavus", "fastapi", "next.js", "engineering"]
draft: false
---

Spent a weekend on a question I'd been sitting on for a while: how hard is it actually to ship a voice AI front-desk for a clinic? Not a demo, a thing that books appointments, handles edge cases, and doesn't sound stupid. I gave myself 48 hours and a list: voice in, voice out, a talking avatar, seven booking tools, a post-call summary, a clean UI.

Default stack everyone reaches for is LiveKit Agents for transport, Deepgram for STT, Cartesia for TTS, Tavus for the avatar, an LLM for the brain.

I built that stack. Then I threw most of it away.

Both repos are public and the live URL is at the bottom if you want to poke at it.

## The first 12 hours: building the obvious stack

I started where most tutorials point. A `LiveKit Agents` Python worker handled the call lifecycle. Deepgram nova-3 did STT with server-side endpointing (because Silero VAD couldn't keep up on Render's free 0.1-CPU dyno, and that lesson cost me an evening). Cartesia did TTS with the `sonic-english` model. Gemini 2.5 Flash was the LLM. The "talking avatar" requirement got an amplitude-driven SVG portrait. A Web Audio AnalyserNode read RMS from the agent's audio track and mapped it to a mouth aperture on an SVG ellipse. Not phoneme-perfect, but it read as "talking" without needing a paid avatar service.

It worked. End-to-end. Deployed to Render's free tier with a single web process running both the LiveKit worker and the FastAPI summary endpoint (free tier doesn't include background workers, so collapsing both into one process via a `start.sh` was the only way). Supabase Postgres for state. The whole thing.

Then I looked at it and thought: this is four vendors doing one job.

## The pivot

Tavus CVI (Conversational Video Interface) collapses STT, LLM, TTS, and a real talking head into a single integration. You POST `/v2/conversations` with a persona ID and a replica ID, and you get back a `conversation_url` that's a Daily.co room. Your browser joins the room, the replica joins a few seconds later, and they talk.

Felt uncomfortable. Like I was cheating. But what I actually wanted was voice in/out, tool calling, a database, and a smooth conversation. Not a specific list of vendors. Picking the simpler integration was the honest answer.

So I switched. Git history walks through it: `c41b3d1 switch to tavus`. About eight hours of work disappeared into a single commit, and the codebase shrank by half.

What I bought:
- One integration instead of four. Fewer failure modes, less glue.
- Sub-3s latency out of the box. The multi-vendor stack needed manual tuning of Deepgram endpointing and Cartesia streaming to hit the same target.
- Real lip-sync on the Phoenix-4 model. The amplitude-driven SVG portrait went in the bin.

What I gave up:
- Per-call control over STT/LLM/TTS. Tavus picks. Production at scale would want to swap providers per call by language or cost.
- Server-side tool execution. Tavus's recommended pattern is frontend dispatch via Daily app-messages, which is great for latency and bad for observability.

More on the second one below.

## How tool calling actually works in this stack

Tavus's documentation says explicitly: *Tavus does not execute tool calls on the backend.* When the LLM decides to call `book_appointment`, it broadcasts a `conversation.tool_call` event into the Daily room as an `app-message`:

```json
{
  "message_type": "conversation",
  "event_type": "conversation.tool_call",
  "conversation_id": "c123…",
  "properties": {
    "name": "book_appointment",
    "arguments": "{\"phone\":\"0987654321\",\"slot\":\"2026-05-02T14:00\"}"
  }
}
```

Your frontend listens for that event, executes the function (in our case by POSTing to a backend endpoint), and broadcasts the result back as a `conversation.respond` Daily message. Tavus's LLM treats the result as if the user had spoken it, and generates the next reply.

This places the entire tool-execution layer on the client. The backend exists to:
1. Open and close Tavus conversations.
2. Run the seven tool functions (each is a pure function over Postgres).
3. Persist transcript turns.
4. Generate a Gemini summary at the end.

The actual `/tools/{name}` endpoint is twenty lines:

```python
_TOOL_FNS = {
    "identify_user": lambda a, c: T.identify_user(a.get("phone", ""), a.get("name")),
    "fetch_slots": lambda a, c: T.fetch_slots(a.get("date")),
    "book_appointment": lambda a, c: T.book_appointment(a.get("phone", ""), a.get("slot", "")),
    "retrieve_appointments": lambda a, c: T.retrieve_appointments(a.get("phone", "")),
    "cancel_appointment": lambda a, c: T.cancel_appointment(int(a.get("appointment_id", 0))),
    "modify_appointment": lambda a, c: T.modify_appointment(int(a.get("appointment_id", 0)), a.get("new_slot", "")),
    "end_conversation": lambda a, c: T.end_conversation(c or ""),
}

@app.post("/tools/{name}")
def run_tool(name: str, payload: ToolPayload) -> dict:
    fn = _TOOL_FNS.get(name)
    if fn is None:
        raise HTTPException(404, f"unknown tool: {name}")
    try:
        result = fn(payload.args, payload.conversation_id)
    except Exception as e:
        log.exception(f"tool {name} failed")
        result = {"ok": False, "error": str(e)}
    return {"name": name, "result": result}
```

The dispatch table maps tool names to lambdas with a uniform `(args, conversation_id) -> dict` signature. `end_conversation` lives in the same table even though it doesn't use `args`. Uniformity beats special cases.

Each tool in `tools.py` is a pure function. No HTTP, no Tavus, just Postgres. Ten unit tests run in 300 ms with `DATABASE_URL=sqlite:///:memory:`. Production goes through the same functions; only the wrapper changes.

## The seven tools, with their guards

| Tool | Returns `ok: false` when | Reason |
|---|---|---|
| `identify_user` | phone has fewer than 7 digits | obvious user error |
| `fetch_slots` | date string isn't `YYYY-MM-DD` | LLM hallucinated the format |
| `book_appointment` | slot is already confirmed | double-book prevention |
| `book_appointment` | phone never went through `identify_user` | belt to the system prompt's braces |
| `cancel_appointment` | appointment ID doesn't exist | LLM made up an ID |
| `cancel_appointment` | appointment is already cancelled | idempotency at the LLM level |
| `modify_appointment` | new slot belongs to another confirmed appointment | clash prevention |
| `modify_appointment` | trying to modify a cancelled appointment | state machine guard |

Every guard returns a string `error` code. The LLM is told (via the system prompt) how to recover from `ok: false`. In practice, when Mira gets `ok: false, error: slot_taken`, she says "Oh, that 11 a.m. slot is already booked. How about 10 or 2?" Natural recovery, no script.

## The directive prefix problem

Here's a bug that taught me the most about how `conversation.respond` actually works.

The first version of my tool-result echo sent the raw JSON:

```ts
sendRespond(`Tool ${name} returned: ${JSON.stringify(result)}`);
```

Mira would then read this *out loud* in her speaking voice. As in, the user would hear: "Tool identify user returned colon open brace ok colon false comma error colon phone too short close brace." Insane.

The fix has three parts:

1. **Prefix every tool-result echo with `[tool_result]`.**
2. **Tell Mira in the system prompt to never read `[tool_result]` lines aloud.**
3. **Filter any utterance containing `[tool_result]` out of the visible transcript** (Tavus emits a `conversation.utterance` event for our `respond` text, which would otherwise appear in the chat panel as the user saying it).

Belt and braces and a third thing. Without all three, the experience falls apart.

The current echo includes a directive sentence so the LLM knows what to do with the data:

```ts
sendRespond(
  `${TOOL_PREFIX} The ${name} tool returned: ${JSON.stringify(result)}. ` +
  `Use this data in your next reply. If it lists appointments, read them aloud. ` +
  `If ok is false, recover gracefully.`
);
```

The naked JSON wasn't enough. The LLM kept getting confused and saying things like "no appointments on file" when the JSON clearly listed two. Adding the imperative sentence fixed it.

## Other bugs worth listing

These are the ones that would have stayed bugs if I hadn't watched real calls. The git history has a commit for each.

| Symptom | Root cause | Fix |
|---|---|---|
| Render dyno wouldn't bind `$PORT` | `init_db()` threw because Supabase was unreachable; uvicorn never started | Wrap `init_db` in try/except |
| `/health` returned 405 to UptimeRobot | `@app.get` doesn't auto-route HEAD; UptimeRobot pings HEAD by default | `@app.api_route("/health", methods=["GET", "HEAD"])` |
| Every utterance recorded twice | Both Tavus webhook AND frontend posted to `/transcript` | Made `/tavus/event` a no-op; frontend is sole source |
| Daily threw "token should be a string" | Backend returned `meeting_token: null`; we passed it to `daily.join()` | Conditionally include the token only if truthy |
| Replica's video didn't show | Wrong participant filter + `<DailyVideo>` inside a circular orb | Filter by `tavus-replica` user_id; switch to plain rectangular tile |
| Mira ended the call after asking a question | LLM jumped to `end_conversation` without waiting for a reply | Tighten the system prompt: "DO NOT call end_conversation until the caller explicitly says they're done" |
| Mira didn't confirm phone digit-by-digit | First version trusted STT | System prompt now requires read-back-and-wait-for-yes before `identify_user` |

The LLM does what the system prompt tells it to. Every misbehaviour I caught was a missing sentence.

## Render free-tier notes

Three things that cost me an hour each.

The free dyno sleeps after 15 minutes idle and cold-starts in 30–90 seconds. The landing page fires a `GET /health` on mount via a tiny `<Warmup />` component, so by the time the user clicks Start the dyno's awake. UptimeRobot pinging `/health` every 5 minutes is the production-grade version.

Render free tier has no outbound IPv6, and Supabase's direct host resolves to IPv6 only. Fix: use Supabase's Session pooler at `aws-1-<region>.pooler.supabase.com:5432`. This is documented in `.env.example` so the next person doesn't lose 90 minutes the way I did.

The 512 MB memory cap killed my LiveKit Agents stack under default subprocess prewarming. `JobExecutorType.THREAD, num_idle_processes=0` fixed it. The Tavus version doesn't run a worker on our side, so the cap stopped mattering after the pivot.

## What it costs to run

Per-call cost is `duration_minutes × TAVUS_RATE_USD_PER_MIN` (default 0.15). Gemini summaries are effectively free at this volume (a 60-second call's transcript is under 1k tokens).

A 90-second call comes out to ~$0.225 USD or about ₹19. The free Tavus tier is 25 minutes per month, roughly 16 calls. The summary card shows both USD and INR, with `USD_TO_INR` as an env var so the rate updates without a redeploy.

At weekend volumes that math is fine. At anything resembling production volume the Tavus per-minute would dominate, which is why most of what comes next is about owning more of the pipeline.

## What I'd change for production

In rough priority order.

1. Move tool dispatch server-side. Right now the browser is the source of truth for what tools ran and what they returned, which is fine for a demo and bad for everything else. Server-side dispatch buys you a real audit trail, observability, and a way to reject a malicious client claiming `book_appointment` succeeded when it didn't.
2. Idempotency keys on tool POSTs. If the frontend retries `book_appointment`, the `slot_taken` guard catches the second write, but only because of the unique slot index. An explicit idempotency key is safer and would also de-dupe accidental double-clicks on the frontend.
3. HMAC-verify the Tavus webhook. `/tavus/event` is a no-op sink today, so the security surface is zero, but if I started using the webhook I'd want HMAC verification per Tavus docs before trusting any of it.
4. Own the STT/LLM/TTS pipeline. Keep Tavus for the avatar only. Swapping providers per call by cost, language, or latency only happens if you control the orchestration. This is the largest rewrite of the four and the only one that pays back at scale.

## Where it lives

- Backend repo: [github.com/1Mangesh1/voice-agent-demo-backend](https://github.com/1Mangesh1/voice-agent-demo-backend)
- Frontend repo: [github.com/1Mangesh1/voice-agent-demo-frontend](https://github.com/1Mangesh1/voice-agent-demo-frontend)
- Live: [voice-agent-demo-frontend.vercel.app](https://voice-agent-demo-frontend.vercel.app)
- Backend health: [voice-agent-demo-api.onrender.com/health](https://voice-agent-demo-api.onrender.com/health)

Both READMEs are written like a person wrote them, because one did. Each repo has a "what's not implemented (and why)" section, which I find more useful than the usual feature list.

If I poked at this another weekend I'd move tool dispatch to the backend and wire OpenTelemetry through the call lifecycle. Given a full week I'd build a small Tavus replacement (LiveKit + Deepgram + Cartesia + a self-hosted lipsync model) and watch the cost-per-minute drop by 5×.

The companion post, *Tavus CVI + Daily React: hands-on with tool calling*, goes deeper into the wire format. Read that one if you want to build something like this yourself.
