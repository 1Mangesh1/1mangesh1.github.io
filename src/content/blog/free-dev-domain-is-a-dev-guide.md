---
title: "Get a Free .dev Domain for Your Portfolio: The Complete is-a-dev/register Guide"
description: "Learn how to claim your free .is-a.dev subdomain in 5 minutes. Perfect for portfolios, blogs, and personal projects. No credit card required, powered by Cloudflare."
pubDate: 2026-02-07T00:00:00Z
tags: ["Domain", "Free Tools", "Developer Tools", "GitHub", "Portfolio", "Web Development", "Career"]
draft: false
---

Want a professional `.dev` domain for your portfolio but don't want to pay $12+ per year? There's a free, community-driven solution that's already trusted by thousands of developers: **is-a-dev**.

This guide walks you through claiming your free `.is-a.dev` subdomain in under 5 minutes. No credit card, no hidden fees, no maintenance costs.

---

## Why You Need a Custom Domain for Your Developer Portfolio

Before jumping into the how-to, let's talk about the why.

Generic URLs like `github.com/yourname` or `yourname.github.io` work, but a custom domain projects professionalism:

| Domain Type | Perception | SEO | Credibility |
|---|---|---|---|
| github.io | Technical, but plain | Limited | Medium |
| free .is-a.dev | Professional + shows dev savvy | Good | High |
| Paid .dev domain | Enterprise-level | Excellent | Excellent |

**The real talk:** Hiring managers spend 30 seconds on your portfolio. A custom domain signals you care about first impressions.

Plus, is-a-dev is backed by **Cloudflare's Project Alexandria**—a sponsorship program supporting open-source projects. Your domain is powered by enterprise-grade infrastructure at zero cost.

---

## What is is-a-dev (And Why It's Actually Free)

[is-a-dev](https://is-a.dev) is an open-source service that distributes free `.is-a.dev` subdomains to developers. That means you get:

✅ **Your custom domain** (e.g., `yourname.is-a.dev` or `portfolio.is-a.dev`)  
✅ **Full DNS control** for pointing to your website  
✅ **HTTPS support** out of the box  
✅ **GitHub Pages compatible** for friction-free hosting  
✅ **Active community** with 5,000+ contributors and 9,500+ stars  

The project is **completely free because:**
1. It's open-source and community-maintained
2. Cloudflare sponsors the DNS infrastructure
3. No ads, no data-harvesting, no startup greed

---

## How to Register Your .is-a.dev Subdomain (Step-by-Step)

### Prerequisites
- GitHub account (free)
- A website or GitHub Pages project to point your domain at
- 5 minutes

### Step 1: Check Your Subdomain Availability

Head to [is-a.dev](https://is-a.dev) and use their subdomain checker to verify your desired name is available.

**Tips for choosing:**
- Keep it memorable (your name or a cool project name)
- Avoid reserved keywords (the repo has a block list)
- Examples: `john.is-a.dev`, `myportfolio.is-a.dev`, `project.is-a.dev`

### Step 2: Fork the Repository

Go to [github.com/is-a-dev/register](https://github.com/is-a-dev/register) and fork the repository.

```
1. Click the "Fork" button (top-right)
2. This creates your own copy of the project
```

### Step 3: Create Your Domain Configuration File

In your forked repo, navigate to the `/domains` folder and create a new file:

**File name:** `yourname.json`  
**Location:** `/domains/yourname.json`

**Example configuration for GitHub Pages:**

```json
{
  "owner": {
    "email": "your.email@example.com",
    "username": "yourgithubusername"
  },
  "repo": "github.io",
  "nameserver": "dns.github.com"
}
```

**Example configuration for custom hosting (Cloudflare, Vercel, etc.):**

```json
{
  "owner": {
    "email": "your.email@example.com",
    "username": "yourgithubusername"
  },
  "record": {
    "type": "CNAME",
    "value": "yourdomain.com"
  }
}
```

### Step 4: Submit a Pull Request

1. Commit your changes: `git add domains/yourname.json`
2. Write a clear commit message
3. Push to your fork
4. Create a pull request to the main repository
5. Fill in the PR template with your information

### Step 5: Wait for Approval & Go Live

The maintainers review PRs regularly. Within hours to a few days:
- Your PR gets reviewed
- If everything checks out, it's merged
- Your DNS records propagate (usually within 5-15 minutes)
- Your site is live at `yourname.is-a.dev`

---

## ⚡ Automate It with AI (2-Minute Version)

Don't want to do this manually? Copy the prompt below and paste it into Claude, ChatGPT, or any AI agent. It will guide you through the entire process and generate your JSON file.

### Copy This Prompt

```
I want to register a free .is-a.dev subdomain for my developer portfolio. 
Help me through the process:

My details:
- GitHub username: [YOUR_GITHUB_USERNAME]
- Email: [YOUR_EMAIL]
- Desired subdomain: [YOUR_SUBDOMAIN] (e.g., john, portfolio, myblog)
- Hosting type: GitHub Pages

Please help me:
1. Check if the subdomain is available (suggest alternatives if taken)
2. Generate the exact JSON configuration file I need to create
3. Walk me through forking the repository
4. Create the domain file content I should use
5. Explain what to write in my pull request
6. Tell me what to expect after submission

Make it super simple and copy-paste ready.
```

### How to Use It

**Option 1: Use Claude (Recommended)**
1. Go to [claude.ai](https://claude.ai)
2. Paste the prompt above (fill in your details)
3. Claude will generate your exact JSON file
4. Claude will guide you through each step
5. Copy the JSON directly from Claude into your GitHub file

**Option 2: Use ChatGPT**
1. Go to [chat.openai.com](https://chat.openai.com)
2. Paste the prompt (fill in your details)
3. Follow the step-by-step instructions GPT provides
4. Copy the JSON configuration it generates

**Option 3: Use Any AI Assistant**
The prompt works with Gemini, Copilot, or any LLM. The AI will:
- Generate your exact configuration file
- Tell you exactly what to write in your PR
- Handle all the formatting details
- Say when DNS propagation completes

### What the AI Will Do For You

✅ Generate your valid JSON configuration  
✅ Suggest alternative subdomains if yours is taken  
✅ Write the pull request description  
✅ Explain GitHub forking (if you're new)  
✅ Tell you what to expect next  
✅ Provide DNS propagation timeline  

**Time saved:** ~20 minutes → ~2 minutes

---

## Real-World Use Cases

### Portfolio Site
Host your resume, projects, and blog at `yourportfolio.is-a.dev`. Companies searching for you will find a professional online presence.

### Project Showcase
Running a side project? Get `projectname.is-a.dev` as a memorable URL for documentation and demos.

### Blog
Quick blog launch? Point `blog.is-a.dev` to a GitHub Pages or static site. No hosting costs, no infrastructure headaches.

### API Documentation
Build developer tools? Host docs at `docs.yourname.is-a.dev` with custom branding.

---

## Important Things to Know

### ✅ Allowed Uses
- Personal portfolios and dev blogs
- GitHub Pages hosting
- Static site hosting (Vercel, Netlify, etc.)
- Personal projects and documentation

### ❌ Prohibited Uses
- Commercial/business websites (see Terms of Service)
- Political campaigns
- Abusive or policy-breaking content
- Redirects to external unrelated sites

### 🔒 Reliability & Uptime
- Powered by Cloudflare (99.9%+ uptime SLA)
- Active community maintenance
- No forced ads or degradation
- Free forever (or until you decide otherwise)

**What if the service shuts down?** The project is sustainable and community-backed, but if you're paranoid, keep a paid backup domain. (Though this seems unlikely given Cloudflare's support.)

---

## Troubleshooting Common Issues

### "My Domain Still Shows 404"
**Fix:** DNS propagation takes 5-15 minutes. Clear your browser cache or wait 10 minutes and try again.

### "My PR Was Rejected"
**Reason:** Check the error message. Common issues:
- Formatting errors in JSON (validate with a JSON tool)
- Subdomain already taken
- Using reserved keywords
- Email/username mismatch with your GitHub account

**Fix:** Read the feedback, correct your `domains/yourname.json` file, and push the changes to your PR. It auto-updates.

### "Wrong DNS Records"
**Fix:** The service uses DNSSEC validation. Verify:
1. Your JSON syntax is exactly correct
2. Your target domain accepts the record type (CNAME vs A record)
3. Cloudflare is actually processing the DNS (check DNS propagation tools)

---

## SEO & Marketing Benefits

While is-a-dev won't magically rank your site, it unlocks real advantages:

**Search Rankings:**
- `.dev` domains get slight SEO boost (premium gTLD)
- Custom domain > generic subdomain for SERP credibility
- Easier to optimize for branded searches

**Personal Branding:**
- Memorable URL = higher CTR from job searches
- Shareable for social media bios
- Professional signal to recruiters

**Network Effects:**
- Join 5,000+ developer community
- Potentially get featured in open-source showcases
- Build portfolio in visible ecosystem

---

## Comparison: is-a-dev vs Other Options

| Option | Cost | Setup | Maintenance | Custom Domain | Recommendation |
|--------|------|-------|-------------|---------------|---|
| **is-a-dev** | Free forever | 5 mins | None | .is-a.dev | ⭐ Best for devs with GitHub Pages |
| GitHub Pages (default) | Free | 5 mins | None | .github.io | Good, but less memorable |
| Paid .dev domain | $12-15/year | 5 mins | Annual renewal | Yours | Best if you need ultimate control |
| Vercel/Netlify domains | Free/Paid | 10-20 mins | Domain renewal | Yours | Overkill for portfolio |
| Shared hosting + domain | $2-10/month | 30 mins | Monthly billing + upkeep | Yours | Pain. Just use GitHub Pages. |

**Bottom line:** If you're hosting on GitHub Pages or a static site, is-a-dev is literally the best choice.

---

## Key Takeaways

1. **Get a free .is-a.dev domain** in 5 minutes with no credit card
2. **Perfect for portfolios** that need a memorable, professional URL
3. **Backed by Cloudflare** for enterprise-grade reliability
4. **Community-driven** with 5,000+ contributors ensuring long-term viability
5. **Works seamlessly** with GitHub Pages, Vercel, Netlify, and more

**Next steps:**
1. Visit [is-a.dev](https://is-a.dev) and check availability
2. Fork [github.com/is-a-dev/register](https://github.com/is-a-dev/register)
3. Create your domain file and open a PR
4. Wait for approval (usually same day)
5. Update your portfolio link everywhere

Your future employer will appreciate the attention to detail. Plus, you can always upgrade to a paid domain later if your project takes off.

---

## Resources

- **Official Site:** [is-a.dev](https://is-a.dev)
- **GitHub Repo:** [is-a-dev/register](https://github.com/is-a-dev/register)
- **Documentation:** [docs.is-a.dev](https://docs.is-a.dev/)
- **Discord Community:** [Join the Discord](https://discord.gg/is-a-dev-830872854677422150)
- **Blog Post Reference:** [William Harrison's walkthrough](https://blog.wharrison.com.au/2024/07/is-a-dev/)

**Found this helpful?** Share it with someone building their portfolio. Spread the word about free, ethical dev infrastructure. 🚀
