# /execute

Build the project by executing the plan increment by increment.

## Instructions

Follow the wc-execute skill protocol. This is fully automated construction from a validated plan.

### Prerequisites
1. Check `.whytcard/` exists. If not, run /setup first.
2. Locate the plan in `.whytcard/plans/`. If none exists, tell the user to run `/plan` first.
3. Confirm the plan status is APPROVED (not DRAFT). If draft, ask the user to approve.
4. If a log already exists in `.whytcard/logs/`, read it to resume from the last completed increment.

### Execution loop
For each increment in order:
1. Read the increment details from the plan
2. Announce what you're building
3. Build: create/modify all specified files
4. Verify: lint, types, build, visual (if UI), tests
5. Log: update `.whytcard/logs/{project}-{date}.md`
6. If pass: next increment. If fail: fix (max 3 attempts), then stop.

### Key rules
- One increment at a time. Complete and verify before moving on.
- Re-read the plan at the start of each increment (don't rely on memory).
- Use all applicable skills: visual verification for UI, version check for dependencies.
- Log every deviation from the plan with justification.
- If the plan is fundamentally wrong, STOP and tell the user.

### On completion
Run `/review` for the final quality gate. Update `.whytcard/index.md`.
