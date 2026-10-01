// Asks the chatbot fixed questions and fails on an invented site link, a stale
// fact, or a missing expected one. Run after each worker deploy:
//   yarn chat:eval [worker-url]
// A run spends 9 of the 40 messages/hour the worker allows per IP, and the
// exchanges are logged to the chat D1 table under a "chat-eval-" session id.
import { isKnownSiteLink } from "../src/utils/chat-markdown.ts";

const WORKER = process.argv[2] ?? "https://portfolio-ai-proxy.mangeshbide1.workers.dev";
const SITE = "https://mangeshbide.tech";

const cases = [
  { q: "Where does he work and what's his title?", expect: [/House Works Technology/i] },
  { q: "Has he written anything about Keycloak or SpiceDB?", expect: [] },
  { q: "Does he know Kubernetes?", expect: [/k3s/i] },
  { q: "What is Fieldnotes and where can I try it?", expect: [/fieldnotes\.mangeshbide\.tech/i] },
  { q: "What did he do at Procedure Technologies, and when?", expect: [/Oct(ober)? 2024/i] },
  { q: "Which of his blog posts should I read first?", expect: [/mangeshbide\.tech\/blog\//i] },
  { q: "Tell me about Mira.", expect: [/Mira/] },
  { q: "Is he open to work? How do I reach him?", expect: [/hello@mangeshbide\.tech/i] },
  // Not on the resume: only answerable from the site index the worker loads.
  { q: "What is DocTalk?", expect: [/mangeshbide\.tech\/portfolio\/doctalk/i] },
];
// Case-sensitive: the retired spellings were capitalised; slugs like /portfolio/crimiface are fine.
const stale = [/Houseworks/, /CrimiFace/, /Backend \/ Platform/, /4 companies/, /TODO/];

const sitemap = await fetch(`${SITE}/sitemap-0.xml`).then((r) => r.text());
const sitePaths = new Set([
  ...[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname),
  "/Resume.pdf", "/llms.txt", "/rss.xml",
]);

const session = `chat-eval-${Date.now()}`;
let failures = 0;
for (const { q, expect } of cases) {
  const res = await fetch(WORKER, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Origin: SITE, Referer: `${SITE}/` },
    body: JSON.stringify({ question: q, sessionId: session, history: [] }),
  });
  if (!res.ok) throw new Error(`${q}: HTTP ${res.status} ${await res.text()}`);
  const answer = (await res.json()).result ?? "";

  const links = [...answer.matchAll(/https?:\/\/(?:www\.)?mangeshbide\.tech[^\s)\]>"'`]*/gi)]
    .map((m) => m[0].replace(/[.,;:!?]+$/, ""));
  const problems = [
    ...links.filter((l) => !isKnownSiteLink(l, sitePaths)).map((l) => `invented link ${l}`),
    ...stale.filter((re) => re.test(answer)).map((re) => `stale fact ${re}`),
    ...expect.filter((re) => !re.test(answer)).map((re) => `missing ${re}`),
  ];
  failures += problems.length > 0 ? 1 : 0;
  console.log(`${problems.length ? "FAIL" : "ok  "} ${q}`);
  for (const p of problems) console.log(`     - ${p}`);
  if (problems.length) console.log(`     answer: ${answer.replace(/\s+/g, " ").slice(0, 400)}`);
}
console.log(`\n${cases.length - failures}/${cases.length} passed`);
process.exit(failures ? 1 : 0);
