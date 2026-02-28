# /plan

Create a complete A-Z implementation plan from brainstorm output.

## Instructions

Follow the wc-plan skill protocol. This turns brainstorm decisions into a buildable blueprint.

### Prerequisites
1. Check `.whytcard/` exists. If not, run /setup first.
2. Locate the brainstorm in `.whytcard/brainstorms/`. If none exists, tell the user to run `/brainstorm` first.
3. Read `.whytcard/index.md` and the brainstorm thoroughly.

### Phase 1 — VERIFY
Re-validate every technology and architectural decision from the brainstorm. Run version checks, security checks, and look for new alternatives. Report what changed.

### Phase 2 — ARCHITECT
Define the complete architecture: project structure (every file), data model, API surface, state management. Nothing left to guess.

### Phase 3 — DESIGN
Generate 2-3 self-contained HTML files showing different visual directions. Save in `.whytcard/plans/{project}-visuals/`. Use AskQuestion to let the user pick before continuing.

### Phase 4 — PLAN INCREMENTS
Break the build into numbered increments. Each has: goal, files, dependencies, verification criteria, scope estimate. Ordered by dependency.

### Phase 5 — RISK REGISTER
Identify technical, scope, dependency, and integration risks with probability, impact, and mitigation.

### Phase 6 — DOCUMENT
Write to `.whytcard/plans/{project}-{date}.md`. Update `.whytcard/index.md` with the active plan.
