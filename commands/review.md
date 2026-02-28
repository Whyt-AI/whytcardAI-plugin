# /review

Run the final quality gate on the project. Ship-or-not verdict.

## Instructions

Follow the wc-review skill protocol. This is the last checkpoint before shipping.

### Prerequisites
1. Locate the plan (`wc-plan-*.md`) and execution log (`wc-execution-log-*.md`).
2. If no plan exists, review the project as-is against general quality standards.

### The 8 passes (all mandatory)

1. **Plan compliance** — was everything in the plan actually built?
2. **Code quality** — no debug artifacts, no placeholders, no type escapes, proper error handling
3. **Visual verification** — screenshots at 3 viewports, dark mode, both evaluated as a user
4. **Accessibility** — keyboard nav, focus indicators, semantic HTML, contrast AA, ARIA labels
5. **i18n** — no hardcoded strings, all locales have all keys, proper date/number formatting
6. **Performance** — bundle size, image optimization, data fetching, loading states
7. **Security** — no secrets in code, input validation, auth checks, CORS, dependencies audit
8. **Tests** — coverage, quality, run results, edge cases

### Verdict
- **SHIP IT**: zero CRITICAL, minimal WARNINGs
- **NOT READY**: CRITICAL findings exist, with action items and fix suggestions
- **CONDITIONAL**: no CRITICAL but significant WARNINGs, with conditions for shipping

### Output
Write `wc-review-{project}-{date}.md` with the findings summary table, all detailed findings with evidence, and the verdict.
