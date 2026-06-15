---
title: "Portfolio Chatbot v2: Streaming, Memory, and Two Bugs the Tutorials Skip"
description: "I rebuilt my portfolio chatbot to stream replies token-by-token, remember the conversation, and render real Markdown links. Here's the Cloudflare Worker and Astro code, plus the two bugs I only caught by testing the deployed thing."
pubDate: 2026-06-15T00:00:00Z
tags: ["cloudflare-workers", "ai-chatbot", "astro", "streaming", "workers-ai"]
draft: false
---

A few months ago I [built a chatbot for this site](/blog/building-ai-chatbot-portfolio/). It worked, but it was a toy. You asked a question, waited a couple of seconds while three dots bounced, and then the whole answer appeared at once. It had no memory, so a follow-up like "how accurate was that?" meant nothing to it. Links came back as dead plain text. And it ran on a 3-billion-parameter model that was fine for one-liners and not much else.

This is the v2. It streams replies as they're generated, remembers the last few turns, renders Markdown with clickable links, and runs on a bigger model. None of that is exotic. What's worth writing down is the two bugs that didn't show up until the code was live — the kind that pass every local check and still ship broken.

Same stack as before: an Astro component talks to one Cloudflare Worker, which calls Workers AI. No API keys, no server to babysit.

## What Actually Changed

- The model went from `llama-3.2-3b-instruct` to `llama-3.1-8b-instruct-fast`. Noticeably better answers, still fast.
- Replies stream over Server-Sent Events instead of arriving as one JSON blob.
- The Worker now accepts a few turns of conversation history, so follow-ups work.
- Bot messages render as sanitized Markdown, so links are actually links.
- The system prompt got meaner about prompt injection.

Let me walk through the parts that taught me something.

## Streaming, and the D1 Logging Problem

Turning on streaming is one flag:

```javascript
// worker.js
const aiStream = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
  messages,
  max_tokens: 512,
  temperature: 0.5,
  stream: true,
});

return new Response(aiStream, {
  headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
});
```

`env.AI.run` with `stream: true` hands back a `ReadableStream` of SSE events. You pass it straight to the `Response` and the browser reads it as it arrives.

Here's the snag. v1 logged every question and answer to D1 so I could see what people ask. With a normal JSON call that's easy — you have the full answer in a variable. But once you return a stream, the answer flows past you on its way to the browser, and a stream can only be read once. Read it for logging and the visitor gets nothing.

The fix is `tee()`. It splits one stream into two independent readers. One goes to the visitor; the other I drain in the background to reconstruct the full text and write it to D1.

```javascript
// worker.js
let clientStream = aiStream;

if (env.CHAT_DB) {
  const [forClient, forLog] = aiStream.tee();
  clientStream = forClient;

  ctx.waitUntil(
    accumulateStreamText(forLog)
      .then((answer) => writeChatLog(env, request, ip, sessionId, question, answer))
      .catch((err) => console.error("D1 write error:", err))
  );
}

return new Response(clientStream, {
  headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
});
```

`ctx.waitUntil` keeps the logging alive after the response has shipped, same as v1. The visitor never waits on the database.

## The First Bug: the Docs Lied (a little)

Every tutorial I found, and the older Cloudflare examples, show streamed tokens arriving like this:

```
data: {"response": "Hello"}
data: {"response": " there"}
data: [DONE]
```

So I wrote my parser to pull `json.response`. Locally everything type-checked, tests passed, the build was green. I deployed.

Then I did something I should have done first: I `curl`ed the deployed Worker and looked at the raw bytes.

```
data: {"choices":[{"delta":{"content":"Mangesh"},...}],...,"model":"@cf/meta/llama-3.1-8b-fast-v2",...}
```

That's the OpenAI chunk format. The token is at `choices[0].delta.content`, not `response`. The newer fast models stream in the OpenAI shape; the flat `{response}` is the old one. My parser was reading a field that didn't exist, so the answer accumulated to an empty string. Every reply would have rendered blank in front of visitors.

The fix is small, and I made it tolerant of both shapes so a future model swap can't break it the same way:

```javascript
const token = json.choices?.[0]?.delta?.content ?? json.response;
if (typeof token === "string") answer += token;
```

The lesson isn't "read the field carefully." It's that a streaming contract is the kind of thing you cannot verify from your editor. Types don't help — the bytes come from a server at runtime. The only honest check is to hit the real endpoint and look. I almost shipped this on green tests.

## Conversation Memory (Without Trusting the Browser)

For follow-ups to work, the model needs the earlier turns. The browser keeps a small array of the conversation and sends the recent slice with each request.

The thing to be careful about: that history is client input, so it's hostile by default. If you let the client send the full `messages` array, including the system message, you've handed it the keys — it can rewrite the rules. So the Worker takes only `user` and `assistant` turns, validates and caps them, and always pins its own system prompt on top:

```javascript
// worker.js
const history = Array.isArray(body.history)
  ? body.history
      .filter((m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
      )
      .slice(-MAX_HISTORY_MESSAGES)   // last 6 turns
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_CHARS) }))
  : [];

const messages = [
  { role: "system", content: SYSTEM_PROMPT },
  ...history,
  { role: "user", content: trimmedQuestion },
];
```

Six turns is plenty for "tell me more about that one" and keeps the token count predictable. The system prompt lives on the server and never comes from the request.

## Markdown Links Without a Dependency

The prompt now asks the model to use Markdown, mostly so it returns real links to my GitHub and email. The browser was rendering bot text with `textContent`, which is safe but turns a link into a dead string.

I could have pulled in `marked` and `dompurify`. For a few links and the odd bit of bold, that felt like a lot of bundle for the job, and the output is untrusted model text, so sanitizing is the whole game anyway. So I wrote a small renderer with one rule: escape the HTML first, then add formatting on top of the safe string.

```typescript
// chat-markdown.ts
let text = escapeHtml(input);          // & < > " '  ->  entities
// then: code spans, [label](url), bare URLs, **bold**, lists, newlines
```

Two things that matter for not getting popped. Links are only allowed if the scheme is `http(s)` or `mailto`, so `[click](javascript:alert(1))` renders as plain text:

```typescript
const SAFE_LINK_SCHEME = /^(https?:\/\/|mailto:)/i;
// ...
return SAFE_LINK_SCHEME.test(href) ? makeLink(href, label) : original;
```

And because the whole input is escaped before any of this runs, a `<script>` in the model's reply is already inert by the time it reaches the DOM. It's about sixty lines, has no dependencies, and the dangerous parts have unit tests — including a `<script>` payload and the `javascript:` link above, asserting they come out harmless.

## The Second Bug: My CSS Did Nothing

After all the backend work, someone testing it told me the user and bot messages looked identical. Both were plain left-aligned text. No colored bubble, no card, nothing.

I'd written the bubble styles. I could see them in the file. They were not on the screen.

The tell was in a screenshot: the little "You" / "Mangesh AI" labels were rendering in normal case, but the CSS said `text-transform: uppercase`. That rule wasn't reaching them at all.

This is an Astro scoping detail I'd forgotten. A component's `<style>` is scoped by default: at build time Astro stamps every element in the template with a `data-astro-cid-*` attribute and rewrites your selectors to match only those elements. But the chat messages aren't in the template. They're created in JavaScript with `document.createElement` as people talk. Those elements never get the attribute, so none of the scoped rules ever applied to them. The only message that was ever styled was the welcome bubble, because that one is in the template.

Every chat tutorial that builds messages dynamically has this trap, and it's invisible until you actually send a message.

The fix is to make the widget's styles global. Everything here is uniquely prefixed (`#ai-chat-*`, `.ai-*`), so there's nothing for it to collide with:

```astro
<style is:global>
  /* ...all the chat styles... */
</style>
```

One catch on the way out: inside a global block, Astro's `:global(...)` helper is meaningless and gets emitted literally, which breaks it. The dark-mode rules I'd written as `:global(.dark) .ai-...` had to become plain `.dark .ai-...`. I verified the fix by grepping the compiled CSS in `dist/` for the selector and confirming it came out global, with no scope attribute attached. Reading the built output beats trusting that I did it right.

## Shipping the Worker Without Breaking the Live Site

The new frontend speaks SSE. The old one, still live while I worked, expected JSON. Deploy the new Worker on its own and the old page would call `response.json()` on a `text/event-stream` body and throw on every visitor.

So the Worker decides per request, based on what the client asks for:

```javascript
const wantsStream = (request.headers.get("Accept") || "").includes("text/event-stream");

if (!wantsStream) {
  // legacy path: one JSON object, exactly like v1
  return new Response(JSON.stringify({ result: answer }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
// otherwise stream
```

The new frontend sends `Accept: text/event-stream` and gets the stream. Anything else gets the old JSON. Now the deploy order doesn't matter and there's no window where the site is broken. It costs about six lines and one `if`.

## Small Things That Make It Feel Better

Real streaming turned out to be almost too fast — tokens arrive in a burst and the text basically teleports in. So the reveal is paced on the client: characters drip out at roughly 80 a second, decoupled from how fast the network delivers them. If you've got `prefers-reduced-motion` on, that's skipped and the text just appears.

And Enter sends the message now, with Shift+Enter for a newline. A `<textarea>` doesn't do that for free:

```typescript
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    form.requestSubmit();
  }
});
```

The `isComposing` check stops it from firing mid-composition for anyone typing through an IME, so a half-formed character doesn't get sent as a message.

## What I Still Haven't Done

The honesty section, same as last time.

There's no retrieval. The model knows what's hardcoded in the system prompt and nothing else. Ask it about a project I haven't listed and it'll tell you it doesn't know, which is the correct answer but not a clever one. Pointing it at my actual content with embeddings is the obvious next step, and I haven't done it.

Rate limiting is still per-IP, with all the holes I described in the v1 post. Streaming doesn't change that math.

And the question I dodged last time is still open: I have engagement, not conversion. I can see people chatting. I still can't see whether any of it leads anywhere. v2 is a better experience. Whether a better experience moves that needle, I don't know yet.

The full source is on [GitHub](https://github.com/1mangesh1/1mangesh1.github.io): [`worker.js`](https://github.com/1mangesh1/1mangesh1.github.io/blob/main/worker.js) for the backend, [`AiChat.astro`](https://github.com/1mangesh1/1mangesh1.github.io/blob/main/src/components/AiChat.astro) for the widget, and [`chat-markdown.ts`](https://github.com/1mangesh1/1mangesh1.github.io/blob/main/src/utils/chat-markdown.ts) for the little renderer. Or just open the chat in the corner and ask it something.
