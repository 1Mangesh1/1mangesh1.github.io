# Cloudflare Workers AI Chatbot Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Anthropic Claude API with Cloudflare Workers AI (Llama 3.2) for zero-cost, native-to-CF-stack AI chatbot integration.

**Architecture:** Browser POSTs to Cloudflare Worker → Worker validates request (CORS, Referer, rate limit via KV) → Calls `env.AI.run()` with Llama 3.2 model → Returns response as JSON. No external API keys needed; AI runs on Cloudflare's free tier (10k neurons/day ≈ 1k+ questions).

**Tech Stack:** 
- Cloudflare Workers (worker.js)
- Workers AI binding (Llama 3.2 3B Instruct)
- KV namespace for rate limiting
- Astro + TypeScript (AiChat.astro)

---

## Task 1: Update worker.js for Llama Model

**Files:**
- Modify: `worker.js` (entire AI call section)

**Step 1: Replace SYSTEM_PROMPT with updated version**

Update the SYSTEM_PROMPT constant to include your details:

```javascript
const ALLOWED_DOMAIN = "https://mangeshbide.tech";
const MAX_REQUESTS_PER_HOUR = 15;
const SYSTEM_PROMPT = `
You are an AI assistant embedded in Mangesh Bide's portfolio website.
Your only job is to answer questions about Mangesh based on the information below.

STRICT RULES:
- Only answer questions about Mangesh, his skills, experience, projects, and background
- If someone asks anything unrelated (general coding help, ChatGPT questions, politics, etc.) 
  politely say: "I'm here to answer questions about Mangesh only. Ask me about his skills, projects or experience!"
- Keep answers concise, friendly and professional (2-4 sentences max)
- Never make up information not listed below
- If you don't know something, say "I don't have that info — feel free to reach out at hello@mangeshbide.tech"

--- PERSONAL INFO ---

NAME: Mangesh Suresh Bide
ROLE: Software Development Engineer
LOCATION: Maharashtra, India
AVAILABLE FOR: Full-time roles, Freelance projects
CONTACT: hello@mangeshbide.tech

SKILLS:
- Frontend: React.js, Next.js, Tailwind CSS, Astro, HTML5, CSS3
- Backend: Python, Django, NestJS, Node.js, Express, Laravel
- Database & AI: PostgreSQL, MySQL, MongoDB, DynamoDB, TensorFlow, PyTorch, Computer Vision
- Tools/DevOps: Docker, GitHub Actions, Terraform, Git, AWS (EC2, S3, IAM), Firebase, Vercel

EXPERIENCE:
- Houseworks Technologies | Software Development Engineer - I | April 2025 - Present
  Leading backend development for healthcare products using Django, PostgreSQL, and AWS. Designed scalable infrastructure with Terraform/Docker. Streamlined CI/CD.
- Houseworks Technologies | Software Development Engineer Intern | Feb 2025 - Mar 2025
  Automated infrastructure setup for staging using Terraform Workspaces. Optimized CI/CD.
- Procedure Technologies | Software Development Engineer Trainee | Oct 2024 - Feb 2025
  Full-stack development with React.js, Next.js, and NestJS. Containerized apps with Docker.
- Netwin Infosolutions | Backend Developer Intern | Feb 2024 - July 2024
  Developed RESTful APIs, JWT auth for a Flutter app, and image-based search via Eden AI ML.

PROJECTS:
- Expense Tracking API: Modular API for expenses with JWT auth, role-based access. (NestJS, TypeORM)
- Infrastructure-as-Code ChatApp: Provisioned/deployed real-time chat app using Terraform on AWS EC2.
- CrimiFace: Facial recognition tool using ML models to match faces against a database. (Python, TensorFlow, OpenCV)
- Real-time ChatApp: Chat platform with private messaging and activity logging via WebSockets. (Node.js, Express, Socket.io)

EDUCATION:
- B. Tech in Computer Engineering — R. C. Patel Institute of Technology, 2024 (CGPA: 7.98)
- Diploma in Computer Engineering — R. C. Patel Polytechnic, 2021 (93.89%)

LANGUAGES: English, Hindi, Marathi

FUN FACTS: Interested in Cloud Infrastructure, Distributed Systems, Anime, and Gaming.
`;
```

**Step 2: Replace Anthropic API call with Workers AI call**

In the `try` block (around line 140), replace the entire fetch to `api.anthropic.com` with this:

```javascript
// 6. Cloudflare Workers AI Call
try {
  const response = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: trimmedQuestion
      }
    ],
    max_tokens: 400,
    temperature: 0.7
  });

  const answer = response.response || "No answer generated.";

  return new Response(JSON.stringify({ answer }), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });

} catch (err) {
  console.error("Worker error:", err);
  return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
    status: 500, 
    headers: { ...corsHeaders, "Content-Type": "application/json" } 
  });
}
```

**Step 3: Update deployment comments at top of worker.js**

Replace the existing deployment comment block with:

```javascript
/*
DEPLOYMENT STEPS — Cloudflare Workers AI Portfolio Bot

1. Install wrangler:        npm install -g wrangler
2. Login:                   wrangler login
3. Create KV namespace:     wrangler kv:namespace create "RATE_LIMIT_KV"
4. Copy the KV ID into wrangler.toml replacing REPLACE_WITH_YOUR_KV_NAMESPACE_ID
5. Deploy:                  wrangler deploy
6. Copy the worker URL (e.g. https://portfolio-ai-proxy.yourname.workers.dev)
7. Paste it into AiChat.astro as the WORKER_URL constant
8. In CF Dashboard → Workers → your worker → Settings
   Verify the [ai] binding is present and active

ZERO API KEYS NEEDED — Workers AI runs via the [ai] binding in wrangler.toml
Free tier: 10,000 neurons/day (~1,000+ questions/day) — resets at midnight UTC
*/
```

**Step 4: Verify file structure**

Run: `head -20 worker.js`
Expected: See updated DEPLOYMENT STEPS comment and ALLOWED_DOMAIN constant

**Step 5: Commit worker.js**

```bash
git add worker.js
git commit -m "feat: replace Anthropic API with Cloudflare Workers AI (Llama 3.2)"
```

---

## Task 2: Update wrangler.toml Configuration

**Files:**
- Modify: `wrangler.toml`

**Step 1: Replace entire wrangler.toml**

```toml
name = "portfolio-ai-proxy"
main = "worker.js"
compatibility_date = "2024-12-01"

# AI binding — gives access to Workers AI models, no API key needed
[ai]
binding = "AI"

# KV binding for rate limiting
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "REPLACE_WITH_YOUR_KV_NAMESPACE_ID"
```

**Step 2: Verify file saved**

Run: `cat wrangler.toml`
Expected: See `[ai]` binding section and KV namespace config

**Step 3: Commit wrangler.toml**

```bash
git add wrangler.toml
git commit -m "feat: add Workers AI binding to wrangler.toml"
```

---

## Task 3: Update AiChat.astro Component

**Files:**
- Modify: `src/components/AiChat.astro` (WORKER_URL constant only)

**Step 1: Update WORKER_URL placeholder**

Locate line with `const WORKER_URL =` in the `<script>` section and update:

```javascript
// PLACEHOLDER: Replace with your deployed Cloudflare Worker URL
// Deploy worker.js first, then copy the URL here
// Example: https://portfolio-ai-proxy-1a2b3c.workers.dev
const WORKER_URL = "https://your-worker-url.workers.dev";
```

Change to a properly deployed URL after you've run `wrangler deploy` (will get this from shell output).

**Step 2: Verify no other changes needed**

The AiChat.astro component UI, request format, and error handling remain exactly the same. Only the WORKER_URL domain changes.

Run: `grep -n "WORKER_URL" src/components/AiChat.astro`
Expected: Single line showing the constant definition

**Step 3: Commit AiChat.astro**

```bash
git add src/components/AiChat.astro
git commit -m "chore: update WORKER_URL placeholder in AiChat component"
```

---

## Task 4: Local Testing (wrangler dev)

**Files:**
- None (testing only)

**Step 1: Start local Wrangler dev server**

Run: `wrangler dev worker.js`
Expected: Output shows "Listening on http://127.0.0.1:8787" or similar local URL

**Step 2: Test chatbot via curl (in separate terminal)**

```bash
curl -X POST http://127.0.0.1:8787 \
  -H "Content-Type: application/json" \
  -H "Referer: https://mangeshbide.tech/" \
  -d '{"question": "What are your top skills?"}'
```

Expected: JSON response with `{"answer": "..."}` containing AI-generated response about skills

**Step 3: Test rate limiting (send 16 requests)**

```bash
for i in {1..16}; do
  curl -X POST http://127.0.0.1:8787 \
    -H "Content-Type: application/json" \
    -H "Referer: https://mangeshbide.tech/" \
    -d "{\"question\": \"Question $i\"}"
  sleep 0.5
done
```

Expected: First 15 succeed, 16th returns `{"error": "Rate limit exceeded. Try again later."}`

**Step 4: Stop dev server**

Press `Ctrl+C` in terminal running `wrangler dev`

---

## Task 5: Deploy to Production

**Files:**
- None (deployment only)

**Step 1: Create KV namespace (if not already done)**

Run: `wrangler kv:namespace create "RATE_LIMIT_KV"`
Expected: Output shows namespace ID like `"id": "abc123def456"`

**Step 2: Update wrangler.toml with KV ID**

Replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` with the actual ID from Step 1.

Run: `wrangler kv:namespace create "RATE_LIMIT_KV" --preview` to also create preview namespace if needed.

**Step 3: Deploy Worker**

Run: `wrangler deploy`
Expected: Output shows "Uploaded worker successfully to..." with a URL like `https://portfolio-ai-proxy-abc.workers.dev`

**Step 4: Copy deployed URL**

From the output, note the full URL (e.g., `https://portfolio-ai-proxy-abc.workers.dev`)

**Step 5: Update AiChat.astro WORKER_URL**

Edit `src/components/AiChat.astro` and replace the WORKER_URL constant:

```javascript
const WORKER_URL = "https://portfolio-ai-proxy-abc.workers.dev";
```

(Use your actual deployed URL from Step 4)

**Step 6: Test production deployment (optional)**

```bash
curl -X POST https://your-deployed-url.workers.dev \
  -H "Content-Type: application/json" \
  -H "Referer: https://mangeshbide.tech/" \
  -d '{"question": "Tell me about Mangesh"}'
```

Expected: JSON response with AI-generated answer

**Step 7: Commit final changes**

```bash
git add src/components/AiChat.astro wrangler.toml
git commit -m "feat: deploy Workers AI chatbot to production"
```

---

## Task 6: Verify Astro Build Still Works

**Files:**
- None (build verification)

**Step 1: Run Astro type check**

Run: `yarn astro check`
Expected: No TypeScript errors in AiChat.astro or other files

**Step 2: Build for production**

Run: `yarn build`
Expected: Build completes successfully, produces `dist/` folder

**Step 3: Preview production build**

Run: `yarn preview`
Expected: Local preview server starts. Open browser to URL and chat bubble appears. Test chat functionality (will POST to your deployed Worker).

**Step 4: Stop preview**

Press `Ctrl+C`

---

## Task 7: Clean Up and Final Commit

**Files:**
- `worker.js`, `wrangler.toml`, `src/components/AiChat.astro` (already committed)

**Step 1: Verify all changes committed**

Run: `git status`
Expected: "nothing to commit, working tree clean"

**Step 2: View commit history**

Run: `git log --oneline -5`
Expected: See all commits from this feature:
- "feat: deploy Workers AI chatbot to production"
- "feat: add Workers AI binding to wrangler.toml"
- "feat: replace Anthropic API with Cloudflare Workers AI"

**Step 3: Create deployment notes (optional)**

Add to README.md or project docs if needed:
- Workers AI is free tier (10k neurons/day)
- Rate limit: 15 req/hour per IP
- Deployment: `wrangler deploy` after KV namespace created
- System prompt can be edited in worker.js SYSTEM_PROMPT constant

---

## Checklist

- [ ] worker.js updated with Llama AI call and new SYSTEM_PROMPT
- [ ] wrangler.toml has [ai] binding and KV namespace ID
- [ ] AiChat.astro WORKER_URL updated with deployed Worker URL
- [ ] Local testing with `wrangler dev` verified (rate limit tested)
- [ ] Production deployment with `wrangler deploy` completed
- [ ] Astro build passes with no errors
- [ ] All commits made with descriptive messages
- [ ] Chat functionality tested in browser on both local and production

---

## Notes

- **Cost:** $0 — Workers AI free tier is sufficient for a portfolio chatbot
- **Model:** Llama 3.2 3B Instruct (fast, good for Q&A)
- **Max latency:** ~0.5-1s per question (CF's edge locations are fast)
- **No external API keys:** Single source of truth is CF Dashboard
- **Scaling:** Free tier resets daily at midnight UTC; upgrade to paid if needed

