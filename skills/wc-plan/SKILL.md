---
name: wc-plan
description: Creates a complete A-Z implementation plan from brainstorm output. Re-runs research and version checks to confirm decisions. Generates HTML visual templates showing multiple style directions. Produces plan files in .whytcard/plans/. Use after brainstorming, before building.
---

# Planning Protocol

You are turning a brainstorm into a buildable blueprint. This is the bridge between "we decided X" and "here's exactly how we build X." The plan must be complete enough that execution is mechanical — no design decisions left open.

## Before starting

1. **Check `.whytcard/` exists.** If not, run the wc-setup protocol first.
2. **Read `.whytcard/index.md`** for current project state.
3. **Read the brainstorm** from `.whytcard/brainstorms/` — this is the source of truth for decisions.
4. **Check `.whytcard/research/`** for existing research findings.
5. **Read existing codebase context** (package.json, file structure, existing code).

If no brainstorm file exists, tell the user to run `/brainstorm` first. Do not plan without a brainstorm.

## Output files

### Main plan
```
.whytcard/plans/{project}-{YYYY-MM-DD}.md
```

### Visual templates (if the project has UI)
```
.whytcard/plans/{project}-visuals/
├── style-a.html
├── style-b.html
├── style-c.html   (optional)
└── README.md
```

- `{project}`: kebab-case, 2-4 words

After writing, update `.whytcard/index.md`.

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
- **Style A**: [describe the aesthetic]
- **Style B**: [different aesthetic]
- **Style C**: [optional third direction]

The `README.md` in the visuals folder explains:
- How to preview (just open in browser)
- What each style represents
- Key differences between them
- Which the agent recommends and why

**After generating, use the AskQuestion tool** to let the user pick a style before proceeding. The chosen style becomes the design spec for execution.

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

### Phase 5 — RISK REGISTER

Identify what could go wrong during execution:

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| {specific risk} | LOW/MED/HIGH | LOW/MED/HIGH | {concrete action} |

### Phase 6 — DOCUMENT

Write the plan file to `.whytcard/plans/`. It must be complete enough that someone (or an AI) can execute it without asking questions.

Update `.whytcard/index.md`:
- Increment plan count
- Set "Active Plan" to point to this plan
- Add to decision log

## Critical rules

1. **The plan is the contract.** Execution follows the plan. Changes go through a plan amendment, not ad-hoc decisions during coding.
2. **Every technology is version-pinned and verified.** No "latest" — exact version numbers, checked live.
3. **Visual templates are real.** Not wireframes, not mockups. Actual HTML the user can open and evaluate.
4. **Increments are executable.** Each one has files, criteria, and verification. No vague "implement feature X."
5. **The user approves before execution.** The plan is a proposal. `/execute` only starts after explicit approval.
