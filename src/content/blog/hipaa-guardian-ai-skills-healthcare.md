---
title: "HIPAA Guardian: Building AI Skills to Detect Healthcare Data Breaches Automatically"
description: "Learn how to build AI agent skills for HIPAA compliance. Detect PHI/PII in code, logs, and AI outputs before they become expensive violations. Complete guide to writing reusable agent skills."
pubDate: 2026-02-05T00:00:00Z
tags: ["HIPAA", "Healthcare", "AI Agents", "Compliance", "Security", "Agent Skills", "Python", "Healthcare Tech"]
draft: false
---

I've been working on healthcare code for the past year.

As software engineers, we:
- debug fast
- log everything
- deploy fixes quickly

In most products, if a user log accidentally reaches production, it's frustrating — but manageable.

In healthcare, the same mistake can cost **millions**.

One patient field in logs.
One PHI value in a message.
One missed prompt.

And suddenly it's not just a bug — it's a **HIPAA violation**.

That reality forces you to think differently as an engineer.

This isn't just code.
This is real people's medical data.

The hardest part?
When you're deep in debugging and shipping fixes, it's easy to miss small details — even for experienced engineers, even for **AI agents**.

So I asked myself:

**What if an agent could act as a second pair of eyes and say — "Hold up. This might contain PHI or PII."**

That idea led me to build **HIPAA Guardian** — an agent skill that helps identify potential HIPAA issues early, before small errors turn into costly problems.

In healthcare tech, speed matters — but **compliance and safety matter more**.

---

## What Is HIPAA (And Why Engineers Need to Care)

**HIPAA = Health Insurance Portability and Accountability Act**

It's not just legal compliance jargon. HIPAA violations carry:

- **Fines:** $100 - $50,000+ *per violation*
- **Lawsuits:** From patients, regulators, competitors
- **Reputation damage:** Can shut down startups
- **Criminal liability:** Jail time for intentional violations (yes, really)

**What's Protected Information (PHI)?**

Any health-related data linked to a person:
- Names + medical record numbers
- Social security numbers
- Insurance information
- Diagnosis codes
- Medication details
- Lab results
- Appointment dates
- Even payment card numbers if tied to healthcare

**The sneaky part?** PHI isn't just explicit medical data. It's anything that *could* identify someone + health information.

**The developer problem:** When you're debugging, logging, testing, or iterating — it's easy to accidentally:
- Log PHI with debug statements
- Include patient data in error messages
- Expose medical history in API responses
- Leave test data with real addresses/names
- Have AI agents regurgitating patient info

Each incident is a violation. Each violation is expensive.

---

## Why Traditional Compliance Tools Fail (And Why You Need AI Skills)

### The Old Way: Manual Code Review

Compliance teams manually review code looking for PHI leaks.

**Problems:**
- Slow (blocks shipping)
- Incomplete (humans miss patterns)
- Expensive (requires specialized staff)
- Reactive (catches issues after deployment)
- Doesn't scale with AI agents

### The New Way: AI Agent Skills

An **agent skill** is a reusable tool that an AI agent can invoke to perform specific tasks.

Instead of waiting for humans to review, you give your AI agent **HIPAA Guardian skill** which:
- ✅ Scans code for PHI automatically
- ✅ Checks logs in real-time
- ✅ Validates AI-generated responses
- ✅ Flags suspicious patterns before deployment
- ✅ Works 24/7 with zero human bottleneck

**The game changer?** Your AI agent can now self-check. When writing code or generating content, the agent can invoke the HIPAA Guardian skill to ask: "Does this output contain PHI?"

---

## How HIPAA Guardian Works

### Architecture Overview

```
Code/Log/API Response
        ↓
HIPAA Guardian Skill
        ↓
Pattern Matching + AI Detection
        ↓
Risk Assessment (Low/Medium/High)
        ↓
Report + Remediation Suggestions
```

### What It Detects

1. **PII Patterns**
   - SSN formats (XXX-XX-XXXX)
   - Phone numbers
   - Email addresses
   - Credit card numbers

2. **Healthcare-Specific PHI**
   - Medical record numbers
   - Diagnosis codes (ICD-10, CPT)
   - Medication names + dosages
   - Lab values
   - Dates of birth + service dates

3. **Context Clues**
   - Healthcare facility names
   - Doctor names + credentials
   - Hospital admission records
   - Insurance claim details

4. **AI Output Validation**
   - Checks AI-generated responses for leaked data
   - Validates prompt injection risks
   - Detects information leakage patterns

### Example Detection Flow

```python
# Input: A log line from debugging
log_entry = "User 123-45-6789 diagnosed with Type 2 Diabetes visited Boston Medical on 01/15/2026"

# HIPAA Guardian analyzes it
result = hipaa_guardian.scan(log_entry)

# Returns:
{
    "risk_level": "CRITICAL",
    "violations": [
        {
            "type": "SSN",
            "pattern": "123-45-6789",
            "recommendation": "Remove SSN, use patient ID instead"
        },
        {
            "type": "DIAGNOSIS",
            "pattern": "Type 2 Diabetes",
            "recommendation": "Store diagnosis in secure database, not logs"
        },
        {
            "type": "LOCATION_WITH_DATE",
            "pattern": "Boston Medical on 01/15/2026",
            "recommendation": "Remove specific dates and facility names from logs"
        }
    ]
}
```

---

## Understanding Agent Skills (Deep Dive)

Before building HIPAA Guardian, you need to understand what an **agent skill** is.

An agent skill is:
- **A discrete unit of functionality** that an agent can invoke
- **Reusable across agents** (pass between projects)
- **Self-documenting** (agent knows inputs/outputs)
- **Chainable** (skills can call other skills)
- **Version-controlled** (track changes, dependencies)

### The Skill Anatomy

Every skill has:

1. **Manifest** - Metadata describing the skill
2. **Entry Point** - Function the agent invokes
3. **Config Schema** - What the skill needs to run
4. **Output Schema** - What the skill returns

### Simple Skill Example

```python
# skill_manifest.json
{
    "id": "hipaa-guardian",
    "name": "HIPAA Guardian",
    "version": "1.0.0",
    "description": "Detects PHI/PII in code, logs, and AI outputs",
    "author": "1Mangesh1",
    "tags": ["healthcare", "compliance", "security", "phi", "pii"],
    "entryPoint": "scan_for_phi",
    "requiredInputs": {
        "content": {
            "type": "string",
            "description": "Text to scan for PHI/PII",
            "required": true
        },
        "context": {
            "type": "object",
            "description": "Optional context (file type, source, etc)",
            "required": false
        }
    },
    "outputs": {
        "risk_level": "string",
        "violations": "array",
        "recommendations": "array"
    }
}
```

```python
# skill_implementation.py
import re
from typing import Dict, List, Optional

def scan_for_phi(content: str, context: Optional[Dict] = None) -> Dict:
    """
    Main skill entry point - scans content for PHI/PII
    """
    violations = []
    
    # Pattern matching for common PHI
    patterns = {
        "SSN": r"\b\d{3}-\d{2}-\d{4}\b",
        "PHONE": r"(?:\+1|1)?\s*\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})",
        "MRN": r"MRN[:\s]+(\d{6,})",
        "ICD_CODE": r"\bI[0-9]{2}(?:\.[0-9A-Z]{1,4})?\b",
        "DOB": r"\b(0[1-9]|1[0-2])/(0[1-9]|[12]\d|3[01])/(19|20)\d{2}\b",
    }
    
    for phi_type, pattern in patterns.items():
        matches = re.finditer(pattern, content)
        for match in matches:
            violations.append({
                "type": phi_type,
                "pattern": match.group(0),
                "position": match.span(),
                "severity": get_severity(phi_type)
            })
    
    # Calculate risk level
    risk_level = calculate_risk(violations)
    
    return {
        "risk_level": risk_level,
        "violations": violations,
        "recommendations": get_recommendations(violations),
        "scan_metadata": {
            "scanned_length": len(content),
            "patterns_checked": len(patterns),
            "violations_found": len(violations)
        }
    }

def get_severity(phi_type: str) -> str:
    """Determine severity of PHI type"""
    severity_map = {
        "SSN": "CRITICAL",
        "MRN": "CRITICAL",
        "DOB": "HIGH",
        "PHONE": "MEDIUM",
        "ICD_CODE": "MEDIUM"
    }
    return severity_map.get(phi_type, "LOW")

def calculate_risk(violations: List[Dict]) -> str:
    """Calculate overall risk level"""
    if not violations:
        return "SAFE"
    
    critical = sum(1 for v in violations if v.get("severity") == "CRITICAL")
    if critical > 0:
        return "CRITICAL"
    
    high = sum(1 for v in violations if v.get("severity") == "HIGH")
    if high > 2:
        return "HIGH"
    
    return "MEDIUM"

def get_recommendations(violations: List[Dict]) -> List[str]:
    """Generate remediation recommendations"""
    recommendations = []
    
    phi_types = set(v["type"] for v in violations)
    
    if "SSN" in phi_types:
        recommendations.append("Remove SSN. Use patient ID or MRN instead.")
    
    if "PHONE" in phi_types:
        recommendations.append("Phone numbers should be encrypted or tokenized.")
    
    if "MRN" in phi_types and "DOB" in phi_types:
        recommendations.append("Patient identifiers detected. Audit logging access.")
    
    return recommendations
```

---

## Building Your Own Healthcare AI Skill

### Step 1: Define the Problem (Skill Specification)

Before coding, ask:
- What specific problem does this skill solve?
- What inputs will it receive?
- What outputs does the agent need?
- How will it fail safely?

**Example (HIPAA Guardian):**
- **Problem:** Detect PHI/PII in text before it reaches logs or deployment
- **Inputs:** String content, optional context metadata
- **Outputs:** Risk level, violation list, recommendations
- **Safe failure:** Return `"SAFE"` if content can't be parsed (assume safe)

### Step 2: Create the Skill Manifest

This tells agents what your skill does:

```json
{
    "id": "your-skill-id",
    "name": "Human-Readable Skill Name",
    "version": "1.0.0",
    "description": "Single sentence describing what it does",
    "author": "Your Name",
    "repository": "https://github.com/username/skill-repo",
    "tags": ["category", "use-case", "domain"],
    "entryPoint": "function_name",
    "requiredInputs": {
        "parameter_name": {
            "type": "string|object|array|number|boolean",
            "description": "What this parameter does",
            "required": true|false
        }
    },
    "outputs": {
        "field_name": "type",
        "explanation": "What this field means"
    },
    "dependencies": ["other-skill-id"],
    "rateLimit": {
        "max_calls": 100,
        "per_seconds": 60
    }
}
```

### Step 3: Implement the Skill Logic

Use a structured approach:
1. **Validate inputs** - Check what you received matches spec
2. **Core logic** - Do the actual work
3. **Error handling** - Fail gracefully
4. **Return structured output** - Match your manifest exactly

```python
def main_skill_function(required_param: str, optional_param: str = None) -> Dict:
    """
    Main entry point that agents will call.
    
    Args:
        required_param: Description
        optional_param: Optional parameter with smart default
    
    Returns:
        dict: Structured output matching manifest
    """
    # Input validation
    if not required_param or not isinstance(required_param, str):
        return {"error": "Invalid input", "status": "FAILED"}
    
    try:
        # Core logic here
        result = process_logic(required_param)
        
        # Return structured output
        return {
            "status": "SUCCESS",
            "data": result,
            "metadata": {
                "input_length": len(required_param),
                "processed_at": datetime.now().isoformat()
            }
        }
    
    except Exception as e:
        # Safe failure
        return {
            "status": "FAILED",
            "error": str(e),
            "data": None
        }
```

### Step 4: Test Your Skill

```python
# test_skill.py
import pytest
from skill_implementation import scan_for_phi

def test_detects_ssn():
    result = scan_for_phi("Patient SSN 123-45-6789 admitted")
    assert result["risk_level"] != "SAFE"
    assert any(v["type"] == "SSN" for v in result["violations"])

def test_safe_content():
    result = scan_for_phi("The weather is nice today")
    assert result["risk_level"] == "SAFE"
    assert len(result["violations"]) == 0

def test_multiple_phi():
    result = scan_for_phi("John Doe 123-45-6789 DOB 01/15/1990")
    assert result["risk_level"] == "CRITICAL"
    assert len(result["violations"]) > 2
```

---

## Integrating with dev-skills-collection

[dev-skills-collection](https://github.com/1Mangesh1/dev-skills-collection) is a central repository for reusable AI skills.

### Why Publish Your Skill?

✅ Other developers can use your skill  
✅ Get feedback and improvements  
✅ Build reputation in the AI agent ecosystem  
✅ Reduce duplication across projects  
✅ Create a portfolio of working code  

### Publishing Steps

1. **Organize Your Skill**
   ```
   /skills/hipaa-guardian/
   ├── manifest.json
   ├── skill.py
   ├── requirements.txt
   ├── tests/
   │   └── test_skill.py
   └── README.md
   ```

2. **Add to dev-skills-collection**
   ```bash
   git clone https://github.com/1Mangesh1/dev-skills-collection
   cd dev-skills-collection
   cp -r ~/hipaa-guardian skills/
   git add skills/hipaa-guardian/
   git commit -m "feat: add HIPAA Guardian skill for PHI detection"
   git push origin feature/hipaa-guardian
   # Create PR
   ```

3. **Update Registry**
   The collection maintains a `skills-registry.json` with metadata for discovery:
   ```json
   {
       "id": "hipaa-guardian",
       "name": "HIPAA Guardian",
       "version": "1.0.0",
       "category": "healthcare",
       "downloads": 1500,
       "rating": 4.8,
       "maintainer": "1Mangesh1"
   }
   ```

4. **Document Everything**
   ```markdown
   # HIPAA Guardian Skill
   
   ## Usage
   ```python
   from skills.hipaa_guardian import scan_for_phi
   
   result = scan_for_phi("Patient data here")
   if result["risk_level"] == "CRITICAL":
       alert_compliance_team()
   ```
   
   ## What It Detects
   - [x] SSN patterns
   - [x] Medical record numbers
   - [x] Diagnosis codes
   ...
   ```

---

## Real-World Example: Using HIPAA Guardian in Your CI/CD

```yaml
# .github/workflows/hipaa-check.yml
name: HIPAA Compliance Check

on: [pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install HIPAA Guardian
        run: pip install hipaa-guardian
      
      - name: Scan code for PHI
        run: |
          hipaa-guardian scan \
            --target src/ \
            --output report.json \
            --fail-on CRITICAL
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: hipaa-scan-report
          path: report.json
      
      - name: Comment on PR
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ HIPAA violations detected. Review report.'
            })
```

---

## Key Lessons for Building Healthcare AI Skills

### 1. **Assume Worst-Case Scenario**
When in doubt, flag it. False positives are better than compliance violations.

### 2. **Make Errors Visible**
Don't silently skip checks. Log what your skill found, even if it's safe.

### 3. **Keep It Fast**
Skills run during development. If it's slow, engineers will disable it.

### 4. **Provide Fixes, Not Just Warnings**
"You have PHI here" → Agents stop. "Remove SSN, use patient ID instead" → Agents can fix it.

### 5. **Be Specific About Patterns**
Generic "don't expose data" rules fail. Specific regex patterns for SSN, MRN, etc. work.

### 6. **Test with Real Data (Anonymized)**
Pattern matching tools are great, but test with actual healthcare formats.

---

## The Future: AI-Powered Healthcare Engineering

As AI agents take on more coding and audit responsibilities, skills like HIPAA Guardian become foundational.

**What's coming:**
- 🔍 Real-time agent monitoring for compliance violations
- 🤖 Agents that auto-remediate PHI leaks before deployment
- 📊 Dashboards showing which agents handle sensitive data best
- 🔐 Skills ecosystem where healthcare companies rate and share compliance tools
- 🌐 Industry standards for healthcare AI safety (similar to GDPR compliance)

**The opportunity:** If you're building in healthcare tech, creating compliance skills now positions you as someone who understands both engineering and trust. That's rare. That's valuable.

---

## Getting Started

1. **Explore HIPAA Guardian**
   - GitHub: [1Mangesh1/hipaa-guardian](https://github.com/1Mangesh1/hipaa-guardian)
   - Try it: `pip install hipaa-guardian`

2. **Learn AI Skills**
   - Repo: [1Mangesh1/dev-skills-collection](https://github.com/1Mangesh1/dev-skills-collection)
   - Browse existing skills for examples

3. **Build Your First Skill**
   - Start small (compliance, validation, parsing)
   - Test thoroughly with real scenarios
   - Publish to dev-skills-collection
   - Iterate based on feedback

4. **Connect with Developers**
   - Join healthcare tech communities
   - Open issues for new detection patterns
   - Collaborate on improvements

---

## Final Thought

Healthcare code isn't just code.

When you log a patient's diagnosis, you're not debugging — you're handling someone's private medical information.

When an AI agent generates a response that includes PHI, it's not a harmless mistake — it's a violation.

That responsibility changes how you build. It makes you careful. It makes you think about edge cases.

And tools like HIPAA Guardian exist to make sure that care doesn't disappear under deadline pressure.

If you're building healthcare tech, use them. If you're building skills, use healthcare compliance as your testing ground. The stakes are real, and the need is urgent.

**Speed matters in healthcare — but so does never shipping a HIPAA violation.**

---

## Resources

- **HIPAA Guardian**: [GitHub Repository](https://github.com/1Mangesh1/hipaa-guardian)
- **dev-skills-collection**: [Repository](https://github.com/1Mangesh1/dev-skills-collection)
- **HIPAA Compliance Guide**: [HHS.gov](https://www.hhs.gov/hipaa/)
- **AI Skills Framework**: [Anthropic Docs](https://docs.anthropic.com/)
- **Pattern Matching Guide**: [Regex101.com](https://regex101.com/)

---

**Questions or want to contribute?** Open an issue on [HIPAA Guardian](https://github.com/1Mangesh1/hipaa-guardian) or contribute to [dev-skills-collection](https://github.com/1Mangesh1/dev-skills-collection).

Healthcare tech desperately needs engineers who care about compliance. Be one of them. 🏥🔒
