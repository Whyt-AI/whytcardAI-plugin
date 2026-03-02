# whytcardAI-plugin v3

WhytCard v3 is a minimal, layered plugin built on:

1. `AGENTS.md` (principle-based always-on instruction)
2. Two hooks (`session-init`, `post-edit-check`) for deterministic guardrails

## Structure

```
whytcardAI-plugin/
├── AGENTS.md
├── CLAUDE.md
├── .cursor/hooks.json
├── .claude/settings.json
├── hooks/
│   ├── lib/output.js
│   ├── lib/whytcard-kb.js
│   ├── session-init.js
│   └── post-edit-check.js
├── .github/
│   ├── copilot-instructions.md
│   └── agents/whytcard-ai.agent.md
├── setup.sh
├── setup.ps1
└── tests/test-hooks.js
```

## Usage

### Any AI tool (base mode)
Copy `AGENTS.md` to your project root.

### Cursor hooks
Copy `.cursor/hooks.json` and `hooks/` into your project.

### Claude Code hooks
Copy `.claude/settings.json` and `hooks/` into your project.

### Optional global linking

```bash
./setup.sh
```

On Windows (PowerShell):

```powershell
./setup.ps1
```

## Tests

```bash
node tests/test-hooks.js
```
