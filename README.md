# whytcardAI-plugin

Claude Code plugin that enforces WhytCard's development philosophy: research-first, proof-driven, UX-obsessed, anti-hallucination.

## What it does

This plugin turns Claude Code from a code assistant into a disciplined co-founder CTO that:

- **Never supposes** — researches before opining, proves before claiming
- **Dispatches the right tools** — automatically routes tasks to the best plugin/skill/MCP
- **Verifies visually** — reminds about Playwright screenshots after every UI change
- **Checks versions live** — never trusts training data for package versions
- **Thinks UX-first** — evaluates every decision from the user's perspective
- **Researches both sides** — good AND bad, with named examples and real data

## Structure

```
whytcardAI-plugin/
├── .claude-plugin/
│   └── plugin.json              ← Plugin manifest
├── constitution.md              ← Core principles + dispatch table
├── hooks/
│   ├── hooks.json               ← Hook event configuration
│   ├── wc-session-start.js      ← Injects constitution at conversation start
│   ├── wc-prompt-dispatch.js    ← Proactive dispatch based on user prompt keywords
│   ├── wc-pre-edit-gate.js      ← Reminds about verification before edits
│   └── wc-post-edit-verify.js   ← Reinforces verification after visual file edits
├── skills/
│   ├── wc-dispatch/SKILL.md    ← Smart task router
│   ├── wc-visual-verify/SKILL.md ← Visual verification protocol
│   ├── wc-research-first/SKILL.md ← Research methodology
│   └── wc-version-check/SKILL.md ← Package version verification
├── agents/
│   └── wc-quality-gate/AGENT.md ← Final quality gate
└── tests/
    └── test-hooks.js            ← Automated tests (32 tests)
```

## Installation

### As a Claude Code plugin (recommended)

```bash
claude plugin add /path/to/whytcardAI-plugin
```

Or add to `~/.claude/settings.json`:
```json
{
  "enabledPlugins": {
    "whytcardAI-plugin@local": true
  }
}
```

### Manual (copy files)

1. Copy `constitution.md` content into your project's `CLAUDE.md`
2. Copy hooks to `~/.claude/hooks/`
3. Copy skills to `~/.claude/skills/`

## Configuration

Create an optional `wc-config.json` in your project root to customize behavior:

```json
{
  "visualVerification": true,
  "viewports": [375, 768, 1440],
  "darkModeCheck": true,
  "researchFirst": true,
  "versionCheck": true
}
```

All options default to `true`. Set to `false` to disable specific checks (e.g., `"visualVerification": false` for backend-only projects).

## How it works

### Session Start
`wc-session-start.js` runs at every conversation start. It:
1. Loads core principles from `constitution.md` (optimized — dispatch table loaded on-demand)
2. Detects the project's tech stack from `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, etc.
3. Scans one level of subdirectories for monorepo detection
4. Reads optional `wc-config.json` for per-project settings
5. Injects context via `hookSpecificOutput.additionalContext`

### User Prompt Analysis
`wc-prompt-dispatch.js` runs on every user message. It:
1. Scans for keywords (UI, research, bug, install, deploy, review, etc.)
2. Injects dispatch hints so Claude invokes the right skills proactively

### During Work
- `wc-pre-edit-gate.js` (PreToolUse) reminds about visual verification before UI file edits
- `wc-post-edit-verify.js` (PostToolUse) reinforces verification after visual file edits
- Both hooks detect visual files: `.tsx`, `.jsx`, `.vue`, `.svelte`, `.astro`, `.css`, `.scss`, `.sass`, `.less`, `.module.css`, `.module.scss`, `.html`
- Skills are available for explicit invocation: `wc-dispatch`, `wc-visual-verify`, `wc-research-first`, `wc-version-check`

### Before Stopping
- A **prompt-based Stop hook** verifies visual checks, version checks, and research were done
- Includes infinite loop protection via `stop_hook_active` flag
- The `wc-quality-gate` agent can be invoked for comprehensive final verification

## Works with these plugins

The dispatch table routes to skills from these plugins (install them separately). **If a plugin is not installed, fallback actions are defined for every dispatch rule.**

| Plugin | Used for |
|---|---|
| `superpowers` | Brainstorming, debugging, planning, git workflows |
| `compound-engineering` | Multi-agent reviews, deep analysis |
| `frontend-design` | Design-quality UI development |
| `code-review` | Code review workflows |
| `feature-dev` | Feature development with architecture understanding |
| `stripe` | Payment integration best practices |
| `vercel` | Deployment workflows |
| `firecrawl` | Web scraping and content extraction |
| `playwright` | Browser automation and screenshots |
| `context7` | Library documentation lookup |
| `huggingface-skills` | ML operations |

## Testing

```bash
node tests/test-hooks.js
```

Runs 32 automated tests covering all hook output formats, file extension detection, keyword dispatch, edge cases, and protocol compliance.

## Philosophy

This plugin encodes a development philosophy, not a rigid process:

1. Research before opinions
2. Evidence before claims
3. Visual proof before "done"
4. User perspective before developer convenience
5. Latest and best, always verified
6. Dense communication, no filler
7. Problems are precise, never vague
