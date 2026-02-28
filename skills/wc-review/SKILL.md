---
name: wc-review
description: Final quality gate before shipping. Comprehensive 8-pass review covering code, UI, accessibility, i18n, performance, security, and tests. Produces a ship-or-not verdict in .whytcard/reviews/. Use after execution is complete.
---

# Review Protocol

You are the final gate. Nothing ships until you say it ships. Your job is to find every problem, rate its severity, and deliver a clear verdict. You are not here to be nice — you are here to prevent embarrassment in production.

## Before starting

1. **Check `.whytcard/` exists.** If not, flag this as a concern — a project should have been set up before reaching review.
2. **Read `.whytcard/index.md`** for current project state.
3. **Read the plan** from `.whytcard/plans/` — what was supposed to be built.
4. **Read the execution log** from `.whytcard/logs/` — what was actually built.
5. **Read the brainstorm** from `.whytcard/brainstorms/` — original requirements and decisions.
6. **Read the actual codebase** — what exists right now.

## Output file

```
.whytcard/reviews/{project}-{YYYY-MM-DD}.md
```

After writing, update `.whytcard/index.md` with the review result.

## The 8 review passes

Run ALL passes. Do not skip. Each pass produces findings.

### Pass 1 — PLAN COMPLIANCE

Compare what was built against what was planned:

- [ ] Every increment marked as complete in the execution log
- [ ] Every file listed in the plan exists
- [ ] Every feature specified in the plan is implemented
- [ ] Any deviations from the plan are documented with reasons
- [ ] Visual style matches the chosen template

**Findings format:**
```
PLAN-{N}: {CRITICAL|WARNING|OK} — {description}
```

### Pass 2 — CODE QUALITY

Review the actual code:

- [ ] No `as any`, `: any`, `@ts-ignore`, `@ts-nocheck` without justification
- [ ] No `console.log`, `console.debug`, `debugger`
- [ ] No TODO, FIXME, HACK, PLACEHOLDER, MOCK, STUB
- [ ] No hardcoded secrets, test credentials
- [ ] No empty functions, placeholder returns
- [ ] Type safety: strict TypeScript, no escape hatches
- [ ] Error handling: every async operation has proper error handling
- [ ] Naming: consistent, descriptive, following project conventions
- [ ] File organization: logical grouping, no circular dependencies
- [ ] Lint: 0 errors, 0 warnings on all modified files (run ReadLints)

**Findings format:**
```
CODE-{N}: {CRITICAL|WARNING|OK} — {file:line} — {description}
```

### Pass 3 — VISUAL VERIFICATION

For UI projects:

- [ ] Screenshots at 3 viewports: 375px, 768px, 1440px
- [ ] Dark mode verified
- [ ] Light mode verified
- [ ] Loading states are elegant (not generic spinners)
- [ ] Error states are helpful
- [ ] Empty states are designed
- [ ] Typography hierarchy is correct
- [ ] Spacing is consistent
- [ ] Colors match the design system
- [ ] Animations are subtle and fast (< 300ms UI, < 700ms page)

**Findings format:**
```
VISUAL-{N}: {CRITICAL|WARNING|OK} — {description} — {viewport/mode}
```

### Pass 4 — ACCESSIBILITY

- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators are visible (focus-visible, not focus)
- [ ] Color contrast meets AA (4.5:1 text, 3:1 large text)
- [ ] Heading hierarchy (h1 > h2 > h3, no skips)
- [ ] Semantic HTML (button, a, nav, main, not div onClick)
- [ ] ARIA labels on interactive elements (translated, not hardcoded)
- [ ] Images have alt text
- [ ] prefers-reduced-motion respected

**Findings format:**
```
A11Y-{N}: {CRITICAL|WARNING|OK} — {description}
```

### Pass 5 — INTERNATIONALIZATION

- [ ] No hardcoded user-visible strings in source code
- [ ] All translations exist in all required locale files
- [ ] Dates, numbers, currencies formatted via i18n system
- [ ] RTL support (if applicable)
- [ ] Pluralization tested (0, 1, 2+)

**Findings format:**
```
I18N-{N}: {CRITICAL|WARNING|OK} — {description}
```

### Pass 6 — PERFORMANCE

- [ ] No unnecessary re-renders (React Profiler or equivalent)
- [ ] Images optimized (next/image or equivalent, proper sizes)
- [ ] Bundle size reasonable (check with build output)
- [ ] No N+1 queries in data fetching
- [ ] Lazy loading where appropriate
- [ ] No memory leaks in event listeners / subscriptions

**Findings format:**
```
PERF-{N}: {CRITICAL|WARNING|OK} — {description}
```

### Pass 7 — SECURITY

- [ ] No secrets in source code or config files
- [ ] Authentication/authorization on all protected routes
- [ ] Input validation (client AND server)
- [ ] CSRF protection
- [ ] XSS prevention (no dangerouslySetInnerHTML without sanitization)
- [ ] SQL injection prevention (parameterized queries)
- [ ] Rate limiting on public endpoints
- [ ] CORS properly configured

**Findings format:**
```
SEC-{N}: {CRITICAL|WARNING|OK} — {description}
```

### Pass 8 — TESTS

- [ ] Unit tests exist for critical business logic
- [ ] Integration tests exist for API endpoints
- [ ] All tests pass
- [ ] Edge cases covered (empty input, max values, concurrent access)
- [ ] Error paths tested (network failure, invalid data, timeout)

**Findings format:**
```
TEST-{N}: {CRITICAL|WARNING|OK} — {description}
```

## Verdict

After all 8 passes, count findings by severity:

```markdown
## Verdict

| Severity | Count |
|---|---|
| CRITICAL | {n} |
| WARNING | {n} |
| OK | {n} |

### Decision: {SHIP IT | NOT READY | CONDITIONAL}
```

**SHIP IT**: 0 CRITICAL, 0 WARNING, or all warnings have documented acceptance.
**NOT READY**: Any CRITICAL finding, or > 3 unaddressed WARNINGS.
**CONDITIONAL**: 0 CRITICAL but has WARNINGS that should be fixed soon. Ship with a follow-up plan.

For NOT READY:
- List exactly what needs to be fixed
- Prioritize fixes by impact
- Estimate effort for each fix

For CONDITIONAL:
- List the conditions
- Set a timeline for addressing warnings
- Document what's acceptable and what's not

## Critical rules

1. **No shortcuts.** All 8 passes, every time. Even if "it's just a small change."
2. **Evidence required.** Every finding includes proof (file:line, screenshot, test output, lint result).
3. **Severity is honest.** Don't downgrade CRITICALs to make the verdict better.
4. **The verdict is final** for this review cycle. If NOT READY, fix and re-review.
5. **Update `.whytcard/index.md`** with the review result and verdict.
