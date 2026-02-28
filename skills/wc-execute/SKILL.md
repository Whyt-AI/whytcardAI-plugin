---
name: wc-execute
description: Executes a plan created by /wc-plan. Builds the project increment by increment, using all hooks and skills to maintain quality throughout. Tracks progress in a running log. Runs /wc-review at completion. Use after the plan is approved by the user.
---

# Execution Protocol

You are building a project from a validated plan. The plan is the contract. Follow it precisely. When you deviate, document why.

## Inputs

Before starting, locate and read:
1. The plan file (`wc-plan-*.md`) — this is the blueprint
2. The brainstorm file (`wc-brainstorm-*.md`) — for context on decisions
3. The chosen visual template (if UI project) — for design reference
4. The project's current state — what already exists

If no plan file exists, tell the user to run `/wc-plan` first. Do not execute without a plan.
If the plan status is DRAFT (not APPROVED), ask the user to review and approve it first.

## Output files

### Progress log (created at start, updated throughout)
```
wc-execution-log-{project}-{YYYY-MM-DD}.md
```

This file tracks everything: what was built, what was verified, what deviated from the plan, and why.

## Execution rules

### Rule 1: Follow the increment order

Build increments in the order specified by the plan. Do not skip ahead. Do not reorder unless a blocking dependency forces it (document the reason).

### Rule 2: One increment at a time

Complete and verify one increment before starting the next. Never have two increments in progress simultaneously.

### Rule 3: Verify after every increment

After completing each increment, run ALL applicable verifications:

**Always:**
- Lint check (ReadLints on all modified files)
- Type check if TypeScript project
- Build check if build system exists

**If UI was modified:**
- Visual verification: screenshots at 3 viewports (375/768/1440px)
- Dark mode check
- Responsive check
- Accessibility: focus indicators, contrast, semantic HTML

**If dependencies were added:**
- Version verification: confirm installed versions match the plan
- Bundle size check for frontend packages

**If API was modified:**
- Test endpoints with concrete requests
- Verify error handling

**If data model was modified:**
- Verify schema/migration runs cleanly
- Test with sample data

### Rule 4: Log everything

Update `wc-execution-log-{project}-{date}.md` after EACH increment:

```markdown
## Increment {N}: {Name}

**Status**: COMPLETE | IN PROGRESS | BLOCKED
**Started**: {HH:mm}
**Completed**: {HH:mm}

### What was built
- {file}: {what was created/modified}

### Verifications
- [ ] Lint: {PASS/FAIL — details}
- [ ] Types: {PASS/FAIL}
- [ ] Build: {PASS/FAIL}
- [ ] Visual: {PASS/FAIL — screenshots taken}
- [ ] Tests: {PASS/FAIL — count}

### Deviations from plan
- {None, or: what changed and why}

### Issues encountered
- {None, or: issue + resolution}

### Next increment ready: YES/NO
```

### Rule 5: Handle deviations

When something doesn't work as planned:

1. **Try the plan first.** Give it a fair shot before deviating.
2. **If the plan doesn't work**, diagnose why. Is it a bug in the plan, or a changed external factor?
3. **Small deviations** (different utility class, slightly different API shape): implement and document.
4. **Large deviations** (different architecture, different library, missing feature): STOP. Tell the user. Propose the change. Get approval before continuing.
5. **Never silently deviate.** The log must reflect every change from the plan.

### Rule 6: Re-dispatch at each increment

At the start of each increment, re-invoke the relevant skills:

- **UI increment** → wc-visual-verify after completion
- **Dependency increment** → wc-version-check before installing
- **Research-heavy increment** → wc-research-first if encountering unknowns
- **Any increment** → wc-dispatch to check if specialized skills apply

This keeps the quality loop tight even in hour-long sessions.

### Rule 7: Context preservation

Long sessions lose context. Counter this:

- Re-read the plan file at the START of each increment (not from memory)
- Re-read the execution log to know what's already done
- If you feel uncertain about a decision made earlier, re-read the brainstorm
- The files ARE the context. Memory is unreliable.

## Execution flow

```
For each increment in the plan:
  1. Read plan → extract increment details
  2. Read execution log → confirm previous increments complete
  3. Announce: "Starting Increment {N}: {name}"
  4. Build: create/modify files as specified
  5. Verify: run all applicable checks
  6. Log: update execution log with results
  7. If all verifications pass → proceed to next
  8. If any verification fails → fix, re-verify, log the fix
  9. After 3 failed fix attempts → STOP, report to user
```

## After all increments complete

1. Run `/wc-review` (the final quality gate)
2. Update plan status to COMPLETED (or IN PROGRESS if review finds issues)
3. Update execution log with final summary

## Execution log structure

```markdown
# Execution Log: {Project Name}

**Plan**: wc-plan-{project}-{date}.md
**Started**: {YYYY-MM-DD HH:mm}
**Status**: IN PROGRESS | COMPLETED | BLOCKED

---

## Summary

| Increment | Status | Duration | Issues |
|---|---|---|---|
| 1. {name} | COMPLETE | {time} | {0 or count} |
| 2. {name} | COMPLETE | {time} | {0 or count} |
| ... | ... | ... | ... |

---

## Increment 1: {Name}
{full log as defined in Rule 4}

## Increment 2: {Name}
...

---

## Final Review

**Ran at**: {timestamp}
**Verdict**: {SHIP | NOT READY}
**Details**: {link to review output or inline}
```

## Emergency protocols

### Session approaching context limit
If you sense the session is getting very long:
1. Complete the current increment
2. Log progress
3. Tell the user: "Session is long. Current state: Increment X of Y complete. To resume, start a new session and run `/wc-execute` — I'll pick up from the log."

### Unexpected error in framework/library
1. Document the exact error
2. Research: is this a known issue? (WebSearch "[framework] [error] [year]")
3. If known fix exists: apply and log
4. If unknown: STOP, report to user with full context

### Plan is wrong
If you discover the plan has a fundamental flaw (wrong assumption, impossible requirement):
1. STOP execution
2. Document the flaw in the execution log
3. Tell the user: "Plan needs amendment. Issue: [specific]. Recommend: [fix]. Should I update the plan?"
4. Do NOT continue building on a flawed foundation
