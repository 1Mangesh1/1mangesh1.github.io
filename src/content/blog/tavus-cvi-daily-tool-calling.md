---
title: "Tavus CVI + Daily React: hands-on with tool calling"
description: "What actually happens when an AI replica calls a function on the wire: Daily app-messages, conversation.respond, the [tool_result] convention, and why <DailyVideo> beats raw <video>."
pubDate: 2026-05-04T00:00:00Z
tags: ["tavus", "daily", "react", "voice-ai", "webrtc"]
draft: true
---

I built a clinic front-desk voice agent on Tavus CVI over a weekend, mostly to see what the integration actually felt like under load. The companion post, *Building Mira: a voice front-desk in 48 hours*, is the journey version. This one is the technical writeup: what happens on the wire when the LLM calls a tool, how the frontend wires into Daily, and the patterns that took me three iterations to get right.

If you're dropping Tavus CVI into a custom React UI (not their prebuilt component), this is what I wish I'd had on day one.

## The five-line mental model

Tavus's Conversational Video Interface is, on the wire, just a Daily.co room with extra app-message events. The setup:

1. Backend POSTs to `https://tavusapi.com/v2/conversations` with a persona + replica.
2. Tavus returns a `conversation_url` that's a Daily room URL.
3. Frontend joins the room with `daily.join({ url })`.
4. The replica joins a few seconds later and speaks.
5. Everything else (tool calls, utterance events, lifecycle) flows through Daily app-messages.

Once the room is open, Tavus is just a participant who happens to also have an LLM brain.

## What a tool call looks like on the wire

When the LLM decides to call a function, Tavus broadcasts a Daily app-message:

```json
{
  "message_type": "conversation",
  "event_type": "conversation.tool_call",
  "conversation_id": "c123…",
  "properties": {
    "name": "identify_user",
    "arguments": "{\"phone\":\"0987654321\"}"
  }
}
```

Two notes that took me too long to internalize:

1. `arguments` is a **JSON-encoded string**, OpenAI-style. Not an object. You parse it on the frontend.
2. **Tavus does not execute the tool.** Their docs say it explicitly. The client is responsible for taking action and broadcasting a result back.

The frontend handler in `@daily-co/daily-react`:

```tsx
useDailyEvent("app-message", useCallback(async (ev) => {
  const d = ev.data ?? {};
  const type = d.event_type || d.message_type || "";
  const props = (d.properties ?? {}) as Record<string, unknown>;

  if (type === "conversation.tool_call") {
    const name = String(props.name || "");
    let args: Record<string, unknown> = {};
    const raw = props.arguments;
    if (typeof raw === "string") {
      try { args = JSON.parse(raw); } catch { args = {}; }
    } else if (raw && typeof raw === "object") {
      args = raw as Record<string, unknown>;
    }

    // dispatch to backend, get { ok, ... }
    const result = await runTool(name, args);

    // echo result back to Tavus
    sendRespond(`[tool_result] The ${name} tool returned: ${JSON.stringify(result)}. ` +
                `Use this data in your next reply. If it lists appointments, read them aloud. ` +
                `If ok is false, recover gracefully.`);
  }
}, [runTool, sendRespond]));
```

The defensive `arguments` parsing handles both string and object shapes. Docs say string. It's always been a string for me. If that ever changes, this still works.

## Three options for sending the result back

This was the most confusing part of the integration. Tavus accepts three different broadcast events for sending tool results back to the LLM:

| Event | Behavior | When to use |
|---|---|---|
| `conversation.echo` | Replica speaks the text **verbatim** | When you want the avatar to read a fixed message out loud (notifications, alerts) |
| `conversation.append_llm_context` | Silent context injection | Background data that should inform the *next* spontaneous reply, not trigger one |
| `conversation.respond` | Treats text as a simulated user utterance; LLM generates a reply now | Tool results that need an immediate natural response. What we want most of the time |

I went with `conversation.respond`. The trade-off is that Tavus emits a `conversation.utterance` event for our `respond` text (treating it as if the user spoke it), which would otherwise show up in the visible transcript as the user saying "Tool identify_user returned…". Mitigated by the `[tool_result]` convention below.

The `sendRespond` helper:

```tsx
const sendRespond = useCallback(
  (text: string) => {
    daily?.sendAppMessage(
      {
        message_type: "conversation",
        event_type: "conversation.respond",
        properties: { text },
      },
      "*"
    );
  },
  [daily]
);
```

## The `[tool_result]` convention

The story behind this lives in the Mira post. Short version: the naive echo had the avatar reading raw JSON aloud, and one prefix wasn't enough to fix it. The wire-level fix is three coordinated pieces.

The prefix on every echo (already shown above) makes the message recognizable.

The persona prompt fragment:

> Tool results arrive as messages prefixed with `[tool_result]` followed by the tool name and a JSON payload. NEVER read these prefixed messages out loud. Silently use the data to decide your next reply. If the JSON has `ok: false`, recover gracefully and ask the caller again in plain words.

The frontend filter so the prefix doesn't leak into the visible transcript:

```tsx
if (type === "conversation.utterance") {
  const text = String(props.speech || props.text || "");
  if (!text.trim()) return;
  if (text.includes(TOOL_PREFIX)) return;   // skip our own echoes
  // ... append to transcript
}
```

Drop any one of these and the experience falls apart. The prefix without the prompt clause: the LLM still reads the JSON aloud. The prompt clause without the filter: the user sees the chat panel filling with our own echoes.

## Why `<DailyVideo>` beats raw `<video>`

This was three painful iterations.

**Iteration 1 (broken).** I wrapped `<DailyVideo>` inside a `rounded-full` container, a circular orb. The replica was found, the track was reported as `playable` and `isOff: false`, but the face never appeared. The orb's circular clip cropped the video oddly because `<DailyVideo>` wraps the actual `<video>` in a div whose inner sizing wasn't fully controlled by my classes.

**Iteration 2 (also broken).** I went lower-level. Rendered a raw `<video>` and attached the track manually:

```tsx
useEffect(() => {
  const el = videoRef.current;
  const track = videoState?.persistentTrack;
  if (!el || !track) return;
  el.srcObject = new MediaStream([track]);
  el.play().catch(() => {});
}, [videoState?.persistentTrack]);
```

Same symptom: track present, image absent. I spent an hour suspecting CSS, autoplay policies, and Daily's track subscription model.

**Iteration 3 (works).** I dropped the orb entirely. Used the canonical `<DailyVideo>` inside a plain `aspect-video` container. The replica's face fills the tile.

```tsx
export function Avatar() {
  const replicaIds = useParticipantIds({
    filter: (p) => p.user_id?.includes("tavus-replica") ?? false,
  });
  const replicaId = replicaIds[0];

  if (!replicaId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-[var(--color-ink)] text-[12px] text-[var(--color-mute)]">
        waiting for Mira…
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[var(--color-ink)]">
      <DailyVideo
        sessionId={replicaId}
        type="video"
        automirror={false}
        fit="cover"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
```

Twenty lines, zero state, zero refs. Lesson: when in doubt, copy the canonical Tavus pattern. My orb was an aesthetic preference fighting the SDK.

## Filtering for the replica participant

The participant filter is critical. My first version used `useParticipantIds({ filter: 'remote' })` which picks any non-local participant. This works in a 1:1 Tavus call but races with browser-injected dummy participants in some edge cases.

Tavus assigns the replica a `user_id` like `tavus-replica-r90bbd427f71`. The canonical filter, taken straight from Tavus's own example app, is:

```tsx
const replicaIds = useParticipantIds({
  filter: (p) => p.user_id?.includes("tavus-replica") ?? false,
});
```

That filter killed a pile of timing bugs I'd been chasing.

## The audio gotcha

`<DailyVideo>` renders the video. **It does not render audio.** Audio playback comes from a separate component:

```tsx
import { DailyAudio } from "@daily-co/daily-react";

// somewhere inside <DailyProvider>:
<DailyAudio />
```

This mounts hidden `<audio>` elements for every remote participant and plays them. I shipped a version without it once and spent ten minutes wondering why the call was silent.

## The phase machine

`CallShell` walks through six states: `idle → connecting → live → summarizing → summary`, with `ended` as the bail-out branch when the user leaves before a summary returns. Transitions are driven by Daily events (`joined-meeting`, `left-meeting`) plus the user clicking Start and End.

State lives in `useState`. No need for XState. Six states, two transitions each, fits in one component.

The Daily lifecycle wires up cleanly:

```tsx
useEffect(() => {
  const c = DailyIframe.createCallObject({
    audioSource: true,
    videoSource: false,             // user is voice-only
    subscribeToTracksAutomatically: true,
  });
  setCall(c);
  return () => { c.destroy(); };
}, []);

useDailyEvent("joined-meeting", () => setPhase("live"));
useDailyEvent("left-meeting",   () => setPhase(p => p === "live" ? "ended" : p));
useDailyEvent("error",          (ev) => console.error("daily error", ev));
useDailyEvent("app-message",    handleAppMessage);
```

The call object is created once on first mount. We pass it into `<DailyProvider callObject={call}>` so all the hooks inside use the same object. On unmount we destroy it cleanly.

## Tool name → human label

A tiny lookup table maps tool names to user-facing labels:

```ts
export function toolLabel(name: ToolEvent["name"]): string {
  switch (name) {
    case "identify_user": return "Identifying";
    case "fetch_slots": return "Reading calendar";
    case "book_appointment": return "Booking";
    case "retrieve_appointments": return "Fetching file";
    case "cancel_appointment": return "Cancelling";
    case "modify_appointment": return "Rescheduling";
    case "end_conversation": return "Wrapping up";
  }
}
```

The tool ticker above the avatar shows the label with a status suffix:

| Status | Display |
|---|---|
| `running` | `Identifying…` |
| `done` | `✓ Identifying done` |
| `failed` | `✗ Identifying failed` |

It auto-fades after 3.5 s. Good enough live-feedback that the user understands what's happening without needing a debug panel.

## Avoiding the noise-cancellation trap

Daily's `inputSettings.audio.processor.type: "noise-cancellation"` requires the Krisp module which is a separate package and isn't loaded by default. If you set it without loading the module, `daily.join()` may silently swallow the option or, worse, fail.

I removed it. Audio sounded fine.

## The wire format Tavus uses (full event reference)

For completeness, the events that come through the Daily app-message stream during a Tavus CVI call:

| `event_type` | `properties` shape | What it means |
|---|---|---|
| `conversation.tool_call` | `{ name, arguments: jsonString }` | LLM wants to call a function. Your turn |
| `conversation.utterance` | `{ role: 'user' \| 'replica', speech / text }` | Speech turn happened |
| `conversation.replica.started_speaking` | `{}` | TTS started |
| `conversation.replica.stopped_speaking` | `{}` | TTS finished |
| `conversation.user.started_speaking` | `{}` | STT detected user started |
| `conversation.user.stopped_speaking` | `{}` | STT endpointing fired |
| `conversation.respond` | `{ text }` | (You send this: text that LLM treats as user input) |
| `conversation.echo` | `{ text }` | (You send this: replica speaks verbatim) |
| `conversation.append_llm_context` | `{ text }` | (You send this: silent context injection) |

The `utterance` event uses `role` or `speaker` interchangeably across versions. Defensive code accepts either:

```ts
const role = String(props.role || props.speaker || "user");
const isReplica = role.startsWith("repl") || role === "replica" || role === "assistant";
```

## What Tavus's webhook is for

You can pass a `callback_url` when creating the conversation. Tavus will POST events to it. In my architecture I made the webhook a no-op `{"ok": true}` because the frontend already captures everything it needs from the Daily app-message stream. Letting both write to the database meant every transcript turn landed twice.

Picking *one* source of truth was the cleanup. If you don't have a frontend that's already listening, the webhook is the way to capture transcripts server-side. Just don't do both.

## The full call lifecycle, end to end

For anyone integrating, here's the canonical flow.

1. User clicks "Start". Frontend POSTs `/your-backend/start` to your service.
2. Your backend POSTs to Tavus `/v2/conversations` with the persona + replica IDs. Returns `conversation_url`.
3. Frontend calls `daily.join({ url })`. Browser asks for mic permission.
4. `joined-meeting` event fires. `<DailyVideo>` mounts but participant list is empty.
5. Tavus replica joins ~5 s later. `participant-joined` fires. `useParticipantIds` returns the new ID.
6. Replica's video and audio tracks subscribe automatically. `<DailyVideo>` and `<DailyAudio>` render them.
7. Replica speaks the greeting. `conversation.utterance` fires with `role: "replica"`.
8. User responds. `conversation.utterance` fires with `role: "user"`.
9. LLM decides to call a tool. `conversation.tool_call` fires.
10. Frontend dispatches the tool, gets the result, broadcasts `conversation.respond` with `[tool_result]` prefix.
11. LLM continues naturally with the result.
12. Steps 7–11 repeat.
13. User clicks "End". Frontend calls `daily.leave()` and POSTs `/your-backend/summary`.
14. Backend POSTs to Tavus `/v2/conversations/{id}/end` to stop the meter, then runs whatever post-call processing you want (Gemini summary in my case).
15. Backend returns the summary. Frontend renders it.

That's the whole protocol.

## Persona prompts: where most of the bugs actually live

The wire format is small. The system prompt is where this stack lives or dies, and most of my "the LLM is broken" debugging turned out to be missing instructions. Things I learned the hard way.

**Tool results need an instruction, not just data.** Echoing `{"ok": true, "appointments": [...]}` back wasn't enough. The LLM kept saying "no appointments on file" while the JSON in front of it had two. Adding a directive sentence ("Use this data in your next reply. If it lists appointments, read them aloud.") fixed it. The model treats your `respond` text as user speech, so phrase it like a user telling it what to do.

**Verbatim read-back for anything user-typed.** STT mishears phone numbers and email addresses constantly. The prompt has to say "read the phone number back digit by digit and wait for a yes before calling identify_user." Without that sentence Mira would happily book against the wrong number and only catch it on the cancellation step.

**Be explicit about end states.** The first version of the prompt said "thank the caller before ending." The LLM read that as permission to call `end_conversation` after asking a confirming question. New rule: "Do NOT call end_conversation until the caller explicitly says they're done." Capital letters help.

**Recovery instructions per failure mode.** `ok: false, error: slot_taken` and `ok: false, error: phone_too_short` need different recoveries. Rather than letting the LLM guess, the prompt lists each error code and the appropriate response shape. The recovery feels natural because the prompt told it what natural looks like.

**Keep the prompt boring.** I tried persona flourishes early on (warm tone, a name, a job description). They cost tokens and drifted the model toward chattiness it didn't need. The shipping version reads like a checklist. The model's natural fluency carries the warmth; the prompt carries the rules.

## Where to read more

- Tavus Tool Calling for LLM: [docs.tavus.io/sections/conversational-video-interface/persona/llm-tool](https://docs.tavus.io/sections/conversational-video-interface/persona/llm-tool)
- Tavus example app (canonical reference): [github.com/Tavus-Engineering/tavus-examples](https://github.com/Tavus-Engineering/tavus-examples)
- Daily React hooks: [docs.daily.co/reference/daily-react](https://docs.daily.co/reference/daily-react)

Codebase is open: [github.com/1Mangesh1/voice-agent-demo-frontend](https://github.com/1Mangesh1/voice-agent-demo-frontend) and [github.com/1Mangesh1/voice-agent-demo-backend](https://github.com/1Mangesh1/voice-agent-demo-backend). The narrative companion is *Building Mira: a voice front-desk in 48 hours*. Either one reads first.
