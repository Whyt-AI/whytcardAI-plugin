---
name: setup
description: Initialize the .whytcard/ knowledge base in the current project
---

# /wc-setup

Initialize the `.whytcard/` project knowledge base.

## Instructions

1. Read the `wc-setup` skill (SKILL.md) and follow its protocol exactly.
2. Detect the project context (name, stack, existing docs, git state).
3. Create the `.whytcard/` directory structure.
4. Generate the initial `index.md` with detected project info.
5. Ask the user about `.gitignore` preferences.
6. Report what was created and suggest next steps.

## When to use

- First time working on a project with WhytCard AI
- When `.whytcard/` doesn't exist yet
- Other commands (`/brainstorm`, `/plan`, `/execute`, `/review`) will auto-run this if `.whytcard/` is missing
