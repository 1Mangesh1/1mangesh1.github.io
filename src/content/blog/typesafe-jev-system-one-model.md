---
title: "Jev Doesn't Talk, It Decides: TypeSafe's Model for Healthcare, Logistics and Your Backend"
seoTitle: "TypeSafe Jev Explained: Use Cases, Pricing, Benchmarks"
description: "TypeSafe's Jev returns decisions, not text. How it works, what it costs, which benchmark claims hold up, and use cases from healthcare triage to logistics."
pubDate: 2026-09-22T00:00:00Z
tags: ["ai", "AI Engineering", "cloudflare", "workers-ai", "typesafe"]
draft: false
---

**TL;DR:** Jev is the first model from TypeSafe AI, and it never writes a word. You give it one input and a handful of typed questions. It gives back a pick, a score or a yes/no probability for each, with confidence attached. Input costs $0.042 per million tokens and output is free. The "193.6x faster, 444.6x cheaper" headline comes from TypeSafe grading Jev against two frontier models instead of against right answers, and nobody has reproduced it. Against the cheapest Gemini model my math says Jev is about 3.5x cheaper per decision, and for a side project Gemini's free tier beats it outright. I also tried calling Jev through Cloudflare. I got a 402 before a single token ran.

This post assumes you've built on an LLM API and have written the retry loop for when the model returns "Apply" instead of "APPLY". I checked everything here on September 22, 2026, one week after launch, against TypeSafe's launch post and docs, Cloudflare's model page, Google's Gemini pricing page and the launch coverage. A one-week-old product moves fast, so check the numbers again before you quote them.

## What is Jev?

Jev is what TypeSafe calls a "System One model". The name comes from Kahneman's *Thinking, Fast and Slow*, where System 1 is fast, gut-level judgment and System 2 is slow, deliberate reasoning. [TypeSafe's docs](https://docs.typesafe.ai/concepts/system-one) define it in one sentence: "A System One model evaluates a state and returns typed answers and probabilities." It doesn't write replies, generate code or explain itself.

That's an odd thing to launch in 2026, when so many model announcements are about thinking for longer. Then I looked at Job Researcher, and its final verdict call is exactly this: a decision wearing a chat costume. Classify this ticket. Route this request. Is this job worth applying to? Forbes' write-up used an insurance underwriter asking whether a property has a history of fires. We send those to a chat model, ask for JSON, validate it and retry when it comes back wrong. Jev skips the text. You define the possible answers up front, and it can only return one of them.

TypeSafe spells it Jev, not JEV. That matters if you're searching, because JEV is also the Japanese encephalitis virus.

## Why a model is named after a coal economist

The [launch press release](https://www.morningstar.com/news/business-wire/20260915525333/typesafe-ai-emerges-from-stealth-with-40m-in-funding-with-new-model-for-composable-ai) says the name is "a nod to Jevons Paradox". In 1865, William Stanley Jevons argued in *The Coal Question* that more efficient steam engines would not reduce Britain's coal consumption. They would increase it, because cheaper power makes coal worth burning for far more jobs.

I like that they picked it, because it's more honest than most product names. The bet isn't that your decision bill goes down. The bet is that decisions get cheap enough that you automate ones you'd never have paid a model for, and the total goes up. If you're budgeting for Jev, budget for that.

## How Jev works: Choice, Score and Noul

Every question has one of three types:

| Type   | You define                              | You get back                                                  |
| ------ | --------------------------------------- | ------------------------------------------------------------- |
| Choice | Up to 255 named options, each described | The pick, a confidence, and a probability per option          |
| Score  | An ordered scale of 2 to 10 levels      | The expected level, a confidence, and a probability per level |
| Noul   | What true and false mean                | One probability, and no confidence value                      |

Jev reads the input, which TypeSafe calls the "state", once and answers every question against it in parallel. [TypeSafe's launch post](https://typesafe.ai/blog/introducing-system-one-models-and-jev) credits a new model architecture, a "parallel sampler" that emits all the output probabilities in one pass instead of generating token by token, and a training method it calls Reinforcement Learning for Calibrated Decisions (RLCD). Choice sets bigger than 255 get a two-stage treatment: score each option separately, then choose. There's no paper, model card or open weights, so that paragraph is roughly everything anyone outside the company knows about the internals.

Here's the request I sent. It's the example from [Cloudflare's model page](https://developers.cloudflare.com/ai/models/typesafe/jev/), a support ticket with one question of each type:

```python
import os

import httpx

account_id = os.environ["CF_ACCOUNT_ID"]
api_token = os.environ["CF_API_TOKEN"]

response = httpx.post(
    f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run",
    headers={"Authorization": f"Bearer {api_token}"},
    json={
        "model": "typesafe/jev",
        "input": {
            "state": "Help! My payouts have been failing for 3 days.",
            "questions": {
                "is_urgent": {
                    "type": "noul",
                    "instructions": "Does this convey urgency?",
                    "criteria": {
                        "true": "Explicitly time-sensitive",
                        "false": "No urgency expressed",
                    },
                },
                "department": {
                    "type": "choice",
                    "instructions": "Which team should handle this?",
                    "criteria": {
                        "billing": "Payments, invoicing, refunds",
                        "technical": "Bugs, outages, integrations",
                        "sales": "Pricing, upgrades, new accounts",
                    },
                },
                "frustration": {
                    "type": "score",
                    "instructions": "How frustrated is the customer?",
                    "criteria": ["Calm", "Frustrated", "Very angry"],
                },
            },
        },
    },
    timeout=60,
)
print(response.status_code, response.json())
```

Cloudflare documents the response like this. I haven't seen a successful one myself yet, for reasons you'll get to in a minute.

```json
{
  "model": "jev-1.13.0",
  "answers": {
    "is_urgent": { "type": "noul", "noul": 0.95 },
    "department": {
      "type": "choice",
      "choice": "billing",
      "confidence": 0.8,
      "probabilities": { "billing": 0.87, "sales": 0, "technical": 0.13 }
    },
    "frustration": {
      "type": "score",
      "score": 1.04,
      "confidence": 0.94,
      "legend": { "0": "Calm", "1": "Frustrated", "2": "Very angry" },
      "probabilities": { "0": 0, "1": 0.96, "2": 0.04 }
    }
  },
  "usage": { "input_tokens": 426, "output_tokens": 73 }
}
```

A few things in there are easy to misread. `score` is the expected level index, not a label. 0.96 of the probability sits on level 1 and 0.04 on level 2, so the score is 1.04: "Frustrated", leaning a hair toward "Very angry". `confidence` is not the top probability either. Billing gets 0.87, but the confidence on that pick is 0.8, so decide which number your threshold reads before you ship. And the Noul answer has no confidence at all. For yes/no questions, the probability is the only thing you can gate on.

## Type safety isn't the interesting part

TypeSafe leans hard on "can't hallucinate" and "no type errors". When I went back to my own code, I realized I already have that. [Job Researcher](/portfolio/job-researcher) passes a Pydantic model to Gemini as `response_schema` and parses the reply straight into it. The recommendation field is an enum with three values. Structured outputs got there first.

What I don't get from that call is a distribution. Gemini hands me one recommendation and a paragraph of `reasoning` defending it. If the model was torn between APPLY and CONSIDER, I never find out. It commits, then writes a confident explanation of the commitment.

Jev's response is the part I'd actually pay for: 0.87 on one option, 0.13 on another, and a confidence I can draw a line through. "Can't hallucinate" is the pitch, but the probabilities are what you're buying.

## Can you use Jev on Cloudflare Workers AI?

Partly. Cloudflare lists it as `typesafe/jev` in its [unified model catalog](https://developers.cloudflare.com/ai/models/), tagged "Third-party", with a 32,000-token context window. It isn't in the Workers AI catalog proper, and the model page doesn't show a price. That's only in the Cloudflare dashboard.

I already use Cloudflare's AI APIs for embeddings in Job Researcher and for [this site's chatbot](/blog/building-ai-chatbot-portfolio), so I pointed the same account at Jev. The request above came back in about a second with HTTP 402:

```json
{
  "errors": [
    {
      "message": "Insufficient balance; add money to your gateway or use BYOK",
      "code": 2021
    }
  ],
  "success": false,
  "result": {},
  "messages": []
}
```

The error message is better documentation than the model page. Cloudflare bills this model against a prepaid AI Gateway balance, or against your own provider key (BYOK). A Cloudflare account and an API token aren't enough on their own. If you were planning a zero-dollar weekend project on it, plan for a top-up or a TypeSafe key instead.

There's a quieter detail on that page too. Other third-party models in Cloudflare's catalog carry a "Zero data retention" tag. Jev's listing doesn't. I work on healthcare systems, and nothing with patient data goes to a third-party model until I know exactly how it handles retention. The Cloudflare page links to [TypeSafe's legal terms](https://docs.typesafe.ai/legal.md), which is where I'd start.

The other two ways in are TypeSafe's own API (`POST /v1/systemone`, model `jev-1.13.0`, in early access with a waitlist) and [OpenRouter](https://openrouter.ai/typesafe/jev-1.13), which lists it at the same price, served by TypeSafe.

## How much does Jev cost?

From [TypeSafe's models page](https://docs.typesafe.ai/models):

| Item        | Value                                                                     |
| ----------- | ------------------------------------------------------------------------- |
| Input       | $0.042 per million tokens                                                 |
| Output      | Free                                                                      |
| Rate limits | 250,000 tokens/sec and 1,200 requests/min, subject to change              |
| Context     | 64k tokens per request, 32k of it for the state plus the longest question |
| Input types | Text only                                                                 |

TypeSafe's docs say 64k of context, while Cloudflare and OpenRouter both list 32k. I'd budget for 32k until that settles.

### How much cheaper is it, really?

The 444.6x figure compares Jev to frontier models, and I wasn't going to send a classification call to a frontier model anyway. So I priced one Job Researcher-sized decision, 2,500 input tokens, against the Gemini models I'd actually reach for, using Google's [published prices](https://ai.google.dev/gemini-api/docs/pricing) as of September 21. Jev's output is free. For Gemini I assumed a 300-token JSON verdict.

| Model                   | Input / output per 1M tokens | Per decision | Per 1,000 decisions | vs Jev |
| ----------------------- | ---------------------------- | ------------ | ------------------- | ------ |
| Jev                     | $0.042 / free                | $0.000105    | $0.11               | 1x     |
| `gemini-2.5-flash-lite` | $0.10 / $0.40                | $0.00037     | $0.37               | 3.5x   |
| `gemini-3.5-flash-lite` | $0.30 / $2.50                | $0.0015      | $1.50               | 14x    |
| `gemini-3.8-flash`      | $0.75 / $3.75                | $0.003       | $3.00               | 29x    |

Those Gemini 3.8 Flash prices run through December 31, 2026, and double on January 1. Google also bills thinking tokens as output, so a Gemini call that thinks before answering pushes the gap wider than this table shows.

So the multiplier is mostly a choice of baseline. Against the model I'd actually have used, Jev is about 3.5x cheaper per decision. That's real money at a million decisions a day and a rounding error at a hundred.

Then there's the free tier. Google charges nothing for input or output on all three of those Gemini models if you're on the free tier. The catch is that free-tier content is used to improve Google's products, and the rate limits are set per project and shown only in AI Studio. I haven't found a free tier for Jev. For a hobby project where I'm fine with that trade, the cheapest decision engine I have is still Gemini's free tier. For anything with someone else's data in it, it's off the table.

## Which of TypeSafe's claims hold up?

| Claim                                              | Where it appears     | What I found                                                                                                                                                                                    |
| -------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 193.6x faster, 444.6x cheaper                      | typesafe.ai homepage | From TypeSafe's in-house "workflow evals", graded against the averaged answers of GPT-6 Astra and Fable 5.1, not known-correct answers. No public benchmark results.                            |
| 40x to 200x faster, 70 to 500 ms end to end        | Launch post          | Same company, different numbers.                                                                                                                                                                |
| Under 100 ms, "up to 100 times" faster and cheaper | Press release        | A third set of numbers.                                                                                                                                                                         |
| Can't hallucinate, no type errors                  | Launch post          | True in a narrow sense: the output always fits the schema you defined. That says nothing about whether the answer is right, and TypeSafe itself says the 0% type-error figure wasn't measured. |
| Calibrated probabilities                           | Docs                 | Calibration is claimed across groups of predictions, not per answer, and the calibration pages show no measurements.                                                                            |
| CEO is a "co-inventor of RLHF"                     | Press release        | Diogo Almeida co-authored [InstructGPT](https://arxiv.org/abs/2203.02155). He isn't an author on the [2017 paper](https://arxiv.org/abs/1706.03741) usually credited with introducing RLHF.     |

The benchmark row is the one I keep coming back to. Grading a model against the average of two other models measures agreement with those models. When both of them are wrong on a case, Jev scores a point for being wrong alongside them. As an internal regression test that's fine. As the number on your homepage, it's weak, and publishing three different speedups on three launch channels in the same week doesn't help.

The company side checks out. TypeSafe AI is a San Francisco lab founded in 2024 by Diogo Almeida (CEO), Erik Gafni (CTO) and Sasha Sheng (COO). It came out of stealth with a seed round of about $40M led by DCVC, which [DCVC announced itself](https://www.dcvc.com/news-insights/typesafe-emerges-from-stealth-with-a-new-way-of-doing-ai) and [SiliconANGLE](https://siliconangle.com/2026/09/16/typesafe-ai-exits-stealth-with-40m-to-build-ai-for-use-by-software/) reported. The $200M valuation in Forbes' headline rests on one unnamed source.

Most launch coverage rewrites TypeSafe's own material. SiliconANGLE is one of the few pieces that calls the performance numbers unverified. I found a couple of small independent tests pointing the same way, faster and cheaper by much smaller margins, but I couldn't check them directly, so I'm not quoting them.

## Where I'd use it, and where I wouldn't

A lot of my work is authorization: SpiceDB, Keycloak, permission models that have to give the same answer every time for the same inputs. That makes one line very easy to draw. Jev should never make an access decision. A permission check is a deterministic function of relationships you can audit afterwards. "0.93 probability this user can view this record" isn't a permission. It's an incident report waiting for a date.

The second line is fuzzier. If a person is on the other end of the decision and can reasonably ask why, "the model was 0.91 confident" is a bad answer. The underwriting example from Forbes sits right on that line, and I'd want a human signing off on anything that denies someone something.

What's left is the layer in front of the deterministic one, and it's bigger than it sounds. Which queue does this ticket belong in? Does this inbound PDF look like an invoice? Is this job posting worth ten minutes of my evening? Being wrong there is cheap, someone can catch it, and I'd happily trade a paragraph of chat-model prose for a probability and a smaller bill.

The confidence threshold is the part I find most interesting as an engineer. It turns "should the model decide this?" into a number you pick per decision, with an explicit fallback when the model isn't sure. Automate above the line, escalate below it, log which path ran. That's the shape of a policy, and I write a lot of those.

## Jev use cases: healthcare, logistics, finance and more

None of these are things I've run. They're how I'd set Jev up for problems I've seen, written down so you can steal the question design.

### Healthcare: triaging patient portal messages

A clinic's portal inbox mixes refill requests, rescheduling, billing questions and the occasional message that should have been a phone call. Two questions cover it: where does this go, and does it mention symptoms that can't wait?

```python
questions = {
    "urgent_symptoms": {
        "type": "noul",
        "instructions": "Does the message describe symptoms that may need same-day clinical attention?",
        "criteria": {
            "true": "Describes new, worsening or severe symptoms",
            "false": "No symptoms, or only stable ones already being managed",
        },
    },
    "queue": {
        "type": "choice",
        "instructions": "Which team should handle this message?",
        "criteria": {
            "scheduling": "Booking, rescheduling or cancelling appointments",
            "refills": "Prescription refill requests",
            "billing": "Bills, insurance and payments",
            "clinical": "Questions for a nurse or provider",
        },
    },
}

URGENT_ESCALATE_AT = 0.2  # low on purpose: a missed emergency costs far more than a false alarm
ROUTE_CONFIDENCE = 0.75


def triage(answers: dict) -> str:
    if answers["urgent_symptoms"]["noul"] >= URGENT_ESCALATE_AT:
        return "nurse_now"
    queue = answers["queue"]
    if queue["confidence"] >= ROUTE_CONFIDENCE:
        return queue["choice"]
    return "front_desk_review"
```

The interesting line is the 0.2. Thresholds don't have to be symmetric. A refill request routed to billing costs someone a minute. A chest-pain message sitting in the refill queue until Monday is a different category of mistake, so the urgent check escalates at a probability most people would call "probably not". Portals already tell patients not to use messages for emergencies. This is a backstop for when they do anyway.

The obvious catch: these messages are patient data. Under HIPAA, a vendor that handles it for you needs a business associate agreement, and I haven't checked whether TypeSafe signs one. Until that's settled, this design belongs on synthetic data.

### Healthcare: sorting incoming documents

Referrals, lab results, imaging reports and prior-auth paperwork still arrive at a lot of clinics as faxes and PDFs, and someone files each one by hand. A single Choice over document type, with a confidence gate that drops anything uncertain into the manual pile, takes the easy ones off someone's desk without letting the model near a clinical decision. Same data caveat as above.

The one healthcare use I'd skip is the most tempting: asking a model whether a log line contains patient identifiers. I've built [a PHI detector](/portfolio/hipaa-guardian), and the problem with outsourcing that check is right there in the request body. To ask a third party whether the log line contains PHI, you have to send it the log line.

### Logistics: shipment exceptions

Every carrier feed produces exceptions: a missed scan, a customs hold, an address the driver couldn't find. Somebody on the ops team reads the tracking events and the driver's note and decides what happens next. That read is three questions against one state:

```python
questions = {
    "cause": {
        "type": "choice",
        "instructions": "What is the most likely cause of this delivery exception?",
        "criteria": {
            "address": "Wrong, incomplete or undeliverable address",
            "customs": "Held for customs documents or duties",
            "damage": "Package damaged in transit",
            "carrier": "Missed scan, missed pickup or carrier capacity",
            "weather": "Weather or road closure",
            "recipient": "Recipient unavailable or refused delivery",
        },
    },
    "notify_customer": {
        "type": "noul",
        "instructions": "Should the customer hear about this before they ask?",
        "criteria": {
            "true": "The delivery date will slip or the customer needs to act",
            "false": "An internal hiccup that won't change the delivery date",
        },
    },
    "delay_risk": {
        "type": "score",
        "instructions": "How likely is this shipment to miss its promised date?",
        "criteria": ["On track", "At risk", "Will miss", "Needs a reship"],
    },
}
```

The state is the tracking events, the driver's note and the promised date. When `cause` comes back confident, the matching playbook runs on its own: an address-fix link to the customer, a documents request to the broker. Everything else lands in the ops queue already sorted by `delay_risk`, which is most of the value even when nothing gets automated.

Two constraints show up fast in logistics. Jev reads text only, so a driver's photo of a crushed box needs a vision model (Gemini accepts images) to describe it first, and Jev decides on the description. And customs classification runs straight into the 255-option limit. The top levels of the Harmonized System fit inside a single Choice; the thousands of six-digit codes don't. You'd walk the hierarchy one level per call, and a licensed broker still signs off, because a wrong code means wrong duties.

### Other places it fits

| Use case                        | State                                                 | Questions                                                              | Escalate when                                                             |
| ------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| On-call alert triage            | The alert payload plus the last few log lines         | Score: severity, 4 levels. Noul: looks like a known flaky alert?       | Severity confidence is low, or the top level has any real probability     |
| Guestbook or comment moderation | One anonymous post                                    | Noul: spam. Noul: abusive.                                             | Either probability lands between 0.1 and 0.9; below or above is automatic |
| Chatbot pre-filter              | The visitor's question                                | Choice: about me, about a project, off-topic, abuse                    | Confidence is low, in which case the question goes to the LLM as usual    |
| Access-request review queue     | The request, the requester's current roles, the resource | Score: risk, 3 levels. Choice: which team owns the resource          | Always. Jev orders the queue and picks the reviewer; a human grants       |
| Invoice intake                  | Text extracted from the PDF plus the matching PO      | Choice: document type. Noul: amount matches the PO?                    | Type confidence is low, or the match probability is under 0.9             |
| Expense categorization          | Merchant name, amount and memo                        | Choice: category, as long as your list stays under 255 options         | Confidence is low; ask the user once and remember the answer              |
| Contract review                 | One contract section at a time, to stay under 32k     | Several Nouls in one call: auto-renewal? uncapped liability? termination for convenience? | Any of them goes above 0.3, and a lawyer reads that section |
| Phishing triage                 | Email headers and body                                | Noul: phishing. Choice: impersonation, credential harvest, invoice fraud, other | Phishing probability lands between 0.1 and 0.9                   |
| E-commerce returns              | The customer's return reason plus the order           | Choice: size, damaged, not as described, changed mind. Noul: possible abuse? | Abuse probability passes 0.5, and a human reviews it; never an auto-deny |
| Voice agent intent              | The caller's latest turn plus the conversation so far | Choice: which tool to call next                                        | Confidence is low, so the agent asks a clarifying question instead        |

The moderation row uses a pattern that works for any Noul question: two thresholds instead of one. Auto-approve below 0.1, auto-reject above 0.9, and a human sees the middle. My [guestbook](/blog/building-a-retro-guestbook-with-astro-and-google-sheets) has no login, and every entry lands as a draft until I approve it by hand in Google Sheets. Two Noul questions with that double threshold would leave me only the ones in the middle.

The access-request row is the authorization rule from the previous section in practice. Jev can decide which request a reviewer sees first. It never decides the answer.

The voice row is where TypeSafe's latency claims would finally matter. A caller notices a half-second pause in a way a ticket queue never does, and after building [a voice agent](/portfolio/voice-agent), I'd measure that myself before trusting any of the three numbers from launch week.

## Designing the questions for Job Researcher v2

Here's what I'm going to send Jev once the 402 clears. The criteria are copied almost word for word from the system prompt Job Researcher already gives Gemini, which was a nice surprise: the guidelines I wrote for an LLM translate directly into Jev's options.

```python
questions = {
    "recommendation": {
        "type": "choice",
        "instructions": "Should the candidate apply for this job?",
        "criteria": {
            "APPLY": "Strong or moderate match with closeable gaps",
            "CONSIDER": "Moderate match, gaps are significant but role is interesting",
            "SKIP": "Weak match or deal-breaker gaps",
        },
    },
    "fit": {
        "type": "score",
        "instructions": "How well does the resume match the job's core requirements?",
        "criteria": [
            "Fundamentally different skill set",
            "Few matching skills, significant gaps",
            "Some alignment but notable gaps in key areas",
            "Core requirements align well, gaps are minor or learnable",
            "Core requirements align with no meaningful gaps",
        ],
    },
}
```

The state is the parsed job description, the company research, the GitHub scan and the resume-match summary, the same inputs Gemini gets today. The fit score maps onto the existing 0 to 100 match score with `round(score / 4 * 100)`, so a score of 2.8 becomes 70, which is exactly where "strong match" starts in the old prompt.

That mapping is the change I like most. Today, the 0 to 100 match score is a number Gemini makes up to fit bands I described in prose. With Jev it becomes a probability-weighted position on a scale I defined, and the API response doesn't change shape at all.

## What I still don't know

- Are the probabilities calibrated against right answers? TypeSafe's evals compare Jev to other models. I want a Brier score or a calibration curve on a public labeled dataset.
- How is this different from a classifier head, a reranker, or asking a normal LLM for the probability of each fixed option? With no paper or model card, "new architecture" is a claim I can't evaluate.
- What happens to my inputs? The Cloudflare listing has no zero-retention tag, and I haven't read TypeSafe's terms closely yet.
- Is $0.042 with free output the real price, or the launch price?

## What I'm building with it

Job Researcher currently asks Gemini for the whole verdict in one call with thinking turned on: APPLY, CONSIDER or SKIP, a match score, strengths, gaps and reasoning. v2 splits it:

1. Jev answers the two questions above.
2. Gemini writes the strengths, gaps and reasoning for a decision that's already made, instead of making it.
3. If Jev's confidence on the recommendation drops below a threshold, or the call fails, the existing Gemini path runs unchanged, and the response records which path it took.

Then comes the part nobody has published yet. I'll run about twenty postings I've already judged myself through both versions and compare agreement, latency and cost. Twenty samples won't prove calibration. They are real measurements against answers I trust, which is more than the launch numbers can say.

It's waiting on that 402. When it runs, the numbers go here.

## Further reading

- [Introducing System One models and Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), TypeSafe's launch post
- [System One concepts](https://docs.typesafe.ai/concepts/system-one) and [models, pricing and limits](https://docs.typesafe.ai/models) in TypeSafe's docs
- [Jev on Cloudflare](https://developers.cloudflare.com/ai/models/typesafe/jev/), with Workers binding and REST examples
- [Jev on OpenRouter](https://openrouter.ai/typesafe/jev-1.13)
- [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing), for your own version of the cost table
- [SiliconANGLE's launch coverage](https://siliconangle.com/2026/09/16/typesafe-ai-exits-stealth-with-40m-to-build-ai-for-use-by-software/), one of the few that flags the numbers as unverified
