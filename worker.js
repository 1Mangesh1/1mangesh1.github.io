/*
DEPLOYMENT STEPS:
1. npm install -g wrangler
2. wrangler login
3. Enable Cloudflare Workers AI binding in wrangler.toml (ai = { binding = "AI" })
4. Create KV namespace: wrangler kv:namespace create "RATE_LIMIT_KV"
5. Copy the KV namespace binding ID into wrangler.toml
6. Deploy: wrangler deploy
7. Copy your worker URL into AiChat.astro WORKER_URL constant
8. In Cloudflare Dashboard → your worker → Settings → replace yourdomain.com with your real domain (mangeshbide.tech)
9. In Cloudflare Dashboard → Security → WAF → add rate limit rule as backup
*/

const ALLOWED_DOMAINS = [
  "https://mangeshbide.tech",
  "http://localhost", // Allow localhost for development
  "http://127.0.0.1",  // Allow localhost IP for development
];
const MAX_REQUESTS_PER_HOUR = 40;
const SYSTEM_PROMPT = `
You are an AI assistant embedded in Mangesh Bide's portfolio website.
Your only job is to answer questions about Mangesh based on the information below.

STRICT RULES:
- Only answer questions about Mangesh, his skills, experience, projects, and background
- If someone asks anything unrelated (general coding help, ChatGPT questions, politics, etc.) 
  politely say: "I'm here to answer questions about Mangesh only. Ask me about his skills, projects or experience!"
- Keep answers concise, friendly and professional
- Never make up information not listed below
- If you don't know something, say "I don't have that info — feel free to reach out directly at hello@mangeshbide.tech"

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

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    const isAllowedOrigin = ALLOWED_DOMAINS.some((domain) =>
      origin.startsWith(domain.replace("https://", "").replace("http://", ""))
    );

    const corsHeaders = {
      "Access-Control-Allow-Origin": isAllowedOrigin ? origin : ALLOWED_DOMAINS[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Development-only: Clear rate limit cache for testing
    if (request.method === "POST" && request.url.includes('/clear-cache')) {
      if (env.RATE_LIMIT_KV) {
        const clientIP = request.headers.get("cf-connecting-ip") || "127.0.0.1";
        const kvKey = `rl_${clientIP}`;
        await env.RATE_LIMIT_KV.delete(kvKey);
        return new Response(JSON.stringify({ message: "Cache cleared", kvKey }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ error: "KV not configured" }), { status: 500 });
    }

    // 1. CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          ...corsHeaders,
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. HTTP Method Check
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    // 3. Referer Check
    const referer = request.headers.get("Referer");
    const isAllowedReferer = ALLOWED_DOMAINS.some((domain) => referer?.startsWith(domain));
    if (!referer || !isAllowedReferer) {
      return new Response("Forbidden: Invalid Referer", { status: 403, headers: corsHeaders });
    }

    // 4. Rate Limiting (Using KV)
    // Use IP from headers (CF-Connecting-IP is standard in Cloudflare)
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const kvKey = `rl_${ip}`;
    let currentRequests = 0;
    
    if (env.RATE_LIMIT_KV) {
      const stored = await env.RATE_LIMIT_KV.get(kvKey);
      if (stored) {
        currentRequests = parseInt(stored, 10);
      }
      
      if (currentRequests >= MAX_REQUESTS_PER_HOUR) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // Increment and store with 1-hour expiration 
      await env.RATE_LIMIT_KV.put(kvKey, (currentRequests + 1).toString(), { expirationTtl: 3600 });
    }

    // 5. Input Validation
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return new Response("Invalid JSON payload", { status: 400, headers: corsHeaders });
    }

    const question = body.question;
    if (!question || typeof question !== "string") {
      return new Response("Empty or missing question", { status: 400, headers: corsHeaders });
    }
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length === 0) {
      return new Response("Question cannot be whitespace only", { status: 400, headers: corsHeaders });
    }
    if (trimmedQuestion.length > 300) {
      return new Response("Question too long (max 300 characters)", { status: 400, headers: corsHeaders });
    }

    // 6. Cloudflare Workers AI Call (Llama 3.2)
    try {
      const response = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: trimmedQuestion
          }
        ],
        max_tokens: 400,
        temperature: 0.7
      });

      const answer = response.response || "No answer generated.";

      return new Response(JSON.stringify({ result: answer }), {
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
  }
};
