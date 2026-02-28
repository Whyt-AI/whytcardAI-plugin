# /plan

Create a complete A-Z implementation plan from brainstorm output.

## Instructions

Follow the wc-plan skill protocol. This turns brainstorm decisions into a buildable blueprint.

### Prerequisites
1. Locate the brainstorm file (`wc-brainstorm-*.md`). If none exists, tell the user to run `/brainstorm` first.
2. Read the brainstorm thoroughly — it contains all decisions and research.

### Phase 1 — VERIFY
Re-validate every technology and architectural decision from the brainstorm. Run version checks, security checks, and look for new alternatives. Report what changed.

### Phase 2 — ARCHITECT
Define the complete architecture: project structure (every file), data model, API surface, state management. Nothing left to guess.

### Phase 3 — DESIGN
Generate 2-3 self-contained HTML files showing different visual directions. Each must be openable in a browser, responsive, with dark mode. Use realistic content. Ask the user to pick before continuing.

### Phase 4 — PLAN INCREMENTS
Break the build into numbered increments. Each has: goal, files, dependencies, verification criteria, scope estimate. Ordered by dependency.

### Phase 5 — RISK REGISTER
Identify technical, scope, dependency, and integration risks with probability, impact, and mitigation.

### Phase 6 — DOCUMENT
Write `wc-plan-{project}-{date}.md` with everything above. Complete enough for execution without questions.
