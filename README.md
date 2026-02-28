# whytcardAI-plugin

AI coding plugin that enforces research-first, proof-driven, UX-obsessed development. Works on **Cursor**, **Claude Code**, and **GitHub Copilot**.

## What it does

Turns your AI coding assistant into a disciplined co-founder CTO that:

- **Never supposes** — researches before opining, proves before claiming
- **Dispatches the right tools** — automatically routes tasks to the best skill/tool
- **Verifies visually** — enforces screenshot verification after every UI change
- **Checks versions live** — never trusts training data for package versions
- **Thinks UX-first** — evaluates every decision from the user's perspective
- **Researches both sides** — good AND bad, with named examples and real data
- **Brainstorms like a co-founder** — challenges ideas, researches live, documents everything
- **Maintains a project knowledge base** — `.whytcard/` stores all context across sessions
- **Auto-onboards on new repos** — detects missing knowledge base and guides one-time configuration (global vs local)

## The Pipeline

### Cursor (minimal command set)

**One command (recommended):**

```
/wc-Whytcard_orchestrator → setup → brainstorm → plan → execute → review
```

**Or step-by-step:**

```
/wc-1_setup
     ↓
/wc-2_brainstorm →  .whytcard/brainstorms/
     ↓
/wc-3_plan       →  .whytcard/plans/
     ↓
/wc-4_execute    →  .whytcard/logs/
     ↓
/wc-5_review     →  .whytcard/reviews/
```

### Claude Code (slash command docs)

```
/setup      →  initialize .whytcard/ knowledge base
     ↓
/brainstorm →  explore, challenge, research live  →  .whytcard/brainstorms/
     ↓
/plan       →  architect A-Z, visual templates    →  .whytcard/plans/
     ↓
/execute    →  build increment by increment       →  .whytcard/logs/
     ↓
/review     →  8-pass quality gate, ship or fix   →  .whytcard/reviews/
```

Each stage feeds the next. All output lives in `.whytcard/`. Files are the context — not memory.

## Platform Support

| Feature | Cursor | Claude Code | GitHub Copilot |
|---|---|---|---|
| Core principles (constitution) | Rules (.mdc) + SessionStart hook | SessionStart hook | .github/agents + copilot-instructions |
| Visual verification reminders | Auto-attached rule + hooks | Hooks | Agent instructions |
| Research-first enforcement | Agent-decided rule + dispatch hook | Dispatch hook | Agent instructions |
| Version check reminders | Auto-attached rule + hooks | Hooks | Agent instructions |
| Pipeline (/brainstorm → /review) | Skills + commands + dispatch | Skills + dispatch | Agent-based |
| Project knowledge base (.whytcard/) | All commands | All commands | Agent reads/writes |

## Structure

```
whytcardAI-plugin/
├── install.js                    ← Global installer (node install.js)
├── .github/
│   ├── agents/
│   │   └── whytcard-ai.agent.md  ← GitHub Copilot agent
│   └── copilot-instructions.md   ← Copilot repo-level instructions
├── .claude-plugin/
│   └── plugin.json               ← Claude Code manifest
├── .cursor-plugin/
│   └── plugin.json               ← Cursor manifest
├── .cursor/
│   └── hooks.json                ← Cursor-native hook config
├── constitution.md               ← Core principles + dispatch table
├── hooks/
│   ├── hooks.json                ← Claude Code hook config
│   ├── lib/output.js             ← Shared platform-agnostic utilities
│   ├── wc-session-start.js       ← Injects constitution at session start
│   ├── wc-prompt-dispatch.js     ← Proactive dispatch on user prompt
│   ├── wc-pre-edit-gate.js       ← Reminders before file edits
│   └── wc-post-edit-verify.js    ← Reinforcement after visual file edits
├── rules/
│   ├── constitution.mdc          ← Always-apply: core principles
│   ├── visual-verify.mdc         ← Auto-attached on visual files
│   ├── research-first.mdc        ← Agent-decided: research protocol
│   ├── version-check.mdc         ← Auto-attached on dependency files
│   ├── brainstorm.mdc            ← Agent-decided: brainstorming protocol
│   └── execution-tracking.mdc    ← Auto-attached on .whytcard/ plan/log files
├── skills/
│   ├── wc-Whytcard_orchestrator/SKILL.md ← End-to-end orchestrator (Cursor)
│   ├── wc-1_setup/SKILL.md        ← Step 1: initialize .whytcard/ (Cursor)
│   ├── wc-2_brainstorm/SKILL.md   ← Step 2: structured brainstorm (Cursor)
│   ├── wc-3_plan/SKILL.md         ← Step 3: implementation plan (Cursor)
│   ├── wc-4_execute/SKILL.md      ← Step 4: build from plan (Cursor)
│   ├── wc-5_review/SKILL.md       ← Step 5: final quality gate (Cursor)
│   ├── wc-setup/SKILL.md         ← Initialize .whytcard/ knowledge base
│   ├── wc-brainstorm/SKILL.md    ← Structured brainstorming with live research
│   ├── wc-plan/SKILL.md          ← A-Z planning with visual HTML templates
│   ├── wc-execute/SKILL.md       ← Increment-by-increment execution
│   ├── wc-review/SKILL.md        ← 8-pass final quality gate
│   ├── wc-dispatch/SKILL.md      ← Smart task router
│   ├── wc-visual-verify/SKILL.md ← Visual verification protocol
│   ├── wc-research-first/SKILL.md ← Research methodology
│   └── wc-version-check/SKILL.md ← Package version verification
├── commands/
│   ├── setup.md                  ← /setup slash command
│   ├── brainstorm.md             ← /brainstorm slash command
│   ├── plan.md                   ← /plan slash command
│   ├── execute.md                ← /execute slash command
│   ├── review.md                 ← /review slash command
│   ├── quality-gate.md           ← /quality-gate slash command
│   ├── research.md               ← /research slash command
│   └── verify-visual.md          ← /verify-visual slash command
├── agents/
│   └── wc-quality-gate/AGENT.md  ← Final quality gate agent
└── tests/
    └── test-hooks.js             ← Automated tests
```

## .whytcard/ — Project Knowledge Base

Every project gets a `.whytcard/` directory that stores all context:

```
.whytcard/
├── index.md       ← Project summary, auto-updated by every command
├── brainstorms/   ← All brainstorm outputs
├── plans/         ← All plan outputs + visual templates
├── logs/          ← Execution logs
├── reviews/       ← Review outputs
├── research/      ← Research findings (reusable across sessions)
└── context/       ← Session summaries, decision log
```

**Setup-friendly behavior (no commands):** on first chat in a repo with no `.whytcard/`, WhytCard auto-onboards and asks **once**:
- KB mode: **GLOBAL** (recommended) or **LOCAL**
- If GLOBAL: where the global root should live (default: `~/.whytcard`)

Then it creates the structure and (in GLOBAL mode) links the repo with a directory link:
`.whytcard -> {globalRoot}/projects/{projectSlug}-{projectId}/docs`

You can still run `/wc-1_setup` (Cursor) or `/setup` (Claude Code) manually, but it should not be required.

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
| `--advanced` | Also install optional + legacy skills (more commands) |
| `--uninstall` | Remove all globally installed components |

After install, restart Cursor and enable **Third-party skills** in Cursor Settings > Features.

### GitHub Copilot

Copy `.github/agents/whytcard-ai.agent.md` and `.github/copilot-instructions.md` to your repository. The agent will be available in Copilot, and the instructions will apply to all Copilot interactions in the repo.

### Claude Code

```bash
claude plugin add /path/to/whytcardAI-plugin
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

## Configuration

Create an optional `wc-config.json` in your project root:

```json
{
  "visualVerification": true,
  "viewports": [375, 768, 1440],
  "darkModeCheck": true,
  "researchFirst": true,
  "versionCheck": true,

  "autoSetup": true,
  "kbMode": null,
  "globalRoot": null
}
```

All options default to `true`. Set `false` to disable specific checks.

KB options:
- `autoSetup`: auto-initialize `.whytcard/` when missing (recommended)
- `kbMode`: `"global"` or `"local"` to override machine default for this repo
- `globalRoot`: override the GLOBAL KB root path for this repo

## Slash Commands

### Cursor (skills)

| Command | What it does |
|---|---|
| `/wc-Whytcard_orchestrator` | Runs the full pipeline end-to-end with minimal/no user intervention |
| `/wc-1_setup` | Initialize `.whytcard/` knowledge base in the project |
| `/wc-2_brainstorm` | Structured brainstorming: challenge, research live, 3+ approaches, documented output |
| `/wc-3_plan` | A-Z implementation plan from brainstorm: architecture, visual templates, increments |
| `/wc-4_execute` | Build the project from the plan, increment by increment, with verification |
| `/wc-5_review` | Final 8-pass quality gate: code, visual, a11y, i18n, perf, security, tests |

### Claude Code (command docs)

| Command | What it does |
|---|---|
| `/setup` | Initialize `.whytcard/` knowledge base in the project |
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
8. Files are context, memory is unreliable
