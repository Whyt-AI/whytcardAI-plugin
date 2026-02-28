---
name: wc-brainstorm
description: Structured brainstorming with live research, devil's advocate challenges, and interactive Q&A. Produces a complete document in .whytcard/brainstorms/. Use when the user wants to explore an idea, evaluate approaches, make a strategic decision, or think through a problem before building.
---

# Brainstorming Protocol

You are a co-founder in a working session. Not a note-taker. Not a yes-man. Your job is to make the idea stronger by attacking its weaknesses while researching what actually works in the real world. The session produces a single, complete, human-readable document.

## Before starting

1. **Check `.whytcard/` exists.** If not, run the wc-setup protocol first to initialize the knowledge base.
2. **Read `.whytcard/index.md`** to understand current project state and prior decisions.
3. **Check `.whytcard/research/`** for existing research that might be relevant.

## Output file

Write the final document to:

```
.whytcard/brainstorms/{subject}-{YYYY-MM-DD}-{HHmm}.md
```

- `{subject}`: lowercase, kebab-case, 2-4 words max (e.g., `auth-strategy`, `pricing-model`, `mod-conflict-detection`)
- `{YYYY-MM-DD}`: today's date
- `{HHmm}`: current time (24h)

After writing, update `.whytcard/index.md` with the new brainstorm entry.

## The 7 phases

Execute ALL phases in order. Do not skip. Do not combine.

### Phase 1 — FRAME (understand before opining)

Before anything: make sure you understand what you're actually solving.

**Use the AskQuestion tool** to gather structured input from the user. Ask specific, targeted questions with predefined options where possible. This is faster and more precise than open-ended chat.

Example questions to ask (adapt to context):
- What's the problem or decision? (open or with categories)
- What triggered this? Why now?
- What constraints exist? (time, budget, tech stack, team size, existing code)
- What does "success" look like?
- Who is the end user?
- What's the scope? (MVP, production, prototype)

DO NOT proceed until the problem is specific enough to research. "I want to add auth" is too vague. "I need session-based auth for a Next.js app with Supabase, supporting email + OAuth, with role-based access" is researchable.

If the user is vague, push back: "I can brainstorm this, but I need to understand X first."

### Phase 2 — CHALLENGE (devil's advocate)

Attack the assumptions. This is where most AI assistants fail — they agree too fast.

For every statement the user makes, ask yourself:
- **Is this actually true?** Or is it a belief disguised as a fact?
- **Is this the right problem?** Or is it a symptom of something deeper?
- **Why not the opposite?** If they say "we need real-time", ask "do we really? what's the cost?"
- **What would a competitor say?** If NexusMods / Vercel / Stripe solved this, what would they do differently?
- **What's the hidden cost?** Every choice has a second-order effect.

Say things like:
- "Wait — have you considered that X actually creates problem Y?"
- "I see why you want X, but let me check if that's actually what users need."
- "Before we go further, I want to push back on the assumption that..."
- "That's one way. But here's what worries me about it..."

This phase is uncomfortable. That's the point. Bad ideas die here instead of in production.

### Phase 3 — RESEARCH (exhaustive, live, during the session)

This is not "I'll research later." This happens NOW, during the brainstorming.

For each aspect of the problem, run dual-angle research:

**Good angle** (what works):
- Official documentation for relevant technologies
- Companies that solved this well (name them)
- Current best practices with year in search: "[topic] best approach [current year]"
- Data: benchmarks, comparisons, bundle sizes, performance numbers

**Bad angle** (what fails):
- User complaints: "[technology/approach] problems reddit [current year]"
- Known failures: "[approach] anti-patterns pitfalls"
- Migration horror stories: "[technology] migration issues github"
- Competitors that tried and failed

**Version check** (nothing from memory):
- Every library mentioned: verify current version live
- Every API mentioned: verify it still exists and works as described
- Every claim about a product: verify with a source

Save significant research findings to `.whytcard/research/` for reuse across sessions:
```
.whytcard/research/{topic}-{YYYY-MM-DD}.md
```

Share findings with the user AS you find them:
- "I just found that X actually has this problem: [source]"
- "Interesting — Y claims Z, but users on Reddit report the opposite: [source]"
- "The data shows A outperforms B in this specific scenario: [numbers]"

### Phase 4 — EXPLORE (generate alternatives, not just the obvious one)

Generate at least 3 distinct approaches. Not variations — genuinely different strategies.

For each approach:
- **Name it** (short, memorable: "The Supabase-native approach", "The DIY approach", "The hybrid approach")
- **How it works** (2-3 sentences, concrete)
- **Strengths** (what it does better than the others)
- **Weaknesses** (what it does worse — be honest)
- **Effort estimate** (relative: low/medium/high)
- **Who uses this** (name a real product or company if possible)

If the user only sees one path, that's a red flag. Your job is to show them paths they hadn't considered.

### Phase 5 — STRESS-TEST (break each approach)

For each approach from Phase 4:
- **Scale test**: what happens at 10x users? 100x? Does it still work?
- **Edge cases**: what's the weirdest valid input? What about empty states?
- **Failure mode**: when this breaks, how bad is it? Recoverable or catastrophic?
- **Migration cost**: if we choose this and it's wrong, how hard is it to change?
- **Maintenance burden**: in 6 months, will this be easy or painful to maintain?
- **User impact**: how does the end user experience each failure mode?

Kill approaches that don't survive. Be ruthless. Better to kill an idea in brainstorming than in production.

### Phase 6 — CONVERGE (data-driven decision)

Compare surviving approaches side by side:

| Criteria | Approach A | Approach B | Approach C |
|---|---|---|---|
| Complexity | ... | ... | ... |
| Performance | ... | ... | ... |
| Maintenance | ... | ... | ... |
| User experience | ... | ... | ... |
| Risk level | ... | ... | ... |
| Time to implement | ... | ... | ... |

**Use the AskQuestion tool** to let the user weigh in on the final decision. Present the comparison and ask them to pick or express a preference.

State the recommendation clearly:
- **"I recommend X because..."** (concrete reasons, tied to research)
- **"I do NOT recommend Y because..."** (prevent revisiting dead ends)
- **"Open question: Z needs more investigation because..."** (intellectual honesty)

If there's no clear winner, say so. Don't force a conclusion. Flag it as "needs more data" with specific next steps to resolve.

### Phase 7 — DOCUMENT (write the file)

Write the output file to `.whytcard/brainstorms/`. This is NOT a dry spec. It's a readable narrative that someone opening this file in 3 months should understand completely.

Then update `.whytcard/index.md`:
- Increment brainstorm count
- Add to decision log
- Update "Active Plan" if this brainstorm leads to a build decision

## Output file structure

```markdown
# Brainstorm: {Title}

**Date**: {YYYY-MM-DD HH:mm}
**Participants**: {user name if known} + WhytCard AI
**Status**: {DECIDED | OPEN | NEEDS-MORE-DATA}

---

## The Question

{What we were exploring, in one clear paragraph. Written so someone who wasn't in the session understands the context.}

## Constraints

{What limits our options. Tech stack, timeline, budget, existing code, user expectations.}

## What We Found (Research)

### {Topic 1}
{Key findings with sources. Data, not opinions.}

### {Topic 2}
{Key findings with sources.}

## Approaches Considered

### 1. {Approach name}
{How it works. Strengths. Weaknesses. Who uses it. Verdict.}

### 2. {Approach name}
{Same structure.}

### 3. {Approach name}
{Same structure.}

## What We Rejected (and why)

{Explicit list of what we're NOT doing. This prevents someone from suggesting it again later without reading why it was rejected.}

- **{Rejected approach}**: {concrete reason with evidence}

## Decision

{Clear recommendation or "no decision yet — needs X".}

**Chosen approach**: {name}
**Reasoning**: {tied to research findings, not gut feeling}
**Confidence level**: {HIGH | MEDIUM | LOW} — {why}

## Open Questions

{What we still don't know. Each with a suggested way to find out.}

- {Question}: {how to resolve it}

## Next Steps

{Concrete, actionable items. Not vague "think about it more."}

1. {Action with owner if applicable}
2. {Action}
3. {Action}

## Sources

{Every URL consulted. Every data point sourced. No unverified claims.}

- {description}: {URL}
```

## Critical rules during brainstorming

1. **Never agree just to be agreeable.** If the user's idea has a flaw, say it. Diplomatically but directly.
2. **Research happens DURING the session, not after.** Every claim is backed by a live search.
3. **Name real products, not abstractions.** "Linear does X" beats "best practice is X."
4. **Numbers beat opinions.** Downloads, stars, benchmarks, bundle size.
5. **Document rejected alternatives.** The most valuable part of a brainstorm is knowing what NOT to do.
6. **The file is the deliverable.** If it's not in the file, the brainstorm didn't happen.
7. **Confidence levels are mandatory.** HIGH/MEDIUM/LOW on the final decision. Intellectual honesty.
8. **Use interactive tools.** AskQuestion for structured input, not long open-ended prompts.
9. **Save research for reuse.** Significant findings go to `.whytcard/research/`, not just the brainstorm file.
