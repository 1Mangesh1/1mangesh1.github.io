---
title: "Building an AI Chatbot for My Portfolio: From Neon Dreams to Minimalist Reality"
description: "How I integrated Cloudflare Workers AI into my Astro portfolio, learned why design matters more than you think, and discovered that gimmicks make for bad UX."
pubDate: 2026-03-25T00:00:00Z
tags: ["cloudflare", "ai", "astro", "design", "javascript"]
---

I added an AI chatbot to my portfolio. Not because everyone's doing it, but because I genuinely wanted one—someone to explain my work when I'm not around, answer questions about my skills, recommend projects. A digital me, basically.

What I didn't expect: getting the design *completely* wrong the first time, then learning why minimalism beats novelty, every single time.

## Why I Actually Built This

I get emails. Most aren't interesting. "Are you available?" "Can you build X?" "How much do you charge?" Standard stuff. But it gets annoying to repeat answers over email.

Visitors land on my site. They can scroll through my blog, check out projects, read the "about" page. But the reality is most people's first instinct when they want information? They ask.

A contact form used to be how that worked. And contact forms are dead. Nobody fills them out. They just bounce.

So I started thinking about this differently. What if instead of a form, people could just *ask*? Real conversation. Real-time answers. No waiting three days for me to get back to them.

That's when I looked at Cloudflare Workers AI.

## The Tech Stack (And Why These Choices)

### Cloudflare Workers AI

I picked this over other options for specific reasons:

**No API key management.** This was huge. I've worked with Anthropic's API before. You get an API key, you have to keep it secret, you have to worry about it leaking in client code, you have to check your bill every month to make sure nobody's scraping your endpoint. With Workers AI, the whole thing runs on Cloudflare's infrastructure as a Worker. No keys exposed anywhere. No bill surprises.

**Cost.** Cloudflare includes 10,000 requests per day with basic Workers plan. I'm at 15/hour limit anyway, so I'll never hit that. If I did, it's cheap. Anthropic's API is fine, but it adds up if traffic increases.

**Speed.** The Llama 3.2-3b model runs on Cloudflare's edge network globally. Requests hit a server near the user. It might not matter much for a chatbot, but sub-100ms latency feels better.

**Simplicity.** No authentication layers. No token management. Just write a Worker, deploy it, it works.

### Llama 3.2-3b

Small model. 3 billion parameters. Not SOTA. Definitely not GPT-4 class. But here's the thing: I'm not doing complex reasoning. Someone asks "what's your experience with React?" and I need a coherent response. The 3B model does that.

I tested it locally first. Generated responses were always relevant, usually good grammar, specific enough to be helpful. When it gets stuck, it hallucinates (that's a real problem with small models), but so does GPT-4. I can always acknowledge that if it happens.

The speed is actually better than larger models. Inference is measurably faster. For a chatbot where people are waiting for the response, that matters.

### Rate Limiting Strategy

15 requests per hour per IP. Why that number?

A normal conversation is maybe 5-10 exchanges back and forth. Some people chat longer, some don't. 15/hour gives you room to have a real conversation without being stingy. But it also prevents someone from deciding to scrape my endpoint or use it for something weird by sending 10,000 requests.

I implemented it at two levels:

**Server-side (Worker):** The Worker checks the count in KV. If you're over the limit, you get a 429. This is the actual enforcement.

**Client-side (localStorage):** The frontend checks the count before even sending the request. This prevents the "send request → wait for response → get 429" UX. Instead, you see the button disabled with a message saying you're rate limited. Better experience.

```javascript
// Server-side rate limiting in Worker
const ip = request.headers.get('cf-connecting-ip');
const key = `rate:${ip}`;
const count = await env.RATE_LIMIT_KV.get(key);

if (count && parseInt(count) > 15) {
  return new Response(JSON.stringify({ error: 'Rate limited' }), { 
    status: 429,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Then increment
await env.RATE_LIMIT_KV.put(key, String(parseInt(count || '0') + 1), { 
  expirationTtl: 3600 
});
```

The `expirationTtl: 3600` is important. Without it, the counter stays forever and you're permanently rate limited. With it, the counter resets every hour.

## The Design Disaster (Where I Got It Very Wrong)

I got excited about building something. And excitement made me stupid.

"AI chatbot" triggered this specific image in my head: neon vibes. The Matrix. Cyan glowing text. Magenta accents. Space Mono monospace font everywhere. ASCII borders. Terminal aesthetics. The whole "hacker in a dark room" vibe.

I built it. The CSS was almost fun:

```css
/* This looked way cooler than it should have */
background: linear-gradient(135deg, #0a0010 0%, #1a0a2e 100%);
border: 2px solid #00f7ff;
box-shadow: 0 0 40px rgba(0, 247, 255, 0.2);
text-shadow: 0 0 10px var(--neon-cyan);
```

Dark purple gradient. Cyan glowing border. Text with that glow effect. In a local dev environment, zoomed in on my monitor, it looked genuinely cool. Felt like something from a sci-fi movie.

Then I put it on the actual site.

Wrong call. Completely wrong.

My portfolio is minimalist. Blue and green. Generous whitespace. The whole thing whispers. And here I dropped this glowing cyberpunk widget in the bottom right corner like a spaceship landed in a library.

The feedback was direct: "it does not suit the site do site matching theme redo better ux."

Fair criticismo. I deserved that.

## Understanding What the Site Actually Is

Instead of guessing, I actually looked.

**Colors:** Primary blue at #3b82f6. Secondary emerald green at #10b981. A warm accent gradient from golden (#F4D941) to amber (#EC8235). Light backgrounds are clean white, dark mode is very dark gray (#111827).

**Typography:** System fonts throughout. No decorative typefaces. That matters. No Space Mono randomly everywhere. When monospace appears, it's actual code only.

**Spacing:** Containers max out around 56rem. Padding is consistent: 1.5-2rem. Gaps between sections: 2.5-4rem. Everything has room to breathe.

**Animation:** When something scrolls into view, it fades and slides over 0.6 seconds. Hover states transition smoothly over 0.3 seconds. Cards lift up slightly (6px lift) and gain soft shadow. Nothing jarring. Nothing over-the-top.

**Overall feeling:** This is the work of someone who understands design. It's professional. It's confident. It has personality but it doesn't try hard. It's the visual equivalent of someone who dresses well because they understand fit and quality, not to get attention.

My neon chatbot was like showing up to that person's carefully-decorated house wearing a full LED suit and screaming.

## The Redesign (And Why It Actually Works Better)

I threw out everything neon. Started from scratch with the site's palette.

**The button:** Blue background (#3b82f6), white icon, a soft subtle shadow. When you hover it, the background gets slightly darker blue (#0d47a1), the shadow gets bigger and softer, and the button moves up 2px. That's it. No glow. No dramatic effects. Just responsive feedback.

**The header:** Blue gradient fade from left to right. White text, good contrast. Title says "Ask Mangesh" with zero terminal energy.

**Messages:** Clean rounded rectangles. User messages: blue background, white text. Assistant messages: light gray background, dark text. Error messages: muted red. All with proper contrast ratios (WCAG AA compliant, because accessibility matters).

**Suggestion chips:** Blue text on light gray background. When you hover, the background gets slightly darker and the chip slides right 4px. No borders. No glow. Just subtle and useful.

**Input area:** Light gray container with a subtle border. When focused, the border becomes blue and there's a soft blue shadow. Send button matches the main button style.

**Dark mode:** Everything shifts appropriately. Backgrounds become dark, text becomes light, borders become dark gray. Consistent because I used CSS variables from the start.

Here's the actual CSS:

```css
#ai-chat-button {
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

#ai-chat-button:hover {
  background: #0d47a1;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
  transform: translateY(-2px);
}

:global(.dark) #ai-chat-button {
  /* dark mode button styles */
}
```

Nothing complex. It fits because it follows the same design rules as everything else on the site.

## The Frontend Component

The component needed to handle a few things:

**Auto-resizing textarea.** I hate fixed-height inputs. They feel claustrophobic. The textarea grows as you type, up to a max height of 100px (then it scrolls).

**Character counter.** Shows 0/300 as you type. When you hit 300 characters max, you're done.

**Send button.** Only enabled if you've typed something AND haven't hit the rate limit.

**Suggestion chips.** Three default suggestions that fill the input when clicked. Useful for first-time visitors who don't know what to ask.

**Typing indicator.** Three bouncing dots while waiting for response. Low-key, not distracting.

**Auto-scroll.** Messages auto-scroll into view as they appear. Feels more responsive.

**Dark mode detection.** Checks for `:global(.dark)` class (same as the rest of the site).

```typescript
// Fragment of the component logic
const WORKER_URL = 'https://portfolio-ai-proxy.mangeshbide1.workers.dev';

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  
  const length = input.value.trim().length;
  counter.textContent = `${length} / 300`;
  submitBtn.disabled = length === 0 || !canSendMessage();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  
  if (!message || !canSendMessage()) return;

  recordMessage();
  addMessage(message, 'user');
  input.value = '';
  submitBtn.disabled = true;

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    addMessage(data.result, 'assistant');
  } catch (error) {
    addMessage('Something went wrong. Try again.', 'error');
  }
});
```

## Security Considerations (The Boring But Important Part)

The Worker validates three things:

**Origin check:** The request has to come from `https://mangeshbide.tech`. If someone tries to call the endpoint from a different domain, it gets rejected immediately.

**Referer check:** Similarly, the referer header has to start with my domain. This prevents the endpoint being used from random websites.

**Input validation:** The message is required and gets passed to the AI model. I don't do fancy validation (the 300-character limit is client-side anyway), but I could add more if I needed to.

I'm not checking CORS origins hard-core because this is a public feature. Someone could still call the endpoint from their own site if they really wanted to. But the origin/referer checks prevent accidental misuse.

For a portfolio site, this is fine. If I was protecting sensitive data, I'd add authentication layers, HMAC signing, or API keys. But for a public chatbot on a public site, the CORS checks are sufficient to prevent obvious abuse.

## What Actually Mattered Most

Three things changed how I approached this:

**First:** I had to stop guessing what "AI chatbot" should *feel* like and actually look at what my site *is*. My site doesn't shout. It doesn't need to. That's intentional and it works.

**Second:** Consistency beats novelty every time. The neon design was different. Novel. Attention-grabbing. And exactly wrong because of that. A chatbot that breaks the visual language of the site isn't clever. It's just friction. Every color, every animation, every interaction should feel like it belongs there.

**Third:** Functionality over flash. The new design doesn't glitter or glow or impress. It has clear feedback (you know when you hover something), readable structure (you know who said what), proper contrast (you can actually read it), and dark mode that works. That's not basic. That's the entire point.

## Deployment and Production

I deployed the Worker first, tested it locally with `wrangler dev`. Confirmed it was responding correctly, rate limiting was working, security checks weren't broken.

Then I integrated the component into the Astro layout. Built the site locally, confirmed it rendered correctly.

Only then did I deploy to production.

The Worker lives at `https://portfolio-ai-proxy.mangeshbide1.workers.dev`. The Astro component calls that endpoint when you click send. The whole thing is about 50 lines of TypeScript on the frontend, ~40 lines of JavaScript in the Worker.

Small, focused, simple to maintain.

## Lessons That Stuck

**Design isn't decoration.** The cyberpunk design wasn't bad in a vacuum. It was bad in context. I learned this the hard way. A good design isn't the one that looks coolest when you squint at it in isolation. It's the one that serves the thing you're trying to do. For a minimalist portfolio, that means clean, subtle, consistent.

**Consistency turns into a superpower.** When your site follows the same rules everywhere, adding something new is cheap. You don't think. You just follow the pattern. Color palette: use blue. Spacing: use 1.5rem padding. Animation: use 0.3s smooth transitions. Done.

**Rate limiting is boring but necessary.** I didn't want to think about it. But 30 seconds into production, when someone could have theoretically hammered the endpoint with 10,000 requests, I was grateful it existed.

**Minimalism requires discipline.** The neon design was easy. Throw glowing effects everywhere, add dramatic color contrasts, use bold fonts. Done. The minimalist design required actually understanding what the site was about, then serving that purpose. Harder. But better.

**Small models are underrated.** I was skeptical about Llama 3.2-3b. But it works. It's fast. For 90% of use cases (chatbots, simple Q&A, content generation), you don't need massive models. You need something that works well enough, fast enough, cheap enough.

## What I'd Definitely Change

If I were starting over:

**Design in context from day one.** Not in isolation. Not in a local dev environment zoomed in. Put it on the actual site, look at it next to the actual content, make sure it feels like it belongs. I learned this lesson but it cost me time.

**Test rate limiting earlier.** I tested it locally, but I should have load-tested the endpoint before production. Not a huge issue for a portfolio site, but it's good practice.

**Add more robust error handling.** Right now if the AI model times out or fails, you get a generic error message. I could track these failures, add retry logic, or gracefully degrade. For production, this would be worth doing.

**Measure actual usage.** I'm not tracking how many people use the chatbot, what questions they ask, whether it's actually useful. Some analytics would help me understand if people care about this feature or if it's just noise.

## The Result

The chatbot works. People can ask questions. It answers reasonably. It respects rate limits. It respects dark mode preference. It doesn't break the site.

Is it going to change my career? Probably not. Is it a feature I'm proud of? Yeah, actually. Because it's done right. Not flashy, but solid.

And every time someone uses the chatbot instead of sending an email, it was worth building.

## Technical Recap

**Stack:** 
- Cloudflare Workers (edge computing)
- Llama 3.2-3b (AI model)
- Cloudflare KV (rate limiting storage)
- Astro (component framework)
- Tailwind CSS (styling)
- TypeScript (type safety)

**Performance:**
- Response time: ~200-500ms (model inference)
- Rate limit: 15 requests/hour per IP
- No authentication required (public feature)
- CORS + Referer validation for security

**Time investment:**
- Worker + component: ~3 hours
- First design (neon): ~2 hours
- Redesign (minimalist): ~1.5 hours
- Testing and debugging: ~1.5 hours
- Total: ~8 hours

**Worth it?** Absolutely. Every time someone asks instead of emailing, yes.


```css
/* This looked cool in my head, terrible on the site */
background: linear-gradient(135deg, #0a0010 0%, #1a0a2e 100%);
border: 2px solid #00f7ff;
box-shadow: 0 0 40px rgba(0, 247, 255, 0.2);
text-shadow: 0 0 10px var(--neon-cyan);
```

I built the whole thing. Tested it locally. Felt like a sci-fi movie. Then I put it in the actual site.

And it was *wrong.*

My portfolio is minimalist. Clean. Blue and green. Generous whitespace. It whispers instead of shouts. And here I dropped this glowing cyberpunk box in the corner like a spaceship landed in someone's bedroom.

The user was direct: "it does not suit the site do site matching theme redo better ux."

Fair.

## Understanding the Site's Actual Aesthetic

I spent time actually analyzing what my site looks like, instead of just *thinking* I knew.

**Colors:** Primary blue at #3b82f6. Secondary emerald at #10b981. Warm accent gradient from #F4D941 to #EC8235 (golden to amber). Backgrounds: clean white in light mode, #111827 in dark mode.

**Typography:** System fonts. No decorative typefaces. Only monospace for actual code. Bold hierarchy. Generous line-height.

**Spacing:** Max-width 56rem containers. 1.5-2rem padding. 2.5-4rem gaps between sections. It breathes.

**Animation:** Scroll-triggered fade/slide at 0.6s. Smooth transitions at 0.3s. Card hover lift—that's +6px shadow, smooth movement, nothing jarring.

**Vibe:** A developer made this. It's professional. It has personality without being loud about it. It's the design equivalent of someone who dresses well because they understand fit and quality, not because they need attention.

My neon chatbot was the visual equivalent of showing up to that person's house in a full LED suit.

## The Redesign

I threw out the neon. Started over with the site's actual palette.

Button: Blue background, white icon, subtle shadow. Hover: slightly darker blue, shadow increases by 2px, move up 2px. No glow. No drama.

Header: Blue gradient (clean, not vaporwave). White text. Proper contrast. Title says "Ask Mangesh" with no terminal eye-roll.

Messages: Clean rounded rectangles. User messages: blue background (same primary blue as button). Assistant messages: light gray background. Error messages: muted red. All with proper contrast ratios for accessibility.

Suggestion chips: Blue text on light gray background. Hover: slightly darker background, slide right 4px. No borders, no glowing, just responsive and subtle.

Input area: Light gray background, blue border on focus. Send button: blue, same as primary button.

Dark mode: All backgrounds shift appropriately. Text becomes light gray. Borders become dark gray. It just works because I used CSS variables from the start.

Here's a snippet of the new approach:

```css
#ai-chat-button {
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

#ai-chat-button:hover {
  background: #0d47a1;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
  transform: translateY(-2px);
}
```

Simple. Clear. Fits.

## What Made the Difference

Three things:

**1. Understanding the site's voice.** I had to actually look at what I'd built instead of imagining what "AI chatbot" means. Turns out my site doesn't shout. It doesn't need to. That's the whole point.

**2. Consistency over novelty.** The neon design was different. It stood out. And that was exactly the problem. A chatbot that breaks the site's visual language isn't clever—it's friction. Every pixel should feel like it belongs.

**3. Functionality over flash.** The new design doesn't have glowing effects or terminal styling. It has:
- Immediate feedback (button hover, input focus)
- Clear message structure (who said what)
- Readable text (high contrast, proper sizing)
- Responsive behavior (works on mobile, dark mode)

That's not boring. That's intentional.

## The Code

Nothing revolutionary here, but it's solid.

Rate limiting happens in the Worker (server-side). The frontend has its own rate-limit check using localStorage, which prevents people from even sending too many requests (better UX than getting 429 errors).

Auto-resizing textarea because I hate fixed heights for input fields. The message counter updates as you type. The send button disables if the message is empty.

When you click a suggestion chip, it fills the input with that question. If the message is already sent, the suggestion clears it out.

Typing indicator shows while waiting for response. Auto-scroll keeps the latest message in view.

Dark mode detection is native—I check for `:global(.dark)` class (same pattern the rest of the site uses).

The component is self-contained. Drop it into any Astro layout and it works. If someone's not using Cloudflare Workers, they'd need to swap the `WORKER_URL`, but the interface stays the same.

```typescript
const WORKER_URL = 'https://portfolio-ai-proxy.mangeshbide1.workers.dev';

// Rate limit check (client-side, for UX)
function canSendMessage(): boolean {
  const timestamps = getMessageTimestamps();
  return timestamps.length < RATE_LIMIT_PER_HOUR;
}

// Fetch from Worker
const response = await fetch(WORKER_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message }),
});
```

## Lessons So Far

**Design isn't decoration.** I learned this the hard way, but it stuck. The cyberpunk design wasn't bad—it was just wrong for this purpose. A good design isn't the one that looks coolest in isolation; it's the one that serves its context.

**Consistency is a feature.** When everything on your site follows the same rules (colors, spacing, animations, tone), adding something new is cheap. You don't have to think. You just follow the pattern.

**Rate limiting is boring but important.** I didn't want to think about it. But 30 seconds into production, I was grateful it existed.

**Minimalism requires more discipline.** The neon design was easy—throw glowing effects everywhere, add dramatic color contrasts, use bold fonts. The minimalist design required actually understanding what the site was about, then serving that. Harder. Better.

## What I'd Do Differently

Honestly? I'd interview the site's aesthetic first. Before writing a single line of code. Look at the colors, the spacing, the animations. Read a few posts. Get a feel for the *voice* before I try to add something new.

I also would have started with the component in context, not built it in isolation. Seeing the neon chatbot in the corner of the minimalist site immediately killed it. If I'd been working that way from the start, the misalignment would have been obvious.

## The Result

The chatbot works. You can ask it questions. It answers quickly. It respects rate limits. It respects your preference for dark mode. It doesn't break the site.

Is it going to change the world? No. It's a feature. But it's a feature that feels like it belongs, that doesn't distract, that does what it says.

And that's enough.

## Try It

Visit my site and look for the blue chat button in the corner. Ask it something. If it's broken or saying stupid things, that's on me. If it feels like it fits, that's because someone took the time to make it fit instead of just making it cool.

---

**Tech stack recap:** Cloudflare Workers AI (Llama 3.2-3b), Cloudflare KV (rate limiting), Astro (component), Tailwind CSS (styling), TypeScript (confidence).

**Design decisions:** Blues and emerald from the site palette, system fonts, subtle animations (0.3-0.6s), dark mode support, minimal decoration, functional feedback.

**Security:** CORS validation, Referer validation, input validation, rate limiting (15/hour), no API keys exposed.

**Time to build:** ~3 hours for the Worker + component. Another hour for the design disaster. Another hour for the fix. Total: 5 hours including debugging and testing.

Worth it? Yeah. Every time someone asks the chatbot instead of filling out a contact form, it was worth it.
