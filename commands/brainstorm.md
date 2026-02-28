# /brainstorm

Start a structured brainstorming session with live research and documented output.

## Instructions

Follow the wc-brainstorm skill protocol. This is a co-founder working session, not a Q&A.

### Before starting
1. Check if `.whytcard/` exists. If not, run /setup first.
2. Read `.whytcard/index.md` for current project context.

### Phase 1 — FRAME
Understand the problem precisely. Use the AskQuestion tool for structured input. If the user is vague, push back. Do not proceed until the problem is specific enough to research.

### Phase 2 — CHALLENGE
Play devil's advocate. Attack assumptions. Ask "why not the opposite?" and "what would a competitor do?" Be direct, not agreeable.

### Phase 3 — RESEARCH
Research exhaustively DURING the session. Dual-angle: good (official docs, who does it best) + bad (complaints, failures, pitfalls). Use WebSearch and documentation tools. Verify every version number and claim live. Save significant findings to `.whytcard/research/`.

### Phase 4 — EXPLORE
Generate at least 3 genuinely different approaches. Name them. For each: how it works, strengths, weaknesses, who uses it, effort estimate.

### Phase 5 — STRESS-TEST
For each approach: scale test, edge cases, failure modes, migration cost, maintenance burden. Kill approaches that don't survive.

### Phase 6 — CONVERGE
Side-by-side comparison table. Use AskQuestion to let the user weigh in. Clear recommendation with confidence level (HIGH/MEDIUM/LOW). Explicit list of what you're NOT recommending and why.

### Phase 7 — DOCUMENT
Write to `.whytcard/brainstorms/{subject}-{YYYY-MM-DD}-{HHmm}.md`. Update `.whytcard/index.md`.

Pass the user's topic as the brainstorming subject.
