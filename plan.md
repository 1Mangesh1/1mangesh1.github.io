Here's the complete updated prompt using CF Workers AI:

---

```
Build a secure AI chatbot integration for my static Astro.js portfolio site.

## My Setup
- Pure static Astro site (no backend, no .env, deployed on Cloudflare Pages)
- Cloudflare Worker as the only backend proxy
- Cloudflare Workers AI (model: @cf/meta/llama-3.2-3b-instruct) — NO external API keys needed
- RSS feed at https://mangeshbide.tech/rss.xml
- No secret tokens on frontend — security handled entirely on Worker side

## Architecture
Browser → Cloudflare Worker (security + RSS fetch + AI inference) → Workers AI binding

---

## PART 1: Cloudflare Worker (worker.js)

### Security
- CORS: Only allow requests from https://mangeshbide.tech — reject all others with 403
- Referer check: Validate Referer header starts with https://mangeshbide.tech
  If missing or doesn't match — return 403 immediately
- Rate limiting: Use Cloudflare KV to track requests per IP
  Max 15 requests per IP per hour. Return 429 with friendly message if exceeded
- Input validation:
  - Reject if body is empty or missing
  - Reject if question longer than 300 characters
  - Reject if question is empty/whitespace only
  - Return 400 for all validation failures
- Block non-POST methods with 405

### Blog Detection & RSS Fetching
Before calling AI, check if the user is asking about blogs:

```js
const isBlogQuery = /blog|article|post|writing|recent|latest/i.test(question);

if (isBlogQuery) {
  const rssResponse = await fetch("https://mangeshbide.tech/rss.xml");
  const xml = await rssResponse.text();
  
  // Parse up to 5 latest posts
  // Extract <item> blocks, grab <title> and <link> from each
  // Handle both plain and CDATA title formats:
  //   plain: <title>My Post</title>
  //   CDATA: <title><![CDATA[My Post]]></title>
  // Build a clean string like:
  // "Mangesh's latest blog posts:\n- Title → URL\n- Title → URL"
  // NEVER pass raw XML to the AI — only pass the parsed summary
}
```

### Cloudflare Workers AI Call
Use the AI binding (env.AI) — NO fetch, NO API keys, NO external calls:

```js
const messages = [
  { role: 'system', content: SYSTEM_PROMPT },
  { role: 'user', content: isBlogQuery ? `${question}\n\nContext: ${blogList}` : question }
];

const response = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
  messages,
  max_tokens: 400,
  temperature: 0.7,
});

return new Response(
  JSON.stringify({ answer: response.response }),
  { headers: { 'Content-Type': 'application/json' } }
);
```

Handle AI errors gracefully — return 502 with generic error message if AI call fails.

### System Prompt
Store as a const at the top of the file:

```
You are an AI assistant embedded in Mangesh Bide's portfolio website.
Your only job is to answer questions about Mangesh based on the info below.

STRICT RULES:
- Only answer questions about Mangesh, his work, skills, projects, and blogs
- If someone asks about recent blogs/articles, you will receive a list of
  latest posts in the context — share them naturally with titles and links
- If someone asks anything completely unrelated, politely say:
  "I'm here to answer questions about Mangesh only. Feel free to ask about
  his skills, projects, blogs or experience!"
- Keep answers concise, friendly and professional (2-4 sentences max)
- Never make up information not listed below
- If you don't know something say:
  "I don't have that info — feel free to reach out at mangesh@example.com"

--- PERSONAL INFO ---

NAME: Mangesh Bide
ROLE: Software Development Engineer
LOCATION: Pune, India
AVAILABLE FOR: [Freelance / Full-time — fill this in]
CONTACT: [your email]

SKILLS:
- Backend: Python, Django, REST APIs, PostgreSQL, PgBouncer, microservices,
  multi-tenant SaaS architecture, Docker, Docker Compose
- Frontend: Astro, TypeScript, Tailwind CSS
- Infrastructure: Cloudflare (Workers, Pages, WAF, CDN), Linux servers
- Tools: Git, Wrangler, pytest, CI/CD
- Exploring: AI/ML integration, LLM APIs

EXPERIENCE:
- [Company Name] | [Role] | [Duration]
  Building RESTful APIs for mobile apps — focusing on clean, scalable
  backend services. Working with Django, PostgreSQL, and microservices.
- [Add more experience here]

PROJECTS:
- Portfolio site (mangeshbide.tech): Personal portfolio built with Astro,
  deployed on Cloudflare Pages. Features browser games, dev tools, AI chatbot,
  RSS blog, and a Konami code easter egg.
- Resume Analyzer: AI-powered tool using Google Gemini API — parses resumes,
  matches against job descriptions, generates feedback.
- [Add more projects here]

EDUCATION:
- [Degree] in [Field] — [University], [Year]

BLOG: https://mangeshbide.tech/rss.xml
Writes about Django, backend architecture, Cloudflare, DevOps, web
performance, and AI. Published 10+ technical posts in 2025.

LANGUAGES: English, Hindi, Marathi
FUN FACTS: Reads books (currently The Fountainhead), watches Scooby Doo,
built browser games into his portfolio, hid easter eggs in his site footer.
```

---

## PART 2: wrangler.toml

```toml
name = "portfolio-ai-proxy"
main = "worker.js"
compatibility_date = "2024-12-01"

# AI binding — this is what gives access to Workers AI, no API key needed
[ai]
binding = "AI"

# KV binding for rate limiting
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "REPLACE_WITH_YOUR_KV_NAMESPACE_ID"

# Deployment instructions (as comments):
# 1. npm install -g wrangler
# 2. wrangler login
# 3. Create KV: wrangler kv:namespace create "RATE_LIMIT_KV"
# 4. Copy the KV namespace ID above
# 5. wrangler deploy
# 6. Copy your worker URL into AiChat.astro WORKER_URL constant
# 7. In CF Dashboard → your worker → Settings → update domain in CORS check
# 8. CF Dashboard → Security → WAF → add rate limit rule as backup
```

---

## PART 3: Astro Chat Component (src/components/AiChat.astro)

### UI — Floating Chat Bubble
- Fixed position bottom-right (bottom: 24px, right: 24px)
- Circular FAB button to open/close chat window
- Chat window: 340px wide, 480px tall, rounded corners (16px), subtle border
- Clean minimal light design using CSS variables for dark mode compatibility
- Mobile responsive: full width, pinned to bottom on small screens

### Chat Window Header
- Initials avatar (MB) in a blue circle
- Name: "Ask about Mangesh"
- Green online dot + "Always here" subtitle
- Close button (×)

### Chat Window Body
- Suggested chips shown when chat is empty (clickable):
  - "What are your top skills?"
  - "Show me recent blogs"
  - "Are you available for hire?"
- User messages: right-aligned, blue background (#185FA5), white text
- AI messages: left-aligned, gray surface background, subtle border
- Animated typing dots (3 bouncing dots) while waiting for response
- Auto-scroll to latest message on new message
- Character counter showing remaining chars (max 300)
- Error state inline: "Something went wrong, try again!"

### Blog Link Rendering
- After receiving AI response, parse the answer text
- Convert any https:// URLs into clickable <a> tags
- Open links in new tab (target="_blank", rel="noopener")

### Input Area
- Input field with placeholder "Ask me anything..."
- Send button (paper plane icon, blue circle)
- Submit on Enter key (but Shift+Enter for newline)

### Functionality
- POST to CF Worker URL:
  const WORKER_URL = "https://your-worker.workers.dev"; // replace after deploy
- Request body: JSON.stringify({ question: userInput })
- Stateless — no conversation history sent (each question independent)
- Smooth open/close animation (CSS transform + opacity transition)

---

## PART 4: Deployment Instructions (comment block at top of worker.js)

```
/*
DEPLOYMENT STEPS — Cloudflare Workers AI Portfolio Bot

1. Install wrangler:        npm install -g wrangler
2. Login:                   wrangler login
3. Create KV namespace:     wrangler kv:namespace create "RATE_LIMIT_KV"
4. Paste the KV ID into wrangler.toml replacing REPLACE_WITH_YOUR_KV_NAMESPACE_ID
5. Deploy:                  wrangler deploy
6. Copy the worker URL (e.g. https://portfolio-ai-proxy.yourname.workers.dev)
7. Paste it into AiChat.astro as the WORKER_URL constant
8. In CF Dashboard → Workers → your worker → Settings
   Update the CORS and Referer domain from mangeshbide.tech if needed

ZERO API KEYS NEEDED — Workers AI runs via the [ai] binding in wrangler.toml
Free tier: 10,000 neurons/day (~1,000+ questions/day) — resets at midnight UTC
*/
```

---

## Deliverables
1. worker.js — Cloudflare Worker with Workers AI binding, RSS parser, security
2. wrangler.toml — with AI binding + KV namespace config
3. src/components/AiChat.astro — drop-in floating chat component
```

---

## Key differences from the previous Haiku prompt

| | Old (Haiku) | New (CF Workers AI) |
|---|---|---|
| API key needed | ✅ Yes (Anthropic) | ❌ None |
| Cost | ~$0.001/question | Free (10k neurons/day) |
| Setup | External API call | `env.AI.run(...)` binding |
| Model | claude-haiku-4-5 | llama-3.2-3b-instruct |
| Prompt caching | Yes | Not needed (free anyway) |

Just remember to fill in your **email, experience, and education** in the system prompt before running it. 🚀