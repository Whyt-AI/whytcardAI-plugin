---
name: wc-1_setup
description: Initializes the .whytcard/ knowledge base directory in the current project. First step of the numbered WhytCard pipeline.
---

# Setup Protocol (Step 1)

You are initializing the WhytCard project knowledge base. This is the local, structured directory that all other steps (`/wc-2_brainstorm`, `/wc-3_plan`, `/wc-4_execute`, `/wc-5_review`, `/wc-Whytcard_orchestrator`) read from and write to.

## What .whytcard/ is

A project-level knowledge base that:
- Stores brainstorms, plans, research, execution logs, reviews
- Tracks context and decisions across sessions
- Maintains a project index summarizing current state

## Steps

### 1) Detect existing structure

Check if `.whytcard/` already exists in the project root.

- If it exists: read `.whytcard/index.md` and report current state. If something looks inconsistent, propose a fix (do not delete anything unless the user explicitly asks for a reset).
- If it does not exist: proceed to creation.

### 1b) Decide storage mode (LOCAL vs GLOBAL)

Goal: the user should not have to repeat setup across projects/sessions.

If this is the first WhytCard setup on this machine, ask the user ONCE:
- **GLOBAL** (recommended): store project knowledge outside repos (no clutter)
- **LOCAL**: store `.whytcard/` inside each repo (current behavior)

If the user doesn't care, default to **GLOBAL**.

If GLOBAL, also ask where the global root should live (default: `~/.whytcard`).

Persist the choice in a global config file so future projects are auto-configured by the SessionStart onboarding:
- `~/.whytcard/config.json` (the default global root path currently read by SessionStart)

### 1c) GLOBAL mode project layout (if chosen)

For a project, create:
`{globalRoot}/projects/{projectSlug}-{projectId}/`
- `docs/brainstorms/`
- `docs/plans/`
- `docs/research/`
- `docs/logs/`
- `docs/reviews/`
- `docs/stacks/`
- `instructions/`
- `meta.json` (repo path, projectId, createdAt, detected stack)

Then attach the repo to this global directory:
- Prefer symlink: `.whytcard -> {globalProjectDir}`
- If symlink fails: fall back to LOCAL `.whytcard/` to keep the plugin functional.

### 2) Detect project context (best effort)

Gather:
- **Project name**: from `package.json` name field, `Cargo.toml` name, folder name
- **Tech stack**: scan for `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, etc.
- **Existing docs**: `README.md`, `docs/`, `CHANGELOG.md`
- **Git state**: repo? current branch? clean/dirty?

### 3) Create the structure

```
.whytcard/
├── index.md              ← Project summary, auto-updated by every command
├── brainstorms/          ← Brainstorm outputs
├── plans/                ← Plans
├── logs/                 ← Execution logs
├── reviews/              ← Review outputs
├── research/             ← Research findings
└── context/              ← Session summaries + decision log
```

Create subdirectories on first use (minimal upfront creation is fine), but ensure `index.md` is created now (in the chosen KB location).

### 4) Generate `.whytcard/index.md`

Write an initial index file:

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
| {today} | Initialized .whytcard/ knowledge base | Project setup | /wc-1_setup |

## Active Plan

None yet. Run `/wc-2_brainstorm` then `/wc-3_plan` to get started.
```

### 5) `.gitignore` (ask first)

Check if `.gitignore` exists:
- If yes: ask the user if they want to add `.whytcard/` to it (some teams want to share it)
- If no: propose creating one with `.whytcard/` in it, or skipping

### 6) Report

Tell the user what was created and what the next step is.

## Rules

1. Never overwrite existing `.whytcard/` files unless the user explicitly asks for a reset.
2. Always update `.whytcard/index.md` when creating/modifying `.whytcard/` files.
3. If project detection fails, ask rather than guessing.

