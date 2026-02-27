---
name: wc-version-check
description: Verify current versions of any package or library before installing or recommending. Use before any npm install, pip install, or technology recommendation.
---

# Version Check Protocol

Never install or recommend a package without verifying its current state.

## Steps

### 1. Check current version
```
WebSearch: "[package-name] latest version [current year]"
Documentation tools: look up package info and current version
```

### 2. Check maintenance status
- Last publish date (> 1 year = warning flag)
- Open issues count
- Last commit date
- Active maintainers

### 3. Check alternatives
```
WebSearch: "[package-name] vs alternatives [current year]"
WebSearch: "best [category] package [current year] comparison"
```

### 4. Check bundle impact (for frontend packages)
```
WebSearch: "[package-name] bundlephobia"
```

### 5. Decision criteria

| Factor | Good | Warning | Bad |
|---|---|---|---|
| Last publish | < 3 months | 3-12 months | > 1 year |
| Open issues | < 50 | 50-200 | > 200 unresolved |
| Weekly downloads | Growing | Stable | Declining |
| Bundle size | < 50KB | 50-200KB | > 200KB (unless justified) |
| TypeScript | Native types | @types package | No types |

### 6. Output

State clearly:
- Package name and version you recommend
- Why this one over alternatives
- Any caveats or known issues
- Installation command with exact version
