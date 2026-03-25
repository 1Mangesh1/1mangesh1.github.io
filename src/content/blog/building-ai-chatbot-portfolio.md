---
title: "Building an AI Chatbot for My Portfolio: From Neon Dreams to Minimalist Reality"
description: "How I integrated Cloudflare Workers AI into my Astro portfolio, learned why design matters more than you think, and discovered that gimmicks make for bad UX."
pubDate: 2026-03-25T00:00:00Z
tags: ["cloudflare", "ai", "astro", "design", "javascript"]
---

I added an AI chatbot to my portfolio. Not because everyone's doing it, but because I genuinely wanted one—someone to explain my work when I'm not around, answer questions about my skills, recommend projects. A digital me, basically.

What I didn't expect: getting the design *completely* wrong the first time, then learning why minimalism beats novelty, every single time.

## Why I Built This

I get emails. Visitors land on my site. And yeah, you can scroll through my blog, check out projects, read the "about" page. But a lot of people's first instinct when they want information? They ask.

For a long time, that was just a contact form. And contact forms are dead. Nobody fills them out unless they're desperate.

So I started thinking: what if visitors could just... ask? Questions about my expertise, whether I'm available, how I approach problems. Real-time answers, no waiting for email.

Enter: Cloudflare Workers AI.

## The Tech Stack

I chose Cloudflare Workers AI for a few concrete reasons:

**No API keys.** This was the biggie. I didn't want to manage Anthropic keys, worry about rate limits at the API level, or get surprised by bills. Cloudflare Workers runs on my infrastructure, pulls from their AI models, done.

**Llama 3.2-3b.** Small model, fast inference, runs on Cloudflare's edge. It's not as capable as GPT-4, but GPT-4 is overkill for "tell me about this person's React experience." The 3B model is genuinely sufficient.

**Rate limiting via KV.** I added a 15-requests-per-hour limit using Cloudflare's KV storage. This isn't about being stingy—it's about preventing someone from hammering my endpoint with 10,000 requests as a prank. 15/hour is plenty for real conversation.

**Static site + dynamic backend.** My portfolio is static HTML/CSS/JS built with Astro. The chatbot is a separate Workers endpoint. They don't talk to my main site's infrastructure. If someone decides to DDoS my chatbot, my blog doesn't go down.

Here's the worker code (cleaned up):

```javascript
export default {
  async fetch(request, env) {
    // Only POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Security checks
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    if (origin !== 'https://mangeshbide.tech' || 
        !referer?.startsWith('https://mangeshbide.tech')) {
      return new Response('Forbidden', { status: 403 });
    }

    // Rate limiting
    const ip = request.headers.get('cf-connecting-ip');
    const key = `rate:${ip}`;
    const count = await env.RATE_LIMIT_KV.get(key);
    
    if (count && parseInt(count) > 15) {
      return new Response(JSON.stringify({ error: 'Rate limited' }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse message, call AI, return response
    const { message } = await request.json();
    
    const response = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
      prompt: `You are Mangesh's AI assistant on his portfolio. Answer questions about his skills, projects, and experience. Be concise and genuine.`,
      messages: [{ role: 'user', content: message }]
    });

    // Increment counter
    await env.RATE_LIMIT_KV.put(key, String(parseInt(count || '0') + 1), { 
      expirationTtl: 3600 
    });

    return new Response(JSON.stringify({ 
      result: response.response 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

Nothing fancy. Just solid fundamentals.

## The Design Disaster

Here's where I messed up.

I got excited. "AI chatbot" made me think: neon, terminal vibes, cyberpunk aesthetic. Cyan glowing text. Magenta accents. Space Mono font. ASCII-art-looking corners. The whole "neural hacker vibe" thing.

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
