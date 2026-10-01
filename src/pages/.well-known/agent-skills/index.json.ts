import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

// Agent Skills discovery index (v0.2.0). The digest must match the bytes Pages
// serves for SKILL.md, so it is hashed from the file at build time.
const SKILL_URL = "/.well-known/agent-skills/mangeshbide-site/SKILL.md";

export function GET() {
  const skill = readFileSync(`public${SKILL_URL}`);
  const description = skill.toString("utf8").match(/^description: (.+)$/m)?.[1];
  if (!description) throw new Error(`${SKILL_URL} has no description in its frontmatter`);
  return Response.json({
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "mangeshbide-site",
        type: "skill-md",
        description,
        url: SKILL_URL,
        digest: `sha256:${createHash("sha256").update(skill).digest("hex")}`,
      },
    ],
  });
}
