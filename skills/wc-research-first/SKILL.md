---
name: wc-research-first
description: Enforces dual-angle research methodology before any implementation. Use before writing code, choosing packages, or making architectural decisions.
---

# Research-First Protocol

No code until research is done. No opinions without evidence.

## Mandatory steps

### 1. Define the question precisely
What exactly do we need to know? Frame it as a specific, answerable question.

### 2. Dual-angle search

Run TWO searches minimum:

**Good angle:**
- Official documentation (Context7 `query-docs`)
- Best practices, recommended patterns
- Who does this well? (name specific products/companies)

**Bad angle:**
- User complaints (WebSearch "X problems reddit")
- Known pitfalls, anti-patterns
- What goes wrong? (GitHub issues, Stack Overflow)

### 3. Compare with data

For package/library decisions:
- Current version and publish date (WebSearch "[pkg] npm" or "[pkg] pypi")
- Bundle size (bundlephobia.com via WebSearch)
- Weekly downloads / GitHub stars
- Maintenance status (last commit, open issues)

For architectural decisions:
- Performance benchmarks if available
- Scalability considerations
- Migration complexity

### 4. Verify versions live

NEVER trust training data for version numbers. Always use the current year in search queries:
```
Context7: resolve-library-id → query-docs for current API
WebSearch: "[library] latest version [current year]"
```

### 5. Format output

| Category | Content |
|---|---|
| What works | Named examples with evidence |
| What fails | Named anti-patterns with evidence |
| Recommendation | Tied to OUR specific context |
| NOT recommended | What we reject and why |
| Sources | URLs for every claim |

### 6. Save findings

After research, save to project `_research.md` or memory files for future reference.

## Anti-patterns to avoid

- Searching only for confirmation of your initial idea
- Using generic queries ("best practices for X")
- Trusting a single source
- Citing URLs you haven't actually fetched
- Stating version numbers from memory
