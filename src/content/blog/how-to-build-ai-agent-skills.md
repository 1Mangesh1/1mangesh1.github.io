---
title: "The Complete Guide to Building AI Agent Skills: From Zero to Production"
description: "Master AI agent skills for Claude and other models. Learn to build, structure, test, and deploy reusable skills that scale. Complete guide with templates and best practices."
pubDate: 2026-02-07T00:00:00Z
tags: ["AI Agents", "Claude", "Agent Skills", "AI Automation", "Developer Tools", "AI Engineering", "Prompt Engineering", "Workflow Automation"]
draft: false
---

Here's the reality: **prompts are instructions. Skills are superpowers.**

For the past 18 months, I've watched teams build sophisticated AI systems using the old way:
- Copy-paste long instructions into every prompt
- Maintain 5 different versions of the same workflow
- Watch consistency break as instructions drift
- Rebuild the same logic for different AI models
- Spend more time managing prompts than solving problems

Then they discovered **AI Skills**.

Everything changed.

Instead of repeating instructions → they reference a skill.
Instead of hoping AI remembers context → it loads exactly what it needs.
Instead of managing chaos → they built systems that scale.

This guide shows you *exactly* how to build AI skills that work. Not theoretical. Not complex. **Real skills you can deploy today.**

---

## What Is an AI Skill? (The Real Definition)

An **AI Skill** is a standalone, reusable package that teaches an AI agent how to do a specific job.

**That's it.**

But the power is *massive*.

| Prompt | Skill |
|--------|-------|
| Lives inside the chat | Lives outside the chat |
| Written fresh each time | Written once, loaded when needed |
| Prone to drift and inconsistency | Consistent across all uses |
| Hard to version or update | Easy to version and improve |
| Isolated to one conversation | Works across agents, models, teams |
| Gets lost in chat history | Persists and compounds knowledge |

**Example contrast:**

```
# OLD WAY (Prompt Engineering)
"Hey Claude, I need you to:
1. Read this code
2. Find security issues
3. Suggest fixes
4. Explain the risk
5. Rate severity
6. Reference OWASP...
[100 more lines of instructions]"

# NEW WAY (AI Skill)
"Use the SecurityAudit skill to review this code."
[Skill automatically handles all of the above]
```

See the difference? One is asking. One is delegating to a trained system.

---

## The Anatomy of a Perfect AI Skill

Every powerful skill follows this structure:

```
my-skill/
├── SKILL.md              # ⭐ The brain of your skill
├── instructions/         # Step-by-step how-to
├── scripts/              # Executable code (optional)
├── templates/            # Resources the skill uses
├── tests/                # Validation (optional but crucial)
└── examples/             # Real use cases
```

Let's break down each component:

### 1. SKILL.md (The Skill Definition)

This is **the most important file**. It's a manifest + documentation combined.

```markdown
# Security Audit Skill

## What This Skill Does
Scans code for security vulnerabilities using OWASP standards.
Returns risk assessment and remediation steps.

## When to Use It
- Code review automation
- Pre-deployment security checks
- Security training for junior devs
- Vulnerability tracking

## What It Needs
- Source code (any language)
- Optional: severity threshold
- Optional: custom security rules

## What You Get Back
- Vulnerability list with CVSS scores
- Fix recommendations
- Affected lines and patterns
- Risk level (Low/Medium/High/Critical)

## How It Works
1. Parses code structure
2. Matches against security patterns
3. Assigns risk levels
4. Generates fixes
5. Returns structured JSON

## Who Maintains It
@yourusername
Version: 2.1.0
Last Updated: 2026-02-07

## Dependencies
- regex engine
- OWASP knowledge base
- Common Weakness Enumeration (CWE)
```

**Key principle:** SKILL.md answers "What does this do?" without any technical jargon.

### 2. Instructions (The Detailed How-To)

```markdown
# Security Audit Skill - Detailed Instructions

## Process Overview
The skill follows a 5-step process:

### Step 1: Code Parsing
- Identify programming language
- Extract function definitions
- Build abstract syntax tree (AST)
- Flag suspicious patterns

### Step 2: Pattern Matching
For each language, match against known vulnerabilities:

**Python patterns:**
- `eval()` usage
- SQL injection via string concatenation
- Hardcoded credentials
- Insecure pickle usage

**JavaScript patterns:**
- DOM manipulation without sanitization
- Missing CORS headers
- Hardcoded API keys
- Unvalidated redirect destinations

### Step 3: Risk Assessment
Assign CVSS score based on:
- Exploitability (Easy/Medium/Hard)
- Impact (Low/High/Critical)
- Affected scope (Local/Network)

### Step 4: Generate Recommendations
For each vulnerability:
- What the issue is
- Why it matters
- How to fix it (with code example)
- Additional resources

### Step 5: Prepare Output
Return structured JSON:
```json
{
  "skill": "SecurityAudit",
  "status": "complete",
  "code_analyzed": 1250,
  "vulnerabilities_found": 3,
  "risk_level": "HIGH",
  "issues": [
    {
      "id": "SQL-001",
      "name": "SQL Injection",
      "severity": "CRITICAL",
      "file": "src/auth.py",
      "line": 42,
      "pattern": "f\"SELECT * FROM users WHERE id={user_id}\"",
      "fix": "Use parameterized queries: cursor.execute('SELECT * FROM users WHERE id=?', (user_id,))",
      "owasp_reference": "A03:2021 Injection",
      "cvss_score": 9.8
    }
  ]
}
```

## Performance Considerations
- Large files (>10,000 lines) may take longer
- Complex patterns require more processing
- Cache results for repeated scans

## Error Handling
If code can't be parsed:
- Return error code with explanation
- Suggest alternative formats
- Skip problematic sections (don't fail completely)
```

**Key principle:** Instructions are detailed enough that another developer could implement this skill from scratch.

### 3. Scripts (The Executable Code)

These are the *programs* your skill actually runs:

```python
# scripts/security_audit.py

import re
import json
from typing import Dict, List, Optional
from enum import Enum

class SeverityLevel(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

class SecurityAuditor:
    """Main class that performs security audits"""
    
    def __init__(self, code: str, language: str = "auto"):
        self.code = code
        self.language = self._detect_language() if language == "auto" else language
        self.vulnerabilities = []
        self.patterns = self._load_patterns()
    
    def audit(self) -> Dict:
        """Run the full audit"""
        self._detect_vulnerabilities()
        self._assess_risk()
        return self._format_results()
    
    def _detect_vulnerabilities(self):
        """Scan code against known patterns"""
        for pattern_name, pattern_regex in self.patterns[self.language].items():
            matches = re.finditer(pattern_regex, self.code)
            
            for match in matches:
                line_num = self.code[:match.start()].count('\n') + 1
                self.vulnerabilities.append({
                    "type": pattern_name,
                    "match": match.group(0),
                    "line": line_num,
                    "column": match.start() - self.code.rfind('\n', 0, match.start())
                })
    
    def _assess_risk(self):
        """Calculate CVSS scores and risk levels"""
        risk_map = {
            "SQL_INJECTION": {"severity": SeverityLevel.CRITICAL, "cvss": 9.8},
            "HARDCODED_SECRET": {"severity": SeverityLevel.CRITICAL, "cvss": 9.1},
            "EVAL_USAGE": {"severity": SeverityLevel.HIGH, "cvss": 8.2},
            "XXE_INJECTION": {"severity": SeverityLevel.HIGH, "cvss": 8.8},
            "CSRF_MISSING": {"severity": SeverityLevel.MEDIUM, "cvss": 6.5},
        }
        
        for vuln in self.vulnerabilities:
            if vuln["type"] in risk_map:
                vuln.update(risk_map[vuln["type"]])
    
    def _format_results(self) -> Dict:
        """Return structured results"""
        return {
            "skill": "SecurityAudit",
            "status": "complete",
            "language": self.language,
            "lines_analyzed": len(self.code.split('\n')),
            "vulnerabilities_found": len(self.vulnerabilities),
            "risk_level": self._calculate_overall_risk(),
            "issues": self.vulnerabilities
        }
    
    def _calculate_overall_risk(self) -> str:
        """Determine overall risk level"""
        if not self.vulnerabilities:
            return "SAFE"
        
        max_severity = max(v.get("severity", SeverityLevel.LOW) for v in self.vulnerabilities)
        
        if max_severity == SeverityLevel.CRITICAL:
            return "CRITICAL"
        elif max_severity == SeverityLevel.HIGH:
            return "HIGH"
        else:
            return "MEDIUM"
    
    def _load_patterns(self) -> Dict:
        """Load security patterns for each language"""
        return {
            "python": {
                "eval_usage": r"\beval\s*\(",
                "exec_usage": r"\bexec\s*\(",
                "pickle_usage": r"\bpickle\.(loads|load)\(",
                "sql_injection": r"(SELECT|INSERT|UPDATE|DELETE).*['\"].*\+",
                "hardcoded_secret": r"(password|api_key|secret)\s*=\s*['\"][^'\"]+['\"]",
            },
            "javascript": {
                "dom_injection": r"\.(innerHTML|insertAdjacentHTML)\s*=",
                "eval_usage": r"\beval\s*\(",
                "hardcoded_secret": r"(password|apiKey|secret)\s*:\s*['\"][^'\"]+['\"]",
                "missing_cors": r"res\.header\s*\(\s*['\"]Access-Control",
            }
        }
    
    def _detect_language(self) -> str:
        """Auto-detect programming language"""
        if "import" in self.code or "def " in self.code:
            return "python"
        elif "const " in self.code or "function " in self.code:
            return "javascript"
        return "unknown"

# Entry point for agents
def run_skill(code: str, language: str = "auto", **kwargs) -> Dict:
    """Main skill execution - what agents call"""
    try:
        auditor = SecurityAuditor(code, language)
        result = auditor.audit()
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

**Key principle:** Scripts are production-ready code that agents can actually invoke.

### 4. Templates (Resources Your Skill Uses)

```json
// templates/remediation_templates.json
{
  "SQL_INJECTION": {
    "vulnerable": "SELECT * FROM users WHERE id = '{id}'",
    "fixed": "SELECT * FROM users WHERE id = %s",
    "explanation": "Use parameterized queries to prevent SQL injection"
  },
  "XSS_VULNERABILITY": {
    "vulnerable": "element.innerHTML = userInput",
    "fixed": "element.textContent = userInput; // or use DOMPurify",
    "explanation": "Always sanitize user input before rendering"
  }
}
```

### 5. Tests (Validation)

```python
# tests/test_security_auditor.py

import pytest
from scripts.security_audit import SecurityAuditor

def test_detects_sql_injection():
    vulnerable_code = "result = db.execute(f'SELECT * FROM users WHERE id={user_id}')"
    auditor = SecurityAuditor(vulnerable_code, language="python")
    result = auditor.audit()
    
    assert result["risk_level"] == "CRITICAL"
    assert any(v["type"] == "sql_injection" for v in result["issues"])

def test_detects_hardcoded_secrets():
    vulnerable_code = 'api_key = "sk_live_abc123xyz789"'
    auditor = SecurityAuditor(vulnerable_code, language="python")
    result = auditor.audit()
    
    assert any(v["type"] == "hardcoded_secret" for v in result["issues"])

def test_passes_safe_code():
    safe_code = """
def safe_query(user_id):
    query = "SELECT * FROM users WHERE id = ?"
    return db.execute(query, (user_id,))
"""
    auditor = SecurityAuditor(safe_code, language="python")
    result = auditor.audit()
    
    assert result["risk_level"] == "SAFE"
    assert len(result["issues"]) == 0
```

---

## Why Skills > Prompts (Hard Facts)

### 1. Consistency

**Prompts:** Instructions drift. Version 1 vs version 5 diverge.

**Skills:** Same logic, same output, every single time.

### 2. Reusability

**Prompts:** You rewrite for every model, every project.

**Skills:** Write once, use everywhere (Claude, GPT, open models).

### 3. Versioning

**Prompts:** Hard to track what changed. Impossible to rollback.

**Skills:** Git history, semantic versioning, easy rollback.

### 4. Performance

**Prompts:** Load 5,000 tokens of instructions every time.

**Skills:** Load only the metadata + required code. Faster execution.

### 5. Scalability

**Prompts:** Managing 50+ prompts becomes chaos.

**Skills:** 50+ skills become a curated library. Discoverable. Organized.

### 6. Team Coordination

**Prompts:** "Wait, which version of the audit prompt are we using?"

**Skills:** "Use v2.1.0 of SecurityAudit skill." Done.

---

## Building Your First Skill (Step-by-Step)

### Step 1: Identify the Problem

What does your skill solve?

**Good skill ideas:**
- ✅ Code review automation
- ✅ Data validation and cleaning
- ✅ Compliance checking (HIPAA, GDPR, etc)
- ✅ Document analysis
- ✅ Content generation templates
- ✅ Testing and QA
- ✅ Security scanning
- ✅ Deployment validation

**Bad skill ideas:**
- ❌ "General helper" (too vague)
- ❌ "Chat interface" (use agents instead)
- ❌ One-off prompt (not reusable enough)

### Step 2: Define the Contract

What goes IN? What comes OUT?

```markdown
# My Skill Contract

## Input
- Parameter 1: type, required/optional, description
- Parameter 2: type, required/optional, description

## Output
- Field 1: type, always included
- Field 2: type, conditional on input

## Constraints
- Max input size: 1MB
- Processing time: <30 seconds
- Supported languages: Python, JavaScript

## Failure Modes
- If input invalid: return error with code 400
- If processing fails: return error with message
- If timeout: return partial results + timeout flag
```

### Step 3: Create SKILL.md

Write it for a non-technical person. If a business person can understand it, you've nailed it.

### Step 4: Implement Instructions

Step-by-step how the skill works internally. Be specific.

### Step 5: Write the Code

Scripts that actually do the work. Production quality.

### Step 6: Test Everything

- Unit tests for functions
- Integration tests for full flow
- Edge case tests
- Performance tests on large inputs

### Step 7: Create Examples

Show real use cases. Show input/output. Make it obvious how to use.

### Step 8: Document Everything

Comment the code. Explain decisions. Help future you (and others).

---

## Publishing Your Skill

### Local Storage (Personal Projects)
```
~/.ai-skills/
├── security-audit/
├── code-formatter/
├── content-validator/
```

### GitHub (Team/Community)
```bash
git clone https://github.com/yourusername/ai-skills-library
cd ai-skills-library
mkdir security-audit
# Add SKILL.md, scripts/, etc.
git push
```

### Getting Discovered (The Real Way)

You don't submit skills to a centralized registry. Instead, **adoption drives discovery**.

**Here's how it works:**

1. **Publish on GitHub** — Create a public repo with your skill
2. **Make it Installable** — Users run `npx skills add owner/skill-name` to install it
3. **Directories Track Adoption** — Services like [skills.sh](https://skills.sh) crawl GitHub and auto-index popular skills
4. **You Get Discovered** — As developers install your skill, it appears on directories
5. **Community Rates It** — GitHub stars, forks, feedback drive visibility

**Real-world installation example:**

The open ecosystem uses multiple community CLIs (e.g., [vercel-labs/skills](https://github.com/vercel-labs/skills)) that support:

```bash
# Install via community CLI (syntax varies by tool):
npx skills add owner/skill-name

# Direct GitHub repository:
npx skills add 1Mangesh1/hipaa-guardian
```

**Note:** Exact commands and flags depend on which CLI/marketplace you're using — test with your target tool.

**Real directories that discover skills:**
- [skills.sh](https://skills.sh) — Community-driven open marketplace
- Platform curators (e.g., Anthropic's pre-built Agent Skills) — Curated sets for specific platforms
- GitHub trending — Sort by "Skills" topic
- Community channels (Reddit r/AI, Discord servers, etc.)

**How to get noticed:**
- ✅ Solve a real problem (not a toy feature)
- ✅ Write excellent SKILL.md and documentation
- ✅ Build in public (share progress)
- ✅ Respond to issues and feedback
- ✅ Keep it updated and maintained
- ✅ Make it discoverable with `npx skills find keyword`

---

## AI Agents That Use Skills

Skills aren't Claude-exclusive. Multiple AI agents can invoke and use the same skills.

### Claude (Anthropic)

**How it works:**
```
User: "Use SecurityAudit skill on my code"
Claude: [loads SKILL.md] [invokes skill] [returns results]
```

**Configuration:**
```json
{
  "model": "claude-3-5-sonnet",
  "skills": [
    "hipaa-guardian",
    "security-audit",
    "content-validator"
  ]
}
```

---

### Other AI Agents That Support Skills



### How to Make Your Skill Work Everywhere

To maximize compatibility across all agents:

1. **Standard SKILL.md** — Follow the format with clear What/When/Input/Output sections
2. **Structured JSON Output** — Always return valid JSON  (`{"success": true, "data": {...}}`) 
3. **Language Agnostic** — Python, Go, JavaScript, etc. all work equally
4. **Fast Execution** — Target <5 seconds, max 30 seconds
5. **Error Handling** — Return structured responses, never crash silently
6. **Version Everything** — List compatible agents in SKILL.md (Claude, GPT-4, LangChain, AutoGPT, GitHub Copilot, HuggingFace, etc.)

---

### Pointing Agents to Your Skills

Different agents discover skills different ways:

| Agent | Discovery Method |
|-------|------------------|
| **Claude** | `@skill name` or skill reference in SKILL.md |
| **GPT-4** | Function calling wrapper or API integration |
| **LangChain** | `Tool()` registration in agent setup |
| **AutoGPT** | `npx skills add owner/skill-name` |
| **GitHub Copilot** | `.copilot/config.json` configuration |
| **HuggingFace** | Community skills registry |
| **Custom agents** | API endpoint or local import |

---



### Real-World Example: Security Audit Workflow

**Without skills:**
```
User: "Review my code for security issues"
Claude: [loads 5,000 tokens of security instructions]
Claude: [scans code manually]
Claude: [generates report]
```

**With skills:**
```
User: "Review my code for security issues"
Claude: [sees SecurityAudit skill is available]
Claude: [invokes the skill]
SecurityAudit: [runs pattern matching]
SecurityAudit: [returns structured results]
Claude: [presents findings to user]
```

The agent *decides* when to use the skill. It's not hardcoded. (Note: exact invocation behavior — synchronous vs. asynchronous, blocking vs. non-blocking — depends on the agent implementation; test with your target agent platform.)

---

## Building a Skill: Real Essentials

Here's what actually matters when you build a skill:

### 1. **SKILL.md** (The entire interface)

```markdown
# SecurityAudit Skill

## What This Skill Does
Scans code for security vulnerabilities using OWASP patterns.
Returns categorized issues with severity levels and fix recommendations.

## When to Use It
- Pre-deployment code reviews
- Finding vulnerabilities in existing code
- Security compliance checks
- Vulnerability tracking

## What You Give It
```
input: "code_to_scan" (string, required)
       "language" (optional: "python", "javascript", "go", etc)
       "severity_threshold" (optional: "low", "medium", "high", "critical")
```

## What You Get Back
```json
{
  "skill": "SecurityAudit",
  "version": "2.1.0",
  "vulnerabilities_found": 3,
  "critical_issues": 1,
  "high_issues": 2,
  "issues": [
    {
      "type": "SQL_INJECTION",
      "file": "auth.py",
      "line": 42,
      "severity": "CRITICAL",
      "description": "String concatenation in SQL query",
      "fix": "Use parameterized queries"
    }
  ],
  "meta": {
    "execution_time_ms": 2340,
    "partial_results": false,
    "timeout_occurred": false
  }
}
```

## Examples

**Example 1: Finding SQL injection**
```
User input: Code with f-string SQL query
Skill returns: CRITICAL issue with fix recommendation
User action: Apply the suggested parameterized query fix
```

**Example 2: Checking third-party code**
```
User input: Library code they dependency
Skill returns: Medium-severity CORS issues
User action: Evaluate if acceptable for use case
```

## Performance
- Scans up to 50,000 lines of code
- Returns results in <5 seconds
- Works with most modern languages

## Maintainer
@yourusername
Version: 2.1.0
```

### 2. **instructions/ folder** (How it works internally)

This is documentation for developers who want to understand or extend your skill:

```markdown
# SecurityAudit - Technical Details

## How Pattern Detection Works

**Important note:** Regex-based pattern matching is useful for quick heuristics but will miss context-sensitive vulnerabilities and generate false positives. For production-grade security scanning, use AST/dataflow-based analysis ([Semgrep](https://semgrep.dev/), [CodeQL](https://codeql.github.com/)) or dedicated SAST tools.

1. Parse code into AST (Abstract Syntax Tree) [recommended]
2. Traverse AST looking for vulnerable patterns
3. Cross-reference against [OWASP Top 10](https://owasp.org/www-project-top-ten/) and [CWE](https://cwe.mitre.org/) weakness database
4. Assign [CVSS scores](https://www.first.org/cvss/v3.1/specification-document) based on exploitability and impact
5. Return structured JSON

## Supported Languages
- Python: eval, exec, SQL injection, hardcoded secrets
- JavaScript: DOM injection, CORS, eval, secrets
- Go: SQL injection, hardcoded credentials

## Performance Optimization
- Cache parsed ASTs for repeated scans
- Skip files larger than 10MB (timeout risk)
- Parallel pattern matching for multi-file scans

## Adding New Patterns
To add a new vulnerability pattern:
1. Define regex in `/patterns/{language}.json`
2. Add rule to CVSS mapping
3. Add test cases
4. Update documentation
```

### 3. **/tests** folder (Prove it works)

```python
# tests/test_security_audit.py

def test_detects_sql_injection():
    """Ensure SQL injection vulnerability is caught"""
    vulnerable_code = """
    user_id = request.args['id']
    query = f"SELECT * FROM users WHERE id={user_id}"
    """
    result = invoke_skill(vulnerable_code, language="python")
    assert result["critical_issues"] > 0
    assert any(issue["type"] == "SQL_INJECTION" for issue in result["issues"])

def test_passes_safe_code():
    """Ensure safe code doesn't raise false positives"""
    safe_code = """
    user_id = request.args['id']
    query = "SELECT * FROM users WHERE id=?"
    cursor.execute(query, (user_id,))
    """
    result = invoke_skill(safe_code, language="python")
    assert result["critical_issues"] == 0
```

---

## Real Skills in Action

Here's how your skills get used:

**Scenario 1: A developer finds your skill**
```
Developer: "I need to audit my code"
Finds: SecurityAudit on skills.sh
Asks Claude: "Use SecurityAudit skill on this code"
Claude: [invokes skill] → [shows results]
```

**Scenario 2: Teams add skills to their workflow**
```
Team policy: "All code must pass SecurityAudit before merge"
CI/CD pipeline: `npx skills check security-audit`
Result: Automatic vetting, consistent standards
```

**Scenario 3: Skills get chained**
```
Claude receives task: "Review code and improve documentation"
Claude thinks: "First use SecurityAudit, then ContentValidator"
[invokes both skills in sequence]
Returns: Security report + documentation improvements
```

---

## Publishing Your Skill

You only need:
1. **GitHub repo** with SKILL.md in root
2. **Clear documentation** (in SKILL.md)
3. **Tests** (prove it works)  
4. **Examples** (show how to use)

That's it. As people install it (`npx skills add owner/repo`), it gets indexed by skills.sh. Adoption = Visibility.

---

## Best Practices for Killer Skills

### 1. Single Responsibility
One skill = one job. Don't try to do everything.

### 2. Clear Input/Output
Document exactly what the skill needs and returns. No surprises.

### 3. Fail Gracefully
Always return structured responses. Never crash silently.

### 4. Performance Matters
Agents use skills during active work. If it's slow, it breaks UX.

### 5. Test with Real Data
Don't just test happy paths. Test edge cases, edge cases, edge cases.

### 6. Version Everything
Semantic versioning (1.2.3). Easy rollback. Breaking change warnings.

### 7. Write for Non-Devs
SKILL.md should make sense to anyone. Technical details go in Instructions.

### 8. Make It Discoverable
Clear name, good tags, comprehensive examples.

---

## Key Takeaways

1. **Skills > Prompts** — They're reusable, versionable, and scalable
2. **Structure matters** — SKILL.md + Instructions + Code + Tests
3. **Simplicity wins** — Clear input, clear output, clear purpose
4. **Test everything** — Edge cases, real data, performance
5. **Document like hell** — Future you will thank present you
6. **Build in public** — Share skills, get feedback, improve faster
7. **Start small** — Your first skill doesn't need to be perfect
8. **Think systems** — One skill is cool. A library of skills is powerful

---

## Getting Started

### Option 1: Build Solo
```bash
mkdir my-first-skill
touch my-first-skill/SKILL.md
# Start writing
```

### Option 2: Learn from Examples
- [Anthropic's Official Skills](https://docs.anthropic.com/en/agents/skills/overview)
- [agentskills.io Library](https://agentskills.io/home)
- [Community Skills on GitHub](https://github.com/search?q=ai-skill)

### Option 3: Contribute to Collections
- [dev-skills-collection](https://github.com/1Mangesh1/dev-skills-collection)
- Open-source skill libraries
- Team repositories

---

## Resources & Authoritative References

**AI Agent Skills & Specification:**
- [Claude Agent Skills SDK](https://platform.claude.com/docs/en/agent-sdk/skills) — Anthropic's implementation
- [Agent Skills Open Specification](https://github.com/agentskills/agentskills) — Cross-platform spec & documentation
- [vercel-labs/skills](https://github.com/vercel-labs/skills) — Open CLI tool for skill management
- [skills.sh](https://skills.sh/) — Community marketplace for published skills

**Security Standards (for threat/vulnerability references in your skill):**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — Web application security risks
- [CWE (Common Weakness Enumeration)](https://cwe.mitre.org/) — Weakness taxonomy
- [CVSS v3.1](https://www.first.org/cvss/v3.1/specification-document) — Severity scoring standard

**Static Analysis & Pattern Detection:**
- [Semgrep](https://semgrep.dev/) — AST-based SAST tool (more robust than regex)
- [CodeQL](https://codeql.github.com/) — Code analysis for vulnerability detection

**My Skill Collection:**
- [dev-skills-collection](https://github.com/1Mangesh1/dev-skills-collection) — Examples & reusable skills

---

**Build skills. Automate workflows. Scale intelligence.**

The future of AI engineering isn't bigger models. It's better skills. Start building. 🚀
