---
name: wc-plan
description: Creates a complete A-Z implementation plan from brainstorm output. Re-runs research, version checks, and visual verification to confirm decisions. Generates HTML visual templates showing multiple style directions. Produces a wc-plan-{project}-{date}.md and companion visual files. Use after brainstorming, before building.
---

# Planning Protocol

You are turning a brainstorm into a buildable blueprint. This is the bridge between "we decided X" and "here's exactly how we build X." The plan must be complete enough that execution is mechanical — no design decisions left open.

## Inputs

Before starting, locate and read:
1. The brainstorm file (`wc-brainstorm-*.md`) — this is the source of truth for decisions
2. Any existing codebase context (package.json, file structure, existing code)
3. The project's tech stack (from session-start hook or manual detection)

If no brainstorm file exists, tell the user to run `/wc-brainstorm` first. Do not plan without a brainstorm.

## Output files

### Main plan
```
wc-plan-{project}-{YYYY-MM-DD}.md
```

### Visual templates (if the project has UI)
```
wc-plan-{project}-visuals/
├── style-a.html    ← self-contained, openable in browser
├── style-b.html
├── style-c.html    ← optional third direction
└── README.md       ← explains each style, how to preview
```

- `{project}`: kebab-case, 2-4 words
- Location: project root, or `docs/plans/` if that directory exists

## The 6 phases

### Phase 1 — VERIFY (re-validate brainstorm decisions)

Do not blindly trust the brainstorm. Things change. Re-run verification:

**For every technology decision from the brainstorm:**
- Version check: is the version still current? Any new releases since the brainstorm?
- Security: any CVEs or security advisories published since?
- Alternatives: did anything new emerge that's better?

**For every architectural decision:**
- Does it still hold given what we now know?
- Are there implementation details that change the calculus?

**For every rejected option:**
- Confirm it's still rejected. Don't re-open debates, but verify the reasons still apply.

Report: "Verified X decisions from brainstorm. Y confirmed, Z updated."

If you find something significantly better than what the brainstorm decided, flag it:
- "The brainstorm chose X, but since then Y was released which [specific advantage]. Recommend revisiting."

### Phase 2 — ARCHITECT (system design)

Define the complete architecture:

**Project structure:**
```
{project}/
├── {every directory}
│   └── {every file that will exist}
└── {nothing left to guess}
```

For EACH file, state:
- Purpose (one line)
- Key exports / responsibilities
- Dependencies (what it imports from)

**Data model** (if applicable):
- Every table/collection with fields, types, constraints
- Relationships (foreign keys, references)
- Indexes needed for performance

**API surface** (if applicable):
- Every endpoint: method, path, request body, response shape
- Authentication requirements per endpoint
- Rate limiting strategy

**State management:**
- What lives on the server vs. client
- Caching strategy
- Optimistic updates (if any)

### Phase 3 — DESIGN (visual direction)

Skip this phase if the project has no UI. For UI projects:

**Generate 2-3 visual directions as complete HTML files.**

Each HTML file must be:
- Self-contained (inline CSS, no external dependencies)
- Representative of the ACTUAL app (not lorem ipsum — use realistic content from the brainstorm)
- Complete enough to judge: header, main content area, key components, footer
- Dark mode included (via CSS media query or toggle)
- Responsive (mobile-first with breakpoints)
- Professional quality — this is what the user will judge the project by

Each style direction should be genuinely different:
- **Style A**: [describe the aesthetic — e.g., "minimal, lots of whitespace, monochrome with one accent"]
- **Style B**: [different aesthetic — e.g., "dense, data-rich, dark theme with neon accents"]
- **Style C**: [optional third direction — e.g., "warm, approachable, rounded corners, earth tones"]

The `README.md` in the visuals folder explains:
- How to preview (just open in browser)
- What each style represents
- Key differences between them
- Which the agent recommends and why

**After generating, ask the user to pick** before proceeding. The chosen style becomes the design spec for execution.

### Phase 4 — PLAN INCREMENTS (build order)

Break the project into numbered increments. Each increment must be:

1. **Self-contained**: builds on previous, but works on its own after completion
2. **Testable**: has concrete verification criteria
3. **Small enough**: completable in one focused session (< 50 files changed)
4. **Ordered by dependency**: foundations first, features second, polish third

Format for each increment:
```markdown
### Increment {N}: {Name}

**Goal**: {one sentence}
**Files**: {list of files to create/modify}
**Dependencies**: requires increment {X} complete
**Verification**:
- [ ] {specific, testable criterion}
- [ ] {another criterion}
- [ ] {visual verification if UI: screenshots at 3 viewports}
**Estimated scope**: {S/M/L}
```

Typical increment order:
1. Project setup (deps, config, structure)
2. Data layer (database, schemas, types)
3. Core logic (business rules, utilities)
4. API layer (routes, handlers, middleware)
5. UI foundation (layout, navigation, theming)
6. Feature increments (one per feature)
7. Integration (connecting all pieces)
8. Polish (animations, loading states, error handling)
9. Testing (unit, integration, e2e)
10. i18n, accessibility, responsive
11. Performance optimization
12. Final review and cleanup

### Phase 5 — RISK REGISTER

Identify what could go wrong during execution:

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| {specific risk} | LOW/MED/HIGH | LOW/MED/HIGH | {concrete action} |

Focus on:
- Technical risks (API changes, compatibility issues, performance bottlenecks)
- Scope risks (features more complex than estimated)
- Dependency risks (package deprecation, breaking changes)
- Integration risks (parts that don't fit together)

### Phase 6 — DOCUMENT

Write the plan file. It must be complete enough that someone (or an AI) can execute it without asking questions.

## Plan file structure

```markdown
# Plan: {Project Name}

**Date**: {YYYY-MM-DD}
**Based on**: wc-brainstorm-{subject}-{date}.md
**Status**: {DRAFT | APPROVED | IN PROGRESS | COMPLETED}
**Chosen visual style**: {A/B/C} (if applicable)

---

## Overview

{What we're building, in 2-3 sentences. Written for someone who hasn't read the brainstorm.}

## Tech Stack (verified)

| Technology | Version | Purpose | Verified |
|---|---|---|---|
| {tech} | {exact version} | {why} | {date checked} |

## Architecture

### Project Structure
{complete file tree}

### Data Model
{tables, fields, relationships}

### API Surface
{endpoints with shapes}

### State Management
{client vs server, caching}

## Visual Direction

{Which style was chosen and why. Reference the HTML template files.}

## Increments

### Increment 1: {name}
{full increment detail as defined in Phase 4}

### Increment 2: {name}
...

## Risk Register

{table from Phase 5}

## Verification Criteria

{How we know the project is done. Concrete, measurable.}

## Open Items

{Anything that needs user input before execution can start.}

## Sources

{All URLs consulted during planning.}
```

## Critical rules

1. **The plan is the contract.** Execution follows the plan. Changes go through a plan amendment, not ad-hoc decisions during coding.
2. **Every technology is version-pinned and verified.** No "latest" — exact version numbers, checked live.
3. **Visual templates are real.** Not wireframes, not mockups. Actual HTML the user can open and evaluate.
4. **Increments are executable.** Each one has files, criteria, and verification. No vague "implement feature X."
5. **The user approves before execution.** The plan is a proposal. `/wc-execute` only starts after explicit approval.
