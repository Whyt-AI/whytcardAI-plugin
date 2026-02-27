# whytcardAI-plugin

AI coding plugin that enforces research-first, proof-driven, UX-obsessed development. Works on **both Cursor and Claude Code**.

## What it does

Turns your AI coding assistant into a disciplined co-founder CTO that:

- **Never supposes** — researches before opining, proves before claiming
- **Dispatches the right tools** — automatically routes tasks to the best skill/tool
- **Verifies visually** — enforces screenshot verification after every UI change
- **Checks versions live** — never trusts training data for package versions
- **Thinks UX-first** — evaluates every decision from the user's perspective
- **Researches both sides** — good AND bad, with named examples and real data

## Platform Support

| Feature | Cursor | Claude Code |
|---|---|---|
| Core principles (constitution) | Rules (.mdc) + SessionStart hook | SessionStart hook |
| Visual verification reminders | Auto-attached rule + PreToolUse/PostToolUse hooks | PreToolUse/PostToolUse hooks |
| Research-first enforcement | Agent-decided rule + prompt dispatch hook | Prompt dispatch hook |
| Version check reminders | Auto-attached rule + PreToolUse hook | PreToolUse hook |
| Quality gate | Slash command + agent | Agent |
| Stop verification | Stop hook (prompt) | Stop hook (prompt) |
| Slash commands | /quality-gate, /research, /verify-visual | /quality-gate, /research, /verify-visual |

## Structure

```
whytcardAI-plugin/
├── .claude-plugin/
│   └── plugin.json              ← Claude Code manifest
├── .cursor-plugin/
│   └── plugin.json              ← Cursor manifest
├── .cursor/
│   └── hooks.json               ← Cursor-native hook config
├── constitution.md              ← Core principles + dispatch table
├── hooks/
│   ├── hooks.json               ← Claude Code hook config
│   ├── lib/output.js            ← Shared platform-agnostic utilities
│   ├── wc-session-start.js      ← Injects constitution at session start
│   ├── wc-prompt-dispatch.js    ← Proactive dispatch on user prompt
│   ├── wc-pre-edit-gate.js      ← Reminders before file edits
│   └── wc-post-edit-verify.js   ← Reinforcement after visual file edits
├── rules/
│   ├── constitution.mdc         ← Always-apply: core principles (Cursor)
│   ├── visual-verify.mdc        ← Auto-attached on visual files (Cursor)
│   ├── research-first.mdc       ← Agent-decided: research protocol (Cursor)
│   └── version-check.mdc        ← Auto-attached on dependency files (Cursor)
├── skills/
│   ├── wc-dispatch/SKILL.md     ← Smart task router
│   ├── wc-visual-verify/SKILL.md ← Visual verification protocol
│   ├── wc-research-first/SKILL.md ← Research methodology
│   └── wc-version-check/SKILL.md ← Package version verification
├── commands/
│   ├── quality-gate.md          ← /quality-gate slash command
│   ├── research.md              ← /research slash command
│   └── verify-visual.md         ← /verify-visual slash command
├── agents/
│   └── wc-quality-gate/AGENT.md ← Final quality gate agent
└── tests/
    └── test-hooks.js            ← Automated tests
```

## Installation

### Cursor (recommended for Cursor users)

Install from the Cursor Marketplace (when published), or manually:

1. Clone this repo into your project or globally:
   ```bash
   git clone https://github.com/Whyt-AI/whytcardAI-plugin.git
   ```
2. Cursor automatically discovers plugins via `.cursor-plugin/plugin.json`
3. Enable "Third-party skills" in Cursor Settings → Features if using hooks

### Claude Code

```bash
claude plugin add /path/to/whytcardAI-plugin
```

Or add to `~/.claude/settings.json`:
```json
{
  "enabledPlugins": {
    "whytcard-ai@local": true
  }
}
```

### Manual (any platform)

1. Copy `constitution.md` into your project's root (or AGENTS.md / CLAUDE.md)
2. Copy `rules/` directory to `.cursor/rules/` (Cursor) or use as reference
3. Copy `hooks/` and configure in your platform's hooks config
4. Copy `skills/` to your platform's skills directory

## Configuration

Create an optional `wc-config.json` in your project root:

```json
{
  "visualVerification": true,
  "viewports": [375, 768, 1440],
  "darkModeCheck": true,
  "researchFirst": true,
  "versionCheck": true
}
```

All options default to `true`. Set `false` to disable specific checks.

## How it works

### On session start
- **Cursor**: Constitution rule auto-applies. SessionStart hook injects stack detection + config.
- **Claude Code**: SessionStart hook injects core principles + stack detection + config.

### On user prompt
- Both: `wc-prompt-dispatch` hook analyzes keywords and injects dispatch hints (UI, research, packages, bugs, deploy, etc.)

### During edits
- **Cursor**: Auto-attached rules fire when editing visual files or dependency files, injecting the right protocol directly.
- **Both**: PreToolUse hook reminds before edits. PostToolUse hook reinforces after visual file edits.

### Before stopping
- Both: Stop hook verifies visual checks, version checks, and research were completed.

## Slash Commands

| Command | What it does |
|---|---|
| `/quality-gate` | Run comprehensive quality verification on current work |
| `/research` | Perform dual-angle research on a topic |
| `/verify-visual` | Take and evaluate screenshots at 3 viewports |

## Testing

```bash
node tests/test-hooks.js
```

## Philosophy

1. Research before opinions
2. Evidence before claims
3. Visual proof before "done"
4. User perspective before developer convenience
5. Latest and best, always verified
6. Dense communication, no filler
7. Problems are precise, never vague
