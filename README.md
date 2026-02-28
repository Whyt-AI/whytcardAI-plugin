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
- **Brainstorms like a co-founder** — challenges ideas, researches live, documents everything in a structured file

## Platform Support

| Feature | Cursor | Claude Code |
|---|---|---|
| Core principles (constitution) | Rules (.mdc) + SessionStart hook | SessionStart hook |
| Visual verification reminders | Auto-attached rule + PreToolUse/PostToolUse hooks | PreToolUse/PostToolUse hooks |
| Research-first enforcement | Agent-decided rule + prompt dispatch hook | Prompt dispatch hook |
| Version check reminders | Auto-attached rule + PreToolUse hook | PreToolUse hook |
| Brainstorming sessions | Skill + rule + slash command + dispatch | Skill + dispatch |
| Quality gate | Slash command + agent | Agent |
| Stop verification | Stop hook (prompt) | Stop hook (prompt) |
| Slash commands | /brainstorm, /quality-gate, /research, /verify-visual | /brainstorm, /quality-gate, /research, /verify-visual |

## Structure

```
whytcardAI-plugin/
├── install.js                   ← Global installer (node install.js)
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
│   ├── constitution.mdc         ← Always-apply: core principles
│   ├── visual-verify.mdc        ← Auto-attached on visual files
│   ├── research-first.mdc       ← Agent-decided: research protocol
│   ├── version-check.mdc        ← Auto-attached on dependency files
│   ├── brainstorm.mdc           ← Agent-decided: brainstorming protocol
│   └── execution-tracking.mdc   ← Auto-attached on plan/log files
├── skills/
│   ├── wc-brainstorm/SKILL.md   ← Structured brainstorming with live research
│   ├── wc-plan/SKILL.md         ← A-Z planning with visual HTML templates
│   ├── wc-execute/SKILL.md      ← Increment-by-increment execution
│   ├── wc-review/SKILL.md       ← 8-pass final quality gate
│   ├── wc-dispatch/SKILL.md     ← Smart task router
│   ├── wc-visual-verify/SKILL.md ← Visual verification protocol
│   ├── wc-research-first/SKILL.md ← Research methodology
│   └── wc-version-check/SKILL.md ← Package version verification
├── commands/
│   ├── brainstorm.md            ← /brainstorm slash command
│   ├── plan.md                  ← /plan slash command
│   ├── execute.md               ← /execute slash command
│   ├── review.md                ← /review slash command
│   ├── quality-gate.md          ← /quality-gate slash command
│   ├── research.md              ← /research slash command
│   └── verify-visual.md         ← /verify-visual slash command
├── agents/
│   └── wc-quality-gate/AGENT.md ← Final quality gate agent
└── tests/
    └── test-hooks.js            ← Automated tests
```

## Installation

### Global install (recommended)

Installs rules, skills, and hooks into `~/.cursor/` so they apply across **all projects**:

```bash
node install.js
```

The installer is interactive — it shows what will be installed and asks for confirmation. Flags:

| Flag | Effect |
|---|---|
| `--force` | Skip confirmation prompt |
| `--status` | Show what's currently installed |
| `--uninstall` | Remove all globally installed components |

After install, restart Cursor and enable **Third-party skills** in Cursor Settings > Features.

### What gets installed

```
~/.cursor/
├── rules/
│   ├── wc-constitution.mdc      (always active)
│   ├── wc-visual-verify.mdc     (auto: .tsx, .css, .html, ...)
│   ├── wc-research-first.mdc    (agent-decided)
│   ├── wc-version-check.mdc     (auto: package.json, Cargo.toml, ...)
│   ├── wc-brainstorm.mdc        (agent-decided)
│   └── wc-execution-tracking.mdc (auto: wc-plan-*.md, wc-execution-log-*.md)
├── skills-cursor/
│   ├── wc-dispatch/SKILL.md
│   ├── wc-visual-verify/SKILL.md
│   ├── wc-research-first/SKILL.md
│   ├── wc-version-check/SKILL.md
│   ├── wc-brainstorm/SKILL.md
│   ├── wc-plan/SKILL.md
│   ├── wc-execute/SKILL.md
│   └── wc-review/SKILL.md
├── plugins/whytcardAI-plugin/
│   ├── constitution.md
│   └── hooks/                    (hook scripts + shared lib)
└── hooks.json                    (merged with existing hooks)
```

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

### Per-project install (alternative)

Clone into a project — Cursor discovers it via `.cursor-plugin/plugin.json`:

```bash
git clone https://github.com/Whyt-AI/whytcardAI-plugin.git
```

### Uninstall

```bash
node install.js --uninstall
```

Cleanly removes all WhytCard components from `~/.cursor/`. If other hooks exist in `hooks.json`, only WhytCard entries are removed.

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
- Both: `wc-prompt-dispatch` hook analyzes keywords and injects dispatch hints (UI, research, packages, bugs, deploy, brainstorming, etc.)

### During edits
- **Cursor**: Auto-attached rules fire when editing visual files or dependency files, injecting the right protocol directly.
- **Both**: PreToolUse hook reminds before edits. PostToolUse hook reinforces after visual file edits.

### During brainstorming
- Trigger: `/brainstorm`, or keywords like "brainstorm", "what if", "should we use", "let's think through"
- Agent challenges assumptions, researches live during the session, generates 3+ approaches
- Outputs a `wc-brainstorm-{subject}-{date}-{time}.md` with full session documentation
- File includes: question, constraints, research findings, approaches, rejections, decision, next steps, sources

### Before stopping
- Both: Stop hook verifies visual checks, version checks, and research were completed.

## The Pipeline

The full project lifecycle, from idea to ship:

```
/brainstorm  →  explore, challenge, research live  →  wc-brainstorm-{subject}-{date}.md
     ↓
/plan        →  architect A-Z, visual HTML templates  →  wc-plan-{project}-{date}.md
     ↓
/execute     →  build increment by increment, verify  →  wc-execution-log-{project}-{date}.md
     ↓
/review      →  8-pass quality gate, ship or iterate  →  wc-review-{project}-{date}.md
```

Each stage feeds the next. Hooks maintain discipline throughout. Files are the context — not memory.

## Slash Commands

| Command | What it does |
|---|---|
| `/brainstorm` | Structured brainstorming: challenge, research live, 3+ approaches, documented output |
| `/plan` | A-Z implementation plan from brainstorm: architecture, visual templates, increments |
| `/execute` | Build the project from the plan, increment by increment, with verification |
| `/review` | Final 8-pass quality gate: code, visual, a11y, i18n, perf, security, tests |
| `/quality-gate` | Lightweight quality check on current work (outside the pipeline) |
| `/research` | Standalone dual-angle research on any topic |
| `/verify-visual` | Standalone visual verification at 3 viewports |

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
