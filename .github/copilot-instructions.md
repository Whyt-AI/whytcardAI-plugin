# Copilot Instructions — WhytCard AI

This repository uses the WhytCard AI development methodology. All AI-assisted work follows these principles.

## Before doing anything

1. Check if `.whytcard/` exists in the project root. If it does, read `.whytcard/index.md` to understand the current project state, active plans, and recent decisions.
2. If `.whytcard/` doesn't exist, **run onboarding automatically** (do NOT ask the user to run slash commands).

### Onboarding (no commands)

Ask the user ONCE (default = GLOBAL):
- **KB mode**: GLOBAL (recommended) or LOCAL
- If GLOBAL: **where should the global root live?** (default: `~/.whytcard` or `%USERPROFILE%\\.whytcard`)

Then create the knowledge base:
- **GLOBAL**:
  - Create: `{globalRoot}/projects/{projectSlug}-{projectId}/docs/{brainstorms,plans,research,logs,reviews,stacks,context,etc,instructions}/`
  - Create: `{globalRoot}/projects/{projectSlug}-{projectId}/instructions/`
  - Create: `{globalRoot}/projects/{projectSlug}-{projectId}/meta.json` (repo path, projectId, createdAt, stack)
  - Attach the repo by linking: `.whytcard -> {globalProjectDir}/docs` (symlink/junction). If linking fails: fall back to LOCAL.
- **LOCAL**:
  - Create: `.whytcard/{brainstorms,plans,research,logs,reviews,stacks,context,etc,instructions}/` + `.whytcard/index.md`

Persist the choice so it never asks again on this machine:
- Write a locator: `~/.whytcard/locator.json` with `{ globalRoot }`
- Write config: `{globalRoot}/config.json` with `{ version, kbMode, globalRoot, confirmed:true }`

## Non-negotiable rules

### Research before opinions
Never recommend a technology, pattern, or approach without first checking:
- Official documentation (current version)
- Real user experiences (good AND bad)
- Alternatives with concrete comparisons (data, not vibes)
- Current version numbers (never from memory)

### Prove before claiming
- "This should work" is not acceptable. Verify.
- "I recommend X" requires comparing with Y and Z.
- "Latest version is..." requires a live check.
- "This looks correct" requires visual verification for UI work.

### Visual verification for UI
After any UI change, verify at:
- Mobile (375px), Tablet (768px), Desktop (1440px)
- Dark mode AND light mode
- Evaluate as an end user, not a developer

### UX-first
Every decision passes: "If I were a non-technical user, would this make sense?"

### Version discipline
- Never install a package without checking its current version
- Never trust training data for version numbers
- Check publish date: > 1 year without updates is a warning sign
- Prefer lighter alternatives for same functionality

## Project structure

All project knowledge is stored in `.whytcard/`:

```
.whytcard/
├── index.md          ← Start here. Project state summary.
├── brainstorms/      ← Exploration and decision documents
├── plans/            ← Implementation blueprints
├── logs/             ← Execution progress tracking
├── reviews/          ← Quality gate results
├── research/         ← Reusable research findings
└── context/          ← Session history and decisions
```

## How to work

1. **Read context first**: `.whytcard/index.md` tells you where things stand
2. **Research before code**: dual-angle (what works + what fails)
3. **Build incrementally**: follow plans, verify after each step
4. **Log everything**: update `.whytcard/` files as you work
5. **Be honest**: flag unknowns, don't fill gaps with assumptions
