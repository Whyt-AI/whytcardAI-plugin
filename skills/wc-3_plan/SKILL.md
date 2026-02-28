---
name: wc-3_plan
description: Creates a complete A-Z implementation plan from brainstorm output. Step 3 of the numbered WhytCard pipeline.
---

# Planning Protocol (Step 3)

You are turning a brainstorm into a buildable blueprint. The plan must be complete enough that execution is mechanical — no key decisions left open.

## Before starting

1. Check `.whytcard/` exists. If not, run `/wc-1_setup`.
2. Read `.whytcard/index.md`.
3. Locate and read the latest brainstorm in `.whytcard/brainstorms/`.
   - If none exists: stop and instruct the user to run `/wc-2_brainstorm` first.
4. Check `.whytcard/research/` for relevant findings.
5. Read codebase context (top-level structure, package manifests, existing conventions).

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
└── README.md
```

After writing, update `.whytcard/index.md` and set the “Active Plan”.

## The 6 phases

### Phase 1 — VERIFY (re-validate decisions)

Re-check the brainstorm decisions:
- Are technology choices still valid?
- Any security advisories / major changes?
- Any better alternatives that materially change the decision?

If something major changed, flag it explicitly.

### Phase 2 — ARCHITECT (system design)

Define the complete architecture:
- File tree (every directory + file that will exist)
- For each file: purpose, key exports, dependencies
- API surface (if applicable): endpoints, auth, error shapes
- Data model (if applicable): entities/tables, constraints, indexes
- State management and caching strategy (if applicable)

### Phase 3 — DESIGN (if UI)

Generate 2 distinct self-contained HTML directions:
- Mobile-first
- Responsive (include breakpoints)
- Dark + light mode
- Realistic content (not lorem ipsum)

Include `README.md` explaining how to preview and what each style represents.

If a user choice is needed (style A vs B), ask. Otherwise, pick one and justify the choice in the plan.

### Phase 4 — PLAN INCREMENTS (build order)

Break into numbered increments. Each increment must be:
- self-contained
- testable (concrete verification criteria)
- ordered by dependency

Template:
```markdown
### Increment {N}: {Name}

**Goal**: {one sentence}
**Files**: {list of files to create/modify}
**Dependencies**: requires increment {X} complete
**Verification**:
- [ ] {specific criterion}
- [ ] {specific criterion}
**Estimated scope**: {S/M/L}
```

### Phase 5 — RISK REGISTER

Add a risk table:
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| ... | ... | ... | ... |

### Phase 6 — DOCUMENT

Write the plan to `.whytcard/plans/` and update `.whytcard/index.md`.

## Critical rule

Execution follows the plan. Any major deviation requires documenting a plan amendment.

