// Fails the build when a bullet in src/data/resume.json is missing from
// public/Resume.pdf, so the web resume and the downloadable one cannot diverge.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const PDF = "public/Resume.pdf";
const resume = JSON.parse(readFileSync("src/data/resume.json", "utf8"));

if (!existsSync(PDF)) {
  console.warn(`resume-sync: ${PDF} missing, skipped`);
  process.exit(0);
}

let text;
try {
  text = execFileSync("pdftotext", [PDF, "-"], { encoding: "utf8" });
} catch (err) {
  if (err.code !== "ENOENT") throw err;
  console.warn("resume-sync: pdftotext not installed, skipped");
  process.exit(0);
}

// LaTeX hyphenates across lines, uses ligatures and swaps ~ for ∼, so compare
// letters and digits only.
const norm = (s) => s.normalize("NFKC").toLowerCase().replace(/[^a-z0-9]/g, "");
const pdf = norm(text);
const bullets = [...resume.experience, ...resume.projects]
  .flatMap((entry) => entry.bullets)
  .filter((b) => !b.includes("TODO(mangesh)"));
const missing = bullets.filter((b) => !pdf.includes(norm(b)));

if (missing.length > 0) {
  console.error(`resume-sync: ${missing.length} bullet(s) in src/data/resume.json are not in ${PDF}:`);
  for (const b of missing) console.error(`  - ${b}`);
  process.exit(1);
}
console.log(`resume-sync: OK (${bullets.length} bullets)`);
