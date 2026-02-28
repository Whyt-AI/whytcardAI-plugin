---
name: wc-setup
description: Initializes the .whytcard/ knowledge base directory in the current project. Creates a structured, evolving local database for brainstorms, plans, research, execution logs, reviews, and context. Run this once per project — subsequent commands auto-detect and use the existing .whytcard/ structure.
---

# Setup Protocol

You are initializing the WhytCard project knowledge base. This is the local, structured directory that all other commands (`/brainstorm`, `/plan`, `/execute`, `/review`) read from and write to.

## What .whytcard/ is

A project-level knowledge base. Not a pile of files — a structured, evolving directory that:
- Stores every brainstorm, plan, execution log, and review
- Tracks research findings and context across sessions
- Maintains a project index that summarizes current state
- Cleans itself: old files get archived, not deleted

## Steps

### 1. Detect existing structure

Check if `.whytcard/` already exists in the project root.

- If it exists: read `.whytcard/index.md` and report current state. Ask if the user wants to reset or continue.
- If it does not exist: proceed to creation.

### 2. Detect project context

Before creating the structure, gather:
- **Project name**: from `package.json` name field, `Cargo.toml` name, folder name, or ask the user
- **Tech stack**: scan for `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, etc.
- **Existing docs**: check for `README.md`, `docs/`, `CHANGELOG.md`
- **Git status**: is this a git repo? What branch?

### 3. Create the structure

```
.whytcard/
├── index.md              ← Project summary, auto-updated by every command
├── brainstorms/          ← All brainstorm outputs
├── plans/                ← All plan outputs
├── logs/                 ← Execution logs
├── reviews/              ← Review outputs
├── research/             ← Research findings (reusable across sessions)
└── context/              ← Session summaries, decision log
```

### 4. Generate index.md

Write the initial index file:

```markdown
# {Project Name} — WhytCard Knowledge Base

**Created**: {YYYY-MM-DD HH:mm}
**Stack**: {detected stack, comma-separated}
**Status**: initialized

---

## Quick Reference

| Category | Count | Latest |
|---|---|---|
| Brainstorms | 0 | — |
| Plans | 0 | — |
| Executions | 0 | — |
| Reviews | 0 | — |
| Research | 0 | — |

## Decision Log

| Date | Decision | Context | Source |
|---|---|---|---|
| {today} | Initialized .whytcard/ knowledge base | Project setup | /wc-setup |

## Active Plan

None yet. Run `/brainstorm` then `/plan` to get started.

## Notes

{Any relevant context about the project detected during setup.}
```

### 5. Add .whytcard/ to .gitignore (ask first)

Check if `.gitignore` exists:
- If yes: ask the user if they want to add `.whytcard/` to it (some teams want to share knowledge, others don't)
- If no: create one with `.whytcard/` in it, or skip if the user prefers to track it

### 6. Report

Tell the user what was created and how to use it:
- "`.whytcard/` initialized with {N} directories"
- "Next: run `/brainstorm` to start exploring an idea, or `/plan` if you already know what to build"
- "Every command will auto-read and auto-update `.whytcard/index.md`"

## Rules

1. **Never overwrite existing files** in `.whytcard/` unless the user explicitly asks for a reset.
2. **Always update `index.md`** when creating or modifying any file in `.whytcard/`.
3. **Project detection is best-effort.** If detection fails, ask the user rather than guessing.
4. **The structure is minimal.** Subdirectories are created on first use, not upfront. Only create what's needed now.
5. **Interactive**: Use the AskQuestion tool to let the user choose options (gitignore, project name if ambiguous, reset vs continue).
